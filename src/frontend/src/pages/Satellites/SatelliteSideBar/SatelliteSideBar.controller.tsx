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
  const numSatellites = satelliteLedger?.length || 0
  const totalDelegatedMVK = getTotalDelegatedMVK(satelliteLedger)
  const userIsSatellite = accountPkh && satelliteLedger ? checkIfUserIsSatellite(accountPkh, satelliteLedger) : false

  useEffect(() => {
    dispatch(getDelegationStorage())
  }, [dispatch])

  return (
    <SatelliteSideBarView
      userIsSatellite={userIsSatellite}
      numberOfSatellites={numSatellites}
      totalDelegatedMVK={totalDelegatedMVK}
    />
  )
}

export function checkIfUserIsSatellite(accountPkh: string, satelliteLedger: SatelliteRecord[]): boolean {
  return satelliteLedger.some((record) => record.address === accountPkh)
}

function getTotalDelegatedMVK(satelliteLedger: SatelliteRecord[]): number {
  if (!satelliteLedger) return 0
  return satelliteLedger.reduce((sum, current) => sum + Number(current.totalDelegatedAmount), 0)
}
