const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
import { BigNumber } from 'bignumber.js'
const { InMemorySigner, importKey } = require("@taquito/signer");
import assert, { ok, rejects, strictEqual } from "assert";
import { Utils, MVK, TEZ } from "./helpers/Utils";
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
import mavrykFa12TokenAddress from '../deployments/mavrykFa12TokenAddress.json';
import mavrykFa2TokenAddress from '../deployments/mavrykFa2TokenAddress.json';

import * as sharedTestHelper from "./helpers/sharedTestHelpers"

describe("Execute Lambda tests", async () => {

    var utils : Utils;
    let rpc;

    let doormanInstance;
    let delegationInstance;
    let mvkTokenInstance;
    let mavrykFa12TokenInstance;
    let mavrykFa2TokenInstance;

    let doormanStorage;
    let delegationStorage;
    let mvkTokenStorage;
    let mavrykFa12TokenStorage;
    let mavrykFa2TokenStorage;

    let doormanXtzLedger
    let doormanMavrykFa12TokenLedger
    let doormanMavrykFa2TokenLedger

    let lambdaParams
    let packedData
    let packedDataValue
    let packedDataType
    let executeGovernanceActionOperation
    
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
        
        rpc = utils.tezos.rpc;
        
        doormanInstance             = await utils.tezos.contract.at(doormanAddress.address);
        delegationInstance          = await utils.tezos.contract.at(delegationAddress.address);
        mvkTokenInstance            = await utils.tezos.contract.at(mvkTokenAddress.address);
        mavrykFa12TokenInstance     = await utils.tezos.contract.at(mavrykFa12TokenAddress.address);
        mavrykFa2TokenInstance      = await utils.tezos.contract.at(mavrykFa2TokenAddress.address);
            
        doormanStorage           = await doormanInstance.storage();
        delegationStorage        = await delegationInstance.storage();
        mvkTokenStorage          = await mvkTokenInstance.storage();
        mavrykFa12TokenStorage   = await mavrykFa12TokenInstance.storage();
        mavrykFa2TokenStorage    = await mavrykFa2TokenInstance.storage();

        console.log('-- -- -- -- -- Execute Lambda Tests -- -- -- --')
        console.log('Doorman Contract deployed at:', doormanInstance.address);
        console.log('Delegation Contract deployed at:', delegationInstance.address);
        console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
        console.log('Mavryk FA12 Token Contract deployed at:', mavrykFa12TokenInstance.address);
        console.log('Mavryk FA2 Token Contract deployed at:', mavrykFa2TokenInstance.address);
        console.log('Bob address: ' + bob.pkh);
        console.log('Alice address: ' + alice.pkh);

    });

    beforeEach('storage', async () => {
        await signerFactory(bob.sk)
    })

    describe("doorman contract", async () => {

        it('non-admin (mallory) should not be able to call %executeGovernanceAction', async () => {
    
            // init variables
            await signerFactory(mallory.sk);
            
            const lambdaParams = doormanInstance.methods.dataPackingHelper(
                "lambdaSetAdmin", mallory.pkh
            ).toTransferParams();
            const packedDataValue = lambdaParams.parameter.value;
            const packedDataType  = await doormanInstance.entrypoints.entrypoints.dataPackingHelper;

            // pack data
            const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

            // Operation
            const failSetAdminOperation  = await doormanInstance.methods.executeGovernanceAction(packedData);
            await chai.expect(failSetAdminOperation.send()).to.be.rejected;    
            
        });


        it("%updateMetadata - admin should be able to call %updateMetadata through %executeGovernanceAction", async() => {
            try{

                doormanStorage = await doormanInstance.storage();
                
                const key                   = 'data';
                const initialMetadata       = await doormanStorage.metadata.get(key);
                const newMetadata           = Buffer.from(
                    JSON.stringify({
                    name: 'MAVRYK Doorman Contract v2',
                    version: 'v1.0.0',
                    authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
                    source: {
                        tools: ['Ligo', 'Flextesa'],
                        location: 'https://ligolang.org/',
                    },
                    }),
                    'ascii',
                ).toString('hex');
                assert.notEqual(initialMetadata, newMetadata);

                lambdaParams = doormanInstance.methods.dataPackingHelper(
                    "lambdaUpdateMetadata", key, newMetadata
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await doormanInstance.entrypoints.entrypoints.dataPackingHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await doormanInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                doormanStorage = await doormanInstance.storage();
                const updatedMetadata = await doormanStorage.metadata.get(key);

                // Assertion
                assert.equal(updatedMetadata, newMetadata);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------

                lambdaParams = doormanInstance.methods.dataPackingHelper(
                    "lambdaUpdateMetadata", key, initialMetadata
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await doormanInstance.entrypoints.entrypoints.dataPackingHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await doormanInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                doormanStorage = await doormanInstance.storage();
                const resetMetadata = await doormanStorage.metadata.get(key);

                // Assertion
                assert.equal(resetMetadata, initialMetadata);
                // --------------------------------------------------------

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })


        it("%updateConfig - admin should be able to call %updateConfig through %executeGovernanceAction", async() => {
            try{

                doormanStorage = await doormanInstance.storage();

                const initialConfigValue = doormanStorage.config.minMvkAmount;
                const newConfigValue     = MVK(5);

                assert.notEqual(initialConfigValue, newConfigValue);

                lambdaParams = doormanInstance.methods.dataPackingHelper(
                    "lambdaUpdateConfig", newConfigValue, 'configMinMvkAmount'
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await doormanInstance.entrypoints.entrypoints.dataPackingHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await doormanInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                doormanStorage = await doormanInstance.storage();
                const updatedConfigValue = doormanStorage.config.minMvkAmount;

                // Assertion
                assert.equal(updatedConfigValue, newConfigValue);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------
                
                lambdaParams = doormanInstance.methods.dataPackingHelper(
                    "lambdaUpdateConfig", initialConfigValue, 'configMinMvkAmount'
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await doormanInstance.entrypoints.entrypoints.dataPackingHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await doormanInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                doormanStorage = await doormanInstance.storage();
                const resetConfigValue = doormanStorage.config.minMvkAmount;

                // Assertion
                assert.equal(resetConfigValue.toNumber(), initialConfigValue.toNumber());
                // --------------------------------------------------------

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })


        it("%updateWhitelistContracts - admin should be able to call %updateWhitelistContracts through %executeGovernanceAction", async() => {
            try{

                doormanStorage = await doormanInstance.storage();

                const initialWhitelistCheck = doormanStorage.whitelistContracts.get("testUpdateWhitelistContracts");
                const newWhitelistAddress   = mallory.pkh;

                assert.notEqual(initialWhitelistCheck, newWhitelistAddress);

                // add whitelist address
                lambdaParams = doormanInstance.methods.dataPackingHelper(
                    "lambdaUpdateWhitelistContracts", 'testUpdateWhitelistContracts', newWhitelistAddress
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await doormanInstance.entrypoints.entrypoints.dataPackingHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await doormanInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                doormanStorage = await doormanInstance.storage();
                const updatedWhitelistCheck = doormanStorage.whitelistContracts.get("testUpdateWhitelistContracts");

                // Assertion
                assert.equal(updatedWhitelistCheck, newWhitelistAddress);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------
                
                // remove whitelist address by calling entrypoint with same values again
                lambdaParams = doormanInstance.methods.dataPackingHelper(
                    "lambdaUpdateWhitelistContracts", 'testUpdateWhitelistContracts', newWhitelistAddress
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await doormanInstance.entrypoints.entrypoints.dataPackingHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await doormanInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                doormanStorage = await doormanInstance.storage();
                const resetWhitelistCheck = doormanStorage.whitelistContracts.get("testUpdateWhitelistContracts");

                // Assertion
                assert.equal(resetWhitelistCheck, undefined);
                // --------------------------------------------------------

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })


        it("%updateGeneralContracts - admin should be able to call %updateGeneralContracts through %executeGovernanceAction", async() => {
            try{

                doormanStorage = await doormanInstance.storage();

                const initialGeneralCheck = doormanStorage.generalContracts.get("testUpdateGeneralContracts");
                const newGeneralAddress   = mallory.pkh;

                assert.notEqual(initialGeneralCheck, newGeneralAddress);

                // add general contract address
                lambdaParams = doormanInstance.methods.dataPackingHelper(
                    "lambdaUpdateGeneralContracts", 'testUpdateGeneralContracts', newGeneralAddress
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await doormanInstance.entrypoints.entrypoints.dataPackingHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await doormanInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                doormanStorage = await doormanInstance.storage();
                const updatedGeneralCheck = doormanStorage.generalContracts.get("testUpdateGeneralContracts");

                // Assertion
                assert.equal(updatedGeneralCheck, newGeneralAddress);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------
                
                // remove general contract address by calling entrypoint with same values again
                lambdaParams = doormanInstance.methods.dataPackingHelper(
                    "lambdaUpdateGeneralContracts", 'testUpdateGeneralContracts', newGeneralAddress
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await doormanInstance.entrypoints.entrypoints.dataPackingHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await doormanInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                doormanStorage = await doormanInstance.storage();
                const resetGeneralCheck = doormanStorage.generalContracts.get("testUpdateGeneralContracts");

                // Assertion
                assert.equal(resetGeneralCheck, undefined);
                // --------------------------------------------------------

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })


        it("%mistakenTransfer - admin should be able to call %mistakenTransfer through %executeGovernanceAction", async() => {
            try{

                doormanStorage = await doormanInstance.storage();

                // doormanXtzLedger                            = await utils.tezos.tz.getBalance(doormanAddress.address);
                // const doormanInitialXtzBalance              = doormanXtzLedger.toNumber();

                doormanMavrykFa12TokenLedger                = await mavrykFa12TokenStorage.ledger.get(doormanAddress.address);            
                const doormanInitialMavrykFa12TokenBalance  = doormanMavrykFa12TokenLedger == undefined ? 0 : doormanMavrykFa12TokenLedger.balance.toNumber();

                doormanMavrykFa2TokenLedger                 = await mavrykFa2TokenStorage.ledger.get(doormanAddress.address);            
                const doormanInitialMavrykFa2TokenBalance   = doormanMavrykFa2TokenLedger == undefined ? 0 : doormanMavrykFa2TokenLedger.toNumber();

                const mistakenTezAmountSent                 = 7;
                const mistakenTokenAmountSent               = 3000000;

                // assert.equal(doormanInitialXtzBalance,              0);
                assert.equal(doormanInitialMavrykFa12TokenBalance,  0);
                assert.equal(doormanInitialMavrykFa2TokenBalance,   0);

                // assert.notEqual(doormanInitialXtzBalance,               mistakenTezAmountSent);
                assert.notEqual(doormanInitialMavrykFa12TokenBalance,   mistakenTokenAmountSent);
                assert.notEqual(doormanInitialMavrykFa2TokenBalance,    mistakenTokenAmountSent);

                // mistaken transfers by different users:
                // - Eve (MavrykFa12Token), Mallory (MavrykFa2Token) 
                // - Note: no XTZ as Doorman contract has no default entrypoint

                await signerFactory(eve.sk)
                const eveMistakenTransferFa12TokenOperation = await mavrykFa12TokenInstance.methods.transfer(eve.pkh, doormanAddress.address, mistakenTokenAmountSent).send();
                await eveMistakenTransferFa12TokenOperation.confirmation();

                await signerFactory(mallory.sk)
                const malloryMistakenTransferFa2TokenOperation = await mavrykFa2TokenInstance.methods.transfer([
                    {
                        from_: mallory.pkh,
                        txs: [
                            {
                                to_: doormanAddress.address,
                                token_id: 0,
                                amount: mistakenTokenAmountSent
                            }
                        ]
                    }
                ]).send();
                await malloryMistakenTransferFa2TokenOperation.confirmation();

                // check balances after mistaken transfers

                // doormanXtzLedger                        = await utils.tezos.tz.getBalance(doormanAddress.address);
                // const doormanXtzBalance                 = doormanXtzLedger.toNumber();

                doormanMavrykFa12TokenLedger            = await mavrykFa12TokenStorage.ledger.get(doormanAddress.address);            
                const doormanMavrykFa12TokenBalance     = doormanMavrykFa12TokenLedger == undefined ? 0 : doormanMavrykFa12TokenLedger.balance.toNumber();

                doormanMavrykFa2TokenLedger             = await mavrykFa2TokenStorage.ledger.get(doormanAddress.address);            
                const doormanMavrykFa2TokenBalance      = doormanMavrykFa2TokenLedger == undefined ? 0 : doormanMavrykFa2TokenLedger.toNumber();

                // assert.equal(doormanXtzBalance,             mistakenTezAmountSent);
                assert.equal(doormanMavrykFa12TokenBalance, mistakenTokenAmountSent);
                assert.equal(doormanMavrykFa2TokenBalance,  mistakenTokenAmountSent);

                // mistaken transfers params for admin
                await signerFactory(bob.sk)
                
                const mistakenTransferParams = [
                    {
                        "to_"    : eve.pkh,
                        "token"  : {
                            "fa12" : mavrykFa12TokenAddress.address
                        },
                        "amount" : mistakenTokenAmountSent
                    },
                    {
                        "to_"    : mallory.pkh,
                        "token"  : {
                            "fa2" : {
                                "tokenContractAddress": mavrykFa2TokenAddress.address,
                                "tokenId" : 0
                            }
                        },
                        "amount" : mistakenTokenAmountSent
                    }
                ];

                lambdaParams = doormanInstance.methods.dataPackingHelper(
                    "lambdaMistakenTransfer", mistakenTransferParams
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await doormanInstance.entrypoints.entrypoints.dataPackingHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await doormanInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                // doormanXtzLedger                                = await utils.tezos.tz.getBalance(doormanAddress.address);
                // const doormanUpdatedXtzBalance                  = doormanXtzLedger.toNumber();

                doormanMavrykFa12TokenLedger                    = await mavrykFa12TokenStorage.ledger.get(doormanAddress.address);            
                const doormanUpdatedMavrykFa12TokenBalance      = doormanMavrykFa12TokenLedger == undefined ? 0 : doormanMavrykFa12TokenLedger.balance.toNumber();

                doormanMavrykFa2TokenLedger                     = await mavrykFa2TokenStorage.ledger.get(doormanAddress.address);            
                const doormanUpdatedMavrykFa2TokenBalance       = doormanMavrykFa2TokenLedger == undefined ? 0 : doormanMavrykFa2TokenLedger.toNumber();

                // assert.equal(doormanUpdatedXtzBalance,              0);
                assert.equal(doormanUpdatedMavrykFa12TokenBalance,  0);
                assert.equal(doormanUpdatedMavrykFa2TokenBalance,   0);

                // assert.notEqual(doormanUpdatedXtzBalance,             mistakenTezAmountSent);
                assert.notEqual(doormanUpdatedMavrykFa12TokenBalance, mistakenTokenAmountSent);
                assert.notEqual(doormanUpdatedMavrykFa2TokenBalance,  mistakenTokenAmountSent);

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%setAdmin - admin should be able to call %setAdmin through %executeGovernanceAction", async() => {
            try{

                doormanStorage = await doormanInstance.storage();
                const initialAdmin = doormanStorage.admin;
                const newAdmin     = eve.pkh;

                lambdaParams = doormanInstance.methods.dataPackingHelper(
                    "lambdaSetAdmin", newAdmin
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await doormanInstance.entrypoints.entrypoints.dataPackingHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await doormanInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                doormanStorage = await doormanInstance.storage();
                const updatedAdmin = doormanStorage.admin;

                // Assertion
                assert.equal(updatedAdmin, newAdmin);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------
                
                await signerFactory(eve.sk);
                lambdaParams = doormanInstance.methods.dataPackingHelper(
                    "lambdaSetAdmin", initialAdmin
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await doormanInstance.entrypoints.entrypoints.dataPackingHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await doormanInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                doormanStorage = await doormanInstance.storage();
                const resetAdmin = doormanStorage.admin;

                // Assertion
                assert.equal(resetAdmin, initialAdmin);
                // --------------------------------------------------------


            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })


    })

    

});
