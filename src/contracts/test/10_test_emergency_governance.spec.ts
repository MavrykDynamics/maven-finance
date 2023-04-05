import assert from "assert";
import { Utils, MVK } from "./helpers/Utils";

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

import { bob, alice, eve, mallory } from "../scripts/sandbox/accounts";
import * as helperFunctions from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("Emergency Governance tests", async () => {
    
    var utils: Utils;
    let tezos 

    let doormanAddress

    let tokenId = 0

    let doormanInstance;
    let delegationInstance;
    let mvkTokenInstance;
    let councilInstance;
    let governanceInstance;
    let emergencyGovernanceInstance;
    let breakGlassInstance;
    let vestingInstance;
    let treasuryInstance;

    let doormanStorage;
    let delegationStorage;
    let mvkTokenStorage;
    let councilStorage;
    let governanceStorage;
    let emergencyGovernanceStorage;
    let breakGlassStorage;
    let vestingStorage;
    let treasuryStorage;

    let updateOperatorsOperation

    before("setup", async () => {

        utils = new Utils();
        await utils.init(bob.sk);
        tezos = utils.tezos;

        doormanAddress                  = contractDeployments.doorman.address;

        doormanInstance                 = await utils.tezos.contract.at(doormanAddress);
        delegationInstance              = await utils.tezos.contract.at(contractDeployments.delegation.address);
        mvkTokenInstance                = await utils.tezos.contract.at(contractDeployments.mvkToken.address);
        councilInstance                 = await utils.tezos.contract.at(contractDeployments.council.address);
        governanceInstance              = await utils.tezos.contract.at(contractDeployments.governance.address);
        emergencyGovernanceInstance     = await utils.tezos.contract.at(contractDeployments.emergencyGovernance.address);
        breakGlassInstance              = await utils.tezos.contract.at(contractDeployments.breakGlass.address);
        vestingInstance                 = await utils.tezos.contract.at(contractDeployments.vesting.address);
        treasuryInstance                = await utils.tezos.contract.at(contractDeployments.treasury.address);
            
        doormanStorage                  = await doormanInstance.storage();
        delegationStorage               = await delegationInstance.storage();
        mvkTokenStorage                 = await mvkTokenInstance.storage();
        councilStorage                  = await councilInstance.storage();
        governanceStorage               = await governanceInstance.storage();
        emergencyGovernanceStorage      = await emergencyGovernanceInstance.storage();
        breakGlassStorage               = await breakGlassInstance.storage();
        vestingStorage                  = await vestingInstance.storage();
        treasuryStorage                 = await treasuryInstance.storage();

        // console.log('-- -- -- -- -- Emergency Governance Tests -- -- -- --')
        // console.log('Doorman Contract deployed at:', doormanInstance.address);
        // console.log('Delegation Contract deployed at:', delegationInstance.address);
        // console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
        // console.log('Council Contract deployed at:', councilInstance.address);
        // console.log('Governance Contract deployed at:', governanceInstance.address);
        // console.log('Emergency Governance Contract deployed at:', emergencyGovernanceInstance.address);
        // console.log('Break Glass Contract deployed at:', breakGlassInstance.address);
        // console.log('Vesting Contract deployed at:', vestingInstance.address);
        // console.log('Treasury Contract deployed at:', treasuryInstance.address);
        // console.log('Bob address: ' + bob.pkh);
        // console.log('Alice address: ' + alice.pkh);
        // console.log('Eve address: ' + eve.pkh);
        // console.log('-- -- -- -- -- -- -- -- --')


        // init variables

        // ---------------------------------------------
        // mallory update operators - set initial staked MVK total supply of 250
        await helperFunctions.signerFactory(tezos, mallory.sk);
        updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, mallory.pkh, doormanAddress, tokenId);
        await updateOperatorsOperation.confirmation();

        // const userStake = MVK(250);
        // const malloryStakeMvkOperation = await doormanInstance.methods.stake(userStake).send();
        // await malloryStakeMvkOperation.confirmation();

        // const malloryStakedMvkBalance    = await doormanStorage.userStakeBalanceLedger.get(mallory.pkh);
        // assert.equal(malloryStakedMvkBalance.balance, userStake);
        // ---------------------------------------------
    });

    describe("%setAdmin", async () => {
        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk)
        });
        it('Admin should be able to call this entrypoint and update the contract administrator with a new address', async () => {
            try{
                // Initial Values
                emergencyGovernanceStorage = await emergencyGovernanceInstance.storage();
                const currentAdmin = emergencyGovernanceStorage.admin;

                // Operation
                const setAdminOperation = await emergencyGovernanceInstance.methods.setAdmin(alice.pkh).send();
                await setAdminOperation.confirmation();

                // Final values
                emergencyGovernanceStorage = await emergencyGovernanceInstance.storage();
                const newAdmin = emergencyGovernanceStorage.admin;

                // reset admin
                await helperFunctions.signerFactory(tezos, alice.sk);
                const resetAdminOperation = await emergencyGovernanceInstance.methods.setAdmin(bob.pkh).send();
                await resetAdminOperation.confirmation();

                // Assertions
                assert.notStrictEqual(newAdmin, currentAdmin);
                assert.strictEqual(newAdmin, alice.pkh);
                assert.strictEqual(currentAdmin, bob.pkh);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Non-admin should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                await helperFunctions.signerFactory(tezos, alice.sk);
                emergencyGovernanceStorage = await emergencyGovernanceInstance.storage();
                const currentAdmin = emergencyGovernanceStorage.admin;

                // Operation
                await chai.expect(emergencyGovernanceInstance.methods.setAdmin(alice.pkh).send()).to.be.rejected;

                // Final values
                emergencyGovernanceStorage = await emergencyGovernanceInstance.storage();
                const newAdmin = emergencyGovernanceStorage.admin;

                // Assertions
                assert.strictEqual(newAdmin, currentAdmin);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    });

    describe("%updateConfig", async () => {
        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk)
        });

        it('Admin should be able to call the entrypoint and configure the vote expiry in days', async () => {
            try{
                // Initial Values
                emergencyGovernanceStorage = await emergencyGovernanceInstance.storage();
                const newConfigValue = 1;

                // Operation
                const updateConfigOperation = await emergencyGovernanceInstance.methods.updateConfig(newConfigValue,"configVoteExpiryDays").send();
                await updateConfigOperation.confirmation();

                // Final values
                emergencyGovernanceStorage = await emergencyGovernanceInstance.storage();
                const updateConfigValue = emergencyGovernanceStorage.config.voteExpiryDays;

                // Assertions
                assert.equal(updateConfigValue, newConfigValue);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Admin should be able to call the entrypoint and configure the required fee', async () => {
            try{
                // Initial Values
                emergencyGovernanceStorage = await emergencyGovernanceInstance.storage();
                const newConfigValue = 5;

                // Operation
                const updateConfigOperation = await emergencyGovernanceInstance.methods.updateConfig(newConfigValue,"configRequiredFeeMutez").send();
                await updateConfigOperation.confirmation();

                // Final values
                emergencyGovernanceStorage = await emergencyGovernanceInstance.storage();
                const updateConfigValue = emergencyGovernanceStorage.config.requiredFeeMutez;

                // Assertions
                assert.equal(updateConfigValue, newConfigValue);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Admin should be able to call the entrypoint and configure the sMVK Percentage required', async () => {
            try{
                // Initial Values
                emergencyGovernanceStorage = await emergencyGovernanceInstance.storage();
                const newConfigValue = 5000;

                // Operation
                const updateConfigOperation = await emergencyGovernanceInstance.methods.updateConfig(newConfigValue,"configStakedMvkPercentRequired").send();
                await updateConfigOperation.confirmation();

                // Final values
                emergencyGovernanceStorage = await emergencyGovernanceInstance.storage();
                const updateConfigValue = emergencyGovernanceStorage.config.stakedMvkPercentageRequired;

                // Assertions
                assert.equal(updateConfigValue, newConfigValue);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Admin should not be able to call the entrypoint and configure the sMVK Percentage required if it exceeds 100%', async () => {
            try{
                // Initial Values
                emergencyGovernanceStorage = await emergencyGovernanceInstance.storage();
                const currentConfigValue = emergencyGovernanceStorage.config.stakedMvkPercentageRequired;
                const newConfigValue = 10001;

                // Operation
                await chai.expect(emergencyGovernanceInstance.methods.updateConfig(newConfigValue,"configStakedMvkPercentRequired").send()).to.be.rejected;

                // Final values
                emergencyGovernanceStorage = await emergencyGovernanceInstance.storage();
                const updateConfigValue = emergencyGovernanceStorage.config.stakedMvkPercentageRequired;

                // Assertions
                assert.notEqual(newConfigValue, currentConfigValue);
                assert.equal(updateConfigValue.toNumber(), currentConfigValue.toNumber());

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Admin should be able to call the entrypoint and configure the Min sMVK required to vote', async () => {
            try{
                // Initial Values
                emergencyGovernanceStorage = await emergencyGovernanceInstance.storage();
                const newConfigValue = MVK(2);

                // Operation
                const updateConfigOperation = await emergencyGovernanceInstance.methods.updateConfig(newConfigValue,"configMinStakedMvkForVoting").send();
                await updateConfigOperation.confirmation();

                // Final values
                emergencyGovernanceStorage = await emergencyGovernanceInstance.storage();
                const updateConfigValue = emergencyGovernanceStorage.config.minStakedMvkRequiredToVote;

                // Assertions
                assert.equal(updateConfigValue, newConfigValue);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Admin should not be able to call the entrypoint and configure the Min sMVK required to vote if it goes below 0.1MVK', async () => {
            try{
                // Initial Values
                emergencyGovernanceStorage = await emergencyGovernanceInstance.storage();
                const currentConfigValue = emergencyGovernanceStorage.config.minStakedMvkRequiredToVote;
                const newConfigValue = MVK(0.99);

                // Operation
                await chai.expect(emergencyGovernanceInstance.methods.updateConfig(newConfigValue,"configStakedMvkPercentRequired").send()).to.be.rejected;

                // Final values
                emergencyGovernanceStorage = await emergencyGovernanceInstance.storage();
                const updateConfigValue = emergencyGovernanceStorage.config.minStakedMvkRequiredToVote;

                // Assertions
                assert.notEqual(newConfigValue, currentConfigValue);
                assert.equal(updateConfigValue.toNumber(), currentConfigValue.toNumber());
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Admin should be able to call the entrypoint and configure the Min sMVK required to trigger', async () => {
            try{
                // Initial Values
                emergencyGovernanceStorage = await emergencyGovernanceInstance.storage();
                const newConfigValue = MVK(0.1);

                // Operation
                const updateConfigOperation = await emergencyGovernanceInstance.methods.updateConfig(newConfigValue,"configMinStakedMvkForTrigger").send();
                await updateConfigOperation.confirmation();

                // Final values
                emergencyGovernanceStorage = await emergencyGovernanceInstance.storage();
                const updateConfigValue = emergencyGovernanceStorage.config.minStakedMvkRequiredToTrigger;

                // Assertions
                assert.equal(updateConfigValue, newConfigValue);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Admin should not be able to call the entrypoint and configure the Min sMVK required to trigger if it goes below 0.01MVK', async () => {
            try{
                // Initial Values
                emergencyGovernanceStorage = await emergencyGovernanceInstance.storage();
                const currentConfigValue = emergencyGovernanceStorage.config.minStakedMvkRequiredToTrigger;
                const newConfigValue = MVK(0.0099);

                // Operation
                await chai.expect(emergencyGovernanceInstance.methods.updateConfig(newConfigValue,"configMinStakedMvkForTrigger").send()).to.be.rejected;

                // Final values
                emergencyGovernanceStorage = await emergencyGovernanceInstance.storage();
                const updateConfigValue = emergencyGovernanceStorage.config.minStakedMvkRequiredToTrigger;

                // Assertions
                assert.notEqual(newConfigValue, currentConfigValue);
                assert.equal(updateConfigValue.toNumber(), currentConfigValue.toNumber());
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Non-admin should not be able to call the entrypoint', async () => {
            try{
                // Initial Values
                emergencyGovernanceStorage = await emergencyGovernanceInstance.storage();
                const newConfigValue = MVK(5);

                // Operation
                await helperFunctions.signerFactory(tezos, alice.sk);
                await chai.expect(emergencyGovernanceInstance.methods.updateConfig(newConfigValue,"configMinStakedMvkForTrigger").send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    });

    describe("%triggerEmergencyControl", async () => {

        beforeEach("Set signer to user", async () => {
            await helperFunctions.signerFactory(tezos, alice.sk)
        });

        it('User should not be able to call this entrypoint if it did not send the required fees', async () => {
            try{
                // Initial Values
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                doormanStorage              = await doormanInstance.storage();

                // Initial Values
                await helperFunctions.signerFactory(tezos, bob.sk)
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                const stakeAmount           = MVK(10);

                // Operations
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, bob.pkh, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();
    
                const stakeOperation    = await doormanInstance.methods.stake(stakeAmount).send();
                await stakeOperation.confirmation();
    
                const stakeRecord       = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
                assert.notEqual(stakeRecord.balance, 0);

                // Operation
                await chai.expect(emergencyGovernanceInstance.methods.triggerEmergencyControl("Test emergency control", "Test description").send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('User should not be able to call this entrypoint if it does not have enough SMVK to trigger', async () => {
            try{
                // Operation
                await chai.expect(emergencyGovernanceInstance.methods.triggerEmergencyControl("Test emergency control", "Test description").send({amount : 10})).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('User should not be able to call the treasury contract does not exist in the generalContracts map of the storage', async () => {
            try{
                // Update generalContracts
                await helperFunctions.signerFactory(tezos, bob.sk);
                var updateOperation = await governanceInstance.methods.updateGeneralContracts("taxTreasury", contractDeployments.treasury.address).send();
                await updateOperation.confirmation()

                // Initial Values
                await helperFunctions.signerFactory(tezos, alice.sk)
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                const stakeAmount           = MVK(10);

                // Operations
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, alice.pkh, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();
    
                const stakeOperation    = await doormanInstance.methods.stake(stakeAmount).send();
                await stakeOperation.confirmation();
    
                const stakeRecord       = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
                assert.notEqual(stakeRecord.balance, 0);

                // Operation
                await chai.expect(emergencyGovernanceInstance.methods.triggerEmergencyControl("Test emergency control", "Test description").send({amount: 0.000005})).to.be.rejected;

                // Reset contract
                await helperFunctions.signerFactory(tezos, bob.sk);
                var updateOperation = await governanceInstance.methods.updateGeneralContracts("taxTreasury", contractDeployments.treasury.address).send();
                await updateOperation.confirmation()
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('User should not be able to call the doorman contract does not exist in the generalContracts map of the storage', async () => {
            try{
                // Update generalContracts
                await helperFunctions.signerFactory(tezos, bob.sk);
                var updateOperation = await governanceInstance.methods.updateGeneralContracts("doorman", doormanAddress).send();
                await updateOperation.confirmation()

                // Initial Values
                await helperFunctions.signerFactory(tezos, alice.sk)
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                doormanStorage              = await doormanInstance.storage();

                // Operations
                const stakeRecord       = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
                assert.notEqual(stakeRecord.balance, 0);

                // Operation
                await chai.expect(emergencyGovernanceInstance.methods.triggerEmergencyControl("Test emergency control", "Test description").send({amount: 0.000005})).to.be.rejected;

                // Reset contract
                await helperFunctions.signerFactory(tezos, bob.sk);
                var updateOperation = await governanceInstance.methods.updateGeneralContracts("doorman", doormanAddress).send();
                await updateOperation.confirmation()
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('User should be able to call this entrypoint and trigger an emergency control', async () => {
            try{
                // Initial Values
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                doormanStorage              = await doormanInstance.storage();

                // Operations
                const stakeRecord       = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
                assert.notEqual(stakeRecord.balance, 0);

                // Operation
                const triggerOperation  = await emergencyGovernanceInstance.methods.triggerEmergencyControl("Test emergency control", "Test description").send({amount: 0.000005});
                await triggerOperation.confirmation();

                // Final values
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                const emergencyID           = emergencyGovernanceStorage.currentEmergencyGovernanceId;
                const emergencyProposal     = await emergencyGovernanceStorage.emergencyGovernanceLedger.get(emergencyID);

                assert.notEqual(emergencyID, 0);
                assert.notEqual(emergencyProposal, undefined);
                assert.strictEqual(emergencyProposal.proposerAddress, alice.pkh);
                assert.strictEqual(emergencyProposal.stakedMvkPercentageRequired.toNumber(), emergencyGovernanceStorage.config.stakedMvkPercentageRequired.toNumber());
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('User should not be able to call this entrypoint if there is an emergency control in process', async () => {
            try{
                // Initial Values
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                const emergencyID           = emergencyGovernanceStorage.currentEmergencyGovernanceId
                assert.notEqual(emergencyID, 0);

                // Operation
                await chai.expect(emergencyGovernanceInstance.methods.triggerEmergencyControl("Test emergency control", "Test description").send({amount: 0.000005})).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    })

    describe("%dropEmergencyControl#1", async () => {

        beforeEach("Set signer to user", async () => {
            await helperFunctions.signerFactory(tezos, alice.sk)
        });

        it('Non-proposer should not be able to call the entrypoint', async () => {
            try{
                // Initial values
                await helperFunctions.signerFactory(tezos, eve.sk);
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                doormanStorage              = await doormanInstance.storage();

                // Operation
                await chai.expect(emergencyGovernanceInstance.methods.dropEmergencyGovernance().send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Proposer should be able to call this entrypoint and drop the current emergency governance proposal he proposed', async () => {
            try{
                // Initial values
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                const emergencyID           = emergencyGovernanceStorage.currentEmergencyGovernanceId

                // Operation
                const dropOperation     = await emergencyGovernanceInstance.methods.dropEmergencyGovernance().send();
                await dropOperation.confirmation();

                // Assertions
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                const emergencyProposal     = await emergencyGovernanceStorage.emergencyGovernanceLedger.get(emergencyID);
                assert.equal(emergencyGovernanceStorage.currentEmergencyGovernanceId, 0)
                assert.equal(emergencyProposal.dropped, true)
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Proposer should not be able to call this entrypoint if there is no current proposal in the process', async () => {
            try{
                await chai.expect(emergencyGovernanceInstance.methods.dropEmergencyGovernance().send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    })

    describe("%voteFromEmergencyControl", async () => {

        before("Trigger emergency control", async () => {
            await helperFunctions.signerFactory(tezos, alice.sk)
            // Initial Values
            emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
            doormanStorage              = await doormanInstance.storage();

            const stakeRecord       = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
            assert.notEqual(stakeRecord.balance, 0);

            // Operation
            const triggerOperation  = await emergencyGovernanceInstance.methods.triggerEmergencyControl("Test emergency control", "Test description").send({amount: 0.000005});
            await triggerOperation.confirmation();

            // Final values
            emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
            const emergencyID           = emergencyGovernanceStorage.currentEmergencyGovernanceId;
            const emergencyProposal     = await emergencyGovernanceStorage.emergencyGovernanceLedger.get(emergencyID);

            assert.notEqual(emergencyID, 0);
            assert.notEqual(emergencyProposal, undefined);
            assert.strictEqual(emergencyProposal.proposerAddress, alice.pkh);
            assert.strictEqual(emergencyProposal.stakedMvkPercentageRequired.toNumber(), emergencyGovernanceStorage.config.stakedMvkPercentageRequired.toNumber());
        });

        beforeEach("Set signer to user", async () => {
            await helperFunctions.signerFactory(tezos, alice.sk)
        });

        it('User should not be able to call this entrypoint if the getStakedBalance view does not exist on the Doorman contract', async () => {
            try{
                // Update generalContracts
                await helperFunctions.signerFactory(tezos, bob.sk);
                var updateOperation = await governanceInstance.methods.updateGeneralContracts("doorman", doormanAddress).send();
                await updateOperation.confirmation()

                // Initial Values
                await helperFunctions.signerFactory(tezos, mallory.sk)
                
                // Operation
                await chai.expect(emergencyGovernanceInstance.methods.voteForEmergencyControl().send()).to.be.rejected;

                // Reset contract
                await helperFunctions.signerFactory(tezos, bob.sk);
                var updateOperation = await governanceInstance.methods.updateGeneralContracts("doorman", doormanAddress).send();
                await updateOperation.confirmation()
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('User should not be able to call this entrypoint if it does not have enough SMVK', async () => {
            try{
                // Initial Values
                await helperFunctions.signerFactory(tezos, mallory.sk)
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage()
                const smvkRequired          = emergencyGovernanceStorage.config.minStakedMvkRequiredToVote;
                const stakeAmount           = MVK(1)

                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, mallory.pkh, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();
    
                const stakeOperation    = await doormanInstance.methods.stake(stakeAmount).send();
                await stakeOperation.confirmation();

                doormanStorage              = await doormanInstance.storage()
                const userSMVKBalance       = (await doormanStorage.userStakeBalanceLedger.get(mallory.pkh)).balance

                assert.equal(userSMVKBalance<smvkRequired, true);
                
                // Operation
                await chai.expect(emergencyGovernanceInstance.methods.voteForEmergencyControl().send()).to.be.rejected;

                // Operation
                await helperFunctions.signerFactory(tezos, bob.sk);
                const updateOperation = await emergencyGovernanceInstance.methods.updateConfig(MVK(0.1),"configMinStakedMvkForTrigger").send();
                await updateOperation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('User should not be able to call this entrypoint if the proposal was dropped', async () => {
            try{
                // Initial values
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                const emergencyID           = emergencyGovernanceStorage.currentEmergencyGovernanceId;

                // Operation
                const dropOperation     = await emergencyGovernanceInstance.methods.dropEmergencyGovernance().send();
                await dropOperation.confirmation();

                await chai.expect(emergencyGovernanceInstance.methods.voteForEmergencyControl().send()).to.be.rejected;

                // Final values
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                const emergencyProposal     = await emergencyGovernanceStorage.emergencyGovernanceLedger.get(emergencyID);
                assert.equal(emergencyGovernanceStorage.currentEmergencyGovernanceId, 0);
                assert.equal(emergencyProposal.dropped, true);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('User should not be able to call this entrypoint if there is no current proposal in the process', async () => {
            try{
                // Initial values
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();

                // Operation
                await chai.expect(emergencyGovernanceInstance.methods.voteForEmergencyControl().send()).to.be.rejected;

                // Final values
                assert.equal(emergencyGovernanceStorage.currentEmergencyGovernanceId, 0);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('User should be able to call this entrypoint and vote for the current proposal without triggering the break glass', async () => {
            try{
                // Initial Values
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                
                // Operations
                const stakeRecord       = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
                assert.notEqual(stakeRecord.balance, 0);

                // Operation
                const triggerOperation  = await emergencyGovernanceInstance.methods.triggerEmergencyControl("Test emergency control", "Test description").send({amount: 0.000005});
                await triggerOperation.confirmation();

                // Mid values
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                const emergencyID           = emergencyGovernanceStorage.currentEmergencyGovernanceId;
                var emergencyProposal       = await emergencyGovernanceStorage.emergencyGovernanceLedger.get(emergencyID);
                console.log("SMVK Balance: ", stakeRecord.balance)
                console.log(emergencyProposal)
                console.log("REQUIRED: ", emergencyProposal.stakedMvkRequiredForBreakGlass)

                assert.notEqual(emergencyID, 0);
                assert.notEqual(emergencyProposal, undefined);
                assert.strictEqual(emergencyProposal.proposerAddress, alice.pkh);
                assert.strictEqual(emergencyProposal.stakedMvkPercentageRequired.toNumber(), emergencyGovernanceStorage.config.stakedMvkPercentageRequired.toNumber());

                console.log("SMVK required for breakGlass: ", emergencyProposal.stakedMvkRequiredForBreakGlass);

                // Vote operation
                const voteOperation = await emergencyGovernanceInstance.methods.voteForEmergencyControl().send();
                await voteOperation.confirmation();

                // Final values
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                emergencyProposal           = await emergencyGovernanceStorage.emergencyGovernanceLedger.get(emergencyID);
                doormanStorage              = await doormanInstance.storage()
                const userSMVKBalance       = (await doormanStorage.userStakeBalanceLedger.get(alice.pkh)).balance
                const userVote              = await emergencyProposal.voters.get(alice.pkh)

                console.log("vote: ", userVote)

                console.log("Alice SMVK balance: ", userSMVKBalance);
                assert.equal(userSMVKBalance<emergencyProposal.stakedMvkRequiredForBreakGlass, true);
                assert.notStrictEqual(userVote, undefined);
                assert.equal(userVote[0].toNumber(), userSMVKBalance.toNumber());
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('User should not be able to call this entrypoint and vote for the same proposal twice or more', async () => {
            try{
                // Initial Values
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                const emergencyID           = emergencyGovernanceStorage.currentEmergencyGovernanceId;
                var emergencyProposal       = await emergencyGovernanceStorage.emergencyGovernanceLedger.get(emergencyID);

                // Vote operation
                console.log(emergencyProposal)
                await chai.expect(emergencyGovernanceInstance.methods.voteForEmergencyControl().send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('User should not be able to call this entrypoint and vote for the current proposal and trigger break glass if the if the breakGlass contract is not in generalContracts map or breakGlass entrypoint does not exist in it', async () => {
            try{
                // Update generalContracts
                await helperFunctions.signerFactory(tezos, bob.sk);
                var updateOperation = await governanceInstance.methods.updateGeneralContracts("breakGlass", contractDeployments.breakGlass.address).send();
                await updateOperation.confirmation()

                // Initial Values
                const emergencyID           = emergencyGovernanceStorage.currentEmergencyGovernanceId;
                const emergencyProposal     = await emergencyGovernanceStorage.emergencyGovernanceLedger.get(emergencyID);
                const stakeAmount           = emergencyProposal.stakedMvkRequiredForBreakGlass;

                // User stake more to trigger break glass
                await helperFunctions.signerFactory(tezos, alice.sk)
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, alice.pkh, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();

                const stakeOperation    = await doormanInstance.methods.stake(stakeAmount).send();
                await stakeOperation.confirmation();
    
                const stakeRecord       = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
                assert.notEqual(stakeRecord.balance, 0);
                
                // Operation
                await chai.expect(emergencyGovernanceInstance.methods.voteForEmergencyControl().send()).to.be.rejected;

                // Reset contract
                await helperFunctions.signerFactory(tezos, bob.sk);
                var updateOperation = await governanceInstance.methods.updateGeneralContracts("breakGlass", contractDeployments.breakGlass.address).send();
                await updateOperation.confirmation()
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('User should not be able to call this entrypoint and vote for the current proposal and trigger break glass if the if the governance contract is not in generalContracts map or breakGlass entrypoint does not exist in it', async () => {
            try{
                // Update generalContracts
                await helperFunctions.signerFactory(tezos, bob.sk);
                var updateOperation = await governanceInstance.methods.updateGeneralContracts("governance", contractDeployments.governance.address).send();
                await updateOperation.confirmation()

                // Initial Values
                const emergencyID           = emergencyGovernanceStorage.currentEmergencyGovernanceId;

                // User stake more to trigger break glass
                await helperFunctions.signerFactory(tezos, alice.sk)
                const stakeRecord       = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
                assert.notEqual(stakeRecord.balance, 0);
                
                // Operation
                await chai.expect(emergencyGovernanceInstance.methods.voteForEmergencyControl().send()).to.be.rejected;

                // Reset contract
                await helperFunctions.signerFactory(tezos, bob.sk);
                var updateOperation = await governanceInstance.methods.updateGeneralContracts("governance", contractDeployments.governance.address).send();
                await updateOperation.confirmation()
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('User should be able to call this entrypoint and vote for the current proposal and trigger break glass', async () => {
            try{
                // Initial Values
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                const emergencyID           = emergencyGovernanceStorage.currentEmergencyGovernanceId;
                var emergencyProposal       = await emergencyGovernanceStorage.emergencyGovernanceLedger.get(emergencyID);

                // Set all contracts admin to governance address if it is not
                await helperFunctions.signerFactory(tezos, bob.sk);
                governanceStorage             = await governanceInstance.storage();
                var generalContracts          = governanceStorage.generalContracts.entries();

                for (let entry of generalContracts){
                    // Get contract storage
                    var contract        = await utils.tezos.contract.at(entry[1]);
                    var storage:any     = await contract.storage();

                    // Check admin
                    if(storage.hasOwnProperty('admin') && storage.admin!==contractDeployments.governance.address && storage.admin!==contractDeployments.breakGlass.address){
                        var setAdminOperation   = await contract.methods.setAdmin(contractDeployments.governance.address).send();
                        await setAdminOperation.confirmation()
                    }
                }

                // User stake more to trigger break glass
                await helperFunctions.signerFactory(tezos, mallory.sk);
                const stakeAmount           = MVK(10)
                
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, mallory.pkh, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();
    
                const stakeOperation    = await doormanInstance.methods.stake(stakeAmount).send();
                await stakeOperation.confirmation();

                const stakeRecord       = await doormanStorage.userStakeBalanceLedger.get(mallory.pkh);
                assert.notEqual(stakeRecord.balance, 0);
                
                const voteOperation     = await emergencyGovernanceInstance.methods.voteForEmergencyControl().send();
                await voteOperation.confirmation();

                // Check if glass was broken
                breakGlassStorage       = await breakGlassInstance.storage();
                const glassBroken       = breakGlassStorage.glassBroken;
                assert.equal(glassBroken, true);

                // Check emergency storage
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                emergencyProposal           = await emergencyGovernanceStorage.emergencyGovernanceLedger.get(emergencyID);
                assert.equal(emergencyProposal.executed, true);

                // Propagate break glass operation
                await helperFunctions.signerFactory(tezos, bob.sk)
                breakGlassStorage   = await breakGlassInstance.storage();
                var breakGlassActionID    = breakGlassStorage.actionCounter;
                const propagateActionOperation    = await breakGlassInstance.methods.propagateBreakGlass().send();
                await propagateActionOperation.confirmation();

                // Sign action propagate action
                await helperFunctions.signerFactory(tezos, alice.sk);
                var signActionOperation   = await breakGlassInstance.methods.signAction(breakGlassActionID).send();
                await signActionOperation.confirmation();
                await helperFunctions.signerFactory(tezos, eve.sk);
                signActionOperation   = await breakGlassInstance.methods.signAction(breakGlassActionID).send();
                await signActionOperation.confirmation();

                // Check admin and pause in all contracts
                governanceStorage       = await governanceInstance.storage();
                generalContracts        = governanceStorage.generalContracts.entries();
                for (let entry of generalContracts){
                    // Get contract storage
                    var contract        = await utils.tezos.contract.at(entry[1]);
                    var storage:any     = await contract.storage();

                    // Check admin
                    if(storage.hasOwnProperty('admin')){
                        assert.equal(storage.admin, contractDeployments.breakGlass.address)
                    }

                    // Check pause
                    var breakGlassConfig    = storage.breakGlassConfig
                    if(storage.hasOwnProperty('breakGlassConfig')){
                        for (let [key, value] of Object.entries(breakGlassConfig)){
                            assert.equal(value, true);
                        }
                    }
                }
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    });

    describe("%dropEmergencyControl#2", async () => {

        beforeEach("Set signer to user", async () => {
            await helperFunctions.signerFactory(tezos, alice.sk)
        });

        it('User should not be able to call this entrypoint if the proposal was executed', async () => {
            try{
                // Initial values
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                doormanStorage              = await doormanInstance.storage();

                // Operation
                await chai.expect(emergencyGovernanceInstance.methods.dropEmergencyGovernance().send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    })
});
