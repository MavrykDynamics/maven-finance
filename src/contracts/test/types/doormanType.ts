import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

// export type InvestTez = {
//   user: string;
//   total_supply: BigNumber;
// };

// export type DivestTez = {
//   receiver: string;
//   user: string;
//   amt: BigNumber;
//   total_supply: BigNumber;
// };

// export type BanBaker = {
//   baker: string;
//   ban_period: BigNumber;
// };

export type DoormanStorage = {
  
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
