import { GET_ORACLES_STORAGE } from '../pages/Oracles/Oracles.actions'

export type AggregatorType =  Record<string, unknown>[]

export interface OraclesState {
  oraclesStorage: {
    aggregator: AggregatorType
    aggregator_factory: Record<string, unknown>[]
    totalOracleNetworks: number
  }
}

const oraclesDefaultState: OraclesState = {
  oraclesStorage: {
    aggregator: [],
    aggregator_factory: [],
    totalOracleNetworks: 0,
  },
} 

const getTotalOracleNetworks = (aggregator: AggregatorType) =>
  aggregator.reduce((acc, cur: any) => acc + cur.oracle_records.length, 0)

export function oracles(state = oraclesDefaultState, action: any): OraclesState {
  switch (action.type) {
    case GET_ORACLES_STORAGE:
      return {
        ...state,
        oraclesStorage: {
          ...state.oraclesStorage,
          ...action.oraclesStorage,
          totalOracleNetworks: action.oraclesStorage?.aggregator ? getTotalOracleNetworks(action.oraclesStorage.aggregator) : 0,
        },
      }
    default:
      return state
  }
}
