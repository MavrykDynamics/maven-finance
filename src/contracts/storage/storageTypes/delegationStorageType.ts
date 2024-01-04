import { MichelsonMap, MichelsonMapKey } from '@mavrykdynamics/taquito-michelson-encoder'
import { BigNumber } from "bignumber.js"

export type delegationStorageType = {
    
    admin               : string;
    mvnTokenAddress     : string;
    governanceAddress   : string;
    metadata            : MichelsonMap<MichelsonMapKey, unknown>;

    config              : {}
    breakGlassConfig    : {}

    whitelistContracts  : MichelsonMap<MichelsonMapKey, unknown>
    generalContracts    : MichelsonMap<MichelsonMapKey, unknown>

    delegateLedger      : MichelsonMap<MichelsonMapKey, unknown>
    satelliteLedger     : MichelsonMap<MichelsonMapKey, unknown>
    satelliteCounter    : BigNumber
    satelliteRewardsLedger: MichelsonMap<MichelsonMapKey, unknown>

    lambdaLedger        : MichelsonMap<MichelsonMapKey, unknown>
  
}