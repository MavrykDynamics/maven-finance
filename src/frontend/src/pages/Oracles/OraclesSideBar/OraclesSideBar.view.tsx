import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { RoutingButton } from 'app/App.components/RoutingButton/RoutingButton.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import {
  SatelliteSideBarStyled,
  SideBarSection,
  SideBarItem,
} from 'pages/Satellites/SatelliteSideBar/SatelliteSideBar.style'
import { SateliteSideBarFAQ } from 'pages/Satellites/SatelliteSideBar/SatelliteSideBar.view'
import React from 'react'

type OraclesSideBarProps = {
  userIsSatellite: boolean
  numberOfSatellites: number
  totalDelegatedMVK: number
  totalOracleNetworks: number
  satelliteFactory: string
  isButton: boolean
  infoBlockAddresses: {
    satellite: string
    oracle: string
    aggregator: string
  }
}

const OraclesSideBarView = ({
  userIsSatellite,
  isButton,
  totalDelegatedMVK,
  numberOfSatellites,
  totalOracleNetworks,
  infoBlockAddresses,
}: OraclesSideBarProps) => {
  return (
    <SatelliteSideBarStyled>
      <SideBarSection>
        {isButton ? (
          <RoutingButton
            icon="satellite-stroke"
            text={userIsSatellite ? 'Edit Satellite Profile' : 'Become a Satellite'}
            pathName={`/become-satellite`}
            pathParams={{ userIsSatellite: userIsSatellite }}
          />
        ) : null}

        <h2>Info</h2>
        <SideBarItem>
          <h3>Satellite Contract (fix)</h3>
          <var>
            <TzAddress tzAddress={infoBlockAddresses.satellite} hasIcon={false} />
          </var>
        </SideBarItem>
        <SideBarItem>
          <h3>Oracle Contract (fix)</h3>
          <var>
            <TzAddress tzAddress={infoBlockAddresses.oracle} hasIcon={false} />
          </var>
        </SideBarItem>
        <SideBarItem>
          <h3>Aggregator Contract</h3>
          <var>
            <TzAddress tzAddress={infoBlockAddresses.aggregator} hasIcon={false} />
          </var>
        </SideBarItem>
      </SideBarSection>

      <SideBarSection>
        <h2>Statistics</h2>
        <SideBarItem>
          <h3>Number of Satellites</h3>
          <var>
            <CommaNumber value={numberOfSatellites} showDecimal={false} />
          </var>
        </SideBarItem>
        <SideBarItem>
          <h3>On-Chain Data Points (fix)</h3>
          <var>
            <CommaNumber value={numberOfSatellites} showDecimal={false} />
          </var>
        </SideBarItem>
        <SideBarItem>
          <h3>Total Oracle Networks</h3>
          <var>
            <CommaNumber value={totalOracleNetworks} showDecimal={false} />
          </var>
        </SideBarItem>
        <SideBarItem>
          <h3>Total MVK delegated</h3>
          <var>
            <CommaNumber value={totalDelegatedMVK} endingText={'MVK'} />
          </var>
        </SideBarItem>
        <SideBarItem>
          <h3>Total Value Secured (fix)</h3>
          <var>-</var>
        </SideBarItem>
        <SideBarItem>
          <h3>Average Rewards per Oracle (fix)</h3>
          <var>-</var>
        </SideBarItem>
      </SideBarSection>

      <SateliteSideBarFAQ />
    </SatelliteSideBarStyled>
  )
}

export default OraclesSideBarView
