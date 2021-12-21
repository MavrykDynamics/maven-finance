import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

export type breakGlassStorageType = {
  admin: string;
  config: {};

  contractAddresses: MichelsonMap<MichelsonMapKey, unknown>;
  glassBroken: boolean;

  councilMembers: [];

  currentActionId: BigNumber;
  nextActionId: BigNumber;

  actionLedger: MichelsonMap<MichelsonMapKey, unknown>;
  flushLedger: MichelsonMap<MichelsonMapKey, unknown>;
  
};
