// type
import type { Farm } from '../generated/graphqlTypes'

// helpers
import { normalizeFarmStorage } from '../../pages/Farms/Frams.helpers'

export interface FarmAccountsType {
  claimed_rewards: number
  deposited_amount: number
  farm_id: string
  id: number
  unclaimed_rewards: number
  user_id: string
  participation_rewards_per_share: number
}

export type TzipsType = 'fa1' | 'fa12' | 'fa2'

export type FarmContractType = {
  id: number
  type: string
  address: string
  kind: string
  tzips: TzipsType[]
  alias: string
  balance: number
  creator: {
    alias: string
    address: string
  }
  metadata: {
    alias: string
    address: string
  }
  numContracts: number
  activeTokensCount: number
  tokenBalancesCount: number
  tokenTransfersCount: number
  numDelegations: number
  numOriginations: number
  numTransactions: number
  numReveals: number
  numMigrations: number
  transferTicketCount: number
  firstActivity: number
  firstActivityTime: string
  lastActivity: number
  lastActivityTime: string
  typeHash: number
  codeHash: number
}

export type FarmStorage = ReturnType<typeof normalizeFarmStorage>

export type FarmGraphQL = Omit<Farm, '__typename'>
