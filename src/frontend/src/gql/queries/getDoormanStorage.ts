export const DOORMAN_STORAGE_QUERY = `
  query DoormanStorageQuery {
    doorman {
      address
      unclaimed_rewards
      min_mvk_amount
      accumulated_fees_per_share
      farm_claimed_paused
      compound_paused
      unstake_paused
      stake_paused
      stake_accounts_aggregate {
        aggregate {
          sum {
            smvk_balance
          }
        }
      }
    }
  }
`

export const DOORMAN_STORAGE_QUERY_NAME = 'DoormanStorageQuery'
export const DOORMAN_STORAGE_QUERY_VARIABLE = {}

export const STAKE_HISTORY_DATA_QUERY = `
  query GetStakingHistoryData {
    stake_history_data(where: {type: {_eq: "0"}}) {
      type
      timestamp
      final_amount
    }
  }
`

export const STAKE_HISTORY_DATA_QUERY_NAME = 'GetStakingHistoryData'
export const STAKE_HISTORY_DATA_QUERY_VARIABLE = {}

export const SMVK_HISTORY_DATA_QUERY = `
  query GetStakingHistoryData {
    smvk_history_data {
      smvk_total_supply
      timestamp
    }
  }
`
export const SMVK_HISTORY_DATA_QUERY_NAME = 'GetStakingHistoryData'
export const SMVK_HISTORY_DATA_QUERY_VARIABLE = {}
