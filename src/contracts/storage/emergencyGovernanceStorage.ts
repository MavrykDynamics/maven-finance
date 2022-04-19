import { MichelsonMap } from '@taquito/michelson-encoder'
import { BigNumber } from 'bignumber.js'

const { bob } = require('../scripts/sandbox/accounts')

import { MVK, zeroAddress } from "../test/helpers/Utils";

import { emergencyGovernanceStorageType } from '../test/types/emergencyGovernanceStorageType'

const config = {
  decimals : 4,
  voteExpiryDays: 3,
  requiredFeeMutez: 10000000,
  stakedMvkPercentageRequired: 10000,
  minStakedMvkRequiredToVote: MVK(5),
  minStakedMvkRequiredToTrigger: MVK(10)
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
  metadata                            : metadata,
  generalContracts                    : MichelsonMap.fromLiteral({}),

  emergencyGovernanceLedger           : MichelsonMap.fromLiteral({}),
  currentEmergencyGovernanceId        : new BigNumber(0),
  nextEmergencyGovernanceProposalId   : new BigNumber(1),

  lambdaLedger                        : MichelsonMap.fromLiteral({}),
}
