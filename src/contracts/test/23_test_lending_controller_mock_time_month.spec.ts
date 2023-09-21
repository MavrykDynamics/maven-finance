import assert from "assert";

import * as lendingHelper from "./helpers/lendingHelpers"
import { Utils, zeroAddress } from "./helpers/Utils";

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
import { 
    signerFactory, 
    almostEqual,
    fa2Transfer,
    updateOperators,
    updateGeneralContracts,
    getStorageMapValue
} from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("Lending Controller (Mock Time - One Month) tests", async () => {
    
    var utils: Utils
    let tezos

    //  - eve: first vault loan token: mockFa12, second vault loan token: mockFa2, third vault loan token - tez
    //  - mallory: first vault loan token: mockFa12, second vault loan token: mockFa2
    var eveVaultSet : Array<Number>     = []
    var malloryVaultSet : Array<Number> = [] 

    let updateTokenRewardIndexOperation

    let tokenId = 0

    // 3 seconds blocks (docker sandbox)
    const oneDayLevelBlocks   = 28800
    const oneMonthLevelBlocks = 864000
    const oneYearLevelBlocks  = 10512000 // 365 days

    const secondsInYears = 31536000
    const fixedPointAccuracy = 10**27

    let lendingControllerAddress
    
    let doormanInstance
    let delegationInstance
    let mvkTokenInstance
    let treasuryInstance
    
    let mockFa12TokenInstance
    let mockFa2TokenInstance

    let mockUsdMockFa12TokenAggregatorInstance
    let mockUsdMockFa2TokenAggregatorInstance
    let mockUsdXtzAggregatorInstance
    let mockUsdMvkAggregatorInstance

    let mockUsdMockFa12TokenAggregatorStorage
    let mockUsdMockFa2TokenAggregatorStorage
    let mockUsdXtzAggregatorStorage
    let mockUsdMvkAggregatorStorage

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
    let treasuryStorage

    let mockFa12TokenStorage
    let mockFa2TokenStorage
    let governanceStorage
    let governanceProxyStorage
    
    let lendingControllerStorage
    let vaultFactoryStorage

    let vaultRecordView
    let updatedVaultRecordView
    let loanTokenRecordView
    let updatedLoanTokenRecordView

    let loanTokenRecord
    let initialLoanTokenRecord
    let updatedLoanTokenRecord

    let initialTokenRewardIndex
    let updatedTokenRewardIndex
    let tokenRewardIndexIncrement

    let initialTokenPoolTotal
    let updatedTokenPoolTotal

    let mTokenView
    let initialMTokenBalance 
    let updatedMTokenBalance
    let initialUserRewardIndex 

    let updateOperatorsOperation
    let compoundOperation

    let tokenOracles : {name : string, price : number, priceDecimals : number, tokenDecimals : number}[] = []
    

    before("setup", async () => {

        utils = new Utils();
        await utils.init(bob.sk);
        tezos = utils.tezos

        // use MOCK TIME version to set block levels 
        lendingControllerAddress                = contractDeployments.lendingControllerMockTime.address;

        doormanInstance                         = await utils.tezos.contract.at(contractDeployments.doorman.address);
        delegationInstance                      = await utils.tezos.contract.at(contractDeployments.delegation.address);
        mvkTokenInstance                        = await utils.tezos.contract.at(contractDeployments.mvkToken.address);
        treasuryInstance                        = await utils.tezos.contract.at(contractDeployments.treasury.address);

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
        treasuryStorage                         = await treasuryInstance.storage();

        mockFa12TokenStorage                    = await mockFa12TokenInstance.storage();
        mockFa2TokenStorage                     = await mockFa2TokenInstance.storage();
        governanceStorage                       = await governanceInstance.storage();
        governanceProxyStorage                  = await governanceProxyInstance.storage();
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
        //  Set up token oracles
        //
        // ------------------------------------------------------------------


        // set up token oracles for testing
        mockUsdMockFa12TokenAggregatorStorage   = await mockUsdMockFa12TokenAggregatorInstance.storage();
        mockUsdMockFa2TokenAggregatorStorage    = await mockUsdMockFa2TokenAggregatorInstance.storage();
        mockUsdXtzAggregatorStorage             = await mockUsdXtzAggregatorInstance.storage();
        mockUsdMvkAggregatorStorage             = await mockUsdMvkAggregatorInstance.storage();

        tokenOracles.push({
            'name': 'usdt', 
            'price': mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.data.toNumber(),
            'priceDecimals': mockUsdMockFa12TokenAggregatorStorage.config.decimals.toNumber(),
            'tokenDecimals': 0
        })

        tokenOracles.push({
            'name': 'eurl', 
            'price': mockUsdMockFa2TokenAggregatorStorage.lastCompletedData.data.toNumber(),
            'priceDecimals': mockUsdMockFa2TokenAggregatorStorage.config.decimals.toNumber(),
            'tokenDecimals': 0
        })

        tokenOracles.push({
            'name': 'tez', 
            'price': mockUsdXtzAggregatorStorage.lastCompletedData.data.toNumber(),
            'priceDecimals': mockUsdXtzAggregatorStorage.config.decimals.toNumber(),
            'tokenDecimals': 0
        })

        tokenOracles.push({
            'name': "smvk", 
            'price': mockUsdMvkAggregatorStorage.lastCompletedData.data.toNumber(),
            'priceDecimals': mockUsdMvkAggregatorStorage.config.decimals.toNumber(),
            'tokenDecimals': 9
        })


        // ------------------------------------------------------------------
        //
        // Update mTokens (i.e. mTokens) tokenRewardIndex by compounding
        //  - this will ensure that fetching user balances through on-chain views are accurate for continuous re-testing
        //
        // ------------------------------------------------------------------
        await signerFactory(tezos, bob.sk);

        const mockFa12LoanToken = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt("usdt").executeView({ viewCaller : bob.pkh});
        const mockFa2LoanToken  = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt("eurl").executeView({ viewCaller : bob.pkh});
        const tezLoanToken      = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt("tez").executeView({ viewCaller : bob.pkh});
        
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
                const reserveRatio                          = 1000; // 10% reserves (4 decimals)
                const optimalUtilisationRate                = 50 * (10 ** (interestRateDecimals - 2));  // 30% utilisation rate kink
                const baseInterestRate                      = 5  * (10 ** (interestRateDecimals - 2));  // 5%
                const maxInterestRate                       = 25 * (10 ** (interestRateDecimals - 2));  // 25% 
                const interestRateBelowOptimalUtilisation   = 10 * (10 ** (interestRateDecimals - 2));  // 10% 
                const interestRateAboveOptimalUtilisation   = 20 * (10 ** (interestRateDecimals - 2));  // 20%

                const minRepaymentAmount                    = 10000;

                // update token oracle with token decimals
                const mockFa12TokenIndex = tokenOracles.findIndex((o => o.name === "usdt"));
                tokenOracles[mockFa12TokenIndex].tokenDecimals = tokenDecimals;

                // check if loan token exists
                const checkLoanTokenExists   = await getStorageMapValue(lendingControllerStorage, 'loanTokenLedger', tokenName); 

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
                    const mockFa12LoanToken   = await getStorageMapValue(lendingControllerStorage, 'loanTokenLedger', tokenName); 

//                     assert.equal(mockFa12LoanToken.tokenName              , tokenName);
    
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
    
                } else {

                    lendingControllerStorage  = await lendingControllerInstance.storage();
                    const mockFa12LoanToken   = await getStorageMapValue(lendingControllerStorage, 'loanTokenLedger', tokenName); 
                
                    // other variables will be affected by repeated tests
                    assert.equal(mockFa12LoanToken.tokenName              , tokenName);

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
                const reserveRatio                          = 1000; // 10% reserves (4 decimals)
                const optimalUtilisationRate                = 50 * (10 ** (interestRateDecimals - 2));  // 30% utilisation rate kink
                const baseInterestRate                      = 5  * (10 ** (interestRateDecimals - 2));  // 5%
                const maxInterestRate                       = 25 * (10 ** (interestRateDecimals - 2));  // 25% 
                const interestRateBelowOptimalUtilisation   = 10 * (10 ** (interestRateDecimals - 2));  // 10% 
                const interestRateAboveOptimalUtilisation   = 20 * (10 ** (interestRateDecimals - 2));  // 20%

                const minRepaymentAmount                    = 10000;

                // update token oracle with token decimals
                const mockFa2TokenIndex = tokenOracles.findIndex((o => o.name === "eurl"));
                tokenOracles[mockFa2TokenIndex].tokenDecimals = tokenDecimals;

                const checkLoanTokenExists   = await getStorageMapValue(lendingControllerStorage, 'loanTokenLedger', tokenName); 

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
                    const mockFa2LoanToken   = await getStorageMapValue(lendingControllerStorage, 'loanTokenLedger', tokenName); 

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

                } else {

                    lendingControllerStorage = await lendingControllerInstance.storage();
                    const mockFa2LoanToken   = await getStorageMapValue(lendingControllerStorage, 'loanTokenLedger', tokenName); 

                    // other variables will be affected by repeated tests
                    assert.equal(mockFa2LoanToken.tokenName              , tokenName);

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
                const reserveRatio                          = 1000; // 10% reserves (4 decimals)
                const optimalUtilisationRate                = 50 * (10 ** (interestRateDecimals - 2));  // 30% utilisation rate kink
                const baseInterestRate                      = 5  * (10 ** (interestRateDecimals - 2));  // 5%
                const maxInterestRate                       = 25 * (10 ** (interestRateDecimals - 2));  // 25% 
                const interestRateBelowOptimalUtilisation   = 10 * (10 ** (interestRateDecimals - 2));  // 10% 
                const interestRateAboveOptimalUtilisation   = 20 * (10 ** (interestRateDecimals - 2));  // 20%

                const minRepaymentAmount                    = 10000;

                // update token oracle with token decimals
                const tezIndex = tokenOracles.findIndex((o => o.name === "tez"));
                tokenOracles[tezIndex].tokenDecimals = tokenDecimals;

                // check if loan token exists
                const checkLoanTokenExists   = await getStorageMapValue(lendingControllerStorage, 'loanTokenLedger', tokenName); 

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
                    const tezLoanToken   = await getStorageMapValue(lendingControllerStorage, 'loanTokenLedger', tokenName); 
                
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
    

                } else {

                    lendingControllerStorage  = await lendingControllerInstance.storage();
                    const tezLoanToken   = await getStorageMapValue(lendingControllerStorage, 'loanTokenLedger', tokenName); 
                
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
                await signerFactory(tezos, alice.sk);
                lendingControllerStorage = await lendingControllerInstance.storage();
                const currentAdmin = lendingControllerStorage.admin;

                const setLoanTokenActionType                = "createLoanToken";

                const tokenName                             = "failTestLoanToken";
                const tokenContractAddress                  = contractDeployments.mavrykFa2Token.address;
                const tokenType                             = "fa2";
                const tokenDecimals                         = 6;

                const oracleAddress                         = contractDeployments.mockUsdXtzAggregator.address;

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
                const failTestLoanToken   = await getStorageMapValue(lendingControllerStorage, 'loanTokenLedger', tokenName); 

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

        it('admin can set mock FA12 as a collateral token', async () => {

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
                const checkCollateralTokenExists   = await getStorageMapValue(lendingControllerStorage, 'collateralTokenLedger', tokenName); 

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

                    lendingControllerStorage        = await lendingControllerInstance.storage();
                    const mockFa12CollateralToken   = await getStorageMapValue(lendingControllerStorage, 'collateralTokenLedger', tokenName); 
                
                    assert.equal(mockFa12CollateralToken.tokenName              , tokenName);

                    assert.equal(mockFa12CollateralToken.tokenDecimals          , tokenDecimals);
                    assert.equal(mockFa12CollateralToken.oracleAddress          , oracleAddress);
                    assert.equal(mockFa12CollateralToken.protected              , tokenProtected);

                }
                

            } catch(e){
                console.log(e);
            } 
        });

        it('admin can set mock FA2 as a collateral token', async () => {

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
                const checkCollateralTokenExists   = await getStorageMapValue(lendingControllerStorage, 'collateralTokenLedger', tokenName); 

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

                    lendingControllerStorage        = await lendingControllerInstance.storage();
                    const mockFa2CollateralToken    = await getStorageMapValue(lendingControllerStorage, 'collateralTokenLedger', tokenName); 

                    assert.equal(mockFa2CollateralToken.tokenName              , tokenName);

                    assert.equal(mockFa2CollateralToken.tokenDecimals          , tokenDecimals);
                    assert.equal(mockFa2CollateralToken.oracleAddress          , oracleAddress);
                    assert.equal(mockFa2CollateralToken.protected              , tokenProtected);

                }

            } catch(e){
                console.log(e);
            } 
        });

        it('admin can set tez as a collateral token', async () => {

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
                const checkCollateralTokenExists   = await getStorageMapValue(lendingControllerStorage, 'collateralTokenLedger', tokenName); 

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

                    lendingControllerStorage        = await lendingControllerInstance.storage();
                    const mockFa2CollateralToken    = await getStorageMapValue(lendingControllerStorage, 'collateralTokenLedger', tokenName); 

                    assert.equal(mockFa2CollateralToken.tokenName              , tokenName);

                    assert.equal(mockFa2CollateralToken.tokenDecimals          , tokenDecimals);
                    assert.equal(mockFa2CollateralToken.oracleAddress          , oracleAddress);
                    assert.equal(mockFa2CollateralToken.protected              , tokenProtected);

                }

            } catch(e){
                console.log(e);
            } 
        });

        it('non-admin should not be able to call this entrypoint', async () => {
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
                lendingControllerStorage = await lendingControllerInstance.storage();
                const failTestCollateralToken   = await getStorageMapValue(lendingControllerStorage, 'collateralTokenLedger', tokenName); 

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


        it('non-admin cannot set admin', async () => {
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
    })




    // 
    // Setup Lending Controller liquidity pools
    //
    describe('%addLiquidity - setup lending controller liquidity for interest rate tests', function () {

        it('user (eve) can add liquidity for mock FA12 token into Lending Controller token pool (100 MockFA12 Tokens)', async () => {
    
            // init variables
            await signerFactory(tezos, eve.sk);
            const loanTokenName = "usdt";
            const liquidityAmount = 100000000; // 100 Mock FA12 Tokens

            lendingControllerStorage = await lendingControllerInstance.storage();
            
            // get mock fa12 token storage and lp token pool mock fa12 token storage
            const mockFa12TokenStorage              = await mockFa12TokenInstance.storage();
            const mTokenPoolMockFa12TokenStorage    = await mTokenUsdtInstance.storage();

            // get initial eve's Mock FA12 Token balance
            const eveMockFa12Ledger                 = await getStorageMapValue(mockFa12TokenStorage, 'ledger', eve.pkh);            
            const eveInitialMockFa12TokenBalance    = eveMockFa12Ledger == undefined ? 0 : eveMockFa12Ledger.balance.toNumber();

            // get initial eve's mEurl Token - Mock FA12 Token - balance
            const eveMUsdtTokenLedger                 = await getStorageMapValue(mTokenPoolMockFa12TokenStorage, 'ledger', eve.pkh);            
            const eveInitialMUsdtTokenTokenBalance    = eveMUsdtTokenLedger == undefined ? 0 : eveMUsdtTokenLedger.toNumber();

            // get initial lending controller's Mock FA12 Token balance
            const lendingControllerMockFa12Ledger                = await getStorageMapValue(mockFa12TokenStorage, 'ledger', lendingControllerAddress);            
            const lendingControllerInitialMockFa12TokenBalance   = lendingControllerMockFa12Ledger == undefined ? 0 : lendingControllerMockFa12Ledger.balance.toNumber();

            // get initial lending controller token pool total
            initialLoanTokenRecord                 = await getStorageMapValue(lendingControllerStorage, 'loanTokenLedger', loanTokenName);
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
                liquidityAmount, 
            ).send();
            await eveDepositTokenOperation.confirmation();

            // get updated storages
            const updatedLendingControllerStorage         = await lendingControllerInstance.storage();
            const updatedMockFa12TokenStorage             = await mockFa12TokenInstance.storage();
            const updatedMUsdtTokenTokenStorage           = await mTokenUsdtInstance.storage();

            // check new balance for loan token pool total
            updatedLoanTokenRecord                  = await getStorageMapValue(updatedLendingControllerStorage, 'loanTokenLedger', loanTokenName);
            assert.equal(updatedLoanTokenRecord.tokenPoolTotal, lendingControllerInitialTokenPoolTotal + liquidityAmount);

            // check Eve's Mock FA12 Token balance
            const updatedEveMockFa12Ledger          = await getStorageMapValue(updatedMockFa12TokenStorage, 'ledger', eve.pkh);            
            assert.equal(updatedEveMockFa12Ledger.balance, eveInitialMockFa12TokenBalance - liquidityAmount);

            // check Lending Controller's Mock FA12 Token Balance
            const lendingControllerMockFa12Account  = await getStorageMapValue(updatedMockFa12TokenStorage, 'ledger', lendingControllerAddress);            
            assert.equal(lendingControllerMockFa12Account.balance, lendingControllerInitialMockFa12TokenBalance + liquidityAmount);

            // check Eve's mUsdt Token Token balance
            const updatedEveMUsdtTokenLedger        = await getStorageMapValue(updatedMUsdtTokenTokenStorage, 'ledger', eve.pkh);            
            assert.equal(updatedEveMUsdtTokenLedger, eveInitialMUsdtTokenTokenBalance + liquidityAmount);        

        });

        it('user (eve) can add liquidity for mock FA2 token into Lending Controller token pool (100 MockFA2 Tokens)', async () => {
    
            // init variables
            await signerFactory(tezos, eve.sk);
            const loanTokenName = "eurl";
            const liquidityAmount = 100000000; // 100 Mock FA2 Tokens

            lendingControllerStorage = await lendingControllerInstance.storage();
            
            // get mock fa2 token storage and lp token pool mock fa2 token storage
            const mockFa2TokenStorage              = await mockFa2TokenInstance.storage();
            const mTokenPoolMockFa2TokenStorage    = await mTokenEurlInstance.storage();
            
            // get initial eve's Mock FA2 Token balance
            const eveMockFa2Ledger                 = await getStorageMapValue(mockFa2TokenStorage, 'ledger', eve.pkh);            
            const eveInitialMockFa2TokenBalance    = eveMockFa2Ledger == undefined ? 0 : eveMockFa2Ledger.toNumber();

            // get initial eve's mEurl Token - Mock FA2 Token - balance
            const eveMEurlTokenLedger                 = await getStorageMapValue(mTokenPoolMockFa2TokenStorage, 'ledger', eve.pkh);            
            const eveInitialMEurlTokenTokenBalance    = eveMEurlTokenLedger == undefined ? 0 : eveMEurlTokenLedger.toNumber();

            // get initial lending controller's Mock FA2 Token balance
            const lendingControllerMockFa2Ledger                = await getStorageMapValue(mockFa2TokenStorage, 'ledger', lendingControllerAddress);            
            const lendingControllerInitialMockFa2TokenBalance   = lendingControllerMockFa2Ledger == undefined ? 0 : lendingControllerMockFa2Ledger.toNumber();

            // get initial lending controller token pool total
            initialLoanTokenRecord                 = await getStorageMapValue(lendingControllerStorage, 'loanTokenLedger', loanTokenName);
            const lendingControllerInitialTokenPoolTotal = initialLoanTokenRecord.tokenPoolTotal.toNumber();

            // update operators for vault
            updateOperatorsOperation = await updateOperators(mockFa2TokenInstance, eve.pkh, lendingControllerAddress, tokenId);
            await updateOperatorsOperation.confirmation();

            // eve deposits mock FA12 tokens into lending controller token pool
            const eveDepositTokenOperation  = await lendingControllerInstance.methods.addLiquidity(
                loanTokenName,
                liquidityAmount, 
            ).send();
            await eveDepositTokenOperation.confirmation();

            // get updated storages
            const updatedLendingControllerStorage  = await lendingControllerInstance.storage();
            const updatedMockFa2TokenStorage       = await mockFa2TokenInstance.storage();
            
            const updatedMEurlTokenTokenStorage     = await mTokenEurlInstance.storage();

            // check new balance for loan token pool total
            updatedLoanTokenRecord           = await getStorageMapValue(updatedLendingControllerStorage, 'loanTokenLedger', loanTokenName);
            assert.equal(updatedLoanTokenRecord.tokenPoolTotal, lendingControllerInitialTokenPoolTotal + liquidityAmount);

            // check Eve's Mock FA12 Token balance
            const updatedEveMockFa2Ledger          = await getStorageMapValue(updatedMockFa2TokenStorage, 'ledger', eve.pkh);            
            assert.equal(updatedEveMockFa2Ledger, eveInitialMockFa2TokenBalance - liquidityAmount);

            // check Lending Controller's Mock FA2 Token Balance
            const lendingControllerMockFa2Account             = await getStorageMapValue(updatedMockFa2TokenStorage, 'ledger', lendingControllerAddress);            
            assert.equal(lendingControllerMockFa2Account, lendingControllerInitialMockFa2TokenBalance + liquidityAmount);

            // check Eve's mEurl Token Token balance
            const updatedEveMEurlTokenLedger        = await getStorageMapValue(updatedMEurlTokenTokenStorage, 'ledger', eve.pkh);            
            assert.equal(updatedEveMEurlTokenLedger, eveInitialMEurlTokenTokenBalance + liquidityAmount);        

        });


        it('user (eve) can add liquidity for tez into Lending Controller token pool (100 XTZ)', async () => {
    
            // init variables
            await signerFactory(tezos, eve.sk);
            const loanTokenName = "tez";
            const liquidityAmount = 100000000; // 100 XTZ

            lendingControllerStorage = await lendingControllerInstance.storage();
            
            // get mTokenXtz token storage (FA2 Token Standard)
            const mTokenPoolXtzStorage   = await mTokenXtzInstance.storage();

            // get initial eve XTZ balance
            const eveInitialXtzLedger   = await utils.tezos.tz.getBalance(eve.pkh);
            const eveInitialXtzBalance  = eveInitialXtzLedger.toNumber();

            // get initial eve's mEurl Token - Tez - balance
            const eveMXtzTokenLedger            = await getStorageMapValue(mTokenPoolXtzStorage, 'ledger', eve.pkh);            
            const eveInitialMXtzTokenBalance    = eveMXtzTokenLedger == undefined ? 0 : eveMXtzTokenLedger.toNumber();
            
            // get initial lending controller's XTZ balance
            const lendingControllerInitialXtzLedger   = await utils.tezos.tz.getBalance(lendingControllerAddress);
            const lendingControllerInitialXtzBalance  = lendingControllerInitialXtzLedger.toNumber();

            // get initial lending controller token pool total
            initialLoanTokenRecord                 = await getStorageMapValue(lendingControllerStorage, 'loanTokenLedger', loanTokenName);
            const lendingControllerInitialTokenPoolTotal = initialLoanTokenRecord.tokenPoolTotal.toNumber();

            // eve deposits mock XTZ into lending controller token pool
            const eveAddLiquidityOperation  = await lendingControllerInstance.methods.addLiquidity(
                loanTokenName,
                liquidityAmount, 
            ).send({ mumav: true, amount: liquidityAmount });
            await eveAddLiquidityOperation.confirmation();

            // get updated storages
            const updatedLendingControllerStorage  = await lendingControllerInstance.storage();
            const updatedMXtzTokenStorage     = await mTokenXtzInstance.storage();

            // check new balance for loan token pool total
            updatedLoanTokenRecord           = await getStorageMapValue(updatedLendingControllerStorage, 'loanTokenLedger', loanTokenName);
            assert.equal(updatedLoanTokenRecord.tokenPoolTotal, lendingControllerInitialTokenPoolTotal + liquidityAmount);

            // check Lending Controller's XTZ Balance
            const lendingControllerXtzBalance           = await utils.tezos.tz.getBalance(lendingControllerAddress);
            assert.equal(lendingControllerXtzBalance, lendingControllerInitialXtzBalance + liquidityAmount);

            // check Eve's mTokenXtz balance
            const updatedEveMXtzTokenLedger        = await getStorageMapValue(updatedMXtzTokenStorage, 'ledger', eve.pkh);            
            assert.equal(updatedEveMXtzTokenLedger, eveInitialMXtzTokenBalance + liquidityAmount);        

            // check Eve's XTZ Balance and account for gas cost in transaction with almostEqual
            const eveXtzBalance = await utils.tezos.tz.getBalance(eve.pkh);
            assert.equal(almostEqual(eveXtzBalance, eveInitialXtzBalance - liquidityAmount, 0.0001), true)

        });
    
    })

    
    // 
    // Test: repay
    //
    describe('%repay mockFA12 Tokens - mock time tests (1 month)', function () {

        it('user (eve) can repay debt - Mock FA12 Token  - mock one month - utilisation rate below optimal utilisation rate - repayment greater than interest', async () => {

            // Conditions: 
            // - vault loan token: mock FA12 tokens
            // - mock time: 1 month
            // - token pool interest rate: below optimal utilisation rate
            // - repay amount: greater than interest amount 

            // Summary of steps:
            // 1. Create Vault
            // 2. Deposit collateral into vault (100 Mock FA12 Tokens, 100 Mock FA2 Tokens)
            // 3. Borrow from vault (50 Mock FA12 Tokens)
            // 4. Set block levels time to 1 year in future
            // 5. Repay partial debt

            // init variables
            await signerFactory(tezos, eve.sk);
            const lendingControllerStorage = await lendingControllerInstance.storage();
            const vaultFactoryStorage      = await vaultFactoryInstance.storage();

            // ----------------------------------------------------------------------------------------------
            // Create Vault
            // ----------------------------------------------------------------------------------------------

            const vaultCounter  = vaultFactoryStorage.vaultCounter;
            const vaultId       = vaultCounter.toNumber();
            const vaultOwner    = eve.pkh;
            const vaultName     = "newVault";
            const loanTokenName = "usdt";
            const depositorsConfig      = "any";

            const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
                baker.pkh,              // delegate to
                loanTokenName,          // loan token type
                vaultName,              // vault name
                null,                   // collateral tokens
                depositorsConfig        // depositors config type - any / whitelist
            ).send();
            await userCreatesNewVaultOperation.confirmation();

            const vaultHandle = {
                "id"    : vaultId,
                "owner" : vaultOwner
            };
            const newVaultRecord = await getStorageMapValue(lendingControllerStorage, 'vaults', vaultHandle);
            const vaultAddress   = newVaultRecord.address;
            const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

            // console.log('   - vault originated: ' + vaultAddress);
            // console.log('   - vault id: ' + vaultId);

            // push new vault id to vault set
            eveVaultSet.push(vaultId);

            // ----------------------------------------------------------------------------------------------
            // Deposit Collateral into Vault
            // ----------------------------------------------------------------------------------------------

            const mockFa12DepositAmount      = 15000000;   // 15 Mock FA12 Tokens
            const mockFa2DepositAmount       = 15000000;   // 15 Mock FA12 Tokens

            // ---------------------------------
            // Deposit Mock FA12 Tokens
            // ---------------------------------

            // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
            // reset token allowance
            const resetTokenAllowanceForDeposit = await mockFa12TokenInstance.methods.approve(
                vaultAddress,
                0
            ).send();
            await resetTokenAllowanceForDeposit.confirmation();

            // set new token allowance
            const setNewTokenAllowanceForDeposit = await mockFa12TokenInstance.methods.approve(
                vaultAddress,
                mockFa12DepositAmount
            ).send();
            await setNewTokenAllowanceForDeposit.confirmation();

            // eve deposits mock FA12 tokens into vault
            const eveDepositMockFa12TokenOperation  = await vaultInstance.methods.initVaultAction(
                "deposit",
                mockFa12DepositAmount,                 
                "usdt"
            ).send();
            await eveDepositMockFa12TokenOperation.confirmation();

            // ---------------------------------
            // Deposit Mock FA2 Tokens
            // ---------------------------------

            // update operators for vault
            updateOperatorsOperation = await updateOperators(mockFa2TokenInstance, eve.pkh, vaultAddress, tokenId);
            await updateOperatorsOperation.confirmation();

            // eve deposits mock FA2 tokens into vault
            const eveDepositTokenOperation = await vaultInstance.methods.initVaultAction(
                "deposit",
                mockFa2DepositAmount,    
                "eurl"
            ).send();
            await eveDepositTokenOperation.confirmation();

            // console.log('   - vault collateral deposited');

            // ----------------------------------------------------------------------------------------------
            // Borrow with Vault
            // ----------------------------------------------------------------------------------------------

            // borrow amount - 2 Mock FA12 Tokens
            const borrowAmount = 2000000;   

            // borrow operation
            const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
            await eveBorrowOperation.confirmation();

            // console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName);

            // get initial Mock FA12 Token balance for Eve, Treasury and Token Pool Reward Contract
            const eveMockFa12Ledger                 = await getStorageMapValue(mockFa12TokenStorage, 'ledger', eve.pkh);            
            const eveInitialMockFa12TokenBalance    = eveMockFa12Ledger == undefined ? 0 : eveMockFa12Ledger.balance.toNumber();

            const treasuryMockFa12Ledger                = await getStorageMapValue(mockFa12TokenStorage, 'ledger', contractDeployments.treasury.address);            
            const treasuryInitialMockFa12TokenBalance   = treasuryMockFa12Ledger == undefined ? 0 : treasuryMockFa12Ledger.balance.toNumber();

            // get token pool stats
            const afterBorrowloanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const loanTokenDecimals    = afterBorrowloanTokenRecordView.Some.tokenDecimals;
            const interestRateDecimals = (27 - 2); 

            const tokenPoolTotal           = afterBorrowloanTokenRecordView.Some.tokenPoolTotal.toNumber() / (10 ** loanTokenDecimals);
            const totalBorrowed            = afterBorrowloanTokenRecordView.Some.totalBorrowed.toNumber() / (10 ** loanTokenDecimals);
            const optimalUtilisationRate   = Number(afterBorrowloanTokenRecordView.Some.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const utilisationRate          = Number(afterBorrowloanTokenRecordView.Some.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const currentInterestRate      = Number(afterBorrowloanTokenRecordView.Some.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";

            // console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);

            // ----------------------------------------------------------------------------------------------
            // Set Block Levels For Mock Time Test - 1 month
            // ----------------------------------------------------------------------------------------------

            await signerFactory(tezos, bob.sk); // temporarily set to tester to increase block levels

            const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
            const updatedVault                      = await getStorageMapValue(updatedLendingControllerStorage, 'vaults', vaultHandle);
            const lastUpdatedBlockLevel             = updatedVault.lastUpdatedBlockLevel;

            const newBlockLevel = lastUpdatedBlockLevel.toNumber() + oneMonthLevelBlocks;

            const setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(newBlockLevel, 'configMockLevel').send();
            await setMockLevelOperation.confirmation();

            const mockTimeLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedMockLevel = mockTimeLendingControllerStorage.config.mockLevel;

            assert.equal(updatedMockLevel, newBlockLevel);

            // console.log('   - time set to 1 month ahead: ' + lastUpdatedBlockLevel + ' to ' + newBlockLevel);

            // ----------------------------------------------------------------------------------------------
            // Repay partial debt 
            // ----------------------------------------------------------------------------------------------

            // set back to user
            await signerFactory(tezos, eve.sk);  

            // treasury share of interest repaid
            const configInterestTreasuryShare = await lendingControllerStorage.config.interestTreasuryShare;

            // repayment amount
            const repayAmount = 500000; // 0.5 Mock FA12 Tokens

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

            // get vault and loan token views, and storage
            vaultRecordView        = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            loanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            
            const beforeRepaymentStorage = await lendingControllerInstance.storage();

            const initialVaultLoanOutstandingTotal         = vaultRecordView.Some.loanOutstandingTotal;
            const beforeRepaymentVaultBorrowIndex          = vaultRecordView.Some.borrowIndex;
            const beforeRepaymentVaultOutstandingTotal     = vaultRecordView.Some.loanOutstandingTotal;
            const beforeRepaymentVaultPrincipalTotal       = vaultRecordView.Some.loanPrincipalTotal;
            const beforeRepaymentTokenBorrowIndex          = loanTokenRecordView.Some.borrowIndex;

            initialTokenRewardIndex = loanTokenRecordView.Some.tokenRewardIndex;
            initialTokenPoolTotal   = loanTokenRecordView.Some.tokenPoolTotal;

            // repay operation
            const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send();
            await eveRepayOperation.confirmation();

            // console.log('   - repaid: ' + repayAmount + " | type: " + loanTokenName);

            // get updated storage
            const updatedLendingControllerStorageAfterRepay     = await lendingControllerInstance.storage();
            const updatedVaultRecord                            = await getStorageMapValue(updatedLendingControllerStorageAfterRepay, 'vaults', vaultHandle);
            const updatedMockFa12TokenStorage                   = await mockFa12TokenInstance.storage();
            
            // get updated Mock FA12 Token balance for Eve, Treasury and Token Pool Reward Contract
            const updatedEveMockFa12Ledger                      = await getStorageMapValue(updatedMockFa12TokenStorage, 'ledger', eve.pkh);            
            const updatedEveMockFa12TokenBalance                = updatedEveMockFa12Ledger == undefined ? 0 : updatedEveMockFa12Ledger.balance.toNumber();

            const updatedTreasuryMockFa12Ledger                 = await getStorageMapValue(updatedMockFa12TokenStorage, 'ledger', contractDeployments.treasury.address);            
            const updatedTreasuryMockFa12TokenBalance           = updatedTreasuryMockFa12Ledger == undefined ? 0 : updatedTreasuryMockFa12Ledger.balance.toNumber();

            // On-chain views to vault and loan token
            updatedVaultRecordView     = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            updatedLoanTokenRecordView = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});

            const updatedLoanOutstandingTotal             = updatedVaultRecordView.Some.loanOutstandingTotal;
            const updatedLoanPrincipalTotal               = updatedVaultRecordView.Some.loanPrincipalTotal;
            const updatedLoanInterestTotal                = updatedVaultRecordView.Some.loanInterestTotal;

            const afterRepaymentVaultBorrowIndex          = updatedVaultRecordView.Some.borrowIndex;
            const afterRepaymentTokenBorrowIndex          = updatedLoanTokenRecordView.Some.borrowIndex;
            
            const loanOutstandingWithAccruedInterest      = lendingHelper.calculateAccruedInterest(beforeRepaymentVaultOutstandingTotal, beforeRepaymentVaultBorrowIndex, afterRepaymentTokenBorrowIndex);
            const totalInterest                           = loanOutstandingWithAccruedInterest - initialVaultLoanOutstandingTotal.toNumber();
            
            // check if repayAmount covers whole or partial of total interest 
            const totalInterestPaid                       = repayAmount < totalInterest ? repayAmount : totalInterest;
            const remainingInterest                       = totalInterest - repayAmount < 0 ? 0 : totalInterest - repayAmount;
            
            const finalLoanOutstandingTotal               = loanOutstandingWithAccruedInterest - repayAmount;
            const finalLoanPrincipalTotal                 = remainingInterest > 0 ? beforeRepaymentVaultPrincipalTotal : loanOutstandingWithAccruedInterest - repayAmount;
            const finalLoanInterestTotal                  = remainingInterest > 0 ? remainingInterest : 0;

            const interestTreasuryShare                   = lendingHelper.calculateInterestSentToTreasury(configInterestTreasuryShare, totalInterestPaid);
            const interestRewards                         = totalInterestPaid - interestTreasuryShare;

            // calculate new reward index
            updatedTokenRewardIndex                       = updatedLoanTokenRecordView.Some.tokenRewardIndex;
            const calculatedTokenRewardIndex              = lendingHelper.calculateNewRewardIndex(interestRewards, initialTokenPoolTotal, initialTokenRewardIndex);
            assert.equal(almostEqual(updatedTokenRewardIndex.toNumber(), calculatedTokenRewardIndex, 0.00001), true);

            // console.log('   - final vault stats >> outstanding total: ' + finalLoanOutstandingTotal + " | principal total: " + finalLoanPrincipalTotal  + " | interest total: " + finalLoanInterestTotal);
            // console.log('   - interest stats >> total interest: ' + totalInterest + ' | interest paid: ' + totalInterestPaid +' | interest to treasury: ' + interestTreasuryShare + " | interest to reward pool: " + interestRewards);

            assert.equal(updatedLoanOutstandingTotal.toNumber(), finalLoanOutstandingTotal);
            assert.equal(updatedLoanPrincipalTotal.toNumber(), finalLoanPrincipalTotal);
            assert.equal(updatedLoanInterestTotal.toNumber(), finalLoanInterestTotal);
            assert.equal(afterRepaymentVaultBorrowIndex.toNumber(), afterRepaymentTokenBorrowIndex.toNumber());
            assert.equal(updatedEveMockFa12TokenBalance, eveInitialMockFa12TokenBalance - repayAmount);

            // check treasury fees and interest to token pool reward contract
            assert.equal(updatedTreasuryMockFa12TokenBalance, treasuryInitialMockFa12TokenBalance + interestTreasuryShare)
        })



        it('user (eve) can repay debt - Mock FA12 Token  - mock one month - utilisation rate below optimal utilisation rate - repayment less than interest', async () => {

            // Conditions: 
            // - vault loan token: mock FA12 tokens
            // - mock time: 1 month
            // - token pool interest rate: below optimal utilisation rate
            // - repay amount: less than interest amount

            // Summary of steps:
            // 1. Create Vault
            // 2. Deposit collateral into vault (100 Mock FA12 Tokens, 100 Mock FA2 Tokens)
            // 3. Borrow from vault (50 Mock FA12 Tokens)
            // 4. Set block levels time to 1 year in future
            // 5. Repay partial debt

            // init variables
            await signerFactory(tezos, eve.sk);
            const lendingControllerStorage = await lendingControllerInstance.storage();
            const vaultFactoryStorage      = await vaultFactoryInstance.storage();

            // ----------------------------------------------------------------------------------------------
            // Create Vault
            // ----------------------------------------------------------------------------------------------
            
            const vaultCounter  = vaultFactoryStorage.vaultCounter;
            const vaultId       = vaultCounter.toNumber();
            const vaultOwner    = eve.pkh;
            const loanTokenName = "usdt";
            const vaultName     = "newVault";
            const depositorsConfig      = "any";

            const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
                baker.pkh,              // delegate to
                loanTokenName,          // loan token type
                vaultName,              // vault name
                null,                   // collateral tokens
                depositorsConfig        // depositors config type - any / whitelist
            ).send();
            await userCreatesNewVaultOperation.confirmation();

            const vaultHandle = {
                "id"    : vaultId,
                "owner" : vaultOwner
            };
            const newVaultRecord = await getStorageMapValue(lendingControllerStorage, 'vaults', vaultHandle);
            const vaultAddress   = newVaultRecord.address;
            const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

            // console.log('   - vault originated: ' + vaultAddress);
            // console.log('   - vault id: ' + vaultId);

            // push new vault id to vault set
            eveVaultSet.push(vaultId);

            // ----------------------------------------------------------------------------------------------
            // Deposit Collateral into Vault
            // ----------------------------------------------------------------------------------------------

            const mockFa12DepositAmount      = 15000000;   // 15 Mock FA12 Tokens
            const mockFa2DepositAmount       = 15000000;   // 15 Mock FA12 Tokens

            // ---------------------------------
            // Deposit Mock FA12 Tokens
            // ---------------------------------

            // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
            // reset token allowance
            const resetTokenAllowanceForDeposit = await mockFa12TokenInstance.methods.approve(
                vaultAddress,
                0
            ).send();
            await resetTokenAllowanceForDeposit.confirmation();

            // set new token allowance
            const setNewTokenAllowanceForDeposit = await mockFa12TokenInstance.methods.approve(
                vaultAddress,
                mockFa12DepositAmount
            ).send();
            await setNewTokenAllowanceForDeposit.confirmation();

            // eve deposits mock FA12 tokens into vault
            const eveDepositMockFa12TokenOperation  = await vaultInstance.methods.initVaultAction(
                "deposit",
                mockFa12DepositAmount,    
                "usdt"
            ).send();
            await eveDepositMockFa12TokenOperation.confirmation();

            // ---------------------------------
            // Deposit Mock FA2 Tokens
            // ---------------------------------

            // update operators for vault
            updateOperatorsOperation = await updateOperators(mockFa2TokenInstance, eve.pkh, vaultAddress, tokenId);
            await updateOperatorsOperation.confirmation();
            
            // eve deposits mock FA2 tokens into vault
            const eveDepositTokenOperation  = await vaultInstance.methods.initVaultAction(
                "deposit",
                mockFa2DepositAmount,      
                "eurl"
            ).send();
            await eveDepositTokenOperation.confirmation();

            // console.log('   - vault collateral deposited');

            // ----------------------------------------------------------------------------------------------
            // Borrow with Vault
            // ----------------------------------------------------------------------------------------------

            // borrow amount - 2 Mock FA12 Tokens
            const borrowAmount = 2000000;   

            // borrow operation
            const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
            await eveBorrowOperation.confirmation();

            // console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName);

            // get initial Mock FA12 Token balance for Eve, Treasury and Token Pool Reward Contract
            const eveMockFa12Ledger                 = await getStorageMapValue(mockFa12TokenStorage, 'ledger', eve.pkh);            
            const eveInitialMockFa12TokenBalance    = eveMockFa12Ledger == undefined ? 0 : eveMockFa12Ledger.balance.toNumber();

            const treasuryMockFa12Ledger                = await getStorageMapValue(mockFa12TokenStorage, 'ledger', contractDeployments.treasury.address);            
            const treasuryInitialMockFa12TokenBalance   = treasuryMockFa12Ledger == undefined ? 0 : treasuryMockFa12Ledger.balance.toNumber();

            // get token pool stats
            const afterBorrowloanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const loanTokenDecimals    = afterBorrowloanTokenRecordView.Some.tokenDecimals;
            const interestRateDecimals = (27 - 2); 

            const tokenPoolTotal           = afterBorrowloanTokenRecordView.Some.tokenPoolTotal.toNumber() / (10 ** loanTokenDecimals);
            const totalBorrowed            = afterBorrowloanTokenRecordView.Some.totalBorrowed.toNumber() / (10 ** loanTokenDecimals);
            const optimalUtilisationRate   = Number(afterBorrowloanTokenRecordView.Some.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const utilisationRate          = Number(afterBorrowloanTokenRecordView.Some.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const currentInterestRate      = Number(afterBorrowloanTokenRecordView.Some.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";

            // console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);

            // ----------------------------------------------------------------------------------------------
            // Set Block Levels For Mock Time Test - 1 month
            // ----------------------------------------------------------------------------------------------

            await signerFactory(tezos, bob.sk); // temporarily set to tester to increase block levels

            const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
            const updatedVault                      = await getStorageMapValue(updatedLendingControllerStorage, 'vaults', vaultHandle);
            const lastUpdatedBlockLevel             = updatedVault.lastUpdatedBlockLevel;

            const newBlockLevel = lastUpdatedBlockLevel.toNumber() + oneMonthLevelBlocks;

            const setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(newBlockLevel, 'configMockLevel').send();
            await setMockLevelOperation.confirmation();

            const mockTimeLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedMockLevel = mockTimeLendingControllerStorage.config.mockLevel;

            assert.equal(updatedMockLevel, newBlockLevel);

            // console.log('   - time set to 1 month ahead: ' + lastUpdatedBlockLevel + ' to ' + newBlockLevel);

            // ----------------------------------------------------------------------------------------------
            // Repay partial debt 
            // ----------------------------------------------------------------------------------------------

            // set back to user
            await signerFactory(tezos, eve.sk);  

            // treasury share of interest repaid
            const configInterestTreasuryShare = await lendingControllerStorage.config.interestTreasuryShare;

            // repayment amount
            const repayAmount = 10000; // 0.01 Mock FA12 Tokens

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

            // get vault and loan token views, and storage
            const vaultRecordView        = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            const loanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const beforeRepaymentStorage = await lendingControllerInstance.storage();

            const initialVaultLoanOutstandingTotal         = vaultRecordView.Some.loanOutstandingTotal;
            const beforeRepaymentVaultBorrowIndex          = vaultRecordView.Some.borrowIndex;
            const beforeRepaymentVaultOutstandingTotal     = vaultRecordView.Some.loanOutstandingTotal;
            const beforeRepaymentVaultPrincipalTotal       = vaultRecordView.Some.loanPrincipalTotal;
            const beforeRepaymentTokenBorrowIndex          = loanTokenRecordView.Some.borrowIndex;

            initialTokenRewardIndex = loanTokenRecordView.Some.tokenRewardIndex;
            initialTokenPoolTotal   = loanTokenRecordView.Some.tokenPoolTotal;

            // const repayOpParam        = await lendingControllerInstance.methods.repay(vaultId, repayAmount).toTransferParams();
            // const estimate            = await utils.tezos.estimate.transfer(repayOpParam);
            // console.log("REPAY OP ESTIMATION: ", estimate);

            // repay operation
            const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send();
            await eveRepayOperation.confirmation();

            // console.log('   - repaid: ' + repayAmount + " | type: " + loanTokenName);

            // get updated storage
            const updatedLendingControllerStorageAfterRepay     = await lendingControllerInstance.storage();
            const updatedVaultRecord                            = await getStorageMapValue(updatedLendingControllerStorageAfterRepay, 'vaults', vaultHandle);
            const updatedMockFa12TokenStorage                   = await mockFa12TokenInstance.storage();
            
            // get updated Mock FA12 Token balance for Eve, Treasury and Token Pool Reward Contract
            const updatedEveMockFa12Ledger                      = await getStorageMapValue(updatedMockFa12TokenStorage, 'ledger', eve.pkh);            
            const updatedEveMockFa12TokenBalance                = updatedEveMockFa12Ledger == undefined ? 0 : updatedEveMockFa12Ledger.balance.toNumber();

            const updatedTreasuryMockFa12Ledger                 = await getStorageMapValue(updatedMockFa12TokenStorage, 'ledger', contractDeployments.treasury.address);            
            const updatedTreasuryMockFa12TokenBalance           = updatedTreasuryMockFa12Ledger == undefined ? 0 : updatedTreasuryMockFa12Ledger.balance.toNumber();

            // On-chain views to vault and loan token
            updatedVaultRecordView = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            updatedLoanTokenRecordView = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            
            const updatedLoanOutstandingTotal             = updatedVaultRecordView.Some.loanOutstandingTotal;
            const updatedLoanPrincipalTotal               = updatedVaultRecordView.Some.loanPrincipalTotal;
            const updatedLoanInterestTotal                = updatedVaultRecordView.Some.loanInterestTotal;

            const afterRepaymentVaultBorrowIndex          = updatedVaultRecordView.Some.borrowIndex;
            const afterRepaymentTokenBorrowIndex          = updatedLoanTokenRecordView.Some.borrowIndex;
            
            const loanOutstandingWithAccruedInterest      = lendingHelper.calculateAccruedInterest(beforeRepaymentVaultOutstandingTotal, beforeRepaymentVaultBorrowIndex, afterRepaymentTokenBorrowIndex);
            const totalInterest                           = loanOutstandingWithAccruedInterest - initialVaultLoanOutstandingTotal.toNumber();
            
            // check if repayAmount covers whole or partial of total interest 
            const totalInterestPaid                       = repayAmount < totalInterest ? repayAmount : totalInterest;
            const remainingInterest                       = totalInterest - repayAmount < 0 ? 0 : totalInterest - repayAmount;

            const finalLoanOutstandingTotal               = loanOutstandingWithAccruedInterest - repayAmount;
            const finalLoanPrincipalTotal                 = remainingInterest > 0 ? beforeRepaymentVaultPrincipalTotal : loanOutstandingWithAccruedInterest - repayAmount;
            const finalLoanInterestTotal                  = remainingInterest > 0 ? remainingInterest : 0;

            const interestTreasuryShare                   = lendingHelper.calculateInterestSentToTreasury(configInterestTreasuryShare, totalInterestPaid);
            const interestRewards                         = totalInterestPaid - interestTreasuryShare;

            // calculate new reward index
            updatedTokenRewardIndex                       = updatedLoanTokenRecordView.Some.tokenRewardIndex;
            const calculatedTokenRewardIndex              = lendingHelper.calculateNewRewardIndex(interestRewards, initialTokenPoolTotal, initialTokenRewardIndex);
            assert.equal(almostEqual(updatedTokenRewardIndex.toNumber(), calculatedTokenRewardIndex, 0.00001), true);

            // console.log('   - final vault stats >> outstanding total: ' + finalLoanOutstandingTotal + " | principal total: " + finalLoanPrincipalTotal  + " | interest total: " + finalLoanInterestTotal);
            // console.log('   - interest stats >> total interest: ' + totalInterest + ' | interest paid: ' + totalInterestPaid +' | interest to treasury: ' + interestTreasuryShare + " | interest to reward pool: " + interestRewards);

            assert.equal(updatedLoanOutstandingTotal.toNumber(), finalLoanOutstandingTotal);
            assert.equal(updatedLoanPrincipalTotal.toNumber(), finalLoanPrincipalTotal);
            assert.equal(updatedLoanInterestTotal.toNumber(), finalLoanInterestTotal);
            assert.equal(afterRepaymentVaultBorrowIndex.toNumber(), afterRepaymentTokenBorrowIndex.toNumber());
            assert.equal(updatedEveMockFa12TokenBalance, eveInitialMockFa12TokenBalance - repayAmount);

            // check treasury fees and interest to token pool reward contract
            assert.equal(updatedTreasuryMockFa12TokenBalance, treasuryInitialMockFa12TokenBalance + interestTreasuryShare)

        })


        it('user (eve) can repay debt - Mock FA12 Token  - mock one month - utilisation rate above optimal utilisation rate - repayment greater than interest', async () => {

            // Conditions: 
            // - vault loan token: mock FA12 tokens
            // - mock time: 1 month
            // - token pool interest rate: above optimal utilisation rate
            // - repay amount: greater than interest amount

            // Summary of steps:
            // 1. Create Vault
            // 2. Deposit collateral into vault (100 Mock FA12 Tokens, 100 Mock FA2 Tokens)
            // 3. Borrow from vault (50 Mock FA12 Tokens)
            // 4. Set block levels time to 1 year in future
            // 5. Repay partial debt

            // init variables
            await signerFactory(tezos, eve.sk);
            const lendingControllerStorage = await lendingControllerInstance.storage();
            const vaultFactoryStorage      = await vaultFactoryInstance.storage();

            // ----------------------------------------------------------------------------------------------
            // Create Vault
            // ----------------------------------------------------------------------------------------------

            const vaultCounter  = vaultFactoryStorage.vaultCounter;
            const vaultId       = vaultCounter.toNumber();
            const vaultOwner    = eve.pkh;
            const loanTokenName = "usdt";
            const vaultName     = "newVault";
            const depositorsConfig      = "any";

            const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
                baker.pkh,              // delegate to
                loanTokenName,          // loan token type
                vaultName,              // vault name
                null,                   // collateral tokens
                depositorsConfig        // depositors config type - any / whitelist
            ).send();
            await userCreatesNewVaultOperation.confirmation();

            const vaultHandle = {
                "id"    : vaultId,
                "owner" : vaultOwner
            };
            const newVaultRecord = await getStorageMapValue(lendingControllerStorage, 'vaults', vaultHandle);
            const vaultAddress   = newVaultRecord.address;
            const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

            // console.log('   - vault originated: ' + vaultAddress);
            // console.log('   - vault id: ' + vaultId);

            // push new vault id to vault set
            eveVaultSet.push(vaultId);

            // ----------------------------------------------------------------------------------------------
            // Deposit Collateral into Vault
            // ----------------------------------------------------------------------------------------------

            const mockFa12DepositAmount      = 15000000;   // 15 Mock FA12 Tokens
            const mockFa2DepositAmount       = 15000000;   // 15 Mock FA12 Tokens

            // ---------------------------------
            // Deposit Mock FA12 Tokens
            // ---------------------------------

            // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
            // reset token allowance
            const resetTokenAllowanceForDeposit = await mockFa12TokenInstance.methods.approve(
                vaultAddress,
                0
            ).send();
            await resetTokenAllowanceForDeposit.confirmation();

            // set new token allowance
            const setNewTokenAllowanceForDeposit = await mockFa12TokenInstance.methods.approve(
                vaultAddress,
                mockFa12DepositAmount
            ).send();
            await setNewTokenAllowanceForDeposit.confirmation();

            // eve deposits mock FA12 tokens into vault
            const eveDepositMockFa12TokenOperation  = await vaultInstance.methods.initVaultAction(
                "deposit",
                mockFa12DepositAmount,           
                "usdt"
            ).send();
            await eveDepositMockFa12TokenOperation.confirmation();

            // ---------------------------------
            // Deposit Mock FA2 Tokens
            // ---------------------------------

            // update operators for vault
            updateOperatorsOperation = await updateOperators(mockFa2TokenInstance, eve.pkh, vaultAddress, tokenId);
            await updateOperatorsOperation.confirmation();

            // eve deposits mock FA2 tokens into vault
            const eveDepositTokenOperation  = await vaultInstance.methods.initVaultAction(
                "deposit",
                mockFa2DepositAmount,   
                "eurl"
            ).send();
            await eveDepositTokenOperation.confirmation();

            // console.log('   - vault collateral deposited');

            // ----------------------------------------------------------------------------------------------
            // Borrow with Vault
            // ----------------------------------------------------------------------------------------------

            // borrow amount - 2 Mock FA12 Tokens
            const borrowAmount = 2000000;   

            // borrow operation
            const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
            await eveBorrowOperation.confirmation();

            // console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName);

            // get initial Mock FA12 Token balance for Eve, Treasury and Token Pool Reward Contract
            const eveMockFa12Ledger                 = await getStorageMapValue(mockFa12TokenStorage, 'ledger', eve.pkh);            
            const eveInitialMockFa12TokenBalance    = eveMockFa12Ledger == undefined ? 0 : eveMockFa12Ledger.balance.toNumber();

            const treasuryMockFa12Ledger                = await getStorageMapValue(mockFa12TokenStorage, 'ledger', contractDeployments.treasury.address);            
            const treasuryInitialMockFa12TokenBalance   = treasuryMockFa12Ledger == undefined ? 0 : treasuryMockFa12Ledger.balance.toNumber();

            // get token pool stats
            const afterBorrowloanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const loanTokenDecimals    = afterBorrowloanTokenRecordView.Some.tokenDecimals;
            const interestRateDecimals = (27 - 2); 

            const tokenPoolTotal           = afterBorrowloanTokenRecordView.Some.tokenPoolTotal.toNumber() / (10 ** loanTokenDecimals);
            const totalBorrowed            = afterBorrowloanTokenRecordView.Some.totalBorrowed.toNumber() / (10 ** loanTokenDecimals);
            const optimalUtilisationRate   = Number(afterBorrowloanTokenRecordView.Some.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const utilisationRate          = Number(afterBorrowloanTokenRecordView.Some.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const currentInterestRate      = Number(afterBorrowloanTokenRecordView.Some.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";

            // console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);

            // ----------------------------------------------------------------------------------------------
            // Set Block Levels For Mock Time Test - 1 month
            // ----------------------------------------------------------------------------------------------

            await signerFactory(tezos, bob.sk); // temporarily set to tester to increase block levels

            const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
            const updatedVault                      = await getStorageMapValue(updatedLendingControllerStorage, 'vaults', vaultHandle);
            const lastUpdatedBlockLevel             = updatedVault.lastUpdatedBlockLevel;

            const newBlockLevel = lastUpdatedBlockLevel.toNumber() + oneMonthLevelBlocks;

            const setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(newBlockLevel, 'configMockLevel').send();
            await setMockLevelOperation.confirmation();

            const mockTimeLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedMockLevel = mockTimeLendingControllerStorage.config.mockLevel;

            assert.equal(updatedMockLevel, newBlockLevel);

            // console.log('   - time set to 1 month ahead: ' + lastUpdatedBlockLevel + ' to ' + newBlockLevel);

            // ----------------------------------------------------------------------------------------------
            // Repay partial debt 
            // ----------------------------------------------------------------------------------------------

            // set back to user
            await signerFactory(tezos, eve.sk);  

            // treasury share of interest repaid
            const configInterestTreasuryShare = await lendingControllerStorage.config.interestTreasuryShare;

            // repayment amount
            const repayAmount = 500000; // 0.5 Mock FA12 Tokens

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

            // get vault and loan token views, and storage
            const vaultRecordView        = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            const loanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const beforeRepaymentStorage = await lendingControllerInstance.storage();

            const initialVaultLoanOutstandingTotal         = vaultRecordView.Some.loanOutstandingTotal;
            const beforeRepaymentVaultBorrowIndex          = vaultRecordView.Some.borrowIndex;
            const beforeRepaymentVaultOutstandingTotal     = vaultRecordView.Some.loanOutstandingTotal;
            const beforeRepaymentVaultPrincipalTotal       = vaultRecordView.Some.loanPrincipalTotal;
            const beforeRepaymentTokenBorrowIndex          = loanTokenRecordView.Some.borrowIndex;

            initialTokenRewardIndex = loanTokenRecordView.Some.tokenRewardIndex;
            initialTokenPoolTotal   = loanTokenRecordView.Some.tokenPoolTotal;

            // const repayOpParam        = await lendingControllerInstance.methods.repay(vaultId, repayAmount).toTransferParams();
            // const estimate              = await utils.tezos.estimate.transfer(repayOpParam);
            // console.log("REPAY OP ESTIMATION: ", estimate);

            // repay operation
            const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send();
            await eveRepayOperation.confirmation();

            // console.log('   - repaid: ' + repayAmount + " | type: " + loanTokenName);

            // get updated storage
            const updatedLendingControllerStorageAfterRepay     = await lendingControllerInstance.storage();
            const updatedVaultRecord                            = await getStorageMapValue(updatedLendingControllerStorageAfterRepay, 'vaults', vaultHandle);
            const updatedMockFa12TokenStorage                   = await mockFa12TokenInstance.storage();
            
            // get updated Mock FA12 Token balance for Eve, Treasury and Token Pool Reward Contract
            const updatedEveMockFa12Ledger                      = await getStorageMapValue(updatedMockFa12TokenStorage, 'ledger', eve.pkh);            
            const updatedEveMockFa12TokenBalance                = updatedEveMockFa12Ledger == undefined ? 0 : updatedEveMockFa12Ledger.balance.toNumber();

            const updatedTreasuryMockFa12Ledger                 = await getStorageMapValue(updatedMockFa12TokenStorage, 'ledger', contractDeployments.treasury.address);            
            const updatedTreasuryMockFa12TokenBalance           = updatedTreasuryMockFa12Ledger == undefined ? 0 : updatedTreasuryMockFa12Ledger.balance.toNumber();

            // On-chain views to vault and loan token
            updatedVaultRecordView     = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            updatedLoanTokenRecordView = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            
            const updatedLoanOutstandingTotal             = updatedVaultRecordView.Some.loanOutstandingTotal;
            const updatedLoanPrincipalTotal               = updatedVaultRecordView.Some.loanPrincipalTotal;
            const updatedLoanInterestTotal                = updatedVaultRecordView.Some.loanInterestTotal;

            const afterRepaymentVaultBorrowIndex          = updatedVaultRecordView.Some.borrowIndex;
            const afterRepaymentTokenBorrowIndex          = updatedLoanTokenRecordView.Some.borrowIndex;
            
            const loanOutstandingWithAccruedInterest      = lendingHelper.calculateAccruedInterest(beforeRepaymentVaultOutstandingTotal, beforeRepaymentVaultBorrowIndex, afterRepaymentTokenBorrowIndex);
            const totalInterest                           = loanOutstandingWithAccruedInterest - initialVaultLoanOutstandingTotal.toNumber();
            
            // check if repayAmount covers whole or partial of total interest 
            const totalInterestPaid                       = repayAmount < totalInterest ? repayAmount : totalInterest;
            const remainingInterest                       = totalInterest - repayAmount < 0 ? 0 : totalInterest - repayAmount;

            const finalLoanOutstandingTotal               = loanOutstandingWithAccruedInterest - repayAmount;
            const finalLoanPrincipalTotal                 = remainingInterest > 0 ? beforeRepaymentVaultPrincipalTotal : loanOutstandingWithAccruedInterest - repayAmount;
            const finalLoanInterestTotal                  = remainingInterest > 0 ? remainingInterest : 0;

            const interestTreasuryShare                   = lendingHelper.calculateInterestSentToTreasury(configInterestTreasuryShare, totalInterestPaid);
            const interestRewards                         = totalInterestPaid - interestTreasuryShare;

            // calculate new reward index
            updatedTokenRewardIndex                       = updatedLoanTokenRecordView.Some.tokenRewardIndex;
            const calculatedTokenRewardIndex              = lendingHelper.calculateNewRewardIndex(interestRewards, initialTokenPoolTotal, initialTokenRewardIndex);
            assert.equal(almostEqual(updatedTokenRewardIndex.toNumber(), calculatedTokenRewardIndex, 0.00001), true);

            // console.log('   - final vault stats >> outstanding total: ' + finalLoanOutstandingTotal + " | principal total: " + finalLoanPrincipalTotal  + " | interest total: " + finalLoanInterestTotal);
            // console.log('   - interest stats >> total interest: ' + totalInterest + ' | interest paid: ' + totalInterestPaid +' | interest to treasury: ' + interestTreasuryShare + " | interest to reward pool: " + interestRewards);

            assert.equal(updatedLoanOutstandingTotal.toNumber(), finalLoanOutstandingTotal);
            assert.equal(updatedLoanPrincipalTotal.toNumber(), finalLoanPrincipalTotal);
            assert.equal(updatedLoanInterestTotal.toNumber(), finalLoanInterestTotal);
            assert.equal(afterRepaymentVaultBorrowIndex.toNumber(), afterRepaymentTokenBorrowIndex.toNumber());
            assert.equal(updatedEveMockFa12TokenBalance, eveInitialMockFa12TokenBalance - repayAmount);

            // check treasury fees and interest to token pool reward contract
            assert.equal(updatedTreasuryMockFa12TokenBalance, treasuryInitialMockFa12TokenBalance + interestTreasuryShare)

        })



        it('user (eve) can repay debt - Mock FA12 Token  - mock one month - utilisation rate above optimal utilisation rate - repayment less than interest', async () => {

            // Conditions: 
            // - vault loan token: mock FA12 tokens
            // - mock time: 1 month
            // - token pool interest rate: above optimal utilisation rate
            // - repay amount: less than interest amount

            // Summary of steps:
            // 1. Create Vault
            // 2. Deposit collateral into vault (100 Mock FA12 Tokens, 100 Mock FA2 Tokens)
            // 3. Borrow from vault (50 Mock FA12 Tokens)
            // 4. Set block levels time to 1 year in future
            // 5. Repay partial debt

            // init variables
            await signerFactory(tezos, eve.sk);
            const lendingControllerStorage = await lendingControllerInstance.storage();
            const vaultFactoryStorage      = await vaultFactoryInstance.storage();

            // ----------------------------------------------------------------------------------------------
            // Create Vault
            // ----------------------------------------------------------------------------------------------

            const vaultCounter  = vaultFactoryStorage.vaultCounter;
            const vaultId       = vaultCounter.toNumber();
            const vaultOwner    = eve.pkh;
            const loanTokenName = "usdt";
            const vaultName     = "newVault";
            const depositorsConfig      = "any";

            const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
                baker.pkh,              // delegate to
                loanTokenName,          // loan token type
                vaultName,              // vault name
                null,                   // collateral tokens
                depositorsConfig        // depositors config type - any / whitelist
            ).send();
            await userCreatesNewVaultOperation.confirmation();

            const vaultHandle = {
                "id"    : vaultId,
                "owner" : vaultOwner
            };
            const newVaultRecord = await getStorageMapValue(lendingControllerStorage, 'vaults', vaultHandle);
            const vaultAddress   = newVaultRecord.address;
            const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

            // console.log('   - vault originated: ' + vaultAddress);
            // console.log('   - vault id: ' + vaultId);

            // push new vault id to vault set
            eveVaultSet.push(vaultId);

            // ----------------------------------------------------------------------------------------------
            // Deposit Collateral into Vault
            // ----------------------------------------------------------------------------------------------

            const mockFa12DepositAmount      = 15000000;   // 15 Mock FA12 Tokens
            const mockFa2DepositAmount       = 15000000;   // 15 Mock FA12 Tokens

            // ---------------------------------
            // Deposit Mock FA12 Tokens
            // ---------------------------------

            // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
            // reset token allowance
            const resetTokenAllowanceForDeposit = await mockFa12TokenInstance.methods.approve(
                vaultAddress,
                0
            ).send();
            await resetTokenAllowanceForDeposit.confirmation();

            // set new token allowance
            const setNewTokenAllowanceForDeposit = await mockFa12TokenInstance.methods.approve(
                vaultAddress,
                mockFa12DepositAmount
            ).send();
            await setNewTokenAllowanceForDeposit.confirmation();

            // eve deposits mock FA12 tokens into vault
            const eveDepositMockFa12TokenOperation  = await vaultInstance.methods.initVaultAction(
                "deposit",
                mockFa12DepositAmount,       
                "usdt"
            ).send();
            await eveDepositMockFa12TokenOperation.confirmation();

            // ---------------------------------
            // Deposit Mock FA2 Tokens
            // ---------------------------------

            // update operators for vault
            updateOperatorsOperation = await updateOperators(mockFa2TokenInstance, eve.pkh, vaultAddress, tokenId);
            await updateOperatorsOperation.confirmation();
        
            // eve deposits mock FA2 tokens into vault
            const eveDepositTokenOperation  = await vaultInstance.methods.initVaultAction(
                "deposit",
                mockFa2DepositAmount,  
                "eurl"
            ).send();
            await eveDepositTokenOperation.confirmation();

            // console.log('   - vault collateral deposited');

            // ----------------------------------------------------------------------------------------------
            // Borrow with Vault
            // ----------------------------------------------------------------------------------------------

            // borrow amount - 2 Mock FA12 Tokens
            const borrowAmount = 2000000;   

            // borrow operation
            const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
            await eveBorrowOperation.confirmation();

            // get initial Mock FA12 Token balance for Eve, Treasury and Token Pool Reward Contract
            const eveMockFa12Ledger                 = await getStorageMapValue(mockFa12TokenStorage, 'ledger', eve.pkh);            
            const eveInitialMockFa12TokenBalance    = eveMockFa12Ledger == undefined ? 0 : eveMockFa12Ledger.balance.toNumber();

            const treasuryMockFa12Ledger                = await getStorageMapValue(mockFa12TokenStorage, 'ledger', contractDeployments.treasury.address);            
            const treasuryInitialMockFa12TokenBalance   = treasuryMockFa12Ledger == undefined ? 0 : treasuryMockFa12Ledger.balance.toNumber();

            // get token pool stats
            const afterBorrowloanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const loanTokenDecimals    = afterBorrowloanTokenRecordView.Some.tokenDecimals;
            const interestRateDecimals = (27 - 2); 

            const tokenPoolTotal           = afterBorrowloanTokenRecordView.Some.tokenPoolTotal.toNumber() / (10 ** loanTokenDecimals);
            const totalBorrowed            = afterBorrowloanTokenRecordView.Some.totalBorrowed.toNumber() / (10 ** loanTokenDecimals);
            const optimalUtilisationRate   = Number(afterBorrowloanTokenRecordView.Some.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const utilisationRate          = Number(afterBorrowloanTokenRecordView.Some.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const currentInterestRate      = Number(afterBorrowloanTokenRecordView.Some.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";

            // console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);

            // ----------------------------------------------------------------------------------------------
            // Set Block Levels For Mock Time Test - 1 month
            // ----------------------------------------------------------------------------------------------

            await signerFactory(tezos, bob.sk); // temporarily set to tester to increase block levels

            const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
            const updatedVault                      = await getStorageMapValue(updatedLendingControllerStorage, 'vaults', vaultHandle);
            const lastUpdatedBlockLevel             = updatedVault.lastUpdatedBlockLevel;

            const newBlockLevel = lastUpdatedBlockLevel.toNumber() + oneMonthLevelBlocks;

            const setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(newBlockLevel, 'configMockLevel').send();
            await setMockLevelOperation.confirmation();

            const mockTimeLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedMockLevel = mockTimeLendingControllerStorage.config.mockLevel;

            assert.equal(updatedMockLevel, newBlockLevel);

            // console.log('   - time set to 1 month ahead: ' + lastUpdatedBlockLevel + ' to ' + newBlockLevel);

            // ----------------------------------------------------------------------------------------------
            // Repay partial debt 
            // ----------------------------------------------------------------------------------------------

            // set back to user
            await signerFactory(tezos, eve.sk);  

            // treasury share of interest repaid
            const configInterestTreasuryShare = await lendingControllerStorage.config.interestTreasuryShare;

            // repayment amount
            const repayAmount = 10000; // 0.01 Mock FA12 Tokens

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

            // get vault and loan token views, and storage
            const vaultRecordView        = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            const loanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const beforeRepaymentStorage = await lendingControllerInstance.storage();

            const initialVaultLoanOutstandingTotal         = vaultRecordView.Some.loanOutstandingTotal;
            const beforeRepaymentVaultBorrowIndex          = vaultRecordView.Some.borrowIndex;
            const beforeRepaymentVaultOutstandingTotal     = vaultRecordView.Some.loanOutstandingTotal;
            const beforeRepaymentVaultPrincipalTotal       = vaultRecordView.Some.loanPrincipalTotal;
            const beforeRepaymentTokenBorrowIndex          = loanTokenRecordView.Some.borrowIndex;

            initialTokenRewardIndex = loanTokenRecordView.Some.tokenRewardIndex;
            initialTokenPoolTotal   = loanTokenRecordView.Some.tokenPoolTotal;

            // const repayOpParam        = await lendingControllerInstance.methods.repay(vaultId, repayAmount).toTransferParams();
            // const estimate              = await utils.tezos.estimate.transfer(repayOpParam);
            // console.log("REPAY OP ESTIMATION: ", estimate);

            // repay operation
            const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send();
            await eveRepayOperation.confirmation();

            // console.log('   - repaid: ' + repayAmount + " | type: " + loanTokenName);

            // get updated storage
            const updatedLendingControllerStorageAfterRepay   = await lendingControllerInstance.storage();
            const updatedVaultRecord                          = await getStorageMapValue(updatedLendingControllerStorageAfterRepay, 'vaults', vaultHandle);
            const updatedMockFa12TokenStorage                 = await mockFa12TokenInstance.storage();
            
            // get updated Mock FA12 Token balance for Eve, Treasury and Token Pool Reward Contract
            const updatedEveMockFa12Ledger                      = await getStorageMapValue(updatedMockFa12TokenStorage, 'ledger', eve.pkh);            
            const updatedEveMockFa12TokenBalance                = updatedEveMockFa12Ledger == undefined ? 0 : updatedEveMockFa12Ledger.balance.toNumber();

            const updatedTreasuryMockFa12Ledger                 = await getStorageMapValue(updatedMockFa12TokenStorage, 'ledger', contractDeployments.treasury.address);            
            const updatedTreasuryMockFa12TokenBalance           = updatedTreasuryMockFa12Ledger == undefined ? 0 : updatedTreasuryMockFa12Ledger.balance.toNumber();

            // On-chain views to vault and loan token
            updatedVaultRecordView     = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            updatedLoanTokenRecordView = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});

            const updatedLoanOutstandingTotal             = updatedVaultRecordView.Some.loanOutstandingTotal;
            const updatedLoanPrincipalTotal               = updatedVaultRecordView.Some.loanPrincipalTotal;
            const updatedLoanInterestTotal                = updatedVaultRecordView.Some.loanInterestTotal;

            const afterRepaymentVaultBorrowIndex          = updatedVaultRecordView.Some.borrowIndex;
            const afterRepaymentTokenBorrowIndex          = updatedLoanTokenRecordView.Some.borrowIndex;
            
            const loanOutstandingWithAccruedInterest      = lendingHelper.calculateAccruedInterest(beforeRepaymentVaultOutstandingTotal, beforeRepaymentVaultBorrowIndex, afterRepaymentTokenBorrowIndex);
            const totalInterest                           = loanOutstandingWithAccruedInterest - initialVaultLoanOutstandingTotal.toNumber();
            
            // check if repayAmount covers whole or partial of total interest 
            const totalInterestPaid                       = repayAmount < totalInterest ? repayAmount : totalInterest;
            const remainingInterest                       = totalInterest - repayAmount < 0 ? 0 : totalInterest - repayAmount;
            
            const finalLoanOutstandingTotal               = loanOutstandingWithAccruedInterest - repayAmount;
            const finalLoanPrincipalTotal                 = remainingInterest > 0 ? beforeRepaymentVaultPrincipalTotal : loanOutstandingWithAccruedInterest - repayAmount;
            const finalLoanInterestTotal                  = remainingInterest > 0 ? remainingInterest : 0;

            const interestTreasuryShare                   = lendingHelper.calculateInterestSentToTreasury(configInterestTreasuryShare, totalInterestPaid);
            const interestRewards                         = totalInterestPaid - interestTreasuryShare;

            // calculate new reward index
            updatedTokenRewardIndex                       = updatedLoanTokenRecordView.Some.tokenRewardIndex;
            const calculatedTokenRewardIndex              = lendingHelper.calculateNewRewardIndex(interestRewards, initialTokenPoolTotal, initialTokenRewardIndex);
            assert.equal(almostEqual(updatedTokenRewardIndex.toNumber(), calculatedTokenRewardIndex, 0.00001), true);

            // console.log('   - final vault stats >> outstanding total: ' + finalLoanOutstandingTotal + " | principal total: " + finalLoanPrincipalTotal  + " | interest total: " + finalLoanInterestTotal);
            // console.log('   - interest stats >> total interest: ' + totalInterest + ' | interest paid: ' + totalInterestPaid +' | interest to treasury: ' + interestTreasuryShare + " | interest to reward pool: " + interestRewards);

            assert.equal(updatedLoanOutstandingTotal.toNumber(), finalLoanOutstandingTotal);
            assert.equal(updatedLoanPrincipalTotal.toNumber(), finalLoanPrincipalTotal);
            assert.equal(updatedLoanInterestTotal.toNumber(), finalLoanInterestTotal);
            assert.equal(afterRepaymentVaultBorrowIndex.toNumber(), afterRepaymentTokenBorrowIndex.toNumber());
            assert.equal(updatedEveMockFa12TokenBalance, eveInitialMockFa12TokenBalance - repayAmount);

            // check treasury fees and interest to token pool reward contract
            assert.equal(updatedTreasuryMockFa12TokenBalance, treasuryInitialMockFa12TokenBalance + interestTreasuryShare)

        })

    })


    describe('%repay mockFA2 Tokens - mock time tests (1 month)', function () {

        it('user (eve) can repay debt - Mock FA2 Token  - mock one month - utilisation rate below optimal utilisation rate - repayment greater than interest', async () => {

            // Conditions: 
            // - vault loan token: mock FA2 tokens
            // - mock time: 1 month
            // - token pool interest rate: below optimal utilisation rate
            // - repay amount: greater than interest amount 

            // Summary of steps:
            // 1. Create Vault
            // 2. Deposit collateral into vault (100 Mock FA12 Tokens, 100 Mock FA2 Tokens)
            // 3. Borrow from vault (20 Mock FA2 Tokens)
            // 4. Set block levels time to 1 year in future
            // 5. Repay partial debt

            // init variables
            await signerFactory(tezos, eve.sk);
            const lendingControllerStorage = await lendingControllerInstance.storage();
            const vaultFactoryStorage      = await vaultFactoryInstance.storage();

            // ----------------------------------------------------------------------------------------------
            // Create Vault
            // ----------------------------------------------------------------------------------------------

            const vaultCounter  = vaultFactoryStorage.vaultCounter;
            const vaultId       = vaultCounter.toNumber();
            const vaultOwner    = eve.pkh;
            const loanTokenName = "eurl";
            const vaultName     = "newVault";
            const depositorsConfig      = "any";

            const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
                baker.pkh,              // delegate to
                loanTokenName,          // loan token type
                vaultName,              // vault name
                null,                   // collateral tokens
                depositorsConfig        // depositors config type - any / whitelist
            ).send();
            await userCreatesNewVaultOperation.confirmation();

            const vaultHandle = {
                "id"    : vaultId,
                "owner" : vaultOwner
            };
            const newVaultRecord = await getStorageMapValue(lendingControllerStorage, 'vaults', vaultHandle);
            const vaultAddress   = newVaultRecord.address;
            const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

            // console.log('   - vault originated: ' + vaultAddress);
            // console.log('   - vault id: ' + vaultId);

            // push new vault id to vault set
            eveVaultSet.push(vaultId);

            // ----------------------------------------------------------------------------------------------
            // Deposit Collateral into Vault
            // ----------------------------------------------------------------------------------------------

            const mockFa12DepositAmount      = 15000000;   // 15 Mock FA12 Tokens
            const mockFa2DepositAmount       = 15000000;   // 15 Mock FA12 Tokens

            // ---------------------------------
            // Deposit Mock FA12 Tokens
            // ---------------------------------

            // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
            // reset token allowance
            const resetTokenAllowanceForDeposit = await mockFa12TokenInstance.methods.approve(
                vaultAddress,
                0
            ).send();
            await resetTokenAllowanceForDeposit.confirmation();

            // set new token allowance
            const setNewTokenAllowanceForDeposit = await mockFa12TokenInstance.methods.approve(
                vaultAddress,
                mockFa12DepositAmount
            ).send();
            await setNewTokenAllowanceForDeposit.confirmation();

            // eve deposits mock FA12 tokens into vault
            const eveDepositMockFa12TokenOperation  = await vaultInstance.methods.initVaultAction(
                "deposit",
                mockFa12DepositAmount,               
                "usdt"
            ).send();
            await eveDepositMockFa12TokenOperation.confirmation();

            // ---------------------------------
            // Deposit Mock FA2 Tokens
            // ---------------------------------

            // update operators for vault
            updateOperatorsOperation = await updateOperators(mockFa2TokenInstance, eve.pkh, vaultAddress, tokenId);
            await updateOperatorsOperation.confirmation();

            // eve deposits mock FA2 tokens into vault
            const eveDepositTokenOperation = await vaultInstance.methods.initVaultAction(
                "deposit",
                mockFa2DepositAmount,  
                "eurl"
            ).send();
            await eveDepositTokenOperation.confirmation();

            // console.log('   - vault collateral deposited');

            // ----------------------------------------------------------------------------------------------
            // Borrow with Vault
            // ----------------------------------------------------------------------------------------------

            // borrow amount - 2 Mock FA12 Tokens
            const borrowAmount = 2000000;   

            // borrow operation
            const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
            await eveBorrowOperation.confirmation();

            // console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName);

            // get initial Mock FA12 Token balance for Eve, Treasury and Token Pool Reward Contract
            const eveMockFa2Ledger                 = await getStorageMapValue(mockFa2TokenStorage, 'ledger', eve.pkh);            
            const eveInitialMockFa2TokenBalance    = eveMockFa2Ledger == undefined ? 0 : eveMockFa2Ledger.toNumber();

            const treasuryMockFa2Ledger                = await getStorageMapValue(mockFa2TokenStorage, 'ledger', contractDeployments.treasury.address);            
            const treasuryInitialMockFa2TokenBalance   = treasuryMockFa2Ledger == undefined ? 0 : treasuryMockFa2Ledger.toNumber();

            // get token pool stats
            const afterBorrowloanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const loanTokenDecimals    = afterBorrowloanTokenRecordView.Some.tokenDecimals;
            const interestRateDecimals = (27 - 2); 

            const tokenPoolTotal           = afterBorrowloanTokenRecordView.Some.tokenPoolTotal.toNumber() / (10 ** loanTokenDecimals);
            const totalBorrowed            = afterBorrowloanTokenRecordView.Some.totalBorrowed.toNumber() / (10 ** loanTokenDecimals);
            const optimalUtilisationRate   = Number(afterBorrowloanTokenRecordView.Some.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const utilisationRate          = Number(afterBorrowloanTokenRecordView.Some.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const currentInterestRate      = Number(afterBorrowloanTokenRecordView.Some.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";

            // console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);

            // ----------------------------------------------------------------------------------------------
            // Set Block Levels For Mock Time Test - 1 month
            // ----------------------------------------------------------------------------------------------

            await signerFactory(tezos, bob.sk); // temporarily set to tester to increase block levels

            const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
            const updatedVault                      = await getStorageMapValue(updatedLendingControllerStorage, 'vaults', vaultHandle);
            const lastUpdatedBlockLevel             = updatedVault.lastUpdatedBlockLevel;

            const newBlockLevel = lastUpdatedBlockLevel.toNumber() + oneMonthLevelBlocks;

            const setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(newBlockLevel, 'configMockLevel').send();
            await setMockLevelOperation.confirmation();

            const mockTimeLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedMockLevel = mockTimeLendingControllerStorage.config.mockLevel;

            assert.equal(updatedMockLevel, newBlockLevel);

            // console.log('   - time set to 1 month ahead: ' + lastUpdatedBlockLevel + ' to ' + newBlockLevel);

            // ----------------------------------------------------------------------------------------------
            // Repay partial debt 
            // ----------------------------------------------------------------------------------------------

            // set back to user
            await signerFactory(tezos, eve.sk);  

            // treasury share of interest repaid
            const configInterestTreasuryShare = await lendingControllerStorage.config.interestTreasuryShare;

            // repayment amount
            const repayAmount = 500000; // 0.5 Mock FA12 Tokens

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

            // get vault and loan token views, and storage
            const vaultRecordView        = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            const loanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const beforeRepaymentStorage = await lendingControllerInstance.storage();

            const initialVaultLoanOutstandingTotal         = vaultRecordView.Some.loanOutstandingTotal;
            const beforeRepaymentVaultBorrowIndex          = vaultRecordView.Some.borrowIndex;
            const beforeRepaymentVaultOutstandingTotal     = vaultRecordView.Some.loanOutstandingTotal;
            const beforeRepaymentVaultPrincipalTotal       = vaultRecordView.Some.loanPrincipalTotal;
            const beforeRepaymentTokenBorrowIndex          = loanTokenRecordView.Some.borrowIndex;

            initialTokenRewardIndex = loanTokenRecordView.Some.tokenRewardIndex;
            initialTokenPoolTotal   = loanTokenRecordView.Some.tokenPoolTotal;

            // const repayOpParam        = await lendingControllerInstance.methods.repay(vaultId, repayAmount).toTransferParams();
            // const estimate            = await utils.tezos.estimate.transfer(repayOpParam);
            // console.log("REPAY OP ESTIMATION: ", estimate);

            // repay operation
            const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send();
            await eveRepayOperation.confirmation();

            // console.log('   - repaid: ' + repayAmount + " | type: " + loanTokenName);

            // get updated storage
            const updatedLendingControllerStorageAfterRepay     = await lendingControllerInstance.storage();
            const updatedVaultRecord                            = await getStorageMapValue(updatedLendingControllerStorageAfterRepay, 'vaults', vaultHandle);
            const updatedMockFa2TokenStorage                    = await mockFa2TokenInstance.storage();
            
            // get updated Mock FA2 Token balance for Eve, Treasury and Token Pool Reward Contract
            const updatedEveMockFa2Ledger                       = await getStorageMapValue(updatedMockFa2TokenStorage, 'ledger', eve.pkh);            
            const updatedEveMockFa2TokenBalance                 = updatedEveMockFa2Ledger == undefined ? 0 : updatedEveMockFa2Ledger.toNumber();

            const updatedTreasuryMockFa2Ledger                  = await getStorageMapValue(updatedMockFa2TokenStorage, 'ledger', contractDeployments.treasury.address);            
            const updatedTreasuryMockFa2TokenBalance            = updatedTreasuryMockFa2Ledger == undefined ? 0 : updatedTreasuryMockFa2Ledger.toNumber();

            // On-chain views to vault and loan token
            updatedVaultRecordView     = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            updatedLoanTokenRecordView = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});

            const updatedLoanOutstandingTotal             = updatedVaultRecordView.Some.loanOutstandingTotal;
            const updatedLoanPrincipalTotal               = updatedVaultRecordView.Some.loanPrincipalTotal;
            const updatedLoanInterestTotal                = updatedVaultRecordView.Some.loanInterestTotal;

            const afterRepaymentVaultBorrowIndex          = updatedVaultRecordView.Some.borrowIndex;
            const afterRepaymentTokenBorrowIndex          = updatedLoanTokenRecordView.Some.borrowIndex;
            
            const loanOutstandingWithAccruedInterest      = lendingHelper.calculateAccruedInterest(beforeRepaymentVaultOutstandingTotal, beforeRepaymentVaultBorrowIndex, afterRepaymentTokenBorrowIndex);
            const totalInterest                           = loanOutstandingWithAccruedInterest - initialVaultLoanOutstandingTotal.toNumber();
            
            // check if repayAmount covers whole or partial of total interest 
            const totalInterestPaid                       = repayAmount < totalInterest ? repayAmount : totalInterest;
            const remainingInterest                       = totalInterest - repayAmount < 0 ? 0 : totalInterest - repayAmount;
            
            const finalLoanOutstandingTotal               = loanOutstandingWithAccruedInterest - repayAmount;
            const finalLoanPrincipalTotal                 = remainingInterest > 0 ? beforeRepaymentVaultPrincipalTotal : loanOutstandingWithAccruedInterest - repayAmount;
            const finalLoanInterestTotal                  = remainingInterest > 0 ? remainingInterest : 0;

            const interestTreasuryShare                   = lendingHelper.calculateInterestSentToTreasury(configInterestTreasuryShare, totalInterestPaid);
            const interestRewards                         = totalInterestPaid - interestTreasuryShare;

            // calculate new reward index
            updatedTokenRewardIndex                       = updatedLoanTokenRecordView.Some.tokenRewardIndex;
            const calculatedTokenRewardIndex              = lendingHelper.calculateNewRewardIndex(interestRewards, initialTokenPoolTotal, initialTokenRewardIndex);
            assert.equal(almostEqual(updatedTokenRewardIndex.toNumber(), calculatedTokenRewardIndex, 0.00001), true);

            // console.log('   - final vault stats >> outstanding total: ' + finalLoanOutstandingTotal + " | principal total: " + finalLoanPrincipalTotal  + " | interest total: " + finalLoanInterestTotal);
            // console.log('   - interest stats >> total interest: ' + totalInterest + ' | interest paid: ' + totalInterestPaid +' | interest to treasury: ' + interestTreasuryShare + " | interest to reward pool: " + interestRewards);

            assert.equal(updatedLoanOutstandingTotal.toNumber(), finalLoanOutstandingTotal);
            assert.equal(updatedLoanPrincipalTotal.toNumber(), finalLoanPrincipalTotal);
            assert.equal(updatedLoanInterestTotal.toNumber(), finalLoanInterestTotal);
            assert.equal(afterRepaymentVaultBorrowIndex.toNumber(), afterRepaymentTokenBorrowIndex.toNumber());
            assert.equal(updatedEveMockFa2TokenBalance, eveInitialMockFa2TokenBalance - repayAmount);

            // check treasury fees and interest to token pool reward contract
            assert.equal(updatedTreasuryMockFa2TokenBalance, treasuryInitialMockFa2TokenBalance + interestTreasuryShare)

        })



        it('user (eve) can repay debt - Mock FA2 Token  - mock one month - utilisation rate below optimal utilisation rate - repayment less than interest', async () => {

            // Conditions: 
            // - vault loan token: mock FA2 tokens
            // - mock time: 1 month
            // - token pool interest rate: below optimal utilisation rate
            // - repay amount: less than interest amount 

            // Summary of steps:
            // 1. Create Vault
            // 2. Deposit collateral into vault (100 Mock FA12 Tokens, 100 Mock FA2 Tokens)
            // 3. Borrow from vault (20 Mock FA2 Tokens)
            // 4. Set block levels time to 1 year in future
            // 5. Repay partial debt

            // init variables
            await signerFactory(tezos, eve.sk);
            const lendingControllerStorage = await lendingControllerInstance.storage();
            const vaultFactoryStorage      = await vaultFactoryInstance.storage();

            // ----------------------------------------------------------------------------------------------
            // Create Vault
            // ----------------------------------------------------------------------------------------------

            const vaultCounter  = vaultFactoryStorage.vaultCounter;
            const vaultId       = vaultCounter.toNumber();
            const vaultOwner    = eve.pkh;
            const loanTokenName = "eurl";
            const vaultName     = "newVault";
            const depositorsConfig      = "any";

            const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
                baker.pkh,              // delegate to
                loanTokenName,          // loan token type
                vaultName,              // vault name
                null,                   // collateral tokens
                depositorsConfig        // depositors config type - any / whitelist
            ).send();
            await userCreatesNewVaultOperation.confirmation();

            const vaultHandle = {
                "id"    : vaultId,
                "owner" : vaultOwner
            };
            const newVaultRecord = await getStorageMapValue(lendingControllerStorage, 'vaults', vaultHandle);
            const vaultAddress   = newVaultRecord.address;
            const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

            // console.log('   - vault originated: ' + vaultAddress);
            // console.log('   - vault id: ' + vaultId);

            // push new vault id to vault set
            eveVaultSet.push(vaultId);

            // ----------------------------------------------------------------------------------------------
            // Deposit Collateral into Vault
            // ----------------------------------------------------------------------------------------------

            const mockFa12DepositAmount      = 15000000;   // 15 Mock FA12 Tokens
            const mockFa2DepositAmount       = 15000000;   // 15 Mock FA2 Tokens

            // ---------------------------------
            // Deposit Mock FA12 Tokens
            // ---------------------------------

            // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
            // reset token allowance
            const resetTokenAllowanceForDeposit = await mockFa12TokenInstance.methods.approve(
                vaultAddress,
                0
            ).send();
            await resetTokenAllowanceForDeposit.confirmation();

            // set new token allowance
            const setNewTokenAllowanceForDeposit = await mockFa12TokenInstance.methods.approve(
                vaultAddress,
                mockFa12DepositAmount
            ).send();
            await setNewTokenAllowanceForDeposit.confirmation();

            // eve deposits mock FA12 tokens into vault
            const eveDepositMockFa12TokenOperation  = await vaultInstance.methods.initVaultAction(
                "deposit",
                mockFa12DepositAmount,         
                "usdt"
            ).send();
            await eveDepositMockFa12TokenOperation.confirmation();

            // ---------------------------------
            // Deposit Mock FA2 Tokens
            // ---------------------------------

            // update operators for vault
            updateOperatorsOperation = await updateOperators(mockFa2TokenInstance, eve.pkh, vaultAddress, tokenId);
            await updateOperatorsOperation.confirmation();
            
            // eve deposits mock FA2 tokens into vault
            const eveDepositTokenOperation = await vaultInstance.methods.initVaultAction(
                "deposit",
                mockFa2DepositAmount,      
                "eurl"
            ).send();
            await eveDepositTokenOperation.confirmation();

            // console.log('   - vault collateral deposited');

            // ----------------------------------------------------------------------------------------------
            // Borrow with Vault
            // ----------------------------------------------------------------------------------------------

            // borrow amount - 2 Mock FA12 Tokens
            const borrowAmount = 2000000;   

            // borrow operation
            const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
            await eveBorrowOperation.confirmation();

            // console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName);

            // get initial Mock FA12 Token balance for Eve, Treasury and Token Pool Reward Contract
            const eveMockFa2Ledger                 = await getStorageMapValue(mockFa2TokenStorage, 'ledger', eve.pkh);            
            const eveInitialMockFa2TokenBalance    = eveMockFa2Ledger == undefined ? 0 : eveMockFa2Ledger.toNumber();

            const treasuryMockFa2Ledger                = await getStorageMapValue(mockFa2TokenStorage, 'ledger', contractDeployments.treasury.address);            
            const treasuryInitialMockFa2TokenBalance   = treasuryMockFa2Ledger == undefined ? 0 : treasuryMockFa2Ledger.toNumber();

            // get token pool stats
            const afterBorrowloanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const loanTokenDecimals    = afterBorrowloanTokenRecordView.Some.tokenDecimals;
            const interestRateDecimals = (27 - 2); 

            const tokenPoolTotal           = afterBorrowloanTokenRecordView.Some.tokenPoolTotal.toNumber() / (10 ** loanTokenDecimals);
            const totalBorrowed            = afterBorrowloanTokenRecordView.Some.totalBorrowed.toNumber() / (10 ** loanTokenDecimals);
            const optimalUtilisationRate   = Number(afterBorrowloanTokenRecordView.Some.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const utilisationRate          = Number(afterBorrowloanTokenRecordView.Some.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const currentInterestRate      = Number(afterBorrowloanTokenRecordView.Some.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";

            // console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);

            // ----------------------------------------------------------------------------------------------
            // Set Block Levels For Mock Time Test - 1 month
            // ----------------------------------------------------------------------------------------------

            await signerFactory(tezos, bob.sk); // temporarily set to tester to increase block levels

            const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
            const updatedVault                      = await getStorageMapValue(updatedLendingControllerStorage, 'vaults', vaultHandle);
            const lastUpdatedBlockLevel             = updatedVault.lastUpdatedBlockLevel;

            const newBlockLevel = lastUpdatedBlockLevel.toNumber() + oneMonthLevelBlocks;

            const setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(newBlockLevel, 'configMockLevel').send();
            await setMockLevelOperation.confirmation();

            const mockTimeLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedMockLevel = mockTimeLendingControllerStorage.config.mockLevel;

            assert.equal(updatedMockLevel, newBlockLevel);

            // console.log('   - time set to 1 month ahead: ' + lastUpdatedBlockLevel + ' to ' + newBlockLevel);

            // ----------------------------------------------------------------------------------------------
            // Repay partial debt 
            // ----------------------------------------------------------------------------------------------

            // set back to user
            await signerFactory(tezos, eve.sk);  

            // treasury share of interest repaid
            const configInterestTreasuryShare = await lendingControllerStorage.config.interestTreasuryShare;

            // repayment amount
            const repayAmount = 10000; // 0.01 Mock FA12 Tokens

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

            // get vault and loan token views, and storage
            const vaultRecordView        = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            const loanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const beforeRepaymentStorage = await lendingControllerInstance.storage();

            const initialVaultLoanOutstandingTotal         = vaultRecordView.Some.loanOutstandingTotal;
            const beforeRepaymentVaultBorrowIndex          = vaultRecordView.Some.borrowIndex;
            const beforeRepaymentVaultOutstandingTotal     = vaultRecordView.Some.loanOutstandingTotal;
            const beforeRepaymentVaultPrincipalTotal       = vaultRecordView.Some.loanPrincipalTotal;
            const beforeRepaymentTokenBorrowIndex          = loanTokenRecordView.Some.borrowIndex;

            initialTokenRewardIndex = loanTokenRecordView.Some.tokenRewardIndex;
            initialTokenPoolTotal   = loanTokenRecordView.Some.tokenPoolTotal;

            // const repayOpParam        = await lendingControllerInstance.methods.repay(vaultId, repayAmount).toTransferParams();
            // const estimate            = await utils.tezos.estimate.transfer(repayOpParam);
            // console.log("REPAY OP ESTIMATION: ", estimate);

            // repay operation
            const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send();
            await eveRepayOperation.confirmation();

            // console.log('   - repaid: ' + repayAmount + " | type: " + loanTokenName);

            // get updated storage
            const updatedLendingControllerStorageAfterRepay     = await lendingControllerInstance.storage();
            const updatedVaultRecord                            = await getStorageMapValue(updatedLendingControllerStorageAfterRepay, 'vaults', vaultHandle);
            const updatedMockFa2TokenStorage                    = await mockFa2TokenInstance.storage();
            
            // get updated Mock FA2 Token balance for Eve, Treasury and Token Pool Reward Contract
            const updatedEveMockFa2Ledger                       = await getStorageMapValue(updatedMockFa2TokenStorage, 'ledger', eve.pkh);            
            const updatedEveMockFa2TokenBalance                 = updatedEveMockFa2Ledger == undefined ? 0 : updatedEveMockFa2Ledger.toNumber();

            const updatedTreasuryMockFa2Ledger                  = await getStorageMapValue(updatedMockFa2TokenStorage, 'ledger', contractDeployments.treasury.address);            
            const updatedTreasuryMockFa2TokenBalance            = updatedTreasuryMockFa2Ledger == undefined ? 0 : updatedTreasuryMockFa2Ledger.toNumber();

            // On-chain views to vault and loan token
            updatedVaultRecordView     = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            updatedLoanTokenRecordView = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});

            const updatedLoanOutstandingTotal             = updatedVaultRecordView.Some.loanOutstandingTotal;
            const updatedLoanPrincipalTotal               = updatedVaultRecordView.Some.loanPrincipalTotal;
            const updatedLoanInterestTotal                = updatedVaultRecordView.Some.loanInterestTotal;

            const afterRepaymentVaultBorrowIndex          = updatedVaultRecordView.Some.borrowIndex;
            const afterRepaymentTokenBorrowIndex          = updatedLoanTokenRecordView.Some.borrowIndex;
            
            const loanOutstandingWithAccruedInterest      = lendingHelper.calculateAccruedInterest(beforeRepaymentVaultOutstandingTotal, beforeRepaymentVaultBorrowIndex, afterRepaymentTokenBorrowIndex);
            const totalInterest                           = loanOutstandingWithAccruedInterest - initialVaultLoanOutstandingTotal.toNumber();
            
            // check if repayAmount covers whole or partial of total interest 
            const totalInterestPaid                       = repayAmount < totalInterest ? repayAmount : totalInterest;
            const remainingInterest                       = totalInterest - repayAmount < 0 ? 0 : totalInterest - repayAmount;
            
            const finalLoanOutstandingTotal               = loanOutstandingWithAccruedInterest - repayAmount;
            const finalLoanPrincipalTotal                 = remainingInterest > 0 ? beforeRepaymentVaultPrincipalTotal : loanOutstandingWithAccruedInterest - repayAmount;
            const finalLoanInterestTotal                  = remainingInterest > 0 ? remainingInterest : 0;

            const interestTreasuryShare                   = lendingHelper.calculateInterestSentToTreasury(configInterestTreasuryShare, totalInterestPaid);
            const interestRewards                         = totalInterestPaid - interestTreasuryShare;

            // calculate new reward index
            updatedTokenRewardIndex                       = updatedLoanTokenRecordView.Some.tokenRewardIndex;
            const calculatedTokenRewardIndex              = lendingHelper.calculateNewRewardIndex(interestRewards, initialTokenPoolTotal, initialTokenRewardIndex);
            assert.equal(almostEqual(updatedTokenRewardIndex.toNumber(), calculatedTokenRewardIndex, 0.00001), true);

            // console.log('   - final vault stats >> outstanding total: ' + finalLoanOutstandingTotal + " | principal total: " + finalLoanPrincipalTotal  + " | interest total: " + finalLoanInterestTotal);
            // console.log('   - interest stats >> total interest: ' + totalInterest + ' | interest paid: ' + totalInterestPaid +' | interest to treasury: ' + interestTreasuryShare + " | interest to reward pool: " + interestRewards);

            assert.equal(updatedLoanOutstandingTotal.toNumber(), finalLoanOutstandingTotal);
            assert.equal(updatedLoanPrincipalTotal.toNumber(), finalLoanPrincipalTotal);
            assert.equal(updatedLoanInterestTotal.toNumber(), finalLoanInterestTotal);
            assert.equal(afterRepaymentVaultBorrowIndex.toNumber(), afterRepaymentTokenBorrowIndex.toNumber());
            assert.equal(updatedEveMockFa2TokenBalance, eveInitialMockFa2TokenBalance - repayAmount);

            // check treasury fees and interest to token pool reward contract
            assert.equal(updatedTreasuryMockFa2TokenBalance, treasuryInitialMockFa2TokenBalance + interestTreasuryShare)

        })



        it('user (eve) can repay debt - Mock FA2 Token  - mock one month - utilisation rate above optimal utilisation rate - repayment greater than interest', async () => {

            // Conditions: 
            // - vault loan token: mock FA2 tokens
            // - mock time: 1 month
            // - token pool interest rate: above optimal utilisation rate
            // - repay amount: greater than interest amount 

            // Summary of steps:
            // 1. Create Vault
            // 2. Deposit collateral into vault (100 Mock FA12 Tokens, 100 Mock FA2 Tokens)
            // 3. Borrow from vault (20 Mock FA2 Tokens)
            // 4. Set block levels time to 1 year in future
            // 5. Repay partial debt

            // init variables
            await signerFactory(tezos, eve.sk);
            const lendingControllerStorage = await lendingControllerInstance.storage();
            const vaultFactoryStorage      = await vaultFactoryInstance.storage();

            // ----------------------------------------------------------------------------------------------
            // Create Vault
            // ----------------------------------------------------------------------------------------------

            const vaultCounter  = vaultFactoryStorage.vaultCounter;
            const vaultId       = vaultCounter.toNumber();
            const vaultOwner    = eve.pkh;
            const loanTokenName = "eurl";
            const vaultName     = "newVault";
            const depositorsConfig      = "any";

            const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
                baker.pkh,              // delegate to
                loanTokenName,          // loan token type
                vaultName,              // vault name
                null,                   // collateral tokens
                depositorsConfig        // depositors config type - any / whitelist
            ).send();
            await userCreatesNewVaultOperation.confirmation();

            const vaultHandle = {
                "id"    : vaultId,
                "owner" : vaultOwner
            };
            const newVaultRecord = await getStorageMapValue(lendingControllerStorage, 'vaults', vaultHandle);
            const vaultAddress   = newVaultRecord.address;
            const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

            // console.log('   - vault originated: ' + vaultAddress);
            // console.log('   - vault id: ' + vaultId);

            // push new vault id to vault set
            eveVaultSet.push(vaultId);

            // ----------------------------------------------------------------------------------------------
            // Deposit Collateral into Vault
            // ----------------------------------------------------------------------------------------------

            const mockFa12DepositAmount      = 15000000;   // 15 Mock FA12 Tokens
            const mockFa2DepositAmount       = 15000000;   // 15 Mock FA12 Tokens

            // ---------------------------------
            // Deposit Mock FA12 Tokens
            // ---------------------------------

            // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
            // reset token allowance
            const resetTokenAllowanceForDeposit = await mockFa12TokenInstance.methods.approve(
                vaultAddress,
                0
            ).send();
            await resetTokenAllowanceForDeposit.confirmation();

            // set new token allowance
            const setNewTokenAllowanceForDeposit = await mockFa12TokenInstance.methods.approve(
                vaultAddress,
                mockFa12DepositAmount
            ).send();
            await setNewTokenAllowanceForDeposit.confirmation();

            // eve deposits mock FA12 tokens into vault
            const eveDepositMockFa12TokenOperation  = await vaultInstance.methods.initVaultAction(
                "deposit",
                mockFa12DepositAmount,           
                "usdt"
            ).send();
            await eveDepositMockFa12TokenOperation.confirmation();

            // ---------------------------------
            // Deposit Mock FA2 Tokens
            // ---------------------------------

            // update operators for vault
            updateOperatorsOperation = await updateOperators(mockFa2TokenInstance, eve.pkh, vaultAddress, tokenId);
            await updateOperatorsOperation.confirmation();

            // eve deposits mock FA2 tokens into vault
            const eveDepositTokenOperation = await vaultInstance.methods.initVaultAction(
                "deposit",
                mockFa2DepositAmount,      
                "eurl"
            ).send();
            await eveDepositTokenOperation.confirmation();

            // console.log('   - vault collateral deposited');

            // ----------------------------------------------------------------------------------------------
            // Borrow with Vault
            // ----------------------------------------------------------------------------------------------

            // borrow amount - 2 Mock FA12 Tokens
            const borrowAmount = 2000000;   

            // borrow operation
            const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
            await eveBorrowOperation.confirmation();

            // console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName);

            // get initial Mock FA12 Token balance for Eve, Treasury and Token Pool Reward Contract
            const eveMockFa2Ledger                 = await getStorageMapValue(mockFa2TokenStorage, 'ledger', eve.pkh);            
            const eveInitialMockFa2TokenBalance    = eveMockFa2Ledger == undefined ? 0 : eveMockFa2Ledger.toNumber();

            const treasuryMockFa2Ledger                = await getStorageMapValue(mockFa2TokenStorage, 'ledger', contractDeployments.treasury.address);            
            const treasuryInitialMockFa2TokenBalance   = treasuryMockFa2Ledger == undefined ? 0 : treasuryMockFa2Ledger.toNumber();

            // get token pool stats
            const afterBorrowloanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const loanTokenDecimals    = afterBorrowloanTokenRecordView.Some.tokenDecimals;
            const interestRateDecimals = (27 - 2); 

            const tokenPoolTotal           = afterBorrowloanTokenRecordView.Some.tokenPoolTotal.toNumber() / (10 ** loanTokenDecimals);
            const totalBorrowed            = afterBorrowloanTokenRecordView.Some.totalBorrowed.toNumber() / (10 ** loanTokenDecimals);
            const optimalUtilisationRate   = Number(afterBorrowloanTokenRecordView.Some.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const utilisationRate          = Number(afterBorrowloanTokenRecordView.Some.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const currentInterestRate      = Number(afterBorrowloanTokenRecordView.Some.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";

            // console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);

            // ----------------------------------------------------------------------------------------------
            // Set Block Levels For Mock Time Test - 1 month
            // ----------------------------------------------------------------------------------------------

            await signerFactory(tezos, bob.sk); // temporarily set to tester to increase block levels

            const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
            const updatedVault                      = await getStorageMapValue(updatedLendingControllerStorage, 'vaults', vaultHandle);
            const lastUpdatedBlockLevel             = updatedVault.lastUpdatedBlockLevel;

            const newBlockLevel = lastUpdatedBlockLevel.toNumber() + oneMonthLevelBlocks;

            const setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(newBlockLevel, 'configMockLevel').send();
            await setMockLevelOperation.confirmation();

            const mockTimeLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedMockLevel = mockTimeLendingControllerStorage.config.mockLevel;

            assert.equal(updatedMockLevel, newBlockLevel);

            // console.log('   - time set to 1 month ahead: ' + lastUpdatedBlockLevel + ' to ' + newBlockLevel);

            // ----------------------------------------------------------------------------------------------
            // Repay partial debt 
            // ----------------------------------------------------------------------------------------------

            // set back to user
            await signerFactory(tezos, eve.sk);  

            // treasury share of interest repaid
            const configInterestTreasuryShare = await lendingControllerStorage.config.interestTreasuryShare;

            // repayment amount
            const repayAmount = 500000; // 0.5 Mock FA12 Tokens

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

            // get vault and loan token views, and storage
            const vaultRecordView        = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            const loanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const beforeRepaymentStorage = await lendingControllerInstance.storage();

            const initialVaultLoanOutstandingTotal         = vaultRecordView.Some.loanOutstandingTotal;
            const beforeRepaymentVaultBorrowIndex          = vaultRecordView.Some.borrowIndex;
            const beforeRepaymentVaultOutstandingTotal     = vaultRecordView.Some.loanOutstandingTotal;
            const beforeRepaymentVaultPrincipalTotal       = vaultRecordView.Some.loanPrincipalTotal;
            const beforeRepaymentTokenBorrowIndex          = loanTokenRecordView.Some.borrowIndex;

            initialTokenRewardIndex = loanTokenRecordView.Some.tokenRewardIndex;
            initialTokenPoolTotal   = loanTokenRecordView.Some.tokenPoolTotal;

            // const repayOpParam        = await lendingControllerInstance.methods.repay(vaultId, repayAmount).toTransferParams();
            // const estimate            = await utils.tezos.estimate.transfer(repayOpParam);
            // console.log("REPAY OP ESTIMATION: ", estimate);

            // repay operation
            const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send();
            await eveRepayOperation.confirmation();

            // console.log('   - repaid: ' + repayAmount + " | type: " + loanTokenName);

            // get updated storage
            const updatedLendingControllerStorageAfterRepay     = await lendingControllerInstance.storage();
            const updatedVaultRecord                            = await getStorageMapValue(updatedLendingControllerStorageAfterRepay, 'vaults', vaultHandle);
            const updatedMockFa2TokenStorage                    = await mockFa2TokenInstance.storage();
            
            // get updated Mock FA2 Token balance for Eve, Treasury and Token Pool Reward Contract
            const updatedEveMockFa2Ledger                       = await getStorageMapValue(updatedMockFa2TokenStorage, 'ledger', eve.pkh);            
            const updatedEveMockFa2TokenBalance                 = updatedEveMockFa2Ledger == undefined ? 0 : updatedEveMockFa2Ledger.toNumber();

            const updatedTreasuryMockFa2Ledger                  = await getStorageMapValue(updatedMockFa2TokenStorage, 'ledger', contractDeployments.treasury.address);            
            const updatedTreasuryMockFa2TokenBalance            = updatedTreasuryMockFa2Ledger == undefined ? 0 : updatedTreasuryMockFa2Ledger.toNumber();

            // On-chain views to vault and loan token
            updatedVaultRecordView     = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            updatedLoanTokenRecordView = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});

            const updatedLoanOutstandingTotal             = updatedVaultRecordView.Some.loanOutstandingTotal;
            const updatedLoanPrincipalTotal               = updatedVaultRecordView.Some.loanPrincipalTotal;
            const updatedLoanInterestTotal                = updatedVaultRecordView.Some.loanInterestTotal;

            const afterRepaymentVaultBorrowIndex          = updatedVaultRecordView.Some.borrowIndex;
            const afterRepaymentTokenBorrowIndex          = updatedLoanTokenRecordView.Some.borrowIndex;
            
            const loanOutstandingWithAccruedInterest      = lendingHelper.calculateAccruedInterest(beforeRepaymentVaultOutstandingTotal, beforeRepaymentVaultBorrowIndex, afterRepaymentTokenBorrowIndex);
            const totalInterest                           = loanOutstandingWithAccruedInterest - initialVaultLoanOutstandingTotal.toNumber();
            
            // check if repayAmount covers whole or partial of total interest 
            const totalInterestPaid                       = repayAmount < totalInterest ? repayAmount : totalInterest;
            const remainingInterest                       = totalInterest - repayAmount < 0 ? 0 : totalInterest - repayAmount;
            
            const finalLoanOutstandingTotal               = loanOutstandingWithAccruedInterest - repayAmount;
            const finalLoanPrincipalTotal                 = remainingInterest > 0 ? beforeRepaymentVaultPrincipalTotal : loanOutstandingWithAccruedInterest - repayAmount;
            const finalLoanInterestTotal                  = remainingInterest > 0 ? remainingInterest : 0;

            const interestTreasuryShare                   = lendingHelper.calculateInterestSentToTreasury(configInterestTreasuryShare, totalInterestPaid);
            const interestRewards                         = totalInterestPaid - interestTreasuryShare;

            // calculate new reward index
            updatedTokenRewardIndex                       = updatedLoanTokenRecordView.Some.tokenRewardIndex;
            const calculatedTokenRewardIndex              = lendingHelper.calculateNewRewardIndex(interestRewards, initialTokenPoolTotal, initialTokenRewardIndex);
            assert.equal(almostEqual(updatedTokenRewardIndex.toNumber(), calculatedTokenRewardIndex, 0.00001), true);

            // console.log('   - final vault stats >> outstanding total: ' + finalLoanOutstandingTotal + " | principal total: " + finalLoanPrincipalTotal  + " | interest total: " + finalLoanInterestTotal);
            // console.log('   - interest stats >> total interest: ' + totalInterest + ' | interest paid: ' + totalInterestPaid +' | interest to treasury: ' + interestTreasuryShare + " | interest to reward pool: " + interestRewards);

            assert.equal(updatedLoanOutstandingTotal.toNumber(), finalLoanOutstandingTotal);
            assert.equal(updatedLoanPrincipalTotal.toNumber(), finalLoanPrincipalTotal);
            assert.equal(updatedLoanInterestTotal.toNumber(), finalLoanInterestTotal);
            assert.equal(afterRepaymentVaultBorrowIndex.toNumber(), afterRepaymentTokenBorrowIndex.toNumber());
            assert.equal(updatedEveMockFa2TokenBalance, eveInitialMockFa2TokenBalance - repayAmount);

            // check treasury fees and interest to token pool reward contract
            assert.equal(updatedTreasuryMockFa2TokenBalance, treasuryInitialMockFa2TokenBalance + interestTreasuryShare)

        })


        it('user (eve) can repay debt - Mock FA2 Token  - mock one month - interest rate greater optimal utilisation rate - repayment less than interest', async () => {

            // Conditions: 
            // - vault loan token: mock FA2 tokens
            // - mock time: 1 month
            // - token pool interest rate: above optimal utilisation rate
            // - repay amount: less than interest amount 

            // Summary of steps:
            // 1. Create Vault
            // 2. Deposit collateral into vault (100 Mock FA12 Tokens, 100 Mock FA2 Tokens)
            // 3. Borrow from vault (20 Mock FA2 Tokens)
            // 4. Set block levels time to 1 year in future
            // 5. Repay partial debt

            // init variables
            await signerFactory(tezos, eve.sk);
            const lendingControllerStorage = await lendingControllerInstance.storage();
            const vaultFactoryStorage      = await vaultFactoryInstance.storage();

            // ----------------------------------------------------------------------------------------------
            // Create Vault
            // ----------------------------------------------------------------------------------------------

            const vaultCounter  = vaultFactoryStorage.vaultCounter;
            const vaultId       = vaultCounter.toNumber();
            const vaultOwner    = eve.pkh;
            const loanTokenName = "eurl";
            const vaultName     = "newVault";
            const depositorsConfig      = "any";

            const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
                baker.pkh,              // delegate to
                loanTokenName,          // loan token type
                vaultName,              // vault name
                null,                   // collateral tokens
                depositorsConfig        // depositors config type - any / whitelist
            ).send();
            await userCreatesNewVaultOperation.confirmation();

            const vaultHandle = {
                "id"    : vaultId,
                "owner" : vaultOwner
            };
            const newVaultRecord = await getStorageMapValue(lendingControllerStorage, 'vaults', vaultHandle);
            const vaultAddress   = newVaultRecord.address;
            const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

            // console.log('   - vault originated: ' + vaultAddress);
            // console.log('   - vault id: ' + vaultId);

            // push new vault id to vault set
            eveVaultSet.push(vaultId);

            // ----------------------------------------------------------------------------------------------
            // Deposit Collateral into Vault
            // ----------------------------------------------------------------------------------------------

            const mockFa12DepositAmount      = 15000000;   // 15 Mock FA12 Tokens
            const mockFa2DepositAmount       = 15000000;   // 15 Mock FA12 Tokens

            // ---------------------------------
            // Deposit Mock FA12 Tokens
            // ---------------------------------

            // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
            // reset token allowance
            const resetTokenAllowanceForDeposit = await mockFa12TokenInstance.methods.approve(
                vaultAddress,
                0
            ).send();
            await resetTokenAllowanceForDeposit.confirmation();

            // set new token allowance
            const setNewTokenAllowanceForDeposit = await mockFa12TokenInstance.methods.approve(
                vaultAddress,
                mockFa12DepositAmount
            ).send();
            await setNewTokenAllowanceForDeposit.confirmation();

            // eve deposits mock FA12 tokens into vault
            const eveDepositMockFa12TokenOperation  = await vaultInstance.methods.initVaultAction(
                "deposit",
                mockFa12DepositAmount,            
                "usdt"
            ).send();
            await eveDepositMockFa12TokenOperation.confirmation();

            // ---------------------------------
            // Deposit Mock FA2 Tokens
            // ---------------------------------

            // update operators for vault
            updateOperatorsOperation = await updateOperators(mockFa2TokenInstance, eve.pkh, vaultAddress, tokenId);
            await updateOperatorsOperation.confirmation();

            // eve deposits mock FA2 tokens into vault
            const eveDepositTokenOperation = await vaultInstance.methods.initVaultAction(
                "deposit",
                mockFa2DepositAmount,          
                "eurl"
            ).send();
            await eveDepositTokenOperation.confirmation();

            // console.log('   - vault collateral deposited');

            // ----------------------------------------------------------------------------------------------
            // Borrow with Vault
            // ----------------------------------------------------------------------------------------------

            // borrow amount - 2 Mock FA12 Tokens
            const borrowAmount = 2000000;   

            // borrow operation
            const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
            await eveBorrowOperation.confirmation();

            // console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName);

            // get initial Mock FA12 Token balance for Eve, Treasury and Token Pool Reward Contract
            const eveMockFa2Ledger                 = await getStorageMapValue(mockFa2TokenStorage, 'ledger', eve.pkh);            
            const eveInitialMockFa2TokenBalance    = eveMockFa2Ledger == undefined ? 0 : eveMockFa2Ledger.toNumber();

            const treasuryMockFa2Ledger                = await getStorageMapValue(mockFa2TokenStorage, 'ledger', contractDeployments.treasury.address);            
            const treasuryInitialMockFa2TokenBalance   = treasuryMockFa2Ledger == undefined ? 0 : treasuryMockFa2Ledger.toNumber();

            // get token pool stats
            const afterBorrowloanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const loanTokenDecimals    = afterBorrowloanTokenRecordView.Some.tokenDecimals;
            const interestRateDecimals = (27 - 2); 

            const tokenPoolTotal           = afterBorrowloanTokenRecordView.Some.tokenPoolTotal.toNumber() / (10 ** loanTokenDecimals);
            const totalBorrowed            = afterBorrowloanTokenRecordView.Some.totalBorrowed.toNumber() / (10 ** loanTokenDecimals);
            const optimalUtilisationRate   = Number(afterBorrowloanTokenRecordView.Some.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const utilisationRate          = Number(afterBorrowloanTokenRecordView.Some.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const currentInterestRate      = Number(afterBorrowloanTokenRecordView.Some.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";

            // console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);

            // ----------------------------------------------------------------------------------------------
            // Set Block Levels For Mock Time Test - 1 month
            // ----------------------------------------------------------------------------------------------

            await signerFactory(tezos, bob.sk); // temporarily set to tester to increase block levels

            const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
            const updatedVault                      = await getStorageMapValue(updatedLendingControllerStorage, 'vaults', vaultHandle);
            const lastUpdatedBlockLevel             = updatedVault.lastUpdatedBlockLevel;

            const newBlockLevel = lastUpdatedBlockLevel.toNumber() + oneMonthLevelBlocks;

            const setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(newBlockLevel, 'configMockLevel').send();
            await setMockLevelOperation.confirmation();

            const mockTimeLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedMockLevel = mockTimeLendingControllerStorage.config.mockLevel;

            assert.equal(updatedMockLevel, newBlockLevel);

            // console.log('   - time set to 1 month ahead: ' + lastUpdatedBlockLevel + ' to ' + newBlockLevel);

            // ----------------------------------------------------------------------------------------------
            // Repay partial debt 
            // ----------------------------------------------------------------------------------------------

            // set back to user
            await signerFactory(tezos, eve.sk);  

            // treasury share of interest repaid
            const configInterestTreasuryShare = await lendingControllerStorage.config.interestTreasuryShare;

            // repayment amount
            const repayAmount = 10000; // 0.01 Mock FA12 Tokens

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

            // get vault and loan token views, and storage
            const vaultRecordView        = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            const loanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const beforeRepaymentStorage = await lendingControllerInstance.storage();

            const initialVaultLoanOutstandingTotal         = vaultRecordView.Some.loanOutstandingTotal;
            const beforeRepaymentVaultBorrowIndex          = vaultRecordView.Some.borrowIndex;
            const beforeRepaymentVaultOutstandingTotal     = vaultRecordView.Some.loanOutstandingTotal;
            const beforeRepaymentVaultPrincipalTotal       = vaultRecordView.Some.loanPrincipalTotal;
            const beforeRepaymentTokenBorrowIndex          = loanTokenRecordView.Some.borrowIndex;

            initialTokenRewardIndex = loanTokenRecordView.Some.tokenRewardIndex;
            initialTokenPoolTotal   = loanTokenRecordView.Some.tokenPoolTotal;

            // const repayOpParam        = await lendingControllerInstance.methods.repay(vaultId, repayAmount).toTransferParams();
            // const estimate            = await utils.tezos.estimate.transfer(repayOpParam);
            // console.log("REPAY OP ESTIMATION: ", estimate);

            // repay operation
            const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send();
            await eveRepayOperation.confirmation();

            // console.log('   - repaid: ' + repayAmount + " | type: " + loanTokenName);

            // get updated storage
            const updatedLendingControllerStorageAfterRepay     = await lendingControllerInstance.storage();
            const updatedVaultRecord                            = await getStorageMapValue(updatedLendingControllerStorageAfterRepay, 'vaults', vaultHandle);
            const updatedMockFa2TokenStorage                    = await mockFa2TokenInstance.storage();
            
            // get updated Mock FA2 Token balance for Eve, Treasury and Token Pool Reward Contract
            const updatedEveMockFa2Ledger                       = await getStorageMapValue(updatedMockFa2TokenStorage, 'ledger', eve.pkh);            
            const updatedEveMockFa2TokenBalance                 = updatedEveMockFa2Ledger == undefined ? 0 : updatedEveMockFa2Ledger.toNumber();

            const updatedTreasuryMockFa2Ledger                  = await getStorageMapValue(updatedMockFa2TokenStorage, 'ledger', contractDeployments.treasury.address);            
            const updatedTreasuryMockFa2TokenBalance            = updatedTreasuryMockFa2Ledger == undefined ? 0 : updatedTreasuryMockFa2Ledger.toNumber();

            // On-chain views to vault and loan token
            updatedVaultRecordView     = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            updatedLoanTokenRecordView = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});

            const updatedLoanOutstandingTotal             = updatedVaultRecordView.Some.loanOutstandingTotal;
            const updatedLoanPrincipalTotal               = updatedVaultRecordView.Some.loanPrincipalTotal;
            const updatedLoanInterestTotal                = updatedVaultRecordView.Some.loanInterestTotal;

            const afterRepaymentVaultBorrowIndex          = updatedVaultRecordView.Some.borrowIndex;
            const afterRepaymentTokenBorrowIndex          = updatedLoanTokenRecordView.Some.borrowIndex;
            
            const loanOutstandingWithAccruedInterest      = lendingHelper.calculateAccruedInterest(beforeRepaymentVaultOutstandingTotal, beforeRepaymentVaultBorrowIndex, afterRepaymentTokenBorrowIndex);
            const totalInterest                           = loanOutstandingWithAccruedInterest - initialVaultLoanOutstandingTotal.toNumber();
            
            // check if repayAmount covers whole or partial of total interest 
            const totalInterestPaid                       = repayAmount < totalInterest ? repayAmount : totalInterest;
            const remainingInterest                       = totalInterest - repayAmount < 0 ? 0 : totalInterest - repayAmount;
            
            const finalLoanOutstandingTotal               = loanOutstandingWithAccruedInterest - repayAmount;
            const finalLoanPrincipalTotal                 = remainingInterest > 0 ? beforeRepaymentVaultPrincipalTotal : loanOutstandingWithAccruedInterest - repayAmount;
            const finalLoanInterestTotal                  = remainingInterest > 0 ? remainingInterest : 0;

            const interestTreasuryShare                   = lendingHelper.calculateInterestSentToTreasury(configInterestTreasuryShare, totalInterestPaid);
            const interestRewards                         = totalInterestPaid - interestTreasuryShare;

            // calculate new reward index
            updatedTokenRewardIndex                       = updatedLoanTokenRecordView.Some.tokenRewardIndex;
            const calculatedTokenRewardIndex              = lendingHelper.calculateNewRewardIndex(interestRewards, initialTokenPoolTotal, initialTokenRewardIndex);
            assert.equal(almostEqual(updatedTokenRewardIndex.toNumber(), calculatedTokenRewardIndex, 0.00001), true);

            // console.log('   - final vault stats >> outstanding total: ' + finalLoanOutstandingTotal + " | principal total: " + finalLoanPrincipalTotal  + " | interest total: " + finalLoanInterestTotal);
            // console.log('   - interest stats >> total interest: ' + totalInterest + ' | interest paid: ' + totalInterestPaid +' | interest to treasury: ' + interestTreasuryShare + " | interest to reward pool: " + interestRewards);

            assert.equal(updatedLoanOutstandingTotal.toNumber(), finalLoanOutstandingTotal);
            assert.equal(updatedLoanPrincipalTotal.toNumber(), finalLoanPrincipalTotal);
            assert.equal(updatedLoanInterestTotal.toNumber(), finalLoanInterestTotal);
            assert.equal(afterRepaymentVaultBorrowIndex.toNumber(), afterRepaymentTokenBorrowIndex.toNumber());
            assert.equal(updatedEveMockFa2TokenBalance, eveInitialMockFa2TokenBalance - repayAmount);

            // check treasury fees and interest to token pool reward contract
            assert.equal(updatedTreasuryMockFa2TokenBalance, treasuryInitialMockFa2TokenBalance + interestTreasuryShare)

        })

    })



    describe('%repay TEZ - mock time tests (1 month)', function () {

        it('user (eve) can repay debt - TEZ  - mock one month - utilisation rate below optimal utilisation rate - repayment greater than interest', async () => {

            // Conditions: 
            // - vault loan token: tez
            // - mock time: 1 month
            // - token pool interest rate: below optimal utilisation rate
            // - repay amount: greater than interest amount 

            // Summary of steps:
            // 1. Create Vault
            // 2. Deposit collateral into vault (100 Mock FA12 Tokens, 100 Mock FA2 Tokens)
            // 3. Borrow from vault (20 Tez)
            // 4. Set block levels time to 1 year in future
            // 5. Repay partial debt

            // init variables
            await signerFactory(tezos, eve.sk);
            const lendingControllerStorage = await lendingControllerInstance.storage();
            const vaultFactoryStorage      = await vaultFactoryInstance.storage();

            // ----------------------------------------------------------------------------------------------
            // Create Vault
            // ----------------------------------------------------------------------------------------------

            const vaultCounter  = vaultFactoryStorage.vaultCounter;
            const vaultId       = vaultCounter.toNumber();
            const vaultOwner    = eve.pkh;
            const loanTokenName = "tez";
            const vaultName     = "newVault";
            const depositorsConfig      = "any";

            // user (eve) creates a new vault with no tez
            const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
                baker.pkh,              // delegate to
                loanTokenName,          // loan token type
                vaultName,              // vault name
                null,                   // collateral tokens
                depositorsConfig        // depositors config type - any / whitelist
            ).send();
            await userCreatesNewVaultOperation.confirmation();

            const vaultHandle = {
                "id"    : vaultId,
                "owner" : vaultOwner
            };
            const newVaultRecord = await getStorageMapValue(lendingControllerStorage, 'vaults', vaultHandle);
            const vaultAddress   = newVaultRecord.address;
            const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

            // console.log('   - vault originated: ' + vaultAddress);
            // console.log('   - vault id: ' + vaultId);

            // push new vault id to vault set
            eveVaultSet.push(vaultId);

            // ----------------------------------------------------------------------------------------------
            // Deposit Collateral into Vault
            // ----------------------------------------------------------------------------------------------

            const mockFa12DepositAmount      = 15000000;   // 15 Mock FA12 Tokens
            const mockFa2DepositAmount       = 15000000;   // 15 Mock FA12 Tokens

            // ---------------------------------
            // Deposit Mock FA12 Tokens
            // ---------------------------------

            // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
            // reset token allowance
            const resetTokenAllowanceForDeposit = await mockFa12TokenInstance.methods.approve(
                vaultAddress,
                0
            ).send();
            await resetTokenAllowanceForDeposit.confirmation();

            // set new token allowance
            const setNewTokenAllowanceForDeposit = await mockFa12TokenInstance.methods.approve(
                vaultAddress,
                mockFa12DepositAmount
            ).send();
            await setNewTokenAllowanceForDeposit.confirmation();

            // eve deposits mock FA12 tokens into vault
            const eveDepositMockFa12TokenOperation  = await vaultInstance.methods.initVaultAction(
                "deposit",
                mockFa12DepositAmount,            
                "usdt"
            ).send();
            await eveDepositMockFa12TokenOperation.confirmation();

            // ---------------------------------
            // Deposit Mock FA2 Tokens
            // ---------------------------------

            // update operators for vault
            updateOperatorsOperation = await updateOperators(mockFa2TokenInstance, eve.pkh, vaultAddress, tokenId);
            await updateOperatorsOperation.confirmation();

            // eve deposits mock FA2 tokens into vault
            const eveDepositTokenOperation = await vaultInstance.methods.initVaultAction(
                "deposit",
                mockFa2DepositAmount,         
                "eurl"
            ).send();
            await eveDepositTokenOperation.confirmation();

            // console.log('   - vault collateral deposited');

            // ----------------------------------------------------------------------------------------------
            // Borrow with Vault
            // ----------------------------------------------------------------------------------------------

            // borrow amount - 2 Tez
            const borrowAmount = 2000000;   

            // borrow operation
            const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
            await eveBorrowOperation.confirmation();

            // console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName);

            // get initial XTZ balance for Eve, Treasury and Token Pool Reward Contract
            const eveXtzLedger   = await utils.tezos.tz.getBalance(eve.pkh);
            const eveInitialXtzBalance  = eveXtzLedger.toNumber();

            const treasuryXtzLedger   = await utils.tezos.tz.getBalance(contractDeployments.treasury.address);
            const treasuryInitialXtzBalance  = treasuryXtzLedger.toNumber();

            // get token pool stats
            const afterBorrowloanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const loanTokenDecimals    = afterBorrowloanTokenRecordView.Some.tokenDecimals;
            const interestRateDecimals = (27 - 2); 

            const tokenPoolTotal           = afterBorrowloanTokenRecordView.Some.tokenPoolTotal.toNumber() / (10 ** loanTokenDecimals);
            const totalBorrowed            = afterBorrowloanTokenRecordView.Some.totalBorrowed.toNumber() / (10 ** loanTokenDecimals);
            const optimalUtilisationRate   = Number(afterBorrowloanTokenRecordView.Some.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const utilisationRate          = Number(afterBorrowloanTokenRecordView.Some.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const currentInterestRate      = Number(afterBorrowloanTokenRecordView.Some.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";

            // console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);

            // ----------------------------------------------------------------------------------------------
            // Set Block Levels For Mock Time Test - 1 month
            // ----------------------------------------------------------------------------------------------

            await signerFactory(tezos, bob.sk); // temporarily set to tester to increase block levels

            const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
            const updatedVault                      = await getStorageMapValue(updatedLendingControllerStorage, 'vaults', vaultHandle);
            const lastUpdatedBlockLevel             = updatedVault.lastUpdatedBlockLevel;

            const newBlockLevel = lastUpdatedBlockLevel.toNumber() + oneMonthLevelBlocks;

            const setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(newBlockLevel, 'configMockLevel').send();
            await setMockLevelOperation.confirmation();

            const mockTimeLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedMockLevel = mockTimeLendingControllerStorage.config.mockLevel;

            assert.equal(updatedMockLevel, newBlockLevel);

            // console.log('   - time set to 1 month ahead: ' + lastUpdatedBlockLevel + ' to ' + newBlockLevel);

            // ----------------------------------------------------------------------------------------------
            // Repay partial debt 
            // ----------------------------------------------------------------------------------------------

            // set back to user
            await signerFactory(tezos, eve.sk);  

            // treasury share of interest repaid
            const configInterestTreasuryShare = await lendingControllerStorage.config.interestTreasuryShare;

            // repayment amount
            const repayAmount = 500000; // 0.5 Tez

            // get vault and loan token views, and storage
            const vaultRecordView        = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            const loanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const beforeRepaymentStorage = await lendingControllerInstance.storage();

            const initialVaultLoanOutstandingTotal         = vaultRecordView.Some.loanOutstandingTotal;
            const beforeRepaymentVaultBorrowIndex          = vaultRecordView.Some.borrowIndex;
            const beforeRepaymentVaultOutstandingTotal     = vaultRecordView.Some.loanOutstandingTotal;
            const beforeRepaymentVaultPrincipalTotal       = vaultRecordView.Some.loanPrincipalTotal;
            const beforeRepaymentTokenBorrowIndex          = loanTokenRecordView.Some.borrowIndex;

            initialTokenRewardIndex = loanTokenRecordView.Some.tokenRewardIndex;
            initialTokenPoolTotal   = loanTokenRecordView.Some.tokenPoolTotal;

            // const repayOpParam        = await lendingControllerInstance.methods.repay(vaultId, repayAmount).toTransferParams();
            // const estimate            = await utils.tezos.estimate.transfer(repayOpParam);
            // console.log("REPAY OP ESTIMATION: ", estimate);

            // repay operation
            const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send({ mumav: true, amount : repayAmount});
            await eveRepayOperation.confirmation();

            // console.log('   - repaid: ' + repayAmount + " | type: " + loanTokenName);

            // get updated storage
            const updatedLendingControllerStorageAfterRepay     = await lendingControllerInstance.storage();
            const updatedVaultRecord                            = await getStorageMapValue(updatedLendingControllerStorageAfterRepay, 'vaults', vaultHandle);
            const updatedMockFa2TokenStorage                    = await mockFa2TokenInstance.storage();
            
            // get updated XTZ balance for Eve, Treasury and Token Pool Reward Contract
            const updatedEveXtzLedger                           = await utils.tezos.tz.getBalance(eve.pkh);
            const updatedEveXtzBalance                          = updatedEveXtzLedger.toNumber();

            const updatedTreasuryXtzLedger                      = await utils.tezos.tz.getBalance(contractDeployments.treasury.address);
            const updatedTreasuryXtzBalance                     = updatedTreasuryXtzLedger.toNumber();

            // On-chain views to vault and loan token
            updatedVaultRecordView     = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            updatedLoanTokenRecordView = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});

            const updatedLoanOutstandingTotal             = updatedVaultRecordView.Some.loanOutstandingTotal;
            const updatedLoanPrincipalTotal               = updatedVaultRecordView.Some.loanPrincipalTotal;
            const updatedLoanInterestTotal                = updatedVaultRecordView.Some.loanInterestTotal;

            const afterRepaymentVaultBorrowIndex          = updatedVaultRecordView.Some.borrowIndex;
            const afterRepaymentTokenBorrowIndex          = updatedLoanTokenRecordView.Some.borrowIndex;
            
            const loanOutstandingWithAccruedInterest      = lendingHelper.calculateAccruedInterest(beforeRepaymentVaultOutstandingTotal, beforeRepaymentVaultBorrowIndex, afterRepaymentTokenBorrowIndex);
            const totalInterest                           = loanOutstandingWithAccruedInterest - initialVaultLoanOutstandingTotal.toNumber();
            
            // check if repayAmount covers whole or partial of total interest 
            const totalInterestPaid                       = repayAmount < totalInterest ? repayAmount : totalInterest;
            const remainingInterest                       = totalInterest - repayAmount < 0 ? 0 : totalInterest - repayAmount;
            
            const finalLoanOutstandingTotal               = loanOutstandingWithAccruedInterest - repayAmount;
            const finalLoanPrincipalTotal                 = remainingInterest > 0 ? beforeRepaymentVaultPrincipalTotal : loanOutstandingWithAccruedInterest - repayAmount;
            const finalLoanInterestTotal                  = remainingInterest > 0 ? remainingInterest : 0;

            const interestTreasuryShare                   = lendingHelper.calculateInterestSentToTreasury(configInterestTreasuryShare, totalInterestPaid);
            const interestRewards                         = totalInterestPaid - interestTreasuryShare;

            // calculate new reward index
            updatedTokenRewardIndex                       = updatedLoanTokenRecordView.Some.tokenRewardIndex;
            const calculatedTokenRewardIndex              = lendingHelper.calculateNewRewardIndex(interestRewards, initialTokenPoolTotal, initialTokenRewardIndex);
            assert.equal(almostEqual(updatedTokenRewardIndex.toNumber(), calculatedTokenRewardIndex, 0.00001), true);

            // console.log('   - final vault stats >> outstanding total: ' + finalLoanOutstandingTotal + " | principal total: " + finalLoanPrincipalTotal  + " | interest total: " + finalLoanInterestTotal);
            // console.log('   - interest stats >> total interest: ' + totalInterest + ' | interest paid: ' + totalInterestPaid +' | interest to treasury: ' + interestTreasuryShare + " | interest to reward pool: " + interestRewards);

            assert.equal(updatedLoanOutstandingTotal.toNumber(), finalLoanOutstandingTotal);
            assert.equal(updatedLoanPrincipalTotal.toNumber(), finalLoanPrincipalTotal);
            assert.equal(updatedLoanInterestTotal.toNumber(), finalLoanInterestTotal);
            assert.equal(afterRepaymentVaultBorrowIndex.toNumber(), afterRepaymentTokenBorrowIndex.toNumber());
            
            // account for minor gas cost difference
            assert.equal(almostEqual(updatedEveXtzBalance, eveInitialXtzBalance - repayAmount, 0.0001), true);

            // check treasury fees and interest to token pool reward contract
            assert.equal(updatedTreasuryXtzBalance, treasuryInitialXtzBalance + interestTreasuryShare)

        })


        it('user (eve) can repay debt - TEZ  - mock one month - utilisation rate below optimal utilisation rate - repayment less than interest', async () => {

            // Conditions: 
            // - vault loan token: tez
            // - mock time: 1 month
            // - token pool interest rate: below optimal utilisation rate
            // - repay amount: less than interest amount 

            // Summary of steps:
            // 1. Create Vault
            // 2. Deposit collateral into vault (100 Mock FA12 Tokens, 100 Mock FA2 Tokens)
            // 3. Borrow from vault (20 Tez)
            // 4. Set block levels time to 1 year in future
            // 5. Repay partial debt

            // init variables
            await signerFactory(tezos, eve.sk);
            const lendingControllerStorage = await lendingControllerInstance.storage();
            const vaultFactoryStorage      = await vaultFactoryInstance.storage();

            // ----------------------------------------------------------------------------------------------
            // Create Vault
            // ----------------------------------------------------------------------------------------------

            const vaultCounter  = vaultFactoryStorage.vaultCounter;
            const vaultId       = vaultCounter.toNumber();
            const vaultOwner    = eve.pkh;
            const loanTokenName = "tez";
            const vaultName     = "newVault";
            const depositorsConfig      = "any";

            // user (eve) creates a new vault with no tez
            const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
                baker.pkh,              // delegate to
                loanTokenName,          // loan token type
                vaultName,              // vault name
                null,                   // collateral tokens
                depositorsConfig        // depositors config type - any / whitelist
            ).send();
            await userCreatesNewVaultOperation.confirmation();

            const vaultHandle = {
                "id"    : vaultId,
                "owner" : vaultOwner
            };
            const newVaultRecord = await getStorageMapValue(lendingControllerStorage, 'vaults', vaultHandle);
            const vaultAddress   = newVaultRecord.address;
            const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

            // console.log('   - vault originated: ' + vaultAddress);
            // console.log('   - vault id: ' + vaultId);

            // push new vault id to vault set
            eveVaultSet.push(vaultId);

            // ----------------------------------------------------------------------------------------------
            // Deposit Collateral into Vault
            // ----------------------------------------------------------------------------------------------

            const mockFa12DepositAmount      = 15000000;   // 15 Mock FA12 Tokens
            const mockFa2DepositAmount       = 15000000;   // 15 Mock FA12 Tokens

            // ---------------------------------
            // Deposit Mock FA12 Tokens
            // ---------------------------------

            // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
            // reset token allowance
            const resetTokenAllowanceForDeposit = await mockFa12TokenInstance.methods.approve(
                vaultAddress,
                0
            ).send();
            await resetTokenAllowanceForDeposit.confirmation();

            // set new token allowance
            const setNewTokenAllowanceForDeposit = await mockFa12TokenInstance.methods.approve(
                vaultAddress,
                mockFa12DepositAmount
            ).send();
            await setNewTokenAllowanceForDeposit.confirmation();

            // eve deposits mock FA12 tokens into vault
            const eveDepositMockFa12TokenOperation  = await vaultInstance.methods.initVaultAction(
                "deposit",
                mockFa12DepositAmount,                
                "usdt"
            ).send();
            await eveDepositMockFa12TokenOperation.confirmation();

            // ---------------------------------
            // Deposit Mock FA2 Tokens
            // ---------------------------------

            // update operators for vault
            updateOperatorsOperation = await updateOperators(mockFa2TokenInstance, eve.pkh, vaultAddress, tokenId);
            await updateOperatorsOperation.confirmation();

            // eve deposits mock FA2 tokens into vault
            const eveDepositTokenOperation = await vaultInstance.methods.initVaultAction(
                "deposit",
                mockFa2DepositAmount,                 
                "eurl"
            ).send();
            await eveDepositTokenOperation.confirmation();

            // console.log('   - vault collateral deposited');

            // ----------------------------------------------------------------------------------------------
            // Borrow with Vault
            // ----------------------------------------------------------------------------------------------

            // borrow amount - 2 Tez
            const borrowAmount = 2000000;   

            // borrow operation
            const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
            await eveBorrowOperation.confirmation();

            // console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName);

            // get initial XTZ balance for Eve, Treasury and Token Pool Reward Contract
            const eveXtzLedger   = await utils.tezos.tz.getBalance(eve.pkh);
            const eveInitialXtzBalance  = eveXtzLedger.toNumber();

            const treasuryXtzLedger   = await utils.tezos.tz.getBalance(contractDeployments.treasury.address);
            const treasuryInitialXtzBalance  = treasuryXtzLedger.toNumber();

            // get token pool stats
            const afterBorrowloanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const loanTokenDecimals    = afterBorrowloanTokenRecordView.Some.tokenDecimals;
            const interestRateDecimals = (27 - 2); 

            const tokenPoolTotal           = afterBorrowloanTokenRecordView.Some.tokenPoolTotal.toNumber() / (10 ** loanTokenDecimals);
            const totalBorrowed            = afterBorrowloanTokenRecordView.Some.totalBorrowed.toNumber() / (10 ** loanTokenDecimals);
            const optimalUtilisationRate   = Number(afterBorrowloanTokenRecordView.Some.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const utilisationRate          = Number(afterBorrowloanTokenRecordView.Some.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const currentInterestRate      = Number(afterBorrowloanTokenRecordView.Some.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";

            // console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);

            // ----------------------------------------------------------------------------------------------
            // Set Block Levels For Mock Time Test - 1 month
            // ----------------------------------------------------------------------------------------------

            await signerFactory(tezos, bob.sk); // temporarily set to tester to increase block levels

            const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
            const updatedVault                      = await getStorageMapValue(updatedLendingControllerStorage, 'vaults', vaultHandle);
            const lastUpdatedBlockLevel             = updatedVault.lastUpdatedBlockLevel;

            const newBlockLevel = lastUpdatedBlockLevel.toNumber() + oneMonthLevelBlocks;

            const setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(newBlockLevel, 'configMockLevel').send();
            await setMockLevelOperation.confirmation();

            const mockTimeLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedMockLevel = mockTimeLendingControllerStorage.config.mockLevel;

            assert.equal(updatedMockLevel, newBlockLevel);

            // console.log('   - time set to 1 month ahead: ' + lastUpdatedBlockLevel + ' to ' + newBlockLevel);

            // ----------------------------------------------------------------------------------------------
            // Repay partial debt 
            // ----------------------------------------------------------------------------------------------

            // set back to user
            await signerFactory(tezos, eve.sk);  

            // treasury share of interest repaid
            const configInterestTreasuryShare = await lendingControllerStorage.config.interestTreasuryShare;

            // repayment amount
            const repayAmount = 10000; // 0.01 Tez

            // get vault and loan token views, and storage
            const vaultRecordView        = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            const loanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const beforeRepaymentStorage = await lendingControllerInstance.storage();

            const initialVaultLoanOutstandingTotal         = vaultRecordView.Some.loanOutstandingTotal;
            const beforeRepaymentVaultBorrowIndex          = vaultRecordView.Some.borrowIndex;
            const beforeRepaymentVaultOutstandingTotal     = vaultRecordView.Some.loanOutstandingTotal;
            const beforeRepaymentVaultPrincipalTotal       = vaultRecordView.Some.loanPrincipalTotal;
            const beforeRepaymentTokenBorrowIndex          = loanTokenRecordView.Some.borrowIndex;

            initialTokenRewardIndex = loanTokenRecordView.Some.tokenRewardIndex;
            initialTokenPoolTotal   = loanTokenRecordView.Some.tokenPoolTotal;

            // const repayOpParam        = await lendingControllerInstance.methods.repay(vaultId, repayAmount).toTransferParams();
            // const estimate            = await utils.tezos.estimate.transfer(repayOpParam);
            // console.log("REPAY OP ESTIMATION: ", estimate);

            // repay operation
            const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send({ mumav: true, amount : repayAmount});
            await eveRepayOperation.confirmation();

            // console.log('   - repaid: ' + repayAmount + " | type: " + loanTokenName);

            // get updated storage
            const updatedLendingControllerStorageAfterRepay     = await lendingControllerInstance.storage();
            const updatedVaultRecord                            = await getStorageMapValue(updatedLendingControllerStorageAfterRepay, 'vaults', vaultHandle);
            const updatedMockFa2TokenStorage                    = await mockFa2TokenInstance.storage();
            
            // get updated XTZ balance for Eve, Treasury and Token Pool Reward Contract
            const updatedEveXtzLedger                           = await utils.tezos.tz.getBalance(eve.pkh);
            const updatedEveXtzBalance                          = updatedEveXtzLedger.toNumber();

            const updatedTreasuryXtzLedger                      = await utils.tezos.tz.getBalance(contractDeployments.treasury.address);
            const updatedTreasuryXtzBalance                     = updatedTreasuryXtzLedger.toNumber();

            // On-chain views to vault and loan token
            updatedVaultRecordView     = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            updatedLoanTokenRecordView = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});

            const updatedLoanOutstandingTotal             = updatedVaultRecordView.Some.loanOutstandingTotal;
            const updatedLoanPrincipalTotal               = updatedVaultRecordView.Some.loanPrincipalTotal;
            const updatedLoanInterestTotal                = updatedVaultRecordView.Some.loanInterestTotal;

            const afterRepaymentVaultBorrowIndex          = updatedVaultRecordView.Some.borrowIndex;
            const afterRepaymentTokenBorrowIndex          = updatedLoanTokenRecordView.Some.borrowIndex;
            
            const loanOutstandingWithAccruedInterest      = lendingHelper.calculateAccruedInterest(beforeRepaymentVaultOutstandingTotal, beforeRepaymentVaultBorrowIndex, afterRepaymentTokenBorrowIndex);
            const totalInterest                           = loanOutstandingWithAccruedInterest - initialVaultLoanOutstandingTotal.toNumber();
            
            // check if repayAmount covers whole or partial of total interest 
            const totalInterestPaid                       = repayAmount < totalInterest ? repayAmount : totalInterest;
            const remainingInterest                       = totalInterest - repayAmount < 0 ? 0 : totalInterest - repayAmount;
            
            const finalLoanOutstandingTotal               = loanOutstandingWithAccruedInterest - repayAmount;
            const finalLoanPrincipalTotal                 = remainingInterest > 0 ? beforeRepaymentVaultPrincipalTotal : loanOutstandingWithAccruedInterest - repayAmount;
            const finalLoanInterestTotal                  = remainingInterest > 0 ? remainingInterest : 0;

            const interestTreasuryShare                   = lendingHelper.calculateInterestSentToTreasury(configInterestTreasuryShare, totalInterestPaid);
            const interestRewards                         = totalInterestPaid - interestTreasuryShare;

            // calculate new reward index
            updatedTokenRewardIndex                       = updatedLoanTokenRecordView.Some.tokenRewardIndex;
            const calculatedTokenRewardIndex              = lendingHelper.calculateNewRewardIndex(interestRewards, initialTokenPoolTotal, initialTokenRewardIndex);
            assert.equal(almostEqual(updatedTokenRewardIndex.toNumber(), calculatedTokenRewardIndex, 0.00001), true);

            // console.log('   - final vault stats >> outstanding total: ' + finalLoanOutstandingTotal + " | principal total: " + finalLoanPrincipalTotal  + " | interest total: " + finalLoanInterestTotal);
            // console.log('   - interest stats >> total interest: ' + totalInterest + ' | interest paid: ' + totalInterestPaid +' | interest to treasury: ' + interestTreasuryShare + " | interest to reward pool: " + interestRewards);

            assert.equal(updatedLoanOutstandingTotal.toNumber(), finalLoanOutstandingTotal);
            assert.equal(updatedLoanPrincipalTotal.toNumber(), finalLoanPrincipalTotal);
            assert.equal(updatedLoanInterestTotal.toNumber(), finalLoanInterestTotal);
            assert.equal(afterRepaymentVaultBorrowIndex.toNumber(), afterRepaymentTokenBorrowIndex.toNumber());
            
            // account for minor gas cost difference
            assert.equal(almostEqual(updatedEveXtzBalance, eveInitialXtzBalance - repayAmount, 0.0001), true);

            // check treasury fees and interest to token pool reward contract
            assert.equal(updatedTreasuryXtzBalance, treasuryInitialXtzBalance + interestTreasuryShare)

        })



        it('user (eve) can repay debt - TEZ  - mock one month - utilisation rate above optimal utilisation rate - repayment greater than interest', async () => {

            // Conditions: 
            // - vault loan token: tez
            // - mock time: 1 month
            // - token pool interest rate: above optimal utilisation rate
            // - repay amount: greater than interest amount 

            // Summary of steps:
            // 1. Create Vault
            // 2. Deposit collateral into vault (100 Mock FA12 Tokens, 100 Mock FA2 Tokens)
            // 3. Borrow from vault (20 Tez)
            // 4. Set block levels time to 1 year in future
            // 5. Repay partial debt

            // init variables
            await signerFactory(tezos, eve.sk);
            const lendingControllerStorage = await lendingControllerInstance.storage();
            const vaultFactoryStorage      = await vaultFactoryInstance.storage();

            // ----------------------------------------------------------------------------------------------
            // Create Vault
            // ----------------------------------------------------------------------------------------------

            const vaultCounter  = vaultFactoryStorage.vaultCounter;
            const vaultId       = vaultCounter.toNumber();
            const vaultOwner    = eve.pkh;
            const loanTokenName = "tez";
            const vaultName     = "newVault";
            const depositorsConfig      = "any";

            // user (eve) creates a new vault with no tez
            const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
                baker.pkh,              // delegate to
                loanTokenName,          // loan token type
                vaultName,              // vault name
                null,                   // collateral tokens
                depositorsConfig        // depositors config type - any / whitelist
            ).send();
            await userCreatesNewVaultOperation.confirmation();

            const vaultHandle = {
                "id"    : vaultId,
                "owner" : vaultOwner
            };
            const newVaultRecord = await getStorageMapValue(lendingControllerStorage, 'vaults', vaultHandle);
            const vaultAddress   = newVaultRecord.address;
            const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

            // console.log('   - vault originated: ' + vaultAddress);
            // console.log('   - vault id: ' + vaultId);

            // push new vault id to vault set
            eveVaultSet.push(vaultId);

            // ----------------------------------------------------------------------------------------------
            // Deposit Collateral into Vault
            // ----------------------------------------------------------------------------------------------

            const mockFa12DepositAmount      = 15000000;   // 15 Mock FA12 Tokens
            const mockFa2DepositAmount       = 15000000;   // 15 Mock FA12 Tokens

            // ---------------------------------
            // Deposit Mock FA12 Tokens
            // ---------------------------------

            // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
            // reset token allowance
            const resetTokenAllowanceForDeposit = await mockFa12TokenInstance.methods.approve(
                vaultAddress,
                0
            ).send();
            await resetTokenAllowanceForDeposit.confirmation();

            // set new token allowance
            const setNewTokenAllowanceForDeposit = await mockFa12TokenInstance.methods.approve(
                vaultAddress,
                mockFa12DepositAmount
            ).send();
            await setNewTokenAllowanceForDeposit.confirmation();

            // eve deposits mock FA12 tokens into vault
            const eveDepositMockFa12TokenOperation  = await vaultInstance.methods.initVaultAction(
                "deposit",
                mockFa12DepositAmount,                
                "usdt"
            ).send();
            await eveDepositMockFa12TokenOperation.confirmation();

            // ---------------------------------
            // Deposit Mock FA2 Tokens
            // ---------------------------------

            // update operators for vault
            updateOperatorsOperation = await updateOperators(mockFa2TokenInstance, eve.pkh, vaultAddress, tokenId);
            await updateOperatorsOperation.confirmation();

            // eve deposits mock FA2 tokens into vault
            const eveDepositTokenOperation = await vaultInstance.methods.initVaultAction(
                "deposit",
                mockFa2DepositAmount,             
                "eurl"
            ).send();
            await eveDepositTokenOperation.confirmation();

            // console.log('   - vault collateral deposited');

            // ----------------------------------------------------------------------------------------------
            // Borrow with Vault
            // ----------------------------------------------------------------------------------------------

            // borrow amount - 2 Tez
            const borrowAmount = 2000000;   

            // borrow operation
            const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
            await eveBorrowOperation.confirmation();

            // console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName);

            // get initial XTZ balance for Eve, Treasury and Token Pool Reward Contract
            const eveXtzLedger   = await utils.tezos.tz.getBalance(eve.pkh);
            const eveInitialXtzBalance  = eveXtzLedger.toNumber();

            const treasuryXtzLedger   = await utils.tezos.tz.getBalance(contractDeployments.treasury.address);
            const treasuryInitialXtzBalance  = treasuryXtzLedger.toNumber();

            // get token pool stats
            const afterBorrowloanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const loanTokenDecimals    = afterBorrowloanTokenRecordView.Some.tokenDecimals;
            const interestRateDecimals = (27 - 2); 

            const tokenPoolTotal           = afterBorrowloanTokenRecordView.Some.tokenPoolTotal.toNumber() / (10 ** loanTokenDecimals);
            const totalBorrowed            = afterBorrowloanTokenRecordView.Some.totalBorrowed.toNumber() / (10 ** loanTokenDecimals);
            const optimalUtilisationRate   = Number(afterBorrowloanTokenRecordView.Some.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const utilisationRate          = Number(afterBorrowloanTokenRecordView.Some.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const currentInterestRate      = Number(afterBorrowloanTokenRecordView.Some.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";

            // console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);

            // ----------------------------------------------------------------------------------------------
            // Set Block Levels For Mock Time Test - 1 month
            // ----------------------------------------------------------------------------------------------

            await signerFactory(tezos, bob.sk); // temporarily set to tester to increase block levels

            const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
            const updatedVault                      = await getStorageMapValue(updatedLendingControllerStorage, 'vaults', vaultHandle);
            const lastUpdatedBlockLevel             = updatedVault.lastUpdatedBlockLevel;

            const newBlockLevel = lastUpdatedBlockLevel.toNumber() + oneMonthLevelBlocks;

            const setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(newBlockLevel, 'configMockLevel').send();
            await setMockLevelOperation.confirmation();

            const mockTimeLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedMockLevel = mockTimeLendingControllerStorage.config.mockLevel;

            assert.equal(updatedMockLevel, newBlockLevel);

            // console.log('   - time set to 1 month ahead: ' + lastUpdatedBlockLevel + ' to ' + newBlockLevel);

            // ----------------------------------------------------------------------------------------------
            // Repay partial debt 
            // ----------------------------------------------------------------------------------------------

            // set back to user
            await signerFactory(tezos, eve.sk);  

            // treasury share of interest repaid
            const configInterestTreasuryShare = await lendingControllerStorage.config.interestTreasuryShare;

            // repayment amount
            const repayAmount = 500000; // 0.5 Tez

            // get vault and loan token views, and storage
            const vaultRecordView        = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            const loanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const beforeRepaymentStorage = await lendingControllerInstance.storage();

            const initialVaultLoanOutstandingTotal         = vaultRecordView.Some.loanOutstandingTotal;
            const beforeRepaymentVaultBorrowIndex          = vaultRecordView.Some.borrowIndex;
            const beforeRepaymentVaultOutstandingTotal     = vaultRecordView.Some.loanOutstandingTotal;
            const beforeRepaymentVaultPrincipalTotal       = vaultRecordView.Some.loanPrincipalTotal;
            const beforeRepaymentTokenBorrowIndex          = loanTokenRecordView.Some.borrowIndex;

            initialTokenRewardIndex = loanTokenRecordView.Some.tokenRewardIndex;
            initialTokenPoolTotal   = loanTokenRecordView.Some.tokenPoolTotal;

            // const repayOpParam        = await lendingControllerInstance.methods.repay(vaultId, repayAmount).toTransferParams();
            // const estimate            = await utils.tezos.estimate.transfer(repayOpParam);
            // console.log("REPAY OP ESTIMATION: ", estimate);

            // repay operation
            const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send({ mumav: true, amount : repayAmount});
            await eveRepayOperation.confirmation();

            // console.log('   - repaid: ' + repayAmount + " | type: " + loanTokenName);

            // get updated storage
            const updatedLendingControllerStorageAfterRepay     = await lendingControllerInstance.storage();
            const updatedVaultRecord                            = await getStorageMapValue(updatedLendingControllerStorageAfterRepay, 'vaults', vaultHandle);
            const updatedMockFa2TokenStorage                    = await mockFa2TokenInstance.storage();
            
            // get updated XTZ balance for Eve, Treasury and Token Pool Reward Contract
            const updatedEveXtzLedger                           = await utils.tezos.tz.getBalance(eve.pkh);
            const updatedEveXtzBalance                          = updatedEveXtzLedger.toNumber();

            const updatedTreasuryXtzLedger                      = await utils.tezos.tz.getBalance(contractDeployments.treasury.address);
            const updatedTreasuryXtzBalance                     = updatedTreasuryXtzLedger.toNumber();

            // On-chain views to vault and loan token
            updatedVaultRecordView     = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            updatedLoanTokenRecordView = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});

            const updatedLoanOutstandingTotal             = updatedVaultRecordView.Some.loanOutstandingTotal;
            const updatedLoanPrincipalTotal               = updatedVaultRecordView.Some.loanPrincipalTotal;
            const updatedLoanInterestTotal                = updatedVaultRecordView.Some.loanInterestTotal;

            const afterRepaymentVaultBorrowIndex          = updatedVaultRecordView.Some.borrowIndex;
            const afterRepaymentTokenBorrowIndex          = updatedLoanTokenRecordView.Some.borrowIndex;
            
            const loanOutstandingWithAccruedInterest      = lendingHelper.calculateAccruedInterest(beforeRepaymentVaultOutstandingTotal, beforeRepaymentVaultBorrowIndex, afterRepaymentTokenBorrowIndex);
            const totalInterest                           = loanOutstandingWithAccruedInterest - initialVaultLoanOutstandingTotal.toNumber();
            
            // check if repayAmount covers whole or partial of total interest 
            const totalInterestPaid                       = repayAmount < totalInterest ? repayAmount : totalInterest;
            const remainingInterest                       = totalInterest - repayAmount < 0 ? 0 : totalInterest - repayAmount;
            
            const finalLoanOutstandingTotal               = loanOutstandingWithAccruedInterest - repayAmount;
            const finalLoanPrincipalTotal                 = remainingInterest > 0 ? beforeRepaymentVaultPrincipalTotal : loanOutstandingWithAccruedInterest - repayAmount;
            const finalLoanInterestTotal                  = remainingInterest > 0 ? remainingInterest : 0;

            const interestTreasuryShare                   = lendingHelper.calculateInterestSentToTreasury(configInterestTreasuryShare, totalInterestPaid);
            const interestRewards                         = totalInterestPaid - interestTreasuryShare;

            // calculate new reward index
            updatedTokenRewardIndex                       = updatedLoanTokenRecordView.Some.tokenRewardIndex;
            const calculatedTokenRewardIndex              = lendingHelper.calculateNewRewardIndex(interestRewards, initialTokenPoolTotal, initialTokenRewardIndex);
            assert.equal(almostEqual(updatedTokenRewardIndex.toNumber(), calculatedTokenRewardIndex, 0.00001), true);

            // console.log('   - final vault stats >> outstanding total: ' + finalLoanOutstandingTotal + " | principal total: " + finalLoanPrincipalTotal  + " | interest total: " + finalLoanInterestTotal);
            // console.log('   - interest stats >> total interest: ' + totalInterest + ' | interest paid: ' + totalInterestPaid +' | interest to treasury: ' + interestTreasuryShare + " | interest to reward pool: " + interestRewards);

            assert.equal(updatedLoanOutstandingTotal.toNumber(), finalLoanOutstandingTotal);
            assert.equal(updatedLoanPrincipalTotal.toNumber(), finalLoanPrincipalTotal);
            assert.equal(updatedLoanInterestTotal.toNumber(), finalLoanInterestTotal);
            assert.equal(afterRepaymentVaultBorrowIndex.toNumber(), afterRepaymentTokenBorrowIndex.toNumber());
            
            // account for minor gas cost difference
            assert.equal(almostEqual(updatedEveXtzBalance, eveInitialXtzBalance - repayAmount, 0.0001), true);

            // check treasury fees and interest to token pool reward contract
            assert.equal(updatedTreasuryXtzBalance, treasuryInitialXtzBalance + interestTreasuryShare)

        })


        it('user (eve) can repay debt - TEZ  - mock one month - utilisation rate above optimal utilisation rate - repayment less than interest', async () => {

            // Conditions: 
            // - vault loan token: tez
            // - mock time: 1 month
            // - token pool interest rate: above optimal utilisation rate
            // - repay amount: less than interest amount 

            // Summary of steps:
            // 1. Create Vault
            // 2. Deposit collateral into vault (100 Mock FA12 Tokens, 100 Mock FA2 Tokens)
            // 3. Borrow from vault (20 Tez)
            // 4. Set block levels time to 1 year in future
            // 5. Repay partial debt

            // init variables
            await signerFactory(tezos, eve.sk);
            const lendingControllerStorage = await lendingControllerInstance.storage();
            const vaultFactoryStorage      = await vaultFactoryInstance.storage();

            // ----------------------------------------------------------------------------------------------
            // Create Vault
            // ----------------------------------------------------------------------------------------------

            const vaultCounter  = vaultFactoryStorage.vaultCounter;
            const vaultId       = vaultCounter.toNumber();
            const vaultOwner    = eve.pkh;
            const loanTokenName = "tez";
            const vaultName     = "newVault";
            const depositorsConfig      = "any";

            // user (eve) creates a new vault with no tez
            const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
                baker.pkh,              // delegate to
                loanTokenName,          // loan token type
                vaultName,              // vault name
                null,                   // collateral tokens
                depositorsConfig        // depositors config type - any / whitelist
            ).send();
            await userCreatesNewVaultOperation.confirmation();

            const vaultHandle = {
                "id"    : vaultId,
                "owner" : vaultOwner
            };
            const newVaultRecord = await getStorageMapValue(lendingControllerStorage, 'vaults', vaultHandle);
            const vaultAddress   = newVaultRecord.address;
            const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

            // console.log('   - vault originated: ' + vaultAddress);
            // console.log('   - vault id: ' + vaultId);

            // push new vault id to vault set
            eveVaultSet.push(vaultId);

            // ----------------------------------------------------------------------------------------------
            // Deposit Collateral into Vault
            // ----------------------------------------------------------------------------------------------

            const mockFa12DepositAmount      = 15000000;   // 15 Mock FA12 Tokens
            const mockFa2DepositAmount       = 15000000;   // 15 Mock FA12 Tokens

            // ---------------------------------
            // Deposit Mock FA12 Tokens
            // ---------------------------------

            // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
            // reset token allowance
            const resetTokenAllowanceForDeposit = await mockFa12TokenInstance.methods.approve(
                vaultAddress,
                0
            ).send();
            await resetTokenAllowanceForDeposit.confirmation();

            // set new token allowance
            const setNewTokenAllowanceForDeposit = await mockFa12TokenInstance.methods.approve(
                vaultAddress,
                mockFa12DepositAmount
            ).send();
            await setNewTokenAllowanceForDeposit.confirmation();

            // eve deposits mock FA12 tokens into vault
            const eveDepositMockFa12TokenOperation  = await vaultInstance.methods.initVaultAction(
                "deposit",
                mockFa12DepositAmount,               
                "usdt"
            ).send();
            await eveDepositMockFa12TokenOperation.confirmation();

            // ---------------------------------
            // Deposit Mock FA2 Tokens
            // ---------------------------------

            // update operators for vault
            updateOperatorsOperation = await updateOperators(mockFa2TokenInstance, eve.pkh, vaultAddress, tokenId);
            await updateOperatorsOperation.confirmation();

            // eve deposits mock FA2 tokens into vault
            const eveDepositTokenOperation = await vaultInstance.methods.initVaultAction(
                "deposit",
                mockFa2DepositAmount,                  
                "eurl"
            ).send();
            await eveDepositTokenOperation.confirmation();

            // console.log('   - vault collateral deposited');

            // ----------------------------------------------------------------------------------------------
            // Borrow with Vault
            // ----------------------------------------------------------------------------------------------

            // borrow amount - 2 Tez
            const borrowAmount = 2000000;   

            // borrow operation
            const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
            await eveBorrowOperation.confirmation();

            // console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName);

            // get initial XTZ balance for Eve, Treasury and Token Pool Reward Contract
            const eveXtzLedger   = await utils.tezos.tz.getBalance(eve.pkh);
            const eveInitialXtzBalance  = eveXtzLedger.toNumber();

            const treasuryXtzLedger   = await utils.tezos.tz.getBalance(contractDeployments.treasury.address);
            const treasuryInitialXtzBalance  = treasuryXtzLedger.toNumber();

            // get token pool stats
            const afterBorrowloanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const loanTokenDecimals    = afterBorrowloanTokenRecordView.Some.tokenDecimals;
            const interestRateDecimals = (27 - 2); 

            const tokenPoolTotal           = afterBorrowloanTokenRecordView.Some.tokenPoolTotal.toNumber() / (10 ** loanTokenDecimals);
            const totalBorrowed            = afterBorrowloanTokenRecordView.Some.totalBorrowed.toNumber() / (10 ** loanTokenDecimals);
            const optimalUtilisationRate   = Number(afterBorrowloanTokenRecordView.Some.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const utilisationRate          = Number(afterBorrowloanTokenRecordView.Some.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const currentInterestRate      = Number(afterBorrowloanTokenRecordView.Some.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";

            // console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);

            // ----------------------------------------------------------------------------------------------
            // Set Block Levels For Mock Time Test - 1 month
            // ----------------------------------------------------------------------------------------------

            await signerFactory(tezos, bob.sk); // temporarily set to tester to increase block levels

            const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
            const updatedVault                      = await getStorageMapValue(updatedLendingControllerStorage, 'vaults', vaultHandle);
            const lastUpdatedBlockLevel             = updatedVault.lastUpdatedBlockLevel;

            const newBlockLevel = lastUpdatedBlockLevel.toNumber() + oneMonthLevelBlocks;

            const setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(newBlockLevel, 'configMockLevel').send();
            await setMockLevelOperation.confirmation();

            const mockTimeLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedMockLevel = mockTimeLendingControllerStorage.config.mockLevel;

            assert.equal(updatedMockLevel, newBlockLevel);

            // console.log('   - time set to 1 month ahead: ' + lastUpdatedBlockLevel + ' to ' + newBlockLevel);

            // ----------------------------------------------------------------------------------------------
            // Repay partial debt 
            // ----------------------------------------------------------------------------------------------

            // set back to user
            await signerFactory(tezos, eve.sk);  

            // treasury share of interest repaid
            const configInterestTreasuryShare = await lendingControllerStorage.config.interestTreasuryShare;

            // repayment amount
            const repayAmount = 10000; // 0.01 Tez

            // get vault and loan token views, and storage
            const vaultRecordView        = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            const loanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const beforeRepaymentStorage = await lendingControllerInstance.storage();

            const initialVaultLoanOutstandingTotal         = vaultRecordView.Some.loanOutstandingTotal;
            const beforeRepaymentVaultBorrowIndex          = vaultRecordView.Some.borrowIndex;
            const beforeRepaymentVaultOutstandingTotal     = vaultRecordView.Some.loanOutstandingTotal;
            const beforeRepaymentVaultPrincipalTotal       = vaultRecordView.Some.loanPrincipalTotal;
            const beforeRepaymentTokenBorrowIndex          = loanTokenRecordView.Some.borrowIndex;

            initialTokenRewardIndex = loanTokenRecordView.Some.tokenRewardIndex;
            initialTokenPoolTotal   = loanTokenRecordView.Some.tokenPoolTotal;

            // const repayOpParam        = await lendingControllerInstance.methods.repay(vaultId, repayAmount).toTransferParams();
            // const estimate            = await utils.tezos.estimate.transfer(repayOpParam);
            // console.log("REPAY OP ESTIMATION: ", estimate);

            // repay operation
            const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send({ mumav: true, amount : repayAmount});
            await eveRepayOperation.confirmation();

            // console.log('   - repaid: ' + repayAmount + " | type: " + loanTokenName);

            // get updated storage
            const updatedLendingControllerStorageAfterRepay     = await lendingControllerInstance.storage();
            const updatedVaultRecord                            = await getStorageMapValue(updatedLendingControllerStorageAfterRepay, 'vaults', vaultHandle);
            const updatedMockFa2TokenStorage                    = await mockFa2TokenInstance.storage();
            
            // get updated XTZ balance for Eve, Treasury and Token Pool Reward Contract
            const updatedEveXtzLedger                           = await utils.tezos.tz.getBalance(eve.pkh);
            const updatedEveXtzBalance                          = updatedEveXtzLedger.toNumber();

            const updatedTreasuryXtzLedger                      = await utils.tezos.tz.getBalance(contractDeployments.treasury.address);
            const updatedTreasuryXtzBalance                     = updatedTreasuryXtzLedger.toNumber();

            // On-chain views to vault and loan token
            updatedVaultRecordView     = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            updatedLoanTokenRecordView = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});

            const updatedLoanOutstandingTotal             = updatedVaultRecordView.Some.loanOutstandingTotal;
            const updatedLoanPrincipalTotal               = updatedVaultRecordView.Some.loanPrincipalTotal;
            const updatedLoanInterestTotal                = updatedVaultRecordView.Some.loanInterestTotal;

            const afterRepaymentVaultBorrowIndex          = updatedVaultRecordView.Some.borrowIndex;
            const afterRepaymentTokenBorrowIndex          = updatedLoanTokenRecordView.Some.borrowIndex;
            
            const loanOutstandingWithAccruedInterest      = lendingHelper.calculateAccruedInterest(beforeRepaymentVaultOutstandingTotal, beforeRepaymentVaultBorrowIndex, afterRepaymentTokenBorrowIndex);
            const totalInterest                           = loanOutstandingWithAccruedInterest - initialVaultLoanOutstandingTotal.toNumber();
            
            // check if repayAmount covers whole or partial of total interest 
            const totalInterestPaid                       = repayAmount < totalInterest ? repayAmount : totalInterest;
            const remainingInterest                       = totalInterest - repayAmount < 0 ? 0 : totalInterest - repayAmount;
            
            const finalLoanOutstandingTotal               = loanOutstandingWithAccruedInterest - repayAmount;
            const finalLoanPrincipalTotal                 = remainingInterest > 0 ? beforeRepaymentVaultPrincipalTotal : loanOutstandingWithAccruedInterest - repayAmount;
            const finalLoanInterestTotal                  = remainingInterest > 0 ? remainingInterest : 0;

            const interestTreasuryShare                   = lendingHelper.calculateInterestSentToTreasury(configInterestTreasuryShare, totalInterestPaid);
            const interestRewards                         = totalInterestPaid - interestTreasuryShare;

            // calculate new reward index
            updatedTokenRewardIndex                       = updatedLoanTokenRecordView.Some.tokenRewardIndex;
            const calculatedTokenRewardIndex              = lendingHelper.calculateNewRewardIndex(interestRewards, initialTokenPoolTotal, initialTokenRewardIndex);
            assert.equal(almostEqual(updatedTokenRewardIndex.toNumber(), calculatedTokenRewardIndex, 0.00001), true);

            // console.log('   - final vault stats >> outstanding total: ' + finalLoanOutstandingTotal + " | principal total: " + finalLoanPrincipalTotal  + " | interest total: " + finalLoanInterestTotal);
            // console.log('   - interest stats >> total interest: ' + totalInterest + ' | interest paid: ' + totalInterestPaid +' | interest to treasury: ' + interestTreasuryShare + " | interest to reward pool: " + interestRewards);

            assert.equal(updatedLoanOutstandingTotal.toNumber(), finalLoanOutstandingTotal);
            assert.equal(updatedLoanPrincipalTotal.toNumber(), finalLoanPrincipalTotal);
            assert.equal(updatedLoanInterestTotal.toNumber(), finalLoanInterestTotal);
            assert.equal(afterRepaymentVaultBorrowIndex.toNumber(), afterRepaymentTokenBorrowIndex.toNumber());
            
            // account for minor gas cost difference
            assert.equal(almostEqual(updatedEveXtzBalance, eveInitialXtzBalance - repayAmount, 0.0001), true);

            // check treasury fees and interest to token pool reward contract
            assert.equal(updatedTreasuryXtzBalance, treasuryInitialXtzBalance + interestTreasuryShare)

        })


    })


    // describe('reset - repay all loans and remove liquidity', function () {

    //     it('repay all loans', async () => {

    //         await signerFactory(tezos, eve.sk);

    //         for(const vaultId of eveVaultSet) {
    //             try {

    //                 const vaultOwner = eve.pkh;
    //                 const vaultHandle = {
    //                     "id"    : vaultId,
    //                     "owner" : vaultOwner
    //                 };
    
    //                 lendingControllerStorage = await lendingControllerInstance.storage();

    //                 const newVaultRecord = await getStorageMapValue(lendingControllerStorage, 'vaults', vaultHandle);
    //                 const vaultAddress   = newVaultRecord.address;
    //                 const vaultInstance  = await utils.tezos.contract.at(vaultAddress);
    
    //                 let vaultRecordView             = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
    //                 const loanToken                 = vaultRecordView.Some.loanToken;
    //                 let loanOutstandingTotal        = vaultRecordView.Some.loanOutstandingTotal;
    //                 loanOutstandingTotal            = loanOutstandingTotal * 3; // increase amount to cover interest accrued; excess amount will be refunded

    //                 console.log(`vaultId: ${vaultId} | vaultAddress: ${vaultAddress} | loanOutstandingTotal: ${loanOutstandingTotal}`)

    //                 // if loan outstanding total is greater than min repayment amount
    //                 if(loanOutstandingTotal > 10000){
    //                     if(loanToken == "usdt"){

    //                         // Mock FA12 Tokens
    //                         // reset token allowance
    //                         const resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
    //                             lendingControllerAddress,
    //                             0
    //                         ).send();
    //                         await resetTokenAllowance.confirmation();

    //                         // set new token allowance
    //                         const setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
    //                             lendingControllerAddress,
    //                             loanOutstandingTotal
    //                         ).send();
    //                         await setNewTokenAllowance.confirmation();

    //                         // repay operation
    //                         const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, loanOutstandingTotal).send();
    //                         await eveRepayOperation.confirmation();

    //                     } else if(loanToken == "eurl"){

    //                         // update operators for vault
    //                         updateOperatorsOperation = await updateOperators(mockFa2TokenInstance, eve.pkh, vaultAddress, tokenId);
    //                         await updateOperatorsOperation.confirmation();

    //                         // repay operation
    //                         const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, loanOutstandingTotal).send();
    //                         await eveRepayOperation.confirmation();

    //                     } else if(loanToken == "tez"){

    //                         const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, loanOutstandingTotal).send({ mumav: true, amount : loanOutstandingTotal});
    //                         await eveRepayOperation.confirmation();
                
    //                     }
    //                 }

    //                 lendingControllerStorage        = await lendingControllerInstance.storage();
    //                 vaultRecordView                 = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
    //                 const finalLoanOutstandingTotal = vaultRecordView.Some.loanOutstandingTotal;

    //                 assert.equal(finalLoanOutstandingTotal, 0);

    //                 const collateralBalanceLedger   = vaultRecordView.Some.collateralBalanceLedger;
    //                 for (const [collateralName, collateralBalance] of collateralBalanceLedger.entries()) {

    //                     try {
                            
    //                         if(collateralName == "smvk"){

    //                             // vault staked token (e.g. smvk) operation
    //                             const eveVaultWithdrawStakedTokenOperation  = await lendingControllerInstance.methods.vaultWithdrawStakedToken(
    //                                 collateralName,
    //                                 vaultId,                 
    //                                 collateralBalance.toNumber()                            
    //                             ).send();
    //                             await eveVaultWithdrawStakedTokenOperation.confirmation();

    //                         } else {

    //                             const eveWithdrawOperation  = await vaultInstance.methods.initVaultAction(
    //                                 "withdraw",
    //                                 collateralBalance.toNumber(),                 
    //                                 collateralName                            
    //                             ).send();
    //                             await eveWithdrawOperation.confirmation();

    //                         }

    //                     }  catch (error) {
    //                         console.log(`An error occurred while processing collateral ${collateralName}: ${error}`);
    //                     }
    //                 }
    
    //             } catch (error) {
    //                 console.log(`An error occurred while processing vaultId ${vaultId}: ${error}`);
    //             }
    //         }
    //     });

    //     it('remove all liquidity', async () => {

    //         await signerFactory(tezos, eve.sk);
            
    //         lendingControllerStorage = await lendingControllerInstance.storage();

    //         let loanTokenName                         = "usdt";
    //         compoundOperation                         = await mTokenUsdtInstance.methods.compound([eve.pkh]).send();
    //         await compoundOperation.confirmation();
    //         const mTokenUsdtStorage                   = await mTokenUsdtInstance.storage();
    //         const eveMTokenUsdtLedger                 = await getStorageMapValue(mTokenUsdtStorage, 'ledger', eve.pkh);            
    //         const eveMTokenUsdtBalance                = eveMTokenUsdtLedger == undefined ? 0 : eveMTokenUsdtLedger.toNumber();

    //         let loanTokenRecord                       = await getStorageMapValue(lendingControllerStorage, 'loanTokenLedger', loanTokenName);
    //         let loanTotal                             = loanTokenRecord.tokenPoolTotal.toNumber();
    //         let loanTotalRemaining                    = loanTokenRecord.totalRemaining.toNumber();
            
    //         console.log(`eveMTokenUsdtBalance: ${eveMTokenUsdtBalance}`);
    //         console.log(`loanTokenName: ${loanTokenName} | loanTotal: ${loanTotal} | loanTotalRemaining: ${loanTotalRemaining}`);

    //         let removeLiquidityOperation  = await lendingControllerInstance.methods.removeLiquidity(
    //             loanTokenName,
    //             eveMTokenUsdtBalance, 
    //         ).send();
    //         await removeLiquidityOperation.confirmation();



    //         loanTokenName                             = "eurl";
    //         compoundOperation                         = await mTokenEurlInstance.methods.compound([eve.pkh]).send();
    //         await compoundOperation.confirmation();
    //         const mTokenEurlStorage                   = await mTokenEurlInstance.storage();
    //         const eveMTokenEurlLedger                 = await getStorageMapValue(mTokenEurlStorage, 'ledger', eve.pkh);            
    //         const eveMTokenEurlBalance                = eveMTokenEurlLedger == undefined ? 0 : eveMTokenEurlLedger.toNumber();

    //         loanTokenRecord                           = await getStorageMapValue(lendingControllerStorage, 'loanTokenLedger', loanTokenName);
    //         loanTotal                                 = loanTokenRecord.tokenPoolTotal.toNumber();
    //         loanTotalRemaining                        = loanTokenRecord.totalRemaining.toNumber();
            
    //         console.log(`eveMTokenEurlBalance: ${eveMTokenEurlBalance}`);
    //         console.log(`loanTokenName: ${loanTokenName} | loanTotal: ${loanTotal} | loanTotalRemaining: ${loanTotalRemaining}`);

    //         removeLiquidityOperation  = await lendingControllerInstance.methods.removeLiquidity(
    //             loanTokenName,
    //             eveMTokenEurlBalance, 
    //         ).send();
    //         await removeLiquidityOperation.confirmation();



    //         loanTokenName                             = "tez";
    //         compoundOperation                         = await mTokenXtzInstance.methods.compound([eve.pkh]).send();
    //         await compoundOperation.confirmation();
    //         const mTokenXtzStorage                    = await mTokenXtzInstance.storage();
    //         const eveMTokenXtzLedger                  = await getStorageMapValue(mTokenXtzStorage, 'ledger', eve.pkh);            
    //         const eveMTokenXtzBalance                 = eveMTokenXtzLedger == undefined ? 0 : eveMTokenXtzLedger.toNumber();
            
    //         loanTokenRecord                           = await getStorageMapValue(lendingControllerStorage, 'loanTokenLedger', loanTokenName);
    //         loanTotal                                 = loanTokenRecord.tokenPoolTotal.toNumber();
    //         loanTotalRemaining                        = loanTokenRecord.totalRemaining.toNumber();
            
    //         console.log(`eveMTokenXtzBalance: ${eveMTokenXtzBalance}`);
    //         console.log(`loanTokenName: ${loanTokenName} | loanTotal: ${loanTotal} | loanTotalRemaining: ${loanTotalRemaining}`);

    //         removeLiquidityOperation  = await lendingControllerInstance.methods.removeLiquidity(
    //             loanTokenName,
    //             eveMTokenXtzBalance, 
    //         ).send();
    //         await removeLiquidityOperation.confirmation();

    //     })

    // })

});