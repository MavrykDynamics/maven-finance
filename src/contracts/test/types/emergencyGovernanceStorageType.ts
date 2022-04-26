import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

export type emergencyGovernanceStorageType = {
  
  admin                                 : string;
  config                                : {};
  mvkTokenAddress                       : string;
  governanceAddress                     : string;
  metadata                              : MichelsonMap<MichelsonMapKey, unknown>;
  generalContracts                      : MichelsonMap<MichelsonMapKey, unknown>;

  emergencyGovernanceLedger             : MichelsonMap<MichelsonMapKey, unknown>;
  currentEmergencyGovernanceId          : BigNumber;
  nextEmergencyGovernanceProposalId     : BigNumber;

  lambdaLedger                          : MichelsonMap<MichelsonMapKey, unknown>;

};
