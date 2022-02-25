import { MichelsonMap } from "@taquito/michelson-encoder";
import { BigNumber } from "bignumber.js";

const { alice } = require('../scripts/sandbox/accounts')

import { MVK } from "../test/helpers/Utils";

import { doormanStorageType } from "../test/types/doormanStorageType";

export const doormanStorage: doormanStorageType = {

  admin: alice.pkh,
  minMvkAmount: new BigNumber(MVK(1)),

  whitelistContracts : MichelsonMap.fromLiteral({}),
  generalContracts: MichelsonMap.fromLiteral({}),
  
  breakGlassConfig: {
    stakeIsPaused           : false,
    unstakeIsPaused         : false,
    compoundIsPaused        : false
  },
  userStakeBalanceLedger: MichelsonMap.fromLiteral({}),

  tempMvkTotalSupply: new BigNumber(0),
  tempMvkMaximumTotalSupply: new BigNumber(0),
  stakedMvkTotalSupply: new BigNumber(0),
  unclaimedRewards: new BigNumber(0),
  
  logExitFee: new BigNumber(1),
  logFinalAmount: new BigNumber(1),

  accumulatedFeesPerShare: new BigNumber(0)
};
