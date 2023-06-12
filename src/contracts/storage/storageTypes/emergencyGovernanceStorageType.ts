import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder"
import { BigNumber } from "bignumber.js"

export type emergencyGovernanceStorageType = {
    
    admin                                 : string;
    config                                : {};
    mvkTokenAddress                       : string;
    governanceAddress                     : string;
    metadata                              : MichelsonMap<MichelsonMapKey, unknown>;
    
    whitelistContracts                    : MichelsonMap<MichelsonMapKey, unknown>
    generalContracts                      : MichelsonMap<MichelsonMapKey, unknown>;

    emergencyGovernanceLedger             : MichelsonMap<MichelsonMapKey, unknown>;
    emergencyGovernanceVoters             : MichelsonMap<MichelsonMapKey, unknown>;

    currentEmergencyGovernanceId          : BigNumber;
    nextEmergencyGovernanceId             : BigNumber;

    lambdaLedger                          : MichelsonMap<MichelsonMapKey, unknown>;

};
