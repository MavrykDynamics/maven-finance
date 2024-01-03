import { MichelsonMap, MichelsonMapKey } from '@taquito/michelson-encoder'

export type treasuryStorageType = {

    admin                     : string;
    mvnTokenAddress           : string;
    governanceAddress         : string;

    name                      : string;
    metadata                  : MichelsonMap<MichelsonMapKey, unknown>;

    config                    : {};
    breakGlassConfig          : {};

    whitelistContracts        : MichelsonMap<MichelsonMapKey, unknown>;
    whitelistTokenContracts   : MichelsonMap<MichelsonMapKey, unknown>;
    generalContracts          : MichelsonMap<MichelsonMapKey, unknown>;

    lambdaLedger              : MichelsonMap<MichelsonMapKey, unknown>;

}
