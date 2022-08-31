import type { Aggregator } from 'utils/generated/graphqlTypes'

import { SatelliteRecord } from 'utils/TypesAndInterfaces/Delegation'

export type SatellitesListProps = {
  listTitle?: string
  items: Array<any>
  listType: 'satellites' | 'feeds' | 'oracles' | 'userFeeds'
  name: string
  onClickHandler?: (arg0: any) => void
  selectedItem?: any
  loading: boolean
  additionaldata?: Record<string, any>
}

export type FeedFactory = {
  address: string
  admin: string
  create_aggregator_paused: boolean
  distribute_reward_smvk_paused: boolean
  distribute_reward_xtz_paused: boolean
  governance_id: string
  track_aggregator_paused: boolean
  untrack_aggregator_paused: boolean
}

export type Feed = {
  address: string
  admin: string
  aggregator_factory_id: string
  creation_timestamp: string
  decimals: number
  deviation_reward_amount_smvk: number
  deviation_reward_amount_xtz: number
  deviation_trigger_ban_duration: number
  deviation_trigger_oracle_id: string
  deviation_trigger_round_price: number
  governance_id: string
  last_completed_round: number
  last_completed_round_pct_oracle_response: number
  last_completed_round_price: number
  last_completed_round_price_timestamp: string
  maintainer_id: string
  name: string
  number_blocks_delay: number
  oracle_records: Aggregator['oracle_records']
  oracle_rewards_smvk: Aggregator['oracle_rewards_smvk']
  oracle_rewards_xtz: Aggregator['oracle_rewards_xtz']
  per_thousand_deviation_trigger: number
  percent_oracle_threshold: number
  request_rate_deviation_deposit_fee: number
  request_rate_update_deviation_paused: boolean
  request_rate_update_paused: boolean
  reward_amount_smvk: number
  reward_amount_xtz: number
  round: number
  round_start_timestamp: string
  set_observation_commit_paused: boolean
  set_observation_reveal_paused: boolean
  switch_block: 0
  token_0_symbol: string
  token_1_symbol: string
  withdraw_reward_smvk_paused: boolean
  withdraw_reward_xtz_paused: boolean
  network?: string
  category?: string
}

export type InitialOracleStorageType = {
  feeds: Array<Feed>
  feedsFactory: Array<FeedFactory>
  totalOracleNetworks: number
}

export type SatelliteListItemProps = {
  satellite: SatelliteRecord
  loading: boolean
  delegateCallback: (satelliteAddress: string) => void
  undelegateCallback: () => void
  userStakedBalance: number
  satelliteUserIsDelegatedTo: string
  isDetailsPage?: boolean
  isExtendedListItem?: boolean
  className?: string
  children?: JSX.Element
}
