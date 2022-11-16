// types
import { FarmStorage } from '../utils/TypesAndInterfaces/Farm'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

// consts
import { GET_FARM_STORAGE, SELECT_FARM_ADDRESS } from '../pages/Farms/Farms.actions'
import { HIDE_MODAL } from '../app/App.components/Modal/Modal.actions'

export interface FarmState {
  type?: typeof HARVEST | typeof DEPOSIT | typeof WITHDRAW | undefined
  farmStorage: FarmStorage
  amount?: number
  error?: undefined
  selectedFarmAddress?: string
}
export const HARVEST = 'HARVEST',
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW'
const defaultFarmStorage: FarmStorage = []
const farmDefaultState: FarmState = {
  farmStorage: defaultFarmStorage,
  amount: 0,
  selectedFarmAddress: '',
}

export function farm(state = farmDefaultState, action: Action) {
  switch (action.type) {
    case GET_FARM_STORAGE:
      return {
        ...state,
        farmStorage: action.farmStorage,
      }
    case SELECT_FARM_ADDRESS:
      return {
        ...state,
        selectedFarmAddress: action.selectedFarmAddress,
      }
    case HIDE_MODAL:
      return {
        ...state,
        selectedFarmAddress: farmDefaultState.selectedFarmAddress,
      }
    default:
      return state
  }
}
