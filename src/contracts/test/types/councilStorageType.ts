import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

export type councilStorageType = {
  admin: string;
  mvkTokenAddress: string;

  config: {};
  councilMembers: Array<string>;

  whitelistContracts: MichelsonMap<MichelsonMapKey, unknown>;
  generalContracts: MichelsonMap<MichelsonMapKey, unknown>;

  councilActionsLedger: MichelsonMap<MichelsonMapKey, unknown>;

  actionCounter: BigNumber;
};
