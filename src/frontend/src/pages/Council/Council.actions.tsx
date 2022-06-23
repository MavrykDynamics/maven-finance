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
