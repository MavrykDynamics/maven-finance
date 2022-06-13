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
    council {
      address
    }
    break_glass {
      address
    }
    emergency_governance {
      address
    }
    governance(where: {active: {_eq: true}}) {
      address
    }
    treasury {
      address
    }
    vesting {
      address
    }
  }
`

export const CONTRACT_ADDRESSES_QUERY_NAME = 'ContractAddressesQuery'
export const CONTRACT_ADDRESSES_QUERY_VARIABLE = {}
