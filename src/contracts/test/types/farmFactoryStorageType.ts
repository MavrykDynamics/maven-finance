import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";
import { BigNumber } from "bignumber.js";

export type farmFactoryStorageType = {
  admin: string;
  mvkTokenAddress: string;
  metadata: MichelsonMap<MichelsonMapKey, unknown>;

  generalContracts: MichelsonMap<MichelsonMapKey, unknown>;
  whitelistContracts: MichelsonMap<MichelsonMapKey, unknown>;

  breakGlassConfig: {
    createFarmIsPaused: boolean;
    trackFarmIsPaused: boolean;
    untrackFarmIsPaused: boolean;
  }
  
  trackedFarms: Array<unknown>;
  blocksPerMinute: BigNumber
};