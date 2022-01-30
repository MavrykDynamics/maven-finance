import { MichelsonMap } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

const { alice } = require('../scripts/sandbox/accounts')

import { zeroAddress } from "../test/helpers/Utils";

import { breakGlassStorageType } from "../test/types/breakGlassStorageType";

const config = {
    threshold                  : 3,
    actionExpiryDuration       : 5760,
    developerAddress           : zeroAddress,
    emergencyGovernanceAddress : zeroAddress,
}

export const breakGlassStorage: breakGlassStorageType = {
  admin: alice.pkh,
  config: config,

  generalContracts: MichelsonMap.fromLiteral({}),
  glassBroken: false,

  councilMembers: [],

  currentActionId: new BigNumber(0),
  nextActionId: new BigNumber(1),

  actionLedger: MichelsonMap.fromLiteral({}),
  flushLedger: MichelsonMap.fromLiteral({}),
}
