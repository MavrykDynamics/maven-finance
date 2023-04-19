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

    let user 
    let userSk 

    let admin 
    let adminSk

    let doormanAddress
    let mavrykFa2TokenAddress

    let tokenId = 0

    let doormanInstance
    let delegationInstance
    let mvkTokenInstance
    let councilInstance
    let governanceInstance
    let emergencyGovernanceInstance
    let breakGlassInstance
    let vestingInstance
    let treasuryInstance
    let mavrykFa2TokenInstance

    let doormanStorage
    let delegationStorage
    let mvkTokenStorage
    let councilStorage
    let governanceStorage
    let emergencyGovernanceStorage
    let breakGlassStorage
    let vestingStorage
    let treasuryStorage
    let mavrykFa2TokenStorage

    // operations
    let updateOperatorsOperation
    let transferOperation

    // housekeeping operations
    let setAdminOperation
    let setGovernanceOperation
    let resetAdminOperation
    let updateWhitelistContractsOperation
    let updateGeneralContractsOperation
    let mistakenTransferOperation

    // contract map value
    let storageMap
    let contractMapKey
    let initialContractMapValue
    let updatedContractMapValue
    

    before("setup", async () => {

        utils = new Utils();
        await utils.init(bob.sk);
        tezos = utils.tezos;

        admin   = bob.pkh
        adminSk = bob.sk 

        doormanAddress                  = contractDeployments.doorman.address;
        mavrykFa2TokenAddress           = contractDeployments.mavrykFa2Token.address;

        doormanInstance                 = await utils.tezos.contract.at(doormanAddress);
        delegationInstance              = await utils.tezos.contract.at(contractDeployments.delegation.address);
        mvkTokenInstance                = await utils.tezos.contract.at(contractDeployments.mvkToken.address);
        councilInstance                 = await utils.tezos.contract.at(contractDeployments.council.address);
        governanceInstance              = await utils.tezos.contract.at(contractDeployments.governance.address);
        emergencyGovernanceInstance     = await utils.tezos.contract.at(contractDeployments.emergencyGovernance.address);
        breakGlassInstance              = await utils.tezos.contract.at(contractDeployments.breakGlass.address);
        vestingInstance                 = await utils.tezos.contract.at(contractDeployments.vesting.address);
        treasuryInstance                = await utils.tezos.contract.at(contractDeployments.treasury.address);
        mavrykFa2TokenInstance          = await utils.tezos.contract.at(mavrykFa2TokenAddress);
            
        doormanStorage                  = await doormanInstance.storage();
        delegationStorage               = await delegationInstance.storage();
        mvkTokenStorage                 = await mvkTokenInstance.storage();
        councilStorage                  = await councilInstance.storage();
        governanceStorage               = await governanceInstance.storage();
        emergencyGovernanceStorage      = await emergencyGovernanceInstance.storage();
        breakGlassStorage               = await breakGlassInstance.storage();
        vestingStorage                  = await vestingInstance.storage();
        treasuryStorage                 = await treasuryInstance.storage();
        mavrykFa2TokenStorage           = await mavrykFa2TokenInstance.storage();

        console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')


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



    describe("Housekeeping Entrypoints", async () => {

        beforeEach("Set signer to admin (bob)", async () => {
            doormanStorage        = await doormanInstance.storage();
            await helperFunctions.signerFactory(tezos, adminSk);
        });

        it('%setAdmin                 - admin (bob) should be able to update the contract admin address', async () => {
            try{
                
                // Initial Values
                doormanStorage     = await doormanInstance.storage();
                const currentAdmin = doormanStorage.admin;
                assert.strictEqual(currentAdmin, admin);

                // Operation
                setAdminOperation = await doormanInstance.methods.setAdmin(alice.pkh).send();
                await setAdminOperation.confirmation();

                // Final values
                doormanStorage   = await doormanInstance.storage();
                const newAdmin = doormanStorage.admin;

                // Assertions
                assert.notStrictEqual(newAdmin, currentAdmin);
                assert.strictEqual(newAdmin, alice.pkh);
                
                // reset admin
                await helperFunctions.signerFactory(tezos, alice.sk);
                resetAdminOperation = await doormanInstance.methods.setAdmin(admin).send();
                await resetAdminOperation.confirmation();

            } catch(e){
                console.log(e);
            }
        });

        it('%setGovernance            - admin (bob) should be able to update the contract governance address', async () => {
            try{
                
                // Initial Values
                doormanStorage       = await doormanInstance.storage();
                const currentGovernance = doormanStorage.governanceAddress;

                // Operation
                setGovernanceOperation = await doormanInstance.methods.setGovernance(alice.pkh).send();
                await setGovernanceOperation.confirmation();

                // Final values
                doormanStorage   = await doormanInstance.storage();
                const updatedGovernance = doormanStorage.governanceAddress;

                // reset governance
                setGovernanceOperation = await doormanInstance.methods.setGovernance(contractDeployments.governance.address).send();
                await setGovernanceOperation.confirmation();

                // Assertions
                assert.notStrictEqual(updatedGovernance, currentGovernance);
                assert.strictEqual(updatedGovernance, alice.pkh);
                assert.strictEqual(currentGovernance, contractDeployments.governance.address);

            } catch(e){
                console.log(e);
            }
        });

        it('%updateMetadata           - admin (bob) should be able to update the contract metadata', async () => {
            try{
                // Initial values
                const key   = ''
                const hash  = Buffer.from('tezos-storage:data', 'ascii').toString('hex')

                // Operation
                const updateOperation = await doormanInstance.methods.updateMetadata(key, hash).send();
                await updateOperation.confirmation();

                // Final values
                doormanStorage          = await doormanInstance.storage();            

                const updatedData       = await doormanStorage.metadata.get(key);
                assert.equal(hash, updatedData);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('%updateConfig                   - admin (bob) should be able to update contract config', async () => {
            try{
                
                // Initial Values
                councilStorage            = await councilInstance.storage();
                const initialConfig       = councilStorage.config;

                const testValue           = 1;

                // update config operations
                var updateConfigOperation = await councilInstance.methods.updateConfig(testValue, "configVoteExpiryDays").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await councilInstance.methods.updateConfig(testValue, "configRequiredFeeMutez").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await councilInstance.methods.updateConfig(testValue, "configStakedMvkPercentRequired").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await councilInstance.methods.updateConfig(testValue, "configMinStakedMvkForVoting").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await councilInstance.methods.updateConfig(testValue, "configMinStakedMvkForTrigger").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await councilInstance.methods.updateConfig(testValue, "configProposalTitleMaxLength").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await councilInstance.methods.updateConfig(testValue, "configProposalDescMaxLength").send();
                await updateConfigOperation.confirmation();

                // update storage
                councilStorage           = await councilInstance.storage();
                const updatedConfig      = councilStorage.config;

                // Assertions
                assert.equal(updatedConfig.voteExpiryDays                   , testValue);
                assert.equal(updatedConfig.requiredFeeMutez                 , testValue);
                assert.equal(updatedConfig.stakedMvkPercentageRequired      , testValue);
                assert.equal(updatedConfig.minStakedMvkRequiredToVote       , testValue);
                assert.equal(updatedConfig.minStakedMvkRequiredToTrigger    , testValue);
                assert.equal(updatedConfig.proposalTitleMaxLength           , testValue);
                assert.equal(updatedConfig.proposalDescMaxLength            , testValue);

                // reset config operation
                var resetConfigOperation = await councilInstance.methods.updateConfig(initialConfig.voteExpiryDays, "configVoteExpiryDays").send();
                await resetConfigOperation.confirmation();

                resetConfigOperation = await councilInstance.methods.updateConfig(initialConfig.requiredFeeMutez, "configRequiredFeeMutez").send();
                await resetConfigOperation.confirmation();
                
                resetConfigOperation = await councilInstance.methods.updateConfig(initialConfig.stakedMvkPercentageRequired, "configStakedMvkPercentRequired").send();
                await resetConfigOperation.confirmation();

                resetConfigOperation = await councilInstance.methods.updateConfig(initialConfig.minStakedMvkRequiredToVote, "configMinStakedMvkForVoting").send();
                await resetConfigOperation.confirmation();

                resetConfigOperation = await councilInstance.methods.updateConfig(initialConfig.minStakedMvkRequiredToTrigger, "configMinStakedMvkForTrigger").send();
                await resetConfigOperation.confirmation();

                resetConfigOperation = await councilInstance.methods.updateConfig(initialConfig.proposalTitleMaxLength, "configProposalTitleMaxLength").send();
                await resetConfigOperation.confirmation();

                resetConfigOperation = await councilInstance.methods.updateConfig(initialConfig.proposalDescMaxLength, "configProposalDescMaxLength").send();
                await resetConfigOperation.confirmation();

                // update storage
                councilStorage           = await councilInstance.storage();
                const resetConfig        = councilStorage.config;

                assert.equal(resetConfig.voteExpiryDays.toNumber(),                 initialConfig.voteExpiryDays.toNumber());
                assert.equal(resetConfig.requiredFeeMutez.toNumber(),               initialConfig.requiredFeeMutez.toNumber());
                assert.equal(resetConfig.stakedMvkPercentageRequired.toNumber(),    initialConfig.stakedMvkPercentageRequired.toNumber());
                assert.equal(resetConfig.minStakedMvkRequiredToVote.toNumber(),     initialConfig.minStakedMvkRequiredToVote.toNumber());
                assert.equal(resetConfig.minStakedMvkRequiredToTrigger.toNumber(),  initialConfig.minStakedMvkRequiredToTrigger.toNumber());
                assert.equal(resetConfig.proposalTitleMaxLength.toNumber(),         initialConfig.proposalTitleMaxLength.toNumber());
                assert.equal(resetConfig.proposalDescMaxLength.toNumber(),          initialConfig.proposalDescMaxLength.toNumber());

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%updateWhitelistContracts - admin (bob) should be able to add user (eve) to the Whitelisted Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "whitelistContracts";

                initialContractMapValue           = await helperFunctions.getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await helperFunctions.updateWhitelistContracts(doormanInstance, contractMapKey, eve.pkh, 'update');
                await updateWhitelistContractsOperation.confirmation()

                doormanStorage = await doormanInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'Eve (key) should not be in the Whitelist Contracts map before adding her to it')
                assert.strictEqual(updatedContractMapValue, eve.pkh,  'Eve (key) should be in the Whitelist Contracts map after adding her to it')

            } catch (e) {
                console.log(e)
            }
        })

        it('%updateWhitelistContracts - admin (bob) should be able to remove user (eve) from the Whitelisted Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "whitelistContracts";

                initialContractMapValue = await helperFunctions.getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await helperFunctions.updateWhitelistContracts(doormanInstance, contractMapKey, eve.pkh, 'remove');
                await updateWhitelistContractsOperation.confirmation()

                doormanStorage = await doormanInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, eve.pkh, 'Eve (key) should be in the Whitelist Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, undefined, 'Eve (key) should not be in the Whitelist Contracts map after adding her to it');

            } catch (e) {
                console.log(e)
            }
        })

        it('%updateGeneralContracts   - admin (bob) should be able to add user (eve) to the General Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "generalContracts";

                initialContractMapValue = await helperFunctions.getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await helperFunctions.updateGeneralContracts(doormanInstance, contractMapKey, eve.pkh, 'update');
                await updateGeneralContractsOperation.confirmation()

                doormanStorage = await doormanInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'eve (key) should not be in the General Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, eve.pkh, 'eve (key) should be in the General Contracts map after adding her to it');

            } catch (e) {
                console.log(e)
            }
        })

        it('%updateGeneralContracts   - admin (bob) should be able to remove user (eve) from the General Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "generalContracts";

                initialContractMapValue = await helperFunctions.getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await helperFunctions.updateGeneralContracts(doormanInstance, contractMapKey, eve.pkh, 'remove');
                await updateGeneralContractsOperation.confirmation()

                doormanStorage = await doormanInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, eve.pkh, 'eve (key) should be in the General Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, undefined, 'eve (key) should not be in the General Contracts map after adding her to it');

            } catch (e) {
                console.log(e)
            }
        })

        it('%mistakenTransfer         - admin (bob) should be able to call this entrypoint for mock FA2 tokens', async () => {
            try {

                // Initial values
                const tokenAmount = 10;
                user              = mallory.pkh;
                userSk            = mallory.sk;

                // Mistaken Operation - user (mallory) send 10 MavrykFa2Tokens to MVK Token Contract
                await helperFunctions.signerFactory(tezos, userSk);
                transferOperation = await helperFunctions.fa2Transfer(mavrykFa2TokenInstance, user, doormanAddress, tokenId, tokenAmount);
                await transferOperation.confirmation();
                
                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage();
                const initialUserBalance    = (await mavrykFa2TokenStorage.ledger.get(user)).toNumber()

                await helperFunctions.signerFactory(tezos, adminSk);
                mistakenTransferOperation = await helperFunctions.mistakenTransferFa2Token(doormanInstance, user, mavrykFa2TokenAddress, tokenId, tokenAmount).send();
                await mistakenTransferOperation.confirmation();

                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage();
                const updatedUserBalance    = (await mavrykFa2TokenStorage.ledger.get(user)).toNumber();

                // increase in updated balance
                assert.equal(updatedUserBalance, initialUserBalance + tokenAmount);

            } catch (e) {
                console.log(e)
            }
        })

    });


    describe('Access Control Checks', function () {

        beforeEach("Set signer to non-admin (mallory)", async () => {
            await helperFunctions.signerFactory(tezos, mallory.sk);
        });

        it('%setAdmin                 - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                doormanStorage      = await doormanInstance.storage();
                const currentAdmin  = doormanStorage.admin;

                // Operation
                setAdminOperation = await doormanInstance.methods.setAdmin(mallory.pkh);
                await chai.expect(setAdminOperation.send()).to.be.rejected;

                // Final values
                doormanStorage    = await doormanInstance.storage();
                const newAdmin    = doormanStorage.admin;

                // Assertions
                assert.strictEqual(newAdmin, currentAdmin);

            } catch(e){
                console.log(e);
            }
        });

        it('%setGovernance            - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                doormanStorage           = await doormanInstance.storage();
                const currentGovernance  = doormanStorage.governanceAddress;

                // Operation
                setGovernanceOperation = await doormanInstance.methods.setGovernance(mallory.pkh);
                await chai.expect(setGovernanceOperation.send()).to.be.rejected;

                // Final values
                doormanStorage           = await doormanInstance.storage();
                const updatedGovernance  = doormanStorage.governanceAddress;

                // Assertions
                assert.strictEqual(updatedGovernance, currentGovernance);

            } catch(e){
                console.log(e);
            }
        });

        it('%updateMetadata           - non-admin (mallory) should not be able to update the contract metadata', async () => {
            try{
                // Initial values
                const key   = ''
                const hash  = Buffer.from('tezos-storage:data fail', 'ascii').toString('hex')

                doormanStorage          = await doormanInstance.storage();   
                const initialMetadata   = await doormanStorage.metadata.get(key);

                // Operation
                const updateOperation = await doormanInstance.methods.updateMetadata(key, hash);
                await chai.expect(updateOperation.send()).to.be.rejected;

                // Final values
                doormanStorage          = await doormanInstance.storage();            
                const updatedData       = await doormanStorage.metadata.get(key);

                // check that there is no change in metadata
                assert.equal(updatedData, initialMetadata);
                assert.notEqual(updatedData, hash);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('%updateConfig             - non-admin (mallory) should not be able to update contract config', async () => {
            try{
                
                // Initial Values
                doormanStorage           = await doormanInstance.storage();
                const initialConfigValue = doormanStorage.config.minMvkAmount;
                const newMinMvkAmount = MVK(10);

                // Operation
                const updateConfigOperation = await doormanInstance.methods.updateConfig(newMinMvkAmount, "configMinMvkAmount");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                // Final values
                doormanStorage           = await doormanInstance.storage();
                const updatedConfigValue = doormanStorage.config.minMvkAmount;

                // check that there is no change in config values
                assert.equal(updatedConfigValue.toNumber(), initialConfigValue.toNumber());
                assert.notEqual(updatedConfigValue.toNumber(), newMinMvkAmount);
                
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%updateWhitelistContracts - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // init values
                contractMapKey  = "mallory";
                storageMap      = "whitelistContracts";

                initialContractMapValue = await helperFunctions.getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await doormanInstance.methods.updateWhitelistContracts(contractMapKey, alice.pkh)
                await chai.expect(updateWhitelistContractsOperation.send()).to.be.rejected;

                doormanStorage = await doormanInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'mallory (key) should not be in the Whitelist Contracts map');

            } catch (e) {
                console.log(e)
            }
        })

        it('%updateGeneralContracts   - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // init values
                contractMapKey  = "mallory";
                storageMap      = "generalContracts";

                initialContractMapValue = await helperFunctions.getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await doormanInstance.methods.updateGeneralContracts(contractMapKey, alice.pkh)
                await chai.expect(updateGeneralContractsOperation.send()).to.be.rejected;

                doormanStorage          = await doormanInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'mallory (key) should not be in the General Contracts map');

            } catch (e) {
                console.log(e)
            }
        })

        it('%mistakenTransfer         - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // Initial values
                user = mallory.pkh;
                const tokenAmount = 10;

                // Mistaken Operation - send 10 MavrykFa2Tokens to MVK Token Contract
                transferOperation = await helperFunctions.fa2Transfer(mavrykFa2TokenInstance, user, doormanAddress, tokenId, tokenAmount);
                await transferOperation.confirmation();

                // mistaken transfer operation
                mistakenTransferOperation = await helperFunctions.mistakenTransferFa2Token(doormanInstance, user, mavrykFa2TokenAddress, tokenId, tokenAmount);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch (e) {
                console.log(e)
            }
        })

        it("%setLambda                - non-admin (mallory) should not be able to call this entrypoint", async() => {
            try{

                // random lambda for testing
                const randomLambdaName  = "randomLambdaName";
                const randomLambdaBytes = "050200000cba0743096500000112075e09650000005a036e036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a0362036203620362036200000000036203620760036803690000000009650000000a0362036203620362036e00000000075e09650000006c09650000000a0362036203620362036200000000036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a036203620362036203620000000003620362076003680369000000000362075e07650765036203620362036c075e076507650368036e0362036e036200000000070702000001770743075e076507650368036e0362036e020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c03200342020000010e037a034c037a07430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700002034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f02000000090743036200810303270200000000072f020000000907430362009c0203270200000000070702000000600743036200808080809d8fc0d0bff2f1b26703420200000047037a034c037a0321052900080570000205290015034b031105710002031605700002033a0322072f020000001307430368010000000844495620627920300327020000000003160707020000001a037a037a03190332072c0200000002032002000000020327034f0707020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c032000808080809d8fc0d0bff2f1b2670342020000092d037a057a000505700005037a034c07430362008f03052100020529000f0529000307430359030a034c03190325072c0200000002032702000000020320053d036d05700002072e02000008a4072e020000007c057000030570000405700005057000060570000705200005072e020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000081c072e0200000044057000030570000405700005057000060570000705200005072e0200000010072e02000000020320020000000203200200000010072e020000000203200200000002032002000007cc072e0200000028057000030570000405700005057000060570000705200005072e02000000020320020000000203200200000798072e0200000774034c032003480521000305210003034c052900050316034c03190328072c020000000002000000090743036200880303270570000205210002034c0321052100030521000205290011034c0329072f020000002005290015074303620000074303620000074303620000074303620000054200050200000004034c03200743036200000521000203160319032a072c020000021c052100020521000407430362008e02057000020529000907430368010000000a64656c65676174696f6e034203420521000b034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f0200000009074303620081030327020000001a072f02000000060743035903030200000008032007430359030a074303620000034c072c020000007303200521000205210004034205210007034c0326052100030521000205290008034205700007034c03260521000205290005034c05290007034b0311052100030316033a0521000b034c0322072f02000000130743036801000000084449562062792030032702000000000316034c0316031202000000060570000603200521000305210003034205210008034c0326052100030521000205700004052900030312055000030571000205210003052100030570000405290005031205500005057100020521000305700002052100030570000403160312031205500001034c05210003034c0570000305290013034b031105500013034c02000000060570000503200521000205290015055000080521000205700002052900110570000205700003034c0346034c0350055000110571000205210003052900070743036200000790010000000c746f74616c5f737570706c790362072f020000000907430362008a01032702000000000521000405290007074303620000037703420790010000000b6765745f62616c616e63650362072f02000000090743036200890103270200000000034c052100090743036200a40105210004033a033a0322072f0200000013074303680100000008444956206279203003270200000000031605210009074303620002033a0312052100090521000a07430362008803033a033a0322072f020000001307430368010000000844495620627920300327020000000003160743036200a401034c0322072f0200000013074303680100000008444956206279203003270200000000031605210004033a05210009052100020322072f0200000013074303680100000008444956206279203003270200000000031605210005034b0311052100060570000a052100040322072f0200000013074303680100000008444956206279203003270200000000031605700007052900130312055000130571000507430362008c0305210004052100070342034205210009034c0326032005700005057000030342052100050570000305700002037a034c0570000305700002034b0311074303620000052100020319032a072c020000003b05210002034c057000030322072f02000000130743036801000000084449562062792030032702000000000316057000020529001503120550001502000000080570000205200002057100030521000405210003034c05290011034c0329072f0200000009074303620089030327020000000003210521000507430362008b03057000020316057000020342034205700007034c03260320032105700004057000020316034b031105500001052100040529000707430362000005700003034205210004037705700002037a057000040655055f0765046e000000062566726f6d5f065f096500000026046e0000000425746f5f04620000000925746f6b656e5f696404620000000725616d6f756e7400000000000000042574787300000009257472616e73666572072f0200000008074303620027032702000000000743036a0000053d0765036e055f096500000006036e0362036200000000053d096500000006036e036203620000000005700004057000050570000705420003031b057000040342031b034d0743036200000521000303160319032a072c02000000440521000405210003034205700005034c032605210003052100020570000403160312055000010571000205210005034c0570000505290013034b031105500013057100030200000006057000040320034c052100040529001505500008034c0521000405700004052900110570000305210005034c0346034c03500550001105710002052100030570000207430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700004034c03260655036e0000000e256f6e5374616b654368616e6765072f02000000090743036200b702032702000000000743036a000005700002034d053d036d034c031b034c031b02000000180570000305700004057000050570000605700007052000060200000036057000030570000405700005057000060570000705200005072e0200000010072e0200000002032002000000020320020000000203200342";

                const setLambdaOperation = doormanInstance.methods.setLambda(randomLambdaName, randomLambdaBytes); 
                await chai.expect(setLambdaOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

    })

});
