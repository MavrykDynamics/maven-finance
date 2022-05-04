import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

export type governanceSatelliteStorageType = {
  admin                               : string;
  metadata                            : MichelsonMap<MichelsonMapKey, unknown>;
  config                              : {};

  mvkTokenAddress                     : string;
  governanceProxyAddress              : string;

  whitelistContracts                  : MichelsonMap<MichelsonMapKey, unknown>;
  generalContracts                    : MichelsonMap<MichelsonMapKey, unknown>;

  governanceSatelliteLedger           : MichelsonMap<MichelsonMapKey, unknown>;
  governanceSatelliteSnapshotLedger   : MichelsonMap<MichelsonMapKey, unknown>;
  governanceSatelliteCounter          : BigNumber;

  snapshotStakedMvkTotalSupply        : BigNumber;

  lambdaLedger                        : MichelsonMap<MichelsonMapKey, unknown>;
};
