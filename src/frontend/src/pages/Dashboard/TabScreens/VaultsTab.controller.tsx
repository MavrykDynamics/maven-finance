import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import { BGTitle } from 'pages/BreakGlass/BreakGlass.style'
import React from 'react'
import { TabWrapperStyled } from './DashboardTabs.style'

export const VaultsTab = () => {
  return (
    <TabWrapperStyled className="vaults">
      <div className="top">
        <BGTitle>Vaults</BGTitle>
        <Button text="Vaults" icon="vaults" kind={ACTION_PRIMARY} className="noStroke" />
      </div>

      <div className="descr">
        <div className="title">What is a Vault?</div>
        <div className="text">
          The treasury is managed by the Mavryk DAO through on chain voting. Governance votes, whether for the business
          logic or upgrades to the Mavryk ecosystem, are rewarded with a portion of the earned income from the on-chain
          Treasury <a href="#">Read more</a>
        </div>
      </div>
    </TabWrapperStyled>
  )
}
