import { DropdownContainer } from 'app/App.components/DropDown/DropDown.style'
import { Input } from 'app/App.components/Input/Input.controller'
import { getPageNumber } from 'pages/FinacialRequests/FinancialRequests.helpers'
import { calculateSlicePositions } from 'pages/FinacialRequests/Pagination/pagination.consts'
import Pagination from 'pages/FinacialRequests/Pagination/Pagination.view'
import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router'

import { DropDown } from '../../../app/App.components/DropDown/DropDown.controller'
import { State } from '../../../reducers'
import { darkMode, lightMode } from '../../../styles'
import { SatelliteRecord } from '../../../utils/TypesAndInterfaces/Delegation'
import {
  SatelliteListEmptyContainer,
  SatelliteListStyled,
  SatelliteSearchFilter,
} from '../SatelliteList/SatelliteList.style'
import { SatelliteListCard } from './SatelliteList_old/SatellliteListCard/SatelliteListCard.view'

type SatelliteListViewProps = {
  loading: boolean
  satellitesList: SatelliteRecord[]
  delegateCallback: (satelliteAddress: string) => void
  undelegateCallback: () => void
  handleSearch: (e: any) => void
  handleSelect: (selectedOption: any) => void
  userStakedBalance: number
  satelliteUserIsDelegatedTo: string
  satelliteFound: boolean | undefined
  listName: string
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
  listName,
}: SatelliteListViewProps) => {
  if (satelliteFound === undefined && !loading && satellitesList?.length === 0) {
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
        listName={listName}
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
  listName,
}: SatelliteListViewProps) => {
  const { darkThemeEnabled } = useSelector((state: State) => state.preferences)

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
    handleSelect(chosenItem)
  }

  useEffect(() => {
    handleSelect(itemsForDropDown[0])
  }, [])

  const { pathname, search } = useLocation()
  const currentPage = getPageNumber(search, listName)

  const paginatedItemsList = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, listName)
    return satellitesList.slice(from, to)
  }, [currentPage, satellitesList])

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
          <h4>Order by:</h4>
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
      {satelliteFound === false ? (
        <EmptySatelliteList />
      ) : (
        paginatedItemsList?.map((item, index) => {
          return (
            <SatelliteListCard
              key={String(index + item.address)}
              className="iterable"
              satellite={item}
              loading={loading}
              delegateCallback={delegateCallback}
              undelegateCallback={undelegateCallback}
              userStakedBalance={userStakedBalance}
              satelliteUserIsDelegatedTo={satelliteUserIsDelegatedTo}
            />
          )
        })
      )}
      <Pagination itemsCount={satellitesList.length} listName={listName} side={'right'} />
    </SatelliteListStyled>
  )
}
