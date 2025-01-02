import { MichelsonMap, MichelsonMapKey } from "@mavrykdynamics/taquito-michelson-encoder";

export type mvnFaucetStorageType = {
  
    admin                       : string;
    metadata                    : MichelsonMap<MichelsonMapKey, unknown>;
    tokens                      : MichelsonMap<MichelsonMapKey, unknown>;
};
