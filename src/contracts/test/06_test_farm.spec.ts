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
// import { alice, bob, eve } from "../scripts/sandbox/accounts";

// import farmAddress from '../deployments/farmAddress.json';
// import lpAddress from '../deployments/lpTokenAddress.json';
// import mvkAddress from '../deployments/mvkTokenAddress.json';

// describe("Farm", async () => {
//     var utils: Utils;

//     let farmInstance;
//     let farmStorage;

//     let mvkTokenInstance;
//     let mvkTokenStorage;

//     let lpTokenInstance;
//     let lpTokenStorage;

//     let farmBlockStart;
//     let farmBlockEnd;

//     // Tolerance and accuracy for mathematical rewards calculation
//     const FIXED_POINT_ACCURACY= 100000000000;
//     const TOLERANCE = 0.05

//     const signerFactory = async (pk) => {
//         await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
//         return utils.tezos;
//     };

//     const claimCalculation = async(pkh) => {
//         // Get variables before claiming
//         const delegatorMVKBalanceStart = parseInt(await mvkTokenStorage.ledger.get(pkh));
//         const delegatorDelegatorRecordStart = await farmStorage.delegators.get(pkh);
//         const delegatorLPDelegatedStart = parseInt(delegatorDelegatorRecordStart===undefined ? 0 : delegatorDelegatorRecordStart.balance);
//         const delegatorParticipationStart = parseInt(delegatorDelegatorRecordStart===undefined ? 0 : delegatorDelegatorRecordStart.participationMVKPerShare);
//         const farmLastBlockStart = parseInt(farmStorage.lastBlockUpdate);
//         const farmAccumulatedMVKStart = parseInt(farmStorage.accumulatedMVKPerShare);
//         const farmUnpaidRewardsStart = parseInt(farmStorage.claimedRewards.unpaid);
//         const farmPaidRewardsStart = parseInt(farmStorage.claimedRewards.paid);
//         const farmLPBalanceStart = parseInt(farmStorage.lpToken.tokenBalance);

//         // Create a transaction for claiming Delegator's rewards
//         const claimOperation = await farmInstance.methods.claim().send();
//         await claimOperation.confirmation();

//         // Get variables after claiming
//         farmStorage = await farmInstance.storage();
//         const delegatorMVKBalanceEnd = parseInt(await mvkTokenStorage.ledger.get(pkh));
//         const delegatorDelegatorRecordEnd = await farmStorage.delegators.get(pkh);
//         const delegatorLPDelegatedEnd = parseInt(delegatorDelegatorRecordEnd===undefined ? 0 : delegatorDelegatorRecordEnd.balance);
//         const delegatorParticipationEnd = parseInt(delegatorDelegatorRecordEnd===undefined ? 0 : delegatorDelegatorRecordEnd.participationMVKPerShare);
//         const farmLastBlockEnd = parseInt(farmStorage.lastBlockUpdate);
//         const farmAccumulatedMVKEnd = parseInt(farmStorage.accumulatedMVKPerShare);
//         const farmUnpaidRewardsEnd = parseInt(farmStorage.claimedRewards.unpaid);
//         const farmPaidRewardsEnd = parseInt(farmStorage.claimedRewards.paid);
//         const farmLPBalanceEnd = parseInt(farmStorage.lpToken.tokenBalance);
//         const farmOpen = farmStorage.open;

//         // Compute parameter for reward calculation
//         const multiplier = Math.abs(farmLastBlockEnd - farmLastBlockStart);
//         const suspectedReward = multiplier * parseInt(farmStorage.plannedRewards.rewardPerBlock);
//         const totalClaimedReward = farmPaidRewardsStart + farmUnpaidRewardsStart;
//         const totalFarmReward = suspectedReward + totalClaimedReward;
//         const totalPlannedReward = parseInt(farmStorage.plannedRewards.rewardPerBlock) * parseInt(farmStorage.plannedRewards.totalBlocks);
//         var reward = 0;

//         // Change behavior if farm is open or not (I now it's not very good in tests)
//         if(farmBlockEnd <= farmLastBlockEnd && totalFarmReward > totalPlannedReward){
//             // Assert that farm is close
//             assert.equal(farmOpen, false, "Farm should be closed because the farm duration was exceeded")

//             // Calculate reward
//             reward = Math.abs(totalPlannedReward - totalClaimedReward);
//         } else{
//             // Assert that farm is open
//             assert.equal(farmOpen, true, "Farm should be opened because the farm duration was not exceeded")

//             // Calculate reward
//             reward = suspectedReward;
//         }

//         const unpaidRewardBeforeClaim = reward + farmUnpaidRewardsStart;

//         // Assert accumulatedMVKPerShare 
//         const rewardWithFixedPoint = reward * FIXED_POINT_ACCURACY;
//         const accumulatedMVKFarm = farmAccumulatedMVKStart + Math.trunc(rewardWithFixedPoint / farmLPBalanceStart);
//         // Use of chai for the tolerance because the claim operation could happen 
//         chai.expect(accumulatedMVKFarm).to.be.closeTo(farmAccumulatedMVKEnd,TOLERANCE*farmAccumulatedMVKEnd)
//         chai.expect(accumulatedMVKFarm).to.be.closeTo(delegatorParticipationEnd,TOLERANCE*delegatorParticipationEnd)

//         const currentMVKPerShare =  Math.abs(accumulatedMVKFarm - delegatorParticipationStart);
//         const delegatorShare = currentMVKPerShare * delegatorLPDelegatedStart;
//         const delegatorRewards = Math.trunc(delegatorShare / FIXED_POINT_ACCURACY);

//         // Assert unpaid and paid rewards
//         const farmUnpaidRewards =  Math.abs(unpaidRewardBeforeClaim - delegatorRewards);
//         const farmPaidRewards =  Math.abs(farmPaidRewardsStart - delegatorRewards);
//         assert.equal(farmUnpaidRewardsEnd, farmUnpaidRewards, "Farm unpaid rewards after a claim should be equal to : "+farmUnpaidRewardsEnd)
//         chai.expect(farmPaidRewards).to.be.closeTo(farmPaidRewardsEnd,TOLERANCE*farmPaidRewardsEnd)

//         // Assert delegator earned rewards
//         const calculatedLPBalance = delegatorMVKBalanceStart + delegatorRewards;
//         assert.equal(delegatorMVKBalanceEnd, calculatedLPBalance, "Delegator rewards balance should be equal to: "+delegatorMVKBalanceEnd);
//         assert.equal(delegatorLPDelegatedStart, delegatorLPDelegatedEnd, "Delegator LP balance should have remain the same");
//         assert.equal(farmLPBalanceStart, farmLPBalanceEnd, "Farm LP balance should have remain the same");
//     }

//     before("setup", async () => {
//         utils = new Utils();
//         await utils.init(alice.sk);
        
//         farmInstance   = await utils.tezos.contract.at(farmAddress.address);
//         farmStorage    = await farmInstance.storage();
//         mvkTokenInstance = await utils.tezos.contract.at(mvkAddress.address);
//         mvkTokenStorage    = await mvkTokenInstance.storage();
//         lpTokenInstance = await utils.tezos.contract.at(lpAddress.address);
//         lpTokenStorage    = await lpTokenInstance.storage();

//         // Bob (reserve contract) gives operator permission to the farm contract
//         await signerFactory(eve.sk);
//         const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//             {
//                 add_operator: {
//                     owner: eve.pkh,
//                     operator: farmAddress.address,
//                     token_id: 0
//                 }
//             }
//         ]).send()
//         await updateOperatorsOperation.confirmation();
//     });

//     beforeEach("storage", async () => {
//         farmStorage = await farmInstance.storage();
//         mvkTokenStorage = await mvkTokenInstance.storage();
//         lpTokenStorage = await lpTokenInstance.storage();

//         await signerFactory(alice.sk)
//     })

//     describe('%initFarm', function() {
//         it('Initialize a farm with 100 rewards per block that will last for 12 000 blocks', async () => {
//             try{
//                 // Create a transaction for initiating a farm 
//                 const operation = await farmInstance.methods.initFarm(100,12000).send();
//                 await operation.confirmation()

//                 // Refresh farm storage
//                 farmStorage    = await farmInstance.storage();

//                 // Check that the farm has the correct values
//                 const farmOpenEnd = farmStorage.open;
//                 const farmTotalBlocksEnd = farmStorage.plannedRewards.totalBlocks;
//                 const farmRewardPerBlockEnd = farmStorage.plannedRewards.rewardPerBlock;

//                 assert.equal(farmOpenEnd, true, "The farm should be closed when originated");
//                 assert.equal(farmTotalBlocksEnd, 12000, "The farm should have totalBlocks set on initFarm");
//                 assert.equal(farmRewardPerBlockEnd, 100, "The farm should have a rewardPerBlock set on initFarm");

//                 // Keep the block where the farm was initiated in a variable for future use
//                 farmStorage    = await farmInstance.storage();
//                 farmBlockStart = parseInt(farmStorage.lastBlockUpdate);
//                 farmBlockEnd   = farmBlockStart + 12000;
//             }catch(e){
//                 console.log(e)
//             }
//         })
//     });

//     describe('Single user scenario', function() {
//         describe('%deposit', function() {
//             it('Alice deposits 2LP Tokens', async () => {
//                 try{
//                     // Amount of LP to deposit
//                     const amountToDeposit = 2;
                    
//                     // Create a transaction for allowing farm to spend LP Token in the name of Alice
//                     const aliceLedgerStart = await lpTokenStorage.ledger.get(alice.pkh);
//                     const aliceApprovalsStart = await aliceLedgerStart.allowances.get(farmAddress.address);
//                     // Check Alice has no pending approvals for the farm
//                     if(aliceApprovalsStart===undefined || aliceApprovalsStart<amountToDeposit){
//                         const allowances = aliceApprovalsStart - amountToDeposit;
//                         const approveOperation = await lpTokenInstance.methods.approve(farmAddress.address,allowances).send();
//                         await approveOperation.confirmation();
//                     }
    
//                     // Get Alice LP delegated amount before deposing
//                     const aliceDelegatorRecordStart = await farmStorage.delegators.get(alice.pkh);
//                     const aliceLPDelegatedStart = parseInt(aliceDelegatorRecordStart===undefined ? 0 : aliceDelegatorRecordStart.balance);
                    
//                     // Create a transaction for depositing LP to a farm
//                     const depositOperation = await farmInstance.methods.deposit(amountToDeposit).send();
//                     await depositOperation.confirmation();
    
//                     // Refresh Farm storage
//                     farmStorage = await farmInstance.storage();
    
//                     // Check that LP have been deposited
//                     const aliceDelegatorRecordEnd = await farmStorage.delegators.get(alice.pkh);
//                     const aliceLPDelegatedEnd = parseInt(aliceDelegatorRecordEnd===undefined ? 0 : aliceDelegatorRecordEnd.balance);
//                     assert.equal(aliceLPDelegatedEnd, aliceLPDelegatedStart + amountToDeposit, "Alice should have "+(aliceLPDelegatedStart + amountToDeposit)+" LP Tokens deposited in the farm");
//                 } catch(e){
//                     console.log(e);
//                 } 
//             });

//             it('Alice deposits more LP than she has', async () => {
//                 try{
                    
//                     // Create a transaction for allowing farm to spend LP Token in the name of Alice
//                     const aliceLedgerStart = await lpTokenStorage.ledger.get(alice.pkh);
//                     const aliceApprovalsStart = await aliceLedgerStart.allowances.get(farmAddress.address);

//                     // Amount of LP to deposit
//                     const amountToDeposit = parseInt(aliceLedgerStart.balance) + 1;

//                     // Check Alice has no pending approvals for the farm
//                     if(aliceApprovalsStart===undefined || aliceApprovalsStart<amountToDeposit){
//                         const allowances = aliceApprovalsStart - amountToDeposit;
//                         const approveOperation = await lpTokenInstance.methods.approve(farmAddress.address,allowances).send();
//                         await approveOperation.confirmation();
//                     }
    
//                     // Check that LP FA12 has been approved
//                     lpTokenStorage = await lpTokenInstance.storage();
//                     const aliceLedgerEnd = await lpTokenStorage.ledger.get(alice.pkh);
//                     assert.notStrictEqual(aliceLedgerEnd, undefined, "Alice should have an account in the LP Token contract");
                    
//                     const aliceApprovalsEnd = parseInt(await aliceLedgerEnd.allowances.get(farmAddress.address));
//                     assert.notStrictEqual(aliceApprovalsEnd, undefined, "Alice should have the farm address in her approvals");
//                     assert.equal(aliceApprovalsEnd, amountToDeposit, "Alice should have approved "+amountToDeposit+" LP Token to spend to the farm");
                    
//                     // Create a transaction for depositing LP to a farm
//                     const depositOperation = await farmInstance.methods.deposit(amountToDeposit).send();
//                     await depositOperation.confirmation();
//                 } catch(e){
//                     assert.strictEqual(e.message, "NotEnoughBalance", "Alice should not be able to spend more LP than she has");
//                 } 
//             })
//         })
    
//         describe('%withdraw', function() {
//             it('Alice withdraws 1LP Token', async () => {
//                 try{
//                     // Amount of LP to withdraw
//                     const amountToWithdraw = 1;
    
//                     // Get Alice LP delegated amount before withdrawing
//                     const aliceDelegatorRecordStart = await farmStorage.delegators.get(alice.pkh);
//                     const aliceLPDelegatedStart = parseInt(aliceDelegatorRecordStart===undefined ? 0 : aliceDelegatorRecordStart.balance);
                    
//                     // Create a transaction for depositing LP to a farm
//                     const withdrawOperation = await farmInstance.methods.withdraw(amountToWithdraw).send();
//                     await withdrawOperation.confirmation();
    
//                     // Refresh Farm storage
//                     farmStorage = await farmInstance.storage();
    
//                     // Check that LP have been deposited
//                     const aliceDelegatorRecordEnd = await farmStorage.delegators.get(alice.pkh);
//                     const aliceLPDelegatedEnd = parseInt(aliceDelegatorRecordEnd===undefined ? 0 : aliceDelegatorRecordEnd.balance);
//                     assert.equal(aliceLPDelegatedEnd, aliceLPDelegatedStart - amountToWithdraw, "Alice should have "+(aliceLPDelegatedStart - amountToWithdraw)+" LP Tokens withdrawed from the farm");
//                 } catch(e){
//                     console.log(e);
//                 } 
//             });
//         });
    
//         describe('%claim', function() {
//             it('Alice claims her rewards', async () => {
//                 try{
//                     await claimCalculation(alice.pkh);
//                 } catch(e){
//                     console.log(e);
//                 } 
//             });
//         });
//     })

//     // describe('Multiple users scenario', function() {
//     //     describe('%deposit', function() {
//     //         it('Alice deposits 3LP Tokens then Bob deposits 8LP', async () => {
//     //             try{
//     //                 // Amount of LP to deposit
//     //                 var amountToDeposit = 3;
                    
//     //                 // Create a transaction for allowing farm to spend LP Token in the name of Alice
//     //                 const aliceLedgerStart = await lpTokenStorage.ledger.get(alice.pkh);
//     //                 const aliceApprovalsStart = await aliceLedgerStart.allowances.get(farmAddress.address);
//     //                 // Check Alice has no pending approvals for the farm
//     //                 if(aliceApprovalsStart===undefined || aliceApprovalsStart<amountToDeposit){
//     //                     const allowances = aliceApprovalsStart - amountToDeposit;
//     //                     const approveOperation = await lpTokenInstance.methods.approve(farmAddress.address,allowances).send();
//     //                     await approveOperation.confirmation();
//     //                 }
    
//     //                 // Get Alice LP delegated amount before deposing
//     //                 const aliceDelegatorRecordStart = await farmStorage.delegators.get(alice.pkh);
//     //                 const aliceLPDelegatedStart = parseInt(aliceDelegatorRecordStart===undefined ? 0 : aliceDelegatorRecordStart.balance);
                    
//     //                 // Create a transaction for depositing LP to a farm
//     //                 const depositOperation = await farmInstance.methods.deposit(amountToDeposit).send();
//     //                 await depositOperation.confirmation();
    
//     //                 // Refresh Farm storage
//     //                 farmStorage = await farmInstance.storage();
    
//     //                 // Check that LP have been deposited
//     //                 const aliceDelegatorRecordEnd = await farmStorage.delegators.get(alice.pkh);
//     //                 const aliceLPDelegatedEnd = parseInt(aliceDelegatorRecordEnd===undefined ? 0 : aliceDelegatorRecordEnd.balance);
//     //                 assert.equal(aliceLPDelegatedEnd, aliceLPDelegatedStart + amountToDeposit, "Alice should have "+(aliceLPDelegatedStart + amountToDeposit)+" LP Tokens deposited in the farm");

//     //                 // Switch signer to Bob
//     //                 await signerFactory(bob.sk);

//     //                 // Amount of LP to deposit
//     //                 var amountToDeposit = 8;
                    
//     //                 // Create a transaction for allowing farm to spend LP Token in the name of Alice
//     //                 const bobLedgerStart = await lpTokenStorage.ledger.get(bob.pkh);
//     //                 const bobApprovalsStart = await bobLedgerStart.allowances.get(farmAddress.address);
//     //                 // Check Alice has no pending approvals for the farm
//     //                 if(bobApprovalsStart===undefined || bobApprovalsStart<amountToDeposit){
//     //                     const allowances = bobApprovalsStart - amountToDeposit;
//     //                     const approveOperation = await lpTokenInstance.methods.approve(farmAddress.address,allowances).send();
//     //                     await approveOperation.confirmation();
//     //                 }
    
//     //                 // Get Alice LP delegated amount before deposing
//     //                 const bobDelegatorRecordStart = await farmStorage.delegators.get(bob.pkh);
//     //                 const bobLPDelegatedStart = parseInt(bobDelegatorRecordStart===undefined ? 0 : bobDelegatorRecordStart.balance);
                    
//     //                 // Create a transaction for depositing LP to a farm
//     //                 const bobDepositOperation = await farmInstance.methods.deposit(amountToDeposit).send();
//     //                 await bobDepositOperation.confirmation();
    
//     //                 // Refresh Farm storage
//     //                 farmStorage = await farmInstance.storage();
    
//     //                 // Check that LP have been deposited
//     //                 const bobDelegatorRecordEnd = await farmStorage.delegators.get(bob.pkh);
//     //                 const bobLPDelegatedEnd = parseInt(bobDelegatorRecordEnd===undefined ? 0 : bobDelegatorRecordEnd.balance);
//     //                 assert.equal(bobLPDelegatedEnd, bobLPDelegatedStart + amountToDeposit, "Bob should have "+(bobLPDelegatedStart + amountToDeposit)+" LP Tokens deposited in the farm");
//     //             } catch(e){
//     //                 console.log(e);
//     //             }
//     //         });
//     //     })
    
//     //     describe('%withdraw', function() {
//     //         it('Alice withdraws 2LP Token and Bob withdraws 1LP Token', async () => {
//     //             try{
//     //                 // Amount of LP to withdraw
//     //                 var amountToWithdraw = 2;
    
//     //                 // Get Alice LP delegated amount before withdrawing
//     //                 const aliceDelegatorRecordStart = await farmStorage.delegators.get(alice.pkh);
//     //                 const aliceLPDelegatedStart = parseInt(aliceDelegatorRecordStart===undefined ? 0 : aliceDelegatorRecordStart.balance);
                    
//     //                 // Create a transaction for depositing LP to a farm
//     //                 const withdrawOperation = await farmInstance.methods.withdraw(amountToWithdraw).send();
//     //                 await withdrawOperation.confirmation();
    
//     //                 // Refresh Farm storage
//     //                 farmStorage = await farmInstance.storage();
    
//     //                 // Check that LP have been deposited
//     //                 const aliceDelegatorRecordEnd = await farmStorage.delegators.get(alice.pkh);
//     //                 const aliceLPDelegatedEnd = parseInt(aliceDelegatorRecordEnd===undefined ? 0 : aliceDelegatorRecordEnd.balance);
//     //                 assert.equal(aliceLPDelegatedEnd, aliceLPDelegatedStart - amountToWithdraw, "Alice should have "+(aliceLPDelegatedStart - amountToWithdraw)+" LP Tokens withdrawed from the farm");

//     //                 // Switch signer to Bob
//     //                 await signerFactory(bob.sk);

//     //                 // Amount of LP to withdraw
//     //                 amountToWithdraw = 1;
    
//     //                 // Get Alice LP delegated amount before withdrawing
//     //                 const bobDelegatorRecordStart = await farmStorage.delegators.get(bob.pkh);
//     //                 const bobLPDelegatedStart = parseInt(bobDelegatorRecordStart===undefined ? 0 : bobDelegatorRecordStart.balance);
                    
//     //                 // Create a transaction for depositing LP to a farm
//     //                 const bobWithdrawOperation = await farmInstance.methods.withdraw(amountToWithdraw).send();
//     //                 await bobWithdrawOperation.confirmation();
    
//     //                 // Refresh Farm storage
//     //                 farmStorage = await farmInstance.storage();
    
//     //                 // Check that LP have been deposited
//     //                 const bobDelegatorRecordEnd = await farmStorage.delegators.get(bob.pkh);
//     //                 const bobLPDelegatedEnd = parseInt(bobDelegatorRecordEnd===undefined ? 0 : bobDelegatorRecordEnd.balance);
//     //                 assert.equal(bobLPDelegatedEnd, bobLPDelegatedStart - amountToWithdraw, "Bob should have "+(bobLPDelegatedStart - amountToWithdraw)+" LP Tokens withdrawed from the farm");
//     //             } catch(e){
//     //                 console.log(e);
//     //             } 
//     //         });
//     //     });
    
//     //     describe('%claim', function() {
//     //         it('Alice and Bob claim their rewards', async () => {
//     //             try{
//     //                 await claimCalculation(alice.pkh);
//     //                 await claimCalculation(bob.pkh);
//     //             } catch(e){
//     //                 console.log(e);
//     //             } 
//     //         });
//     //     });
//     // })
// });