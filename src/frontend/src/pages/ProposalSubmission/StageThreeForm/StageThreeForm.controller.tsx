import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// types
import type { ProposalPaymentType } from '../../../utils/TypesAndInterfaces/Governance'
import { calcWithoutPrecision, calcWithoutMu } from '../../../utils/calcFunctions'
import { Governance_Proposal_Payment } from '../../../utils/generated/graphqlTypes'

// helpers
import { normalizeTokenStandart } from '../../Governance/Governance.helpers'
import {
  ProposalFinancialRequestForm,
  ProposalFinancialRequestInputStatus,
  ValidFinancialRequestForm,
} from '../../../utils/TypesAndInterfaces/Forms'
import { isJsonString } from '../../../utils/validatorFunctions'
import { submitFinancialRequestData } from '../ProposalSubmission.actions'

// components
import { StyledTooltip } from '../../../app/App.components/Tooltip/Tooltip.view'
import { Button } from '../../../app/App.components/Button/Button.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { lockProposal, deletePaymentData } from '../ProposalSubmission.actions'

// const
import { ProposalStatus } from '../../../utils/TypesAndInterfaces/Governance'

// hooks
import useGovernence from '../../Governance/UseGovernance'

// styles
import {
  FormButtonContainer,
  FormHeaderGroup,
  FormTitleAndFeeContainer,
  FormTitleContainer,
  FormTitleEntry,
  FormTableGrid,
  SubmissionStyled,
} from '../ProposalSubmission.style'
import { TableGridWrap } from '../../../app/App.components/TableGrid/TableGrid.style'
import {
  DropDownListContainer,
  DropDownList,
  DropDownListItem,
} from '../../../app/App.components/DropDown/DropDown.style'

type StageThreeFormProps = {
  locked: boolean
  proposalId: number | undefined
  proposalTitle: string
  proposalPayments: ProposalPaymentType[] | undefined
}

export const PAYMENTS_TYPES = ['XTZ', 'MVK']
const INIT_TABLE_HEADERS = ['Address', 'Purpose', 'Amount', 'Payment Type (XTZ/MVK)', '-', '-']
const INIT_TABLE_DATA = [INIT_TABLE_HEADERS, ['', '', '', PAYMENTS_TYPES[0], '-', '-']]
const MAX_ROWS = 10

export const StageThreeForm = ({ locked, proposalTitle, proposalId, proposalPayments }: StageThreeFormProps) => {
  const dispatch = useDispatch()
  const { governanceStorage, governancePhase } = useSelector((state: State) => state.governance)

  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { fee } = governanceStorage
  const successReward = governanceStorage.config.successReward
  const [tableData, setTableData] = useState(INIT_TABLE_DATA)
  const [tableJson, setTableJson] = useState('')

  const [form, setForm] = useState<ProposalFinancialRequestForm>({
    title: proposalTitle,
    financialData: { jsonString: tableJson },
  })
  const [validForm, setValidForm] = useState<ValidFinancialRequestForm>({
    financialData: false,
  })
  const [formInputStatus, setFormInputStatus] = useState<ProposalFinancialRequestInputStatus>({
    financialData: '',
  })

  const { watingProposals } = useGovernence()

  const isProposalRound = governancePhase === 'PROPOSAL' && !watingProposals.length
  const disabled = !isProposalRound || !form.title

  const handleLockProposal = () => {
    if (proposalId) dispatch(lockProposal(proposalId, accountPkh as string))
  }

  const enebleSubmit = tableData.flat().every((item) => Boolean(item))
  const valueRows = tableData.filter((_, i) => i > 0)

  console.log('%c ||||| valueRows', 'color:yellowgreen', valueRows)

  const isAllRowsNotUpdate = valueRows.every((item) => item.includes('notUpdate'))

  console.log('%c ||||| enebleSubmit', 'color:pink', enebleSubmit)
  console.log('%c ||||| disabled', 'color:pink', disabled)
  console.log('%c ||||| isAllRowsNotUpdate', 'color:pink', isAllRowsNotUpdate)

  const disabledSubmitTable = !enebleSubmit || disabled || isAllRowsNotUpdate

  console.log('%c ||||| disabledSubmitTable', 'color:yellowgreen', disabledSubmitTable)

  const handleOnBlur = () => {
    const validityCheckResult = isJsonString(form.financialData?.jsonString ?? '')
    setValidForm({ ...validForm, financialData: validityCheckResult })
    const updatedState = { ...validForm, financialData: validityCheckResult }
    setFormInputStatus({ ...formInputStatus, financialData: updatedState.financialData ? 'success' : 'error' })
  }

  const clearState = (): void => {
    setForm({
      title: proposalTitle,
      financialData: { jsonString: tableJson },
    })
    setValidForm({
      financialData: false,
    })
    setFormInputStatus({
      financialData: '',
    })
  }

  useEffect(() => {
    if (!isProposalRound) clearState()
  }, [isProposalRound])

  useEffect(() => {
    if (proposalPayments?.length) {
      console.log('%c ||||| proposalPayments', 'color:yellowgreen', proposalPayments)
      const prepareTablePayments = proposalPayments.map((item) => {
        console.log('%c ||||| item', 'color:red', item)
        const paymentType = normalizeTokenStandart(item.token)
        const amount =
          paymentType === 'MVK' ? calcWithoutPrecision(item.token_amount) : calcWithoutMu(item.token_amount)
        return [item.to__id, item.title, `${amount}`, paymentType, item.id, 'notUpdate']
      }) as string[][]
      setTableData([INIT_TABLE_HEADERS, ...prepareTablePayments])
    }
  }, [proposalPayments])

  const handleSubmitFinancialRequestData = () => {
    const submitData = tableData.filter((row, i) => i !== 0 && !row.includes('notUpdate'))

    console.log('%c ||||| submitData', 'color:yellowgreen', submitData)
    if (proposalId) {
      dispatch(submitFinancialRequestData(proposalId, submitData, accountPkh as string))
    }
  }

  console.log('%c ||||| proposalPayments', 'color:yellowgreen', proposalPayments)
  const [openDrop, setOpenDrop] = useState('')

  const isMaxRows = MAX_ROWS <= tableData.length

  const handleChangeData = (value: string, i: number, j: number, id: number) => {
    const cloneTable = [...tableData]
    cloneTable[i][j] = value

    proposalPayments?.forEach((item) => {
      if (item.id === id) {
        const currentRow = cloneTable[i]
        const itemType = normalizeTokenStandart(item.token)
        const amount = itemType === 'MVK' ? calcWithoutPrecision(item.token_amount) : calcWithoutMu(item.token_amount)

        const isSame =
          currentRow[0] === item.to__id &&
          currentRow[1] === item.title &&
          itemType === currentRow[3] &&
          amount === +currentRow[2]
        cloneTable[i][5] = isSame ? 'notUpdate' : '-'
      }
    })

    setTableData(cloneTable)
    setOpenDrop('')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, i: number, j: number, id: number) => {
    const value = e.target.value
    handleChangeData(value, i, j, id)
  }

  const handleAddRow = () => {
    setOpenDrop('')
    const newFillRow = ['', '', '', PAYMENTS_TYPES[0], '-', '-']
    setTableData([...tableData, newFillRow])
  }

  console.log('%c ||||| tableData', 'color:blue', tableData)

  const handleDeleteRow = (id: number, existInServer: boolean, row: string[]) => {
    // console.log('%c ||||| propose', 'color:yellowgreen', propose)
    console.log('%c ||||| id', 'color:yellowgreen', id)
    console.log('%c ||||| existInServer', 'color:yellowgreen', existInServer)
    // const findOriginRow = proposalPayments?.find((item) => item.title === propose)

    // console.log('%c ||||| findOriginRow', 'color:yellowgreen', findOriginRow)

    if (existInServer) {
      if (proposalId) dispatch(deletePaymentData(proposalId, row, accountPkh as string))
    } else {
      setOpenDrop('')
      const newTable = tableData.filter((_, index) => index !== id)
      setTableData(newTable)
    }
  }

  const handleToggleDrop = (i: number, j: number) => {
    if (openDrop) {
      setOpenDrop('')
    } else {
      setOpenDrop(`${i}-${j}`)
    }
  }

  return (
    <SubmissionStyled>
      <FormHeaderGroup>
        <h1>Stage 3</h1>
        <StatusFlag
          text={locked ? 'LOCKED' : 'UNLOCKED'}
          status={locked ? ProposalStatus.DEFEATED : ProposalStatus.EXECUTED}
        />
        <a className="info-link" href="https://mavryk.finance/litepaper#governance" target="_blank" rel="noreferrer">
          <Icon id="question" />
        </a>
      </FormHeaderGroup>
      <FormTitleAndFeeContainer>
        <FormTitleContainer>
          <label>1 - Enter Proposal Title</label>
          <FormTitleEntry>{form.title}</FormTitleEntry>
        </FormTitleContainer>
        <div>
          <label>2 - Proposal Success Reward</label>
          <FormTitleEntry>{successReward} MVK</FormTitleEntry>
        </div>
        <div>
          <label>3 - Fee</label>
          <FormTitleEntry>{fee} XTZ</FormTitleEntry>
        </div>
      </FormTitleAndFeeContainer>
      <label>4 - Enter Proposal Data</label>
      <FormTableGrid className={disabled ? 'disabled' : ''}>
        <TableGridWrap>
          <div className="table-wrap">
            <table>
              {tableData.map((row, i) => {
                const existInServer = proposalPayments?.find((item) => item.title === row[1])
                return (
                  <tr key={i}>
                    {row.map((colValue, j) => {
                      const isFirstRow = i === 0
                      const isLastColumn = !isFirstRow && j === 3
                      const isOpen = openDrop === `${i}-${j}`

                      const disabledInput = j === 1 && !!existInServer
                      if (j < 4) {
                        return (
                          <td key={`${i}+${j}`}>
                            {isFirstRow ? (
                              colValue
                            ) : !isLastColumn ? (
                              <input
                                onFocus={() => setOpenDrop('')}
                                value={colValue}
                                type={j === 2 ? 'number' : 'text'}
                                disabled={disabledInput}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e, i, j, +row[4])}
                              />
                            ) : (
                              <div className="table-drop">
                                <button onClick={() => handleToggleDrop(i, j)} className="table-drop-btn-cur">
                                  {colValue}
                                </button>
                                {isOpen && (
                                  <DropDownListContainer>
                                    <DropDownList>
                                      {PAYMENTS_TYPES.map((value, index) => {
                                        const isActive = colValue === value
                                        return (
                                          <DropDownListItem
                                            onClick={() => handleChangeData(value, i, j, +row[4])}
                                            key={Math.random()}
                                          >
                                            {value} {isActive ? <Icon id="check-stroke" /> : null}
                                          </DropDownListItem>
                                        )
                                      })}
                                    </DropDownList>
                                  </DropDownListContainer>
                                )}
                              </div>
                            )}

                            {isLastColumn && tableData.length > 2 ? (
                              <div className="delete-button-wrap">
                                <StyledTooltip placement="top" title="Delete row">
                                  <button
                                    onClick={() => handleDeleteRow(i, !!existInServer, row)}
                                    className="delete-button"
                                  >
                                    <Icon id="delete" />
                                  </button>
                                </StyledTooltip>
                              </div>
                            ) : null}
                          </td>
                        )
                      }

                      return null
                    })}
                  </tr>
                )
              })}
            </table>
          </div>
          {!isMaxRows ? (
            <StyledTooltip placement="top" title="Insert 1 row bottom">
              <button className="btn-add-row" onClick={handleAddRow}>
                +
              </button>
            </StyledTooltip>
          ) : null}
        </TableGridWrap>
      </FormTableGrid>
      <FormButtonContainer>
        {!locked ? (
          <Button
            icon="lock"
            className="lock"
            text={'Lock Proposal'}
            disabled={!proposalId || disabled}
            onClick={handleLockProposal}
            kind="actionSecondary"
          />
        ) : null}

        <Button
          icon="financial"
          disabled={disabledSubmitTable}
          className="financial"
          kind="actionPrimary"
          text={'Submit Financial Request'}
          onClick={handleSubmitFinancialRequestData}
        />
      </FormButtonContainer>
    </SubmissionStyled>
  )
}
