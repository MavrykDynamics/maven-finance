import { DropdownContainer, FarmTopBarStyled, StakedToggleContainer } from './FarmTopBar.style'
import * as React from 'react'
import Toggle from 'react-toggle'
import { SlidingTabButtons } from '../../../app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { Input } from '../../../app/App.components/Input/Input.controller'
import { DropDown } from '../../../app/App.components/DropDown/DropDown.controller'
import { useState } from 'react'

export type FarmTopBarViewProps = {
  loading: boolean
  handleToggleStakedOnly: () => void
  handleLiveFinishedToggleButtons: () => void
  searchValue: string
  onSearch: (val: string) => void
  onSort: (val: string) => void
}
export const FarmTopBarView = ({
  loading,
  handleToggleStakedOnly,
  handleLiveFinishedToggleButtons,
  searchValue,
  onSearch,
  onSort,
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
    <FarmTopBarStyled>
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
    </FarmTopBarStyled>
  )
}
