import * as React from 'react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { Page } from 'styles'

import { PRIMARY } from '../../app/App.components/PageHeader/PageHeader.constants'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { getDoormanStorage, getMvkTokenStorage, getUserData, stake, unstake } from './Doorman.actions'
import { DoormanStatsView } from './DoormanStats/DoormanStats.view'
import { showExitFeeModal } from './ExitFeeModal/ExitFeeModal.actions'
import { ExitFeeModal } from './ExitFeeModal/ExitFeeModal.controller'
import { StakeUnstakeView } from './StakeUnstake/StakeUnstake.view'

export const Doorman = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { mvkTokenStorage, myMvkTokenBalance } = useSelector((state: State) => state.mvkToken)
  const { doormanStorage, totalStakedMvkSupply } = useSelector((state: State) => state.doorman)
  const { user } = useSelector((state: State) => state.user)

  // const userStakeBalanceLedger = doormanStorage?.userStakeBalanceLedger
  // const myMvkStakeBalance = userStakeInfo?.mySMvkBalance || '0.00' //userStakeBalanceLedger?.get(accountPkh || '')
  console.log('%c ||||| accountPkh', 'color:yellowgreen', accountPkh)
  useEffect(() => {
    if (accountPkh) {
      dispatch(getUserData(accountPkh))
      dispatch(getMvkTokenStorage(accountPkh))
      dispatch(getDoormanStorage(accountPkh))
    } else {
      dispatch(getMvkTokenStorage())
      dispatch(getDoormanStorage())
    }
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
      <PageHeader page={'doorman'} kind={PRIMARY} loading={loading} />
      <StakeUnstakeView
        myMvkTokenBalance={user?.myMvkTokenBalance}
        userStakeBalance={user?.mySMvkTokenBalance}
        stakeCallback={stakeCallback}
        unstakeCallback={unstakeCallback}
        loading={loading}
        accountPkh={accountPkh}
      />
      {/*https://bdp4bn.csb.app/*/}
      <DoormanStatsView
        loading={loading}
        mvkTotalSupply={mvkTokenStorage?.totalSupply}
        totalStakedMvkSupply={totalStakedMvkSupply}
      />
      {/*<DoormanStats />*/}
    </Page>
  )
}
