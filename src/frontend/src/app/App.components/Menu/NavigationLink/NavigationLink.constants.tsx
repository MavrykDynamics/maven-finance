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
  const { isSatellite, isVestee, isNotSatellite, isUnregisteredSatellite, isAuth } = subNavLink.requires || {}

  if (isAuth && !accountPkh) {
    return false
  }

  if (isNotSatellite && !accountPkh) {
    return true
  }

  // if the user is a satellite but is not currently registered to return true
  if (isUnregisteredSatellite) {
    if (!accountPkh) return false

    const isSatellite = satelliteLedger.find(({ address }) => {
      return address === accountPkh
    })

    const isUnregistartion = isSatellite ? isSatellite.currentlyRegistered === false : false

    return isUnregistartion
  }

  if (isSatellite || isVestee || isNotSatellite) {
    if (!accountPkh) return false

    // if user is logged, and link is only for satellites return true if user is currently registered satellite otherwise false
    return isNotSatellite
      ? !Boolean(satelliteLedger.find(({ address }) => address === accountPkh))
      : Boolean(satelliteLedger.find(({ address }) => address === accountPkh)?.currentlyRegistered)
  }

  return true
}

export const checkIfLinkSelected = (pathname: string, routePaths: string | string[]) =>
  Boolean(
    Array.isArray(routePaths)
      ? routePaths.find((routePath) => matchPath(pathname, { path: routePath, exact: true, strict: true }))
      : matchPath(pathname, { path: routePaths, exact: true, strict: true }),
  )
