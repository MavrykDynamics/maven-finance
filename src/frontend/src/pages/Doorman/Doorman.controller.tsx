// prettier-ignore
import { showToaster } from "app/App.components/Toaster/Toaster.actions";
import { ERROR } from 'app/App.components/Toaster/Toaster.constants'
import { useAccountPkh, useOnBlock, useReady, useTezos, useWallet } from 'dapp/dapp'
import doormanAddress from 'deployments/doormanAddress'
import mvkTokenAddress from 'deployments/mvkTokenAddress'
import vMvkTokenAddress from 'deployments/vMvkTokenAddress'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Message, Page } from 'styles'
import { ExitFeeModal } from './ExitFeeModal/ExitFeeModal.controller'

import { DoormanView } from './Doorman.view'
import { DoormanHeader } from './DoormanHeader/DoormanHeader.controller'
import { StakeUnstake } from './StakeUnstake/StakeUnstake.controller'

export type DoormanCallback = {
  amount: number
}

type DoormanProps = {
  loading: boolean
}

export const Doorman = ({ loading }: DoormanProps) => {
  const wallet = useWallet()
  const ready = useReady()
  const tezos = useTezos()
  const accountPkh = useAccountPkh()
  const dispatch = useDispatch()

  const [mvkTokenContract, setMvkTokenContract] = useState(undefined)
  const [myMvkBalance, setMyMvkBalance] = useState('0')

  const [vMvkTokenContract, setVMvkTokenContract] = useState(undefined)
  const [myVMvkBalance, setMyVMvkBalance] = useState('0')

  const [doormanContract, setDoormanContract] = useState(undefined)

  const loadStorages = React.useCallback(async () => {
    if (mvkTokenContract) {
      const mvkTokenStorage = await (mvkTokenContract as any).storage()
      const myMvkLedgerEntry = await mvkTokenStorage['ledger'].get(accountPkh)
      const myMvkBalanceMu = myMvkLedgerEntry?.balance.toNumber()
      const myMvkBalanceNew = myMvkBalanceMu > 0 ? myMvkBalanceMu / 1000000 : 0
      console.log('MVK Storage:', mvkTokenStorage)
      console.log('MVK Ledger:', myMvkLedgerEntry)
      setMyMvkBalance(myMvkBalanceNew?.toFixed(2))
    }
    if (vMvkTokenContract) {
      const vMvkTokenStorage = await (vMvkTokenContract as any).storage()
      const myVMvkLedgerEntry = await vMvkTokenStorage['ledger'].get(accountPkh)
      const myVMvkBalanceMu = myVMvkLedgerEntry?.balance.toNumber()
      const myVMvkBalanceNew = myVMvkBalanceMu > 0 ? myVMvkBalanceMu / 1000000 : 0
      setMyVMvkBalance(myVMvkBalanceNew?.toFixed(2))
    }
  }, [mvkTokenContract, vMvkTokenContract, accountPkh])

  useEffect(() => {
    loadStorages()
  }, [loadStorages, accountPkh])

  useEffect(() => {
    ;(async () => {
      if (tezos && tezos.wallet) {
        const mvkTokenContract = await (tezos as any).wallet.at(mvkTokenAddress)
        console.log('mvkTokenContract', mvkTokenContract)
        setMvkTokenContract(mvkTokenContract)
        const vMvkTokenContract = await (tezos as any).wallet.at(vMvkTokenAddress)
        console.log('vMvkTokenContract', vMvkTokenContract)
        setVMvkTokenContract(vMvkTokenContract)
        const doormanContract = await (tezos as any).wallet.at(doormanAddress)
        console.log('doormanContract', doormanContract)
        setDoormanContract(doormanContract)
      }
    })()
  }, [tezos])

  useOnBlock(tezos, loadStorages)

  const stakeCallback = React.useCallback(
    ({ amount }: DoormanCallback) => {
      if (!doormanContract) {
        dispatch(showToaster(ERROR, 'Please connect your wallet', 'Then try again'))
        return new Promise(() => {})
      }
      return (doormanContract as any).methods.stake(amount * 1000000).send()
    },
    [doormanContract, dispatch],
  )

  const unStakeCallback = React.useCallback(
    ({ amount }: DoormanCallback) => {
      if (!doormanContract) {
        dispatch(showToaster(ERROR, 'Please connect your wallet', 'Then try again'))
        return new Promise(() => {})
      }
      return (doormanContract as any).methods.unstake(amount * 1000000).send()
    },
    [doormanContract, dispatch],
  )

  return (
    <Page>
      <ExitFeeModal />
      <DoormanHeader />
      <StakeUnstake
        myMvkBalance={myMvkBalance}
        myVMvkBalance={myVMvkBalance}
        stakeCallback={stakeCallback}
        unStakeCallback={unStakeCallback}
        loading={loading}
      />
      {wallet ? (
        <>
          {ready ? (
            <DoormanView
              loading={loading}
              connectedUser={accountPkh as unknown as string}
              stakeCallback={stakeCallback}
            />
          ) : (
            <Message>Please connect your wallet</Message>
          )}
        </>
      ) : (
        <Message>Please install the Temple Wallet Chrome Extension.</Message>
      )}
    </Page>
  )
}
