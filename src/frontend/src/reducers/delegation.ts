import { DELEGATE_ERROR, DELEGATE_REQUEST, DELEGATE_RESULT, GET_DELEGATION_STORAGE, UNDELEGATE_ERROR, UNDELEGATE_REQUEST, UNDELEGATE_RESULT } from "pages/Satellites/Satellites.actions"

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
export type DelegationConfig = {
  maxSatellites: string
  delegationRatio: string,
  minimumStakedMvkBalance: number
}
export interface DelegateRecord {
  satelliteAddress: string
  delegatedDateTime: Date | null
}
export type DelegationLedger = Map<string, DelegateRecord>

export interface DelegationStorage {
  admin: string,
  satelliteLedger: SatelliteRecord[],
  config: DelegationConfig,    
  delegateLedger: DelegationLedger,
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
      config: {
        maxSatellites: '1000',
        delegationRatio: '10000',
        minimumStakedMvkBalance: 10000
      },
      delegateLedger: new Map(),
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
        delegationStorage: action.delegationStorage,
      }
    case DELEGATE_REQUEST:
      return {
        ...state,
        type: DELEGATE,
        error: undefined
      }
    case DELEGATE_RESULT:
      return {
        ...state,
        type: DELEGATE,
        error: undefined
      }
    case DELEGATE_ERROR:
      return {
        ...state,
        type: DELEGATE,
        error: action.error
      }
      case UNDELEGATE_REQUEST:
      return {
        ...state,
        type: UNDELEGATE,
        error: undefined
      }
    case UNDELEGATE_RESULT:
      return {
        ...state,
        type: UNDELEGATE,
        error: undefined
      }
    case UNDELEGATE_ERROR:
      return {
        ...state,
        type: UNDELEGATE,
        error: action.error
      }
    default:
      return state
  }
}
