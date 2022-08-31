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
  const [activeTab, setActiveTab] = useState<number>(tabItems?.[tabItems.findIndex((item) => item.active)]?.id)

  const clickHandler = (tabId: number) => {
    setActiveTab(tabId)
    onClick(tabId)
  }

  return (
    <SlidingTabButtonsView className={className} onClick={clickHandler} activeTab={activeTab} tabValues={tabItems} />
  )
}
