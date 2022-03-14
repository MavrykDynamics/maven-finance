export const CONTRACT_ADDRESSES_QUERY = `
  query ContractAddressesQuery {
    farm {
      address
    }
    delegation {
      address
    }
    doorman {
      address
    }
    mvk_token {
      address
    }
    farm_factory {
      address
    }
  }
`

export const CONTRACT_ADDRESSES_QUERY_NAME = 'ContractAddressesQuery'
export const CONTRACT_ADDRESSES_QUERY_VARIABLE = {}
