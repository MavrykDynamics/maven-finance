import type {Mavryk_User} from '../generated/graphqlTypes'

export interface UserData {
  myAddress: string
  myMvkTokenBalance: number
  mySMvkTokenBalance: number
  participationFeesPerShare: number
  satelliteMvkIsDelegatedTo: string
  myDelegationHistory?: any[]
}

export type MavrykUserGraphQl = Omit<Mavryk_User, '__typename'>
