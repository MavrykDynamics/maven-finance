import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";

export type farmFactoryStorageType = {
  admin: string;

  generalContracts: MichelsonMap<MichelsonMapKey, unknown>;
  whitelistContracts: MichelsonMap<MichelsonMapKey, unknown>;

  breakGlassConfig: {
    createFarmIsPaused: boolean;
    untrackFarmIsPaused: boolean;
  }
  
  createdFarms: Array<unknown>;
};