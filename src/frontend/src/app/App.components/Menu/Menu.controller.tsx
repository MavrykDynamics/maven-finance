import { getMvkTokenStorage } from 'pages/Doorman/Doorman.actions'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { connect, getHeadData } from './Menu.actions'

import { MenuView } from './Menu.view'
import { toggleDarkTheme } from '../DarkThemeProvider/DarkThemeProvider.actions'
import { getEmergencyGovernanceStorage, getGovernanceStorage } from '../../../pages/Governance/Governance.actions'
import { getDelegationStorage } from '../../../pages/Satellites/Satellites.actions'

export const Menu = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { mvkTokenStorage, myMvkTokenBalance } = useSelector((state: State) => state.mvkToken)

  useEffect(() => {
    if (accountPkh) dispatch(getMvkTokenStorage(accountPkh))
    GetHeadData()
    GetChainData()
  }, [dispatch, accountPkh])

  setInterval(GetHeadData, 30000)
  setInterval(GetChainData, 60000)
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
  const handleConnect = () => {
    dispatch(connect({ forcePermission: false }))
  }

  const handleNewConnect = () => {
    dispatch(connect({ forcePermission: true }))
  }

  return (
    <MenuView
      loading={loading}
      myMvkTokenBalance={myMvkTokenBalance}
      accountPkh={accountPkh}
      wallet={wallet}
      ready={ready}
      handleConnect={handleConnect}
      handleNewConnect={handleNewConnect}
    />
  )
}
