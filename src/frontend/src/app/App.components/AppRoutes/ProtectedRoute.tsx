import { Redirect, Route, RouteProps } from 'react-router'

export type ProtectedRouteProps = {
  redirectPath: string
  isAuthorized: boolean
  hasAccess: boolean
  canCheck: boolean
} & RouteProps

export default function ProtectedRoute({
  canCheck,
  redirectPath,
  hasAccess,
  isAuthorized,
  ...routeProps
}: ProtectedRouteProps) {
  console.log('can', canCheck, hasAccess)

  if (!canCheck) {
    return null
  }

  console.log('hasAccess', hasAccess)

  if (hasAccess) {
    return <Route {...routeProps} />
  }

  return <Redirect to={{ pathname: redirectPath }} />
}
