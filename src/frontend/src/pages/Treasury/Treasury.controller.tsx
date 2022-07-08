import React, { useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { useEffect } from 'react'

// actions
import { getCouncilStorage, fillTreasuryStorage, getVestingStorage } from './Treasury.actions'

// controller
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'

// view
import TreasuryView from './Treasury.view'
import { DropDown } from '../../app/App.components/DropDown/DropDown.controller'

// const
import { PRIMARY } from '../../app/App.components/PageHeader/PageHeader.constants'

// styles
import { Page } from 'styles'
import { TreasuryActiveStyle, TreasurySelectStyle } from './Treasury.style'
import { TreasuryType } from 'utils/TypesAndInterfaces/Treasury'

export const Treasury = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { treasuryStorage, treasuryFactoryAddress } = useSelector((state: State) => state.treasury)

  const itemsForDropDown = [{ text: 'Choose treasury', value: '' }]
    .concat(
      treasuryStorage.map((treasury) => ({
        text: treasury.name,
        value: treasury.address,
      })),
    )
    .map((item) => ({
      ...item,
      text: item.text,
    }))

  const ddItems = useMemo(() => itemsForDropDown.map((item) => item.text), [itemsForDropDown])
  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [chosenDdItem, setChosenDdItem] = useState<{ text: string; value: string } | undefined>(itemsForDropDown[0])
  const [selectedTreasury, setSelectedTreasury] = useState<null | TreasuryType>(null)

  useEffect(() => {
    dispatch(fillTreasuryStorage())
  }, [dispatch])

  const handleClickDropdown = () => {
    setDdIsOpen(!ddIsOpen)
  }

  const handleSelect = (item: any) => {
    const foundTreasury = treasuryStorage.find(({ address }) => item.value === address) || null
    setSelectedTreasury(foundTreasury)
  }

  const handleOnClickDropdownItem = (e: any) => {
    const chosenItem = itemsForDropDown.filter((item) => item.text === e)[0]
    setChosenDdItem(chosenItem)
    setDdIsOpen(!ddIsOpen)
    handleSelect(chosenItem)
  }

  const globalTreasuryData = treasuryStorage.reduce(
    (acc: TreasuryType, treasury: TreasuryType) => {
      acc.balances = acc.balances.concat(treasury.balances)
      return acc
    },
    { name: 'Global Treasury TVL', balances: [], address: '', total: 0 } as TreasuryType,
  )

  return (
    <Page>
      <PageHeader page={'treasury'} kind={PRIMARY} loading={loading} />
      <TreasuryView treasury={globalTreasuryData} isGlobal factoryAddress={treasuryFactoryAddress} />
      <TreasuryActiveStyle>
        <TreasurySelectStyle isSelectedTreasury={Boolean(chosenDdItem?.value)}>
          <h2>Active Treasuries</h2>
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
        </TreasurySelectStyle>
        {selectedTreasury ? <TreasuryView treasury={selectedTreasury} /> : null}
      </TreasuryActiveStyle>
    </Page>
  )
}
