import { createLambdaBytes } from "@mavrykdynamics/create-lambda-bytes"
import assert from "assert";
import { BigNumber } from 'bignumber.js'

import { MVK, TEZ, Utils, zeroAddress } from "./helpers/Utils";

const chai = require("chai");
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

// ------------------------------------------------------------------------------
// Contract Address
// ------------------------------------------------------------------------------

import contractDeployments from './contractDeployments.json'

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { alice, baker, bob, eve, mallory } from "../scripts/sandbox/accounts";
import { vaultStorageType } from "../storage/storageTypes/vaultStorageType"
import * as helperFunctions from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("Lending Controller tests", async () => {
    
    var utils: Utils
    let tezos

    //  - eve: first vault loan token: mockFa12, second vault loan token: mockFa2, third vault loan token - tez
    //  - mallory: first vault loan token: mockFa12, second vault loan token: mockFa2
    var eveVaultSet : Array<Number>     = [] 
    var malloryVaultSet : Array<Number> = [] 
    
    let updateTokenRewardIndexOperation

    let tokenId = 0

    let doormanInstance
    let delegationInstance
    let mvkTokenInstance
    
    let mockFa12TokenInstance
    let mockFa2TokenInstance

    let mockUsdMockFa12TokenAggregatorInstance
    let mockUsdMockFa2TokenAggregatorInstance
    let mockUsdXtzAggregatorInstance
    let mockUsdMvkAggregatorInstance

    let mTokenUsdtInstance
    let mTokenEurlInstance
    let mTokenXtzInstance

    let governanceInstance
    let governanceProxyInstance

    let lendingControllerInstance
    let vaultFactoryInstance

    let doormanStorage
    let delegationStorage
    let mvkTokenStorage
    let mockFa12TokenStorage
    let mockFa2TokenStorage
    let governanceStorage
    let governanceProxyStorage

    let lendingControllerStorage
    let vaultFactoryStorage

    let updateOperatorsOperation

    before("setup", async () => {

        utils = new Utils();
        await utils.init(bob.sk);
        tezos = utils.tezos
        
        doormanInstance                         = await utils.tezos.contract.at(contractDeployments.doorman.address);
        delegationInstance                      = await utils.tezos.contract.at(contractDeployments.delegation.address);
        mvkTokenInstance                        = await utils.tezos.contract.at(contractDeployments.mvkToken.address);
        mockFa12TokenInstance                   = await utils.tezos.contract.at(contractDeployments.mavrykFa12Token.address);
        mockFa2TokenInstance                    = await utils.tezos.contract.at(contractDeployments.mavrykFa2Token.address);
        governanceInstance                      = await utils.tezos.contract.at(contractDeployments.governance.address);
        governanceProxyInstance                 = await utils.tezos.contract.at(contractDeployments.governanceProxy.address);

        mTokenUsdtInstance                      = await utils.tezos.contract.at(contractDeployments.mTokenUsdt.address);
        mTokenEurlInstance                      = await utils.tezos.contract.at(contractDeployments.mTokenEurl.address);
        mTokenXtzInstance                       = await utils.tezos.contract.at(contractDeployments.mTokenXtz.address);

        mockUsdMockFa12TokenAggregatorInstance  = await utils.tezos.contract.at(contractDeployments.mockUsdMockFa12TokenAggregator.address);
        mockUsdMockFa2TokenAggregatorInstance   = await utils.tezos.contract.at(contractDeployments.mockUsdMockFa2TokenAggregator.address);
        mockUsdXtzAggregatorInstance            = await utils.tezos.contract.at(contractDeployments.mockUsdXtzAggregator.address);
        mockUsdMvkAggregatorInstance            = await utils.tezos.contract.at(contractDeployments.mockUsdMvkAggregator.address);

        lendingControllerInstance               = await utils.tezos.contract.at(contractDeployments.lendingController.address);
        vaultFactoryInstance                    = await utils.tezos.contract.at(contractDeployments.vaultFactory.address);

        doormanStorage                          = await doormanInstance.storage();
        delegationStorage                       = await delegationInstance.storage();
        mvkTokenStorage                         = await mvkTokenInstance.storage();
        mockFa12TokenStorage                    = await mockFa12TokenInstance.storage();
        mockFa2TokenStorage                     = await mockFa2TokenInstance.storage();
        governanceStorage                       = await governanceInstance.storage();
        governanceProxyStorage                  = await governanceInstance.storage();
        lendingControllerStorage                = await lendingControllerInstance.storage();
        vaultFactoryStorage                     = await vaultFactoryInstance.storage();


        console.log('-- -- -- -- -- Lending Controller Tests -- -- -- --')
        console.log('Doorman Contract deployed at:',            doormanInstance.address);
        console.log('Delegation Contract deployed at:',         delegationInstance.address);
        console.log('MVK Token Contract deployed at:',          mvkTokenInstance.address);
        console.log('Mock FA12 Token Contract deployed at:',    mockFa12TokenInstance.address);
        console.log('Mock FA2 Token Contract deployed at:',     mockFa2TokenInstance.address);
        console.log('Governance Contract deployed at:',         governanceInstance.address);
        console.log('Governance Proxy Contract deployed at:',   governanceProxyInstance.address);

        console.log('mTokenUsdt - deployed at:',   mTokenUsdtInstance.address);
        console.log('mTokenEurl - deployed at:',    mTokenEurlInstance.address);
        console.log('mTokenXtz - deployed at:',               mTokenXtzInstance.address);

        console.log('Mock Aggregator - USD / Mock FA12 Token - deployed at:',   mockUsdMockFa12TokenAggregatorInstance.address);
        console.log('Mock Aggregator - USD / Mock FA2 Token - deployed at:',    mockUsdMockFa2TokenAggregatorInstance.address);
        console.log('Mock Aggregator - USD / XTZ - deployed at:',               mockUsdXtzAggregatorInstance.address);
        console.log('Mock Aggregator - USD / MVK - deployed at:',               mockUsdMvkAggregatorInstance.address);

        console.log('Lending Controller Contract deployed at:', lendingControllerInstance.address);
        console.log('Vault Factory Contract deployed at:',      vaultFactoryInstance.address);

        console.log('Alice address: '   + alice.pkh);
        console.log('Bob address: '     + bob.pkh);
        console.log('Eve address: '     + eve.pkh);

        // ------------------------------------------------------------------
        //
        // Update mTokens (i.e. mTokens) tokenRewardIndex by transferring 0
        //  - this will ensure that fetching user balances through on-chain views are accurate for continuous re-testing
        //
        // ------------------------------------------------------------------
        await helperFunctions.signerFactory(tezos, bob.sk);

        const mockFa12LoanToken = await lendingControllerStorage.loanTokenLedger.get("usdt"); 
        const mockFa2LoanToken  = await lendingControllerStorage.loanTokenLedger.get("eurl"); 
        const tezLoanToken      = await lendingControllerStorage.loanTokenLedger.get("tez");

        if(!(mockFa12LoanToken == undefined || mockFa12LoanToken == null)){
            updateTokenRewardIndexOperation = await mTokenUsdtInstance.methods.transfer([
            {
                from_: bob.pkh,
                txs: [
                    {
                        to_: eve.pkh,
                        token_id: 0,
                        amount: 0,
                    },
                ]
            }]).send();
            await updateTokenRewardIndexOperation.confirmation();
            console.log('mockfa12 loan token set');
        }

        if(!(mockFa2LoanToken == undefined || mockFa2LoanToken == null)){
            updateTokenRewardIndexOperation = await mTokenEurlInstance.methods.transfer([
            {
                from_: bob.pkh,
                txs: [
                    {
                        to_: eve.pkh,
                        token_id: 0,
                        amount: 0,
                    },
                ]
            }]).send();
            await updateTokenRewardIndexOperation.confirmation();
            console.log('mockfa2 loan token set');
        }

        if(!(tezLoanToken == undefined || tezLoanToken == null)){
            updateTokenRewardIndexOperation = await mTokenXtzInstance.methods.transfer([
            {
                from_: bob.pkh,
                txs: [
                    {
                        to_: eve.pkh,
                        token_id: 0,
                        amount: 0,
                    },
                ]
            }]).send();
            await updateTokenRewardIndexOperation.confirmation();
            console.log('tez loan token set');
        }

    });



    // 
    // Setup and test Lending Controller SetLoanToken entrypoint
    //
    describe('%setLoanToken - setup and test lending controller %setLoanToken entrypoint', function () {

        it('admin can set mock FA12 as a loan token', async () => {

            try{        
                
                // init variables
                await helperFunctions.signerFactory(tezos, bob.sk);

                const setLoanTokenActionType                = "createLoanToken";
                const tokenName                             = "usdt";
                const tokenContractAddress                  = contractDeployments.mavrykFa12Token.address;
                const tokenType                             = "fa12";
                const tokenDecimals                         = 6;

                const oracleAddress                         = contractDeployments.mockUsdMockFa12TokenAggregator.address;

                const mTokenContractAddress                 = contractDeployments.mTokenUsdt.address;

                const interestRateDecimals                  = 27;
                const reserveRatio                          = 3000; // 30% reserves (4 decimals)
                const optimalUtilisationRate                = 30 * (10 ** (interestRateDecimals - 2));  // 30% utilisation rate kink
                const baseInterestRate                      = 5  * (10 ** (interestRateDecimals - 2));  // 5%
                const maxInterestRate                       = 25 * (10 ** (interestRateDecimals - 2));  // 25% 
                const interestRateBelowOptimalUtilisation   = 10 * (10 ** (interestRateDecimals - 2));  // 10% 
                const interestRateAboveOptimalUtilisation   = 20 * (10 ** (interestRateDecimals - 2));  // 20%

                const minRepaymentAmount                    = 10000;

                // check if loan token exists
                const checkLoanTokenExists   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

                // only test for first run, as govProxy will be admin instead of bob for subsequent continuous testing 
                if(checkLoanTokenExists === undefined){

                    const adminSetMockFa12LoanTokenOperation = await lendingControllerInstance.methods.setLoanToken(
                        
                        setLoanTokenActionType,

                        tokenName,
                        tokenDecimals,

                        oracleAddress,

                        mTokenContractAddress,
                        
                        reserveRatio,
                        optimalUtilisationRate,
                        baseInterestRate,
                        maxInterestRate,
                        interestRateBelowOptimalUtilisation,
                        interestRateAboveOptimalUtilisation,

                        minRepaymentAmount,

                        // fa12 token type - token contract address
                        tokenType,
                        tokenContractAddress,

                    ).send();
                    await adminSetMockFa12LoanTokenOperation.confirmation();

                    lendingControllerStorage  = await lendingControllerInstance.storage();
                    const mockFa12LoanToken   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

                    assert.equal(mockFa12LoanToken.tokenName              , tokenName);
                    // assert.equal(mockFa12LoanToken.tokenContractAddress   , tokenContractAddress);
    
                    assert.equal(mockFa12LoanToken.mTokensTotal          , 0);
                    assert.equal(mockFa12LoanToken.mTokenAddress , mTokenContractAddress);
    
                    assert.equal(mockFa12LoanToken.reserveRatio           , reserveRatio);
                    assert.equal(mockFa12LoanToken.tokenPoolTotal         , 0);
                    assert.equal(mockFa12LoanToken.totalBorrowed          , 0);
                    assert.equal(mockFa12LoanToken.totalRemaining         , 0);
    
                    assert.equal(mockFa12LoanToken.optimalUtilisationRate , optimalUtilisationRate);
                    assert.equal(mockFa12LoanToken.baseInterestRate       , baseInterestRate);
                    assert.equal(mockFa12LoanToken.maxInterestRate        , maxInterestRate);
                    
                    assert.equal(mockFa12LoanToken.interestRateBelowOptimalUtilisation       , interestRateBelowOptimalUtilisation);
                    assert.equal(mockFa12LoanToken.interestRateAboveOptimalUtilisation       , interestRateAboveOptimalUtilisation);

                    assert.equal(mockFa12LoanToken.minRepaymentAmount       , minRepaymentAmount);
    
                } else {

                    lendingControllerStorage  = await lendingControllerInstance.storage();
                    const mockFa12LoanToken   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 
                
                    // other variables will be affected by repeated tests
                    assert.equal(mockFa12LoanToken.tokenName, tokenName);

                }

            } catch(e){
                console.log(e);
            } 
        });

        it('admin can set mock FA2 as a loan token', async () => {

            try{        
                
                // init variables
                await helperFunctions.signerFactory(tezos, bob.sk);

                const setLoanTokenActionType                = "createLoanToken";
                const tokenName                             = "eurl";
                const tokenContractAddress                  = contractDeployments.mavrykFa2Token.address;
                const tokenType                             = "fa2";
                const tokenDecimals                         = 6;

                const oracleAddress                         = contractDeployments.mockUsdMockFa2TokenAggregator.address;

                const mTokenContractAddress                 = contractDeployments.mTokenEurl.address;

                const interestRateDecimals                  = 27;
                const reserveRatio                          = 3000; // 30% reserves (4 decimals)
                const optimalUtilisationRate                = 30 * (10 ** (interestRateDecimals - 2));  // 30% utilisation rate kink
                const baseInterestRate                      = 5  * (10 ** (interestRateDecimals - 2));  // 5%
                const maxInterestRate                       = 25 * (10 ** (interestRateDecimals - 2));  // 25% 
                const interestRateBelowOptimalUtilisation   = 10 * (10 ** (interestRateDecimals - 2));  // 10% 
                const interestRateAboveOptimalUtilisation   = 20 * (10 ** (interestRateDecimals - 2));  // 20%

                const minRepaymentAmount                    = 10000;

                const checkLoanTokenExists   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

                // only test for first run, as govProxy will be admin instead of bob for subsequent continuous testing 
                if(checkLoanTokenExists === undefined){

                    const adminSetMockFa2LoanTokenOperation = await lendingControllerInstance.methods.setLoanToken(

                        setLoanTokenActionType,
                        
                        tokenName,
                        tokenDecimals,

                        oracleAddress,

                        mTokenContractAddress,
                        
                        reserveRatio,
                        optimalUtilisationRate,
                        baseInterestRate,
                        maxInterestRate,
                        interestRateBelowOptimalUtilisation,
                        interestRateAboveOptimalUtilisation,

                        minRepaymentAmount,
                        
                        // fa2 token type - token contract address + token id
                        tokenType,
                        tokenContractAddress,
                        tokenId

                    ).send();
                    await adminSetMockFa2LoanTokenOperation.confirmation();

                    lendingControllerStorage = await lendingControllerInstance.storage();
                    const mockFa2LoanToken   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

                    assert.equal(mockFa2LoanToken.tokenName              , tokenName);

                    assert.equal(mockFa2LoanToken.mTokensTotal          , 0);
                    assert.equal(mockFa2LoanToken.mTokenAddress , mTokenContractAddress);

                    assert.equal(mockFa2LoanToken.reserveRatio           , reserveRatio);
                    assert.equal(mockFa2LoanToken.tokenPoolTotal         , 0);
                    assert.equal(mockFa2LoanToken.totalBorrowed          , 0);
                    assert.equal(mockFa2LoanToken.totalRemaining         , 0);

                    assert.equal(mockFa2LoanToken.optimalUtilisationRate , optimalUtilisationRate);
                    assert.equal(mockFa2LoanToken.baseInterestRate       , baseInterestRate);
                    assert.equal(mockFa2LoanToken.maxInterestRate        , maxInterestRate);
                    
                    assert.equal(mockFa2LoanToken.interestRateBelowOptimalUtilisation       , interestRateBelowOptimalUtilisation);
                    assert.equal(mockFa2LoanToken.interestRateAboveOptimalUtilisation       , interestRateAboveOptimalUtilisation);

                    assert.equal(mockFa2LoanToken.minRepaymentAmount       , minRepaymentAmount);

                } else {

                    lendingControllerStorage = await lendingControllerInstance.storage();
                    const mockFa2LoanToken   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

                    // other variables will be affected by repeated tests
                    assert.equal(mockFa2LoanToken.tokenName, tokenName);

                }
                
                
            } catch(e){
                console.log(e);
            } 
        });


        it('admin can set tez as a loan token', async () => {

            try{        
                
                // init variables
                await helperFunctions.signerFactory(tezos, bob.sk);

                const setLoanTokenActionType                = "createLoanToken";
                const tokenName                             = "tez";
                const tokenType                             = "tez";
                const tokenDecimals                         = 6;

                const oracleAddress                         = contractDeployments.mockUsdXtzAggregator.address;

                const mTokenContractAddress                 = contractDeployments.mTokenXtz.address;

                const interestRateDecimals                  = 27;
                const reserveRatio                          = 3000; // 30% reserves (4 decimals)
                const optimalUtilisationRate                = 30 * (10 ** (interestRateDecimals - 2));  // 30% utilisation rate kink
                const baseInterestRate                      = 5  * (10 ** (interestRateDecimals - 2));  // 5%
                const maxInterestRate                       = 25 * (10 ** (interestRateDecimals - 2));  // 25% 
                const interestRateBelowOptimalUtilisation   = 10 * (10 ** (interestRateDecimals - 2));  // 10% 
                const interestRateAboveOptimalUtilisation   = 20 * (10 ** (interestRateDecimals - 2));  // 20%

                const minRepaymentAmount                    = 10000;

                // check if loan token exists
                const checkLoanTokenExists   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

                // only test for first run, as govProxy will be admin instead of bob for subsequent continuous testing 
                if(checkLoanTokenExists === undefined){

                    const adminSeTezLoanTokenOperation = await lendingControllerInstance.methods.setLoanToken(

                        setLoanTokenActionType,
                        
                        tokenName,
                        tokenDecimals,

                        oracleAddress,

                        mTokenContractAddress,
                        
                        reserveRatio,
                        optimalUtilisationRate,
                        baseInterestRate,
                        maxInterestRate,
                        interestRateBelowOptimalUtilisation,
                        interestRateAboveOptimalUtilisation,

                        minRepaymentAmount,

                        // fa12 token type - token contract address
                        tokenType

                    ).send();
                    await adminSeTezLoanTokenOperation.confirmation();

                    lendingControllerStorage  = await lendingControllerInstance.storage();
                    const tezLoanToken   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 
                
                    assert.equal(tezLoanToken.tokenName              , tokenName);
                    assert.equal(tezLoanToken.tokenDecimals          , tokenDecimals);

                    assert.equal(tezLoanToken.mTokensTotal          , 0);
                    assert.equal(tezLoanToken.mTokenAddress , mTokenContractAddress);
    
                    assert.equal(tezLoanToken.reserveRatio           , reserveRatio);
                    assert.equal(tezLoanToken.tokenPoolTotal         , 0);
                    assert.equal(tezLoanToken.totalBorrowed          , 0);
                    assert.equal(tezLoanToken.totalRemaining         , 0);
    
                    assert.equal(tezLoanToken.optimalUtilisationRate , optimalUtilisationRate);
                    assert.equal(tezLoanToken.baseInterestRate       , baseInterestRate);
                    assert.equal(tezLoanToken.maxInterestRate        , maxInterestRate);
                    
                    assert.equal(tezLoanToken.interestRateBelowOptimalUtilisation       , interestRateBelowOptimalUtilisation);
                    assert.equal(tezLoanToken.interestRateAboveOptimalUtilisation       , interestRateAboveOptimalUtilisation);

                    assert.equal(tezLoanToken.minRepaymentAmount       , minRepaymentAmount);
    

                } else {

                    lendingControllerStorage  = await lendingControllerInstance.storage();
                    const tezLoanToken   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 
                
                    // other variables will be affected by repeated tests
                    assert.equal(tezLoanToken.tokenName, tokenName);
                    
                }

            } catch(e){
                console.log(e);
            } 
        });


        it('admin should be able to update a loan token', async () => {

            try{        
                
                // init variables
                await helperFunctions.signerFactory(tezos, bob.sk);

                const createLoanTokenActionType             = "createLoanToken";
                const tokenName                             = "testUpdateLoanToken";
                const tokenContractAddress                  = contractDeployments.mavrykFa2Token.address;
                const tokenType                             = "fa2";
                const tokenDecimals                         = 6;

                const oracleAddress                         = contractDeployments.mockUsdMockFa2TokenAggregator.address;

                const mTokenContractAddress                = contractDeployments.mTokenEurl.address;

                const interestRateDecimals                  = 27;
                const reserveRatio                          = 3000; // 30% reserves (4 decimals)
                const optimalUtilisationRate                = 30 * (10 ** (interestRateDecimals - 2));  // 30% utilisation rate kink
                const baseInterestRate                      = 5  * (10 ** (interestRateDecimals - 2));  // 5%
                const maxInterestRate                       = 25 * (10 ** (interestRateDecimals - 2));  // 25% 
                const interestRateBelowOptimalUtilisation   = 10 * (10 ** (interestRateDecimals - 2));  // 10% 
                const interestRateAboveOptimalUtilisation   = 20 * (10 ** (interestRateDecimals - 2));  // 20%

                const minRepaymentAmount                    = 10000;

                const checkLoanTokenExists   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

                // only test for first run, as govProxy will be admin instead of bob for subsequent continuous testing 
                if(checkLoanTokenExists === undefined){

                    const adminSetMockFa2LoanTokenOperation = await lendingControllerInstance.methods.setLoanToken(

                        createLoanTokenActionType,
                        
                        tokenName,
                        tokenDecimals,

                        oracleAddress,

                        mTokenContractAddress,
                        
                        reserveRatio,
                        optimalUtilisationRate,
                        baseInterestRate,
                        maxInterestRate,
                        interestRateBelowOptimalUtilisation,
                        interestRateAboveOptimalUtilisation,

                        minRepaymentAmount,
                        
                        // fa2 token type - token contract address + token id
                        tokenType,
                        tokenContractAddress,
                        tokenId

                    ).send();
                    await adminSetMockFa2LoanTokenOperation.confirmation();

                    lendingControllerStorage = await lendingControllerInstance.storage();
                    const mockFa2LoanToken   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

                    assert.equal(mockFa2LoanToken.tokenName              , tokenName);

                    assert.equal(mockFa2LoanToken.mTokensTotal          , 0);
                    assert.equal(mockFa2LoanToken.mTokenAddress , mTokenContractAddress);

                    assert.equal(mockFa2LoanToken.reserveRatio           , reserveRatio);
                    assert.equal(mockFa2LoanToken.tokenPoolTotal         , 0);
                    assert.equal(mockFa2LoanToken.totalBorrowed          , 0);
                    assert.equal(mockFa2LoanToken.totalRemaining         , 0);

                    assert.equal(mockFa2LoanToken.optimalUtilisationRate , optimalUtilisationRate);
                    assert.equal(mockFa2LoanToken.baseInterestRate       , baseInterestRate);
                    assert.equal(mockFa2LoanToken.maxInterestRate        , maxInterestRate);
                    
                    assert.equal(mockFa2LoanToken.interestRateBelowOptimalUtilisation       , interestRateBelowOptimalUtilisation);
                    assert.equal(mockFa2LoanToken.interestRateAboveOptimalUtilisation       , interestRateAboveOptimalUtilisation);

                    assert.equal(mockFa2LoanToken.minRepaymentAmount       , minRepaymentAmount);

                } else {

                    lendingControllerStorage = await lendingControllerInstance.storage();
                    const mockFa2LoanToken   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

                    // other variables will be affected by repeated tests
                    assert.equal(mockFa2LoanToken.tokenName, tokenName);

                }


                // only test for first run, as govProxy will be admin instead of bob for subsequent continuous testing 
                if(checkLoanTokenExists === undefined){

                    const updateLoanTokenActionType                = "updateLoanToken";
                    
                    const newOracleAddress                         = contractDeployments.mockUsdMockFa12TokenAggregator.address;

                    const newReserveRatio                          = 2000; // 20% reserves (4 decimals)
                    const newOptimalUtilisationRate                = 50 * (10 ** (interestRateDecimals - 2));   // 50% utilisation rate kink
                    const newBaseInterestRate                      = 10  * (10 ** (interestRateDecimals - 2));  // 5%
                    const newMaxInterestRate                       = 50 * (10 ** (interestRateDecimals - 2));  // 25% 
                    const newInterestRateBelowOptimalUtilisation   = 30 * (10 ** (interestRateDecimals - 2));  // 10% 
                    const newInterestRateAboveOptimalUtilisation   = 30 * (10 ** (interestRateDecimals - 2));  // 20%
                    const newMinRepaymentAmount                    = 20000;
                    const isPaused                                 = false;

                    const adminUpdateMockFa2LoanTokenOperation = await lendingControllerInstance.methods.setLoanToken(

                        updateLoanTokenActionType,
                        
                        tokenName,

                        newOracleAddress,
                        
                        newReserveRatio,
                        newOptimalUtilisationRate,
                        newBaseInterestRate,
                        newMaxInterestRate,
                        newInterestRateBelowOptimalUtilisation,
                        newInterestRateAboveOptimalUtilisation,
                        newMinRepaymentAmount,

                        isPaused
                        
                    ).send();
                    await adminUpdateMockFa2LoanTokenOperation.confirmation();

                    lendingControllerStorage = await lendingControllerInstance.storage();
                    const updatedMockFa2LoanToken   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

                    assert.equal(updatedMockFa2LoanToken.tokenName              , tokenName);

                    assert.equal(updatedMockFa2LoanToken.mTokensTotal          , 0);
                    assert.equal(updatedMockFa2LoanToken.mTokenAddress , mTokenContractAddress);

                    assert.equal(updatedMockFa2LoanToken.reserveRatio           , newReserveRatio);
                    assert.equal(updatedMockFa2LoanToken.tokenPoolTotal         , 0);
                    assert.equal(updatedMockFa2LoanToken.totalBorrowed          , 0);
                    assert.equal(updatedMockFa2LoanToken.totalRemaining         , 0);

                    assert.equal(updatedMockFa2LoanToken.optimalUtilisationRate , newOptimalUtilisationRate);
                    assert.equal(updatedMockFa2LoanToken.baseInterestRate       , newBaseInterestRate);
                    assert.equal(updatedMockFa2LoanToken.maxInterestRate        , newMaxInterestRate);
                    
                    assert.equal(updatedMockFa2LoanToken.interestRateBelowOptimalUtilisation       , newInterestRateBelowOptimalUtilisation);
                    assert.equal(updatedMockFa2LoanToken.interestRateAboveOptimalUtilisation       , newInterestRateAboveOptimalUtilisation);

                    assert.equal(updatedMockFa2LoanToken.minRepaymentAmount       , newMinRepaymentAmount);

                }
                
            } catch(e){
                console.log(e);
            } 
        });


        it('non-admin should not be able to set loan token - create', async () => {
            try{
                // Initial Values
                await helperFunctions.signerFactory(tezos, alice.sk);
                lendingControllerStorage = await lendingControllerInstance.storage();
                const currentAdmin = lendingControllerStorage.admin;

                const setLoanTokenActionType                = "createLoanToken";
                const tokenName                             = "failTestLoanToken";
                const tokenContractAddress                  = contractDeployments.mavrykFa2Token.address;
                const tokenType                             = "fa2";
                const tokenDecimals                         = 6;

                const oracleAddress                         = contractDeployments.mockUsdMockFa2TokenAggregator.address;

                const mTokenContractAddress                = contractDeployments.mTokenEurl.address;

                const interestRateDecimals                  = 27;
                const reserveRatio                          = 3000; // 30% reserves (4 decimals)
                const optimalUtilisationRate                = 30 * (10 ** (interestRateDecimals - 2));  // 30% utilisation rate kink
                const baseInterestRate                      = 5  * (10 ** (interestRateDecimals - 2));  // 5%
                const maxInterestRate                       = 25 * (10 ** (interestRateDecimals - 2));  // 25% 
                const interestRateBelowOptimalUtilisation   = 10 * (10 ** (interestRateDecimals - 2));  // 10% 
                const interestRateAboveOptimalUtilisation   = 20 * (10 ** (interestRateDecimals - 2));  // 20%

                const minRepaymentAmount                    = 10000;

                await chai.expect(lendingControllerInstance.methods.setLoanToken(

                    setLoanTokenActionType,
                        
                    tokenName,
                    tokenDecimals,

                    oracleAddress,

                    mTokenContractAddress,
                    
                    reserveRatio,
                    optimalUtilisationRate,
                    baseInterestRate,
                    maxInterestRate,
                    interestRateBelowOptimalUtilisation,
                    interestRateAboveOptimalUtilisation,

                    minRepaymentAmount,
                    
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

        it('non-admin should not be able to set loan token - update', async () => {
            try{
                // Initial Values
                await helperFunctions.signerFactory(tezos, alice.sk);
                lendingControllerStorage = await lendingControllerInstance.storage();
                const currentAdmin = lendingControllerStorage.admin;

                const setLoanTokenActionType                = "updateLoanToken";
                const tokenName                             = "failTestLoanToken";
                const interestRateDecimals                  = 27;
                const newOracleAddress                         = contractDeployments.mockUsdMockFa12TokenAggregator.address;

                const newReserveRatio                          = 2000; // 20% reserves (4 decimals)
                const newOptimalUtilisationRate                = 50 * (10 ** (interestRateDecimals - 2));   // 50% utilisation rate kink
                const newBaseInterestRate                      = 10  * (10 ** (interestRateDecimals - 2));  // 5%
                const newMaxInterestRate                       = 50 * (10 ** (interestRateDecimals - 2));  // 25% 
                const newInterestRateBelowOptimalUtilisation   = 30 * (10 ** (interestRateDecimals - 2));  // 10% 
                const newInterestRateAboveOptimalUtilisation   = 30 * (10 ** (interestRateDecimals - 2));  // 20%
                const newMinRepaymentAmount                    = 20000;
                const isPaused                                 = false;

                await chai.expect(lendingControllerInstance.methods.setLoanToken(

                    setLoanTokenActionType,
                        
                    tokenName,

                    newOracleAddress,

                    newReserveRatio,
                    newOptimalUtilisationRate,
                    newBaseInterestRate,
                    newMaxInterestRate,
                    newInterestRateBelowOptimalUtilisation,
                    newInterestRateAboveOptimalUtilisation,
                    newMinRepaymentAmount,

                    isPaused

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
    // Setup and test Lending Controller setCollateralToken entrypoint - tokens which vault owners can use as collateral
    //
    describe('%setCollateralToken - setup and test lending controller %setCollateralToken entrypoint', function () {

        it('admin can set mock FA12 as collateral token', async () => {

            try{        
                
                // init variables
                await helperFunctions.signerFactory(tezos, bob.sk);

                const setCollateralTokenActionType      = "createCollateralToken";
                const tokenName                         = "usdt";
                const tokenContractAddress              = contractDeployments.mavrykFa12Token.address;
                const tokenType                         = "fa12";

                const tokenDecimals                     = 6;
                const oracleAddress                     = contractDeployments.mockUsdMockFa12TokenAggregator.address;
                const tokenProtected                    = false;
                
                const isScaledToken                     = false;
                const isStakedToken                     = false;
                const stakingContractAddress            = null;
                
                const maxDepositAmount                  = null;
                
                // check if collateral token exists
                const checkCollateralTokenExists   = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

                // only test for first run, as govProxy will be admin instead of bob for subsequent continuous testing 
                if(checkCollateralTokenExists === undefined){

                    const adminSetMockFa12CollateralTokenOperation = await lendingControllerInstance.methods.setCollateralToken(

                        setCollateralTokenActionType,
                        
                        tokenName,
                        tokenContractAddress,
                        tokenDecimals,

                        oracleAddress,
                        tokenProtected,
                        
                        isScaledToken,
                        isStakedToken,
                        stakingContractAddress,

                        maxDepositAmount,

                        // fa12 token type - token contract address
                        tokenType,
                        tokenContractAddress,

                    ).send();
                    await adminSetMockFa12CollateralTokenOperation.confirmation();

                }

                lendingControllerStorage        = await lendingControllerInstance.storage();
                const mockFa12CollateralToken   = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 
            
                assert.equal(mockFa12CollateralToken.tokenName              , tokenName);
                assert.equal(mockFa12CollateralToken.tokenDecimals          , tokenDecimals);
                assert.equal(mockFa12CollateralToken.oracleAddress          , oracleAddress);
                assert.equal(mockFa12CollateralToken.protected              , tokenProtected);

            } catch(e){
                console.log(e);
            } 
        });

        it('admin can set mock FA2 as collateral token', async () => {

            try{        
                
                // init variables
                await helperFunctions.signerFactory(tezos, bob.sk);

                const setCollateralTokenActionType          = "createCollateralToken";
                const tokenName                             = "eurl";
                const tokenContractAddress                  = contractDeployments.mavrykFa2Token.address;
                const tokenType                             = "fa2";

                const tokenDecimals                         = 6;
                const oracleAddress                         = contractDeployments.mockUsdMockFa2TokenAggregator.address;
                const tokenProtected                        = false;
                
                const isScaledToken                         = false;
                const isStakedToken                         = false;
                const stakingContractAddress                = null;
                
                const maxDepositAmount                      = null;
                
                // check if collateral token exists
                const checkCollateralTokenExists   = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

                // only test for first run, as govProxy will be admin instead of bob for subsequent continuous testing 
                if(checkCollateralTokenExists === undefined){

                    const adminSetMockFa2CollateralTokenOperation = await lendingControllerInstance.methods.setCollateralToken(

                        setCollateralTokenActionType,
                        
                        tokenName,
                        tokenContractAddress,
                        tokenDecimals,

                        oracleAddress,
                        tokenProtected,
                        
                        isScaledToken,
                        isStakedToken,
                        stakingContractAddress,

                        maxDepositAmount,

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
                assert.equal(mockFa2CollateralToken.tokenDecimals          , tokenDecimals);
                assert.equal(mockFa2CollateralToken.oracleAddress          , oracleAddress);
                assert.equal(mockFa2CollateralToken.protected              , tokenProtected);


            } catch(e){
                console.log(e);
            } 
        });

        it('admin can set tez as collateral token', async () => {

            try{        
                
                // init variables
                await helperFunctions.signerFactory(tezos, bob.sk);

                const setCollateralTokenActionType          = "createCollateralToken";
                const tokenName                             = "tez";
                const tokenContractAddress                  = zeroAddress;
                const tokenType                             = "tez";

                const tokenDecimals                         = 6;
                const oracleAddress                         = contractDeployments.mockUsdXtzAggregator.address;
                const tokenProtected                        = false;

                const isScaledToken                         = false;
                const isStakedToken                         = false;
                const stakingContractAddress                = null;
                
                const maxDepositAmount                      = null;
                
                // check if collateral token exists
                const checkCollateralTokenExists   = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

                // only test for first run, as govProxy will be admin instead of bob for subsequent continuous testing 
                if(checkCollateralTokenExists === undefined){

                    const adminSetMockFa2CollateralTokenOperation = await lendingControllerInstance.methods.setCollateralToken(

                        setCollateralTokenActionType,
                        
                        tokenName,
                        tokenContractAddress,
                        tokenDecimals,

                        oracleAddress,
                        tokenProtected,

                        isScaledToken,
                        isStakedToken,
                        stakingContractAddress,

                        maxDepositAmount,
                        
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
                assert.equal(mockFa2CollateralToken.tokenDecimals          , tokenDecimals);
                assert.equal(mockFa2CollateralToken.oracleAddress          , oracleAddress);
                assert.equal(mockFa2CollateralToken.protected              , tokenProtected);


            } catch(e){
                console.log(e);
            } 
        });


        it('admin can set staked MVK as a collateral token', async () => {

            try{        
                
                // init variables
                await helperFunctions.signerFactory(tezos, bob.sk);

                const setCollateralTokenActionType      = "createCollateralToken";
                const tokenName                         = "smvk";
                const tokenContractAddress              = contractDeployments.mvkToken.address;
                const tokenType                         = "fa2";

                const tokenDecimals                     = 9;
                const oracleAddress                     = contractDeployments.mockUsdMvkAggregator.address;
                const tokenProtected                    = true; // sMVK is protected

                const isScaledToken                     = false;
                const isStakedToken                     = true;
                const stakingContractAddress            = contractDeployments.doorman.address;
                
                const maxDepositAmount                  = null;
                
                // check if collateral token exists
                const checkCollateralTokenExists   = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

                // only test for first run, as govProxy will be admin instead of bob for subsequent continuous testing 
                if(checkCollateralTokenExists === undefined){

                    const adminSetMockFa12CollateralTokenOperation = await lendingControllerInstance.methods.setCollateralToken(

                        setCollateralTokenActionType,
                        
                        tokenName,
                        tokenContractAddress,
                        tokenDecimals,

                        oracleAddress,
                        tokenProtected,

                        isScaledToken,
                        isStakedToken,
                        stakingContractAddress,

                        maxDepositAmount,

                        // fa12 token type - token contract address
                        tokenType,
                        tokenContractAddress,
                        tokenId

                    ).send();
                    await adminSetMockFa12CollateralTokenOperation.confirmation();

                }

                lendingControllerStorage   = await lendingControllerInstance.storage();
                const stakedMvkCollateralTokenRecord       = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 
            
                assert.equal(stakedMvkCollateralTokenRecord.tokenName              , tokenName);
                assert.equal(stakedMvkCollateralTokenRecord.tokenDecimals          , tokenDecimals);
                assert.equal(stakedMvkCollateralTokenRecord.oracleAddress          , oracleAddress);
                assert.equal(stakedMvkCollateralTokenRecord.protected              , tokenProtected);
                

            } catch(e){
                console.log(e);
            } 
        });


        it('admin should be able to update collateral token', async () => {

            try{        
                
                // init variables
                await helperFunctions.signerFactory(tezos, bob.sk);

                const createCollateralTokenActionType       = "createCollateralToken";
                const tokenName                             = "testUpdateCollateralToken";
                const tokenContractAddress                  = contractDeployments.mavrykFa2Token.address;
                const tokenType                             = "fa2";

                const tokenDecimals                         = 6;
                const oracleAddress                         = contractDeployments.mockUsdMockFa2TokenAggregator.address;
                const tokenProtected                        = false;
                
                const isScaledToken                         = false;
                const isStakedToken                         = false;
                const stakingContractAddress                = null;
                
                const maxDepositAmount                      = null;
                
                
                // check if collateral token exists
                const checkCollateralTokenExists   = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

                // only test for first run, as govProxy will be admin instead of bob for subsequent continuous testing 
                if(checkCollateralTokenExists === undefined){

                    const adminSetMockFa2CollateralTokenOperation = await lendingControllerInstance.methods.setCollateralToken(

                        createCollateralTokenActionType,
                        
                        tokenName,
                        tokenContractAddress,
                        tokenDecimals,

                        oracleAddress,
                        tokenProtected,
                        
                        isScaledToken,
                        isStakedToken,
                        stakingContractAddress,

                        maxDepositAmount,

                        // fa2 token type - token contract address + token id
                        tokenType,
                        tokenContractAddress,
                        tokenId

                    ).send();
                    await adminSetMockFa2CollateralTokenOperation.confirmation();

                    lendingControllerStorage        = await lendingControllerInstance.storage();
                    const mockFa2CollateralToken    = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 
    
                    assert.equal(mockFa2CollateralToken.tokenName              , tokenName);
                    assert.equal(mockFa2CollateralToken.tokenDecimals          , tokenDecimals);
                    assert.equal(mockFa2CollateralToken.oracleAddress          , oracleAddress);
                    assert.equal(mockFa2CollateralToken.protected              , tokenProtected);

                }

                // only test for first run, as govProxy will be admin instead of bob for subsequent continuous testing 
                if(checkCollateralTokenExists === undefined){
                        
                    const updateCollateralTokenActionType       = "updateCollateralToken";
                    const newOracleAddress                      = contractDeployments.mockUsdMockFa12TokenAggregator.address;
                    const stakingContractAddress                = null;
                    const maxDepositAmount                      = null;
                    const isPaused                              = false;
                    
                    const adminSetMockFa2CollateralTokenOperation = await lendingControllerInstance.methods.setCollateralToken(

                        updateCollateralTokenActionType,
                        
                        tokenName,
                        newOracleAddress,
                        isPaused,

                        stakingContractAddress,
                        maxDepositAmount

                    ).send();
                    await adminSetMockFa2CollateralTokenOperation.confirmation();

                    lendingControllerStorage               = await lendingControllerInstance.storage();
                    const updatedMockFa2CollateralToken    = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

                    // oracle address should be updated, and there should be no changes to other variables
                    assert.equal(updatedMockFa2CollateralToken.oracleAddress   , newOracleAddress);
                    assert.equal(updatedMockFa2CollateralToken.tokenName       , tokenName);
                    assert.equal(updatedMockFa2CollateralToken.tokenDecimals   , tokenDecimals);
                    assert.equal(updatedMockFa2CollateralToken.protected       , tokenProtected);

                }

            } catch(e){
                console.log(e);
            } 
        });


        it('non-admin should not be able to set collateral token - create', async () => {
            try{
                // Initial Values
                await helperFunctions.signerFactory(tezos, alice.sk);
                lendingControllerStorage = await lendingControllerInstance.storage();
                const currentAdmin = lendingControllerStorage.admin;

                const setCollateralTokenActionType          = "createCollateralToken";
                const tokenName                             = "failTestCollateralToken";
                const tokenContractAddress                  = contractDeployments.mavrykFa2Token.address;
                const tokenType                             = "fa2";

                const tokenDecimals                         = 6;
                const oracleAddress                         = zeroAddress;
                const tokenProtected                        = false;

                const isScaledToken                         = false;
                const isStakedToken                         = false;
                const stakingContractAddress                = null;
                
                const maxDepositAmount                      = null;
            
                await chai.expect(lendingControllerInstance.methods.setCollateralToken(

                    setCollateralTokenActionType,
                        
                    tokenName,
                    tokenContractAddress,
                    tokenDecimals,

                    oracleAddress,
                    tokenProtected,
                    
                    isScaledToken,
                    isStakedToken,
                    stakingContractAddress,

                    maxDepositAmount,
                    
                    // fa2 token type - token contract address + token id
                    tokenType,
                    tokenContractAddress,
                    tokenId

                ).send()).to.be.rejected;

                // Final values
                lendingControllerStorage        = await lendingControllerInstance.storage();
                const failTestCollateralToken   = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

                // Assertions
                assert.strictEqual(failTestCollateralToken, undefined);

            } catch(e){
                console.log(e);
            }
        });

        it('non-admin should not be able to set collateral token - update', async () => {
            try{
                // Initial Values
                await helperFunctions.signerFactory(tezos, alice.sk);
                lendingControllerStorage = await lendingControllerInstance.storage();
                const currentAdmin = lendingControllerStorage.admin;

                const setCollateralTokenActionType          = "updateCollateralToken";
                const tokenName                             = "failTestCollateralToken";
                const tokenContractAddress                  = contractDeployments.mavrykFa2Token.address;
                const tokenType                             = "fa2";

                const tokenDecimals                         = 6;
                const oracleAddress                         = zeroAddress;
                const stakingContractAddress                = null;
                const maxDepositAmount                      = null;
                const isPaused                              = false;
            
                await chai.expect(lendingControllerInstance.methods.setCollateralToken(

                    setCollateralTokenActionType,

                    tokenName,
                    oracleAddress,
                    isPaused, 

                    stakingContractAddress,
                    maxDepositAmount

                ).send()).to.be.rejected;

                // Final values
                lendingControllerStorage        = await lendingControllerInstance.storage();
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
    describe('%setAdmin - Lending Controller and Vault Controller', function () {
    
        it('admin can set admin for lending controller', async () => {
            try{        
        
                await helperFunctions.signerFactory(tezos, bob.sk);
                const previousAdmin = lendingControllerStorage.admin;
                
                if(previousAdmin == bob.pkh){
                    
                    assert.equal(previousAdmin, bob.pkh);
                    const setNewAdminOperation = await lendingControllerInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                    await setNewAdminOperation.confirmation();

                    const updatedLendingControllerStorage = await lendingControllerInstance.storage();
                    const newAdmin = updatedLendingControllerStorage.admin;

                    assert.equal(newAdmin, contractDeployments.governanceProxy.address);
                };

            } catch(e){
                console.log(e);
            } 

        });   


        it('admin can set admin for vault factory', async () => {
            try{        
        
                await helperFunctions.signerFactory(tezos, bob.sk);
                const previousAdmin = vaultFactoryStorage.admin;
                
                if(previousAdmin == bob.pkh){
                    
                    assert.equal(previousAdmin, bob.pkh);
                    const setNewAdminOperation = await vaultFactoryInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                    await setNewAdminOperation.confirmation();

                    const updatedVaultFactoryStorage = await vaultFactoryInstance.storage();
                    const newAdmin = updatedVaultFactoryStorage.admin;

                    assert.equal(newAdmin, contractDeployments.governanceProxy.address);
                };

            } catch(e){
                console.log(e);
            } 

        });   


        it('non-admin cannot set admin for lending controller', async () => {
            try{        
        
                await helperFunctions.signerFactory(tezos, mallory.sk);
        
                    const failSetNewAdminOperation = await lendingControllerInstance.methods.setAdmin(contractDeployments.governanceProxy.address);
                    await chai.expect(failSetNewAdminOperation.send()).to.be.rejected;    

                    const updatedLendingControllerStorage = await lendingControllerInstance.storage();
                    const admin = updatedLendingControllerStorage.admin;
                    assert.equal(admin, contractDeployments.governanceProxy.address);

            } catch(e){
                console.log(e);
            } 

        });   


        it('non-admin cannot set admin for vault factory', async () => {
            try{        
        
                await helperFunctions.signerFactory(tezos, mallory.sk);
        
                    const failSetNewAdminOperation = await vaultFactoryInstance.methods.setAdmin(contractDeployments.governanceProxy.address);
                    await chai.expect(failSetNewAdminOperation.send()).to.be.rejected;    

                    const updatedVaultFactoryStorage = await vaultFactoryInstance.storage();
                    const admin = updatedVaultFactoryStorage.admin;
                    assert.equal(admin, contractDeployments.governanceProxy.address);

            } catch(e){
                console.log(e);
            } 

        });   
    })

    // 
    // Test: Create vaults - loan token - loan tokens: MockFA12 Tokens, MockFA2 Tokens, Tez
    //
    describe('%createVault test: create vaults - loan tokens: MockFA12 Tokens, MockFA2 Tokens, Tez', function () {

        it('user (eve) can create a new vault (depositors: any) with no tez - LOAN TOKEN: MockFA12 (USDT)', async () => {
            try{        
                
                // init variables
                await helperFunctions.signerFactory(tezos, eve.sk);
                const vaultId               = vaultFactoryStorage.vaultCounter.toNumber();
                const vaultOwner            = eve.pkh;
                const vaultName             = "newVault";
                const loanTokenName         = "usdt";
                
                const depositorsConfig      = "any";

                const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
                    baker.pkh,              // delegate to
                    loanTokenName,          // loan token name
                    vaultName,              // vault name
                    null,                   // collateral tokens
                    depositorsConfig        // depositors config type - any / whitelist
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

                assert.equal(vaultOriginatedContractStorage.admin , contractDeployments.vaultFactory.address);

                // push new vault id to vault set
                eveVaultSet.push(vaultId);

            } catch(e){
                console.log(e);
            } 

        });    

        it('user (mallory) can create a new vault (depositors: whitelist set) with no tez - LOAN TOKEN: MockFA12 (USDT)', async () => {
            try{        

                // init variables
                await helperFunctions.signerFactory(tezos, mallory.sk);
                const vaultFactoryStorage       = await vaultFactoryInstance.storage();
                const vaultId                   = vaultFactoryStorage.vaultCounter.toNumber();
                const vaultOwner                = mallory.pkh;
                const vaultName                 = "newVault";
                const loanTokenName             = "usdt";

                const depositorsConfig          = "whitelist";

                const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
                    baker.pkh,  
                    loanTokenName,
                    vaultName,
                    null,
                    depositorsConfig,
                    []
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

                assert.equal(vaultOriginatedContractStorage.admin , contractDeployments.vaultFactory.address);

                // push new vault id to vault set
                malloryVaultSet.push(vaultId);

            } catch(e){
                console.log(e);
            } 

        });    
    


        it('user (mallory) can create a new vault (depositors: any) - LOAN TOKEN: MockFA2', async () => {
            try{        
                
                // init variables
                await helperFunctions.signerFactory(tezos, mallory.sk);
                const vaultFactoryStorage       = await vaultFactoryInstance.storage();
                const vaultId                   = vaultFactoryStorage.vaultCounter.toNumber();
                const vaultOwner                = mallory.pkh;
                const vaultName                 = "newVault";
                const loanTokenName             = "eurl";

                const depositorsConfig          = "any";

                const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
                    baker.pkh,  
                    loanTokenName,
                    vaultName,
                    null,
                    depositorsConfig
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

                assert.equal(vaultOriginatedContractStorage.admin , contractDeployments.vaultFactory.address);

                // push new vault id to vault set
                malloryVaultSet.push(vaultId);

            } catch(e){
                console.log(e);
            } 

        });    

        it('user (eve) can create a new vault (depositors: whitelist set) - LOAN TOKEN: MockFA2', async () => {
            try{        
                
                // init variables
                await helperFunctions.signerFactory(tezos, eve.sk);
                const vaultFactoryStorage       = await vaultFactoryInstance.storage();
                const vaultId                   = vaultFactoryStorage.vaultCounter.toNumber();
                const vaultOwner                = eve.pkh;
                const vaultName                 = "newVault";
                const loanTokenName             = "eurl";

                const depositorsConfig          = "whitelist";

                const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
                    baker.pkh,  
                    loanTokenName,
                    vaultName,
                    null,
                    depositorsConfig,
                    []
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

                assert.equal(vaultOriginatedContractStorage.admin , contractDeployments.vaultFactory.address);

                // push new vault id to vault set
                eveVaultSet.push(vaultId);

            } catch(e){
                console.log(e);
            } 

        });    


        it('user (eve) can create a new vault (depositors: whitelist set) - LOAN TOKEN: TEZ', async () => {
            try{        
                
                // init variables
                await helperFunctions.signerFactory(tezos, eve.sk);
                const vaultFactoryStorage       = await vaultFactoryInstance.storage();
                const vaultId                   = vaultFactoryStorage.vaultCounter.toNumber();
                const vaultOwner                = eve.pkh;
                const vaultName                 = "newVault";
                const loanTokenName             = "tez";

                const depositorsConfig          = "whitelist";

                // user (eve) creates a new vault
                const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
                    baker.pkh,  
                    loanTokenName,
                    vaultName,
                    null,
                    depositorsConfig,
                    []
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

                assert.equal(vaultOriginatedContractStorage.admin , contractDeployments.vaultFactory.address);
                
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
    describe('%deposit test: deposit tez into vault', function () {
    
        it('user (eve) can deposit tez into her vaults', async () => {
            
            // init variables
            await helperFunctions.signerFactory(tezos, eve.sk);
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

            const eveDepositTezOperation  = await eveVaultInstance.methods.initVaultAction(
                "deposit",             // vault action types     
                depositAmountMutez,    // amt
                "tez"                  // token
            ).send({ mutez : true, amount : depositAmountMutez });
            await eveDepositTezOperation.confirmation();

            const updatedLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedVault                    = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const tezCollateralBalance            = await updatedVault.collateralBalanceLedger.get('tez');
            
            assert.equal(tezCollateralBalance, TEZ(depositAmountTez));

            // deposit into second and third vaults for borrow tests below
            
            // second vault
            const secondVaultId = eveVaultSet[1];
            const secondVaultHandle = {
                "id"     : secondVaultId,
                "owner"  : vaultOwner
            };

            const secondVault                    = await lendingControllerStorage.vaults.get(secondVaultHandle);

            // get vault contract
            const secondVaultAddress             = secondVault.address;
            const eveSecondVaultInstance         = await utils.tezos.contract.at(secondVaultAddress);
            const eveDepositTezIntoSecondVaultOperation  = await eveSecondVaultInstance.methods.initVaultAction(
                "deposit",              // vault action type
                depositAmountMutez,     // amt
                "tez"                   // token
            ).send({ mutez : true, amount : depositAmountMutez });
            await eveDepositTezIntoSecondVaultOperation.confirmation();

            // third vault
            const thirdVaultId = eveVaultSet[2];
            const thirdVaultHandle = {
                "id"     : thirdVaultId,
                "owner"  : vaultOwner
            };

            const thirdVault                    = await lendingControllerStorage.vaults.get(thirdVaultHandle);

            // get vault contract
            const thirdVaultAddress             = thirdVault.address;
            const eveThirdVaultInstance         = await utils.tezos.contract.at(thirdVaultAddress);
            const eveDepositTezIntoThirdVaultOperation  = await eveThirdVaultInstance.methods.initVaultAction(
                "deposit",                  // vault action type
                depositAmountMutez,         // amt
                "tez"                       // token
            ).send({ mutez : true, amount : depositAmountMutez });
            await eveDepositTezIntoThirdVaultOperation.confirmation();

        });

        it('user (mallory) can deposit tez into user (eve)\'s vault (depositors: any)', async () => {
            
            // init variables
            await helperFunctions.signerFactory(tezos, mallory.sk);
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

            const malloryDepositTezIntoEveVaultOperation  = await eveVaultInstance.methods.initVaultAction(
                "deposit",            // vault action type  
                depositAmountMutez,   // amt
                "tez"                 // token
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
            await helperFunctions.signerFactory(tezos, mallory.sk);
            const vaultId            = malloryVaultSet[0];
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
    
            const malloryDepositTezOperation  = await vaultInstance.methods.initVaultAction(
                "deposit",              // vault action type
                depositAmountMutez,     // amt
                "tez"                   // token
            ).send({ mutez : true, amount : depositAmountMutez });
            await malloryDepositTezOperation.confirmation();
    
            const updatedLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedVault                    = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const tezCollateralBalance            = await updatedVault.collateralBalanceLedger.get('tez');
            
            assert.equal(tezCollateralBalance, TEZ(depositAmountTez));
    
        });
    
        it('user (eve) cannot deposit tez into user (mallory)\'s vault (depositors: whitelist set)', async () => {
                
            // init variables
            await helperFunctions.signerFactory(tezos, eve.sk);
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
    
            const failEveDepositTezIntoMalloryVaultOperation  = await vaultInstance.methods.initVaultAction(
                "deposit",              // vault action type
                depositAmountMutez,     // amt
                "tez"                   // token
            );
            await chai.expect(failEveDepositTezIntoMalloryVaultOperation.send({ mutez : true, amount : depositAmountMutez })).to.be.rejected;    
    
        });

    }); // end test: deposit tez into vault



    // 
    // Test: Deposit Mock FA12 Tokens into vault
    //
    describe('%deposit test: deposit mock FA12 tokens into vault', function () {
    
        it('user (eve) can deposit mock FA12 tokens into her vault (depositors: any)', async () => {
    
            // init variables
            await helperFunctions.signerFactory(tezos, eve.sk);
            const vaultId            = eveVaultSet[0];
            const vaultOwner         = eve.pkh;

            const tokenName          = "usdt";
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
            const vaultInstance             = await utils.tezos.contract.at(vaultAddress);

            // get mock fa12 token storage
            const mockFa12TokenStorage              = await mockFa12TokenInstance.storage();
            
            // get initial eve's Mock FA12 Token balance
            const eveMockFa12Ledger                 = await mockFa12TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMockFa12TokenBalance    = eveMockFa12Ledger == undefined ? 0 : eveMockFa12Ledger.balance.toNumber();

            // get initial vault's Mock FA12 Token balance
            const vaultMockFa12Ledger                = await mockFa12TokenStorage.ledger.get(vaultAddress);            
            const vaultInitialMockFa12TokenBalance   = vaultMockFa12Ledger == undefined ? 0 : vaultMockFa12Ledger.balance.toNumber();

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
            const eveDepositMockFa12TokenOperation  = await vaultInstance.methods.initVaultAction(
                "deposit",
                depositAmount,          
                tokenName
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
            await helperFunctions.signerFactory(tezos, mallory.sk);
            const vaultId            = eveVaultSet[0];
            const vaultOwner         = eve.pkh;

            const tokenName          = "usdt";
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
            const malloryInitialMockFa12TokenBalance = malloryMockFa12Ledger == undefined ? 0 : malloryMockFa12Ledger.balance.toNumber();

            // get initial vault's Mock FA12 Token balance
            const vaultMockFa12Ledger                = await mockFa12TokenStorage.ledger.get(vaultAddress);            
            const vaultInitialMockFa12TokenBalance   = vaultMockFa12Ledger == undefined ? 0 : vaultMockFa12Ledger.balance.toNumber();        

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
            const malloryDepositMockFa12TokenOperation  = await vaultInstance.methods.initVaultAction(
                "deposit",
                depositAmount,             
                tokenName
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
            await helperFunctions.signerFactory(tezos, eve.sk);
            const vaultId        = eveVaultSet[0];
            const vaultOwner     = eve.pkh;
            const tokenName      = "usdt";
    
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
            const failEveDepositTezAndMockFa12TokenOperation  = await vaultInstance.methods.initVaultAction(
                "deposit",
                depositAmount,              
                tokenName
            );
            await chai.expect(failEveDepositTezAndMockFa12TokenOperation.send({ mutez : true, amount : depositAmount })).to.be.rejected;    
    
        });


        it('user (mallory) can deposit mock FA12 tokens into her vault (depositors: whitelist set)', async () => {
    
            // init variables
            await helperFunctions.signerFactory(tezos, mallory.sk);
            const vaultId            = malloryVaultSet[0];
            const vaultOwner         = mallory.pkh;

            const tokenName          = "usdt";
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
            const malloryInitialMockFa12TokenBalance = malloryMockFa12Ledger == undefined ? 0 : malloryMockFa12Ledger.balance.toNumber();

            // get initial vault's Mock FA12 Token balance
            const vaultMockFa12Ledger                = await mockFa12TokenStorage.ledger.get(vaultAddress);            
            const vaultInitialMockFa12TokenBalance   = vaultMockFa12Ledger == undefined ? 0 : vaultMockFa12Ledger.balance.toNumber();        
            
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
            const malloryDepositMockFa12TokenOperation  = await vaultInstance.methods.initVaultAction(
                "deposit",
                depositAmount,                         
                tokenName
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
            await helperFunctions.signerFactory(tezos, eve.sk);
            const vaultId            = malloryVaultSet[0];
            const vaultOwner         = mallory.pkh;
            const tokenName          = "usdt";
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
            const failDepositMockFa12TokenOperation  = await vaultInstance.methods.initVaultAction(
                "deposit",
                depositAmount,
                tokenName
            );
            await chai.expect(failDepositMockFa12TokenOperation.send()).to.be.rejected;    
    
        });

        it('user (mallory) cannot deposit tez and mock FA12 tokens into her vault (depositors: whitelist set) at the same time', async () => {
    
            // init variables
            await helperFunctions.signerFactory(tezos, mallory.sk);
            const vaultId            = malloryVaultSet[0];
            const vaultOwner         = mallory.pkh;
            const tokenName          = "usdt";
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
            const failDepositTezAndMockFa12TokenOperation  = await vaultInstance.methods.initVaultAction(
                "deposit",
                depositAmount, 
                tokenName
            );
            await chai.expect(failDepositTezAndMockFa12TokenOperation.send({ mutez : true, amount : depositAmount })).to.be.rejected;    
    
        });


    }); // end test: deposit mock FA12 tokens into vault



    // 
    // Test: Deposit Mock FA2 Tokens into vault
    //
    describe('%deposit test: deposit mock FA2 tokens into vault', function () {
    
        it('user (eve) can deposit mock FA2 tokens into her vault (depositors: any)', async () => {
    
            // init variables
            await helperFunctions.signerFactory(tezos, eve.sk);
            const vaultId            = eveVaultSet[0];
            const vaultOwner         = eve.pkh;
            const tokenName          = "eurl";
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
            const eveInitialMockFa2TokenBalance    = eveMockFa2Ledger == undefined ? 0 : eveMockFa2Ledger.toNumber();

            // get initial vault's Mock FA2 Token balance
            const vaultMockFa2Ledger                = await mockFa2TokenStorage.ledger.get(vaultAddress);            
            const vaultInitialMockFa2TokenBalance   = vaultMockFa2Ledger == undefined ? 0 : vaultMockFa2Ledger.toNumber();

            // get initial vault collateral token balance
            const vaultInitialTokenCollateralBalance = vault.collateralBalanceLedger.get(tokenName) == undefined ? 0 : vault.collateralBalanceLedger.get(tokenName).toNumber();

            // update operators for vault
            updateOperatorsOperation = await helperFunctions.updateOperators(mockFa2TokenInstance, eve.pkh, vaultAddress, tokenId);
            await updateOperatorsOperation.confirmation();

            // eve deposits mock FA2 tokens into vault
            const eveDepositTokenOperation  = await vaultInstance.methods.initVaultAction(
                "deposit",
                depositAmount, 
                tokenName
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
            await helperFunctions.signerFactory(tezos, mallory.sk);
            const vaultId            = eveVaultSet[0];
            const vaultOwner         = eve.pkh;
            const tokenName          = "eurl";
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
            const malloryInitialMockFa2TokenBalance    = malloryMockFa2Ledger == undefined ? 0 : malloryMockFa2Ledger.toNumber();

            // get initial vault's Mock FA2 Token balance
            const vaultMockFa2Ledger                = await mockFa2TokenStorage.ledger.get(vaultAddress);            
            const vaultInitialMockFa2TokenBalance   = vaultMockFa2Ledger == undefined ? 0 : vaultMockFa2Ledger.toNumber();

            // get initial vault collateral token balance
            const vaultInitialTokenCollateralBalance = vault.collateralBalanceLedger.get(tokenName) == undefined ? 0 : vault.collateralBalanceLedger.get(tokenName).toNumber();

            // update operators for vault
            updateOperatorsOperation = await helperFunctions.updateOperators(mockFa2TokenInstance, mallory.pkh, vaultAddress, tokenId);
            await updateOperatorsOperation.confirmation();

            // mallory deposits mock FA2 tokens into vault
            const malloryDepositTokenOperation  = await vaultInstance.methods.initVaultAction(
                "deposit",
                depositAmount,                      
                tokenName
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
            await helperFunctions.signerFactory(tezos, eve.sk);
            const vaultId            = eveVaultSet[0];
            const vaultOwner         = eve.pkh;
            const tokenName          = "eurl";
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
            updateOperatorsOperation = await helperFunctions.updateOperators(mockFa2TokenInstance, eve.pkh, vaultAddress, tokenId);
            await updateOperatorsOperation.confirmation();
            
            // eve fails to deposit tez and mock FA2 tokens into vault at the same time
            const failDepositTezAndMockFa2TokenOperation  = await vaultInstance.methods.initVaultAction(
                "deposit",
                depositAmount,
                tokenName
            );
            await chai.expect(failDepositTezAndMockFa2TokenOperation.send({ mutez : true, amount : depositAmount })).to.be.rejected;    
    
        });


        it('user (mallory) can deposit mock FA2 tokens into her vault (depositors: whitelist set)', async () => {
    
            // init variables
            await helperFunctions.signerFactory(tezos, mallory.sk);
            const vaultId            = malloryVaultSet[0];
            const vaultOwner         = mallory.pkh;
            const tokenName          = "eurl";
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
            const malloryInitialMockFa2TokenBalance    = malloryMockFa2Ledger == undefined ? 0 : malloryMockFa2Ledger.toNumber();

            // get initial vault's Mock FA2 Token balance
            const vaultMockFa2Ledger                = await mockFa2TokenStorage.ledger.get(vaultAddress);            
            const vaultInitialMockFa2TokenBalance   = vaultMockFa2Ledger == undefined ? 0 : vaultMockFa2Ledger.toNumber();

            // get initial vault collateral token balance
            const vaultInitialTokenCollateralBalance = vault.collateralBalanceLedger.get(tokenName) == undefined ? 0 : vault.collateralBalanceLedger.get(tokenName).toNumber();

            // update operators for vault
            updateOperatorsOperation = await helperFunctions.updateOperators(mockFa2TokenInstance, mallory.pkh, vaultAddress, tokenId);
            await updateOperatorsOperation.confirmation();

            // mallory deposits mock FA2 tokens into vault
            const malloryDepositTokenOperation  = await vaultInstance.methods.initVaultAction(
                "deposit",
                depositAmount,  
                tokenName
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
            await helperFunctions.signerFactory(tezos, eve.sk);
            const vaultId            = malloryVaultSet[0];
            const vaultOwner         = mallory.pkh;
            const tokenName          = "eurl";
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
            updateOperatorsOperation = await helperFunctions.updateOperators(mockFa2TokenInstance, eve.pkh, vaultAddress, tokenId);
            await updateOperatorsOperation.confirmation();
    
            // eve fails to deposit tez and mock FA2 tokens into vault at the same time
            const failDepositMockFa2TokenOperation  = await vaultInstance.methods.initVaultAction(
                "deposit",
                depositAmount, 
                tokenName
            );
            await chai.expect(failDepositMockFa2TokenOperation.send()).to.be.rejected;    
    
        });


        it('user (mallory) cannot deposit tez and mock FA2 tokens into her vault (depositors: whitelist set) at the same time', async () => {
    
            // init variables
            await helperFunctions.signerFactory(tezos, mallory.sk);
            const vaultId            = malloryVaultSet[0];
            const vaultOwner         = mallory.pkh;

            const tokenName          = "eurl";
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
            updateOperatorsOperation = await helperFunctions.updateOperators(mockFa2TokenInstance, mallory.pkh, vaultAddress, tokenId);
            await updateOperatorsOperation.confirmation();
    
            // eve fails to deposit tez and mock FA2 tokens into vault at the same time
            const failDepositTezAndMockFa2TokenOperation  = await vaultInstance.methods.initVaultAction(
                "deposit",
                depositAmount,         
                tokenName
            );
            await chai.expect(failDepositTezAndMockFa2TokenOperation.send({ mutez : true, amount : depositAmount })).to.be.rejected;    
    
        });

    }); // end test: deposit mock FA2 tokens into vault



    // 
    // Test: Add Liquidity into Lending Pool
    //
    describe('%addLiquidity', function () {
    
        it('user (eve) can add liquidity for mock FA12 token into Lending Controller token pool (10 MockFA12 Tokens)', async () => {
            try{

            // init variables
            await helperFunctions.signerFactory(tezos, eve.sk);
            const loanTokenName   = "usdt";
            const liquidityAmount = 10000000; // 10 Mock FA12 Tokens

            lendingControllerStorage = await lendingControllerInstance.storage();
            
            // get mock fa12 token storage and lp token pool mock fa12 token storage
            const mockFa12TokenStorage                = await mockFa12TokenInstance.storage();
            const mTokenPoolMockFa12TokenStorage      = await mTokenUsdtInstance.storage();
            
            // get initial eve's Mock FA12 Token balance
            const eveMockFa12Ledger                   = await mockFa12TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMockFa12TokenBalance      = eveMockFa12Ledger == undefined ? 0 : eveMockFa12Ledger.balance.toNumber();

            // get initial eve's mEurl Token - Mock FA12 Token - balance
            const eveMUsdtTokenLedger                 = await mTokenPoolMockFa12TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMUsdtTokenTokenBalance    = eveMUsdtTokenLedger == undefined ? 0 : eveMUsdtTokenLedger.toNumber();

            // get initial lending controller's Mock FA12 Token balance
            const lendingControllerMockFa12Ledger                = await mockFa12TokenStorage.ledger.get(contractDeployments.lendingController.address);            
            const lendingControllerInitialMockFa12TokenBalance   = lendingControllerMockFa12Ledger == undefined ? 0 : lendingControllerMockFa12Ledger.balance.toNumber();

            // get initial lending controller token pool total
            const initialLoanTokenRecord                 = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
            const lendingControllerInitialTokenPoolTotal = initialLoanTokenRecord.tokenPoolTotal.toNumber();

            // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
            // reset token allowance
            const resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
                contractDeployments.lendingController.address,
                0
            ).send();
            await resetTokenAllowance.confirmation();

            // set new token allowance
            const setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
                contractDeployments.lendingController.address,
                liquidityAmount
            ).send();
            await setNewTokenAllowance.confirmation();

            // eve deposits mock FA12 tokens into lending controller token pool
            const eveDepositTokenOperation  = await lendingControllerInstance.methods.addLiquidity(
                loanTokenName,
                liquidityAmount
            ).send();
            await eveDepositTokenOperation.confirmation();

            // get updated storages
            const updatedLendingControllerStorage         = await lendingControllerInstance.storage();
            const updatedMockFa12TokenStorage             = await mockFa12TokenInstance.storage();
            const updatedMUsdtTokenTokenStorage  = await mTokenUsdtInstance.storage();

            // check new balance for loan token pool total
            const updatedLoanTokenRecord           = await updatedLendingControllerStorage.loanTokenLedger.get(loanTokenName);
            assert.equal(updatedLoanTokenRecord.tokenPoolTotal, lendingControllerInitialTokenPoolTotal + liquidityAmount);

            // check Eve's Mock FA12 Token balance
            const updatedEveMockFa12Ledger         = await updatedMockFa12TokenStorage.ledger.get(eve.pkh);            
            assert.equal(updatedEveMockFa12Ledger.balance, eveInitialMockFa12TokenBalance - liquidityAmount);

            // check Lending Controller's Mock FA12 Token Balance
            const lendingControllerMockFa12Account  = await updatedMockFa12TokenStorage.ledger.get(contractDeployments.lendingController.address);            
            assert.equal(lendingControllerMockFa12Account.balance, lendingControllerInitialMockFa12TokenBalance + liquidityAmount);

            // check Eve's mUsdt Token Token balance
            const updatedEveMUsdtTokenLedger        = await updatedMUsdtTokenTokenStorage.ledger.get(eve.pkh);            
            assert.equal(updatedEveMUsdtTokenLedger, eveInitialMUsdtTokenTokenBalance + liquidityAmount);        

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        });

        it('user (eve) can add liquidity for mock FA2 token into Lending Controller token pool (10 MockFA2 Tokens)', async () => {
    
            // init variables
            await helperFunctions.signerFactory(tezos, eve.sk);
            const loanTokenName = "eurl";
            const liquidityAmount = 10000000; // 10 Mock FA2 Tokens

            lendingControllerStorage = await lendingControllerInstance.storage();
            
            // get mock fa2 token storage and lp token pool mock fa2 token storage
            const mockFa2TokenStorage              = await mockFa2TokenInstance.storage();
            const mTokenPoolMockFa2TokenStorage   = await mTokenEurlInstance.storage();
            
            // get initial eve's Mock FA2 Token balance
            const eveMockFa2Ledger                 = await mockFa2TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMockFa2TokenBalance    = eveMockFa2Ledger == undefined ? 0 : eveMockFa2Ledger.toNumber();

            // get initial eve's mEurl Token - Mock FA2 Token - balance
            const eveMEurlTokenLedger                 = await mTokenPoolMockFa2TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMEurlTokenTokenBalance    = eveMEurlTokenLedger == undefined ? 0 : eveMEurlTokenLedger.toNumber();

            // get initial lending controller's Mock FA2 Token balance
            const lendingControllerMockFa2Ledger                = await mockFa2TokenStorage.ledger.get(contractDeployments.lendingController.address);            
            const lendingControllerInitialMockFa2TokenBalance   = lendingControllerMockFa2Ledger == undefined ? 0 : lendingControllerMockFa2Ledger.toNumber();

            // get initial lending controller token pool total
            const initialLoanTokenRecord                 = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
            const lendingControllerInitialTokenPoolTotal = initialLoanTokenRecord.tokenPoolTotal.toNumber();

            // update operators for vault
            updateOperatorsOperation = await helperFunctions.updateOperators(mockFa2TokenInstance, eve.pkh, contractDeployments.lendingController.address, tokenId);
            await updateOperatorsOperation.confirmation();

            // eve deposits mock FA12 tokens into lending controller token pool
            const eveDepositTokenOperation  = await lendingControllerInstance.methods.addLiquidity(
                loanTokenName,
                liquidityAmount
            ).send();
            await eveDepositTokenOperation.confirmation();

            // get updated storages
            const updatedLendingControllerStorage  = await lendingControllerInstance.storage();
            const updatedMockFa2TokenStorage       = await mockFa2TokenInstance.storage();
            
            const updatedMEurlTokenTokenStorage     = await mTokenEurlInstance.storage();

            // check new balance for loan token pool total
            const updatedLoanTokenRecord           = await updatedLendingControllerStorage.loanTokenLedger.get(loanTokenName);
            assert.equal(updatedLoanTokenRecord.tokenPoolTotal, lendingControllerInitialTokenPoolTotal + liquidityAmount);

            // check Eve's Mock FA12 Token balance
            const updatedEveMockFa2Ledger          = await updatedMockFa2TokenStorage.ledger.get(eve.pkh);            
            assert.equal(updatedEveMockFa2Ledger, eveInitialMockFa2TokenBalance - liquidityAmount);

            // check Lending Controller's Mock FA2 Token Balance
            const lendingControllerMockFa2Account             = await updatedMockFa2TokenStorage.ledger.get(contractDeployments.lendingController.address);            
            assert.equal(lendingControllerMockFa2Account, lendingControllerInitialMockFa2TokenBalance + liquidityAmount);

            // check Eve's mEurl Token Token balance
            const updatedEveMEurlTokenLedger        = await updatedMEurlTokenTokenStorage.ledger.get(eve.pkh);            
            assert.equal(updatedEveMEurlTokenLedger, eveInitialMEurlTokenTokenBalance + liquidityAmount);        

        });


        it('user (eve) can add liquidity for tez into Lending Controller token pool (10 XTZ)', async () => {
    
            // init variables
            await helperFunctions.signerFactory(tezos, eve.sk);
            const loanTokenName = "tez";
            const liquidityAmount = 10000000; // 10 XTZ

            lendingControllerStorage = await lendingControllerInstance.storage();
            
            // get mTokenXtz token storage (FA2 Token Standard)
            const mTokenPoolXtzStorage   = await mTokenXtzInstance.storage();

            // get initial eve XTZ balance
            const eveInitialXtzLedger   = await utils.tezos.tz.getBalance(eve.pkh);
            const eveInitialXtzBalance  = eveInitialXtzLedger.toNumber();

            // get initial eve's mEurl Token - Tez - balance
            const eveMXtzTokenLedger            = await mTokenPoolXtzStorage.ledger.get(eve.pkh);            
            const eveInitialMXtzTokenBalance    = eveMXtzTokenLedger == undefined ? 0 : eveMXtzTokenLedger.toNumber();

            // get initial lending controller's XTZ balance
            const lendingControllerInitialXtzLedger   = await utils.tezos.tz.getBalance(contractDeployments.lendingController.address);
            const lendingControllerInitialXtzBalance  = lendingControllerInitialXtzLedger.toNumber();

            // get initial lending controller token pool total
            const initialLoanTokenRecord                 = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
            const lendingControllerInitialTokenPoolTotal = initialLoanTokenRecord.tokenPoolTotal.toNumber();

            // eve deposits mock XTZ into lending controller token pool
            const eveDepositTokenOperation  = await lendingControllerInstance.methods.addLiquidity(
                loanTokenName,
                liquidityAmount
            ).send({ mutez : true, amount: liquidityAmount });
            await eveDepositTokenOperation.confirmation();

            // get updated storages
            const updatedLendingControllerStorage  = await lendingControllerInstance.storage();
            const updatedMXtzTokenStorage     = await mTokenXtzInstance.storage();

            // check new balance for loan token pool total
            const updatedLoanTokenRecord           = await updatedLendingControllerStorage.loanTokenLedger.get(loanTokenName);
            assert.equal(updatedLoanTokenRecord.tokenPoolTotal, lendingControllerInitialTokenPoolTotal + liquidityAmount);

            // check Lending Controller's XTZ Balance
            const lendingControllerXtzBalance             = await utils.tezos.tz.getBalance(contractDeployments.lendingController.address);
            assert.equal(lendingControllerXtzBalance, lendingControllerInitialXtzBalance + liquidityAmount);

            // check Eve's mTokenXtz balance
            const updatedEveMXtzTokenLedger        = await updatedMXtzTokenStorage.ledger.get(eve.pkh);            
            assert.equal(updatedEveMXtzTokenLedger, eveInitialMXtzTokenBalance + liquidityAmount);        

            // check Eve's XTZ Balance and account for gas cost in transaction with almostEqual
            const eveXtzBalance = await utils.tezos.tz.getBalance(eve.pkh);
            assert.equal(helperFunctions.almostEqual(eveXtzBalance, eveInitialXtzBalance - liquidityAmount, 0.0001), true)

        });
    
    }); // end test: add liquidity 



    // 
    // Test: Remove Liquidity from Lending Pool
    //
    describe('%removeLiquidity', function () {
    
        it('user (eve) can remove liquidity for mock FA12 token from Lending Controller token pool (5 MockFA12 Tokens)', async () => {
    
            // init variables
            await helperFunctions.signerFactory(tezos, eve.sk);
            const loanTokenName = "usdt";
            const withdrawAmount = 5000000; // 5 Mock FA12 Tokens

            lendingControllerStorage = await lendingControllerInstance.storage();
            
            // get mock fa12 token storage and lp token pool mock fa12 token storage
            const mockFa12TokenStorage              = await mockFa12TokenInstance.storage();
            const mTokenPoolMockFa12TokenStorage   = await mTokenUsdtInstance.storage();
            
            // get initial eve's Mock FA12 Token balance
            const eveMockFa12Ledger                 = await mockFa12TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMockFa12TokenBalance    = eveMockFa12Ledger == undefined ? 0 : eveMockFa12Ledger.balance.toNumber();

            // get initial eve's mEurl Token - Mock FA12 Token - balance
            const eveMUsdtTokenLedger                 = await mTokenPoolMockFa12TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMUsdtTokenTokenBalance    = eveMUsdtTokenLedger == undefined ? 0 : eveMUsdtTokenLedger.toNumber();

            // get initial lending controller's Mock FA12 Token balance
            const lendingControllerMockFa12Ledger                = await mockFa12TokenStorage.ledger.get(contractDeployments.lendingController.address);            
            const lendingControllerInitialMockFa12TokenBalance   = lendingControllerMockFa12Ledger == undefined ? 0 : lendingControllerMockFa12Ledger.balance.toNumber();

            // get initial lending controller token pool total
            const initialLoanTokenRecord                 = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
            const lendingControllerInitialTokenPoolTotal = initialLoanTokenRecord.tokenPoolTotal.toNumber();

            // eve withdraws mock FA12 tokens liquidity from lending controller token pool
            const eveWithdrawTokenOperation  = await lendingControllerInstance.methods.removeLiquidity(
                loanTokenName,
                withdrawAmount, 
            ).send();
            await eveWithdrawTokenOperation.confirmation();

            // get updated storages
            const updatedLendingControllerStorage         = await lendingControllerInstance.storage();
            const updatedMockFa12TokenStorage             = await mockFa12TokenInstance.storage();
            const updatedMUsdtTokenTokenStorage  = await mTokenUsdtInstance.storage();

            // Summary - Liquidity Removed for Mock FA12 Token
            // 1) Loan Token Pool Record Balance - decrease
            // 2) Lending Controller Token Balance - decrease
            // 3) User mToken Balance - decrease
            // 4) User Token Balance - increase

            // 1) check new balance for loan token pool total
            const updatedLoanTokenRecord           = await updatedLendingControllerStorage.loanTokenLedger.get(loanTokenName);
            assert.equal(updatedLoanTokenRecord.tokenPoolTotal, lendingControllerInitialTokenPoolTotal - withdrawAmount);

            // 2) check Lending Controller's Mock FA12 Token Balance
            const lendingControllerMockFa12Account  = await updatedMockFa12TokenStorage.ledger.get(contractDeployments.lendingController.address);            
            assert.equal(lendingControllerMockFa12Account.balance, lendingControllerInitialMockFa12TokenBalance - withdrawAmount);

            // 3) check Eve's mUsdt Token Token balance
            const updatedEveMUsdtTokenLedger        = await updatedMUsdtTokenTokenStorage.ledger.get(eve.pkh);            
            assert.equal(updatedEveMUsdtTokenLedger, eveInitialMUsdtTokenTokenBalance - withdrawAmount);        

            // 4) check Eve's Mock FA12 Token balance
            const updatedEveMockFa12Ledger         = await updatedMockFa12TokenStorage.ledger.get(eve.pkh);            
            assert.equal(updatedEveMockFa12Ledger.balance, eveInitialMockFa12TokenBalance + withdrawAmount);


        });


        it('user (eve) can remove liquidity for mock FA2 token from Lending Controller token pool (5 MockFA2 Tokens)', async () => {
    
            // init variables
            await helperFunctions.signerFactory(tezos, eve.sk);
            const loanTokenName = "eurl";
            const withdrawAmount = 5000000; // 5 Mock FA2 Tokens

            lendingControllerStorage = await lendingControllerInstance.storage();
            
            // get mock fa12 token storage and lp token pool mock fa2 token storage
            const mockFa2TokenStorage              = await mockFa2TokenInstance.storage();
            const mTokenPoolMockFa2TokenStorage   = await mTokenEurlInstance.storage();
            
            // get initial eve's Mock FA2 Token balance
            const eveMockFa2Ledger                 = await mockFa2TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMockFa2TokenBalance    = eveMockFa2Ledger == undefined ? 0 : eveMockFa2Ledger.toNumber();

            // get initial eve's mEurl Token - Mock FA2 Token - balance
            const eveMEurlTokenLedger                 = await mTokenPoolMockFa2TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMEurlTokenTokenBalance    = eveMEurlTokenLedger == undefined ? 0 : eveMEurlTokenLedger.toNumber();

            // get initial lending controller's Mock FA2 Token balance
            const lendingControllerMockFa2Ledger                = await mockFa2TokenStorage.ledger.get(contractDeployments.lendingController.address);            
            const lendingControllerInitialMockFa2TokenBalance   = lendingControllerMockFa2Ledger == undefined ? 0 : lendingControllerMockFa2Ledger.toNumber();

            // get initial lending controller token pool total
            const initialLoanTokenRecord                 = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
            const lendingControllerInitialTokenPoolTotal = initialLoanTokenRecord.tokenPoolTotal.toNumber();

            // eve withdraws mock FA2 tokens liquidity from lending controller token pool
            const eveWithdrawTokenOperation  = await lendingControllerInstance.methods.removeLiquidity(
                loanTokenName,
                withdrawAmount, 
            ).send();
            await eveWithdrawTokenOperation.confirmation();

            // get updated storages
            const updatedLendingControllerStorage         = await lendingControllerInstance.storage();
            const updatedMockFa2TokenStorage              = await mockFa2TokenInstance.storage();
            const updatedMEurlTokenTokenStorage   = await mTokenEurlInstance.storage();

            // Summary - Liquidity Removed for Mock FA2 Token
            // 1) Loan Token Pool Record Balance - decrease
            // 2) Lending Controller Token Balance - decrease
            // 3) User mToken Balance - decrease
            // 4) User Token Balance - increase

            // 1) check new balance for loan token pool total
            const updatedLoanTokenRecord           = await updatedLendingControllerStorage.loanTokenLedger.get(loanTokenName);
            assert.equal(updatedLoanTokenRecord.tokenPoolTotal, lendingControllerInitialTokenPoolTotal - withdrawAmount);

            // 2) check Lending Controller's Mock FA2 Token Balance
            const lendingControllerMockFa2Account  = await updatedMockFa2TokenStorage.ledger.get(contractDeployments.lendingController.address);            
            assert.equal(lendingControllerMockFa2Account, lendingControllerInitialMockFa2TokenBalance - withdrawAmount);

            // 3) check Eve's mEurl Token Token balance
            const updatedEveMEurlTokenLedger        = await updatedMEurlTokenTokenStorage.ledger.get(eve.pkh);            
            assert.equal(updatedEveMEurlTokenLedger, eveInitialMEurlTokenTokenBalance - withdrawAmount);        

            // 4) check Eve's Mock FA2 Token balance
            const updatedEveMockFa2Ledger         = await updatedMockFa2TokenStorage.ledger.get(eve.pkh);            
            assert.equal(updatedEveMockFa2Ledger, eveInitialMockFa2TokenBalance + withdrawAmount);

        });



        it('user (eve) can remove liquidity for tez from Lending Controller token pool (5 XTZ)', async () => {
    
            // init variables
            await helperFunctions.signerFactory(tezos, eve.sk);
            const loanTokenName = "tez";
            const withdrawAmount = 5000000; // 5 XTZ

            lendingControllerStorage = await lendingControllerInstance.storage();
            
            // get mTokenXtz token storage (FA2 Token Standard)
            const mTokenPoolXtzStorage   = await mTokenXtzInstance.storage();

            // get initial eve XTZ balance
            const eveInitialXtzLedger   = await utils.tezos.tz.getBalance(eve.pkh);
            const eveInitialXtzBalance  = eveInitialXtzLedger.toNumber();

            // get initial eve's mEurl Token - Tez - balance
            const eveMXtzTokenLedger            = await mTokenPoolXtzStorage.ledger.get(eve.pkh);            
            const eveInitialMXtzTokenBalance    = eveMXtzTokenLedger == undefined ? 0 : eveMXtzTokenLedger.toNumber();

            // get initial lending controller's Xtz balance
            const lendingControllerInitialXtzLedger   = await utils.tezos.tz.getBalance(contractDeployments.lendingController.address);
            const lendingControllerInitialXtzBalance  = lendingControllerInitialXtzLedger.toNumber();

            // get initial lending controller token pool total
            const initialLoanTokenRecord                 = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
            const lendingControllerInitialTokenPoolTotal = initialLoanTokenRecord.tokenPoolTotal.toNumber();

            // eve withdraws tez from lending controller token pool
            const eveWithdrawTezOperation  = await lendingControllerInstance.methods.removeLiquidity(
                loanTokenName,
                withdrawAmount, 
            ).send();
            await eveWithdrawTezOperation.confirmation();

            // get updated storages
            const updatedLendingControllerStorage  = await lendingControllerInstance.storage();
            const updatedMXtzTokenStorage     = await mTokenXtzInstance.storage();

            // Summary - Liquidity Removed for XTZ
            // 1) Loan Token Pool Record Balance - decrease
            // 2) Lending Controller Token Balance - decrease
            // 3) User mToken Balance - decrease
            // 4) User Token Balance - increase

            // 1) check new balance for loan token pool total
            const updatedLoanTokenRecord = await updatedLendingControllerStorage.loanTokenLedger.get(loanTokenName);
            assert.equal(updatedLoanTokenRecord.tokenPoolTotal, lendingControllerInitialTokenPoolTotal - withdrawAmount);

            // 2) check Lending Controller's XTZ Balance
            const lendingControllerXtzBalance = await utils.tezos.tz.getBalance(contractDeployments.lendingController.address);
            assert.equal(lendingControllerXtzBalance, lendingControllerInitialXtzBalance - withdrawAmount);

            // 3) check Eve's mTokenXtz balance
            const updatedEveMXtzTokenLedger = await updatedMXtzTokenStorage.ledger.get(eve.pkh);            
            assert.equal(updatedEveMXtzTokenLedger, eveInitialMXtzTokenBalance - withdrawAmount);        

            // 4) check Eve's XTZ Balance and account for gas cost in transaction with almostEqual
            const eveXtzBalance = await utils.tezos.tz.getBalance(eve.pkh);
            assert.equal(helperFunctions.almostEqual(eveXtzBalance, eveInitialXtzBalance + withdrawAmount, 0.0001), true)

        });

        it('user (eve) cannot remove more liquidity than he has (mock FA12 token)', async () => {
    
            // init variables
            await helperFunctions.signerFactory(tezos, eve.sk);
            const loanTokenName = "usdt";
            const incrementAmount = 10000000; // Increment user balance by 10 Mock FA12 Tokens

            const mTokenPoolMockFa12TokenStorage   = await mTokenUsdtInstance.storage();

            // get initial eve's mEurl Token - Mock FA12 Token - balance
            const eveMUsdtTokenLedger                 = await mTokenPoolMockFa12TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMUsdtTokenTokenBalance    = eveMUsdtTokenLedger == undefined ? 0 : eveMUsdtTokenLedger.toNumber();

            const withdrawMoreThanBalanceAmount = eveInitialMUsdtTokenTokenBalance + incrementAmount;

            // fail: eve has insufficient mock FA12 tokens in token pool
            const failEveWithdrawTokenOperation  = await lendingControllerInstance.methods.removeLiquidity(
                loanTokenName,
                withdrawMoreThanBalanceAmount
            );
            await chai.expect(failEveWithdrawTokenOperation.send()).to.be.rejected;    
            
        });


        it('user (eve) cannot remove more liquidity than he has (mock FA2 token)', async () => {
    
            // init variables
            await helperFunctions.signerFactory(tezos, eve.sk);
            const loanTokenName = "eurl";
            const incrementAmount = 10000000; // Increment user balance by 10 Mock FA2 Tokens

            const mTokenPoolMockFa2TokenStorage   = await mTokenEurlInstance.storage();

            // get initial eve's mEurl Token - Mock FA2 Token - balance
            const eveMEurlTokenLedger                 = await mTokenPoolMockFa2TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMEurlTokenTokenBalance    = eveMEurlTokenLedger == undefined ? 0 : eveMEurlTokenLedger.toNumber();

            const withdrawMoreThanBalanceAmount = eveInitialMEurlTokenTokenBalance + incrementAmount;

            // fail: eve has insufficient mock FA2 tokens in token pool
            const failEveWithdrawTokenOperation  = await lendingControllerInstance.methods.removeLiquidity(
                loanTokenName,
                withdrawMoreThanBalanceAmount, 
            );
            await chai.expect(failEveWithdrawTokenOperation.send()).to.be.rejected;    
            
        });


        it('user (eve) cannot remove more liquidity than he has (tez)', async () => {
    
            // init variables
            await helperFunctions.signerFactory(tezos, eve.sk);
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

            await helperFunctions.signerFactory(tezos, eve.sk);
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
            const initialLoanOutstandingTotal   = vaultRecord.loanOutstandingTotal.toNumber();
            const initialLoanPrincipalTotal     = vaultRecord.loanPrincipalTotal.toNumber();
            const initialLoanInterestTotal      = vaultRecord.loanInterestTotal.toNumber();

            // get initial eve's Mock FA12 Token balance
            const eveMockFa12Ledger                 = await mockFa12TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMockFa12TokenBalance    = eveMockFa12Ledger == undefined ? 0 : eveMockFa12Ledger.balance.toNumber();

            // borrow operation
            const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
            await eveBorrowOperation.confirmation();

            // get updated storage
            const updatedLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedVaultRecord              = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const updatedMockFa12TokenStorage     = await mockFa12TokenInstance.storage();
            const updatedEveMockFa12Ledger        = await updatedMockFa12TokenStorage.ledger.get(eve.pkh);            
            const updatedEveMockFa12Balance       = updatedEveMockFa12Ledger.balance.toNumber();

            const updatedLoanOutstandingTotal     = updatedVaultRecord.loanOutstandingTotal;
            const updatedLoanPrincipalTotal       = updatedVaultRecord.loanPrincipalTotal;
            const updatedLoanInterestTotal        = updatedVaultRecord.loanInterestTotal;

            // check vault loan records
            assert.equal(updatedLoanOutstandingTotal, initialLoanOutstandingTotal + borrowAmount);
            assert.equal(updatedLoanPrincipalTotal, initialLoanPrincipalTotal + borrowAmount);
            assert.equal(updatedLoanInterestTotal, 0);

            // check eve Mock FA12 Token balance
            assert.equal(updatedEveMockFa12Ledger.balance, eveInitialMockFa12TokenBalance + finalLoanAmount);

        });


        it('user (eve) can borrow 1 Mock FA2 Tokens', async () => {

            await helperFunctions.signerFactory(tezos, eve.sk);
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
            const initialLoanOutstandingTotal   = vaultRecord.loanOutstandingTotal.toNumber();
            const initialLoanPrincipalTotal     = vaultRecord.loanPrincipalTotal.toNumber();
            const initialLoanInterestTotal      = vaultRecord.loanInterestTotal.toNumber();

            // get initial eve's Mock FA2 Token balance
            const eveMockFa2Ledger                 = await mockFa2TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMockFa2TokenBalance    = eveMockFa2Ledger == undefined ? 0 : eveMockFa2Ledger.toNumber();

            const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
            await eveBorrowOperation.confirmation();

            // get updated storage
            const updatedLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedVaultRecord              = await updatedLendingControllerStorage.vaults.get(vaultHandle);

            const updatedLoanOutstandingTotal     = updatedVaultRecord.loanOutstandingTotal;
            const updatedLoanPrincipalTotal       = updatedVaultRecord.loanPrincipalTotal;
            const updatedLoanInterestTotal        = updatedVaultRecord.loanInterestTotal;

            const updatedMockFa2TokenStorage      = await mockFa2TokenInstance.storage();
            const updatedEveMockFa2Ledger         = await updatedMockFa2TokenStorage.ledger.get(eve.pkh);            
            const updatedEveMockFa2TokenBalance   = updatedEveMockFa2Ledger.toNumber();

            assert.equal(updatedLoanOutstandingTotal, initialLoanOutstandingTotal + borrowAmount);
            assert.equal(updatedLoanPrincipalTotal, initialLoanPrincipalTotal + borrowAmount);
            assert.equal(updatedLoanInterestTotal, 0);

            // check eve Mock FA2 Token balance
            assert.equal(updatedEveMockFa2TokenBalance, eveInitialMockFa2TokenBalance + finalLoanAmount);

        });


        it('user (eve) can borrow 1 Tez', async () => {

            await helperFunctions.signerFactory(tezos, eve.sk);
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
            const initialLoanOutstandingTotal   = vaultRecord.loanOutstandingTotal.toNumber();
            const initialLoanPrincipalTotal     = vaultRecord.loanPrincipalTotal.toNumber();
            const initialLoanInterestTotal      = vaultRecord.loanInterestTotal.toNumber();
            
            // get initial eve XTZ balance
            const eveInitialXtzLedger   = await utils.tezos.tz.getBalance(eve.pkh);
            const eveInitialXtzBalance  = eveInitialXtzLedger.toNumber();
            
            // borrow operation
            const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
            await eveBorrowOperation.confirmation();

            // get updated storage
            const updatedLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedVaultRecord              = await updatedLendingControllerStorage.vaults.get(vaultHandle);

            const updatedLoanOutstandingTotal     = updatedVaultRecord.loanOutstandingTotal;
            const updatedLoanPrincipalTotal       = updatedVaultRecord.loanPrincipalTotal;
            const updatedLoanInterestTotal        = updatedVaultRecord.loanInterestTotal;

            // check Eve's XTZ Balance and account for gas cost in transaction with almostEqual
            const updatedEveXtzBalance = await utils.tezos.tz.getBalance(eve.pkh);

            assert.equal(updatedLoanOutstandingTotal, initialLoanOutstandingTotal + borrowAmount);
            assert.equal(updatedLoanPrincipalTotal, initialLoanPrincipalTotal + borrowAmount);
            assert.equal(updatedLoanInterestTotal, 0);

            assert.equal(helperFunctions.almostEqual(updatedEveXtzBalance, eveInitialXtzBalance + finalLoanAmount, 0.0001), true)

        })


        it('user (eve) can borrow again from the same vault (1 Mock FA12 Tokens)', async () => {

            await helperFunctions.signerFactory(tezos, eve.sk);
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
            const initialLoanOutstandingTotal   = vaultRecord.loanOutstandingTotal.toNumber();
            const initialLoanPrincipalTotal     = vaultRecord.loanPrincipalTotal.toNumber();
            const initialLoanInterestTotal      = vaultRecord.loanInterestTotal.toNumber();

            // get initial eve's Mock FA12 Token balance
            const eveMockFa12Ledger                 = await mockFa12TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMockFa12TokenBalance    = eveMockFa12Ledger == undefined ? 0 : eveMockFa12Ledger.balance.toNumber();

            // borrow operation
            const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
            await eveBorrowOperation.confirmation();

            // get updated storage
            const updatedLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedVaultRecord              = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const updatedMockFa12TokenStorage     = await mockFa12TokenInstance.storage();
            const updatedEveMockFa12Ledger        = await updatedMockFa12TokenStorage.ledger.get(eve.pkh);            
            const updatedEveMockFa12Balance       = updatedEveMockFa12Ledger.balance.toNumber();

            const updatedLoanOutstandingTotal     = updatedVaultRecord.loanOutstandingTotal;
            const updatedLoanPrincipalTotal       = updatedVaultRecord.loanPrincipalTotal;
            const updatedLoanInterestTotal        = updatedVaultRecord.loanInterestTotal;

            // check vault loan records
            assert.equal(updatedLoanOutstandingTotal, initialLoanOutstandingTotal + borrowAmount);
            assert.equal(updatedLoanPrincipalTotal, initialLoanPrincipalTotal + borrowAmount);
            assert.equal(updatedLoanInterestTotal, 0);

            // check eve Mock FA12 Token balance
            assert.equal(updatedEveMockFa12Ledger.balance, eveInitialMockFa12TokenBalance + finalLoanAmount);

        });


        it('user (eve) cannot borrow if token pool reserves not met', async () => {

            await helperFunctions.signerFactory(tezos, eve.sk);

            // eve's vault
            const eveVaultId         = eveVaultSet[0];
            const eveVaultOwner      = eve.pkh;
            const loanTokenName      = "usdt";

            const decimals           = 4;
            const reserveRatio       = 3000; // 30%

            const loanTokenRecordView = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const tokenPoolTotal      = loanTokenRecordView.tokenPoolTotal;
            const totalBorrowed       = loanTokenRecordView.totalBorrowed;
            const totalRemaining      = loanTokenRecordView.totalRemaining;

            const requiredReserves    = (tokenPoolTotal * reserveRatio) / (10 ** decimals);
            const borrowTooMuchAmount = (tokenPoolTotal - requiredReserves - totalBorrowed) + 10;

            const borrowAmount        = borrowTooMuchAmount; // 2 Mock FA12 Tokens

            // fail borrow operation
            const failBorrowFromEveVaultOperation = await lendingControllerInstance.methods.borrow(eveVaultId, borrowAmount);
            await chai.expect(failBorrowFromEveVaultOperation.send()).to.be.rejected;    

        })


        it('user (eve) adds liquidity into Lending Controller token pool (10 MockFA12 Tokens)', async () => {

            // update token reward index for mToken
            await helperFunctions.signerFactory(tezos, bob.sk);
            updateTokenRewardIndexOperation = await mTokenUsdtInstance.methods.transfer([
                {
                    from_: bob.pkh,
                    txs: [
                        {
                            to_: eve.pkh,
                            token_id: 0,
                            amount: 0,
                        },
                    ]
                }]).send();
            await updateTokenRewardIndexOperation.confirmation();

            // init variables
            await helperFunctions.signerFactory(tezos, eve.sk);
            const loanTokenName = "usdt";
            const depositAmount = 10000000; // 10 Mock FA12 Tokens

            lendingControllerStorage = await lendingControllerInstance.storage();
            
            // get mock fa12 token storage and lp token pool mock fa12 token storage
            const mockFa12TokenStorage              = await mockFa12TokenInstance.storage();
            
            // get initial eve's Mock FA12 Token balance
            const eveMockFa12Ledger                 = await mockFa12TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMockFa12TokenBalance    = eveMockFa12Ledger == undefined ? 0 : eveMockFa12Ledger.balance.toNumber();

            // get initial eve's mEurl Token - Mock FA12 Token - balance
            const eveInitialMUsdtTokenTokenBalance    = await mTokenUsdtInstance.contractViews.get_balance({ 0 : eve.pkh, 1 : 0}).executeView({ viewCaller : bob.pkh});

            // get initial lending controller's Mock FA12 Token balance
            const lendingControllerMockFa12Ledger                = await mockFa12TokenStorage.ledger.get(contractDeployments.lendingController.address);            
            const lendingControllerInitialMockFa12TokenBalance   = lendingControllerMockFa12Ledger == undefined ? 0 : lendingControllerMockFa12Ledger.balance.toNumber();

            // get initial lending controller token pool total
            const initialLoanTokenRecord                 = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
            const lendingControllerInitialTokenPoolTotal = initialLoanTokenRecord.tokenPoolTotal.toNumber();

            // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
            // reset token allowance
            const resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
                contractDeployments.lendingController.address,
                0
            ).send();
            await resetTokenAllowance.confirmation();

            // set new token allowance
            const setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
                contractDeployments.lendingController.address,
                depositAmount
            ).send();
            await setNewTokenAllowance.confirmation();

            // eve deposits mock FA12 tokens into lending controller token pool
            const eveDepositTokenOperation  = await lendingControllerInstance.methods.addLiquidity(
                loanTokenName,
                depositAmount
            ).send();
            await eveDepositTokenOperation.confirmation();

            // get updated storages
            const updatedLendingControllerStorage         = await lendingControllerInstance.storage();
            const updatedMockFa12TokenStorage             = await mockFa12TokenInstance.storage();

            // check new balance for loan token pool total
            const updatedLoanTokenRecord           = await updatedLendingControllerStorage.loanTokenLedger.get(loanTokenName);
            assert.equal(updatedLoanTokenRecord.tokenPoolTotal, lendingControllerInitialTokenPoolTotal + depositAmount);

            // check Eve's Mock FA12 Token balance
            const updatedEveMockFa12Ledger         = await updatedMockFa12TokenStorage.ledger.get(eve.pkh);            
            assert.equal(updatedEveMockFa12Ledger.balance, eveInitialMockFa12TokenBalance - depositAmount);

            // check Lending Controller's Mock FA12 Token Balance
            const lendingControllerMockFa12Account  = await updatedMockFa12TokenStorage.ledger.get(contractDeployments.lendingController.address);            
            assert.equal(lendingControllerMockFa12Account.balance, lendingControllerInitialMockFa12TokenBalance + depositAmount);

            // check Eve's mUsdt Token Token balance
            const updatedEveMUsdtTokenLedger    = await mTokenUsdtInstance.contractViews.get_balance({ 0 : eve.pkh, 1 : 0}).executeView({ viewCaller : bob.pkh});
            assert.equal(updatedEveMUsdtTokenLedger, eveInitialMUsdtTokenTokenBalance.toNumber() + depositAmount);

        })



        it('user (eve) can borrow again after liquidity has been added (3 MockFA12 Tokens)', async () => {

            await helperFunctions.signerFactory(tezos, eve.sk);
            const vaultId            = eveVaultSet[0];
            const vaultOwner         = eve.pkh;
            const borrowAmount       = 3000000; // 3 Mock FA12 Tokens

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
            const initialLoanOutstandingTotal   = vaultRecord.loanOutstandingTotal.toNumber();
            const initialLoanPrincipalTotal     = vaultRecord.loanPrincipalTotal.toNumber();
            const initialLoanInterestTotal      = vaultRecord.loanInterestTotal.toNumber();

            // get initial eve's Mock FA12 Token balance
            const eveMockFa12Ledger                 = await mockFa12TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMockFa12TokenBalance    = eveMockFa12Ledger == undefined ? 0 : eveMockFa12Ledger.balance.toNumber();

            // borrow operation
            const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
            await eveBorrowOperation.confirmation();

            // get updated storage
            const updatedLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedVaultRecord              = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const updatedMockFa12TokenStorage     = await mockFa12TokenInstance.storage();
            const updatedEveMockFa12Ledger        = await updatedMockFa12TokenStorage.ledger.get(eve.pkh);            
            const updatedEveMockFa12Balance       = updatedEveMockFa12Ledger.balance.toNumber();

            const updatedLoanOutstandingTotal     = updatedVaultRecord.loanOutstandingTotal;
            const updatedLoanPrincipalTotal       = updatedVaultRecord.loanPrincipalTotal;
            const updatedLoanInterestTotal        = updatedVaultRecord.loanInterestTotal;

            // check vault loan records
            assert.equal(updatedLoanOutstandingTotal, initialLoanOutstandingTotal + borrowAmount);
            assert.equal(updatedLoanPrincipalTotal, initialLoanPrincipalTotal + borrowAmount);
            assert.equal(updatedLoanInterestTotal, 0);

            // check eve Mock FA12 Token balance
            assert.equal(updatedEveMockFa12Ledger.balance, eveInitialMockFa12TokenBalance + finalLoanAmount);

        })



        it('non-owner cannot borrow from the vault', async () => {

            // set non-owner as alice 
            await helperFunctions.signerFactory(tezos, alice.sk);

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

            await helperFunctions.signerFactory(tezos, eve.sk);
            const vaultId            = eveVaultSet[0]; // vault with mock FA12 token
            const vaultOwner         = eve.pkh;
            const repayAmount        = 1000000; // 1 Mock FA12 Tokens
 
            // get mock fa12 token storage 
            const mockFa12TokenStorage              = await mockFa12TokenInstance.storage();
            
            // get initial eve's Mock FA12 Token balance
            const eveMockFa12Ledger                 = await mockFa12TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMockFa12TokenBalance    = eveMockFa12Ledger == undefined ? 0 : eveMockFa12Ledger.balance.toNumber();

            // setup vault handle and vault record
            const vaultHandle = {
                "id"    : vaultId,
                "owner" : vaultOwner
            };
            const vaultRecord = await lendingControllerStorage.vaults.get(vaultHandle);

            // get initial loan variables
            const initialLoanOutstandingTotal   = vaultRecord.loanOutstandingTotal.toNumber();
            const initialLoanPrincipalTotal     = vaultRecord.loanPrincipalTotal.toNumber();
            const initialLoanInterestTotal      = vaultRecord.loanInterestTotal.toNumber();

            // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
            // reset token allowance
            const resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
                contractDeployments.lendingController.address,
                0
            ).send();
            await resetTokenAllowance.confirmation();

            // set new token allowance
            const setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
                contractDeployments.lendingController.address,
                repayAmount
            ).send();
            await setNewTokenAllowance.confirmation();

            // repay operation
            const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send();
            await eveRepayOperation.confirmation();

            // get updated storage
            const updatedLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedVaultRecord              = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const updatedMockFa12TokenStorage     = await mockFa12TokenInstance.storage();
            const updatedEveMockFa12Ledger        = await updatedMockFa12TokenStorage.ledger.get(eve.pkh);            
            const updatedEveMockFa12TokenBalance       = updatedEveMockFa12Ledger.balance.toNumber();

            const updatedLoanOutstandingTotal     = updatedVaultRecord.loanOutstandingTotal;
            const updatedLoanPrincipalTotal       = updatedVaultRecord.loanPrincipalTotal;
            const updatedLoanInterestTotal        = updatedVaultRecord.loanInterestTotal;

            // NB: interest too little to make a difference within a few blocks
            assert.equal(updatedLoanOutstandingTotal, initialLoanOutstandingTotal - repayAmount);
            assert.equal(updatedLoanPrincipalTotal, initialLoanPrincipalTotal - repayAmount);
            assert.equal(updatedEveMockFa12TokenBalance, eveInitialMockFa12TokenBalance - repayAmount);

        })


        it('user (eve) can repay 1 Mock FA2 Token', async () => {

            await helperFunctions.signerFactory(tezos, eve.sk);
            const vaultId            = eveVaultSet[1]; // vault with mock FA2 token
            const vaultOwner         = eve.pkh;
            const repayAmount        = 1000000; // 1 Mock FA2 Tokens
            const loanTokenName      = 'mockFa2';
 
            // get mock fa2 token storage 
            const mockFa2TokenStorage              = await mockFa2TokenInstance.storage();
            
            // get initial eve's Mock FA2 Token balance
            const eveMockFa2Ledger                 = await mockFa2TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMockFa2TokenBalance    = eveMockFa2Ledger == undefined ? 0 : eveMockFa2Ledger.toNumber();

            // setup vault handle and vault record
            const vaultHandle = {
                "id"    : vaultId,
                "owner" : vaultOwner
            };
            const vaultRecord = await lendingControllerStorage.vaults.get(vaultHandle);

            // get initial loan variables
            const initialLoanOutstandingTotal   = vaultRecord.loanOutstandingTotal.toNumber();
            const initialLoanPrincipalTotal     = vaultRecord.loanPrincipalTotal.toNumber();
            const initialLoanInterestTotal      = vaultRecord.loanInterestTotal.toNumber();

            // update operators for lending controller
            updateOperatorsOperation = await helperFunctions.updateOperators(mockFa2TokenInstance, eve.pkh, contractDeployments.lendingController.address, tokenId);
            await updateOperatorsOperation.confirmation();
        
            // repay operation
            const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send();
            await eveRepayOperation.confirmation();

            // get updated storage
            const updatedLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedVaultRecord              = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            
            const updatedMockFa2TokenStorage      = await mockFa2TokenInstance.storage();
            const updatedEveMockFa2Ledger         = await updatedMockFa2TokenStorage.ledger.get(eve.pkh);            
            const updatedEveMockFa2TokenBalance   = updatedEveMockFa2Ledger.toNumber();

            const updatedLoanOutstandingTotal     = updatedVaultRecord.loanOutstandingTotal;
            const updatedLoanPrincipalTotal       = updatedVaultRecord.loanPrincipalTotal;
            const updatedLoanInterestTotal        = updatedVaultRecord.loanInterestTotal;

            // NB: interest too little to make a difference within a few blocks
            assert.equal(updatedLoanOutstandingTotal, initialLoanOutstandingTotal - repayAmount);
            assert.equal(updatedLoanPrincipalTotal, initialLoanPrincipalTotal - repayAmount);
            assert.equal(updatedEveMockFa2TokenBalance, eveInitialMockFa2TokenBalance - repayAmount);

        })



        it('user (eve) can repay 1 Tez', async () => {

            await helperFunctions.signerFactory(tezos, eve.sk);
            const vaultId            = eveVaultSet[2]; // vault with tez loan token
            const vaultOwner         = eve.pkh;
            const repayAmount        = 1000000; // 1 Tez
            const loanTokenName      = 'tez';
            
            // get initial eve XTZ balance
            const eveInitialXtzLedger   = await utils.tezos.tz.getBalance(eve.pkh);
            const eveInitialXtzBalance  = eveInitialXtzLedger.toNumber();

            // setup vault handle and vault record
            const vaultHandle = {
                "id"    : vaultId,
                "owner" : vaultOwner
            };
            const vaultRecord = await lendingControllerStorage.vaults.get(vaultHandle);

            // get initial loan variables
            const initialLoanOutstandingTotal   = vaultRecord.loanOutstandingTotal.toNumber();
            const initialLoanPrincipalTotal     = vaultRecord.loanPrincipalTotal.toNumber();
            const initialLoanInterestTotal      = vaultRecord.loanInterestTotal.toNumber();

            // repay operation
            const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send({ mutez : true, amount : repayAmount });
            await eveRepayOperation.confirmation();

            // get updated storage
            const updatedLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedVaultRecord              = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            
            // check Eve's XTZ Balance and account for gas cost in transaction with almostEqual
            const updatedEveXtzLedger = await utils.tezos.tz.getBalance(eve.pkh);
            const updatedEveXtzBalance  = updatedEveXtzLedger.toNumber();

            const updatedLoanOutstandingTotal     = updatedVaultRecord.loanOutstandingTotal;
            const updatedLoanPrincipalTotal       = updatedVaultRecord.loanPrincipalTotal;
            const updatedLoanInterestTotal        = updatedVaultRecord.loanInterestTotal;

            // NB: interest too little to make a difference within a few blocks
            assert.equal(updatedLoanOutstandingTotal, initialLoanOutstandingTotal - repayAmount);
            assert.equal(updatedLoanPrincipalTotal, initialLoanPrincipalTotal - repayAmount);
            
            // account for gas cost
            assert.equal(helperFunctions.almostEqual(updatedEveXtzBalance, eveInitialXtzBalance - repayAmount, 0.0001), true)

        })


        it('user (eve) should not be able to repay less than the min repayment amount', async () => {

            await helperFunctions.signerFactory(tezos, eve.sk);
        
            const mockFa12LoanTokenRecordView = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt("usdt").executeView({ viewCaller : bob.pkh});
            const mockFa2LoanTokenRecordView  = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt("eurl").executeView({ viewCaller : bob.pkh});
            const tezLoanTokenRecordView      = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt("tez").executeView({ viewCaller : bob.pkh});

            const mockFa12LoanTokenMinRepaymentAmount = mockFa12LoanTokenRecordView.minRepaymentAmount;
            const mockFa2LoanTokenMinRepaymentAmount  = mockFa2LoanTokenRecordView.minRepaymentAmount;
            const tezLoanTokenMinRepaymentAmount      = tezLoanTokenRecordView.minRepaymentAmount;

            const belowMinRepaymentAmountForMockFa12LoanToken = mockFa12LoanTokenMinRepaymentAmount / 2;
            const belowMinRepaymentAmountForMockFa2LoanToken  = mockFa2LoanTokenMinRepaymentAmount  / 2;
            const belowMinRepaymentAmountForTezLoanToken      = tezLoanTokenMinRepaymentAmount      / 2;

            // mock fa12 token vault
            const mockFa12VaultId = eveVaultSet[0]; // vault with mock FA12 loan token
            const failEveRepayMockFa12Operation = lendingControllerInstance.methods.repay(mockFa12VaultId, belowMinRepaymentAmountForMockFa12LoanToken);
            await chai.expect(failEveRepayMockFa12Operation.send()).to.be.rejected;

            // mock fa12 token vault
            const mockFa2VaultId = eveVaultSet[1]; // vault with mock FA2 loan token
            const failEveRepayMockFa2Operation = lendingControllerInstance.methods.repay(mockFa2VaultId, belowMinRepaymentAmountForMockFa2LoanToken);
            await chai.expect(failEveRepayMockFa2Operation.send()).to.be.rejected;

            // tez vault
            const tezVaultId         = eveVaultSet[2]; // vault with tez loan token
            const failEveRepayTezOperation = lendingControllerInstance.methods.repay(tezVaultId, belowMinRepaymentAmountForTezLoanToken);
            await chai.expect(failEveRepayTezOperation.send({ mutez : true, amount : belowMinRepaymentAmountForTezLoanToken })).to.be.rejected;        

        })

    })


    // 
    // Test: vault withdraw
    //
    describe('%withdraw', function () {

        it('user (eve) can withdraw tez from her vault', async () => {

            await helperFunctions.signerFactory(tezos, eve.sk);
            const vaultId              = eveVaultSet[0]; 
            const vaultOwner           = eve.pkh;
            const withdrawAmount       = 1000000; // 1 tez
            const tokenName            = 'tez';

            const vaultHandle = {
                "id"     : vaultId,
                "owner"  : vaultOwner
            };

            const lendingControllerStorage      = await lendingControllerInstance.storage();
            const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);

            const initialVaultCollateralTokenBalance   = await vault.collateralBalanceLedger.get(tokenName);

            // get vault contract
            const vaultAddress = vault.address;

            // get initial XTZ balance for Eve and Vault
            const eveXtzLedger             = await utils.tezos.tz.getBalance(eve.pkh);
            const eveInitialXtzBalance     = eveXtzLedger.toNumber();

            const vaultXtzLedger           = await utils.tezos.tz.getBalance(vaultAddress);
            const vaultInitialXtzBalance   = vaultXtzLedger.toNumber();

            const eveVaultInstance         = await utils.tezos.contract.at(vaultAddress);

            // withdraw operation
            const eveWithdrawOperation  = await eveVaultInstance.methods.initVaultAction(
                "withdraw",
                withdrawAmount,                 
                tokenName                            
            ).send();
            await eveWithdrawOperation.confirmation();

            // get updated storages for lending controller and vault
            const updatedLendingControllerStorage       = await lendingControllerInstance.storage();
            const updatedVault                          = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const updatedVaultCollateralTokenBalance    = await updatedVault.collateralBalanceLedger.get(tokenName);

            // get updated XTZ balance for Eve and Vault
            const updatedEveXtzLedger             = await utils.tezos.tz.getBalance(eve.pkh);
            const updatedEveXtzBalance            = updatedEveXtzLedger.toNumber();

            const updatedVaultXtzLedger           = await utils.tezos.tz.getBalance(vaultAddress);
            const updatedVaultXtzBalance          = updatedVaultXtzLedger.toNumber();

            assert.equal(updatedVaultCollateralTokenBalance, initialVaultCollateralTokenBalance - withdrawAmount);
            assert.equal(updatedVaultXtzBalance, vaultInitialXtzBalance - withdrawAmount);

            // account for minute differences from gas in sending transaction
            assert.equal(helperFunctions.almostEqual(updatedEveXtzBalance, eveInitialXtzBalance + withdrawAmount, 0.0001), true)            

        });


        it('user (eve) can withdraw mockFa12 token from her vault', async () => {

            await helperFunctions.signerFactory(tezos, eve.sk);
            const vaultId              = eveVaultSet[0]; 
            const vaultOwner           = eve.pkh;
            const withdrawAmount       = 1000000; // 1 mockFa12 token
            const tokenName            = 'usdt';

            const vaultHandle = {
                "id"     : vaultId,
                "owner"  : vaultOwner
            };

            const lendingControllerStorage      = await lendingControllerInstance.storage();
            const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);

            const initialVaultCollateralTokenBalance   = await vault.collateralBalanceLedger.get(tokenName);

            // get vault contract
            const vaultAddress = vault.address;

            // get initial balance for Eve and Vault
            const eveMockFa12Ledger                 = await mockFa12TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMockFa12TokenBalance    = eveMockFa12Ledger == undefined ? 0 : eveMockFa12Ledger.balance.toNumber();

            const vaultMockFa12Ledger               = await mockFa12TokenStorage.ledger.get(vaultAddress);            
            const vaultInitialMockFa12TokenBalance  = vaultMockFa12Ledger == undefined ? 0 : vaultMockFa12Ledger.balance.toNumber();

            const eveVaultInstance         = await utils.tezos.contract.at(vaultAddress);

            // withdraw operation
            const eveWithdrawOperation  = await eveVaultInstance.methods.initVaultAction(
                "withdraw",
                withdrawAmount,                 
                tokenName                            
            ).send();
            await eveWithdrawOperation.confirmation();

            // get updated storages for lending controller and vault
            const updatedLendingControllerStorage      = await lendingControllerInstance.storage();
            const updatedVault                         = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const updatedVaultCollateralTokenBalance   = await updatedVault.collateralBalanceLedger.get(tokenName);
            const updatedMockFa12TokenStorage          = await mockFa12TokenInstance.storage();

            // get updated balance for Eve and Vault
            const updatedEveMockFa12Ledger             = await updatedMockFa12TokenStorage.ledger.get(eve.pkh);            
            const updatedEveMockFa12TokenBalance       = updatedEveMockFa12Ledger == undefined ? 0 : updatedEveMockFa12Ledger.balance.toNumber();

            const updatedVaultMockFa12Ledger           = await updatedMockFa12TokenStorage.ledger.get(vaultAddress);            
            const updatedVaultMockFa12TokenBalance     = updatedVaultMockFa12Ledger == undefined ? 0 : updatedVaultMockFa12Ledger.balance.toNumber();
            

            assert.equal(updatedVaultCollateralTokenBalance, initialVaultCollateralTokenBalance - withdrawAmount);
            assert.equal(updatedVaultMockFa12TokenBalance, vaultInitialMockFa12TokenBalance - withdrawAmount);
            assert.equal(updatedEveMockFa12TokenBalance, eveInitialMockFa12TokenBalance + withdrawAmount);

        });


        it('user (eve) can withdraw mockFa2 token from her vault', async () => {

            await helperFunctions.signerFactory(tezos, eve.sk);
            const vaultId              = eveVaultSet[0]; 
            const vaultOwner           = eve.pkh;
            const withdrawAmount       = 1000000; // 1 mockFa2 token
            const tokenName            = 'eurl';

            const vaultHandle = {
                "id"     : vaultId,
                "owner"  : vaultOwner
            };

            const lendingControllerStorage      = await lendingControllerInstance.storage();
            const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);

            const initialVaultCollateralTokenBalance   = await vault.collateralBalanceLedger.get(tokenName);

            // get vault contract
            const vaultAddress = vault.address;

            // get initial balance for Eve and Vault
            const eveMockFa2Ledger                  = await mockFa2TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMockFa2TokenBalance     = eveMockFa2Ledger == undefined ? 0 : eveMockFa2Ledger.toNumber();

            const vaultMockFa2Ledger                = await mockFa2TokenStorage.ledger.get(vaultAddress);            
            const vaultInitialMockFa2TokenBalance   = vaultMockFa2Ledger == undefined ? 0 : vaultMockFa2Ledger.toNumber();

            const eveVaultInstance         = await utils.tezos.contract.at(vaultAddress);

            // withdraw operation
            const eveWithdrawOperation  = await eveVaultInstance.methods.initVaultAction(
                "withdraw",
                withdrawAmount,                 
                tokenName                            
            ).send();
            await eveWithdrawOperation.confirmation();

            // get updated storages for lending controller and vault
            const updatedLendingControllerStorage      = await lendingControllerInstance.storage();
            const updatedVault                         = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const updatedVaultCollateralTokenBalance   = await updatedVault.collateralBalanceLedger.get(tokenName);
            const updatedMockFa2TokenStorage           = await mockFa2TokenInstance.storage();

            // get updated balance for Eve and Vault
            const updatedEveMockFa2Ledger              = await updatedMockFa2TokenStorage.ledger.get(eve.pkh);            
            const updatedEveMockFa2TokenBalance        = updatedEveMockFa2Ledger == undefined ? 0 : updatedEveMockFa2Ledger.toNumber();

            const updatedVaultMockFa2Ledger            = await updatedMockFa2TokenStorage.ledger.get(vaultAddress);            
            const updatedVaultMockFa2TokenBalance      = updatedVaultMockFa2Ledger == undefined ? 0 : updatedVaultMockFa2Ledger.toNumber();
            

            assert.equal(updatedVaultCollateralTokenBalance, initialVaultCollateralTokenBalance - withdrawAmount);
            assert.equal(updatedVaultMockFa2TokenBalance, vaultInitialMockFa2TokenBalance - withdrawAmount);
            assert.equal(updatedEveMockFa2TokenBalance, eveInitialMockFa2TokenBalance + withdrawAmount);

        });



        it('user (eve) should not be able to withdraw tokens from her vault if they have not been deposited', async () => {

            await helperFunctions.signerFactory(tezos, eve.sk);
            const vaultId              = eveVaultSet[1]; 
            const vaultOwner           = eve.pkh;
            const withdrawAmount       = 1000000; 
            const testTokenNameOne     = 'mockFa12';
            const testTokenNameTwo     = 'mockFa2';

            const vaultHandle = {
                "id"     : vaultId,
                "owner"  : vaultOwner
            };

            const lendingControllerStorage      = await lendingControllerInstance.storage();
            const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);

            // get vault contract
            const vaultAddress = vault.address;
            const eveVaultInstance         = await utils.tezos.contract.at(vaultAddress);

            const failSetNewAdminOperation = await lendingControllerInstance.methods.setAdmin(contractDeployments.governanceProxy.address);
            await chai.expect(failSetNewAdminOperation.send()).to.be.rejected;    

            // withdraw operation - mockFa12 token
            const failWithdrawTestTokenOneOperation  = await eveVaultInstance.methods.initVaultAction(
                "withdraw",
                withdrawAmount,                 
                testTokenNameOne                            
            );
            await chai.expect(failWithdrawTestTokenOneOperation.send()).to.be.rejected;

            // withdraw operation - mockFa2 token
            const failWithdrawTestTokenTwoOperation  = await eveVaultInstance.methods.initVaultAction(
                "withdraw",
                withdrawAmount,                 
                testTokenNameTwo                            
            );
            await chai.expect(failWithdrawTestTokenTwoOperation.send()).to.be.rejected;

        });


        it('user (eve) should not be able to withdraw more than what she has in her vault', async () => {

            await helperFunctions.signerFactory(tezos, eve.sk);
            const vaultId              = eveVaultSet[1]; 
            const vaultOwner           = eve.pkh;
            const tokenName            = 'tez';

            const vaultHandle = {
                "id"     : vaultId,
                "owner"  : vaultOwner
            };

            const lendingControllerStorage             = await lendingControllerInstance.storage();
            const vault                                = await lendingControllerStorage.vaults.get(vaultHandle);
            const initialVaultCollateralTokenBalance   = await vault.collateralBalanceLedger.get(tokenName);

            const withdrawAmount = initialVaultCollateralTokenBalance.toNumber() + 1000000; 
            
            // get vault contract
            const vaultAddress     = vault.address;
            const eveVaultInstance = await utils.tezos.contract.at(vaultAddress);

            const failSetNewAdminOperation = await lendingControllerInstance.methods.setAdmin(contractDeployments.governanceProxy.address);
            await chai.expect(failSetNewAdminOperation.send()).to.be.rejected;    

            // withdraw operation
            const failWithdrawTestTokenOneOperation  = await eveVaultInstance.methods.initVaultAction(
                "withdraw",
                withdrawAmount,                 
                tokenName                            
            );
            await chai.expect(failWithdrawTestTokenOneOperation.send()).to.be.rejected;

        });

    })

    // 
    // Test: vault deposit staked token
    //
    describe('%vaultDepositStakedToken', function () {

        it('user (eve) can deposit staked tokens (e.g. smvk) to her vault', async () => {

            await helperFunctions.signerFactory(tezos, eve.sk);
            const vaultId        = eveVaultSet[0]; 
            const vaultOwner     = eve.pkh;
            const userStake      = MVK(10);
            const depositAmount  = MVK(5);
            const tokenName      = "smvk";

            const vaultHandle = {
                "id"     : vaultId,
                "owner"  : vaultOwner
            };

            const lendingControllerStorage      = await lendingControllerInstance.storage();
            const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);

            const initialVaultCollateralTokenLedger  = await vault.collateralBalanceLedger.get(tokenName);
            const initialVaultCollateralTokenBalance = initialVaultCollateralTokenLedger === undefined? 0 : initialVaultCollateralTokenLedger.toNumber();

            // get vault contract
            const vaultAddress = vault.address;

            // get initial balance for Eve and Vault
            const userMVKBalance = (await mvkTokenStorage.ledger.get(eve.pkh)).toNumber();
                
            const userStakeLedger = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);
            const userStakeBalance = userStakeLedger === undefined ? 0 : userStakeLedger.balance.toNumber();

            const vaultStakeLedger = await doormanStorage.userStakeBalanceLedger.get(vaultAddress);
            const vaultStakeBalance = vaultStakeLedger === undefined ? 0 : vaultStakeLedger.balance.toNumber();
    
            const doormanSMVKTotalSupply = ((await mvkTokenStorage.ledger.get(contractDeployments.doorman.address)) === undefined ? new BigNumber(0) : (await mvkTokenStorage.ledger.get(contractDeployments.doorman.address))).toNumber();

            const eveVaultInstance         = await utils.tezos.contract.at(vaultAddress);

            // ----------------------------------------------------------------------------------------------
            // Eve staked some MVK to Doorman Contract
            // ----------------------------------------------------------------------------------------------

            // Operator set
            updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, eve.pkh, contractDeployments.doorman.address, tokenId);
            await updateOperatorsOperation.confirmation();

            // Operation
            const stakeOperation = await doormanInstance.methods.stake(userStake).send();
            await stakeOperation.confirmation();

            // Update storage
            doormanStorage = await doormanInstance.storage();
            mvkTokenStorage = await mvkTokenInstance.storage();

            // Final Values
            const userMVKBalanceEnd = (await mvkTokenStorage.ledger.get(eve.pkh)).toNumber();
            const userStakeLedgerEnd = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);
            const userStakeBalanceEnd = userStakeLedgerEnd.balance.toNumber()
            const doormanSMVKTotalSupplyEnd = ((await mvkTokenStorage.ledger.get(contractDeployments.doorman.address)) === undefined ? new BigNumber(0) : (await mvkTokenStorage.ledger.get(contractDeployments.doorman.address))).toNumber();

            // Assertion
            assert.equal(doormanSMVKTotalSupply + userStake, doormanSMVKTotalSupplyEnd);
            assert.equal(userMVKBalance - userStake, userMVKBalanceEnd);
            assert.equal(userStakeBalance + userStake, userStakeBalanceEnd);

            // ----------------------------------------------------------------------------------------------
            // Eve's vault stake some MVK to Doorman Contract
            // ----------------------------------------------------------------------------------------------

            // eve set doorman as operator for vault
            const vaultUpdateTokenOperatorOperation = await eveVaultInstance.methods.initVaultAction(
                "updateTokenOperators",
                tokenName,
                [
                    {
                    add_operator: {
                        owner: vaultAddress,
                        operator: contractDeployments.doorman.address,
                        token_id: 0,
                    },
                    }
                ]
            )
            .send();
            await vaultUpdateTokenOperatorOperation.confirmation();

            // vault staked token operation
            const eveVaultDepositStakedTokenOperation  = await lendingControllerInstance.methods.vaultDepositStakedToken(
                tokenName,
                vaultId,                 
                depositAmount                            
            ).send();
            await eveVaultDepositStakedTokenOperation.confirmation();

            // get updated storages for lending controller and vault
            const updatedLendingControllerStorage      = await lendingControllerInstance.storage();
            const updatedVault                         = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const updatedVaultCollateralTokenLedger    = await updatedVault.collateralBalanceLedger.get(tokenName);
            const updatedVaultCollateralTokenBalance   = updatedVaultCollateralTokenLedger === undefined ? 0 : updatedVaultCollateralTokenLedger.toNumber();

            // get updated balance for Eve and Vault
            const updatedMvkTokenStorage   = await mvkTokenInstance.storage();
            const updatedDoormanStorage    = await doormanInstance.storage();
            const updatedUserMVKBalance    = (await updatedMvkTokenStorage.ledger.get(eve.pkh)).toNumber();
                
            const updatedUserStakeLedger   = await updatedDoormanStorage.userStakeBalanceLedger.get(eve.pkh);
            const updatedUserStakeBalance  = updatedUserStakeLedger === undefined ? 0 : updatedUserStakeLedger.balance.toNumber()

            const updatedVaultStakeLedger  = await updatedDoormanStorage.userStakeBalanceLedger.get(vaultAddress);
            const updatedVaultStakeBalance = updatedVaultStakeLedger === undefined ? 0 : updatedVaultStakeLedger.balance.toNumber()
            
            assert.equal(updatedVaultCollateralTokenBalance, initialVaultCollateralTokenBalance + depositAmount);
            assert.equal(updatedUserStakeBalance, userStakeBalanceEnd - depositAmount);
            assert.equal(updatedVaultStakeBalance, vaultStakeBalance + depositAmount);
            assert.equal(updatedUserMVKBalance, userMVKBalanceEnd);

        });


        it('user (eve) cannot deposit more staked tokens (e.g. smvk) than she has to her vault', async () => {

            await helperFunctions.signerFactory(tezos, eve.sk);
            const vaultId        = eveVaultSet[0]; 
            const vaultOwner     = eve.pkh;
            const tokenName      = "smvk";

            const vaultHandle = {
                "id"     : vaultId,
                "owner"  : vaultOwner
            };

            const lendingControllerStorage      = await lendingControllerInstance.storage();
            const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);

            const initialVaultCollateralTokenLedger  = await vault.collateralBalanceLedger.get(tokenName);
            const initialVaultCollateralTokenBalance = initialVaultCollateralTokenLedger === undefined? 0 : initialVaultCollateralTokenLedger.toNumber();

            // get vault contract
            const vaultAddress = vault.address;

            // get initial balance for Eve and Vault                
            const userMVKBalance = (await mvkTokenStorage.ledger.get(eve.pkh)).toNumber();

            const userStakeLedger = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);
            const userStakeBalance = userStakeLedger === undefined ? 0 : userStakeLedger.balance.toNumber();

            // set deposit amount to be slightly more than staked balance
            const depositAmount = userStakeBalance + 1;

            const vaultStakeLedger = await doormanStorage.userStakeBalanceLedger.get(vaultAddress);
            const vaultStakeBalance = vaultStakeLedger === undefined ? 0 : vaultStakeLedger.balance.toNumber();

            const doormanSMVKTotalSupply = ((await mvkTokenStorage.ledger.get(contractDeployments.doorman.address)) === undefined ? new BigNumber(0) : (await mvkTokenStorage.ledger.get(contractDeployments.doorman.address))).toNumber();

            // ----------------------------------------------------------------------------------------------
            // Eve's vault stake some MVK to Doorman Contract
            // ----------------------------------------------------------------------------------------------

            // eve set doorman as operator for vault
            const eveVaultInstance                  = await utils.tezos.contract.at(vaultAddress);
            const vaultUpdateTokenOperatorOperation = await eveVaultInstance.methods.initVaultAction(
                "updateTokenOperators",
                tokenName,
                [
                    {
                    add_operator: {
                        owner: vaultAddress,
                        operator: contractDeployments.doorman.address,
                        token_id: 0,
                    },
                    }
                ]
            )
            .send();
            await vaultUpdateTokenOperatorOperation.confirmation();

            // fail vault staked token operation
            const eveVaultDepositStakedTokenOperation  = await lendingControllerInstance.methods.vaultDepositStakedToken(
                tokenName,
                vaultId,                 
                depositAmount                            
            );
            await chai.expect(eveVaultDepositStakedTokenOperation.send()).to.be.rejected;  

            // get updated storages for lending controller and vault
            const updatedLendingControllerStorage      = await lendingControllerInstance.storage();
            const updatedVault                         = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const updatedVaultCollateralTokenLedger    = await updatedVault.collateralBalanceLedger.get(tokenName);
            const updatedVaultCollateralTokenBalance   = updatedVaultCollateralTokenLedger === undefined ? 0 : updatedVaultCollateralTokenLedger.toNumber();

            // // get updated balance for Eve and Vault
            const updatedMvkTokenStorage     = await mvkTokenInstance.storage();
            const updatedDoormanStorage      = await doormanInstance.storage();
            const doormanSMVKTotalSupplyEnd  = ((await mvkTokenStorage.ledger.get(contractDeployments.doorman.address)) === undefined ? new BigNumber(0) : (await mvkTokenStorage.ledger.get(contractDeployments.doorman.address))).toNumber();
            const updatedUserMVKBalance      = (await updatedMvkTokenStorage.ledger.get(eve.pkh)).toNumber();
                
            const updatedUserStakeLedger     = await updatedDoormanStorage.userStakeBalanceLedger.get(eve.pkh);
            const updatedUserStakeBalance    = updatedUserStakeLedger === undefined ? 0 : updatedUserStakeLedger.balance.toNumber()

            const updatedVaultStakeLedger    = await updatedDoormanStorage.userStakeBalanceLedger.get(vaultAddress);
            const updatedVaultStakeBalance   = updatedVaultStakeLedger === undefined ? 0 : updatedVaultStakeLedger.balance.toNumber()
            
            // check that there are no changes to balances
            assert.equal(updatedVaultCollateralTokenBalance, initialVaultCollateralTokenBalance);
            assert.equal(updatedUserStakeBalance, userStakeBalance);
            assert.equal(updatedVaultStakeBalance, vaultStakeBalance);

            // no changes to user's MVK balance, and doorman sMVK total supply
            assert.equal(updatedUserMVKBalance, userMVKBalance);
            assert.equal(doormanSMVKTotalSupply, doormanSMVKTotalSupplyEnd);

        });


        it('non-owner of the vault (user: mallory) cannot deposit staked tokens (e.g. smvk) into another user\'s (eve) vault', async () => {

            await helperFunctions.signerFactory(tezos, mallory.sk);
            const vaultId        = eveVaultSet[0]; 
            const vaultOwner     = eve.pkh;
            const initiator      = mallory.pkh;
            const tokenName      = "smvk";
            const userStake      = MVK(10);
            const depositAmount  = MVK(5);

            const vaultHandle = {
                "id"     : vaultId,
                "owner"  : vaultOwner
            };

            const lendingControllerStorage      = await lendingControllerInstance.storage();
            const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);

            const initialVaultCollateralTokenLedger  = await vault.collateralBalanceLedger.get(tokenName);
            const initialVaultCollateralTokenBalance = initialVaultCollateralTokenLedger === undefined? 0 : initialVaultCollateralTokenLedger.toNumber();

            // get vault contract
            const vaultAddress = vault.address;

            // get initial balance for Eve and Vault                
            const eveMVKBalance       = (await mvkTokenStorage.ledger.get(eve.pkh)).toNumber();
            const initiatorMVKBalance = (await mvkTokenStorage.ledger.get(initiator)).toNumber();

            const eveStakeLedger      = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);
            const eveStakeBalance     = eveStakeLedger === undefined ? 0 : eveStakeLedger.balance.toNumber();

            const initiatorStakeLedger  = await doormanStorage.userStakeBalanceLedger.get(initiator);
            const initiatorStakeBalance = initiatorStakeLedger === undefined ? 0 : initiatorStakeLedger.balance.toNumber();

            const vaultStakeLedger    = await doormanStorage.userStakeBalanceLedger.get(vaultAddress);
            const vaultStakeBalance   = vaultStakeLedger === undefined ? 0 : vaultStakeLedger.balance.toNumber();

            const doormanSMVKTotalSupply = ((await mvkTokenStorage.ledger.get(contractDeployments.doorman.address)) === undefined ? new BigNumber(0) : (await mvkTokenStorage.ledger.get(contractDeployments.doorman.address))).toNumber();

            // ----------------------------------------------------------------------------------------------
            // Mallory stake some MVK to Doorman Contract
            // ----------------------------------------------------------------------------------------------

            // Operator set
            updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, initiator, contractDeployments.doorman.address, tokenId);
            await updateOperatorsOperation.confirmation();

            // Operation
            const stakeOperation = await doormanInstance.methods.stake(userStake).send();
            await stakeOperation.confirmation();

            // Update storage
            doormanStorage = await doormanInstance.storage();
            mvkTokenStorage = await mvkTokenInstance.storage();

            // Final Values
            const initiatorMVKBalanceEnd     = (await mvkTokenStorage.ledger.get(initiator)).toNumber();
            const initiatorStakeLedgerEnd    = await doormanStorage.userStakeBalanceLedger.get(initiator);
            const initiatorStakeBalanceEnd   = initiatorStakeLedgerEnd.balance.toNumber()
            const doormanSMVKTotalSupplyEnd  = ((await mvkTokenStorage.ledger.get(contractDeployments.doorman.address)) === undefined ? new BigNumber(0) : (await mvkTokenStorage.ledger.get(contractDeployments.doorman.address))).toNumber();

            // Assertion
            assert.equal(doormanSMVKTotalSupply + userStake, doormanSMVKTotalSupplyEnd);
            assert.equal(initiatorMVKBalance - userStake, initiatorMVKBalanceEnd);
            assert.equal(initiatorStakeBalance + userStake, initiatorStakeBalanceEnd);

            // ----------------------------------------------------------------------------------------------
            // Fail: Mallory deposit some MVK to Eve's vault
            // ----------------------------------------------------------------------------------------------

            // mallory set doorman as operator for vault
            const eveVaultInstance                  = await utils.tezos.contract.at(vaultAddress);
            const vaultUpdateTokenOperatorOperation = await eveVaultInstance.methods.initVaultAction(
                "updateTokenOperators",
                tokenName,
                [
                    {
                    add_operator: {
                        owner: vaultAddress,
                        operator: contractDeployments.doorman.address,
                        token_id: 0,
                    },
                    }
                ]
            );
            await chai.expect(vaultUpdateTokenOperatorOperation.send()).to.be.rejected;  

            // fail vault staked mvk operation
            const malloryVaultDepositStakedTokenOperation  = await lendingControllerInstance.methods.vaultDepositStakedToken(
                tokenName,
                vaultId,                 
                depositAmount                            
            );
            await chai.expect(malloryVaultDepositStakedTokenOperation.send()).to.be.rejected;  

            // get updated storages for lending controller and vault
            const updatedLendingControllerStorage      = await lendingControllerInstance.storage();
            const updatedVault                         = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const updatedVaultCollateralTokenLedger    = await updatedVault.collateralBalanceLedger.get(tokenName);
            const updatedVaultCollateralTokenBalance   = updatedVaultCollateralTokenLedger === undefined ? 0 : updatedVaultCollateralTokenLedger.toNumber();

            // // get updated balance for Eve and Vault
            const updatedMvkTokenStorage         = await mvkTokenInstance.storage();
            const updatedDoormanStorage          = await doormanInstance.storage();
            const updatedDoormanSMVKTotalSupply  = ((await mvkTokenStorage.ledger.get(contractDeployments.doorman.address)) === undefined ? new BigNumber(0) : (await mvkTokenStorage.ledger.get(contractDeployments.doorman.address))).toNumber();
            
            const updatedEveMVKBalance       = (await updatedMvkTokenStorage.ledger.get(eve.pkh)).toNumber();
            const updatedInitiatorMVKBalance = (await updatedMvkTokenStorage.ledger.get(initiator)).toNumber();
                
            const updatedEveStakeLedger      = await updatedDoormanStorage.userStakeBalanceLedger.get(eve.pkh);
            const updatedEveStakeBalance     = updatedEveStakeLedger === undefined ? 0 : updatedEveStakeLedger.balance.toNumber()

            const updatedInitiatorStakeLedger      = await updatedDoormanStorage.userStakeBalanceLedger.get(initiator);
            const updatedInitiatorStakeBalance     = updatedInitiatorStakeLedger === undefined ? 0 : updatedInitiatorStakeLedger.balance.toNumber()

            const updatedVaultStakeLedger    = await updatedDoormanStorage.userStakeBalanceLedger.get(vaultAddress);
            const updatedVaultStakeBalance   = updatedVaultStakeLedger === undefined ? 0 : updatedVaultStakeLedger.balance.toNumber()
            
            // check that there are no changes to balances
            assert.equal(updatedVaultCollateralTokenBalance, initialVaultCollateralTokenBalance);
            assert.equal(updatedEveStakeBalance, eveStakeBalance);
            assert.equal(updatedInitiatorStakeBalance, initiatorStakeBalanceEnd);
            assert.equal(updatedVaultStakeBalance, vaultStakeBalance);

            // no changes to eve's and initiator's MVK balance, and doorman sMVK total supply
            assert.equal(updatedEveMVKBalance, eveMVKBalance);
            assert.equal(updatedDoormanSMVKTotalSupply, doormanSMVKTotalSupplyEnd);
            assert.equal(updatedInitiatorMVKBalance, initiatorMVKBalanceEnd);

        });


    })


    // 
    // Test: vault withdraw staked token
    //
    describe('%vaultWithdrawStakedToken', function () {

        it('user (eve) can withdraw staked tokens (e.g. smvk) from her vault to her user balance', async () => {

            await helperFunctions.signerFactory(tezos, eve.sk);
            const vaultId        = eveVaultSet[0]; 
            const vaultOwner     = eve.pkh;
            const withdrawAmount = MVK(2);
            const tokenName      = "smvk";

            const vaultHandle = {
                "id"     : vaultId,
                "owner"  : vaultOwner
            };

            const lendingControllerStorage      = await lendingControllerInstance.storage();
            const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);

            const initialVaultCollateralTokenLedger  = await vault.collateralBalanceLedger.get(tokenName);
            const initialVaultCollateralTokenBalance = initialVaultCollateralTokenLedger === undefined? 0 : initialVaultCollateralTokenLedger.toNumber();

            // get vault contract
            const vaultAddress = vault.address;

            // get initial balance for Eve and Vault
            const userMVKBalance = (await mvkTokenStorage.ledger.get(eve.pkh)).toNumber();
                
            const userStakeLedger = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);
            const userStakeBalance = userStakeLedger === undefined ? 0 : userStakeLedger.balance.toNumber();

            const vaultStakeLedger = await doormanStorage.userStakeBalanceLedger.get(vaultAddress);
            const vaultStakeBalance = vaultStakeLedger === undefined ? 0 : vaultStakeLedger.balance.toNumber();
    
            const doormanSMVKTotalSupply = ((await mvkTokenStorage.ledger.get(contractDeployments.doorman.address)) === undefined ? new BigNumber(0) : (await mvkTokenStorage.ledger.get(contractDeployments.doorman.address))).toNumber();

            // ----------------------------------------------------------------------------------------------
            // Eve's vault withdraw some staked MVK
            // ----------------------------------------------------------------------------------------------

            // vault staked token (e.g. smvk) operation
            const eveVaultWithdrawStakedTokenOperation  = await lendingControllerInstance.methods.vaultWithdrawStakedToken(
                tokenName,
                vaultId,                 
                withdrawAmount                            
            ).send();
            await eveVaultWithdrawStakedTokenOperation.confirmation();

            // get updated storages for lending controller and vault
            const updatedLendingControllerStorage      = await lendingControllerInstance.storage();
            const updatedVault                         = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const updatedVaultCollateralTokenLedger    = await updatedVault.collateralBalanceLedger.get(tokenName);
            const updatedVaultCollateralTokenBalance   = updatedVaultCollateralTokenLedger === undefined ? 0 : updatedVaultCollateralTokenLedger.toNumber();

            // get updated balance for Eve and Vault
            const updatedMvkTokenStorage    = await mvkTokenInstance.storage();
            const updatedDoormanStorage     = await doormanInstance.storage();
            const updatedUserMVKBalance     = (await updatedMvkTokenStorage.ledger.get(eve.pkh)).toNumber();
            const doormanSMVKTotalSupplyEnd = ((await mvkTokenStorage.ledger.get(contractDeployments.doorman.address)) === undefined ? new BigNumber(0) : (await mvkTokenStorage.ledger.get(contractDeployments.doorman.address))).toNumber();
                
            const updatedUserStakeLedger    = await updatedDoormanStorage.userStakeBalanceLedger.get(eve.pkh);
            const updatedUserStakeBalance   = updatedUserStakeLedger === undefined ? 0 : updatedUserStakeLedger.balance.toNumber()

            const updatedVaultStakeLedger   = await updatedDoormanStorage.userStakeBalanceLedger.get(vaultAddress);
            const updatedVaultStakeBalance  = updatedVaultStakeLedger === undefined ? 0 : updatedVaultStakeLedger.balance.toNumber()
            
            assert.equal(updatedVaultCollateralTokenBalance, initialVaultCollateralTokenBalance - withdrawAmount);
            assert.equal(updatedUserStakeBalance, userStakeBalance + withdrawAmount);
            assert.equal(updatedVaultStakeBalance, vaultStakeBalance - withdrawAmount);
            
            // no changes to user's MVK balance, and doorman sMVK total supply
            assert.equal(updatedUserMVKBalance, userMVKBalance);
            assert.equal(doormanSMVKTotalSupply, doormanSMVKTotalSupplyEnd);

        });


        it('user (eve) cannot withdraw more staked tokens (e.g. smvk) than she has from her vault to her user balance', async () => {

            await helperFunctions.signerFactory(tezos, eve.sk);
            const vaultId        = eveVaultSet[0]; 
            const vaultOwner     = eve.pkh;
            const tokenName      = "smvk";

            const vaultHandle = {
                "id"     : vaultId,
                "owner"  : vaultOwner
            };

            const lendingControllerStorage      = await lendingControllerInstance.storage();
            const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);

            const initialVaultCollateralTokenLedger  = await vault.collateralBalanceLedger.get(tokenName);
            const initialVaultCollateralTokenBalance = initialVaultCollateralTokenLedger === undefined? 0 : initialVaultCollateralTokenLedger.toNumber();

            // get vault contract
            const vaultAddress = vault.address;

            // get initial balance for Eve and Vault                
            const userMVKBalance    = (await mvkTokenStorage.ledger.get(eve.pkh)).toNumber();

            const userStakeLedger   = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);
            const userStakeBalance  = userStakeLedger === undefined ? 0 : userStakeLedger.balance.toNumber();

            const vaultStakeLedger  = await doormanStorage.userStakeBalanceLedger.get(vaultAddress);
            const vaultStakeBalance = vaultStakeLedger === undefined ? 0 : vaultStakeLedger.balance.toNumber();

            const doormanSMVKTotalSupply = ((await mvkTokenStorage.ledger.get(contractDeployments.doorman.address)) === undefined ? new BigNumber(0) : (await mvkTokenStorage.ledger.get(contractDeployments.doorman.address))).toNumber();

            // set withdraw amount to be slightly more than staked balance
            const withdrawAmount = vaultStakeBalance + 1;

            // ----------------------------------------------------------------------------------------------
            // Eve's vault stake some MVK to Doorman Contract
            // ----------------------------------------------------------------------------------------------

            // fail vault staked token operation
            const eveVaultWithdrawStakedTokenOperation  = await lendingControllerInstance.methods.vaultWithdrawStakedToken(
                tokenName,
                vaultId,                 
                withdrawAmount                            
            );
            await chai.expect(eveVaultWithdrawStakedTokenOperation.send()).to.be.rejected;  

            // get updated storages for lending controller and vault
            const updatedLendingControllerStorage      = await lendingControllerInstance.storage();
            const updatedVault                         = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const updatedVaultCollateralTokenLedger    = await updatedVault.collateralBalanceLedger.get(tokenName);
            const updatedVaultCollateralTokenBalance   = updatedVaultCollateralTokenLedger === undefined ? 0 : updatedVaultCollateralTokenLedger.toNumber();

            // // get updated balance for Eve and Vault
            const updatedMvkTokenStorage    = await mvkTokenInstance.storage();
            const updatedDoormanStorage     = await doormanInstance.storage();
            const updatedUserMVKBalance     = (await updatedMvkTokenStorage.ledger.get(eve.pkh)).toNumber();
            const doormanSMVKTotalSupplyEnd = ((await mvkTokenStorage.ledger.get(contractDeployments.doorman.address)) === undefined ? new BigNumber(0) : (await mvkTokenStorage.ledger.get(contractDeployments.doorman.address))).toNumber();
                
            const updatedUserStakeLedger = await updatedDoormanStorage.userStakeBalanceLedger.get(eve.pkh);
            const updatedUserStakeBalance = updatedUserStakeLedger === undefined ? 0 : updatedUserStakeLedger.balance.toNumber()

            const updatedVaultStakeLedger = await updatedDoormanStorage.userStakeBalanceLedger.get(vaultAddress);
            const updatedVaultStakeBalance = updatedVaultStakeLedger === undefined ? 0 : updatedVaultStakeLedger.balance.toNumber()
            
            // check that there are no changes to balances
            assert.equal(updatedVaultCollateralTokenBalance, initialVaultCollateralTokenBalance);
            assert.equal(updatedUserStakeBalance, userStakeBalance);
            assert.equal(updatedVaultStakeBalance, vaultStakeBalance);            
            assert.equal(updatedUserMVKBalance, userMVKBalance);
            assert.equal(doormanSMVKTotalSupply, doormanSMVKTotalSupplyEnd);

        });



        it('non-owner of the vault (user: mallory) cannot deposit staked tokens (e.g. smvk) into another user\'s (eve) vault', async () => {

            await helperFunctions.signerFactory(tezos, mallory.sk);
            const vaultId        = eveVaultSet[0]; 
            const vaultOwner     = eve.pkh;
            const initiator      = mallory.pkh;
            const tokenName      = "smvk";

            const vaultHandle = {
                "id"     : vaultId,
                "owner"  : vaultOwner
            };

            const lendingControllerStorage      = await lendingControllerInstance.storage();
            const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);

            const initialVaultCollateralTokenLedger  = await vault.collateralBalanceLedger.get(tokenName);
            const initialVaultCollateralTokenBalance = initialVaultCollateralTokenLedger === undefined? 0 : initialVaultCollateralTokenLedger.toNumber();

            // get vault contract
            const vaultAddress = vault.address;

            // get initial balance for Eve and Vault                
            const userMVKBalance    = (await mvkTokenStorage.ledger.get(eve.pkh)).toNumber();

            const userStakeLedger   = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);
            const userStakeBalance  = userStakeLedger === undefined ? 0 : userStakeLedger.balance.toNumber();

            const vaultStakeLedger  = await doormanStorage.userStakeBalanceLedger.get(vaultAddress);
            const vaultStakeBalance = vaultStakeLedger === undefined ? 0 : vaultStakeLedger.balance.toNumber();

            const doormanSMVKTotalSupply = ((await mvkTokenStorage.ledger.get(contractDeployments.doorman.address)) === undefined ? new BigNumber(0) : (await mvkTokenStorage.ledger.get(contractDeployments.doorman.address))).toNumber();

            // set withdraw amount to be slightly more than staked balance
            const withdrawAmount = vaultStakeBalance + 1;

            // ----------------------------------------------------------------------------------------------
            // Eve's vault stake some MVK to Doorman Contract
            // ----------------------------------------------------------------------------------------------

            // fail vault staked token operation
            const initiatorVaultWithdrawStakedTokenOperation  = await lendingControllerInstance.methods.vaultWithdrawStakedToken(
                tokenName,
                vaultId,                 
                withdrawAmount                            
            );
            await chai.expect(initiatorVaultWithdrawStakedTokenOperation.send()).to.be.rejected;  

            // get updated storages for lending controller and vault
            const updatedLendingControllerStorage      = await lendingControllerInstance.storage();
            const updatedVault                         = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const updatedVaultCollateralTokenLedger    = await updatedVault.collateralBalanceLedger.get(tokenName);
            const updatedVaultCollateralTokenBalance   = updatedVaultCollateralTokenLedger === undefined ? 0 : updatedVaultCollateralTokenLedger.toNumber();

            // // get updated balance for Eve and Vault
            const updatedMvkTokenStorage    = await mvkTokenInstance.storage();
            const updatedDoormanStorage     = await doormanInstance.storage();
            const updatedUserMVKBalance     = (await updatedMvkTokenStorage.ledger.get(eve.pkh)).toNumber();
            const doormanSMVKTotalSupplyEnd = ((await mvkTokenStorage.ledger.get(contractDeployments.doorman.address)) === undefined ? new BigNumber(0) : (await mvkTokenStorage.ledger.get(contractDeployments.doorman.address))).toNumber();
                
            const updatedUserStakeLedger = await updatedDoormanStorage.userStakeBalanceLedger.get(eve.pkh);
            const updatedUserStakeBalance = updatedUserStakeLedger === undefined ? 0 : updatedUserStakeLedger.balance.toNumber()

            const updatedVaultStakeLedger = await updatedDoormanStorage.userStakeBalanceLedger.get(vaultAddress);
            const updatedVaultStakeBalance = updatedVaultStakeLedger === undefined ? 0 : updatedVaultStakeLedger.balance.toNumber()
            
            // check that there are no changes to balances
            assert.equal(updatedVaultCollateralTokenBalance, initialVaultCollateralTokenBalance);
            assert.equal(updatedUserStakeBalance, userStakeBalance);
            assert.equal(updatedVaultStakeBalance, vaultStakeBalance);            
            assert.equal(updatedUserMVKBalance, userMVKBalance);
            assert.equal(doormanSMVKTotalSupply, doormanSMVKTotalSupplyEnd);

        });

    });


    // 
    // Test: Pause Loan Token - cannot add liquidity, can remove liquidity
    //
    // describe('test paused loan token', function () {

    //     before('set governance defaults',async () => {
            
    //         await helperFunctions.signerFactory(tezos, bob.sk);

    //         // Check if cycle already started (for retest purposes)
    //         const cycleEnd  = governanceStorage.currentCycleInfo.cycleEndLevel;
    //         if (cycleEnd == 0) {

    //             // Update governance config for shorter cycles
    //             await helperFunctions.signerFactory(tezos, bob.sk)
    //             var updateGovernanceConfig  = await governanceInstance.methods.updateConfig(0, "configBlocksPerProposalRound").send();
    //             await updateGovernanceConfig.confirmation();
    //             updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configBlocksPerVotingRound").send();
    //             await updateGovernanceConfig.confirmation();
    //             updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configBlocksPerTimelockRound").send();
    //             await updateGovernanceConfig.confirmation();
    //             updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configMinProposalRoundVotePct").send();
    //             await updateGovernanceConfig.confirmation();
    //             updateGovernanceConfig      = await governanceInstance.methods.updateConfig(1, "configMinProposalRoundVotesReq").send();
    //             await updateGovernanceConfig.confirmation();
    //             updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configMinQuorumPercentage").send();
    //             await updateGovernanceConfig.confirmation();
    //             updateGovernanceConfig      = await governanceInstance.methods.updateConfig(1, "configMinYayVotePercentage").send();
    //             await updateGovernanceConfig.confirmation();
    
    //             // Register satellites
    //             await helperFunctions.signerFactory(tezos, bob.sk)
    //             var updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
    //             {
    //                 add_operator: {
    //                     owner    : bob.pkh,
    //                     operator : contractDeployments.doorman.address,
    //                     token_id : 0,
    //                 },
    //             }])
    //             .send()
    //             await updateOperatorsOperation.confirmation();
    //             var stakeOperation = await doormanInstance.methods.stake(MVK(100)).send();
    //             await stakeOperation.confirmation();
    //             var registerAsSatelliteOperation = await delegationInstance.methods
    //                 .registerAsSatellite(
    //                     "Bob", 
    //                     "Bob description", 
    //                     "Bob image", 
    //                     "Bob website",
    //                     1000
    //                 ).send();
    //             await registerAsSatelliteOperation.confirmation();
    
    //             await helperFunctions.signerFactory(tezos, alice.sk)
    //             var updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
    //             {
    //                 add_operator: {
    //                     owner    : alice.pkh,
    //                     operator : contractDeployments.doorman.address,
    //                     token_id : 0,
    //                 },
    //             }])
    //             .send()
    //             await updateOperatorsOperation.confirmation();
    //             stakeOperation = await doormanInstance.methods.stake(MVK(100)).send();
    //             await stakeOperation.confirmation();
    //             var registerAsSatelliteOperation = await delegationInstance.methods
    //                 .registerAsSatellite(
    //                     "Alice", 
    //                     "Alice description", 
    //                     "Alice image", 
    //                     "Alice website",
    //                     1000
    //                 ).send();
    //             await registerAsSatelliteOperation.confirmation();
        
    //             // Set contracts admin to governance proxy
    //             await helperFunctions.signerFactory(tezos, bob.sk);
    //             governanceStorage               = await governanceInstance.storage();            
    //             const generalContracts          = governanceStorage.generalContracts.entries();
    //             var setAdminOperation           = await governanceInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
    //             await setAdminOperation.confirmation();
    //             setAdminOperation               = await mvkTokenInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
    //             await setAdminOperation.confirmation();

    //             for (let entry of generalContracts){
    //                 // Get contract storage
    //                 var contract        = await utils.tezos.contract.at(entry[1]);
    //                 var storage:any     = await contract.storage();
    
    //                 // Check admin
    //                 if(storage.hasOwnProperty('admin') && storage.admin!==contractDeployments.governanceProxy.address && storage.admin!==breakGlassAddress.address){
    //                     setAdminOperation   = await contract.methods.setAdmin(contractDeployments.governanceProxy.address).send();
    //                     await setAdminOperation.confirmation()
    //                 }
    //             }

    //         } else {
    //             // Start next round until new proposal round
    //             governanceStorage                = await governanceInstance.storage()
    //             var currentCycleInfoRound        = governanceStorage.currentCycleInfo.round
    //             var currentCycleInfoRoundString  = Object.keys(currentCycleInfoRound)[0]
    
    //             delegationStorage       = await delegationInstance.storage();
    //             console.log(await delegationStorage.satelliteLedger.size);
    
    //             while(currentCycleInfoRoundString!=="proposal"){
    //                 var restartRound                = await governanceInstance.methods.startNextRound(false).send();
    //                 await restartRound.confirmation()
    //                 governanceStorage               = await governanceInstance.storage()
    //                 currentCycleInfoRound                    = governanceStorage.currentCycleInfo.round
    //                 currentCycleInfoRoundString              = Object.keys(currentCycleInfoRound)[0]
    //                 console.log("Current round: ", currentCycleInfoRoundString)
    //             }
    //         }
    //     })

    //     it("Set lending controller contract admin to Bob", async() => {
    //         try{

    //             // ------------------------------------------------------------------
    //             //
    //             // Setup governance satellites 
    //             //
    //             // ------------------------------------------------------------------

    //             const aliceSatellite    = await delegationStorage.satelliteLedger.get(alice.pkh);
    //             const bobSatellite      = await delegationStorage.satelliteLedger.get(bob.pkh);
                
    //             if(bobSatellite === undefined){

    //                 // Bob stakes 100 MVK tokens and registers as a satellite
    //                 await helperFunctions.signerFactory(tezos, bob.sk);
    //                 var updateOperators = await mvkTokenInstance.methods.update_operators([
    //                     {
    //                         add_operator: {
    //                             owner: bob.pkh,
    //                             operator: contractDeployments.doorman.address,
    //                             token_id: 0,
    //                         },
    //                     },
    //                 ]).send()
    //                 await updateOperators.confirmation();  
    //                 const bobStakeAmount                  = MVK(100);
    //                 const bobStakeAmountOperation         = await doormanInstance.methods.stake(bobStakeAmount).send();
    //                 await bobStakeAmountOperation.confirmation();                        
    //                 const bobRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite("New Satellite by Bob", "New Satellite Description - Bob", "https://image.url", "https://image.url", "1000").send();
    //                 await bobRegisterAsSatelliteOperation.confirmation();
    //             }

    //             if(aliceSatellite === undefined){

    //                 // Eve stakes 100 MVK tokens and registers as a satellite 
    //                 await helperFunctions.signerFactory(tezos, alice.sk);
    //                 updateOperators = await mvkTokenInstance.methods.update_operators([
    //                     {
    //                         add_operator: {
    //                             owner: alice.pkh,
    //                             operator: contractDeployments.doorman.address,
    //                             token_id: 0,
    //                         },
    //                     },
    //                 ]).send()
    //                 await updateOperators.confirmation(); 
    //                 const aliceStakeAmount                  = MVK(100);
    //                 const aliceStakeAmountOperation         = await doormanInstance.methods.stake(aliceStakeAmount).send();
    //                 await aliceStakeAmountOperation.confirmation();                        
    //                 const aliceRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite("New Satellite by Alice", "New Satellite Description - Alice", "https://image.url", "https://image.url", "1000").send();
    //                 await aliceRegisterAsSatelliteOperation.confirmation();
    //             }

    //             await helperFunctions.signerFactory(tezos, bob.sk);

    //             // Initial values
    //             governanceStorage           = await governanceInstance.storage();
    //             lendingControllerStorage    = await lendingControllerInstance.storage();
    //             const initAdmin             = lendingControllerStorage.admin;
    //             const proposalId            = governanceStorage.nextProposalId.toNumber();
    //             const proposalName          = "Set contract";
    //             const proposalDesc          = "Details about new proposal";
    //             const proposalIpfs          = "ipfs://QM123456789";
    //             const proposalSourceCode    = "Proposal Source Code";

    //             // Set a contract admin compiled params
    //             const lambdaFunction        = await createLambdaBytes(
    //                 tezos.rpc.url,
    //                 contractDeployments.governanceProxy.address,
    //                 
    //                 'setAdmin',
    //                 [
    //                     lendingControllerInstance.address,
    //                     bob.pkh
    //                 ]
    //             );

    //             const proposalData      = [
    //                 {
    //                     addOrSetProposalData: {
    //                         title: "SetAdmin#1",
    //                         encodedCode: lambdaFunction,
	// 					    codeDescription: ""
    //                     }
    //                 }
    //             ];

    //             //Start governance rounds
    //             var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
    //             await nextRoundOperation.confirmation();

    //             const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
    //             await proposeOperation.confirmation();

    //             const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
    //             await lockOperation.confirmation();

    //             var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
    //             await voteOperation.confirmation();

    //             await helperFunctions.signerFactory(tezos, alice.sk);
    //             voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
    //             await voteOperation.confirmation();

    //             await helperFunctions.signerFactory(tezos, bob.sk);
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
    //             await nextRoundOperation.confirmation();

    //             // Votes operation -> both satellites vote
    //             var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
    //             await votingRoundVoteOperation.confirmation();
    //             await helperFunctions.signerFactory(tezos, alice.sk);

    //             votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
    //             await votingRoundVoteOperation.confirmation();
    //             await helperFunctions.signerFactory(tezos, bob.sk);

    //             // Execute proposal
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
    //             await nextRoundOperation.confirmation();

    //             nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
    //             await nextRoundOperation.confirmation();

    //             // Final values
    //             governanceStorage           = await governanceInstance.storage();
    //             lendingControllerStorage    = await lendingControllerInstance.storage();
    //             const proposal              = await governanceStorage.proposalLedger.get(proposalId);
    //             const endAdmin              = lendingControllerStorage.admin;
                
    //             // Assertions
    //             console.log(initAdmin)
    //             console.log(endAdmin)
    //             assert.strictEqual(proposal.executed, true);
    //             assert.notEqual(initAdmin, endAdmin);
    //             assert.equal(endAdmin, bob.pkh);

    //         } catch(e) {
    //             console.dir(e, {depth:5})
    //         }
    //     })

    //     it('admin should be able to update and pause a loan token', async () => {

    //         try{        
                
    //             // init variables
    //             await helperFunctions.signerFactory(tezos, bob.sk);
                
    //             const updateLoanTokenActionType                = "updateLoanToken";
    //             const tokenName                                = "eurl";
    //             const interestRateDecimals                     = 27;
                
    //             const newOracleAddress                         = contractDeployments.mockUsdMockFa2TokenAggregator.address;

    //             const newReserveRatio                          = 2000; // 20% reserves (4 decimals)
    //             const newOptimalUtilisationRate                = 50 * (10 ** (interestRateDecimals - 2));   // 50% utilisation rate kink
    //             const newBaseInterestRate                      = 10  * (10 ** (interestRateDecimals - 2));  // 5%
    //             const newMaxInterestRate                       = 50 * (10 ** (interestRateDecimals - 2));  // 25% 
    //             const newInterestRateBelowOptimalUtilisation   = 30 * (10 ** (interestRateDecimals - 2));  // 10% 
    //             const newInterestRateAboveOptimalUtilisation   = 30 * (10 ** (interestRateDecimals - 2));  // 20%
    //             const newMinRepaymentAmount                    = 20000;
    //             const isPaused                                 = true;

    //             const adminUpdateMockFa2LoanTokenOperation = await lendingControllerInstance.methods.setLoanToken(

    //                 updateLoanTokenActionType,
                    
    //                 tokenName,

    //                 newOracleAddress,
                    
    //                 newReserveRatio,
    //                 newOptimalUtilisationRate,
    //                 newBaseInterestRate,
    //                 newMaxInterestRate,
    //                 newInterestRateBelowOptimalUtilisation,
    //                 newInterestRateAboveOptimalUtilisation,
    //                 newMinRepaymentAmount,

    //                 isPaused
                    
    //             ).send();
    //             await adminUpdateMockFa2LoanTokenOperation.confirmation();

    //             lendingControllerStorage = await lendingControllerInstance.storage();
    //             const updatedMockFa2LoanToken   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

    //             assert.equal(updatedMockFa2LoanToken.tokenName      , tokenName);
    //             assert.equal(updatedMockFa2LoanToken.isPaused       , isPaused);
                
    //         } catch(e){
    //             console.log(e);
    //         } 
    //     });

    //     it('user (eve) should not be able to add liqudity if loan token is paused', async () => {

    //         try{        

    //             // init variables
    //             await helperFunctions.signerFactory(tezos, eve.sk);
    //             const loanTokenName = "eurl";
    //             const liquidityAmount = 10000000; // 10 Mock FA2 Tokens

    //             // update operators for vault
    //             const updateOperatorsOperation = await mockFa2TokenInstance.methods.update_operators([
    //                 {
    //                     add_operator: {
    //                         owner: eve.pkh,
    //                         operator: contractDeployments.lendingController.address,
    //                         token_id: 0,
    //                     },
    //                 }])
    //                 .send()
    //             await updateOperatorsOperation.confirmation();

    //             // eve fail to deposit mock FA2 tokens into lending controller token pool as the loan token is paused
    //             const failEveDepositTokenOperation  = lendingControllerInstance.methods.addLiquidity(
    //                 loanTokenName,
    //                 liquidityAmount
    //             );
    //             await chai.expect(failEveDepositTokenOperation.send()).to.be.rejected;    

    //         } catch(e){
    //             console.log(e);
    //         } 
    //     });

    //     it('user (eve) should still be able to remove liqudity even if loan token is paused', async () => {

    //         try{       

    //             // init variables
    //             await helperFunctions.signerFactory(tezos, eve.sk);
    //             const loanTokenName = "eurl";
    //             const withdrawAmount = 5000000; // 5 Mock FA2 Tokens

    //             lendingControllerStorage = await lendingControllerInstance.storage();
                
    //             // get mock fa12 token storage and lp token pool mock fa2 token storage
    //             const mockFa2TokenStorage              = await mockFa2TokenInstance.storage();
    //             const mTokenPoolMockFa2TokenStorage   = await mTokenEurlInstance.storage();
                
    //             // get initial eve's Mock FA2 Token balance
    //             const eveMockFa2Ledger                 = await mockFa2TokenStorage.ledger.get(eve.pkh);            
    //             const eveInitialMockFa2TokenBalance    = eveMockFa2Ledger == undefined ? 0 : eveMockFa2Ledger.toNumber();

    //             // get initial eve's mEurl Token - Mock FA2 Token - balance
    //             const eveMEurlTokenLedger                 = await mTokenPoolMockFa2TokenStorage.ledger.get(eve.pkh);            
    //             const eveInitialMEurlTokenTokenBalance    = eveMEurlTokenLedger == undefined ? 0 : eveMEurlTokenLedger.toNumber();

    //             // get initial lending controller's Mock FA2 Token balance
    //             const lendingControllerMockFa2Ledger                = await mockFa2TokenStorage.ledger.get(contractDeployments.lendingController.address);            
    //             const lendingControllerInitialMockFa2TokenBalance   = lendingControllerMockFa2Ledger == undefined ? 0 : lendingControllerMockFa2Ledger.toNumber();

    //             // get initial lending controller token pool total
    //             const initialLoanTokenRecord                 = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
    //             const lendingControllerInitialTokenPoolTotal = initialLoanTokenRecord.tokenPoolTotal.toNumber();

    //             // eve withdraws mock FA2 tokens liquidity from lending controller token pool
    //             const eveWithdrawTokenOperation  = await lendingControllerInstance.methods.removeLiquidity(
    //                 loanTokenName,
    //                 withdrawAmount, 
    //             ).send();
    //             await eveWithdrawTokenOperation.confirmation();

    //             // get updated storages
    //             const updatedLendingControllerStorage         = await lendingControllerInstance.storage();
    //             const updatedMockFa2TokenStorage              = await mockFa2TokenInstance.storage();
    //             const updatedMEurlTokenTokenStorage   = await mTokenEurlInstance.storage();

    //             // Summary - Liquidity Removed for Mock FA2 Token
    //             // 1) Loan Token Pool Record Balance - decrease
    //             // 2) Lending Controller Token Balance - decrease
    //             // 3) User mToken Balance - decrease
    //             // 4) User Token Balance - increase

    //             // 1) check new balance for loan token pool total
    //             const updatedLoanTokenRecord           = await updatedLendingControllerStorage.loanTokenLedger.get(loanTokenName);
    //             assert.equal(updatedLoanTokenRecord.tokenPoolTotal, lendingControllerInitialTokenPoolTotal - withdrawAmount);

    //             // 2) check Lending Controller's Mock FA2 Token Balance
    //             const lendingControllerMockFa2Account  = await updatedMockFa2TokenStorage.ledger.get(contractDeployments.lendingController.address);            
    //             assert.equal(lendingControllerMockFa2Account, lendingControllerInitialMockFa2TokenBalance - withdrawAmount);

    //             // 3) check Eve's mEurl Token Token balance
    //             const updatedEveMEurlTokenLedger        = await updatedMEurlTokenTokenStorage.ledger.get(eve.pkh);            
    //             assert.equal(updatedEveMEurlTokenLedger, eveInitialMEurlTokenTokenBalance - withdrawAmount);        

    //             // 4) check Eve's Mock FA2 Token balance
    //             const updatedEveMockFa2Ledger         = await updatedMockFa2TokenStorage.ledger.get(eve.pkh);            
    //             assert.equal(updatedEveMockFa2Ledger, eveInitialMockFa2TokenBalance + withdrawAmount);
                
    //         } catch(e){
    //             console.log(e);
    //         } 
    //     });


    //     it('user (eve) should still be able to deposit into vault even if loan token is paused', async () => {

    //         try{       

    //             const vaultId            = eveVaultSet[1]; // vault with mockFa2 loan token
    //             const vaultOwner         = eve.pkh;
    //             const depositAmountTez   = 1;
    //             const depositAmountMutez = 1000000;

    //             const vaultHandle = {
    //                 "id"     : vaultId,
    //                 "owner"  : vaultOwner
    //             };
    
    //             const vault                    = await lendingControllerStorage.vaults.get(vaultHandle);

    //             // get vault contract
    //             const vaultAddress             = vault.address;
    //             const eveVaultInstance         = await utils.tezos.contract.at(vaultAddress);
    //             const eveVaultInstanceStorage  = await eveVaultInstance.storage();

    //             const eveDepositTezOperation   = await eveVaultInstance.methods.initVaultAction(
    //                 "deposit",
    //                 depositAmountMutez,                   // amt
    //                 "tez"                                 // token
    //             ).send({ mutez : true, amount : depositAmountMutez });
    //             await eveDepositTezOperation.confirmation();
    
    //             const updatedLendingControllerStorage = await lendingControllerInstance.storage();
    //             const updatedVault                    = await updatedLendingControllerStorage.vaults.get(vaultHandle);
    //             const tezCollateralBalance            = await updatedVault.collateralBalanceLedger.get('tez');
                
    //             assert.equal(tezCollateralBalance, TEZ(depositAmountTez));
                
    //         } catch(e){
    //             console.log(e);
    //         } 
    //     });


    //     it('user (eve) should not be able to borrow from vault if loan token is paused', async () => {

    //         try{        

    //             const vaultId            = eveVaultSet[1]; // vault with mockFa2 loan token
    //             const vaultOwner         = eve.pkh;
    //             const borrowAmount       = 100000;

    //             const vaultHandle = {
    //                 "id"     : vaultId,
    //                 "owner"  : vaultOwner
    //             };
    
    //             const vault              = await lendingControllerStorage.vaults.get(vaultHandle);

    //             // borrow operation
    //             const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount);
    //             await chai.expect(eveBorrowOperation.send()).to.be.rejected;    

                
    //         } catch(e){
    //             console.log(e);
    //         } 
    //     });


    //     it('user (eve) should still be able to withdraw from vault even if loan token is paused', async () => {

    //         try{        

    //             await helperFunctions.signerFactory(tezos, eve.sk);
    //             const vaultId              = eveVaultSet[0]; 
    //             const vaultOwner           = eve.pkh;
    //             const withdrawAmount       = 100000; // 0.1 mockFa2 token
    //             const tokenName            = 'mockFa2';
    
    //             const vaultHandle = {
    //                 "id"     : vaultId,
    //                 "owner"  : vaultOwner
    //             };
    
    //             const lendingControllerStorage      = await lendingControllerInstance.storage();
    //             const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);
    
    //             const initialVaultCollateralTokenBalance   = await vault.collateralBalanceLedger.get(tokenName);
    
    //             // get vault contract
    //             const vaultAddress = vault.address;
    
    //             // get initial balance for Eve and Vault
    //             const eveMockFa2Ledger                  = await mockFa2TokenStorage.ledger.get(eve.pkh);            
    //             const eveInitialMockFa2TokenBalance     = eveMockFa2Ledger == undefined ? 0 : eveMockFa2Ledger.toNumber();
    
    //             const vaultMockFa2Ledger                = await mockFa2TokenStorage.ledger.get(vaultAddress);            
    //             const vaultInitialMockFa2TokenBalance   = vaultMockFa2Ledger == undefined ? 0 : vaultMockFa2Ledger.toNumber();
    
    //             const eveVaultInstance         = await utils.tezos.contract.at(vaultAddress);
    
    //             // withdraw operation
    //             const eveWithdrawOperation  = await eveVaultInstance.methods.initVaultAction(
    //                 "withdraw",
    //                 withdrawAmount,                 
    //                 tokenName                            
    //             ).send();
    //             await eveWithdrawOperation.confirmation();
    
    //             // get updated storages for lending controller and vault
    //             const updatedLendingControllerStorage      = await lendingControllerInstance.storage();
    //             const updatedVault                         = await updatedLendingControllerStorage.vaults.get(vaultHandle);
    //             const updatedVaultCollateralTokenBalance   = await updatedVault.collateralBalanceLedger.get(tokenName);
    //             const updatedMockFa2TokenStorage           = await mockFa2TokenInstance.storage();
    
    //             // get updated balance for Eve and Vault
    //             const updatedEveMockFa2Ledger              = await updatedMockFa2TokenStorage.ledger.get(eve.pkh);            
    //             const updatedEveMockFa2TokenBalance        = updatedEveMockFa2Ledger == undefined ? 0 : updatedEveMockFa2Ledger.toNumber();
    
    //             const updatedVaultMockFa2Ledger            = await updatedMockFa2TokenStorage.ledger.get(vaultAddress);            
    //             const updatedVaultMockFa2TokenBalance      = updatedVaultMockFa2Ledger == undefined ? 0 : updatedVaultMockFa2Ledger.toNumber();
                
    
    //             assert.equal(updatedVaultCollateralTokenBalance, initialVaultCollateralTokenBalance - withdrawAmount);
    //             assert.equal(updatedVaultMockFa2TokenBalance, vaultInitialMockFa2TokenBalance - withdrawAmount);
    //             assert.equal(updatedEveMockFa2TokenBalance, eveInitialMockFa2TokenBalance + withdrawAmount);

                
    //         } catch(e){
    //             console.log(e);
    //         } 
    //     });

    // });


    // 
    // Test: Pause Loan Token - cannot add liquidity, can remove liquidity
    // 
    // describe('test paused collateral token', function () {

    //     it('admin should be able to update and pause a collateral token', async () => {

    //         try{        
                
    //             // init variables
    //             await helperFunctions.signerFactory(tezos, bob.sk);

    //             const tokenName                             = "eurl";

    //             const updateCollateralTokenActionType       = "updateCollateralToken";
    //             const newOracleAddress                      = contractDeployments.mockUsdMockFa12TokenAggregator.address;
    //             const stakingContractAddress                = null;
    //             const maxDepositAmount                      = null;
    //             const isPaused                              = true;
                
    //             const adminSetMockFa2CollateralTokenOperation = await lendingControllerInstance.methods.setCollateralToken(

    //                 updateCollateralTokenActionType,
                    
    //                 tokenName,
    //                 newOracleAddress,
    //                 isPaused,

    //                 stakingContractAddress,
    //                 maxDepositAmount

    //             ).send();
    //             await adminSetMockFa2CollateralTokenOperation.confirmation();

    //             lendingControllerStorage               = await lendingControllerInstance.storage();
    //             const updatedMockFa2CollateralToken    = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

    //             // collateral token should now be paused
    //             assert.equal(updatedMockFa2CollateralToken.isPaused       , isPaused);

    //         } catch(e){
    //             console.log(e);
    //         } 
    //     });


    //     it('user (eve) should not be able to deposit mock FA2 collateral tokens into her vault', async () => {
    
    //         // init variables
    //         await helperFunctions.signerFactory(tezos, eve.sk);
    //         const vaultId            = eveVaultSet[1];
    //         const vaultOwner         = eve.pkh;
    //         const tokenName          = "eurl";
    //         const depositAmount      = 10000000;   // 10 Mock FA2 Tokens

    //         lendingControllerStorage = await lendingControllerInstance.storage();

    //         // create vault handle
    //         const vaultHandle = {
    //             "id"     : vaultId,
    //             "owner"  : vaultOwner
    //         };

    //         // get vault from Lending Controller        
    //         const vault = await lendingControllerStorage.vaults.get(vaultHandle);

    //         // get vault contract
    //         const vaultAddress             = vault.address;
    //         const vaultInstance            = await utils.tezos.contract.at(vaultAddress);

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

    //         // eve fails to deposit mock FA2 tokens into vault
    //         const eveDepositTokenOperation  = await vaultInstance.methods.initVaultAction(
    //             "deposit",
    //             depositAmount, 
    //             tokenName
    //         );
    //         await chai.expect(eveDepositTokenOperation.send()).to.be.rejected;    

    //     });

    //     it('user (eve) should still be able to withdraw from vault even if collateral token is paused', async () => {

    //         try{        

    //             await helperFunctions.signerFactory(tezos, eve.sk);
    //             const vaultId              = eveVaultSet[1]; 
    //             const vaultOwner           = eve.pkh;
    //             const withdrawAmount       = 100000; // 0.1 mockFa2 token
    //             const tokenName            = 'mockFa2';
    
    //             const vaultHandle = {
    //                 "id"     : vaultId,
    //                 "owner"  : vaultOwner
    //             };
    
    //             const lendingControllerStorage      = await lendingControllerInstance.storage();
    //             const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);
    
    //             const initialVaultCollateralTokenBalance   = await vault.collateralBalanceLedger.get(tokenName);
    
    //             // get vault contract
    //             const vaultAddress = vault.address;
    
    //             // get initial balance for Eve and Vault
    //             const eveMockFa2Ledger                  = await mockFa2TokenStorage.ledger.get(eve.pkh);            
    //             const eveInitialMockFa2TokenBalance     = eveMockFa2Ledger == undefined ? 0 : eveMockFa2Ledger.toNumber();
    
    //             const vaultMockFa2Ledger                = await mockFa2TokenStorage.ledger.get(vaultAddress);            
    //             const vaultInitialMockFa2TokenBalance   = vaultMockFa2Ledger == undefined ? 0 : vaultMockFa2Ledger.toNumber();
    
    //             const eveVaultInstance         = await utils.tezos.contract.at(vaultAddress);
    
    //             // withdraw operation
    //             const eveWithdrawOperation  = await eveVaultInstance.methods.initVaultAction(
    //                 "withdraw",
    //                 withdrawAmount,                 
    //                 tokenName                            
    //             ).send();
    //             await eveWithdrawOperation.confirmation();
    
    //             // get updated storages for lending controller and vault
    //             const updatedLendingControllerStorage      = await lendingControllerInstance.storage();
    //             const updatedVault                         = await updatedLendingControllerStorage.vaults.get(vaultHandle);
    //             const updatedVaultCollateralTokenBalance   = await updatedVault.collateralBalanceLedger.get(tokenName);
    //             const updatedMockFa2TokenStorage           = await mockFa2TokenInstance.storage();
    
    //             // get updated balance for Eve and Vault
    //             const updatedEveMockFa2Ledger              = await updatedMockFa2TokenStorage.ledger.get(eve.pkh);            
    //             const updatedEveMockFa2TokenBalance        = updatedEveMockFa2Ledger == undefined ? 0 : updatedEveMockFa2Ledger.toNumber();
    
    //             const updatedVaultMockFa2Ledger            = await updatedMockFa2TokenStorage.ledger.get(vaultAddress);            
    //             const updatedVaultMockFa2TokenBalance      = updatedVaultMockFa2Ledger == undefined ? 0 : updatedVaultMockFa2Ledger.toNumber();
                
    
    //             assert.equal(updatedVaultCollateralTokenBalance, initialVaultCollateralTokenBalance - withdrawAmount);
    //             assert.equal(updatedVaultMockFa2TokenBalance, vaultInitialMockFa2TokenBalance - withdrawAmount);
    //             assert.equal(updatedEveMockFa2TokenBalance, eveInitialMockFa2TokenBalance + withdrawAmount);

                
    //         } catch(e){
    //             console.log(e);
    //         } 
    //     });

    // });

});