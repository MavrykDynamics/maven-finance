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
  let showLink = true

  if (isSatellite || isVestee) {
    if (!accountPkh) return false

    const accountPkhIsSatellite = satelliteLedger.find(({ address }) => address === accountPkh)
    showLink = Boolean(accountPkhIsSatellite)
  }

  return showLink
}
