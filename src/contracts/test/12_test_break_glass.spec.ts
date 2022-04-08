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
import { bob, alice, eve, mallory, oscar } from "../scripts/sandbox/accounts";

import doormanAddress from '../deployments/doormanAddress.json';
import delegationAddress from '../deployments/delegationAddress.json';
import mvkTokenAddress from '../deployments/mvkTokenAddress.json';
import councilAddress from '../deployments/councilAddress.json';
import governanceAddress from '../deployments/governanceAddress.json';
import emergencyGovernanceAddress from '../deployments/emergencyGovernanceAddress.json';
import breakGlassAddress from '../deployments/breakGlassAddress.json';
import vestingAddress from '../deployments/vestingAddress.json';
import treasuryAddress from '../deployments/treasuryAddress.json';

describe("Break Glass tests", async () => {
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

        console.log('-- -- -- -- -- Break Glass Tests -- -- -- --')
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
        console.log('Mallory address: ' + mallory.pkh);
        console.log('Oscar address: ' + oscar.pkh);
        console.log('-- -- -- -- -- -- -- -- --')
    });

    describe("Glass not broken", async () => {
        describe("%setAdmin", async () => {
            beforeEach("Set signer to admin", async () => {
                await signerFactory(bob.sk)
            });
            it('Admin should be able to call this entrypoint and update the contract administrator with a new address', async () => {
                try{
                    // Initial Values
                    breakGlassStorage = await breakGlassInstance.storage();
                    const currentAdmin = breakGlassStorage.admin;

                    // Operation
                    const setAdminOperation = await breakGlassInstance.methods.setAdmin(alice.pkh).send();
                    await setAdminOperation.confirmation();

                    // Final values
                    breakGlassStorage = await breakGlassInstance.storage();
                    const newAdmin = breakGlassStorage.admin;

                    // reset admin
                    await signerFactory(alice.sk);
                    const resetAdminOperation = await breakGlassInstance.methods.setAdmin(bob.pkh).send();
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
                    breakGlassStorage = await breakGlassInstance.storage();
                    const currentAdmin = breakGlassStorage.admin;

                    // Operation
                    await chai.expect(breakGlassInstance.methods.setAdmin(alice.pkh).send()).to.be.rejected;

                    // Final values
                    breakGlassStorage = await breakGlassInstance.storage();
                    const newAdmin = breakGlassStorage.admin;

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

            it('Admin should be able to call the entrypoint and configure the signer threshold', async () => {
                try{
                    // Initial Values
                    breakGlassStorage = await breakGlassInstance.storage();
                    const newConfigValue = 1;

                    // Operation
                    const updateConfigOperation = await breakGlassInstance.methods.updateConfig(newConfigValue,"configThreshold").send();
                    await updateConfigOperation.confirmation();

                    // Final values
                    breakGlassStorage = await breakGlassInstance.storage();
                    const updateConfigValue = breakGlassStorage.config.threshold;

                    // Assertions
                    assert.equal(updateConfigValue, newConfigValue);
                } catch(e){
                    console.log(e);
                }
            });

            it('Admin should not be able to call the entrypoint and configure the signer threshold if it is greater than the amount of members in the council', async () => {
                try{
                    // Initial Values
                    breakGlassStorage = await breakGlassInstance.storage();
                    const currentConfigValue = breakGlassStorage.config.threshold;
                    const newConfigValue = 999
    
                    // Operation
                    await chai.expect(breakGlassInstance.methods.updateConfig(newConfigValue,"configThreshold").send()).to.be.rejected;
    
                    // Final values
                    breakGlassStorage = await breakGlassInstance.storage();
                    const updateConfigValue = breakGlassStorage.config.threshold;
    
                    // Assertions
                    assert.notEqual(newConfigValue, currentConfigValue);
                    assert.equal(updateConfigValue.toNumber(), currentConfigValue.toNumber());
                } catch(e){
                    console.log(e);
                }
            });

            it('Admin should be able to call the entrypoint and configure the action expiry in days', async () => {
                try{
                    // Initial Values
                    breakGlassStorage = await breakGlassInstance.storage();
                    const newConfigValue = 0;

                    // Operation
                    const updateConfigOperation = await breakGlassInstance.methods.updateConfig(newConfigValue,"configActionExpiryDays").send();
                    await updateConfigOperation.confirmation();

                    // Final values
                    breakGlassStorage = await breakGlassInstance.storage();
                    const updateConfigValue = breakGlassStorage.config.actionExpiryDays;

                    // Assertions
                    assert.equal(updateConfigValue, newConfigValue);
                } catch(e){
                    console.log(e);
                }
            });
    
            it('Non-admin should not be able to call the entrypoint', async () => {
                try{
                    // Initial Values
                    breakGlassStorage = await breakGlassInstance.storage();
                    const newConfigValue = 1;
    
                    // Operation
                    await signerFactory(alice.sk);
                    await chai.expect(breakGlassInstance.methods.updateConfig(newConfigValue,"configThreshold").send()).to.be.rejected;
                } catch(e){
                    console.log(e);
                }
            });
        });

        describe("%addCouncilMember", async () => {
            beforeEach("Set signer to council member", async () => {
                await signerFactory(alice.sk)
            });

            it('Council member should be able to access this entrypoint and create a new action to add a council member (the action counter should increase in the storage)', async () => {
                try{
                    // Initial Values
                    breakGlassStorage       = await breakGlassInstance.storage();
                    const councilMember     = oscar.pkh;
                    const nextActionID      = breakGlassStorage.actionCounter;

                    // Operation
                    const newActionOperation = await breakGlassInstance.methods.addCouncilMember(councilMember).send();
                    await newActionOperation.confirmation();

                    // Final values
                    breakGlassStorage   = await breakGlassInstance.storage();
                    const action        = await breakGlassStorage.actionsLedger.get(nextActionID);
                    const actionSigner  = action.signers.includes(alice.pkh)
                    const addressMap    = await action.addressMap;

                    // Assertions
                    assert.strictEqual(action.initiator, alice.pkh);
                    assert.strictEqual(action.status, "PENDING");
                    assert.strictEqual(action.actionType, "addCouncilMember");
                    assert.equal(action.executed, false);
                    assert.equal(actionSigner, true);
                    assert.equal(action.signersCount, 1);
                    assert.equal(addressMap.get("councilMemberAddress"), councilMember);
                } catch(e){
                    console.log(e);
                }
            });

            it('Council member should not be able to access this entrypoint if the given member’s address is already in the council', async () => {
                try{
                    // Initial Values
                    breakGlassStorage       = await breakGlassInstance.storage();
                    const councilMember     = alice.pkh;

                    // Operation
                    await chai.expect(breakGlassInstance.methods.addCouncilMember(councilMember).send()).to.be.rejected;
                } catch(e){
                    console.log(e);
                }
            });

            it('Non-council member should not be able to access this entrypoint', async () => {
                try{
                    // Initial Values
                    await signerFactory(oscar.sk);
                    breakGlassStorage       = await breakGlassInstance.storage();
                    const councilMember     = oscar.pkh;

                    // Operation
                    await chai.expect(breakGlassInstance.methods.addCouncilMember(councilMember).send()).to.be.rejected;
                } catch(e){
                    console.log(e);
                }
            });
        })

        describe("%removeCouncilMember", async () => {
            beforeEach("Set signer to council member", async () => {
                await signerFactory(alice.sk)
            });

            it('Council member should be able to access this entrypoint and create a new action to remove a council member (the action counter should increase in the storage)', async () => {
                try{
                    // Initial Values
                    breakGlassStorage       = await breakGlassInstance.storage();
                    const councilMember     = bob.pkh;
                    const nextActionID      = breakGlassStorage.actionCounter;

                    // Operation
                    const newActionOperation = await breakGlassInstance.methods.removeCouncilMember(councilMember).send();
                    await newActionOperation.confirmation();

                    // Final values
                    breakGlassStorage   = await breakGlassInstance.storage();
                    const action        = await breakGlassStorage.actionsLedger.get(nextActionID);
                    const actionSigner  = action.signers.includes(alice.pkh)
                    const addressMap    = await action.addressMap;

                    // Assertions
                    assert.strictEqual(action.initiator, alice.pkh);
                    assert.strictEqual(action.status, "PENDING");
                    assert.strictEqual(action.actionType, "removeCouncilMember");
                    assert.equal(action.executed, false);
                    assert.equal(actionSigner, true);
                    assert.equal(action.signersCount, 1);
                    assert.equal(addressMap.get("councilMemberAddress"), councilMember);
                } catch(e){
                    console.log(e);
                }
            });

            it('Council member should not be able to access this entrypoint if the threshold is greater than the expected amount of members in the council', async () => {
                try{
                    // Initial Values
                    breakGlassStorage           = await breakGlassInstance.storage();
                    const councilMember         = bob.pkh;
                    const councilMembersAmount  = breakGlassStorage.councilMembers.length;

                    // Set threshold to council members
                    await signerFactory(bob.sk);
                    var updateConfigOperation = await breakGlassInstance.methods.updateConfig(councilMembersAmount,"configThreshold").send();
                    await updateConfigOperation.confirmation();

                    // Operation
                    await signerFactory(alice.sk);
                    await chai.expect(breakGlassInstance.methods.removeCouncilMember(councilMember).send()).to.be.rejected;

                    // Final values
                    breakGlassStorage   = await breakGlassInstance.storage();
                    const threshold     = breakGlassStorage.config.threshold

                    // Assertions
                    assert.equal(threshold, councilMembersAmount);

                    // Reset threshold
                    await signerFactory(bob.sk);
                    updateConfigOperation = await breakGlassInstance.methods.updateConfig(1,"configThreshold").send();
                    await updateConfigOperation.confirmation();
                } catch(e){
                    console.log(e);
                }
            });

            it('Council member should not be able to access this entrypoint if the given member’s address is not in the council', async () => {
                try{
                    // Initial Values
                    breakGlassStorage       = await breakGlassInstance.storage();
                    const councilMember     = oscar.pkh;

                    // Operation
                    await chai.expect(breakGlassInstance.methods.removeCouncilMember(councilMember).send()).to.be.rejected;
                } catch(e){
                    console.log(e);
                }
            });

            it('Non-council member should not be able to access this entrypoint', async () => {
                try{
                    // Initial Values
                    await signerFactory(oscar.sk);
                    breakGlassStorage       = await breakGlassInstance.storage();
                    const councilMember     = bob.pkh;

                    // Operation
                    await chai.expect(breakGlassInstance.methods.removeCouncilMember(councilMember).send()).to.be.rejected;
                } catch(e){
                    console.log(e);
                }
            });
        })


        describe("%changeCouncilMember", async () => {
            beforeEach("Set signer to council member", async () => {
                await signerFactory(alice.sk)
            });

            it('Council member should be able to access this entrypoint and create a new action to replace a council member by another (the action counter should increase in the storage)', async () => {
                try{
                    // Initial Values
                    breakGlassStorage           = await breakGlassInstance.storage();
                    const oldCouncilMember      = bob.pkh;
                    const newCouncilMember      = oscar.pkh;
                    const nextActionID          = breakGlassStorage.actionCounter;

                    // Operation
                    const newActionOperation = await breakGlassInstance.methods.changeCouncilMember(oldCouncilMember, newCouncilMember).send();
                    await newActionOperation.confirmation();

                    // Final values
                    breakGlassStorage   = await breakGlassInstance.storage();
                    const action        = await breakGlassStorage.actionsLedger.get(nextActionID);
                    const actionSigner  = action.signers.includes(alice.pkh)
                    const addressMap    = await action.addressMap;

                    // Assertions
                    assert.strictEqual(action.initiator, alice.pkh);
                    assert.strictEqual(action.status, "PENDING");
                    assert.strictEqual(action.actionType, "changeCouncilMember");
                    assert.equal(action.executed, false);
                    assert.equal(actionSigner, true);
                    assert.equal(action.signersCount, 1);
                    assert.equal(addressMap.get("oldCouncilMemberAddress"), oldCouncilMember);
                    assert.equal(addressMap.get("newCouncilMemberAddress"), newCouncilMember);
                } catch(e){
                    console.log(e);
                }
            });

            it('Council member should not be able to access this entrypoint if the given old member’s address is not in the council', async () => {
                try{
                    // Initial Values
                    breakGlassStorage           = await breakGlassInstance.storage();
                    const oldCouncilMember      = mallory.pkh;
                    const newCouncilMember      = oscar.pkh;

                    // Operation
                    await chai.expect(breakGlassInstance.methods.changeCouncilMember(oldCouncilMember, newCouncilMember).send()).to.be.rejected;
                } catch(e){
                    console.log(e);
                }
            });

            it('Council member should not be able to access this entrypoint if the given new member’s address is already in the council', async () => {
                try{
                    // Initial Values
                    breakGlassStorage           = await breakGlassInstance.storage();
                    const oldCouncilMember      = bob.pkh;
                    const newCouncilMember      = alice.pkh;

                    // Operation
                    await chai.expect(breakGlassInstance.methods.changeCouncilMember(oldCouncilMember, newCouncilMember).send()).to.be.rejected;
                } catch(e){
                    console.log(e);
                }
            });

            it('Non-council member should not be able to access this entrypoint', async () => {
                try{
                    // Initial Values
                    await signerFactory(oscar.sk);
                    breakGlassStorage           = await breakGlassInstance.storage();
                    const oldCouncilMember      = bob.pkh;
                    const newCouncilMember      = oscar.pkh;

                    // Operation
                    await chai.expect(breakGlassInstance.methods.changeCouncilMember(oldCouncilMember, newCouncilMember).send()).to.be.rejected;
                } catch(e){
                    console.log(e);
                }
            });
        })

        describe("%breakGlass", async () => {
            beforeEach("Set signer to council member", async () => {
                await signerFactory(alice.sk)
            });

            it('Other contracts should not be able to access this entrypoint and trigger breakGlass', async () => {
                try{
                    // Operation
                    await chai.expect(breakGlassInstance.methods.breakGlass().send()).to.be.rejected;
                } catch(e){
                    console.log(e);
                }
            });

            it('Emergency Governance contract should be able to access this entrypoint and trigger breakGlass', async () => {
                try{
                    // Initial Values
                    emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                    const emergencyID           = emergencyGovernanceStorage.currentEmergencyGovernanceId;
                    var emergencyProposal       = await emergencyGovernanceStorage.emergencyGovernanceLedger.get(emergencyID);

                    // Set all contracts admin to governance address if it is not
                    await signerFactory(bob.sk);
                    governanceStorage             = await governanceInstance.storage();
                    var generalContracts          = governanceStorage.generalContracts.entries();
                    var updateConfigOperation       = await emergencyGovernanceInstance.methods.updateConfig(1,"configStakedMvkPercentRequired").send();
                    await updateConfigOperation.confirmation();
                    updateConfigOperation           = await emergencyGovernanceInstance.methods.updateConfig(0,"configRequiredFeeMutez").send();
                    await updateConfigOperation.confirmation();

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

                    // User stake more to trigger break glass
                    await signerFactory(mallory.sk);
                    const stakeAmount           = MVK(10)
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
        
                    const stakeOperation    = await doormanInstance.methods.stake(stakeAmount).send();
                    await stakeOperation.confirmation();

                    const stakeRecord       = await doormanStorage.userStakeBalanceLedger.get(mallory.pkh);
                    assert.notEqual(stakeRecord.balance, 0);

                    const emergencyControlOperation = await emergencyGovernanceInstance.methods.triggerEmergencyControl(
                        "Test emergency governance", 
                        "For tests"
                    ).send({amount: 0});
                    await emergencyControlOperation.confirmation();
                    
                    const voteOperation     = await emergencyGovernanceInstance.methods.voteForEmergencyControl().send();
                    await voteOperation.confirmation();

                    // Check if glass was broken
                    breakGlassStorage       = await breakGlassInstance.storage();
                    const glassBroken       = breakGlassStorage.glassBroken;
                    assert.equal(glassBroken, true);
                } catch(e){
                    console.log(e);
                }
            });
        })
    })

    describe("Glass broken", async () => {
        
    })
});