import { MichelsonMap } from "@taquito/michelson-encoder";
import { alice } from '../scripts/sandbox/accounts'
import { farmFactoryStorageType } from "../test/types/farmFactoryStorageType";

export const farmFactoryStorage: farmFactoryStorageType = {
  admin: alice.pkh,
  generalContracts: MichelsonMap.fromLiteral({}),
  whitelistContracts: MichelsonMap.fromLiteral({}),

  breakGlassConfig: {
    createFarmIsPaused: false,
    untrackFarmIsPaused: false,
  },

  createdFarms: [],
};
