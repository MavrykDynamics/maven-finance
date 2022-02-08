import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";
import { BigNumber } from "bignumber.js";

export type doormanStorageType = {
  
  admin: string;
  
  whitelistContracts: MichelsonMap<MichelsonMapKey, unknown>;
  generalContracts: MichelsonMap<MichelsonMapKey, unknown>;

  breakGlassConfig: {};
  userStakeRecordsLedger: MichelsonMap<MichelsonMapKey, unknown>;
  userStakeBalanceLedger: MichelsonMap<MichelsonMapKey, unknown>;

  tempMvkTotalSupply: BigNumber;
  stakedMvkTotalSupply: BigNumber;
  
  logExitFee: BigNumber;
  logFinalAmount: BigNumber;
};
