import * as React from 'react'
import { ButtonStyle, ButtonTypes } from './Button.constants'
import { ButtonIcon, ButtonLoadingIcon, ButtonStyled, ButtonText } from './Button.style'

type ButtonViewProps = {
  text: string
  icon?: string
  className?: string
  kind?: ButtonStyle
  onClick?: (e: React.MouseEvent<HTMLElement>) => void
  type?: ButtonTypes
  loading?: boolean
  disabled?: boolean
  strokeWidth?: number
}

export const ButtonView = ({
  text,
  icon,
  kind,
  onClick,
  type,
  loading,
  disabled,
  strokeWidth,
  className = '',
}: ButtonViewProps) => {
  const fullKind = `${kind} ${disabled ? 'disabled' : ''}`
  const buttonClasses = `${fullKind} ${loading ? 'loading' : ''} ${className}`

  return (
    <ButtonStyled className={`${buttonClasses}`} onClick={onClick} type={type} disabled={disabled}>
      <ButtonText>
        {loading ? (
          <>
            <ButtonLoadingIcon className={fullKind}>
              <use xlinkHref="/icons/sprites.svg#loading" />
            </ButtonLoadingIcon>
            <div>Loading...</div>
          </>
        ) : (
          <>
            {icon && (
              <ButtonIcon className={fullKind} strokeWidth={strokeWidth}>
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
