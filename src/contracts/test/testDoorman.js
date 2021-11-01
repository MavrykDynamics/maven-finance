const doorman = artifacts.require('doorman');
const mvkToken = artifacts.require('mvkToken');
const vMvkToken = artifacts.require('vMvkToken');

const chai = require("chai");
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

// const { initialDoormanStorage } = require('../migrations/1_deploy_doorman.js');
// const { initialMvkStorage } = require('../migrations/2_deploy_mvk_token.js');
// const { initialVMvkStorage } = require('../migrations/3_deploy_vmvk_token.js');
// const { confirmOperation } = require("./helpers/confirmation");

const { MichelsonMap } = require("@taquito/michelson-encoder");
const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
const { InMemorySigner, importKey } = require("@taquito/signer");

const constants = require('../helpers/constants.js');

/**
 * For testing on a babylonnet (testnet), instead of the sandbox network,
 * make sure to replace the keys for alice/bob accordingly.
 */

const { alice, bob } = require('../scripts/sandbox/accounts');
// const { TezBridgeSigner } = require("@taquito/tezbridge-signer");
// const userStakeLedger = MichelsonMap.fromLiteral({});
// const adminAddress = alice.pkh;
// const tempMvkTotalSupply = '1000000000';
// const tempVMvkTotalSupply = '1000000000';

contract('doorman', async() => {
    let doormanInstance;
    let mvkTokenInstance;
    let vMvkTokenInstance;
    let senderInstance;
    
    before(async () => {

        Tezos.setProvider({
            rpc: "http://localhost:8732",
            signer: await InMemorySigner.fromSecretKey(alice.sk)
        })

        doormanInstance = await doorman.deployed();
        doormanInstance = await Tezos.contract.at(doormanInstance.address);

        mvkTokenInstance = await mvkToken.deployed();        
        mvkTokenInstance = await Tezos.contract.at(mvkTokenInstance.address);

        vMvkTokenInstance = await vMvkToken.deployed();        
        vMvkTokenInstance = await Tezos.contract.at(vMvkTokenInstance.address);
        
        doormanStorage  = await doormanInstance.storage();
        mvkStorage      = await mvkTokenInstance.storage();
        vMvkStorage     = await vMvkTokenInstance.storage();

        console.log('-- -- -- -- -- Deployments -- -- -- -- --')
        console.log('Doorman Contract deployed at:', doormanInstance.address);
        console.log('MVK Contract deployed at:', mvkTokenInstance.address);
        console.log('vMVK Contract deployed at:', vMvkTokenInstance.address);
        console.log('Alice address: ' + alice.pkh);
        console.log('Bob address: ' + bob.pkh);
        console.log('Doorman admin: ' + doormanStorage.admin);


        // doormanStorage = await doormanInstance.storage();
        // console.log("doorman storage: "+doormanStorage);

        // const initDoormanStorage = {
        //     admin               : adminAddress,
        //     mvkTokenAddress     : 'KT1UkahzqCvaVrVutMeTSCJqS2qBFhLjvSAk',  // TODO: Change to empty address + call setAddress after token deployed
        //     vMvkTokenAddress    : 'KT1UkahzqCvaVrVutMeTSCJqS2qBFhLjvSAk',  // TODO: Change to empty address + call setAddress after token deployed
        //     userStakeLedger     : userStakeLedger,
        //     tempMvkTotalSupply  : tempMvkTotalSupply,
        //     tempVMvkTotalSupply : tempVMvkTotalSupply,
        //     logExitFee          : '1',  // for testing purposes only - to be removed on deployment
        //     logFinalAmount      : '1',  // for testing purposes only - to be removed on deployment    
        // }

        // operation = await Tezos.contract.originate({
        //     code: JSON.parse(doorman.michelson),
        //     storage: initDoormanStorage,
        // });

        // await confirmOperation(Tezos, operation.hash);

        // doormanInstance = await Tezos.contract.at(operation.contractAddress);

        // console.log(doormanInstance);

        // doormanInstance = await Tezos.contract.originate({
        //     code: JSON.parse(doorman.michelson),
        //     storage: initDoormanStorage,
        // })
        // .then((originationOp) => {
        //   console.log(`Waiting for confirmation of origination for ${originationOp.contractAddress}...`);
        //   return originationOp.contract();
        // })
        // .then((contract) => {
        //     console.log(`Origination completed.`);
        // })
        // .catch((error) => console.log(`Error: ${JSON.stringify(error, null, 2)}`));
    

    //     doormanInstance = await doorman.deployed();
    //     console.log('Doorman Contract deployed at:', doormanInstance.address);

    //     mvkTokenInstance = await mvkToken.deployed();
    //     console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
        // mvkStorage = await mvkTokenInstance.storage();

    //     vMvkTokenInstance = await vMvkToken.deployed();
    //     console.log('vMVK Token Contract deployed at:', vMvkTokenInstance.address);
    //     vMvkStorage = await vMvkTokenInstance.storage();

        
    //     // senderInstance = await tempSender.deployed();

    });

    it(`admin set mvk contract address`, async () => {
        try{
            
            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log('Test: Admin set MVK Contract Address')
            console.log("---") // break

            console.log('Before (mvk contract address): '+ doormanStorage.mvkTokenAddress);

            // dummy contract address generated from previous tests
            const dummyMvkTokenAddress = "KT18jjki6TE4AkoNsU3iEJRgSxzWcoqKaf2S";
            console.log("Dummy MVK Token Address: "+dummyMvkTokenAddress);

            const setMvkTokenAddressOperation = await doormanInstance.methods.setMvkTokenAddress(dummyMvkTokenAddress).send();
            await setMvkTokenAddressOperation.confirmation();

            const afterDoormanStorage  = await doormanInstance.storage();

            console.log('After (mvk contract address): '+ afterDoormanStorage.mvkTokenAddress);
            assert.equal(afterDoormanStorage.mvkTokenAddress, dummyMvkTokenAddress);

            // set back to original token address
            const resetMvkTokenAddressOperation = await doormanInstance.methods.setMvkTokenAddress(mvkTokenInstance.address).send();
            await resetMvkTokenAddressOperation.confirmation();
        
        } catch (e){
            console.log(e);
        }
    });

    it(`non-admin cannot set mvk contract address`, async () => {
        try{
            
            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log('Test: Non-Admin cannot set MVK Contract Address')
            console.log("---") // break
            
            console.log('Before (mvk contract address): '+ doormanStorage.mvkTokenAddress);

            // dummy contract address generated from previous tests 
            const dummyMvkTokenAddress = "KT18jjki6TE4AkoNsU3iEJRgSxzWcoqKaf2S";
            console.log("Dummy MVK Token Address: "+dummyMvkTokenAddress);

            const failSetMvkTokenAddressOperation = await doormanInstance.methods.setMvkTokenAddress(dummyMvkTokenAddress);
            await chai.expect(failSetMvkTokenAddressOperation.send({source: bob.pkh})).to.be.eventually.rejected;

        } catch (e){
            console.log(e);
        }
    });

    it(`admin set vMvk contract address`, async () => {
        try{
            
            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log('Test: Admin set vMVK Contract Address')
            console.log("---") // break

            console.log('before (vMvk contract address): '+ doormanStorage.vMvkTokenAddress);

            // dummy contract address generated from previous tests
            const dummyVMvkTokenAddress = "KT18jjki6TE4AkoNsU3iEJRgSxzWcoqKaf2S";
            console.log("Dummy vMVK Token Address: "+dummyVMvkTokenAddress);

            const setVMvkTokenAddressOperation = await doormanInstance.methods.setVMvkTokenAddress(dummyVMvkTokenAddress).send();
            await setVMvkTokenAddressOperation.confirmation();

            const afterDoormanStorage  = await doormanInstance.storage();

            console.log('After (vMvk contract address): '+ afterDoormanStorage.vMvkTokenAddress);
            assert.equal(afterDoormanStorage.vMvkTokenAddress, dummyVMvkTokenAddress);
            
            // set back to original token address
            const resetVMvkTokenAddressOperation = await doormanInstance.methods.setVMvkTokenAddress(vMvkTokenInstance.address).send();
            await resetVMvkTokenAddressOperation.confirmation();

        } catch (e){
            console.log(e);
        }
    });

    it(`non-admin cannot set vMvk contract address`, async () => {
        try{
            
            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log('Test: Non-Admin cannot set vMVK Contract Address')
            console.log("---") // break
            
            console.log('Before (vMvk contract address): '+ doormanStorage.vMvkTokenAddress);

            // dummy contract address generated from previous tests 
            const dummyVMvkTokenAddress = "KT18jjki6TE4AkoNsU3iEJRgSxzWcoqKaf2S";
            console.log("Dummy vMVK Token Address: "+dummyVMvkTokenAddress);

            const failSetVMvkTokenAddressOperation = await doormanInstance.methods.setVMvkTokenAddress(dummyVMvkTokenAddress);
            await chai.expect(failSetVMvkTokenAddressOperation.send({source: bob.pkh})).to.be.eventually.rejected;

        } catch (e){
            console.log(e);
        }
    });

    // it(`set admin to bob`, async () => {
    //     try{
            
    //         console.log('---- ---- ----')
    //         console.log('Test: Set Admin to Bob')
    //         console.log('before Admin (alice address): '+ doormanStorage.admin); // return alice.pkh        
        
    //         const setAdminAddressOperation  = await doormanInstance.methods.setAdmin(bob.pkh).send({source: alice.pkh});
    //         await setAdminAddressOperation.confirmation();

    //         const afterDoormanStorage = await doormanInstance.storage();

    //         console.log('after Admin (bob address): '+ afterDoormanStorage.admin); // return bob.pkh        
    //         assert.equal(afterDoormanStorage.admin, bob.pkh);

    //         console.log('new admin set');

    //         // console.log(afterDoormanStorage);

    //         const resetAdminAddressOperation  = await doormanInstance.methods.setAdmin(alice.pkh).send();
    //         await resetAdminAddressOperation.confirmation();

    //         console.log('reset');
    //         // console.log(afterDoormanStorage);

    //     } catch (e){
    //         console.log(e);
    //     }
    // });

    // it(`non-admin cannot set admin`, async () => {
    //     try{
            
    //         console.log('---- ---- ----')
    //         console.log('Test: Non-admin cannot set admin')
    //         console.log('before Admin (alice address): '+ doormanStorage.admin); // return alice.pkh        
        
    //         const setAdminAddressOperation  = await doormanInstance.methods.setAdmin(bob.pkh).send({source: bob.pkh});
    //         await setAdminAddressOperation.confirmation(); // should fail

    //         const afterDoormanStorage = await doormanInstance.storage();

    //         console.log('after Admin (bob address): '+ afterDoormanStorage.admin); // return bob.pkh        

    //     } catch (e){
    //         console.log('Fail as expected');
    //     }
    // });


    it(`alice stake 100 MVK tokens`, async () => {
        try{

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: Alice stake 100 MVK Tokens") 
            console.log("---") // break

            // const doormanStorage = await doormanInstance.storage();
            // console.log(doormanStorage);

    //         console.log("Before MVK Storage Total Supply: " + mvkStorage.totalSupply); // return 1000 MVK - 1,000,000,000 in muMVK
    //         console.log("Before vMVK Storage Total Supply: " + vMvkStorage.totalSupply); // return 1000 vMVK - 1,000,000,000 in muVMVK
    //         const beforeMvkLedgerAlice  = await mvkStorage.ledger.get(alice.pkh);
    //         const beforeVMvkLedgerAlice = await vMvkStorage.ledger.get(alice.pkh);
    //         const beforeDoormanStorage  = await doormanInstance.storage();
    //         console.log("Before Alice MVK Balance: " + beforeMvkLedgerAlice.balance); // return 1000 MVK - 1,000,000,000 in muMVK
    //         console.log("Before Alice vMVK Balance: " + beforeVMvkLedgerAlice.balance); // return 1000 vMVK - 1,000,000,000 in muVMVK
    
    //         console.log("---") // break
             
    //         // Alice stake 100 MVK tokens - 100,000,000 in muMVK
    //         const stakeAmount = await doormanInstance.stake(100000000n);
            
    //         afterMvkStorage     = await mvkTokenInstance.storage();
    //         afterVMvkStorage    = await vMvkTokenInstance.storage();
    //         afterDoormanStorage = await doormanInstance.storage();

    //         const afterMvkLedgerAlice            = await afterMvkStorage.ledger.get(alice.pkh);
    //         const afterVMvkLedgerAlice           = await afterVMvkStorage.ledger.get(alice.pkh);
    //         const afterDoormanAliceUserRecord    = await afterDoormanStorage.userStakeLedger.get(alice.pkh); // return user staking records - map(nat, stakeRecordType)
    //         const afterDoormanAliceStakeRecord   = await afterDoormanAliceUserRecord.get("0"); // return { amount: 100000000, exitFee: 0, opType: 'stake', time: '2021-10-26T10:14:54.000Z' }
            
    //         console.log("After MVK Storage Total Supply: " + afterMvkStorage.totalSupply); // return 900 MVK - 900,000,000 in muMVK
    //         console.log("After vMVK Storage Total Supply: " + afterVMvkStorage.totalSupply); // return 1100 vMVK - 1,100,000,000 in muVMVK
    //         console.log("After Alice MVK Balance: " + afterMvkLedgerAlice.balance); // return 900 MVK - 900,000,000 in muMVK
    //         console.log("After Alice vMVK Balance: " + afterVMvkLedgerAlice.balance); // return 1100 vMVK - 1,100,000,000 in muVMVK
    //         console.log("After Doorman Alice Record: " + afterDoormanAliceStakeRecord.amount + " " + afterDoormanAliceStakeRecord.opType + " with " + afterDoormanAliceStakeRecord.exitFee + " fee at " + afterDoormanAliceStakeRecord.time); // return "100000000 stake at 2021-10-26T10:14:54.000Z"
    //         console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break

    //         // assert.equal(afterMvkStorage.totalSupply, 900000000);
    //         // assert.equal(afterVMvkStorage.totalSupply, 1100000000);
    //         // assert.equal(afterMvkLedgerAlice.balance, 900000000);
    //         // assert.equal(afterVMvkLedgerAlice.balance, 1100000000);
    //         // assert.equal(afterDoormanAliceStakeRecord.amount, 100000000);

        } catch(e){
            console.log(e);
        }
    });

    // it(`alice unstake 100 vMVK tokens`, async () => {
    //     try{

    //         console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
    //         console.log("Alice unstake 100 vMVK Tokens Test:") 
    //         console.log("---") // break
            
    //         const beforeDoormanStorage  = await doormanInstance.storage();
    //         const beforeMvkStorage      = await mvkTokenInstance.storage();
    //         const beforeVMvkStorage     = await vMvkTokenInstance.storage();
    //         const beforeMvkLedgerAlice  = await mvkStorage.ledger.get(alice.pkh);
    //         const beforeVMvkLedgerAlice = await vMvkStorage.ledger.get(alice.pkh);

    //         console.log('before');        
    //         console.log("Before MVK Storage Total Supply: " + beforeMvkStorage.totalSupply); // return 900 MVK - 900,000,000 in muMVK
    //         console.log("Before vMVK Storage Total Supply: " + beforeVMvkStorage.totalSupply); // return 1100 vMVK - 1,100,000,000 in muVMVK       
    //         console.log("Before Alice MVK Balance: " + beforeMvkLedgerAlice.balance); // return 900 - 900,000,000 in muMVK
    //         console.log("Before Alice vMVK Balance: " + beforeVMvkLedgerAlice.balance); // return 1100 - 1,100,000,000 in muVMVK       
    
    //         console.log("---") // break

    //         // Alice unstake 100 vMVK tokens - 100,000,000 in muVMVK    
    //         const stakeAmount  = await doormanInstance.unstake(100000000n);

    //         afterMvkStorage     = await mvkTokenInstance.storage();
    //         afterVMvkStorage    = await vMvkTokenInstance.storage();
    //         afterDoormanStorage = await doormanInstance.storage();

    //         const afterMvkLedgerAlice            = await afterMvkStorage.ledger.get(alice.pkh);
    //         const afterVMvkLedgerAlice           = await afterVMvkStorage.ledger.get(alice.pkh);
    //         const afterDoormanAliceUserRecord    = await afterDoormanStorage.userStakeLedger.get(alice.pkh); // return user staking records - map(nat, stakeRecordType)
    //         const afterDoormanAliceStakeRecord   = await afterDoormanAliceUserRecord.get("1"); // return { amount: 100000000, exitFee: 8330000, opType: 'unstake', time: '2021-10-26T10:14:54.000Z' }

    //         console.log("Log Exit Fee: " + afterDoormanStorage.logExitFee);
    //         console.log("Log Final Amount: " + afterDoormanStorage.logFinalAmount);
    //         console.log('after');                    

    //         // 8,330,000 muMVK as exit fee to be distributed as rewards
    //         console.log("After MVK Storage Total Supply: " + afterMvkStorage.totalSupply); // return 991.67 MVK - 991,670,000 in muMVK
    //         console.log("After vMVK Storage Total Supply: " + afterVMvkStorage.totalSupply); // return 1000 vMVK - 1,000,000,000 in muVMVK
    //         console.log("After Alice MVK Balance: " + afterMvkLedgerAlice.balance); // return 991.67 MVK - 991,670,000 in muMVK
    //         console.log("After Alice vMVK Balance: " + afterVMvkLedgerAlice.balance); // return 1000 vMVK - 1,000,000,000 in muVMVK
    //         console.log("After Doorman Alice Record: " + afterDoormanAliceStakeRecord.amount + " " + afterDoormanAliceStakeRecord.opType + " with " + afterDoormanAliceStakeRecord.exitFee + " fee at " + afterDoormanAliceStakeRecord.time); // return "100000000 unstake with 8330000 fee at 2021-10-26T10:14:54.000Z"
    //         console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break

    //         // assert.equal(afterMvkStorage.totalSupply, 991670000);
    //         // assert.equal(afterVMvkStorage.totalSupply, 1000000000);
    //         // assert.equal(afterMvkLedgerAlice.balance, 991670000);
    //         // assert.equal(afterVMvkLedgerAlice.balance, 1000000000);
    //         // assert.equal(afterDoormanAliceStakeRecord.amount, 100000000);
    //         // assert.equal(afterDoormanAliceStakeRecord.exitFee, 8330000);
             
    //     } catch(e){
    //         console.log(e);
    //     }
    // });

    // it(`bob stake 100 MVK tokens`, async () => {
    //     try{

    //         console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
    //         console.log("Bob stake 100 MVK Tokens Test:") 
    //         console.log("---") // break

    //         const beforeDoormanStorage  = await doormanInstance.storage();
    //         const beforeMvkStorage      = await mvkTokenInstance.storage();
    //         const beforeVMvkStorage     = await vMvkTokenInstance.storage();
    //         const beforeMvkLedgerBob  = await mvkStorage.ledger.get(bob.pkh);
    //         const beforeVMvkLedgerBob = await vMvkStorage.ledger.get(bob.pkh);

    //         console.log('before');        
    //         console.log("Before MVK Storage Total Supply: " + beforeMvkStorage.totalSupply); // return 900 MVK - 900,000,000 in muMVK
    //         console.log("Before vMVK Storage Total Supply: " + beforeVMvkStorage.totalSupply); // return 1100 vMVK - 1,100,000,000 in muVMVK       
    //         console.log("Before Bob MVK Balance: " + beforeMvkLedgerBob.balance); // return 900 - 900,000,000 in muMVK
    //         console.log("Before Bob vMVK Balance: " + beforeVMvkLedgerBob.balance); // return 1100 - 1,100,000,000 in muVMVK       
    

    //         // console.log("Before MVK Storage Total Supply: " + mvkStorage.totalSupply); // return 1000 MVK - 1,000,000,000 in muMVK
    //         // console.log("Before vMVK Storage Total Supply: " + vMvkStorage.totalSupply); // return 1000 vMVK - 1,000,000,000 in muVMVK
    //         // const beforeMvkLedgerBob  = await mvkStorage.ledger.get(bob.pkh);
    //         // const beforeVMvkLedgerBob = await vMvkStorage.ledger.get(bob.pkh);
    //         // const beforeDoormanStorage  = await doormanInstance.storage();
    //         // console.log("Before Bob MVK Balance: " + beforeMvkLedgerBob.balance); // return 1000 MVK - 1,000,000,000 in muMVK
    //         // console.log("Before Bob vMVK Balance: " + beforeVMvkLedgerBob.balance); // return 1000 vMVK - 1,000,000,000 in muVMVK
    
    //         console.log("---") // break

    //         // console.log('accounts');
    //         // console.log(accounts[0]);
    //         // console.log(accounts[1]);

    //         accounts[1] = bob.pkh;
             
    //         // Alice stake 100 MVK tokens - 100,000,000 in muMVK
    //         const stakeAmount = await doormanInstance.stake(100000000n, {from: accounts[1]});
    //         const stakeAmount = await doormanInstance.stake(100000000n, {from: bob.pkh});
    //         // const stakeAmount = await doormanInstance.from(bob.pkh).stake(100000000n);
            
    //         afterMvkStorage     = await mvkTokenInstance.storage();
    //         afterVMvkStorage    = await vMvkTokenInstance.storage();
    //         afterDoormanStorage = await doormanInstance.storage();            
            
    //         const afterMvkLedgerBob            = await afterMvkStorage.ledger.get(bob.pkh);
    //         const afterVMvkLedgerBob           = await afterVMvkStorage.ledger.get(bob.pkh);
    //         const afterDoormanBobUserRecord    = await afterDoormanStorage.userStakeLedger.get(bob.pkh); // return user staking records - map(nat, stakeRecordType)        
    //         // const afterDoormanBobStakeRecord   = await afterDoormanBobUserRecord.get("0"); // return { amount: 100000000, exitFee: 0, opType: 'stake', time: '2021-10-26T10:14:54.000Z' }
    //         console.log(afterMvkLedgerBob);
            
    //         console.log("After MVK Storage Total Supply: " + afterMvkStorage.totalSupply); // return 900 MVK - 900,000,000 in muMVK
    //         console.log("After vMVK Storage Total Supply: " + afterVMvkStorage.totalSupply); // return 1100 vMVK - 1,100,000,000 in muVMVK
    //         console.log("After Bob MVK Balance: " + afterMvkLedgerBob.balance); // return 900 MVK - 900,000,000 in muMVK
    //         console.log("After Bob vMVK Balance: " + afterVMvkLedgerBob.balance); // return 1100 vMVK - 1,100,000,000 in muVMVK
    //         // console.log("After Doorman Alice Record: " + afterDoormanAliceStakeRecord.amount + " " + afterDoormanAliceStakeRecord.opType + " with " + afterDoormanAliceStakeRecord.exitFee + " fee at " + afterDoormanAliceStakeRecord.time); // return "100000000 stake at 2021-10-26T10:14:54.000Z"


    //         const afterMvkLedgerAlice            = await afterMvkStorage.ledger.get(alice.pkh);
    //         const afterVMvkLedgerAlice           = await afterVMvkStorage.ledger.get(alice.pkh);
    //         const afterDoormanAliceUserRecord    = await afterDoormanStorage.userStakeLedger.get(alice.pkh); // return user staking records - map(nat, stakeRecordType)
    //         const afterDoormanAliceStakeRecord   = await afterDoormanAliceUserRecord.get("1"); // return { amount: 100000000, exitFee: 8330000, opType: 'unstake', time: '2021-10-26T10:14:54.000Z' }

    //         console.log("After Alice MVK Balance: " + afterMvkLedgerAlice.balance); // return 991.67 MVK - 991,670,000 in muMVK
    //         console.log("After Alice vMVK Balance: " + afterVMvkLedgerAlice.balance); // return 1000 vMVK - 1,000,000,000 in muVMVK

    //         console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break

    //         // assert.equal(afterMvkStorage.totalSupply, 900000000);
    //         // assert.equal(afterVMvkStorage.totalSupply, 1100000000);
    //         // assert.equal(afterMvkLedgerAlice.balance, 900000000);
    //         // assert.equal(afterVMvkLedgerAlice.balance, 1100000000);
    //         // assert.equal(afterDoormanAliceStakeRecord.amount, 100000000);

    //     } catch(e){
    //         console.log(e);
    //     }
    // });

});