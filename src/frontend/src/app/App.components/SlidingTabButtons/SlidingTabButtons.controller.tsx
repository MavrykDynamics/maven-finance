import { Ref, useState } from 'react'

import { SlidingTabButtonStyle } from './SlidingTabButtons.constants'
import { SlidingTabButtonsView } from './SlidingTabButtons.view'

export interface TabItem {
  text: string
  id: number
  active: boolean
  ref?: Ref<any>
}

type SlidingTabButtonsProps = {
  icon?: string
  className?: string
  kind?: SlidingTabButtonStyle
  onClick?: () => void
  tabItems?: TabItem[]
}

export const SlidingTabButtons = ({ kind, onClick, className = '', tabItems }: SlidingTabButtonsProps) => {
  const [tabValues, setTabValues] = useState<TabItem[]>(tabItems || [])
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
      className={className}
      onClick={onClick}
      clicked={clicked}
      clickCallback={clickCallback}
      tabValues={tabValues}
    />
  )
}
