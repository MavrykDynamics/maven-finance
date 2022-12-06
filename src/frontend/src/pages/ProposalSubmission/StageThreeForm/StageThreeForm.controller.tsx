import React, { useState, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { State } from 'reducers'

// types
import { StageThreeFormProps, StageThreeValidityItem } from '../ProposalSybmittion.types'
import { Governance_Proposal } from 'utils/generated/graphqlTypes'

// helpers
import { checkPaymentExists, getValidityStageThreeTable, MAX_ROWS } from '../ProposalSubmition.helpers'

// components
import { StyledTooltip } from '../../../app/App.components/Tooltip/Tooltip.view'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { Input } from 'app/App.components/Input/Input.controller'

// const
import { ProposalStatus } from '../../../utils/TypesAndInterfaces/Governance'
import { INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'

// styles
import {
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

export const StageThreeForm = ({
  proposalId,
  currentProposal,
  paymentMethods,
  currentProposalValidation,
  updateLocalProposalValidation,
  setProposalHasChange,
  updateLocalProposalData,
}: StageThreeFormProps) => {
  const { proposalPayments, locked, title } = currentProposal
  const {
    governanceStorage: {
      fee,
      config: { successReward },
    },
    governancePhase,
  } = useSelector((state: State) => state.governance)

  useEffect(() => {
    if (!proposalPayments.some(checkPaymentExists)) {
      handleAddRow()
    }
  }, [proposalId, proposalPayments])

  const isProposalRound = governancePhase === 'PROPOSAL'
  const isMaxRows = MAX_ROWS <= proposalPayments.length

  const [openDrop, setOpenDrop] = useState('')

  const handleOnBlur = (e: React.ChangeEvent<HTMLInputElement>, itemId: number) => {
    const { name, value } = e.target
    const validationResult = getValidityStageThreeTable(name as StageThreeValidityItem, value)
      ? INPUT_STATUS_SUCCESS
      : INPUT_STATUS_ERROR
    updateLocalProposalValidation(
      {
        paymentsValidation: currentProposalValidation.paymentsValidation.map((paymentValidation) =>
          paymentValidation.paymentId === itemId
            ? { ...paymentValidation, [name]: validationResult }
            : paymentValidation,
        ),
      },
      proposalId,
    )
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string | number } },
    row: number,
  ) => {
    let { name, value } = e.target

    updateLocalProposalData(
      {
        proposalPayments: proposalPayments.map((item, idx) => {
          return idx === row
            ? {
                ...item,
                [name]: value,
              }
            : item
        }),
      },
      proposalId,
    )

    setOpenDrop('')
    setProposalHasChange(true)
  }

  const handleAddRow = () => {
    const { address = '', id = 0 } = paymentMethods?.[0] ?? {}
    const newId = -(proposalPayments.length + 1)
    updateLocalProposalData(
      {
        proposalPayments: proposalPayments.concat({
          // TODO: check how to remove it
          governance_proposal: currentProposal as unknown as Governance_Proposal,
          governance_proposal_id: 0,
          id: -(proposalPayments.length + 1),
          internal_id: 0,
          title: '',
          to__id: '',
          token_amount: 0,
          token_id: id,
          token_address: address,
        }),
      },
      proposalId,
    )
    updateLocalProposalValidation(
      {
        paymentsValidation: currentProposalValidation.paymentsValidation.concat({
          token_amount: '',
          title: '',
          to__id: '',
          paymentId: newId,
        }),
      },
      proposalId,
    )
    setOpenDrop('')
    setProposalHasChange(true)
  }

  const handleDeleteRow = (rowId: number) => {
    updateLocalProposalData(
      {
        proposalPayments: proposalPayments.filter(({ id }) => id !== rowId),
      },
      proposalId,
    )
    updateLocalProposalValidation(
      {
        paymentsValidation: currentProposalValidation.paymentsValidation.filter(({ paymentId }) => paymentId !== rowId),
      },
      proposalId,
    )
    setOpenDrop('')
    setProposalHasChange(true)
  }

  const handleToggleDrop = (i: number) => {
    setOpenDrop(openDrop ? '' : `${i}-asset`)
  }

  const disabledInputs = useMemo(() => !isProposalRound || locked, [isProposalRound, locked])

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
          <FormTitleEntry>{title}</FormTitleEntry>
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
      <FormTableGrid className={!isProposalRound ? 'disabled' : ''}>
        <TableGridWrap>
          <div className="table-wrap">
            <table>
              <tr key="row-names">
                <td key="row-names-address">Address</td>
                <td key="row-names-purpose">Purpose</td>
                <td key="row-names-amount">Amount</td>
                <td key="row-names-asset">Payment Type (XTZ/MVK)</td>
              </tr>
              {proposalPayments.map((rowItems, i) => {
                const validationObj = currentProposalValidation.paymentsValidation?.find(
                  ({ paymentId }) => paymentId === rowItems.id,
                )
                const { symbol: selectedSymbol = 'MVK' } =
                  paymentMethods.find(({ address }) => address === rowItems.token_address) ?? paymentMethods?.[0] ?? {}

                if (!rowItems || rowItems.title === null || rowItems.token_amount === null) return null

                return (
                  <tr key={i}>
                    <td key={`${i}-address`} className="input-cell">
                      <Input
                        onFocus={() => setOpenDrop('')}
                        value={rowItems.to__id ?? ''}
                        type={'text'}
                        name="to__id"
                        disabled={disabledInputs}
                        inputStatus={validationObj?.to__id}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e, i)}
                        onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleOnBlur(e, rowItems.id)}
                        className="submit-proposal-stage-3"
                      />
                    </td>
                    <td key={`${i}-purpose`} className="input-cell">
                      <Input
                        onFocus={() => setOpenDrop('')}
                        value={rowItems.title ?? ''}
                        type={'text'}
                        name="title"
                        disabled={disabledInputs}
                        inputStatus={validationObj?.title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e, i)}
                        onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleOnBlur(e, rowItems.id)}
                        className="submit-proposal-stage-3"
                      />
                    </td>
                    <td key={`${i}-amount`} className="input-cell">
                      <Input
                        onFocus={() => setOpenDrop('')}
                        value={rowItems.token_amount ?? ''}
                        type={'number'}
                        name="token_amount"
                        disabled={disabledInputs}
                        inputStatus={validationObj?.token_amount}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e, i)}
                        onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleOnBlur(e, rowItems.id)}
                        className="submit-proposal-stage-3"
                      />
                    </td>
                    <td key={`${i}-asset`}>
                      <div className="table-drop">
                        <button
                          onClick={() => handleToggleDrop(i)}
                          disabled={locked || !isProposalRound}
                          className="table-drop-btn-cur"
                        >
                          {selectedSymbol}
                        </button>
                        {openDrop === `${i}-asset` && (
                          <DropDownListContainer>
                            <DropDownList>
                              {paymentMethods.map(({ symbol, address }) => (
                                <DropDownListItem
                                  onClick={() =>
                                    handleChange(
                                      {
                                        target: { name: 'token_address', value: address },
                                      },
                                      i,
                                    )
                                  }
                                  key={symbol}
                                >
                                  {symbol} {selectedSymbol === symbol ? <Icon id="check-stroke" /> : null}
                                </DropDownListItem>
                              ))}
                            </DropDownList>
                          </DropDownListContainer>
                        )}
                      </div>

                      <div className="delete-button-wrap">
                        <StyledTooltip placement="top" title="Delete row">
                          <button
                            onClick={() => handleDeleteRow(rowItems.id)}
                            disabled={locked || !isProposalRound}
                            className="delete-button"
                          >
                            <Icon id="delete" />
                          </button>
                        </StyledTooltip>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </table>
          </div>
          {!isMaxRows ? (
            <StyledTooltip placement="top" title="Insert 1 row bottom">
              <button disabled={locked || !isProposalRound} className="btn-add-row" onClick={handleAddRow}>
                +
              </button>
            </StyledTooltip>
          ) : null}
        </TableGridWrap>
      </FormTableGrid>
    </SubmissionStyled>
  )
}
