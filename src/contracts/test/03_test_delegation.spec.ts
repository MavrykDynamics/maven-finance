// const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
// const { InMemorySigner, importKey } = require("@taquito/signer");
// import assert, { ok, rejects, strictEqual } from "assert";
// import { Utils, zeroAddress, MVK } from "./helpers/Utils";
// import fs from "fs";
// import { confirmOperation } from "../scripts/confirmation";

// const chai = require("chai");
// const chaiAsPromised = require('chai-as-promised');
// chai.use(chaiAsPromised);   
// chai.should();

// import env from "../env";
// import { bob, alice, eve, mallory } from "../scripts/sandbox/accounts";

// import doormanAddress from '../deployments/doormanAddress.json';
// import delegationAddress from '../deployments/delegationAddress.json';
// import mvkTokenAddress from '../deployments/mvkTokenAddress.json';
// import governanceAddress from '../deployments/governanceAddress.json';

// describe("Delegation tests", async () => {
//     var utils: Utils;
//     var tezos;

//     let doormanInstance;
//     let delegationInstance;
//     let mvkTokenInstance;
//     let governanceInstance;

//     let doormanStorage;
//     let delegationStorage;
//     let mvkTokenStorage;
//     let governanceStorage;
    
//     const signerFactory = async (pk) => {
//         await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
//         return utils.tezos;
//     };

//     before("setup", async () => {

//         utils = new Utils();
//         await utils.init(bob.sk);
        
//         doormanInstance    = await utils.tezos.contract.at(doormanAddress.address);
//         delegationInstance = await utils.tezos.contract.at(delegationAddress.address);
//         mvkTokenInstance   = await utils.tezos.contract.at(mvkTokenAddress.address);
//         governanceInstance = await utils.tezos.contract.at(governanceAddress.address);
            
//         doormanStorage    = await doormanInstance.storage();
//         delegationStorage = await delegationInstance.storage();
//         mvkTokenStorage   = await mvkTokenInstance.storage();
//         governanceStorage = await governanceInstance.storage();

//         console.log('-- -- -- -- -- Delegation Tests -- -- -- --')
//         console.log('Doorman Contract deployed at:', doormanInstance.address);
//         console.log('Delegation Contract deployed at:', delegationInstance.address);
//         console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
//         console.log('Governance Contract deployed at:', governanceInstance.address);
//         console.log('Bob address: ' + bob.pkh);
//         console.log('Alice address: ' + alice.pkh);
//         console.log('Eve address: ' + eve.pkh);

//         tezos = doormanInstance.tezos;

//     });

//     it('bob can register as a satellite', async () => {
//         try{        

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Bob can register as a satellite") 
//             console.log("---") // break

//             // init values
//             const userStake               = MVK(100);
//             const doormanContractAddress  = doormanAddress.address;
//             const satelliteName           = "New Satellite (Bob)";
//             const satelliteDescription    = "New Satellite Description (Bob)";
//             const satelliteImage          = "https://placeholder.com/300";
//             const satelliteFee            = "700";

//             // Bob assigns doorman contract as an operator
//             await signerFactory(bob.sk);
//             const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//             {
//                 add_operator: {
//                     owner    : bob.pkh,
//                     operator : doormanContractAddress,
//                     token_id : 0,
//                 },
//             }])
//             .send()
//             await updateOperatorsOperation.confirmation();

//             // Bob stake 100 MVK tokens
//             const stakeAmountOperation = await doormanInstance.methods.stake(userStake).send();
//             await stakeAmountOperation.confirmation();

//             // Check state before registering as satellite
//             const beforeDelegationLedgerBob  = await delegationStorage.satelliteLedger.get(bob.pkh);        // should return null or undefined
//             const beforeBobStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);    // 100 MVK
//             assert.equal(beforeDelegationLedgerBob,       null);
//             assert.equal(beforeBobStakedBalance.balance,  userStake);

//             // Bob registers as a satellite
//             const registerAsSatelliteOperation = await delegationInstance.methods
//                 .registerAsSatellite(
//                     satelliteName, 
//                     satelliteDescription, 
//                     satelliteImage, 
//                     satelliteFee
//                 ).send();
//             await registerAsSatelliteOperation.confirmation();

//             // Check state after registering as satellite
//             const afterDelegationLedgerBob  = await delegationStorage.satelliteLedger.get(bob.pkh);         // should return bob's satellite record
//             const afterBobStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);     // 100 MVK
            
//             // Bob's satellite details
//             assert.equal(afterDelegationLedgerBob.name,                   satelliteName);
//             assert.equal(afterDelegationLedgerBob.description,            satelliteDescription);
//             assert.equal(afterDelegationLedgerBob.stakedMvkBalance,       userStake);
//             assert.equal(afterDelegationLedgerBob.satelliteFee,           satelliteFee);
//             assert.equal(afterDelegationLedgerBob.totalDelegatedAmount,   0);
//             assert.equal(afterDelegationLedgerBob.status,                 1);

//             // Bob's staked balance remains the same
//             assert.equal(afterBobStakedBalance.balance, userStake);

//         } catch(e){
//             console.log(e);
//         } 

//     });

//     it('bob cannot register twice as a satellite', async () => {
//         try{        
            
//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Bob cannot register twice as a satellite") 
//             console.log("---") // break

//             const failRegisterAsSatelliteTwiceOperation = await delegationInstance.methods.registerAsSatellite("New Satellite", "New Satellite Description", "https://image.url", "700");    
//             await chai.expect(failRegisterAsSatelliteTwiceOperation.send()).to.be.eventually.rejected;

//         } catch(e){
//             console.log(e);
//         } 
//     });

//     it(`bob stakes another 100 MVK tokens and increases her satellite bond`, async () => {
//         try{

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Bob stakes another 100 MVK tokens and increases her satellite bond:") 
//             console.log("---") // break

//             // init values
//             const userStake               = MVK(100);
//             const newUserStakedBalance    = MVK(200);

//             // Check state before stake action
//             const beforeDelegationLedgerBob  = await delegationStorage.satelliteLedger.get(bob.pkh);        // should return null or undefined
//             const beforeBobStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);    // BigNumber { s: 1, e: 8, c: [ 100000000 ] }
//             assert.equal(beforeDelegationLedgerBob.stakedMvkBalance, userStake);
//             assert.equal(beforeBobStakedBalance.balance,             userStake);
             
//             // bob stake another 100 MVK tokens 
//             const stakeAmountOperation = await doormanInstance.methods.stake(userStake).send();
//             await stakeAmountOperation.confirmation();
            
//             // Check state after stake action
//             const afterDelegationLedgerBob  = await delegationStorage.satelliteLedger.get(bob.pkh);         // should return bob's satellite record
//             const afterBobStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);     // should return BigNumber { s: 1, e: 8, c: [ 100000000 ] }
//             assert.equal(afterDelegationLedgerBob.stakedMvkBalance, newUserStakedBalance);
//             assert.equal(afterBobStakedBalance.balance,             newUserStakedBalance);
        
//         } catch(e){
//             console.log(e);
//         }
//     });

//     it(`bob unstakes 100 MVK tokens and decreases her satellite bond`, async () => {
//         try{

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Bob unstakes 100 MVK tokens and decreases her satellite bond:") 
//             console.log("---") // break

//             // init values
//             const userUnstake             = MVK(100);
//             const oldUserStakedBalance    = MVK(200);

//             // Check state before unstake action
//             const beforeDelegationLedgerBob  = await delegationStorage.satelliteLedger.get(bob.pkh);        // should return null or undefined
//             const beforeBobStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);    // BigNumber { s: 1, e: 8, c: [ 100000000 ] }
//             assert.equal(beforeDelegationLedgerBob.stakedMvkBalance, oldUserStakedBalance);
//             assert.equal(beforeBobStakedBalance.balance,             oldUserStakedBalance);
            
//             // bob unstakes 100 MVK tokens 
//             const unstakeAmountOperation = await doormanInstance.methods.unstake(userUnstake).send();
//             await unstakeAmountOperation.confirmation();
            
//             // Check state after unstake action
//             const afterDelegationLedgerBob  = await delegationStorage.satelliteLedger.get(bob.pkh);         // should return bob's satellite record
//             const afterBobStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);     // should return BigNumber { s: 1, e: 8, c: [ 100000000 ] }
//             assert.notEqual(afterDelegationLedgerBob.stakedMvkBalance, oldUserStakedBalance);
//             assert.notEqual(afterBobStakedBalance.balance,             oldUserStakedBalance);

//         } catch(e){
//             console.log(e);
//         }
//     });

//     it('alice and eve can delegate to bob satellite', async () => {
//         try{        

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Alice and Eve can delegate to Bob's satellite") 
//             console.log("---") // break

//             // init values
//             const userStake                 = MVK(100);
//             const doormanContractAddress    = doormanAddress.address;
//             const finalTotalDelegatedAmount = userStake + userStake;

//             // Alice assigns doorman contract as an operator, and stakes 100 MVK
//             await signerFactory(alice.sk);
//             const aliceUpdateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//                 {
//                     add_operator: {
//                         owner    : alice.pkh,
//                         operator : doormanContractAddress,
//                         token_id : 0,
//                     },
//                 }])
//                 .send()
//             await aliceUpdateOperatorsOperation.confirmation();
//             const aliceStakeAmountOperation = await doormanInstance.methods.stake(userStake).send();
//             await aliceStakeAmountOperation.confirmation();

//             // Eve assigns doorman contract as an operator, and stakes 100 MVK
//             await signerFactory(eve.sk);
//             const eveUpdateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//                 {
//                     add_operator: {
//                         owner    : eve.pkh,
//                         operator : doormanContractAddress,
//                         token_id : 0,
//                     },
//                 }])
//                 .send()
//             await eveUpdateOperatorsOperation.confirmation();
//             const eveStakeAmountOperation = await doormanInstance.methods.stake(userStake).send();
//             await eveStakeAmountOperation.confirmation();

//             // Check that alice and eve has new staked balance of 100 MVK
//             const aliceStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);    // 100 MVK
//             const eveStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);    // 100 MVk
//             assert.equal(aliceStakedBalance.balance,  userStake);
//             assert.equal(eveStakedBalance.balance,  userStake);

//             // Alice delegates to Bob's Satellite
//             await signerFactory(alice.sk);
//             const aliceDelegatesToBobSatelliteOperation = await delegationInstance.methods.delegateToSatellite(bob.pkh).send();
//             await aliceDelegatesToBobSatelliteOperation.confirmation();

//             // Eve delegates to Bob's Satellite
//             await signerFactory(eve.sk);
//             const eveDelegatesToBobSatelliteOperation = await delegationInstance.methods.delegateToSatellite(bob.pkh).send();
//             await eveDelegatesToBobSatelliteOperation.confirmation();
            
//             // Check that total Delegated Amount is equal to Alice's and Eve's combined staked balance
//             const bobSatellite  = await delegationStorage.satelliteLedger.get(bob.pkh); 
//             assert.equal(bobSatellite.totalDelegatedAmount, finalTotalDelegatedAmount);
        
//         } catch(e){
//             console.log(e);
//         } 
//     });

//     it('alice redelegates from bob to mallory satellite', async () => {
//         try{        

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Alice redelegates from Bob's to Mallory's Satellite") 
//             console.log("---") // break

//             // init values
//             const userStake               = MVK(100);
//             const doormanContractAddress  = doormanAddress.address;
//             const satelliteName           = "Mallory's Satellite";
//             const satelliteDescription    = "Mallory's Satellite Description";
//             const satelliteImage          = "https://placeholder.com/300";
//             const satelliteFee            = "700";

//             // Mallory assigns doorman contract as an operator
//             await signerFactory(mallory.sk);
//             const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//             {
//                 add_operator: {
//                     owner    : mallory.pkh,
//                     operator : doormanContractAddress,
//                     token_id : 0,
//                 },
//             }])
//             .send()
//             await updateOperatorsOperation.confirmation();

//             // Mallory stake 100 MVK tokens
//             const stakeAmountOperation = await doormanInstance.methods.stake(userStake).send();
//             await stakeAmountOperation.confirmation();

//             // Check state before registering as satellite
//             const mallorySatelliteExists   = await delegationStorage.satelliteLedger.get(mallory.pkh);        // should return null or undefined
//             const malloryStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(mallory.pkh);    // 100 MVK
//             assert.equal(mallorySatelliteExists,         null);
//             assert.equal(malloryStakedBalance.balance,  userStake);

//             // Mallory registers as a satellite
//             const registerAsSatelliteOperation = await delegationInstance.methods
//                 .registerAsSatellite(
//                     satelliteName, 
//                     satelliteDescription, 
//                     satelliteImage, 
//                     satelliteFee
//                 ).send();
//             await registerAsSatelliteOperation.confirmation();

//             // Check state after registering as satellite
//             const mallorySatellite         = await delegationStorage.satelliteLedger.get(mallory.pkh);         

//             // Mallory's satellite details
//             assert.equal(mallorySatellite.name,                   satelliteName);
//             assert.equal(mallorySatellite.description,            satelliteDescription);
//             assert.equal(mallorySatellite.stakedMvkBalance,       userStake);
//             assert.equal(mallorySatellite.satelliteFee,           satelliteFee);
//             assert.equal(mallorySatellite.totalDelegatedAmount,   0);
//             assert.equal(mallorySatellite.status,                 1);

//             // Alice redelegates from Bob to Mallory's Satellite
//             await signerFactory(alice.sk);        
//             const aliceDelegatesToMallorySatelliteOperation = await delegationInstance.methods.delegateToSatellite(mallory.pkh).send();
//             await aliceDelegatesToMallorySatelliteOperation.confirmation();
            
//             // Check details of satellite
//             const bobSatellite         = await delegationStorage.satelliteLedger.get(bob.pkh);         
//             assert.equal(bobSatellite.totalDelegatedAmount, userStake); // from eve's staked balance in previous test

//             // Check state after registering as satellite
//             const updatedMallorySatellite     = await delegationStorage.satelliteLedger.get(mallory.pkh);         
//             assert.equal(updatedMallorySatellite.totalDelegatedAmount, userStake); // from alice's delegation

//         } catch(e){
//             console.log(e);
//         } 
//     });

//     it('bob cannot delegate to another satellite as a satellite', async () => {
//         try{        

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Bob cannot delegate to another satellite as a satellite") 
//             console.log("---") // break

//             // Bob tries to delegate to mallory's satellite
//             await signerFactory(bob.sk); 
//             const failDelegateToSatelliteAsSatelliteOperation = await delegationInstance.methods.delegateToSatellite(mallory.pkh);    
//             await chai.expect(failDelegateToSatelliteAsSatelliteOperation.send()).to.be.eventually.rejected;
            
//             // Check state for mallory satellite remains unchanged
//             const mallorySatellite     = await delegationStorage.satelliteLedger.get(mallory.pkh);         
//             assert.equal(mallorySatellite.totalDelegatedAmount, MVK(100)); // from alice's delegation in previous test
        
//         } catch(e){
//             console.log(e);
//         } 
//     });


//     it('eve can undelegate from bob satellite', async () => {
//         try{        

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Eve can undelegate from bob's satellite") 
//             console.log("---") // break

//             // init values
//             const userStake = MVK(100);

//             // Eve undelegates from Bob's satellite
//             await signerFactory(eve.sk);               
//             const eveUndelegatesFromBobSatelliteOperation = await delegationInstance.methods.undelegateFromSatellite(bob.pkh).send();
//             await eveUndelegatesFromBobSatelliteOperation.confirmation();
            
//             // Check details of satellite
//             const bobSatellite         = await delegationStorage.satelliteLedger.get(bob.pkh);         
//             assert.equal(bobSatellite.totalDelegatedAmount, 0)
            
//             // Check Eve's staked balance remains unchanged
//             const eveStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);    // 100 MVk; 
//             assert.equal(eveStakedBalance.balance, userStake);

//         } catch(e){
//             console.log(e);
//         } 
//     });

//     it('bob can unregister as a satellite (no delegates)', async () => {
//         try{        

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Bob can unregister as a satellite (no delegates)") 
//             console.log("---") // break

//             // init values
//             const userStake = MVK(100);

//             // Bob unregisters as a satellite
//             await signerFactory(bob.sk); 
//             const unregisterAsSatelliteOperation = await delegationInstance.methods.unregisterAsSatellite().send();
//             await unregisterAsSatelliteOperation.confirmation();

//             // Check state after unregistering as satellite
//             const bobSatelliteExists  = await delegationStorage.satelliteLedger.get(bob.pkh); // should return null or undefined
//             assert.equal(bobSatelliteExists,       null);

//         } catch(e){
//             console.log(e);
//         } 

//     });

//     it('bob cannot unregister twice as a satellite', async () => {
//         try{        
            
//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Bob cannot unregister twice as a satellite") 
//             console.log("---") // break

//             // Bob unregisters as a satellite again
//             await signerFactory(bob.sk); 
//             const failUnregisterAsSatelliteTwiceOperation = await delegationInstance.methods.unregisterAsSatellite();    
//             await chai.expect(failUnregisterAsSatelliteTwiceOperation.send()).to.be.eventually.rejected;

//         } catch(e){
//             console.log(e);
//         } 
//     });


//     it('mallory can unregister as a satellite (one delegate - alice)', async () => {
//         try{        

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Mallory can unregister as a satellite (one delegate - Alice)") 
//             console.log("---") // break

//             // init values
//             const userStake = MVK(100);

//             // Mallory unregisters as a satellite
//             await signerFactory(mallory.sk); 
//             const unregisterAsSatelliteOperation = await delegationInstance.methods.unregisterAsSatellite().send();
//             await unregisterAsSatelliteOperation.confirmation();

//             // Check state after unregistering as satellite
//             const mallorySatelliteExists  = await delegationStorage.satelliteLedger.get(mallory.pkh); // should return null or undefined
//             assert.equal(mallorySatelliteExists,       null);

//         } catch(e){
//             console.log(e);
//         } 

//     });


//     it('alice can undelegate from mallory satellite (after it has been unregistered)', async () => {
//         try{        

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Alice can undelegate from mallory's satellite (after it has been unregistered)") 
//             console.log("---") // break

//             // init values
//             const userStake = MVK(100);

//             // Alice undelegates from Mallory's satellite
//             await signerFactory(alice.sk);               
//             const aliceUndelegatesFromMallorySatelliteOperation = await delegationInstance.methods.undelegateFromSatellite(mallory.pkh).send();
//             await aliceUndelegatesFromMallorySatelliteOperation.confirmation();
            
//             // Satellite should not exist after it has been unregistered
//             const mallorySatelliteExists  = await delegationStorage.satelliteLedger.get(mallory.pkh); // should return null or undefined
//             assert.equal(mallorySatelliteExists, null);
            
//             // Check Alice's staked balance remains unchanged
//             const aliceStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);    // 100 MVk; 
//             assert.equal(aliceStakedBalance.balance, userStake);

//         } catch(e){
//             console.log(e);
//         } 
//     });


//     // it(`bob cannot unstake more than the minimum satellite bond requirement (e.g. 100 MVK)`, async () => {
//     //     try{

//     //         console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//     //         console.log("Test: Bob  cannot unstake more than the minimum satellite bond requirement (e.g. 100 MVK):") 
//     //         console.log("---") // break

//     //         // console.log('Storage test: console log checks  ----');
//     //         // console.log(delegationStorage);
//     //         // console.log(doormanStorage);
//     //         // console.log("Minimum Staked Balance: " + delegationStorage.config.minimumStakedMvkBalance);

//     //         const beforeDelegationLedgerBob  = await delegationStorage.satelliteLedger.get(bob.pkh);        // should return null or undefined
//     //         const beforeBobStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);    // BigNumber { s: 1, e: 8, c: [ 100000000 ] }
//     //         assert.equal(beforeDelegationLedgerBob.stakedMvkBalance, 100000000);
//     //         assert.equal(beforeBobStakedBalance, 100000000);
            
//     //         // console.log("Before test: console log checks ----")
//     //         // console.log(beforeDelegationLedgerBob);
//     //         // console.log(beforeBobStakedBalance);
             
//     //         // bob unstakes another 50 MVK tokens - 50,000,000 in muMVK
//     //         const failUnstakeOperation = await  doormanInstance.methods.unstake(50000000);
//     //         await chai.expect(failUnstakeOperation.send()).to.be.eventually.rejected;

//     //         const afterDelegationLedgerBob  = await delegationStorage.satelliteLedger.get(bob.pkh);         // should return bob's satellite record
//     //         const afterBobStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);     // should return BigNumber { s: 1, e: 8, c: [ 100000000 ] }
//     //         assert.equal(afterDelegationLedgerBob.stakedMvkBalance, 100000000);
//     //         assert.equal(afterBobStakedBalance, 100000000);
        
//     //         // console.log("After test: console log checks  ----")
//     //         // console.log(afterDelegationLedgerBob);
//     //         // console.log(afterBobStakedBalance);

//     //     } catch(e){
//     //         console.log(e);
//     //     }
//     // });
    

// });