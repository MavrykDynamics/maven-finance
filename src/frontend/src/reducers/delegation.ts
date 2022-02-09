import {
  DELEGATE_ERROR,
  DELEGATE_REQUEST,
  DELEGATE_RESULT,
  GET_DELEGATION_STORAGE,
  UNDELEGATE_ERROR,
  UNDELEGATE_REQUEST,
  UNDELEGATE_RESULT,
} from 'pages/Satellites/Satellites.actions'
import {
  REGISTER_AS_SATELLITE_ERROR,
  REGISTER_AS_SATELLITE_REQUEST,
  REGISTER_AS_SATELLITE_RESULT,
  UNREGISTER_AS_SATELLITE_ERROR,
  UNREGISTER_AS_SATELLITE_REQUEST,
  UNREGISTER_AS_SATELLITE_RESULT,
  UPDATE_AS_SATELLITE_ERROR,
  UPDATE_AS_SATELLITE_REQUEST,
  UPDATE_AS_SATELLITE_RESULT,
} from '../pages/BecomeSatellite/BecomeSatellite.actions'

export interface SatelliteRecord {
  address: string
  name: string
  image: string
  description: string
  satelliteFee: string
  status: boolean
  mvkBalance: string
  totalDelegatedAmount: string
  registeredDateTime: Date
  unregisteredDateTime: Date | null
}
export type DelegationConfig = {
  maxSatellites: string
  delegationRatio: string
  minimumStakedMvkBalance: number
}
export interface DelegateRecord {
  satelliteAddress: string
  delegatedDateTime: Date | null
}
export type DelegationLedger = Map<string, DelegateRecord>

export interface DelegationStorage {
  admin: string
  satelliteLedger: SatelliteRecord[]
  config: DelegationConfig
  delegateLedger: DelegationLedger
  breakGlassConfig: any
  sMvkTokenAddress: string
  vMvkTokenAddress: string
  governanceAddress: string
}

const DELEGATE = 'DELEGATE'
const UNDELEGATE = 'UNDELEGATE'
const SATELLITE_ACTION = 'SATELLITE_ACTION'
export interface DelegationState {
  type?: typeof DELEGATE | typeof UNDELEGATE | typeof SATELLITE_ACTION
  delegationStorage: DelegationStorage
  amount?: number
  error?: any
}

const delegationDefaultState: DelegationState = {
  delegationStorage: {
    admin: '',
    satelliteLedger: [],
    config: {
      maxSatellites: '1000',
      delegationRatio: '10000',
      minimumStakedMvkBalance: 10000,
    },
    delegateLedger: new Map(),
    breakGlassConfig: {},
    sMvkTokenAddress: '',
    vMvkTokenAddress: '',
    governanceAddress: '',
  },
  amount: 0,
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
        error: undefined,
      }
    case DELEGATE_RESULT:
      return {
        ...state,
        type: DELEGATE,
        error: undefined,
      }
    case DELEGATE_ERROR:
      return {
        ...state,
        type: DELEGATE,
        error: action.error,
      }
    case UNDELEGATE_REQUEST:
      return {
        ...state,
        type: UNDELEGATE,
        error: undefined,
      }
    case UNDELEGATE_RESULT:
      return {
        ...state,
        type: UNDELEGATE,
        error: undefined,
      }
    case UNDELEGATE_ERROR:
      return {
        ...state,
        type: UNDELEGATE,
        error: action.error,
      }
    case REGISTER_AS_SATELLITE_REQUEST:
      return {
        ...state,
        type: SATELLITE_ACTION,
        error: undefined,
      }
    case REGISTER_AS_SATELLITE_RESULT:
      return {
        ...state,
        type: SATELLITE_ACTION,
        error: undefined,
      }
    case REGISTER_AS_SATELLITE_ERROR:
      return {
        ...state,
        type: SATELLITE_ACTION,
        error: action.error,
      }
    case UPDATE_AS_SATELLITE_REQUEST:
      return {
        ...state,
        type: SATELLITE_ACTION,
        error: undefined,
      }
    case UPDATE_AS_SATELLITE_RESULT:
      return {
        ...state,
        type: SATELLITE_ACTION,
        error: undefined,
      }
    case UPDATE_AS_SATELLITE_ERROR:
      return {
        ...state,
        type: SATELLITE_ACTION,
        error: action.error,
      }
    case UNREGISTER_AS_SATELLITE_REQUEST:
      return {
        ...state,
        type: SATELLITE_ACTION,
        error: undefined,
      }
    case UNREGISTER_AS_SATELLITE_RESULT:
      return {
        ...state,
        type: SATELLITE_ACTION,
        error: undefined,
      }
    case UNREGISTER_AS_SATELLITE_ERROR:
      return {
        ...state,
        type: SATELLITE_ACTION,
        error: action.error,
      }
    default:
      return state
  }
}
