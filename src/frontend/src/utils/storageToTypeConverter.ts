import { Feed, InitialOracleStorageType } from 'pages/Satellites/helpers/Satellites.types'

import { TreasuryType } from './TypesAndInterfaces/Treasury'

export default function storageToTypeConverter(contract: string, storage: any): any {
  let res = {}
  switch (contract) {
    case 'treasury':
      res = convertToTreasuryAddressType(storage)
      break
    case 'oracle':
      res = convertToOracleStorageType(storage)
      break
  }

  return res
}

function convertToTreasuryAddressType(storage: any): {
  treasuryAddresses: Array<TreasuryType>
  treasuryFactoryAddress: string
} {
  return {
    treasuryAddresses: storage?.treasury,
    treasuryFactoryAddress: storage?.treasury_factory[0].address,
  }
}

function convertToOracleStorageType(storage: any): InitialOracleStorageType {
  return {
    feeds: storage?.aggregator.map((feed: Feed) => ({
      ...feed,
      category: 'Cryptocurrency (USD pairs)',
      network: 'Tezos',
    })),
    feedsFactory: storage?.aggregator_factory,
    totalOracleNetworks: storage?.aggregator
      ? storage.aggregator.reduce((acc: number, cur: any) => acc + cur.oracle_records.length, 0)
      : 0,
  }
}

export function getEnumKeyByEnumValue<T extends { [index: string]: string }>(
  myEnum: T,
  enumValue: string,
): keyof T | null {
  let keys = Object.keys(myEnum).filter((x) => myEnum[x] == enumValue)
  return keys.length > 0 ? keys[0] : null
}
