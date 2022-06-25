import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import { getDoormanStorage, getMvkTokenStorage, getUserData } from 'pages/Doorman/Doorman.actions'
import { State } from 'reducers'
import { fetchFromIndexerWithPromise } from '../../gql/fetchGraphQL'
import {
  COUNCIL_PAST_ACTIONS_QUERY,
  COUNCIL_PAST_ACTIONS_NAME,
  COUNCIL_PAST_ACTIONS_VARIABLE,
  COUNCIL_PENDING_ACTIONS_QUERY,
  COUNCIL_PENDING_ACTIONS_NAME,
  COUNCIL_PENDING_ACTIONS_VARIABLE,
} from '../../gql/queries/getCouncilStorage'

export const GET_COUNCIL_PAST_ACTIONS_STORAGE = 'GET_COUNCIL_PAST_ACTIONS_STORAGE'
export const getCouncilPastActionsStorage = () => async (dispatch: any, getState: any) => {
  const state: State = getState()

  try {
    const storage = await fetchFromIndexerWithPromise(
      COUNCIL_PAST_ACTIONS_QUERY,
      COUNCIL_PAST_ACTIONS_NAME,
      COUNCIL_PAST_ACTIONS_VARIABLE,
    )

    dispatch({
      type: GET_COUNCIL_PAST_ACTIONS_STORAGE,
      councilPastActions: storage.council_action_record,
    })
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: GET_COUNCIL_PAST_ACTIONS_STORAGE,
      error,
    })
  }
}

export const GET_COUNCIL_PENDING_ACTIONS_STORAGE = 'GET_COUNCIL_PENDING_ACTIONS_STORAGE'
export const getCouncilPendingActionsStorage = () => async (dispatch: any, getState: any) => {
  const state: State = getState()

  try {
    const storage = await fetchFromIndexerWithPromise(
      COUNCIL_PENDING_ACTIONS_QUERY,
      COUNCIL_PENDING_ACTIONS_NAME,
      COUNCIL_PENDING_ACTIONS_VARIABLE,
    )

    dispatch({
      type: GET_COUNCIL_PENDING_ACTIONS_STORAGE,
      councilPendingActions: storage.council_action_record,
    })
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: GET_COUNCIL_PENDING_ACTIONS_STORAGE,
      error,
    })
  }
}

export const SIGN_REQUEST = 'SIGN_REQUEST'
export const SIGN_RESULT = 'SIGN_RESULT'
export const SIGN_ERROR = 'SIGN_ERROR'
export const sign = (actionID: number) => async (dispatch: any, getState: any) => {
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
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.councilAddress.address)
    console.log('%c ||||| actionID', 'color:yellowgreen', actionID)
    console.log('contract', contract)
    const transaction = await contract?.methods.signAction(actionID).send()
    console.log('transaction', transaction)

    dispatch(showToaster(INFO, 'Sign...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Sign done', 'All good :)'))

    dispatch({
      type: SIGN_RESULT,
    })
    dispatch(getCouncilPastActionsStorage())
    dispatch(getCouncilPendingActionsStorage())
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: SIGN_ERROR,
      error,
    })
  }
}
