import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { useEffect } from 'react'

// actions
import { getCouncilStorage, getTreasuryStorage, getVestingStorage } from './Treasury.actions'

// controller
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'

// view
import TreasuryView from './Treasury.view'
import { DropDown } from '../../app/App.components/DropDown/DropDown.controller'

// const
import { PRIMARY } from '../../app/App.components/PageHeader/PageHeader.constants'
import { MOCK_TREASURYS } from './mockTreasury'

// styles
import { Page } from 'styles'
import { TreasuryActiveStyle, TreasurySelectStyle } from './Treasury.style'

export const Treasury = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { treasuryStorage } = useSelector((state: State) => state.treasury)
  const { councilStorage } = useSelector((state: State) => state.council)
  const { vestingStorage } = useSelector((state: State) => state.vesting)

  const itemsForDropDown = [
    { text: 'Lowest Fee', value: 'satelliteFee' },
    { text: 'Highest Fee', value: 'satelliteFee' },
    { text: 'Delegated MVK', value: 'totalDelegatedAmount' },
    { text: 'Participation', value: 'participation' },
  ]
  const [ddItems, _] = useState(itemsForDropDown.map(({ text }) => text))
  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [chosenDdItem, setChosenDdItem] = useState<{ text: string; value: string } | undefined>(itemsForDropDown[0])

  useEffect(() => {
    dispatch(getTreasuryStorage())
    dispatch(getCouncilStorage())
    dispatch(getVestingStorage())
  }, [dispatch])

  const handleClickDropdown = () => {
    setDdIsOpen(!ddIsOpen)
  }

  const handleSelect = (item: any) => {
    console.log('%c ||||| item', 'color:yellowgreen', item)
  }

  const handleOnClickDropdownItem = (e: any) => {
    const chosenItem = itemsForDropDown.filter((item) => item.text === e)[0]
    setChosenDdItem(chosenItem)
    setDdIsOpen(!ddIsOpen)
    handleSelect(chosenItem)
  }

  return (
    <Page>
      <PageHeader page={'treasury'} kind={PRIMARY} loading={loading} />
      <TreasuryView treasury={MOCK_TREASURYS[0]} />
      <TreasuryView treasury={MOCK_TREASURYS[1]} />
      <TreasuryActiveStyle>
        <TreasurySelectStyle>
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
        <TreasuryView treasury={MOCK_TREASURYS[1]} />
      </TreasuryActiveStyle>
    </Page>
  )
}
