import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import React from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { State } from 'reducers'
import { Page } from 'styles/components'
import { isValidId, PORTFOLIO_TAB_ID } from './DashboardPersonal.utils'
import DashboardPersonalView from './DashboardPersonal.view'

const DashboardPersonal = () => {
  const {
    myDoormanRewardsData,
    myFarmRewardsData,
    mySatelliteRewardsData,
    myMvkTokenBalance,
    mySMvkTokenBalance,
    myXTZTokenBalance,
    isSatellite,
  } = useSelector((state: State) => state.user)

  const { tabId } = useParams<{ tabId: string }>()

  return (
    <Page>
      <PageHeader page={'dashboard'} />
      <DashboardPersonalView isUserSatellite={isSatellite} activeTab={isValidId(tabId) ? tabId : PORTFOLIO_TAB_ID} />
    </Page>
  )
}

export default DashboardPersonal
