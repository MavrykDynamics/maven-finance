import { MichelsonMap } from "@taquito/michelson-encoder";
import { bob } from '../scripts/sandbox/accounts'
import { BigNumber } from "bignumber.js";
import { governanceProxyStorageType } from "../test/types/governanceProxyStorageType";

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
  governanceAddress         : bob.pkh,
  metadata                  : metadata,
  
  mvkTokenAddress           : "",
  whitelistContracts        : MichelsonMap.fromLiteral({}),
  generalContracts          : MichelsonMap.fromLiteral({}),
  whitelistTokenContracts   : MichelsonMap.fromLiteral({}),

  proxyLambdaLedger         : MichelsonMap.fromLiteral({}),

  lambdaLedger              : MichelsonMap.fromLiteral({})
};