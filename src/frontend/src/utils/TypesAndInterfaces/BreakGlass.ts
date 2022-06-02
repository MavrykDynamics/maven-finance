type BreakGlassConfig = {
  threshold: number // min number of council members who need to agree on action
  actionExpiryDays: number // action expiry in number of days
  councilMemberNameMaxLength: number
  councilMemberWebsiteMaxLength: number
  councilMemberImageMaxLength: number
}

export enum BreakGlassActionStatus {
  PENDING = 0,
  FLUSHED = 1,
  EXECUTED = 2,
}

export type BreakGlassActionSigner = {
  signerId: string
  id: number
  breakGlassActionRecordId: number
}
export type BreakGlassActionRecord = {
  actionType: string
  breakGlassId: number
  executed: boolean
  executedDatetime: Date
  executedLevel: number
  expirationDatetime: Date
  id: number
  initiatorId: string
  startDatetime: Date
  status: BreakGlassActionStatus
  signers: BreakGlassActionSigner[]
  signersCount: number
}

export interface BreakGlassStorage {
  address: string
  admin: string
  config: BreakGlassConfig
  glassBroken: boolean
  actionCounter: number
  actionLedger: BreakGlassActionRecord[]
  governanceId: string
}
