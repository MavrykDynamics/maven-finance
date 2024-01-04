import { MichelsonMap } from "@mavrykdynamics/taquito-michelson-encoder"
import { bob } from '../scripts/sandbox/accounts'
import { governanceProxyStorageType } from "./storageTypes/governanceProxyStorageType"

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        name: 'MAVEN Governance Proxy Contract',
        version: 'v1.0.0',
        authors: ['MAVEN Dev Team <info@mavryk.io>'],
        }),
        'ascii',
    ).toString('hex'),
})

export const governanceProxyStorage: governanceProxyStorageType = {

    admin                     : bob.pkh,
    metadata                  : metadata,
    
    mvnTokenAddress           : "",
    governanceAddress         : bob.pkh,

    lambdaLedger              : MichelsonMap.fromLiteral({})

};