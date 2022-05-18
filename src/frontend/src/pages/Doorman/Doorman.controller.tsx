import * as React from 'react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
// style
import { Page } from 'styles'

import Chart from '../../app/App.components/Chart/Chart.view'
// constants
import { PRIMARY } from '../../app/App.components/PageHeader/PageHeader.constants'
// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
// actions
import { getDoormanStorage, getMvkTokenStorage, getUserData, stake, unstake } from './Doorman.actions'
import { DoormanInfoStyled } from './Doorman.style'
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

  const chartList = [20, 120, 180, 350, 380, 700, 801]

  return (
    <Page>
      {/* <div style="position: fixed;inset: 0;display: flex;justify-content: center;align-items: center;z-index: 222;background: rgb(0 0 0 / 50%);">
        <img className="loading-icon" src="/icons/loading-white.svg" alt="loading" />
      </div> */}
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
      <DoormanInfoStyled>
        <Chart list={chartList} header="MVK Staking analysis" />
        <DoormanStatsView
          loading={loading}
          mvkTotalSupply={mvkTokenStorage?.totalSupply}
          totalStakedMvkSupply={totalStakedMvkSupply}
        />
      </DoormanInfoStyled>
    </Page>
  )
}
