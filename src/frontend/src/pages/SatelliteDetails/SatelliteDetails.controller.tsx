import * as React from 'react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { State } from 'reducers'

import { SatelliteDetailsView } from './SatelliteDetails.view'

import { getSatelliteByAddress } from './SatelliteDetails.actions'
import { delegate, getDelegationStorage, undelegate } from 'pages/Satellites/Satellites.actions'

export const SatelliteDetails = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { currentSatellite } = useSelector((state: State) => state.delegation)
  const { user } = useSelector((state: State) => state.user)

  let { satelliteId } = useParams<{ satelliteId: string }>()

  useEffect(() => {
    dispatch(getSatelliteByAddress(satelliteId))
    dispatch(getDelegationStorage())
  }, [dispatch, satelliteId])

  const delegateCallback = (address: string) => {
    dispatch(delegate(address))
  }

  const undelegateCallback = () => {
    dispatch(undelegate())
  }

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
