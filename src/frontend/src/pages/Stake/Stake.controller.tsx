// prettier-ignore
import { useAccountPkh, useOnBlock, useReady, useTezos, useWallet } from "dapp/dapp";
import { ADMIN, MVK_TOKEN_ADDRESS } from 'dapp/defaults'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { Message, Page } from 'styles'
import { useAlert } from 'react-alert'

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
  const [contract, setContract] = useState(undefined)
  const [myMvkBalance, setMyMvkBalance] = useState(0)
  const [loading, setLoading] = useState(false)
  const alert = useAlert()

  const loadStorage = React.useCallback(async () => {
    setLoading(true)
    if (contract) {
      const storage = await (contract as any).storage()
      const myLedgerEntry = await storage['ledger'].get(accountPkh)
      const myMvkBalanceMu = myLedgerEntry?.balance.toNumber()
      const myMvkBalance = myMvkBalanceMu > 0 ? myMvkBalanceMu / 1000000 : 0
      setMyMvkBalance(myMvkBalance)
      setLoading(false)
    }
    setLoading(false)
  }, [contract, accountPkh])

  useEffect(() => {
    loadStorage()
  }, [loadStorage, accountPkh])

  useEffect(() => {
    ;(async () => {
      if (tezos) {
        const ctr = await (tezos as any).wallet.at(MVK_TOKEN_ADDRESS)
        setContract(ctr)
      }
    })()
  }, [tezos])

  useOnBlock(tezos, loadStorage)

  const stakeCallback = React.useCallback(
    ({ amount }: StakeCallback) => {
      return (contract as any).methods.stake(amount).send()
    },
    [contract],
  )

  return (
    <Page>
      <StakeHeader />
      <StakeUnstake myMvkBalance={myMvkBalance} />
      {wallet ? (
        <>
          {ready ? (
            <StakeView
              loading={loading}
              stakeCallback={stakeCallback}
              connectedUser={accountPkh as unknown as string}
              setTransactionPending={setTransactionPending}
              transactionPending={transactionPending}
              myMvkBalance={myMvkBalance}
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
