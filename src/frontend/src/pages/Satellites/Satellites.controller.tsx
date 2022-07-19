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
import { delegate, getDelegationStorage, undelegate } from 'pages/Satellites/Satellites.actions'

const Satellites = () => {
  const {
    delegationStorage: { satelliteLedger = [] },
  } = useSelector((state: State) => state.delegation)
  const { oraclesStorage } = useSelector((state: State) => state.oracles)
  const loading = useSelector((state: State) => state.loading)
  const { user } = useSelector((state: State) => state.user)
  const dispatch = useDispatch()

  const { accountPkh } = useSelector((state: State) => state.wallet)

  useEffect(() => {
    if (accountPkh) {
      dispatch(getMvkTokenStorage(accountPkh))
      dispatch(getDoormanStorage())
    }
    dispatch(getDelegationStorage())
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

  const undelegateCallback = () => {
    dispatch(undelegate())
  }

  return (
    <SatellitesView
      isLoading={loading}
      tabsInfo={tabsInfo}
      delegateCallback={delegateCallback}
      oracleSatellitesData={{
        userStakedBalance: user.mySMvkTokenBalance,
        satelliteUserIsDelegatedTo: user.satelliteMvkIsDelegatedTo,
        items: satelliteLedger.slice(0, 3),
        delegateCallback,
        undelegateCallback,
      }}
      dataFeedsData={{ items: oraclesStorage.feeds.slice(0, 5) }}
    />
  )
}

export default Satellites
