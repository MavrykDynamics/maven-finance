import React, { FC, useState } from 'react'
import { useDispatch } from 'react-redux'

// components
import { ACTION_PRIMARY } from '../../../app/App.components/Button/Button.constants'
import { Button } from '../../../app/App.components/Button/Button.controller'
import { Input } from 'app/App.components/Input/Input.controller'
import { IPFSUploader } from '../../../app/App.components/IPFSUploader/IPFSUploader.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'

// types
import { InputStatusType } from 'app/App.components/Input/Input.constants'

// styles
import { FormStyled } from './BreakGlassCouncilForm.style'

// actions
import { addCouncilMember } from '../BreakGlassCouncil.actions'

const INIT_FORM = {
  memberAddress: '',
  newMemberWebsite: '',
  newMemberName: '',
  newMemberImage: '',
}

export const FormAddCouncilMemberView: FC = () => {
  const dispatch = useDispatch()

  const [uploadKey, setUploadKey] = useState(1)
  const [form, setForm] = useState(INIT_FORM)

  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    memberAddress: '',
    newMemberWebsite: '',
    newMemberName: '',
    newMemberImage: '',
  })

  const { memberAddress, newMemberWebsite, newMemberName, newMemberImage } = form
  const disabled = false

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      await dispatch(addCouncilMember(memberAddress, newMemberName, newMemberWebsite, newMemberImage))
      setForm(INIT_FORM)
      setFormInputStatus({
        memberAddress: '',
        newMemberWebsite: '',
        newMemberName: '',
        newMemberImage: '',
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

  return (
    <FormStyled>
      <a className="info-link" href="https://mavryk.finance/litepaper#mavryk-council" target="_blank" rel="noreferrer">
        <Icon id="question" />
      </a>

      <h1>Add Council Member</h1>
      <p>Please enter valid function parameters for adding a council member</p>

      <form onSubmit={handleSubmit}>
        <div className="form-fields in-two-columns">
          <div className="input-size-secondary margin-bottom-20">
            <label>Council Member Address</label>
            <Input
              type="text"
              required
              value={memberAddress}
              name="memberAddress"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                handleChange(e)
                handleBlur(e)
              }}
              onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e)}
              inputStatus={formInputStatus.memberAddress}
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
                handleBlur(e)
              }}
              onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e)}
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
                handleBlur(e)
              }}
              onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e)}
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
          <Button className="stroke-01" text={'Add Council Member'} kind={ACTION_PRIMARY} icon={'plus'} type="submit" />
        </div>
      </form>
    </FormStyled>
  )
}
