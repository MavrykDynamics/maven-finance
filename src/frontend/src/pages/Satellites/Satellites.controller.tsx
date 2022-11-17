import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// types
import { State } from 'reducers'

// view
import SatellitesView from './Satellites.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

// consts, helpers, actions
import { getMvkTokenStorage, getDoormanStorage } from 'pages/Doorman/Doorman.actions'
import { getTotalDelegatedMVK } from './helpers/Satellites.consts'
import { delegate, getDelegationStorage, getOracleStorage, undelegate } from 'pages/Satellites/Satellites.actions'
import { getGovernanceStorage } from 'pages/Governance/Governance.actions'
import { getEmergencyGovernanceStorage } from 'pages/EmergencyGovernance/EmergencyGovernance.actions'

const Satellites = () => {
  const {
    delegationStorage: { activeSatellites = [] },
  } = useSelector((state: State) => state.delegation)
  const { oraclesStorage } = useSelector((state: State) => state.oracles)
  const loading = useSelector((state: State) => Boolean(state.loading))
  const { mySMvkTokenBalance = 0, satelliteMvkIsDelegatedTo } = useSelector((state: State) => state.user)
  const dispatch = useDispatch()

  const { accountPkh } = useSelector((state: State) => state.wallet)

  useEffect(() => {
    if (accountPkh) {
      dispatch(getDoormanStorage())
    }
    dispatch(getMvkTokenStorage())
    dispatch(getDelegationStorage())
    dispatch(getOracleStorage())
    dispatch(getGovernanceStorage())
    dispatch(getEmergencyGovernanceStorage())
  }, [dispatch, accountPkh])

  const totalDelegatedMVK = getTotalDelegatedMVK(activeSatellites)

  const tabsInfo = useMemo(
    () => ({
      totalDelegetedMVK: <CommaNumber value={totalDelegatedMVK} endingText={'MVK'} />,
      totalSatelliteOracles: activeSatellites.length,
      numberOfDataFeeds:
        oraclesStorage.feeds.length > 50 ? oraclesStorage.feeds.length + '+' : oraclesStorage.feeds.length,
    }),
    [activeSatellites, oraclesStorage.feeds, totalDelegatedMVK],
  )

  const delegateCallback = (satelliteAddress: string) => {
    dispatch(delegate(satelliteAddress))
  }

  const undelegateCallback = (delegateAddress: string) => {
    dispatch(undelegate(delegateAddress))
  }

  return (
    <SatellitesView
      isLoading={loading}
      tabsInfo={tabsInfo}
      delegateCallback={delegateCallback}
      oracleSatellitesData={{
        userStakedBalance: mySMvkTokenBalance,
        satelliteUserIsDelegatedTo: satelliteMvkIsDelegatedTo,
        items: activeSatellites.slice(0, 3),
        delegateCallback,
        undelegateCallback,
      }}
      dataFeedsData={{ items: oraclesStorage.feeds.slice(0, 5) }}
    />
  )
}

export default Satellites
