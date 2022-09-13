import React, { FC, useState } from 'react'

// components
import { ACTION_PRIMARY } from '../../../app/App.components/Button/Button.constants'
import { Button } from '../../../app/App.components/Button/Button.controller'
import { Input } from "app/App.components/Input/Input.controller"
import { IPFSUploader } from '../../../app/App.components/IPFSUploader/IPFSUploader.controller'

// types
import { InputStatusType } from "app/App.components/Input/Input.constants"

// styles
import { FormStyled } from './BreakGlassActionsForm.style'

export const FormAddCouncilMemberView: FC = () => {
  const [uploadKey, setUploadKey] = useState(1)
  const [form, setForm] = useState({ address: '', website: '', name: '', image: '' })
  console.log("🚀 ~ file: FormAddCouncilMember.view.tsx ~ line 18 ~ form", form)
  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    address: '',
    website: '',
    name: '' ,
    image: '',
  })

  const { address, website, name, image } = form;
  const disabled = false

  const handleClickButton = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
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
      <h1>Add Council Member</h1>
      <p>Please enter valid function parameters for adding a council member</p>

      <form onSubmit={handleClickButton}>
        <div className="form-fields in-two-columns">
          <div className='input-size-secondary margin-bottom-15'>
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

          <div className='input-size-secondary margin-bottom-15'>
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
            text={'Set Contract Admin'}
            kind={ACTION_PRIMARY}
            icon={'profile'}
            type="submit"
          />
        </div>
      </form>
    </FormStyled>
  )
}
