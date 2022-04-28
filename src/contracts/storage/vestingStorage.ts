import { MichelsonMap } from '@taquito/michelson-encoder'

import { BigNumber } from 'bignumber.js'

const { bob } = require('../scripts/sandbox/accounts')

import { zeroAddress } from '../test/helpers/Utils'

import { vestingStorageType } from '../test/types/vestingStorageType'

const metadata = MichelsonMap.fromLiteral({
  '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
  data: Buffer.from(
    JSON.stringify({
      name: 'MAVRYK Vesting Contract',
      version: 'v1.0.0',
      authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
    }),
    'ascii',
  ).toString('hex'),
})

export const vestingStorage: vestingStorageType = {
  admin               : bob.pkh,
  mvkTokenAddress     : "",
  governanceAddress   : "",
  metadata            : metadata,

  whitelistContracts  : MichelsonMap.fromLiteral({}),
  generalContracts    : MichelsonMap.fromLiteral({}),

  claimLedger         : MichelsonMap.fromLiteral({}),
  vesteeLedger        : MichelsonMap.fromLiteral({}),

  totalVestedAmount   : new BigNumber(0),

  lambdaLedger        : MichelsonMap.fromLiteral({}),
}
