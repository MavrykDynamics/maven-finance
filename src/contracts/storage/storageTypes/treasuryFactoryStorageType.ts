import { MichelsonMap, MichelsonMapKey } from '@mavrykdynamics/taquito-michelson-encoder'
import { BigNumber } from 'bignumber.js'

export type treasuryFactoryStorageType = {
  
    admin                     : string;
    mvnTokenAddress           : string;
    governanceAddress         : string;
    config                : {
        treasuryNameMaxLength : BigNumber
    };
    metadata                  : MichelsonMap<MichelsonMapKey, unknown>;

    trackedTreasuries         : Array<unknown>;
    breakGlassConfig          : {};

    whitelistContracts        : MichelsonMap<MichelsonMapKey, unknown>;
    whitelistTokenContracts   : MichelsonMap<MichelsonMapKey, unknown>;
    generalContracts          : MichelsonMap<MichelsonMapKey, unknown>;

    lambdaLedger              : MichelsonMap<MichelsonMapKey, unknown>;
    treasuryLambdaLedger      : MichelsonMap<MichelsonMapKey, unknown>;
  
}
