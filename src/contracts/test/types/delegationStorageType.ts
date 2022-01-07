import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

export type delegationStorageType = {
  admin: string;
  config: {};
  breakGlassConfig: {};

  whitelistContracts: MichelsonMap<MichelsonMapKey, unknown>;
  contractAddresses: MichelsonMap<MichelsonMapKey, unknown>;

  delegateLedger: MichelsonMap<MichelsonMapKey, unknown>;
  satelliteLedger: MichelsonMap<MichelsonMapKey, unknown>;

};
