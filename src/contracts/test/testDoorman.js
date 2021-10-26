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

            const setMvkTokenAddress = await doormanInstance.setMvkTokenAddress(dummyMvkTokenAddress);
            const afterDoormanStorage = await doormanInstance.storage();

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

            const setVMvkTokenAddress = await doormanInstance.setVMvkTokenAddress(dummyVMvkTokenAddress);
            const afterDoormanStorage = await doormanInstance.storage();

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
        
            const setAdminAddress = await doormanInstance.setAdmin(bob.pkh);
            const afterDoormanStorage = await doormanInstance.storage();

            console.log('after Admin (bob address): '+ afterDoormanStorage.admin); // return bob.pkh        
            assert.equal(afterDoormanStorage.admin, bob.pkh);

        } catch (e){
            console.log(e);
        }
    });


    it(`alice stake 100 MVK tokens`, async () => {
        try{

            console.log("Alice stake 100 MVK Tokens Test:") 
            console.log("Before MVK Storage: " + mvkStorage.totalSupply); // return 1000 MVK
            console.log("Before vMVK Storage: " + vMvkStorage.totalSupply); // return 1000 vMVK
            const beforeMvkLedgerAlice = await mvkStorage.ledger.get(alice.pkh);
            const beforeVMvkLedgerAlice = await vMvkStorage.ledger.get(alice.pkh);
            console.log("Before Alice MVK Balance: " + beforeMvkLedgerAlice.balance); // return 1000 MVK
            console.log("Before Alice vMVK Balance: " + beforeVMvkLedgerAlice.balance); // return 1000 vMVK
    
            console.log("---") // break
             
            // Alice stake 100 MVK tokens
            const stakeAmount = await doormanInstance.stake(100n);
            
            afterMvkStorage = await mvkTokenInstance.storage();
            afterVMvkStorage = await vMvkTokenInstance.storage();
            afterDoormanStorage = await doormanInstance.storage();

            const afterMvkLedgerAlice = await afterMvkStorage.ledger.get(alice.pkh);
            const afterVMvkLedgerAlice = await afterVMvkStorage.ledger.get(alice.pkh);
            const afterDoormanAliceStakeRecordId  = await afterDoormanStorage.addressId.get(alice.pkh); // return 1
            const afterDoormanAliceStakeRecordMap = await afterDoormanStorage.userStakeRecord.get(afterDoormanAliceStakeRecordId); // return map - i.e. big_map (nat, map (address, stakeRecord))
            const afterDoormanAliceStakeRecord    = await afterDoormanAliceStakeRecordMap.get(alice.pkh); // return { amount: 100, op_type: 'stake', time: '2021-10-26T10:14:54.000Z' }
            
            console.log("After MVK Storage: " + afterMvkStorage.totalSupply); // return 900 MVK
            console.log("After vMVK Storage: " + afterVMvkStorage.totalSupply); // return 1100 vMVK
            console.log("After Alice MVK Balance: " + afterMvkLedgerAlice.balance); // return 900 MVK
            console.log("After Alice vMVK Balance: " + afterVMvkLedgerAlice.balance); // return 1100 vMVK
            console.log("After Doorman Alice Record: " + afterDoormanAliceStakeRecord.amount + " " + afterDoormanAliceStakeRecord.op_type + " at " + afterDoormanAliceStakeRecord.time); // return "100 stake at 2021-10-26T10:14:54.000Z"

            assert.equal(afterMvkLedgerAlice.balance, 900);
            assert.equal(afterVMvkLedgerAlice.balance, 1100);

        } catch(e){
            console.log(e);
        }
    });

    // it(`alice unstake 100 vMVK tokens`, async () => {
    //     try{

    //         console.log("Alice unstake 100 vMVK Tokens Test:") 
    //         console.log("Before MVK Storage: " + mvkStorage.totalSupply); // return 1000
    //         console.log("Before vMVK Storage: " + vMvkStorage.totalSupply); // return 1000
    //         const beforeMvkLedgerAlice = await mvkStorage.ledger.get(alice.pkh);
    //         const beforeVMvkLedgerAlice = await vMvkStorage.ledger.get(alice.pkh);
    //         console.log("Before Alice MVK Balance: " + beforeMvkLedgerAlice.balance); // return 1000
    //         console.log("Before Alice vMVK Balance: " + beforeVMvkLedgerAlice.balance); // return 1000
    
    //         console.log("---") // break

    //         // Alice unstake 100 vMVK tokens
    //         const stakeAmount = await doormanInstance.unstake(100n);
             

    //     } catch(e){
    //         console.log(e);
    //     }
    // });



});