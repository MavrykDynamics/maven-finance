import { combineReducers } from 'redux'

import { delegation, DelegationState } from './delegation'
import { exitFeeModal, ExitFeeModalState } from './exitFeeModal'
import { loading, LoadingState } from './loading'
import { mvkToken, MvkTokenState } from './mvkToken'
import { progressBar, ProgressBarState } from './progressBar'
import { toaster, ToasterState } from './toaster'
import { vMvkToken, VMvkTokenState } from './vMvkToken'
import { wallet, WalletState } from './wallet'
import {routing, RoutingState} from './routing'

export const reducers = combineReducers({
  loading,
  progressBar,
  toaster,
  exitFeeModal,
  mvkToken,
  vMvkToken,
  wallet,
  delegation,
  routing
})

export interface State {
  loading: LoadingState
  progressBar: ProgressBarState
  toaster: ToasterState
  exitFeeModal: ExitFeeModalState
  mvkToken: MvkTokenState
  vMvkToken: VMvkTokenState
  wallet: WalletState
  delegation: DelegationState,
  routing: RoutingState
}
