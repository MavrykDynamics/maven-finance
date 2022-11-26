import React from 'react'
import { Link, Redirect, Route, Switch } from 'react-router-dom'
import { DashboardPersonalStyled } from './DashboardPersonal.style'
import { DELEGATION_TAB_ID, PORTFOLIO_TAB_ID, SATELLITE_TAB_ID, TabId } from './DashboardPersonal.utils'
import DashboardPersonalEarningsHistory, {
  DashboardPersonalEarningsHistoryProps,
} from './DashboardPersonalComponents/DashboardPersonalEarningsHistory'
import DashboardPersonalMyRewards from './DashboardPersonalComponents/DashboardPersonalMyRewards'
import DelegationTab from './DashboardPersonalComponents/DelegationTab'
import PortfolioTab from './DashboardPersonalComponents/PortfolioTab'
import SatelliteTab from './DashboardPersonalComponents/SatelliteTab'

type DashboardPersonalProps = {
  activeTab: TabId
  isUserSatellite: boolean
  claimRewardsHandler: () => void
  earnings: DashboardPersonalEarningsHistoryProps
  walletData: {
    xtzAmount: number
    tzBTCAmount: number
    sMVKAmount: number
    notsMVKAmount: number
  }
}

const DashboardPersonalView = ({
  activeTab,
  isUserSatellite,
  claimRewardsHandler,
  earnings,
  walletData,
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
      <div className={`bottom-grid ${activeTab}`}>
        <Switch>
          <Route exact path={`/dashboard-personal/${PORTFOLIO_TAB_ID}`}>
            <PortfolioTab {...walletData} />
          </Route>
          <Route exact path={`/dashboard-personal/${DELEGATION_TAB_ID}`}>
            <DelegationTab />
          </Route>
          <Route exact path={`/dashboard-personal/${SATELLITE_TAB_ID}`}>
            <SatelliteTab />
          </Route>

          <Redirect to={`/dashboard-personal/${PORTFOLIO_TAB_ID}`} />
        </Switch>
      </div>
    </DashboardPersonalStyled>
  )
}

export default DashboardPersonalView
