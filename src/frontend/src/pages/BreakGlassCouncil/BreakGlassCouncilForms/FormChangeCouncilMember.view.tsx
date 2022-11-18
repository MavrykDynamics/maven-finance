import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// components
import { ACTION_PRIMARY, SUBMIT } from '../../../app/App.components/Button/Button.constants'
import { Button } from '../../../app/App.components/Button/Button.controller'
import { Input } from 'app/App.components/Input/Input.controller'
import { IPFSUploader } from '../../../app/App.components/IPFSUploader/IPFSUploader.controller'
import { DropDown, DropdownItemType } from '../../../app/App.components/DropDown/DropDown.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'

// types
import { InputStatusType } from 'app/App.components/Input/Input.constants'
import { CouncilMemberMaxLength } from '../../../utils/TypesAndInterfaces/Council'

// styles
import { FormStyled } from './BreakGlassCouncilForm.style'

// actions
import { changeCouncilMember } from '../BreakGlassCouncil.actions'

// helpers
import { getShortTzAddress } from '../../../utils/tzAdress'
import { validateFormAddress, validateFormField } from 'utils/validatorFunctions' 

type Props = {
  councilMemberMaxLength: CouncilMemberMaxLength
}

const INIT_FORM = {
  newCouncilMemberAddress: '',
  newMemberWebsite: '',
  newMemberName: '',
  newMemberImage: '',
}

export function FormChangeCouncilMemberView({ councilMemberMaxLength }: Props) {
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

  const [uploadKey, setUploadKey] = useState(1)
  const [form, setForm] = useState(INIT_FORM)

  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    newCouncilMemberAddress: '',
    newMemberWebsite: '',
    newMemberName: '',
    newMemberImage: '',
  })

  const { newCouncilMemberAddress, newMemberWebsite, newMemberName, newMemberImage } = form
  const disabled = false

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const oldCouncilMemberAddress = chosenDdItem?.value || ''

      await dispatch(
        changeCouncilMember(
          oldCouncilMemberAddress,
          newCouncilMemberAddress,
          newMemberName,
          newMemberWebsite,
          newMemberImage,
        ),
      )
      setForm(INIT_FORM)
      setFormInputStatus({
        newCouncilMemberAddress: '',
        newMemberWebsite: '',
        newMemberName: '',
        newMemberImage: '',
      })
      setChosenDdItem(itemsForDropDown[0])
      setUploadKey(uploadKey + 1)
    } catch (error) {
      console.error('FormChangeCouncilMemberViewe', error)
      setUploadKey(uploadKey + 1)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const handleBlur = validateFormField(setFormInputStatus)
  const handleBlurAddress = validateFormAddress(setFormInputStatus)

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

      <h1>Change Council Member</h1>
      <p>Please enter valid function parameters for changing a council member</p>

      <form onSubmit={handleSubmit}>
        <div className="form-fields input-size-secondary margin-bottom-20">
          <label>Choose Council Member to change</label>
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

        <div className="form-fields in-two-columns">
          <div className="input-size-secondary margin-bottom-20">
            <label>Council Member Address</label>
            <Input
              type="text"
              required
              value={newCouncilMemberAddress}
              name="newCouncilMemberAddress"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                handleChange(e)
                handleBlurAddress(e)
              }}
              onBlur={handleBlurAddress}
              inputStatus={formInputStatus.newCouncilMemberAddress}
            />
          </div>

          <div className="input-size-tertiary">
            <label>Council Member Name</label>
            <Input
              type="text"
              required
              value={newMemberName}
              name="newMemberName"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                handleChange(e)
                handleBlur(e, councilMemberMaxLength.councilMemberNameMaxLength)
              }}
              onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e, councilMemberMaxLength.councilMemberNameMaxLength)}
              inputStatus={formInputStatus.newMemberName}
            />
          </div>

          <div className="input-size-secondary margin-bottom-20">
            <label>Council Member Website URL</label>
            <Input
              type="text"
              required
              value={newMemberWebsite}
              name="newMemberWebsite"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                handleChange(e)
                handleBlur(e, councilMemberMaxLength.councilMemberWebsiteMaxLength)
              }}
              onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e, councilMemberMaxLength.councilMemberWebsiteMaxLength)}
              inputStatus={formInputStatus.newMemberWebsite}
            />
          </div>
        </div>

        <IPFSUploader
          disabled={disabled}
          key={uploadKey}
          typeFile="image"
          imageIpfsUrl={newMemberImage}
          className="form-ipfs"
          setIpfsImageUrl={(e: string) => {
            setForm({ ...form, newMemberImage: e })
            setFormInputStatus({ ...formInputStatus, newMemberImage: Boolean(e) ? 'success' : 'error' })
          }}
          title={'Upload Profile Pic'}
        />

        <div className="align-to-right">
          <Button
            className="stroke-01"
            text={'Change Council Member'}
            kind={ACTION_PRIMARY}
            icon={'exchange'}
            type={SUBMIT}
          />
        </div>
      </form>
    </FormStyled>
  )
}
