import { useState } from 'react'
import { useDispatch } from 'react-redux'

// type
import type { InputStatusType } from '../../../app/App.components/Input/Input.constants'

// helpers
import { validateForm } from '../Council.helpers'

// view
import { Input } from '../../../app/App.components/Input/Input.controller'
import { Button } from '../../../app/App.components/Button/Button.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'

// action
import { setBakerRequest } from '../Council.actions'

// style
import { CouncilFormStyled } from './CouncilForms.style'

export const CouncilFormSetBaker = () => {
  const dispatch = useDispatch()
  const [form, setForm] = useState({
    bakerHash: '',
  })

  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    bakerHash: '',
  })

  const { bakerHash } = form

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await dispatch(setBakerRequest(bakerHash))
      setForm({
        bakerHash: '',
      })
      setFormInputStatus({
        bakerHash: '',
      })
    } catch (error) {
      console.error(error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const handleBlur = validateForm(setFormInputStatus)

  return (
    <CouncilFormStyled onSubmit={handleSubmit}>
      <a className="info-link" href="https://mavryk.finance/litepaper#mavryk-council" target="_blank" rel="noreferrer">
        <Icon id="question" />
      </a>
      <h1 className="form-h1">Set Baker</h1>
      <p>Please enter valid function parameters for setting a baker</p>
      <div className="form-grid form-grid-button-right">
        <div>
          <label>Baker Hash</label>
          <Input
            type="text"
            required
            value={bakerHash}
            name="bakerHash"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleChange(e)
              handleBlur(e)
            }}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e)}
            inputStatus={formInputStatus.bakerHash}
          />
        </div>
        <div className="button-aligment">
          <Button text="Set Baker" className="plus-btn" kind={'actionPrimary'} icon="plus" type="submit" />
        </div>
      </div>
    </CouncilFormStyled>
  )
}
