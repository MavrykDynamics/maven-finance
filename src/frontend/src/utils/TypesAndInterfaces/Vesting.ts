type VestingConfig = {
  defaultCliffPeriod: number
  defaultCooldownPeriod: number
}
export interface VestingStorage {
  address: string
  config: VestingConfig
  totalVestedAmount: number
  sumAmountClaimed: number
  sumRemainingVested: number
}
