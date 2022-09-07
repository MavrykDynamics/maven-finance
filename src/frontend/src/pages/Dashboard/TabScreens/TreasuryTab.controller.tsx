import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import { BGTitle } from 'pages/BreakGlass/BreakGlass.style'
import React from 'react'
import { TabWrapperStyled } from './DashboardTabs.style'

export const TreasuryTab = () => {
  return (
    <TabWrapperStyled backgroundImage="dashboard_treasuryTab_bg.png">
      <div className="top">
        <BGTitle>Treasury</BGTitle>
        <Button text="Treasury" icon="treasury" kind={ACTION_PRIMARY} className="noStroke" />
      </div>

      <div className="descr">
        <div className="title">What is the purpose of the Treasury?</div>
        <div className="text">
          The treasury is managed by the Mavryk DAO through on chain voting. Governance votes, whether for the business
          logic or upgrades to the Mavryk ecosystem, are rewarded with a portion of the earned income from the on-chain
          Treasury. <a href="#">Read more</a>
        </div>
      </div>
    </TabWrapperStyled>
  )
}
