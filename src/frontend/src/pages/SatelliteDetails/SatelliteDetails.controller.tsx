import { Loader } from 'app/App.components/Loader/Loader.view'
import { delegate, getDelegationStorage, undelegate } from 'pages/Satellites/Satellites.actions'
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
  const neededSatellite = getDesiredSatellite(pathAddress, delegationStorage.satelliteLedger)

  useEffect(() => {
    dispatch(getDelegationStorage())
  }, [dispatch])

  const delegateCallback = (address: string) => {
    dispatch(delegate(address))
  }

  const undelegateCallback = (address: string) => {
    dispatch(undelegate(address))
  }

  return (
    <SatelliteDetailsView
      satellite={neededSatellite}
      loading={loading}
      delegateCallback={delegateCallback}
      undelegateCallback={undelegateCallback}
    />
  )
}

function getDesiredSatellite(satelliteAddress: string, satelliteLedger: SatelliteRecord[]): SatelliteRecord {
  return satelliteLedger?.filter((item: SatelliteRecord) => item.address === satelliteAddress)[0]
}
