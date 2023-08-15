import { MichelsonMap } from "@taquito/michelson-encoder"
import { bob } from '../scripts/sandbox/accounts'
import { BigNumber } from "bignumber.js"
import { farmFactoryStorageType } from "./storageTypes/farmFactoryStorageType"

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        name: 'MAVRYK Farm Factory Contract',
        version: 'v1.0.0',
        authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
        }),
        'ascii',
    ).toString('hex'),
})

export const farmFactoryStorage: farmFactoryStorageType = {
    
    admin                 : bob.pkh,
    metadata              : metadata,
    mvkTokenAddress       : "",
    governanceAddress     : "",
    config                : {
        farmNameMaxLength     : new BigNumber(100)
    },
    breakGlassConfig      : {
        createFarmIsPaused  : false,
        trackFarmIsPaused   : false,
        untrackFarmIsPaused : false,
    },
    
    generalContracts      : MichelsonMap.fromLiteral({}),
    whitelistContracts    : MichelsonMap.fromLiteral({}),

    trackedFarms          : [],

    lambdaLedger          : MichelsonMap.fromLiteral({}),
    farmLambdaLedger      : MichelsonMap.fromLiteral({}),
    mFarmLambdaLedger     : MichelsonMap.fromLiteral({})

};