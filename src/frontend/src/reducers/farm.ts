import { GET_FARM_STORAGE } from '../pages/Farms/Farms.actions'
import { FarmStorage } from '../utils/TypesAndInterfaces/Farm'
import { getItemFromStorage } from '../utils/storage'

export interface FarmState {
  farmStorage: FarmStorage[] | any
}

const defaultFarmStorage: FarmStorage[] = []
const farmDefaultState: FarmState = {
  farmStorage: getItemFromStorage('FarmStorage') || defaultFarmStorage,
}

export function farm(state = farmDefaultState, action: any): FarmState {
  switch (action.type) {
    case GET_FARM_STORAGE:
      return {
        ...state,
        farmStorage: action.farmStorage,
      }
    default:
      return state
  }
}
