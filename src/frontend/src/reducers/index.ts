import { combineReducers } from 'redux'

import { delegation, DelegationState } from './delegation'
import { doorman, DoormanState } from './doorman'
import { exitFeeModal, ExitFeeModalState } from './exitFeeModal'
import { loading, LoadingState } from './loading'
import { mvkToken, MvkTokenState } from './mvkToken'
import { progressBar, ProgressBarState } from './progressBar'
import { toaster, ToasterState } from './toaster'
import { wallet, WalletState } from './wallet'
import { governance, GovernanceState } from './governance'
import { emergencyGovernance, EmergencyGovernanceState } from './emergencyGovernance'
import { treasury, TreasuryState } from './treasury'
import { council, CouncilState } from './council'
import { breakGlass, BreakGlassState } from './breakGlass'
import { vesting, VestingState } from './vesting'
import { farm, FarmState } from './farm'
import { preferences, PreferencesState } from './preferences'
import { modal, ModalState } from './modal'
import { user, UserState } from './user'
import { contractAddresses, ContractAddressesState } from './contractAddresses'
import { oracles, OraclesState } from './oracles'

export const reducers = combineReducers({
  loading,
  progressBar,
  toaster,
  exitFeeModal,
  mvkToken,
  wallet,
  delegation,
  doorman,
  governance,
  emergencyGovernance,
  treasury,
  council,
  breakGlass,
  vesting,
  farm,
  preferences,
  modal,
  user,
  contractAddresses,
  oracles,
})

export interface State {
  loading: LoadingState
  progressBar: ProgressBarState
  toaster: ToasterState
  exitFeeModal: ExitFeeModalState
  mvkToken: MvkTokenState
  wallet: WalletState
  delegation: DelegationState
  doorman: DoormanState
  governance: GovernanceState
  emergencyGovernance: EmergencyGovernanceState
  treasury: TreasuryState
  council: CouncilState
  breakGlass: BreakGlassState
  vesting: VestingState
  farm: FarmState
  preferences: PreferencesState
  modal: ModalState
  user: UserState
  contractAddresses: ContractAddressesState
  oracles: OraclesState
}
