import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

export type councilStorageType = {
  admin: string;
  mvkTokenAddress: string;
  metadata: MichelsonMap<MichelsonMapKey, unknown>;

  config: {};
  councilMembers: MichelsonMap<MichelsonMapKey, unknown>;

  whitelistContracts: MichelsonMap<MichelsonMapKey, unknown>;
  generalContracts: MichelsonMap<MichelsonMapKey, unknown>;

  councilActionsLedger: MichelsonMap<MichelsonMapKey, unknown>;

  actionCounter: BigNumber;
};
