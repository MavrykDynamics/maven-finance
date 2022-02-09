import { MichelsonMap } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

const { alice } = require('../scripts/sandbox/accounts')

import { zeroAddress } from "../test/helpers/Utils";

import { treasuryStorageType } from "../test/types/treasuryStorageType";

const config = {
    maxProposalSize         : 6000000,
    minXtzAmount            : 0,
    maxXtzAmount            : 1000000000,
}

const breakGlassConfig = {
    transferIsPaused         : false,
    mintAndTransferIsPaused  : false,
    updateOperatorsIsPaused  : false
}

export const treasuryStorage: treasuryStorageType = {
  admin: alice.pkh,
  config: config,

  whitelistContracts : MichelsonMap.fromLiteral({}),
  whitelistTokenContracts : MichelsonMap.fromLiteral({}),
  generalContracts: MichelsonMap.fromLiteral({}),

  breakGlassConfig : breakGlassConfig

};
