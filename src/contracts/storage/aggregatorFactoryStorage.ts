import { MichelsonMap } from "@taquito/michelson-encoder";
import { zeroAddress } from "test/helpers/Utils";

import { bob } from '../scripts/sandbox/accounts'
import { aggregatorFactoryStorageType } from "../test/types/aggregatorFactoryStorageType";

const breakGlassConfig = {
  createAggregatorIsPaused       : false,
  trackAggregatorIsPaused        : false,
  untrackAggregatorIsPaused      : false,
  distributeRewardXtzIsPaused    : false,
  distributeRewardMvkIsPaused    : false,
}

const metadata = MichelsonMap.fromLiteral({
  '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
  data: Buffer.from(
    JSON.stringify({
      name: 'MAVRYK Aggregator Factory Contract',
      version: 'v1.0.0',
      authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
    }),
    'ascii',
  ).toString('hex'),
})

export const aggregatorFactoryStorage : aggregatorFactoryStorageType = {
  
  admin                   : bob.pkh,
  metadata                : metadata,
  breakGlassConfig        : breakGlassConfig,
  
  mvkTokenAddress         : zeroAddress,
  governanceAddress       : zeroAddress,

  generalContracts        : MichelsonMap.fromLiteral({}),
  whitelistContracts      : MichelsonMap.fromLiteral({}),
    
  trackedAggregators      : [],
  trackedSatellites       : [],
  
  lambdaLedger            : MichelsonMap.fromLiteral({}),
  aggregatorLambdaLedger  : MichelsonMap.fromLiteral({}),
};