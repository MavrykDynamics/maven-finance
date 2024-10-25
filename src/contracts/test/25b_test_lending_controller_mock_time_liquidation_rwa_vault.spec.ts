import { MichelsonMap } from "@mavrykdynamics/taquito";
import assert from "assert";
import BigNumber from 'bignumber.js';

import * as lendingHelper from "./helpers/lendingHelpers"
import { MVN, Utils, zeroAddress } from "./helpers/Utils";

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

import { alice, baker, bob, david, eve, ivan, mallory, susie } from "../scripts/sandbox/accounts";
import { 
    signerFactory, 
    almostEqual,
    updateOperators,
    updateGeneralContracts
} from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

// Interface for oracle observation type
interface IOracleObservationType {
    data: BigNumber;
    epoch: number;
    round: number;
    aggregatorAddress: string;
}


describe("Lending Controller (Mock Time - Liquidation) tests", async () => {
    
    var utils: Utils
    let tezos 

    // ------------------------------------------------
    //  General
    // ------------------------------------------------

    //  vault sets 
    var eveVaultSet : Array<Number>     = []
    var malloryVaultSet : Array<Number> = [] 

    let tokenId = 0

    // 3 seconds blocks (docker sandbox)
    const oneMinuteLevelBlocks = 20
    const oneDayLevelBlocks   = 28800
    const oneMonthLevelBlocks = 864000
    const oneYearLevelBlocks  = 10512000 // 365 days

    const secondsInYears = 31536000
    const fixedPointAccuracy = 10**27

    // admin
    let admin 
    let adminSk 

    // satellites & delegates
    let satelliteOne 
    let satelliteTwo
    let satelliteThree

    let satelliteOneSk
    let satelliteTwoSk
    let satelliteThreeSk

    let delegateOne 
    let delegateTwo

    let delegateOneSk 
    let delegateTwoSk

    // contract addresses
    let lendingControllerAddress
    
    // oracles
    let tokenOracles : {name : string, price : number, priceDecimals : number, tokenDecimals : number}[] = []
    let defaultObservations
    let defaultPriceObservations

    let usdtTokenIndex
    let eurtTokenIndex
    let mavIndex
    let mvnIndex

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
    let mockUsdMvrkAggregatorInstance
    let mockUsdMvnAggregatorInstance

    let mUsdtTokenInstance
    let mEurtTokenInstance
    let mMvrkTokenInstance

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

    let usdtTokenStorage
    let eurtTokenStorage
    let governanceStorage
    let governanceProxyStorage

    let mockUsdMockFa12TokenAggregatorStorage
    let mockUsdMockFa2TokenAggregatorStorage
    let mockUsdMvrkAggregatorStorage
    let mockUsdMvnAggregatorStorage

    let lendingControllerStorage
    let vaultFactoryStorage

    // ------------------------------------------------
    //  Test Variables
    // ------------------------------------------------

    // mock levels, rounds, and epochs
    let epoch 
    let lastEpoch 
    let round
    let lastRound
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
    let liquidationAmountWithFeesAndIncentiveMockFa12
    let liquidationAmountWithFeesAndIncentiveMockFa2 
    let liquidationAmountWithFeesAndIncentiveMav
    let liquidationAmountWithFeesAndIncentiveMvn

    let totalLiquidationAmount
    let totalLiquidationAmountMockFa12
    let totalLiquidationAmountMockFa2 
    let totalLiquidationAmountMav
    let totalLiquidationAmountMvn

    let liquidationAmountWithIncentive
    let liquidationAmountWithIncentiveMockFa12
    let liquidationAmountWithIncentiveMockFa2
    let liquidationAmountWithIncentiveMav
    let liquidationAmountWithIncentiveMvn

    let adminLiquidationFee
    let adminLiquidationFeeMockFa12
    let adminLiquidationFeeMockFa2
    let adminLiquidationFeeMav
    let adminLiquidationFeeMvn

    let interestSentToTreasury
    let interestRewards

    // ------------------------------------------------
    // Token accounts (ledger) for Lending Controller (i.e. token pool)
    let lendingControllerMockFa12TokenAccount
    let lendingControllerMockFa2TokenAccount
    let lendingControllerMavAccount

    // Token accounts (ledger) for Liquidator
    let liquidatorMockFa12TokenAccount
    let liquidatorMockFa2TokenAccount
    let liquidatorMavAccount
    let liquidatorStakedMvnAccount

    // Token accounts (ledger) for vaults
    let vaultMockFa12TokenAccount
    let vaultMockFa2TokenAccount
    let vaultMavAccount
    let vaultStakedMvnAccount

    // Token accounts (ledger) for vault owners
    let vaultOwnerMockFa12TokenAccount
    let vaultOwnerMockFa2TokenAccount
    let vaultOwnerMavAccount
    let vaultOwnerStakedMvnAccount

    // Token accounts (ledger) for admin treasury
    let treasuryMockFa12TokenAccount
    let treasuryMockFa2TokenAccount
    let treasuryMavAccount
    let treasuryStakedMvnAccount
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


    // ------------------------------------------------
    // Mock FA-2 Token balances (initial and updated)
    // ------------------------------------------------
    
    // Initial token balances for Mock FA-2 Token
    let initialLendingControllerMockFa2TokenBalance
    let initialVaultMockFa2TokenBalance
    let initialVaultOwnerMockFa2TokenBalance
    let initialLiquidatorMockFa2TokenBalance
    let initialTreasuryMockFa2TokenBalance

    // Updated token balances for Mock FA-2 Tokens
    let updatedLendingControllerMockFa2TokenBalance
    let updatedVaultOwnerMockFa2TokenBalance
    let updatedVaultMockFa2TokenBalance
    let updatedLiquidatorMockFa2TokenBalance
    let updatedTreasuryMockFa2TokenBalance
    // ------------------------------------------------

    // ------------------------------------------------
    // Mav balances (initial and updated)
    // ------------------------------------------------
    
    // Initial token balances for Mav
    let initialLendingControllerMavBalance
    let initialVaultMavBalance
    let initialVaultOwnerMavBalance
    let initialLiquidatorMavBalance
    let initialTreasuryMavBalance

    // Updated token balances for Mav
    let updatedLendingControllerMavBalance
    let updatedVaultMavBalance
    let updatedVaultOwnerMavBalance
    let updatedLiquidatorMavBalance
    let updatedTreasuryMavBalance

    // ------------------------------------------------
    // Staked MVN balances (initial and updated)
    // ------------------------------------------------

    // Initial token balances for staked MVN
    let initialVaultStakedMvnBalance
    let initialVaultOwnerStakedMvnBalance
    let initialLiquidatorStakedMvnBalance
    let initialTreasuryStakedMvnBalance

    // Updated token balances for staked MVN
    let updatedVaultStakedMvnBalance
    let updatedVaultOwnerStakedMvnBalance
    let updatedLiquidatorStakedMvnBalance
    let updatedTreasuryStakedMvnBalance
    
    // Helper Operations


    // Begin Helper Functions

    // helper functions to set token prices
    async function setTokenPrice(epoch, round, observations, tokenName){
            
        const oracleObservations     = new MichelsonMap<string, IOracleObservationType>();
        const oracleVotingPowers     = new Map<string, number>();
        var totalVotingPower         = 0;

        for (const { oracle, data } of observations) {
            
            // Get oracle voting power
            const satelliteRecord  = await delegationStorage.satelliteLedger.get(oracle);
            const votingPower      = satelliteRecord.totalDelegatedAmount.toNumber() + satelliteRecord.stakedMvnBalance.toNumber();
            totalVotingPower      += votingPower;
            oracleVotingPowers.set(oracle, votingPower)

            if(tokenName == "usdt"){
                // Set observations
                oracleObservations.set(oracle, {
                    data,
                    epoch,
                    round,
                    aggregatorAddress: contractDeployments.mockUsdMockFa12TokenAggregator.address
                });
            } else if(tokenName == "eurt"){
                // Set observations
                oracleObservations.set(oracle, {
                    data,
                    epoch,
                    round,
                    aggregatorAddress: contractDeployments.mockUsdMockFa2TokenAggregator.address
                });
            } else if(tokenName == "mav"){
                // Set observations
                oracleObservations.set(oracle, {
                    data,
                    epoch,
                    round,
                    aggregatorAddress: contractDeployments.mockUsdMvrkAggregator.address
                });
            } else if(tokenName == "smvn"){
                // Set observations
                oracleObservations.set(oracle, {
                    data,
                    epoch,
                    round,
                    aggregatorAddress: contractDeployments.mockUsdMvnAggregator.address
                });
            }
        };
        
        const signatures = new MichelsonMap<string, string>();
        
        // Sign observations
        await signerFactory(tezos, satelliteOneSk);
        signatures.set(satelliteOne, await utils.signOracleDataResponses(oracleObservations));
        
        await signerFactory(tezos, satelliteTwoSk);
        signatures.set(satelliteTwo, await utils.signOracleDataResponses(oracleObservations));
        
        await signerFactory(tezos, satelliteThreeSk);
        signatures.set(satelliteThree, await utils.signOracleDataResponses(oracleObservations));

        // Operations
        if(tokenName == "usdt"){

            setPriceOperation = await mockUsdMockFa12TokenAggregatorInstance.methods.updateData(oracleObservations, signatures).send();

        } else if(tokenName == "eurt"){

            setPriceOperation = await mockUsdMockFa2TokenAggregatorInstance.methods.updateData(oracleObservations, signatures).send();

        } else if(tokenName == "mav"){

            setPriceOperation = await mockUsdMvrkAggregatorInstance.methods.updateData(oracleObservations, signatures).send();
            
        } else if(tokenName == "smvn"){

            setPriceOperation = await mockUsdMvnAggregatorInstance.methods.updateData(oracleObservations, signatures).send();
            
        }

        await setPriceOperation.confirmation();
           
    }
    
    // End Helper Functions

    before("setup", async () => {

        utils = new Utils();
        await utils.init(bob.sk);
        tezos = utils.tezos

        admin   = bob.pkh;
        adminSk = bob.sk;

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
        mMvrkTokenInstance                      = await utils.tezos.contract.at(contractDeployments.mTokenMvrk.address);

        mockUsdMockFa12TokenAggregatorInstance  = await utils.tezos.contract.at(contractDeployments.mockUsdMockFa12TokenAggregator.address);
        mockUsdMockFa2TokenAggregatorInstance   = await utils.tezos.contract.at(contractDeployments.mockUsdMockFa2TokenAggregator.address);
        mockUsdMvrkAggregatorInstance           = await utils.tezos.contract.at(contractDeployments.mockUsdMvrkAggregator.address);
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

        // set up token oracles for testing
        mockUsdMockFa12TokenAggregatorStorage   = await mockUsdMockFa12TokenAggregatorInstance.storage();
        mockUsdMockFa2TokenAggregatorStorage    = await mockUsdMockFa2TokenAggregatorInstance.storage();
        mockUsdMvrkAggregatorStorage            = await mockUsdMvrkAggregatorInstance.storage();
        mockUsdMvnAggregatorStorage             = await mockUsdMvnAggregatorInstance.storage();

        // ------------------------------------------------------------------
        //
        // Setup Satellites
        //
        // ----------------------

        satelliteOne    = eve.pkh;
        satelliteTwo    = alice.pkh;
        satelliteThree  = susie.pkh;

        satelliteOneSk  = eve.sk;
        satelliteTwoSk  = alice.sk;
        satelliteThreeSk= susie.sk;

        delegateOne     = david.pkh;
        delegateOneSk   = david.sk;

        delegateTwo     = ivan.pkh;
        delegateTwoSk   = ivan.sk;

        // ------------------------------------------------------------------
        //
        //  Set Lending Controller Mock Time address in Governance General Contracts
        //
        // ------------------------------------------------------------------

        const updateGeneralContractsOperation = await updateGeneralContracts(governanceInstance, 'lendingController', lendingControllerAddress, 'update');
        await updateGeneralContractsOperation.confirmation();

        // ------------------------------------------------------------------
        //
        // Reset Oracle Prices
        //
        // ----------------------
        //
        // Basic price setup
        //
        // MockFA12 price -> 1,500,000 or $1.50
        // MockFA2 price  -> 3,500,000 or $3.50 
        // Mav price      -> 1,800,000 or $1.80
        // Mvn price      -> 1,000,000,000 or $1.00
        //
        // Note: oracle/aggregator prices follow the same default price set in Lending Helpers 
        //
        // ------------------------------------------------------------------

        const mockUsdMockFa12TokenLastData      = await mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.data;
        const mockUsdMockFa2TokenLastData       = await mockUsdMockFa2TokenAggregatorStorage.lastCompletedData.data;
        const mockUsdMavLastData                = await mockUsdMvrkAggregatorStorage.lastCompletedData.data;
        const mockUsdMvnLastData                = await mockUsdMvnAggregatorStorage.lastCompletedData.data;

        usdtTokenIndex                          = lendingHelper.defaultPriceObservations.findIndex((o => o.name === "usdt"));
        eurtTokenIndex                          = lendingHelper.defaultPriceObservations.findIndex((o => o.name === "eurt"));
        mavIndex                                = lendingHelper.defaultPriceObservations.findIndex((o => o.name === "mav"));
        mvnIndex                                = lendingHelper.defaultPriceObservations.findIndex((o => o.name === "smvn"));

        const defaultMockFa12TokenMedianPrice   = lendingHelper.defaultPriceObservations[usdtTokenIndex].medianPrice;
        const defaultMockFa2TokenMedianPrice    = lendingHelper.defaultPriceObservations[eurtTokenIndex].medianPrice;
        const defaultMavMedianPrice             = lendingHelper.defaultPriceObservations[mavIndex].medianPrice;
        const defaultMvnMedianPrice             = lendingHelper.defaultPriceObservations[mvnIndex].medianPrice;

        // reset Mock FA12 token price
        if(mockUsdMockFa12TokenLastData != defaultMockFa12TokenMedianPrice){

            epoch = await mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.epoch;
            round = await mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.round;
            epoch = epoch.toNumber() + 1;
            round = round.toNumber() + 1;

            // default observation data for mock FA-12 token
            defaultObservations = lendingHelper.defaultPriceObservations[usdtTokenIndex].observations;

            // reset token price to default observations
            await setTokenPrice(epoch, round, defaultObservations, "usdt");
        }


        // reset Mock FA2 token price
        if(mockUsdMockFa2TokenLastData != defaultMockFa2TokenMedianPrice){

            epoch = await mockUsdMockFa2TokenAggregatorStorage.lastCompletedData.epoch;
            round = await mockUsdMockFa2TokenAggregatorStorage.lastCompletedData.round;
            epoch = epoch.toNumber() + 1;
            round = round.toNumber() + 1;

            // default observation data for mock FA-2 token
            defaultObservations = lendingHelper.defaultPriceObservations[eurtTokenIndex].observations;

            // reset token price to default observations
            await setTokenPrice(epoch, round, defaultObservations, "eurt");
        }


        // reset Mav price
        if(mockUsdMavLastData != defaultMavMedianPrice){

            epoch = await mockUsdMvrkAggregatorStorage.lastCompletedData.epoch;
            round = await mockUsdMvrkAggregatorStorage.lastCompletedData.round;
            epoch = epoch.toNumber() + 1;
            round = round.toNumber() + 1;

            // default observation data for mvrk
            defaultObservations = lendingHelper.defaultPriceObservations[mavIndex].observations;

            // reset token price to default observations
            await setTokenPrice(epoch, round, defaultObservations, "mav");
        }


        // reset Mvn price
        if(mockUsdMvnLastData != defaultMvnMedianPrice){

            epoch = await mockUsdMvnAggregatorStorage.lastCompletedData.epoch;
            round = await mockUsdMvnAggregatorStorage.lastCompletedData.round;
            epoch = epoch.toNumber() + 1;
            round = round.toNumber() + 1;

            // default observation data for mvn
            defaultObservations = lendingHelper.defaultPriceObservations[mvnIndex].observations;

            // reset token price to default observations
            await setTokenPrice(epoch, round, defaultObservations, "smvn");
        }

        // Update token oracles for local test calulations
        mockUsdMockFa12TokenAggregatorStorage   = await mockUsdMockFa12TokenAggregatorInstance.storage();
        mockUsdMockFa2TokenAggregatorStorage    = await mockUsdMockFa2TokenAggregatorInstance.storage();
        mockUsdMvrkAggregatorStorage             = await mockUsdMvrkAggregatorInstance.storage();
        mockUsdMvnAggregatorStorage             = await mockUsdMvnAggregatorInstance.storage();

        tokenOracles.push({
            'name': 'usdt', 
            'price': mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.data.toNumber(),
            'priceDecimals': mockUsdMockFa12TokenAggregatorStorage.config.decimals.toNumber(),
            'tokenDecimals': 6
        })

        tokenOracles.push({
            'name': 'eurt', 
            'price': mockUsdMockFa2TokenAggregatorStorage.lastCompletedData.data.toNumber(),
            'priceDecimals': mockUsdMockFa2TokenAggregatorStorage.config.decimals.toNumber(),
            'tokenDecimals': 6
        })

        tokenOracles.push({
            'name': 'mav', 
            'price': mockUsdMvrkAggregatorStorage.lastCompletedData.data.toNumber(),
            'priceDecimals': mockUsdMvrkAggregatorStorage.config.decimals.toNumber(),
            'tokenDecimals': 6
        })

        tokenOracles.push({
            'name': "smvn", 
            'price': mockUsdMvnAggregatorStorage.lastCompletedData.data.toNumber(),
            'priceDecimals': mockUsdMvnAggregatorStorage.config.decimals.toNumber(),
            'tokenDecimals': 9
        })

        // ------------------------------------------------------------------
        //
        // Update mTokens (i.e. mTokens) tokenRewardIndex by compounding
        //  - this will ensure that fetching user balances through on-chain views are accurate for continuous re-testing
        //
        // ------------------------------------------------------------------
        await signerFactory(tezos, adminSk);

        const usdtLoanToken     = await lendingControllerStorage.loanTokenLedger.get("usdt"); 
        const eurtLoanToken     = await lendingControllerStorage.loanTokenLedger.get("eurt"); 
        const mavLoanToken      = await lendingControllerStorage.loanTokenLedger.get("mav"); 
        
        if(!(usdtLoanToken == undefined || usdtLoanToken == null)){
            updateTokenRewardIndexOperation = await mUsdtTokenInstance.methods.compound([admin, satelliteOne, satelliteTwo, satelliteThree]).send();
            await updateTokenRewardIndexOperation.confirmation();
        }

        if(!(eurtLoanToken == undefined || eurtLoanToken == null)){
            updateTokenRewardIndexOperation = await mEurtTokenInstance.methods.compound([admin, satelliteOne, satelliteTwo, satelliteThree]).send();
            await updateTokenRewardIndexOperation.confirmation();
        }

        if(!(mavLoanToken == undefined || mavLoanToken == null)){
            updateTokenRewardIndexOperation = await mMvrkTokenInstance.methods.compound([admin, satelliteOne, satelliteTwo, satelliteThree]).send();
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

                    assert.equal(usdtLoanToken.tokenName                , tokenName);
    
                    assert.equal(usdtLoanToken.rawMTokensTotalSupply    , 0);
                    assert.equal(usdtLoanToken.mTokenAddress            , mTokenAddress);
    
                    assert.equal(usdtLoanToken.reserveRatio             , reserveRatio);
                    assert.equal(usdtLoanToken.tokenPoolTotal           , 0);
                    assert.equal(usdtLoanToken.totalBorrowed            , 0);
                    assert.equal(usdtLoanToken.totalRemaining           , 0);
    
                    assert.equal(usdtLoanToken.optimalUtilisationRate   , optimalUtilisationRate);
                    assert.equal(usdtLoanToken.baseInterestRate         , baseInterestRate);
                    assert.equal(usdtLoanToken.maxInterestRate          , maxInterestRate);
                    
                    assert.equal(usdtLoanToken.interestRateBelowOptimalUtilisation       , interestRateBelowOptimalUtilisation);
                    assert.equal(usdtLoanToken.interestRateAboveOptimalUtilisation       , interestRateAboveOptimalUtilisation);
    
                } else {

                    lendingControllerStorage  = await lendingControllerInstance.storage();
                    const usdtLoanToken       = await lendingControllerStorage.loanTokenLedger.get(tokenName); 
                
                    // other variables will be affected from repeated tests
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
                const eurtTokenIndex = tokenOracles.findIndex((o => o.name === "eurt"));
                tokenOracles[eurtTokenIndex].tokenDecimals = tokenDecimals;

                const checkLoanTokenExists   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

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

                    assert.equal(eurtLoanToken.tokenName                , tokenName);

                    assert.equal(eurtLoanToken.rawMTokensTotalSupply    , 0);
                    assert.equal(eurtLoanToken.mTokenAddress            , mTokenAddress);

                    assert.equal(eurtLoanToken.reserveRatio             , reserveRatio);
                    assert.equal(eurtLoanToken.tokenPoolTotal           , 0);
                    assert.equal(eurtLoanToken.totalBorrowed            , 0);
                    assert.equal(eurtLoanToken.totalRemaining           , 0);

                    assert.equal(eurtLoanToken.optimalUtilisationRate   , optimalUtilisationRate);
                    assert.equal(eurtLoanToken.baseInterestRate         , baseInterestRate);
                    assert.equal(eurtLoanToken.maxInterestRate          , maxInterestRate);
                    
                    assert.equal(eurtLoanToken.interestRateBelowOptimalUtilisation       , interestRateBelowOptimalUtilisation);
                    assert.equal(eurtLoanToken.interestRateAboveOptimalUtilisation       , interestRateAboveOptimalUtilisation);

                } else {

                    lendingControllerStorage = await lendingControllerInstance.storage();
                    const eurtLoanToken   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

                    // other variables will be affected from repeated tests
                    assert.equal(eurtLoanToken.tokenName, tokenName);

                }
                
                
            } catch(e){
                console.log(e);
            } 
        });


        it('admin can set mav as a loan token', async () => {

            try{        
                
                // init variables
                await signerFactory(tezos, bob.sk);

                const setLoanTokenActionType                = "createLoanToken";

                const tokenName                             = "mav";
                const tokenType                             = "mav";
                const tokenDecimals                         = 6;

                const oracleAddress                         = contractDeployments.mockUsdMvrkAggregator.address;

                const mTokenAddress                         = contractDeployments.mTokenMvrk.address;

                const interestRateDecimals                  = 27;
                const reserveRatio                          = 1000; // 10% reserves (4 decimals)
                const optimalUtilisationRate                = 50 * (10 ** (interestRateDecimals - 2));  // 30% utilisation rate kink
                const baseInterestRate                      = 5  * (10 ** (interestRateDecimals - 2));  // 5%
                const maxInterestRate                       = 25 * (10 ** (interestRateDecimals - 2));  // 25% 
                const interestRateBelowOptimalUtilisation   = 10 * (10 ** (interestRateDecimals - 2));  // 10% 
                const interestRateAboveOptimalUtilisation   = 20 * (10 ** (interestRateDecimals - 2));  // 20%

                const minRepaymentAmount                    = 10000;

                // update token oracle with token decimals
                const mavIndex = tokenOracles.findIndex((o => o.name === "mav"));
                tokenOracles[mavIndex].tokenDecimals = tokenDecimals;

                // check if loan token exists
                const checkLoanTokenExists   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

                if(checkLoanTokenExists === undefined){

                    const adminSeMavLoanTokenOperation = await lendingControllerInstance.methods.setLoanToken(
                        
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
                    await adminSeMavLoanTokenOperation.confirmation();

                    lendingControllerStorage  = await lendingControllerInstance.storage();
                    const mavLoanToken   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 
                
                    assert.equal(mavLoanToken.tokenName                 , tokenName);
                    assert.equal(mavLoanToken.tokenDecimals             , tokenDecimals);

                    assert.equal(mavLoanToken.rawMTokensTotalSupply     , 0);
                    assert.equal(mavLoanToken.mTokenAddress             , mTokenAddress);
    
                    assert.equal(mavLoanToken.reserveRatio              , reserveRatio);
                    assert.equal(mavLoanToken.tokenPoolTotal            , 0);
                    assert.equal(mavLoanToken.totalBorrowed             , 0);
                    assert.equal(mavLoanToken.totalRemaining            , 0);
    
                    assert.equal(mavLoanToken.optimalUtilisationRate    , optimalUtilisationRate);
                    assert.equal(mavLoanToken.baseInterestRate          , baseInterestRate);
                    assert.equal(mavLoanToken.maxInterestRate           , maxInterestRate);
                    
                    assert.equal(mavLoanToken.interestRateBelowOptimalUtilisation       , interestRateBelowOptimalUtilisation);
                    assert.equal(mavLoanToken.interestRateAboveOptimalUtilisation       , interestRateAboveOptimalUtilisation);
    

                } else {

                    lendingControllerStorage  = await lendingControllerInstance.storage();
                    const mavLoanToken   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 
                
                    // other variables will be affected from repeated tests
                    assert.equal(mavLoanToken.tokenName              , tokenName);
                    
                }

            } catch(e){
                console.log(e);
            } 
        });


        it('non-admin should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                await signerFactory(tezos, satelliteOneSk);
                lendingControllerStorage = await lendingControllerInstance.storage();
                const currentAdmin = lendingControllerStorage.admin;

                const setLoanTokenActionType                = "createLoanToken";

                const tokenName                             = "failTestLoanToken";
                const tokenContractAddress                  = contractDeployments.mavenFa2Token.address;
                const tokenType                             = "fa2";
                const tokenDecimals                         = 6;

                const oracleAddress                         = contractDeployments.mockUsdMockFa2TokenAggregator.address;

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

                    lendingControllerStorage        = await lendingControllerInstance.storage();
                    const usdtCollateralToken       = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 
                
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

                    lendingControllerStorage        = await lendingControllerInstance.storage();
                    const eurtCollateralToken       = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

                    assert.equal(eurtCollateralToken.tokenName              , tokenName);
                    assert.equal(eurtCollateralToken.tokenDecimals          , tokenDecimals);
                    assert.equal(eurtCollateralToken.oracleAddress          , oracleAddress);
                    assert.equal(eurtCollateralToken.protected              , tokenProtected);

                }

            } catch(e){
                console.log(e);
            } 
        });

        it('admin can set mav as a collateral token', async () => {

            try{        
                
                // init variables
                await signerFactory(tezos, bob.sk);

                const setCollateralTokenActionType          = "createCollateralToken";

                const tokenName                             = "mav";
                const tokenContractAddress                  = zeroAddress;
                const tokenType                             = "mav";

                const tokenDecimals                         = 6;
                const oracleAddress                         = contractDeployments.mockUsdMvrkAggregator.address;
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
                    const eurtCollateralToken       = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

                    assert.equal(eurtCollateralToken.tokenName              , tokenName);
                    assert.equal(eurtCollateralToken.tokenDecimals          , tokenDecimals);
                    assert.equal(eurtCollateralToken.oracleAddress          , oracleAddress);
                    assert.equal(eurtCollateralToken.protected              , tokenProtected);

                }

            } catch(e){
                console.log(e);
            } 
        });


        it('admin can set staked MVN as a collateral token', async () => {

            try{        
                
                // init variables
                await signerFactory(tezos, bob.sk);

                const setCollateralTokenActionType      = "createCollateralToken";
                const tokenName                         = "smvn";
                const tokenContractAddress              = contractDeployments.mvnToken.address;
                const tokenType                         = "fa2";

                const tokenDecimals                     = 9;
                const oracleAddress                     = contractDeployments.mockUsdMvnAggregator.address;
                const tokenProtected                    = true; // sMVN is protected

                const isScaledToken                     = false;
                const isStakedToken                     = true;
                const stakingContractAddress            = contractDeployments.doorman.address;
                
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
                        tokenId

                    ).send();
                    await adminSetMockFa12CollateralTokenOperation.confirmation();

                    lendingControllerStorage                = await lendingControllerInstance.storage();
                    const stakedMvnCollateralTokenRecord    = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 
                
                    assert.equal(stakedMvnCollateralTokenRecord.tokenName              , tokenName);
                    assert.equal(stakedMvnCollateralTokenRecord.tokenDecimals          , tokenDecimals);
                    assert.equal(stakedMvnCollateralTokenRecord.oracleAddress          , oracleAddress);
                    assert.equal(stakedMvnCollateralTokenRecord.protected              , tokenProtected);
                    
                }

            } catch(e){
                console.log(e);
            } 
        });


        it('non-admin should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                await signerFactory(tezos, satelliteOneSk);
                lendingControllerStorage = await lendingControllerInstance.storage();
                const currentAdmin = lendingControllerStorage.admin;

                const setCollateralTokenActionType          = "createCollateralToken";

                const tokenName                             = "failTestCollateralToken";
                const tokenContractAddress                  = contractDeployments.mavenFa2Token.address;
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
        
    });



    // 
    // Test: Set Lending Controller Admin
    //
    describe('%setAdmin - Lending Controller', function () {
    
        it('admin can set admin', async () => {
            try{        
        
                await signerFactory(tezos, adminSk);
                const previousAdmin = lendingControllerStorage.admin;
                
                if(previousAdmin == admin){
                    
                    assert.equal(previousAdmin, admin);
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
            const usdtTokenStorage              = await usdtTokenInstance.storage();
            
            // get initial eve's Mock FA12 Token balance
            const eveMockFa12Ledger                 = await usdtTokenStorage.ledger.get(eve.pkh);            
            const eveInitialMockFa12TokenBalance    = eveMockFa12Ledger == undefined ? 0 : eveMockFa12Ledger.balance.toNumber();

            // get initial eve's mToken - Mock FA12 Token (USDT) - balance
            const eveInitialMUsdtTokenTokenBalance    = await mUsdtTokenInstance.contractViews.get_balance({ 0 : eve.pkh, 1 : 0}).executeView({ viewCaller : bob.pkh});

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
            const updatedMUsdtTokenTokenStorage  = await mUsdtTokenInstance.storage();

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
            const updatedEveMUsdtTokenLedger    = await mUsdtTokenInstance.contractViews.get_balance({ 0 : eve.pkh, 1 : 0}).executeView({ viewCaller : bob.pkh});
            assert.equal(updatedEveMUsdtTokenLedger.toNumber(), eveInitialMUsdtTokenTokenBalance.toNumber() + liquidityAmount);

        });

        it('user (eve) can add liquidity for mock FA2 token into Lending Controller token pool (100 MockFA2 Tokens)', async () => {
    
            // init variables
            await signerFactory(tezos, eve.sk);
            const loanTokenName = "eurt";
            const liquidityAmount = 100000000; // 100 Mock FA2 Tokens

            lendingControllerStorage = await lendingControllerInstance.storage();
            
            // get mock fa2 token storage and lp token pool mock fa2 token storage
            const eurtTokenStorage              = await eurtTokenInstance.storage();
            const mEurtTokenStorage   = await mEurtTokenInstance.storage();
            
            // get initial eve's Mock FA2 Token balance
            const eveMockFa2Ledger                 = await eurtTokenStorage.ledger.get(eve.pkh);            
            const eveInitialMockFa2TokenBalance    = eveMockFa2Ledger == undefined ? 0 : eveMockFa2Ledger.toNumber();

            // get initial eve's mToken - Mock FA2 Token (EURT) - balance
            const eveMEurtTokenLedger                 = await mEurtTokenStorage.ledger.get(eve.pkh);            
            const eveInitialMEurtTokenTokenBalance    = eveMEurtTokenLedger == undefined ? 0 : eveMEurtTokenLedger.toNumber();

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
            
            const updatedMEurtTokenTokenStorage     = await mEurtTokenInstance.storage();

            // check new balance for loan token pool total
            const updatedLoanTokenRecord           = await updatedLendingControllerStorage.loanTokenLedger.get(loanTokenName);
            assert.equal(updatedLoanTokenRecord.tokenPoolTotal, lendingControllerInitialTokenPoolTotal + liquidityAmount);

            // check Eve's Mock FA12 Token balance
            const updatedEveMockFa2Ledger          = await updatedMockFa2TokenStorage.ledger.get(eve.pkh);            
            assert.equal(updatedEveMockFa2Ledger, eveInitialMockFa2TokenBalance - liquidityAmount);

            // check Lending Controller's Mock FA2 Token Balance
            const lendingControllerMockFa2Account             = await updatedMockFa2TokenStorage.ledger.get(lendingControllerAddress);            
            assert.equal(lendingControllerMockFa2Account, lendingControllerInitialMockFa2TokenBalance + liquidityAmount);

            // check Eve's mEurt Token Token balance
            const updatedEveMEurtTokenLedger        = await updatedMEurtTokenTokenStorage.ledger.get(eve.pkh);            
            assert.equal(updatedEveMEurtTokenLedger, eveInitialMEurtTokenTokenBalance + liquidityAmount);        

        });


        it('user (eve) can add liquidity for mav into Lending Controller token pool (100 MVRK)', async () => {
    
            // init variables
            await signerFactory(tezos, eve.sk);
            const loanTokenName = "mav";
            const liquidityAmount = 100000000; // 100 MVRK

            lendingControllerStorage = await lendingControllerInstance.storage();
            
            // get mToken MVRK token storage (FA2 Token Standard)
            const mMvrkTokenStorage   = await mMvrkTokenInstance.storage();

            // get initial eve MVRK balance
            const eveInitialMvrkLedger   = await utils.tezos.tz.getBalance(eve.pkh);
            const eveInitialMvrkBalance  = eveInitialMvrkLedger.toNumber();

            // get initial eve's mEurt Token - Mav - balance
            const eveMMvrkTokenLedger            = await mMvrkTokenStorage.ledger.get(eve.pkh);            
            const eveInitialMMvrkTokenBalance    = eveMMvrkTokenLedger == undefined ? 0 : eveMMvrkTokenLedger.toNumber();
            
            // get initial lending controller's MVRK balance
            const lendingControllerInitialMvrkLedger   = await utils.tezos.tz.getBalance(lendingControllerAddress);
            const lendingControllerInitialMvrkBalance  = lendingControllerInitialMvrkLedger.toNumber();

            // get initial lending controller token pool total
            const initialLoanTokenRecord                 = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
            const lendingControllerInitialTokenPoolTotal = initialLoanTokenRecord.tokenPoolTotal.toNumber();

            // eve deposits mock MVRK into lending controller token pool
            const eveAddLiquidityOperation  = await lendingControllerInstance.methods.addLiquidity(
                loanTokenName,
                liquidityAmount, 
            ).send({ mumav : true, amount: liquidityAmount });
            await eveAddLiquidityOperation.confirmation();

            // get updated storages
            const updatedLendingControllerStorage  = await lendingControllerInstance.storage();
            const updatedMMvrkTokenStorage     = await mMvrkTokenInstance.storage();

            // check new balance for loan token pool total
            const updatedLoanTokenRecord           = await updatedLendingControllerStorage.loanTokenLedger.get(loanTokenName);
            assert.equal(updatedLoanTokenRecord.tokenPoolTotal, lendingControllerInitialTokenPoolTotal + liquidityAmount);

            // check Lending Controller's MVRK Balance
            const lendingControllerMvrkBalance           = await utils.tezos.tz.getBalance(lendingControllerAddress);
            assert.equal(lendingControllerMvrkBalance, lendingControllerInitialMvrkBalance + liquidityAmount);

            // check Eve's mToken Pool MVRK balance
            const updatedEveMMvrkTokenLedger        = await updatedMMvrkTokenStorage.ledger.get(eve.pkh);            
            assert.equal(updatedEveMMvrkTokenLedger, eveInitialMMvrkTokenBalance + liquidityAmount);        

            // check Eve's MVRK Balance and account for gas cost in transaction with almostEqual
            const eveMvrkBalance = await utils.tezos.tz.getBalance(eve.pkh);
            assert.equal(almostEqual(eveMvrkBalance, eveInitialMvrkBalance - liquidityAmount, 0.001), true)

        });
    
    })    


    // 
    // Test RWA Vault Liquidation - no repayment for at least 4 missed periods
    //
    describe('%liquidateVault - test vault liquidation', function () {

        it('vault with healthy collateral ratio but missed 4 periods of interest repayment: user (mallory) can mark eve\'s vault for liquidation (interest accumulated over time) and liquidate vault with refunds for overflow - [Collateral Token: Mock FA-12 | Loan Token: Mock FA-12]', async () => {
            
            // init variables and storage
            lendingControllerStorage = await lendingControllerInstance.storage();
            vaultFactoryStorage      = await vaultFactoryInstance.storage();

            currentMockLevel      = lendingControllerStorage.mockLevel;

            // ----------------------------------------------------------------------------------------------
            // Create Vault
            // ----------------------------------------------------------------------------------------------


            await signerFactory(tezos, eve.sk);

            const vaultCounter      = vaultFactoryStorage.vaultCounter;
            const vaultId           = vaultCounter.toNumber();
            const vaultOwner        = eve.pkh;
            const liquidator        = mallory.pkh;
            const loanTokenName     = "usdt";
            const vaultName         = "newVault";
            const vaultConfig       = 1; // vault config - RWA type
            const depositorsConfig  = "any";

            const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
                baker.pkh,              // delegate to
                vaultConfig,
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

            const vaultConfigRecord = await lendingControllerStorage.vaultConfigLedger.get(vaultRecord.vaultConfig);

            // config variables
            const liquidationDelayInMins        = vaultConfigRecord.liquidationDelayInMins.toNumber();
            const liquidationMaxDuration        = vaultConfigRecord.liquidationMaxDuration.toNumber();
            const maxVaultLiquidationPercent    = vaultConfigRecord.maxVaultLiquidationPercent.toNumber();
            const adminLiquidationFeePercent    = vaultConfigRecord.adminLiquidationFeePercent.toNumber();
            const liquidationFeePercent         = vaultConfigRecord.liquidationFeePercent.toNumber();
            const interestTreasuryShare         = vaultConfigRecord.interestTreasuryShare.toNumber();

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

            let setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(
                [
                    {
                        configName: "mockLevel",
                        newValue: newMockLevel
                    },
                ]
            ).send();
            await setMockLevelOperation.confirmation();

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

            setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(
                [
                    {
                        configName: "mockLevel",
                        newValue: newMockLevel
                    },
                ]
            ).send();
            await setMockLevelOperation.confirmation();

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

            setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(
                [
                    {
                        configName: "mockLevel",
                        newValue: newMockLevel
                    },
                ]
            ).send();
            await setMockLevelOperation.confirmation();

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
            vaultOwnerMockFa12TokenAccount          = await usdtTokenStorage.ledger.get(vaultOwner);            
            updatedVaultOwnerMockFa12TokenBalance   = vaultOwnerMockFa12TokenAccount == undefined ? 0 : vaultOwnerMockFa12TokenAccount.balance.toNumber();

            vaultMockFa12TokenAccount               = await usdtTokenStorage.ledger.get(vaultAddress);            
            updatedVaultMockFa12TokenBalance        = vaultMockFa12TokenAccount == undefined ? 0 : vaultMockFa12TokenAccount.balance.toNumber();

            liquidatorMockFa12TokenAccount          = await usdtTokenStorage.ledger.get(liquidator);            
            updatedLiquidatorMockFa12TokenBalance   = liquidatorMockFa12TokenAccount == undefined ? 0 : liquidatorMockFa12TokenAccount.balance.toNumber();

            treasuryMockFa12TokenAccount            = await usdtTokenStorage.ledger.get(contractDeployments.treasury.address);            
            updatedTreasuryMockFa12TokenBalance     = treasuryMockFa12TokenAccount == undefined ? 0 : treasuryMockFa12TokenAccount.balance.toNumber();

            lendingControllerMockFa12TokenAccount            = await usdtTokenStorage.ledger.get(lendingControllerAddress);            
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
            assert.equal(vaultLoanOutstandingTotal, finalLoanOutstandingTotal);
            assert.equal(vaultLoanPrincipalTotal.toNumber(), finalLoanPrincipalTotal);
            assert.equal(vaultLoanInterestTotal.toNumber(), finalLoanInterestTotal);

            // check that remaining loan outstanding total is correct 
            // i.e. if maxVaultLiquidationPercent is 50%, then not more than 50% of the loan outstanding can be liquidated, and there should be 50% remaining
            assert.equal(vaultLoanOutstandingTotal, initialVaultLoanOutstandingTotal - vaultMaxLiquidationAmount);

            // test vault cannot be liquidated again 
            failLiquidateVaultOperation = await lendingControllerInstance.methods.liquidateVault(vaultId, vaultOwner, failTestLiquidationAmount);
            await chai.expect(failLiquidateVaultOperation.send()).to.be.rejected;

        })



    })

    // 
    // Test Vault Liquidation
    //
    // describe('%liquidateVault - test vault liquidation', function () {
 
    //     it('simple one token test: user (mallory) can mark eve\'s vault for liquidation (interest accumulated over time) and liquidate vault with refunds for overflow - [Collateral Token: Mock FA-12 | Loan Token: Mock FA-12]', async () => {
            
    //         // init variables and storage
    //         lendingControllerStorage = await lendingControllerInstance.storage();
    //         vaultFactoryStorage      = await vaultFactoryInstance.storage();

    //         currentMockLevel      = lendingControllerStorage.mockLevel;

    //         // ----------------------------------------------------------------------------------------------
    //         // Create Vault
    //         // ----------------------------------------------------------------------------------------------


    //         await signerFactory(tezos, eve.sk);

    //         const vaultCounter      = vaultFactoryStorage.vaultCounter;
    //         const vaultId           = vaultCounter.toNumber();
    //         const vaultOwner        = eve.pkh;
    //         const liquidator        = mallory.pkh;
    //         const loanTokenName     = "usdt";
    //         const vaultName         = "newVault";
    //         const vaultConfig       = 1; // vault config - RWA type
    //         const depositorsConfig  = "any";

    //         const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
    //             baker.pkh,              // delegate to
    //             vaultConfig,
    //             loanTokenName,          // loan token type
    //             vaultName,              // vault name
    //             null,                   // collateral tokens
    //             depositorsConfig        // depositors config type - any / whitelist
    //         ).send();
    //         await userCreatesNewVaultOperation.confirmation();

    //         const vaultHandle = {
    //             "id"    : vaultId,
    //             "owner" : vaultOwner
    //         };
    //         vaultRecord = await lendingControllerStorage.vaults.get(vaultHandle);
    //         const vaultAddress   = vaultRecord.address;
    //         const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

    //         const vaultConfigRecord = await lendingControllerStorage.vaultConfigLedger.get(vaultRecord.vaultConfig);

    //         // config variables
    //         const liquidationDelayInMins        = vaultConfigRecord.liquidationDelayInMins.toNumber();
    //         const liquidationMaxDuration        = vaultConfigRecord.liquidationMaxDuration.toNumber();
    //         const maxVaultLiquidationPercent    = vaultConfigRecord.maxVaultLiquidationPercent.toNumber();
    //         const adminLiquidationFeePercent    = vaultConfigRecord.adminLiquidationFeePercent.toNumber();
    //         const liquidationFeePercent         = vaultConfigRecord.liquidationFeePercent.toNumber();
    //         const interestTreasuryShare         = vaultConfigRecord.interestTreasuryShare.toNumber();

    //         // console.log('   - vault originated: ' + vaultAddress);
    //         // console.log('   - vault id: ' + vaultId);

    //         // push new vault id to vault set
    //         eveVaultSet.push(vaultId);

            
    //         // ----------------------------------------------------------------------------------------------
    //         // Deposit Collateral into Vault
    //         // ----------------------------------------------------------------------------------------------

  
    //         const usdtDepositAmount  = 8000000;   // 8 Mock FA12 Tokens - USD $12.00

    //         // ---------------------------------
    //         // Deposit Mock FA12 Tokens
    //         // ---------------------------------

    //         // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
    //         // reset token allowance
    //         const resetTokenAllowanceForDeposit = await usdtTokenInstance.methods.approve(
    //             vaultAddress,
    //             0
    //         ).send();
    //         await resetTokenAllowanceForDeposit.confirmation();

    //         // set new token allowance
    //         const setNewTokenAllowanceForDeposit = await usdtTokenInstance.methods.approve(
    //             vaultAddress,
    //             usdtDepositAmount
    //         ).send();
    //         await setNewTokenAllowanceForDeposit.confirmation();

    //         // eve deposits mock FA12 tokens into vault
    //         const eveDepositMockFa12TokenOperation  = await vaultInstance.methods.initVaultAction(
    //             "deposit",
    //             usdtDepositAmount,           
    //             "usdt"
    //         ).send();
    //         await eveDepositMockFa12TokenOperation.confirmation();

    //         // console.log('   - vault collateral deposited: Mock FA-12 Tokens: ' + usdtDepositAmount);

            
    //         // ----------------------------------------------------------------------------------------------
    //         // Borrow with Vault
    //         // ----------------------------------------------------------------------------------------------


    //         // borrow amount - 4 Mock FA12 Tokens
    //         const borrowAmount = 4000000;   

    //         // borrow operation
    //         const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
    //         await eveBorrowOperation.confirmation();

    //         // console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName);

    //         // get initial Mock FA12 Token balance for Eve (vault owner), liquidator, vault, Treasury and Token Pool Reward Contract
    //         vaultOwnerMockFa12TokenAccount          =  await usdtTokenStorage.ledger.get(vaultOwner);            
    //         initialVaultOwnerMockFa12TokenBalance   = vaultOwnerMockFa12TokenAccount == undefined ? 0 : vaultOwnerMockFa12TokenAccount.balance.toNumber();

    //         vaultMockFa12TokenAccount               =  await usdtTokenStorage.ledger.get(vaultAddress);            
    //         initialVaultMockFa12TokenBalance        = vaultMockFa12TokenAccount == undefined ? 0 : vaultMockFa12TokenAccount.balance.toNumber();

    //         liquidatorMockFa12TokenAccount          =  await usdtTokenStorage.ledger.get(liquidator);            
    //         initialLiquidatorMockFa12TokenBalance   = liquidatorMockFa12TokenAccount == undefined ? 0 : liquidatorMockFa12TokenAccount.balance.toNumber();

    //         treasuryMockFa12TokenAccount            =  await usdtTokenStorage.ledger.get(contractDeployments.treasury.address);            
    //         initialTreasuryMockFa12TokenBalance     = treasuryMockFa12TokenAccount == undefined ? 0 : treasuryMockFa12TokenAccount.balance.toNumber();

    //         lendingControllerMockFa12TokenAccount            =  await usdtTokenStorage.ledger.get(lendingControllerAddress);            
    //         initialLendingControllerMockFa12TokenBalance     = lendingControllerMockFa12TokenAccount == undefined ? 0 : lendingControllerMockFa12TokenAccount.balance.toNumber();

    //         // get token pool stats
    //         lendingControllerStorage       = await lendingControllerInstance.storage();
    //         vaultRecord                    = await lendingControllerStorage.vaults.get(vaultHandle);
    //         loanTokenRecord                = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
            
    //         loanTokenDecimals              = loanTokenRecord.tokenDecimals;
    //         const interestRateDecimals     = (27 - 2); 

    //         const tokenPoolTotal           = loanTokenRecord.tokenPoolTotal.toNumber() / (10 ** loanTokenDecimals.toNumber());
    //         const totalBorrowed            = loanTokenRecord.totalBorrowed.toNumber() / (10 ** loanTokenDecimals.toNumber());
    //         const optimalUtilisationRate   = Number(loanTokenRecord.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
    //         const utilisationRate          = Number(loanTokenRecord.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
    //         const currentInterestRate      = Number(loanTokenRecord.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";

    //         // console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);

            
    //         // ----------------------------------------------------------------------------------------------
    //         // Set Block Levels For Mock Time Test - 7 years
    //         // ----------------------------------------------------------------------------------------------


    //         await signerFactory(tezos, bob.sk); // temporarily set to tester to increase block levels

    //         lendingControllerStorage    = await lendingControllerInstance.storage();
    //         vaultRecord                 = await lendingControllerStorage.vaults.get(vaultHandle);
    //         lastUpdatedBlockLevel       = vaultRecord.lastUpdatedBlockLevel;

    //         const yearsPassed  = 7; 
    //         mockLevelChange = yearsPassed * oneYearLevelBlocks;
    //         newMockLevel = lastUpdatedBlockLevel.toNumber() + mockLevelChange;

    //         let setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(
    //             [
    //                 {
    //                     configName: "mockLevel",
    //                     newValue: newMockLevel
    //                 },
    //             ]
    //         ).send();
    //         await setMockLevelOperation.confirmation();

    //         lendingControllerStorage = await lendingControllerInstance.storage();
    //         currentMockLevel = lendingControllerStorage.config.mockLevel;

    //         assert.equal(currentMockLevel, newMockLevel);

    //         // console.log('   - time set to ' + yearsPassed + ' years ahead: ' + lastUpdatedBlockLevel + ' to ' + newMockLevel + ' | Changed by: ' + mockLevelChange);


    //         // ----------------------------------------------------------------------------------------------
    //         // Vault Marked for liquidation
    //         // ----------------------------------------------------------------------------------------------


    //         await signerFactory(tezos, mallory.sk); // mallory as liquidator

    //         const markVaultForLiquidationOperation = await lendingControllerInstance.methods.markForLiquidation(vaultId, vaultOwner).send();
    //         await markVaultForLiquidationOperation.confirmation();

    //         lendingControllerStorage                = await lendingControllerInstance.storage();
    //         vaultRecord                             = await lendingControllerStorage.vaults.get(vaultHandle);
    //         currentMockLevel                        = lendingControllerStorage.config.mockLevel.toNumber();            

    //         const expectedMarkedForLiquidationLevel = currentMockLevel;
    //         const expectedLiquidationEndLevel       = currentMockLevel + (liquidationMaxDuration * oneMinuteLevelBlocks);

    //         initialVaultLoanOutstandingTotal        = vaultRecord.loanOutstandingTotal;
    //         initialVaultLoanPrincipalTotal          = vaultRecord.loanPrincipalTotal;
    //         initialVaultBorrowIndex                 = vaultRecord.borrowIndex;

    //         const vaultMarkedForLiquidationLevel    = vaultRecord.markedForLiquidationLevel;
    //         const vaultLiquidationEndLevel          = vaultRecord.liquidationEndLevel;

    //         assert.equal(vaultMarkedForLiquidationLevel, expectedMarkedForLiquidationLevel);
    //         assert.equal(vaultLiquidationEndLevel, expectedLiquidationEndLevel);

    //         // test vault cannot be marked for liquidation if it has already been marked
    //         const failMarkVaultForLiquidation = await lendingControllerInstance.methods.markForLiquidation(vaultId, vaultOwner);
    //         await chai.expect(failMarkVaultForLiquidation.send()).to.be.rejected;


    //         // ----------------------------------------------------------------------------------------------
    //         // After marked for liquidation: set block level ahead by half of liquidationDelayinMins
    //         // ----------------------------------------------------------------------------------------------


    //         await signerFactory(tezos, bob.sk); // temporarily set to tester to increase block levels

    //         lendingControllerStorage    = await lendingControllerInstance.storage();
    //         vaultRecord                 = await lendingControllerStorage.vaults.get(vaultHandle);
    //         markedForLiquidationLevel   = vaultRecord.markedForLiquidationLevel;

    //         minutesPassed  = liquidationDelayInMins / 2; 
    //         mockLevelChange = minutesPassed * oneMinuteLevelBlocks;
    //         newMockLevel = markedForLiquidationLevel.toNumber() + mockLevelChange;

    //         setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(
    //             [
    //                 {
    //                     configName: "mockLevel",
    //                     newValue: newMockLevel
    //                 },
    //             ]
    //         ).send();
    //         await setMockLevelOperation.confirmation();

    //         lendingControllerStorage = await lendingControllerInstance.storage();
    //         currentMockLevel = lendingControllerStorage.config.mockLevel;

    //         assert.equal(currentMockLevel, newMockLevel);

    //         // console.log('   - time set to middle of vault liquidation delay: ' + markedForLiquidationLevel + ' to ' + newMockLevel + ' | Changed by: ' + mockLevelChange);

    //         // test vault cannot be marked for liquidation if it has already been marked
    //         const failMarkVaultForLiquidationAgain = await lendingControllerInstance.methods.markForLiquidation(vaultId, vaultOwner);
    //         await chai.expect(failMarkVaultForLiquidationAgain.send()).to.be.rejected;

    //         // test vault cannot be liquidated if delay has not been passed
    //         const failTestLiquidationAmount = 10;
    //         failLiquidateVaultOperation = await lendingControllerInstance.methods.liquidateVault(vaultId, vaultOwner, failTestLiquidationAmount);
    //         await chai.expect(failLiquidateVaultOperation.send()).to.be.rejected;


    //         // ----------------------------------------------------------------------------------------------
    //         // Set Block Levels For Mock Time Test - immediately after delay ends
    //         // ----------------------------------------------------------------------------------------------


    //         await signerFactory(tezos, bob.sk); // temporarily set to tester to increase block levels

    //         lendingControllerStorage    = await lendingControllerInstance.storage();
    //         vaultRecord                 = await lendingControllerStorage.vaults.get(vaultHandle);
    //         markedForLiquidationLevel   = vaultRecord.markedForLiquidationLevel;

    //         minutesPassed  = liquidationDelayInMins + 1;
    //         mockLevelChange = minutesPassed * oneMinuteLevelBlocks;
    //         newMockLevel = markedForLiquidationLevel.toNumber() + mockLevelChange;

    //         setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(
    //             [
    //                 {
    //                     configName: "mockLevel",
    //                     newValue: newMockLevel
    //                 },
    //             ]
    //         ).send();
    //         await setMockLevelOperation.confirmation();

    //         lendingControllerStorage = await lendingControllerInstance.storage();
    //         currentMockLevel = lendingControllerStorage.config.mockLevel;

    //         assert.equal(currentMockLevel, newMockLevel);

    //         // console.log('   - time set to immediately after vault liquidation delay: ' + markedForLiquidationLevel + ' to ' + newMockLevel + ' | Changed by: ' + mockLevelChange);

            
    //         // ----------------------------------------------------------------------------------------------
    //         // Liquidate Vault
    //         // ----------------------------------------------------------------------------------------------


    //         await signerFactory(tezos, mallory.sk); 
    //         const liquidationAmount = 100;

    //         // mallory resets mock FA12 tokens allowance then set new allowance to liquidate amount
    //         // reset token allowance
    //         resetTokenAllowance = await usdtTokenInstance.methods.approve(
    //             lendingControllerAddress,
    //             0
    //         ).send();
    //         await resetTokenAllowance.confirmation();

    //         // set new token allowance
    //         setNewTokenAllowance = await usdtTokenInstance.methods.approve(
    //             lendingControllerAddress,
    //             liquidationAmount
    //         ).send();
    //         await setNewTokenAllowance.confirmation();

    //         liquidateVaultOperation = await lendingControllerInstance.methods.liquidateVault(vaultId, vaultOwner, liquidationAmount).send();
    //         await liquidateVaultOperation.confirmation();

    //         // ----------------------------------------------------------------------------------------------
    //         // Vault calculations on loan outstanding, accrued interest, and liquidation fees
    //         // ----------------------------------------------------------------------------------------------


    //         // Update storage
    //         lendingControllerStorage    = await lendingControllerInstance.storage();
    //         usdtTokenStorage            = await usdtTokenInstance.storage();

    //         // vault record
    //         vaultRecord                 = await lendingControllerStorage.vaults.get(vaultHandle);
    //         vaultLoanOutstandingTotal   = vaultRecord.loanOutstandingTotal;
    //         vaultLoanPrincipalTotal     = vaultRecord.loanPrincipalTotal;
    //         vaultLoanInterestTotal      = vaultRecord.loanInterestTotal;
    //         vaultBorrowIndex            = vaultRecord.borrowIndex;

    //         // loan token record
    //         loanTokenRecord             = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
    //         updatedLoanTokenBorrowIndex = loanTokenRecord.borrowIndex;

    //         // vault calculations
    //         loanOutstandingWithAccruedInterest      = lendingHelper.calculateAccruedInterest(initialVaultLoanOutstandingTotal, initialVaultBorrowIndex, updatedLoanTokenBorrowIndex);
    //         totalInterest                           = loanOutstandingWithAccruedInterest - initialVaultLoanPrincipalTotal.toNumber();
    //         remainingInterest                       = lendingHelper.calculateRemainingInterest(liquidationAmount, totalInterest)


    //         // check that calculations are correct - use of almostEqual as there may be a slight difference of 1 from rounding errors 
    //         assert.equal(almostEqual(vaultLoanOutstandingTotal, loanOutstandingWithAccruedInterest - liquidationAmount, 0.0001), true);
    //         assert.equal(almostEqual(vaultLoanInterestTotal, totalInterest - liquidationAmount, 0.0001), true);


    //         // liquidation calculations
    //         adminLiquidationFee                     = lendingHelper.calculateAdminLiquidationFee(adminLiquidationFeePercent, liquidationAmount);
    //         liquidationIncentive                    = lendingHelper.calculateLiquidationIncentive(liquidationFeePercent, liquidationAmount);
            
    //         liquidationAmountWithIncentive          = liquidationAmount + liquidationIncentive;                       // amount sent to liquidator
    //         liquidationAmountWithFeesAndIncentive   = liquidationAmount + liquidationIncentive + adminLiquidationFee; // total liquidated from vault

    //         vaultMaxLiquidationAmount               = lendingHelper.calculateVaultMaxLiquidationAmount(vaultLoanOutstandingTotal, maxVaultLiquidationPercent);
    //         totalLiquidationAmount                  = lendingHelper.calculateTotalLiquidationAmount(liquidationAmount, vaultMaxLiquidationAmount);
    //         totalInterestPaid                       = lendingHelper.calculateTotalInterestPaid(totalLiquidationAmount, vaultLoanInterestTotal);
            
    //         interestSentToTreasury                  = lendingHelper.calculateInterestSentToTreasury(interestTreasuryShare, totalInterestPaid)
    //         interestRewards                         = lendingHelper.calculateInterestRewards(interestSentToTreasury, totalInterestPaid);

    //         finalLoanOutstandingTotal               = lendingHelper.calculateFinalLoanOutstandingTotal(totalLiquidationAmount, loanOutstandingWithAccruedInterest);
    //         finalLoanPrincipalTotal                 = lendingHelper.calculateFinalLoanPrincipalTotal(totalLiquidationAmount, loanOutstandingWithAccruedInterest, remainingInterest, initialVaultLoanPrincipalTotal);
    //         finalLoanInterestTotal                  = lendingHelper.calculateFinalLoanInterestTotal(remainingInterest);
            
            
    //         // ----------------------------------------------------------------------------------------------
    //         // Accounts and Balances
    //         // ----------------------------------------------------------------------------------------------


    //         // get updated Mock FA12 Token balance for Eve (vault owner), liquidator, vault, Treasury and Token Pool Reward Contract
    //         vaultOwnerMockFa12TokenAccount          = await usdtTokenStorage.ledger.get(vaultOwner);            
    //         updatedVaultOwnerMockFa12TokenBalance   = vaultOwnerMockFa12TokenAccount == undefined ? 0 : vaultOwnerMockFa12TokenAccount.balance.toNumber();

    //         vaultMockFa12TokenAccount               = await usdtTokenStorage.ledger.get(vaultAddress);            
    //         updatedVaultMockFa12TokenBalance        = vaultMockFa12TokenAccount == undefined ? 0 : vaultMockFa12TokenAccount.balance.toNumber();

    //         liquidatorMockFa12TokenAccount          = await usdtTokenStorage.ledger.get(liquidator);            
    //         updatedLiquidatorMockFa12TokenBalance   = liquidatorMockFa12TokenAccount == undefined ? 0 : liquidatorMockFa12TokenAccount.balance.toNumber();

    //         treasuryMockFa12TokenAccount            = await usdtTokenStorage.ledger.get(contractDeployments.treasury.address);            
    //         updatedTreasuryMockFa12TokenBalance     = treasuryMockFa12TokenAccount == undefined ? 0 : treasuryMockFa12TokenAccount.balance.toNumber();

    //         lendingControllerMockFa12TokenAccount            = await usdtTokenStorage.ledger.get(lendingControllerAddress);            
    //         updatedLendingControllerMockFa12TokenBalance     = lendingControllerMockFa12TokenAccount == undefined ? 0 : lendingControllerMockFa12TokenAccount.balance.toNumber();


    //         // --------------------------------------------------------
    //         // Simple test note: in this case, since there is only one collateral token,
    //         // the token proportion will be equal to 1 (i.e. 1e27) and there are no calculations for token proportions
    //         // --------------------------------------------------------


    //         // check that there are no changes to the vault owner's balance
    //         assert.equal(updatedVaultOwnerMockFa12TokenBalance, initialVaultOwnerMockFa12TokenBalance);

    //         // vault should have a total reduction in balance equal to liquidationAmountWithFeesAndIncentive
    //         assert.equal(updatedVaultMockFa12TokenBalance, initialVaultMockFa12TokenBalance - liquidationAmountWithFeesAndIncentive);
            
    //         // with a liquidation amount of 100, liquidator's incentive of 6%, liquidator will receive 106 after liquidation - total net gain will be 106 - 100 = 6
    //         assert.equal(updatedLiquidatorMockFa12TokenBalance, initialLiquidatorMockFa12TokenBalance - liquidationAmount + liquidationAmountWithIncentive);

    //         // treasury should receive both admin fee and share from interest repaid (e.g. 6% and 1% respectively -> with a liquidation amount of 100, treasury should receive 7)
    //         assert.equal(updatedTreasuryMockFa12TokenBalance, initialTreasuryMockFa12TokenBalance + adminLiquidationFee + interestSentToTreasury);

    //         // lending controller should receive interest rewards
    //         assert.equal(updatedLendingControllerMockFa12TokenBalance, initialLendingControllerMockFa12TokenBalance + interestRewards);

    //         // check vault records that loan outstanding has decreased
    //         // - no change to vault loan principal as liquidation amount is not enough to cover total interest accrued
    //         assert.equal(vaultLoanOutstandingTotal, loanOutstandingWithAccruedInterest - liquidationAmount);
    //         assert.equal(vaultLoanPrincipalTotal.toNumber(), initialVaultLoanPrincipalTotal.toNumber());
    //         assert.equal(vaultLoanInterestTotal, remainingInterest);


    //         // ----------------------------------------------------------------------------------------------
    //         // Test refund with liquidation amount greater than the maximum allowed
    //         // ----------------------------------------------------------------------------------------------


    //         // set initial variables to be used for subsequent calculations and comparisons
    //         initialVaultBorrowIndex                 = vaultBorrowIndex;
    //         initialVaultLoanOutstandingTotal        = vaultLoanOutstandingTotal; 
    //         initialVaultLoanPrincipalTotal          = vaultLoanPrincipalTotal;
    //         initialVaultLoanInterestTotal           = vaultLoanInterestTotal;
            
    //         initialVaultMockFa12TokenBalance                = updatedVaultMockFa12TokenBalance
    //         initialLiquidatorMockFa12TokenBalance           = updatedLiquidatorMockFa12TokenBalance;
    //         initialTreasuryMockFa12TokenBalance             = updatedTreasuryMockFa12TokenBalance;
    //         initialLendingControllerMockFa12TokenBalance    = updatedLendingControllerMockFa12TokenBalance;


    //         // get new max liquidation amount - i.e. this will be the total liquidated amount with an overflow
    //         vaultMaxLiquidationAmount = lendingHelper.calculateVaultMaxLiquidationAmount(vaultLoanOutstandingTotal, maxVaultLiquidationPercent);
            
    //         const overflowAmount            = 100000000; // 100 Mock FA12 token
    //         const overflowLiquidationAmount = vaultMaxLiquidationAmount + overflowAmount;

    //         // mallory resets mock FA12 tokens allowance then set new allowance to liquidate amount
    //         // reset token allowance
    //         resetTokenAllowance = await usdtTokenInstance.methods.approve(
    //             lendingControllerAddress,
    //             0
    //         ).send();
    //         await resetTokenAllowance.confirmation();

    //         // set new token allowance
    //         setNewTokenAllowance = await usdtTokenInstance.methods.approve(
    //             lendingControllerAddress,
    //             overflowLiquidationAmount
    //         ).send();
    //         await setNewTokenAllowance.confirmation();


    //         // liquidate vault with overflow liquidation amount
    //         const overflowLiquidateVault = await lendingControllerInstance.methods.liquidateVault(vaultId, vaultOwner, overflowLiquidationAmount).send();
    //         await overflowLiquidateVault.confirmation();

    //         // -------------------------------------
    //         // Get updated storage
    //         // -------------------------------------

    //         // Update storage
    //         lendingControllerStorage    = await lendingControllerInstance.storage();
    //         usdtTokenStorage            = await usdtTokenInstance.storage();

    //         // loan token record
    //         loanTokenRecord             = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
    //         updatedLoanTokenBorrowIndex = loanTokenRecord.borrowIndex;

    //         // vault record
    //         vaultRecord                 = await lendingControllerStorage.vaults.get(vaultHandle);
    //         vaultLoanOutstandingTotal   = vaultRecord.loanOutstandingTotal;
    //         vaultLoanPrincipalTotal     = vaultRecord.loanPrincipalTotal;
    //         vaultLoanInterestTotal      = vaultRecord.loanInterestTotal;
    //         vaultBorrowIndex            = vaultRecord.borrowIndex;


    //         // i.e. vaultMaxLiquidationAmount will be the total liquidation amount as it is less than overflowLiquidationAmount
    //         totalLiquidationAmount                  = lendingHelper.calculateTotalLiquidationAmount(overflowLiquidationAmount, vaultMaxLiquidationAmount);

    //         // liquidation calculations
    //         adminLiquidationFee                     = lendingHelper.calculateAdminLiquidationFee(adminLiquidationFeePercent, totalLiquidationAmount);
    //         liquidationIncentive                    = lendingHelper.calculateLiquidationIncentive(liquidationFeePercent, totalLiquidationAmount);
            
    //         liquidationAmountWithIncentive          = totalLiquidationAmount + liquidationIncentive;                       // amount sent to liquidator
    //         liquidationAmountWithFeesAndIncentive   = totalLiquidationAmount + liquidationIncentive + adminLiquidationFee; // total liquidated from vault


    //         // vault calculations
    //         loanOutstandingWithAccruedInterest      = lendingHelper.calculateAccruedInterest(initialVaultLoanOutstandingTotal, initialVaultBorrowIndex, updatedLoanTokenBorrowIndex);
    //         totalInterest                           = loanOutstandingWithAccruedInterest - initialVaultLoanPrincipalTotal.toNumber();
    //         remainingInterest                       = lendingHelper.calculateRemainingInterest(totalLiquidationAmount, totalInterest);
    //         totalInterestPaid                       = lendingHelper.calculateTotalInterestPaid(totalLiquidationAmount, totalInterest);

    //         interestSentToTreasury                  = lendingHelper.calculateInterestSentToTreasury(interestTreasuryShare, totalInterestPaid)
    //         interestRewards                         = lendingHelper.calculateInterestRewards(interestSentToTreasury, totalInterestPaid);

    //         finalLoanOutstandingTotal               = lendingHelper.calculateFinalLoanOutstandingTotal(totalLiquidationAmount, loanOutstandingWithAccruedInterest);
    //         finalLoanPrincipalTotal                 = lendingHelper.calculateFinalLoanPrincipalTotal(totalLiquidationAmount, loanOutstandingWithAccruedInterest, remainingInterest, initialVaultLoanPrincipalTotal);
    //         finalLoanInterestTotal                  = lendingHelper.calculateFinalLoanInterestTotal(remainingInterest);


    //         // get updated Mock FA12 Token balance for liquidator, vault, Treasury and Token Pool Reward Contract
    //         vaultMockFa12TokenAccount               =  await usdtTokenStorage.ledger.get(vaultAddress);            
    //         updatedVaultMockFa12TokenBalance        = vaultMockFa12TokenAccount == undefined ? 0 : vaultMockFa12TokenAccount.balance.toNumber();

    //         liquidatorMockFa12TokenAccount          =  await usdtTokenStorage.ledger.get(liquidator);            
    //         updatedLiquidatorMockFa12TokenBalance   = liquidatorMockFa12TokenAccount == undefined ? 0 : liquidatorMockFa12TokenAccount.balance.toNumber();

    //         treasuryMockFa12TokenAccount            =  await usdtTokenStorage.ledger.get(contractDeployments.treasury.address);            
    //         updatedTreasuryMockFa12TokenBalance     = treasuryMockFa12TokenAccount == undefined ? 0 : treasuryMockFa12TokenAccount.balance.toNumber();

    //         lendingControllerMockFa12TokenAccount            =  await usdtTokenStorage.ledger.get(lendingControllerAddress);            
    //         updatedLendingControllerMockFa12TokenBalance     = lendingControllerMockFa12TokenAccount == undefined ? 0 : lendingControllerMockFa12TokenAccount.balance.toNumber();

    //         // ----------------------------------------------------------------------------------------------
    //         // Refund checks and assertions
    //         // ----------------------------------------------------------------------------------------------


    //         // vault should have a total reduction in balance equal to liquidationAmountWithFeesAndIncentive 
    //         assert.equal(updatedVaultMockFa12TokenBalance, initialVaultMockFa12TokenBalance - liquidationAmountWithFeesAndIncentive);
            
    //         // liquidator should not have a deficit in balance from the overflow of tokens sent to liquidate the vault 
    //         assert.equal(updatedLiquidatorMockFa12TokenBalance, initialLiquidatorMockFa12TokenBalance - totalLiquidationAmount + liquidationAmountWithIncentive);

    //         // treasury should receive both admin fee and share from interest repaid 
    //         assert.equal(updatedTreasuryMockFa12TokenBalance, initialTreasuryMockFa12TokenBalance + adminLiquidationFee + interestSentToTreasury);

    //         // lending controller should receive interest rewards
    //         assert.equal(updatedLendingControllerMockFa12TokenBalance, initialLendingControllerMockFa12TokenBalance + (totalLiquidationAmount - interestSentToTreasury));

    //         // check that final vault calculations are correct - use of almostEqual as there may be a slight difference of 1 from rounding errors 
    //         assert.equal(vaultLoanOutstandingTotal, finalLoanOutstandingTotal);
    //         assert.equal(vaultLoanPrincipalTotal.toNumber(), finalLoanPrincipalTotal);
    //         assert.equal(vaultLoanInterestTotal.toNumber(), finalLoanInterestTotal);

    //         // check that remaining loan outstanding total is correct 
    //         // i.e. if maxVaultLiquidationPercent is 50%, then not more than 50% of the loan outstanding can be liquidated, and there should be 50% remaining
    //         assert.equal(vaultLoanOutstandingTotal, initialVaultLoanOutstandingTotal - vaultMaxLiquidationAmount);

    //         // test vault cannot be liquidated again 
    //         failLiquidateVaultOperation = await lendingControllerInstance.methods.liquidateVault(vaultId, vaultOwner, failTestLiquidationAmount);
    //         await chai.expect(failLiquidateVaultOperation.send()).to.be.rejected;

    //     })


        

    //     it('simple one token test: user (mallory) can mark eve\'s vault for liquidation (oracle price shock for collateral token) and liquidate vault - [Collateral Token: Mock FA-12 | Loan Token: Mock FA-2]', async () => {

    //         // init variables and storage
    //         lendingControllerStorage = await lendingControllerInstance.storage();
    //         vaultFactoryStorage      = await vaultFactoryInstance.storage();

    //         currentMockLevel      = lendingControllerStorage.mockLevel;

    //         // ----------------------------------------------------------------------------------------------
    //         // Create Vault
    //         // ----------------------------------------------------------------------------------------------


    //         await signerFactory(tezos, eve.sk);

    //         const vaultCounter      = vaultFactoryStorage.vaultCounter;
    //         const vaultId           = vaultCounter.toNumber();
    //         const vaultOwner        = eve.pkh;
    //         const liquidator        = mallory.pkh;
    //         const loanTokenName     = "eurt";
    //         const vaultName         = "newVault";
    //         const vaultConfig       = 1; // vault config - RWA type
    //         const depositorsConfig  = "any";

    //         const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
    //             baker.pkh,              // delegate to
    //             vaultConfig,
    //             loanTokenName,          // loan token type
    //             vaultName,              // vault name
    //             null,                   // collateral tokens
    //             depositorsConfig        // depositors config type - any / whitelist
    //         ).send();
    //         await userCreatesNewVaultOperation.confirmation();

    //         const vaultHandle = {
    //             "id"    : vaultId,
    //             "owner" : vaultOwner
    //         };
    //         vaultRecord          = await lendingControllerStorage.vaults.get(vaultHandle);
    //         const vaultAddress   = vaultRecord.address;
    //         const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

    //         const vaultConfigRecord = await lendingControllerStorage.vaultConfigLedger.get(vaultRecord.vaultConfig);

    //         // config variables
    //         const liquidationDelayInMins        = vaultConfigRecord.liquidationDelayInMins.toNumber();
    //         const liquidationMaxDuration        = vaultConfigRecord.liquidationMaxDuration.toNumber();
    //         const maxVaultLiquidationPercent    = vaultConfigRecord.maxVaultLiquidationPercent.toNumber();
    //         const adminLiquidationFeePercent    = vaultConfigRecord.adminLiquidationFeePercent.toNumber();
    //         const liquidationFeePercent         = vaultConfigRecord.liquidationFeePercent.toNumber();
    //         const interestTreasuryShare         = vaultConfigRecord.interestTreasuryShare.toNumber();

    //         // console.log('   - vault originated: ' + vaultAddress);
    //         // console.log('   - vault id: ' + vaultId);

    //         // push new vault id to vault set
    //         eveVaultSet.push(vaultId);


    //         // ----------------------------------------------------------------------------------------------
    //         // Deposit Collateral into Vault
    //         // ----------------------------------------------------------------------------------------------

    //         const usdtDepositAmount  = 20000000;   // 20 Mock FA12 Tokens - USD $30.00

    //         // ---------------------------------
    //         // Deposit Mock FA12 Tokens
    //         // ---------------------------------

    //         // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
    //         // reset token allowance
    //         resetTokenAllowance = await usdtTokenInstance.methods.approve(
    //             vaultAddress,
    //             0
    //         ).send();
    //         await resetTokenAllowance.confirmation();

    //         // set new token allowance
    //         setNewTokenAllowance = await usdtTokenInstance.methods.approve(
    //             vaultAddress,
    //             usdtDepositAmount
    //         ).send();
    //         await setNewTokenAllowance.confirmation();

    //         // eve deposits mock FA12 tokens into vault
    //         const eveDepositMockFa12TokenOperation  = await vaultInstance.methods.initVaultAction(
    //             "deposit",
    //             usdtDepositAmount,           
    //             "usdt"
    //         ).send();
    //         await eveDepositMockFa12TokenOperation.confirmation();

    //         // console.log('   - vault collateral deposited: Mock FA-12 Tokens: ' + usdtDepositAmount);
            

    //         // ----------------------------------------------------------------------------------------------
    //         // Borrow with Vault
    //         // ----------------------------------------------------------------------------------------------


    //         // borrow amount - 4 Mock FA2 Tokens - USD $14.00 
    //         const borrowAmount = 4000000;   

    //         // borrow operation
    //         const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
    //         await eveBorrowOperation.confirmation();

    //         lendingControllerStorage   = await lendingControllerInstance.storage();
    //         currentMockLevel           = lendingControllerStorage.config.mockLevel.toNumber();            

    //         // console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName + " | current block level: " + currentMockLevel);

    //         // get initial Mock FA-12 Token and Mock FA-2 balance for Eve (vault owner), liquidator, vault, Treasury and Token Pool Reward Contract
    //         vaultOwnerMockFa12TokenAccount          =  await usdtTokenStorage.ledger.get(vaultOwner);            
    //         vaultOwnerMockFa2TokenAccount           =  await eurtTokenStorage.ledger.get(vaultOwner);            
    //         initialVaultOwnerMockFa12TokenBalance   = vaultOwnerMockFa12TokenAccount == undefined ? 0 : vaultOwnerMockFa12TokenAccount.balance.toNumber();
    //         initialVaultOwnerMockFa2TokenBalance    = vaultOwnerMockFa2TokenAccount == undefined ? 0 : vaultOwnerMockFa2TokenAccount.toNumber();

    //         vaultMockFa12TokenAccount               =  await usdtTokenStorage.ledger.get(vaultAddress);            
    //         vaultMockFa2TokenAccount                =  await eurtTokenStorage.ledger.get(vaultAddress);            
    //         initialVaultMockFa12TokenBalance        = vaultMockFa12TokenAccount == undefined ? 0 : vaultMockFa12TokenAccount.balance.toNumber();
    //         initialVaultMockFa2TokenBalance         = vaultMockFa2TokenAccount == undefined ? 0 : vaultMockFa2TokenAccount.toNumber();

    //         liquidatorMockFa12TokenAccount          =  await usdtTokenStorage.ledger.get(liquidator);            
    //         liquidatorMockFa2TokenAccount           =  await eurtTokenStorage.ledger.get(liquidator);            
    //         initialLiquidatorMockFa12TokenBalance   = liquidatorMockFa12TokenAccount == undefined ? 0 : liquidatorMockFa12TokenAccount.balance.toNumber();
    //         initialLiquidatorMockFa2TokenBalance    = liquidatorMockFa2TokenAccount == undefined ? 0 : liquidatorMockFa2TokenAccount.toNumber();

    //         treasuryMockFa12TokenAccount            =  await usdtTokenStorage.ledger.get(contractDeployments.treasury.address);            
    //         treasuryMockFa2TokenAccount             =  await eurtTokenStorage.ledger.get(contractDeployments.treasury.address);            
    //         initialTreasuryMockFa12TokenBalance     = treasuryMockFa12TokenAccount == undefined ? 0 : treasuryMockFa12TokenAccount.balance.toNumber();
    //         initialTreasuryMockFa2TokenBalance      = treasuryMockFa2TokenAccount == undefined ? 0 : treasuryMockFa2TokenAccount.toNumber();

    //         lendingControllerMockFa12TokenAccount         =  await usdtTokenStorage.ledger.get(lendingControllerAddress);            
    //         lendingControllerMockFa2TokenAccount          =  await eurtTokenStorage.ledger.get(lendingControllerAddress);            
    //         initialLendingControllerMockFa12TokenBalance  = lendingControllerMockFa12TokenAccount == undefined ? 0 : lendingControllerMockFa12TokenAccount.balance.toNumber();
    //         initialLendingControllerMockFa2TokenBalance   = lendingControllerMockFa2TokenAccount == undefined ? 0 : lendingControllerMockFa2TokenAccount.toNumber();

    //         lendingControllerMockFa12TokenAccount          =  await usdtTokenStorage.ledger.get(lendingControllerAddress);            
    //         lendingControllerMockFa2TokenAccount           =  await eurtTokenStorage.ledger.get(lendingControllerAddress);            
    //         initialLendingControllerMockFa12TokenBalance   = lendingControllerMockFa12TokenAccount == undefined ? 0 : lendingControllerMockFa12TokenAccount.balance.toNumber();
    //         initialLendingControllerMockFa2TokenBalance    = lendingControllerMockFa2TokenAccount == undefined ? 0 : lendingControllerMockFa2TokenAccount.toNumber();


    //         // get token pool stats
    //         lendingControllerStorage       = await lendingControllerInstance.storage();
    //         vaultRecord                    = await lendingControllerStorage.vaults.get(vaultHandle);
    //         loanTokenRecord                = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
            
    //         loanTokenDecimals              = loanTokenRecord.tokenDecimals;
    //         const interestRateDecimals     = (27 - 2); 

    //         const tokenPoolTotal           = loanTokenRecord.tokenPoolTotal.toNumber() / (10 ** loanTokenDecimals.toNumber());
    //         const totalBorrowed            = loanTokenRecord.totalBorrowed.toNumber() / (10 ** loanTokenDecimals.toNumber());
    //         const optimalUtilisationRate   = Number(loanTokenRecord.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
    //         const utilisationRate          = Number(loanTokenRecord.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
    //         const currentInterestRate      = Number(loanTokenRecord.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";

    //         // console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);


    //         // ----------------------------------------------------------------------------------------------
    //         // Set Oracle price shock - token price drops by 2/3
    //         // ----------------------------------------------------------------------------------------------

    //         // console.log('- start oracle price shock');

    //         await signerFactory(tezos, satelliteOneSk); // temporarily set to tester to increase block levels

    //         mockUsdMockFa12TokenAggregatorStorage   = await mockUsdMockFa12TokenAggregatorInstance.storage();

    //         lastEpoch   = mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.epoch
    //         lastRound   = mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.round
    //         epoch       = lastEpoch.toNumber() + 1;
    //         round       = 0;

    //         lendingControllerStorage     = await lendingControllerInstance.storage();
    //         vaultRecord                  = await lendingControllerStorage.vaults.get(vaultHandle);
    //         lastUpdatedBlockLevel        = vaultRecord.lastUpdatedBlockLevel;

    //         // local token oracles array map
    //         const tokenOraclesIndex      = tokenOracles.findIndex((o => o.name === "usdt"));
    //         const currentPrice           = tokenOracles[tokenOraclesIndex].price;

    //         // price shock observation data for mock FA12 token
    //         usdtTokenIndex               = lendingHelper.priceDecreaseObservations.findIndex((o => o.name === "usdt"));

    //         const priceShockObservations = lendingHelper.priceDecreaseObservations[usdtTokenIndex].observations;
    //         const newMedianPrice         = lendingHelper.priceDecreaseObservations[usdtTokenIndex].medianPrice;

    //         // set price shock for mock FA-12 token
    //         await setTokenPrice(epoch, round, priceShockObservations, "usdt");

    //         // Update price in token oracles array for local calculations
    //         tokenOracles[tokenOraclesIndex].price = newMedianPrice;

    //         mockUsdMockFa12TokenAggregatorStorage = await mockUsdMockFa12TokenAggregatorInstance.storage();
            
    //         assert.deepEqual(mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.round, new BigNumber(round));
    //         assert.deepEqual(mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.epoch, new BigNumber(epoch));
    //         assert.deepEqual(mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.data,  new BigNumber(newMedianPrice));
    //         assert.deepEqual(mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.percentOracleResponse,new BigNumber(10000));

    //         // console.log('   - Mock FA12 Token price change from ' + currentPrice + ' to ' + newMedianPrice);


    //         // ----------------------------------------------------------------------------------------------
    //         // Vault Marked for liquidation
    //         // ----------------------------------------------------------------------------------------------

    //         // console.log('- mark vault for liquidation');

    //         await signerFactory(tezos, mallory.sk); // mallory as liquidator

    //         const markVaultForLiquidationOperation = await lendingControllerInstance.methods.markForLiquidation(vaultId, vaultOwner).send();
    //         await markVaultForLiquidationOperation.confirmation();

    //         lendingControllerStorage   = await lendingControllerInstance.storage();
    //         vaultRecord                = await lendingControllerStorage.vaults.get(vaultHandle);
    //         currentMockLevel           = lendingControllerStorage.config.mockLevel.toNumber();            

    //         const expectedMarkedForLiquidationLevel = currentMockLevel;
    //         const expectedLiquidationEndLevel       = currentMockLevel + (liquidationMaxDuration * oneMinuteLevelBlocks);

    //         initialVaultLoanOutstandingTotal        = vaultRecord.loanOutstandingTotal;
    //         initialVaultLoanPrincipalTotal          = vaultRecord.loanPrincipalTotal;
    //         initialVaultBorrowIndex                 = vaultRecord.borrowIndex;

    //         const vaultMarkedForLiquidationLevel    = vaultRecord.markedForLiquidationLevel;
    //         const vaultLiquidationEndLevel          = vaultRecord.liquidationEndLevel;

    //         assert.equal(vaultMarkedForLiquidationLevel, expectedMarkedForLiquidationLevel);
    //         assert.equal(vaultLiquidationEndLevel, expectedLiquidationEndLevel);

    //         // test vault cannot be marked for liquidation if it has already been marked
    //         const failMarkVaultForLiquidation = await lendingControllerInstance.methods.markForLiquidation(vaultId, vaultOwner);
    //         await chai.expect(failMarkVaultForLiquidation.send()).to.be.rejected;

    //         // ----------------------------------------------------------------------------------------------
    //         // After marked for liquidation: set block level ahead by half of liquidationDelayinMins
    //         // ----------------------------------------------------------------------------------------------


    //         await signerFactory(tezos, bob.sk); // temporarily set to tester to increase block levels

    //         lendingControllerStorage    = await lendingControllerInstance.storage();
    //         vaultRecord                 = await lendingControllerStorage.vaults.get(vaultHandle);
    //         markedForLiquidationLevel   = vaultRecord.markedForLiquidationLevel;

    //         minutesPassed               = liquidationDelayInMins / 2; 
    //         mockLevelChange             = minutesPassed * oneMinuteLevelBlocks;
    //         newMockLevel                = markedForLiquidationLevel.toNumber() + mockLevelChange;

    //         let setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(
    //             [
    //                 {
    //                     configName: "mockLevel",
    //                     newValue: newMockLevel
    //                 },
    //             ]
    //         ).send();
    //         await setMockLevelOperation.confirmation();

    //         lendingControllerStorage = await lendingControllerInstance.storage();
    //         currentMockLevel         = lendingControllerStorage.config.mockLevel;

    //         assert.equal(currentMockLevel, newMockLevel);

    //         // console.log('   - time set to middle of vault liquidation delay: ' + markedForLiquidationLevel + ' to ' + newMockLevel + ' | Changed by: ' + mockLevelChange);

    //         // test vault cannot be marked for liquidation if it has already been marked
    //         const failMarkVaultForLiquidationAgain = await lendingControllerInstance.methods.markForLiquidation(vaultId, vaultOwner);
    //         await chai.expect(failMarkVaultForLiquidationAgain.send()).to.be.rejected;

    //         // test vault cannot be liquidated if delay has not been passed
    //         const failTestLiquidationAmount = 10;
    //         failLiquidateVaultOperation = await lendingControllerInstance.methods.liquidateVault(vaultId, vaultOwner, failTestLiquidationAmount);
    //         await chai.expect(failLiquidateVaultOperation.send()).to.be.rejected;

    //         // ----------------------------------------------------------------------------------------------
    //         // Set Block Levels For Mock Time Test - immediately after liquidation delay ends
    //         // ----------------------------------------------------------------------------------------------


    //         await signerFactory(tezos, bob.sk); // temporarily set to tester to increase block levels

    //         lendingControllerStorage    = await lendingControllerInstance.storage();
    //         vaultRecord                 = await lendingControllerStorage.vaults.get(vaultHandle);
    //         markedForLiquidationLevel   = vaultRecord.markedForLiquidationLevel;

    //         minutesPassed               = liquidationDelayInMins + 1;
    //         mockLevelChange             = minutesPassed * oneMinuteLevelBlocks;
    //         newMockLevel                = markedForLiquidationLevel.toNumber() + mockLevelChange;

    //         setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(
    //             [
    //                 {
    //                     configName: "mockLevel",
    //                     newValue: newMockLevel
    //                 },
    //             ]
    //         ).send();
    //         await setMockLevelOperation.confirmation();

    //         lendingControllerStorage = await lendingControllerInstance.storage();
    //         currentMockLevel = lendingControllerStorage.config.mockLevel;

    //         assert.equal(currentMockLevel, newMockLevel);

    //         // console.log('   - time set to immediately after vault liquidation delay: ' + markedForLiquidationLevel + ' to ' + newMockLevel + ' | Changed by: ' + mockLevelChange);


    //         // ----------------------------------------------------------------------------------------------
    //         // Vault calculations on loan outstanding, accrued interest, and liquidation fees
    //         // ----------------------------------------------------------------------------------------------


    //         await signerFactory(tezos, mallory.sk); 
    //         const liquidationAmount = 100;

    //         // Update storage
    //         lendingControllerStorage    = await lendingControllerInstance.storage();
    //         usdtTokenStorage        = await usdtTokenInstance.storage();

    //         // vault record
    //         vaultRecord                 = await lendingControllerStorage.vaults.get(vaultHandle);
    //         vaultLoanOutstandingTotal   = vaultRecord.loanOutstandingTotal;
    //         vaultLoanPrincipalTotal     = vaultRecord.loanPrincipalTotal;
    //         vaultLoanInterestTotal      = vaultRecord.loanInterestTotal;
    //         vaultBorrowIndex            = vaultRecord.borrowIndex;

    //         // loan token record
    //         loanTokenRecord             = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
    //         updatedLoanTokenBorrowIndex = loanTokenRecord.borrowIndex;

    //         // vault calculations
    //         loanOutstandingWithAccruedInterest      = lendingHelper.calculateAccruedInterest(initialVaultLoanOutstandingTotal, initialVaultBorrowIndex, updatedLoanTokenBorrowIndex);
    //         totalInterest                           = initialVaultLoanPrincipalTotal.toNumber() > loanOutstandingWithAccruedInterest ? 0 :  loanOutstandingWithAccruedInterest - initialVaultLoanPrincipalTotal.toNumber();


    //         // check that calculations are correct - use of almostEqual as there may be a slight difference of 1 from rounding errors 
    //         assert.equal(almostEqual(vaultLoanOutstandingTotal, loanOutstandingWithAccruedInterest, 0.0001), true);
    //         assert.equal(vaultLoanInterestTotal, totalInterest);


    //         // liquidation calculations - raw amounts 
    //         adminLiquidationFee                    = lendingHelper.calculateAdminLiquidationFee(adminLiquidationFeePercent, liquidationAmount);
    //         liquidationIncentive                   = lendingHelper.calculateLiquidationIncentive(liquidationFeePercent, liquidationAmount);            
    //         liquidationAmountWithIncentive         = liquidationAmount + liquidationIncentive; 
    //         liquidationAmountWithFeesAndIncentive  = liquidationAmount + liquidationIncentive + adminLiquidationFee; 

    //         // convert from Mock FA2 Token qty to Mock FA12 qty
    //         // - amount to treasury (admin)
    //         adminLiquidationFee                    = lendingHelper.multiplyByTokenPrice("eurt", tokenOracles, adminLiquidationFee);
    //         adminLiquidationFee                    = lendingHelper.divideByTokenPrice("usdt", tokenOracles, adminLiquidationFee);
            
    //         // convert from Mock FA2 Token qty to Mock FA12 qty
    //         // - amount sent to liquidator
    //         liquidationAmountWithIncentive         = lendingHelper.multiplyByTokenPrice("eurt", tokenOracles, liquidationAmountWithIncentive);
    //         liquidationAmountWithIncentive         = lendingHelper.divideByTokenPrice("usdt", tokenOracles, liquidationAmountWithIncentive);
            
    //         // convert from Mock FA2 Token qty to Mock FA12 qty
    //         // - total liquidated from vault
    //         liquidationAmountWithFeesAndIncentive  = lendingHelper.multiplyByTokenPrice("eurt", tokenOracles, liquidationAmountWithFeesAndIncentive);
    //         liquidationAmountWithFeesAndIncentive  = lendingHelper.divideByTokenPrice("usdt", tokenOracles, liquidationAmountWithFeesAndIncentive);

    //         vaultMaxLiquidationAmount              = lendingHelper.calculateVaultMaxLiquidationAmount(vaultLoanOutstandingTotal, maxVaultLiquidationPercent);
            
    //         // convert from Mock FA2 Token qty to Mock FA12 qty
    //         // - total liquidation amount
    //         totalLiquidationAmount          = lendingHelper.calculateTotalLiquidationAmount(liquidationAmount, vaultMaxLiquidationAmount);
    //         totalLiquidationAmount          = lendingHelper.multiplyByTokenPrice("eurt", tokenOracles, totalLiquidationAmount);
    //         totalLiquidationAmount          = lendingHelper.divideByTokenPrice("usdt", tokenOracles, totalLiquidationAmount);

    //         totalInterestPaid               = lendingHelper.calculateTotalInterestPaid(totalLiquidationAmount, vaultLoanInterestTotal);
    //         interestSentToTreasury          = lendingHelper.calculateInterestSentToTreasury(interestTreasuryShare, totalInterestPaid)
    //         interestRewards                 = lendingHelper.calculateInterestRewards(interestSentToTreasury, totalInterestPaid);


    //         // ----------------------------------------------------------------------------------------------
    //         // Liquidate Vault Operation
    //         // ----------------------------------------------------------------------------------------------

    //         await signerFactory(tezos, mallory.sk); 

    //         // mallory sets operator for lending controller
    //         updateOperatorsOperation = await updateOperators(eurtTokenInstance, liquidator, lendingControllerAddress, tokenId);
    //         await updateOperatorsOperation.confirmation();


    //         liquidateVaultOperation = await lendingControllerInstance.methods.liquidateVault(vaultId, vaultOwner, liquidationAmount).send();
    //         await liquidateVaultOperation.confirmation();

    //         // ----------------------------------------------------------------------------------------------
    //         // Updated vault calculations after liquidation
    //         // ----------------------------------------------------------------------------------------------


    //         // Update storage
    //         lendingControllerStorage    = await lendingControllerInstance.storage();
    //         usdtTokenStorage        = await usdtTokenInstance.storage();

    //         // loan token record
    //         loanTokenRecord             = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
    //         updatedLoanTokenBorrowIndex = loanTokenRecord.borrowIndex;

    //         // vault record
    //         vaultRecord                 = await lendingControllerStorage.vaults.get(vaultHandle);
    //         vaultLoanOutstandingTotal   = vaultRecord.loanOutstandingTotal;
    //         vaultLoanPrincipalTotal     = vaultRecord.loanPrincipalTotal;
    //         vaultLoanInterestTotal      = vaultRecord.loanInterestTotal;
    //         vaultBorrowIndex            = vaultRecord.borrowIndex;


    //         // vault calculations
    //         totalLiquidationAmount                  = lendingHelper.calculateTotalLiquidationAmount(liquidationAmount, vaultMaxLiquidationAmount);
    //         totalInterestPaid                       = lendingHelper.calculateTotalInterestPaid(totalLiquidationAmount, vaultLoanInterestTotal);

    //         loanOutstandingWithAccruedInterest      = lendingHelper.calculateAccruedInterest(initialVaultLoanOutstandingTotal, initialVaultBorrowIndex, updatedLoanTokenBorrowIndex);
    //         totalInterest                           = loanOutstandingWithAccruedInterest - initialVaultLoanPrincipalTotal.toNumber();
    //         remainingInterest                       = lendingHelper.calculateRemainingInterest(totalLiquidationAmount, totalInterest)

    //         finalLoanOutstandingTotal               = lendingHelper.calculateFinalLoanOutstandingTotal(totalLiquidationAmount, loanOutstandingWithAccruedInterest);
    //         finalLoanPrincipalTotal                 = lendingHelper.calculateFinalLoanPrincipalTotal(totalLiquidationAmount, loanOutstandingWithAccruedInterest, remainingInterest, initialVaultLoanPrincipalTotal);
    //         finalLoanInterestTotal                  = lendingHelper.calculateFinalLoanInterestTotal(remainingInterest);


    //         // ----------------------------------------------------------------------------------------------
    //         // Accounts and Balances
    //         // ----------------------------------------------------------------------------------------------


    //         // get updated Mock FA-12 and Mock FA-2 Token balance for Eve (vault owner), liquidator, vault, Treasury and Token Pool Reward Contract
    //         vaultOwnerMockFa12TokenAccount          =  await usdtTokenStorage.ledger.get(vaultOwner);            
    //         vaultOwnerMockFa2TokenAccount           =  await eurtTokenStorage.ledger.get(vaultOwner);            
    //         updatedVaultOwnerMockFa12TokenBalance   = vaultOwnerMockFa12TokenAccount == undefined ? 0 : vaultOwnerMockFa12TokenAccount.balance.toNumber();
    //         updatedVaultOwnerMockFa2TokenBalance    = vaultOwnerMockFa2TokenAccount == undefined ? 0 : vaultOwnerMockFa2TokenAccount.toNumber();

    //         vaultMockFa12TokenAccount               =  await usdtTokenStorage.ledger.get(vaultAddress);            
    //         vaultMockFa2TokenAccount                =  await eurtTokenStorage.ledger.get(vaultAddress);            
    //         updatedVaultMockFa12TokenBalance        = vaultMockFa12TokenAccount == undefined ? 0 : vaultMockFa12TokenAccount.balance.toNumber();
    //         updatedVaultMockFa2TokenBalance         = vaultMockFa2TokenAccount == undefined ? 0 : vaultMockFa2TokenAccount.toNumber();

    //         liquidatorMockFa12TokenAccount          =  await usdtTokenStorage.ledger.get(liquidator);            
    //         liquidatorMockFa2TokenAccount           =  await eurtTokenStorage.ledger.get(liquidator);            
    //         updatedLiquidatorMockFa12TokenBalance   = liquidatorMockFa12TokenAccount == undefined ? 0 : liquidatorMockFa12TokenAccount.balance.toNumber();
    //         updatedLiquidatorMockFa2TokenBalance    = liquidatorMockFa2TokenAccount == undefined ? 0 : liquidatorMockFa2TokenAccount.toNumber();

    //         treasuryMockFa12TokenAccount            =  await usdtTokenStorage.ledger.get(contractDeployments.treasury.address);            
    //         treasuryMockFa2TokenAccount             =  await eurtTokenStorage.ledger.get(contractDeployments.treasury.address);            
    //         updatedTreasuryMockFa12TokenBalance     = treasuryMockFa12TokenAccount == undefined ? 0 : treasuryMockFa12TokenAccount.balance.toNumber();
    //         updatedTreasuryMockFa2TokenBalance      = treasuryMockFa2TokenAccount == undefined ? 0 : treasuryMockFa2TokenAccount.toNumber();

    //         lendingControllerMockFa12TokenAccount         =  await usdtTokenStorage.ledger.get(lendingControllerAddress);            
    //         lendingControllerMockFa2TokenAccount          =  await eurtTokenStorage.ledger.get(lendingControllerAddress);            
    //         updatedLendingControllerMockFa12TokenBalance  = lendingControllerMockFa12TokenAccount == undefined ? 0 : lendingControllerMockFa12TokenAccount.balance.toNumber();
    //         updatedLendingControllerMockFa2TokenBalance   = lendingControllerMockFa2TokenAccount == undefined ? 0 : lendingControllerMockFa2TokenAccount.toNumber();

    //         lendingControllerMockFa12TokenAccount          =  await usdtTokenStorage.ledger.get(lendingControllerAddress);            
    //         lendingControllerMockFa2TokenAccount           =  await eurtTokenStorage.ledger.get(lendingControllerAddress);            
    //         updatedLendingControllerMockFa12TokenBalance   = lendingControllerMockFa12TokenAccount == undefined ? 0 : lendingControllerMockFa12TokenAccount.balance.toNumber();
    //         updatedLendingControllerMockFa2TokenBalance    = lendingControllerMockFa2TokenAccount == undefined ? 0 : lendingControllerMockFa2TokenAccount.toNumber();


    //         // --------------------------------------------------------
    //         // Simple test note: in this case, since there is only one collateral token,
    //         // the token proportion will be equal to 1 (i.e. 1e27) and there are no calculations for token proportions
    //         // --------------------------------------------------------
            
    //         // check that there are no changes to the vault owner's balance
    //         assert.equal(updatedVaultOwnerMockFa12TokenBalance, initialVaultOwnerMockFa12TokenBalance);
    //         assert.equal(updatedVaultOwnerMockFa2TokenBalance , initialVaultOwnerMockFa2TokenBalance);

    //         // vault should have a total reduction in balance equal to liquidationAmountWithFeesAndIncentive
    //         assert.equal(updatedVaultMockFa12TokenBalance, initialVaultMockFa12TokenBalance - liquidationAmountWithFeesAndIncentive);
            
    //         // liquidator uses Mock FA-2 tokens to liquidate and receives Mock FA-12 tokens from vault collateral
    //         assert.equal(updatedLiquidatorMockFa2TokenBalance, initialLiquidatorMockFa2TokenBalance - liquidationAmount);
    //         assert.equal(updatedLiquidatorMockFa12TokenBalance, initialLiquidatorMockFa12TokenBalance + liquidationAmountWithIncentive);

    //         // treasury should receive both admin fee and share from interest repaid (if there is interest)
    //         assert.equal(updatedTreasuryMockFa12TokenBalance, initialTreasuryMockFa12TokenBalance + adminLiquidationFee + interestSentToTreasury);

    //         // reward pool should receive interest share from total interest paid
    //         assert.equal(updatedLendingControllerMockFa12TokenBalance, initialLendingControllerMockFa12TokenBalance + interestRewards);

    //         // check vault records 
    //         // - since not a lot of time has passed for interest to accrue, the liquidation amount has covered the total loan interest accrued
    //         // - use almost equal as there could be a slight rounding error of 1
    //         assert.equal(almostEqual(vaultLoanOutstandingTotal, finalLoanOutstandingTotal, 0.0001), true);
    //         assert.equal(almostEqual(vaultLoanPrincipalTotal, finalLoanPrincipalTotal, 0.0001), true);
    //         assert.equal(vaultLoanInterestTotal, 0);

    //     })



    //     it('advanced multiple token test: user (mallory) can mark eve\'s vault for liquidation (oracle price shock for collateral token) and liquidate vault - [Collateral Token: Mock FA-12, Mock FA-2, Mav, MVN | Loan Token: Mock FA-2]', async () => {
    
    //         // init variables and storage
    //         lendingControllerStorage = await lendingControllerInstance.storage();
    //         vaultFactoryStorage      = await vaultFactoryInstance.storage();
    
    //         currentMockLevel         = lendingControllerStorage.mockLevel;
    //         maxDecimals              = lendingControllerStorage.config.maxDecimalsForCalculation;
    
    //         // ----------------------------------------------------------------------------------------------
    //         // Reset token prices back to default
    //         // ----------------------------------------------------------------------------------------------

    //         // reset token prices
    //         usdtTokenIndex                      = lendingHelper.defaultPriceObservations.findIndex((o => o.name === "usdt"));
    //         eurtTokenIndex                      = lendingHelper.defaultPriceObservations.findIndex((o => o.name === "eurt"));
    //         mavIndex                            = lendingHelper.defaultPriceObservations.findIndex((o => o.name === "mav"));
    //         mvnIndex                            = lendingHelper.defaultPriceObservations.findIndex((o => o.name === "smvn"));

    //         round = 0;

    //         // ---------------------------------
    //         // Reset Mock FA-12 token prices to default observation data
    //         // ---------------------------------

    //         epoch = await mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.epoch;
    //         epoch = epoch.toNumber() + 1;            
    //         defaultObservations = lendingHelper.defaultPriceObservations[usdtTokenIndex].observations;
    //         await setTokenPrice(epoch, round, defaultObservations, "usdt");

    //         const usdtTokenMedianPrice = lendingHelper.defaultPriceObservations[usdtTokenIndex].medianPrice;
    //         tokenOracles[usdtTokenIndex].price = usdtTokenMedianPrice;

    //         mockUsdMockFa12TokenAggregatorStorage = await mockUsdMockFa12TokenAggregatorInstance.storage();
    //         assert.deepEqual(mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.round,new BigNumber(round));
    //         assert.deepEqual(mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.epoch,new BigNumber(epoch));
    //         assert.deepEqual(mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.data,new BigNumber(usdtTokenMedianPrice));
    //         assert.deepEqual(mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.percentOracleResponse,new BigNumber(10000));

    //         // ---------------------------------
    //         // Reset Mock FA-2 token prices to default observation data
    //         // ---------------------------------

    //         epoch = await mockUsdMockFa2TokenAggregatorStorage.lastCompletedData.epoch;
    //         epoch = epoch.toNumber() + 1;            
    //         defaultObservations = lendingHelper.defaultPriceObservations[eurtTokenIndex].observations;
    //         await setTokenPrice(epoch, round, defaultObservations, "eurt");

    //         const eurtTokenMedianPrice = lendingHelper.defaultPriceObservations[eurtTokenIndex].medianPrice;
    //         tokenOracles[eurtTokenIndex].price = eurtTokenMedianPrice;

    //         mockUsdMockFa2TokenAggregatorStorage = await mockUsdMockFa2TokenAggregatorInstance.storage();
    //         assert.deepEqual(mockUsdMockFa2TokenAggregatorStorage.lastCompletedData.round,new BigNumber(round));
    //         assert.deepEqual(mockUsdMockFa2TokenAggregatorStorage.lastCompletedData.epoch,new BigNumber(epoch));
    //         assert.deepEqual(mockUsdMockFa2TokenAggregatorStorage.lastCompletedData.data,new BigNumber(eurtTokenMedianPrice));
    //         assert.deepEqual(mockUsdMockFa2TokenAggregatorStorage.lastCompletedData.percentOracleResponse,new BigNumber(10000));

    //         // ---------------------------------
    //         // Reset mav prices to default observation data
    //         // ---------------------------------

    //         epoch = await mockUsdMvrkAggregatorStorage.lastCompletedData.epoch;
    //         epoch = epoch.toNumber() + 1;            
    //         defaultObservations = lendingHelper.defaultPriceObservations[mavIndex].observations;
    //         await setTokenPrice(epoch, round, defaultObservations, "mav");

    //         const mavMedianPrice = lendingHelper.defaultPriceObservations[mavIndex].medianPrice;
    //         tokenOracles[mavIndex].price = mavMedianPrice;

    //         mockUsdMvrkAggregatorStorage = await mockUsdMvrkAggregatorInstance.storage();
    //         assert.deepEqual(mockUsdMvrkAggregatorStorage.lastCompletedData.round,new BigNumber(round));
    //         assert.deepEqual(mockUsdMvrkAggregatorStorage.lastCompletedData.epoch,new BigNumber(epoch));
    //         assert.deepEqual(mockUsdMvrkAggregatorStorage.lastCompletedData.data,new BigNumber(mavMedianPrice));
    //         assert.deepEqual(mockUsdMvrkAggregatorStorage.lastCompletedData.percentOracleResponse,new BigNumber(10000));

    //         // ---------------------------------
    //         // Reset mvn prices to default observation data
    //         // ---------------------------------

    //         epoch = await mockUsdMvnAggregatorStorage.lastCompletedData.epoch;
    //         epoch = epoch.toNumber() + 1;            
    //         defaultObservations = lendingHelper.defaultPriceObservations[mvnIndex].observations;
    //         await setTokenPrice(epoch, round, defaultObservations, "smvn");

    //         const mvnMedianPrice = lendingHelper.defaultPriceObservations[mvnIndex].medianPrice;
    //         tokenOracles[mvnIndex].price = mvnMedianPrice;

    //         mockUsdMvnAggregatorStorage = await mockUsdMvnAggregatorInstance.storage();
    //         assert.deepEqual(mockUsdMvnAggregatorStorage.lastCompletedData.round,new BigNumber(round));
    //         assert.deepEqual(mockUsdMvnAggregatorStorage.lastCompletedData.epoch,new BigNumber(epoch));
    //         assert.deepEqual(mockUsdMvnAggregatorStorage.lastCompletedData.data,new BigNumber(mvnMedianPrice));
    //         assert.deepEqual(mockUsdMvnAggregatorStorage.lastCompletedData.percentOracleResponse,new BigNumber(10000));

    //         // ----------------------------------------------------------------------------------------------
    //         // Create Vault
    //         // ----------------------------------------------------------------------------------------------
    
    //         await signerFactory(tezos, eve.sk);
    
    //         const vaultCounter          = vaultFactoryStorage.vaultCounter;
    //         const vaultId               = vaultCounter.toNumber();
    //         const vaultOwner            = eve.pkh;
    //         const liquidator            = mallory.pkh;
    //         const loanTokenName         = "eurt";
    //         const vaultName             = "newVault";
    //         const vaultConfig           = 1; // vault config - RWA type
    //         const depositorsConfig      = "any";
    
    //         const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
    //             baker.pkh,              // delegate to
    //             vaultConfig,
    //             loanTokenName,          // loan token type
    //             vaultName,              // vault name
    //             null,                   // collateral tokens
    //             depositorsConfig        // depositors config type - any / whitelist
    //         ).send();
    //         await userCreatesNewVaultOperation.confirmation();
    
    //         const vaultHandle = {
    //             "id"    : vaultId,
    //             "owner" : vaultOwner
    //         };
    //         vaultRecord = await lendingControllerStorage.vaults.get(vaultHandle);
    //         const vaultAddress   = vaultRecord.address;
    //         const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

    //         const vaultConfigRecord = await lendingControllerStorage.vaultConfigLedger.get(vaultRecord.vaultConfig);

    //         // config variables
    //         const liquidationDelayInMins        = vaultConfigRecord.liquidationDelayInMins.toNumber();
    //         const liquidationMaxDuration        = vaultConfigRecord.liquidationMaxDuration.toNumber();
    //         const maxVaultLiquidationPercent    = vaultConfigRecord.maxVaultLiquidationPercent.toNumber();
    //         const adminLiquidationFeePercent    = vaultConfigRecord.adminLiquidationFeePercent.toNumber();
    //         const liquidationFeePercent         = vaultConfigRecord.liquidationFeePercent.toNumber();
    //         const interestTreasuryShare         = vaultConfigRecord.interestTreasuryShare.toNumber();
    
    //         // console.log('   - vault originated: ' + vaultAddress);
    //         // console.log('   - vault id: ' + vaultId);
    
    //         // push new vault id to vault set
    //         eveVaultSet.push(vaultId);
    
    //         // ----------------------------------------------------------------------------------------------
    //         // Deposit Collateral into Vault
    //         // ----------------------------------------------------------------------------------------------
    
    //         const usdtDepositAmount     = 20000000;      // 20 Mock FA12 Tokens - USD $30.00
    //         const eurtDepositAmount     = 6000000;       // 6 Mock FA12 Tokens - USD $21.00
    //         const mavDepositAmount      = 10000000;      // 10 Mav - USD $18.00
    //         const mvnDepositAmount      = 10000000000;   // 10 MVN - USD $10.00
    
    //         // Total: $79.00
    
    //         // ---------------------------------
    //         // Deposit Mock FA12 Tokens
    //         // ---------------------------------
    
    //         // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
    //         // reset token allowance
    //         resetTokenAllowance = await usdtTokenInstance.methods.approve(
    //             vaultAddress,
    //             0
    //         ).send();
    //         await resetTokenAllowance.confirmation();
    
    //         // set new token allowance
    //         setNewTokenAllowance = await usdtTokenInstance.methods.approve(
    //             vaultAddress,
    //             usdtDepositAmount
    //         ).send();
    //         await setNewTokenAllowance.confirmation();
    
    //         // eve deposits mock FA12 tokens into vault
    //         const eveDepositMockFa12TokenOperation  = await vaultInstance.methods.initVaultAction(
    //             "deposit",
    //             usdtDepositAmount,           
    //             "usdt"
    //         ).send();
    //         await eveDepositMockFa12TokenOperation.confirmation();
    
    //         // ---------------------------------
    //         // Deposit Mock FA2 Tokens
    //         // ---------------------------------
    
    //         // eve sets operator for lending controller
    //         updateOperatorsOperation = await updateOperators(eurtTokenInstance, vaultOwner, vaultAddress, tokenId);
    //         await updateOperatorsOperation.confirmation();

    //         // eve deposits mock FA2 tokens into vault
    //         const eveDepositMockFa2TokenOperation  = await vaultInstance.methods.initVaultAction(
    //             "deposit",
    //             eurtDepositAmount,           
    //             "eurt"
    //         ).send();
    //         await eveDepositMockFa2TokenOperation.confirmation();
    
    //         // ---------------------------------
    //         // Deposit Mav
    //         // ---------------------------------
    
    //         const eveDepositMavOperation  = await vaultInstance.methods.initVaultAction(
    //             "deposit",         // vault action
    //             mavDepositAmount,  // amt
    //             "mav"              // token
    //         ).send({ mumav : true, amount : mavDepositAmount });
    //         await eveDepositMavOperation.confirmation();
    
    //         // ---------------------------------
    //         // Deposit Staked MVN
    //         // ---------------------------------

    //         // console.log('start deposit staked mvn');

    //         const stakedTokenName = "smvn";

    //         // eve set doorman as operator for vault
    //         updateOperatorsOperation = await vaultInstance.methods.initVaultAction(
    //             "updateTokenOperators",
    //             stakedTokenName,
    //             [
    //                 {
    //                     add_operator: {
    //                         owner: vaultAddress,
    //                         operator: contractDeployments.doorman.address,
    //                         token_id: 0,
    //                     },
    //                 }
    //             ]
    //         ).send();
    //         await updateOperatorsOperation.confirmation();
    
    //         // vault staked mvn operation
    //         //TODO: fix here
    //         const eveVaultDepositStakedTokenOperation  = await lendingControllerInstance.methods.vaultDepositStakedToken(
    //             stakedTokenName,
    //             vaultId,                 
    //             mvnDepositAmount                            
    //         ).send();
    //         await eveVaultDepositStakedTokenOperation.confirmation();
    
    //         // console.log('   - vault collateral deposited: Mock FA-12 Tokens: ' + usdtDepositAmount + " | Mock FA-2 Tokens: " + usdtDepositAmount + " | Mav: " + mavDepositAmount + " | sMVN: " + mvnDepositAmount);
    
    //         // ----------------------------------------------------------------------------------------------
    //         // Borrow with Vault
    //         // ----------------------------------------------------------------------------------------------
    
    //         // borrow amount - 10 Mock FA2 Tokens - USD $35.00 
    //         const borrowAmount = 10000000;   
    
    //         // borrow operation
    //         const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
    //         await eveBorrowOperation.confirmation();
    
    //         lendingControllerStorage   = await lendingControllerInstance.storage();
    //         currentMockLevel           = lendingControllerStorage.config.mockLevel.toNumber();            
    
    //         // console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName + " | current block level: " + currentMockLevel);            
    //         const compoundOperation = await doormanInstance.methods.compound([vaultOwner, vaultAddress, liquidator, contractDeployments.treasury.address]).send();
    //         await compoundOperation.confirmation();

    //         // get initial Mock FA-12 Token and Mock FA-2 balance for Eve (vault owner), liquidator, vault, Treasury and Token Pool Reward Contract
    //         usdtTokenStorage            = await usdtTokenInstance.storage();
    //         eurtTokenStorage            = await eurtTokenInstance.storage();
    //         lendingControllerStorage    = await lendingControllerInstance.storage();
    //         doormanStorage              = await doormanInstance.storage();

    //         // Vault Owner
    //         vaultOwnerMockFa12TokenAccount          = await usdtTokenStorage.ledger.get(vaultOwner);            
    //         vaultOwnerMockFa2TokenAccount           = await eurtTokenStorage.ledger.get(vaultOwner);            
    //         vaultOwnerMavAccount                    = await utils.tezos.tz.getBalance(vaultOwner);
    //         vaultOwnerStakedMvnAccount              = await doormanStorage.userStakeBalanceLedger.get(vaultOwner);

    //         initialVaultOwnerMockFa12TokenBalance   = vaultOwnerMockFa12TokenAccount == undefined ? 0 : vaultOwnerMockFa12TokenAccount.balance.toNumber();
    //         initialVaultOwnerMockFa2TokenBalance    = vaultOwnerMockFa2TokenAccount == undefined ? 0 : vaultOwnerMockFa2TokenAccount.toNumber();
    //         initialVaultOwnerMavBalance             = vaultOwnerMavAccount.toNumber();
    //         initialVaultOwnerStakedMvnBalance       = vaultOwnerStakedMvnAccount == undefined ? 0 : vaultOwnerStakedMvnAccount.balance.toNumber();
            
    //         // ----
    
    //         // Vault 
    //         vaultMockFa12TokenAccount               = await usdtTokenStorage.ledger.get(vaultAddress);            
    //         vaultMockFa2TokenAccount                = await eurtTokenStorage.ledger.get(vaultAddress);            
    //         vaultMavAccount                         = await utils.tezos.tz.getBalance(vaultAddress);
    //         vaultStakedMvnAccount                   = await doormanStorage.userStakeBalanceLedger.get(vaultAddress);

    //         initialVaultMockFa12TokenBalance        = vaultMockFa12TokenAccount == undefined ? 0 : vaultMockFa12TokenAccount.balance.toNumber();
    //         initialVaultMockFa2TokenBalance         = vaultMockFa2TokenAccount == undefined ? 0 : vaultMockFa2TokenAccount.toNumber();
    //         initialVaultMavBalance                  = vaultMavAccount.toNumber();
    //         initialVaultStakedMvnBalance            = vaultStakedMvnAccount == undefined ? 0 : vaultStakedMvnAccount.balance.toNumber();

    //         // ----            
    
    //         // Liquidator
    //         liquidatorMockFa12TokenAccount          = await usdtTokenStorage.ledger.get(liquidator);            
    //         liquidatorMockFa2TokenAccount           = await eurtTokenStorage.ledger.get(liquidator);            
    //         liquidatorMavAccount                    = await utils.tezos.tz.getBalance(liquidator);
    //         liquidatorStakedMvnAccount              = await doormanStorage.userStakeBalanceLedger.get(liquidator);

    //         initialLiquidatorMockFa12TokenBalance   = liquidatorMockFa12TokenAccount == undefined ? 0 : liquidatorMockFa12TokenAccount.balance.toNumber();
    //         initialLiquidatorMockFa2TokenBalance    = liquidatorMockFa2TokenAccount == undefined ? 0 : liquidatorMockFa2TokenAccount.toNumber();
    //         initialLiquidatorMavBalance             = liquidatorMavAccount.toNumber();
    //         initialLiquidatorStakedMvnBalance       = liquidatorStakedMvnAccount == undefined ? 0 : liquidatorStakedMvnAccount.balance.toNumber();

    //         // ----            
    
    //         // Treasury
    //         treasuryMockFa12TokenAccount            = await usdtTokenStorage.ledger.get(contractDeployments.treasury.address);            
    //         treasuryMockFa2TokenAccount             = await eurtTokenStorage.ledger.get(contractDeployments.treasury.address);            
    //         treasuryMavAccount                      = await utils.tezos.tz.getBalance(contractDeployments.treasury.address);
    //         treasuryStakedMvnAccount                = await doormanStorage.userStakeBalanceLedger.get(contractDeployments.treasury.address);

    //         initialTreasuryMockFa12TokenBalance     = treasuryMockFa12TokenAccount == undefined ? 0 : treasuryMockFa12TokenAccount.balance.toNumber();
    //         initialTreasuryMockFa2TokenBalance      = treasuryMockFa2TokenAccount == undefined ? 0 : treasuryMockFa2TokenAccount.toNumber();
    //         initialTreasuryMavBalance               = treasuryMavAccount.toNumber();
    //         initialTreasuryStakedMvnBalance         = treasuryStakedMvnAccount == undefined ? 0 : treasuryStakedMvnAccount.balance.toNumber();

    //         // ----            

    //         // Lending Controller
    //         lendingControllerMockFa12TokenAccount         = await usdtTokenStorage.ledger.get(lendingControllerAddress);            
    //         lendingControllerMockFa2TokenAccount          = await eurtTokenStorage.ledger.get(lendingControllerAddress);            
    //         lendingControllerMavAccount                   = await utils.tezos.tz.getBalance(lendingControllerAddress);

    //         initialLendingControllerMockFa12TokenBalance  = lendingControllerMockFa12TokenAccount == undefined ? 0 : lendingControllerMockFa12TokenAccount.balance.toNumber();
    //         initialLendingControllerMockFa2TokenBalance   = lendingControllerMockFa2TokenAccount == undefined ? 0 : lendingControllerMockFa2TokenAccount.toNumber();
    //         initialLendingControllerMavBalance            = lendingControllerMavAccount.toNumber();

    //         // ----            
    
    //         // get token pool stats
    //         lendingControllerStorage       = await lendingControllerInstance.storage();
    //         vaultRecord                    = await lendingControllerStorage.vaults.get(vaultHandle);
    //         loanTokenRecord                = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
            
    //         loanTokenDecimals              = loanTokenRecord.tokenDecimals;
    //         const interestRateDecimals     = (27 - 2); 
    
    //         const tokenPoolTotal           = loanTokenRecord.tokenPoolTotal.toNumber() / (10 ** loanTokenDecimals.toNumber());
    //         const totalBorrowed            = loanTokenRecord.totalBorrowed.toNumber() / (10 ** loanTokenDecimals.toNumber());
    //         const optimalUtilisationRate   = Number(loanTokenRecord.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
    //         const utilisationRate          = Number(loanTokenRecord.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
    //         const currentInterestRate      = Number(loanTokenRecord.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
    
    //         // console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);
    
    //         // ----------------------------------------------------------------------------------------------
    //         // Set oracle price changes
    //         // - price shock for Mock FA-12 Token (collateral token) - price drops by 2/3
    //         // - price shock for Mav (collateral token) - price drops by 2/3
    //         // ----------------------------------------------------------------------------------------------
    
    //         await signerFactory(tezos, bob.sk); // temporarily set to tester to increase block levels
    
    //         mockUsdMockFa12TokenAggregatorStorage     = await mockUsdMockFa12TokenAggregatorInstance.storage();
    //         lastEpoch                                 = mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.epoch
    //         lastRound                                 = mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.round
    //         epoch                                     = lastEpoch.toNumber() + 1;
    //         round                                     = lastRound.toNumber() + 1;
    
    //         lendingControllerStorage                  = await lendingControllerInstance.storage();
    //         vaultRecord                               = await lendingControllerStorage.vaults.get(vaultHandle);
    //         lastUpdatedBlockLevel                     = vaultRecord.lastUpdatedBlockLevel;
    
    //         // local token oracles array map
    //         const usdtTokenCurrentPrice           = tokenOracles[usdtTokenIndex].price;

    //         // price shock observation data for mock FA-12 token
    //         usdtTokenIndex                        = lendingHelper.priceDecreaseObservations.findIndex((o => o.name === "usdt"));
    //         const usdtTokenPriceShockObservations = lendingHelper.priceDecreaseObservations[usdtTokenIndex].observations;
    //         const newMockFa12TokenMedianPrice         = lendingHelper.priceDecreaseObservations[usdtTokenIndex].medianPrice;

    //         // set price shock for mock FA-12 token
    //         await setTokenPrice(epoch, round, usdtTokenPriceShockObservations, "usdt");
    
    //         // Update price in token oracles array for local calculations
    //         tokenOracles[usdtTokenIndex].price = newMockFa12TokenMedianPrice;
    
    //         mockUsdMockFa12TokenAggregatorStorage = await mockUsdMockFa12TokenAggregatorInstance.storage();
    //         assert.deepEqual(mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.round,new BigNumber(round));
    //         assert.deepEqual(mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.epoch,new BigNumber(epoch));
    //         assert.deepEqual(mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.data,new BigNumber(newMockFa12TokenMedianPrice));
    //         assert.deepEqual(mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.percentOracleResponse,new BigNumber(10000));
    
    //         // console.log('   - Mock FA-12 Token price change from ' + usdtTokenCurrentPrice + ' to ' + newMockFa12TokenMedianPrice);

    //         mockUsdMvrkAggregatorStorage   = await mockUsdMvrkAggregatorInstance.storage();
    //         lastEpoch                     = mockUsdMvrkAggregatorStorage.lastCompletedData.epoch
    //         lastRound                     = mockUsdMvrkAggregatorStorage.lastCompletedData.round
    //         epoch                         = lastEpoch.toNumber() + 1;
    //         round                         = lastRound.toNumber() + 1;
    
    //         lendingControllerStorage     = await lendingControllerInstance.storage();
    //         vaultRecord                  = await lendingControllerStorage.vaults.get(vaultHandle);
    //         lastUpdatedBlockLevel        = vaultRecord.lastUpdatedBlockLevel;
    
    //         // local token oracles array map
    //         const mavCurrentPrice           = tokenOracles[mavIndex].price;

    //         // price shock observation data for mock FA-12 token
    //         const mavPriceShockObservations = lendingHelper.priceDecreaseObservations[mavIndex].observations;
    //         const newMavMedianPrice         = lendingHelper.priceDecreaseObservations[mavIndex].medianPrice;

    //         // set price shock for mock FA-12 token
    //         await setTokenPrice(epoch, round, mavPriceShockObservations, "mav");
    
    //         // Update price in token oracles array for local calculations
    //         tokenOracles[mavIndex].price = newMavMedianPrice;
    
    //         mockUsdMvrkAggregatorStorage = await mockUsdMvrkAggregatorInstance.storage();
    //         assert.deepEqual(mockUsdMvrkAggregatorStorage.lastCompletedData.round,new BigNumber(round));
    //         assert.deepEqual(mockUsdMvrkAggregatorStorage.lastCompletedData.epoch,new BigNumber(epoch));
    //         assert.deepEqual(mockUsdMvrkAggregatorStorage.lastCompletedData.data,new BigNumber(newMavMedianPrice));
    //         assert.deepEqual(mockUsdMvrkAggregatorStorage.lastCompletedData.percentOracleResponse,new BigNumber(10000));
    
    //         // console.log('   - MVRK price change from ' + mavCurrentPrice + ' to ' + newMavMedianPrice);
    
    //         // ----------------------------------------------------------------------------------------------
    //         // Vault Marked for liquidation
    //         // ----------------------------------------------------------------------------------------------

    //         // console.log('mark for liquidation');

    //         await signerFactory(tezos, mallory.sk); // mallory as liquidator

    //         // note: requires mock level to not be 0
    //         const markVaultForLiquidationOperation = await lendingControllerInstance.methods.markForLiquidation(vaultId, vaultOwner).send();
    //         await markVaultForLiquidationOperation.confirmation();
    
    //         lendingControllerStorage   = await lendingControllerInstance.storage();
    //         vaultRecord                = await lendingControllerStorage.vaults.get(vaultHandle);
    //         currentMockLevel           = lendingControllerStorage.config.mockLevel.toNumber();            
    
    //         const expectedMarkedForLiquidationLevel = currentMockLevel;
    //         const expectedLiquidationEndLevel       = currentMockLevel + (liquidationMaxDuration * oneMinuteLevelBlocks);
    
    //         initialVaultLoanOutstandingTotal = vaultRecord.loanOutstandingTotal;
    //         initialVaultLoanPrincipalTotal   = vaultRecord.loanPrincipalTotal;
    //         initialVaultBorrowIndex          = vaultRecord.borrowIndex;
    
    //         const vaultMarkedForLiquidationLevel    = vaultRecord.markedForLiquidationLevel;
    //         const vaultLiquidationEndLevel          = vaultRecord.liquidationEndLevel;
    
    //         assert.equal(vaultMarkedForLiquidationLevel, expectedMarkedForLiquidationLevel);
    //         assert.equal(vaultLiquidationEndLevel, expectedLiquidationEndLevel);

    //         // console.log('fail test: mark for liquidation again');
    
    //         // test vault cannot be marked for liquidation if it has already been marked
    //         const failMarkVaultForLiquidation = await lendingControllerInstance.methods.markForLiquidation(vaultId, vaultOwner);
    //         await chai.expect(failMarkVaultForLiquidation.send()).to.be.rejected;

    //         // ----------------------------------------------------------------------------------------------
    //         // After marked for liquidation: set block level ahead by half of liquidationDelayinMins
    //         // ----------------------------------------------------------------------------------------------
    
    //         await signerFactory(tezos, bob.sk); // temporarily set to tester to increase block levels
    
    //         lendingControllerStorage    = await lendingControllerInstance.storage();
    //         vaultRecord                 = await lendingControllerStorage.vaults.get(vaultHandle);
    //         markedForLiquidationLevel   = vaultRecord.markedForLiquidationLevel;
    
    //         minutesPassed   = liquidationDelayInMins / 2; 
    //         mockLevelChange = minutesPassed * oneMinuteLevelBlocks;
    //         newMockLevel    = markedForLiquidationLevel.toNumber() + mockLevelChange;
    
    //         let setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(
    //             [
    //                 {
    //                     configName: "mockLevel",
    //                     newValue: newMockLevel
    //                 },
    //             ]
    //         ).send();
    //         await setMockLevelOperation.confirmation();
    
    //         lendingControllerStorage = await lendingControllerInstance.storage();
    //         currentMockLevel         = lendingControllerStorage.config.mockLevel;
    
    //         assert.equal(currentMockLevel, newMockLevel);
    
    //         // console.log('   - time set to middle of vault liquidation delay: ' + markedForLiquidationLevel + ' to ' + newMockLevel + ' | Changed by: ' + mockLevelChange);
    //         // console.log('fail test: mark for liquidation again');
    
    //         // test vault cannot be marked for liquidation if it has already been marked
    //         const failMarkVaultForLiquidationAgain = await lendingControllerInstance.methods.markForLiquidation(vaultId, vaultOwner);
    //         await chai.expect(failMarkVaultForLiquidationAgain.send()).to.be.rejected;
    
    //         // test vault cannot be liquidated if delay has not been passed
    //         const failTestLiquidationAmount = 10;
    //         failLiquidateVaultOperation = await lendingControllerInstance.methods.liquidateVault(vaultId, vaultOwner, failTestLiquidationAmount);
    //         await chai.expect(failLiquidateVaultOperation.send()).to.be.rejected;
    
    //         // ----------------------------------------------------------------------------------------------
    //         // Set Block Levels For Mock Time Test - immediately after delay ends
    //         // ----------------------------------------------------------------------------------------------
    
    //         await signerFactory(tezos, bob.sk); // temporarily set to tester to increase block levels
    
    //         lendingControllerStorage    = await lendingControllerInstance.storage();
    //         vaultRecord                 = await lendingControllerStorage.vaults.get(vaultHandle);
    //         markedForLiquidationLevel   = vaultRecord.markedForLiquidationLevel;
    
    //         minutesPassed   = liquidationDelayInMins + 1;
    //         mockLevelChange = minutesPassed * oneMinuteLevelBlocks;
    //         newMockLevel    = markedForLiquidationLevel.toNumber() + mockLevelChange;
    
    //         setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(
    //             [
    //                 {
    //                     configName: "mockLevel",
    //                     newValue: newMockLevel
    //                 },
    //             ]
    //         ).send();
    //         await setMockLevelOperation.confirmation();
    
    //         lendingControllerStorage = await lendingControllerInstance.storage();
    //         currentMockLevel         = lendingControllerStorage.config.mockLevel;
    
    //         assert.equal(currentMockLevel, newMockLevel);
    
    //         // console.log('   - time set to immediately after vault liquidation delay: ' + markedForLiquidationLevel + ' to ' + newMockLevel + ' | Changed by: ' + mockLevelChange);
    
    //         // ----------------------------------------------------------------------------------------------
    //         // Calculate liquidate vault effects
    //         // ----------------------------------------------------------------------------------------------
    
    //         await signerFactory(tezos, mallory.sk); 
    //         const liquidationAmount = 100;
    
    //         // Update storage
    //         lendingControllerStorage    = await lendingControllerInstance.storage();
    //         usdtTokenStorage        = await usdtTokenInstance.storage();
    
    //         // vault record
    //         vaultRecord                 = await lendingControllerStorage.vaults.get(vaultHandle);
    //         vaultLoanOutstandingTotal   = vaultRecord.loanOutstandingTotal;
    //         vaultLoanPrincipalTotal     = vaultRecord.loanPrincipalTotal;
    //         vaultLoanInterestTotal      = vaultRecord.loanInterestTotal;
    //         vaultBorrowIndex            = vaultRecord.borrowIndex;
    
    //         // loan token record
    //         loanTokenRecord             = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
    //         updatedLoanTokenBorrowIndex = loanTokenRecord.borrowIndex;
    
    //         // vault calculations
    //         loanOutstandingWithAccruedInterest      = lendingHelper.calculateAccruedInterest(initialVaultLoanOutstandingTotal, initialVaultBorrowIndex, updatedLoanTokenBorrowIndex);
    //         totalInterest                           = initialVaultLoanPrincipalTotal.toNumber() > loanOutstandingWithAccruedInterest ? 0 :  loanOutstandingWithAccruedInterest - initialVaultLoanPrincipalTotal.toNumber();

    
    //         // check that calculations are correct - use of almostEqual as there may be a slight difference of 1 from rounding errors 
    //         assert.equal(almostEqual(vaultLoanOutstandingTotal, loanOutstandingWithAccruedInterest, 0.0001), true);
    //         assert.equal(almostEqual(vaultLoanInterestTotal, totalInterest, 0.0001), true);
    

    //         // calculate value of collateral 
    //         const vaultCollateralValue          = lendingHelper.calculateVaultCollateralValue(tokenOracles, vaultRecord.collateralBalanceLedger);
    //         const usdtCollateralTokenValue  = lendingHelper.calculateTokenValue(usdtDepositAmount   , "usdt"    , tokenOracles);
    //         const eurtCollateralTokenValue   = lendingHelper.calculateTokenValue(eurtDepositAmount    , "eurt"     , tokenOracles);
    //         const mavCollateralTokenValue       = lendingHelper.calculateTokenValue(mavDepositAmount        , "mav"         , tokenOracles);
    //         const mvnCollateralTokenValue       = lendingHelper.calculateTokenValue(mvnDepositAmount        , "smvn"         , tokenOracles);

    //         // calculate proportion of collateral based on their value
    //         const usdtTokenProportion       = lendingHelper.calculateTokenProportion(usdtCollateralTokenValue, vaultCollateralValue);
    //         const eurtTokenProportion        = lendingHelper.calculateTokenProportion(eurtCollateralTokenValue, vaultCollateralValue);
    //         const mavProportion                 = lendingHelper.calculateTokenProportion(mavCollateralTokenValue, vaultCollateralValue);
    //         const mvnProportion                 = lendingHelper.calculateTokenProportion(mvnCollateralTokenValue, vaultCollateralValue);


    //         // liquidation calculations - raw amounts 
    //         adminLiquidationFee                    = lendingHelper.calculateAdminLiquidationFee(adminLiquidationFeePercent, liquidationAmount);
    //         liquidationIncentive                   = lendingHelper.calculateLiquidationIncentive(liquidationFeePercent, liquidationAmount);            
    //         liquidationAmountWithIncentive         = liquidationAmount + liquidationIncentive; 
    //         liquidationAmountWithFeesAndIncentive  = liquidationAmount + liquidationIncentive + adminLiquidationFee; 
    
    //         // max liquidation amount, final (total) liquidation amount, and total interest paid
    //         vaultMaxLiquidationAmount              = lendingHelper.calculateVaultMaxLiquidationAmount(vaultLoanOutstandingTotal, maxVaultLiquidationPercent);
    //         totalLiquidationAmount                 = lendingHelper.calculateTotalLiquidationAmount(liquidationAmount, vaultMaxLiquidationAmount);
    //         totalInterestPaid                      = lendingHelper.calculateTotalInterestPaid(totalLiquidationAmount, totalInterest);


    //         // -----------------
    //         // Convert tokens based on their proportion
    //         // -----------------

    //         // - amount to treasury (admin)
    //         adminLiquidationFeeMockFa12                     = usdtTokenProportion * adminLiquidationFee;
    //         adminLiquidationFeeMockFa12                     = lendingHelper.convertLoanTokenToCollateralToken("eurt", "usdt", tokenOracles, adminLiquidationFeeMockFa12);

    //         adminLiquidationFeeMockFa2                      = eurtTokenProportion * adminLiquidationFee;
    //         adminLiquidationFeeMockFa2                      = lendingHelper.convertLoanTokenToCollateralToken("eurt", "eurt", tokenOracles, adminLiquidationFeeMockFa2);

    //         adminLiquidationFeeMav                          = mavProportion * adminLiquidationFee;
    //         adminLiquidationFeeMav                          = lendingHelper.convertLoanTokenToCollateralToken("eurt", "mav", tokenOracles, adminLiquidationFeeMav);
                
    //         adminLiquidationFeeMvn                          = mvnProportion * adminLiquidationFee;
    //         adminLiquidationFeeMvn                          = lendingHelper.convertLoanTokenToCollateralToken("eurt", "smvn", tokenOracles, adminLiquidationFeeMvn);

    //         // - amount sent to liquidator
    //         liquidationAmountWithIncentiveMockFa12          = usdtTokenProportion * liquidationAmountWithIncentive
    //         liquidationAmountWithIncentiveMockFa12          = lendingHelper.convertLoanTokenToCollateralToken("eurt", "usdt", tokenOracles, liquidationAmountWithIncentiveMockFa12);

    //         liquidationAmountWithIncentiveMockFa2           = eurtTokenProportion * liquidationAmountWithIncentive
    //         liquidationAmountWithIncentiveMockFa2           = lendingHelper.convertLoanTokenToCollateralToken("eurt", "eurt", tokenOracles, liquidationAmountWithIncentiveMockFa2);

    //         liquidationAmountWithIncentiveMav               = mavProportion * liquidationAmountWithIncentive
    //         liquidationAmountWithIncentiveMav               = lendingHelper.convertLoanTokenToCollateralToken("eurt", "mav", tokenOracles, liquidationAmountWithIncentiveMav);

    //         liquidationAmountWithIncentiveMvn               = mvnProportion * liquidationAmountWithIncentive
    //         liquidationAmountWithIncentiveMvn               = lendingHelper.convertLoanTokenToCollateralToken("eurt", "smvn", tokenOracles, liquidationAmountWithIncentiveMvn);
            
    //         // - total liquidated from vault
    //         liquidationAmountWithFeesAndIncentiveMockFa12   = usdtTokenProportion * liquidationAmountWithFeesAndIncentive;
    //         liquidationAmountWithFeesAndIncentiveMockFa12   = lendingHelper.convertLoanTokenToCollateralToken("eurt", "usdt", tokenOracles, liquidationAmountWithFeesAndIncentiveMockFa12);

    //         liquidationAmountWithFeesAndIncentiveMockFa2    = eurtTokenProportion * liquidationAmountWithFeesAndIncentive;            
    //         liquidationAmountWithFeesAndIncentiveMockFa2    = lendingHelper.convertLoanTokenToCollateralToken("eurt", "eurt", tokenOracles, liquidationAmountWithFeesAndIncentiveMockFa2);
    
    //         liquidationAmountWithFeesAndIncentiveMav        = mavProportion * liquidationAmountWithFeesAndIncentive;
    //         liquidationAmountWithFeesAndIncentiveMav        = lendingHelper.convertLoanTokenToCollateralToken("eurt", "mav", tokenOracles, liquidationAmountWithFeesAndIncentiveMav);

    //         liquidationAmountWithFeesAndIncentiveMvn        = mvnProportion * liquidationAmountWithFeesAndIncentive;
    //         liquidationAmountWithFeesAndIncentiveMvn        = lendingHelper.convertLoanTokenToCollateralToken("eurt", "smvn", tokenOracles, liquidationAmountWithFeesAndIncentiveMvn);

    //         // - total liquidation amount
    //         totalLiquidationAmountMockFa12                  = usdtTokenProportion * totalLiquidationAmount;
    //         totalLiquidationAmountMockFa12                  = lendingHelper.convertLoanTokenToCollateralToken("eurt", "usdt", tokenOracles, totalLiquidationAmountMockFa12);

    //         totalLiquidationAmountMockFa2                   = eurtTokenProportion * totalLiquidationAmount;
    //         totalLiquidationAmountMockFa2                   = lendingHelper.convertLoanTokenToCollateralToken("eurt", "eurt", tokenOracles, totalLiquidationAmountMockFa2);

    //         totalLiquidationAmountMav                       = mavProportion * totalLiquidationAmount;
    //         totalLiquidationAmountMav                       = lendingHelper.convertLoanTokenToCollateralToken("eurt", "mav", tokenOracles, totalLiquidationAmountMav);

    //         totalLiquidationAmountMvn                       = mvnProportion * totalLiquidationAmount;
    //         totalLiquidationAmountMvn                       = lendingHelper.convertLoanTokenToCollateralToken("eurt", "smvn", tokenOracles, totalLiquidationAmountMvn);
    
    //         // interest will be in the loan token type (i.e. mock FA2)
    //         interestSentToTreasury                          = lendingHelper.calculateInterestSentToTreasury(interestTreasuryShare, totalInterestPaid)
    //         interestRewards                                 = lendingHelper.calculateInterestRewards(interestSentToTreasury, totalInterestPaid);

            
    //         // ----------------------------------------------------------------------------------------------
    //         // Liquidate vault operation
    //         // ----------------------------------------------------------------------------------------------
    
    //         // console.log(" - ")
    //         // console.log('start vault liquidation');

    //         // mallory sets operator for lending controller
    //         updateOperatorsOperation = await updateOperators(eurtTokenInstance, liquidator, lendingControllerAddress, tokenId);
    //         await updateOperatorsOperation.confirmation();

    //         // mallory sets operator for doorman
    //         updateOperatorsOperation = await updateOperators(mvnTokenInstance, liquidator, contractDeployments.doorman.address, tokenId);
    //         await updateOperatorsOperation.confirmation();
    
    //         liquidateVaultOperation = await lendingControllerInstance.methods.liquidateVault(vaultId, vaultOwner, liquidationAmount).send();
    //         await liquidateVaultOperation.confirmation();

    //         // ---------------------------------------
    //         // after liquidation - get updated storage
    //         // ---------------------------------------

    
    //         // Update storage
    //         lendingControllerStorage    = await lendingControllerInstance.storage();
    //         usdtTokenStorage        = await usdtTokenInstance.storage();
    //         doormanStorage              = await doormanInstance.storage();

    //         // loan token record
    //         loanTokenRecord             = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
    //         updatedLoanTokenBorrowIndex = loanTokenRecord.borrowIndex;
    
    //         // vault record
    //         vaultRecord                 = await lendingControllerStorage.vaults.get(vaultHandle);
    //         vaultLoanOutstandingTotal   = vaultRecord.loanOutstandingTotal;
    //         vaultLoanPrincipalTotal     = vaultRecord.loanPrincipalTotal;
    //         vaultLoanInterestTotal      = vaultRecord.loanInterestTotal;
    //         vaultBorrowIndex            = vaultRecord.borrowIndex;
    
    //         // console.log('after liquidation');
    //         // console.log(vaultRecord);

    //         // vault calculations
    //         totalLiquidationAmount                  = lendingHelper.calculateTotalLiquidationAmount(liquidationAmount, vaultMaxLiquidationAmount);
    //         totalInterestPaid                       = lendingHelper.calculateTotalInterestPaid(totalLiquidationAmount, vaultLoanInterestTotal);

    //         loanOutstandingWithAccruedInterest      = lendingHelper.calculateAccruedInterest(initialVaultLoanOutstandingTotal, initialVaultBorrowIndex, updatedLoanTokenBorrowIndex);
    //         totalInterest                           = loanOutstandingWithAccruedInterest - initialVaultLoanPrincipalTotal.toNumber();
    //         remainingInterest                       = lendingHelper.calculateRemainingInterest(totalLiquidationAmount, totalInterest)

    //         finalLoanOutstandingTotal               = lendingHelper.calculateFinalLoanOutstandingTotal(totalLiquidationAmount, loanOutstandingWithAccruedInterest);
    //         finalLoanPrincipalTotal                 = lendingHelper.calculateFinalLoanPrincipalTotal(totalLiquidationAmount, loanOutstandingWithAccruedInterest, remainingInterest, initialVaultLoanPrincipalTotal);
    //         finalLoanInterestTotal                  = lendingHelper.calculateFinalLoanInterestTotal(remainingInterest);

    
    //         // ---------------------------------------
    //         // get updated accounts and balances
    //         // ---------------------------------------


    //         // Vault Owner
    //         vaultOwnerMockFa12TokenAccount          = await usdtTokenStorage.ledger.get(vaultOwner);            
    //         vaultOwnerMockFa2TokenAccount           = await eurtTokenStorage.ledger.get(vaultOwner);            
    //         vaultOwnerMavAccount                    = await utils.tezos.tz.getBalance(vaultOwner);
    //         vaultOwnerStakedMvnAccount              = await doormanStorage.userStakeBalanceLedger.get(vaultOwner);

    //         updatedVaultOwnerMockFa12TokenBalance   = vaultOwnerMockFa12TokenAccount == undefined ? 0 : vaultOwnerMockFa12TokenAccount.balance.toNumber();
    //         updatedVaultOwnerMockFa2TokenBalance    = vaultOwnerMockFa2TokenAccount == undefined ? 0 : vaultOwnerMockFa2TokenAccount.toNumber();
    //         updatedVaultOwnerMavBalance             = vaultOwnerMavAccount.toNumber();
    //         updatedVaultOwnerStakedMvnBalance       = vaultOwnerStakedMvnAccount == undefined ? 0 : vaultOwnerStakedMvnAccount.balance.toNumber();
    
    //         // ----
    
    //         // Vault 
    //         vaultMockFa12TokenAccount               = await usdtTokenStorage.ledger.get(vaultAddress);            
    //         vaultMockFa2TokenAccount                = await eurtTokenStorage.ledger.get(vaultAddress);            
    //         vaultMavAccount                         = await utils.tezos.tz.getBalance(vaultAddress);
    //         vaultStakedMvnAccount                   = await doormanStorage.userStakeBalanceLedger.get(vaultAddress);

    //         updatedVaultMockFa12TokenBalance        = vaultMockFa12TokenAccount == undefined ? 0 : vaultMockFa12TokenAccount.balance.toNumber();
    //         updatedVaultMockFa2TokenBalance         = vaultMockFa2TokenAccount == undefined ? 0 : vaultMockFa2TokenAccount.toNumber();
    //         updatedVaultMavBalance                  = vaultMavAccount.toNumber();
    //         updatedVaultStakedMvnBalance            = vaultStakedMvnAccount == undefined ? 0 : vaultStakedMvnAccount.balance.toNumber();
    
    //         // ----            
    
    //         // Liquidator
    //         liquidatorMockFa12TokenAccount          = await usdtTokenStorage.ledger.get(liquidator);            
    //         liquidatorMockFa2TokenAccount           = await eurtTokenStorage.ledger.get(liquidator);            
    //         liquidatorMavAccount                    = await utils.tezos.tz.getBalance(liquidator);
    //         liquidatorStakedMvnAccount              = await doormanStorage.userStakeBalanceLedger.get(liquidator);

    //         updatedLiquidatorMockFa12TokenBalance   = liquidatorMockFa12TokenAccount == undefined ? 0 : liquidatorMockFa12TokenAccount.balance.toNumber();
    //         updatedLiquidatorMockFa2TokenBalance    = liquidatorMockFa2TokenAccount == undefined ? 0 : liquidatorMockFa2TokenAccount.toNumber();
    //         updatedLiquidatorMavBalance             = liquidatorMavAccount.toNumber();
    //         updatedLiquidatorStakedMvnBalance       = liquidatorStakedMvnAccount == undefined ? 0 : liquidatorStakedMvnAccount.balance.toNumber();
    
    //         // ----            
    
    //         // Treasury
    //         treasuryMockFa12TokenAccount            = await usdtTokenStorage.ledger.get(contractDeployments.treasury.address);            
    //         treasuryMockFa2TokenAccount             = await eurtTokenStorage.ledger.get(contractDeployments.treasury.address);            
    //         treasuryMavAccount                      = await utils.tezos.tz.getBalance(contractDeployments.treasury.address);
    //         treasuryStakedMvnAccount                = await doormanStorage.userStakeBalanceLedger.get(contractDeployments.treasury.address);

    //         updatedTreasuryMockFa12TokenBalance     = treasuryMockFa12TokenAccount == undefined ? 0 : treasuryMockFa12TokenAccount.balance.toNumber();
    //         updatedTreasuryMockFa2TokenBalance      = treasuryMockFa2TokenAccount == undefined ? 0 : treasuryMockFa2TokenAccount.toNumber();
    //         updatedTreasuryMavBalance               = treasuryMavAccount.toNumber();
    //         updatedTreasuryStakedMvnBalance         = treasuryStakedMvnAccount == undefined ? 0 : treasuryStakedMvnAccount.balance.toNumber();

    //         // ----            

    //         // Lending Controller
    //         lendingControllerMockFa12TokenAccount         = await usdtTokenStorage.ledger.get(lendingControllerAddress);            
    //         lendingControllerMockFa2TokenAccount          = await eurtTokenStorage.ledger.get(lendingControllerAddress);            
    //         lendingControllerMavAccount                   = await utils.tezos.tz.getBalance(lendingControllerAddress);

    //         updatedLendingControllerMockFa12TokenBalance  = lendingControllerMockFa12TokenAccount == undefined ? 0 : lendingControllerMockFa12TokenAccount.balance.toNumber();
    //         updatedLendingControllerMockFa2TokenBalance   = lendingControllerMockFa2TokenAccount == undefined ? 0 : lendingControllerMockFa2TokenAccount.toNumber();
    //         updatedLendingControllerMavBalance            = lendingControllerMavAccount.toNumber();

            
    //         // --------------------------------------------------------
    //         // Advanced test checks and assertions
    //         // --------------------------------------------------------
            
    //         // vault owner: check that there are no changes to the vault owner's balance
    //         assert.equal(updatedVaultOwnerMockFa12TokenBalance  , initialVaultOwnerMockFa12TokenBalance);
    //         assert.equal(updatedVaultOwnerMockFa2TokenBalance   , initialVaultOwnerMockFa2TokenBalance);
    //         assert.equal(updatedVaultOwnerMavBalance            , initialVaultOwnerMavBalance);
    //         assert.equal(updatedVaultOwnerStakedMvnBalance      , initialVaultOwnerStakedMvnBalance);
    
    //         // vault: should have a total reduction in balance equal to liquidationAmountWithFeesAndIncentive
    //         // - use of almostEqual as there may be a slight difference of 1 from rounding errors 
    //         assert.equal(almostEqual(updatedVaultMockFa12TokenBalance   , initialVaultMockFa12TokenBalance - liquidationAmountWithFeesAndIncentiveMockFa12  , 0.0001), true);
    //         assert.equal(almostEqual(updatedVaultMockFa2TokenBalance    , initialVaultMockFa2TokenBalance  - liquidationAmountWithFeesAndIncentiveMockFa2   , 0.0001), true);
    //         assert.equal(almostEqual(updatedVaultMavBalance             , initialVaultMavBalance           - liquidationAmountWithFeesAndIncentiveMav       , 0.0001), true);
    //         assert.equal(almostEqual(updatedVaultStakedMvnBalance       , initialVaultStakedMvnBalance     - liquidationAmountWithFeesAndIncentiveMvn       , 0.0001), true);
            
    //         // liquidator: uses Mock FA-2 tokens to liquidate and receives other collateral tokens from vault collateral
    //         // - mav: account for gas cost of sending liquidateVault operation
    //         assert.equal(updatedLiquidatorMockFa12TokenBalance, initialLiquidatorMockFa12TokenBalance + liquidationAmountWithIncentiveMockFa12);
    //         assert.equal(updatedLiquidatorMockFa2TokenBalance, initialLiquidatorMockFa2TokenBalance - liquidationAmount + liquidationAmountWithIncentiveMockFa2);
    //         assert.equal(almostEqual(updatedLiquidatorMavBalance, initialLiquidatorMavBalance + liquidationAmountWithIncentiveMav, 0.0001), true);
    //         assert.equal(updatedLiquidatorStakedMvnBalance, initialLiquidatorStakedMvnBalance + liquidationAmountWithIncentiveMvn);
    
    //         // treasury should receive both admin fee and share from interest repaid (if there is interest)
    //         // - no interest paid
    //         assert.equal(updatedTreasuryMockFa12TokenBalance, initialTreasuryMockFa12TokenBalance + adminLiquidationFeeMockFa12);
    //         assert.equal(almostEqual(updatedTreasuryMockFa2TokenBalance, initialTreasuryMockFa2TokenBalance + adminLiquidationFeeMockFa2, 0.0001), true);
    //         assert.equal(updatedTreasuryMavBalance, initialTreasuryMavBalance + adminLiquidationFeeMav);
    //         assert.equal(updatedTreasuryStakedMvnBalance, initialTreasuryStakedMvnBalance + adminLiquidationFeeMvn);
    
    //         // reward pool should receive interest share from total interest paid
    //         // - no interest paid
    //         assert.equal(updatedLendingControllerMockFa12TokenBalance, initialLendingControllerMockFa12TokenBalance);
    
    //         // check vault records 
    //         // - there could be some accrued interest leftover as the liquidation amount is very small (e.g. 0.0001 Mock FA2 token ~ $0.00035)
    //         assert.equal(vaultLoanOutstandingTotal, finalLoanOutstandingTotal);
    //         assert.equal(vaultLoanPrincipalTotal.toNumber(), finalLoanPrincipalTotal);
    //         assert.equal(vaultLoanInterestTotal, finalLoanInterestTotal);
    
    //     })    

    // })



    // describe('%closeVault - test close vault', function () {

    //     it('user (eve) can close her vaults (single collateral token) - open, borrow, repay all after one day, close - [Collateral Token: Mock FA-12, Mock FA-2, Mav, MVN | Loan Token: Mock FA-12]', async () => {

    //         // init variables and storage
    //         lendingControllerStorage = await lendingControllerInstance.storage();
    //         doormanStorage           = await doormanInstance.storage();
    //         vaultFactoryStorage      = await vaultFactoryInstance.storage();

    //         currentMockLevel         = lendingControllerStorage.mockLevel;

    //         // ----------------------------------------------------------------------------------------------
    //         // Reset token prices back to default
    //         // ----------------------------------------------------------------------------------------------

    //         // reset token prices
    //         usdtTokenIndex                      = lendingHelper.defaultPriceObservations.findIndex((o => o.name === "usdt"));
    //         eurtTokenIndex                      = lendingHelper.defaultPriceObservations.findIndex((o => o.name === "eurt"));
    //         mavIndex                            = lendingHelper.defaultPriceObservations.findIndex((o => o.name === "mav"));
    //         mvnIndex                            = lendingHelper.defaultPriceObservations.findIndex((o => o.name === "smvn"));

    //         round = 0;

    //         // ---------------------------------
    //         // Reset Mock FA-12 token prices to default observation data
    //         // ---------------------------------

    //         epoch = await mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.epoch;
    //         epoch = epoch.toNumber() + 1;            
    //         defaultObservations = lendingHelper.defaultPriceObservations[usdtTokenIndex].observations;
    //         await setTokenPrice(epoch, round, defaultObservations, "usdt");

    //         const usdtTokenMedianPrice = lendingHelper.defaultPriceObservations[usdtTokenIndex].medianPrice;
    //         tokenOracles[usdtTokenIndex].price = usdtTokenMedianPrice;

    //         mockUsdMockFa12TokenAggregatorStorage = await mockUsdMockFa12TokenAggregatorInstance.storage();
    //         assert.deepEqual(mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.round,new BigNumber(round));
    //         assert.deepEqual(mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.epoch,new BigNumber(epoch));
    //         assert.deepEqual(mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.data,new BigNumber(usdtTokenMedianPrice));
    //         assert.deepEqual(mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.percentOracleResponse,new BigNumber(10000));

    //         // ---------------------------------
    //         // Reset Mock FA-2 token prices to default observation data
    //         // ---------------------------------

    //         epoch = await mockUsdMockFa2TokenAggregatorStorage.lastCompletedData.epoch;
    //         epoch = epoch.toNumber() + 1;            
    //         defaultObservations = lendingHelper.defaultPriceObservations[eurtTokenIndex].observations;
    //         await setTokenPrice(epoch, round, defaultObservations, "eurt");

    //         const eurtTokenMedianPrice = lendingHelper.defaultPriceObservations[eurtTokenIndex].medianPrice;
    //         tokenOracles[eurtTokenIndex].price = eurtTokenMedianPrice;

    //         mockUsdMockFa2TokenAggregatorStorage = await mockUsdMockFa2TokenAggregatorInstance.storage();
    //         assert.deepEqual(mockUsdMockFa2TokenAggregatorStorage.lastCompletedData.round,new BigNumber(round));
    //         assert.deepEqual(mockUsdMockFa2TokenAggregatorStorage.lastCompletedData.epoch,new BigNumber(epoch));
    //         assert.deepEqual(mockUsdMockFa2TokenAggregatorStorage.lastCompletedData.data,new BigNumber(eurtTokenMedianPrice));
    //         assert.deepEqual(mockUsdMockFa2TokenAggregatorStorage.lastCompletedData.percentOracleResponse,new BigNumber(10000));

    //         // ---------------------------------
    //         // Reset mav prices to default observation data
    //         // ---------------------------------

    //         epoch = await mockUsdMvrkAggregatorStorage.lastCompletedData.epoch;
    //         epoch = epoch.toNumber() + 1;            
    //         defaultObservations = lendingHelper.defaultPriceObservations[mavIndex].observations;
    //         await setTokenPrice(epoch, round, defaultObservations, "mav");

    //         const mavMedianPrice = lendingHelper.defaultPriceObservations[mavIndex].medianPrice;
    //         tokenOracles[mavIndex].price = mavMedianPrice;

    //         mockUsdMvrkAggregatorStorage = await mockUsdMvrkAggregatorInstance.storage();
    //         assert.deepEqual(mockUsdMvrkAggregatorStorage.lastCompletedData.round,new BigNumber(round));
    //         assert.deepEqual(mockUsdMvrkAggregatorStorage.lastCompletedData.epoch,new BigNumber(epoch));
    //         assert.deepEqual(mockUsdMvrkAggregatorStorage.lastCompletedData.data,new BigNumber(mavMedianPrice));
    //         assert.deepEqual(mockUsdMvrkAggregatorStorage.lastCompletedData.percentOracleResponse,new BigNumber(10000));

    //         // ---------------------------------
    //         // Reset mvn prices to default observation data
    //         // ---------------------------------

    //         epoch = await mockUsdMvnAggregatorStorage.lastCompletedData.epoch;
    //         epoch = epoch.toNumber() + 1;            
    //         defaultObservations = lendingHelper.defaultPriceObservations[mvnIndex].observations;
    //         await setTokenPrice(epoch, round, defaultObservations, "smvn");

    //         const mvnMedianPrice = lendingHelper.defaultPriceObservations[mvnIndex].medianPrice;
    //         tokenOracles[mvnIndex].price = mvnMedianPrice;

    //         mockUsdMvnAggregatorStorage = await mockUsdMvnAggregatorInstance.storage();
    //         assert.deepEqual(mockUsdMvnAggregatorStorage.lastCompletedData.round,new BigNumber(round));
    //         assert.deepEqual(mockUsdMvnAggregatorStorage.lastCompletedData.epoch,new BigNumber(epoch));
    //         assert.deepEqual(mockUsdMvnAggregatorStorage.lastCompletedData.data,new BigNumber(mvnMedianPrice));
    //         assert.deepEqual(mockUsdMvnAggregatorStorage.lastCompletedData.percentOracleResponse,new BigNumber(10000));


    //         // ----------------------------------------------------------------------------------------------
    //         // Create Vault
    //         // ----------------------------------------------------------------------------------------------


    //         await signerFactory(tezos, eve.sk);

    //         const vaultCounter      = vaultFactoryStorage.vaultCounter;
    //         const vaultId           = vaultCounter.toNumber();
    //         const vaultOwner        = eve.pkh;
    //         const loanTokenName     = "usdt";
    //         const vaultName         = "newVault";
    //         const vaultConfig       = 1; // vault config - RWA type
    //         const depositorsConfig  = "any";    

    //         const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
    //             baker.pkh,              // delegate to
    //             vaultConfig,
    //             loanTokenName,          // loan token type
    //             vaultName,              // vault name
    //             null,                   // collateral tokens
    //             depositorsConfig        // depositors config type - any / whitelist
    //         ).send();
    //         await userCreatesNewVaultOperation.confirmation();

    //         const vaultHandle = {
    //             "id"    : vaultId,
    //             "owner" : vaultOwner
    //         };
    //         vaultRecord = await lendingControllerStorage.vaults.get(vaultHandle);
    //         const vaultAddress   = vaultRecord.address;
    //         const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

    //         // console.log('   - vault originated: ' + vaultAddress);
    //         // console.log('   - vault id: ' + vaultId);

    //         // push new vault id to vault set
    //         eveVaultSet.push(vaultId);


    //         // ----------------------------------------------------------------------------------------------
    //         // Deposit Collateral into Vault
    //         // ----------------------------------------------------------------------------------------------


    //         const usdtDepositAmount     = 10000000;      // 10 Mock FA12 Tokens - USD $15.00
    //         const eurtDepositAmount     = 10000000;      // 10 Mock FA12 Tokens - USD $35.00
    //         const mavDepositAmount      = 10000000;      // 10 Mav - USD $18.00
    //         const mvnDepositAmount      = 10000000000;   // 10 MVN - USD $10.00
    
    //         // Total: $78.00
    
    //         // ---------------------------------
    //         // Deposit Mock FA12 Tokens
    //         // ---------------------------------
    
    //         // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
    //         // reset token allowance
    //         resetTokenAllowance = await usdtTokenInstance.methods.approve(
    //             vaultAddress,
    //             0
    //         ).send();
    //         await resetTokenAllowance.confirmation();
    
    //         // set new token allowance
    //         setNewTokenAllowance = await usdtTokenInstance.methods.approve(
    //             vaultAddress,
    //             usdtDepositAmount
    //         ).send();
    //         await setNewTokenAllowance.confirmation();
    
    //         // eve deposits mock FA12 tokens into vault
    //         const eveDepositMockFa12TokenOperation  = await vaultInstance.methods.initVaultAction(
    //             "deposit",
    //             usdtDepositAmount,           
    //             "usdt"
    //         ).send();
    //         await eveDepositMockFa12TokenOperation.confirmation();
    
    //         // ---------------------------------
    //         // Deposit Mock FA2 Tokens
    //         // ---------------------------------
    
    //         // eve sets operator for lending controller
    //         updateOperatorsOperation = await updateOperators(eurtTokenInstance, vaultOwner, vaultAddress, tokenId);
    //         await updateOperatorsOperation.confirmation();
    
    //         // eve deposits mock FA2 tokens into vault
    //         const eveDepositMockFa2TokenOperation  = await vaultInstance.methods.initVaultAction(
    //             "deposit",
    //             eurtDepositAmount,           
    //             "eurt"
    //         ).send();
    //         await eveDepositMockFa2TokenOperation.confirmation();
    
    //         // ---------------------------------
    //         // Deposit Mav
    //         // ---------------------------------
    
    //         const eveDepositMavOperation  = await vaultInstance.methods.initVaultAction(
    //             "deposit",
    //             mavDepositAmount,  // amt
    //             "mav"              // token
    //         ).send({ mumav : true, amount : mavDepositAmount });
    //         await eveDepositMavOperation.confirmation();
    
    //         // ---------------------------------
    //         // Deposit Staked MVN
    //         // ---------------------------------

    //         const stakedTokenName = "smvn";

    //         // eve set doorman as operator for vault
    //         updateOperatorsOperation = await vaultInstance.methods.initVaultAction(
    //             "updateTokenOperators",
    //             stakedTokenName,
    //             [
    //                 {
    //                     add_operator: {
    //                         owner: vaultAddress,
    //                         operator: contractDeployments.doorman.address,
    //                         token_id: 0,
    //                     },
    //                 }
    //             ]
    //         ).send();
    //         await updateOperatorsOperation.confirmation();
    
    //         // vault staked mvn operation
    //         const eveVaultDepositStakedTokenOperation  = await lendingControllerInstance.methods.vaultDepositStakedToken(
    //             stakedTokenName,
    //             vaultId,                 
    //             mvnDepositAmount                            
    //         ).send();
    //         await eveVaultDepositStakedTokenOperation.confirmation();
    
    //         // console.log('   - vault collateral deposited: Mock FA-12 Tokens: ' + usdtDepositAmount + " | Mock FA-2 Tokens: " + usdtDepositAmount + " | Mav: " + mavDepositAmount + " | sMVN: " + mvnDepositAmount);
    

    //         // ----------------------------------------------------------------------------------------------
    //         // Borrow with Vault
    //         // ----------------------------------------------------------------------------------------------


    //         // borrow amount - 5 Mock FA12 Tokens
    //         const borrowAmount = 5000000;   

    //         // borrow operation
    //         const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
    //         await eveBorrowOperation.confirmation();

    //         // console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName);

    //         usdtTokenStorage                    = await usdtTokenInstance.storage();
    //         eurtTokenStorage                     = await eurtTokenInstance.storage();
    //         lendingControllerStorage                = await lendingControllerInstance.storage();
    //         doormanStorage                          = await doormanInstance.storage();

    //         const compoundOperation = await doormanInstance.methods.compound([vaultOwner, vaultAddress]).send();
    //         await compoundOperation.confirmation();

    //         // vault record
    //         vaultRecord                             = await lendingControllerStorage.vaults.get(vaultHandle);
    //         initialVaultLoanOutstandingTotal        = vaultRecord.loanOutstandingTotal;
    //         initialVaultLoanPrincipalTotal          = vaultRecord.loanPrincipalTotal;
    //         initialVaultBorrowIndex                 = vaultRecord.borrowIndex;

    //         // Vault Owner
    //         vaultOwnerMockFa12TokenAccount          = await usdtTokenStorage.ledger.get(vaultOwner);            
    //         vaultOwnerMockFa2TokenAccount           = await eurtTokenStorage.ledger.get(vaultOwner);            
    //         vaultOwnerMavAccount                    = await utils.tezos.tz.getBalance(vaultOwner);
    //         vaultOwnerStakedMvnAccount              = await doormanStorage.userStakeBalanceLedger.get(vaultOwner);

    //         initialVaultOwnerMockFa12TokenBalance   = vaultOwnerMockFa12TokenAccount == undefined ? 0 : vaultOwnerMockFa12TokenAccount.balance.toNumber();
    //         initialVaultOwnerMockFa2TokenBalance    = vaultOwnerMockFa2TokenAccount == undefined ? 0 : vaultOwnerMockFa2TokenAccount.toNumber();
    //         initialVaultOwnerMavBalance             = vaultOwnerMavAccount.toNumber();
    //         initialVaultOwnerStakedMvnBalance       = vaultOwnerStakedMvnAccount == undefined ? 0 : vaultOwnerStakedMvnAccount.balance.toNumber();
            
    //         // ----
    
    //         // Vault 
    //         vaultMockFa12TokenAccount               = await usdtTokenStorage.ledger.get(vaultAddress);            
    //         vaultMockFa2TokenAccount                = await eurtTokenStorage.ledger.get(vaultAddress);            
    //         vaultMavAccount                         = await utils.tezos.tz.getBalance(vaultAddress);
    //         vaultStakedMvnAccount                   = await doormanStorage.userStakeBalanceLedger.get(vaultAddress);

    //         initialVaultMockFa12TokenBalance        = vaultMockFa12TokenAccount == undefined ? 0 : vaultMockFa12TokenAccount.balance.toNumber();
    //         initialVaultMockFa2TokenBalance         = vaultMockFa2TokenAccount == undefined ? 0 : vaultMockFa2TokenAccount.toNumber();
    //         initialVaultMavBalance                  = vaultMavAccount.toNumber();
    //         initialVaultStakedMvnBalance            = vaultStakedMvnAccount == undefined ? 0 : vaultStakedMvnAccount.balance.toNumber();

            
    //         // ----------------------------------------------------------------------------------------------
    //         // Set Block Levels For Mock Time Test - 1 month
    //         // ----------------------------------------------------------------------------------------------


    //         await signerFactory(tezos, bob.sk); // temporarily set to tester to increase block levels

    //         lendingControllerStorage    = await lendingControllerInstance.storage();
    //         vaultRecord                 = await lendingControllerStorage.vaults.get(vaultHandle);
    //         lastUpdatedBlockLevel       = vaultRecord.lastUpdatedBlockLevel;

    //         const monthsPassed  = 1; 
    //         mockLevelChange = monthsPassed * oneMonthLevelBlocks;
    //         newMockLevel = lastUpdatedBlockLevel.toNumber() + mockLevelChange;

    //         let setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(
    //             [
    //                 {
    //                     configName: "mockLevel",
    //                     newValue: newMockLevel
    //                 },
    //             ]
    //         ).send();
    //         await setMockLevelOperation.confirmation();

    //         lendingControllerStorage = await lendingControllerInstance.storage();
    //         currentMockLevel = lendingControllerStorage.config.mockLevel;

    //         assert.equal(currentMockLevel, newMockLevel);

    //         // console.log('   - time set to ' + monthsPassed + ' months ahead: ' + lastUpdatedBlockLevel + ' to ' + newMockLevel + ' | Changed by: ' + mockLevelChange);


    //         // ----------------------------------------------------------------------------------------------
    //         // Calculate new loan outstanding with accrued interest
    //         // ----------------------------------------------------------------------------------------------


    //         await signerFactory(tezos, eve.sk); // mallory as liquidator

    //         lendingControllerStorage   = await lendingControllerInstance.storage();
    //         vaultRecord                = await lendingControllerStorage.vaults.get(vaultHandle);

    //         // vault record
    //         vaultRecord                 = await lendingControllerStorage.vaults.get(vaultHandle);
    //         vaultLoanOutstandingTotal   = vaultRecord.loanOutstandingTotal;
    //         vaultLoanPrincipalTotal     = vaultRecord.loanPrincipalTotal;
    //         vaultLoanInterestTotal      = vaultRecord.loanInterestTotal;
    //         vaultBorrowIndex            = vaultRecord.borrowIndex;

    //         // loan token record
    //         loanTokenRecord             = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
    //         updatedLoanTokenBorrowIndex = loanTokenRecord.borrowIndex;

    //         // vault calculations
    //         loanOutstandingWithAccruedInterest      = lendingHelper.calculateAccruedInterest(initialVaultLoanOutstandingTotal, initialVaultBorrowIndex, updatedLoanTokenBorrowIndex);
    //         totalInterest                           = initialVaultLoanPrincipalTotal.toNumber() > loanOutstandingWithAccruedInterest ? 0 :  loanOutstandingWithAccruedInterest - initialVaultLoanPrincipalTotal.toNumber();

    //         // check that calculations are correct - use of almostEqual as there may be a slight difference of 1 from rounding errors 
    //         assert.equal(almostEqual(vaultLoanOutstandingTotal, loanOutstandingWithAccruedInterest, 0.0001), true);
    //         assert.equal(almostEqual(vaultLoanInterestTotal, totalInterest, 0.0001), true);
            
    //         // ----------------------------------------------------------------------------------------------
    //         // Fail test to close vault if there is still loan outstanding
    //         // ----------------------------------------------------------------------------------------------


    //         const failCloseVaultOperation = await lendingControllerInstance.methods.closeVault(vaultId);
    //         await chai.expect(failCloseVaultOperation.send()).to.be.rejected;    


    //         // ----------------------------------------------------------------------------------------------
    //         // Repay all loans and test refund
    //         // ----------------------------------------------------------------------------------------------


    //         // repayment amount - set greater than loan outstanding to test refund
    //         const overflowRefundAmount = 1000000; // 1 Mock FA-2 Token
    //         const repayAmount          = loanOutstandingWithAccruedInterest + overflowRefundAmount; 

    //         // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
    //         // reset token allowance
    //         resetTokenAllowance = await usdtTokenInstance.methods.approve(
    //             lendingControllerAddress,
    //             0
    //         ).send();
    //         await resetTokenAllowance.confirmation();

    //         // set new token allowance
    //         setNewTokenAllowance = await usdtTokenInstance.methods.approve(
    //             lendingControllerAddress,
    //             repayAmount
    //         ).send();
    //         await setNewTokenAllowance.confirmation();

    //         // repay operation
    //         const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, vaultOwner, repayAmount).send();
    //         await eveRepayOperation.confirmation();

    //         // console.log('   - repaid: ' + repayAmount + " | type: " + loanTokenName);

    //         // update storage
    //         usdtTokenStorage     = await usdtTokenInstance.storage();
    //         eurtTokenStorage      = await eurtTokenInstance.storage();
    //         lendingControllerStorage = await lendingControllerInstance.storage();
    //         doormanStorage           = await doormanInstance.storage();

    //         // vault record
    //         vaultRecord                 = await lendingControllerStorage.vaults.get(vaultHandle);
    //         vaultLoanOutstandingTotal   = vaultRecord.loanOutstandingTotal;
    //         vaultLoanPrincipalTotal     = vaultRecord.loanPrincipalTotal;
    //         vaultLoanInterestTotal      = vaultRecord.loanInterestTotal;
    //         vaultBorrowIndex            = vaultRecord.borrowIndex;

    //         // loan token record
    //         loanTokenRecord              = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
    //         updatedLoanTokenBorrowIndex  = loanTokenRecord.borrowIndex;
            
    //         // check that vault borrow index is equal to loan token borrow index
    //         assert.equal(vaultBorrowIndex.toNumber(), updatedLoanTokenBorrowIndex.toNumber());


    //         // check if repayAmount covers whole or partial of total interest 
    //         loanOutstandingWithAccruedInterest      = lendingHelper.calculateAccruedInterest(initialVaultLoanOutstandingTotal, initialVaultBorrowIndex, updatedLoanTokenBorrowIndex);
    //         totalInterest                           = initialVaultLoanPrincipalTotal.toNumber() > loanOutstandingWithAccruedInterest ? 0 :  loanOutstandingWithAccruedInterest - initialVaultLoanPrincipalTotal.toNumber();
    //         totalInterestPaid                       = lendingHelper.calculateTotalInterestPaid(repayAmount, vaultLoanInterestTotal);
    //         remainingInterest                       = lendingHelper.calculateRemainingInterest(repayAmount, totalInterest);

    //         finalLoanOutstandingTotal               = lendingHelper.calculateFinalLoanOutstandingTotal(repayAmount, loanOutstandingWithAccruedInterest);
    //         finalLoanPrincipalTotal                 = lendingHelper.calculateFinalLoanPrincipalTotal(repayAmount, loanOutstandingWithAccruedInterest, remainingInterest, initialVaultLoanPrincipalTotal);
    //         finalLoanInterestTotal                  = lendingHelper.calculateFinalLoanInterestTotal(remainingInterest);


    //         // check that calculations are correct and that loans are now 0
    //         assert.equal(vaultLoanOutstandingTotal, finalLoanOutstandingTotal);
    //         assert.equal(vaultLoanOutstandingTotal, 0);

    //         assert.equal(vaultLoanPrincipalTotal, finalLoanPrincipalTotal);
    //         assert.equal(vaultLoanPrincipalTotal, 0);

    //         assert.equal(vaultLoanInterestTotal, finalLoanInterestTotal);
    //         assert.equal(vaultLoanInterestTotal, 0);


    //         // Vault Owner
    //         vaultOwnerMockFa12TokenAccount          =  await usdtTokenStorage.ledger.get(vaultOwner);            
    //         vaultOwnerMockFa2TokenAccount           =  await eurtTokenStorage.ledger.get(vaultOwner);            
    //         vaultOwnerMavAccount                    = await utils.tezos.tz.getBalance(vaultOwner);
    //         vaultOwnerStakedMvnAccount              = await doormanStorage.userStakeBalanceLedger.get(vaultOwner);

    //         updatedVaultOwnerMockFa12TokenBalance   = vaultOwnerMockFa12TokenAccount == undefined ? 0 : vaultOwnerMockFa12TokenAccount.balance.toNumber();
    //         updatedVaultOwnerMockFa2TokenBalance    = vaultOwnerMockFa2TokenAccount == undefined ? 0 : vaultOwnerMockFa2TokenAccount.toNumber();
    //         updatedVaultOwnerMavBalance             = vaultOwnerMavAccount.toNumber();
    //         updatedVaultOwnerStakedMvnBalance       = vaultOwnerStakedMvnAccount == undefined ? 0 : vaultOwnerStakedMvnAccount.balance.toNumber();
    
    //         // ----
    
    //         // Vault 
    //         vaultMockFa12TokenAccount               =  await usdtTokenStorage.ledger.get(vaultAddress);            
    //         vaultMockFa2TokenAccount                =  await eurtTokenStorage.ledger.get(vaultAddress);            
    //         vaultMavAccount                         = await utils.tezos.tz.getBalance(vaultAddress);
    //         vaultStakedMvnAccount                   = await doormanStorage.userStakeBalanceLedger.get(vaultAddress);

    //         updatedVaultMockFa12TokenBalance        = vaultMockFa12TokenAccount == undefined ? 0 : vaultMockFa12TokenAccount.balance.toNumber();
    //         updatedVaultMockFa2TokenBalance         = vaultMockFa2TokenAccount == undefined ? 0 : vaultMockFa2TokenAccount.toNumber();
    //         updatedVaultMavBalance                  = vaultMavAccount.toNumber();
    //         updatedVaultStakedMvnBalance            = vaultStakedMvnAccount == undefined ? 0 : vaultStakedMvnAccount.balance.toNumber();
    

    //         // check that repay amount refunds the overflow amount
    //         assert.equal(updatedVaultOwnerMockFa12TokenBalance, initialVaultOwnerMockFa12TokenBalance - loanOutstandingWithAccruedInterest);

    //         // check that there are no changes to vault collateral balance
    //         assert.equal(updatedVaultMockFa12TokenBalance, initialVaultMockFa12TokenBalance);
    //         assert.equal(updatedVaultMockFa2TokenBalance, initialVaultMockFa2TokenBalance);
    //         assert.equal(updatedVaultMavBalance, initialVaultMavBalance);
    //         assert.equal(updatedVaultStakedMvnBalance, initialVaultStakedMvnBalance);

            
    //         // ----------------------------------------------------------------------------------------------
    //         // After repayment of loans - Close vault operation
    //         // ----------------------------------------------------------------------------------------------


    //         // set balances for comparison below
    //         initialVaultOwnerMockFa12TokenBalance = updatedVaultOwnerMockFa12TokenBalance
    //         initialVaultOwnerMockFa2TokenBalance  = updatedVaultOwnerMockFa2TokenBalance
    //         initialVaultOwnerMavBalance           = updatedVaultOwnerMavBalance
    //         initialVaultOwnerStakedMvnBalance     = updatedVaultOwnerStakedMvnBalance

    //         initialVaultMockFa12TokenBalance      = updatedVaultMockFa12TokenBalance
    //         initialVaultMockFa2TokenBalance       = updatedVaultMockFa2TokenBalance
    //         initialVaultMavBalance                = updatedVaultMavBalance
    //         initialVaultStakedMvnBalance          = updatedVaultStakedMvnBalance


    //         // update storage
    //         usdtTokenStorage         = await usdtTokenInstance.storage();
    //         eurtTokenStorage         = await eurtTokenInstance.storage();
    //         lendingControllerStorage = await lendingControllerInstance.storage();
    //         doormanStorage           = await doormanInstance.storage();
    //         vaultRecord              = await lendingControllerStorage.vaults.get(vaultHandle);


    //         // get remaining collateral token balance in vault 
    //         const remainingMockFa12CollateralBalance    = await vaultRecord.collateralBalanceLedger.get('usdt');
    //         const remainingMockFa2CollateralBalance     = await vaultRecord.collateralBalanceLedger.get('eurt');
    //         const remainingMavCollateralBalance         = await vaultRecord.collateralBalanceLedger.get('mav');
    //         const remainingStakedMvnCollateralBalance   = await vaultRecord.collateralBalanceLedger.get("smvn");
            
    //         // console.log('   - remaining collateral: Mock FA12 token: ' + remainingMockFa12CollateralBalance + ' | Mock FA2 token: ' + remainingMockFa2CollateralBalance + ' | Mav: ' + remainingMavCollateralBalance + ' | Staked MVN: ' + remainingStakedMvnCollateralBalance);

    //         // close vault operation
    //         const closeVaultOperation = await lendingControllerInstance.methods.closeVault(vaultId).send();
    //         await closeVaultOperation.confirmation();
    //         // console.log('   - close vault id: ' + vaultId);

    //         // Vault Owner
    //         vaultOwnerMockFa12TokenAccount          =  await usdtTokenStorage.ledger.get(vaultOwner);            
    //         vaultOwnerMockFa2TokenAccount           =  await eurtTokenStorage.ledger.get(vaultOwner);            
    //         vaultOwnerMavAccount                    = await utils.tezos.tz.getBalance(vaultOwner);
    //         vaultOwnerStakedMvnAccount              = await doormanStorage.userStakeBalanceLedger.get(vaultOwner);

    //         updatedVaultOwnerMockFa12TokenBalance   = vaultOwnerMockFa12TokenAccount == undefined ? 0 : vaultOwnerMockFa12TokenAccount.balance.toNumber();
    //         updatedVaultOwnerMockFa2TokenBalance    = vaultOwnerMockFa2TokenAccount == undefined ? 0 : vaultOwnerMockFa2TokenAccount.toNumber();
    //         updatedVaultOwnerMavBalance             = vaultOwnerMavAccount.toNumber();
    //         updatedVaultOwnerStakedMvnBalance       = vaultOwnerStakedMvnAccount == undefined ? 0 : vaultOwnerStakedMvnAccount.balance.toNumber();
    

    //         // check that vault owner receives the remaining collateral balances
    //         assert.equal(updatedVaultOwnerMockFa12TokenBalance  , initialVaultOwnerMockFa12TokenBalance  + remainingMockFa12CollateralBalance.toNumber());
    //         assert.equal(updatedVaultOwnerMockFa2TokenBalance   , initialVaultOwnerMockFa2TokenBalance   + remainingMockFa2CollateralBalance.toNumber());
    //         assert.equal(updatedVaultOwnerStakedMvnBalance      , initialVaultOwnerStakedMvnBalance      + remainingStakedMvnCollateralBalance.toNumber());
    //         // account for minor difference from gas cost to transact operation
    //         assert.equal(almostEqual(updatedVaultOwnerMavBalance  , initialVaultOwnerMavBalance          + remainingMavCollateralBalance.toNumber(), 0.0001), true);

    //         // update storage
    //         lendingControllerStorage   = await lendingControllerInstance.storage();
    //         vaultRecord                = await lendingControllerStorage.vaults.get(vaultHandle);

    //         // check that vault has been removed, and is now undefined
    //         assert.equal(vaultRecord, undefined);

    //     })

    // })

});


// ----------------------
//
// CONSOLE LOGS 
// - for convenience if required to copy/paste
//
// ----------------------


    // ----------------------
    // CHANGES IN BALANCES
    // ----------------------

    // console.log("---");
    // console.log("vault owner");
    // console.log("-");

    // console.log("initialVaultOwnerMockFa12TokenBalance: "+ initialVaultOwnerMockFa12TokenBalance);
    // console.log("updatedVaultOwnerMockFa12TokenBalance: "+ updatedVaultOwnerMockFa12TokenBalance);
    // console.log("change: "+ (updatedVaultOwnerMockFa12TokenBalance - initialVaultOwnerMockFa12TokenBalance));

    // console.log("-");

    // console.log("initialVaultOwnerMockFa2TokenBalance: "+ initialVaultOwnerMockFa2TokenBalance);
    // console.log("updatedVaultOwnerMockFa2TokenBalance: "+ updatedVaultOwnerMockFa2TokenBalance);
    // console.log("change: "+ (updatedVaultOwnerMockFa2TokenBalance - initialVaultOwnerMockFa2TokenBalance));

    // console.log("-");

    // console.log("initialVaultOwnerMavBalance: "+ initialVaultOwnerMavBalance);
    // console.log("updatedVaultOwnerMavBalance: "+ updatedVaultOwnerMavBalance);
    // console.log("change: "+ (updatedVaultOwnerMavBalance - initialVaultOwnerMavBalance));

    // console.log("-");

    // console.log("initialVaultOwnerStakedMvnBalance: "+ initialVaultOwnerStakedMvnBalance);
    // console.log("updatedVaultOwnerStakedMvnBalance: "+ updatedVaultOwnerStakedMvnBalance);
    // console.log("change: "+ (updatedVaultOwnerStakedMvnBalance - initialVaultOwnerStakedMvnBalance));
    // console.log("---");


    // console.log("");


    // console.log("---");
    // console.log("vault");
    // console.log("-");

    // console.log("initialVaultMockFa12TokenBalance: "+ initialVaultMockFa12TokenBalance);
    // console.log("updatedVaultMockFa12TokenBalance: "+ updatedVaultMockFa12TokenBalance);
    // console.log("change: "+ (updatedVaultMockFa12TokenBalance - initialVaultMockFa12TokenBalance));

    // console.log("-");

    // console.log("initialVaultMockFa2TokenBalance: "+ initialVaultMockFa2TokenBalance);
    // console.log("updatedVaultMockFa2TokenBalance: "+ updatedVaultMockFa2TokenBalance);
    // console.log("change: "+ (updatedVaultMockFa2TokenBalance - initialVaultMockFa2TokenBalance));

    // console.log("-");

    // console.log("initialVaultMavBalance: "+ initialVaultMavBalance);
    // console.log("updatedVaultMavBalance: "+ updatedVaultMavBalance);
    // console.log("change: "+ (updatedVaultMavBalance - initialVaultMavBalance));

    // console.log("-");

    // console.log("initialVaultStakedMvnBalance: "+ initialVaultStakedMvnBalance);
    // console.log("updatedVaultStakedMvnBalance: "+ updatedVaultStakedMvnBalance);
    // console.log("change: "+ (updatedVaultStakedMvnBalance - initialVaultStakedMvnBalance));

    // console.log("---");


    // console.log("");


    // console.log("---");
    // console.log("liquidator");
    // console.log("-");

    // console.log("initialLiquidatorMockFa12TokenBalance: "+ initialLiquidatorMockFa12TokenBalance);
    // console.log("updatedLiquidatorMockFa12TokenBalance: "+ updatedLiquidatorMockFa12TokenBalance);
    // console.log("change: "+ (updatedLiquidatorMockFa12TokenBalance - initialLiquidatorMockFa12TokenBalance));

    // console.log("-");

    // console.log("initialLiquidatorMockFa2TokenBalance: "+ initialLiquidatorMockFa2TokenBalance);
    // console.log("updatedLiquidatorMockFa2TokenBalance: "+ updatedLiquidatorMockFa2TokenBalance);
    // console.log("change: "+ (updatedLiquidatorMockFa2TokenBalance - initialLiquidatorMockFa2TokenBalance));

    // console.log("-");

    // console.log("initialLiquidatorMavBalance: "+ initialLiquidatorMavBalance);
    // console.log("updatedLiquidatorMavBalance: "+ updatedLiquidatorMavBalance);
    // console.log("change: "+ (updatedLiquidatorMavBalance - initialLiquidatorMavBalance));

    // console.log("-");

    // console.log("initialLiquidatorStakedMvnBalance: "+ initialLiquidatorStakedMvnBalance);
    // console.log("updatedLiquidatorStakedMvnBalance: "+ updatedLiquidatorStakedMvnBalance);
    // console.log("change: "+ (updatedLiquidatorStakedMvnBalance - initialLiquidatorStakedMvnBalance));
    // console.log("---");


    // console.log("");


    // console.log("---");
    // console.log("treasury");
    // console.log("---");

    // console.log("initialTreasuryMockFa12TokenBalance: "+ initialTreasuryMockFa12TokenBalance);
    // console.log("updatedTreasuryMockFa12TokenBalance: "+ updatedTreasuryMockFa12TokenBalance);
    // console.log("change: "+ (updatedTreasuryMockFa12TokenBalance - initialTreasuryMockFa12TokenBalance));

    // console.log("-");

    // console.log("initialTreasuryMockFa2TokenBalance: "+ initialTreasuryMockFa2TokenBalance);
    // console.log("updatedTreasuryMockFa2TokenBalance: "+ updatedTreasuryMockFa2TokenBalance);
    // console.log("change: "+ (updatedTreasuryMockFa2TokenBalance - initialTreasuryMockFa2TokenBalance));

    // console.log("-");

    // console.log("initialTreasuryMavBalance: "+ initialTreasuryMavBalance);
    // console.log("updatedTreasuryMavBalance: "+ updatedTreasuryMavBalance);
    // console.log("change: "+ (updatedTreasuryMavBalance - initialTreasuryMavBalance));

    // console.log("-");

    // console.log("initialTreasuryStakedMvnBalance: "+ initialTreasuryStakedMvnBalance);
    // console.log("updatedTreasuryStakedMvnBalance: "+ updatedTreasuryStakedMvnBalance);
    // console.log("change: "+ (updatedTreasuryStakedMvnBalance - initialTreasuryStakedMvnBalance));

    // console.log("---");

    // console.log("");


    // console.log("---");
    // console.log("lending controller");
    // console.log("-");

    // console.log("initialLendingControllerMockFa12TokenBalance: "+ initialLendingControllerMockFa12TokenBalance);
    // console.log("updatedLendingControllerMockFa12TokenBalance: "+ updatedLendingControllerMockFa12TokenBalance);
    // console.log("change: "+ (updatedLendingControllerMockFa12TokenBalance - initialLendingControllerMockFa12TokenBalance));

    // console.log("-");

    // console.log("initialLendingControllerMockFa2TokenBalance: "+ initialLendingControllerMockFa2TokenBalance);
    // console.log("updatedLendingControllerMockFa2TokenBalance: "+ updatedLendingControllerMockFa2TokenBalance);
    // console.log("change: "+ (updatedLendingControllerMockFa2TokenBalance - initialLendingControllerMockFa2TokenBalance));

    // console.log("-");

    // console.log("initialLendingControllerMavBalance: "+ initialLendingControllerMavBalance);
    // console.log("updatedLendingControllerMavBalance: "+ updatedLendingControllerMavBalance);
    // console.log("change: "+ (updatedLendingControllerMavBalance - initialLendingControllerMavBalance));

    // console.log("---");


    // ----------------------
    // LOANS
    // ----------------------


    // console.log('----')
    // console.log("loanOutstandingWithAccruedInterest: "   + loanOutstandingWithAccruedInterest);
    // console.log('-')
    // console.log("totalInterest: "                        + totalInterest);
    // console.log("remainingInterest: "                    + remainingInterest);
    // console.log("totalInterestPaid: "                    + totalInterestPaid);
    // console.log("interestSentToTreasury: "               + interestSentToTreasury);
    // console.log("interestRewards: "                      + interestRewards);
    // console.log('-')
    // console.log("finalLoanOutstandingTotal: "            + finalLoanOutstandingTotal);
    // console.log("finalLoanPrincipalTotal: "              + finalLoanPrincipalTotal);
    // console.log("finalLoanInterestTotal: "               + finalLoanInterestTotal);
    // console.log('----')


    // ----------------------
    // LIQUIDATION AMOUNTS
    // ----------------------

    // console.log('final liquidation amounts');
            
    // console.log('')
    // console.log('totalLiquidationAmount: '       + totalLiquidationAmount ); 
    
    // console.log('')
    // console.log('admin liquidation amounts');
    // console.log('adminLiquidationFeeMockFa12: '  + adminLiquidationFeeMockFa12 ); 
    // console.log('adminLiquidationFeeMockFa2: '   + adminLiquidationFeeMockFa2 ); 
    // console.log('adminLiquidationFeeMav: '       + adminLiquidationFeeMav ); 
    // console.log('adminLiquidationFeeMvn: '       + adminLiquidationFeeMvn ); 

    // console.log('')
    // console.log('liquidation amounts with incentive');
    // console.log('liquidationAmountWithIncentiveMockFa12: '   + liquidationAmountWithIncentiveMockFa12 ); 
    // console.log('liquidationAmountWithIncentiveMockFa2: '    + liquidationAmountWithIncentiveMockFa2 ); 
    // console.log('liquidationAmountWithIncentiveMav: '        + liquidationAmountWithIncentiveMav ); 
    // console.log('liquidationAmountWithIncentiveMvn: '        + liquidationAmountWithIncentiveMvn ); 

    // console.log('')
    // console.log('liquidation amounts with fees and incentive');
    // console.log('liquidationAmountWithFeesAndIncentiveMockFa12: '    + liquidationAmountWithFeesAndIncentiveMockFa12 ); 
    // console.log('liquidationAmountWithFeesAndIncentiveMockFa2: '     + liquidationAmountWithFeesAndIncentiveMockFa2 ); 
    // console.log('liquidationAmountWithFeesAndIncentiveMav: '         + liquidationAmountWithFeesAndIncentiveMav ); 
    // console.log('liquidationAmountWithFeesAndIncentiveMvn: '         + liquidationAmountWithFeesAndIncentiveMvn ); 

    // console.log('')
    // console.log('total liquidation amounts');
    // console.log('totalLiquidationAmountMockFa12: '   + totalLiquidationAmountMockFa12 ); 
    // console.log('totalLiquidationAmountMockFa2: '    + totalLiquidationAmountMockFa2 ); 
    // console.log('totalLiquidationAmountMav: '        + totalLiquidationAmountMav ); 
    // console.log('totalLiquidationAmountMvn: '        + totalLiquidationAmountMvn );
