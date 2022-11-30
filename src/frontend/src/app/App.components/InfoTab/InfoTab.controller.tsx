import * as React from 'react'
import { CustomTooltip } from '../Tooltip/Tooltip.view'
import { InfoTabStyled } from './InfoTab.style'

type InfoTabProps = {
  title: string
  value: string | number | JSX.Element
  tipLink: string
  customClassName?: string
  textInfo?: string
}

export const InfoTab = ({ title, value, tipLink, customClassName = '', textInfo }: InfoTabProps) => {
  return (
    <InfoTabStyled className={customClassName}>
      <h3>{title}</h3>
      <p>
        {value}{' '}
        <a className="info-link" href={tipLink} target="_blank" rel="noreferrer">
        {textInfo && <CustomTooltip
          text={textInfo}
          iconId={'info'}
          className="info-icon"
        />}
        </a>
      </p>
    </InfoTabStyled>
  )
}
