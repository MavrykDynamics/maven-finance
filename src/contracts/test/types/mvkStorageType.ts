import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";
import { BigNumber } from "bignumber.js";

export type mvkStorageType = {
  admin: string;
  whitelistContracts: Array<string>;
  metadata: MichelsonMap<MichelsonMapKey, unknown>;
  ledger: MichelsonMap<MichelsonMapKey, unknown>;
  token_metadata: MichelsonMap<MichelsonMapKey, unknown>;
  doormanAddress: string;
  totalSupply: BigNumber;
};
