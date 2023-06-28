import assert from "assert";
import BigNumber from 'bignumber.js';

import { MVK, TEZ, Utils } from "./helpers/Utils";

const chai = require("chai");
import { MichelsonMap } from "@taquito/taquito";
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

import { bob, alice, eve, mallory, david, oscar, susie, trudy, isaac, ivan } from "../scripts/sandbox/accounts";
import { 
    signerFactory
} from './helpers/helperFunctions'
import { mockSatelliteData } from "./helpers/mockSampleData";
import { before } from "mocha";

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

interface IOracleObservationType {
    data: BigNumber;
    epoch: number;
    round: number;
    aggregatorAddress: string;
}

describe('Aggregator Tests', async () => {

    var utils: Utils
    let tezos 

    let doormanAddress
    let tokenId = 0

    let aggregatorInstance;
    let doormanInstance;
    let mvkTokenInstance;
    let delegationInstance;
    let aggregatorFactoryInstance;
    let treasuryInstance;
    let governanceSatelliteInstance;

    let admin
    let adminSk

    let satelliteOne
    let satelliteOneSk 
    let satelliteTwo
    let satelliteTwoSk 
    let satelliteThree
    let satelliteThreeSk 
    let satelliteFour
    let satelliteFourSk 
    let satelliteFive
    let satelliteFiveSk 

    let aggregatorStorage;
    let doormanStorage;
    let mvkTokenStorage;
    let delegationStorage;
    let aggregatorFactoryStorage;
    let treasuryStorage;
    let governanceSatelliteStorage;

    let updateOperatorsOperation 
    let addOracleOperation
    let registerAsSatelliteOperation
    let unregisterAsSatelliteOperation

    let epoch: number = 1;
    let round: number = 1;

    before("setup", async () => {
        
        utils = new Utils();
        await utils.init(bob.sk);
        tezos = utils.tezos

        admin               = bob.pkh;
        adminSk             = bob.sk;

        satelliteOne        = alice.pkh;
        satelliteOneSk      = alice.sk;

        satelliteTwo        = eve.pkh;
        satelliteTwoSk      = eve.sk;

        satelliteThree      = susie.pkh;
        satelliteThreeSk    = susie.sk;

        satelliteFour       = oscar.pkh;
        satelliteFourSk     = oscar.sk;

        satelliteFive       = trudy.pkh;
        satelliteFiveSk     = trudy.sk;

        doormanAddress                  = contractDeployments.doorman.address;

        aggregatorInstance              = await utils.tezos.contract.at(contractDeployments.aggregator.address);
        aggregatorStorage               = await aggregatorInstance.storage();

        doormanInstance                 = await utils.tezos.contract.at(doormanAddress);
        doormanStorage                  = await doormanInstance.storage();

        delegationInstance              = await utils.tezos.contract.at(contractDeployments.delegation.address);
        delegationStorage               = await delegationInstance.storage();

        mvkTokenInstance                = await utils.tezos.contract.at(contractDeployments.mvkToken.address);
        mvkTokenStorage                 = await mvkTokenInstance.storage();

        treasuryInstance                = await utils.tezos.contract.at(contractDeployments.treasury.address);
        treasuryStorage                 = await treasuryInstance.storage();

        governanceSatelliteInstance     = await utils.tezos.contract.at(contractDeployments.governanceSatellite.address);
        governanceSatelliteStorage      = await governanceSatelliteInstance.storage();

        aggregatorFactoryInstance       = await utils.tezos.contract.at(contractDeployments.aggregatorFactory.address);
        aggregatorFactoryStorage        = await aggregatorFactoryInstance.storage();

        // Track original aggregator if it is not currently tracked
        const trackedAggregators = await aggregatorFactoryStorage.trackedAggregators;
        if(!trackedAggregators.includes(aggregatorInstance.address)){
            const trackAggregatorOperation = await aggregatorFactoryInstance.methods.trackAggregator(aggregatorInstance.address).send();
            await trackAggregatorOperation.confirmation();
        }

        // ------------------------------------------------------------------
        // Setup oracles for test
        // ------------------------------------------------------------------
        
        await signerFactory(tezos, adminSk);

        if(await aggregatorStorage.oracleLedger.get(satelliteOne) === undefined){
            addOracleOperation = await aggregatorInstance.methods.addOracle(satelliteOne).send();
            await addOracleOperation.confirmation();
        }

        if(await aggregatorStorage.oracleLedger.get(satelliteTwo) === undefined){
            addOracleOperation = await aggregatorInstance.methods.addOracle(satelliteTwo).send();
            await addOracleOperation.confirmation();
        }

        if(await aggregatorStorage.oracleLedger.get(satelliteThree) === undefined){
            addOracleOperation = await aggregatorInstance.methods.addOracle(satelliteThree).send();
            await addOracleOperation.confirmation();
        }

        if(await aggregatorStorage.oracleLedger.get(satelliteFive) === undefined){
            addOracleOperation = await aggregatorInstance.methods.addOracle(satelliteFive).send();
            await addOracleOperation.confirmation();
        }

        // ------------------------------------------------------------------
        // Setup rounds and epoch
        // ------------------------------------------------------------------

        const lastCompletedData = await aggregatorInstance.contractViews.getlastCompletedData().executeView({ viewCaller : admin});

        epoch = lastCompletedData.epoch.toNumber() == 1 ? 1 : lastCompletedData.epoch.toNumber() + 1;
        round = lastCompletedData.round.toNumber() == 1 ? 1 : lastCompletedData.round.toNumber() + 1;

        // Set XTZ Reward to be higher for tests (from 0.0013 xtz to 1 xtz)
        // ------------------------------------------------------------------

        // admin sets reward amount to be 1 tez
        await signerFactory(tezos, adminSk);
        const rewardAmountXtz = TEZ(1); 
        const updateConfigOperation = await aggregatorInstance.methods.updateConfig(
            rewardAmountXtz, "configRewardAmountXtz"
        ).send();
        await updateConfigOperation.confirmation();
    
    });

    describe('%addOracle', () => {
        beforeEach("Set signer to admin", async () => {
            await signerFactory(tezos, bob.sk)
        });

        it('Non-admin should not be able to call this entrypoint', async () => {
            try{
                // Initial values
                await signerFactory(tezos, david.sk);
                const oracleAddress     = susie.pkh;
    
                // Operation
                await chai.expect(aggregatorInstance.methods.addOracle(oracleAddress).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should not be able to add an already existing oracle', async () => {
            try {
                // Initial values
                const oracleAddress     = alice.pkh;
    
                // Operation
                await chai.expect(aggregatorInstance.methods.addOracle(oracleAddress).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should be able to add an oracle to the aggregator', async () => {
            try {
                // Initial values
                aggregatorStorage       = await aggregatorInstance.storage();
                const oracleAddress     = oscar.pkh;
    
                // Operation
                const operation         = await aggregatorInstance.methods.addOracle(oracleAddress).send();
                await operation.confirmation();
                
                // Final values
                aggregatorStorage           = await aggregatorInstance.storage();
                
                // Assertions
                assert.notStrictEqual(await aggregatorStorage.oracleLedger.get(oracleAddress),undefined);
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    });


    describe('%updateOracle', () => {
        beforeEach("Set signer to susie", async () => {
            await signerFactory(tezos, susie.sk)
        });

        it('satellite should be able to update their public key and peer id', async () => {
            try {
                
                // Initial values
                const oracleAddress     = susie.pkh;

                const newPublicKey      = oscar.pk;
                const newPeerId         = "newPeerId";
    
                // Operation
                const susieUpdateSatelliteOperation = await delegationInstance.methods.updateSatelliteRecord(
                    "Updated Satellite by Susie", 
                    "Updated Satellite Description - Susie", 
                    "https://image.url", 
                    "https://image.url", 
                    "1000",
                    newPublicKey,
                    newPeerId
                ).send();
                await susieUpdateSatelliteOperation.confirmation();

                // Operation
                const updateOracleOperation = await aggregatorInstance.methods.updateOracle().send();
                await updateOracleOperation.confirmation();
                
                // Final values
                aggregatorStorage       = await aggregatorInstance.storage();
                const susieOracleInfo   = await aggregatorStorage.oracleLedger.get(oracleAddress);
                
                const publicKey = susieOracleInfo.oraclePublicKey;
                const peerId = susieOracleInfo.oraclePeerId;
                
                // Assertions
                assert.equal(publicKey, newPublicKey);
                assert.equal(peerId, peerId);

            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

    });

    describe('%removeOracle', () => {
        beforeEach("Set signer to admin", async () => {
            await signerFactory(tezos, bob.sk)
        });
        
        it('Non-admin should not be able to call this entrypoint', async () => {
            try{
                // Initial values
                await signerFactory(tezos, david.sk);
                const oracleAddress = susie.pkh;

                // Operation    
                await chai.expect(aggregatorInstance.methods.removeOracle(oracleAddress).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should not be able to call this entrypoint if the oracle does not exists', async () => {
            try {
                // Initial values
                const oracleAddress = ivan.pkh;

                // Operation
                await chai.expect(aggregatorInstance.methods.removeOracle(oracleAddress).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should be able to remove an oracle from the aggregator', async () => {
            try {
                // Initial values
                aggregatorStorage       = await aggregatorInstance.storage();
                const oracleAddress     = susie.pkh;

                // Operation
                const operation     = await aggregatorInstance.methods.removeOracle(oracleAddress).send();
                await operation.confirmation();
    
                // Final values
                aggregatorStorage           = await aggregatorInstance.storage();

                // Assertion
                assert.strictEqual(await aggregatorStorage.oracleLedger.get(susie.pkh), undefined);
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    });

    describe('%updateData', () => {

        // Constant variables
        const observations = [
            {
                "oracle": oscar.pkh,
                "data": new BigNumber(10142857143)
            },
            {
                "oracle": eve.pkh,
                "data": new BigNumber(10142853322)
            },
            {
                "oracle": alice.pkh,
                "data": new BigNumber(10142857900)
            },
            {
                "oracle": trudy.pkh,
                "data": new BigNumber(10142857901)
            }
        ];

        it('Non-oracle should not be able to call this entrypoint', async () => {
            try {
                // Initial values
                const oracleObservations = new MichelsonMap<string, IOracleObservationType>();
                for (const { oracle, data } of observations) {
                    oracleObservations.set(oracle, {
                        data,
                        epoch,
                        round,
                        aggregatorAddress: contractDeployments.aggregator.address
                    });
                };
                const signatures = new MichelsonMap<string, string>();
        
                // Sign observations
                await signerFactory(tezos, alice.sk);
                signatures.set(alice.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, eve.sk);
                signatures.set(eve.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, trudy.sk);
                signatures.set(trudy.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, oscar.sk);
                signatures.set(oscar.pkh, await utils.signOracleDataResponses(oracleObservations));
        
                // Operation
                await signerFactory(tezos, ivan.sk);
                await chai.expect(aggregatorInstance.methods.updateData(oracleObservations, signatures).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Oracle should be able to add data to the aggregator', async () => {
            try {
                // Initial values
                aggregatorStorage                       = await aggregatorInstance.storage();
                delegationStorage                       = await delegationInstance.storage();
                const oracleObservations                = new MichelsonMap<string, IOracleObservationType>();
                const oracleVotingPowers : any          = new Map<string, number>();
                var totalVotingPower                    = 0;
                for (const { oracle, data } of observations) {
                    // Get oracle voting power
                    const satelliteRecord               = await delegationStorage.satelliteLedger.get(oracle);
                    const votingPower                   = satelliteRecord.totalDelegatedAmount.toNumber() + satelliteRecord.stakedMvkBalance.toNumber();
                    totalVotingPower                    += votingPower;
                    oracleVotingPowers.set(oracle, votingPower)

                    // Set observation
                    oracleObservations.set(oracle, {
                        data,
                        epoch,
                        round,
                        aggregatorAddress: contractDeployments.aggregator.address
                    });

                };
                const signatures                        = new MichelsonMap<string, string>();
                var startOscarSMvkRewards               = await aggregatorStorage.oracleRewardStakedMvk.get(oscar.pkh);
                startOscarSMvkRewards                   = startOscarSMvkRewards ? startOscarSMvkRewards.toNumber() : 0;
                var startOscarXtzRewards                = await aggregatorStorage.oracleRewardXtz.get(oscar.pkh);
                startOscarXtzRewards                    = startOscarXtzRewards ? startOscarXtzRewards.toNumber() : 0;
                const smvkReward                        = aggregatorStorage.config.rewardAmountStakedMvk.toNumber();
                const xtzReward                         = aggregatorStorage.config.rewardAmountXtz.toNumber();
                const rewardRatio                       = oracleVotingPowers.get(oscar.pkh) / totalVotingPower;
    
                // Sign observations
                await signerFactory(tezos, alice.sk);
                signatures.set(alice.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, eve.sk);
                signatures.set(eve.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, trudy.sk);
                signatures.set(trudy.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, oscar.sk);
                signatures.set(oscar.pkh, await utils.signOracleDataResponses(oracleObservations));
    
                // Operation
                const operation                         = await aggregatorInstance.methods.updateData(oracleObservations, signatures).send();
                await operation.confirmation();

                // Final values
                aggregatorStorage                       = await aggregatorInstance.storage();
                const endOscarSMvkRewards             = await aggregatorStorage.oracleRewardStakedMvk.get(oscar.pkh);
                const endOscarXtzRewards              = await aggregatorStorage.oracleRewardXtz.get(oscar.pkh);
                const expectedMaintainerSMvkReward      = Math.trunc(rewardRatio * smvkReward) + startOscarSMvkRewards;
                const expectedMaintainerXtzReward      = xtzReward + startOscarXtzRewards;

                // Assertions
                assert.equal(endOscarSMvkRewards.toNumber(), expectedMaintainerSMvkReward);
                assert.equal(endOscarXtzRewards.toNumber(), expectedMaintainerXtzReward);
                assert.deepEqual(aggregatorStorage.lastCompletedData.round,new BigNumber(round));
                assert.deepEqual(aggregatorStorage.lastCompletedData.epoch,new BigNumber(epoch));
                assert.deepEqual(aggregatorStorage.lastCompletedData.data,new BigNumber(10142857521));
                assert.deepEqual(aggregatorStorage.lastCompletedData.percentOracleResponse,new BigNumber(10000));
                round++;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Oracle should be able to increase its rewards when adding data to the aggregator if it stakes more or have more delegated to it', async () => {
            try {
                // Pre-operations
                // Increase oracle maintainer stake
                await signerFactory(tezos, oscar.sk);
                const additionalStakeAmount             = MVK(10);
                var stakeOperation                      = await doormanInstance.methods.stake(additionalStakeAmount).send();
                await stakeOperation.confirmation();

                // Add a delegate to another oracle
                await signerFactory(tezos, isaac.sk);
                var updateOperators = await mvkTokenInstance.methods
                    .update_operators([
                    {
                        add_operator: {
                            owner: isaac.pkh,
                            operator: doormanAddress,
                            token_id: 0,
                        },
                    },
                    ])
                    .send()
                await updateOperators.confirmation();  
                stakeOperation                          = await doormanInstance.methods.stake(additionalStakeAmount).send();
                await stakeOperation.confirmation();
                const delegateOperation                 = await delegationInstance.methods.delegateToSatellite(isaac.pkh, alice.pkh).send()
                await delegateOperation.confirmation();

                // Initial values
                aggregatorStorage                       = await aggregatorInstance.storage();
                delegationStorage                       = await delegationInstance.storage();
                const oracleObservations                = new MichelsonMap<string, IOracleObservationType>();
                const oracleVotingPowers                = new Map<string, number>();
                var totalVotingPower                    = 0;
                for (const { oracle, data } of observations) {
                    // Get oracle voting power
                    const satelliteRecord               = await delegationStorage.satelliteLedger.get(oracle);
                    const votingPower                   = satelliteRecord.totalDelegatedAmount.toNumber() + satelliteRecord.stakedMvkBalance.toNumber();
                    totalVotingPower                    += votingPower;
                    oracleVotingPowers.set(oracle, votingPower)

                    // Set observation
                    oracleObservations.set(oracle, {
                        data,
                        epoch,
                        round,
                        aggregatorAddress: contractDeployments.aggregator.address
                    });

                };
                const signatures                        = new MichelsonMap<string, string>();
                const startOscarSMvkRewards           = await aggregatorStorage.oracleRewardStakedMvk.get(oscar.pkh);
                const startOscarXtzRewards            = await aggregatorStorage.oracleRewardXtz.get(oscar.pkh);
                const smvkReward                        = aggregatorStorage.config.rewardAmountStakedMvk.toNumber();
                const xtzReward                         = aggregatorStorage.config.rewardAmountXtz.toNumber();
                const rewardRatio                       = oracleVotingPowers.get(oscar.pkh) / totalVotingPower;
    
                // Sign observations
                await signerFactory(tezos, alice.sk);
                signatures.set(alice.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, eve.sk);
                signatures.set(eve.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, trudy.sk);
                signatures.set(trudy.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, oscar.sk);
                signatures.set(oscar.pkh, await utils.signOracleDataResponses(oracleObservations));
    
                // Operation
                const operation                         = await aggregatorInstance.methods.updateData(oracleObservations, signatures).send();
                await operation.confirmation();

                // Final values
                aggregatorStorage                       = await aggregatorInstance.storage();
                const endOscarSMvkRewards             = await aggregatorStorage.oracleRewardStakedMvk.get(oscar.pkh);
                const endOscarXtzRewards              = await aggregatorStorage.oracleRewardXtz.get(oscar.pkh);
                const expectedMaintainerSMvkReward      = Math.trunc(startOscarSMvkRewards.toNumber() + rewardRatio * smvkReward);
                const expectedMaintainerXtzReward       = startOscarXtzRewards.toNumber() + xtzReward;

                // Assertions
                assert.notStrictEqual(startOscarSMvkRewards, undefined);
                assert.notStrictEqual(startOscarXtzRewards, undefined);
                assert.equal(endOscarSMvkRewards.toNumber(), expectedMaintainerSMvkReward);
                assert.equal(endOscarXtzRewards.toNumber(), expectedMaintainerXtzReward);
                assert.deepEqual(aggregatorStorage.lastCompletedData.round,new BigNumber(round));
                assert.deepEqual(aggregatorStorage.lastCompletedData.epoch,new BigNumber(epoch));
                assert.deepEqual(aggregatorStorage.lastCompletedData.data,new BigNumber(10142857521));
                assert.deepEqual(aggregatorStorage.lastCompletedData.percentOracleResponse,new BigNumber(10000));
                round++;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Oracle should be able to decrease its rewards when adding data to the aggregator if it unstakes or lose delegates', async () => {
            try {
                // Pre-operations
                // Increase oracle maintainer stake
                await signerFactory(tezos, oscar.sk);
                const unstakeAmount                     = MVK(10);
                const unstakeOperation                  = await doormanInstance.methods.unstake(unstakeAmount).send();
                await unstakeOperation.confirmation();

                // Add a delegate to another oracle
                await signerFactory(tezos, isaac.sk);
                const undelegateOperation               = await delegationInstance.methods.undelegateFromSatellite(isaac.pkh).send()
                await undelegateOperation.confirmation();

                // Initial values
                aggregatorStorage                       = await aggregatorInstance.storage();
                delegationStorage                       = await delegationInstance.storage();
                const oracleObservations                = new MichelsonMap<string, IOracleObservationType>();
                const oracleVotingPowers                = new Map<string, number>();
                var totalVotingPower                    = 0;
                for (const { oracle, data } of observations) {
                    // Get oracle voting power
                    const satelliteRecord               = await delegationStorage.satelliteLedger.get(oracle);
                    const votingPower                   = satelliteRecord.totalDelegatedAmount.toNumber() + satelliteRecord.stakedMvkBalance.toNumber();
                    totalVotingPower                    += votingPower;
                    oracleVotingPowers.set(oracle, votingPower)

                    // Set observation
                    oracleObservations.set(oracle, {
                        data,
                        epoch,
                        round,
                        aggregatorAddress: contractDeployments.aggregator.address
                    });

                };
                const signatures                        = new MichelsonMap<string, string>();
                const startOscarSMvkRewards           = await aggregatorStorage.oracleRewardStakedMvk.get(oscar.pkh);
                const startOscarXtzRewards            = await aggregatorStorage.oracleRewardXtz.get(oscar.pkh);
                const smvkReward                        = aggregatorStorage.config.rewardAmountStakedMvk.toNumber();
                const xtzReward                         = aggregatorStorage.config.rewardAmountXtz.toNumber();
                const rewardRatio                       = oracleVotingPowers.get(oscar.pkh) / totalVotingPower;
    
                // Sign observations
                await signerFactory(tezos, alice.sk);
                signatures.set(alice.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, eve.sk);
                signatures.set(eve.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, trudy.sk);
                signatures.set(trudy.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, oscar.sk);
                signatures.set(oscar.pkh, await utils.signOracleDataResponses(oracleObservations));
    
                // Operation
                await signerFactory(tezos, oscar.sk);
                const operation                         = await aggregatorInstance.methods.updateData(oracleObservations, signatures).send();
                await operation.confirmation();

                // Final values
                aggregatorStorage                       = await aggregatorInstance.storage();
                const endOscarSMvkRewards               = await aggregatorStorage.oracleRewardStakedMvk.get(oscar.pkh);
                const endOscarXtzRewards                = await aggregatorStorage.oracleRewardXtz.get(oscar.pkh);
                const expectedMaintainerSMvkReward      = Math.trunc(startOscarSMvkRewards.toNumber() + rewardRatio * smvkReward);
                const expectedMaintainerXtzReward       = xtzReward + startOscarXtzRewards.toNumber();

                // Assertions
                assert.equal(endOscarXtzRewards.toNumber(), expectedMaintainerXtzReward);
                assert.equal(endOscarSMvkRewards.toNumber(), expectedMaintainerSMvkReward);
                assert.deepEqual(aggregatorStorage.lastCompletedData.round,new BigNumber(round));
                assert.deepEqual(aggregatorStorage.lastCompletedData.epoch,new BigNumber(epoch));
                assert.deepEqual(aggregatorStorage.lastCompletedData.data,new BigNumber(10142857521));
                assert.deepEqual(aggregatorStorage.lastCompletedData.percentOracleResponse,new BigNumber(10000));
                round++;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Oracle should not be able to call this entrypoint if there too few observations in the map', async () => {
            try {
                // Initial values
                const oracleObservations = new MichelsonMap<string, IOracleObservationType>();
                oracleObservations.set(observations[0].oracle, {
                    data: observations[0].data,
                    epoch,
                    round,
                    aggregatorAddress: contractDeployments.aggregator.address
                });
                const signatures = new MichelsonMap<string, string>();
    
                // Sign observations
                await signerFactory(tezos, alice.sk);
                signatures.set(alice.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, eve.sk);
                signatures.set(eve.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, trudy.sk);
                signatures.set(trudy.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, oscar.sk);
                signatures.set(oscar.pkh, await utils.signOracleDataResponses(oracleObservations));
    
                // Operation
                await chai.expect(aggregatorInstance.methods.updateData(oracleObservations, signatures).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }   
        });

        it('Oracle should not be able to call this entrypoint if there too few signatures in the map', async () => {
            try {
                // Initial values
                const oracleObservations = new MichelsonMap<string, IOracleObservationType>();
                for (const { oracle, data } of observations) {
                   oracleObservations.set(oracle, {
                       data,
                       epoch,
                       round,
                       aggregatorAddress: contractDeployments.aggregator.address
                     });
                };
                const signatures = new MichelsonMap<string, string>();
                
                // Operation
                await chai.expect(aggregatorInstance.methods.updateData(oracleObservations, signatures).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
            
        });

        it('Oracle should not be able to call this entrypoint if the wrong aggregator is specified in the observations', async () => {
            try {
                // Initial values
                const oracleObservations = new MichelsonMap<string, IOracleObservationType>();
                for (const { oracle, data } of observations) {
                   oracleObservations.set(oracle, {
                       data,
                       epoch,
                       round,
                       aggregatorAddress: contractDeployments.aggregatorFactory.address
                     });
                };
                const signatures = new MichelsonMap<string, string>();
                
                // Sign observations
                await signerFactory(tezos, alice.sk);
                signatures.set(alice.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, eve.sk);
                signatures.set(eve.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, trudy.sk);
                signatures.set(trudy.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, oscar.sk);
                signatures.set(oscar.pkh, await utils.signOracleDataResponses(oracleObservations));
    
                // Operation
                await chai.expect(aggregatorInstance.methods.updateData(oracleObservations, signatures).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Oracle should not be able to call this entrypoint if at least one the oracle specified in the observations is wrong', async () => {
            try {
                // Initial values
                const observations_bad = [
                    {
                       "oracle": alice.pkh,
                       "data": new BigNumber(10142857143)
                    },
                    {
                        "oracle": eve.pkh,
                        "data": new BigNumber(10142853322)
                    },
                    {
                        "oracle": oscar.pkh,
                        "data": new BigNumber(10142857900)
                    },
                    {
                        "oracle": isaac.pkh,
                        "data": new BigNumber(10144537815)
                    },
                ];
                const oracleObservations = new MichelsonMap<string, IOracleObservationType>();
                for (const { oracle, data } of observations_bad) {
                    oracleObservations.set(oracle, {
                        data,
                        epoch,
                        round,
                        aggregatorAddress: contractDeployments.aggregator.address
                    });
                };
                const signatures = new MichelsonMap<string, string>();
    
                // Sign observations
                await signerFactory(tezos, alice.sk);
                signatures.set(alice.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, eve.sk);
                signatures.set(eve.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, trudy.sk);
                signatures.set(trudy.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, oscar.sk);
                signatures.set(oscar.pkh, await utils.signOracleDataResponses(oracleObservations));
    
                // Operation
                await chai.expect(aggregatorInstance.methods.updateData(oracleObservations, signatures).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Oracle should not be able to call this entrypoint if the all epochs does not match in the observations', async () => {
            try{
                // Initial values
                const observations_bad = [
                    {
                       "oracle": alice.pkh,
                       "data": new BigNumber(10142857143),
                       "epoch": 1
                    },
                    {
                        "oracle": eve.pkh,
                        "data": new BigNumber(10142853322),
                        "epoch": 1
                    },
                    {
                        "oracle": oscar.pkh,
                        "data": new BigNumber(10142857900),
                        "epoch": 1
                    },
                    {
                        "oracle": isaac.pkh,
                        "data": new BigNumber(10144537815),
                        "epoch": 2
                    },
                ];
                const oracleObservations = new MichelsonMap<string, IOracleObservationType>();
                for (const { oracle, data, epoch } of observations_bad) {
                    oracleObservations.set(oracle, {
                        data,
                        epoch,
                        round,
                        aggregatorAddress: contractDeployments.aggregatorFactory.address
                    });
                };
                const signatures = new MichelsonMap<string, string>();
    
                // Sign observations
                await signerFactory(tezos, alice.sk);
                signatures.set(alice.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, eve.sk);
                signatures.set(eve.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, trudy.sk);
                signatures.set(trudy.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, oscar.sk);
                signatures.set(oscar.pkh, await utils.signOracleDataResponses(oracleObservations));
    
                // Operation
                await chai.expect(aggregatorInstance.methods.updateData(oracleObservations, signatures).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Oracle should not be able to call this entrypoint if the all rounds does not match in the observations', async () => {
            try {
                // Initial values
                const observations_bad = [
                    {
                       "oracle": alice.pkh,
                       "data": new BigNumber(10142857143),
                       "round": 2
                    },
                    {
                        "oracle": eve.pkh,
                        "data": new BigNumber(10142853322),
                        "round": 2
                    },
                    {
                        "oracle": oscar.pkh,
                        "data": new BigNumber(10142857900),
                        "round": 2
                    },
                    {
                        "oracle": isaac.pkh,
                        "data": new BigNumber(10144537815),
                        "round": 3
                    },
                ];
                const oracleObservations = new MichelsonMap<string, IOracleObservationType>();
                for (const { oracle, data, round } of observations_bad) {
                    oracleObservations.set(oracle, {
                        data,
                        epoch,
                        round,
                        aggregatorAddress: contractDeployments.aggregatorFactory.address
                    });
                };
                const signatures = new MichelsonMap<string, string>();
      
                // Sign observations
                await signerFactory(tezos, alice.sk);
                signatures.set(alice.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, eve.sk);
                signatures.set(eve.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, trudy.sk);
                signatures.set(trudy.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, oscar.sk);
                signatures.set(oscar.pkh, await utils.signOracleDataResponses(oracleObservations));
      
                // Operation
                await chai.expect(aggregatorInstance.methods.updateData(oracleObservations, signatures).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }   
        });

        it('Oracle should not be able to call this entrypoint if the epoch mentionned in the observations is less or equal than the previous one', async () => {
            try {
                // Initial values
                const oracleObservations = new MichelsonMap<string, IOracleObservationType>();
                for (const { oracle, data } of observations) {
                   oracleObservations.set(oracle, {
                       data,
                       epoch: epoch - 1,
                       round,
                       aggregatorAddress: contractDeployments.aggregator.address
                     });
                };
                const signatures = new MichelsonMap<string, string>();
   
                // Sign observations
                await signerFactory(tezos, alice.sk);
                signatures.set(alice.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, eve.sk);
                signatures.set(eve.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, trudy.sk);
                signatures.set(trudy.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, oscar.sk);
                signatures.set(oscar.pkh, await utils.signOracleDataResponses(oracleObservations));
    
                // Operation
                await chai.expect(aggregatorInstance.methods.updateData(oracleObservations, signatures).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Oracle should not be able to call this entrypoint if at least one of the signatures is wrong', async () => {
            try {
                // Initial values
                const oracleObservations = new MichelsonMap<string, IOracleObservationType>();
                for (const { oracle, data } of observations) {
                   oracleObservations.set(oracle, {
                       data,
                       epoch,
                       round,
                       aggregatorAddress: contractDeployments.aggregator.address
                     });
                };
                const signatures = new MichelsonMap<string, string>();
    
                // Sign observations
                await signerFactory(tezos, alice.sk);
                signatures.set(alice.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, isaac.sk);
                signatures.set(eve.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, trudy.sk);
                signatures.set(trudy.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, oscar.sk);
                signatures.set(oscar.pkh, await utils.signOracleDataResponses(oracleObservations));
    
                // Operation
                await chai.expect(aggregatorInstance.methods.updateData(oracleObservations, signatures).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Calling this entrypoint as a user defined as an oracle without being a satellite should update the ledger without updating the data', async () => {
            try {
                // Initial values
                aggregatorStorage                       = await aggregatorInstance.storage();
                delegationStorage                       = await delegationInstance.storage();
                const oracleObservations                = new MichelsonMap<string, IOracleObservationType>();
                const oracleVotingPowers : any          = new Map<string, number>();
                var totalVotingPower                    = 0;
                for (const { oracle, data } of observations) {
                    // Get oracle voting power
                    const satelliteRecord               = await delegationStorage.satelliteLedger.get(oracle);
                    const votingPower                   = satelliteRecord.totalDelegatedAmount.toNumber() + satelliteRecord.stakedMvkBalance.toNumber();
                    totalVotingPower                    += votingPower;
                    oracleVotingPowers.set(oracle, votingPower)

                    // Set observation
                    oracleObservations.set(oracle, {
                        data,
                        epoch,
                        round,
                        aggregatorAddress: contractDeployments.aggregator.address
                    });

                };
                const signatures                        = new MichelsonMap<string, string>();
                var startOscarSMvkRewards               = await aggregatorStorage.oracleRewardStakedMvk.get(oscar.pkh);
                startOscarSMvkRewards                   = startOscarSMvkRewards ? startOscarSMvkRewards.toNumber() : 0;
                var startOscarXtzRewards                = await aggregatorStorage.oracleRewardXtz.get(oscar.pkh);
                startOscarXtzRewards                    = startOscarXtzRewards ? startOscarXtzRewards.toNumber() : 0;
                const startLastCompletedData            = aggregatorStorage.lastCompletedData;
                const startOracleInLedger               = await aggregatorStorage.oracleLedger.get(oscar.pkh);
    
                // Sign observations
                await signerFactory(tezos, alice.sk);
                signatures.set(alice.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, eve.sk);
                signatures.set(eve.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, trudy.sk);
                signatures.set(trudy.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, oscar.sk);
                signatures.set(oscar.pkh, await utils.signOracleDataResponses(oracleObservations));

                // User unregisters
                unregisterAsSatelliteOperation          = await delegationInstance.methods.unregisterAsSatellite(oscar.pkh).send();
                await unregisterAsSatelliteOperation.confirmation();
    
                // Operation
                const operation                         = await aggregatorInstance.methods.updateData(oracleObservations, signatures).send();
                await operation.confirmation();

                // Final values
                aggregatorStorage                       = await aggregatorInstance.storage();
                const endOscarSMvkRewards               = await aggregatorStorage.oracleRewardStakedMvk.get(oscar.pkh);
                const endOscarXtzRewards                = await aggregatorStorage.oracleRewardXtz.get(oscar.pkh);
                const endLastCompletedData              = aggregatorStorage.lastCompletedData;
                const endOracleInLedger                 = await aggregatorStorage.oracleLedger.get(oscar.pkh);

                // Assertions
                assert.notStrictEqual(startOracleInLedger, undefined);
                assert.strictEqual(endOracleInLedger, undefined);
                assert.equal(endOscarSMvkRewards.toNumber(), startOscarSMvkRewards);
                assert.equal(endOscarXtzRewards.toNumber(), startOscarXtzRewards);
                assert.deepEqual(endLastCompletedData.round,startLastCompletedData.round);
                assert.deepEqual(endLastCompletedData.epoch,startLastCompletedData.epoch);
                assert.deepEqual(endLastCompletedData.data,startLastCompletedData.data);
                assert.deepEqual(endLastCompletedData.percentOracleResponse,startLastCompletedData.percentOracleResponse);
                round++;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });
    });

    describe('%withdrawRewardStakedMvk', () => {

        before("Add the previously removed oracle", async () => {
            await signerFactory(tezos, oscar.sk)
            
            // Registers as satellite
            registerAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite(
                mockSatelliteData.oscar.name, 
                mockSatelliteData.oscar.desc, 
                mockSatelliteData.oscar.image, 
                mockSatelliteData.oscar.website,
                mockSatelliteData.oscar.satelliteFee,
                mockSatelliteData.oscar.oraclePublicKey,
                mockSatelliteData.oscar.oraclePeerId
            ).send();
            await registerAsSatelliteOperation.confirmation();

            // Add oracle
            await signerFactory(tezos, bob.sk)
            addOracleOperation          = await aggregatorInstance.methods.addOracle(oscar.pkh).send();
            await addOracleOperation.confirmation();

            await signerFactory(tezos, alice.sk)
        });

        beforeEach("Set signer to oracle", async () => {
            await signerFactory(tezos, alice.sk)
        });

        it('Oracle should be able to withdraw SMVK rewards', async () => {
            try {
                // Initial values
                aggregatorStorage                           = await aggregatorInstance.storage();
                delegationStorage                           = await delegationInstance.storage();
                const oracleVotingPowers                    = new Map<string, number>();
                const observations                          = [
                    {
                        "oracle": alice.pkh,
                        "data": new BigNumber(10142857143)
                    },
                    {
                        "oracle": eve.pkh,
                        "data": new BigNumber(10142853322)
                    },
                    {
                        "oracle": oscar.pkh,
                        "data": new BigNumber(10142857900)
                    },
                    {
                        "oracle": trudy.pkh,
                        "data": new BigNumber(10142857901)
                    }
                ];
                var totalVotingPower                        = 0;
                for (const { oracle, data } of observations) {
                    // Get oracle voting power
                    const satelliteRecord               = await delegationStorage.satelliteLedger.get(oracle);
                    const votingPower                   = satelliteRecord.totalDelegatedAmount.toNumber() + satelliteRecord.stakedMvkBalance.toNumber();
                    totalVotingPower                    += votingPower;
                    oracleVotingPowers.set(oracle, votingPower)
                };
                const aliceSatelliteFee                          = mockSatelliteData.alice.satelliteFee; // set when alice, eve, oscar registered as satellites in before setup
                const eveSatelliteFee                          = mockSatelliteData.eve.satelliteFee; // set when alice, eve, oscar registered as satellites in before setup
                const oscarSatelliteFee                          = mockSatelliteData.oscar.satelliteFee; // set when alice, eve, oscar registered as satellites in before setup
                const aliceStakedMvk                          = oracleVotingPowers.get(alice.pkh);
                const eveStakedMvk                          = oracleVotingPowers.get(eve.pkh);
                const oscarStakedMvk                      = oracleVotingPowers.get(oscar.pkh);
                const rewardAmountStakedMvk                 = aggregatorStorage.config.rewardAmountStakedMvk.toNumber();
                const aliceSMvkRewards                        = await aggregatorStorage.oracleRewardStakedMvk.get(alice.pkh);
                const eveSMvkRewards                        = await aggregatorStorage.oracleRewardStakedMvk.get(eve.pkh);
                const oscarSMvkRewards                    = await aggregatorStorage.oracleRewardStakedMvk.get(oscar.pkh);
                const beforeAliceRewardsLedger                = await delegationStorage.satelliteRewardsLedger.get(alice.pkh);
                const beforeEveRewardsLedger                = await delegationStorage.satelliteRewardsLedger.get(eve.pkh);
                const beforeOscarRewardsLedger            = await delegationStorage.satelliteRewardsLedger.get(oscar.pkh);
    
                // Operation
                const aliceWithdrawRewardStakedMvkOp          = await aggregatorInstance.methods.withdrawRewardStakedMvk(alice.pkh).send();
                await aliceWithdrawRewardStakedMvkOp.confirmation();
    
                const eveWithdrawRewardStakedMvkOp          = await aggregatorInstance.methods.withdrawRewardStakedMvk(eve.pkh).send();
                await eveWithdrawRewardStakedMvkOp.confirmation();
    
                const oscarWithdrawRewardStakedMvkOp      = await aggregatorInstance.methods.withdrawRewardStakedMvk(oscar.pkh).send();
                await oscarWithdrawRewardStakedMvkOp.confirmation();
    
                // Final values
                aggregatorStorage                           = await aggregatorInstance.storage();
                delegationStorage                           = await delegationInstance.storage();
                const aliceRewardsLedger                      = await delegationStorage.satelliteRewardsLedger.get(alice.pkh);
                const eveRewardsLedger                      = await delegationStorage.satelliteRewardsLedger.get(eve.pkh);
                const oscarRewardsLedger                  = await delegationStorage.satelliteRewardsLedger.get(oscar.pkh);
                const resetAliceRewardStakedMvk               = await aggregatorStorage.oracleRewardStakedMvk.get(alice.pkh);
                const resetEveRewardStakedMvk               = await aggregatorStorage.oracleRewardStakedMvk.get(eve.pkh);
                const resetOscarRewardStakedMvk           = await aggregatorStorage.oracleRewardStakedMvk.get(oscar.pkh);
                const finalAliceStakedMvkRewardsAfterFees     = aliceSatelliteFee * aliceSMvkRewards / 10000;
                const finalEveStakedMvkRewardsAfterFees     = eveSatelliteFee * eveSMvkRewards / 10000;
                const finalOscarStakedMvkRewardsAfterFees = oscarSatelliteFee * oscarSMvkRewards / 10000;
    
                // Assertions
                assert.equal(resetAliceRewardStakedMvk, 0);
                assert.equal(resetEveRewardStakedMvk, 0);
                assert.equal(resetOscarRewardStakedMvk, 0);
                assert.equal(aliceRewardsLedger.unpaid.toNumber(), beforeAliceRewardsLedger.unpaid.toNumber() + Math.trunc(finalAliceStakedMvkRewardsAfterFees));
                assert.equal(eveRewardsLedger.unpaid.toNumber(), beforeEveRewardsLedger.unpaid.toNumber() + Math.trunc(finalEveStakedMvkRewardsAfterFees));
                assert.equal(oscarRewardsLedger.unpaid.toNumber(), beforeOscarRewardsLedger.unpaid.toNumber() + Math.trunc(finalOscarStakedMvkRewardsAfterFees));
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });
    });

    describe('%withdrawRewardXtz', () => {

        beforeEach("Set signer to oracle", async () => {
            await signerFactory(tezos, alice.sk)
        });

        it('Oracle should be able to withdraw XTZ rewards', async () => {
            try {
                // Initial values
                aggregatorStorage                           = await aggregatorInstance.storage();
                const oraclePendingRewards                  = await aggregatorStorage.oracleRewardXtz.get(oscar.pkh);
                const beforeOscarTezBalance               = await utils.tezos.tz.getBalance(oscar.pkh);
                const beforeEveTezBalance                   = await utils.tezos.tz.getBalance(eve.pkh);
    
                // Operation
                // use alice to withdraw reward to the oracles and pay the gas cost for easier testing
                await signerFactory(tezos, alice.sk);
                
                const oscarWithdrawRewardXtzOp            = await aggregatorInstance.methods.withdrawRewardXtz(oscar.pkh).send();
                await oscarWithdrawRewardXtzOp.confirmation();
                
                const eveWithdrawRewardXtzOp                = await aggregatorInstance.methods.withdrawRewardXtz(eve.pkh).send();
                await eveWithdrawRewardXtzOp.confirmation();
    
                // Final values
                aggregatorStorage                           = await aggregatorInstance.storage();
                const resetOscarRewardXtz                 = await aggregatorStorage.oracleRewardXtz.get(oscar.pkh);
                const resetEveRewardXtz                     = await aggregatorStorage.oracleRewardXtz.get(eve.pkh);
                const oscarTezBalance                     = await utils.tezos.tz.getBalance(oscar.pkh);
                const eveTezBalance                         = await utils.tezos.tz.getBalance(eve.pkh);
    
                // Assertions
                assert.equal(resetOscarRewardXtz, 0);
                assert.equal(resetEveRewardXtz, undefined);
                assert.equal(oscarTezBalance.toNumber(), beforeOscarTezBalance.plus(oraclePendingRewards).toNumber());
                assert.equal(eveTezBalance.toNumber(), beforeEveTezBalance.toNumber());  
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });
    });

    describe('%updateConfig', () => {
        
        // Constants
        const decimals                      : BigNumber = new BigNumber(100);
        const alphaPercentPerThousand       : BigNumber = new BigNumber(2);

        const devTriggerBanDuration         : BigNumber = new BigNumber(100);
        const perThousandDeviationTrigger   : BigNumber = new BigNumber(100);
        const percentOracleThreshold        : BigNumber = new BigNumber(100);
        const heartBeatSeconds              : BigNumber = new BigNumber(100);

        const requestRateDevDepositFee      : BigNumber = new BigNumber(100);
        
        const deviationRewardStakedMvk      : BigNumber = new BigNumber(100);
        const deviationRewardAmountXtz      : BigNumber = new BigNumber(100);
        const rewardAmountXtz               : BigNumber = new BigNumber(100);
        const rewardAmountStakedMvk         : BigNumber = new BigNumber(100);

        beforeEach("Set signer to admin", async () => {
            await signerFactory(tezos, bob.sk)
        });

        it('Non-admin should not be able to call this entrypoint', async () => {
            try {
                // Initial values
                await signerFactory(tezos, david.sk);

                // Operation
                await chai.expect(aggregatorInstance.methods.updateConfig(decimals, "configDecimals").send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should be able to update the aggregator config', async () => {
            try {
                // Operation
                const testUpdateConfigDecimalsOp                = await aggregatorInstance.methods.updateConfig(
                decimals, "configDecimals"
                ).send();
                await testUpdateConfigDecimalsOp.confirmation();
    
                const testUpdateConfigAlphaPercentPerThousandOp = await aggregatorInstance.methods.updateConfig(
                alphaPercentPerThousand, "configAlphaPercentPerThousand"
                ).send();
                await testUpdateConfigAlphaPercentPerThousandOp.confirmation();
    
                
                const testUpdateConfigPercentOracleThresholdOp  = await aggregatorInstance.methods.updateConfig(
                percentOracleThreshold, "configPercentOracleThreshold"
                ).send();
                await testUpdateConfigPercentOracleThresholdOp.confirmation();
    
                const testUpdateConfigHeartBeatSecondsOp        = await aggregatorInstance.methods.updateConfig(
                heartBeatSeconds, "configHeartBeatSeconds"
                ).send();
                await testUpdateConfigHeartBeatSecondsOp.confirmation();
    
    
                const testUpdateConfigRewardAmountXtzOp         = await aggregatorInstance.methods.updateConfig(
                rewardAmountXtz, "configRewardAmountXtz"
                ).send();
                await testUpdateConfigRewardAmountXtzOp.confirmation();
    
                const testUpdateConfigRewardAmountStakedMvkOp   = await aggregatorInstance.methods.updateConfig(
                rewardAmountStakedMvk, "configRewardAmountStakedMvk"
                ).send();
                await testUpdateConfigRewardAmountStakedMvkOp.confirmation();

                // Final values
                aggregatorStorage                               = await aggregatorInstance.storage();
                assert.deepEqual(aggregatorStorage.config.decimals,                        decimals);
                assert.deepEqual(aggregatorStorage.config.alphaPercentPerThousand,         alphaPercentPerThousand);
    
                assert.deepEqual(aggregatorStorage.config.percentOracleThreshold,          percentOracleThreshold);
                assert.deepEqual(aggregatorStorage.config.heartBeatSeconds,                heartBeatSeconds);
    
                assert.deepEqual(aggregatorStorage.config.rewardAmountXtz,                 rewardAmountXtz);
                assert.deepEqual(aggregatorStorage.config.rewardAmountStakedMvk,           rewardAmountStakedMvk);
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });
    });

    describe('%setAdmin', () => {
        it('Non-admin should not be able to call this entrypoint', async () => {
            try {
                // Initial values
                await signerFactory(tezos, david.sk);

                // Operation
                await chai.expect(aggregatorInstance.methods.setAdmin(bob.pkh).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should be able to update the aggregator admin', async () => {
            try {
                // Initial values
                await signerFactory(tezos, bob.sk);

                // Operation
                const operation     = await aggregatorInstance.methods.setAdmin(bob.pkh).send();
                await operation.confirmation();
    
                // Final values
                aggregatorStorage   = await aggregatorInstance.storage();

                // Assertion
                assert.deepEqual(aggregatorStorage.admin,bob.pkh);
            } catch (e) {
                console.dir(e, {depth: 5})
            }
        });
    });

    describe('%setGovernance', () => {
        it('Non-admin should not be able to call this entrypoint', async () => {
            try {
                // Initial values
                await signerFactory(tezos, david.sk);

                // Operation
                await chai.expect(aggregatorInstance.methods.setGovernance(david.pkh).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should be able to update the governance address', async () => {
            try {
                // Initial values
                await signerFactory(tezos, bob.sk);

                // Operation
                const operation     = await aggregatorInstance.methods.setGovernance(contractDeployments.governance.address).send();
                await operation.confirmation();
    
                // Final values
                aggregatorStorage   = await aggregatorInstance.storage();

                // Assertion
                assert.deepEqual(aggregatorStorage.governanceAddress,contractDeployments.governance.address);
            } catch (e) {
                console.dir(e, {depth: 5})
            }
        });
    });

    describe('%setName', () => {
        it('Non-admin should not be able to call this entrypoint', async () => {
            try {
                // Initial values
                await signerFactory(tezos, david.sk);
                const newName   = "testName";

                // Operation
                await chai.expect(aggregatorInstance.methods.setName(newName).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should be able to update the aggregator contract name and update its reference on the governanceSatellite contract', async () => {
            try {
                // Initial values
                await signerFactory(tezos, bob.sk);
                const newName                   = "newName";
                governanceSatelliteStorage      = await governanceSatelliteInstance.storage();
                aggregatorStorage               = await aggregatorInstance.storage();

                const oldName                   = aggregatorStorage.name;
                const startOldReference         = await governanceSatelliteStorage.aggregatorLedger.get(oldName);
                const startNewReference         = await governanceSatelliteStorage.aggregatorLedger.get(newName);

                // Operation
                const operation     = await aggregatorInstance.methods.setName(newName).send();
                await operation.confirmation();
    
                // Final values
                governanceSatelliteStorage      = await governanceSatelliteInstance.storage();
                aggregatorStorage               = await aggregatorInstance.storage();
                const endOldReference           = await governanceSatelliteStorage.aggregatorLedger.get(oldName);
                const endNewReference           = await governanceSatelliteStorage.aggregatorLedger.get(newName);

                // Assertion
                assert.strictEqual(aggregatorStorage.name, newName);
                assert.strictEqual(startOldReference, contractDeployments.aggregator.address);
                assert.strictEqual(startNewReference, undefined);
                assert.strictEqual(endOldReference, undefined);
                assert.strictEqual(endNewReference, contractDeployments.aggregator.address);
            } catch (e) {
                console.dir(e, {depth: 5})
            }
        });
    });

    describe('%updateMetadata', () => {
        it('Non-admin should not be able to call this entrypoint', async () => {
            try {
                // Initial values
                await signerFactory(tezos, david.sk);
                const key   = ''
                const hash  = Buffer.from('tezos-storage:data', 'ascii').toString('hex')

                // Operation
                await chai.expect(aggregatorInstance.methods.updateMetadata(key, hash).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should be able to update the aggregator contract metadata', async () => {
            try {
                // Initial values
                await signerFactory(tezos, bob.sk);
                const key   = ''
                const hash  = Buffer.from('tezos-storage:data', 'ascii').toString('hex')

                // Operation
                const operation     = await aggregatorInstance.methods.updateMetadata(key, hash).send();
                await operation.confirmation();
    
                // Final values
                aggregatorStorage   = await aggregatorInstance.storage();
                const updatedData    = await aggregatorStorage.metadata.get(key);

                // Assertion
                assert.equal(updatedData, hash);
            } catch (e) {
                console.dir(e, {depth: 5})
            }
        });
    });

    describe('%updateWhitelistContracts', () => {
        it('Non-admin should not be able to call this entrypoint', async () => {
            try {
                // Initial values
                await signerFactory(tezos, david.sk);
                const contractAddress   = bob.pkh;

                // Operation
                await chai.expect(aggregatorInstance.methods.updateWhitelistContracts(contractAddress, "update").send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should be able to update the aggregator contract whitelist contracts', async () => {
            try {
                // Initial values
                await signerFactory(tezos, bob.sk);
                const contractAddress   = bob.pkh;

                // Operation
                const operation         = await aggregatorInstance.methods.updateWhitelistContracts(contractAddress, 'update').send();
                await operation.confirmation();
    
                // Final values
                aggregatorStorage       = await aggregatorInstance.storage();
                const contractsMapEntry = await aggregatorStorage.whitelistContracts.get(contractAddress);

                // Assertion
                assert.notStrictEqual(contractsMapEntry, undefined);
            } catch (e) {
                console.dir(e, {depth: 5})
            }
        });
    });

    describe('%updateGeneralContracts', () => {
        it('Non-admin should not be able to call this entrypoint', async () => {
            try {
                // Initial values
                await signerFactory(tezos, david.sk);
                const contractName      = 'testContract';
                const contractAddress   = bob.pkh;

                // Operation
                await chai.expect(aggregatorInstance.methods.updateGeneralContracts(contractName, contractAddress).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should be able to update the aggregator contract general contracts', async () => {
            try {
                // Initial values
                await signerFactory(tezos, bob.sk);
                const contractName      = 'testContract';
                const contractAddress   = bob.pkh;

                // Operation
                const operation         = await aggregatorInstance.methods.updateGeneralContracts(contractName, contractAddress, 'update').send();
                await operation.confirmation();
    
                // Final values
                aggregatorStorage       = await aggregatorInstance.storage();
                const contractsMapEntry = await aggregatorStorage.generalContracts.get(contractName);

                // Assertion
                assert.deepEqual(contractsMapEntry, contractAddress);
            } catch (e) {
                console.dir(e, {depth: 5})
            }
        });
    });

    describe('%pauseAll', () => {
        it('Non-admin should not be able to call this entrypoint', async () => {
            try {
                // Initial values
                await signerFactory(tezos, david.sk);
    
                // Operation
                await chai.expect(aggregatorInstance.methods.pauseAll().send()).to.be.rejected;
            } catch (e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should be able to pause all entrypoints', async () => {
            try {
                // Initial values
                await signerFactory(tezos, bob.sk);
                aggregatorStorage           = await aggregatorInstance.storage();
                const initBreakGlassConfig  = await aggregatorStorage.breakGlassConfig;

                // Operation
                const operation             = await aggregatorInstance.methods.pauseAll().send();
                await operation.confirmation();

                // Final values
                aggregatorStorage           = await aggregatorInstance.storage();
                const finalBreakGlassConfig = await aggregatorStorage.breakGlassConfig;

                // Assertions
                assert.equal(finalBreakGlassConfig.updateDataIsPaused, true);
                assert.equal(finalBreakGlassConfig.withdrawRewardXtzIsPaused, true);
                assert.equal(finalBreakGlassConfig.withdrawRewardStakedMvkIsPaused, true);
                assert.notEqual(finalBreakGlassConfig.updateDataIsPaused, initBreakGlassConfig.updateDataIsPaused);
                assert.notEqual(finalBreakGlassConfig.withdrawRewardXtzIsPaused, initBreakGlassConfig.withdrawRewardXtzIsPaused);
                assert.notEqual(finalBreakGlassConfig.withdrawRewardStakedMvkIsPaused, initBreakGlassConfig.withdrawRewardStakedMvkIsPaused);
            } catch (e) {
                console.dir(e, {depth: 5})
            }
        });
    });

    describe('%togglePauseEntrypoint', () => {
        beforeEach("Set signer to admin", async () => {
            await signerFactory(tezos, bob.sk)
        });

        it('Non-admin should not be able to call this entrypoint', async () => {
            try {
                // Initial values
                await signerFactory(tezos, david.sk);
                const entrypoint    = "updateData";
                const pause         = true;
    
                // Operation
                await chai.expect(aggregatorInstance.methods.togglePauseEntrypoint(entrypoint, pause).send()).to.be.rejected;
            } catch (e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should be able to pause or unpause %updateData', async () => {
            try {
                // Initial values
                const entrypoint            = "updateData";
                const pause                 = true;
                const observations          = [
                    {
                        "oracle": alice.pkh,
                        "data": new BigNumber(10142857143)
                    },
                    {
                        "oracle": eve.pkh,
                        "data": new BigNumber(10142853322)
                    },
                    {
                        "oracle": oscar.pkh,
                        "data": new BigNumber(10142857900)
                    },
                    {
                        "oracle": trudy.pkh,
                        "data": new BigNumber(10142857901)
                    }
                ];

                let epoch: number           = 2;
                let round: number           = 2;
                const oracleObservations    = new MichelsonMap<string, IOracleObservationType>();
                for (const { oracle, data } of observations) {
                    oracleObservations.set(oracle, {
                        data,
                        epoch,
                        round,
                        aggregatorAddress: contractDeployments.aggregator.address
                    });
                };
                const signatures            = new MichelsonMap<string, string>();
    
                // Sign observations
                await signerFactory(tezos, alice.sk);
                signatures.set(alice.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, eve.sk);
                signatures.set(eve.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, trudy.sk);
                signatures.set(trudy.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, oscar.sk);
                signatures.set(oscar.pkh, await utils.signOracleDataResponses(oracleObservations));
    
                // Operation
                await signerFactory(tezos, bob.sk)
                const operation             = await aggregatorInstance.methods.togglePauseEntrypoint(entrypoint, pause).send();
                await operation.confirmation();

                // Test operation
                await chai.expect(aggregatorInstance.methods.updateData(oracleObservations, signatures).send()).to.be.rejected;

                // Final values
                aggregatorStorage           = await aggregatorInstance.storage();
                const entrypointPaused      = await aggregatorStorage.breakGlassConfig.updateDataIsPaused;

                // Assertions
                assert.equal(entrypointPaused, pause);
            } catch (e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should be able to pause or unpause %withdrawRewardXtz', async () => {
            try {
                // Initial values
                const entrypoint            = "withdrawRewardXtz";
                const pause                 = true;
                
                // Operation
                const operation             = await aggregatorInstance.methods.togglePauseEntrypoint(entrypoint, pause).send();
                await operation.confirmation();

                // Test operation
                await chai.expect(aggregatorInstance.methods.withdrawRewardXtz(bob.pkh).send()).to.be.rejected;

                // Final values
                aggregatorStorage           = await aggregatorInstance.storage();
                const entrypointPaused      = await aggregatorStorage.breakGlassConfig.withdrawRewardXtzIsPaused;

                // Assertions
                assert.equal(entrypointPaused, pause);
            } catch (e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should be able to pause or unpause %withdrawRewardStakedMvk', async () => {
            try {
                // Initial values
                const entrypoint            = "withdrawRewardStakedMvk";
                const pause                 = true;
                
                // Operation
                const operation             = await aggregatorInstance.methods.togglePauseEntrypoint(entrypoint, pause).send();
                await operation.confirmation();

                // Test operation
                await chai.expect(aggregatorInstance.methods.withdrawRewardStakedMvk(bob.pkh).send()).to.be.rejected;

                // Final values
                aggregatorStorage           = await aggregatorInstance.storage();
                const entrypointPaused      = await aggregatorStorage.breakGlassConfig.withdrawRewardXtzIsPaused;

                // Assertions
                assert.equal(entrypointPaused, pause);
            } catch (e) {
                console.dir(e, {depth: 5})
            }
        });
    });

    describe('%unpauseAll', () => {
        it('Non-admin should not be able to call this entrypoint', async () => {
            try {
                // Initial values
                await signerFactory(tezos, david.sk);
    
                // Operation
                await chai.expect(aggregatorInstance.methods.unpauseAll().send()).to.be.rejected;
            } catch (e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should be able to unpause all entrypoints', async () => {
            try {
                // Initial values
                await signerFactory(tezos, bob.sk);
                aggregatorStorage           = await aggregatorInstance.storage();
                const initBreakGlassConfig  = await aggregatorStorage.breakGlassConfig;

                // Operation
                const operation             = await aggregatorInstance.methods.unpauseAll().send();
                await operation.confirmation();

                // Final values
                aggregatorStorage           = await aggregatorInstance.storage();
                const finalBreakGlassConfig = await aggregatorStorage.breakGlassConfig;

                // Assertions
                assert.equal(finalBreakGlassConfig.updateDataIsPaused, false);
                assert.equal(finalBreakGlassConfig.withdrawRewardXtzIsPaused, false);
                assert.equal(finalBreakGlassConfig.withdrawRewardStakedMvkIsPaused, false);
                assert.notEqual(finalBreakGlassConfig.updateDataIsPaused, initBreakGlassConfig.updateDataIsPaused);
                assert.notEqual(finalBreakGlassConfig.withdrawRewardXtzIsPaused, initBreakGlassConfig.withdrawRewardXtzIsPaused);
                assert.notEqual(finalBreakGlassConfig.withdrawRewardStakedMvkIsPaused, initBreakGlassConfig.withdrawRewardStakedMvkIsPaused);
            } catch (e) {
                console.dir(e, {depth: 5})
            }
        });
    });

    describe('%setLambda', () => {
        it('Non-admin should not be able to call this entrypoint', async () => {
            try {
                // Initial values
                await signerFactory(tezos, david.sk);
                const bytes  = Buffer.from('tezos-storage:data', 'ascii').toString('hex')
    
                // Operation
                await chai.expect(aggregatorInstance.methods.setLambda("testSetLambda", bytes).send()).to.be.rejected;
            } catch (e){
                console.dir(e, {depth: 5})
            }
        });
    });
});