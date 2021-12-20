import * as React from 'react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { SatelliteRecord } from 'reducers/delegation'
import { Message, Page, PageContent } from 'styles'

import { SatelliteList } from './SatelliteList/SatelliteList.controller'
import {
  delegate,
  getDelegationStorage,
  getMvkTokenStorage,
  getVMvkTokenStorage,
  undelegate,
} from './Satellites.actions'
import { SatellitesHeader } from './SatellitesHeader/SatellitesHeader.controller'
import { SatelliteSideBar } from './SatelliteSideBar/SatelliteSideBar.controller'

export const Satellites = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { mvkTokenStorage, myMvkTokenBalance } = useSelector((state: State) => state.mvkToken)
  const { vMvkTokenStorage, myVMvkTokenBalance } = useSelector((state: State) => state.vMvkToken)
  const { delegationStorage } = useSelector((state: State) => state.delegation)
  const [satelliteLedger, setSatelliteLedger] = useState<SatelliteRecord[]>([])

  useEffect(() => {
    if (accountPkh) {
      dispatch(getMvkTokenStorage(accountPkh))
      dispatch(getVMvkTokenStorage(accountPkh))
    }
    dispatch(getDelegationStorage())
  }, [dispatch, accountPkh])

  useEffect(() => {
    setSatelliteLedger(delegationStorage.satelliteLedger)
  }, [delegationStorage.satelliteLedger])

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
        />
        <SatelliteSideBar />
      </PageContent>
    </Page>
  )
}
