export const USER_FARM_REWARDS_QUERY = `
  query GetUserFarmsRewards($user_address: String = "", $farm_address: String = "") {
    farm(where: {address: {_eq: $farm_address}}) {
      accumulated_rewards_per_share
      blocks_per_minute
      current_reward_per_block
      last_block_update
      total_rewards
      farm_accounts(where: {user_id: {_eq: $user_address}}) {
        deposited_amount
        participation_rewards_per_share
      }
    }
  }
`

export const USER_FARM_REWARDS_QUERY_NAME = 'GetUserFarmsRewards'

export function USER_FARM_REWARDS_QUERY_VARIABLES(userAddress: string, farmAddress: string): Record<string, any> {
  /* prettier-ignore */
  return { user_address: userAddress, farm_address: farmAddress }
}
