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

export const delegationStorage: delegationStorageType = {
  admin: bob.pkh,
  mvkTokenAddress: "",
  
  config: config,
  breakGlassConfig: breakGlassConfig,

  whitelistContracts : MichelsonMap.fromLiteral({}),
  generalContracts: MichelsonMap.fromLiteral({}),
  
  delegateLedger: MichelsonMap.fromLiteral({}),
  satelliteLedger: MichelsonMap.fromLiteral({}),
  
};
