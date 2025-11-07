import { MichelsonMap } from "@mavrykdynamics/taquito-michelson-encoder"
import { bob } from '../scripts/sandbox/accounts'
import { vaultStorageType } from "./storageTypes/vaultStorageType"

const vaultHandle = {
    id     : 1,   
    owner  : bob.pkh,  
}

export const vaultStorage: vaultStorageType = {
    admin                       : bob.pkh,
    handle                      : vaultHandle,
    name                        : "newVault",
    depositors                  : "any",
};
