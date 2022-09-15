import type { Aggregator } from 'utils/generated/graphqlTypes'

import { SatelliteRecord } from 'utils/TypesAndInterfaces/Delegation'

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

export type FeedGQL = Omit<Aggregator, '__typename'>

export type InitialOracleStorageType = {
  feeds: Array<FeedGQL>
  feedsFactory: Array<FeedFactory>
  totalOracleNetworks: number
}

export type SatelliteListItemProps = {
  satellite: SatelliteRecord
  loading: boolean
  delegateCallback: (satelliteAddress: string) => void
  claimRewardsCallback?: (satelliteAddress: string) => void
  undelegateCallback: () => void
  userStakedBalance: number
  satelliteUserIsDelegatedTo: string
  isDetailsPage?: boolean
  className?: string
  children?: JSX.Element
}
