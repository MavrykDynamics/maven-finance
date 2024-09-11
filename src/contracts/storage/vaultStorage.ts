import { MichelsonMap } from "@mavrykdynamics/taquito-michelson-encoder"
import { bob } from '../scripts/sandbox/accounts'
import { vaultStorageType } from "./storageTypes/vaultStorageType"

const vaultHandle = {
    id     : 1,   
    owner  : bob.pkh,  
}

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('mavryk-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        name: 'MAVEN Vault',
        version: 'v1.0.0',
        authors: ['MAVEN Dev Team <info@mavryk.io>'],
        source: {
            tools: ['Ligo', 'Flexmasa'],
            location: 'https://ligolang.org/',
        },
        }),
        'ascii',
    ).toString('hex'),
})

export const vaultStorage: vaultStorageType = {
    admin                       : bob.pkh,
    handle                      : vaultHandle,
    name                        : "newVault",
    depositors                  : "any",
};
