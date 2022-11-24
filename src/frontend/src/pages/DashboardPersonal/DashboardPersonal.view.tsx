import React from 'react'
import { Link } from 'react-router-dom'
import { DashboardPersonalStyled } from './DashboardPersonal.style'
import { DELEGATION_TAB_ID, PORTFOLIO_TAB_ID, SATELLITE_TAB_ID, TabId } from './DashboardPersonal.utils'
import DashboardPersonalEarningsHistory from './DashboardPersonalComponents/DashboardPersonalEarningsHistory'
import DashboardPersonalMyRewards from './DashboardPersonalComponents/DashboardPersonalMyRewards'

type DashboardPersonalProps = {
  activeTab: TabId
  isUserSatellite: boolean
}

const DashboardPersonalView = ({ activeTab, isUserSatellite }: DashboardPersonalProps) => {
  return (
    <DashboardPersonalStyled>
      <div className="top">
        <DashboardPersonalMyRewards />
        <DashboardPersonalEarningsHistory />
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
