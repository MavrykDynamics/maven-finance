import { MichelsonMap } from "@taquito/michelson-encoder";
import { BigNumber } from "bignumber.js";
import { alice } from '../scripts/sandbox/accounts'
import { farmStorageType } from "../test/types/farmStorageType";

const totalBlocks = new BigNumber(20);
const rewardPerBlock = new BigNumber(100);
const plannedRewards = {
  totalBlocks: totalBlocks, // 1hour with a block_time of 5seconds
  rewardPerBlock: rewardPerBlock
}

const paid = new BigNumber(0);
const unpaid = new BigNumber(0);
const claimedRewards = {
  paid: paid,
  unpaid: unpaid
}

const lpTokenId = new BigNumber(0);
const lpTokenStandard = {
  fa12: ""
};
const lpToken = {
  tokenAddress: "",
  tokenId: lpTokenId,
  tokenStandard: lpTokenStandard
}

export const farmStorage: farmStorageType = {
  admin: alice.pkh,
  generalContracts: MichelsonMap.fromLiteral({}),
  whitelistContracts: MichelsonMap.fromLiteral({}),

  lastBlockUpdate: new BigNumber(0),
  accumulatedMVKPerShare: new BigNumber(0),
  claimedRewards: claimedRewards,
  plannedRewards: plannedRewards,
  delegators: MichelsonMap.fromLiteral({}),
  farmTokenBalance: new BigNumber(0),
  lpToken: lpToken
};
