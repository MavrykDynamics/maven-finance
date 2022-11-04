import { matchPath } from 'react-router-dom'
import { SatelliteRecord } from 'utils/TypesAndInterfaces/Delegation'
import { SubNavigationRoute } from 'utils/TypesAndInterfaces/Navigation'

export const PRIMARY = 'primary'
export const SECONDARY = 'secondary'
export const TRANSPARENT = 'transparent'
export type NavigationLinkStyle = typeof PRIMARY | typeof SECONDARY | typeof TRANSPARENT | undefined

export const isSubLinkShown = (
  subNavLink: SubNavigationRoute,
  satelliteLedger: SatelliteRecord[],
  accountPkh?: string,
): boolean => {
  const { isSatellite, isVestee, isNotSatellite } = subNavLink.requires || {}

  if (isNotSatellite && !accountPkh) {
    return true
  }

  if (isSatellite || isVestee || isNotSatellite) {
    if (!accountPkh) return false

    // if user is logged, and link is only for satellites return true if user is satellite otherwise false
    return isNotSatellite
      ? !Boolean(satelliteLedger.find(({ address }) => address === accountPkh))
      : Boolean(satelliteLedger.find(({ address }) => address === accountPkh))
  }

  return true
}

export const checkIfLinkSelected = (pathname: string, routePaths: string | string[]) =>
  Boolean(
    Array.isArray(routePaths)
      ? routePaths.find((routePath) => matchPath(pathname, { path: routePath, exact: true, strict: true }))
      : matchPath(pathname, { path: routePaths, exact: true, strict: true }),
  )
