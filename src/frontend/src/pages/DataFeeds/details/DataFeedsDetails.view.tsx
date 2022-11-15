import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

// consts, helpers
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { usersData } from 'pages/UsersOracles/users.const'
import { ORACLES_DATA_IN_FEED_LIST_NAME } from 'pages/FinacialRequests/Pagination/pagination.consts'
// view
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { Button } from 'app/App.components/Button/Button.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Timer } from 'app/App.components/Timer/Timer.controller'
import SatelliteList from 'pages/Satellites/SatelliteList/SatellitesList.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { DataFeedsChart } from '../chart/DataFeedsChart.controller'

// types
import { SatelliteRecord } from 'utils/TypesAndInterfaces/Delegation'
import { FeedGQL } from 'pages/Satellites/helpers/Satellites.types'
import { DataFeedsHistory, DataFeedsVolatility } from '../../Satellites/helpers/Satellites.types'

import DataFeedsPagination from '../pagination/DataFeedspagination.controler'
// styles
import {
  DataFeedInfoBlock,
  DataFeedsStyled,
  DataFeedsTitle,
  DataFeedSubTitleText,
  DataFeedValueText,
  UsersListCardsWrapper,
  UsersListWrapper,
  UserSmallCard,
} from './DataFeedsDetails.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { EmptyContainer } from 'app/App.style'
import { cyanColor, downColor, Page } from 'styles'
import { CoinsLogo } from 'app/App.components/Icon/CoinsIcons.view'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { parseDate } from 'utils/time'
import dayjs from 'dayjs'
import { useSelector } from 'react-redux'
import { State } from 'reducers'

type FeedDetailsProps = {
  feed: FeedGQL | null
  isLoading: boolean
  oracles: Array<SatelliteRecord>
  registerFeedHandler: () => void
  dataFeedsHistory: DataFeedsHistory
  dataFeedsVolatility: DataFeedsVolatility
}

const emptyContainer = (
  <EmptyContainer>
    <img src="/images/not-found.svg" alt=" No proposals to show" />
    <figcaption> No oracles to show</figcaption>
  </EmptyContainer>
)

const DataFeedDetailsView = ({
  feed,
  isLoading,
  oracles,
  registerFeedHandler,
  dataFeedsHistory,
  dataFeedsVolatility,
}: FeedDetailsProps) => {
  const { dipDupTokens } = useSelector((state: State) => state.tokens)
  const [isClickedRegister, setClickedRegister] = useState(false)
  const oraclesForFeed = useMemo(
    () => oracles.filter(({ oracleRecords }) => oracleRecords.find(({ feedAddress }) => feed?.address === feedAddress)),
    [oracles],
  )

  const isTrustedAnswer = feed && feed.last_completed_data_pct_oracle_resp >= feed.pct_oracle_threshold
  const heartbeatUpdateInfo =
    dayjs(Date.now()).diff(dayjs(feed?.last_completed_data_last_updated_at), 'minutes') >= 30
      ? `
  Price feed is outdated, missed the schedule price update at ${parseDate({
    time: new Date(feed?.last_completed_data_last_updated_at || '').getTime() + 1000 * 60 * 30,
    timeFormat: 'MMM DD, HH:mm:ss',
  })}
  `
      : `
  Price feed updated every 30 mins, starting from latest time it was updated
  `

  const imageLink = dipDupTokens.find(({ contract }) => contract === feed?.address)?.metadata?.icon

  return feed ? (
    <Page>
      <PageHeader page={'data-feeds'} />
      <DataFeedsPagination />

      <DataFeedsStyled>
        <div className="top-section-wrapper">
          <div className="left-part">
            <div className="top">
              <div className="name-part">
                <div className="img-wrapper">
                  <CoinsLogo imageLink={imageLink} />
                </div>
                <DataFeedsTitle fontSize={25} fontWeidth={700}>
                  {feed.name}
                </DataFeedsTitle>
                <a href="https://mavryk.finance/litepaper" target="_blank" rel="noreferrer">
                  Learn how to use {feed.name} in your smart contracts here
                  <CustomTooltip className="info-icon" iconId={'question'} />
                </a>
              </div>
              <div className="price-part">
                <DataFeedValueText fontSize={22} fontWeidth={600}>
                  <Icon id={isTrustedAnswer ? 'trustShield' : 'notTrustedShield'} />
                  <CommaNumber beginningText="$" value={feed.last_completed_data} />
                </DataFeedValueText>
                <DataFeedsTitle>
                  {isTrustedAnswer ? 'Trusted Answer' : 'Not Trusted Answer'}
                  <CustomTooltip
                    text={`Answer is calculated in the smart contract and required a minimum of 60% of oracles to be trusted`}
                    iconId={'info'}
                    className="info-icon"
                  />
                </DataFeedsTitle>
              </div>
            </div>
            <div className="bottom">
              <DataFeedInfoBlock>
                <DataFeedsTitle fontSize={16} fontWeidth={600}>
                  Trigger parameters
                  <CustomTooltip
                    text={`A new trusted answer is written when the off-chain data moves more than the deviation threshold or 3600
                    seconds have passed since the last answer was written on-chain.`}
                    iconId={'info'}
                    className="info-icon"
                  />
                </DataFeedsTitle>

                <DataFeedSubTitleText fontSize={14} fontWeidth={600}>
                  Deviation threshold
                </DataFeedSubTitleText>

                <DataFeedValueText fontSize={16} fontWeidth={600}>
                  {feed.pct_oracle_threshold}%
                </DataFeedValueText>
              </DataFeedInfoBlock>

              <DataFeedInfoBlock justifyContent={'flex-end'}>
                <DataFeedSubTitleText fontSize={14} fontWeidth={600}>
                  Heartbeat
                  <CustomTooltip
                    text={heartbeatUpdateInfo}
                    defaultStrokeColor="#77a4f2"
                    iconId={'info'}
                    className="info-icon"
                  />
                </DataFeedSubTitleText>
                <DataFeedValueText fontSize={16} fontWeidth={600}>
                  {feed.last_completed_data_last_updated_at ? (
                    <Timer
                      options={{
                        short: true,
                        showZeros: false,
                        negativeColor: isTrustedAnswer ? cyanColor : downColor,
                        defaultColor: cyanColor,
                      }}
                      timestamp={new Date(feed.last_completed_data_last_updated_at).getTime() + 1000 * 60 * 30}
                    />
                  ) : null}
                </DataFeedValueText>
              </DataFeedInfoBlock>

              <DataFeedInfoBlock>
                <DataFeedsTitle fontSize={16} fontWeidth={600}>
                  Oracle responses
                  <CustomTooltip
                    className="info-icon"
                    text={`The smart contract is connected to X oracles. Each aggregation requires a minimum of 60% oracles
                    responses to be able to calculate a trusted answer.`}
                    iconId={'info'}
                  />
                </DataFeedsTitle>
                <DataFeedSubTitleText fontSize={14} fontWeidth={600}>
                  Minimum of {feed.pct_oracle_threshold}%
                </DataFeedSubTitleText>
                <DataFeedValueText fontSize={16} fontWeidth={600}>
                  {feed.last_completed_data_pct_oracle_resp}%
                </DataFeedValueText>
              </DataFeedInfoBlock>

              <DataFeedInfoBlock>
                <DataFeedsTitle fontSize={16} fontWeidth={600}>
                  Last update
                  <CustomTooltip
                    text={`Time since last answer was written on-chain`}
                    iconId={'info'}
                    className="info-icon"
                  />
                </DataFeedsTitle>
                <DataFeedSubTitleText fontSize={14} fontWeidth={600}>
                  {parseDate({ time: feed.last_completed_data_last_updated_at, timeFormat: 'MMM DD, YYYY' })}
                </DataFeedSubTitleText>
                <DataFeedValueText fontSize={16} fontWeidth={600}>
                  {feed.last_completed_data_last_updated_at ? (
                    <Timer
                      options={{
                        short: true,
                        showZeros: false,
                        negativeColor: cyanColor,
                        defaultColor: cyanColor,
                      }}
                      timestamp={new Date(feed.last_completed_data_last_updated_at).getTime() + 1000 * 60 * 30}
                    />
                  ) : null}
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
                  text="Register"
                  kind={ACTION_PRIMARY}
                  loading={isLoading}
                  onClick={() => {
                    setClickedRegister(true)
                    registerFeedHandler()
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
                <DataFeedsTitle fontSize={14} fontWeidth={600} style={{ lineHeight: '100%' }}>
                  Contract address
                  <CustomTooltip
                    text={`The contract address is an on-chain address that points to this particular data feed.
                    The ENS address resolves to the contract address and is preferred as an easily-identifiable, tamper-proof agaddress.`}
                    defaultStrokeColor="#8D86EB"
                    iconId={'info'}
                    className="info-icon"
                  />
                </DataFeedsTitle>
                <DataFeedValueText fontSize={13} fontWeidth={600} style={{ lineHeight: '100%' }}>
                  <TzAddress tzAddress={feed.address} hasIcon={false} />
                </DataFeedValueText>
              </div>
              {/* // TODO: [MAV-673]
              <div className="info-wrapper">
                <DataFeedsTitle fontSize={14} fontWeidth={600} style={{ lineHeight: '100%' }}>
                  ENS address
                  <CustomTooltip
                    text={''}
                    defaultStrokeColor="#8D86EB"
                    iconId={'info'}
                    className="info-icon"
                  />
                </DataFeedsTitle>
                <DataFeedValueText fontSize={13} fontWeidth={600} style={{ lineHeight: '100%' }}>
                  eth-usd.data.eth
                </DataFeedValueText>
              </div> */}
            </div>
          </div>
        </div>

        <div className="chart-wrapper">
          <GovRightContainerTitleArea>
            <h1>Answer history</h1>
          </GovRightContainerTitleArea>

          <DataFeedsChart dataFeedsHistory={dataFeedsHistory} dataFeedsVolatility={dataFeedsVolatility} />
        </div>
      </DataFeedsStyled>

      {oraclesForFeed.length ? (
        <SatelliteList
          listTitle={'Oracles data'}
          loading={isLoading}
          items={oraclesForFeed}
          listType={'oracles'}
          name={ORACLES_DATA_IN_FEED_LIST_NAME}
        />
      ) : (
        emptyContainer
      )}

      <UsersListWrapper className="oracle-list-wrapper">
        <GovRightContainerTitleArea>
          <h1>Users</h1>
        </GovRightContainerTitleArea>

        <Link to="oracles-users">
          <div className="see-all-link">
            See all users
            <Icon id="arrow-left-stroke" />
          </div>
        </Link>

        <UsersListCardsWrapper>
          {usersData.map((user) => (
            <Link to={`/satellites/user-details/${user.id}`} key={user.id}>
              <UserSmallCard>
                <div className="img-wrapper">logo</div>
                {user.name}
              </UserSmallCard>
            </Link>
          ))}
        </UsersListCardsWrapper>
      </UsersListWrapper>
    </Page>
  ) : null
}

export default DataFeedDetailsView
