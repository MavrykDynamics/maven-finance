import { InitialOracleStorageType } from 'pages/Satellites/helpers/Satellites.types'
import { GET_ORACLES_STORAGE, GET_ORACLES_SATELLITES } from 'pages/Satellites/Satellites.actions'
import { SatelliteRecord } from 'utils/TypesAndInterfaces/Delegation'

export interface OraclesState {
  oraclesStorage: {
    oraclesSatellites: Array<SatelliteRecord>
  } & InitialOracleStorageType
}

const oraclesDefaultState: OraclesState = {
  oraclesStorage: {
    feeds: [],
    feedsFactory: [],
    oraclesSatellites: [],
    oraclesSatellitesIds: [],
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
