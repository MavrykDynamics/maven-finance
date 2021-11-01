// prettier-ignore
import { useAccountPkh, useOnBlock, useReady, useTezos, useWallet } from "dapp/dapp";
import doormanAddress from 'deployments/doormanAddress'
import mvkTokenAddress from 'deployments/mvkTokenAddress'
import vMvkTokenAddress from 'deployments/vMvkTokenAddress'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { Message, Page } from 'styles'

import { StakeView } from './Stake.view'
import { StakeHeader } from './StakeHeader/StakeHeader.controller'
import { StakeUnstake } from './StakeUnstake/StakeUnstake.controller'

export type StakeCallback = {
  amount: number
}

type StakeProps = {
  setTransactionPending: (b: boolean) => void
  transactionPending: boolean
}

export const Stake = ({ setTransactionPending, transactionPending }: StakeProps) => {
  const wallet = useWallet()
  const ready = useReady()
  const tezos = useTezos()
  const accountPkh = useAccountPkh()

  const [mvkTokenContract, setMvkTokenContract] = useState(undefined)
  const [myMvkBalance, setMyMvkBalance] = useState(0)

  const [vMvkTokenContract, setVMvkTokenContract] = useState(undefined)
  const [myVMvkBalance, setMyVMvkBalance] = useState(0)

  const [doormanContract, setDoormanContract] = useState(undefined)

  const [loading, setLoading] = useState(false)

  const loadStorages = React.useCallback(async () => {
    setLoading(true)
    if (mvkTokenContract) {
      const mvkTokenStorage = await (mvkTokenContract as any).storage()
      const myMvkLedgerEntry = await mvkTokenStorage['ledger'].get(accountPkh)
      const myMvkBalanceMu = myMvkLedgerEntry?.balance.toNumber()
      const myMvkBalance = myMvkBalanceMu > 0 ? myMvkBalanceMu / 1000000 : 0
      console.log('MVK Storage:', mvkTokenStorage)
      console.log('MVK Ledger:', myMvkLedgerEntry)
      setMyMvkBalance(myMvkBalance)
    }
    if (vMvkTokenContract) {
      const vMvkTokenStorage = await (vMvkTokenContract as any).storage()
      const myVMvkLedgerEntry = await vMvkTokenStorage['ledger'].get(accountPkh)
      const myVMvkBalanceMu = myVMvkLedgerEntry?.balance.toNumber()
      const myVMvkBalance = myVMvkBalanceMu > 0 ? myVMvkBalanceMu / 1000000 : 0
      setMyVMvkBalance(myVMvkBalance)
    }
    setLoading(false)
  }, [mvkTokenContract, vMvkTokenContract, accountPkh])

  useEffect(() => {
    loadStorages()
  }, [loadStorages, accountPkh])

  useEffect(() => {
    ;(async () => {
      if (tezos) {
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
    ({ amount }: StakeCallback) => {
      return (doormanContract as any).methods.stake(amount * 1000000).send()
    },
    [doormanContract],
  )

  const unStakeCallback = React.useCallback(
    ({ amount }: StakeCallback) => {
      return (doormanContract as any).methods.unstake(amount * 1000000).send()
    },
    [doormanContract],
  )

  return (
    <Page>
      <StakeHeader />
      <StakeUnstake
        myMvkBalance={myMvkBalance}
        myVMvkBalance={myVMvkBalance}
        stakeCallback={stakeCallback}
        unStakeCallback={unStakeCallback}
        setTransactionPending={setTransactionPending}
        transactionPending={transactionPending}
      />
      {wallet ? (
        <>
          {ready ? (
            <StakeView
              loading={loading}
              connectedUser={accountPkh as unknown as string}
              setTransactionPending={setTransactionPending}
              transactionPending={transactionPending}
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
