import { TempleWallet } from '@temple-wallet/dapp'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BrowserRouter as Router } from 'react-router-dom'

import { setWallet } from './App.components/Menu/Menu.actions'
import { Menu } from './App.components/Menu/Menu.controller'
import { ProgressBar } from './App.components/ProgressBar/ProgressBar.controller'
import { Toaster } from './App.components/Toaster/Toaster.controller'
import { configureStore } from './App.store'
import { AppStyled } from './App.style'
import { State } from '../reducers'
import { ThemeToggle } from './App.components/ThemeToggle/ThemeToggle.controller'
import { AppRoutes } from './App.components/AppRoutes/AppRoutes.controller'
import { onStart } from './App.actions'

export const store = configureStore({})

const AppContainer = () => {
  const dispatch = useDispatch()
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)

  useEffect(() => {
    dispatch(onStart())
    // For using Beacon wallet, replace following lines with dispatch(setWallet())
    return TempleWallet.onAvailabilityChange((available) => {
      if (available) dispatch(setWallet(new TempleWallet(process.env.REACT_APP_NAME || 'MAVRYK')))
    })
  }, [dispatch])

  return (
    <Router>
      <ThemeToggle />
      <ProgressBar />
      <AppStyled>
        <Menu />
        <AppRoutes />
      </AppStyled>
      <Toaster />
    </Router>
  )
}

export const App = () => {
  return <AppContainer />
}
