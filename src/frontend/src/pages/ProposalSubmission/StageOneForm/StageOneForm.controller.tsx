import { useDispatch, useSelector } from 'react-redux'
import React, { useEffect, useState } from 'react'
import { State } from 'reducers'

// view
import { SubmitProposalFormInputStatus, ValidSubmitProposalForm } from '../../../utils/TypesAndInterfaces/Forms'
import { StatusFlag } from 'app/App.components/StatusFlag/StatusFlag.controller'
import { TextArea } from 'app/App.components/TextArea/TextArea.controller'
import {
  FormHeaderGroup,
  FormTitleAndFeeContainer,
  FormTitleContainer,
  FormTitleEntry,
  FormButtonContainer,
} from '../ProposalSubmission.style'
import { Input } from 'app/App.components/Input/Input.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { Button } from 'app/App.components/Button/Button.controller'

// types
import { ProposalStatus } from 'utils/TypesAndInterfaces/Governance'
import { StageOneFormProps } from '../ProposalSybmittion.types'

// helpers, constants
import { isNotAllWhitespace, isValidHttpUrl, validateFormAndThrowErrors } from '../../../utils/validatorFunctions'
import { submitProposal } from '../ProposalSubmission.actions'
import { DEFAULT_VALIDITY, DEFAULT_INPUT_STATUSES } from '../ProposalSubmition.helpers'
import { ACTION_SECONDARY, SUBMIT } from 'app/App.components/Button/Button.constants'

import '@silevis/reactgrid/styles.css'

export const StageOneForm = ({
  proposalId,
  updateLocalProposalData,
  currentProposal,
  handleDropProposal,
}: StageOneFormProps) => {
  const dispatch = useDispatch()
  const {
    fee,
    currentRound,
    config: { successReward },
  } = useSelector((state: State) => state.governance.governanceStorage)

  const [validForm, setValidForm] = useState<ValidSubmitProposalForm>(DEFAULT_VALIDITY)
  const [formInputStatus, setFormInputStatus] = useState<SubmitProposalFormInputStatus>(DEFAULT_INPUT_STATUSES)

  const isProposalRound = currentRound === 'PROPOSAL'
  const isProposalSubmitted = proposalId !== -1
  const disabled = !isProposalRound || isProposalSubmitted

  const handleOnBlur = (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>,
    formField: string,
  ) => {
    let validityCheckResult
    switch (formField) {
      case 'TITLE':
        validityCheckResult = isNotAllWhitespace(currentProposal.title)
        setValidForm({ ...validForm, title: validityCheckResult })
        setFormInputStatus({ ...formInputStatus, title: validityCheckResult ? 'success' : 'error' })
        break
      case 'DESCRIPTION':
        validityCheckResult = isNotAllWhitespace(currentProposal.description)
        setValidForm({ ...validForm, description: validityCheckResult })
        setFormInputStatus({ ...formInputStatus, description: validityCheckResult ? 'success' : 'error' })
        break
      case 'SUCCESS_MVK_REWARD':
        setValidForm({ ...validForm, successMVKReward: currentProposal.successReward >= 0 })
        setFormInputStatus({
          ...formInputStatus,
          successMVKReward: currentProposal.successReward >= 0 ? 'success' : 'error',
        })
        break
      case 'SOURCE_CODE_LINK':
        validityCheckResult = isValidHttpUrl(currentProposal.sourceCode)
        setValidForm({ ...validForm, sourceCode: validityCheckResult })
        setFormInputStatus({ ...formInputStatus, sourceCode: validityCheckResult ? 'success' : 'error' })
        break
      case 'IPFS':
        setValidForm({ ...validForm, ipfs: Boolean(e) })
        break
    }
  }

  // update local state value and parent state due to inputted info
  const inputHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    updateLocalProposalData(
      {
        [name]: value,
      },
      proposalId,
    )
  }

  const clearState = (): void => {
    setValidForm(DEFAULT_VALIDITY)
    setFormInputStatus(DEFAULT_INPUT_STATUSES)
  }

  useEffect(() => {
    if (!isProposalRound) clearState()
  }, [isProposalRound])

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault()
    const formIsValid = validateFormAndThrowErrors(dispatch, validForm)
    if (formIsValid)
      await dispatch(
        submitProposal(
          {
            title: currentProposal.title,
            description: currentProposal.description,
            sourceCode: currentProposal.sourceCode,
            ipfs: '',
          },
          fee,
          clearState,
        ),
      )
  }

  return (
    <form onSubmit={handleSubmitProposal}>
      <FormHeaderGroup>
        <h1>Stage 1 </h1>
        <StatusFlag
          text={currentProposal.locked ? 'LOCKED' : 'UNLOCKED'}
          status={currentProposal.locked ? ProposalStatus.DEFEATED : ProposalStatus.EXECUTED}
        />
        <a className="info-link" href="https://mavryk.finance/litepaper#governance" target="_blank" rel="noreferrer">
          <Icon id="question" />
        </a>
      </FormHeaderGroup>
      <FormTitleAndFeeContainer>
        <FormTitleContainer>
          {isProposalSubmitted ? (
            <div>
              <label>1 - Proposal Title</label>
              <FormTitleEntry>{currentProposal.title}</FormTitleEntry>
            </div>
          ) : (
            <>
              <label>1 - Enter Proposal Title</label>
              <Input
                type="text"
                name="title"
                value={currentProposal.title}
                onChange={inputHandler}
                onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleOnBlur(e, 'TITLE')}
                inputStatus={formInputStatus.title}
                disabled={disabled}
              />
            </>
          )}
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
      {isProposalSubmitted ? (
        <div className="desr-block">
          <label>4 - Proposal Description</label>
          <FormTitleEntry>{currentProposal.description}</FormTitleEntry>
        </div>
      ) : (
        <>
          <label>4 - Enter a description</label>
          <TextArea
            className="description-textarea"
            name="description"
            value={currentProposal.description}
            onChange={inputHandler}
            onBlur={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleOnBlur(e, 'DESCRIPTION')}
            inputStatus={formInputStatus.description}
            disabled={disabled}
          />
        </>
      )}

      {isProposalSubmitted ? (
        <div className="desr-block">
          <label>5 - Proposal source code</label>
          <FormTitleEntry>{currentProposal.sourceCode}</FormTitleEntry>
        </div>
      ) : (
        <div className="source-code-input-wrap">
          <label>5 - Please add a link to the source code changes (if you have)</label>
          <Input
            type="text"
            value={currentProposal.sourceCode}
            name="sourceCode"
            onChange={inputHandler}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleOnBlur(e, 'SOURCE_CODE_LINK')}
            inputStatus={formInputStatus.sourceCode}
            disabled={disabled}
            required
          />
        </div>
      )}

      <FormButtonContainer>
        {isProposalSubmitted ? (
          <Button
            icon="close-stroke"
            className="close delete-pair"
            text="Drop Proposal"
            kind={ACTION_SECONDARY}
            onClick={() => handleDropProposal(proposalId)}
          />
        ) : (
          <Button icon="auction" kind="actionPrimary" disabled={disabled} text={'Submit Proposal'} type={SUBMIT} />
        )}
      </FormButtonContainer>
    </form>
  )
}
