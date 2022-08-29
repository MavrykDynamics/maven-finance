import { Feed, InitialOracleStorageType } from 'pages/Satellites/helpers/Satellites.types'

export default function storageToTypeConverter(contract: string, storage: any): any {
  let res = {}
  switch (contract) {
    case 'oracle':
      res = convertToOracleStorageType(storage)
      break
  }

  return res
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
