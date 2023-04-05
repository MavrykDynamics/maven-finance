import { Utils } from './helpers/Utils';
import { MichelsonMap } from '@taquito/michelson-encoder';
import assert from "assert";
import BigNumber from 'bignumber.js';

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

import { bob, alice, eve, mallory, david } from "../scripts/sandbox/accounts";
import * as helperFunctions from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe('AggregatorFactory', () => {

    var utils: Utils;
    let tezos 

    let aggregatorInstance;
    let aggregatorFactoryInstance;

    let aggregatorStorage;
    let aggregatorFactoryStorage;

    let governanceSatelliteInstance;
    let governanceSatelliteStorage;

    const aggregatorMetadataBase = Buffer.from(
        JSON.stringify({
            name: 'MAVRYK Aggregator Contract',
            icon: 'https://logo.chainbit.xyz/xtz',
            version: 'v1.0.0',
            authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
        }),
        'ascii',
    ).toString('hex')
    
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
                                    oraclePeerId: mallory.peerId
                                }
    });

    before("setup", async () => {
        
        utils = new Utils();
        await utils.init(bob.sk);
        tezos = utils.tezos 

        aggregatorInstance              = await utils.tezos.contract.at(contractDeployments.aggregator.address);
        aggregatorFactoryInstance       = await utils.tezos.contract.at(contractDeployments.aggregatorFactory.address);
        governanceSatelliteInstance     = await utils.tezos.contract.at(contractDeployments.governanceSatellite.address);

        aggregatorStorage               = await aggregatorInstance.storage();
        aggregatorFactoryStorage        = await aggregatorFactoryInstance.storage();
        governanceSatelliteStorage      = await governanceSatelliteInstance.storage();
    });

    describe('%createAggregator', () => {
        it('Non-admin should not be able to call this entrypoint', async () => {
            try {
                // Initial values
                await helperFunctions.signerFactory(tezos, david.sk);

                // Operation
                await chai.expect(aggregatorFactoryInstance.methods.createAggregator(
        
                    'USD/BTC',
                    true,
                    
                    oracleMap,
        
                    new BigNumber(8),             // decimals
                    new BigNumber(2),             // alphaPercentPerThousand
        
                    new BigNumber(60),            // percentOracleThreshold
                    new BigNumber(30),            // heartBeatSeconds
        
                    new BigNumber(10000000),      // rewardAmountMvk ~ 0.01 MVK
                    new BigNumber(1300),          // rewardAmountXtz ~ 0.0013 tez
                    
                    aggregatorMetadataBase        // metadata
                ).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should be able to create a new Aggregator', async () => {
            try {
                // Initial values
                await helperFunctions.signerFactory(tezos, bob.sk);
                aggregatorFactoryStorage        = await aggregatorFactoryInstance.storage();
                const startTrackedAggregators   = aggregatorFactoryStorage.trackedAggregators.length;

                // Operation
                const operation = await aggregatorFactoryInstance.methods.createAggregator(
        
                    'USD/BTC',
                    true,
                    
                    oracleMap,
        
                    new BigNumber(8),             // decimals
                    new BigNumber(2),             // alphaPercentPerThousand
        
                    new BigNumber(60),            // percentOracleThreshold
                    new BigNumber(30),            // heartBeatSeconds
        
                    new BigNumber(10000000),      // rewardAmountMvk ~ 0.01 MVK
                    new BigNumber(1300),          // rewardAmountXtz ~ 0.0013 tez
                    
                    aggregatorMetadataBase        // metadata
                ).send();
                await operation.confirmation();

                // Final values
                aggregatorFactoryStorage        = await aggregatorFactoryInstance.storage();
                governanceSatelliteStorage      = await governanceSatelliteInstance.storage();
                const aggregatorRecord          = await governanceSatelliteStorage.aggregatorLedger.get("USD/BTC");
                const endTrackedAggregators     = aggregatorFactoryStorage.trackedAggregators.length;

                // Assertion
                assert.notEqual(endTrackedAggregators, startTrackedAggregators);
                assert.notStrictEqual(aggregatorRecord, undefined);
                assert.equal(aggregatorFactoryStorage.trackedAggregators.includes(aggregatorRecord), true);
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });
    });  


    describe('trackAggregator', () => {

        it('Non-admin should not be able to call this entrypoint', async () => {
            try {
                // Initial values
                await helperFunctions.signerFactory(tezos, david.sk);

                // Operation
                await chai.expect(aggregatorFactoryInstance.methods.trackAggregator(aggregatorInstance.address).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }     
        });

        it('Admin should be able to track an aggregator', async () => {
            try {
                // Initial values
                await helperFunctions.signerFactory(tezos, bob.sk);

                // Operation
                const operation             = await aggregatorFactoryInstance.methods.trackAggregator(aggregatorInstance.address).send();
                await operation.confirmation();

                // Final values
                aggregatorFactoryStorage        = await aggregatorFactoryInstance.storage();

                // Assertion
                assert.equal(aggregatorFactoryStorage.trackedAggregators.includes(aggregatorInstance.address), true);
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });
    });

    describe('untrackAggregator', () => {

        it('Non-admin should not be able to call this entrypoint', async () => {
            try {
                // Initial values
                await helperFunctions.signerFactory(tezos, david.sk);

                // Operation
                await chai.expect(aggregatorFactoryInstance.methods.untrackAggregator(aggregatorInstance.address).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should be able to untrack an aggregator', async () => {
            try {
                // Initial values
                await helperFunctions.signerFactory(tezos, bob.sk);
                
                // Operation
                const operation             = await aggregatorFactoryInstance.methods.untrackAggregator(aggregatorInstance.address).send();
                await operation.confirmation();
    
                // Final values
                aggregatorFactoryStorage    = await aggregatorFactoryInstance.storage();
    
                // Assertion
                assert.equal(aggregatorFactoryStorage.trackedAggregators.includes(aggregatorFactoryInstance.address), false);
    
                // Reset
                const resetOperation        = await aggregatorFactoryInstance.methods.trackAggregator(aggregatorInstance.address).send();
                await resetOperation.confirmation();
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });
    });


    describe('%pauseAll', function() {

        it('Non-admin should not be able to pause all entrypoints', async() => {
            try{
                // Change signer
                helperFunctions.signerFactory(tezos, alice.sk);
                aggregatorFactoryStorage                        = await aggregatorFactoryInstance.storage();

                // Initial values
                const createAggregatorIsPaused                  = aggregatorFactoryStorage.breakGlassConfig.createAggregatorIsPaused;
                const trackAggregatorIsPaused                   = aggregatorFactoryStorage.breakGlassConfig.trackAggregatorIsPaused;
                const untrackAggregatorIsPaused                 = aggregatorFactoryStorage.breakGlassConfig.untrackAggregatorIsPaused;
                const distributeRewardXtzIsPaused               = aggregatorFactoryStorage.breakGlassConfig.distributeRewardXtzIsPaused;
                const distributeRewardStakedMvkIsPaused         = aggregatorFactoryStorage.breakGlassConfig.distributeRewardStakedMvkIsPaused;

                assert.equal(createAggregatorIsPaused, false);
                assert.equal(trackAggregatorIsPaused, false);
                assert.equal(untrackAggregatorIsPaused, false);
                assert.equal(distributeRewardXtzIsPaused, false);
                assert.equal(distributeRewardStakedMvkIsPaused, false);
                
                // fail pause all
                await chai.expect(aggregatorFactoryInstance.methods.pauseAll().send()).to.be.rejected;

                // Final values
                aggregatorFactoryStorage                        = await aggregatorFactoryInstance.storage();
                const updatedCreateAggregatorIsPaused           = aggregatorFactoryStorage.breakGlassConfig.createAggregatorIsPaused;
                const updatedTrackAggregatorIsPaused            = aggregatorFactoryStorage.breakGlassConfig.trackAggregatorIsPaused;
                const updatedUntrackAggregatorIsPaused          = aggregatorFactoryStorage.breakGlassConfig.untrackAggregatorIsPaused;
                const updatedDistributeRewardXtzIsPaused        = aggregatorFactoryStorage.breakGlassConfig.distributeRewardXtzIsPaused;
                const updatedDistributeRewardStakedMvkIsPaused  = aggregatorFactoryStorage.breakGlassConfig.distributeRewardStakedMvkIsPaused;

                // Assertion
                assert.equal(updatedCreateAggregatorIsPaused, false);
                assert.equal(updatedTrackAggregatorIsPaused, false);
                assert.equal(updatedUntrackAggregatorIsPaused, false);
                assert.equal(updatedDistributeRewardXtzIsPaused, false);
                assert.equal(updatedDistributeRewardStakedMvkIsPaused, false);
            }catch(e){
                console.dir(e, {depth: 5})
            }
        });
    
        it('Admin should be able to pause all entrypoints on the factory and the tracked aggregators', async() => {
            try{
                // Initial values
                await helperFunctions.signerFactory(tezos, bob.sk)
                aggregatorFactoryStorage                        = await aggregatorFactoryInstance.storage();
                const createAggregatorIsPaused                  = aggregatorFactoryStorage.breakGlassConfig.createAggregatorIsPaused;
                const trackAggregatorIsPaused                   = aggregatorFactoryStorage.breakGlassConfig.trackAggregatorIsPaused;
                const untrackAggregatorIsPaused                 = aggregatorFactoryStorage.breakGlassConfig.untrackAggregatorIsPaused;
                const distributeRewardXtzIsPaused               = aggregatorFactoryStorage.breakGlassConfig.distributeRewardXtzIsPaused;
                const distributeRewardStakedMvkIsPaused         = aggregatorFactoryStorage.breakGlassConfig.distributeRewardStakedMvkIsPaused;

                aggregatorStorage                               = await aggregatorInstance.storage();
                const updateDataIsPaused                        = aggregatorStorage.breakGlassConfig.updateDataIsPaused;
                const withdrawRewardXtzIsPaused                 = aggregatorStorage.breakGlassConfig.withdrawRewardXtzIsPaused;
                const withdrawRewardStakedMvkIsPaused           = aggregatorStorage.breakGlassConfig.withdrawRewardStakedMvkIsPaused

                // Initial assertions
                assert.equal(createAggregatorIsPaused, false);
                assert.equal(trackAggregatorIsPaused, false);
                assert.equal(untrackAggregatorIsPaused, false);
                assert.equal(distributeRewardXtzIsPaused, false);
                assert.equal(distributeRewardStakedMvkIsPaused, false);
                assert.equal(updateDataIsPaused, false);
                assert.equal(withdrawRewardXtzIsPaused, false);
                assert.equal(withdrawRewardStakedMvkIsPaused, false);

                // Operation
                const operation                                 = await aggregatorFactoryInstance.methods.pauseAll().send();
                await operation.confirmation();

                // Final values
                aggregatorFactoryStorage                        = await aggregatorFactoryInstance.storage();
                aggregatorStorage                               = await aggregatorInstance.storage();
                const updatedUpdateDataIsPaused                 = aggregatorStorage.breakGlassConfig.updateDataIsPaused;
                const updatedWithdrawRewardXtzIsPaused          = aggregatorStorage.breakGlassConfig.withdrawRewardXtzIsPaused;
                const updatedWithdrawRewardStakedMvkIsPaused    = aggregatorStorage.breakGlassConfig.withdrawRewardStakedMvkIsPaused;
                const updatedCreateAggregatorIsPaused           = aggregatorFactoryStorage.breakGlassConfig.createAggregatorIsPaused;
                const updatedTrackAggregatorIsPaused            = aggregatorFactoryStorage.breakGlassConfig.trackAggregatorIsPaused;
                const updatedUntrackAggregatorIsPaused          = aggregatorFactoryStorage.breakGlassConfig.untrackAggregatorIsPaused;
                const updatedDistributeRewardXtzIsPaused        = aggregatorFactoryStorage.breakGlassConfig.distributeRewardXtzIsPaused;
                const updatedDistributeRewardStakedMvkIsPaused  = aggregatorFactoryStorage.breakGlassConfig.distributeRewardStakedMvkIsPaused;

                // Final assertions
                assert.equal(updatedUpdateDataIsPaused,                 true);
                assert.equal(updatedWithdrawRewardXtzIsPaused,          true);
                assert.equal(updatedWithdrawRewardStakedMvkIsPaused,    true);
                assert.equal(updatedCreateAggregatorIsPaused,           true);
                assert.equal(updatedTrackAggregatorIsPaused,            true);
                assert.equal(updatedUntrackAggregatorIsPaused,          true);
                assert.equal(updatedDistributeRewardXtzIsPaused,        true);
                assert.equal(updatedDistributeRewardStakedMvkIsPaused,  true);

                // Test operations
                await chai.expect(aggregatorFactoryInstance.methods.createAggregator(
            
                    'USD/BTC',
                    true,
                    
                    oracleMap,
            
                    new BigNumber(8),             // decimals
                    new BigNumber(2),             // numberBlocksDelay
            
                    new BigNumber(60),            // percentOracleThreshold
                    new BigNumber(30),            // heartBeatSeconds

                    
                    new BigNumber(10000000),      // rewardAmountMvk ~ 0.01 MVK
                    new BigNumber(1300),          // rewardAmountXtz ~ 0.0013 tez
                    
                    aggregatorMetadataBase        // metadata
                ).send()).to.be.rejected;
                await chai.expect(aggregatorFactoryInstance.methods.untrackAggregator(aggregatorInstance.address).send()).to.be.rejected;
                await chai.expect(aggregatorFactoryInstance.methods.trackAggregator(aggregatorInstance.address).send()).to.be.rejected;

                // init params for aggregator test entrypoints
                const observations = [
                    {
                        "oracle": bob.pkh,
                        "data": new BigNumber(10142857143)
                    },
                    {
                        "oracle": eve.pkh,
                        "data": new BigNumber(10142853322)
                    },
                    {
                        "oracle": mallory.pkh,
                        "data": new BigNumber(10142857900)
                    }
                ];
                const epoch: number = 1;
                const round: number = 1;
                const oracleObservations = new MichelsonMap<string, any>();
                for (const { oracle, data } of observations) {
                    oracleObservations.set(oracle, {
                        data,
                        epoch,
                        round,
                        aggregatorAddress: contractDeployments.aggregator.address
                        });
                };
                const signatures = new MichelsonMap<string, string>();
                await helperFunctions.signerFactory(tezos, bob.sk);
                signatures.set(bob.pkh, await utils.signOracleDataResponses(oracleObservations));
                helperFunctions.signerFactory(tezos, eve.sk);
                signatures.set(eve.pkh, await utils.signOracleDataResponses(oracleObservations));
                helperFunctions.signerFactory(tezos, mallory.sk);
                signatures.set(mallory.pkh, await utils.signOracleDataResponses(oracleObservations));

                await chai.expect(aggregatorInstance.methods.updateData(oracleObservations, signatures).send()).to.be.rejected;
                await chai.expect(aggregatorInstance.methods.withdrawRewardXtz(bob.pkh).send()).to.be.rejected;
                await chai.expect(aggregatorInstance.methods.withdrawRewardStakedMvk(bob.pkh).send()).to.be.rejected;

            }catch(e){
                console.dir(e, {depth: 5})
            }
        })

    });

    describe('%unpauseAll', function() {

        it('Non-admin should not be able to unpause all entrypoints', async() => {
            try{
                // Initial values
                helperFunctions.signerFactory(tezos, alice.sk);
                aggregatorFactoryStorage                        = await aggregatorFactoryInstance.storage();
                const createAggregatorIsPaused                  = aggregatorFactoryStorage.breakGlassConfig.createAggregatorIsPaused;
                const trackAggregatorIsPaused                   = aggregatorFactoryStorage.breakGlassConfig.trackAggregatorIsPaused;
                const untrackAggregatorIsPaused                 = aggregatorFactoryStorage.breakGlassConfig.untrackAggregatorIsPaused;
                const distributeRewardXtzIsPaused               = aggregatorFactoryStorage.breakGlassConfig.distributeRewardXtzIsPaused;
                const distributeRewardStakedMvkIsPaused         = aggregatorFactoryStorage.breakGlassConfig.distributeRewardStakedMvkIsPaused;

                // Initial assertions
                assert.equal(createAggregatorIsPaused,          true);
                assert.equal(trackAggregatorIsPaused,           true);
                assert.equal(untrackAggregatorIsPaused,         true);
                assert.equal(distributeRewardXtzIsPaused,       true);
                assert.equal(distributeRewardStakedMvkIsPaused, true);
                
                // Operation
                await chai.expect(aggregatorFactoryInstance.methods.unpauseAll().send()).to.be.rejected;

                // Final values
                aggregatorFactoryStorage                        = await aggregatorFactoryInstance.storage();
                const updatedCreateAggregatorIsPaused           = aggregatorFactoryStorage.breakGlassConfig.createAggregatorIsPaused;
                const updatedTrackAggregatorIsPaused            = aggregatorFactoryStorage.breakGlassConfig.trackAggregatorIsPaused;
                const updatedUntrackAggregatorIsPaused          = aggregatorFactoryStorage.breakGlassConfig.untrackAggregatorIsPaused;
                const updatedDistributeRewardXtzIsPaused        = aggregatorFactoryStorage.breakGlassConfig.distributeRewardXtzIsPaused;
                const updatedDistributeRewardStakedMvkIsPaused  = aggregatorFactoryStorage.breakGlassConfig.distributeRewardStakedMvkIsPaused;

                // Final assertions
                assert.equal(updatedCreateAggregatorIsPaused,          true);
                assert.equal(updatedTrackAggregatorIsPaused,           true);
                assert.equal(updatedUntrackAggregatorIsPaused,         true);
                assert.equal(updatedDistributeRewardXtzIsPaused,       true);
                assert.equal(updatedDistributeRewardStakedMvkIsPaused, true);

            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should be able to unpause all entrypoints on the factory and the tracked aggregators', async() => {
            try{
                // Initial values
                await helperFunctions.signerFactory(tezos, bob.sk)
                aggregatorFactoryStorage                        = await aggregatorFactoryInstance.storage();
                const createAggregatorIsPaused                  = aggregatorFactoryStorage.breakGlassConfig.createAggregatorIsPaused;
                const trackAggregatorIsPaused                   = aggregatorFactoryStorage.breakGlassConfig.trackAggregatorIsPaused;
                const untrackAggregatorIsPaused                 = aggregatorFactoryStorage.breakGlassConfig.untrackAggregatorIsPaused;
                const distributeRewardXtzIsPaused               = aggregatorFactoryStorage.breakGlassConfig.distributeRewardXtzIsPaused;
                const distributeRewardStakedMvkIsPaused         = aggregatorFactoryStorage.breakGlassConfig.distributeRewardStakedMvkIsPaused;

                aggregatorStorage                               = await aggregatorInstance.storage();
                const updateDataIsPaused                        = aggregatorStorage.breakGlassConfig.updateDataIsPaused;
                const withdrawRewardXtzIsPaused                 = aggregatorStorage.breakGlassConfig.withdrawRewardXtzIsPaused;
                const withdrawRewardStakedMvkIsPaused           = aggregatorStorage.breakGlassConfig.withdrawRewardStakedMvkIsPaused

                // Initial assertions
                assert.equal(createAggregatorIsPaused,          true);
                assert.equal(trackAggregatorIsPaused,           true);
                assert.equal(untrackAggregatorIsPaused,         true);
                assert.equal(distributeRewardXtzIsPaused,       true);
                assert.equal(distributeRewardStakedMvkIsPaused, true);

                assert.equal(updateDataIsPaused,                 true);
                assert.equal(withdrawRewardXtzIsPaused,          true);
                assert.equal(withdrawRewardStakedMvkIsPaused,    true);

                // Operation
                const operation                                 = await aggregatorFactoryInstance.methods.unpauseAll().send();
                await operation.confirmation();

                // Final values
                aggregatorFactoryStorage                        = await aggregatorFactoryInstance.storage();
                aggregatorStorage                               = await aggregatorInstance.storage();
                const updatedUpdateDataIsPaused                 = aggregatorStorage.breakGlassConfig.updateDataIsPaused;
                const updatedWithdrawRewardXtzIsPaused          = aggregatorStorage.breakGlassConfig.withdrawRewardXtzIsPaused;
                const updatedWithdrawRewardStakedMvkIsPaused    = aggregatorStorage.breakGlassConfig.withdrawRewardStakedMvkIsPaused;
                const updatedCreateAggregatorIsPaused           = aggregatorFactoryStorage.breakGlassConfig.createAggregatorIsPaused;
                const updatedTrackAggregatorIsPaused            = aggregatorFactoryStorage.breakGlassConfig.trackAggregatorIsPaused;
                const updatedUntrackAggregatorIsPaused          = aggregatorFactoryStorage.breakGlassConfig.untrackAggregatorIsPaused;
                const updatedDistributeRewardXtzIsPaused        = aggregatorFactoryStorage.breakGlassConfig.distributeRewardXtzIsPaused;
                const updatedDistributeRewardStakedMvkIsPaused  = aggregatorFactoryStorage.breakGlassConfig.distributeRewardStakedMvkIsPaused;

                // Final assertions
                assert.equal(updatedUpdateDataIsPaused,                false);
                assert.equal(updatedWithdrawRewardXtzIsPaused,          false);
                assert.equal(updatedWithdrawRewardStakedMvkIsPaused,    false);
                assert.equal(updatedCreateAggregatorIsPaused,           false);
                assert.equal(updatedTrackAggregatorIsPaused,            false);
                assert.equal(updatedUntrackAggregatorIsPaused,          false);
                assert.equal(updatedDistributeRewardXtzIsPaused,        false);
                assert.equal(updatedDistributeRewardStakedMvkIsPaused,  false);

                // Test operations
                const testCreateAggregatorOp    = await aggregatorFactoryInstance.methods.createAggregator(
            
                    'USD/Testv2',
                    true,
                    
                    oracleMap,
            
                    new BigNumber(8),             // decimals
                    new BigNumber(2),             // alphaPercentPerThousand
            
                    new BigNumber(60),            // percentOracleThreshold
                    new BigNumber(30),            // heartBeatSeconds
            
                    new BigNumber(10000000),      // rewardAmountMvk ~ 0.01 MVK
                    new BigNumber(1300),          // rewardAmountXtz ~ 0.0013 tez
                    
                    aggregatorMetadataBase        // metadata
                ).send();
                
                await testCreateAggregatorOp.confirmation();

                const testUntrackAggregatorOp   = await aggregatorFactoryInstance.methods.untrackAggregator(aggregatorInstance.address).send();
                await testUntrackAggregatorOp.confirmation();

                const testTrackAggregatorOp     = await aggregatorFactoryInstance.methods.trackAggregator(aggregatorInstance.address).send();
                await testTrackAggregatorOp.confirmation();

            }catch(e){
                console.dir(e, {depth: 5})
            }
        })

    });

    describe('setAdmin', () => {
        it('Non-admin should not be able to call this entrypoint', async () => {
            try {
                // Initial values
                await helperFunctions.signerFactory(tezos, david.sk);

                // Operation
                await chai.expect(aggregatorFactoryInstance.methods.setAdmin(bob.pkh).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should be able to update the aggregator admin', async () => {
            try {
                // Initial values
                await helperFunctions.signerFactory(tezos, bob.sk);

                // Operation
                const operation             = await aggregatorFactoryInstance.methods.setAdmin(bob.pkh).send();
                await operation.confirmation();
    
                // Final values
                aggregatorFactoryStorage    = await aggregatorFactoryInstance.storage();

                // Assertion
                assert.deepEqual(aggregatorFactoryStorage.admin,bob.pkh);
            } catch (e) {
                console.dir(e, {depth: 5})
            }
        });
    });

    describe('%setGovernance', () => {
        it('Non-admin should not be able to call this entrypoint', async () => {
            try {
                // Initial values
                await helperFunctions.signerFactory(tezos, david.sk);

                // Operation
                await chai.expect(aggregatorFactoryInstance.methods.setGovernance(david.pkh).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should be able to update the governance address', async () => {
            try {
                // Initial values
                await helperFunctions.signerFactory(tezos, bob.sk);

                // Operation
                const operation             = await aggregatorFactoryInstance.methods.setGovernance(contractDeployments.governance.address).send();
                await operation.confirmation();
    
                // Final values
                aggregatorFactoryStorage    = await aggregatorFactoryInstance.storage();

                // Assertion
                assert.deepEqual(aggregatorFactoryStorage.governanceAddress,contractDeployments.governance.address);
            } catch (e) {
                console.dir(e, {depth: 5})
            }
        });
    });

    describe('%updateMetadata', () => {
        it('Non-admin should not be able to call this entrypoint', async () => {
            try {
                // Initial values
                await helperFunctions.signerFactory(tezos, david.sk);
                const key   = ''
                const hash  = Buffer.from('tezos-storage:data', 'ascii').toString('hex')

                // Operation
                await chai.expect(aggregatorFactoryInstance.methods.updateMetadata(key, hash).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should be able to update the aggregator contract metadata', async () => {
            try {
                // Initial values
                await helperFunctions.signerFactory(tezos, bob.sk);
                const key                   = ''
                const hash                  = Buffer.from('tezos-storage:data', 'ascii').toString('hex')

                // Operation
                const operation             = await aggregatorFactoryInstance.methods.updateMetadata(key, hash).send();
                await operation.confirmation();
    
                // Final values
                aggregatorFactoryStorage    = await aggregatorFactoryInstance.storage();
                const updatedData           = await aggregatorFactoryStorage.metadata.get(key);

                // Assertion
                assert.equal(updatedData, hash);
            } catch (e) {
                console.dir(e, {depth: 5})
            }
        });
    });

    describe('updateConfig', () => {
        
        it('Non-admin should not be able to call this entrypoint', async () => {
            try {
                // Initial values
                await helperFunctions.signerFactory(tezos, david.sk);
                const aggregatorNameMaxLength   : BigNumber = new BigNumber(100);

                // Operation
                await chai.expect(aggregatorFactoryInstance.methods.updateConfig(aggregatorNameMaxLength, "configAggregatorNameMaxLength").send()).to.be.rejected;
            } catch (e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should be able to update the aggregator name max length', async () => {
            try {
                // Initial values
                await helperFunctions.signerFactory(tezos, bob.sk);
                const aggregatorNameMaxLength   : BigNumber = new BigNumber(100);

                // Operation
                const operation                             = await aggregatorFactoryInstance.methods.updateConfig(aggregatorNameMaxLength, "configAggregatorNameMaxLength").send();
                await operation.confirmation();
    
                // Final values
                aggregatorFactoryStorage                    = await aggregatorFactoryInstance.storage();
    
                // Assertion
                assert.deepEqual(aggregatorFactoryStorage.config.aggregatorNameMaxLength,  aggregatorNameMaxLength);
            } catch (e) {
                console.dir(e, {depth: 5})
            }
        });
    });

    describe('%updateWhitelistContracts', () => {
        it('Non-admin should not be able to call this entrypoint', async () => {
            try {
                // Initial values
                await helperFunctions.signerFactory(tezos, david.sk);
                const contractName      = 'testContract';
                const contractAddress   = bob.pkh;

                // Operation
                await chai.expect(aggregatorFactoryInstance.methods.updateWhitelistContracts(contractName, contractAddress).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should be able to update the aggregator contract whitelist contracts', async () => {
            try {
                // Initial values
                await helperFunctions.signerFactory(tezos, bob.sk);
                const contractName          = 'testContract';
                const contractAddress       = bob.pkh;

                // Operation
                const operation             = await aggregatorFactoryInstance.methods.updateWhitelistContracts(contractName, contractAddress).send();
                await operation.confirmation();
    
                // Final values
                aggregatorFactoryStorage    = await aggregatorFactoryInstance.storage();
                const contractsMapEntry     = await aggregatorFactoryStorage.whitelistContracts.get(contractName);

                // Assertion
                assert.deepEqual(contractsMapEntry, contractAddress);
            } catch (e) {
                console.dir(e, {depth: 5})
            }
        });
    });

    describe('%updateGeneralContracts', () => {
        it('Non-admin should not be able to call this entrypoint', async () => {
            try {
                // Initial values
                await helperFunctions.signerFactory(tezos, david.sk);
                const contractName      = 'testContract';
                const contractAddress   = bob.pkh;

                // Operation
                await chai.expect(aggregatorFactoryInstance.methods.updateGeneralContracts(contractName, contractAddress).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should be able to update the aggregator contract whitelist contracts', async () => {
            try {
                // Initial values
                await helperFunctions.signerFactory(tezos, bob.sk);
                const contractName          = 'testContract';
                const contractAddress       = bob.pkh;

                // Operation
                const operation             = await aggregatorFactoryInstance.methods.updateGeneralContracts(contractName, contractAddress).send();
                await operation.confirmation();
    
                // Final values
                aggregatorFactoryStorage    = await aggregatorFactoryInstance.storage();
                const contractsMapEntry     = await aggregatorFactoryStorage.generalContracts.get(contractName);

                // Assertion
                assert.deepEqual(contractsMapEntry, contractAddress);
            } catch (e) {
                console.dir(e, {depth: 5})
            }
        });
    });

    describe('%setLambda', () => {
        it('Non-admin should not be able to call this entrypoint', async () => {
            try {
                // Initial values
                await helperFunctions.signerFactory(tezos, david.sk);
                const bytes  = Buffer.from('tezos-storage:data', 'ascii').toString('hex')
    
                // Operation
                await chai.expect(aggregatorFactoryInstance.methods.setLambda("testSetLambda", bytes).send()).to.be.rejected;
            } catch (e){
                console.dir(e, {depth: 5})
            }
        });
    });

    describe('%setProductLambda', () => {
        it('Non-admin should not be able to call this entrypoint', async () => {
            try {
                // Initial values
                await helperFunctions.signerFactory(tezos, david.sk);
                const bytes  = Buffer.from('tezos-storage:data', 'ascii').toString('hex')
    
                // Operation
                await chai.expect(aggregatorFactoryInstance.methods.setProductLambda("testSetLambda", bytes).send()).to.be.rejected;
            } catch (e){
                console.dir(e, {depth: 5})
            }
        });
    });
});
