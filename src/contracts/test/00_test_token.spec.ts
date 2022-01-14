const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
const { InMemorySigner, importKey } = require("@taquito/signer");
import { Utils, zeroAddress } from "./helpers/Utils";
import fs from "fs";
import { confirmOperation } from "../scripts/confirmation";

const chai = require("chai");
const assert = require("chai").assert;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

import env from "../env";
import { alice, bob, eve } from "../scripts/sandbox/accounts";

import tokenAddress from '../deployments/mvkTokenAddress.json';

describe("MVK Token", async () => {
    var utils: Utils;

    let tokenInstance;

    let tokenStorage;

    let aliceTokenLedgerBase;
    let bobTokenLedgerBase;
    let eveTokenLedgerBase;

    const signerFactory = async (pk) => {
        await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
        return utils.tezos;
    };

    before("setup", async () => {
        utils = new Utils();
        await utils.init(alice.sk);
        tokenInstance   = await utils.tezos.contract.at(tokenAddress.address);
        tokenStorage    = await tokenInstance.storage();
        // console.log('-- -- -- -- -- Token Tests -- -- -- --')
        // console.log('Token Contract deployed at:', tokenInstance.address);
        // console.log('Alice address: ' + alice.pkh);
        // console.log('Bob address: ' + bob.pkh);
        // console.log('Eve address: ' + eve.pkh);
    });

    beforeEach("storage", async () => {
        tokenStorage = await tokenInstance.storage();
        aliceTokenLedgerBase  = parseInt(await tokenStorage.ledger.get(alice.pkh));
        bobTokenLedgerBase  = parseInt(await tokenStorage.ledger.get(bob.pkh));
        eveTokenLedgerBase  = parseInt(await tokenStorage.ledger.get(eve.pkh));
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
    })
});