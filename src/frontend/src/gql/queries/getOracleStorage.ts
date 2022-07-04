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
      deviation_trigger_amount
      deviation_trigger_ban_duration
      deviation_trigger_oracle_id
      deviation_trigger_round_price
      governance_id
      last_completed_round
      last_completed_round_pct_oracle_response
      last_completed_round_price
      last_completed_round_price_timestamp
      number_blocks_delay
      name
      maintainer_id
      withdraw_reward_xtz_paused
      withdraw_reward_smvk_paused
      token_1_symbol
      token_0_symbol
      set_observation_reveal_paused
      switch_block
      set_observation_commit_paused
      round_start_timestamp
      round
      reward_amount_xtz
      reward_amount_smvk
      request_rate_update_paused
      request_rate_update_deviation_paused
      request_rate_deviation_deposit_fee
      percent_oracle_threshold
      per_thousand_deviation_trigger
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
  }
`

export const ORACLE_STORAGE_QUERY_NAME = 'GetOracleDataFeeds'
export const ORACLE_STORAGE_QUERY_VARIABLE = {}
