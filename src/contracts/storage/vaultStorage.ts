import { MichelsonMap } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

const { alice } = require('../scripts/sandbox/accounts')

import { zeroAddress } from "../test/helpers/Utils";

import { vaultStorageType } from "../test/types/vaultStorageType";

const vaultHandle = {
    id     : 1,   
    owner  : alice.pkh,  
}

export const vaultStorage: vaultStorageType = {
  admin                     : alice.pkh,
  handle                    : vaultHandle,
  depositors                : MichelsonMap.fromLiteral({}),
  collateralTokenAddresses  : MichelsonMap.fromLiteral({}),

};
