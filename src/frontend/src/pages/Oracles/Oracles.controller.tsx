import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { getTotalDelegatedMVK } from 'pages/Satellites/SatelliteSideBar/SatelliteSideBar.controller'
import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { getOracleSatellites } from './Oracles.actions'
import OraclesView from './Oracles.view'

const Oracles = () => {
  const { delegationStorage } = useSelector((state: State) => state.delegation)
  const { oraclesStorage } = useSelector((state: State) => state.oracles)
  const loading = useSelector((state: State) => state.loading)

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

  return <OraclesView isLoading={loading} tabsInfo={tabsInfo} />
}

export default Oracles
