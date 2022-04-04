// const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
// const { InMemorySigner, importKey } = require("@taquito/signer");
// import assert, { ok, rejects, strictEqual } from "assert";
// import { Utils, zeroAddress, MVK } from "./helpers/Utils";
// import fs from "fs";
// import { confirmOperation } from "../scripts/confirmation";

// const chai = require("chai");
// const chaiAsPromised = require('chai-as-promised');
// chai.use(chaiAsPromised);   
// chai.should();

// import env from "../env";
// import { bob, alice, eve, mallory, oscar, trudy, isaac, david } from "../scripts/sandbox/accounts";

// import treasuryAddress from '../deployments/treasuryAddress.json';
// import mvkTokenAddress from '../deployments/mvkTokenAddress.json';
// import governanceAddress from '../deployments/governanceAddress.json';
// import mockFa12TokenAddress  from '../deployments/mockFa12TokenAddress.json';
// import mockFa2TokenAddress   from '../deployments/mockFa2TokenAddress.json';

// describe("Treasury tests", async () => {
//     var utils: Utils;

//     let treasuryInstance;    
//     let mvkTokenInstance;
//     let governanceInstance;
//     let mockFa12TokenInstance;
//     let mockFa2TokenInstance;

//     let treasuryStorage;
//     let mvkTokenStorage;
//     let governanceStorage;
//     let mockFa12TokenStorage;
//     let mockFa2TokenStorage;
    
//     const signerFactory = async (pk) => {
//         await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
//         return utils.tezos;
//     };

//     before("setup", async () => {

//         utils = new Utils();
//         await utils.init(bob.sk);
        
//         console.log(treasuryAddress);
//         console.log(treasuryAddress.address);

//         treasuryInstance       = await utils.tezos.contract.at(treasuryAddress.address);
//         mvkTokenInstance       = await utils.tezos.contract.at(mvkTokenAddress.address);
//         governanceInstance     = await utils.tezos.contract.at(governanceAddress.address);
//         mockFa12TokenInstance  = await utils.tezos.contract.at(mockFa12TokenAddress.address);
//         mockFa2TokenInstance   = await utils.tezos.contract.at(mockFa2TokenAddress.address);
            
//         treasuryStorage        = await treasuryInstance.storage();
//         mvkTokenStorage        = await mvkTokenInstance.storage();
//         governanceStorage      = await governanceInstance.storage();
//         mockFa12TokenStorage   = await mockFa12TokenInstance.storage();
//         mockFa2TokenStorage    = await mockFa2TokenInstance.storage();

//         console.log('-- -- -- -- -- Treasury Tests -- -- -- --')
//         console.log('Treasury Contract deployed at:', treasuryInstance.address);
//         console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
//         console.log('Governance Contract deployed at:', governanceInstance.address);
//         console.log('Mock Fa12 Token Contract deployed at:', mockFa12TokenInstance.address);
//         console.log('Mock Fa2 Token Contract deployed at:' , mockFa2TokenInstance.address);
//         console.log('Bob address: ' + bob.pkh);
//         console.log('Alice address: ' + alice.pkh);
//         console.log('Eve address: ' + eve.pkh);

//     });


//     describe('test: Treasury Housekeeping tests', function() {
        
//         it('test: non-admin user (alice) cannot set treasury admin', async () => {
//             try{        

//                 await signerFactory(alice.sk);
//                 const failSetAdminOperation = await treasuryInstance.methods.setAdmin(eve.pkh);
//                 await chai.expect(failSetAdminOperation.send()).to.be.eventually.rejected;

//             } catch(e){
//                 console.log(e);
//             } 

//         });    

//         it('test: admin user (bob) can set treasury admin', async () => {
//             try{        

//                 await signerFactory(bob.sk);
//                 const setAdminOperation = await treasuryInstance.methods.setAdmin(eve.pkh).send();
//                 await setAdminOperation.confirmation();

//                 const updatedTreasuryStorage   = await treasuryInstance.storage();            
//                 assert.equal(updatedTreasuryStorage.admin, eve.pkh);

//                 // reset treasury admin to bob
//                 await signerFactory(eve.sk);
//                 const resetAdminOperation = await treasuryInstance.methods.setAdmin(bob.pkh).send();
//                 await resetAdminOperation.confirmation();

//                 const resetTreasuryStorage   = await treasuryInstance.storage();            
//                 assert.equal(resetTreasuryStorage.admin, bob.pkh);

//             } catch(e){
//                 console.log(e);
//             } 

//         });    

//     }); // end test: Treasury Housekeeping tests

//     describe('test: Treasury deposit tests', function() {

//         it('test: any user (alice) can deposit tez into treasury', async () => {
//             try{        
                
//                 // Alice transfers 80 XTZ to Treasury
//                 const depositAmount = 80;
//                 const depositAmountMutez = 80000000;
                
//                 await signerFactory(alice.sk)
//                 const aliceTransferTezToTreasuryOperation = await utils.tezos.contract.transfer({ to: treasuryAddress.address, amount: depositAmount});
//                 await aliceTransferTezToTreasuryOperation.confirmation();

//                 const treasuryTezBalance         = await utils.tezos.tz.getBalance(treasuryAddress.address);
//                 assert.equal(treasuryTezBalance, depositAmountMutez);

//             } catch(e){
//                 console.log(e);
//             } 
//         });

//         it('test: any user (alice) can deposit mock FA12 Tokens into treasury', async () => {
//             try{        
                
//                 // Alice transfers 80 Mock FA12 Tokens to Treasury
//                 const depositAmount = 80000000;
        
//                 await signerFactory(alice.sk)
//                 const aliceTransferMockFa12ToTreasuryOperation = await mockFa12TokenInstance.methods.transfer(
//                     alice.pkh, 
//                     treasuryAddress.address, 
//                     depositAmount
//                     ).send();
//                 await aliceTransferMockFa12ToTreasuryOperation.confirmation();

//                 const updatedMockFa12TokenStorage       = await mockFa12TokenInstance.storage();
//                 const treasuryMockFa12TokenBalance      = await updatedMockFa12TokenStorage.ledger.get(treasuryAddress.address);

//                 assert.equal(treasuryMockFa12TokenBalance.balance, depositAmount);

//             } catch(e){
//                 console.log(e);
//             } 
//         });

//         it('test: any user (alice) can deposit mock FA2 Tokens into treasury', async () => {
//             try{        
                
//                 // Alice transfers 80 Mock FA2 Tokens to Treasury
//                 const depositAmount = 80000000;
        
//                 await signerFactory(alice.sk)
//                 const aliceTransferMockFa2ToTreasuryOperation = await mockFa2TokenInstance.methods.transfer([
//                         {
//                             from_: alice.pkh,
//                             txs: [
//                                 {
//                                     to_: treasuryAddress.address,
//                                     token_id: 0,
//                                     amount: depositAmount
//                                 }
//                             ]
//                         }
//                     ]).send();
//                 await aliceTransferMockFa2ToTreasuryOperation.confirmation();

//                 const updatedMockFa2TokenStorage       = await mockFa2TokenInstance.storage();
//                 const treasuryMockFa2TokenBalance      = await updatedMockFa2TokenStorage.ledger.get(treasuryAddress.address);

//                 assert.equal(treasuryMockFa2TokenBalance, depositAmount);

//             } catch(e){
//                 console.log(e);
//             } 
//         });

//         it('test: any user (alice) can deposit MVK Tokens into treasury', async () => {
//             try{        
                
//                 // Alice transfers 80 MVK Tokens to Treasury
//                 const depositAmount = MVK(80);
        
//                 await signerFactory(alice.sk)
//                 const aliceTransferMockFa2ToTreasuryOperation = await mvkTokenInstance.methods.transfer([
//                         {
//                             from_: alice.pkh,
//                             txs: [
//                                 {
//                                     to_: treasuryAddress.address,
//                                     token_id: 0,
//                                     amount: depositAmount
//                                 }
//                             ]
//                         }
//                     ]).send();
//                 await aliceTransferMockFa2ToTreasuryOperation.confirmation();

//                 const updatedMvkTokenStorage       = await mvkTokenInstance.storage();
//                 const treasuryMvkTokenBalance      = await updatedMvkTokenStorage.ledger.get(treasuryAddress.address);

//                 assert.equal(treasuryMvkTokenBalance, depositAmount);

//             } catch(e){
//                 console.log(e);
//             } 
//         });

//     }); // end test: Treasury deposit tests



//     describe('test: Treasury transfer and mintMvkAndTransfer tests', function() {

//         it('test: user (alice) cannot transfer tez from treasury', async () => {
//             try{        
                
//                 const to_        = alice.pkh;
//                 const amount     = 10000000;
//                 const tokenType  = "tez"

//                 await signerFactory(alice.sk);
//                 const failTransferTezOperation = await treasuryInstance.methods.transfer(
//                     [
//                         {
//                             "to_"    : to_,
//                             "token"  : {
//                                 "tez" : tokenType
//                             },
//                             "amount" : amount
//                         }
//                     ]
//                 );
//                 await chai.expect(failTransferTezOperation.send()).to.be.eventually.rejected;
                
//             } catch(e){
//                 console.log(e);
//             } 
//         });

//         it('test: user (alice) cannot transfer mock FA12 Tokens from treasury', async () => {
//             try{        
                
//                 const to_                   = alice.pkh;
//                 const amount                = 10000000;
//                 const tokenContractAddress  = mockFa12TokenAddress.address;

//                 await signerFactory(alice.sk);
//                 const failTransferMockFa12TokenOperation = await treasuryInstance.methods.transfer(
//                     [
//                         {
//                             "to_"    : to_,
//                             "token"  : {
//                                 "fa12" : tokenContractAddress
//                             },
//                             "amount" : amount
//                         }
//                     ]
//                 );
//                 await chai.expect(failTransferMockFa12TokenOperation.send()).to.be.eventually.rejected;

//             } catch(e){
//                 console.log(e);
//             } 
//         });

//         it('test: user (alice) cannot transfer mock FA2 Tokens from treasury', async () => {
//             try{        
                
//                 const to_        = alice.pkh;
//                 const amount     = 10000000;
//                 const tokenContractAddress      = mockFa12TokenAddress.address;
//                 const tokenId    = 0;

//                 await signerFactory(alice.sk);
//                 const failTransferMockFa2TokenOperation = await treasuryInstance.methods.transfer(
//                     [
//                         {
//                             "to_"    : to_,
//                             "token"  : {
//                                 "fa2" : {
//                                     "tokenContractAddress" : tokenContractAddress,
//                                     "tokenId" : tokenId
//                                 }
//                             },
//                             "amount" : amount
//                         }
//                     ]
//                 );
//                 await chai.expect(failTransferMockFa2TokenOperation.send()).to.be.eventually.rejected;

//             } catch(e){
//                 console.log(e);
//             } 
//         });

//         it('test: user (alice) cannot transfer MVK Tokens from treasury', async () => {
//             try{        
                
//                 const to_                   = alice.pkh;
//                 const amount                = MVK(10);
//                 const tokenContractAddress  = mvkTokenAddress.address;
//                 const tokenId               = 0;

//                 await signerFactory(alice.sk);
//                 const failTransferMvkTokenOperation = await treasuryInstance.methods.transfer(
//                     [
//                         {
//                             "to_"    : to_,
//                             "token"  : {
//                                 "fa2" : {
//                                     "tokenContractAddress" : tokenContractAddress,
//                                     "tokenId" : tokenId
//                                 }
//                             },
//                             "amount" : amount
//                         }
//                     ]
//                 );
//                 await chai.expect(failTransferMvkTokenOperation.send()).to.be.eventually.rejected;

//             } catch(e){
//                 console.log(e);
//             } 
//         });

//         it('test: user (alice) cannot access treasury mintMvkAndTransfer entrypoint', async () => {
//             try{        
                
//                 const to_        = alice.pkh;
//                 const amount     = 10000000;

//                 await signerFactory(alice.sk);
//                 const failMintMvkAndTransferOperation = await treasuryInstance.methods.mintMvkAndTransfer(
//                      to_,
//                      amount,
//                 );
//                 await chai.expect(failMintMvkAndTransferOperation.send()).to.be.eventually.rejected;

//             } catch(e){
//                 console.log(e);
//             } 
//         });

//         it('test: admin (bob) cannot transfer tez from treasury', async () => {
//             try{        
                
//                 const to_        = bob.pkh;
//                 const amount     = 10000000;
//                 const tokenType  = "tez"

//                 await signerFactory(bob.sk);
//                 const failTransferTezOperation = await treasuryInstance.methods.transfer(
//                     [
//                         {
//                             "to_"    : to_,
//                             "token"  : {
//                                 "tez" : tokenType
//                             },
//                             "amount" : amount
//                         }
//                     ]
//                 );
//                 await chai.expect(failTransferTezOperation.send()).to.be.eventually.rejected;
                
//             } catch(e){
//                 console.log(e);
//             } 
//         });

//         it('test: admin (bob) cannot transfer mock FA12 Tokens from treasury', async () => {
//             try{        
                
//                 const to_                    = bob.pkh;
//                 const amount                 = 10000000;
//                 const tokenContractAddress   = mockFa12TokenAddress.address;

//                 await signerFactory(bob.sk);
//                 const failTransferMockFa12TokenOperation = await treasuryInstance.methods.transfer(
//                     [
//                         {
//                             "to_"    : to_,
//                             "token"  : {
//                                 "fa12" : tokenContractAddress
//                             },
//                             "amount" : amount
//                         }
//                     ]
//                 );
//                 await chai.expect(failTransferMockFa12TokenOperation.send()).to.be.eventually.rejected;

//             } catch(e){
//                 console.log(e);
//             } 
//         });

//         it('test: admin (bob) cannot transfer mock FA2 Tokens from treasury', async () => {
//             try{        
                
//                 const to_                    = bob.pkh;
//                 const amount                 = 10000000;
//                 const tokenContractAddress   = mockFa12TokenAddress.address;
//                 const tokenId                = 0;

//                 await signerFactory(bob.sk);
//                 const failTransferMockFa2TokenOperation = await treasuryInstance.methods.transfer(
//                     [
//                         {
//                             "to_"    : to_,
//                             "token"  : {
//                                 "fa2" : {
//                                     "tokenContractAddress" : tokenContractAddress,
//                                     "tokenId" : tokenId
//                                 }
//                             },
//                             "amount" : amount
//                         }
//                     ]
//                 );
//                 await chai.expect(failTransferMockFa2TokenOperation.send()).to.be.eventually.rejected;

//             } catch(e){
//                 console.log(e);
//             } 
//         });

//         it('test: admin (bob) cannot transfer MVK Tokens from treasury', async () => {
//             try{        
                
//                 const to_                      = bob.pkh;
//                 const amount                   = MVK(10);
//                 const tokenContractAddress     = mvkTokenAddress.address;
//                 const tokenId                  = 0;

//                 await signerFactory(bob.sk);
//                 const failTransferMvkTokenOperation = await treasuryInstance.methods.transfer(
//                     [
//                         {
//                             "to_"    : to_,
//                             "token"  : {
//                                 "fa2" : {
//                                     "tokenContractAddress" : tokenContractAddress,
//                                     "tokenId" : tokenId
//                                 }
//                             },
//                             "amount" : amount
//                         }
//                     ]
//                 );
//                 await chai.expect(failTransferMvkTokenOperation.send()).to.be.eventually.rejected;

//             } catch(e){
//                 console.log(e);
//             } 
//         });

//         it('test: admin (bob) cannot access treasury mintMvkAndTransfer entrypoint', async () => {
//             try{        
                
//                 const to_        = bob.pkh;
//                 const amount     = 10000000;

//                 await signerFactory(bob.sk);
//                 const failMintMvkAndTransferOperation = await treasuryInstance.methods.mintMvkAndTransfer(
//                      to_,
//                      amount,
//                 );
//                 await chai.expect(failMintMvkAndTransferOperation.send()).to.be.eventually.rejected;

//             } catch(e){
//                 console.log(e);
//             } 
//         });


//         it('test: admin (bob) can update whitelist contract address map', async () => {
//             try{        

//                 await signerFactory(bob.sk);
//                 const adminUpdateWhitelistContractsOperation = await treasuryInstance.methods.updateWhitelistContracts(
//                      "admin",
//                      bob.pkh
//                 ).send();
//                 await adminUpdateWhitelistContractsOperation.confirmation();

//                 const treasuryStorage            = await treasuryInstance.storage();
//                 const treasuryWhitelistContracts = await treasuryStorage.whitelistContracts.get("admin");
//                 assert.equal(treasuryWhitelistContracts, bob.pkh);

//             } catch(e){
//                 console.log(e);
//             } 
//         });

//         it('test: whitelisted addresses (bob) can transfer tez from treasury', async () => {
//             try{        
                
//                 const to_        = bob.pkh;
//                 const tokenType  = "tez";
//                 const amount     = 10000000;

//                 await signerFactory(bob.sk);
//                 const adminTransferTezOperation = await treasuryInstance.methods.transfer(
//                 [
//                     {
//                         "to_"    : to_,
//                         "token"  : {
//                             "tez" : tokenType
//                         },
//                         "amount" : amount
//                     }
//                 ]
//                 ).send();
//                 await adminTransferTezOperation.confirmation();

//                 const finalTezBalance    = 70000000;
//                 const treasuryTezBalance = await utils.tezos.tz.getBalance(treasuryAddress.address);
//                 assert.equal(treasuryTezBalance, finalTezBalance);
                
//             } catch(e){
//                 console.log(e);
//             } 
//         });

//         it('test: whitelisted addresses (bob) can transfer mock FA12 Tokens from treasury', async () => {
//             try{        
                
//                 const to_                   = bob.pkh;
//                 const amount                = 10000000;
//                 const tokenContractAddress  = mockFa12TokenAddress.address;

//                 await signerFactory(bob.sk);
//                 const adminTransferMockFa12TokenOperation = await treasuryInstance.methods.transfer(
//                     [
//                         {
//                             "to_"    : to_,
//                             "token"  : {
//                                 "fa12" : tokenContractAddress
//                             },
//                             "amount" : amount
//                         }
//                     ]
//                 ).send();
//                 await adminTransferMockFa12TokenOperation.confirmation();

//                 const finalMockFa12TokenBalance      = 70000000;
//                 const updatedMockFa12TokenStorage    = await mockFa12TokenInstance.storage();
//                 const treasuryMockFa12TokenBalance   = await updatedMockFa12TokenStorage.ledger.get(treasuryAddress.address);

//                 assert.equal(treasuryMockFa12TokenBalance.balance, finalMockFa12TokenBalance);

//             } catch(e){
//                 console.log(e);
//             } 
//         });

//         it('test: whitelisted addresses (bob) can transfer mock FA2 Tokens from treasury', async () => {
//             try{        

//                 const to_                    = bob.pkh;
//                 const amount                 = 10000000;
//                 const tokenContractAddress   = mockFa2TokenAddress.address;
//                 const tokenId                = 0;

//                 await signerFactory(bob.sk);
//                 const adminTransferMockFa2TokenOperation = await treasuryInstance.methods.transfer(
//                     [
//                         {
//                             "to_"    : to_,
//                             "token"  : {
//                                 "fa2" : {
//                                     "tokenContractAddress" : tokenContractAddress,
//                                     "tokenId" : tokenId
//                                 }
//                             },
//                             "amount" : amount
//                         }
//                     ]
//                 ).send();
//                 await adminTransferMockFa2TokenOperation.confirmation();

//                 const finalMockFa2TokenBalance      = 70000000;
//                 const updatedMockFa2TokenStorage    = await mockFa2TokenInstance.storage();
//                 const treasuryMockFa2TokenBalance   = await updatedMockFa2TokenStorage.ledger.get(treasuryAddress.address);

//                 assert.equal(treasuryMockFa2TokenBalance, finalMockFa2TokenBalance);

//             } catch(e){
//                 console.log(e);
//             } 
//         });

//         it('test: whitelisted addresses (bob) can transfer MVK Tokens from treasury', async () => {
//             try{        

//                 const to_                      = oscar.pkh;
//                 const amount                   = MVK(10);
//                 const tokenContractAddress     = mvkTokenAddress.address;
//                 const tokenId                  = 0;

//                 await signerFactory(bob.sk);
//                 const adminTransferMockFa2TokenOperation = await treasuryInstance.methods.transfer(
//                     [
//                         {
//                             "to_"    : to_,
//                             "token"  : {
//                                 "fa2" : {
//                                     "tokenContractAddress" : tokenContractAddress,
//                                     "tokenId" : tokenId
//                                 }
//                             },
//                             "amount" : amount
//                         }
//                     ]
//                 ).send();
//                 await adminTransferMockFa2TokenOperation.confirmation();

//                 const finalMvkTokenBalance      = MVK(70);
//                 const updatedMvkTokenStorage    = await mvkTokenInstance.storage();
//                 const treasuryMvkTokenBalance   = await updatedMvkTokenStorage.ledger.get(treasuryAddress.address);

//                 assert.equal(treasuryMvkTokenBalance, finalMvkTokenBalance);

//             } catch(e){
//                 console.log(e);
//             } 
//         });

//         it('test: whitelisted addresses (bob) can access treasury mintMvkAndTransfer entrypoint', async () => {
//             try{        
                
//                 const to_        = bob.pkh;
//                 const amount     = 10000000000; // 10 MVK

//                 const mvkTokenStorage           = await mvkTokenInstance.storage();
//                 const initialBobMvkTokenBalance = await mvkTokenStorage.ledger.get(bob.pkh);


//                 await signerFactory(bob.sk);
//                 const mintMvkAndTransferOperation = await treasuryInstance.methods.mintMvkAndTransfer(
//                      to_,
//                      amount,
//                 ).send();
//                 await mintMvkAndTransferOperation.confirmation();

//                 const updatedMvkTokenStorage     = await mvkTokenInstance.storage();
//                 const updatedBobMvkTokenBalance  = await updatedMvkTokenStorage.ledger.get(bob.pkh);

//                 assert.equal(parseInt(updatedBobMvkTokenBalance), parseInt(initialBobMvkTokenBalance) + amount);
                

//             } catch(e){
//                 console.log(e);
//             } 
//         });

//     }); // end test: Treasury transfer tests

//     describe('test: Treasury batch transfer tests', function() {
        
//         it('test: whitelisted user (bob) can send batch transfer of tez', async () => {
//             try{        
                
//                 const tokenType  = "tez";

//                 const recipient_one   = mallory.pkh;
//                 const amount_one      = 2000000;

//                 const recipient_two   = oscar.pkh;
//                 const amount_two      = 3000000;

//                 const recipient_three = trudy.pkh;
//                 const amount_three    = 5000000;

//                 const initialRecipientOneTezBalance   = await utils.tezos.tz.getBalance(recipient_one);
//                 const initialRecipientTwoTezBalance   = await utils.tezos.tz.getBalance(recipient_two);
//                 const initialRecipientThreeTezBalance = await utils.tezos.tz.getBalance(recipient_three);

//                 await signerFactory(bob.sk);
//                 const adminBatchTransferOperation = await treasuryInstance.methods.transfer(
//                 [
//                     {
//                         "to_"    : recipient_one,
//                         "token"  : {
//                             "tez" : tokenType
//                         },
//                         "amount" : amount_one
//                     },
//                     {
//                         "to_"    : recipient_two,
//                         "token"  : {
//                             "tez" : tokenType
//                         },
//                         "amount" : amount_two
//                     },
//                     {
//                         "to_"    : recipient_three,
//                         "token"  : {
//                             "tez" : tokenType
//                         },
//                         "amount" : amount_three
//                     }
//                 ]
//                 ).send();
//                 await adminBatchTransferOperation.confirmation();

//                 const finalRecipientOneTezBalance   = await utils.tezos.tz.getBalance(recipient_one);
//                 const finalRecipientTwoTezBalance   = await utils.tezos.tz.getBalance(recipient_two);
//                 const finalRecipientThreeTezBalance = await utils.tezos.tz.getBalance(recipient_three);

//                 assert.equal(finalRecipientOneTezBalance,   2002000000);
//                 assert.equal(finalRecipientTwoTezBalance,   2003000000);
//                 assert.equal(finalRecipientThreeTezBalance, 2005000000);

                
//             } catch(e){
//                 console.log(e);
//             } 
//         });

//         it('test: whitelisted user (bob) can send batch transfer of mock FA12 tokens', async () => {
//             try{        
                
//                 const tokenType             = "fa12";
//                 const tokenContractAddress  = mockFa12TokenAddress.address;

//                 const recipient_one   = mallory.pkh;
//                 const amount_one      = 2000000;

//                 const recipient_two   = oscar.pkh;
//                 const amount_two      = 3000000;

//                 const recipient_three = trudy.pkh;
//                 const amount_three    = 5000000;

//                 const mockFa12TokenStorage           = await mockFa12TokenInstance.storage();
//                 const initialRecipientOneAccount     = await mockFa12TokenStorage.ledger.get(recipient_one);
//                 const initialRecipientTwoAccount     = await mockFa12TokenStorage.ledger.get(recipient_two);
//                 const initialRecipientThreeAccount   = await mockFa12TokenStorage.ledger.get(recipient_three);

//                 const initialRecipientOneBalance     = parseInt(initialRecipientOneAccount   === undefined ? 0 : initialRecipientOneAccount.balance);
//                 const initialRecipientTwoBalance     = parseInt(initialRecipientTwoAccount   === undefined ? 0 : initialRecipientTwoAccount.balance);
//                 const initialRecipientThreeBalance   = parseInt(initialRecipientThreeAccount === undefined ? 0 : initialRecipientThreeAccount.balance);

//                 await signerFactory(bob.sk);
//                 const adminBatchTransferOperation = await treasuryInstance.methods.transfer(
//                 [
//                     {
//                         "to_"    : recipient_one,
//                         "token"  : {
//                             "fa12" : tokenContractAddress
//                         },
//                         "amount" : amount_one
//                     },
//                     {
//                         "to_"    : recipient_two,
//                         "token"  : {
//                             "fa12" : tokenContractAddress
//                         },
//                         "amount" : amount_two
//                     },
//                     {
//                         "to_"    : recipient_three,
//                         "token"  : {
//                             "fa12" : tokenContractAddress
//                         },
//                         "amount" : amount_three
//                     }
//                 ]
//                 ).send();
//                 await adminBatchTransferOperation.confirmation();

//                 const updatedMockFa12TokenStorage    = await mockFa12TokenInstance.storage();
//                 const finalRecipientOneBalance       = await updatedMockFa12TokenStorage.ledger.get(recipient_one);
//                 const finalRecipientTwoBalance       = await updatedMockFa12TokenStorage.ledger.get(recipient_two);
//                 const finalRecipientThreeBalance     = await updatedMockFa12TokenStorage.ledger.get(recipient_three);

//                 assert.equal(parseInt(finalRecipientOneBalance.balance),   initialRecipientOneBalance   + amount_one);
//                 assert.equal(parseInt(finalRecipientTwoBalance.balance),   initialRecipientTwoBalance   + amount_two);
//                 assert.equal(parseInt(finalRecipientThreeBalance.balance), initialRecipientThreeBalance + amount_three);

//             } catch(e){
//                 console.log(e);
//             } 
//         });

//         it('test: whitelisted user (bob) can send batch transfer of mock FA2 tokens', async () => {
//             try{        
                
//                 const tokenType             = "fa2";
//                 const tokenContractAddress  = mockFa2TokenAddress.address;
//                 const tokenId               = 0;

//                 const recipient_one   = mallory.pkh;
//                 const amount_one      = 2000000;

//                 const recipient_two   = oscar.pkh;
//                 const amount_two      = 3000000;

//                 const recipient_three = trudy.pkh;
//                 const amount_three    = 5000000;

//                 const mockFa2TokenStorage            = await mockFa2TokenInstance.storage();
//                 const initialRecipientOneAccount     = await mockFa2TokenStorage.ledger.get(recipient_one);
//                 const initialRecipientTwoAccount     = await mockFa2TokenStorage.ledger.get(recipient_two);
//                 const initialRecipientThreeAccount   = await mockFa2TokenStorage.ledger.get(recipient_three);

//                 const initialRecipientOneBalance     = parseInt(initialRecipientOneAccount   === undefined ? 0 : initialRecipientOneAccount);
//                 const initialRecipientTwoBalance     = parseInt(initialRecipientTwoAccount   === undefined ? 0 : initialRecipientTwoAccount);
//                 const initialRecipientThreeBalance   = parseInt(initialRecipientThreeAccount === undefined ? 0 : initialRecipientThreeAccount);

//                 await signerFactory(bob.sk);
//                 const adminBatchTransferOperation = await treasuryInstance.methods.transfer(
//                 [
//                     {
//                         "to_"    : recipient_one,
//                         "token"  : {
//                             "fa2" : {
//                                 "tokenContractAddress" : tokenContractAddress,
//                                 "tokenId" : tokenId
//                             }
//                         },
//                         "amount" : amount_one
//                     },
//                     {
//                         "to_"    : recipient_two,
//                         "token"  : {
//                             "fa2" : {
//                                 "tokenContractAddress" : tokenContractAddress,
//                                 "tokenId" : tokenId
//                             }
//                         },
//                         "amount" : amount_two
//                     },
//                     {
//                         "to_"    : recipient_three,
//                         "token"  : {
//                             "fa2" : {
//                                 "tokenContractAddress" : tokenContractAddress,
//                                 "tokenId" : tokenId
//                             }
//                         },
//                         "amount" : amount_three
//                     }
//                 ]
//                 ).send();
//                 await adminBatchTransferOperation.confirmation();

//                 const updatedMockFa2TokenStorage     = await mockFa2TokenInstance.storage();
//                 const finalRecipientOneBalance       = await updatedMockFa2TokenStorage.ledger.get(recipient_one);
//                 const finalRecipientTwoBalance       = await updatedMockFa2TokenStorage.ledger.get(recipient_two);
//                 const finalRecipientThreeBalance     = await updatedMockFa2TokenStorage.ledger.get(recipient_three);

//                 assert.equal(parseInt(finalRecipientOneBalance),   initialRecipientOneBalance   + amount_one);
//                 assert.equal(parseInt(finalRecipientTwoBalance),   initialRecipientTwoBalance   + amount_two);
//                 assert.equal(parseInt(finalRecipientThreeBalance), initialRecipientThreeBalance + amount_three);

//             } catch(e){
//                 console.log(e);
//             } 
//         });

//         it('test: whitelisted user (bob) can send batch transfer of MVK tokens', async () => {
//             try{        
                
//                 const tokenType             = "fa2";
//                 const tokenContractAddress  = mvkTokenAddress.address;
//                 const tokenId               = 0;

//                 const recipient_one   = mallory.pkh;
//                 const amount_one      = 2000000;

//                 const recipient_two   = oscar.pkh;
//                 const amount_two      = 3000000;

//                 const recipient_three = trudy.pkh;
//                 const amount_three    = 5000000;

//                 const mvkTokenStorage                = await mvkTokenInstance.storage();
//                 const initialRecipientOneAccount     = await mvkTokenStorage.ledger.get(recipient_one);
//                 const initialRecipientTwoAccount     = await mvkTokenStorage.ledger.get(recipient_two);
//                 const initialRecipientThreeAccount   = await mvkTokenStorage.ledger.get(recipient_three);

//                 const initialRecipientOneBalance     = parseInt(initialRecipientOneAccount   === undefined ? 0 : initialRecipientOneAccount);
//                 const initialRecipientTwoBalance     = parseInt(initialRecipientTwoAccount   === undefined ? 0 : initialRecipientTwoAccount);
//                 const initialRecipientThreeBalance   = parseInt(initialRecipientThreeAccount === undefined ? 0 : initialRecipientThreeAccount);

//                 await signerFactory(bob.sk);
//                 const adminBatchTransferOperation = await treasuryInstance.methods.transfer(
//                 [
//                     {
//                         "to_"    : recipient_one,
//                         "token"  : {
//                             "fa2" : {
//                                 "tokenContractAddress" : tokenContractAddress,
//                                 "tokenId" : tokenId
//                             }
//                         },
//                         "amount" : amount_one
//                     },
//                     {
//                         "to_"    : recipient_two,
//                         "token"  : {
//                             "fa2" : {
//                                 "tokenContractAddress" : tokenContractAddress,
//                                 "tokenId" : tokenId
//                             }
//                         },
//                         "amount" : amount_two
//                     },
//                     {
//                         "to_"    : recipient_three,
//                         "token"  : {
//                             "fa2" : {
//                                 "tokenContractAddress" : tokenContractAddress,
//                                 "tokenId" : tokenId
//                             }
//                         },
//                         "amount" : amount_three
//                     }
//                 ]
//                 ).send();
//                 await adminBatchTransferOperation.confirmation();

//                 const updatedMvkTokenStorage         = await mvkTokenInstance.storage();
//                 const finalRecipientOneBalance       = await updatedMvkTokenStorage.ledger.get(recipient_one);
//                 const finalRecipientTwoBalance       = await updatedMvkTokenStorage.ledger.get(recipient_two);
//                 const finalRecipientThreeBalance     = await updatedMvkTokenStorage.ledger.get(recipient_three);

//                 assert.equal(parseInt(finalRecipientOneBalance),   initialRecipientOneBalance   + amount_one);
//                 assert.equal(parseInt(finalRecipientTwoBalance),   initialRecipientTwoBalance   + amount_two);
//                 assert.equal(parseInt(finalRecipientThreeBalance), initialRecipientThreeBalance + amount_three);

//             } catch(e){
//                 console.log(e);
//             } 
//         });

//         it('test: whitelisted user (bob) can send batch transfer of tez, mock FA12 tokens, mock FA2 tokens, and MVK tokens', async () => {
//             try{        
                

//                 const mockFa12TokenContractAddress  = mockFa12TokenAddress.address;

//                 const mockFa2TokenContractAddress   = mockFa2TokenAddress.address;
//                 const mockFa2TokenId                = 0;
                
//                 const mvkTokenContractAddress       = mvkTokenAddress.address;
//                 const mvkTokenId                    = 0;

//                 // receive tez
//                 const recipient_one   = isaac.pkh;
//                 const amount_one      = 2000000;

//                 // receive mock FA12 tokens
//                 const recipient_two   = oscar.pkh;
//                 const amount_two      = 3000000;

//                 // receive mock FA2 tokens
//                 const recipient_three = trudy.pkh;
//                 const amount_three    = 5000000;

//                 // receive MVK Tokens
//                 const recipient_four  = david.pkh;
//                 const amount_four     = 5000000;

//                 const mvkTokenStorage                = await mvkTokenInstance.storage();
//                 const mockFa12TokenStorage           = await mockFa12TokenInstance.storage();
//                 const mockFa2TokenStorage            = await mockFa2TokenInstance.storage();

//                 const initialRecipientTwoAccount     = await mockFa12TokenStorage.ledger.get(recipient_two);
//                 const initialRecipientThreeAccount   = await mockFa2TokenStorage.ledger.get(recipient_three);
//                 const initialRecipientFourAccount    = await mvkTokenStorage.ledger.get(recipient_four);

//                 const initialRecipientTwoBalance     = parseInt(initialRecipientTwoAccount    === undefined ? 0 : initialRecipientTwoAccount.balance);
//                 const initialRecipientThreeBalance   = parseInt(initialRecipientThreeAccount  === undefined ? 0 : initialRecipientThreeAccount);
//                 const initialRecipientFourBalance    = parseInt(initialRecipientFourAccount   === undefined ? 0 : initialRecipientFourAccount);

//                 await signerFactory(bob.sk);
//                 const adminBatchTransferOperation = await treasuryInstance.methods.transfer(
//                 [
//                     {
//                         "to_"    : recipient_one,
//                         "token"  : {
//                             "tez" : "tez"
//                         },
//                         "amount" : amount_one
//                     },
//                     {
//                         "to_"    : recipient_two,
//                         "token"  : {
//                             "fa12" : mockFa12TokenContractAddress
//                         },
//                         "amount" : amount_two
//                     },
//                     {
//                         "to_"    : recipient_three,
//                         "token"  : {
//                             "fa2" : {
//                                 "tokenContractAddress" : mockFa2TokenContractAddress,
//                                 "tokenId" : mockFa2TokenId
//                             }
//                         },
//                         "amount" : amount_three
//                     },
//                     {
//                         "to_"    : recipient_four,
//                         "token"  : {
//                             "fa2" : {
//                                 "tokenContractAddress" : mvkTokenContractAddress,
//                                 "tokenId" : mvkTokenId
//                             }
//                         },
//                         "amount" : amount_four
//                     }
//                 ]
//                 ).send();
//                 await adminBatchTransferOperation.confirmation();

//                 const updatedMvkTokenStorage         = await mvkTokenInstance.storage();
//                 const updatedMockFa12TokenStorage    = await mockFa12TokenInstance.storage();
//                 const updatedMockFa2TokenStorage     = await mockFa2TokenInstance.storage();

//                 const finalRecipientOneTezBalance             = await utils.tezos.tz.getBalance(recipient_one);
//                 const finalRecipientTwoMockFa12TokenBalance   = await updatedMockFa12TokenStorage.ledger.get(recipient_two);
//                 const finalRecipientThreeMockFa2TokenBalance  = await updatedMockFa2TokenStorage.ledger.get(recipient_three);
//                 const finalRecipientThreeMvkTokenBalance      = await updatedMvkTokenStorage.ledger.get(recipient_four);

//                 assert.equal(finalRecipientOneTezBalance,   2002000000);
//                 assert.equal(parseInt(finalRecipientTwoMockFa12TokenBalance.balance),  initialRecipientTwoBalance    + amount_two);
//                 assert.equal(parseInt(finalRecipientThreeMockFa2TokenBalance),         initialRecipientThreeBalance  + amount_three);
//                 assert.equal(parseInt(finalRecipientThreeMvkTokenBalance),             initialRecipientFourBalance   + amount_four);

//             } catch(e){
//                 console.log(e);
//             } 
//         });

//     }); // end test: Treasury batch transfer tests

    

// });

