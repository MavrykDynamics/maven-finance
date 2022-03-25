import { MichelsonMap } from "@taquito/michelson-encoder";
import { BigNumber } from "bignumber.js";

const { bob } = require('../scripts/sandbox/accounts')

import { MVK } from "../test/helpers/Utils";

import { doormanStorageType } from "../test/types/doormanStorageType";

export const doormanStorage: doormanStorageType = {
  admin: bob.pkh,
  mvkTokenAddress: "",

  minMvkAmount: new BigNumber(MVK(1)),

  whitelistContracts : MichelsonMap.fromLiteral({}),
  generalContracts: MichelsonMap.fromLiteral({}),
  
  breakGlassConfig: {
    stakeIsPaused           : false,
    unstakeIsPaused         : false,
    compoundIsPaused        : false
  },
  userStakeBalanceLedger: MichelsonMap.fromLiteral({}),

  stakedMvkTotalSupply: new BigNumber(0),
  unclaimedRewards: new BigNumber(0),
  
  logExitFee: new BigNumber(1),
  logFinalAmount: new BigNumber(1),

  accumulatedFeesPerShare: new BigNumber(0)
};
