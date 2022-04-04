import { MichelsonMap } from '@taquito/michelson-encoder'
import { BigNumber } from 'bignumber.js'

const { alice, bob } = require('../scripts/sandbox/accounts')

import { zeroAddress } from '../test/helpers/Utils'

import {cfmmTezFa12TokenStorageType } from '../test/types/cfmmTezFa12TokenStorageType'

const config = {
    fee         : 3, // 0.03%
    treasuryFee : 2  // 0.02%
}

export const cfmmTezFa12TokenStorage: cfmmTezFa12TokenStorageType = {

    admin               : bob.pkh,
    config              : config,
  
    cashPool            : new BigNumber(0),

    tokenName           : "",
    tokenAddress        : zeroAddress,
    tokenPool           : new BigNumber(0),

    lpTokenAddress      : zeroAddress,
    lpTokensTotal       : new BigNumber(1),
    pendingPoolUpdates  : new BigNumber(0),

    lastOracleUpdate    : new Date(),
    usdmTokenAddress    : zeroAddress,
    treasuryAddress     : zeroAddress
}
