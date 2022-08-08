import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// type
import type { InputStatusType } from '../../../app/App.components/Input/Input.controller'

import { AvatarStyle } from '../../../app/App.components/Avatar/Avatar.style'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { Input } from '../../../app/App.components/Input/Input.controller'
import { Button } from '../../../app/App.components/Button/Button.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { IPFSUploader } from '../../../app/App.components/IPFSUploader/IPFSUploader.controller'

// action
import { updateCouncilMemberInfo } from '../Council.actions'

// style
import { CouncilFormStyled } from './CouncilForms.style'

export const CouncilFormUpdateCouncilMemberInfo = () => {
  const dispatch = useDispatch()
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const [form, setForm] = useState({
    newMemberName: '',
    newMemberWebsite: '',
    newMemberImage: '',
  })
  const [uploadKey, setUploadKey] = useState(1)

  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    newMemberName: '',
    newMemberWebsite: '',
    newMemberImage: '',
  })

  const disabled = false

  const { newMemberName, newMemberWebsite, newMemberImage } = form

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    try {
      await dispatch(updateCouncilMemberInfo(newMemberName, newMemberWebsite, newMemberImage))
      setForm({
        newMemberName: '',
        newMemberWebsite: '',
        newMemberImage: '',
      })
      setFormInputStatus({
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
      <h1 className="form-h1">Update Council Member Info</h1>
      <p>Please enter valid function parameters for adding council member info</p>
      <div className="form-grid">
        <div>
          <label>Council Member Address</label>
          <div className="form-grid-adress">
            <TzAddress tzAddress={accountPkh || ''} hasIcon={false} />
          </div>
        </div>

        <div>
          <label>Update Name</label>
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
          <label>Updated Website URL</label>
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
        disabled={disabled}
        key={uploadKey}
        typeFile="image"
        imageIpfsUrl={newMemberImage}
        className="form-ipfs"
        setIpfsImageUrl={(e: any) => {
          setForm({ ...form, newMemberImage: e })
          setFormInputStatus({ ...formInputStatus, newMemberImage: Boolean(e) ? 'success' : 'error' })
        }}
        title={'Upload Profile Pic'}
      />
      <div className="btn-group">
        <Button
          text="Add Council Member"
          className="plus-btn fill"
          kind={'actionPrimary'}
          icon="upload"
          type="submit"
        />
      </div>
    </CouncilFormStyled>
  )
}
