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

import proxyBreakGlassAddress from '../deployments/proxyBreakGlassAddress.json';
import proxyFarmAddress from '../deployments/proxyFarmAddress.json';
import proxyAggregatorAddress from '../deployments/proxyAggregatorAddress.json';
import proxyCouncilAddress from '../deployments/proxyCouncilAddress.json';
import proxyDoormanAddress from '../deployments/proxyDoormanAddress.json';
import proxyDelegationAddress from '../deployments/proxyDelegationAddress.json';

import breakGlassAddress from '../deployments/breakGlassAddress.json';
import farmAddress from '../deployments/farmAddress.json';
import aggregatorAddress from '../deployments/aggregatorAddress.json';
import councilAddress from '../deployments/councilAddress.json';
import doormanAddress from '../deployments/doormanAddress.json';
import delegationAddress from '../deployments/delegationAddress.json';
import mvkTokenAddress from '../deployments/mvkTokenAddress.json';
import mavrykFa12TokenAddress from '../deployments/mavrykFa12TokenAddress.json';
import mavrykFa2TokenAddress from '../deployments/mavrykFa2TokenAddress.json';

import * as sharedTestHelper from "./helpers/sharedTestHelpers"

describe("Execute Governance Action Lambda tests", async () => {

    var utils : Utils;
    let rpc;

    let breakGlassInstance
    let farmInstance
    let aggregatorInstance
    let councilInstance
    let doormanInstance;
    let delegationInstance;
    let mvkTokenInstance;
    let mavrykFa12TokenInstance;
    let mavrykFa2TokenInstance;

    let breakGlassStorage
    let farmStorage
    let aggregatorStorage
    let councilStorage
    let doormanStorage;
    let delegationStorage;
    let mvkTokenStorage;
    let mavrykFa12TokenStorage;
    let mavrykFa2TokenStorage;

    let doormanXtzLedger
    let doormanMavrykFa12TokenLedger
    let doormanMavrykFa2TokenLedger

    let proxyBreakGlassInstance;
    let proxyFarmInstance;
    let proxyAggregatorInstance;
    let proxyCouncilInstance;
    let proxyDoormanInstance;
    let proxyDelegationInstance;

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
        
        proxyBreakGlassInstance     = await utils.tezos.contract.at(proxyBreakGlassAddress.address);
        proxyFarmInstance           = await utils.tezos.contract.at(proxyFarmAddress.address);
        proxyAggregatorInstance     = await utils.tezos.contract.at(proxyAggregatorAddress.address);
        proxyCouncilInstance        = await utils.tezos.contract.at(proxyCouncilAddress.address);
        proxyDoormanInstance        = await utils.tezos.contract.at(proxyDoormanAddress.address);
        proxyDelegationInstance     = await utils.tezos.contract.at(proxyDelegationAddress.address);

        breakGlassInstance          = await utils.tezos.contract.at(breakGlassAddress.address);
        farmInstance                = await utils.tezos.contract.at(farmAddress.address);
        aggregatorInstance          = await utils.tezos.contract.at(aggregatorAddress.address);
        councilInstance             = await utils.tezos.contract.at(councilAddress.address);
        doormanInstance             = await utils.tezos.contract.at(doormanAddress.address);
        delegationInstance          = await utils.tezos.contract.at(delegationAddress.address);
        mvkTokenInstance            = await utils.tezos.contract.at(mvkTokenAddress.address);
        mavrykFa12TokenInstance     = await utils.tezos.contract.at(mavrykFa12TokenAddress.address);
        mavrykFa2TokenInstance      = await utils.tezos.contract.at(mavrykFa2TokenAddress.address);
            
        breakGlassStorage           = await breakGlassInstance.storage();
        farmStorage                 = await farmInstance.storage();
        aggregatorStorage           = await aggregatorInstance.storage();
        councilStorage           = await councilInstance.storage();
        doormanStorage           = await doormanInstance.storage();
        delegationStorage        = await delegationInstance.storage();
        mvkTokenStorage          = await mvkTokenInstance.storage();
        mavrykFa12TokenStorage   = await mavrykFa12TokenInstance.storage();
        mavrykFa2TokenStorage    = await mavrykFa2TokenInstance.storage();

        console.log('-- -- -- -- -- Execute Governance Action Lambda Tests -- -- -- --')
        console.log('Farm Contract deployed at:', farmInstance.address);
        console.log('Aggregator Contract deployed at:', aggregatorInstance.address);
        console.log('Council Contract deployed at:', councilInstance.address);
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

            // const proxyDoormanContractParameterSchema = proxyDoormanInstance.parameterSchema.ExtractSchema();
            // console.log(JSON.stringify(proxyDoormanContractParameterSchema,null,2));
            // console.log(proxyDoormanInstance);

            // console.log('------------')
            // console.log('------------')
            // console.log('------------')
            // console.log('------------')
            // console.log('------------')

            // const contractParameterSchema = proxyDelegationInstance.parameterSchema.ExtractSchema();
            // console.log(JSON.stringify(contractParameterSchema,null,2));
            // console.log(proxyDelegationInstance);
            
            const lambdaParams = proxyDoormanInstance.methods.doormanHelper(
                "lambdaSetAdmin", mallory.pkh
            ).toTransferParams();
            const packedDataValue = lambdaParams.parameter.value;
            const packedDataType  = await proxyDoormanInstance.entrypoints.entrypoints.doormanHelper;

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

                lambdaParams = proxyDoormanInstance.methods.doormanHelper(
                    "lambdaUpdateMetadata", key, newMetadata
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyDoormanInstance.entrypoints.entrypoints.doormanHelper;

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

                lambdaParams = proxyDoormanInstance.methods.doormanHelper(
                    "lambdaUpdateMetadata", key, initialMetadata
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyDoormanInstance.entrypoints.entrypoints.doormanHelper;

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

                lambdaParams = proxyDoormanInstance.methods.doormanHelper(
                    "lambdaUpdateConfig", newConfigValue, 'configMinMvkAmount'
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyDoormanInstance.entrypoints.entrypoints.doormanHelper;

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
                
                lambdaParams = proxyDoormanInstance.methods.doormanHelper(
                    "lambdaUpdateConfig", initialConfigValue, 'configMinMvkAmount'
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyDoormanInstance.entrypoints.entrypoints.doormanHelper;

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
                lambdaParams = proxyDoormanInstance.methods.doormanHelper(
                    "lambdaUpdateWhitelistContracts", 'testUpdateWhitelistContracts', newWhitelistAddress
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyDoormanInstance.entrypoints.entrypoints.doormanHelper;

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
                lambdaParams = proxyDoormanInstance.methods.doormanHelper(
                    "lambdaUpdateWhitelistContracts", 'testUpdateWhitelistContracts', newWhitelistAddress
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyDoormanInstance.entrypoints.entrypoints.doormanHelper;

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
                lambdaParams = proxyDoormanInstance.methods.doormanHelper(
                    "lambdaUpdateGeneralContracts", 'testUpdateGeneralContracts', newGeneralAddress
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyDoormanInstance.entrypoints.entrypoints.doormanHelper;

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
                lambdaParams = proxyDoormanInstance.methods.doormanHelper(
                    "lambdaUpdateGeneralContracts", 'testUpdateGeneralContracts', newGeneralAddress
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyDoormanInstance.entrypoints.entrypoints.doormanHelper;

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

                lambdaParams = proxyDoormanInstance.methods.doormanHelper(
                    "lambdaMistakenTransfer", mistakenTransferParams
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyDoormanInstance.entrypoints.entrypoints.doormanHelper;

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


        it("%pauseAll and %unpauseAll - admin should be able to call %pauseAll and %unpauseAll through %executeGovernanceAction", async() => {
            try{

                doormanStorage = await doormanInstance.storage();
                const initialBreakGlassConfig = doormanStorage.breakGlassConfig;

                assert.equal(initialBreakGlassConfig.stakeIsPaused                  , false);
                assert.equal(initialBreakGlassConfig.unstakeIsPaused                , false);
                assert.equal(initialBreakGlassConfig.compoundIsPaused               , false);
                assert.equal(initialBreakGlassConfig.farmClaimIsPaused              , false);
                assert.equal(initialBreakGlassConfig.onVaultDepositStakeIsPaused    , false);
                assert.equal(initialBreakGlassConfig.onVaultWithdrawStakeIsPaused   , false);
                assert.equal(initialBreakGlassConfig.onVaultLiquidateStakeIsPaused  , false);

                lambdaParams = proxyDoormanInstance.methods.doormanHelper(
                    "lambdaPauseAll", null
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyDoormanInstance.entrypoints.entrypoints.doormanHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await doormanInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                doormanStorage = await doormanInstance.storage();
                const updatedBreakGlassConfig = doormanStorage.breakGlassConfig;

                // Assertion
                assert.equal(updatedBreakGlassConfig.stakeIsPaused                  , true);
                assert.equal(updatedBreakGlassConfig.unstakeIsPaused                , true);
                assert.equal(updatedBreakGlassConfig.compoundIsPaused               , true);
                assert.equal(updatedBreakGlassConfig.farmClaimIsPaused              , true);
                assert.equal(updatedBreakGlassConfig.onVaultDepositStakeIsPaused    , true);
                assert.equal(updatedBreakGlassConfig.onVaultWithdrawStakeIsPaused   , true);
                assert.equal(updatedBreakGlassConfig.onVaultLiquidateStakeIsPaused  , true);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------
                
                lambdaParams = proxyDoormanInstance.methods.doormanHelper(
                    "lambdaUnpauseAll", null
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyDoormanInstance.entrypoints.entrypoints.doormanHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await doormanInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                doormanStorage = await doormanInstance.storage();
                const resetBreakGlassConfig = doormanStorage.breakGlassConfig;

                // Assertion
                assert.equal(resetBreakGlassConfig.stakeIsPaused                  , false);
                assert.equal(resetBreakGlassConfig.unstakeIsPaused                , false);
                assert.equal(resetBreakGlassConfig.compoundIsPaused               , false);
                assert.equal(resetBreakGlassConfig.farmClaimIsPaused              , false);
                assert.equal(resetBreakGlassConfig.onVaultDepositStakeIsPaused    , false);
                assert.equal(resetBreakGlassConfig.onVaultWithdrawStakeIsPaused   , false);
                assert.equal(resetBreakGlassConfig.onVaultLiquidateStakeIsPaused  , false);
                // --------------------------------------------------------

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%togglePauseEntrypoint - admin should be able to call %togglePauseEntrypoint through %executeGovernanceAction", async() => {
            try{

                doormanStorage = await doormanInstance.storage();
                const initialBreakGlassConfig = doormanStorage.breakGlassConfig;

                assert.equal(initialBreakGlassConfig.stakeIsPaused                  , false);
                assert.equal(initialBreakGlassConfig.unstakeIsPaused                , false);
                assert.equal(initialBreakGlassConfig.compoundIsPaused               , false);
                assert.equal(initialBreakGlassConfig.farmClaimIsPaused              , false);
                assert.equal(initialBreakGlassConfig.onVaultDepositStakeIsPaused    , false);
                assert.equal(initialBreakGlassConfig.onVaultWithdrawStakeIsPaused   , false);
                assert.equal(initialBreakGlassConfig.onVaultLiquidateStakeIsPaused  , false);

                lambdaParams = proxyDoormanInstance.methods.doormanHelper(
                    "lambdaTogglePauseEntrypoint", "stake", true 
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyDoormanInstance.entrypoints.entrypoints.doormanHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await doormanInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                doormanStorage = await doormanInstance.storage();
                const updatedBreakGlassConfig = doormanStorage.breakGlassConfig;

                // Assertion
                assert.equal(updatedBreakGlassConfig.stakeIsPaused                  , true);
                assert.equal(initialBreakGlassConfig.unstakeIsPaused                , false);
                assert.equal(initialBreakGlassConfig.compoundIsPaused               , false);
                assert.equal(initialBreakGlassConfig.farmClaimIsPaused              , false);
                assert.equal(initialBreakGlassConfig.onVaultDepositStakeIsPaused    , false);
                assert.equal(initialBreakGlassConfig.onVaultWithdrawStakeIsPaused   , false);
                assert.equal(initialBreakGlassConfig.onVaultLiquidateStakeIsPaused  , false);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------
                
                lambdaParams = proxyDoormanInstance.methods.doormanHelper(
                    "lambdaTogglePauseEntrypoint", "stake", false
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyDoormanInstance.entrypoints.entrypoints.doormanHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await doormanInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                doormanStorage = await doormanInstance.storage();
                const resetBreakGlassConfig = doormanStorage.breakGlassConfig;

                // Assertion
                assert.equal(resetBreakGlassConfig.stakeIsPaused                  , false);
                assert.equal(resetBreakGlassConfig.unstakeIsPaused                , false);
                assert.equal(resetBreakGlassConfig.compoundIsPaused               , false);
                assert.equal(resetBreakGlassConfig.farmClaimIsPaused              , false);
                assert.equal(resetBreakGlassConfig.onVaultDepositStakeIsPaused    , false);
                assert.equal(resetBreakGlassConfig.onVaultWithdrawStakeIsPaused   , false);
                assert.equal(resetBreakGlassConfig.onVaultLiquidateStakeIsPaused  , false);
                // --------------------------------------------------------

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%setAdmin - admin should be able to call %setAdmin through %executeGovernanceAction", async() => {
            try{

                doormanStorage = await doormanInstance.storage();
                const initialAdmin = doormanStorage.admin;
                const newAdmin     = eve.pkh;

                lambdaParams = proxyDoormanInstance.methods.doormanHelper(
                    "lambdaSetAdmin", newAdmin
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyDoormanInstance.entrypoints.entrypoints.doormanHelper;

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
                lambdaParams = proxyDoormanInstance.methods.doormanHelper(
                    "lambdaSetAdmin", initialAdmin
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyDoormanInstance.entrypoints.entrypoints.doormanHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await doormanInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                doormanStorage = await doormanInstance.storage();
                const resetAdmin = doormanStorage.admin;

                // Assertion
                assert.equal(resetAdmin, initialAdmin);
                await signerFactory(bob.sk);
                // --------------------------------------------------------


            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })


        it("%setGovernance - admin should be able to call %setGovernance through %executeGovernanceAction", async() => {
            try{

                doormanStorage = await doormanInstance.storage();
                const initialGovAddress = doormanStorage.governanceAddress;
                const newGovAddress     = eve.pkh;

                lambdaParams = proxyDoormanInstance.methods.doormanHelper(
                    "lambdaSetGovernance", newGovAddress
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyDoormanInstance.entrypoints.entrypoints.doormanHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await doormanInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                doormanStorage = await doormanInstance.storage();
                const updatedGovAddress = doormanStorage.governanceAddress;

                // Assertion
                assert.equal(updatedGovAddress, newGovAddress);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------
                
                lambdaParams = proxyDoormanInstance.methods.doormanHelper(
                    "lambdaSetGovernance", initialGovAddress
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyDoormanInstance.entrypoints.entrypoints.doormanHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await doormanInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                doormanStorage = await doormanInstance.storage();
                const resetGovAddress = doormanStorage.governanceAddress;

                // Assertion
                assert.equal(resetGovAddress, initialGovAddress);
                // --------------------------------------------------------


            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

    })


    describe("delegation contract", async () => {

        it('non-admin (mallory) should not be able to call %executeGovernanceAction', async () => {
    
            // init variables
            await signerFactory(mallory.sk);
            
            const lambdaParams = proxyDelegationInstance.methods.delegationHelper(
                "lambdaSetAdmin", mallory.pkh
            ).toTransferParams();
            const packedDataValue = lambdaParams.parameter.value;
            const packedDataType  = await proxyDelegationInstance.entrypoints.entrypoints.delegationHelper;

            // pack data
            const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

            // Operation
            const failSetAdminOperation  = await delegationInstance.methods.executeGovernanceAction(packedData);
            await chai.expect(failSetAdminOperation.send()).to.be.rejected;    
            
        });


        it("%updateMetadata - admin should be able to call %updateMetadata through %executeGovernanceAction", async() => {
            try{

                delegationStorage = await delegationInstance.storage();
                
                const key                   = 'data';
                const initialMetadata       = await delegationStorage.metadata.get(key);
                const newMetadata           = Buffer.from(
                    JSON.stringify({
                    name: 'MAVRYK Delegation Contract v2',
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

                lambdaParams = proxyDelegationInstance.methods.delegationHelper(
                    "lambdaUpdateMetadata", key, newMetadata
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyDelegationInstance.entrypoints.entrypoints.delegationHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await delegationInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                delegationStorage = await delegationInstance.storage();
                const updatedMetadata = await delegationStorage.metadata.get(key);

                // Assertion
                assert.equal(updatedMetadata, newMetadata);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------

                lambdaParams = proxyDelegationInstance.methods.delegationHelper(
                    "lambdaUpdateMetadata", key, initialMetadata
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyDelegationInstance.entrypoints.entrypoints.delegationHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await delegationInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                delegationStorage = await delegationInstance.storage();
                const resetMetadata = await delegationStorage.metadata.get(key);

                // Assertion
                assert.equal(resetMetadata, initialMetadata);
                // --------------------------------------------------------

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })


        it("%updateConfig - admin should be able to call %updateConfig through %executeGovernanceAction", async() => {
            try{

                delegationStorage = await delegationInstance.storage();

                const initialConfigValue = delegationStorage.config.minMvkAmount;
                const newConfigValue     = MVK(5);

                assert.notEqual(initialConfigValue, newConfigValue);

                lambdaParams = proxyDelegationInstance.methods.delegationHelper(
                    "lambdaUpdateConfig", newConfigValue, 'configMinMvkAmount'
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyDelegationInstance.entrypoints.entrypoints.delegationHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await delegationInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                delegationStorage = await delegationInstance.storage();
                const updatedConfigValue = delegationStorage.config.minMvkAmount;

                // Assertion
                assert.equal(updatedConfigValue, newConfigValue);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------
                
                lambdaParams = proxyDelegationInstance.methods.delegationHelper(
                    "lambdaUpdateConfig", initialConfigValue, 'configMinMvkAmount'
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyDelegationInstance.entrypoints.entrypoints.delegationHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await delegationInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                delegationStorage = await delegationInstance.storage();
                const resetConfigValue = delegationStorage.config.minMvkAmount;

                // Assertion
                assert.equal(resetConfigValue.toNumber(), initialConfigValue.toNumber());
                // --------------------------------------------------------

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })


        it("%updateWhitelistContracts - admin should be able to call %updateWhitelistContracts through %executeGovernanceAction", async() => {
            try{

                delegationStorage = await delegationInstance.storage();

                const initialWhitelistCheck = delegationStorage.whitelistContracts.get("testUpdateWhitelistContracts");
                const newWhitelistAddress   = mallory.pkh;

                assert.notEqual(initialWhitelistCheck, newWhitelistAddress);

                // add whitelist address
                lambdaParams = proxyDelegationInstance.methods.delegationHelper(
                    "lambdaUpdateWhitelistContracts", 'testUpdateWhitelistContracts', newWhitelistAddress
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyDelegationInstance.entrypoints.entrypoints.delegationHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await delegationInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                delegationStorage = await delegationInstance.storage();
                const updatedWhitelistCheck = delegationStorage.whitelistContracts.get("testUpdateWhitelistContracts");

                // Assertion
                assert.equal(updatedWhitelistCheck, newWhitelistAddress);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------
                
                // remove whitelist address by calling entrypoint with same values again
                lambdaParams = proxyDelegationInstance.methods.delegationHelper(
                    "lambdaUpdateWhitelistContracts", 'testUpdateWhitelistContracts', newWhitelistAddress
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyDelegationInstance.entrypoints.entrypoints.delegationHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await delegationInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                delegationStorage = await delegationInstance.storage();
                const resetWhitelistCheck = delegationStorage.whitelistContracts.get("testUpdateWhitelistContracts");

                // Assertion
                assert.equal(resetWhitelistCheck, undefined);
                // --------------------------------------------------------

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })


        it("%updateGeneralContracts - admin should be able to call %updateGeneralContracts through %executeGovernanceAction", async() => {
            try{

                delegationStorage = await delegationInstance.storage();

                const initialGeneralCheck = delegationStorage.generalContracts.get("testUpdateGeneralContracts");
                const newGeneralAddress   = mallory.pkh;

                assert.notEqual(initialGeneralCheck, newGeneralAddress);

                // add general contract address
                lambdaParams = proxyDelegationInstance.methods.delegationHelper(
                    "lambdaUpdateGeneralContracts", 'testUpdateGeneralContracts', newGeneralAddress
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyDelegationInstance.entrypoints.entrypoints.delegationHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await delegationInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                delegationStorage = await delegationInstance.storage();
                const updatedGeneralCheck = delegationStorage.generalContracts.get("testUpdateGeneralContracts");

                // Assertion
                assert.equal(updatedGeneralCheck, newGeneralAddress);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------
                
                // remove general contract address by calling entrypoint with same values again
                lambdaParams = proxyDelegationInstance.methods.delegationHelper(
                    "lambdaUpdateGeneralContracts", 'testUpdateGeneralContracts', newGeneralAddress
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyDelegationInstance.entrypoints.entrypoints.delegationHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await delegationInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                delegationStorage = await delegationInstance.storage();
                const resetGeneralCheck = delegationStorage.generalContracts.get("testUpdateGeneralContracts");

                // Assertion
                assert.equal(resetGeneralCheck, undefined);
                // --------------------------------------------------------

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })


        it("%mistakenTransfer - admin should be able to call %mistakenTransfer through %executeGovernanceAction", async() => {
            try{

                delegationStorage = await delegationInstance.storage();

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

                lambdaParams = proxyDelegationInstance.methods.delegationHelper(
                    "lambdaMistakenTransfer", mistakenTransferParams
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyDelegationInstance.entrypoints.entrypoints.delegationHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await delegationInstance.methods.executeGovernanceAction(packedData).send();
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


        it("%pauseAll and %unpauseAll - admin should be able to call %pauseAll and %unpauseAll through %executeGovernanceAction", async() => {
            try{

                delegationStorage = await delegationInstance.storage();
                const initialBreakGlassConfig = delegationStorage.breakGlassConfig;

                assert.equal(initialBreakGlassConfig.stakeIsPaused                  , false);
                assert.equal(initialBreakGlassConfig.unstakeIsPaused                , false);
                assert.equal(initialBreakGlassConfig.compoundIsPaused               , false);
                assert.equal(initialBreakGlassConfig.farmClaimIsPaused              , false);
                assert.equal(initialBreakGlassConfig.onVaultDepositStakeIsPaused    , false);
                assert.equal(initialBreakGlassConfig.onVaultWithdrawStakeIsPaused   , false);
                assert.equal(initialBreakGlassConfig.onVaultLiquidateStakeIsPaused  , false);

                lambdaParams = proxyDelegationInstance.methods.delegationHelper(
                    "lambdaPauseAll", null
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyDelegationInstance.entrypoints.entrypoints.delegationHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await delegationInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                delegationStorage = await delegationInstance.storage();
                const updatedBreakGlassConfig = delegationStorage.breakGlassConfig;

                // Assertion
                assert.equal(updatedBreakGlassConfig.stakeIsPaused                  , true);
                assert.equal(updatedBreakGlassConfig.unstakeIsPaused                , true);
                assert.equal(updatedBreakGlassConfig.compoundIsPaused               , true);
                assert.equal(updatedBreakGlassConfig.farmClaimIsPaused              , true);
                assert.equal(updatedBreakGlassConfig.onVaultDepositStakeIsPaused    , true);
                assert.equal(updatedBreakGlassConfig.onVaultWithdrawStakeIsPaused   , true);
                assert.equal(updatedBreakGlassConfig.onVaultLiquidateStakeIsPaused  , true);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------
                
                lambdaParams = proxyDelegationInstance.methods.delegationHelper(
                    "lambdaUnpauseAll", null
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyDelegationInstance.entrypoints.entrypoints.delegationHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await delegationInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                delegationStorage = await delegationInstance.storage();
                const resetBreakGlassConfig = delegationStorage.breakGlassConfig;

                // Assertion
                assert.equal(resetBreakGlassConfig.stakeIsPaused                  , false);
                assert.equal(resetBreakGlassConfig.unstakeIsPaused                , false);
                assert.equal(resetBreakGlassConfig.compoundIsPaused               , false);
                assert.equal(resetBreakGlassConfig.farmClaimIsPaused              , false);
                assert.equal(resetBreakGlassConfig.onVaultDepositStakeIsPaused    , false);
                assert.equal(resetBreakGlassConfig.onVaultWithdrawStakeIsPaused   , false);
                assert.equal(resetBreakGlassConfig.onVaultLiquidateStakeIsPaused  , false);
                // --------------------------------------------------------

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%togglePauseEntrypoint - admin should be able to call %togglePauseEntrypoint through %executeGovernanceAction", async() => {
            try{

                delegationStorage = await delegationInstance.storage();
                const initialBreakGlassConfig = delegationStorage.breakGlassConfig;

                assert.equal(initialBreakGlassConfig.stakeIsPaused                  , false);
                assert.equal(initialBreakGlassConfig.unstakeIsPaused                , false);
                assert.equal(initialBreakGlassConfig.compoundIsPaused               , false);
                assert.equal(initialBreakGlassConfig.farmClaimIsPaused              , false);
                assert.equal(initialBreakGlassConfig.onVaultDepositStakeIsPaused    , false);
                assert.equal(initialBreakGlassConfig.onVaultWithdrawStakeIsPaused   , false);
                assert.equal(initialBreakGlassConfig.onVaultLiquidateStakeIsPaused  , false);

                lambdaParams = proxyDelegationInstance.methods.delegationHelper(
                    "lambdaTogglePauseEntrypoint", "stake", true 
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyDelegationInstance.entrypoints.entrypoints.delegationHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await delegationInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                delegationStorage = await delegationInstance.storage();
                const updatedBreakGlassConfig = delegationStorage.breakGlassConfig;

                // Assertion
                assert.equal(updatedBreakGlassConfig.stakeIsPaused                  , true);
                assert.equal(initialBreakGlassConfig.unstakeIsPaused                , false);
                assert.equal(initialBreakGlassConfig.compoundIsPaused               , false);
                assert.equal(initialBreakGlassConfig.farmClaimIsPaused              , false);
                assert.equal(initialBreakGlassConfig.onVaultDepositStakeIsPaused    , false);
                assert.equal(initialBreakGlassConfig.onVaultWithdrawStakeIsPaused   , false);
                assert.equal(initialBreakGlassConfig.onVaultLiquidateStakeIsPaused  , false);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------
                
                lambdaParams = proxyDelegationInstance.methods.delegationHelper(
                    "lambdaTogglePauseEntrypoint", "stake", false
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyDelegationInstance.entrypoints.entrypoints.delegationHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await delegationInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                delegationStorage = await delegationInstance.storage();
                const resetBreakGlassConfig = delegationStorage.breakGlassConfig;

                // Assertion
                assert.equal(resetBreakGlassConfig.stakeIsPaused                  , false);
                assert.equal(resetBreakGlassConfig.unstakeIsPaused                , false);
                assert.equal(resetBreakGlassConfig.compoundIsPaused               , false);
                assert.equal(resetBreakGlassConfig.farmClaimIsPaused              , false);
                assert.equal(resetBreakGlassConfig.onVaultDepositStakeIsPaused    , false);
                assert.equal(resetBreakGlassConfig.onVaultWithdrawStakeIsPaused   , false);
                assert.equal(resetBreakGlassConfig.onVaultLiquidateStakeIsPaused  , false);
                // --------------------------------------------------------

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%setAdmin - admin should be able to call %setAdmin through %executeGovernanceAction", async() => {
            try{

                delegationStorage = await delegationInstance.storage();
                const initialAdmin = delegationStorage.admin;
                const newAdmin     = eve.pkh;

                lambdaParams = proxyDelegationInstance.methods.delegationHelper(
                    "lambdaSetAdmin", newAdmin
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyDelegationInstance.entrypoints.entrypoints.delegationHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await delegationInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                delegationStorage = await delegationInstance.storage();
                const updatedAdmin = delegationStorage.admin;

                // Assertion
                assert.equal(updatedAdmin, newAdmin);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------
                
                await signerFactory(eve.sk);
                lambdaParams = proxyDelegationInstance.methods.delegationHelper(
                    "lambdaSetAdmin", initialAdmin
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyDelegationInstance.entrypoints.entrypoints.delegationHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await delegationInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                delegationStorage = await delegationInstance.storage();
                const resetAdmin = delegationStorage.admin;

                // Assertion
                assert.equal(resetAdmin, initialAdmin);
                await signerFactory(bob.sk);
                // --------------------------------------------------------


            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })


        it("%setGovernance - admin should be able to call %setGovernance through %executeGovernanceAction", async() => {
            try{

                delegationStorage = await delegationInstance.storage();
                const initialGovAddress = delegationStorage.governanceAddress;
                const newGovAddress     = eve.pkh;

                lambdaParams = proxyDelegationInstance.methods.delegationHelper(
                    "lambdaSetGovernance", newGovAddress
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyDelegationInstance.entrypoints.entrypoints.delegationHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await delegationInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                delegationStorage = await delegationInstance.storage();
                const updatedGovAddress = delegationStorage.governanceAddress;

                // Assertion
                assert.equal(updatedGovAddress, newGovAddress);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------
                
                lambdaParams = proxyDelegationInstance.methods.delegationHelper(
                    "lambdaSetGovernance", initialGovAddress
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyDelegationInstance.entrypoints.entrypoints.delegationHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await delegationInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                delegationStorage = await delegationInstance.storage();
                const resetGovAddress = delegationStorage.governanceAddress;

                // Assertion
                assert.equal(resetGovAddress, initialGovAddress);
                // --------------------------------------------------------


            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })
        
    })


    describe("council contract", async () => {

        it('non-admin (mallory) should not be able to call %executeGovernanceAction', async () => {
    
            // init variables
            await signerFactory(mallory.sk);
            
            const lambdaParams = proxyCouncilInstance.methods.councilHelper(
                "lambdaSetAdmin", mallory.pkh
            ).toTransferParams();
            const packedDataValue = lambdaParams.parameter.value;
            const packedDataType  = await proxyCouncilInstance.entrypoints.entrypoints.councilHelper;

            // pack data
            const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

            // Operation
            const failSetAdminOperation  = await councilInstance.methods.executeGovernanceAction(packedData);
            await chai.expect(failSetAdminOperation.send()).to.be.rejected;    
            
        });


        it("%updateMetadata - admin should be able to call %updateMetadata through %executeGovernanceAction", async() => {
            try{

                councilStorage = await councilInstance.storage();
                
                const key                   = 'data';
                const initialMetadata       = await councilStorage.metadata.get(key);
                const newMetadata           = Buffer.from(
                    JSON.stringify({
                    name: 'MAVRYK Council Contract v2',
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

                lambdaParams = proxyCouncilInstance.methods.councilHelper(
                    "lambdaUpdateMetadata", key, newMetadata
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyCouncilInstance.entrypoints.entrypoints.councilHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await councilInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                councilStorage = await councilInstance.storage();
                const updatedMetadata = await councilStorage.metadata.get(key);

                // Assertion
                assert.equal(updatedMetadata, newMetadata);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------

                lambdaParams = proxyCouncilInstance.methods.councilHelper(
                    "lambdaUpdateMetadata", key, initialMetadata
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyCouncilInstance.entrypoints.entrypoints.councilHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await councilInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                councilStorage = await councilInstance.storage();
                const resetMetadata = await councilStorage.metadata.get(key);

                // Assertion
                assert.equal(resetMetadata, initialMetadata);
                // --------------------------------------------------------

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })


        it("%updateConfig - admin should be able to call %updateConfig through %executeGovernanceAction", async() => {
            try{

                councilStorage = await councilInstance.storage();

                const initialConfigValue = councilStorage.config.minMvkAmount;
                const newConfigValue     = MVK(5);

                assert.notEqual(initialConfigValue, newConfigValue);

                lambdaParams = proxyCouncilInstance.methods.councilHelper(
                    "lambdaUpdateConfig", newConfigValue, 'configMinMvkAmount'
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyCouncilInstance.entrypoints.entrypoints.councilHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await councilInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                councilStorage = await councilInstance.storage();
                const updatedConfigValue = councilStorage.config.minMvkAmount;

                // Assertion
                assert.equal(updatedConfigValue, newConfigValue);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------
                
                lambdaParams = proxyCouncilInstance.methods.councilHelper(
                    "lambdaUpdateConfig", initialConfigValue, 'configMinMvkAmount'
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyCouncilInstance.entrypoints.entrypoints.councilHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await councilInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                councilStorage = await councilInstance.storage();
                const resetConfigValue = councilStorage.config.minMvkAmount;

                // Assertion
                assert.equal(resetConfigValue.toNumber(), initialConfigValue.toNumber());
                // --------------------------------------------------------

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })


        it("%updateWhitelistContracts - admin should be able to call %updateWhitelistContracts through %executeGovernanceAction", async() => {
            try{

                councilStorage = await councilInstance.storage();

                const initialWhitelistCheck = councilStorage.whitelistContracts.get("testUpdateWhitelistContracts");
                const newWhitelistAddress   = mallory.pkh;

                assert.notEqual(initialWhitelistCheck, newWhitelistAddress);

                // add whitelist address
                lambdaParams = proxyCouncilInstance.methods.councilHelper(
                    "lambdaUpdateWhitelistContracts", 'testUpdateWhitelistContracts', newWhitelistAddress
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyCouncilInstance.entrypoints.entrypoints.councilHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await councilInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                councilStorage = await councilInstance.storage();
                const updatedWhitelistCheck = councilStorage.whitelistContracts.get("testUpdateWhitelistContracts");

                // Assertion
                assert.equal(updatedWhitelistCheck, newWhitelistAddress);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------
                
                // remove whitelist address by calling entrypoint with same values again
                lambdaParams = proxyCouncilInstance.methods.councilHelper(
                    "lambdaUpdateWhitelistContracts", 'testUpdateWhitelistContracts', newWhitelistAddress
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyCouncilInstance.entrypoints.entrypoints.councilHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await councilInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                councilStorage = await councilInstance.storage();
                const resetWhitelistCheck = councilStorage.whitelistContracts.get("testUpdateWhitelistContracts");

                // Assertion
                assert.equal(resetWhitelistCheck, undefined);
                // --------------------------------------------------------

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })


        it("%updateGeneralContracts - admin should be able to call %updateGeneralContracts through %executeGovernanceAction", async() => {
            try{

                councilStorage = await councilInstance.storage();

                const initialGeneralCheck = councilStorage.generalContracts.get("testUpdateGeneralContracts");
                const newGeneralAddress   = mallory.pkh;

                assert.notEqual(initialGeneralCheck, newGeneralAddress);

                // add general contract address
                lambdaParams = proxyCouncilInstance.methods.councilHelper(
                    "lambdaUpdateGeneralContracts", 'testUpdateGeneralContracts', newGeneralAddress
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyCouncilInstance.entrypoints.entrypoints.councilHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await councilInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                councilStorage = await councilInstance.storage();
                const updatedGeneralCheck = councilStorage.generalContracts.get("testUpdateGeneralContracts");

                // Assertion
                assert.equal(updatedGeneralCheck, newGeneralAddress);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------
                
                // remove general contract address by calling entrypoint with same values again
                lambdaParams = proxyCouncilInstance.methods.councilHelper(
                    "lambdaUpdateGeneralContracts", 'testUpdateGeneralContracts', newGeneralAddress
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyCouncilInstance.entrypoints.entrypoints.councilHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await councilInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                councilStorage = await councilInstance.storage();
                const resetGeneralCheck = councilStorage.generalContracts.get("testUpdateGeneralContracts");

                // Assertion
                assert.equal(resetGeneralCheck, undefined);
                // --------------------------------------------------------

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })


        it("%mistakenTransfer - admin should be able to call %mistakenTransfer through %executeGovernanceAction", async() => {
            try{

                councilStorage = await councilInstance.storage();

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

                lambdaParams = proxyCouncilInstance.methods.councilHelper(
                    "lambdaMistakenTransfer", mistakenTransferParams
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyCouncilInstance.entrypoints.entrypoints.councilHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await councilInstance.methods.executeGovernanceAction(packedData).send();
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

                councilStorage = await councilInstance.storage();
                const initialAdmin = councilStorage.admin;
                const newAdmin     = eve.pkh;

                lambdaParams = proxyCouncilInstance.methods.councilHelper(
                    "lambdaSetAdmin", newAdmin
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyCouncilInstance.entrypoints.entrypoints.councilHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await councilInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                councilStorage = await councilInstance.storage();
                const updatedAdmin = councilStorage.admin;

                // Assertion
                assert.equal(updatedAdmin, newAdmin);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------
                
                await signerFactory(eve.sk);
                lambdaParams = proxyCouncilInstance.methods.councilHelper(
                    "lambdaSetAdmin", initialAdmin
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyCouncilInstance.entrypoints.entrypoints.councilHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await councilInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                councilStorage = await councilInstance.storage();
                const resetAdmin = councilStorage.admin;

                // Assertion
                assert.equal(resetAdmin, initialAdmin);
                await signerFactory(bob.sk);
                // --------------------------------------------------------


            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })


        it("%setGovernance - admin should be able to call %setGovernance through %executeGovernanceAction", async() => {
            try{

                councilStorage = await councilInstance.storage();
                const initialGovAddress = councilStorage.governanceAddress;
                const newGovAddress     = eve.pkh;

                lambdaParams = proxyCouncilInstance.methods.councilHelper(
                    "lambdaSetGovernance", newGovAddress
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyCouncilInstance.entrypoints.entrypoints.councilHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await councilInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                councilStorage = await councilInstance.storage();
                const updatedGovAddress = councilStorage.governanceAddress;

                // Assertion
                assert.equal(updatedGovAddress, newGovAddress);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------
                
                lambdaParams = proxyCouncilInstance.methods.councilHelper(
                    "lambdaSetGovernance", initialGovAddress
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyCouncilInstance.entrypoints.entrypoints.councilHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await councilInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                councilStorage = await councilInstance.storage();
                const resetGovAddress = councilStorage.governanceAddress;

                // Assertion
                assert.equal(resetGovAddress, initialGovAddress);
                // --------------------------------------------------------


            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })
        
    })



    describe("breakGlass contract", async () => {

        it('non-admin (mallory) should not be able to call %executeGovernanceAction', async () => {
    
            // init variables
            await signerFactory(mallory.sk);
            
            const lambdaParams = proxyBreakGlassInstance.methods.breakGlassHelper(
                "lambdaSetAdmin", mallory.pkh
            ).toTransferParams();
            const packedDataValue = lambdaParams.parameter.value;
            const packedDataType  = await proxyBreakGlassInstance.entrypoints.entrypoints.breakGlassHelper;

            // pack data
            const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

            // Operation
            const failSetAdminOperation  = await breakGlassInstance.methods.executeGovernanceAction(packedData);
            await chai.expect(failSetAdminOperation.send()).to.be.rejected;    
            
        });


        it("%updateMetadata - admin should be able to call %updateMetadata through %executeGovernanceAction", async() => {
            try{

                councilStorage = await breakGlassInstance.storage();
                
                const key                   = 'data';
                const initialMetadata       = await councilStorage.metadata.get(key);
                const newMetadata           = Buffer.from(
                    JSON.stringify({
                    name: 'MAVRYK Break Glass Contract v2',
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

                lambdaParams = proxyBreakGlassInstance.methods.breakGlassHelper(
                    "lambdaUpdateMetadata", key, newMetadata
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyBreakGlassInstance.entrypoints.entrypoints.breakGlassHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await breakGlassInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                councilStorage = await breakGlassInstance.storage();
                const updatedMetadata = await councilStorage.metadata.get(key);

                // Assertion
                assert.equal(updatedMetadata, newMetadata);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------

                lambdaParams = proxyBreakGlassInstance.methods.breakGlassHelper(
                    "lambdaUpdateMetadata", key, initialMetadata
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyBreakGlassInstance.entrypoints.entrypoints.breakGlassHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await breakGlassInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                councilStorage = await breakGlassInstance.storage();
                const resetMetadata = await councilStorage.metadata.get(key);

                // Assertion
                assert.equal(resetMetadata, initialMetadata);
                // --------------------------------------------------------

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })


        it("%updateConfig - admin should be able to call %updateConfig through %executeGovernanceAction", async() => {
            try{

                councilStorage = await breakGlassInstance.storage();

                const initialConfigValue = councilStorage.config.minMvkAmount;
                const newConfigValue     = MVK(5);

                assert.notEqual(initialConfigValue, newConfigValue);

                lambdaParams = proxyBreakGlassInstance.methods.breakGlassHelper(
                    "lambdaUpdateConfig", newConfigValue, 'configMinMvkAmount'
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyBreakGlassInstance.entrypoints.entrypoints.breakGlassHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await breakGlassInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                councilStorage = await breakGlassInstance.storage();
                const updatedConfigValue = councilStorage.config.minMvkAmount;

                // Assertion
                assert.equal(updatedConfigValue, newConfigValue);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------
                
                lambdaParams = proxyBreakGlassInstance.methods.breakGlassHelper(
                    "lambdaUpdateConfig", initialConfigValue, 'configMinMvkAmount'
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyBreakGlassInstance.entrypoints.entrypoints.breakGlassHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await breakGlassInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                councilStorage = await breakGlassInstance.storage();
                const resetConfigValue = councilStorage.config.minMvkAmount;

                // Assertion
                assert.equal(resetConfigValue.toNumber(), initialConfigValue.toNumber());
                // --------------------------------------------------------

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })


        it("%updateWhitelistContracts - admin should be able to call %updateWhitelistContracts through %executeGovernanceAction", async() => {
            try{

                councilStorage = await breakGlassInstance.storage();

                const initialWhitelistCheck = councilStorage.whitelistContracts.get("testUpdateWhitelistContracts");
                const newWhitelistAddress   = mallory.pkh;

                assert.notEqual(initialWhitelistCheck, newWhitelistAddress);

                // add whitelist address
                lambdaParams = proxyBreakGlassInstance.methods.breakGlassHelper(
                    "lambdaUpdateWhitelistContracts", 'testUpdateWhitelistContracts', newWhitelistAddress
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyBreakGlassInstance.entrypoints.entrypoints.breakGlassHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await breakGlassInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                councilStorage = await breakGlassInstance.storage();
                const updatedWhitelistCheck = councilStorage.whitelistContracts.get("testUpdateWhitelistContracts");

                // Assertion
                assert.equal(updatedWhitelistCheck, newWhitelistAddress);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------
                
                // remove whitelist address by calling entrypoint with same values again
                lambdaParams = proxyBreakGlassInstance.methods.breakGlassHelper(
                    "lambdaUpdateWhitelistContracts", 'testUpdateWhitelistContracts', newWhitelistAddress
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyBreakGlassInstance.entrypoints.entrypoints.breakGlassHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await breakGlassInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                councilStorage = await breakGlassInstance.storage();
                const resetWhitelistCheck = councilStorage.whitelistContracts.get("testUpdateWhitelistContracts");

                // Assertion
                assert.equal(resetWhitelistCheck, undefined);
                // --------------------------------------------------------

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })


        it("%updateGeneralContracts - admin should be able to call %updateGeneralContracts through %executeGovernanceAction", async() => {
            try{

                councilStorage = await breakGlassInstance.storage();

                const initialGeneralCheck = councilStorage.generalContracts.get("testUpdateGeneralContracts");
                const newGeneralAddress   = mallory.pkh;

                assert.notEqual(initialGeneralCheck, newGeneralAddress);

                // add general contract address
                lambdaParams = proxyBreakGlassInstance.methods.breakGlassHelper(
                    "lambdaUpdateGeneralContracts", 'testUpdateGeneralContracts', newGeneralAddress
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyBreakGlassInstance.entrypoints.entrypoints.breakGlassHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await breakGlassInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                councilStorage = await breakGlassInstance.storage();
                const updatedGeneralCheck = councilStorage.generalContracts.get("testUpdateGeneralContracts");

                // Assertion
                assert.equal(updatedGeneralCheck, newGeneralAddress);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------
                
                // remove general contract address by calling entrypoint with same values again
                lambdaParams = proxyBreakGlassInstance.methods.breakGlassHelper(
                    "lambdaUpdateGeneralContracts", 'testUpdateGeneralContracts', newGeneralAddress
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyBreakGlassInstance.entrypoints.entrypoints.breakGlassHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await breakGlassInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                councilStorage = await breakGlassInstance.storage();
                const resetGeneralCheck = councilStorage.generalContracts.get("testUpdateGeneralContracts");

                // Assertion
                assert.equal(resetGeneralCheck, undefined);
                // --------------------------------------------------------

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })


        it("%mistakenTransfer - admin should be able to call %mistakenTransfer through %executeGovernanceAction", async() => {
            try{

                councilStorage = await breakGlassInstance.storage();

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

                lambdaParams = proxyBreakGlassInstance.methods.breakGlassHelper(
                    "lambdaMistakenTransfer", mistakenTransferParams
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyBreakGlassInstance.entrypoints.entrypoints.breakGlassHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await breakGlassInstance.methods.executeGovernanceAction(packedData).send();
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

                councilStorage = await breakGlassInstance.storage();
                const initialAdmin = councilStorage.admin;
                const newAdmin     = eve.pkh;

                lambdaParams = proxyBreakGlassInstance.methods.breakGlassHelper(
                    "lambdaSetAdmin", newAdmin
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyBreakGlassInstance.entrypoints.entrypoints.breakGlassHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await breakGlassInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                councilStorage = await breakGlassInstance.storage();
                const updatedAdmin = councilStorage.admin;

                // Assertion
                assert.equal(updatedAdmin, newAdmin);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------
                
                await signerFactory(eve.sk);
                lambdaParams = proxyBreakGlassInstance.methods.breakGlassHelper(
                    "lambdaSetAdmin", initialAdmin
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyBreakGlassInstance.entrypoints.entrypoints.breakGlassHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await breakGlassInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                councilStorage = await breakGlassInstance.storage();
                const resetAdmin = councilStorage.admin;

                // Assertion
                assert.equal(resetAdmin, initialAdmin);
                await signerFactory(bob.sk);
                // --------------------------------------------------------


            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })


        it("%setGovernance - admin should be able to call %setGovernance through %executeGovernanceAction", async() => {
            try{

                councilStorage = await breakGlassInstance.storage();
                const initialGovAddress = councilStorage.governanceAddress;
                const newGovAddress     = eve.pkh;

                lambdaParams = proxyBreakGlassInstance.methods.breakGlassHelper(
                    "lambdaSetGovernance", newGovAddress
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyBreakGlassInstance.entrypoints.entrypoints.breakGlassHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await breakGlassInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                councilStorage = await breakGlassInstance.storage();
                const updatedGovAddress = councilStorage.governanceAddress;

                // Assertion
                assert.equal(updatedGovAddress, newGovAddress);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------
                
                lambdaParams = proxyBreakGlassInstance.methods.breakGlassHelper(
                    "lambdaSetGovernance", initialGovAddress
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyBreakGlassInstance.entrypoints.entrypoints.breakGlassHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await breakGlassInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                councilStorage = await breakGlassInstance.storage();
                const resetGovAddress = councilStorage.governanceAddress;

                // Assertion
                assert.equal(resetGovAddress, initialGovAddress);
                // --------------------------------------------------------


            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })
        
    })





    describe("aggregator contract", async () => {

        it('non-admin (mallory) should not be able to call %executeGovernanceAction', async () => {
    
            // init variables
            await signerFactory(mallory.sk);
            
            const lambdaParams = proxyAggregatorInstance.methods.aggregatorHelper(
                "lambdaSetAdmin", mallory.pkh
            ).toTransferParams();
            const packedDataValue = lambdaParams.parameter.value;
            const packedDataType  = await proxyAggregatorInstance.entrypoints.entrypoints.aggregatorHelper;

            // pack data
            const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

            // Operation
            const failSetAdminOperation  = await aggregatorInstance.methods.executeGovernanceAction(packedData);
            await chai.expect(failSetAdminOperation.send()).to.be.rejected;    
            
        });


        it("%updateMetadata - admin should be able to call %updateMetadata through %executeGovernanceAction", async() => {
            try{

                aggregatorStorage = await aggregatorInstance.storage();
                
                const key                   = 'data';
                const initialMetadata       = await aggregatorStorage.metadata.get(key);
                const newMetadata           = Buffer.from(
                    JSON.stringify({
                    name: 'MAVRYK Aggregator Contract v2',
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

                lambdaParams = proxyAggregatorInstance.methods.aggregatorHelper(
                    "lambdaUpdateMetadata", key, newMetadata
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyAggregatorInstance.entrypoints.entrypoints.aggregatorHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await aggregatorInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                aggregatorStorage = await aggregatorInstance.storage();
                const updatedMetadata = await aggregatorStorage.metadata.get(key);

                // Assertion
                assert.equal(updatedMetadata, newMetadata);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------

                lambdaParams = proxyAggregatorInstance.methods.aggregatorHelper(
                    "lambdaUpdateMetadata", key, initialMetadata
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyAggregatorInstance.entrypoints.entrypoints.aggregatorHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await aggregatorInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                aggregatorStorage = await aggregatorInstance.storage();
                const resetMetadata = await aggregatorStorage.metadata.get(key);

                // Assertion
                assert.equal(resetMetadata, initialMetadata);
                // --------------------------------------------------------

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })


        it("%updateConfig - admin should be able to call %updateConfig through %executeGovernanceAction", async() => {
            try{

                aggregatorStorage = await aggregatorInstance.storage();

                const initialConfigValue = aggregatorStorage.config.minMvkAmount;
                const newConfigValue     = MVK(5);

                assert.notEqual(initialConfigValue, newConfigValue);

                lambdaParams = proxyAggregatorInstance.methods.aggregatorHelper(
                    "lambdaUpdateConfig", newConfigValue, 'configMinMvkAmount'
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyAggregatorInstance.entrypoints.entrypoints.aggregatorHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await aggregatorInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                aggregatorStorage = await aggregatorInstance.storage();
                const updatedConfigValue = aggregatorStorage.config.minMvkAmount;

                // Assertion
                assert.equal(updatedConfigValue, newConfigValue);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------
                
                lambdaParams = proxyAggregatorInstance.methods.aggregatorHelper(
                    "lambdaUpdateConfig", initialConfigValue, 'configMinMvkAmount'
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyAggregatorInstance.entrypoints.entrypoints.aggregatorHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await aggregatorInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                aggregatorStorage = await aggregatorInstance.storage();
                const resetConfigValue = aggregatorStorage.config.minMvkAmount;

                // Assertion
                assert.equal(resetConfigValue.toNumber(), initialConfigValue.toNumber());
                // --------------------------------------------------------

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })


        it("%updateWhitelistContracts - admin should be able to call %updateWhitelistContracts through %executeGovernanceAction", async() => {
            try{

                aggregatorStorage = await aggregatorInstance.storage();

                const initialWhitelistCheck = aggregatorStorage.whitelistContracts.get("testUpdateWhitelistContracts");
                const newWhitelistAddress   = mallory.pkh;

                assert.notEqual(initialWhitelistCheck, newWhitelistAddress);

                // add whitelist address
                lambdaParams = proxyAggregatorInstance.methods.aggregatorHelper(
                    "lambdaUpdateWhitelistContracts", 'testUpdateWhitelistContracts', newWhitelistAddress
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyAggregatorInstance.entrypoints.entrypoints.aggregatorHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await aggregatorInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                aggregatorStorage = await aggregatorInstance.storage();
                const updatedWhitelistCheck = aggregatorStorage.whitelistContracts.get("testUpdateWhitelistContracts");

                // Assertion
                assert.equal(updatedWhitelistCheck, newWhitelistAddress);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------
                
                // remove whitelist address by calling entrypoint with same values again
                lambdaParams = proxyAggregatorInstance.methods.aggregatorHelper(
                    "lambdaUpdateWhitelistContracts", 'testUpdateWhitelistContracts', newWhitelistAddress
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyAggregatorInstance.entrypoints.entrypoints.aggregatorHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await aggregatorInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                aggregatorStorage = await aggregatorInstance.storage();
                const resetWhitelistCheck = aggregatorStorage.whitelistContracts.get("testUpdateWhitelistContracts");

                // Assertion
                assert.equal(resetWhitelistCheck, undefined);
                // --------------------------------------------------------

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })


        it("%updateGeneralContracts - admin should be able to call %updateGeneralContracts through %executeGovernanceAction", async() => {
            try{

                aggregatorStorage = await aggregatorInstance.storage();

                const initialGeneralCheck = aggregatorStorage.generalContracts.get("testUpdateGeneralContracts");
                const newGeneralAddress   = mallory.pkh;

                assert.notEqual(initialGeneralCheck, newGeneralAddress);

                // add general contract address
                lambdaParams = proxyAggregatorInstance.methods.aggregatorHelper(
                    "lambdaUpdateGeneralContracts", 'testUpdateGeneralContracts', newGeneralAddress
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyAggregatorInstance.entrypoints.entrypoints.aggregatorHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await aggregatorInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                aggregatorStorage = await aggregatorInstance.storage();
                const updatedGeneralCheck = aggregatorStorage.generalContracts.get("testUpdateGeneralContracts");

                // Assertion
                assert.equal(updatedGeneralCheck, newGeneralAddress);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------
                
                // remove general contract address by calling entrypoint with same values again
                lambdaParams = proxyAggregatorInstance.methods.aggregatorHelper(
                    "lambdaUpdateGeneralContracts", 'testUpdateGeneralContracts', newGeneralAddress
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyAggregatorInstance.entrypoints.entrypoints.aggregatorHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await aggregatorInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                aggregatorStorage = await aggregatorInstance.storage();
                const resetGeneralCheck = aggregatorStorage.generalContracts.get("testUpdateGeneralContracts");

                // Assertion
                assert.equal(resetGeneralCheck, undefined);
                // --------------------------------------------------------

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })


        it("%mistakenTransfer - admin should be able to call %mistakenTransfer through %executeGovernanceAction", async() => {
            try{

                aggregatorStorage = await aggregatorInstance.storage();

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

                lambdaParams = proxyAggregatorInstance.methods.aggregatorHelper(
                    "lambdaMistakenTransfer", mistakenTransferParams
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyAggregatorInstance.entrypoints.entrypoints.aggregatorHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await aggregatorInstance.methods.executeGovernanceAction(packedData).send();
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


        it("%pauseAll and %unpauseAll - admin should be able to call %pauseAll and %unpauseAll through %executeGovernanceAction", async() => {
            try{

                aggregatorStorage = await aggregatorInstance.storage();
                const initialBreakGlassConfig = aggregatorStorage.breakGlassConfig;

                assert.equal(initialBreakGlassConfig.stakeIsPaused                  , false);
                assert.equal(initialBreakGlassConfig.unstakeIsPaused                , false);
                assert.equal(initialBreakGlassConfig.compoundIsPaused               , false);
                assert.equal(initialBreakGlassConfig.farmClaimIsPaused              , false);
                assert.equal(initialBreakGlassConfig.onVaultDepositStakeIsPaused    , false);
                assert.equal(initialBreakGlassConfig.onVaultWithdrawStakeIsPaused   , false);
                assert.equal(initialBreakGlassConfig.onVaultLiquidateStakeIsPaused  , false);

                lambdaParams = proxyAggregatorInstance.methods.aggregatorHelper(
                    "lambdaPauseAll", null
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyAggregatorInstance.entrypoints.entrypoints.aggregatorHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await aggregatorInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                aggregatorStorage = await aggregatorInstance.storage();
                const updatedBreakGlassConfig = aggregatorStorage.breakGlassConfig;

                // Assertion
                assert.equal(updatedBreakGlassConfig.stakeIsPaused                  , true);
                assert.equal(updatedBreakGlassConfig.unstakeIsPaused                , true);
                assert.equal(updatedBreakGlassConfig.compoundIsPaused               , true);
                assert.equal(updatedBreakGlassConfig.farmClaimIsPaused              , true);
                assert.equal(updatedBreakGlassConfig.onVaultDepositStakeIsPaused    , true);
                assert.equal(updatedBreakGlassConfig.onVaultWithdrawStakeIsPaused   , true);
                assert.equal(updatedBreakGlassConfig.onVaultLiquidateStakeIsPaused  , true);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------
                
                lambdaParams = proxyAggregatorInstance.methods.aggregatorHelper(
                    "lambdaUnpauseAll", null
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyAggregatorInstance.entrypoints.entrypoints.aggregatorHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await aggregatorInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                aggregatorStorage = await aggregatorInstance.storage();
                const resetBreakGlassConfig = aggregatorStorage.breakGlassConfig;

                // Assertion
                assert.equal(resetBreakGlassConfig.stakeIsPaused                  , false);
                assert.equal(resetBreakGlassConfig.unstakeIsPaused                , false);
                assert.equal(resetBreakGlassConfig.compoundIsPaused               , false);
                assert.equal(resetBreakGlassConfig.farmClaimIsPaused              , false);
                assert.equal(resetBreakGlassConfig.onVaultDepositStakeIsPaused    , false);
                assert.equal(resetBreakGlassConfig.onVaultWithdrawStakeIsPaused   , false);
                assert.equal(resetBreakGlassConfig.onVaultLiquidateStakeIsPaused  , false);
                // --------------------------------------------------------

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%togglePauseEntrypoint - admin should be able to call %togglePauseEntrypoint through %executeGovernanceAction", async() => {
            try{

                aggregatorStorage = await aggregatorInstance.storage();
                const initialBreakGlassConfig = aggregatorStorage.breakGlassConfig;

                assert.equal(initialBreakGlassConfig.stakeIsPaused                  , false);
                assert.equal(initialBreakGlassConfig.unstakeIsPaused                , false);
                assert.equal(initialBreakGlassConfig.compoundIsPaused               , false);
                assert.equal(initialBreakGlassConfig.farmClaimIsPaused              , false);
                assert.equal(initialBreakGlassConfig.onVaultDepositStakeIsPaused    , false);
                assert.equal(initialBreakGlassConfig.onVaultWithdrawStakeIsPaused   , false);
                assert.equal(initialBreakGlassConfig.onVaultLiquidateStakeIsPaused  , false);

                lambdaParams = proxyAggregatorInstance.methods.aggregatorHelper(
                    "lambdaTogglePauseEntrypoint", "stake", true 
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyAggregatorInstance.entrypoints.entrypoints.aggregatorHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await aggregatorInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                aggregatorStorage = await aggregatorInstance.storage();
                const updatedBreakGlassConfig = aggregatorStorage.breakGlassConfig;

                // Assertion
                assert.equal(updatedBreakGlassConfig.stakeIsPaused                  , true);
                assert.equal(initialBreakGlassConfig.unstakeIsPaused                , false);
                assert.equal(initialBreakGlassConfig.compoundIsPaused               , false);
                assert.equal(initialBreakGlassConfig.farmClaimIsPaused              , false);
                assert.equal(initialBreakGlassConfig.onVaultDepositStakeIsPaused    , false);
                assert.equal(initialBreakGlassConfig.onVaultWithdrawStakeIsPaused   , false);
                assert.equal(initialBreakGlassConfig.onVaultLiquidateStakeIsPaused  , false);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------
                
                lambdaParams = proxyAggregatorInstance.methods.aggregatorHelper(
                    "lambdaTogglePauseEntrypoint", "stake", false
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyAggregatorInstance.entrypoints.entrypoints.aggregatorHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await aggregatorInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                aggregatorStorage = await aggregatorInstance.storage();
                const resetBreakGlassConfig = aggregatorStorage.breakGlassConfig;

                // Assertion
                assert.equal(resetBreakGlassConfig.stakeIsPaused                  , false);
                assert.equal(resetBreakGlassConfig.unstakeIsPaused                , false);
                assert.equal(resetBreakGlassConfig.compoundIsPaused               , false);
                assert.equal(resetBreakGlassConfig.farmClaimIsPaused              , false);
                assert.equal(resetBreakGlassConfig.onVaultDepositStakeIsPaused    , false);
                assert.equal(resetBreakGlassConfig.onVaultWithdrawStakeIsPaused   , false);
                assert.equal(resetBreakGlassConfig.onVaultLiquidateStakeIsPaused  , false);
                // --------------------------------------------------------

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%setAdmin - admin should be able to call %setAdmin through %executeGovernanceAction", async() => {
            try{

                aggregatorStorage = await aggregatorInstance.storage();
                const initialAdmin = aggregatorStorage.admin;
                const newAdmin     = eve.pkh;

                lambdaParams = proxyAggregatorInstance.methods.aggregatorHelper(
                    "lambdaSetAdmin", newAdmin
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyAggregatorInstance.entrypoints.entrypoints.aggregatorHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await aggregatorInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                aggregatorStorage = await aggregatorInstance.storage();
                const updatedAdmin = aggregatorStorage.admin;

                // Assertion
                assert.equal(updatedAdmin, newAdmin);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------
                
                await signerFactory(eve.sk);
                lambdaParams = proxyAggregatorInstance.methods.aggregatorHelper(
                    "lambdaSetAdmin", initialAdmin
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyAggregatorInstance.entrypoints.entrypoints.aggregatorHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await aggregatorInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                aggregatorStorage = await aggregatorInstance.storage();
                const resetAdmin = aggregatorStorage.admin;

                // Assertion
                assert.equal(resetAdmin, initialAdmin);
                await signerFactory(bob.sk);
                // --------------------------------------------------------


            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })


        it("%setGovernance - admin should be able to call %setGovernance through %executeGovernanceAction", async() => {
            try{

                aggregatorStorage = await aggregatorInstance.storage();
                const initialGovAddress = aggregatorStorage.governanceAddress;
                const newGovAddress     = eve.pkh;

                lambdaParams = proxyAggregatorInstance.methods.aggregatorHelper(
                    "lambdaSetGovernance", newGovAddress
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyAggregatorInstance.entrypoints.entrypoints.aggregatorHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await aggregatorInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                aggregatorStorage = await aggregatorInstance.storage();
                const updatedGovAddress = aggregatorStorage.governanceAddress;

                // Assertion
                assert.equal(updatedGovAddress, newGovAddress);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------
                
                lambdaParams = proxyAggregatorInstance.methods.aggregatorHelper(
                    "lambdaSetGovernance", initialGovAddress
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyAggregatorInstance.entrypoints.entrypoints.aggregatorHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await aggregatorInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                aggregatorStorage = await aggregatorInstance.storage();
                const resetGovAddress = aggregatorStorage.governanceAddress;

                // Assertion
                assert.equal(resetGovAddress, initialGovAddress);
                // --------------------------------------------------------


            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })
        
    })



    describe("farm contract", async () => {

        it('non-admin (mallory) should not be able to call %executeGovernanceAction', async () => {
    
            // init variables
            await signerFactory(mallory.sk);
            
            const lambdaParams = proxyFarmInstance.methods.farmHelper(
                "lambdaSetAdmin", mallory.pkh
            ).toTransferParams();
            const packedDataValue = lambdaParams.parameter.value;
            const packedDataType  = await proxyFarmInstance.entrypoints.entrypoints.farmHelper;

            // pack data
            const packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

            // Operation
            const failSetAdminOperation  = await farmInstance.methods.executeGovernanceAction(packedData);
            await chai.expect(failSetAdminOperation.send()).to.be.rejected;    
            
        });


        it("%updateMetadata - admin should be able to call %updateMetadata through %executeGovernanceAction", async() => {
            try{

                farmStorage = await farmInstance.storage();
                
                const key                   = 'data';
                const initialMetadata       = await farmStorage.metadata.get(key);
                const newMetadata           = Buffer.from(
                    JSON.stringify({
                    name: 'MAVRYK Farm Contract v2',
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

                lambdaParams = proxyFarmInstance.methods.farmHelper(
                    "lambdaUpdateMetadata", key, newMetadata
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyFarmInstance.entrypoints.entrypoints.farmHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await farmInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                farmStorage = await farmInstance.storage();
                const updatedMetadata = await farmStorage.metadata.get(key);

                // Assertion
                assert.equal(updatedMetadata, newMetadata);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------

                lambdaParams = proxyFarmInstance.methods.farmHelper(
                    "lambdaUpdateMetadata", key, initialMetadata
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyFarmInstance.entrypoints.entrypoints.farmHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await farmInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                farmStorage = await farmInstance.storage();
                const resetMetadata = await farmStorage.metadata.get(key);

                // Assertion
                assert.equal(resetMetadata, initialMetadata);
                // --------------------------------------------------------

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })


        it("%updateConfig - admin should be able to call %updateConfig through %executeGovernanceAction", async() => {
            try{

                farmStorage = await farmInstance.storage();

                const initialConfigValue = farmStorage.config.minMvkAmount;
                const newConfigValue     = MVK(5);

                assert.notEqual(initialConfigValue, newConfigValue);

                lambdaParams = proxyFarmInstance.methods.farmHelper(
                    "lambdaUpdateConfig", newConfigValue, 'configMinMvkAmount'
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyFarmInstance.entrypoints.entrypoints.farmHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await farmInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                farmStorage = await farmInstance.storage();
                const updatedConfigValue = farmStorage.config.minMvkAmount;

                // Assertion
                assert.equal(updatedConfigValue, newConfigValue);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------
                
                lambdaParams = proxyFarmInstance.methods.farmHelper(
                    "lambdaUpdateConfig", initialConfigValue, 'configMinMvkAmount'
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyFarmInstance.entrypoints.entrypoints.farmHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await farmInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                farmStorage = await farmInstance.storage();
                const resetConfigValue = farmStorage.config.minMvkAmount;

                // Assertion
                assert.equal(resetConfigValue.toNumber(), initialConfigValue.toNumber());
                // --------------------------------------------------------

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })


        it("%updateWhitelistContracts - admin should be able to call %updateWhitelistContracts through %executeGovernanceAction", async() => {
            try{

                farmStorage = await farmInstance.storage();

                const initialWhitelistCheck = farmStorage.whitelistContracts.get("testUpdateWhitelistContracts");
                const newWhitelistAddress   = mallory.pkh;

                assert.notEqual(initialWhitelistCheck, newWhitelistAddress);

                // add whitelist address
                lambdaParams = proxyFarmInstance.methods.farmHelper(
                    "lambdaUpdateWhitelistContracts", 'testUpdateWhitelistContracts', newWhitelistAddress
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyFarmInstance.entrypoints.entrypoints.farmHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await farmInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                farmStorage = await farmInstance.storage();
                const updatedWhitelistCheck = farmStorage.whitelistContracts.get("testUpdateWhitelistContracts");

                // Assertion
                assert.equal(updatedWhitelistCheck, newWhitelistAddress);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------
                
                // remove whitelist address by calling entrypoint with same values again
                lambdaParams = proxyFarmInstance.methods.farmHelper(
                    "lambdaUpdateWhitelistContracts", 'testUpdateWhitelistContracts', newWhitelistAddress
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyFarmInstance.entrypoints.entrypoints.farmHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await farmInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                farmStorage = await farmInstance.storage();
                const resetWhitelistCheck = farmStorage.whitelistContracts.get("testUpdateWhitelistContracts");

                // Assertion
                assert.equal(resetWhitelistCheck, undefined);
                // --------------------------------------------------------

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })


        it("%updateGeneralContracts - admin should be able to call %updateGeneralContracts through %executeGovernanceAction", async() => {
            try{

                farmStorage = await farmInstance.storage();

                const initialGeneralCheck = farmStorage.generalContracts.get("testUpdateGeneralContracts");
                const newGeneralAddress   = mallory.pkh;

                assert.notEqual(initialGeneralCheck, newGeneralAddress);

                // add general contract address
                lambdaParams = proxyFarmInstance.methods.farmHelper(
                    "lambdaUpdateGeneralContracts", 'testUpdateGeneralContracts', newGeneralAddress
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyFarmInstance.entrypoints.entrypoints.farmHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await farmInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                farmStorage = await farmInstance.storage();
                const updatedGeneralCheck = farmStorage.generalContracts.get("testUpdateGeneralContracts");

                // Assertion
                assert.equal(updatedGeneralCheck, newGeneralAddress);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------
                
                // remove general contract address by calling entrypoint with same values again
                lambdaParams = proxyFarmInstance.methods.farmHelper(
                    "lambdaUpdateGeneralContracts", 'testUpdateGeneralContracts', newGeneralAddress
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyFarmInstance.entrypoints.entrypoints.farmHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await farmInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                farmStorage = await farmInstance.storage();
                const resetGeneralCheck = farmStorage.generalContracts.get("testUpdateGeneralContracts");

                // Assertion
                assert.equal(resetGeneralCheck, undefined);
                // --------------------------------------------------------

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })


        it("%mistakenTransfer - admin should be able to call %mistakenTransfer through %executeGovernanceAction", async() => {
            try{

                farmStorage = await farmInstance.storage();

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

                lambdaParams = proxyFarmInstance.methods.farmHelper(
                    "lambdaMistakenTransfer", mistakenTransferParams
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyFarmInstance.entrypoints.entrypoints.farmHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await farmInstance.methods.executeGovernanceAction(packedData).send();
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


        it("%pauseAll and %unpauseAll - admin should be able to call %pauseAll and %unpauseAll through %executeGovernanceAction", async() => {
            try{

                farmStorage = await farmInstance.storage();
                const initialBreakGlassConfig = farmStorage.breakGlassConfig;

                assert.equal(initialBreakGlassConfig.stakeIsPaused                  , false);
                assert.equal(initialBreakGlassConfig.unstakeIsPaused                , false);
                assert.equal(initialBreakGlassConfig.compoundIsPaused               , false);
                assert.equal(initialBreakGlassConfig.farmClaimIsPaused              , false);
                assert.equal(initialBreakGlassConfig.onVaultDepositStakeIsPaused    , false);
                assert.equal(initialBreakGlassConfig.onVaultWithdrawStakeIsPaused   , false);
                assert.equal(initialBreakGlassConfig.onVaultLiquidateStakeIsPaused  , false);

                lambdaParams = proxyFarmInstance.methods.farmHelper(
                    "lambdaPauseAll", null
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyFarmInstance.entrypoints.entrypoints.farmHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await farmInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                farmStorage = await farmInstance.storage();
                const updatedBreakGlassConfig = farmStorage.breakGlassConfig;

                // Assertion
                assert.equal(updatedBreakGlassConfig.stakeIsPaused                  , true);
                assert.equal(updatedBreakGlassConfig.unstakeIsPaused                , true);
                assert.equal(updatedBreakGlassConfig.compoundIsPaused               , true);
                assert.equal(updatedBreakGlassConfig.farmClaimIsPaused              , true);
                assert.equal(updatedBreakGlassConfig.onVaultDepositStakeIsPaused    , true);
                assert.equal(updatedBreakGlassConfig.onVaultWithdrawStakeIsPaused   , true);
                assert.equal(updatedBreakGlassConfig.onVaultLiquidateStakeIsPaused  , true);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------
                
                lambdaParams = proxyFarmInstance.methods.farmHelper(
                    "lambdaUnpauseAll", null
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyFarmInstance.entrypoints.entrypoints.farmHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await farmInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                farmStorage = await farmInstance.storage();
                const resetBreakGlassConfig = farmStorage.breakGlassConfig;

                // Assertion
                assert.equal(resetBreakGlassConfig.stakeIsPaused                  , false);
                assert.equal(resetBreakGlassConfig.unstakeIsPaused                , false);
                assert.equal(resetBreakGlassConfig.compoundIsPaused               , false);
                assert.equal(resetBreakGlassConfig.farmClaimIsPaused              , false);
                assert.equal(resetBreakGlassConfig.onVaultDepositStakeIsPaused    , false);
                assert.equal(resetBreakGlassConfig.onVaultWithdrawStakeIsPaused   , false);
                assert.equal(resetBreakGlassConfig.onVaultLiquidateStakeIsPaused  , false);
                // --------------------------------------------------------

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%togglePauseEntrypoint - admin should be able to call %togglePauseEntrypoint through %executeGovernanceAction", async() => {
            try{

                farmStorage = await farmInstance.storage();
                const initialBreakGlassConfig = farmStorage.breakGlassConfig;

                assert.equal(initialBreakGlassConfig.stakeIsPaused                  , false);
                assert.equal(initialBreakGlassConfig.unstakeIsPaused                , false);
                assert.equal(initialBreakGlassConfig.compoundIsPaused               , false);
                assert.equal(initialBreakGlassConfig.farmClaimIsPaused              , false);
                assert.equal(initialBreakGlassConfig.onVaultDepositStakeIsPaused    , false);
                assert.equal(initialBreakGlassConfig.onVaultWithdrawStakeIsPaused   , false);
                assert.equal(initialBreakGlassConfig.onVaultLiquidateStakeIsPaused  , false);

                lambdaParams = proxyFarmInstance.methods.farmHelper(
                    "lambdaTogglePauseEntrypoint", "stake", true 
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyFarmInstance.entrypoints.entrypoints.farmHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await farmInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                farmStorage = await farmInstance.storage();
                const updatedBreakGlassConfig = farmStorage.breakGlassConfig;

                // Assertion
                assert.equal(updatedBreakGlassConfig.stakeIsPaused                  , true);
                assert.equal(initialBreakGlassConfig.unstakeIsPaused                , false);
                assert.equal(initialBreakGlassConfig.compoundIsPaused               , false);
                assert.equal(initialBreakGlassConfig.farmClaimIsPaused              , false);
                assert.equal(initialBreakGlassConfig.onVaultDepositStakeIsPaused    , false);
                assert.equal(initialBreakGlassConfig.onVaultWithdrawStakeIsPaused   , false);
                assert.equal(initialBreakGlassConfig.onVaultLiquidateStakeIsPaused  , false);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------
                
                lambdaParams = proxyFarmInstance.methods.farmHelper(
                    "lambdaTogglePauseEntrypoint", "stake", false
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyFarmInstance.entrypoints.entrypoints.farmHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await farmInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                farmStorage = await farmInstance.storage();
                const resetBreakGlassConfig = farmStorage.breakGlassConfig;

                // Assertion
                assert.equal(resetBreakGlassConfig.stakeIsPaused                  , false);
                assert.equal(resetBreakGlassConfig.unstakeIsPaused                , false);
                assert.equal(resetBreakGlassConfig.compoundIsPaused               , false);
                assert.equal(resetBreakGlassConfig.farmClaimIsPaused              , false);
                assert.equal(resetBreakGlassConfig.onVaultDepositStakeIsPaused    , false);
                assert.equal(resetBreakGlassConfig.onVaultWithdrawStakeIsPaused   , false);
                assert.equal(resetBreakGlassConfig.onVaultLiquidateStakeIsPaused  , false);
                // --------------------------------------------------------

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%setAdmin - admin should be able to call %setAdmin through %executeGovernanceAction", async() => {
            try{

                farmStorage = await farmInstance.storage();
                const initialAdmin = farmStorage.admin;
                const newAdmin     = eve.pkh;

                lambdaParams = proxyFarmInstance.methods.farmHelper(
                    "lambdaSetAdmin", newAdmin
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyFarmInstance.entrypoints.entrypoints.farmHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await farmInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                farmStorage = await farmInstance.storage();
                const updatedAdmin = farmStorage.admin;

                // Assertion
                assert.equal(updatedAdmin, newAdmin);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------
                
                await signerFactory(eve.sk);
                lambdaParams = proxyFarmInstance.methods.farmHelper(
                    "lambdaSetAdmin", initialAdmin
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyFarmInstance.entrypoints.entrypoints.farmHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await farmInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                farmStorage = await farmInstance.storage();
                const resetAdmin = farmStorage.admin;

                // Assertion
                assert.equal(resetAdmin, initialAdmin);
                await signerFactory(bob.sk);
                // --------------------------------------------------------


            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })


        it("%setGovernance - admin should be able to call %setGovernance through %executeGovernanceAction", async() => {
            try{

                farmStorage = await farmInstance.storage();
                const initialGovAddress = farmStorage.governanceAddress;
                const newGovAddress     = eve.pkh;

                lambdaParams = proxyFarmInstance.methods.farmHelper(
                    "lambdaSetGovernance", newGovAddress
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyFarmInstance.entrypoints.entrypoints.farmHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await farmInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                farmStorage = await farmInstance.storage();
                const updatedGovAddress = farmStorage.governanceAddress;

                // Assertion
                assert.equal(updatedGovAddress, newGovAddress);

                // --------------------------------------------------------
                // Reset test (for re-testability)
                // ------------------------------
                
                lambdaParams = proxyFarmInstance.methods.farmHelper(
                    "lambdaSetGovernance", initialGovAddress
                ).toTransferParams();
                packedDataValue = lambdaParams.parameter.value;
                packedDataType  = await proxyFarmInstance.entrypoints.entrypoints.farmHelper;

                // pack data
                packedData = await sharedTestHelper.packData(rpc, packedDataValue, packedDataType);

                // Operation
                executeGovernanceActionOperation  = await farmInstance.methods.executeGovernanceAction(packedData).send();
                await executeGovernanceActionOperation.confirmation();

                farmStorage = await farmInstance.storage();
                const resetGovAddress = farmStorage.governanceAddress;

                // Assertion
                assert.equal(resetGovAddress, initialGovAddress);
                // --------------------------------------------------------


            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })
        
    })







});
