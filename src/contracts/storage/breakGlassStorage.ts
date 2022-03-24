import { MichelsonMap } from '@taquito/michelson-encoder'

import { BigNumber } from 'bignumber.js'

const { bob } = require('../scripts/sandbox/accounts')

import { zeroAddress } from '../test/helpers/Utils'

import { breakGlassStorageType } from '../test/types/breakGlassStorageType'

const config = {
    threshold                  : 3,
    actionExpiryDays           : 3,
}

export const breakGlassStorage: breakGlassStorageType = {
  admin: bob.pkh,
  mvkTokenAddress: "",

  config: config,
  glassBroken         : false,
  councilMembers      : [],
  developerAddress    : zeroAddress,

  whitelistContracts  : MichelsonMap.fromLiteral({}),
  generalContracts    : MichelsonMap.fromLiteral({}),
  
  actionsLedger       : MichelsonMap.fromLiteral({}),
  actionCounter       : new BigNumber(1)

}
