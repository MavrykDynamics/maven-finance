import { MichelsonMap } from '@taquito/michelson-encoder'

import { BigNumber } from 'bignumber.js'

const { bob } = require('../scripts/sandbox/accounts')

import { zeroAddress } from '../test/helpers/Utils'

import { breakGlassStorageType } from '../test/types/breakGlassStorageType'

const config = {
    threshold                       : 3,
    actionExpiryDays                : 3,
    councilMemberNameMaxLength      : 400,
    councilMemberWebsiteMaxLength   : 400,
    councilMemberImageMaxLength     : 400,
}

const metadata = MichelsonMap.fromLiteral({
  '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
  data: Buffer.from(
    JSON.stringify({
      name: 'MAVRYK Break Glass Contract',
      version: 'v1.0.0',
      authors: ['MAVRYK Dev Team <contact@mavryk.finance>']
    }),
    'ascii',
  ).toString('hex'),
})

export const breakGlassStorage: breakGlassStorageType = {
  admin               : bob.pkh,
  mvkTokenAddress     : "",
  governanceAddress   : "",
  metadata            : metadata,

  config              : config,
  glassBroken         : false,
  councilMembers      : MichelsonMap.fromLiteral({}),

  whitelistContracts  : MichelsonMap.fromLiteral({}),
  generalContracts    : MichelsonMap.fromLiteral({}),
  
  actionsLedger       : MichelsonMap.fromLiteral({}),
  actionCounter       : new BigNumber(1),

  lambdaLedger        : MichelsonMap.fromLiteral({})
}
