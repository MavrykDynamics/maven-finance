import { Button } from 'app/App.components/Button/Button.controller'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { State } from 'reducers'
import { SatelliteRecord } from 'reducers/delegation'
import { Message, Page, PageContent } from 'styles'
import { SatelliteList } from './SatelliteList/SatelliteList.controller'

import { SatelliteListView } from './SatelliteList/SatelliteList.view'
import { getDelegationStorage, getMvkTokenStorage, getVMvkTokenStorage, setChosenSatellite } from './Satellites.actions'
import { SatellitesHeader } from './SatellitesHeader/SatellitesHeader.controller'
import { SatelliteSideBar } from './SatelliteSideBar/SatelliteSideBar.view'

export const Satellites = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { mvkTokenStorage, myMvkTokenBalance } = useSelector((state: State) => state.mvkToken)
  const { vMvkTokenStorage, myVMvkTokenBalance } = useSelector((state: State) => state.vMvkToken)
  const { delegationStorage } = useSelector((state: State) => state.delegation)
  const { satelliteLedger } = delegationStorage

  useEffect(() => {
    if (accountPkh) {
      dispatch(getMvkTokenStorage(accountPkh))
      dispatch(getVMvkTokenStorage(accountPkh))
    }
    dispatch(getDelegationStorage())
  }, [dispatch, accountPkh])

  return (
    <Page>
      <SatellitesHeader />
      <br />
      <PageContent>
        <SatelliteList satellitesList={satelliteLedger} loading={loading} />
        <SatelliteSideBar />
      </PageContent>
    </Page>
  )
}
