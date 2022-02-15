import { getDoormanStorage, getMvkTokenStorage } from 'pages/Doorman/Doorman.actions'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { SatelliteRecord } from 'reducers/delegation'
import { Message, Page, PageContent } from 'styles'

import { SatelliteList } from './SatelliteList/SatelliteList.controller'
import { delegate, getDelegationStorage, undelegate } from './Satellites.actions'
import { SatellitesHeader } from './SatellitesHeader/SatellitesHeader.controller'
import { SatelliteSideBar } from './SatelliteSideBar/SatelliteSideBar.controller'

export const Satellites = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { mvkTokenStorage, myMvkTokenBalance } = useSelector((state: State) => state.mvkToken)
  const { delegationStorage } = useSelector((state: State) => state.delegation)
  const { doormanStorage } = useSelector((state: State) => state.doorman)
  const userStakeBalanceLedger = doormanStorage?.userStakeBalanceLedger
  const satelliteLedger = delegationStorage?.satelliteLedger
  const userStakedBalance = accountPkh ? parseFloat(userStakeBalanceLedger?.get(accountPkh) || '0') : 0
  const satelliteUserIsDelegatedTo = accountPkh
    ? delegationStorage?.delegateLedger.get(accountPkh)?.satelliteAddress || ''
    : ''

  useEffect(() => {
    if (accountPkh) {
      dispatch(getMvkTokenStorage(accountPkh))
      dispatch(getDoormanStorage())
    }
    dispatch(getDelegationStorage())
  }, [dispatch, accountPkh])

  const delegateCallback = (satelliteAddress: string) => {
    dispatch(delegate(satelliteAddress))
  }

  const undelegateCallback = (satelliteAddress: string) => {
    dispatch(undelegate(satelliteAddress))
  }
  return (
    <Page>
      <SatellitesHeader />
      <br />
      <PageContent>
        <SatelliteList
          satellitesList={satelliteLedger}
          loading={loading}
          delegateCallback={delegateCallback}
          undelegateCallback={undelegateCallback}
          userStakedBalance={userStakedBalance}
          satelliteUserIsDelegatedTo={satelliteUserIsDelegatedTo}
        />
        <SatelliteSideBar />
      </PageContent>
    </Page>
  )
}
