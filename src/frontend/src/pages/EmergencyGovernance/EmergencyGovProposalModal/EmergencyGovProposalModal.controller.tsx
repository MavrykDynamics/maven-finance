import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { getEmergencyGovernanceStorage } from '../EmergencyGovernance.actions'
import { getBreakGlassStorage } from '../../BreakGlass/BreakGlass.actions'
import { hideExitFeeModal } from './EmergencyGovProposalModal.actions'
import { EmergencyGovProposalModalView } from './EmergencyGovProposalModal.view'
import {
  ProposalUpdateForm,
  ProposalUpdateFormInputStatus,
  ValidProposalUpdateForm,
} from '../../../utils/TypesAndInterfaces/Forms'
import { getFormErrors, isHexadecimalByteString, isNotAllWhitespace } from '../../../utils/validatorFunctions'
import { updateProposal } from '../../ProposalSubmission/ProposalSubmission.actions'
import { showToaster } from '../../../app/App.components/Toaster/Toaster.actions'
import { ERROR } from '../../../app/App.components/Toaster/Toaster.constants'

export const EmergencyGovProposalModal = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { showing } = useSelector((state: State) => state.exitFeeModal)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { emergencyGovernanceStorage, emergencyGovActive } = useSelector((state: State) => state.emergencyGovernance)
  const { breakGlassStorage, glassBroken } = useSelector((state: State) => state.breakGlass)

  const [form, setForm] = useState<any>({
    title: '',
    amountMVKtoTriggerBreakGlass: 0,
    description: '',
  })
  const [validForm, setValidForm] = useState<any>({
    title: false,
    amountMVKtoTriggerBreakGlass: false,
    description: false,
  })
  const [formInputStatus, setFormInputStatus] = useState<any>({
    title: '',
    amountMVKtoTriggerBreakGlass: 'false',
    description: '',
  })

  useEffect(() => {
    dispatch(getEmergencyGovernanceStorage())
    dispatch(getBreakGlassStorage())
  }, [dispatch, accountPkh, showing])

  const cancelCallback = () => {
    dispatch(hideExitFeeModal())
  }
  const handleOnBlur = (formField: string) => {
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
      case 'MVK_TRIGGER_AMOUNT':
        setValidForm({ ...validForm, amountMVKtoTriggerBreakGlass: form.amountMVKtoTriggerBreakGlass >= 0 })
        updatedState = { ...validForm, amountMVKtoTriggerBreakGlass: form.amountMVKtoTriggerBreakGlass >= 0 }
        setFormInputStatus({
          ...formInputStatus,
          amountMVKtoTriggerBreakGlass: updatedState.amountMVKtoTriggerBreakGlass ? 'success' : 'error',
        })
        break
    }
  }

  const submitEmergencyGovProposalCallback = () => {
    const formIsValid = validateForm()
    if (formIsValid) dispatch(updateProposal(form, accountPkh as any))
  }

  const validateForm = () => {
    const { errors, errorMessage } = getFormErrors(validForm)
    if (errors.length === 0) return true
    else {
      const errorTitle = 'Invalid fields'
      dispatch(showToaster(ERROR, errorTitle, errorMessage, 3000))
      return false
    }
  }

  return (
    <EmergencyGovProposalModalView
      loading={loading}
      showing={showing}
      submitEmergencyGovProposalCallback={submitEmergencyGovProposalCallback}
      cancelCallback={cancelCallback}
      form={form}
      setForm={setForm}
      formInputStatus={formInputStatus}
      handleOnBlur={handleOnBlur}
    />
  )
}
