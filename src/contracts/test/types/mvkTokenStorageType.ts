import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";
import { BigNumber } from "bignumber.js";

export type mvkStorageType = {
  admin: string;

  contractAddresses: MichelsonMap<MichelsonMapKey, unknown>;
  whitelistContracts: MichelsonMap<MichelsonMapKey, unknown>;

  metadata: MichelsonMap<MichelsonMapKey, unknown>;
  ledger: MichelsonMap<MichelsonMapKey, unknown>;
  token_metadata: MichelsonMap<MichelsonMapKey, unknown>;

  totalSupply: BigNumber;
};
