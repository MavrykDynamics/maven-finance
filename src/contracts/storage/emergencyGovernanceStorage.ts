import { MichelsonMap } from '@taquito/michelson-encoder'
import { BigNumber } from 'bignumber.js'

import { bob } from '../scripts/sandbox/accounts'
import { MVK } from "../test/helpers/Utils"
import { emergencyGovernanceStorageType } from './storageTypes/emergencyGovernanceStorageType'

const config = {
    decimals                        : 4,
    durationInMinutes               : 4320, // 3 days
    requiredFeeMutez                : 10000000,
    stakedMvkPercentageRequired     : 5000,         // prod should be 10% or 1000   
    minStakedMvkRequiredToVote      : MVK(1),
    minStakedMvkRequiredToTrigger   : MVK(11),
    proposalTitleMaxLength          : 400,
    proposalDescMaxLength           : 400,
}

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        name: 'MAVRYK Emergency Governance Contract',
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

export const emergencyGovernanceStorage: emergencyGovernanceStorageType = {
  
    admin                               : bob.pkh,
    config                              : config,
    mvkTokenAddress                     : "",
    governanceAddress                   : "",
    metadata                            : metadata,
    whitelistContracts                  : MichelsonMap.fromLiteral({}),
    generalContracts                    : MichelsonMap.fromLiteral({}),

    emergencyGovernanceLedger           : MichelsonMap.fromLiteral({}),
    emergencyGovernanceVoters           : MichelsonMap.fromLiteral({}),

    currentEmergencyGovernanceId        : new BigNumber(0),
    nextEmergencyGovernanceId           : new BigNumber(1),

    lambdaLedger                        : MichelsonMap.fromLiteral({}),
    
}
