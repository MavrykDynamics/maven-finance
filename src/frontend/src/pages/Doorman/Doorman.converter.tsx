// type
import { DoormanGraphQl, StakeHistoryDataGraphQl, SmvkHistoryDataGraphQl } from '../../utils/TypesAndInterfaces/Doorman'
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
  const { stake_history_data = [] } = storage

  return stake_history_data?.length
    ? stake_history_data?.map((item) => {
        return {
          finalAmount: item.final_amount,
          timestamp: item.timestamp,
          type: item.type,
        }
      })
    : []
}

type SmvkHistoryDataProps = {
  smvk_history_data: SmvkHistoryDataGraphQl[]
}

export function normalizeSmvkHistoryData(storage: SmvkHistoryDataProps) {
  const { smvk_history_data = [] } = storage

  return smvk_history_data?.length
    ? smvk_history_data?.map((item) => {
        return {
          smvkTotalSupply: item.smvk_total_supply,
          timestamp: item.timestamp,
        }
      })
    : []
}
