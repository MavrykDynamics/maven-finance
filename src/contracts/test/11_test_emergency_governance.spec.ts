const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
const { InMemorySigner, importKey } = require("@taquito/signer");
import assert, { ok, rejects, strictEqual } from "assert";
import { Utils, MVK } from "./helpers/Utils";
import fs from "fs";
import { confirmOperation } from "../scripts/confirmation";

const chai = require("chai");
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

import env from "../env";
import { bob, alice, eve, mallory } from "../scripts/sandbox/accounts";

import doormanAddress from '../deployments/doormanAddress.json';
import delegationAddress from '../deployments/delegationAddress.json';
import mvkTokenAddress from '../deployments/mvkTokenAddress.json';
import councilAddress from '../deployments/councilAddress.json';
import governanceAddress from '../deployments/governanceAddress.json';
import emergencyGovernanceAddress from '../deployments/emergencyGovernanceAddress.json';
import breakGlassAddress from '../deployments/breakGlassAddress.json';
import vestingAddress from '../deployments/vestingAddress.json';
import treasuryAddress from '../deployments/treasuryAddress.json';

describe("Emergency Governance tests", async () => {
    var utils: Utils;

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
    
    const signerFactory = async (pk) => {
        await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
        return utils.tezos;
    };

    before("setup", async () => {

        utils = new Utils();
        await utils.init(bob.sk);

        doormanInstance    = await utils.tezos.contract.at(doormanAddress.address);
        delegationInstance    = await utils.tezos.contract.at(delegationAddress.address);
        mvkTokenInstance   = await utils.tezos.contract.at(mvkTokenAddress.address);
        councilInstance   = await utils.tezos.contract.at(councilAddress.address);
        governanceInstance = await utils.tezos.contract.at(governanceAddress.address);
        emergencyGovernanceInstance    = await utils.tezos.contract.at(emergencyGovernanceAddress.address);
        breakGlassInstance = await utils.tezos.contract.at(breakGlassAddress.address);
        vestingInstance = await utils.tezos.contract.at(vestingAddress.address);
        treasuryInstance = await utils.tezos.contract.at(treasuryAddress.address);
            
        doormanStorage    = await doormanInstance.storage();
        delegationStorage    = await delegationInstance.storage();
        mvkTokenStorage   = await mvkTokenInstance.storage();
        councilStorage   = await councilInstance.storage();
        governanceStorage = await governanceInstance.storage();
        emergencyGovernanceStorage = await emergencyGovernanceInstance.storage();
        breakGlassStorage = await breakGlassInstance.storage();
        vestingStorage = await vestingInstance.storage();
        treasuryStorage = await treasuryInstance.storage();

        console.log('-- -- -- -- -- Emergency Governance Tests -- -- -- --')
        console.log('Doorman Contract deployed at:', doormanInstance.address);
        console.log('Delegation Contract deployed at:', delegationInstance.address);
        console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
        console.log('Council Contract deployed at:', councilInstance.address);
        console.log('Governance Contract deployed at:', governanceInstance.address);
        console.log('Emergency Governance Contract deployed at:', emergencyGovernanceInstance.address);
        console.log('Break Glass Contract deployed at:', breakGlassInstance.address);
        console.log('Vesting Contract deployed at:', vestingInstance.address);
        console.log('Treasury Contract deployed at:', treasuryInstance.address);
        console.log('Bob address: ' + bob.pkh);
        console.log('Alice address: ' + alice.pkh);
        console.log('Eve address: ' + eve.pkh);
        console.log('-- -- -- -- -- -- -- -- --')


        // init variables

        // ---------------------------------------------
        // mallory update operators - set initial staked MVK total supply of 250
        await signerFactory(mallory.sk);
        const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
            {
                add_operator: {
                    owner: mallory.pkh,
                    operator: doormanAddress.address,
                    token_id: 0,
                },
            }])
        .send()
        await updateOperatorsOperation.confirmation();

        const userStake = MVK(250);
        const malloryStakeMvkOperation = await doormanInstance.methods.stake(userStake).send();
        await malloryStakeMvkOperation.confirmation();

        const malloryStakedMvkBalance    = await doormanStorage.userStakeBalanceLedger.get(mallory.pkh);
        assert.equal(malloryStakedMvkBalance.balance, userStake);
        // ---------------------------------------------


        // ---------------------------------------------
        // set admin of every contract to governance contract
        await signerFactory(bob.sk);
        const generalContracts  = await governanceStorage.generalContracts;
        for (let entry of generalContracts){
            // Get contract storage
            var contract        = await utils.tezos.contract.at(entry[1]);
            var storage:any     = await contract.storage();

            // Check admin
            if(storage.hasOwnProperty('admin') && storage.admin!==governanceAddress.address && storage.admin!==breakGlassAddress.address){
                var setAdminOperation   = await contract.methods.setAdmin(governanceAddress.address).send();
                await setAdminOperation.confirmation()
            }
        }
    });

    describe("%setAdmin", async () => {
        beforeEach("Set signer to admin", async () => {
            await signerFactory(bob.sk)
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
                await signerFactory(alice.sk);
                const resetAdminOperation = await emergencyGovernanceInstance.methods.setAdmin(bob.pkh).send();
                await resetAdminOperation.confirmation();

                // Assertions
                assert.notStrictEqual(newAdmin, currentAdmin);
                assert.strictEqual(newAdmin, alice.pkh);
                assert.strictEqual(currentAdmin, bob.pkh);
            } catch(e){
                console.log(e);
            }
        });

        it('Non-admin should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                await signerFactory(alice.sk);
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
                console.log(e);
            }
        });
    });

    describe("%updateConfig", async () => {
        beforeEach("Set signer to admin", async () => {
            await signerFactory(bob.sk)
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
                console.log(e);
            }
        });

        it('Admin should be able to call the entrypoint and configure the required fee', async () => {
            try{
                // Initial Values
                emergencyGovernanceStorage = await emergencyGovernanceInstance.storage();
                const newConfigValue = 5;

                // Operation
                const updateConfigOperation = await emergencyGovernanceInstance.methods.updateConfig(newConfigValue,"configRequiredFee").send();
                await updateConfigOperation.confirmation();

                // Final values
                emergencyGovernanceStorage = await emergencyGovernanceInstance.storage();
                const updateConfigValue = emergencyGovernanceStorage.config.requiredFee;

                // Assertions
                assert.equal(updateConfigValue, newConfigValue);
            } catch(e){
                console.log(e);
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
                console.log(e);
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
                console.log(e);
            }
        });

        it('Admin should be able to call the entrypoint and configure the Min sMVK required to vote', async () => {
            try{
                // Initial Values
                emergencyGovernanceStorage = await emergencyGovernanceInstance.storage();
                const newConfigValue = MVK(0.1);

                // Operation
                const updateConfigOperation = await emergencyGovernanceInstance.methods.updateConfig(newConfigValue,"configMinStakedMvkForVoting").send();
                await updateConfigOperation.confirmation();

                // Final values
                emergencyGovernanceStorage = await emergencyGovernanceInstance.storage();
                const updateConfigValue = emergencyGovernanceStorage.config.minStakedMvkRequiredToVote;

                // Assertions
                assert.equal(updateConfigValue, newConfigValue);
            } catch(e){
                console.log(e);
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
                console.log(e);
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
                console.log(e);
            }
        });

        it('Admin should not be able to call the entrypoint and configure the Min sMVK required to trigger if it goes below 0.1MVK', async () => {
            try{
                // Initial Values
                emergencyGovernanceStorage = await emergencyGovernanceInstance.storage();
                const currentConfigValue = emergencyGovernanceStorage.config.minStakedMvkRequiredToTrigger;
                const newConfigValue = MVK(0.99);

                // Operation
                await chai.expect(emergencyGovernanceInstance.methods.updateConfig(newConfigValue,"configMinStakedMvkForTrigger").send()).to.be.rejected;

                // Final values
                emergencyGovernanceStorage = await emergencyGovernanceInstance.storage();
                const updateConfigValue = emergencyGovernanceStorage.config.minStakedMvkRequiredToTrigger;

                // Assertions
                assert.notEqual(newConfigValue, currentConfigValue);
                assert.equal(updateConfigValue.toNumber(), currentConfigValue.toNumber());
            } catch(e){
                console.log(e);
            }
        });

        it('Non-admin should not be able to call the entrypoint', async () => {
            try{
                // Initial Values
                emergencyGovernanceStorage = await emergencyGovernanceInstance.storage();
                const newConfigValue = MVK(0.1);

                // Operation
                await signerFactory(alice.sk);
                await chai.expect(emergencyGovernanceInstance.methods.updateConfig(newConfigValue,"configMinStakedMvkForTrigger").send()).to.be.rejected;
            } catch(e){
                console.log(e);
            }
        });
    });

    describe("%triggerEmergencyControl", async () => {

        beforeEach("Set signer to user", async () => {
            await signerFactory(alice.sk)
        });

        it('User should not be able to call this entrypoint if it did not send the required fees', async () => {
            try{
                // Initial Values
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                const stakeAmount           = MVK(10);

                // Operations
                await signerFactory(bob.sk)
                const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
                {
                    add_operator: {
                        owner: bob.pkh,
                        operator: doormanAddress.address,
                        token_id: 0,
                    },
                }])
                .send()
                await updateOperatorsOperation.confirmation();
    
                const stakeOperation    = await doormanInstance.methods.stake(stakeAmount).send();
                await stakeOperation.confirmation();
    
                const stakeRecord       = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
                assert.notEqual(stakeRecord.balance, 0);

                // Operation
                await chai.expect(emergencyGovernanceInstance.methods.triggerEmergencyControl("Test emergency control", "Test description").send()).to.be.rejected;
            } catch(e){
                console.log(e);
            }
        });

        it('User should not be able to call this entrypoint if it does not have enough SMVK to trigger', async () => {
            try{
                // Operation
                await chai.expect(emergencyGovernanceInstance.methods.triggerEmergencyControl("Test emergency control", "Test description").send({amount : 10})).to.be.rejected;
            } catch(e){
                console.log(e);
            }
        });

        it('User should not be able to call the treasury contract does not exist in the generalContracts map of the storage', async () => {
            try{
                // Update generalContracts
                await signerFactory(bob.sk);
                var updateOperation = await emergencyGovernanceInstance.methods.updateGeneralContracts("treasury", treasuryAddress.address);
                await updateOperation.confirmation()

                // Initial Values
                await signerFactory(alice.sk)
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                const stakeAmount           = MVK(10);

                // Operations
                const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
                {
                    add_operator: {
                        owner: alice.pkh,
                        operator: doormanAddress.address,
                        token_id: 0,
                    },
                }])
                .send()
                await updateOperatorsOperation.confirmation();
    
                const stakeOperation    = await doormanInstance.methods.stake(stakeAmount).send();
                await stakeOperation.confirmation();
    
                const stakeRecord       = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
                assert.notEqual(stakeRecord.balance, 0);

                // Operation
                await chai.expect(emergencyGovernanceInstance.methods.triggerEmergencyControl("Test emergency control", "Test description").send({amount: 10})).to.be.rejected;

                // Reset contract
                await signerFactory(bob.sk);
                var updateOperation = await emergencyGovernanceInstance.methods.updateGeneralContracts("treasury", treasuryAddress.address);
                await updateOperation.confirmation()
            } catch(e){
                console.log(e);
            }
        });

        it('User should not be able to call the doorman contract does not exist in the generalContracts map of the storage', async () => {
            try{
                // Update generalContracts
                await signerFactory(bob.sk);
                var updateOperation = await emergencyGovernanceInstance.methods.updateGeneralContracts("doorman", doormanAddress.address);
                await updateOperation.confirmation()

                // Initial Values
                await signerFactory(alice.sk)
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                const stakeAmount           = MVK(10);

                // Operations
                const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
                {
                    add_operator: {
                        owner: alice.pkh,
                        operator: doormanAddress.address,
                        token_id: 0,
                    },
                }])
                .send()
                await updateOperatorsOperation.confirmation();
    
                const stakeOperation    = await doormanInstance.methods.stake(stakeAmount).send();
                await stakeOperation.confirmation();
    
                const stakeRecord       = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
                assert.notEqual(stakeRecord.balance, 0);

                // Operation
                await chai.expect(emergencyGovernanceInstance.methods.triggerEmergencyControl("Test emergency control", "Test description").send({amount: 10})).to.be.rejected;

                // Reset contract
                await signerFactory(bob.sk);
                var updateOperation = await emergencyGovernanceInstance.methods.updateGeneralContracts("doorman", doormanAddress.address);
                await updateOperation.confirmation()
            } catch(e){
                console.log(e);
            }
        });

        it('User should be able to call this entrypoint and trigger an emergency control', async () => {
            try{
                // Initial Values
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                const stakeAmount           = MVK(10);

                // Operations
                const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
                {
                    add_operator: {
                        owner: alice.pkh,
                        operator: doormanAddress.address,
                        token_id: 0,
                    },
                }])
                .send()
                await updateOperatorsOperation.confirmation();
    
                const stakeOperation    = await doormanInstance.methods.stake(stakeAmount).send();
                await stakeOperation.confirmation();
    
                const stakeRecord       = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
                assert.notEqual(stakeRecord.balance, 0);

                // Operation
                const triggerOperation  = await emergencyGovernanceInstance.methods.triggerEmergencyControl("Test emergency control", "Test description").send({amount: 10});
                await triggerOperation.confirmation();

                // Final values
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                const emergencyID           = emergencyGovernanceStorage.currentEmergencyGovernanceId;
                const emergencyProposal     = await emergencyGovernanceStorage.emergencyGovernanceLedger.get(emergencyID);

                assert.notEqual(emergencyID, 0);
                assert.notEqual(emergencyProposal, undefined);
                assert.strictEqual(emergencyProposal.proposerAddress, alice.pkh);
                assert.strictEqual(emergencyProposal.stakedMvkPercentageRequired, emergencyGovernanceStorage.config.stakedMvkPercentageRequired);
                assert.strictEqual(emergencyProposal.stakedMvkPercentageRequired, emergencyGovernanceStorage.config.stakedMvkPercentageRequired);

                console.log("SMVK required for breakGlass: ", emergencyProposal.stakedMvkRequiredForBreakGlass);
            } catch(e){
                console.log(e);
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
                await chai.expect(emergencyGovernanceInstance.methods.triggerEmergencyControl("Test emergency control", "Test description").send({amount: 10})).to.be.rejected;
            } catch(e){
                console.log(e);
            }
        });
    })


    describe("%voteFromEmergencyControl", async () => {

        beforeEach("Set signer to user", async () => {
            await signerFactory(alice.sk)
        });

        it('User should not be able to call this entrypoint if it did not send the required fees', async () => {
            try{
                // Initial Values
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                const stakeAmount           = MVK(10);

                // Operations
                await signerFactory(bob.sk)
                const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
                {
                    add_operator: {
                        owner: bob.pkh,
                        operator: doormanAddress.address,
                        token_id: 0,
                    },
                }])
                .send()
                await updateOperatorsOperation.confirmation();
    
                const stakeOperation    = await doormanInstance.methods.stake(stakeAmount).send();
                await stakeOperation.confirmation();
    
                const stakeRecord       = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
                assert.notEqual(stakeRecord.balance, 0);

                // Operation
                await chai.expect(emergencyGovernanceInstance.methods.triggerEmergencyControl("Test emergency control", "Test description").send()).to.be.rejected;
            } catch(e){
                console.log(e);
            }
        });
    })

    // it('bob cannot trigger emergency control (no staked MVK, no tez sent)', async () => {
    //     try{        

    //         await signerFactory(bob.sk);
    //         const emergencyGovernanceTitle       = "New Emergency By Bob";
    //         const emergencyGovernanceDescription = "Critical flaw detected in contract.";

    //         const failTriggerEmergencyEmergencyControlOperation = await emergencyGovernanceInstance.methods.triggerEmergencyControl(
    //             emergencyGovernanceTitle, 
    //             emergencyGovernanceDescription
    //         );
    //         await chai.expect(failTriggerEmergencyEmergencyControlOperation.send()).to.be.eventually.rejected;
            
    //     } catch (e){
    //         console.log(e)
    //     }
    // });

    // it('bob cannot trigger emergency control (not enough staked MVK, enough tez sent)', async () => {
    //     try{        

    //         const emergencyGovernanceTitle       = "New Emergency By Bob";
    //         const emergencyGovernanceDescription = "Critical flaw detected in contract.";
    //         const minStakedMvkRequiredToTrigger  = MVK(10);

    //         // bob update operators
    //         const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
    //         {
    //             add_operator: {
    //                 owner: bob.pkh,
    //                 operator: doormanAddress.address,
    //                 token_id: 0,
    //             },
    //         }])
    //         .send()
    //         await updateOperatorsOperation.confirmation();

    //         // bob stakes 5 MVK
    //         const userStake = MVK(5);
    //         const bobStakeMvkOperation = await doormanInstance.methods.stake(userStake).send();
    //         await bobStakeMvkOperation.confirmation();

    //         const bobStakedMvkBalance    = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
    //         assert.equal(bobStakedMvkBalance.balance, userStake);
    
    //         const failTriggerEmergencyEmergencyControlOperation = await emergencyGovernanceInstance.methods.triggerEmergencyControl(
    //             emergencyGovernanceTitle, 
    //             emergencyGovernanceDescription
    //         );
    //         await chai.expect(failTriggerEmergencyEmergencyControlOperation.send({ amount : 10 })).to.be.eventually.rejected;
            
    //     } catch (e){
    //         console.log(e)
    //     }
    // });

    // it('bob cannot trigger emergency control (not enough staked MVK, too much tez sent)', async () => {
    //     try{        

    //         const emergencyGovernanceTitle       = "New Emergency By Bob";
    //         const emergencyGovernanceDescription = "Critical flaw detected in contract.";
    //         const minStakedMvkRequiredToTrigger  = MVK(10);

    //         // bob update operators
    //         const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
    //         {
    //             add_operator: {
    //                 owner: bob.pkh,
    //                 operator: doormanAddress.address,
    //                 token_id: 0,
    //             },
    //         }])
    //         .send()
    //         await updateOperatorsOperation.confirmation();

    //         const userStake = MVK(5);
    //         const bobStakedMvkBalance    = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
    //         assert.equal(bobStakedMvkBalance.balance, userStake);
    
    //         const failTriggerEmergencyEmergencyControlOperation = await emergencyGovernanceInstance.methods.triggerEmergencyControl(
    //             emergencyGovernanceTitle, 
    //             emergencyGovernanceDescription
    //         );
    //         await chai.expect(failTriggerEmergencyEmergencyControlOperation.send({ amount : 15 })).to.be.eventually.rejected;
            
    //     } catch (e){
    //         console.log(e)
    //     }
    // });

    // it('bob cannot trigger emergency control (not enough staked MVK, no tez sent)', async () => {
    //     try{        

    //         const emergencyGovernanceTitle       = "New Emergency By Bob";
    //         const emergencyGovernanceDescription = "Critical flaw detected in contract.";
    //         const minStakedMvkRequiredToTrigger  = MVK(10);

    //         // bob stakes 5 MVK
    //         const userStake = MVK(5);
    //         const bobStakedMvkBalance    = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
            
    //         assert.equal(bobStakedMvkBalance.balance, userStake);
    
    //         const failTriggerEmergencyEmergencyControlOperation = await emergencyGovernanceInstance.methods.triggerEmergencyControl(
    //             emergencyGovernanceTitle, 
    //             emergencyGovernanceDescription
    //         );
    //         await chai.expect(failTriggerEmergencyEmergencyControlOperation.send()).to.be.eventually.rejected;
            
    //     } catch (e){
    //         console.log(e)
    //     }
    // });


    // it('bob cannot trigger emergency control (enough staked MVK, no tez sent)', async () => {
    //     try{        

    //         const emergencyGovernanceTitle       = "New Emergency By Bob";
    //         const emergencyGovernanceDescription = "Critical flaw detected in contract.";
    //         const minStakedMvkRequiredToTrigger  = MVK(10);

    //         // bob update operators
    //         const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
    //         {
    //             add_operator: {
    //                 owner: bob.pkh,
    //                 operator: doormanAddress.address,
    //                 token_id: 0,
    //             },
    //         }])
    //         .send()
    //         await updateOperatorsOperation.confirmation();

    //         // bob stakes 5 MVK
    //         const userStake = MVK(5);
    //         const bobStakeMvkOperation = await doormanInstance.methods.stake(userStake).send();
    //         await bobStakeMvkOperation.confirmation();

    //         const bobStakedMvkBalance    = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
    //         assert.equal(bobStakedMvkBalance.balance, MVK(10));
    
    //         const failTriggerEmergencyEmergencyControlOperation = await emergencyGovernanceInstance.methods.triggerEmergencyControl(
    //             emergencyGovernanceTitle, 
    //             emergencyGovernanceDescription
    //         );
    //         await chai.expect(failTriggerEmergencyEmergencyControlOperation.send()).to.be.eventually.rejected;
            
    //     } catch (e){
    //         console.log(e)
    //     }
    // });

    // it('bob cannot trigger emergency control (enough staked MVK, not enough tez sent)', async () => {
    //     try{        

    //         const emergencyGovernanceTitle       = "New Emergency By Bob";
    //         const emergencyGovernanceDescription = "Critical flaw detected in contract.";
    //         const minStakedMvkRequiredToTrigger  = MVK(10);

    //         // bob update operators
    //         const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
    //         {
    //             add_operator: {
    //                 owner: bob.pkh,
    //                 operator: doormanAddress.address,
    //                 token_id: 0,
    //             },
    //         }])
    //         .send()
    //         await updateOperatorsOperation.confirmation();

    //         const bobStakedMvkBalance    = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
    //         assert.equal(bobStakedMvkBalance.balance, MVK(10));
    
    //         const failTriggerEmergencyEmergencyControlOperation = await emergencyGovernanceInstance.methods.triggerEmergencyControl(
    //             emergencyGovernanceTitle, 
    //             emergencyGovernanceDescription
    //         );
    //         await chai.expect(failTriggerEmergencyEmergencyControlOperation.send({ amount : 6})).to.be.eventually.rejected;
            
    //     } catch (e){
    //         console.log(e)
    //     }
    // });

    // it('bob cannot trigger emergency control (enough staked MVK, too much tez sent)', async () => {
    //     try{        

    //         const emergencyGovernanceTitle       = "New Emergency By Bob";
    //         const emergencyGovernanceDescription = "Critical flaw detected in contract.";
    //         const minStakedMvkRequiredToTrigger  = MVK(10);

    //         // bob update operators
    //         const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
    //         {
    //             add_operator: {
    //                 owner: bob.pkh,
    //                 operator: doormanAddress.address,
    //                 token_id: 0,
    //             },
    //         }])
    //         .send()
    //         await updateOperatorsOperation.confirmation();

    //         const bobStakedMvkBalance    = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
    //         assert.equal(bobStakedMvkBalance.balance, MVK(10));
    
    //         const failTriggerEmergencyEmergencyControlOperation = await emergencyGovernanceInstance.methods.triggerEmergencyControl(
    //             emergencyGovernanceTitle, 
    //             emergencyGovernanceDescription
    //         );
    //         await chai.expect(failTriggerEmergencyEmergencyControlOperation.send({ amount : 11})).to.be.eventually.rejected;
            
    //     } catch (e){
    //         console.log(e)
    //     }
    // });


    // it('bob can trigger emergency control (enough staked MVK, enough tez sent)', async () => {
    //     try{        

    //         const emergencyGovernanceTitle       = "New Emergency By Bob";
    //         const emergencyGovernanceDescription = "Critical flaw detected in contract.";

    //         // bob triggers emergency Governance
    //         const triggerEmergencyControlOperation = await emergencyGovernanceInstance.methods.triggerEmergencyControl(
    //             emergencyGovernanceTitle, 
    //             emergencyGovernanceDescription
    //         ).send({amount : 10});
    //         await triggerEmergencyControlOperation.confirmation();
            
    //         const updatedEmergencyGovernanceStorage   = await emergencyGovernanceInstance.storage();
    //         const emergencyGovernanceProposal         = await updatedEmergencyGovernanceStorage.emergencyGovernanceLedger.get('1');

    //         const bobStakedMvkBalance    = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
    //         assert.equal(bobStakedMvkBalance.balance, MVK(10));

    //         assert.equal(emergencyGovernanceProposal.title,           emergencyGovernanceTitle);
    //         assert.equal(emergencyGovernanceProposal.description,     emergencyGovernanceDescription);
    //         assert.equal(emergencyGovernanceProposal.status,          false);
    //         assert.equal(emergencyGovernanceProposal.dropped,         false);
    //         assert.equal(emergencyGovernanceProposal.executed,        false);
    //         assert.equal(emergencyGovernanceProposal.totalStakedMvkVotes,        0);
            
    //     } catch (e){
    //         console.log(e)
    //     }
    // });

    // it('alice cannot trigger another emergency governance at the same time (no staked MVK, no tez sent)', async () => {
    //     try{        

    //         await signerFactory(alice.sk);
    //         const failTriggerEmergencyControlOperation = await emergencyGovernanceInstance.methods.triggerEmergencyControl("New Emergency Again", "Help please.");
    //         await chai.expect(failTriggerEmergencyControlOperation.send()).to.be.eventually.rejected;
            
    //     } catch (e){
    //         console.log(e)
    //     }
    // });

    // it('alice cannot trigger another emergency governance at the same time (enough staked MVK, enough tez sent)', async () => {
    //     try{        

    //         await signerFactory(alice.sk);

    //         // alice stakes 10 MVK
    //         const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
    //             {
    //                 add_operator: {
    //                     owner: alice.pkh,
    //                     operator: doormanAddress.address,
    //                     token_id: 0,
    //                 },
    //             }])
    //             .send()
    //         await updateOperatorsOperation.confirmation();
            
    //         const userStake = MVK(10);
    //         const aliceStakeMvkOperation = await doormanInstance.methods.stake(userStake).send();
    //         await aliceStakeMvkOperation.confirmation();

    //         const aliceStakedMvkBalance    = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
    //         assert.equal(aliceStakedMvkBalance.balance, MVK(10));

    //         const failTriggerEmergencyControlOperation = await emergencyGovernanceInstance.methods.triggerEmergencyControl("New Emergency Again", "Help please.");
    //         await chai.expect(failTriggerEmergencyControlOperation.send({ amount : 10})).to.be.eventually.rejected;
            
    //     } catch (e){
    //         console.log(e)
    //     }
    // });

    // it('eve cannot vote for emergency control (no staked MVK)', async () => {
    //     try{        

    //         await signerFactory(eve.sk);
    //         const failVoteForEmergencyEmergencyControlOperation = await emergencyGovernanceInstance.methods.voteForEmergencyControl(1);
    //         await chai.expect(failVoteForEmergencyEmergencyControlOperation.send()).to.be.eventually.rejected;
            
    //     } catch (e){
    //         console.log(e)
    //     }
    // });

    // it('eve cannot vote for emergency control (not enough staked MVK)', async () => {
    //     try{        

    //         await signerFactory(eve.sk);

    //         // eve stakes 4 MVK
    //         const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
    //             {
    //                 add_operator: {
    //                     owner: eve.pkh,
    //                     operator: doormanAddress.address,
    //                     token_id: 0,
    //                 },
    //             }])
    //             .send()
    //         await updateOperatorsOperation.confirmation();
            
    //         const userStake = MVK(4);
    //         const eveStakeMvkOperation = await doormanInstance.methods.stake(userStake).send();
    //         await eveStakeMvkOperation.confirmation();

    //         const eveStakedMvkBalance    = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);
    //         assert.equal(eveStakedMvkBalance.balance, userStake);

    //         const failVoteForEmergencyEmergencyControlOperation = await emergencyGovernanceInstance.methods.voteForEmergencyControl(1);
    //         await chai.expect(failVoteForEmergencyEmergencyControlOperation.send()).to.be.eventually.rejected;
            
    //     } catch (e){
    //         console.log(e)
    //     }
    // });

    // it('eve can vote for emergency control (enough staked MVK)', async () => {
    //     try{        

    //         await signerFactory(eve.sk);

    //         // eve update operators
    //         const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
    //         {
    //             add_operator: {
    //                 owner: eve.pkh,
    //                 operator: doormanAddress.address,
    //                 token_id: 0,
    //             },
    //         }])
    //         .send()
    //         await updateOperatorsOperation.confirmation();

    //         // eve stakes another 6 MVK
    //         const userStake = MVK(6);
    //         const eveStakeMvkOperation = await doormanInstance.methods.stake(userStake).send();
    //         await eveStakeMvkOperation.confirmation();

    //         const eveStakedMvkBalance    = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);
    //         assert.equal(eveStakedMvkBalance.balance, MVK(10));

    //         const voteForEmergencyControlOperation = await emergencyGovernanceInstance.methods.voteForEmergencyControl(1).send();
    //         await voteForEmergencyControlOperation.confirmation();

    //         const updatedEmergencyGovernanceStorage   = await emergencyGovernanceInstance.storage();
    //         const emergencyGovernanceProposal         = await updatedEmergencyGovernanceStorage.emergencyGovernanceLedger.get(1);

    //         assert.equal(emergencyGovernanceProposal.status,          false);
    //         assert.equal(emergencyGovernanceProposal.dropped,         false);
    //         assert.equal(emergencyGovernanceProposal.executed,        false);
    //         assert.equal(emergencyGovernanceProposal.totalStakedMvkVotes, MVK(10));
            
    //     } catch (e){
    //         console.log(e)
    //     }
    // });

    // it('eve cannot vote for emergency control again', async () => {
    //     try{        

    //         await signerFactory(eve.sk);
    //         const failVoteAgainOperation = await emergencyGovernanceInstance.methods.voteForEmergencyControl(1);
    //         await chai.expect(failVoteAgainOperation.send()).to.be.eventually.rejected;
            
    //     } catch (e){
    //         console.log(e)
    //     }
    // });

    // it('eve cannot drop emergency control (not creator)', async () => {
    //     try{        

    //         await signerFactory(eve.sk);
    //         const failDropEmergencyControlOperation = await emergencyGovernanceInstance.methods.dropEmergencyGovernance();
    //         await chai.expect(failDropEmergencyControlOperation.send()).to.be.eventually.rejected;
            
    //     } catch (e){
    //         console.log(e)
    //     }
    // });

    // it('bob can drop emergency control (creator)', async () => {
    //     try{        
            
    //         await signerFactory(bob.sk);
    //         const dropEmergencyControlOperation = await emergencyGovernanceInstance.methods.dropEmergencyGovernance().send();
    //         await dropEmergencyControlOperation.confirmation();

    //         const updatedEmergencyGovernanceStorage   = await emergencyGovernanceInstance.storage();
    //         const emergencyGovernanceProposal         = await updatedEmergencyGovernanceStorage.emergencyGovernanceLedger.get('1');

    //         assert.equal(emergencyGovernanceProposal.status,          false);
    //         assert.equal(emergencyGovernanceProposal.dropped,         true);
    //         assert.equal(emergencyGovernanceProposal.executed,        false);
            
    //     } catch (e){
    //         console.log(e)
    //     }
    // });

    // it('bob cannot drop emergency control again', async () => {
    //     try{        

    //         await signerFactory(bob.sk);
    //         const failDropEmergencyControlOperation = await emergencyGovernanceInstance.methods.dropEmergencyGovernance();
    //         await chai.expect(failDropEmergencyControlOperation.send()).to.be.eventually.rejected;
            
    //     } catch (e){
    //         console.log(e)
    //     }
    // });

    // it('alice can trigger emergency control after previous one is dropped', async () => {
    //     try{        

    //         await signerFactory(alice.sk);

    //         const emergencyGovernanceTitle       = "New Emergency By Alice";
    //         const emergencyGovernanceDescription = "Critical flaw detected in contract.";

    //         // bob triggers emergency Governance
    //         const triggerEmergencyControlOperation = await emergencyGovernanceInstance.methods.triggerEmergencyControl(
    //             emergencyGovernanceTitle, 
    //             emergencyGovernanceDescription
    //         ).send({amount : 10});
    //         await triggerEmergencyControlOperation.confirmation();
            
    //         const updatedEmergencyGovernanceStorage   = await emergencyGovernanceInstance.storage();
    //         const emergencyGovernanceProposal         = await updatedEmergencyGovernanceStorage.emergencyGovernanceLedger.get('2');

    //         assert.equal(emergencyGovernanceProposal.title,           emergencyGovernanceTitle);
    //         assert.equal(emergencyGovernanceProposal.description,     emergencyGovernanceDescription);
    //         assert.equal(emergencyGovernanceProposal.status,          false);
    //         assert.equal(emergencyGovernanceProposal.dropped,         false);
    //         assert.equal(emergencyGovernanceProposal.executed,        false);
    //         assert.equal(emergencyGovernanceProposal.totalStakedMvkVotes,        0);

    //     } catch (e){
    //         console.log(e)
    //     }
    // });

    // it('bob stakes more MVK, votes for emergency control, and triggers break glass', async () => {
    //     try{        

    //         const emergencyGovernanceProposalId = 2;

    //         await signerFactory(bob.sk);
    //         const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
    //             {
    //                 add_operator: {
    //                     owner: bob.pkh,
    //                     operator: doormanAddress.address,
    //                     token_id: 0,
    //                 },
    //             }])
    //             .send()
    //         await updateOperatorsOperation.confirmation();

    //         // bob stakes another 20 MVK
    //         const userStake = MVK(20);
    //         const bobStakeMvkOperation = await doormanInstance.methods.stake(userStake).send();
    //         await bobStakeMvkOperation.confirmation();

    //         const bobStakedMvkBalance    = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
    //         const bobTotalStakedMvkBalance = MVK(30); // 10 from earlier test, 20 from here
    //         assert.equal(bobStakedMvkBalance.balance, bobTotalStakedMvkBalance);

    //         // bob votes for emergency control
    //         const voteForEmergencyControlOperation = await emergencyGovernanceInstance.methods.voteForEmergencyControl(emergencyGovernanceProposalId).send();
    //         await voteForEmergencyControlOperation.confirmation();

    //         // check that glass has been broken
    //         const updatedEmergencyGovernanceStorage   = await emergencyGovernanceInstance.storage();
    //         const emergencyGovernanceProposal         = await updatedEmergencyGovernanceStorage.emergencyGovernanceLedger.get(emergencyGovernanceProposalId);

    //         assert.equal(emergencyGovernanceProposal.status,          true);
    //         assert.equal(emergencyGovernanceProposal.executed,        true);
    //         assert.equal(emergencyGovernanceProposal.dropped,         false);
    //         assert.equal(emergencyGovernanceProposal.totalStakedMvkVotes, MVK(30));
    //         assert.equal(emergencyGovernanceProposal.stakedMvkRequiredForBreakGlass, MVK(28));

    //         const updatedDoormanStorage      = await doormanInstance.storage();
    //         const updatedDelegationStorage   = await delegationInstance.storage();
    //         const updatedCouncilStorage      = await councilInstance.storage();
    //         const updatedVestingStorage      = await vestingInstance.storage();
    //         const updatedTreasuryStorage     = await treasuryInstance.storage();
    //         const updatedBreakGlassStorage   = await breakGlassInstance.storage();

    //         // doorman break glass, and break glass configs
    //         assert.equal(updatedDoormanStorage.admin, breakGlassAddress.address);
    //         assert.equal(updatedDoormanStorage.breakGlassConfig.compoundIsPaused, true);
    //         assert.equal(updatedDoormanStorage.breakGlassConfig.stakeIsPaused, true);
    //         assert.equal(updatedDoormanStorage.breakGlassConfig.unstakeIsPaused, true);

    //         // delegation break glass, and break glass configs
    //         assert.equal(updatedDelegationStorage.admin, breakGlassAddress.address);
    //         assert.equal(updatedDelegationStorage.breakGlassConfig.delegateToSatelliteIsPaused, true);
    //         assert.equal(updatedDelegationStorage.breakGlassConfig.registerAsSatelliteIsPaused, true);
    //         assert.equal(updatedDelegationStorage.breakGlassConfig.undelegateFromSatelliteIsPaused, true);
    //         assert.equal(updatedDelegationStorage.breakGlassConfig.unregisterAsSatelliteIsPaused, true);
    //         assert.equal(updatedDelegationStorage.breakGlassConfig.updateSatelliteRecordIsPaused, true);

    //         // council, vesting, treasury, break glass 
    //         assert.equal(updatedCouncilStorage.admin, breakGlassAddress.address);
    //         assert.equal(updatedVestingStorage.admin, breakGlassAddress.address);
    //         assert.equal(updatedTreasuryStorage.admin, breakGlassAddress.address);
    //         assert.equal(updatedBreakGlassStorage.admin, breakGlassAddress.address);            
            
    //     } catch (e){
    //         console.log(e)
    //     }
    // });

});