// const doorman = artifacts.require('doorman');
// const mvkToken = artifacts.require('mvkToken');
// const vMvkToken = artifacts.require('vMvkToken');
// const delegation = artifacts.require('delegation');

// const chai = require("chai");
// const chaiAsPromised = require('chai-as-promised');
// chai.use(chaiAsPromised);   
// chai.should();

// const { MichelsonMap } = require("@taquito/michelson-encoder");
// const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
// const { InMemorySigner, importKey } = require("@taquito/signer");

// /**
//  * For testing on a babylonnet (testnet), instead of the sandbox network,
//  * make sure to replace the keys for alice/bob accordingly.
//  */
// const { alice, bob } = require('../scripts/sandbox/accounts');
// const truffleConfig = require("../truffle-config.js");

// contract('doorman', async() => {
//     let doormanInstance;
//     let mvkTokenInstance;
//     let vMvkTokenInstance;
//     let senderInstance;

    // const signerFactory = async (pk) => {
    //     await Tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
    //     return Tezos;
    //   };
    
//     before(async () => {

//         Tezos.setProvider({
//             rpc: `${truffleConfig.networks.development.host}:${truffleConfig.networks.development.port}`            
//         })

//         // default: set alice (maintainer) as originator of transactions
//         await signerFactory(alice.sk);

//         doormanInstance   = await doorman.deployed();
//         doormanInstance   = await Tezos.contract.at(doormanInstance.address);

//         mvkTokenInstance  = await mvkToken.deployed();        
//         mvkTokenInstance  = await Tezos.contract.at(mvkTokenInstance.address);

//         vMvkTokenInstance = await vMvkToken.deployed();        
//         vMvkTokenInstance = await Tezos.contract.at(vMvkTokenInstance.address);
        
//         delegationInstance = await delegation.deployed();
//         delegationInstance = await Tezos.contract.at(delegationInstance.address);

//         doormanStorage    = await doormanInstance.storage();
//         mvkStorage        = await mvkTokenInstance.storage();
//         vMvkStorage       = await vMvkTokenInstance.storage();
//         delegationStorage = await delegationInstance.storage();

//         console.log('-- -- -- -- -- Deployments -- -- -- --')
//         console.log('Doorman Contract deployed at:', doormanInstance.address);
//         console.log('MVK Contract deployed at:', mvkTokenInstance.address);
//         console.log('vMVK Contract deployed at:', vMvkTokenInstance.address);
//         console.log('Delegation Contract deployed at:', delegationInstance.address);
//         console.log('Alice address: ' + alice.pkh);
//         console.log('Bob address: ' + bob.pkh);
//         console.log('Doorman maintainer: ' + doormanStorage.maintainer);

//     });

//     it(`maintainer set mvk contract address`, async () => {
//         try{
            
            // console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            // console.log('Test: Admin set MVK Contract Address')
            // console.log("---") // break

//             console.log('Before (mvk contract address): '+ doormanStorage.mvkTokenAddress);

//             // dummy contract address generated from previous tests
//             const dummyMvkTokenAddress = "KT18jjki6TE4AkoNsU3iEJRgSxzWcoqKaf2S";
//             console.log("Dummy MVK Token Address: "+dummyMvkTokenAddress);

//             const setMvkTokenAddressOperation = await doormanInstance.methods.setMvkTokenAddress(dummyMvkTokenAddress).send();
//             await setMvkTokenAddressOperation.confirmation();

//             const operationEstimate = await Tezos.estimate.transfer(doormanInstance.methods.setMvkTokenAddress(dummyMvkTokenAddress).toTransferParams());
//             console.log(operationEstimate);

//             const afterDoormanStorage  = await doormanInstance.storage();

//             console.log('After (mvk contract address): '+ afterDoormanStorage.mvkTokenAddress);
//             assert.equal(afterDoormanStorage.mvkTokenAddress, dummyMvkTokenAddress);

//             // set back to original token address
//             const resetMvkTokenAddressOperation = await doormanInstance.methods.setMvkTokenAddress(mvkTokenInstance.address).send();
//             await resetMvkTokenAddressOperation.confirmation();

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
        
//         } catch (e){
//             console.log(e);
//         }
//     });

//     it(`non-maintainer cannot set mvk contract address`, async () => {
//         try{
            
//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log('Test: Non-Admin cannot set MVK Contract Address')
//             console.log("---") // break
            
//             console.log('Before (mvk contract address): '+ doormanStorage.mvkTokenAddress);

//             // dummy contract address generated from previous tests 
//             const dummyMvkTokenAddress = "KT18jjki6TE4AkoNsU3iEJRgSxzWcoqKaf2S";
//             console.log("Dummy MVK Token Address: "+dummyMvkTokenAddress);

//             // change user to bob
//             await signerFactory(bob.sk);
//             const failSetMvkTokenAddressOperation = await doormanInstance.methods.setMvkTokenAddress(dummyMvkTokenAddress);
//             await chai.expect(failSetMvkTokenAddressOperation.send()).to.be.eventually.rejected;
//             await signerFactory(alice.sk);

//             // const operationEstimate = await Tezos.estimate.transfer(doormanInstance.methods.setMvkTokenAddress(dummyMvkTokenAddress).toTransferParams());
//             // console.log(operationEstimate);

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break

//         } catch (e){
//             console.log(e);
//         }
//     });

//     it(`maintainer set vMvk contract address`, async () => {
//         try{
            
//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log('Test: Admin set vMVK Contract Address')
//             console.log("---") // break

//             console.log('before (vMvk contract address): '+ doormanStorage.vMvkTokenAddress);

//             // dummy contract address generated from previous tests
//             const dummyVMvkTokenAddress = "KT18jjki6TE4AkoNsU3iEJRgSxzWcoqKaf2S";
//             console.log("Dummy vMVK Token Address: "+dummyVMvkTokenAddress);

//             const setVMvkTokenAddressOperation = await doormanInstance.methods.setVMvkTokenAddress(dummyVMvkTokenAddress).send();
//             await setVMvkTokenAddressOperation.confirmation();

//             const afterDoormanStorage  = await doormanInstance.storage();

//             console.log('After (vMvk contract address): '+ afterDoormanStorage.vMvkTokenAddress);
//             assert.equal(afterDoormanStorage.vMvkTokenAddress, dummyVMvkTokenAddress);
            
//             // set back to original token address
//             const resetVMvkTokenAddressOperation = await doormanInstance.methods.setVMvkTokenAddress(vMvkTokenInstance.address).send();
//             await resetVMvkTokenAddressOperation.confirmation();

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break

//         } catch (e){
//             console.log(e);
//         }
//     });

//     it(`non-maintainer cannot set vMvk contract address`, async () => {
//         try{
            
//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log('Test: Non-Admin cannot set vMVK Contract Address')
//             console.log("---") // break
            
//             console.log('Before (vMvk contract address): '+ doormanStorage.vMvkTokenAddress);

//             // dummy contract address generated from previous tests 
//             const dummyVMvkTokenAddress = "KT18jjki6TE4AkoNsU3iEJRgSxzWcoqKaf2S";
//             console.log("Dummy vMVK Token Address: "+dummyVMvkTokenAddress);

//             // change user to bob
//             await signerFactory(bob.sk);
//             const failSetVMvkTokenAddressOperation = await doormanInstance.methods.setVMvkTokenAddress(dummyVMvkTokenAddress);
//             await chai.expect(failSetVMvkTokenAddressOperation.send()).to.be.eventually.rejected;
//             await signerFactory(alice.sk);

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break

//         } catch (e){
//             console.log(e);
//         }
//     });

//     it(`set maintainer to bob`, async () => {
//         try{
            
            // console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            // console.log('Test: Set Admin to Bob')
            // console.log("---") // break
            // console.log('before Admin (alice address): '+ doormanStorage.maintainer); // return alice.pkh
        
//             const setAdminAddressOperation  = await doormanInstance.methods.setAdmin(bob.pkh).send();
//             await setAdminAddressOperation.confirmation();

//             const afterDoormanStorage = await doormanInstance.storage();

//             console.log('after Admin (bob address): '+ afterDoormanStorage.maintainer); // return bob.pkh
//             assert.equal(afterDoormanStorage.maintainer, bob.pkh);

//             // reset back to alice as maintainer
//             await signerFactory(bob.sk);
//             const resetAdminAddressOperation  = await doormanInstance.methods.setAdmin(alice.pkh).send();
//             await resetAdminAddressOperation.confirmation();
//             await doormanInstance.storage();
//             await signerFactory(alice.sk);
//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break

//         } catch (e){
//             console.log(e);
//         }
//     });

//     it(`non-maintainer cannot set maintainer`, async () => {
//         try{
            
//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log('Test: Non-maintainer cannot set maintainer')
//             console.log("---") // break
//             console.log('before Admin (alice address): '+ doormanStorage.maintainer); // return alice.pkh
        
//             await signerFactory(bob.sk);
//             const failSetAdminOperation = await doormanInstance.methods.setAdmin(bob.pkh);
//             await chai.expect(failSetAdminOperation.send()).to.be.eventually.rejected;
//             await signerFactory(alice.sk);

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break

//         } catch (e){
//             console.log(e);
//         }
//     });

//     it(`alice stake 100 MVK tokens`, async () => {
//         try{

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Alice stake 100 MVK Tokens") 
//             console.log("---") // break

//             const beforeMvkLedgerAlice  = await mvkStorage.ledger.get(alice.pkh);
//             const beforeVMvkLedgerAlice = await vMvkStorage.ledger.get(alice.pkh);
//             const beforeDoormanStorage  = await doormanInstance.storage();

//             console.log("Before MVK Storage Total Supply: "  + mvkStorage.totalSupply);         // return 1000 MVK - 1,000,000,000 in muMVK
//             console.log("Before vMVK Storage Total Supply: " + vMvkStorage.totalSupply);        // return 1000 vMVK - 1,000,000,000 in muVMVK
//             console.log("Before Alice MVK Balance: "         + beforeMvkLedgerAlice.balance);   // return 500 MVK - 500,000,000 in muMVK
//             console.log("Before Alice vMVK Balance: "        + beforeVMvkLedgerAlice.balance);  // return 500 vMVK - 500,000,000 in muVMVK
    
//             console.log("---") // break
             
//             // Alice stake 100 MVK tokens - 100,000,000 in muMVK
//             const stakeAmountOperation = await doormanInstance.methods.stake(100000000n).send();
//             await stakeAmountOperation.confirmation();

//             const operationEstimate = await Tezos.estimate.transfer(doormanInstance.methods.stake(100000000n).toTransferParams());
//             console.log(operationEstimate);
            
//             afterMvkStorage     = await mvkTokenInstance.storage();
//             afterVMvkStorage    = await vMvkTokenInstance.storage();
//             afterDoormanStorage = await doormanInstance.storage();

//             const afterMvkLedgerAlice            = await afterMvkStorage.ledger.get(alice.pkh);
//             const afterVMvkLedgerAlice           = await afterVMvkStorage.ledger.get(alice.pkh);
//             const afterDoormanAliceUserRecord    = await afterDoormanStorage.userStakeLedger.get(alice.pkh); // return user staking records - map(nat, stakeRecordType)
//             const afterDoormanAliceStakeRecord   = await afterDoormanAliceUserRecord.get("0");               // return { amount: 100000000, exitFee: 0, opType: 'stake', time: '2021-10-26T10:14:54.000Z' }
            
//             console.log("After MVK Storage Total Supply: "  + afterMvkStorage.totalSupply);    // return 900 MVK - 900,000,000 in muMVK
//             console.log("After vMVK Storage Total Supply: " + afterVMvkStorage.totalSupply);   // return 1100 vMVK - 1,100,000,000 in muVMVK
//             console.log("After Alice MVK Balance: "         + afterMvkLedgerAlice.balance);    // return 400 MVK - 400,000,000 in muMVK
//             console.log("After Alice vMVK Balance: "        + afterVMvkLedgerAlice.balance);   // return 600 vMVK - 600,000,000 in muVMVK
//             console.log("After Doorman Alice Record: "      + afterDoormanAliceStakeRecord.amount + " " + afterDoormanAliceStakeRecord.opType + " with " + afterDoormanAliceStakeRecord.exitFee + " fee at " + afterDoormanAliceStakeRecord.time); // return "100000000 stake at 2021-10-26T10:14:54.000Z"
//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break

//             assert.equal(afterMvkStorage.totalSupply, 900000000);
//             assert.equal(afterVMvkStorage.totalSupply, 1100000000);
//             assert.equal(afterMvkLedgerAlice.balance, 400000000);
//             assert.equal(afterVMvkLedgerAlice.balance, 600000000);
//             assert.equal(afterDoormanAliceStakeRecord.amount, 100000000);

//         } catch(e){
//             console.log(e);
//         }
//     });

//     it(`alice unstake 100 vMVK tokens`, async () => {
//         try{

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Alice unstake 100 vMVK Tokens Test:") 
//             console.log("---") // break
            
//             const beforeDoormanStorage  = await doormanInstance.storage();
//             const beforeMvkStorage      = await mvkTokenInstance.storage();
//             const beforeVMvkStorage     = await vMvkTokenInstance.storage();
//             const beforeMvkLedgerAlice  = await mvkStorage.ledger.get(alice.pkh);
//             const beforeVMvkLedgerAlice = await vMvkStorage.ledger.get(alice.pkh);

//             console.log("Before MVK Storage Total Supply: "  + beforeMvkStorage.totalSupply);   // return 900 MVK - 900,000,000 in muMVK
//             console.log("Before vMVK Storage Total Supply: " + beforeVMvkStorage.totalSupply);  // return 1100 vMVK - 1,100,000,000 in muVMVK       
//             console.log("Before Alice MVK Balance: "         + beforeMvkLedgerAlice.balance);   // return 400 - 400,000,000 in muMVK
//             console.log("Before Alice vMVK Balance: "        + beforeVMvkLedgerAlice.balance);  // return 600 - 600,000,000 in muVMVK       
    
//             console.log("---") // break

//             // Alice unstake 100 vMVK tokens - 100,000,000 in muVMVK    
//             const unstakeAmountOperation  = await doormanInstance.methods.unstake(100000000n).send();
//             await unstakeAmountOperation.confirmation();

//             const operationEstimate = await Tezos.estimate.transfer(doormanInstance.methods.unstake(100000000n).toTransferParams());
//             console.log(operationEstimate);

//             afterMvkStorage     = await mvkTokenInstance.storage();
//             afterVMvkStorage    = await vMvkTokenInstance.storage();
//             afterDoormanStorage = await doormanInstance.storage();

//             const afterMvkLedgerAlice            = await afterMvkStorage.ledger.get(alice.pkh);
//             const afterVMvkLedgerAlice           = await afterVMvkStorage.ledger.get(alice.pkh);
//             const afterDoormanAliceUserRecord    = await afterDoormanStorage.userStakeLedger.get(alice.pkh); // return user staking records - map(nat, stakeRecordType)
//             const afterDoormanAliceStakeRecord   = await afterDoormanAliceUserRecord.get("1");               // return { amount: 100000000, exitFee: 8330000, opType: 'unstake', time: '2021-10-26T10:14:54.000Z' }

//             console.log("Log Exit Fee: " + afterDoormanStorage.logExitFee);
//             console.log("Log Final Amount: " + afterDoormanStorage.logFinalAmount);         

//             // 8,330,000 muMVK as exit fee to be distributed as rewards
//             console.log("After MVK Storage Total Supply: "  + afterMvkStorage.totalSupply);    // return 991.67 MVK - 991,670,000 in muMVK
//             console.log("After vMVK Storage Total Supply: " + afterVMvkStorage.totalSupply);   // return 1000 vMVK - 1,000,000,000 in muVMVK
//             console.log("After Alice MVK Balance: "         + afterMvkLedgerAlice.balance);    // return 491.67 MVK - 491,670,000 in muMVK
//             console.log("After Alice vMVK Balance: "        + afterVMvkLedgerAlice.balance);   // return 1000 vMVK - 1,000,000,000 in muVMVK
//             console.log("After Doorman Alice Record: "      + afterDoormanAliceStakeRecord.amount + " " + afterDoormanAliceStakeRecord.opType + " with " + afterDoormanAliceStakeRecord.exitFee + " fee at " + afterDoormanAliceStakeRecord.time); // return "100000000 unstake with 8330000 fee at 2021-10-26T10:14:54.000Z"
//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break

//             assert.equal(afterMvkStorage.totalSupply, 991670000);
//             assert.equal(afterVMvkStorage.totalSupply, 1000000000);
//             assert.equal(afterMvkLedgerAlice.balance, 491670000);
//             assert.equal(afterVMvkLedgerAlice.balance, 500000000);
//             assert.equal(afterDoormanAliceStakeRecord.amount, 100000000);
//             assert.equal(afterDoormanAliceStakeRecord.exitFee, 8330000);
             
//         } catch(e){
//             console.log(e);
//         }
//     });

//     it(`bob stake 100 MVK tokens`, async () => {
//         try{

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Bob stake 100 MVK Tokens Test:") 
//             console.log("---") // break

//             const beforeDoormanStorage  = await doormanInstance.storage();
//             const beforeMvkStorage      = await mvkTokenInstance.storage();
//             const beforeVMvkStorage     = await vMvkTokenInstance.storage();
//             const beforeMvkLedgerBob    = await mvkStorage.ledger.get(bob.pkh);
//             const beforeVMvkLedgerBob   = await vMvkStorage.ledger.get(bob.pkh);
    
//             console.log("Before MVK Storage Total Supply: "  + beforeMvkStorage.totalSupply);   // return 991.67 MVK - 991,670,000 in muMVK
//             console.log("Before vMVK Storage Total Supply: " + beforeVMvkStorage.totalSupply);  // return 1000 vMVK - 1,000,000,000 in muVMVK       
//             console.log("Before Bob MVK Balance: "           + beforeMvkLedgerBob.balance);     // return 500 - 500,000,000 in muMVK
//             console.log("Before Bob vMVK Balance: "          + beforeVMvkLedgerBob.balance);    // return 500 - 500,000,000 in muVMVK       
    
//             console.log("---") // break

//             await signerFactory(bob.sk);
             
//             // Bob stake 100 MVK tokens - 100,000,000 in muMVK
//             const stakeAmountOperation = await doormanInstance.methods.stake(100000000n).send();
//             await stakeAmountOperation.confirmation();
            
//             afterMvkStorage     = await mvkTokenInstance.storage();
//             afterVMvkStorage    = await vMvkTokenInstance.storage();
//             afterDoormanStorage = await doormanInstance.storage();            
            
//             const afterMvkLedgerBob            = await afterMvkStorage.ledger.get(bob.pkh);
//             const afterVMvkLedgerBob           = await afterVMvkStorage.ledger.get(bob.pkh);
//             const afterDoormanBobUserRecord    = await afterDoormanStorage.userStakeLedger.get(bob.pkh); // return user staking records - map(nat, stakeRecordType)        
//             const afterDoormanBobStakeRecord   = await afterDoormanBobUserRecord.get("0");               // return { amount: 100000000, exitFee: 0, opType: 'stake', time: '2021-10-26T10:14:54.000Z' }
            
//             // reset back to alice
//             await signerFactory(alice.sk);
            
//             console.log("After MVK Storage Total Supply: "  + afterMvkStorage.totalSupply);    // return 891.67 MVK - 891,670,000 in muMVK
//             console.log("After vMVK Storage Total Supply: " + afterVMvkStorage.totalSupply);   // return 1100 vMVK - 1,100,000,000 in muVMVK
//             console.log("After Bob MVK Balance: "           + afterMvkLedgerBob.balance);      // return 400 MVK - 400,000,000 in muMVK
//             console.log("After Bob vMVK Balance: "          + afterVMvkLedgerBob.balance);     // return 600 vMVK - 600,000,000 in muVMVK
//             console.log("After Doorman Bob Record: "        + afterDoormanBobStakeRecord.amount + " " + afterDoormanBobStakeRecord.opType + " with " + afterDoormanBobStakeRecord.exitFee + " fee at " + afterDoormanBobStakeRecord.time); // return "100000000 stake at 2021-10-26T10:14:54.000Z"

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break

//             assert.equal(afterMvkStorage.totalSupply, 891670000);
//             assert.equal(afterVMvkStorage.totalSupply, 1100000000);
//             assert.equal(afterMvkLedgerBob.balance, 400000000);
//             assert.equal(afterVMvkLedgerBob.balance, 600000000);
//             assert.equal(afterDoormanBobStakeRecord.amount, 100000000);

//         } catch(e){
//             console.log(e);
//         }
//     });

//     it(`should not be able to stake more than what is allowed`, async() => {
//         try{
             
//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Should not be able to stake more than what is allowed") 
//             console.log("---") // break

//             const beforeMvkLedgerAlice  = await mvkStorage.ledger.get(alice.pkh);
//             const beforeVMvkLedgerAlice = await vMvkStorage.ledger.get(alice.pkh);
//             const beforeDoormanStorage  = await doormanInstance.storage();

//             console.log("Before MVK Storage Total Supply: "  + mvkStorage.totalSupply);         // return 1000 MVK - 1,000,000,000 in muMVK
//             console.log("Before vMVK Storage Total Supply: " + vMvkStorage.totalSupply);        // return 1000 vMVK - 1,000,000,000 in muVMVK
//             console.log("Before Alice MVK Balance: "         + beforeMvkLedgerAlice.balance);   // return 491.67 MVK - 491,670,000 in muMVK
//             console.log("Before Alice vMVK Balance: "        + beforeVMvkLedgerAlice.balance);  // return 500 vMVK - 500,000,000 in muVMVK
    
//             console.log("---") // break
             
//             // Alice stakes more than what she has - 495 MVK tokens - 495,000,000 in muMVK
//             const failStakeAmountOperation = await doormanInstance.methods.stake(495000000n);
//             await chai.expect(failStakeAmountOperation.send()).to.be.eventually.rejected;
            
//             afterMvkStorage     = await mvkTokenInstance.storage();
//             afterVMvkStorage    = await vMvkTokenInstance.storage();
//             afterDoormanStorage = await doormanInstance.storage();

//             const afterMvkLedgerAlice            = await afterMvkStorage.ledger.get(alice.pkh);
//             const afterVMvkLedgerAlice           = await afterVMvkStorage.ledger.get(alice.pkh);

//             console.log("Log Exit Fee: " + afterDoormanStorage.logExitFee);
//             console.log("Log Final Amount: " + afterDoormanStorage.logFinalAmount);         

//             // 8,330,000 muMVK as exit fee to be distributed as rewards
//             console.log("After MVK Storage Total Supply: "  + afterMvkStorage.totalSupply);    // return 991.67 MVK - 991,670,000 in muMVK
//             console.log("After vMVK Storage Total Supply: " + afterVMvkStorage.totalSupply);   // return 1000 vMVK - 1,000,000,000 in muVMVK
//             console.log("After Alice MVK Balance: "         + afterMvkLedgerAlice.balance);    // return 491.67 MVK - 491,670,000 in muMVK
//             console.log("After Alice vMVK Balance: "        + afterVMvkLedgerAlice.balance);   // return 1000 vMVK - 1,000,000,000 in muVMVK
//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break

//         } catch(e){
//             console.log(e);
//         }
//     });


//     it(`should not be able to unstake more than what is allowed`, async() => {
//         try{

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Should not be able to unstake more than what is allowed") 
//             console.log("---") // break

//             const beforeMvkLedgerAlice  = await mvkStorage.ledger.get(alice.pkh);
//             const beforeVMvkLedgerAlice = await vMvkStorage.ledger.get(alice.pkh);
//             const beforeDoormanStorage  = await doormanInstance.storage();

//             console.log("Before MVK Storage Total Supply: "  + mvkStorage.totalSupply);         // return 1000 MVK - 1,000,000,000 in muMVK
//             console.log("Before vMVK Storage Total Supply: " + vMvkStorage.totalSupply);        // return 1000 vMVK - 1,000,000,000 in muVMVK
//             console.log("Before Alice MVK Balance: "         + beforeMvkLedgerAlice.balance);   // return 491.67 MVK - 491,670,000 in muMVK
//             console.log("Before Alice vMVK Balance: "        + beforeVMvkLedgerAlice.balance);  // return 500 vMVK - 500,000,000 in muVMVK
    
//             console.log("---") // break
             
//             // Alice stakes more than what she has - 600 MVK tokens - 600,000,000 in muMVK
//             const failUnstakeAmountOperation = await doormanInstance.methods.unstake(600000000n);
//             await chai.expect(failUnstakeAmountOperation.send()).to.be.eventually.rejected;
            
//             afterMvkStorage     = await mvkTokenInstance.storage();
//             afterVMvkStorage    = await vMvkTokenInstance.storage();
//             afterDoormanStorage = await doormanInstance.storage();

//             const afterMvkLedgerAlice            = await afterMvkStorage.ledger.get(alice.pkh);
//             const afterVMvkLedgerAlice           = await afterVMvkStorage.ledger.get(alice.pkh);

//             console.log("Log Exit Fee: " + afterDoormanStorage.logExitFee);
//             console.log("Log Final Amount: " + afterDoormanStorage.logFinalAmount);         

//             // 8,330,000 muMVK as exit fee to be distributed as rewards
//             console.log("After MVK Storage Total Supply: "  + afterMvkStorage.totalSupply);    // return 991.67 MVK - 991,670,000 in muMVK
//             console.log("After vMVK Storage Total Supply: " + afterVMvkStorage.totalSupply);   // return 1000 vMVK - 1,000,000,000 in muVMVK
//             console.log("After Alice MVK Balance: "         + afterMvkLedgerAlice.balance);    // return 491.67 MVK - 491,670,000 in muMVK
//             console.log("After Alice vMVK Balance: "        + afterVMvkLedgerAlice.balance);   // return 1000 vMVK - 1,000,000,000 in muVMVK
//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break

//         } catch(e){
//             console.log(e);
//         }
//     });

// });
