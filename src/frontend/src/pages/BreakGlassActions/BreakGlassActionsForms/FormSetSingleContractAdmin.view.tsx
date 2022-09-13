import React, { FC, useState } from 'react'

// components
import { ACTION_PRIMARY } from '../../../app/App.components/Button/Button.constants'
import { Button } from '../../../app/App.components/Button/Button.controller'
import { Input } from "app/App.components/Input/Input.controller"

// types
import { InputStatusType } from "app/App.components/Input/Input.constants"

// styles
import { FormStyled } from './BreakGlassActionsForm.style'

export const FormSetSingleContractAdminView: FC = () => {
  const [form, setForm] = useState({ newAddress: '', targetContract: '' })
  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    newAddress: '',
    targetContract: '',
  })

  const { newAddress, targetContract } = form;

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
      <h1>Set Single Contract Admin</h1>
      <p>Please enter valid function parameters for adding a vestee</p>

      <form onSubmit={handleClickButton}>
        <div className="input-size">
          <label>New Admin Address</label>
          <Input
            className="margin-bottom-15"
            type="text"
            required
            value={newAddress}
            name="newAddress"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleChange(e)
              handleBlur(e)
            }}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e)}
            inputStatus={formInputStatus.address}
          />

          <label>Target Contract</label>
          <Input
            type="text"
            required
            value={targetContract}
            name="targetContract"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleChange(e)
              handleBlur(e)
            }}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e)}
            inputStatus={formInputStatus.address}
          />
        </div>

        <Button
          className="start_verification"
          text={'Set Contracts Admin'}
          kind={ACTION_PRIMARY}
          icon={'profile'}
          type="submit"
        />
      </form>
    </FormStyled>
  )
}
