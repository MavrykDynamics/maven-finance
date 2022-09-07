import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { BGTitle } from 'pages/BreakGlass/BreakGlass.style'
import React from 'react'
import { StatBlock } from '../Dashboard.style'
import { OraclesContentStyled, TabWrapperStyled } from './DashboardTabs.style'

const feedsMocked = [
  {
    name: 'XTZ/USD',
    answer: 123432,
    address: 'retregdsfgfdsgfsdgdsfgfsd',
    date: Date.now(),
  },
  {
    name: 'XTZ/USD',
    answer: 123432,
    address: 'retregdsfgfdsgfsdgdsfgfsd',
    date: Date.now(),
  },
  {
    name: 'XTZ/USD',
    answer: 123432,
    address: 'retregdsfgfdsgfsdgdsfgfsd',
    date: Date.now(),
  },
]

export const OraclesTab = () => {
  return (
    <TabWrapperStyled className="oracles" backgroundImage="dashboard_oraclesTab_bg.png">
      <div className="top">
        <BGTitle>Oracles</BGTitle>
        <Button text="Oracle Feeds" icon="plant" kind={ACTION_PRIMARY} className="noStroke" />
      </div>

      <OraclesContentStyled>
        <div className="top">
          <StatBlock>
            <div className="name">Total Oracle Rewards Paid</div>
            <div className="value">
              <CommaNumber beginningText="$" value={124141} />
            </div>
          </StatBlock>
          <StatBlock>
            <div className="name">Total Oracle Feeds</div>
            <div className="value">
              <CommaNumber value={12} />
            </div>
          </StatBlock>
        </div>

        <div className="block-name">Popular Feeds</div>

        <div className="feeds-grid">
          {feedsMocked.map((feed) => (
            <div className="row">
              <StatBlock className="icon-first">
                <Icon id="mvkTokenGold" className="feed-token" />
                <div className="name">Feed</div>
                <div className="value">{feed.name}</div>
              </StatBlock>
              <StatBlock>
                <div className="name">Answer</div>
                <div className="value">
                  <CommaNumber beginningText="$" value={feed.answer} />
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
                  <CommaNumber value={12} />
                </div>
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
