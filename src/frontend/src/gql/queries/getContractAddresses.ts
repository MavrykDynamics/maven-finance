export const CONTRACT_ADDRESSES_QUERY = `
  query ContractAddressesQuery {
    delegation {
      address
    }
    doorman {
      address
    }
    mvk_token {
      address
    }
    farm {
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
    treasury_factory {
      address
    }
    vesting {
      address
    }
    governance_satellite {
      address
    }
    aggregator_factory {
      address
    }
    aggregator {
      address
    }
    governance_financial {
      address
    }
  }
`

export const CONTRACT_ADDRESSES_QUERY_NAME = 'ContractAddressesQuery'
export const CONTRACT_ADDRESSES_QUERY_VARIABLE = {}
