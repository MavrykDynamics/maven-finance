import assert from "assert";
import { Utils, MVN } from "./helpers/Utils";
import { BigNumber } from 'bignumber.js'

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
import {
    fa2Transfer,
    getStorageMapValue,
    mistakenTransferFa2Token,
    signerFactory,
    updateGeneralContracts,
    updateWhitelistContracts,
    updateWhitelistTokenContracts
} from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("Treasury tests", async () => {
    
    var utils: Utils;
    let tezos 

    let userOne 
    let userOneSk 

    let userTwo 
    let userTwoSk 

    let admin 
    let adminSk 

    let tokenId = 0

    let doormanAddress 
    let delegationAddress
    let treasuryAddress 
    let governanceAddress 
    let mvnTokenAddress 
    let mavenFa12TokenAddress
    let mavenFa2TokenAddress

    let treasuryInstance;
    let doormanInstance;    
    let mvnTokenInstance;
    let governanceInstance;
    let mavenFa12TokenInstance;
    let mavenFa2TokenInstance;

    let treasuryStorage;
    let doormanStorage;
    let mvnTokenStorage;
    let governanceStorage;
    let mavenFa12TokenStorage;
    let mavenFa2TokenStorage;

    // operations
    let transferOperation

    // housekeeping operations
    let setAdminOperation
    let setGovernanceOperation
    let setBakerOperation
    let resetAdminOperation
    let updateWhitelistContractsOperation
    let updateWhitelistTokenContractsOperation
    let updateGeneralContractsOperation
    let mistakenTransferOperation
    let pauseOperation
    let pauseAllOperation
    let unpauseOperation
    let unpauseAllOperation

    // contract map value
    let storageMap
    let contractMapKey
    let initialContractMapValue
    let updatedContractMapValue

    before("setup", async () => {

        utils = new Utils();
        await utils.init(bob.sk);
        tezos = utils.tezos;
        
        admin       = bob.pkh 
        adminSk     = bob.sk 
        
        userOne     = eve.pkh 
        userOneSk   = eve.sk 
        
        userTwo     = alice.pkh 
        userTwoSk   = alice.sk 

        mvnTokenAddress         = contractDeployments.mvnToken.address;
        doormanAddress          = contractDeployments.doorman.address;
        delegationAddress       = contractDeployments.delegation.address;
        treasuryAddress         = contractDeployments.treasury.address;
        governanceAddress       = contractDeployments.governance.address;
        mavenFa12TokenAddress  = contractDeployments.mavenFa12Token.address;
        mavenFa2TokenAddress   = contractDeployments.mavenFa2Token.address;

        treasuryInstance        = await utils.tezos.contract.at(treasuryAddress);
        doormanInstance         = await utils.tezos.contract.at(doormanAddress);
        mvnTokenInstance        = await utils.tezos.contract.at(mvnTokenAddress);
        governanceInstance      = await utils.tezos.contract.at(governanceAddress);
        mavenFa12TokenInstance = await utils.tezos.contract.at(mavenFa12TokenAddress);
        mavenFa2TokenInstance  = await utils.tezos.contract.at(mavenFa2TokenAddress);
            
        treasuryStorage         = await treasuryInstance.storage();
        doormanStorage          = await doormanInstance.storage();
        mvnTokenStorage         = await mvnTokenInstance.storage();
        governanceStorage       = await governanceInstance.storage();
        mavenFa12TokenStorage  = await mavenFa12TokenInstance.storage();
        mavenFa2TokenStorage   = await mavenFa2TokenInstance.storage();

    });

    describe('test: Treasury deposit tests', function() {

        it('test: any user (alice) can deposit mav into treasury', async () => {
            try{        
                
                // Alice transfers 8 XTZ to Treasury
                const depositAmount             = 8;
                const depositAmountMumav        = 8000000;
                const initTreasuryTezBalance    = await utils.tezos.tz.getBalance(treasuryAddress);
                
                await signerFactory(tezos, alice.sk)
                const aliceTransferTezToTreasuryOperation = await utils.tezos.contract.transfer({ to: treasuryAddress, amount: depositAmount});
                await aliceTransferTezToTreasuryOperation.confirmation();

                const treasuryTezBalance        = await utils.tezos.tz.getBalance(treasuryAddress);
                assert.deepEqual(treasuryTezBalance, initTreasuryTezBalance.plus(depositAmountMumav));

            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });

        it('test: any user (alice) can deposit maven FA12 Tokens into treasury', async () => {
            try{        
                
                // Alice transfers 0.8 Maven FA12 Tokens to Treasury
                const depositAmount                         = 800000;
                mavenFa12TokenStorage                      = await mavenFa12TokenInstance.storage();
                var initTreasuryMavenFa12TokenBalance      = await mavenFa12TokenStorage.ledger.get(treasuryAddress);
                initTreasuryMavenFa12TokenBalance          = initTreasuryMavenFa12TokenBalance ? initTreasuryMavenFa12TokenBalance.balance : new BigNumber(0);
        
                await signerFactory(tezos, alice.sk)
                const aliceTransferMavenFa12ToTreasuryOperation = await mavenFa12TokenInstance.methods.transfer(
                    alice.pkh, 
                    treasuryAddress, 
                    depositAmount
                    ).send();
                await aliceTransferMavenFa12ToTreasuryOperation.confirmation();

                mavenFa12TokenStorage                      = await mavenFa12TokenInstance.storage();
                const treasuryMavenFa12TokenBalance        = await mavenFa12TokenStorage.ledger.get(treasuryAddress);

                assert.deepEqual(treasuryMavenFa12TokenBalance.balance, initTreasuryMavenFa12TokenBalance.plus(depositAmount));

            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });

        it('test: any user (alice) can deposit maven FA2 Tokens into treasury', async () => {
            try{        
                
                // Alice transfers 80 Maven FA2 Tokens to Treasury
                const depositAmount = 80000000;
                mavenFa2TokenStorage                       = await mavenFa2TokenInstance.storage();
                var initTreasuryMavenFa2TokenBalance       = await mavenFa2TokenStorage.ledger.get(treasuryAddress);
                initTreasuryMavenFa2TokenBalance           = initTreasuryMavenFa2TokenBalance ? initTreasuryMavenFa2TokenBalance : new BigNumber(0);
        
                await signerFactory(tezos, alice.sk)
                const aliceTransferMavenFa2ToTreasuryOperation = await mavenFa2TokenInstance.methods.transfer([
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
                await aliceTransferMavenFa2ToTreasuryOperation.confirmation();

                mavenFa2TokenStorage                       = await mavenFa2TokenInstance.storage();
                const treasuryMavenFa2TokenBalance         = await mavenFa2TokenStorage.ledger.get(treasuryAddress);

                assert.deepEqual(treasuryMavenFa2TokenBalance, initTreasuryMavenFa2TokenBalance.plus(depositAmount));

            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });

        it('test: any user (alice) can deposit MVN Tokens into treasury', async () => {
            try{        
                
                // Alice transfers 2 MVN Tokens to Treasury
                const depositAmount = MVN(2);
        
                mvnTokenStorage                         = await mvnTokenInstance.storage();
                var initTreasuryMvnTokenBalance         = await mvnTokenStorage.ledger.get(treasuryAddress);
                initTreasuryMvnTokenBalance             = initTreasuryMvnTokenBalance ? initTreasuryMvnTokenBalance : new BigNumber(0);

                await signerFactory(tezos, alice.sk)
                const aliceTransferMavenFa2ToTreasuryOperation = await mvnTokenInstance.methods.transfer([
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
                await aliceTransferMavenFa2ToTreasuryOperation.confirmation();

                mvnTokenStorage                         = await mvnTokenInstance.storage();
                const finalTreasuryMvnTokenBalance      = await mvnTokenStorage.ledger.get(treasuryAddress);

                assert.deepEqual(finalTreasuryMvnTokenBalance, initTreasuryMvnTokenBalance.plus(depositAmount));

            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });

    });

    describe('%transfer', function() {

        before("set user (eve) as whitelist", async() => {
            await signerFactory(tezos, adminSk);
            const adminUpdateWhitelistContractsOperation = await treasuryInstance.methods.updateWhitelistContracts(
                userOne,
                "update"
            ).send();
            await adminUpdateWhitelistContractsOperation.confirmation();

            const treasuryStorage            = await treasuryInstance.storage();
            const treasuryWhitelistContracts = await treasuryStorage.whitelistContracts.get(userOne);
            assert.notStrictEqual(treasuryWhitelistContracts, undefined);
        })

        it('%transfer                 - whitelisted contract (eve) should be able to call this entrypoint and transfer XTZ', async () => {
            try{        
                const to_        = userOne;
                const tokenType  = "tez";
                const amount     = 10000000;

                await signerFactory(tezos, userOneSk);
                const initTreasuryTezBalance    = await utils.tezos.tz.getBalance(treasuryAddress);
                const initUserTezBalance        = await utils.tezos.tz.getBalance(to_);

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
                const transferFee           = adminTransferTezOperation.params.fee
                await adminTransferTezOperation.confirmation();

                const treasuryTezBalance    = await utils.tezos.tz.getBalance(treasuryAddress);
                const userTezBalance        = await utils.tezos.tz.getBalance(to_);
                assert.deepEqual(treasuryTezBalance, initTreasuryTezBalance.minus(amount));
                assert.deepEqual(userTezBalance, initUserTezBalance.plus(amount).minus(transferFee));
                
            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });

        it('%transfer                 - whitelisted contract (eve) should be able to call this entrypoint and transfer FA12', async () => {
            try{        
                
                const to_                               = userOne;
                const amount                            = 10000000;
                const tokenContractAddress              = mavenFa12TokenAddress;
                mavenFa12TokenStorage                  = await mavenFa12TokenInstance.storage();
                var initTreasuryMavenFa12TokenBalance  = await mavenFa12TokenStorage.ledger.get(treasuryAddress);
                initTreasuryMavenFa12TokenBalance      = initTreasuryMavenFa12TokenBalance ? initTreasuryMavenFa12TokenBalance.balance : new BigNumber(0);
                var initUserMavenFa12TokenBalance      = await mavenFa12TokenStorage.ledger.get(to_);
                initUserMavenFa12TokenBalance          = initUserMavenFa12TokenBalance ? initUserMavenFa12TokenBalance.balance : new BigNumber(0);

                await signerFactory(tezos, userOneSk);
                const adminTransferMavenFa12TokenOperation = await treasuryInstance.methods.transfer(
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
                await adminTransferMavenFa12TokenOperation.confirmation();
                mavenFa12TokenStorage                  = await mavenFa12TokenInstance.storage();
                const treasuryMavenFa12TokenBalance    = await mavenFa12TokenStorage.ledger.get(treasuryAddress);
                const userMavenFa12TokenBalance        = await mavenFa12TokenStorage.ledger.get(to_);

                assert.deepEqual(treasuryMavenFa12TokenBalance.balance, initTreasuryMavenFa12TokenBalance.minus(amount));
                assert.deepEqual(userMavenFa12TokenBalance.balance, initUserMavenFa12TokenBalance.plus(amount));

            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });

        it('%transfer                 - whitelisted contract (eve) should be able to call this entrypoint and transfer FA2', async () => {
            try{        

                const to_                    = userOne;
                const amount                 = 10000000;
                const tokenContractAddress   = mavenFa2TokenAddress;
                const tokenId                = 0;

                mavenFa2TokenStorage                   = await mavenFa2TokenInstance.storage();
                var initTreasuryMavenFa2TokenBalance   = await mavenFa2TokenStorage.ledger.get(treasuryAddress);
                initTreasuryMavenFa2TokenBalance       = initTreasuryMavenFa2TokenBalance ? initTreasuryMavenFa2TokenBalance : new BigNumber(0);
                var initUserMavenFa2TokenBalance       = await mavenFa2TokenStorage.ledger.get(to_);
                initUserMavenFa2TokenBalance           = initUserMavenFa2TokenBalance ? initUserMavenFa2TokenBalance : new BigNumber(0);

                await signerFactory(tezos, userOneSk);
                const adminTransferMavenFa2TokenOperation = await treasuryInstance.methods.transfer(
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
                await adminTransferMavenFa2TokenOperation.confirmation();
                mavenFa2TokenStorage               = await mavenFa2TokenInstance.storage();
                const treasuryMavenFa2TokenBalance = await mavenFa2TokenStorage.ledger.get(treasuryAddress);
                const userMavenFa2TokenBalance     = await mavenFa2TokenStorage.ledger.get(to_);

                assert.deepEqual(treasuryMavenFa2TokenBalance, initTreasuryMavenFa2TokenBalance.minus(amount));
                assert.deepEqual(userMavenFa2TokenBalance, initUserMavenFa2TokenBalance.plus(amount));

            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });

        it('%transfer                 - whitelisted contract (eve) should be able to call this entrypoint and transfer MVN', async () => {
            try{        

                const to_                      = oscar.pkh;
                const amount                   = MVN(2);
                const tokenContractAddress     = mvnTokenAddress;
                const tokenId                  = 0;
                
                mvnTokenStorage                     = await mvnTokenInstance.storage();
                const initTreasuryMvnTokenBalance   = await mvnTokenStorage.ledger.get(treasuryAddress);
                const initUserMvnTokenBalance       = await mvnTokenStorage.ledger.get(to_);

                await signerFactory(tezos, userOneSk);
                const adminTransferMavenFa2TokenOperation = await treasuryInstance.methods.transfer(
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
                await adminTransferMavenFa2TokenOperation.confirmation();

                mvnTokenStorage                         = await mvnTokenInstance.storage();
                const finalTreasuryMvnTokenBalance      = await mvnTokenStorage.ledger.get(treasuryAddress);
                const finalUserMvnTokenBalance          = await mvnTokenStorage.ledger.get(to_);

                assert.deepEqual(finalTreasuryMvnTokenBalance, initTreasuryMvnTokenBalance.minus(amount));
                assert.deepEqual(finalUserMvnTokenBalance, initUserMvnTokenBalance.plus(amount));

            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });

        it('%transfer                 - whitelisted contract (eve) should be able to call this entrypoint and transfer batch of XTZ', async () => {
            try{        
                
                const tokenType  = "tez";

                const recipient_one   = mallory.pkh;
                const amount_one      = 20000;

                const recipient_two   = oscar.pkh;
                const amount_two      = 30000;

                const recipient_three = trudy.pkh;
                const amount_three    = 50000;

                const initialRecipientOneTezBalance   = await utils.tezos.tz.getBalance(recipient_one);
                const initialRecipientTwoTezBalance   = await utils.tezos.tz.getBalance(recipient_two);
                const initialRecipientThreeTezBalance = await utils.tezos.tz.getBalance(recipient_three);

                await signerFactory(tezos, userOneSk);
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

                assert.deepEqual(finalRecipientOneTezBalance,   initialRecipientOneTezBalance.plus(amount_one));
                assert.deepEqual(finalRecipientTwoTezBalance,   initialRecipientTwoTezBalance.plus(amount_two));
                assert.deepEqual(finalRecipientThreeTezBalance, initialRecipientThreeTezBalance.plus(amount_three));

                
            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });

        it('%transfer                 - whitelisted contract (eve) should be able to call this entrypoint and transfer batch of FA12', async () => {
            try{        
                
                const tokenType             = "fa12";
                const tokenContractAddress  = mavenFa12TokenAddress;

                const recipient_one   = mallory.pkh;
                const amount_one      = 20000;

                const recipient_two   = oscar.pkh;
                const amount_two      = 30000;

                const recipient_three = trudy.pkh;
                const amount_three    = 50000;

                const mavenFa12TokenStorage           = await mavenFa12TokenInstance.storage();
                const initialRecipientOneAccount     = await mavenFa12TokenStorage.ledger.get(recipient_one);
                const initialRecipientTwoAccount     = await mavenFa12TokenStorage.ledger.get(recipient_two);
                const initialRecipientThreeAccount   = await mavenFa12TokenStorage.ledger.get(recipient_three);

                const initialRecipientOneBalance     = initialRecipientOneAccount   === undefined ? new BigNumber(0) : initialRecipientOneAccount.balance;
                const initialRecipientTwoBalance     = initialRecipientTwoAccount   === undefined ? new BigNumber(0) : initialRecipientTwoAccount.balance;
                const initialRecipientThreeBalance   = initialRecipientThreeAccount === undefined ? new BigNumber(0) : initialRecipientThreeAccount.balance;

                await signerFactory(tezos, userOneSk);
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

                const updatedMavenFa12TokenStorage  = await mavenFa12TokenInstance.storage();
                const finalRecipientOneBalance       = await updatedMavenFa12TokenStorage.ledger.get(recipient_one);
                const finalRecipientTwoBalance       = await updatedMavenFa12TokenStorage.ledger.get(recipient_two);
                const finalRecipientThreeBalance     = await updatedMavenFa12TokenStorage.ledger.get(recipient_three);

                assert.deepEqual(finalRecipientOneBalance.balance,   initialRecipientOneBalance.plus(amount_one));
                assert.deepEqual(finalRecipientTwoBalance.balance,   initialRecipientTwoBalance.plus(amount_two));
                assert.deepEqual(finalRecipientThreeBalance.balance, initialRecipientThreeBalance.plus(amount_three));

            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });

        it('%transfer                 - whitelisted contract (eve) should be able to call this entrypoint and transfer batch of FA2', async () => {
            try{        
                
                const tokenType             = "fa2";
                const tokenContractAddress  = mavenFa2TokenAddress;
                const tokenId               = 0;

                const recipient_one   = mallory.pkh;
                const amount_one      = 2000000;

                const recipient_two   = oscar.pkh;
                const amount_two      = 3000000;

                const recipient_three = trudy.pkh;
                const amount_three    = 5000000;

                const mavenFa2TokenStorage          = await mavenFa2TokenInstance.storage();
                const initialRecipientOneAccount     = await mavenFa2TokenStorage.ledger.get(recipient_one);
                const initialRecipientTwoAccount     = await mavenFa2TokenStorage.ledger.get(recipient_two);
                const initialRecipientThreeAccount   = await mavenFa2TokenStorage.ledger.get(recipient_three);

                const initialRecipientOneBalance     = initialRecipientOneAccount   === undefined ? new BigNumber(0) : initialRecipientOneAccount;
                const initialRecipientTwoBalance     = initialRecipientTwoAccount   === undefined ? new BigNumber(0) : initialRecipientTwoAccount;
                const initialRecipientThreeBalance   = initialRecipientThreeAccount === undefined ? new BigNumber(0) : initialRecipientThreeAccount;

                await signerFactory(tezos, userOneSk);
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

                const updatedMavenFa2TokenStorage   = await mavenFa2TokenInstance.storage();
                const finalRecipientOneBalance       = await updatedMavenFa2TokenStorage.ledger.get(recipient_one);
                const finalRecipientTwoBalance       = await updatedMavenFa2TokenStorage.ledger.get(recipient_two);
                const finalRecipientThreeBalance     = await updatedMavenFa2TokenStorage.ledger.get(recipient_three);

                assert.deepEqual(finalRecipientOneBalance,   initialRecipientOneBalance.plus(amount_one));
                assert.deepEqual(finalRecipientTwoBalance,   initialRecipientTwoBalance.plus(amount_two));
                assert.deepEqual(finalRecipientThreeBalance, initialRecipientThreeBalance.plus(amount_three));

            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });

        it('%transfer                 - whitelisted contract (eve) should be able to call this entrypoint and transfer batch of MVN', async () => {
            try{        
                
                const tokenType             = "fa2";
                const tokenContractAddress  = mvnTokenAddress;
                const tokenId               = 0;

                const recipient_one   = mallory.pkh;
                const amount_one      = 20000;

                const recipient_two   = oscar.pkh;
                const amount_two      = 30000;

                const recipient_three = trudy.pkh;
                const amount_three    = 50000;

                const mvnTokenStorage                = await mvnTokenInstance.storage();
                const initialRecipientOneAccount     = await mvnTokenStorage.ledger.get(recipient_one);
                const initialRecipientTwoAccount     = await mvnTokenStorage.ledger.get(recipient_two);
                const initialRecipientThreeAccount   = await mvnTokenStorage.ledger.get(recipient_three);

                const initialRecipientOneBalance     = initialRecipientOneAccount   === undefined ? new BigNumber(0) : initialRecipientOneAccount;
                const initialRecipientTwoBalance     = initialRecipientTwoAccount   === undefined ? new BigNumber(0) : initialRecipientTwoAccount;
                const initialRecipientThreeBalance   = initialRecipientThreeAccount === undefined ? new BigNumber(0) : initialRecipientThreeAccount;

                await signerFactory(tezos, userOneSk);
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

                const updatedMvnTokenStorage         = await mvnTokenInstance.storage();
                const finalRecipientOneBalance       = await updatedMvnTokenStorage.ledger.get(recipient_one);
                const finalRecipientTwoBalance       = await updatedMvnTokenStorage.ledger.get(recipient_two);
                const finalRecipientThreeBalance     = await updatedMvnTokenStorage.ledger.get(recipient_three);

                assert.deepEqual(finalRecipientOneBalance,   initialRecipientOneBalance.plus(amount_one));
                assert.deepEqual(finalRecipientTwoBalance,   initialRecipientTwoBalance.plus(amount_two));
                assert.deepEqual(finalRecipientThreeBalance, initialRecipientThreeBalance.plus(amount_three));

            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });

        it('%transfer                 - whitelisted contract (eve) should be able to call this entrypoint and transfer batch of FA12, FA2, MVN and XTZ', async () => {
            try{
                const mavenFa12TokenContractAddress  = mavenFa12TokenAddress;

                const mavenFa2TokenContractAddress   = mavenFa2TokenAddress;
                const mavenFa2TokenId                = 0;
                
                const mvnTokenContractAddress       = mvnTokenAddress;
                const mvnTokenId                    = 0;

                // receive tez
                const recipient_one   = isaac.pkh;
                const amount_one      = 20000;

                // receive maven FA12 tokens
                const recipient_two   = oscar.pkh;
                const amount_two      = 30000;

                // receive maven FA2 tokens
                const recipient_three = trudy.pkh;
                const amount_three    = 50000;

                // receive MVN Tokens
                const recipient_four  = david.pkh;
                const amount_four     = 50000;

                const mvnTokenStorage                = await mvnTokenInstance.storage();
                const mavenFa12TokenStorage         = await mavenFa12TokenInstance.storage();
                const mavenFa2TokenStorage          = await mavenFa2TokenInstance.storage();

                const initRecipientOneTezBalance     = await utils.tezos.tz.getBalance(recipient_one);
                const initialRecipientTwoAccount     = await mavenFa12TokenStorage.ledger.get(recipient_two);
                const initialRecipientThreeAccount   = await mavenFa2TokenStorage.ledger.get(recipient_three);
                const initialRecipientFourAccount    = await mvnTokenStorage.ledger.get(recipient_four);

                const initialRecipientTwoBalance     = initialRecipientTwoAccount    === undefined ? new BigNumber(0) : initialRecipientTwoAccount.balance;
                const initialRecipientThreeBalance   = initialRecipientThreeAccount  === undefined ? new BigNumber(0) : initialRecipientThreeAccount;
                const initialRecipientFourBalance    = initialRecipientFourAccount   === undefined ? new BigNumber(0) : initialRecipientFourAccount;

                await signerFactory(tezos, userOneSk);
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
                            "fa12" : mavenFa12TokenContractAddress
                        },
                        "amount" : amount_two
                    },
                    {
                        "to_"    : recipient_three,
                        "token"  : {
                            "fa2" : {
                                "tokenContractAddress" : mavenFa2TokenContractAddress,
                                "tokenId" : mavenFa2TokenId
                            }
                        },
                        "amount" : amount_three
                    },
                    {
                        "to_"    : recipient_four,
                        "token"  : {
                            "fa2" : {
                                "tokenContractAddress" : mvnTokenContractAddress,
                                "tokenId" : mvnTokenId
                            }
                        },
                        "amount" : amount_four
                    }
                ]
                ).send();
                await adminBatchTransferOperation.confirmation();

                const updatedMvnTokenStorage           = await mvnTokenInstance.storage();
                const updatedMavenFa12TokenStorage    = await mavenFa12TokenInstance.storage();
                const updatedMavenFa2TokenStorage     = await mavenFa2TokenInstance.storage();

                const finalRecipientOneTezBalance               = await utils.tezos.tz.getBalance(recipient_one);
                const finalRecipientTwoMavenFa12TokenBalance   = await updatedMavenFa12TokenStorage.ledger.get(recipient_two);
                const finalRecipientThreeMavenFa2TokenBalance  = await updatedMavenFa2TokenStorage.ledger.get(recipient_three);
                const finalRecipientThreeMvnTokenBalance        = await updatedMvnTokenStorage.ledger.get(recipient_four);

                assert.deepEqual(finalRecipientOneTezBalance,   initRecipientOneTezBalance.plus(amount_one));
                assert.deepEqual(finalRecipientTwoMavenFa12TokenBalance.balance,  initialRecipientTwoBalance.plus(amount_two));
                assert.deepEqual(finalRecipientThreeMavenFa2TokenBalance,         initialRecipientThreeBalance.plus(amount_three));
                assert.deepEqual(finalRecipientThreeMvnTokenBalance,               initialRecipientFourBalance.plus(amount_four));

            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });
    })

    describe('%mintMvnAndTransfer', function() {

        it('%mintMvnAndTransfer       - whitelisted contract (eve) should be able to call this entrypoint and mintAndTransfer MVN', async () => {
            try{        
                
                const to_        = userOne;
                const amount     = MVN(2); // 2 MVN

                const mvnTokenStorage           = await mvnTokenInstance.storage();
                const initialBobMvnTokenBalance = await mvnTokenStorage.ledger.get(userOne);


                await signerFactory(tezos, userOneSk);
                const mintMvnAndTransferOperation = await treasuryInstance.methods.mintMvnAndTransfer(
                     to_,
                     amount,
                ).send();
                await mintMvnAndTransferOperation.confirmation();

                const updatedMvnTokenStorage     = await mvnTokenInstance.storage();
                const updatedBobMvnTokenBalance  = await updatedMvnTokenStorage.ledger.get(userOne);

                assert.deepEqual(updatedBobMvnTokenBalance, initialBobMvnTokenBalance.plus(amount));
                

            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });
    });

    describe('%stakeTokens', function() {

        it('%stakeTokens              - admin (bob) should be able to call this entrypoint and stake MVN', async () => {
            try{        
                // Initial values
                await signerFactory(tezos, adminSk);
                doormanStorage                      = await doormanInstance.storage();
                mvnTokenStorage                     = await mvnTokenInstance.storage();
                const initTreasuryMvnTokenBalance   = await mvnTokenStorage.ledger.get(treasuryAddress);
                var initTreasurySMvnTokenBalance    = await doormanStorage.userStakeBalanceLedger.get(treasuryAddress);
                initTreasurySMvnTokenBalance        = initTreasurySMvnTokenBalance ? initTreasurySMvnTokenBalance.balance : new BigNumber(0);
                const stakeAmount                   = MVN(4);

                // Operations
                const stakeOperation                = await treasuryInstance.methods.stakeTokens(
                    contractDeployments.doorman.address,
                    stakeAmount
                ).send();
                await stakeOperation.confirmation();

                // Final values
                mvnTokenStorage                     = await mvnTokenInstance.storage();
                doormanStorage                      = await doormanInstance.storage();
                const finalTreasuryMvnTokenBalance  = await mvnTokenStorage.ledger.get(treasuryAddress);
                const finalTreasurySMvnTokenBalance = await doormanStorage.userStakeBalanceLedger.get(treasuryAddress);

                assert.deepEqual(initTreasuryMvnTokenBalance.minus(stakeAmount), finalTreasuryMvnTokenBalance);
                assert.deepEqual(finalTreasurySMvnTokenBalance.balance, initTreasurySMvnTokenBalance.plus(stakeAmount));

            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });

        it('%stakeTokens              - admin (bob) should not be able to call this entrypoint if the doorman contract is not referenced in the generalContracts map', async () => {
            try{
                // Initial values
                const stakeAmount     = MVN(2);

                // Update config
                await signerFactory(tezos, adminSk);
                var updateGeneralContractOperation = await governanceInstance.methods.updateGeneralContracts("doorman", doormanAddress, 'remove').send();
                await updateGeneralContractOperation.confirmation();

                // Operations
                await signerFactory(tezos, alice.sk);
                await chai.expect(treasuryInstance.methods.stakeTokens(
                    contractDeployments.doorman.address,
                    stakeAmount
                ).send()).to.be.eventually.rejected;

                // Reset config
                await signerFactory(tezos, adminSk);
                var updateGeneralContractOperation = await governanceInstance.methods.updateGeneralContracts("doorman", doormanAddress, 'update').send();
                await updateGeneralContractOperation.confirmation();
            } catch(e){
                console.dir(e, {depth:  5});
            }
        });
    });

    describe('%unstakeTokens', function() {

        it('%unstakeTokens            - admin (bob) should be able to call this entrypoint and unstake MVN', async () => {
            try{        
                // Initial values
                await signerFactory(tezos, adminSk);
                doormanStorage                      = await doormanInstance.storage();
                mvnTokenStorage                     = await mvnTokenInstance.storage();
                const initTreasuryMvnTokenBalance   = await mvnTokenStorage.ledger.get(treasuryAddress);
                const initTreasurySMvnTokenBalance  = await doormanStorage.userStakeBalanceLedger.get(treasuryAddress);
                const unstakeAmount                 = MVN(2);

                // Operations
                const stakeOperation = await treasuryInstance.methods.unstakeTokens(
                    contractDeployments.doorman.address,
                    unstakeAmount
                ).send();
                await stakeOperation.confirmation();

                // Final values
                mvnTokenStorage                     = await mvnTokenInstance.storage();
                const finalTreasuryMvnTokenBalance  = await mvnTokenStorage.ledger.get(treasuryAddress);
                const finalTreasurySMvnTokenBalance = await doormanStorage.userStakeBalanceLedger.get(treasuryAddress);

                assert.notEqual(initTreasuryMvnTokenBalance.toNumber(), finalTreasuryMvnTokenBalance.toNumber());
                assert.notEqual(initTreasurySMvnTokenBalance.balance.toNumber() - unstakeAmount, finalTreasurySMvnTokenBalance.balance.toNumber());

            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });

        it('%unstakeTokens            - admin (bob) should not be able to call this entrypoint if the doorman contract is not referenced in the generalContracts map', async () => {
            try{
                // Initial values
                const unstakeAmount     = MVN(2);

                // Update config
                await signerFactory(tezos, adminSk);
                var updateGeneralContractOperation = await governanceInstance.methods.updateGeneralContracts("doorman", doormanAddress, 'remove').send();
                await updateGeneralContractOperation.confirmation();

                // Operations
                await signerFactory(tezos, alice.sk);
                await chai.expect(treasuryInstance.methods.unstakeTokens(
                    contractDeployments.doorman.address,
                    unstakeAmount
                ).send()).to.be.eventually.rejected;

                // Reset config
                await signerFactory(tezos, adminSk);
                var updateGeneralContractOperation = await governanceInstance.methods.updateGeneralContracts("doorman", doormanAddress, 'update').send();
                await updateGeneralContractOperation.confirmation();
            } catch(e){
                console.dir(e, {depth:  5});
            }
        });
    });

    describe("Housekeeping Entrypoints", async () => {

        beforeEach("Set signer to admin (bob)", async () => {
            treasuryStorage        = await treasuryInstance.storage();
            await signerFactory(tezos, adminSk);
        });

        it('%setAdmin                 - admin (bob) should be able to update the contract admin address', async () => {
            try{
                
                // Initial Values
                treasuryStorage   = await treasuryInstance.storage();
                const currentAdmin  = treasuryStorage.admin;

                // Operation
                setAdminOperation   = await treasuryInstance.methods.setAdmin(userOne).send();
                await setAdminOperation.confirmation();

                // Final values
                treasuryStorage   = await treasuryInstance.storage();
                const newAdmin      = treasuryStorage.admin;

                // Assertions
                assert.notStrictEqual(newAdmin, currentAdmin);
                assert.strictEqual(newAdmin, userOne);
                assert.strictEqual(currentAdmin, admin);

                // reset admin
                await signerFactory(tezos, userOneSk);
                resetAdminOperation = await treasuryInstance.methods.setAdmin(admin).send();
                await resetAdminOperation.confirmation();

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%setGovernance            - admin (bob) should be able to update the contract governance address', async () => {
            try{
                
                // Initial Values
                treasuryStorage       = await treasuryInstance.storage();
                const currentGovernance = treasuryStorage.governanceAddress;

                // Operation
                setGovernanceOperation = await treasuryInstance.methods.setGovernance(userOne).send();
                await setGovernanceOperation.confirmation();

                // Final values
                treasuryStorage       = await treasuryInstance.storage();
                const updatedGovernance = treasuryStorage.governanceAddress;

                // reset governance
                setGovernanceOperation = await treasuryInstance.methods.setGovernance(contractDeployments.governance.address).send();
                await setGovernanceOperation.confirmation();

                // Assertions
                assert.notStrictEqual(updatedGovernance, currentGovernance);
                assert.strictEqual(updatedGovernance, userOne);
                assert.strictEqual(currentGovernance, contractDeployments.governance.address);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%setBaker                 - admin (bob) should be able to update the contract baker', async () => {
            try{
                // Initial Values
                treasuryStorage         = await treasuryInstance.storage();

                // Operation
                setBakerOperation       = await treasuryInstance.methods.setBaker(baker.pkh).send();
                await setBakerOperation.confirmation();

                // Final values
                treasuryStorage         = await treasuryInstance.storage();
                
                // Reset baker
                setBakerOperation       = await treasuryInstance.methods.setBaker(null).send();
                await setBakerOperation.confirmation();
            } catch(e){
                console.dir(e, {depth:  5});
            }
        });

        it('%updateMetadata           - admin (bob) should be able to update the contract metadata', async () => {
            try{
                // Initial values
                const key   = ''
                const hash  = Buffer.from('tezos-storage:data', 'ascii').toString('hex')

                // Operation
                const updateOperation = await treasuryInstance.methods.updateMetadata(key, hash).send();
                await updateOperation.confirmation();

                // Final values
                treasuryStorage       = await treasuryInstance.storage();            

                const updatedData       = await treasuryStorage.metadata.get(key);
                assert.equal(hash, updatedData);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('%updateWhitelistContracts - admin (bob) should be able to add user (alice) to the Whitelisted Contracts map', async () => {
            try {

                // init values
                contractMapKey  = userTwo;
                storageMap      = "whitelistContracts";

                initialContractMapValue           = await getStorageMapValue(treasuryStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await updateWhitelistContracts(treasuryInstance, contractMapKey, 'update');
                await updateWhitelistContractsOperation.confirmation()

                treasuryStorage = await treasuryInstance.storage()
                updatedContractMapValue = await getStorageMapValue(treasuryStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'Eve (key) should not be in the Whitelist Contracts map before adding her to it')
                assert.notStrictEqual(updatedContractMapValue, undefined,  'Eve (key) should be in the Whitelist Contracts map after adding her to it')

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%updateWhitelistContracts - admin (bob) should be able to remove user (alice) from the Whitelisted Contracts map', async () => {
            try {

                // init values
                contractMapKey  = userTwo;
                storageMap      = "whitelistContracts";

                initialContractMapValue = await getStorageMapValue(treasuryStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await updateWhitelistContracts(treasuryInstance, contractMapKey, 'remove');
                await updateWhitelistContractsOperation.confirmation()

                treasuryStorage = await treasuryInstance.storage()
                updatedContractMapValue = await getStorageMapValue(treasuryStorage, storageMap, contractMapKey);

                assert.notStrictEqual(initialContractMapValue, undefined, 'alice (key) should be in the Whitelist Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, undefined, 'alice (key) should not be in the Whitelist Contracts map after adding her to it');

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%updateWhitelistTokenContracts - admin (bob) should be able to add user (alice) to the Whitelisted Contracts map', async () => {
            try {

                // init values
                contractMapKey  = userTwo;
                storageMap      = "whitelistTokenContracts";

                initialContractMapValue           = await getStorageMapValue(treasuryStorage, storageMap, contractMapKey);

                updateWhitelistTokenContractsOperation = await updateWhitelistTokenContracts(treasuryInstance, contractMapKey, 'update');
                await updateWhitelistTokenContractsOperation.confirmation()

                treasuryStorage = await treasuryInstance.storage()
                updatedContractMapValue = await getStorageMapValue(treasuryStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'alice (key) should not be in the Whitelist Contracts map before adding her to it')
                assert.notStrictEqual(updatedContractMapValue, undefined,  'alice (key) should be in the Whitelist Contracts map after adding her to it')

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%updateWhitelistTokenContracts - admin (bob) should be able to remove user (alice) from the Whitelisted Contracts map', async () => {
            try {

                // init values
                contractMapKey  = userTwo;
                storageMap      = "whitelistTokenContracts";

                initialContractMapValue = await getStorageMapValue(treasuryStorage, storageMap, contractMapKey);

                updateWhitelistTokenContractsOperation = await updateWhitelistTokenContracts(treasuryInstance, contractMapKey, 'remove');
                await updateWhitelistTokenContractsOperation.confirmation()

                treasuryStorage = await treasuryInstance.storage()
                updatedContractMapValue = await getStorageMapValue(treasuryStorage, storageMap, contractMapKey);

                assert.notStrictEqual(initialContractMapValue, undefined, 'alice (key) should be in the Whitelist Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, undefined, 'alice (key) should not be in the Whitelist Contracts map after adding her to it');

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%updateGeneralContracts   - admin (bob) should be able to add user (alice) to the General Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "alice";
                storageMap      = "generalContracts";

                initialContractMapValue = await getStorageMapValue(treasuryStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await updateGeneralContracts(treasuryInstance, contractMapKey, userTwo, 'update');
                await updateGeneralContractsOperation.confirmation()

                treasuryStorage = await treasuryInstance.storage()
                updatedContractMapValue = await getStorageMapValue(treasuryStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'alice (key) should not be in the General Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, userTwo, 'alice (key) should be in the General Contracts map after adding her to it');

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%updateGeneralContracts   - admin (bob) should be able to remove user (alice) from the General Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "alice";
                storageMap      = "generalContracts";

                initialContractMapValue = await getStorageMapValue(treasuryStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await updateGeneralContracts(treasuryInstance, contractMapKey, userTwo, 'remove');
                await updateGeneralContractsOperation.confirmation()

                treasuryStorage = await treasuryInstance.storage()
                updatedContractMapValue = await getStorageMapValue(treasuryStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, userTwo, 'alice (key) should be in the General Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, undefined, 'alice (key) should not be in the General Contracts map after adding her to it');

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%pauseAll                 - admin (bob) should be able to pause all entrypoints in the contract', async () => {
            try{
                // Initial Values
                treasuryStorage       = await treasuryInstance.storage();
                for (let [key, value] of Object.entries(treasuryStorage.breakGlassConfig)){
                    assert.equal(value, false);
                }

                // pause all operation
                pauseAllOperation = await treasuryInstance.methods.pauseAll().send();
                await pauseAllOperation.confirmation();

                // Final values
                treasuryStorage       = await treasuryInstance.storage();
                for (let [key, value] of Object.entries(treasuryStorage.breakGlassConfig)){
                    assert.equal(value, true);
                }

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('%unpauseAll               - admin (bob) should be able to unpause all entrypoints in the contract', async () => {
            try{

                // Initial Values
                treasuryStorage = await treasuryInstance.storage();
                for (let [key, value] of Object.entries(treasuryStorage.breakGlassConfig)){
                    assert.equal(value, true);
                }

                // unpause all operation
                unpauseAllOperation = await treasuryInstance.methods.unpauseAll().send();
                await unpauseAllOperation.confirmation();

                // Final values
                treasuryStorage = await treasuryInstance.storage();
                for (let [key, value] of Object.entries(treasuryStorage.breakGlassConfig)){
                    assert.equal(value, false);
                }

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it("%togglePauseEntrypoint    - admin (bob) should be able to call this entrypoint", async() => {
            try{
                
                // pause operations

                pauseOperation = await treasuryInstance.methods.togglePauseEntrypoint("transfer", true).send();
                await pauseOperation.confirmation();
                
                pauseOperation = await treasuryInstance.methods.togglePauseEntrypoint("mintMvnAndTransfer", true).send();
                await pauseOperation.confirmation();

                pauseOperation = await treasuryInstance.methods.togglePauseEntrypoint("stakeTokens", true).send(); 
                await pauseOperation.confirmation();

                pauseOperation = await treasuryInstance.methods.togglePauseEntrypoint("unstakeTokens", true).send(); 
                await pauseOperation.confirmation();

                pauseOperation = await treasuryInstance.methods.togglePauseEntrypoint("updateTokenOperators", true).send(); 
                await pauseOperation.confirmation();

                // update storage
                treasuryStorage              = await treasuryInstance.storage();

                // check that all entrypoints are paused
                for (let [key, value] of Object.entries(treasuryStorage.breakGlassConfig)){
                    assert.equal(value, true);
                }

                // unpause operations

                pauseOperation = await treasuryInstance.methods.togglePauseEntrypoint("transfer", false).send();
                await pauseOperation.confirmation();
                
                pauseOperation = await treasuryInstance.methods.togglePauseEntrypoint("mintMvnAndTransfer", false).send();
                await pauseOperation.confirmation();

                pauseOperation = await treasuryInstance.methods.togglePauseEntrypoint("stakeTokens", false).send(); 
                await pauseOperation.confirmation();

                pauseOperation = await treasuryInstance.methods.togglePauseEntrypoint("unstakeTokens", false).send(); 
                await pauseOperation.confirmation();

                pauseOperation = await treasuryInstance.methods.togglePauseEntrypoint("updateTokenOperators", false).send(); 
                await pauseOperation.confirmation();

                // update storage
                treasuryStorage              = await treasuryInstance.storage();

                // check that all entrypoints are unpaused
                for (let [key, value] of Object.entries(treasuryStorage.breakGlassConfig)){
                    assert.equal(value, false);
                }

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

    });

    describe('Access Control Checks', function () {

        beforeEach("Set signer to non-admin (eve)", async () => {
            treasuryStorage = await treasuryInstance.storage();
            await signerFactory(tezos, userOneSk);
        });

        it('%setAdmin                 - non-admin (eve) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                treasuryStorage   = await treasuryInstance.storage();
                const currentAdmin         = treasuryStorage.admin;

                // Operation
                setAdminOperation = await treasuryInstance.methods.setAdmin(userOne);
                await chai.expect(setAdminOperation.send()).to.be.rejected;

                // Final values
                treasuryStorage   = await treasuryInstance.storage();
                const newAdmin             = treasuryStorage.admin;

                // Assertions
                assert.strictEqual(newAdmin, currentAdmin);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%setGovernance            - non-admin (eve) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                treasuryStorage = await treasuryInstance.storage();
                const currentGovernance  = treasuryStorage.governanceAddress;

                // Operation
                setGovernanceOperation = await treasuryInstance.methods.setGovernance(userOne);
                await chai.expect(setGovernanceOperation.send()).to.be.rejected;

                // Final values
                treasuryStorage = await treasuryInstance.storage();
                const updatedGovernance  = treasuryStorage.governanceAddress;

                // Assertions
                assert.strictEqual(updatedGovernance, currentGovernance);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%setBaker                 - non-admin (eve) should not be able to call this entrypoint', async () => {
            try{
                await signerFactory(tezos, alice.sk);
                await chai.expect(treasuryInstance.methods.setBaker().send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth:  5});
            }
        });

        it('%updateMetadata           - non-admin (eve) should not be able to update the contract metadata', async () => {
            try{
                // Initial values
                const key   = ''
                const hash  = Buffer.from('tezos-storage:data fail', 'ascii').toString('hex')

                treasuryStorage = await treasuryInstance.storage();   
                const initialMetadata    = await treasuryStorage.metadata.get(key);

                // Operation
                const updateOperation = await treasuryInstance.methods.updateMetadata(key, hash);
                await chai.expect(updateOperation.send()).to.be.rejected;

                // Final values
                treasuryStorage = await treasuryInstance.storage();            
                const updatedData        = await treasuryStorage.metadata.get(key);

                // check that there is no change in metadata
                assert.equal(updatedData, initialMetadata);
                assert.notEqual(updatedData, hash);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('%updateWhitelistContracts - non-admin (eve) should not be able to call this entrypoint', async () => {
            try {

                // init values
                contractMapKey  = userTwo;
                storageMap      = "whitelistContracts";

                initialContractMapValue = await getStorageMapValue(treasuryStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await treasuryInstance.methods.updateWhitelistContracts(contractMapKey, 'update')
                await chai.expect(updateWhitelistContractsOperation.send()).to.be.rejected;

                treasuryStorage = await treasuryInstance.storage()
                updatedContractMapValue  = await getStorageMapValue(treasuryStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'eve (key) should not be in the Whitelist Contracts map');

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%updateWhitelistTokenContracts - non-admin (eve) should not be able to call this entrypoint', async () => {
            try {

                // init values
                contractMapKey  = userTwo;
                storageMap      = "whitelistTokenContracts";

                initialContractMapValue = await getStorageMapValue(treasuryStorage, storageMap, contractMapKey);

                updateWhitelistTokenContractsOperation = await treasuryInstance.methods.updateWhitelistTokenContracts(contractMapKey, 'update')
                await chai.expect(updateWhitelistTokenContractsOperation.send()).to.be.rejected;

                treasuryStorage = await treasuryInstance.storage()
                updatedContractMapValue  = await getStorageMapValue(treasuryStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'eve (key) should not be in the Whitelist Token Contracts map');

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%updateGeneralContracts   - non-admin (eve) should not be able to call this entrypoint', async () => {
            try {

                // init values
                contractMapKey  = "alice";
                storageMap      = "generalContracts";

                initialContractMapValue = await getStorageMapValue(treasuryStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await treasuryInstance.methods.updateGeneralContracts(contractMapKey, userTwo, 'update')
                await chai.expect(updateGeneralContractsOperation.send()).to.be.rejected;

                treasuryStorage = await treasuryInstance.storage()
                updatedContractMapValue  = await getStorageMapValue(treasuryStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'eve (key) should not be in the General Contracts map');

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%pauseAll                 - non-admin (eve) should not be able to call this entrypoint", async() => {
            try{

                pauseAllOperation = treasuryInstance.methods.pauseAll(); 
                await chai.expect(pauseAllOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%unpauseAll               - non-admin (eve) should not be able to call this entrypoint", async() => {
            try{

                unpauseAllOperation = treasuryInstance.methods.unpauseAll(); 
                await chai.expect(unpauseAllOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%togglePauseEntrypoint    - non-admin (eve) should not be able to call this entrypoint", async() => {
            try{
                
                // pause operations

                pauseOperation = treasuryInstance.methods.togglePauseEntrypoint("transfer", true); 
                await chai.expect(pauseOperation.send()).to.be.rejected;
                
                pauseOperation = treasuryInstance.methods.togglePauseEntrypoint("mintMvnAndTransfer", true); 
                await chai.expect(pauseOperation.send()).to.be.rejected;

                pauseOperation = treasuryInstance.methods.togglePauseEntrypoint("stakeTokens", true); 
                await chai.expect(pauseOperation.send()).to.be.rejected;

                pauseOperation = treasuryInstance.methods.togglePauseEntrypoint("unstakeTokens", true); 
                await chai.expect(pauseOperation.send()).to.be.rejected;

                // unpause operations

                pauseOperation = treasuryInstance.methods.togglePauseEntrypoint("transfer", false); 
                await chai.expect(pauseOperation.send()).to.be.rejected;
                
                pauseOperation = treasuryInstance.methods.togglePauseEntrypoint("mintMvnAndTransfer", false); 
                await chai.expect(pauseOperation.send()).to.be.rejected;

                pauseOperation = treasuryInstance.methods.togglePauseEntrypoint("stakeTokens", false); 
                await chai.expect(pauseOperation.send()).to.be.rejected;

                pauseOperation = treasuryInstance.methods.togglePauseEntrypoint("unstakeTokens", false); 
                await chai.expect(pauseOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%transfer                 - non-whitelisted contract (admin) should not be able to call this entrypoint and transfer XTZ', async () => {
            try{        
                
                const to_        = userOne;
                const amount     = 100000;
                const tokenType  = "tez"

                await signerFactory(tezos, adminSk);
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

        it('%transfer                 - non-whitelisted contract (admin) should not be able to call this entrypoint and transfer FA12', async () => {
            try{
                const to_                   = userOne;
                const amount                = 100000;
                const tokenContractAddress  = mavenFa12TokenAddress;

                await signerFactory(tezos, adminSk);
                const failTransferMavenFa12TokenOperation = await treasuryInstance.methods.transfer(
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
                await chai.expect(failTransferMavenFa12TokenOperation.send()).to.be.eventually.rejected;

            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });

        it('%transfer                 - non-whitelisted contract (admin) should not be able to call this entrypoint and transfer FA2', async () => {
            try{
                const to_        = userOne;
                const amount     = 100000;
                const tokenContractAddress      = mavenFa12TokenAddress;
                const tokenId    = 0;

                await signerFactory(tezos, adminSk);
                const failTransferMavenFa2TokenOperation = await treasuryInstance.methods.transfer(
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
                await chai.expect(failTransferMavenFa2TokenOperation.send()).to.be.eventually.rejected;

            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });

        it('%transfer                 - non-whitelisted contract (admin) should not be able to call this entrypoint and transfer MVN', async () => {
            try{
                const to_                   = userOne;
                const amount                = MVN(2);
                const tokenContractAddress  = mvnTokenAddress;
                const tokenId               = 0;

                await signerFactory(tezos, adminSk);
                const failTransferMvnTokenOperation = await treasuryInstance.methods.transfer(
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
                await chai.expect(failTransferMvnTokenOperation.send()).to.be.eventually.rejected;
            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });

        it('%mintMvnAndTransfer      - non-whitelisted contract (admin) should not be able to call this entrypoint and mintAndTransfer MVN', async () => {
            try{
                const to_        = userOne;
                const amount     = 100000;

                await signerFactory(tezos, adminSk);
                const failMintMvnAndTransferOperation = await treasuryInstance.methods.mintMvnAndTransfer(
                     to_,
                     amount,
                );
                await chai.expect(failMintMvnAndTransferOperation.send()).to.be.eventually.rejected;

            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });

        it('%stakeTokens             - non-admin (eve) should not be able to call this entrypoint and stake MVN', async () => {
            try{
                // Initial values
                const stakeAmount     = MVN(2);

                // Operations
                await chai.expect(treasuryInstance.methods.stakeTokens(
                    contractDeployments.doorman.address,
                    stakeAmount
                ).send()).to.be.eventually.rejected;
            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });

        it('%unstakeTokens           - non-admin (eve) should not be able to call this entrypoint and stake MVN', async () => {
            try{
                // Initial values
                const unstakeAmount     = MVN(2);

                // Operations
                await chai.expect(treasuryInstance.methods.unstakeTokens(
                    contractDeployments.doorman.address,
                    unstakeAmount
                ).send()).to.be.eventually.rejected;
            } catch(e){
                console.dir(e, {depth:  5});
            } 
        });

        it("%setLambda                - non-admin (eve) should not be able to call this entrypoint", async() => {
            try{

                // random lambda for testing
                const randomLambdaName  = "randomLambdaName";
                const randomLambdaBytes = "050200000cba0743096500000112075e09650000005a036e036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a0362036203620362036200000000036203620760036803690000000009650000000a0362036203620362036e00000000075e09650000006c09650000000a0362036203620362036200000000036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a036203620362036203620000000003620362076003680369000000000362075e07650765036203620362036c075e076507650368036e0362036e036200000000070702000001770743075e076507650368036e0362036e020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c03200342020000010e037a034c037a07430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700002034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f02000000090743036200810303270200000000072f020000000907430362009c0203270200000000070702000000600743036200808080809d8fc0d0bff2f1b26703420200000047037a034c037a0321052900080570000205290015034b031105710002031605700002033a0322072f020000001307430368010000000844495620627920300327020000000003160707020000001a037a037a03190332072c0200000002032002000000020327034f0707020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c032000808080809d8fc0d0bff2f1b2670342020000092d037a057a000505700005037a034c07430362008f03052100020529000f0529000307430359030a034c03190325072c0200000002032702000000020320053d036d05700002072e02000008a4072e020000007c057000030570000405700005057000060570000705200005072e020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000081c072e0200000044057000030570000405700005057000060570000705200005072e0200000010072e02000000020320020000000203200200000010072e020000000203200200000002032002000007cc072e0200000028057000030570000405700005057000060570000705200005072e02000000020320020000000203200200000798072e0200000774034c032003480521000305210003034c052900050316034c03190328072c020000000002000000090743036200880303270570000205210002034c0321052100030521000205290011034c0329072f020000002005290015074303620000074303620000074303620000074303620000054200050200000004034c03200743036200000521000203160319032a072c020000021c052100020521000407430362008e02057000020529000907430368010000000a64656c65676174696f6e034203420521000b034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f0200000009074303620081030327020000001a072f02000000060743035903030200000008032007430359030a074303620000034c072c020000007303200521000205210004034205210007034c0326052100030521000205290008034205700007034c03260521000205290005034c05290007034b0311052100030316033a0521000b034c0322072f02000000130743036801000000084449562062792030032702000000000316034c0316031202000000060570000603200521000305210003034205210008034c0326052100030521000205700004052900030312055000030571000205210003052100030570000405290005031205500005057100020521000305700002052100030570000403160312031205500001034c05210003034c0570000305290013034b031105500013034c02000000060570000503200521000205290015055000080521000205700002052900110570000205700003034c0346034c0350055000110571000205210003052900070743036200000790010000000c746f74616c5f737570706c790362072f020000000907430362008a01032702000000000521000405290007074303620000037703420790010000000b6765745f62616c616e63650362072f02000000090743036200890103270200000000034c052100090743036200a40105210004033a033a0322072f0200000013074303680100000008444956206279203003270200000000031605210009074303620002033a0312052100090521000a07430362008803033a033a0322072f020000001307430368010000000844495620627920300327020000000003160743036200a401034c0322072f0200000013074303680100000008444956206279203003270200000000031605210004033a05210009052100020322072f0200000013074303680100000008444956206279203003270200000000031605210005034b0311052100060570000a052100040322072f0200000013074303680100000008444956206279203003270200000000031605700007052900130312055000130571000507430362008c0305210004052100070342034205210009034c0326032005700005057000030342052100050570000305700002037a034c0570000305700002034b0311074303620000052100020319032a072c020000003b05210002034c057000030322072f02000000130743036801000000084449562062792030032702000000000316057000020529001503120550001502000000080570000205200002057100030521000405210003034c05290011034c0329072f0200000009074303620089030327020000000003210521000507430362008b03057000020316057000020342034205700007034c03260320032105700004057000020316034b031105500001052100040529000707430362000005700003034205210004037705700002037a057000040655055f0765046e000000062566726f6d5f065f096500000026046e0000000425746f5f04620000000925746f6b656e5f696404620000000725616d6f756e7400000000000000042574787300000009257472616e73666572072f0200000008074303620027032702000000000743036a0000053d0765036e055f096500000006036e0362036200000000053d096500000006036e036203620000000005700004057000050570000705420003031b057000040342031b034d0743036200000521000303160319032a072c02000000440521000405210003034205700005034c032605210003052100020570000403160312055000010571000205210005034c0570000505290013034b031105500013057100030200000006057000040320034c052100040529001505500008034c0521000405700004052900110570000305210005034c0346034c03500550001105710002052100030570000207430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700004034c03260655036e0000000e256f6e5374616b654368616e6765072f02000000090743036200b702032702000000000743036a000005700002034d053d036d034c031b034c031b02000000180570000305700004057000050570000605700007052000060200000036057000030570000405700005057000060570000705200005072e0200000010072e0200000002032002000000020320020000000203200342";

                const setLambdaOperation = treasuryInstance.methods.setLambda(randomLambdaName, randomLambdaBytes); 
                await chai.expect(setLambdaOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

    })
});

