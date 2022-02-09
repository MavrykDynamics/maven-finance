const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
const { InMemorySigner, importKey } = require("@taquito/signer");
import { Utils, zeroAddress } from "./helpers/Utils";
import fs from "fs";
import { confirmOperation } from "../scripts/confirmation";

const chai = require("chai");
const assert = require("chai").assert;
const { createHash } = require("crypto")
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

import env from "../env";
import { alice, bob, eve } from "../scripts/sandbox/accounts";

import tokenAddress from '../deployments/mvkTokenAddress.json';
import doormanAddress from '../deployments/doormanAddress.json';

describe("MVK Token", async () => {
    var utils: Utils;

    let tokenInstance;

    let tokenStorage;

    let aliceTokenLedgerBase;
    let bobTokenLedgerBase;
    let eveTokenLedgerBase;

    let totalSupplyBase;

    const signerFactory = async (pk) => {
        await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
        return utils.tezos;
    };

    before("setup", async () => {
        utils = new Utils();
        await utils.init(alice.sk);
        tokenInstance   = await utils.tezos.contract.at(tokenAddress.address);
        tokenStorage    = await tokenInstance.storage();
        console.log('-- -- -- -- -- Token Tests -- -- -- --')
        console.log('Token Contract deployed at:', tokenInstance.address);
        console.log('Alice address: ' + alice.pkh);
        console.log('Bob address: ' + bob.pkh);
        console.log('Eve address: ' + eve.pkh);
    });

    beforeEach("storage", async () => {
        tokenStorage = await tokenInstance.storage();
        aliceTokenLedgerBase  = parseInt(await tokenStorage.ledger.get(alice.pkh));
        bobTokenLedgerBase  = parseInt(await tokenStorage.ledger.get(bob.pkh));
        eveTokenLedgerBase  = parseInt(await tokenStorage.ledger.get(eve.pkh));
        totalSupplyBase = parseInt(await tokenStorage.totalSupply)
        await signerFactory(alice.sk)
    })

    describe('%transfer', function() {
        it('Alice sends 2000MVK to Eve', async () => {
            try{
                const operation = await tokenInstance.methods.transfer([
                    {
                        from_: alice.pkh,
                        txs: [
                            {
                                to_: eve.pkh,
                                token_id: 0,
                                amount: 2000
                            }
                        ]
                    }
                ]).send();
                await operation.confirmation();
                const newTokenStorage = await tokenInstance.storage();
                const aliceTokenLedgerAfter  = await newTokenStorage.ledger.get(alice.pkh);
                const eveTokenLedgerAfter  = await newTokenStorage.ledger.get(eve.pkh);            
                assert.equal(aliceTokenLedgerAfter, aliceTokenLedgerBase - 2000, "Alice MVK Ledger should have "+(aliceTokenLedgerBase - 2000)+"MVK but she has "+aliceTokenLedgerAfter+"MVK")
                assert.equal(eveTokenLedgerAfter, eveTokenLedgerBase + 2000, "Eve MVK Ledger should have "+(eveTokenLedgerBase + 2000)+"MVK but she has "+eveTokenLedgerAfter+"MVK")
            } catch(e){
                console.log(e);
            } 
        });

        it('Alice sends 0MVK to Bob', async () => {
            try{
                const operation = await tokenInstance.methods.transfer([
                    {
                        from_: alice.pkh,
                        txs: [
                            {
                                to_: bob.pkh,
                                token_id: 0,
                                amount: 0
                            }
                        ]
                    }
                ]).send();
                await operation.confirmation();
                const newTokenStorage = await tokenInstance.storage();
                const aliceTokenLedgerAfter  = await newTokenStorage.ledger.get(alice.pkh);
                const bobTokenLedgerAfter  = await newTokenStorage.ledger.get(bob.pkh);            
                assert.equal(aliceTokenLedgerAfter, aliceTokenLedgerBase, "Alice MVK Ledger should have "+aliceTokenLedgerBase+"MVK but she has "+aliceTokenLedgerAfter+"MVK")
                assert.equal(bobTokenLedgerAfter, bobTokenLedgerBase, "Bob MVK Ledger should have "+bobTokenLedgerBase+"MVK but she has "+bobTokenLedgerAfter+"MVK")
            } catch(e){
                console.log(e);
            } 
        });

        it('Alice sends 3000MVK to herself', async () => {
            try{
                const operation = await tokenInstance.methods.transfer([
                    {
                        from_: alice.pkh,
                        txs: [
                            {
                                to_: alice.pkh,
                                token_id: 0,
                                amount: 3000
                            }
                        ]
                    }
                ]).send();
                await operation.confirmation();
                const newTokenStorage = await tokenInstance.storage();
                const aliceTokenLedgerAfter  = await newTokenStorage.ledger.get(alice.pkh);
                assert.equal(aliceTokenLedgerAfter, aliceTokenLedgerBase, "Alice MVK Ledger should have "+aliceTokenLedgerBase+"MVK but she has "+aliceTokenLedgerAfter+"MVK")
            } catch(e){
                console.log(e);
            } 
        });

        it('Alice sends 0MVK to herself', async () => {
            try{
                const operation = await tokenInstance.methods.transfer([
                    {
                        from_: alice.pkh,
                        txs: [
                            {
                                to_: alice.pkh,
                                token_id: 0,
                                amount: 0
                            }
                        ]
                    }
                ]).send();
                await operation.confirmation();
                const newTokenStorage = await tokenInstance.storage();
                const aliceTokenLedgerAfter  = await newTokenStorage.ledger.get(alice.pkh);
                assert.equal(aliceTokenLedgerAfter, aliceTokenLedgerBase, "Alice MVK Ledger should have "+aliceTokenLedgerBase+"MVK but she has "+aliceTokenLedgerAfter+"MVK")
            } catch(e){
                console.log(e);
            } 
        });

        it('Alice sends 250000001MVK to herself', async () => {
            try{
                const operation = await tokenInstance.methods.transfer([
                    {
                        from_: alice.pkh,
                        txs: [
                            {
                                to_: alice.pkh,
                                token_id: 0,
                                amount: 250000001
                            }
                        ]
                    }
                ]).send();
                await operation.confirmation();
            } catch(e){
                const newTokenStorage = await tokenInstance.storage();
                const aliceTokenLedgerAfter  = await newTokenStorage.ledger.get(alice.pkh);
                assert.equal(e.message, 'FA2_INSUFFICIENT_BALANCE', "Alice shouldn't be able to send more than she has")
                assert.equal(aliceTokenLedgerAfter, aliceTokenLedgerBase, "Alice MVK balance shouldn't have changed: "+aliceTokenLedgerAfter+"MVK")
            } 
        });

        it('Alice sends 2000MVK to herself then 20000MVK to Eve then 0MVK to Bob', async () => {
            try{
                const operation = await tokenInstance.methods.transfer([
                    {
                        from_: alice.pkh,
                        txs: [
                            {
                                to_: alice.pkh,
                                token_id: 0,
                                amount: 2000
                            },
                            {
                                to_: eve.pkh,
                                token_id: 0,
                                amount: 20000
                            },
                            {
                                to_: bob.pkh,
                                token_id: 0,
                                amount: 0
                            }
                        ]
                    }
                ]).send();
                await operation.confirmation();
                const newTokenStorage = await tokenInstance.storage();
                const aliceTokenLedgerAfter  = await newTokenStorage.ledger.get(alice.pkh);
                const bobTokenLedgerAfter  = await newTokenStorage.ledger.get(bob.pkh);
                const eveTokenLedgerAfter  = await newTokenStorage.ledger.get(eve.pkh);
                assert.equal(aliceTokenLedgerAfter, aliceTokenLedgerBase - 20000, "Alice MVK Ledger should have "+(aliceTokenLedgerBase - 20000)+"MVK but she has "+aliceTokenLedgerAfter+"MVK")
                assert.equal(bobTokenLedgerAfter, bobTokenLedgerBase, "Bob MVK Ledger should have "+bobTokenLedgerBase+"MVK but she has "+bobTokenLedgerAfter+"MVK")
                assert.equal(eveTokenLedgerAfter, eveTokenLedgerBase + 20000, "Eve MVK Ledger should have "+(eveTokenLedgerBase + 20000)+"MVK but she has "+eveTokenLedgerAfter+"MVK")
            } catch(e){
                console.log(e);
            } 
        });

        it('Alice sends 250000001MVK to Bob', async () => {
            try{
                const operation = await tokenInstance.methods.transfer([
                    {
                        from_: alice.pkh,
                        txs: [
                            {
                                to_: bob.pkh,
                                token_id: 0,
                                amount: 250000001
                            }
                        ]
                    }
                ]).send();
                await operation.confirmation();
            } catch(e){
                const newTokenStorage = await tokenInstance.storage();
                const aliceTokenLedgerAfter  = await newTokenStorage.ledger.get(alice.pkh);
                const bobTokenLedgerAfter  = await newTokenStorage.ledger.get(bob.pkh);
                assert.equal(e.message, 'FA2_INSUFFICIENT_BALANCE', "Alice shouldn't be able to send more than she has")
                assert.equal(aliceTokenLedgerAfter, aliceTokenLedgerBase, "Alice MVK balance shouldn't have changed: "+aliceTokenLedgerAfter+"MVK")
                assert.equal(bobTokenLedgerAfter, bobTokenLedgerBase, "Bob MVK balance shouldn't have changed: "+bobTokenLedgerAfter+"MVK")
            } 
        });

        it('Alice sends 10MVK to Bob and 50MVK to Eve in one transaction', async () => {
            try{
                const operation = await tokenInstance.methods.transfer([{
                    from_: alice.pkh,
                    txs: [
                        {
                            to_: bob.pkh,
                            token_id: 0,
                            amount: 10
                        },
                        {
                            to_: eve.pkh,
                            token_id: 0,
                            amount: 50
                        }
                    ]
                }]).send()
                await operation.confirmation();
    
                const newTokenStorage = await tokenInstance.storage();
                const aliceTokenLedgerAfter  = await newTokenStorage.ledger.get(alice.pkh);
                const bobTokenLedgerAfter  = await newTokenStorage.ledger.get(bob.pkh);
                const eveTokenLedgerAfter  = await newTokenStorage.ledger.get(eve.pkh);
                assert.equal(aliceTokenLedgerAfter, aliceTokenLedgerBase - 60, "Alice MVK Ledger should have " + (aliceTokenLedgerBase - 60) + "MVK but she has "+aliceTokenLedgerAfter+"MVK")
                assert.equal(bobTokenLedgerAfter, bobTokenLedgerBase + 10, "Bob MVK Ledger should have " + (bobTokenLedgerBase + 10) + "MVK but he has "+bobTokenLedgerAfter+"MVK")
                assert.equal(eveTokenLedgerAfter, eveTokenLedgerBase + 50, "Eve MVK Ledger should have " + (eveTokenLedgerBase + 50) + "MVK but she has "+eveTokenLedgerAfter+"MVK")
            } catch(e){
                console.log(e);
            } 
        });

        it('Bob sends 0MVK to Eve', async () => {
            try{
                await signerFactory(bob.sk)
                const operation = await tokenInstance.methods.transfer([{
                    from_: bob.pkh,
                    txs: [
                        {
                            to_: eve.pkh,
                            token_id: 0,
                            amount: 0
                        }
                    ]
                }]).send()
                await operation.confirmation();
    
                const newTokenStorage = await tokenInstance.storage();
                const bobTokenLedgerAfter  = await newTokenStorage.ledger.get(bob.pkh);
                const eveTokenLedgerAfter  = await newTokenStorage.ledger.get(eve.pkh);            
                assert.equal(bobTokenLedgerAfter, bobTokenLedgerBase, "Alice MVK balance shouldn't have changed: "+bobTokenLedgerAfter+"MVK")
                assert.equal(eveTokenLedgerAfter, eveTokenLedgerBase, "Bob MVK balance shouldn't have changed: "+eveTokenLedgerAfter+"MVK")
            } catch(e){
                console.log(e);
            } 
        });

        it('Bob sends a 100 token from an id that is not supported in the contract to Alice ', async () => {
            try{
                await signerFactory(bob.sk)
                const operation = await tokenInstance.methods.transfer([{
                    from_: bob.pkh,
                    txs: [
                        {
                            to_: alice.pkh,
                            token_id: 1,
                            amount: 100
                        }
                    ]
                }]).send()
                await operation.confirmation();
            } catch(e){
                const newTokenStorage = await tokenInstance.storage();
                const aliceTokenLedgerAfter  = await newTokenStorage.ledger.get(alice.pkh);
                const bobTokenLedgerAfter  = await newTokenStorage.ledger.get(bob.pkh);
                assert.equal(e.message, 'FA2_TOKEN_UNDEFINED', "Bob shouldn't be able to send a token from an id that does not exist on the contract")
                assert.equal(aliceTokenLedgerAfter, aliceTokenLedgerBase, "Alice MVK balance shouldn't have changed: "+aliceTokenLedgerAfter+"MVK")
                assert.equal(bobTokenLedgerAfter, bobTokenLedgerBase, "Bob MVK balance shouldn't have changed: "+bobTokenLedgerAfter+"MVK")
            } 
        });

        it('Alice sends 2000MVK to Bob then 250000001MVK to him again', async () => {
            try{
                const operation = await tokenInstance.methods.transfer([
                    {
                        from_: alice.pkh,
                        txs: [
                            {
                                to_: bob.pkh,
                                token_id: 0,
                                amount: 2000
                            },
                            {
                                to_: bob.pkh,
                                token_id: 0,
                                amount: 250000001
                            }
                        ]
                    }
                ]).send();
                await operation.confirmation();
            } catch(e){
                const newTokenStorage = await tokenInstance.storage();
                const aliceTokenLedgerAfter  = await newTokenStorage.ledger.get(alice.pkh);
                const bobTokenLedgerAfter  = await newTokenStorage.ledger.get(bob.pkh);
                assert.equal(e.message, 'FA2_INSUFFICIENT_BALANCE', "Alice shouldn't be able to send more than she has")
                assert.equal(aliceTokenLedgerAfter, aliceTokenLedgerBase, "Alice MVK balance shouldn't have changed: "+aliceTokenLedgerAfter+"MVK")
                assert.equal(bobTokenLedgerAfter, bobTokenLedgerBase, "Bob MVK balance shouldn't have changed: "+bobTokenLedgerAfter+"MVK")
            } 
        });

        it('Alice uses Eve address to transfer 200MVK to her and Bob address to transfer 35MVK to Eve without being one of Eve operators', async () => {
            try{
                const operation = await tokenInstance.methods.transfer([
                    {
                        from_: eve.pkh,
                        txs: [
                            {
                                to_: alice.pkh,
                                token_id: 0,
                                amount: 200
                            }
                        ]
                    },
                    {
                        from_: bob.pkh,
                        txs: [
                            {
                                to_: eve.pkh,
                                token_id: 0,
                                amount: 35
                            }
                        ]
                    }
                ]).send();
                await operation.confirmation();
            } catch(e){
                const newTokenStorage = await tokenInstance.storage();
                const aliceTokenLedgerAfter  = await newTokenStorage.ledger.get(alice.pkh);
                const bobTokenLedgerAfter  = await newTokenStorage.ledger.get(bob.pkh);
                const eveTokenLedgerAfter  = await newTokenStorage.ledger.get(eve.pkh);    
                assert.equal(e.message, 'FA2_NOT_OPERATOR', "Alice isn't the operator of Bob and Eve");
                assert.equal(aliceTokenLedgerAfter, aliceTokenLedgerBase, "Alice MVK balance shouldn't have changed: "+aliceTokenLedgerAfter+"MVK")
                assert.equal(bobTokenLedgerAfter, bobTokenLedgerBase, "Bob MVK balance shouldn't have changed: "+bobTokenLedgerAfter+"MVK")
                assert.equal(eveTokenLedgerAfter, eveTokenLedgerBase, "Eve MVK balance shouldn't have changed: "+eveTokenLedgerAfter+"MVK")
            } 
        });

        it('Bob become an operator on Alice address and send 200MVK from Alice Address to Eve', async () => {
            try{
                const updateOperatorsOperation = await tokenInstance.methods.update_operators([
                    {
                        add_operator: {
                            owner: alice.pkh,
                            operator: bob.pkh,
                            token_id: 0
                        }
                    }
                ]).send()
                await updateOperatorsOperation.confirmation();

                await signerFactory(bob.sk)
                const transferOperation = await tokenInstance.methods.transfer(
                    [
                        {
                            from_: alice.pkh,
                            txs: [
                                {
                                    to_: eve.pkh,
                                    token_id: 0,
                                    amount: 200
                                }
                            ]
                        }
                    ]
                ).send()
                await transferOperation.confirmation();
                const newTokenStorage = await tokenInstance.storage();
                const aliceTokenLedgerAfter  = await newTokenStorage.ledger.get(alice.pkh);
                const bobTokenLedgerAfter  = await newTokenStorage.ledger.get(bob.pkh);
                const eveTokenLedgerAfter  = await newTokenStorage.ledger.get(eve.pkh);    
                assert.equal(aliceTokenLedgerAfter, aliceTokenLedgerBase - 200, "Alice MVK Ledger should have " + (aliceTokenLedgerBase - 200) + "MVK but she has "+aliceTokenLedgerAfter+"MVK")
                assert.equal(bobTokenLedgerAfter, bobTokenLedgerBase, "Bob MVK balance shouldn't have changed: "+bobTokenLedgerAfter+"MVK")
                assert.equal(eveTokenLedgerAfter, eveTokenLedgerBase + 200, "Eve MVK Ledger should have " + (eveTokenLedgerBase + 200) + "MVK but she has "+eveTokenLedgerAfter+"MVK")
            } catch(e){
                console.log(e)
            } 
        });

        it('Bob is removed from Alice operators and send 200MVK from Alice Address to Eve', async () => {
            try{
                const updateOperatorsOperation = await tokenInstance.methods.update_operators([
                    {
                        remove_operator: {
                            owner: alice.pkh,
                            operator: bob.pkh,
                            token_id: 0
                        }
                    }
                ]).send()
                await updateOperatorsOperation.confirmation();

                await signerFactory(bob.sk)
                const transferOperation = await tokenInstance.methods.transfer(
                    [
                        {
                            from_: alice.pkh,
                            txs: [
                                {
                                    to_: eve.pkh,
                                    token_id: 0,
                                    amount: 200
                                }
                            ]
                        }
                    ]
                ).send()
                await transferOperation.confirmation();
            } catch(e){
                const newTokenStorage = await tokenInstance.storage();
                const aliceTokenLedgerAfter  = await newTokenStorage.ledger.get(alice.pkh);
                const bobTokenLedgerAfter  = await newTokenStorage.ledger.get(bob.pkh);
                const eveTokenLedgerAfter  = await newTokenStorage.ledger.get(eve.pkh);
                assert.equal(e.message, 'FA2_NOT_OPERATOR', "Bob isn't the operator of Alice");  
                assert.equal(aliceTokenLedgerAfter, aliceTokenLedgerBase, "Alice MVK balance shouldn't have changed: "+aliceTokenLedgerAfter+"MVK")
                assert.equal(bobTokenLedgerAfter, bobTokenLedgerBase, "Bob MVK balance shouldn't have changed: "+bobTokenLedgerAfter+"MVK")
                assert.equal(eveTokenLedgerAfter, eveTokenLedgerBase, "Eve MVK balance shouldn't have changed: "+eveTokenLedgerAfter+"MVK")
            }
        });

        it('Alice become an operator on Bob and Eve addresses and send 300MVK from their account to her account', async () => {
            try{
                await signerFactory(bob.sk)
                const updateOperatorsOperationBobAdd = await tokenInstance.methods.update_operators([
                    {
                        add_operator: {
                            owner: bob.pkh,
                            operator: alice.pkh,
                            token_id: 0
                        }
                    }
                ]).send()
                await updateOperatorsOperationBobAdd.confirmation();
                await signerFactory(eve.sk)
                const updateOperatorsOperationEveAdd = await tokenInstance.methods.update_operators([
                    {
                        add_operator: {
                            owner: eve.pkh,
                            operator: alice.pkh,
                            token_id: 0
                        }
                    }
                ]).send()
                await updateOperatorsOperationEveAdd.confirmation();
                await signerFactory(bob.sk)
                const updateOperatorsOperationBobRemove = await tokenInstance.methods.update_operators([
                    {
                        remove_operator: {
                            owner: bob.pkh,
                            operator: alice.pkh,
                            token_id: 0
                        }
                    }
                ]).send()
                await updateOperatorsOperationBobRemove.confirmation();
                await signerFactory(eve.sk)
                const updateOperatorsOperationEveRemove = await tokenInstance.methods.update_operators([
                    {
                        remove_operator: {
                            owner: eve.pkh,
                            operator: alice.pkh,
                            token_id: 0
                        }
                    }
                ]).send()
                await updateOperatorsOperationEveRemove.confirmation();
            } catch(e) {
                console.log(e)
            }
        });
    })

    describe('%update_operators', function() {
        it('Alice makes Bob one of her operators then Bob sends 200MVK from Alice to himself', async () => {
            try{
                const updateOperatorsOperationBobAdd = await tokenInstance.methods.update_operators([
                    {
                        add_operator: {
                            owner: alice.pkh,
                            operator: bob.pkh,
                            token_id: 0
                        }
                    }
                ]).send()
                await updateOperatorsOperationBobAdd.confirmation();

                const newTokenStorageOperator = await tokenInstance.storage();
                const operator = await newTokenStorageOperator['operators'].get({
                    0: alice.pkh,
                    1: bob.pkh,
                    2: 0
                })

                assert.notStrictEqual(operator,undefined,"The operator should appear in the operators bigmap in the storage")

                await signerFactory(bob.sk)
                const transferOperation = await tokenInstance.methods.transfer([
                    {
                        from_: alice.pkh,
                        txs: [
                            {
                                to_: bob.pkh,
                                token_id: 0,
                                amount: 200
                            }
                        ]
                    }
                ]).send();
                await transferOperation.confirmation();
                const newTokenStorageTransfer = await tokenInstance.storage();
                const bobTokenLedgerAfter  = await newTokenStorageTransfer.ledger.get(bob.pkh);
                const aliceTokenLedgerAfter  = await newTokenStorageTransfer.ledger.get(alice.pkh);

                assert.equal(bobTokenLedgerAfter, bobTokenLedgerBase + 200, "Bob MVK Ledger should have "+(bobTokenLedgerBase + 200)+"MVK but he has "+aliceTokenLedgerAfter+"MVK")
                assert.equal(aliceTokenLedgerAfter, aliceTokenLedgerBase - 200, "Alice MVK Ledger should have "+(aliceTokenLedgerBase - 200)+"MVK but she has "+aliceTokenLedgerAfter+"MVK")
            } catch(e){
                console.log(e);
            } 
        });

        it('Alice removes Bob from her operators then Bob sends 200MVK from Alice to himself', async () => {
            try{
                const updateOperatorsOperationBobRemove = await tokenInstance.methods.update_operators([
                    {
                        remove_operator: {
                            owner: alice.pkh,
                            operator: bob.pkh,
                            token_id: 0
                        }
                    }
                ]).send()
                
                await updateOperatorsOperationBobRemove.confirmation();
                const newTokenStorage = await tokenInstance.storage();
                const operator = await newTokenStorage['operators'].get({
                    0: alice.pkh,
                    1: bob.pkh,
                    2: 0
                })

                assert.strictEqual(operator,undefined,"The operator should not appear in the operators bigmap in the storage")

                await signerFactory(bob.sk)
                const transferOperation = await tokenInstance.methods.transfer([
                    {
                        from_: alice.pkh,
                        txs: [
                            {
                                to_: bob.pkh,
                                token_id: 0,
                                amount: 200
                            }
                        ]
                    }
                ]).send();
                await transferOperation.confirmation();
            } catch(e){
                const newTokenStorageTransfer = await tokenInstance.storage();
                const bobTokenLedgerAfter  = await newTokenStorageTransfer.ledger.get(bob.pkh);
                const aliceTokenLedgerAfter  = await newTokenStorageTransfer.ledger.get(alice.pkh);
                assert.equal(e.message, 'FA2_NOT_OPERATOR', "Bob isn't the operator of Alice");
                assert.equal(bobTokenLedgerAfter, bobTokenLedgerBase, "Bob MVK balance shouldn't have changed: "+bobTokenLedgerAfter+"MVK")
                assert.equal(aliceTokenLedgerAfter, aliceTokenLedgerBase, "Alice MVK balance shouldn't have changed: "+aliceTokenLedgerAfter+"MVK")
            } 
        });

        it('Alice makes Bob one of her operators, removes his address in one transaction then Bob sends 200MVK from Alice to himself', async () => {
            try{
                const updateOperatorsOperationBobAdd = await tokenInstance.methods.update_operators([
                    {
                        add_operator: {
                            owner: alice.pkh,
                            operator: bob.pkh,
                            token_id: 0
                        }
                    },
                    {
                        remove_operator: {
                            owner: alice.pkh,
                            operator: bob.pkh,
                            token_id: 0
                        }
                    }
                ]).send()
                await updateOperatorsOperationBobAdd.confirmation();
                const newTokenStorage = await tokenInstance.storage();
                const operator = await newTokenStorage['operators'].get({
                    0: alice.pkh,
                    1: bob.pkh,
                    2: 0
                })

                assert.strictEqual(operator,undefined,"The operator should not appear in the operator list in the storage")

                await signerFactory(bob.sk)
                const transferOperation = await tokenInstance.methods.transfer([
                    {
                        from_: alice.pkh,
                        txs: [
                            {
                                to_: bob.pkh,
                                token_id: 0,
                                amount: 200
                            }
                        ]
                    }
                ]).send();
                await transferOperation.confirmation();
            } catch(e){
                const newTokenStorageTransfer = await tokenInstance.storage();
                const bobTokenLedgerAfter  = await newTokenStorageTransfer.ledger.get(bob.pkh);
                const aliceTokenLedgerAfter  = await newTokenStorageTransfer.ledger.get(alice.pkh);
                assert.equal(e.message, 'FA2_NOT_OPERATOR', "Bob isn't the operator of Alice");
                assert.equal(bobTokenLedgerAfter, bobTokenLedgerBase, "Bob MVK balance shouldn't have changed: "+bobTokenLedgerAfter+"MVK")
                assert.equal(aliceTokenLedgerAfter, aliceTokenLedgerBase, "Alice MVK balance shouldn't have changed: "+aliceTokenLedgerAfter+"MVK")
            } 
        });

        it('Alice makes Bob one of her operators, removes his address in one transaction then adds it again  then Bob sends 200MVK from Alice to himself', async () => {
            try{
                const updateOperatorsOperationBobAdd = await tokenInstance.methods.update_operators([
                    {
                        add_operator: {
                            owner: alice.pkh,
                            operator: bob.pkh,
                            token_id: 0
                        }
                    },
                    {
                        remove_operator: {
                            owner: alice.pkh,
                            operator: bob.pkh,
                            token_id: 0
                        }
                    },
                    {
                        add_operator: {
                            owner: alice.pkh,
                            operator: bob.pkh,
                            token_id: 0
                        }
                    }
                ]).send()
                await updateOperatorsOperationBobAdd.confirmation();
                const newTokenStorage = await tokenInstance.storage();
                const operator = await newTokenStorage['operators'].get({
                    0: alice.pkh,
                    1: bob.pkh,
                    2: 0
                })

                assert.notStrictEqual(operator,undefined,"The operator should appear in the operator bigmap in the storage")

                await signerFactory(bob.sk)
                const transferOperation = await tokenInstance.methods.transfer([
                    {
                        from_: alice.pkh,
                        txs: [
                            {
                                to_: bob.pkh,
                                token_id: 0,
                                amount: 200
                            }
                        ]
                    }
                ]).send();
                await transferOperation.confirmation();
                const newTokenStorageTransfer = await tokenInstance.storage();
                const bobTokenLedgerAfter  = await newTokenStorageTransfer.ledger.get(bob.pkh);
                const aliceTokenLedgerAfter  = await newTokenStorageTransfer.ledger.get(alice.pkh);

                assert.equal(bobTokenLedgerAfter, bobTokenLedgerBase + 200, "Bob MVK Ledger should have "+(bobTokenLedgerBase + 200)+"MVK but he has "+aliceTokenLedgerAfter+"MVK")
                assert.equal(aliceTokenLedgerAfter, aliceTokenLedgerBase - 200, "Alice MVK Ledger should have "+(aliceTokenLedgerBase - 200)+"MVK but she has "+aliceTokenLedgerAfter+"MVK")
            } catch(e){
                console.log(e);
            } 
        });

        it('Bob sets himself as an operator for Eve', async () => {
            try{
                await signerFactory(bob.sk)
                const updateOperatorsOperationEveAdd = await tokenInstance.methods.update_operators([
                    {
                        remove_operator: {
                            owner: eve.pkh,
                            operator: bob.pkh,
                            token_id: 0
                        }
                    }
                ]).send()
                await updateOperatorsOperationEveAdd.confirmation();
            } catch(e){
                assert.equal(e.message, 'FA2_NOT_OWNER', "Bob isn't the owner of Eve account so he cannot add operators to it");
            } 
        });
    })

    describe('%mint', function() {
        it('Alice tries to mint 20000MVK on Bob address without being whitelisted', async () => {
            try{
                const mintBobOperation = await tokenInstance.methods.mint(bob.pkh,20000).send()
                await mintBobOperation.confirmation();
            } catch(e){
                const newTokenStorage = await tokenInstance.storage();
                const aliceTokenLedgerAfter  = await newTokenStorage.ledger.get(alice.pkh);
                const bobTokenLedgerAfter  = await newTokenStorage.ledger.get(bob.pkh);
                const totalSupplyAfter = await newTokenStorage.totalSupply;
                assert.equal(e.message, 'ONLY_WHITELISTED_CONTRACTS_ALLOWED', "Alice address isn't in the withelistContracts map");
                assert.equal(aliceTokenLedgerAfter, aliceTokenLedgerBase, "Alice MVK balance shouldn't have changed: "+aliceTokenLedgerAfter+"MVK")
                assert.equal(bobTokenLedgerAfter, bobTokenLedgerBase, "Bob MVK balance shouldn't have changed: "+bobTokenLedgerAfter+"MVK")
                assert.equal(totalSupplyAfter, totalSupplyBase, "MVK Total Supply shouldn't have changed: "+totalSupplyAfter+"MVK")
            }
        });
        it('Alice tries to mint 20000MVK on Bob address being whitelisted', async () => {
            try{
                const whitelistAliceOperationAdd = await tokenInstance.methods.updateWhitelistContracts('alice', alice.pkh).send();
                await whitelistAliceOperationAdd.confirmation();

                const mintBob = await tokenInstance.methods.mint(bob.pkh,20000).send()
                await mintBob.confirmation();

                const whitelistAliceOperationRemove = await tokenInstance.methods.updateWhitelistContracts('alice', alice.pkh).send();
                await whitelistAliceOperationRemove.confirmation();

                const newTokenStorage = await tokenInstance.storage();
                const aliceTokenLedgerAfter  = await newTokenStorage.ledger.get(alice.pkh);
                const bobTokenLedgerAfter  = await newTokenStorage.ledger.get(bob.pkh);
                const totalSupplyAfter = await newTokenStorage.totalSupply;

                assert.equal(aliceTokenLedgerAfter, aliceTokenLedgerBase, "Alice MVK balance shouldn't have changed: "+aliceTokenLedgerAfter+"MVK")
                assert.equal(bobTokenLedgerAfter, bobTokenLedgerBase + 20000, "Bob MVK Ledger should have "+(bobTokenLedgerBase + 20000)+"MVK but he has "+bobTokenLedgerAfter+"MVK")
                assert.equal(totalSupplyAfter, totalSupplyBase + 20000, "MVK total supply should have increased by 20000MVK. Current supply: "+totalSupplyBase+"MVK")
            } catch(e){
                console.log(e)
            }
        });

        it('Alice tries to mint 20000MVK on Bob address being whitelisted and sending 1XTZ in the process', async () => {
            try{
                const whitelistAliceOperationAdd = await tokenInstance.methods.updateWhitelistContracts('alice', alice.pkh).send();
                await whitelistAliceOperationAdd.confirmation();

                const mintBob = await tokenInstance.methods.mint(bob.pkh,20000).send({amount: 5})
                await mintBob.confirmation();

                const whitelistAliceOperationRemove = await tokenInstance.methods.updateWhitelistContracts('alice', alice.pkh).send();
                await whitelistAliceOperationRemove.confirmation();
            } catch(e){
                console.log(e)
                assert.equal(e.message, 'THIS_ENTRYPOINT_SHOULD_NOT_RECEIVE_XTZ', "This entrypoint should not receive XTZ");
            }
        });
    })

    describe('%burn', function() {
        it('Alice tries to burn 20000MVK on Bob address without being whitelisted', async () => {
            try{
                const burnBobOperation = await tokenInstance.methods.burn(bob.pkh,20000).send()
                await burnBobOperation.confirmation();
            } catch(e){
                const newTokenStorage = await tokenInstance.storage();
                const aliceTokenLedgerAfter  = await newTokenStorage.ledger.get(alice.pkh);
                const bobTokenLedgerAfter  = await newTokenStorage.ledger.get(bob.pkh);
                const totalSupplyAfter = await newTokenStorage.totalSupply;  
                assert.equal(e.message, 'ONLY_DOORMAN_CONTRACT_ALLOWED', "Alice address isn't the doorman contract map");
                assert.equal(aliceTokenLedgerAfter, aliceTokenLedgerBase, "Alice MVK balance shouldn't have changed: "+aliceTokenLedgerAfter+"MVK")
                assert.equal(bobTokenLedgerAfter, bobTokenLedgerBase, "Bob MVK balance shouldn't have changed: "+bobTokenLedgerAfter+"MVK")
                assert.equal(totalSupplyAfter, totalSupplyBase, "MVK Total Supply shouldn't have changed: "+totalSupplyAfter+"MVK")
            }
        });
        
        it('Alice tries to burn 20000MVK on Bob address being whitelisted', async () => {
            try{
                const whitelistAliceOperationAdd = await tokenInstance.methods.updateWhitelistContracts('alice', alice.pkh).send();
                await whitelistAliceOperationAdd.confirmation();

                const mintBob = await tokenInstance.methods.burn(bob.pkh,20000).send()
                await mintBob.confirmation();

                const whitelistAliceOperationRemove = await tokenInstance.methods.updateWhitelistContracts('alice', alice.pkh).send();
                await whitelistAliceOperationRemove.confirmation();
            } catch(e){
                const newTokenStorage = await tokenInstance.storage();
                const aliceTokenLedgerAfter  = await newTokenStorage.ledger.get(alice.pkh);
                const bobTokenLedgerAfter  = await newTokenStorage.ledger.get(bob.pkh);
                const totalSupplyAfter = await newTokenStorage.totalSupply;  
                assert.equal(e.message, 'ONLY_DOORMAN_CONTRACT_ALLOWED', "Alice address isn't the doorman contract map");
                assert.equal(aliceTokenLedgerAfter, aliceTokenLedgerBase, "Alice MVK balance shouldn't have changed: "+aliceTokenLedgerAfter+"MVK")
                assert.equal(bobTokenLedgerAfter, bobTokenLedgerBase, "Bob MVK balance shouldn't have changed: "+bobTokenLedgerAfter+"MVK")
                assert.equal(totalSupplyAfter, totalSupplyBase, "MVK Total Supply shouldn't have changed: "+totalSupplyAfter+"MVK")
            }
        });

        it('Alice tries to burn 20000MVK on Bob address being the doorman contract', async () => {
            try{
                const generalContractsOperationSet = await tokenInstance.methods.updateGeneralContracts('doorman', alice.pkh).send();
                await generalContractsOperationSet.confirmation();

                const mintBob = await tokenInstance.methods.burn(bob.pkh,20000).send()
                await mintBob.confirmation();

                const generalContractsOperationReset = await tokenInstance.methods.updateGeneralContracts('doorman', doormanAddress.address).send();
                await generalContractsOperationReset.confirmation();

                const newTokenStorage = await tokenInstance.storage();
                const aliceTokenLedgerAfter  = await newTokenStorage.ledger.get(alice.pkh);
                const bobTokenLedgerAfter  = await newTokenStorage.ledger.get(bob.pkh);
                const totalSupplyAfter = await newTokenStorage.totalSupply;
                assert.equal(aliceTokenLedgerAfter, aliceTokenLedgerBase, "Alice MVK balance shouldn't have changed: "+aliceTokenLedgerAfter+"MVK")
                assert.equal(bobTokenLedgerAfter, bobTokenLedgerBase - 20000, "Bob MVK Ledger should have "+(bobTokenLedgerBase - 20000)+"MVK but he has "+bobTokenLedgerAfter+"MVK")
                assert.equal(totalSupplyAfter, totalSupplyBase - 20000, "MVK total supply should have decrease by 20000MVK. Current supply: "+totalSupplyBase+"MVK")
            } catch(e){
                console.log(e)
            }
        });

        it('Alice tries to burn 2500000001MVK on Bob address being the doorman contract', async () => {
            try{
                const generalContractsOperationSet = await tokenInstance.methods.updateGeneralContracts('doorman', alice.pkh).send();
                await generalContractsOperationSet.confirmation();

                const mintBob = await tokenInstance.methods.burn(bob.pkh,2500000001).send()
                await mintBob.confirmation();

                const generalContractsOperationReset = await tokenInstance.methods.updateGeneralContracts('doorman', doormanAddress.address).send();
                await generalContractsOperationReset.confirmation();
            } catch(e){
                const newTokenStorage = await tokenInstance.storage();
                const aliceTokenLedgerAfter  = await newTokenStorage.ledger.get(alice.pkh);
                const bobTokenLedgerAfter  = await newTokenStorage.ledger.get(bob.pkh);
                const totalSupplyAfter = await newTokenStorage.totalSupply;
                assert.equal(e.message, 'FA2_INSUFFICIENT_BALANCE', "Alice address isn't in the whitelistContracts map");
                assert.equal(aliceTokenLedgerAfter, aliceTokenLedgerBase, "Alice MVK balance shouldn't have changed: "+aliceTokenLedgerAfter+"MVK")
                assert.equal(bobTokenLedgerAfter, bobTokenLedgerBase, "Bob MVK balance shouldn't have changed: "+bobTokenLedgerAfter+"MVK")
                assert.equal(totalSupplyAfter, totalSupplyBase, "MVK Total Supply shouldn't have changed: "+totalSupplyAfter+"MVK")
            }
        });

        it('Alice tries to burn 20000MVK on Bob address being the doorman contract and sending 1XTZ in the process', async () => {
            try{
                const generalContractsOperationSet = await tokenInstance.methods.updateGeneralContracts('doorman', alice.pkh).send();
                await generalContractsOperationSet.confirmation();

                const mintBob = await tokenInstance.methods.burn(bob.pkh,20000).send({amount: 1})
                await mintBob.confirmation();

                const generalContractsOperationReset = await tokenInstance.methods.updateGeneralContracts('doorman', doormanAddress.address).send();
                await generalContractsOperationReset.confirmation();
            } catch(e){
                const newTokenStorage = await tokenInstance.storage();
                const aliceTokenLedgerAfter  = await newTokenStorage.ledger.get(alice.pkh);
                const bobTokenLedgerAfter  = await newTokenStorage.ledger.get(bob.pkh);
                const totalSupplyAfter = await newTokenStorage.totalSupply;
                assert.equal(e.message, 'THIS_ENTRYPOINT_SHOULD_NOT_RECEIVE_XTZ', "This entrypoint should not receive XTZ");
                assert.equal(aliceTokenLedgerAfter, aliceTokenLedgerBase, "Alice MVK balance shouldn't have changed: "+aliceTokenLedgerAfter+"MVK")
                assert.equal(bobTokenLedgerAfter, bobTokenLedgerBase, "Bob MVK balance shouldn't have changed: "+bobTokenLedgerAfter+"MVK")
                assert.equal(totalSupplyAfter, totalSupplyBase, "MVK Total Supply shouldn't have changed: "+totalSupplyAfter+"MVK")
            }
        });
    })

    describe('%updateWhitelistContracts', function() {
        it('Adds Alice to the Whitelisted Contracts map', async() => {
            try{
                const oldWhitelistContractsMapAlice = await tokenStorage['whitelistContracts'].get('alice');
                const whitelistAliceOperationAdd = await tokenInstance.methods.updateWhitelistContracts('alice', alice.pkh).send();
                await whitelistAliceOperationAdd.confirmation();

                const newTokenStorage = await tokenInstance.storage();
                const newWhitelistContractsMapAlice = await newTokenStorage['whitelistContracts'].get('alice');

                assert.strictEqual(oldWhitelistContractsMapAlice, undefined, "Alice should not be in the Whitelist Contracts map before adding her to it")
                assert.strictEqual(newWhitelistContractsMapAlice, alice.pkh, "Alice should be in the Whitelist Contracts map after adding her to it")
            } catch(e){
                console.log(e)
            }
        });

        it('Removes Alice from the Whitelisted Contracts map', async() => {
            try{
                const oldWhitelistContractsMapAlice = await tokenStorage['whitelistContracts'].get('alice');
                const whitelistAliceOperationAdd = await tokenInstance.methods.updateWhitelistContracts('alice', alice.pkh).send();
                await whitelistAliceOperationAdd.confirmation();

                const newTokenStorage = await tokenInstance.storage();
                const newWhitelistContractsMapAlice = await newTokenStorage['whitelistContracts'].get('alice');

                assert.strictEqual(oldWhitelistContractsMapAlice, alice.pkh, "Alice should be in the Whitelist Contracts map before adding her to it")
                assert.strictEqual(newWhitelistContractsMapAlice, undefined, "Alice should not be in the Whitelist Contracts map after adding her to it")
            } catch(e){
                console.log(e)
            }
        });
    });

    describe('%updateGeneralContracts', function() {
        it('Adds Alice to the Addresses Contracts map', async() => {
            try{
                const oldAddressesContractsMapAlice = await tokenStorage['generalContracts'].get('alice');
                const AddressesAliceOperationAdd = await tokenInstance.methods.updateGeneralContracts('alice', alice.pkh).send();
                await AddressesAliceOperationAdd.confirmation();

                const newTokenStorage = await tokenInstance.storage();
                const newAddressesContractsMapAlice = await newTokenStorage['generalContracts'].get('alice');

                assert.strictEqual(oldAddressesContractsMapAlice, undefined, "Alice should not be in the Addresses Contracts map before adding her to it")
                assert.strictEqual(newAddressesContractsMapAlice, alice.pkh, "Alice should be in the Addresses Contracts map after adding her to it")
            } catch(e){
                console.log(e)
            }
        });

        it('Removes Alice from the General Contracts map', async() => {
            try{
                const oldAddressesContractsMapAlice = await tokenStorage['generalContracts'].get('alice');
                const AddressesAliceOperationAdd = await tokenInstance.methods.updateGeneralContracts('alice', alice.pkh).send();
                await AddressesAliceOperationAdd.confirmation();

                const newTokenStorage = await tokenInstance.storage();
                const newAddressesContractsMapAlice = await newTokenStorage['generalContracts'].get('alice');

                assert.strictEqual(oldAddressesContractsMapAlice, alice.pkh, "Alice should be in the Addresses Contracts map before adding her to it")
                assert.strictEqual(newAddressesContractsMapAlice, undefined, "Alice should not be in the Addresses Contracts map after adding her to it")
            } catch(e){
                console.log(e)
            }
        });
    });

    describe('%onStakeChange', function() {

        before('Mint MVKs for Alice', async() => {
            const whitelistAliceOperationAdd = await tokenInstance.methods.updateWhitelistContracts('alice', alice.pkh).send();
            await whitelistAliceOperationAdd.confirmation();
            const mintBobOperation = await tokenInstance.methods.mint(alice.pkh,20000).send()
            await mintBobOperation.confirmation();
            const whitelistAliceOperationRemove = await tokenInstance.methods.updateWhitelistContracts('alice', alice.pkh).send();
            await whitelistAliceOperationRemove.confirmation();
            tokenStorage = await tokenInstance.storage();
        })

        it('Stakes 1000MVK on Alice account without being whitelisted', async() => {
            try{
                const operation = await tokenInstance.methods.onStakeChange(
                    alice.pkh,
                    1000,
                    'stakeAction'
                ).send();
                await operation.confirmation();
            } catch(e){
                const newTokenStorage = await tokenInstance.storage();
                const aliceTokenLedgerAfter  = await newTokenStorage.ledger.get(alice.pkh);
                assert.equal(e.message, 'ONLY_WHITELISTED_CONTRACTS_ALLOWED', "This entrypoint should only be called by whitelisted contracts");
                assert.equal(aliceTokenLedgerAfter, aliceTokenLedgerBase, "Alice MVK balance shouldn't have changed: "+aliceTokenLedgerAfter+"MVK")
            }
        });

        it('Stakes 1000MVK on Alice account while being whitelisted', async() => {
            try{
                const whitelistAliceOperationAdd = await tokenInstance.methods.updateWhitelistContracts('alice', alice.pkh).send();
                await whitelistAliceOperationAdd.confirmation();

                const operation = await tokenInstance.methods.onStakeChange(
                    alice.pkh,
                    1000,
                    'stakeAction'
                ).send();
                await operation.confirmation();

                const whitelistAliceOperationRemove = await tokenInstance.methods.updateWhitelistContracts('alice', alice.pkh).send();
                await whitelistAliceOperationRemove.confirmation();

                const newTokenStorage = await tokenInstance.storage();
                const aliceTokenLedgerAfter  = await newTokenStorage.ledger.get(alice.pkh);
                assert.equal(aliceTokenLedgerAfter, aliceTokenLedgerBase - 1000, "Alice MVK Ledger should have "+(aliceTokenLedgerBase - 1000)+"MVK but she has "+aliceTokenLedgerAfter+"MVK")
            } catch(e){
                console.log(e)
            }
        });

        it('Stakes all Alice MVKs while being whitelisted', async() => {
            try{
                const whitelistAliceOperationAdd = await tokenInstance.methods.updateWhitelistContracts('alice', alice.pkh).send();
                await whitelistAliceOperationAdd.confirmation();

                const aliceBalance = await tokenStorage.ledger.get(alice.pkh)
                const operation = await tokenInstance.methods.onStakeChange(
                    alice.pkh,
                    aliceBalance,
                    'stakeAction'
                ).send();
                await operation.confirmation();

                const whitelistAliceOperationRemove = await tokenInstance.methods.updateWhitelistContracts('alice', alice.pkh).send();
                await whitelistAliceOperationRemove.confirmation();

                const newTokenStorage = await tokenInstance.storage();
                const aliceTokenLedgerAfter  = await newTokenStorage.ledger.get(alice.pkh);
                assert.equal(aliceTokenLedgerAfter, aliceTokenLedgerBase - aliceBalance, "Alice MVK Ledger should have "+(aliceTokenLedgerBase - aliceBalance)+"MVK but she has "+aliceTokenLedgerAfter+"MVK")
            } catch(e){
                console.log(e)
            }
        });

        it('Stakes too much MVK from Alice account while being whitelisted', async() => {
            try{
                const whitelistAliceOperationAdd = await tokenInstance.methods.updateWhitelistContracts('alice', alice.pkh).send();
                await whitelistAliceOperationAdd.confirmation();

                const aliceBalance = await tokenStorage.ledger.get(alice.pkh)
                const operation = await tokenInstance.methods.onStakeChange(
                    alice.pkh,
                    aliceBalance + 1,
                    'stakeAction'
                ).send();
                await operation.confirmation();
            } catch(e){
                const newTokenStorage = await tokenInstance.storage();
                const aliceTokenLedgerAfter  = await newTokenStorage.ledger.get(alice.pkh);

                const whitelistAliceOperationRemove = await tokenInstance.methods.updateWhitelistContracts('alice', alice.pkh).send();
                await whitelistAliceOperationRemove.confirmation();
                
                assert.equal(e.message, 'FA2_INSUFFICIENT_BALANCE', "This entrypoint should only be called by whitelisted contracts");
                assert.equal(aliceTokenLedgerAfter, aliceTokenLedgerBase, "Alice MVK balance shouldn't have changed: "+aliceTokenLedgerAfter+"MVK")
            }
        });

        it('Unstakes 1000MVK from Alice account without being whitelisted', async() => {
            try{
                const operation = await tokenInstance.methods.onStakeChange(
                    alice.pkh,
                    1000,
                    'unstakeAction'
                ).send();
                await operation.confirmation();
            } catch(e){
                const newTokenStorage = await tokenInstance.storage();
                const aliceTokenLedgerAfter  = await newTokenStorage.ledger.get(alice.pkh);
                assert.equal(e.message, 'ONLY_WHITELISTED_CONTRACTS_ALLOWED', "This entrypoint should only be called by whitelisted contracts");
                assert.equal(aliceTokenLedgerAfter, aliceTokenLedgerBase, "Alice MVK balance shouldn't have changed: "+aliceTokenLedgerAfter+"MVK")
            }
        });

        it('Unstakes 1000MVK on Alice account while being whitelisted', async() => {
            try{
                const whitelistAliceOperationAdd = await tokenInstance.methods.updateWhitelistContracts('alice', alice.pkh).send();
                await whitelistAliceOperationAdd.confirmation();

                const operation = await tokenInstance.methods.onStakeChange(
                    alice.pkh,
                    1000,
                    'unstakeAction'
                ).send();
                await operation.confirmation();

                const whitelistAliceOperationRemove = await tokenInstance.methods.updateWhitelistContracts('alice', alice.pkh).send();
                await whitelistAliceOperationRemove.confirmation();

                const newTokenStorage = await tokenInstance.storage();
                const aliceTokenLedgerAfter  = await newTokenStorage.ledger.get(alice.pkh);
                assert.equal(aliceTokenLedgerAfter, aliceTokenLedgerBase + 1000, "Alice MVK Ledger should have "+(aliceTokenLedgerBase + 1000)+"MVK but she has "+aliceTokenLedgerAfter+"MVK")
            } catch(e){
                console.log(e)
            }
        });
    })

    describe('%updateMvkTotalSupplyForDoorman', function() {
        it('Updates Doorman MVK total supply for a known doorman in the token contract', async() => {
            try{
                const doormanInstance = await utils.tezos.contract.at(doormanAddress.address);

                // Doorman calls
                const stakeOperation = await doormanInstance.methods.stake(2000).send();
                await stakeOperation.confirmation();
                const unstakeOperation = await doormanInstance.methods.unstake(1000).send();
                await unstakeOperation.confirmation();
            } catch(e){
                console.log(e)
            }
        });

        it('Updates Doorman MVK total supply for a unknown doorman or vesting contract in the token contract', async() => {
            try{
                const whitelistAliceOperationAdd = await tokenInstance.methods.updateWhitelistContracts('doorman', alice.pkh).send();
                await whitelistAliceOperationAdd.confirmation();

                const doormanInstance = await utils.tezos.contract.at(doormanAddress.address);

                // Doorman calls
                const stakeOperation = await doormanInstance.methods.stake(2000).send();
                await stakeOperation.confirmation();
                const unstakeOperation = await doormanInstance.methods.unstake(1000).send();
                await unstakeOperation.confirmation();
            } catch(e){
                const whitelistAliceOperationRemove = await tokenInstance.methods.updateWhitelistContracts('doorman', alice.pkh).send();
                await whitelistAliceOperationRemove.confirmation();
                assert.equal(e.message, 'ONLY_WHITELISTED_CONTRACTS_ALLOWED', "This entrypoint should only be called by whitelisted contracts");
            }
        });
    })

    describe('%assertMetadata', function() {
        it('Checks an unexisting value in the metadata', async() => {
            try{
                const metadata = Buffer.from(
                    'test',
                    'ascii',
                  ).toString('hex')
                const operation = await tokenInstance.methods.assertMetadata('test',metadata).send();
                await operation.confirmation();
            } catch(e){
                assert.strictEqual(e.message, 'METADATA_NOT_FOUND', 'The metadata should not be found in the contract storage')
            }
        });
        it('Checks a value with a correct key but a wrong hash in the metadata', async() => {
            try{
                const metadata = Buffer.from(
                    'test',
                    'ascii',
                  ).toString('hex')
                const operation = await tokenInstance.methods.assertMetadata('',metadata).send();
                await operation.confirmation();
            } catch(e){
                assert.strictEqual(e.message, 'METADATA_HAS_A_WRONG_HASH', 'The metadata equal to the provided key should not be equal to the provided metata')
            }
        });
        it('Checks a value with a correct key and a correct hash in the metadata', async() => {
            try{
                const metadata = Buffer.from(
                    JSON.stringify({
                      version: 'v1.0.0',
                      description: 'MAVRYK Token',
                      authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
                      source: {
                        tools: ['Ligo', 'Flextesa'],
                        location: 'https://ligolang.org/',
                      },
                      interfaces: ['TZIP-7', 'TZIP-12', 'TZIP-16', 'TZIP-21'],
                      errors: [],
                      views: [],
                      assets: [
                        {
                          symbol: Buffer.from('MVK').toString('hex'),
                          name: Buffer.from('MAVRYK').toString('hex'),
                          decimals: Buffer.from('6').toString('hex'),
                          icon: Buffer.from('https://mavryk.finance/logo192.png').toString('hex'),
                          shouldPreferSymbol: true,
                          thumbnailUri: 'https://mavryk.finance/logo192.png'
                        }
                      ]
                    }),
                    'ascii',
                  ).toString('hex')
                const operation = await tokenInstance.methods.assertMetadata('data',metadata).send();
                await operation.confirmation();
            } catch(e){
                console.log(e)
            }
        });
    })
});