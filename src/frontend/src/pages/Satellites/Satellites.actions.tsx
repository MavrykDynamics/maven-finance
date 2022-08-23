import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import { getDoormanStorage, getMvkTokenStorage, getUserData } from 'pages/Doorman/Doorman.actions'
import { State } from 'reducers'
import { DELEGATION_STORAGE_QUERY, DELEGATION_STORAGE_QUERY_NAME, DELEGATION_STORAGE_QUERY_VARIABLE } from 'gql/queries'
import { fetchFromIndexerWithPromise } from '../../gql/fetchGraphQL'
import storageToTypeConverter from '../../utils/storageToTypeConverter'
import { SatelliteRecord } from 'utils/TypesAndInterfaces/Delegation'

import { normalizeDelegationStorage } from './Satellites.helpers'

export const GET_DELEGATION_STORAGE = 'GET_DELEGATION_STORAGE'
export const getDelegationStorage = () => async (dispatch: any, getState: any) => {
  try {
    const delegationStorageFromIndexer = await fetchFromIndexerWithPromise(
      DELEGATION_STORAGE_QUERY,
      DELEGATION_STORAGE_QUERY_NAME,
      DELEGATION_STORAGE_QUERY_VARIABLE,
    )

    const delegationStorage = normalizeDelegationStorage(delegationStorageFromIndexer?.delegation[0])

    console.log(delegationStorage)

    dispatch({
      type: GET_DELEGATION_STORAGE,
      delegationStorage,
    })
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: GET_DELEGATION_STORAGE,
      error,
    })
  }
}

export const DELEGATE_REQUEST = 'DELEGATE_REQUEST'
export const DELEGATE_RESULT = 'DELEGATE_RESULT'
export const DELEGATE_ERROR = 'DELEGATE_ERROR'
export const delegate = (satelliteAddress: string) => async (dispatch: any, getState: any) => {
  const state: State = getState()

  console.log('Here in delegate action')
  if (!state.wallet.ready) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (state.loading) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  if (state.user.user.myMvkTokenBalance === 0 && state.user.user.mySMvkTokenBalance === 0) {
    dispatch(showToaster(ERROR, 'Unable to Delegate', 'Please buy MVK and stake it'))
    return
  }

  if (state.user.user.mySMvkTokenBalance === 0) {
    dispatch(showToaster(ERROR, 'Unable to Delegate', 'Please stake your MVK'))
    return
  }

  try {
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.delegationAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.delegateToSatellite(state.wallet.accountPkh, satelliteAddress).send()
    console.log('transaction', transaction)

    dispatch({
      type: DELEGATE_REQUEST,
    })
    dispatch(showToaster(INFO, 'Delegating...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Delegation done', 'All good :)'))

    dispatch({
      type: DELEGATE_RESULT,
    })

    if (state.wallet.accountPkh) dispatch(getUserData(state.wallet.accountPkh))

    dispatch(getMvkTokenStorage(state.wallet.accountPkh))
    dispatch(getDelegationStorage())
    dispatch(getDoormanStorage())
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: DELEGATE_ERROR,
      error,
    })
  }
}

export const UNDELEGATE_REQUEST = 'UNSTAKE_REQUEST'
export const UNDELEGATE_RESULT = 'UNSTAKE_RESULT'
export const UNDELEGATE_ERROR = 'UNSTAKE_ERROR'
export const undelegate = () => async (dispatch: any, getState: any) => {
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
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.delegationAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.undelegateFromSatellite(state.wallet.accountPkh).send()
    console.log('transaction', transaction)

    dispatch({
      type: UNDELEGATE_REQUEST,
    })
    dispatch(showToaster(INFO, 'Undelegating...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Undelegating done', 'All good :)'))

    dispatch({
      type: UNDELEGATE_RESULT,
    })

    if (state.wallet.accountPkh) dispatch(getUserData(state.wallet.accountPkh))

    dispatch(getMvkTokenStorage(state.wallet.accountPkh))
    dispatch(getDelegationStorage())
    dispatch(getDoormanStorage())
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: UNDELEGATE_ERROR,
      error,
    })
  }
}

export const GET_ORACLES_STORAGE = 'GET_ORACLES_STORAGE'

export const REGISTER_FEED = 'REGISTER_FEED'
export const REGISTER_FEED_ERROR = 'REGISTER_FEED_ERROR'
export const registerFeedAction = () => async (dispatch: any, getState: any) => {
  const state: State = getState()

  if (!state.wallet.ready) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (state.loading) {
    dispatch(showToaster(ERROR, 'Cannot register feed', ''))
    return
  }

  try {
    // TODO: Implement this action ORACLES_SI
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: REGISTER_FEED_ERROR,
      error,
    })
  }
}
