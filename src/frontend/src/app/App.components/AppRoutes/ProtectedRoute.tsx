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
  if (!canCheck) {
    return null
  }

  if (hasAccess) {
    return <Route {...routeProps} />
  }

  return <Redirect to={{ pathname: redirectPath }} />
}
