import React, { useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { useEffect } from 'react'

// actions
import { fillTreasuryStorage } from './Treasury.actions'

// controller
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'

// view
import TreasuryView from './Treasury.view'
import { DropDown, DropdownItemType } from '../../app/App.components/DropDown/DropDown.controller'

// styles
import { Page } from 'styles'
import { TreasuryActiveStyle, TreasurySelectStyle } from './Treasury.style'
import { TreasuryType } from 'utils/TypesAndInterfaces/Treasury'
import { reduceTreasuryAssets } from './Treasury.helpers'

export const Treasury = () => {
  const dispatch = useDispatch()
  const { treasuryStorage, treasuryFactoryAddress } = useSelector((state: State) => state.treasury)

  const itemsForDropDown = treasuryStorage
    .map((treasury) => ({
      text: treasury.name,
      value: treasury.address,
    }))
    .map((item) => ({
      ...item,
      text: item.text,
    }))

  const ddItems = useMemo(() => itemsForDropDown.map((item) => item.text), [itemsForDropDown])
  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [chosenDdItem, setChosenDdItem] = useState<DropdownItemType | undefined>()
  const [selectedTreasury, setSelectedTreasury] = useState<null | TreasuryType>(null)

  useEffect(() => {
    dispatch(fillTreasuryStorage())
  }, [dispatch])

  const handleClickDropdown = () => {
    setDdIsOpen(!ddIsOpen)
  }

  const handleSelect = (item: DropdownItemType) => {
    const foundTreasury = treasuryStorage.find(({ address }) => item.value === address) || null
    setSelectedTreasury(foundTreasury)
  }

  const handleOnClickDropdownItem = (e: string) => {
    const chosenItem = itemsForDropDown.filter((item) => item.text === e)[0]
    setChosenDdItem(chosenItem)
    setDdIsOpen(!ddIsOpen)
    handleSelect(chosenItem)
  }

  const { assetsBalances, globalTreasuryTVL } = useMemo(() => reduceTreasuryAssets(treasuryStorage), [treasuryStorage])
  const globalTreasury = {
    name: 'Global Treasury TVL',
    balances: assetsBalances,
    address: '',
    treasuryTVL: globalTreasuryTVL,
  }

  return (
    <Page>
      <PageHeader page={'treasury'} />
      <TreasuryView treasury={globalTreasury} isGlobal factoryAddress={treasuryFactoryAddress} />
      <TreasuryActiveStyle>
        <TreasurySelectStyle isSelectedTreasury={Boolean(chosenDdItem?.value)}>
          <h2>Active Treasuries</h2>
          <DropDown
            clickOnDropDown={handleClickDropdown}
            placeholder="Choose treasury"
            isOpen={ddIsOpen}
            setIsOpen={setDdIsOpen}
            itemSelected={chosenDdItem?.text}
            items={ddItems}
            clickOnItem={(e) => handleOnClickDropdownItem(e)}
          />
        </TreasurySelectStyle>
        {selectedTreasury ? <TreasuryView treasury={selectedTreasury} /> : null}
      </TreasuryActiveStyle>
    </Page>
  )
}
