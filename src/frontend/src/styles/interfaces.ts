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

export interface SubNavigationLink {
  subTitle: string
  subPath: string
}
export interface MainNavigationLink {
  title: string
  id: number
  path: string
  icon: string
  subPages?: SubNavigationLink[]
}
