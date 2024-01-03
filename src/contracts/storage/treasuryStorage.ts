import { MichelsonMap } from "@taquito/michelson-encoder"
import { bob } from '../scripts/sandbox/accounts'
import { treasuryStorageType } from "./storageTypes/treasuryStorageType"

const config = {
    minMvnAmount            : 0,
    maxXtzAmount            : 1000000000,
}

const breakGlassConfig = {
    transferIsPaused                : false,
    mintAndTransferIsPaused         : false,
    updateTokenOperatorsIsPaused    : false
}

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
            name: 'MAVEN Farm Treasury',
            description: 'MAVEN Treasury Contract',
            version: 'v1.0.0',
            authors: ['MAVEN Dev Team <info@mavryk.io>'],
        }),
        'ascii',
    ).toString('hex'),
})

export const treasuryStorage: treasuryStorageType = {
    
    admin                     : bob.pkh,
    mvnTokenAddress           : "",
    governanceAddress         : "",
    name                      : "treasury",
    metadata                  : metadata,

    config                    : config,
    breakGlassConfig          : breakGlassConfig,

    whitelistContracts        : MichelsonMap.fromLiteral({}),
    whitelistTokenContracts   : MichelsonMap.fromLiteral({}),
    generalContracts          : MichelsonMap.fromLiteral({}),

    lambdaLedger              : MichelsonMap.fromLiteral({})
  
};
