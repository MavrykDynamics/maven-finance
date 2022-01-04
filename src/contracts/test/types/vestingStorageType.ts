import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";
import { BigNumber } from "bignumber.js";

export type vestingStorageType = {
  admin  : string;
  config : {};

  whitelistContracts: MichelsonMap<MichelsonMapKey, unknown>;
  contractAddresses: MichelsonMap<MichelsonMapKey, unknown>;

  claimLedger  : MichelsonMap<MichelsonMapKey, unknown>;
  vesteeLedger : MichelsonMap<MichelsonMapKey, unknown>;

  totalVestedAmount : BigNumber; 

  // delegationAddress : string;
  // doormanAddress    : string;
  // governanceAddress : string;
  // mvkTokenAddress   : string;
  // councilAddress   : string;

  tempBlockLevel : BigNumber;

};
