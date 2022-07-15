import { InfoTab } from 'app/App.components/InfoTab/InfoTab.controller'
import { PRIMARY } from 'app/App.components/Modal/Modal.constants'
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import React from 'react'
import { useHistory } from 'react-router'
import { Page, PageContent } from 'styles'
import { SatelliteRecord } from 'utils/TypesAndInterfaces/Delegation'
import SatteliteList from './SatelliteList/SatellitesList.controller'
import { InfoBlockWrapper } from './Satellites.style'
import SatellitesSideBar from './SatellitesSideBar/SatellitesSideBar.controller'

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

const SatellitesView = ({ isLoading, tabsInfo, oracleSatellitesData, delegateCallback }: OraclesViewProps) => {
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
            <div className="see-all-link" onClick={() => history.push('/satellite-nodes')}>
              See all Satellites
              <svg>
                <use xlinkHref="/icons/sprites.svg#arrow-left-stroke" />
              </svg>
            </div>
            <SatteliteList
              listTitle={'Top Satellites'}
              loading={isLoading}
              items={oracleSatellitesData.items.slice(0, 3)}
              listType={'satellites'}
              name={'topSatelitesOracle'}
              onClickHandler={delegateCallback}
              additionaldata={oracleSatellitesData}
            />
          </div>
        </div>

        <SatellitesSideBar />
      </PageContent>
    </Page>
  )
}

export default SatellitesView
