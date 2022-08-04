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

import lendingControllerAddress from '../deployments/lendingControllerAddress.json';

describe("Lending Controller tests", async () => {
    
    var utils: Utils

    let doormanInstance
    let delegationInstance
    let mvkTokenInstance
    let mockFa12TokenInstance
    let mockFa2TokenInstance
    let governanceInstance

    let lendingControllerInstance


    let doormanStorage
    let delegationStorage
    let mvkTokenStorage
    let mockFa12TokenStorage
    let mockFa2TokenStorage
    let governanceStorage

    let lendingControllerStorage
    
    const signerFactory = async (pk) => {
        await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
        return utils.tezos;
    };

    before("setup", async () => {

        utils = new Utils();
        await utils.init(alice.sk);
        
        doormanInstance             = await utils.tezos.contract.at(doormanAddress.address);
        delegationInstance          = await utils.tezos.contract.at(delegationAddress.address);
        mvkTokenInstance            = await utils.tezos.contract.at(mvkTokenAddress.address);
        mockFa12TokenInstance       = await utils.tezos.contract.at(mockFa12TokenAddress.address);
        mockFa2TokenInstance        = await utils.tezos.contract.at(mockFa2TokenAddress.address);
        governanceInstance          = await utils.tezos.contract.at(governanceAddress.address);

        lendingControllerInstance   = await utils.tezos.contract.at(lendingControllerAddress.address);

        console.log('lending controller address');
        console.log(lendingControllerAddress);

        doormanStorage              = await doormanInstance.storage();
        delegationStorage           = await delegationInstance.storage();
        mvkTokenStorage             = await mvkTokenInstance.storage();
        mockFa12TokenStorage        = await mockFa12TokenInstance.storage();
        mockFa2TokenStorage         = await mockFa2TokenInstance.storage();
        governanceStorage           = await governanceInstance.storage();
        lendingControllerStorage    = await lendingControllerInstance.storage();

        console.log('-- -- -- -- -- Lending Controller Tests -- -- -- --')
        console.log('Doorman Contract deployed at:', doormanInstance.address);
        console.log('Delegation Contract deployed at:', delegationInstance.address);
        console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
        console.log('Mock FA12 Token Contract deployed at:', mockFa12TokenInstance.address);
        console.log('Mock FA2 Token Contract deployed at:', mockFa2TokenInstance.address);
        console.log('Governance Contract deployed at:', governanceInstance.address);

        console.log('Lending Controller Contract deployed at:', lendingControllerInstance.address);

        console.log('Alice address: ' + alice.pkh);
        console.log('Bob address: ' + bob.pkh);
        console.log('Eve address: ' + eve.pkh);

    });


    // 
    // Test: Create vaults with no tez 
    //
    describe('test: create vaults with no tez', function () {

        it('user (eve) can create a new vault (depositors: any) with no tez', async () => {
            try{        
                
                // init variables
                await signerFactory(eve.sk);
                const vaultId       = 1;
                const vaultOwner    = eve.pkh;
                const depositors    = "any";
                const loanTokenName = "USDT";

                // user (eve) creates a new vault with no tez
                const userCreatesANewVaultOperation = await lendingControllerInstance.methods.createVault(
                    // vaultId, 
                    eve.pkh,  
                    depositors,
                    loanTokenName
                    ).send();
                await userCreatesANewVaultOperation.confirmation();

                const updatedTokenControllerStorage = await lendingControllerInstance.storage();
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

        // it('user (mallory) can create a new vault (depositors: whitelist set) with no tez', async () => {
        //     try{        

        //         // init variables
        //         await signerFactory(mallory.sk);
        //         const vaultId       = 2;
        //         const vaultOwner    = mallory.pkh;
        //         const depositors    = "whitelist";
        //         const loanTokenName = "USDT";

        //         // user (mallory) creates a new vault with no tez
        //         const userCreatesANewVaultOperation = await lendingControllerInstance.methods.createVault(
        //             // vaultId, 
        //             mallory.pkh,  
        //             depositors,
        //             [mallory.pkh],
        //             loanTokenName
        //             ).send();
        //         await userCreatesANewVaultOperation.confirmation();

        //         const updatedTokenControllerStorage = await lendingControllerInstance.storage();
        //         const vaultHandle = {
        //             "id"    : vaultId,
        //             "owner" : vaultOwner
        //         }
        //         const vault = await updatedTokenControllerStorage.vaults.get(vaultHandle);

        //         assert.equal(vault.usdmOutstanding, 0);
        //         // assert.equal(vault.collateralBalanceLedger, {});
        //         // assert.equal(vault.collateralTokenAddresses, {});

                
        //         // console.log(vault);

        //     } catch(e){
        //         console.log(e);
        //     } 

        // });    
    
    }); // end test: create vaults with no tez



    // 
    // Test: Create vaults with tez as initial deposit
    //
    // describe('test: create vaults with tez as initial deposit', function () {
    //     it('user (mallory) can create a new vault (depositors: any) with 10 tez as initial deposit', async () => {
    //         try{        
                
    //             // init variables
    //             await signerFactory(mallory.sk);
    //             const vaultId     = 3;
    //             const vaultOwner  = mallory.pkh;
    //             const depositors  = "any"
    //             const tezSent     = 10;
    //             const loanTokenName = "USDT";

    //             // user (mallory) creates a new vault
    //             const userCreatesANewVaultOperation = await lendingControllerInstance.methods.createVault(
    //                 // vaultId, 
    //                 mallory.pkh,  
    //                 depositors,
    //                 loanTokenName
    //                 ).send({ amount : tezSent });
    //             await userCreatesANewVaultOperation.confirmation();

    //             const updatedTokenControllerStorage = await lendingControllerInstance.storage();
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
    //             const vaultId       = 4;
    //             const vaultOwner    = eve.pkh;
    //             const depositors    = "whitelist";
    //             const tezSent       = 10;
    //             const loanTokenName = "USDT";

    //             // user (eve) creates a new vault
    //             const userCreatesANewVaultOperation = await lendingControllerInstance.methods.createVault(
    //                 // vaultId, 
    //                 eve.pkh,  
    //                 depositors,
    //                 [eve.pkh],
    //                 loanTokenName
    //                 ).send({ amount: tezSent });
    //             await userCreatesANewVaultOperation.confirmation();

    //             const updatedTokenControllerStorage = await lendingControllerInstance.storage();
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



    // 
    // Test: Deposit tez into vault
    //
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

    //         const lendingControllerStorage      = await lendingControllerInstance.storage();
    //         const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);

    //         // get vault contract
    //         const vaultAddress             = vault.address;
    //         const eveVaultInstance         = await utils.tezos.contract.at(vaultAddress);
    //         const eveVaultInstanceStorage  = await eveVaultInstance.storage();

    //         const eveDepositTezOperation  = await eveVaultInstance.methods.vaultDeposit(
    //             eve.pkh,                              // from_
    //             lendingControllerAddress.address,     // to_
    //             depositAmountMutez,                   // amt
    //             "tez"                                 // token
    //         ).send({ mutez : true, amount : depositAmountMutez });
    //         await eveDepositTezOperation.confirmation();


    //         const updatedLendingControllerStorage = await lendingControllerInstance.storage();
    //         const updatedVault                    = await updatedLendingControllerStorage.vaults.get(vaultHandle);
    //         const tezCollateralBalance            = await updatedVault.collateralBalanceLedger.get('tez');
            
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

    //         const lendingControllerStorage      = await lendingControllerInstance.storage();
    //         const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);
    //         const initialTezCollateralBalance   = await vault.collateralBalanceLedger.get('tez');

    //         // check that initial tez collateral balance is now ten tez
    //         assert.equal(initialTezCollateralBalance, TEZ(10));

    //         // get vault contract
    //         const vaultAddress             = vault.address;
    //         const eveVaultInstance         = await utils.tezos.contract.at(vaultAddress);
    //         const eveVaultInstanceStorage  = await eveVaultInstance.storage();

    //         const malloryDepositTezIntoEveVaultOperation  = await eveVaultInstance.methods.vaultDeposit(
    //             mallory.pkh,                          // from_
    //             lendingControllerAddress.address,     // to_
    //             depositAmountMutez,                   // amt
    //             "tez"                                 // token
    //         ).send({ mutez : true, amount : depositAmountMutez });
    //         await malloryDepositTezIntoEveVaultOperation.confirmation();

    //         const updatedLendingControllerStorage = await lendingControllerInstance.storage();
    //         const updatedVault                    = await updatedLendingControllerStorage.vaults.get(vaultHandle);
    //         const tezCollateralBalance            = await updatedVault.collateralBalanceLedger.get('tez');
            
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
    
    //         const lendingControllerStorage      = await lendingControllerInstance.storage();
    //         const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);
    
    //         // get vault contract
    //         const vaultAddress             = vault.address;
    //         const vaultInstance            = await utils.tezos.contract.at(vaultAddress);
    //         const vaultInstanceStorage     = await vaultInstance.storage();
    
    //         const malloryDepositTezOperation  = await vaultInstance.methods.vaultDeposit(
    //             mallory.pkh,                          // from_
    //             lendingControllerAddress.address,     // to_
    //             depositAmountMutez,                   // amt
    //             "tez"                                 // token
    //         ).send({ mutez : true, amount : depositAmountMutez });
    //         await malloryDepositTezOperation.confirmation();
    
    //         const updatedLendingControllerStorage = await lendingControllerInstance.storage();
    //         const updatedVault                    = await updatedLendingControllerStorage.vaults.get(vaultHandle);
    //         const tezCollateralBalance            = await updatedVault.collateralBalanceLedger.get('tez');
            
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
    
    //         const lendingControllerStorage      = await lendingControllerInstance.storage();
    //         const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);
    //         const initialTezCollateralBalance   = await vault.collateralBalanceLedger.get('tez');
    
    //         // check that initial tez collateral balance is now ten tez (from previous test)
    //         assert.equal(initialTezCollateralBalance, TEZ(10));
    
    //         // get vault contract
    //         const vaultAddress              = vault.address;
    //         const vaultInstance             = await utils.tezos.contract.at(vaultAddress);
    //         const vaultInstanceStorage      = await vaultInstance.storage();
    
    //         const failEveDepositTezIntoMalloryVaultOperation  = await vaultInstance.methods.vaultDeposit(
    //             eve.pkh,                              // from_
    //             lendingControllerAddress.address,     // to_
    //             depositAmountMutez,                   // amt
    //             "tez"                                 // token
    //         );
    //         await chai.expect(failEveDepositTezIntoMalloryVaultOperation.send({ mutez : true, amount : depositAmountMutez })).to.be.rejected;    
    
    //     });

    // }); // end test: deposit tez into vault



    // 
    // Test: Deposit Mock FA12 Tokens into vault
    //
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

    //         const lendingControllerStorage      = await lendingControllerInstance.storage();
    //         const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);

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
    //             lendingControllerAddress.address,      // to_
    //             depositAmount,                         // amt
    //             "fa12",                                // token
    //             mockFa12TokenAddress.address           // mock FA12 Token address 
    //         ).send();
    //         await eveDepositMockFa12TokenOperation.confirmation();

    //         const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
    //         const updatedVault                      = await updatedLendingControllerStorage.vaults.get(vaultHandle);
    //         const mockFa12TokenCollateralBalance    = await updatedVault.collateralBalanceLedger.get('mockFA12');
            
    //         // vault Mock FA12 Token Collateral Balance
    //         assert.equal(mockFa12TokenCollateralBalance, depositAmount);

    //         // check that eve now has 490 mock FA12 tokens 
    //         const updatedMockFa12TokenStorage      = await mockFa12TokenInstance.storage();
    //         const updatedEveMockFa12Ledger         = await updatedMockFa12TokenStorage.ledger.get(eve.pkh);            
    //         assert.equal(updatedEveMockFa12Ledger.balance, finalMockFa12TokenBalance);

    //         // lendingController Mock FA12 Token Collateral Balance
    //         const lendingControllerMockFa12Account     = await updatedMockFa12TokenStorage.ledger.get(lendingControllerAddress.address);            
    //         assert.equal(lendingControllerMockFa12Account.balance, depositAmount);

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

    //         // get vault from Lending Controller
    //         const lendingControllerStorage        = await lendingControllerInstance.storage();
    //         const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);

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
    //             lendingControllerAddress.address,      // to_
    //             depositAmount,                         // amt
    //             "fa12",                                // token
    //             mockFa12TokenAddress.address           // mock FA12 Token address 
    //         ).send();
    //         await malloryDepositMockFa12TokenOperation.confirmation();

    //         const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
    //         const updatedVault                      = await updatedLendingControllerStorage.vaults.get(vaultHandle);
    //         const mockFa12TokenCollateralBalance    = await updatedVault.collateralBalanceLedger.get('mockFA12');
            
    //         // vault Mock FA12 Token Collateral Balance
    //         const vaultTokenCollateralBalance = depositAmount + depositAmount;
    //         assert.equal(mockFa12TokenCollateralBalance, vaultTokenCollateralBalance);

    //         // check that mallory now has 490 mock FA12 tokens 
    //         const updatedMockFa12TokenStorage      = await mockFa12TokenInstance.storage();
    //         const updatedEveMockFa12Ledger         = await updatedMockFa12TokenStorage.ledger.get(mallory.pkh);            
    //         assert.equal(updatedEveMockFa12Ledger.balance, finalMockFa12TokenBalance);

    //         // Lending Controller Mock FA12 Token Collateral Balance
    //         const lendingControllerTokenCollateralBalance = depositAmount + depositAmount;
    //         const lendingControllerMockFa12Account     = await updatedMockFa12TokenStorage.ledger.get(lendingControllerAddress.address);            
    //         assert.equal(lendingControllerMockFa12Account.balance, lendingControllerTokenCollateralBalance);

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
    //             lendingControllerAddress.address,    // to_
    //             depositAmount,                         // amt
    //             "fa12",                                // token
    //             mockFa12TokenAddress.address           // mock FA12 Token address 
    //         ).send();
    //         await malloryDepositMockFa12TokenOperation.confirmation();

    //         const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
    //         const updatedVault                      = await updatedLendingControllerStorage.vaults.get(vaultHandle);
    //         const mockFa12TokenCollateralBalance    = await updatedVault.collateralBalanceLedger.get('mockFA12');
            
    //         // vault Mock FA12 Token Collateral Balance
    //         const vaultTokenCollateralBalance = depositAmount;
    //         assert.equal(mockFa12TokenCollateralBalance, vaultTokenCollateralBalance);

    //         // check that mallory now has 480 mock FA12 tokens 
    //         const updatedMockFa12TokenStorage      = await mockFa12TokenInstance.storage();
    //         const updatedEveMockFa12Ledger         = await updatedMockFa12TokenStorage.ledger.get(mallory.pkh);            
    //         assert.equal(updatedEveMockFa12Ledger.balance, finalMockFa12TokenBalance);

    //         const lendingControllerMockFa12Account     = await updatedMockFa12TokenStorage.ledger.get(lendingControllerAddress.address);            
    //         const lendingControllerTokenCollateralBalance = depositAmount * 3;
    //         assert.equal(lendingControllerMockFa12Account.balance, lendingControllerTokenCollateralBalance);

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
    
    //         const lendingControllerStorage      = await lendingControllerInstance.storage();
    //         const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);
    
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
    //             lendingControllerAddress.address,    // to_
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
    
    //         const lendingControllerStorage      = await lendingControllerInstance.storage();
    //         const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);
    
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
    //             lendingControllerAddress.address,      // to_
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

    //         const lendingControllerStorage      = await lendingControllerInstance.storage();
    //         const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);

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
    //             lendingControllerAddress.address,     // to_
    //             depositAmount,                         // amt
    //             "fa2",                                 // token
    //             mockFa2TokenAddress.address,           // mock FA12 Token address 
    //             tokenId
    //         ).send();
    //         await eveDepositTokenOperation.confirmation();

    //         const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
    //         const updatedVault                      = await updatedLendingControllerStorage.vaults.get(vaultHandle);
    //         const mockFa2TokenCollateralBalance     = await updatedVault.collateralBalanceLedger.get('mockFA2');
            
    //         // vault Mock FA2 Token Collateral Balance
    //         assert.equal(mockFa2TokenCollateralBalance, depositAmount);

    //         // check that eve now has 490 mock FA2 tokens 
    //         const updatedMockFa2TokenStorage       = await mockFa2TokenInstance.storage();
    //         const updatedUserTokenAccount          = await updatedMockFa2TokenStorage.ledger.get(eve.pkh);            
    //         assert.equal(updatedUserTokenAccount, finalTokenBalance);

    //         // Lending Controller Mock FA2 Token Collateral Balance
    //         const lendingControllerMockFa2Account     = await updatedMockFa2TokenStorage.ledger.get(lendingControllerAddress.address);            
    //         assert.equal(lendingControllerMockFa2Account, depositAmount);

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

    //         const lendingControllerStorage      = await lendingControllerInstance.storage();
    //         const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);

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
    //             lendingControllerAddress.address,      // to_
    //             depositAmount,                         // amt
    //             "fa2",                                 // token
    //             mockFa2TokenAddress.address,           // mock FA12 Token address 
    //             tokenId
    //         ).send();
    //         await malloryDepositTokenOperation.confirmation();

    //         const updatedLendingControllerStorage     = await lendingControllerInstance.storage();
    //         const updatedVault                        = await updatedLendingControllerStorage.vaults.get(vaultHandle);
    //         const vaultMockFa2TokenCollateralBalance  = await updatedVault.collateralBalanceLedger.get('mockFA2');
            
    //         // vault Mock FA2 Token Collateral Balance
    //         const mockFa2TokenCollateralBalance = depositAmount + depositAmount; // from previous test as well
    //         assert.equal(vaultMockFa2TokenCollateralBalance, mockFa2TokenCollateralBalance);

    //         // check that mallory now has 490 mock FA2 tokens 
    //         const updatedMockFa2TokenStorage       = await mockFa2TokenInstance.storage();
    //         const updatedUserTokenAccount          = await updatedMockFa2TokenStorage.ledger.get(eve.pkh);            
    //         assert.equal(updatedUserTokenAccount, finalTokenBalance);

    //         // Lending Controller Mock FA2 Token Collateral Balance
    //         const lendingControllerMockFa2Account      = await updatedMockFa2TokenStorage.ledger.get(lendingControllerAddress.address);            
    //         const lendingControllerMockFa2TokenBalance = depositAmount + depositAmount; // include amounts from previous test as well
    //         assert.equal(lendingControllerMockFa2Account, lendingControllerMockFa2TokenBalance);

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
    
    //         const lendingControllerStorage      = await lendingControllerInstance.storage();
    //         const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);
    
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
    //             lendingControllerAddress.address,    // to_
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

    //         const lendingControllerStorage      = await lendingControllerInstance.storage();
    //         const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);

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
    //             lendingControllerAddress.address,      // to_
    //             depositAmount,                         // amt
    //             "fa2",                                 // token
    //             mockFa2TokenAddress.address,           // mock FA12 Token address 
    //             tokenId
    //         ).send();
    //         await malloryDepositTokenOperation.confirmation();

    //         const updatedLendingControllerStorage     = await lendingControllerInstance.storage();
    //         const updatedVault                        = await updatedLendingControllerStorage.vaults.get(vaultHandle);
    //         const vaultMockFa2TokenCollateralBalance  = await updatedVault.collateralBalanceLedger.get('mockFA2');
            
    //         // vault Mock FA2 Token Collateral Balance
    //         const mockFa2TokenCollateralBalance = depositAmount; 
    //         assert.equal(vaultMockFa2TokenCollateralBalance, mockFa2TokenCollateralBalance);

    //         // check that mallory now has 480 mock FA2 tokens 
    //         const updatedMockFa2TokenStorage       = await mockFa2TokenInstance.storage();
    //         const updatedUserTokenAccount          = await updatedMockFa2TokenStorage.ledger.get(mallory.pkh);            
    //         assert.equal(updatedUserTokenAccount, finalTokenBalance);

    //         // Lending Controller Mock FA2 Token Collateral Balance
    //         const lendingControllerMockFa2Account      = await updatedMockFa2TokenStorage.ledger.get(lendingControllerAddress.address);            
    //         const lendingControllerMockFa2TokenBalance = depositAmount * 3; // include amounts from previous tests as well
    //         assert.equal(lendingControllerMockFa2Account, lendingControllerMockFa2TokenBalance);

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
    
    //         const lendingControllerStorage      = await lendingControllerInstance.storage();
    //         const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);
    
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
    //             lendingControllerAddress.address,      // to_
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
    
    //         const lendingControllerStorage      = await lendingControllerInstance.storage();
    //         const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);
    
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
    //             lendingControllerAddress.address,      // to_
    //             depositAmount,                         // amt
    //             "fa2",                                 // token
    //             mockFa2TokenAddress.address,           // mock FA2 Token address 
    //             tokenId
    //         );
    //         await chai.expect(failDepositTezAndMockFa2TokenOperation.send({ mutez : true, amount : depositAmount })).to.be.rejected;    
    
    //     });

    // }); // end test: deposit mock FA2 tokens into vault


    // -------------------------------
    // Stop here
    // -------------------------------


    // 
    // Test: Setup CFMMs XTZ/USDM
    //
    // describe('test: setup CFMMs (XTZ/USDM)', function () {

    //     it('user (alice) can deposit tez into the CFMM (XTZ/USDM) cash pool', async () => {
    
    //         // init variables
    //         await signerFactory(alice.sk);

    //         // initial cash pool of 0
    //         const cfmmXtzUsdmStorage = await cfmmTezUsdmInstance.storage();
    //         assert.equal(cfmmXtzUsdmStorage.cashPool, 1);

    //         // 1:4 ratio - 1 tez to 4 USDM Tokens
    //         const tezAmount   = 500;
    //         const mutezAmount = 500000000;
    //         const aliceTransferTezToCfmmOperation = await utils.tezos.contract.transfer(
    //                 { 
    //                     to:     cfmmTezUsdmAddress.address, 
    //                     amount: tezAmount
    //                 }
    //             );
    //         await aliceTransferTezToCfmmOperation.confirmation();

    //         // updated cash pool
    //         const updatedCfmmXtzUsdmStorage = await cfmmTezUsdmInstance.storage();
    //         assert.equal(updatedCfmmXtzUsdmStorage.cashPool, mutezAmount + 1);

    //     });

    //     it('user (alice) can deposit tez into the CFMM (XTZ/MockFa2Token) cash pool', async () => {
    
    //         // init variables
    //         await signerFactory(alice.sk);

    //         // initial cash pool of 0
    //         const cfmmXtzMockFa2TokenStorage = await cfmmTezMockFa2TokenInstance.storage();
    //         assert.equal(cfmmXtzMockFa2TokenStorage.cashPool, 1);

    //         // 1:10 ratio - 1 tez to 10 Mock FA2 Tokens
    //         const tezAmount   = 200;
    //         const mutezAmount = 200000000;
    //         const aliceTransferTezToCfmmOperation = await utils.tezos.contract.transfer(
    //                 { 
    //                     to:     cfmmTezMockFa2TokenAddress.address, 
    //                     amount: tezAmount
    //                 }
    //             );
    //         await aliceTransferTezToCfmmOperation.confirmation();

    //         // updated cash pool
    //         const updatedCfmmXtzMockFa2Storage = await cfmmTezMockFa2TokenInstance.storage();
    //         assert.equal(updatedCfmmXtzMockFa2Storage.cashPool, mutezAmount + 1);

    //     });

    //     it('user (alice) can deposit tez into the CFMM (XTZ/MockFa12Token) cash pool', async () => {
    
    //         // init variables
    //         await signerFactory(alice.sk);

    //         // initial cash pool of 0
    //         const cfmmXtzMockFa12TokenStorage = await cfmmTezMockFa12TokenInstance.storage();
    //         assert.equal(cfmmXtzMockFa12TokenStorage.cashPool, 1);

    //         // 1:10 ratio - 1 tez to 20 Mock FA12 Tokens
    //         const tezAmount   = 100;
    //         const mutezAmount = 100000000;
    //         const aliceTransferTezToCfmmOperation = await utils.tezos.contract.transfer(
    //                 { 
    //                     to:     cfmmTezMockFa12TokenAddress.address, 
    //                     amount: tezAmount
    //                 }
    //             );
    //         await aliceTransferTezToCfmmOperation.confirmation();

    //         // updated cash pool
    //         const updatedCfmmXtzMockFa12Storage = await cfmmTezMockFa12TokenInstance.storage();
    //         assert.equal(updatedCfmmXtzMockFa12Storage.cashPool, mutezAmount + 1);

    //     });

    // }); // end test: Setup CFMM XTZ/USDM



    // 
    // Test: CFMM Liquidity Actions
    //
    // describe('test: CFMM Liquidity Actions', function () {

    //     it('user (alice) can add liquidity to the (USDM/XTZ) CFMM contract and receive corresponding LP tokens', async () => {
    
    //         // init variables
    //         await signerFactory(alice.sk);

    //         // check that alice has no LP tokens initially
    //         const lpTokenUsdmXtzStorage         = await lpTokenUsdmXtzInstance.storage();
    //         const aliceUsdmXtzLpTokenBalance    = await lpTokenUsdmXtzStorage.ledger.get(alice.pkh);
    //         assert.equal(aliceUsdmXtzLpTokenBalance, undefined);

    //         const cfmmXtzUsdmStorage            = await cfmmTezUsdmInstance.storage();
    //         const initialCashPool               = cfmmXtzUsdmStorage.cashPool;
    //         const initialTokenPool              = cfmmXtzUsdmStorage.tokenPool;
    //         const initialLpTokensTotal          = cfmmXtzUsdmStorage.lpTokensTotal;

    //         // init parameters - assume 1 XTZ = 4 USDM i.e. 1 xtz = $4 USD
    //         const deadline            = new Date(Date.now() + (600 * 60));
    //         const cashDeposited       = 25000000;         // 25 XTZ
    //         const maxTokensDeposited  = 100000000;        // 100 USDM Tokens
    //         const minLpTokensMinted   = 24999999;         // 24 LP Tokens
    //         const owner               = alice.pkh;        // alice

    //         // USDM Token: add cfmm as operator for alice
    //         const updateOperatorsOperation = await usdmTokenInstance.methods.update_operators([
    //             {
    //                 add_operator: {
    //                     owner: alice.pkh,
    //                     operator: cfmmTezUsdmAddress.address,
    //                     token_id: 0,
    //                 },
    //             }])
    //             .send();
    //         await updateOperatorsOperation.confirmation();

    //         // user (alice) adds liquidity to cfmm
    //         const aliceAddsLiquidityOperation = await cfmmTezUsdmInstance.methods.addLiquidity(
    //             cashDeposited,
    //             deadline,
    //             maxTokensDeposited,
    //             minLpTokensMinted,
    //             owner
    //         ).send({ mutez : true, amount: cashDeposited });
    //         await aliceAddsLiquidityOperation.confirmation();

    //         const updatedLpTokenUsdmXtzStorage         = await lpTokenUsdmXtzInstance.storage();
    //         const updatedAliceUsdmXtzLpTokenBalance    = await updatedLpTokenUsdmXtzStorage.ledger.get(alice.pkh);

    //         const updatedCfmmXtzUsdmStorage            = await cfmmTezUsdmInstance.storage();
    //         const updatedCashPool                      = updatedCfmmXtzUsdmStorage.cashPool;
    //         const updatedTokenPool                     = updatedCfmmXtzUsdmStorage.tokenPool;
    //         const updatedLpTokensTotal                 = updatedCfmmXtzUsdmStorage.lpTokensTotal;

    //         // check that alice has received LP tokens 
    //         assert.equal(updatedAliceUsdmXtzLpTokenBalance, minLpTokensMinted); // 25000000 i.e. 25 LP Tokens

    //         // check CFMM pool
    //         assert.equal(updatedCashPool, initialCashPool.toNumber() + cashDeposited);
    //         assert.equal(updatedTokenPool, initialTokenPool.toNumber() + maxTokensDeposited);
    //         assert.equal(updatedLpTokensTotal, initialLpTokensTotal.toNumber() + minLpTokensMinted);

    //         // console.log("--- --- --- --- --- --- --- --- --- ---");
    //         // console.log("updated after adding liquidity");
    //         // console.log("--- --- --- --- --- --- --- --- --- ---");
    //         // console.log(updatedLpTokenUsdmXtzStorage);
    //         // console.log(updatedAliceUsdmXtzLpTokenBalance);
    //         // console.log(updatedCfmmXtzUsdmStorage);
    //     });

    //     it('user (alice) can add liquidity to the (MockFa2/XTZ) CFMM contract and receive corresponding LP tokens', async () => {
    
    //         // init variables
    //         await signerFactory(alice.sk);

    //         // check that alice has no LP tokens initially
    //         const lpTokenMockFa2XtzStorage         = await lpTokenMockFa2XtzInstance.storage();
    //         const aliceMockFa2XtzLpTokenBalance    = await lpTokenMockFa2XtzStorage.ledger.get(alice.pkh);
    //         assert.equal(aliceMockFa2XtzLpTokenBalance, undefined);

    //         const cfmmXtzMockFa2TokenStorage       = await cfmmTezMockFa2TokenInstance.storage();
    //         const initialCashPool                  = cfmmXtzMockFa2TokenStorage.cashPool;
    //         const initialTokenPool                 = cfmmXtzMockFa2TokenStorage.tokenPool;
    //         const initialLpTokensTotal             = cfmmXtzMockFa2TokenStorage.lpTokensTotal;

    //         console.log("cfmm mock fa2 token / xtz storage");
    //         console.log(cfmmXtzMockFa2TokenStorage);

    //         // init parameters - assume 1 XTZ = 2 Mock FA2 Toknes
    //         const deadline            = new Date(Date.now() + (600 * 60));
    //         const cashDeposited       = 25000000;           // 25 XTZ
    //         const maxTokensDeposited  = 251000000;          // 249.9 Mock FA2 Tokens
    //         const minLpTokensMinted   = 24999999;           // min 24.9 LP Tokens
    //         const owner               = alice.pkh;          // alice

    //         // MockFA2 Token: add cfmm as operator for alice
    //         const updateOperatorsOperation = await mockFa2TokenInstance.methods.update_operators([
    //             {
    //                 add_operator: {
    //                     owner: alice.pkh,
    //                     operator: cfmmTezMockFa2TokenAddress.address,
    //                     token_id: 0,
    //                 },
    //             }])
    //             .send();
    //         await updateOperatorsOperation.confirmation();

    //         // user (alice) adds liquidity to cfmm
    //         const aliceAddsLiquidityOperation = await cfmmTezMockFa2TokenInstance.methods.addLiquidity(
    //             cashDeposited,
    //             deadline,
    //             maxTokensDeposited,
    //             minLpTokensMinted,
    //             owner
    //         ).send({ mutez : true, amount: cashDeposited });
    //         await aliceAddsLiquidityOperation.confirmation();

    //         const updatedLpTokenMockFa2XtzStorage         = await lpTokenMockFa2XtzInstance.storage();
    //         const updatedAliceMockFa2XtzLpTokenBalance    = await updatedLpTokenMockFa2XtzStorage.ledger.get(alice.pkh);

    //         const updatedCfmmXtzMockFa2TokenStorage       = await cfmmTezMockFa2TokenInstance.storage();
    //         const updatedCashPool                         = updatedCfmmXtzMockFa2TokenStorage.cashPool;
    //         const updatedTokenPool                        = updatedCfmmXtzMockFa2TokenStorage.tokenPool;
    //         const updatedLpTokensTotal                    = updatedCfmmXtzMockFa2TokenStorage.lpTokensTotal;

    //         // check that alice has received LP tokens 
    //         assert.equal(updatedAliceMockFa2XtzLpTokenBalance, minLpTokensMinted); // 25000000 i.e. 25 LP Tokens

    //         // calculate values
    //         const tokensDeposited = Math.floor((cashDeposited * initialTokenPool) / initialCashPool);
    //         const newTokenPool = tokensDeposited + initialTokenPool.toNumber() + 1;

    //         // check CFMM pool
    //         assert.equal(updatedCashPool, initialCashPool.toNumber() + cashDeposited);
    //         assert.equal(updatedTokenPool, newTokenPool);
    //         assert.equal(updatedLpTokensTotal, initialLpTokensTotal.toNumber() + minLpTokensMinted);

    //         // console.log("--- --- --- --- --- --- --- --- --- ---");
    //         // console.log("updated after adding liquidity");
    //         // console.log("--- --- --- --- --- --- --- --- --- ---");
    //         // console.log(updatedLpTokenUsdmXtzStorage);
    //         // console.log(updatedAliceUsdmXtzLpTokenBalance);
    //         // console.log(updatedCfmmXtzUsdmStorage);
    //     });

    //     it('user (alice) can add liquidity to the (MockFa12/XTZ) CFMM contract and receive corresponding LP tokens', async () => {
    
    //         // init variables
    //         await signerFactory(alice.sk);

    //         // check that alice has no LP tokens initially
    //         const lpTokenMockFa12XtzStorage         = await lpTokenMockFa12XtzInstance.storage();
    //         const aliceMockFa12XtzLpTokenBalance    = await lpTokenMockFa12XtzStorage.ledger.get(alice.pkh);
    //         assert.equal(aliceMockFa12XtzLpTokenBalance, undefined);

    //         const cfmmXtzMockFa12TokenStorage       = await cfmmTezMockFa12TokenInstance.storage();
    //         const initialCashPool                   = cfmmXtzMockFa12TokenStorage.cashPool;
    //         const initialTokenPool                  = cfmmXtzMockFa12TokenStorage.tokenPool;
    //         const initialLpTokensTotal              = cfmmXtzMockFa12TokenStorage.lpTokensTotal;

    //         // init parameters - assume 1 XTZ = 2 Mock FA12 Toknes
    //         const deadline            = new Date(Date.now() + (600 * 60));
    //         const cashDeposited       = 25000000;         // 25 XTZ
    //         const maxTokensDeposited  = 501000000;        // 50 Mock FA12 Tokens
    //         const minLpTokensMinted   = 24999999;         // 24.9 LP Tokens
    //         const owner               = alice.pkh;        // alice

    //         // alice resets mock FA12 tokens allowance then set new allowance to deposit amount
    //         // reset token allowance
    //         const resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
    //             cfmmTezMockFa12TokenAddress.address,
    //             0
    //         ).send();
    //         await resetTokenAllowance.confirmation();

    //         // set new token allowance
    //         const setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
    //             cfmmTezMockFa12TokenAddress.address,
    //             maxTokensDeposited
    //         ).send();
    //         await setNewTokenAllowance.confirmation();

    //         // user (alice) adds liquidity to cfmm
    //         const aliceAddsLiquidityOperation = await cfmmTezMockFa12TokenInstance.methods.addLiquidity(
    //             cashDeposited,
    //             deadline,
    //             maxTokensDeposited,
    //             minLpTokensMinted,
    //             owner
    //         ).send({ mutez : true, amount: cashDeposited });
    //         await aliceAddsLiquidityOperation.confirmation();

    //         const updatedLpTokenMockFa12XtzStorage         = await lpTokenMockFa12XtzInstance.storage();
    //         const updatedAliceMockFa12XtzLpTokenBalance    = await updatedLpTokenMockFa12XtzStorage.ledger.get(alice.pkh);

    //         const updatedCfmmXtzMockFa12TokenStorage       = await cfmmTezMockFa12TokenInstance.storage();
    //         const updatedCashPool                          = updatedCfmmXtzMockFa12TokenStorage.cashPool;
    //         const updatedTokenPool                         = updatedCfmmXtzMockFa12TokenStorage.tokenPool;
    //         const updatedLpTokensTotal                     = updatedCfmmXtzMockFa12TokenStorage.lpTokensTotal;

    //         // check that alice has received LP tokens 
    //         assert.equal(updatedAliceMockFa12XtzLpTokenBalance.balance, minLpTokensMinted); // 25000000 i.e. 25 LP Tokens

    //         // calculate values
    //         const tokensDeposited = Math.floor((cashDeposited * initialTokenPool) / initialCashPool);
    //         const newTokenPool = tokensDeposited + initialTokenPool.toNumber() + 1;

    //         // check CFMM pool
    //         assert.equal(updatedCashPool, initialCashPool.toNumber() + cashDeposited);
    //         assert.equal(updatedTokenPool, newTokenPool);
    //         assert.equal(updatedLpTokensTotal, initialLpTokensTotal.toNumber() + minLpTokensMinted);

    //         // console.log("--- --- --- --- --- --- --- --- --- ---");
    //         // console.log("updated after adding liquidity");
    //         // console.log("--- --- --- --- --- --- --- --- --- ---");
    //         // console.log(updatedLpTokenUsdmXtzStorage);
    //         // console.log(updatedAliceUsdmXtzLpTokenBalance);
    //         // console.log(updatedCfmmXtzUsdmStorage);
    //     });


    // }); // end test: CFMM Liquidity Actions



    //
    // Test: CFMM On Price Action
    //
    // describe('test: CFMM On Price Action', function () {

    //     it('user (alice) is able to swap cash (XTZ) for token', async () => {
    
    //         // init variables
    //         await signerFactory(alice.sk);
    //         const deadline            = new Date(Date.now() + (600 * 60));
    //         const minTokensBought     = 9500000;         // 9.5 USDM Tokens
    //         const recipient           = alice.pkh;
    //         const cashSoldMutez       = 2500000;         // 2.5 XTZ

    //         const usdmStorage                   = await usdmTokenInstance.storage();
    //         const aliceUsdmBalance              = await usdmStorage.ledger.get(alice.pkh);

    //         const usdmTokenControllerStorage    = await usdmTokenControllerInstance.storage();
    //         const usdmTargetLedger              = await usdmTokenControllerStorage.targetLedger.get('usdm');
    //         const usdmDriftLedger               = await usdmTokenControllerStorage.driftLedger.get('usdm');
    //         const usdmLastDriftUpdateLedger     = await usdmTokenControllerStorage.lastDriftUpdateLedger.get('usdm');
    //         const usdmPriceLedger               = await usdmTokenControllerStorage.priceLedger.get('usdm');
            
    //         const cfmmStorage         = await cfmmTezUsdmInstance.storage();

    //         // console.log("--- --- --- --- --- --- --- --- --- ---");
    //         // console.log("initial before cashForToken");
    //         // console.log("--- --- --- --- --- --- --- --- --- ---");
    //         // console.log("initial alice usdm balance: " + aliceUsdmBalance);
    //         // console.log(cfmmStorage);
    //         // console.log(usdmTokenControllerStorage);

    //         console.log("usdm target: "+ usdmTargetLedger);
    //         console.log("usdm drift: "+ usdmDriftLedger);
    //         console.log("usdm last drift update: "+ usdmLastDriftUpdateLedger);
    //         console.log("usdm price: "+ usdmPriceLedger);
            
            
    //         // user (alice) swap cash (XTZ) for token (USDM)
    //         const aliceSwapsCashForTokenOperation = await cfmmTezUsdmInstance.methods.cashToToken(
    //             deadline,
    //             minTokensBought,
    //             recipient
    //         ).send({ mutez : true, amount: cashSoldMutez });
    //         await aliceSwapsCashForTokenOperation.confirmation();

    //         const updatedUsdmStorage         = await usdmTokenInstance.storage();
    //         const updatedAliceUsdmBalance    = await updatedUsdmStorage.ledger.get(alice.pkh);
    //         const updatedUsdmTokenControllerStorage = await usdmTokenControllerInstance.storage();

    //         const updatedCfmmStorage         = await cfmmTezUsdmInstance.storage();

    //         const updatedUsdmTargetLedger              = await updatedUsdmTokenControllerStorage.targetLedger.get('usdm');
    //         const updatedUsdmDriftLedger               = await updatedUsdmTokenControllerStorage.driftLedger.get('usdm');
    //         const updatedUsdmLastDriftUpdateLedger     = await updatedUsdmTokenControllerStorage.lastDriftUpdateLedger.get('usdm');
    //         const updatedUsdmPriceLedger               = await updatedUsdmTokenControllerStorage.priceLedger.get('usdm');

    //         // console.log("--- --- --- --- --- --- --- --- --- ---");
    //         // console.log("updated after cashForToken");
    //         // console.log("--- --- --- --- --- --- --- --- --- ---");
    //         // console.log("updated alice usdm balance: " + updatedAliceUsdmBalance);
    //         // console.log("total minted: " + (updatedAliceUsdmBalance.toNumber() - aliceUsdmBalance.toNumber()));
    //         // console.log(updatedCfmmStorage);
    //         // console.log(updatedUsdmTokenControllerStorage);
    //         // console.log(priceLedger);

    //         // console.log("usdm target: "+ updatedUsdmTargetLedger);
    //         // console.log("usdm drift: "+ updatedUsdmDriftLedger);
    //         // console.log("usdm last drift update: "+ updatedUsdmLastDriftUpdateLedger);
    //         // console.log("usdm price: "+ updatedUsdmPriceLedger);
            

    //     });

    // }); // end test CFMM On Price Action




    // 
    // Test: USDM Token MintOrBurn
    //
    // describe('test: USDM Token MintOrBurn', function () {

    //     it('user (eve) is able to mint USDM tokens from her vault', async () => {
    
    //         // init variables
    //         await signerFactory(eve.sk);
    //         const vaultId            = 1;
    //         const vaultOwner         = eve.pkh;
    //         const quantityToMint     = 5000000; // 5 USDM Tokens

    //         // create vault handle
    //         const vaultHandle = {
    //             "id"     : vaultId,
    //             "owner"  : vaultOwner
    //         };

    //         const usdmTokenControllerStorage     = await usdmTokenControllerInstance.storage();
    //         const vault                          = await usdmTokenControllerStorage.vaults.get(vaultHandle);
    //         // const collateralBalanceLedger        = await vault.collateralBalanceLedger;

    //         const vaultTezCollateralBalance             = await vault.collateralBalanceLedger.get('tez');
    //         const vaultMockFa2TokenCollateralBalance    = await vault.collateralBalanceLedger.get('mockFA2');
    //         const vaultMockFa12TokenCollateralBalance   = await vault.collateralBalanceLedger.get('mockFA12');

    //         // get vault contract
    //         const vaultAddress             = vault.address;
    //         const vaultInstance            = await utils.tezos.contract.at(vaultAddress);

    //         // register vault collateral tokens - usdm token
    //         const updateVaultCollateralTokens = await vaultInstance.methods.vaultUpdateCollateralTokens(
    //             usdmTokenAddress.address,
    //             'usdm'
    //         ).send();
    //         await updateVaultCollateralTokens.confirmation();

    //         const usdmStorage             = await usdmTokenInstance.storage();
    //         const initialEveUsdmBalance   = await usdmStorage.ledger.get(eve.pkh);

    //         console.log("--- --- --- --- --- --- --- --- --- ---");
    //         console.log("before minting USDM Tokens");
    //         console.log("--- --- --- --- --- --- --- --- --- ---");
    //         console.log("vault tez collateral balance: " + vaultTezCollateralBalance);
    //         console.log("vault mock FA2 balance: " + vaultMockFa2TokenCollateralBalance);
    //         console.log("vault mock FA12 balance: " + vaultMockFa12TokenCollateralBalance);
            
    //         // console.log("tempValue (vault collateral value): " + usdmTokenControllerStorage.tempValue);

    //         // console.log("--- --- --- --- --- --- --- --- --- ---");
    //         // console.log("--- --- --- --- --- --- --- --- --- ---");
    //         // console.log(vault);

    //         // console.log("--- --- --- --- --- --- --- --- --- ---");
    //         // console.log("--- --- --- --- --- --- --- --- --- ---");
    //         // console.log(collateralBalanceLedger);
            

    //         const mintUsdmTokensFromVaultOperation = await usdmTokenControllerInstance.methods.mintOrBurn(
    //             vaultId,        // vault Id
    //             quantityToMint  // USDM Tokens quantity to mint
    //         ).send();
    //         await mintUsdmTokensFromVaultOperation.confirmation();            

    //         const updatedUsdmTokenControllerStorage = await usdmTokenControllerInstance.storage();
    //         const updatedVault                      = await updatedUsdmTokenControllerStorage.vaults.get(vaultHandle);
    //         const updatedCollateralBalanceLedger    = await updatedVault.collateralBalanceLedger;

    //         const updatedUsdmStorage         = await usdmTokenInstance.storage();
    //         const updatedEveUsdmBalance      = await updatedUsdmStorage.ledger.get(eve.pkh);

    //         // check eve usdm balance increased
    //         assert.equal(updatedEveUsdmBalance, initialEveUsdmBalance.toNumber() + quantityToMint);

    //         // check that vault has 5 USDM outstanding now
    //         assert.equal(updatedVault.usdmOutstanding, quantityToMint);

    //         console.log("--- --- --- --- --- --- --- --- --- ---");
    //         console.log("updated after minting USDM Tokens");
    //         console.log("--- --- --- --- --- --- --- --- --- ---");
    //         // console.log("tempValue (vault collateral value): " + updatedUsdmTokenControllerStorage.tempValue);
    //         // console.log(updatedVault);
    //         // console.log(updatedCollateralBalanceLedger);

    //     });

    //     it('user (eve) is able to burn USDM tokens from her vault', async () => {
    
    //         // init variables
    //         await signerFactory(eve.sk);
    //         const vaultId            = 1;
    //         const vaultOwner         = eve.pkh;
    //         const quantityToBurn     = -3000000; // 3 USDM Tokens

    //         // create vault handle
    //         const vaultHandle = {
    //             "id"     : vaultId,
    //             "owner"  : vaultOwner
    //         };

    //         const usdmTokenControllerStorage     = await usdmTokenControllerInstance.storage();
    //         const vault                          = await usdmTokenControllerStorage.vaults.get(vaultHandle);
    //         const initialUsdmOutstanding         = vault.usdmOutstanding;

    //         const usdmStorage                    = await usdmTokenInstance.storage();
    //         const initialEveUsdmBalance          = await usdmStorage.ledger.get(eve.pkh);

    //         const mintUsdmTokensFromVaultOperation = await usdmTokenControllerInstance.methods.mintOrBurn(
    //             vaultId,        // vault Id
    //             quantityToBurn  // USDM Tokens quantity to burn
    //         ).send();
    //         await mintUsdmTokensFromVaultOperation.confirmation();            

    //         const updatedUsdmTokenControllerStorage = await usdmTokenControllerInstance.storage();
    //         const updatedVault                      = await updatedUsdmTokenControllerStorage.vaults.get(vaultHandle);
    //         const updatedCollateralBalanceLedger    = await updatedVault.collateralBalanceLedger;

    //         const updatedUsdmStorage             = await usdmTokenInstance.storage();
    //         const updatedEveUsdmBalance          = await updatedUsdmStorage.ledger.get(eve.pkh);

    //         // check eve usdm balance decreased
    //         assert.equal(updatedEveUsdmBalance, initialEveUsdmBalance.toNumber() + quantityToBurn);

    //         // check that vault has 2 USDM outstanding now
    //         assert.equal(updatedVault.usdmOutstanding, initialUsdmOutstanding.toNumber() + quantityToBurn);

    //         console.log("--- --- --- --- --- --- --- --- --- ---");
    //         console.log("updated after burning USDM Tokens");
    //         console.log("--- --- --- --- --- --- --- --- --- ---");
    //         // console.log("tempValue (vault collateral value): " + updatedUsdmTokenControllerStorage.tempValue);
    //         console.log(updatedVault);

    //     });

    // }); // end test USDM Token MintOrBurn 

});