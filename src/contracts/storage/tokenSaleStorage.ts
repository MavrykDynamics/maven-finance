import { MichelsonMap } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

import { MVK, zeroAddress } from '../test/helpers/Utils'
const { bob } = require('../scripts/sandbox/accounts')

import { tokenSaleStorageType } from "../test/types/tokenSaleStorageType";


const config = {
    vestingPeriodDurationSec  : new BigNumber(2628000), // 2628000 seconds in a month
    buyOptions                : MichelsonMap.fromLiteral({
        1: {
            maxAmountPerWalletTotal     : MVK(20000),
            whitelistMaxAmountTotal     : MVK(10000),
            maxAmountCap                : MVK(12000000),
            vestingPeriods              : 6,
            tokenXtzPrice               : 80000,
            minMvkAmount                : 30000000,
            totalBought                 : 0,
        },
        2: {
            maxAmountPerWalletTotal     : MVK(20000),
            whitelistMaxAmountTotal     : MVK(10000),
            maxAmountCap                : MVK(10000000),
            vestingPeriods              : 9,
            tokenXtzPrice               : 70000,
            minMvkAmount                : 30000000,
            totalBought                 : 0,
        },
        3: {
            maxAmountPerWalletTotal     : MVK(20000),
            whitelistMaxAmountTotal     : MVK(10000),
            maxAmountCap                : MVK(8000000),
            vestingPeriods              : 12,
            tokenXtzPrice               : 60000,
            minMvkAmount                : 30000000,
            totalBought                 : 0,
        }
    })
}

const metadata = MichelsonMap.fromLiteral({
  '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
  data: Buffer.from(
    JSON.stringify({
      name: 'MAVRYK Token Sale Contract',
      version: 'v1.0.0',
      authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
    }),
    'ascii',
  ).toString('hex'),
})

const currentTimestamp  = Math.round(new Date().getTime() / 1000)

export const tokenSaleStorage: tokenSaleStorageType = {
  
  admin                     : bob.pkh,
  metadata                  : metadata,
  config                    : config,

  governanceAddress         : zeroAddress,
  treasuryAddress           : zeroAddress,
  mvkTokenAddress           : zeroAddress,

  whitelistedAddresses      : MichelsonMap.fromLiteral({}),
  tokenSaleLedger           : MichelsonMap.fromLiteral({}),

  whitelistStartTimestamp   : currentTimestamp.toString(),
  whitelistEndTimestamp     : currentTimestamp.toString(),

  tokenSaleHasStarted       : false,
  tokenSaleHasEnded         : false,
  tokenSalePaused           : false,

  tokenSaleEndTimestamp     : currentTimestamp.toString(),
  tokenSaleEndBlockLevel    : new BigNumber(0)

};