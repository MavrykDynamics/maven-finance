import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import { State } from 'reducers'
import type { AppDispatch, GetState } from '../../app/App.controller'
import { fetchFromIndexerWithPromise } from '../../gql/fetchGraphQL'

// gql
import {
  BREAK_GLASS_COUNCIL_MEMBER_QUERY,
  BREAK_GLASS_COUNCIL_MEMBER_QUERY_NAME,
  BREAK_GLASS_COUNCIL_MEMBER_QUERY_VARIABLE,
  PAST_BREAK_GLASS_COUNCIL_ACTION_QUERY,
  PAST_BREAK_GLASS_COUNCIL_ACTION_QUERY_NAME,
  PAST_BREAK_GLASS_COUNCIL_ACTION_QUERY_VARIABLE,
  BREAK_GLASS_ACTION_PENDING_MY_SIGNATURE_QUERY,
  BREAK_GLASS_ACTION_PENDING_MY_SIGNATURE_QUERY_NAME,
  BREAK_GLASS_ACTION_PENDING_MY_SIGNATURE_QUERY_VARIABLE,
} from '../../gql/queries/getBreakGlassCouncilStorage'

// getBreakGlassActionPendingMySignature
export const GET_BREAK_GLASS_ACTION_PENDING_MY_SIGNATURE = 'GET_BREAK_GLASS_ACTION_PENDING_MY_SIGNATURE'
export const getBreakGlassActionPendingMySignature = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  try {
    const breakGlassActionPendingMySignature = await fetchFromIndexerWithPromise(
      BREAK_GLASS_ACTION_PENDING_MY_SIGNATURE_QUERY,
      BREAK_GLASS_ACTION_PENDING_MY_SIGNATURE_QUERY_NAME,
      BREAK_GLASS_ACTION_PENDING_MY_SIGNATURE_QUERY_VARIABLE,
    )

    await dispatch({
      type: GET_BREAK_GLASS_ACTION_PENDING_MY_SIGNATURE,
      breakGlassActionPendingMySignature,
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }

    dispatch({
      type: GET_BREAK_GLASS_ACTION_PENDING_MY_SIGNATURE,
      error,
    })
  }
}

// getPastBreakGlassCouncilAction
export const GET_PAST_BREAK_GLASS_COUNCIL_ACTION = 'GET_PAST_BREAK_GLASS_COUNCIL_ACTION'
export const getPastBreakGlassCouncilAction = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  try {
    const pastBreakGlassCouncilAction = await fetchFromIndexerWithPromise(
      PAST_BREAK_GLASS_COUNCIL_ACTION_QUERY,
      PAST_BREAK_GLASS_COUNCIL_ACTION_QUERY_NAME,
      PAST_BREAK_GLASS_COUNCIL_ACTION_QUERY_VARIABLE
    )

    await dispatch({
      type: GET_PAST_BREAK_GLASS_COUNCIL_ACTION,
      pastBreakGlassCouncilAction,
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }

    dispatch({
      type: GET_PAST_BREAK_GLASS_COUNCIL_ACTION,
      error,
    })
  }
}

// getBreakGlassCouncilMember
export const GET_BREAK_GLASS_COUNCIL_MEMBER = 'GET_BREAK_GLASS_COUNCIL_MEMBER'
export const getBreakGlassCouncilMember = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  try {
    const breakGlassCouncilMember = await fetchFromIndexerWithPromise(
      BREAK_GLASS_COUNCIL_MEMBER_QUERY,
      BREAK_GLASS_COUNCIL_MEMBER_QUERY_NAME,
      BREAK_GLASS_COUNCIL_MEMBER_QUERY_VARIABLE,
    )

    await dispatch({
      type: GET_BREAK_GLASS_COUNCIL_MEMBER,
      breakGlassCouncilMember,
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }

    dispatch({
      type: GET_BREAK_GLASS_COUNCIL_MEMBER,
      error,
    })
  }
}

// Set All Contracts Admin
export const SET_ALL_CONTRACTS_ADMIN_REQUEST = 'SET_ALL_CONTRACTS_ADMIN_REQUEST'
export const SET_ALL_CONTRACTS_ADMIN_RESULT = 'SET_ALL_CONTRACTS_ADMIN_RESULT'
export const SET_ALL_CONTRACTS_ADMIN_ERROR = 'SET_ALL_CONTRACTS_ADMIN_ERROR'
export const setAllContractsAdmin = (newAdminAddress: string) => async (dispatch: AppDispatch, getState: GetState) => {
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
      type: SET_ALL_CONTRACTS_ADMIN_REQUEST,
    })
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.breakGlassAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.setSingleContractAdmin(newAdminAddress).send()
    console.log('transaction', transaction)

    dispatch(showToaster(INFO, 'Propagate Break Glass...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Propagate Break Glass done', 'All good :)'))
  } catch (error) {
    if (error instanceof Error) {
      console.error('propagateBreakGlass - ERROR ', error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch({
      type: SET_ALL_CONTRACTS_ADMIN_ERROR,
      error,
    })
  }
}

// Set Single Contract Admin
export const SET_SINGLE_CONTRACT_ADMIN_REQUEST = 'SET_SINGLE_CONTRACT_ADMIN_REQUEST'
export const SET_SINGLE_CONTRACT_ADMIN_RESULT = 'SET_SINGLE_CONTRACT_ADMIN_RESULT'
export const SET_SINGLE_CONTRACT_ADMIN_ERROR = 'SET_SINGLE_CONTRACT_ADMIN_ERROR'
export const setSingleContractAdmin = (newAdminAddress: string, targetContract: string) => async (dispatch: AppDispatch, getState: GetState) => {
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
      type: SET_SINGLE_CONTRACT_ADMIN_REQUEST,
    })
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.breakGlassAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.setSingleContractAdmin(newAdminAddress, targetContract).send()
    console.log('transaction', transaction)

    dispatch(showToaster(INFO, 'Propagate Break Glass...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Propagate Break Glass done', 'All good :)'))
  } catch (error) {
    if (error instanceof Error) {
      console.error('propagateBreakGlass - ERROR ', error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch({
      type: SET_SINGLE_CONTRACT_ADMIN_ERROR,
      error,
    })
  }
}

// Sign Action
export const SIGN_ACTION_REQUEST = 'SIGN_ACTION_REQUEST'
export const SIGN_ACTION_RESULT = 'SIGN_ACTION_RESULT'
export const SIGN_ACTION_ERROR = 'SIGN_ACTION_ERROR'
export const signAction = (breakGlassActionID: string) => async (dispatch: AppDispatch, getState: GetState) => {
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
      type: SIGN_ACTION_REQUEST,
    })
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.breakGlassAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.signAction(breakGlassActionID).send()
    console.log('transaction', transaction)

    dispatch(showToaster(INFO, 'Propagate Break Glass...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Propagate Break Glass done', 'All good :)'))
  } catch (error) {
    if (error instanceof Error) {
      console.error('propagateBreakGlass - ERROR ', error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch({
      type: SIGN_ACTION_ERROR,
      error,
    })
  }
}

// Add Council Member
export const ADD_COUNCIL_MEMBER_REQUEST = 'ADD_COUNCIL_MEMBER_REQUEST'
export const ADD_COUNCIL_MEMBER_RESULT = 'ADD_COUNCIL_MEMBER_RESULT'
export const ADD_COUNCIL_MEMBER_ERROR = 'ADD_COUNCIL_MEMBER_ERROR'
export const addCouncilMember = (
  memberAddress: string,
  newMemberName: string, 
  newMemberWebsite: string,
  newMemberImage: string
) => async (dispatch: AppDispatch, getState: GetState) => {
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
      type: ADD_COUNCIL_MEMBER_REQUEST,
    })
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.breakGlassAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.addCouncilMember(
      memberAddress,
      newMemberName, 
      newMemberWebsite,
      newMemberImage,
    ).send()
    console.log('transaction', transaction)

    dispatch(showToaster(INFO, 'Propagate Break Glass...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Propagate Break Glass done', 'All good :)'))
  } catch (error) {
    if (error instanceof Error) {
      console.error('propagateBreakGlass - ERROR ', error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch({
      type: ADD_COUNCIL_MEMBER_ERROR,
      error,
    })
  }
}

// Update Council Member
export const UPDATE_COUNCIL_MEMBER_REQUEST = 'UPDATE_COUNCIL_MEMBER_REQUEST'
export const UPDATE_COUNCIL_MEMBER_RESULT = 'UPDATE_COUNCIL_MEMBER_RESULT'
export const UPDATE_COUNCIL_MEMBER_ERROR = 'UPDATE_COUNCIL_MEMBER_ERROR'
export const updateCouncilMember = (
  newMemberName: string, 
  newMemberWebsite: string,
  newMemberImage: string
) => async (dispatch: AppDispatch, getState: GetState) => {
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
      type: UPDATE_COUNCIL_MEMBER_REQUEST,
    })
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.breakGlassAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.updateCouncilMemberInfo(
      newMemberName, 
      newMemberWebsite,
      newMemberImage,
    ).send()
    console.log('transaction', transaction)

    dispatch(showToaster(INFO, 'Propagate Break Glass...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Propagate Break Glass done', 'All good :)'))
  } catch (error) {
    if (error instanceof Error) {
      console.error('propagateBreakGlass - ERROR ', error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch({
      type: UPDATE_COUNCIL_MEMBER_ERROR,
      error,
    })
  }
}

// Change Council Member
export const CHANGE_COUNCIL_MEMBER_REQUEST = 'CHANGE_COUNCIL_MEMBER_REQUEST'
export const CHANGE_COUNCIL_MEMBER_RESULT = 'CHANGE_COUNCIL_MEMBER_RESULT'
export const CHANGE_COUNCIL_MEMBER_ERROR = 'CHANGE_COUNCIL_MEMBER_ERROR'
export const changeCouncilMember = (
  oldCouncilMemberAddress: string,
  newCouncilMemberAddress: string, 
  newMemberName: string,
  newMemberWebsite: string,
  newMemberImage: string
) => async (dispatch: AppDispatch, getState: GetState) => {
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
      type: CHANGE_COUNCIL_MEMBER_REQUEST,
    })
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.breakGlassAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.changeCouncilMember(
      oldCouncilMemberAddress,
      newCouncilMemberAddress,
      newMemberName, 
      newMemberWebsite,
      newMemberImage,
    ).send()
    console.log('transaction', transaction)

    dispatch(showToaster(INFO, 'Propagate Break Glass...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Propagate Break Glass done', 'All good :)'))
  } catch (error) {
    if (error instanceof Error) {
      console.error('propagateBreakGlass - ERROR ', error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch({
      type: CHANGE_COUNCIL_MEMBER_ERROR,
      error,
    })
  }
}

// Remove Council Member
export const REMOVE_COUNCIL_MEMBER_REQUEST = 'REMOVE_COUNCIL_MEMBER_REQUEST'
export const REMOVE_COUNCIL_MEMBER_RESULT = 'REMOVE_COUNCIL_MEMBER_RESULT'
export const REMOVE_COUNCIL_MEMBER_ERROR = 'REMOVE_COUNCIL_MEMBER_ERROR'
export const removeCouncilMember = (memberAddress: string) => async (dispatch: AppDispatch, getState: GetState) => {
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
      type: REMOVE_COUNCIL_MEMBER_REQUEST,
    })
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.breakGlassAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.removeCouncilMember(memberAddress).send()
    console.log('transaction', transaction)

    dispatch(showToaster(INFO, 'Propagate Break Glass...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Propagate Break Glass done', 'All good :)'))
  } catch (error) {
    if (error instanceof Error) {
      console.error('propagateBreakGlass - ERROR ', error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch({
      type: REMOVE_COUNCIL_MEMBER_ERROR,
      error,
    })
  }
}
