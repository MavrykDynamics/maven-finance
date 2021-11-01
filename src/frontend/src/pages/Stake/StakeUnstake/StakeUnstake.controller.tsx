import * as React from 'react'
import { useAlert } from 'react-alert'

import { StakeUnstakeView } from './StakeUnstake.view'

type StakeUnstakeProps = {
  myMvkBalance: number
  myVMvkBalance: number
  stakeCallback: (params: { amount: number }) => Promise<any>
  unStakeCallback: (params: { amount: number }) => Promise<any>
  setTransactionPending: (b: boolean) => void
  transactionPending: boolean
}

export const StakeUnstake = ({
  myMvkBalance,
  myVMvkBalance,
  stakeCallback,
  unStakeCallback,
  setTransactionPending,
  transactionPending,
}: StakeUnstakeProps) => {
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

  async function handleUnStake(amount: number) {
    if (transactionPending) {
      alert.info('Cannot vote on a tile while a transaction is pending...', { timeout: 10000 })
    } else {
      unStakeCallback({ amount })
        .then((e) => {
          setTransactionPending(true)
          alert.info('Unstaking...')
          e.confirmation().then((e: any) => {
            alert.success('Unstaking done', {
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

  return (
    <StakeUnstakeView
      myMvkBalance={myMvkBalance}
      myVMvkBalance={myVMvkBalance}
      handleStake={handleStake}
      handleUnStake={handleUnStake}
    />
  )
}
