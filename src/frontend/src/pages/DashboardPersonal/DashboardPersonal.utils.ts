export const PORTFOLIO_TAB_ID = 'portfolio'
export const SATELLITE_TAB_ID = 'satellite'
export const DELEGATION_TAB_ID = 'delegation'

export type TabId = typeof PORTFOLIO_TAB_ID | typeof SATELLITE_TAB_ID | typeof DELEGATION_TAB_ID

export const isValidId = (x: string): x is TabId =>
  x === PORTFOLIO_TAB_ID || x === SATELLITE_TAB_ID || x === DELEGATION_TAB_ID
