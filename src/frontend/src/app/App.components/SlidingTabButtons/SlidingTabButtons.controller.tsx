import * as PropTypes from 'prop-types'
import * as React from 'react'
import { useRef, useState } from 'react'

import { SlidingTabButtonStyle, SlidingTabButtonTypes, PRIMARY, TABS } from './SlidingTabButtons.constants'
import { SlidingTabButtonsView } from './SlidingTabButtons.view'

type SlidingTabButtonsProps = {
  icon?: string
  kind?: SlidingTabButtonStyle
  onClick?: () => void
  type?: SlidingTabButtonTypes
  loading: boolean
}

export const SlidingTabButtons = ({ kind, onClick, type, loading }: SlidingTabButtonsProps) => {
  const [clicked, setClicked] = useState(false)

  const clickCallback = () => {
    setClicked(true)
    setTimeout(() => setClicked(false), 1000)
  }

  return (
    <SlidingTabButtonsView
      kind={kind}
      onClick={onClick}
      clicked={clicked}
      clickCallback={clickCallback}
      type={type}
      loading={loading}
    />
  )
}

SlidingTabButtons.propTypes = {
  kind: PropTypes.string,
  onClick: PropTypes.func,
  type: PropTypes.string,
  loading: PropTypes.bool,
}

SlidingTabButtons.defaultProps = {
  kind: PRIMARY,
  type: TABS,
  loading: false,
}
