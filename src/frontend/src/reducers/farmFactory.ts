import { GET_FARM_FACTORY_STORAGE } from '../pages/Farms/Farms.actions'
import { FarmFactoryStorage } from '../utils/TypesAndInterfaces/FarmFactory'

export interface FarmFactoryState {
  farmFactoryStorage: FarmFactoryStorage | any
}

const farmFactoryDefaultState: FarmFactoryState = {
  farmFactoryStorage: {},
}

export function farmFactory(state = farmFactoryDefaultState, action: any): FarmFactoryState {
  switch (action.type) {
    case GET_FARM_FACTORY_STORAGE:
      return {
        farmFactoryStorage: action.farmFactoryStorage,
      }
    default:
      return state
  }
}
