import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";
import { BigNumber } from "bignumber.js";

export type treasuryStorageType = {
  admin: string;
  config: {};

  whitelistContracts: MichelsonMap<MichelsonMapKey, unknown>;
  whitelistTokenContracts : MichelsonMap<MichelsonMapKey, unknown>;
  generalContracts: MichelsonMap<MichelsonMapKey, unknown>;
  
  
  breakGlassConfig: {};
};
