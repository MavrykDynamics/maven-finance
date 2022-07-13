import { InitialOracleStorageType } from 'pages/Oracles/Oracles.types'
import { GET_ORACLES_SATELLITES, GET_ORACLES_STORAGE } from '../pages/Oracles/Oracles.actions'

export interface OraclesState {
  oraclesStorage: {
  } & InitialOracleStorageType
}

const oraclesDefaultState: OraclesState = {
  oraclesStorage: {
    feeds: [],
    feedsFactory: [],
    oraclesSatellites: [],
    totalOracleNetworks: 0,
  },
} 

export function oracles(state = oraclesDefaultState, action: any): OraclesState {
  switch (action.type) {
    case GET_ORACLES_STORAGE:
      return {
        ...state,
        oraclesStorage: {
          ...state.oraclesStorage,
          ...action.oraclesStorage,
        },
      }
      case GET_ORACLES_SATELLITES: 
      return {
        ...state,
        oraclesStorage: {
          ...state.oraclesStorage,
          oraclesSatellites: action.oracleSatellitesFull,
        },
      }
    default:
      return state
  }
}
