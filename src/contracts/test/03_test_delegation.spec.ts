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
// import { alice, bob, eve, mallory } from "../scripts/sandbox/accounts";

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
//         await utils.init(alice.sk);
        
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
//         console.log('Alice address: ' + alice.pkh);
//         console.log('Bob address: ' + bob.pkh);
//         console.log('Eve address: ' + eve.pkh);

//         tezos = doormanInstance.tezos;

//     });

//     it('alice can register as a satellite', async () => {
//         try{        

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Alice can register as a satellite") 
//             console.log("---") // break

//             // init values
//             const userStake               = MVK(100);
//             const doormanContractAddress  = doormanAddress.address;
//             const satelliteName           = "New Satellite (Alice)";
//             const satelliteDescription    = "New Satellite Description (Alice)";
//             const satelliteImage          = "https://placeholder.com/300";
//             const satelliteFee            = "700";

//             // Alice assigns doorman contract as an operator
//             await signerFactory(alice.sk);
//             const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//             {
//                 add_operator: {
//                     owner    : alice.pkh,
//                     operator : doormanContractAddress,
//                     token_id : 0,
//                 },
//             }])
//             .send()
//             await updateOperatorsOperation.confirmation();

//             // Alice stake 100 MVK tokens
//             const stakeAmountOperation = await doormanInstance.methods.stake(userStake).send();
//             await stakeAmountOperation.confirmation();

//             // Check state before registering as satellite
//             const beforeDelegationLedgerAlice  = await delegationStorage.satelliteLedger.get(alice.pkh);        // should return null or undefined
//             const beforeAliceStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);    // 100 MVK
//             assert.equal(beforeDelegationLedgerAlice,       null);
//             assert.equal(beforeAliceStakedBalance.balance,  userStake);

//             // Alice registers as a satellite
//             const registerAsSatelliteOperation = await delegationInstance.methods
//                 .registerAsSatellite(
//                     satelliteName, 
//                     satelliteDescription, 
//                     satelliteImage, 
//                     satelliteFee
//                 ).send();
//             await registerAsSatelliteOperation.confirmation();

//             // Check state after registering as satellite
//             const afterDelegationLedgerAlice  = await delegationStorage.satelliteLedger.get(alice.pkh);         // should return alice's satellite record
//             const afterAliceStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);     // 100 MVK
            
//             // Alice's satellite details
//             assert.equal(afterDelegationLedgerAlice.name,                   satelliteName);
//             assert.equal(afterDelegationLedgerAlice.description,            satelliteDescription);
//             assert.equal(afterDelegationLedgerAlice.stakedMvkBalance,       userStake);
//             assert.equal(afterDelegationLedgerAlice.satelliteFee,           satelliteFee);
//             assert.equal(afterDelegationLedgerAlice.totalDelegatedAmount,   0);
//             assert.equal(afterDelegationLedgerAlice.status,                 1);

//             // Alice's staked balance remains the same
//             assert.equal(afterAliceStakedBalance.balance, userStake);

//         } catch(e){
//             console.log(e);
//         } 

//     });

//     it('alice cannot register twice as a satellite', async () => {
//         try{        
            
//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Alice cannot register twice as a satellite") 
//             console.log("---") // break

//             const failRegisterAsSatelliteTwiceOperation = await delegationInstance.methods.registerAsSatellite("New Satellite", "New Satellite Description", "https://image.url", "700");    
//             await chai.expect(failRegisterAsSatelliteTwiceOperation.send()).to.be.eventually.rejected;

//         } catch(e){
//             console.log(e);
//         } 
//     });

//     it(`alice stakes another 100 MVK tokens and increases her satellite bond`, async () => {
//         try{

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Alice stakes another 100 MVK tokens and increases her satellite bond:") 
//             console.log("---") // break

//             // init values
//             const userStake               = MVK(100);
//             const newUserStakedBalance    = MVK(200);

//             // Check state before stake action
//             const beforeDelegationLedgerAlice  = await delegationStorage.satelliteLedger.get(alice.pkh);        // should return null or undefined
//             const beforeAliceStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);    // BigNumber { s: 1, e: 8, c: [ 100000000 ] }
//             assert.equal(beforeDelegationLedgerAlice.stakedMvkBalance, userStake);
//             assert.equal(beforeAliceStakedBalance.balance,             userStake);
             
//             // alice stake another 100 MVK tokens 
//             const stakeAmountOperation = await doormanInstance.methods.stake(userStake).send();
//             await stakeAmountOperation.confirmation();
            
//             // Check state after stake action
//             const afterDelegationLedgerAlice  = await delegationStorage.satelliteLedger.get(alice.pkh);         // should return alice's satellite record
//             const afterAliceStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);     // should return BigNumber { s: 1, e: 8, c: [ 100000000 ] }
//             assert.equal(afterDelegationLedgerAlice.stakedMvkBalance, newUserStakedBalance);
//             assert.equal(afterAliceStakedBalance.balance,             newUserStakedBalance);
        
//         } catch(e){
//             console.log(e);
//         }
//     });

//     it(`alice unstakes 100 MVK tokens and decreases her satellite bond`, async () => {
//         try{

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Alice unstakes 100 MVK tokens and decreases her satellite bond:") 
//             console.log("---") // break

//             // init values
//             const userUnstake             = MVK(100);
//             const oldUserStakedBalance    = MVK(200);

//             // Check state before unstake action
//             const beforeDelegationLedgerAlice  = await delegationStorage.satelliteLedger.get(alice.pkh);        // should return null or undefined
//             const beforeAliceStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);    // BigNumber { s: 1, e: 8, c: [ 100000000 ] }
//             assert.equal(beforeDelegationLedgerAlice.stakedMvkBalance, oldUserStakedBalance);
//             assert.equal(beforeAliceStakedBalance.balance,             oldUserStakedBalance);
            
//             // alice unstakes 100 MVK tokens 
//             const unstakeAmountOperation = await doormanInstance.methods.unstake(userUnstake).send();
//             await unstakeAmountOperation.confirmation();
            
//             // Check state after unstake action
//             const afterDelegationLedgerAlice  = await delegationStorage.satelliteLedger.get(alice.pkh);         // should return alice's satellite record
//             const afterAliceStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);     // should return BigNumber { s: 1, e: 8, c: [ 100000000 ] }
//             assert.notEqual(afterDelegationLedgerAlice.stakedMvkBalance, oldUserStakedBalance);
//             assert.notEqual(afterAliceStakedBalance.balance,             oldUserStakedBalance);

//         } catch(e){
//             console.log(e);
//         }
//     });

//     it('bob and eve can delegate to alice satellite', async () => {
//         try{        

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Bob and Eve can delegate to Alice's satellite") 
//             console.log("---") // break

//             // init values
//             const userStake                 = MVK(100);
//             const doormanContractAddress    = doormanAddress.address;
//             const finalTotalDelegatedAmount = userStake + userStake;

//             // Bob assigns doorman contract as an operator, and stakes 100 MVK
//             await signerFactory(bob.sk);
//             const bobUpdateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//                 {
//                     add_operator: {
//                         owner    : bob.pkh,
//                         operator : doormanContractAddress,
//                         token_id : 0,
//                     },
//                 }])
//                 .send()
//             await bobUpdateOperatorsOperation.confirmation();
//             const bobStakeAmountOperation = await doormanInstance.methods.stake(userStake).send();
//             await bobStakeAmountOperation.confirmation();

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

//             // Check that bob and eve has new staked balance of 100 MVK
//             const bobStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);    // 100 MVK
//             const eveStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);    // 100 MVk
//             assert.equal(bobStakedBalance.balance,  userStake);
//             assert.equal(eveStakedBalance.balance,  userStake);

//             // Bob delegates to Alice's Satellite
//             await signerFactory(bob.sk);
//             const bobDelegatesToAliceSatelliteOperation = await delegationInstance.methods.delegateToSatellite(alice.pkh).send();
//             await bobDelegatesToAliceSatelliteOperation.confirmation();

//             // Eve delegates to Alice's Satellite
//             await signerFactory(eve.sk);
//             const eveDelegatesToAliceSatelliteOperation = await delegationInstance.methods.delegateToSatellite(alice.pkh).send();
//             await eveDelegatesToAliceSatelliteOperation.confirmation();
            
//             // Check that total Delegated Amount is equal to Bob's and Eve's combined staked balance
//             const aliceSatellite  = await delegationStorage.satelliteLedger.get(alice.pkh); 
//             assert.equal(aliceSatellite.totalDelegatedAmount, finalTotalDelegatedAmount);
        
//         } catch(e){
//             console.log(e);
//         } 
//     });

//     it('bob redelegates from alice to mallory satellite', async () => {
//         try{        

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Bob redelegates from Alice's to Mallory's Satellite") 
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

//             // Bob redelegates from Alice to Mallory's Satellite
//             await signerFactory(bob.sk);        
//             const bobDelegatesToMallorySatelliteOperation = await delegationInstance.methods.delegateToSatellite(mallory.pkh).send();
//             await bobDelegatesToMallorySatelliteOperation.confirmation();
            
//             // Check details of satellite
//             const aliceSatellite         = await delegationStorage.satelliteLedger.get(alice.pkh);         
//             assert.equal(aliceSatellite.totalDelegatedAmount, userStake); // from eve's staked balance in previous test

//             // Check state after registering as satellite
//             const updatedMallorySatellite     = await delegationStorage.satelliteLedger.get(mallory.pkh);         
//             assert.equal(updatedMallorySatellite.totalDelegatedAmount, userStake); // from bob's delegation

//         } catch(e){
//             console.log(e);
//         } 
//     });

//     it('alice cannot delegate to another satellite as a satellite', async () => {
//         try{        

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Alice cannot delegate to another satellite as a satellite") 
//             console.log("---") // break

//             // Alice tries to delegate to mallory's satellite
//             await signerFactory(alice.sk); 
//             const failDelegateToSatelliteAsSatelliteOperation = await delegationInstance.methods.delegateToSatellite(mallory.pkh);    
//             await chai.expect(failDelegateToSatelliteAsSatelliteOperation.send()).to.be.eventually.rejected;
            
//             // Check state for mallory satellite remains unchanged
//             const mallorySatellite     = await delegationStorage.satelliteLedger.get(mallory.pkh);         
//             assert.equal(mallorySatellite.totalDelegatedAmount, MVK(100)); // from bob's delegation in previous test
        
//         } catch(e){
//             console.log(e);
//         } 
//     });


//     it('eve can undelegate from alice satellite', async () => {
//         try{        

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Eve can undelegate from alice's satellite") 
//             console.log("---") // break

//             // init values
//             const userStake = MVK(100);

//             // Eve undelegates from Alice's satellite
//             await signerFactory(eve.sk);               
//             const eveUndelegatesFromAliceSatelliteOperation = await delegationInstance.methods.undelegateFromSatellite(alice.pkh).send();
//             await eveUndelegatesFromAliceSatelliteOperation.confirmation();
            
//             // Check details of satellite
//             const aliceSatellite         = await delegationStorage.satelliteLedger.get(alice.pkh);         
//             assert.equal(aliceSatellite.totalDelegatedAmount, 0)
            
//             // Check Eve's staked balance remains unchanged
//             const eveStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);    // 100 MVk; 
//             assert.equal(eveStakedBalance.balance, userStake);

//         } catch(e){
//             console.log(e);
//         } 
//     });

//     it('alice can unregister as a satellite (no delegates)', async () => {
//         try{        

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Alice can unregister as a satellite (no delegates)") 
//             console.log("---") // break

//             // init values
//             const userStake = MVK(100);

//             // Alice unregisters as a satellite
//             await signerFactory(alice.sk); 
//             const unregisterAsSatelliteOperation = await delegationInstance.methods.unregisterAsSatellite().send();
//             await unregisterAsSatelliteOperation.confirmation();

//             // Check state after unregistering as satellite
//             const aliceSatelliteExists  = await delegationStorage.satelliteLedger.get(alice.pkh); // should return null or undefined
//             assert.equal(aliceSatelliteExists,       null);

//         } catch(e){
//             console.log(e);
//         } 

//     });

//     it('alice cannot unregister twice as a satellite', async () => {
//         try{        
            
//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Alice cannot unregister twice as a satellite") 
//             console.log("---") // break

//             // Alice unregisters as a satellite again
//             await signerFactory(alice.sk); 
//             const failUnregisterAsSatelliteTwiceOperation = await delegationInstance.methods.unregisterAsSatellite();    
//             await chai.expect(failUnregisterAsSatelliteTwiceOperation.send()).to.be.eventually.rejected;

//         } catch(e){
//             console.log(e);
//         } 
//     });


//     it('mallory can unregister as a satellite (one delegate - bob)', async () => {
//         try{        

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Mallory can unregister as a satellite (one delegate - Bob)") 
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


//     it('bob can undelegate from mallory satellite (after it has been unregistered)', async () => {
//         try{        

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Bob can undelegate from mallory's satellite (after it has been unregistered)") 
//             console.log("---") // break

//             // init values
//             const userStake = MVK(100);

//             // Bob undelegates from Mallory's satellite
//             await signerFactory(bob.sk);               
//             const bobUndelegatesFromMallorySatelliteOperation = await delegationInstance.methods.undelegateFromSatellite(mallory.pkh).send();
//             await bobUndelegatesFromMallorySatelliteOperation.confirmation();
            
//             // Satellite should not exist after it has been unregistered
//             const mallorySatelliteExists  = await delegationStorage.satelliteLedger.get(mallory.pkh); // should return null or undefined
//             assert.equal(mallorySatelliteExists, null);
            
//             // Check Bob's staked balance remains unchanged
//             const bobStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);    // 100 MVk; 
//             assert.equal(bobStakedBalance.balance, userStake);

//         } catch(e){
//             console.log(e);
//         } 
//     });


//     // it(`alice cannot unstake more than the minimum satellite bond requirement (e.g. 100 MVK)`, async () => {
//     //     try{

//     //         console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//     //         console.log("Test: Alice  cannot unstake more than the minimum satellite bond requirement (e.g. 100 MVK):") 
//     //         console.log("---") // break

//     //         // console.log('Storage test: console log checks  ----');
//     //         // console.log(delegationStorage);
//     //         // console.log(doormanStorage);
//     //         // console.log("Minimum Staked Balance: " + delegationStorage.config.minimumStakedMvkBalance);

//     //         const beforeDelegationLedgerAlice  = await delegationStorage.satelliteLedger.get(alice.pkh);        // should return null or undefined
//     //         const beforeAliceStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);    // BigNumber { s: 1, e: 8, c: [ 100000000 ] }
//     //         assert.equal(beforeDelegationLedgerAlice.stakedMvkBalance, 100000000);
//     //         assert.equal(beforeAliceStakedBalance, 100000000);
            
//     //         // console.log("Before test: console log checks ----")
//     //         // console.log(beforeDelegationLedgerAlice);
//     //         // console.log(beforeAliceStakedBalance);
             
//     //         // alice unstakes another 50 MVK tokens - 50,000,000 in muMVK
//     //         const failUnstakeOperation = await  doormanInstance.methods.unstake(50000000);
//     //         await chai.expect(failUnstakeOperation.send()).to.be.eventually.rejected;

//     //         const afterDelegationLedgerAlice  = await delegationStorage.satelliteLedger.get(alice.pkh);         // should return alice's satellite record
//     //         const afterAliceStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);     // should return BigNumber { s: 1, e: 8, c: [ 100000000 ] }
//     //         assert.equal(afterDelegationLedgerAlice.stakedMvkBalance, 100000000);
//     //         assert.equal(afterAliceStakedBalance, 100000000);
        
//     //         // console.log("After test: console log checks  ----")
//     //         // console.log(afterDelegationLedgerAlice);
//     //         // console.log(afterAliceStakedBalance);

//     //     } catch(e){
//     //         console.log(e);
//     //     }
//     // });
    

// });