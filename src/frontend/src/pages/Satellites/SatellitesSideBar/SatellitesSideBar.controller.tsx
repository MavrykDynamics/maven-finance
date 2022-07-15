import { getDelegationStorage } from 'pages/Satellites/Satellites.actions'
import {
  getTotalDelegatedMVK,
  checkIfUserIsSatellite,
} from 'pages/Satellites/old_version/SatelliteSideBar_old/SatelliteSideBar.controller'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import SatellitesSideBarView from './SatellitesSideBar.view'

const SatellitesSideBar = ({ isButton = true }: { isButton?: boolean }) => {
  const dispatch = useDispatch()
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { delegationStorage, currentSatellite } = useSelector((state: State) => state.delegation)
  const { feedsFactory } = useSelector((state: State) => state.oracles.oraclesStorage)
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
    <SatellitesSideBarView
      userIsSatellite={userIsSatellite}
      numberOfSatellites={numSatellites}
      totalDelegatedMVK={totalDelegatedMVK}
      isButton={isButton}
      satelliteFactory={delegationAddress?.address || ''}
      totalOracleNetworks={totalOracleNetworks}
      infoBlockAddresses={{
        satellite: currentSatellite.address,
        oracle: feedsFactory[0]?.address || '',
        aggregator: feedsFactory[0]?.address || '',
      }}
    />
  )
}

export default SatellitesSideBar
