import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

export type councilStorageType = {
  admin: string;
  councilMembers: Array<string>;

  vestingAddress: string;
  treasuryAddress: string;

  contractAddresses: MichelsonMap<MichelsonMapKey, unknown>;
  
};
