import { InitialOracleStorageType } from 'pages/Satellites/helpers/Satellites.types'
import { GET_ORACLES_STORAGE } from 'pages/Satellites/Satellites.actions'

export interface OraclesState {
  oraclesStorage: {
  } & InitialOracleStorageType
}

const oraclesDefaultState: OraclesState = {
  oraclesStorage: {
    feeds: [],
    feedsFactory: [],
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
    default:
      return state
  }
}
