import type { Aggregator, Aggregator_History_Data } from 'utils/generated/graphqlTypes'
import { SatelliteRecord } from 'utils/TypesAndInterfaces/Delegation'
import { normalizeDataFeedsHistory } from '../Satellites.helpers'

type callbackFunction = (arg0: string) => void

// TODO: IDK how to type additional data, maybe revrite logic in future
export type SatellitesListProps = {
  listTitle?: string
  items: Array<FeedGQL> | Array<SatelliteRecord>
  listType: 'satellites' | 'feeds' | 'oracles' | 'userFeeds'
  name: string
  onClickHandler?: (arg0: string) => void
  loading: boolean
  additionaldata?: Record<string, boolean | number | callbackFunction | string | object>
  pagination?: boolean
  className?: string
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
  aggregator_name_max_length: number
}

export type FeedGQL = Omit<Aggregator, '__typename'> & { category: string | null }

export type InitialOracleStorageType = {
  feeds: Array<FeedGQL>
  feedsFactory: Array<FeedFactory>
  feedCategories: Array<string>
}

export type SatelliteListItemProps = {
  satellite: SatelliteRecord
  delegateCallback: (satelliteAddress: string) => void
  claimRewardsCallback?: () => void
  undelegateCallback: (address: string) => void
  userStakedBalance: number
  satelliteUserIsDelegatedTo: string
  isDetailsPage?: boolean
  userHasSatelliteRewards?: boolean
  className?: string
  children?: JSX.Element
}

export type DataFeedsHistory = ReturnType<typeof normalizeDataFeedsHistory>
export type DataFeedsHistoryGraphQL = Omit<Aggregator_History_Data, '__typename'>

export type DataFeedsVolatility = ReturnType<typeof normalizeDataFeedsHistory>
