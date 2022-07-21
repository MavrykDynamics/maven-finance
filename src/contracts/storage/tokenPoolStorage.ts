import { MichelsonMap } from "@taquito/michelson-encoder"

import { BigNumber } from "bignumber.js"

const { alice } = require('../scripts/sandbox/accounts')

import { zeroAddress } from "../test/helpers/Utils"

import { tokenPoolStorageType } from "../test/types/tokenPoolStorageType"

const config = {
  
    default : 100

}

const breakGlassConfig = {

    // Token Pool Entrypoints
    addLiquidityIsPaused        : false,
    removeLiquidityIsPaused     : false,

    // Lending Pool Entrypoints
    onBorrowIsPaused            : false,
    onRepayIsPaused             : false,
}

const metadata = MichelsonMap.fromLiteral({
  '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
  data: Buffer.from(
      JSON.stringify({
      name: 'MAVRYK Token Pool Contract',
      version: 'v1.0.0',
      authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
      source: {
          tools: ['Ligo', 'Flextesa'],
          location: 'https://ligolang.org/',
      },
      }),
      'ascii',
  ).toString('hex'),
})


export const tokenPoolStorage : tokenPoolStorageType = {
  
    admin                           : alice.pkh,
    metadata                        : metadata,
    config                          : config,
    breakGlassConfig                : breakGlassConfig,

    mvkTokenAddress                 : zeroAddress,
    governanceAddress               : zeroAddress,

    whitelistContracts              : MichelsonMap.fromLiteral({}),
    generalContracts                : MichelsonMap.fromLiteral({}),
    whitelistTokenContracts         : MichelsonMap.fromLiteral({}),
    
    tokenLedger                     : MichelsonMap.fromLiteral({}),

    lambdaLedger                    : MichelsonMap.fromLiteral({}),

}