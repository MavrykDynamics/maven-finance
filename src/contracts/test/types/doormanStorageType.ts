import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";
import { BigNumber } from "bignumber.js";

export type doormanStorageType = {
  admin                     : string;
  mvkTokenAddress           : string;
  governanceAddress         : string;
  metadata                  : MichelsonMap<MichelsonMapKey, unknown>;

  minMvkAmount              : BigNumber;

  whitelistContracts        : MichelsonMap<MichelsonMapKey, unknown>;
  generalContracts          : MichelsonMap<MichelsonMapKey, unknown>;

  breakGlassConfig          : {};
  userStakeBalanceLedger    : MichelsonMap<MichelsonMapKey, unknown>;

  stakedMvkTotalSupply      : BigNumber;
  unclaimedRewards          : BigNumber;
  
  logExitFee                : BigNumber;
  logFinalAmount            : BigNumber;

  accumulatedFeesPerShare   : BigNumber;

  lambdaLedger              : MichelsonMap<MichelsonMapKey, unknown>;
};
