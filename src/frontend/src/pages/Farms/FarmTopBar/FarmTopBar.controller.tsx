import { useState } from 'react'

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
  handleLiveFinishedToggleButtons: () => void
  handleSetFarmsViewVariant: (arg0: FarmsViewVariantType) => void
  className: string
  searchValue: string
  onSearch: (val: string) => void
  onSort: (val: string) => void
  toggleChecked: boolean
}

const LIVE_FINISHED_TABS = [
  { text: 'Live', id: 1, active: true },
  { text: 'Finished', id: 2, active: false },
]

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
  const handleOnClickDropdownItem = (e: any) => {
    const chosenItem = itemsForDropDown.filter((item) => item.text === e)[0]
    setChosenDdItem(chosenItem)
    setDdIsOpen(!ddIsOpen)
    onSort(chosenItem.value)
  }

  return (
    <FarmTopBarStyled className={className}>
      <Toggle
        checked={toggleChecked}
        disabled={!ready}
        onChange={handleToggleStakedOnly}
        className="farm-toggle"
        sufix="Staked Only"
      />
      <SlidingTabButtons tabItems={LIVE_FINISHED_TABS} className="tab-bar" onClick={handleLiveFinishedToggleButtons} />
      <Input
        type="text"
        placeholder="Search..."
        value={searchValue}
        onChange={(e: any) => onSearch(e.target.value)}
        onBlur={() => {}}
      />
      <DropdownContainer className="order-by">
        <h4>Order By:</h4>
        <DropDown
          clickOnDropDown={handleClickDropdown}
          placeholder={'Choose order'}
          onChange={onSort}
          isOpen={ddIsOpen}
          itemSelected={chosenDdItem?.text}
          items={ddItems}
          onBlur={() => {}}
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
