import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { submitEmergencyGovernanceProposal } from '../EmergencyGovernance.actions'
import { hideExitFeeModal } from './EmergencyGovProposalModal.actions'
import { EmergencyGovProposalModalView } from './EmergencyGovProposalModal.view'
import { isValidLength, validateFormAndThrowErrors } from '../../../utils/validatorFunctions'
import {
  EmergencyGovernanceProposalForm,
  EmergencyGovernanceProposalFormInputStatus,
  ValidEmergencyGovernanceProposalForm,
} from '../../../utils/TypesAndInterfaces/Forms'

export const EmergencyGovProposalModal = () => {
  const dispatch = useDispatch()
  const { showing } = useSelector((state: State) => state.exitFeeModal)
  const { governanceStorage } = useSelector((state: State) => state.governance)
  const { emergencyGovernanceStorage: { config: { proposalTitleMaxLength, proposalDescMaxLength } } } = useSelector((state: State) => state.emergencyGovernance)
  const { fee } = governanceStorage

  const [form, setForm] = useState<EmergencyGovernanceProposalForm>({
    title: '',
    description: '',
  })
  const [validForm, setValidForm] = useState<ValidEmergencyGovernanceProposalForm>({
    title: false,
    description: false,
  })
  const [formInputStatus, setFormInputStatus] = useState<EmergencyGovernanceProposalFormInputStatus>({
    title: '',
    description: '',
  })

  const cancelCallback = () => {
    dispatch(hideExitFeeModal())
  }
  const handleOnBlur = (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>,
    formField: string,
  ) => {
    let updatedState, validityCheckResult
    switch (formField) {
      case 'TITLE':
        validityCheckResult = isValidLength(form.title, 1, proposalTitleMaxLength)
        setValidForm({ ...validForm, title: validityCheckResult })
        updatedState = { ...validForm, title: validityCheckResult }
        setFormInputStatus({ ...formInputStatus, title: updatedState.title ? 'success' : 'error' })
        break
      case 'DESCRIPTION':
        validityCheckResult = isValidLength(form.description, 1, proposalDescMaxLength)
        setValidForm({ ...validForm, description: validityCheckResult })
        updatedState = { ...validForm, description: validityCheckResult }
        setFormInputStatus({ ...formInputStatus, description: updatedState.description ? 'success' : 'error' })
        break
    }
  }

  const submitEmergencyGovProposalCallback = () => {
    const formIsValid = validateFormAndThrowErrors(dispatch, validForm)
    if (formIsValid) dispatch(submitEmergencyGovernanceProposal(form))
  }

  return (
    <EmergencyGovProposalModalView
      showing={showing}
      fee={fee}
      submitEmergencyGovProposalCallback={submitEmergencyGovProposalCallback}
      cancelCallback={cancelCallback}
      form={form}
      setForm={setForm}
      formInputStatus={formInputStatus}
      handleOnBlur={handleOnBlur}
    />
  )
}
