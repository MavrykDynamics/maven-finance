import { MichelsonMap } from '@taquito/michelson-encoder'
import { BigNumber } from 'bignumber.js'

const { alice } = require('../scripts/sandbox/accounts')

import { MVK, zeroAddress } from "../test/helpers/Utils";

import { emergencyGovernanceStorageType } from '../test/types/emergencyGovernanceStorageType'

const config = {
  decimals : 5,
  voteExpiryDays: 3,
  requiredFee: 10000000,
  stakedMvkPercentageRequired: 10000,
  minStakedMvkRequiredToVote: MVK(5),
  minStakedMvkRequiredToTrigger: MVK(10)
}

export const emergencyGovernanceStorage: emergencyGovernanceStorageType = {
  admin: alice.pkh,
  mvkTokenAddress: "",
  config: config,
  mvkTokenAddress : zeroAddress,

  generalContracts: MichelsonMap.fromLiteral({}),

  emergencyGovernanceLedger: MichelsonMap.fromLiteral({}),

  tempStakedMvkTotalSupply: new BigNumber(0),
  currentEmergencyGovernanceId: new BigNumber(0),
  nextEmergencyGovernanceProposalId: new BigNumber(1),
}
