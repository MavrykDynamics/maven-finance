import { InfoTab } from 'app/App.components/InfoTab/InfoTab.controller'
import { PRIMARY } from 'app/App.components/Modal/Modal.constants'
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { SatelliteSideBar } from 'pages/Satellites/SatelliteSideBar/SatelliteSideBar.controller'
import React from 'react'
import { useSelector } from 'react-redux'
import { State } from 'reducers'
import { Page, PageContent } from 'styles'
import { InfoBlockWrapper } from './Oracles.styles'
import OraclesSideBar from './OraclesSideBar/OraclesSideBar.controller'
type OraclesViewProps = {
  isLoading: boolean
  tabsInfo: {
    totalDelegetedMVK: string | number | JSX.Element
    totalSatelliteOracles: string | number | JSX.Element
    numberOfDataFeeds: string | number | JSX.Element
  }
}

const OraclesView = ({ isLoading, tabsInfo }: OraclesViewProps) => {
  return (
    <Page>
      <PageHeader page={'satellites'} kind={PRIMARY} loading={isLoading} />
      <PageContent>
        <InfoBlockWrapper>
          <InfoTab
            title={'Total Delegated MVK'}
            value={tabsInfo.totalDelegetedMVK}
            tipLink={'https://mavryk.finance/litepaper#satellites-governance-and-the-decentralized-oracle'}
          />
          <InfoTab
            title={'Total Satellites & Oracles'}
            value={tabsInfo.totalSatelliteOracles}
            tipLink={'https://mavryk.finance/litepaper#satellites-governance-and-the-decentralized-oracle'}
          />
          <InfoTab
            title={'Number of Data Feeds'}
            value={tabsInfo.numberOfDataFeeds}
            tipLink={'https://mavryk.finance/litepaper#satellites-governance-and-the-decentralized-oracle'}
          />
        </InfoBlockWrapper>
        <OraclesSideBar />
      </PageContent>
    </Page>
  )
}

export default OraclesView
