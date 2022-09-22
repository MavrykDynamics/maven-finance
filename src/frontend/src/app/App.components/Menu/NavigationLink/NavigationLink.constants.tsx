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
  const { isSatellite, isVestee } = subNavLink.requires || {}

  if (isSatellite || isVestee) {
    if (!accountPkh) return false

    // if user is logged, and link is only for satellites return true if user is satellite otherwise false
    return Boolean(satelliteLedger.find(({ address }) => address === accountPkh))
  }

  return true
}
