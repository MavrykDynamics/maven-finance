export const GET_TREASURY_DATA = `
  query GetTreasuryStorageQuery {
    treasury {
      address
      admin
      creation_timestamp
      governance_id
      mint_mvk_and_transfer_paused
      name
      stake_mvk_paused
      transfer_paused
      treasury_factory_id
      unstake_mvk_paused
    }
    treasury_factory {
      address
      admin
      create_treasury_paused
      governance_id
      track_treasury_paused
      treasury_name_max_length
      untrack_treasury_paused
    }
  }
`

export const TREASURY_STORAGE_QUERY_NAME = 'GetTreasuryStorageQuery'
export const TREASURY_STORAGE_QUERY_VARIABLE = {}