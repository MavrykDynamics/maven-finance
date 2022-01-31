import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";

export type farmFactoryStorageType = {
  admin: string;

  generalContracts: MichelsonMap<MichelsonMapKey, unknown>;
  whitelistContracts: MichelsonMap<MichelsonMapKey, unknown>;
  
  createdFarms: Array<unknown>;
};
