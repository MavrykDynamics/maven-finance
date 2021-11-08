import { combineReducers } from 'redux'

import { exitFeeModal, ExitFeeModalState } from './exitFeeModal'
import { loading, LoadingState } from './loading'
import { progressBar, ProgressBarState } from './progressBar'
import { stake, StakeState } from './stake'
import { toaster, ToasterState } from './toaster'

export const reducers = combineReducers({
  loading,
  progressBar,
  stake,
  toaster,
  exitFeeModal,
})

export interface State {
  loading: LoadingState
  progressBar: ProgressBarState
  stake: StakeState
  toaster: ToasterState
  exitFeeModal: ExitFeeModalState
}
