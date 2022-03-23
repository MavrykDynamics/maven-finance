type BreakGlassConfig = {
  threshold: number
  actionExpiryDuration: number
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
  expirationDatetime: Date
  id: number
  initiatorId: string
  startDatetime: Date
  status: boolean
  signers: BreakGlassActionSigner[]
}
export interface BreakGlassStorage {
  address: string
  config: BreakGlassConfig
  glassBroken: boolean
  councilMembers: { address: string }[]
  currentActionId: number
  actionLedger: BreakGlassActionRecord[]
}
