import { getDoormanStorage, getMvkTokenStorage } from 'pages/Doorman/Doorman.actions'
import { getDelegationStorage } from 'pages/Satellites/Satellites.actions'
import * as React from 'react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

import { SatelliteRecord, SatelliteStatus } from '../../utils/TypesAndInterfaces/Delegation'
import { RegisterAsSatelliteForm } from '../../utils/TypesAndInterfaces/Forms'
import { registerAsSatellite, updateSatelliteRecord } from './BecomeSatellite.actions'
import { BecomeSatelliteView } from './BecomeSatellite.view'

export const BecomeSatellite = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => Boolean(state.loading))
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { delegationStorage } = useSelector((state: State) => state.delegation)
  const satelliteLedger = delegationStorage?.satelliteLedger
  const { user } = useSelector((state: State) => state.user)

  const usersSatellite: SatelliteRecord =
    accountPkh && satelliteLedger
      ? getUsersSatelliteIfExists(accountPkh, satelliteLedger)
      : {
          address: '',
          name: '',
          image: '',
          description: '',
          website: '',
          participation: 0,
          satelliteFee: 0,
          status: SatelliteStatus.ACTIVE,
          mvkBalance: 0,
          sMvkBalance: 0,
          totalDelegatedAmount: 0,
          unregisteredDateTime: null,
          delegationRatio: 0,
          delegatorCount: 0,
          oracleRecords: [],
        }
  useEffect(() => {
    if (accountPkh) {
      dispatch(getMvkTokenStorage(accountPkh))
      dispatch(getDoormanStorage())
    }

    dispatch(getDelegationStorage())
  }, [dispatch, accountPkh])

  const registerCallback = (form: RegisterAsSatelliteForm) => {
    console.log(typeof form.fee)
    dispatch(registerAsSatellite(form))
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
      myTotalStakeBalance={user.mySMvkTokenBalance}
      satelliteConfig={delegationStorage.config}
      usersSatellite={usersSatellite}
    />
  )
}

function getUsersSatelliteIfExists(accountPkh: string, satelliteLedger: SatelliteRecord[]): SatelliteRecord {
  return satelliteLedger.filter((satellite: SatelliteRecord) => satellite.address === accountPkh)[0]
}
