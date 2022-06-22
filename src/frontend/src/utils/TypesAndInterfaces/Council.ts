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

export interface CouncilStorage {
  address: string
  config: CouncilConfig
  councilMembers?: CouncilMember[]
  councilActionsLedger: CouncilActionRecord[]
  actionCounter: number
}
