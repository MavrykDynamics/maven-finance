import { MichelsonMap } from '@taquito/taquito'
import { GET_COUNCIL_STORAGE } from '../pages/Treasury/Treasury.actions'

export interface CouncilStorage {
  admin: string
  config: {
    actionExpiryBlockLevels: number
    actionExpiryDays: number
    threshold: number
  }
  councilMembers: string[]
  whitelistContracts: MichelsonMap<string, unknown>
  generalContracts: MichelsonMap<string, unknown>
  councilActionsLedger: MichelsonMap<number, unknown>
  thresholdSigners: number
  actionCounter: number
  tempString: string
}
export interface CouncilState {
  councilStorage: CouncilStorage | any
}

const councilDefaultState: CouncilState = {
  councilStorage: {},
}

export function council(state = councilDefaultState, action: any): CouncilState {
  switch (action.type) {
    case GET_COUNCIL_STORAGE:
      return {
        councilStorage: action.councilStorage,
      }
    default:
      return state
  }
}
