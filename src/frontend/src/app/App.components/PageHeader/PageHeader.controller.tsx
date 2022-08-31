import { PageHeaderView } from './PageHeader.view'
import { PAGE_HEADER_DATA } from './PageHeaderData'

type PageHeaderProps = {
  page: string
}

export const PageHeader = ({ page }: PageHeaderProps) => {
  const pageHeaderContent = PAGE_HEADER_DATA.get(page)
  if (!pageHeaderContent) return null
  const { title, subText, foregroundImageSrc, backgroundImageSrc } = pageHeaderContent
  return (
    <PageHeaderView
      page={page}
      title={title}
      subText={subText}
      foregroundImageSrc={foregroundImageSrc}
      backgroundImageSrc={backgroundImageSrc}
    />
  )
}
