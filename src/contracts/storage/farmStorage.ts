import { MichelsonMap } from "@taquito/michelson-encoder";
import { BigNumber } from "bignumber.js";
import { bob } from '../scripts/sandbox/accounts'
import { farmStorageType } from "../test/types/farmStorageType";

const totalBlocks = new BigNumber(0);
const currentRewardPerBlock = new BigNumber(0);
const totalRewards = new BigNumber(0);
const plannedRewards = {
  totalBlocks: totalBlocks, // 1hour with a block_time of 5seconds
  currentRewardPerBlock: currentRewardPerBlock,
  totalRewards: totalRewards
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
  tokenStandard: lpTokenStandard,
  tokenBalance: new BigNumber(0)
}

export const farmStorage: farmStorageType = {
  admin: bob.pkh,
  mvkTokenAddress: "",
  
  generalContracts: MichelsonMap.fromLiteral({}),
  whitelistContracts: MichelsonMap.fromLiteral({}),

  breakGlassConfig: {
    depositIsPaused: false,
    withdrawIsPaused: false,
    claimIsPaused: false
  },

  lastBlockUpdate: new BigNumber(0),
  accumulatedMVKPerShare: new BigNumber(0),
  claimedRewards: claimedRewards,
  plannedRewards: plannedRewards,
  delegators: MichelsonMap.fromLiteral({}),
  lpToken: lpToken,
  open: false,
  init: false,
  infinite: false,
  forceRewardFromTransfer: false,
  initBlock: new BigNumber(0),
  blocksPerMinute: new BigNumber(2)
};