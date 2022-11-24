import { useEffect } from 'react'
import { Redirect, Route, Switch, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { State } from 'reducers'

import { DataFeeds } from 'pages/DataFeeds/DataFeeds.controller'
import DataFeedDetails from 'pages/DataFeeds/details/DataFeedsDetails.controler'
import { FinancialRequests } from 'pages/FinacialRequests/FinancialRequests.controller'
import SatelliteNodes from 'pages/SatelliteNodes/SatelliteNodes.controller'
import Satellites from 'pages/Satellites/Satellites.controller'
import UserDetails from 'pages/UsersOracles/details/UsersDetails.controler'
import Users from 'pages/UsersOracles/Users.controller'

// pages
import { Admin } from '../../../pages/Admin/Admin.controller'
import { BecomeSatellite } from '../../../pages/BecomeSatellite/BecomeSatellite.controller'
import { BreakGlass } from '../../../pages/BreakGlass/BreakGlass.controller'
import { Council } from '../../../pages/Council/Council.controller'
import { BreakGlassCouncil } from 'pages/BreakGlassCouncil/BreakGlassCouncil.controller'
import { Dashboard } from '../../../pages/Dashboard/Dashboard.controller'
import { Doorman } from '../../../pages/Doorman/Doorman.controller'
import { EmergencyGovernance } from '../../../pages/EmergencyGovernance/EmergencyGovernance.controller'
import { Farms } from '../../../pages/Farms/Farms.controller'
import { Governance } from '../../../pages/Governance/Governance.controller'
import { Loans } from '../../../pages/Loans/Loans.controller'
import { ProposalSubmission } from '../../../pages/ProposalSubmission/ProposalSubmission.controller'
import { SatelliteDetails } from '../../../pages/SatelliteDetails/SatelliteDetails.controller'
import { SatelliteGovernance } from '../../../pages/SatelliteGovernance/SatelliteGovernance.controller'
import { Treasury } from '../../../pages/Treasury/Treasury.controller'
import { Vaults } from '../../../pages/Vaults/Vaults.controller'

import { scrollUpPage } from 'utils/scrollUpPage'
import ProtectedRoute from './ProtectedRoute'
import DashboardPersonal from 'pages/DashboardPersonal/DashboardPersonal.controller'

export const AppRoutes = () => {
  const { pathname } = useLocation()
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { isSatellite } = useSelector((state: State) => state.user)

  // get origin pathname
  const [, path] = pathname.split('/')

  // Scroll to the top of the page when moving to others page
  useEffect(() => {
    scrollUpPage()
  }, [path])

  return (
    <Switch>
      <Route exact path="/">
        <Doorman />
      </Route>
      <Route exact path="/dashboard/:tabId">
        <Dashboard />
      </Route>
      <ProtectedRoute
        path="/dashboard-personal"
        component={DashboardPersonal}
        hasAccess={Boolean(accountPkh)}
        isAuthorized={Boolean(accountPkh)}
        redirectPath={'/dashboard'}
      />
      <Route exact path="/your-vesting">
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
      <Route exact path="/satellites/satellite-details/:satelliteId">
        <SatelliteDetails />
      </Route>
      <Route exact path="/satellites/feed-details/:feedId">
        <DataFeedDetails />
      </Route>
      <Route exact path="/governance">
        <Governance />
      </Route>
      <Route exact path="/satellite-governance">
        <SatelliteGovernance />
      </Route>
      <Route exact path="/proposal-history">
        <Governance />
      </Route>
      <Route exact path="/contract-status">
        <BreakGlass />
      </Route>
      <Route exact path="/financial-requests">
        <FinancialRequests />
      </Route>
      <Route exact path="/emergency-governance">
        <EmergencyGovernance />
      </Route>
      <Route exact path="/mavryk-council/:review?">
        <Council />
      </Route>
      <Route exact path="/break-glass-council/:review?">
        <BreakGlassCouncil />
      </Route>
      <Route exact path="/oracle-users">
        <Users />
      </Route>
      <Route exact path="/satellites/user-details/:userId">
        <UserDetails />
      </Route>
      <ProtectedRoute
        path="/submit-proposal"
        component={ProposalSubmission}
        isAuthorized={Boolean(accountPkh)}
        hasAccess={isSatellite}
        redirectPath={'/'}
      />
      <Route exact path="/treasury">
        <Treasury />
      </Route>
      <Route exact path="/satellite-nodes">
        <SatelliteNodes />
      </Route>
      <Route exact path="/data-feeds">
        <DataFeeds />
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
      <Route exact path="/admin">
        <Admin />
      </Route>
      <Route exact path="/404">
        {/*TODO: Replace later on with actual 404 page*/}
        <Doorman />
      </Route>
      <Redirect to="/404" />
    </Switch>
  )
}
