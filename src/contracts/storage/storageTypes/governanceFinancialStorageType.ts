import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder"
import { BigNumber } from "bignumber.js"

export type governanceFinancialStorageType = {

    admin                               : string;
    mvkTokenAddress                     : string;
    governanceAddress                   : string;
    metadata                            : MichelsonMap<MichelsonMapKey, unknown>;

    config                              : {};

    whitelistContracts                  : MichelsonMap<MichelsonMapKey, unknown>;
    whitelistTokenContracts             : MichelsonMap<MichelsonMapKey, unknown>;
    generalContracts                    : MichelsonMap<MichelsonMapKey, unknown>;

    financialRequestLedger              : MichelsonMap<MichelsonMapKey, unknown>;
    financialRequestVoters              : MichelsonMap<MichelsonMapKey, unknown>;
    financialRequestCounter             : BigNumber;

    lambdaLedger                        : MichelsonMap<MichelsonMapKey, unknown>;
  
};