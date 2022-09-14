import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { CoinsLogo } from 'app/App.components/Icon/CoinsIcons.view'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { coinGeckoClient } from 'app/App.controller'
import { BGTitle } from 'pages/BreakGlass/BreakGlass.style'
import { getDate_DMYHM_Format } from 'pages/FinacialRequests/FinancialRequests.helpers'
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { State } from 'reducers'
import { StatBlock } from '../Dashboard.style'
import { OraclesContentStyled, TabWrapperStyled } from './DashboardTabs.style'

export const OraclesTab = () => {
  const { feeds } = useSelector((state: State) => state.oracles.oraclesStorage)
  const { exchangeRate } = useSelector((state: State) => state.mvkToken)
  const { satelliteLedger = [] } = useSelector((state: State) => state.delegation.delegationStorage)

  const oracleFeeds = feeds.length
  // TODO: extract is to mvkToken reducer in future?
  const [xtzRate, setXTZRate] = useState(0)
  const popularFeeds = useMemo(() => feeds.splice(0, 3), [feeds])

  useEffect(() => {
    ;(async function fetchXtzRate() {
      const xtzRate = (
        await coinGeckoClient.simple.price({
          ids: ['tezos'],
          vs_currencies: ['usd'],
        })
      ).data

      setXTZRate(xtzRate?.tezos?.usd || 0)
    })()
  }, [])

  const oracleRevardsTotal = useMemo(
    () =>
      satelliteLedger.reduce(
        (acc, { oracleRecords }) => {
          if (oracleRecords.length) {
            const { sMVKReward, XTZReward } = oracleRecords.reduce(
              (acc, { sMVKReward = 0, XTZReward = 0 }) => {
                acc.XTZReward += XTZReward
                acc.sMVKReward += sMVKReward

                return acc
              },
              { sMVKReward: 0, XTZReward: 0 },
            )

            acc.sMVKRewards += sMVKReward * exchangeRate
            acc.XTZReward += XTZReward * xtzRate
          }
          return acc
        },
        { sMVKRewards: 0, XTZReward: 0 },
      ),
    [satelliteLedger],
  )

  const history = useHistory()

  return (
    <TabWrapperStyled className="oracles" backgroundImage="dashboard_oraclesTab_bg.png">
      <div className="top">
        <BGTitle>Oracles</BGTitle>
        <Button
          text="Oracle Feeds"
          icon="plant"
          kind={ACTION_PRIMARY}
          className="noStroke"
          onClick={() => history.push('/satellites')}
        />
      </div>

      <OraclesContentStyled>
        <div className="top">
          <StatBlock>
            <div className="name">Total Oracle Rewards Paid</div>
            <div className="value">
              <CommaNumber beginningText="$" value={oracleRevardsTotal.XTZReward | oracleRevardsTotal.sMVKRewards} />
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
            <div className="row">
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
                  <CommaNumber beginningText="$" value={feed.last_completed_round_price} />
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
                <div className="value">{getDate_DMYHM_Format(feed.creation_timestamp)}</div>
              </StatBlock>
            </div>
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
