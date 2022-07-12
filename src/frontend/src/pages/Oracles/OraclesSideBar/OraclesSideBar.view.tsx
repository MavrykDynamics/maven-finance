import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { RoutingButton } from 'app/App.components/RoutingButton/RoutingButton.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import {
  SatelliteSideBarStyled,
  SideBarSection,
  SideBarItem,
  SideBarFaq,
  FAQLink,
} from 'pages/Satellites/SatelliteSideBar/SatelliteSideBar.style'
import { SateliteSideBarFAQ } from 'pages/Satellites/SatelliteSideBar/SatelliteSideBar.view'
import React from 'react'

type OraclesSideBarProps = {
  userIsSatellite: boolean
  numberOfSatellites: number
  totalDelegatedMVK: number
  satelliteFactory: string
  isButton: boolean
}

const OraclesSideBarView = ({
  userIsSatellite,
  isButton,
  totalDelegatedMVK,
  numberOfSatellites,
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
          <h3>Satellite Contract</h3>
          <var>
            <CommaNumber value={numberOfSatellites} showDecimal={false} />
          </var>
        </SideBarItem>
        <SideBarItem>
          <h3>Oracle Contract</h3>
          <var>
            <CommaNumber value={totalDelegatedMVK} endingText={'MVK'} />
          </var>
        </SideBarItem>
        <SideBarItem>
          <h3>Aggregator Contract</h3>
          <var>
            <CommaNumber value={totalDelegatedMVK} endingText={'MVK'} />
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
          <h3>On-Chain Data Points</h3>
          <var>
            <CommaNumber value={numberOfSatellites} showDecimal={false} />
          </var>
        </SideBarItem>
        <SideBarItem>
          <h3>Total Oracle Networks</h3>
          <var>
            <CommaNumber value={numberOfSatellites} showDecimal={false} />
          </var>
        </SideBarItem>
        <SideBarItem>
          <h3>Total MVK delegated</h3>
          <var>
            <CommaNumber value={totalDelegatedMVK} endingText={'MVK'} />
          </var>
        </SideBarItem>
        <SideBarItem>
          <h3>Total Value Secured</h3>
          <var>-</var>
        </SideBarItem>
        <SideBarItem>
          <h3>Average Rewards per Oracle</h3>
          <var>-</var>
        </SideBarItem>
      </SideBarSection>

      <SateliteSideBarFAQ />
    </SatelliteSideBarStyled>
  )
}

export default OraclesSideBarView
