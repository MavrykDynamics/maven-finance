import * as React from 'react'
import { Redirect, Route, RouteProps, useLocation } from 'react-router'
import { SatelliteRecord } from '../../../utils/TypesAndInterfaces/Delegation'

export type ProtectedRouteProps = {
  authenticationPath: string
  redirectPath: string
  arrayToFilterThrough: any[] | undefined
  accountPkh: string | undefined
} & RouteProps

export default function ProtectedRoute({
  authenticationPath,
  redirectPath,
  accountPkh,
  arrayToFilterThrough,
  ...routeProps
}: ProtectedRouteProps) {
  const currentLocation = useLocation()
  const isAuthorized = isAllowedToRoute(accountPkh, redirectPath, arrayToFilterThrough)

  if (isAuthorized && redirectPath === currentLocation.pathname) {
    return <Route {...routeProps} />
  } else {
    return <Redirect to={{ pathname: isAuthorized ? redirectPath : authenticationPath }} />
  }
}

const isAllowedToRoute = (accountPkh: string | undefined, path: string, arrayToFilterThrough: any[] | undefined) => {
  let isAllowed
  switch (path) {
    case '/submit-proposal':
      const accountPkhIsSatellite = arrayToFilterThrough?.filter(
        (satellite: SatelliteRecord) => satellite.address === accountPkh,
      )[0]
      isAllowed = accountPkhIsSatellite
      break
    default:
      isAllowed = false
  }

  return isAllowed
}
