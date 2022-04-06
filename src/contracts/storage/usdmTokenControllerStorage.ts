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

const targetLedger = MichelsonMap.fromLiteral({
  "usdm": 10 ** 24
})

const driftLedger = MichelsonMap.fromLiteral({
  "usdm": 0
})

export const usdmTokenControllerStorage: usdmTokenControllerStorageType = {
  admin                       : alice.pkh,
  config                      : config,

  whitelistTokenContracts     : MichelsonMap.fromLiteral({}),
  
  vaults                      : MichelsonMap.fromLiteral({}),
  vaultCounter                : new BigNumber(1),
  vaultLedger                 : MichelsonMap.fromLiteral({}),
  ownerLedger                 : MichelsonMap.fromLiteral({}),

  targetLedger                : targetLedger,
  driftLedger                 : driftLedger,
  lastDriftUpdateLedger       : MichelsonMap.fromLiteral({}),
  collateralTokenLedger       : MichelsonMap.fromLiteral({}),
  priceLedger                 : MichelsonMap.fromLiteral({}),

  usdmTokenAddress            : zeroAddress,
  cfmmAddressLedger           : MichelsonMap.fromLiteral({}),

};
