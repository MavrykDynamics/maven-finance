import { MichelsonMap } from "@taquito/michelson-encoder";
import { BigNumber } from "bignumber.js";

import { bob } from '../scripts/sandbox/accounts'
import { governanceProxyNodeStorageType } from "../test/types/governanceProxyNodeStorageType";

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

export const governanceProxyNodeStorage: governanceProxyNodeStorageType = {

    admin                     : bob.pkh,
    metadata                  : metadata,
    
    mvkTokenAddress           : "",
    governanceAddress         : bob.pkh,
    
    whitelistContracts        : MichelsonMap.fromLiteral({}),
    generalContracts          : MichelsonMap.fromLiteral({}),
    whitelistTokenContracts   : MichelsonMap.fromLiteral({}),

    proxyLambdaLedger         : MichelsonMap.fromLiteral({}),
    lambdaLedger              : MichelsonMap.fromLiteral({})

};