import { useState } from 'react'
import { useDispatch } from 'react-redux'

// type
import type { InputStatusType } from '../../../app/App.components/Input/Input.controller'

import { AvatarStyle } from '../../../app/App.components/Avatar/Avatar.style'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { Input } from '../../../app/App.components/Input/Input.controller'
import { Button } from '../../../app/App.components/Button/Button.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { IPFSUploader } from '../../../app/App.components/IPFSUploader/IPFSUploader.controller'

// action
import { addCouncilMember } from '../Council.actions'

// style
import { CouncilFormStyled } from './CouncilForms.style'

export const CouncilFormAddCouncilMember = () => {
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

  const handleSubmit = async (e: any) => {
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
            onChange={(e) => {
              handleChange(e)
              handleBlur(e)
            }}
            onBlur={(e) => handleBlur(e)}
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
            onChange={(e) => {
              handleChange(e)
              handleBlur(e)
            }}
            onBlur={(e) => handleBlur(e)}
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
            onChange={(e) => {
              handleChange(e)
              handleBlur(e)
            }}
            onBlur={(e) => handleBlur(e)}
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
        setIpfsImageUrl={(e: any) => {
          console.log('%c ||||| e', 'color:yellowgreen', e)
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
