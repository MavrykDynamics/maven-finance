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

import farmAddress from '../deployments/farmAddress.json';
import lpAddress from '../deployments/lpTokenAddress.json';

describe("MVK Token", async () => {
    var utils: Utils;

    let farmInstance;

    let farmStorage;

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
        farmInstance   = await utils.tezos.contract.at(farmAddress.address);
        farmStorage    = await farmInstance.storage();
    });

    beforeEach("storage", async () => {
        farmStorage = await farmStorage.storage();
        await signerFactory(alice.sk)
    })

    describe('%deposit', function() {
        it('Bob deposits 2LP Tokens', async () => {
            try{
                // const operation = await tokenInstance.methods.transfer([
                //     {
                //         from_: alice.pkh,
                //         txs: [
                //             {
                //                 to_: eve.pkh,
                //                 token_id: 0,
                //                 amount: 2000
                //             }
                //         ]
                //     }
                // ]).send();
                // await operation.confirmation();
                // const newTokenStorage = await tokenInstance.storage();
                // const aliceTokenLedgerAfter  = await newTokenStorage.ledger.get(alice.pkh);
                // const eveTokenLedgerAfter  = await newTokenStorage.ledger.get(eve.pkh);            
                // assert.equal(aliceTokenLedgerAfter, aliceTokenLedgerBase - 2000, "Alice MVK Ledger should have "+(aliceTokenLedgerBase - 2000)+"MVK but she has "+aliceTokenLedgerAfter+"MVK")
                // assert.equal(eveTokenLedgerAfter, eveTokenLedgerBase + 2000, "Eve MVK Ledger should have "+(eveTokenLedgerBase + 2000)+"MVK but she has "+eveTokenLedgerAfter+"MVK")
            } catch(e){
                console.log(e);
            } 
        });
    })
});