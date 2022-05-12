import * as PropTypes from 'prop-types'
import * as React from 'react'
import { Link } from 'react-router-dom'
import { BUTTON, RoutingButtonStyle, RoutingButtonTypes, PRIMARY } from './RoutingButton.constants'
import {
  RoutingButtonIcon,
  RoutingButtonLoadingIcon,
  RoutingButtonStyled,
  RoutingButtonText,
} from './RoutingButton.style'

type RoutingButtonViewProps = {
  text: string
  icon?: string
  kind?: RoutingButtonStyle
  onClick?: () => void
  clickCallback: () => void
  clicked: boolean
  type?: RoutingButtonTypes
  loading: boolean
  pathName: string
  pathParams: any
}

export const RoutingButtonView = ({
  text,
  icon,
  kind = 'primary',
  onClick,
  clickCallback,
  clicked,
  type,
  loading,
  pathName,
  pathParams,
}: RoutingButtonViewProps) => {
  let routingButtonClasses = kind
  if (clicked) routingButtonClasses += ' clicked'
  if (loading) routingButtonClasses += ' loading'

  return (
    <Link to={{ pathname: pathName, pathParams }}>
      <RoutingButtonStyled
        className={routingButtonClasses}
        onClick={() => {
          clickCallback()
          onClick && onClick()
        }}
        type={type}
      >
        <RoutingButtonText>
          {loading ? (
            <>
              <RoutingButtonLoadingIcon className={kind}>
                <use xlinkHref="/icons/sprites.svg#loading" />
              </RoutingButtonLoadingIcon>
              <div>Loading...</div>
            </>
          ) : (
            <>
              {icon && (
                <RoutingButtonIcon className={kind}>
                  <use xlinkHref={`/icons/sprites.svg#${icon}`} />
                </RoutingButtonIcon>
              )}
              <div>{text}</div>
            </>
          )}
        </RoutingButtonText>
      </RoutingButtonStyled>
    </Link>
  )
}

RoutingButtonView.propTypes = {
  text: PropTypes.string.isRequired,
  icon: PropTypes.string,
  kind: PropTypes.string,
  onClick: PropTypes.func,
  clickCallback: PropTypes.func.isRequired,
  clicked: PropTypes.bool.isRequired,
  type: PropTypes.string,
  loading: PropTypes.bool,
  glassBroken: PropTypes.bool,
}

RoutingButtonView.defaultProps = {
  icon: undefined,
  kind: PRIMARY,
  type: BUTTON,
  loading: false,
  glassBroken: false,
}
