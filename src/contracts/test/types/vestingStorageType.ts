import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

export type vestingStorageType = {
  admin  : string;
  config : {};

  claimLedger  : MichelsonMap<MichelsonMapKey, unknown>;
  vesteeLedger : MichelsonMap<MichelsonMapKey, unknown>;

  delegationAddress : string;
  doormanAddress    : string;
  governanceAddress : string;
  mvkTokenAddress   : string;

};
