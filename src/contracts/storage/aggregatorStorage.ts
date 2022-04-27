import { MichelsonMap } from '@taquito/michelson-encoder'

import { BigNumber } from 'bignumber.js'

const { bob } = require('../scripts/sandbox/accounts')

import { zeroAddress } from '../test/helpers/Utils'

import { aggregatorStorageType } from '../test/types/aggregatorStorageType'

const config = {
  decimals                            : 8,
  maintainer                          : bob.pkh,
  minimalTezosAmountDeviationTrigger  : 0,
  perthousandDeviationTrigger         : 0,
  percentOracleThreshold              : 100,
  rewardAmountMVK                     : 1,
  rewardAmountXTZ                     : 1,
  numberBlocksDelay                   : 2,
}

const metadata = MichelsonMap.fromLiteral({
  '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
  data: Buffer.from(
    JSON.stringify({
      name: 'MAVRYK Council Contract',
      version: 'v1.0.0',
      authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
    }),
    'ascii',
  ).toString('hex'),
})

export const aggregatorStorage: aggregatorStorageType = {

  admin                     : bob.pkh,
  mvkTokenAddress           : "",
  // metadata              : metadata,
  
  config                    : config,
  
  round                     : new BigNumber(0),
  switchBlock               : new BigNumber(1),

  oracleAddresses           : MichelsonMap.fromLiteral({}),
  
  deviationTriggerInfos     : MichelsonMap.fromLiteral({}),
  lastCompletedRoundPrice   : MichelsonMap.fromLiteral({}),
  
  observationCommits        : MichelsonMap.fromLiteral({}),
  observationReveals        : MichelsonMap.fromLiteral({}),

  oracleRewardsMVK          : MichelsonMap.fromLiteral({}),
  oracleRewardsXTZ          : MichelsonMap.fromLiteral({}),

  lambdaLedger              : MichelsonMap.fromLiteral({}),

}
