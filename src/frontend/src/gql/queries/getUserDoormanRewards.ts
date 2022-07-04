export const USER_DOORMAN_REWARDS_QUERY = `
  query GetUserDoormanRewards($_eq: String = "") {
    doorman {
      unclaimed_rewards
      accumulated_fees_per_share
      stake_accounts(where: {user_id: {_eq: $_eq}}) {
        participation_fees_per_share
        smvk_balance
        user_id
      }
    }
    mavryk_user(where: {address: {_eq: $_eq}}) {
      address
      mvk_balance
    }
  }
`

export const USER_DOORMAN_REWARDS_QUERY_NAME = 'GetUserDoormanRewards'

export function USER_DOORMAN_REWARDS_QUERY_VARIABLES(address: string): Record<string, any> {
  /* prettier-ignore */
  return { _eq: address }
}
