import { MichelsonMap } from '@taquito/michelson-encoder'

import { BigNumber } from 'bignumber.js'

const { alice } = require('../scripts/sandbox/accounts')

import { zeroAddress } from '../test/helpers/Utils'

import { councilStorageType } from '../test/types/councilStorageType'

const config = {
  threshold: 3, // 3 council members required
  actionExpiryDays: 2, // 2 days
}

export const councilStorage: councilStorageType = {
  admin: alice.pkh,
  mvkTokenAddress: "",
  
  config: config,
  councilMembers: [],

  whitelistContracts: MichelsonMap.fromLiteral({}),
  generalContracts: MichelsonMap.fromLiteral({}),

  councilActionsLedger: MichelsonMap.fromLiteral({}),

  actionCounter: new BigNumber(1),
}
