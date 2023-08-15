import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";
import { BigNumber } from "bignumber.js";

export type mvkFaucetStorageType = {
  
    mvkTokenAddress           : string;
    metadata                  : MichelsonMap<MichelsonMapKey, unknown>;
    amountPerUser             : BigNumber;
    requesters                : MichelsonMap<MichelsonMapKey, unknown>;
};
