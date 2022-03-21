import { getDoormanStorage, getMvkTokenStorage } from 'pages/Doorman/Doorman.actions'
import { getDelegationStorage } from 'pages/Satellites/Satellites.actions'
import { checkIfUserIsSatellite } from 'pages/Satellites/SatelliteSideBar/SatelliteSideBar.controller'
import { useEffect, useState } from 'react'
import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

import { registerAsSatellite, RegisterAsSatelliteForm, updateSatelliteRecord } from './BecomeSatellite.actions'
import { BecomeSatelliteView } from './BecomeSatellite.view'
import { SatelliteRecord } from '../../utils/TypesAndInterfaces/Delegation'

export const BecomeSatellite = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { myMvkTokenBalance } = useSelector((state: State) => state.mvkToken)
  const { delegationStorage } = useSelector((state: State) => state.delegation)
  const { satelliteLedger } = delegationStorage
  const { doormanStorage } = useSelector((state: State) => state.doorman)
  const userStakeBalanceLedgerInit = doormanStorage?.userStakeBalanceLedger
  const minStakedMVKBalance = String(delegationStorage.config?.minimumStakedMvkBalance)
  const [myTotalStakeBalance, setMyTotalStakeBalance] = useState<string>('0.00')
  const [usersSatellite, setUsersSatellite] = useState<SatelliteRecord>({
    address: '',
    name: '',
    image: '',
    description: '',
    satelliteFee: '',
    active: false,
    mvkBalance: '',
    totalDelegatedAmount: '',
    registeredDateTime: new Date(),
    unregisteredDateTime: null,
  })
  const userIsSatellite = accountPkh && satelliteLedger ? checkIfUserIsSatellite(accountPkh, satelliteLedger) : false

  useEffect(() => {
    if (accountPkh) {
      dispatch(getMvkTokenStorage(accountPkh))
      dispatch(getDoormanStorage())
    }

    dispatch(getDelegationStorage())
  }, [dispatch, accountPkh])

  useEffect(() => {
    if (accountPkh) {
      if (satelliteLedger && userIsSatellite) {
        setUsersSatellite(getUsersSatelliteIfExists(accountPkh, satelliteLedger))
      }
      if (userStakeBalanceLedgerInit) {
        const userStakeBalanceLedger = userStakeBalanceLedgerInit
        const stakeBalance = userStakeBalanceLedger.get(accountPkh) || '0.00'
        setMyTotalStakeBalance(stakeBalance)
      }
    }
  }, [
    accountPkh,
    satelliteLedger,
    userStakeBalanceLedgerInit,
    delegationStorage.config.minimumStakedMvkBalance,
    userIsSatellite,
  ])

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
      myTotalStakeBalance={myTotalStakeBalance}
      minimumStakedMvkBalance={minStakedMVKBalance}
      usersSatellite={usersSatellite}
    />
  )
}

function getUsersSatelliteIfExists(accountPkh: string, satelliteLedger: SatelliteRecord[]): SatelliteRecord {
  return satelliteLedger.filter((satellite: SatelliteRecord) => satellite.address === accountPkh)[0]
}
