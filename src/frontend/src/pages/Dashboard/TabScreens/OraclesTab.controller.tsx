import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import { BGTitle } from 'pages/BreakGlass/BreakGlass.style'
import React from 'react'
import { TabWrapperStyled } from './DashboardTabs.style'

export const OraclesTab = () => {
  return (
    <TabWrapperStyled className="oracles" backgroundImage="dashboard_oraclesTab_bg.png">
      <div className="top">
        <BGTitle>Oracles</BGTitle>
        <Button text="Oracle Feeds" icon="plant" kind={ACTION_PRIMARY} className="noStroke" />
      </div>

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
