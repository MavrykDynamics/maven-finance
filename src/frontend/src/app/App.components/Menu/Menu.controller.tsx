import { getMvkTokenStorage, getUserData } from 'pages/Doorman/Doorman.actions'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { getHeadData } from './Menu.actions'

import { MenuView } from './Menu.view'
import { getGovernanceStorage } from '../../../pages/Governance/Governance.actions'
import { getDelegationStorage } from '../../../pages/Satellites/Satellites.actions'
import { getEmergencyGovernanceStorage } from '../../../pages/EmergencyGovernance/EmergencyGovernance.actions'

export const Menu = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)

  useEffect(() => {
    if (accountPkh) {
      dispatch(getUserData(accountPkh))
      dispatch(getMvkTokenStorage(accountPkh))
    }
    GetHeadData()
    // GetChainData()
  }, [dispatch, accountPkh])

  // setInterval(GetHeadData, 30000)
  // setInterval(GetChainData, 60000)
  async function GetHeadData() {
    dispatch(getHeadData())
  }
  async function GetChainData() {
    return (dispatch: any) => {
      dispatch(getGovernanceStorage())
      dispatch(getEmergencyGovernanceStorage())
      dispatch(getDelegationStorage())
    }
  }

  return <MenuView loading={loading} accountPkh={accountPkh} ready={ready} />
}
