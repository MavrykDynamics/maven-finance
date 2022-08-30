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
import { PRIMARY } from '../../app/App.components/PageHeader/PageHeader.constants'
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { FEEDS_ALL_LIST_NAME } from 'pages/FinacialRequests/Pagination/pagination.consts'

// types
import { Feed } from 'pages/Satellites/helpers/Satellites.types'

// styles
import { Page } from 'styles'
import { DataFeedsStyled } from './DataFeeds.styles'
import { EmptyContainer } from 'app/App.style'
import { DropdownContainer } from 'app/App.components/DropDown/DropDown.style'
import { SatelliteSearchFilter } from 'pages/Satellites/SatelliteList/SatelliteList.style'

const itemsForDropDown = [
  { text: 'Cryptocurrencies (USD pairs)', value: 'cryptocurUDS' },
  { text: 'Stablecoins', value: 'stableCoins' },
  { text: 'Cryptocurrencies (BNB pairs)', value: 'cryptocurBNB' },
  { text: 'Proof of Reserve', value: 'proofReserve' },
  { text: 'Indexes', value: 'indexes' },
  { text: 'Cryptocurrencies (ETH pairs)', value: 'cryptocurETH' },
  { text: 'Foreign Exchange', value: 'forExchange' },
  { text: 'Commodities', value: 'commodities' },
  { text: 'Cryptocurrencies (Other)', value: 'cryptocurOther' },
  { text: 'Ethereum Gas', value: 'ethGas' },
]

const emptyContainer = (
  <EmptyContainer>
    <img src="/images/not-found.svg" alt=" No proposals to show" />
    <figcaption> No oracles to show</figcaption>
  </EmptyContainer>
)
// TODO: filters after category field will be implemented
export const DataFeeds = () => {
  const { oraclesStorage } = useSelector((state: State) => state.oracles)
  const loading = useSelector((state: State) => state.loading)

  const [ddItems, _] = useState(itemsForDropDown.map(({ text }) => text))
  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [chosenDdItem, setChosenDdItem] = useState<{ text: string; value: string } | undefined>(itemsForDropDown[0])
  const [allSatellites, setAllSatellites] = useState<Feed[]>(oraclesStorage.feeds)
  const [filteredSatelliteList, setFilteredSatelliteList] = useState<Feed[]>(oraclesStorage.feeds)

  const handleSelect = (selectedOption: any) => {
    const sortLabel = selectedOption.text,
      sortValue = selectedOption.value

    if (sortValue !== '') {
      setFilteredSatelliteList((data: Feed[]) => {
        const dataToSort = data ? [...data] : []

        dataToSort.sort((a: any, b: any) => {
          let res = 0
          switch (sortLabel) {
            case 'Cryptocurrencies (USD pairs)':
            case 'Stablecoins':
            case 'Cryptocurrencies (BNB pairs)':
            case 'Proof of Reserve':
            case 'Indexes':
            case 'Cryptocurrencies (ETH pairs)':
            case 'Foreign Exchange':
            case 'Commodities':
            case 'Cryptocurrencies (Other)':
            case 'Ethereum Gas':
            default:
              return res
          }
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
            isOpen={ddIsOpen}
            itemSelected={chosenDdItem?.text}
            items={ddItems}
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
          onClick={() => {
            // TODO: implement request data feed ORACLE_SI
          }}
        />
      </SatelliteSearchFilter>
      <DataFeedsStyled>
        {filteredSatelliteList.length ? (
          <SatelliteList
            listTitle={'Data feeds'}
            loading={loading}
            items={filteredSatelliteList}
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
