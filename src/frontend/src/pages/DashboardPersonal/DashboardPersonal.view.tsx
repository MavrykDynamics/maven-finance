import React from 'react'
import { Link } from 'react-router-dom'
import { DashboardPersonalStyled } from './DashboardPersonal.style'
import { DELEGATION_TAB_ID, PORTFOLIO_TAB_ID, SATELLITE_TAB_ID, TabId } from './DashboardPersonal.utils'
import DashboardPersonalEarningsHistory, {
  DashboardPersonalEarningsHistoryProps,
} from './DashboardPersonalComponents/DashboardPersonalEarningsHistory'
import DashboardPersonalMyRewards from './DashboardPersonalComponents/DashboardPersonalMyRewards'

type DashboardPersonalProps = {
  activeTab: TabId
  isUserSatellite: boolean
  claimRewardsHandler: () => void
  earnings: DashboardPersonalEarningsHistoryProps
}

const DashboardPersonalView = ({
  activeTab,
  isUserSatellite,
  claimRewardsHandler,
  earnings,
}: DashboardPersonalProps) => {
  return (
    <DashboardPersonalStyled>
      <div className="top">
        <DashboardPersonalMyRewards
          earnedRewards={121212.12}
          rewardsToClaim={121212.1212}
          claimRewardsHandler={claimRewardsHandler}
        />
        <DashboardPersonalEarningsHistory {...earnings} />
      </div>
      <div className="tabs-switchers">
        <Link
          to={`/dashboard-personal/${PORTFOLIO_TAB_ID}`}
          className={activeTab === PORTFOLIO_TAB_ID ? 'selected' : ''}
        >
          Portfolio
        </Link>
        <Link
          to={`/dashboard-personal/${isUserSatellite ? SATELLITE_TAB_ID : DELEGATION_TAB_ID}`}
          className={activeTab === (isUserSatellite ? SATELLITE_TAB_ID : DELEGATION_TAB_ID) ? 'selected' : ''}
        >
          {isUserSatellite ? 'Satellite' : 'Delegation'}
        </Link>
      </div>
      <div className="bottom-grid">fsdfd</div>
    </DashboardPersonalStyled>
  )
}

export default DashboardPersonalView
