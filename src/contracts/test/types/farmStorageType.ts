import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";
import { BigNumber } from "bignumber.js";

export type farmStorageType = {
  admin: string;
  generalContracts: MichelsonMap<MichelsonMapKey, unknown>;
  whitelistContracts: MichelsonMap<MichelsonMapKey, unknown>;

  lastBlockUpdate: BigNumber;
  accumulatedMVKPerShare: BigNumber;
  claimedRewards: {
    unpaid: BigNumber;
    paid: BigNumber;
  }
  plannedRewards: {
    totalBlocks: BigNumber;
    rewardPerBlock: BigNumber;
  }
  delegators: MichelsonMap<MichelsonMapKey, unknown>;
  lpToken: {
    tokenAddress: String;
    tokenId: BigNumber;
    tokenStandard: {};
    tokenBalance: BigNumber;
  }
  open: Boolean
};
