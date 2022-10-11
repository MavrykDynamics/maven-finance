import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { CoinsLogo } from 'app/App.components/Icon/CoinsIcons.view'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { BGPrimaryTitle } from 'pages/BreakGlass/BreakGlass.style'
import { getOracleStorage } from 'pages/Satellites/Satellites.actions'
import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { State } from 'reducers'
import { parseDate } from 'utils/time'
import { StatBlock } from '../Dashboard.style'
import { OraclesContentStyled, TabWrapperStyled } from './DashboardTabs.style'

export const OraclesTab = () => {
  const dispatch = useDispatch()
  const { feeds } = useSelector((state: State) => state.oracles.oraclesStorage)
  const { exchangeRate } = useSelector((state: State) => state.mvkToken)
  const { satelliteLedger = [] } = useSelector((state: State) => state.delegation.delegationStorage)

  const oracleFeeds = feeds.length
  const popularFeeds = feeds.splice(0, 3)

  useEffect(() => {
    dispatch(getOracleStorage())
  }, [])

  const oracleRevardsTotal = useMemo(
    () =>
      satelliteLedger.reduce((acc, { oracleRecords }) => {
        if (oracleRecords.length) {
          const sMVKReward = oracleRecords.reduce((acc, { sMVKReward = 0 }) => (acc += sMVKReward), 0)
          acc += sMVKReward * exchangeRate
        }
        return acc
      }, 0),
    [exchangeRate, satelliteLedger],
  )

  return (
    <TabWrapperStyled className="oracles" backgroundImage="dashboard_oraclesTab_bg.png">
      <div className="top">
        <BGPrimaryTitle>Oracles</BGPrimaryTitle>
        <Link to="/satellites">
          <Button text="Oracle Feeds" icon="plant" kind={ACTION_PRIMARY} className="noStroke dashboard-sectionLink" />
        </Link>
      </div>

      <OraclesContentStyled>
        <div className="top">
          <StatBlock>
            <div className="name">Total Oracle Rewards Paid</div>
            <div className="value">
              <CommaNumber beginningText="$" value={oracleRevardsTotal} />
            </div>
          </StatBlock>
          <StatBlock>
            <div className="name">Total Oracle Feeds</div>
            <div className="value">
              <CommaNumber value={oracleFeeds} />
            </div>
          </StatBlock>
        </div>

        <div className="block-name">Popular Feeds</div>

        <div className="feeds-grid">
          {popularFeeds.map((feed) => (
            <Link to={`/satellites/feed-details/${feed.address}`}>
              <div className="row" key={feed.address}>
                <StatBlock className="icon-first">
                  <CoinsLogo assetName={feed.token_1_symbol} className="feed-token" />
                  <div className="name">Feed</div>
                  <div className="value">
                    {feed.token_1_symbol}/{feed.token_0_symbol}
                  </div>
                </StatBlock>
                <StatBlock>
                  <div className="name">Answer</div>
                  <div className="value">
                    <CommaNumber beginningText="$" value={feed.last_completed_data} />
                  </div>
                </StatBlock>
                <StatBlock>
                  <div className="name">Contract Address</div>
                  <div className="value">
                    <TzAddress type={BLUE} tzAddress={feed.address} hasIcon />
                  </div>
                </StatBlock>
                <StatBlock>
                  <div className="name">Date/Time</div>
                  <div className="value">
                    {parseDate({ time: feed.last_completed_data_last_updated_at, timeFormat: 'DD MMM YYYY / HH:mm' })}
                  </div>
                </StatBlock>
              </div>
            </Link>
          ))}
        </div>
      </OraclesContentStyled>

      <div className="descr">
        <div className="title">What are Oracles?</div>
        <div className="text">
          Satellites are nodes of Mavryk's decentralized oracle. Oracles provide price data for the asset classes that
          can be used as collateral for the CDPs (XTZ, wWBTC, wWETH, etc.). Satellites that provide Oracle pricing
          information earn sMVK. <a href="#">Read more</a>
        </div>
      </div>
    </TabWrapperStyled>
  )
}
