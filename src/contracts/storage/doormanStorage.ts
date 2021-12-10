import { MichelsonMap } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

const { alice } = require('../scripts/sandbox/accounts')

import { zeroAddress } from "../test/helpers/Utils";

import { DoormanStorage } from "../test/types/doormanType";

export const doormanStorage: DoormanStorage = {

  admin: alice.pkh,
  
  breakGlassConfig: {
    stakeIsPaused           : false,
    unstakeIsPaused         : false
  },
  userStakeRecordsLedger: MichelsonMap.fromLiteral({}),
  userStakeBalanceLedger: MichelsonMap.fromLiteral({}),
  
  delegationAddress: zeroAddress,
  exitFeePoolAddress: zeroAddress,
  mvkTokenAddress: zeroAddress,

  tempMvkTotalSupply: new BigNumber(1000000000),
  tempVMvkTotalSupply: new BigNumber(1000000000),
  
  stakedMvkTotalSupply: new BigNumber(0),
  logExitFee: new BigNumber(1),
  logFinalAmount: new BigNumber(1),
};
