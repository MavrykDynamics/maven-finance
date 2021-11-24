const delegation = artifacts.require('delegation');
const mvkToken = artifacts.require('mvkToken');
const vMvkToken = artifacts.require('vMvkToken');
const sMvkToken = artifacts.require('sMvkToken');
const doorman = artifacts.require('doorman');
const governance = artifacts.require('governance');

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
const truffleConfig  = require("../truffle-config.js");

contract('delegate', accounts => {
    let doormanInstance;
    let delegationStorage;
    let delegationInstance;
    let mvkTokenInstance;
    let vMvkTokenInstance;

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

        delegationInstance = await delegation.deployed();
        delegationInstance = await Tezos.contract.at(delegationInstance.address);

        mvkTokenInstance = await mvkToken.deployed();        
        mvkTokenInstance = await Tezos.contract.at(mvkTokenInstance.address);

        vMvkTokenInstance = await vMvkToken.deployed();        
        vMvkTokenInstance = await Tezos.contract.at(vMvkTokenInstance.address);

        sMvkTokenInstance = await sMvkToken.deployed();        
        sMvkTokenInstance = await Tezos.contract.at(sMvkTokenInstance.address);

        doormanInstance   = await doorman.deployed();
        doormanInstance   = await Tezos.contract.at(doormanInstance.address);

        governanceInstance   = await governance.deployed();
        governanceInstance   = await Tezos.contract.at(governanceInstance.address);

        delegationStorage = await delegationInstance.storage();
        mvkStorage        = await mvkTokenInstance.storage();
        vMvkStorage       = await vMvkTokenInstance.storage();
        sMvkStorage       = await sMvkTokenInstance.storage();
        doormanStorage    = await doormanInstance.storage();

        console.log('-- -- -- -- -- Deployments -- -- -- --')   
        console.log('Delegation Contract deployed at:', delegationInstance.address);
        console.log('MVK Contract deployed at:', mvkTokenInstance.address);      
        console.log('vMVK Contract deployed at:', vMvkTokenInstance.address);        
        console.log('sMVK Contract deployed at:', sMvkTokenInstance.address);        
        console.log('Doorman Contract deployed at:', doormanInstance.address);        
        console.log('Governance Contract deployed at:', governanceInstance.address);        
    });


    it('alice can register as a satellite', async () => {
        try{        

            beforeDelegationStorage     = await delegationInstance.storage();
            beforeVMvkStorage           = await vMvkTokenInstance.storage();
            beforeSMvkStorage           = await sMvkTokenInstance.storage();
            beforeGovernanceStorage     = await governanceInstance.storage();
            
            const beforeDelegationLedgerAlice  = await beforeDelegationStorage.satelliteLedger.get(alice.pkh); // should return null or undefined
            const beforeVMvkLedgerAlice        = await beforeVMvkStorage.ledger.get(alice.pkh);
            const beforeSMvkLedgerAlice        = await beforeSMvkStorage.ledger.get(alice.pkh);

            console.log("before ----")
            console.log(beforeGovernanceStorage);
            console.log(beforeDelegationLedgerAlice);
            // console.log(beforeVMvkLedgerAlice.balance);
            // console.log(beforeSMvkLedgerAlice.balance);

            const registerAsDelegatorOperation = await delegationInstance.methods.registerAsSatellite("New Satellite", "New Satellite Description", "https://image.url", "700").send();
            await registerAsDelegatorOperation.confirmation();

            afterDelegationStorage     = await delegationInstance.storage();
            afterVMvkStorage           = await vMvkTokenInstance.storage();
            afterSMvkStorage           = await sMvkTokenInstance.storage();
            afterGovernanceStorage     = await governanceInstance.storage();
            
            const afterDelegationLedgerAlice  = await afterDelegationStorage.satelliteLedger.get(alice.pkh); // should return satellite record
            const afterVMvkLedgerAlice        = await afterVMvkStorage.ledger.get(alice.pkh);
            const afterSMvkLedgerAlice        = await afterSMvkStorage.ledger.get(alice.pkh);

            console.log("after ----")
            console.log(afterGovernanceStorage);
            console.log(afterDelegationLedgerAlice);
            // console.log(afterVMvkLedgerAlice.balance);
            // console.log(afterSMvkLedgerAlice.balance);

        } catch(e){
            console.log(e);
        } 
    });

    it('alice cannot register twice as a satellite', async () => {
        try{        
            
            await signerFactory(alice.sk);

            // beforeDelegationStorage     = await delegationInstance.storage();
            // const beforeDelegationLedgerAlice  = await beforeDelegationStorage.satelliteLedger.get(alice.pkh);
            // console.log(beforeDelegationLedgerAlice);

            const failRegisterAsDelegatorOperation = await delegationInstance.methods.registerAsSatellite("New Satellite", "New Satellite Description", "https://image.url", "700");    
            await chai.expect(failRegisterAsDelegatorOperation.send()).to.be.eventually.rejected;

            // afterDelegationStorage     = await delegationInstance.storage();
            // const afterDelegationLedgerAlice  = await afterDelegationStorage.satelliteLedger.get(alice.pkh);
            // console.log(afterDelegationLedgerAlice);

        } catch(e){
            console.log(e);
        } 
    });

    it(`alice stakes 100 MVK tokens and increases her satellite bond`, async () => {
        try{

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: Alice stakes 100 MVK tokens and increases her satellite bond:") 
            console.log("---") // break

            const beforeDelegationStorage  = await delegationInstance.storage();
            const beforeDoormanStorage  = await doormanInstance.storage();
            const beforeMvkStorage      = await mvkTokenInstance.storage();
            const beforeVMvkStorage     = await vMvkTokenInstance.storage();
            const beforeMvkLedgerBob    = await mvkStorage.ledger.get(bob.pkh);
            const beforeVMvkLedgerBob   = await vMvkStorage.ledger.get(bob.pkh);

            const beforeDelegateLedgerBob      = await beforeDelegationStorage.delegateLedger.get(bob.pkh);    // none (bob has not delegated yet)
            const beforeSatelliteLedgerAlice   = await beforeDelegationStorage.satelliteLedger.get(alice.pkh); // should show alice's satellite record with 0 in totalDelegatedAmount
    
    
            // console.log("Before MVK Storage Total Supply: "  + beforeMvkStorage.totalSupply);   // return 991.67 MVK - 991,670,000 in muMVK
            // console.log("Before vMVK Storage Total Supply: " + beforeVMvkStorage.totalSupply);  // return 1000 vMVK - 1,000,000,000 in muVMVK       
            // console.log("Before Bob MVK Balance: "           + beforeMvkLedgerBob.balance);     // return 500 - 500,000,000 in muMVK
            // console.log("Before Bob vMVK Balance: "          + beforeVMvkLedgerBob.balance);    // return 500 - 500,000,000 in muVMVK       
    
            console.log("---") // break
             
            // Bob stake 100 MVK tokens - 100,000,000 in muMVK
            const stakeAmountOperation = await doormanInstance.methods.stake(100000000n).send();
            await stakeAmountOperation.confirmation();
            
            afterMvkStorage     = await mvkTokenInstance.storage();
            afterVMvkStorage    = await vMvkTokenInstance.storage();
            afterDoormanStorage = await doormanInstance.storage();      
            
            afterDelegationStorage     = await delegationInstance.storage();
            afterVMvkStorage           = await vMvkTokenInstance.storage();
            afterSMvkStorage           = await sMvkTokenInstance.storage();

            
            // console.log("After MVK Storage Total Supply: "  + afterMvkStorage.totalSupply);    // return 891.67 MVK - 891,670,000 in muMVK
            // console.log("After vMVK Storage Total Supply: " + afterVMvkStorage.totalSupply);   // return 1100 vMVK - 1,100,000,000 in muVMVK
            // console.log("After Bob MVK Balance: "           + afterMvkLedgerBob.balance);      // return 400 MVK - 400,000,000 in muMVK
            // console.log("After Bob vMVK Balance: "          + afterVMvkLedgerBob.balance);     // return 600 vMVK - 600,000,000 in muVMVK
            // console.log("After Doorman Bob Record: "        + afterDoormanBobStakeRecord.amount + " " + afterDoormanBobStakeRecord.opType + " with " + afterDoormanBobStakeRecord.exitFee + " fee at " + afterDoormanBobStakeRecord.time); // return "100000000 stake at 2021-10-26T10:14:54.000Z"

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break

            // assert.equal(afterMvkStorage.totalSupply, 891670000);
            // assert.equal(afterVMvkStorage.totalSupply, 1100000000);
            // assert.equal(afterMvkLedgerBob.balance, 400000000);
            // assert.equal(afterVMvkLedgerBob.balance, 600000000);
            // assert.equal(afterDoormanBobStakeRecord.amount, 100000000);

        } catch(e){
            console.log(e);
        }
    });

    it(`alice unstakes 100 MVK tokens and decreases her satellite bond`, async () => {
        try{

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: Alice unstakes 100 MVK tokens and decreases her satellite bond:") 
            console.log("---") // break

            const beforeDelegationStorage  = await delegationInstance.storage();
            const beforeDoormanStorage  = await doormanInstance.storage();
            const beforeMvkStorage      = await mvkTokenInstance.storage();
            const beforeVMvkStorage     = await vMvkTokenInstance.storage();
            const beforeMvkLedgerBob    = await mvkStorage.ledger.get(bob.pkh);
            const beforeVMvkLedgerBob   = await vMvkStorage.ledger.get(bob.pkh);

            const beforeDelegateLedgerBob      = await beforeDelegationStorage.delegateLedger.get(bob.pkh);    // none (bob has not delegated yet)
            const beforeSatelliteLedgerAlice   = await beforeDelegationStorage.satelliteLedger.get(alice.pkh); // should show alice's satellite record with 0 in totalDelegatedAmount
            
    
            // console.log("Before MVK Storage Total Supply: "  + beforeMvkStorage.totalSupply);   // return 991.67 MVK - 991,670,000 in muMVK
            // console.log("Before vMVK Storage Total Supply: " + beforeVMvkStorage.totalSupply);  // return 1000 vMVK - 1,000,000,000 in muVMVK       
            // console.log("Before Bob MVK Balance: "           + beforeMvkLedgerBob.balance);     // return 500 - 500,000,000 in muMVK
            // console.log("Before Bob vMVK Balance: "          + beforeVMvkLedgerBob.balance);    // return 500 - 500,000,000 in muVMVK       
    
            console.log("---") // break
             
            // Bob stake 100 MVK tokens - 100,000,000 in muMVK
            const unstakeAmountOperation = await doormanInstance.methods.unstake(100000000n).send();
            await unstakeAmountOperation.confirmation();
            
            afterMvkStorage     = await mvkTokenInstance.storage();
            afterVMvkStorage    = await vMvkTokenInstance.storage();
            afterDoormanStorage = await doormanInstance.storage();      
            
            afterDelegationStorage     = await delegationInstance.storage();
            afterVMvkStorage           = await vMvkTokenInstance.storage();
            afterSMvkStorage           = await sMvkTokenInstance.storage();

            // test
            afterDelegationStorage        = await delegationInstance.storage();
            afterDelegationStorageAlice   = await afterDelegationStorage.satelliteLedger.get(alice.pkh);

            // console.log(afterDelegationStorage);
            // console.log(afterDelegationStorageAlice);
            // console.log(afterDelegationStorageBob);

            const afterSatelliteLedgerAlice   = await afterDelegationStorage.satelliteLedger.get(alice.pkh);  // should show alice's satellite record with 500000000 in totalDelegatedAmount
            
            // console.log(afterDelegateLedgerBob);
            // console.log(afterSatelliteLedgerAlice);
            
            // console.log("After MVK Storage Total Supply: "  + afterMvkStorage.totalSupply);    // return 891.67 MVK - 891,670,000 in muMVK
            // console.log("After vMVK Storage Total Supply: " + afterVMvkStorage.totalSupply);   // return 1100 vMVK - 1,100,000,000 in muVMVK
            // console.log("After Bob MVK Balance: "           + afterMvkLedgerBob.balance);      // return 400 MVK - 400,000,000 in muMVK
            // console.log("After Bob vMVK Balance: "          + afterVMvkLedgerBob.balance);     // return 600 vMVK - 600,000,000 in muVMVK
            // console.log("After Doorman Bob Record: "        + afterDoormanBobStakeRecord.amount + " " + afterDoormanBobStakeRecord.opType + " with " + afterDoormanBobStakeRecord.exitFee + " fee at " + afterDoormanBobStakeRecord.time); // return "100000000 stake at 2021-10-26T10:14:54.000Z"

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break

            // assert.equal(afterMvkStorage.totalSupply, 891670000);
            // assert.equal(afterVMvkStorage.totalSupply, 1100000000);
            // assert.equal(afterMvkLedgerBob.balance, 400000000);
            // assert.equal(afterVMvkLedgerBob.balance, 600000000);
            // assert.equal(afterDoormanBobStakeRecord.amount, 100000000);

        } catch(e){
            console.log(e);
        }
    });

    it(`alice cannot unstake more than the minimum satellite bond requirement`, async () => {
        try{

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: Alice cannot unstake more than the minimum satellite bond requirement:") 
            console.log("---") // break

            const beforeDelegationStorage  = await delegationInstance.storage();
            const beforeDoormanStorage  = await doormanInstance.storage();
            const beforeMvkStorage      = await mvkTokenInstance.storage();
            const beforeVMvkStorage     = await vMvkTokenInstance.storage();
            const beforeMvkLedgerBob    = await mvkStorage.ledger.get(bob.pkh);
            const beforeVMvkLedgerBob   = await vMvkStorage.ledger.get(bob.pkh);

            const beforeDelegateLedgerBob      = await beforeDelegationStorage.delegateLedger.get(bob.pkh);    // none (bob has not delegated yet)
            const beforeSatelliteLedgerAlice   = await beforeDelegationStorage.satelliteLedger.get(alice.pkh); // should show alice's satellite record with 0 in totalDelegatedAmount            
    
            // console.log("Before MVK Storage Total Supply: "  + beforeMvkStorage.totalSupply);   // return 991.67 MVK - 991,670,000 in muMVK
            // console.log("Before vMVK Storage Total Supply: " + beforeVMvkStorage.totalSupply);  // return 1000 vMVK - 1,000,000,000 in muVMVK       
            // console.log("Before Bob MVK Balance: "           + beforeMvkLedgerBob.balance);     // return 500 - 500,000,000 in muMVK
            // console.log("Before Bob vMVK Balance: "          + beforeVMvkLedgerBob.balance);    // return 500 - 500,000,000 in muVMVK       
    
            console.log("---") // break

            const failUnstakeAmountOperation = await doormanInstance.methods.unstake(300000000n);    
            await chai.expect(failUnstakeAmountOperation.send()).to.be.eventually.rejected;
            
            afterMvkStorage     = await mvkTokenInstance.storage();
            afterVMvkStorage    = await vMvkTokenInstance.storage();
            afterDoormanStorage = await doormanInstance.storage();      
            
            afterDelegationStorage     = await delegationInstance.storage();
            afterVMvkStorage           = await vMvkTokenInstance.storage();
            afterSMvkStorage           = await sMvkTokenInstance.storage();

            // test
            afterDelegationStorage        = await delegationInstance.storage();
            afterDelegationStorageAlice   = await afterDelegationStorage.satelliteLedger.get(alice.pkh);

            const afterSatelliteLedgerAlice   = await afterDelegationStorage.satelliteLedger.get(alice.pkh);  // should show alice's satellite record with 500000000 in totalDelegatedAmount    
            
            // console.log("After MVK Storage Total Supply: "  + afterMvkStorage.totalSupply);    // return 891.67 MVK - 891,670,000 in muMVK
            // console.log("After vMVK Storage Total Supply: " + afterVMvkStorage.totalSupply);   // return 1100 vMVK - 1,100,000,000 in muVMVK
            // console.log("After Bob MVK Balance: "           + afterMvkLedgerBob.balance);      // return 400 MVK - 400,000,000 in muMVK
            // console.log("After Bob vMVK Balance: "          + afterVMvkLedgerBob.balance);     // return 600 vMVK - 600,000,000 in muVMVK
            // console.log("After Doorman Bob Record: "        + afterDoormanBobStakeRecord.amount + " " + afterDoormanBobStakeRecord.opType + " with " + afterDoormanBobStakeRecord.exitFee + " fee at " + afterDoormanBobStakeRecord.time); // return "100000000 stake at 2021-10-26T10:14:54.000Z"

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break

            // assert.equal(afterMvkStorage.totalSupply, 891670000);
            // assert.equal(afterVMvkStorage.totalSupply, 1100000000);
            // assert.equal(afterMvkLedgerBob.balance, 400000000);
            // assert.equal(afterVMvkLedgerBob.balance, 600000000);
            // assert.equal(afterDoormanBobStakeRecord.amount, 100000000);

        } catch(e){
            console.log(e);
        }
    });

    it(`bob stake 100 MVK tokens (without delegation to satellite)`, async () => {
        try{

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: Bob stake 100 MVK Tokens Test (without delegation to satellite):") 
            console.log("---") // break

            const beforeDelegationStorage  = await delegationInstance.storage();
            const beforeDoormanStorage  = await doormanInstance.storage();
            const beforeMvkStorage      = await mvkTokenInstance.storage();
            const beforeVMvkStorage     = await vMvkTokenInstance.storage();
            const beforeMvkLedgerBob    = await mvkStorage.ledger.get(bob.pkh);
            const beforeVMvkLedgerBob   = await vMvkStorage.ledger.get(bob.pkh);

            const beforeDelegateLedgerBob      = await beforeDelegationStorage.delegateLedger.get(bob.pkh);    // none (bob has not delegated yet)
            const beforeSatelliteLedgerAlice   = await beforeDelegationStorage.satelliteLedger.get(alice.pkh); // should show alice's satellite record with 0 in totalDelegatedAmount

            // test        
            beforeDelegationStorageAlice   = await beforeDelegationStorage.satelliteLedger.get(alice.pkh);
            beforeDelegationStorageBob     = await beforeDelegationStorage.satelliteLedger.get(bob.pkh);
            // console.log(beforeDelegationStorage);
            // console.log(beforeDelegationStorageAlice);
            // console.log(beforeDelegationStorageBob);
            

            // console.log('before');
            // console.log(beforeDelegateLedgerBob);
            // console.log(beforeSatelliteLedgerAlice);
    
            // console.log("Before MVK Storage Total Supply: "  + beforeMvkStorage.totalSupply);   // return 991.67 MVK - 991,670,000 in muMVK
            // console.log("Before vMVK Storage Total Supply: " + beforeVMvkStorage.totalSupply);  // return 1000 vMVK - 1,000,000,000 in muVMVK       
            // console.log("Before Bob MVK Balance: "           + beforeMvkLedgerBob.balance);     // return 500 - 500,000,000 in muMVK
            // console.log("Before Bob vMVK Balance: "          + beforeVMvkLedgerBob.balance);    // return 500 - 500,000,000 in muVMVK       
    
            console.log("---") // break

            await signerFactory(bob.sk);
             
            // Bob stake 100 MVK tokens - 100,000,000 in muMVK
            const stakeAmountOperation = await doormanInstance.methods.stake(100000000n).send();
            await stakeAmountOperation.confirmation();
            
            afterMvkStorage     = await mvkTokenInstance.storage();
            afterVMvkStorage    = await vMvkTokenInstance.storage();
            afterDoormanStorage = await doormanInstance.storage();      
            
            afterDelegationStorage     = await delegationInstance.storage();
            afterVMvkStorage           = await vMvkTokenInstance.storage();
            afterSMvkStorage           = await sMvkTokenInstance.storage();
            
            const afterDelegateLedgerBob      = await afterDelegationStorage.delegateLedger.get(bob.pkh);     // should show a delegate record with alice's address as the satelliteAddress
            const afterSatelliteLedgerAlice   = await afterDelegationStorage.satelliteLedger.get(alice.pkh);  // should show alice's satellite record with 500000000 in totalDelegatedAmount
            
            // console.log(afterDelegateLedgerBob);
            // console.log(afterSatelliteLedgerAlice);

            const afterMvkLedgerBob            = await afterMvkStorage.ledger.get(bob.pkh);
            const afterVMvkLedgerBob           = await afterVMvkStorage.ledger.get(bob.pkh);
            const afterDoormanBobUserRecord    = await afterDoormanStorage.userStakeLedger.get(bob.pkh); // return user staking records - map(nat, stakeRecordType)        
            const afterDoormanBobStakeRecord   = await afterDoormanBobUserRecord.get("0");               // return { amount: 100000000, exitFee: 0, opType: 'stake', time: '2021-10-26T10:14:54.000Z' }
                    
            // reset back to alice
            await signerFactory(alice.sk);
            
            // console.log("After MVK Storage Total Supply: "  + afterMvkStorage.totalSupply);    // return 891.67 MVK - 891,670,000 in muMVK
            // console.log("After vMVK Storage Total Supply: " + afterVMvkStorage.totalSupply);   // return 1100 vMVK - 1,100,000,000 in muVMVK
            // console.log("After Bob MVK Balance: "           + afterMvkLedgerBob.balance);      // return 400 MVK - 400,000,000 in muMVK
            // console.log("After Bob vMVK Balance: "          + afterVMvkLedgerBob.balance);     // return 600 vMVK - 600,000,000 in muVMVK
            // console.log("After Doorman Bob Record: "        + afterDoormanBobStakeRecord.amount + " " + afterDoormanBobStakeRecord.opType + " with " + afterDoormanBobStakeRecord.exitFee + " fee at " + afterDoormanBobStakeRecord.time); // return "100000000 stake at 2021-10-26T10:14:54.000Z"

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break

            // assert.equal(afterMvkStorage.totalSupply, 891670000);
            // assert.equal(afterVMvkStorage.totalSupply, 1100000000);
            // assert.equal(afterMvkLedgerBob.balance, 400000000);
            // assert.equal(afterVMvkLedgerBob.balance, 600000000);
            // assert.equal(afterDoormanBobStakeRecord.amount, 100000000);

        } catch(e){
            console.log(e);
        }
    });

    it(`bob unstake 100 MVK tokens (without delegation to satellite)`, async () => {
        try{

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: Bob unstake 100 MVK Tokens Test (without delegation to satellite):") 
            console.log("---") // break

            const beforeDelegationStorage  = await delegationInstance.storage();
            beforeDelegationStorageAlice   = await beforeDelegationStorage.satelliteLedger.get(alice.pkh);
            beforeDelegationStorageBob     = await beforeDelegationStorage.satelliteLedger.get(bob.pkh);
            
            // console.log(beforeDelegationStorage);
            // console.log(beforeDelegationStorageAlice);
            // console.log(beforeDelegationStorageBob);
            

            const beforeDoormanStorage  = await doormanInstance.storage();
            const beforeMvkStorage      = await mvkTokenInstance.storage();
            const beforeVMvkStorage     = await vMvkTokenInstance.storage();
            const beforeMvkLedgerBob    = await mvkStorage.ledger.get(bob.pkh);
            const beforeVMvkLedgerBob   = await vMvkStorage.ledger.get(bob.pkh);

            const beforeDelegateLedgerBob      = await beforeDelegationStorage.delegateLedger.get(bob.pkh);    // none (bob has not delegated yet)
            const beforeSatelliteLedgerAlice   = await beforeDelegationStorage.satelliteLedger.get(alice.pkh); // should show alice's satellite record with 0 in totalDelegatedAmount
    
            // console.log("Before MVK Storage Total Supply: "  + beforeMvkStorage.totalSupply);   // return 991.67 MVK - 991,670,000 in muMVK
            // console.log("Before vMVK Storage Total Supply: " + beforeVMvkStorage.totalSupply);  // return 1000 vMVK - 1,000,000,000 in muVMVK       
            // console.log("Before Bob MVK Balance: "           + beforeMvkLedgerBob.balance);     // return 500 - 500,000,000 in muMVK
            // console.log("Before Bob vMVK Balance: "          + beforeVMvkLedgerBob.balance);    // return 500 - 500,000,000 in muVMVK       
    
            console.log("---") // break

            await signerFactory(bob.sk);
             
            // Bob stake 100 MVK tokens - 100,000,000 in muMVK
            const stakeAmountOperation = await doormanInstance.methods.unstake(100000000n).send();
            await stakeAmountOperation.confirmation();
            
            afterMvkStorage     = await mvkTokenInstance.storage();
            afterVMvkStorage    = await vMvkTokenInstance.storage();
            afterDoormanStorage = await doormanInstance.storage();      
            
            afterDelegationStorage        = await delegationInstance.storage();
            afterDelegationStorageAlice   = await afterDelegationStorage.satelliteLedger.get(alice.pkh);
            afterDelegationStorageBob     = await afterDelegationStorage.satelliteLedger.get(bob.pkh);
            
            // console.log(afterDelegationStorage);
            // console.log(afterDelegationStorageAlice);
            // console.log(afterDelegationStorageBob);

            afterVMvkStorage           = await vMvkTokenInstance.storage();
            afterSMvkStorage           = await sMvkTokenInstance.storage();
            
            const afterDelegateLedgerBob      = await afterDelegationStorage.delegateLedger.get(bob.pkh);     // should show a delegate record with alice's address as the satelliteAddress
            const afterSatelliteLedgerAlice   = await afterDelegationStorage.satelliteLedger.get(alice.pkh);  // should show alice's satellite record with 500000000 in totalDelegatedAmount
            
            // console.log(afterDelegateLedgerBob);
            // console.log(afterSatelliteLedgerAlice);

            const afterMvkLedgerBob            = await afterMvkStorage.ledger.get(bob.pkh);
            const afterVMvkLedgerBob           = await afterVMvkStorage.ledger.get(bob.pkh);
            const afterDoormanBobUserRecord    = await afterDoormanStorage.userStakeLedger.get(bob.pkh); // return user staking records - map(nat, stakeRecordType)        
            const afterDoormanBobStakeRecord   = await afterDoormanBobUserRecord.get("0");               // return { amount: 100000000, exitFee: 0, opType: 'stake', time: '2021-10-26T10:14:54.000Z' }
                    
            // reset back to alice
            await signerFactory(alice.sk);
            
            // console.log("After MVK Storage Total Supply: "  + afterMvkStorage.totalSupply);    // return 891.67 MVK - 891,670,000 in muMVK
            // console.log("After vMVK Storage Total Supply: " + afterVMvkStorage.totalSupply);   // return 1100 vMVK - 1,100,000,000 in muVMVK
            // console.log("After Bob MVK Balance: "           + afterMvkLedgerBob.balance);      // return 400 MVK - 400,000,000 in muMVK
            // console.log("After Bob vMVK Balance: "          + afterVMvkLedgerBob.balance);     // return 600 vMVK - 600,000,000 in muVMVK
            // console.log("After Doorman Bob Record: "        + afterDoormanBobStakeRecord.amount + " " + afterDoormanBobStakeRecord.opType + " with " + afterDoormanBobStakeRecord.exitFee + " fee at " + afterDoormanBobStakeRecord.time); // return "100000000 stake at 2021-10-26T10:14:54.000Z"

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break

            // assert.equal(afterMvkStorage.totalSupply, 891670000);
            // assert.equal(afterVMvkStorage.totalSupply, 1100000000);
            // assert.equal(afterMvkLedgerBob.balance, 400000000);
            // assert.equal(afterVMvkLedgerBob.balance, 600000000);
            // assert.equal(afterDoormanBobStakeRecord.amount, 100000000);

        } catch(e){
            console.log(e);
        }
    });

    it('bob and eve can delegate to alice satellite', async () => {
        try{        

            beforeDelegationStorage     = await delegationInstance.storage();
            beforeVMvkStorage           = await vMvkTokenInstance.storage();
            beforeSMvkStorage           = await sMvkTokenInstance.storage();
            
            const beforeDelegateLedgerBob      = await beforeDelegationStorage.delegateLedger.get(bob.pkh);    // none (bob has not delegated yet)
            const beforeSatelliteLedgerAlice   = await beforeDelegationStorage.satelliteLedger.get(alice.pkh); // should show alice's satellite record with 0 in totalDelegatedAmount
            const beforeVMvkLedgerBob          = await beforeVMvkStorage.ledger.get(bob.pkh);                  // should show bob's vMVK record and balance of 500000000 vMVK 

            // console.log('before');
            // console.log(beforeDelegateLedgerBob);
            // console.log(beforeSatelliteLedgerAlice);
            // console.log(beforeVMvkLedgerBob);
            console.log('----')
            console.log('Bob delegates to alice:')
            console.log('----')

            await signerFactory(bob.sk);
            const delegateToSatelliteOperationBob = await delegationInstance.methods.delegateToSatellite(alice.pkh).send();
            await delegateToSatelliteOperationBob.confirmation();

            await signerFactory(eve.sk);
            const delegateToSatelliteOperationEve = await delegationInstance.methods.delegateToSatellite(alice.pkh).send();
            await delegateToSatelliteOperationEve.confirmation();

            afterDelegationStorage     = await delegationInstance.storage();
            afterVMvkStorage           = await vMvkTokenInstance.storage();
            afterSMvkStorage           = await sMvkTokenInstance.storage();
            
            const afterDelegateLedgerBob      = await afterDelegationStorage.delegateLedger.get(bob.pkh);     // should show a delegate record with alice's address as the satelliteAddress
            const afterSatelliteLedgerAlice   = await afterDelegationStorage.satelliteLedger.get(alice.pkh);  // should show alice's satellite record with 500000000 in totalDelegatedAmount
            const afterVMvkLedgerBob          = await afterVMvkStorage.ledger.get(bob.pkh);                   // no change - should show bob's vMVK record and balance of 500000000 vMVK 

            // console.log('after');
            // console.log(afterDelegateLedgerBob);
            // console.log(afterSatelliteLedgerAlice);
            // console.log(afterVMvkLedgerBob);

            await signerFactory(alice.sk);

        } catch(e){
            console.log(e);
        } 
    });

    it(`bob stake 100 MVK tokens (with delegation to satellite)`, async () => {
        try{

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: Bob stake 100 MVK Tokens Test (with delegation to satellite):") 
            console.log("---") // break

            const beforeDoormanStorage  = await doormanInstance.storage();
            const beforeMvkStorage      = await mvkTokenInstance.storage();
            const beforeVMvkStorage     = await vMvkTokenInstance.storage();
            const beforeMvkLedgerBob    = await mvkStorage.ledger.get(bob.pkh);
            const beforeVMvkLedgerBob   = await vMvkStorage.ledger.get(bob.pkh);

            const beforeDelegateLedgerBob      = await beforeDelegationStorage.delegateLedger.get(bob.pkh);    // none (bob has not delegated yet)
            const beforeSatelliteLedgerAlice   = await beforeDelegationStorage.satelliteLedger.get(alice.pkh); // should show alice's satellite record with 0 in totalDelegatedAmount

            console.log('before');
            console.log(beforeDelegateLedgerBob);
            console.log(beforeSatelliteLedgerAlice);
    
            // console.log("Before MVK Storage Total Supply: "  + beforeMvkStorage.totalSupply);   // return 991.67 MVK - 991,670,000 in muMVK
            // console.log("Before vMVK Storage Total Supply: " + beforeVMvkStorage.totalSupply);  // return 1000 vMVK - 1,000,000,000 in muVMVK       
            // console.log("Before Bob MVK Balance: "           + beforeMvkLedgerBob.balance);     // return 500 - 500,000,000 in muMVK
            // console.log("Before Bob vMVK Balance: "          + beforeVMvkLedgerBob.balance);    // return 500 - 500,000,000 in muVMVK       
    
            console.log("---") // break

            await signerFactory(bob.sk);
             
            // Bob stake 100 MVK tokens - 100,000,000 in muMVK
            const stakeAmountOperation = await doormanInstance.methods.stake(100000000n).send();
            await stakeAmountOperation.confirmation();
            
            afterMvkStorage     = await mvkTokenInstance.storage();
            afterVMvkStorage    = await vMvkTokenInstance.storage();
            afterDoormanStorage = await doormanInstance.storage();      
            
            afterDelegationStorage     = await delegationInstance.storage();
            afterVMvkStorage           = await vMvkTokenInstance.storage();
            afterSMvkStorage           = await sMvkTokenInstance.storage();
            
            const afterDelegateLedgerBob      = await afterDelegationStorage.delegateLedger.get(bob.pkh);     // should show a delegate record with alice's address as the satelliteAddress
            const afterSatelliteLedgerAlice   = await afterDelegationStorage.satelliteLedger.get(alice.pkh);  // should show alice's satellite record with 500000000 in totalDelegatedAmount
            
            // console.log(afterDelegateLedgerBob);
            // console.log(afterSatelliteLedgerAlice);

            const afterMvkLedgerBob            = await afterMvkStorage.ledger.get(bob.pkh);
            const afterVMvkLedgerBob           = await afterVMvkStorage.ledger.get(bob.pkh);
            const afterDoormanBobUserRecord    = await afterDoormanStorage.userStakeLedger.get(bob.pkh); // return user staking records - map(nat, stakeRecordType)        
            const afterDoormanBobStakeRecord   = await afterDoormanBobUserRecord.get("0");               // return { amount: 100000000, exitFee: 0, opType: 'stake', time: '2021-10-26T10:14:54.000Z' }
                    
            // reset back to alice
            await signerFactory(alice.sk);
            
            // console.log("After MVK Storage Total Supply: "  + afterMvkStorage.totalSupply);    // return 891.67 MVK - 891,670,000 in muMVK
            // console.log("After vMVK Storage Total Supply: " + afterVMvkStorage.totalSupply);   // return 1100 vMVK - 1,100,000,000 in muVMVK
            // console.log("After Bob MVK Balance: "           + afterMvkLedgerBob.balance);      // return 400 MVK - 400,000,000 in muMVK
            // console.log("After Bob vMVK Balance: "          + afterVMvkLedgerBob.balance);     // return 600 vMVK - 600,000,000 in muVMVK
            // console.log("After Doorman Bob Record: "        + afterDoormanBobStakeRecord.amount + " " + afterDoormanBobStakeRecord.opType + " with " + afterDoormanBobStakeRecord.exitFee + " fee at " + afterDoormanBobStakeRecord.time); // return "100000000 stake at 2021-10-26T10:14:54.000Z"

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break

            // assert.equal(afterMvkStorage.totalSupply, 891670000);
            // assert.equal(afterVMvkStorage.totalSupply, 1100000000);
            // assert.equal(afterMvkLedgerBob.balance, 400000000);
            // assert.equal(afterVMvkLedgerBob.balance, 600000000);
            // assert.equal(afterDoormanBobStakeRecord.amount, 100000000);

        } catch(e){
            console.log(e);
        }
    });

    it(`bob unstake 100 MVK tokens (with delegation to satellite)`, async () => {
        try{

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: Bob unstake 100 MVK Tokens Test (with delegation to satellite):") 
            console.log("---") // break
        
            const beforeDoormanStorage  = await doormanInstance.storage();
            const beforeMvkStorage      = await mvkTokenInstance.storage();
            const beforeVMvkStorage     = await vMvkTokenInstance.storage();
            const beforeMvkLedgerBob    = await mvkStorage.ledger.get(bob.pkh);
            const beforeVMvkLedgerBob   = await vMvkStorage.ledger.get(bob.pkh);            

            const beforeDelegateLedgerBob      = await beforeDelegationStorage.delegateLedger.get(bob.pkh);    // none (bob has not delegated yet)
            const beforeSatelliteLedgerAlice   = await beforeDelegationStorage.satelliteLedger.get(alice.pkh); // should show alice's satellite record with 0 in totalDelegatedAmount

            // console.log('before');
            // console.log(beforeDelegateLedgerBob);
            // console.log(beforeSatelliteLedgerAlice);
    
            // console.log("Before MVK Storage Total Supply: "  + beforeMvkStorage.totalSupply);   // return 991.67 MVK - 991,670,000 in muMVK
            // console.log("Before vMVK Storage Total Supply: " + beforeVMvkStorage.totalSupply);  // return 1000 vMVK - 1,000,000,000 in muVMVK       
            // console.log("Before Bob MVK Balance: "           + beforeMvkLedgerBob.balance);     // return 500 - 500,000,000 in muMVK
            // console.log("Before Bob vMVK Balance: "          + beforeVMvkLedgerBob.balance);    // return 500 - 500,000,000 in muVMVK       
    
            console.log("---") // break

            await signerFactory(bob.sk);
             
            // Bob stake 100 MVK tokens - 100,000,000 in muMVK
            const stakeAmountOperation = await doormanInstance.methods.unstake(100000000n).send();
            await stakeAmountOperation.confirmation();
            
            afterMvkStorage     = await mvkTokenInstance.storage();
            afterVMvkStorage    = await vMvkTokenInstance.storage();
            afterDoormanStorage = await doormanInstance.storage();      
            
            afterDelegationStorage     = await delegationInstance.storage();
            afterVMvkStorage           = await vMvkTokenInstance.storage();
            afterSMvkStorage           = await sMvkTokenInstance.storage();
            
            const afterDelegateLedgerBob      = await afterDelegationStorage.delegateLedger.get(bob.pkh);     // should show a delegate record with alice's address as the satelliteAddress
            const afterSatelliteLedgerAlice   = await afterDelegationStorage.satelliteLedger.get(alice.pkh);  // should show alice's satellite record with 500000000 in totalDelegatedAmount
            
            // console.log(afterDelegateLedgerBob);
            // console.log(afterSatelliteLedgerAlice);

            const afterMvkLedgerBob            = await afterMvkStorage.ledger.get(bob.pkh);
            const afterVMvkLedgerBob           = await afterVMvkStorage.ledger.get(bob.pkh);
            const afterDoormanBobUserRecord    = await afterDoormanStorage.userStakeLedger.get(bob.pkh); // return user staking records - map(nat, stakeRecordType)        
            const afterDoormanBobStakeRecord   = await afterDoormanBobUserRecord.get("0");               // return { amount: 100000000, exitFee: 0, opType: 'stake', time: '2021-10-26T10:14:54.000Z' }
                    
            // reset back to alice
            await signerFactory(alice.sk);
            
            // console.log("After MVK Storage Total Supply: "  + afterMvkStorage.totalSupply);    // return 891.67 MVK - 891,670,000 in muMVK
            // console.log("After vMVK Storage Total Supply: " + afterVMvkStorage.totalSupply);   // return 1100 vMVK - 1,100,000,000 in muVMVK
            // console.log("After Bob MVK Balance: "           + afterMvkLedgerBob.balance);      // return 400 MVK - 400,000,000 in muMVK
            // console.log("After Bob vMVK Balance: "          + afterVMvkLedgerBob.balance);     // return 600 vMVK - 600,000,000 in muVMVK
            // console.log("After Doorman Bob Record: "        + afterDoormanBobStakeRecord.amount + " " + afterDoormanBobStakeRecord.opType + " with " + afterDoormanBobStakeRecord.exitFee + " fee at " + afterDoormanBobStakeRecord.time); // return "100000000 stake at 2021-10-26T10:14:54.000Z"

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break

            // assert.equal(afterMvkStorage.totalSupply, 891670000);
            // assert.equal(afterVMvkStorage.totalSupply, 1100000000);
            // assert.equal(afterMvkLedgerBob.balance, 400000000);
            // assert.equal(afterVMvkLedgerBob.balance, 600000000);
            // assert.equal(afterDoormanBobStakeRecord.amount, 100000000);

        } catch(e){
            console.log(e);
        }
    });

    it('bob can undelegate from alice satellite', async () => {
        try{        

            beforeDelegationStorage     = await delegationInstance.storage();
            beforeVMvkStorage           = await vMvkTokenInstance.storage();
            beforeSMvkStorage           = await sMvkTokenInstance.storage();
            
            const beforeDelegateLedgerBob      = await beforeDelegationStorage.delegateLedger.get(bob.pkh);    // none (bob has not delegated yet)
            const beforeSatelliteLedgerAlice   = await beforeDelegationStorage.satelliteLedger.get(alice.pkh); // should show alice's satellite record with 0 in totalDelegatedAmount
            const beforeVMvkLedgerBob          = await beforeVMvkStorage.ledger.get(bob.pkh);                  // should show bob's vMVK record and balance of 500000000 vMVK 

            // console.log('before');
            // console.log(beforeDelegateLedgerBob);
            // console.log(beforeSatelliteLedgerAlice);
            // console.log(beforeVMvkLedgerBob);
            
            await signerFactory(bob.sk);

            const undelegateFromSatelliteOperation = await delegationInstance.methods.undelegateFromSatellite(Tezos.unit).send();
            await undelegateFromSatelliteOperation.confirmation();

            afterDelegationStorage     = await delegationInstance.storage();
            afterVMvkStorage           = await vMvkTokenInstance.storage();
            afterSMvkStorage           = await sMvkTokenInstance.storage();
            
            const afterDelegateLedgerBob      = await afterDelegationStorage.delegateLedger.get(bob.pkh);     // should show a delegate record with alice's address as the satelliteAddress
            const afterSatelliteLedgerAlice   = await afterDelegationStorage.satelliteLedger.get(alice.pkh);  // should show alice's satellite record with 500000000 in totalDelegatedAmount
            const afterVMvkLedgerBob          = await afterVMvkStorage.ledger.get(bob.pkh);                   // no change - should show bob's vMVK record and balance of 500000000 vMVK 

            // console.log('after');
            // console.log(afterDelegateLedgerBob);
            // console.log(afterSatelliteLedgerAlice);
            // console.log(afterVMvkLedgerBob);

            await signerFactory(alice.sk);

        } catch(e){
            console.log(e);
        } 
    });

    

    it('alice can unregister as a satellite', async () => {
        try{        

            beforeDelegationStorage     = await delegationInstance.storage();
            beforeVMvkStorage           = await vMvkTokenInstance.storage();
            beforeSMvkStorage           = await sMvkTokenInstance.storage();
            
            const beforeDelegationLedgerAlice  = await beforeDelegationStorage.satelliteLedger.get(alice.pkh);
            const beforeVMvkLedgerAlice        = await beforeVMvkStorage.ledger.get(alice.pkh);
            const beforeSMvkLedgerAlice        = await beforeSMvkStorage.ledger.get(alice.pkh);

            // console.log(beforeDelegationLedgerAlice);
            // console.log(beforeVMvkLedgerAlice);
            // console.log(beforeSMvkLedgerAlice);

            const unregisterAsSatelliteOperation = await delegationInstance.methods.unregisterAsSatellite(Tezos.unit).send();
            await unregisterAsSatelliteOperation.confirmation();

            afterDelegationStorage     = await delegationInstance.storage();
            afterVMvkStorage           = await vMvkTokenInstance.storage();
            afterSMvkStorage           = await sMvkTokenInstance.storage();
            
            const afterDelegationLedgerAlice  = await afterDelegationStorage.satelliteLedger.get(alice.pkh);
            const afterVMvkLedgerAlice        = await afterVMvkStorage.ledger.get(alice.pkh);
            const afterSMvkLedgerAlice        = await afterSMvkStorage.ledger.get(alice.pkh);

            // console.log(afterDelegationLedgerAlice);
            // console.log(afterVMvkLedgerAlice);
            // console.log(afterSMvkLedgerAlice);

        } catch(e){
            console.log(e);
        } 
    });

    it('eve can undelegate from alice satellite (after alice unregisters as satellite)', async () => {
        try{        

            beforeDelegationStorage     = await delegationInstance.storage();
            beforeVMvkStorage           = await vMvkTokenInstance.storage();
            beforeSMvkStorage           = await sMvkTokenInstance.storage();
            
            const beforeDelegateLedgerEve      = await beforeDelegationStorage.delegateLedger.get(eve.pkh);    // should show a delegate record with alice's address as the satelliteAddress
            const beforeSatelliteLedgerAlice   = await beforeDelegationStorage.satelliteLedger.get(alice.pkh); // should show null or undefined
            const beforeVMvkLedgerEve          = await beforeVMvkStorage.ledger.get(eve.pkh);                  // should show eve's vMVK record and balance of 0 vMVK 

            // console.log('before');
            // console.log(beforeDelegateLedgerEve);
            // console.log(beforeSatelliteLedgerAlice);
            // console.log(beforeVMvkLedgerEve);
            
            await signerFactory(eve.sk);

            const undelegateFromSatelliteOperation = await delegationInstance.methods.undelegateFromSatellite(Tezos.unit).send();
            await undelegateFromSatelliteOperation.confirmation();

            afterDelegationStorage     = await delegationInstance.storage();
            afterVMvkStorage           = await vMvkTokenInstance.storage();
            afterSMvkStorage           = await sMvkTokenInstance.storage();
            
            const afterDelegateLedgerEve      = await afterDelegationStorage.delegateLedger.get(eve.pkh);     // should show null or undefined
            const afterSatelliteLedgerAlice   = await afterDelegationStorage.satelliteLedger.get(alice.pkh);  // should show null or undefined
            const afterVMvkLedgerEve          = await afterVMvkStorage.ledger.get(eve.pkh);                   // no change - should show eve's vMVK record and balance of 0 vMVK 

            // console.log('after');
            // console.log(afterDelegateLedgerEve);
            // console.log(afterSatelliteLedgerAlice);
            // console.log(afterVMvkLedgerEve);

            await signerFactory(alice.sk);

        } catch(e){
            console.log(e);
        } 
    });

});
