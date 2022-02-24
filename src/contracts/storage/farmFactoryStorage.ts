import { MichelsonMap } from "@taquito/michelson-encoder";
import { alice } from '../scripts/sandbox/accounts'
import { BigNumber } from "bignumber.js";
import { farmFactoryStorageType } from "../test/types/farmFactoryStorageType";

export const farmFactoryStorage: farmFactoryStorageType = {
  admin: alice.pkh,
  generalContracts: MichelsonMap.fromLiteral({}),
  whitelistContracts: MichelsonMap.fromLiteral({}),

  breakGlassConfig: {
    createFarmIsPaused: false,
    trackFarmIsPaused: false,
    untrackFarmIsPaused: false,
  },

  createdFarms: [],
  blocksPerMinute: new BigNumber(2)
};