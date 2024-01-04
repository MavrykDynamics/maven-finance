import { MichelsonMap } from '@mavrykdynamics/taquito-michelson-encoder'
import { BigNumber } from 'bignumber.js'

import { bob } from '../scripts/sandbox/accounts'
import { MVN } from "../test/helpers/Utils"
import { emergencyGovernanceStorageType } from './storageTypes/emergencyGovernanceStorageType'

const config = {
    decimals                        : 4,
    durationInMinutes               : 4320, // 3 days
    requiredFeeMutez                : 10000000,
    stakedMvnPercentageRequired     : 5000,         // prod should be 10% or 1000   
    minStakedMvnRequiredToVote      : MVN(1),
    minStakedMvnRequiredToTrigger   : MVN(11),
    proposalTitleMaxLength          : 400,
    proposalDescMaxLength           : 400,
}

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('tezos-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        name: 'MAVEN Emergency Governance Contract',
        version: 'v1.0.0',
        authors: ['MAVEN Dev Team <info@mavryk.io>'],
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
    mvnTokenAddress                     : "",
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
