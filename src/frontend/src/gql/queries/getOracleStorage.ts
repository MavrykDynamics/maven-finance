export const ORACLE_STORAGE_QUERY = `
  query GetOracleDataFeeds {
    aggregator(where: {creation_timestamp: {_is_null: false}}) {
      address
      admin
      aggregator_factory_id
      creation_timestamp
      decimals
      deviation_reward_amount_smvk
      deviation_reward_amount_xtz
      governance_id
      last_completed_round
      last_completed_round_price
      last_completed_round_price_timestamp
      name
      maintainer_id
      token_1_symbol
      token_0_symbol
      round_start_timestamp
      round
      reward_amount_xtz
      reward_amount_smvk
      per_thousand_deviation_trigger
      last_completed_round_pct_oracle_response
      percent_oracle_threshold
      oracle_rewards_xtz {
        oracle_id
        xtz
        id
        aggregator_id
      }
      oracle_rewards_smvk {
        smvk
        oracle_id
        id
        aggregator_id
      }
      oracle_records {
        active
        aggregator_id
        id
        oracle_id
      }
    }
    aggregator_factory {
      address
      admin
      create_aggregator_paused
      distribute_reward_smvk_paused
      distribute_reward_xtz_paused
      governance_id
      track_aggregator_paused
      untrack_aggregator_paused
    }
    aggregator_oracle_record {
      oracle_id
    }
  }
`

export const ORACLE_STORAGE_QUERY_NAME = 'GetOracleDataFeeds'
export const ORACLE_STORAGE_QUERY_VARIABLE = {}
