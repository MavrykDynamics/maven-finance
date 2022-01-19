import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";
import { BigNumber } from "bignumber.js";

export type farmStorageType = {
  admin: string;
  generalContracts: MichelsonMap<MichelsonMapKey, unknown>;
  whitelistContracts: MichelsonMap<MichelsonMapKey, unknown>;

  lastBlockUpdate: BigNumber;
  accumulatedMVKPerShare: BigNumber;
  claimedRewards: {}
  plannedRewards: {}
  delegators: MichelsonMap<MichelsonMapKey, unknown>;
  farmTokenBalance: BigNumber;
};
