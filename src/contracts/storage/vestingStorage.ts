import { MichelsonMap } from '@taquito/michelson-encoder'

import { BigNumber } from 'bignumber.js'

const { alice } = require('../scripts/sandbox/accounts')

import { zeroAddress } from '../test/helpers/Utils'

import { vestingStorageType } from '../test/types/vestingStorageType'

const config = {
  defaultCliffPeriod: 6,
  defaultCooldownPeriod: 1,
  newBlockTimeLevel: 0,
  newBlocksPerMinute: 0,
  blocksPerMinute: 2,
  blocksPerMonth: 86400,
}

export const vestingStorage: vestingStorageType = {
  admin: alice.pkh,
  config: config,

  whitelistContracts: MichelsonMap.fromLiteral({}),
  generalContracts: MichelsonMap.fromLiteral({}),

  claimLedger: MichelsonMap.fromLiteral({}),
  vesteeLedger: MichelsonMap.fromLiteral({}),

  totalVestedAmount: new BigNumber(0),

  tempBlockLevel: new BigNumber(0)
}
