import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// view
import { MenuView } from './Menu.view'

// actions
import { toggleRPCNodePopup } from '../SettingsPopup/SettingsPopup.actions'

// types
import { State } from 'reducers'

export const Menu = () => {
  const dispatch = useDispatch()
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const openChangeNodePopup = useCallback(() => dispatch(toggleRPCNodePopup(true)), [])

  return <MenuView accountPkh={accountPkh} openChangeNodePopupHandler={openChangeNodePopup} />
}
