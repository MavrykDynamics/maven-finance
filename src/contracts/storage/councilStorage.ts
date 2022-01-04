import { MichelsonMap } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

const { alice } = require('../scripts/sandbox/accounts')

import { zeroAddress } from "../test/helpers/Utils";

import { councilStorageType } from "../test/types/councilStorageType";


export const councilStorage: councilStorageType = {
  admin: alice.pkh,
  councilMembers: [],

  whitelistContracts: MichelsonMap.fromLiteral({}),
  contractAddresses: MichelsonMap.fromLiteral({}),

  vestingAddress: zeroAddress,
  treasuryAddress: zeroAddress,

  

};
