import { MichelsonMap } from "@taquito/michelson-encoder";

const { bob } = require('../scripts/sandbox/accounts')

import { delegationStorageType } from "../test/types/delegationStorageType";

const config = {
    minimumStakedMvkBalance : 100000000,
    delegationRatio         : 1000,
    maxSatellites           : 100
}

const breakGlassConfig = {
    delegateToSatelliteIsPaused         : false,
    undelegateFromSatelliteIsPaused     : false,
    registerAsSatelliteIsPaused         : false,
    unregisterAsSatelliteIsPaused       : false,
    updateSatelliteRecordIsPaused       : false
}

const metadata = MichelsonMap.fromLiteral({
  '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
  data: Buffer.from(
    JSON.stringify({
      name: 'MAVRYK Delegation Contract',
      version: 'v1.0.0',
      authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
      source: {
        tools: ['Ligo', 'Flextesa'],
        location: 'https://ligolang.org/',
      },
    }),
    'ascii',
  ).toString('hex'),
})

export const delegationStorage: delegationStorageType = {
  admin: bob.pkh,
  mvkTokenAddress: "",
  metadata: metadata,
  
  config: config,
  breakGlassConfig: breakGlassConfig,

  whitelistContracts : MichelsonMap.fromLiteral({}),
  generalContracts: MichelsonMap.fromLiteral({}),
  
  delegateLedger: MichelsonMap.fromLiteral({}),
  satelliteLedger: MichelsonMap.fromLiteral({}),
  
};
