export type mvkStatsType = {
  marketCap: number
  stakedMvk: number
  circuatingSupply: number
  maxSupply: number
  livePrice: number
  prevPrice: number
}

export const LENDING_TAB_ID = 'lending'
export const VAULTS_TAB_ID = 'vaults'
export const FARMS_TAB_ID = 'farms'
export const SATELLITES_TAB_ID = 'satellites'
export const ORACLES_TAB_ID = 'oracles'
export const TREASURY_TAB_ID = 'treasury'

export type TabId =
  | typeof LENDING_TAB_ID
  | typeof VAULTS_TAB_ID
  | typeof FARMS_TAB_ID
  | typeof SATELLITES_TAB_ID
  | typeof ORACLES_TAB_ID
  | typeof TREASURY_TAB_ID

export const isValidId = (x: string): x is TabId =>
  x === LENDING_TAB_ID ||
  x === VAULTS_TAB_ID ||
  x === FARMS_TAB_ID ||
  x === SATELLITES_TAB_ID ||
  x === ORACLES_TAB_ID ||
  x === TREASURY_TAB_ID
