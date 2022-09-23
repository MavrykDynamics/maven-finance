export const USER_REWARDS_QUERY = `
query GetUserRewards($user_address: String = "") {
  farm(where: {farm_accounts: {user_id: {_eq: $user_address}}}) {
    address
    accumulated_rewards_per_share
    current_reward_per_block
    last_block_update
    total_rewards
    paid_rewards
    unpaid_rewards
    infinite
    lp_token_balance
    farm_accounts {
      deposited_amount
      participation_rewards_per_share
    }
  }
  doorman {
    unclaimed_rewards
    accumulated_fees_per_share
    stake_accounts(where: {user_id: {_eq: $user_address}}) {
      participation_fees_per_share
      smvk_balance
      user_id
    }
  }
  mavryk_user(where: {address: {_eq: $user_address}}) {
    address
    mvk_balance
  }
  satellite_rewards(where: {user_id: {_eq: $user_address}}) {
    unpaid
    paid
    participation_rewards_per_share
    reference {
      satellite_accumulated_reward_per_share
    }
  }
}
`

export const USER_REWARDS_QUERY_NAME = 'GetUserRewards'
export function USER_REWARDS_QUERY_VARIABLES(userAddress: string): Record<string, string> {
  return { user_address: userAddress }
}
