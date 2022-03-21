import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import * as React from 'react'

import { FAQLink, SatelliteSideBarStyled, SideBarSection } from './SatelliteSideBar.style'
import { RoutingButton } from '../../../app/App.components/RoutingButton/RoutingButton.controller'

type SatelliteSideBarProps = {
  userIsSatellite: boolean
  numberOfSatellites: number
  totalDelegatedMVK: number
}
export const SatelliteSideBarView = ({
  userIsSatellite,
  numberOfSatellites,
  totalDelegatedMVK,
}: SatelliteSideBarProps) => {
  return (
    <SatelliteSideBarStyled>
      <RoutingButton
        icon="satellite"
        text={userIsSatellite ? 'Edit Satellite Profile' : 'Become a Satellite'}
        pathName={`/become-satellite`}
        pathParams={{ userIsSatellite: userIsSatellite }}
      />
      {/*{userIsSatellite ? (*/}
      {/*  <Link to={{ pathname: `/become-satellite`, userIsSatellite }}>*/}
      {/*    <Button icon="satellite" text="Edit Satellite Profile" />*/}
      {/*  </Link>*/}
      {/*) : (*/}
      {/*  <Link to="/become-satellite">*/}
      {/*    <Button icon="satellite" text="Become a Satellite" />*/}
      {/*  </Link>*/}
      {/*)}*/}

      <br />
      <SideBarSection>
        <h2>Statistics</h2>
        <div>
          <h3>Number of Satellites</h3>
          <CommaNumber value={numberOfSatellites} showDecimal={false} />
        </div>
        <div>
          <h3>Total MVK delegated</h3>
          <CommaNumber value={totalDelegatedMVK} endingText={'MVK'} />
        </div>
      </SideBarSection>
      <SideBarSection>
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
            The MVK holder’s guide to delegation
          </a>
        </FAQLink>
        <FAQLink>
          <a href="https://mavryk.finance/litepaper#mvk-and-vmvk-doorman-module" target="_blank" rel="noreferrer">
            MVK token holder’s delegation agreement
          </a>
        </FAQLink>
        <FAQLink>
          <a href="https://mavryk.finance/litepaper#mvk-and-vmvk-doorman-module" target="_blank" rel="noreferrer">
            Recognized delegate code of conduct
          </a>
        </FAQLink>
      </SideBarSection>
    </SatelliteSideBarStyled>
  )
}
