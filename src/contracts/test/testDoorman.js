const doorman = artifacts.require('doorman');
const mvkToken = artifacts.require('mvkToken');
const vMvkToken = artifacts.require('vMvkToken');
const tempSender = artifacts.require('sender');

const { initialDoormanStorage } = require('../migrations/1_deploy_doorman.js');
const { initialMvkStorage } = require('../migrations/2_deploy_mvk_token.js');
const { initialVMvkStorage } = require('../migrations/3_deploy_vmvk_token.js');

const constants = require('../helpers/constants.js');
/**
 * For testing on a babylonnet (testnet), instead of the sandbox network,
 * make sure to replace the keys for alice/bob accordingly.
 */
const { alice, bob } = require('../scripts/sandbox/accounts');

contract('doorman', accounts => {
    let storage;
    let doormanInstance;
    let mvkTokenInstance;
    let vMvkTokenInstance;
    let senderInstance;
    
    before(async () => {
        doormanInstance = await doorman.deployed();
        console.log('Doorman Contract deployed at:', doormanInstance.address);
        doormanStorage = await doormanInstance.storage();

        mvkTokenInstance = await mvkToken.deployed();
        console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
        mvkStorage = await mvkTokenInstance.storage();

        vMvkTokenInstance = await vMvkToken.deployed();
        console.log('vMVK Token Contract deployed at:', vMvkTokenInstance.address);
        vMvkStorage = await vMvkTokenInstance.storage();
    
        await doormanInstance.setMvkTokenAddress(mvkTokenInstance.address);
        await doormanInstance.setVMvkTokenAddress(vMvkTokenInstance.address);
        await doormanInstance.storage();
        
        senderInstance = await tempSender.deployed();

    });

    it(`set mvk contract address`, async () => {
        try{
            
            // dummy contract address generated from previous tests
            // console.log('before (mvk contract address): '+ doormanStorage.mvkTokenAddress);
            const dummyMvkTokenAddress = "KT18jjki6TE4AkoNsU3iEJRgSxzWcoqKaf2S";

            const setMvkTokenAddress   = await doormanInstance.setMvkTokenAddress(dummyMvkTokenAddress);
            const afterDoormanStorage  = await doormanInstance.storage();

            // console.log('after (mvk contract address): '+ afterDoormanStorage.mvkTokenAddress);
            assert.equal(afterDoormanStorage.mvkTokenAddress, dummyMvkTokenAddress);

            // set back to original token address
            await doormanInstance.setMvkTokenAddress(mvkTokenInstance.address);        
            const resetDoormanStorage = await doormanInstance.storage();
            // console.log('reset (mvk contract address): '+ resetDoormanStorage.mvkTokenAddress);

        } catch (e){
            console.log(e);
        }
    });

    it(`set vMvk contract address`, async () => {
        try{
            
            // dummy contract address generated from previous tests
            // console.log('before (vMvk contract address): '+ doormanStorage.vMvkTokenAddress);
            const dummyVMvkTokenAddress = "KT18jjki6TE4AkoNsU3iEJRgSxzWcoqKaf2S";

            const setVMvkTokenAddress   = await doormanInstance.setVMvkTokenAddress(dummyVMvkTokenAddress);
            const afterDoormanStorage   = await doormanInstance.storage();

            // console.log('after (vMvk contract address): '+ afterDoormanStorage.vMvkTokenAddress);
            assert.equal(afterDoormanStorage.vMvkTokenAddress, dummyVMvkTokenAddress);

            // set back to original token address
            await doormanInstance.setVMvkTokenAddress(vMvkTokenInstance.address);        
            const resetDoormanStorage = await doormanInstance.storage();
            // console.log('reset (vMvk contract address): '+ resetDoormanStorage.vMvkTokenAddress);

        } catch (e){
            console.log(e);
        }
    });

    it(`set admin to bob`, async () => {
        try{
            
            console.log('before Admin (alice address): '+ doormanStorage.admin); // return alice.pkh        
        
            const setAdminAddress     = await doormanInstance.setAdmin(bob.pkh);
            const afterDoormanStorage = await doormanInstance.storage();

            console.log('after Admin (bob address): '+ afterDoormanStorage.admin); // return bob.pkh        
            assert.equal(afterDoormanStorage.admin, bob.pkh);

        } catch (e){
            console.log(e);
        }
    });


    it(`alice stake 100 MVK tokens`, async () => {
        try{

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Alice stake 100 MVK Tokens Test:") 
            console.log("---") // break

            console.log("Before MVK Storage: " + mvkStorage.totalSupply); // return 1000 MVK - 1,000,000,000 in muMVK
            console.log("Before vMVK Storage: " + vMvkStorage.totalSupply); // return 1000 vMVK - 1,000,000,000 in muVMVK
            const beforeMvkLedgerAlice  = await mvkStorage.ledger.get(alice.pkh);
            const beforeVMvkLedgerAlice = await vMvkStorage.ledger.get(alice.pkh);
            const beforeDoormanStorage  = await doormanInstance.storage();
            console.log("Before Alice MVK Balance: " + beforeMvkLedgerAlice.balance); // return 1000 MVK - 1,000,000,000 in muMVK
            console.log("Before Alice vMVK Balance: " + beforeVMvkLedgerAlice.balance); // return 1000 vMVK - 1,000,000,000 in muVMVK
    
            console.log("---") // break
             
            // Alice stake 100 MVK tokens - 100,000,000 in muMVK
            const stakeAmount = await doormanInstance.stake(100000000n);
            
            afterMvkStorage     = await mvkTokenInstance.storage();
            afterVMvkStorage    = await vMvkTokenInstance.storage();
            afterDoormanStorage = await doormanInstance.storage();

            const afterMvkLedgerAlice            = await afterMvkStorage.ledger.get(alice.pkh);
            const afterVMvkLedgerAlice           = await afterVMvkStorage.ledger.get(alice.pkh);
            const afterDoormanAliceUserRecord    = await afterDoormanStorage.userStakeLedger.get(alice.pkh); // return user staking records - map(nat, stakeRecordType)
            const afterDoormanAliceStakeRecord   = await afterDoormanAliceUserRecord.get("0");
            
            console.log("After MVK Storage: " + afterMvkStorage.totalSupply); // return 900 MVK - 900,000,000 in muMVK
            console.log("After vMVK Storage: " + afterVMvkStorage.totalSupply); // return 1100 vMVK - 1,100,000,000 in muVMVK
            console.log("After Alice MVK Balance: " + afterMvkLedgerAlice.balance); // return 900 MVK - 900,000,000 in muMVK
            console.log("After Alice vMVK Balance: " + afterVMvkLedgerAlice.balance); // return 1100 vMVK - 1,100,000,000 in muVMVK
            console.log("After Doorman Alice Record: " + afterDoormanAliceStakeRecord.amount + " " + afterDoormanAliceStakeRecord.opType + " with " + afterDoormanAliceStakeRecord.exitFee + " fee at " + afterDoormanAliceStakeRecord.time); // return "100000000 stake at 2021-10-26T10:14:54.000Z"
            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break

            assert.equal(afterMvkStorage.totalSupply, 900000000);
            assert.equal(afterVMvkStorage.totalSupply, 1100000000);
            assert.equal(afterMvkLedgerAlice.balance, 900000000);
            assert.equal(afterVMvkLedgerAlice.balance, 1100000000);
            assert.equal(afterDoormanAliceStakeRecord.amount, 100000000);

        } catch(e){
            console.log(e);
        }
    });

    it(`alice unstake 100 vMVK tokens`, async () => {
        try{

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Alice unstake 100 vMVK Tokens Test:") 
            console.log("---") // break
            
            const beforeDoormanStorage  = await doormanInstance.storage();
            const beforeMvkStorage      = await mvkTokenInstance.storage();
            const beforeVMvkStorage     = await vMvkTokenInstance.storage();
            const beforeMvkLedgerAlice  = await mvkStorage.ledger.get(alice.pkh);
            const beforeVMvkLedgerAlice = await vMvkStorage.ledger.get(alice.pkh);

            console.log('before');        
            console.log("Before MVK Storage: " + beforeMvkStorage.totalSupply); // return 900 MVK - 900,000,000 in muMVK
            console.log("Before vMVK Storage: " + beforeVMvkStorage.totalSupply); // return 1100 vMVK - 1,100,000,000 in muVMVK       
            console.log("Before Alice MVK Balance: " + beforeMvkLedgerAlice.balance); // return 900 - 900,000,000 in muMVK
            console.log("Before Alice vMVK Balance: " + beforeVMvkLedgerAlice.balance); // return 1100 - 1,100,000,000 in muVMVK       
    
            console.log("---") // break

            // Alice unstake 100 vMVK tokens - 100,000,000 in muVMVK    
            const stakeAmount  = await doormanInstance.unstake(100000000n);

            afterMvkStorage     = await mvkTokenInstance.storage();
            afterVMvkStorage    = await vMvkTokenInstance.storage();
            afterDoormanStorage = await doormanInstance.storage();

            const afterMvkLedgerAlice            = await afterMvkStorage.ledger.get(alice.pkh);
            const afterVMvkLedgerAlice           = await afterVMvkStorage.ledger.get(alice.pkh);
            const afterDoormanAliceUserRecord    = await afterDoormanStorage.userStakeLedger.get(alice.pkh); // return user staking records - map(nat, stakeRecordType)
            const afterDoormanAliceStakeRecord   = await afterDoormanAliceUserRecord.get("1"); // return { amount: 100, fee: 0, op_type: 'stake', time: '2021-10-26T10:14:54.000Z' }

            console.log("Log Exit Fee: " + afterDoormanStorage.logExitFee);
            console.log("Log Final Amount: " + afterDoormanStorage.logFinalAmount);
            console.log('after');                    

            // 8,330,000 muMVK as exit fee to be distributed as rewards
            console.log("After MVK Storage: " + afterMvkStorage.totalSupply); // return 991.67 MVK - 991,670,000 in muMVK
            console.log("After vMVK Storage: " + afterVMvkStorage.totalSupply); // return 1000 vMVK - 1,000,000,000 in muVMVK
            console.log("After Alice MVK Balance: " + afterMvkLedgerAlice.balance); // return 991.67 MVK - 991,670,000 in muMVK
            console.log("After Alice vMVK Balance: " + afterVMvkLedgerAlice.balance); // return 1000 vMVK - 1,000,000,000 in muVMVK
            console.log("After Doorman Alice Record: " + afterDoormanAliceStakeRecord.amount + " " + afterDoormanAliceStakeRecord.opType + " with " + afterDoormanAliceStakeRecord.exitFee + " fee at " + afterDoormanAliceStakeRecord.time); // return "100000000 unstake with 8330000 fee at 2021-10-26T10:14:54.000Z"
            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break

            assert.equal(afterMvkStorage.totalSupply, 991670000);
            assert.equal(afterVMvkStorage.totalSupply, 1000000000);
            assert.equal(afterMvkLedgerAlice.balance, 991670000);
            assert.equal(afterVMvkLedgerAlice.balance, 1000000000);
            assert.equal(afterDoormanAliceStakeRecord.amount, 100000000);
            assert.equal(afterDoormanAliceStakeRecord.exitFee, 8330000);
             
        } catch(e){
            console.log(e);
        }
    });

});