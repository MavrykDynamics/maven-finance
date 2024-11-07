import { MichelsonMap } from "@mavrykdynamics/taquito-michelson-encoder"
import { BigNumber } from "bignumber.js"
import { bob } from '../scripts/sandbox/accounts'
import { MVN } from "../test/helpers/Utils"
import { delegationStorageType } from "./storageTypes/delegationStorageType"

const config = {
    minimumStakedMvnBalance             : MVN(10), 
    delegationRatio                     : 1000,
    maxSatellites                       : 100,
    satelliteNameMaxLength              : 400,
    satelliteDescriptionMaxLength       : 1000,
    satelliteImageMaxLength             : 400,
    satelliteWebsiteMaxLength           : 400,
}

const breakGlassConfig = {
    delegateToSatelliteIsPaused         : false,
    undelegateFromSatelliteIsPaused     : false,
    registerAsSatelliteIsPaused         : false,
    unregisterAsSatelliteIsPaused       : false,
    updateSatelliteRecordIsPaused       : false
}

const metadata = MichelsonMap.fromLiteral({
    '': Buffer.from('mavryk-storage:data', 'ascii').toString('hex'),
    data: Buffer.from(
        JSON.stringify({
        name: 'Maven Finance - Delegation',
        version: 'v1.0.0',
        authors: ['Mavryk Dynamics <info@mavryk.io>'],
        homepage: "https://mavenfinance.io",
        license: {
            name: "MIT"
        },
        source: {
            tools: [
                "MavrykLIGO 0.60.0",
                "Flexmasa atlas-update-run"
            ],
            location: "https://github.com/MavrykDynamics/maven-finance"
        },
        interfaces: [ 'MIP-16' ],
        }),
        'ascii',
    ).toString('hex'),
})

// const satelliteLedger = MichelsonMap.fromLiteral({})
// const satelliteRewardsLedger = MichelsonMap.fromLiteral({})
// for(let i=0; i<1000; i++){
//   let mnemonic = eztz.crypto.generateMnemonic();
//   let password = Math.random().toString(36).substring(2,15);
//   let wallet = eztz.crypto.generateKeys(mnemonic, password);
//   satelliteLedger.set(wallet.pkh,{
//     status: new BigNumber(1),
//     stakedMvnBalance: new BigNumber(100000000000),
//     satelliteFee: new BigNumber(1000),
//     totalDelegatedAmount: new BigNumber(0),
//     name: 'Test'+wallet.pkh,
//     description: wallet.pkh+' description',
//     image: 'image',
//     website: 'website',
//     registeredDateTime: '2022-05-02T00:00:00.000Z'
//   });
//   satelliteRewardsLedger.set(wallet.pkh, {
//     unpaid: new BigNumber(0),
//     paid: new BigNumber(0),
//     participationRewardsPerShare: new BigNumber(0),
//     satelliteAccumulatedRewardsPerShare: new BigNumber(0),
//     satelliteReferenceAddress: wallet.pkh
//   })
// }

export const delegationStorage: delegationStorageType = {
  
    admin               : bob.pkh,
    mvnTokenAddress     : "",
    governanceAddress   : "",
    metadata            : metadata,
    
    config              : config,
    breakGlassConfig    : breakGlassConfig,

    whitelistContracts  : MichelsonMap.fromLiteral({}),
    generalContracts    : MichelsonMap.fromLiteral({}),
    
    delegateLedger      : MichelsonMap.fromLiteral({}),
    // satelliteLedger     : satelliteLedger,
    satelliteLedger     : MichelsonMap.fromLiteral({}),
    satelliteCounter    : new BigNumber(0),
    satelliteRewardsLedger: MichelsonMap.fromLiteral({}),
    // satelliteRewardsLedger  : satelliteRewardsLedger,

    lambdaLedger        : MichelsonMap.fromLiteral({}),
  
};