export type RequiresProperties = {
  isSatellite?: boolean
  isNotSatellite?: boolean
  isVestee?: boolean
}

export interface SubNavigationRoute {
  id: number
  subTitle: string
  subPath: string
  routeSubPath: string
  protectedRoute: boolean
  requires?: RequiresProperties
}
export interface MainNavigationRoute {
  title: string
  id: number
  path: string
  routePath: string
  icon: string
  subPages?: SubNavigationRoute[]
  protectedRoute: boolean
  requires?: RequiresProperties
}
