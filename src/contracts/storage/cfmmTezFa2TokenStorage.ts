import { MichelsonMap } from '@taquito/michelson-encoder'
import { BigNumber } from 'bignumber.js'

const { alice, bob } = require('../scripts/sandbox/accounts')

import { zeroAddress } from '../test/helpers/Utils'

import {cfmmTezFa2TokenStorageType } from '../test/types/cfmmTezFa2TokenStorageType'

const config = {
    fee         : 3,
    treasuryFee : 2
}

export const cfmmTezFa2TokenStorage: cfmmTezFa2TokenStorageType = {

    admin               : bob.pkh,
    config              : config,
  
    cashPool            : new BigNumber(0),

    tokenName           : "",
    tokenAddress        : zeroAddress,
    tokenPool           : new BigNumber(2000000000),  // init token pool to 2000 USDM tokens
    tokenId             : new BigNumber(0),

    lpTokenAddress      : zeroAddress,
    lpTokensTotal       : new BigNumber(1),
    pendingPoolUpdates  : new BigNumber(0),

    lastOracleUpdate    : new Date(),
    usdmTokenAddress    : zeroAddress,
    treasuryAddress     : zeroAddress
}
