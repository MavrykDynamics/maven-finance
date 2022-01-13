import { MichelsonMap } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

const { alice } = require('../scripts/sandbox/accounts')

import { zeroAddress } from "../test/helpers/Utils";

import { councilStorageType } from "../test/types/councilStorageType";

const config = {
  threshold                  : 3,       // 3 council members required 
  actionExpiryBlockLevels    : 5760,    // 2 days in block levels (2 * 60 * 24 * 2)
  actionExpiryDays           : 2        // 2 days
}

export const councilStorage: councilStorageType = {
  admin: alice.pkh,
  config: config,
  councilMembers: [],

  whitelistContracts: MichelsonMap.fromLiteral({}),
  contractAddresses: MichelsonMap.fromLiteral({}),

  councilActionsLedger: MichelsonMap.fromLiteral({}),

  thresholdSigners: new BigNumber(2),
  actionCounter: new BigNumber(0),

  tempString: "NULL"

};
