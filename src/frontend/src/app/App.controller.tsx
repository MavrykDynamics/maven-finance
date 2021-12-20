import { TempleWallet } from '@temple-wallet/dapp'
import { BecomeSatellite } from 'pages/BecomeSatellite/BecomeSatellite.controller'
import { Doorman } from 'pages/Doorman/Doorman.controller'
import { SatelliteDetails } from 'pages/SatelliteDetails/SatelliteDetails.controller'
import { Satellites } from 'pages/Satellites/Satellites.controller'
import { useEffect } from 'react'
import { Provider, useDispatch } from 'react-redux'
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom'

import { setWallet } from './App.components/Menu/Menu.actions'
import { Menu } from './App.components/Menu/Menu.controller'
import { ProgressBar } from './App.components/ProgressBar/ProgressBar.controller'
import { Toaster } from './App.components/Toaster/Toaster.controller'
import { configureStore } from './App.store'
import { AppStyled } from './App.style'

export const store = configureStore({})

const AppContainer = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    return TempleWallet.onAvailabilityChange((available) => {
      if (available) dispatch(setWallet(new TempleWallet(process.env.REACT_APP_NAME || 'MAVRYK')))
    })
  }, [dispatch])

  return (
    <Router>
      <ProgressBar />
      <AppStyled>
        <Menu />
        <Switch>
          <Route exact path="/">
            <Doorman />
          </Route>
          <Route exact path="/stake">
            <Doorman />
          </Route>
          <Route exact path="/satellites">
            <Satellites />
          </Route>
          <Route exact path="/become-satellite">
            <BecomeSatellite />
          </Route>
          <Route exact path="/satellite-details/:satelliteId">
            <SatelliteDetails />
          </Route>
        </Switch>
      </AppStyled>
      <Toaster />
    </Router>
  )
}

export const App = () => {
  return (
    <Provider store={store}>
      <AppContainer />
    </Provider>
  )
}
