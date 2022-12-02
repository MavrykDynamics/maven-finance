import { TOGGLE_LOADER, TOGGLE_DATA_LOADER } from 'app/App.components/Loader/Loader.action'
import { ROCKET_LOADER, WERT_IO_LOADER } from 'utils/constants'

export type LoadingState = {
  viewLoading: null | typeof ROCKET_LOADER | typeof WERT_IO_LOADER
  isInitialDataloading: boolean
  isLoading: boolean
}
const loadingInitialState: LoadingState = {
  viewLoading: null,
  isInitialDataloading: true,
  isLoading: true,
}

export function loading(
  state = loadingInitialState,
  action: { type: string; newLoader: LoadingState['viewLoading']; dataLoadingState: boolean },
): LoadingState {
  switch (true) {
    case TOGGLE_LOADER === action.type:
      return {
        ...state,
        viewLoading: action.newLoader,
        isLoading: Boolean(action.newLoader) || state.isInitialDataloading,
      }
    case TOGGLE_DATA_LOADER === action.type:
      return {
        ...state,
        isInitialDataloading: action.dataLoadingState,
        isLoading: action.dataLoadingState || Boolean(state.viewLoading),
      }
    case /_REQUEST/.test(action.type):
      return { ...state, viewLoading: ROCKET_LOADER }
    case /_RESULT/.test(action.type):
      return { ...state, viewLoading: null }
    case /_ERROR/.test(action.type):
      return { ...state, viewLoading: null }

    default:
      return state
  }
}
