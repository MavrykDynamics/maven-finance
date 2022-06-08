import { delegate, getDelegationStorage, undelegate } from 'pages/Satellites/Satellites.actions'
import * as React from 'react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { State } from 'reducers'

import { SatelliteDetailsView } from './SatelliteDetails.view'
import { SatelliteRecord } from '../../utils/TypesAndInterfaces/Delegation'
import { getSatelliteByAddress } from './SatelliteDetails.actions'

export const SatelliteDetails = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const loading = useSelector((state: State) => state.loading)
  const { delegationStorage, currentSatellite } = useSelector((state: State) => state.delegation)
  // const pathAddress = location.pathname?.substring(location.pathname?.lastIndexOf('/') + 1)
  // const neededSatellite = currentSatellite
  const { user } = useSelector((state: State) => state.user)

  useEffect(() => {
    const pathAddress = location.pathname?.substring(location.pathname?.lastIndexOf('/') + 1)
    dispatch(getSatelliteByAddress(pathAddress))
    dispatch(getDelegationStorage())
  }, [dispatch, location])

  const delegateCallback = (address: string) => {
    dispatch(delegate(address))
  }

  const undelegateCallback = (address: string) => {
    dispatch(undelegate(address))
  }

  console.log('%c ||||| currentSatellite', 'color:red', currentSatellite)

  return (
    <SatelliteDetailsView
      satellite={currentSatellite}
      loading={loading}
      delegateCallback={delegateCallback}
      undelegateCallback={undelegateCallback}
      userStakedBalanceInSatellite={user.mySMvkTokenBalance}
    />
  )
}

function getDesiredSatellite(satelliteAddress: string, satelliteLedger: SatelliteRecord[]): SatelliteRecord {
  return satelliteLedger?.filter((item: SatelliteRecord) => item.address === satelliteAddress)[0]
}
