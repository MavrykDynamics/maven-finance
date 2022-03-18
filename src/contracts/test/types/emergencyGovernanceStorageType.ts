import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

export type emergencyGovernanceStorageType = {
  admin: string;
  config: {};
  mvkTokenAddress: string;

  generalContracts: MichelsonMap<MichelsonMapKey, unknown>;

  emergencyGovernanceLedger: MichelsonMap<MichelsonMapKey, unknown>;

  tempMvkTotalSupply: BigNumber;
  currentEmergencyGovernanceId: BigNumber;
  nextEmergencyGovernanceProposalId: BigNumber;

};
