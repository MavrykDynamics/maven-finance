import { combineReducers } from 'redux'

import { exitFeeModal, ExitFeeModalState } from './exitFeeModal'
import { loading, LoadingState } from './loading'
import { mvkToken, MvkTokenState } from './mvkToken'
import { progressBar, ProgressBarState } from './progressBar'
import { toaster, ToasterState } from './toaster'
import { wallet, WalletState } from './wallet'

export const reducers = combineReducers({
  loading,
  progressBar,
  toaster,
  exitFeeModal,
  mvkToken,
  wallet
})

export interface State {
  loading: LoadingState
  progressBar: ProgressBarState
  toaster: ToasterState
  exitFeeModal: ExitFeeModalState
  mvkToken: MvkTokenState
  wallet: WalletState
}
