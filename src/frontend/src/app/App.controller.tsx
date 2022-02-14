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
import { Governance } from '../pages/Governance/Governance.controller'
import { Treasury } from '../pages/Treasury/Treasury.controller'
import { Loans } from '../pages/Loans/Loans.controller'
import { Farms } from '../pages/Farms/Farms.controller'
import { Vaults } from '../pages/Vaults/Vaults.controller'
import { Dashboard } from '../pages/Dashboard/Dashboard.controller'
import DarkThemeProvider from './App.components/DarkThemeProvider/DarkThemeProvider.view'

export const store = configureStore({})

const AppContainer = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    // For using Beacon wallet, replace following lines with dispatch(setWallet())
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
          <Route exact path="/dashboard">
            <Dashboard />
          </Route>
          <Route exact path="/dashboard-personal">
            <Dashboard />
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
          <Route exact path="/governance">
            <Governance />
          </Route>
          <Route exact path="/break-glass">
            <Governance />
          </Route>
          <Route exact path="/treasury">
            <Treasury />
          </Route>
          <Route exact path="/loans">
            <Loans />
          </Route>
          <Route exact path="/yield-farms">
            <Farms />
          </Route>
          <Route exact path="/vaults">
            <Vaults />
          </Route>
        </Switch>
      </AppStyled>
      <Toaster />
    </Router>
  )
}

export const App = () => {
  return <AppContainer />
}
