import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// style
import { Page } from 'styles'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { DoormanInfoStyled } from './Doorman.style'
import { DoormanChart } from './DoormanChart/DoormanChart.controller'

// actions
import { getDoormanStorage, getMvkTokenStorage, getUserData, stake } from './Doorman.actions'
import { DoormanStatsView } from './DoormanStats/DoormanStats.view'
import { showExitFeeModal } from './ExitFeeModal/ExitFeeModal.actions'
import { ExitFeeModal } from './ExitFeeModal/ExitFeeModal.controller'
import { StakeUnstakeView } from './StakeUnstake/StakeUnstake.view'

export const Doorman = () => {
  const dispatch = useDispatch()

  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { mvkTokenStorage } = useSelector((state: State) => state.mvkToken)
  const { totalStakedMvk } = useSelector((state: State) => state.doorman)

  useEffect(() => {
    if (accountPkh) {
      dispatch(getUserData(accountPkh))
    }
    dispatch(getMvkTokenStorage())
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
      <PageHeader page={'doorman'} />
      <StakeUnstakeView stakeCallback={stakeCallback} unstakeCallback={unstakeCallback} />
      <DoormanInfoStyled>
        <DoormanChart />

        <DoormanStatsView
          loading={false}
          mvkTotalSupply={mvkTokenStorage?.totalSupply}
          totalStakedMvkSupply={totalStakedMvk}
        />
      </DoormanInfoStyled>
    </Page>
  )
}
