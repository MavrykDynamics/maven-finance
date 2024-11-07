import { MichelsonMap } from '@mavrykdynamics/taquito-michelson-encoder'
import { BigNumber } from 'bignumber.js'

import { bob } from '../scripts/sandbox/accounts'
import { MVN } from "../test/helpers/Utils"
import { emergencyGovernanceStorageType } from './storageTypes/emergencyGovernanceStorageType'

const config = {
    decimals                        : 4,
    durationInMinutes               : 4320, // 3 days
    requiredFeeMumav                : 10000000,
    stakedMvnPercentageRequired     : 5000,         // prod should be 10% or 1000   
    minStakedMvnRequiredToVote      : MVN(1),
    minStakedMvnRequiredToTrigger   : MVN(11),
    proposalTitleMaxLength          : 400,
    proposalDescMaxLength           : 400,
}

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('mavryk-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        name: 'Maven Finance - Emergency Governance',
        version: 'v1.0.0',
        authors: ['Mavryk Dynamics <info@mavryk.io>'],
        homepage: "https://mavenfinance.io",
        license: {
            name: "MIT"
        },
        source: {
            tools: [
                "MavrykLIGO 0.60.0",
                "Flexmasa atlas-update-run"
            ],
            location: "https://github.com/MavrykDynamics/maven-finance"
        },
        interfaces: [ 'MIP-16' ],
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
