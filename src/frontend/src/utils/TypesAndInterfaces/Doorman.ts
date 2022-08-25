// type
import type { Doorman } from "../generated/graphqlTypes";

// conterters
import { normalizeDoormanStorage } from "../../pages/Doorman/Doorman.converter";

export interface UserStakeRecord {
  balance: number;
  participationFeesPerShare: number;
}

export type UserStakeBalanceLedger = Map<string, string>;

export type UserStakeRecordsLedger = Map<string, Map<number, UserStakeRecord>>;

export interface DoormanBreakGlassConfigType {
  stakeIsPaused: boolean;
  unstakeIsPaused: boolean;
  compoundIsPaused: boolean;
  farmClaimIsPaused: boolean;
}

export type DoormanStorage = ReturnType<typeof normalizeDoormanStorage>;

export type DoormanGraphQl = Omit<Doorman, "__typename">;
