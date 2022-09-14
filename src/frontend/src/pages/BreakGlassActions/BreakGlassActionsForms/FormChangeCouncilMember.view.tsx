import React, { FC, useState } from 'react'
import { useDispatch } from 'react-redux'

// components
import { ACTION_PRIMARY } from '../../../app/App.components/Button/Button.constants'
import { Button } from '../../../app/App.components/Button/Button.controller'
import { Input } from "app/App.components/Input/Input.controller"
import { IPFSUploader } from '../../../app/App.components/IPFSUploader/IPFSUploader.controller'
import { DropDown, DropdownItemType } from '../../../app/App.components/DropDown/DropDown.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'

// types
import { InputStatusType } from "app/App.components/Input/Input.constants"

// styles
import { FormStyled } from './BreakGlassActionsForm.style'

// actions
import { changeCouncilMember } from '../BreakGlassActions.actions'

const itemsForDropDown = [
  {text: 'Choose', value: ''}
]

const INIT_FORM = {
  address: '',
  website: '',
  name: '' ,
  image: '',
}

export const FormChangeCouncilMemberView: FC = () => {
  const dispatch = useDispatch()

  const [ddItems, _] = useState(itemsForDropDown.map(({ text }) => text))
  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [chosenDdItem, setChosenDdItem] = useState<DropdownItemType | undefined>(itemsForDropDown[0])

  const [uploadKey, setUploadKey] = useState(1)
  const [form, setForm] = useState(INIT_FORM)

  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    address: '',
    website: '',
    name: '' ,
    image: '',
  })

  const { address, website, name, image } = form
  const disabled = false

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const newCouncilMemberAddress = chosenDdItem?.value || '';

      await dispatch(changeCouncilMember(address, newCouncilMemberAddress, name, website, image))
      setForm(INIT_FORM)
      setFormInputStatus({
        address: '',
        website: '',
        name: '' ,
        image: '',
      })
      setUploadKey(uploadKey + 1)
    } catch (error) {
      console.error(error)
      setUploadKey(uploadKey + 1)
    }
  }

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
        <div className='form-fields input-size-secondary margin-bottom-20'>
          <label>Choose Council Member to change</label>
          <DropDown
            clickOnDropDown={handleClickDropdown}
            placeholder={ddItems[0]}
            isOpen={ddIsOpen}
            itemSelected={chosenDdItem?.text}
            items={ddItems}
            clickOnItem={(e) => handleClickDropdownItem(e)}
          />
        </div>

        <div className="form-fields in-two-columns">
          <div className='input-size-secondary margin-bottom-20'>
            <label>Council Member Address</label>
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

          <div className='input-size-tertiary'>
            <label>Council Member Name</label>
            <Input
              type="text"
              required
              value={name}
              name="name"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                handleChange(e)
                handleBlur(e)
              }}
              onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e)}
              inputStatus={formInputStatus.name}
            />
          </div>

          <div className='input-size-secondary margin-bottom-20'>
            <label>Council Member Website URL</label>
            <Input
              type="text"
              required
              value={website}
              name="website"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                handleChange(e)
                handleBlur(e)
              }}
              onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e)}
              inputStatus={formInputStatus.website}
            />
          </div>
        </div>

        <IPFSUploader
          disabled={disabled}
          key={uploadKey}
          typeFile="image"
          imageIpfsUrl={image}
          className="form-ipfs"
          setIpfsImageUrl={(e: string) => {
            setForm({ ...form, image: e })
            setFormInputStatus({ ...formInputStatus, image: Boolean(e) ? 'success' : 'error' })
          }}
          title={'Upload Profile Pic'}
        />

        <div className='align-to-right'>
          <Button
            className="stroke-01"
            text={'Change Council Member'}
            kind={ACTION_PRIMARY}
            icon={'exchange'}
            type="submit"
          />
        </div>
      </form>
    </FormStyled>
  )
}
