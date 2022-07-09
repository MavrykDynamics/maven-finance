import * as PropTypes from 'prop-types'
import * as React from 'react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { State } from 'reducers'

import { BUTTON, ButtonStyle, ButtonTypes, PRIMARY } from './Button.constants'
import { ButtonView } from './Button.view'

type ButtonProps = {
  text: string
  icon?: string
  className?: string
  kind?: ButtonStyle
  onClick?: () => void
  type?: ButtonTypes
  loading?: boolean
  disabled?: boolean
}

export const Button = ({ text, icon, kind, onClick, type, loading, disabled, className }: ButtonProps) => {
  const { glassBroken } = useSelector((state: State) => state.breakGlass)
  const [clicked, setClicked] = useState(false)
  const clickCallback = () => {
    setClicked(true)
    setTimeout(() => setClicked(false), 1000)
  }
  return (
    <ButtonView
      text={text}
      className={className}
      icon={icon}
      kind={kind}
      onClick={onClick}
      clicked={clicked}
      clickCallback={clickCallback}
      type={type}
      loading={loading}
      glassBroken={glassBroken}
      disabled={disabled}
    />
  )
}

Button.propTypes = {
  text: PropTypes.string.isRequired,
  icon: PropTypes.string,
  kind: PropTypes.string,
  onClick: PropTypes.func,
  type: PropTypes.string,
  loading: PropTypes.bool,
  glassBroken: PropTypes.bool,
}

Button.defaultProps = {
  icon: undefined,
  kind: PRIMARY,
  type: BUTTON,
  loading: false,
  glassBroken: false,
}
