import { useState } from 'react'
import Toggle from 'react-toggle'

// types
import type { FarmsViewVariantType } from '../Farms.controller'

// components
import Icon from '../../../app/App.components/Icon/Icon.view'
import { SlidingTabButtons } from '../../../app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { Input } from '../../../app/App.components/Input/Input.controller'
import { DropDown } from '../../../app/App.components/DropDown/DropDown.controller'

// style
import { DropdownContainer } from '../../../app/App.components/DropDown/DropDown.style'
import { FarmTopBarStyled, StakedToggleContainer } from './FarmTopBar.style'

export type FarmTopBarViewProps = {
  loading: boolean
  handleToggleStakedOnly: () => void
  handleLiveFinishedToggleButtons: () => void
  handleSetFarmsViewVariant: (arg0: FarmsViewVariantType) => void
  className: string
  searchValue: string
  onSearch: (val: string) => void
  onSort: (val: string) => void
}
export const FarmTopBar = ({
  loading,
  handleToggleStakedOnly,
  handleLiveFinishedToggleButtons,
  searchValue,
  onSearch,
  onSort,
  handleSetFarmsViewVariant,
  className,
}: FarmTopBarViewProps) => {
  const itemsForDropDown = [
    { text: 'LP Balance', value: 'lpBalance' },
    { text: 'Max rewards/block', value: 'rewardPerBlock' },
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
      <StakedToggleContainer>
        <label>
          <Toggle defaultChecked={false} icons={false} onChange={handleToggleStakedOnly} className="farm-toggle" />
        </label>
        <span>Staked Only</span>
      </StakedToggleContainer>
      <SlidingTabButtons onClick={handleLiveFinishedToggleButtons} type={'Farms'} loading={loading} />
      <Input
        type="text"
        placeholder="Search..."
        value={searchValue}
        onChange={(e: any) => onSearch(e.target.value)}
        onBlur={() => {}}
      />
      <DropdownContainer>
        <h4>Order By:</h4>
        <DropDown
          clickOnDropDown={handleClickDropdown}
          placeholder={'Max Rewards...'}
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
