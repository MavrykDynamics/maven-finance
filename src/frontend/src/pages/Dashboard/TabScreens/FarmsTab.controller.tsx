import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { BGTitle } from 'pages/BreakGlass/BreakGlass.style'
import React from 'react'
import { FarmsContentStyled, TabWrapperStyled } from './DashboardTabs.style'

const farmsData = [
  {
    name: 'MVK-zUSD',
    subName: 'Quipuswap LP',
    apr: 23.65,
    earn: 'sMVK + Fees',
    endDateTime: Date.now(),
  },
  {
    name: 'MVK-zUSD',
    subName: 'Quipuswap LP',
    apr: 23.65,
    earn: 'sMVK + Fees',
    endDateTime: Date.now(),
  },
  {
    name: 'MVK-zUSD',
    subName: 'Quipuswap LP',
    apr: 23.65,
    earn: 'sMVK + Fees',
    endDateTime: Date.now(),
  },
  {
    name: 'MVK-zUSD',
    subName: 'Quipuswap LP',
    apr: 23.65,
    earn: 'sMVK + Fees',
    endDateTime: Date.now(),
  },
  {
    name: 'MVK-zUSD',
    subName: 'Quipuswap LP',
    apr: 23.65,
    earn: 'sMVK + Fees',
    endDateTime: Date.now(),
  },
]

export const FarmsTab = () => {
  return (
    <TabWrapperStyled backgroundImage="dashboard_farmsTab_bg.png">
      <div className="top">
        <BGTitle>Yield Farms</BGTitle>
        <Button text="Farms" icon="plant" kind={ACTION_PRIMARY} className="noStroke" />
      </div>

      <FarmsContentStyled className="scroll-block">
        {farmsData.map((item) => (
          <div className="card">
            <div className="top">
              <div className="name">
                <div className="large">{item.name}</div>
                {item.subName}
              </div>

              <Icon id="goldSilverCoinsMVK" />
            </div>

            <div className="row-info">
              <div className="name">APR: </div>
              <div className="value">{item.apr}</div>
            </div>

            <div className="row-info">
              <div className="name">Earn: </div>
              <div className="value">{item.earn}</div>
            </div>

            <div className="row-info">
              <div className="name">Ends in: </div>
              <div className="value">{item.endDateTime}</div>
            </div>
          </div>
        ))}
      </FarmsContentStyled>

      <div className="descr">
        <div className="title">What is Yield Farming?</div>
        <div className="text">
          Liquidity providers will be able to stake their LP tokens within yield farms to receive sMVK as an incentive.
          The amount of sMVK rewards depends on how long the LP tokens are staked. By default, Mavryk farms are spawned
          for three months. <a href="#">Read more</a>
        </div>
      </div>
    </TabWrapperStyled>
  )
}
