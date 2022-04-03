export const PRIMARY = 'primary'
export const REQUIRES_ACKNOWLEDGEMENT = 'requires_acknowledgement'
export const FARM_DEPOSIT = 'farm_deposit'
export const FARM_WITHDRAW = 'farm_withdraw'
export type ModalKind =
  | typeof PRIMARY
  | typeof REQUIRES_ACKNOWLEDGEMENT
  | typeof FARM_DEPOSIT
  | typeof FARM_WITHDRAW
  | undefined
