import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import { State } from 'reducers'
import type { AppDispatch, GetState } from '../../app/App.controller'

export const breakGlassActions = {
  SET_ALL_CONTRACTS_ADMIN: 'SET_ALL_CONTRACTS_ADMIN',
  SET_SINGLE_CONTRACT_ADMIN: 'SET_SINGLE_CONTRACT_ADMIN',
  SIGN_ACTION: 'SIGN_ACTION',
  ADD_COUNCIL_MEMBER: 'ADD_COUNCIL_MEMBER',
  UPDATE_COUNCIL_MEMBER: 'UPDATE_COUNCIL_MEMBER',
  CHANGE_COUNCIL_MEMBER: 'CHANGE_COUNCIL_MEMBER',
  REMOVE_COUNCIL_MEMBER: 'REMOVE_COUNCIL_MEMBER',
}

// Propagate Break Glass
export const PROPOGATE_BREAK_GLASS_REQUEST = 'PROPOGATE_BREAK_GLASS_REQUEST'
export const PROPOGATE_BREAK_GLASS_RESULT = 'PROPOGATE_BREAK_GLASS_RESULT'
export const PROPOGATE_BREAK_GLASS_ERROR = 'PROPOGATE_BREAK_GLASS_ERROR'
export const propagateBreakGlass = () => async (dispatch: AppDispatch, getState: GetState) => {
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
      type: PROPOGATE_BREAK_GLASS_REQUEST,
    })
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.breakGlassAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.pauseAllEntrypoints().send()
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
      type: PROPOGATE_BREAK_GLASS_ERROR,
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
      type: PROPOGATE_BREAK_GLASS_ERROR,
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
      type: SET_ALL_CONTRACTS_ADMIN_REQUEST,
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
      type: PROPOGATE_BREAK_GLASS_ERROR,
      error,
    })
  }
}
