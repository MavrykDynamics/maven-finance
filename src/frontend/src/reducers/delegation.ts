import { GET_DELEGATION_STORAGE, DELEGATE_REQUEST, DELEGATE_RESULT, DELEGATE_ERROR } from "pages/Satellites/Satellites.actions"

export interface SatelliteRecord {
  address: string,
  name: string,
  image: string,
  description: string,
  satelliteFee: string,
  status: boolean,
  mvkBalance: string,
  totalDelegatedAmount: string,
  registeredDateTime: Date,
  unregisteredDateTime: Date | null
}
export interface DelegationStorage {
  admin: string,
  satelliteLedger: SatelliteRecord[],
  config: any,    // {"maxSatellites": "100", "delegationRatio": "10000", "minimumStakedMvkBalance": "250000000"}
  delegateLedger: any,
  breakGlassConfig: any,
  sMvkTokenAddress: string,
  vMvkTokenAddress: string,
  governanceAddress: string
}

const DELEGATE = 'DELEGATE'
const UNDELEGATE = 'UNDELEGATE'
export interface DelegationState {
  type?: typeof DELEGATE | typeof UNDELEGATE
  delegationStorage: DelegationStorage
  amount?: number;
  error?: any
}

const delegationDefaultState: DelegationState = {
    delegationStorage: {
      admin: '',
      satelliteLedger: [],
      config: {},
      delegateLedger: {},
      breakGlassConfig: {},
      sMvkTokenAddress: '',
      vMvkTokenAddress: '',
      governanceAddress: ''
    },
    amount: 0
}

export function delegation(state = delegationDefaultState, action: any): DelegationState {
  switch (action.type) {
    case GET_DELEGATION_STORAGE:
      return {
        delegationStorage: action.delegationStorage
      }
    case DELEGATE_REQUEST:
      return {
        ...state,
        type: DELEGATE,
        amount: action.amount,
        error: undefined
      }
    case DELEGATE_ERROR:
      return {
        ...state,
        type: DELEGATE,
        amount: 0,
        error: undefined
      }
    default:
      return state
  }
}
