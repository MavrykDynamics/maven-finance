import { Redirect, Route, Switch } from 'react-router-dom'
import { Doorman } from '../../../pages/Doorman/Doorman.controller'
import { Dashboard } from '../../../pages/Dashboard/Dashboard.controller'
import { Satellites } from '../../../pages/Satellites/Satellites.controller'
import { BecomeSatellite } from '../../../pages/BecomeSatellite/BecomeSatellite.controller'
import { SatelliteDetails } from '../../../pages/SatelliteDetails/SatelliteDetails.controller'
import { Governance } from '../../../pages/Governance/Governance.controller'
import { BreakGlass } from '../../../pages/BreakGlass/BreakGlass.controller'
import ProtectedRoute from './ProtectedRoute'
import { ProposalSubmission } from '../../../pages/ProposalSubmission/ProposalSubmission.controller'
import { Treasury } from '../../../pages/Treasury/Treasury.controller'
import { Loans } from '../../../pages/Loans/Loans.controller'
import { Farms } from '../../../pages/Farms/Farms.controller'
import { Vaults } from '../../../pages/Vaults/Vaults.controller'
import { Admin } from '../../../pages/Admin/Admin.controller'
import { useSelector } from 'react-redux'
import { State } from '../../../reducers'

export const AppRoutes = () => {
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { delegationStorage } = useSelector((state: State) => state.delegation)
  const { satelliteLedger } = delegationStorage

  return (
    <Switch>
      <Route exact path="/">
        <Doorman />
      </Route>
      {/*<Route exact path="/dashboard">*/}
      {/*  <Dashboard />*/}
      {/*</Route>*/}
      {/*<Route exact path="/dashboard-personal">*/}
      {/*  <Dashboard />*/}
      {/*</Route>*/}
      {/*<Route exact path="/your-vesting">*/}
      {/*  <Dashboard />*/}
      {/*</Route>*/}
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
      {/*<Route exact path="/governance">*/}
      {/*  <Governance />*/}
      {/*</Route>*/}
      {/*<Route exact path="/proposal-history">*/}
      {/*  <Governance />*/}
      {/*</Route>*/}
      {/*<Route exact path="/break-glass">*/}
      {/*  <BreakGlass />*/}
      {/*</Route>*/}
      {/*<Route exact path="/emergency-governance">*/}
      {/*  <BreakGlass />*/}
      {/*</Route>*/}
      {/*<Route exact path="/mavryk-council">*/}
      {/*  <Governance />*/}
      {/*</Route>*/}
      {/*<ProtectedRoute*/}
      {/*  path="/submit-proposal"*/}
      {/*  component={ProposalSubmission}*/}
      {/*  accountPkh={accountPkh}*/}
      {/*  arrayToFilterThrough={satelliteLedger}*/}
      {/*  authenticationPath={'/'}*/}
      {/*  redirectPath={'/submit-proposal'}*/}
      {/*/>*/}
      {/*<Route exact path="/treasury">*/}
      {/*  <Treasury />*/}
      {/*</Route>*/}
      {/*<Route exact path="/loans">*/}
      {/*  <Loans />*/}
      {/*</Route>*/}
      {/*<Route exact path="/yield-farms">*/}
      {/*  <Farms />*/}
      {/*</Route>*/}
      {/*<Route exact path="/vaults">*/}
      {/*  <Vaults />*/}
      {/*</Route>*/}
      {/*<Route exact path="/admin">*/}
      {/*  <Admin />*/}
      {/*</Route>*/}
      <Route exact path="/404">
        {/*TODO: Replace later on with actual 404 page*/}
        <Doorman />
      </Route>
      <Redirect to="/404" />
    </Switch>
  )
}
