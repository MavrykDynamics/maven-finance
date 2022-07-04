import { useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// type
import type { InputStatusType } from '../../../app/App.components/Input/Input.controller'
import type { CouncilMember } from '../../../utils/TypesAndInterfaces/Council'

// helpers
import { getShortTzAddress } from '../../../utils/tzAdress'

// const
import { ERROR, INFO, SUCCESS } from '../../../app/App.components/Toaster/Toaster.constants'

// view
import { Input } from '../../../app/App.components/Input/Input.controller'
import { Button } from '../../../app/App.components/Button/Button.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { IPFSUploader } from '../../../app/App.components/IPFSUploader/IPFSUploader.controller'
import { DropDown } from '../../../app/App.components/DropDown/DropDown.controller'

// action
import { removeCouncilMember } from '../Council.actions'
import { showToaster } from '../../../app/App.components/Toaster/Toaster.actions'

// style
import { CouncilFormStyled } from './CouncilForms.style'

export const CouncilFormRemoveCouncilMember = () => {
  const dispatch = useDispatch()
  const { councilStorage } = useSelector((state: State) => state.council)
  const { councilMembers } = councilStorage

  const itemsForDropDown = useMemo(
    () =>
      councilMembers?.length
        ? [
            { text: 'Chose Member Address', value: '' },
            ...councilMembers.map((item: CouncilMember) => {
              return {
                text: getShortTzAddress(item.user_id),
                value: item.user_id,
              }
            }),
          ]
        : [{ text: 'Chose Member Address', value: '' }],
    [councilMembers],
  )

  const [ddItems, _] = useState(itemsForDropDown.map(({ text }) => text))
  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [chosenDdItem, setChosenDdItem] = useState<{ text: string; value: string } | undefined>(itemsForDropDown[0])

  const [form, setForm] = useState({
    memberAddress: '',
  })

  const { memberAddress } = form

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    try {
      if (!memberAddress) {
        dispatch(showToaster(ERROR, 'Please enter valid function parameter', 'Choose Council Member to remove'))
        return
      }

      await dispatch(removeCouncilMember(memberAddress))
      setForm({
        memberAddress: '',
      })

      setChosenDdItem(itemsForDropDown[0])
    } catch (error) {
      console.error(error)
    }
  }

  const handleClickDropdown = () => {
    setDdIsOpen(!ddIsOpen)
  }

  const handleSelect = (item: any) => {
    setForm((prev) => {
      return { ...prev, memberAddress: item.value }
    })
  }

  const handleOnClickDropdownItem = (e: any) => {
    const chosenItem = itemsForDropDown.filter((item) => item.text === e)[0]
    setChosenDdItem(chosenItem)
    setDdIsOpen(!ddIsOpen)
    handleSelect(chosenItem)
  }

  return (
    <CouncilFormStyled onSubmit={handleSubmit}>
      <a className="info-link" href="https://mavryk.finance/litepaper#mavryk-council" target="_blank" rel="noreferrer">
        <Icon id="question" />
      </a>
      <h1 className="form-h1">Remove Council Member</h1>
      <p>Please enter valid function parameters for removing a council member</p>
      <div className="form-grid form-grid-button-right">
        <div>
          <label>Choose Council Member to remove</label>
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
        </div>
        <div className="button-aligment">
          <Button text="Remove Council Member" className="plus-btn" kind={'actionPrimary'} icon="minus" type="submit" />
        </div>
      </div>
    </CouncilFormStyled>
  )
}
