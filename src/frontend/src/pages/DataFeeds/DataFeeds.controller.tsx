import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import OracleList from '../Satellites/SatelliteList/SatellitesList.view'

// const
import { PRIMARY } from '../../app/App.components/PageHeader/PageHeader.constants'

// styles
import { Page } from 'styles'
import { DataFeedsStyled } from './DataFeeds.styles'
import { FEEDS_ALL_LIST_NAME } from 'pages/FinacialRequests/Pagination/pagination.consts'
import { Feed } from 'pages/Satellites/helpers/Satellites.types'
import { DropDown } from 'app/App.components/DropDown/DropDown.controller'
import { DropdownContainer } from 'app/App.components/DropDown/DropDown.style'
import { SatelliteSearchFilter } from 'pages/Satellites/SatelliteList/SatelliteList.style'
import { Input } from 'app/App.components/Input/Input.controller'
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'

// TODO: make it due to the data feeds
const itemsForDropDown = [
  { text: 'Lowest Fee', value: 'satelliteFee' },
  { text: 'Highest Fee', value: 'satelliteFee' },
  { text: 'Delegated MVK', value: 'totalDelegatedAmount' },
  { text: 'Participation', value: 'participation' },
]

export const DataFeeds = () => {
  const { oraclesStorage } = useSelector((state: State) => state.oracles)
  const loading = useSelector((state: State) => state.loading)

  const [ddItems, _] = useState(itemsForDropDown.map(({ text }) => text))
  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [chosenDdItem, setChosenDdItem] = useState<{ text: string; value: string } | undefined>(itemsForDropDown[0])
  const [allSatellites, setAllSatellites] = useState<Feed[]>(oraclesStorage.feeds)
  const [filteredSatelliteList, setFilteredSatelliteList] = useState<Feed[]>(oraclesStorage.feeds)

  // TODO: make sorting | filtering due to data feeds
  const handleSelect = (selectedOption: any) => {
    const sortLabel = selectedOption.text,
      sortValue = selectedOption.value

    if (sortValue !== '') {
      setFilteredSatelliteList((data: Feed[]) => {
        const dataToSort = data ? [...data] : []

        dataToSort.sort((a: any, b: any) => {
          let res = 0
          switch (sortLabel) {
            case 'Lowest Fee':
              res = Number(a[sortValue]) - Number(b[sortValue])
              break
            case 'Highest Fee':
            case 'Delegated MVK':
            case 'Participation':
            default:
              res = Number(b[sortValue]) - Number(a[sortValue])
              break
          }
          return res
        })
        return dataToSort
      })
    }
  }

  const handleSearch = (e: any) => {
    const searchQuery = e.target.value
    let searchResult: Feed[] = []
    if (searchQuery !== '') {
      searchResult = allSatellites.filter(
        (item: Feed) =>
          `${item.token_1_symbol}/${item.token_0_symbol}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.address.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    } else {
      searchResult = allSatellites
    }

    setFilteredSatelliteList(searchResult)
  }

  useEffect(() => {
    setAllSatellites(oraclesStorage.feeds)
    setFilteredSatelliteList(oraclesStorage.feeds)
  }, [oraclesStorage.feeds])

  return (
    <Page>
      <PageHeader page={'data-feeds'} kind={PRIMARY} loading={false} />
      <SatelliteSearchFilter dataFeeds>
        <DropdownContainer className="dropDown">
          <h4>Category:</h4>
          <DropDown
            clickOnDropDown={() => setDdIsOpen(!ddIsOpen)}
            placeholder={ddItems[0]}
            onChange={handleSelect}
            isOpen={ddIsOpen}
            itemSelected={chosenDdItem?.text}
            items={ddItems}
            onBlur={() => {}}
            clickOnItem={(e) => {
              const chosenItem = itemsForDropDown.filter((item) => item.text === e)[0]
              setChosenDdItem(chosenItem)
              setDdIsOpen(!ddIsOpen)
              handleSelect(chosenItem)
            }}
          />
        </DropdownContainer>
        <Input
          type="text"
          kind={'search'}
          placeholder="Search data feed..."
          onChange={handleSearch}
          onBlur={() => {}}
        />

        <Button
          text="Request data feed"
          icon="requestFeed"
          kind={ACTION_PRIMARY}
          loading={loading}
          onClick={() => {}}
        />
      </SatelliteSearchFilter>
      <DataFeedsStyled>
        <OracleList
          listTitle={'Data feeds'}
          loading={loading}
          items={filteredSatelliteList}
          listType={'feeds'}
          name={FEEDS_ALL_LIST_NAME}
          onClickHandler={() => {}}
          additionaldata={{}}
        />
      </DataFeedsStyled>
    </Page>
  )
}
