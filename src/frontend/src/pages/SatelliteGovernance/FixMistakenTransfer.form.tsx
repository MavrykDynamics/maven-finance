import { useState } from 'react'
import { useDispatch } from 'react-redux'

// view
import Icon from '../../app/App.components/Icon/Icon.view'
import { Input } from '../../app/App.components/Input/Input.controller'
import { Button } from '../../app/App.components/Button/Button.controller'
import TableGridFix from '../../app/App.components/TableGrid/TableGridFix.view'

// type
import type { InputStatusType } from '../../app/App.components/Input/Input.constants'
import type { TableListType } from '../../app/App.components/TableGrid/TableGrid.types'

// helpers
import { SatelliteGovernanceTransfer } from '../../utils/TypesAndInterfaces/Delegation'
import { validateFormField, validateFormAddress } from 'utils/validatorFunctions' 

// actions
import { fixMistakenTransfer } from './SatelliteGovernance.actions'

// style
import { AvailableActionsStyle } from './SatelliteGovernance.style'

const TOKEN_TYPES = ['FA12', 'FA2', 'TEZ']
const INIT_TABLE_HEADERS = ['Address', 'Amount', `Token Type (${TOKEN_TYPES.join('/')})`]
const INIT_TABLE_DATA = [INIT_TABLE_HEADERS, ['', '', TOKEN_TYPES[0]]]

type Props = {
  maxLength: { purposeMaxLength: number },
}

export const FixMistakenTransferForm = ({ maxLength }: Props) => {
  const dispatch = useDispatch()
  const [tableData, setTableData] = useState<TableListType>(INIT_TABLE_DATA)
  const [form, setForm] = useState({
    targetContractAddress: '',
    purpose: '',
  })
  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    targetContractAddress: '',
    purpose: '',
  })

  const { targetContractAddress, purpose } = form

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const noralizeTableData = tableData
        .filter((_, i) => i !== 0)
        .map((item) => {
          return {
            to_: item[0],
            amount: +item[1],
            token: item[2] as SatelliteGovernanceTransfer['token'],
          }
        })

      console.log('%c ||||| noralizeTableData', 'color:yellowgreen', noralizeTableData)
      dispatch(fixMistakenTransfer(targetContractAddress, purpose, noralizeTableData))
      // setForm({
      //   targetContractAddress: '',
      //   purpose: '',
      // })
      // setFormInputStatus({
      //   targetContractAddress: '',
      //   purpose: '',
      // })
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
  const handleBlurAddress = validateFormAddress(setFormInputStatus)

  const handleSetTableData = (data: TableListType) => {
    console.log('%c ||||| data', 'color:yellowgreen', data)
    setTableData(data)
  }

  return (
    <AvailableActionsStyle>
      <form onSubmit={handleSubmit} className="inputs-block">
        <a
          className="info-link"
          href="https://mavryk.finance/litepaper#satellites-governance-and-the-decentralized-oracle"
          target="_blank"
          rel="noreferrer"
        >
          <Icon id="question" />
        </a>
        <div>
          <h1>Fix Mistaken Transfer</h1>
          <p>Please enter a valid tz1 address of the satellite to take action on</p>
          <fieldset>
            <div className="satellite-address">
              <label>Target Contract Address</label>
              <Input
                value={targetContractAddress}
                name="targetContractAddress"
                required
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleChange(e)
                  handleBlurAddress(e)
                }}
                onBlur={handleBlurAddress}
                inputStatus={formInputStatus.targetContractAddress}
              />
            </div>
            <div className="satellite-address">
              <label>Purpose</label>
              <Input
                value={purpose}
                name="purpose"
                required
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleChange(e)
                  handleBlur(e, maxLength.purposeMaxLength)
                }}
                onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e, maxLength.purposeMaxLength)}
                inputStatus={formInputStatus.purpose}
              />
            </div>
          </fieldset>
          <label>Transfer List</label>
        </div>
        <div className="table-wrap">
          <TableGridFix tableData={tableData} setTableData={handleSetTableData} />
        </div>
        <div className="suspend-satellite-group">
          <Button
            // className={variant}
            icon="plus"
            kind="actionPrimary"
            text={'Fix Mistaken Transfer'}
            type="submit"
          />
        </div>
      </form>
    </AvailableActionsStyle>
  )
}
