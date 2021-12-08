import { Button } from 'app/App.components/Button/Button.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import * as React from 'react'
import { Link } from 'react-router-dom'
import { FAQLink, SatelliteSideBarStyled, SideBarSection } from './SatelliteSideBar.style'

export const SatelliteSideBar = () => {
  //TODO: Missing the actual satellite factory address
  const satelliteFactoryAddress = 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb'
  return (
    <SatelliteSideBarStyled>
      <Link to="/become-satellite">
        <Button icon="satellite" text="Become a Satellite" />
      </Link>
      <br />
      <SideBarSection>
        <h2>Statistics</h2>
        <div>
          <h3>Satellite Factory</h3>
          <TzAddress tzAddress={satelliteFactoryAddress} type={'primary'} hasIcon={false} />
        </div>
        <div>
          <h3>Number of Satellites</h3>
          <p>12</p>
        </div>
        <div>
          <h3>Total MVK delegated</h3>
          <p>300</p>
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
