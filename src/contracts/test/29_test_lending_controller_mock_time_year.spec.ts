import assert from "assert";
import { Utils, zeroAddress } from "./helpers/Utils";
import * as lendingHelper from "./helpers/lendingHelpers"

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
import * as helperFunctions from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("Lending Controller (Mock Time - One Year) tests", async () => {
    
    var utils: Utils
    let tezos

    //  - eve: first vault loan token: mockFa12, second vault loan token: mockFa2, third vault loan token - tez
    //  - mallory: first vault loan token: mockFa12, second vault loan token: mockFa2
    var eveVaultSet : Array<Number>     = []
    var malloryVaultSet : Array<Number> = [] 

    let updateTokenRewardIndexOperation

    let tokenId = 0

    // 20 seconds blocks
    // const oneDayLevelBlocks = 4320
    // const oneMonthLevelBlocks = 129600
    // const oneYearLevelBlocks = 1576800 // 365 days

    // 3 seconds blocks (docker sandbox)
    const oneDayLevelBlocks   = 28800
    const oneMonthLevelBlocks = 864000
    const oneYearLevelBlocks  = 10512000 // 365 days

    const secondsInYears = 31536000
    const fixedPointAccuracy = 10**27
    
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

    let updateOperatorsOperation

    let tokenOracles : {name : string, price : number, priceDecimals : number, tokenDecimals : number}[] = []
    

    before("setup", async () => {

        utils = new Utils();
        await utils.init(bob.sk);
        tezos = utils.tezos
        
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

        lendingControllerInstance               = await utils.tezos.contract.at(contractDeployments.lendingController.address);
        vaultFactoryInstance                    = await utils.tezos.contract.at(contractDeployments.vaultFactory.address);

        doormanStorage                          = await doormanInstance.storage();
        delegationStorage                       = await delegationInstance.storage();
        mvkTokenStorage                         = await mvkTokenInstance.storage();
        treasuryStorage                         = await treasuryInstance.storage();

        mockFa12TokenStorage                    = await mockFa12TokenInstance.storage();
        mockFa2TokenStorage                     = await mockFa2TokenInstance.storage();
        governanceStorage                       = await governanceInstance.storage();
        governanceProxyStorage                  = await governanceInstance.storage();
        lendingControllerStorage                = await lendingControllerInstance.storage();
        vaultFactoryStorage                     = await vaultFactoryInstance.storage();

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

        console.log('-- -- -- -- -- Lending Controller (Mock Time) Tests -- -- -- --')
        console.log('Doorman Contract deployed at:'             , doormanInstance.address);
        console.log('Delegation Contract deployed at:'          , delegationInstance.address);
        console.log('MVK Token Contract deployed at:'           , mvkTokenInstance.address);
        console.log('Lending Treasury Contract deployed at:'    , treasuryInstance.address);

        console.log('Mock FA12 Token Contract deployed at:'     , mockFa12TokenInstance.address);
        console.log('Mock FA2 Token Contract deployed at:'      , mockFa2TokenInstance.address);
        console.log('Governance Contract deployed at:'          , governanceInstance.address);
        console.log('Governance Proxy Contract deployed at:'    , governanceProxyInstance.address);

        console.log('mTokenUsdt - deployed at:'    , mTokenUsdtInstance.address);
        console.log('mTokenEurl - deployed at:'     , mTokenEurlInstance.address);
        console.log('mTokenXtz - deployed at:'                , mTokenXtzInstance.address);

        console.log('Mock Aggregator - USD / Mock FA12 Token - deployed at:'    , mockUsdMockFa12TokenAggregatorInstance.address);
        console.log('Mock Aggregator - USD / Mock FA2 Token - deployed at:'     , mockUsdMockFa2TokenAggregatorInstance.address);
        console.log('Mock Aggregator - USD / XTZ - deployed at:'                , mockUsdXtzAggregatorInstance.address);

        console.log('Lending Controller Mock Time Contract deployed at:'        , lendingControllerInstance.address);

        console.log('Alice address: ' + alice.pkh);
        console.log('Bob address: '   + bob.pkh);
        console.log('Eve address: '   + eve.pkh);

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

                const mTokenContractAddress                = contractDeployments.mTokenUsdt.address;

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
                const checkLoanTokenExists   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

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
    
                } else {

                    lendingControllerStorage  = await lendingControllerInstance.storage();
                    const mockFa12LoanToken   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 
                
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
                await helperFunctions.signerFactory(tezos, bob.sk);

                const setLoanTokenActionType                = "createLoanToken";

                const tokenName                             = "eurl";
                const tokenContractAddress                  = contractDeployments.mavrykFa2Token.address;
                const tokenType                             = "fa2";
                const tokenDecimals                         = 6;

                const oracleAddress                         = contractDeployments.mockUsdMockFa2TokenAggregator.address;

                const mTokenContractAddress                = contractDeployments.mTokenEurl.address;

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

                const checkLoanTokenExists   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

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

                } else {

                    lendingControllerStorage = await lendingControllerInstance.storage();
                    const mockFa2LoanToken   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

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
                await helperFunctions.signerFactory(tezos, bob.sk);

                const setLoanTokenActionType                = "createLoanToken";

                const tokenName                             = "tez";
                const tokenType                             = "tez";
                const tokenDecimals                         = 6;

                const oracleAddress                         = contractDeployments.mockUsdXtzAggregator.address;

                const mTokenContractAddress                = contractDeployments.mTokenXtz.address;

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
                const checkLoanTokenExists   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

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
                await helperFunctions.signerFactory(tezos, alice.sk);
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

        it('admin can set mock FA12 as a collateral token', async () => {

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
                const checkCollateralTokenExists        = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

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
                    const mockFa12CollateralToken   = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 
                
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
                    const mockFa2CollateralToken    = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

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
                    const mockFa2CollateralToken    = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

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


        it('non-admin cannot set admin', async () => {
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
    })




    // 
    // Setup Lending Controller liquidity pools
    //
    describe('%addLiquidity - setup lending controller liquidity for interest rate tests', function () {

        it('user (eve) can add liquidity for mock FA12 token into Lending Controller token pool (100 MockFA12 Tokens)', async () => {
    
            // init variables
            await helperFunctions.signerFactory(tezos, eve.sk);
            const loanTokenName = "usdt";
            const liquidityAmount = 100000000; // 100 Mock FA12 Tokens

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
                liquidityAmount, 
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

        });

        it('user (eve) can add liquidity for mock FA2 token into Lending Controller token pool (100 MockFA2 Tokens)', async () => {
    
            // init variables
            await helperFunctions.signerFactory(tezos, eve.sk);
            const loanTokenName = "eurl";
            const liquidityAmount = 100000000; // 100 Mock FA2 Tokens

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
                liquidityAmount, 
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


        it('user (eve) can add liquidity for tez into Lending Controller token pool (100 XTZ)', async () => {
    
            // init variables
            await helperFunctions.signerFactory(tezos, eve.sk);
            const loanTokenName = "tez";
            const liquidityAmount = 100000000; // 100 XTZ

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
            const eveAddLiquidityOperation  = await lendingControllerInstance.methods.addLiquidity(
                loanTokenName,
                liquidityAmount, 
            ).send({ mutez : true, amount: liquidityAmount });
            await eveAddLiquidityOperation.confirmation();

            // get updated storages
            const updatedLendingControllerStorage  = await lendingControllerInstance.storage();
            const updatedMXtzTokenStorage     = await mTokenXtzInstance.storage();

            // check new balance for loan token pool total
            const updatedLoanTokenRecord           = await updatedLendingControllerStorage.loanTokenLedger.get(loanTokenName);
            assert.equal(updatedLoanTokenRecord.tokenPoolTotal, lendingControllerInitialTokenPoolTotal + liquidityAmount);

            // check Lending Controller's XTZ Balance
            const lendingControllerXtzBalance           = await utils.tezos.tz.getBalance(contractDeployments.lendingController.address);
            assert.equal(lendingControllerXtzBalance, lendingControllerInitialXtzBalance + liquidityAmount);

            // check Eve's mTokenXtz balance
            const updatedEveMXtzTokenLedger        = await updatedMXtzTokenStorage.ledger.get(eve.pkh);            
            assert.equal(updatedEveMXtzTokenLedger, eveInitialMXtzTokenBalance + liquidityAmount);        

            // check Eve's XTZ Balance and account for gas cost in transaction with almostEqual
            const eveXtzBalance = await utils.tezos.tz.getBalance(eve.pkh);
            assert.equal(helperFunctions.almostEqual(eveXtzBalance, eveInitialXtzBalance - liquidityAmount, 0.0001), true)

        });
    
    })

    
    // 
    // Test: repay
    //
    describe('%repay mockFA12 Tokens - mock time tests (1 year)', function () {

        it('user (eve) can repay debt - Mock FA12 Token  - mock one year - utilisation rate below optimal utilisation rate - repayment greater than interest', async () => {

            // Conditions: 
            // - vault loan token: mock FA12 tokens
            // - mock time: 1 year
            // - token pool interest rate: below optimal utilisation rate
            // - repay amount: greater than interest amount 

            // Summary of steps:
            // 1. Create Vault
            // 2. Deposit collateral into vault (100 Mock FA12 Tokens, 100 Mock FA2 Tokens)
            // 3. Borrow from vault (50 Mock FA12 Tokens)
            // 4. Set block levels time to 1 year in future
            // 5. Repay partial debt

            // init variables
            await helperFunctions.signerFactory(tezos, eve.sk);
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
            const newVaultRecord = await lendingControllerStorage.vaults.get(vaultHandle);
            const vaultAddress   = newVaultRecord.address;
            const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

            console.log('   - vault originated: ' + vaultAddress);
            console.log('   - vault id: ' + vaultId);

            // push new vault id to vault set
            eveVaultSet.push(vaultId);

            // ----------------------------------------------------------------------------------------------
            // Deposit Collateral into Vault
            // ----------------------------------------------------------------------------------------------

            const mockFa12DepositAmount      = 150000000;   // 150 Mock FA12 Tokens
            const mockFa2DepositAmount       = 150000000;   // 150 Mock FA12 Tokens

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
            updateOperatorsOperation = await helperFunctions.updateOperators(mockFa2TokenInstance, eve.pkh, vaultAddress, tokenId);
            await updateOperatorsOperation.confirmation();

            // eve deposits mock FA2 tokens into vault
            const eveDepositTokenOperation = await vaultInstance.methods.initVaultAction(
                "deposit",
                mockFa2DepositAmount,    
                "eurl"
            ).send();
            await eveDepositTokenOperation.confirmation();

            console.log('   - vault collateral deposited');

            // ----------------------------------------------------------------------------------------------
            // Borrow with Vault
            // ----------------------------------------------------------------------------------------------

            // borrow amount - 20 Mock FA12 Tokens
            const borrowAmount = 20000000;   

            // borrow operation
            const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
            await eveBorrowOperation.confirmation();

            console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName);

            // get initial Mock FA12 Token balance for Eve, Treasury and Token Pool Reward Contract
            const eveMockFa12Ledger                 = await mockFa12TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMockFa12TokenBalance    = eveMockFa12Ledger == undefined ? 0 : eveMockFa12Ledger.balance.toNumber();

            const treasuryMockFa12Ledger                = await mockFa12TokenStorage.ledger.get(contractDeployments.treasury.address);            
            const treasuryInitialMockFa12TokenBalance   = treasuryMockFa12Ledger == undefined ? 0 : treasuryMockFa12Ledger.balance.toNumber();

            // get token pool stats
            const afterBorrowloanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const loanTokenDecimals    = afterBorrowloanTokenRecordView.tokenDecimals;
            const interestRateDecimals = (27 - 2); 

            const tokenPoolTotal           = afterBorrowloanTokenRecordView.tokenPoolTotal.toNumber() / (10 ** loanTokenDecimals);
            const totalBorrowed            = afterBorrowloanTokenRecordView.totalBorrowed.toNumber() / (10 ** loanTokenDecimals);
            const optimalUtilisationRate   = Number(afterBorrowloanTokenRecordView.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const utilisationRate          = Number(afterBorrowloanTokenRecordView.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const currentInterestRate      = Number(afterBorrowloanTokenRecordView.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";

            console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);

            // ----------------------------------------------------------------------------------------------
            // Set Block Levels For Mock Time Test - 1 year
            // ----------------------------------------------------------------------------------------------

            await helperFunctions.signerFactory(tezos, bob.sk); // temporarily set to tester to increase block levels

            const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
            const updatedVault                      = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const lastUpdatedBlockLevel             = updatedVault.lastUpdatedBlockLevel;

            const newBlockLevel = lastUpdatedBlockLevel.toNumber() + oneYearLevelBlocks;

            const setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(newBlockLevel, 'configMockLevel').send();
            await setMockLevelOperation.confirmation();

            const mockTimeLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedMockLevel = mockTimeLendingControllerStorage.config.mockLevel;

            assert.equal(updatedMockLevel, newBlockLevel);

            console.log('   - time set to 1 year ahead: ' + lastUpdatedBlockLevel + ' to ' + newBlockLevel);

            // ----------------------------------------------------------------------------------------------
            // Repay partial debt 
            // ----------------------------------------------------------------------------------------------

            // set back to user
            await helperFunctions.signerFactory(tezos, eve.sk);  

            // treasury share of interest repaid
            const configInterestTreasuryShare = await lendingControllerStorage.config.interestTreasuryShare;

            // repayment amount
            const repayAmount = 500000; // 0.5 Mock FA12 Tokens

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

            // get vault and loan token views, and storage
            const vaultRecordView        = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            const loanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const beforeRepaymentStorage = await lendingControllerInstance.storage();

            const initialVaultLoanOutstandingTotal         = vaultRecordView.loanOutstandingTotal;
            const beforeRepaymentVaultBorrowIndex          = vaultRecordView.borrowIndex;
            const beforeRepaymentVaultOutstandingTotal     = vaultRecordView.loanOutstandingTotal;
            const beforeRepaymentVaultPrincipalTotal       = vaultRecordView.loanPrincipalTotal;
            const beforeRepaymentTokenBorrowIndex          = loanTokenRecordView.borrowIndex;

            // const repayOpParam        = await lendingControllerInstance.methods.repay(vaultId, repayAmount).toTransferParams();
            // const estimate            = await utils.tezos.estimate.transfer(repayOpParam);
            // console.log("REPAY OP ESTIMATION: ", estimate);

            // repay operation
            const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send();
            await eveRepayOperation.confirmation();

            console.log('   - repaid: ' + repayAmount + " | type: " + loanTokenName);

            // get updated storage
            const updatedLendingControllerStorageAfterRepay     = await lendingControllerInstance.storage();
            const updatedVaultRecord                            = await updatedLendingControllerStorageAfterRepay.vaults.get(vaultHandle);
            const updatedMockFa12TokenStorage                   = await mockFa12TokenInstance.storage();
            
            // get updated Mock FA12 Token balance for Eve, Treasury and Token Pool Reward Contract
            const updatedEveMockFa12Ledger                      = await updatedMockFa12TokenStorage.ledger.get(eve.pkh);            
            const updatedEveMockFa12TokenBalance                = updatedEveMockFa12Ledger == undefined ? 0 : updatedEveMockFa12Ledger.balance.toNumber();

            const updatedTreasuryMockFa12Ledger                 = await updatedMockFa12TokenStorage.ledger.get(contractDeployments.treasury.address);            
            const updatedTreasuryMockFa12TokenBalance           = updatedTreasuryMockFa12Ledger == undefined ? 0 : updatedTreasuryMockFa12Ledger.balance.toNumber();

            // On-chain views to vault and loan token
            const updatedVaultRecordView     = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            const updatedLoanTokenRecordView = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});

            const updatedLoanOutstandingTotal             = updatedVaultRecordView.loanOutstandingTotal;
            const updatedLoanPrincipalTotal               = updatedVaultRecordView.loanPrincipalTotal;
            const updatedLoanInterestTotal                = updatedVaultRecordView.loanInterestTotal;

            const afterRepaymentVaultBorrowIndex          = updatedVaultRecordView.borrowIndex;
            const afterRepaymentTokenBorrowIndex          = updatedLoanTokenRecordView.borrowIndex;
            
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

            console.log('   - final vault stats >> outstanding total: ' + finalLoanOutstandingTotal + " | principal total: " + finalLoanPrincipalTotal  + " | interest total: " + finalLoanInterestTotal);
            console.log('   - interest stats >> total interest: ' + totalInterest + ' | interest paid: ' + totalInterestPaid +' | interest to treasury: ' + interestTreasuryShare + " | interest to reward pool: " + interestRewards);

            assert.equal(helperFunctions.almostEqual(updatedLoanOutstandingTotal, finalLoanOutstandingTotal, 0.0001), true);
            assert.equal(helperFunctions.almostEqual(updatedLoanPrincipalTotal, finalLoanPrincipalTotal, 0.0001), true);
            assert.equal(helperFunctions.almostEqual(updatedLoanInterestTotal.toNumber(), finalLoanInterestTotal, 0.0001), true);
            assert.equal(afterRepaymentVaultBorrowIndex.toNumber(), afterRepaymentTokenBorrowIndex.toNumber());
            assert.equal(updatedEveMockFa12TokenBalance, eveInitialMockFa12TokenBalance - repayAmount);

            // check treasury fees and interest to token pool reward contract
            assert.equal(helperFunctions.almostEqual(updatedTreasuryMockFa12TokenBalance, treasuryInitialMockFa12TokenBalance + interestTreasuryShare, 0.0001), true);

        })



        it('user (eve) can repay debt - Mock FA12 Token  - mock one year - utilisation rate below optimal utilisation rate - repayment less than interest', async () => {

            // Conditions: 
            // - vault loan token: mock FA12 tokens
            // - mock time: 1 year
            // - token pool interest rate: below optimal utilisation rate
            // - repay amount: less than interest amount

            // Summary of steps:
            // 1. Create Vault
            // 2. Deposit collateral into vault (100 Mock FA12 Tokens, 100 Mock FA2 Tokens)
            // 3. Borrow from vault (50 Mock FA12 Tokens)
            // 4. Set block levels time to 1 year in future
            // 5. Repay partial debt

            // init variables
            await helperFunctions.signerFactory(tezos, eve.sk);
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
            const newVaultRecord = await lendingControllerStorage.vaults.get(vaultHandle);
            const vaultAddress   = newVaultRecord.address;
            const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

            console.log('   - vault originated: ' + vaultAddress);
            console.log('   - vault id: ' + vaultId);

            // push new vault id to vault set
            eveVaultSet.push(vaultId);

            // ----------------------------------------------------------------------------------------------
            // Deposit Collateral into Vault
            // ----------------------------------------------------------------------------------------------

            const mockFa12DepositAmount      = 150000000;   // 150 Mock FA12 Tokens
            const mockFa2DepositAmount       = 150000000;   // 150 Mock FA12 Tokens

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
            updateOperatorsOperation = await helperFunctions.updateOperators(mockFa2TokenInstance, eve.pkh, vaultAddress, tokenId);
            await updateOperatorsOperation.confirmation();

            // eve deposits mock FA2 tokens into vault
            const eveDepositTokenOperation  = await vaultInstance.methods.initVaultAction(
                "deposit",
                mockFa2DepositAmount,      
                "eurl"
            ).send();
            await eveDepositTokenOperation.confirmation();

            console.log('   - vault collateral deposited');

            // ----------------------------------------------------------------------------------------------
            // Borrow with Vault
            // ----------------------------------------------------------------------------------------------

            // borrow amount - 20 Mock FA12 Tokens
            const borrowAmount = 20000000;   

            // borrow operation
            const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
            await eveBorrowOperation.confirmation();

            console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName);

            // get initial Mock FA12 Token balance for Eve, Treasury and Token Pool Reward Contract
            const eveMockFa12Ledger                 = await mockFa12TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMockFa12TokenBalance    = eveMockFa12Ledger == undefined ? 0 : eveMockFa12Ledger.balance.toNumber();

            const treasuryMockFa12Ledger                = await mockFa12TokenStorage.ledger.get(contractDeployments.treasury.address);            
            const treasuryInitialMockFa12TokenBalance   = treasuryMockFa12Ledger == undefined ? 0 : treasuryMockFa12Ledger.balance.toNumber();

            // get token pool stats
            const afterBorrowloanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const loanTokenDecimals    = afterBorrowloanTokenRecordView.tokenDecimals;
            const interestRateDecimals = (27 - 2); 

            const tokenPoolTotal           = afterBorrowloanTokenRecordView.tokenPoolTotal.toNumber() / (10 ** loanTokenDecimals);
            const totalBorrowed            = afterBorrowloanTokenRecordView.totalBorrowed.toNumber() / (10 ** loanTokenDecimals);
            const optimalUtilisationRate   = Number(afterBorrowloanTokenRecordView.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const utilisationRate          = Number(afterBorrowloanTokenRecordView.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const currentInterestRate      = Number(afterBorrowloanTokenRecordView.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";

            console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);

            // ----------------------------------------------------------------------------------------------
            // Set Block Levels For Mock Time Test - 1 year
            // ----------------------------------------------------------------------------------------------

            await helperFunctions.signerFactory(tezos, bob.sk); // temporarily set to tester to increase block levels

            const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
            const updatedVault                      = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const lastUpdatedBlockLevel             = updatedVault.lastUpdatedBlockLevel;

            const newBlockLevel = lastUpdatedBlockLevel.toNumber() + oneYearLevelBlocks;

            const setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(newBlockLevel, 'configMockLevel').send();
            await setMockLevelOperation.confirmation();

            const mockTimeLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedMockLevel = mockTimeLendingControllerStorage.config.mockLevel;

            assert.equal(updatedMockLevel, newBlockLevel);

            console.log('   - time set to 1 year ahead: ' + lastUpdatedBlockLevel + ' to ' + newBlockLevel);

            // ----------------------------------------------------------------------------------------------
            // Repay partial debt 
            // ----------------------------------------------------------------------------------------------

            // set back to user
            await helperFunctions.signerFactory(tezos, eve.sk);  

            // treasury share of interest repaid
            const configInterestTreasuryShare = await lendingControllerStorage.config.interestTreasuryShare;

            // repayment amount
            const repayAmount = 10000; // 0.01 Mock FA12 Tokens

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

            // get vault and loan token views, and storage
            const vaultRecordView        = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            const loanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const beforeRepaymentStorage = await lendingControllerInstance.storage();

            const initialVaultLoanOutstandingTotal         = vaultRecordView.loanOutstandingTotal;
            const beforeRepaymentVaultBorrowIndex          = vaultRecordView.borrowIndex;
            const beforeRepaymentVaultOutstandingTotal     = vaultRecordView.loanOutstandingTotal;
            const beforeRepaymentVaultPrincipalTotal       = vaultRecordView.loanPrincipalTotal;
            const beforeRepaymentTokenBorrowIndex          = loanTokenRecordView.borrowIndex;

            // const repayOpParam        = await lendingControllerInstance.methods.repay(vaultId, repayAmount).toTransferParams();
            // const estimate            = await utils.tezos.estimate.transfer(repayOpParam);
            // console.log("REPAY OP ESTIMATION: ", estimate);

            // repay operation
            const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send();
            await eveRepayOperation.confirmation();

            console.log('   - repaid: ' + repayAmount + " | type: " + loanTokenName);

            // get updated storage
            const updatedLendingControllerStorageAfterRepay     = await lendingControllerInstance.storage();
            const updatedVaultRecord                            = await updatedLendingControllerStorageAfterRepay.vaults.get(vaultHandle);
            const updatedMockFa12TokenStorage                   = await mockFa12TokenInstance.storage();
            
            // get updated Mock FA12 Token balance for Eve, Treasury and Token Pool Reward Contract
            const updatedEveMockFa12Ledger                      = await updatedMockFa12TokenStorage.ledger.get(eve.pkh);            
            const updatedEveMockFa12TokenBalance                = updatedEveMockFa12Ledger == undefined ? 0 : updatedEveMockFa12Ledger.balance.toNumber();

            const updatedTreasuryMockFa12Ledger                 = await updatedMockFa12TokenStorage.ledger.get(contractDeployments.treasury.address);            
            const updatedTreasuryMockFa12TokenBalance           = updatedTreasuryMockFa12Ledger == undefined ? 0 : updatedTreasuryMockFa12Ledger.balance.toNumber();

            // On-chain views to vault and loan token
            const updatedVaultRecordView = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            const updatedLoanTokenRecordView = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            
            const updatedLoanOutstandingTotal             = updatedVaultRecordView.loanOutstandingTotal;
            const updatedLoanPrincipalTotal               = updatedVaultRecordView.loanPrincipalTotal;
            const updatedLoanInterestTotal                = updatedVaultRecordView.loanInterestTotal;

            const afterRepaymentVaultBorrowIndex          = updatedVaultRecordView.borrowIndex;
            const afterRepaymentTokenBorrowIndex          = updatedLoanTokenRecordView.borrowIndex;
            
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

            console.log('   - final vault stats >> outstanding total: ' + finalLoanOutstandingTotal + " | principal total: " + finalLoanPrincipalTotal  + " | interest total: " + finalLoanInterestTotal);
            console.log('   - interest stats >> total interest: ' + totalInterest + ' | interest paid: ' + totalInterestPaid +' | interest to treasury: ' + interestTreasuryShare + " | interest to reward pool: " + interestRewards);

            assert.equal(helperFunctions.almostEqual(updatedLoanOutstandingTotal, finalLoanOutstandingTotal, 0.0001), true);
            assert.equal(helperFunctions.almostEqual(updatedLoanPrincipalTotal, finalLoanPrincipalTotal, 0.0001), true);
            assert.equal(helperFunctions.almostEqual(updatedLoanInterestTotal.toNumber(), finalLoanInterestTotal, 0.0001), true);
            assert.equal(afterRepaymentVaultBorrowIndex.toNumber(), afterRepaymentTokenBorrowIndex.toNumber());
            assert.equal(updatedEveMockFa12TokenBalance, eveInitialMockFa12TokenBalance - repayAmount);

            // check treasury fees and interest to token pool reward contract
            assert.equal(helperFunctions.almostEqual(updatedTreasuryMockFa12TokenBalance, treasuryInitialMockFa12TokenBalance + interestTreasuryShare, 0.0001), true);

        })


        it('user (eve) can repay debt - Mock FA12 Token  - mock one year - utilisation rate above optimal utilisation rate - repayment greater than interest', async () => {

            // Conditions: 
            // - vault loan token: mock FA12 tokens
            // - mock time: 1 year
            // - token pool interest rate: above optimal utilisation rate
            // - repay amount: greater than interest amount

            // Summary of steps:
            // 1. Create Vault
            // 2. Deposit collateral into vault (100 Mock FA12 Tokens, 100 Mock FA2 Tokens)
            // 3. Borrow from vault (50 Mock FA12 Tokens)
            // 4. Set block levels time to 1 year in future
            // 5. Repay partial debt

            // init variables
            await helperFunctions.signerFactory(tezos, eve.sk);
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
            const newVaultRecord = await lendingControllerStorage.vaults.get(vaultHandle);
            const vaultAddress   = newVaultRecord.address;
            const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

            console.log('   - vault originated: ' + vaultAddress);
            console.log('   - vault id: ' + vaultId);

            // push new vault id to vault set
            eveVaultSet.push(vaultId);

            // ----------------------------------------------------------------------------------------------
            // Deposit Collateral into Vault
            // ----------------------------------------------------------------------------------------------

            const mockFa12DepositAmount      = 150000000;   // 150 Mock FA12 Tokens
            const mockFa2DepositAmount       = 150000000;   // 150 Mock FA12 Tokens

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
            updateOperatorsOperation = await helperFunctions.updateOperators(mockFa2TokenInstance, eve.pkh, vaultAddress, tokenId);
            await updateOperatorsOperation.confirmation();

            // eve deposits mock FA2 tokens into vault
            const eveDepositTokenOperation  = await vaultInstance.methods.initVaultAction(
                "deposit",
                mockFa2DepositAmount,   
                "eurl"
            ).send();
            await eveDepositTokenOperation.confirmation();

            console.log('   - vault collateral deposited');

            // ----------------------------------------------------------------------------------------------
            // Borrow with Vault
            // ----------------------------------------------------------------------------------------------

            // borrow amount - 20 Mock FA12 Tokens
            const borrowAmount = 20000000;   

            // borrow operation
            const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
            await eveBorrowOperation.confirmation();

            console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName);

            // get initial Mock FA12 Token balance for Eve, Treasury and Token Pool Reward Contract
            const eveMockFa12Ledger                 = await mockFa12TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMockFa12TokenBalance    = eveMockFa12Ledger == undefined ? 0 : eveMockFa12Ledger.balance.toNumber();

            const treasuryMockFa12Ledger                = await mockFa12TokenStorage.ledger.get(contractDeployments.treasury.address);            
            const treasuryInitialMockFa12TokenBalance   = treasuryMockFa12Ledger == undefined ? 0 : treasuryMockFa12Ledger.balance.toNumber();

            // get token pool stats
            const afterBorrowloanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const loanTokenDecimals    = afterBorrowloanTokenRecordView.tokenDecimals;
            const interestRateDecimals = (27 - 2); 

            const tokenPoolTotal           = afterBorrowloanTokenRecordView.tokenPoolTotal.toNumber() / (10 ** loanTokenDecimals);
            const totalBorrowed            = afterBorrowloanTokenRecordView.totalBorrowed.toNumber() / (10 ** loanTokenDecimals);
            const optimalUtilisationRate   = Number(afterBorrowloanTokenRecordView.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const utilisationRate          = Number(afterBorrowloanTokenRecordView.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const currentInterestRate      = Number(afterBorrowloanTokenRecordView.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";

            console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);

            // ----------------------------------------------------------------------------------------------
            // Set Block Levels For Mock Time Test - 1 year
            // ----------------------------------------------------------------------------------------------

            await helperFunctions.signerFactory(tezos, bob.sk); // temporarily set to tester to increase block levels

            const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
            const updatedVault                      = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const lastUpdatedBlockLevel             = updatedVault.lastUpdatedBlockLevel;

            const newBlockLevel = lastUpdatedBlockLevel.toNumber() + oneYearLevelBlocks;

            const setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(newBlockLevel, 'configMockLevel').send();
            await setMockLevelOperation.confirmation();

            const mockTimeLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedMockLevel = mockTimeLendingControllerStorage.config.mockLevel;

            assert.equal(updatedMockLevel, newBlockLevel);

            console.log('   - time set to 1 year ahead: ' + lastUpdatedBlockLevel + ' to ' + newBlockLevel);

            // ----------------------------------------------------------------------------------------------
            // Repay partial debt 
            // ----------------------------------------------------------------------------------------------

            // set back to user
            await helperFunctions.signerFactory(tezos, eve.sk);  

            // treasury share of interest repaid
            const configInterestTreasuryShare = await lendingControllerStorage.config.interestTreasuryShare;

            // repayment amount
            const repayAmount = 500000; // 0.5 Mock FA12 Tokens

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

            // get vault and loan token views, and storage
            const vaultRecordView        = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            const loanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const beforeRepaymentStorage = await lendingControllerInstance.storage();

            const initialVaultLoanOutstandingTotal         = vaultRecordView.loanOutstandingTotal;
            const beforeRepaymentVaultBorrowIndex          = vaultRecordView.borrowIndex;
            const beforeRepaymentVaultOutstandingTotal     = vaultRecordView.loanOutstandingTotal;
            const beforeRepaymentVaultPrincipalTotal       = vaultRecordView.loanPrincipalTotal;
            const beforeRepaymentTokenBorrowIndex          = loanTokenRecordView.borrowIndex;

            // const repayOpParam        = await lendingControllerInstance.methods.repay(vaultId, repayAmount).toTransferParams();
            // const estimate              = await utils.tezos.estimate.transfer(repayOpParam);
            // console.log("REPAY OP ESTIMATION: ", estimate);

            // repay operation
            const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send();
            await eveRepayOperation.confirmation();

            console.log('   - repaid: ' + repayAmount + " | type: " + loanTokenName);

            // get updated storage
            const updatedLendingControllerStorageAfterRepay     = await lendingControllerInstance.storage();
            const updatedVaultRecord                            = await updatedLendingControllerStorageAfterRepay.vaults.get(vaultHandle);
            const updatedMockFa12TokenStorage                   = await mockFa12TokenInstance.storage();
            
            // get updated Mock FA12 Token balance for Eve, Treasury and Token Pool Reward Contract
            const updatedEveMockFa12Ledger                      = await updatedMockFa12TokenStorage.ledger.get(eve.pkh);            
            const updatedEveMockFa12TokenBalance                = updatedEveMockFa12Ledger == undefined ? 0 : updatedEveMockFa12Ledger.balance.toNumber();

            const updatedTreasuryMockFa12Ledger                 = await updatedMockFa12TokenStorage.ledger.get(contractDeployments.treasury.address);            
            const updatedTreasuryMockFa12TokenBalance           = updatedTreasuryMockFa12Ledger == undefined ? 0 : updatedTreasuryMockFa12Ledger.balance.toNumber();

            // On-chain views to vault and loan token
            const updatedVaultRecordView     = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            const updatedLoanTokenRecordView = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            
            const updatedLoanOutstandingTotal             = updatedVaultRecordView.loanOutstandingTotal;
            const updatedLoanPrincipalTotal               = updatedVaultRecordView.loanPrincipalTotal;
            const updatedLoanInterestTotal                = updatedVaultRecordView.loanInterestTotal;

            const afterRepaymentVaultBorrowIndex          = updatedVaultRecordView.borrowIndex;
            const afterRepaymentTokenBorrowIndex          = updatedLoanTokenRecordView.borrowIndex;
            
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

            console.log('   - final vault stats >> outstanding total: ' + finalLoanOutstandingTotal + " | principal total: " + finalLoanPrincipalTotal  + " | interest total: " + finalLoanInterestTotal);
            console.log('   - interest stats >> total interest: ' + totalInterest + ' | interest paid: ' + totalInterestPaid +' | interest to treasury: ' + interestTreasuryShare + " | interest to reward pool: " + interestRewards);

            assert.equal(helperFunctions.almostEqual(updatedLoanOutstandingTotal, finalLoanOutstandingTotal, 0.0001), true);
            assert.equal(helperFunctions.almostEqual(updatedLoanPrincipalTotal, finalLoanPrincipalTotal, 0.0001), true);
            assert.equal(helperFunctions.almostEqual(updatedLoanInterestTotal.toNumber(), finalLoanInterestTotal, 0.0001), true);
            assert.equal(afterRepaymentVaultBorrowIndex.toNumber(), afterRepaymentTokenBorrowIndex.toNumber());
            assert.equal(updatedEveMockFa12TokenBalance, eveInitialMockFa12TokenBalance - repayAmount);

            // check treasury fees and interest to token pool reward contract
            assert.equal(helperFunctions.almostEqual(updatedTreasuryMockFa12TokenBalance, treasuryInitialMockFa12TokenBalance + interestTreasuryShare, 0.0001), true);

        })



        it('user (eve) can repay debt - Mock FA12 Token  - mock one year - utilisation rate above optimal utilisation rate - repayment less than interest', async () => {

            // Conditions: 
            // - vault loan token: mock FA12 tokens
            // - mock time: 1 year
            // - token pool interest rate: above optimal utilisation rate
            // - repay amount: less than interest amount

            // Summary of steps:
            // 1. Create Vault
            // 2. Deposit collateral into vault (100 Mock FA12 Tokens, 100 Mock FA2 Tokens)
            // 3. Borrow from vault (50 Mock FA12 Tokens)
            // 4. Set block levels time to 1 year in future
            // 5. Repay partial debt

            // init variables
            await helperFunctions.signerFactory(tezos, eve.sk);
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
            const newVaultRecord = await lendingControllerStorage.vaults.get(vaultHandle);
            const vaultAddress   = newVaultRecord.address;
            const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

            console.log('   - vault originated: ' + vaultAddress);
            console.log('   - vault id: ' + vaultId);

            // push new vault id to vault set
            eveVaultSet.push(vaultId);

            // ----------------------------------------------------------------------------------------------
            // Deposit Collateral into Vault
            // ----------------------------------------------------------------------------------------------

            const mockFa12DepositAmount      = 150000000;   // 150 Mock FA12 Tokens
            const mockFa2DepositAmount       = 150000000;   // 150 Mock FA12 Tokens

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
            updateOperatorsOperation = await helperFunctions.updateOperators(mockFa2TokenInstance, eve.pkh, vaultAddress, tokenId);
            await updateOperatorsOperation.confirmation();

            // eve deposits mock FA2 tokens into vault
            const eveDepositTokenOperation  = await vaultInstance.methods.initVaultAction(
                "deposit",
                mockFa2DepositAmount,  
                "eurl"
            ).send();
            await eveDepositTokenOperation.confirmation();

            console.log('   - vault collateral deposited');

            // ----------------------------------------------------------------------------------------------
            // Borrow with Vault
            // ----------------------------------------------------------------------------------------------

            // borrow amount - 20 Mock FA12 Tokens
            const borrowAmount = 20000000;   

            // borrow operation
            const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
            await eveBorrowOperation.confirmation();

            // get initial Mock FA12 Token balance for Eve, Treasury and Token Pool Reward Contract
            const eveMockFa12Ledger                 = await mockFa12TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMockFa12TokenBalance    = eveMockFa12Ledger == undefined ? 0 : eveMockFa12Ledger.balance.toNumber();

            const treasuryMockFa12Ledger                = await mockFa12TokenStorage.ledger.get(contractDeployments.treasury.address);            
            const treasuryInitialMockFa12TokenBalance   = treasuryMockFa12Ledger == undefined ? 0 : treasuryMockFa12Ledger.balance.toNumber();

            // get token pool stats
            const afterBorrowloanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const loanTokenDecimals    = afterBorrowloanTokenRecordView.tokenDecimals;
            const interestRateDecimals = (27 - 2); 

            const tokenPoolTotal           = afterBorrowloanTokenRecordView.tokenPoolTotal.toNumber() / (10 ** loanTokenDecimals);
            const totalBorrowed            = afterBorrowloanTokenRecordView.totalBorrowed.toNumber() / (10 ** loanTokenDecimals);
            const optimalUtilisationRate   = Number(afterBorrowloanTokenRecordView.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const utilisationRate          = Number(afterBorrowloanTokenRecordView.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const currentInterestRate      = Number(afterBorrowloanTokenRecordView.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";

            console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);

            // ----------------------------------------------------------------------------------------------
            // Set Block Levels For Mock Time Test - 1 year
            // ----------------------------------------------------------------------------------------------

            await helperFunctions.signerFactory(tezos, bob.sk); // temporarily set to tester to increase block levels

            const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
            const updatedVault                      = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const lastUpdatedBlockLevel             = updatedVault.lastUpdatedBlockLevel;

            const newBlockLevel = lastUpdatedBlockLevel.toNumber() + oneYearLevelBlocks;

            const setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(newBlockLevel, 'configMockLevel').send();
            await setMockLevelOperation.confirmation();

            const mockTimeLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedMockLevel = mockTimeLendingControllerStorage.config.mockLevel;

            assert.equal(updatedMockLevel, newBlockLevel);

            console.log('   - time set to 1 year ahead: ' + lastUpdatedBlockLevel + ' to ' + newBlockLevel);

            // ----------------------------------------------------------------------------------------------
            // Repay partial debt 
            // ----------------------------------------------------------------------------------------------

            // set back to user
            await helperFunctions.signerFactory(tezos, eve.sk);  

            // treasury share of interest repaid
            const configInterestTreasuryShare = await lendingControllerStorage.config.interestTreasuryShare;

            // repayment amount
            const repayAmount = 10000; // 0.01 Mock FA12 Tokens

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

            // get vault and loan token views, and storage
            const vaultRecordView        = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            const loanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const beforeRepaymentStorage = await lendingControllerInstance.storage();

            const initialVaultLoanOutstandingTotal         = vaultRecordView.loanOutstandingTotal;
            const beforeRepaymentVaultBorrowIndex          = vaultRecordView.borrowIndex;
            const beforeRepaymentVaultOutstandingTotal     = vaultRecordView.loanOutstandingTotal;
            const beforeRepaymentVaultPrincipalTotal       = vaultRecordView.loanPrincipalTotal;
            const beforeRepaymentTokenBorrowIndex          = loanTokenRecordView.borrowIndex;

            // const repayOpParam        = await lendingControllerInstance.methods.repay(vaultId, repayAmount).toTransferParams();
            // const estimate              = await utils.tezos.estimate.transfer(repayOpParam);
            // console.log("REPAY OP ESTIMATION: ", estimate);

            // repay operation
            const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send();
            await eveRepayOperation.confirmation();

            console.log('   - repaid: ' + repayAmount + " | type: " + loanTokenName);

            // get updated storage
            const updatedLendingControllerStorageAfterRepay   = await lendingControllerInstance.storage();
            const updatedVaultRecord                          = await updatedLendingControllerStorageAfterRepay.vaults.get(vaultHandle);
            const updatedMockFa12TokenStorage                 = await mockFa12TokenInstance.storage();
            
            // get updated Mock FA12 Token balance for Eve, Treasury and Token Pool Reward Contract
            const updatedEveMockFa12Ledger                      = await updatedMockFa12TokenStorage.ledger.get(eve.pkh);            
            const updatedEveMockFa12TokenBalance                = updatedEveMockFa12Ledger == undefined ? 0 : updatedEveMockFa12Ledger.balance.toNumber();

            const updatedTreasuryMockFa12Ledger                 = await updatedMockFa12TokenStorage.ledger.get(contractDeployments.treasury.address);            
            const updatedTreasuryMockFa12TokenBalance           = updatedTreasuryMockFa12Ledger == undefined ? 0 : updatedTreasuryMockFa12Ledger.balance.toNumber();

            // On-chain views to vault and loan token
            const updatedVaultRecordView     = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            const updatedLoanTokenRecordView = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});

            const updatedLoanOutstandingTotal             = updatedVaultRecordView.loanOutstandingTotal;
            const updatedLoanPrincipalTotal               = updatedVaultRecordView.loanPrincipalTotal;
            const updatedLoanInterestTotal                = updatedVaultRecordView.loanInterestTotal;

            const afterRepaymentVaultBorrowIndex          = updatedVaultRecordView.borrowIndex;
            const afterRepaymentTokenBorrowIndex          = updatedLoanTokenRecordView.borrowIndex;
            
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

            console.log('   - final vault stats >> outstanding total: ' + finalLoanOutstandingTotal + " | principal total: " + finalLoanPrincipalTotal  + " | interest total: " + finalLoanInterestTotal);
            console.log('   - interest stats >> total interest: ' + totalInterest + ' | interest paid: ' + totalInterestPaid +' | interest to treasury: ' + interestTreasuryShare + " | interest to reward pool: " + interestRewards);

            assert.equal(helperFunctions.almostEqual(updatedLoanOutstandingTotal, finalLoanOutstandingTotal, 0.0001), true);
            assert.equal(helperFunctions.almostEqual(updatedLoanPrincipalTotal, finalLoanPrincipalTotal, 0.0001), true);
            assert.equal(helperFunctions.almostEqual(updatedLoanInterestTotal.toNumber(), finalLoanInterestTotal, 0.0001), true);
            assert.equal(afterRepaymentVaultBorrowIndex.toNumber(), afterRepaymentTokenBorrowIndex.toNumber());
            assert.equal(updatedEveMockFa12TokenBalance, eveInitialMockFa12TokenBalance - repayAmount);

            // check treasury fees and interest to token pool reward contract
            assert.equal(helperFunctions.almostEqual(updatedTreasuryMockFa12TokenBalance, treasuryInitialMockFa12TokenBalance + interestTreasuryShare, 0.0001), true);

        })

    })


    describe('%repay mockFA2 Tokens - mock time tests (1 year)', function () {

        it('user (eve) can repay debt - Mock FA2 Token  - mock one year - utilisation rate below optimal utilisation rate - repayment greater than interest', async () => {

            // Conditions: 
            // - vault loan token: mock FA2 tokens
            // - mock time: 1 year
            // - token pool interest rate: below optimal utilisation rate
            // - repay amount: greater than interest amount 

            // Summary of steps:
            // 1. Create Vault
            // 2. Deposit collateral into vault (100 Mock FA12 Tokens, 100 Mock FA2 Tokens)
            // 3. Borrow from vault (20 Mock FA2 Tokens)
            // 4. Set block levels time to 1 year in future
            // 5. Repay partial debt

            // init variables
            await helperFunctions.signerFactory(tezos, eve.sk);
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
            const newVaultRecord = await lendingControllerStorage.vaults.get(vaultHandle);
            const vaultAddress   = newVaultRecord.address;
            const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

            console.log('   - vault originated: ' + vaultAddress);
            console.log('   - vault id: ' + vaultId);

            // push new vault id to vault set
            eveVaultSet.push(vaultId);

            // ----------------------------------------------------------------------------------------------
            // Deposit Collateral into Vault
            // ----------------------------------------------------------------------------------------------

            const mockFa12DepositAmount      = 150000000;   // 150 Mock FA12 Tokens
            const mockFa2DepositAmount       = 150000000;   // 150 Mock FA12 Tokens

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
            updateOperatorsOperation = await helperFunctions.updateOperators(mockFa2TokenInstance, eve.pkh, vaultAddress, tokenId);
            await updateOperatorsOperation.confirmation();

            // eve deposits mock FA2 tokens into vault
            const eveDepositTokenOperation = await vaultInstance.methods.initVaultAction(
                "deposit",
                mockFa2DepositAmount,  
                "eurl"
            ).send();
            await eveDepositTokenOperation.confirmation();

            console.log('   - vault collateral deposited');

            // ----------------------------------------------------------------------------------------------
            // Borrow with Vault
            // ----------------------------------------------------------------------------------------------

            // borrow amount - 20 Mock FA12 Tokens
            const borrowAmount = 20000000;   

            // borrow operation
            const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
            await eveBorrowOperation.confirmation();

            console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName);

            // get initial Mock FA12 Token balance for Eve, Treasury and Token Pool Reward Contract
            const eveMockFa2Ledger                 = await mockFa2TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMockFa2TokenBalance    = eveMockFa2Ledger == undefined ? 0 : eveMockFa2Ledger.toNumber();

            const treasuryMockFa2Ledger                = await mockFa2TokenStorage.ledger.get(contractDeployments.treasury.address);            
            const treasuryInitialMockFa2TokenBalance   = treasuryMockFa2Ledger == undefined ? 0 : treasuryMockFa2Ledger.toNumber();

            // get token pool stats
            const afterBorrowloanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const loanTokenDecimals    = afterBorrowloanTokenRecordView.tokenDecimals;
            const interestRateDecimals = (27 - 2); 

            const tokenPoolTotal           = afterBorrowloanTokenRecordView.tokenPoolTotal.toNumber() / (10 ** loanTokenDecimals);
            const totalBorrowed            = afterBorrowloanTokenRecordView.totalBorrowed.toNumber() / (10 ** loanTokenDecimals);
            const optimalUtilisationRate   = Number(afterBorrowloanTokenRecordView.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const utilisationRate          = Number(afterBorrowloanTokenRecordView.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const currentInterestRate      = Number(afterBorrowloanTokenRecordView.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";

            console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);

            // ----------------------------------------------------------------------------------------------
            // Set Block Levels For Mock Time Test - 1 year
            // ----------------------------------------------------------------------------------------------

            await helperFunctions.signerFactory(tezos, bob.sk); // temporarily set to tester to increase block levels

            const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
            const updatedVault                      = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const lastUpdatedBlockLevel             = updatedVault.lastUpdatedBlockLevel;

            const newBlockLevel = lastUpdatedBlockLevel.toNumber() + oneYearLevelBlocks;

            const setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(newBlockLevel, 'configMockLevel').send();
            await setMockLevelOperation.confirmation();

            const mockTimeLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedMockLevel = mockTimeLendingControllerStorage.config.mockLevel;

            assert.equal(updatedMockLevel, newBlockLevel);

            console.log('   - time set to 1 year ahead: ' + lastUpdatedBlockLevel + ' to ' + newBlockLevel);

            // ----------------------------------------------------------------------------------------------
            // Repay partial debt 
            // ----------------------------------------------------------------------------------------------

            // set back to user
            await helperFunctions.signerFactory(tezos, eve.sk);  

            // treasury share of interest repaid
            const configInterestTreasuryShare = await lendingControllerStorage.config.interestTreasuryShare;

            // repayment amount
            const repayAmount = 500000; // 0.5 Mock FA12 Tokens

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

            // get vault and loan token views, and storage
            const vaultRecordView        = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            const loanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const beforeRepaymentStorage = await lendingControllerInstance.storage();

            const initialVaultLoanOutstandingTotal         = vaultRecordView.loanOutstandingTotal;
            const beforeRepaymentVaultBorrowIndex          = vaultRecordView.borrowIndex;
            const beforeRepaymentVaultOutstandingTotal     = vaultRecordView.loanOutstandingTotal;
            const beforeRepaymentVaultPrincipalTotal       = vaultRecordView.loanPrincipalTotal;
            const beforeRepaymentTokenBorrowIndex          = loanTokenRecordView.borrowIndex;

            // const repayOpParam        = await lendingControllerInstance.methods.repay(vaultId, repayAmount).toTransferParams();
            // const estimate            = await utils.tezos.estimate.transfer(repayOpParam);
            // console.log("REPAY OP ESTIMATION: ", estimate);

            // repay operation
            const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send();
            await eveRepayOperation.confirmation();

            console.log('   - repaid: ' + repayAmount + " | type: " + loanTokenName);

            // get updated storage
            const updatedLendingControllerStorageAfterRepay     = await lendingControllerInstance.storage();
            const updatedVaultRecord                            = await updatedLendingControllerStorageAfterRepay.vaults.get(vaultHandle);
            const updatedMockFa2TokenStorage                    = await mockFa2TokenInstance.storage();
            
            // get updated Mock FA2 Token balance for Eve, Treasury and Token Pool Reward Contract
            const updatedEveMockFa2Ledger                       = await updatedMockFa2TokenStorage.ledger.get(eve.pkh);            
            const updatedEveMockFa2TokenBalance                 = updatedEveMockFa2Ledger == undefined ? 0 : updatedEveMockFa2Ledger.toNumber();

            const updatedTreasuryMockFa2Ledger                  = await updatedMockFa2TokenStorage.ledger.get(contractDeployments.treasury.address);            
            const updatedTreasuryMockFa2TokenBalance            = updatedTreasuryMockFa2Ledger == undefined ? 0 : updatedTreasuryMockFa2Ledger.toNumber();

            // On-chain views to vault and loan token
            const updatedVaultRecordView     = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            const updatedLoanTokenRecordView = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});

            const updatedLoanOutstandingTotal             = updatedVaultRecordView.loanOutstandingTotal;
            const updatedLoanPrincipalTotal               = updatedVaultRecordView.loanPrincipalTotal;
            const updatedLoanInterestTotal                = updatedVaultRecordView.loanInterestTotal;

            const afterRepaymentVaultBorrowIndex          = updatedVaultRecordView.borrowIndex;
            const afterRepaymentTokenBorrowIndex          = updatedLoanTokenRecordView.borrowIndex;
            
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

            console.log('   - final vault stats >> outstanding total: ' + finalLoanOutstandingTotal + " | principal total: " + finalLoanPrincipalTotal  + " | interest total: " + finalLoanInterestTotal);
            console.log('   - interest stats >> total interest: ' + totalInterest + ' | interest paid: ' + totalInterestPaid +' | interest to treasury: ' + interestTreasuryShare + " | interest to reward pool: " + interestRewards);

            assert.equal(helperFunctions.almostEqual(updatedLoanOutstandingTotal, finalLoanOutstandingTotal, 0.0001), true);
            assert.equal(helperFunctions.almostEqual(updatedLoanPrincipalTotal, finalLoanPrincipalTotal, 0.0001), true);
            assert.equal(helperFunctions.almostEqual(updatedLoanInterestTotal.toNumber(), finalLoanInterestTotal, 0.0001), true);

            assert.equal(afterRepaymentVaultBorrowIndex.toNumber(), afterRepaymentTokenBorrowIndex.toNumber());
            assert.equal(updatedEveMockFa2TokenBalance, eveInitialMockFa2TokenBalance - repayAmount);

            // check treasury fees and interest to token pool reward contract
            assert.equal(helperFunctions.almostEqual(updatedTreasuryMockFa2TokenBalance, treasuryInitialMockFa2TokenBalance + interestTreasuryShare, 0.0001), true);

        })



        it('user (eve) can repay debt - Mock FA2 Token  - mock one year - utilisation rate below optimal utilisation rate - repayment less than interest', async () => {

            // Conditions: 
            // - vault loan token: mock FA2 tokens
            // - mock time: 1 year
            // - token pool interest rate: below optimal utilisation rate
            // - repay amount: less than interest amount 

            // Summary of steps:
            // 1. Create Vault
            // 2. Deposit collateral into vault (100 Mock FA12 Tokens, 100 Mock FA2 Tokens)
            // 3. Borrow from vault (20 Mock FA2 Tokens)
            // 4. Set block levels time to 1 year in future
            // 5. Repay partial debt

            // init variables
            await helperFunctions.signerFactory(tezos, eve.sk);
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
            const newVaultRecord = await lendingControllerStorage.vaults.get(vaultHandle);
            const vaultAddress   = newVaultRecord.address;
            const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

            console.log('   - vault originated: ' + vaultAddress);
            console.log('   - vault id: ' + vaultId);

            // push new vault id to vault set
            eveVaultSet.push(vaultId);

            // ----------------------------------------------------------------------------------------------
            // Deposit Collateral into Vault
            // ----------------------------------------------------------------------------------------------

            const mockFa12DepositAmount      = 150000000;   // 150 Mock FA12 Tokens
            const mockFa2DepositAmount       = 150000000;   // 150 Mock FA12 Tokens

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
            updateOperatorsOperation = await helperFunctions.updateOperators(mockFa2TokenInstance, eve.pkh, vaultAddress, tokenId);
            await updateOperatorsOperation.confirmation();

            // eve deposits mock FA2 tokens into vault
            const eveDepositTokenOperation = await vaultInstance.methods.initVaultAction(
                "deposit",
                mockFa2DepositAmount,      
                "eurl"
            ).send();
            await eveDepositTokenOperation.confirmation();

            console.log('   - vault collateral deposited');

            // ----------------------------------------------------------------------------------------------
            // Borrow with Vault
            // ----------------------------------------------------------------------------------------------

            // borrow amount - 20 Mock FA12 Tokens
            const borrowAmount = 20000000;   

            // borrow operation
            const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
            await eveBorrowOperation.confirmation();

            console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName);

            // get initial Mock FA12 Token balance for Eve, Treasury and Token Pool Reward Contract
            const eveMockFa2Ledger                 = await mockFa2TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMockFa2TokenBalance    = eveMockFa2Ledger == undefined ? 0 : eveMockFa2Ledger.toNumber();

            const treasuryMockFa2Ledger                = await mockFa2TokenStorage.ledger.get(contractDeployments.treasury.address);            
            const treasuryInitialMockFa2TokenBalance   = treasuryMockFa2Ledger == undefined ? 0 : treasuryMockFa2Ledger.toNumber();

            // get token pool stats
            const afterBorrowloanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const loanTokenDecimals    = afterBorrowloanTokenRecordView.tokenDecimals;
            const interestRateDecimals = (27 - 2); 

            const tokenPoolTotal           = afterBorrowloanTokenRecordView.tokenPoolTotal.toNumber() / (10 ** loanTokenDecimals);
            const totalBorrowed            = afterBorrowloanTokenRecordView.totalBorrowed.toNumber() / (10 ** loanTokenDecimals);
            const optimalUtilisationRate   = Number(afterBorrowloanTokenRecordView.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const utilisationRate          = Number(afterBorrowloanTokenRecordView.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const currentInterestRate      = Number(afterBorrowloanTokenRecordView.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";

            console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);

            // ----------------------------------------------------------------------------------------------
            // Set Block Levels For Mock Time Test - 1 year
            // ----------------------------------------------------------------------------------------------

            await helperFunctions.signerFactory(tezos, bob.sk); // temporarily set to tester to increase block levels

            const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
            const updatedVault                      = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const lastUpdatedBlockLevel             = updatedVault.lastUpdatedBlockLevel;

            const newBlockLevel = lastUpdatedBlockLevel.toNumber() + oneYearLevelBlocks;

            const setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(newBlockLevel, 'configMockLevel').send();
            await setMockLevelOperation.confirmation();

            const mockTimeLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedMockLevel = mockTimeLendingControllerStorage.config.mockLevel;

            assert.equal(updatedMockLevel, newBlockLevel);

            console.log('   - time set to 1 year ahead: ' + lastUpdatedBlockLevel + ' to ' + newBlockLevel);

            // ----------------------------------------------------------------------------------------------
            // Repay partial debt 
            // ----------------------------------------------------------------------------------------------

            // set back to user
            await helperFunctions.signerFactory(tezos, eve.sk);  

            // treasury share of interest repaid
            const configInterestTreasuryShare = await lendingControllerStorage.config.interestTreasuryShare;

            // repayment amount
            const repayAmount = 10000; // 0.01 Mock FA12 Tokens

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

            // get vault and loan token views, and storage
            const vaultRecordView        = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            const loanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const beforeRepaymentStorage = await lendingControllerInstance.storage();

            const initialVaultLoanOutstandingTotal         = vaultRecordView.loanOutstandingTotal;
            const beforeRepaymentVaultBorrowIndex          = vaultRecordView.borrowIndex;
            const beforeRepaymentVaultOutstandingTotal     = vaultRecordView.loanOutstandingTotal;
            const beforeRepaymentVaultPrincipalTotal       = vaultRecordView.loanPrincipalTotal;
            const beforeRepaymentTokenBorrowIndex          = loanTokenRecordView.borrowIndex;

            // const repayOpParam        = await lendingControllerInstance.methods.repay(vaultId, repayAmount).toTransferParams();
            // const estimate            = await utils.tezos.estimate.transfer(repayOpParam);
            // console.log("REPAY OP ESTIMATION: ", estimate);

            // repay operation
            const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send();
            await eveRepayOperation.confirmation();

            console.log('   - repaid: ' + repayAmount + " | type: " + loanTokenName);

            // get updated storage
            const updatedLendingControllerStorageAfterRepay     = await lendingControllerInstance.storage();
            const updatedVaultRecord                            = await updatedLendingControllerStorageAfterRepay.vaults.get(vaultHandle);
            const updatedMockFa2TokenStorage                    = await mockFa2TokenInstance.storage();
            
            // get updated Mock FA2 Token balance for Eve, Treasury and Token Pool Reward Contract
            const updatedEveMockFa2Ledger                       = await updatedMockFa2TokenStorage.ledger.get(eve.pkh);            
            const updatedEveMockFa2TokenBalance                 = updatedEveMockFa2Ledger == undefined ? 0 : updatedEveMockFa2Ledger.toNumber();

            const updatedTreasuryMockFa2Ledger                  = await updatedMockFa2TokenStorage.ledger.get(contractDeployments.treasury.address);            
            const updatedTreasuryMockFa2TokenBalance            = updatedTreasuryMockFa2Ledger == undefined ? 0 : updatedTreasuryMockFa2Ledger.toNumber();

            // On-chain views to vault and loan token
            const updatedVaultRecordView     = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            const updatedLoanTokenRecordView = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});

            const updatedLoanOutstandingTotal             = updatedVaultRecordView.loanOutstandingTotal;
            const updatedLoanPrincipalTotal               = updatedVaultRecordView.loanPrincipalTotal;
            const updatedLoanInterestTotal                = updatedVaultRecordView.loanInterestTotal;

            const afterRepaymentVaultBorrowIndex          = updatedVaultRecordView.borrowIndex;
            const afterRepaymentTokenBorrowIndex          = updatedLoanTokenRecordView.borrowIndex;
            
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

            console.log('   - final vault stats >> outstanding total: ' + finalLoanOutstandingTotal + " | principal total: " + finalLoanPrincipalTotal  + " | interest total: " + finalLoanInterestTotal);
            console.log('   - interest stats >> total interest: ' + totalInterest + ' | interest paid: ' + totalInterestPaid +' | interest to treasury: ' + interestTreasuryShare + " | interest to reward pool: " + interestRewards);

            assert.equal(helperFunctions.almostEqual(updatedLoanOutstandingTotal, finalLoanOutstandingTotal, 0.0001), true);
            assert.equal(helperFunctions.almostEqual(updatedLoanPrincipalTotal, finalLoanPrincipalTotal, 0.0001), true);
            assert.equal(helperFunctions.almostEqual(updatedLoanInterestTotal.toNumber(), finalLoanInterestTotal, 0.0001), true);
            assert.equal(afterRepaymentVaultBorrowIndex.toNumber(), afterRepaymentTokenBorrowIndex.toNumber());
            assert.equal(updatedEveMockFa2TokenBalance, eveInitialMockFa2TokenBalance - repayAmount);

            // check treasury fees and interest to token pool reward contract
            assert.equal(helperFunctions.almostEqual(updatedTreasuryMockFa2TokenBalance, treasuryInitialMockFa2TokenBalance + interestTreasuryShare, 0.0001), true);

        })



        it('user (eve) can repay debt - Mock FA2 Token  - mock one year - utilisation rate above optimal utilisation rate - repayment greater than interest', async () => {

            // Conditions: 
            // - vault loan token: mock FA2 tokens
            // - mock time: 1 year
            // - token pool interest rate: above optimal utilisation rate
            // - repay amount: greater than interest amount 

            // Summary of steps:
            // 1. Create Vault
            // 2. Deposit collateral into vault (100 Mock FA12 Tokens, 100 Mock FA2 Tokens)
            // 3. Borrow from vault (20 Mock FA2 Tokens)
            // 4. Set block levels time to 1 year in future
            // 5. Repay partial debt

            // init variables
            await helperFunctions.signerFactory(tezos, eve.sk);
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
            const newVaultRecord = await lendingControllerStorage.vaults.get(vaultHandle);
            const vaultAddress   = newVaultRecord.address;
            const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

            console.log('   - vault originated: ' + vaultAddress);
            console.log('   - vault id: ' + vaultId);

            // push new vault id to vault set
            eveVaultSet.push(vaultId);

            // ----------------------------------------------------------------------------------------------
            // Deposit Collateral into Vault
            // ----------------------------------------------------------------------------------------------

            const mockFa12DepositAmount      = 150000000;   // 150 Mock FA12 Tokens
            const mockFa2DepositAmount       = 150000000;   // 150 Mock FA12 Tokens

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
            updateOperatorsOperation = await helperFunctions.updateOperators(mockFa2TokenInstance, eve.pkh, vaultAddress, tokenId);
            await updateOperatorsOperation.confirmation();

            // eve deposits mock FA2 tokens into vault
            const eveDepositTokenOperation = await vaultInstance.methods.initVaultAction(
                "deposit",
                mockFa2DepositAmount,      
                "eurl"
            ).send();
            await eveDepositTokenOperation.confirmation();

            console.log('   - vault collateral deposited');

            // ----------------------------------------------------------------------------------------------
            // Borrow with Vault
            // ----------------------------------------------------------------------------------------------

            // borrow amount - 20 Mock FA12 Tokens
            const borrowAmount = 20000000;   

            // borrow operation
            const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
            await eveBorrowOperation.confirmation();

            console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName);

            // get initial Mock FA12 Token balance for Eve, Treasury and Token Pool Reward Contract
            const eveMockFa2Ledger                 = await mockFa2TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMockFa2TokenBalance    = eveMockFa2Ledger == undefined ? 0 : eveMockFa2Ledger.toNumber();

            const treasuryMockFa2Ledger                = await mockFa2TokenStorage.ledger.get(contractDeployments.treasury.address);            
            const treasuryInitialMockFa2TokenBalance   = treasuryMockFa2Ledger == undefined ? 0 : treasuryMockFa2Ledger.toNumber();

            // get token pool stats
            const afterBorrowloanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const loanTokenDecimals    = afterBorrowloanTokenRecordView.tokenDecimals;
            const interestRateDecimals = (27 - 2); 

            const tokenPoolTotal           = afterBorrowloanTokenRecordView.tokenPoolTotal.toNumber() / (10 ** loanTokenDecimals);
            const totalBorrowed            = afterBorrowloanTokenRecordView.totalBorrowed.toNumber() / (10 ** loanTokenDecimals);
            const optimalUtilisationRate   = Number(afterBorrowloanTokenRecordView.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const utilisationRate          = Number(afterBorrowloanTokenRecordView.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const currentInterestRate      = Number(afterBorrowloanTokenRecordView.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";

            console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);

            // ----------------------------------------------------------------------------------------------
            // Set Block Levels For Mock Time Test - 1 year
            // ----------------------------------------------------------------------------------------------

            await helperFunctions.signerFactory(tezos, bob.sk); // temporarily set to tester to increase block levels

            const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
            const updatedVault                      = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const lastUpdatedBlockLevel             = updatedVault.lastUpdatedBlockLevel;

            const newBlockLevel = lastUpdatedBlockLevel.toNumber() + oneYearLevelBlocks;

            const setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(newBlockLevel, 'configMockLevel').send();
            await setMockLevelOperation.confirmation();

            const mockTimeLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedMockLevel = mockTimeLendingControllerStorage.config.mockLevel;

            assert.equal(updatedMockLevel, newBlockLevel);

            console.log('   - time set to 1 year ahead: ' + lastUpdatedBlockLevel + ' to ' + newBlockLevel);

            // ----------------------------------------------------------------------------------------------
            // Repay partial debt 
            // ----------------------------------------------------------------------------------------------

            // set back to user
            await helperFunctions.signerFactory(tezos, eve.sk);  

            // treasury share of interest repaid
            const configInterestTreasuryShare = await lendingControllerStorage.config.interestTreasuryShare;

            // repayment amount
            const repayAmount = 500000; // 0.5 Mock FA12 Tokens

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

            // get vault and loan token views, and storage
            const vaultRecordView        = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            const loanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const beforeRepaymentStorage = await lendingControllerInstance.storage();

            const initialVaultLoanOutstandingTotal         = vaultRecordView.loanOutstandingTotal;
            const beforeRepaymentVaultBorrowIndex          = vaultRecordView.borrowIndex;
            const beforeRepaymentVaultOutstandingTotal     = vaultRecordView.loanOutstandingTotal;
            const beforeRepaymentVaultPrincipalTotal       = vaultRecordView.loanPrincipalTotal;
            const beforeRepaymentTokenBorrowIndex          = loanTokenRecordView.borrowIndex;

            // const repayOpParam        = await lendingControllerInstance.methods.repay(vaultId, repayAmount).toTransferParams();
            // const estimate            = await utils.tezos.estimate.transfer(repayOpParam);
            // console.log("REPAY OP ESTIMATION: ", estimate);

            // repay operation
            const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send();
            await eveRepayOperation.confirmation();

            console.log('   - repaid: ' + repayAmount + " | type: " + loanTokenName);

            // get updated storage
            const updatedLendingControllerStorageAfterRepay     = await lendingControllerInstance.storage();
            const updatedVaultRecord                            = await updatedLendingControllerStorageAfterRepay.vaults.get(vaultHandle);
            const updatedMockFa2TokenStorage                    = await mockFa2TokenInstance.storage();
            
            // get updated Mock FA2 Token balance for Eve, Treasury and Token Pool Reward Contract
            const updatedEveMockFa2Ledger                       = await updatedMockFa2TokenStorage.ledger.get(eve.pkh);            
            const updatedEveMockFa2TokenBalance                 = updatedEveMockFa2Ledger == undefined ? 0 : updatedEveMockFa2Ledger.toNumber();

            const updatedTreasuryMockFa2Ledger                  = await updatedMockFa2TokenStorage.ledger.get(contractDeployments.treasury.address);            
            const updatedTreasuryMockFa2TokenBalance            = updatedTreasuryMockFa2Ledger == undefined ? 0 : updatedTreasuryMockFa2Ledger.toNumber();

            // On-chain views to vault and loan token
            const updatedVaultRecordView     = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            const updatedLoanTokenRecordView = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});

            const updatedLoanOutstandingTotal             = updatedVaultRecordView.loanOutstandingTotal;
            const updatedLoanPrincipalTotal               = updatedVaultRecordView.loanPrincipalTotal;
            const updatedLoanInterestTotal                = updatedVaultRecordView.loanInterestTotal;

            const afterRepaymentVaultBorrowIndex          = updatedVaultRecordView.borrowIndex;
            const afterRepaymentTokenBorrowIndex          = updatedLoanTokenRecordView.borrowIndex;
            
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

            console.log('   - final vault stats >> outstanding total: ' + finalLoanOutstandingTotal + " | principal total: " + finalLoanPrincipalTotal  + " | interest total: " + finalLoanInterestTotal);
            console.log('   - interest stats >> total interest: ' + totalInterest + ' | interest paid: ' + totalInterestPaid +' | interest to treasury: ' + interestTreasuryShare + " | interest to reward pool: " + interestRewards);

            assert.equal(helperFunctions.almostEqual(updatedLoanOutstandingTotal, finalLoanOutstandingTotal, 0.0001), true);
            assert.equal(helperFunctions.almostEqual(updatedLoanPrincipalTotal, finalLoanPrincipalTotal, 0.0001), true);
            assert.equal(helperFunctions.almostEqual(updatedLoanInterestTotal.toNumber(), finalLoanInterestTotal, 0.0001), true);
            assert.equal(afterRepaymentVaultBorrowIndex.toNumber(), afterRepaymentTokenBorrowIndex.toNumber());
            assert.equal(updatedEveMockFa2TokenBalance, eveInitialMockFa2TokenBalance - repayAmount);

            // check treasury fees and interest to token pool reward contract
            assert.equal(helperFunctions.almostEqual(updatedTreasuryMockFa2TokenBalance, treasuryInitialMockFa2TokenBalance + interestTreasuryShare, 0.0001), true);

        })


        it('user (eve) can repay debt - Mock FA2 Token  - mock one year - interest rate greater optimal utilisation rate - repayment less than interest', async () => {

            // Conditions: 
            // - vault loan token: mock FA2 tokens
            // - mock time: 1 year
            // - token pool interest rate: above optimal utilisation rate
            // - repay amount: less than interest amount 

            // Summary of steps:
            // 1. Create Vault
            // 2. Deposit collateral into vault (100 Mock FA12 Tokens, 100 Mock FA2 Tokens)
            // 3. Borrow from vault (20 Mock FA2 Tokens)
            // 4. Set block levels time to 1 year in future
            // 5. Repay partial debt

            // init variables
            await helperFunctions.signerFactory(tezos, eve.sk);
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
            const newVaultRecord = await lendingControllerStorage.vaults.get(vaultHandle);
            const vaultAddress   = newVaultRecord.address;
            const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

            console.log('   - vault originated: ' + vaultAddress);
            console.log('   - vault id: ' + vaultId);

            // push new vault id to vault set
            eveVaultSet.push(vaultId);

            // ----------------------------------------------------------------------------------------------
            // Deposit Collateral into Vault
            // ----------------------------------------------------------------------------------------------

            const mockFa12DepositAmount      = 150000000;   // 150 Mock FA12 Tokens
            const mockFa2DepositAmount       = 150000000;   // 150 Mock FA12 Tokens

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
            updateOperatorsOperation = await helperFunctions.updateOperators(mockFa2TokenInstance, eve.pkh, vaultAddress, tokenId);
            await updateOperatorsOperation.confirmation();

            // eve deposits mock FA2 tokens into vault
            const eveDepositTokenOperation = await vaultInstance.methods.initVaultAction(
                "deposit",
                mockFa2DepositAmount,          
                "eurl"
            ).send();
            await eveDepositTokenOperation.confirmation();

            console.log('   - vault collateral deposited');

            // ----------------------------------------------------------------------------------------------
            // Borrow with Vault
            // ----------------------------------------------------------------------------------------------

            // borrow amount - 20 Mock FA12 Tokens
            const borrowAmount = 20000000;   

            // borrow operation
            const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
            await eveBorrowOperation.confirmation();

            console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName);

            // get initial Mock FA12 Token balance for Eve, Treasury and Token Pool Reward Contract
            const eveMockFa2Ledger                 = await mockFa2TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMockFa2TokenBalance    = eveMockFa2Ledger == undefined ? 0 : eveMockFa2Ledger.toNumber();

            const treasuryMockFa2Ledger                = await mockFa2TokenStorage.ledger.get(contractDeployments.treasury.address);            
            const treasuryInitialMockFa2TokenBalance   = treasuryMockFa2Ledger == undefined ? 0 : treasuryMockFa2Ledger.toNumber();

            // get token pool stats
            const afterBorrowloanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const loanTokenDecimals    = afterBorrowloanTokenRecordView.tokenDecimals;
            const interestRateDecimals = (27 - 2); 

            const tokenPoolTotal           = afterBorrowloanTokenRecordView.tokenPoolTotal.toNumber() / (10 ** loanTokenDecimals);
            const totalBorrowed            = afterBorrowloanTokenRecordView.totalBorrowed.toNumber() / (10 ** loanTokenDecimals);
            const optimalUtilisationRate   = Number(afterBorrowloanTokenRecordView.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const utilisationRate          = Number(afterBorrowloanTokenRecordView.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const currentInterestRate      = Number(afterBorrowloanTokenRecordView.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";

            console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);

            // ----------------------------------------------------------------------------------------------
            // Set Block Levels For Mock Time Test - 1 year
            // ----------------------------------------------------------------------------------------------

            await helperFunctions.signerFactory(tezos, bob.sk); // temporarily set to tester to increase block levels

            const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
            const updatedVault                      = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const lastUpdatedBlockLevel             = updatedVault.lastUpdatedBlockLevel;

            const newBlockLevel = lastUpdatedBlockLevel.toNumber() + oneYearLevelBlocks;

            const setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(newBlockLevel, 'configMockLevel').send();
            await setMockLevelOperation.confirmation();

            const mockTimeLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedMockLevel = mockTimeLendingControllerStorage.config.mockLevel;

            assert.equal(updatedMockLevel, newBlockLevel);

            console.log('   - time set to 1 year ahead: ' + lastUpdatedBlockLevel + ' to ' + newBlockLevel);

            // ----------------------------------------------------------------------------------------------
            // Repay partial debt 
            // ----------------------------------------------------------------------------------------------

            // set back to user
            await helperFunctions.signerFactory(tezos, eve.sk);  

            // treasury share of interest repaid
            const configInterestTreasuryShare = await lendingControllerStorage.config.interestTreasuryShare;

            // repayment amount
            const repayAmount = 10000; // 0.01 Mock FA12 Tokens

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

            // get vault and loan token views, and storage
            const vaultRecordView        = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            const loanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const beforeRepaymentStorage = await lendingControllerInstance.storage();

            const initialVaultLoanOutstandingTotal         = vaultRecordView.loanOutstandingTotal;
            const beforeRepaymentVaultBorrowIndex          = vaultRecordView.borrowIndex;
            const beforeRepaymentVaultOutstandingTotal     = vaultRecordView.loanOutstandingTotal;
            const beforeRepaymentVaultPrincipalTotal       = vaultRecordView.loanPrincipalTotal;
            const beforeRepaymentTokenBorrowIndex          = loanTokenRecordView.borrowIndex;

            // const repayOpParam        = await lendingControllerInstance.methods.repay(vaultId, repayAmount).toTransferParams();
            // const estimate            = await utils.tezos.estimate.transfer(repayOpParam);
            // console.log("REPAY OP ESTIMATION: ", estimate);

            // repay operation
            const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send();
            await eveRepayOperation.confirmation();

            console.log('   - repaid: ' + repayAmount + " | type: " + loanTokenName);

            // get updated storage
            const updatedLendingControllerStorageAfterRepay     = await lendingControllerInstance.storage();
            const updatedVaultRecord                            = await updatedLendingControllerStorageAfterRepay.vaults.get(vaultHandle);
            const updatedMockFa2TokenStorage                    = await mockFa2TokenInstance.storage();
            
            // get updated Mock FA2 Token balance for Eve, Treasury and Token Pool Reward Contract
            const updatedEveMockFa2Ledger                       = await updatedMockFa2TokenStorage.ledger.get(eve.pkh);            
            const updatedEveMockFa2TokenBalance                 = updatedEveMockFa2Ledger == undefined ? 0 : updatedEveMockFa2Ledger.toNumber();

            const updatedTreasuryMockFa2Ledger                  = await updatedMockFa2TokenStorage.ledger.get(contractDeployments.treasury.address);            
            const updatedTreasuryMockFa2TokenBalance            = updatedTreasuryMockFa2Ledger == undefined ? 0 : updatedTreasuryMockFa2Ledger.toNumber();

            // On-chain views to vault and loan token
            const updatedVaultRecordView     = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            const updatedLoanTokenRecordView = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});

            const updatedLoanOutstandingTotal             = updatedVaultRecordView.loanOutstandingTotal;
            const updatedLoanPrincipalTotal               = updatedVaultRecordView.loanPrincipalTotal;
            const updatedLoanInterestTotal                = updatedVaultRecordView.loanInterestTotal;

            const afterRepaymentVaultBorrowIndex          = updatedVaultRecordView.borrowIndex;
            const afterRepaymentTokenBorrowIndex          = updatedLoanTokenRecordView.borrowIndex;
            
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

            console.log('   - final vault stats >> outstanding total: ' + finalLoanOutstandingTotal + " | principal total: " + finalLoanPrincipalTotal  + " | interest total: " + finalLoanInterestTotal);
            console.log('   - interest stats >> total interest: ' + totalInterest + ' | interest paid: ' + totalInterestPaid +' | interest to treasury: ' + interestTreasuryShare + " | interest to reward pool: " + interestRewards);

            assert.equal(helperFunctions.almostEqual(updatedLoanOutstandingTotal, finalLoanOutstandingTotal, 0.0001), true);
            assert.equal(helperFunctions.almostEqual(updatedLoanPrincipalTotal, finalLoanPrincipalTotal, 0.0001), true);
            assert.equal(helperFunctions.almostEqual(updatedLoanInterestTotal.toNumber(), finalLoanInterestTotal, 0.0001), true);
            assert.equal(afterRepaymentVaultBorrowIndex.toNumber(), afterRepaymentTokenBorrowIndex.toNumber());
            assert.equal(updatedEveMockFa2TokenBalance, eveInitialMockFa2TokenBalance - repayAmount);

            // check treasury fees and interest to token pool reward contract
            assert.equal(helperFunctions.almostEqual(updatedTreasuryMockFa2TokenBalance, treasuryInitialMockFa2TokenBalance + interestTreasuryShare, 0.0001), true);

        })

    })



    describe('%repay TEZ - mock time tests (1 year)', function () {

        it('user (eve) can repay debt - TEZ  - mock one year - utilisation rate below optimal utilisation rate - repayment greater than interest', async () => {

            // Conditions: 
            // - vault loan token: tez
            // - mock time: 1 year
            // - token pool interest rate: below optimal utilisation rate
            // - repay amount: greater than interest amount 

            // Summary of steps:
            // 1. Create Vault
            // 2. Deposit collateral into vault (100 Mock FA12 Tokens, 100 Mock FA2 Tokens)
            // 3. Borrow from vault (20 Tez)
            // 4. Set block levels time to 1 year in future
            // 5. Repay partial debt

            // init variables
            await helperFunctions.signerFactory(tezos, eve.sk);
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
            const newVaultRecord = await lendingControllerStorage.vaults.get(vaultHandle);
            const vaultAddress   = newVaultRecord.address;
            const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

            console.log('   - vault originated: ' + vaultAddress);
            console.log('   - vault id: ' + vaultId);

            // push new vault id to vault set
            eveVaultSet.push(vaultId);

            // ----------------------------------------------------------------------------------------------
            // Deposit Collateral into Vault
            // ----------------------------------------------------------------------------------------------

            const mockFa12DepositAmount      = 150000000;   // 150 Mock FA12 Tokens
            const mockFa2DepositAmount       = 150000000;   // 150 Mock FA12 Tokens

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
            updateOperatorsOperation = await helperFunctions.updateOperators(mockFa2TokenInstance, eve.pkh, vaultAddress, tokenId);
            await updateOperatorsOperation.confirmation();

            // eve deposits mock FA2 tokens into vault
            const eveDepositTokenOperation = await vaultInstance.methods.initVaultAction(
                "deposit",
                mockFa2DepositAmount,         
                "eurl"
            ).send();
            await eveDepositTokenOperation.confirmation();

            console.log('   - vault collateral deposited');

            // ----------------------------------------------------------------------------------------------
            // Borrow with Vault
            // ----------------------------------------------------------------------------------------------

            // borrow amount - 20 Tez
            const borrowAmount = 20000000;   

            // borrow operation
            const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
            await eveBorrowOperation.confirmation();

            console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName);

            // get initial XTZ balance for Eve, Treasury and Token Pool Reward Contract
            const eveXtzLedger   = await utils.tezos.tz.getBalance(eve.pkh);
            const eveInitialXtzBalance  = eveXtzLedger.toNumber();

            const treasuryXtzLedger   = await utils.tezos.tz.getBalance(contractDeployments.treasury.address);
            const treasuryInitialXtzBalance  = treasuryXtzLedger.toNumber();

            // get token pool stats
            const afterBorrowloanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const loanTokenDecimals    = afterBorrowloanTokenRecordView.tokenDecimals;
            const interestRateDecimals = (27 - 2); 

            const tokenPoolTotal           = afterBorrowloanTokenRecordView.tokenPoolTotal.toNumber() / (10 ** loanTokenDecimals);
            const totalBorrowed            = afterBorrowloanTokenRecordView.totalBorrowed.toNumber() / (10 ** loanTokenDecimals);
            const optimalUtilisationRate   = Number(afterBorrowloanTokenRecordView.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const utilisationRate          = Number(afterBorrowloanTokenRecordView.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const currentInterestRate      = Number(afterBorrowloanTokenRecordView.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";

            console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);

            // ----------------------------------------------------------------------------------------------
            // Set Block Levels For Mock Time Test - 1 year
            // ----------------------------------------------------------------------------------------------

            await helperFunctions.signerFactory(tezos, bob.sk); // temporarily set to tester to increase block levels

            const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
            const updatedVault                      = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const lastUpdatedBlockLevel             = updatedVault.lastUpdatedBlockLevel;

            const newBlockLevel = lastUpdatedBlockLevel.toNumber() + oneYearLevelBlocks;

            const setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(newBlockLevel, 'configMockLevel').send();
            await setMockLevelOperation.confirmation();

            const mockTimeLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedMockLevel = mockTimeLendingControllerStorage.config.mockLevel;

            assert.equal(updatedMockLevel, newBlockLevel);

            console.log('   - time set to 1 year ahead: ' + lastUpdatedBlockLevel + ' to ' + newBlockLevel);

            // ----------------------------------------------------------------------------------------------
            // Repay partial debt 
            // ----------------------------------------------------------------------------------------------

            // set back to user
            await helperFunctions.signerFactory(tezos, eve.sk);  

            // treasury share of interest repaid
            const configInterestTreasuryShare = await lendingControllerStorage.config.interestTreasuryShare;

            // repayment amount
            const repayAmount = 500000; // 0.5 Tez

            // get vault and loan token views, and storage
            const vaultRecordView        = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            const loanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const beforeRepaymentStorage = await lendingControllerInstance.storage();

            const initialVaultLoanOutstandingTotal         = vaultRecordView.loanOutstandingTotal;
            const beforeRepaymentVaultBorrowIndex          = vaultRecordView.borrowIndex;
            const beforeRepaymentVaultOutstandingTotal     = vaultRecordView.loanOutstandingTotal;
            const beforeRepaymentVaultPrincipalTotal       = vaultRecordView.loanPrincipalTotal;
            const beforeRepaymentTokenBorrowIndex          = loanTokenRecordView.borrowIndex;

            // const repayOpParam        = await lendingControllerInstance.methods.repay(vaultId, repayAmount).toTransferParams();
            // const estimate            = await utils.tezos.estimate.transfer(repayOpParam);
            // console.log("REPAY OP ESTIMATION: ", estimate);

            // repay operation
            const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send({ mutez : true, amount : repayAmount});
            await eveRepayOperation.confirmation();

            console.log('   - repaid: ' + repayAmount + " | type: " + loanTokenName);

            // get updated storage
            const updatedLendingControllerStorageAfterRepay     = await lendingControllerInstance.storage();
            const updatedVaultRecord                            = await updatedLendingControllerStorageAfterRepay.vaults.get(vaultHandle);
            const updatedMockFa2TokenStorage                    = await mockFa2TokenInstance.storage();
            
            // get updated XTZ balance for Eve, Treasury and Token Pool Reward Contract
            const updatedEveXtzLedger                           = await utils.tezos.tz.getBalance(eve.pkh);
            const updatedEveXtzBalance                          = updatedEveXtzLedger.toNumber();

            const updatedTreasuryXtzLedger                      = await utils.tezos.tz.getBalance(contractDeployments.treasury.address);
            const updatedTreasuryXtzBalance                     = updatedTreasuryXtzLedger.toNumber();

            // On-chain views to vault and loan token
            const updatedVaultRecordView     = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            const updatedLoanTokenRecordView = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});

            const updatedLoanOutstandingTotal             = updatedVaultRecordView.loanOutstandingTotal;
            const updatedLoanPrincipalTotal               = updatedVaultRecordView.loanPrincipalTotal;
            const updatedLoanInterestTotal                = updatedVaultRecordView.loanInterestTotal;

            const afterRepaymentVaultBorrowIndex          = updatedVaultRecordView.borrowIndex;
            const afterRepaymentTokenBorrowIndex          = updatedLoanTokenRecordView.borrowIndex;
            
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

            console.log('   - final vault stats >> outstanding total: ' + finalLoanOutstandingTotal + " | principal total: " + finalLoanPrincipalTotal  + " | interest total: " + finalLoanInterestTotal);
            console.log('   - interest stats >> total interest: ' + totalInterest + ' | interest paid: ' + totalInterestPaid +' | interest to treasury: ' + interestTreasuryShare + " | interest to reward pool: " + interestRewards);

            assert.equal(helperFunctions.almostEqual(updatedLoanOutstandingTotal, finalLoanOutstandingTotal, 0.0001), true);
            assert.equal(helperFunctions.almostEqual(updatedLoanPrincipalTotal, finalLoanPrincipalTotal, 0.0001), true);
            assert.equal(helperFunctions.almostEqual(updatedLoanInterestTotal.toNumber(), finalLoanInterestTotal, 0.0001), true);
            assert.equal(afterRepaymentVaultBorrowIndex.toNumber(), afterRepaymentTokenBorrowIndex.toNumber());
            
            // account for minor gas cost difference
            assert.equal(helperFunctions.almostEqual(updatedEveXtzBalance, eveInitialXtzBalance - repayAmount, 0.0001), true);

            // check treasury fees and interest to token pool reward contract
            assert.equal(helperFunctions.almostEqual(updatedTreasuryXtzBalance, treasuryInitialXtzBalance + interestTreasuryShare, 0.0001), true);

        })


        it('user (eve) can repay debt - TEZ  - mock one year - utilisation rate below optimal utilisation rate - repayment less than interest', async () => {

            // Conditions: 
            // - vault loan token: tez
            // - mock time: 1 year
            // - token pool interest rate: below optimal utilisation rate
            // - repay amount: less than interest amount 

            // Summary of steps:
            // 1. Create Vault
            // 2. Deposit collateral into vault (100 Mock FA12 Tokens, 100 Mock FA2 Tokens)
            // 3. Borrow from vault (20 Tez)
            // 4. Set block levels time to 1 year in future
            // 5. Repay partial debt

            // init variables
            await helperFunctions.signerFactory(tezos, eve.sk);
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
            const newVaultRecord = await lendingControllerStorage.vaults.get(vaultHandle);
            const vaultAddress   = newVaultRecord.address;
            const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

            console.log('   - vault originated: ' + vaultAddress);
            console.log('   - vault id: ' + vaultId);

            // push new vault id to vault set
            eveVaultSet.push(vaultId);

            // ----------------------------------------------------------------------------------------------
            // Deposit Collateral into Vault
            // ----------------------------------------------------------------------------------------------

            const mockFa12DepositAmount      = 150000000;   // 150 Mock FA12 Tokens
            const mockFa2DepositAmount       = 150000000;   // 150 Mock FA12 Tokens

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
            updateOperatorsOperation = await helperFunctions.updateOperators(mockFa2TokenInstance, eve.pkh, vaultAddress, tokenId);
            await updateOperatorsOperation.confirmation();

            // eve deposits mock FA2 tokens into vault
            const eveDepositTokenOperation = await vaultInstance.methods.initVaultAction(
                "deposit",
                mockFa2DepositAmount,                 
                "eurl"
            ).send();
            await eveDepositTokenOperation.confirmation();

            console.log('   - vault collateral deposited');

            // ----------------------------------------------------------------------------------------------
            // Borrow with Vault
            // ----------------------------------------------------------------------------------------------

            // borrow amount - 20 Tez
            const borrowAmount = 20000000;   

            // borrow operation
            const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
            await eveBorrowOperation.confirmation();

            console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName);

            // get initial XTZ balance for Eve, Treasury and Token Pool Reward Contract
            const eveXtzLedger   = await utils.tezos.tz.getBalance(eve.pkh);
            const eveInitialXtzBalance  = eveXtzLedger.toNumber();

            const treasuryXtzLedger   = await utils.tezos.tz.getBalance(contractDeployments.treasury.address);
            const treasuryInitialXtzBalance  = treasuryXtzLedger.toNumber();

            // get token pool stats
            const afterBorrowloanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const loanTokenDecimals    = afterBorrowloanTokenRecordView.tokenDecimals;
            const interestRateDecimals = (27 - 2); 

            const tokenPoolTotal           = afterBorrowloanTokenRecordView.tokenPoolTotal.toNumber() / (10 ** loanTokenDecimals);
            const totalBorrowed            = afterBorrowloanTokenRecordView.totalBorrowed.toNumber() / (10 ** loanTokenDecimals);
            const optimalUtilisationRate   = Number(afterBorrowloanTokenRecordView.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const utilisationRate          = Number(afterBorrowloanTokenRecordView.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const currentInterestRate      = Number(afterBorrowloanTokenRecordView.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";

            console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);

            // ----------------------------------------------------------------------------------------------
            // Set Block Levels For Mock Time Test - 1 year
            // ----------------------------------------------------------------------------------------------

            await helperFunctions.signerFactory(tezos, bob.sk); // temporarily set to tester to increase block levels

            const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
            const updatedVault                      = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const lastUpdatedBlockLevel             = updatedVault.lastUpdatedBlockLevel;

            const newBlockLevel = lastUpdatedBlockLevel.toNumber() + oneYearLevelBlocks;

            const setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(newBlockLevel, 'configMockLevel').send();
            await setMockLevelOperation.confirmation();

            const mockTimeLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedMockLevel = mockTimeLendingControllerStorage.config.mockLevel;

            assert.equal(updatedMockLevel, newBlockLevel);

            console.log('   - time set to 1 year ahead: ' + lastUpdatedBlockLevel + ' to ' + newBlockLevel);

            // ----------------------------------------------------------------------------------------------
            // Repay partial debt 
            // ----------------------------------------------------------------------------------------------

            // set back to user
            await helperFunctions.signerFactory(tezos, eve.sk);  

            // treasury share of interest repaid
            const configInterestTreasuryShare = await lendingControllerStorage.config.interestTreasuryShare;

            // repayment amount
            const repayAmount = 10000; // 0.01 Tez

            // get vault and loan token views, and storage
            const vaultRecordView        = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            const loanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const beforeRepaymentStorage = await lendingControllerInstance.storage();

            const initialVaultLoanOutstandingTotal         = vaultRecordView.loanOutstandingTotal;
            const beforeRepaymentVaultBorrowIndex          = vaultRecordView.borrowIndex;
            const beforeRepaymentVaultOutstandingTotal     = vaultRecordView.loanOutstandingTotal;
            const beforeRepaymentVaultPrincipalTotal       = vaultRecordView.loanPrincipalTotal;
            const beforeRepaymentTokenBorrowIndex          = loanTokenRecordView.borrowIndex;

            // const repayOpParam        = await lendingControllerInstance.methods.repay(vaultId, repayAmount).toTransferParams();
            // const estimate            = await utils.tezos.estimate.transfer(repayOpParam);
            // console.log("REPAY OP ESTIMATION: ", estimate);

            // repay operation
            const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send({ mutez : true, amount : repayAmount});
            await eveRepayOperation.confirmation();

            console.log('   - repaid: ' + repayAmount + " | type: " + loanTokenName);

            // get updated storage
            const updatedLendingControllerStorageAfterRepay     = await lendingControllerInstance.storage();
            const updatedVaultRecord                            = await updatedLendingControllerStorageAfterRepay.vaults.get(vaultHandle);
            const updatedMockFa2TokenStorage                    = await mockFa2TokenInstance.storage();
            
            // get updated XTZ balance for Eve, Treasury and Token Pool Reward Contract
            const updatedEveXtzLedger                           = await utils.tezos.tz.getBalance(eve.pkh);
            const updatedEveXtzBalance                          = updatedEveXtzLedger.toNumber();

            const updatedTreasuryXtzLedger                      = await utils.tezos.tz.getBalance(contractDeployments.treasury.address);
            const updatedTreasuryXtzBalance                     = updatedTreasuryXtzLedger.toNumber();

            // On-chain views to vault and loan token
            const updatedVaultRecordView     = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            const updatedLoanTokenRecordView = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});

            const updatedLoanOutstandingTotal             = updatedVaultRecordView.loanOutstandingTotal;
            const updatedLoanPrincipalTotal               = updatedVaultRecordView.loanPrincipalTotal;
            const updatedLoanInterestTotal                = updatedVaultRecordView.loanInterestTotal;

            const afterRepaymentVaultBorrowIndex          = updatedVaultRecordView.borrowIndex;
            const afterRepaymentTokenBorrowIndex          = updatedLoanTokenRecordView.borrowIndex;
            
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

            console.log('   - final vault stats >> outstanding total: ' + finalLoanOutstandingTotal + " | principal total: " + finalLoanPrincipalTotal  + " | interest total: " + finalLoanInterestTotal);
            console.log('   - interest stats >> total interest: ' + totalInterest + ' | interest paid: ' + totalInterestPaid +' | interest to treasury: ' + interestTreasuryShare + " | interest to reward pool: " + interestRewards);

            assert.equal(helperFunctions.almostEqual(updatedLoanOutstandingTotal, finalLoanOutstandingTotal, 0.0001), true);
            assert.equal(helperFunctions.almostEqual(updatedLoanPrincipalTotal, finalLoanPrincipalTotal, 0.0001), true);
            assert.equal(helperFunctions.almostEqual(updatedLoanInterestTotal.toNumber(), finalLoanInterestTotal, 0.0001), true);
            assert.equal(afterRepaymentVaultBorrowIndex.toNumber(), afterRepaymentTokenBorrowIndex.toNumber());

            // account for minor gas cost difference
            assert.equal(helperFunctions.almostEqual(updatedEveXtzBalance, eveInitialXtzBalance - repayAmount, 0.0001), true);

            // check treasury fees and interest to token pool reward contract
            assert.equal(helperFunctions.almostEqual(updatedTreasuryXtzBalance, treasuryInitialXtzBalance + interestTreasuryShare, 0.0001), true);

        })



        it('user (eve) can repay debt - TEZ  - mock one year - utilisation rate above optimal utilisation rate - repayment greater than interest', async () => {

            // Conditions: 
            // - vault loan token: tez
            // - mock time: 1 year
            // - token pool interest rate: above optimal utilisation rate
            // - repay amount: greater than interest amount 

            // Summary of steps:
            // 1. Create Vault
            // 2. Deposit collateral into vault (100 Mock FA12 Tokens, 100 Mock FA2 Tokens)
            // 3. Borrow from vault (20 Tez)
            // 4. Set block levels time to 1 year in future
            // 5. Repay partial debt

            // init variables
            await helperFunctions.signerFactory(tezos, eve.sk);
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
            const newVaultRecord = await lendingControllerStorage.vaults.get(vaultHandle);
            const vaultAddress   = newVaultRecord.address;
            const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

            console.log('   - vault originated: ' + vaultAddress);
            console.log('   - vault id: ' + vaultId);

            // push new vault id to vault set
            eveVaultSet.push(vaultId);

            // ----------------------------------------------------------------------------------------------
            // Deposit Collateral into Vault
            // ----------------------------------------------------------------------------------------------

            const mockFa12DepositAmount      = 150000000;   // 150 Mock FA12 Tokens
            const mockFa2DepositAmount       = 150000000;   // 150 Mock FA12 Tokens

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
            updateOperatorsOperation = await helperFunctions.updateOperators(mockFa2TokenInstance, eve.pkh, vaultAddress, tokenId);
            await updateOperatorsOperation.confirmation();

            // eve deposits mock FA2 tokens into vault
            const eveDepositTokenOperation = await vaultInstance.methods.initVaultAction(
                "deposit",
                mockFa2DepositAmount,             
                "eurl"
            ).send();
            await eveDepositTokenOperation.confirmation();

            console.log('   - vault collateral deposited');

            // ----------------------------------------------------------------------------------------------
            // Borrow with Vault
            // ----------------------------------------------------------------------------------------------

            // borrow amount - 20 Tez
            const borrowAmount = 20000000;   

            // borrow operation
            const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
            await eveBorrowOperation.confirmation();

            console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName);

            // get initial XTZ balance for Eve, Treasury and Token Pool Reward Contract
            const eveXtzLedger   = await utils.tezos.tz.getBalance(eve.pkh);
            const eveInitialXtzBalance  = eveXtzLedger.toNumber();

            const treasuryXtzLedger   = await utils.tezos.tz.getBalance(contractDeployments.treasury.address);
            const treasuryInitialXtzBalance  = treasuryXtzLedger.toNumber();

            // get token pool stats
            const afterBorrowloanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const loanTokenDecimals    = afterBorrowloanTokenRecordView.tokenDecimals;
            const interestRateDecimals = (27 - 2); 

            const tokenPoolTotal           = afterBorrowloanTokenRecordView.tokenPoolTotal.toNumber() / (10 ** loanTokenDecimals);
            const totalBorrowed            = afterBorrowloanTokenRecordView.totalBorrowed.toNumber() / (10 ** loanTokenDecimals);
            const optimalUtilisationRate   = Number(afterBorrowloanTokenRecordView.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const utilisationRate          = Number(afterBorrowloanTokenRecordView.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const currentInterestRate      = Number(afterBorrowloanTokenRecordView.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";

            console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);

            // ----------------------------------------------------------------------------------------------
            // Set Block Levels For Mock Time Test - 1 year
            // ----------------------------------------------------------------------------------------------

            await helperFunctions.signerFactory(tezos, bob.sk); // temporarily set to tester to increase block levels

            const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
            const updatedVault                      = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const lastUpdatedBlockLevel             = updatedVault.lastUpdatedBlockLevel;

            const newBlockLevel = lastUpdatedBlockLevel.toNumber() + oneYearLevelBlocks;

            const setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(newBlockLevel, 'configMockLevel').send();
            await setMockLevelOperation.confirmation();

            const mockTimeLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedMockLevel = mockTimeLendingControllerStorage.config.mockLevel;

            assert.equal(updatedMockLevel, newBlockLevel);

            console.log('   - time set to 1 year ahead: ' + lastUpdatedBlockLevel + ' to ' + newBlockLevel);

            // ----------------------------------------------------------------------------------------------
            // Repay partial debt 
            // ----------------------------------------------------------------------------------------------

            // set back to user
            await helperFunctions.signerFactory(tezos, eve.sk);  

            // treasury share of interest repaid
            const configInterestTreasuryShare = await lendingControllerStorage.config.interestTreasuryShare;

            // repayment amount
            const repayAmount = 500000; // 0.5 Tez

            // get vault and loan token views, and storage
            const vaultRecordView        = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            const loanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const beforeRepaymentStorage = await lendingControllerInstance.storage();

            const initialVaultLoanOutstandingTotal         = vaultRecordView.loanOutstandingTotal;
            const beforeRepaymentVaultBorrowIndex          = vaultRecordView.borrowIndex;
            const beforeRepaymentVaultOutstandingTotal     = vaultRecordView.loanOutstandingTotal;
            const beforeRepaymentVaultPrincipalTotal       = vaultRecordView.loanPrincipalTotal;
            const beforeRepaymentTokenBorrowIndex          = loanTokenRecordView.borrowIndex;

            // const repayOpParam        = await lendingControllerInstance.methods.repay(vaultId, repayAmount).toTransferParams();
            // const estimate            = await utils.tezos.estimate.transfer(repayOpParam);
            // console.log("REPAY OP ESTIMATION: ", estimate);

            // repay operation
            const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send({ mutez : true, amount : repayAmount});
            await eveRepayOperation.confirmation();

            console.log('   - repaid: ' + repayAmount + " | type: " + loanTokenName);

            // get updated storage
            const updatedLendingControllerStorageAfterRepay     = await lendingControllerInstance.storage();
            const updatedVaultRecord                            = await updatedLendingControllerStorageAfterRepay.vaults.get(vaultHandle);
            const updatedMockFa2TokenStorage                    = await mockFa2TokenInstance.storage();
            
            // get updated XTZ balance for Eve, Treasury and Token Pool Reward Contract
            const updatedEveXtzLedger                           = await utils.tezos.tz.getBalance(eve.pkh);
            const updatedEveXtzBalance                          = updatedEveXtzLedger.toNumber();

            const updatedTreasuryXtzLedger                      = await utils.tezos.tz.getBalance(contractDeployments.treasury.address);
            const updatedTreasuryXtzBalance                     = updatedTreasuryXtzLedger.toNumber();

            // On-chain views to vault and loan token
            const updatedVaultRecordView     = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            const updatedLoanTokenRecordView = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});

            const updatedLoanOutstandingTotal             = updatedVaultRecordView.loanOutstandingTotal;
            const updatedLoanPrincipalTotal               = updatedVaultRecordView.loanPrincipalTotal;
            const updatedLoanInterestTotal                = updatedVaultRecordView.loanInterestTotal;

            const afterRepaymentVaultBorrowIndex          = updatedVaultRecordView.borrowIndex;
            const afterRepaymentTokenBorrowIndex          = updatedLoanTokenRecordView.borrowIndex;
            
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

            console.log('   - final vault stats >> outstanding total: ' + finalLoanOutstandingTotal + " | principal total: " + finalLoanPrincipalTotal  + " | interest total: " + finalLoanInterestTotal);
            console.log('   - interest stats >> total interest: ' + totalInterest + ' | interest paid: ' + totalInterestPaid +' | interest to treasury: ' + interestTreasuryShare + " | interest to reward pool: " + interestRewards);

            assert.equal(helperFunctions.almostEqual(updatedLoanOutstandingTotal, finalLoanOutstandingTotal, 0.0001), true);
            assert.equal(helperFunctions.almostEqual(updatedLoanPrincipalTotal, finalLoanPrincipalTotal, 0.0001), true);
            assert.equal(helperFunctions.almostEqual(updatedLoanInterestTotal.toNumber(), finalLoanInterestTotal, 0.0001), true);
            assert.equal(afterRepaymentVaultBorrowIndex.toNumber(), afterRepaymentTokenBorrowIndex.toNumber());
            
            // account for minor gas cost difference
            assert.equal(helperFunctions.almostEqual(updatedEveXtzBalance, eveInitialXtzBalance - repayAmount, 0.0001), true);

            // check treasury fees and interest to token pool reward contract
            assert.equal(helperFunctions.almostEqual(updatedTreasuryXtzBalance, treasuryInitialXtzBalance + interestTreasuryShare, 0.0001), true);

        })


        it('user (eve) can repay debt - TEZ  - mock one year - utilisation rate above optimal utilisation rate - repayment less than interest', async () => {

            // Conditions: 
            // - vault loan token: tez
            // - mock time: 1 year
            // - token pool interest rate: above optimal utilisation rate
            // - repay amount: less than interest amount 

            // Summary of steps:
            // 1. Create Vault
            // 2. Deposit collateral into vault (100 Mock FA12 Tokens, 100 Mock FA2 Tokens)
            // 3. Borrow from vault (20 Tez)
            // 4. Set block levels time to 1 year in future
            // 5. Repay partial debt

            // init variables
            await helperFunctions.signerFactory(tezos, eve.sk);
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
            const newVaultRecord = await lendingControllerStorage.vaults.get(vaultHandle);
            const vaultAddress   = newVaultRecord.address;
            const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

            console.log('   - vault originated: ' + vaultAddress);
            console.log('   - vault id: ' + vaultId);

            // push new vault id to vault set
            eveVaultSet.push(vaultId);

            // ----------------------------------------------------------------------------------------------
            // Deposit Collateral into Vault
            // ----------------------------------------------------------------------------------------------

            const mockFa12DepositAmount      = 150000000;   // 150 Mock FA12 Tokens
            const mockFa2DepositAmount       = 150000000;   // 150 Mock FA12 Tokens

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
            updateOperatorsOperation = await helperFunctions.updateOperators(mockFa2TokenInstance, eve.pkh, vaultAddress, tokenId);
            await updateOperatorsOperation.confirmation();
            
            // eve deposits mock FA2 tokens into vault
            const eveDepositTokenOperation = await vaultInstance.methods.initVaultAction(
                "deposit",
                mockFa2DepositAmount,                  
                "eurl"
            ).send();
            await eveDepositTokenOperation.confirmation();

            console.log('   - vault collateral deposited');

            // ----------------------------------------------------------------------------------------------
            // Borrow with Vault
            // ----------------------------------------------------------------------------------------------

            // borrow amount - 20 Tez
            const borrowAmount = 20000000;   

            // borrow operation
            const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
            await eveBorrowOperation.confirmation();

            console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName);

            // get initial XTZ balance for Eve, Treasury and Token Pool Reward Contract
            const eveXtzLedger   = await utils.tezos.tz.getBalance(eve.pkh);
            const eveInitialXtzBalance  = eveXtzLedger.toNumber();

            const treasuryXtzLedger   = await utils.tezos.tz.getBalance(contractDeployments.treasury.address);
            const treasuryInitialXtzBalance  = treasuryXtzLedger.toNumber();

            // get token pool stats
            const afterBorrowloanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const loanTokenDecimals    = afterBorrowloanTokenRecordView.tokenDecimals;
            const interestRateDecimals = (27 - 2); 

            const tokenPoolTotal           = afterBorrowloanTokenRecordView.tokenPoolTotal.toNumber() / (10 ** loanTokenDecimals);
            const totalBorrowed            = afterBorrowloanTokenRecordView.totalBorrowed.toNumber() / (10 ** loanTokenDecimals);
            const optimalUtilisationRate   = Number(afterBorrowloanTokenRecordView.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const utilisationRate          = Number(afterBorrowloanTokenRecordView.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const currentInterestRate      = Number(afterBorrowloanTokenRecordView.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";

            console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);

            // ----------------------------------------------------------------------------------------------
            // Set Block Levels For Mock Time Test - 1 year
            // ----------------------------------------------------------------------------------------------

            await helperFunctions.signerFactory(tezos, bob.sk); // temporarily set to tester to increase block levels

            const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
            const updatedVault                      = await updatedLendingControllerStorage.vaults.get(vaultHandle);
            const lastUpdatedBlockLevel             = updatedVault.lastUpdatedBlockLevel;

            const newBlockLevel = lastUpdatedBlockLevel.toNumber() + oneYearLevelBlocks;

            const setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(newBlockLevel, 'configMockLevel').send();
            await setMockLevelOperation.confirmation();

            const mockTimeLendingControllerStorage = await lendingControllerInstance.storage();
            const updatedMockLevel = mockTimeLendingControllerStorage.config.mockLevel;

            assert.equal(updatedMockLevel, newBlockLevel);

            console.log('   - time set to 1 year ahead: ' + lastUpdatedBlockLevel + ' to ' + newBlockLevel);

            // ----------------------------------------------------------------------------------------------
            // Repay partial debt 
            // ----------------------------------------------------------------------------------------------

            // set back to user
            await helperFunctions.signerFactory(tezos, eve.sk);  

            // treasury share of interest repaid
            const configInterestTreasuryShare = await lendingControllerStorage.config.interestTreasuryShare;

            // repayment amount
            const repayAmount = 10000; // 0.01 Tez

            // get vault and loan token views, and storage
            const vaultRecordView        = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            const loanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            const beforeRepaymentStorage = await lendingControllerInstance.storage();

            const initialVaultLoanOutstandingTotal         = vaultRecordView.loanOutstandingTotal;
            const beforeRepaymentVaultBorrowIndex          = vaultRecordView.borrowIndex;
            const beforeRepaymentVaultOutstandingTotal     = vaultRecordView.loanOutstandingTotal;
            const beforeRepaymentVaultPrincipalTotal       = vaultRecordView.loanPrincipalTotal;
            const beforeRepaymentTokenBorrowIndex          = loanTokenRecordView.borrowIndex;

            // const repayOpParam        = await lendingControllerInstance.methods.repay(vaultId, repayAmount).toTransferParams();
            // const estimate            = await utils.tezos.estimate.transfer(repayOpParam);
            // console.log("REPAY OP ESTIMATION: ", estimate);

            // repay operation
            const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send({ mutez : true, amount : repayAmount});
            await eveRepayOperation.confirmation();

            console.log('   - repaid: ' + repayAmount + " | type: " + loanTokenName);

            // get updated storage
            const updatedLendingControllerStorageAfterRepay     = await lendingControllerInstance.storage();
            const updatedVaultRecord                            = await updatedLendingControllerStorageAfterRepay.vaults.get(vaultHandle);
            const updatedMockFa2TokenStorage                    = await mockFa2TokenInstance.storage();
            
            // get updated XTZ balance for Eve, Treasury and Token Pool Reward Contract
            const updatedEveXtzLedger                           = await utils.tezos.tz.getBalance(eve.pkh);
            const updatedEveXtzBalance                          = updatedEveXtzLedger.toNumber();

            const updatedTreasuryXtzLedger                      = await utils.tezos.tz.getBalance(contractDeployments.treasury.address);
            const updatedTreasuryXtzBalance                     = updatedTreasuryXtzLedger.toNumber();

            // On-chain views to vault and loan token
            const updatedVaultRecordView     = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
            const updatedLoanTokenRecordView = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});

            const updatedLoanOutstandingTotal             = updatedVaultRecordView.loanOutstandingTotal;
            const updatedLoanPrincipalTotal               = updatedVaultRecordView.loanPrincipalTotal;
            const updatedLoanInterestTotal                = updatedVaultRecordView.loanInterestTotal;

            const afterRepaymentVaultBorrowIndex          = updatedVaultRecordView.borrowIndex;
            const afterRepaymentTokenBorrowIndex          = updatedLoanTokenRecordView.borrowIndex;
            
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

            console.log('   - final vault stats >> outstanding total: ' + finalLoanOutstandingTotal + " | principal total: " + finalLoanPrincipalTotal  + " | interest total: " + finalLoanInterestTotal);
            console.log('   - interest stats >> total interest: ' + totalInterest + ' | interest paid: ' + totalInterestPaid +' | interest to treasury: ' + interestTreasuryShare + " | interest to reward pool: " + interestRewards);

            assert.equal(helperFunctions.almostEqual(updatedLoanOutstandingTotal, finalLoanOutstandingTotal, 0.0001), true);
            assert.equal(helperFunctions.almostEqual(updatedLoanPrincipalTotal, finalLoanPrincipalTotal, 0.0001), true);
            assert.equal(helperFunctions.almostEqual(updatedLoanInterestTotal.toNumber(), finalLoanInterestTotal, 0.0001), true);
            assert.equal(afterRepaymentVaultBorrowIndex.toNumber(), afterRepaymentTokenBorrowIndex.toNumber());
            
            // account for minor gas cost difference
            assert.equal(helperFunctions.almostEqual(updatedEveXtzBalance, eveInitialXtzBalance - repayAmount, 0.0001), true);

            // check treasury fees and interest to token pool reward contract
            assert.equal(helperFunctions.almostEqual(updatedTreasuryXtzBalance, treasuryInitialXtzBalance + interestTreasuryShare, 0.0001), true);

        })

    })

});