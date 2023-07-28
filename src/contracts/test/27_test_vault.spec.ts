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

import { alice, baker, bob, eve, mallory, oscar } from "../scripts/sandbox/accounts";
import { depositorsType, vaultStorageType } from "../storage/storageTypes/vaultStorageType"
import { mockSatelliteData } from "./helpers/mockSampleData";
import { 
    signerFactory, 
    updateOperators,
} from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("Vault tests", async () => {

    var utils: Utils
    let tezos 

    //  - bob: vault with collateral deposit
    //  - eve: first vault loan token: mockFa12, second vault loan token: mockFa2, third vault loan token - tez
    //  - mallory: first vault loan token: mockFa12, second vault loan token: mockFa2
    var aliceVaultSet : Array<Number>   = []
    var bobVaultSet : Array<Number>     = []
    var eveVaultSet : Array<Number>     = []
    var malloryVaultSet : Array<Number> = [] 

    let tokenId = 0

    let admin
    let adminSk
    
    let updateTokenRewardIndexOperation

    let vaultStorage

    let doormanInstance
    let delegationInstance
    let mvkTokenInstance

    // contract addresses
    let lendingControllerAddress
    
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

        admin   = bob.pkh;
        adminSk = bob.sk;

        lendingControllerAddress                = contractDeployments.lendingControllerMockTime.address;
        
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

        // ------------------------------------------------------------------
        //
        //  Set Lending Controller Mock Time address in Governance General Contracts
        //
        // ------------------------------------------------------------------

        
        const updateGeneralContractsOperation = await updateGeneralContracts(governanceInstance, 'lendingController', lendingControllerAddress, 'update');
        await updateGeneralContractsOperation.confirmation();
        

        // ------------------------------------------------------------------
        //
        // Update LP Tokens (i.e. mTokens) tokenRewardIndex by transferring 0
        //  - this will ensure that fetching user balances through on-chain views are accurate for continuous re-testing
        //
        // ------------------------------------------------------------------
        await signerFactory(tezos, adminSk);

        const mockFa12LoanToken = await lendingControllerStorage.loanTokenLedger.get("usdt"); 
        const mockFa2LoanToken  = await lendingControllerStorage.loanTokenLedger.get("eurl"); 
        const tezLoanToken      = await lendingControllerStorage.loanTokenLedger.get("tez");

        if(!(mockFa12LoanToken == undefined || mockFa12LoanToken == null)){
            updateTokenRewardIndexOperation = await mTokenUsdtInstance.methods.compound([bob.pkh, eve.pkh]).send();
            await updateTokenRewardIndexOperation.confirmation();
        }

        if(!(mockFa2LoanToken == undefined || mockFa2LoanToken == null)){
            updateTokenRewardIndexOperation = await mTokenEurlInstance.methods.compound([bob.pkh, eve.pkh]).send();
            await updateTokenRewardIndexOperation.confirmation();
        }

        if(!(tezLoanToken == undefined || tezLoanToken == null)){
            updateTokenRewardIndexOperation = await mTokenXtzInstance.methods.compound([bob.pkh, eve.pkh]).send();
            await updateTokenRewardIndexOperation.confirmation();
        }

    });



    // 
    // Setup loan tokens for vault test
    //
    describe('setup loan tokens for vault test', function () {

        it('admin can set mock FA12 as a loan token', async () => {

            try{        
                
                // init variables
                await signerFactory(tezos, adminSk);

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
                console.dir(e, {depth: 5});
            } 
        });

        it('admin can set mock FA2 as a loan token', async () => {

            try{        
                
                // init variables
                await signerFactory(tezos, adminSk);

                const setLoanTokenActionType                = "createLoanToken";
                const tokenName                             = "eurl";
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
                console.dir(e, {depth: 5});
            } 
        });


        it('admin can set tez as a loan token', async () => {

            try{        
                
                // init variables
                await signerFactory(tezos, adminSk);

                const setLoanTokenActionType                = "createLoanToken";
                const tokenName                             = "tez";
                const tokenType                             = "tez";
                const tokenDecimals                         = 6;

                const oracleAddress                         = contractDeployments.mockUsdXtzAggregator.address;

                const mTokenContractAddress                = contractDeployments.mTokenXtz.address;

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

                    assert.equal(tezLoanToken.rawMTokensTotalSupply           , 0);
                    assert.equal(tezLoanToken.mTokenAddress          , mTokenContractAddress);
    
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
                console.dir(e, {depth: 5});
            } 
        });
    });



    // 
    // Setup collateral tokens for vault test
    //
    describe('setup collateral tokens for vault test', function () {

        it('admin can set mock FA12 as collateral token', async () => {

            try{        
                
                // init variables
                await signerFactory(tezos, adminSk);

                const setCollateralTokenActionType      = "createCollateralToken";
                const tokenName                         = "mockFa12";
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
                console.dir(e, {depth: 5});
            } 
        });

        it('admin can set mock FA2 as collateral token', async () => {

            try{        
                
                // init variables
                await signerFactory(tezos, adminSk);

                const setCollateralTokenActionType          = "createCollateralToken";
                const tokenName                             = "mockFa2";
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
                console.dir(e, {depth: 5});
            } 
        });

        it('admin can set tez as collateral token', async () => {

            try{        
                
                // init variables
                await signerFactory(tezos, adminSk);

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
                console.dir(e, {depth: 5});
            } 
        });


        it('admin can set staked MVK as a collateral token', async () => {

            try{        
                
                // init variables
                await signerFactory(tezos, adminSk);

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
                console.dir(e, {depth: 5});
            } 
        });
        
    });



    // 
    // Test: Set Lending Controller Admin
    //
    describe('%setAdmin - Lending Controller and Vault Controller', function () {
    
        it('admin can set admin for lending controller', async () => {
            try{        
        
                await signerFactory(tezos, adminSk);
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
                console.dir(e, {depth: 5});
            } 

        });   


        it('admin can set admin for vault factory', async () => {
            try{        
        
                await signerFactory(tezos, adminSk);
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
                console.dir(e, {depth: 5});
            } 

        });   


    })


    // 
    // Test: Create vault - mockFa12 loan token
    //
    describe('%createVault', function () {


        beforeEach('storage', async () => {
        
            lendingControllerStorage   = await lendingControllerInstance.storage()
            vaultFactoryStorage        = await vaultFactoryInstance.storage()
    
            await signerFactory(tezos, adminSk)
        })

        it('user (alice) can create a new vault (depositors: any) with collateral deposit tez - LOAN TOKEN: MockFA12', async () => {
            try{        
                
                // init variables
                await signerFactory(tezos, alice.sk);
                // await utils.tezos.contract.registerDelegate({});

                const vaultId               = vaultFactoryStorage.vaultCounter.toNumber();
                const vaultOwner            = alice.pkh;
                const loanTokenName         = "usdt";
                const vaultName             = "newVaultAlice";
                const depositorsConfig      = "any";
                const depositAmountMutez    = 1030000;

                const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
                    baker.pkh,              // delegate to
                    loanTokenName,          // loan token type
                    vaultName,              // vault name
                    [
                        {
                            amount: depositAmountMutez,
                            tokenName: "tez"
                        }
                    ],
                    depositorsConfig       // depositors config type - any / whitelist
                ).send({ mutez : true, amount : depositAmountMutez });
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

                const vaultTezCollateralBalance = vaultRecord.collateralBalanceLedger.get("tez");
                assert.equal(vaultTezCollateralBalance.toNumber(), depositAmountMutez);

                const vaultOriginatedContract = await utils.tezos.contract.at(vaultRecord.address);
                const vaultOriginatedContractStorage : vaultStorageType = await vaultOriginatedContract.storage();

                assert.equal(vaultOriginatedContractStorage.admin, contractDeployments.vaultFactory.address);
                assert.equal(Object.keys(vaultOriginatedContractStorage.depositors)[0], depositorsConfig);

                // push new vault id to vault set
                aliceVaultSet.push(vaultId);

            } catch(e){
                console.dir(e, {depth: 5});
            } 

        });    


        it('user (alice) cannot create a new vault with collateral deposit tez if no tez is sent', async () => {
            try{        
                
                // init variables
                await signerFactory(tezos, alice.sk);
                // await utils.tezos.contract.registerDelegate({});

                const vaultId               = vaultFactoryStorage.vaultCounter.toNumber();
                const vaultOwner            = alice.pkh;
                const loanTokenName         = "usdt";
                const vaultName             = "failVaultAlice";
                const depositorsConfig      = "any";
                const depositAmountMutez    = 1030000;

                const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
                    null,                   // delegate to
                    loanTokenName,          // loan token type
                    vaultName,              // vault name
                    [
                        {
                            amount: depositAmountMutez,
                            tokenName: "tez"
                        }
                    ],
                    depositorsConfig       // depositors config type - any / whitelist
                );
                await chai.expect(userCreatesNewVaultOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            } 

        });    


        it('user (alice) cannot create a new vault with collateral deposit tez if tez amount is wrongly specified', async () => {
            try{        
                
                // init variables
                await signerFactory(tezos, alice.sk);
                // await utils.tezos.contract.registerDelegate({});

                const vaultId               = vaultFactoryStorage.vaultCounter.toNumber();
                const vaultOwner            = alice.pkh;
                const loanTokenName         = "usdt";
                const vaultName             = "failVaultAlice";
                const depositorsConfig      = "any";
                
                const depositAmountMutez      = 1500000;
                const wrongDepositAmountMutez = 1000000;

                const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
                    null,                   // delegate to
                    loanTokenName,          // loan token type
                    vaultName,              // vault name
                    [
                        {
                            amount: depositAmountMutez,
                            tokenName: "tez"
                        }
                    ],
                    depositorsConfig       // depositors config type - any / whitelist
                );
                await chai.expect(userCreatesNewVaultOperation.send({ mutez : true, amount : wrongDepositAmountMutez })).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            } 

        });    


        it('user (bob) can create a new vault (depositors: any) with two collateral token deposits - LOAN TOKEN: MockFA12', async () => {
            try{        
                
                // init variables
                await signerFactory(tezos, adminSk);
                // await utils.tezos.contract.registerDelegate({});

                const vaultId               = vaultFactoryStorage.vaultCounter.toNumber();
                const vaultOwner            = bob.pkh;
                const loanTokenName         = "usdt";
                const vaultName             = "newVaultBob";
                const depositorsConfig      = "any";
                
                const depositAmountToken    = 900000;

                // reset token allowance
                const resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
                    contractDeployments.vaultFactory.address,
                    0
                ).send();
                await resetTokenAllowance.confirmation();

                // set new token allowance
                const setNewTokenAllowanceForDeposit = await mockFa12TokenInstance.methods.approve(
                    contractDeployments.vaultFactory.address,
                    depositAmountToken
                ).send();
                await setNewTokenAllowanceForDeposit.confirmation();

                // update operators for vault
                updateOperatorsOperation = await updateOperators(mockFa2TokenInstance, bob.pkh, contractDeployments.vaultFactory.address, tokenId);
                await updateOperatorsOperation.confirmation();

                const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
                    null,                   // delegate to
                    loanTokenName,          // loan token type
                    vaultName,              // vault name
                    [
                        {
                            amount: depositAmountToken,
                            tokenName: "mockFa12"
                        },
                        {
                            amount: depositAmountToken,
                            tokenName: "mockFa2"
                        },
                    ],
                    depositorsConfig,       // depositors config type - any / whitelist
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

                const vaultMockFa12TokenCollateralBalance = vaultRecord.collateralBalanceLedger.get("mockFa12");
                const vaultMockFa2TokenCollateralBalance  = vaultRecord.collateralBalanceLedger.get("mockFa2");
                
                assert.equal(vaultMockFa12TokenCollateralBalance.toNumber(), depositAmountToken);
                assert.equal(vaultMockFa2TokenCollateralBalance.toNumber(), depositAmountToken);

                const vaultOriginatedContract = await utils.tezos.contract.at(vaultRecord.address);
                const vaultOriginatedContractStorage : vaultStorageType = await vaultOriginatedContract.storage();

                assert.equal(vaultOriginatedContractStorage.admin, contractDeployments.vaultFactory.address);
                assert.equal(Object.keys(vaultOriginatedContractStorage.depositors)[0], depositorsConfig);

                // push new vault id to vault set
                bobVaultSet.push(vaultId);

            } catch(e){
                console.dir(e, {depth: 5});
            } 

        });    


        it('user (bob) can create a new vault (depositors: any) with tez deposit and two collateral token deposits - LOAN TOKEN: MockFA12', async () => {
            try{        
                
                // init variables
                await signerFactory(tezos, adminSk);
                // await utils.tezos.contract.registerDelegate({});

                const vaultId               = vaultFactoryStorage.vaultCounter.toNumber();
                const vaultOwner            = bob.pkh;
                const loanTokenName         = "usdt";
                const vaultName             = "newVaultBob";
                const depositorsConfig      = "any";
                
                const depositAmountMutez    = 1030000;
                const depositAmountToken    = 900000;

                // reset token allowance
                const resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
                    contractDeployments.vaultFactory.address,
                    0
                ).send();
                await resetTokenAllowance.confirmation();

                // set new token allowance
                const setNewTokenAllowanceForDeposit = await mockFa12TokenInstance.methods.approve(
                    contractDeployments.vaultFactory.address,
                    depositAmountToken
                ).send();
                await setNewTokenAllowanceForDeposit.confirmation();

                // update operators for vault
                updateOperatorsOperation = await updateOperators(mockFa2TokenInstance, bob.pkh, contractDeployments.vaultFactory.address, tokenId);
                await updateOperatorsOperation.confirmation();

                const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
                    null,                   // delegate to
                    loanTokenName,          // loan token type
                    vaultName,              // vault name
                    [
                        {
                            amount: depositAmountMutez,
                            tokenName: "tez"
                        },
                        {
                            amount: depositAmountToken,
                            tokenName: "mockFa12"
                        },
                        {
                            amount: depositAmountToken,
                            tokenName: "mockFa2"
                        },
                    ],
                    depositorsConfig,       // depositors config type - any / whitelist
                ).send({ mutez : true, amount : depositAmountMutez });
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

                const vaultTezCollateralBalance           = vaultRecord.collateralBalanceLedger.get("tez");
                const vaultMockFa12TokenCollateralBalance = vaultRecord.collateralBalanceLedger.get("mockFa12");
                const vaultMockFa2TokenCollateralBalance  = vaultRecord.collateralBalanceLedger.get("mockFa2");

                assert.equal(vaultTezCollateralBalance.toNumber(), depositAmountMutez);
                assert.equal(vaultMockFa12TokenCollateralBalance.toNumber(), depositAmountToken);
                assert.equal(vaultMockFa2TokenCollateralBalance.toNumber(), depositAmountToken);

                const vaultOriginatedContract = await utils.tezos.contract.at(vaultRecord.address);
                const vaultOriginatedContractStorage : vaultStorageType = await vaultOriginatedContract.storage();

                assert.equal(vaultOriginatedContractStorage.admin, contractDeployments.vaultFactory.address);
                assert.equal(Object.keys(vaultOriginatedContractStorage.depositors)[0], depositorsConfig);

                // push new vault id to vault set
                bobVaultSet.push(vaultId);

            } catch(e){
                console.dir(e, {depth: 5});
            } 

        });    


        it('user (bob) cannot create a new vault with tez deposit and two collateral token deposits if no tez is sent', async () => {
            try{        
                
                // init variables
                await signerFactory(tezos, adminSk);
                // await utils.tezos.contract.registerDelegate({});

                const vaultId               = vaultFactoryStorage.vaultCounter.toNumber();
                const vaultOwner            = bob.pkh;
                const loanTokenName         = "usdt";
                const vaultName             = "newVaultBob";
                const depositorsConfig      = "any";
                
                const depositAmountMutez    = 1030000;
                const depositAmountToken    = 900000;

                // reset token allowance
                const resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
                    contractDeployments.vaultFactory.address,
                    0
                ).send();
                await resetTokenAllowance.confirmation();

                // set new token allowance
                const setNewTokenAllowanceForDeposit = await mockFa12TokenInstance.methods.approve(
                    contractDeployments.vaultFactory.address,
                    depositAmountToken
                ).send();
                await setNewTokenAllowanceForDeposit.confirmation();

                // update operators for vault
                updateOperatorsOperation = await updateOperators(mockFa2TokenInstance, bob.pkh, contractDeployments.vaultFactory.address, tokenId);
                await updateOperatorsOperation.confirmation();

                const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
                    null,                   // delegate to
                    loanTokenName,          // loan token type
                    vaultName,              // vault name
                    [
                        {
                            amount: depositAmountMutez,
                            tokenName: "tez"
                        },
                        {
                            amount: depositAmountToken,
                            tokenName: "mockFa12"
                        },
                        {
                            amount: depositAmountToken,
                            tokenName: "mockFa2"
                        },
                    ],
                    depositorsConfig,       // depositors config type - any / whitelist
                );
                await chai.expect(userCreatesNewVaultOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            } 

        });  
        
        
        it('user (bob) cannot create a new vault with tez deposit and two collateral token deposits if tez amount is wrongly specified', async () => {
            try{        
                
                // init variables
                await signerFactory(tezos, adminSk);
                // await utils.tezos.contract.registerDelegate({});

                const vaultId               = vaultFactoryStorage.vaultCounter.toNumber();
                const vaultOwner            = bob.pkh;
                const loanTokenName         = "usdt";
                const vaultName             = "newVaultBob";
                const depositorsConfig      = "any";
                
                const depositAmountMutez        = 1500000;
                const wrongDepositAmountMutez   = 1000000;
                const depositAmountToken        = 900000;

                // reset token allowance
                const resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
                    contractDeployments.vaultFactory.address,
                    0
                ).send();
                await resetTokenAllowance.confirmation();

                // set new token allowance
                const setNewTokenAllowanceForDeposit = await mockFa12TokenInstance.methods.approve(
                    contractDeployments.vaultFactory.address,
                    depositAmountToken
                ).send();
                await setNewTokenAllowanceForDeposit.confirmation();

                // update operators for vault
                updateOperatorsOperation = await updateOperators(mockFa2TokenInstance, bob.pkh, contractDeployments.vaultFactory.address, tokenId);
                await updateOperatorsOperation.confirmation();

                const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
                    null,                   // delegate to
                    loanTokenName,          // loan token type
                    vaultName,              // vault name
                    [
                        {
                            amount: depositAmountMutez,
                            tokenName: "tez"
                        },
                        {
                            amount: depositAmountToken,
                            tokenName: "mockFa12"
                        },
                        {
                            amount: depositAmountToken,
                            tokenName: "mockFa2"
                        },
                    ],
                    depositorsConfig,       // depositors config type - any / whitelist
                );
                await chai.expect(userCreatesNewVaultOperation.send({ mutez : true, amount : wrongDepositAmountMutez })).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            } 

        });  


        it('user (eve) can create a new vault (depositors: any) - LOAN TOKEN: MockFA12', async () => {
            try{        
                
                // init variables
                await signerFactory(tezos, eve.sk);
                const vaultId               = vaultFactoryStorage.vaultCounter.toNumber();
                const vaultOwner            = eve.pkh;
                const loanTokenName         = "usdt";
                const vaultName             = "newVault";
                const depositorsConfig      = "any";

                const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
                    baker.pkh,              // delegate to
                    loanTokenName,          // loan token type
                    vaultName,              // vault name
                    null,
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

                assert.equal(vaultOriginatedContractStorage.admin, contractDeployments.vaultFactory.address);
                assert.equal(Object.keys(vaultOriginatedContractStorage.depositors)[0], depositorsConfig);

                // push new vault id to vault set
                eveVaultSet.push(vaultId);

            } catch(e){
                console.dir(e, {depth: 5});
            } 

        });    


        it('user (mallory) can create a new vault (depositors: whitelist set) - LOAN TOKEN: MockFA12', async () => {
            try{        

                // init variables
                await signerFactory(tezos, mallory.sk);
                const vaultFactoryStorage       = await vaultFactoryInstance.storage();
                const vaultId                   = vaultFactoryStorage.vaultCounter.toNumber();
                const vaultOwner                = mallory.pkh;
                const depositorsConfig          = "whitelist";
                const loanTokenName             = "usdt";
                const vaultName                 = "newVault";

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
                const vaultAddress = vaultRecord.address;

                assert.equal(vaultRecord.loanToken              , loanTokenName);
                assert.equal(vaultRecord.loanOutstandingTotal   , 0);
                assert.equal(vaultRecord.loanPrincipalTotal     , 0);
                assert.equal(vaultRecord.loanInterestTotal      , 0);

                const vaultOriginatedContract = await utils.tezos.contract.at(vaultRecord.address);
                const vaultOriginatedContractStorage : vaultStorageType = await vaultOriginatedContract.storage();

                assert.equal(vaultOriginatedContractStorage.admin , contractDeployments.vaultFactory.address);

                // push new vault id to vault set
                malloryVaultSet.push(vaultId);

                // add alice to whitelist depositor

                const newDepositorConfigType   = "whitelist";
                const newDepositorAddress      = alice.pkh;
                const addOrRemoveBool          = true;

                const malloryVaultInstance         = await utils.tezos.contract.at(vaultAddress);

                const malloryUpdateDepositorOperation  = await malloryVaultInstance.methods.initVaultAction(            
                    "updateDepositor",             // vault action type
                    newDepositorConfigType,        // whitelist
                    addOrRemoveBool,               // true: add whitelist address
                    newDepositorAddress,           // new whitelisted depositor address
                ).send();
                await malloryUpdateDepositorOperation.confirmation();

                const updatedMalloryVaultInstance                            = await utils.tezos.contract.at(vaultAddress);
                const updatedMalloryVaultInstanceStorage : vaultStorageType  = await updatedMalloryVaultInstance.storage();
                const updatedVaultDepositors : any                           = updatedMalloryVaultInstanceStorage.depositors;

                // check that depositors type is no longer any and now has alice address
                assert.equal(updatedVaultDepositors.whitelist[0], newDepositorAddress);    
                assert.equal(updatedVaultDepositors.whitelist.length, 1);      

            } catch(e){
                console.dir(e, {depth: 5});
            } 

        });    

    }); // end test: create vaults with tez as initial deposit


    // 
    // Test: Update Depositor
    //
    describe('%updateDepositor - "Any" to "Whitelist Account" ', function () {

        it('user (mallory) can deposit tez into user (eve)\'s vault (depositors: any)', async () => {
            
            // init variables
            await signerFactory(tezos, mallory.sk);
            const vaultId            = eveVaultSet[0];
            const vaultOwner         = eve.pkh;

            const depositAmountMutez = 10000000;

            const vaultHandle = {
                "id"    : vaultId,
                "owner" : vaultOwner
            };

            const lendingControllerStorage      = await lendingControllerInstance.storage();
            const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);
            const initialTezCollateralBalance   = vault.collateralBalanceLedger.get('tez') == undefined ? 0 : vault.collateralBalanceLedger.get('tez').toNumber();

            // get vault contract
            const vaultAddress             = vault.address;
            const eveVaultInstance         = await utils.tezos.contract.at(vaultAddress);

            const malloryDepositTezIntoEveVaultOperation  = await eveVaultInstance.methods.initVaultAction(
                "deposit",
                depositAmountMutez,                   // amt
                "tez"                                 // token
            ).send({ mutez : true, amount : depositAmountMutez });
            await malloryDepositTezIntoEveVaultOperation.confirmation();

            const updatedLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedVault                    = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const tezCollateralBalance            = updatedVault.collateralBalanceLedger.get('tez') == undefined ? 0 : updatedVault.collateralBalanceLedger.get('tez');
            
            // check that tez balance is now 20 tez
            assert.equal(tezCollateralBalance, initialTezCollateralBalance + depositAmountMutez);

        });


        it('user (eve) update depositors to whitelist set only (with alice address)', async () => {
            
            // init variables
            await signerFactory(tezos, eve.sk);
            const vaultId            = eveVaultSet[0];
            const vaultOwner         = eve.pkh;

            const newDepositorConfigType   = "whitelist";
            const newDepositorAddress      = alice.pkh;
            const addOrRemoveBool          = true;

            const vaultHandle = {
                "id"    : vaultId,
                "owner" : vaultOwner
            };

            const lendingControllerStorage      = await lendingControllerInstance.storage();
            const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);

            // get vault contract
            const vaultAddress             = vault.address;
            const eveVaultInstance         = await utils.tezos.contract.at(vaultAddress);
            const eveVaultInstanceStorage : vaultStorageType  = await eveVaultInstance.storage();
            const vaultDepositors                             = eveVaultInstanceStorage.depositors;
            var depositorsConfigType                          = Object.keys(vaultDepositors)[0];

            // check that initial depositors type is any, and there is no whitelisted depositors
            assert.equal(depositorsConfigType, "any");    

            const eveUpdateDepositorOperation  = await eveVaultInstance.methods.initVaultAction(            
                "updateDepositor",             // vault action type
                newDepositorConfigType,        // whitelist 
                addOrRemoveBool,               // true: add whitelist address
                newDepositorAddress,           // new whitelisted depositor address
            ).send();
            await eveUpdateDepositorOperation.confirmation();

            const updatedEveVaultInstance                            = await utils.tezos.contract.at(vaultAddress);
            const updatedEveVaultInstanceStorage : vaultStorageType  = await updatedEveVaultInstance.storage();
            const updatedVaultDepositors : any                       = updatedEveVaultInstanceStorage.depositors;

            // check that depositors type is no longer any and now has alice address
            assert.equal(updatedVaultDepositors.whitelist[0], newDepositorAddress);    
            assert.equal(updatedVaultDepositors.whitelist.length, 1);                              

        });



        it('user (alice) can deposit tez into user (eve)\'s vault (depositors: whitelist) but mallory cannot', async () => {
            
            // init variables
            await signerFactory(tezos, alice.sk);
            const vaultId            = eveVaultSet[0];
            const vaultOwner         = eve.pkh;

            const depositAmountMutez = 10000000;

            const vaultHandle = {
                "id"    : vaultId,
                "owner" : vaultOwner
            };

            const lendingControllerStorage      = await lendingControllerInstance.storage();
            const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);
            const initialTezCollateralBalance   = vault.collateralBalanceLedger.get('tez') == undefined ? 0 : vault.collateralBalanceLedger.get('tez').toNumber();

            // get vault contract
            const vaultAddress             = vault.address;
            const eveVaultInstance         = await utils.tezos.contract.at(vaultAddress);

            const aliceDepositTezIntoEveVaultOperation  = await eveVaultInstance.methods.initVaultAction(
                "deposit",              // vault action
                depositAmountMutez,     // amt
                "tez"                   // token
            ).send({ mutez : true, amount : depositAmountMutez });
            await aliceDepositTezIntoEveVaultOperation.confirmation();

            const updatedLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedVault                    = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const tezCollateralBalance            = updatedVault.collateralBalanceLedger.get('tez') == undefined ? 0 : updatedVault.collateralBalanceLedger.get('tez');
            
            // check that tez balance is now 20 tez
            assert.equal(tezCollateralBalance, initialTezCollateralBalance + depositAmountMutez);

            // check that mallory is not able to deposit into the vault now
            await signerFactory(tezos, mallory.sk);
            const malloryDepositTezIntoEveVaultOperation  = await eveVaultInstance.methods.initVaultAction(
                "deposit",              // vault action
                depositAmountMutez,     // amt
                "tez"                   // token
            );
            await chai.expect(malloryDepositTezIntoEveVaultOperation.send({ mutez : true, amount : depositAmountMutez })).to.be.rejected;

        });

    });


    // 
    // Test: Update Depositor
    //
    describe('%updateDepositor - "Whitelist" to "Any" ', function () {

        it('user (alice) can deposit mock FA12 tokens into mallory\'s vault (depositors: whitelist set), but user (eve) cannot', async () => {
    
            // init variables
            await signerFactory(tezos, alice.sk);
            const vaultId            = malloryVaultSet[0];
            const vaultOwner         = mallory.pkh;

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
            const vault                   = await lendingControllerStorage.vaults.get(vaultHandle);

            // get vault contract
            const vaultAddress             = vault.address;
            const vaultInstance            = await utils.tezos.contract.at(vaultAddress);

            // get mock fa12 token storage
            const mockFa12TokenStorage     = await mockFa12TokenInstance.storage();

            // get initial alice's mock fa12 token balance
            const aliceMockFa12Ledger              = await mockFa12TokenStorage.ledger.get(alice.pkh);            
            const aliceInitialMockFa12TokenBalance = aliceMockFa12Ledger == undefined ? 0 : aliceMockFa12Ledger.balance.toNumber();

            // get initial vault's Mock FA12 Token balance
            const vaultMockFa12Ledger                = await mockFa12TokenStorage.ledger.get(vaultAddress);            
            const vaultInitialMockFa12TokenBalance   = vaultMockFa12Ledger == undefined ? 0 : vaultMockFa12Ledger.balance.toNumber();        
            
            // alice resets mock FA12 tokens allowance then set new allowance to deposit amount
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

            // alice deposits mock FA12 tokens into mallory's vault
            const aliceDepositMockFa12TokenOperation  = await vaultInstance.methods.initVaultAction(
                "deposit",
                depositAmount,                         
                tokenName
            ).send();
            await aliceDepositMockFa12TokenOperation.confirmation();

            const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
            const updatedVault                      = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const mockFa12TokenCollateralBalance    = await updatedVault.collateralBalanceLedger.get(tokenName);
            
            // vault Mock FA12 Token Collateral Balance
            const vaultTokenCollateralBalance = depositAmount;
            assert.equal(mockFa12TokenCollateralBalance, vaultTokenCollateralBalance);

            // check that mallory has the correct amount of Mock FA12 Token balance
            const updatedMockFa12TokenStorage      = await mockFa12TokenInstance.storage();
            const updatedAliceMockFa12Ledger       = await updatedMockFa12TokenStorage.ledger.get(alice.pkh);            
            assert.equal(updatedAliceMockFa12Ledger.balance, aliceInitialMockFa12TokenBalance - depositAmount);

            const vaultMockFa12Account = await updatedMockFa12TokenStorage.ledger.get(vaultAddress);            
            assert.equal(vaultMockFa12Account.balance, vaultInitialMockFa12TokenBalance + depositAmount);

            // check that eve is not able to deposit into the vault now
            await signerFactory(tezos, eve.sk);
            
            // reset token allowance
            const eveResetTokenAllowance = await mockFa12TokenInstance.methods.approve(
                vaultAddress,
                0
            ).send();
            await eveResetTokenAllowance.confirmation();

            // set new token allowance
            const eveSetNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
                vaultAddress,
                depositAmount
            ).send();
            await eveSetNewTokenAllowance.confirmation();

            const eveDepositTezIntoEveVaultOperation  = await vaultInstance.methods.initVaultAction(
                "deposit",
                depositAmount,                   // amt
                tokenName                        // token
            );
            await chai.expect(eveDepositTezIntoEveVaultOperation.send()).to.be.rejected;

        });


        it('user (mallory) update depositors type from Whitelist to Any', async () => {
            
            // init variables
            await signerFactory(tezos, mallory.sk);
            const vaultId            = malloryVaultSet[0];
            const vaultOwner         = mallory.pkh;

            const newDepositorConfigType = "any";
            
            const vaultHandle = {
                "id"    : vaultId,
                "owner" : vaultOwner
            };

            const lendingControllerStorage      = await lendingControllerInstance.storage();
            const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);

            // get vault contract
            const vaultAddress             = vault.address;
            const malloryVaultInstance         = await utils.tezos.contract.at(vaultAddress);
            const malloryVaultInstanceStorage : vaultStorageType  = await malloryVaultInstance.storage();
            const vaultDepositors             : depositorsType    = malloryVaultInstanceStorage.depositors;
            var depositorsConfigType  = Object.keys(vaultDepositors)[0];

            // check that initial depositors type is any
            assert.equal(depositorsConfigType, "whitelist");            

            const malloryUpdateDepositorOperation  = await malloryVaultInstance.methods.initVaultAction(
                "updateDepositor",          // vault action type            
                newDepositorConfigType,     // "any" depositor type
                true,                       // bool true for "any"
            ).send();
            await malloryUpdateDepositorOperation.confirmation();

            const updatedMalloryVaultInstance                            = await utils.tezos.contract.at(vaultAddress);
            const updatedMalloryVaultInstanceStorage : vaultStorageType  = await updatedMalloryVaultInstance.storage();
            const updatedVaultDepositors             : depositorsType    = updatedMalloryVaultInstanceStorage.depositors;
            depositorsConfigType  = Object.keys(updatedVaultDepositors)[0];

            // check that depositors type is no longer whitelisted and is now any
            assert.equal(depositorsConfigType, "any");    

        });


        it('both user (eve) and user (alice) can now deposit mock FA12 tokens into mallory\'s vault (depositors: any)', async () => {
    
            // init variables
            await signerFactory(tezos, eve.sk);
            const vaultId            = malloryVaultSet[0];
            const vaultOwner         = mallory.pkh;

            const tokenName          = "mockFa12";
            const depositAmount      = 10000000;   // 10 Mock FA12 Tokens

            lendingControllerStorage = await lendingControllerInstance.storage();

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

            // get initial eve's mock fa12 token balance
            const eveMockFa12Ledger              = await mockFa12TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMockFa12TokenBalance = eveMockFa12Ledger == undefined ? 0 : eveMockFa12Ledger.balance.toNumber();

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

            // eve deposits mock FA12 tokens into mallory's vault
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
            assert.equal(mockFa12TokenCollateralBalance, vaultInitialMockFa12TokenBalance + depositAmount);

            // check that mallory has the correct amount of Mock FA12 Token balance
            const updatedMockFa12TokenStorage    = await mockFa12TokenInstance.storage();
            const updatedEveMockFa12Ledger       = await updatedMockFa12TokenStorage.ledger.get(eve.pkh);            
            assert.equal(updatedEveMockFa12Ledger.balance, eveInitialMockFa12TokenBalance - depositAmount);

            const vaultMockFa12Account = await updatedMockFa12TokenStorage.ledger.get(vaultAddress);            
            assert.equal(vaultMockFa12Account.balance, vaultInitialMockFa12TokenBalance + depositAmount);

        });
    
    });

    // 
    // Test: Delegate Mvk To Satellite
    //
    describe('%delegateToSatellite', function () {

        it('user (eve) delegates MVK to oscar\'s satellite', async () => {
            
            // init variables
            await signerFactory(tezos, eve.sk);
            const vaultId            = eveVaultSet[0];
            const vaultOwner         = eve.pkh;

            const mvkDepositAmount   = 10000000000;   
            const satelliteAddress   = oscar.pkh;
            const tokenName          = "smvk";

            const vaultHandle = {
                "id"    : vaultId,
                "owner" : vaultOwner
            };

            const lendingControllerStorage      = await lendingControllerInstance.storage();
            const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);

            // get vault contract
            const vaultAddress             = vault.address;
            const eveVaultInstance         = await utils.tezos.contract.at(vaultAddress);

            // get initial balance for Eve and Vault
            const userMVKBalance = (await mvkTokenStorage.ledger.get(eve.pkh)).toNumber();
                
            const userStakeLedger = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);
            const userStakeBalance = userStakeLedger === undefined ? 0 : userStakeLedger.balance.toNumber();
    
            const doormanSMVKTotalSupply = ((await mvkTokenStorage.ledger.get(contractDeployments.doorman.address)) === undefined ? new BigNumber(0) : (await mvkTokenStorage.ledger.get(contractDeployments.doorman.address))).toNumber();

            // get initial vault staked balance on the doorman contract
            doormanStorage                              = await doormanInstance.storage();
            const vaultOwnerStakedMvkAccount            = await doormanStorage.userStakeBalanceLedger.get(vaultOwner);
            const initialVaultOwnerStakedMvkBalance     = vaultOwnerStakedMvkAccount == undefined ? 0 : vaultOwnerStakedMvkAccount.balance.toNumber();

            const vaultStakedMvkAccount                 = await doormanStorage.userStakeBalanceLedger.get(vaultAddress);
            const initialVaultStakedMvkBalance          = vaultStakedMvkAccount == undefined ? 0 : vaultStakedMvkAccount.balance.toNumber();

            const initialSatelliteRecord                = await delegationStorage.satelliteLedger.get(satelliteAddress);
            const initialSatelliteTotalDelegatedAmount  = initialSatelliteRecord.totalDelegatedAmount.toNumber();

            // ----------------------------------------------------------------------------------------------
            // Eve staked some MVK to Doorman Contract
            // ----------------------------------------------------------------------------------------------

            // Operator set
            updateOperatorsOperation = await updateOperators(mvkTokenInstance, eve.pkh, contractDeployments.doorman.address, tokenId);
            await updateOperatorsOperation.confirmation();

            // Operation
            const stakeOperation = await doormanInstance.methods.stake(mvkDepositAmount).send();
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
            assert.equal(doormanSMVKTotalSupply + mvkDepositAmount, doormanSMVKTotalSupplyEnd);
            assert.equal(userMVKBalance - mvkDepositAmount, userMVKBalanceEnd);
            assert.equal(userStakeBalance + mvkDepositAmount, userStakeBalanceEnd);

            // ----------------------------------------------------------------------------------------------
            // Eve's vault stake some MVK to Doorman Contract
            // ----------------------------------------------------------------------------------------------
    
            // eve set doorman as operator for vault
            const vaultUpdateOperatorsOperation = await eveVaultInstance.methods.initVaultAction(
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
            ).send();
            await vaultUpdateOperatorsOperation.confirmation();
            
            // vault staked mvk operation
            const eveVaultDepositStakedTokenOperation  = await lendingControllerInstance.methods.vaultDepositStakedToken(
                tokenName,
                vaultId,                 
                mvkDepositAmount                            
            ).send();
            await eveVaultDepositStakedTokenOperation.confirmation();
            
            // get vault staked balance on the doorman contract
            doormanStorage                           = await doormanInstance.storage();
            const updatedVaultOwnerStakedMvkAccount  = await doormanStorage.userStakeBalanceLedger.get(vaultOwner);
            const updatedVaultOwnerStakedMvkBalance  = updatedVaultOwnerStakedMvkAccount == undefined ? 0 : updatedVaultOwnerStakedMvkAccount.balance.toNumber();

            const updatedVaultStakedMvkAccount       = await doormanStorage.userStakeBalanceLedger.get(vaultAddress);
            const updatedVaultStakedMvkBalance       = updatedVaultStakedMvkAccount == undefined ? 0 : updatedVaultStakedMvkAccount.balance.toNumber();

            // assert decrease in staked mvk balance for vault owner
            assert.equal(updatedVaultOwnerStakedMvkBalance, initialVaultOwnerStakedMvkBalance);

            // assert increase in staked mvk balance for vault 
            assert.equal(updatedVaultStakedMvkBalance, initialVaultStakedMvkBalance + mvkDepositAmount);
            
            // delegate vault staked mvk to oscar's satellite
            const delegationOperation   = await eveVaultInstance.methods.initVaultAction(
                "delegateToSatellite",
                satelliteAddress
            ).send();
            await delegationOperation.confirmation();

            const updatedSatelliteRecord               = await delegationStorage.satelliteLedger.get(satelliteAddress);
            const updatedSatelliteTotalDelegatedAmount = updatedSatelliteRecord.totalDelegatedAmount.toNumber();

            // assert correct increase in satellite's total delegated amount
            assert.equal(updatedSatelliteTotalDelegatedAmount, initialSatelliteTotalDelegatedAmount + mvkDepositAmount);

        });


        it('user (eve) can redelegate to bob\'s satellite', async () => {

            // init variables
            await signerFactory(tezos, eve.sk);
            const vaultId            = eveVaultSet[0];
            const vaultOwner         = eve.pkh;

            const mvkDepositAmount    = 10000000000;   
            const satelliteAddress    = oscar.pkh;
            const newSatelliteAddress = bob.pkh;

            const vaultHandle = {
                "id"    : vaultId,
                "owner" : vaultOwner
            };

            const lendingControllerStorage      = await lendingControllerInstance.storage();
            const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);

            // get vault contract
            const vaultAddress             = vault.address;
            const eveVaultInstance         = await utils.tezos.contract.at(vaultAddress);

            const vaultStakedMvkAccount                      = await doormanStorage.userStakeBalanceLedger.get(vaultAddress);
            const vaultStakedMvkBalance                      = vaultStakedMvkAccount == undefined ? 0 : vaultStakedMvkAccount.balance.toNumber();

            const initialOscarSatelliteRecord                = await delegationStorage.satelliteLedger.get(satelliteAddress);
            const initialOscarSatelliteTotalDelegatedAmount  = initialOscarSatelliteRecord.totalDelegatedAmount.toNumber();

            const initialBobSatelliteRecord                  = await delegationStorage.satelliteLedger.get(newSatelliteAddress);
            const initialBobSatelliteTotalDelegatedAmount    = initialBobSatelliteRecord.totalDelegatedAmount.toNumber();

            // redelegate from oscar to bob
            const delegationOperation   = await eveVaultInstance.methods.initVaultAction(
                "delegateToSatellite",
                newSatelliteAddress
            ).send();
            await delegationOperation.confirmation();

            const updatedOscarSatelliteRecord               = await delegationStorage.satelliteLedger.get(satelliteAddress);
            const updatedOscarSatelliteTotalDelegatedAmount = updatedOscarSatelliteRecord.totalDelegatedAmount.toNumber();

            const updatedBobSatelliteRecord                 = await delegationStorage.satelliteLedger.get(newSatelliteAddress);
            const updatedBobSatelliteTotalDelegatedAmount   = updatedBobSatelliteRecord.totalDelegatedAmount.toNumber();

            // assert correct changes in both satellite's total delegated amount
            assert.equal(updatedBobSatelliteTotalDelegatedAmount, initialBobSatelliteTotalDelegatedAmount + vaultStakedMvkBalance);
            assert.equal(updatedOscarSatelliteTotalDelegatedAmount, initialOscarSatelliteTotalDelegatedAmount - vaultStakedMvkBalance);

        });

    });


    // 
    // Test: Reset Admin
    //
    describe('reset admin for continuous retesting - Lending Controller and Vault Controller', function () {
    
        it('admin can reset admin for lending controller back to bob through governance proxy', async () => {
            try{        
        
                await signerFactory(tezos, adminSk);

                // Initial values
                const newAdmin = admin;

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
        
                await signerFactory(tezos, adminSk);

                // Initial values
                const newAdmin = admin;

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

});