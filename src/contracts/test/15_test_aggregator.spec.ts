import assert from "assert";
import BigNumber from 'bignumber.js';

import { MVN, MAV, Utils } from "./helpers/Utils";
import { before } from "mocha";

const chai = require("chai");
import { MichelsonMap } from "@mavrykdynamics/taquito";
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
import { mockSatelliteData } from "./helpers/mockSampleData";
import { 
    getStorageMapValue,
    signerFactory,
    updateGeneralContracts,
    updateWhitelistContracts
} from './helpers/helperFunctions'

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
    let mvnTokenInstance;
    let delegationInstance;
    let aggregatorFactoryInstance;
    let treasuryInstance;
    let governanceSatelliteInstance;

    let admin
    let adminSk

    let user
    let userSk

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

    let delegateOne
    let delegateOneSk 

    let aggregatorStorage;
    let doormanStorage;
    let mvnTokenStorage;
    let delegationStorage;
    let aggregatorFactoryStorage;
    let treasuryStorage;
    let governanceSatelliteStorage;

    let updateOperatorsOperation 
    let addOracleOperation
    let registerAsSatelliteOperation
    let unregisterAsSatelliteOperation
    let updateOracleOperation
    let withdrawRewardOperation

    // housekeeping operations
    let setAdminOperation
    let setGovernanceOperation
    let setBakerOperation
    let resetAdminOperation
    let updateWhitelistContractsOperation
    let updateWhitelistTokenContractsOperation
    let updateGeneralContractsOperation
    let mistakenTransferOperation
    let pauseOperation
    let pauseAllOperation
    let unpauseOperation
    let unpauseAllOperation

    // contract map value
    let storageMap
    let contractMapKey
    let initialContractMapValue
    let updatedContractMapValue

    let observations

    let epoch: number = 1;
    let round: number = 1;

    before("setup", async () => {
        
        utils = new Utils();
        await utils.init(bob.sk);
        tezos = utils.tezos

        admin               = bob.pkh;
        adminSk             = bob.sk;

        user                = mallory.pkh;
        userSk              = mallory.sk;

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

        delegateOne         = isaac.pkh;
        delegateOneSk       = isaac.sk;

        doormanAddress                  = contractDeployments.doorman.address;

        aggregatorInstance              = await utils.tezos.contract.at(contractDeployments.aggregator.address);
        aggregatorStorage               = await aggregatorInstance.storage();

        doormanInstance                 = await utils.tezos.contract.at(doormanAddress);
        doormanStorage                  = await doormanInstance.storage();

        delegationInstance              = await utils.tezos.contract.at(contractDeployments.delegation.address);
        delegationStorage               = await delegationInstance.storage();

        mvnTokenInstance                = await utils.tezos.contract.at(contractDeployments.mvnToken.address);
        mvnTokenStorage                 = await mvnTokenInstance.storage();

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

        if(await aggregatorStorage.oracleLedger.get(satelliteFour) === undefined){
            addOracleOperation = await aggregatorInstance.methods.addOracle(satelliteFour).send();
            await addOracleOperation.confirmation();
        }

        if(await aggregatorStorage.oracleLedger.get(satelliteFive) === undefined){
            addOracleOperation = await aggregatorInstance.methods.addOracle(satelliteFive).send();
            await addOracleOperation.confirmation();
        }

        // ------------------------------------------------------------------
        // Setup rounds and epoch
        // ------------------------------------------------------------------

        const lastCompletedData = await aggregatorInstance.contractViews.getLastCompletedData().executeView({ viewCaller : admin});

        epoch = lastCompletedData.epoch.toNumber() == 1 ? 1 : lastCompletedData.epoch.toNumber() + 1;
        round = lastCompletedData.round.toNumber() == 1 ? 1 : lastCompletedData.round.toNumber() + 1;

        // Set MVRK Reward to be higher for tests (from 0.0013 mvrk to 1 mvrk)
        // ------------------------------------------------------------------

        // admin sets reward amount to be 1 mav
        await signerFactory(tezos, adminSk);
        const rewardAmountMvrk = MAV(1); 
        const updateConfigOperation = await aggregatorInstance.methods.updateConfig(
            rewardAmountMvrk, "configRewardAmountMvrk"
        ).send();
        await updateConfigOperation.confirmation();
    
    });

    describe('%addOracle', () => {
        beforeEach("Set signer to admin", async () => {
            await signerFactory(tezos, adminSk)
        });

        it('%addOracle                - admin (bob) should be able to add an oracle to the aggregator', async () => {
            try {
                // Initial values
                aggregatorStorage       = await aggregatorInstance.storage();
                const oracleAddress     = satelliteThree;
    
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

        it('%addOracle                - admin (bob) should not be able to add an already existing oracle', async () => {
            try {
                // Initial values
                const oracleAddress     = satelliteOne;
    
                // Operation
                await chai.expect(aggregatorInstance.methods.addOracle(oracleAddress).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    });


    describe('%updateOracle', () => {
        beforeEach("Set signer to susie", async () => {
            await signerFactory(tezos, satelliteThreeSk)
        });

        it('%updateOracle             - satellite (susie) should be able to update their public key and peer id', async () => {
            try {
                
                // Initial values
                const oracleAddress     = satelliteThree;

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
                updateOracleOperation = await aggregatorInstance.methods.updateOracle().send();
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
            await signerFactory(tezos, adminSk)
        });

        it('%removeOracle             - admin should not be able to call this entrypoint if the oracle does not exists', async () => {
            try {
                // Initial values
                const oracleAddress = user;

                // Operation
                await chai.expect(aggregatorInstance.methods.removeOracle(oracleAddress).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('%removeOracle             - admin should be able to remove an oracle from the aggregator', async () => {
            try {
                // Initial values
                aggregatorStorage       = await aggregatorInstance.storage();
                const oracleAddress     = satelliteThree;

                // Operation
                const operation     = await aggregatorInstance.methods.removeOracle(oracleAddress).send();
                await operation.confirmation();
    
                // Final values
                aggregatorStorage           = await aggregatorInstance.storage();

                // Assertion
                assert.strictEqual(await aggregatorStorage.oracleLedger.get(oracleAddress), undefined);
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    });

    describe('%updateData', () => {

        before("Setup observations", async () => {
            observations = [
                {
                    "oracle": satelliteFour,
                    "data": new BigNumber(10142857143)
                },
                {
                    "oracle": satelliteTwo,
                    "data": new BigNumber(10142853322)
                },
                {
                    "oracle": satelliteOne,
                    "data": new BigNumber(10142857900)
                },
                {
                    "oracle": satelliteFive,
                    "data": new BigNumber(10142857901)
                }
            ];
        });

        it('%updateData               - oracle (oscar) should be able to add data to the aggregator', async () => {
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
                    const votingPower                   = satelliteRecord.totalDelegatedAmount.toNumber() + satelliteRecord.stakedMvnBalance.toNumber();
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
                var startOscarSMvnRewards               = await aggregatorStorage.oracleRewardStakedMvn.get(satelliteFour);
                startOscarSMvnRewards                   = startOscarSMvnRewards ? startOscarSMvnRewards.toNumber() : 0;
                var startOscarMvrkRewards                = await aggregatorStorage.oracleRewardMvrk.get(satelliteFour);
                startOscarMvrkRewards                    = startOscarMvrkRewards ? startOscarMvrkRewards.toNumber() : 0;
                const smvnReward                        = aggregatorStorage.config.rewardAmountStakedMvn.toNumber();
                const mvrkReward                         = aggregatorStorage.config.rewardAmountMvrk.toNumber();
                const rewardRatio                       = oracleVotingPowers.get(satelliteFour) / totalVotingPower;
    
                // Sign observations
                await signerFactory(tezos, satelliteOneSk);
                signatures.set(satelliteOne, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, satelliteTwoSk);
                signatures.set(satelliteTwo, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, satelliteFiveSk);
                signatures.set(satelliteFive, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, satelliteFourSk);
                signatures.set(satelliteFour, await utils.signOracleDataResponses(oracleObservations));
    
                // Operation
                const operation                         = await aggregatorInstance.methods.updateData(oracleObservations, signatures).send();
                await operation.confirmation();

                // Final values
                aggregatorStorage                       = await aggregatorInstance.storage();
                const endOscarSMvnRewards             = await aggregatorStorage.oracleRewardStakedMvn.get(satelliteFour);
                const endOscarMvrkRewards              = await aggregatorStorage.oracleRewardMvrk.get(satelliteFour);
                const expectedMaintainerSMvnReward      = Math.trunc(rewardRatio * smvnReward) + startOscarSMvnRewards;
                const expectedMaintainerMvrkReward      = mvrkReward + startOscarMvrkRewards;

                // Assertions
                assert.equal(endOscarSMvnRewards.toNumber(), expectedMaintainerSMvnReward);
                assert.equal(endOscarMvrkRewards.toNumber(), expectedMaintainerMvrkReward);
                assert.deepEqual(aggregatorStorage.lastCompletedData.round,new BigNumber(round));
                assert.deepEqual(aggregatorStorage.lastCompletedData.epoch,new BigNumber(epoch));
                assert.deepEqual(aggregatorStorage.lastCompletedData.data,new BigNumber(10142857521));
                assert.deepEqual(aggregatorStorage.lastCompletedData.percentOracleResponse,new BigNumber(10000));
                round++;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('%updateData               - oracle (oscar) should be able to increase its rewards when adding data to the aggregator if it stakes more or have more delegated to it', async () => {
            try {
                // Pre-operations
                // Increase oracle maintainer stake
                await signerFactory(tezos, satelliteFourSk);
                const additionalStakeAmount             = MVN(10);
                var stakeOperation                      = await doormanInstance.methods.stakeMvn(additionalStakeAmount).send();
                await stakeOperation.confirmation();

                // Add a delegate to another oracle
                await signerFactory(tezos, delegateOneSk);
                var updateOperators = await mvnTokenInstance.methods
                    .update_operators([
                    {
                        add_operator: {
                            owner: delegateOne,
                            operator: doormanAddress,
                            token_id: 0,
                        },
                    },
                    ])
                    .send()
                await updateOperators.confirmation();  
                stakeOperation                          = await doormanInstance.methods.stakeMvn(additionalStakeAmount).send();
                await stakeOperation.confirmation();
                const delegateOperation                 = await delegationInstance.methods.delegateToSatellite(delegateOne, satelliteOne).send()
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
                    const votingPower                   = satelliteRecord.totalDelegatedAmount.toNumber() + satelliteRecord.stakedMvnBalance.toNumber();
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
                const startOscarSMvnRewards           = await aggregatorStorage.oracleRewardStakedMvn.get(satelliteFour);
                const startOscarMvrkRewards            = await aggregatorStorage.oracleRewardMvrk.get(satelliteFour);
                const smvnReward                        = aggregatorStorage.config.rewardAmountStakedMvn.toNumber();
                const mvrkReward                         = aggregatorStorage.config.rewardAmountMvrk.toNumber();
                const rewardRatio                       = oracleVotingPowers.get(satelliteFour) / totalVotingPower;
    
                // Sign observations
                await signerFactory(tezos, satelliteOneSk);
                signatures.set(satelliteOne, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, satelliteTwoSk);
                signatures.set(satelliteTwo, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, satelliteFiveSk);
                signatures.set(satelliteFive, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, satelliteFourSk);
                signatures.set(satelliteFour, await utils.signOracleDataResponses(oracleObservations));
    
                // Operation
                const operation                         = await aggregatorInstance.methods.updateData(oracleObservations, signatures).send();
                await operation.confirmation();

                // Final values
                aggregatorStorage                       = await aggregatorInstance.storage();
                const endOscarSMvnRewards             = await aggregatorStorage.oracleRewardStakedMvn.get(satelliteFour);
                const endOscarMvrkRewards              = await aggregatorStorage.oracleRewardMvrk.get(satelliteFour);
                const expectedMaintainerSMvnReward      = Math.trunc(startOscarSMvnRewards.toNumber() + rewardRatio * smvnReward);
                const expectedMaintainerMvrkReward       = startOscarMvrkRewards.toNumber() + mvrkReward;

                // Assertions
                assert.notStrictEqual(startOscarSMvnRewards, undefined);
                assert.notStrictEqual(startOscarMvrkRewards, undefined);
                assert.equal(endOscarSMvnRewards.toNumber(), expectedMaintainerSMvnReward);
                assert.equal(endOscarMvrkRewards.toNumber(), expectedMaintainerMvrkReward);
                assert.deepEqual(aggregatorStorage.lastCompletedData.round,new BigNumber(round));
                assert.deepEqual(aggregatorStorage.lastCompletedData.epoch,new BigNumber(epoch));
                assert.deepEqual(aggregatorStorage.lastCompletedData.data,new BigNumber(10142857521));
                assert.deepEqual(aggregatorStorage.lastCompletedData.percentOracleResponse,new BigNumber(10000));
                round++;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('%updateData               - oracle (oscar) should be able to decrease its rewards when adding data to the aggregator if it unstakes or lose delegates', async () => {
            try {
                // Pre-operations
                // Increase oracle maintainer stake
                await signerFactory(tezos, satelliteFourSk);
                const unstakeAmount                     = MVN(10);
                const unstakeOperation                  = await doormanInstance.methods.unstakeMvn(unstakeAmount).send();
                await unstakeOperation.confirmation();

                // Add a delegate to another oracle
                await signerFactory(tezos, delegateOneSk);
                const undelegateOperation               = await delegationInstance.methods.undelegateFromSatellite(delegateOne).send()
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
                    const votingPower                   = satelliteRecord.totalDelegatedAmount.toNumber() + satelliteRecord.stakedMvnBalance.toNumber();
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
                const startOscarSMvnRewards           = await aggregatorStorage.oracleRewardStakedMvn.get(satelliteFour);
                const startOscarMvrkRewards            = await aggregatorStorage.oracleRewardMvrk.get(satelliteFour);
                const smvnReward                        = aggregatorStorage.config.rewardAmountStakedMvn.toNumber();
                const mvrkReward                         = aggregatorStorage.config.rewardAmountMvrk.toNumber();
                const rewardRatio                       = oracleVotingPowers.get(satelliteFour) / totalVotingPower;
    
                // Sign observations
                await signerFactory(tezos, satelliteOneSk);
                signatures.set(satelliteOne, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, satelliteTwoSk);
                signatures.set(satelliteTwo, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, satelliteFiveSk);
                signatures.set(satelliteFive, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, satelliteFourSk);
                signatures.set(satelliteFour, await utils.signOracleDataResponses(oracleObservations));
    
                // Operation
                const operation                         = await aggregatorInstance.methods.updateData(oracleObservations, signatures).send();
                await operation.confirmation();

                // Final values
                aggregatorStorage                       = await aggregatorInstance.storage();
                const endOscarSMvnRewards               = await aggregatorStorage.oracleRewardStakedMvn.get(satelliteFour);
                const endOscarMvrkRewards                = await aggregatorStorage.oracleRewardMvrk.get(satelliteFour);
                const expectedMaintainerSMvnReward      = Math.trunc(startOscarSMvnRewards.toNumber() + rewardRatio * smvnReward);
                const expectedMaintainerMvrkReward       = mvrkReward + startOscarMvrkRewards.toNumber();

                // Assertions
                assert.equal(endOscarMvrkRewards.toNumber(), expectedMaintainerMvrkReward);
                assert.equal(endOscarSMvnRewards.toNumber(), expectedMaintainerSMvnReward);
                assert.deepEqual(aggregatorStorage.lastCompletedData.round,new BigNumber(round));
                assert.deepEqual(aggregatorStorage.lastCompletedData.epoch,new BigNumber(epoch));
                assert.deepEqual(aggregatorStorage.lastCompletedData.data,new BigNumber(10142857521));
                assert.deepEqual(aggregatorStorage.lastCompletedData.percentOracleResponse,new BigNumber(10000));
                round++;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('%updateData               - oracle (oscar) should not be able to call this entrypoint if there too few observations in the map', async () => {
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
                await signerFactory(tezos, satelliteOneSk);
                signatures.set(satelliteOne, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, satelliteTwoSk);
                signatures.set(satelliteTwo, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, satelliteFiveSk);
                signatures.set(satelliteFive, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, satelliteFourSk);
                signatures.set(satelliteFour, await utils.signOracleDataResponses(oracleObservations));
    
                // Operation
                await chai.expect(aggregatorInstance.methods.updateData(oracleObservations, signatures).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }   
        });

        it('%updateData               - oracle (oscar) should not be able to call this entrypoint if there too few signatures in the map', async () => {
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

        it('%updateData               - oracle (oscar) should not be able to call this entrypoint if the wrong aggregator is specified in the observations', async () => {
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
                await signerFactory(tezos, satelliteOneSk);
                signatures.set(satelliteOne, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, satelliteTwoSk);
                signatures.set(satelliteTwo, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, satelliteFiveSk);
                signatures.set(satelliteFive, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, satelliteFourSk);
                signatures.set(satelliteFour, await utils.signOracleDataResponses(oracleObservations));
    
                // Operation
                await chai.expect(aggregatorInstance.methods.updateData(oracleObservations, signatures).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('%updateData               - oracle (oscar) should not be able to call this entrypoint if at least one the oracle specified in the observations is wrong', async () => {
            try {
                // Initial values
                const observations_bad = [
                    {
                       "oracle": satelliteOne,
                       "data": new BigNumber(10142857143)
                    },
                    {
                        "oracle": satelliteTwo,
                        "data": new BigNumber(10142853322)
                    },
                    {
                        "oracle": satelliteFour,
                        "data": new BigNumber(10142857900)
                    },
                    {
                        "oracle": delegateOne,
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
                await signerFactory(tezos, satelliteOneSk);
                signatures.set(satelliteOne, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, satelliteTwoSk);
                signatures.set(satelliteTwo, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, satelliteFiveSk);
                signatures.set(satelliteFive, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, satelliteFourSk);
                signatures.set(satelliteFour, await utils.signOracleDataResponses(oracleObservations));
    
                // Operation
                await chai.expect(aggregatorInstance.methods.updateData(oracleObservations, signatures).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('%updateData               - oracle (oscar) should not be able to call this entrypoint if the all epochs does not match in the observations', async () => {
            try{
                // Initial values
                const observations_bad = [
                    {
                       "oracle": satelliteOne,
                       "data": new BigNumber(10142857143),
                       "epoch": 1
                    },
                    {
                        "oracle": satelliteTwo,
                        "data": new BigNumber(10142853322),
                        "epoch": 1
                    },
                    {
                        "oracle": satelliteFour,
                        "data": new BigNumber(10142857900),
                        "epoch": 1
                    },
                    {
                        "oracle": delegateOne,
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
                await signerFactory(tezos, satelliteOneSk);
                signatures.set(satelliteOne, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, satelliteTwoSk);
                signatures.set(satelliteTwo, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, satelliteFiveSk);
                signatures.set(satelliteFive, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, satelliteFourSk);
                signatures.set(satelliteFour, await utils.signOracleDataResponses(oracleObservations));
    
                // Operation
                await chai.expect(aggregatorInstance.methods.updateData(oracleObservations, signatures).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('%updateData               - oracle (oscar) should not be able to call this entrypoint if the all rounds does not match in the observations', async () => {
            try {
                // Initial values
                const observations_bad = [
                    {
                       "oracle": satelliteOne,
                       "data": new BigNumber(10142857143),
                       "round": 2
                    },
                    {
                        "oracle": satelliteTwo,
                        "data": new BigNumber(10142853322),
                        "round": 2
                    },
                    {
                        "oracle": satelliteFour,
                        "data": new BigNumber(10142857900),
                        "round": 2
                    },
                    {
                        "oracle": delegateOne,
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
                await signerFactory(tezos, satelliteOneSk);
                signatures.set(satelliteOne, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, satelliteTwoSk);
                signatures.set(satelliteTwo, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, satelliteFiveSk);
                signatures.set(satelliteFive, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, satelliteFourSk);
                signatures.set(satelliteFour, await utils.signOracleDataResponses(oracleObservations));
      
                // Operation
                await chai.expect(aggregatorInstance.methods.updateData(oracleObservations, signatures).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }   
        });

        it('%updateData               - oracle (oscar) should not be able to call this entrypoint if the epoch mentionned in the observations is less or equal than the previous one', async () => {
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
                await signerFactory(tezos, satelliteOneSk);
                signatures.set(satelliteOne, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, satelliteTwoSk);
                signatures.set(satelliteTwo, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, satelliteFiveSk);
                signatures.set(satelliteFive, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, satelliteFourSk);
                signatures.set(satelliteFour, await utils.signOracleDataResponses(oracleObservations));
    
                // Operation
                await chai.expect(aggregatorInstance.methods.updateData(oracleObservations, signatures).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('%updateData               - oracle (oscar) should not be able to call this entrypoint if at least one of the signatures is wrong', async () => {
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
                await signerFactory(tezos, satelliteOneSk);
                signatures.set(satelliteOne, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, delegateOneSk);
                signatures.set(satelliteTwo, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, satelliteFiveSk);
                signatures.set(satelliteFive, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, satelliteFourSk);
                signatures.set(satelliteFour, await utils.signOracleDataResponses(oracleObservations));
    
                // Operation
                await chai.expect(aggregatorInstance.methods.updateData(oracleObservations, signatures).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('%updateData               - user (oscar) defined as an oracle without being a satellite should update the ledger without updating the data if calling this entrypoint', async () => {
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
                    const votingPower                   = satelliteRecord.totalDelegatedAmount.toNumber() + satelliteRecord.stakedMvnBalance.toNumber();
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
                var startOscarSMvnRewards               = await aggregatorStorage.oracleRewardStakedMvn.get(satelliteFour);
                startOscarSMvnRewards                   = startOscarSMvnRewards ? startOscarSMvnRewards.toNumber() : 0;
                var startOscarMvrkRewards                = await aggregatorStorage.oracleRewardMvrk.get(satelliteFour);
                startOscarMvrkRewards                    = startOscarMvrkRewards ? startOscarMvrkRewards.toNumber() : 0;
                const startLastCompletedData            = aggregatorStorage.lastCompletedData;
                const startOracleInLedger               = await aggregatorStorage.oracleLedger.get(satelliteFour);
    
                // Sign observations
                await signerFactory(tezos, satelliteOneSk);
                signatures.set(satelliteOne, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, satelliteTwoSk);
                signatures.set(satelliteTwo, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, satelliteFiveSk);
                signatures.set(satelliteFive, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, satelliteFourSk);
                signatures.set(satelliteFour, await utils.signOracleDataResponses(oracleObservations));

                // User unregisters
                unregisterAsSatelliteOperation          = await delegationInstance.methods.unregisterAsSatellite(satelliteFour).send();
                await unregisterAsSatelliteOperation.confirmation();
    
                // Operation
                const operation                         = await aggregatorInstance.methods.updateData(oracleObservations, signatures).send();
                await operation.confirmation();

                // Final values
                aggregatorStorage                       = await aggregatorInstance.storage();
                const endOscarSMvnRewards               = await aggregatorStorage.oracleRewardStakedMvn.get(satelliteFour);
                const endOscarMvrkRewards                = await aggregatorStorage.oracleRewardMvrk.get(satelliteFour);
                const endLastCompletedData              = aggregatorStorage.lastCompletedData;
                const endOracleInLedger                 = await aggregatorStorage.oracleLedger.get(satelliteFour);

                // Assertions
                assert.equal(endOscarSMvnRewards.toNumber(), startOscarSMvnRewards);
                assert.equal(endOscarMvrkRewards.toNumber(), startOscarMvrkRewards);
                
                // The user should be removed from the oracleLedger if it's not a satellite anymore
                assert.notStrictEqual(startOracleInLedger, undefined);
                assert.strictEqual(endOracleInLedger, undefined);

                // Since the user is not a satellite anymore, the data shouldn't be updated
                assert.deepEqual(endLastCompletedData.round,startLastCompletedData.round);
                assert.deepEqual(endLastCompletedData.epoch,startLastCompletedData.epoch);
                assert.deepEqual(endLastCompletedData.data,startLastCompletedData.data);
                assert.deepEqual(endLastCompletedData.percentOracleResponse,startLastCompletedData.percentOracleResponse);
                round++;

                // Reset satellite
                // Registers as satellite
                delegationStorage               = await delegationInstance.storage();
                doormanStorage                  = await doormanInstance.storage();
                const minimumRequired           = delegationStorage.config.minimumStakedMvnBalance.toNumber();
                const smvnBalanceRecord         = await doormanStorage.userStakeBalanceLedger.get(satelliteFour);
                const smvnBalance               = smvnBalanceRecord.balance.toNumber();
                if(smvnBalance < minimumRequired){
                    const stakeAmount       = minimumRequired - smvnBalance + MVN();
                    const stakeOperation    = await doormanInstance.methods.stakeMvn(stakeAmount).send();
                    await stakeOperation.confirmation();
                }
                registerAsSatelliteOperation    = await delegationInstance.methods.registerAsSatellite(
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
                await signerFactory(tezos, adminSk)
                addOracleOperation          = await aggregatorInstance.methods.addOracle(satelliteFour).send();
                await addOracleOperation.confirmation();
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });
    });

    describe('%withdrawRewardStakedMvn', () => {

        beforeEach("Set signer to oracle", async () => {
            await signerFactory(tezos, satelliteOneSk)
        });

        it('%withdrawRewardStakedMvn  - oracle (alice) should be able to withdraw SMVN rewards', async () => {
            try {
                // Initial values
                aggregatorStorage                           = await aggregatorInstance.storage();
                delegationStorage                           = await delegationInstance.storage();
                const oracleVotingPowers                    = new Map<string, number>();
                observations                                = [
                    {
                        "oracle": satelliteOne,
                        "data": new BigNumber(10142857143)
                    },
                    {
                        "oracle": satelliteTwo,
                        "data": new BigNumber(10142853322)
                    },
                    {
                        "oracle": satelliteFour,
                        "data": new BigNumber(10142857900)
                    },
                    {
                        "oracle": satelliteFive,
                        "data": new BigNumber(10142857901)
                    }
                ];
                var totalVotingPower                        = 0;
                for (const { oracle, data } of observations) {
                    // Get oracle voting power
                    const satelliteRecord               = await delegationStorage.satelliteLedger.get(oracle);
                    const votingPower                   = satelliteRecord.totalDelegatedAmount.toNumber() + satelliteRecord.stakedMvnBalance.toNumber();
                    totalVotingPower                    += votingPower;
                    oracleVotingPowers.set(oracle, votingPower)
                };
                const aliceSatelliteFee                          = mockSatelliteData.alice.satelliteFee; // set when alice, eve, oscar registered as satellites in before setup
                const eveSatelliteFee                          = mockSatelliteData.eve.satelliteFee; // set when alice, eve, oscar registered as satellites in before setup
                const oscarSatelliteFee                          = mockSatelliteData.oscar.satelliteFee; // set when alice, eve, oscar registered as satellites in before setup
                const aliceStakedMvn                          = oracleVotingPowers.get(satelliteOne);
                const eveStakedMvn                          = oracleVotingPowers.get(satelliteTwo);
                const oscarStakedMvn                      = oracleVotingPowers.get(satelliteFour);
                const rewardAmountStakedMvn                 = aggregatorStorage.config.rewardAmountStakedMvn.toNumber();
                const aliceSMvnRewards                        = await aggregatorStorage.oracleRewardStakedMvn.get(satelliteOne);
                const eveSMvnRewards                        = await aggregatorStorage.oracleRewardStakedMvn.get(satelliteTwo);
                const oscarSMvnRewards                    = await aggregatorStorage.oracleRewardStakedMvn.get(satelliteFour);
                const beforeAliceRewardsLedger                = await delegationStorage.satelliteRewardsLedger.get(satelliteOne);
                const beforeEveRewardsLedger                = await delegationStorage.satelliteRewardsLedger.get(satelliteTwo);
                const beforeOscarRewardsLedger            = await delegationStorage.satelliteRewardsLedger.get(satelliteFour);
    
                // Operation
                withdrawRewardOperation          = await aggregatorInstance.methods.withdrawRewardStakedMvn(satelliteOne).send();
                await withdrawRewardOperation.confirmation();
    
                withdrawRewardOperation          = await aggregatorInstance.methods.withdrawRewardStakedMvn(satelliteTwo).send();
                await withdrawRewardOperation.confirmation();
    
                withdrawRewardOperation      = await aggregatorInstance.methods.withdrawRewardStakedMvn(satelliteFour).send();
                await withdrawRewardOperation.confirmation();
    
                // Final values
                aggregatorStorage                           = await aggregatorInstance.storage();
                delegationStorage                           = await delegationInstance.storage();
                const aliceRewardsLedger                      = await delegationStorage.satelliteRewardsLedger.get(satelliteOne);
                const eveRewardsLedger                      = await delegationStorage.satelliteRewardsLedger.get(satelliteTwo);
                const oscarRewardsLedger                  = await delegationStorage.satelliteRewardsLedger.get(satelliteFour);
                const resetAliceRewardStakedMvn               = await aggregatorStorage.oracleRewardStakedMvn.get(satelliteOne);
                const resetEveRewardStakedMvn               = await aggregatorStorage.oracleRewardStakedMvn.get(satelliteTwo);
                const resetOscarRewardStakedMvn           = await aggregatorStorage.oracleRewardStakedMvn.get(satelliteFour);
                const finalAliceStakedMvnRewardsAfterFees     = aliceSatelliteFee * aliceSMvnRewards / 10000;
                const finalEveStakedMvnRewardsAfterFees     = eveSatelliteFee * eveSMvnRewards / 10000;
                const finalOscarStakedMvnRewardsAfterFees = oscarSatelliteFee * oscarSMvnRewards / 10000;
    
                // Assertions
                assert.equal(resetAliceRewardStakedMvn, 0);
                assert.equal(resetEveRewardStakedMvn, 0);
                assert.equal(resetOscarRewardStakedMvn, 0);
                assert.equal(aliceRewardsLedger.unpaid.toNumber(), beforeAliceRewardsLedger.unpaid.toNumber() + Math.trunc(finalAliceStakedMvnRewardsAfterFees));
                assert.equal(eveRewardsLedger.unpaid.toNumber(), beforeEveRewardsLedger.unpaid.toNumber() + Math.trunc(finalEveStakedMvnRewardsAfterFees));
                assert.equal(oscarRewardsLedger.unpaid.toNumber(), beforeOscarRewardsLedger.unpaid.toNumber() + Math.trunc(finalOscarStakedMvnRewardsAfterFees));
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });
    });

    describe('%withdrawRewardMvrk', () => {

        beforeEach("Set signer to oracle (alice)", async () => {
            await signerFactory(tezos, satelliteOneSk)
        });

        it('%withdrawRewardMvrk        - oracle (alice) should be able to withdraw MVRK rewards', async () => {
            try {
                // Initial values
                aggregatorStorage                           = await aggregatorInstance.storage();
                const oraclePendingRewards                  = await aggregatorStorage.oracleRewardMvrk.get(satelliteFour);
                const beforeOscarMavBalance                 = await utils.tezos.tz.getBalance(satelliteFour);
                const beforeEveMavBalance                   = await utils.tezos.tz.getBalance(satelliteTwo);
    
                // Operation
                withdrawRewardOperation            = await aggregatorInstance.methods.withdrawRewardMvrk(satelliteFour).send();
                await withdrawRewardOperation.confirmation();
                
                withdrawRewardOperation                = await aggregatorInstance.methods.withdrawRewardMvrk(satelliteTwo).send();
                await withdrawRewardOperation.confirmation();
    
                // Final values
                aggregatorStorage                           = await aggregatorInstance.storage();
                const resetOscarRewardMvrk                 = await aggregatorStorage.oracleRewardMvrk.get(satelliteFour);
                const resetEveRewardMvrk                     = await aggregatorStorage.oracleRewardMvrk.get(satelliteTwo);
                const oscarMavBalance                     = await utils.tezos.tz.getBalance(satelliteFour);
                const eveMavBalance                         = await utils.tezos.tz.getBalance(satelliteTwo);
    
                // Assertions
                assert.equal(resetOscarRewardMvrk, 0);
                assert.equal(resetEveRewardMvrk, undefined);
                assert.equal(oscarMavBalance.toNumber(), beforeOscarMavBalance.plus(oraclePendingRewards).toNumber());
                assert.equal(eveMavBalance.toNumber(), beforeEveMavBalance.toNumber());  
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });
    });

    describe("Housekeeping Entrypoints", async () => {

        beforeEach("Set signer to admin (bob)", async () => {
            aggregatorStorage        = await aggregatorInstance.storage();
            await signerFactory(tezos, adminSk);
        });

        it('%setAdmin                 - admin (bob) should be able to update the contract admin address', async () => {
            try{
                
                // Initial Values
                aggregatorStorage   = await aggregatorInstance.storage();
                const currentAdmin  = aggregatorStorage.admin;

                // Operation
                setAdminOperation   = await aggregatorInstance.methods.setAdmin(satelliteOne).send();
                await setAdminOperation.confirmation();

                // Final values
                aggregatorStorage   = await aggregatorInstance.storage();
                const newAdmin      = aggregatorStorage.admin;

                // Assertions
                assert.notStrictEqual(newAdmin, currentAdmin);
                assert.strictEqual(newAdmin, satelliteOne);
                assert.strictEqual(currentAdmin, admin);

                // reset admin
                await signerFactory(tezos, satelliteOneSk);
                resetAdminOperation = await aggregatorInstance.methods.setAdmin(admin).send();
                await resetAdminOperation.confirmation();

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%setGovernance            - admin (bob) should be able to update the contract governance address', async () => {
            try{
                
                // Initial Values
                aggregatorStorage       = await aggregatorInstance.storage();
                const currentGovernance = aggregatorStorage.governanceAddress;

                // Operation
                setGovernanceOperation = await aggregatorInstance.methods.setGovernance(satelliteOne).send();
                await setGovernanceOperation.confirmation();

                // Final values
                aggregatorStorage       = await aggregatorInstance.storage();
                const updatedGovernance = aggregatorStorage.governanceAddress;

                // reset governance
                setGovernanceOperation = await aggregatorInstance.methods.setGovernance(contractDeployments.governance.address).send();
                await setGovernanceOperation.confirmation();

                // Assertions
                assert.notStrictEqual(updatedGovernance, currentGovernance);
                assert.strictEqual(updatedGovernance, satelliteOne);
                assert.strictEqual(currentGovernance, contractDeployments.governance.address);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%setName                  - admin (bob) should be able to update the contract name', async () => {
            try {
                // Initial values
                await signerFactory(tezos, adminSk);
                governanceSatelliteStorage      = await governanceSatelliteInstance.storage();
                aggregatorStorage               = await aggregatorInstance.storage();

                const oldName                   = aggregatorStorage.name;
                const newName                   = oldName === "name1" ? "name2" : "name1";
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

        it('%updateMetadata           - admin (bob) should be able to update the contract metadata', async () => {
            try{
                // Initial values
                const key   = ''
                const hash  = Buffer.from('mavryk-storage:data', 'ascii').toString('hex')

                // Operation
                const updateOperation = await aggregatorInstance.methods.updateMetadata(key, hash).send();
                await updateOperation.confirmation();

                // Final values
                aggregatorStorage       = await aggregatorInstance.storage();            

                const updatedData       = await aggregatorStorage.metadata.get(key);
                assert.equal(hash, updatedData);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('%updateConfig             - admin (bob) should be able to update contract config', async () => {
            try {
                // Initial values
                const decimals                      : BigNumber = new BigNumber(100);
                const alphaPercentPerThousand       : BigNumber = new BigNumber(2);
                const percentOracleThreshold        : BigNumber = new BigNumber(100);
                const heartbeatSeconds              : BigNumber = new BigNumber(100);
                const rewardAmountMvrk               : BigNumber = new BigNumber(100);
                const rewardAmountStakedMvn         : BigNumber = new BigNumber(100);

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
    
                const testUpdateConfigHeartbeatSecondsOp        = await aggregatorInstance.methods.updateConfig(
                heartbeatSeconds, "configHeartbeatSeconds"
                ).send();
                await testUpdateConfigHeartbeatSecondsOp.confirmation();
    
    
                const testUpdateConfigRewardAmountMvrkOp         = await aggregatorInstance.methods.updateConfig(
                rewardAmountMvrk, "configRewardAmountMvrk"
                ).send();
                await testUpdateConfigRewardAmountMvrkOp.confirmation();
    
                const testUpdateConfigRewardAmountStakedMvnOp   = await aggregatorInstance.methods.updateConfig(
                rewardAmountStakedMvn, "configRewardAmountStakedMvn"
                ).send();
                await testUpdateConfigRewardAmountStakedMvnOp.confirmation();

                // Final values
                aggregatorStorage                               = await aggregatorInstance.storage();
                assert.deepEqual(aggregatorStorage.config.decimals,                        decimals);
                assert.deepEqual(aggregatorStorage.config.alphaPercentPerThousand,         alphaPercentPerThousand);
    
                assert.deepEqual(aggregatorStorage.config.percentOracleThreshold,          percentOracleThreshold);
                assert.deepEqual(aggregatorStorage.config.heartbeatSeconds,                heartbeatSeconds);
    
                assert.deepEqual(aggregatorStorage.config.rewardAmountMvrk,                 rewardAmountMvrk);
                assert.deepEqual(aggregatorStorage.config.rewardAmountStakedMvn,           rewardAmountStakedMvn);
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('%updateWhitelistContracts - admin (bob) should be able to add user (alice) to the Whitelisted Contracts map', async () => {
            try {

                // init values
                contractMapKey  = satelliteTwo;
                storageMap      = "whitelistContracts";

                initialContractMapValue           = await getStorageMapValue(aggregatorStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await updateWhitelistContracts(aggregatorInstance, contractMapKey, 'update');
                await updateWhitelistContractsOperation.confirmation()

                aggregatorStorage = await aggregatorInstance.storage()
                updatedContractMapValue = await getStorageMapValue(aggregatorStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'Eve (key) should not be in the Whitelist Contracts map before adding her to it')
                assert.notStrictEqual(updatedContractMapValue, undefined,  'Eve (key) should be in the Whitelist Contracts map after adding her to it')

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%updateWhitelistContracts - admin (bob) should be able to remove user (alice) from the Whitelisted Contracts map', async () => {
            try {

                // init values
                contractMapKey  = satelliteTwo;
                storageMap      = "whitelistContracts";

                initialContractMapValue = await getStorageMapValue(aggregatorStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await updateWhitelistContracts(aggregatorInstance, contractMapKey, 'remove');
                await updateWhitelistContractsOperation.confirmation()

                aggregatorStorage = await aggregatorInstance.storage()
                updatedContractMapValue = await getStorageMapValue(aggregatorStorage, storageMap, contractMapKey);

                assert.notStrictEqual(initialContractMapValue, undefined, 'alice (key) should be in the Whitelist Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, undefined, 'alice (key) should not be in the Whitelist Contracts map after adding her to it');

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%updateGeneralContracts   - admin (bob) should be able to add user (alice) to the General Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "alice";
                storageMap      = "generalContracts";

                initialContractMapValue = await getStorageMapValue(aggregatorStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await updateGeneralContracts(aggregatorInstance, contractMapKey, satelliteTwo, 'update');
                await updateGeneralContractsOperation.confirmation()

                aggregatorStorage = await aggregatorInstance.storage()
                updatedContractMapValue = await getStorageMapValue(aggregatorStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'alice (key) should not be in the General Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, satelliteTwo, 'alice (key) should be in the General Contracts map after adding her to it');

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%updateGeneralContracts   - admin (bob) should be able to remove user (alice) from the General Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "alice";
                storageMap      = "generalContracts";

                initialContractMapValue = await getStorageMapValue(aggregatorStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await updateGeneralContracts(aggregatorInstance, contractMapKey, satelliteTwo, 'remove');
                await updateGeneralContractsOperation.confirmation()

                aggregatorStorage = await aggregatorInstance.storage()
                updatedContractMapValue = await getStorageMapValue(aggregatorStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, satelliteTwo, 'alice (key) should be in the General Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, undefined, 'alice (key) should not be in the General Contracts map after adding her to it');

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%pauseAll                 - admin (bob) should be able to pause all entrypoints in the contract', async () => {
            try{
                // Initial Values
                aggregatorStorage       = await aggregatorInstance.storage();
                for (let [key, value] of Object.entries(aggregatorStorage.breakGlassConfig)){
                    assert.equal(value, false);
                }

                // pause all operation
                pauseAllOperation = await aggregatorInstance.methods.pauseAll().send();
                await pauseAllOperation.confirmation();

                // Final values
                aggregatorStorage       = await aggregatorInstance.storage();
                for (let [key, value] of Object.entries(aggregatorStorage.breakGlassConfig)){
                    assert.equal(value, true);
                }

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('%unpauseAll               - admin (bob) should be able to unpause all entrypoints in the contract', async () => {
            try{

                // Initial Values
                aggregatorStorage = await aggregatorInstance.storage();
                for (let [key, value] of Object.entries(aggregatorStorage.breakGlassConfig)){
                    assert.equal(value, true);
                }

                // unpause all operation
                unpauseAllOperation = await aggregatorInstance.methods.unpauseAll().send();
                await unpauseAllOperation.confirmation();

                // Final values
                aggregatorStorage = await aggregatorInstance.storage();
                for (let [key, value] of Object.entries(aggregatorStorage.breakGlassConfig)){
                    assert.equal(value, false);
                }

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it("%togglePauseEntrypoint    - admin (bob) should be able to call this entrypoint", async() => {
            try{
                
                // pause operations

                pauseOperation = await aggregatorInstance.methods.togglePauseEntrypoint("updateData", true).send();
                await pauseOperation.confirmation();
                
                pauseOperation = await aggregatorInstance.methods.togglePauseEntrypoint("withdrawRewardMvrk", true).send();
                await pauseOperation.confirmation();

                pauseOperation = await aggregatorInstance.methods.togglePauseEntrypoint("withdrawRewardStakedMvn", true).send(); 
                await pauseOperation.confirmation();

                // update storage
                aggregatorStorage              = await aggregatorInstance.storage();

                // check that all entrypoints are paused
                for (let [key, value] of Object.entries(aggregatorStorage.breakGlassConfig)){
                    assert.equal(value, true);
                }

                // unpause operations

                pauseOperation = await aggregatorInstance.methods.togglePauseEntrypoint("updateData", false).send();
                await pauseOperation.confirmation();
                
                pauseOperation = await aggregatorInstance.methods.togglePauseEntrypoint("withdrawRewardMvrk", false).send();
                await pauseOperation.confirmation();

                pauseOperation = await aggregatorInstance.methods.togglePauseEntrypoint("withdrawRewardStakedMvn", false).send(); 
                await pauseOperation.confirmation();

                // update storage
                aggregatorStorage              = await aggregatorInstance.storage();

                // check that all entrypoints are unpaused
                for (let [key, value] of Object.entries(aggregatorStorage.breakGlassConfig)){
                    assert.equal(value, false);
                }

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

    });

    describe('Access Control Checks', function () {

        beforeEach("Set signer to non-admin (alice)", async () => {
            aggregatorStorage = await aggregatorInstance.storage();
            await signerFactory(tezos, satelliteOneSk);
        });

        it('%setAdmin                 - non-admin (alice) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                aggregatorStorage   = await aggregatorInstance.storage();
                const currentAdmin         = aggregatorStorage.admin;

                // Operation
                setAdminOperation = await aggregatorInstance.methods.setAdmin(satelliteOne);
                await chai.expect(setAdminOperation.send()).to.be.rejected;

                // Final values
                aggregatorStorage   = await aggregatorInstance.storage();
                const newAdmin             = aggregatorStorage.admin;

                // Assertions
                assert.strictEqual(newAdmin, currentAdmin);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%setGovernance            - non-admin (alice) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                aggregatorStorage = await aggregatorInstance.storage();
                const currentGovernance  = aggregatorStorage.governanceAddress;

                // Operation
                setGovernanceOperation = await aggregatorInstance.methods.setGovernance(satelliteOne);
                await chai.expect(setGovernanceOperation.send()).to.be.rejected;

                // Final values
                aggregatorStorage = await aggregatorInstance.storage();
                const updatedGovernance  = aggregatorStorage.governanceAddress;

                // Assertions
                assert.strictEqual(updatedGovernance, currentGovernance);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%setAdmin                 - non-admin (alice) should not be able to call this entrypoint', async () => {
            try {
                // Initial values
                const newName   = "testName";

                // Operation
                await chai.expect(aggregatorInstance.methods.setName(newName).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('%updateMetadata           - non-admin (alice) should not be able to update the contract metadata', async () => {
            try{
                // Initial values
                const key   = ''
                const hash  = Buffer.from('mavryk-storage:data fail', 'ascii').toString('hex')

                aggregatorStorage = await aggregatorInstance.storage();   
                const initialMetadata    = await aggregatorStorage.metadata.get(key);

                // Operation
                const updateOperation = await aggregatorInstance.methods.updateMetadata(key, hash);
                await chai.expect(updateOperation.send()).to.be.rejected;

                // Final values
                aggregatorStorage = await aggregatorInstance.storage();            
                const updatedData        = await aggregatorStorage.metadata.get(key);

                // check that there is no change in metadata
                assert.equal(updatedData, initialMetadata);
                assert.notEqual(updatedData, hash);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });
        
        it('%updateConfig             - non-admin (alice) should not be able to update contract config', async () => {
            try {
                // Initial values
                const decimals: BigNumber = new BigNumber(100);
                await signerFactory(tezos, satelliteOneSk);

                // Operation
                await chai.expect(aggregatorInstance.methods.updateConfig(decimals, "configDecimals").send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('%updateWhitelistContracts - non-admin (alice) should not be able to call this entrypoint', async () => {
            try {

                // init values
                contractMapKey  = satelliteTwo;
                storageMap      = "whitelistContracts";

                initialContractMapValue = await getStorageMapValue(aggregatorStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await aggregatorInstance.methods.updateWhitelistContracts(contractMapKey, 'update')
                await chai.expect(updateWhitelistContractsOperation.send()).to.be.rejected;

                aggregatorStorage = await aggregatorInstance.storage()
                updatedContractMapValue  = await getStorageMapValue(aggregatorStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'eve (key) should not be in the Whitelist Contracts map');

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%updateGeneralContracts   - non-admin (alice) should not be able to call this entrypoint', async () => {
            try {

                // init values
                contractMapKey  = "alice";
                storageMap      = "generalContracts";

                initialContractMapValue = await getStorageMapValue(aggregatorStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await aggregatorInstance.methods.updateGeneralContracts(contractMapKey, satelliteTwo, 'update')
                await chai.expect(updateGeneralContractsOperation.send()).to.be.rejected;

                aggregatorStorage = await aggregatorInstance.storage()
                updatedContractMapValue  = await getStorageMapValue(aggregatorStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'eve (key) should not be in the General Contracts map');

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%pauseAll                 - non-admin (alice) should not be able to call this entrypoint", async() => {
            try{

                pauseAllOperation = aggregatorInstance.methods.pauseAll(); 
                await chai.expect(pauseAllOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%unpauseAll               - non-admin (alice) should not be able to call this entrypoint", async() => {
            try{

                unpauseAllOperation = aggregatorInstance.methods.unpauseAll(); 
                await chai.expect(unpauseAllOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%togglePauseEntrypoint    - non-admin (alice) should not be able to call this entrypoint", async() => {
            try{
                
                // pause operations

                pauseOperation = aggregatorInstance.methods.togglePauseEntrypoint("updateData", true); 
                await chai.expect(pauseOperation.send()).to.be.rejected;
                
                pauseOperation = aggregatorInstance.methods.togglePauseEntrypoint("withdrawRewardMvrk", true); 
                await chai.expect(pauseOperation.send()).to.be.rejected;

                pauseOperation = aggregatorInstance.methods.togglePauseEntrypoint("withdrawRewardStakedMvn", true); 
                await chai.expect(pauseOperation.send()).to.be.rejected;

                // unpause operations

                pauseOperation = aggregatorInstance.methods.togglePauseEntrypoint("updateData", false); 
                await chai.expect(pauseOperation.send()).to.be.rejected;
                
                pauseOperation = aggregatorInstance.methods.togglePauseEntrypoint("withdrawRewardMvrk", false); 
                await chai.expect(pauseOperation.send()).to.be.rejected;

                pauseOperation = aggregatorInstance.methods.togglePauseEntrypoint("withdrawRewardStakedMvn", false); 
                await chai.expect(pauseOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%addOracle                - non-admin (alice) should not be able to call this entrypoint', async () => {
            try{
                // Initial values
                await signerFactory(tezos, userSk);
                const oracleAddress     = satelliteThree;
    
                // Operation
                await chai.expect(aggregatorInstance.methods.addOracle(oracleAddress).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('%updateOracle             - non-satellite (mallory) should not be able to call this entrypoint', async () => {
            try {
                
                // Initial values
                await signerFactory(tezos, userSk)

                // Operation
                updateOracleOperation = aggregatorInstance.methods.updateOracle();
                await chai.expect(updateOracleOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('%removeOracle             - non-admin (alice) should not be able to call this entrypoint', async () => {
            try{
                // Initial values
                const oracleAddress = satelliteThree;

                // Operation    
                await chai.expect(aggregatorInstance.methods.removeOracle(oracleAddress).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('%updateData               - non-oracle (mallory) should not be able to call this entrypoint', async () => {
            try {
                // Initial values
                observations = [
                    {
                        "oracle": satelliteFour,
                        "data": new BigNumber(10142857143)
                    },
                    {
                        "oracle": satelliteTwo,
                        "data": new BigNumber(10142853322)
                    },
                    {
                        "oracle": satelliteOne,
                        "data": new BigNumber(10142857900)
                    },
                    {
                        "oracle": satelliteFive,
                        "data": new BigNumber(10142857901)
                    }
                ];
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
                await signerFactory(tezos, satelliteOneSk);
                signatures.set(satelliteOne, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, satelliteTwoSk);
                signatures.set(satelliteTwo, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, satelliteFiveSk);
                signatures.set(satelliteFive, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(tezos, satelliteFourSk);
                signatures.set(satelliteFour, await utils.signOracleDataResponses(oracleObservations));
        
                // Operation
                await signerFactory(tezos, userSk);
                await chai.expect(aggregatorInstance.methods.updateData(oracleObservations, signatures).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it("%setLambda                - non-admin (alice) should not be able to call this entrypoint", async() => {
            try{

                // random lambda for testing
                const randomLambdaName  = "randomLambdaName";
                const randomLambdaBytes = "050200000cba0743096500000112075e09650000005a036e036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a0362036203620362036200000000036203620760036803690000000009650000000a0362036203620362036e00000000075e09650000006c09650000000a0362036203620362036200000000036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a036203620362036203620000000003620362076003680369000000000362075e07650765036203620362036c075e076507650368036e0362036e036200000000070702000001770743075e076507650368036e0362036e020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c03200342020000010e037a034c037a07430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700002034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f02000000090743036200810303270200000000072f020000000907430362009c0203270200000000070702000000600743036200808080809d8fc0d0bff2f1b26703420200000047037a034c037a0321052900080570000205290015034b031105710002031605700002033a0322072f020000001307430368010000000844495620627920300327020000000003160707020000001a037a037a03190332072c0200000002032002000000020327034f0707020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c032000808080809d8fc0d0bff2f1b2670342020000092d037a057a000505700005037a034c07430362008f03052100020529000f0529000307430359030a034c03190325072c0200000002032702000000020320053d036d05700002072e02000008a4072e020000007c057000030570000405700005057000060570000705200005072e020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000081c072e0200000044057000030570000405700005057000060570000705200005072e0200000010072e02000000020320020000000203200200000010072e020000000203200200000002032002000007cc072e0200000028057000030570000405700005057000060570000705200005072e02000000020320020000000203200200000798072e0200000774034c032003480521000305210003034c052900050316034c03190328072c020000000002000000090743036200880303270570000205210002034c0321052100030521000205290011034c0329072f020000002005290015074303620000074303620000074303620000074303620000054200050200000004034c03200743036200000521000203160319032a072c020000021c052100020521000407430362008e02057000020529000907430368010000000a64656c65676174696f6e034203420521000b034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f0200000009074303620081030327020000001a072f02000000060743035903030200000008032007430359030a074303620000034c072c020000007303200521000205210004034205210007034c0326052100030521000205290008034205700007034c03260521000205290005034c05290007034b0311052100030316033a0521000b034c0322072f02000000130743036801000000084449562062792030032702000000000316034c0316031202000000060570000603200521000305210003034205210008034c0326052100030521000205700004052900030312055000030571000205210003052100030570000405290005031205500005057100020521000305700002052100030570000403160312031205500001034c05210003034c0570000305290013034b031105500013034c02000000060570000503200521000205290015055000080521000205700002052900110570000205700003034c0346034c0350055000110571000205210003052900070743036200000790010000000c746f74616c5f737570706c790362072f020000000907430362008a01032702000000000521000405290007074303620000037703420790010000000b6765745f62616c616e63650362072f02000000090743036200890103270200000000034c052100090743036200a40105210004033a033a0322072f0200000013074303680100000008444956206279203003270200000000031605210009074303620002033a0312052100090521000a07430362008803033a033a0322072f020000001307430368010000000844495620627920300327020000000003160743036200a401034c0322072f0200000013074303680100000008444956206279203003270200000000031605210004033a05210009052100020322072f0200000013074303680100000008444956206279203003270200000000031605210005034b0311052100060570000a052100040322072f0200000013074303680100000008444956206279203003270200000000031605700007052900130312055000130571000507430362008c0305210004052100070342034205210009034c0326032005700005057000030342052100050570000305700002037a034c0570000305700002034b0311074303620000052100020319032a072c020000003b05210002034c057000030322072f02000000130743036801000000084449562062792030032702000000000316057000020529001503120550001502000000080570000205200002057100030521000405210003034c05290011034c0329072f0200000009074303620089030327020000000003210521000507430362008b03057000020316057000020342034205700007034c03260320032105700004057000020316034b031105500001052100040529000707430362000005700003034205210004037705700002037a057000040655055f0765046e000000062566726f6d5f065f096500000026046e0000000425746f5f04620000000925746f6b656e5f696404620000000725616d6f756e7400000000000000042574787300000009257472616e73666572072f0200000008074303620027032702000000000743036a0000053d0765036e055f096500000006036e0362036200000000053d096500000006036e036203620000000005700004057000050570000705420003031b057000040342031b034d0743036200000521000303160319032a072c02000000440521000405210003034205700005034c032605210003052100020570000403160312055000010571000205210005034c0570000505290013034b031105500013057100030200000006057000040320034c052100040529001505500008034c0521000405700004052900110570000305210005034c0346034c03500550001105710002052100030570000207430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700004034c03260655036e0000000e256f6e5374616b654368616e6765072f02000000090743036200b702032702000000000743036a000005700002034d053d036d034c031b034c031b02000000180570000305700004057000050570000605700007052000060200000036057000030570000405700005057000060570000705200005072e0200000010072e0200000002032002000000020320020000000203200342";

                const setLambdaOperation = aggregatorInstance.methods.setLambda(randomLambdaName, randomLambdaBytes); 
                await chai.expect(setLambdaOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

    })
});