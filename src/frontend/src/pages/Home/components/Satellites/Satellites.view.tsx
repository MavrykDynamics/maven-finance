import * as React from 'react'

import { SatellitesImage, SatellitesStyled } from './Satellites.style'

export const SatellitesView = () => {
  return (
    <SatellitesStyled id="satellites">
      <h1>Satellites: Decentralized Governance & Oracles</h1>
      <SatellitesImage />
    </SatellitesStyled>
  )
}
