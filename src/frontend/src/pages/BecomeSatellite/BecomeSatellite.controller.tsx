import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

import { getDoormanStorage, getMvkTokenStorage } from 'pages/Doorman/Doorman.actions'
import { getDelegationStorage } from 'pages/Satellites/Satellites.actions'

import { SatelliteRecord, SatelliteStatus } from '../../utils/TypesAndInterfaces/Delegation'
import { RegisterAsSatelliteForm } from '../../utils/TypesAndInterfaces/Forms'
import { registerAsSatellite, updateSatelliteRecord } from './BecomeSatellite.actions'
import { BecomeSatelliteView } from './BecomeSatellite.view'

export const BecomeSatellite = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => Boolean(state.loading))
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { satelliteLedger, config } = useSelector((state: State) => state.delegation.delegationStorage)
  const { mySMvkTokenBalance = 0 } = useSelector((state: State) => state.user)

  const usersSatelliteProfile = satelliteLedger.find((satellite: SatelliteRecord) => satellite.address === accountPkh)
  const isSutelliteRegistered = Boolean(usersSatelliteProfile?.currentlyRegistered)

  const usersSatellite: SatelliteRecord =
    accountPkh && usersSatelliteProfile
      ? usersSatelliteProfile
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
          delegationRatio: 0,
          delegatorCount: 0,
          oracleRecords: [],
          isSatelliteReady: false,
          currentlyRegistered: false,
        }

  useEffect(() => {
    dispatch(getDoormanStorage())
    dispatch(getMvkTokenStorage())
    dispatch(getDelegationStorage())
  }, [accountPkh])

  const registerCallback = (form: RegisterAsSatelliteForm) => {
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
      myTotalStakeBalance={mySMvkTokenBalance}
      satelliteConfig={config}
      usersSatellite={usersSatellite}
      isSutelliteRegistered={isSutelliteRegistered}
    />
  )
}
