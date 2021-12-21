import { MichelsonMap } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

const { alice } = require('../scripts/sandbox/accounts')

import { zeroAddress } from "../test/helpers/Utils";

import { emergencyGovernanceStorageType } from "../test/types/emergencyGovernanceStorageType";

const config = {
    voteDuration                        : 5760,
    minStakedMvkPercentageForTrigger    : 10000,
    requiredFee                         : 10000000
}

export const emergencyGovernanceStorage: emergencyGovernanceStorageType = {
  admin: alice.pkh,
  config: config,

  emergencyGovernanceLedger: MichelsonMap.fromLiteral({}),
  
  mvkTokenAddress: zeroAddress,
  breakGlassContractAddress: zeroAddress,
  governanceContractAddress: zeroAddress,
  treasuryAddress: zeroAddress,

  tempMvkTotalSupply: new BigNumber(1000000000),
  currentEmergencyGovernanceId: new BigNumber(0),
  nextEmergencyGovernanceProposalId: new BigNumber(1),

};
