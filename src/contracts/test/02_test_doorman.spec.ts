const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
const { InMemorySigner, importKey } = require("@taquito/signer");
import assert, { ok, rejects, strictEqual } from "assert";
import { Utils, zeroAddress } from "./helpers/Utils";
import fs from "fs";
import { confirmOperation } from "../scripts/confirmation";

const chai = require("chai");
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

import env from "../env";
import { alice, bob } from "../scripts/sandbox/accounts";

import doormanAddress from '../deployments/doormanAddress.json';
import delegationAddress from '../deployments/delegationAddress.json';
import mvkTokenAddress from '../deployments/mvkTokenAddress.json';

describe("Doorman tests", async () => {
  var utils: Utils;

  let doormanInstance;
  let delegationInstance;
  let mvkTokenInstance;

  let doormanStorage;
  let delegationStorage;
  let mvkTokenStorage;
  
  const signerFactory = async (pk) => {
    await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
    return utils.tezos;
  };

  before("setup", async () => {

    utils = new Utils();
    await utils.init(alice.sk);
    
    doormanInstance    = await utils.tezos.contract.at(doormanAddress.address);
    delegationInstance = await utils.tezos.contract.at(delegationAddress.address);
    mvkTokenInstance   = await utils.tezos.contract.at(mvkTokenAddress.address);
        
    doormanStorage    = await doormanInstance.storage();
    delegationStorage = await delegationInstance.storage();
    mvkTokenStorage   = await mvkTokenInstance.storage();

    console.log('-- -- -- -- -- Doorman Tests -- -- -- --')
    console.log('Doorman Contract deployed at:', doormanInstance.address);
    console.log('Delegation Contract deployed at:', delegationInstance.address);
    console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
    console.log('Alice address: ' + alice.pkh);
    console.log('Bob address: ' + bob.pkh);

    // console.log('mvk token storage');
    // console.log(mvkTokenStorage);

  });

//   it("set admin to bob", async () => {
//     try {
//         console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//         console.log('Test: Set Admin to Bob')
//         console.log("---") // break

//         // console.log('before: Admin should be alice address: '+ doormanStorage.admin); // return alice.pkh        
//         const setAdminAddressOperation = await doormanInstance.methods.setAdmin(bob.pkh).send();
//         await setAdminAddressOperation.confirmation();
//         doormanStorage = await doormanInstance.storage();
//         assert.equal(doormanStorage.admin, bob.pkh);
//         // console.log('after: Admin should be bob address: '+ doormanStorage.admin); // return bob.pkh        

//         // // reset state back to alice as admin
//         await signerFactory(bob.sk);
//         // console.log('before: Admin should be bob address: '+ doormanStorage.admin); // return bob.pkh        
//         const resetAdminAddressOperation = await doormanInstance.methods.setAdmin(alice.pkh).send();
//         await resetAdminAddressOperation.confirmation();

//         doormanStorage = await doormanInstance.storage();
//         assert.equal(doormanStorage.admin, alice.pkh);
//         // console.log('after: Admin should be alice address: '+ doormanStorage.admin); // return alice.pkh        

//     } catch(e){
//         console.log(e)
//     }
//   });

//   it(`non-admin cannot set admin`, async () => {
//     try{
        
//         console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//         console.log('Test: Non-admin cannot set admin')
//         console.log("---") // break
    
//         await signerFactory(bob.sk);
//         const failSetAdminOperation = await doormanInstance.methods.setAdmin(bob.pkh);
//         await chai.expect(failSetAdminOperation.send()).to.be.eventually.rejected;
//         await signerFactory(alice.sk);

//     } catch (e){
//         console.log(e);
//     }
//   }); 

//   it(`alice stake 100 MVK tokens`, async () => {
//       try{

//           console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//           console.log("Test: Alice stake 100 MVK Tokens") 
//           console.log("---") // break
          
//           const beforeDoormanStorage   = await doormanInstance.storage();
//           const beforeMvkTokenStorage  = await mvkTokenInstance.storage();
//           const beforeMvkLedgerAlice   = await mvkTokenStorage.ledger.get(alice.pkh);

//           // console.log(beforeDoormanStorage);
//         //   console.log('beforeMvkStorage');
//         //   console.log(beforeMvkTokenStorage);

//           // console.log("Before MVK Storage Total Supply: "  + mvkTokenStorage.totalSupply);        // return 1000 MVK - 1,000,000,000 in muMVK
//           // console.log("Before Alice MVK Balance: "         + beforeMvkLedgerAlice.balance);       // return 250 - 250,000,000 in muMVK
  
//           console.log("---") // break
            
//           // Alice stake 100 MVK tokens - 100,000,000 in muMVK
//           const stakeAmountOperation = await doormanInstance.methods.stake(100000000).send();
//           await stakeAmountOperation.confirmation();

//           // const operationEstimate = await Tezos.estimate.transfer(doorman.contract.methods.stake(100000000).toTransferParams());
//           // console.log(operationEstimate);

//           const afterDeployedDoormanStorage = await doormanInstance.storage();
//           const afterMvkStorage             = await mvkTokenInstance.storage();

//           const afterDeployedDoormanAliceUserRecord   = await afterDeployedDoormanStorage.userStakeRecordsLedger.get(alice.pkh); // return user staking records - map(nat, stakeRecordType)
//           const afterDoormanAliceStakeRecord          = await afterDeployedDoormanAliceUserRecord.get("0");               // return { amount: 100000000, exitFee: 0, opType: 'stake', time: '2021-10-26T10:14:54.000Z' }
//           // console.log(afterDeployedDoormanAliceUserRecord);
//           // console.log(afterDoormanAliceStakeRecord);
//         //   console.log('afterMvkStorage');        
//         //   console.log(afterMvkStorage);

//         //   const afterMvkLedgerAlice                  = await afterMvkStorage.ledger.get(alice.pkh);
//           // console.log('afterMvkLedgerAlice');
//           // console.log(afterMvkLedgerAlice);
//           // console.log("After Alice MVK Balance: "         + afterMvkLedgerAlice.balance);    // return 150 MVK - 150,000,000 in muMVK
//           // console.log(afterMvkLedgerAlice);
      
//           // console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break

//           // assert.equal(afterMvkStorage.totalSupply, 900000000);
//           // assert.equal(afterVMvkStorage.totalSupply, 1100000000);
//           // assert.equal(afterMvkLedgerAlice.balance, 400000000);
//           // assert.equal(afterVMvkLedgerAlice.balance, 600000000);
//           // assert.equal(afterDoormanAliceStakeRecord.amount, 100000000);

//       } catch(e){
//           console.log(e);
//       }
//   });

//     it(`alice unstake 100 vMVK tokens`, async () => {
//         try{

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Alice unstake 100 vMVK Tokens Test:") 
//             console.log("---") // break
            
//             // const beforeDoormanStorage  = await doormanInstance.storage();
//             // const beforeMvkStorage      = await mvkTokenInstance.storage();
//             // const beforeVMvkStorage     = await vMvkTokenInstance.storage();
//             // const beforeMvkLedgerAlice  = await mvkStorage.ledger.get(alice.pkh);
//             // const beforeVMvkLedgerAlice = await vMvkStorage.ledger.get(alice.pkh);

//             // console.log("Before MVK Storage Total Supply: "  + beforeMvkStorage.totalSupply);   // return 900 MVK - 900,000,000 in muMVK
//             // console.log("Before vMVK Storage Total Supply: " + beforeVMvkStorage.totalSupply);  // return 1100 vMVK - 1,100,000,000 in muVMVK       
//             // console.log("Before Alice MVK Balance: "         + beforeMvkLedgerAlice.balance);   // return 400 - 400,000,000 in muMVK
//             // console.log("Before Alice vMVK Balance: "        + beforeVMvkLedgerAlice.balance);  // return 600 - 600,000,000 in muVMVK       
    
//             // console.log("---") // break

//             // Alice unstake 100 vMVK tokens - 100,000,000 in muVMVK    
//             const unstakeAmountOperation  = await doormanInstance.methods.unstake(100000000).send();
//             await unstakeAmountOperation.confirmation();

//             // const operationEstimate = await Tezos.estimate.transfer(doormanInstance.methods.unstake(100000000).toTransferParams());
//             // console.log(operationEstimate);

//             // afterMvkStorage     = await mvkTokenInstance.storage();
//             // afterVMvkStorage    = await vMvkTokenInstance.storage();
//             const afterDoormanStorage = await doormanInstance.storage();

//             // const afterMvkLedgerAlice            = await afterMvkStorage.ledger.get(alice.pkh);
//             // const afterVMvkLedgerAlice           = await afterVMvkStorage.ledger.get(alice.pkh);
//             // const afterDoormanAliceUserRecord    = await afterDoormanStorage.userStakeLedger.get(alice.pkh); // return user staking records - map(nat, stakeRecordType)
//             // const afterDoormanAliceStakeRecord   = await afterDoormanAliceUserRecord.get("1");               // return { amount: 100000000, exitFee: 8330000, opType: 'unstake', time: '2021-10-26T10:14:54.000Z' }

//             // console.log("Log Exit Fee: " + afterDoormanStorage.logExitFee);
//             // console.log("Log Final Amount: " + afterDoormanStorage.logFinalAmount);         

//             // 8,330,000 muMVK as exit fee to be distributed as rewards
//             // console.log("After MVK Storage Total Supply: "  + afterMvkStorage.totalSupply);    // return 991.67 MVK - 991,670,000 in muMVK
//             // console.log("After vMVK Storage Total Supply: " + afterVMvkStorage.totalSupply);   // return 1000 vMVK - 1,000,000,000 in muVMVK
//             // console.log("After Alice MVK Balance: "         + afterMvkLedgerAlice.balance);    // return 491.67 MVK - 491,670,000 in muMVK
//             // console.log("After Alice vMVK Balance: "        + afterVMvkLedgerAlice.balance);   // return 1000 vMVK - 1,000,000,000 in muVMVK
//             // console.log("After Doorman Alice Record: "      + afterDoormanAliceStakeRecord.amount + " " + afterDoormanAliceStakeRecord.opType + " with " + afterDoormanAliceStakeRecord.exitFee + " fee at " + afterDoormanAliceStakeRecord.time); // return "100000000 unstake with 8330000 fee at 2021-10-26T10:14:54.000Z"
//             // console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break

//             // assert.equal(afterMvkStorage.totalSupply, 991670000);
//             // assert.equal(afterVMvkStorage.totalSupply, 1000000000);
//             // assert.equal(afterMvkLedgerAlice.balance, 491670000);
//             // assert.equal(afterVMvkLedgerAlice.balance, 500000000);
//             // assert.equal(afterDoormanAliceStakeRecord.amount, 100000000);
//             // assert.equal(afterDoormanAliceStakeRecord.exitFee, 8330000);
             
//         } catch(e){
//             console.log(e);
//         }
//     });

//     it(`bob stake 100 MVK tokens`, async () => {
//         try{

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Bob stake 100 MVK Tokens Test:") 
//             console.log("---") // break

//             // const beforeDoormanStorage  = await doormanInstance.storage();
//             // const beforeMvkStorage      = await mvkTokenInstance.storage();
//             // const beforeVMvkStorage     = await vMvkTokenInstance.storage();
//             // const beforeMvkLedgerBob    = await mvkStorage.ledger.get(bob.pkh);
//             // const beforeVMvkLedgerBob   = await vMvkStorage.ledger.get(bob.pkh);
    
//             // console.log("Before MVK Storage Total Supply: "  + beforeMvkStorage.totalSupply);   // return 991.67 MVK - 991,670,000 in muMVK
//             // console.log("Before vMVK Storage Total Supply: " + beforeVMvkStorage.totalSupply);  // return 1000 vMVK - 1,000,000,000 in muVMVK       
//             // console.log("Before Bob MVK Balance: "           + beforeMvkLedgerBob.balance);     // return 500 - 500,000,000 in muMVK
//             // console.log("Before Bob vMVK Balance: "          + beforeVMvkLedgerBob.balance);    // return 500 - 500,000,000 in muVMVK       
    
//             console.log("---") // break

//             await signerFactory(bob.sk);
             
//             // Bob stake 100 MVK tokens - 100,000,000 in muMVK
//             const stakeAmountOperation = await doormanInstance.methods.stake(100000000).send();
//             await stakeAmountOperation.confirmation();
            
//             // afterMvkStorage     = await mvkTokenInstance.storage();
//             // afterVMvkStorage    = await vMvkTokenInstance.storage();
//             const afterDoormanStorage = await doormanInstance.storage();            
            
//             // const afterMvkLedgerBob            = await afterMvkStorage.ledger.get(bob.pkh);

//             // const afterDoormanBobUserRecord    = await afterDoormanStorage.userStakeRecordsLedger.get(bob.pkh); // return user staking records - map(nat, stakeRecordType)        
//             // const afterDoormanBobStakeRecord   = await afterDoormanBobUserRecord.get("0");               // return { amount: 100000000, exitFee: 0, opType: 'stake', time: '2021-10-26T10:14:54.000Z' }
//             // console.log(afterDoormanBobUserRecord);
//             // console.log(afterDoormanBobStakeRecord);

//             const afterDoormanBobUserStakeBalance    = await afterDoormanStorage.userStakeBalanceLedger.get(bob.pkh); // return user staking records - map(nat, stakeRecordType)        
//             // console.log(afterDoormanBobUserStakeBalance);
//             // console.log(afterDoormanBobStakeRecord);

//             // reset back to alice
//             await signerFactory(alice.sk);
            
//             // console.log("After MVK Storage Total Supply: "  + afterMvkStorage.totalSupply);    // return 891.67 MVK - 891,670,000 in muMVK
//             // console.log("After vMVK Storage Total Supply: " + afterVMvkStorage.totalSupply);   // return 1100 vMVK - 1,100,000,000 in muVMVK
//             // console.log("After Bob MVK Balance: "           + afterMvkLedgerBob.balance);      // return 400 MVK - 400,000,000 in muMVK

//             // console.log("After Doorman Bob Record: "        + afterDoormanBobStakeRecord.amount + " " + afterDoormanBobStakeRecord.opType + " with " + afterDoormanBobStakeRecord.exitFee + " fee at " + afterDoormanBobStakeRecord.time); // return "100000000 stake at 2021-10-26T10:14:54.000Z"

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break

//             // assert.equal(afterMvkStorage.totalSupply, 891670000);
//             // assert.equal(afterVMvkStorage.totalSupply, 1100000000);
//             // assert.equal(afterMvkLedgerBob.balance, 400000000);
//             // assert.equal(afterVMvkLedgerBob.balance, 600000000);
//             // assert.equal(afterDoormanBobStakeRecord.amount, 100000000);

//         } catch(e){
//             console.log(e);
//         }
//     });

//     it(`should not be able to stake more than what is allowed`, async() => {
//         try{
             
//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Should not be able to stake more than what is allowed") 
//             console.log("---") // break

//             const beforeMvkLedgerAlice  = await mvkTokenStorage.ledger.get(alice.pkh);
//             // const beforeVMvkLedgerAlice = await vMvkStorage.ledger.get(alice.pkh);
//             // const beforeDoormanStorage  = await doormanInstance.storage();

//             // console.log("Before MVK Storage Total Supply: "  + mvkStorage.totalSupply);         // return 1000 MVK - 1,000,000,000 in muMVK
//             // console.log("Before vMVK Storage Total Supply: " + vMvkStorage.totalSupply);        // return 1000 vMVK - 1,000,000,000 in muVMVK
//             console.log("Before Alice MVK Balance: "         + beforeMvkLedgerAlice.balance);   // return 491.67 MVK - 491,670,000 in muMVK
//             // console.log("Before Alice vMVK Balance: "        + beforeVMvkLedgerAlice.balance);  // return 500 vMVK - 500,000,000 in muVMVK
    
//             console.log("---") // break
             
//             // Alice stakes more than what she has - 495 MVK tokens - 495,000,000 in muMVK
//             // const failStakeAmountOperation = await doormanInstance.methods.stake(495000000);
//             // await chai.expect(failStakeAmountOperation.send()).to.be.eventually.rejected;
            
//             // afterMvkStorage     = await mvkTokenInstance.storage();
//             // afterVMvkStorage    = await vMvkTokenInstance.storage();
//             // afterDoormanStorage = await doormanInstance.storage();

//             // const afterMvkLedgerAlice            = await afterMvkStorage.ledger.get(alice.pkh);
//             // const afterVMvkLedgerAlice           = await afterVMvkStorage.ledger.get(alice.pkh);

//             // console.log("Log Exit Fee: " + afterDoormanStorage.logExitFee);
//             // console.log("Log Final Amount: " + afterDoormanStorage.logFinalAmount);         

//             // 8,330,000 muMVK as exit fee to be distributed as rewards
//             // console.log("After MVK Storage Total Supply: "  + afterMvkStorage.totalSupply);    // return 991.67 MVK - 991,670,000 in muMVK
//             // console.log("After vMVK Storage Total Supply: " + afterVMvkStorage.totalSupply);   // return 1000 vMVK - 1,000,000,000 in muVMVK
//             // console.log("After Alice MVK Balance: "         + afterMvkLedgerAlice.balance);    // return 491.67 MVK - 491,670,000 in muMVK
//             // console.log("After Alice vMVK Balance: "        + afterVMvkLedgerAlice.balance);   // return 1000 vMVK - 1,000,000,000 in muVMVK
//             // console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break

//         } catch(e){
//             console.log(e);
//         }
//     });


//     it(`should not be able to unstake more than what is allowed`, async() => {
//         try{

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Should not be able to unstake more than what is allowed") 
//             console.log("---") // break

//             // const beforeMvkLedgerAlice  = await mvkStorage.ledger.get(alice.pkh);
//             // const beforeVMvkLedgerAlice = await vMvkStorage.ledger.get(alice.pkh);
//             // const beforeDoormanStorage  = await doormanInstance.storage();

//             // console.log("Before MVK Storage Total Supply: "  + mvkStorage.totalSupply);         // return 1000 MVK - 1,000,000,000 in muMVK
//             // console.log("Before vMVK Storage Total Supply: " + vMvkStorage.totalSupply);        // return 1000 vMVK - 1,000,000,000 in muVMVK
//             // console.log("Before Alice MVK Balance: "         + beforeMvkLedgerAlice.balance);   // return 491.67 MVK - 491,670,000 in muMVK
//             // console.log("Before Alice vMVK Balance: "        + beforeVMvkLedgerAlice.balance);  // return 500 vMVK - 500,000,000 in muVMVK
    
//             console.log("---") // break
             
//             // Alice stakes more than what she has - 600 MVK tokens - 600,000,000 in muMVK
//             const failUnstakeAmountOperation = await doormanInstance.methods.unstake(600000000);
//             await chai.expect(failUnstakeAmountOperation.send()).to.be.eventually.rejected;
            
//             // afterMvkStorage     = await mvkTokenInstance.storage();
//             // afterVMvkStorage    = await vMvkTokenInstance.storage();
//             // afterDoormanStorage = await doormanInstance.storage();

//             // const afterMvkLedgerAlice            = await afterMvkStorage.ledger.get(alice.pkh);
//             // const afterVMvkLedgerAlice           = await afterVMvkStorage.ledger.get(alice.pkh);

//             // console.log("Log Exit Fee: " + afterDoormanStorage.logExitFee);
//             // console.log("Log Final Amount: " + afterDoormanStorage.logFinalAmount);         

//             // 8,330,000 muMVK as exit fee to be distributed as rewards
//             // console.log("After MVK Storage Total Supply: "  + afterMvkStorage.totalSupply);    // return 991.67 MVK - 991,670,000 in muMVK
//             // console.log("After vMVK Storage Total Supply: " + afterVMvkStorage.totalSupply);   // return 1000 vMVK - 1,000,000,000 in muVMVK
//             // console.log("After Alice MVK Balance: "         + afterMvkLedgerAlice.balance);    // return 491.67 MVK - 491,670,000 in muMVK
//             // console.log("After Alice vMVK Balance: "        + afterVMvkLedgerAlice.balance);   // return 1000 vMVK - 1,000,000,000 in muVMVK
//             // console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break

//         } catch(e){
//             console.log(e);
//         }
//     });
  describe("%compound", async() => {
        // it("alice stakes 1MVK then unstakes 0.01MVK", async() => {
        //     try{
        //         // Parameters
        //         const aliceStake = 100000;
        //         const aliceUnstake = 1000;

        //         // Add operator operation
        //         const addOperatorOperation = await mvkTokenInstance.methods
        //             .update_operators([
        //             {
        //                 add_operator: {
        //                     owner: alice.pkh,
        //                     operator: doormanAddress.address,
        //                     token_id: 0,
        //                 },
        //             }])
        //             .send()
        //         await addOperatorOperation.confirmation()

        //         mvkTokenStorage = await mvkTokenInstance.storage();
        //         var aliceLedgerBeforeStake = await mvkTokenStorage.ledger.get(alice.pkh);
        //         // console.log("Alice balance before stake: ", parseInt(aliceLedgerBeforeStake)

        //         // Stake operation
        //         const stakeOperation = await doormanInstance.methods
        //             .stake(aliceStake)
        //             .send()
        //         await stakeOperation.confirmation();

        //         mvkTokenStorage = await mvkTokenInstance.storage();
        //         var aliceLedgerAfterStake = await mvkTokenStorage.ledger.get(alice.pkh);
        //         // console.log("Alice balance after stake: ", parseInt(aliceLedgerAfterStake)

        //         // Unstake operation
        //         const unstakeOperation = await doormanInstance.methods
        //             .unstake(aliceUnstake)
        //             .send()
        //         await unstakeOperation.confirmation()

        //         mvkTokenStorage = await mvkTokenInstance.storage();
        //         var aliceLedgerAfterUnstake = await mvkTokenStorage.ledger.get(alice.pkh);
        //         // console.log("Alice balance after unstake: ", parseInt(aliceLedgerAfterUnstake)

        //         doormanStorage = await doormanInstance.storage();

        //         // console.log("Doorman storage: ",doormanStorage)

        //         // Assertions
        //         assert.equal(aliceLedgerBeforeStake - aliceStake, aliceLedgerAfterStake);
        //         assert.equal(aliceLedgerBeforeStake - aliceStake + aliceUnstake, aliceLedgerAfterUnstake);
        //     } catch(e) {
        //         console.log(e)
        //     }
        // })

        it("alice stakes 2MVK, bob stakes 5MVK then alice unstakes 1MVK and finally bob compounds", async() => {
            try{
                // Parameters
                const aliceStake = 2 * 10**6;
                const bobStake = 5 * 10**6;
                const aliceUnstake = 10**6;

                // Alice Add operator operation
                const aliceAddOperatorOperation = await mvkTokenInstance.methods
                    .update_operators([
                    {
                        add_operator: {
                            owner: alice.pkh,
                            operator: doormanAddress.address,
                            token_id: 0,
                        },
                    }])
                    .send()
                await aliceAddOperatorOperation.confirmation()

                mvkTokenStorage = await mvkTokenInstance.storage();
                var aliceLedgerBeforeStake = await mvkTokenStorage.ledger.get(alice.pkh);
                console.log("Alice balance before stake: ", parseInt(aliceLedgerBeforeStake))

                doormanStorage = await doormanInstance.storage();
                var sMVKTotalSupply = doormanStorage.stakedMvkTotalSupply;
                console.log("sMVK Total Supply: ", parseInt(sMVKTotalSupply))

                // Alice Stake operation
                const aliceStakeOperation = await doormanInstance.methods
                    .stake(aliceStake)
                    .send()
                await aliceStakeOperation.confirmation();

                mvkTokenStorage = await mvkTokenInstance.storage();
                var aliceLedgerAfterStake = await mvkTokenStorage.ledger.get(alice.pkh);
                console.log("Alice balance after stake: ", parseInt(aliceLedgerAfterStake))

                doormanStorage = await doormanInstance.storage();
                var sMVKTotalSupply = doormanStorage.stakedMvkTotalSupply;
                console.log("sMVK Total Supply: ", parseInt(sMVKTotalSupply))

                // Change signer
                await signerFactory(bob.sk);

                // Bob Add operator operation
                const bobAddOperatorOperation = await mvkTokenInstance.methods
                    .update_operators([
                    {
                        add_operator: {
                            owner: bob.pkh,
                            operator: doormanAddress.address,
                            token_id: 0,
                        },
                    }])
                    .send()
                await bobAddOperatorOperation.confirmation()

                mvkTokenStorage = await mvkTokenInstance.storage();
                var bobLedgerBeforeStake = await mvkTokenStorage.ledger.get(bob.pkh);
                console.log("Bob balance before stake: ", parseInt(bobLedgerBeforeStake))

                doormanStorage = await doormanInstance.storage();
                var sMVKTotalSupply = doormanStorage.stakedMvkTotalSupply;
                console.log("sMVK Total Supply: ", parseInt(sMVKTotalSupply))

                // Stake operation
                const bobStakeOperation = await doormanInstance.methods
                    .stake(bobStake)
                    .send()
                await bobStakeOperation.confirmation();

                mvkTokenStorage = await mvkTokenInstance.storage();
                var bobLedgerAfterStake = await mvkTokenStorage.ledger.get(bob.pkh);
                console.log("Bob balance after stake: ", parseInt(bobLedgerAfterStake))

                doormanStorage = await doormanInstance.storage();
                var sMVKTotalSupply = doormanStorage.stakedMvkTotalSupply;
                console.log("sMVK Total Supply: ", parseInt(sMVKTotalSupply))

                // Change signer
                await signerFactory(alice.sk);

                // Unstake operation
                const unstakeOperation = await doormanInstance.methods
                    .unstake(aliceUnstake)
                    .send()
                await unstakeOperation.confirmation()

                mvkTokenStorage = await mvkTokenInstance.storage();
                var aliceLedgerAfterUnstake = await mvkTokenStorage.ledger.get(alice.pkh);
                console.log("Alice balance after unstake: ", parseInt(aliceLedgerAfterUnstake))

                doormanStorage = await doormanInstance.storage();
                var sMVKTotalSupply = doormanStorage.stakedMvkTotalSupply;
                console.log("sMVK Total Supply: ", parseInt(sMVKTotalSupply))

                doormanStorage = await doormanInstance.storage();

                console.log("Doorman storage: ",doormanStorage)

                doormanStorage = await doormanInstance.storage();
                var aliceSMVKAfterUnstake = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
                const aliceSMVKAfterUnstakeBalance = parseInt(aliceSMVKAfterUnstake['balance'])
                console.log("Alice sMVK after unstake: ", aliceSMVKAfterUnstakeBalance)

                // Change signer
                await signerFactory(bob.sk);

                doormanStorage = await doormanInstance.storage();
                var bobSMVKBeforeCompound = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
                const bobSMVKBeforeCompoundBalance = parseInt(bobSMVKBeforeCompound['balance'])
                console.log("Bob sMVK before compound: ", bobSMVKBeforeCompoundBalance)

                // Bob compound operation
                const bobCompoundOperation = await doormanInstance.methods
                    .compound()
                    .send()
                await bobCompoundOperation.confirmation()

                doormanStorage = await doormanInstance.storage();
                var bobSMVKAfterCompound = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
                const bobSMVKAfterCompoundBalance = parseInt(bobSMVKAfterCompound['balance'])
                console.log("Bob sMVK after compound: ", bobSMVKAfterCompoundBalance)

                // Assertions
                const aliceFinalUnstake = parseInt(aliceLedgerAfterUnstake) - parseInt(aliceLedgerAfterStake)
                const aliceExitFee = aliceUnstake - aliceFinalUnstake
                console.log("Exit fee: ", aliceExitFee);
                console.log("Final unstake: ", aliceFinalUnstake);
                const usersRewards = aliceSMVKAfterUnstakeBalance - (aliceStake - aliceUnstake) + bobSMVKAfterCompoundBalance - bobSMVKBeforeCompoundBalance
                assert.equal(usersRewards, aliceExitFee);
            } catch(e) {
                console.log(e)
            }
        })
    })
});