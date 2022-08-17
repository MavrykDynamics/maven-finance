import { MichelsonMap } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

const { bob } = require('../scripts/sandbox/accounts')

import { zeroAddress } from "../test/helpers/Utils";

import { tokenPoolRewardStorageType } from "../test/types/tokenPoolRewardStorageType";

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
            name: 'MAVRYK Token Pool Reward',
            description: 'MAVRYK Token Pool Reward Contract',
            version: 'v1.0.0',
            authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
        }),
        'ascii',
    ).toString('hex'),
})

export const tokenPoolRewardStorage : tokenPoolRewardStorageType = {
    
    admin                     : bob.pkh,
    metadata                  : metadata,
    config                    : 0,  // test temp
    breakGlassConfig          : 0,  // test temp

    mvkTokenAddress           : zeroAddress,
    governanceAddress         : zeroAddress,

    whitelistContracts        : MichelsonMap.fromLiteral({}),
    whitelistTokenContracts   : MichelsonMap.fromLiteral({}),
    generalContracts          : MichelsonMap.fromLiteral({}),

    lambdaLedger              : MichelsonMap.fromLiteral({})
  
};
