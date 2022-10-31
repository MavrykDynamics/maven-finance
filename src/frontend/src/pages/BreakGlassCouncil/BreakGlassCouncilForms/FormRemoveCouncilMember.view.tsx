import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// components
import { ACTION_PRIMARY, SUBMIT } from '../../../app/App.components/Button/Button.constants'
import { Button } from '../../../app/App.components/Button/Button.controller'
import { DropDown, DropdownItemType } from '../../../app/App.components/DropDown/DropDown.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'

// styles
import { FormStyled } from './BreakGlassCouncilForm.style'

// helpers
import { getShortTzAddress } from '../../../utils/tzAdress'

// actions
import { removeCouncilMember } from '../BreakGlassCouncil.actions'

export function FormRemoveCouncilMemberView() {
  const dispatch = useDispatch()
  const { breakGlassCouncilMember } = useSelector((state: State) => state.breakGlass)

  const itemsForDropDown = breakGlassCouncilMember.map((item) => {
    return {
      text: `${item.name} - ${getShortTzAddress(item.userId)}`,
      value: item.userId,
    }
  })

  const [ddItems, _] = useState(itemsForDropDown.map(({ text }) => text))
  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [chosenDdItem, setChosenDdItem] = useState<DropdownItemType | undefined>()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const memberAddress = chosenDdItem?.value || ''
      await dispatch(removeCouncilMember(memberAddress))
      setChosenDdItem(itemsForDropDown[0])
    } catch (error) {
      console.error('FormRemoveCouncilMemberView', error)
    }
  }

  const handleClickDropdown = () => {
    setDdIsOpen(!ddIsOpen)
  }

  const handleClickDropdownItem = (e: string) => {
    const chosenItem = itemsForDropDown.filter((item) => item.text === e)[0]
    setChosenDdItem(chosenItem)
    setDdIsOpen(!ddIsOpen)
  }

  return (
    <FormStyled>
      <a className="info-link" href="https://mavryk.finance/litepaper#mavryk-council" target="_blank" rel="noreferrer">
        <Icon id="question" />
      </a>

      <h1>Remove Council Member</h1>
      <p>Please enter valid function parameters for removing a council member</p>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-fields input-size-primary">
          <label>Choose Council Member to remove</label>

          <DropDown
            clickOnDropDown={handleClickDropdown}
            placeholder='Choose member'
            isOpen={ddIsOpen}
            setIsOpen={setDdIsOpen}
            itemSelected={chosenDdItem?.text}
            items={ddItems}
            clickOnItem={(e) => handleClickDropdownItem(e)}
          />
        </div>

        <Button
          className="stroke-01"
          text={'Remove Council Member'}
          kind={ACTION_PRIMARY}
          icon={'minus'}
          type={SUBMIT}
        />
      </form>
    </FormStyled>
  )
}
