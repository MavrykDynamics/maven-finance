export const USER_SATELLITE_REWARDS_QUERY = `
  query GetUserSatelliteRewards($_eq: String = "") {
    satellite_rewards_record(where: {user_id: {_eq: $_eq}}) {
      unpaid
      paid
      participation_rewards_per_share
      reference {
        satellite_accumulated_reward_per_share
      }
    }
  }
`

export const USER_SATELLITE_REWARDS_QUERY_NAME = 'GetUserSatelliteRewards'

export function USER_SATELLITE_REWARDS_QUERY_VARIABLES(address: string): Record<string, any> {
  /* prettier-ignore */
  return { _eq: address }
}
