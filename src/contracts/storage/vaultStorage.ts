import { MichelsonMap } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

const { alice } = require('../scripts/sandbox/accounts')

import { zeroAddress } from "../test/helpers/Utils";

import { vaultStorageType } from "../test/types/vaultStorageType";

const vaultHandle = {
    id     : 1,   
    owner  : alice.pkh,  
}

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        name: 'Alice\'s MAVRYK Vault',
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

export const vaultStorage: vaultStorageType = {
    
    admin                       : alice.pkh,
    metadata                    : metadata,

    governanceAddress           : zeroAddress,
    breakGlassConfig            : {},

    whitelistContracts          : MichelsonMap.fromLiteral({}),
    generalContracts            : MichelsonMap.fromLiteral({}),

    handle                      : vaultHandle,
    depositors                  : MichelsonMap.fromLiteral({}),
    collateralTokenAddresses    : MichelsonMap.fromLiteral({}),

    lambdaLedger                : MichelsonMap.fromLiteral({}),

};
