import { MichelsonMap, MichelsonMapKey } from "@mavrykdynamics/taquito-michelson-encoder";
import { BigNumber } from "bignumber.js";

export type mvnFaucetStorageType = {
  
    mvnTokenAddress           : string;
    fakeUsdtTokenAddress      : string;
    metadata                  : MichelsonMap<MichelsonMapKey, unknown>;
    mvnAmountPerUser          : BigNumber;
    fakeUsdtAmountPerUser     : BigNumber;
    requesters                : MichelsonMap<MichelsonMapKey, unknown>;
};
