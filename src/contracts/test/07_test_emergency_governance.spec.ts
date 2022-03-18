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
import { alice, bob, eve, mallory } from "../scripts/sandbox/accounts";

import doormanAddress from '../deployments/doormanAddress.json';
import mvkTokenAddress from '../deployments/mvkTokenAddress.json';
import governanceAddress from '../deployments/governanceAddress.json';
import emergencyGovernanceAddress from '../deployments/emergencyGovernanceAddress.json';

describe("Emergency Governance tests", async () => {
    var utils: Utils;

    let doormanInstance;
    let mvkTokenInstance;
    let governanceInstance;
    let emergencyGovernanceInstance;

    let doormanStorage;
    let mvkTokenStorage;
    let governanceStorage;
    let emergencyGovernanceStorage;
    
    const signerFactory = async (pk) => {
        await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
        return utils.tezos;
    };

    before("setup", async () => {

        utils = new Utils();
        await utils.init(alice.sk);

        doormanInstance    = await utils.tezos.contract.at(doormanAddress.address);
        mvkTokenInstance   = await utils.tezos.contract.at(mvkTokenAddress.address);
        governanceInstance = await utils.tezos.contract.at(governanceAddress.address);
        emergencyGovernanceInstance    = await utils.tezos.contract.at(emergencyGovernanceAddress.address);
            
        doormanStorage    = await doormanInstance.storage();
        mvkTokenStorage   = await mvkTokenInstance.storage();
        governanceStorage = await governanceInstance.storage();
        emergencyGovernanceStorage = await emergencyGovernanceInstance.storage();

        console.log('-- -- -- -- -- Emergency Governance Tests -- -- -- --')
        console.log('Doorman Contract deployed at:', doormanInstance.address);
        console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
        console.log('Governance Contract deployed at:', governanceInstance.address);
        console.log('Emergency Governance Contract deployed at:', emergencyGovernanceInstance.address);
        console.log('Alice address: ' + alice.pkh);
        console.log('Bob address: ' + bob.pkh);
        console.log('Eve address: ' + eve.pkh);

    });

    it('alice cannot trigger emergency control (no staked MVK, no tez sent)', async () => {
        try{        

            const emergencyGovernanceTitle       = "New Emergency By Alice";
            const emergencyGovernanceDescription = "Critical flaw detected in contract.";

            const failTriggerEmergencyEmergencyControlOperation = await emergencyGovernanceInstance.methods.triggerEmergencyControl(
                emergencyGovernanceTitle, 
                emergencyGovernanceDescription
            );
            await chai.expect(failTriggerEmergencyEmergencyControlOperation.send()).to.be.eventually.rejected;
            
        } catch (e){
            console.log(e)
        }
    });

    it('alice cannot trigger emergency control (not enough staked MVK, enough tez sent)', async () => {
        try{        

            const emergencyGovernanceTitle       = "New Emergency By Alice";
            const emergencyGovernanceDescription = "Critical flaw detected in contract.";
            const minStakedMvkRequiredToTrigger  = MVK(10);

            // alice update operators
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

            // alice stakes 5 MVK
            const userStake = MVK(5);
            const aliceStakeMvkOperation = await doormanInstance.methods.stake(userStake).send();
            await aliceStakeMvkOperation.confirmation();

            const aliceStakedMvkBalance    = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
            assert.equal(aliceStakedMvkBalance.balance, userStake);
    
            const failTriggerEmergencyEmergencyControlOperation = await emergencyGovernanceInstance.methods.triggerEmergencyControl(
                emergencyGovernanceTitle, 
                emergencyGovernanceDescription
            );
            await chai.expect(failTriggerEmergencyEmergencyControlOperation.send({ amount : 10 })).to.be.eventually.rejected;
            
        } catch (e){
            console.log(e)
        }
    });

    it('alice cannot trigger emergency control (not enough staked MVK, too much tez sent)', async () => {
        try{        

            const emergencyGovernanceTitle       = "New Emergency By Alice";
            const emergencyGovernanceDescription = "Critical flaw detected in contract.";
            const minStakedMvkRequiredToTrigger  = MVK(10);

            // alice update operators
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

            const userStake = MVK(5);
            const aliceStakedMvkBalance    = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
            assert.equal(aliceStakedMvkBalance.balance, userStake);
    
            const failTriggerEmergencyEmergencyControlOperation = await emergencyGovernanceInstance.methods.triggerEmergencyControl(
                emergencyGovernanceTitle, 
                emergencyGovernanceDescription
            );
            await chai.expect(failTriggerEmergencyEmergencyControlOperation.send({ amount : 15 })).to.be.eventually.rejected;
            
        } catch (e){
            console.log(e)
        }
    });

    it('alice cannot trigger emergency control (not enough staked MVK, no tez sent)', async () => {
        try{        

            const emergencyGovernanceTitle       = "New Emergency By Alice";
            const emergencyGovernanceDescription = "Critical flaw detected in contract.";
            const minStakedMvkRequiredToTrigger  = MVK(10);

            // alice stakes 5 MVK
            const userStake = MVK(5);
            const aliceStakedMvkBalance    = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
            
            assert.equal(aliceStakedMvkBalance.balance, userStake);
    
            const failTriggerEmergencyEmergencyControlOperation = await emergencyGovernanceInstance.methods.triggerEmergencyControl(
                emergencyGovernanceTitle, 
                emergencyGovernanceDescription
            );
            await chai.expect(failTriggerEmergencyEmergencyControlOperation.send()).to.be.eventually.rejected;
            
        } catch (e){
            console.log(e)
        }
    });


    it('alice cannot trigger emergency control (enough staked MVK, no tez sent)', async () => {
        try{        

            const emergencyGovernanceTitle       = "New Emergency By Alice";
            const emergencyGovernanceDescription = "Critical flaw detected in contract.";
            const minStakedMvkRequiredToTrigger  = MVK(10);

            // alice update operators
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

            // alice stakes 5 MVK
            const userStake = MVK(5);
            const aliceStakeMvkOperation = await doormanInstance.methods.stake(userStake).send();
            await aliceStakeMvkOperation.confirmation();

            const aliceStakedMvkBalance    = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
            assert.equal(aliceStakedMvkBalance.balance, MVK(10));
    
            const failTriggerEmergencyEmergencyControlOperation = await emergencyGovernanceInstance.methods.triggerEmergencyControl(
                emergencyGovernanceTitle, 
                emergencyGovernanceDescription
            );
            await chai.expect(failTriggerEmergencyEmergencyControlOperation.send()).to.be.eventually.rejected;
            
        } catch (e){
            console.log(e)
        }
    });

    it('alice cannot trigger emergency control (enough staked MVK, not enough tez sent)', async () => {
        try{        

            const emergencyGovernanceTitle       = "New Emergency By Alice";
            const emergencyGovernanceDescription = "Critical flaw detected in contract.";
            const minStakedMvkRequiredToTrigger  = MVK(10);

            // alice update operators
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

            const aliceStakedMvkBalance    = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
            assert.equal(aliceStakedMvkBalance.balance, MVK(10));
    
            const failTriggerEmergencyEmergencyControlOperation = await emergencyGovernanceInstance.methods.triggerEmergencyControl(
                emergencyGovernanceTitle, 
                emergencyGovernanceDescription
            );
            await chai.expect(failTriggerEmergencyEmergencyControlOperation.send({ amount : 6})).to.be.eventually.rejected;
            
        } catch (e){
            console.log(e)
        }
    });

    it('alice cannot trigger emergency control (enough staked MVK, too much tez sent)', async () => {
        try{        

            const emergencyGovernanceTitle       = "New Emergency By Alice";
            const emergencyGovernanceDescription = "Critical flaw detected in contract.";
            const minStakedMvkRequiredToTrigger  = MVK(10);

            // alice update operators
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

            const aliceStakedMvkBalance    = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
            assert.equal(aliceStakedMvkBalance.balance, MVK(10));
    
            const failTriggerEmergencyEmergencyControlOperation = await emergencyGovernanceInstance.methods.triggerEmergencyControl(
                emergencyGovernanceTitle, 
                emergencyGovernanceDescription
            );
            await chai.expect(failTriggerEmergencyEmergencyControlOperation.send({ amount : 11})).to.be.eventually.rejected;
            
        } catch (e){
            console.log(e)
        }
    });


    it('alice can trigger emergency control (enough staked MVK, enough tez sent)', async () => {
        try{        

            const emergencyGovernanceTitle       = "New Emergency By Alice";
            const emergencyGovernanceDescription = "Critical flaw detected in contract.";

            // alice triggers emergency Governance
            const triggerEmergencyControlOperation = await emergencyGovernanceInstance.methods.triggerEmergencyControl(
                emergencyGovernanceTitle, 
                emergencyGovernanceDescription
            ).send({amount : 10});
            await triggerEmergencyControlOperation.confirmation();
            
            const updatedEmergencyGovernanceStorage   = await emergencyGovernanceInstance.storage();
            const emergencyGovernanceProposal         = await updatedEmergencyGovernanceStorage.emergencyGovernanceLedger.get('1');

            const aliceStakedMvkBalance    = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
            assert.equal(aliceStakedMvkBalance.balance, MVK(10));

            assert.equal(emergencyGovernanceProposal.title,           emergencyGovernanceTitle);
            assert.equal(emergencyGovernanceProposal.description,     emergencyGovernanceDescription);
            assert.equal(emergencyGovernanceProposal.status,          false);
            assert.equal(emergencyGovernanceProposal.dropped,         false);
            assert.equal(emergencyGovernanceProposal.executed,        false);
            assert.equal(emergencyGovernanceProposal.totalStakedMvkVotes,        0);
            
            
        } catch (e){
            console.log(e)
        }
    });

    it('bob cannot trigger another emergency governance at the same time (no staked MVK, no tez sent)', async () => {
        try{        

            await signerFactory(bob.sk);
            const failTriggerEmergencyControlOperation = await emergencyGovernanceInstance.methods.triggerEmergencyControl("New Emergency Again", "Help please.");
            await chai.expect(failTriggerEmergencyControlOperation.send()).to.be.eventually.rejected;
            
        } catch (e){
            console.log(e)
        }
    });

    it('bob cannot trigger another emergency governance at the same time (enough staked MVK, enough tez sent)', async () => {
        try{        

            await signerFactory(bob.sk);

            // bob stakes 10 MVK
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
            
            const userStake = MVK(10);
            const bobStakeMvkOperation = await doormanInstance.methods.stake(userStake).send();
            await bobStakeMvkOperation.confirmation();

            const bobStakedMvkBalance    = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
            assert.equal(bobStakedMvkBalance.balance, MVK(10));

            const failTriggerEmergencyControlOperation = await emergencyGovernanceInstance.methods.triggerEmergencyControl("New Emergency Again", "Help please.");
            await chai.expect(failTriggerEmergencyControlOperation.send({ amount : 10})).to.be.eventually.rejected;
            
        } catch (e){
            console.log(e)
        }
    });

    it('eve cannot vote for emergency control (no staked MVK)', async () => {
        try{        

            await signerFactory(eve.sk);
            const failVoteForEmergencyEmergencyControlOperation = await emergencyGovernanceInstance.methods.voteForEmergencyControl(1);
            await chai.expect(failVoteForEmergencyEmergencyControlOperation.send()).to.be.eventually.rejected;
            
        } catch (e){
            console.log(e)
        }
    });

    it('eve cannot vote for emergency control (not enough staked MVK)', async () => {
        try{        

            await signerFactory(eve.sk);

            // eve stakes 4 MVK
            const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
                {
                    add_operator: {
                        owner: eve.pkh,
                        operator: doormanAddress.address,
                        token_id: 0,
                    },
                }])
                .send()
            await updateOperatorsOperation.confirmation();
            
            const userStake = MVK(4);
            const eveStakeMvkOperation = await doormanInstance.methods.stake(userStake).send();
            await eveStakeMvkOperation.confirmation();

            const eveStakedMvkBalance    = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);
            assert.equal(eveStakedMvkBalance.balance, userStake);

            const failVoteForEmergencyEmergencyControlOperation = await emergencyGovernanceInstance.methods.voteForEmergencyControl(1);
            await chai.expect(failVoteForEmergencyEmergencyControlOperation.send()).to.be.eventually.rejected;
            
        } catch (e){
            console.log(e)
        }
    });

    it('eve can vote for emergency control if she has sufficient staked mvk', async () => {
        try{        

            await signerFactory(eve.sk);

            // eve update operators
            const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
            {
                add_operator: {
                    owner: eve.pkh,
                    operator: doormanAddress.address,
                    token_id: 0,
                },
            }])
            .send()
            await updateOperatorsOperation.confirmation();

            // eve stakes another 6 MVK
            const userStake = MVK(6);
            const eveStakeMvkOperation = await doormanInstance.methods.stake(userStake).send();
            await eveStakeMvkOperation.confirmation();

            const eveStakedMvkBalance    = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);
            assert.equal(eveStakedMvkBalance.balance, MVK(10));

            const voteForEmergencyControlOperation = await emergencyGovernanceInstance.methods.voteForEmergencyControl(1).send();
            await voteForEmergencyControlOperation.confirmation();

            const updatedEmergencyGovernanceStorage   = await emergencyGovernanceInstance.storage();
            const emergencyGovernanceProposal         = await updatedEmergencyGovernanceStorage.emergencyGovernanceLedger.get(1);

            assert.equal(emergencyGovernanceProposal.status,          false);
            assert.equal(emergencyGovernanceProposal.dropped,         false);
            assert.equal(emergencyGovernanceProposal.executed,        false);
            assert.equal(emergencyGovernanceProposal.totalStakedMvkVotes, MVK(10));
            
        } catch (e){
            console.log(e)
        }
    });

    // it('alice can vote for emergency control and trigger break glass (500 MVK > 100 MVK required)', async () => {
    //     try{        

    //         const voteForEmergencyControlOperation = await emergencyGovernanceInstance.methods.voteForEmergencyControl(1).send();
    //         await voteForEmergencyControlOperation.confirmation();

    //         afterEmergencyGovernanceStorage     = await emergencyGovernanceInstance.storage();
    //         // emergencyGovernanceProposal         = await afterEmergencyGovernanceStorage.emergencyGovernanceLedger.get(1);

    //         console.log(afterEmergencyGovernanceStorage);
    //         // console.log(emergencyGovernanceProposal);
            
    //     } catch (e){
    //         console.log(e)
    //     }
    // });

    // it('alice can drop emergency control', async () => {
    //     try{        

    //         const dropEmergencyControlOperation = await emergencyGovernanceInstance.methods.dropEmergencyGovernance(Tezos.unit).send();
    //         await dropEmergencyControlOperation.confirmation();

    //         afterEmergencyGovernanceStorage     = await emergencyGovernanceInstance.storage();
    //         emergencyGovernanceProposal         = await afterEmergencyGovernanceStorage.emergencyGovernanceLedger.get('1');

    //         console.log(afterEmergencyGovernanceStorage);
    //         console.log(emergencyGovernanceProposal);
            
    //     } catch (e){
    //         console.log(e)
    //     }
    // });

    // it('bob can trigger emergency control after previous one is dropped', async () => {
    //     try{        

    //         await signerFactory(bob.sk);

    //         beforeEmergencyGovernanceStorage     = await emergencyGovernanceInstance.storage();

    //         const triggerEmergencyControlOperation = await emergencyGovernanceInstance.methods.triggerEmergencyControl("New Emergency By Bob", "Help me please.").send();
    //         await triggerEmergencyControlOperation.confirmation();
            
    //         afterEmergencyGovernanceStorage     = await emergencyGovernanceInstance.storage();
    //         emergencyGovernanceProposal         = await afterEmergencyGovernanceStorage.emergencyGovernanceLedger.get('2');

    //         console.log(emergencyGovernanceProposal);
            
    //         await signerFactory(alice.sk);

    //     } catch (e){
    //         console.log(e)
    //     }
    // });

});