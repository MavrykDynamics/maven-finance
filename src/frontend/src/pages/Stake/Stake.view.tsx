import { useState } from 'react'
import { useAlert } from 'react-alert'

import { StakeCallback } from './Stake.controller'
// prettier-ignore
import { StakeStyled } from "./Stake.style";

type StakeViewProps = {
  loading: boolean
  stakeCallback: (stakeProps: StakeCallback) => Promise<any>
  setTransactionPending: (b: boolean) => void
  connectedUser: string
  transactionPending: boolean
}

export const StakeView = ({
  loading,
  stakeCallback,
  connectedUser,
  setTransactionPending,
  transactionPending,
}: StakeViewProps) => {
  const alert = useAlert()

  async function handleStake(amount: number) {
    if (transactionPending) {
      alert.info('Cannot vote on a tile while a transaction is pending...', { timeout: 10000 })
    } else {
      stakeCallback({ amount })
        .then((e) => {
          setTransactionPending(true)
          alert.info('Staking...')
          e.confirmation().then((e: any) => {
            alert.success('Staking done', {
              onOpen: () => {
                setTransactionPending(false)
              },
            })
            return e
          })
          return e
        })
        .catch((e: any) => {
          alert.show(e.message)
          console.error(e)
        })
    }
  }

  return <StakeStyled>Connected</StakeStyled>
}
