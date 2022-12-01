import { TempleWallet } from '@temple-wallet/dapp'
import { useCallback, useEffect } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { AnyAction } from 'redux'
import { useDispatch, useSelector } from 'react-redux'
import { ThunkDispatch } from 'redux-thunk'

import { State } from '../reducers'
import { AppRoutes } from './App.components/AppRoutes/AppRoutes.controller'
import { connect, setWallet } from './App.components/ConnectWallet/ConnectWallet.actions'
import { Menu } from './App.components/Menu/Menu.controller'
import { ProgressBar } from './App.components/ProgressBar/ProgressBar.controller'
import { Toaster } from './App.components/Toaster/Toaster.controller'
import { configureStore } from './App.store'
import { AppStyled } from './App.style'
import { PopupChangeNode } from './App.components/SettingsPopup/SettingsPopup.controller'
import { toggleRPCNodePopup } from './App.components/SettingsPopup/SettingsPopup.actions'
import { toggleSidebarCollapsing } from './App.components/Menu/Menu.actions'
import { useLockBodyScroll, useMedia } from 'react-use'
import CoinGecko from 'coingecko-api'
import Loader from './App.components/Loader/Loader.view'
import { toggleDataLoader } from './App.components/Loader/Loader.action'
import { getMvkTokenStorage } from 'pages/Doorman/Doorman.actions'
import { getDelegationStorage } from 'pages/Satellites/Satellites.actions'
import { getContractAddressesStorage } from 'reducers/actions/contractAddresses.actions'
import {
  getDipDupTokensStorage,
  getWhitelistTokensStorage,
  getTokensPrices,
} from 'reducers/actions/dipDupActions.actions'

// export const { store, persistor } = configureStore({})
export const { store } = configureStore({})
export type AppDispatch = ThunkDispatch<State, unknown, AnyAction>
export type GetState = typeof store.getState
export const coinGeckoClient = new CoinGecko()

const AppContainer = () => {
  const dispatch = useDispatch()
  const { loading } = useSelector((state: State) => state)
  const { changeNodePopupOpen, sidebarOpened } = useSelector((state: State) => state.preferences)
  const showSidebarOpened = useMedia('(min-width: 1400px)')

  useEffect(() => {
    dispatch(toggleSidebarCollapsing(showSidebarOpened))
  }, [showSidebarOpened])

  useEffect(() => {
    ;(async () => {
      // Fetching initial data for DAPP
      await dispatch(toggleDataLoader(true))
      await dispatch(getDelegationStorage())
      // For using Temple wallet
      // return TempleWallet.onAvailabilityChange((available) => {
      //   if (available) dispatch(setWallet(new TempleWallet(process.env.REACT_APP_NAME || 'MAVRYK')))
      // })

      // For using Beacon wallet
      if (
        localStorage.getItem('beacon:active-account') &&
        localStorage.getItem('beacon:active-account') !== 'undefined'
      ) {
        await dispatch(connect())
      }

      await dispatch(toggleDataLoader(false))

      // common data across the DAPP
      await dispatch(getContractAddressesStorage())
      await dispatch(getDipDupTokensStorage())
      await dispatch(getWhitelistTokensStorage())
      await dispatch(getTokensPrices())
      await dispatch(getMvkTokenStorage())
    })()

    return () => {
      dispatch(setWallet())
    }
  }, [dispatch])

  useEffect(() => {
    dispatch(toggleSidebarCollapsing(showSidebarOpened))
  }, [showSidebarOpened])

  useLockBodyScroll(Boolean(loading))

  const closeModalHandler = useCallback(() => dispatch(toggleRPCNodePopup(false)), [])

  return (
    <Router>
      <ProgressBar />
      <AppStyled isExpandedMenu={sidebarOpened}>
        <Loader />
        <Menu />
        <PopupChangeNode isModalOpened={changeNodePopupOpen} closeModal={closeModalHandler} />
        <AppRoutes />
      </AppStyled>
      <Toaster />
    </Router>
  )
}

export const App = () => {
  return <AppContainer />
}
