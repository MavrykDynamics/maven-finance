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
  BREAK_GLASS_ACTION_PENDING_SIGNATURE_QUERY,
  BREAK_GLASS_ACTION_PENDING_SIGNATURE_QUERY_NAME,
  BREAK_GLASS_ACTION_PENDING_SIGNATURE_QUERY_VARIABLE,
  MY_PAST_BREAK_GLASS_COUNCIL_ACTION_QUERY,
  MY_PAST_BREAK_GLASS_COUNCIL_ACTION_QUERY_NAME,
  MY_PAST_BREAK_GLASS_COUNCIL_ACTION_QUERY_VARIABLE,
} from '../../gql/queries/getBreakGlassCouncilStorage'

// helpers
import { normalizeBreakGlassAction, normalizeBreakGlassCouncilMember } from './BreakGlassCouncil.helpers'
import { parseDate } from 'utils/time'

// actions
import { toggleLoader } from 'app/App.components/Loader/Loader.action'

const time = String(new Date())
const timeFormat = 'YYYY-MM-DD'
const timestamptz = parseDate({ time, timeFormat }) || undefined

// getMyPastBreakGlassCouncilAction
export const GET_MY_PAST_BREAK_GLASS_COUNCIL_ACTION = 'GET_MY_PAST_BREAK_GLASS_COUNCIL_ACTION'
export const getMyPastBreakGlassCouncilAction = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()
  const { accountPkh } = state?.wallet

  try {
    const storage = accountPkh
      ? await fetchFromIndexerWithPromise(
          MY_PAST_BREAK_GLASS_COUNCIL_ACTION_QUERY,
          MY_PAST_BREAK_GLASS_COUNCIL_ACTION_QUERY_NAME,
          MY_PAST_BREAK_GLASS_COUNCIL_ACTION_QUERY_VARIABLE({ _lt: timestamptz, userAddress: accountPkh }),
        )
      : { break_glass_action: [] }

    const myPastBreakGlassCouncilAction = normalizeBreakGlassAction(storage)

    await dispatch({
      type: GET_MY_PAST_BREAK_GLASS_COUNCIL_ACTION,
      myPastBreakGlassCouncilAction,
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
  }
}

// getBreakGlassActionPendingSignature
export const GET_BREAK_GLASS_ACTION_PENDING_SIGNATURE = 'GET_BREAK_GLASS_ACTION_PENDING_SIGNATURE'
export const getBreakGlassActionPendingSignature = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()
  const { accountPkh } = state?.wallet

  try {
    const storage = await fetchFromIndexerWithPromise(
      BREAK_GLASS_ACTION_PENDING_SIGNATURE_QUERY,
      BREAK_GLASS_ACTION_PENDING_SIGNATURE_QUERY_NAME,
      BREAK_GLASS_ACTION_PENDING_SIGNATURE_QUERY_VARIABLE({ _gte: timestamptz }),
    )

    const breakGlassActionPendingAllSignature = normalizeBreakGlassAction(storage)
    const breakGlassActionPendingSignature = normalizeBreakGlassAction(storage, { filterWithoutAddress: accountPkh })
    const breakGlassActionPendingMySignature = normalizeBreakGlassAction(storage, { filterByAddress: accountPkh })

    await dispatch({
      type: GET_BREAK_GLASS_ACTION_PENDING_SIGNATURE,
      breakGlassActionPendingAllSignature,
      breakGlassActionPendingSignature,
      breakGlassActionPendingMySignature,
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
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
      PAST_BREAK_GLASS_COUNCIL_ACTION_QUERY_VARIABLE({ _lt: timestamptz }),
    )

    await dispatch({
      type: GET_PAST_BREAK_GLASS_COUNCIL_ACTION,
      pastBreakGlassCouncilAction: normalizeBreakGlassAction(pastBreakGlassCouncilAction),
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
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
      breakGlassCouncilMember: normalizeBreakGlassCouncilMember(breakGlassCouncilMember),
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
  }
}

// Set All Contracts Admin
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
    dispatch(toggleLoader('rocket'))
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.breakGlassAddress.address)
    const transaction = await contract?.methods.setSingleContractAdmin(newAdminAddress).send()
    dispatch(showToaster(INFO, 'Propagate Break Glass...', 'Please wait 30s'))

    await transaction?.confirmation()
    dispatch(showToaster(SUCCESS, 'Propagate Break Glass done', 'All good :)'))
    dispatch(toggleLoader())
  } catch (error) {
    if (error instanceof Error) {
      console.error('propagateBreakGlass - ERROR ', error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch(toggleLoader())
  }
}

// Set Single Contract Admin
export const setSingleContractAdmin =
  (newAdminAddress: string, targetContract: string) => async (dispatch: AppDispatch, getState: GetState) => {
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
      dispatch(toggleLoader('rocket'))
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.breakGlassAddress.address)
      const transaction = await contract?.methods.setSingleContractAdmin(newAdminAddress, targetContract).send()
      dispatch(showToaster(INFO, 'Propagate Break Glass...', 'Please wait 30s'))

      await transaction?.confirmation()
      dispatch(showToaster(SUCCESS, 'Propagate Break Glass done', 'All good :)'))
      dispatch(toggleLoader())
    } catch (error) {
      if (error instanceof Error) {
        console.error('propagateBreakGlass - ERROR ', error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      dispatch(toggleLoader())
    }
  }

// Sign Action
export const signAction = (breakGlassActionID: number) => async (dispatch: AppDispatch, getState: GetState) => {
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
    dispatch(toggleLoader('rocket'))
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.breakGlassAddress.address)
    const transaction = await contract?.methods.signAction(breakGlassActionID).send()
    dispatch(showToaster(INFO, 'Propagate Break Glass...', 'Please wait 30s'))

    await transaction?.confirmation()
    dispatch(showToaster(SUCCESS, 'Propagate Break Glass done', 'All good :)'))
    dispatch(toggleLoader())
  } catch (error) {
    if (error instanceof Error) {
      console.error('propagateBreakGlass - ERROR ', error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch(toggleLoader())
  }
}

// Add Council Member
export const addCouncilMember =
  (memberAddress: string, newMemberName: string, newMemberWebsite: string, newMemberImage: string) =>
  async (dispatch: AppDispatch, getState: GetState) => {
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
      dispatch(toggleLoader('rocket'))
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.breakGlassAddress.address)
      const transaction = await contract?.methods
        .addCouncilMember(memberAddress, newMemberName, newMemberWebsite, newMemberImage)
        .send()
      dispatch(showToaster(INFO, 'Propagate Break Glass...', 'Please wait 30s'))

      await transaction?.confirmation()
      dispatch(showToaster(SUCCESS, 'Propagate Break Glass done', 'All good :)'))
      dispatch(toggleLoader())
    } catch (error) {
      if (error instanceof Error) {
        console.error('propagateBreakGlass - ERROR ', error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      dispatch(toggleLoader())
    }
  }

// Update Council Member
export const updateCouncilMember =
  (newMemberName: string, newMemberWebsite: string, newMemberImage: string) =>
  async (dispatch: AppDispatch, getState: GetState) => {
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
      dispatch(toggleLoader('rocket'))
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.breakGlassAddress.address)
      const transaction = await contract?.methods
        .updateCouncilMemberInfo(newMemberName, newMemberWebsite, newMemberImage)
        .send()
      dispatch(showToaster(INFO, 'Propagate Break Glass...', 'Please wait 30s'))

      await transaction?.confirmation()
      dispatch(showToaster(SUCCESS, 'Propagate Break Glass done', 'All good :)'))
      dispatch(toggleLoader())
    } catch (error) {
      if (error instanceof Error) {
        console.error('propagateBreakGlass - ERROR ', error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      dispatch(toggleLoader())
    }
  }

// Change Council Member
export const changeCouncilMember =
  (
    oldCouncilMemberAddress: string,
    newCouncilMemberAddress: string,
    newMemberName: string,
    newMemberWebsite: string,
    newMemberImage: string,
  ) =>
  async (dispatch: AppDispatch, getState: GetState) => {
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
      dispatch(toggleLoader('rocket'))
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.breakGlassAddress.address)
      const transaction = await contract?.methods
        .changeCouncilMember(
          oldCouncilMemberAddress,
          newCouncilMemberAddress,
          newMemberName,
          newMemberWebsite,
          newMemberImage,
        )
        .send()
      dispatch(showToaster(INFO, 'Propagate Break Glass...', 'Please wait 30s'))

      await transaction?.confirmation()
      dispatch(showToaster(SUCCESS, 'Propagate Break Glass done', 'All good :)'))
      dispatch(toggleLoader())
    } catch (error) {
      if (error instanceof Error) {
        console.error('propagateBreakGlass - ERROR ', error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      dispatch(toggleLoader())
    }
  }

// Remove Council Member
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
    dispatch(toggleLoader('rocket'))
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.breakGlassAddress.address)
    const transaction = await contract?.methods.removeCouncilMember(memberAddress).send()
    dispatch(showToaster(INFO, 'Propagate Break Glass...', 'Please wait 30s'))

    await transaction?.confirmation()
    dispatch(showToaster(SUCCESS, 'Propagate Break Glass done', 'All good :)'))
    dispatch(toggleLoader())
  } catch (error) {
    if (error instanceof Error) {
      console.error('propagateBreakGlass - ERROR ', error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch(toggleLoader())
  }
}

// Propagate Break Glass
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
    dispatch(toggleLoader('rocket'))
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.breakGlassAddress.address)
    const transaction = await contract?.methods.propagateBreakGlass().send()
     dispatch(showToaster(INFO, 'Propagate Break Glass...', 'Please wait 30s'))

    await transaction?.confirmation()
    dispatch(showToaster(SUCCESS, 'Propagate Break Glass done', 'All good :)'))
    dispatch(toggleLoader())
  } catch (error) {
    if (error instanceof Error) {
      console.error('propagateBreakGlass - ERROR ', error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch(toggleLoader())
  }
}

// Drop Action
export const dropBreakGlass = (breakGlassActionID: number) => async (dispatch: AppDispatch, getState: GetState) => {
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
    dispatch(toggleLoader('rocket'))
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.breakGlassAddress.address)
    const transaction = await contract?.methods.flushAction(breakGlassActionID).send()
    dispatch(showToaster(INFO, 'Propagate Break Glass...', 'Please wait 30s'))

    await transaction?.confirmation()
    dispatch(showToaster(SUCCESS, 'Propagate Break Glass done', 'All good :)'))
    dispatch(toggleLoader())
  } catch (error) {
    if (error instanceof Error) {
      console.error('dropBreakGlass - ERROR ', error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch(toggleLoader())
  }
}

