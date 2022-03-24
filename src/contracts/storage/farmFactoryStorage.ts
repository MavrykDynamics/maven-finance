import { MichelsonMap } from "@taquito/michelson-encoder";
import { bob } from '../scripts/sandbox/accounts'
import { BigNumber } from "bignumber.js";
import { farmFactoryStorageType } from "../test/types/farmFactoryStorageType";

export const farmFactoryStorage: farmFactoryStorageType = {
  admin: bob.pkh,
  mvkTokenAddress: "",
  
  generalContracts: MichelsonMap.fromLiteral({}),
  whitelistContracts: MichelsonMap.fromLiteral({}),

  breakGlassConfig: {
    createFarmIsPaused: false,
    trackFarmIsPaused: false,
    untrackFarmIsPaused: false,
  },

  trackedFarms: [],
  blocksPerMinute: new BigNumber(2)
};