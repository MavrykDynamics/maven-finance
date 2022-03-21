import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

export type emergencyGovernanceStorageType = {
  admin: string;
  mvkTokenAddress: string;

  config: {};
  mvkTokenAddress: string;

  generalContracts: MichelsonMap<MichelsonMapKey, unknown>;

  emergencyGovernanceLedger: MichelsonMap<MichelsonMapKey, unknown>;

  tempStakedMvkTotalSupply: BigNumber;
  currentEmergencyGovernanceId: BigNumber;
  nextEmergencyGovernanceProposalId: BigNumber;

};
