// type
import { DoormanStorage, DoormanGraphQl } from '../../utils/TypesAndInterfaces/Doorman'

// helpers
import { calcWithoutPrecision } from '../../utils/calcFunctions'

export function normalizeDoormanStorage(storage: DoormanGraphQl): DoormanStorage {
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