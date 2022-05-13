import { DropdownContainer } from 'app/App.components/DropDown/DropDown.style'
import { Input } from 'app/App.components/Input/Input.controller'
import * as React from 'react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import Select from 'react-select'

import { DropDown } from '../../../app/App.components/DropDown/DropDown.controller'
import { State } from '../../../reducers'
import { darkMode, lightMode } from '../../../styles'
import { SatelliteRecord } from '../../../utils/TypesAndInterfaces/Delegation'
// prettier-ignore
import { SatelliteListEmptyContainer, SatelliteListStyled, SatelliteSearchFilter, SelectContainer } from './SatelliteList.style'
import { SatelliteListCard } from './SatellliteListCard/SatelliteListCard.view'

type SatelliteListViewProps = {
  loading: boolean
  satellitesList: SatelliteRecord[]
  delegateCallback: (satelliteAddress: string) => void
  undelegateCallback: (satelliteAddress: string) => void
  handleSearch: (e: any) => void
  handleSelect: (selectedOption: any) => void
  userStakedBalance: number
  satelliteUserIsDelegatedTo: string
  satelliteFound: boolean | undefined
}

export const SatelliteListView = ({
  loading,
  satellitesList,
  delegateCallback,
  undelegateCallback,
  handleSearch,
  handleSelect,
  userStakedBalance,
  satelliteUserIsDelegatedTo,
  satelliteFound,
}: SatelliteListViewProps) => {
  if (satelliteFound === undefined && !loading && satellitesList.length === 0) {
    return <EmptySatelliteList />
  } else {
    return (
      <ListWithSatellites
        loading={loading}
        satellitesList={satellitesList}
        delegateCallback={delegateCallback}
        undelegateCallback={undelegateCallback}
        handleSearch={handleSearch}
        handleSelect={handleSelect}
        userStakedBalance={userStakedBalance}
        satelliteUserIsDelegatedTo={satelliteUserIsDelegatedTo}
        satelliteFound={satelliteFound}
      />
    )
  }
}

const EmptySatelliteList = () => {
  return (
    <SatelliteListEmptyContainer>
      <img src="/images/not-found.svg" alt="No satellites found" />
      <figcaption>No satellites found</figcaption>
    </SatelliteListEmptyContainer>
  )
}

const ListWithSatellites = ({
  loading,
  satellitesList,
  delegateCallback,
  undelegateCallback,
  handleSearch,
  handleSelect,
  userStakedBalance,
  satelliteUserIsDelegatedTo,
  satelliteFound,
}: SatelliteListViewProps) => {
  const { darkThemeEnabled } = useSelector((state: State) => state.preferences)
  const selectOptions = [
    { value: 'satelliteFee', label: 'Lowest Fee' },
    { value: 'satelliteFee', label: 'Highest Fee' },
    { value: 'totalDelegatedAmount', label: 'Delegated MVK' },
    { value: 'participation', label: 'Participation' },
  ]
  const customStyles = {
    menu: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: darkThemeEnabled ? darkMode.placeholderColor : lightMode.placeholderColor,
      color: darkThemeEnabled ? darkMode.subTextColor : lightMode.subTextColor,
    }),
  }
  const itemsForDropDown = [
    { text: 'Lowest Fee', value: 'satelliteFee' },
    { text: 'Highest Fee', value: 'satelliteFee' },
    { text: 'Delegated MVK', value: 'totalDelegatedAmount' },
    { text: 'Participation', value: 'participation' },
  ]
  const [ddItems, _] = useState(itemsForDropDown.map(({ text }) => text))
  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [chosenDdItem, setChosenDdItem] = useState<{ text: string; value: string } | undefined>(itemsForDropDown[0])

  const handleClickDropdown = () => {
    setDdIsOpen(!ddIsOpen)
  }
  const handleOnClickDropdownItem = (e: any) => {
    const chosenItem = itemsForDropDown.filter((item) => item.text === e)[0]
    setChosenDdItem(chosenItem)
    setDdIsOpen(!ddIsOpen)
    handleSelect(chosenItem.value)
  }

  return (
    <SatelliteListStyled>
      <SatelliteSearchFilter>
        <Input
          type="text"
          kind={'search'}
          placeholder="Search by address or name..."
          onChange={handleSearch}
          onBlur={() => {}}
        />
        <DropdownContainer>
          <h4>Order By:</h4>
          <DropDown
            clickOnDropDown={handleClickDropdown}
            placeholder={ddItems[0]}
            onChange={handleSelect}
            isOpen={ddIsOpen}
            itemSelected={chosenDdItem?.text}
            items={ddItems}
            onBlur={() => {}}
            clickOnItem={(e) => handleOnClickDropdownItem(e)}
          />{' '}
        </DropdownContainer>
      </SatelliteSearchFilter>
      {satelliteFound === false && <EmptySatelliteList />}
      {satellitesList.map((item, index) => {
        return (
          <SatelliteListCard
            key={String(index + item.address)}
            satellite={item}
            loading={loading}
            delegateCallback={delegateCallback}
            undelegateCallback={undelegateCallback}
            userStakedBalance={userStakedBalance}
            satelliteUserIsDelegatedTo={satelliteUserIsDelegatedTo}
          />
        )
      })}
    </SatelliteListStyled>
  )
}
