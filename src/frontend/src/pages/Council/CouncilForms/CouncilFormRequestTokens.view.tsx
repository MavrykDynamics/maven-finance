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
import { requestTokens } from '../Council.actions'

// style
import { CouncilFormStyled } from './CouncilForms.style'

const INIT_FORM = {
  treasuryAddress: '',
  tokenContractAddress: '',
  tokenName: '',
  tokenAmount: 0,
  tokenType: '',
  tokenId: 0,
  purpose: '',
}

export const CouncilFormRequestTokens = () => {
  const dispatch = useDispatch()
  const [form, setForm] = useState(INIT_FORM)

  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    treasuryAddress: '',
    tokenContractAddress: '',
    tokenName: '',
    tokenAmount: '',
    tokenType: '',
    tokenId: '',
    purpose: '',
  })

  const { treasuryAddress, tokenContractAddress, tokenName, tokenAmount, tokenType, tokenId, purpose } = form

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    try {
      await dispatch(
        requestTokens(treasuryAddress, tokenContractAddress, tokenName, +tokenAmount, tokenType, +tokenId, purpose),
      )
      setForm(INIT_FORM)
      setFormInputStatus({
        treasuryAddress: '',
        tokenContractAddress: '',
        tokenName: '',
        tokenAmount: '',
        tokenType: '',
        tokenId: '',
        purpose: '',
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
      <h1 className="form-h1">Request Tokens</h1>
      <p>Please enter valid function parameters for requesting tokens</p>
      <div className="form-grid">
        <div>
          <label>Treasury Address</label>
          <Input
            type="text"
            required
            value={treasuryAddress}
            name="treasuryAddress"
            onChange={(e: any) => {
              handleChange(e)
              handleBlur(e)
            }}
            onBlur={(e: any) => handleBlur(e)}
            inputStatus={formInputStatus.treasuryAddress}
          />
        </div>

        <div>
          <label>Token Contract Address</label>
          <Input
            type="text"
            required
            value={tokenContractAddress}
            name="tokenContractAddress"
            onChange={(e: any) => {
              handleChange(e)
              handleBlur(e)
            }}
            onBlur={(e: any) => handleBlur(e)}
            inputStatus={formInputStatus.tokenContractAddress}
          />
        </div>

        <div>
          <label>Token Name</label>
          <Input
            type="text"
            required
            value={tokenName}
            name="tokenName"
            onChange={(e: any) => {
              handleChange(e)
              handleBlur(e)
            }}
            onBlur={(e: any) => handleBlur(e)}
            inputStatus={formInputStatus.tokenName}
          />
        </div>

        <div>
          <label>Token Amount to Transfer</label>
          <Input
            type="number"
            required
            value={tokenAmount}
            name="tokenAmount"
            onChange={(e: any) => {
              handleChange(e)
              handleBlur(e)
            }}
            onBlur={(e: any) => handleBlur(e)}
            inputStatus={formInputStatus.tokenAmount}
          />
        </div>

        <div>
          <label>Token Type (FA12, FA2, TEZ)</label>
          <Input
            type="text"
            required
            value={tokenType}
            name="tokenType"
            onChange={(e: any) => {
              handleChange(e)
              handleBlur(e)
            }}
            onBlur={(e: any) => handleBlur(e)}
            inputStatus={formInputStatus.tokenType}
          />
        </div>

        <div>
          <label>Token ID</label>
          <Input
            type="number"
            required
            value={tokenId}
            name="tokenId"
            onChange={(e: any) => {
              handleChange(e)
              handleBlur(e)
            }}
            onBlur={(e: any) => handleBlur(e)}
            inputStatus={formInputStatus.tokenId}
          />
        </div>
      </div>
      <div className="textarea-group">
        <label>Purpose for Request</label>
        <TextArea
          required
          value={purpose}
          name="purpose"
          onChange={(e: any) => {
            handleChange(e)
            handleBlur(e)
          }}
          onBlur={(e: any) => handleBlur(e)}
          inputStatus={formInputStatus.purpose}
        />
      </div>
      <div className="btn-group">
        <Button text="Request Tokens" className="plus-btn" kind={'actionPrimary'} icon="transfer-fill" type="submit" />
      </div>
    </CouncilFormStyled>
  )
}
