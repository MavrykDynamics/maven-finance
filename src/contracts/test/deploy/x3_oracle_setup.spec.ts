import { MichelsonMap } from '@mavrykdynamics/taquito-michelson-encoder'
import { BigNumber } from "bignumber.js"

import { Utils } from "../helpers/Utils"

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

// ------------------------------------------------------------------------------
// Contract Address
// ------------------------------------------------------------------------------

import contractDeployments from '../contractDeployments.json'

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import {alice, bob, eve, mallory, oscar, susie, trudy} from '../../scripts/sandbox/accounts'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Oracle Setup', async () => {
  
    var utils: Utils
    var tezos

    before('setup', async () => {
        try{
            
            utils = new Utils()
            await utils.init(bob.sk)
            
            //----------------------------
            // Retrieve all contracts
            //----------------------------

            const aggregatorFactoryInstance: any = await utils.tezos.contract.at(contractDeployments.aggregatorFactory.address);
            
            //----------------------------
            // For Oracle/Aggregator test net deployment if needed
            //----------------------------
        
            if(utils.network != "development"){
        
                console.log("Setup Oracles")

                const oracleMap = MichelsonMap.fromLiteral({
                    [alice.pkh]             : {
                                                oraclePublicKey: alice.pk,
                                                oraclePeerId: alice.peerId
                                            },
                    [eve.pkh]               : {
                                                oraclePublicKey: eve.pk,
                                                oraclePeerId: eve.peerId
                                            },
                    [susie.pkh]             : {
                                                oraclePublicKey: susie.pk,
                                                oraclePeerId: susie.peerId
                                            },
                    [oscar.pkh]             : {
                                                oraclePublicKey: oscar.pk,
                                                oraclePeerId: oscar.peerId
                                            },
                    [trudy.pkh]             : {
                                                oraclePublicKey: trudy.pk,
                                                oraclePeerId: trudy.peerId
                                            },
                });

                const btcUsdMetadata = Buffer.from(
                    JSON.stringify({
                        name: 'Maven Finance - BTC/USD Aggregator',
                        version: 'v1.0.0',
                        authors: ['Mavryk Dynamics <info@mavryk.io>'],
                        icon: 'ipfs://QmQ3mno4hNt9ENMUhVGFhv49RdnkPpJQmxwRMHRmAmrLaS',
                        category: 'cryptocurrency',
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
                ).toString('hex')

                const mvrkUsdMetadata = Buffer.from(
                    JSON.stringify({
                        name: 'Maven Finance - MVRK/USD Aggregator',
                        version: 'v1.0.0',
                        authors: ['Mavryk Dynamics <info@mavryk.io>'],
                        icon: 'ipfs://QmVKuChbrLg9nt5VCsm8ABXxoCaju2a2KSbTeSbt8vHR1W',
                        category: 'cryptocurrency',
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
                ).toString('hex')

                const usdtUsdMetadata = Buffer.from(
                    JSON.stringify({
                        name: 'Maven Finance - USDT/USD Aggregator',
                        version: 'v1.0.0',
                        authors: ['Mavryk Dynamics <info@mavryk.io>'],
                        icon: 'ipfs://QmdsFRYNuJX6HRamC2pXp3FiuEa4jB9uCZdg3sr3HD6KT7',
                        category: 'stablecoin',
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
                        interfaces: [ 'MIP-16' ]
                    }),
                    'ascii',
                ).toString('hex')

                const oceanUsdMetadata = Buffer.from(
                    JSON.stringify({
                        name: 'Maven Finance - OCEAN/USD Aggregator',
                        version: 'v1.0.0',
                        authors: ['Mavryk Dynamics <info@mavryk.io>'],
                        icon: 'ipfs://QmVvUnYu7jfKFR6KDVhPbPXC89tYCCajDvDHuYgPdH6unK',
                        category: 'rwa',
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
                        interfaces: [ 'MIP-16' ]
                    }),
                    'ascii',
                ).toString('hex')

                const mars1UsdMetadata = Buffer.from(
                    JSON.stringify({
                        name: 'Maven Finance - MARS1/USD Aggregator',
                        version: 'v1.0.0',
                        authors: ['Mavryk Dynamics <info@mavryk.io>'],
                        icon: 'ipfs://QmdkDb6KnboFNknuyK72eFdM1qKgetYZegBoQkcjDYhG5k',
                        category: 'rwa',
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
                        interfaces: [ 'MIP-16' ]
                    }),
                    'ascii',
                ).toString('hex')

                // const eurtUsdMetadata = Buffer.from(
                //     JSON.stringify({
                //         name: 'EURT/USD Aggregator Contract',
                //         icon: 'https://www.circle.com/hubfs/euro-coin-lockup-sm.svg',
                //         version: 'v1.0.0',
                //         authors: ['Maven Dev Team <info@mavryk.io>'],
                //         category: 'stablecoin'
                //     }),
                //     'ascii',
                // ).toString('hex')
        
                const createAggregatorsBatch = await utils.tezos.wallet
                    .batch()
                    .withContractCall(aggregatorFactoryInstance.methods.createAggregator(

                        'BTC/USD',
                        true,
                        
                        oracleMap,

                        new BigNumber(8),             // decimals
                        new BigNumber(2),             // alphaPercentPerThousand
                        
                        new BigNumber(60),            // percentOracleThreshold
                        new BigNumber(300),            // heartbeatSeconds

                        new BigNumber(10000000),      // rewardAmountStakedMvn
                        new BigNumber(1300),          // rewardAmountMvrk
                        
                        btcUsdMetadata                // metadata

                    ))
                    .withContractCall(aggregatorFactoryInstance.methods.createAggregator(
        
                        'MVRK/USD',
                        true,
                        
                        oracleMap,

                        new BigNumber(6),             // decimals
                        new BigNumber(2),             // alphaPercentPerThousand
                        
                        new BigNumber(60),            // percentOracleThreshold
                        new BigNumber(300),           // heartbeatSeconds

                        new BigNumber(10000000),      // rewardAmountStakedMvn
                        new BigNumber(1300),          // rewardAmountMvrk
                        
                        mvrkUsdMetadata                // metadata

                    ))
                    .withContractCall(aggregatorFactoryInstance.methods.createAggregator(
        
                        'USDT/USD',
                        true,
                        
                        oracleMap,

                        new BigNumber(6),             // decimals
                        new BigNumber(2),             // alphaPercentPerThousand
                        
                        new BigNumber(60),            // percentOracleThreshold
                        new BigNumber(300),           // heartbeatSeconds

                        new BigNumber(10000000),      // rewardAmountStakedMvn
                        new BigNumber(1300),          // rewardAmountMvrk
                        
                        usdtUsdMetadata               // metadata bytes
                        
                    ))
                    .withContractCall(aggregatorFactoryInstance.methods.createAggregator(
        
                        'OCEAN/USD',
                        true,
                        
                        oracleMap,

                        new BigNumber(3),             // decimals
                        new BigNumber(2),             // alphaPercentPerThousand
                        
                        new BigNumber(60),            // percentOracleThreshold
                        new BigNumber(300),           // heartbeatSeconds

                        new BigNumber(10000000),      // rewardAmountStakedMvn
                        new BigNumber(1300),          // rewardAmountMvrk
                        
                        oceanUsdMetadata               // metadata bytes
                        
                    ))
                    .withContractCall(aggregatorFactoryInstance.methods.createAggregator(
        
                        'MARS1/USD',
                        true,
                        
                        oracleMap,

                        new BigNumber(3),             // decimals
                        new BigNumber(2),             // alphaPercentPerThousand
                        
                        new BigNumber(60),            // percentOracleThreshold
                        new BigNumber(300),           // heartbeatSeconds

                        new BigNumber(10000000),      // rewardAmountStakedMvn
                        new BigNumber(1300),          // rewardAmountMvrk
                        
                        mars1UsdMetadata               // metadata bytes
                        
                    ))
                    // .withContractCall(aggregatorFactoryInstance.methods.createAggregator(
        
                    //     'EURT/USD',
                    //     true,
                        
                    //     oracleMap,
        
                    //     new BigNumber(6),             // decimals
                    //     new BigNumber(2),             // alphaPercentPerThousand
                        
                    //     new BigNumber(60),            // percentOracleThreshold
                    //     new BigNumber(300),           // heartbeatSeconds

                    //     new BigNumber(10000000),      // rewardAmountStakedMvn
                    //     new BigNumber(1300),          // rewardAmountMvrk
                        
                    //     eurtUsdMetadata              // metadata
                        
                    // ))
        
                const createAggregatorsBatchOperation = await createAggregatorsBatch.send()
                await createAggregatorsBatchOperation.confirmation();
        
                console.log("Aggregators deployed")
            }

        } catch(e){
            console.dir(e, {depth: 5})
        }

    })

    it(`oracle setup`, async () => {
        try {
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        } catch (e) {
            console.log(e)
        }
    })
  
})
