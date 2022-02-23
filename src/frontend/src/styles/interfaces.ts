export interface MavrykTheme {
  backgroundColor: string
  containerColor: string
  borderColor: string
  textColor: string
  subTextColor: string
  backgroundTextColor: string
  placeholderColor: string
  primaryColor: string
  secondaryColor: string
  upColor: string
  downColor: string
  warningColor: string
  infoColor: string
  selectedColor: string
}

export interface SubNavigationRoute {
  subTitle: string
  subPath: string
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
  icon: string
  subPages?: SubNavigationRoute[]
  protectedRoute: boolean
  requires?: {
    isSatellite?: boolean
    isVestee?: boolean
  }
}
