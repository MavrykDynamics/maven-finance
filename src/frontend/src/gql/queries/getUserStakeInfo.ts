export const USER_STAKE_BALANCE_QUERY = `
query GetUserStakeBalance($_eq: String = "") {
  doorman {
    stake_accounts(where: {address: {_eq: $_eq}}) {
      address
      mvk_balance
      smvk_balance
      participation_fees_per_share
    }
  }
}
`

export const USER_STAKE_BALANCE_QUERY_NAME = 'GetUserStakeBalance'
export function USER_STAKE_BALANCE_QUERY_VARIABLES(address: string): Record<string, any> {
  /* prettier-ignore */
  return { _eq: address }
}
