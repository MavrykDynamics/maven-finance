import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";
import { BigNumber } from "bignumber.js";

export type lpTokenUsdmXtzStorageType = {
  admin               : string
  metadata            : MichelsonMap<MichelsonMapKey, unknown>
  token_metadata      : MichelsonMap<MichelsonMapKey, unknown>
  totalSupply         : BigNumber

  whitelistContracts  : MichelsonMap<MichelsonMapKey, unknown>

  ledger              : MichelsonMap<MichelsonMapKey, unknown>
  operators           : MichelsonMap<MichelsonMapKey, unknown>
};
