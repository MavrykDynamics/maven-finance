import { MichelsonMap } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";
import { zeroAddress } from "test/helpers/Utils";

const { bob } = require('../scripts/sandbox/accounts')

import { tokenSaleStorageType } from "../test/types/tokenSaleStorageType";


const config = {

    maxAmountOptionOnePerWalletTotal      : 200000000,   // 200 tez
    maxAmountOptionTwoPerWalletTotal      : 200000000,
    maxAmountOptionThreePerWalletTotal    : 200000000,

    whitelistMaxAmountOptionOneTotal      : 100000000,   // 100 tez
    whitelistMaxAmountOptionTwoTotal      : 100000000,
    whitelistMaxAmountOptionThreeTotal    : 100000000,

    optionOneMaxAmountCap                 : 600000000000, // 6M tokens at 0.1 tez ea - 600,000 tez
    optionTwoMaxAmountCap                 : 630000000000, // 7M tokens at 0.09 tez ea - 630,000 tez    
    optionThreeMaxAmountCap               : 560000000000, // 7M tokens at 0.08 tez ea - 560,000 tez

    vestingOptionOneInMonths              : 6,
    vestingOptionTwoInMonths              : 8,
    vestingOptionThreeInMonths            : 12,

    optionOneTezPerToken                  : 100000,
    optionTwoTezPerToken                  : 90000,
    optionThreeTezPerToken                : 80000,

    minOptionOneAmountInTez               : 30000000,
    minOptionTwoAmountInTez               : 30000000,
    minOptionThreeAmountInTez             : 30000000,

    blocksPerMinute                       : 2
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

  tokenSaleLedger           : MichelsonMap.fromLiteral({}),
  whitelistedAddresses      : MichelsonMap.fromLiteral({}),

  whitelistStartDateTime    : new Date(),
  whitelistEndDateTime      : new Date(),

  tokenSaleHasStarted       : false,
  tokenSaleHasEnded         : false,
  tokenSalePaused           : false,

  tokenSaleEndTimestamp     : new Date(),
  tokenSaleEndBlockLevel    : new BigNumber(0),

  optionOneBoughtTotal      : new BigNumber(0),
  optionTwoBoughtTotal      : new BigNumber(0),
  optionThreeBoughtTotal    : new BigNumber(0)

};