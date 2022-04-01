import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";
import { BigNumber } from "bignumber.js";

export type vestingStorageType = {
  admin  : string;
  mvkTokenAddress: string;
  metadata: MichelsonMap<MichelsonMapKey, unknown>;

  config : {};

  whitelistContracts: MichelsonMap<MichelsonMapKey, unknown>;
  generalContracts: MichelsonMap<MichelsonMapKey, unknown>;

  claimLedger  : MichelsonMap<MichelsonMapKey, unknown>;
  vesteeLedger : MichelsonMap<MichelsonMapKey, unknown>;

  totalVestedAmount : BigNumber; 

  tempBlockLevel : BigNumber;

};
