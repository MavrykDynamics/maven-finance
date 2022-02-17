import { MichelsonMap } from '@taquito/taquito'
import { GET_FARM_FACTORY_STORAGE } from '../pages/Farms/Farms.actions'

export interface FarmFactoryStorage {
  admin: string
  generalContracts: MichelsonMap<string, unknown>
  whitelistContracts: MichelsonMap<string, unknown>
  breakGlassConfig: {
    createFarmIsPaused: boolean
    untrackFarmIsPaused: boolean
  }
  createdFarms: any[]
}

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
