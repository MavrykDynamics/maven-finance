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
// import lpAddress from '../deployments/mavrykFa12TokenAddress.json';
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

//     let doormanInstance;
//     let doormanStorage;

//     function wait(ms: number) {
//         return new Promise((resolve) => setTimeout(resolve, ms));
//     }

//     const signerFactory = async (pk) => {
//         await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
//         return utils.tezos;
//     };

//     before("setup", async () => {
//         utils = new Utils();
//         await utils.init(bob.sk);
        
//         farmInstance            = await utils.tezos.contract.at(farmAddress.address);
//         farmStorage             = await farmInstance.storage();

//         farmFactoryInstance     = await utils.tezos.contract.at(farmfactoryAddress.address);
//         farmFactoryStorage      = await farmFactoryInstance.storage();
//         mvkTokenInstance        = await utils.tezos.contract.at(mvkAddress.address);
//         mvkTokenStorage         = await mvkTokenInstance.storage();
//         lpTokenInstance         = await utils.tezos.contract.at(lpAddress.address);
//         lpTokenStorage          = await lpTokenInstance.storage();
//         treasuryInstance        = await utils.tezos.contract.at(treasuryAddress.address);
//         treasuryStorage         = await treasuryInstance.storage();
//         doormanInstance         = await utils.tezos.contract.at(doormanAddress.address);
//         doormanStorage          = await doormanInstance.storage();

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

//     describe("Non-initialized farm", function() {

//         describe("%deposit", function() {
//             it('User should not be able to deposit in a farm that has not been initialized yet', async () => {
//                 try{
//                     // Initial values
//                     lpTokenStorage          = await lpTokenInstance.storage();
//                     farmStorage             = await farmInstance.storage();
//                     const farmInit          = farmStorage.init;
//                     const lpLedgerStart     = await lpTokenStorage.ledger.get(bob.pkh);
//                     const lpAllowances      = await lpLedgerStart.allowances.get(farmAddress.address);
//                     const amountToDeposit   = 6;
    
//                     // Approval operation
//                     if(lpAllowances===undefined || lpAllowances.toNumber()<=0){
//                         const approvals         = lpAllowances===undefined ? amountToDeposit : Math.abs(lpAllowances.toNumber() - amountToDeposit);
//                         const approveOperation  = await lpTokenInstance.methods.approve(farmAddress.address,approvals).send();
//                         await approveOperation.confirmation();
//                     }
    
//                     // Operation
//                     await chai.expect(farmInstance.methods.deposit(amountToDeposit).send()).to.be.rejected;

//                     // Assertion
//                     assert.equal(farmInit, false);
//                 } catch(e) {
//                     console.dir(e, {depth: 5})
//                 }
//             })
//         })

//         describe("%withdraw", function() {
//             it('User should not be able to withdraw from a farm that has not been initialized yet', async () => {
//                 try{
//                     // Initial values
//                     lpTokenStorage          = await lpTokenInstance.storage();
//                     farmStorage             = await farmInstance.storage();
//                     const farmInit          = farmStorage.init;
//                     const amountToWithdraw  = 1;
    
//                     // Operation
//                     await chai.expect(farmInstance.methods.withdraw(amountToWithdraw).send()).to.be.rejected;

//                     // Assertion
//                     assert.equal(farmInit, false);
//                 } catch(e) {
//                     console.dir(e, {depth: 5})
//                 }
//             })
//         })

//         describe("%claim", function() {
//             it('User should not be able to claim in a farm that has not been initialized yet', async () => {
//                 try{
//                     // Initial values
//                     lpTokenStorage          = await lpTokenInstance.storage();
//                     farmStorage             = await farmInstance.storage();
//                     const farmInit          = farmStorage.init;
    
//                     // Operation
//                     await chai.expect(farmInstance.methods.claim(bob.pkh).send()).to.be.rejected;

//                     // Assertion
//                     assert.equal(farmInit, false);
//                 } catch(e) {
//                     console.dir(e, {depth: 5})
//                 }
//             })
//         })

//     })

//     describe("Initialized farm", function() {
//         describe('%setAdmin', function() {
//             it('Admin should be able to set a new admin', async() => {
//                 try{
//                     // Initial values
//                     const previousAdmin = farmStorage.admin;

//                     // Create a transaction for initiating a farm
//                     const operation = await farmInstance.methods.setAdmin(alice.pkh).send();
//                     await operation.confirmation();

//                     // Final values
//                     farmStorage = await farmInstance.storage();

//                     // Assertion
//                     assert.strictEqual(farmStorage.admin,alice.pkh);
//                     assert.strictEqual(previousAdmin,bob.pkh);

//                     // Reset admin
//                     await signerFactory(alice.sk);
//                     const resetOperation = await farmInstance.methods.setAdmin(bob.pkh).send();
//                     await resetOperation.confirmation();
//                 }catch(e){
//                     console.dir(e, {depth: 5})
//                 }
//             })

//             it('Non-admin should not be able to set a new admin', async() => {
//                 try{
//                     // Create a transaction for initiating a farm
//                     await signerFactory(eve.sk)
//                     const operation = farmInstance.methods.setAdmin(bob.pkh);
//                     await chai.expect(operation.send()).to.be.rejected;

//                     // Final values
//                     farmStorage = await farmInstance.storage();

//                     // Assertion
//                     assert.strictEqual(farmStorage.admin,bob.pkh)
//                 }catch(e){
//                     console.dir(e, {depth: 5})
//                 }
//             })
//         })

//         describe('%initFarm', function() {
//             it('User should not be able to initialize a farm', async () => {
//                 try{
//                     // Switch signer to Alice
//                     await signerFactory(alice.sk);

//                     // Operation
//                     await chai.expect(farmInstance.methods.initFarm(
//                         12000,
//                         100,
//                         false,
//                         false
//                     ).send()).to.be.rejected;

//                 }catch(e){
//                     console.dir(e, {depth: 5})
//                 }
//             })

//             it('Admin should not be able to initialize without a proper duration', async () => {
//                 try{
//                     // Operation
//                     await chai.expect(farmInstance.methods.initFarm(
//                         0,
//                         100,
//                         false,
//                         false
//                     ).send()).to.be.rejected;

//                 }catch(e){
//                     console.dir(e, {depth: 5})
//                 }
//             })

//             it('Admin should be able to initialize a farm', async () => {
//                 try{
//                     // Operation
//                     const operation = await farmInstance.methods.initFarm(
//                         12000,
//                         100,
//                         false,
//                         false
//                     ).send();
//                     await operation.confirmation()

//                     // Final values
//                     farmStorage    = await farmInstance.storage();
//                     // console.log("REWARDS: ", farmStorage.config.plannedRewards)
//                     // console.log("TIME: ", farmStorage.minBlockTimeSnapshot.toNumber())

//                     // Assertions
//                     assert.equal(farmStorage.open, true);
//                     assert.equal(farmStorage.init, true);
//                     assert.equal(farmStorage.config.plannedRewards.totalBlocks, 12000);
//                     assert.equal(farmStorage.config.plannedRewards.currentRewardPerBlock, 100);

//                 }catch(e){
//                     console.dir(e, {depth: 5})
//                 }
//             })

//             it('Admin should not be able to initialize the same farm twice', async () => {
//                 try{
//                     // Operation
//                     await chai.expect(farmInstance.methods.initFarm(
//                         12000,
//                         100,
//                         false,
//                         false
//                     ).send()).to.be.rejected;
//                 }catch(e){
//                     console.dir(e, {depth: 5})
//                 }
//             })
//         });

//         describe('%deposit', function() {
//             it('User should be able to deposit LP Tokens into a farm', async () => {
//                 try{
//                     // Initial values
//                     lpTokenStorage          = await lpTokenInstance.storage();
//                     farmStorage             = await farmInstance.storage();
//                     const lpLedgerStart     = await lpTokenStorage.ledger.get(bob.pkh);
//                     const lpBalance         = lpLedgerStart.balance.toNumber();
//                     const lpAllowances      = await lpLedgerStart.allowances.get(farmAddress.address);
                    
//                     const depositRecord     = await farmStorage.depositorLedger.get(bob.pkh);
//                     const depositBalance    = depositRecord===undefined ? 0 : depositRecord.balance.toNumber();
                    
//                     const amountToDeposit   = 6;

//                     // Approval operation
//                     if(lpAllowances===undefined || lpAllowances.toNumber()<=0){
//                         const approvals         = lpAllowances===undefined ? amountToDeposit : Math.abs(lpAllowances.toNumber() - amountToDeposit);
//                         const approveOperation  = await lpTokenInstance.methods.approve(farmAddress.address,approvals).send();
//                         await approveOperation.confirmation();
//                     }

//                     // Operation
//                     const depositOperation          = await farmInstance.methods.deposit(amountToDeposit).send();
//                     await depositOperation.confirmation();

//                     // Final values
//                     lpTokenStorage          = await lpTokenInstance.storage();
//                     farmStorage             = await farmInstance.storage();
//                     // console.log("REWARDS: ", farmStorage.config.plannedRewards)
//                     // console.log("TIME: ", farmStorage.minBlockTimeSnapshot.toNumber())
//                     const depositRecordEnd  = await farmStorage.depositorLedger.get(bob.pkh);
//                     const depositBalanceEnd = depositRecordEnd===undefined ? 0 : depositRecordEnd.balance.toNumber();
//                     const lpLedgerEnd       = await lpTokenStorage.ledger.get(bob.pkh);
//                     const lpBalanceEnd      = lpLedgerEnd.balance.toNumber();

//                     // Assertions
//                     assert.equal(depositBalanceEnd, depositBalance + amountToDeposit);
//                     assert.equal(lpBalanceEnd, lpBalance - amountToDeposit);
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 } 
//             });

//             it('User should not be able to able to deposit more LP Tokens than it has', async () => {
//                 try{
//                     // Initial values
//                     lpTokenStorage          = await lpTokenInstance.storage();
//                     farmStorage             = await farmInstance.storage();
//                     const lpLedgerStart     = await lpTokenStorage.ledger.get(bob.pkh);
//                     const lpAllowances      = await lpLedgerStart.allowances.get(farmAddress.address);
//                     const lpBalance         = lpLedgerStart===undefined ? 0 : lpLedgerStart.balance.toNumber();
//                     const amountToDeposit   = lpBalance + 1;

//                     // Approval operation
//                     if(lpAllowances===undefined || lpAllowances.toNumber()<=0){
//                         const approvals         = lpAllowances===undefined ? amountToDeposit : Math.abs(lpAllowances.toNumber() - amountToDeposit);
//                         const approveOperation  = await lpTokenInstance.methods.approve(farmAddress.address,approvals).send();
//                         await approveOperation.confirmation();
//                     }

//                     // Operation
//                     await chai.expect(farmInstance.methods.deposit(amountToDeposit).send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5})
//                 } 
//             })

//             it('Multiple users should be able to deposit in a farm', async () => {
//                 try{
//                     // Initial values
//                     lpTokenStorage                  = await lpTokenInstance.storage();
//                     farmStorage                     = await farmInstance.storage();
                    
//                     const firstLpLedgerStart        = await lpTokenStorage.ledger.get(bob.pkh);
//                     const firstLpBalance            = firstLpLedgerStart.balance.toNumber();
//                     const firstLpAllowances         = await firstLpLedgerStart.allowances.get(farmAddress.address);
                    
//                     const firstDepositRecord        = await farmStorage.depositorLedger.get(bob.pkh);
//                     const firstDepositBalance       = firstDepositRecord===undefined ? 0 : firstDepositRecord.balance.toNumber();
                    
//                     const firstAmountToDeposit      = 10;
                    
//                     const secondLpLedgerStart       = await lpTokenStorage.ledger.get(alice.pkh);
//                     const secondLpBalance           = secondLpLedgerStart.balance.toNumber();
//                     const secondLpAllowances        = await secondLpLedgerStart.allowances.get(farmAddress.address);
                    
//                     const secondDepositRecord       = await farmStorage.depositorLedger.get(alice.pkh);
//                     const secondDepositBalance      = secondDepositRecord===undefined ? 0 : secondDepositRecord.balance.toNumber();
                    
//                     const secondAmountToDeposit     = 8;

//                     // Approval operations
//                     if(firstLpAllowances===undefined || firstLpAllowances.toNumber()<=0){
//                         await signerFactory(bob.sk)
//                         const approvals         = firstLpAllowances===undefined ? firstAmountToDeposit : Math.abs(firstLpAllowances.toNumber() - firstAmountToDeposit);
//                         const approveOperation  = await lpTokenInstance.methods.approve(farmAddress.address,approvals).send();
//                         await approveOperation.confirmation();
//                     }
//                     if(secondLpAllowances===undefined || secondLpAllowances.toNumber()<=0){
//                         await signerFactory(alice.sk)
//                         const approvals         = secondLpAllowances===undefined ? secondAmountToDeposit : Math.abs(secondLpAllowances.toNumber() - secondAmountToDeposit);
//                         const approveOperation  = await lpTokenInstance.methods.approve(farmAddress.address,approvals).send();
//                         await approveOperation.confirmation();
//                     }

//                     // const bobDepositParam        = await farmInstance.methods.deposit(firstAmountToDeposit).toTransferParams();
//                     // const bobEstimate            = await utils.tezos.estimate.transfer(bobDepositParam);
//                     // console.log("BOB FARM DEPOSIT ESTIMATION: ", bobEstimate);

//                     // await signerFactory(alice.sk)
//                     // const aliceDepositParam        = await farmInstance.methods.deposit(secondAmountToDeposit).toTransferParams();
//                     // const aliceEstimate            = await utils.tezos.estimate.transfer(aliceDepositParam);
//                     // console.log("ALICE FARM DEPOSIT ESTIMATION: ", aliceEstimate);


//                     // Operations
//                     await signerFactory(bob.sk)
//                     var depositOperation        = await farmInstance.methods.deposit(firstAmountToDeposit).send();
//                     await depositOperation.confirmation();
                    
//                     await signerFactory(alice.sk)
//                     var depositOperation        = await farmInstance.methods.deposit(secondAmountToDeposit).send();
//                     await depositOperation.confirmation();

//                     // Final values
//                     farmStorage = await farmInstance.storage();
//                     const firstDepositRecordEnd     = await farmStorage.depositorLedger.get(bob.pkh);
//                     const firstDepositBalanceEnd    = firstDepositRecordEnd===undefined ? 0 : firstDepositRecordEnd.balance.toNumber();
//                     const firstLpLedgerEnd          = await lpTokenStorage.ledger.get(bob.pkh);
//                     const firstLpBalanceEnd         = firstLpLedgerEnd.balance.toNumber();
//                     const secondDepositRecordEnd    = await farmStorage.depositorLedger.get(alice.pkh);
//                     const secondDepositBalanceEnd   = secondDepositRecordEnd===undefined ? 0 : secondDepositRecordEnd.balance.toNumber();
//                     const secondLpLedgerEnd         = await lpTokenStorage.ledger.get(alice.pkh);
//                     const secondLpBalanceEnd        = secondLpLedgerEnd.balance.toNumber();

//                     // Assertions
//                     assert.equal(firstDepositBalanceEnd, firstDepositBalance + firstAmountToDeposit);
//                     assert.equal(firstLpBalanceEnd, firstLpBalance - firstAmountToDeposit);
//                     assert.equal(secondDepositBalanceEnd, secondDepositBalance + secondAmountToDeposit);
//                     assert.equal(secondLpBalanceEnd, secondLpBalance - secondAmountToDeposit);
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
//         })

//         describe('%withdraw', function() {
//             it('User should be able to withdraw LP Tokens from a farm', async () => {
//                 try{
//                     // Initial values
//                     lpTokenStorage          = await lpTokenInstance.storage();
//                     farmStorage             = await farmInstance.storage();
//                     const lpLedgerStart     = await lpTokenStorage.ledger.get(bob.pkh);
//                     const lpBalance         = lpLedgerStart.balance.toNumber();
//                     const depositRecord     = await farmStorage.depositorLedger.get(bob.pkh);
//                     const depositBalance    = depositRecord===undefined ? 0 : depositRecord.balance.toNumber();
//                     const amountToWithdraw  = 1;

//                     // const bobWithdrawParam        = await farmInstance.methods.withdraw(amountToWithdraw).toTransferParams();
//                     // const bobEstimate            = await utils.tezos.estimate.transfer(bobWithdrawParam);
//                     // console.log("BOB Withdraw Farm ESTIMATION: ", bobEstimate);

//                     // Operation
//                     const withdrawOperation  = await farmInstance.methods.withdraw(amountToWithdraw).send();
//                     await withdrawOperation.confirmation();

//                     // Final values
//                     lpTokenStorage          = await lpTokenInstance.storage();
//                     farmStorage             = await farmInstance.storage();
//                     const depositRecordEnd  = await farmStorage.depositorLedger.get(bob.pkh);
//                     const depositBalanceEnd = depositRecordEnd===undefined ? 0 : depositRecordEnd.balance.toNumber();
//                     const lpLedgerEnd       = await lpTokenStorage.ledger.get(bob.pkh);
//                     const lpBalanceEnd      = lpLedgerEnd.balance.toNumber();

//                     // Assertions
//                     assert.equal(depositBalanceEnd, depositBalance - amountToWithdraw);
//                     assert.equal(lpBalanceEnd, lpBalance + amountToWithdraw);

//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 } 
//             });

//             it('User should not be able to withdraw LP Tokens from a farm if it never deposited into it', async () => {
//                 try{
//                     // Initial values
//                     await signerFactory(eve.sk);
//                     lpTokenStorage          = await lpTokenInstance.storage();
//                     farmStorage             = await farmInstance.storage();
//                     const amountToWithdraw  = 1;

//                     // Operation
//                     await chai.expect(farmInstance.methods.withdraw(amountToWithdraw).send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 } 
//             });

//             it('User should not be able to withdraw more LP Tokens than it deposited', async () => {
//                 try{
//                     // Initial values
//                     await signerFactory(bob.sk);
//                     lpTokenStorage          = await lpTokenInstance.storage();
//                     farmStorage             = await farmInstance.storage();
                    
//                     const lpLedgerStart     = await lpTokenStorage.ledger.get(bob.pkh);
//                     const lpBalance         = lpLedgerStart.balance.toNumber();

//                     const depositRecord     = await farmStorage.depositorLedger.get(bob.pkh);
//                     const depositBalance    = depositRecord===undefined ? 0 : depositRecord.balance.toNumber();
                    
//                     const excessAmount      = 100;
//                     const amountToWithdraw  = depositBalance + excessAmount;

//                     // Operation
//                     const withdrawOperation  = await farmInstance.methods.withdraw(amountToWithdraw).send();
//                     await withdrawOperation.confirmation();

//                     lpTokenStorage          = await lpTokenInstance.storage();
//                     farmStorage             = await farmInstance.storage();
                    
//                     const depositRecordEnd  = await farmStorage.depositorLedger.get(bob.pkh);
//                     const depositBalanceEnd = depositRecordEnd===undefined ? 0 : depositRecordEnd.balance.toNumber();
                    
//                     const lpLedgerEnd       = await lpTokenStorage.ledger.get(bob.pkh);
//                     const lpBalanceEnd      = lpLedgerEnd.balance.toNumber();

//                     // Assertions
//                     assert.equal(depositBalanceEnd, depositBalance - depositBalance);
//                     assert.equal(lpBalanceEnd, lpBalance + amountToWithdraw - excessAmount);

//                     // reset - deposit some lpToken into farm again for subsequent tests

//                     lpTokenStorage          = await lpTokenInstance.storage();
//                     farmStorage             = await farmInstance.storage();
                    
//                     const lpLedger          = await lpTokenStorage.ledger.get(bob.pkh);
//                     // const resetLpBalance    = lpLedger.balance.toNumber();
//                     const lpAllowances      = await lpLedger.allowances.get(farmAddress.address);
                    
//                     // const resetDepositRecord     = await farmStorage.depositorLedger.get(bob.pkh);
//                     // const resetDepositBalance    = resetDepositRecord===undefined ? 0 : resetDepositRecord.balance.toNumber();
                    
//                     const amountToDeposit   = 10;

//                     // Approval operation
//                     if(lpAllowances === undefined || lpAllowances.toNumber() <= amountToDeposit){
//                         const approvals         = lpAllowances===undefined ? amountToDeposit : Math.abs(lpAllowances.toNumber() - amountToDeposit);
//                         const approveOperation  = await lpTokenInstance.methods.approve(farmAddress.address,approvals).send();
//                         await approveOperation.confirmation();
//                     }

//                     // Operation
//                     const depositOperation          = await farmInstance.methods.deposit(amountToDeposit).send();
//                     await depositOperation.confirmation();

//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 } 
//             });

//             it('Multiple users should be able to withdraw tokens', async () => {
//                 try{
//                     // Initial values
//                     lpTokenStorage                  = await lpTokenInstance.storage();
//                     farmStorage                     = await farmInstance.storage();
                    
//                     const firstLpLedgerStart        = await lpTokenStorage.ledger.get(bob.pkh);
//                     const firstLpBalance            = firstLpLedgerStart.balance.toNumber();
                    
//                     const firstDepositRecord        = await farmStorage.depositorLedger.get(bob.pkh);
//                     const firstDepositBalance       = firstDepositRecord === undefined ? 0 : firstDepositRecord.balance.toNumber();
                    
//                     const firstAmountToWithdraw     = 2;
                    
//                     const secondLpLedgerStart       = await lpTokenStorage.ledger.get(alice.pkh);
//                     const secondLpBalance           = secondLpLedgerStart.balance.toNumber();
                    
//                     const secondDepositRecord       = await farmStorage.depositorLedger.get(alice.pkh);
//                     const secondDepositBalance      = secondDepositRecord===undefined ? 0 : secondDepositRecord.balance.toNumber();
                    
//                     const secondAmountToWithdraw    = 4;

//                     // Operations
//                     await signerFactory(alice.sk)
//                     var withdrawOperation            = await farmInstance.methods.withdraw(secondAmountToWithdraw).send();
//                     await withdrawOperation.confirmation();

//                     await signerFactory(bob.sk)
//                     var withdrawOperation            = await farmInstance.methods.withdraw(firstAmountToWithdraw).send();
//                     await withdrawOperation.confirmation();

//                     // Final values
//                     farmStorage                     = await farmInstance.storage();
//                     lpTokenStorage                  = await lpTokenInstance.storage();
                    
//                     const firstDepositRecordEnd     = await farmStorage.depositorLedger.get(bob.pkh);
//                     const firstDepositBalanceEnd    = firstDepositRecordEnd===undefined ? 0 : firstDepositRecordEnd.balance.toNumber();
                    
//                     const firstLpLedgerEnd          = await lpTokenStorage.ledger.get(bob.pkh);
//                     const firstLpBalanceEnd         = firstLpLedgerEnd.balance.toNumber();
                    
//                     const secondDepositRecordEnd    = await farmStorage.depositorLedger.get(alice.pkh);
//                     const secondDepositBalanceEnd   = secondDepositRecordEnd===undefined ? 0 : secondDepositRecordEnd.balance.toNumber();
                    
//                     const secondLpLedgerEnd         = await lpTokenStorage.ledger.get(alice.pkh);
//                     const secondLpBalanceEnd        = secondLpLedgerEnd.balance.toNumber();

//                     // Assertions
//                     assert.equal(firstDepositBalanceEnd, firstDepositBalance - firstAmountToWithdraw);
//                     assert.equal(firstLpBalanceEnd, firstLpBalance + firstAmountToWithdraw);
//                     assert.equal(secondDepositBalanceEnd, secondDepositBalance - secondAmountToWithdraw);
//                     assert.equal(secondLpBalanceEnd, secondLpBalance + secondAmountToWithdraw);

//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 } 
//             });
//         });



//         describe('%claim', function() {
//             it('User should not be able to claim in a farm if it never deposited into it', async () => {
//                 try{
//                     // Initial values
//                     await signerFactory(eve.sk);
//                     lpTokenStorage          = await lpTokenInstance.storage();
//                     farmStorage             = await farmInstance.storage();

//                     // Operation
//                     await chai.expect(farmInstance.methods.claim(eve.pkh).send()).to.be.rejected;
//                 } catch(e) {
//                     console.dir(e, {depth: 5})
//                 }
//             })

//             it('User should not be able to claim in a farm if it has no rewards to claim', async () => {
//                 try{
//                     // Initial values
//                     await signerFactory(mallory.sk);
//                     lpTokenStorage              = await lpTokenInstance.storage();
//                     farmStorage                 = await farmInstance.storage();
//                     const blockTime             = farmStorage.minBlockTimeSnapshot.toNumber();

//                     // Operations
//                     await wait(4 * blockTime * 1000);
//                     // const firstClaimOperation   = await farmInstance.methods.claim(mallory.pkh).send();
//                     // await firstClaimOperation.confirmation();
//                     await chai.expect(farmInstance.methods.claim(mallory.pkh).send()).to.be.rejected;

//                 } catch(e) {
//                     console.dir(e, {depth: 5})
//                 }
//             })

//             it('User should be able to claim rewards from a farm', async () => {
//                 try{
//                     // Initial values
//                     await signerFactory(bob.sk);
//                     farmStorage                 = await farmInstance.storage();
//                     doormanStorage              = await doormanInstance.storage();
//                     const userSMVKLedger        = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
//                     const userSMVKBalance       = userSMVKLedger === undefined ? 0 : userSMVKLedger.balance.toNumber()
//                     const blockTime             = farmStorage.minBlockTimeSnapshot.toNumber();

//                     // Operations
//                     await wait(10 * blockTime * 1000);
//                     const firstClaimOperation   = await farmInstance.methods.claim(bob.pkh).send();
//                     await firstClaimOperation.confirmation();

//                     // Final values
//                     farmStorage                 = await farmInstance.storage();
//                     doormanStorage              = await doormanInstance.storage();
//                     const userSMVKLedgerEnd     = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
//                     const userSMVKBalanceEnd    = userSMVKLedgerEnd === undefined ? 0 : userSMVKLedgerEnd.balance.toNumber()

//                     // Assertions
//                     assert.notEqual(userSMVKBalanceEnd, userSMVKBalance)
                    
//                 } catch(e) {
//                     console.dir(e, {depth: 5})
//                 }
//             })

//             it('User should be able to withdraw all its LP Tokens then claim the remaining rewards', async () => {
//                 try{
//                     // Initial values
//                     await signerFactory(bob.sk);
//                     farmStorage                 = await farmInstance.storage();
//                     doormanStorage              = await doormanInstance.storage();
//                     lpTokenStorage              = await lpTokenInstance.storage();
                    
//                     const userLpLedgerStart     = await lpTokenStorage.ledger.get(bob.pkh);
//                     const userLpBalance         = userLpLedgerStart.balance.toNumber();
                    
//                     const userSMVKLedger        = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
//                     const userSMVKBalance       = userSMVKLedger === undefined ? 0 : userSMVKLedger.balance.toNumber()

//                     const userDepositRecord     = await farmStorage.depositorLedger.get(bob.pkh);
//                     const userDepositBalance    = userDepositRecord === undefined ? 0 : userDepositRecord.balance.toNumber();

//                     console.log(userDepositRecord);
//                     console.log(`userDepositBalance: ${userDepositBalance}`);
                    
//                     const blockTime             = farmStorage.minBlockTimeSnapshot.toNumber();

//                     // Operations
//                     await wait(10 * blockTime * 1000);
//                     const withdrawOperation     = await farmInstance.methods.withdraw(userDepositBalance).send();
//                     await withdrawOperation.confirmation();

//                     const firstClaimOperation   = await farmInstance.methods.claim(bob.pkh).send();
//                     await firstClaimOperation.confirmation();

//                     // Final values
//                     await signerFactory(bob.sk)
//                     farmStorage                 = await farmInstance.storage();
//                     doormanStorage              = await doormanInstance.storage();
//                     lpTokenStorage              = await lpTokenInstance.storage();

//                     const userDepositRecordEnd     = await farmStorage.depositorLedger.get(bob.pkh);
//                     const userDepositBalanceEnd    = userDepositRecordEnd===undefined ? 0 : userDepositRecordEnd.balance.toNumber();

//                     console.log(userDepositRecordEnd);
//                     console.log(`userDepositBalanceEnd: ${userDepositBalanceEnd}`);
                    
//                     const userLpLedgerEnd       = await lpTokenStorage.ledger.get(bob.pkh);
//                     const userLpBalanceEnd      = userLpLedgerEnd.balance.toNumber();
                    
//                     const userSMVKLedgerEnd     = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
//                     const userSMVKBalanceEnd    = userSMVKLedgerEnd.balance.toNumber()

//                     // Assertions
//                     assert.notEqual(userSMVKBalanceEnd, userSMVKBalance)
//                     assert.notEqual(userLpBalanceEnd, userLpBalance)
                    
//                 } catch(e) {
//                     console.dir(e, {depth: 5})
//                 }
//             })
//         })
        
//         describe("%pauseAll", async () => {
//             beforeEach("Set signer to admin", async () => {
//                 await signerFactory(bob.sk)
//             });

//             it('Admin should be able to call the entrypoint and pause all entrypoints in the contract', async () => {
//                 try{
//                     // Initial Values
//                     farmStorage       = await farmInstance.storage();
//                     for (let [key, value] of Object.entries(farmStorage.breakGlassConfig)){
//                         assert.equal(value, false);
//                     }

//                     // Operation
//                     var pauseOperation = await farmInstance.methods.pauseAll().send();
//                     await pauseOperation.confirmation();

//                     // Final values
//                     farmStorage       = await farmInstance.storage();
//                     for (let [key, value] of Object.entries(farmStorage.breakGlassConfig)){
//                         assert.equal(value, true);
//                     }
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
//             it('Non-admin should not be able to call the entrypoint', async () => {
//                 try{
//                     await signerFactory(alice.sk);
//                     await chai.expect(farmInstance.methods.pauseAll().send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
//         })

//         describe("%unpauseAll", async () => {
//             beforeEach("Set signer to admin", async () => {
//                 await signerFactory(bob.sk)
//             });

//             it('Admin should be able to call the entrypoint and unpause all entrypoints in the contract', async () => {
//                 try{
//                     // Initial Values
//                     farmStorage       = await farmInstance.storage();
//                     for (let [key, value] of Object.entries(farmStorage.breakGlassConfig)){
//                         assert.equal(value, true);
//                     }

//                     // Operation
//                     var pauseOperation = await farmInstance.methods.unpauseAll().send();
//                     await pauseOperation.confirmation();

//                     // Final values
//                     farmStorage       = await farmInstance.storage();
//                     for (let [key, value] of Object.entries(farmStorage.breakGlassConfig)){
//                         assert.equal(value, false);
//                     }
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
//             it('Non-admin should not be able to call the entrypoint', async () => {
//                 try{
//                     await signerFactory(alice.sk);
//                     await chai.expect(farmInstance.methods.unpauseAll().send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
//         })

//         describe("%togglePauseEntrypoint", async () => {
//             beforeEach("Set signer to admin", async () => {
//                 await signerFactory(bob.sk)
//             });

//             it('Admin should be able to call the entrypoint and pause/unpause the deposit entrypoint', async () => {
//                 try{
//                     // Initial Values
//                     farmStorage         = await farmInstance.storage();
//                     const initState     = farmStorage.breakGlassConfig.depositIsPaused;

//                     // Operation
//                     var pauseOperation  = await farmInstance.methods.togglePauseEntrypoint("deposit", true).send();
//                     await pauseOperation.confirmation();

//                     // Mid values
//                     farmStorage         = await farmInstance.storage();
//                     const midState      = farmStorage.breakGlassConfig.depositIsPaused;
//                     const lpLedgerStart = await lpTokenStorage.ledger.get(bob.pkh);
//                     const lpAllowances  = await lpLedgerStart.allowances.get(farmAddress.address);
//                     const testAmount    = 1;

//                     // Test operation
//                     if(lpAllowances===undefined || lpAllowances.toNumber()<=0){
//                         const approvals         = lpAllowances===undefined ? testAmount : Math.abs(lpAllowances.toNumber() - testAmount);
//                         const approveOperation  = await lpTokenInstance.methods.approve(farmAddress.address,approvals).send();
//                         await approveOperation.confirmation();
//                     }
//                     await chai.expect(farmInstance.methods.deposit(testAmount).send()).to.be.rejected;

//                     // Operation
//                     var pauseOperation  = await farmInstance.methods.togglePauseEntrypoint("deposit", false).send();
//                     await pauseOperation.confirmation();

//                     // Final values
//                     farmStorage         = await farmInstance.storage();
//                     const endState      = farmStorage.breakGlassConfig.depositIsPaused;

//                     // Test operation
//                     if(lpAllowances===undefined || lpAllowances.toNumber()<=0){
//                         const approvals         = lpAllowances===undefined ? testAmount : Math.abs(lpAllowances.toNumber() - testAmount);
//                         const approveOperation  = await lpTokenInstance.methods.approve(farmAddress.address,approvals).send();
//                         await approveOperation.confirmation();
//                     }
//                     const testOperation = await farmInstance.methods.deposit(testAmount).send();
//                     await testOperation.confirmation();

//                     // Assertions
//                     assert.equal(initState, false)
//                     assert.equal(midState, true)
//                     assert.equal(endState, false)

//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('Admin should be able to call the entrypoint and pause/unpause the withdraw entrypoint', async () => {
//                 try{
//                     // Initial Values
//                     farmStorage         = await farmInstance.storage();
//                     const initState     = farmStorage.breakGlassConfig.withdrawIsPaused;

//                     // Operation
//                     var pauseOperation  = await farmInstance.methods.togglePauseEntrypoint("withdraw", true).send();
//                     await pauseOperation.confirmation();

//                     // Mid values
//                     farmStorage         = await farmInstance.storage();
//                     const midState      = farmStorage.breakGlassConfig.withdrawIsPaused;
//                     const testAmount    = 1;

//                     // Test operation
//                     await chai.expect(farmInstance.methods.withdraw(testAmount).send()).to.be.rejected;

//                     // Operation
//                     var pauseOperation  = await farmInstance.methods.togglePauseEntrypoint("withdraw", false).send();
//                     await pauseOperation.confirmation();

//                     // Final values
//                     farmStorage         = await farmInstance.storage();
//                     const endState      = farmStorage.breakGlassConfig.withdrawIsPaused;

//                     // Test operation
//                     const testOperation = await farmInstance.methods.withdraw(testAmount).send();
//                     await testOperation.confirmation();

//                     // Assertions
//                     assert.equal(initState, false)
//                     assert.equal(midState, true)
//                     assert.equal(endState, false)

//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('Admin should be able to call the entrypoint and pause/unpause the claim entrypoint', async () => {
//                 try{
//                     // Initial Values
//                     farmStorage         = await farmInstance.storage();
//                     const initState     = farmStorage.breakGlassConfig.claimIsPaused;
//                     const blockTime     = farmStorage.minBlockTimeSnapshot.toNumber();

//                     // Operation
//                     var pauseOperation  = await farmInstance.methods.togglePauseEntrypoint("claim", true).send();
//                     await pauseOperation.confirmation();

//                     // Mid values
//                     farmStorage         = await farmInstance.storage();
//                     const midState      = farmStorage.breakGlassConfig.claimIsPaused;

//                     // Test operation
//                     await wait(4 * blockTime * 1000);
//                     await chai.expect(farmInstance.methods.claim(bob.pkh).send()).to.be.rejected;

//                     // Operation
//                     var pauseOperation  = await farmInstance.methods.togglePauseEntrypoint("claim", false).send();
//                     await pauseOperation.confirmation();

//                     // Final values
//                     farmStorage         = await farmInstance.storage();
//                     const endState      = farmStorage.breakGlassConfig.claimIsPaused;

//                     // Test operation
//                     await wait(4 * blockTime * 1000);
//                     const testOperation = await farmInstance.methods.claim(bob.pkh).send();
//                     await testOperation.confirmation();

//                     // Assertions
//                     assert.equal(initState, false)
//                     assert.equal(midState, true)
//                     assert.equal(endState, false)

//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('Non-admin should not be able to call the entrypoint', async () => {
//                 try{
//                     await signerFactory(alice.sk);
//                     await chai.expect(farmInstance.methods.togglePauseEntrypoint("deposit", true).send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
//         })

//         describe('%updateConfig', function() {

//             it('Admin should be able to force the rewards to come from transfers instead of minting', async () => {
//                 try{
//                     // Initial values
//                     lpTokenStorage          = await lpTokenInstance.storage();
//                     farmStorage             = await farmInstance.storage();
//                     mvkTokenStorage         = await mvkTokenInstance.storage();
                    
//                     const mvkTotalSupply    = mvkTokenStorage.totalSupply.toNumber();
//                     const smvkTotalSupply   = await mvkTokenStorage.ledger.get(doormanAddress.address);
                    
//                     const lpLedgerStart     = await lpTokenStorage.ledger.get(bob.pkh);
//                     const lpAllowances      = await lpLedgerStart.allowances.get(farmAddress.address);

//                     const userDepositRecord     = await farmStorage.depositorLedger.get(bob.pkh);
//                     const userDepositBalance    = userDepositRecord===undefined ? 0 : userDepositRecord.balance.toNumber();
//                     console.log(userDepositRecord);
                    
//                     const toggleTransfer    = farmStorage.config.forceRewardFromTransfer;
//                     const blockTime         = farmStorage.minBlockTimeSnapshot.toNumber();
//                     const amountToDeposit   = 10;

//                     // Approval operation
//                     await signerFactory(bob.sk);
//                     if(lpAllowances === undefined || lpAllowances.toNumber()<=0){
//                         const approvals         = lpAllowances === undefined ? amountToDeposit : Math.abs(lpAllowances.toNumber() - amountToDeposit);
//                         const approveOperation  = await lpTokenInstance.methods.approve(farmAddress.address,approvals).send();
//                         await approveOperation.confirmation();
//                         console.log(`approval amount: ${approvals}`);
//                     }

//                     // Operation - deposit amount so user balance will be greater than zero
//                     await signerFactory(bob.sk);
//                     const depositOperation  = await farmInstance.methods.deposit(amountToDeposit).send();
//                     await depositOperation.confirmation();

//                     // Wait at least one block before claiming rewards
//                     await wait(12 * blockTime * 1000);

//                     farmStorage                    = await farmInstance.storage();
//                     const userDepositRecordMid     = await farmStorage.depositorLedger.get(bob.pkh);
//                     const userDepositBalanceMid    = userDepositRecordMid === undefined ? 0 : userDepositRecordMid.balance.toNumber();
//                     console.log(userDepositRecordMid);

//                     // First claim operation - sMVK rewards should be minted (hence increase in sMVK total supply)
//                     var claimOperation  = await farmInstance.methods.claim(bob.pkh).send();
//                     await claimOperation.confirmation();

//                     await signerFactory(bob.sk);
//                     farmStorage                    = await farmInstance.storage();
//                     const userDepositRecordEnd     = await farmStorage.depositorLedger.get(bob.pkh);
//                     const userDepositBalanceEnd    = userDepositRecordEnd===undefined ? 0 : userDepositRecordEnd.balance.toNumber();
//                     console.log(userDepositRecordEnd);

//                     // Updated values
//                     await signerFactory(bob.sk);
//                     mvkTokenStorage                     = await mvkTokenInstance.storage();
//                     const mvkTotalSupplyFirstUpdate     = mvkTokenStorage.totalSupply.toNumber();
//                     const smvkTotalSupplyFirstUpdate    = (await mvkTokenStorage.ledger.get(doormanAddress.address)).toNumber();
//                     const treasuryFirstUpdate           = (await mvkTokenStorage.ledger.get(treasuryAddress.address)).toNumber();

//                     // Operation - set forceRewardFromTransfer to TRUE
//                     const firstToggleOperation      = await farmInstance.methods.updateConfig(1, "configForceRewardFromTransfer").send();
//                     await firstToggleOperation.confirmation();

//                     // Updated values
//                     await signerFactory(bob.sk);
//                     farmStorage                     = await farmInstance.storage();
//                     const toggleTransferFirstUpdate = farmStorage.config.forceRewardFromTransfer;

//                     // Do another claim - sMVK rewards should be transferred from Farm Treasury
//                     await wait(12 * blockTime * 1000);
//                     claimOperation = await farmInstance.methods.claim(bob.pkh).send();
//                     await claimOperation.confirmation();

//                     // Updated values
//                     await signerFactory(bob.sk);
//                     mvkTokenStorage                     = await mvkTokenInstance.storage();
//                     const mvkTotalSupplySecondUpdate    = mvkTokenStorage.totalSupply.toNumber();
//                     const smvkTotalSupplySecondUpdate   = (await mvkTokenStorage.ledger.get(doormanAddress.address)).toNumber();
//                     const treasurySecondUpdate          = (await mvkTokenStorage.ledger.get(treasuryAddress.address)).toNumber();

//                     // Toggle back to mint  
//                     const secondToggleOperation = await farmInstance.methods.updateConfig(0, "configForceRewardFromTransfer").send();
//                     await secondToggleOperation.confirmation();

//                     // Updated values
//                     await signerFactory(bob.sk);
//                     farmStorage = await farmInstance.storage();
//                     const toggleTransferSecondUpdate = farmStorage.config.forceRewardFromTransfer;

//                     //Do another claim
//                     await wait(12 * blockTime * 1000);
//                     claimOperation = await farmInstance.methods.claim(bob.pkh).send();
//                     await claimOperation.confirmation();

//                     // Updated values
//                     mvkTokenStorage                     = await mvkTokenInstance.storage();
//                     const mvkTotalSupplyThirdUpdate     = mvkTokenStorage.totalSupply.toNumber();
//                     const smvkTotalSupplyThirdUpdate    = (await mvkTokenStorage.ledger.get(doormanAddress.address)).toNumber();
//                     const treasuryThirdUpdate           = (await mvkTokenStorage.ledger.get(treasuryAddress.address)).toNumber();

//                     // Assertions
//                     assert.notEqual(mvkTotalSupply,mvkTotalSupplyFirstUpdate);
//                     assert.equal(mvkTotalSupplySecondUpdate,mvkTotalSupplyFirstUpdate);
//                     assert.notEqual(mvkTotalSupplySecondUpdate,mvkTotalSupplyThirdUpdate);

//                     assert.notEqual(toggleTransferFirstUpdate,toggleTransfer);
//                     assert.equal(toggleTransfer,toggleTransferSecondUpdate);

//                     assert.notEqual(smvkTotalSupply,smvkTotalSupplyFirstUpdate);
//                     assert.notEqual(smvkTotalSupply,smvkTotalSupplySecondUpdate);
//                     assert.notEqual(smvkTotalSupplyFirstUpdate,smvkTotalSupplySecondUpdate);
//                     assert.notEqual(smvkTotalSupplySecondUpdate,smvkTotalSupplyThirdUpdate);

//                     console.log("MVK total supply at beginning: ",mvkTotalSupply)
//                     console.log("MVK total supply after first mint: ",mvkTotalSupplyFirstUpdate)
//                     console.log("MVK total supply after transfer: ",mvkTotalSupplySecondUpdate)
//                     console.log("MVK total supply after second mint: ",mvkTotalSupplyThirdUpdate)
//                     console.log("Transfer forced after first toggling: ",toggleTransferFirstUpdate)
//                     console.log("Transfer forced after second toggling: ",toggleTransferSecondUpdate)
//                     console.log("SMVK total supply after first mint: ", smvkTotalSupplyFirstUpdate)
//                     console.log("SMVK total supply after transfer: ", smvkTotalSupplySecondUpdate)
//                     console.log("SMVK total supply after second mint: ", smvkTotalSupplyThirdUpdate)
//                     console.log("Treasury after first mint: ",treasuryFirstUpdate)
//                     console.log("Treasury after transfer: ",treasurySecondUpdate)
//                     console.log("Treasury after second mint: ",treasuryThirdUpdate)

//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 } 
//             });

//             it('Admin should be able to increase the rewards of a farm', async () => {
//                 try{
//                     // Initial values
//                     await signerFactory(bob.sk);
//                     farmStorage                     = await farmInstance.storage();
//                     const currentTotalRewards       = farmStorage.config.plannedRewards.totalRewards.toNumber();
//                     const currentRewardsPerBlock    = farmStorage.config.plannedRewards.currentRewardPerBlock.toNumber();
//                     const newRewards                = 150;

//                     // Operation
//                     const operation = await farmInstance.methods.updateConfig(newRewards, "configRewardPerBlock").send();
//                     await operation.confirmation()

//                     // Final values
//                     farmStorage                     = await farmInstance.storage();
//                     const updatedTotalRewards       = farmStorage.config.plannedRewards.totalRewards.toNumber();
//                     const updatedRewardsPerBlock    = farmStorage.config.plannedRewards.currentRewardPerBlock.toNumber();

//                     // Assertions
//                     assert.equal(updatedRewardsPerBlock, newRewards);
//                     assert.equal(updatedRewardsPerBlock > currentRewardsPerBlock, true);
//                     assert.notEqual(currentRewardsPerBlock, updatedRewardsPerBlock);
//                     assert.notEqual(currentTotalRewards, updatedTotalRewards);

//                     // Logs
//                     // console.log("Initial :")
//                     // console.log("  Total rewards:", currentTotalRewards)
//                     // console.log("  Rewards per block:", currentRewardsPerBlock)
//                     // console.log("Updated :")
//                     // console.log("  Total rewards:", updatedTotalRewards)
//                     // console.log("  Rewards per block:", updatedRewardsPerBlock)

//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 } 
//             });

//             it('Admin should be able to decrease the rewards of a farm', async () => {
//                 try{
//                     // Initial values
//                     await signerFactory(bob.sk);
//                     farmStorage                     = await farmInstance.storage();
//                     const currentTotalRewards       = farmStorage.config.plannedRewards.totalRewards.toNumber();
//                     const currentRewardsPerBlock    = farmStorage.config.plannedRewards.currentRewardPerBlock.toNumber();
//                     const newRewards                = 120;

//                     // Operation
//                     const operation = await farmInstance.methods.updateConfig(newRewards, "configRewardPerBlock").send();
//                     await operation.confirmation()

//                     // Final values
//                     farmStorage                     = await farmInstance.storage();
//                     const updatedTotalRewards       = farmStorage.config.plannedRewards.totalRewards.toNumber();
//                     const updatedRewardsPerBlock    = farmStorage.config.plannedRewards.currentRewardPerBlock.toNumber();

//                     // Assertions
//                     assert.equal(updatedRewardsPerBlock, newRewards);
//                     assert.equal(updatedRewardsPerBlock > currentRewardsPerBlock, false);
//                     assert.notEqual(currentRewardsPerBlock, updatedRewardsPerBlock);
//                     assert.notEqual(currentTotalRewards, updatedTotalRewards);

//                     // Logs
//                     // console.log("Initial :")
//                     // console.log("  Total rewards:", currentTotalRewards)
//                     // console.log("  Rewards per block:", currentRewardsPerBlock)
//                     // console.log("Updated :")
//                     // console.log("  Total rewards:", updatedTotalRewards)
//                     // console.log("  Rewards per block:", updatedRewardsPerBlock)

//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 } 
//             });

//             it('Non-admin should not be able to force the rewards to come from transfers instead of minting', async () => {
//                 try{
//                     // Toggle to transfer
//                     await signerFactory(alice.sk);
//                     await chai.expect(farmInstance.methods.updateConfig(1, "configForceRewardFromTransfer").send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 } 
//             });
//         });

//         describe('%closeFarm', function() {

//             it('Non-admin should not be able to close a farm', async () => {
//                 try{
//                     // Toggle to transfer
//                     await signerFactory(alice.sk);
//                     await chai.expect(farmInstance.methods.closeFarm().send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 } 
//             });

//             it('Admin should be able to close a farm', async () => {
//                 try{
//                     // Initial values
//                     await signerFactory(bob.sk);
//                     farmStorage             = await farmInstance.storage();
//                     const farmOpen          = farmStorage.open;
                    
//                     // Operation
//                     const closeOperation    = await farmInstance.methods.closeFarm().send();
//                     await closeOperation.confirmation();

//                     // Final values
//                     farmStorage             = await farmInstance.storage();
//                     const farmOpenEnd       = farmStorage.open;

//                     // Assertions
//                     assert.equal(farmOpenEnd, false);
//                     assert.notEqual(farmOpenEnd, farmOpen);

//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 } 
//             });

//             it('User should not be able to deposit in a closed farm', async () => {
//                 try{
//                     // Initial values
//                     await signerFactory(bob.sk);
//                     lpTokenStorage          = await lpTokenInstance.storage();
//                     farmStorage             = await farmInstance.storage();
//                     const farmOpen          = farmStorage.open;
//                     const lpLedgerStart     = await lpTokenStorage.ledger.get(bob.pkh);
//                     const lpAllowances      = await lpLedgerStart.allowances.get(farmAddress.address);
//                     const amountToDeposit   = 1;

//                     // Approval operation
//                     if(lpAllowances===undefined || lpAllowances.toNumber()<=0){
//                         const approvals         = lpAllowances===undefined ? amountToDeposit : Math.abs(lpAllowances.toNumber() - amountToDeposit);
//                         const approveOperation  = await lpTokenInstance.methods.approve(farmAddress.address,approvals).send();
//                         await approveOperation.confirmation();
//                     }
                    
//                     // Operation
//                     await chai.expect(farmInstance.methods.deposit(amountToDeposit).send()).to.be.rejected;

//                     // Assertions
//                     assert.equal(farmOpen, false);

//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 } 
//             });

//             it('User should be able to claim in a closed farm', async () => {
//                 try{
//                     // Initial values
//                     await signerFactory(eve.sk);
//                     farmStorage                 = await farmInstance.storage();
//                     doormanStorage              = await doormanInstance.storage();
//                     const userSMVKLedger        = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
//                     const blockTime             = farmStorage.minBlockTimeSnapshot.toNumber();
//                     const userSMVKBalance       = userSMVKLedger === undefined ? 0 : userSMVKLedger.balance.toNumber()
//                     const farmOpen              = farmStorage.open;
                    
//                     // Operation
//                     await wait(4 * blockTime * 1000);
//                     const claimOperation        = await farmInstance.methods.claim(bob.pkh).send();
//                     await claimOperation.confirmation();

//                     // Final values
//                     doormanStorage              = await doormanInstance.storage();
//                     const userSMVKLedgerEnd     = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
//                     const userSMVKBalanceEnd    = userSMVKLedgerEnd.balance.toNumber()

//                     // Assertions
//                     assert.equal(farmOpen, false);
//                     assert.notEqual(userSMVKBalanceEnd, userSMVKBalance)

//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 } 
//             });

//             it('User should not see any increase in rewards even if it still has LP Token deposited in the farm', async () => {
//                 try{
//                     // Initial values
//                     await signerFactory(alice.sk);
//                     farmStorage                 = await farmInstance.storage();
//                     lpTokenStorage              = await lpTokenInstance.storage();
                    
//                     const lpLedgerStart         = await lpTokenStorage.ledger.get(alice.pkh);
//                     const lpBalance             = lpLedgerStart.balance.toNumber();
//                     const blockTime             = farmStorage.minBlockTimeSnapshot.toNumber();

//                     const farmOpen                  = farmStorage.open;
//                     const initialAccRewardsPerShare = farmStorage.accumulatedRewardsPerShare;
                    
//                     // Operation - let alice claim her eligible rewards 
//                     await wait(4 * blockTime * 1000);
//                     const claimOperation = await farmInstance.methods.claim(alice.pkh).send();
//                     await claimOperation.confirmation();

//                     // Update storage
//                     doormanStorage                = await doormanInstance.storage();
//                     farmStorage                   = await farmInstance.storage();

//                     var updatedAccRewardsPerShare = farmStorage.accumulatedRewardsPerShare; 

//                     const userSMVKLedger          = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
//                     const userSMVKBalance         = userSMVKLedger === undefined ? 0 : userSMVKLedger.balance.toNumber();

//                     var userDepositRecord     = await farmStorage.depositorLedger.get(alice.pkh);

//                     // Assertions - there should be no increase in accumulated rewards per share for the farm
//                     assert.equal(farmOpen, false);
//                     assert.equal(initialAccRewardsPerShare.toNumber(), updatedAccRewardsPerShare.toNumber());

//                     // Second operation to check no change in sMVK balance
//                     await wait(4 * blockTime * 1000);
//                     const secondClaimOperation = await farmInstance.methods.claim(alice.pkh).send();
//                     await secondClaimOperation.confirmation();

//                     // Update storage
//                     doormanStorage                = await doormanInstance.storage();
//                     farmStorage                   = await farmInstance.storage();

//                     const userDepositRecordEnd    = await farmStorage.depositorLedger.get(alice.pkh);

//                     const userSMVKLedgerEnd       = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
//                     const userSMVKBalanceEnd      = userSMVKLedgerEnd === undefined ? 0 : userSMVKLedgerEnd.balance.toNumber()

//                     // Assertions - user should have no change in unclaimed rewards, claimed rewards and participation rewards per share
//                     assert.equal(farmOpen, false);
//                     assert.equal(userSMVKBalanceEnd, userSMVKBalance);
                    
//                     assert.equal(userDepositRecordEnd.unclaimedRewards.toNumber(), userDepositRecord.unclaimedRewards.toNumber());
//                     assert.equal(userDepositRecordEnd.claimedRewards.toNumber(), userDepositRecord.claimedRewards.toNumber());
//                     assert.equal(userDepositRecordEnd.participationRewardsPerShare.toNumber(), userDepositRecord.participationRewardsPerShare.toNumber());

//                     assert.notEqual(lpBalance, 0);

//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 } 
//             });

//             it('User should be able to withdraw in a closed farm', async () => {
//                 try{
//                     // Initial values
//                     await signerFactory(alice.sk);
//                     farmStorage                 = await farmInstance.storage();
//                     lpTokenStorage              = await lpTokenInstance.storage();
//                     const lpLedgerStart         = await lpTokenStorage.ledger.get(alice.pkh);
//                     const lpBalance             = lpLedgerStart.balance.toNumber();
//                     const amountToWithdraw      = 1;
//                     const farmOpen              = farmStorage.open;
                    
//                     // Operation
//                     const withdrawOperation     = await farmInstance.methods.withdraw(amountToWithdraw).send();
//                     await withdrawOperation.confirmation();

//                     // Final values
//                     lpTokenStorage              = await lpTokenInstance.storage();
//                     const lpLedgerStartEnd      = await lpTokenStorage.ledger.get(alice.pkh);
//                     const lpBalanceEnd          = lpLedgerStartEnd.balance.toNumber();

//                     // Assertions
//                     assert.equal(farmOpen, false);
//                     assert.notEqual(lpBalanceEnd, lpBalance)

//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 } 
//             });
//         })
//     })

// });
