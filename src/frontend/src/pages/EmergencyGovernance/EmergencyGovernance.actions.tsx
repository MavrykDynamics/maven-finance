import { State } from '../../reducers'
import emergencyGovernanceAddress from '../../deployments/emergencyGovernanceAddress.json'
import { TezosToolkit } from '@taquito/taquito'
import { showToaster } from '../../app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from '../../app/App.components/Toaster/Toaster.constants'
import { HIDE_EXIT_FEE_MODAL } from '../Doorman/ExitFeeModal/ExitFeeModal.actions'
import { getDoormanStorage, getMvkTokenStorage } from '../Doorman/Doorman.actions'

export const GET_EMERGENCY_GOVERNANCE_STORAGE = 'GET_EMERGENCY_GOVERNANCE_STORAGE'
export const SET_EMERGENCY_GOVERNANCE_ACTIVE = 'SET_EMERGENCY_GOVERNANCE_ACTIVE'
export const SET_HAS_ACKNOWLEDGED_EMERGENCY_GOV = 'SET_HAS_ACKNOWLEDGED_EMERGENCY_GOV'
export const getEmergencyGovernanceStorage = (accountPkh?: string) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  // if (!accountPkh) {
  //   dispatch(showToaster(ERROR, 'Public address not found', 'Make sure your wallet is connected'))
  //   return
  // }
  const contract = accountPkh
    ? await state.wallet.tezos?.wallet.at(emergencyGovernanceAddress.address)
    : await new TezosToolkit(
        (process.env.REACT_APP_RPC_PROVIDER as any) || 'https://hangzhounet.api.tez.ie/',
      ).contract.at(emergencyGovernanceAddress.address)

  const storage = await (contract as any).storage()
  console.log('Printing out Emergency Governance storage:\n', storage)
  const currentEmergencyGovernanceId = storage.currentEmergencyGovernanceId

  dispatch({
    type: SET_EMERGENCY_GOVERNANCE_ACTIVE,
    emergencyGovActive: currentEmergencyGovernanceId.toNumber() !== 0,
  })
  dispatch({
    type: GET_EMERGENCY_GOVERNANCE_STORAGE,
    emergencyGovernanceStorage: storage,
  })
}

export const SUBMIT_EMERGENCY_GOVERNANCE_PROPOSAL_REQUEST = 'SUBMIT_EMERGENCY_GOVERNANCE_PROPOSAL_REQUEST'
export const SUBMIT_EMERGENCY_GOVERNANCE_PROPOSAL_RESULT = 'SUBMIT_EMERGENCY_GOVERNANCE_PROPOSAL_RESULT'
export const SUBMIT_EMERGENCY_GOVERNANCE_PROPOSAL_ERROR = 'SUBMIT_EMERGENCY_GOVERNANCE_PROPOSAL_ERROR'
export const submitEmergencyGovernanceProposal = (form: any) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  if (!state.wallet.ready) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (state.loading) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    const contract = await state.wallet.tezos?.wallet.at(emergencyGovernanceAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.triggerEmergencyControl(form.title, form.description).send()
    console.log('transaction', transaction)

    dispatch({
      type: SUBMIT_EMERGENCY_GOVERNANCE_PROPOSAL_REQUEST,
      emergencyGovernanceProposal: form,
    })
    dispatch(showToaster(INFO, 'Unstaking...', 'Please wait 30s'))
    dispatch({
      type: HIDE_EXIT_FEE_MODAL,
    })

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Unstaking done', 'All good :)'))

    dispatch({
      type: SUBMIT_EMERGENCY_GOVERNANCE_PROPOSAL_RESULT,
    })

    dispatch(getMvkTokenStorage(state.wallet.accountPkh))
    dispatch(getDoormanStorage())
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: SUBMIT_EMERGENCY_GOVERNANCE_PROPOSAL_ERROR,
      error,
    })
  }
}
