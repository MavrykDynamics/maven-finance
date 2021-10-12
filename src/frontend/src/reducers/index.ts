import { combineReducers } from 'redux'

import { loading, LoadingState } from './loading'
import { progressBar, ProgressBarState } from './progressBar'
import { stake, StakeState } from './stake'
import { toaster, ToasterState } from './toaster'

export const reducers = combineReducers({
  loading,
  progressBar,
  stake,
  toaster,
})

export interface State {
  loading: LoadingState
  progressBar: ProgressBarState
  stake: StakeState
  toaster: ToasterState
}
