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

const Satellites = () => {
  const {
    delegationStorage: { satelliteLedger = [] },
  } = useSelector((state: State) => state.delegation)
  const { oraclesStorage } = useSelector((state: State) => state.oracles)
  const loading = useSelector((state: State) => Boolean(state.loading))
  const { mySMvkTokenBalance = 0, satelliteMvkIsDelegatedTo } = useSelector((state: State) => state.user)
  const dispatch = useDispatch()

  const { accountPkh } = useSelector((state: State) => state.wallet)

  useEffect(() => {
    if (accountPkh) {
      dispatch(getMvkTokenStorage(accountPkh))
      dispatch(getDoormanStorage())
    }
    dispatch(getDelegationStorage())
    dispatch(getOracleStorage())
  }, [dispatch, accountPkh])

  const totalDelegatedMVK = getTotalDelegatedMVK(satelliteLedger)

  const tabsInfo = useMemo(
    () => ({
      totalDelegetedMVK: <CommaNumber value={totalDelegatedMVK} endingText={'MVK'} />,
      totalSatelliteOracles: satelliteLedger.length,
      numberOfDataFeeds:
        oraclesStorage.feeds.length > 50 ? oraclesStorage.feeds.length + '+' : oraclesStorage.feeds.length,
    }),
    [satelliteLedger, oraclesStorage.feeds, totalDelegatedMVK],
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
        items: satelliteLedger,
        delegateCallback,
        undelegateCallback,
      }}
      dataFeedsData={{ items: oraclesStorage.feeds }}
    />
  )
}

export default Satellites
