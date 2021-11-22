export type LoadingState = boolean

const loadingInitialState: LoadingState =  false

export function loading(state = loadingInitialState, action: any): LoadingState {
  switch (true) {
    case /_REQUEST/.test(action.type): {
      return true
    }
    case /_RESULT/.test(action.type): {
      return false
    }
    case /_ERROR/.test(action.type): {
      return false
    }
    default:
      return state
  }
}
