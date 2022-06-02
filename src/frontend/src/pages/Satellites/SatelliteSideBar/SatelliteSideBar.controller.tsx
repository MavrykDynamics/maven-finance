import * as React from 'react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

import { getDelegationStorage } from '../Satellites.actions'
import { SatelliteSideBarView } from './SatelliteSideBar.view'
import { SatelliteRecord } from '../../../utils/TypesAndInterfaces/Delegation'

export const SatelliteSideBar = ({ isButton = true }: { isButton?: boolean }) => {
  const dispatch = useDispatch()
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { delegationStorage } = useSelector((state: State) => state.delegation)
  const { delegationAddress } = useSelector((state: State) => state.contractAddresses)
  const satelliteLedger = delegationStorage?.satelliteLedger
  const numSatellites = satelliteLedger?.length || 0
  const totalDelegatedMVK = getTotalDelegatedMVK(satelliteLedger)
  const userIsSatellite = checkIfUserIsSatellite(accountPkh, satelliteLedger)

  console.log('%c ||||| userIsSatellite', 'color:yellowgreen', userIsSatellite)

  useEffect(() => {
    dispatch(getDelegationStorage())
  }, [dispatch])

  return (
    <SatelliteSideBarView
      userIsSatellite={userIsSatellite}
      numberOfSatellites={numSatellites}
      totalDelegatedMVK={totalDelegatedMVK}
      isButton={isButton}
      satelliteFactory={delegationAddress?.address || ''}
    />
  )
}

export function checkIfUserIsSatellite(accountPkh?: string, satelliteLedger?: SatelliteRecord[]): boolean {
  return accountPkh && satelliteLedger ? satelliteLedger.some((record) => record.address === accountPkh) : false
}

function getTotalDelegatedMVK(satelliteLedger: SatelliteRecord[]): number {
  if (!satelliteLedger) return 0
  return satelliteLedger.reduce((sum, current) => sum + Number(current.totalDelegatedAmount), 0)
}
