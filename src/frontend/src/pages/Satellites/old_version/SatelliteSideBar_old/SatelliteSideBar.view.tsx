import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import * as React from 'react'
// components
import { TzAddress } from '../../../../app/App.components/TzAddress/TzAddress.view'

import { RoutingButton } from '../../../../app/App.components/RoutingButton/RoutingButton.controller'
import {
  FAQLink,
  SatelliteSideBarStyled,
  SideBarSection,
  SideBarItem,
  SideBarFaq,
} from '../../SatellitesSideBar/SatelliteSideBar.style'

type SatelliteSideBarProps = {
  userIsSatellite: boolean
  numberOfSatellites: number
  totalDelegatedMVK: number
  satelliteFactory: string
  isButton: boolean
}

export const SateliteSideBarFAQ = () => (
  <SideBarFaq>
    <h2>Satellite FAQ</h2>
    <FAQLink>
      <a href="https://mavryk.finance/litepaper#satellite-delegations" target="_blank" rel="noreferrer">
        What is vote delegation and how does it work?
      </a>
    </FAQLink>
    <FAQLink>
      <a
        href="https://mavryk.finance/litepaper#satellites-governance-and-the-decentralized-oracle"
        target="_blank"
        rel="noreferrer"
      >
        What are the requirements for becoming a Satellite?
      </a>
    </FAQLink>
    <FAQLink>
      <a href="https://mavryk.finance/litepaper#mvk-and-vmvk-doorman-module" target="_blank" rel="noreferrer">
        MVK token holder’s delegation agreement
      </a>
    </FAQLink>
    <FAQLink>
      <a href="https://mavryk.finance/litepaper#mvk-and-vmvk-doorman-module" target="_blank" rel="noreferrer">
        The MVK holder’s guide to delegation
      </a>
    </FAQLink>
    <FAQLink>
      <a href="https://mavryk.finance/litepaper#mvk-and-vmvk-doorman-module" target="_blank" rel="noreferrer">
        Recognized delegate code of conduct
      </a>
    </FAQLink>
  </SideBarFaq>
)

export const SatelliteSideBarView = ({
  userIsSatellite,
  numberOfSatellites,
  totalDelegatedMVK,
  satelliteFactory,
  isButton,
}: SatelliteSideBarProps) => {
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

        <h2>Statistics</h2>
        <SideBarItem>
          <h3>Satellite Factory</h3>
          <var>
            <TzAddress tzAddress={satelliteFactory} hasIcon />
          </var>
        </SideBarItem>
        <SideBarItem>
          <h3>Number of Satellites</h3>
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
      </SideBarSection>

      <SateliteSideBarFAQ />
    </SatelliteSideBarStyled>
  )
}
