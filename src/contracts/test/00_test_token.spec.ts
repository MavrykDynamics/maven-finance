const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
const { InMemorySigner, importKey } = require("@taquito/signer");
import assert, { ok, rejects, strictEqual } from "assert";
import { Utils, zeroAddress } from "./helpers/Utils";
import fs from "fs";
import { confirmOperation } from "../scripts/confirmation";

const chai = require("chai");
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

import env from "../env";
import { alice, bob, eve } from "../scripts/sandbox/accounts";

import tokenAddress from '../deployments/mvkTokenAddress.json';

describe("Token tests", async () => {
    var utils: Utils;

    let tokenInstance;

    let tokenStorage;

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

        console.log('Token Metadata test: console log checks  ----');
        const tokenMetadata  = await tokenStorage.token_metadata.get(0);
        console.log(tokenMetadata);
    });

    it('eve transfers 200MVK to alice and bob transfers 35MVK to eve', async () => {
        try{        

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: Eve transfers 200MVK to Alice and Bob transfers 35MVK to Eve") 
            console.log("---") // break

            // console.log('Storage test: console log checks  ----');
            // console.log(tokenStorage);

            const previousTokenStorage = await tokenInstance.storage();
            const aliceTokenLedgerBefore  = await previousTokenStorage.ledger.get(alice.pkh);
            console.log('Alice MVK Ledger balance before transaction: ' + aliceTokenLedgerBefore);    
            const bobTokenLedgerBefore  = await previousTokenStorage.ledger.get(bob.pkh);
            console.log('Bob MVK Ledger balance after transaction: ' + bobTokenLedgerBefore); 
            const eveTokenLedgerBefore  = await previousTokenStorage.ledger.get(eve.pkh);
            console.log('Eve MVK Ledger balance after transaction: ' + eveTokenLedgerBefore);  

            // Alice send a single transaction to Bob
            const transferToAliceAndBobOperation = await tokenInstance.methods.transfer([
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
            await transferToAliceAndBobOperation.confirmation();

            const newTokenStorage = await tokenInstance.storage();
            console.log('Block Level: ' + newTokenStorage.tempBlockLevel);
            const aliceTokenLedgerAfter  = await newTokenStorage.ledger.get(alice.pkh);
            console.log('Alice MVK Ledger Balance after transaction: ' + aliceTokenLedgerAfter);
            const bobTokenLedgerAfter  = await newTokenStorage.ledger.get(bob.pkh);
            console.log('Bob MVK Ledger Balance after transaction: ' + bobTokenLedgerAfter);
            const eveTokenLedgerAfter  = await newTokenStorage.ledger.get(eve.pkh);
            console.log('Eve MVK Ledger Balance after transaction: ' + eveTokenLedgerAfter);    

        } catch(e){
            console.log(e);
        } 
    });

    it('alice transfers 10MVK to bob and 50MVK to eve', async () => {
        try{        

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: Alice transfers 10MVK to Bob and 50MVK to Eve") 
            console.log("---") // break

            // console.log('Storage test: console log checks  ----');
            // console.log(tokenStorage);

            const previousTokenStorage = await tokenInstance.storage();
            const aliceTokenLedgerBefore  = await previousTokenStorage.ledger.get(alice.pkh);
            console.log('Alice MVK Ledger balance before transaction: ' + aliceTokenLedgerBefore);
            const bobTokenLedgerBefore  = await previousTokenStorage.ledger.get(bob.pkh);
            console.log('Bob MVK Ledger balance after transaction: ' + bobTokenLedgerBefore);     
            const eveTokenLedgerBefore  = await previousTokenStorage.ledger.get(eve.pkh);
            console.log('Eve MVK Ledger balance after transaction: ' + eveTokenLedgerBefore);  

            // Alice send a single transaction to Bob
            const transferToBobAndEveOperation = await tokenInstance.methods.transfer([{
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
            }]).send();
            await transferToBobAndEveOperation.confirmation();

            const newTokenStorage = await tokenInstance.storage();
            console.log('Block Level: ' + newTokenStorage.tempBlockLevel);
            const aliceTokenLedgerAfter  = await newTokenStorage.ledger.get(alice.pkh);
            console.log('Alice MVK Ledger Balance after transaction: ' + aliceTokenLedgerAfter);
            const bobTokenLedgerAfter  = await newTokenStorage.ledger.get(bob.pkh);
            console.log('Bob MVK Ledger Balance after transaction: ' + bobTokenLedgerAfter);
            const eveTokenLedgerAfter  = await newTokenStorage.ledger.get(eve.pkh);
            console.log('Eve MVK Ledger Balance after transaction: ' + eveTokenLedgerAfter);    

        } catch(e){
            console.log(e);
        } 
    });
});