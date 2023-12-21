import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";
import { BigNumber } from "bignumber.js";

export type mvnFaucetStorageType = {
  
    mvnTokenAddress           : string;
    metadata                  : MichelsonMap<MichelsonMapKey, unknown>;
    amountPerUser             : BigNumber;
    requesters                : MichelsonMap<MichelsonMapKey, unknown>;
};
