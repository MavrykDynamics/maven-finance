import { MichelsonMap } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

import { zeroAddress } from '../test/helpers/Utils'
const { bob } = require('../scripts/sandbox/accounts')

import { tokenSaleStorageType } from "../test/types/tokenSaleStorageType";


const config = {
    buyOptions  : MichelsonMap.fromLiteral({
        1: {
            maxAmountPerWalletTotal     : 200000000,
            whitelistMaxAmountTotal     : 100000000,
            maxAmountCap                : 600000000000,
            vestingInMonths             : 6,
            tezPerToken                 : 100000,
            minTezAmount                : 30000000,
            totalBought                 : 0,
        },
        2: {
            maxAmountPerWalletTotal     : 200000000,
            whitelistMaxAmountTotal     : 100000000,
            maxAmountCap                : 630000000000,
            vestingInMonths             : 8,
            tezPerToken                 : 90000,
            minTezAmount                : 30000000,
            totalBought                 : 0,
        },
        3: {
            maxAmountPerWalletTotal     : 200000000,
            whitelistMaxAmountTotal     : 100000000,
            maxAmountCap                : 560000000000,
            vestingInMonths             : 12,
            tezPerToken                 : 80000,
            minTezAmount                : 30000000,
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

export const tokenSaleStorage: tokenSaleStorageType = {
  
  admin                     : bob.pkh,
  metadata                  : metadata,
  config                    : config,

  governanceAddress         : zeroAddress,
  treasuryAddress           : zeroAddress,
  mvkTokenAddress           : zeroAddress,

  whitelistedAddresses      : MichelsonMap.fromLiteral({}),
  tokenSaleLedger           : MichelsonMap.fromLiteral({}),

  whitelistStartTimestamp    : new Date(),
  whitelistEndTimestamp      : new Date(),

  tokenSaleHasStarted       : false,
  tokenSaleHasEnded         : false,
  tokenSalePaused           : false,

  tokenSaleEndTimestamp     : new Date(),
  tokenSaleEndBlockLevel    : new BigNumber(0)

};