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

export const store = configureStore({})

const AppContainer = () => {
  const dispatch = useDispatch()
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)

  useEffect(() => {
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
        {/*<Switch>*/}
        {/*  <Route exact path="/">*/}
        {/*    <Doorman />*/}
        {/*  </Route>*/}
        {/*  <Route exact path="/dashboard">*/}
        {/*    <Dashboard />*/}
        {/*  </Route>*/}
        {/*  <Route exact path="/dashboard-personal">*/}
        {/*    <Dashboard />*/}
        {/*  </Route>*/}
        {/*  <Route exact path="/your-vesting">*/}
        {/*    <Dashboard />*/}
        {/*  </Route>*/}
        {/*  <Route exact path="/stake">*/}
        {/*    <Doorman />*/}
        {/*  </Route>*/}
        {/*  <Route exact path="/satellites">*/}
        {/*    <Satellites />*/}
        {/*  </Route>*/}
        {/*  <Route exact path="/become-satellite">*/}
        {/*    <BecomeSatellite />*/}
        {/*  </Route>*/}
        {/*  <Route exact path="/satellite-details/:satelliteId">*/}
        {/*    <SatelliteDetails />*/}
        {/*  </Route>*/}
        {/*  <Route exact path="/governance">*/}
        {/*    <Governance />*/}
        {/*  </Route>*/}
        {/*  <Route exact path="/proposal-history">*/}
        {/*    <Governance />*/}
        {/*  </Route>*/}
        {/*  <Route exact path="/break-glass">*/}
        {/*    <BreakGlass />*/}
        {/*  </Route>*/}
        {/*  <Route exact path="/emergency-governance">*/}
        {/*    <BreakGlass />*/}
        {/*  </Route>*/}
        {/*  <Route exact path="/mavryk-council">*/}
        {/*    <Governance />*/}
        {/*  </Route>*/}
        {/*  <ProtectedRoute*/}
        {/*    path="/submit-proposal"*/}
        {/*    component={ProposalSubmission}*/}
        {/*    accountPkh={accountPkh}*/}
        {/*    arrayToFilterThrough={satelliteLedger}*/}
        {/*    authenticationPath={'/'}*/}
        {/*    redirectPath={'/submit-proposal'}*/}
        {/*  />*/}
        {/*  <Route exact path="/treasury">*/}
        {/*    <Treasury />*/}
        {/*  </Route>*/}
        {/*  <Route exact path="/loans">*/}
        {/*    <Loans />*/}
        {/*  </Route>*/}
        {/*  <Route exact path="/yield-farms">*/}
        {/*    <Farms />*/}
        {/*  </Route>*/}
        {/*  <Route exact path="/vaults">*/}
        {/*    <Vaults />*/}
        {/*  </Route>*/}
        {/*  <Route exact path="/admin">*/}
        {/*    <Admin />*/}
        {/*  </Route>*/}
        {/*  <Route exact path="/404">*/}
        {/*    /!*TODO: Replace later on with actual 404 page*!/*/}
        {/*    <Doorman />*/}
        {/*  </Route>*/}
        {/*  <Redirect to="/404" />*/}
        {/*</Switch>*/}
      </AppStyled>
      <Toaster />
    </Router>
  )
}

export const App = () => {
  return <AppContainer />
}
