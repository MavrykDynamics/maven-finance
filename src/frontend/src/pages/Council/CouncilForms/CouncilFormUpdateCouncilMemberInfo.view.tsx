import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// type
import type { InputStatusType } from '../../../app/App.components/Input/Input.constants'
import type { CouncilMemberMaxLength } from '../../../utils/TypesAndInterfaces/Council'

// helpers
import { checkMaxLength } from 'utils/validation'

import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { Input } from '../../../app/App.components/Input/Input.controller'
import { Button } from '../../../app/App.components/Button/Button.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { IPFSUploader } from '../../../app/App.components/IPFSUploader/IPFSUploader.controller'

// action
import { updateCouncilMemberInfo } from '../Council.actions'

// style
import { CouncilFormStyled } from './CouncilForms.style'

export const CouncilFormUpdateCouncilMemberInfo = ({
  councilMemberNameMaxLength,
  councilMemberWebsiteMaxLength
 }: CouncilMemberMaxLength) => {
  const dispatch = useDispatch()
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { councilStorage } = useSelector((state: State) => state.council)
  const { councilMembers } = councilStorage
  const myInfo = councilMembers.find((item) => item.userId === accountPkh)

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

  useEffect(() => {
    if (myInfo) {
      setForm({
        newMemberName: myInfo.name,
        newMemberWebsite: myInfo.website,
        newMemberImage: myInfo.image,
      })

      setFormInputStatus({
        newMemberName: 'success',
        newMemberWebsite: 'success',
        newMemberImage: 'success',
      })
      setUploadKey(uploadKey + 1)
    }
  }, [myInfo])

  const disabled = false

  const { newMemberName, newMemberWebsite, newMemberImage } = form

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await dispatch(updateCouncilMemberInfo(newMemberName, newMemberWebsite, newMemberImage))
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

  const handleBlur = (e: React.ChangeEvent<HTMLInputElement>, maxLength: number) => {
    setFormInputStatus((prev) => {
      const { value, name } = e.target

      const checkMaxLengthField = checkMaxLength(value, maxLength) ? 'success' : 'error' 
      const checkEmptyField = value ? checkMaxLengthField : 'error'

      return { ...prev, [name]: checkEmptyField }
    })
  }

  return (
    <CouncilFormStyled className="update-council-member-info" onSubmit={handleSubmit}>
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleChange(e)
              handleBlur(e, councilMemberNameMaxLength)
            }}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e, councilMemberNameMaxLength)}
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
        <Button
          text="Update Council Member Info"
          className="plus-btn fill"
          kind={'actionPrimary'}
          icon="upload"
          type="submit"
        />
      </div>
    </CouncilFormStyled>
  )
}
