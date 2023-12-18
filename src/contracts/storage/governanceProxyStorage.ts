import { MichelsonMap } from "@mavrykdynamics/taquito-michelson-encoder"
import { bob } from '../scripts/sandbox/accounts'
import { governanceProxyStorageType } from "./storageTypes/governanceProxyStorageType"

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        name: 'MAVRYK Governance Proxy Contract',
        version: 'v1.0.0',
        authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
        }),
        'ascii',
    ).toString('hex'),
})

export const governanceProxyStorage: governanceProxyStorageType = {

    admin                     : bob.pkh,
    metadata                  : metadata,
    
    mvkTokenAddress           : "",
    governanceAddress         : bob.pkh,

    lambdaLedger              : MichelsonMap.fromLiteral({})

};