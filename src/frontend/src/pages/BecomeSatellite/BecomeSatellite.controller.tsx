import { getDoormanStorage, getMvkTokenStorage } from 'pages/Doorman/Doorman.actions'
import { getDelegationStorage } from 'pages/Satellites/Satellites.actions'
import * as React from 'react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

import { registerAsSatellite, updateSatelliteRecord } from './BecomeSatellite.actions'
import { BecomeSatelliteView } from './BecomeSatellite.view'
import { RegisterAsSatelliteForm } from '../../utils/TypesAndInterfaces/Forms'

export const BecomeSatellite = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { delegationStorage } = useSelector((state: State) => state.delegation)
  const { user } = useSelector((state: State) => state.user)

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
      myTotalStakeBalance={user.mySMvkTokenBalance}
      minimumStakedMvkBalance={delegationStorage.config.minimumStakedMvkBalance}
      usersSatellite={user.mySatellite}
    />
  )
}
