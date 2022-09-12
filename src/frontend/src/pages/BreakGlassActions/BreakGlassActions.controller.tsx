import React, { FC, useState, useMemo } from "react";

// components
import { ACTION_PRIMARY } from '../../app/App.components/Button/Button.constants'
import { Button } from '../../app/App.components/Button/Button.controller'
import { DropDown, DropdownItemType } from '../../app/App.components/DropDown/DropDown.controller'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { PastBreakGlassActionsCard } from './PastBreakGlassActionsCard/PastBreakGlassActionsCard.controller'
import { breakGlassActions } from "./BreakGlassActions.actions"

// styles
import { Page } from 'styles'
import { PropagateBreakGlassCard, BreakGlassActionsCard, PastBreakGlassActions } from "./BreakGlassActions.style"
import { InputStatusType } from "app/App.components/Input/Input.constants"

// types
import { Input } from "app/App.components/Input/Input.controller"

// TODO: change mock to valid data
const mock = [
  {
    date: new Date(),
    action: 'Set all contracts admin',
    target: 'fkjsdakh...dfss',
    button: true,
    id: 1,
  },
  {
    date: new Date(),
    action: 'Set all contracts admin',
    target: 'fkjsdakh...dfss',
    button: true,
    id: 2,
  },
  {
    date: new Date(),
    action: 'Set all contracts admin',
    target: 'fkjsdakh...dfss',
    button: true,
    id: 3,
  },
  {
    date: new Date(),
    action: 'Set all contracts admin',
    target: 'fkjsdakh...dfss',
    button: true,
    id: 4,
  },
  {
    date: new Date(),
    action: 'Set all contracts admin',
    target: 'fkjsdakh...dfss',
    button: false,
    id: 5,
  },
]

const actionNameHandler = (name: string) => {
  return name.split('_').map(word => word[0].toUpperCase() + word.substring(1).toLowerCase()).join(' ');
}

export const BreakGlassActions: FC = () => {
  const itemsForDropDown = useMemo(
    () =>
    [
      ...Object.values(breakGlassActions).map((item) => {
        return {
          text: actionNameHandler(item),
          value: item,
        }
      }),
    ],
    []
  )

  const [ddItems, _] = useState(itemsForDropDown.map(({ text }) => text))
  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [chosenDdItem, setChosenDdItem] = useState<DropdownItemType | undefined>(itemsForDropDown[0])

  const [form, setForm] = useState({ address: '' })
  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    address: '',
  })

  const { address } = form;

  const handleClickPropagateBreakGlass = () => {
  
  }
  
  const handleClickSetContractsAdmin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  }
  
  const handleClickDropdown = () => {
    setDdIsOpen(!ddIsOpen)
  }
  
  const handleClickDropdownItem = (e: string) => {
    const chosenItem = itemsForDropDown.filter((item) => item.text === e)[0]
    setChosenDdItem(chosenItem)
    setDdIsOpen(!ddIsOpen)
    handleSelect(chosenItem)
  }

  const handleSelect = (item: DropdownItemType) => {}

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const handleBlur = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormInputStatus((prev) => {
      return { ...prev, [e.target.name]: e.target.value ? 'success' : 'error' }
    })
  }

  return (
    <Page>
      <PageHeader page={'break glass actions'} />

      <PropagateBreakGlassCard>
        <h1>Propagate Break Glass</h1>

        <Button
          className="start_verification"
          text={'Propagate Break Glass'}
          kind={ACTION_PRIMARY}
          icon={'plus'}
          onClick={handleClickPropagateBreakGlass}
        />
      </PropagateBreakGlassCard>

      <BreakGlassActionsCard>
        <div className="top-bar">
          <h1 className="top-bar-title">Break Glass Actions</h1>
   
          <div className="dropdown-size">
            <DropDown
              clickOnDropDown={handleClickDropdown}
              placeholder={ddItems[0]}
              isOpen={ddIsOpen}
              itemSelected={chosenDdItem?.text}
              items={ddItems}
              clickOnItem={(e) => handleClickDropdownItem(e)}
            />
          </div>
        </div>

        <div className="main-section">
          <h1>Set All Contracts Admin</h1>
          <p>Please enter valid function parameters for adding a vestee</p>

          <form onSubmit={handleClickSetContractsAdmin}>
            <div className="input-size">
              <label>New Admin Address</label>
 
              <Input
                type="text"
                required
                value={address}
                name="address"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleChange(e)
                  handleBlur(e)
                }}
                onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e)}
                inputStatus={formInputStatus.address}
              />
            </div>

            <Button
              className="start_verification"
              text={'Set Contracts Admin'}
              kind={ACTION_PRIMARY}
              icon={'profile'}
              type="submit"
            />
          </form>
        </div>
      </BreakGlassActionsCard>

      <PastBreakGlassActions>
        <h1>Past Break Glass Actions</h1>
        
        {mock.map((item) => {
          const { id, ...props } = item;
          return <PastBreakGlassActionsCard key={id} {...props} />
        })}
      </PastBreakGlassActions>
    </Page>
  )
}
