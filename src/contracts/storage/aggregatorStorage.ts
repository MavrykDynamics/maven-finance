import { MichelsonMap } from '@taquito/michelson-encoder'

import { BigNumber } from 'bignumber.js'

const { bob, eve, mallory, david } = require('../scripts/sandbox/accounts')

import { zeroAddress } from '../test/helpers/Utils'

import { aggregatorStorageType } from '../test/types/aggregatorStorageType'

import delegationAddress from '../deployments/delegationAddress.json';

const config = {
  decimals                            : new BigNumber(8),
  maintainer                          : bob.pkh,
  minimalTezosAmountDeviationTrigger  : new BigNumber(1),
  perthousandDeviationTrigger         : new BigNumber(2),
  percentOracleThreshold              : new BigNumber(49),
  rewardAmountMVK                     : new BigNumber(1),
  rewardAmountXTZ                     : new BigNumber(1),
  numberBlocksDelay                   : new BigNumber(2),
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
  [david.pkh] : true,
});

const deviationTriggerInfos = {
  oracleAddress : bob.pkh,
  amount : new BigNumber(0),
  roundPrice: new BigNumber(0),
}

const lastCompletedRoundPrice = {
  round: new BigNumber(0),
  price: new BigNumber(0),
  percentOracleResponse: new BigNumber(0)
}

export const aggregatorStorage: aggregatorStorageType = {

  admin                     : bob.pkh,
  config                    : config,
  metadata                  : metadata,
  
  mvkTokenAddress           : delegationAddress.address,

  round                     : new BigNumber(0),
  switchBlock               : new BigNumber(0),

  oracleAddresses           : oracleAddresses,
  
  deviationTriggerInfos     : deviationTriggerInfos,
  lastCompletedRoundPrice   : lastCompletedRoundPrice,
  
  observationCommits        : MichelsonMap.fromLiteral({}),
  observationReveals        : MichelsonMap.fromLiteral({}),

  oracleRewardsMVK          : MichelsonMap.fromLiteral({}),
  oracleRewardsXTZ          : MichelsonMap.fromLiteral({}),

  lambdaLedger              : MichelsonMap.fromLiteral({}),

}
