export const USER_INFO_QUERY = `
query GetUserInfo ($_eq: String = "") {
  mavryk_user(where: {address: {_eq: $_eq}}) {
    address
    mvk_balance
    smvk_balance
    delegation_records {
      satellite_record {
        user_id
      }
    }
  }
}
`

export const USER_INFO_QUERY_NAME = 'GetUserInfo'
export function USER_INFO_QUERY_VARIABLES(address: string): Record<string, any> {
  /* prettier-ignore */
  return { _eq: address }
}
