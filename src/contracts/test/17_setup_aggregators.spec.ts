import { MichelsonMap } from "@taquito/taquito";
import { BigNumber } from "bignumber.js";

import { Utils } from "./helpers/Utils";

const chai = require("chai");
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

// ------------------------------------------------------------------------------
// Contract Address
// ------------------------------------------------------------------------------

import contractDeployments from './contractDeployments.json'

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { bob, alice, eve, mallory, susie, oscar, ivan, trudy, isaac, david } from "../scripts/sandbox/accounts";
import { aggregatorMockData } from "./helpers/mockSampleData"
import { 
    signerFactory
} from './helpers/helperFunctions'


// ------------------------------------------------------------------------------
// Contract Notes
// ------------------------------------------------------------------------------

// For setup of aggregators for subsequent tests
//   - USD/BTC 
//   - USD/XTZ 
//   - USD/DOGE 
//   - USD/MVN 

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("Setup: Mock Aggregators", async () => {
    
    // default
    var utils : Utils
    var tezos

    let admin
    let adminSk

    let oracleMap

    // basic inputs for updating operators
    let aggregatorFactoryAddress
    let governanceSatelliteAddress

    // contract instances
    let aggregatorFactoryInstance
    let governanceSatelliteInstance

    // contract storages
    let aggregatorFactoryStorage
    let governanceSatelliteStorage


    before("setup", async () => {

        utils = new Utils();
        await utils.init(bob.sk);
        tezos = utils.tezos

        admin   = bob.pkh
        adminSk = bob.sk 

        aggregatorFactoryAddress        = contractDeployments.aggregatorFactory.address;
        governanceSatelliteAddress      = contractDeployments.governanceSatellite.address;
        
        aggregatorFactoryInstance       = await utils.tezos.contract.at(aggregatorFactoryAddress);
        governanceSatelliteInstance     = await utils.tezos.contract.at(governanceSatelliteAddress);
            
        aggregatorFactoryStorage        = await aggregatorFactoryInstance.storage();
        governanceSatelliteStorage      = await governanceSatelliteInstance.storage();

        await signerFactory(tezos, bob.sk);

        // console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        oracleMap = MichelsonMap.fromLiteral({
            [alice.pkh]              : {
                oraclePublicKey : alice.pk,
                oraclePeerId : alice.peerId
            },
            [eve.pkh]              : {
                oraclePublicKey : eve.pk,
                oraclePeerId : eve.peerId
            },
            [susie.pkh]          : {
                oraclePublicKey : susie.pk,
                oraclePeerId : susie.peerId
            }
        });

    });

    describe("Setup mock satellites for subsequent tests", async () => {

        before('empty the tracked aggregators that we don\'t need for the subsequent tests', async () => {
            try{
                const trackedAggregators    = aggregatorFactoryStorage.trackedAggregators;
                for(const index in trackedAggregators){
                    const aggregatorAddress         = trackedAggregators[index];
                    const aggregatorInstance        = await utils.tezos.contract.at(aggregatorAddress);
                    const aggregatorStorage: any    = await aggregatorInstance.storage();
                    switch(aggregatorStorage.name){
                        case 'USD/BTC':
                        case 'USD/XTZ':
                        case 'USD/DOGE':
                        case 'USD/MVN':
                            break;
                        default:
                            const untrackAggregatorOperation    = await aggregatorFactoryInstance.methods.untrackAggregator(aggregatorAddress).send();
                            await untrackAggregatorOperation.confirmation();
                            break;
                    }
                }
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })  

        it('setup USD/BTC aggregator', async () => {
            try{
                
                const aggregatorName = 'USD/BTC';
                const aggregatorRecord = await governanceSatelliteStorage.aggregatorLedger.get(aggregatorName);
                if(aggregatorRecord == undefined){

                    // const oracleMap              = MichelsonMap.fromLiteral({});
                    const aggregatorMetadataBase = aggregatorMockData.mockAggregator.metadata;

                    const setupAggregatorOperation = await aggregatorFactoryInstance.methods.createAggregator(
                        aggregatorName,
                        true,

                        oracleMap,

                        new BigNumber(6),             // decimals
                        new BigNumber(2),             // alphaPercentPerThousand

                        new BigNumber(60),            // percentOracleThreshold
                        new BigNumber(30),            // heartbeatSeconds

                        new BigNumber(10000000),      // rewardAmountStakedMvn
                        new BigNumber(1300),          // rewardAmountXtz
                        
                        aggregatorMetadataBase        // metadata bytes
                    ).send();
                    await setupAggregatorOperation.confirmation();

                }

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('setup USD/XTZ aggregator', async () => {
            try{
                
                const aggregatorName = 'USD/XTZ';
                const aggregatorRecord = await governanceSatelliteStorage.aggregatorLedger.get(aggregatorName);
                if(aggregatorRecord == undefined){

                    // const oracleMap              = MichelsonMap.fromLiteral({});
                    const aggregatorMetadataBase = aggregatorMockData.mockAggregator.metadata;

                    const setupAggregatorOperation = await aggregatorFactoryInstance.methods.createAggregator(
                        aggregatorName,
                        true,

                        oracleMap,

                        new BigNumber(6),             // decimals
                        new BigNumber(2),             // alphaPercentPerThousand

                        new BigNumber(60),            // percentOracleThreshold
                        new BigNumber(30),            // heartbeatSeconds

                        new BigNumber(10000000),      // rewardAmountStakedMvn
                        new BigNumber(1300),          // rewardAmountXtz
                        
                        aggregatorMetadataBase        // metadata bytes
                    ).send();
                    await setupAggregatorOperation.confirmation();

                }

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('setup USD/DOGE aggregator', async () => {
            try{
                
                const aggregatorName = 'USD/DOGE';
                const aggregatorRecord = await governanceSatelliteStorage.aggregatorLedger.get(aggregatorName);
                if(aggregatorRecord == undefined){

                    // const oracleMap              = MichelsonMap.fromLiteral({});
                    const aggregatorMetadataBase = aggregatorMockData.mockAggregator.metadata;

                    const setupAggregatorOperation = await aggregatorFactoryInstance.methods.createAggregator(
                        aggregatorName,
                        true,

                        oracleMap,

                        new BigNumber(6),             // decimals
                        new BigNumber(2),             // alphaPercentPerThousand

                        new BigNumber(60),            // percentOracleThreshold
                        new BigNumber(30),            // heartbeatSeconds

                        new BigNumber(10000000),      // rewardAmountStakedMvn
                        new BigNumber(1300),          // rewardAmountXtz
                        
                        aggregatorMetadataBase        // metadata bytes
                    ).send();
                    await setupAggregatorOperation.confirmation();

                }

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('setup USD/MVN aggregator', async () => {
            try{
                
                const aggregatorName = 'USD/MVN';
                const aggregatorRecord = await governanceSatelliteStorage.aggregatorLedger.get(aggregatorName);
                if(aggregatorRecord == undefined){

                    // const oracleMap              = MichelsonMap.fromLiteral({});
                    const aggregatorMetadataBase = aggregatorMockData.mockAggregator.metadata;

                    const setupAggregatorOperation = await aggregatorFactoryInstance.methods.createAggregator(
                        aggregatorName,
                        true,

                        oracleMap,

                        new BigNumber(9),             // decimals
                        new BigNumber(2),             // alphaPercentPerThousand

                        new BigNumber(60),            // percentOracleThreshold
                        new BigNumber(30),            // heartbeatSeconds

                        new BigNumber(10000000),      // rewardAmountStakedMvn
                        new BigNumber(1300),          // rewardAmountXtz
                        
                        aggregatorMetadataBase        // metadata bytes
                    ).send();
                    await setupAggregatorOperation.confirmation();

                }

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        
    })

});
