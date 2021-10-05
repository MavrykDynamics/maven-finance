import * as PropTypes from 'prop-types'
import * as React from 'react'
import { useState } from 'react'

import { BUTTON, ButtonStyle, ButtonTypes, PRIMARY } from './Button.constants'
import { ButtonView } from './Button.view'

type ButtonProps = {
  text: string
  icon?: string
  kind?: ButtonStyle
  onClick?: () => void
  type?: ButtonTypes
  loading: boolean
}

export const Button = ({ text, icon, kind, onClick, type, loading }: ButtonProps) => {
  const [clicked, setClicked] = useState(false)
  const clickCallback = () => {
    setClicked(true)
    setTimeout(() => setClicked(false), 1000)
  }
  return (
    <ButtonView
      text={text}
      icon={icon}
      kind={kind}
      onClick={onClick}
      clicked={clicked}
      clickCallback={clickCallback}
      type={type}
      loading={loading}
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
}

Button.defaultProps = {
  icon: undefined,
  kind: PRIMARY,
  type: BUTTON,
  loading: false,
}
