import * as React from 'react'
import { useEffect } from 'react'

import { CalculatorView } from './components/Calculator/Calculator.view'
import { FeaturesView } from './components/Features/Features.view'
import { GovernanceView } from './components/Governance/Governance.view'
import { HighligthsView } from './components/Highligths/Highligths.view'
import { JumbotronView } from './components/Jumbotron/Jumbotron.view'
import { NewsletterView } from './components/Newsletter/Newsletter.view'
import { PartnersView } from './components/Partners/Partners.view'
import { SatellitesView } from './components/Satellites/Satellites.view'
import { TokenomicsView } from './components/Tokenomics/Tokenomics.view'
import { HomeStyled } from './Home.style'

export const HomeView = () => {
  useEffect(() => {
    window.scroll(0, 0)
  }, [])

  return (
    <HomeStyled>
      <JumbotronView />
      <PartnersView />
      <CalculatorView />
      <FeaturesView />
      <SatellitesView />
      <HighligthsView />
      <GovernanceView />
      <TokenomicsView />
      <NewsletterView />
    </HomeStyled>
  )
}
