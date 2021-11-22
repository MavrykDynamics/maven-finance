import { gsap } from 'gsap'
import { Fragment, useEffect, useState } from 'react'
import { Controls, PlayState, Timeline, Tween } from 'react-gsap'
// prettier-ignore
import { useSelector } from "react-redux";
import { State } from 'reducers'

//prettier-ignore
import { SatellitesHeaderAnimation, SatellitesHeaderPortal, SatellitesHeaderShip, SatellitesHeaderShipComing, SatellitesHeaderShipFlamePart, SatellitesHeaderShipGoing, SatellitesHeaderShipMainPart, SatellitesHeaderStyled } from './SatellitesHeader.style'

type SatellitesHeaderViewProps = {}

export const SatellitesHeaderView = ({}: SatellitesHeaderViewProps) => {
  const loading = useSelector((state: State) => state.loading)

  return (
    <SatellitesHeaderStyled>
      <h1>Satellites</h1>
      <p>Delegate your voting power to satellites and earn rewards</p>
      <img alt="satellite" src="/images/satellite.svg" />
    </SatellitesHeaderStyled>
  )
}
