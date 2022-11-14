import { useState, useMemo, useCallback } from 'react'
import { useDispatch } from 'react-redux'

// type
import type { InputStatusType } from '../../../app/App.components/Input/Input.constants'
import { RequestPurposeMaxLength } from 'utils/TypesAndInterfaces/Council'

// helpers
import { validateFormField } from 'utils/validatorFunctions' 

// view
import { Input } from '../../../app/App.components/Input/Input.controller'
import { TextArea } from '../../../app/App.components/TextArea/TextArea.controller'
import { Button } from '../../../app/App.components/Button/Button.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { DropDown, DropdownItemType } from '../../../app/App.components/DropDown/DropDown.controller'

// action
import { transferTokens } from '../Council.actions'

// style
import { CouncilFormStyled } from './CouncilForms.style'

const INIT_FORM = {
  receiverAddress: '',
  tokenContractAddress: '',
  tokenAmount: 0,
  tokenId: 0,
  purpose: '',
}

const itemsForDropDown = [
  {
    text: 'FA12',
    value: 'FA12',
  },
  {
    text: 'FA2',
    value: 'FA2',
  },
  {
    text: 'TEZ',
    value: 'TEZ',
  },
]

export const CouncilFormTransferTokens = ({ requestPurposeMaxLength }: RequestPurposeMaxLength) => {
  const dispatch = useDispatch()
  const [form, setForm] = useState(INIT_FORM)

  const ddItems = useMemo(() => itemsForDropDown.map(({ text }) => text), [])
  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [tokenType, setTokenType] = useState<DropdownItemType | undefined>()

  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    receiverAddress: '',
    tokenContractAddress: '',
    tokenAmount: '',
    tokenId: '',
    purpose: '',
  })

  const { receiverAddress, tokenContractAddress, tokenAmount, tokenId, purpose } = form

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const typeOfToken = tokenType?.value || ''
      await dispatch(transferTokens(receiverAddress, tokenContractAddress, +tokenAmount, typeOfToken, +tokenId, purpose))

      setTokenType(undefined)
      setDdIsOpen(false)
      setForm(INIT_FORM)
      setFormInputStatus({
        receiverAddress: '',
        tokenContractAddress: '',
        tokenAmount: '',
        tokenId: '',
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

  const handleBlur = validateFormField(setFormInputStatus)

  const handleClickDropdown = useCallback(() => {
    setDdIsOpen(!ddIsOpen)
  }, [ddIsOpen])

  const handleClickDropdownItem = useCallback((e: string) => {
    const chosenItem = itemsForDropDown.filter((item) => item.text === e)[0]
    setTokenType(chosenItem)
    setDdIsOpen(!ddIsOpen)
  }, [ddIsOpen])

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
            value={receiverAddress}
            name="receiverAddress"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleChange(e)
              handleBlur(e)
            }}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e)}
            inputStatus={formInputStatus.receiverAddress}
          />
        </div>

        <div />

        <div>
          <label>Token Contract Address</label>
          <Input
            type="text"
            required
            value={tokenContractAddress}
            name="tokenContractAddress"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleChange(e)
              handleBlur(e)
            }}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e)}
            inputStatus={formInputStatus.tokenContractAddress}
          />
        </div>

        <div>
          <label>Token Amount to Transfer</label>
          <Input
            type="number"
            required
            value={tokenAmount}
            name="tokenAmount"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleChange(e)
              handleBlur(e)
            }}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e)}
            inputStatus={formInputStatus.tokenAmount}
          />
        </div>

        <div>
          <label>Token Type (FA12, FA2, TEZ)</label>
          <DropDown
            clickOnDropDown={handleClickDropdown}
            placeholder={'Choose token type'}
            isOpen={ddIsOpen}
            setIsOpen={setDdIsOpen}
            itemSelected={tokenType?.text}
            items={ddItems}
            clickOnItem={handleClickDropdownItem}
          />
        </div>

        <div>
          <label>Token ID</label>
          <Input
            type="number"
            required
            value={tokenId}
            name="tokenId"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleChange(e)
              handleBlur(e)
            }}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e)}
            inputStatus={formInputStatus.tokenId}
          />
        </div>
      </div>
      <div className="textarea-group">
        <label>Purpose for Transfer</label>
        <TextArea
          required
          value={purpose}
          name="purpose"
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            handleChange(e)
            handleBlur(e, requestPurposeMaxLength)
          }}
          onBlur={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleBlur(e, requestPurposeMaxLength)}
          inputStatus={formInputStatus.purpose}
        />
      </div>
      <div className="btn-group">
        <Button text="Transfer Tokens" className="plus-btn" kind={'actionPrimary'} icon="transfer-fill" type="submit" />
      </div>
    </CouncilFormStyled>
  )
}
