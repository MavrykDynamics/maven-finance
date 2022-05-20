// const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
// const { InMemorySigner, importKey } = require("@taquito/signer");
// import { Utils, zeroAddress } from "./helpers/Utils";
// import fs from "fs";
// import { confirmOperation } from "../scripts/confirmation";

// const chai = require("chai");
// const assert = require("chai").assert;
// const { createHash } = require("crypto")
// const chaiAsPromised = require('chai-as-promised');
// chai.use(chaiAsPromised);   
// chai.should();

// import env from "../env";
// import { bob, alice, eve, mallory } from "../scripts/sandbox/accounts";

// import farmAddress from '../deployments/farmAddress.json';
// import farmfactoryAddress from '../deployments/farmFactoryAddress.json';
// import lpAddress from '../deployments/lpTokenAddress.json';
// import mvkAddress from '../deployments/mvkTokenAddress.json';
// import doormanAddress from '../deployments/doormanAddress.json';
// import treasuryAddress from '../deployments/treasuryAddress.json';

// describe("Farm", async () => {
//     var utils: Utils;

//     let farmInstance;
//     let farmStorage;

//     let mvkTokenInstance;
//     let mvkTokenStorage;

//     let lpTokenInstance;
//     let lpTokenStorage;

//     let farmFactoryInstance;
//     let farmFactoryStorage;

//     let treasuryInstance;
//     let treasuryStorage;

//     let farmBlockStart;
//     let farmBlockEnd;

//     // Tolerance and accuracy for mathematical rewards calculation
//     const FIXED_POINT_ACCURACY= 100000000000;

//     const signerFactory = async (pk) => {
//         await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
//         return utils.tezos;
//     };

//     const sleep = (ms) => {
//         return new Promise(resolve => setTimeout(resolve, ms));
//     }

//     before("setup", async () => {
//         utils = new Utils();
//         await utils.init(bob.sk);
        
//         farmInstance   = await utils.tezos.contract.at(farmAddress.address);
//         farmStorage    = await farmInstance.storage();
//         farmFactoryInstance   = await utils.tezos.contract.at(farmfactoryAddress.address);
//         farmFactoryStorage    = await farmFactoryInstance.storage();
//         mvkTokenInstance = await utils.tezos.contract.at(mvkAddress.address);
//         mvkTokenStorage    = await mvkTokenInstance.storage();
//         lpTokenInstance = await utils.tezos.contract.at(lpAddress.address);
//         lpTokenStorage    = await lpTokenInstance.storage();
//         treasuryInstance    = await utils.tezos.contract.at(treasuryAddress.address);
//         treasuryStorage    = await treasuryInstance.storage();

//         // Make farm factory track the farm
//         if(!farmFactoryStorage.trackedFarms.includes(farmAddress.address)){
//             const trackOperation = await farmFactoryInstance.methods.trackFarm(farmAddress.address).send();
//             await trackOperation.confirmation();
//         }
//     });

//     beforeEach("storage", async () => {
//         farmStorage = await farmInstance.storage();
//         farmFactoryStorage = await farmFactoryInstance.storage();
//         mvkTokenStorage = await mvkTokenInstance.storage();
//         lpTokenStorage = await lpTokenInstance.storage();

//         await signerFactory(bob.sk)
//     })

//     describe('%initFarm', function() {
//         it('Initialize a farm without being the maintainer', async () => {
//             try{
//                 // Switch signer to Alice
//                 await signerFactory(alice.sk);

//                 // Create a transaction for initiating a farm 
//                 await chai.expect(farmInstance.methods.initFarm(
//                     12000,
//                     100,
//                     2,
//                     false,
//                     false
//                 ).send()).to.be.rejected;

//             }catch(e){
//                 console.log(e)
//             }
//         })

//         it('Initialize a farm with 100 rewards per block that will last for 12 000 blocks', async () => {
//             try{
//                 // Create a transaction for initiating a farm
//                 const operation = await farmInstance.methods.initFarm(
//                     12000,
//                     100,
//                     2,
//                     false,
//                     false
//                 ).send();
//                 await operation.confirmation()

//                 // Refresh farm storage
//                 farmStorage    = await farmInstance.storage();

//                 // Check that the farm has the correct values
//                 const farmOpenEnd = farmStorage.open;
//                 const farmInitEnd = farmStorage.init;
//                 const farmTotalBlocksEnd = farmStorage.config.plannedRewards.totalBlocks;
//                 const farmCurrentRewardPerBlockEnd = farmStorage.config.plannedRewards.currentRewardPerBlock;

//                 assert.equal(farmOpenEnd, true, "The farm should be closed when originated");
//                 assert.equal(farmInitEnd, true, "The farm should not be initiated when originated");
//                 assert.equal(farmTotalBlocksEnd, 12000, "The farm should have totalBlocks set on initFarm");
//                 assert.equal(farmCurrentRewardPerBlockEnd, 100, "The farm should have a currentRewardPerBlock set on initFarm");

//                 // Keep the block where the farm was initiated in a variable for future use
//                 farmStorage    = await farmInstance.storage();
//                 farmBlockStart = parseInt(farmStorage.lastBlockUpdate);
//                 farmBlockEnd   = farmBlockStart + 12000;

//             }catch(e){
//                 console.log(e)
//             }
//         })

//         it('Initialize a farm after it has been already initiated', async () => {
//             try{
//                 // Create a transaction for initiating a farm
//                 await chai.expect(farmInstance.methods.initFarm(
//                     12000,
//                     100,
//                     2,
//                     false,
//                     false
//                 ).send()).to.be.rejected;
//             }catch(e){
//                 console.log(e)
//             }
//         })
//     });

//     describe('%deposit', function() {
//         it('Bob deposits 2LP Tokens', async () => {
//             try{
//                 // Amount of LP to deposit
//                 const amountToDeposit = 2;
                
//                 // Create a transaction for allowing farm to spend LP Token in the name of Bob
//                 const bobLedgerStart = await lpTokenStorage.ledger.get(bob.pkh);
//                 const bobApprovalsStart = await bobLedgerStart.allowances.get(farmAddress.address);
//                 // Check Bob has no pending approvals for the farm
//                 if(bobApprovalsStart===undefined || bobApprovalsStart<=0){
//                     const allowances = bobApprovalsStart===undefined ? amountToDeposit : Math.abs(bobApprovalsStart - amountToDeposit);
//                     const approveOperation = await lpTokenInstance.methods.approve(farmAddress.address,allowances).send();
//                     await approveOperation.confirmation();
//                 }

//                 // Get Bob LP delegated amount before deposing
//                 const bobDepositorRecordStart = await farmStorage.depositors.get(bob.pkh);
//                 const bobLPDelegatedStart = parseInt(bobDepositorRecordStart===undefined ? 0 : bobDepositorRecordStart.balance);

//                 // Create a transaction for depositing LP to a farm
//                 const depositOperation = await farmInstance.methods.deposit(amountToDeposit).send();
//                 await depositOperation.confirmation();

//                 // Refresh Farm storage
//                 farmStorage = await farmInstance.storage();

//                 // Check that LP have been deposited
//                 const bobDepositorRecordEnd = await farmStorage.depositors.get(bob.pkh);
//                 const bobLPDelegatedEnd = parseInt(bobDepositorRecordEnd===undefined ? 0 : bobDepositorRecordEnd.balance);
//                 assert.equal(bobLPDelegatedEnd, bobLPDelegatedStart + amountToDeposit, "Bob should have "+(bobLPDelegatedStart + amountToDeposit)+" LP Tokens deposited in the farm");
//             } catch(e){
//                 console.log(e);
//             } 
//         });

//         it('Bob deposits more LP than she has', async () => {
//             try{
                
//                 // Create a transaction for allowing farm to spend LP Token in the name of Bob
//                 const bobLedgerStart = await lpTokenStorage.ledger.get(bob.pkh);
//                 const bobApprovalsStart = await bobLedgerStart.allowances.get(farmAddress.address);

//                 // Amount of LP to deposit
//                 const amountToDeposit = parseInt(bobLedgerStart.balance) + 1;

//                 // Check Bob has no pending approvals for the farm
//                 if(bobApprovalsStart===undefined || bobApprovalsStart<=0){
//                     const allowances = bobApprovalsStart===undefined ? amountToDeposit : Math.abs(bobApprovalsStart - amountToDeposit);
//                     const approveOperation = await lpTokenInstance.methods.approve(farmAddress.address,allowances).send();

//                     await approveOperation.confirmation();

//                     // Check that LP FA12 has been approved
//                     lpTokenStorage = await lpTokenInstance.storage();
//                     const bobLedgerEnd = await lpTokenStorage.ledger.get(bob.pkh);
//                     assert.notStrictEqual(bobLedgerEnd, undefined, "Bob should have an account in the LP Token contract");
                    
//                     const bobApprovalsEnd = await bobLedgerEnd.allowances.get(farmAddress.address);

//                     assert.notStrictEqual(bobApprovalsEnd, undefined, "Bob should have the farm address in her approvals");
//                     assert.equal(bobApprovalsEnd, amountToDeposit, "Bob should have approved "+amountToDeposit+" LP Token to spend to the farm");
                    
//                 }

//                 // Create a transaction for depositing LP to a farm
//                 const depositOperation = await farmInstance.methods.deposit(amountToDeposit).send();
//                 await depositOperation.confirmation();

//             } catch(e){
//                 assert.strictEqual(e.message, "NotEnoughBalance", "Bob should not be able to spend more LP than she has");
//             } 
//         })

//         it('Bob deposits 3LP Tokens then Alice deposits 8LP', async () => {
//             try{
//                 // Amount of LP to deposit
//                 var amountToDeposit = 3;
                
//                 // Create a transaction for allowing farm to spend LP Token in the name of Bob
//                 const bobLedgerStart = await lpTokenStorage.ledger.get(bob.pkh);
//                 const bobApprovalsStart = await bobLedgerStart.allowances.get(farmAddress.address);
//                 // Check Bob has no pending approvals for the farm
//                 if(bobApprovalsStart===undefined || bobApprovalsStart<=0){
//                     const allowances = bobApprovalsStart===undefined ? amountToDeposit : Math.abs(bobApprovalsStart - amountToDeposit);
//                     const approveOperation = await lpTokenInstance.methods.approve(farmAddress.address,allowances).send();
//                     await approveOperation.confirmation();
//                 }

//                 // Get Bob LP delegated amount before deposing
//                 const bobDepositorRecordStart = await farmStorage.depositors.get(bob.pkh);
//                 const bobLPDelegatedStart = parseInt(bobDepositorRecordStart===undefined ? 0 : bobDepositorRecordStart.balance);
                
//                 // Create a transaction for depositing LP to a farm
//                 const depositOperation = await farmInstance.methods.deposit(amountToDeposit).send();
//                 await depositOperation.confirmation();

//                 // Refresh Farm storage
//                 farmStorage = await farmInstance.storage();

//                 // Check that LP have been deposited
//                 const bobDepositorRecordEnd = await farmStorage.depositors.get(bob.pkh);
//                 const bobLPDelegatedEnd = parseInt(bobDepositorRecordEnd===undefined ? 0 : bobDepositorRecordEnd.balance);
//                 assert.equal(bobLPDelegatedEnd, bobLPDelegatedStart + amountToDeposit, "Bob should have "+(bobLPDelegatedStart + amountToDeposit)+" LP Tokens deposited in the farm");

//                 // Switch signer to Alice
//                 await signerFactory(alice.sk);

//                 // Amount of LP to deposit
//                 var amountToDeposit = 8;
                
//                 // Create a transaction for allowing farm to spend LP Token in the name of Bob
//                 const aliceLedgerStart = await lpTokenStorage.ledger.get(alice.pkh);
//                 const aliceApprovalsStart = await aliceLedgerStart.allowances.get(farmAddress.address);
//                 // Check Bob has no pending approvals for the farm
//                 if(aliceApprovalsStart===undefined || aliceApprovalsStart<=0){
//                     const allowances = aliceApprovalsStart===undefined ? amountToDeposit : Math.abs(aliceApprovalsStart - amountToDeposit);
//                     const approveOperation = await lpTokenInstance.methods.approve(farmAddress.address,allowances).send();
//                     await approveOperation.confirmation();
//                 }

//                 // Get Bob LP delegated amount before deposing
//                 const aliceDepositorRecordStart = await farmStorage.depositors.get(alice.pkh);
//                 const aliceLPDelegatedStart = parseInt(aliceDepositorRecordStart===undefined ? 0 : aliceDepositorRecordStart.balance);
                
//                 // Create a transaction for depositing LP to a farm
//                 const aliceDepositOperation = await farmInstance.methods.deposit(amountToDeposit).send();
//                 await aliceDepositOperation.confirmation();

//                 // Refresh Farm storage
//                 farmStorage = await farmInstance.storage();

//                 // Check that LP have been deposited
//                 const aliceDepositorRecordEnd = await farmStorage.depositors.get(alice.pkh);
//                 const aliceLPDelegatedEnd = parseInt(aliceDepositorRecordEnd===undefined ? 0 : aliceDepositorRecordEnd.balance);
//                 assert.equal(aliceLPDelegatedEnd, aliceLPDelegatedStart + amountToDeposit, "Alice should have "+(aliceLPDelegatedStart + amountToDeposit)+" LP Tokens deposited in the farm");
//             } catch(e){
//                 console.log(e);
//             }
//         });
//     })

//     describe('%withdraw', function() {
//         it('Bob withdraws 1LP Token', async () => {
//             try{
//                 // Amount of LP to withdraw
//                 const amountToWithdraw = 1;

//                 // Get Bob LP delegated amount before withdrawing
//                 const bobDepositorRecordStart = await farmStorage.depositors.get(bob.pkh);
//                 const bobLPTokensStart = await lpTokenStorage.ledger.get(bob.pkh);
//                 console.log(bobDepositorRecordStart)
//                 console.log("bob ledger start: ", bobLPTokensStart)
//                 const bobLPDelegatedStart = parseInt(bobDepositorRecordStart===undefined ? 0 : bobDepositorRecordStart.balance);
                
//                 // Create a transaction for depositing LP to a farm
//                 const withdrawOperation = await farmInstance.methods.withdraw(amountToWithdraw).send();
//                 await withdrawOperation.confirmation();

//                 // Refresh Farm storage
//                 farmStorage = await farmInstance.storage();

//                 // Check that LP have been withdrawed
//                 const bobDepositorRecordEnd = await farmStorage.depositors.get(bob.pkh);
//                 lpTokenStorage = await lpTokenInstance.storage();
//                 const bobLPTokensEnd = await lpTokenStorage.ledger.get(bob.pkh);
//                 console.log(bobDepositorRecordEnd)
//                 console.log("bob ledger end: ", bobLPTokensEnd)

//                 const bobLPDelegatedEnd = parseInt(bobDepositorRecordEnd===undefined ? 0 : bobDepositorRecordEnd.balance);
//                 assert.equal(bobLPDelegatedEnd, bobLPDelegatedStart - amountToWithdraw, "Bob should have "+(bobLPDelegatedStart - amountToWithdraw)+" LP Tokens withdrawed from the farm");
//             } catch(e){
//                 console.log(e);
//             } 
//         });

//         it('Bob withdraws 2LP Token and Alice withdraws 1LP Token', async () => {
//             try{
//                 // Amount of LP to withdraw
//                 var amountToWithdraw = 2;

//                 // Get Bob LP delegated amount before withdrawing
//                 const bobDepositorRecordStart = await farmStorage.depositors.get(bob.pkh);
//                 const bobLPTokensStart = await lpTokenStorage.ledger.get(bob.pkh);
//                 console.log(bobDepositorRecordStart)
//                 console.log("bob ledger start: ", bobLPTokensStart)
//                 const bobLPDelegatedStart = parseInt(bobDepositorRecordStart===undefined ? 0 : bobDepositorRecordStart.balance);
                
//                 // Create a transaction for depositing LP to a farm
//                 const withdrawOperation = await farmInstance.methods.withdraw(amountToWithdraw).send();
//                 await withdrawOperation.confirmation();

//                 // Refresh Farm storage
//                 farmStorage = await farmInstance.storage();

//                 // Check that LP have been deposited
//                 const bobDepositorRecordEnd = await farmStorage.depositors.get(bob.pkh);
//                 lpTokenStorage = await lpTokenInstance.storage();
//                 const bobLPTokensEnd = await lpTokenStorage.ledger.get(bob.pkh);
//                 console.log(bobDepositorRecordEnd)
//                 console.log("bob ledger end: ", bobLPTokensEnd)
//                 const bobLPDelegatedEnd = parseInt(bobDepositorRecordEnd===undefined ? 0 : bobDepositorRecordEnd.balance);

//                 assert.equal(bobLPDelegatedEnd, bobLPDelegatedStart - amountToWithdraw, "Bob should have "+(bobLPDelegatedStart - amountToWithdraw)+" LP Tokens withdrawed from the farm");

//                 // Switch signer to Alice
//                 await signerFactory(alice.sk);

//                 // Amount of LP to withdraw
//                 amountToWithdraw = 1;

//                 // Get Bob LP delegated amount before withdrawing
//                 const aliceDepositorRecordStart = await farmStorage.depositors.get(alice.pkh);
//                 const aliceLPTokensStart = await lpTokenStorage.ledger.get(bob.pkh);
//                 console.log(aliceLPTokensStart)
//                 console.log("alice ledger start: ", aliceLPTokensStart)
//                 const aliceLPDelegatedStart = parseInt(aliceDepositorRecordStart===undefined ? 0 : aliceDepositorRecordStart.balance);
                
//                 // Create a transaction for depositing LP to a farm
//                 const aliceWithdrawOperation = await farmInstance.methods.withdraw(amountToWithdraw).send();
//                 await aliceWithdrawOperation.confirmation();

//                 // Refresh Farm storage
//                 farmStorage = await farmInstance.storage();

//                 // Check that LP have been deposited
//                 const aliceDepositorRecordEnd = await farmStorage.depositors.get(alice.pkh);
//                 lpTokenStorage = await lpTokenInstance.storage();
//                 const aliceLPTokensEnd = await lpTokenStorage.ledger.get(alice.pkh);
//                 console.log(aliceDepositorRecordEnd)
//                 console.log("alice ledger end: ", aliceLPTokensEnd)
//                 const aliceLPDelegatedEnd = parseInt(aliceDepositorRecordEnd===undefined ? 0 : aliceDepositorRecordEnd.balance);
//                 assert.equal(aliceLPDelegatedEnd, aliceLPDelegatedStart - amountToWithdraw, "Alice should have "+(aliceLPDelegatedStart - amountToWithdraw)+" LP Tokens withdrawed from the farm");
//             } catch(e){
//                 console.log(e);
//             } 
//         });
//     });

//     describe('%updateConfig', function() {
//         it('Admin should be able to force the rewards to come from transfers instead of minting', async () => {
//             try{
//                 // Initial values
//                 const amountToDeposit = 1;
//                 const mvkTotalSupply = parseInt(mvkTokenStorage.totalSupply);
//                 const toggleTransfer = farmStorage.config.forceRewardFromTransfer;
//                 const doormanBalance = parseInt(await mvkTokenStorage.ledger.get(doormanAddress.address));
                
//                 // Create a transaction for depositing LP to a farm
//                 const userLedgerStart = await lpTokenStorage.ledger.get(bob.pkh);
//                 const userApprovalsStart = await userLedgerStart.allowances.get(farmAddress.address);
//                 if(userApprovalsStart===undefined || userApprovalsStart<=0){
//                     const allowances = userApprovalsStart===undefined ? amountToDeposit : Math.abs(userApprovalsStart - amountToDeposit);
//                     const approveOperation = await lpTokenInstance.methods.approve(farmAddress.address,allowances).send();
//                     await approveOperation.confirmation();
//                 }
//                 const depositOperation = await farmInstance.methods.deposit(amountToDeposit).send();
//                 await depositOperation.confirmation();

//                 // Wait at least one block before claiming rewards from mint
//                 var mvkTotalSupplyFirstUpdate = 0;
//                 var doormanBalanceFirstUpdate = 0;
//                 var treasuryFirstUpdate = 0;
//                 await sleep(5000).then(async () => {
//                     const claimOperation = await farmInstance.methods.claim(bob.pkh).send();
//                     await claimOperation.confirmation();
//                     mvkTokenStorage = await mvkTokenInstance.storage();
//                     mvkTotalSupplyFirstUpdate = parseInt(mvkTokenStorage.totalSupply);
//                     doormanBalanceFirstUpdate = parseInt(await mvkTokenStorage.ledger.get(doormanAddress.address));
//                     treasuryFirstUpdate = parseInt(await mvkTokenStorage.ledger.get(treasuryAddress.address));
//                 })

//                 // Toggle to transfer
//                 const firstToggleOperation = await farmInstance.methods.updateConfig(1, "configForceRewardFromTransfer").send();
//                 await firstToggleOperation.confirmation();

//                 //Update storage
//                 farmStorage = await farmInstance.storage();
//                 const toggleTransferFirstUpdate = farmStorage.config.forceRewardFromTransfer;

//                 //Do another claim
//                 var mvkTotalSupplySecondUpdate = 0;
//                 var doormanBalanceSecondUpdate = 0;
//                 var treasurySecondUpdate = 0;
//                 await sleep(5000).then(async () => {
//                     const claimOperation = await farmInstance.methods.claim(bob.pkh).send();
//                     await claimOperation.confirmation();
//                     mvkTokenStorage = await mvkTokenInstance.storage();
//                     mvkTotalSupplySecondUpdate = parseInt(mvkTokenStorage.totalSupply);
//                     doormanBalanceSecondUpdate = parseInt(await mvkTokenStorage.ledger.get(doormanAddress.address));
//                     treasurySecondUpdate = parseInt(await mvkTokenStorage.ledger.get(treasuryAddress.address));
//                 })

//                 // Toggle to mint 
//                 const secondToggleOperation = await farmInstance.methods.updateConfig(0, "configForceRewardFromTransfer").send();
//                 await secondToggleOperation.confirmation();

//                 //Update storage
//                 farmStorage = await farmInstance.storage();
//                 const toggleTransferSecondUpdate = farmStorage.config.forceRewardFromTransfer;

//                 //Do another claim
//                 var mvkTotalSupplyThirdUpdate = 0;
//                 var doormanBalanceThirdUpdate = 0;
//                 var treasuryThirdUpdate = 0;
//                 await sleep(5000).then(async () => {
//                     const claimOperation = await farmInstance.methods.claim(bob.pkh).send();
//                     await claimOperation.confirmation();
//                     mvkTokenStorage = await mvkTokenInstance.storage();
//                     mvkTotalSupplyThirdUpdate = parseInt(mvkTokenStorage.totalSupply);
//                     doormanBalanceThirdUpdate = parseInt(await mvkTokenStorage.ledger.get(doormanAddress.address));
//                     treasuryThirdUpdate = parseInt(await mvkTokenStorage.ledger.get(treasuryAddress.address));
//                 })

//                 assert.notEqual(mvkTotalSupply,mvkTotalSupplyFirstUpdate);
//                 assert.equal(mvkTotalSupplySecondUpdate,mvkTotalSupplyFirstUpdate);
//                 assert.notEqual(mvkTotalSupplySecondUpdate,mvkTotalSupplyThirdUpdate);

//                 assert.notEqual(toggleTransferFirstUpdate,toggleTransfer);
//                 assert.equal(toggleTransfer,toggleTransferSecondUpdate);

//                 assert.notEqual(doormanBalance,doormanBalanceFirstUpdate);
//                 assert.notEqual(doormanBalance,doormanBalanceSecondUpdate);
//                 assert.notEqual(doormanBalanceFirstUpdate,doormanBalanceSecondUpdate);
//                 assert.notEqual(doormanBalanceSecondUpdate,doormanBalanceThirdUpdate);

//                 console.log("MVK total supply at beginning: ",mvkTotalSupply)
//                 console.log("MVK total supply after first mint: ",mvkTotalSupplyFirstUpdate)
//                 console.log("MVK total supply after transfer: ",mvkTotalSupplySecondUpdate)
//                 console.log("MVK total supply after second mint: ",mvkTotalSupplyThirdUpdate)
//                 console.log("Transfer forced after first toggling: ",toggleTransferFirstUpdate)
//                 console.log("Transfer forced after second toggling: ",toggleTransferSecondUpdate)
//                 console.log("Doorman balance after first mint: ", doormanBalanceFirstUpdate)
//                 console.log("Doorman balance after transfer: ", doormanBalanceSecondUpdate)
//                 console.log("Doorman balance after second mint: ", doormanBalanceThirdUpdate)
//                 console.log("Treasury after first mint: ",treasuryFirstUpdate)
//                 console.log("Treasury after transfer: ",treasurySecondUpdate)
//                 console.log("Treasury after second mint: ",treasuryThirdUpdate)
//             } catch(e){
//                 console.log(e);
//             } 
//         });

//         it('Non-maintainer should not be able to force the rewards to come from transfers instead of minting', async () => {
//             try{
//                 // Initial values
//                 const amountToDeposit = 1;
//                 const mvkTotalSupply = parseInt(mvkTokenStorage.totalSupply);
//                 const toggleTransfer = farmStorage.config.forceRewardFromTransfer;
//                 const doormanBalance = parseInt(await mvkTokenStorage.ledger.get(doormanAddress.address));
                
//                 // Create a transaction for depositing LP to a farm
//                 const userLedgerStart = await lpTokenStorage.ledger.get(bob.pkh);
//                 const userApprovalsStart = await userLedgerStart.allowances.get(farmAddress.address);
//                 if(userApprovalsStart===undefined || userApprovalsStart<=0){
//                     const allowances = userApprovalsStart===undefined ? amountToDeposit : Math.abs(userApprovalsStart - amountToDeposit);
//                     const approveOperation = await lpTokenInstance.methods.approve(farmAddress.address,allowances).send();
//                     await approveOperation.confirmation();
//                 }
//                 const depositOperation = await farmInstance.methods.deposit(amountToDeposit).send();
//                 await depositOperation.confirmation();

//                 // Wait at least one block before claiming rewards from mint
//                 var mvkTotalSupplyFirstUpdate = 0;
//                 var doormanBalanceFirstUpdate = 0;
//                 await sleep(5000).then(async () => {
//                     const claimOperation = await farmInstance.methods.claim(bob.pkh).send();
//                     await claimOperation.confirmation();
//                     mvkTokenStorage = await mvkTokenInstance.storage();
//                     mvkTotalSupplyFirstUpdate = parseInt(mvkTokenStorage.totalSupply);
//                     doormanBalanceFirstUpdate = parseInt(await mvkTokenStorage.ledger.get(doormanAddress.address));
//                     console.log(await mvkTokenStorage.ledger.get(doormanAddress.address))
//                 })

//                 // Toggle to transfer
//                 await signerFactory(alice.sk);
//                 await chai.expect(farmInstance.methods.updateConfig(1, "configForceRewardFromTransfer").send()).to.be.rejected;

//                 //Update storage
//                 farmStorage = await farmInstance.storage();
//                 const toggleTransferFirstUpdate = farmStorage.config.forceRewardFromTransfer;

//                 //Do another claim
//                 var mvkTotalSupplySecondUpdate = 0;
//                 var doormanBalanceSecondUpdate = 0;
//                 await signerFactory(bob.sk);
//                 await sleep(5000).then(async () => {
//                     const claimOperation = await farmInstance.methods.claim(bob.pkh).send();
//                     await claimOperation.confirmation();
//                     mvkTokenStorage = await mvkTokenInstance.storage();
//                     mvkTotalSupplySecondUpdate = parseInt(mvkTokenStorage.totalSupply);
//                     doormanBalanceSecondUpdate = parseInt(await mvkTokenStorage.ledger.get(doormanAddress.address));
//                 })

//                 assert.notEqual(mvkTotalSupply,mvkTotalSupplyFirstUpdate);
//                 assert.notEqual(mvkTotalSupplySecondUpdate,mvkTotalSupplyFirstUpdate);
//                 assert.equal(toggleTransferFirstUpdate,toggleTransfer);
//                 assert.notEqual(doormanBalance,doormanBalanceFirstUpdate);
//                 assert.notEqual(doormanBalance,doormanBalanceSecondUpdate);
//                 assert.notEqual(doormanBalanceFirstUpdate,doormanBalanceSecondUpdate);

//                 console.log("MVK total supply: ",mvkTotalSupply)
//                 console.log("MVK total supply after mint: ",mvkTotalSupplyFirstUpdate)
//                 console.log("MVK total supply after transfer: ",mvkTotalSupplySecondUpdate)
//                 console.log("Transfer forced: ",toggleTransferFirstUpdate)
//                 console.log("Doorman balance after mint: ", doormanBalanceFirstUpdate)
//                 console.log("Doorman balance after transfer: ", doormanBalanceSecondUpdate)
//             } catch(e){
//                 console.log(e);
//             } 
//         });
//     });
// });
