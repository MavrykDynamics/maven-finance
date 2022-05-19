import { MichelsonMap } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

const { bob } = require('../scripts/sandbox/accounts')

import { zeroAddress } from "../test/helpers/Utils";

import { treasuryStorageType } from "../test/types/treasuryStorageType";

const config = {
    minXtzAmount            : 0,
    maxXtzAmount            : 1000000000,
}

const breakGlassConfig = {
    transferIsPaused         : false,
    mintAndTransferIsPaused  : false
}

const metadata = MichelsonMap.fromLiteral({
  '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
  data: Buffer.from(
    JSON.stringify({
      name: 'MAVRYK Farm Treasury',
      description: 'MAVRYK Treasury Contract',
      version: 'v1.0.0',
      authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
    }),
    'ascii',
  ).toString('hex'),
})

export const treasuryStorage: treasuryStorageType = {
  admin                     : bob.pkh,
  mvkTokenAddress           : "",
  governanceAddress         : "",
  metadata                  : metadata,

  config                    : config,
  breakGlassConfig          : breakGlassConfig,

  whitelistContracts        : MichelsonMap.fromLiteral({}),
  whitelistTokenContracts   : MichelsonMap.fromLiteral({}),
  generalContracts          : MichelsonMap.fromLiteral({}),

  lambdaLedger              : MichelsonMap.fromLiteral({})
  
};
