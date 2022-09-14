import React, { FC, useState } from 'react'
import { useDispatch } from 'react-redux'

// components
import { ACTION_PRIMARY } from '../../../app/App.components/Button/Button.constants'
import { Button } from '../../../app/App.components/Button/Button.controller'
import { Input } from "app/App.components/Input/Input.controller"

// types
import { InputStatusType } from "app/App.components/Input/Input.constants"

// styles
import { FormStyled } from './BreakGlassActionsForm.style'

// actions
import { setSingleContractAdmin } from '../BreakGlassActions.actions'

const INIT_FORM = {
  newAddress: '',
  targetContract: '',
}

export const FormSetSingleContractAdminView: FC = () => {
  const dispatch = useDispatch()

  const [form, setForm] = useState(INIT_FORM)
  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    newAddress: '',
    targetContract: '',
  })

  const { newAddress, targetContract } = form;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      await dispatch(setSingleContractAdmin(newAddress, targetContract))
      setForm(INIT_FORM)
      setFormInputStatus({
        newAddress: '',
        targetContract: '',
      })
    } catch (error) {
      console.error(error)
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
      <h1>Set Single Contract Admin</h1>
      <p>Please enter valid function parameters for adding a vestee</p>

      <form className='form' onSubmit={handleSubmit}>
        <div className="form-fields input-size-primary">
          <label>New Admin Address</label>
          <Input
            className="margin-bottom-20"
            type="text"
            required
            value={newAddress}
            name="newAddress"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleChange(e)
              handleBlur(e)
            }}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e)}
            inputStatus={formInputStatus.newAddress}
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
            inputStatus={formInputStatus.targetContract}
          />
        </div>

        <Button
          className="stroke-01"
          text={'Set Contract Admin'}
          kind={ACTION_PRIMARY}
          icon={'profile'}
          type="submit"
        />
      </form>
    </FormStyled>
  )
}
