// types
import type { ContractAddressesState } from '../reducers/contractAddresses'
import type { AddressesGraphQl } from '../utils/TypesAndInterfaces/Addresses'
import type { VestingGraphQL } from '../utils/TypesAndInterfaces/Vesting'
import type {
  AggregatorGraphQL,
  AggregatorFactoryGraphQL,
  AggregatorOracleGraphQL,
  DipdupContractMetadataGraphQL,
} from '../utils/TypesAndInterfaces/Aggregator'
import { Dipdup_Token_Metadata } from 'utils/generated/graphqlTypes'

export function normalizeAddressesStorage(storage: AddressesGraphQl): ContractAddressesState {
  return {
    farmAddress: { address: storage?.farm?.[0]?.address },
    farmFactoryAddress: { address: storage?.farm_factory?.[0]?.address },
    delegationAddress: { address: storage?.delegation?.[0]?.address },
    doormanAddress: { address: storage?.doorman?.[0]?.address },
    mvkTokenAddress: { address: storage?.mvk_token?.[0]?.address },
    governanceAddress: { address: storage?.governance?.[0]?.address },
    governanceFinancialAddress: { address: storage?.governance_financial?.[0]?.address },
    emergencyGovernanceAddress: {
      address: storage?.emergency_governance?.[0]?.address,
    },
    breakGlassAddress: { address: storage?.break_glass?.[0]?.address },
    councilAddress: { address: storage?.council?.[0]?.address },
    treasuryAddress: { address: storage?.delegation?.[0]?.address },
    treasuryFactoryAddress: {
      address: storage?.treasury_factory?.[0]?.address,
    },
    vestingAddress: { address: storage?.vesting?.[0]?.address },
    governanceSatelliteAddress: {
      address: storage?.governance_satellite?.[0]?.address,
    },
    aggregatorFactoryAddress: {
      address: storage?.aggregator_factory?.[0]?.address,
    },
    aggregatorAddress: { address: storage?.aggregator?.[0]?.address },
  }
}

export function normalizeVestingStorage(storage: VestingGraphQL | null) {
  return {
    address: storage?.address || '',
    totalVestedAmount: storage?.total_vested_amount ?? 0,
    totalClaimedAmount: storage?.vestees_aggregate.aggregate?.sum?.total_claimed ?? 0,
  }
}

export function getEnumKeyByEnumValue<T extends { [index: string]: string }>(
  myEnum: T,
  enumValue: string,
): keyof T | null {
  let keys = Object.keys(myEnum).filter((x) => myEnum[x] === enumValue)
  return keys.length > 0 ? keys[0] : null
}

export function normalizeOracle(storage: {
  aggregator: AggregatorGraphQL[]
  aggregator_factory: AggregatorFactoryGraphQL[]
  aggregator_oracle: AggregatorOracleGraphQL[]
  dipdup_contract_metadata: DipdupContractMetadataGraphQL[]
}) {
  const dataFeedUniqueCategories = new Set()

  const getCategoryAndNetwork = (address: string) => {
    const foundItem = storage?.dipdup_contract_metadata?.find((element) => element.contract === address) as
      | { metadata?: { category?: string }; network?: string }
      | undefined

    const category = foundItem?.metadata?.category
    const network = foundItem?.network || null

    if (!category) {
      return {
        category: null,
        network,
      }
    }

    dataFeedUniqueCategories.add(category)

    return {
      category,
      network,
    }
  }

  const feeds = storage?.aggregator.map((item) => {
    return {
      ...item,
      ...getCategoryAndNetwork(item.address),
    }
  })

  return {
    feeds,
    feedsFactory: storage?.aggregator_factory,
    feedCategories: [...dataFeedUniqueCategories],
  }
}

export function normalizeDipDupTokens(storage: { dipdup_token_metadata: Dipdup_Token_Metadata }) {
  return storage?.dipdup_token_metadata || []
}
