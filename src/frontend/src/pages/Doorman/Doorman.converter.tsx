// type
import { DoormanGraphQl, MvkMintHistoryDataGraphQl, SmvkHistoryDataGraphQl } from '../../utils/TypesAndInterfaces/Doorman'
import { MvkTokenGraphQL } from '../../utils/TypesAndInterfaces/MvkToken'

// helpers
import { calcWithoutPrecision } from '../../utils/calcFunctions'
import { symbolsAfterDecimalPoint } from '../../utils/symbolsAfterDecimalPoint'

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
    address: storage?.address,
    totalSupply: storage?.total_supply ? calcWithoutPrecision(storage?.total_supply) : 0,
    maximumTotalSupply: storage?.maximum_supply ? calcWithoutPrecision(storage?.maximum_supply) : 0,
  }
}

type SmvkHistoryDataProps = {
  smvk_history_data: SmvkHistoryDataGraphQl[]
}

export function normalizeSmvkHistoryData(storage: SmvkHistoryDataProps) {
  const { smvk_history_data } = storage

  return smvk_history_data?.length
    ? smvk_history_data?.map((item) => {
        return {
          yAxis: symbolsAfterDecimalPoint(calcWithoutPrecision(item.smvk_total_supply)),
          xAxis: item.timestamp,
        }
      })
    : []
}

type MvkMintHistoryDataProps = {
  mvk_mint_history_data: MvkMintHistoryDataGraphQl[]
}

export function normalizeMvkMintHistoryData(storage: MvkMintHistoryDataProps) {
  const { mvk_mint_history_data } = storage

  return mvk_mint_history_data?.length
    ? mvk_mint_history_data?.map((item) => {
        return {
          yAxis: symbolsAfterDecimalPoint(calcWithoutPrecision(item.mvk_total_supply)),
          xAxis: item.timestamp,
        }
      })
    : []
}
