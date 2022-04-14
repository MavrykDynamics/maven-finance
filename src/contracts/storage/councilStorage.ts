import { MichelsonMap } from '@taquito/michelson-encoder'

import { BigNumber } from 'bignumber.js'

const { bob } = require('../scripts/sandbox/accounts')

import { zeroAddress } from '../test/helpers/Utils'

import { councilStorageType } from '../test/types/councilStorageType'

const config = {
  threshold: 3, // 3 council members required
  actionExpiryDays: 2, // 2 days
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

export const councilStorage: councilStorageType = {
  admin: bob.pkh,
  mvkTokenAddress: "",
  metadata: metadata,
  
  config: config,
  councilMembers: MichelsonMap.fromLiteral({}),

  whitelistContracts: MichelsonMap.fromLiteral({}),
  generalContracts: MichelsonMap.fromLiteral({}),

  councilActionsLedger: MichelsonMap.fromLiteral({}),

  actionCounter: new BigNumber(1),
}
