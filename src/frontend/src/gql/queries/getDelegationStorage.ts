export const DELEGATION_STORAGE_QUERY = `
query DelegationStorageQuery {
  delegation {
    address
    delegate_to_satellite_paused
    delegation_ratio
    max_satellites
    minimum_smvk_balance
    register_as_satellite_paused
    undelegate_from_satellite_paused
    unregister_as_satellite_paused
    update_satellite_record_paused
    satellite_records {
      delegation_id
      description
      fee
      id
      image
      name
      registered_datetime
      unregistered_datetime
      user_id
      active
    }
    delegation_records {
      satellite_record_id
      delegation_id
      id
    }
  }
}

`

export const DELEGATION_STORAGE_QUERY_NAME = 'DelegationStorageQuery'
export const DELEGATION_STORAGE_QUERY_VARIABLE = {}
