import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// components
import { ACTION_PRIMARY, SUBMIT } from '../../../app/App.components/Button/Button.constants'
import { Button } from '../../../app/App.components/Button/Button.controller'
import { Input } from 'app/App.components/Input/Input.controller'
import { IPFSUploader } from '../../../app/App.components/IPFSUploader/IPFSUploader.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'

// helpers
import { getShortTzAddress } from '../../../utils/tzAdress'
import { validateForm } from '../../Council/Council.helpers'

// types
import { InputStatusType } from 'app/App.components/Input/Input.constants'
import { CouncilMemberMaxLength } from '../../../utils/TypesAndInterfaces/Council'

// styles
import { FormStyled } from './BreakGlassCouncilForm.style'

// actions
import { updateCouncilMember } from '../BreakGlassCouncil.actions'

type Props = {
  councilMemberMaxLength: CouncilMemberMaxLength
}

const INIT_FORM = {
  newMemberWebsite: '',
  newMemberName: '',
  newMemberImage: '',
}

export function FormUpdateCouncilMemberView({ councilMemberMaxLength }: Props) {
  const dispatch = useDispatch()
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { breakGlassCouncilMember } = useSelector((state: State) => state.breakGlass)

  const [uploadKey, setUploadKey] = useState(1)
  const [form, setForm] = useState(INIT_FORM)
  const myInfo = breakGlassCouncilMember.find((item) => item.userId === accountPkh)

  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    newMemberWebsite: '',
    newMemberName: '',
    newMemberImage: '',
  })

  const { newMemberWebsite, newMemberName, newMemberImage } = form
  const disabled = false

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      await dispatch(updateCouncilMember(newMemberName, newMemberWebsite, newMemberImage))
      setForm(INIT_FORM)
      setFormInputStatus({
        newMemberWebsite: '',
        newMemberName: '',
        newMemberImage: '',
      })
      setUploadKey(uploadKey + 1)
    } catch (error) {
      console.error('FormSetSingleContractAdminView', error)
      setUploadKey(uploadKey + 1)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const handleBlur = validateForm(setFormInputStatus)

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

  return (
    <FormStyled>
      <a className="info-link" href="https://mavryk.finance/litepaper#mavryk-council" target="_blank" rel="noreferrer">
        <Icon id="question" />
      </a>

      <h1>Update Council Member Info</h1>
      <p>Please enter valid function parameters for adding council member info</p>

      <form onSubmit={handleSubmit}>
        <div className="form-fields in-two-columns">
          <div className="input-size-secondary margin-bottom-20">
            <label>Council Member Address</label>
            <div className="address">{getShortTzAddress(accountPkh || '')}</div>
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
            text={'Update Council Member'}
            kind={ACTION_PRIMARY}
            icon={'upload'}
            type={SUBMIT}
          />
        </div>
      </form>
    </FormStyled>
  )
}
