import { useState } from 'react'
import { useDispatch } from 'react-redux'

// type
import type { InputStatusType } from '../../../app/App.components/Input/Input.constants'

// view
import { Input } from '../../../app/App.components/Input/Input.controller'
import { Button } from '../../../app/App.components/Button/Button.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'

// action
import { setContractBakerRequest } from '../Council.actions'

// style
import { CouncilFormStyled } from './CouncilForms.style'

const INIT_FORM = {
  targetContractAddress: '',
  keyHash: '',
}

export const CouncilFormSetContractBaker = () => {
  const dispatch = useDispatch()
  const [form, setForm] = useState(INIT_FORM)

  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    targetContractAddress: '',
    keyHash: '',
  })

  const { targetContractAddress, keyHash } = form

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await dispatch(setContractBakerRequest(targetContractAddress, keyHash))
      setForm(INIT_FORM)
      setFormInputStatus({
        targetContractAddress: '',
        keyHash: '',
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

  const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormInputStatus((prev) => {
      return { ...prev, [e.target.name]: e.target.value ? 'success' : 'error' }
    })
  }

  return (
    <CouncilFormStyled onSubmit={handleSubmit}>
      <a className="info-link" href="https://mavryk.finance/litepaper#mavryk-council" target="_blank" rel="noreferrer">
        <Icon id="question" />
      </a>
      <h1 className="form-h1">Set Contract Baker</h1>
      <p>Please enter valid function parameters for set contract baker</p>
      <div className="form-grid">
        <div>
          <label>Target Contract Address</label>
          <Input
            type="text"
            required
            value={targetContractAddress}
            name="targetContractAddress"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleChange(e)
              handleBlur(e)
            }}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e)}
            inputStatus={formInputStatus.targetContractAddress}
          />
        </div>

        <div>
          <label>Key Hash</label>
          <Input
            type="text"
            required
            value={keyHash}
            name="keyHash"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleChange(e)
              handleBlur(e)
            }}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e)}
            inputStatus={formInputStatus.keyHash}
          />
        </div>
      </div>
      <div className="btn-group">
        <Button text="Set Contract Baker" className="plus-btn" kind={'actionPrimary'} icon="plus" type="submit" />
      </div>
    </CouncilFormStyled>
  )
}
