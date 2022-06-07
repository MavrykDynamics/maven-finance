const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
import { BigNumber } from 'bignumber.js'
const { InMemorySigner, importKey } = require("@taquito/signer");
import assert, { ok, rejects, strictEqual } from "assert";
import { Utils, MVK } from "./helpers/Utils";
import fs from "fs";
import { confirmOperation } from "../scripts/confirmation";

const chai = require("chai");
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

import env from "../env";
import { bob, alice, eve, mallory } from "../scripts/sandbox/accounts";

import doormanAddress from '../deployments/doormanAddress.json';
import delegationAddress from '../deployments/delegationAddress.json';
import mvkTokenAddress from '../deployments/mvkTokenAddress.json';
import mockFa12TokenAddress from '../deployments/mockFa12TokenAddress.json';
import mockFa2TokenAddress from '../deployments/mockFa2TokenAddress.json';
import treasuryAddress from '../deployments/treasuryAddress.json';
import treasuryFactoryAddress from '../deployments/treasuryFactoryAddress.json';

describe("Mistaken transfers tests", async () => {
    var utils: Utils;

    let doormanInstance;
    let delegationInstance;
    let mvkTokenInstance;
    let mockFa12TokenInstance;
    let mockFa2TokenInstance;
    let treasuryInstance;
    let treasuryFactoryInstance;

    let doormanStorage;
    let delegationStorage;
    let mvkTokenStorage;
    let mockFa12TokenStorage;
    let mockFa2TokenStorage;
    let treasuryStorage;
    let treasuryFactoryStorage;
    
    const signerFactory = async (pk) => {
        await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
        return utils.tezos;
    };

    const almostEqual = (actual, expected, delta) => {
        let greaterLimit  = expected + expected * delta
        let lowerLimit    = expected - expected * delta
        return actual <= greaterLimit && actual >= lowerLimit
    }

    before("setup", async () => {

        utils = new Utils();
        await utils.init(bob.sk);
        
        doormanInstance         = await utils.tezos.contract.at(doormanAddress.address);
        delegationInstance      = await utils.tezos.contract.at(delegationAddress.address);
        mvkTokenInstance        = await utils.tezos.contract.at(mvkTokenAddress.address);
        mockFa12TokenInstance   = await utils.tezos.contract.at(mockFa12TokenAddress.address);
        mockFa2TokenInstance    = await utils.tezos.contract.at(mockFa2TokenAddress.address);
        treasuryInstance        = await utils.tezos.contract.at(treasuryAddress.address);
        treasuryFactoryInstance = await utils.tezos.contract.at(treasuryFactoryAddress.address);
            
        doormanStorage          = await doormanInstance.storage();
        delegationStorage       = await delegationInstance.storage();
        mvkTokenStorage         = await mvkTokenInstance.storage();
        mockFa12TokenStorage    = await mockFa12TokenInstance.storage();
        mockFa2TokenStorage     = await mockFa2TokenInstance.storage();
        treasuryStorage         = await treasuryInstance.storage();
        treasuryFactoryStorage  = await treasuryFactoryInstance.storage();

        console.log('-- -- -- -- -- Doorman Tests -- -- -- --')
        console.log('Doorman Contract deployed at:', doormanInstance.address);
        console.log('Delegation Contract deployed at:', delegationInstance.address);
        console.log('Treasury Contract deployed at:', treasuryInstance.address);
        console.log('Treasury Factory Contract deployed at:', treasuryFactoryInstance.address);
        console.log('Mock FA12 Contract deployed at:', mockFa12TokenInstance.address);
        console.log('Mock FA2 Contract deployed at:', mockFa2TokenInstance.address);
        console.log('Bob address: ' + bob.pkh);
        console.log('Alice address: ' + alice.pkh);

        // Make treasuryFactory tracks treasury
        const trackOperation    = await treasuryFactoryInstance.methods.trackTreasury(treasuryAddress.address).send();
        await trackOperation.confirmation();
    });

    beforeEach('storage', async () => {
        await signerFactory(bob.sk)
    })

    describe("DOORMAN", async () => {

        beforeEach('Set sender to admin', async () => {
            await signerFactory(bob.sk)
        })

        it("User should be able to transfer FA12 Tokens sent to the doorman to the treasury", async() => {
            try{
                // Initial values
                mockFa12TokenStorage        = await mockFa12TokenInstance.storage()
                var doormanAccount          = await mockFa12TokenStorage.ledger.get(doormanAddress.address)
                var treasuryAccount         = await mockFa12TokenStorage.ledger.get(treasuryAddress.address)
                const initDoormanBalance    = doormanAccount ? doormanAccount.balance.toNumber() : 0;
                const initTreasuryBalance   = treasuryAccount ? treasuryAccount.balance.toNumber() : 0;
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation     = await mockFa12TokenInstance.methods.transfer(bob.pkh, doormanAddress.address, tokenAmount).send();
                await transferOperation.confirmation();

                // Mid values
                mockFa12TokenStorage        = await mockFa12TokenInstance.storage()
                doormanAccount              = await mockFa12TokenStorage.ledger.get(doormanAddress.address)
                treasuryAccount             = await mockFa12TokenStorage.ledger.get(treasuryAddress.address)
                const midDoormanBalance     = doormanAccount ? doormanAccount.balance.toNumber() : 0;
                
                // Treasury Transfer Operation
                const treasuryTransferOperation     = await doormanInstance.methods.treasuryTransfer(
                    [
                        {
                            "to_"    : treasuryAddress.address,
                            "token"  : {
                                "fa12" : mockFa12TokenAddress.address
                            },
                            "amount" : tokenAmount
                        }
                    ]
                    ).send();
                await treasuryTransferOperation.confirmation();

                // Final values
                mockFa12TokenStorage        = await mockFa12TokenInstance.storage()
                doormanAccount              = await mockFa12TokenStorage.ledger.get(doormanAddress.address)
                treasuryAccount             = await mockFa12TokenStorage.ledger.get(treasuryAddress.address)
                const endDoormanBalance     = doormanAccount ? doormanAccount.balance.toNumber() : 0;
                const endTreasuryBalance    = treasuryAccount ? treasuryAccount.balance.toNumber() : 0;

                // Assertions
                assert.equal(midDoormanBalance, initDoormanBalance + tokenAmount)
                assert.equal(endDoormanBalance, initDoormanBalance)
                assert.equal(endTreasuryBalance, initTreasuryBalance + tokenAmount)

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })
        
        it("User should not be able to transfer tokens sent to the doorman to an unknown treasury", async() => {
            try{
                // Initial values
                mockFa12TokenStorage        = await mockFa12TokenInstance.storage()
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation     = await mockFa12TokenInstance.methods.transfer(bob.pkh, doormanAddress.address, tokenAmount).send();
                await transferOperation.confirmation();
                
                // Treasury Transfer Operation
                await chai.expect(doormanInstance.methods.treasuryTransfer(
                [
                    {
                        "to_"    : bob.pkh,
                        "token"  : {
                            "fa12" : mockFa12TokenAddress.address
                        },
                        "amount" : tokenAmount
                    }
                ]
                ).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })
        
        it("User should not be able to transfer MVK Tokens sent to the doorman to the treasury", async() => {
            try{
                // Initial values
                mockFa12TokenStorage        = await mockFa12TokenInstance.storage()
                const tokenAmount           = 200;

                // Mistake Operation
                const transferOperation     = await mockFa12TokenInstance.methods.transfer(bob.pkh, doormanAddress.address, tokenAmount).send();
                await transferOperation.confirmation();
                
                // Treasury Transfer Operation
                await chai.expect(doormanInstance.methods.treasuryTransfer(
                [
                    {
                        "to_"    : bob.pkh,
                        "token"  : {
                            "fa2" : {
                                "tokenContractAddress" : mvkTokenAddress.address,
                                "tokenId" : 0
                            }
                        },
                        "amount" : tokenAmount
                    }
                ]
                ).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })
    })
});
