import { MichelsonMap } from "@mavrykdynamics/taquito-michelson-encoder"
import { bob } from '../scripts/sandbox/accounts'
import { vaultStorageType } from "./storageTypes/vaultStorageType"

const vaultHandle = {
    id     : 1,   
    owner  : bob.pkh,  
}

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        name: 'MAVRYK Vault',
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
    admin                       : bob.pkh,
    handle                      : vaultHandle,
    name                        : "newVault",
    depositors                  : "any",
};
