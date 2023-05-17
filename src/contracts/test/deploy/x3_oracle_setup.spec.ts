import { Utils } from "../helpers/Utils"
import { BigNumber } from "bignumber.js"
import { MichelsonMap } from '@taquito/michelson-encoder'

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

import {bob, eve, mallory} from '../../scripts/sandbox/accounts'

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
                    [bob.pkh]              : {
                                                oraclePublicKey: bob.pk,
                                                oraclePeerId: bob.peerId
                                            },
                    [eve.pkh]              : {
                                                oraclePublicKey: eve.pk,
                                                oraclePeerId: eve.peerId
                                            },
                    [mallory.pkh]          : {
                                                oraclePublicKey: mallory.pk,
                                                oraclePeerId: eve.peerId
                                            }
                });

                const btcUsdMetadata = Buffer.from(
                    JSON.stringify({
                        name: 'BTC/USD Aggregator Contract',
                        icon: 'https://infura-ipfs.io/ipfs/QmNyMFPuh43K9wkYHV6shtLYMusqXf3YCkes9aWAgird6u',
                        version: 'v1.0.0',
                        authors: ['Mavryk Dev Team <info@mavryk.io>'],
                                    category: 'cryptocurrency'
                    }),
                    'ascii',
                ).toString('hex')

                const xtzUsdMetadata = Buffer.from(
                    JSON.stringify({
                        name: 'XTZ/USD Aggregator Contract',
                        icon: 'https://infura-ipfs.io/ipfs/QmdiScFymWzZ5qgVd47QN7RA2nrDDRZ1vTqDrC4LnJSqTW',
                        version: 'v1.0.0',
                        authors: ['Mavryk Dev Team <info@mavryk.io>'],
                        category: 'cryptocurrency'
                    }),
                    'ascii',
                ).toString('hex')

                const usdtUsdMetadata = Buffer.from(
                    JSON.stringify({
                        name: 'USDT/USD Aggregator Contract',
                        icon: 'https://infura-ipfs.io/ipfs/QmVvUnYu7jfKFR6KDVhPbPXC89tYCCajDvDHuYgPdH6unK',
                        version: 'v1.0.0',
                        authors: ['Mavryk Dev Team <info@mavryk.io>'],
                                    category: 'stablecoin'
                    }),
                    'ascii',
                ).toString('hex')

                const eurocUsdMetadata = Buffer.from(
                    JSON.stringify({
                        name: 'EUROC/USD Aggregator Contract',
                        icon: 'https://www.circle.com/hubfs/euro-coin-lockup-sm.svg',
                        version: 'v1.0.0',
                        authors: ['Mavryk Dev Team <info@mavryk.io>'],
                                    category: 'stablecoin'
                    }),
                    'ascii',
                ).toString('hex')
        
                const createAggregatorsBatch = await utils.tezos.wallet
                    .batch()
                    .withContractCall(aggregatorFactoryInstance.methods.createAggregator(

                        'BTC/USD',
                        true,
                        
                        oracleMap,

                        new BigNumber(8),             // decimals
                        new BigNumber(2),             // alphaPercentPerThousand
                        
                        new BigNumber(60),            // percentOracleThreshold
                        new BigNumber(300),            // heartBeatSeconds

                        new BigNumber(10000000),      // rewardAmountStakedMvk
                        new BigNumber(1300),          // rewardAmountXtz
                        
                        btcUsdMetadata                // metadata

                    ))
                    .withContractCall(aggregatorFactoryInstance.methods.createAggregator(
        
                        'XTZ/USD',
                        true,
                        
                        oracleMap,

                        new BigNumber(6),             // decimals
                        new BigNumber(2),             // alphaPercentPerThousand
                        
                        new BigNumber(60),            // percentOracleThreshold
                        new BigNumber(300),           // heartBeatSeconds

                        new BigNumber(10000000),      // rewardAmountStakedMvk
                        new BigNumber(1300),          // rewardAmountXtz
                        
                        xtzUsdMetadata                // metadata

                    ))
                    .withContractCall(aggregatorFactoryInstance.methods.createAggregator(
        
                        'USDT/USD',
                        true,
                        
                        oracleMap,

                        new BigNumber(6),             // decimals
                        new BigNumber(2),             // alphaPercentPerThousand
                        
                        new BigNumber(60),            // percentOracleThreshold
                        new BigNumber(300),           // heartBeatSeconds

                        new BigNumber(10000000),      // rewardAmountStakedMvk
                        new BigNumber(1300),          // rewardAmountXtz
                        
                        usdtUsdMetadata               // metadata bytes
                        
                    ))
                    .withContractCall(aggregatorFactoryInstance.methods.createAggregator(
        
                        'EUROC/USD',
                        true,
                        
                        oracleMap,
        
                        new BigNumber(6),             // decimals
                        new BigNumber(2),             // alphaPercentPerThousand
                        
                        new BigNumber(60),            // percentOracleThreshold
                        new BigNumber(300),           // heartBeatSeconds

                        new BigNumber(10000000),      // rewardAmountStakedMvk
                        new BigNumber(1300),          // rewardAmountXtz
                        
                        eurocUsdMetadata              // metadata
                        
                    ))
        
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
