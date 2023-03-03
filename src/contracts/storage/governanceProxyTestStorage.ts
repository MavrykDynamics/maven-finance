import { governanceProxyStorageType } from "../test/types/governanceProxyTestStorageType";
import { MichelsonMap } from "@taquito/michelson-encoder";
import { BigNumber } from "bignumber.js";

import { bob } from '../scripts/sandbox/accounts'

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