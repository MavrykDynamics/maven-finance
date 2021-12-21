import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

export type delegationStorageType = {
  admin: string;
  config: {};
  breakGlassConfig: {};

  delegateLedger: MichelsonMap<MichelsonMapKey, unknown>;
  satelliteLedger: MichelsonMap<MichelsonMapKey, unknown>;

  doormanAddress: string;
  governanceAddress: string; 
};
