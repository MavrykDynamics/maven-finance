import { getDelegationStorage } from 'pages/Satellites/Satellites.actions'
import {
  getTotalDelegatedMVK,
  checkIfUserIsSatellite,
} from 'pages/Satellites/SatelliteSideBar/SatelliteSideBar.controller'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import OraclesSideBarView from './OraclesSideBar.view'

const OraclesSideBar = ({ isButton = true }: { isButton?: boolean }) => {
  const dispatch = useDispatch()
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { delegationStorage } = useSelector((state: State) => state.delegation)
  const { delegationAddress } = useSelector((state: State) => state.contractAddresses)
  const {
    oraclesStorage: { totalOracleNetworks },
  } = useSelector((state: State) => state.oracles)

  const satelliteLedger = delegationStorage?.satelliteLedger
  const numSatellites = satelliteLedger?.length || 0
  const totalDelegatedMVK = getTotalDelegatedMVK(satelliteLedger)
  const userIsSatellite = checkIfUserIsSatellite(accountPkh, satelliteLedger)

  useEffect(() => {
    dispatch(getDelegationStorage())
  }, [dispatch])

  return (
    <OraclesSideBarView
      userIsSatellite={userIsSatellite}
      numberOfSatellites={numSatellites}
      totalDelegatedMVK={totalDelegatedMVK}
      isButton={isButton}
      satelliteFactory={delegationAddress?.address || ''}
      totalOracleNetworks={totalOracleNetworks}
    />
  )
}

export default OraclesSideBar
