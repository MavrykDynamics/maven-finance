import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import * as React from 'react'
import { useDispatch } from 'react-redux'
import { stakeAnim } from '../Stake.actions'

import { StakeUnstakeView } from './StakeUnstake.view'

type StakeUnstakeProps = {
  myMvkBalance?: string
  myVMvkBalance?: string
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
  const dispatch = useDispatch()

  async function handleStake(amount: number) {
    if (transactionPending) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    } else {
      stakeCallback({ amount })
        .then((e) => {
          setTransactionPending(true)
          dispatch(showToaster(INFO, 'Staking...', 'Please wait 30s'))
          dispatch(stakeAnim())
          e.confirmation().then((e: any) => {
            dispatch(showToaster(SUCCESS, 'Staking done', 'All good :)'))
            setTransactionPending(false)
            return e
          })
          return e
        })
        .catch((e: any) => {
          dispatch(showToaster(ERROR, 'Error', e.message))
          console.error(e)
        })
    }
  }

  async function handleUnStake(amount: number) {
    if (transactionPending) {
      dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    } else {
      unStakeCallback({ amount })
        .then((e) => {
          setTransactionPending(true)
          dispatch(showToaster(INFO, 'Unstaking...', 'Please wait 30s'))
          dispatch(stakeAnim())
          e.confirmation().then((e: any) => {
            dispatch(showToaster(SUCCESS, 'Unstaking done', 'All good :)'))
            setTransactionPending(false)
          })
          return e
        })
        .catch((e: any) => {
          dispatch(showToaster(ERROR, 'Error', e.message))
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
      transactionPending={transactionPending}
    />
  )
}
