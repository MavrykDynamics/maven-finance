import { getDelegationStorage, setChosenSatellite } from 'pages/Satellites/Satellites.actions'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { SatelliteRecord } from 'reducers/delegation'

import { SatelliteDetailsView } from './SatelliteDetails.view'

export const SatelliteDetails = (props: any) => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { chosenSatellite } = useSelector((state: State) => state.routing)
  const { delegationStorage } = useSelector((state: State) => state.delegation)
  const { satelliteLedger } = delegationStorage
  const [satellite, setSatellite] = useState<any>(chosenSatellite)

  useEffect(() => {
    let isMounted = true
    dispatch(getDelegationStorage())
    if (!chosenSatellite) {
      const pathAddress = props.match.params.satelliteId
      const neededSatellite = satelliteLedger.filter((item: SatelliteRecord) => item.address === pathAddress)[0]
      setSatellite(neededSatellite)
      dispatch(setChosenSatellite(neededSatellite))
    }
    return () => {
      isMounted = false
    }
  }, [chosenSatellite, dispatch, props, satelliteLedger])

  const delegateCallback = () => {
    console.log('Here in delegate callback')
  }

  const undelegateCallback = () => {
    console.log('Here in undelegate callback')
  }

  return (
    <SatelliteDetailsView
      satellite={satellite}
      loading={loading}
      delegateCallback={delegateCallback}
      undelegateCallback={undelegateCallback}
    />
  )
}
