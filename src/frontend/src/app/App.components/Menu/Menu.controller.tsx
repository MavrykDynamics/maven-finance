import { getMvkTokenStorage } from 'pages/Doorman/Doorman.actions'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { connect } from './Menu.actions'

import { MenuView } from './Menu.view'
import { toggleDarkTheme } from '../DarkThemeProvider/DarkThemeProvider.actions'

export const Menu = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { mvkTokenStorage, myMvkTokenBalance } = useSelector((state: State) => state.mvkToken)

  useEffect(() => {
    if (accountPkh) dispatch(getMvkTokenStorage(accountPkh))
  }, [dispatch, accountPkh])

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
