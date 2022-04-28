import { MichelsonMap } from "@taquito/michelson-encoder";
import { bob } from '../scripts/sandbox/accounts'
import { BigNumber } from "bignumber.js";
import { aggregatorFactoryStorageType } from "../test/types/aggregatorFactoryStorageType";

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
  
  admin                 : bob.pkh,
  metadata              : metadata,
  mvkTokenAddress       : "",
  
  trackedAggregators    : MichelsonMap.fromLiteral({}),
  trackedSatellites     : [],

  lambdaLedger          : MichelsonMap.fromLiteral({}),
};