import { useMemo, useState } from 'react'

// types
import type { FarmsViewVariantType } from '../Farms.controller'

// components
import Icon from '../../../app/App.components/Icon/Icon.view'
import Toggle from '../../../app/App.components/Toggle/Toggle.view'
import { SlidingTabButtons } from '../../../app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { Input } from '../../../app/App.components/Input/Input.controller'
import { DropDown } from '../../../app/App.components/DropDown/DropDown.controller'

// style
import { DropdownContainer } from '../../../app/App.components/DropDown/DropDown.style'
import { FarmTopBarStyled } from './FarmTopBar.style'

export type FarmTopBarViewProps = {
  ready: boolean
  handleToggleStakedOnly: () => void
  handleLiveFinishedToggleButtons: (tabId: number) => void
  handleSetFarmsViewVariant: (arg0: FarmsViewVariantType) => void
  className: string
  searchValue: string
  onSearch: (val: string) => void
  onSort: (val: string) => void
  toggleChecked: boolean
  liveFinishedIdSelected: number
}

export const LIVE_TAB_ID = 1
export const FINISHED_TAB_ID = 2

export const FarmTopBar = ({
  ready,
  handleToggleStakedOnly,
  handleLiveFinishedToggleButtons,
  searchValue,
  onSearch,
  onSort,
  handleSetFarmsViewVariant,
  className,
  toggleChecked,
  liveFinishedIdSelected,
}: FarmTopBarViewProps) => {
  const itemsForDropDown = [
    { text: 'Active', value: 'active' },
    { text: 'Highest APY', value: 'highestAPY' },
    { text: 'Lowest APY', value: 'lowestAPY' },
    { text: 'Highest liquidity (lpBalance)', value: 'highestLiquidity' },
    { text: 'Lowest liquidity (lpBalance)', value: 'lowestLiquidity' },
    { text: 'Your Largest Stake', value: 'yourLargestStake' },
    { text: 'Rewards Per Block', value: 'rewardsPerBlock' },
  ]
  const [ddItems, _] = useState(itemsForDropDown.map(({ text }) => text))
  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [chosenDdItem, setChosenDdItem] = useState<{ text: string; value: string } | undefined>(undefined)

  const handleClickDropdown = () => {
    setDdIsOpen(!ddIsOpen)
  }
  const handleOnClickDropdownItem = (e: string) => {
    const chosenItem = itemsForDropDown.filter((item) => item.text === e)[0]
    setChosenDdItem(chosenItem)
    setDdIsOpen(!ddIsOpen)
    onSort(chosenItem.value)
  }

  const liveFinishedTabs = useMemo(
    () => [
      { text: 'Live', id: LIVE_TAB_ID, active: liveFinishedIdSelected === LIVE_TAB_ID },
      { text: 'Finished', id: FINISHED_TAB_ID, active: liveFinishedIdSelected === FINISHED_TAB_ID },
    ],
    [liveFinishedIdSelected],
  )

  return (
    <FarmTopBarStyled className={className}>
      <Toggle
        checked={toggleChecked}
        disabled={!ready}
        onChange={handleToggleStakedOnly}
        className="farm-toggle"
        sufix="Staked Only"
      />
      <SlidingTabButtons tabItems={liveFinishedTabs} className="tab-bar" onClick={handleLiveFinishedToggleButtons} />
      <Input
        type="text"
        placeholder="Search..."
        value={searchValue}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearch(e.target.value)}
        onBlur={() => {}}
      />
      <DropdownContainer className="order-by">
        <h4>Order By:</h4>
        <DropDown
          clickOnDropDown={handleClickDropdown}
          placeholder={'Choose order'}
          isOpen={ddIsOpen}
          itemSelected={chosenDdItem?.text}
          items={ddItems}
          clickOnItem={(e) => handleOnClickDropdownItem(e)}
        />
      </DropdownContainer>
      <div className="change-view">
        <button className="btn-horizontal" onClick={() => handleSetFarmsViewVariant('horizontal')}>
          <Icon id="hamburger" />
        </button>
        <button className="btn-vertical" onClick={() => handleSetFarmsViewVariant('vertical')}>
          <Icon id="hamburger" />
        </button>
      </div>
    </FarmTopBarStyled>
  )
}
