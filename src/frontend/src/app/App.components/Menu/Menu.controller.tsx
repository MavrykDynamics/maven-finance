import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// view
import { MenuView } from './Menu.view'

// actions
import { getHeadData } from './Menu.actions'
import { toggleRPCNodePopup } from '../SettingsPopup/SettingsPopup.actions'
import { getMvkTokenStorage, getUserData } from 'pages/Doorman/Doorman.actions'

// types
import { State } from 'reducers'

export const Menu = () => {
  const dispatch = useDispatch()
  const { accountPkh } = useSelector((state: State) => state.wallet)

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

  return <MenuView accountPkh={accountPkh} openChangeNodePopupHandler={openChangeNodePopup} />
}
