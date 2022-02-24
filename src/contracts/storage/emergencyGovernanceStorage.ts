import { MichelsonMap } from '@taquito/michelson-encoder'

import { BigNumber } from 'bignumber.js'

const { alice } = require('../scripts/sandbox/accounts')

import { zeroAddress } from '../test/helpers/Utils'

import { emergencyGovernanceStorageType } from '../test/types/emergencyGovernanceStorageType'

const config = {
  voteExpiryDays: 3,
  stakedMvkPercentageRequired: 10000,
  requiredFee: 10000000,
}

export const emergencyGovernanceStorage: emergencyGovernanceStorageType = {
  admin: alice.pkh,
  config: config,

  generalContracts: MichelsonMap.fromLiteral({}),

  emergencyGovernanceLedger: MichelsonMap.fromLiteral({}),

  tempMvkTotalSupply: new BigNumber(1000000000),
  currentEmergencyGovernanceId: new BigNumber(0),
  nextEmergencyGovernanceProposalId: new BigNumber(1),
}
