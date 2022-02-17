import * as PropTypes from 'prop-types'
import * as React from 'react'

import { PageHeaderStyle, PRIMARY } from './PageHeader.constants'
import {
  PageHeaderForegroundImage,
  PageHeaderForegroundImageContainer,
  PageHeaderStyled,
  PageHeaderTextArea,
} from './PageHeader.style'

type PageHeaderViewProps = {
  page: string
  title: string
  subText: string
  backgroundImageSrc?: string
  foregroundImageSrc?: string
  kind?: PageHeaderStyle
  loading: boolean
}

export const PageHeaderView = ({
  page,
  title,
  subText,
  foregroundImageSrc,
  backgroundImageSrc,
  kind,
  loading,
}: PageHeaderViewProps) => {
  return (
    <>
      <PageHeaderStyled backgroundImageSrc={backgroundImageSrc || ''}>
        <PageHeaderTextArea>
          <h1>{title}</h1>
          <p>{subText}</p>
        </PageHeaderTextArea>
        <PageHeaderForegroundImageContainer>
          <PageHeaderForegroundImage page={page} src={foregroundImageSrc || '/images/portal.svg'} alt="portal" />
        </PageHeaderForegroundImageContainer>
      </PageHeaderStyled>
      <br />
    </>
  )
}

PageHeaderView.propTypes = {
  title: PropTypes.string.isRequired,
  subText: PropTypes.string.isRequired,
  foregroundImageSrc: PropTypes.string,
  backgroundImageSrc: PropTypes.string,
  kind: PropTypes.string,
  loading: PropTypes.bool,
}

PageHeaderView.defaultProps = {
  title: 'Dashboard',
  subText: '',
  foregroundImageSrc: undefined,
  backgroundImageSrc: undefined,
  kind: PRIMARY,
  loading: false,
}
