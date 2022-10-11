// types
import { FarmStorage } from '../utils/TypesAndInterfaces/Farm'

import {
  DEPOSIT_ERROR,
  DEPOSIT_REQUEST,
  DEPOSIT_RESULT,
  GET_FARM_STORAGE,
  HARVEST_ERROR,
  HARVEST_REQUEST,
  HARVEST_RESULT,
  WITHDRAW_ERROR,
  WITHDRAW_REQUEST,
  WITHDRAW_RESULT,
  SELECT_FARM_ADDRESS,
} from '../pages/Farms/Farms.actions'
import { HIDE_MODAL } from '../app/App.components/Modal/Modal.actions'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

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
    case HARVEST_REQUEST:
      return {
        ...state,
        type: HARVEST,
      }
    case HARVEST_RESULT:
      return {
        ...state,
        type: HARVEST,
      }
    case HARVEST_ERROR:
      return {
        ...state,
        type: HARVEST,
        amount: 0,
        error: action.error,
      }
    case DEPOSIT_REQUEST:
      return {
        ...state,
        type: DEPOSIT,
        amount: action.amount,
      }
    case DEPOSIT_RESULT:
      return {
        ...state,
        type: DEPOSIT,
      }
    case DEPOSIT_ERROR:
      return {
        ...state,
        type: DEPOSIT,
        amount: 0,
        error: action.error,
      }
    case WITHDRAW_REQUEST:
      return {
        ...state,
        type: WITHDRAW,
        amount: action.amount,
      }
    case WITHDRAW_RESULT:
      return {
        ...state,
        type: WITHDRAW,
      }
    case WITHDRAW_ERROR:
      return {
        ...state,
        type: WITHDRAW,
        amount: 0,
        error: action.error,
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
