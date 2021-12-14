import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

export type emergencyGovernanceStorageType = {
  admin: string;
  config: {};

  emergencyGovernanceLedger: MichelsonMap<MichelsonMapKey, unknown>;

  mvkTokenAddress: string;
  breakGlassContractAddress: string;
  governanceContractAddress: string;
  treasuryAddress: string;

  tempMvkTotalSupply: BigNumber;
  currentEmergencyGovernanceId: BigNumber;
  nextEmergencyGovernanceProposalId: BigNumber;

};
