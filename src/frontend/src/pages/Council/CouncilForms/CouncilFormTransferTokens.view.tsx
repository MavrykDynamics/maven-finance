import { useState } from 'react'
import { useDispatch } from 'react-redux'

// type
import type { InputStatusType } from '../../../app/App.components/Input/Input.controller'

// view
import { Input } from '../../../app/App.components/Input/Input.controller'
import { TextArea } from '../../../app/App.components/TextArea/TextArea.controller'
import { Button } from '../../../app/App.components/Button/Button.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'

// action
import { addVestee } from '../Council.actions'

// style
import { CouncilFormStyled } from './CouncilForms.style'

const INIT_FORM = {
  vesteeAddress: '',
  totalAllocated: '',
  cliffInMonths: '',
  vestingInMonths: '',
}

export const CouncilFormTransferTokens = () => {
  const dispatch = useDispatch()
  const [form, setForm] = useState(INIT_FORM)

  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    vesteeAddress: '',
    totalAllocated: '',
    cliffInMonths: '',
    vestingInMonths: '',
  })

  const { vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths } = form

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    try {
      await dispatch(addVestee(vesteeAddress, +totalAllocated, +cliffInMonths, +vestingInMonths))
      setForm(INIT_FORM)
      setFormInputStatus({
        vesteeAddress: '',
        totalAllocated: '',
        cliffInMonths: '',
        vestingInMonths: '',
      })
    } catch (error) {
      console.error(error)
    }
  }

  const handleChange = (e: any) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const handleBlur = (e: any) => {
    setFormInputStatus((prev) => {
      return { ...prev, [e.target.name]: e.target.value ? 'success' : 'error' }
    })
  }

  return (
    <CouncilFormStyled onSubmit={handleSubmit}>
      <a className="info-link" href="https://mavryk.finance/litepaper#mavryk-council" target="_blank" rel="noreferrer">
        <Icon id="question" />
      </a>
      <h1 className="form-h1">Transfer Tokens</h1>
      <p>Please enter valid function parameters for transferring tokens</p>
      <div className="form-grid">
        <div>
          <label>Receiver’s Address</label>
          <Input
            type="text"
            required
            value={vesteeAddress}
            name="vesteeAddress"
            onChange={(e) => {
              handleChange(e)
              handleBlur(e)
            }}
            onBlur={(e) => handleBlur(e)}
            inputStatus={formInputStatus.vesteeAddress}
          />
        </div>

        <div />

        <div>
          <label>Token Contract Address</label>
          <Input
            type="text"
            required
            value={vesteeAddress}
            name="vesteeAddress"
            onChange={(e) => {
              handleChange(e)
              handleBlur(e)
            }}
            onBlur={(e) => handleBlur(e)}
            inputStatus={formInputStatus.vesteeAddress}
          />
        </div>

        <div>
          <label>Token Amount to Transfer</label>
          <Input
            type="number"
            required
            value={totalAllocated}
            name="totalAllocated"
            onChange={(e) => {
              handleChange(e)
              handleBlur(e)
            }}
            onBlur={(e) => handleBlur(e)}
            inputStatus={formInputStatus.totalAllocated}
          />
        </div>

        <div>
          <label>Token Contract Address</label>
          <Input
            type="text"
            required
            value={vesteeAddress}
            name="vesteeAddress"
            onChange={(e) => {
              handleChange(e)
              handleBlur(e)
            }}
            onBlur={(e) => handleBlur(e)}
            inputStatus={formInputStatus.vesteeAddress}
          />
        </div>

        <div>
          <label>Token ID</label>
          <Input
            type="number"
            required
            value={cliffInMonths}
            name="cliffInMonths"
            onChange={(e) => {
              handleChange(e)
              handleBlur(e)
            }}
            onBlur={(e) => handleBlur(e)}
            inputStatus={formInputStatus.cliffInMonths}
          />
        </div>
      </div>
      <div className="textarea-group">
        <label>Purpose for Transfer</label>
        <TextArea
          type="text"
          required
          value={vesteeAddress}
          name="vesteeAddress"
          onChange={(e) => {
            handleChange(e)
            handleBlur(e)
          }}
          onBlur={(e) => handleBlur(e)}
          inputStatus={formInputStatus.vesteeAddress}
        />
      </div>
      <div className="btn-group">
        <Button text="Transfer Tokens" className="plus-btn" kind={'actionPrimary'} icon="transfer-fill" type="submit" />
      </div>
    </CouncilFormStyled>
  )
}
