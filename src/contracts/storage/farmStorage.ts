import { MichelsonMap } from "@taquito/michelson-encoder";
import { BigNumber } from "bignumber.js";
import { alice } from '../scripts/sandbox/accounts'
import { farmStorageType } from "../test/types/farmStorageType";

const totalBlocks = new BigNumber(720);
const rewardPerBlock = new BigNumber(500);
const plannedRewards = {
  totalBlocks: totalBlocks, // 1hour with a block_time of 5seconds
  rewardPerBlock: rewardPerBlock
}

export const farmStorage: farmStorageType = {
  admin: alice.pkh,
  generalContracts: MichelsonMap.fromLiteral({}),
  whitelistContracts: MichelsonMap.fromLiteral({}),

  lastBlockUpdate: new BigNumber(0),
  accumulatedMVKPerShare: new BigNumber(0),
  claimedRewards: {},
  plannedRewards: plannedRewards,
  delegators: MichelsonMap.fromLiteral({}),
  farmTokenBalance: new BigNumber(0),
};
