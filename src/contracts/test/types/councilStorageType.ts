import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

export type councilStorageType = {
  admin: string;
  councilMembers: Array<string>;

  whitelistContracts: MichelsonMap<MichelsonMapKey, unknown>;
  contractAddresses: MichelsonMap<MichelsonMapKey, unknown>;
    
};
