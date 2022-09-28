export const ORACLE_STORAGE_QUERY = `
   query GetOracleDataFeeds {
    aggregator(where: {admin: {_neq: ""}}) {
      address
      admin
      decimals
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
  }
`

export const ORACLE_STORAGE_QUERY_NAME = 'GetOracleDataFeeds'
export const ORACLE_STORAGE_QUERY_VARIABLE = {}
