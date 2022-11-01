import Icon from 'app/App.components/Icon/Icon.view'
import { InfoTab } from 'app/App.components/InfoTab/InfoTab.controller'
// consts
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { EmptyContainer as EmptyList } from 'app/App.style'
import { FEEDS_TOP_LIST_NAME, SATELITES_TOP_LIST_NAME } from 'pages/FinacialRequests/Pagination/pagination.consts'
import { Link } from 'react-router-dom'
// styles
import { Page, PageContent } from 'styles'
import { SatelliteListStyled } from './Satellites.style'
// types
import { SatelliteRecord } from 'utils/TypesAndInterfaces/Delegation'

import { FeedGQL } from './helpers/Satellites.types'
// view
import SatelliteList from './SatelliteList/SatellitesList.controller'
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
    delegateCallback: (address: string) => void
    undelegateCallback: () => void
  }
  dataFeedsData: {
    items: Array<FeedGQL>
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
  return (
    <Page>
      <PageHeader page={'satellites'} />
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
              {oracleSatellitesData.items.length ? (
                <div className="oracle-list-wrapper">
                  <Link to="/satellite-nodes">
                    <div className="see-all-link">
                      See all Satellites
                      <Icon id="arrow-left-stroke" />
                    </div>
                  </Link>
                  <SatelliteList
                    listTitle={'Top Satellites'}
                    loading={isLoading}
                    items={oracleSatellitesData.items}
                    listType={'satellites'}
                    name={SATELITES_TOP_LIST_NAME}
                    additionaldata={oracleSatellitesData}
                  />
                </div>
              ) : null}

              {dataFeedsData.items.length ? (
                <div className="oracle-list-wrapper">
                  <Link to="/data-feeds">
                    <div className="see-all-link">
                      See all Data Feeds
                      <Icon id="arrow-left-stroke" />
                    </div>
                  </Link>
                  <SatelliteListStyled
                    listTitle={'Popular Feeds'}
                    loading={isLoading}
                    items={dataFeedsData.items}
                    listType={'feeds'}
                    name={FEEDS_TOP_LIST_NAME}
                    onClickHandler={delegateCallback}
                  />
                </div>
              ) : null}
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
