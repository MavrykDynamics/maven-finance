import { InfoTab } from 'app/App.components/InfoTab/InfoTab.controller'
import { PRIMARY } from 'app/App.components/Modal/Modal.constants'
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { SatelliteSideBar } from 'pages/Satellites/SatelliteSideBar/SatelliteSideBar.controller'
import React from 'react'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router'
import { State } from 'reducers'
import { Page, PageContent } from 'styles'
import { SatelliteRecord } from 'utils/TypesAndInterfaces/Delegation'
import { InfoBlockWrapper } from './Oracles.styles'
import OracleList from './OraclesList/OraclesList.view'
import OraclesSideBar from './OraclesSideBar/OraclesSideBar.controller'
type OraclesViewProps = {
  isLoading: boolean
  tabsInfo: {
    totalDelegetedMVK: string | number | JSX.Element
    totalSatelliteOracles: string | number | JSX.Element
    numberOfDataFeeds: string | number | JSX.Element
  }
  delegateCallback: (address: string) => void
  oracleSatellitesData: {
    userStakedBalance: number
    satelliteUserIsDelegatedTo: string
    items: SatelliteRecord[]
  }
}

const OraclesView = ({ isLoading, tabsInfo, oracleSatellitesData, delegateCallback }: OraclesViewProps) => {
  const history = useHistory()
  return (
    <Page>
      <PageHeader page={'satellites'} kind={PRIMARY} loading={isLoading} />
      <PageContent>
        <div className="left-content-wrapper">
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

          <div className="oracle-list-wrapper">
            <div className="see-all-link" onClick={() => history.push('/oracle-satellites')}>
              See all Satellites
              <svg>
                <use xlinkHref="/icons/sprites.svg#arrow-left-stroke" />
              </svg>
            </div>
            <OracleList
              listTitle={'Top Satellites'}
              loading={isLoading}
              items={oracleSatellitesData.items}
              listType={'satellites'}
              name={'topSatelitesOracle'}
              onClickHandler={delegateCallback}
              additionaldata={oracleSatellitesData}
              noItemsText={'No oracle-satellites'}
            />
          </div>
        </div>

        <OraclesSideBar />
      </PageContent>
    </Page>
  )
}

export default OraclesView
