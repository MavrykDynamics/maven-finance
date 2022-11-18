import { useSelector } from 'react-redux'
import React, { useEffect, useMemo } from 'react'
import { State } from 'reducers'

// view
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
import { StageOneFormProps, ValidationResult } from '../ProposalSybmittion.types'

// helpers, constants
import { isValidLength, isValidHttpUrl } from '../../../utils/validatorFunctions'
import { ACTION_PRIMARY, ACTION_SECONDARY } from 'app/App.components/Button/Button.constants'

import { INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import '@silevis/reactgrid/styles.css'

export const StageOneForm = ({
  proposalId,
  proposalHasChange,
  currentProposal,
  currentProposalValidation,
  updateLocalProposalValidation,
  handleDropProposal,
  updateLocalProposalData,
  handleLockProposal,
  handleUpdateData,
  handleSubmitProposal,
}: StageOneFormProps) => {
  const {
    fee,
    currentRound,
    config: { successReward, proposalTitleMaxLength, proposalDescriptionMaxLength, proposalSourceCodeMaxLength },
  } = useSelector((state: State) => state.governance.governanceStorage)

  const isProposalRound = currentRound === 'PROPOSAL'
  const isProposalSubmitted = proposalId >= 0
  const disabled = !isProposalRound || isProposalSubmitted
  const disabledSubmitBtn = useMemo(
    () =>
      currentProposalValidation.description !== INPUT_STATUS_SUCCESS ||
      currentProposalValidation.title !== INPUT_STATUS_SUCCESS ||
      currentProposalValidation.sourceCode !== INPUT_STATUS_SUCCESS,
    [currentProposalValidation],
  )

  const handleOnBlur = (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>,
    formField: string,
  ) => {
    let validityCheckResult: ValidationResult
    switch (formField) {
      case 'TITLE':
        validityCheckResult = isValidLength(currentProposal.title, 1, proposalTitleMaxLength)
          ? INPUT_STATUS_SUCCESS
          : INPUT_STATUS_ERROR
        updateLocalProposalValidation(
          {
            title: validityCheckResult,
          },
          proposalId,
        )
        break
      case 'DESCRIPTION':
        validityCheckResult = isValidLength(currentProposal.description, 1, proposalDescriptionMaxLength)
          ? INPUT_STATUS_SUCCESS
          : INPUT_STATUS_ERROR
        break
      case 'SUCCESS_MVK_REWARD':
        updateLocalProposalValidation(
          {
            successMVKReward: currentProposal.successReward >= 0 ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR,
          },
          proposalId,
        )
        break
      case 'SOURCE_CODE_LINK':
        validityCheckResult =
          isValidHttpUrl(currentProposal.sourceCode) &&
          isValidLength(currentProposal.sourceCode, 1, proposalSourceCodeMaxLength)
            ? INPUT_STATUS_SUCCESS
            : INPUT_STATUS_ERROR
        updateLocalProposalValidation(
          {
            sourceCode: validityCheckResult,
          },
          proposalId,
        )
        break
      case 'IPFS':
        updateLocalProposalValidation(
          {
            ipfs: Boolean(e) ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR,
          },
          proposalId,
        )
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
    // setValidForm(DEFAULT_VALIDITY)
    // setFormInputStatus(DEFAULT_INPUT_STATUSES)
  }

  useEffect(() => {
    if (!isProposalRound) clearState()
  }, [isProposalRound])

  const submitProposal = async () => {
    await handleSubmitProposal()
    clearState()
  }

  return (
    <form>
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
                inputStatus={currentProposalValidation.title}
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
            inputStatus={currentProposalValidation.description}
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
          <label>5 - Please add a link to the source code changes</label>
          <Input
            type="text"
            value={currentProposal.sourceCode}
            name="sourceCode"
            onChange={inputHandler}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleOnBlur(e, 'SOURCE_CODE_LINK')}
            inputStatus={currentProposalValidation.sourceCode}
            disabled={disabled}
          />
        </div>
      )}

      <FormButtonContainer>
        <Button
          icon="close-stroke"
          className="close delete-pair"
          text="Drop Proposal"
          kind={ACTION_SECONDARY}
          disabled={!isProposalSubmitted || !isProposalRound}
          onClick={() => handleDropProposal(proposalId)}
        />
        <Button
          icon="lock"
          className="lock"
          text={'Lock Proposal'}
          disabled={!isProposalSubmitted || !isProposalRound || currentProposal.locked}
          onClick={() => handleLockProposal(proposalId)}
          kind={ACTION_SECONDARY}
        />
        {isProposalSubmitted ? (
          <Button
            icon="bytes"
            className="bytes"
            text="Save Changes"
            kind={ACTION_PRIMARY}
            disabled={proposalHasChange || currentProposal.locked}
            onClick={() => handleUpdateData(proposalId)}
          />
        ) : (
          <Button
            icon="auction"
            kind={ACTION_PRIMARY}
            text={'Submit Proposal'}
            disabled={disabledSubmitBtn}
            onClick={submitProposal}
          />
        )}
      </FormButtonContainer>
    </form>
  )
}
