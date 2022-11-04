import React, { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// types
import { StageThreeFormProps, StageThreeValidityItem } from '../ProposalSybmittion.types'
import { SubmitProposalStageThreeValidation } from '../../../utils/TypesAndInterfaces/Forms'
import { Governance_Proposal } from 'utils/generated/graphqlTypes'

// helpers
import { updateProposalPayments } from '../ProposalSubmission.actions'

// components
import { StyledTooltip } from '../../../app/App.components/Tooltip/Tooltip.view'
import { Button } from '../../../app/App.components/Button/Button.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { Input } from 'app/App.components/Input/Input.controller'

// const
import { ProposalStatus } from '../../../utils/TypesAndInterfaces/Governance'
import { getValidityStageThreeTable, MAX_ROWS } from '../ProposalSubmition.helpers'
import { ACTION_SECONDARY } from 'app/App.components/Button/Button.constants'

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

export const StageThreeForm = ({
  proposalId,
  currentProposal,
  updateLocalProposalData,
  handleDropProposal,
  handleLockProposal,
  proposalChangesState,
  setProposalsChangesState,
}: StageThreeFormProps) => {
  const { proposalPayments, locked, title } = currentProposal
  const dispatch = useDispatch()
  const {
    governanceStorage: {
      fee,
      config: { successReward },
    },
    governancePhase,
  } = useSelector((state: State) => state.governance)

  const currentPaymentsChanges = useMemo(
    () => proposalChangesState?.[proposalId]?.proposalPaymentsChanges,
    [proposalId, proposalChangesState],
  )

  // TODO: clarify it with Sam
  const PaymentMethods = [
    { symbol: 'XTZ', address: 'tez', id: 1 },
    { symbol: 'MVK', address: 'mvk', id: 0 },
  ]

  // we can modify only when current period is 'proposal'
  const isProposalRound = governancePhase === 'PROPOSAL'
  const isMaxRows = MAX_ROWS <= proposalPayments.length

  const [validForm, setValidForm] = useState<SubmitProposalStageThreeValidation>([])
  const [openDrop, setOpenDrop] = useState('')

  const handleOnBlur = (e: React.ChangeEvent<HTMLInputElement>, row: number) => {
    const { name, value } = e.target
    const isValidValue = getValidityStageThreeTable(name as StageThreeValidityItem, value)
    setValidForm(
      validForm.map((obj, idx) => {
        return idx === row
          ? {
              ...obj,
              [name]: isValidValue ? 'success' : 'error',
            }
          : obj
      }),
    )
  }

  useEffect(() => {
    if (!isProposalRound) setValidForm([])
  }, [isProposalRound])

  // set up validity state for new proposal, on proposal change and add new row for proposal, if there are no rows in proposal
  useEffect(() => {
    if (proposalPayments.length === 0) {
      handleAddRow()
    }

    setValidForm(
      proposalPayments.map(({ token_amount, title, to__id }) => ({
        token_amount: getValidityStageThreeTable('token_amount', token_amount) ? 'success' : 'error',
        to__id: getValidityStageThreeTable('to__id', to__id ?? '') ? 'success' : 'error',
        title: getValidityStageThreeTable('title', title) ? 'success' : 'error',
      })),
    )
  }, [proposalId, proposalPayments])

  const handleSubmitFinancialRequestData = () => {
    dispatch(updateProposalPayments(currentPaymentsChanges, proposalId))
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

    const { id, title, token_address, token_amount, to__id } = proposalPayments[row]

    // if local, so it exist in changes, just update it
    if (id < 0 && currentPaymentsChanges.find((item) => item?.addOrSetPaymentData?.localId === id)) {
      const updatedPaymentsData = currentPaymentsChanges.map((item) => {
        if (item?.addOrSetPaymentData?.localId === id) {
          switch (name) {
            case 'to__id':
              item.addOrSetPaymentData.transaction.to_ = String(value)
              break
            case 'title':
              item.addOrSetPaymentData.title = String(value)
              break
            case 'token_amount':
              item.addOrSetPaymentData.transaction.amount = parseFloat(value.toString())
              break
            case 'token_address':
              const {
                symbol = 'MVK',
                address = 'mvk',
                id = 0,
              } = PaymentMethods.find(({ symbol }) => symbol === value) ?? {}
              item.addOrSetPaymentData.transaction.token = {
                [symbol]: {
                  tokenContractAddress: address,
                  tokenId: id,
                },
              }
              break
          }
        }

        return item
      })

      setProposalsChangesState({
        ...proposalChangesState,
        [proposalId]: {
          ...proposalChangesState[proposalId],
          proposalPaymentsChanges: updatedPaymentsData,
        },
      })
    } else {
      const {
        symbol = 'MVK',
        address = 'mvk',
        id = 0,
      } = (name === 'token_address'
        ? PaymentMethods.find(({ address }) => address === String(value))
        : PaymentMethods.find(({ address }) => address === token_address)) ?? {}

      // Adding updated info for row, that exists on server
      setProposalsChangesState({
        ...proposalChangesState,
        [proposalId]: {
          ...proposalChangesState[proposalId],
          proposalPaymentsChanges: currentPaymentsChanges.concat([
            {
              addOrSetPaymentData: {
                title: name === 'title' ? String(value) : title,
                transaction: {
                  to_: name === 'to__id' ? String(value) : to__id ?? '',
                  token: {
                    [symbol]: {
                      tokenContractAddress: address,
                      tokenId: id,
                    },
                  },
                  amount: name === 'token_amount' ? Number(value) : token_amount,
                },
                localId: id,
                index: row.toString(),
              },
            },
          ]),
        },
      })
    }

    setOpenDrop('')
  }

  const handleAddRow = () => {
    const { symbol = 'MVK', address = 'mvk', id = 0 } = PaymentMethods[0]
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

    setProposalsChangesState({
      ...proposalChangesState,
      [proposalId]: {
        ...proposalChangesState[proposalId],
        proposalPaymentsChanges: [
          ...currentPaymentsChanges,
          {
            addOrSetPaymentData: {
              title: '',
              transaction: {
                to_: '',
                token: {
                  [symbol]: {
                    tokenContractAddress: address,
                    tokenId: id,
                  },
                },
                amount: 0,
              },
              localId: -(proposalPayments.length + 1),
            },
          },
        ],
      },
    })

    setOpenDrop('')
  }

  const handleDeleteRow = (rowNumber: number) => {
    const row = proposalPayments[rowNumber]
    const existInServer = row.id >= 0
    if (existInServer) {
      setProposalsChangesState({
        ...proposalChangesState,
        [proposalId]: {
          ...proposalChangesState[proposalId],
          proposalPaymentsChanges: [
            ...currentPaymentsChanges,
            {
              removePaymentData: rowNumber.toString(),
            },
          ],
        },
      })
    } else {
      updateLocalProposalData(
        {
          proposalPayments: proposalPayments.filter((_, idx) => idx !== rowNumber),
        },
        proposalId,
      )
    }

    // if payment exists only on client, just remove it from changes queue
    setProposalsChangesState({
      ...proposalChangesState,
      [proposalId]: {
        ...proposalChangesState[proposalId],
        proposalPaymentsChanges: [
          ...currentPaymentsChanges.filter(({ addOrSetPaymentData: { localId = null } = {} }) => localId !== row.id),
        ],
      },
    })
    setOpenDrop('')
  }

  const handleToggleDrop = (i: number) => {
    setOpenDrop(openDrop ? '' : `${i}-asset`)
  }

  const isDisabledSubmitTableBtn = useMemo(
    () =>
      (!isProposalRound &&
        validForm.some(
          ({ token_amount, title, to__id }) => token_amount === 'error' || title === 'error' || to__id === 'error',
        )) ||
      locked ||
      currentPaymentsChanges.length === 0,
    [validForm, isProposalRound],
  )
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
                const isLocal = rowItems.id < 0
                const validationObj = validForm[i]
                const { symbol: selectedSymbol = 'MVK' } =
                  PaymentMethods.find(({ address }) => address === rowItems.token_address) ?? {}

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
                        onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleOnBlur(e, i)}
                        className="submit-proposal-stage-3"
                      />
                    </td>
                    <td key={`${i}-purpose`} className="input-cell">
                      <Input
                        onFocus={() => setOpenDrop('')}
                        value={rowItems.title}
                        type={'text'}
                        name="title"
                        disabled={!isLocal || disabledInputs}
                        inputStatus={validationObj?.title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e, i)}
                        onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleOnBlur(e, i)}
                        className="submit-proposal-stage-3"
                      />
                    </td>
                    <td key={`${i}-amount`} className="input-cell">
                      <Input
                        onFocus={() => setOpenDrop('')}
                        value={rowItems.token_amount}
                        type={'number'}
                        name="token_amount"
                        disabled={disabledInputs}
                        inputStatus={validationObj?.token_amount}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e, i)}
                        onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleOnBlur(e, i)}
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
                              {PaymentMethods.map(({ symbol, address }) => (
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

                      {proposalPayments.length > 2 ? (
                        <div className="delete-button-wrap">
                          <StyledTooltip placement="top" title="Delete row">
                            <button
                              onClick={() => handleDeleteRow(i)}
                              disabled={locked || !isProposalRound}
                              className="delete-button"
                            >
                              <Icon id="delete" />
                            </button>
                          </StyledTooltip>
                        </div>
                      ) : null}
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
      <FormButtonContainer>
        <Button
          icon="close-stroke"
          className="close delete-pair"
          text="Drop Proposal"
          kind={ACTION_SECONDARY}
          onClick={() => handleDropProposal(proposalId)}
        />

        {!locked ? (
          <Button
            icon="lock"
            className="lock"
            text={'Lock Proposal'}
            disabled={!isProposalRound}
            onClick={() => handleLockProposal(proposalId)}
            kind="actionSecondary"
          />
        ) : null}

        <Button
          icon="financial"
          disabled={isDisabledSubmitTableBtn}
          className="financial"
          kind="actionPrimary"
          text={'Submit Financial Request'}
          onClick={handleSubmitFinancialRequestData}
        />
      </FormButtonContainer>
    </SubmissionStyled>
  )
}
