export type RequiresProperties = {
  isSatellite?: boolean
  isNotSatellite?: boolean
  isVestee?: boolean
  isUnregisteredSatellite?: boolean
  isAuth?: boolean
}

export interface SubNavigationRoute {
  id: number
  subTitle: string
  subPath: string
  routeSubPath: string | string[]
  requires?: RequiresProperties
  disabled?: boolean
}
export interface MainNavigationRoute {
  title: string
  id: number
  path: string
  routePath: string | string[]
  icon: string
  subPages?: SubNavigationRoute[]
  disabled?: boolean
  requires?: RequiresProperties
}
