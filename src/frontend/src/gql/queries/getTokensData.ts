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
