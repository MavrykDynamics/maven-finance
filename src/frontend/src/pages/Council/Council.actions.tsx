import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import { State } from 'reducers'
import { fetchFromIndexerWithPromise } from '../../gql/fetchGraphQL'
import type { AppDispatch, GetState } from '../../app/App.controller'

// helpers
import { parseDate } from 'utils/time'

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
import { noralizeCouncilStorage, normalizeCouncilActions } from './Council.helpers'
import { toggleLoader } from 'app/App.components/Loader/Loader.action'
import { ROCKET_LOADER } from 'utils/constants'

const time = String(new Date())
const timeFormat = 'YYYY-MM-DD'
const timestamptz = parseDate({ time, timeFormat }) || undefined

export const GET_COUNCIL_STORAGE = 'GET_COUNCIL_STORAGE'
export const getCouncilStorage = () => async (dispatch: AppDispatch, getState: GetState) => {
  try {
    const storage = await fetchFromIndexerWithPromise(
      COUNCIL_STORAGE_QUERY,
      COUNCIL_STORAGE_QUERY_NAME,
      COUNCIL_STORAGE_QUERY_VARIABLE,
    )

    const convertedStorage = noralizeCouncilStorage(storage?.council[0])

    dispatch({
      type: GET_COUNCIL_STORAGE,
      councilStorage: convertedStorage,
    })
  } catch (error) {
    if (error instanceof Error) {
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
  }
}

export const GET_COUNCIL_PAST_ACTIONS_STORAGE = 'GET_COUNCIL_PAST_ACTIONS_STORAGE'
export const getCouncilPastActionsStorage = () => async (dispatch: AppDispatch) => {
  try {
    const storage = await fetchFromIndexerWithPromise(
      COUNCIL_PAST_ACTIONS_QUERY,
      COUNCIL_PAST_ACTIONS_NAME,
      COUNCIL_PAST_ACTIONS_VARIABLE,
    )

    dispatch({
      type: GET_COUNCIL_PAST_ACTIONS_STORAGE,
      councilPastActions: storage.council_action,
    })
  } catch (error) {
    if (error instanceof Error) {
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
  }
}

export const GET_COUNCIL_PENDING_ACTIONS_STORAGE = 'GET_COUNCIL_PENDING_ACTIONS_STORAGE'
export const getCouncilPendingActionsStorage = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()
  const { accountPkh } = state.wallet

  try {
    const storage = await fetchFromIndexerWithPromise(
      COUNCIL_PENDING_ACTIONS_QUERY,
      COUNCIL_PENDING_ACTIONS_NAME,
      COUNCIL_PENDING_ACTIONS_VARIABLE({ _gte: timestamptz }),
    )

    const councilMyPendingActions = normalizeCouncilActions(storage, { filterByAddress: accountPkh })
    const councilPendingActions = normalizeCouncilActions(storage, { filterWithoutAddress: accountPkh })

    dispatch({
      type: GET_COUNCIL_PENDING_ACTIONS_STORAGE,
      councilPendingActions,
      councilMyPendingActions,
    })
  } catch (error) {
    if (error instanceof Error) {
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
  }
}

// Sign
export const sign = (actionID: number) => async (dispatch: AppDispatch, getState: GetState) => {
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
    const transaction = await contract?.methods.signAction(actionID).send()
    await dispatch(toggleLoader(ROCKET_LOADER))

    dispatch(showToaster(INFO, 'Sign...', 'Please wait 30s'))
    await transaction?.confirmation()
    dispatch(showToaster(SUCCESS, 'Sign done', 'All good :)'))

    await dispatch(getCouncilPastActionsStorage())
    await dispatch(getCouncilPendingActionsStorage())
    await dispatch(toggleLoader())
  } catch (error) {
    if (error instanceof Error) {
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch(toggleLoader())
  }
}

// Add Vestee
export const addVestee =
  (vesteeAddress: string, totalAllocated: number, cliffInMonths: number, vestingInMonths: number) =>
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
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.councilAddress.address)
      const transaction = await contract?.methods
        .councilActionAddVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths)
        .send()
      await dispatch(toggleLoader(ROCKET_LOADER))

      dispatch(showToaster(INFO, 'Add Vestee...', 'Please wait 30s'))
      await transaction?.confirmation()
      dispatch(showToaster(SUCCESS, 'Add Vestee done', 'All good :)'))

      await dispatch(getCouncilPastActionsStorage())
      await dispatch(getCouncilPendingActionsStorage())
      await dispatch(toggleLoader())
    } catch (error) {
      if (error instanceof Error) {
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleLoader())
    }
  }

// Add member
export const addCouncilMember =
  (newMemberAddress: string, newMemberName: string, newMemberWebsite: string, newMemberImage: string) =>
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
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.councilAddress.address)
      const transaction = await contract?.methods
        .councilActionAddMember(newMemberAddress, newMemberName, newMemberWebsite, newMemberImage)
        .send()
      await dispatch(toggleLoader(ROCKET_LOADER))

      dispatch(showToaster(INFO, 'Add Council Member...', 'Please wait 30s'))
      await transaction?.confirmation()
      dispatch(showToaster(SUCCESS, 'Add Council Member done', 'All good :)'))

      await dispatch(getCouncilPastActionsStorage())
      await dispatch(getCouncilPendingActionsStorage())
      await dispatch(getCouncilStorage())
      await dispatch(toggleLoader())
    } catch (error) {
      if (error instanceof Error) {
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleLoader())
    }
  }

// Update Vestee
export const updateVestee =
  (vesteeAddress: string, totalAllocated: number, cliffInMonths: number, vestingInMonths: number) =>
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
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.councilAddress.address)
      const transaction = await contract?.methods
        .councilActionUpdateVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths)
        .send()
      await dispatch(toggleLoader(ROCKET_LOADER))

      dispatch(showToaster(INFO, 'Update Vestee...', 'Please wait 30s'))
      await transaction?.confirmation()
      dispatch(showToaster(SUCCESS, 'Update Vestee done', 'All good :)'))

      await dispatch(getCouncilPastActionsStorage())
      await dispatch(getCouncilPendingActionsStorage())
      await dispatch(toggleLoader())
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleLoader())
    }
  }

// Toggle Vestee Lock
export const toggleVesteeLock = (vesteeAddress: string) => async (dispatch: AppDispatch, getState: GetState) => {
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
    const transaction = await contract?.methods.councilActionToggleVesteeLock(vesteeAddress).send()
    await dispatch(toggleLoader(ROCKET_LOADER))

    dispatch(showToaster(INFO, 'Toggle Vestee Lock...', 'Please wait 30s'))
    await transaction?.confirmation()
    dispatch(showToaster(SUCCESS, 'Toggle Vestee Lock done', 'All good :)'))

    await dispatch(getCouncilPastActionsStorage())
    await dispatch(getCouncilPendingActionsStorage())
    await dispatch(toggleLoader())
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch(toggleLoader())
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
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.councilAddress.address)
      const transaction = await contract?.methods
        .councilActionChangeMember(
          oldCouncilMemberAddress,
          newCouncilMemberAddress,
          newMemberName,
          newMemberWebsite,
          newMemberImage,
        )
        .send()
      await dispatch(toggleLoader(ROCKET_LOADER))

      dispatch(showToaster(INFO, 'Change Council Member...', 'Please wait 30s'))
      await transaction?.confirmation()
      dispatch(showToaster(SUCCESS, 'Change Council Member done', 'All good :)'))

      await dispatch(getCouncilStorage())
      await dispatch(getCouncilPastActionsStorage())
      await dispatch(getCouncilPendingActionsStorage())
      await dispatch(toggleLoader())
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleLoader())
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
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.councilAddress.address)
    const transaction = await contract?.methods.councilActionRemoveMember(memberAddress).send()
    await dispatch(toggleLoader(ROCKET_LOADER))

    dispatch(showToaster(INFO, 'Remove Council Member...', 'Please wait 30s'))
    await transaction?.confirmation()
    dispatch(showToaster(SUCCESS, 'Remove Council Member done', 'All good :)'))

    await dispatch(getCouncilStorage())
    await dispatch(getCouncilPastActionsStorage())
    await dispatch(getCouncilPendingActionsStorage())
    await dispatch(toggleLoader())
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch(toggleLoader())
  }
}

// Update Council Member Info
export const updateCouncilMemberInfo =
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
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.councilAddress.address)
      const transaction = await contract?.methods
        .updateCouncilMemberInfo(newMemberName, newMemberWebsite, newMemberImage)
        .send()
      await dispatch(toggleLoader(ROCKET_LOADER))

      await dispatch(showToaster(INFO, 'Update Council Member Info...', 'Please wait 30s'))
      await transaction?.confirmation()
      await dispatch(showToaster(SUCCESS, 'Update Council Member Info done', 'All good :)'))

      await dispatch(getCouncilStorage())
      await dispatch(getCouncilPastActionsStorage())
      await dispatch(getCouncilPendingActionsStorage())
      await dispatch(toggleLoader())
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleLoader())
    }
  }

// Transfer Tokens
export const transferTokens =
  (
    receiverAddress: string,
    tokenContractAddress: string,
    tokenAmount: number,
    tokenType: string,
    tokenId: number,
    purpose: string,
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
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.councilAddress.address)
      const transaction = await contract?.methods
        .councilActionTransfer(receiverAddress, tokenContractAddress, tokenAmount, tokenType, tokenId, purpose)
        .send()
      await dispatch(toggleLoader(ROCKET_LOADER))

      dispatch(showToaster(INFO, 'Transfer Tokens...', 'Please wait 30s'))
      await transaction?.confirmation()
      dispatch(showToaster(SUCCESS, 'Transfer Tokens done', 'All good :)'))

      await dispatch(getCouncilStorage())
      await dispatch(getCouncilPastActionsStorage())
      await dispatch(getCouncilPendingActionsStorage())
      await dispatch(toggleLoader())
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        await dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleLoader())
    }
  }

// Request Tokens
export const requestTokens =
  (
    treasuryAddress: string,
    tokenContractAddress: string,
    tokenName: string,
    tokenAmount: number,
    tokenType: string,
    tokenId: number,
    purpose: string,
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
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.councilAddress.address)
      const transaction = await contract?.methods
        .councilActionRequestTokens(
          treasuryAddress,
          tokenContractAddress,
          tokenName,
          tokenAmount,
          tokenType,
          tokenId,
          purpose,
        )
        .send()
      await dispatch(toggleLoader(ROCKET_LOADER))

      dispatch(showToaster(INFO, 'Request Tokens...', 'Please wait 30s'))
      await transaction?.confirmation()
      dispatch(showToaster(SUCCESS, 'Request Tokens done', 'All good :)'))

      await dispatch(getCouncilStorage())
      await dispatch(getCouncilPastActionsStorage())
      await dispatch(getCouncilPendingActionsStorage())
      await dispatch(toggleLoader())
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        await dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleLoader())
    }
  }

// Request Token Mint
export const requestTokenMint =
  (treasuryAddress: string, tokenAmount: number, purpose: string) =>
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
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.councilAddress.address)
      const transaction = await contract?.methods.councilActionRequestMint(treasuryAddress, tokenAmount, purpose).send()
      await dispatch(toggleLoader(ROCKET_LOADER))

      dispatch(showToaster(INFO, 'Request Tokens...', 'Please wait 30s'))
      await transaction?.confirmation()
      dispatch(showToaster(SUCCESS, 'Request Tokens done', 'All good :)'))

      await dispatch(getCouncilStorage())
      await dispatch(getCouncilPastActionsStorage())
      await dispatch(getCouncilPendingActionsStorage())
      await dispatch(toggleLoader())
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleLoader())
    }
  }

// Drop Financial Request
export const dropFinancialRequest = (financialReqID: number) => async (dispatch: AppDispatch, getState: GetState) => {
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
    const transaction = await contract?.methods.councilActionDropFinancialReq(financialReqID).send()
    await dispatch(toggleLoader(ROCKET_LOADER))

    dispatch(showToaster(INFO, 'Drop Financial Request...', 'Please wait 30s'))
    await transaction?.confirmation()
    dispatch(showToaster(SUCCESS, 'Drop Financial Request done', 'All good :)'))

    await dispatch(getCouncilStorage())
    await dispatch(getCouncilPastActionsStorage())
    await dispatch(getCouncilPendingActionsStorage())
    await dispatch(toggleLoader())
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch(toggleLoader())
  }
}

// Remove Vestee Request
export const removeVesteeRequest = (vesteeAddress: string) => async (dispatch: AppDispatch, getState: GetState) => {
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
    const transaction = await contract?.methods.councilActionRemoveVestee(vesteeAddress).send()
    await dispatch(toggleLoader(ROCKET_LOADER))

    dispatch(showToaster(INFO, 'Remove Vestee Request...', 'Please wait 30s'))
    await transaction?.confirmation()
    dispatch(showToaster(SUCCESS, 'Remove Vestee Request done', 'All good :)'))

    await dispatch(getCouncilStorage())
    await dispatch(getCouncilPastActionsStorage())
    await dispatch(getCouncilPendingActionsStorage())
    await dispatch(toggleLoader())
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch(toggleLoader())
  }
}

// Set Baker Request
export const setBakerRequest = (bakerHash: string) => async (dispatch: AppDispatch, getState: GetState) => {
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
    const transaction = await contract?.methods.councilActionSetBaker(bakerHash).send()
    await dispatch(toggleLoader(ROCKET_LOADER))

    dispatch(showToaster(INFO, 'Set Baker Request...', 'Please wait 30s'))
    await transaction?.confirmation()
    dispatch(showToaster(SUCCESS, 'Set Baker Request done', 'All good :)'))

    await dispatch(getCouncilStorage())
    await dispatch(getCouncilPastActionsStorage())
    await dispatch(getCouncilPendingActionsStorage())
    await dispatch(toggleLoader())
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    await dispatch(toggleLoader())
  }
}

// Set Contract Baker Request
export const setContractBakerRequest =
  (targetContractAddress: string, keyHash: string) => async (dispatch: AppDispatch, getState: GetState) => {
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
      const transaction = await contract?.methods.councilActionSetContractBaker(targetContractAddress, keyHash).send()
      await dispatch(toggleLoader(ROCKET_LOADER))

      dispatch(showToaster(INFO, 'Set Contract Baker Request...', 'Please wait 30s'))
      await transaction?.confirmation()
      dispatch(showToaster(SUCCESS, 'Set Contract Baker Request done', 'All good :)'))

      await dispatch(getCouncilStorage())
      await dispatch(getCouncilPastActionsStorage())
      await dispatch(getCouncilPendingActionsStorage())
      await dispatch(toggleLoader())
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      await dispatch(toggleLoader())
    }
  }

// Drop Request
export const DROP_REQUEST = 'DROP_REQUEST'
export const DROP_RESULT = 'DROP_RESULT'
export const DROP_ERROR = 'DROP_ERROR'
export const dropRequest = (actionID: number) => async (dispatch: AppDispatch, getState: GetState) => {
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
      type: DROP_REQUEST,
    })
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.councilAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.flushAction(actionID).send()
    console.log('transaction', transaction)

    dispatch(showToaster(INFO, 'Set Contract Baker Request...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Set Contract Baker Request done', 'All good :)'))

    await dispatch(getCouncilStorage())
    await dispatch(getCouncilPastActionsStorage())
    await dispatch(getCouncilPendingActionsStorage())
    await dispatch({
      type: DROP_RESULT,
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
  }
}