import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";
import { BigNumber } from "bignumber.js";

export type exitFeeSolutionStorageType = {
  generalContracts: MichelsonMap<MichelsonMapKey, unknown>;
  userStakeBalanceLedger: MichelsonMap<MichelsonMapKey, unknown>;
  stakedMvkTotalSupply: BigNumber;
  accumulatedFeesPerShare: BigNumber;
  mli: BigNumber;
};
