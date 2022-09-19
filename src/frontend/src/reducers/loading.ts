import { TOGGLE_LOADER } from 'app/App.components/Loader/Loader.action'
import { ROCKET_LOADER, WERT_IO_LOADER } from 'utils/constants'

export type LoadingState = null | typeof ROCKET_LOADER | typeof WERT_IO_LOADER
const loadingInitialState: LoadingState = null

export function loading(state = loadingInitialState, action: { type: string; newLoader: LoadingState }): LoadingState {
  switch (true) {
    case TOGGLE_LOADER === action.type:
      return action.newLoader
    case /_REQUEST/.test(action.type):
      return ROCKET_LOADER
    case /_RESULT/.test(action.type):
      return null
    case /_ERROR/.test(action.type):
      return null
    default:
      return state
  }
}
