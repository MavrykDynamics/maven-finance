import { AppDispatch } from 'app/App.controller'
import { ROCKET_LOADER, WERT_IO_LOADER } from 'utils/constants'

export const TOGGLE_LOADER = 'TOGGLE_LOADER'
export const toggleLoader = (loader?: typeof ROCKET_LOADER | typeof WERT_IO_LOADER) => (dispatch: AppDispatch) => {
  dispatch({
    type: TOGGLE_LOADER,
    newLoader: loader ?? null,
  })
}
