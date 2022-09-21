import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { BGTitle } from 'pages/BreakGlass/BreakGlass.style'
import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { State } from 'reducers'
import { SatelliteRecord } from 'utils/TypesAndInterfaces/Delegation'
import { StatBlock } from '../Dashboard.style'
import { SatellitesContentStyled, TabWrapperStyled } from './DashboardTabs.style'

export const SatellitesTab = () => {
  const { satelliteLedger } = useSelector((state: State) => state.delegation.delegationStorage)

  const satellitesInfo = satelliteLedger.reduce(
    (acc, satellite: SatelliteRecord) => {
      if (satellite.status !== 0) return acc

      acc.activeSatellites += 1
      acc.avgFee += satellite.satelliteFee
      acc.avgStakedMVK += satellite.sMvkBalance
      acc.partisipationRate += satellite.participation || 0
      acc.avgFreesMVKSpace += Math.max(
        satellite.sMvkBalance * satellite.delegationRatio - satellite.totalDelegatedAmount,
        0,
      )
      acc.avgDelegatedsMVK += satellite.sMvkBalance + satellite.totalDelegatedAmount

      return acc
    },
    {
      activeSatellites: 0,
      avgFee: 0,
      avgDelegatedsMVK: 0,
      avgStakedMVK: 0,
      partisipationRate: 0,
      avgFreesMVKSpace: 0,
    },
  )

  satellitesInfo.avgFee = satellitesInfo.avgFee / satellitesInfo.activeSatellites
  satellitesInfo.avgStakedMVK = satellitesInfo.avgStakedMVK / satellitesInfo.activeSatellites
  satellitesInfo.partisipationRate = satellitesInfo.partisipationRate / satellitesInfo.activeSatellites
  satellitesInfo.avgFreesMVKSpace = satellitesInfo.avgFreesMVKSpace / satellitesInfo.activeSatellites
  satellitesInfo.avgDelegatedsMVK = satellitesInfo.avgDelegatedsMVK / satellitesInfo.activeSatellites

  return (
    <TabWrapperStyled backgroundImage="dashboard_satelliteTab_bg.png">
      <div className="top">
        <BGTitle>Satellites</BGTitle>
        <Link to="/satellites">
          <Button text="Satellite" icon="satellite" kind={ACTION_PRIMARY} className="noStroke" />
        </Link>
      </div>

      <SatellitesContentStyled>
        <StatBlock>
          <div className="name">Active Satellites</div>
          <div className="value">
            <CommaNumber value={satellitesInfo.activeSatellites} />
          </div>
        </StatBlock>

        <StatBlock>
          <div className="name">Avg. Delegated sMVK</div>
          <div className="value">
            <CommaNumber endingText="sMVK" value={satellitesInfo.avgDelegatedsMVK} />
          </div>
        </StatBlock>

        <StatBlock>
          <div className="name">Avg Free sMVK Space</div>
          <div className="value">
            <CommaNumber endingText="sMVK" value={satellitesInfo.avgFreesMVKSpace} />
          </div>
        </StatBlock>

        <StatBlock>
          <div className="name">Avg Delegation Fee</div>
          <div className="value">
            <CommaNumber endingText="%" value={satellitesInfo.avgFee} />
          </div>
        </StatBlock>

        <StatBlock>
          <div className="name">Avg. MVK Staked</div>
          <div className="value">
            <CommaNumber endingText="sMVK" value={satellitesInfo.avgStakedMVK} />
          </div>
        </StatBlock>

        <StatBlock>
          <div className="name">Participation Rate</div>
          <div className="value">
            <CommaNumber endingText="%" value={satellitesInfo.partisipationRate} />
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
