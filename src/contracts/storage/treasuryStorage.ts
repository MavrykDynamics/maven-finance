import { MichelsonMap } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

const { bob } = require('../scripts/sandbox/accounts')

import { zeroAddress } from "../test/helpers/Utils";

import { treasuryStorageType } from "../test/types/treasuryStorageType";

const config = {
    minXtzAmount            : 0,
    maxXtzAmount            : 1000000000,
}

const breakGlassConfig = {
    transferIsPaused         : false,
    mintAndTransferIsPaused  : false
}

export const treasuryStorage: treasuryStorageType = {
  admin: bob.pkh,
  mvkTokenAddress: "",

  config: config,

  whitelistContracts : MichelsonMap.fromLiteral({}),
  whitelistTokenContracts : MichelsonMap.fromLiteral({}),
  generalContracts: MichelsonMap.fromLiteral({}),

  breakGlassConfig : breakGlassConfig

};
