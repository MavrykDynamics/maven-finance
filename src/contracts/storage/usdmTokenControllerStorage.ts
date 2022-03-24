import { MichelsonMap } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

const { alice } = require('../scripts/sandbox/accounts')

import { zeroAddress } from "../test/helpers/Utils";

import { usdmTokenControllerStorageType } from "../test/types/usdmTokenControllerStorageType";

const config = {
    collateralRatio           : 2000,    // collateral ratio (%)
    liquidationRatio          : 1500,    // liquidation ratio (%)
    decimals                  : 3,       // decimals 
}

export const usdmTokenControllerStorage: usdmTokenControllerStorageType = {
  admin: alice.pkh,
  config: config,

  whitelistTokenContracts : MichelsonMap.fromLiteral({}),
  vaults: MichelsonMap.fromLiteral({}),

  targetLedger: MichelsonMap.fromLiteral({}),
  driftLedger: MichelsonMap.fromLiteral({}),
  lastDriftUpdateLedger: MichelsonMap.fromLiteral({}),
  collateralTokenLedger: MichelsonMap.fromLiteral({}),
  priceLedger: MichelsonMap.fromLiteral({}),

  usdmTokenAddress : zeroAddress,
  cfmmAddressLedger: MichelsonMap.fromLiteral({}),

};
