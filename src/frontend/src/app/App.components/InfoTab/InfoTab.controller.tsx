import * as React from 'react'
import Icon from '../Icon/Icon.view'
import { InfoTabStyled } from './InfoTab.style'

type InfoTabProps = {
  title: string
  value: string
  tipLink: string
  customClassName?: string
}

export const InfoTab = ({ title, value, tipLink, customClassName = '' }: InfoTabProps) => {
  return (
    <InfoTabStyled className={customClassName}>
      <h3>{title}</h3>
      <p>
        {value}{' '}
        <a className="info-link" href={tipLink} target="_blank" rel="noreferrer">
          <Icon id="question" />
        </a>
      </p>
    </InfoTabStyled>
  )
}
