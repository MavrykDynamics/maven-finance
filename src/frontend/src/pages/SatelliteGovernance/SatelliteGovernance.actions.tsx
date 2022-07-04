import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import { getDoormanStorage, getMvkTokenStorage, getUserData } from 'pages/Doorman/Doorman.actions'
import { State } from 'reducers'

// Suspend Satellite
export const SUSPEND_SATELLITE_REQUEST = 'SUSPEND_SATELLITE_REQUEST'
export const SUSPEND_SATELLITE_RESULT = 'SUSPEND_SATELLITE_RESULT'
export const SUSPEND_SATELLITE_ERROR = 'SUSPEND_SATELLITE_ERROR'
export const suspendSatellite = (satelliteAddress: string, purpose: string) => async (dispatch: any, getState: any) => {
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
      type: SUSPEND_SATELLITE_REQUEST,
    })
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.suspendSatellite(satelliteAddress, purpose).send()
    console.log('transaction', transaction)

    dispatch(showToaster(INFO, 'Suspend Satellite...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Suspend Satellite done', 'All good :)'))

    dispatch({
      type: SUSPEND_SATELLITE_RESULT,
    })
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: SUSPEND_SATELLITE_ERROR,
      error,
    })
  }
}

// Unsuspend Satellite
export const UNSUSPEND_SATELLITE_REQUEST = 'UNSUSPEND_SATELLITE_REQUEST'
export const UNSUSPEND_SATELLITE_RESULT = 'UNSUSPEND_SATELLITE_RESULT'
export const UNSUSPEND_SATELLITE_ERROR = 'UNSUSPEND_SATELLITE_ERROR'
export const unsuspendSatellite =
  (satelliteAddress: string, purpose: string) => async (dispatch: any, getState: any) => {
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
        type: UNSUSPEND_SATELLITE_REQUEST,
      })
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
      console.log('contract', contract)
      const transaction = await contract?.methods.unsuspendSatellite(satelliteAddress, purpose).send()
      console.log('transaction', transaction)

      dispatch(showToaster(INFO, 'Unsuspend Satellite...', 'Please wait 30s'))

      const done = await transaction?.confirmation()
      console.log('done', done)
      dispatch(showToaster(SUCCESS, 'Unsuspend Satellite done', 'All good :)'))

      dispatch({
        type: UNSUSPEND_SATELLITE_RESULT,
      })
    } catch (error: any) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
      dispatch({
        type: UNSUSPEND_SATELLITE_ERROR,
        error,
      })
    }
  }

// Ban Satellite
export const BAN_SATELLITE_REQUEST = 'BAN_SATELLITE_REQUEST'
export const BAN_SATELLITE_RESULT = 'BAN_SATELLITE_RESULT'
export const BAN_SATELLITE_ERROR = 'BAN_SATELLITE_ERROR'
export const banSatellite = (satelliteAddress: string, purpose: string) => async (dispatch: any, getState: any) => {
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
      type: BAN_SATELLITE_REQUEST,
    })
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.banSatellite(satelliteAddress, purpose).send()
    console.log('transaction', transaction)

    dispatch(showToaster(INFO, 'Ban Satellite...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Ban Satellite done', 'All good :)'))

    dispatch({
      type: BAN_SATELLITE_RESULT,
    })
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: BAN_SATELLITE_ERROR,
      error,
    })
  }
}

// Unban Satellite
export const UNBAN_SATELLITE_REQUEST = 'UNBAN_SATELLITE_REQUEST'
export const UNBAN_SATELLITE_RESULT = 'UNBAN_SATELLITE_RESULT'
export const UNBAN_SATELLITE_ERROR = 'UNBAN_SATELLITE_ERROR'
export const unbanSatellite = (satelliteAddress: string, purpose: string) => async (dispatch: any, getState: any) => {
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
      type: UNBAN_SATELLITE_REQUEST,
    })
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.unbanSatellite(satelliteAddress, purpose).send()
    console.log('transaction', transaction)

    dispatch(showToaster(INFO, 'Unban Satellite...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Unban Satellite done', 'All good :)'))

    dispatch({
      type: UNBAN_SATELLITE_RESULT,
    })
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: UNBAN_SATELLITE_ERROR,
      error,
    })
  }
}

// Remove all Oracles from Satellite
export const REMOVE_ORACLES_SATELLITE_REQUEST = 'REMOVE_ORACLES_SATELLITE_REQUEST'
export const REMOVE_ORACLES_SATELLITE_RESULT = 'REMOVE_ORACLES_SATELLITE_RESULT'
export const REMOVE_ORACLES_SATELLITE_ERROR = 'REMOVE_ORACLES_SATELLITE_ERROR'
export const removeOracles = (satelliteAddress: string, purpose: string) => async (dispatch: any, getState: any) => {
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
      type: REMOVE_ORACLES_SATELLITE_REQUEST,
    })
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceSatelliteAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.removeAllSatelliteOracles(satelliteAddress, purpose).send()
    console.log('transaction', transaction)

    dispatch(showToaster(INFO, 'Remove all Oracles from Satellite...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Remove all Oracles from Satellite done', 'All good :)'))

    dispatch({
      type: REMOVE_ORACLES_SATELLITE_RESULT,
    })
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: REMOVE_ORACLES_SATELLITE_ERROR,
      error,
    })
  }
}
