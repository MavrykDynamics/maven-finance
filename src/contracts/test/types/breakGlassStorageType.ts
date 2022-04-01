import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

export type breakGlassStorageType = {
  admin: string;
  mvkTokenAddress: string;
  metadata: MichelsonMap<MichelsonMapKey, unknown>;

  config: {};
  glassBroken         : boolean;
  councilMembers      : Array<string>;
  developerAddress    : string;

  whitelistContracts  : MichelsonMap<MichelsonMapKey, unknown>;
  generalContracts    : MichelsonMap<MichelsonMapKey, unknown>;

  actionsLedger       : MichelsonMap<MichelsonMapKey, unknown>;
  actionCounter       : BigNumber;
};
