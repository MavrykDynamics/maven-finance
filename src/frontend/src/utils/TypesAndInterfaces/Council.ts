// type
import type { Council, Council_Action_Record } from '../generated/graphqlTypes'

import { noralizeCouncilStorage } from '../../pages/Council/Council.helpers'

type CouncilConfig = {
  threshold: number
  actionExpiryDays: number
}

export type CouncilActionSigner = {
  signerId: string
  id: number
  breakGlassActionRecordId: number
}
export type CouncilActionRecord = {
  actionType: string
  councilId: number
  executed: boolean
  executedDatetime: Date
  expirationDatetime: Date
  id: number
  initiatorId: string
  startDatetime: Date
  status: boolean
  signers: CouncilActionSigner[]
}

export type CouncilMember = {
  id: number
  name: string
  image: string
  user_id: string
  website: string
}

export type CouncilStorage = ReturnType<typeof noralizeCouncilStorage>

export type CouncilGraphQL = Omit<Council, '__typename'>
export type CouncilActionRecordhQL = Omit<Council_Action_Record, '__typename'>
