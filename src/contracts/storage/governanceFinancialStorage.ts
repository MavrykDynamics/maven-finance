import { MichelsonMap } from '@mavrykdynamics/taquito-michelson-encoder'
import { BigNumber } from 'bignumber.js'
import { bob } from '../scripts/sandbox/accounts'
import { zeroAddress } from '../test/helpers/Utils'
import { governanceFinancialStorageType } from './storageTypes/governanceFinancialStorageType'

const config = {
    approvalPercentage                  : 6700,
    financialRequestDurationInDays      : 3,
}

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('mavryk-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        name: 'MAVEN Financial Governance Contract',
        version: 'v1.0.0',
        authors: ['MAVEN Dev Team <info@mavryk.io>'],
        }),
        'ascii',
    ).toString('hex'),
})

export const governanceFinancialStorage: governanceFinancialStorageType = {
  
    admin                               : bob.pkh,
    mvnTokenAddress                     : "",
    governanceAddress                   : zeroAddress,
    metadata                            : metadata,
    config                              : config,
    
    whitelistContracts                  : MichelsonMap.fromLiteral({}),
    whitelistTokenContracts             : MichelsonMap.fromLiteral({}),
    generalContracts                    : MichelsonMap.fromLiteral({}),

    financialRequestLedger              : MichelsonMap.fromLiteral({}),
    financialRequestVoters              : MichelsonMap.fromLiteral({}),
    financialRequestCounter             : new BigNumber(1),
        
    lambdaLedger                        : MichelsonMap.fromLiteral({}),
};