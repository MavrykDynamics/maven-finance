// const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
// const { InMemorySigner, importKey } = require("@taquito/signer");
// import assert, { ok, rejects, strictEqual } from "assert";
// import { Utils, zeroAddress } from "./helpers/Utils";
// import fs from "fs";
// import { confirmOperation } from "../scripts/confirmation";

// const chai = require("chai");
// const chaiAsPromised = require('chai-as-promised');
// chai.use(chaiAsPromised);   
// chai.should();

// import env from "../env";
// import { alice, bob, eve, mallory } from "../scripts/sandbox/accounts";

// import vestingAddress from '../deployments/vestingAddress.json';
// import doormanAddress from '../deployments/doormanAddress.json';
// import delegationAddress from '../deployments/delegationAddress.json';
// import mvkTokenAddress from '../deployments/mvkTokenAddress.json';
// import governanceAddress from '../deployments/governanceAddress.json';
// import councilAddress from '../deployments/councilAddress.json';

// describe("Vesting tests", async () => {
//     var utils: Utils;

//     let doormanInstance;
//     let delegationInstance;
//     let mvkTokenInstance;
//     let governanceInstance;
//     let vestingInstance;
//     let councilInstance;

//     let doormanStorage;
//     let delegationStorage;
//     let mvkTokenStorage;
//     let governanceStorage;
//     let vestingStorage;
//     let councilStorage;
    
//     const signerFactory = async (pk) => {
//         await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
//         return utils.tezos;
//     };

//     before("setup", async () => {

//         utils = new Utils();
//         await utils.init(alice.sk);
        
//         vestingInstance    = await utils.tezos.contract.at(vestingAddress.address);
//         doormanInstance    = await utils.tezos.contract.at(doormanAddress.address);
//         delegationInstance = await utils.tezos.contract.at(delegationAddress.address);
//         mvkTokenInstance   = await utils.tezos.contract.at(mvkTokenAddress.address);
//         governanceInstance = await utils.tezos.contract.at(governanceAddress.address);
//         councilInstance    = await utils.tezos.contract.at(councilAddress.address);
            
//         vestingStorage    = await vestingInstance.storage();
//         doormanStorage    = await doormanInstance.storage();
//         delegationStorage = await delegationInstance.storage();
//         mvkTokenStorage   = await mvkTokenInstance.storage();
//         governanceStorage = await governanceInstance.storage();
//         councilStorage    = await councilInstance.storage();

//         console.log('-- -- -- -- -- Vesting Tests -- -- -- --')
//         console.log('Vesting Contract deployed at:', vestingInstance.address);
//         console.log('Doorman Contract deployed at:', doormanInstance.address);
//         console.log('Delegation Contract deployed at:', delegationInstance.address);
//         console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
//         console.log('Governance Contract deployed at:', governanceInstance.address);
//         console.log('Council Contract deployed at:', councilInstance.address);
//         console.log('Alice address: ' + alice.pkh);
//         console.log('Bob address: ' + bob.pkh);
//         console.log('Eve address: ' + eve.pkh);

//     });

//     it('council can add a new vestee', async () => {
//         try{        

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Council can add a new vestee") 
//             console.log("---") // break

//             // console.log('Storage test: console log checks  ----');
//             // console.log(councilStorage);
            
//             const actionId                   = 0;

//             // dummy vestee details
//             const vesteeAddress              = mallory.pkh;
//             const vesteeTotalAllocatedAmount = 500000000;
//             const vesteeCliffInMonths        = 6;
//             const vesteeVestingInMonths      = 24;

//             // Council member adds a new vestee
//             const councilAddsNewVesteeOperation = await councilInstance.methods.councilActionAddVestee(
//                 vesteeAddress, 
//                 vesteeTotalAllocatedAmount, 
//                 vesteeCliffInMonths, 
//                 vesteeVestingInMonths
//                 ).send();
//             await councilAddsNewVesteeOperation.confirmation();

//             // assert that new addVestee action has been created with PENDING status
//             const testCouncilStorage   = await councilInstance.storage();
//             const testNewVesteeAction  = await testCouncilStorage.councilActionsLedger.get(actionId);
//             assert.equal(testNewVesteeAction.status, "PENDING");

//             // Council member 2 signs addVestee action
//             await signerFactory(bob.sk);
//             const councilMemberSignAddVesteeOperationOne = await councilInstance.methods.signAction(actionId).send();
//             await councilMemberSignAddVesteeOperationOne.confirmation();

//             // Council member 3 signs addVestee action
//             await signerFactory(eve.sk);
//             const councilMemberSignAddVesteeOperationTwo = await councilInstance.methods.signAction(actionId).send();
//             await councilMemberSignAddVesteeOperationTwo.confirmation();

//             // assert that new vestee action has been executed with EXECUTED status
//             const testTwoCouncilStorage   = await councilInstance.storage();
//             const testTwoNewVesteeAction  = await testTwoCouncilStorage.councilActionsLedger.get(actionId);
//             assert.equal(testTwoNewVesteeAction.status, "EXECUTED");
//             // console.log(testTwoNewVesteeAction);

//             // assert that vesting contract is updated with new vestee recorded in vesteeLedger
//             const vestingStorage = await vestingInstance.storage();
//             const vesteeRecord   = await vestingStorage.vesteeLedger.get(vesteeAddress);
//             assert.equal(vesteeRecord.totalAllocatedAmount, vesteeTotalAllocatedAmount);
//             assert.equal(vesteeRecord.cliffMonths, vesteeCliffInMonths);
//             assert.equal(vesteeRecord.vestingMonths, vesteeVestingInMonths);
//             // console.log(vesteeRecord);

//         } catch(e){
//             console.log(e);
//         } 

//     });    


//     it('council can update a vestee', async () => {
//         try{        

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Council can update a vestee") 
//             console.log("---") // break

//             // console.log('Storage test: console log checks  ----');
//             // console.log(councilStorage);

//             const actionId                   = 1;

//             // dummy vestee details
//             const vesteeAddress              = mallory.pkh;
//             const vesteeTotalAllocatedAmount = 700000000;
//             const vesteeCliffInMonths        = 9;
//             const vesteeVestingInMonths      = 20;

//             // Council member updates vestee
//             const councilUpdatesVesteeOperation = await councilInstance.methods.councilActionUpdateVestee(
//                 vesteeAddress, 
//                 vesteeTotalAllocatedAmount, 
//                 vesteeCliffInMonths, 
//                 vesteeVestingInMonths
//                 ).send();
//             await councilUpdatesVesteeOperation.confirmation();

//             // assert that new removeVestee action has been created with PENDING status
//             const testCouncilStorage   = await councilInstance.storage();
//             const testNewVesteeAction  = await testCouncilStorage.councilActionsLedger.get(actionId);
//             assert.equal(testNewVesteeAction.status, "PENDING");

//             // Council member 2 signs addVestee action
//             await signerFactory(bob.sk);
//             const councilMemberSignAddVesteeOperationOne = await councilInstance.methods.signAction(actionId).send();
//             await councilMemberSignAddVesteeOperationOne.confirmation();

//             // Council member 3 signs addVestee action
//             await signerFactory(eve.sk);
//             const councilMemberSignAddVesteeOperationTwo = await councilInstance.methods.signAction(actionId).send();
//             await councilMemberSignAddVesteeOperationTwo.confirmation();

//             // assert that new vestee action has been executed with EXECUTED status
//             const testTwoCouncilStorage   = await councilInstance.storage();
//             const testTwoNewVesteeAction  = await testTwoCouncilStorage.councilActionsLedger.get(actionId);
//             assert.equal(testTwoNewVesteeAction.status, "EXECUTED");
//             // console.log(testTwoNewVesteeAction);

//             // assert that vesting contract is updated with new vestee recorded in vesteeLedger
//             const vestingStorage = await vestingInstance.storage();
//             const vesteeRecord   = await vestingStorage.vesteeLedger.get(vesteeAddress);
//             // assert.equal(vesteeRecord.totalAllocatedAmount, vesteeTotalAllocatedAmount);
//             // assert.equal(vesteeRecord.cliffMonths, vesteeCliffInMonths);
//             // assert.equal(vesteeRecord.vestingMonths, vesteeVestingInMonths);
//             // console.log(vesteeRecord);

//         } catch(e){
//             console.log(e);
//         } 

//     });    

//     it('council can remove a vestee', async () => {
//         try{        

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Council can remove a vestee") 
//             console.log("---") // break

//             // console.log('Storage test: console log checks  ----');
//             // console.log(councilStorage);

//             const actionId                   = 2;

//             // dummy vestee details
//             const vesteeAddress              = mallory.pkh;
//             const vesteeTotalAllocatedAmount = 500000000;
//             const vesteeCliffInMonths        = 6;
//             const vesteeVestingInMonths      = 24;

//             // Council member removes vestee
//             const councilRemoveVesteeOperation = await councilInstance.methods.councilActionRemoveVestee(
//                 vesteeAddress
//                 ).send();
//             await councilRemoveVesteeOperation.confirmation();

//             // assert that new removeVestee action has been created with PENDING status
//             const testCouncilStorage   = await councilInstance.storage();
//             const testNewVesteeAction  = await testCouncilStorage.councilActionsLedger.get(actionId);
//             assert.equal(testNewVesteeAction.status, "PENDING");

//             // Council member 2 signs addVestee action
//             await signerFactory(bob.sk);
//             const councilMemberSignAddVesteeOperationOne = await councilInstance.methods.signAction(actionId).send();
//             await councilMemberSignAddVesteeOperationOne.confirmation();

//             // Council member 3 signs addVestee action
//             await signerFactory(eve.sk);
//             const councilMemberSignAddVesteeOperationTwo = await councilInstance.methods.signAction(actionId).send();
//             await councilMemberSignAddVesteeOperationTwo.confirmation();

//             // assert that new vestee action has been executed with EXECUTED status
//             const testTwoCouncilStorage   = await councilInstance.storage();
//             const testTwoNewVesteeAction  = await testTwoCouncilStorage.councilActionsLedger.get(actionId);
//             assert.equal(testTwoNewVesteeAction.status, "EXECUTED");
//             // console.log(testTwoNewVesteeAction);

//             // assert that vesting contract is updated with new vestee recorded in vesteeLedger
//             const vestingStorage = await vestingInstance.storage();
//             const vesteeRecord   = await vestingStorage.vesteeLedger.get(vesteeAddress);
//             // assert.equal(vesteeRecord.totalAllocatedAmount, vesteeTotalAllocatedAmount);
//             // assert.equal(vesteeRecord.cliffMonths, vesteeCliffInMonths);
//             // assert.equal(vesteeRecord.vestingMonths, vesteeVestingInMonths);
//             // console.log(vesteeRecord);

//         } catch(e){
//             console.log(e);
//         } 

//     });    

//     it('council can add a new council member', async () => {
//         try{        

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Council can add a new council member") 
//             console.log("---") // break

//             // console.log('Storage test: console log checks  ----');
//             // console.log(councilStorage);

//             // dummy council member details
//             const newCouncilMemberAddress   = mallory.pkh;
//             const actionId                  = 3;

//             // Council add new council member
//             const councilAddNewCouncilMemberOperation = await councilInstance.methods.councilActionAddCouncilMember(
//                 newCouncilMemberAddress
//                 ).send();
//             await councilAddNewCouncilMemberOperation.confirmation();

//             // assert that new removeVestee action has been created with PENDING status
//             const testCouncilStorage   = await councilInstance.storage();
//             const testNewAction        = await testCouncilStorage.councilActionsLedger.get(actionId);
//             assert.equal(testNewAction.status, "PENDING");

//             // Council member 2 signs addVestee action
//             await signerFactory(bob.sk);
//             const councilMemberSignAddVesteeOperationOne = await councilInstance.methods.signAction(actionId).send();
//             await councilMemberSignAddVesteeOperationOne.confirmation();

//             // Council member 3 signs addVestee action
//             await signerFactory(eve.sk);
//             const councilMemberSignAddVesteeOperationTwo = await councilInstance.methods.signAction(actionId).send();
//             await councilMemberSignAddVesteeOperationTwo.confirmation();

//             // assert that new vestee action has been executed with EXECUTED status
//             const testTwoCouncilStorage   = await councilInstance.storage();
//             const testTwoNewAction        = await testTwoCouncilStorage.councilActionsLedger.get(actionId);
//             assert.equal(testTwoNewAction.status, "EXECUTED");
//             // console.log(testTwoNewVesteeAction);

//         } catch(e){
//             console.log(e);
//         } 

//     });    

//     it('council can remove a council member', async () => {
//         try{        

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Council can remove a council member") 
//             console.log("---") // break

//             // console.log('Storage test: console log checks  ----');
//             // console.log(councilStorage);

//             // dummy council member details
//             const councilMemberAddress  = mallory.pkh;
//             const actionId              = 4;

//             // Council remove council member
//             const councilRemoveCouncilMemberOperation = await councilInstance.methods.councilActionRemoveMember(
//                 councilMemberAddress
//                 ).send();
//             await councilRemoveCouncilMemberOperation.confirmation();

//             // assert that new removeVestee action has been created with PENDING status
//             const testCouncilStorage   = await councilInstance.storage();
//             const testNewAction        = await testCouncilStorage.councilActionsLedger.get(actionId);
//             assert.equal(testNewAction.status, "PENDING");

//             // Council member 2 signs addVestee action
//             await signerFactory(bob.sk);
//             const councilMemberSignAddVesteeOperationOne = await councilInstance.methods.signAction(actionId).send();
//             await councilMemberSignAddVesteeOperationOne.confirmation();

//             // Council member 3 signs addVestee action
//             await signerFactory(eve.sk);
//             const councilMemberSignAddVesteeOperationTwo = await councilInstance.methods.signAction(actionId).send();
//             await councilMemberSignAddVesteeOperationTwo.confirmation();

//             // assert that new vestee action has been executed with EXECUTED status
//             const testTwoCouncilStorage   = await councilInstance.storage();
//             const testTwoNewAction        = await testTwoCouncilStorage.councilActionsLedger.get(actionId);
//             assert.equal(testTwoNewAction.status, "EXECUTED");
//             // console.log(testTwoNewVesteeAction);

//         } catch(e){
//             console.log(e);
//         } 

//     });    


//     // it('admin can add a new vestee', async () => {
//     //     try{        

//     //         console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//     //         console.log("Test: Admin can add a new vestee") 
//     //         console.log("---") // break

//     //         console.log('Storage test: console log checks  ----');
//     //         console.log(vestingStorage);

//     //         // Alice registers as a satellite
//     //         const adminAddsNewVesteeOperation = await vestingInstance.methods.addVestee(bob.pkh, 500000000, 6, 24).send();
//     //         await adminAddsNewVesteeOperation.confirmation();

//     //         const newVestingStorage = await vestingInstance.storage();
//     //         console.log(newVestingStorage);
//     //         console.log('Block Level: ' + newVestingStorage.tempBlockLevel);
//     //         const afterVesteeLedger  = await newVestingStorage.vesteeLedger.get(bob.pkh);
//     //         console.log(afterVesteeLedger);        

//     //     } catch(e){
//     //         console.log(e);
//     //     } 

//     // });    

//     // it('bob claim vesting - zero cliff period', async () => {
//     //     try{        

//     //         console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//     //         console.log("Test: Bob claim vesting - zero cliff period") 
//     //         console.log("---") // break

//     //         console.log('Storage test: console log checks  ----');
//     //         console.log(vestingStorage);

//     //         const adminAddsNewVesteeOperation = await vestingInstance.methods.addVestee(bob.pkh, 500000000, 0, 24).send();
//     //         await adminAddsNewVesteeOperation.confirmation();

//     //         await signerFactory(bob.sk);

//     //         // Bob claim vesting - zero cliff
//     //         const bobClaimsVestingBeforeCliffOperation = await vestingInstance.methods.claim();
//     //         await chai.expect(bobClaimsVestingBeforeCliffOperation.send()).to.be.eventually.rejected;

//     //         const newVestingStorage = await vestingInstance.storage();
//     //         console.log(newVestingStorage);
//     //         console.log('--- --- ---')
//     //         console.log('Block Level: ' + newVestingStorage.tempBlockLevel);
//     //         console.log('--- --- ---')
//     //         const afterVesteeLedger  = await newVestingStorage.vesteeLedger.get(bob.pkh);
//     //         console.log(afterVesteeLedger);   
            
//     //         // reset state
//     //         await signerFactory(alice.sk);     
//     //         const removeBobVesteeOperation = await vestingInstance.methods.removeVestee(bob.pkh);
//     //         await removeBobVesteeOperation.confirmation();

//     //     } catch(e){
//     //         console.log(e);
//     //     } 

//     // });  
    

//     // *** Mock Test - requires some changes in vesting contract *** 
//     // mock test to check that vestee claim works with changes to vestee's MVK balance and MVK total supply
//     // requires changes to vesting contract to arbitrarily set numberOfClaimMonths to 1n 
//     //   (becase original logic fixes s.config.blocksPerMonth to 86400 which will skew the calculation of numberOfClaimMonths for tests)
//     // it('bob claim vesting - zero cliff period - zero vesting period - test MVK token contract storage update', async () => {
//     //     try{        

//     //         console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//     //         console.log("Test: Bob claim vesting - zero cliff period -  zero vesting period - test MVK token contract storage update") 
//     //         console.log("---") // break

//     //         console.log('Storage test: console log checks  ----');
//     //         console.log(vestingStorage);

//     //         const adminAddsNewVesteeOperation = await vestingInstance.methods.addVestee(bob.pkh, 500000000, 0, 1).send();
//     //         await adminAddsNewVesteeOperation.confirmation();

//     //         // random operation to simulate passing of time / block levels
//     //         const adminAddsEveVesteeOperation = await vestingInstance.methods.addVestee(eve.pkh, 500000000, 0, 10).send();
//     //         await adminAddsEveVesteeOperation.confirmation();

//     //         const newVestingStorage = await vestingInstance.storage();

//     //         console.log('--- --- ---')
//     //         console.log('Block Level: ' + newVestingStorage.tempBlockLevel);
//     //         console.log('--- --- ---')

//     //         await signerFactory(bob.sk);

//     //         // Bob claim vesting - zero cliff
//     //         const bobClaimOperation = await vestingInstance.methods.claim().send();
//     //         await bobClaimOperation.confirmation();
            
//     //         console.log('after claim ')
//     //         const afterClaimVestingStorage = await vestingInstance.storage();
//     //         const afterClaimVesteeLedger   = await afterClaimVestingStorage.vesteeLedger.get(bob.pkh);
//     //         console.log(afterClaimVesteeLedger);

//     //         const newMvkTokenStorage = await mvkTokenInstance.storage();
//     //         console.log(newMvkTokenStorage);
//     //         const bobLedger          = await newMvkTokenStorage.ledger.get(bob.pkh);
//     //         console.log(bobLedger);

//     //     } catch(e){
//     //         console.log(e);
//     //     } 

//     // });  

// });