const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
const { InMemorySigner, importKey } = require("@taquito/signer");
import assert, { ok, rejects, strictEqual } from "assert";
import { Utils, zeroAddress, TEZ } from "./helpers/Utils";
import fs from "fs";
import { confirmOperation } from "../scripts/confirmation";

const chai = require("chai");
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

import env from "../env";
import { alice, bob, eve, mallory } from "../scripts/sandbox/accounts";

import doormanAddress from '../deployments/doormanAddress.json';
import delegationAddress from '../deployments/delegationAddress.json';
import mvkTokenAddress from '../deployments/mvkTokenAddress.json';
import governanceAddress from '../deployments/governanceAddress.json';
import mockFa12TokenAddress from '../deployments/mockFa12TokenAddress.json';
import mockFa2TokenAddress from '../deployments/mockFa2TokenAddress.json';

import usdmTokenControllerAddress from '../deployments/usdmTokenControllerAddress.json';
import usdmTokenAddress from '../deployments/usdmTokenAddress.json';
import cfmmAddress from '../deployments/cfmmAddress.json';

describe("USDM Token Controller tests", async () => {
    var utils: Utils;

    let doormanInstance;
    let delegationInstance;
    let mvkTokenInstance;
    let mockFa12TokenInstance;
    let mockFa2TokenInstance;
    let governanceInstance;
    let usdmTokenControllerInstance;
    let usdmTokenInstance;
    let cfmmInstance;

    let doormanStorage;
    let delegationStorage;
    let mvkTokenStorage;
    let mockFa12TokenStorage;
    let mockFa2TokenStorage;
    let governanceStorage;
    let usdmTokenControllerStorage;
    let usdmTokenStorage;
    let cfmmStorage;
    
    const signerFactory = async (pk) => {
        await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
        return utils.tezos;
    };

    before("setup", async () => {

        utils = new Utils();
        await utils.init(alice.sk);
        

        doormanInstance         = await utils.tezos.contract.at(doormanAddress.address);
        delegationInstance      = await utils.tezos.contract.at(delegationAddress.address);
        mvkTokenInstance        = await utils.tezos.contract.at(mvkTokenAddress.address);
        mockFa12TokenInstance   = await utils.tezos.contract.at(mockFa12TokenAddress.address);
        mockFa2TokenInstance    = await utils.tezos.contract.at(mockFa2TokenAddress.address);
        governanceInstance      = await utils.tezos.contract.at(governanceAddress.address);

        usdmTokenControllerInstance    = await utils.tezos.contract.at(usdmTokenControllerAddress.address);
        usdmTokenInstance              = await utils.tezos.contract.at(usdmTokenAddress.address);
        cfmmInstance                   = await utils.tezos.contract.at(cfmmAddress.address);
            
        doormanStorage              = await doormanInstance.storage();
        delegationStorage           = await delegationInstance.storage();
        mvkTokenStorage             = await mvkTokenInstance.storage();
        mockFa12TokenStorage        = await mockFa12TokenInstance.storage();
        mockFa2TokenStorage         = await mockFa2TokenInstance.storage();
        governanceStorage           = await governanceInstance.storage();
        usdmTokenControllerStorage  = await usdmTokenControllerInstance.storage();
        usdmTokenStorage            = await usdmTokenInstance.storage();
        cfmmStorage                 = await cfmmInstance.storage();

        console.log('-- -- -- -- -- USDM Token Controller Tests -- -- -- --')
        console.log('Doorman Contract deployed at:', doormanInstance.address);
        console.log('Delegation Contract deployed at:', delegationInstance.address);
        console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
        console.log('Mock FA12 Token Contract deployed at:', mockFa12TokenInstance.address);
        console.log('Mock FA2 Token Contract deployed at:', mockFa2TokenInstance.address);
        console.log('Governance Contract deployed at:', governanceInstance.address);
        
        console.log('USDM Token deployed at:', usdmTokenInstance.address);
        console.log('USDM Token Controller deployed at:', usdmTokenControllerInstance.address);
        console.log('CFMM (USDM/XTZ) deployed at:', cfmmInstance.address);

        console.log('Alice address: ' + alice.pkh);
        console.log('Bob address: ' + bob.pkh);
        console.log('Eve address: ' + eve.pkh);

    });

    describe('test: create vaults with no tez ', function () {

        it('user (eve) can create a new vault (depositors: any) with no tez', async () => {
            try{        
                
                // init variables
                await signerFactory(eve.sk);
                const vaultId     = 1;
                const vaultOwner  = eve.pkh;
                const depositors  = "any"

                // user (eve) creates a new vault with no tez
                const userCreatesANewVaultOperation = await usdmTokenControllerInstance.methods.createVault(
                    vaultId, 
                    eve.pkh,  
                    depositors
                    ).send();
                await userCreatesANewVaultOperation.confirmation();

                const updatedTokenControllerStorage = await usdmTokenControllerInstance.storage();
                const vaultHandle = {
                    "id"    : vaultId,
                    "owner" : vaultOwner
                };
                const vault = await updatedTokenControllerStorage.vaults.get(vaultHandle);

                assert.equal(vault.usdmOutstanding, 0);

            } catch(e){
                console.log(e);
            } 

        });    

        it('user (mallory) can create a new vault (depositors: whitelist set) with no tez', async () => {
            try{        

                // init variables
                await signerFactory(mallory.sk);
                const vaultId     = 2;
                const vaultOwner  = mallory.pkh;
                const depositors  = "whitelist";

                // user (mallory) creates a new vault with no tez
                const userCreatesANewVaultOperation = await usdmTokenControllerInstance.methods.createVault(
                    vaultId, 
                    mallory.pkh,  
                    depositors,
                    [mallory.pkh]
                    ).send();
                await userCreatesANewVaultOperation.confirmation();

                const updatedTokenControllerStorage = await usdmTokenControllerInstance.storage();
                const vaultHandle = {
                    "id"    : vaultId,
                    "owner" : vaultOwner
                }
                const vault = await updatedTokenControllerStorage.vaults.get(vaultHandle);

                assert.equal(vault.usdmOutstanding, 0);
                // assert.equal(vault.collateralBalanceLedger, {});
                // assert.equal(vault.collateralTokenAddresses, {});

                
                // console.log(vault);

            } catch(e){
                console.log(e);
            } 

        });    
    
    });

    describe('test: create vaults with tez as initial deposit', function () {
        it('user (mallory) can create a new vault (depositors: any) with 10 tez as initial deposit', async () => {
            try{        
                
                // init variables
                await signerFactory(mallory.sk);
                const vaultId     = 3;
                const vaultOwner  = mallory.pkh;
                const depositors  = "any"
                const tezSent     = 10;

                // user (mallory) creates a new vault
                const userCreatesANewVaultOperation = await usdmTokenControllerInstance.methods.createVault(
                    vaultId, 
                    mallory.pkh,  
                    depositors
                    ).send({ amount : tezSent });
                await userCreatesANewVaultOperation.confirmation();

                const updatedTokenControllerStorage = await usdmTokenControllerInstance.storage();
                const vaultHandle = {
                    "id"    : vaultId,
                    "owner" : vaultOwner
                };
                const vault                 = await updatedTokenControllerStorage.vaults.get(vaultHandle);
                const tezCollateralBalance  = await vault.collateralBalanceLedger.get('tez');

                assert.equal(vault.usdmOutstanding, 0);
                assert.equal(tezCollateralBalance, TEZ(tezSent));

                // console.log(vault);
                // console.log(tezCollateralBalance);

            } catch(e){
                console.log(e);
            } 

        });    

        it('user (eve) can create a new vault (depositors: whitelist set) with 10 tez as initial deposit', async () => {
            try{        
                
                // init variables
                await signerFactory(eve.sk);
                const vaultId     = 4;
                const vaultOwner  = eve.pkh;

                const depositors  = "whitelist";
                const tezSent     = 10;

                // user (eve) creates a new vault
                const userCreatesANewVaultOperation = await usdmTokenControllerInstance.methods.createVault(
                    vaultId, 
                    eve.pkh,  
                    depositors,
                    [eve.pkh]
                    ).send({ amount: tezSent });
                await userCreatesANewVaultOperation.confirmation();

                const updatedTokenControllerStorage = await usdmTokenControllerInstance.storage();
                const vaultHandle = {
                    "id"    : vaultId,
                    "owner" : vaultOwner
                }
                const vault                 = await updatedTokenControllerStorage.vaults.get(vaultHandle);
                const tezCollateralBalance  = await vault.collateralBalanceLedger.get('tez');

                assert.equal(vault.usdmOutstanding, 0);
                assert.equal(tezCollateralBalance, TEZ(tezSent));

            } catch(e){
                console.log(e);
            } 

        });    

    });


    describe('test: deposit tez into vault', function () {
    
        it('user (eve) deposit tez into her vault (depositors: any)', async () => {
            
            // init variables
            await signerFactory(eve.sk);
            const vaultId            = 1;
            const vaultOwner         = eve.pkh;

            const depositAmountMutez = 10000000;
            const depositAmountTez   = 10;

            const vaultHandle = {
                "id"     : vaultId,
                "owner"  : vaultOwner
            };

            const tokenControllerStorage        = await usdmTokenControllerInstance.storage();
            const vault                         = await tokenControllerStorage.vaults.get(vaultHandle);

            // get vault contract
            const vaultAddress             = vault.address;
            const eveVaultInstance         = await utils.tezos.contract.at(vaultAddress);
            const eveVaultInstanceStorage  = await eveVaultInstance.storage();

            const eveDepositTezOperation  = await eveVaultInstance.methods.vaultDeposit(
                eve.pkh,                              // from_
                usdmTokenControllerAddress.address,   // to_
                depositAmountMutez,                   // amt
                "tez"                                 // token
            ).send({ mutez : true, amount : depositAmountMutez });
            await eveDepositTezOperation.confirmation();


            const updatedTokenControllerStorage = await usdmTokenControllerInstance.storage();
            const updatedVault                  = await updatedTokenControllerStorage.vaults.get(vaultHandle);
            const tezCollateralBalance          = await updatedVault.collateralBalanceLedger.get('tez');
            
            assert.equal(tezCollateralBalance, TEZ(depositAmountTez));

        });

        it('user (mallory) can deposit tez into eve\'s vault (depositors: any)', async () => {
            
            // init variables
            await signerFactory(mallory.sk);
            const vaultId            = 1;
            const vaultOwner         = eve.pkh;

            const depositAmountMutez = 10000000;
            const depositAmountTez   = 10;
            const finalAmountMutez   = 20000000;
            const finalAmountTez     = 20;

            const vaultHandle = {
                "id"    : vaultId,
                "owner" : vaultOwner
            };

            const tokenControllerStorage        = await usdmTokenControllerInstance.storage();
            const vault                         = await tokenControllerStorage.vaults.get(vaultHandle);
            const initialTezCollateralBalance   = await vault.collateralBalanceLedger.get('tez');

            // check that initial tez collateral balance is now ten tez
            assert.equal(initialTezCollateralBalance, TEZ(10));

            // get vault contract
            const vaultAddress             = vault.address;
            const eveVaultInstance         = await utils.tezos.contract.at(vaultAddress);
            const eveVaultInstanceStorage  = await eveVaultInstance.storage();

            const malloryDepositTezIntoEveVaultOperation  = await eveVaultInstance.methods.vaultDeposit(
                mallory.pkh,                          // from_
                usdmTokenControllerAddress.address,   // to_
                depositAmountMutez,                   // amt
                "tez"                                 // token
            ).send({ mutez : true, amount : depositAmountMutez });
            await malloryDepositTezIntoEveVaultOperation.confirmation();

            const updatedTokenControllerStorage = await usdmTokenControllerInstance.storage();
            const updatedVault                  = await updatedTokenControllerStorage.vaults.get(vaultHandle);
            const tezCollateralBalance          = await updatedVault.collateralBalanceLedger.get('tez');
            
            // check that tez balance is now 20 tez
            assert.equal(tezCollateralBalance, TEZ(finalAmountTez));

        });

        it('user (mallory) deposit tez into her vault (depositors: whitelist set)', async () => {
            
            // init variables
            await signerFactory(mallory.sk);
            const vaultId            = 2;
            const vaultOwner         = mallory.pkh;
    
            const depositAmountMutez = 10000000;
            const depositAmountTez   = 10;
    
            const vaultHandle = {
                "id"     : vaultId,
                "owner"  : vaultOwner
            };
    
            const tokenControllerStorage        = await usdmTokenControllerInstance.storage();
            const vault                         = await tokenControllerStorage.vaults.get(vaultHandle);
    
            // get vault contract
            const vaultAddress             = vault.address;
            const vaultInstance            = await utils.tezos.contract.at(vaultAddress);
            const vaultInstanceStorage     = await vaultInstance.storage();
    
            const malloryDepositTezOperation  = await vaultInstance.methods.vaultDeposit(
                mallory.pkh,                          // from_
                usdmTokenControllerAddress.address,   // to_
                depositAmountMutez,                   // amt
                "tez"                                 // token
            ).send({ mutez : true, amount : depositAmountMutez });
            await malloryDepositTezOperation.confirmation();
    
            const updatedTokenControllerStorage = await usdmTokenControllerInstance.storage();
            const updatedVault                  = await updatedTokenControllerStorage.vaults.get(vaultHandle);
            const tezCollateralBalance          = await updatedVault.collateralBalanceLedger.get('tez');
            
            assert.equal(tezCollateralBalance, TEZ(depositAmountTez));
    
        });
    
        it('user (eve) cannot deposit tez into mallory\'s vault (depositors: whitelist set)', async () => {
                
            // init variables
            await signerFactory(eve.sk);
            const vaultId            = 2;
            const vaultOwner         = mallory.pkh;
            const depositAmountMutez = 10000000;
            const depositAmountTez   = 10;
            const finalAmountMutez   = 20000000;
            const finalAmountTez     = 20;
    
            const vaultHandle = {
                "id"    : vaultId,
                "owner" : vaultOwner
            };
    
            const tokenControllerStorage        = await usdmTokenControllerInstance.storage();
            const vault                         = await tokenControllerStorage.vaults.get(vaultHandle);
            const initialTezCollateralBalance   = await vault.collateralBalanceLedger.get('tez');
    
            // check that initial tez collateral balance is now ten tez (from previous test)
            assert.equal(initialTezCollateralBalance, TEZ(10));
    
            // get vault contract
            const vaultAddress              = vault.address;
            const vaultInstance             = await utils.tezos.contract.at(vaultAddress);
            const vaultInstanceStorage      = await vaultInstance.storage();
    
            const failEveDepositTezIntoMalloryVaultOperation  = await vaultInstance.methods.vaultDeposit(
                eve.pkh,                              // from_
                usdmTokenControllerAddress.address,   // to_
                depositAmountMutez,                   // amt
                "tez"                                 // token
            );
            await chai.expect(failEveDepositTezIntoMalloryVaultOperation.send({ mutez : true, amount : depositAmountMutez })).to.be.rejected;
            
    
            // const updatedTokenControllerStorage = await usdmTokenControllerInstance.storage();
            // const updatedVault                  = await updatedTokenControllerStorage.vaults.get(vaultHandle);
            // const tezCollateralBalance          = await updatedVault.collateralBalanceLedger.get('tez');
            
            // assert.equal(tezCollateralBalance, TEZ(finalAmountTez));
    
            // const usdmTokenControllerParameterSchema = usdmTokenControllerInstance.parameterSchema.ExtractSchema();
            // console.log(JSON.stringify(usdmTokenControllerParameterSchema,null,2)); 
    
            // const vaultParameterSchema = eveVaultInstance.parameterSchema.ExtractSchema();
            // console.log(JSON.stringify(vaultParameterSchema,null,2));
    
            // // check eve tez balance
            // const eveTezBalance           = await utils.tezos.tz.getBalance(eve.pkh);
            // console.log(eveTezBalance);
    
    
        });
    });

});