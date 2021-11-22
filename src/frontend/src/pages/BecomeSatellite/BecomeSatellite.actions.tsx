import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import doormanAddress from 'deployments/doormanAddress'
import { State } from 'reducers'

export type RegisterAsSatelliteForm = { name: string; description: string; fee: number; image: string | undefined }

export const REGISTER_AS_SATELLITE_REQUEST = 'REGISTER_AS_SATELLITE_REQUEST'
export const REGISTER_AS_SATELLITE_RESULT = 'REGISTER_AS_SATELLITE_RESULT'
export const REGISTER_AS_SATELLITE_ERROR = 'REGISTER_AS_SATELLITE_ERROR'
export const registerAsSatellite = (form: RegisterAsSatelliteForm) => async (dispatch: any, getState: any) => {
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
    const contract = await state.wallet.tezos?.wallet.at(doormanAddress)
    console.log('contract', contract)
    const transaction = await contract?.methods
      .registerAsSatellite(form.name, form.description, form.image, form.fee)
      .send()
    console.log('transaction', transaction)

    dispatch({
      type: REGISTER_AS_SATELLITE_REQUEST,
      form,
    })
    dispatch(showToaster(INFO, 'Staking...', 'Please wait 30s'))

    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Staking done', 'All good :)'))

    dispatch({
      type: REGISTER_AS_SATELLITE_RESULT,
    })
  } catch (error: any) {
    console.error(error)
    dispatch(showToaster(ERROR, 'Error', error.message))
    dispatch({
      type: REGISTER_AS_SATELLITE_ERROR,
      error,
    })
  }
}
