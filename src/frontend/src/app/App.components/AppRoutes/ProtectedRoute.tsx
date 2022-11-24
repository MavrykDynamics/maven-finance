import { Redirect, Route, RouteProps } from 'react-router'

export type ProtectedRouteProps = {
  redirectPath: string
  isAuthorized: boolean
  hasAccess: boolean
} & RouteProps

export default function ProtectedRoute({ redirectPath, hasAccess, isAuthorized, ...routeProps }: ProtectedRouteProps) {
  if (hasAccess) {
    return <Route {...routeProps} />
  } else {
    return <Redirect to={{ pathname: redirectPath }} />
  }
}
