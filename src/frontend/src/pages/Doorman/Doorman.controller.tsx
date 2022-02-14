import * as React from 'react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { Message, Page } from 'styles'

import { getDoormanStorage, getMvkTokenStorage, stake, unstake } from './Doorman.actions'
import { DoormanHeader } from './DoormanHeader/DoormanHeader.controller'
import { showExitFeeModal } from './ExitFeeModal/ExitFeeModal.actions'
import { ExitFeeModal } from './ExitFeeModal/ExitFeeModal.controller'
import { StakeUnstakeView } from './StakeUnstake/StakeUnstake.view'
import { DoormanStatsView } from './DoormanStats/DoormanStats.view'

export const Doorman = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { mvkTokenStorage, myMvkTokenBalance } = useSelector((state: State) => state.mvkToken)
  const { doormanStorage, totalStakedMvkSupply } = useSelector((state: State) => state.doorman)
  const userStakeBalanceLedger = doormanStorage?.userStakeBalanceLedger
  const myMvkStakeBalance = userStakeBalanceLedger?.get(accountPkh || '') || '0.00'

  useEffect(() => {
    if (accountPkh) {
      dispatch(getMvkTokenStorage(accountPkh))
    } else {
      dispatch(getMvkTokenStorage())
    }
    dispatch(getDoormanStorage())
  }, [dispatch, accountPkh])

  const stakeCallback = (amount: number) => {
    dispatch(stake(amount))
  }

  const unstakeCallback = (amount: number) => {
    dispatch(showExitFeeModal(amount))
  }

  return (
    <Page>
      <ExitFeeModal />
      <DoormanHeader />
      <StakeUnstakeView
        myMvkTokenBalance={myMvkTokenBalance}
        userStakeBalance={myMvkStakeBalance}
        stakeCallback={stakeCallback}
        unstakeCallback={unstakeCallback}
        loading={loading}
        accountPkh={accountPkh}
      />
      <DoormanStatsView
        loading={loading}
        mvkTotalSupply={mvkTokenStorage?.totalSupply}
        totalStakedMvkSupply={totalStakedMvkSupply}
      />
      {/*<DoormanStats />*/}
    </Page>
  )
}
