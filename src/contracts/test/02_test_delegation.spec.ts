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
// import { alice, bob, eve } from "../scripts/sandbox/accounts";

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

//         // uncomment console logs if needed to visually check storage and details

//     });

//     it('alice can register as a satellite', async () => {
//         try{        

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Alice can register as a satellite") 
//             console.log("---") // break

//             // console.log('Storage test: console log checks  ----');
//             // console.log(delegationStorage);
//             // console.log(doormanStorage);

//             // Alice stake 100 MVK tokens - 100,000,000 in muMVK
//             const stakeAmountOperation = await doormanInstance.methods.stake(100000000).send();
//             await stakeAmountOperation.confirmation();

//             const beforeDelegationLedgerAlice  = await delegationStorage.satelliteLedger.get(alice.pkh);        // should return null or undefined
//             const beforeAliceStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);    // BigNumber { s: 1, e: 8, c: [ 100000000 ] }
//             assert.equal(beforeDelegationLedgerAlice, null);
//             assert.equal(beforeAliceStakedBalance, 100000000);

//             // console.log("Before test: console log checks ----")
//             // console.log(beforeDelegationLedgerAlice);
//             // console.log(beforeAliceStakedBalance);

//             // Alice registers as a satellite
//             const registerAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite("New Satellite", "New Satellite Description", "https://image.url", "700").send();
//             await registerAsSatelliteOperation.confirmation();

//             const afterDelegationLedgerAlice  = await delegationStorage.satelliteLedger.get(alice.pkh);         // should return alice's satellite record
//             const afterAliceStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);     // should return BigNumber { s: 1, e: 8, c: [ 100000000 ] }
//             assert.equal(afterDelegationLedgerAlice.mvkBalance, 100000000);
//             assert.equal(afterAliceStakedBalance, 100000000);

//             // console.log("After test: console log checks  ----")
//             // console.log(afterDelegationLedgerAlice);
//             // console.log(afterAliceStakedBalance);

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

//     it(`alice stakes 100 MVK tokens and increases her satellite bond`, async () => {
//         try{

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Alice stakes 100 MVK tokens and increases her satellite bond:") 
//             console.log("---") // break

//             // console.log('Storage test: console log checks  ----');
//             // console.log(delegationStorage);
//             // console.log(doormanStorage);

//             const beforeDelegationLedgerAlice  = await delegationStorage.satelliteLedger.get(alice.pkh);        // should return null or undefined
//             const beforeAliceStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);    // BigNumber { s: 1, e: 8, c: [ 100000000 ] }
//             assert.equal(beforeDelegationLedgerAlice.mvkBalance, 100000000);
//             assert.equal(beforeAliceStakedBalance, 100000000);
            
//             // console.log("Before test: console log checks ----")
//             // console.log(beforeDelegationLedgerAlice);
//             // console.log(beforeAliceStakedBalance);
             
//             // alice stake another 100 MVK tokens - 100,000,000 in muMVK
//             const stakeAmountOperation = await doormanInstance.methods.stake(100000000).send();
//             await stakeAmountOperation.confirmation();
            
//             const afterDelegationLedgerAlice  = await delegationStorage.satelliteLedger.get(alice.pkh);         // should return alice's satellite record
//             const afterAliceStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);     // should return BigNumber { s: 1, e: 8, c: [ 100000000 ] }
//             assert.equal(afterDelegationLedgerAlice.mvkBalance, 200000000);
//             assert.equal(afterAliceStakedBalance, 200000000);
        
//             // console.log("After test: console log checks  ----")
//             // console.log(afterDelegationLedgerAlice);
//             // console.log(afterAliceStakedBalance);

//         } catch(e){
//             console.log(e);
//         }
//     });

//     it(`alice unstakes 100 MVK tokens and decreases her satellite bond`, async () => {
//         try{

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Alice unstakes 100 MVK tokens and increases her satellite bond:") 
//             console.log("---") // break

//             // console.log('Storage test: console log checks  ----');
//             // console.log(delegationStorage);
//             // console.log(doormanStorage);

//             const beforeDelegationLedgerAlice  = await delegationStorage.satelliteLedger.get(alice.pkh);        // should return null or undefined
//             const beforeAliceStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);    // BigNumber { s: 1, e: 8, c: [ 100000000 ] }
//             assert.equal(beforeDelegationLedgerAlice.mvkBalance, 200000000);
//             assert.equal(beforeAliceStakedBalance, 200000000);
            
//             // console.log("Before test: console log checks ----")
//             // console.log(beforeDelegationLedgerAlice);
//             // console.log(beforeAliceStakedBalance);
             
//             // alice unstakes 100 MVK tokens - 100,000,000 in muMVK
//             // 
//             // total MVK = 1000 MVK tokens | total staked MVK - 200 MVK tokens | MLI = (200 / 1000) * 100 = 20 
//             //exit fee = 500 / (20+5) = 20% | final amount = (100% - 20%) * 100 MVK = 80 MVK
//             const unstakeAmountOperation = await doormanInstance.methods.unstake(100000000).send();
//             await unstakeAmountOperation.confirmation();
            
//             const afterDoormanStorage         = await doormanInstance.storage();
//             const afterDelegationLedgerAlice  = await delegationStorage.satelliteLedger.get(alice.pkh);         // should return alice's satellite record
//             const afterAliceStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);     // should return BigNumber { s: 1, e: 8, c: [ 100000000 ] }
//             assert.equal(afterDelegationLedgerAlice.mvkBalance, 100000000);
//             assert.equal(afterAliceStakedBalance, 100000000);
        
//             // console.log("After test: console log checks  ----")
//             // console.log(afterDoormanStorage);
//             // console.log(afterDelegationLedgerAlice);
//             // console.log(afterAliceStakedBalance);

//         } catch(e){
//             console.log(e);
//         }
//     });

//     it(`alice  cannot unstake more than the minimum satellite bond requirement (e.g. 100 MVK)`, async () => {
//         try{

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Alice  cannot unstake more than the minimum satellite bond requirement (e.g. 100 MVK):") 
//             console.log("---") // break

//             // console.log('Storage test: console log checks  ----');
//             // console.log(delegationStorage);
//             // console.log(doormanStorage);
//             // console.log("Minimum Staked Balance: " + delegationStorage.config.minimumStakedMvkBalance);

//             const beforeDelegationLedgerAlice  = await delegationStorage.satelliteLedger.get(alice.pkh);        // should return null or undefined
//             const beforeAliceStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);    // BigNumber { s: 1, e: 8, c: [ 100000000 ] }
//             assert.equal(beforeDelegationLedgerAlice.mvkBalance, 100000000);
//             assert.equal(beforeAliceStakedBalance, 100000000);
            
//             // console.log("Before test: console log checks ----")
//             // console.log(beforeDelegationLedgerAlice);
//             // console.log(beforeAliceStakedBalance);
             
//             // alice unstakes another 50 MVK tokens - 50,000,000 in muMVK
//             const failUnstakeOperation = await  doormanInstance.methods.unstake(50000000);
//             await chai.expect(failUnstakeOperation.send()).to.be.eventually.rejected;

//             const afterDelegationLedgerAlice  = await delegationStorage.satelliteLedger.get(alice.pkh);         // should return alice's satellite record
//             const afterAliceStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);     // should return BigNumber { s: 1, e: 8, c: [ 100000000 ] }
//             assert.equal(afterDelegationLedgerAlice.mvkBalance, 100000000);
//             assert.equal(afterAliceStakedBalance, 100000000);
        
//             // console.log("After test: console log checks  ----")
//             // console.log(afterDelegationLedgerAlice);
//             // console.log(afterAliceStakedBalance);

//         } catch(e){
//             console.log(e);
//         }
//     });

//     it('bob and eve can delegate to alice satellite', async () => {
//         try{        

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Bob and Eve can delegate to alice's satellite") 
//             console.log("---") // break

//             // console.log('Storage test: console log checks  ----');
//             // console.log(delegationStorage);
//             // console.log(doormanStorage);

//             await signerFactory(bob.sk);
//             const bobStakeAmountOperation = await doormanInstance.methods.stake(100000000).send();
//             await bobStakeAmountOperation.confirmation();

//             const afterDoormanStorage = await doormanInstance.storage();            
            
//             // const afterDoormanBobUserStakeRecords    = await afterDoormanStorage.userStakeRecordsLedger.get(bob.pkh); // return user staking records - map(nat, stakeRecordType)        
//             // const afterDoormanBobUserStakeBalance    = await afterDoormanStorage.userStakeBalanceLedger.get(bob.pkh); // return user staking records - map(nat, stakeRecordType)        
//             // console.log('Bob stake balance: '+afterDoormanBobUserStakeBalance);
//             // console.log(afterDoormanBobUserStakeRecords);
            
//             const bobDelegatesToAliceSatelliteOperation = await delegationInstance.methods.delegateToSatellite(alice.pkh).send();
//             const delegateConfirmation = await bobDelegatesToAliceSatelliteOperation.confirmation();
            
//             const afterDelegationStorage = await delegationInstance.storage();            
            
//             // const bobDelegateRecord = await afterDelegationStorage.delegateLedger.get(bob.pkh);
//             // console.log(bobDelegateRecord);

//             /** eve wallet not loaded in docket - empty_implicit_account error */
//             // const eveWallet = await signerFactory(eve.sk);
//             // const afterMvkLedgerEve            = await mvkTokenStorage.ledger.get(eve.pkh);
//             // console.log(afterMvkLedgerEve)
//             // const eveStakeAmountOperation = await doormanInstance.methods.stake(100000000).send();
//             // await eveStakeAmountOperation.confirmation();
//             // const afterDoormanEveUserStakeRecords    = await afterDoormanStorage.userStakeRecordsLedger.get(eve.pkh); // return user staking records - map(nat, stakeRecordType)        
//             // const afterDoormanEveUserStakeBalance    = await afterDoormanStorage.userStakeBalanceLedger.get(eve.pkh); // return user staked balance 
//             // console.log('Eve stake balance: '+afterDoormanEveUserStakeBalance);
//             // console.log(afterDoormanEveUserStakeRecords);
//             // const eveDelegatesToAliceSatelliteOperation = await delegationInstance.methods.delegateToSatellite(alice.pkh).send();
//             // await eveDelegatesToAliceSatelliteOperation.confirmation();

//             const afterDelegationLedgerAlice  = await delegationStorage.satelliteLedger.get(alice.pkh);         // should return alice's satellite record
//             assert.equal(afterDelegationLedgerAlice.totalDelegatedAmount, 100000000);
        
//             // console.log("After test: console log checks  ----")
//             // console.log(afterDelegationLedgerAlice);
//             // console.log('Alice Satellite total delegated amount: '+afterDelegationLedgerAlice.totalDelegatedAmount);
//             // console.log(afterAliceStakedBalance);

//             await signerFactory(alice.sk);

//         } catch(e){
//             console.log(e);
//         } 
//     });

//     it('bob and eve can undelegate from alice satellite', async () => {
//         try{        

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Bob and Eve can undelegate from alice's satellite") 
//             console.log("---") // break

//             // console.log('Storage test: console log checks  ----');
//             // console.log(delegationStorage);
//             // console.log(doormanStorage);

//             await signerFactory(bob.sk);               
            
//             const bobUndelegatesFromAliceSatelliteOperation = await delegationInstance.methods.undelegateFromSatellite(alice.pkh).send();
//             const delegateConfirmation = await bobUndelegatesFromAliceSatelliteOperation.confirmation();
            
//             const afterDelegationStorage = await delegationInstance.storage();            
            
//             // const bobDelegateRecord = await afterDelegationStorage.delegateLedger.get(bob.pkh);

//             /** eve wallet not loaded in docket - empty_implicit_account error */
//             // const eveWallet = await signerFactory(eve.sk);
//             // const afterMvkLedgerEve            = await mvkTokenStorage.ledger.get(eve.pkh);
//             // console.log(afterMvkLedgerEve)
//             // const eveStakeAmountOperation = await doormanInstance.methods.stake(100000000).send();
//             // await eveStakeAmountOperation.confirmation();
//             // const afterDoormanEveUserStakeRecords    = await afterDoormanStorage.userStakeRecordsLedger.get(eve.pkh); // return user staking records - map(nat, stakeRecordType)        
//             // const afterDoormanEveUserStakeBalance    = await afterDoormanStorage.userStakeBalanceLedger.get(eve.pkh); // return user staked balance 
//             // console.log('Eve stake balance: '+afterDoormanEveUserStakeBalance);
//             // console.log(afterDoormanEveUserStakeRecords);
//             // const eveDelegatesToAliceSatelliteOperation = await delegationInstance.methods.delegateToSatellite(alice.pkh).send();
//             // await eveDelegatesToAliceSatelliteOperation.confirmation();

//             const afterDelegationLedgerAlice  = await delegationStorage.satelliteLedger.get(alice.pkh);         // should return alice's satellite record
//             assert.equal(afterDelegationLedgerAlice.totalDelegatedAmount, 0);
        
//             // console.log("After test: console log checks  ----")
//             // console.log(afterDelegationLedgerAlice);
//             // console.log('Alice Satellite total delegated amount: '+afterDelegationLedgerAlice.totalDelegatedAmount);
//             // console.log(afterAliceStakedBalance);

//             await signerFactory(alice.sk);

//         } catch(e){
//             console.log(e);
//         } 
//     });

//     // it('alice can unregister as a satellite', async () => {
//     //     try{        

//     //         console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//     //         console.log("Test: Alice can unregister as a satellite") 
//     //         console.log("---") // break

//     //         // console.log('Storage test: console log checks  ----');
//     //         // console.log(delegationStorage);
//     //         // console.log(doormanStorage);

//     //         // console.log("Before test: console log checks ----")
//     //         // const beforeDelegationLedgerAlice  = await delegationStorage.satelliteLedger.get(alice.pkh);        // should return null or undefined
//     //         // const beforeAliceStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);    // BigNumber { s: 1, e: 8, c: [ 100000000 ] }
//     //         // console.log(beforeDelegationLedgerAlice);
//     //         // console.log(beforeAliceStakedBalance);

//     //         // Alice registers as a satellite
//     //         const unregisterAsSatelliteOperation = await delegationInstance.methods.unregisterAsSatellite().send();
//     //         await unregisterAsSatelliteOperation.confirmation();

//     //         // const afterDelegationSatelliteStorage  = await delegationStorage.satelliteLedger;
//     //         // console.log(afterDelegationSatelliteStorage);

//     //         // const afterDelegationLedgerAlice  = await delegationStorage.satelliteLedger.get(alice.pkh);         // should return alice's satellite record
//     //         // const afterAliceStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);     // should return BigNumber { s: 1, e: 8, c: [ 100000000 ] }
//     //         // assert.equal(afterDelegationLedgerAlice.mvkBalance, 100000000);
//     //         // assert.equal(afterAliceStakedBalance, 100000000);
//     //         // console.log("After test: console log checks  ----")
//     //         // console.log(afterDelegationLedgerAlice);
//     //         // console.log(afterAliceStakedBalance);

//     //     } catch(e){
//     //         console.log(e);
//     //     } 

//     // });
    

// });