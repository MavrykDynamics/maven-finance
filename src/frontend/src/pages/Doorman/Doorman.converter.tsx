// type
import { DoormanGraphQl } from '../../utils/TypesAndInterfaces/Doorman'
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

export function normalizeMvkToken(storage: MvkTokenGraphQL) {
  return {
    totalSupply: calcWithoutPrecision(storage?.total_supply),
    maximumTotalSupply: calcWithoutPrecision(storage?.maximum_supply),
  }
}
