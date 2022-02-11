import { MichelsonMap } from "@taquito/michelson-encoder";
import { BigNumber } from "bignumber.js";
import { exitFeeSolutionStorageType } from "../test/types/exitFeesSolutionStorageType";

export const exitFeeSolutionStorage: exitFeeSolutionStorageType = {
  generalContracts: MichelsonMap.fromLiteral({}),
  userStakeBalanceLedger: MichelsonMap.fromLiteral({}),
  stakedMvkTotalSupply: new BigNumber(0),
  accumulatedFeesPerShare: new BigNumber(0),
  mli: new BigNumber(0)
};
