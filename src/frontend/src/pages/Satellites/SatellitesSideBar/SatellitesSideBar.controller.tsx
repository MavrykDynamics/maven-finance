import moment from 'moment'
import { getDelegationStorage } from 'pages/Satellites/Satellites.actions'
import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { calcWithoutPrecision } from 'utils/calcFunctions'
import { checkIfUserIsSatellite, getTotalDelegatedMVK } from '../helpers/Satellites.consts'
import SatellitesSideBarView from './SatellitesSideBar.view'

const SatellitesSideBar = ({ isButton = true }: { isButton?: boolean }) => {
  const dispatch = useDispatch()
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { delegationStorage, currentSatellite } = useSelector((state: State) => state.delegation)
  const { feedsFactory, feeds } = useSelector((state: State) => state.oracles.oraclesStorage)
  const { delegationAddress } = useSelector((state: State) => state.contractAddresses)
  const {
    oraclesStorage: { totalOracleNetworks },
  } = useSelector((state: State) => state.oracles)

  const satelliteLedger = delegationStorage?.satelliteLedger
  const numSatellites = satelliteLedger?.length || 0
  const dataPointsCount = useMemo(
    () =>
      feeds?.filter((feed) => moment(Date.now()).diff(moment(feed?.last_completed_price_datetime), 'minutes') <= 60)
        .length,
    [feeds],
  )
  const totalDelegatedMVK = getTotalDelegatedMVK(satelliteLedger)
  const userIsSatellite = checkIfUserIsSatellite(accountPkh, satelliteLedger)
  const averageRevard = feeds?.length
    ? calcWithoutPrecision(
        (
          feeds.reduce((acc, { reward_amount_smvk }) => {
            acc += reward_amount_smvk
            return acc
          }, 0) / (feeds.length || 1)
        ).toString(),
      )
    : undefined

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
        satellite: delegationAddress?.address || '',
        oracle: feedsFactory?.[0]?.address || '',
        aggregator: feedsFactory?.[0]?.address || '',
      }}
      averageRevard={averageRevard}
      dataPointsCount={dataPointsCount}
    />
  )
}

export default SatellitesSideBar
