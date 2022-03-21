export const SATELLITE_RECORDS_QUERY = `
query GetSatelliteRecords {
  satellite_record {
  fee
  image
  name
  description
  active
  user_id
  registered_datetime
  unregistered_datetime
  delegation_records {
    user {
      smvk_balance
    }
  }
}
}
`

export const SATELLITE_RECORDS_QUERY_NAME = 'GetSatelliteRecords'
export const SATELLITE_RECORDS_QUERY_VARIABLES = {}
