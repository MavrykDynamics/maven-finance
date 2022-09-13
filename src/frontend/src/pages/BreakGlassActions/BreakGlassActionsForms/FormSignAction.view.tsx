import React, { FC, useState } from 'react'

// components
import { ACTION_PRIMARY } from '../../../app/App.components/Button/Button.constants'
import { Button } from '../../../app/App.components/Button/Button.controller'
import { Input } from "app/App.components/Input/Input.controller"

// types
import { InputStatusType } from "app/App.components/Input/Input.constants"

// styles
import { FormStyled } from './BreakGlassActionsForm.style'

export const FormSignActionView: FC = () => {
  const [form, setForm] = useState({ actionId: '' })
  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    actionId: '',
  })

  const { actionId } = form;

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
      <h1>Sign Action</h1>
      <p>Please enter valid function parameters for sign action</p>

      <form onSubmit={handleClickButton}>
        <div className="input-size">
          <label>Break Glass Action ID</label>

          <Input
            type="text"
            required
            value={actionId}
            name="actionId"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleChange(e)
              handleBlur(e)
            }}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e)}
            inputStatus={formInputStatus.actionId}
          />
        </div>

        <Button
          className="stroke-03"
          text={'Sign Action'}
          kind={ACTION_PRIMARY}
          icon={'sign'}
          type="submit"
        />
      </form>
    </FormStyled>
  )
}
