import { State } from '../../reducers'
import { showToaster } from '../../app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from '../../app/App.components/Toaster/Toaster.constants'
import { getGovernanceStorage } from '../Governance/Governance.actions'
import farmFactoryAddress from '../../deployments/farmFactoryAddress.json'

import { SET_GOVERNANCE_PHASE, GET_GOVERNANCE_STORAGE } from '../Governance/Governance.actions'

export const ADMIN_ACTION_CHANGE_GOVERNANCE_PERIOD_REQUEST = 'ADMIN_ACTION_CHANGE_GOVERNANCE_PERIOD_REQUEST'
export const ADMIN_ACTION_CHANGE_GOVERNANCE_PERIOD_RESULT = 'ADMIN_ACTION_CHANGE_GOVERNANCE_PERIOD_RESULT'
export const ADMIN_ACTION_CHANGE_GOVERNANCE_PERIOD_ERROR = 'ADMIN_ACTION_CHANGE_GOVERNANCE_PERIOD_ERROR'
export const adminChangeGovernancePeriod =
  (chosenPeriod: string, accountPkh?: string) => async (dispatch: any, getState: any) => {
    const state: State = getState()

    const { governance } = state

    if (!state.wallet.ready) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }
    try {
      // const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
      // console.log('contract', contract)
      //startProposalRound
      // let transaction
      switch (chosenPeriod) {
        case 'PROPOSAL':
          //transaction = await contract?.methods.startProposalRound().send()
          dispatch({
            type: SET_GOVERNANCE_PHASE,
            phase: 'PROPOSAL',
          })
          dispatch({
            type: GET_GOVERNANCE_STORAGE,
            governanceStorage: {
              ...governance.governanceStorage,
              timelockProposalId: 0,
            },
          })
          break
        case 'VOTING':
          // transaction = await contract?.methods.startVotingRound().send()
          dispatch({
            type: SET_GOVERNANCE_PHASE,
            phase: 'VOTING',
          })
          break
        case 'TIME_LOCK':
        default:
          //transaction = await contract?.methods.StartTimelockRound().send()
          dispatch({
            type: SET_GOVERNANCE_PHASE,
            phase: 'TIME_LOCK',
          })
          break
      }
      //console.log('transaction', transaction)

      // dispatch({ type: ADMIN_ACTION_CHANGE_GOVERNANCE_PERIOD_REQUEST, chosenPeriod })

      // dispatch(showToaster(INFO, 'Changing Period...', 'Please wait 30s'))

      // const done = await transaction?.confirmation()
      // console.log('done', done)
      dispatch(showToaster(SUCCESS, 'Changing Governance Period done...', 'All good :)'))

      // dispatch({
      //   type: ADMIN_ACTION_CHANGE_GOVERNANCE_PERIOD_RESULT,
      //   chosenPeriod,
      // })

      // dispatch(getGovernanceStorage())
    } catch (error: any) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
      dispatch({
        type: ADMIN_ACTION_CHANGE_GOVERNANCE_PERIOD_ERROR,
        error,
      })
    }
  }

export const trackFarm = (accountPkh?: string) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  if (!state.wallet.ready) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }
  // TODO: Change address used to that of the Farm Factory address when possible
  try {
    const contract = await state.wallet.tezos?.wallet.at(farmFactoryAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.trackFarm('KT1GAgjxjmbGJMEWTnEJRWNFYAzyE5a2EZwy').send()
    console.log('transaction', transaction)
    dispatch(showToaster(INFO, 'Tracking Farm...', 'Please wait 30s'))
    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Tracking Farm done...', 'All good :)'))
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: ADMIN_ACTION_CHANGE_GOVERNANCE_PERIOD_ERROR,
      error,
    })
  }
}
