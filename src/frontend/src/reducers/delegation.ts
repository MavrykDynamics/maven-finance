import { MichelsonMap } from "@taquito/taquito";
import {
  DELEGATE_ERROR,
  DELEGATE_REQUEST,
  DELEGATE_RESULT,
  GET_DELEGATION_STORAGE,
  REGISTER_FEED,
  REGISTER_FEED_ERROR,
  UNDELEGATE_ERROR,
  UNDELEGATE_REQUEST,
  UNDELEGATE_RESULT,
} from "pages/Satellites/Satellites.actions";
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
} from "../pages/BecomeSatellite/BecomeSatellite.actions";
import { GET_SATELLITE_BY_ADDRESS } from "../pages/SatelliteDetails/SatelliteDetails.actions";
import { getItemFromStorage } from "../utils/storage";
import {
  DelegateRecord,
  DelegationStorage,
  ParticipationMetrics,
  SatelliteRecord,
  SatelliteStatus,
} from "../utils/TypesAndInterfaces/Delegation";

export const DELEGATE = "DELEGATE";
export const UNDELEGATE = "UNDELEGATE";
export const SATELLITE_ACTION = "SATELLITE_ACTION";

export interface DelegationState {
  type?: typeof DELEGATE | typeof UNDELEGATE | typeof SATELLITE_ACTION;
  delegationStorage: DelegationStorage;
  amount?: number;
  error?: any;
  currentSatellite: SatelliteRecord;
  participationMetrics: ParticipationMetrics;
}

const defaultDelegationStorage: DelegationStorage = {
  satelliteLedger: [],
  config: {
    maxSatellites: 1000,
    delegationRatio: 10000,
    minimumStakedMvkBalance: 10000,
    satelliteNameMaxLength: 400,
    satelliteDescriptionMaxLength: 400,
    satelliteImageMaxLength: 400,
    satelliteWebsiteMaxLength: 400,
  },
  delegateLedger: new MichelsonMap<string, DelegateRecord>(),
  breakGlassConfig: {
    delegateToSatelliteIsPaused: false,
    undelegateFromSatelliteIsPaused: false,
    registerAsSatelliteIsPaused: false,
    unregisterAsSatelliteIsPaused: false,
    updateSatelliteRecordIsPaused: false,
    distributeRewardPaused: false,
  },
  numberActiveSatellites: 0,
  totalDelegatedMVK: 0,
};
const delegationDefaultState: DelegationState = {
  delegationStorage: defaultDelegationStorage,
  amount: 0,
  currentSatellite: {
    status: SatelliteStatus.INACTIVE,
    address: "",
    description: "",
    website: "",
    participation: 0,
    image: "",
    mvkBalance: 0,
    name: "",
    sMvkBalance: 0,
    delegatorCount: 0,
    satelliteFee: 0,
    totalDelegatedAmount: 0,
    unregisteredDateTime: new Date(),
    oracleRecords: [],
  },
  participationMetrics: {
    pollParticipation: 0,
    proposalParticipation: 0,
    communication: 0,
  },
};

export function delegation(
  state = delegationDefaultState,
  action: any
): DelegationState {
  switch (action.type) {
    case GET_DELEGATION_STORAGE:
      return {
        ...state,
        delegationStorage: action.delegationStorage,
      };
    case DELEGATE_REQUEST:
      return {
        ...state,
        type: DELEGATE,
        error: undefined,
      };
    case DELEGATE_RESULT:
      return {
        ...state,
        type: DELEGATE,
        error: undefined,
      };
    case DELEGATE_ERROR:
      return {
        ...state,
        type: DELEGATE,
        error: action.error,
      };
    case UNDELEGATE_REQUEST:
      return {
        ...state,
        type: UNDELEGATE,
        error: undefined,
      };
    case UNDELEGATE_RESULT:
      return {
        ...state,
        type: UNDELEGATE,
        error: undefined,
      };
    case UNDELEGATE_ERROR:
      return {
        ...state,
        type: UNDELEGATE,
        error: action.error,
      };
    case REGISTER_AS_SATELLITE_REQUEST:
      return {
        ...state,
        type: SATELLITE_ACTION,
        error: undefined,
      };
    case REGISTER_AS_SATELLITE_RESULT:
      return {
        ...state,
        type: SATELLITE_ACTION,
        error: undefined,
      };
    case REGISTER_AS_SATELLITE_ERROR:
      return {
        ...state,
        type: SATELLITE_ACTION,
        error: action.error,
      };
    case UPDATE_AS_SATELLITE_REQUEST:
      return {
        ...state,
        type: SATELLITE_ACTION,
        error: undefined,
      };
    case UPDATE_AS_SATELLITE_RESULT:
      return {
        ...state,
        type: SATELLITE_ACTION,
        error: undefined,
      };
    case UPDATE_AS_SATELLITE_ERROR:
      return {
        ...state,
        type: SATELLITE_ACTION,
        error: action.error,
      };
    case UNREGISTER_AS_SATELLITE_REQUEST:
      return {
        ...state,
        type: SATELLITE_ACTION,
        error: undefined,
      };
    case UNREGISTER_AS_SATELLITE_RESULT:
      return {
        ...state,
        type: SATELLITE_ACTION,
        error: undefined,
      };
    case UNREGISTER_AS_SATELLITE_ERROR:
      return {
        ...state,
        type: SATELLITE_ACTION,
        error: action.error,
      };
    case GET_SATELLITE_BY_ADDRESS:
      return {
        ...state,
        type: SATELLITE_ACTION,
        currentSatellite: action.currentSatellite,
      };
    case REGISTER_FEED:
      // TODO: implement state change after success action ORACLES_SI
      return {
        ...state,
        error: undefined,
      };
    case REGISTER_FEED_ERROR:
      // TODO: implement state change after unsuccess action ORACLES_SI
      return {
        ...state,
        error: action.error,
      };
    default:
      return state;
  }
}
