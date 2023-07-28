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
import { 
    signerFactory, 
    almostEqual,
    fa2Transfer,
    updateOperators,
    updateGeneralContracts
} from './helpers/helperFunctions'

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

    let admin
    let adminSk

    let lendingControllerAddress

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
    let pauseOperation
    let unpauseOperation
    let pauseAllOperation
    let unpauseAllOperation
    let compoundOperation

    before("setup", async () => {

        utils = new Utils();
        await utils.init(bob.sk);
        tezos = utils.tezos

        admin   = bob.pkh 
        adminSk = bob.sk
        
        lendingControllerAddress                = contractDeployments.lendingController.address;

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

        lendingControllerInstance               = await utils.tezos.contract.at(lendingControllerAddress);
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

        console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')

        // ------------------------------------------------------------------
        //
        //  Set Lending Controller Mock Time address in Governance General Contracts
        //
        // ------------------------------------------------------------------

        
        const updateGeneralContractsOperation = await updateGeneralContracts(governanceInstance, 'lendingController', lendingControllerAddress, 'update');
        await updateGeneralContractsOperation.confirmation();
        

        // ------------------------------------------------------------------
        //
        // Update mTokens (i.e. mTokens) tokenRewardIndex by transferring 0
        //  - this will ensure that fetching user balances through on-chain views are accurate for continuous re-testing
        //
        // ------------------------------------------------------------------
        await signerFactory(tezos, bob.sk);

        const mockFa12LoanToken = await lendingControllerStorage.loanTokenLedger.get("usdt"); 
        const mockFa2LoanToken  = await lendingControllerStorage.loanTokenLedger.get("eurl"); 
        const tezLoanToken      = await lendingControllerStorage.loanTokenLedger.get("tez");

        if(!(mockFa12LoanToken == undefined || mockFa12LoanToken == null)){
            // zero transfer to update token reward index
            updateTokenRewardIndexOperation = await fa2Transfer(mTokenUsdtInstance, bob.pkh, eve.pkh, 0, 0);
            await updateTokenRewardIndexOperation.confirmation();
        }

        if(!(mockFa2LoanToken == undefined || mockFa2LoanToken == null)){
            // zero transfer to update token reward index
            updateTokenRewardIndexOperation = await fa2Transfer(mTokenEurlInstance, bob.pkh, eve.pkh, 0, 0);
            await updateTokenRewardIndexOperation.confirmation();
        }

        if(!(tezLoanToken == undefined || tezLoanToken == null)){
            // zero transfer to update token reward index
            updateTokenRewardIndexOperation = await fa2Transfer(mTokenXtzInstance, bob.pkh, eve.pkh, 0, 0);
            await updateTokenRewardIndexOperation.confirmation();
        }

    });



    // 
    // Setup and test Lending Controller SetLoanToken entrypoint
    //
    describe('%setLoanToken - setup and test lending controller %setLoanToken entrypoint', function () {

        it('admin can set mock FA12 as a loan token', async () => {

            try{        
                
                // init variables
                await signerFactory(tezos, bob.sk);

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
    
                    assert.equal(mockFa12LoanToken.rawMTokensTotalSupply          , 0);
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
                await signerFactory(tezos, bob.sk);

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

                    assert.equal(mockFa2LoanToken.rawMTokensTotalSupply          , 0);
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
                await signerFactory(tezos, bob.sk);

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

                    assert.equal(tezLoanToken.rawMTokensTotalSupply          , 0);
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
                await signerFactory(tezos, bob.sk);

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

                    assert.equal(mockFa2LoanToken.rawMTokensTotalSupply          , 0);
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

                    assert.equal(updatedMockFa2LoanToken.rawMTokensTotalSupply          , 0);
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
                await signerFactory(tezos, alice.sk);
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
                await signerFactory(tezos, alice.sk);
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
                await signerFactory(tezos, bob.sk);

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
                await signerFactory(tezos, bob.sk);

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
                await signerFactory(tezos, bob.sk);

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
                await signerFactory(tezos, bob.sk);

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
                await signerFactory(tezos, bob.sk);

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
                await signerFactory(tezos, alice.sk);
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
                await signerFactory(tezos, alice.sk);
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
        
                await signerFactory(tezos, bob.sk);
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
        
                await signerFactory(tezos, bob.sk);
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
        
                await signerFactory(tezos, mallory.sk);
        
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
        
                await signerFactory(tezos, mallory.sk);
        
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
                await signerFactory(tezos, eve.sk);
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
                await signerFactory(tezos, mallory.sk);
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
                await signerFactory(tezos, mallory.sk);
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
                await signerFactory(tezos, eve.sk);
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
                await signerFactory(tezos, eve.sk);
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
            await signerFactory(tezos, eve.sk);
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
            await signerFactory(tezos, mallory.sk);
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
            await signerFactory(tezos, mallory.sk);
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
            await signerFactory(tezos, eve.sk);
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
            await signerFactory(tezos, eve.sk);
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
            await signerFactory(tezos, mallory.sk);
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
            await signerFactory(tezos, eve.sk);
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
            await signerFactory(tezos, mallory.sk);
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
            await signerFactory(tezos, eve.sk);
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
            await signerFactory(tezos, mallory.sk);
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
            await signerFactory(tezos, eve.sk);
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
            updateOperatorsOperation = await updateOperators(mockFa2TokenInstance, eve.pkh, vaultAddress, tokenId);
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
            await signerFactory(tezos, mallory.sk);
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
            updateOperatorsOperation = await updateOperators(mockFa2TokenInstance, mallory.pkh, vaultAddress, tokenId);
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
            await signerFactory(tezos, eve.sk);
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
            updateOperatorsOperation = await updateOperators(mockFa2TokenInstance, eve.pkh, vaultAddress, tokenId);
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
            await signerFactory(tezos, mallory.sk);
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
            updateOperatorsOperation = await updateOperators(mockFa2TokenInstance, mallory.pkh, vaultAddress, tokenId);
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
            await signerFactory(tezos, eve.sk);
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
            updateOperatorsOperation = await updateOperators(mockFa2TokenInstance, eve.pkh, vaultAddress, tokenId);
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
            await signerFactory(tezos, mallory.sk);
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
            updateOperatorsOperation = await updateOperators(mockFa2TokenInstance, mallory.pkh, vaultAddress, tokenId);
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
            await signerFactory(tezos, eve.sk);
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
            const lendingControllerMockFa12Ledger                = await mockFa12TokenStorage.ledger.get(lendingControllerAddress);            
            const lendingControllerInitialMockFa12TokenBalance   = lendingControllerMockFa12Ledger == undefined ? 0 : lendingControllerMockFa12Ledger.balance.toNumber();

            // get initial lending controller token pool total
            const initialLoanTokenRecord                 = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
            const lendingControllerInitialTokenPoolTotal = initialLoanTokenRecord.tokenPoolTotal.toNumber();

            // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
            // reset token allowance
            const resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
                lendingControllerAddress,
                0
            ).send();
            await resetTokenAllowance.confirmation();

            // set new token allowance
            const setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
                lendingControllerAddress,
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
            const lendingControllerMockFa12Account  = await updatedMockFa12TokenStorage.ledger.get(lendingControllerAddress);            
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
            await signerFactory(tezos, eve.sk);
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
            const lendingControllerMockFa2Ledger                = await mockFa2TokenStorage.ledger.get(lendingControllerAddress);            
            const lendingControllerInitialMockFa2TokenBalance   = lendingControllerMockFa2Ledger == undefined ? 0 : lendingControllerMockFa2Ledger.toNumber();

            // get initial lending controller token pool total
            const initialLoanTokenRecord                 = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
            const lendingControllerInitialTokenPoolTotal = initialLoanTokenRecord.tokenPoolTotal.toNumber();

            // update operators for vault
            updateOperatorsOperation = await updateOperators(mockFa2TokenInstance, eve.pkh, lendingControllerAddress, tokenId);
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
            const lendingControllerMockFa2Account             = await updatedMockFa2TokenStorage.ledger.get(lendingControllerAddress);            
            assert.equal(lendingControllerMockFa2Account, lendingControllerInitialMockFa2TokenBalance + liquidityAmount);

            // check Eve's mEurl Token Token balance
            const updatedEveMEurlTokenLedger        = await updatedMEurlTokenTokenStorage.ledger.get(eve.pkh);            
            assert.equal(updatedEveMEurlTokenLedger, eveInitialMEurlTokenTokenBalance + liquidityAmount);        

        });


        it('user (eve) can add liquidity for tez into Lending Controller token pool (10 XTZ)', async () => {
    
            // init variables
            await signerFactory(tezos, eve.sk);
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
            const lendingControllerInitialXtzLedger   = await utils.tezos.tz.getBalance(lendingControllerAddress);
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
            const lendingControllerXtzBalance             = await utils.tezos.tz.getBalance(lendingControllerAddress);
            assert.equal(lendingControllerXtzBalance, lendingControllerInitialXtzBalance + liquidityAmount);

            // check Eve's mTokenXtz balance
            const updatedEveMXtzTokenLedger        = await updatedMXtzTokenStorage.ledger.get(eve.pkh);            
            assert.equal(updatedEveMXtzTokenLedger, eveInitialMXtzTokenBalance + liquidityAmount);        

            // check Eve's XTZ Balance and account for gas cost in transaction with almostEqual
            const eveXtzBalance = await utils.tezos.tz.getBalance(eve.pkh);
            assert.equal(almostEqual(eveXtzBalance, eveInitialXtzBalance - liquidityAmount, 0.0001), true)

        });
    
    }); // end test: add liquidity 



    // 
    // Test: Remove Liquidity from Lending Pool
    //
    describe('%removeLiquidity', function () {
    
        it('user (eve) can remove liquidity for mock FA12 token from Lending Controller token pool (5 MockFA12 Tokens)', async () => {
    
            // init variables
            await signerFactory(tezos, eve.sk);
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
            const lendingControllerMockFa12Ledger                = await mockFa12TokenStorage.ledger.get(lendingControllerAddress);            
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
            const lendingControllerMockFa12Account  = await updatedMockFa12TokenStorage.ledger.get(lendingControllerAddress);            
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
            await signerFactory(tezos, eve.sk);
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
            const lendingControllerMockFa2Ledger                = await mockFa2TokenStorage.ledger.get(lendingControllerAddress);            
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
            const lendingControllerMockFa2Account  = await updatedMockFa2TokenStorage.ledger.get(lendingControllerAddress);            
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
            await signerFactory(tezos, eve.sk);
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
            const lendingControllerInitialXtzLedger   = await utils.tezos.tz.getBalance(lendingControllerAddress);
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
            const lendingControllerXtzBalance = await utils.tezos.tz.getBalance(lendingControllerAddress);
            assert.equal(lendingControllerXtzBalance, lendingControllerInitialXtzBalance - withdrawAmount);

            // 3) check Eve's mTokenXtz balance
            const updatedEveMXtzTokenLedger = await updatedMXtzTokenStorage.ledger.get(eve.pkh);            
            assert.equal(updatedEveMXtzTokenLedger, eveInitialMXtzTokenBalance - withdrawAmount);        

            // 4) check Eve's XTZ Balance and account for gas cost in transaction with almostEqual
            const eveXtzBalance = await utils.tezos.tz.getBalance(eve.pkh);
            assert.equal(almostEqual(eveXtzBalance, eveInitialXtzBalance + withdrawAmount, 0.0001), true)

        });

        it('user (eve) cannot remove more liquidity than he has (mock FA12 token)', async () => {
    
            // init variables
            await signerFactory(tezos, eve.sk);
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
            await signerFactory(tezos, eve.sk);
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
            await signerFactory(tezos, eve.sk);
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

            await signerFactory(tezos, eve.sk);
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

            await signerFactory(tezos, eve.sk);
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

            await signerFactory(tezos, eve.sk);
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

            assert.equal(almostEqual(updatedEveXtzBalance, eveInitialXtzBalance + finalLoanAmount, 0.0001), true)

        })


        it('user (eve) can borrow again from the same vault (1 Mock FA12 Tokens)', async () => {

            await signerFactory(tezos, eve.sk);
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

            await signerFactory(tezos, eve.sk);

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
            await signerFactory(tezos, bob.sk);
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
            await signerFactory(tezos, eve.sk);
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
            const lendingControllerMockFa12Ledger                = await mockFa12TokenStorage.ledger.get(lendingControllerAddress);            
            const lendingControllerInitialMockFa12TokenBalance   = lendingControllerMockFa12Ledger == undefined ? 0 : lendingControllerMockFa12Ledger.balance.toNumber();

            // get initial lending controller token pool total
            const initialLoanTokenRecord                 = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
            const lendingControllerInitialTokenPoolTotal = initialLoanTokenRecord.tokenPoolTotal.toNumber();

            // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
            // reset token allowance
            const resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
                lendingControllerAddress,
                0
            ).send();
            await resetTokenAllowance.confirmation();

            // set new token allowance
            const setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
                lendingControllerAddress,
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
            const lendingControllerMockFa12Account  = await updatedMockFa12TokenStorage.ledger.get(lendingControllerAddress);            
            assert.equal(lendingControllerMockFa12Account.balance, lendingControllerInitialMockFa12TokenBalance + depositAmount);

            // check Eve's mUsdt Token Token balance
            const updatedEveMUsdtTokenLedger    = await mTokenUsdtInstance.contractViews.get_balance({ 0 : eve.pkh, 1 : 0}).executeView({ viewCaller : bob.pkh});
            assert.equal(updatedEveMUsdtTokenLedger, eveInitialMUsdtTokenTokenBalance.toNumber() + depositAmount);

        })



        it('user (eve) can borrow again after liquidity has been added (3 MockFA12 Tokens)', async () => {

            await signerFactory(tezos, eve.sk);
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
            await signerFactory(tezos, alice.sk);

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

            await signerFactory(tezos, eve.sk);
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
                lendingControllerAddress,
                0
            ).send();
            await resetTokenAllowance.confirmation();

            // set new token allowance
            const setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
                lendingControllerAddress,
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

            await signerFactory(tezos, eve.sk);
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
            updateOperatorsOperation = await updateOperators(mockFa2TokenInstance, eve.pkh, lendingControllerAddress, tokenId);
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

            await signerFactory(tezos, eve.sk);
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
            assert.equal(almostEqual(updatedEveXtzBalance, eveInitialXtzBalance - repayAmount, 0.0001), true)

        })


        it('user (eve) should not be able to repay less than the min repayment amount', async () => {

            await signerFactory(tezos, eve.sk);
        
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

            await signerFactory(tezos, eve.sk);
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
            assert.equal(almostEqual(updatedEveXtzBalance, eveInitialXtzBalance + withdrawAmount, 0.0001), true)            

        });


        it('user (eve) can withdraw mockFa12 token from her vault', async () => {

            await signerFactory(tezos, eve.sk);
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

            await signerFactory(tezos, eve.sk);
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

            await signerFactory(tezos, eve.sk);
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

            await signerFactory(tezos, eve.sk);
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

            await signerFactory(tezos, eve.sk);
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

            const compoundOperation   = await doormanInstance.methods.compound([eve.pkh]).send();
            await compoundOperation.confirmation();
                
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
            updateOperatorsOperation = await updateOperators(mvkTokenInstance, eve.pkh, contractDeployments.doorman.address, tokenId);
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

            await signerFactory(tezos, eve.sk);
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

            const compoundOperation = await doormanInstance.methods.compound([eve.pkh]).send();
            await compoundOperation.confirmation();

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

            await signerFactory(tezos, mallory.sk);
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

            const compoundOperation = await doormanInstance.methods.compound([eve.pkh, initiator]).send();
            await compoundOperation.confirmation();

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
            updateOperatorsOperation = await updateOperators(mvkTokenInstance, initiator, contractDeployments.doorman.address, tokenId);
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

            await signerFactory(tezos, eve.sk);
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
                
            const compoundOperation = await doormanInstance.methods.compound([eve.pkh]).send();
            await compoundOperation.confirmation();

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

            await signerFactory(tezos, eve.sk);
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

            const compoundOperation = await doormanInstance.methods.compound([eve.pkh]).send();
            await compoundOperation.confirmation();

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

            await signerFactory(tezos, mallory.sk);
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

            const compoundOperation = await doormanInstance.methods.compound([eve.pkh]).send();
            await compoundOperation.confirmation();

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
    // Test: Reset Admin
    //
    describe('reset admin for continuous retesting - Lending Controller and Vault Controller', function () {
    
        it('admin can reset admin for lending controller back to bob through governance proxy', async () => {
            try{        
        
                await signerFactory(tezos, bob.sk);

                // Initial values
                const newAdmin       = bob.pkh;

                // Operation
                const lambdaFunction = await createLambdaBytes(
                    tezos.rpc.url,
                    contractDeployments.governanceProxy.address,
                    
                    'setAdmin',
                    [
                        lendingControllerAddress,
                        newAdmin
                    ]
                );
                const operation = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                await operation.confirmation();

                // Final values
                lendingControllerStorage = await lendingControllerInstance.storage();
                const finalAdmin         = lendingControllerStorage.admin;

                // Assertions
                assert.strictEqual(finalAdmin, newAdmin);

            } catch(e){
                console.log(e);
            } 

        });   


        it('admin can reset admin for vault factory back to bob through governance proxy', async () => {
            try{        
        
                await signerFactory(tezos, bob.sk);

                // Initial values
                const newAdmin       = bob.pkh;

                // Operation
                const lambdaFunction = await createLambdaBytes(
                    tezos.rpc.url,
                    contractDeployments.governanceProxy.address,
                    
                    'setAdmin',
                    [
                        contractDeployments.vaultFactory.address,
                        newAdmin
                    ]
                );
                const operation = await governanceProxyInstance.methods.executeGovernanceAction(lambdaFunction).send();
                await operation.confirmation();

                // Final values
                vaultFactoryStorage   = await vaultFactoryInstance.storage();
                const finalAdmin      = vaultFactoryStorage.admin;

                // Assertions
                assert.strictEqual(finalAdmin, newAdmin);

            } catch(e){
                console.log(e);
            } 

        });   

    })

    describe("Housekeeping Entrypoints", async () => {

        beforeEach("Set signer to admin (bob)", async () => {
            lendingControllerStorage        = await lendingControllerInstance.storage();
            await signerFactory(tezos, bob.sk);
        });

        it('%setAdmin                 - admin (bob) should be able to update the contract admin address', async () => {
            try{
                
                // Initial Values
                lendingControllerStorage     = await lendingControllerInstance.storage();
                const currentAdmin = lendingControllerStorage.admin;
                assert.strictEqual(currentAdmin, admin);

                // Operation
                const setAdminOperation = await lendingControllerInstance.methods.setAdmin(alice.pkh).send();
                await setAdminOperation.confirmation();

                // Final values
                lendingControllerStorage   = await lendingControllerInstance.storage();
                const newAdmin = lendingControllerStorage.admin;

                // Assertions
                assert.notStrictEqual(newAdmin, currentAdmin);
                assert.strictEqual(newAdmin, alice.pkh);
                
                // reset admin
                await signerFactory(tezos, alice.sk);
                const resetAdminOperation = await lendingControllerInstance.methods.setAdmin(admin).send();
                await resetAdminOperation.confirmation();

            } catch(e){
                console.log(e);
            }
        });

        it('%setGovernance            - admin (bob) should be able to update the contract governance address', async () => {
            try{
                
                // Initial Values
                lendingControllerStorage = await lendingControllerInstance.storage();
                const currentGovernance  = lendingControllerStorage.governanceAddress;

                // Operation
                let setGovernanceOperation = await lendingControllerInstance.methods.setGovernance(alice.pkh).send();
                await setGovernanceOperation.confirmation();

                // Final values
                lendingControllerStorage   = await lendingControllerInstance.storage();
                const updatedGovernance = lendingControllerStorage.governanceAddress;

                // reset governance
                setGovernanceOperation = await lendingControllerInstance.methods.setGovernance(contractDeployments.governance.address).send();
                await setGovernanceOperation.confirmation();

                // Assertions
                assert.notStrictEqual(updatedGovernance, currentGovernance);
                assert.strictEqual(updatedGovernance, alice.pkh);
                assert.strictEqual(currentGovernance, contractDeployments.governance.address);

            } catch(e){
                console.log(e);
            }
        });

        it('%updateConfig             - admin (bob) should be able to update contract config', async () => {
            try{
                
                // Initial Values
                const initialLendingControllerStorage = await lendingControllerInstance.storage();
                
                const newTestValue = 100;

                // Operation
                let updateConfigOperation = await lendingControllerInstance.methods.updateConfig(newTestValue, "configCollateralRatio").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await lendingControllerInstance.methods.updateConfig(newTestValue, "configLiquidationRatio").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await lendingControllerInstance.methods.updateConfig(newTestValue, "configLiquidationFeePercent").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await lendingControllerInstance.methods.updateConfig(newTestValue, "configAdminLiquidationFee").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await lendingControllerInstance.methods.updateConfig(newTestValue, "configMinimumLoanFeePercent").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await lendingControllerInstance.methods.updateConfig(newTestValue, "configMinLoanFeeTreasuryShare").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await lendingControllerInstance.methods.updateConfig(newTestValue, "configInterestTreasuryShare").send();
                await updateConfigOperation.confirmation();

                // Final values
                lendingControllerStorage           = await lendingControllerInstance.storage();
                const collateralRatio = lendingControllerStorage.config.collateralRatio;

                // Assertions
                assert.equal(newTestValue, lendingControllerStorage.config.collateralRatio);
                assert.equal(newTestValue, lendingControllerStorage.config.liquidationRatio);
                assert.equal(newTestValue, lendingControllerStorage.config.liquidationFeePercent);
                assert.equal(newTestValue, lendingControllerStorage.config.adminLiquidationFeePercent);
                assert.equal(newTestValue, lendingControllerStorage.config.minimumLoanFeePercent);
                assert.equal(newTestValue, lendingControllerStorage.config.minimumLoanFeeTreasuryShare);
                assert.equal(newTestValue, lendingControllerStorage.config.interestTreasuryShare);

                // reset config operation
                updateConfigOperation = await lendingControllerInstance.methods.updateConfig(initialLendingControllerStorage.config.collateralRatio, "configCollateralRatio").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await lendingControllerInstance.methods.updateConfig(initialLendingControllerStorage.config.liquidationRatio, "configLiquidationRatio").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await lendingControllerInstance.methods.updateConfig(initialLendingControllerStorage.config.liquidationFeePercent, "configLiquidationFeePercent").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await lendingControllerInstance.methods.updateConfig(initialLendingControllerStorage.config.adminLiquidationFeePercent, "configAdminLiquidationFee").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await lendingControllerInstance.methods.updateConfig(initialLendingControllerStorage.config.minimumLoanFeePercent, "configMinimumLoanFeePercent").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await lendingControllerInstance.methods.updateConfig(initialLendingControllerStorage.config.minimumLoanFeeTreasuryShare, "configMinLoanFeeTreasuryShare").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await lendingControllerInstance.methods.updateConfig(initialLendingControllerStorage.config.interestTreasuryShare, "configInterestTreasuryShare").send();
                await updateConfigOperation.confirmation();

                // Final values
                lendingControllerStorage = await lendingControllerInstance.storage();

                assert.equal(initialLendingControllerStorage.config.collateralRatio.toNumber(), lendingControllerStorage.config.collateralRatio.toNumber());
                assert.equal(initialLendingControllerStorage.config.liquidationRatio.toNumber(), lendingControllerStorage.config.liquidationRatio.toNumber());
                assert.equal(initialLendingControllerStorage.config.liquidationFeePercent.toNumber(), lendingControllerStorage.config.liquidationFeePercent.toNumber());
                assert.equal(initialLendingControllerStorage.config.adminLiquidationFeePercent.toNumber(), lendingControllerStorage.config.adminLiquidationFeePercent.toNumber());
                assert.equal(initialLendingControllerStorage.config.minimumLoanFeePercent.toNumber(), lendingControllerStorage.config.minimumLoanFeePercent.toNumber());
                assert.equal(initialLendingControllerStorage.config.minimumLoanFeeTreasuryShare.toNumber(), lendingControllerStorage.config.minimumLoanFeeTreasuryShare.toNumber());
                assert.equal(initialLendingControllerStorage.config.interestTreasuryShare.toNumber(), lendingControllerStorage.config.interestTreasuryShare.toNumber());

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        
        it("%pauseAll                 - admin (bob) should be able to call this entrypoint", async() => {
            try{

                pauseAllOperation = await lendingControllerInstance.methods.pauseAll().send(); 
                await pauseAllOperation.confirmation();

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%unpauseAll               - admin (bob) should be able to call this entrypoint", async() => {
            try{

                unpauseAllOperation = await lendingControllerInstance.methods.unpauseAll().send(); 
                await unpauseAllOperation.confirmation();

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%togglePauseEntrypoint    - admin (bob) should be able to call this entrypoint", async() => {
            try{
                
                // pause operations

                pauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("setLoanToken", true).send(); 
                await pauseOperation.confirmation();
                
                pauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("setCollateralToken", true).send(); 
                await pauseOperation.confirmation();

                pauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("addLiquidity", true).send();
                await pauseOperation.confirmation();

                pauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("removeLiquidity", true).send();
                await pauseOperation.confirmation();

                pauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("registerVaultCreation", true).send();
                await pauseOperation.confirmation();

                pauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("closeVault", true).send();
                await pauseOperation.confirmation();

                pauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("registerDeposit", true).send();
                await pauseOperation.confirmation();

                pauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("registerWithdrawal", true).send();
                await pauseOperation.confirmation();

                pauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("markForLiquidation", true).send();
                await pauseOperation.confirmation();

                pauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("liquidateVault", true).send();
                await pauseOperation.confirmation();

                pauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("borrow", true).send();
                await pauseOperation.confirmation();

                pauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("repay", true).send();
                await pauseOperation.confirmation();

                pauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("vaultDeposit", true).send();
                await pauseOperation.confirmation();

                pauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("vaultWithdraw", true).send();
                await pauseOperation.confirmation();

                pauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("vaultOnLiquidate", true).send();
                await pauseOperation.confirmation();

                pauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("vaultDepositStakedToken", true).send();
                await pauseOperation.confirmation();

                pauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("vaultWithdrawStakedToken", true).send();
                await pauseOperation.confirmation();

                // update storage
                lendingControllerStorage = await lendingControllerInstance.storage();

                // check that entrypoints are paused
                assert.equal(lendingControllerStorage.breakGlassConfig.setLoanTokenIsPaused                 , true)
                assert.equal(lendingControllerStorage.breakGlassConfig.setCollateralTokenIsPaused           , true)
                
                assert.equal(lendingControllerStorage.breakGlassConfig.addLiquidityIsPaused                 , true)
                assert.equal(lendingControllerStorage.breakGlassConfig.removeLiquidityIsPaused              , true)

                assert.equal(lendingControllerStorage.breakGlassConfig.registerVaultCreationIsPaused        , true)
                assert.equal(lendingControllerStorage.breakGlassConfig.closeVaultIsPaused                   , true)
                assert.equal(lendingControllerStorage.breakGlassConfig.registerDepositIsPaused              , true)
                assert.equal(lendingControllerStorage.breakGlassConfig.registerWithdrawalIsPaused           , true)
                assert.equal(lendingControllerStorage.breakGlassConfig.markForLiquidationIsPaused           , true)
                assert.equal(lendingControllerStorage.breakGlassConfig.liquidateVaultIsPaused               , true)
                assert.equal(lendingControllerStorage.breakGlassConfig.borrowIsPaused                       , true)
                assert.equal(lendingControllerStorage.breakGlassConfig.repayIsPaused                        , true)
                assert.equal(lendingControllerStorage.breakGlassConfig.vaultDepositIsPaused                 , true)
                assert.equal(lendingControllerStorage.breakGlassConfig.vaultWithdrawIsPaused                , true)
                assert.equal(lendingControllerStorage.breakGlassConfig.vaultOnLiquidateIsPaused             , true)

                assert.equal(lendingControllerStorage.breakGlassConfig.vaultDepositStakedTokenIsPaused      , true)
                assert.equal(lendingControllerStorage.breakGlassConfig.vaultWithdrawStakedTokenIsPaused     , true)

                // unpause operations

                unpauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("setLoanToken", false).send();
                await unpauseOperation.confirmation();
                
                unpauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("setCollateralToken", false).send();
                await unpauseOperation.confirmation();

                unpauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("addLiquidity", false).send();
                await unpauseOperation.confirmation();

                unpauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("removeLiquidity", false).send();
                await unpauseOperation.confirmation();

                unpauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("registerVaultCreation", false).send();
                await unpauseOperation.confirmation();

                unpauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("closeVault", false).send();
                await unpauseOperation.confirmation();

                unpauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("registerDeposit", false).send();
                await unpauseOperation.confirmation();

                unpauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("registerWithdrawal", false).send();
                await unpauseOperation.confirmation();

                unpauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("markForLiquidation", false).send();
                await unpauseOperation.confirmation();

                unpauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("liquidateVault", false).send();
                await unpauseOperation.confirmation();

                unpauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("borrow", false).send();
                await unpauseOperation.confirmation();

                unpauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("repay", false).send();
                await unpauseOperation.confirmation();

                unpauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("vaultDeposit", false).send();
                await unpauseOperation.confirmation();

                unpauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("vaultWithdraw", false).send();
                await unpauseOperation.confirmation();

                unpauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("vaultOnLiquidate", false).send();
                await unpauseOperation.confirmation();

                unpauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("vaultDepositStakedToken", false).send();
                await unpauseOperation.confirmation();

                unpauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("vaultWithdrawStakedToken", false).send();
                await unpauseOperation.confirmation();

                // update storage
                lendingControllerStorage = await lendingControllerInstance.storage();

                // check that entrypoints are unpaused
                assert.equal(lendingControllerStorage.breakGlassConfig.setLoanTokenIsPaused                 , false)
                assert.equal(lendingControllerStorage.breakGlassConfig.setCollateralTokenIsPaused           , false)

                assert.equal(lendingControllerStorage.breakGlassConfig.addLiquidityIsPaused                 , false)
                assert.equal(lendingControllerStorage.breakGlassConfig.removeLiquidityIsPaused              , false)

                assert.equal(lendingControllerStorage.breakGlassConfig.registerVaultCreationIsPaused        , false)
                assert.equal(lendingControllerStorage.breakGlassConfig.closeVaultIsPaused                   , false)
                assert.equal(lendingControllerStorage.breakGlassConfig.registerDepositIsPaused              , false)
                assert.equal(lendingControllerStorage.breakGlassConfig.registerWithdrawalIsPaused           , false)
                assert.equal(lendingControllerStorage.breakGlassConfig.markForLiquidationIsPaused           , false)
                assert.equal(lendingControllerStorage.breakGlassConfig.liquidateVaultIsPaused               , false)
                assert.equal(lendingControllerStorage.breakGlassConfig.borrowIsPaused                       , false)
                assert.equal(lendingControllerStorage.breakGlassConfig.repayIsPaused                        , false)
                assert.equal(lendingControllerStorage.breakGlassConfig.vaultDepositIsPaused                 , false)
                assert.equal(lendingControllerStorage.breakGlassConfig.vaultWithdrawIsPaused                , false)
                assert.equal(lendingControllerStorage.breakGlassConfig.vaultOnLiquidateIsPaused             , false)

                assert.equal(lendingControllerStorage.breakGlassConfig.vaultDepositStakedTokenIsPaused      , false)
                assert.equal(lendingControllerStorage.breakGlassConfig.vaultWithdrawStakedTokenIsPaused     , false)

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

    });

    describe('Access Control Checks', function () {

        beforeEach("Set signer to non-admin (mallory)", async () => {
            await signerFactory(tezos, mallory.sk);
        });

        it('%setAdmin                 - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                lendingControllerStorage      = await lendingControllerInstance.storage();
                const currentAdmin  = lendingControllerStorage.admin;

                // Operation
                const setAdminOperation = await lendingControllerInstance.methods.setAdmin(mallory.pkh);
                await chai.expect(setAdminOperation.send()).to.be.rejected;

                // Final values
                lendingControllerStorage    = await lendingControllerInstance.storage();
                const newAdmin    = lendingControllerStorage.admin;

                // Assertions
                assert.strictEqual(newAdmin, currentAdmin);

            } catch(e){
                console.log(e);
            }
        });

        it('%setGovernance            - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                lendingControllerStorage           = await lendingControllerInstance.storage();
                const currentGovernance  = lendingControllerStorage.governanceAddress;

                // Operation
                const setGovernanceOperation = await lendingControllerInstance.methods.setGovernance(mallory.pkh);
                await chai.expect(setGovernanceOperation.send()).to.be.rejected;

                // Final values
                lendingControllerStorage           = await lendingControllerInstance.storage();
                const updatedGovernance  = lendingControllerStorage.governanceAddress;

                // Assertions
                assert.strictEqual(updatedGovernance, currentGovernance);

            } catch(e){
                console.log(e);
            }
        });


        it('%updateConfig             - non-admin (mallory) should not be able to update contract config', async () => {
            try{
                
                // Initial Values
                const initialLendingControllerStorage = await lendingControllerInstance.storage();
                
                const newTestValue = 100;

                // Operation
                let updateConfigOperation = lendingControllerInstance.methods.updateConfig(newTestValue, "configCollateralRatio");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = lendingControllerInstance.methods.updateConfig(newTestValue, "configLiquidationRatio");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = lendingControllerInstance.methods.updateConfig(newTestValue, "configLiquidationFeePercent");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = lendingControllerInstance.methods.updateConfig(newTestValue, "configAdminLiquidationFee");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = lendingControllerInstance.methods.updateConfig(newTestValue, "configMinimumLoanFeePercent");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = lendingControllerInstance.methods.updateConfig(newTestValue, "configMinLoanFeeTreasuryShare");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = lendingControllerInstance.methods.updateConfig(newTestValue, "configInterestTreasuryShare");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                // Final values
                lendingControllerStorage = await lendingControllerInstance.storage();

                // check that there is no change in config values
                assert.equal(initialLendingControllerStorage.config.collateralRatio.toNumber(), lendingControllerStorage.config.collateralRatio.toNumber());
                assert.equal(initialLendingControllerStorage.config.liquidationRatio.toNumber(), lendingControllerStorage.config.liquidationRatio.toNumber());
                assert.equal(initialLendingControllerStorage.config.liquidationFeePercent.toNumber(), lendingControllerStorage.config.liquidationFeePercent.toNumber());
                assert.equal(initialLendingControllerStorage.config.adminLiquidationFeePercent.toNumber(), lendingControllerStorage.config.adminLiquidationFeePercent.toNumber());
                assert.equal(initialLendingControllerStorage.config.minimumLoanFeePercent.toNumber(), lendingControllerStorage.config.minimumLoanFeePercent.toNumber());
                assert.equal(initialLendingControllerStorage.config.minimumLoanFeeTreasuryShare.toNumber(), lendingControllerStorage.config.minimumLoanFeeTreasuryShare.toNumber());
                assert.equal(initialLendingControllerStorage.config.interestTreasuryShare.toNumber(), lendingControllerStorage.config.interestTreasuryShare.toNumber());
                
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it("%pauseAll                 - non-admin (mallory) should not be able to call this entrypoint", async() => {
            try{

                pauseAllOperation = lendingControllerInstance.methods.pauseAll(); 
                await chai.expect(pauseAllOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%unpauseAll               - non-admin (mallory) should not be able to call this entrypoint", async() => {
            try{

                unpauseAllOperation = lendingControllerInstance.methods.unpauseAll(); 
                await chai.expect(unpauseAllOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%togglePauseEntrypoint    - non-admin (mallory) should not be able to call this entrypoint", async() => {
            try{
                
                // pause operations
                pauseOperation = lendingControllerInstance.methods.togglePauseEntrypoint("setLoanToken", true); 
                await chai.expect(pauseOperation.send()).to.be.rejected;
                
                pauseOperation = lendingControllerInstance.methods.togglePauseEntrypoint("setCollateralToken", true);
                await chai.expect(pauseOperation.send()).to.be.rejected;

                pauseOperation = lendingControllerInstance.methods.togglePauseEntrypoint("addLiquidity", true);
                await chai.expect(pauseOperation.send()).to.be.rejected;

                pauseOperation = lendingControllerInstance.methods.togglePauseEntrypoint("removeLiquidity", true);
                await chai.expect(pauseOperation.send()).to.be.rejected;

                pauseOperation = lendingControllerInstance.methods.togglePauseEntrypoint("registerVaultCreation", true);
                await chai.expect(pauseOperation.send()).to.be.rejected;

                pauseOperation = lendingControllerInstance.methods.togglePauseEntrypoint("closeVault", true);
                await chai.expect(pauseOperation.send()).to.be.rejected;

                pauseOperation = lendingControllerInstance.methods.togglePauseEntrypoint("registerDeposit", true);
                await chai.expect(pauseOperation.send()).to.be.rejected;

                pauseOperation = lendingControllerInstance.methods.togglePauseEntrypoint("registerWithdrawal", true);
                await chai.expect(pauseOperation.send()).to.be.rejected;

                pauseOperation = lendingControllerInstance.methods.togglePauseEntrypoint("markForLiquidation", true);
                await chai.expect(pauseOperation.send()).to.be.rejected;

                pauseOperation = lendingControllerInstance.methods.togglePauseEntrypoint("liquidateVault", true);
                await chai.expect(pauseOperation.send()).to.be.rejected;

                pauseOperation = lendingControllerInstance.methods.togglePauseEntrypoint("borrow", true);
                await chai.expect(pauseOperation.send()).to.be.rejected;

                pauseOperation = lendingControllerInstance.methods.togglePauseEntrypoint("repay", true);
                await chai.expect(pauseOperation.send()).to.be.rejected;

                pauseOperation = lendingControllerInstance.methods.togglePauseEntrypoint("vaultDeposit", true);
                await chai.expect(pauseOperation.send()).to.be.rejected;

                pauseOperation = lendingControllerInstance.methods.togglePauseEntrypoint("vaultWithdraw", true);
                await chai.expect(pauseOperation.send()).to.be.rejected;

                pauseOperation = lendingControllerInstance.methods.togglePauseEntrypoint("vaultOnLiquidate", true);
                await chai.expect(pauseOperation.send()).to.be.rejected;

                pauseOperation = lendingControllerInstance.methods.togglePauseEntrypoint("vaultDepositStakedToken", true);
                await chai.expect(pauseOperation.send()).to.be.rejected;

                pauseOperation = lendingControllerInstance.methods.togglePauseEntrypoint("vaultWithdrawStakedToken", true);
                await chai.expect(pauseOperation.send()).to.be.rejected;

                // unpause operations

                unpauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("setLoanToken", false);
                await chai.expect(unpauseOperation.send()).to.be.rejected;
                
                unpauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("setCollateralToken", false);
                await chai.expect(unpauseOperation.send()).to.be.rejected;

                unpauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("addLiquidity", false);
                await chai.expect(unpauseOperation.send()).to.be.rejected;

                unpauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("removeLiquidity", false);
                await chai.expect(unpauseOperation.send()).to.be.rejected;

                unpauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("registerVaultCreation", false);
                await chai.expect(unpauseOperation.send()).to.be.rejected;

                unpauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("closeVault", false);
                await chai.expect(unpauseOperation.send()).to.be.rejected;

                unpauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("registerDeposit", false);
                await chai.expect(unpauseOperation.send()).to.be.rejected;

                unpauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("registerWithdrawal", false);
                await chai.expect(unpauseOperation.send()).to.be.rejected;

                unpauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("markForLiquidation", false);
                await chai.expect(unpauseOperation.send()).to.be.rejected;

                unpauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("liquidateVault", false);
                await chai.expect(unpauseOperation.send()).to.be.rejected;

                unpauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("borrow", false);
                await chai.expect(unpauseOperation.send()).to.be.rejected;

                unpauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("repay", false);
                await chai.expect(unpauseOperation.send()).to.be.rejected;

                unpauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("vaultDeposit", false);
                await chai.expect(unpauseOperation.send()).to.be.rejected;

                unpauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("vaultWithdraw", false);
                await chai.expect(unpauseOperation.send()).to.be.rejected;

                unpauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("vaultOnLiquidate", false);
                await chai.expect(unpauseOperation.send()).to.be.rejected;

                unpauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("vaultDepositStakedToken", false);
                await chai.expect(unpauseOperation.send()).to.be.rejected;

                unpauseOperation = await lendingControllerInstance.methods.togglePauseEntrypoint("vaultWithdrawStakedToken", false);
                await chai.expect(unpauseOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%setLambda                - non-admin (mallory) should not be able to call this entrypoint", async() => {
            try{

                // random lambda for testing
                const randomLambdaName  = "randomLambdaName";
                const randomLambdaBytes = "050200000cba0743096500000112075e09650000005a036e036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a0362036203620362036200000000036203620760036803690000000009650000000a0362036203620362036e00000000075e09650000006c09650000000a0362036203620362036200000000036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a036203620362036203620000000003620362076003680369000000000362075e07650765036203620362036c075e076507650368036e0362036e036200000000070702000001770743075e076507650368036e0362036e020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c03200342020000010e037a034c037a07430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700002034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f02000000090743036200810303270200000000072f020000000907430362009c0203270200000000070702000000600743036200808080809d8fc0d0bff2f1b26703420200000047037a034c037a0321052900080570000205290015034b031105710002031605700002033a0322072f020000001307430368010000000844495620627920300327020000000003160707020000001a037a037a03190332072c0200000002032002000000020327034f0707020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c032000808080809d8fc0d0bff2f1b2670342020000092d037a057a000505700005037a034c07430362008f03052100020529000f0529000307430359030a034c03190325072c0200000002032702000000020320053d036d05700002072e02000008a4072e020000007c057000030570000405700005057000060570000705200005072e020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000081c072e0200000044057000030570000405700005057000060570000705200005072e0200000010072e02000000020320020000000203200200000010072e020000000203200200000002032002000007cc072e0200000028057000030570000405700005057000060570000705200005072e02000000020320020000000203200200000798072e0200000774034c032003480521000305210003034c052900050316034c03190328072c020000000002000000090743036200880303270570000205210002034c0321052100030521000205290011034c0329072f020000002005290015074303620000074303620000074303620000074303620000054200050200000004034c03200743036200000521000203160319032a072c020000021c052100020521000407430362008e02057000020529000907430368010000000a64656c65676174696f6e034203420521000b034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f0200000009074303620081030327020000001a072f02000000060743035903030200000008032007430359030a074303620000034c072c020000007303200521000205210004034205210007034c0326052100030521000205290008034205700007034c03260521000205290005034c05290007034b0311052100030316033a0521000b034c0322072f02000000130743036801000000084449562062792030032702000000000316034c0316031202000000060570000603200521000305210003034205210008034c0326052100030521000205700004052900030312055000030571000205210003052100030570000405290005031205500005057100020521000305700002052100030570000403160312031205500001034c05210003034c0570000305290013034b031105500013034c02000000060570000503200521000205290015055000080521000205700002052900110570000205700003034c0346034c0350055000110571000205210003052900070743036200000790010000000c746f74616c5f737570706c790362072f020000000907430362008a01032702000000000521000405290007074303620000037703420790010000000b6765745f62616c616e63650362072f02000000090743036200890103270200000000034c052100090743036200a40105210004033a033a0322072f0200000013074303680100000008444956206279203003270200000000031605210009074303620002033a0312052100090521000a07430362008803033a033a0322072f020000001307430368010000000844495620627920300327020000000003160743036200a401034c0322072f0200000013074303680100000008444956206279203003270200000000031605210004033a05210009052100020322072f0200000013074303680100000008444956206279203003270200000000031605210005034b0311052100060570000a052100040322072f0200000013074303680100000008444956206279203003270200000000031605700007052900130312055000130571000507430362008c0305210004052100070342034205210009034c0326032005700005057000030342052100050570000305700002037a034c0570000305700002034b0311074303620000052100020319032a072c020000003b05210002034c057000030322072f02000000130743036801000000084449562062792030032702000000000316057000020529001503120550001502000000080570000205200002057100030521000405210003034c05290011034c0329072f0200000009074303620089030327020000000003210521000507430362008b03057000020316057000020342034205700007034c03260320032105700004057000020316034b031105500001052100040529000707430362000005700003034205210004037705700002037a057000040655055f0765046e000000062566726f6d5f065f096500000026046e0000000425746f5f04620000000925746f6b656e5f696404620000000725616d6f756e7400000000000000042574787300000009257472616e73666572072f0200000008074303620027032702000000000743036a0000053d0765036e055f096500000006036e0362036200000000053d096500000006036e036203620000000005700004057000050570000705420003031b057000040342031b034d0743036200000521000303160319032a072c02000000440521000405210003034205700005034c032605210003052100020570000403160312055000010571000205210005034c0570000505290013034b031105500013057100030200000006057000040320034c052100040529001505500008034c0521000405700004052900110570000305210005034c0346034c03500550001105710002052100030570000207430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700004034c03260655036e0000000e256f6e5374616b654368616e6765072f02000000090743036200b702032702000000000743036a000005700002034d053d036d034c031b034c031b02000000180570000305700004057000050570000605700007052000060200000036057000030570000405700005057000060570000705200005072e0200000010072e0200000002032002000000020320020000000203200342";

                const setLambdaOperation = lendingControllerInstance.methods.setLambda(randomLambdaName, randomLambdaBytes); 
                await chai.expect(setLambdaOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

    })

    describe('reset - repay all loans and remove liquidity', function () {

        it('repay all loans', async () => {

            await signerFactory(tezos, eve.sk);

            for(const vaultId of eveVaultSet) {
                try {

                    const vaultOwner = eve.pkh;
                    const vaultHandle = {
                        "id"    : vaultId,
                        "owner" : vaultOwner
                    };
    
                    lendingControllerStorage = await lendingControllerInstance.storage();

                    const newVaultRecord = await lendingControllerStorage.vaults.get(vaultHandle);
                    const vaultAddress   = newVaultRecord.address;
                    const vaultInstance  = await utils.tezos.contract.at(vaultAddress);
    
                    let vaultRecordView             = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
                    const loanToken                 = vaultRecordView.loanToken;
                    let loanOutstandingTotal        = vaultRecordView.loanOutstandingTotal;
                    loanOutstandingTotal            = loanOutstandingTotal * 3; // increase amount to cover interest accrued; excess amount will be refunded

                    // console.log(`vaultId: ${vaultId} | vaultAddress: ${vaultAddress} | loanOutstandingTotal: ${loanOutstandingTotal}`)

                    // if loan outstanding total is greater than min repayment amount
                    if(loanOutstandingTotal > 10000){
                        if(loanToken == "usdt"){

                            // Mock FA12 Tokens
                            // reset token allowance
                            const resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
                                lendingControllerAddress,
                                0
                            ).send();
                            await resetTokenAllowance.confirmation();

                            // set new token allowance
                            const setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
                                lendingControllerAddress,
                                loanOutstandingTotal
                            ).send();
                            await setNewTokenAllowance.confirmation();

                            // repay operation
                            const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, loanOutstandingTotal).send();
                            await eveRepayOperation.confirmation();

                        } else if(loanToken == "eurl"){

                            // update operators for vault
                            updateOperatorsOperation = await updateOperators(mockFa2TokenInstance, eve.pkh, vaultAddress, tokenId);
                            await updateOperatorsOperation.confirmation();

                            // repay operation
                            const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, loanOutstandingTotal).send();
                            await eveRepayOperation.confirmation();

                        } else if(loanToken == "tez"){

                            const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, loanOutstandingTotal).send({ mutez : true, amount : loanOutstandingTotal});
                            await eveRepayOperation.confirmation();
                
                        }
                    }

                    lendingControllerStorage        = await lendingControllerInstance.storage();
                    vaultRecordView                 = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
                    const finalLoanOutstandingTotal = vaultRecordView.loanOutstandingTotal;

                    assert.equal(finalLoanOutstandingTotal, 0);

                    const collateralBalanceLedger   = vaultRecordView.collateralBalanceLedger;
                    for (const [collateralName, collateralBalance] of collateralBalanceLedger.entries()) {

                        try {
                            
                            if(collateralName == "smvk"){

                                // vault staked token (e.g. smvk) operation
                                const eveVaultWithdrawStakedTokenOperation  = await lendingControllerInstance.methods.vaultWithdrawStakedToken(
                                    collateralName,
                                    vaultId,                 
                                    collateralBalance.toNumber()                            
                                ).send();
                                await eveVaultWithdrawStakedTokenOperation.confirmation();

                            } else {

                                const eveWithdrawOperation  = await vaultInstance.methods.initVaultAction(
                                    "withdraw",
                                    collateralBalance.toNumber(),                 
                                    collateralName                            
                                ).send();
                                await eveWithdrawOperation.confirmation();

                            }

                        }  catch (error) {
                            console.log(`An error occurred while processing collateral ${collateralName}: ${error}`);
                        }
                    }
    
                } catch (error) {
                    console.log(`An error occurred while processing vaultId ${vaultId}: ${error}`);
                }
            }
        });

        it('remove all liquidity', async () => {

            await signerFactory(tezos, eve.sk);
            
            lendingControllerStorage = await lendingControllerInstance.storage();
            
            

            let loanTokenName                         = "usdt";
            compoundOperation                         = await mTokenUsdtInstance.methods.compound([eve.pkh]).send();
            await compoundOperation.confirmation();
            const mTokenUsdtStorage                   = await mTokenUsdtInstance.storage();
            const eveMTokenUsdtLedger                 = await mTokenUsdtStorage.ledger.get(eve.pkh);            
            const eveMTokenUsdtBalance                = eveMTokenUsdtLedger == undefined ? 0 : eveMTokenUsdtLedger.toNumber();

            let loanTokenRecord                       = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
            let loanTotal                             = loanTokenRecord.tokenPoolTotal.toNumber();
            let loanTotalRemaining                    = loanTokenRecord.totalRemaining.toNumber();
            
            // console.log(`eveMTokenUsdtBalance: ${eveMTokenUsdtBalance}`);
            // console.log(`loanTokenName: ${loanTokenName} | loanTotal: ${loanTotal} | loanTotalRemaining: ${loanTotalRemaining}`);

            let removeLiquidityOperation  = await lendingControllerInstance.methods.removeLiquidity(
                loanTokenName,
                eveMTokenUsdtBalance, 
            ).send();
            await removeLiquidityOperation.confirmation();



            loanTokenName                             = "eurl";
            compoundOperation                         = await mTokenEurlInstance.methods.compound([eve.pkh]).send();
            await compoundOperation.confirmation();
            const mTokenEurlStorage                   = await mTokenEurlInstance.storage();
            const eveMTokenEurlLedger                 = await mTokenEurlStorage.ledger.get(eve.pkh);            
            const eveMTokenEurlBalance                = eveMTokenEurlLedger == undefined ? 0 : eveMTokenEurlLedger.toNumber();

            loanTokenRecord                           = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
            loanTotal                                 = loanTokenRecord.tokenPoolTotal.toNumber();
            loanTotalRemaining                        = loanTokenRecord.totalRemaining.toNumber();
            
            // console.log(`eveMTokenEurlBalance: ${eveMTokenEurlBalance}`);
            // console.log(`loanTokenName: ${loanTokenName} | loanTotal: ${loanTotal} | loanTotalRemaining: ${loanTotalRemaining}`);

            removeLiquidityOperation  = await lendingControllerInstance.methods.removeLiquidity(
                loanTokenName,
                eveMTokenEurlBalance, 
            ).send();
            await removeLiquidityOperation.confirmation();



            loanTokenName                             = "tez";
            compoundOperation                         = await mTokenXtzInstance.methods.compound([eve.pkh]).send();
            await compoundOperation.confirmation();
            const mTokenXtzStorage                    = await mTokenXtzInstance.storage();
            const eveMTokenXtzLedger                  = await mTokenXtzStorage.ledger.get(eve.pkh);            
            const eveMTokenXtzBalance                 = eveMTokenXtzLedger == undefined ? 0 : eveMTokenXtzLedger.toNumber();
            
            loanTokenRecord                           = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
            loanTotal                                 = loanTokenRecord.tokenPoolTotal.toNumber();
            loanTotalRemaining                        = loanTokenRecord.totalRemaining.toNumber();
            
            // console.log(`eveMTokenXtzBalance: ${eveMTokenXtzBalance}`);
            // console.log(`loanTokenName: ${loanTokenName} | loanTotal: ${loanTotal} | loanTotalRemaining: ${loanTotalRemaining}`);

            removeLiquidityOperation  = await lendingControllerInstance.methods.removeLiquidity(
                loanTokenName,
                eveMTokenXtzBalance, 
            ).send();
            await removeLiquidityOperation.confirmation();

        })

    })

});