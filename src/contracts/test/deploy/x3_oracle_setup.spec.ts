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
                        name: 'BTC/USD Aggregator Contract',
                        icon: 'https://infura-ipfs.io/ipfs/QmNyMFPuh43K9wkYHV6shtLYMusqXf3YCkes9aWAgird6u',
                        version: 'v1.0.0',
                        authors: ['Maven Dev Team <info@mavryk.io>'],
                        category: 'cryptocurrency'
                    }),
                    'ascii',
                ).toString('hex')

                const mvrkUsdMetadata = Buffer.from(
                    JSON.stringify({
                        name: 'MVRK/USD Aggregator Contract',
                        icon: '',
                        version: 'v1.0.0',
                        authors: ['Maven Dev Team <info@mavryk.io>'],
                        category: 'cryptocurrency'
                    }),
                    'ascii',
                ).toString('hex')

                const usdtUsdMetadata = Buffer.from(
                    JSON.stringify({
                        name: 'USDT/USD Aggregator Contract',
                        icon: 'https://infura-ipfs.io/ipfs/QmVvUnYu7jfKFR6KDVhPbPXC89tYCCajDvDHuYgPdH6unK',
                        version: 'v1.0.0',
                        authors: ['Maven Dev Team <info@mavryk.io>'],
                        category: 'stablecoin'
                    }),
                    'ascii',
                ).toString('hex')

                // const oceanUsdMetadata = Buffer.from(
                //     JSON.stringify({
                //         name: 'OCEAN/USD Aggregator Contract',
                //         icon: 'https://infura-ipfs.io/ipfs/QmVvUnYu7jfKFR6KDVhPbPXC89tYCCajDvDHuYgPdH6unK',
                //         version: 'v1.0.0',
                //         authors: ['Equiteez <info@mavryk.io>'],
                //         category: 'rwa'
                //     }),
                //     'ascii',
                // ).toString('hex')

                // const mars1UsdMetadata = Buffer.from(
                //     JSON.stringify({
                //         name: 'MARS1/USD Aggregator Contract',
                //         icon: 'https://cloudflare-ipfs.com/ipfs/QmdkDb6KnboFNknuyK72eFdM1qKgetYZegBoQkcjDYhG5k',
                //         version: 'v1.0.0',
                //         authors: ['Equiteez <info@mavryk.io>'],
                //         category: 'rwa'
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
                    // .withContractCall(aggregatorFactoryInstance.methods.createAggregator(
        
                    //     'OCEAN/USD',
                    //     true,
                        
                    //     oracleMap,

                    //     new BigNumber(3),             // decimals
                    //     new BigNumber(2),             // alphaPercentPerThousand
                        
                    //     new BigNumber(60),            // percentOracleThreshold
                    //     new BigNumber(300),           // heartbeatSeconds

                    //     new BigNumber(10000000),      // rewardAmountStakedMvn
                    //     new BigNumber(1300),          // rewardAmountMvrk
                        
                    //     oceanUsdMetadata               // metadata bytes
                        
                    // ))
                    // .withContractCall(aggregatorFactoryInstance.methods.createAggregator(
        
                    //     'MARS1/USD',
                    //     true,
                        
                    //     oracleMap,

                    //     new BigNumber(3),             // decimals
                    //     new BigNumber(2),             // alphaPercentPerThousand
                        
                    //     new BigNumber(60),            // percentOracleThreshold
                    //     new BigNumber(300),           // heartbeatSeconds

                    //     new BigNumber(10000000),      // rewardAmountStakedMvn
                    //     new BigNumber(1300),          // rewardAmountMvrk
                        
                    //     mars1UsdMetadata               // metadata bytes
                        
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
