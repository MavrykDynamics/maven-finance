import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import { getDoormanStorage, getMvkTokenStorage, getUserData } from 'pages/Doorman/Doorman.actions'
import { State } from 'reducers'
import { fetchFromIndexerWithPromise } from '../../gql/fetchGraphQL'
import storageToTypeConverter from '../../utils/storageToTypeConverter'
import {
  COUNCIL_PAST_ACTIONS_QUERY,
  COUNCIL_PAST_ACTIONS_NAME,
  COUNCIL_PAST_ACTIONS_VARIABLE,
  COUNCIL_PENDING_ACTIONS_QUERY,
  COUNCIL_PENDING_ACTIONS_NAME,
  COUNCIL_PENDING_ACTIONS_VARIABLE,
  COUNCIL_STORAGE_QUERY,
  COUNCIL_STORAGE_QUERY_NAME,
  COUNCIL_STORAGE_QUERY_VARIABLE,
} from '../../gql/queries/getCouncilStorage'

export const GET_COUNCIL_STORAGE = 'GET_COUNCIL_STORAGE'
export const getCouncilStorage = (accountPkh?: string) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  const storage = await fetchFromIndexerWithPromise(
    COUNCIL_STORAGE_QUERY,
    COUNCIL_STORAGE_QUERY_NAME,
    COUNCIL_STORAGE_QUERY_VARIABLE,
  )
  const convertedStorage = storageToTypeConverter('council', storage?.council[0])

  dispatch({
    type: GET_COUNCIL_STORAGE,
    councilStorage: convertedStorage,
  })
}

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

  const accountPkh = state.wallet.accountPkh

  try {
    const storage = await fetchFromIndexerWithPromise(
      COUNCIL_PENDING_ACTIONS_QUERY,
      COUNCIL_PENDING_ACTIONS_NAME,
      COUNCIL_PENDING_ACTIONS_VARIABLE,
    )
    const councilPendingActions = storage?.council_action_record?.length
      ? storage?.council_action_record.filter((item: any) => {
          const timeNow = Date.now()
          const expirationDatetime = new Date(item.expiration_datetime).getTime()
          const isEndedVotingTime = expirationDatetime > timeNow
          const isNoSameAccountPkh = accountPkh !== item.initiator_id
          return isEndedVotingTime && isNoSameAccountPkh
        })
      : []

    dispatch({
      type: GET_COUNCIL_PENDING_ACTIONS_STORAGE,
      councilPendingActions,
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

// Sign
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
    dispatch({
      type: SIGN_REQUEST,
    })
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

// Add Vestee
export const ADD_VESTEE_REQUEST = 'ADD_VESTEE_REQUEST'
export const ADD_VESTEE_RESULT = 'ADD_VESTEE_RESULT'
export const ADD_VESTEE_ERROR = 'ADD_VESTEE_ERROR'
export const addVestee =
  (vesteeAddress: string, totalAllocated: number, cliffInMonths: number, vestingInMonths: number) =>
  async (dispatch: any, getState: any) => {
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
        type: ADD_VESTEE_REQUEST,
      })
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.councilAddress.address)
      console.log('contract', contract)
      const transaction = await contract?.methods
        .councilActionAddVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths)
        .send()
      console.log('transaction', transaction)

      dispatch(showToaster(INFO, 'Add Vestee...', 'Please wait 30s'))

      const done = await transaction?.confirmation()
      console.log('done', done)
      dispatch(showToaster(SUCCESS, 'Add Vestee done', 'All good :)'))

      dispatch(getCouncilPastActionsStorage())
      dispatch(getCouncilPendingActionsStorage())
      dispatch({
        type: ADD_VESTEE_RESULT,
      })
    } catch (error: any) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
      dispatch({
        type: ADD_VESTEE_ERROR,
        error,
      })
    }
  }

// Add member
export const ADD_MEMBER_REQUEST = 'ADD_MEMBER_REQUEST'
export const ADD_MEMBER_RESULT = 'ADD_MEMBER_RESULT'
export const ADD_MEMBER_ERROR = 'ADD_MEMBER_ERROR'
export const addCouncilMember =
  (newMemberAddress: string, newMemberName: string, newMemberWebsite: string, newMemberImage: string) =>
  async (dispatch: any, getState: any) => {
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
        type: ADD_MEMBER_REQUEST,
      })
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.councilAddress.address)
      console.log('contract', contract)
      const transaction = await contract?.methods
        .councilActionAddMember(newMemberAddress, newMemberName, newMemberWebsite, newMemberImage)
        .send()
      console.log('transaction', transaction)

      dispatch(showToaster(INFO, 'Add Council Member...', 'Please wait 30s'))

      const done = await transaction?.confirmation()
      console.log('done', done)
      dispatch(showToaster(SUCCESS, 'Add Council Member done', 'All good :)'))

      dispatch(getCouncilPastActionsStorage())
      dispatch(getCouncilPendingActionsStorage())
      dispatch(getCouncilStorage())
      dispatch({
        type: ADD_MEMBER_RESULT,
      })
    } catch (error: any) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
      dispatch({
        type: ADD_MEMBER_ERROR,
        error,
      })
    }
  }

// Add Vestee
export const UPDATE_VESTEE_REQUEST = 'UPDATE_VESTEE_REQUEST'
export const UPDATE_VESTEE_RESULT = 'UPDATE_VESTEE_RESULT'
export const UPDATE_VESTEE_ERROR = 'UPDATE_VESTEE_ERROR'
export const updateVestee =
  (vesteeAddress: string, totalAllocated: number, cliffInMonths: number, vestingInMonths: number) =>
  async (dispatch: any, getState: any) => {
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
        type: UPDATE_VESTEE_REQUEST,
      })
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.councilAddress.address)
      console.log('contract', contract)
      const transaction = await contract?.methods
        .councilActionUpdateVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths)
        .send()
      console.log('transaction', transaction)

      dispatch(showToaster(INFO, 'Update Vestee...', 'Please wait 30s'))

      const done = await transaction?.confirmation()
      console.log('done', done)
      dispatch(showToaster(SUCCESS, 'Update Vestee done', 'All good :)'))

      dispatch(getCouncilPastActionsStorage())
      dispatch(getCouncilPendingActionsStorage())
      dispatch({
        type: UPDATE_VESTEE_RESULT,
      })
    } catch (error: any) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
      dispatch({
        type: UPDATE_VESTEE_ERROR,
        error,
      })
    }
  }
