import { useState } from 'react'
import { SlidingTabButtonsView } from './SlidingTabButtons.view'

export interface TabItem {
  text: string
  id: number
  active: boolean
}

type SlidingTabButtonsProps = {
  className?: string
  onClick: (tabId: number) => void
  tabItems: TabItem[]
}

export const SlidingTabButtons = ({ onClick, className = '', tabItems = [] }: SlidingTabButtonsProps) => {
  const [activeTab, setActiveTab] = useState<number>(tabItems[0].id)

  const clickHandler = (tabId?: number) => {
    setActiveTab(tabId ?? 0)
    onClick(tabId ?? 0)
  }

  return (
    <SlidingTabButtonsView className={className} onClick={clickHandler} activeTab={activeTab} tabValues={tabItems} />
  )
}
