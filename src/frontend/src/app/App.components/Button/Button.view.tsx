import * as PropTypes from 'prop-types'
import * as React from 'react'

import { BUTTON, ButtonStyle, ButtonTypes, PRIMARY } from './Button.constants'
import { ButtonIcon, ButtonLoadingIcon, ButtonStyled, ButtonText } from './Button.style'

type ButtonViewProps = {
  text: string
  icon?: string
  className?: string
  kind?: ButtonStyle
  onClick?: () => void
  clickCallback: () => void
  clicked: boolean
  type?: ButtonTypes
  loading?: boolean
  glassBroken?: boolean
  disabled?: boolean
}

export const ButtonView = ({
  text,
  icon,
  kind,
  onClick,
  clickCallback,
  clicked,
  type,
  loading,
  glassBroken,
  disabled,
  className = '',
}: ButtonViewProps) => {
  let buttonClasses = kind
  if (clicked) buttonClasses += ' clicked'
  if (loading) buttonClasses += ' loading'
  if (glassBroken) {
    buttonClasses += ' glassBroken'
    kind += ' glassBroken'
  }
  if (disabled) {
    buttonClasses += ' disabled'
    kind += ' disabled'
  }
  return (
    <ButtonStyled
      className={`${buttonClasses} ${className}`}
      onClick={() => {
        clickCallback()
        onClick && onClick()
      }}
      type={type}
      disabled={glassBroken || disabled}
    >
      <ButtonText>
        {loading ? (
          <>
            <ButtonLoadingIcon className={kind}>
              <use xlinkHref="/icons/sprites.svg#loading" />
            </ButtonLoadingIcon>
            <div>Loading...</div>
          </>
        ) : (
          <>
            {icon && (
              <ButtonIcon className={kind}>
                <use xlinkHref={`/icons/sprites.svg#${icon}`} />
              </ButtonIcon>
            )}
            <div>{text}</div>
          </>
        )}
      </ButtonText>
    </ButtonStyled>
  )
}

ButtonView.propTypes = {
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

ButtonView.defaultProps = {
  icon: undefined,
  kind: PRIMARY,
  type: BUTTON,
  loading: false,
  glassBroken: false,
}
