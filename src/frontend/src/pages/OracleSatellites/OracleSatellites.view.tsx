import React, { useState } from 'react'
import { useSelector } from 'react-redux'

import { State } from 'reducers'
import { SatelliteRecord } from 'utils/TypesAndInterfaces/Delegation'

import { PRIMARY } from 'app/App.components/Modal/Modal.constants'

import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { DropDown } from 'app/App.components/DropDown/DropDown.controller'
import { Input } from 'app/App.components/Input/Input.controller'
import OracleList from 'pages/Oracles/OraclesList/OraclesList.view'

import { SatelliteSearchFilter } from 'pages/Satellites/SatelliteList/SatelliteList.style'
import { DropdownContainer } from 'app/App.components/DropDown/DropDown.style'
import { Page } from 'styles'

type OracleSatellitesViewProps = {
  handleSelect: (e: any) => void
  handleSearch: (e: any) => void
  satellitesList: Array<SatelliteRecord>
}

const itemsForDropDown = [
  { text: 'Lowest Fee', value: 'satelliteFee' },
  { text: 'Highest Fee', value: 'satelliteFee' },
  { text: 'Delegated MVK', value: 'totalDelegatedAmount' },
  { text: 'Participation', value: 'participation' },
]

const OracleSatellitesView = ({ handleSelect, handleSearch, satellitesList }: OracleSatellitesViewProps) => {
  const loading = useSelector((state: State) => state.loading)

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

  return (
    <Page>
      <PageHeader page={'satellites'} kind={PRIMARY} loading={loading} />

      <SatelliteSearchFilter oracle>
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
          />
        </DropdownContainer>
      </SatelliteSearchFilter>

      <OracleList
        loading={loading}
        items={satellitesList}
        listType={'satellites'}
        name={'topSatelitesOracle'}
        onClickHandler={() => null}
        noItemsText={'No oracle-satellites'}
        additionaldata={{
          isAllOracles: true,
        }}
      />
    </Page>
  )
}

export default OracleSatellitesView
