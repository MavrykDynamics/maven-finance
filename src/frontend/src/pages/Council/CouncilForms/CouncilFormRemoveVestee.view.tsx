import { useState } from 'react'
import { useDispatch } from 'react-redux'

// type
import type { InputStatusType } from '../../../app/App.components/Input/Input.constants'

// helpers
import { checkMaxLength } from 'utils/validation'

// view
import { Input } from '../../../app/App.components/Input/Input.controller'
import { Button } from '../../../app/App.components/Button/Button.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'

// action
import { removeVesteeRequest } from '../Council.actions'

// style
import { CouncilFormStyled } from './CouncilForms.style'

type Props = {
  councilMemberAddressMaxLength: number
}

export const CouncilFormRemoveVestee = ({ councilMemberAddressMaxLength }: Props) => {
  const dispatch = useDispatch()
  const [form, setForm] = useState({
    vesteeAddress: '',
  })

  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    vesteeAddress: '',
  })

  const { vesteeAddress } = form

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await dispatch(removeVesteeRequest(vesteeAddress))
      setForm({
        vesteeAddress: '',
      })
      setFormInputStatus({
        vesteeAddress: '',
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

  const handleBlur = (e: React.ChangeEvent<HTMLInputElement>, maxLength: number) => {
    setFormInputStatus((prev) => {
      const { value, name } = e.target

      const checkMaxLengthField = checkMaxLength(value, maxLength) ? 'success' : 'error' 
      const checkEmptyField = value ? checkMaxLengthField : 'error'

      return { ...prev, [name]: checkEmptyField }
    })
  }

  return (
    <CouncilFormStyled onSubmit={handleSubmit}>
      <a className="info-link" href="https://mavryk.finance/litepaper#mavryk-council" target="_blank" rel="noreferrer">
        <Icon id="question" />
      </a>
      <h1 className="form-h1">Remove Vestee</h1>
      <p>Please enter valid function parameters for removing vestee</p>
      <div className="form-grid form-grid-button-right">
        <div>
          <label>Vestee Address</label>
          <Input
            type="text"
            required
            value={vesteeAddress}
            name="vesteeAddress"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleChange(e)
              handleBlur(e, councilMemberAddressMaxLength)
            }}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e, councilMemberAddressMaxLength)}
            inputStatus={formInputStatus.vesteeAddress}
          />
        </div>
        <div className="button-aligment">
          <Button
            text="Remove Vestee"
            className="plus-btn fill"
            kind={'actionPrimary'}
            icon="close-stroke"
            type="submit"
          />
        </div>
      </div>
    </CouncilFormStyled>
  )
}
