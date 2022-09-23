import React, { FC, useState } from 'react'
import { useDispatch } from 'react-redux'

// components
import { ACTION_PRIMARY } from '../../../app/App.components/Button/Button.constants'
import { Button } from '../../../app/App.components/Button/Button.controller'
import { Input } from "app/App.components/Input/Input.controller"

// types
import { InputStatusType } from "app/App.components/Input/Input.constants"

// styles
import { FormStyled } from './BreakGlassCouncilForm.style'

// actions
import { signAction } from '../BreakGlassCouncil.actions'

const INIT_FORM = {
  breakGlassActionID: '',
}

export const FormSignActionView: FC = () => {
  const dispatch = useDispatch()

  const [form, setForm] = useState(INIT_FORM)
  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    breakGlassActionID: '',
  })

  const { breakGlassActionID } = form;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      await dispatch(signAction(Number(breakGlassActionID)))
      setForm(INIT_FORM)
      setFormInputStatus({
        breakGlassActionID: '',
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
      <h1>Sign Action</h1>
      <p>Please enter valid function parameters for sign action</p>

      <form className='form' onSubmit={handleSubmit}>
        <div className="form-fields input-size-primary">
          <label>Break Glass Action ID</label>

          <Input
            type="text"
            required
            value={breakGlassActionID}
            name="breakGlassActionID"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleChange(e)
              handleBlur(e)
            }}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e)}
            inputStatus={formInputStatus.breakGlassActionID}
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
