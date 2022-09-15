export const ORACLE_STORAGE_QUERY = `
   query GetOracleDataFeeds {
    aggregator {
      address
      admin
      aggregator_factory_id
      decimals
      deviation_reward_amount_smvk
      deviation_reward_amount_xtz
      governance_id
      last_completed_price
      last_completed_price_datetime
      last_completed_price_epoch
      last_completed_price_pct_oracle_resp
      last_completed_price_round
      last_updated_at
      name
      token_1_symbol
      token_0_symbol
      reward_amount_xtz
      reward_amount_smvk
      per_thousand_deviation_trigger
      pct_oracle_threshold
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
    aggregator_oracle {
      oracle_id
    }
  }
`

export const ORACLE_STORAGE_QUERY_NAME = 'GetOracleDataFeeds'
export const ORACLE_STORAGE_QUERY_VARIABLE = {}
