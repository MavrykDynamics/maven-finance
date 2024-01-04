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
import { 
    signerFactory, 
    almostEqual,
    updateOperators,
    updateGeneralContracts
} from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("Lending Controller (mToken) tests", async () => {
    
    var utils: Utils
    let tezos

    //  - eve: first vault loan token: usdt, second vault loan token: eurt, third vault loan token - tez
    //  - mallory: first vault loan token: usdt, second vault loan token: eurt
    var eveVaultSet     : Array<Number> = []
    var malloryVaultSet : Array<Number> = []
    
    let tokenId = 0

    // const oneDayLevelBlocks = 4320
    // const oneMonthLevelBlocks = 129600
    // const oneYearLevelBlocks = 1576800

    // 3 seconds blocks (docker sandbox)
    const oneMinuteLevelBlocks  = 20
    const oneDayLevelBlocks     = 28800
    const oneMonthLevelBlocks   = 864000
    const oneYearLevelBlocks    = 10512000 // 365 days

    const secondsInYears = 31536000
    const fixedPointAccuracy = 10**27
    
    // oracles
    let tokenOracles : {name : string, price : number, priceDecimals : number, tokenDecimals : number}[] = []
    let defaultObservations
    let defaultPriceObservations

    let usdtTokenIndex
    let eurtTokenIndex
    let tezIndex

    let lendingControllerAddress
    
    // ------------------------------------------------
    //  Contract Instances
    // ------------------------------------------------

    let doormanInstance
    let delegationInstance
    let mvnTokenInstance
    let treasuryInstance
    
    let usdtTokenInstance
    let eurtTokenInstance

    let mockUsdMockFa12TokenAggregatorInstance
    let mockUsdMockFa2TokenAggregatorInstance
    let mockUsdXtzAggregatorInstance
    let mockUsdMvnAggregatorInstance

    let mUsdtTokenInstance
    let mEurtTokenInstance
    let mXtzTokenInstance

    let governanceInstance
    let governanceProxyInstance

    let lendingControllerInstance
    let vaultFactoryInstance

    // ------------------------------------------------
    //  Contract Storages
    // ------------------------------------------------

    let doormanStorage
    let delegationStorage
    let mvnTokenStorage
    let treasuryStorage
    let governanceStorage
    let governanceProxyStorage

    let usdtTokenStorage
    let eurtTokenStorage

    let mockUsdMockFa12TokenAggregatorStorage
    let mockUsdMockFa2TokenAggregatorStorage
    let mockUsdXtzAggregatorStorage
    let mockUsdMvnAggregatorStorage

    let lendingControllerStorage
    let vaultFactoryStorage

    let mTokenUsdtStorage

    // ------------------------------------------------
    //  Test Variables
    // ------------------------------------------------

    // mock levels, rounds, and epochs
    let epoch 
    let lastEpoch 
    let round
    let currentMockLevel      
    let newMockLevel
    let mockLevelChange
    let markedForLiquidationLevel
    let minutesPassed
    let lastUpdatedBlockLevel
    let maxDecimals

    // operations
    let setPriceOperation
    let resetTokenAllowance
    let setNewTokenAllowance
    let updateOperatorsOperation
    let liquidateVaultOperation
    let failLiquidateVaultOperation
    let updateTokenRewardIndexOperation
    let compoundOperation

    // vault
    let vaultRecord
    let vaultLoanOutstandingTotal
    let vaultLoanPrincipalTotal
    let vaultLoanInterestTotal
    let vaultBorrowIndex
    
    // vault initial variables
    let initialVaultBorrowIndex
    let initialVaultLoanOutstandingTotal
    let initialVaultLoanPrincipalTotal
    let initialVaultLoanInterestTotal

    // vault updated variables
    let updatedVaultBorrowIndex
    let updatedVaultLoanOutstandingTotal

    // vault loan variables
    let finalLoanOutstandingTotal
    let finalLoanPrincipalTotal
    let finalLoanInterestTotal
    let loanOutstandingWithAccruedInterest
    let totalInterest
    let remainingInterest

    // loan token variables
    let loanTokenRecord
    let loanTokenDecimals
    let loanTokenBorrowIndex
    let initialLoanTokenBorrowIndex
    let updatedLoanTokenBorrowIndex

    // liquidation variables
    let vaultMaxLiquidationAmount
    let totalInterestPaid
    let liquidationIncentive
    
    let liquidationAmountWithFeesAndIncentive
    let totalLiquidationAmount
    let liquidationAmountWithIncentive
    let adminLiquidationFee
    
    let interestSentToTreasury
    let interestRewards

    // ------------------------------------------------
    // Token accounts (ledger) for Lending Controller (i.e. token pool)
    let lendingControllerMockFa12TokenAccount

    // Token accounts (ledger) for Liquidator
    let liquidatorMockFa12TokenAccount

    // Token accounts (ledger) for vaults
    let vaultMockFa12TokenAccount

    // Token accounts (ledger) for vault owners
    let vaultOwnerMockFa12TokenAccount

    // Token accounts (ledger) for admin treasury
    let treasuryMockFa12TokenAccount
    // ------------------------------------------------


    // ------------------------------------------------
    // Mock FA-12 Token balances (initial and updated)
    // ------------------------------------------------
    
    // Initial token balances for Mock FA-12 Token
    let initialLendingControllerMockFa12TokenBalance
    let initialVaultMockFa12TokenBalance
    let initialVaultOwnerMockFa12TokenBalance
    let initialLiquidatorMockFa12TokenBalance
    let initialTreasuryMockFa12TokenBalance

    // Updated token balances for Mock FA-12 Token
    let updatedLendingControllerMockFa12TokenBalance
    let updatedVaultMockFa12TokenBalance
    let updatedVaultOwnerMockFa12TokenBalance
    let updatedLiquidatorMockFa12TokenBalance
    let updatedTreasuryMockFa12TokenBalance

    // ------------------------------------------------

    before("setup", async () => {

        utils = new Utils();
        await utils.init(bob.sk);
        tezos = utils.tezos

        lendingControllerAddress                = contractDeployments.lendingControllerMockTime.address;
        
        doormanInstance                         = await utils.tezos.contract.at(contractDeployments.doorman.address);
        delegationInstance                      = await utils.tezos.contract.at(contractDeployments.delegation.address);
        mvnTokenInstance                        = await utils.tezos.contract.at(contractDeployments.mvnToken.address);
        treasuryInstance                        = await utils.tezos.contract.at(contractDeployments.treasury.address);

        usdtTokenInstance                       = await utils.tezos.contract.at(contractDeployments.mavenFa12Token.address);
        eurtTokenInstance                       = await utils.tezos.contract.at(contractDeployments.mavenFa2Token.address);
        governanceInstance                      = await utils.tezos.contract.at(contractDeployments.governance.address);
        governanceProxyInstance                 = await utils.tezos.contract.at(contractDeployments.governanceProxy.address);

        mUsdtTokenInstance                      = await utils.tezos.contract.at(contractDeployments.mTokenUsdt.address);
        mEurtTokenInstance                      = await utils.tezos.contract.at(contractDeployments.mTokenEurt.address);
        mXtzTokenInstance                       = await utils.tezos.contract.at(contractDeployments.mTokenXtz.address);

        mockUsdMockFa12TokenAggregatorInstance  = await utils.tezos.contract.at(contractDeployments.mockUsdMockFa12TokenAggregator.address);
        mockUsdMockFa2TokenAggregatorInstance   = await utils.tezos.contract.at(contractDeployments.mockUsdMockFa2TokenAggregator.address);
        mockUsdXtzAggregatorInstance            = await utils.tezos.contract.at(contractDeployments.mockUsdXtzAggregator.address);
        mockUsdMvnAggregatorInstance            = await utils.tezos.contract.at(contractDeployments.mockUsdMvnAggregator.address);

        lendingControllerInstance               = await utils.tezos.contract.at(lendingControllerAddress);
        vaultFactoryInstance                    = await utils.tezos.contract.at(contractDeployments.vaultFactory.address);

        doormanStorage                          = await doormanInstance.storage();
        delegationStorage                       = await delegationInstance.storage();
        mvnTokenStorage                         = await mvnTokenInstance.storage();
        treasuryStorage                         = await treasuryInstance.storage();

        usdtTokenStorage                        = await usdtTokenInstance.storage();
        eurtTokenStorage                        = await eurtTokenInstance.storage();
        governanceStorage                       = await governanceInstance.storage();
        governanceProxyStorage                  = await governanceInstance.storage();
        lendingControllerStorage                = await lendingControllerInstance.storage();
        vaultFactoryStorage                     = await vaultFactoryInstance.storage();

        mTokenUsdtStorage                       = await mUsdtTokenInstance.storage();

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
        mockUsdMvnAggregatorStorage             = await mockUsdMvnAggregatorInstance.storage();

        tokenOracles.push({
            'name': 'usdt', 
            'price': mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.data.toNumber(),
            'priceDecimals': mockUsdMockFa12TokenAggregatorStorage.config.decimals.toNumber(),
            'tokenDecimals': 0
        })

        tokenOracles.push({
            'name': 'eurt', 
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
            'name': "smvn", 
            'price': mockUsdMvnAggregatorStorage.lastCompletedData.data.toNumber(),
            'priceDecimals': mockUsdMvnAggregatorStorage.config.decimals.toNumber(),
            'tokenDecimals': 9
        })

        // ------------------------------------------------------------------
        //
        // Update LP Tokens (i.e. mTokens) tokenRewardIndex by transferring 0
        //  - this will ensure that fetching user balances through on-chain views are accurate for continuous re-testing
        //
        // ------------------------------------------------------------------
        await signerFactory(tezos, bob.sk);

        const usdtLoanToken  = await lendingControllerStorage.loanTokenLedger.get("usdt"); 
        const eurtLoanToken  = await lendingControllerStorage.loanTokenLedger.get("eurt"); 
        const tezLoanToken   = await lendingControllerStorage.loanTokenLedger.get("tez"); 
        
        if(!(usdtLoanToken == undefined || usdtLoanToken == null)){
            updateTokenRewardIndexOperation = await mUsdtTokenInstance.methods.compound([bob.pkh, eve.pkh]).send();
            await updateTokenRewardIndexOperation.confirmation();
        }

        if(!(eurtLoanToken == undefined || eurtLoanToken == null)){
            updateTokenRewardIndexOperation = await mEurtTokenInstance.methods.compound([bob.pkh, eve.pkh]).send();
            await updateTokenRewardIndexOperation.confirmation();
        }

        if(!(tezLoanToken == undefined || tezLoanToken == null)){
            updateTokenRewardIndexOperation = await mXtzTokenInstance.methods.compound([bob.pkh, eve.pkh]).send();
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
                const tokenContractAddress                  = contractDeployments.mavenFa12Token.address;
                const tokenType                             = "fa12";
                const tokenDecimals                         = 6;

                const oracleAddress                         = contractDeployments.mockUsdMockFa12TokenAggregator.address;

                const mTokenAddress                         = contractDeployments.mTokenUsdt.address;

                const interestRateDecimals                  = 27;
                const reserveRatio                          = 1000; // 10% reserves (4 decimals)
                const optimalUtilisationRate                = 50 * (10 ** (interestRateDecimals - 2));  // 30% utilisation rate kink
                const baseInterestRate                      = 5  * (10 ** (interestRateDecimals - 2));  // 5%
                const maxInterestRate                       = 25 * (10 ** (interestRateDecimals - 2));  // 25% 
                const interestRateBelowOptimalUtilisation   = 10 * (10 ** (interestRateDecimals - 2));  // 10% 
                const interestRateAboveOptimalUtilisation   = 20 * (10 ** (interestRateDecimals - 2));  // 20%

                const minRepaymentAmount                    = 10000;

                // update token oracle with token decimals
                usdtTokenIndex = tokenOracles.findIndex((o => o.name === "usdt"));
                tokenOracles[usdtTokenIndex].tokenDecimals = tokenDecimals;

                // check if loan token exists
                const checkLoanTokenExists   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

                if(checkLoanTokenExists === undefined){

                    const adminSetMockFa12LoanTokenOperation = await lendingControllerInstance.methods.setLoanToken(
                        
                        setLoanTokenActionType,

                        tokenName,
                        tokenDecimals,

                        oracleAddress,

                        mTokenAddress,
                        
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
                    const usdtLoanToken   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

                    assert.equal(usdtLoanToken.tokenName              , tokenName);
    
                    assert.equal(usdtLoanToken.rawMTokensTotalSupply  , 0);
                    assert.equal(usdtLoanToken.mTokenAddress          , mTokenAddress);
    
                    assert.equal(usdtLoanToken.reserveRatio           , reserveRatio);
                    assert.equal(usdtLoanToken.tokenPoolTotal         , 0);
                    assert.equal(usdtLoanToken.totalBorrowed          , 0);
                    assert.equal(usdtLoanToken.totalRemaining         , 0);
    
                    assert.equal(usdtLoanToken.optimalUtilisationRate , optimalUtilisationRate);
                    assert.equal(usdtLoanToken.baseInterestRate       , baseInterestRate);
                    assert.equal(usdtLoanToken.maxInterestRate        , maxInterestRate);
                    
                    assert.equal(usdtLoanToken.interestRateBelowOptimalUtilisation       , interestRateBelowOptimalUtilisation);
                    assert.equal(usdtLoanToken.interestRateAboveOptimalUtilisation       , interestRateAboveOptimalUtilisation);
    
                } else {

                    lendingControllerStorage  = await lendingControllerInstance.storage();
                    const usdtLoanToken       = await lendingControllerStorage.loanTokenLedger.get(tokenName); 
                
                    // other variables will be affected by repeated tests
                    assert.equal(usdtLoanToken.tokenName              , tokenName);

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

                const tokenName                             = "eurt";
                const tokenContractAddress                  = contractDeployments.mavenFa2Token.address;
                const tokenType                             = "fa2";
                const tokenDecimals                         = 6;

                const oracleAddress                         = contractDeployments.mockUsdMockFa2TokenAggregator.address;

                const mTokenAddress                         = contractDeployments.mTokenEurt.address;

                const interestRateDecimals                  = 27;
                const reserveRatio                          = 1000; // 10% reserves (4 decimals)
                const optimalUtilisationRate                = 50 * (10 ** (interestRateDecimals - 2));  // 30% utilisation rate kink
                const baseInterestRate                      = 5  * (10 ** (interestRateDecimals - 2));  // 5%
                const maxInterestRate                       = 25 * (10 ** (interestRateDecimals - 2));  // 25% 
                const interestRateBelowOptimalUtilisation   = 10 * (10 ** (interestRateDecimals - 2));  // 10% 
                const interestRateAboveOptimalUtilisation   = 20 * (10 ** (interestRateDecimals - 2));  // 20%

                const minRepaymentAmount                    = 10000;

                // update token oracle with token decimals
                eurtTokenIndex = tokenOracles.findIndex((o => o.name === "eurt"));
                tokenOracles[eurtTokenIndex].tokenDecimals = tokenDecimals;

                const checkLoanTokenExists = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

                if(checkLoanTokenExists === undefined){

                    const adminSetMockFa2LoanTokenOperation = await lendingControllerInstance.methods.setLoanToken(
                        
                        setLoanTokenActionType,

                        tokenName,
                        tokenDecimals,

                        oracleAddress,

                        mTokenAddress,
                        
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
                    const eurtLoanToken      = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

                    assert.equal(eurtLoanToken.tokenName              , tokenName);

                    assert.equal(eurtLoanToken.rawMTokensTotalSupply           , 0);
                    assert.equal(eurtLoanToken.mTokenAddress          , mTokenAddress);

                    assert.equal(eurtLoanToken.reserveRatio           , reserveRatio);
                    assert.equal(eurtLoanToken.tokenPoolTotal         , 0);
                    assert.equal(eurtLoanToken.totalBorrowed          , 0);
                    assert.equal(eurtLoanToken.totalRemaining         , 0);

                    assert.equal(eurtLoanToken.optimalUtilisationRate , optimalUtilisationRate);
                    assert.equal(eurtLoanToken.baseInterestRate       , baseInterestRate);
                    assert.equal(eurtLoanToken.maxInterestRate        , maxInterestRate);
                    
                    assert.equal(eurtLoanToken.interestRateBelowOptimalUtilisation       , interestRateBelowOptimalUtilisation);
                    assert.equal(eurtLoanToken.interestRateAboveOptimalUtilisation       , interestRateAboveOptimalUtilisation);

                } else {

                    lendingControllerStorage = await lendingControllerInstance.storage();
                    const eurtLoanToken      = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

                    // other variables will be affected by repeated tests
                    assert.equal(eurtLoanToken.tokenName              , tokenName);

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

                const mTokenAddress                         = contractDeployments.mTokenXtz.address;

                const interestRateDecimals                  = 27;
                const reserveRatio                          = 1000; // 10% reserves (4 decimals)
                const optimalUtilisationRate                = 50 * (10 ** (interestRateDecimals - 2));  // 30% utilisation rate kink
                const baseInterestRate                      = 5  * (10 ** (interestRateDecimals - 2));  // 5%
                const maxInterestRate                       = 25 * (10 ** (interestRateDecimals - 2));  // 25% 
                const interestRateBelowOptimalUtilisation   = 10 * (10 ** (interestRateDecimals - 2));  // 10% 
                const interestRateAboveOptimalUtilisation   = 20 * (10 ** (interestRateDecimals - 2));  // 20%

                const minRepaymentAmount                    = 10000;

                // update token oracle with token decimals
                tezIndex = tokenOracles.findIndex((o => o.name === "tez"));
                tokenOracles[tezIndex].tokenDecimals = tokenDecimals;

                // check if loan token exists
                const checkLoanTokenExists = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

                if(checkLoanTokenExists === undefined){

                    const adminSeTezLoanTokenOperation = await lendingControllerInstance.methods.setLoanToken(
                        
                        setLoanTokenActionType,

                        tokenName,
                        tokenDecimals,

                        oracleAddress,

                        mTokenAddress,
                        
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
                    const tezLoanToken        = await lendingControllerStorage.loanTokenLedger.get(tokenName); 
                
                    assert.equal(tezLoanToken.tokenName              , tokenName);
                    assert.equal(tezLoanToken.tokenDecimals          , tokenDecimals);

                    assert.equal(tezLoanToken.rawMTokensTotalSupply           , 0);
                    assert.equal(tezLoanToken.mTokenAddress          , mTokenAddress);
    
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
                    const tezLoanToken        = await lendingControllerStorage.loanTokenLedger.get(tokenName); 
                
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
                const tokenContractAddress                  = contractDeployments.mavenFa2Token.address;
                const tokenType                             = "fa2";
                const tokenDecimals                         = 6;

                const oracleAddress                         = contractDeployments.mockUsdXtzAggregator.address;

                const mTokenAddress                         = contractDeployments.mTokenEurt.address;

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

                    mTokenAddress,
                    
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
                lendingControllerStorage  = await lendingControllerInstance.storage();
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
                await signerFactory(tezos, bob.sk);

                const setCollateralTokenActionType      = "createCollateralToken";
                const tokenName                         = "usdt";
                const tokenContractAddress              = contractDeployments.mavenFa12Token.address;
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

                    lendingControllerStorage    = await lendingControllerInstance.storage();
                    const usdtCollateralToken   = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 
                
                    assert.equal(usdtCollateralToken.tokenName              , tokenName);

                    assert.equal(usdtCollateralToken.tokenDecimals          , tokenDecimals);
                    assert.equal(usdtCollateralToken.oracleAddress          , oracleAddress);
                    assert.equal(usdtCollateralToken.protected              , tokenProtected);

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
                const tokenName                             = "eurt";
                const tokenContractAddress                  = contractDeployments.mavenFa2Token.address;
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

                    lendingControllerStorage     = await lendingControllerInstance.storage();
                    const eurtCollateralToken    = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

                    assert.equal(eurtCollateralToken.tokenName              , tokenName);

                    assert.equal(eurtCollateralToken.tokenDecimals          , tokenDecimals);
                    assert.equal(eurtCollateralToken.oracleAddress          , oracleAddress);
                    assert.equal(eurtCollateralToken.protected              , tokenProtected);

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

                    lendingControllerStorage     = await lendingControllerInstance.storage();
                    const eurtCollateralToken    = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

                    assert.equal(eurtCollateralToken.tokenName              , tokenName);

                    assert.equal(eurtCollateralToken.tokenDecimals          , tokenDecimals);
                    assert.equal(eurtCollateralToken.oracleAddress          , oracleAddress);
                    assert.equal(eurtCollateralToken.protected              , tokenProtected);

                }

            } catch(e){
                console.log(e);
            } 
        });


        it('admin can set mToken - LP Token Pool: Mock FA12 Token as a collateral token', async () => {

            try{        
                
                // init variables
                await signerFactory(tezos, bob.sk);

                const setCollateralTokenActionType          = "createCollateralToken";
                const tokenName                             = "mTokenMockFa12";
                const tokenContractAddress                  = contractDeployments.mTokenUsdt.address;
                const tokenType                             = "fa2";

                const tokenDecimals                         = 6;
                const oracleAddress                         = contractDeployments.mockUsdMockFa12TokenAggregator.address;
                const tokenProtected                        = false;

                const isScaledToken                         = true;
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

                    lendingControllerStorage     = await lendingControllerInstance.storage();
                    const eurtCollateralToken    = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

                    assert.equal(eurtCollateralToken.tokenName              , tokenName);

                    assert.equal(eurtCollateralToken.tokenDecimals          , tokenDecimals);
                    assert.equal(eurtCollateralToken.oracleAddress          , oracleAddress);
                    assert.equal(eurtCollateralToken.protected              , tokenProtected);

                }

            } catch(e){
                console.log(e);
            } 
        });


        it('admin can set mToken - LP Token Pool: Mock FA2 Token as a collateral token', async () => {

            try{        
                
                // init variables
                await signerFactory(tezos, bob.sk);

                const setCollateralTokenActionType          = "createCollateralToken";
                const tokenName                             = "mTokenMockFa2";
                const tokenContractAddress                  = contractDeployments.mTokenEurt.address;
                const tokenType                             = "fa2";

                const tokenDecimals                         = 6;
                const oracleAddress                         = contractDeployments.mockUsdMockFa2TokenAggregator.address;
                const tokenProtected                        = false;

                const isScaledToken                         = true;
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

                    lendingControllerStorage     = await lendingControllerInstance.storage();
                    const eurtCollateralToken    = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

                    assert.equal(eurtCollateralToken.tokenName              , tokenName);

                    assert.equal(eurtCollateralToken.tokenDecimals          , tokenDecimals);
                    assert.equal(eurtCollateralToken.oracleAddress          , oracleAddress);
                    assert.equal(eurtCollateralToken.protected              , tokenProtected);

                }

            } catch(e){
                console.log(e);
            } 
        });


        it('admin can set mToken - LP Token Pool: Tez as a collateral token', async () => {

            try{        
                
                // init variables
                await signerFactory(tezos, bob.sk);

                const setCollateralTokenActionType          = "createCollateralToken";
                const tokenName                             = "mTokenTez";
                const tokenContractAddress                  = contractDeployments.mTokenXtz.address;
                const tokenType                             = "fa2";

                const tokenDecimals                         = 6;
                const oracleAddress                         = contractDeployments.mockUsdXtzAggregator.address;
                const tokenProtected                        = false;

                const isScaledToken                         = true;
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
                    const eurtCollateralToken    = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

                    assert.equal(eurtCollateralToken.tokenName              , tokenName);

                    assert.equal(eurtCollateralToken.tokenDecimals          , tokenDecimals);
                    assert.equal(eurtCollateralToken.oracleAddress          , oracleAddress);
                    assert.equal(eurtCollateralToken.protected              , tokenProtected);

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
                const tokenContractAddress                  = contractDeployments.mavenFa2Token.address;
                const tokenType                             = "fa2";

                const tokenDecimals                         = 6;
                const oracleAddress                         = zeroAddress;
                const tokenProtected                        = false;

                const isScaledToken                         = true;
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
            
            try{

                // init variables
                await signerFactory(tezos, eve.sk);
                const loanTokenName = "usdt";
                const liquidityAmount = 100000000; // 100 Mock FA12 Tokens

                lendingControllerStorage = await lendingControllerInstance.storage();
                
                // get mock fa12 token storage and mToken mock fa12 token storage
                const usdtTokenStorage                  = await usdtTokenInstance.storage();
                const lpTokenPoolMockFa12TokenStorage   = await mUsdtTokenInstance.storage();
                
                // get initial eve's Mock FA12 Token balance
                const eveMockFa12Ledger                 = await usdtTokenStorage.ledger.get(eve.pkh);            
                const eveInitialMockFa12TokenBalance    = eveMockFa12Ledger == undefined ? 0 : eveMockFa12Ledger.balance.toNumber();

                // get initial eve's Token Pool FA2 LP - Mock FA12 Token - balance
                const eveLpTokenPoolMockFa12Ledger                 = await lpTokenPoolMockFa12TokenStorage.ledger.get(eve.pkh);            
                const eveInitialLpTokenPoolMockFa12TokenBalance    = eveLpTokenPoolMockFa12Ledger == undefined ? 0 : eveLpTokenPoolMockFa12Ledger.toNumber();

                // get initial lending controller's Mock FA12 Token balance
                const lendingControllerMockFa12Ledger                = await usdtTokenStorage.ledger.get(lendingControllerAddress);            
                const lendingControllerInitialMockFa12TokenBalance   = lendingControllerMockFa12Ledger == undefined ? 0 : lendingControllerMockFa12Ledger.balance.toNumber();

                // get initial lending controller token pool total
                const initialLoanTokenRecord                 = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
                const lendingControllerInitialTokenPoolTotal = initialLoanTokenRecord.tokenPoolTotal.toNumber();

                // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
                // reset token allowance
                const resetTokenAllowance = await usdtTokenInstance.methods.approve(
                    lendingControllerAddress,
                    0
                ).send();
                await resetTokenAllowance.confirmation();

                // set new token allowance
                const setNewTokenAllowance = await usdtTokenInstance.methods.approve(
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
                const updatedMockFa12TokenStorage             = await usdtTokenInstance.storage();
                const updatedLpTokenPoolMockFa12TokenStorage  = await mUsdtTokenInstance.storage();

                // check new balance for loan token pool total
                const updatedLoanTokenRecord           = await updatedLendingControllerStorage.loanTokenLedger.get(loanTokenName);
                assert.equal(updatedLoanTokenRecord.tokenPoolTotal, lendingControllerInitialTokenPoolTotal + liquidityAmount);

                // check Eve's Mock FA12 Token balance
                const updatedEveMockFa12Ledger         = await updatedMockFa12TokenStorage.ledger.get(eve.pkh);            
                assert.equal(updatedEveMockFa12Ledger.balance, eveInitialMockFa12TokenBalance - liquidityAmount);

                // check Lending Controller's Mock FA12 Token Balance
                const lendingControllerMockFa12Account  = await updatedMockFa12TokenStorage.ledger.get(lendingControllerAddress);            
                assert.equal(lendingControllerMockFa12Account.balance, lendingControllerInitialMockFa12TokenBalance + liquidityAmount);

                // check Eve's LP Token Pool Mock FA12 Token balance
                const updatedEveLpTokenPoolMockFa12Ledger        = await updatedLpTokenPoolMockFa12TokenStorage.ledger.get(eve.pkh);            
                assert.equal(updatedEveLpTokenPoolMockFa12Ledger, eveInitialLpTokenPoolMockFa12TokenBalance + liquidityAmount);

            } catch(e) {
                console.dir(e, {depth: 5})
            }

        });

        it('user (eve) can add liquidity for mock FA2 token into Lending Controller token pool (100 MockFA2 Tokens)', async () => {
    
            // init variables
            await signerFactory(tezos, eve.sk);
            const loanTokenName = "eurt";
            const liquidityAmount = 100000000; // 100 Mock FA2 Tokens

            lendingControllerStorage = await lendingControllerInstance.storage();
            
            // get mock fa2 token storage and lp token pool mock fa2 token storage
            eurtTokenStorage                        = await eurtTokenInstance.storage();
            const lpTokenPoolMockFa2TokenStorage    = await mEurtTokenInstance.storage();
            
            // get initial eve's Mock FA2 Token balance
            const eveMockFa2Ledger                 = await eurtTokenStorage.ledger.get(eve.pkh);            
            const eveInitialMockFa2TokenBalance    = eveMockFa2Ledger == undefined ? 0 : eveMockFa2Ledger.toNumber();

            // get initial eve's Token Pool FA2 LP - Mock FA2 Token - balance
            const eveLpTokenPoolMockFa2Ledger                 = await lpTokenPoolMockFa2TokenStorage.ledger.get(eve.pkh);            
            const eveInitialLpTokenPoolMockFa2TokenBalance    = eveLpTokenPoolMockFa2Ledger == undefined ? 0 : eveLpTokenPoolMockFa2Ledger.toNumber();

            // get initial lending controller's Mock FA2 Token balance
            const lendingControllerMockFa2Ledger                = await eurtTokenStorage.ledger.get(lendingControllerAddress);            
            const lendingControllerInitialMockFa2TokenBalance   = lendingControllerMockFa2Ledger == undefined ? 0 : lendingControllerMockFa2Ledger.toNumber();

            // get initial lending controller token pool total
            const initialLoanTokenRecord                 = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
            const lendingControllerInitialTokenPoolTotal = initialLoanTokenRecord.tokenPoolTotal.toNumber();

            // update operators for vault
            updateOperatorsOperation = await updateOperators(eurtTokenInstance, eve.pkh, lendingControllerAddress, tokenId);
            await updateOperatorsOperation.confirmation();

            // eve deposits mock FA12 tokens into lending controller token pool
            const eveDepositTokenOperation  = await lendingControllerInstance.methods.addLiquidity(
                loanTokenName,
                liquidityAmount, 
            ).send();
            await eveDepositTokenOperation.confirmation();

            // get updated storages
            const updatedLendingControllerStorage  = await lendingControllerInstance.storage();
            const updatedMockFa2TokenStorage       = await eurtTokenInstance.storage();
            
            const updatedLpTokenPoolMockFa2TokenStorage     = await mEurtTokenInstance.storage();

            // check new balance for loan token pool total
            const updatedLoanTokenRecord           = await updatedLendingControllerStorage.loanTokenLedger.get(loanTokenName);
            assert.equal(updatedLoanTokenRecord.tokenPoolTotal, lendingControllerInitialTokenPoolTotal + liquidityAmount);

            // check Eve's Mock FA12 Token balance
            const updatedEveMockFa2Ledger          = await updatedMockFa2TokenStorage.ledger.get(eve.pkh);            
            assert.equal(updatedEveMockFa2Ledger, eveInitialMockFa2TokenBalance - liquidityAmount);

            // check Lending Controller's Mock FA2 Token Balance
            const lendingControllerMockFa2Account             = await updatedMockFa2TokenStorage.ledger.get(lendingControllerAddress);            
            assert.equal(lendingControllerMockFa2Account, lendingControllerInitialMockFa2TokenBalance + liquidityAmount);

            // check Eve's LP Token Pool Mock FA2 Token balance
            const updatedEveLpTokenPoolMockFa2Ledger        = await updatedLpTokenPoolMockFa2TokenStorage.ledger.get(eve.pkh);            
            assert.equal(updatedEveLpTokenPoolMockFa2Ledger, eveInitialLpTokenPoolMockFa2TokenBalance + liquidityAmount);        

        });


        it('user (eve) can add liquidity for tez into Lending Controller token pool (100 XTZ)', async () => {
    
            // init variables
            await signerFactory(tezos, eve.sk);
            const loanTokenName = "tez";
            const liquidityAmount = 100000000; // 100 XTZ

            lendingControllerStorage = await lendingControllerInstance.storage();
            
            // get LP token pool XTZ token storage (FA2 Token Standard)
            const lpTokenPoolXtzStorage   = await mXtzTokenInstance.storage();

            // get initial eve XTZ balance
            const eveInitialXtzLedger   = await utils.tezos.tz.getBalance(eve.pkh);
            const eveInitialXtzBalance  = eveInitialXtzLedger.toNumber();

            // get initial eve's Token Pool FA2 LP - Tez - balance
            const eveLpTokenPoolXtzLedger            = await lpTokenPoolXtzStorage.ledger.get(eve.pkh);            
            const eveInitialLpTokenPoolXtzBalance    = eveLpTokenPoolXtzLedger == undefined ? 0 : eveLpTokenPoolXtzLedger.toNumber();
            
            // get initial lending controller's XTZ balance
            const lendingControllerInitialXtzLedger   = await utils.tezos.tz.getBalance(lendingControllerAddress);
            const lendingControllerInitialXtzBalance  = lendingControllerInitialXtzLedger.toNumber();

            // get initial lending controller token pool total
            const initialLoanTokenRecord                 = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
            const lendingControllerInitialTokenPoolTotal = initialLoanTokenRecord.tokenPoolTotal.toNumber();

            // eve deposits mock XTZ into lending controller token pool
            const eveAddLiquidityOperation  = await lendingControllerInstance.methods.addLiquidity(
                loanTokenName,
                liquidityAmount, 
            ).send({ mumav : true, amount: liquidityAmount });
            await eveAddLiquidityOperation.confirmation();

            // get updated storages
            const updatedLendingControllerStorage  = await lendingControllerInstance.storage();
            const updatedLpTokenPoolXtzStorage     = await mXtzTokenInstance.storage();

            // check new balance for loan token pool total
            const updatedLoanTokenRecord           = await updatedLendingControllerStorage.loanTokenLedger.get(loanTokenName);
            assert.equal(updatedLoanTokenRecord.tokenPoolTotal, lendingControllerInitialTokenPoolTotal + liquidityAmount);

            // check Lending Controller's XTZ Balance
            const lendingControllerXtzBalance           = await utils.tezos.tz.getBalance(lendingControllerAddress);
            assert.equal(lendingControllerXtzBalance, lendingControllerInitialXtzBalance + liquidityAmount);

            // check Eve's LP Token Pool XTZ balance
            const updatedEveLpTokenPoolXtzLedger        = await updatedLpTokenPoolXtzStorage.ledger.get(eve.pkh);            
            assert.equal(updatedEveLpTokenPoolXtzLedger, eveInitialLpTokenPoolXtzBalance + liquidityAmount);        

            // check Eve's XTZ Balance and account for gas cost in transaction with almostEqual
            const eveXtzBalance = await utils.tezos.tz.getBalance(eve.pkh);
            assert.equal(almostEqual(eveXtzBalance, eveInitialXtzBalance - liquidityAmount, 0.0001), true)

        });
    
    })

    
    // 
    // Test Vault Liquidation
    //
    describe('%liquidateVault - test vault liquidation', function () {
 
        it('simple one token test: user (mallory) can mark eve\'s vault for liquidation (interest accumulated over time) and liquidate vault with refunds for overflow - [Collateral Token: Mock FA-12 | Loan Token: Mock FA-12]', async () => {
            
            // init variables and storage
            lendingControllerStorage = await lendingControllerInstance.storage();
            vaultFactoryStorage      = await vaultFactoryInstance.storage();

            currentMockLevel      = lendingControllerStorage.mockLevel;

            // config variables
            const liquidationDelayInMins        = lendingControllerStorage.config.liquidationDelayInMins.toNumber();
            const liquidationMaxDuration        = lendingControllerStorage.config.liquidationMaxDuration.toNumber();
            const maxVaultLiquidationPercent    = lendingControllerStorage.config.maxVaultLiquidationPercent.toNumber();
            const adminLiquidationFeePercent    = lendingControllerStorage.config.adminLiquidationFeePercent.toNumber();
            const liquidationFeePercent         = lendingControllerStorage.config.liquidationFeePercent.toNumber();
            const interestTreasuryShare         = lendingControllerStorage.config.interestTreasuryShare.toNumber();
            

            // ----------------------------------------------------------------------------------------------
            // Create Vault
            // ----------------------------------------------------------------------------------------------


            await signerFactory(tezos, eve.sk);

            const vaultCounter  = vaultFactoryStorage.vaultCounter;
            const vaultId       = vaultCounter.toNumber();
            const vaultOwner    = eve.pkh;
            const liquidator    = mallory.pkh;
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
            vaultRecord = await lendingControllerStorage.vaults.get(vaultHandle);
            const vaultAddress   = vaultRecord.address;
            const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

            // console.log('   - vault originated: ' + vaultAddress);
            // console.log('   - vault id: ' + vaultId);

            // push new vault id to vault set
            eveVaultSet.push(vaultId);

            
            // ----------------------------------------------------------------------------------------------
            // Deposit Collateral into Vault
            // ----------------------------------------------------------------------------------------------


            const usdtDepositAmount  = 8000000;   // 8 Mock FA12 Tokens - USD $12.00

            // ---------------------------------
            // Deposit Mock FA12 Tokens
            // ---------------------------------

            // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
            // reset token allowance
            const resetTokenAllowanceForDeposit = await usdtTokenInstance.methods.approve(
                vaultAddress,
                0
            ).send();
            await resetTokenAllowanceForDeposit.confirmation();

            // set new token allowance
            const setNewTokenAllowanceForDeposit = await usdtTokenInstance.methods.approve(
                vaultAddress,
                usdtDepositAmount
            ).send();
            await setNewTokenAllowanceForDeposit.confirmation();

            // eve deposits mock FA12 tokens into vault
            const eveDepositMockFa12TokenOperation  = await vaultInstance.methods.initVaultAction(
                "deposit",
                usdtDepositAmount,           
                "usdt"
            ).send();
            await eveDepositMockFa12TokenOperation.confirmation();

            // console.log('   - vault collateral deposited: Mock FA-12 Tokens: ' + usdtDepositAmount);

            
            // ----------------------------------------------------------------------------------------------
            // Borrow with Vault
            // ----------------------------------------------------------------------------------------------


            // borrow amount - 4 Mock FA12 Tokens
            const borrowAmount = 4000000;   

            // borrow operation
            const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
            await eveBorrowOperation.confirmation();

            // console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName);

            // get initial Mock FA12 Token balance for Eve (vault owner), liquidator, vault, Treasury and Token Pool Reward Contract
            vaultOwnerMockFa12TokenAccount          =  await usdtTokenStorage.ledger.get(vaultOwner);            
            initialVaultOwnerMockFa12TokenBalance   = vaultOwnerMockFa12TokenAccount == undefined ? 0 : vaultOwnerMockFa12TokenAccount.balance.toNumber();

            vaultMockFa12TokenAccount               =  await usdtTokenStorage.ledger.get(vaultAddress);            
            initialVaultMockFa12TokenBalance        = vaultMockFa12TokenAccount == undefined ? 0 : vaultMockFa12TokenAccount.balance.toNumber();

            liquidatorMockFa12TokenAccount          =  await usdtTokenStorage.ledger.get(liquidator);            
            initialLiquidatorMockFa12TokenBalance   = liquidatorMockFa12TokenAccount == undefined ? 0 : liquidatorMockFa12TokenAccount.balance.toNumber();

            treasuryMockFa12TokenAccount            =  await usdtTokenStorage.ledger.get(contractDeployments.treasury.address);            
            initialTreasuryMockFa12TokenBalance     = treasuryMockFa12TokenAccount == undefined ? 0 : treasuryMockFa12TokenAccount.balance.toNumber();

            lendingControllerMockFa12TokenAccount            =  await usdtTokenStorage.ledger.get(lendingControllerAddress);            
            initialLendingControllerMockFa12TokenBalance     = lendingControllerMockFa12TokenAccount == undefined ? 0 : lendingControllerMockFa12TokenAccount.balance.toNumber();

            // get token pool stats
            lendingControllerStorage       = await lendingControllerInstance.storage();
            vaultRecord                    = await lendingControllerStorage.vaults.get(vaultHandle);
            loanTokenRecord                = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
            
            loanTokenDecimals              = loanTokenRecord.tokenDecimals;
            const interestRateDecimals     = (27 - 2); 

            const tokenPoolTotal           = loanTokenRecord.tokenPoolTotal.toNumber() / (10 ** loanTokenDecimals.toNumber());
            const totalBorrowed            = loanTokenRecord.totalBorrowed.toNumber() / (10 ** loanTokenDecimals.toNumber());
            const optimalUtilisationRate   = Number(loanTokenRecord.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const utilisationRate          = Number(loanTokenRecord.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
            const currentInterestRate      = Number(loanTokenRecord.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";

            // console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);

            
            // ----------------------------------------------------------------------------------------------
            // Set Block Levels For Mock Time Test - 7 years
            // ----------------------------------------------------------------------------------------------


            await signerFactory(tezos, bob.sk); // temporarily set to tester to increase block levels

            lendingControllerStorage    = await lendingControllerInstance.storage();
            vaultRecord                 = await lendingControllerStorage.vaults.get(vaultHandle);
            lastUpdatedBlockLevel       = vaultRecord.lastUpdatedBlockLevel;

            const yearsPassed  = 7; 
            mockLevelChange = yearsPassed * oneYearLevelBlocks;
            newMockLevel = lastUpdatedBlockLevel.toNumber() + mockLevelChange;

            const setMockLevelOperationOne = await lendingControllerInstance.methods.updateConfig(newMockLevel, 'configMockLevel').send();
            await setMockLevelOperationOne.confirmation();

            lendingControllerStorage = await lendingControllerInstance.storage();
            currentMockLevel = lendingControllerStorage.config.mockLevel;

            assert.equal(currentMockLevel, newMockLevel);

            // console.log('   - time set to ' + yearsPassed + ' years ahead: ' + lastUpdatedBlockLevel + ' to ' + newMockLevel + ' | Changed by: ' + mockLevelChange);


            // ----------------------------------------------------------------------------------------------
            // Vault Marked for liquidation
            // ----------------------------------------------------------------------------------------------


            await signerFactory(tezos, mallory.sk); // mallory as liquidator

            const markVaultForLiquidationOperation = await lendingControllerInstance.methods.markForLiquidation(vaultId, vaultOwner).send();
            await markVaultForLiquidationOperation.confirmation();

            lendingControllerStorage                = await lendingControllerInstance.storage();
            vaultRecord                             = await lendingControllerStorage.vaults.get(vaultHandle);
            currentMockLevel                        = lendingControllerStorage.config.mockLevel.toNumber();            

            const expectedMarkedForLiquidationLevel = currentMockLevel;
            const expectedLiquidationEndLevel       = currentMockLevel + (liquidationMaxDuration * oneMinuteLevelBlocks);

            initialVaultLoanOutstandingTotal        = vaultRecord.loanOutstandingTotal;
            initialVaultLoanPrincipalTotal          = vaultRecord.loanPrincipalTotal;
            initialVaultBorrowIndex                 = vaultRecord.borrowIndex;

            const vaultMarkedForLiquidationLevel    = vaultRecord.markedForLiquidationLevel;
            const vaultLiquidationEndLevel          = vaultRecord.liquidationEndLevel;

            assert.equal(vaultMarkedForLiquidationLevel, expectedMarkedForLiquidationLevel);
            assert.equal(vaultLiquidationEndLevel, expectedLiquidationEndLevel);

            // test vault cannot be marked for liquidation if it has already been marked
            const failMarkVaultForLiquidation = await lendingControllerInstance.methods.markForLiquidation(vaultId, vaultOwner);
            await chai.expect(failMarkVaultForLiquidation.send()).to.be.rejected;


            // ----------------------------------------------------------------------------------------------
            // After marked for liquidation: set block level ahead by half of liquidationDelayinMins
            // ----------------------------------------------------------------------------------------------


            await signerFactory(tezos, bob.sk); // temporarily set to tester to increase block levels

            lendingControllerStorage    = await lendingControllerInstance.storage();
            vaultRecord                 = await lendingControllerStorage.vaults.get(vaultHandle);
            markedForLiquidationLevel   = vaultRecord.markedForLiquidationLevel;

            minutesPassed  = liquidationDelayInMins / 2; 
            mockLevelChange = minutesPassed * oneMinuteLevelBlocks;
            newMockLevel = markedForLiquidationLevel.toNumber() + mockLevelChange;

            const setMockLevelOperationTwo = await lendingControllerInstance.methods.updateConfig(newMockLevel, 'configMockLevel').send();
            await setMockLevelOperationTwo.confirmation();

            lendingControllerStorage = await lendingControllerInstance.storage();
            currentMockLevel = lendingControllerStorage.config.mockLevel;

            assert.equal(currentMockLevel, newMockLevel);

            // console.log('   - time set to middle of vault liquidation delay: ' + markedForLiquidationLevel + ' to ' + newMockLevel + ' | Changed by: ' + mockLevelChange);

            // test vault cannot be marked for liquidation if it has already been marked
            const failMarkVaultForLiquidationAgain = await lendingControllerInstance.methods.markForLiquidation(vaultId, vaultOwner);
            await chai.expect(failMarkVaultForLiquidationAgain.send()).to.be.rejected;

            // test vault cannot be liquidated if delay has not been passed
            const failTestLiquidationAmount = 10;
            failLiquidateVaultOperation = await lendingControllerInstance.methods.liquidateVault(vaultId, vaultOwner, failTestLiquidationAmount);
            await chai.expect(failLiquidateVaultOperation.send()).to.be.rejected;


            // ----------------------------------------------------------------------------------------------
            // Set Block Levels For Mock Time Test - immediately after delay ends
            // ----------------------------------------------------------------------------------------------


            await signerFactory(tezos, bob.sk); // temporarily set to tester to increase block levels

            lendingControllerStorage    = await lendingControllerInstance.storage();
            vaultRecord                 = await lendingControllerStorage.vaults.get(vaultHandle);
            markedForLiquidationLevel   = vaultRecord.markedForLiquidationLevel;

            minutesPassed  = liquidationDelayInMins + 1;
            mockLevelChange = minutesPassed * oneMinuteLevelBlocks;
            newMockLevel = markedForLiquidationLevel.toNumber() + mockLevelChange;

            const setMockLevelOperationThree = await lendingControllerInstance.methods.updateConfig(newMockLevel, 'configMockLevel').send();
            await setMockLevelOperationThree.confirmation();

            lendingControllerStorage = await lendingControllerInstance.storage();
            currentMockLevel = lendingControllerStorage.config.mockLevel;

            assert.equal(currentMockLevel, newMockLevel);

            // console.log('   - time set to immediately after vault liquidation delay: ' + markedForLiquidationLevel + ' to ' + newMockLevel + ' | Changed by: ' + mockLevelChange);

            
            // ----------------------------------------------------------------------------------------------
            // Liquidate Vault
            // ----------------------------------------------------------------------------------------------


            await signerFactory(tezos, mallory.sk); 
            const liquidationAmount = 100;

            // mallory resets mock FA12 tokens allowance then set new allowance to liquidate amount
            // reset token allowance
            resetTokenAllowance = await usdtTokenInstance.methods.approve(
                lendingControllerAddress,
                0
            ).send();
            await resetTokenAllowance.confirmation();

            // set new token allowance
            setNewTokenAllowance = await usdtTokenInstance.methods.approve(
                lendingControllerAddress,
                liquidationAmount
            ).send();
            await setNewTokenAllowance.confirmation();

            liquidateVaultOperation = await lendingControllerInstance.methods.liquidateVault(vaultId, vaultOwner, liquidationAmount).send();
            await liquidateVaultOperation.confirmation();

            // ----------------------------------------------------------------------------------------------
            // Vault calculations on loan outstanding, accrued interest, and liquidation fees
            // ----------------------------------------------------------------------------------------------


            // Update storage
            lendingControllerStorage    = await lendingControllerInstance.storage();
            usdtTokenStorage            = await usdtTokenInstance.storage();

            // vault record
            vaultRecord                 = await lendingControllerStorage.vaults.get(vaultHandle);
            vaultLoanOutstandingTotal   = vaultRecord.loanOutstandingTotal;
            vaultLoanPrincipalTotal     = vaultRecord.loanPrincipalTotal;
            vaultLoanInterestTotal      = vaultRecord.loanInterestTotal;
            vaultBorrowIndex            = vaultRecord.borrowIndex;

            // loan token record
            loanTokenRecord             = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
            updatedLoanTokenBorrowIndex = loanTokenRecord.borrowIndex;

            // vault calculations
            loanOutstandingWithAccruedInterest      = lendingHelper.calculateAccruedInterest(initialVaultLoanOutstandingTotal, initialVaultBorrowIndex, updatedLoanTokenBorrowIndex);
            totalInterest                           = loanOutstandingWithAccruedInterest - initialVaultLoanPrincipalTotal.toNumber();
            remainingInterest                       = lendingHelper.calculateRemainingInterest(liquidationAmount, totalInterest)


            // check that calculations are correct - use of almostEqual as there may be a slight difference of 1 from rounding errors 
            assert.equal(almostEqual(vaultLoanOutstandingTotal, loanOutstandingWithAccruedInterest - liquidationAmount, 0.0001), true);
            assert.equal(almostEqual(vaultLoanInterestTotal, totalInterest - liquidationAmount, 0.0001), true);


            // liquidation calculations
            adminLiquidationFee                     = lendingHelper.calculateAdminLiquidationFee(adminLiquidationFeePercent, liquidationAmount);
            liquidationIncentive                    = lendingHelper.calculateLiquidationIncentive(liquidationFeePercent, liquidationAmount);
            
            liquidationAmountWithIncentive          = liquidationAmount + liquidationIncentive;                       // amount sent to liquidator
            liquidationAmountWithFeesAndIncentive   = liquidationAmount + liquidationIncentive + adminLiquidationFee; // total liquidated from vault

            vaultMaxLiquidationAmount               = lendingHelper.calculateVaultMaxLiquidationAmount(vaultLoanOutstandingTotal, maxVaultLiquidationPercent);
            totalLiquidationAmount                  = lendingHelper.calculateTotalLiquidationAmount(liquidationAmount, vaultMaxLiquidationAmount);
            totalInterestPaid                       = lendingHelper.calculateTotalInterestPaid(totalLiquidationAmount, vaultLoanInterestTotal);
            
            interestSentToTreasury                  = lendingHelper.calculateInterestSentToTreasury(interestTreasuryShare, totalInterestPaid)
            interestRewards                         = lendingHelper.calculateInterestRewards(interestSentToTreasury, totalInterestPaid);

            finalLoanOutstandingTotal               = lendingHelper.calculateFinalLoanOutstandingTotal(totalLiquidationAmount, loanOutstandingWithAccruedInterest);
            finalLoanPrincipalTotal                 = lendingHelper.calculateFinalLoanPrincipalTotal(totalLiquidationAmount, loanOutstandingWithAccruedInterest, remainingInterest, initialVaultLoanPrincipalTotal);
            finalLoanInterestTotal                  = lendingHelper.calculateFinalLoanInterestTotal(remainingInterest);
            
            
            // ----------------------------------------------------------------------------------------------
            // Accounts and Balances
            // ----------------------------------------------------------------------------------------------


            // get updated Mock FA12 Token balance for Eve (vault owner), liquidator, vault, Treasury and Token Pool Reward Contract
            vaultOwnerMockFa12TokenAccount          =  await usdtTokenStorage.ledger.get(vaultOwner);            
            updatedVaultOwnerMockFa12TokenBalance   = vaultOwnerMockFa12TokenAccount == undefined ? 0 : vaultOwnerMockFa12TokenAccount.balance.toNumber();

            vaultMockFa12TokenAccount               =  await usdtTokenStorage.ledger.get(vaultAddress);            
            updatedVaultMockFa12TokenBalance        = vaultMockFa12TokenAccount == undefined ? 0 : vaultMockFa12TokenAccount.balance.toNumber();

            liquidatorMockFa12TokenAccount          =  await usdtTokenStorage.ledger.get(liquidator);            
            updatedLiquidatorMockFa12TokenBalance   = liquidatorMockFa12TokenAccount == undefined ? 0 : liquidatorMockFa12TokenAccount.balance.toNumber();

            treasuryMockFa12TokenAccount            =  await usdtTokenStorage.ledger.get(contractDeployments.treasury.address);            
            updatedTreasuryMockFa12TokenBalance     = treasuryMockFa12TokenAccount == undefined ? 0 : treasuryMockFa12TokenAccount.balance.toNumber();

            lendingControllerMockFa12TokenAccount            =  await usdtTokenStorage.ledger.get(lendingControllerAddress);            
            updatedLendingControllerMockFa12TokenBalance     = lendingControllerMockFa12TokenAccount == undefined ? 0 : lendingControllerMockFa12TokenAccount.balance.toNumber();


            // --------------------------------------------------------
            // Simple test note: in this case, since there is only one collateral token,
            // the token proportion will be equal to 1 (i.e. 1e27) and there are no calculations for token proportions
            // --------------------------------------------------------


            // check that there are no changes to the vault owner's balance
            assert.equal(updatedVaultOwnerMockFa12TokenBalance, initialVaultOwnerMockFa12TokenBalance);

            // vault should have a total reduction in balance equal to liquidationAmountWithFeesAndIncentive
            assert.equal(updatedVaultMockFa12TokenBalance, initialVaultMockFa12TokenBalance - liquidationAmountWithFeesAndIncentive);
            
            // with a liquidation amount of 100, liquidator's incentive of 6%, liquidator will receive 106 after liquidation - total net gain will be 106 - 100 = 6
            assert.equal(updatedLiquidatorMockFa12TokenBalance, initialLiquidatorMockFa12TokenBalance - liquidationAmount + liquidationAmountWithIncentive);

            // treasury should receive both admin fee and share from interest repaid (e.g. 6% and 1% respectively -> with a liquidation amount of 100, treasury should receive 7)
            assert.equal(updatedTreasuryMockFa12TokenBalance, initialTreasuryMockFa12TokenBalance + adminLiquidationFee + interestSentToTreasury);

            // lending controller should receive interest rewards
            assert.equal(updatedLendingControllerMockFa12TokenBalance, initialLendingControllerMockFa12TokenBalance + interestRewards);

            // check vault records that loan outstanding has decreased
            // - no change to vault loan principal as liquidation amount is not enough to cover total interest accrued
            assert.equal(vaultLoanOutstandingTotal, loanOutstandingWithAccruedInterest - liquidationAmount);
            assert.equal(vaultLoanPrincipalTotal.toNumber(), initialVaultLoanPrincipalTotal.toNumber());
            assert.equal(vaultLoanInterestTotal, remainingInterest);


            // ----------------------------------------------------------------------------------------------
            // Test refund with liquidation amount greater than the maximum allowed
            // ----------------------------------------------------------------------------------------------


            // set initial variables to be used for subsequent calculations and comparisons
            initialVaultBorrowIndex                 = vaultBorrowIndex;
            initialVaultLoanOutstandingTotal        = vaultLoanOutstandingTotal; 
            initialVaultLoanPrincipalTotal          = vaultLoanPrincipalTotal;
            initialVaultLoanInterestTotal           = vaultLoanInterestTotal;
            
            initialVaultMockFa12TokenBalance                = updatedVaultMockFa12TokenBalance
            initialLiquidatorMockFa12TokenBalance           = updatedLiquidatorMockFa12TokenBalance;
            initialTreasuryMockFa12TokenBalance             = updatedTreasuryMockFa12TokenBalance;
            initialLendingControllerMockFa12TokenBalance    = updatedLendingControllerMockFa12TokenBalance;


            // get new max liquidation amount - i.e. this will be the total liquidated amount with an overflow
            vaultMaxLiquidationAmount = lendingHelper.calculateVaultMaxLiquidationAmount(vaultLoanOutstandingTotal, maxVaultLiquidationPercent);
            
            const overflowAmount            = 100000000; // 100 Mock FA12 token
            const overflowLiquidationAmount = vaultMaxLiquidationAmount + overflowAmount;

            // mallory resets mock FA12 tokens allowance then set new allowance to liquidate amount
            // reset token allowance
            resetTokenAllowance = await usdtTokenInstance.methods.approve(
                lendingControllerAddress,
                0
            ).send();
            await resetTokenAllowance.confirmation();

            // set new token allowance
            setNewTokenAllowance = await usdtTokenInstance.methods.approve(
                lendingControllerAddress,
                overflowLiquidationAmount
            ).send();
            await setNewTokenAllowance.confirmation();


            // liquidate vault with overflow liquidation amount
            const overflowLiquidateVault = await lendingControllerInstance.methods.liquidateVault(vaultId, vaultOwner, overflowLiquidationAmount).send();
            await overflowLiquidateVault.confirmation();

            // -------------------------------------
            // Get updated storage
            // -------------------------------------

            // Update storage
            lendingControllerStorage    = await lendingControllerInstance.storage();
            usdtTokenStorage            = await usdtTokenInstance.storage();

            // loan token record
            loanTokenRecord             = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
            updatedLoanTokenBorrowIndex = loanTokenRecord.borrowIndex;

            // vault record
            vaultRecord                 = await lendingControllerStorage.vaults.get(vaultHandle);
            vaultLoanOutstandingTotal   = vaultRecord.loanOutstandingTotal;
            vaultLoanPrincipalTotal     = vaultRecord.loanPrincipalTotal;
            vaultLoanInterestTotal      = vaultRecord.loanInterestTotal;
            vaultBorrowIndex            = vaultRecord.borrowIndex;


            // i.e. vaultMaxLiquidationAmount will be the total liquidation amount as it is less than overflowLiquidationAmount
            totalLiquidationAmount                  = lendingHelper.calculateTotalLiquidationAmount(overflowLiquidationAmount, vaultMaxLiquidationAmount);

            // liquidation calculations
            adminLiquidationFee                     = lendingHelper.calculateAdminLiquidationFee(adminLiquidationFeePercent, totalLiquidationAmount);
            liquidationIncentive                    = lendingHelper.calculateLiquidationIncentive(liquidationFeePercent, totalLiquidationAmount);
            
            liquidationAmountWithIncentive          = totalLiquidationAmount + liquidationIncentive;                       // amount sent to liquidator
            liquidationAmountWithFeesAndIncentive   = totalLiquidationAmount + liquidationIncentive + adminLiquidationFee; // total liquidated from vault


            // vault calculations
            loanOutstandingWithAccruedInterest      = lendingHelper.calculateAccruedInterest(initialVaultLoanOutstandingTotal, initialVaultBorrowIndex, updatedLoanTokenBorrowIndex);
            totalInterest                           = loanOutstandingWithAccruedInterest - initialVaultLoanPrincipalTotal.toNumber();
            remainingInterest                       = lendingHelper.calculateRemainingInterest(totalLiquidationAmount, totalInterest);
            totalInterestPaid                       = lendingHelper.calculateTotalInterestPaid(totalLiquidationAmount, totalInterest);

            interestSentToTreasury                  = lendingHelper.calculateInterestSentToTreasury(interestTreasuryShare, totalInterestPaid)
            interestRewards                         = lendingHelper.calculateInterestRewards(interestSentToTreasury, totalInterestPaid);

            finalLoanOutstandingTotal               = lendingHelper.calculateFinalLoanOutstandingTotal(totalLiquidationAmount, loanOutstandingWithAccruedInterest);
            finalLoanPrincipalTotal                 = lendingHelper.calculateFinalLoanPrincipalTotal(totalLiquidationAmount, loanOutstandingWithAccruedInterest, remainingInterest, initialVaultLoanPrincipalTotal);
            finalLoanInterestTotal                  = lendingHelper.calculateFinalLoanInterestTotal(remainingInterest);


            // get updated Mock FA12 Token balance for liquidator, vault, Treasury and Token Pool Reward Contract
            vaultMockFa12TokenAccount               =  await usdtTokenStorage.ledger.get(vaultAddress);            
            updatedVaultMockFa12TokenBalance        = vaultMockFa12TokenAccount == undefined ? 0 : vaultMockFa12TokenAccount.balance.toNumber();

            liquidatorMockFa12TokenAccount          =  await usdtTokenStorage.ledger.get(liquidator);            
            updatedLiquidatorMockFa12TokenBalance   = liquidatorMockFa12TokenAccount == undefined ? 0 : liquidatorMockFa12TokenAccount.balance.toNumber();

            treasuryMockFa12TokenAccount            =  await usdtTokenStorage.ledger.get(contractDeployments.treasury.address);            
            updatedTreasuryMockFa12TokenBalance     = treasuryMockFa12TokenAccount == undefined ? 0 : treasuryMockFa12TokenAccount.balance.toNumber();

            lendingControllerMockFa12TokenAccount            =  await usdtTokenStorage.ledger.get(lendingControllerAddress);            
            updatedLendingControllerMockFa12TokenBalance     = lendingControllerMockFa12TokenAccount == undefined ? 0 : lendingControllerMockFa12TokenAccount.balance.toNumber();


            // ----------------------------------------------------------------------------------------------
            // Refund checks and assertions
            // ----------------------------------------------------------------------------------------------


            // vault should have a total reduction in balance equal to liquidationAmountWithFeesAndIncentive 
            assert.equal(updatedVaultMockFa12TokenBalance, initialVaultMockFa12TokenBalance - liquidationAmountWithFeesAndIncentive);
            
            // liquidator should not have a deficit in balance from the overflow of tokens sent to liquidate the vault 
            assert.equal(updatedLiquidatorMockFa12TokenBalance, initialLiquidatorMockFa12TokenBalance - totalLiquidationAmount + liquidationAmountWithIncentive);

            // treasury should receive both admin fee and share from interest repaid 
            assert.equal(updatedTreasuryMockFa12TokenBalance, initialTreasuryMockFa12TokenBalance + adminLiquidationFee + interestSentToTreasury);

            // lending controller should receive interest rewards
            assert.equal(updatedLendingControllerMockFa12TokenBalance, initialLendingControllerMockFa12TokenBalance + (totalLiquidationAmount - interestSentToTreasury));

            // check that final vault calculations are correct - use of almostEqual as there may be a slight difference of 1 from rounding errors 
            assert.equal(almostEqual(vaultLoanOutstandingTotal, finalLoanOutstandingTotal, 0.0001), true);
            assert.equal(almostEqual(vaultLoanPrincipalTotal, finalLoanPrincipalTotal, 0.0001), true);
            assert.equal(almostEqual(vaultLoanInterestTotal, finalLoanInterestTotal, 0.0001), true);

            // check that remaining loan outstanding total is correct 
            // i.e. if maxVaultLiquidationPercent is 50%, then not more than 50% of the loan outstanding can be liquidated, and there should be 50% remaining
            assert.equal(almostEqual(vaultLoanOutstandingTotal, initialVaultLoanOutstandingTotal - vaultMaxLiquidationAmount, 0.0001), true);

            // test vault cannot be liquidated again 
            failLiquidateVaultOperation = await lendingControllerInstance.methods.liquidateVault(vaultId, vaultOwner, failTestLiquidationAmount);
            await chai.expect(failLiquidateVaultOperation.send()).to.be.rejected;

        })

    
        // 
        // Test MToken Compound
        //
        describe('%compound - test mToken compound', function () {
     
            it('user (eve) compounds and refresh the balance and the token reward index', async () => {
                try{

                    // init variables and storage
                    lendingControllerStorage    = await lendingControllerInstance.storage();
                    mTokenUsdtStorage           = await mUsdtTokenInstance.storage();

                    // init variables
                    const tokenName             = "usdt";
                    const user                  = eve.pkh;
                    const usdtLoanToken         = await lendingControllerStorage.loanTokenLedger.get(tokenName);
                    const initTokenRewardIndex  = mTokenUsdtStorage.tokenRewardIndex;
                    const initUserRewardIndex   = await mTokenUsdtStorage.rewardIndexLedger.get(user);
                    const initUserBalance       = await mTokenUsdtStorage.ledger.get(user);
                    
                    // compound operation
                    compoundOperation           = await mUsdtTokenInstance.methods.compound([user]).send();
                    await compoundOperation.confirmation();

                    // refresh variables and storage
                    lendingControllerStorage    = await lendingControllerInstance.storage();
                    mTokenUsdtStorage           = await mUsdtTokenInstance.storage();

                    // final variables
                    const finalTokenRewardIndex = mTokenUsdtStorage.tokenRewardIndex;
                    const finalUserRewardIndex  = await mTokenUsdtStorage.rewardIndexLedger.get(user);
                    const finalUserBalance      = await mTokenUsdtStorage.ledger.get(user);

                    // assertions
                    assert.notDeepEqual(initTokenRewardIndex, usdtLoanToken.tokenRewardIndex);
                    assert.deepEqual(finalTokenRewardIndex, usdtLoanToken.tokenRewardIndex);
                    assert.notDeepEqual(finalUserRewardIndex, initUserRewardIndex);
                    assert.notDeepEqual(finalUserBalance, initUserBalance);
                    assert.deepEqual(finalUserRewardIndex, finalTokenRewardIndex);

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            });

        })            

    })

});