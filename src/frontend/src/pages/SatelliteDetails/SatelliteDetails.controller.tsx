import { Loader } from 'app/App.components/Loader/Loader.view'
import { getDelegationStorage } from 'pages/Satellites/Satellites.actions'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { State } from 'reducers'
import { SatelliteRecord } from 'reducers/delegation'

import { SatelliteDetailsView } from './SatelliteDetails.view'

export const SatelliteDetails = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const loading = useSelector((state: State) => state.loading)
  const { delegationStorage } = useSelector((state: State) => state.delegation)
  const pathAddress = location.pathname?.substring(location.pathname?.lastIndexOf('/') + 1)
  const [satellite, setSatellite] = useState<SatelliteRecord | undefined>(
    getDesiredSatellite(pathAddress, delegationStorage.satelliteLedger),
  )

  useEffect(() => {
    dispatch(getDelegationStorage())
  }, [delegationStorage, dispatch])

  useEffect(() => {
    if (!satellite) {
      const neededSatellite = getDesiredSatellite(pathAddress, delegationStorage.satelliteLedger)
      const satelliteToSend: SatelliteRecord = neededSatellite
        ? neededSatellite
        : {
            address: 'None',
            name: 'None',
            image: 'None',
            description: 'None',
            satelliteFee: 'None',
            status: false,
            mvkBalance: '',
            totalDelegatedAmount: '',
            registeredDateTime: new Date(),
            unregisteredDateTime: new Date(),
          }
      setSatellite(satelliteToSend)
    }
  }, [satellite, pathAddress, delegationStorage.satelliteLedger])

  const delegateCallback = () => {
    console.log('Here in delegate callback')
  }

  const undelegateCallback = () => {
    console.log('Here in undelegate callback')
  }

  //Note: Rendering it like this as I was gettign weird VScode errors that didn't make sense when trying to do normal conditional rendering in React
  return (
    <SatelliteDetailsView
      satellite={satellite}
      loading={loading}
      delegateCallback={delegateCallback}
      undelegateCallback={undelegateCallback}
    />
  )
}

function getDesiredSatellite(satelliteAddress: string, satelliteLedger: SatelliteRecord[]): SatelliteRecord {
  return satelliteLedger?.filter((item: SatelliteRecord) => item.address === satelliteAddress)[0]
}
