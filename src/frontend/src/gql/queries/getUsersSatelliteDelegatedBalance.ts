export const USERS_SATELLITE_DELEGATION_BALANCE_QUERY = `
query GetUsersSatelliteDelegatedBalance ($_eq: String = "") {
  mavryk_user_aggregate(where:{delegation_records: {satellite_record: {user_id: {_eq: $_eq}}}}) {
    aggregate {
      sum {
        smvk_balance
      }
    }
  }
}
`

export const USERS_SATELLITE_DELEGATION_QUERY_NAME = 'GetUsersSatelliteDelegatedBalance'
export function USERS_SATELLITE_DELEGATION_QUERY_VARIABLES(address: string) {
  /* prettier-ignore */
  return { _eq: address }
}
