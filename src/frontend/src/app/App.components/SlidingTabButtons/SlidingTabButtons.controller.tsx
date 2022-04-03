import * as PropTypes from 'prop-types'
import * as React from 'react'
import { Ref, useEffect, useRef, useState } from 'react'

import {
  SlidingTabButtonStyle,
  SlidingTabButtonTypes,
  PRIMARY,
  FARMS,
  GOV_PROPOSAL_SUBMISSION_FORM,
} from './SlidingTabButtons.constants'
import { SlidingTabButtonsView } from './SlidingTabButtons.view'

export interface TabItem {
  text: string
  id: number
  active: boolean
  ref: Ref<any>
}
type SlidingTabButtonsProps = {
  type: SlidingTabButtonTypes
  icon?: string
  kind?: SlidingTabButtonStyle
  onClick?: () => void
  loading: boolean
}

export const SlidingTabButtons = ({ type, kind, onClick, loading }: SlidingTabButtonsProps) => {
  const [tabValues, setTabValues] = useState<TabItem[]>([])
  const firstButtonRef = useRef(),
    secondButtonRef = useRef(),
    thirdButtonRef = useRef()

  useEffect(() => {
    switch (type) {
      case GOV_PROPOSAL_SUBMISSION_FORM:
        setTabValues([
          { text: 'Stage 1', id: 1, active: true, ref: firstButtonRef },
          { text: 'Stage 2', id: 2, active: false, ref: secondButtonRef },
          { text: 'Stage 3', id: 3, active: false, ref: thirdButtonRef },
        ])
        break
      case FARMS:
        setTabValues([
          { text: 'LIVE', id: 1, active: true, ref: firstButtonRef },
          { text: 'FINISHED', id: 2, active: false, ref: secondButtonRef },
        ])
        break
    }
  }, [type])
  const [clicked, setClicked] = useState(false)

  const setActive = (itemId: number, tabId: number) => itemId === tabId
  const clickCallback = (tabId: number) => {
    const newTabItems = tabValues.map((o) => Object.assign(o, { active: setActive(o.id, tabId) }))
    setTabValues(newTabItems)
    setClicked(true)
    setTimeout(() => setClicked(false), 1000)
  }

  return (
    <SlidingTabButtonsView
      kind={kind}
      onClick={onClick}
      clicked={clicked}
      clickCallback={clickCallback}
      tabValues={tabValues}
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
  type: GOV_PROPOSAL_SUBMISSION_FORM,
  loading: false,
}
