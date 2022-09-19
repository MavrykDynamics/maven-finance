export interface SubNavigationRoute {
  id: number
  subTitle: string
  subPath: string
  routeSubPath: string
  protectedRoute: boolean
  requires?: {
    isSatellite?: boolean
    isVestee?: boolean
  }
}
export interface MainNavigationRoute {
  title: string
  id: number
  path: string
  routePath: string
  icon: string
  subPages?: SubNavigationRoute[]
  protectedRoute: boolean
  requires?: {
    isSatellite?: boolean
    isVestee?: boolean
  }
}
