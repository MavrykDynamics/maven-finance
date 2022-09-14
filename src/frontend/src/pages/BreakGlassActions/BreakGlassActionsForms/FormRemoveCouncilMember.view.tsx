import React, { FC, useState } from 'react'

// components
import { ACTION_PRIMARY } from '../../../app/App.components/Button/Button.constants'
import { Button } from '../../../app/App.components/Button/Button.controller'
import { DropDown, DropdownItemType } from '../../../app/App.components/DropDown/DropDown.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'

// styles
import { FormStyled } from './BreakGlassActionsForm.style'

const itemsForDropDown = [
  {text: 'Choose', value: ''}
]

export const FormRemoveCouncilMemberView: FC = () => {
  const [ddItems, _] = useState(itemsForDropDown.map(({ text }) => text))
  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [chosenDdItem, setChosenDdItem] = useState<DropdownItemType | undefined>(itemsForDropDown[0])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
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

      <form className='form' onSubmit={handleSubmit}>
        <div className="form-fields input-size-primary">
          <label>Choose Council Member to remove</label>

          <DropDown
            clickOnDropDown={handleClickDropdown}
            placeholder={ddItems[0]}
            isOpen={ddIsOpen}
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
          type="submit"
        />
      </form>
    </FormStyled>
  )
}
