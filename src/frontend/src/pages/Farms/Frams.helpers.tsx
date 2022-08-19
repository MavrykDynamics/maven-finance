// types
import {
  FarmStorage,
  FarmAccountsType,
  FarmGraphQL,
} from "../../utils/TypesAndInterfaces/Farm";

// helpers
import { calcWithoutMu, calcWithoutPrecision } from "../../utils/calcFunctions";

export const normalizeFarmStorage = (farmList: FarmGraphQL[]) => {
  return farmList.map((farmItem: FarmGraphQL) => {
    return {
      address: farmItem.address,
      name: farmItem.name,
      lpTokenAddress: farmItem.lp_token_address,
      open: farmItem.open,
      withdrawPaused: farmItem.withdraw_paused,
      claimPaused: farmItem.claim_paused,
      depositPaused: farmItem.deposit_paused,
      // blocksPerMinute: farmItem.blocks_per_minute, TODO not exist in grapgQl
      blocksPerMinute: 0,
      lpTokenBalance: farmItem.lp_token_balance,
      currentRewardPerBlock: farmItem.current_reward_per_block,
      farmFactoryId: farmItem.farm_factory_id || "",
      infinite: farmItem.infinite,
      initBlock: farmItem.init_block,
      // accumulatedMvkPerShare: calcWithoutPrecision(farmItem.accumulated_mvk_per_share), TODO not exist in grapgQl
      accumulatedMvkPerShare: 0,
      lastBlockUpdate: farmItem.last_block_update,
      // lpBalance: calcWithoutPrecision(farmItem.lp_balance), TODO not exist in grapgQl
      lpBalance: 0,
      // lpToken: farmItem.lp_token, TODO not exist in grapgQl
      lpToken: "",
      // rewardPerBlock: calcWithoutPrecision(farmItem.reward_per_block), TODO not exist in grapgQl
      rewardPerBlock: 0,
      // rewardsFromTreasury: farmItem.rewards_from_treasury, TODO not exist in grapgQl
      rewardsFromTreasury: false,
      totalBlocks: farmItem.total_blocks,
      farmAccounts: farmItem.farm_accounts,
    };
  });
};

export const calculateAPR = (
  currentRewardPerBlock: number,
  lpTokenBalance: number
): string => {
  const rewardRate = currentRewardPerBlock / Math.pow(10, 9);
  const blocksPerYear = 2 * 60 * 24 * 365; // 2 blocks per minute -> 1051200 blocks per year
  const result = lpTokenBalance
    ? (((rewardRate * blocksPerYear) / lpTokenBalance) * 100).toFixed(2)
    : 0;
  return `${result}%`;
};

export const getSummDepositedAmount = (
  farmAccounts: FarmAccountsType[]
): number => {
  return farmAccounts.reduce((acc, cur) => acc + cur.deposited_amount, 0);
};

export const MOCK_FARMS = [
  {
    address: "KT1ARWfRiX3j9a9kyktNaVVMYanFhoqUh9DC",
    name: "testFarmOpen",
    lpTokenAddress: "KT1PJEXJY8C3oTt2jf3DyDBKhFv8sADgfLPi",
    open: true,
    withdrawPaused: false,
    claimPaused: false,
    depositPaused: false,
    lpTokenBalance: 0,
    currentRewardPerBlock: 10,
    farmFactoryId: "KT18cWwjTscZey2VvN6dy1h3bSTotjpUKqZq",
    infinite: false,
    initBlock: 981177,
    accumulatedMvkPerShare: 0,
    lastBlockUpdate: 981177,
    lpBalance: 0,
    rewardPerBlock: 0,
    totalBlocks: 12000,
    farmAccounts: [],
  },
  {
    address: "KT1ARWfRiX3j9a9kyktNaVVMYanFhoqUh9DC",
    name: "test Farm Open 2",
    lpTokenAddress: "KT1PJEXJY8C3oTt2jf3DyDBKhFv8sADgfLPi",
    open: true,
    withdrawPaused: false,
    claimPaused: false,
    depositPaused: false,
    lpTokenBalance: 0,
    currentRewardPerBlock: 20,
    farmFactoryId: "KT18cWwjTscZey2VvN6dy1h3bSTotjpUKqZq",
    infinite: false,
    initBlock: 981177,
    accumulatedMvkPerShare: 0,
    lastBlockUpdate: 981177,
    lpBalance: 0,
    rewardPerBlock: 0,
    totalBlocks: 12000,
    farmAccounts: [],
  },
  {
    address: "KT1ARWfRiX3j9a9kyktNaVVMYanFhoqUh9DC",
    name: "test Farm Open 3",
    lpTokenAddress: "KT1PJEXJY8C3oTt2jf3DyDBKhFv8sADgfLPi",
    open: true,
    withdrawPaused: false,
    claimPaused: false,
    depositPaused: false,
    lpTokenBalance: 0,
    currentRewardPerBlock: 30,
    farmFactoryId: "KT18cWwjTscZey2VvN6dy1h3bSTotjpUKqZq",
    infinite: false,
    initBlock: 981177,
    accumulatedMvkPerShare: 0,
    lastBlockUpdate: 981177,
    lpBalance: 0,
    rewardPerBlock: 0,
    totalBlocks: 12000,
    farmAccounts: [],
  },
  {
    address: "KT1JAgDRhRpUmisn6dU4pCUyfiQoUZc5wB74",
    name: "not open farm",
    lpTokenAddress: "KT1PJEXJY8C3oTt2jf3DyDBKhFv8sADgfLPi",
    open: false,
    withdrawPaused: false,
    claimPaused: false,
    depositPaused: false,
    lpTokenBalance: 12,
    currentRewardPerBlock: 40,
    farmFactoryId: "KT18cWwjTscZey2VvN6dy1h3bSTotjpUKqZq",
    infinite: false,
    initBlock: 981182,
    accumulatedMvkPerShare: 0,
    lastBlockUpdate: 981197,
    lpBalance: 0,
    rewardPerBlock: 0,
    totalBlocks: 12000,
    farmAccounts: [
      {
        claimed_rewards: 0,
        deposited_amount: 2,
        farm_id: "KT1JAgDRhRpUmisn6dU4pCUyfiQoUZc5wB74",
        id: 1,
        unclaimed_rewards: 0,
        user_id: "tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD",
        participation_rewards_per_share: 0,
      },
      {
        claimed_rewards: 0,
        deposited_amount: 2,
        farm_id: "KT1JAgDRhRpUmisn6dU4pCUyfiQoUZc5wB74",
        id: 1,
        unclaimed_rewards: 0,
        user_id: "tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD",
        participation_rewards_per_share: 0,
      },
    ],
  },
  {
    address: "KT1JAgDRhRpUmisn6dU4pCUyfiQoUZc5wB74",
    name: "not open farm-2",
    lpTokenAddress: "KT1PJEXJY8C3oTt2jf3DyDBKhFv8sADgfLPi",
    open: false,
    withdrawPaused: false,
    claimPaused: false,
    depositPaused: false,
    lpTokenBalance: 20,
    currentRewardPerBlock: 50,
    farmFactoryId: "KT18cWwjTscZey2VvN6dy1h3bSTotjpUKqZq",
    infinite: false,
    initBlock: 981182,
    accumulatedMvkPerShare: 0,
    lastBlockUpdate: 981197,
    lpBalance: 0,
    rewardPerBlock: 0,
    totalBlocks: 12000,
    farmAccounts: [
      {
        claimed_rewards: 0,
        deposited_amount: 15,
        farm_id: "KT1JAgDRhRpUmisn6dU4pCUyfiQoUZc5wB74",
        id: 1,
        unclaimed_rewards: 0,
        user_id: "tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD",
        participation_rewards_per_share: 0,
      },
      {
        claimed_rewards: 0,
        deposited_amount: 1,
        farm_id: "KT1JAgDRhRpUmisn6dU4pCUyfiQoUZc5wB74",
        id: 1,
        unclaimed_rewards: 0,
        user_id: "tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD",
        participation_rewards_per_share: 0,
      },
    ],
  },
] as FarmStorage;
