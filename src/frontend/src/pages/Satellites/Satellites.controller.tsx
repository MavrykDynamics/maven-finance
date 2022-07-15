import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { delegate, getOracleSatellites } from 'pages/Satellites/Satellites.actions'
import { getTotalDelegatedMVK } from 'pages/Satellites/old_version/SatelliteSideBar_old/SatelliteSideBar.controller'
import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import SatellitesView from './Satellites.view'

const Satellites = () => {
  const { delegationStorage } = useSelector((state: State) => state.delegation)
  const { oraclesStorage } = useSelector((state: State) => state.oracles)
  const loading = useSelector((state: State) => state.loading)
  const { user } = useSelector((state: State) => state.user)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getOracleSatellites())
  }, [])

  const satelliteLedger = delegationStorage?.satelliteLedger
  const totalDelegatedMVK = getTotalDelegatedMVK(satelliteLedger)

  const tabsInfo = {
    totalDelegetedMVK: <CommaNumber value={totalDelegatedMVK} endingText={'MVK'} />,
    totalSatelliteOracles: 0,
    numberOfDataFeeds:
      oraclesStorage.feeds.length > 50 ? oraclesStorage.feeds.length + '+' : oraclesStorage.feeds.length,
  }

  const delegateCallback = (satelliteAddress: string) => {
    dispatch(delegate(satelliteAddress))
  }

  return (
    <SatellitesView
      isLoading={loading}
      tabsInfo={tabsInfo}
      delegateCallback={delegateCallback}
      oracleSatellitesData={{
        userStakedBalance: user.mySMvkTokenBalance,
        satelliteUserIsDelegatedTo: user.satelliteMvkIsDelegatedTo,
        items: oraclesStorage.oraclesSatellites,
      }}
    />
  )
}

export default Satellites
