export const DIPDUP_TOKENS_QUERY = `
   query GetDipDupTokens {
    dipdup_token_metadata {
      token_id
      metadata
      contract
      created_at
      id
      update_id
      network
      updated_at
    }
  }
`
export const DIPDUP_TOKENS_QUERY_NAME = 'GetDipDupTokens'
export const DIPDUP_TOKENS_QUERY_VARIABLE = {}

export const GOVERNANCE_CONTRACT_ADDRESS_QUERY = `
  query GetContractAddress {
    governance(where: {active: {_eq: true}}) {
      general_contracts(where: {contract_name: {_eq: "paymentTreasury"}}) {
        contract_address
      }
    }
  }
`
export const GOVERNANCE_CONTRACT_ADDRESS_NAME = 'GetContractAddress'
export const GOVERNANCE_CONTRACT_ADDRESS_VARIABLE = {}

export const WHITELIST_TOKENS_QUERY = `
  query getWhiteListTokensForContract ($_contractAddress: String){
    treasury(where: {address: {_eq: $_contractAddress}}) {
      whitelist_token_contracts {
        contract_address
        contract_name
        id
      }
    }
  }
`
export const WHITELIST_TOKENS_NAME = 'getWhiteListTokensForContract'
export function WHITELIST_TOKENS_VARIABLE(address: string) {
  return { _contractAddress: address }
}
