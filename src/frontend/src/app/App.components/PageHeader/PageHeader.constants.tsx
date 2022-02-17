export const PRIMARY = 'primary'
export const ANIMATED = 'transparent'
export type PageHeaderStyle = typeof PRIMARY | typeof ANIMATED | undefined

export interface PageHeaderContent {
  title: string
  subText: string
  backgroundImageSrc: string
  foregroundImageSrc: string
  kind?: PageHeaderStyle
}
