import { InitialOracleStorageType } from 'pages/Satellites/helpers/Satellites.types'
import { GET_ORACLES_STORAGE } from 'pages/Satellites/Satellites.actions'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

export interface OraclesState {
  oraclesStorage: {} & InitialOracleStorageType
}

const oraclesDefaultState: OraclesState = {
  oraclesStorage: {
    feeds: [],
    feedsFactory: [],
  },
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
    default:
      return state
  }
}
