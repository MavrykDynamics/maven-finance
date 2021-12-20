import { getVMvkTokenStorage } from 'pages/Doorman/Doorman.actions'
import { useEffect, useState } from 'react'
import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { SatelliteRecord } from 'reducers/delegation'

import { registerAsSatellite, RegisterAsSatelliteForm } from './BecomeSatellite.actions'
import { BecomeSatelliteView } from './BecomeSatellite.view'

export const BecomeSatellite = (props: any) => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { myVMvkTokenBalance } = useSelector((state: State) => state.vMvkToken)
  const { delegationStorage } = useSelector((state: State) => state.delegation)
  const { satelliteLedger } = delegationStorage
  const [usersSatellite, setUsersSatellite] = useState<SatelliteRecord | undefined>(undefined)

  useEffect(() => {
    if (accountPkh) {
      dispatch(getVMvkTokenStorage(accountPkh))
      const filtered = satelliteLedger.filter((satellite) => satellite.address === accountPkh)
      if (filtered.length > 0) setUsersSatellite(filtered[0])
    }
  }, [dispatch, accountPkh, satelliteLedger])

  const registerCallback = (form: RegisterAsSatelliteForm) => {
    console.log('Got to here in register callback')
    dispatch(registerAsSatellite(form))
  }

  return (
    <BecomeSatelliteView
      loading={loading}
      registerCallback={registerCallback}
      accountPkh={accountPkh}
      myVMvkTokenBalance={myVMvkTokenBalance}
      usersSatellite={usersSatellite}
    />
  )
}
