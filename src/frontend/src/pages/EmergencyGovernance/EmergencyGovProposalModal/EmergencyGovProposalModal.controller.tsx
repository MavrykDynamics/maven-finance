import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { getEmergencyGovernanceStorage, submitEmergencyGovernanceProposal } from '../EmergencyGovernance.actions'
import { getBreakGlassStorage } from '../../BreakGlass/BreakGlass.actions'
import { hideExitFeeModal } from './EmergencyGovProposalModal.actions'
import { EmergencyGovProposalModalView } from './EmergencyGovProposalModal.view'
import { isNotAllWhitespace, validateFormAndThrowErrors } from '../../../utils/validatorFunctions'
import { updateProposal } from '../../ProposalSubmission/ProposalSubmission.actions'
import {
  EmergencyGovernanceProposalForm,
  EmergencyGovernanceProposalFormInputStatus,
  ValidEmergencyGovernanceProposalForm,
} from '../../../utils/TypesAndInterfaces/Forms'

export const EmergencyGovProposalModal = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { showing } = useSelector((state: State) => state.exitFeeModal)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { emergencyGovernanceStorage, emergencyGovActive } = useSelector((state: State) => state.emergencyGovernance)
  const { breakGlassStorage, glassBroken } = useSelector((state: State) => state.breakGlass)
  const { governanceStorage } = useSelector((state: State) => state.governance)
  const { fee, address } = governanceStorage

  const [form, setForm] = useState<EmergencyGovernanceProposalForm>({
    title: '',
    description: '',
    screenshots: '',
  })
  const [validForm, setValidForm] = useState<ValidEmergencyGovernanceProposalForm>({
    title: false,
    description: false,
    screenshots: false,
  })
  const [formInputStatus, setFormInputStatus] = useState<EmergencyGovernanceProposalFormInputStatus>({
    title: '',
    description: '',
    screenshots: '',
  })

  const cancelCallback = () => {
    dispatch(hideExitFeeModal())
  }
  const handleOnBlur = (e: any, formField: string) => {
    let updatedState, validityCheckResult
    switch (formField) {
      case 'TITLE':
        validityCheckResult = isNotAllWhitespace(form.title)
        setValidForm({ ...validForm, title: validityCheckResult })
        updatedState = { ...validForm, title: validityCheckResult }
        setFormInputStatus({ ...formInputStatus, title: updatedState.title ? 'success' : 'error' })
        break
      case 'DESCRIPTION':
        validityCheckResult = isNotAllWhitespace(form.description)
        setValidForm({ ...validForm, description: validityCheckResult })
        updatedState = { ...validForm, description: validityCheckResult }
        setFormInputStatus({ ...formInputStatus, description: updatedState.description ? 'success' : 'error' })
        break
    }
  }

  const submitEmergencyGovProposalCallback = () => {
    const formIsValid = validateFormAndThrowErrors(dispatch, validForm)
    if (formIsValid) dispatch(submitEmergencyGovernanceProposal(form, accountPkh as any))
  }

  return (
    <EmergencyGovProposalModalView
      loading={loading}
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
