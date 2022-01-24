import { MichelsonMap } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

const { alice } = require('../scripts/sandbox/accounts')

import { zeroAddress } from "../test/helpers/Utils";

import { doormanStorageType } from "../test/types/doormanStorageType";

export const doormanStorage: doormanStorageType = {

  admin: alice.pkh,

  whitelistContracts : MichelsonMap.fromLiteral({}),
  generalContracts: MichelsonMap.fromLiteral({}),

  breakGlassConfig: {
    stakeIsPaused           : false,
    unstakeIsPaused         : false
  },
  userStakeRecordsLedger: MichelsonMap.fromLiteral({}),
  userStakeBalanceLedger: MichelsonMap.fromLiteral({}),

  tempMvkTotalSupply: new BigNumber(1000000000),
  stakedMvkTotalSupply: new BigNumber(0),

  logExitFee: new BigNumber(1),
  logFinalAmount: new BigNumber(1),
};
