import { MichelsonMap } from '@taquito/michelson-encoder'

import { BigNumber } from 'bignumber.js'

const { bob, eve, mallory } = require('../scripts/sandbox/accounts')

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

const oracleAddresses = MichelsonMap.fromLiteral({
  [bob.pkh] : true,
  [eve.pkh] : true,
  [mallory.pkh] : true,
});

const deviationTriggerInfos = {
  oracleAddress : bob.pkh,
  amount : 0,
  roundPrice: 0,
}

const lastCompletedRoundPrice = {
  round: 0,
  price: 0,
  percentOracleResponse: 0
}

export const aggregatorStorage: aggregatorStorageType = {

  admin                     : bob.pkh,
  config                    : config,
  metadata                  : metadata,
  
  mvkTokenAddress           : zeroAddress,

  round                     : new BigNumber(0),
  switchBlock               : new BigNumber(1),

  oracleAddresses           : MichelsonMap.fromLiteral({}),
  
  deviationTriggerInfos     : deviationTriggerInfos,
  lastCompletedRoundPrice   : lastCompletedRoundPrice,
  
  observationCommits        : MichelsonMap.fromLiteral({}),
  observationReveals        : MichelsonMap.fromLiteral({}),

  oracleRewardsMVK          : MichelsonMap.fromLiteral({}),
  oracleRewardsXTZ          : MichelsonMap.fromLiteral({}),

  lambdaLedger              : MichelsonMap.fromLiteral({}),

}
