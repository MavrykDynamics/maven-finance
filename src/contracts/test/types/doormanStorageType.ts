import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

export type doormanStorageType = {
  
  admin: string;

  breakGlassConfig: {};
  userStakeRecordsLedger: MichelsonMap<MichelsonMapKey, unknown>;
  userStakeBalanceLedger: MichelsonMap<MichelsonMapKey, unknown>;

  delegationAddress: string;
  exitFeePoolAddress: string; 
  mvkTokenAddress: string;

  tempMvkTotalSupply: BigNumber;
  tempVMvkTotalSupply: BigNumber;

  stakedMvkTotalSupply: BigNumber;
  logExitFee: BigNumber;
  logFinalAmount: BigNumber;
};
