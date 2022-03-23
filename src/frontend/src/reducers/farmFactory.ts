import { GET_FARM_FACTORY_STORAGE } from '../pages/Farms/Farms.actions'
import { FarmFactoryStorage } from '../utils/TypesAndInterfaces/FarmFactory'
import { getItemFromStorage } from '../utils/storage'

export interface FarmFactoryState {
  farmFactoryStorage: FarmFactoryStorage | any
}
const defaultFarmFactoryStorage: FarmFactoryStorage = {
  address: '',
  breakGlassConfig: {
    createFarmIsPaused: false,
    trackFarmIsPaused: false,
    untrackFarmIsPaused: false,
  },
  trackedFarms: [],
}
const farmFactoryDefaultState: FarmFactoryState = {
  farmFactoryStorage: getItemFromStorage('FarmFactoryStorage') || defaultFarmFactoryStorage,
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
