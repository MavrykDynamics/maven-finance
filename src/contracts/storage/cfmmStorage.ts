import { MichelsonMap } from '@taquito/michelson-encoder'

import { BigNumber } from 'bignumber.js'

const { alice, bob } = require('../scripts/sandbox/accounts')

import { zeroAddress } from '../test/helpers/Utils'

import {cfmmStorageType } from '../test/types/cfmmStorageType'

export const cfmmStorage: cfmmStorageType = {

    admin: bob.pkh,
  
    cashTokenAddress : zeroAddress,
    cashTokenId : new BigNumber(0),
    cashPool : new BigNumber(0),

    lpTokenAddress : zeroAddress,
    lpTokensTotal : new BigNumber(0),
    pendingPoolUpdates : new BigNumber(2),

    tokenName : "",
    tokenAddress : zeroAddress,
    tokenPool : new BigNumber(0),

    tokenId : new BigNumber(0),

    lastOracleUpdate : new Date(),
    consumerEntrypoint : zeroAddress,

    usdmTokenAddress : zeroAddress
}
