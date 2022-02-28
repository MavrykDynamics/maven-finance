import { State } from '../../reducers'
import governanceAddress from '../../deployments/governanceAddress.json'
import { TezosToolkit } from '@taquito/taquito'
import { getContractBigmapKeys } from '../../utils/api'
import { showToaster } from '../../app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from '../../app/App.components/Toaster/Toaster.constants'
import { getGovernanceStorage } from '../Governance/Governance.actions'

export const ADMIN_ACTION_CHANGE_GOVERNANCE_PERIOD_REQUEST = 'ADMIN_ACTION_CHANGE_GOVERNANCE_PERIOD_REQUEST'
export const ADMIN_ACTION_CHANGE_GOVERNANCE_PERIOD_RESULT = 'ADMIN_ACTION_CHANGE_GOVERNANCE_PERIOD_RESULT'
export const ADMIN_ACTION_CHANGE_GOVERNANCE_PERIOD_ERROR = 'ADMIN_ACTION_CHANGE_GOVERNANCE_PERIOD_ERROR'
export const adminChangeGovernancePeriod =
  (chosenPeriod: string, accountPkh?: string) => async (dispatch: any, getState: any) => {
    const state: State = getState()
    try {
      const contract = await state.wallet.tezos?.wallet.at(governanceAddress.address)
      console.log('contract', contract)
      //startProposalRound
      let transaction
      switch (chosenPeriod) {
        case 'PROPOSAL':
          transaction = await contract?.methods.startProposalRound().send()
          break
        case 'VOTING':
          transaction = await contract?.methods.startVotingRound().send()
          break
        case 'TIME_LOCK':
        default:
          transaction = await contract?.methods.StartTimelockRound().send()
          break
      }
      console.log('transaction', transaction)

      dispatch({ type: ADMIN_ACTION_CHANGE_GOVERNANCE_PERIOD_REQUEST, chosenPeriod })

      dispatch(showToaster(INFO, 'Changing Period...', 'Please wait 30s'))

      const done = await transaction?.confirmation()
      console.log('done', done)
      dispatch(showToaster(SUCCESS, 'Changing Governance Period done...', 'All good :)'))

      dispatch({
        type: ADMIN_ACTION_CHANGE_GOVERNANCE_PERIOD_RESULT,
        chosenPeriod,
      })

      dispatch(getGovernanceStorage())
    } catch (error: any) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
      dispatch({
        type: ADMIN_ACTION_CHANGE_GOVERNANCE_PERIOD_ERROR,
        error,
      })
    }
  }
