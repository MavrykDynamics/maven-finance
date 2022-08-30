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
import { changeCouncilMember } from '../Council.actions'
import { showToaster } from '../../../app/App.components/Toaster/Toaster.actions'

// style
import { CouncilFormStyled } from './CouncilForms.style'

export const CouncilFormChangeCouncilMember = () => {
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
  const [uploadKey, setUploadKey] = useState(1)
  const [form, setForm] = useState({
    oldCouncilMemberAddress: '',
    newCouncilMemberAddress: '',
    newMemberName: '',
    newMemberWebsite: '',
    newMemberImage: '',
  })

  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    oldCouncilMemberAddress: '',
    newCouncilMemberAddress: '',
    newMemberName: '',
    newMemberWebsite: '',
    newMemberImage: '',
  })

  const { oldCouncilMemberAddress, newCouncilMemberAddress, newMemberName, newMemberWebsite, newMemberImage } = form

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    try {
      if (!oldCouncilMemberAddress) {
        dispatch(showToaster(ERROR, 'Please enter valid function parameter', 'Choose Council Member to change'))
        return
      }

      await dispatch(
        changeCouncilMember(
          oldCouncilMemberAddress,
          newCouncilMemberAddress,
          newMemberName,
          newMemberWebsite,
          newMemberImage,
        ),
      )
      setForm({
        oldCouncilMemberAddress: '',
        newCouncilMemberAddress: '',
        newMemberName: '',
        newMemberWebsite: '',
        newMemberImage: '',
      })
      setFormInputStatus({
        oldCouncilMemberAddress: '',
        newCouncilMemberAddress: '',
        newMemberName: '',
        newMemberWebsite: '',
        newMemberImage: '',
      })
      setChosenDdItem(itemsForDropDown[0])
      setUploadKey(uploadKey + 1)
    } catch (error) {
      console.error(error)
      setUploadKey(uploadKey + 1)
    }
  }

  const handleChange = (e: any) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const handleBlur = (e: any) => {
    setFormInputStatus((prev) => {
      return { ...prev, [e.target.name]: e.target.value ? 'success' : 'error' }
    })
  }

  const handleClickDropdown = () => {
    setDdIsOpen(!ddIsOpen)
  }

  const handleSelect = (item: any) => {
    setForm((prev) => {
      return { ...prev, oldCouncilMemberAddress: item.value }
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
      <h1 className="form-h1">Change Council Member</h1>
      <p>Please enter valid function parameters for changing a council member</p>
      <div className="form-grid">
        <div>
          <label>Choose Council Member to change</label>
          <DropDown
            clickOnDropDown={handleClickDropdown}
            placeholder={ddItems[0]}
            isOpen={ddIsOpen}
            itemSelected={chosenDdItem?.text}
            items={ddItems}
            clickOnItem={(e) => handleOnClickDropdownItem(e)}
          />
        </div>
        <div />
        <div>
          <label>Council Member Address</label>
          <Input
            type="text"
            required
            value={newCouncilMemberAddress}
            name="newCouncilMemberAddress"
            onChange={(e: any) => {
              handleChange(e)
              handleBlur(e)
            }}
            onBlur={(e: any) => handleBlur(e)}
            inputStatus={formInputStatus.newCouncilMemberAddress}
          />
        </div>
        <div>
          <label>Council Member Name</label>
          <Input
            type="text"
            required
            value={newMemberName}
            name="newMemberName"
            onChange={(e: any) => {
              handleChange(e)
              handleBlur(e)
            }}
            onBlur={(e: any) => handleBlur(e)}
            inputStatus={formInputStatus.newMemberName}
          />
        </div>
        <div>
          <label>Council Member Website URL</label>
          <Input
            type="text"
            required
            value={newMemberWebsite}
            name="newMemberWebsite"
            onChange={(e: any) => {
              handleChange(e)
              handleBlur(e)
            }}
            onBlur={(e: any) => handleBlur(e)}
            inputStatus={formInputStatus.newMemberWebsite}
          />
        </div>
      </div>
      <IPFSUploader
        disabled={false}
        typeFile="image"
        key={uploadKey}
        imageIpfsUrl={newMemberImage}
        className="form-ipfs"
        setIpfsImageUrl={(e: any) => {
          setForm({ ...form, newMemberImage: e })
          setFormInputStatus({ ...formInputStatus, newMemberImage: Boolean(e) ? 'success' : 'error' })
        }}
        title={'Upload Profile Pic'}
      />
      <div className="btn-group">
        <Button text="Change Council Member" className="plus-btn" kind={'actionPrimary'} icon="switch" type="submit" />
      </div>
    </CouncilFormStyled>
  )
}
