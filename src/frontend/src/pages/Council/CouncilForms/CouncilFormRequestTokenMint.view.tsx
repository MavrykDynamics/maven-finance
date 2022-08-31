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
import { requestTokenMint } from '../Council.actions'

// style
import { CouncilFormStyled } from './CouncilForms.style'

const INIT_FORM = {
  treasuryAddress: '',
  tokenAmount: 0,
  purpose: '',
}

export const CouncilFormRequestTokenMint = () => {
  const dispatch = useDispatch()
  const [form, setForm] = useState(INIT_FORM)

  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    treasuryAddress: '',
    tokenAmount: '',
    purpose: '',
  })

  const { treasuryAddress, tokenAmount, purpose } = form

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await dispatch(requestTokenMint(treasuryAddress, +tokenAmount, purpose))
      setForm(INIT_FORM)
      setFormInputStatus({
        treasuryAddress: '',
        tokenAmount: '',
        purpose: '',
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
    <CouncilFormStyled onSubmit={handleSubmit}>
      <a className="info-link" href="https://mavryk.finance/litepaper#mavryk-council" target="_blank" rel="noreferrer">
        <Icon id="question" />
      </a>
      <h1 className="form-h1">Request Token Mint</h1>
      <p>Please enter valid function parameters for requesting token mint</p>
      <div className="form-grid">
        <div>
          <label>Treasury Address</label>
          <Input
            type="text"
            required
            value={treasuryAddress}
            name="treasuryAddress"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleChange(e)
              handleBlur(e)
            }}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e)}
            inputStatus={formInputStatus.treasuryAddress}
          />
        </div>

        <div className="with-pinned-text">
          <label>Token Amount</label>
          <Input
            type="text"
            required
            value={tokenAmount}
            name="tokenAmount"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleChange(e)
              handleBlur(e)
            }}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e)}
            inputStatus={formInputStatus.tokenAmount}
            pinnedText={'MVK'}
          />
        </div>
      </div>
      <div className="textarea-group">
        <label>Purpose for Request</label>
        <TextArea
          required
          value={purpose}
          name="purpose"
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            handleChange(e)
            handleBlur(e)
          }}
          onBlur={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleBlur(e)}
          inputStatus={formInputStatus.purpose}
        />
      </div>
      <div className="btn-group">
        <Button text="Request Mint" className="plus-btn" kind={'actionPrimary'} icon="coin-loan" type="submit" />
      </div>
    </CouncilFormStyled>
  )
}
