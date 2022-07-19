import React, { useState } from 'react'
import moment from 'moment'

// consts, helpers
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { PRIMARY } from 'app/App.components/PageHeader/PageHeader.constants'
import { getDate_MDY_Format } from 'pages/FinacialRequests/FinancialRequests.helpers'
import { ORACLES_DATA_IN_FEED_LIST_NAME } from 'pages/FinacialRequests/Pagination/pagination.consts'
import { QUESTION_MARK_SVG_ENCODED, INFO_SVG_ENCODED } from 'pages/Satellites/helpers/Satellites.consts'

// types
import { SatelliteRecord } from 'utils/TypesAndInterfaces/Delegation'
import { Feed } from 'pages/Satellites/helpers/Satellites.types'

// view
import DataFeedsPagination from '../pagination/DataFeedspagination.controler'
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import SatelliteList from 'pages/Satellites/SatelliteList/SatellitesList.controller'
import Chart from 'app/App.components/Chart/Chart.view'
import { Button } from 'app/App.components/Button/Button.controller'

// styles
import {
  DataFeedInfoBlock,
  DataFeedsStyled,
  DataFeedsTitle,
  DataFeedSubTitleText,
  DataFeedValueText,
} from './DataFeedsDetails.style'
import { Page } from 'styles'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'

type FeedDetailsProps = {
  feed: Feed | null
  isLoading: boolean
  oracles: Array<SatelliteRecord>
}

const DataFeedDetailsView = ({ feed, isLoading, oracles }: FeedDetailsProps) => {
  const [isClickedRegister, setClickedRegister] = useState(false)
  const arrOfOracleRecords = feed?.oracle_records.map(({ oracle_id }: { oracle_id: string }) => oracle_id) || []

  return feed ? (
    <Page>
      <PageHeader page={'data-feeds'} kind={PRIMARY} loading={false} />
      <DataFeedsPagination />

      <DataFeedsStyled>
        <div className="top-section-wrapper">
          <div className="left-part">
            <div className="top">
              <div className="name-part">
                <DataFeedsTitle fontSize={25} fontWeidth={700}>
                  {feed?.token_1_symbol}/{feed?.token_0_symbol}
                </DataFeedsTitle>

                <DataFeedsTitle svgContent={QUESTION_MARK_SVG_ENCODED}>
                  Learn how to use XTZ/USD in your smart contracts here
                </DataFeedsTitle>
              </div>
              <div className="price-part">
                <DataFeedValueText fontSize={22} fontWeidth={600}>
                  <svg>
                    <use xlinkHref="/icons/sprites.svg#trustShield" />
                  </svg>
                  $ 1,937.34 (fix)
                </DataFeedValueText>
                <DataFeedsTitle svgContent={INFO_SVG_ENCODED} className="margin-r">
                  Trusted answer
                </DataFeedsTitle>
              </div>
            </div>
            <div className="bottom">
              <DataFeedInfoBlock>
                <DataFeedsTitle svgContent={INFO_SVG_ENCODED} fontSize={18} fontWeidth={600}>
                  Trigger parameters
                </DataFeedsTitle>
                <DataFeedSubTitleText fontSize={14} fontWeidth={600}>
                  Deviation threshold
                </DataFeedSubTitleText>
                <DataFeedValueText fontSize={16} fontWeidth={600}>
                  0.5% (fix)
                </DataFeedValueText>
              </DataFeedInfoBlock>
              <DataFeedInfoBlock>
                <DataFeedsTitle svgContent={INFO_SVG_ENCODED} fontSize={18} fontWeidth={600}>
                  Oracle responses
                </DataFeedsTitle>
                <DataFeedSubTitleText fontSize={14} fontWeidth={600}>
                  Minimum of 21
                </DataFeedSubTitleText>
                <DataFeedValueText fontSize={16} fontWeidth={600}>
                  31/31 (fix)
                </DataFeedValueText>
              </DataFeedInfoBlock>
              <DataFeedInfoBlock>
                <DataFeedsTitle svgContent={INFO_SVG_ENCODED} fontSize={18} fontWeidth={600}>
                  Last update
                </DataFeedsTitle>
                <DataFeedSubTitleText fontSize={14} fontWeidth={600}>
                  {getDate_MDY_Format(feed.last_completed_round_price_timestamp)}
                </DataFeedSubTitleText>
                <DataFeedValueText fontSize={16} fontWeidth={600}>
                  {moment(new Date(feed.last_completed_round_price_timestamp)).fromNow()}
                </DataFeedValueText>
              </DataFeedInfoBlock>
              <DataFeedInfoBlock>
                <DataFeedSubTitleText fontSize={14} fontWeidth={600}>
                  Heartbeat
                </DataFeedSubTitleText>
                <DataFeedValueText fontSize={16} fontWeidth={600}>
                  0.5% (fix)
                </DataFeedValueText>
              </DataFeedInfoBlock>
              <DataFeedInfoBlock>
                <DataFeedsTitle svgContent={INFO_SVG_ENCODED} fontSize={18} fontWeidth={600}>
                  Decimals
                </DataFeedsTitle>
                <DataFeedSubTitleText fontSize={14} fontWeidth={600}>
                  {moment(new Date(feed.last_completed_round_price_timestamp)).fromNow()}
                </DataFeedSubTitleText>
                <DataFeedValueText fontSize={16} fontWeidth={600}>
                  {''.padEnd(feed.decimals, '0')}
                </DataFeedValueText>
              </DataFeedInfoBlock>
            </div>
          </div>

          <div className="right-part">
            {!isClickedRegister ? (
              <div className="register-pair-wrapper">
                <DataFeedSubTitleText fontSize={16} fontWeidth={600} className="title">
                  Register this price pair
                </DataFeedSubTitleText>

                <Button
                  text="Register (not implemented)"
                  kind={ACTION_PRIMARY}
                  loading={isLoading}
                  onClick={() => {
                    setClickedRegister(true)
                  }}
                />
              </div>
            ) : null}

            <div className={`adresses-info ${isClickedRegister ? 'registered' : ''}`}>
              {isClickedRegister ? (
                <DataFeedsTitle fontSize={16} fontWeidth={600} className="title">
                  Oracle contract details
                </DataFeedsTitle>
              ) : null}
              <div className="info-wrapper">
                <DataFeedsTitle svgContent={INFO_SVG_ENCODED} fontSize={14} fontWeidth={600}>
                  Contract address
                </DataFeedsTitle>
                <DataFeedValueText fontSize={14} fontWeidth={600}>
                  <TzAddress tzAddress={feed?.address || ''} hasIcon={false} />
                </DataFeedValueText>
              </div>
              <div className="info-wrapper">
                <DataFeedsTitle svgContent={INFO_SVG_ENCODED} fontSize={14} fontWeidth={600}>
                  ENS address
                </DataFeedsTitle>
                <DataFeedValueText fontSize={14} fontWeidth={600}>
                  eth-usd.data.eth (fix)
                </DataFeedValueText>
              </div>
            </div>
          </div>
        </div>

        <div className="chart-wrapper">
          <GovRightContainerTitleArea>
            <h1>Answer history</h1>
          </GovRightContainerTitleArea>
          <Chart list={[]} header={''} />
        </div>
      </DataFeedsStyled>

      <SatelliteList
        listTitle={'Oracles data'}
        loading={isLoading}
        items={oracles.filter((satellite) => arrOfOracleRecords.includes(satellite.address))}
        listType={'oracles'}
        name={ORACLES_DATA_IN_FEED_LIST_NAME}
        onClickHandler={() => {}}
        additionaldata={{}}
      />
    </Page>
  ) : null
}

export default DataFeedDetailsView
