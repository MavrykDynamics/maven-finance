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
import governanceProxyAddress from '../deployments/governanceProxyAddress.json';
import mockFa12TokenAddress from '../deployments/mockFa12TokenAddress.json';
import mockFa2TokenAddress from '../deployments/mockFa2TokenAddress.json';

import mockUsdMockFa12TokenAggregatorAddress from "../deployments/mockUsdMockFa12TokenAggregatorAddress.json";
import mockUsdMockFa2TokenAggregatorAddress from "../deployments/mockUsdMockFa2TokenAggregatorAddress.json";
import mockUsdXtzAggregatorAddress from "../deployments/mockUsdXtzAggregatorAddress.json";

import lpTokenPoolMockFa12TokenAddress from "../deployments/lpTokenPoolMockFa12TokenAddress.json";
import lpTokenPoolMockFa2TokenAddress from "../deployments/lpTokenPoolMockFa2TokenAddress.json";
import lpTokenPoolXtzAddress from "../deployments/lpTokenPoolXtzAddress.json";

import lendingControllerAddress from '../deployments/lendingControllerAddress.json';

import { vaultStorageType } from "./types/vaultStorageType"

describe("Lending Controller tests", async () => {
    
    var utils: Utils

    //  - eve: first vault loan token: mockFa12, second vault loan token: mockFa2, third vault loan token - tez
    //  - mallory: first vault loan token: mockFa12, second vault loan token: mockFa2
    var eveVaultSet = []
    var malloryVaultSet = [] 
    

    let doormanInstance
    let delegationInstance
    let mvkTokenInstance
    
    let mockFa12TokenInstance
    let mockFa2TokenInstance

    let mockUsdMockFa12TokenAggregatorInstance
    let mockUsdMockFa2TokenAggregatorInstance
    let mockUsdXtzAggregatorInstance

    let lpTokenPoolMockFa12TokenInstance
    let lpTokenPoolMockFa2TokenInstance
    let lpTokenPoolXtzInstance

    let governanceInstance
    let governanceProxyInstance

    let lendingControllerInstance

    let doormanStorage
    let delegationStorage
    let mvkTokenStorage
    let mockFa12TokenStorage
    let mockFa2TokenStorage
    let governanceStorage
    let governanceProxyStorage

    let lendingControllerStorage

        const almostEqual = (actual, expected, delta) => {
        let greaterLimit  = expected + expected * delta
        let lowerLimit    = expected - expected * delta
        // console.log("GREATER: ", greaterLimit) 
        // console.log("LOWER: ", lowerLimit)
        // console.log("STUDIED: ", actual)
        return actual <= greaterLimit && actual >= lowerLimit
    }
    
    const signerFactory = async (pk) => {
        await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
        return utils.tezos;
    };

    before("setup", async () => {

        utils = new Utils();
        await utils.init(bob.sk);
        
        doormanInstance                         = await utils.tezos.contract.at(doormanAddress.address);
        delegationInstance                      = await utils.tezos.contract.at(delegationAddress.address);
        mvkTokenInstance                        = await utils.tezos.contract.at(mvkTokenAddress.address);
        mockFa12TokenInstance                   = await utils.tezos.contract.at(mockFa12TokenAddress.address);
        mockFa2TokenInstance                    = await utils.tezos.contract.at(mockFa2TokenAddress.address);
        governanceInstance                      = await utils.tezos.contract.at(governanceAddress.address);
        governanceProxyInstance                 = await utils.tezos.contract.at(governanceProxyAddress.address);

        lpTokenPoolMockFa12TokenInstance        = await utils.tezos.contract.at(lpTokenPoolMockFa12TokenAddress.address);
        lpTokenPoolMockFa2TokenInstance         = await utils.tezos.contract.at(lpTokenPoolMockFa2TokenAddress.address);
        lpTokenPoolXtzInstance                  = await utils.tezos.contract.at(lpTokenPoolXtzAddress.address);

        mockUsdMockFa12TokenAggregatorInstance  = await utils.tezos.contract.at(mockUsdMockFa12TokenAggregatorAddress.address);
        mockUsdMockFa2TokenAggregatorInstance   = await utils.tezos.contract.at(mockUsdMockFa2TokenAggregatorAddress.address);
        mockUsdXtzAggregatorInstance            = await utils.tezos.contract.at(mockUsdXtzAggregatorAddress.address);

        lendingControllerInstance               = await utils.tezos.contract.at(lendingControllerAddress.address);

        doormanStorage                          = await doormanInstance.storage();
        delegationStorage                       = await delegationInstance.storage();
        mvkTokenStorage                         = await mvkTokenInstance.storage();
        mockFa12TokenStorage                    = await mockFa12TokenInstance.storage();
        mockFa2TokenStorage                     = await mockFa2TokenInstance.storage();
        governanceStorage                       = await governanceInstance.storage();
        governanceProxyStorage                  = await governanceInstance.storage();
        lendingControllerStorage                = await lendingControllerInstance.storage();


        console.log('-- -- -- -- -- Lending Controller Tests -- -- -- --')
        console.log('Doorman Contract deployed at:', doormanInstance.address);
        console.log('Delegation Contract deployed at:', delegationInstance.address);
        console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
        console.log('Mock FA12 Token Contract deployed at:', mockFa12TokenInstance.address);
        console.log('Mock FA2 Token Contract deployed at:', mockFa2TokenInstance.address);
        console.log('Governance Contract deployed at:', governanceInstance.address);
        console.log('Governance Proxy Contract deployed at:', governanceProxyInstance.address);

        console.log('LP Token Pool - Mock FA12 Token - deployed at:', lpTokenPoolMockFa12TokenInstance.address);
        console.log('LP Token Pool - Mock FA2 Token - deployed at:', lpTokenPoolMockFa2TokenInstance.address);
        console.log('LP Token Pool - XTZ - deployed at:', lpTokenPoolXtzInstance.address);

        console.log('Mock Aggregator - USD / Mock FA12 Token - deployed at:', mockUsdMockFa12TokenAggregatorInstance.address);
        console.log('Mock Aggregator - USD / Mock FA2 Token - deployed at:', mockUsdMockFa2TokenAggregatorInstance.address);
        console.log('Mock Aggregator - USD / XTZ - deployed at:', mockUsdXtzAggregatorInstance.address);

        console.log('Lending Controller Contract deployed at:', lendingControllerInstance.address);

        console.log('Alice address: ' + alice.pkh);
        console.log('Bob address: ' + bob.pkh);
        console.log('Eve address: ' + eve.pkh);

    });



    // 
    // Setup and test Lending Controller SetLoanToken entrypoint
    //
    describe('%setLoanToken - setup and test lending controller %setLoanToken entrypoint', function () {

        it('admin can set lending controller mock FA12 loan token', async () => {

            try{        
                
                // init variables
                await signerFactory(bob.sk);

                const tokenName                             = "mockFa12";
                const tokenContractAddress                  = mockFa12TokenAddress.address;
                const tokenType                             = "fa12";
                const decimals                              = 6;

                const lpTokenContractAddress                = lpTokenPoolMockFa12TokenAddress.address;
                const lpTokenId                             = 0;

                const reserveRatio                          = 5000;
                const optimalUtilisationRate                = 300;
                const baseInterestRate                      = 5;
                const maxInterestRate                       = 50;
                const interestRateBelowOptimalUtilisation   = 100;
                const interestRateAboveOptimalUtilisation   = 300;

                // check if loan token exists
                const checkLoanTokenExists   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

                if(checkLoanTokenExists === undefined){

                    const adminSetMockFa12LoanTokenOperation = await lendingControllerInstance.methods.setLoanToken(
                        
                        tokenName,
                        decimals,

                        lpTokenContractAddress,
                        lpTokenId,
                        
                        reserveRatio,
                        optimalUtilisationRate,
                        baseInterestRate,
                        maxInterestRate,
                        interestRateBelowOptimalUtilisation,
                        interestRateAboveOptimalUtilisation,

                        // fa12 token type - token contract address
                        tokenType,
                        tokenContractAddress,

                    ).send();
                    await adminSetMockFa12LoanTokenOperation.confirmation();

                    lendingControllerStorage  = await lendingControllerInstance.storage();
                    const mockFa12LoanToken   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

                    assert.equal(mockFa12LoanToken.tokenName              , tokenName);
                    // assert.equal(mockFa12LoanToken.tokenContractAddress   , tokenContractAddress);
    
                    assert.equal(mockFa12LoanToken.lpTokensTotal          , 0);
                    assert.equal(mockFa12LoanToken.lpTokenContractAddress , lpTokenContractAddress);
                    assert.equal(mockFa12LoanToken.lpTokenId              , 0);
    
                    assert.equal(mockFa12LoanToken.reserveRatio           , reserveRatio);
                    assert.equal(mockFa12LoanToken.tokenPoolTotal         , 0);
                    assert.equal(mockFa12LoanToken.totalBorrowed          , 0);
                    assert.equal(mockFa12LoanToken.totalRemaining         , 0);
    
                    assert.equal(mockFa12LoanToken.optimalUtilisationRate , optimalUtilisationRate);
                    assert.equal(mockFa12LoanToken.baseInterestRate       , baseInterestRate);
                    assert.equal(mockFa12LoanToken.maxInterestRate        , maxInterestRate);
                    
                    assert.equal(mockFa12LoanToken.interestRateBelowOptimalUtilisation       , interestRateBelowOptimalUtilisation);
                    assert.equal(mockFa12LoanToken.interestRateAboveOptimalUtilisation       , interestRateAboveOptimalUtilisation);
    
                } else {

                    lendingControllerStorage  = await lendingControllerInstance.storage();
                    const mockFa12LoanToken   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 
                
                    // other variables will be affected by repeated tests
                    assert.equal(mockFa12LoanToken.tokenName              , tokenName);
                    // assert.equal(mockFa12LoanToken.tokenContractAddress   , tokenContractAddress);

                }

            } catch(e){
                console.log(e);
            } 
        });

        it('admin can set lending controller mock FA2 loan token', async () => {

            try{        
                
                // init variables
                await signerFactory(bob.sk);

                const tokenName                             = "mockFa2";
                const tokenContractAddress                  = mockFa2TokenAddress.address;
                const tokenType                             = "fa2";
                const tokenId                               = 0;
                const decimals                              = 6;

                const lpTokenContractAddress                = lpTokenPoolMockFa2TokenAddress.address;
                const lpTokenId                             = 0;

                const reserveRatio                          = 5000;
                const optimalUtilisationRate                = 300;
                const baseInterestRate                      = 5;
                const maxInterestRate                       = 50;
                const interestRateBelowOptimalUtilisation   = 100;
                const interestRateAboveOptimalUtilisation   = 300;

                // const contractParameterSchema = lendingControllerInstance.parameterSchema.ExtractSchema();
                // console.log(JSON.stringify(contractParameterSchema,null,2));

                const checkLoanTokenExists   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

                if(checkLoanTokenExists === undefined){

                    const adminSetMockFa2LoanTokenOperation = await lendingControllerInstance.methods.setLoanToken(
                        
                        tokenName,
                        decimals,

                        lpTokenContractAddress,
                        lpTokenId,
                        
                        reserveRatio,
                        optimalUtilisationRate,
                        baseInterestRate,
                        maxInterestRate,
                        interestRateBelowOptimalUtilisation,
                        interestRateAboveOptimalUtilisation,
                        
                        // fa2 token type - token contract address + token id
                        tokenType,
                        tokenContractAddress,
                        tokenId

                    ).send();
                    await adminSetMockFa2LoanTokenOperation.confirmation();

                    lendingControllerStorage = await lendingControllerInstance.storage();
                    const mockFa2LoanToken   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

                    assert.equal(mockFa2LoanToken.tokenName              , tokenName);
                    // assert.equal(mockFa2LoanToken.tokenContractAddress   , tokenContractAddress);
                    // assert.equal(mockFa2LoanToken.tokenId                , tokenId);

                    assert.equal(mockFa2LoanToken.lpTokensTotal          , 0);
                    assert.equal(mockFa2LoanToken.lpTokenContractAddress , lpTokenContractAddress);
                    assert.equal(mockFa2LoanToken.lpTokenId              , 0);

                    assert.equal(mockFa2LoanToken.reserveRatio           , reserveRatio);
                    assert.equal(mockFa2LoanToken.tokenPoolTotal         , 0);
                    assert.equal(mockFa2LoanToken.totalBorrowed          , 0);
                    assert.equal(mockFa2LoanToken.totalRemaining         , 0);

                    assert.equal(mockFa2LoanToken.optimalUtilisationRate , optimalUtilisationRate);
                    assert.equal(mockFa2LoanToken.baseInterestRate       , baseInterestRate);
                    assert.equal(mockFa2LoanToken.maxInterestRate        , maxInterestRate);
                    
                    assert.equal(mockFa2LoanToken.interestRateBelowOptimalUtilisation       , interestRateBelowOptimalUtilisation);
                    assert.equal(mockFa2LoanToken.interestRateAboveOptimalUtilisation       , interestRateAboveOptimalUtilisation);

                } else {

                    lendingControllerStorage = await lendingControllerInstance.storage();
                    const mockFa2LoanToken   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

                    // other variables will be affected by repeated tests
                    assert.equal(mockFa2LoanToken.tokenName              , tokenName);
                    // assert.equal(mockFa2LoanToken.tokenContractAddress   , tokenContractAddress);
                    // assert.equal(mockFa2LoanToken.tokenId                , tokenId);

                }
                
                
            } catch(e){
                console.log(e);
            } 
        });


        it('admin can set lending controller tez loan token', async () => {

            try{        
                
                // init variables
                await signerFactory(bob.sk);

                const tokenName                             = "tez";
                const tokenType                             = "tez";
                const decimals                              = 6;

                const lpTokenContractAddress                = lpTokenPoolXtzAddress.address;
                const lpTokenId                             = 0;

                const reserveRatio                          = 5000;
                const optimalUtilisationRate                = 300;
                const baseInterestRate                      = 5;
                const maxInterestRate                       = 50;
                const interestRateBelowOptimalUtilisation   = 100;
                const interestRateAboveOptimalUtilisation   = 300;

                // check if loan token exists
                const checkLoanTokenExists   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

                if(checkLoanTokenExists === undefined){

                    const adminSeTezLoanTokenOperation = await lendingControllerInstance.methods.setLoanToken(
                        
                        tokenName,
                        decimals,

                        lpTokenContractAddress,
                        lpTokenId,
                        
                        reserveRatio,
                        optimalUtilisationRate,
                        baseInterestRate,
                        maxInterestRate,
                        interestRateBelowOptimalUtilisation,
                        interestRateAboveOptimalUtilisation,

                        // fa12 token type - token contract address
                        tokenType

                    ).send();
                    await adminSeTezLoanTokenOperation.confirmation();

                    lendingControllerStorage  = await lendingControllerInstance.storage();
                    const tezLoanToken   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 
                
                    assert.equal(tezLoanToken.tokenName              , tokenName);
                    assert.equal(tezLoanToken.decimals               , decimals);

                    assert.equal(tezLoanToken.lpTokensTotal          , 0);
                    assert.equal(tezLoanToken.lpTokenContractAddress , lpTokenContractAddress);
                    assert.equal(tezLoanToken.lpTokenId              , 0);
    
                    assert.equal(tezLoanToken.reserveRatio           , reserveRatio);
                    assert.equal(tezLoanToken.tokenPoolTotal         , 0);
                    assert.equal(tezLoanToken.totalBorrowed          , 0);
                    assert.equal(tezLoanToken.totalRemaining         , 0);
    
                    assert.equal(tezLoanToken.optimalUtilisationRate , optimalUtilisationRate);
                    assert.equal(tezLoanToken.baseInterestRate       , baseInterestRate);
                    assert.equal(tezLoanToken.maxInterestRate        , maxInterestRate);
                    
                    assert.equal(tezLoanToken.interestRateBelowOptimalUtilisation       , interestRateBelowOptimalUtilisation);
                    assert.equal(tezLoanToken.interestRateAboveOptimalUtilisation       , interestRateAboveOptimalUtilisation);
    

                } else {

                    lendingControllerStorage  = await lendingControllerInstance.storage();
                    const tezLoanToken   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 
                
                    // other variables will be affected by repeated tests
                    assert.equal(tezLoanToken.tokenName              , tokenName);
                    
                }

            } catch(e){
                console.log(e);
            } 
        });


        it('non-admin should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                await signerFactory(alice.sk);
                lendingControllerStorage = await lendingControllerInstance.storage();
                const currentAdmin = lendingControllerStorage.admin;

                const tokenName                             = "failTestLoanToken";
                const tokenContractAddress                  = mockFa2TokenAddress.address;
                const tokenType                             = "fa2";
                const tokenId                               = 0;
                const decimals                              = 6;

                const lpTokenContractAddress                = lpTokenPoolMockFa2TokenAddress.address;
                const lpTokenId                             = 0;

                const reserveRatio                          = 5000;
                const optimalUtilisationRate                = 300;
                const baseInterestRate                      = 5;
                const maxInterestRate                       = 50;
                const interestRateBelowOptimalUtilisation   = 100;
                const interestRateAboveOptimalUtilisation   = 300;

                await chai.expect(lendingControllerInstance.methods.setLoanToken(
                        
                    tokenName,
                    decimals,

                    lpTokenContractAddress,
                    lpTokenId,
                    
                    reserveRatio,
                    optimalUtilisationRate,
                    baseInterestRate,
                    maxInterestRate,
                    interestRateBelowOptimalUtilisation,
                    interestRateAboveOptimalUtilisation,
                    
                    // fa2 token type - token contract address + token id
                    tokenType,
                    tokenContractAddress,
                    tokenId

                ).send()).to.be.rejected;

                // Final values
                lendingControllerStorage = await lendingControllerInstance.storage();
                const failTestLoanToken   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

                // Assertions
                assert.strictEqual(failTestLoanToken, undefined);

            } catch(e){
                console.log(e);
            }
        });
        
    });



    // 
    // Setup and test Lending Controller UpdateCollateralToken entrypoint - tokens which vault owners can use as collateral
    //
    describe('%updateCollateralToken - setup and test lending controller %updateCollateralToken entrypoint', function () {

        it('admin can set lending controller mock FA12 as a collateral token', async () => {

            try{        
                
                // init variables
                await signerFactory(bob.sk);

                const tokenName                  = "mockFa12";
                const tokenContractAddress       = mockFa12TokenAddress.address;
                const tokenType                  = "fa12";
                const tokenId                    = 0;

                const decimals                   = 6;
                const oracleType                 = "oracle";
                const oracleAddress              = mockUsdMockFa12TokenAggregatorAddress.address;
                
                // check if collateral token exists
                const checkCollateralTokenExists   = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

                if(checkCollateralTokenExists === undefined){

                    const adminSetMockFa12CollateralTokenOperation = await lendingControllerInstance.methods.updateCollateralToken(
                        
                        tokenName,
                        tokenContractAddress,
                        decimals,

                        oracleType,
                        oracleAddress,

                        // fa12 token type - token contract address
                        tokenType,
                        tokenContractAddress,

                    ).send();
                    await adminSetMockFa12CollateralTokenOperation.confirmation();

                }

                lendingControllerStorage        = await lendingControllerInstance.storage();
                const mockFa12CollateralToken   = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 
            
                assert.equal(mockFa12CollateralToken.tokenName              , tokenName);
                // assert.equal(mockFa12CollateralToken.tokenContractAddress   , tokenContractAddress);
                // assert.equal(mockFa12CollateralToken.tokenId                , tokenId);

                assert.equal(mockFa12CollateralToken.decimals               , decimals);
                assert.equal(mockFa12CollateralToken.oracleType             , oracleType);
                assert.equal(mockFa12CollateralToken.oracleAddress          , oracleAddress);
                

            } catch(e){
                console.log(e);
            } 
        });

        it('admin can set lending controller mock FA2 collateral token', async () => {

            try{        
                
                // init variables
                await signerFactory(bob.sk);

                const tokenName                             = "mockFa2";
                const tokenContractAddress                  = mockFa2TokenAddress.address;
                const tokenType                             = "fa2";
                const tokenId                               = 0;

                const decimals                              = 6;
                const oracleType                            = "oracle";
                const oracleAddress                         = mockUsdMockFa2TokenAggregatorAddress.address;;
                
                // check if collateral token exists
                const checkCollateralTokenExists   = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

                if(checkCollateralTokenExists === undefined){

                    const adminSetMockFa2CollateralTokenOperation = await lendingControllerInstance.methods.updateCollateralToken(
                        
                        tokenName,
                        tokenContractAddress,
                        decimals,

                        oracleType,
                        oracleAddress,
                        
                        // fa2 token type - token contract address + token id
                        tokenType,
                        tokenContractAddress,
                        tokenId

                    ).send();
                    await adminSetMockFa2CollateralTokenOperation.confirmation();

                }

                lendingControllerStorage        = await lendingControllerInstance.storage();
                const mockFa2CollateralToken    = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

                assert.equal(mockFa2CollateralToken.tokenName              , tokenName);
                // assert.equal(mockFa2CollateralToken.tokenContractAddress   , tokenContractAddress);
                // assert.equal(mockFa2CollateralToken.tokenId                , tokenId);

                assert.equal(mockFa2CollateralToken.decimals               , decimals);
                assert.equal(mockFa2CollateralToken.oracleType             , oracleType);
                assert.equal(mockFa2CollateralToken.oracleAddress          , oracleAddress);


            } catch(e){
                console.log(e);
            } 
        });

        it('admin can set lending controller tez collateral token', async () => {

            try{        
                
                // init variables
                await signerFactory(bob.sk);

                const tokenName                             = "tez";
                const tokenContractAddress                  = zeroAddress;
                const tokenType                             = "tez";
                const tokenId                               = 0;

                const decimals                              = 6;
                const oracleType                            = "oracle";
                const oracleAddress                         = mockUsdXtzAggregatorAddress.address;;
                
                // check if collateral token exists
                const checkCollateralTokenExists   = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

                if(checkCollateralTokenExists === undefined){

                    const adminSetMockFa2CollateralTokenOperation = await lendingControllerInstance.methods.updateCollateralToken(
                        
                        tokenName,
                        tokenContractAddress,
                        decimals,

                        oracleType,
                        oracleAddress,
                        
                        // fa2 token type - token contract address + token id
                        tokenType,
                        tokenContractAddress,
                        tokenId

                    ).send();
                    await adminSetMockFa2CollateralTokenOperation.confirmation();

                }

                lendingControllerStorage        = await lendingControllerInstance.storage();
                const mockFa2CollateralToken    = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

                assert.equal(mockFa2CollateralToken.tokenName              , tokenName);
                // assert.equal(mockFa2CollateralToken.tokenContractAddress   , tokenContractAddress);
                // assert.equal(mockFa2CollateralToken.tokenId                , tokenId);

                assert.equal(mockFa2CollateralToken.decimals               , decimals);
                assert.equal(mockFa2CollateralToken.oracleType             , oracleType);
                assert.equal(mockFa2CollateralToken.oracleAddress          , oracleAddress);


            } catch(e){
                console.log(e);
            } 
        });

        it('non-admin should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                await signerFactory(alice.sk);
                lendingControllerStorage = await lendingControllerInstance.storage();
                const currentAdmin = lendingControllerStorage.admin;

                const tokenName                             = "failTestCollateralToken";
                const tokenContractAddress                  = mockFa2TokenAddress.address;
                const tokenType                             = "fa2";
                const tokenId                               = 0;

                const decimals                              = 6;
                const oracleType                            = "oracle";
                const oracleAddress                         = zeroAddress;
            

                await chai.expect(lendingControllerInstance.methods.updateCollateralToken(
                        
                    tokenName,
                    tokenContractAddress,
                    decimals,

                    oracleType,
                    oracleAddress,
                    
                    // fa2 token type - token contract address + token id
                    tokenType,
                    tokenContractAddress,
                    tokenId

                ).send()).to.be.rejected;

                // Final values
                lendingControllerStorage = await lendingControllerInstance.storage();
                const failTestCollateralToken   = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

                // Assertions
                assert.strictEqual(failTestCollateralToken, undefined);

            } catch(e){
                console.log(e);
            }
        });
        
    });



    // 
    // Test: Set Lending Controller Admin
    //
    describe('%setAdmin - Lending Controller', function () {
    
        it('admin can set admin', async () => {
            try{        
        
                await signerFactory(bob.sk);
                const previousAdmin = lendingControllerStorage.admin;
                
                if(previousAdmin == bob.pkh){
                    
                    assert.equal(previousAdmin, bob.pkh);
                    const setNewAdminOperation = await lendingControllerInstance.methods.setAdmin(governanceProxyAddress.address).send();
                    await setNewAdminOperation.confirmation();

                    const updatedLendingControllerStorage = await lendingControllerInstance.storage();
                    const newAdmin = updatedLendingControllerStorage.admin;

                    assert.equal(newAdmin, governanceProxyAddress.address);
                };

            } catch(e){
                console.log(e);
            } 

        });   


        it('non-admin cannot set admin', async () => {
            try{        
        
                await signerFactory(mallory.sk);
        
                    const failSetNewAdminOperation = await lendingControllerInstance.methods.setAdmin(governanceProxyAddress.address);
                    await chai.expect(failSetNewAdminOperation.send()).to.be.rejected;    

                    const updatedLendingControllerStorage = await lendingControllerInstance.storage();
                    const admin = updatedLendingControllerStorage.admin;
                    assert.equal(admin, governanceProxyAddress.address);

            } catch(e){
                console.log(e);
            } 

        });   
    })

    // 
    // Test: Create vaults with no tez 
    //
    describe('%createVault test: create vaults with no tez', function () {

        it('user (eve) can create a new vault (depositors: any) with no tez - LOAN TOKEN: MockFA12', async () => {
            try{        
                
                // init variables
                await signerFactory(eve.sk);
                const vaultId       = parseInt(lendingControllerStorage.vaultCounter);
                const vaultOwner    = eve.pkh;
                const depositors    = "any";
                const loanTokenName = "mockFa12";

                const vaultMetadataBase = Buffer.from(
                    JSON.stringify({
                        name: 'EVE VAULT',
                        description: 'MAVRYK Vault Contract',
                        version: 'v1.0.0',
                        authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
                    }),
                    'ascii',
                ).toString('hex');

                // user (eve) creates a new vault with no tez
                const userCreatesNewVaultOperation = await lendingControllerInstance.methods.createVault(
                    eve.pkh,                // delegate to
                    vaultMetadataBase,      // metadata
                    loanTokenName,          // loan token type
                    depositors,             // depositors type
                ).send();
                await userCreatesNewVaultOperation.confirmation();

                const updatedLendingControllerStorage = await lendingControllerInstance.storage();
                const vaultHandle = {
                    "id"    : vaultId,
                    "owner" : vaultOwner
                };
                const vaultRecord = await updatedLendingControllerStorage.vaults.get(vaultHandle);

                assert.equal(vaultRecord.loanToken              , loanTokenName);
                assert.equal(vaultRecord.loanOutstandingTotal   , 0);
                assert.equal(vaultRecord.loanPrincipalTotal     , 0);
                assert.equal(vaultRecord.loanInterestTotal      , 0);

                const vaultOriginatedContract = await utils.tezos.contract.at(vaultRecord.address);
                const vaultOriginatedContractStorage : vaultStorageType = await vaultOriginatedContract.storage();

                assert.equal(vaultOriginatedContractStorage.admin , governanceProxyAddress.address);

                // push new vault id to vault set
                eveVaultSet.push(vaultId);

            } catch(e){
                console.log(e);
            } 

        });    

        it('user (mallory) can create a new vault (depositors: whitelist set) with no tez - LOAN TOKEN: MockFA12', async () => {
            try{        

                // init variables
                await signerFactory(mallory.sk);
                const lendingControllerStorage  = await lendingControllerInstance.storage();
                const vaultId                   = parseInt(lendingControllerStorage.vaultCounter);
                const vaultOwner                = mallory.pkh;
                const depositors                = "whitelist";
                const loanTokenName             = "mockFa12";

                const vaultMetadataBase = Buffer.from(
                    JSON.stringify({
                        name: 'MALLORY VAULT',
                        description: 'MAVRYK Vault Contract',
                        version: 'v1.0.0',
                        authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
                    }),
                    'ascii',
                ).toString('hex');

                // user (mallory) creates a new vault with no tez
                const userCreatesNewVaultOperation = await lendingControllerInstance.methods.createVault(
                    mallory.pkh,  
                    vaultMetadataBase,    
                    loanTokenName,
                    depositors,
                    [mallory.pkh],
                ).send();
                await userCreatesNewVaultOperation.confirmation();

                const updatedLendingControllerStorage = await lendingControllerInstance.storage();
                const vaultHandle = {
                    "id"    : vaultId,
                    "owner" : vaultOwner
                }
                const vaultRecord = await updatedLendingControllerStorage.vaults.get(vaultHandle);

                assert.equal(vaultRecord.loanToken              , loanTokenName);
                assert.equal(vaultRecord.loanOutstandingTotal   , 0);
                assert.equal(vaultRecord.loanPrincipalTotal     , 0);
                assert.equal(vaultRecord.loanInterestTotal      , 0);

                const vaultOriginatedContract = await utils.tezos.contract.at(vaultRecord.address);
                const vaultOriginatedContractStorage : vaultStorageType = await vaultOriginatedContract.storage();

                assert.equal(vaultOriginatedContractStorage.admin , governanceProxyAddress.address);

                // push new vault id to vault set
                malloryVaultSet.push(vaultId);

            } catch(e){
                console.log(e);
            } 

        });    
    
    }); // end test: create vaults with no tez



    // 
    // Test: Create vaults with tez as initial deposit
    //
    describe('%createVault test: create vaults with tez as initial deposit', function () {

        it('user (mallory) can create a new vault (depositors: any) with 10 tez as initial deposit - LOAN TOKEN: MockFA2', async () => {
            try{        
                
                // init variables
                await signerFactory(mallory.sk);
                const lendingControllerStorage  = await lendingControllerInstance.storage();
                const vaultId                   = parseInt(lendingControllerStorage.vaultCounter);
                const vaultOwner                = mallory.pkh;
                const depositors                = "any"
                const tezSent                   = 10;
                const loanTokenName             = "mockFa2";

                const vaultMetadataBase = Buffer.from(
                    JSON.stringify({
                        name: 'MALLORY VAULT (any depositors with Tez)',
                        description: 'MAVRYK Vault Contract',
                        version: 'v1.0.0',
                        authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
                    }),
                    'ascii',
                ).toString('hex');

                // user (mallory) creates a new vault
                const userCreatesNewVaultOperation = await lendingControllerInstance.methods.createVault(
                    mallory.pkh,  
                    vaultMetadataBase,
                    loanTokenName,
                    depositors,
                    ).send({ amount : tezSent });
                await userCreatesNewVaultOperation.confirmation();

                const updatedLendingControllerStorage = await lendingControllerInstance.storage();
                const vaultHandle = {
                    "id"    : vaultId,
                    "owner" : vaultOwner
                };
                const vaultRecord           = await updatedLendingControllerStorage.vaults.get(vaultHandle);
                const tezCollateralBalance  = await vaultRecord.collateralBalanceLedger.get('tez');

                assert.equal(tezCollateralBalance, TEZ(tezSent));

                // push new vault id to vault set
                malloryVaultSet.push(vaultId);

            } catch(e){
                console.log(e);
            } 

        });    

        it('user (eve) can create a new vault (depositors: whitelist set) with 10 tez as initial deposit - LOAN TOKEN: MockFA2', async () => {
            try{        
                
                // init variables
                await signerFactory(eve.sk);
                const lendingControllerStorage  = await lendingControllerInstance.storage();
                const vaultId                   = parseInt(lendingControllerStorage.vaultCounter);
                const vaultOwner                = eve.pkh;
                const depositors                = "whitelist";
                const tezSent                   = 10;
                const loanTokenName             = "mockFa2";

                const vaultMetadataBase = Buffer.from(
                    JSON.stringify({
                        name: 'MALLORY VAULT (whitelist depositors with Tez)',
                        description: 'MAVRYK Vault Contract',
                        version: 'v1.0.0',
                        authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
                    }),
                    'ascii',
                ).toString('hex');

                // user (eve) creates a new vault
                const userCreatesNewVaultOperation = await lendingControllerInstance.methods.createVault(
                    eve.pkh,  
                    vaultMetadataBase,
                    loanTokenName,
                    depositors,
                    [eve.pkh],
                    ).send({ amount: tezSent });
                await userCreatesNewVaultOperation.confirmation();

                const updatedLendingControllerStorage = await lendingControllerInstance.storage();
                const vaultHandle = {
                    "id"    : vaultId,
                    "owner" : vaultOwner
                }
                const vaultRecord           = await updatedLendingControllerStorage.vaults.get(vaultHandle);
                const tezCollateralBalance  = await vaultRecord.collateralBalanceLedger.get('tez');

                assert.equal(tezCollateralBalance, TEZ(tezSent));

                // push new vault id to vault set
                eveVaultSet.push(vaultId);

            } catch(e){
                console.log(e);
            } 

        });    


        it('user (eve) can create a new vault (depositors: whitelist set) with 10 tez as initial deposit - LOAN TOKEN: TEZ', async () => {
            try{        
                
                // init variables
                await signerFactory(eve.sk);
                const lendingControllerStorage  = await lendingControllerInstance.storage();
                const vaultId                   = parseInt(lendingControllerStorage.vaultCounter);
                const vaultOwner                = eve.pkh;
                const depositors                = "whitelist";
                const tezSent                   = 10;
                const loanTokenName             = "tez";

                const vaultMetadataBase = Buffer.from(
                    JSON.stringify({
                        name: 'MALLORY VAULT (whitelist depositors with Tez)',
                        description: 'MAVRYK Vault Contract',
                        version: 'v1.0.0',
                        authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
                    }),
                    'ascii',
                ).toString('hex');

                // user (eve) creates a new vault
                const userCreatesNewVaultOperation = await lendingControllerInstance.methods.createVault(
                    eve.pkh,  
                    vaultMetadataBase,
                    loanTokenName,
                    depositors,
                    [eve.pkh],
                    ).send({ amount: tezSent });
                await userCreatesNewVaultOperation.confirmation();

                const updatedLendingControllerStorage = await lendingControllerInstance.storage();
                const vaultHandle = {
                    "id"    : vaultId,
                    "owner" : vaultOwner
                }
                const vaultRecord           = await updatedLendingControllerStorage.vaults.get(vaultHandle);
                const tezCollateralBalance  = await vaultRecord.collateralBalanceLedger.get('tez');

                assert.equal(tezCollateralBalance, TEZ(tezSent));

                // push new vault id to vault set
                eveVaultSet.push(vaultId);

            } catch(e){
                console.log(e);
            } 

        });    

    }); // end test: create vaults with tez as initial deposit



    // 
    // Test: Deposit tez into vault
    //
    describe('%vaultDeposit test: deposit tez into vault', function () {
    
        it('user (eve) can deposit tez into her vault (depositors: any)', async () => {
            
            // init variables
            await signerFactory(eve.sk);
            const vaultId            = eveVaultSet[0];
            const vaultOwner         = eve.pkh;
            const depositAmountMutez = 10000000;
            const depositAmountTez   = 10;

            const vaultHandle = {
                "id"     : vaultId,
                "owner"  : vaultOwner
            };

            const lendingControllerStorage      = await lendingControllerInstance.storage();
            const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);

            // get vault contract
            const vaultAddress             = vault.address;
            const eveVaultInstance         = await utils.tezos.contract.at(vaultAddress);
            const eveVaultInstanceStorage  = await eveVaultInstance.storage();

            const eveDepositTezOperation  = await eveVaultInstance.methods.vaultDeposit(
                depositAmountMutez,                   // amt
                "tez"                                 // token
            ).send({ mutez : true, amount : depositAmountMutez });
            await eveDepositTezOperation.confirmation();

            const updatedLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedVault                    = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const tezCollateralBalance            = await updatedVault.collateralBalanceLedger.get('tez');
            
            assert.equal(tezCollateralBalance, TEZ(depositAmountTez));

        });

        it('user (mallory) can deposit tez into user (eve)\'s vault (depositors: any)', async () => {
            
            // init variables
            await signerFactory(mallory.sk);
            const vaultId            = eveVaultSet[0];
            const vaultOwner         = eve.pkh;

            const depositAmountMutez = 10000000;
            const depositAmountTez   = 10;
            const finalAmountMutez   = 20000000;
            const finalAmountTez     = 20;

            const vaultHandle = {
                "id"    : vaultId,
                "owner" : vaultOwner
            };

            const lendingControllerStorage      = await lendingControllerInstance.storage();
            const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);
            const initialTezCollateralBalance   = await vault.collateralBalanceLedger.get('tez');

            // check that initial tez collateral balance is now ten tez
            assert.equal(initialTezCollateralBalance, TEZ(10));

            // get vault contract
            const vaultAddress             = vault.address;
            const eveVaultInstance         = await utils.tezos.contract.at(vaultAddress);
            const eveVaultInstanceStorage  = await eveVaultInstance.storage();

            const malloryDepositTezIntoEveVaultOperation  = await eveVaultInstance.methods.vaultDeposit(
                depositAmountMutez,                   // amt
                "tez"                                 // token
            ).send({ mutez : true, amount : depositAmountMutez });
            await malloryDepositTezIntoEveVaultOperation.confirmation();

            const updatedLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedVault                    = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const tezCollateralBalance            = await updatedVault.collateralBalanceLedger.get('tez');
            
            // check that tez balance is now 20 tez
            assert.equal(tezCollateralBalance, TEZ(finalAmountTez));

        });

        it('user (mallory) deposit tez into her vault (depositors: whitelist set)', async () => {
            
            // init variables
            await signerFactory(mallory.sk);
            const vaultId            = malloryVaultSet[0];;
            const vaultOwner         = mallory.pkh;
    
            const depositAmountMutez = 10000000;
            const depositAmountTez   = 10;
    
            const vaultHandle = {
                "id"     : vaultId,
                "owner"  : vaultOwner
            };
    
            const lendingControllerStorage      = await lendingControllerInstance.storage();
            const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);
    
            // get vault contract
            const vaultAddress             = vault.address;
            const vaultInstance            = await utils.tezos.contract.at(vaultAddress);
            const vaultInstanceStorage     = await vaultInstance.storage();
    
            const malloryDepositTezOperation  = await vaultInstance.methods.vaultDeposit(
                depositAmountMutez,                   // amt
                "tez"                                 // token
            ).send({ mutez : true, amount : depositAmountMutez });
            await malloryDepositTezOperation.confirmation();
    
            const updatedLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedVault                    = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const tezCollateralBalance            = await updatedVault.collateralBalanceLedger.get('tez');
            
            assert.equal(tezCollateralBalance, TEZ(depositAmountTez));
    
        });
    
        it('user (eve) cannot deposit tez into user (mallory)\'s vault (depositors: whitelist set)', async () => {
                
            // init variables
            await signerFactory(eve.sk);
            const vaultId            = malloryVaultSet[0];
            const vaultOwner         = mallory.pkh;
            const depositAmountMutez = 10000000;
            const depositAmountTez   = 10;
            const finalAmountMutez   = 20000000;
            const finalAmountTez     = 20;
    
            const vaultHandle = {
                "id"    : vaultId,
                "owner" : vaultOwner
            };
    
            const lendingControllerStorage      = await lendingControllerInstance.storage();
            const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);
            const initialTezCollateralBalance   = await vault.collateralBalanceLedger.get('tez');
    
            // check that initial tez collateral balance is now ten tez (from previous test)
            assert.equal(initialTezCollateralBalance, TEZ(10));
    
            // get vault contract
            const vaultAddress              = vault.address;
            const vaultInstance             = await utils.tezos.contract.at(vaultAddress);
            const vaultInstanceStorage      = await vaultInstance.storage();
    
            const failEveDepositTezIntoMalloryVaultOperation  = await vaultInstance.methods.vaultDeposit(
                depositAmountMutez,                   // amt
                "tez"                                 // token
            );
            await chai.expect(failEveDepositTezIntoMalloryVaultOperation.send({ mutez : true, amount : depositAmountMutez })).to.be.rejected;    
    
        });

    }); // end test: deposit tez into vault



    // 
    // Test: Deposit Mock FA12 Tokens into vault
    //
    describe('%vaultDeposit test: deposit mock FA12 tokens into vault', function () {
    
        it('user (eve) can deposit mock FA12 tokens into her vault (depositors: any)', async () => {
    
            // init variables
            await signerFactory(eve.sk);
            const vaultId            = eveVaultSet[0];
            const vaultOwner         = eve.pkh;

            const tokenName          = "mockFa12";
            const tokenType          = "fa12";
            const depositAmount      = 10000000;   // 10 Mock FA12 Tokens

            lendingControllerStorage = await lendingControllerInstance.storage();
            
            // create vault handle
            const vaultHandle = {
                "id"     : vaultId,
                "owner"  : vaultOwner
            };
            
            const vault                     = await lendingControllerStorage.vaults.get(vaultHandle);

            // get vault contract
            const vaultAddress              = vault.address;
            const vaultInstance             = await utils.tezos.contract.at(vaultAddress);;

            // get mock fa12 token storage
            const mockFa12TokenStorage              = await mockFa12TokenInstance.storage();
            
            // get initial eve's Mock FA12 Token balance
            const eveMockFa12Ledger                 = await mockFa12TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMockFa12TokenBalance    = eveMockFa12Ledger == undefined ? 0 : parseInt(eveMockFa12Ledger.balance);

            // get initial vault's Mock FA12 Token balance
            const vaultMockFa12Ledger                = await mockFa12TokenStorage.ledger.get(vaultAddress);            
            const vaultInitialMockFa12TokenBalance   = vaultMockFa12Ledger == undefined ? 0 : parseInt(vaultMockFa12Ledger.balance);

            // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
            // reset token allowance
            const resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
                vaultAddress,
                0
            ).send();
            await resetTokenAllowance.confirmation();

            // set new token allowance
            const setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
                vaultAddress,
                depositAmount
            ).send();
            await setNewTokenAllowance.confirmation();

            // eve deposits mock FA12 tokens into vault
            const eveDepositMockFa12TokenOperation  = await vaultInstance.methods.vaultDeposit(
                depositAmount,                         // amt
                tokenType,                             // token type 
                mockFa12TokenAddress.address           // mockFa12 Token address 
            ).send();
            await eveDepositMockFa12TokenOperation.confirmation();

            const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
            const updatedVault                      = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const mockFa12TokenCollateralBalance    = await updatedVault.collateralBalanceLedger.get(tokenName);

            // vault Mock FA12 Token Collateral Balance
            assert.equal(mockFa12TokenCollateralBalance, depositAmount);

            // check Eve's Mock FA12 Token balance
            const updatedMockFa12TokenStorage      = await mockFa12TokenInstance.storage();
            const updatedEveMockFa12Ledger         = await updatedMockFa12TokenStorage.ledger.get(eve.pkh);            
            assert.equal(updatedEveMockFa12Ledger.balance, eveInitialMockFa12TokenBalance - depositAmount);

            // check vault's Mock FA12 Token Balance
            const vaultMockFa12Account             = await updatedMockFa12TokenStorage.ledger.get(vaultAddress);            
            assert.equal(vaultMockFa12Account.balance, vaultInitialMockFa12TokenBalance + depositAmount);

        });

        it('user (mallory) can deposit mock FA12 tokens into user (eve)\'s vault (depositors: any)', async () => {
    
            // init variables
            await signerFactory(mallory.sk);
            const vaultId            = eveVaultSet[0];
            const vaultOwner         = eve.pkh;

            const tokenName          = "mockFa12";
            const tokenType          = "fa12";
            const depositAmount      = 10000000;   // 10 Mock FA12 Tokens

            lendingControllerStorage = await lendingControllerInstance.storage();

            // create vault handle
            const vaultHandle = {
                "id"     : vaultId,
                "owner"  : vaultOwner
            };

            // get vault from Lending Controller
            const vault                    = await lendingControllerStorage.vaults.get(vaultHandle);

            // get vault contract
            const vaultAddress             = vault.address;
            const vaultInstance            = await utils.tezos.contract.at(vaultAddress);

            // get mock fa12 token storage
            const mockFa12TokenStorage     = await mockFa12TokenInstance.storage();

            // get initial mallory's mock fa12 token balance
            const malloryMockFa12Ledger              = await mockFa12TokenStorage.ledger.get(mallory.pkh);            
            const malloryInitialMockFa12TokenBalance = malloryMockFa12Ledger == undefined ? 0 : parseInt(malloryMockFa12Ledger.balance);

            // get initial vault's Mock FA12 Token balance
            const vaultMockFa12Ledger                = await mockFa12TokenStorage.ledger.get(vaultAddress);            
            const vaultInitialMockFa12TokenBalance   = vaultMockFa12Ledger == undefined ? 0 : parseInt(vaultMockFa12Ledger.balance);        

            // mallory resets mock FA12 tokens allowance then set new allowance to deposit amount
            // reset token allowance
            const resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
                vaultAddress,
                0
            ).send();
            await resetTokenAllowance.confirmation();

            // set new token allowance
            const setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
                vaultAddress,
                depositAmount
            ).send();
            await setNewTokenAllowance.confirmation();

            // mallory deposits mock FA12 tokens into eve's vault
            const malloryDepositMockFa12TokenOperation  = await vaultInstance.methods.vaultDeposit(
                depositAmount,                         // amt
                tokenType,                                // token
                mockFa12TokenAddress.address           // mock FA12 Token address 
            ).send();
            await malloryDepositMockFa12TokenOperation.confirmation();

            const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
            const updatedVault                      = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const mockFa12TokenCollateralBalance    = await updatedVault.collateralBalanceLedger.get(tokenName);
            
            // vault Mock FA12 Token Collateral Balance
            const vaultTokenCollateralBalance = depositAmount + depositAmount;
            assert.equal(mockFa12TokenCollateralBalance, vaultTokenCollateralBalance);

            // get updated Mock FA12 Token storage
            const updatedMockFa12TokenStorage      = await mockFa12TokenInstance.storage();

            // check that mallory now has the correct Mock FA12 Token balance
            const updatedMalloryMockFa12Ledger     = await updatedMockFa12TokenStorage.ledger.get(mallory.pkh);            
            assert.equal(updatedMalloryMockFa12Ledger.balance, malloryInitialMockFa12TokenBalance - depositAmount);

            // check that vault has the correct Mock FA12 Token Balance
            const vaultMockFa12Account     = await updatedMockFa12TokenStorage.ledger.get(vaultAddress);            
            assert.equal(vaultMockFa12Account.balance, vaultInitialMockFa12TokenBalance + depositAmount);

        });


        it('user (eve) cannot deposit tez and mock FA12 tokens into her vault (depositors: any) at the same time', async () => {
    
            // init variables
            await signerFactory(eve.sk);
            const vaultId        = eveVaultSet[0];
            const vaultOwner     = eve.pkh;
    
            const tokenType          = "fa12";
            const depositAmount      = 10000000;   // 10 Mock FA12 Tokens

            // create vault handle
            const vaultHandle = {
                "id"     : vaultId,
                "owner"  : vaultOwner
            };
    
            lendingControllerStorage      = await lendingControllerInstance.storage();
            const vault                   = await lendingControllerStorage.vaults.get(vaultHandle);
    
            // get vault contract
            const vaultAddress             = vault.address;
            const vaultInstance            = await utils.tezos.contract.at(vaultAddress);
    
            // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
            // reset token allowance
            const resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
                vaultAddress,
                0
            ).send();
            await resetTokenAllowance.confirmation();
    
            // set new token allowance
            const setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
                vaultAddress,
                depositAmount
            ).send();
            await setNewTokenAllowance.confirmation();
    
            // eve fails to deposit tez and mock FA12 tokens into vault
            const failEveDepositTezAndMockFa12TokenOperation  = await vaultInstance.methods.vaultDeposit(
                depositAmount,                         // amt
                tokenType,                             // token
                mockFa12TokenAddress.address           // mock FA12 Token address 
            );
            await chai.expect(failEveDepositTezAndMockFa12TokenOperation.send({ mutez : true, amount : depositAmount })).to.be.rejected;    
    
        });


        it('user (mallory) can deposit mock FA12 tokens into her vault (depositors: whitelist set)', async () => {
    
            // init variables
            await signerFactory(mallory.sk);
            const vaultId            = malloryVaultSet[0];
            const vaultOwner         = mallory.pkh;

            const tokenName          = "mockFa12";
            const tokenType          = "fa12";
            const depositAmount      = 10000000;   // 10 Mock FA12 Tokens

            lendingControllerStorage      = await lendingControllerInstance.storage();

            // create vault handle
            const vaultHandle = {
                "id"     : vaultId,
                "owner"  : vaultOwner
            };

            // get vault from Lending Controller
            const vault                   = await lendingControllerStorage.vaults.get(vaultHandle);

            // get vault contract
            const vaultAddress             = vault.address;
            const vaultInstance            = await utils.tezos.contract.at(vaultAddress);

            // get mock fa12 token storage
            const mockFa12TokenStorage     = await mockFa12TokenInstance.storage();

            // get initial mallory's mock fa12 token balance
            const malloryMockFa12Ledger              = await mockFa12TokenStorage.ledger.get(mallory.pkh);            
            const malloryInitialMockFa12TokenBalance = malloryMockFa12Ledger == undefined ? 0 : parseInt(malloryMockFa12Ledger.balance);

            // get initial vault's Mock FA12 Token balance
            const vaultMockFa12Ledger                = await mockFa12TokenStorage.ledger.get(vaultAddress);            
            const vaultInitialMockFa12TokenBalance   = vaultMockFa12Ledger == undefined ? 0 : parseInt(vaultMockFa12Ledger.balance);        
            
            // mallory resets mock FA12 tokens allowance then set new allowance to deposit amount
            // reset token allowance
            const resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
                vaultAddress,
                0
            ).send();
            await resetTokenAllowance.confirmation();

            // set new token allowance
            const setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
                vaultAddress,
                depositAmount
            ).send();
            await setNewTokenAllowance.confirmation();

            // mallory deposits mock FA12 tokens into her vault
            const malloryDepositMockFa12TokenOperation  = await vaultInstance.methods.vaultDeposit(
                depositAmount,                         // amt
                tokenType,                             // token
                mockFa12TokenAddress.address           // mock FA12 Token address 
            ).send();
            await malloryDepositMockFa12TokenOperation.confirmation();

            const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
            const updatedVault                      = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const mockFa12TokenCollateralBalance    = await updatedVault.collateralBalanceLedger.get(tokenName);
            
            // vault Mock FA12 Token Collateral Balance
            const vaultTokenCollateralBalance = depositAmount;
            assert.equal(mockFa12TokenCollateralBalance, vaultTokenCollateralBalance);

            // check that mallory has the correct amount of Mock FA12 Token balance
            const updatedMockFa12TokenStorage      = await mockFa12TokenInstance.storage();
            const updatedEveMockFa12Ledger         = await updatedMockFa12TokenStorage.ledger.get(mallory.pkh);            
            assert.equal(updatedEveMockFa12Ledger.balance, malloryInitialMockFa12TokenBalance - depositAmount);

            const vaultMockFa12Account = await updatedMockFa12TokenStorage.ledger.get(vaultAddress);            
            assert.equal(vaultMockFa12Account.balance, vaultInitialMockFa12TokenBalance + depositAmount);

        });

        it('user (eve) cannot deposit mock FA12 tokens into user (mallory)\'s vault (depositors: whitelist set)', async () => {
    
            // init variables
            await signerFactory(eve.sk);
            const vaultId            = malloryVaultSet[0];
            const vaultOwner         = mallory.pkh;
    
            const tokenType          = "fa12";
            const depositAmount      = 10000000;   // 10 Mock FA12 Tokens

            lendingControllerStorage = await lendingControllerInstance.storage();
    
            // create vault handle
            const vaultHandle = {
                "id"     : vaultId,
                "owner"  : vaultOwner
            };
    
            // get vault from Lending Controller        
            const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);
    
            // get vault contract
            const vaultAddress             = vault.address;
            const vaultInstance            = await utils.tezos.contract.at(vaultAddress);
    
            // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
            // reset token allowance
            const resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
                vaultAddress,
                0
            ).send();
            await resetTokenAllowance.confirmation();
    
            // set new token allowance
            const setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
                vaultAddress,
                depositAmount
            ).send();
            await setNewTokenAllowance.confirmation();
    
            // eve fails to deposit tez and mock FA12 tokens into vault
            const failDepositMockFa12TokenOperation  = await vaultInstance.methods.vaultDeposit(
                depositAmount,                         // amt
                tokenType,                                // token
                mockFa12TokenAddress.address           // mock FA12 Token address 
            );
            await chai.expect(failDepositMockFa12TokenOperation.send()).to.be.rejected;    
    
        });

        it('user (mallory) cannot deposit tez and mock FA12 tokens into her vault (depositors: whitelist set) at the same time', async () => {
    
            // init variables
            await signerFactory(mallory.sk);
            const vaultId            = malloryVaultSet[0];
            const vaultOwner         = mallory.pkh;
    
            const tokenType          = "fa12";
            const depositAmount      = 10000000;   // 10 Mock FA12 Tokens

            lendingControllerStorage = await lendingControllerInstance.storage();
    
            // create vault handle
            const vaultHandle = {
                "id"     : vaultId,
                "owner"  : vaultOwner
            };
    
            // get vault from Lending Controller        
            const vault = await lendingControllerStorage.vaults.get(vaultHandle);
    
            // get vault contract
            const vaultAddress   = vault.address;
            const vaultInstance  = await utils.tezos.contract.at(vaultAddress);
    
            // reset mock FA12 tokens allowance then set new allowance to deposit amount
            // reset token allowance
            const resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
                vaultAddress,
                0
            ).send();
            await resetTokenAllowance.confirmation();
    
            // set new token allowance
            const setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
                vaultAddress,
                depositAmount
            ).send();
            await setNewTokenAllowance.confirmation();
    
            // mallory fails to deposit tez and mock FA12 tokens into vault
            const failDepositTezAndMockFa12TokenOperation  = await vaultInstance.methods.vaultDeposit(
                depositAmount,                         // amt
                tokenType,                             // token
                mockFa12TokenAddress.address           // mock FA12 Token address 
            );
            await chai.expect(failDepositTezAndMockFa12TokenOperation.send({ mutez : true, amount : depositAmount })).to.be.rejected;    
    
        });


    }); // end test: deposit mock FA12 tokens into vault



    // 
    // Test: Deposit Mock FA2 Tokens into vault
    //
    describe('%vaultDeposit test: deposit mock FA2 tokens into vault', function () {
    
        it('user (eve) can deposit mock FA2 tokens into her vault (depositors: any)', async () => {
    
            // init variables
            await signerFactory(eve.sk);
            const vaultId            = eveVaultSet[0];
            const vaultOwner         = eve.pkh;
            const tokenId            = 0;
            const tokenName          = "mockFa2";
            const tokenType          = "fa2";
            const depositAmount      = 10000000;   // 10 Mock FA2 Tokens

            lendingControllerStorage = await lendingControllerInstance.storage();

            // create vault handle
            const vaultHandle = {
                "id"     : vaultId,
                "owner"  : vaultOwner
            };

            // get vault from Lending Controller        
            const vault = await lendingControllerStorage.vaults.get(vaultHandle);

            // get vault contract
            const vaultAddress             = vault.address;
            const vaultInstance            = await utils.tezos.contract.at(vaultAddress);

            // get mock fa2 token storage
            const mockFa2TokenStorage       = await mockFa2TokenInstance.storage();
            
            // get initial eve's Mock FA2 Token balance
            const eveMockFa2Ledger                 = await mockFa2TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMockFa2TokenBalance    = eveMockFa2Ledger == undefined ? 0 : parseInt(eveMockFa2Ledger);

            // get initial vault's Mock FA2 Token balance
            const vaultMockFa2Ledger                = await mockFa2TokenStorage.ledger.get(vaultAddress);            
            const vaultInitialMockFa2TokenBalance   = vaultMockFa2Ledger == undefined ? 0 : parseInt(vaultMockFa2Ledger);

            // get initial vault collateral token balance
            const vaultInitialTokenCollateralBalance = vault.collateralBalanceLedger.get(tokenName) == undefined ? 0 : parseInt(vault.collateralBalanceLedger.get(tokenName));

            // update operators for vault
            const updateOperatorsOperation = await mockFa2TokenInstance.methods.update_operators([
            {
                add_operator: {
                    owner: eve.pkh,
                    operator: vaultAddress,
                    token_id: 0,
                },
            }])
            .send()
            await updateOperatorsOperation.confirmation();

            // eve deposits mock FA2 tokens into vault
            const eveDepositTokenOperation  = await vaultInstance.methods.vaultDeposit(
                depositAmount,                         // amt
                tokenType,                             // token
                mockFa2TokenAddress.address,           // mock FA12 Token address 
                tokenId
            ).send();
            await eveDepositTokenOperation.confirmation();

            const updatedLendingControllerStorage       = await lendingControllerInstance.storage();
            const updatedVault                          = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const vaultMockFa2TokenCollateralBalance    = await updatedVault.collateralBalanceLedger.get(tokenName);

            // vault Mock FA2 Token Collateral Balance
            assert.equal(vaultMockFa2TokenCollateralBalance, vaultInitialTokenCollateralBalance + depositAmount);

            // check Eve's Mock FA2 Token balance
            const updatedMockFa2TokenStorage      = await mockFa2TokenInstance.storage();
            const updatedEveMockFa2Ledger         = await updatedMockFa2TokenStorage.ledger.get(eve.pkh);            
            assert.equal(updatedEveMockFa2Ledger, eveInitialMockFa2TokenBalance - depositAmount);

            // check vault's Mock FA2 Token Balance
            const vaultMockFa2Account             = await updatedMockFa2TokenStorage.ledger.get(vaultAddress);            
            assert.equal(vaultMockFa2Account, vaultInitialMockFa2TokenBalance + depositAmount);

        });


        it('user (mallory) can deposit mock FA2 tokens into user (eve)\'s vault (depositors: any)', async () => {
    
            // init variables
            await signerFactory(mallory.sk);
            const vaultId            = eveVaultSet[0];
            const vaultOwner         = eve.pkh;
            const tokenId            = 0;
            const tokenName          = "mockFa2";
            const tokenType          = "fa2";
            const depositAmount      = 10000000;   // 10 Mock FA2 Tokens

            lendingControllerStorage = await lendingControllerInstance.storage();

            // create vault handle
            const vaultHandle = {
                "id"     : vaultId,
                "owner"  : vaultOwner
            };

            // get vault from Lending Controller        
            const vault = await lendingControllerStorage.vaults.get(vaultHandle);

            // get vault contract
            const vaultAddress             = vault.address;
            const vaultInstance            = await utils.tezos.contract.at(vaultAddress);

            // get mock fa2 token storage
            const mockFa2TokenStorage       = await mockFa2TokenInstance.storage();
            
            // get initial mallory's Mock FA2 Token balance
            const malloryMockFa2Ledger                 = await mockFa2TokenStorage.ledger.get(mallory.pkh);            
            const malloryInitialMockFa2TokenBalance    = malloryMockFa2Ledger == undefined ? 0 : parseInt(malloryMockFa2Ledger);

            // get initial vault's Mock FA2 Token balance
            const vaultMockFa2Ledger                = await mockFa2TokenStorage.ledger.get(vaultAddress);            
            const vaultInitialMockFa2TokenBalance   = vaultMockFa2Ledger == undefined ? 0 : parseInt(vaultMockFa2Ledger);

            // get initial vault collateral token balance
            const vaultInitialTokenCollateralBalance = vault.collateralBalanceLedger.get(tokenName) == undefined ? 0 : parseInt(vault.collateralBalanceLedger.get(tokenName));

            // update operators for vault
            const updateOperatorsOperation = await mockFa2TokenInstance.methods.update_operators([
            {
                add_operator: {
                    owner: mallory.pkh,
                    operator: vaultAddress,
                    token_id: 0,
                },
            }])
            .send()
            await updateOperatorsOperation.confirmation();

            // mallory deposits mock FA2 tokens into vault
            const malloryDepositTokenOperation  = await vaultInstance.methods.vaultDeposit(
                depositAmount,                         // amt
                tokenType,                             // token
                mockFa2TokenAddress.address,           // mock FA12 Token address 
                tokenId
            ).send();
            await malloryDepositTokenOperation.confirmation();

            const updatedLendingControllerStorage     = await lendingControllerInstance.storage();
            const updatedVault                        = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const vaultMockFa2TokenCollateralBalance  = await updatedVault.collateralBalanceLedger.get(tokenName);

            // vault Mock FA2 Token Collateral Balance
            assert.equal(vaultMockFa2TokenCollateralBalance, vaultInitialTokenCollateralBalance + depositAmount);

            // check Mallory's Mock FA2 Token balance
            const updatedMockFa2TokenStorage      = await mockFa2TokenInstance.storage();
            const updatedMalloryMockFa2Ledger     = await updatedMockFa2TokenStorage.ledger.get(mallory.pkh);            
            assert.equal(updatedMalloryMockFa2Ledger, malloryInitialMockFa2TokenBalance - depositAmount);

            // check vault's Mock FA2 Token Balance
            const vaultMockFa2Account             = await updatedMockFa2TokenStorage.ledger.get(vaultAddress);            
            assert.equal(vaultMockFa2Account, vaultInitialMockFa2TokenBalance + depositAmount);

        });

        it('user (eve) cannot deposit tez and mock FA2 tokens into her vault (depositors: any) at the same time', async () => {
    
            // init variables
            await signerFactory(eve.sk);
            const vaultId            = eveVaultSet[0];
            const vaultOwner         = eve.pkh;
            const tokenId            = 0;
            const tokenName          = "mockFa2";
            const tokenType          = "fa2";
            const depositAmount      = 10000000;   // 10 Mock FA2 Tokens

            lendingControllerStorage = await lendingControllerInstance.storage();
    
            // create vault handle
            const vaultHandle = {
                "id"     : vaultId,
                "owner"  : vaultOwner
            };
    
            // get vault from Lending Controller        
            const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);
    
            // get vault contract
            const vaultAddress             = vault.address;
            const vaultInstance            = await utils.tezos.contract.at(vaultAddress);
    
            // update operators for vault
            const updateOperatorsOperation = await mockFa2TokenInstance.methods.update_operators([
                {
                    add_operator: {
                        owner: eve.pkh,
                        operator: vaultAddress,
                        token_id: 0,
                    },
                }])
                .send()
            await updateOperatorsOperation.confirmation();
    
            // eve fails to deposit tez and mock FA2 tokens into vault at the same time
            const failDepositTezAndMockFa2TokenOperation  = await vaultInstance.methods.vaultDeposit(
                depositAmount,                         // amt
                tokenType,                             // token
                mockFa2TokenAddress.address,           // mock FA2 Token address 
                tokenId
            );
            await chai.expect(failDepositTezAndMockFa2TokenOperation.send({ mutez : true, amount : depositAmount })).to.be.rejected;    
    
        });


        it('user (mallory) can deposit mock FA2 tokens into her vault (depositors: whitelist set)', async () => {
    
            // init variables
            await signerFactory(mallory.sk);
            const vaultId            = malloryVaultSet[0];
            const vaultOwner         = mallory.pkh;
            const tokenId            = 0;
            const tokenName          = "mockFa2";
            const tokenType          = "fa2";
            const depositAmount      = 10000000;   // 10 Mock FA2 Tokens

            lendingControllerStorage = await lendingControllerInstance.storage();

            // create vault handle
            const vaultHandle = {
                "id"     : vaultId,
                "owner"  : vaultOwner
            };

            // get vault from Lending Controller        
            const vault = await lendingControllerStorage.vaults.get(vaultHandle);

            // get vault contract
            const vaultAddress             = vault.address;
            const vaultInstance            = await utils.tezos.contract.at(vaultAddress);

            // get mock fa2 token storage
            const mockFa2TokenStorage       = await mockFa2TokenInstance.storage();
            
            // get initial mallory's Mock FA2 Token balance
            const malloryMockFa2Ledger                 = await mockFa2TokenStorage.ledger.get(mallory.pkh);            
            const malloryInitialMockFa2TokenBalance    = malloryMockFa2Ledger == undefined ? 0 : parseInt(malloryMockFa2Ledger);

            // get initial vault's Mock FA2 Token balance
            const vaultMockFa2Ledger                = await mockFa2TokenStorage.ledger.get(vaultAddress);            
            const vaultInitialMockFa2TokenBalance   = vaultMockFa2Ledger == undefined ? 0 : parseInt(vaultMockFa2Ledger);

            // get initial vault collateral token balance
            const vaultInitialTokenCollateralBalance = vault.collateralBalanceLedger.get(tokenName) == undefined ? 0 : parseInt(vault.collateralBalanceLedger.get(tokenName));

            // update operators for vault
            const updateOperatorsOperation = await mockFa2TokenInstance.methods.update_operators([
            {
                add_operator: {
                    owner: mallory.pkh,
                    operator: vaultAddress,
                    token_id: 0,
                },
            }])
            .send()
            await updateOperatorsOperation.confirmation();

            // mallory deposits mock FA2 tokens into vault
            const malloryDepositTokenOperation  = await vaultInstance.methods.vaultDeposit(
                depositAmount,                         // amt
                tokenType,                             // token
                mockFa2TokenAddress.address,           // mock FA12 Token address 
                tokenId
            ).send();
            await malloryDepositTokenOperation.confirmation();

            const updatedLendingControllerStorage     = await lendingControllerInstance.storage();
            const updatedVault                        = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const vaultMockFa2TokenCollateralBalance  = await updatedVault.collateralBalanceLedger.get(tokenName);
            
            // vault Mock FA2 Token Collateral Balance
            assert.equal(vaultMockFa2TokenCollateralBalance, vaultInitialTokenCollateralBalance + depositAmount);

            // check Mallory's Mock FA2 Token balance
            const updatedMockFa2TokenStorage      = await mockFa2TokenInstance.storage();
            const updatedMalloryMockFa2Ledger     = await updatedMockFa2TokenStorage.ledger.get(mallory.pkh);            
            assert.equal(updatedMalloryMockFa2Ledger, malloryInitialMockFa2TokenBalance - depositAmount);

            // check vault's Mock FA2 Token Balance
            const vaultMockFa2Account             = await updatedMockFa2TokenStorage.ledger.get(vaultAddress);            
            assert.equal(vaultMockFa2Account, vaultInitialMockFa2TokenBalance + depositAmount);

        });


        it('user (eve) cannot deposit mock FA2 tokens into user (mallory)\'s vault (depositors: whitelist set)', async () => {
    
            // init variables
            await signerFactory(eve.sk);
            const vaultId            = malloryVaultSet[0];
            const vaultOwner         = mallory.pkh;
            const tokenId            = 0;
            const tokenName          = "mockFa2";
            const tokenType          = "fa2";
            const depositAmount      = 10000000;   // 10 Mock FA2 Tokens

            lendingControllerStorage = await lendingControllerInstance.storage();
    
            // create vault handle
            const vaultHandle = {
                "id"     : vaultId,
                "owner"  : vaultOwner
            };
    
            // get vault from Lending Controller        
            const vault                    = await lendingControllerStorage.vaults.get(vaultHandle);
    
            // get vault contract
            const vaultAddress             = vault.address;
            const vaultInstance            = await utils.tezos.contract.at(vaultAddress);
    
            // update operators for vault
            const updateOperatorsOperation = await mockFa2TokenInstance.methods.update_operators([
                {
                    add_operator: {
                        owner: eve.pkh,
                        operator: vaultAddress,
                        token_id: 0,
                    },
                }])
                .send()
            await updateOperatorsOperation.confirmation();
    
            // eve fails to deposit tez and mock FA2 tokens into vault at the same time
            const failDepositMockFa2TokenOperation  = await vaultInstance.methods.vaultDeposit(
                depositAmount,                         // amt
                tokenType,                             // token
                mockFa2TokenAddress.address,           // mock FA2 Token address 
                tokenId
            );
            await chai.expect(failDepositMockFa2TokenOperation.send()).to.be.rejected;    
    
        });


        it('user (mallory) cannot deposit tez and mock FA2 tokens into her vault (depositors: whitelist set) at the same time', async () => {
    
            // init variables
            await signerFactory(mallory.sk);
            const vaultId            = malloryVaultSet[0];
            const vaultOwner         = mallory.pkh;
            const tokenId            = 0;

            const tokenName          = "mockFa2";
            const tokenType          = "fa2";
            const depositAmount      = 10000000;   // 10 Mock FA2 Tokens

            lendingControllerStorage = await lendingControllerInstance.storage();

            // create vault handle
            const vaultHandle = {
                "id"     : vaultId,
                "owner"  : vaultOwner
            };
    
            // get vault from Lending Controller        
            const vault                    = await lendingControllerStorage.vaults.get(vaultHandle);
    
            // get vault contract
            const vaultAddress             = vault.address;
            const vaultInstance            = await utils.tezos.contract.at(vaultAddress);
    
            // update operators for vault
            const updateOperatorsOperation = await mockFa2TokenInstance.methods.update_operators([
                {
                    add_operator: {
                        owner: mallory.pkh,
                        operator: vaultAddress,
                        token_id: 0,
                    },
                }])
                .send()
            await updateOperatorsOperation.confirmation();
    
            // eve fails to deposit tez and mock FA2 tokens into vault at the same time
            const failDepositTezAndMockFa2TokenOperation  = await vaultInstance.methods.vaultDeposit(
                depositAmount,                         // amt
                tokenType,                             // token
                mockFa2TokenAddress.address,           // mock FA2 Token address 
                tokenId
            );
            await chai.expect(failDepositTezAndMockFa2TokenOperation.send({ mutez : true, amount : depositAmount })).to.be.rejected;    
    
        });

    }); // end test: deposit mock FA2 tokens into vault



    // 
    // Test: Add Liquidity into Lending Pool
    //
    describe('%addLiquidity', function () {
    
        it('user (eve) can add liquidity for mock FA12 token into Lending Controller token pool (10 MockFA12 Tokens)', async () => {
    
            // init variables
            await signerFactory(eve.sk);
            const loanTokenName = "mockFa12";
            const depositAmount = 10000000; // 10 Mock FA12 Tokens

            lendingControllerStorage = await lendingControllerInstance.storage();
            
            // get mock fa12 token storage and lp token pool mock fa12 token storage
            const mockFa12TokenStorage              = await mockFa12TokenInstance.storage();
            const lpTokenPoolMockFa12TokenStorage   = await lpTokenPoolMockFa12TokenInstance.storage();
            
            // get initial eve's Mock FA12 Token balance
            const eveMockFa12Ledger                 = await mockFa12TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMockFa12TokenBalance    = eveMockFa12Ledger == undefined ? 0 : parseInt(eveMockFa12Ledger.balance);

            // get initial eve's Token Pool FA2 LP - Mock FA12 Token - balance
            const eveLpTokenPoolMockFa12Ledger                 = await lpTokenPoolMockFa12TokenStorage.ledger.get(eve.pkh);            
            const eveInitialLpTokenPoolMockFa12TokenBalance    = eveLpTokenPoolMockFa12Ledger == undefined ? 0 : parseInt(eveLpTokenPoolMockFa12Ledger);

            // get initial lending controller's Mock FA12 Token balance
            const lendingControllerMockFa12Ledger                = await mockFa12TokenStorage.ledger.get(lendingControllerAddress.address);            
            const lendingControllerInitialMockFa12TokenBalance   = lendingControllerMockFa12Ledger == undefined ? 0 : parseInt(lendingControllerMockFa12Ledger.balance);

            // get initial lending controller token pool total
            const initialLoanTokenRecord                 = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
            const lendingControllerInitialTokenPoolTotal = parseInt(initialLoanTokenRecord.tokenPoolTotal);

            // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
            // reset token allowance
            const resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
                lendingControllerAddress.address,
                0
            ).send();
            await resetTokenAllowance.confirmation();

            // set new token allowance
            const setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
                lendingControllerAddress.address,
                depositAmount
            ).send();
            await setNewTokenAllowance.confirmation();

            // eve deposits mock FA12 tokens into lending controller token pool
            const eveDepositTokenOperation  = await lendingControllerInstance.methods.addLiquidity(
                loanTokenName,
                depositAmount, 
            ).send();
            await eveDepositTokenOperation.confirmation();

            // get updated storages
            const updatedLendingControllerStorage         = await lendingControllerInstance.storage();
            const updatedMockFa12TokenStorage             = await mockFa12TokenInstance.storage();
            const updatedLpTokenPoolMockFa12TokenStorage  = await lpTokenPoolMockFa12TokenInstance.storage();

            // check new balance for loan token pool total
            const updatedLoanTokenRecord           = await updatedLendingControllerStorage.loanTokenLedger.get(loanTokenName);
            assert.equal(updatedLoanTokenRecord.tokenPoolTotal, lendingControllerInitialTokenPoolTotal + depositAmount);

            // check Eve's Mock FA12 Token balance
            const updatedEveMockFa12Ledger         = await updatedMockFa12TokenStorage.ledger.get(eve.pkh);            
            assert.equal(updatedEveMockFa12Ledger.balance, eveInitialMockFa12TokenBalance - depositAmount);

            // check Lending Controller's Mock FA12 Token Balance
            const lendingControllerMockFa12Account  = await updatedMockFa12TokenStorage.ledger.get(lendingControllerAddress.address);            
            assert.equal(lendingControllerMockFa12Account.balance, lendingControllerInitialMockFa12TokenBalance + depositAmount);

            // check Eve's LP Token Pool Mock FA12 Token balance
            const updatedEveLpTokenPoolMockFa12Ledger        = await updatedLpTokenPoolMockFa12TokenStorage.ledger.get(eve.pkh);            
            assert.equal(updatedEveLpTokenPoolMockFa12Ledger, eveInitialLpTokenPoolMockFa12TokenBalance + depositAmount);        

        });

        it('user (eve) can add liquidity for mock FA2 token into Lending Controller token pool (10 MockFA2 Tokens)', async () => {
    
            // init variables
            await signerFactory(eve.sk);
            const loanTokenName = "mockFa2";
            const depositAmount = 10000000; // 10 Mock FA2 Tokens

            lendingControllerStorage = await lendingControllerInstance.storage();
            
            // get mock fa2 token storage and lp token pool mock fa2 token storage
            const mockFa2TokenStorage              = await mockFa2TokenInstance.storage();
            const lpTokenPoolMockFa2TokenStorage   = await lpTokenPoolMockFa2TokenInstance.storage();
            
            // get initial eve's Mock FA2 Token balance
            const eveMockFa2Ledger                 = await mockFa2TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMockFa2TokenBalance    = eveMockFa2Ledger == undefined ? 0 : parseInt(eveMockFa2Ledger);

            // get initial eve's Token Pool FA2 LP - Mock FA2 Token - balance
            const eveLpTokenPoolMockFa2Ledger                 = await lpTokenPoolMockFa2TokenStorage.ledger.get(eve.pkh);            
            const eveInitialLpTokenPoolMockFa2TokenBalance    = eveLpTokenPoolMockFa2Ledger == undefined ? 0 : parseInt(eveLpTokenPoolMockFa2Ledger);

            // get initial lending controller's Mock FA2 Token balance
            const lendingControllerMockFa2Ledger                = await mockFa2TokenStorage.ledger.get(lendingControllerAddress.address);            
            const lendingControllerInitialMockFa2TokenBalance   = lendingControllerMockFa2Ledger == undefined ? 0 : parseInt(lendingControllerMockFa2Ledger);

            // get initial lending controller token pool total
            const initialLoanTokenRecord                 = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
            const lendingControllerInitialTokenPoolTotal = parseInt(initialLoanTokenRecord.tokenPoolTotal);

            // update operators for vault
            const updateOperatorsOperation = await mockFa2TokenInstance.methods.update_operators([
                {
                    add_operator: {
                        owner: eve.pkh,
                        operator: lendingControllerAddress.address,
                        token_id: 0,
                    },
                }])
                .send()
            await updateOperatorsOperation.confirmation();

            // eve deposits mock FA12 tokens into lending controller token pool
            const eveDepositTokenOperation  = await lendingControllerInstance.methods.addLiquidity(
                loanTokenName,
                depositAmount, 
            ).send();
            await eveDepositTokenOperation.confirmation();

            // get updated storages
            const updatedLendingControllerStorage  = await lendingControllerInstance.storage();
            const updatedMockFa2TokenStorage       = await mockFa2TokenInstance.storage();
            
            const updatedLpTokenPoolMockFa2TokenStorage     = await lpTokenPoolMockFa2TokenInstance.storage();

            // check new balance for loan token pool total
            const updatedLoanTokenRecord           = await updatedLendingControllerStorage.loanTokenLedger.get(loanTokenName);
            assert.equal(updatedLoanTokenRecord.tokenPoolTotal, lendingControllerInitialTokenPoolTotal + depositAmount);

            // check Eve's Mock FA12 Token balance
            const updatedEveMockFa2Ledger          = await updatedMockFa2TokenStorage.ledger.get(eve.pkh);            
            assert.equal(updatedEveMockFa2Ledger, eveInitialMockFa2TokenBalance - depositAmount);

            // check Lending Controller's Mock FA2 Token Balance
            const lendingControllerMockFa2Account             = await updatedMockFa2TokenStorage.ledger.get(lendingControllerAddress.address);            
            assert.equal(lendingControllerMockFa2Account, lendingControllerInitialMockFa2TokenBalance + depositAmount);

            // check Eve's LP Token Pool Mock FA2 Token balance
            const updatedEveLpTokenPoolMockFa2Ledger        = await updatedLpTokenPoolMockFa2TokenStorage.ledger.get(eve.pkh);            
            assert.equal(updatedEveLpTokenPoolMockFa2Ledger, eveInitialLpTokenPoolMockFa2TokenBalance + depositAmount);        

        });


        it('user (eve) can add liquidity for tez into Lending Controller token pool (10 XTZ)', async () => {
    
            // init variables
            await signerFactory(eve.sk);
            const loanTokenName = "tez";
            const depositAmount = 10000000; // 10 XTZ

            lendingControllerStorage = await lendingControllerInstance.storage();
            
            // get LP token pool XTZ token storage (FA2 Token Standard)
            const lpTokenPoolXtzStorage   = await lpTokenPoolXtzInstance.storage();

            // get initial eve XTZ balance
            const eveInitialXtzLedger   = await utils.tezos.tz.getBalance(eve.pkh);
            const eveInitialXtzBalance  = eveInitialXtzLedger.toNumber();

            // get initial eve's Token Pool FA2 LP - Tez - balance
            const eveLpTokenPoolXtzLedger            = await lpTokenPoolXtzStorage.ledger.get(eve.pkh);            
            const eveInitialLpTokenPoolXtzBalance    = eveLpTokenPoolXtzLedger == undefined ? 0 : parseInt(eveLpTokenPoolXtzLedger);

            // get initial lending controller's XTZ balance
            const lendingControllerInitialXtzLedger   = await utils.tezos.tz.getBalance(lendingControllerAddress.address);
            const lendingControllerInitialXtzBalance  = lendingControllerInitialXtzLedger.toNumber();

            // get initial lending controller token pool total
            const initialLoanTokenRecord                 = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
            const lendingControllerInitialTokenPoolTotal = parseInt(initialLoanTokenRecord.tokenPoolTotal);

            // eve deposits mock XTZ into lending controller token pool
            const eveDepositTokenOperation  = await lendingControllerInstance.methods.addLiquidity(
                loanTokenName,
                depositAmount, 
            ).send({ mutez : true, amount: depositAmount });
            await eveDepositTokenOperation.confirmation();

            // get updated storages
            const updatedLendingControllerStorage  = await lendingControllerInstance.storage();
            const updatedLpTokenPoolXtzStorage     = await lpTokenPoolXtzInstance.storage();

            // check new balance for loan token pool total
            const updatedLoanTokenRecord           = await updatedLendingControllerStorage.loanTokenLedger.get(loanTokenName);
            assert.equal(updatedLoanTokenRecord.tokenPoolTotal, lendingControllerInitialTokenPoolTotal + depositAmount);

            // check Lending Controller's XTZ Balance
            const lendingControllerXtzBalance             = await utils.tezos.tz.getBalance(lendingControllerAddress.address);
            assert.equal(lendingControllerXtzBalance, lendingControllerInitialXtzBalance + depositAmount);

            // check Eve's LP Token Pool XTZ balance
            const updatedEveLpTokenPoolXtzLedger        = await updatedLpTokenPoolXtzStorage.ledger.get(eve.pkh);            
            assert.equal(updatedEveLpTokenPoolXtzLedger, eveInitialLpTokenPoolXtzBalance + depositAmount);        

            // check Eve's XTZ Balance and account for gas cost in transaction with almostEqual
            const eveXtzBalance = await utils.tezos.tz.getBalance(eve.pkh);
            assert.equal(almostEqual(eveXtzBalance, eveInitialXtzBalance - depositAmount, 0.0001), true)

        });
    
    }); // end test: add liquidity 



    // 
    // Test: Remove Liquidity from Lending Pool
    //
    describe('%removeLiquidity', function () {
    
        it('user (eve) can remove liquidity for mock FA12 token from Lending Controller token pool (5 MockFA12 Tokens)', async () => {
    
            // init variables
            await signerFactory(eve.sk);
            const loanTokenName = "mockFa12";
            const withdrawAmount = 5000000; // 5 Mock FA12 Tokens

            lendingControllerStorage = await lendingControllerInstance.storage();
            
            // get mock fa12 token storage and lp token pool mock fa12 token storage
            const mockFa12TokenStorage              = await mockFa12TokenInstance.storage();
            const lpTokenPoolMockFa12TokenStorage   = await lpTokenPoolMockFa12TokenInstance.storage();
            
            // get initial eve's Mock FA12 Token balance
            const eveMockFa12Ledger                 = await mockFa12TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMockFa12TokenBalance    = eveMockFa12Ledger == undefined ? 0 : parseInt(eveMockFa12Ledger.balance);

            // get initial eve's Token Pool FA2 LP - Mock FA12 Token - balance
            const eveLpTokenPoolMockFa12Ledger                 = await lpTokenPoolMockFa12TokenStorage.ledger.get(eve.pkh);            
            const eveInitialLpTokenPoolMockFa12TokenBalance    = eveLpTokenPoolMockFa12Ledger == undefined ? 0 : parseInt(eveLpTokenPoolMockFa12Ledger);

            // get initial lending controller's Mock FA12 Token balance
            const lendingControllerMockFa12Ledger                = await mockFa12TokenStorage.ledger.get(lendingControllerAddress.address);            
            const lendingControllerInitialMockFa12TokenBalance   = lendingControllerMockFa12Ledger == undefined ? 0 : parseInt(lendingControllerMockFa12Ledger.balance);

            // get initial lending controller token pool total
            const initialLoanTokenRecord                 = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
            const lendingControllerInitialTokenPoolTotal = parseInt(initialLoanTokenRecord.tokenPoolTotal);

            // eve withdraws mock FA12 tokens liquidity from lending controller token pool
            const eveWithdrawTokenOperation  = await lendingControllerInstance.methods.removeLiquidity(
                loanTokenName,
                withdrawAmount, 
            ).send();
            await eveWithdrawTokenOperation.confirmation();

            // get updated storages
            const updatedLendingControllerStorage         = await lendingControllerInstance.storage();
            const updatedMockFa12TokenStorage             = await mockFa12TokenInstance.storage();
            const updatedLpTokenPoolMockFa12TokenStorage  = await lpTokenPoolMockFa12TokenInstance.storage();

            // Summary - Liquidity Removed for Mock FA12 Token
            // 1) Loan Token Pool Record Balance - decrease
            // 2) Lending Controller Token Balance - decrease
            // 3) User LP Token Balance - decrease
            // 4) User Token Balance - increase

            // 1) check new balance for loan token pool total
            const updatedLoanTokenRecord           = await updatedLendingControllerStorage.loanTokenLedger.get(loanTokenName);
            assert.equal(updatedLoanTokenRecord.tokenPoolTotal, lendingControllerInitialTokenPoolTotal - withdrawAmount);

            // 2) check Lending Controller's Mock FA12 Token Balance
            const lendingControllerMockFa12Account  = await updatedMockFa12TokenStorage.ledger.get(lendingControllerAddress.address);            
            assert.equal(lendingControllerMockFa12Account.balance, lendingControllerInitialMockFa12TokenBalance - withdrawAmount);

            // 3) check Eve's LP Token Pool Mock FA12 Token balance
            const updatedEveLpTokenPoolMockFa12Ledger        = await updatedLpTokenPoolMockFa12TokenStorage.ledger.get(eve.pkh);            
            assert.equal(updatedEveLpTokenPoolMockFa12Ledger, eveInitialLpTokenPoolMockFa12TokenBalance - withdrawAmount);        

            // 4) check Eve's Mock FA12 Token balance
            const updatedEveMockFa12Ledger         = await updatedMockFa12TokenStorage.ledger.get(eve.pkh);            
            assert.equal(updatedEveMockFa12Ledger.balance, eveInitialMockFa12TokenBalance + withdrawAmount);


        });


        it('user (eve) can remove liquidity for mock FA2 token from Lending Controller token pool (5 MockFA2 Tokens)', async () => {
    
            // init variables
            await signerFactory(eve.sk);
            const loanTokenName = "mockFa2";
            const withdrawAmount = 5000000; // 5 Mock FA2 Tokens

            lendingControllerStorage = await lendingControllerInstance.storage();
            
            // get mock fa12 token storage and lp token pool mock fa2 token storage
            const mockFa2TokenStorage              = await mockFa2TokenInstance.storage();
            const lpTokenPoolMockFa2TokenStorage   = await lpTokenPoolMockFa2TokenInstance.storage();
            
            // get initial eve's Mock FA2 Token balance
            const eveMockFa2Ledger                 = await mockFa2TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMockFa2TokenBalance    = eveMockFa2Ledger == undefined ? 0 : parseInt(eveMockFa2Ledger);

            // get initial eve's Token Pool FA2 LP - Mock FA2 Token - balance
            const eveLpTokenPoolMockFa2Ledger                 = await lpTokenPoolMockFa2TokenStorage.ledger.get(eve.pkh);            
            const eveInitialLpTokenPoolMockFa2TokenBalance    = eveLpTokenPoolMockFa2Ledger == undefined ? 0 : parseInt(eveLpTokenPoolMockFa2Ledger);

            // get initial lending controller's Mock FA2 Token balance
            const lendingControllerMockFa2Ledger                = await mockFa2TokenStorage.ledger.get(lendingControllerAddress.address);            
            const lendingControllerInitialMockFa2TokenBalance   = lendingControllerMockFa2Ledger == undefined ? 0 : parseInt(lendingControllerMockFa2Ledger);

            // get initial lending controller token pool total
            const initialLoanTokenRecord                 = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
            const lendingControllerInitialTokenPoolTotal = parseInt(initialLoanTokenRecord.tokenPoolTotal);

            // eve withdraws mock FA2 tokens liquidity from lending controller token pool
            const eveWithdrawTokenOperation  = await lendingControllerInstance.methods.removeLiquidity(
                loanTokenName,
                withdrawAmount, 
            ).send();
            await eveWithdrawTokenOperation.confirmation();

            // get updated storages
            const updatedLendingControllerStorage         = await lendingControllerInstance.storage();
            const updatedMockFa2TokenStorage              = await mockFa2TokenInstance.storage();
            const updatedLpTokenPoolMockFa2TokenStorage   = await lpTokenPoolMockFa2TokenInstance.storage();

            // Summary - Liquidity Removed for Mock FA2 Token
            // 1) Loan Token Pool Record Balance - decrease
            // 2) Lending Controller Token Balance - decrease
            // 3) User LP Token Balance - decrease
            // 4) User Token Balance - increase

            // 1) check new balance for loan token pool total
            const updatedLoanTokenRecord           = await updatedLendingControllerStorage.loanTokenLedger.get(loanTokenName);
            assert.equal(updatedLoanTokenRecord.tokenPoolTotal, lendingControllerInitialTokenPoolTotal - withdrawAmount);

            // 2) check Lending Controller's Mock FA2 Token Balance
            const lendingControllerMockFa2Account  = await updatedMockFa2TokenStorage.ledger.get(lendingControllerAddress.address);            
            assert.equal(lendingControllerMockFa2Account, lendingControllerInitialMockFa2TokenBalance - withdrawAmount);

            // 3) check Eve's LP Token Pool Mock FA2 Token balance
            const updatedEveLpTokenPoolMockFa2Ledger        = await updatedLpTokenPoolMockFa2TokenStorage.ledger.get(eve.pkh);            
            assert.equal(updatedEveLpTokenPoolMockFa2Ledger, eveInitialLpTokenPoolMockFa2TokenBalance - withdrawAmount);        

            // 4) check Eve's Mock FA2 Token balance
            const updatedEveMockFa2Ledger         = await updatedMockFa2TokenStorage.ledger.get(eve.pkh);            
            assert.equal(updatedEveMockFa2Ledger, eveInitialMockFa2TokenBalance + withdrawAmount);


        });



        it('user (eve) can remove liquidity for tez from Lending Controller token pool (5 XTZ)', async () => {
    
            // init variables
            await signerFactory(eve.sk);
            const loanTokenName = "tez";
            const withdrawAmount = 5000000; // 5 XTZ

            lendingControllerStorage = await lendingControllerInstance.storage();
            
            // get LP Token Pool XTZ token storage (FA2 Token Standard)
            const lpTokenPoolXtzStorage   = await lpTokenPoolXtzInstance.storage();

            // get initial eve XTZ balance
            const eveInitialXtzLedger   = await utils.tezos.tz.getBalance(eve.pkh);
            const eveInitialXtzBalance  = eveInitialXtzLedger.toNumber();

            // get initial eve's Token Pool FA2 LP - Tez - balance
            const eveLpTokenPoolXtzLedger            = await lpTokenPoolXtzStorage.ledger.get(eve.pkh);            
            const eveInitialLpTokenPoolXtzBalance    = eveLpTokenPoolXtzLedger == undefined ? 0 : parseInt(eveLpTokenPoolXtzLedger);

            // get initial lending controller's Xtz balance
            const lendingControllerInitialXtzLedger   = await utils.tezos.tz.getBalance(lendingControllerAddress.address);
            const lendingControllerInitialXtzBalance  = lendingControllerInitialXtzLedger.toNumber();

            // get initial lending controller token pool total
            const initialLoanTokenRecord                 = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
            const lendingControllerInitialTokenPoolTotal = parseInt(initialLoanTokenRecord.tokenPoolTotal);

            // eve withdraws tez from lending controller token pool
            const eveWithdrawTezOperation  = await lendingControllerInstance.methods.removeLiquidity(
                loanTokenName,
                withdrawAmount, 
            ).send();
            await eveWithdrawTezOperation.confirmation();

            // get updated storages
            const updatedLendingControllerStorage  = await lendingControllerInstance.storage();
            const updatedLpTokenPoolXtzStorage     = await lpTokenPoolXtzInstance.storage();

            // Summary - Liquidity Removed for XTZ
            // 1) Loan Token Pool Record Balance - decrease
            // 2) Lending Controller Token Balance - decrease
            // 3) User LP Token Balance - decrease
            // 4) User Token Balance - increase

            // 1) check new balance for loan token pool total
            const updatedLoanTokenRecord = await updatedLendingControllerStorage.loanTokenLedger.get(loanTokenName);
            assert.equal(updatedLoanTokenRecord.tokenPoolTotal, lendingControllerInitialTokenPoolTotal - withdrawAmount);

            // 2) check Lending Controller's XTZ Balance
            const lendingControllerXtzBalance = await utils.tezos.tz.getBalance(lendingControllerAddress.address);
            assert.equal(lendingControllerXtzBalance, lendingControllerInitialXtzBalance - withdrawAmount);

            // 3) check Eve's LP Token Pool XTZ balance
            const updatedEveLpTokenPoolXtzLedger = await updatedLpTokenPoolXtzStorage.ledger.get(eve.pkh);            
            assert.equal(updatedEveLpTokenPoolXtzLedger, eveInitialLpTokenPoolXtzBalance - withdrawAmount);        

            // 4) check Eve's XTZ Balance and account for gas cost in transaction with almostEqual
            const eveXtzBalance = await utils.tezos.tz.getBalance(eve.pkh);
            assert.equal(almostEqual(eveXtzBalance, eveInitialXtzBalance + withdrawAmount, 0.0001), true)

        });

        it('user (eve) cannot remove more liquidity than he has (mock FA12 token)', async () => {
    
            // init variables
            await signerFactory(eve.sk);
            const loanTokenName = "mockFa12";
            const incrementAmount = 10000000; // Increment user balance by 10 Mock FA12 Tokens

            const lpTokenPoolMockFa12TokenStorage   = await lpTokenPoolMockFa12TokenInstance.storage();

            // get initial eve's Token Pool FA2 LP - Mock FA12 Token - balance
            const eveLpTokenPoolMockFa12Ledger                 = await lpTokenPoolMockFa12TokenStorage.ledger.get(eve.pkh);            
            const eveInitialLpTokenPoolMockFa12TokenBalance    = eveLpTokenPoolMockFa12Ledger == undefined ? 0 : parseInt(eveLpTokenPoolMockFa12Ledger);

            const withdrawMoreThanBalanceAmount = eveInitialLpTokenPoolMockFa12TokenBalance + incrementAmount;

            // fail: eve has insufficient mock FA12 tokens in token pool
            const failEveWithdrawTokenOperation  = await lendingControllerInstance.methods.removeLiquidity(
                loanTokenName,
                withdrawMoreThanBalanceAmount
            );
            await chai.expect(failEveWithdrawTokenOperation.send()).to.be.rejected;    
            
        });


        it('user (eve) cannot remove more liquidity than he has (mock FA2 token)', async () => {
    
            // init variables
            await signerFactory(eve.sk);
            const loanTokenName = "mockFa2";
            const incrementAmount = 10000000; // Increment user balance by 10 Mock FA2 Tokens

            const lpTokenPoolMockFa2TokenStorage   = await lpTokenPoolMockFa2TokenInstance.storage();

            // get initial eve's Token Pool FA2 LP - Mock FA2 Token - balance
            const eveLpTokenPoolMockFa2Ledger                 = await lpTokenPoolMockFa2TokenStorage.ledger.get(eve.pkh);            
            const eveInitialLpTokenPoolMockFa2TokenBalance    = eveLpTokenPoolMockFa2Ledger == undefined ? 0 : parseInt(eveLpTokenPoolMockFa2Ledger);

            const withdrawMoreThanBalanceAmount = eveInitialLpTokenPoolMockFa2TokenBalance + incrementAmount;

            // fail: eve has insufficient mock FA2 tokens in token pool
            const failEveWithdrawTokenOperation  = await lendingControllerInstance.methods.removeLiquidity(
                loanTokenName,
                withdrawMoreThanBalanceAmount, 
            );
            await chai.expect(failEveWithdrawTokenOperation.send()).to.be.rejected;    
            
        });


        it('user (eve) cannot remove more liquidity than he has (tez)', async () => {
    
            // init variables
            await signerFactory(eve.sk);
            const loanTokenName = "tez";
            const incrementAmount = 10000000; // Increment user balance by 10 XTZ

            // get initial eve XTZ balance
            const eveInitialXtzLedger   = await utils.tezos.tz.getBalance(eve.pkh);
            const eveInitialXtzBalance  = eveInitialXtzLedger.toNumber();

            const withdrawMoreThanBalanceAmount = eveInitialXtzBalance + incrementAmount;

            // fail: eve has insufficient tez in token pool
            const failEveWithdrawTezOperation  = await lendingControllerInstance.methods.removeLiquidity(
                loanTokenName,
                withdrawMoreThanBalanceAmount, 
            );
            await chai.expect(failEveWithdrawTezOperation.send()).to.be.rejected;    
            
        });

    });



    // 
    // Test: borrow 
    //
    describe('%borrow', function () {

        it('user (eve) can borrow 1 Mock FA12 Tokens', async () => {

            await signerFactory(eve.sk);
            const vaultId            = eveVaultSet[0];
            const vaultOwner         = eve.pkh;
            const borrowAmount       = 1000000; // 1 Mock FA12 Tokens

            const decimals               = lendingControllerStorage.config.decimals;       // e.g. 3
            const minimumLoanFeePercent  = lendingControllerStorage.config.minimumLoanFeePercent; // e.g. 1%
            const minimumLoanFee         = (borrowAmount * minimumLoanFeePercent) / (10 ** decimals);
            const finalLoanAmount        = borrowAmount - minimumLoanFee;

            // setup vault handle and vault record
            const vaultHandle = {
                "id"    : vaultId,
                "owner" : vaultOwner
            };
            const vaultRecord = await lendingControllerStorage.vaults.get(vaultHandle);

            // get initial loan variables
            const initialLoanOutstandingTotal   = parseInt(vaultRecord.loanOutstandingTotal);
            const initialLoanPrincipalTotal     = parseInt(vaultRecord.loanPrincipalTotal);
            const initialLoanInterestTotal      = parseInt(vaultRecord.loanInterestTotal);

            // get initial eve's Mock FA12 Token balance
            const eveMockFa12Ledger                 = await mockFa12TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMockFa12TokenBalance    = eveMockFa12Ledger == undefined ? 0 : parseInt(eveMockFa12Ledger.balance);

            // borrow operation
            const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
            await eveBorrowOperation.confirmation();

            // get updated storage
            const updatedLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedvaultRecord              = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const updatedMockFa12TokenStorage     = await mockFa12TokenInstance.storage();
            const updatedEveMockFa12Ledger        = await updatedMockFa12TokenStorage.ledger.get(eve.pkh);            
            const updatedEveMockFa12Balance       = parseInt(updatedEveMockFa12Ledger.balance);

            const updatedLoanOutstandingTotal     = updatedvaultRecord.loanOutstandingTotal;
            const updatedLoanPrincipalTotal       = updatedvaultRecord.loanPrincipalTotal;
            const updatedLoanInterestTotal        = updatedvaultRecord.loanInterestTotal;

            // check vault loan records
            assert.equal(updatedLoanOutstandingTotal, initialLoanOutstandingTotal + borrowAmount);
            assert.equal(updatedLoanPrincipalTotal, initialLoanPrincipalTotal + borrowAmount);
            assert.equal(updatedLoanInterestTotal, 0);

            // check eve Mock FA12 Token balance
            assert.equal(updatedEveMockFa12Ledger.balance, eveInitialMockFa12TokenBalance + finalLoanAmount);

        });


        it('user (eve) can borrow 1 Mock FA2 Tokens', async () => {

            await signerFactory(eve.sk);
            const vaultId            = eveVaultSet[1];
            const vaultOwner         = eve.pkh;
            const borrowAmount       = 1000000; // 1 Mock FA2 Tokens

            const decimals               = lendingControllerStorage.config.decimals;       // e.g. 3
            const minimumLoanFeePercent  = lendingControllerStorage.config.minimumLoanFeePercent; // e.g. 1%
            const minimumLoanFee         = (borrowAmount * minimumLoanFeePercent) / (10 ** decimals);
            const finalLoanAmount        = borrowAmount - minimumLoanFee;

            // setup vault handle and vault record
            const vaultHandle = {
                "id"    : vaultId,
                "owner" : vaultOwner
            };
            const vaultRecord = await lendingControllerStorage.vaults.get(vaultHandle);

            // get initial variables
            const initialLoanOutstandingTotal   = parseInt(vaultRecord.loanOutstandingTotal);
            const initialLoanPrincipalTotal     = parseInt(vaultRecord.loanPrincipalTotal);
            const initialLoanInterestTotal      = parseInt(vaultRecord.loanInterestTotal);

            // get initial eve's Mock FA2 Token balance
            const eveMockFa2Ledger                 = await mockFa2TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMockFa2TokenBalance    = eveMockFa2Ledger == undefined ? 0 : parseInt(eveMockFa2Ledger);

            const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
            await eveBorrowOperation.confirmation();

            // get updated storage
            const updatedLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedvaultRecord              = await updatedLendingControllerStorage.vaults.get(vaultHandle);

            const updatedLoanOutstandingTotal     = updatedvaultRecord.loanOutstandingTotal;
            const updatedLoanPrincipalTotal       = updatedvaultRecord.loanPrincipalTotal;
            const updatedLoanInterestTotal        = updatedvaultRecord.loanInterestTotal;

            const updatedMockFa2TokenStorage      = await mockFa2TokenInstance.storage();
            const updatedEveMockFa2Ledger         = await updatedMockFa2TokenStorage.ledger.get(eve.pkh);            
            const updatedEveMockFa2TokenBalance   = parseInt(updatedEveMockFa2Ledger);

            assert.equal(updatedLoanOutstandingTotal, initialLoanOutstandingTotal + borrowAmount);
            assert.equal(updatedLoanPrincipalTotal, initialLoanPrincipalTotal + borrowAmount);
            assert.equal(updatedLoanInterestTotal, 0);

            // check eve Mock FA2 Token balance
            assert.equal(updatedEveMockFa2TokenBalance, eveInitialMockFa2TokenBalance + finalLoanAmount);

        });


        it('user (eve) can borrow 1 Tez', async () => {

            await signerFactory(eve.sk);
            const vaultId            = eveVaultSet[2];
            const vaultOwner         = eve.pkh;
            const borrowAmount       = 1000000; // 1 Tez

            const decimals               = lendingControllerStorage.config.decimals;       // e.g. 3
            const minimumLoanFeePercent  = lendingControllerStorage.config.minimumLoanFeePercent; // e.g. 1%
            const minimumLoanFee         = (borrowAmount * minimumLoanFeePercent) / (10 ** decimals);
            const finalLoanAmount        = borrowAmount - minimumLoanFee;

            // setup vault handle and vault record
            const vaultHandle = {
                "id"    : vaultId,
                "owner" : vaultOwner
            };
            const vaultRecord = await lendingControllerStorage.vaults.get(vaultHandle);

            // get initial variables
            const initialLoanOutstandingTotal   = parseInt(vaultRecord.loanOutstandingTotal);
            const initialLoanPrincipalTotal     = parseInt(vaultRecord.loanPrincipalTotal);
            const initialLoanInterestTotal      = parseInt(vaultRecord.loanInterestTotal);
            
            // get initial eve XTZ balance
            const eveInitialXtzLedger   = await utils.tezos.tz.getBalance(eve.pkh);
            const eveInitialXtzBalance  = eveInitialXtzLedger.toNumber();
            
            // borrow operation
            const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
            await eveBorrowOperation.confirmation();

            // get updated storage
            const updatedLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedvaultRecord              = await updatedLendingControllerStorage.vaults.get(vaultHandle);

            const updatedLoanOutstandingTotal     = updatedvaultRecord.loanOutstandingTotal;
            const updatedLoanPrincipalTotal       = updatedvaultRecord.loanPrincipalTotal;
            const updatedLoanInterestTotal        = updatedvaultRecord.loanInterestTotal;

            // check Eve's XTZ Balance and account for gas cost in transaction with almostEqual
            const updatedEveXtzBalance = await utils.tezos.tz.getBalance(eve.pkh);

            assert.equal(updatedLoanOutstandingTotal, initialLoanOutstandingTotal + borrowAmount);
            assert.equal(updatedLoanPrincipalTotal, initialLoanPrincipalTotal + borrowAmount);
            assert.equal(updatedLoanInterestTotal, 0);

            assert.equal(almostEqual(updatedEveXtzBalance, eveInitialXtzBalance + finalLoanAmount, 0.0001), true)

        })


        it('user (eve) can borrow again from the same vault (1 Mock FA12 Tokens)', async () => {

            await signerFactory(eve.sk);
            const vaultId            = eveVaultSet[0];
            const vaultOwner         = eve.pkh;
            const borrowAmount       = 1000000; // 1 Mock FA12 Tokens

            const decimals               = lendingControllerStorage.config.decimals;       // e.g. 3
            const minimumLoanFeePercent  = lendingControllerStorage.config.minimumLoanFeePercent; // e.g. 1%
            const minimumLoanFee         = (borrowAmount * minimumLoanFeePercent) / (10 ** decimals);
            const finalLoanAmount        = borrowAmount - minimumLoanFee;

            // setup vault handle and vault record
            const vaultHandle = {
                "id"    : vaultId,
                "owner" : vaultOwner
            };
            const vaultRecord = await lendingControllerStorage.vaults.get(vaultHandle);

            // get initial loan variables
            const initialLoanOutstandingTotal   = parseInt(vaultRecord.loanOutstandingTotal);
            const initialLoanPrincipalTotal     = parseInt(vaultRecord.loanPrincipalTotal);
            const initialLoanInterestTotal      = parseInt(vaultRecord.loanInterestTotal);

            // get initial eve's Mock FA12 Token balance
            const eveMockFa12Ledger                 = await mockFa12TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMockFa12TokenBalance    = eveMockFa12Ledger == undefined ? 0 : parseInt(eveMockFa12Ledger.balance);

            // borrow operation
            const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
            await eveBorrowOperation.confirmation();

            // get updated storage
            const updatedLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedvaultRecord              = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const updatedMockFa12TokenStorage     = await mockFa12TokenInstance.storage();
            const updatedEveMockFa12Ledger        = await updatedMockFa12TokenStorage.ledger.get(eve.pkh);            
            const updatedEveMockFa12Balance       = parseInt(updatedEveMockFa12Ledger.balance);

            const updatedLoanOutstandingTotal     = updatedvaultRecord.loanOutstandingTotal;
            const updatedLoanPrincipalTotal       = updatedvaultRecord.loanPrincipalTotal;
            const updatedLoanInterestTotal        = updatedvaultRecord.loanInterestTotal;

            // check vault loan records
            assert.equal(updatedLoanOutstandingTotal, initialLoanOutstandingTotal + borrowAmount);
            assert.equal(updatedLoanPrincipalTotal, initialLoanPrincipalTotal + borrowAmount);
            assert.equal(updatedLoanInterestTotal, 0);

            // check eve Mock FA12 Token balance
            assert.equal(updatedEveMockFa12Ledger.balance, eveInitialMockFa12TokenBalance + finalLoanAmount);

        });


        it('user (eve) cannot borrow if token pool reserves not met', async () => {

            await signerFactory(eve.sk);

            // eve's vault
            const eveVaultId         = eveVaultSet[0];
            const eveVaultOwner      = eve.pkh;
            const loanTokenName      = "mockFa12";
            const reserveRatio       = 30; // 30%

            const loanTokenRecordView = await lendingControllerInstance.contractViews.getLoanTokenRecord(loanTokenName).executeView({ viewCaller : bob.pkh});
            const tokenPoolTotal      = loanTokenRecordView.tokenPoolTotal;
            const totalBorrowed       = loanTokenRecordView.totalBorrowed;
            const totalRemaining      = loanTokenRecordView.totalRemaining;

            const requiredReserves    = (tokenPoolTotal * reserveRatio) / 100;
            const borrowTooMuchAmount = (totalBorrowed - requiredReserves) + 1;

            const borrowAmount        = borrowTooMuchAmount; // 2 Mock FA12 Tokens

            // fail borrow operation
            const failBorrowFromEveVaultOperation = await lendingControllerInstance.methods.borrow(eveVaultId, borrowAmount);
            await chai.expect(failBorrowFromEveVaultOperation.send()).to.be.rejected;    

        })


        it('user (eve) adds liquidity into Lending Controller token pool (10 MockFA12 Tokens)', async () => {
    
            // init variables
            await signerFactory(eve.sk);
            const loanTokenName = "mockFa12";
            const depositAmount = 10000000; // 10 Mock FA12 Tokens

            lendingControllerStorage = await lendingControllerInstance.storage();
            
            // get mock fa12 token storage and lp token pool mock fa12 token storage
            const mockFa12TokenStorage              = await mockFa12TokenInstance.storage();
            const lpTokenPoolMockFa12TokenStorage   = await lpTokenPoolMockFa12TokenInstance.storage();
            
            // get initial eve's Mock FA12 Token balance
            const eveMockFa12Ledger                 = await mockFa12TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMockFa12TokenBalance    = eveMockFa12Ledger == undefined ? 0 : parseInt(eveMockFa12Ledger.balance);

            // get initial eve's Token Pool FA2 LP - Mock FA12 Token - balance
            const eveLpTokenPoolMockFa12Ledger                 = await lpTokenPoolMockFa12TokenStorage.ledger.get(eve.pkh);            
            const eveInitialLpTokenPoolMockFa12TokenBalance    = eveLpTokenPoolMockFa12Ledger == undefined ? 0 : parseInt(eveLpTokenPoolMockFa12Ledger);

            // get initial lending controller's Mock FA12 Token balance
            const lendingControllerMockFa12Ledger                = await mockFa12TokenStorage.ledger.get(lendingControllerAddress.address);            
            const lendingControllerInitialMockFa12TokenBalance   = lendingControllerMockFa12Ledger == undefined ? 0 : parseInt(lendingControllerMockFa12Ledger.balance);

            // get initial lending controller token pool total
            const initialLoanTokenRecord                 = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
            const lendingControllerInitialTokenPoolTotal = parseInt(initialLoanTokenRecord.tokenPoolTotal);

            // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
            // reset token allowance
            const resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
                lendingControllerAddress.address,
                0
            ).send();
            await resetTokenAllowance.confirmation();

            // set new token allowance
            const setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
                lendingControllerAddress.address,
                depositAmount
            ).send();
            await setNewTokenAllowance.confirmation();

            // eve deposits mock FA12 tokens into lending controller token pool
            const eveDepositTokenOperation  = await lendingControllerInstance.methods.addLiquidity(
                loanTokenName,
                depositAmount, 
            ).send();
            await eveDepositTokenOperation.confirmation();

            // get updated storages
            const updatedLendingControllerStorage         = await lendingControllerInstance.storage();
            const updatedMockFa12TokenStorage             = await mockFa12TokenInstance.storage();
            const updatedLpTokenPoolMockFa12TokenStorage  = await lpTokenPoolMockFa12TokenInstance.storage();

            // check new balance for loan token pool total
            const updatedLoanTokenRecord           = await updatedLendingControllerStorage.loanTokenLedger.get(loanTokenName);
            assert.equal(updatedLoanTokenRecord.tokenPoolTotal, lendingControllerInitialTokenPoolTotal + depositAmount);

            // check Eve's Mock FA12 Token balance
            const updatedEveMockFa12Ledger         = await updatedMockFa12TokenStorage.ledger.get(eve.pkh);            
            assert.equal(updatedEveMockFa12Ledger.balance, eveInitialMockFa12TokenBalance - depositAmount);

            // check Lending Controller's Mock FA12 Token Balance
            const lendingControllerMockFa12Account  = await updatedMockFa12TokenStorage.ledger.get(lendingControllerAddress.address);            
            assert.equal(lendingControllerMockFa12Account.balance, lendingControllerInitialMockFa12TokenBalance + depositAmount);

            // check Eve's LP Token Pool Mock FA12 Token balance
            const updatedEveLpTokenPoolMockFa12Ledger        = await updatedLpTokenPoolMockFa12TokenStorage.ledger.get(eve.pkh);            
            assert.equal(updatedEveLpTokenPoolMockFa12Ledger, eveInitialLpTokenPoolMockFa12TokenBalance + depositAmount);                    

        })



        it('user (eve) can borrow again after liquidity has been added (3 MockFA12 Tokens)', async () => {

            await signerFactory(eve.sk);
            const vaultId            = eveVaultSet[0];
            const vaultOwner         = eve.pkh;
            const borrowAmount       = 3000000; // 1 Mock FA12 Tokens

            const decimals               = lendingControllerStorage.config.decimals;       // e.g. 3
            const minimumLoanFeePercent  = lendingControllerStorage.config.minimumLoanFeePercent; // e.g. 1%
            const minimumLoanFee         = (borrowAmount * minimumLoanFeePercent) / (10 ** decimals);
            const finalLoanAmount        = borrowAmount - minimumLoanFee;

            // setup vault handle and vault record
            const vaultHandle = {
                "id"    : vaultId,
                "owner" : vaultOwner
            };
            const vaultRecord = await lendingControllerStorage.vaults.get(vaultHandle);

            // get initial loan variables
            const initialLoanOutstandingTotal   = parseInt(vaultRecord.loanOutstandingTotal);
            const initialLoanPrincipalTotal     = parseInt(vaultRecord.loanPrincipalTotal);
            const initialLoanInterestTotal      = parseInt(vaultRecord.loanInterestTotal);

            // get initial eve's Mock FA12 Token balance
            const eveMockFa12Ledger                 = await mockFa12TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMockFa12TokenBalance    = eveMockFa12Ledger == undefined ? 0 : parseInt(eveMockFa12Ledger.balance);

            // borrow operation
            const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
            await eveBorrowOperation.confirmation();

            // get updated storage
            const updatedLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedvaultRecord              = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const updatedMockFa12TokenStorage     = await mockFa12TokenInstance.storage();
            const updatedEveMockFa12Ledger        = await updatedMockFa12TokenStorage.ledger.get(eve.pkh);            
            const updatedEveMockFa12Balance       = parseInt(updatedEveMockFa12Ledger.balance);

            const updatedLoanOutstandingTotal     = updatedvaultRecord.loanOutstandingTotal;
            const updatedLoanPrincipalTotal       = updatedvaultRecord.loanPrincipalTotal;
            const updatedLoanInterestTotal        = updatedvaultRecord.loanInterestTotal;

            // check vault loan records
            assert.equal(updatedLoanOutstandingTotal, initialLoanOutstandingTotal + borrowAmount);
            assert.equal(updatedLoanPrincipalTotal, initialLoanPrincipalTotal + borrowAmount);
            assert.equal(updatedLoanInterestTotal, 0);

            // check eve Mock FA12 Token balance
            assert.equal(updatedEveMockFa12Ledger.balance, eveInitialMockFa12TokenBalance + finalLoanAmount);

        })



        it('non-owner cannot borrow from the vault', async () => {

            // set non-owner as alice 
            await signerFactory(alice.sk);

            // eve's vault
            const eveVaultId         = eveVaultSet[0];
            const eveVaultOwner      = eve.pkh;
            const borrowAmount       = 2000000; // 2 Mock FA12 Tokens

            // fail borrow operation
            const failBorrowOperation = await lendingControllerInstance.methods.borrow(eveVaultId, borrowAmount);
            await chai.expect(failBorrowOperation.send()).to.be.rejected;    

            // mallory's vault
            const malloryVaultId         = malloryVaultSet[0];
            const malloryVaultOwner      = mallory.pkh;

            // fail borrow operation
            const failBorrowFromMalloryVaultOperation = await lendingControllerInstance.methods.borrow(malloryVaultId, borrowAmount);
            await chai.expect(failBorrowFromMalloryVaultOperation.send()).to.be.rejected;    

        });

    })



    // 
    // Test: repay
    //
    describe('%repay', function () {

        it('user (eve) can repay 1 Mock FA12 Token', async () => {

            await signerFactory(eve.sk);
            const vaultId            = eveVaultSet[0];
            const vaultOwner         = eve.pkh;
            const repayAmount        = 1000000; // 1 Mock FA12 Tokens
            const loanTokenName      = 'mockFa12';
 
            // get mock fa12 token storage 
            const mockFa12TokenStorage              = await mockFa12TokenInstance.storage();
            
            // get initial eve's Mock FA12 Token balance
            const eveMockFa12Ledger                 = await mockFa12TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMockFa12TokenBalance    = eveMockFa12Ledger == undefined ? 0 : parseInt(eveMockFa12Ledger.balance);

            // setup vault handle and vault record
            const vaultHandle = {
                "id"    : vaultId,
                "owner" : vaultOwner
            };
            const vaultRecord = await lendingControllerStorage.vaults.get(vaultHandle);

            // get initial loan variables
            const initialLoanOutstandingTotal   = parseInt(vaultRecord.loanOutstandingTotal);
            const initialLoanPrincipalTotal     = parseInt(vaultRecord.loanPrincipalTotal);
            const initialLoanInterestTotal      = parseInt(vaultRecord.loanInterestTotal);

            console.log('eveInitialMockFa12TokenBalance: ' + eveInitialMockFa12TokenBalance);
            console.log('initialLoanOutstandingTotal: '    + initialLoanOutstandingTotal);
            console.log('initialLoanPrincipalTotal: '      + initialLoanPrincipalTotal);
            console.log('initialLoanInterestTotal: '       + initialLoanInterestTotal);

            // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
            // reset token allowance
            const resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
                lendingControllerAddress.address,
                0
            ).send();
            await resetTokenAllowance.confirmation();

            // set new token allowance
            const setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
                lendingControllerAddress.address,
                repayAmount
            ).send();
            await setNewTokenAllowance.confirmation();

            // repay operation
            const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send();
            await eveRepayOperation.confirmation();

            // get updated storage
            const updatedLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedvaultRecord              = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const updatedMockFa12TokenStorage     = await mockFa12TokenInstance.storage();
            const updatedEveMockFa12Ledger        = await updatedMockFa12TokenStorage.ledger.get(eve.pkh);            
            const updatedEveMockFa12Balance       = parseInt(updatedEveMockFa12Ledger.balance);

            const updatedLoanOutstandingTotal     = updatedvaultRecord.loanOutstandingTotal;
            const updatedLoanPrincipalTotal       = updatedvaultRecord.loanPrincipalTotal;
            const updatedLoanInterestTotal        = updatedvaultRecord.loanInterestTotal;

            console.log('updatedEveMockFa12Balance: '   + updatedEveMockFa12Balance);
            console.log('updatedLoanOutstandingTotal: ' + updatedLoanOutstandingTotal);
            console.log('updatedLoanPrincipalTotal: '   + updatedLoanPrincipalTotal);
            console.log('updatedLoanInterestTotal: '    + updatedLoanInterestTotal);

            const testLoanTokenView = await lendingControllerInstance.contractViews.getLoanTokenRecord(loanTokenName).executeView({ viewCaller : bob.pkh});
            console.log(testLoanTokenView);

        })

    })


});