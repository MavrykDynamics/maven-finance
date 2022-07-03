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
