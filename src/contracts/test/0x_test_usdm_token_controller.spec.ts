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
import lpTokenUsdmXtzAddress from '../deployments/lpTokenUsdmXtzTokenAddress.json';

import usdmTokenControllerAddress from '../deployments/usdmTokenControllerAddress.json';
import usdmTokenAddress from '../deployments/usdmTokenAddress.json';

// import cfmmAddress from '../deployments/cfmmAddress.json';
import cfmmTezFa2TokenAddress from '../deployments/cfmmTezFa2TokenAddress.json';

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
    let cfmmTezFa2TokenInstance;
    let lpTokenUsdmXtzInstance;

    let doormanStorage;
    let delegationStorage;
    let mvkTokenStorage;
    let mockFa12TokenStorage;
    let mockFa2TokenStorage;
    let governanceStorage;
    
    let usdmTokenControllerStorage;
    let usdmTokenStorage;
    let cfmmStorage;
    let cfmmTezFa2TokenStorage;
    let lpTokenUsdmXtzStorage;
    
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
        // cfmmInstance                   = await utils.tezos.contract.at(cfmmAddress.address);
        cfmmTezFa2TokenInstance        = await utils.tezos.contract.at(cfmmTezFa2TokenAddress.address);
        lpTokenUsdmXtzInstance         = await utils.tezos.contract.at(lpTokenUsdmXtzAddress.address);
            
        doormanStorage              = await doormanInstance.storage();
        delegationStorage           = await delegationInstance.storage();
        mvkTokenStorage             = await mvkTokenInstance.storage();
        mockFa12TokenStorage        = await mockFa12TokenInstance.storage();
        mockFa2TokenStorage         = await mockFa2TokenInstance.storage();
        governanceStorage           = await governanceInstance.storage();
        usdmTokenControllerStorage  = await usdmTokenControllerInstance.storage();
        usdmTokenStorage            = await usdmTokenInstance.storage();
        // cfmmStorage                 = await cfmmInstance.storage();
        cfmmTezFa2TokenStorage      = await cfmmTezFa2TokenInstance.storage();
        lpTokenUsdmXtzStorage       = await lpTokenUsdmXtzInstance.storage();

        console.log('-- -- -- -- -- USDM Token Controller Tests -- -- -- --')
        console.log('Doorman Contract deployed at:', doormanInstance.address);
        console.log('Delegation Contract deployed at:', delegationInstance.address);
        console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
        console.log('Mock FA12 Token Contract deployed at:', mockFa12TokenInstance.address);
        console.log('Mock FA2 Token Contract deployed at:', mockFa2TokenInstance.address);
        console.log('Governance Contract deployed at:', governanceInstance.address);
        
        console.log('USDM Token deployed at:', usdmTokenInstance.address);
        console.log('USDM Token Controller deployed at:', usdmTokenControllerInstance.address);
        // console.log('CFMM (USDM/XTZ) deployed at:', cfmmInstance.address);
        console.log('CFMM (USDM/XTZ) deployed at:', cfmmTezFa2TokenInstance.address);
        console.log('LP Token (USDM/XTZ) deployed at:', lpTokenUsdmXtzInstance.address);

        console.log('Alice address: ' + alice.pkh);
        console.log('Bob address: ' + bob.pkh);
        console.log('Eve address: ' + eve.pkh);

    });


    // 
    // Test: Create vaults with no tez 
    //
    // describe('test: create vaults with no tez', function () {

    //     it('user (eve) can create a new vault (depositors: any) with no tez', async () => {
    //         try{        
                
    //             // init variables
    //             await signerFactory(eve.sk);
    //             const vaultId     = 1;
    //             const vaultOwner  = eve.pkh;
    //             const depositors  = "any"

    //             // user (eve) creates a new vault with no tez
    //             const userCreatesANewVaultOperation = await usdmTokenControllerInstance.methods.createVault(
    //                 vaultId, 
    //                 eve.pkh,  
    //                 depositors
    //                 ).send();
    //             await userCreatesANewVaultOperation.confirmation();

    //             const updatedTokenControllerStorage = await usdmTokenControllerInstance.storage();
    //             const vaultHandle = {
    //                 "id"    : vaultId,
    //                 "owner" : vaultOwner
    //             };
    //             const vault = await updatedTokenControllerStorage.vaults.get(vaultHandle);

    //             assert.equal(vault.usdmOutstanding, 0);

    //         } catch(e){
    //             console.log(e);
    //         } 

    //     });    

    //     it('user (mallory) can create a new vault (depositors: whitelist set) with no tez', async () => {
    //         try{        

    //             // init variables
    //             await signerFactory(mallory.sk);
    //             const vaultId     = 2;
    //             const vaultOwner  = mallory.pkh;
    //             const depositors  = "whitelist";

    //             // user (mallory) creates a new vault with no tez
    //             const userCreatesANewVaultOperation = await usdmTokenControllerInstance.methods.createVault(
    //                 vaultId, 
    //                 mallory.pkh,  
    //                 depositors,
    //                 [mallory.pkh]
    //                 ).send();
    //             await userCreatesANewVaultOperation.confirmation();

    //             const updatedTokenControllerStorage = await usdmTokenControllerInstance.storage();
    //             const vaultHandle = {
    //                 "id"    : vaultId,
    //                 "owner" : vaultOwner
    //             }
    //             const vault = await updatedTokenControllerStorage.vaults.get(vaultHandle);

    //             assert.equal(vault.usdmOutstanding, 0);
    //             // assert.equal(vault.collateralBalanceLedger, {});
    //             // assert.equal(vault.collateralTokenAddresses, {});

                
    //             // console.log(vault);

    //         } catch(e){
    //             console.log(e);
    //         } 

    //     });    
    
    // }); // end test: create vaults with no tez



    // // 
    // // Test: Create vaults with tez as initial deposit
    // //
    // describe('test: create vaults with tez as initial deposit', function () {
    //     it('user (mallory) can create a new vault (depositors: any) with 10 tez as initial deposit', async () => {
    //         try{        
                
    //             // init variables
    //             await signerFactory(mallory.sk);
    //             const vaultId     = 3;
    //             const vaultOwner  = mallory.pkh;
    //             const depositors  = "any"
    //             const tezSent     = 10;

    //             // user (mallory) creates a new vault
    //             const userCreatesANewVaultOperation = await usdmTokenControllerInstance.methods.createVault(
    //                 vaultId, 
    //                 mallory.pkh,  
    //                 depositors
    //                 ).send({ amount : tezSent });
    //             await userCreatesANewVaultOperation.confirmation();

    //             const updatedTokenControllerStorage = await usdmTokenControllerInstance.storage();
    //             const vaultHandle = {
    //                 "id"    : vaultId,
    //                 "owner" : vaultOwner
    //             };
    //             const vault                 = await updatedTokenControllerStorage.vaults.get(vaultHandle);
    //             const tezCollateralBalance  = await vault.collateralBalanceLedger.get('tez');

    //             assert.equal(vault.usdmOutstanding, 0);
    //             assert.equal(tezCollateralBalance, TEZ(tezSent));

    //             // console.log(vault);
    //             // console.log(tezCollateralBalance);

    //         } catch(e){
    //             console.log(e);
    //         } 

    //     });    

    //     it('user (eve) can create a new vault (depositors: whitelist set) with 10 tez as initial deposit', async () => {
    //         try{        
                
    //             // init variables
    //             await signerFactory(eve.sk);
    //             const vaultId     = 4;
    //             const vaultOwner  = eve.pkh;

    //             const depositors  = "whitelist";
    //             const tezSent     = 10;

    //             // user (eve) creates a new vault
    //             const userCreatesANewVaultOperation = await usdmTokenControllerInstance.methods.createVault(
    //                 vaultId, 
    //                 eve.pkh,  
    //                 depositors,
    //                 [eve.pkh]
    //                 ).send({ amount: tezSent });
    //             await userCreatesANewVaultOperation.confirmation();

    //             const updatedTokenControllerStorage = await usdmTokenControllerInstance.storage();
    //             const vaultHandle = {
    //                 "id"    : vaultId,
    //                 "owner" : vaultOwner
    //             }
    //             const vault                 = await updatedTokenControllerStorage.vaults.get(vaultHandle);
    //             const tezCollateralBalance  = await vault.collateralBalanceLedger.get('tez');

    //             assert.equal(vault.usdmOutstanding, 0);
    //             assert.equal(tezCollateralBalance, TEZ(tezSent));

    //         } catch(e){
    //             console.log(e);
    //         } 

    //     });    

    // }); // end test: create vaults with tez as initial deposit



    // // 
    // // Test: Deposit tez into vault
    // //
    // describe('test: deposit tez into vault', function () {
    
    //     it('user (eve) can deposit tez into her vault (depositors: any)', async () => {
            
    //         // init variables
    //         await signerFactory(eve.sk);
    //         const vaultId            = 1;
    //         const vaultOwner         = eve.pkh;

    //         const depositAmountMutez = 10000000;
    //         const depositAmountTez   = 10;

    //         const vaultHandle = {
    //             "id"     : vaultId,
    //             "owner"  : vaultOwner
    //         };

    //         const tokenControllerStorage        = await usdmTokenControllerInstance.storage();
    //         const vault                         = await tokenControllerStorage.vaults.get(vaultHandle);

    //         // get vault contract
    //         const vaultAddress             = vault.address;
    //         const eveVaultInstance         = await utils.tezos.contract.at(vaultAddress);
    //         const eveVaultInstanceStorage  = await eveVaultInstance.storage();

    //         const eveDepositTezOperation  = await eveVaultInstance.methods.vaultDeposit(
    //             eve.pkh,                              // from_
    //             usdmTokenControllerAddress.address,   // to_
    //             depositAmountMutez,                   // amt
    //             "tez"                                 // token
    //         ).send({ mutez : true, amount : depositAmountMutez });
    //         await eveDepositTezOperation.confirmation();


    //         const updatedTokenControllerStorage = await usdmTokenControllerInstance.storage();
    //         const updatedVault                  = await updatedTokenControllerStorage.vaults.get(vaultHandle);
    //         const tezCollateralBalance          = await updatedVault.collateralBalanceLedger.get('tez');
            
    //         assert.equal(tezCollateralBalance, TEZ(depositAmountTez));

    //     });

    //     it('user (mallory) can deposit tez into user (eve)\'s vault (depositors: any)', async () => {
            
    //         // init variables
    //         await signerFactory(mallory.sk);
    //         const vaultId            = 1;
    //         const vaultOwner         = eve.pkh;

    //         const depositAmountMutez = 10000000;
    //         const depositAmountTez   = 10;
    //         const finalAmountMutez   = 20000000;
    //         const finalAmountTez     = 20;

    //         const vaultHandle = {
    //             "id"    : vaultId,
    //             "owner" : vaultOwner
    //         };

    //         const tokenControllerStorage        = await usdmTokenControllerInstance.storage();
    //         const vault                         = await tokenControllerStorage.vaults.get(vaultHandle);
    //         const initialTezCollateralBalance   = await vault.collateralBalanceLedger.get('tez');

    //         // check that initial tez collateral balance is now ten tez
    //         assert.equal(initialTezCollateralBalance, TEZ(10));

    //         // get vault contract
    //         const vaultAddress             = vault.address;
    //         const eveVaultInstance         = await utils.tezos.contract.at(vaultAddress);
    //         const eveVaultInstanceStorage  = await eveVaultInstance.storage();

    //         const malloryDepositTezIntoEveVaultOperation  = await eveVaultInstance.methods.vaultDeposit(
    //             mallory.pkh,                          // from_
    //             usdmTokenControllerAddress.address,   // to_
    //             depositAmountMutez,                   // amt
    //             "tez"                                 // token
    //         ).send({ mutez : true, amount : depositAmountMutez });
    //         await malloryDepositTezIntoEveVaultOperation.confirmation();

    //         const updatedTokenControllerStorage = await usdmTokenControllerInstance.storage();
    //         const updatedVault                  = await updatedTokenControllerStorage.vaults.get(vaultHandle);
    //         const tezCollateralBalance          = await updatedVault.collateralBalanceLedger.get('tez');
            
    //         // check that tez balance is now 20 tez
    //         assert.equal(tezCollateralBalance, TEZ(finalAmountTez));

    //     });

    //     it('user (mallory) deposit tez into her vault (depositors: whitelist set)', async () => {
            
    //         // init variables
    //         await signerFactory(mallory.sk);
    //         const vaultId            = 2;
    //         const vaultOwner         = mallory.pkh;
    
    //         const depositAmountMutez = 10000000;
    //         const depositAmountTez   = 10;
    
    //         const vaultHandle = {
    //             "id"     : vaultId,
    //             "owner"  : vaultOwner
    //         };
    
    //         const tokenControllerStorage        = await usdmTokenControllerInstance.storage();
    //         const vault                         = await tokenControllerStorage.vaults.get(vaultHandle);
    
    //         // get vault contract
    //         const vaultAddress             = vault.address;
    //         const vaultInstance            = await utils.tezos.contract.at(vaultAddress);
    //         const vaultInstanceStorage     = await vaultInstance.storage();
    
    //         const malloryDepositTezOperation  = await vaultInstance.methods.vaultDeposit(
    //             mallory.pkh,                          // from_
    //             usdmTokenControllerAddress.address,   // to_
    //             depositAmountMutez,                   // amt
    //             "tez"                                 // token
    //         ).send({ mutez : true, amount : depositAmountMutez });
    //         await malloryDepositTezOperation.confirmation();
    
    //         const updatedTokenControllerStorage = await usdmTokenControllerInstance.storage();
    //         const updatedVault                  = await updatedTokenControllerStorage.vaults.get(vaultHandle);
    //         const tezCollateralBalance          = await updatedVault.collateralBalanceLedger.get('tez');
            
    //         assert.equal(tezCollateralBalance, TEZ(depositAmountTez));
    
    //     });
    
    //     it('user (eve) cannot deposit tez into user (mallory)\'s vault (depositors: whitelist set)', async () => {
                
    //         // init variables
    //         await signerFactory(eve.sk);
    //         const vaultId            = 2;
    //         const vaultOwner         = mallory.pkh;
    //         const depositAmountMutez = 10000000;
    //         const depositAmountTez   = 10;
    //         const finalAmountMutez   = 20000000;
    //         const finalAmountTez     = 20;
    
    //         const vaultHandle = {
    //             "id"    : vaultId,
    //             "owner" : vaultOwner
    //         };
    
    //         const tokenControllerStorage        = await usdmTokenControllerInstance.storage();
    //         const vault                         = await tokenControllerStorage.vaults.get(vaultHandle);
    //         const initialTezCollateralBalance   = await vault.collateralBalanceLedger.get('tez');
    
    //         // check that initial tez collateral balance is now ten tez (from previous test)
    //         assert.equal(initialTezCollateralBalance, TEZ(10));
    
    //         // get vault contract
    //         const vaultAddress              = vault.address;
    //         const vaultInstance             = await utils.tezos.contract.at(vaultAddress);
    //         const vaultInstanceStorage      = await vaultInstance.storage();
    
    //         const failEveDepositTezIntoMalloryVaultOperation  = await vaultInstance.methods.vaultDeposit(
    //             eve.pkh,                              // from_
    //             usdmTokenControllerAddress.address,   // to_
    //             depositAmountMutez,                   // amt
    //             "tez"                                 // token
    //         );
    //         await chai.expect(failEveDepositTezIntoMalloryVaultOperation.send({ mutez : true, amount : depositAmountMutez })).to.be.rejected;    
    
    //     });

    // }); // end test: deposit tez into vault



    // // 
    // // Test: Deposit Mock FA12 Tokens into vault
    // //
    // describe('test: deposit mock FA12 tokens into vault', function () {
    
    //     it('user (eve) can deposit mock FA12 tokens into her vault (depositors: any)', async () => {
    
    //         // init variables
    //         await signerFactory(eve.sk);
    //         const vaultId            = 1;
    //         const vaultOwner         = eve.pkh;

    //         const depositAmount                = 10000000;   // 10 Mock FA12 Tokens
    //         const initialMockFa12TokenBalance  = 500000000;  // 500 Mock FA12 Tokens
    //         const finalMockFa12TokenBalance    = 490000000;  // 490 Mock FA12 Tokens

    //         // create vault handle
    //         const vaultHandle = {
    //             "id"     : vaultId,
    //             "owner"  : vaultOwner
    //         };

    //         // check that eve has 500 mock FA12 tokens initially
    //         const mockFa12TokenStorage      = await mockFa12TokenInstance.storage();
    //         const eveMockFa12Ledger         = await mockFa12TokenStorage.ledger.get(eve.pkh);            
    //         assert.equal(eveMockFa12Ledger.balance, initialMockFa12TokenBalance);

    //         const tokenControllerStorage        = await usdmTokenControllerInstance.storage();
    //         const vault                         = await tokenControllerStorage.vaults.get(vaultHandle);

    //         // get vault contract
    //         const vaultAddress             = vault.address;
    //         const vaultInstance            = await utils.tezos.contract.at(vaultAddress);

    //         // register vault collateral tokens
    //         const updateVaultCollateralTokens = await vaultInstance.methods.vaultUpdateCollateralTokens(
    //             mockFa12TokenAddress.address,
    //             "mockFA12"
    //         ).send();
    //         await updateVaultCollateralTokens.confirmation();

    //         // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
    //         // reset token allowance
    //         const resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
    //             vaultAddress,
    //             0
    //         ).send();
    //         await resetTokenAllowance.confirmation();

    //         // set new token allowance
    //         const setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
    //             vaultAddress,
    //             depositAmount
    //         ).send();
    //         await setNewTokenAllowance.confirmation();

    //         // eve deposits mock FA12 tokens into vault
    //         const eveDepositMockFa12TokenOperation  = await vaultInstance.methods.vaultDeposit(
    //             eve.pkh,                               // from_
    //             usdmTokenControllerAddress.address,    // to_
    //             depositAmount,                         // amt
    //             "fa12",                                // token
    //             mockFa12TokenAddress.address           // mock FA12 Token address 
    //         ).send();
    //         await eveDepositMockFa12TokenOperation.confirmation();

    //         const updatedTokenControllerStorage     = await usdmTokenControllerInstance.storage();
    //         const updatedVault                      = await updatedTokenControllerStorage.vaults.get(vaultHandle);
    //         const mockFa12TokenCollateralBalance    = await updatedVault.collateralBalanceLedger.get('mockFA12');
            
    //         // vault Mock FA12 Token Collateral Balance
    //         assert.equal(mockFa12TokenCollateralBalance, depositAmount);

    //         // check that eve now has 490 mock FA12 tokens 
    //         const updatedMockFa12TokenStorage      = await mockFa12TokenInstance.storage();
    //         const updatedEveMockFa12Ledger         = await updatedMockFa12TokenStorage.ledger.get(eve.pkh);            
    //         assert.equal(updatedEveMockFa12Ledger.balance, finalMockFa12TokenBalance);

    //         // usdmTokenController Mock FA12 Token Collateral Balance
    //         const usdmTokenControllerMockFa12Account     = await updatedMockFa12TokenStorage.ledger.get(usdmTokenControllerAddress.address);            
    //         assert.equal(usdmTokenControllerMockFa12Account.balance, depositAmount);

    //     });

    //     it('user (mallory) can deposit mock FA12 tokens into user (eve)\'s vault (depositors: any)', async () => {
    
    //         // init variables
    //         await signerFactory(mallory.sk);
    //         const vaultId            = 1;
    //         const vaultOwner         = eve.pkh;

    //         const depositAmount                = 10000000;   // 10 Mock FA12 Tokens
    //         const initialMockFa12TokenBalance  = 500000000;  // 500 Mock FA12 Tokens
    //         const finalMockFa12TokenBalance    = 490000000;  // 490 Mock FA12 Tokens

    //         // create vault handle
    //         const vaultHandle = {
    //             "id"     : vaultId,
    //             "owner"  : vaultOwner
    //         };

    //         // check that mallory has 500 mock FA12 tokens initially
    //         const mockFa12TokenStorage          = await mockFa12TokenInstance.storage();
    //         const malloryMockFa12Ledger         = await mockFa12TokenStorage.ledger.get(mallory.pkh);            
    //         assert.equal(malloryMockFa12Ledger.balance, initialMockFa12TokenBalance);

    //         // get vault from USDM Token Controller
    //         const tokenControllerStorage        = await usdmTokenControllerInstance.storage();
    //         const vault                         = await tokenControllerStorage.vaults.get(vaultHandle);

    //         // get vault contract
    //         const vaultAddress             = vault.address;
    //         const vaultInstance            = await utils.tezos.contract.at(vaultAddress);

    //         // mallory resets mock FA12 tokens allowance then set new allowance to deposit amount
    //         // reset token allowance
    //         const resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
    //             vaultAddress,
    //             0
    //         ).send();
    //         await resetTokenAllowance.confirmation();

    //         // set new token allowance
    //         const setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
    //             vaultAddress,
    //             depositAmount
    //         ).send();
    //         await setNewTokenAllowance.confirmation();

    //         // mallory deposits mock FA12 tokens into eve's vault
    //         const malloryDepositMockFa12TokenOperation  = await vaultInstance.methods.vaultDeposit(
    //             mallory.pkh,                           // from_
    //             usdmTokenControllerAddress.address,    // to_
    //             depositAmount,                         // amt
    //             "fa12",                                // token
    //             mockFa12TokenAddress.address           // mock FA12 Token address 
    //         ).send();
    //         await malloryDepositMockFa12TokenOperation.confirmation();

    //         const updatedTokenControllerStorage     = await usdmTokenControllerInstance.storage();
    //         const updatedVault                      = await updatedTokenControllerStorage.vaults.get(vaultHandle);
    //         const mockFa12TokenCollateralBalance    = await updatedVault.collateralBalanceLedger.get('mockFA12');
            
    //         // vault Mock FA12 Token Collateral Balance
    //         const vaultTokenCollateralBalance = depositAmount + depositAmount;
    //         assert.equal(mockFa12TokenCollateralBalance, vaultTokenCollateralBalance);

    //         // check that mallory now has 490 mock FA12 tokens 
    //         const updatedMockFa12TokenStorage      = await mockFa12TokenInstance.storage();
    //         const updatedEveMockFa12Ledger         = await updatedMockFa12TokenStorage.ledger.get(mallory.pkh);            
    //         assert.equal(updatedEveMockFa12Ledger.balance, finalMockFa12TokenBalance);

    //         // usdm Token Controller Mock FA12 Token Collateral Balance
    //         const usdmTokenControllerTokenCollateralBalance = depositAmount + depositAmount;
    //         const usdmTokenControllerMockFa12Account     = await updatedMockFa12TokenStorage.ledger.get(usdmTokenControllerAddress.address);            
    //         assert.equal(usdmTokenControllerMockFa12Account.balance, usdmTokenControllerTokenCollateralBalance);

    //     });


    //     it('user (eve) cannot deposit tez and mock FA12 tokens into her vault (depositors: any) at the same time', async () => {
    
    //         // init variables
    //         await signerFactory(eve.sk);
    //         const vaultId            = 1;
    //         const vaultOwner         = eve.pkh;
    
    //         const depositAmount                = 10000000;   // 10 Mock FA12 Tokens
    //         const initialMockFa12TokenBalance  = 500000000;  // 500 Mock FA12 Tokens
    //         const finalMockFa12TokenBalance    = 490000000;  // 490 Mock FA12 Tokens
    
    //         // create vault handle
    //         const vaultHandle = {
    //             "id"     : vaultId,
    //             "owner"  : vaultOwner
    //         };
    
    //         const tokenControllerStorage        = await usdmTokenControllerInstance.storage();
    //         const vault                         = await tokenControllerStorage.vaults.get(vaultHandle);
    
    //         // get vault contract
    //         const vaultAddress             = vault.address;
    //         const vaultInstance            = await utils.tezos.contract.at(vaultAddress);
    
    //         // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
    //         // reset token allowance
    //         const resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
    //             vaultAddress,
    //             0
    //         ).send();
    //         await resetTokenAllowance.confirmation();
    
    //         // set new token allowance
    //         const setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
    //             vaultAddress,
    //             depositAmount
    //         ).send();
    //         await setNewTokenAllowance.confirmation();
    
    //         // eve fails to deposit tez and mock FA12 tokens into vault
    //         const failEveDepositTezAndMockFa12TokenOperation  = await vaultInstance.methods.vaultDeposit(
    //             eve.pkh,                               // from_
    //             usdmTokenControllerAddress.address,    // to_
    //             depositAmount,                         // amt
    //             "fa12",                                // token
    //             mockFa12TokenAddress.address           // mock FA12 Token address 
    //         );
    //         await chai.expect(failEveDepositTezAndMockFa12TokenOperation.send({ mutez : true, amount : depositAmount })).to.be.rejected;    
    
    //     });


    //     it('user (mallory) can deposit mock FA12 tokens into her vault (depositors: whitelist set)', async () => {
    
    //         // init variables
    //         await signerFactory(mallory.sk);
    //         const vaultId            = 2;
    //         const vaultOwner         = mallory.pkh;

    //         const depositAmount                = 10000000;   // 10 Mock FA12 Tokens
    //         const initialMockFa12TokenBalance  = 490000000;  // 490 Mock FA12 Tokens
    //         const finalMockFa12TokenBalance    = 480000000;  // 480 Mock FA12 Tokens

    //         // create vault handle
    //         const vaultHandle = {
    //             "id"     : vaultId,
    //             "owner"  : vaultOwner
    //         };

    //         // check that mallory has 500 mock FA12 tokens initially
    //         const mockFa12TokenStorage          = await mockFa12TokenInstance.storage();
    //         const malloryMockFa12Ledger         = await mockFa12TokenStorage.ledger.get(mallory.pkh);            
    //         assert.equal(malloryMockFa12Ledger.balance, initialMockFa12TokenBalance);

    //         // get vault from USDM Token Controller
    //         const tokenControllerStorage        = await usdmTokenControllerInstance.storage();
    //         const vault                         = await tokenControllerStorage.vaults.get(vaultHandle);

    //         // get vault contract
    //         const vaultAddress             = vault.address;
    //         const vaultInstance            = await utils.tezos.contract.at(vaultAddress);

    //         // register vault collateral tokens
    //         const updateVaultCollateralTokens = await vaultInstance.methods.vaultUpdateCollateralTokens(
    //             mockFa12TokenAddress.address,
    //             "mockFA12"
    //         ).send();
    //         await updateVaultCollateralTokens.confirmation();
            
    //         // mallory resets mock FA12 tokens allowance then set new allowance to deposit amount
    //         // reset token allowance
    //         const resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
    //             vaultAddress,
    //             0
    //         ).send();
    //         await resetTokenAllowance.confirmation();

    //         // set new token allowance
    //         const setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
    //             vaultAddress,
    //             depositAmount
    //         ).send();
    //         await setNewTokenAllowance.confirmation();

    //         // mallory deposits mock FA12 tokens into her vault
    //         const malloryDepositMockFa12TokenOperation  = await vaultInstance.methods.vaultDeposit(
    //             mallory.pkh,                           // from_
    //             usdmTokenControllerAddress.address,    // to_
    //             depositAmount,                         // amt
    //             "fa12",                                // token
    //             mockFa12TokenAddress.address           // mock FA12 Token address 
    //         ).send();
    //         await malloryDepositMockFa12TokenOperation.confirmation();

    //         const updatedTokenControllerStorage     = await usdmTokenControllerInstance.storage();
    //         const updatedVault                      = await updatedTokenControllerStorage.vaults.get(vaultHandle);
    //         const mockFa12TokenCollateralBalance    = await updatedVault.collateralBalanceLedger.get('mockFA12');
            
    //         // vault Mock FA12 Token Collateral Balance
    //         const vaultTokenCollateralBalance = depositAmount;
    //         assert.equal(mockFa12TokenCollateralBalance, vaultTokenCollateralBalance);

    //         // check that mallory now has 480 mock FA12 tokens 
    //         const updatedMockFa12TokenStorage      = await mockFa12TokenInstance.storage();
    //         const updatedEveMockFa12Ledger         = await updatedMockFa12TokenStorage.ledger.get(mallory.pkh);            
    //         assert.equal(updatedEveMockFa12Ledger.balance, finalMockFa12TokenBalance);

    //         const usdmTokenControllerMockFa12Account     = await updatedMockFa12TokenStorage.ledger.get(usdmTokenControllerAddress.address);            
    //         const usdmTokenControllerTokenCollateralBalance = depositAmount * 3;
    //         assert.equal(usdmTokenControllerMockFa12Account.balance, usdmTokenControllerTokenCollateralBalance);

    //     });

    //     it('user (eve) cannot deposit mock FA12 tokens into user (mallory)\'s vault (depositors: whitelist set)', async () => {
    
    //         // init variables
    //         await signerFactory(eve.sk);
    //         const vaultId            = 2;
    //         const vaultOwner         = mallory.pkh;
    
    //         const depositAmount                = 10000000;   // 10 Mock FA12 Tokens
    //         const initialMockFa12TokenBalance  = 500000000;  // 500 Mock FA12 Tokens
    //         const finalMockFa12TokenBalance    = 490000000;  // 490 Mock FA12 Tokens
    
    //         // create vault handle
    //         const vaultHandle = {
    //             "id"     : vaultId,
    //             "owner"  : vaultOwner
    //         };
    
    //         const tokenControllerStorage        = await usdmTokenControllerInstance.storage();
    //         const vault                         = await tokenControllerStorage.vaults.get(vaultHandle);
    
    //         // get vault contract
    //         const vaultAddress             = vault.address;
    //         const vaultInstance            = await utils.tezos.contract.at(vaultAddress);
    
    //         // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
    //         // reset token allowance
    //         const resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
    //             vaultAddress,
    //             0
    //         ).send();
    //         await resetTokenAllowance.confirmation();
    
    //         // set new token allowance
    //         const setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
    //             vaultAddress,
    //             depositAmount
    //         ).send();
    //         await setNewTokenAllowance.confirmation();
    
    //         // eve fails to deposit tez and mock FA12 tokens into vault
    //         const failDepositMockFa12TokenOperation  = await vaultInstance.methods.vaultDeposit(
    //             eve.pkh,                               // from_
    //             usdmTokenControllerAddress.address,    // to_
    //             depositAmount,                         // amt
    //             "fa12",                                // token
    //             mockFa12TokenAddress.address           // mock FA12 Token address 
    //         );
    //         await chai.expect(failDepositMockFa12TokenOperation.send()).to.be.rejected;    
    
    //     });

    //     it('user (mallory) cannot deposit tez and mock FA12 tokens into her vault (depositors: whitelist set) at the same time', async () => {
    
    //         // init variables
    //         await signerFactory(mallory.sk);
    //         const vaultId            = 2;
    //         const vaultOwner         = mallory.pkh;
    
    //         const depositAmount                = 10000000;   // 10 Mock FA12 Tokens
    //         const initialMockFa12TokenBalance  = 500000000;  // 500 Mock FA12 Tokens
    //         const finalMockFa12TokenBalance    = 490000000;  // 490 Mock FA12 Tokens
    
    //         // create vault handle
    //         const vaultHandle = {
    //             "id"     : vaultId,
    //             "owner"  : vaultOwner
    //         };
    
    //         const tokenControllerStorage        = await usdmTokenControllerInstance.storage();
    //         const vault                         = await tokenControllerStorage.vaults.get(vaultHandle);
    
    //         // get vault contract
    //         const vaultAddress             = vault.address;
    //         const vaultInstance            = await utils.tezos.contract.at(vaultAddress);
    
    //         // reset mock FA12 tokens allowance then set new allowance to deposit amount
    //         // reset token allowance
    //         const resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
    //             vaultAddress,
    //             0
    //         ).send();
    //         await resetTokenAllowance.confirmation();
    
    //         // set new token allowance
    //         const setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
    //             vaultAddress,
    //             depositAmount
    //         ).send();
    //         await setNewTokenAllowance.confirmation();
    
    //         // mallory fails to deposit tez and mock FA12 tokens into vault
    //         const failDepositTezAndMockFa12TokenOperation  = await vaultInstance.methods.vaultDeposit(
    //             mallory.pkh,                           // from_
    //             usdmTokenControllerAddress.address,    // to_
    //             depositAmount,                         // amt
    //             "fa12",                                // token
    //             mockFa12TokenAddress.address           // mock FA12 Token address 
    //         );
    //         await chai.expect(failDepositTezAndMockFa12TokenOperation.send({ mutez : true, amount : depositAmount })).to.be.rejected;    
    
    //     });


    // }); // end test: deposit mock FA12 tokens into vault



    // // 
    // // Test: Deposit Mock FA2 Tokens into vault
    // //
    // describe('test: deposit mock FA2 tokens into vault', function () {
    
    //     it('user (eve) can deposit mock FA2 tokens into her vault (depositors: any)', async () => {
    
    //         // init variables
    //         await signerFactory(eve.sk);
    //         const vaultId            = 1;
    //         const vaultOwner         = eve.pkh;
    //         const tokenId            = 0;

    //         const depositAmount        = 10000000;   // 10 Mock FA2 Tokens
    //         const initialTokenBalance  = 500000000;  // 500 Mock FA2 Tokens
    //         const finalTokenBalance    = 490000000;  // 490 Mock FA2 Tokens

    //         // create vault handle
    //         const vaultHandle = {
    //             "id"     : vaultId,
    //             "owner"  : vaultOwner
    //         };

    //         // check that eve has 500 mock FA2 tokens initially
    //         const mockFa2TokenStorage       = await mockFa2TokenInstance.storage();
    //         const userTokenAccount          = await mockFa2TokenStorage.ledger.get(eve.pkh);            
    //         assert.equal(userTokenAccount, initialTokenBalance);

    //         const tokenControllerStorage        = await usdmTokenControllerInstance.storage();
    //         const vault                         = await tokenControllerStorage.vaults.get(vaultHandle);

    //         // get vault contract
    //         const vaultAddress             = vault.address;
    //         const vaultInstance            = await utils.tezos.contract.at(vaultAddress);

    //         // register vault collateral tokens
    //         const updateVaultCollateralTokens = await vaultInstance.methods.vaultUpdateCollateralTokens(
    //             mockFa2TokenAddress.address,
    //             "mockFA2"
    //         ).send();
    //         await updateVaultCollateralTokens.confirmation();

    //         // update operators for vault
    //         const updateOperatorsOperation = await mockFa2TokenInstance.methods.update_operators([
    //         {
    //             add_operator: {
    //                 owner: eve.pkh,
    //                 operator: vaultAddress,
    //                 token_id: 0,
    //             },
    //         }])
    //         .send()
    //         await updateOperatorsOperation.confirmation();

    //         // eve deposits mock FA2 tokens into vault
    //         const eveDepositTokenOperation  = await vaultInstance.methods.vaultDeposit(
    //             eve.pkh,                               // from_
    //             usdmTokenControllerAddress.address,    // to_
    //             depositAmount,                         // amt
    //             "fa2",                                 // token
    //             mockFa2TokenAddress.address,           // mock FA12 Token address 
    //             tokenId
    //         ).send();
    //         await eveDepositTokenOperation.confirmation();

    //         const updatedTokenControllerStorage     = await usdmTokenControllerInstance.storage();
    //         const updatedVault                      = await updatedTokenControllerStorage.vaults.get(vaultHandle);
    //         const mockFa2TokenCollateralBalance     = await updatedVault.collateralBalanceLedger.get('mockFA2');
            
    //         // vault Mock FA2 Token Collateral Balance
    //         assert.equal(mockFa2TokenCollateralBalance, depositAmount);

    //         // check that eve now has 490 mock FA2 tokens 
    //         const updatedMockFa2TokenStorage       = await mockFa2TokenInstance.storage();
    //         const updatedUserTokenAccount          = await updatedMockFa2TokenStorage.ledger.get(eve.pkh);            
    //         assert.equal(updatedUserTokenAccount, finalTokenBalance);

    //         // usdmTokenController Mock FA2 Token Collateral Balance
    //         const usdmTokenControllerMockFa2Account     = await updatedMockFa2TokenStorage.ledger.get(usdmTokenControllerAddress.address);            
    //         assert.equal(usdmTokenControllerMockFa2Account, depositAmount);

    //     });


    //     it('user (mallory) can deposit mock FA2 tokens into user (eve)\'s vault (depositors: any)', async () => {
    
    //         // init variables
    //         await signerFactory(mallory.sk);
    //         const vaultId            = 1;
    //         const vaultOwner         = eve.pkh;
    //         const tokenId            = 0;

    //         const depositAmount        = 10000000;   // 10 Mock FA2 Tokens
    //         const initialTokenBalance  = 500000000;  // 500 Mock FA2 Tokens
    //         const finalTokenBalance    = 490000000;  // 490 Mock FA2 Tokens

    //         // create vault handle
    //         const vaultHandle = {
    //             "id"     : vaultId,
    //             "owner"  : vaultOwner
    //         };

    //         // check that mallory has 500 mock FA2 tokens initially
    //         const mockFa2TokenStorage       = await mockFa2TokenInstance.storage();
    //         const userTokenAccount          = await mockFa2TokenStorage.ledger.get(mallory.pkh);            
    //         assert.equal(userTokenAccount, initialTokenBalance);

    //         const tokenControllerStorage        = await usdmTokenControllerInstance.storage();
    //         const vault                         = await tokenControllerStorage.vaults.get(vaultHandle);

    //         // get vault contract
    //         const vaultAddress             = vault.address;
    //         const vaultInstance            = await utils.tezos.contract.at(vaultAddress);

    //         // update operators for vault
    //         const updateOperatorsOperation = await mockFa2TokenInstance.methods.update_operators([
    //         {
    //             add_operator: {
    //                 owner: mallory.pkh,
    //                 operator: vaultAddress,
    //                 token_id: 0,
    //             },
    //         }])
    //         .send()
    //         await updateOperatorsOperation.confirmation();

    //         // mallory deposits mock FA2 tokens into vault
    //         const malloryDepositTokenOperation  = await vaultInstance.methods.vaultDeposit(
    //             mallory.pkh,                           // from_
    //             usdmTokenControllerAddress.address,    // to_
    //             depositAmount,                         // amt
    //             "fa2",                                 // token
    //             mockFa2TokenAddress.address,           // mock FA12 Token address 
    //             tokenId
    //         ).send();
    //         await malloryDepositTokenOperation.confirmation();

    //         const updatedTokenControllerStorage     = await usdmTokenControllerInstance.storage();
    //         const updatedVault                      = await updatedTokenControllerStorage.vaults.get(vaultHandle);
    //         const vaultMockFa2TokenCollateralBalance     = await updatedVault.collateralBalanceLedger.get('mockFA2');
            
    //         // vault Mock FA2 Token Collateral Balance
    //         const mockFa2TokenCollateralBalance = depositAmount + depositAmount; // from previous test as well
    //         assert.equal(vaultMockFa2TokenCollateralBalance, mockFa2TokenCollateralBalance);

    //         // check that mallory now has 490 mock FA2 tokens 
    //         const updatedMockFa2TokenStorage       = await mockFa2TokenInstance.storage();
    //         const updatedUserTokenAccount          = await updatedMockFa2TokenStorage.ledger.get(eve.pkh);            
    //         assert.equal(updatedUserTokenAccount, finalTokenBalance);

    //         // usdmTokenController Mock FA2 Token Collateral Balance
    //         const usdmTokenControllerMockFa2Account      = await updatedMockFa2TokenStorage.ledger.get(usdmTokenControllerAddress.address);            
    //         const usdmTokenControllerMockFa2TokenBalance = depositAmount + depositAmount; // include amounts from previous test as well
    //         assert.equal(usdmTokenControllerMockFa2Account, usdmTokenControllerMockFa2TokenBalance);

    //     });

    //     it('user (eve) cannot deposit tez and mock FA2 tokens into her vault (depositors: any) at the same time', async () => {
    
    //         // init variables
    //         await signerFactory(eve.sk);
    //         const vaultId            = 1;
    //         const vaultOwner         = eve.pkh;
    //         const tokenId            = 0;

    //         const depositAmount                = 10000000;   // 10 Mock FA12 Tokens
    //         const initialTokenBalance          = 490000000;  // 500 Mock FA12 Tokens
    //         const finalTokenBalance            = 490000000;  // 490 Mock FA12 Tokens
    
    //         // create vault handle
    //         const vaultHandle = {
    //             "id"     : vaultId,
    //             "owner"  : vaultOwner
    //         };
    
    //         const tokenControllerStorage        = await usdmTokenControllerInstance.storage();
    //         const vault                         = await tokenControllerStorage.vaults.get(vaultHandle);
    
    //         // get vault contract
    //         const vaultAddress             = vault.address;
    //         const vaultInstance            = await utils.tezos.contract.at(vaultAddress);
    
    //         // update operators for vault
    //         const updateOperatorsOperation = await mockFa2TokenInstance.methods.update_operators([
    //             {
    //                 add_operator: {
    //                     owner: eve.pkh,
    //                     operator: vaultAddress,
    //                     token_id: 0,
    //                 },
    //             }])
    //             .send()
    //         await updateOperatorsOperation.confirmation();
    
    //         // eve fails to deposit tez and mock FA2 tokens into vault at the same time
    //         const failDepositTezAndMockFa2TokenOperation  = await vaultInstance.methods.vaultDeposit(
    //             eve.pkh,                               // from_
    //             usdmTokenControllerAddress.address,    // to_
    //             depositAmount,                         // amt
    //             "fa2",                                 // token
    //             mockFa2TokenAddress.address,           // mock FA2 Token address 
    //             tokenId
    //         );
    //         await chai.expect(failDepositTezAndMockFa2TokenOperation.send({ mutez : true, amount : depositAmount })).to.be.rejected;    
    
    //     });


    //     it('user (mallory) can deposit mock FA2 tokens into her vault (depositors: whitelist set)', async () => {
    
    //         // init variables
    //         await signerFactory(mallory.sk);
    //         const vaultId            = 2;
    //         const vaultOwner         = mallory.pkh;
    //         const tokenId            = 0;

    //         const depositAmount        = 10000000;   // 10 Mock FA2 Tokens
    //         const initialTokenBalance  = 490000000;  // 500 Mock FA2 Tokens
    //         const finalTokenBalance    = 480000000;  // 490 Mock FA2 Tokens

    //         // create vault handle
    //         const vaultHandle = {
    //             "id"     : vaultId,
    //             "owner"  : vaultOwner
    //         };

    //         // check that mallory has 490 mock FA2 tokens initially
    //         const mockFa2TokenStorage       = await mockFa2TokenInstance.storage();
    //         const userTokenAccount          = await mockFa2TokenStorage.ledger.get(mallory.pkh);            
    //         assert.equal(userTokenAccount, initialTokenBalance);

    //         const tokenControllerStorage        = await usdmTokenControllerInstance.storage();
    //         const vault                         = await tokenControllerStorage.vaults.get(vaultHandle);

    //         // get vault contract
    //         const vaultAddress             = vault.address;
    //         const vaultInstance            = await utils.tezos.contract.at(vaultAddress);

    //         // register vault collateral tokens
    //         const updateVaultCollateralTokens = await vaultInstance.methods.vaultUpdateCollateralTokens(
    //             mockFa2TokenAddress.address,
    //             "mockFA2"
    //         ).send();
    //         await updateVaultCollateralTokens.confirmation();

    //         // update operators for vault
    //         const updateOperatorsOperation = await mockFa2TokenInstance.methods.update_operators([
    //         {
    //             add_operator: {
    //                 owner: mallory.pkh,
    //                 operator: vaultAddress,
    //                 token_id: 0,
    //             },
    //         }])
    //         .send()
    //         await updateOperatorsOperation.confirmation();

    //         // mallory deposits mock FA2 tokens into vault
    //         const malloryDepositTokenOperation  = await vaultInstance.methods.vaultDeposit(
    //             mallory.pkh,                           // from_
    //             usdmTokenControllerAddress.address,    // to_
    //             depositAmount,                         // amt
    //             "fa2",                                 // token
    //             mockFa2TokenAddress.address,           // mock FA12 Token address 
    //             tokenId
    //         ).send();
    //         await malloryDepositTokenOperation.confirmation();

    //         const updatedTokenControllerStorage     = await usdmTokenControllerInstance.storage();
    //         const updatedVault                      = await updatedTokenControllerStorage.vaults.get(vaultHandle);
    //         const vaultMockFa2TokenCollateralBalance     = await updatedVault.collateralBalanceLedger.get('mockFA2');
            
    //         // vault Mock FA2 Token Collateral Balance
    //         const mockFa2TokenCollateralBalance = depositAmount; 
    //         assert.equal(vaultMockFa2TokenCollateralBalance, mockFa2TokenCollateralBalance);

    //         // check that mallory now has 480 mock FA2 tokens 
    //         const updatedMockFa2TokenStorage       = await mockFa2TokenInstance.storage();
    //         const updatedUserTokenAccount          = await updatedMockFa2TokenStorage.ledger.get(mallory.pkh);            
    //         assert.equal(updatedUserTokenAccount, finalTokenBalance);

    //         // usdmTokenController Mock FA2 Token Collateral Balance
    //         const usdmTokenControllerMockFa2Account      = await updatedMockFa2TokenStorage.ledger.get(usdmTokenControllerAddress.address);            
    //         const usdmTokenControllerMockFa2TokenBalance = depositAmount * 3; // include amounts from previous tests as well
    //         assert.equal(usdmTokenControllerMockFa2Account, usdmTokenControllerMockFa2TokenBalance);

    //     });


    //     it('user (eve) cannot deposit mock FA2 tokens into user (mallory)\'s vault (depositors: whitelist set)', async () => {
    
    //         // init variables
    //         await signerFactory(eve.sk);
    //         const vaultId            = 2;
    //         const vaultOwner         = mallory.pkh;
    //         const tokenId            = 0;

    //         const depositAmount                = 10000000;   // 10 Mock FA12 Tokens
    //         const initialTokenBalance          = 490000000;  // 500 Mock FA12 Tokens
    //         const finalTokenBalance            = 490000000;  // 490 Mock FA12 Tokens
    
    //         // create vault handle
    //         const vaultHandle = {
    //             "id"     : vaultId,
    //             "owner"  : vaultOwner
    //         };
    
    //         const tokenControllerStorage        = await usdmTokenControllerInstance.storage();
    //         const vault                         = await tokenControllerStorage.vaults.get(vaultHandle);
    
    //         // get vault contract
    //         const vaultAddress             = vault.address;
    //         const vaultInstance            = await utils.tezos.contract.at(vaultAddress);
    
    //         // update operators for vault
    //         const updateOperatorsOperation = await mockFa2TokenInstance.methods.update_operators([
    //             {
    //                 add_operator: {
    //                     owner: eve.pkh,
    //                     operator: vaultAddress,
    //                     token_id: 0,
    //                 },
    //             }])
    //             .send()
    //         await updateOperatorsOperation.confirmation();
    
    //         // eve fails to deposit tez and mock FA2 tokens into vault at the same time
    //         const failDepositMockFa2TokenOperation  = await vaultInstance.methods.vaultDeposit(
    //             eve.pkh,                               // from_
    //             usdmTokenControllerAddress.address,    // to_
    //             depositAmount,                         // amt
    //             "fa2",                                 // token
    //             mockFa2TokenAddress.address,           // mock FA2 Token address 
    //             tokenId
    //         );
    //         await chai.expect(failDepositMockFa2TokenOperation.send()).to.be.rejected;    
    
    //     });


    //     it('user (mallory) cannot deposit tez and mock FA2 tokens into her vault (depositors: whitelist set) at the same time', async () => {
    
    //         // init variables
    //         await signerFactory(mallory.sk);
    //         const vaultId            = 2;
    //         const vaultOwner         = mallory.pkh;
    //         const tokenId            = 0;

    //         const depositAmount                = 10000000;   // 10 Mock FA12 Tokens
    //         const initialTokenBalance          = 480000000;  // 500 Mock FA12 Tokens
    //         const finalTokenBalance            = 480000000;  // 490 Mock FA12 Tokens
    
    //         // create vault handle
    //         const vaultHandle = {
    //             "id"     : vaultId,
    //             "owner"  : vaultOwner
    //         };
    
    //         const tokenControllerStorage        = await usdmTokenControllerInstance.storage();
    //         const vault                         = await tokenControllerStorage.vaults.get(vaultHandle);
    
    //         // get vault contract
    //         const vaultAddress             = vault.address;
    //         const vaultInstance            = await utils.tezos.contract.at(vaultAddress);
    
    //         // update operators for vault
    //         const updateOperatorsOperation = await mockFa2TokenInstance.methods.update_operators([
    //             {
    //                 add_operator: {
    //                     owner: mallory.pkh,
    //                     operator: vaultAddress,
    //                     token_id: 0,
    //                 },
    //             }])
    //             .send()
    //         await updateOperatorsOperation.confirmation();
    
    //         // eve fails to deposit tez and mock FA2 tokens into vault at the same time
    //         const failDepositTezAndMockFa2TokenOperation  = await vaultInstance.methods.vaultDeposit(
    //             mallory.pkh,                           // from_
    //             usdmTokenControllerAddress.address,    // to_
    //             depositAmount,                         // amt
    //             "fa2",                                 // token
    //             mockFa2TokenAddress.address,           // mock FA2 Token address 
    //             tokenId
    //         );
    //         await chai.expect(failDepositTezAndMockFa2TokenOperation.send({ mutez : true, amount : depositAmount })).to.be.rejected;    
    
    //     });

    // }); // end test: deposit mock FA2 tokens into vault



    // 
    // Test: Setup CFMM XTZ/USDM
    //
    describe('test: setup CFMM (XTZ/USDM)', function () {

        it('user (alice) can deposit tez into the CFMM cash pool', async () => {
    
            // init variables
            await signerFactory(alice.sk);

            // initial cash pool of 0
            const cfmmXtzUsdmStorage = await cfmmTezFa2TokenInstance.storage();
            assert.equal(cfmmXtzUsdmStorage.cashPool, 0);

            const tezAmount   = 500;
            const mutezAmount = 500000000;
            const aliceTransferTezToCfmmOperation = await utils.tezos.contract.transfer(
                    { 
                        to:     cfmmTezFa2TokenAddress.address, 
                        amount: tezAmount
                    }
                );
            await aliceTransferTezToCfmmOperation.confirmation();

            // updated cash pool
            const updatedCfmmXtzUsdmStorage = await cfmmTezFa2TokenInstance.storage();
            assert.equal(updatedCfmmXtzUsdmStorage.cashPool, mutezAmount);

        });

        // it('user (alice) can deposit USDM FA2 Token into the CFMM token pool', async () => {
    
        //     // init variables
        //     await signerFactory(alice.sk);

        //     // token pool already initialised to 2000 when deploying the contract
        //     const usdmAmount    = 2000;
        //     const usdmMuAmount  = 2000000000;
        //     const aliceTransferUsdmToCfmmOperation = await usdmTokenInstance.methods.transfer([
        //         {
        //             from_: alice.pkh,
        //             txs: [
        //                 {
        //                     to_: cfmmTezFa2TokenAddress.address,
        //                     token_id: 0,
        //                     amount: usdmMuAmount
        //                 }
        //             ]
        //         }
        //     ]).send();
        //     await aliceTransferUsdmToCfmmOperation.confirmation();

        //     const usdmTokenStorage           = await usdmTokenInstance.storage();
        //     const cfmmUsdmAccount            = await usdmTokenStorage.ledger.get(cfmmTezFa2TokenAddress.address);

        //     assert.equal(cfmmUsdmAccount, usdmMuAmount);
            
        // });
    
    }); // end test: Setup CFMM XTZ/USDM



    // 
    // Test: CFMM (XTZ/USDM) Liquidity Actions
    //
    describe('test: CFMM (XTZ/USDM) Liquidity Actions', function () {

        it('user (alice) can add liquidity to the CFMM contract and receive corresponding LP tokens', async () => {
    
            // init variables
            await signerFactory(alice.sk);

            // check that alice has no LP tokens initially
            const lpTokenUsdmXtzStorage         = await lpTokenUsdmXtzInstance.storage();
            const aliceUsdmXtzLpTokenBalance    = await lpTokenUsdmXtzStorage.ledger.get(alice.pkh);
            assert.equal(aliceUsdmXtzLpTokenBalance, undefined);

            // init parameters - assume 1 XTZ = 4 USDM i.e. 1 xtz = $4 USD
            const cashDeposited       = 25000000;          // 25 XTZ
            const deadline            = new Date(Date.now() + (10 * 60));
            const maxTokensDeposited  = 100000000;        // 100 USDM Tokens
            const minLpTokensMinted   = 25000000;         // 25 LP Tokens
            const owner               = alice.pkh;        // alice

            const aliceAddsLiquidityOperation = await cfmmTezFa2TokenInstance.methods.addLiquidity(
                cashDeposited,
                deadline,
                maxTokensDeposited,
                minLpTokensMinted,
                owner
            ).send({ mutez : true, amount: cashDeposited })

            const updatedLpTokenUsdmXtzStorage         = await lpTokenUsdmXtzInstance.storage();
            const updatedAliceUsdmXtzLpTokenBalance    = await updatedLpTokenUsdmXtzStorage.ledger.get(alice.pkh);

            const updatedCfmmXtzUsdmStorage            = await cfmmTezFa2TokenInstance.storage();

            console.log("--- --- --- --- --- --- --- --- --- ---");
            console.log("updated after adding liquidity");
            console.log("--- --- --- --- --- --- --- --- --- ---");
            console.log(updatedLpTokenUsdmXtzStorage);
            console.log(updatedAliceUsdmXtzLpTokenBalance);

            console.log(updatedCfmmXtzUsdmStorage);

        });


    }); // end test: CFMM (XTZ/USDM) Liquidity Actions

});