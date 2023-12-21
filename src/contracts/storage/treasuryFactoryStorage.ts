import { MichelsonMap } from "@taquito/michelson-encoder"
import { BigNumber } from "bignumber.js"
import { bob } from '../scripts/sandbox/accounts'
import { treasuryFactoryStorageType } from "./storageTypes/treasuryFactoryStorageType"

const breakGlassConfig = {
    createTreasuryIsPaused   : false,
    trackTreasuryIsPaused    : false,
    untrackTreasuryIsPaused  : false
}

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
            name: 'MAVEN Treasury Factory Contract',
            version: 'v1.0.0',
            authors: ['MAVEN Dev Team <contact@maven.finance>'],
        }),
        'ascii',
    ).toString('hex'),
})

export const treasuryFactoryStorage: treasuryFactoryStorageType = {
    
    admin                     : bob.pkh,
    mvnTokenAddress           : "",
    governanceAddress         : "",
    metadata                  : metadata,

    config                    : {
        treasuryNameMaxLength   : new BigNumber(100)
    },

    trackedTreasuries         : [],
    breakGlassConfig          : breakGlassConfig,

    whitelistContracts        : MichelsonMap.fromLiteral({}),
    whitelistTokenContracts   : MichelsonMap.fromLiteral({}),
    generalContracts          : MichelsonMap.fromLiteral({}),

    lambdaLedger              : MichelsonMap.fromLiteral({}),
    treasuryLambdaLedger      : MichelsonMap.fromLiteral({})

};
