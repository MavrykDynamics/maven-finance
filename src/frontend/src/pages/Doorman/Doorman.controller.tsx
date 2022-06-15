import * as React from 'react'
import { useEffect } from 'react'
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
import { getDoormanStorage, getMvkTokenStorage, getUserData, stake } from './Doorman.actions'
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
  const { doormanStorage, totalStakedMvk } = useSelector((state: State) => state.doorman)
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
      <ExitFeeModal />
      <PageHeader page={'doorman'} kind={PRIMARY} loading={false} />
      <StakeUnstakeView
        stakeCallback={stakeCallback}
        unstakeCallback={unstakeCallback}
        loading={false}
        accountPkh={accountPkh}
      />
      <DoormanInfoStyled>
        <Chart list={chartList} header="MVK Staking analysis" />
        <DoormanStatsView
          loading={false}
          mvkTotalSupply={mvkTokenStorage?.totalSupply}
          totalStakedMvkSupply={totalStakedMvk}
        />
      </DoormanInfoStyled>
    </Page>
  )
}
