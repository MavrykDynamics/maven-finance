import { useState } from 'react'
import { useDispatch } from 'react-redux'

import { Input } from '../../../app/App.components/Input/Input.controller'
import { Button } from '../../../app/App.components/Button/Button.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { IPFSUploader } from '../../../app/App.components/IPFSUploader/IPFSUploader.controller'
import { CouncilMemberMaxLength } from 'utils/TypesAndInterfaces/Council'

// helpers
import { validateForm } from '../Council.helpers'

// action
import { addCouncilMember } from '../Council.actions'

// style
import { CouncilFormStyled } from './CouncilForms.style'
import { InputStatusType } from 'app/App.components/Input/Input.constants'

export const CouncilFormAddCouncilMember = ({ 
  councilMemberNameMaxLength,
  councilMemberWebsiteMaxLength
 }: CouncilMemberMaxLength) => {
  const dispatch = useDispatch()
  const [form, setForm] = useState({
    newMemberAddress: '',
    newMemberName: '',
    newMemberWebsite: '',
    newMemberImage: '',
  })

  const [uploadKey, setUploadKey] = useState(1)

  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    newMemberAddress: '',
    newMemberName: '',
    newMemberWebsite: '',
    newMemberImage: '',
  })

  const disabled = false

  const { newMemberAddress, newMemberName, newMemberWebsite, newMemberImage } = form

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await dispatch(addCouncilMember(newMemberAddress, newMemberName, newMemberWebsite, newMemberImage))
      setForm({
        newMemberAddress: '',
        newMemberName: '',
        newMemberWebsite: '',
        newMemberImage: '',
      })
      setFormInputStatus({
        newMemberAddress: '',
        newMemberName: '',
        newMemberWebsite: '',
        newMemberImage: '',
      })
      setUploadKey(uploadKey + 1)
    } catch (error) {
      console.error(error)
      setUploadKey(uploadKey + 1)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const handleBlur = validateForm(setFormInputStatus)

  return (
    <CouncilFormStyled onSubmit={handleSubmit}>
      <a className="info-link" href="https://mavryk.finance/litepaper#mavryk-council" target="_blank" rel="noreferrer">
        <Icon id="question" />
      </a>
      <h1 className="form-h1">Add Council Member</h1>
      <p>Please enter valid function parameters for adding a council member</p>
      <div className="form-grid">
        <div>
          <label>Council Member Address</label>
          <Input
            type="text"
            required
            value={newMemberAddress}
            name="newMemberAddress"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleChange(e)
              handleBlur(e)
            }}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e)}
            inputStatus={formInputStatus.newMemberAddress}
          />
        </div>

        <div>
          <label>Council Member Name</label>
          <Input
            type="text"
            required
            value={newMemberName}
            name="newMemberName"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleChange(e)
              handleBlur(e, councilMemberNameMaxLength)
            }}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e, councilMemberNameMaxLength)}
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleChange(e)
              handleBlur(e, councilMemberWebsiteMaxLength)
            }}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e, councilMemberWebsiteMaxLength)}
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
      <div className="btn-group">
        <Button text="Add Council Member" className="plus-btn" kind={'actionPrimary'} icon="plus" type="submit" />
      </div>
    </CouncilFormStyled>
  )
}
