import React, { FC, useState } from 'react'

// components
import { ACTION_PRIMARY } from '../../../app/App.components/Button/Button.constants'
import { Button } from '../../../app/App.components/Button/Button.controller'
import { Input } from "app/App.components/Input/Input.controller"

// types
import { InputStatusType } from "app/App.components/Input/Input.constants"

// styles
import { FormStyled } from './BreakGlassActionsForm.style'

export const FormSetAllContractsAdminView: FC = () => {
  const [form, setForm] = useState({ address: '' })
  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    address: '',
  })

  const { address } = form;

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
      <h1>Set All Contracts Admin</h1>
      <p>Please enter valid function parameters for adding a vestee</p>

      <form className='form' onSubmit={handleClickButton}>
        <div className="form-fields input-size-primary">
          <label>New Admin Address</label>

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

        <Button
          className="stroke-01"
          text={'Set Contracts Admin'}
          kind={ACTION_PRIMARY}
          icon={'profile'}
          type="submit"
        />
      </form>
    </FormStyled>
  )
}
