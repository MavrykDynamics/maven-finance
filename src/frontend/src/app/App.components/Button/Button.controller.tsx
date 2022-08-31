import React from 'react'

import { BUTTON, ButtonStyle, ButtonTypes, PRIMARY } from './Button.constants'
import { ButtonView } from './Button.view'

export type ButtonProps = {
  text: string
  icon?: string
  className?: string
  kind?: ButtonStyle
  onClick?: (e: React.MouseEvent<HTMLElement>) => void
  type?: ButtonTypes
  loading?: boolean
  disabled?: boolean
}

export const Button = ({
  text,
  icon,
  kind = PRIMARY,
  onClick,
  type = BUTTON,
  loading,
  disabled,
  className,
}: ButtonProps) => {
  return (
    <ButtonView
      text={text}
      className={className}
      icon={icon}
      kind={kind}
      onClick={onClick}
      type={type}
      loading={loading}
      disabled={disabled}
    />
  )
}
