import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { RoutingButton } from 'app/App.components/RoutingButton/RoutingButton.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { SatelliteSideBarStyled, SideBarSection, SideBarItem, FAQLink, SideBarFaq } from './SatelliteSideBar.style'
import React from 'react'

type OraclesSideBarProps = {
  userIsSatellite: boolean
  numberOfSatellites: number
  totalDelegatedMVK: number
  totalOracleNetworks: number
  averageRevard?: number
  satelliteFactory: string
  isButton: boolean
  infoBlockAddresses: {
    satellite: string
    oracle: string
    aggregator: string
  }
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
// TODO: Satellite Contract (sometimes it's '' cuz do not have it in state), Oracle Contract, On-Chain Data Points, Total Value Secured, Average Rewards per Oracle
const SatellitesSideBarView = ({
  userIsSatellite,
  isButton,
  totalDelegatedMVK,
  numberOfSatellites,
  totalOracleNetworks,
  infoBlockAddresses,
  averageRevard,
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
            <TzAddress tzAddress={infoBlockAddresses.satellite} hasIcon={false} />
          </var>
        </SideBarItem>
        <SideBarItem>
          <h3>Oracle Contract</h3>
          <var>
            NO DATA
            {/* <TzAddress tzAddress={infoBlockAddresses.oracle} hasIcon={false} /> */}
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
          <h3>On-Chain Data Points</h3>
          <var>
            NO DATA
            {/* <CommaNumber value={numberOfSatellites} showDecimal={false} /> */}
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
          <h3>Total Value Secured</h3>
          <var>NO DATA</var>
        </SideBarItem>
        <SideBarItem>
          <h3>Average Rewards per Oracle</h3>
          <var>{averageRevard ? <CommaNumber value={averageRevard} endingText={'MVK'} /> : '-'}</var>
        </SideBarItem>
      </SideBarSection>

      <SateliteSideBarFAQ />
    </SatelliteSideBarStyled>
  )
}

export default SatellitesSideBarView
