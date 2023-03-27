import { MichelsonMap } from "@taquito/michelson-encoder"
import { bob } from '../scripts/sandbox/accounts'
import { BigNumber } from "bignumber.js"
import { vaultFactoryStorageType } from "./storageTypes/vaultFactoryStorageType"

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        name: 'MAVRYK Vault Factory Contract',
        version: 'v1.0.0',
        authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
        }),
        'ascii',
    ).toString('hex'),
})


const vaultMetadata = MichelsonMap.fromLiteral({
    '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        name: 'MAVRYK Vault Contract',
        version: 'v1.0.0',
        authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
        }),
        'ascii',
    ).toString('hex'),
})

export const vaultFactoryStorage: vaultFactoryStorageType = {
    
    admin                 : bob.pkh,
    metadata              : metadata,
    vaultMetadata         : vaultMetadata,
    config                : {
        vaultNameMaxLength     : new BigNumber(100)
    },

    mvkTokenAddress       : "",
    governanceAddress     : "",
    
    generalContracts      : MichelsonMap.fromLiteral({}),
    whitelistContracts    : MichelsonMap.fromLiteral({}),

    breakGlassConfig      : {
        createVaultIsPaused  : false
    },

    vaultCounter          : new BigNumber(1),

    lambdaLedger          : MichelsonMap.fromLiteral({}),
    vaultLambdaLedger      : MichelsonMap.fromLiteral({})

};