import { GET_CONTRACT_ADDRESSES } from '../app/App.actions'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

export interface ContractAddressesState {
  [key: string]: { address: string }
}

const contractAddressesDefaultState: ContractAddressesState = {}

export function contractAddresses(state = contractAddressesDefaultState, action: Action) {
  switch (action.type) {
    case GET_CONTRACT_ADDRESSES:
      return action.addresses
    default:
      return state
  }
}
