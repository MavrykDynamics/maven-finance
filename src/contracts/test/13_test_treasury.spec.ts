import assert from "assert";
import { Utils, MVK } from "./helpers/Utils";

const chai = require("chai");
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

// ------------------------------------------------------------------------------
// Contract Address
// ------------------------------------------------------------------------------

import contractDeployments from './contractDeployments.json'

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { bob, alice, eve, mallory, oscar, trudy, isaac, david, baker } from "../scripts/sandbox/accounts";
import * as helperFunctions from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("Treasury tests", async () => {
    
    var utils: Utils;
    let tezos 

    let doormanAddress 
    let delegationAddress
    let treasuryAddress 
    let governanceAddress 
    let mvkTokenAddress 
    let mavrykFa12TokenAddress
    let mavrykFa2TokenAddress

    let treasuryInstance;
    let doormanInstance;    
    let mvkTokenInstance;
    let governanceInstance;
    let mavrykFa12TokenInstance;
    let mavrykFa2TokenInstance;

    let treasuryStorage;
    let doormanStorage;
    let mvkTokenStorage;
    let governanceStorage;
    let mavrykFa12TokenStorage;
    let mavrykFa2TokenStorage;

    before("setup", async () => {

        utils = new Utils();
        await utils.init(bob.sk);
        tezos = utils.tezos;

        doormanAddress          = contractDeployments.doorman.address;
        delegationAddress       = contractDeployments.delegation.address;
        treasuryAddress         = contractDeployments.treasury.address;
        governanceAddress       = contractDeployments.governance.address;
        mavrykFa12TokenAddress  = contractDeployments.mavrykFa12Token.address;
        mavrykFa2TokenAddress   = contractDeployments.mavrykFa2Token.address;

        treasuryInstance        = await utils.tezos.contract.at(treasuryAddress);
        doormanInstance         = await utils.tezos.contract.at(doormanAddress);
        mvkTokenInstance        = await utils.tezos.contract.at(mvkTokenAddress);
        governanceInstance      = await utils.tezos.contract.at(governanceAddress);
        mavrykFa12TokenInstance = await utils.tezos.contract.at(mavrykFa12TokenAddress);
        mavrykFa2TokenInstance  = await utils.tezos.contract.at(mavrykFa2TokenAddress);
            
        treasuryStorage         = await treasuryInstance.storage();
        doormanStorage          = await doormanInstance.storage();
        mvkTokenStorage         = await mvkTokenInstance.storage();
        governanceStorage       = await governanceInstance.storage();
        mavrykFa12TokenStorage  = await mavrykFa12TokenInstance.storage();
        mavrykFa2TokenStorage   = await mavrykFa2TokenInstance.storage();

        // console.log('-- -- -- -- -- Treasury Tests -- -- -- --')
        // console.log('Treasury Contract deployed at:', treasuryInstance.address);
        // console.log('Doorman Contract deployed at:', doormanInstance.address);
        // console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
        // console.log('Governance Contract deployed at:', governanceInstance.address);
        // console.log('Mavryk Fa12 Token Contract deployed at:', mavrykFa12TokenInstance.address);
        // console.log('Mavryk Fa2 Token Contract deployed at:' , mavrykFa2TokenInstance.address);
        // console.log('Bob address: ' + bob.pkh);
        // console.log('Alice address: ' + alice.pkh);
        // console.log('Eve address: ' + eve.pkh);

    });


    describe('%setAdmin', function() {

        it('Non-admin should not be able to call this entrypoint', async () => {
            try{        

                await helperFunctions.signerFactory(tezos, eve.sk);
                await chai.expect(treasuryInstance.methods.setAdmin(eve.pkh).send()).to.be.eventually.rejected;
            } catch(e){
                console.dir(e, {depth:  5});
            } 
        }); 
        
        it('Admin should be able to call this entrypoint and update the contract administrator with a new address', async () => {
            try{        

                await helperFunctions.signerFactory(tezos, bob.sk);
                const setAdminOperation = await treasuryInstance.methods.setAdmin(eve.pkh).send();
                await setAdminOperation.confirmation();

                const updatedTreasuryStorage   = await treasuryInstance.storage();            
                assert.equal(updatedTreasuryStorage.admin, eve.pkh);

                // reset treasury admin to bob
                await helperFunctions.signerFactory(tezos, eve.sk);
                const resetAdminOperation = await treasuryInstance.methods.setAdmin(bob.pkh).send();
                await resetAdminOperation.confirmation();

                const resetTreasuryStorage   = await treasuryInstance.storage();            
                assert.equal(resetTreasuryStorage.admin, bob.pkh);

            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });
    })

    describe('test: Treasury deposit tests', function() {

        it('test: any user (alice) can deposit tez into treasury', async () => {
            try{        
                
                // Alice transfers 80 XTZ to Treasury
                const depositAmount = 80;
                const depositAmountMutez = 80000000;
                
                await helperFunctions.signerFactory(tezos, alice.sk)
                const aliceTransferTezToTreasuryOperation = await utils.tezos.contract.transfer({ to: treasuryAddress, amount: depositAmount});
                await aliceTransferTezToTreasuryOperation.confirmation();

                const treasuryTezBalance         = await utils.tezos.tz.getBalance(treasuryAddress);
                assert.equal(treasuryTezBalance, depositAmountMutez);

            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });

        it('test: any user (alice) can deposit mavryk FA12 Tokens into treasury', async () => {
            try{        
                
                // Alice transfers 80 Mavryk FA12 Tokens to Treasury
                const depositAmount = 80000000;
        
                await helperFunctions.signerFactory(tezos, alice.sk)
                const aliceTransferMavrykFa12ToTreasuryOperation = await mavrykFa12TokenInstance.methods.transfer(
                    alice.pkh, 
                    treasuryAddress, 
                    depositAmount
                    ).send();
                await aliceTransferMavrykFa12ToTreasuryOperation.confirmation();

                const updatedMavrykFa12TokenStorage       = await mavrykFa12TokenInstance.storage();
                const treasuryMavrykFa12TokenBalance      = await updatedMavrykFa12TokenStorage.ledger.get(treasuryAddress);

                assert.equal(treasuryMavrykFa12TokenBalance.balance, depositAmount);

            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });

        it('test: any user (alice) can deposit mavryk FA2 Tokens into treasury', async () => {
            try{        
                
                // Alice transfers 80 Mavryk FA2 Tokens to Treasury
                const depositAmount = 80000000;
        
                await helperFunctions.signerFactory(tezos, alice.sk)
                const aliceTransferMavrykFa2ToTreasuryOperation = await mavrykFa2TokenInstance.methods.transfer([
                        {
                            from_: alice.pkh,
                            txs: [
                                {
                                    to_: treasuryAddress,
                                    token_id: 0,
                                    amount: depositAmount
                                }
                            ]
                        }
                    ]).send();
                await aliceTransferMavrykFa2ToTreasuryOperation.confirmation();

                const updatedMavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage();
                const treasuryMavrykFa2TokenBalance      = await updatedMavrykFa2TokenStorage.ledger.get(treasuryAddress);

                assert.equal(treasuryMavrykFa2TokenBalance, depositAmount);

            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });

        it('test: any user (alice) can deposit MVK Tokens into treasury', async () => {
            try{        
                
                // Alice transfers 80 MVK Tokens to Treasury
                const depositAmount = MVK(80);
        
                mvkTokenStorage                     = await mvkTokenInstance.storage();
                const initTreasuryMvkTokenBalance   = await mvkTokenStorage.ledger.get(treasuryAddress);

                await helperFunctions.signerFactory(tezos, alice.sk)
                const aliceTransferMavrykFa2ToTreasuryOperation = await mvkTokenInstance.methods.transfer([
                        {
                            from_: alice.pkh,
                            txs: [
                                {
                                    to_: treasuryAddress,
                                    token_id: 0,
                                    amount: depositAmount
                                }
                            ]
                        }
                    ]).send();
                await aliceTransferMavrykFa2ToTreasuryOperation.confirmation();

                mvkTokenStorage       = await mvkTokenInstance.storage();
                const finalTreasuryMvkTokenBalance      = await mvkTokenStorage.ledger.get(treasuryAddress);

                assert.equal(finalTreasuryMvkTokenBalance.toNumber(), initTreasuryMvkTokenBalance.toNumber() + depositAmount);

            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });

    });

    describe('%transfer', function() {

        before("Set Bob as whitelist", async() => {
            await helperFunctions.signerFactory(tezos, bob.sk);
            const adminUpdateWhitelistContractsOperation = await treasuryInstance.methods.updateWhitelistContracts(
                 "admin",
                 bob.pkh
            ).send();
            await adminUpdateWhitelistContractsOperation.confirmation();

            const treasuryStorage            = await treasuryInstance.storage();
            const treasuryWhitelistContracts = await treasuryStorage.whitelistContracts.get("admin");
            assert.equal(treasuryWhitelistContracts, bob.pkh);
        })

        it('Whitelist contract should be able to call this entrypoint and transfer XTZ', async () => {
            try{        
                const to_        = bob.pkh;
                const tokenType  = "tez";
                const amount     = 10000000;

                await helperFunctions.signerFactory(tezos, bob.sk);
                const adminTransferTezOperation = await treasuryInstance.methods.transfer(
                [
                    {
                        "to_"    : to_,
                        "token"  : {
                            "tez" : tokenType
                        },
                        "amount" : amount
                    }
                ]
                ).send();
                await adminTransferTezOperation.confirmation();

                const finalTezBalance    = 70000000;
                const treasuryTezBalance = await utils.tezos.tz.getBalance(treasuryAddress);
                assert.equal(treasuryTezBalance, finalTezBalance);
                
            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });

        it('Whitelist contract should be able to call this entrypoint and transfer FA12', async () => {
            try{        
                
                const to_                   = bob.pkh;
                const amount                = 10000000;
                const tokenContractAddress  = mavrykFa12TokenAddress;

                await helperFunctions.signerFactory(tezos, bob.sk);
                const adminTransferMavrykFa12TokenOperation = await treasuryInstance.methods.transfer(
                    [
                        {
                            "to_"    : to_,
                            "token"  : {
                                "fa12" : tokenContractAddress
                            },
                            "amount" : amount
                        }
                    ]
                ).send();
                await adminTransferMavrykFa12TokenOperation.confirmation();

                const finalMavrykFa12TokenBalance      = 70000000;
                const updatedMavrykFa12TokenStorage    = await mavrykFa12TokenInstance.storage();
                const treasuryMavrykFa12TokenBalance   = await updatedMavrykFa12TokenStorage.ledger.get(treasuryAddress);

                assert.equal(treasuryMavrykFa12TokenBalance.balance, finalMavrykFa12TokenBalance);

            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });

        it('Whitelist contract should be able to call this entrypoint and transfer FA2', async () => {
            try{        

                const to_                    = bob.pkh;
                const amount                 = 10000000;
                const tokenContractAddress   = mavrykFa2TokenAddress;
                const tokenId                = 0;

                await helperFunctions.signerFactory(tezos, bob.sk);
                const adminTransferMavrykFa2TokenOperation = await treasuryInstance.methods.transfer(
                    [
                        {
                            "to_"    : to_,
                            "token"  : {
                                "fa2" : {
                                    "tokenContractAddress" : tokenContractAddress,
                                    "tokenId" : tokenId
                                }
                            },
                            "amount" : amount
                        }
                    ]
                ).send();
                await adminTransferMavrykFa2TokenOperation.confirmation();

                const finalMavrykFa2TokenBalance      = 70000000;
                const updatedMavrykFa2TokenStorage    = await mavrykFa2TokenInstance.storage();
                const treasuryMavrykFa2TokenBalance   = await updatedMavrykFa2TokenStorage.ledger.get(treasuryAddress);

                assert.equal(treasuryMavrykFa2TokenBalance, finalMavrykFa2TokenBalance);

            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });

        it('Whitelist contract should be able to call this entrypoint and transfer MVK', async () => {
            try{        

                const to_                      = oscar.pkh;
                const amount                   = MVK(10);
                const tokenContractAddress     = mvkTokenAddress;
                const tokenId                  = 0;
                
                mvkTokenStorage                     = await mvkTokenInstance.storage();
                const initTreasuryMvkTokenBalance   = await mvkTokenStorage.ledger.get(treasuryAddress);
                const initUserMvkTokenBalance       = await mvkTokenStorage.ledger.get(to_);

                await helperFunctions.signerFactory(tezos, bob.sk);
                const adminTransferMavrykFa2TokenOperation = await treasuryInstance.methods.transfer(
                    [
                        {
                            "to_"    : to_,
                            "token"  : {
                                "fa2" : {
                                    "tokenContractAddress" : tokenContractAddress,
                                    "tokenId" : tokenId
                                }
                            },
                            "amount" : amount
                        }
                    ]
                ).send();
                await adminTransferMavrykFa2TokenOperation.confirmation();

                mvkTokenStorage                         = await mvkTokenInstance.storage();
                const finalTreasuryMvkTokenBalance      = await mvkTokenStorage.ledger.get(treasuryAddress);
                const finalUserMvkTokenBalance          = await mvkTokenStorage.ledger.get(to_);

                assert.equal(finalTreasuryMvkTokenBalance.toNumber(), initTreasuryMvkTokenBalance.toNumber() - amount);
                assert.equal(finalUserMvkTokenBalance.toNumber(), initUserMvkTokenBalance.toNumber() + amount);

            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });

        it('Non-whitelist contracts should not be able to call this entrypoint and transfer XTZ', async () => {
            try{        
                
                const to_        = alice.pkh;
                const amount     = 10000000;
                const tokenType  = "tez"

                await helperFunctions.signerFactory(tezos, alice.sk);
                const failTransferTezOperation = await treasuryInstance.methods.transfer(
                    [
                        {
                            "to_"    : to_,
                            "token"  : {
                                "tez" : tokenType
                            },
                            "amount" : amount
                        }
                    ]
                );
                await chai.expect(failTransferTezOperation.send()).to.be.eventually.rejected;
                
            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });

        it('Whitelist contract should be able to call this entrypoint and transfer batch of XTZ', async () => {
            try{        
                
                const tokenType  = "tez";

                const recipient_one   = mallory.pkh;
                const amount_one      = 2000000;

                const recipient_two   = oscar.pkh;
                const amount_two      = 3000000;

                const recipient_three = trudy.pkh;
                const amount_three    = 5000000;

                const initialRecipientOneTezBalance   = await utils.tezos.tz.getBalance(recipient_one);
                const initialRecipientTwoTezBalance   = await utils.tezos.tz.getBalance(recipient_two);
                const initialRecipientThreeTezBalance = await utils.tezos.tz.getBalance(recipient_three);

                await helperFunctions.signerFactory(tezos, bob.sk);
                const adminBatchTransferOperation = await treasuryInstance.methods.transfer(
                [
                    {
                        "to_"    : recipient_one,
                        "token"  : {
                            "tez" : tokenType
                        },
                        "amount" : amount_one
                    },
                    {
                        "to_"    : recipient_two,
                        "token"  : {
                            "tez" : tokenType
                        },
                        "amount" : amount_two
                    },
                    {
                        "to_"    : recipient_three,
                        "token"  : {
                            "tez" : tokenType
                        },
                        "amount" : amount_three
                    }
                ]
                ).send();
                await adminBatchTransferOperation.confirmation();

                const finalRecipientOneTezBalance   = await utils.tezos.tz.getBalance(recipient_one);
                const finalRecipientTwoTezBalance   = await utils.tezos.tz.getBalance(recipient_two);
                const finalRecipientThreeTezBalance = await utils.tezos.tz.getBalance(recipient_three);

                assert.equal(finalRecipientOneTezBalance.toNumber(),   initialRecipientOneTezBalance.toNumber() + amount_one);
                assert.equal(finalRecipientTwoTezBalance.toNumber(),   initialRecipientTwoTezBalance.toNumber() + amount_two);
                assert.equal(finalRecipientThreeTezBalance.toNumber(), initialRecipientThreeTezBalance.toNumber() + amount_three);

                
            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });

        it('Whitelist contract should be able to call this entrypoint and transfer batch of FA12', async () => {
            try{        
                
                const tokenType             = "fa12";
                const tokenContractAddress  = mavrykFa12TokenAddress;

                const recipient_one   = mallory.pkh;
                const amount_one      = 2000000;

                const recipient_two   = oscar.pkh;
                const amount_two      = 3000000;

                const recipient_three = trudy.pkh;
                const amount_three    = 5000000;

                const mavrykFa12TokenStorage           = await mavrykFa12TokenInstance.storage();
                const initialRecipientOneAccount     = await mavrykFa12TokenStorage.ledger.get(recipient_one);
                const initialRecipientTwoAccount     = await mavrykFa12TokenStorage.ledger.get(recipient_two);
                const initialRecipientThreeAccount   = await mavrykFa12TokenStorage.ledger.get(recipient_three);

                const initialRecipientOneBalance     = initialRecipientOneAccount   === undefined ? 0 : initialRecipientOneAccount.balance.toNumber();
                const initialRecipientTwoBalance     = initialRecipientTwoAccount   === undefined ? 0 : initialRecipientTwoAccount.balance.toNumber();
                const initialRecipientThreeBalance   = initialRecipientThreeAccount === undefined ? 0 : initialRecipientThreeAccount.balance.toNumber();

                await helperFunctions.signerFactory(tezos, bob.sk);
                const adminBatchTransferOperation = await treasuryInstance.methods.transfer(
                [
                    {
                        "to_"    : recipient_one,
                        "token"  : {
                            "fa12" : tokenContractAddress
                        },
                        "amount" : amount_one
                    },
                    {
                        "to_"    : recipient_two,
                        "token"  : {
                            "fa12" : tokenContractAddress
                        },
                        "amount" : amount_two
                    },
                    {
                        "to_"    : recipient_three,
                        "token"  : {
                            "fa12" : tokenContractAddress
                        },
                        "amount" : amount_three
                    }
                ]
                ).send();
                await adminBatchTransferOperation.confirmation();

                const updatedMavrykFa12TokenStorage    = await mavrykFa12TokenInstance.storage();
                const finalRecipientOneBalance       = await updatedMavrykFa12TokenStorage.ledger.get(recipient_one);
                const finalRecipientTwoBalance       = await updatedMavrykFa12TokenStorage.ledger.get(recipient_two);
                const finalRecipientThreeBalance     = await updatedMavrykFa12TokenStorage.ledger.get(recipient_three);

                assert.equal(finalRecipientOneBalance.balance.toNumber(),   initialRecipientOneBalance   + amount_one);
                assert.equal(finalRecipientTwoBalance.balance.toNumber(),   initialRecipientTwoBalance   + amount_two);
                assert.equal(finalRecipientThreeBalance.balance.toNumber(), initialRecipientThreeBalance + amount_three);

            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });

        it('Whitelist contract should be able to call this entrypoint and transfer batch of FA2', async () => {
            try{        
                
                const tokenType             = "fa2";
                const tokenContractAddress  = mavrykFa2TokenAddress;
                const tokenId               = 0;

                const recipient_one   = mallory.pkh;
                const amount_one      = 2000000;

                const recipient_two   = oscar.pkh;
                const amount_two      = 3000000;

                const recipient_three = trudy.pkh;
                const amount_three    = 5000000;

                const mavrykFa2TokenStorage            = await mavrykFa2TokenInstance.storage();
                const initialRecipientOneAccount     = await mavrykFa2TokenStorage.ledger.get(recipient_one);
                const initialRecipientTwoAccount     = await mavrykFa2TokenStorage.ledger.get(recipient_two);
                const initialRecipientThreeAccount   = await mavrykFa2TokenStorage.ledger.get(recipient_three);

                const initialRecipientOneBalance     = initialRecipientOneAccount   === undefined ? 0 : initialRecipientOneAccount.toNumber();
                const initialRecipientTwoBalance     = initialRecipientTwoAccount   === undefined ? 0 : initialRecipientTwoAccount.toNumber();
                const initialRecipientThreeBalance   = initialRecipientThreeAccount === undefined ? 0 : initialRecipientThreeAccount.toNumber();

                await helperFunctions.signerFactory(tezos, bob.sk);
                const adminBatchTransferOperation = await treasuryInstance.methods.transfer(
                [
                    {
                        "to_"    : recipient_one,
                        "token"  : {
                            "fa2" : {
                                "tokenContractAddress" : tokenContractAddress,
                                "tokenId" : tokenId
                            }
                        },
                        "amount" : amount_one
                    },
                    {
                        "to_"    : recipient_two,
                        "token"  : {
                            "fa2" : {
                                "tokenContractAddress" : tokenContractAddress,
                                "tokenId" : tokenId
                            }
                        },
                        "amount" : amount_two
                    },
                    {
                        "to_"    : recipient_three,
                        "token"  : {
                            "fa2" : {
                                "tokenContractAddress" : tokenContractAddress,
                                "tokenId" : tokenId
                            }
                        },
                        "amount" : amount_three
                    }
                ]
                ).send();
                await adminBatchTransferOperation.confirmation();

                const updatedMavrykFa2TokenStorage     = await mavrykFa2TokenInstance.storage();
                const finalRecipientOneBalance       = await updatedMavrykFa2TokenStorage.ledger.get(recipient_one);
                const finalRecipientTwoBalance       = await updatedMavrykFa2TokenStorage.ledger.get(recipient_two);
                const finalRecipientThreeBalance     = await updatedMavrykFa2TokenStorage.ledger.get(recipient_three);

                assert.equal(finalRecipientOneBalance.toNumber(),   initialRecipientOneBalance   + amount_one);
                assert.equal(finalRecipientTwoBalance.toNumber(),   initialRecipientTwoBalance   + amount_two);
                assert.equal(finalRecipientThreeBalance.toNumber(), initialRecipientThreeBalance + amount_three);

            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });

        it('Whitelist contract should be able to call this entrypoint and transfer batch of MVK', async () => {
            try{        
                
                const tokenType             = "fa2";
                const tokenContractAddress  = mvkTokenAddress;
                const tokenId               = 0;

                const recipient_one   = mallory.pkh;
                const amount_one      = 2000000;

                const recipient_two   = oscar.pkh;
                const amount_two      = 3000000;

                const recipient_three = trudy.pkh;
                const amount_three    = 5000000;

                const mvkTokenStorage                = await mvkTokenInstance.storage();
                const initialRecipientOneAccount     = await mvkTokenStorage.ledger.get(recipient_one);
                const initialRecipientTwoAccount     = await mvkTokenStorage.ledger.get(recipient_two);
                const initialRecipientThreeAccount   = await mvkTokenStorage.ledger.get(recipient_three);

                const initialRecipientOneBalance     = initialRecipientOneAccount   === undefined ? 0 : initialRecipientOneAccount.toNumber();
                const initialRecipientTwoBalance     = initialRecipientTwoAccount   === undefined ? 0 : initialRecipientTwoAccount.toNumber();
                const initialRecipientThreeBalance   = initialRecipientThreeAccount === undefined ? 0 : initialRecipientThreeAccount.toNumber();

                await helperFunctions.signerFactory(tezos, bob.sk);
                const adminBatchTransferOperation = await treasuryInstance.methods.transfer(
                [
                    {
                        "to_"    : recipient_one,
                        "token"  : {
                            "fa2" : {
                                "tokenContractAddress" : tokenContractAddress,
                                "tokenId" : tokenId
                            }
                        },
                        "amount" : amount_one
                    },
                    {
                        "to_"    : recipient_two,
                        "token"  : {
                            "fa2" : {
                                "tokenContractAddress" : tokenContractAddress,
                                "tokenId" : tokenId
                            }
                        },
                        "amount" : amount_two
                    },
                    {
                        "to_"    : recipient_three,
                        "token"  : {
                            "fa2" : {
                                "tokenContractAddress" : tokenContractAddress,
                                "tokenId" : tokenId
                            }
                        },
                        "amount" : amount_three
                    }
                ]
                ).send();
                await adminBatchTransferOperation.confirmation();

                const updatedMvkTokenStorage         = await mvkTokenInstance.storage();
                const finalRecipientOneBalance       = await updatedMvkTokenStorage.ledger.get(recipient_one);
                const finalRecipientTwoBalance       = await updatedMvkTokenStorage.ledger.get(recipient_two);
                const finalRecipientThreeBalance     = await updatedMvkTokenStorage.ledger.get(recipient_three);

                assert.equal(finalRecipientOneBalance.toNumber(),   initialRecipientOneBalance   + amount_one);
                assert.equal(finalRecipientTwoBalance.toNumber(),   initialRecipientTwoBalance   + amount_two);
                assert.equal(finalRecipientThreeBalance.toNumber(), initialRecipientThreeBalance + amount_three);

            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });

        it('Whitelist contract should be able to call this entrypoint and transfer batch of FA12, FA2, MVK and XTZ', async () => {
            try{
                const mavrykFa12TokenContractAddress  = mavrykFa12TokenAddress;

                const mavrykFa2TokenContractAddress   = mavrykFa2TokenAddress;
                const mavrykFa2TokenId                = 0;
                
                const mvkTokenContractAddress       = mvkTokenAddress;
                const mvkTokenId                    = 0;

                // receive tez
                const recipient_one   = isaac.pkh;
                const amount_one      = 2000000;

                // receive mavryk FA12 tokens
                const recipient_two   = oscar.pkh;
                const amount_two      = 3000000;

                // receive mavryk FA2 tokens
                const recipient_three = trudy.pkh;
                const amount_three    = 5000000;

                // receive MVK Tokens
                const recipient_four  = david.pkh;
                const amount_four     = 5000000;

                const mvkTokenStorage                = await mvkTokenInstance.storage();
                const mavrykFa12TokenStorage           = await mavrykFa12TokenInstance.storage();
                const mavrykFa2TokenStorage            = await mavrykFa2TokenInstance.storage();

                const initRecipientOneTezBalance     = await utils.tezos.tz.getBalance(recipient_one);
                const initialRecipientTwoAccount     = await mavrykFa12TokenStorage.ledger.get(recipient_two);
                const initialRecipientThreeAccount   = await mavrykFa2TokenStorage.ledger.get(recipient_three);
                const initialRecipientFourAccount    = await mvkTokenStorage.ledger.get(recipient_four);

                const initialRecipientTwoBalance     = initialRecipientTwoAccount    === undefined ? 0 : initialRecipientTwoAccount.balance.toNumber();
                const initialRecipientThreeBalance   = initialRecipientThreeAccount  === undefined ? 0 : initialRecipientThreeAccount.toNumber();
                const initialRecipientFourBalance    = initialRecipientFourAccount   === undefined ? 0 : initialRecipientFourAccount.toNumber();

                await helperFunctions.signerFactory(tezos, bob.sk);
                const adminBatchTransferOperation = await treasuryInstance.methods.transfer(
                [
                    {
                        "to_"    : recipient_one,
                        "token"  : {
                            "tez" : "tez"
                        },
                        "amount" : amount_one
                    },
                    {
                        "to_"    : recipient_two,
                        "token"  : {
                            "fa12" : mavrykFa12TokenContractAddress
                        },
                        "amount" : amount_two
                    },
                    {
                        "to_"    : recipient_three,
                        "token"  : {
                            "fa2" : {
                                "tokenContractAddress" : mavrykFa2TokenContractAddress,
                                "tokenId" : mavrykFa2TokenId
                            }
                        },
                        "amount" : amount_three
                    },
                    {
                        "to_"    : recipient_four,
                        "token"  : {
                            "fa2" : {
                                "tokenContractAddress" : mvkTokenContractAddress,
                                "tokenId" : mvkTokenId
                            }
                        },
                        "amount" : amount_four
                    }
                ]
                ).send();
                await adminBatchTransferOperation.confirmation();

                const updatedMvkTokenStorage         = await mvkTokenInstance.storage();
                const updatedMavrykFa12TokenStorage    = await mavrykFa12TokenInstance.storage();
                const updatedMavrykFa2TokenStorage     = await mavrykFa2TokenInstance.storage();

                const finalRecipientOneTezBalance             = await utils.tezos.tz.getBalance(recipient_one);
                const finalRecipientTwoMavrykFa12TokenBalance   = await updatedMavrykFa12TokenStorage.ledger.get(recipient_two);
                const finalRecipientThreeMavrykFa2TokenBalance  = await updatedMavrykFa2TokenStorage.ledger.get(recipient_three);
                const finalRecipientThreeMvkTokenBalance      = await updatedMvkTokenStorage.ledger.get(recipient_four);

                assert.equal(finalRecipientOneTezBalance,   initRecipientOneTezBalance.toNumber()    + amount_one);
                assert.equal(finalRecipientTwoMavrykFa12TokenBalance.balance.toNumber(),  initialRecipientTwoBalance    + amount_two);
                assert.equal(finalRecipientThreeMavrykFa2TokenBalance.toNumber(),         initialRecipientThreeBalance  + amount_three);
                assert.equal(finalRecipientThreeMvkTokenBalance.toNumber(),             initialRecipientFourBalance   + amount_four);

            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });

        it('Non-whitelist contracts should not be able to call this entrypoint and transfer FA12', async () => {
            try{
                const to_                   = alice.pkh;
                const amount                = 10000000;
                const tokenContractAddress  = mavrykFa12TokenAddress;

                await helperFunctions.signerFactory(tezos, alice.sk);
                const failTransferMavrykFa12TokenOperation = await treasuryInstance.methods.transfer(
                    [
                        {
                            "to_"    : to_,
                            "token"  : {
                                "fa12" : tokenContractAddress
                            },
                            "amount" : amount
                        }
                    ]
                );
                await chai.expect(failTransferMavrykFa12TokenOperation.send()).to.be.eventually.rejected;

            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });

        it('Non-whitelist contracts should not be able to call this entrypoint and transfer FA2', async () => {
            try{
                const to_        = alice.pkh;
                const amount     = 10000000;
                const tokenContractAddress      = mavrykFa12TokenAddress;
                const tokenId    = 0;

                await helperFunctions.signerFactory(tezos, alice.sk);
                const failTransferMavrykFa2TokenOperation = await treasuryInstance.methods.transfer(
                    [
                        {
                            "to_"    : to_,
                            "token"  : {
                                "fa2" : {
                                    "tokenContractAddress" : tokenContractAddress,
                                    "tokenId" : tokenId
                                }
                            },
                            "amount" : amount
                        }
                    ]
                );
                await chai.expect(failTransferMavrykFa2TokenOperation.send()).to.be.eventually.rejected;

            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });

        it('Non-whitelist contracts should not be able to call this entrypoint and transfer MVK', async () => {
            try{
                const to_                   = alice.pkh;
                const amount                = MVK(10);
                const tokenContractAddress  = mvkTokenAddress;
                const tokenId               = 0;

                await helperFunctions.signerFactory(tezos, alice.sk);
                const failTransferMvkTokenOperation = await treasuryInstance.methods.transfer(
                    [
                        {
                            "to_"    : to_,
                            "token"  : {
                                "fa2" : {
                                    "tokenContractAddress" : tokenContractAddress,
                                    "tokenId" : tokenId
                                }
                            },
                            "amount" : amount
                        }
                    ]
                );
                await chai.expect(failTransferMvkTokenOperation.send()).to.be.eventually.rejected;
            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });
    })

    describe('%stakeMvk', function() {

        it('Admin should be able to call this entrypoint and stake MVK', async () => {
            try{        
                // Initial values
                await helperFunctions.signerFactory(tezos, bob.sk);
                doormanStorage                      = await doormanInstance.storage();
                mvkTokenStorage                     = await mvkTokenInstance.storage();
                const initTreasuryMvkTokenBalance   = await mvkTokenStorage.ledger.get(treasuryAddress);
                const initTreasurySMvkTokenBalance  = await doormanStorage.userStakeBalanceLedger.get(treasuryAddress);
                const stakeAmount                   = MVK(10);

                // Operations
                const stakeOperation = await treasuryInstance.methods.stakeMvk(stakeAmount).send();
                await stakeOperation.confirmation();

                // Final values
                mvkTokenStorage                     = await mvkTokenInstance.storage();
                doormanStorage                      = await doormanInstance.storage();
                const finalTreasuryMvkTokenBalance  = await mvkTokenStorage.ledger.get(treasuryAddress);
                const finalTreasurySMvkTokenBalance = await doormanStorage.userStakeBalanceLedger.get(treasuryAddress);

                assert.equal(initTreasuryMvkTokenBalance.toNumber() - stakeAmount, finalTreasuryMvkTokenBalance.toNumber());
                assert.strictEqual(initTreasurySMvkTokenBalance, undefined);
                assert.notStrictEqual(finalTreasurySMvkTokenBalance, undefined);

            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });

        it('Non-admin should not be able to call this entrypoint and stake MVK', async () => {
            try{
                // Initial values
                const stakeAmount     = MVK(10);

                // Operations
                await helperFunctions.signerFactory(tezos, alice.sk);
                await chai.expect(treasuryInstance.methods.stakeMvk(stakeAmount).send()).to.be.eventually.rejected;
            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });

        it('Admin should not be able to call this entrypoint if the doorman contract is not referenced in the generalContracts map', async () => {
            try{
                // Initial values
                const stakeAmount     = MVK(10);

                // Update config
                await helperFunctions.signerFactory(tezos, bob.sk);
                var updateGeneralContractOperation = await governanceInstance.methods.updateGeneralContracts("doorman", doormanAddress).send();
                await updateGeneralContractOperation.confirmation();

                // Operations
                await helperFunctions.signerFactory(tezos, alice.sk);
                await chai.expect(treasuryInstance.methods.stakeMvk(stakeAmount).send()).to.be.eventually.rejected;

                // Reset config
                await helperFunctions.signerFactory(tezos, bob.sk);
                var updateGeneralContractOperation = await governanceInstance.methods.updateGeneralContracts("doorman", doormanAddress).send();
                await updateGeneralContractOperation.confirmation();
            } catch(e){
                console.dir(e, {depth:  5});
            }
        });
    });

    describe('%unstakeMvk', function() {

        it('Admin should be able to call this entrypoint and unstake MVK', async () => {
            try{        
                // Initial values
                await helperFunctions.signerFactory(tezos, bob.sk);
                doormanStorage                      = await doormanInstance.storage();
                mvkTokenStorage                     = await mvkTokenInstance.storage();
                const initTreasuryMvkTokenBalance   = await mvkTokenStorage.ledger.get(treasuryAddress);
                const initTreasurySMvkTokenBalance  = await doormanStorage.userStakeBalanceLedger.get(treasuryAddress);
                const unstakeAmount                 = MVK(5);

                // Operations
                const stakeOperation = await treasuryInstance.methods.unstakeMvk(unstakeAmount).send();
                await stakeOperation.confirmation();

                // Final values
                mvkTokenStorage                     = await mvkTokenInstance.storage();
                const finalTreasuryMvkTokenBalance  = await mvkTokenStorage.ledger.get(treasuryAddress);
                const finalTreasurySMvkTokenBalance = await doormanStorage.userStakeBalanceLedger.get(treasuryAddress);

                assert.notEqual(initTreasuryMvkTokenBalance.toNumber(), finalTreasuryMvkTokenBalance.toNumber());
                assert.notEqual(initTreasurySMvkTokenBalance.balance.toNumber() - unstakeAmount, finalTreasurySMvkTokenBalance.balance.toNumber());

            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });

        it('Non-admin should not be able to call this entrypoint and stake MVK', async () => {
            try{
                // Initial values
                const unstakeAmount     = MVK(2);

                // Operations
                await helperFunctions.signerFactory(tezos, alice.sk);
                await chai.expect(treasuryInstance.methods.unstakeMvk(unstakeAmount).send()).to.be.eventually.rejected;
            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });

        it('Whitelist contract should not be able to call this entrypoint if the doorman contract is not referenced in the generalContracts map', async () => {
            try{
                // Initial values
                const unstakeAmount     = MVK(2);

                // Update config
                await helperFunctions.signerFactory(tezos, bob.sk);
                var updateGeneralContractOperation = await governanceInstance.methods.updateGeneralContracts("doorman", doormanAddress).send();
                await updateGeneralContractOperation.confirmation();

                // Operations
                await helperFunctions.signerFactory(tezos, alice.sk);
                await chai.expect(treasuryInstance.methods.unstakeMvk(unstakeAmount).send()).to.be.eventually.rejected;

                // Reset config
                await helperFunctions.signerFactory(tezos, bob.sk);
                var updateGeneralContractOperation = await governanceInstance.methods.updateGeneralContracts("doorman", doormanAddress).send();
                await updateGeneralContractOperation.confirmation();
            } catch(e){
                console.dir(e, {depth:  5});
            }
        });
    });

    describe('%mintMvkAndTransfer', function() {

        it('Whitelist contract should be able to call this entrypoint and mintAndTransfer MVK', async () => {
            try{        
                
                const to_        = bob.pkh;
                const amount     = MVK(10); // 10 MVK

                const mvkTokenStorage           = await mvkTokenInstance.storage();
                const initialBobMvkTokenBalance = await mvkTokenStorage.ledger.get(bob.pkh);


                await helperFunctions.signerFactory(tezos, bob.sk);
                const mintMvkAndTransferOperation = await treasuryInstance.methods.mintMvkAndTransfer(
                     to_,
                     amount,
                ).send();
                await mintMvkAndTransferOperation.confirmation();

                const updatedMvkTokenStorage     = await mvkTokenInstance.storage();
                const updatedBobMvkTokenBalance  = await updatedMvkTokenStorage.ledger.get(bob.pkh);

                assert.equal(updatedBobMvkTokenBalance.toNumber(), initialBobMvkTokenBalance.toNumber() + amount);
                

            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });

        it('Non-whitelist contracts should not be able to call this entrypoint and mintAndTransfer MVK', async () => {
            try{
                const to_        = alice.pkh;
                const amount     = 10000000;

                await helperFunctions.signerFactory(tezos, alice.sk);
                const failMintMvkAndTransferOperation = await treasuryInstance.methods.mintMvkAndTransfer(
                     to_,
                     amount,
                );
                await chai.expect(failMintMvkAndTransferOperation.send()).to.be.eventually.rejected;

            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });
    });

    describe('%togglePauseEntrypoint', function() {
        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk)
        });
        it('Admin should be able to call this entrypoint', async () => {
            try{
                // Initial Values
                treasuryStorage                = await treasuryInstance.storage();
                const isPausedStart            = treasuryStorage.breakGlassConfig.transferIsPaused
                const to_                      = oscar.pkh;
                const amount                   = MVK(10);
                const tokenContractAddress     = mvkTokenAddress;
                const tokenId                  = 0;

                // Operation
                var togglePauseOperation = await treasuryInstance.methods.togglePauseEntrypoint("transfer", true).send();
                await togglePauseOperation.confirmation();

                // Final values
                treasuryStorage       = await treasuryInstance.storage();
                const isPausedEnd       = treasuryStorage.breakGlassConfig.transferIsPaused

                await chai.expect(treasuryInstance.methods.transfer(
                    [
                        {
                            "to_"    : to_,
                            "token"  : {
                                "fa2" : {
                                    "tokenContractAddress" : tokenContractAddress,
                                    "tokenId" : tokenId
                                }
                            },
                            "amount" : amount
                        }
                    ]
                ).send()
                ).to.be.rejected;

                // Reset admin
                var togglePauseOperation = await treasuryInstance.methods.togglePauseEntrypoint("transfer", false).send();
                await togglePauseOperation.confirmation();

                // Assertions
                assert.equal(isPausedStart, false);
                assert.equal(isPausedEnd, true);
            } catch(e){
                console.dir(e, {depth:  5});
            }
        });
        
        it('Admin should be able to call this entrypoint', async () => {
            try{
                // Initial Values
                treasuryStorage                 = await treasuryInstance.storage();
                const isPausedStart             = treasuryStorage.breakGlassConfig.mintMvkAndTransferIsPaused
                const to_                       = bob.pkh;
                const amount                    = MVK(10); // 10 MVK

                // Operation
                var togglePauseOperation = await treasuryInstance.methods.togglePauseEntrypoint("mintMvkAndTransfer", true).send();
                await togglePauseOperation.confirmation();

                // Final values
                treasuryStorage       = await treasuryInstance.storage();
                const isPausedEnd       = treasuryStorage.breakGlassConfig.mintMvkAndTransferIsPaused

                await chai.expect(treasuryInstance.methods.mintMvkAndTransfer(
                    to_,
                    amount,
                ).send()).to.be.rejected;

                // Reset admin
                var togglePauseOperation = await treasuryInstance.methods.togglePauseEntrypoint("mintMvkAndTransfer", false).send();
                await togglePauseOperation.confirmation();

                // Assertions
                assert.equal(isPausedStart, false);
                assert.equal(isPausedEnd, true);
            } catch(e){
                console.dir(e, {depth:  5});
            }
        });
        
        it('Admin should be able to call this entrypoint', async () => {
            try{
                // Initial Values
                treasuryStorage                 = await treasuryInstance.storage();
                const isPausedStart             = treasuryStorage.breakGlassConfig.stakeMvkIsPaused
                const amount                    = MVK(10); // 10 MVK

                // Operation
                var togglePauseOperation = await treasuryInstance.methods.togglePauseEntrypoint("stakeMvk", true).send();
                await togglePauseOperation.confirmation();

                // Final values
                treasuryStorage       = await treasuryInstance.storage();
                const isPausedEnd       = treasuryStorage.breakGlassConfig.stakeMvkIsPaused

                await chai.expect(treasuryInstance.methods.stakeMvk(
                    amount,
                ).send()).to.be.rejected;

                // Reset admin
                var togglePauseOperation = await treasuryInstance.methods.togglePauseEntrypoint("stakeMvk", false).send();
                await togglePauseOperation.confirmation();

                // Assertions
                assert.equal(isPausedStart, false);
                assert.equal(isPausedEnd, true);
            } catch(e){
                console.dir(e, {depth:  5});
            }
        });
        
        it('Admin should be able to call this entrypoint', async () => {
            try{
                // Initial Values
                treasuryStorage                 = await treasuryInstance.storage();
                const isPausedStart             = treasuryStorage.breakGlassConfig.unstakeMvkIsPaused
                const amount                    = MVK(10); // 10 MVK

                // Operation
                var togglePauseOperation = await treasuryInstance.methods.togglePauseEntrypoint("unstakeMvk", true).send();
                await togglePauseOperation.confirmation();

                // Final values
                treasuryStorage       = await treasuryInstance.storage();
                const isPausedEnd       = treasuryStorage.breakGlassConfig.unstakeMvkIsPaused

                await chai.expect(treasuryInstance.methods.unstakeMvk(
                    amount,
                ).send()).to.be.rejected;

                // Reset admin
                var togglePauseOperation = await treasuryInstance.methods.togglePauseEntrypoint("unstakeMvk", false).send();
                await togglePauseOperation.confirmation();

                // Assertions
                assert.equal(isPausedStart, false);
                assert.equal(isPausedEnd, true);
            } catch(e){
                console.dir(e, {depth:  5});
            }
        });

        it('Non-admin should not be able to call the entrypoint', async () => {
            try{
                await helperFunctions.signerFactory(tezos, alice.sk);
                await chai.expect(treasuryInstance.methods.togglePauseEntrypoint("unstakeMvk", true).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth:  5});
            }
        });
    });

    describe("%pauseAll", async () => {
        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk)
        });

        it('Admin should be able to call the entrypoint and pause all entrypoints in the contract', async () => {
            try{
                // Initial Values
                treasuryStorage       = await treasuryInstance.storage();
                for (let [key, value] of Object.entries(treasuryStorage.breakGlassConfig)){
                    assert.equal(value, false);
                }

                // Operation
                var pauseOperation = await treasuryInstance.methods.pauseAll().send();
                await pauseOperation.confirmation();

                // Final values
                treasuryStorage       = await treasuryInstance.storage();
                for (let [key, value] of Object.entries(treasuryStorage.breakGlassConfig)){
                    assert.equal(value, true);
                }
            } catch(e){
                console.dir(e, {depth:  5});
            }
        });
        it('Non-admin should not be able to call the entrypoint', async () => {
            try{
                await helperFunctions.signerFactory(tezos, alice.sk);
                await chai.expect(treasuryInstance.methods.pauseAll().send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth:  5});
            }
        });
    })

    describe("%unpauseAll", async () => {
        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk)
        });

        it('Admin should be able to call the entrypoint and unpause all entrypoints in the contract', async () => {
            try{
                // Initial Values
                treasuryStorage       = await treasuryInstance.storage();
                for (let [key, value] of Object.entries(treasuryStorage.breakGlassConfig)){
                    assert.equal(value, true);
                }

                // Operation
                var pauseOperation = await treasuryInstance.methods.unpauseAll().send();
                await pauseOperation.confirmation();

                // Final values
                treasuryStorage       = await treasuryInstance.storage();
                for (let [key, value] of Object.entries(treasuryStorage.breakGlassConfig)){
                    assert.equal(value, false);
                }
            } catch(e){
                console.dir(e, {depth:  5});
            }
        });
        it('Non-admin should not be able to call the entrypoint', async () => {
            try{
                await helperFunctions.signerFactory(tezos, alice.sk);
                await chai.expect(treasuryInstance.methods.unpauseAll().send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth:  5});
            }
        });
    })

    describe("%setBaker", async () => {
        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk)
        });

        it('Admin should be able to call the entrypoint delegate to a baker', async () => {
            try{
                // Initial Values
                treasuryStorage       = await treasuryInstance.storage();

                // Operation
                var pauseOperation = await treasuryInstance.methods.setBaker(baker.pkh).send();
                await pauseOperation.confirmation();

                // Final values
                treasuryStorage       = await treasuryInstance.storage();
            } catch(e){
                console.dir(e, {depth:  5});
            }
        });
        it('Non-admin should not be able to call the entrypoint', async () => {
            try{
                await helperFunctions.signerFactory(tezos, alice.sk);
                await chai.expect(treasuryInstance.methods.setBaker().send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth:  5});
            }
        });
    })
});

