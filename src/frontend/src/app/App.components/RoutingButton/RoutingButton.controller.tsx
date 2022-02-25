import * as PropTypes from 'prop-types'
import * as React from 'react'
import { useState } from 'react'

import { BUTTON, RoutingButtonStyle, RoutingButtonTypes, PRIMARY } from './RoutingButton.constants'
import { RoutingButtonView } from './RoutingButton.view'
import { useSelector } from 'react-redux'
import { State } from '../../../reducers'

type RoutingButtonProps = {
  text: string
  icon?: string
  kind?: RoutingButtonStyle
  onClick?: () => void
  type?: RoutingButtonTypes
  loading: boolean
  pathName: string
  pathParams?: any
}

export const RoutingButton = ({
  text,
  icon,
  kind,
  onClick,
  type,
  loading,
  pathName,
  pathParams,
}: RoutingButtonProps) => {
  const [clicked, setClicked] = useState(false)
  const clickCallback = () => {
    setClicked(true)
    setTimeout(() => setClicked(false), 1000)
  }
  return (
    <RoutingButtonView
      text={text}
      icon={icon}
      kind={kind}
      onClick={onClick}
      clicked={clicked}
      clickCallback={clickCallback}
      type={type}
      loading={loading}
      pathName={pathName}
      pathParams={pathParams}
    />
  )
}

RoutingButton.propTypes = {
  text: PropTypes.string.isRequired,
  icon: PropTypes.string,
  kind: PropTypes.string,
  onClick: PropTypes.func,
  type: PropTypes.string,
  loading: PropTypes.bool,
  pathName: PropTypes.string,
  pathParams: PropTypes.any,
}

RoutingButton.defaultProps = {
  icon: undefined,
  kind: PRIMARY,
  type: BUTTON,
  loading: false,
  pathName: '/',
  pathParams: null,
}
