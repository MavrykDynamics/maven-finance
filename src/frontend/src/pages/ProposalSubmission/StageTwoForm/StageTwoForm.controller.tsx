import { useState, useEffect } from 'react'
import { StageTwoFormView } from './StageTwoForm.view'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// types
import type { ProposalDataType } from '../../../utils/TypesAndInterfaces/Governance'

import {
  ProposalUpdateForm,
  ProposalUpdateFormInputStatus,
  ValidProposalUpdateForm,
} from '../../../utils/TypesAndInterfaces/Forms'
import { getFormErrors, isHexadecimalByteString, validateFormAndThrowErrors } from '../../../utils/validatorFunctions'
import { showToaster } from '../../../app/App.components/Toaster/Toaster.actions'
import { ERROR } from '../../../app/App.components/Toaster/Toaster.constants'
import { dropProposal, updateProposal } from '../ProposalSubmission.actions'

type StageTwoFormProps = {
  locked: boolean
  accountPkh?: string
  proposalId: number | undefined
  proposalTitle: string
  proposalData: ProposalDataType[] | undefined
}

export const PROPOSAL_BYTE = {
  bytes: '',
  governance_proposal_record_id: 0,
  id: 0,
  record_internal_id: 0,
  title: '',
}

export const StageTwoForm = ({ locked, accountPkh, proposalTitle, proposalId, proposalData }: StageTwoFormProps) => {
  const dispatch = useDispatch()
  const { governanceStorage, currentRoundProposals } = useSelector((state: State) => state.governance)
  const { fee, governancePhase } = governanceStorage
  const isProposalRound = governancePhase === 'PROPOSAL'
  const successReward = governanceStorage.config.successReward
  const [form, setForm] = useState<ProposalUpdateForm>({
    title: proposalTitle,
    proposalBytes: proposalData?.length ? proposalData : [PROPOSAL_BYTE],
  })

  const [validForm, setValidForm] = useState<ValidProposalUpdateForm>({
    title: false,
    proposalBytes: false,
  })
  const [formInputStatus, setFormInputStatus] = useState<ProposalUpdateFormInputStatus>({
    title: '',
    proposalBytes: '',
  })

  const handleOnBlur = (index: number, text: string, type: string) => {
    const validityCheckResultData = Boolean(text)
    const validityCheckResultText = Boolean(text)

    if (type === 'title') {
      setValidForm({ ...validForm, title: validityCheckResultText })
      const updatedState = { ...validForm, title: validityCheckResultText }
      setFormInputStatus({ ...formInputStatus, title: updatedState.title ? 'success' : 'error' })
    }

    if (type === 'data') {
      setValidForm({ ...validForm, proposalBytes: validityCheckResultData })
      const updatedState = { ...validForm, proposalBytes: validityCheckResultData }
      setFormInputStatus({ ...formInputStatus, proposalBytes: updatedState.proposalBytes ? 'success' : 'error' })
    }
  }

  const clearState = (): void => {
    setForm({
      title: proposalTitle,
      proposalBytes: [PROPOSAL_BYTE],
    })
    setValidForm({
      title: false,
      proposalBytes: false,
    })
    setFormInputStatus({
      title: '',
      proposalBytes: '',
    })
  }

  const handleAddProposal = async () => {
    const formIsValid = validateFormAndThrowErrors(dispatch, validForm)
    if (formIsValid) {
      await dispatch(updateProposal(form, proposalId, clearState))
    }
  }

  const handleUpdateProposal = async () => {
    await dispatch(updateProposal(form, proposalId, clearState))
  }

  const handleDeleteProposal = async () => {
    if (proposalId) await dispatch(dropProposal(proposalId))
  }

  return (
    <StageTwoFormView
      locked={locked}
      form={form}
      fee={fee}
      proposalId={proposalId}
      successReward={successReward}
      setForm={setForm}
      formInputStatus={formInputStatus}
      handleOnBlur={handleOnBlur}
      handleUpdateProposal={handleUpdateProposal}
      handleAddProposal={handleAddProposal}
      handleDeleteProposal={handleDeleteProposal}
      proposalData={proposalData}
    />
  )
}
