import * as PropTypes from 'prop-types'
import * as React from 'react'

import { ERROR } from './Toaster.constants'
// prettier-ignore
import { ToasterClose, ToasterContent, ToasterCountdown, ToasterGrid, ToasterIcon, ToasterMessage, ToasterStyled, ToasterTitle } from './Toaster.style'

type ToasterViewProps = {
  showing: boolean
  status?: string
  title: string
  message: string
  closeCallback: () => void
}

export const ToasterView = ({ showing, status, title, message, closeCallback }: ToasterViewProps) => {
  return (
    <ToasterStyled showing={showing}>
      <ToasterGrid>
        <ToasterIcon status={status}>
          <svg>
            <use xlinkHref={`/icons/sprites.svg#${status}`} />
          </svg>
        </ToasterIcon>
        <ToasterContent>
          <ToasterTitle>{title}</ToasterTitle>
          <ToasterMessage>{message}</ToasterMessage>
        </ToasterContent>
        <ToasterClose onClick={() => closeCallback()}>
          <svg>
            <use xlinkHref="/icons/sprites.svg#close" />
          </svg>
        </ToasterClose>
      </ToasterGrid>
      <ToasterCountdown showing={showing} status={status} />
    </ToasterStyled>
  )
}

ToasterView.propTypes = {
  showing: PropTypes.bool.isRequired,
  status: PropTypes.string,
  title: PropTypes.string,
  message: PropTypes.string,
  closeCallback: PropTypes.func.isRequired,
}

ToasterView.defaultProps = {
  status: ERROR,
  title: 'Error',
  message: 'Undefined error',
}
