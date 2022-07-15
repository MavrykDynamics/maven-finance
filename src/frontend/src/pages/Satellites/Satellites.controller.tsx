import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { delegate, getDelegationStorage, undelegate } from 'pages/Satellites/Satellites.actions'
import { getTotalDelegatedMVK } from 'pages/Satellites/old_version/SatelliteSideBar_old/SatelliteSideBar.controller'
import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import SatellitesView from './Satellites.view'
import { getMvkTokenStorage, getDoormanStorage } from 'pages/Doorman/Doorman.actions'

const Satellites = () => {
  const { delegationStorage } = useSelector((state: State) => state.delegation)
  const { oraclesStorage } = useSelector((state: State) => state.oracles)
  const loading = useSelector((state: State) => state.loading)
  const { user } = useSelector((state: State) => state.user)
  const dispatch = useDispatch()

  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { mvkTokenStorage, myMvkTokenBalance } = useSelector((state: State) => state.mvkToken)
  const { doormanStorage } = useSelector((state: State) => state.doorman)
  const userStakeBalanceLedger = doormanStorage?.userStakeBalanceLedger
  const userStakedBalance = accountPkh ? parseFloat(userStakeBalanceLedger?.get(accountPkh) || '0') : 0
  const satelliteUserIsDelegatedTo = 'tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb' //accountPkh
  // ? delegationStorage?.delegateLedger.get(accountPkh)?.satelliteAddress || ''
  // : ''

  useEffect(() => {
    if (accountPkh) {
      dispatch(getMvkTokenStorage(accountPkh))
      dispatch(getDoormanStorage())
    }
    dispatch(getDelegationStorage())
  }, [dispatch, accountPkh])

  const satelliteLedger = delegationStorage?.satelliteLedger
  const totalDelegatedMVK = getTotalDelegatedMVK(satelliteLedger)

  console.log('satelliteLedger', satelliteLedger)

  const tabsInfo = {
    totalDelegetedMVK: <CommaNumber value={totalDelegatedMVK} endingText={'MVK'} />,
    totalSatelliteOracles: 0,
    numberOfDataFeeds:
      oraclesStorage.feeds.length > 50 ? oraclesStorage.feeds.length + '+' : oraclesStorage.feeds.length,
  }

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
      }}
    />
  )
}

export default Satellites
