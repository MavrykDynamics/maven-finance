import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";
import { BigNumber } from "bignumber.js";

export type doormanStorageType = {
  admin: string;
  mvkTokenAddress: string;

  minMvkAmount: BigNumber;

  whitelistContracts: MichelsonMap<MichelsonMapKey, unknown>;
  generalContracts: MichelsonMap<MichelsonMapKey, unknown>;

  breakGlassConfig: {};
  userStakeBalanceLedger: MichelsonMap<MichelsonMapKey, unknown>;

  tempUnstakeAmount: BigNumber | null;
  tempClaimForceTransfer: boolean | null;
  tempClaimDelegator: string | null;
  tempClaimAmount: BigNumber | null;

  stakedMvkTotalSupply: BigNumber;
  unclaimedRewards: BigNumber;
  
  logExitFee: BigNumber;
  logFinalAmount: BigNumber;

  accumulatedFeesPerShare: BigNumber;
};
