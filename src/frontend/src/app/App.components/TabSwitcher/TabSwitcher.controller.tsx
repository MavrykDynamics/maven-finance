import React, { useState, useEffect } from "react";

// styles
import { TabSwitcherStyled, ButtonStyled } from "./TabSwitcher.style";

export type TabItem = {
  text: string
  id: number
  active: boolean
  isDisabled?: boolean
}

type Props = {
  onClick: (tabId: number) => void
  tabItems: TabItem[]
  disabled?: boolean
  disableAll?: boolean
  className?: string
}

export function TabSwitcher({ 
  onClick,
  tabItems,
  disabled = false,
  disableAll = false,
  className,
 }: Props) {
  // if we found active item by default set it, othervise set first item active, if it's not disabled
  const [activeTab, setActiveTab] = useState<number | undefined>(
    tabItems.find(({ active, isDisabled }) => active && !isDisabled)?.id ?? tabItems[0]?.isDisabled
      ? tabItems[0]?.id
      : undefined,
  )

  useEffect(() => {
    const foundActiveTabId = tabItems.find(({ active, isDisabled }) => active && !isDisabled)?.id
    if (foundActiveTabId) {
      setActiveTab(foundActiveTabId)
    }
  }, [tabItems])

  useEffect(() => {
    if (disableAll) {
      setActiveTab(undefined)
    }
  }, [disableAll])

  const clickHandler = (tabId: number) => {
    if (disabled) return
    setActiveTab(tabId)
    onClick(tabId)
  }
    
  return (
    <TabSwitcherStyled className={`${className} ${disabled && 'disabled'}`}>
      {tabItems.map((tabItem) => (
        <ButtonStyled
          key={tabItem.id}
          disabled={Boolean(tabItem.isDisabled)}
          onClick={() => clickHandler(tabItem.id)}
          buttonActive={activeTab === tabItem.id}
        >
          {tabItem.text}
        </ButtonStyled>
      ))}
    </TabSwitcherStyled>
  )
}
