// type
import { DoormanGraphQl, StakeHistoryDataGraphQl } from '../../utils/TypesAndInterfaces/Doorman'
import { MvkTokenGraphQL } from '../../utils/TypesAndInterfaces/MvkToken'

// helpers
import { calcWithoutPrecision } from '../../utils/calcFunctions'

export function normalizeDoormanStorage(storage: DoormanGraphQl) {
  const totalStakedMvk = storage?.stake_accounts_aggregate?.aggregate?.sum?.smvk_balance ?? 0
  return {
    unclaimedRewards: calcWithoutPrecision(storage?.unclaimed_rewards ?? 0),
    minMvkAmount: calcWithoutPrecision(storage?.min_mvk_amount ?? 0),
    totalStakedMvk: calcWithoutPrecision(totalStakedMvk),
    breakGlassConfig: {
      stakeIsPaused: storage?.stake_paused,
      unstakeIsPaused: storage?.unstake_paused,
      compoundIsPaused: storage?.compound_paused,
      farmClaimIsPaused: storage?.farm_claimed_paused,
    },
    accumulatedFeesPerShare: calcWithoutPrecision(storage?.accumulated_fees_per_share),
  }
}

export function normalizeMvkToken(storage: MvkTokenGraphQL | null) {
  return {
    totalSupply: storage?.total_supply ? calcWithoutPrecision(storage?.total_supply) : 0,
    maximumTotalSupply: storage?.maximum_supply ? calcWithoutPrecision(storage?.maximum_supply) : 0,
  }
}

type StakeHistoryDataProps = {
  stake_history_data: StakeHistoryDataGraphQl[]
}

export function normalizeStakeHistoryData(storage: StakeHistoryDataProps) {
  const { stake_history_data } = storage

  return stake_history_data?.length
    ? stake_history_data?.map((item) => {
      return {
        desiredAmount: item.desired_amount,
        doorman: item.doorman,
        doormanId: item.doorman_id,
        finalAmount: item.final_amount,
        from_: item.from_,
        fromId: item.from__id,
        id: item.id,
        mvkLoyaltyIndex: item.mvk_loyalty_index,
        timestamp: item.timestamp,
        type: item.type,
      }
    })
    : []
}
