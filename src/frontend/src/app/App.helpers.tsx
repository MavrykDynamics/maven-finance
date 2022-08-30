// types
import type { ContractAddressesState } from '../reducers/contractAddresses'
import type { AddressesGraphQl } from '../utils/TypesAndInterfaces/Addresses'
import type { VestingGraphQL } from '../utils/TypesAndInterfaces/Vesting'
import type {
  AggregatorGraphQL,
  AggregatorFactoryGraphQL,
  AggregatorOracleRecordGraphQL,
} from '../utils/TypesAndInterfaces/Aggregator'

export function normalizeAddressesStorage(storage: AddressesGraphQl): ContractAddressesState {
  return {
    farmAddress: { address: storage?.farm?.[0]?.address },
    farmFactoryAddress: { address: storage?.farm_factory?.[0]?.address },
    delegationAddress: { address: storage?.delegation?.[0]?.address },
    doormanAddress: { address: storage?.doorman?.[0]?.address },
    mvkTokenAddress: { address: storage?.mvk_token?.[0]?.address },
    governanceAddress: { address: storage?.governance?.[0]?.address },
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

export function normalizeVestingStorage(storage: VestingGraphQL) {
  return {
    address: storage?.address,
    totalVestedAmount: storage?.total_vested_amount,
  }
}

export function getEnumKeyByEnumValue<T extends { [index: string]: string }>(
  myEnum: T,
  enumValue: string,
): keyof T | null {
  let keys = Object.keys(myEnum).filter((x) => myEnum[x] == enumValue)
  return keys.length > 0 ? keys[0] : null
}

export function normalizeOracle(storage: {
  aggregator: AggregatorGraphQL[]
  aggregator_factory: AggregatorFactoryGraphQL[]
  aggregator_oracle_record: AggregatorOracleRecordGraphQL[]
}) {
  return {
    feeds: storage.aggregator.map((feed) => ({
      ...feed,
      category: 'Cryptocurrency (USD pairs)',
      network: 'Tezos',
    })),
    feedsFactory: storage?.aggregator_factory,
    totalOracleNetworks: storage?.aggregator
      ? storage.aggregator.reduce((acc, cur) => acc + cur.oracle_records.length, 0)
      : 0,
  }
}
