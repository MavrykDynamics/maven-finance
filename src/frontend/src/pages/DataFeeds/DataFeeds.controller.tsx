import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import SatelliteList from 'pages/Satellites/SatelliteList/SatellitesList.controller'
import { Button } from 'app/App.components/Button/Button.controller'
import { Input } from 'app/App.components/Input/Input.controller'
import { DropDown } from 'app/App.components/DropDown/DropDown.controller'

// const
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { FEEDS_ALL_LIST_NAME } from 'pages/FinacialRequests/Pagination/pagination.consts'
import { sortByCategory } from 'utils/sortByCategory'

// types
import { FeedGQL } from 'pages/Satellites/helpers/Satellites.types'

// styles
import { Page } from 'styles'
import { DataFeedsStyled } from './DataFeeds.styles'
import { EmptyContainer } from 'app/App.style'
import { DropdownContainer } from 'app/App.components/DropDown/DropDown.style'
import { SatelliteSearchFilter } from 'pages/Satellites/SatelliteList/SatelliteList.style'
import { getOracleStorage } from 'pages/Satellites/Satellites.actions'

const emptyContainer = (
  <EmptyContainer>
    <img src="/images/not-found.svg" alt=" No proposals to show" />
    <figcaption> No oracles to show</figcaption>
  </EmptyContainer>
)
// TODO: filters after category field will be implemented
export const DataFeeds = () => {
  const dispatch = useDispatch()
  const { oraclesStorage } = useSelector((state: State) => state.oracles)
  const { feedCategories } = oraclesStorage
  const loading = useSelector((state: State) => Boolean(state.loading))

  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [searchInputValue, setSearchInput] = useState('')
  const [chosenDdItem, setChosenDdItem] = useState<string | undefined>()
  const [allSatellites, setAllSatellites] = useState<FeedGQL[]>(oraclesStorage.feeds)
  const [sortedFeeds, setSortedFeeds] = useState<FeedGQL[]>(oraclesStorage.feeds)

  const handleSelect = (selectedOption: string) => {
    setDdIsOpen(!ddIsOpen)
    setChosenDdItem(selectedOption)

    if (selectedOption !== '' && selectedOption !== chosenDdItem) {
      setSortedFeeds((data: FeedGQL[]) => {
        return sortByCategory(data, selectedOption)
      })
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchQuery = e.target.value
    let searchResult: FeedGQL[] = []
    if (searchQuery !== '') {
      searchResult = allSatellites.filter(
        (item: FeedGQL) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.address.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    } else {
      searchResult = allSatellites
    }

    setSearchInput(e.target.value)
    setSortedFeeds(searchResult)
  }

  useEffect(() => {
    setAllSatellites(oraclesStorage.feeds)
    setSortedFeeds(oraclesStorage.feeds)
  }, [oraclesStorage.feeds])

  useEffect(() => {
    dispatch(getOracleStorage())
  }, [])

  return (
    <Page>
      <PageHeader page={'data-feeds'} />
      <SatelliteSearchFilter dataFeeds>
        {
          <DropdownContainer className="dropDown">
            <h4>Category:</h4>
            <DropDown
              clickOnDropDown={() => setDdIsOpen(!ddIsOpen)}
              placeholder='Choose category'
              isOpen={ddIsOpen}
              setIsOpen={setDdIsOpen}
              itemSelected={chosenDdItem}
              items={feedCategories}
              clickOnItem={handleSelect}
            />
          </DropdownContainer>
        }
        <Input
          type="text"
          kind={'search'}
          placeholder="Search data feed..."
          onChange={handleSearch}
          value={searchInputValue}
        />

        <Button
          text="Request data feed"
          icon="requestFeed"
          kind={ACTION_PRIMARY}
          loading={loading}
          onClick={() => {
            // TODO: implement request data feed ORACLE_SI
          }}
        />
      </SatelliteSearchFilter>
      <DataFeedsStyled>
        {sortedFeeds.length ? (
          <SatelliteList
            listTitle={'Data feeds'}
            loading={loading}
            items={sortedFeeds}
            listType={'feeds'}
            name={FEEDS_ALL_LIST_NAME}
          />
        ) : (
          emptyContainer
        )}
      </DataFeedsStyled>
    </Page>
  )
}
