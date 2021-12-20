import * as React from 'react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { SatelliteRecord } from 'reducers/delegation'

import { getDelegationStorage } from '../Satellites.actions'
import { SatelliteSideBarView } from './SatelliteSideBar.view'

export const SatelliteSideBar = () => {
  const dispatch = useDispatch()
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { delegationStorage } = useSelector((state: State) => state.delegation)
  const { satelliteLedger } = delegationStorage
  const [numSatellites, setNumSatellites] = useState(0)
  const [totalDelegatedMVK, setTtotalDelegatedMVK] = useState<number>(0)
  const [userIsSatellite, setUserIsSatellite] = useState(false)

  useEffect(() => {
    dispatch(getDelegationStorage())
  }, [dispatch])
  useEffect(() => {
    if (accountPkh) {
      setUserIsSatellite(checkIfUserIsSatellite(accountPkh, satelliteLedger))
    }
    setNumSatellites(satelliteLedger.length)
    setTtotalDelegatedMVK(getTotalDelegatedMVK(satelliteLedger))
  }, [accountPkh, satelliteLedger])

  return (
    <SatelliteSideBarView
      userIsSatellite={userIsSatellite}
      numberOfSatellites={numSatellites}
      totalDelegatedMVK={totalDelegatedMVK}
    />
  )
}

function checkIfUserIsSatellite(accountPkh: string, satelliteLedger: SatelliteRecord[]): boolean {
  return satelliteLedger.some((record) => record.address === accountPkh)
}

function getTotalDelegatedMVK(satelliteLedger: SatelliteRecord[]): number {
  return satelliteLedger.reduce((sum, current) => sum + Number(current.totalDelegatedAmount), 0)
}
