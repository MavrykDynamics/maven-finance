import type {Mavryk_User} from '../generated/graphqlTypes'

export interface UserData {
  myAddress: string
  myMvkTokenBalance: number
  mySMvkTokenBalance: number
  participationFeesPerShare: number
  satelliteMvkIsDelegatedTo: string
  myDelegationHistory?: any[]
  isSatellite: boolean
}

export type MavrykUserGraphQl = Omit<Mavryk_User, '__typename'>
