import { InitialOracleStorageType, DataFeedsHistory, DataFeedsVolatility } from 'pages/Satellites/helpers/Satellites.types'
import { GET_ORACLES_STORAGE, GET_DATA_FEEDS_HISTORY } from 'pages/Satellites/Satellites.actions'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

export interface OraclesState {
  oraclesStorage: {} & InitialOracleStorageType
  dataFeedsHistory: DataFeedsHistory
  dataFeedsVolatility: DataFeedsVolatility
}

const oraclesDefaultState: OraclesState = {
  oraclesStorage: {
    feeds: [],
    feedsFactory: [],
  },
  dataFeedsHistory: [],
  dataFeedsVolatility: [],
}

export function oracles(state = oraclesDefaultState, action: Action) {
  switch (action.type) {
    case GET_ORACLES_STORAGE:
      return {
        ...state,
        oraclesStorage: {
          ...state.oraclesStorage,
          ...(action.oraclesStorage as object),
        },
      }
    case GET_DATA_FEEDS_HISTORY:
      return {
        ...state,
        dataFeedsHistory: action.dataFeedsHistory,
        dataFeedsVolatility: action.dataFeedsVolatility,
      }
    default:
      return state
  }
}
