const doorman = artifacts.require('doorman');
const mvkToken = artifacts.require('mvkToken');
const delegation = artifacts.require('delegation');
const exitFeePool = artifacts.require('exitFeePool');

const chai = require("chai");
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

const { MichelsonMap } = require("@taquito/michelson-encoder");
const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
const { InMemorySigner, importKey } = require("@taquito/signer");

/**
 * For testing on a babylonnet (testnet), instead of the sandbox network,
 * make sure to replace the keys for alice/bob accordingly.
 */
const { alice, bob, eve, mallory } = require('../scripts/sandbox/accounts');
const truffleConfig = require("../truffle-config.js");

contract('doorman', async() => {
    let doormanInstance;
    let exitFeePoolInstance;
    let mvkTokenInstance;

    const signerFactory = async (pk) => {
        await Tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
        return Tezos;
      };
    
    before(async () => {

        Tezos.setProvider({
            rpc: `${truffleConfig.networks.development.host}:${truffleConfig.networks.development.port}`            
        })

        // default: set alice (admin) as originator of transactions
        await signerFactory(alice.sk);

        doormanInstance   = await doorman.deployed();
        doormanInstance   = await Tezos.contract.at(doormanInstance.address);

        exitFeePoolInstance   = await exitFeePool.deployed();
        exitFeePoolInstance   = await Tezos.contract.at(exitFeePoolInstance.address);

        mvkTokenInstance  = await mvkToken.deployed();        
        mvkTokenInstance  = await Tezos.contract.at(mvkTokenInstance.address);
        
        delegationInstance = await delegation.deployed();
        delegationInstance = await Tezos.contract.at(delegationInstance.address);

        doormanStorage    = await doormanInstance.storage();
        mvkStorage        = await mvkTokenInstance.storage();
        delegationStorage = await delegationInstance.storage();

        console.log('-- -- -- -- -- Deployments -- -- -- --')
        console.log('Doorman Contract deployed at:', doormanInstance.address);
        console.log('MVK Contract deployed at:', mvkTokenInstance.address);
        console.log('Exit Fee Pool Contract deployed at:', exitFeePoolInstance.address);
        console.log('Delegation Contract deployed at:', delegationInstance.address);
        console.log('Alice address: ' + alice.pkh);
        console.log('Bob address: ' + bob.pkh);
        console.log('Eve address: ' + eve.pkh);
        console.log('Mallory address: ' + mallory.pkh);
        console.log('Doorman admin: ' + doormanStorage.admin);

    });

    // it(`admin set mvk contract address`, async () => {
    //     try{
            
    //         console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
    //         console.log('Test: Admin set MVK Contract Address')
    //         console.log("---") // break

    //         console.log('Before (mvk contract address): '+ doormanStorage.mvkTokenAddress);

    //         // dummy contract address generated from previous tests
    //         const dummyMvkTokenAddress = "KT18jjki6TE4AkoNsU3iEJRgSxzWcoqKaf2S";
    //         console.log("Dummy MVK Token Address: "+dummyMvkTokenAddress);

    //         const setMvkTokenAddressOperation = await doormanInstance.methods.setMvkTokenAddress(dummyMvkTokenAddress).send();
    //         await setMvkTokenAddressOperation.confirmation();

    //         // const operationEstimate = await Tezos.estimate.transfer(doormanInstance.methods.setMvkTokenAddress(dummyMvkTokenAddress).toTransferParams());
    //         // console.log(operationEstimate);

    //         const afterDoormanStorage  = await doormanInstance.storage();

    //         console.log('After (mvk contract address): '+ afterDoormanStorage.mvkTokenAddress);
    //         assert.equal(afterDoormanStorage.mvkTokenAddress, dummyMvkTokenAddress);

    //         // set back to original token address
    //         const resetMvkTokenAddressOperation = await doormanInstance.methods.setMvkTokenAddress(mvkTokenInstance.address).send();
    //         await resetMvkTokenAddressOperation.confirmation();

    //         console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
        
    //     } catch (e){
    //         console.log(e);
    //     }
    // });

    it(`alice stake 100 MVK tokens`, async () => {
        try{

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: Alice stake 100 MVK Tokens") 
            console.log("---") // break

            const beforeMvkLedgerAlice  = await mvkStorage.ledger.get(alice.pkh);
            const beforeDoormanStorage  = await doormanInstance.storage();

            console.log("Before MVK Storage Total Supply: "  + mvkStorage.totalSupply);         // return 1000 MVK - 1,000,000,000 in muMVK
            console.log("Before Alice MVK Balance: "         + beforeMvkLedgerAlice.balance);   // return 500 MVK - 500,000,000 in muMVK
    
            console.log("---") // break
             
            // Alice stake 100 MVK tokens - 100,000,000 in muMVK
            const stakeAmountOperation = await doormanInstance.methods.stake(100000000n).send();
            await stakeAmountOperation.confirmation();

            const operationEstimate = await Tezos.estimate.transfer(doormanInstance.methods.stake(100000000n).toTransferParams());
            console.log(operationEstimate);
            
            afterMvkStorage     = await mvkTokenInstance.storage();
            afterDoormanStorage = await doormanInstance.storage();

            const afterMvkLedgerAlice            = await afterMvkStorage.ledger.get(alice.pkh);
            const afterDoormanAliceUserRecord    = await afterDoormanStorage.userStakeRecordsLedger.get(alice.pkh); // return user staking records - map(nat, stakeRecordType)
            const afterDoormanAliceStakeRecord   = await afterDoormanAliceUserRecord.get("0");               // return { amount: 100000000, exitFee: 0, opType: 'stake', time: '2021-10-26T10:14:54.000Z' }
            const afterDoormanAliceStakeBalance    = await afterDoormanStorage.userStakeBalanceLedger.get(alice.pkh); // return user staking records - map(nat, stakeRecordType)
            
            console.log("After MVK Storage Total Supply: "  + afterMvkStorage.totalSupply);    // return 900 MVK - 900,000,000 in muMVK
            console.log("After Alice MVK Balance: "         + afterMvkLedgerAlice.balance);    // return 400 MVK - 400,000,000 in muMVK
            console.log("After Doorman Alice Record: "      + afterDoormanAliceStakeRecord.amount + " " + afterDoormanAliceStakeRecord.opType + " with " + afterDoormanAliceStakeRecord.exitFee + " fee at " + afterDoormanAliceStakeRecord.time); // return "100000000 stake at 2021-10-26T10:14:54.000Z"
            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break

            console.log(afterDoormanStorage);
            console.log(afterDoormanAliceStakeBalance);

            // assert.equal(afterMvkStorage.totalSupply, 900000000);
            // assert.equal(afterMvkLedgerAlice.balance, 400000000);
            // assert.equal(afterDoormanAliceStakeRecord.amount, 100000000);

        } catch(e){
            console.log(e);
        }
    });

    it(`alice unstake 50 MVK tokens`, async () => {
        try{

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: Alice unstake 50 MVK Tokens Test:") 
            console.log("---") // break
            
            const beforeDoormanStorage  = await doormanInstance.storage();
            const beforeMvkStorage      = await mvkTokenInstance.storage();
            const beforeMvkLedgerAlice  = await mvkStorage.ledger.get(alice.pkh);

            console.log("Before MVK Storage Total Supply: "  + beforeMvkStorage.totalSupply);   // return 900 MVK - 900,000,000 in muMVK
            console.log("Before Alice MVK Balance: "         + beforeMvkLedgerAlice.balance);   // return 400 - 400,000,000 in muMVK
    
            console.log("---") // break

            // Alice unstake 100 MVK tokens - 100,000,000 in muMVK    
            const unstakeAmountOperation  = await doormanInstance.methods.unstake(50000000n).send();
            await unstakeAmountOperation.confirmation();

            const operationEstimate = await Tezos.estimate.transfer(doormanInstance.methods.unstake(50000000n).toTransferParams());
            console.log(operationEstimate);

            afterMvkStorage     = await mvkTokenInstance.storage();
            afterDoormanStorage = await doormanInstance.storage();

            const afterMvkLedgerAlice            = await afterMvkStorage.ledger.get(alice.pkh);

            const userStakeBalanceLedger = await afterDoormanStorage.userStakeBalanceLedger;
            const exitFeePoolStakeBalanceLedger = await afterDoormanStorage.userStakeBalanceLedger.get(exitFeePoolInstance.address);

            const afterDoormanAliceUserRecord    = await afterDoormanStorage.userStakeRecordsLedger.get(alice.pkh); // return user staking records - map(nat, stakeRecordType)
            const afterDoormanAliceStakeRecord   = await afterDoormanAliceUserRecord.get("1");               // return { amount: 100000000, exitFee: 8330000, opType: 'unstake', time: '2021-10-26T10:14:54.000Z' }

            console.log("Log Exit Fee: " + afterDoormanStorage.logExitFee);
            console.log("Log Final Amount: " + afterDoormanStorage.logFinalAmount);         

            // 8,330,000 muMVK as exit fee to be distributed as rewards
            console.log("After MVK Storage Total Supply: "  + afterMvkStorage.totalSupply);    // return 991.67 MVK - 991,670,000 in muMVK
            console.log("After Alice MVK Balance: "         + afterMvkLedgerAlice.balance);    // return 491.67 MVK - 491,670,000 in muMVK
            console.log("After Doorman Alice Record: "      + afterDoormanAliceStakeRecord.amount + " " + afterDoormanAliceStakeRecord.opType + " with " + afterDoormanAliceStakeRecord.exitFee + " fee at " + afterDoormanAliceStakeRecord.time); // return "100000000 unstake with 8330000 fee at 2021-10-26T10:14:54.000Z"
            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break

            // assert.equal(afterMvkStorage.totalSupply, 991670000);
            // assert.equal(afterMvkLedgerAlice.balance, 491670000);
            // assert.equal(afterDoormanAliceStakeRecord.amount, 100000000);
            // assert.equal(afterDoormanAliceStakeRecord.exitFee, 8330000);

            console.log(afterDoormanStorage);
            // console.log(userStakeBalanceLedger);
            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log('exit fee pool')
            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log(exitFeePoolStakeBalanceLedger);
             
        } catch(e){
            console.log(e);
        }
    });

    it(`bob, eve, and mallory stakes 150 MVK and unstakes 50 MVK tokens`, async () => {
        try{

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: Bob, Eve, and Mallory stakes 150 MVK and unstakes 50 MVK Tokens Test:") 
            console.log("---") // break
            
            const beforeDoormanStorage  = await doormanInstance.storage();
            const beforeMvkStorage      = await mvkTokenInstance.storage();

            console.log("Before MVK Storage Total Supply: "  + beforeMvkStorage.totalSupply);   // return 900 MVK - 900,000,000 in muMVK
    
            console.log("---") // break

            // Bob unstake 100 MVK tokens - 100,000,000 in muMVK    
            await signerFactory(bob.sk)
            const bobStakeAmountOperation  = await doormanInstance.methods.stake(150000000n).send();
            await bobStakeAmountOperation.confirmation();

            const bobUnstakeAmountOperation  = await doormanInstance.methods.unstake(50000000n).send();
            await bobUnstakeAmountOperation.confirmation();

            // Eve unstake 100 MVK tokens - 100,000,000 in muMVK    
            await signerFactory(eve.sk)
            const eveStakeAmountOperation  = await doormanInstance.methods.stake(150000000n).send();
            await eveStakeAmountOperation.confirmation();

            const eveUnstakeAmountOperation  = await doormanInstance.methods.unstake(50000000n).send();
            await eveUnstakeAmountOperation.confirmation();

            // Mallory unstake 100 MVK tokens - 100,000,000 in muMVK    
            await signerFactory(mallory.sk)
            const malloryStakeAmountOperation  = await doormanInstance.methods.stake(150000000n).send();
            await malloryStakeAmountOperation.confirmation();

            const malloryUnstakeAmountOperation  = await doormanInstance.methods.unstake(50000000n).send();
            await malloryUnstakeAmountOperation.confirmation();

            afterMvkStorage     = await mvkTokenInstance.storage();
            afterDoormanStorage = await doormanInstance.storage();

            const userStakeBalanceLedger = await afterDoormanStorage.userStakeBalanceLedger;
            const exitFeePoolStakeBalanceLedger = await afterDoormanStorage.userStakeBalanceLedger.get(exitFeePoolInstance.address);

            const userStakeRecordsLedger = await afterDoormanStorage.userStakeRecordsLedger;
            const exitFeePoolUserRecord    = await userStakeRecordsLedger.get(exitFeePoolInstance.address); // return user staking records - map(nat, stakeRecordType)
            
            const bobUserRecord    = await afterDoormanStorage.userStakeRecordsLedger.get(bob.pkh); // return user staking records - map(nat, stakeRecordType)
            const bobStakeBalanceLedger = await afterDoormanStorage.userStakeBalanceLedger.get(bob.pkh);

            // console.log(bobUserRecord);
            // console.log(bobStakeBalanceLedger);
            console.log('stake records');
            console.log('exit fee pool address: ' + exitFeePoolInstance.address);
            console.log(userStakeRecordsLedger);

            console.log(exitFeePoolUserRecord);
            
            console.log("Log Exit Fee: " + afterDoormanStorage.logExitFee);
            console.log("Log Final Amount: " + afterDoormanStorage.logFinalAmount);         

            // 8,330,000 muMVK as exit fee to be distributed as rewards
            console.log("After MVK Storage Total Supply: "  + afterMvkStorage.totalSupply);    // return 991.67 MVK - 991,670,000 in muMVK
            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break

            // assert.equal(afterMvkStorage.totalSupply, 991670000);
            // assert.equal(afterMvkLedgerAlice.balance, 491670000);
            // assert.equal(afterDoormanAliceStakeRecord.amount, 100000000);
            // assert.equal(afterDoormanAliceStakeRecord.exitFee, 8330000);

            console.log(afterDoormanStorage);
            // console.log(userStakeBalanceLedger);
            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log('exit fee pool')
            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log(exitFeePoolStakeBalanceLedger);
             
        } catch(e){
            console.log(e);
        }
    });

    it(`test distribute exit fee`, async () => {
        try{

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: Distribute exit fee:") 
            console.log("---") // break
            
            // const beforeDoormanStorage  = await doormanInstance.storage();
            // const beforeMvkStorage      = await mvkTokenInstance.storage();

            // console.log("Before MVK Storage Total Supply: "  + beforeMvkStorage.totalSupply);   // return 900 MVK - 900,000,000 in muMVK
    
            console.log("---") // break

            // const aliceStakeBalanceLedger = await beforeDoormanStorage.userStakeBalanceLedger.get(alice.pkh);
            // const bobStakeBalanceLedger = await beforeDoormanStorage.userStakeBalanceLedger.get(bob.pkh);
            // const eveStakeBalanceLedger = await beforeDoormanStorage.userStakeBalanceLedger.get(eve.pkh);
            // const malloryStakeBalanceLedger = await beforeDoormanStorage.userStakeBalanceLedger.get(mallory.pkh);

            // console.log(aliceStakeBalanceLedger);   // 50 staked MVK - 0.142857 - 14.2857%
            // console.log(bobStakeBalanceLedger);     // 100 staked MVK - 0.2857142 - 28.57142%
            // console.log(eveStakeBalanceLedger);     // 100 staked MVK - 0.2857142 - 28.57142%
            // console.log(malloryStakeBalanceLedger); // 100 staked MVK - 0.2857142 - 28.57142%
            
            // amount in exit fee reward pool - 36360000 - 36.36 MVK 
            // alice to receive 14.2857% * 36360000 = 5194285.714 -> 5.194 MVK

            await signerFactory(alice.sk)
            // const distributeExitFeeOperation  = await doormanInstance.methods.distributeExitFeeReward(alice.pkh, 5194285).send();
            // await distributeExitFeeOperation.confirmation();

            const distributeExitFeeOperation  = await exitFeePoolInstance.methods.distribute(alice.pkh, 5194285).send();
            await distributeExitFeeOperation.confirmation();


            const operationEstimate = await Tezos.estimate.transfer(exitFeePoolInstance.methods.distribute(alice.pkh, 5194285).toTransferParams());
            console.log(operationEstimate);

            // Estimate {
            //     _gasLimit: 247954,
            //     _storageLimit: 127,
            //     opSize: 151,
            //     baseFeeMutez: 100
            //   }
            // (0.1 * 247954) + (1 * 127) + 100 => 25022.4 -> 0.025022 tez


            // afterMvkStorage     = await mvkTokenInstance.storage();
            // afterDoormanStorage = await doormanInstance.storage();

            // const userStakeBalanceLedger = await afterDoormanStorage.userStakeBalanceLedger;
            // const exitFeePoolStakeBalanceLedger = await afterDoormanStorage.userStakeBalanceLedger.get(exitFeePoolInstance.address);

            // const userStakeRecordsLedger = await afterDoormanStorage.userStakeRecordsLedger;
            // const exitFeePoolUserRecord    = await userStakeRecordsLedger.get(exitFeePoolInstance.address); // return user staking records - map(nat, stakeRecordType)
            
            // const bobUserRecord    = await afterDoormanStorage.userStakeRecordsLedger.get(bob.pkh); // return user staking records - map(nat, stakeRecordType)
            // const bobStakeBalanceLedger = await afterDoormanStorage.userStakeBalanceLedger.get(bob.pkh);

            // // console.log(bobUserRecord);
            // // console.log(bobStakeBalanceLedger);
            // console.log('stake records');
            // console.log('exit fee pool address: ' + exitFeePoolInstance.address);
            // console.log(userStakeRecordsLedger);

            // console.log(exitFeePoolUserRecord);
            
            // console.log("Log Exit Fee: " + afterDoormanStorage.logExitFee);
            // console.log("Log Final Amount: " + afterDoormanStorage.logFinalAmount);         

            // // 8,330,000 muMVK as exit fee to be distributed as rewards
            // console.log("After MVK Storage Total Supply: "  + afterMvkStorage.totalSupply);    // return 991.67 MVK - 991,670,000 in muMVK
            // console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break

            // assert.equal(afterMvkStorage.totalSupply, 991670000);
            // assert.equal(afterMvkLedgerAlice.balance, 491670000);
            // assert.equal(afterDoormanAliceStakeRecord.amount, 100000000);
            // assert.equal(afterDoormanAliceStakeRecord.exitFee, 8330000);

            // console.log(afterDoormanStorage);
            // console.log(userStakeBalanceLedger);
            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            // console.log('exit fee pool')
            // console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            // console.log(exitFeePoolStakeBalanceLedger);
             
        } catch(e){
            console.log(e);
        }
    });

});