import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import { BGTitle } from 'pages/BreakGlass/BreakGlass.style'
import React from 'react'
import { TabWrapperStyled } from './DashboardTabs.style'

export const FarmsTab = () => {
  return (
    <TabWrapperStyled backgroundImage="dashboard_farmsTab_bg.png">
      <div className="top">
        <BGTitle>Yield Farms</BGTitle>
        <Button text="Farms" icon="plant" kind={ACTION_PRIMARY} className="noStroke" />
      </div>

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
