import { MichelsonMap } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

const { bob } = require('../scripts/sandbox/accounts')

import { zeroAddress } from "../test/helpers/Utils";

import { treasuryFactoryStorageType } from "../test/types/treasuryFactoryStorageType";


const breakGlassConfig = {
    createTreasuryIsPaused   : false,
    trackTreasuryIsPaused    : false,
    untrackTreasuryIsPaused  : false
}

export const treasuryFactoryStorage: treasuryFactoryStorageType = {
  admin: bob.pkh,
  mvkTokenAddress: "",

  trackedTreasuries: [],
  breakGlassConfig : breakGlassConfig,

  whitelistContracts : MichelsonMap.fromLiteral({}),
  whitelistTokenContracts : MichelsonMap.fromLiteral({}),
  generalContracts: MichelsonMap.fromLiteral({})

};
