import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { BGTitle } from 'pages/BreakGlass/BreakGlass.style'
import React from 'react'
import { StatBlock } from '../Dashboard.style'
import { SatellitesContentStyled, TabWrapperStyled } from './DashboardTabs.style'

export const SatellitesTab = () => {
  return (
    <TabWrapperStyled backgroundImage="dashboard_satelliteTab_bg.png">
      <div className="top">
        <BGTitle>Satellites</BGTitle>
        <Button text="Satellite" icon="satellite" kind={ACTION_PRIMARY} className="noStroke" />
      </div>

      <SatellitesContentStyled>
        <StatBlock>
          <div className="name">Active Satellites</div>
          <div className="value">
            <CommaNumber value={88} />
          </div>
        </StatBlock>

        <StatBlock>
          <div className="name">Avg. Delegated sMVK</div>
          <div className="value">
            <CommaNumber endingText="sMVK" value={1043242} />
          </div>
        </StatBlock>

        <StatBlock>
          <div className="name">Avg Free sMVK Space</div>
          <div className="value">
            <CommaNumber endingText="sMVK" value={1043242} />
          </div>
        </StatBlock>

        <StatBlock>
          <div className="name">Avg Delegation Fee</div>
          <div className="value">
            <CommaNumber endingText="%" value={7} />
          </div>
        </StatBlock>

        <StatBlock>
          <div className="name">Avg. MVK Staked</div>
          <div className="value">
            <CommaNumber endingText="sMVK" value={1043242} />
          </div>
        </StatBlock>

        <StatBlock>
          <div className="name">Participation Rate</div>
          <div className="value">
            <CommaNumber endingText="%" value={87} />
          </div>
        </StatBlock>
      </SatellitesContentStyled>

      <div className="descr">
        <div className="title">What are Satellites?</div>
        <div className="text">
          Satellites are nodes that administer the Mavryk platform (similarly to Bakers on Tezos). A Satellite can act
          on its own behalf and can receive delegations on behalf of others.
          <br />
          <br />
          To operate a Mavryk Satellite, a user needs to stake a security deposit in MVK as a bond, which the user can
          buy on the open market or earn by participating in the ecosystem (e.g. through yield farming, or MVK returned
          on DSR savings <a href="#">Read more</a>
        </div>
      </div>
    </TabWrapperStyled>
  )
}
