import * as PropTypes from 'prop-types'
import * as React from 'react'

import { PRIMARY, PageHeaderStyle, PageHeaderContent } from './PageHeader.constants'
import { PageHeaderView } from './PageHeader.view'
import { PAGE_HEADER_DATA } from './PageHeaderData'

type PageHeaderProps = {
  page: string
  kind?: PageHeaderStyle
  loading: boolean
}

export const PageHeader = ({ page, kind, loading }: PageHeaderProps) => {
  const pageHeaderContent = PAGE_HEADER_DATA.get(page || 'staking')
  const defaultPageContent: PageHeaderContent = {
    title: 'Stake your MVK',
    subText: 'Lock your MVK to earn rewards from loan income',
    foregroundImageSrc: '',
    backgroundImageSrc: '',
  }
  const { title, subText, foregroundImageSrc, backgroundImageSrc } = pageHeaderContent || defaultPageContent
  return (
    <PageHeaderView
      page={page}
      title={title}
      subText={subText}
      foregroundImageSrc={foregroundImageSrc}
      backgroundImageSrc={backgroundImageSrc}
      kind={kind}
      loading={loading}
    />
  )
}

PageHeader.propTypes = {
  page: PropTypes.string.isRequired,
  kind: PropTypes.string,
  loading: PropTypes.bool,
}

PageHeader.defaultProps = {
  page: 'Dashboard',
  kind: PRIMARY,
  loading: false,
}
