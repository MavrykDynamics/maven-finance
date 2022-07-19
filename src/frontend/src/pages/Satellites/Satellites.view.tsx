import React from 'react'
import { useHistory } from 'react-router'

// styles
import { Page, PageContent } from 'styles'
import { InfoBlockWrapper } from './Satellites.style'
import { EmptyContainer as EmptyList } from 'app/App.style'

// types
import { SatelliteRecord } from 'utils/TypesAndInterfaces/Delegation'
import { Feed } from './helpers/Satellites.types'

// view
import SatelliteList from './SatelliteList/SatellitesList.controller'
import SatellitesSideBar from './SatellitesSideBar/SatellitesSideBar.controller'
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { InfoTab } from 'app/App.components/InfoTab/InfoTab.controller'

// consts
import { PRIMARY } from 'app/App.components/Modal/Modal.constants'
import { SATELITES_TOP_LIST_NAME, FEEDS_TOP_LIST_NAME } from 'pages/FinacialRequests/Pagination/pagination.consts'

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
    delegateCallback: (address: string) => void
    undelegateCallback: () => void
  }
  dataFeedsData: {
    items: Array<Feed>
  }
}

const EmptyContainer = () => (
  <EmptyList>
    <img src="/images/not-found.svg" alt="No Satellites & Data feeeds" />
    <figcaption> No Satellites & Data feeeds to show</figcaption>
  </EmptyList>
)

const SatellitesView = ({
  isLoading,
  tabsInfo,
  oracleSatellitesData,
  dataFeedsData,
  delegateCallback,
}: OraclesViewProps) => {
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

          {oracleSatellitesData.items.length || dataFeedsData.items.length ? (
            <>
              <div className="oracle-list-wrapper">
                <div className="see-all-link" onClick={() => history.push('/satellite-nodes')}>
                  See all Satellites
                  <svg>
                    <use xlinkHref="/icons/sprites.svg#arrow-left-stroke" />
                  </svg>
                </div>
                <SatelliteList
                  listTitle={'Top Satellites'}
                  loading={isLoading}
                  items={oracleSatellitesData.items}
                  listType={'satellites'}
                  name={SATELITES_TOP_LIST_NAME}
                  additionaldata={oracleSatellitesData}
                />
              </div>

              <div className="oracle-list-wrapper">
                <div className="see-all-link" onClick={() => history.push('/data-feeds')}>
                  See all Data Feeds
                  <svg>
                    <use xlinkHref="/icons/sprites.svg#arrow-left-stroke" />
                  </svg>
                </div>
                <SatelliteList
                  listTitle={'Popular Feeds'}
                  loading={isLoading}
                  items={dataFeedsData.items}
                  listType={'feeds'}
                  name={FEEDS_TOP_LIST_NAME}
                  onClickHandler={delegateCallback}
                />
              </div>
            </>
          ) : (
            <EmptyContainer />
          )}
        </div>
        <SatellitesSideBar />
      </PageContent>
    </Page>
  )
}

export default SatellitesView
