import { getDoormanStorage, getMvkTokenStorage } from 'pages/Doorman/Doorman.actions'
import { getDelegationStorage } from 'pages/Satellites/Satellites.actions'
import { checkIfUserIsSatellite } from 'pages/Satellites/SatelliteSideBar/SatelliteSideBar.controller'
import { useEffect, useState } from 'react'
import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { SatelliteRecord } from 'reducers/delegation'

import { registerAsSatellite, RegisterAsSatelliteForm, updateSatelliteRecord } from './BecomeSatellite.actions'
import { BecomeSatelliteView } from './BecomeSatellite.view'

export const BecomeSatellite = (props: any) => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { delegationStorage } = useSelector((state: State) => state.delegation)
  const { satelliteLedger } = delegationStorage
  const { doormanStorage } = useSelector((state: State) => state.doorman)
  const userStakeBalanceLedger = accountPkh && doormanStorage ? doormanStorage.userStakeBalanceLedger.get(accountPkh) : "0.00"

  const minStakedMVKBalance = String(delegationStorage.config?.minimumStakedMvkBalance)
  const userSatellite = accountPkh && satelliteLedger ? 
    getUsersSatelliteIfExists(accountPkh, satelliteLedger) : 
    {
      address: '',
      name: '',
      image: '',
      description: '',
      satelliteFee: '',
      status: false,
      mvkBalance: '',
      totalDelegatedAmount: '',
      registeredDateTime: new Date(),
      unregisteredDateTime: null,
    }

  useEffect(() => {
    if (accountPkh) {
      dispatch(getMvkTokenStorage(accountPkh))
      dispatch(getDoormanStorage())
    }
    dispatch(getDelegationStorage())
  }, [dispatch, accountPkh])

  const registerCallback = (form: RegisterAsSatelliteForm) => {
    dispatch(registerAsSatellite(form, accountPkh as any))
  }
  const updateSatelliteCallback = (form: RegisterAsSatelliteForm) => {
    dispatch(updateSatelliteRecord(form))
  }

  return (
    <BecomeSatelliteView
      loading={loading}
      registerCallback={registerCallback}
      updateSatelliteCallback={updateSatelliteCallback}
      accountPkh={accountPkh}
      myTotalStakeBalance={userStakeBalanceLedger}
      minimumStakedMvkBalance={minStakedMVKBalance}
      usersSatellite={userSatellite}
    />
  )
}

function getUsersSatelliteIfExists(accountPkh: string, satelliteLedger: SatelliteRecord[]): SatelliteRecord {
  return satelliteLedger.filter((satellite: SatelliteRecord) => satellite.address === accountPkh)[0]
}
