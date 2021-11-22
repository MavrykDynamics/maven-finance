import { useSelector } from 'react-redux'
import { State } from 'reducers'

import { SatellitesHeaderStyled } from './SatellitesHeader.style'

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
