import { getMvkTokenStorage, getUserData } from 'pages/Doorman/Doorman.actions'
import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { toggleRPCNodePopup } from '../ChangeNodePopup/ChangeNode.actions'

import { showToaster } from '../Toaster/Toaster.actions'
import { getHeadData } from './Menu.actions'
import { MenuView } from './Menu.view'

export const Menu = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)

  async function initialDispatches(accountPkh?: string) {
    if (accountPkh) {
      await dispatch(getUserData(accountPkh))
      await dispatch(getMvkTokenStorage(accountPkh))
    }
    await dispatch(getHeadData())
  }

  useEffect(() => {
    initialDispatches(accountPkh)
  }, [accountPkh])

  const openChangeNodePopup = useCallback(() => dispatch(toggleRPCNodePopup(true)), [])

  return (
    <MenuView
      loading={loading}
      accountPkh={accountPkh}
      ready={ready}
      openChangeNodePopupHandler={openChangeNodePopup}
    />
  )
}
