import { showToaster } from '../../app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from '../../app/App.components/Toaster/Toaster.constants'
import { fetchFromIndexer } from '../../gql/fetchGraphQL'
import type { AppDispatch, GetState } from '../../app/App.controller'
import {
  EMERGENCY_GOVERNANCE_STORAGE_QUERY,
  EMERGENCY_GOVERNANCE_STORAGE_QUERY_NAME,
  EMERGENCY_GOVERNANCE_STORAGE_QUERY_VARIABLE,
} from '../../gql/queries'
import { State } from '../../reducers'
import { getDoormanStorage, getMvkTokenStorage } from '../Doorman/Doorman.actions'
import { HIDE_EXIT_FEE_MODAL } from '../Doorman/ExitFeeModal/ExitFeeModal.actions'
import { normalizeEmergencyGovernance } from '../EmergencyGovernance/EmergencyGovernance.helpers'
import { EmergencyGovernanceProposalForm } from '../../utils/TypesAndInterfaces/Forms'

export const GET_EMERGENCY_GOVERNANCE_STORAGE = 'GET_EMERGENCY_GOVERNANCE_STORAGE'
export const SET_EMERGENCY_GOVERNANCE_ACTIVE = 'SET_EMERGENCY_GOVERNANCE_ACTIVE'
export const SET_HAS_ACKNOWLEDGED_EMERGENCY_GOV = 'SET_HAS_ACKNOWLEDGED_EMERGENCY_GOV'
export const getEmergencyGovernanceStorage =
  (accountPkh?: string) => async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    const storage = await fetchFromIndexer(
      EMERGENCY_GOVERNANCE_STORAGE_QUERY,
      EMERGENCY_GOVERNANCE_STORAGE_QUERY_NAME,
      EMERGENCY_GOVERNANCE_STORAGE_QUERY_VARIABLE,
    )

    const emergencyGovernanceStorage = normalizeEmergencyGovernance(storage?.emergency_governance[0])

    const currentEmergencyGovernanceId = emergencyGovernanceStorage.currentEmergencyGovernanceRecordId

    dispatch({
      type: SET_EMERGENCY_GOVERNANCE_ACTIVE,
      emergencyGovActive: currentEmergencyGovernanceId !== 0,
    })
    dispatch({
      type: GET_EMERGENCY_GOVERNANCE_STORAGE,
      emergencyGovernanceStorage: emergencyGovernanceStorage,
    })
  }

export const SUBMIT_EMERGENCY_GOVERNANCE_PROPOSAL_REQUEST = 'SUBMIT_EMERGENCY_GOVERNANCE_PROPOSAL_REQUEST'
export const SUBMIT_EMERGENCY_GOVERNANCE_PROPOSAL_RESULT = 'SUBMIT_EMERGENCY_GOVERNANCE_PROPOSAL_RESULT'
export const SUBMIT_EMERGENCY_GOVERNANCE_PROPOSAL_ERROR = 'SUBMIT_EMERGENCY_GOVERNANCE_PROPOSAL_ERROR'
export const submitEmergencyGovernanceProposal =
  (form: EmergencyGovernanceProposalForm) => async (dispatch: AppDispatch, getState: GetState) => {
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
      dispatch({
        type: SUBMIT_EMERGENCY_GOVERNANCE_PROPOSAL_REQUEST,
        emergencyGovernanceProposal: form,
      })
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.emergencyGovernanceAddress.address)
      console.log('contract', contract)
      const triggerFee = state.emergencyGovernance.emergencyGovernanceStorage.config.requiredFeeMutez || 0
      console.log(triggerFee)
      const transaction = await contract?.methods
        .triggerEmergencyControl(form.title, form.description)
        .send({ amount: triggerFee })
      console.log('transaction', transaction)

      dispatch(showToaster(INFO, 'Submitting emergency proposal...', 'Please wait 30s'))
      dispatch({
        type: HIDE_EXIT_FEE_MODAL,
      })

      const done = await transaction?.confirmation()
      console.log('done', done)
      dispatch(showToaster(SUCCESS, 'Emergency Proposal Submitted', 'All good :)'))

      dispatch({
        type: SUBMIT_EMERGENCY_GOVERNANCE_PROPOSAL_RESULT,
      })

      dispatch(getMvkTokenStorage(state.wallet.accountPkh))
      dispatch(getDoormanStorage())
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
        dispatch({
          type: SUBMIT_EMERGENCY_GOVERNANCE_PROPOSAL_ERROR,
          error,
        })
      }
    }
  }
