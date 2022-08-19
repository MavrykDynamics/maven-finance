import {
  COMPOUND_ERROR,
  COMPOUND_REQUEST,
  COMPOUND_RESULT,
  GET_DOORMAN_STORAGE,
  STAKE_ERROR,
  STAKE_REQUEST,
  STAKE_RESULT,
  UNSTAKE_ERROR,
  UNSTAKE_REQUEST,
  UNSTAKE_RESULT,
} from "pages/Doorman/Doorman.actions";
import { getItemFromStorage } from "../utils/storage";
import { DoormanStorage } from "../utils/TypesAndInterfaces/Doorman";

export const STAKE = "STAKE";
export const UNSTAKE = "UNSTAKE";
export const COMPOUND = "COMPOUND";

export interface DoormanState {
  type?:
    | typeof STAKE
    | typeof UNSTAKE
    | typeof GET_DOORMAN_STORAGE
    | typeof COMPOUND;
  amount: number;
  error?: any;
  doormanStorage?: DoormanStorage;
  totalStakedMvk?: number;
}

const defaultStorageState: DoormanStorage = {
  minMvkAmount: 0,
  unclaimedRewards: 0,
  breakGlassConfig: {
    stakeIsPaused: false,
    unstakeIsPaused: false,
    compoundIsPaused: false,
    farmClaimIsPaused: false,
  },
  totalStakedMvk: 0,
  accumulatedFeesPerShare: 0,
};

const doormanDefaultState: DoormanState = {
  type: undefined,
  amount: 0,
  error: undefined,
  doormanStorage: getItemFromStorage("DoormanStorage") ?? defaultStorageState,
  totalStakedMvk: 0,
};

export function doorman(
  state = doormanDefaultState,
  action: any
): DoormanState {
  switch (action.type) {
    case STAKE_REQUEST:
      return {
        ...state,
        type: STAKE,
        amount: action.amount,
        error: undefined,
      };
    case STAKE_RESULT:
      return {
        ...state,
        type: STAKE,
        amount: state.amount,
        error: undefined,
      };
    case STAKE_ERROR:
      return {
        ...state,
        type: STAKE,
        amount: 0,
        error: action.error,
      };
    case UNSTAKE_REQUEST:
      return {
        ...state,
        type: UNSTAKE,
        amount: action.amount,
        error: undefined,
      };
    case UNSTAKE_RESULT:
      return {
        ...state,
        type: UNSTAKE,
        amount: state.amount,
        error: undefined,
      };
    case UNSTAKE_ERROR:
      return {
        ...state,
        type: UNSTAKE,
        amount: 0,
        error: action.error,
      };
    case COMPOUND_REQUEST:
      return {
        ...state,
        type: COMPOUND,
        error: undefined,
      };
    case COMPOUND_RESULT:
      return {
        ...state,
        type: UNSTAKE,
        error: undefined,
      };
    case COMPOUND_ERROR:
      return {
        ...state,
        type: COMPOUND,
        error: action.error,
      };
    case GET_DOORMAN_STORAGE:
      return {
        ...state,
        type: GET_DOORMAN_STORAGE,
        doormanStorage: action.storage,
        totalStakedMvk: action.totalStakedMvkSupply,
        amount: 0,
      };
    default:
      return state;
  }
}
