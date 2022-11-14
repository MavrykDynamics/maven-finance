// const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
// const { InMemorySigner, importKey } = require("@taquito/signer");
// import assert, { ok, rejects, strictEqual } from "assert";
// import { Utils, zeroAddress, TEZ } from "./helpers/Utils";
// import fs from "fs";
// import { confirmOperation } from "../scripts/confirmation";
// import * as lendingHelper from "./helpers/lendingHelpers"

// const chai = require("chai");
// const chaiAsPromised = require('chai-as-promised');
// chai.use(chaiAsPromised);   
// chai.should();

// import env from "../env";
// import { alice, bob, eve, mallory } from "../scripts/sandbox/accounts";

// import doormanAddress           from '../deployments/doormanAddress.json';
// import delegationAddress        from '../deployments/delegationAddress.json';
// import mvkTokenAddress          from '../deployments/mvkTokenAddress.json';
// import treasuryAddress          from '../deployments/treasuryAddress.json';
// import governanceAddress        from '../deployments/governanceAddress.json';
// import governanceProxyAddress   from '../deployments/governanceProxyAddress.json';
// import mockFa12TokenAddress     from '../deployments/mavrykFa12TokenAddress.json';
// import mockFa2TokenAddress      from '../deployments/mavrykFa2TokenAddress.json';

// import mockUsdMockFa12TokenAggregatorAddress    from "../deployments/mockUsdMockFa12TokenAggregatorAddress.json";
// import mockUsdMockFa2TokenAggregatorAddress     from "../deployments/mockUsdMockFa2TokenAggregatorAddress.json";
// import mockUsdXtzAggregatorAddress              from "../deployments/mockUsdXtzAggregatorAddress.json";
// import mockUsdMvkAggregatorAddress              from "../deployments/mockUsdMvkAggregatorAddress.json";

// import lpTokenPoolMockFa12TokenAddress  from "../deployments/lpTokenPoolMockFa12TokenAddress.json";
// import lpTokenPoolMockFa2TokenAddress   from "../deployments/lpTokenPoolMockFa2TokenAddress.json";
// import lpTokenPoolXtzAddress            from "../deployments/lpTokenPoolXtzAddress.json";

// import lendingControllerAddress         from '../deployments/lendingControllerMockTimeAddress.json';
// import lendingControllerMockTimeAddress from '../deployments/lendingControllerMockTimeAddress.json';

// import vaultFactoryAddress              from '../deployments/vaultFactoryAddress.json';
// import { vaultStorageType }             from "./types/vaultStorageType"

// describe("Lending Controller (mToken) tests", async () => {
    
//     var utils: Utils

//     //  - eve: first vault loan token: mockFa12, second vault loan token: mockFa2, third vault loan token - tez
//     //  - mallory: first vault loan token: mockFa12, second vault loan token: mockFa2
//     var eveVaultSet = []
//     var malloryVaultSet = [] 

//     // const oneDayLevelBlocks = 4320
//     // const oneMonthLevelBlocks = 129600
//     // const oneYearLevelBlocks = 1576800

//     // 3 seconds blocks (docker sandbox)
//     const oneMinuteLevelBlocks  = 20
//     const oneDayLevelBlocks     = 28800
//     const oneMonthLevelBlocks   = 864000
//     const oneYearLevelBlocks    = 10512000 // 365 days

//     const secondsInYears = 31536000
//     const fixedPointAccuracy = 10**27
    
//     // oracles
//     let tokenOracles : {name : string, price : number, priceDecimals : number, tokenDecimals : number}[] = []
//     let defaultObservations
//     let defaultPriceObservations

//     let mockFa12TokenIndex
//     let mockFa2TokenIndex
//     let tezIndex
//     let mvkIndex

//     // if required to check temp variables from internal smart contract computations
//     let tempMap 

//     // ------------------------------------------------
//     //  Contract Instances
//     // ------------------------------------------------

//     let doormanInstance
//     let delegationInstance
//     let mvkTokenInstance
//     let treasuryInstance
//     // let tokenPoolRewardInstance
    
//     let mockFa12TokenInstance
//     let mockFa2TokenInstance

//     let mockUsdMockFa12TokenAggregatorInstance
//     let mockUsdMockFa2TokenAggregatorInstance
//     let mockUsdXtzAggregatorInstance
//     let mockUsdMvkAggregatorInstance

//     let lpTokenPoolMockFa12TokenInstance
//     let lpTokenPoolMockFa2TokenInstance
//     let lpTokenPoolXtzInstance

//     let governanceInstance
//     let governanceProxyInstance

//     let lendingControllerInstance
//     let vaultFactoryInstance

//     // ------------------------------------------------
//     //  Contract Storages
//     // ------------------------------------------------

//     let doormanStorage
//     let delegationStorage
//     let mvkTokenStorage
//     let treasuryStorage
//     // let tokenPoolRewardStorage

//     let mockFa12TokenStorage
//     let mockFa2TokenStorage
//     let governanceStorage
//     let governanceProxyStorage

//     let mockUsdMockFa12TokenAggregatorStorage
//     let mockUsdMockFa2TokenAggregatorStorage
//     let mockUsdXtzAggregatorStorage
//     let mockUsdMvkAggregatorStorage

//     let lendingControllerStorage
//     let vaultFactoryStorage

//     // ------------------------------------------------
//     //  Test Variables
//     // ------------------------------------------------

//     // mock levels, rounds, and epochs
//     let epoch 
//     let lastEpoch 
//     let round
//     let currentMockLevel      
//     let newMockLevel
//     let mockLevelChange
//     let markedForLiquidationLevel
//     let minutesPassed
//     let lastUpdatedBlockLevel
//     let maxDecimals

//     // operations
//     let setPriceOperation
//     let resetTokenAllowance
//     let setNewTokenAllowance
//     let updateOperatorsOperation
//     let liquidateVaultOperation
//     let failLiquidateVaultOperation
//     let updateTokenRewardIndexOperation

//     // vault
//     let vaultRecord
//     let vaultLoanOutstandingTotal
//     let vaultLoanPrincipalTotal
//     let vaultLoanInterestTotal
//     let vaultBorrowIndex
    
//     // vault initial variables
//     let initialVaultBorrowIndex
//     let initialVaultLoanOutstandingTotal
//     let initialVaultLoanPrincipalTotal
//     let initialVaultLoanInterestTotal

//     // vault updated variables
//     let updatedVaultBorrowIndex
//     let updatedVaultLoanOutstandingTotal

//     // vault loan variables
//     let finalLoanOutstandingTotal
//     let finalLoanPrincipalTotal
//     let finalLoanInterestTotal
//     let loanOutstandingWithAccruedInterest
//     let totalInterest
//     let remainingInterest

//     // loan token variables
//     let loanTokenRecord
//     let loanTokenDecimals
//     let loanTokenBorrowIndex
//     let initialLoanTokenBorrowIndex
//     let updatedLoanTokenBorrowIndex

//     // liquidation variables
//     let vaultMaxLiquidationAmount
//     let totalInterestPaid
//     let liquidationIncentive
    
//     let liquidationAmountWithFeesAndIncentive
//     let liquidationAmountWithFeesAndIncentiveMockFa12
//     let liquidationAmountWithFeesAndIncentiveMockFa2 
//     let liquidationAmountWithFeesAndIncentiveTez
//     let liquidationAmountWithFeesAndIncentiveMvk

//     let totalLiquidationAmount
//     let totalLiquidationAmountMockFa12
//     let totalLiquidationAmountMockFa2 
//     let totalLiquidationAmountTez
//     let totalLiquidationAmountMvk

//     let liquidationAmountWithIncentive
//     let liquidationAmountWithIncentiveMockFa12
//     let liquidationAmountWithIncentiveMockFa2
//     let liquidationAmountWithIncentiveTez
//     let liquidationAmountWithIncentiveMvk

//     let adminLiquidationFee
//     let adminLiquidationFeeMockFa12
//     let adminLiquidationFeeMockFa2
//     let adminLiquidationFeeTez
//     let adminLiquidationFeeMvk

//     let interestSentToTreasury
//     let interestRewards

//     // ------------------------------------------------
//     // Token accounts (ledger) for Lending Controller (i.e. token pool)
//     let lendingControllerMockFa12TokenAccount
//     let lendingControllerMockFa2TokenAccount
//     let lendingControllerTezAccount

//     // Token accounts (ledger) for Liquidator
//     let liquidatorMockFa12TokenAccount
//     let liquidatorMockFa2TokenAccount
//     let liquidatorTezAccount
//     let liquidatorStakedMvkAccount

//     // Token accounts (ledger) for vaults
//     let vaultMockFa12TokenAccount
//     let vaultMockFa2TokenAccount
//     let vaultTezAccount
//     let vaultStakedMvkAccount

//     // Token accounts (ledger) for vault owners
//     let vaultOwnerMockFa12TokenAccount
//     let vaultOwnerMockFa2TokenAccount
//     let vaultOwnerTezAccount
//     let vaultOwnerStakedMvkAccount

//     // Token accounts (ledger) for admin treasury
//     let treasuryMockFa12TokenAccount
//     let treasuryMockFa2TokenAccount
//     let treasuryTezAccount
//     let treasuryStakedMvkAccount
//     // ------------------------------------------------


//     // ------------------------------------------------
//     // Mock FA-12 Token balances (initial and updated)
//     // ------------------------------------------------
    
//     // Initial token balances for Mock FA-12 Token
//     let initialLendingControllerMockFa12TokenBalance
//     let initialVaultMockFa12TokenBalance
//     let initialVaultOwnerMockFa12TokenBalance
//     let initialLiquidatorMockFa12TokenBalance
//     let initialTreasuryMockFa12TokenBalance

//     // Updated token balances for Mock FA-12 Token
//     let updatedLendingControllerMockFa12TokenBalance
//     let updatedVaultMockFa12TokenBalance
//     let updatedVaultOwnerMockFa12TokenBalance
//     let updatedLiquidatorMockFa12TokenBalance
//     let updatedTreasuryMockFa12TokenBalance

//     // ------------------------------------------------


//     // ------------------------------------------------
//     // Mock FA-2 Token balances (initial and updated)
//     // ------------------------------------------------
    
//     // Initial token balances for Mock FA-2 Token
//     let initialLendingControllerMockFa2TokenBalance
//     let initialVaultMockFa2TokenBalance
//     let initialVaultOwnerMockFa2TokenBalance
//     let initialLiquidatorMockFa2TokenBalance
//     let initialTreasuryMockFa2TokenBalance

//     // Updated token balances for Mock FA-2 Tokens
//     let updatedLendingControllerMockFa2TokenBalance
//     let updatedVaultOwnerMockFa2TokenBalance
//     let updatedVaultMockFa2TokenBalance
//     let updatedLiquidatorMockFa2TokenBalance
//     let updatedTreasuryMockFa2TokenBalance
//     // ------------------------------------------------

//     // ------------------------------------------------
//     // Tez balances (initial and updated)
//     // ------------------------------------------------
    
//     // Initial token balances for Tez
//     let initialLendingControllerTezBalance
//     let initialVaultTezBalance
//     let initialVaultOwnerTezBalance
//     let initialLiquidatorTezBalance
//     let initialTreasuryTezBalance

//     // Updated token balances for Tez
//     let updatedLendingControllerTezBalance
//     let updatedVaultTezBalance
//     let updatedVaultOwnerTezBalance
//     let updatedLiquidatorTezBalance
//     let updatedTreasuryTezBalance

//     // ------------------------------------------------
//     // Staked MVK balances (initial and updated)
//     // ------------------------------------------------

//     // Initial token balances for staked MVK
//     let initialVaultStakedMvkBalance
//     let initialVaultOwnerStakedMvkBalance
//     let initialLiquidatorStakedMvkBalance
//     let initialTreasuryStakedMvkBalance

//     // Updated token balances for staked MVK
//     let updatedVaultStakedMvkBalance
//     let updatedVaultOwnerStakedMvkBalance
//     let updatedLiquidatorStakedMvkBalance
//     let updatedTreasuryStakedMvkBalance
    
    
//     // Begin Helper Functions

//     const almostEqual = (actual, expected, delta) => {
//         let greaterLimit  = expected + expected * delta
//         let lowerLimit    = expected - expected * delta
//         // console.log("GREATER: ", greaterLimit) 
//         // console.log("LOWER: ", lowerLimit)
//         // console.log("STUDIED: ", actual)
//         return actual <= greaterLimit && actual >= lowerLimit
//     }

//     // End Helper Functions

    
//     const signerFactory = async (pk) => {
//         await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
//         return utils.tezos;
//     };

//     before("setup", async () => {

//         utils = new Utils();
//         await utils.init(bob.sk);
        
//         doormanInstance                         = await utils.tezos.contract.at(doormanAddress.address);
//         delegationInstance                      = await utils.tezos.contract.at(delegationAddress.address);
//         mvkTokenInstance                        = await utils.tezos.contract.at(mvkTokenAddress.address);
//         treasuryInstance                        = await utils.tezos.contract.at(treasuryAddress.address);

//         mockFa12TokenInstance                   = await utils.tezos.contract.at(mockFa12TokenAddress.address);
//         mockFa2TokenInstance                    = await utils.tezos.contract.at(mockFa2TokenAddress.address);
//         governanceInstance                      = await utils.tezos.contract.at(governanceAddress.address);
//         governanceProxyInstance                 = await utils.tezos.contract.at(governanceProxyAddress.address);

//         lpTokenPoolMockFa12TokenInstance        = await utils.tezos.contract.at(lpTokenPoolMockFa12TokenAddress.address);
//         lpTokenPoolMockFa2TokenInstance         = await utils.tezos.contract.at(lpTokenPoolMockFa2TokenAddress.address);
//         lpTokenPoolXtzInstance                  = await utils.tezos.contract.at(lpTokenPoolXtzAddress.address);

//         mockUsdMockFa12TokenAggregatorInstance  = await utils.tezos.contract.at(mockUsdMockFa12TokenAggregatorAddress.address);
//         mockUsdMockFa2TokenAggregatorInstance   = await utils.tezos.contract.at(mockUsdMockFa2TokenAggregatorAddress.address);
//         mockUsdXtzAggregatorInstance            = await utils.tezos.contract.at(mockUsdXtzAggregatorAddress.address);
//         mockUsdMvkAggregatorInstance            = await utils.tezos.contract.at(mockUsdMvkAggregatorAddress.address);

//         lendingControllerInstance               = await utils.tezos.contract.at(lendingControllerMockTimeAddress.address);
//         vaultFactoryInstance                    = await utils.tezos.contract.at(vaultFactoryAddress.address);

//         doormanStorage                          = await doormanInstance.storage();
//         delegationStorage                       = await delegationInstance.storage();
//         mvkTokenStorage                         = await mvkTokenInstance.storage();
//         treasuryStorage                         = await treasuryInstance.storage();

//         mockFa12TokenStorage                    = await mockFa12TokenInstance.storage();
//         mockFa2TokenStorage                     = await mockFa2TokenInstance.storage();
//         governanceStorage                       = await governanceInstance.storage();
//         governanceProxyStorage                  = await governanceInstance.storage();
//         lendingControllerStorage                = await lendingControllerInstance.storage();
//         vaultFactoryStorage                     = await vaultFactoryInstance.storage();

//         // set up token oracles for testing
//         mockUsdMockFa12TokenAggregatorStorage   = await mockUsdMockFa12TokenAggregatorInstance.storage();
//         mockUsdMockFa2TokenAggregatorStorage    = await mockUsdMockFa2TokenAggregatorInstance.storage();
//         mockUsdXtzAggregatorStorage             = await mockUsdXtzAggregatorInstance.storage();
//         mockUsdMvkAggregatorStorage             = await mockUsdMvkAggregatorInstance.storage();

//         tokenOracles.push({
//             'name': 'mockFa12', 
//             'price': mockUsdMockFa12TokenAggregatorStorage.lastCompletedRoundData.data.toNumber(),
//             'priceDecimals': mockUsdMockFa12TokenAggregatorStorage.config.decimals.toNumber(),
//             'tokenDecimals': 0
//         })

//         tokenOracles.push({
//             'name': 'mockFa2', 
//             'price': mockUsdMockFa2TokenAggregatorStorage.lastCompletedRoundData.data.toNumber(),
//             'priceDecimals': mockUsdMockFa2TokenAggregatorStorage.config.decimals.toNumber(),
//             'tokenDecimals': 0
//         })

//         tokenOracles.push({
//             'name': 'tez', 
//             'price': mockUsdXtzAggregatorStorage.lastCompletedRoundData.data.toNumber(),
//             'priceDecimals': mockUsdXtzAggregatorStorage.config.decimals.toNumber(),
//             'tokenDecimals': 0
//         })

//         tokenOracles.push({
//             'name': "smvk", 
//             'price': mockUsdMvkAggregatorStorage.lastCompletedData.data.toNumber(),
//             'priceDecimals': mockUsdMvkAggregatorStorage.config.decimals.toNumber(),
//             'tokenDecimals': 9
//         })


//         console.log('-- -- -- -- -- Lending Controller (Mock Time) Tests -- -- -- --')
//         console.log('Doorman Contract deployed at:'             , doormanInstance.address);
//         console.log('Delegation Contract deployed at:'          , delegationInstance.address);
//         console.log('MVK Token Contract deployed at:'           , mvkTokenInstance.address);
//         console.log('Lending Treasury Contract deployed at:'    , treasuryInstance.address);

//         console.log('Mock FA12 Token Contract deployed at:'     , mockFa12TokenInstance.address);
//         console.log('Mock FA2 Token Contract deployed at:'      , mockFa2TokenInstance.address);
//         console.log('Governance Contract deployed at:'          , governanceInstance.address);
//         console.log('Governance Proxy Contract deployed at:'    , governanceProxyInstance.address);

//         console.log('LP Token Pool (mToken) - Mock FA12 Token - deployed at:'    , lpTokenPoolMockFa12TokenInstance.address);
//         console.log('LP Token Pool (mToken) - Mock FA2 Token - deployed at:'     , lpTokenPoolMockFa2TokenInstance.address);
//         console.log('LP Token Pool (mToken) - XTZ - deployed at:'                , lpTokenPoolXtzInstance.address);

//         console.log('Mock Aggregator - USD / Mock FA12 Token - deployed at:'    , mockUsdMockFa12TokenAggregatorInstance.address);
//         console.log('Mock Aggregator - USD / Mock FA2 Token - deployed at:'     , mockUsdMockFa2TokenAggregatorInstance.address);
//         console.log('Mock Aggregator - USD / XTZ - deployed at:'                , mockUsdXtzAggregatorInstance.address);

//         console.log('Lending Controller Mock Time Contract deployed at:'        , lendingControllerInstance.address);

//         console.log('Alice address: ' + alice.pkh);
//         console.log('Bob address: '   + bob.pkh);
//         console.log('Eve address: '   + eve.pkh);

//         // ------------------------------------------------------------------
//         //
//         // Update LP Tokens (i.e. mTokens) tokenRewardIndex by transferring 0
//         //  - this will ensure that fetching user balances through on-chain views are accurate for continuous re-testing
//         //
//         // ------------------------------------------------------------------
//         await signerFactory(bob.sk);

//         const mockFa12LoanToken = await lendingControllerStorage.loanTokenLedger.get("mockFa12"); 
//         const mockFa2LoanToken  = await lendingControllerStorage.loanTokenLedger.get("mockFa2"); 
//         const tezLoanToken      = await lendingControllerStorage.loanTokenLedger.get("tez"); 
        
//         if(mockFa12LoanToken !== undefined || mockFa12LoanToken !== null){
//             updateTokenRewardIndexOperation = await lpTokenPoolMockFa12TokenInstance.methods.transfer([
//             {
//                 from_: bob.pkh,
//                 txs: [
//                     {
//                         to_: eve.pkh,
//                         token_id: 0,
//                         amount: 0,
//                     },
//                 ]
//             }]).send();
//             await updateTokenRewardIndexOperation.confirmation();
//         }

//         if(mockFa2LoanToken !== undefined || mockFa2LoanToken !== null){
//             updateTokenRewardIndexOperation = await lpTokenPoolMockFa2TokenInstance.methods.transfer([
//             {
//                 from_: bob.pkh,
//                 txs: [
//                     {
//                         to_: eve.pkh,
//                         token_id: 0,
//                         amount: 0,
//                     },
//                 ]
//             }]).send();
//             await updateTokenRewardIndexOperation.confirmation();
//         }

//         if(tezLoanToken !== undefined || tezLoanToken !== null){
//             updateTokenRewardIndexOperation = await lpTokenPoolXtzInstance.methods.transfer([
//             {
//                 from_: bob.pkh,
//                 txs: [
//                     {
//                         to_: eve.pkh,
//                         token_id: 0,
//                         amount: 0,
//                     },
//                 ]
//             }]).send();
//             await updateTokenRewardIndexOperation.confirmation();
//         }

//     });



//     // 
//     // Setup and test Lending Controller SetLoanToken entrypoint
//     //
//     describe('%setLoanToken - setup and test lending controller %setLoanToken entrypoint', function () {

//         it('admin can set mock FA12 as a loan token', async () => {

//             try{        
                
//                 // init variables
//                 await signerFactory(bob.sk);

//                 const setLoanTokenActionType                = "createLoanToken";

//                 const tokenName                             = "mockFa12";
//                 const tokenContractAddress                  = mockFa12TokenAddress.address;
//                 const tokenType                             = "fa12";
//                 const tokenDecimals                         = 6;

//                 const oracleAddress                         = mockUsdMockFa12TokenAggregatorAddress.address;

//                 const lpTokenContractAddress                = lpTokenPoolMockFa12TokenAddress.address;
//                 const lpTokenId                             = 0;

//                 const interestRateDecimals                  = 27;
//                 const reserveRatio                          = 1000; // 10% reserves (4 decimals)
//                 const optimalUtilisationRate                = 50 * (10 ** (interestRateDecimals - 2));  // 30% utilisation rate kink
//                 const baseInterestRate                      = 5  * (10 ** (interestRateDecimals - 2));  // 5%
//                 const maxInterestRate                       = 25 * (10 ** (interestRateDecimals - 2));  // 25% 
//                 const interestRateBelowOptimalUtilisation   = 10 * (10 ** (interestRateDecimals - 2));  // 10% 
//                 const interestRateAboveOptimalUtilisation   = 20 * (10 ** (interestRateDecimals - 2));  // 20%

//                 const minRepaymentAmount                    = 10000;

//                 // update token oracle with token decimals
//                 const mockFa12TokenIndex = tokenOracles.findIndex((o => o.name === "mockFa12"));
//                 tokenOracles[mockFa12TokenIndex].tokenDecimals = tokenDecimals;

//                 // check if loan token exists
//                 const checkLoanTokenExists   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

//                 if(checkLoanTokenExists === undefined){

//                     const adminSetMockFa12LoanTokenOperation = await lendingControllerInstance.methods.setLoanToken(
                        
//                         setLoanTokenActionType,

//                         tokenName,
//                         tokenDecimals,

//                         oracleAddress,

//                         lpTokenContractAddress,
//                         lpTokenId,
                        
//                         reserveRatio,
//                         optimalUtilisationRate,
//                         baseInterestRate,
//                         maxInterestRate,
//                         interestRateBelowOptimalUtilisation,
//                         interestRateAboveOptimalUtilisation,

//                         minRepaymentAmount,

//                         // fa12 token type - token contract address
//                         tokenType,
//                         tokenContractAddress,

//                     ).send();
//                     await adminSetMockFa12LoanTokenOperation.confirmation();

//                     lendingControllerStorage  = await lendingControllerInstance.storage();
//                     const mockFa12LoanToken   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

//                     assert.equal(mockFa12LoanToken.tokenName              , tokenName);
    
//                     assert.equal(mockFa12LoanToken.lpTokensTotal          , 0);
//                     assert.equal(mockFa12LoanToken.lpTokenContractAddress , lpTokenContractAddress);
//                     assert.equal(mockFa12LoanToken.lpTokenId              , 0);
    
//                     assert.equal(mockFa12LoanToken.reserveRatio           , reserveRatio);
//                     assert.equal(mockFa12LoanToken.tokenPoolTotal         , 0);
//                     assert.equal(mockFa12LoanToken.totalBorrowed          , 0);
//                     assert.equal(mockFa12LoanToken.totalRemaining         , 0);
    
//                     assert.equal(mockFa12LoanToken.optimalUtilisationRate , optimalUtilisationRate);
//                     assert.equal(mockFa12LoanToken.baseInterestRate       , baseInterestRate);
//                     assert.equal(mockFa12LoanToken.maxInterestRate        , maxInterestRate);
                    
//                     assert.equal(mockFa12LoanToken.interestRateBelowOptimalUtilisation       , interestRateBelowOptimalUtilisation);
//                     assert.equal(mockFa12LoanToken.interestRateAboveOptimalUtilisation       , interestRateAboveOptimalUtilisation);
    
//                 } else {

//                     lendingControllerStorage  = await lendingControllerInstance.storage();
//                     const mockFa12LoanToken   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 
                
//                     // other variables will be affected by repeated tests
//                     assert.equal(mockFa12LoanToken.tokenName              , tokenName);

//                 }

//             } catch(e){
//                 console.log(e);
//             } 
//         });

//         it('admin can set mock FA2 as a loan token', async () => {

//             try{        
                
//                 // init variables
//                 await signerFactory(bob.sk);

//                 const setLoanTokenActionType                = "createLoanToken";

//                 const tokenName                             = "mockFa2";
//                 const tokenContractAddress                  = mockFa2TokenAddress.address;
//                 const tokenType                             = "fa2";
//                 const tokenId                               = 0;
//                 const tokenDecimals                         = 6;

//                 const oracleAddress                         = mockUsdMockFa2TokenAggregatorAddress.address;

//                 const lpTokenContractAddress                = lpTokenPoolMockFa2TokenAddress.address;
//                 const lpTokenId                             = 0;

//                 const interestRateDecimals                  = 27;
//                 const reserveRatio                          = 1000; // 10% reserves (4 decimals)
//                 const optimalUtilisationRate                = 50 * (10 ** (interestRateDecimals - 2));  // 30% utilisation rate kink
//                 const baseInterestRate                      = 5  * (10 ** (interestRateDecimals - 2));  // 5%
//                 const maxInterestRate                       = 25 * (10 ** (interestRateDecimals - 2));  // 25% 
//                 const interestRateBelowOptimalUtilisation   = 10 * (10 ** (interestRateDecimals - 2));  // 10% 
//                 const interestRateAboveOptimalUtilisation   = 20 * (10 ** (interestRateDecimals - 2));  // 20%

//                 const minRepaymentAmount                    = 10000;

//                 // update token oracle with token decimals
//                 const mockFa2TokenIndex = tokenOracles.findIndex((o => o.name === "mockFa2"));
//                 tokenOracles[mockFa2TokenIndex].tokenDecimals = tokenDecimals;

//                 const checkLoanTokenExists   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

//                 if(checkLoanTokenExists === undefined){

//                     const adminSetMockFa2LoanTokenOperation = await lendingControllerInstance.methods.setLoanToken(
                        
//                         setLoanTokenActionType,

//                         tokenName,
//                         tokenDecimals,

//                         oracleAddress,

//                         lpTokenContractAddress,
//                         lpTokenId,
                        
//                         reserveRatio,
//                         optimalUtilisationRate,
//                         baseInterestRate,
//                         maxInterestRate,
//                         interestRateBelowOptimalUtilisation,
//                         interestRateAboveOptimalUtilisation,

//                         minRepaymentAmount,
                        
//                         // fa2 token type - token contract address + token id
//                         tokenType,
//                         tokenContractAddress,
//                         tokenId

//                     ).send();
//                     await adminSetMockFa2LoanTokenOperation.confirmation();

//                     lendingControllerStorage = await lendingControllerInstance.storage();
//                     const mockFa2LoanToken   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

//                     assert.equal(mockFa2LoanToken.tokenName              , tokenName);

//                     assert.equal(mockFa2LoanToken.lpTokensTotal          , 0);
//                     assert.equal(mockFa2LoanToken.lpTokenContractAddress , lpTokenContractAddress);
//                     assert.equal(mockFa2LoanToken.lpTokenId              , 0);

//                     assert.equal(mockFa2LoanToken.reserveRatio           , reserveRatio);
//                     assert.equal(mockFa2LoanToken.tokenPoolTotal         , 0);
//                     assert.equal(mockFa2LoanToken.totalBorrowed          , 0);
//                     assert.equal(mockFa2LoanToken.totalRemaining         , 0);

//                     assert.equal(mockFa2LoanToken.optimalUtilisationRate , optimalUtilisationRate);
//                     assert.equal(mockFa2LoanToken.baseInterestRate       , baseInterestRate);
//                     assert.equal(mockFa2LoanToken.maxInterestRate        , maxInterestRate);
                    
//                     assert.equal(mockFa2LoanToken.interestRateBelowOptimalUtilisation       , interestRateBelowOptimalUtilisation);
//                     assert.equal(mockFa2LoanToken.interestRateAboveOptimalUtilisation       , interestRateAboveOptimalUtilisation);

//                 } else {

//                     lendingControllerStorage = await lendingControllerInstance.storage();
//                     const mockFa2LoanToken   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

//                     // other variables will be affected by repeated tests
//                     assert.equal(mockFa2LoanToken.tokenName              , tokenName);

//                 }
                
                
//             } catch(e){
//                 console.log(e);
//             } 
//         });


//         it('admin can set tez as a loan token', async () => {

//             try{        
                
//                 // init variables
//                 await signerFactory(bob.sk);

//                 const setLoanTokenActionType                = "createLoanToken";

//                 const tokenName                             = "tez";
//                 const tokenType                             = "tez";
//                 const tokenDecimals                         = 6;

//                 const oracleAddress                         = mockUsdXtzAggregatorAddress.address;

//                 const lpTokenContractAddress                = lpTokenPoolXtzAddress.address;
//                 const lpTokenId                             = 0;

//                 const interestRateDecimals                  = 27;
//                 const reserveRatio                          = 1000; // 10% reserves (4 decimals)
//                 const optimalUtilisationRate                = 50 * (10 ** (interestRateDecimals - 2));  // 30% utilisation rate kink
//                 const baseInterestRate                      = 5  * (10 ** (interestRateDecimals - 2));  // 5%
//                 const maxInterestRate                       = 25 * (10 ** (interestRateDecimals - 2));  // 25% 
//                 const interestRateBelowOptimalUtilisation   = 10 * (10 ** (interestRateDecimals - 2));  // 10% 
//                 const interestRateAboveOptimalUtilisation   = 20 * (10 ** (interestRateDecimals - 2));  // 20%

//                 const minRepaymentAmount                    = 10000;

//                 // update token oracle with token decimals
//                 const tezIndex = tokenOracles.findIndex((o => o.name === "tez"));
//                 tokenOracles[tezIndex].tokenDecimals = tokenDecimals;

//                 // check if loan token exists
//                 const checkLoanTokenExists   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

//                 if(checkLoanTokenExists === undefined){

//                     const adminSeTezLoanTokenOperation = await lendingControllerInstance.methods.setLoanToken(
                        
//                         setLoanTokenActionType,

//                         tokenName,
//                         tokenDecimals,

//                         oracleAddress,

//                         lpTokenContractAddress,
//                         lpTokenId,
                        
//                         reserveRatio,
//                         optimalUtilisationRate,
//                         baseInterestRate,
//                         maxInterestRate,
//                         interestRateBelowOptimalUtilisation,
//                         interestRateAboveOptimalUtilisation,

//                         minRepaymentAmount,

//                         // fa12 token type - token contract address
//                         tokenType

//                     ).send();
//                     await adminSeTezLoanTokenOperation.confirmation();

//                     lendingControllerStorage  = await lendingControllerInstance.storage();
//                     const tezLoanToken   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 
                
//                     assert.equal(tezLoanToken.tokenName              , tokenName);
//                     assert.equal(tezLoanToken.tokenDecimals          , tokenDecimals);

//                     assert.equal(tezLoanToken.lpTokensTotal          , 0);
//                     assert.equal(tezLoanToken.lpTokenContractAddress , lpTokenContractAddress);
//                     assert.equal(tezLoanToken.lpTokenId              , 0);
    
//                     assert.equal(tezLoanToken.reserveRatio           , reserveRatio);
//                     assert.equal(tezLoanToken.tokenPoolTotal         , 0);
//                     assert.equal(tezLoanToken.totalBorrowed          , 0);
//                     assert.equal(tezLoanToken.totalRemaining         , 0);
    
//                     assert.equal(tezLoanToken.optimalUtilisationRate , optimalUtilisationRate);
//                     assert.equal(tezLoanToken.baseInterestRate       , baseInterestRate);
//                     assert.equal(tezLoanToken.maxInterestRate        , maxInterestRate);
                    
//                     assert.equal(tezLoanToken.interestRateBelowOptimalUtilisation       , interestRateBelowOptimalUtilisation);
//                     assert.equal(tezLoanToken.interestRateAboveOptimalUtilisation       , interestRateAboveOptimalUtilisation);
    

//                 } else {

//                     lendingControllerStorage  = await lendingControllerInstance.storage();
//                     const tezLoanToken   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 
                
//                     // other variables will be affected by repeated tests
//                     assert.equal(tezLoanToken.tokenName              , tokenName);
                    
//                 }

//             } catch(e){
//                 console.log(e);
//             } 
//         });


//         it('non-admin should not be able to call this entrypoint', async () => {
//             try{
//                 // Initial Values
//                 await signerFactory(alice.sk);
//                 lendingControllerStorage = await lendingControllerInstance.storage();
//                 const currentAdmin = lendingControllerStorage.admin;

//                 const setLoanTokenActionType                = "createLoanToken";

//                 const tokenName                             = "failTestLoanToken";
//                 const tokenContractAddress                  = mockFa2TokenAddress.address;
//                 const tokenType                             = "fa2";
//                 const tokenId                               = 0;
//                 const tokenDecimals                         = 6;

//                 const oracleAddress                         = mockUsdXtzAggregatorAddress.address;

//                 const lpTokenContractAddress                = lpTokenPoolMockFa2TokenAddress.address;
//                 const lpTokenId                             = 0;

//                 const interestRateDecimals                  = 27;
//                 const reserveRatio                          = 3000; // 30% reserves (4 decimals)
//                 const optimalUtilisationRate                = 30 * (10 ** (interestRateDecimals - 2));  // 30% utilisation rate kink
//                 const baseInterestRate                      = 5  * (10 ** (interestRateDecimals - 2));  // 5%
//                 const maxInterestRate                       = 25 * (10 ** (interestRateDecimals - 2));  // 25% 
//                 const interestRateBelowOptimalUtilisation   = 10 * (10 ** (interestRateDecimals - 2));  // 10% 
//                 const interestRateAboveOptimalUtilisation   = 20 * (10 ** (interestRateDecimals - 2));  // 20%

//                 const minRepaymentAmount                    = 10000;

//                 await chai.expect(lendingControllerInstance.methods.setLoanToken(

//                     setLoanTokenActionType,
                        
//                     tokenName,
//                     tokenDecimals,

//                     oracleAddress,

//                     lpTokenContractAddress,
//                     lpTokenId,
                    
//                     reserveRatio,
//                     optimalUtilisationRate,
//                     baseInterestRate,
//                     maxInterestRate,
//                     interestRateBelowOptimalUtilisation,
//                     interestRateAboveOptimalUtilisation,

//                     minRepaymentAmount,
                    
//                     // fa2 token type - token contract address + token id
//                     tokenType,
//                     tokenContractAddress,
//                     tokenId

//                 ).send()).to.be.rejected;

//                 // Final values
//                 lendingControllerStorage = await lendingControllerInstance.storage();
//                 const failTestLoanToken   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

//                 // Assertions
//                 assert.strictEqual(failTestLoanToken, undefined);

//             } catch(e){
//                 console.log(e);
//             }
//         });
        
//     });



//     // 
//     // Setup and test Lending Controller setCollateralToken entrypoint - tokens which vault owners can use as collateral
//     //
//     describe('%setCollateralToken - setup and test lending controller %setCollateralToken entrypoint', function () {

//         it('admin can set mock FA12 as a collateral token', async () => {

//             try{        
                
//                 // init variables
//                 await signerFactory(bob.sk);

//                 const setCollateralTokenActionType      = "createCollateralToken";
//                 const tokenName                         = "mockFa12";
//                 const tokenContractAddress              = mockFa12TokenAddress.address;
//                 const tokenType                         = "fa12";
//                 const tokenId                           = 0;

//                 const tokenDecimals                     = 6;
//                 const oracleAddress                     = mockUsdMockFa12TokenAggregatorAddress.address;
//                 const tokenProtected                    = false;
                
//                 // check if collateral token exists
//                 const checkCollateralTokenExists   = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

//                 if(checkCollateralTokenExists === undefined){

//                     const adminSetMockFa12CollateralTokenOperation = await lendingControllerInstance.methods.setCollateralToken(
                        
//                         setCollateralTokenActionType, 

//                         tokenName,
//                         tokenContractAddress,
//                         tokenDecimals,

//                         oracleAddress,
//                         tokenProtected,

//                         // fa12 token type - token contract address
//                         tokenType,
//                         tokenContractAddress,

//                     ).send();
//                     await adminSetMockFa12CollateralTokenOperation.confirmation();

//                     lendingControllerStorage        = await lendingControllerInstance.storage();
//                     const mockFa12CollateralToken   = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 
                
//                     assert.equal(mockFa12CollateralToken.tokenName              , tokenName);

//                     assert.equal(mockFa12CollateralToken.tokenDecimals          , tokenDecimals);
//                     assert.equal(mockFa12CollateralToken.oracleAddress          , oracleAddress);
//                     assert.equal(mockFa12CollateralToken.protected              , tokenProtected);

//                 }
                

//             } catch(e){
//                 console.log(e);
//             } 
//         });

//         it('admin can set mock FA2 as a collateral token', async () => {

//             try{        
                
//                 // init variables
//                 await signerFactory(bob.sk);

//                 const setCollateralTokenActionType          = "createCollateralToken";
//                 const tokenName                             = "mockFa2";
//                 const tokenContractAddress                  = mockFa2TokenAddress.address;
//                 const tokenType                             = "fa2";
//                 const tokenId                               = 0;

//                 const tokenDecimals                         = 6;
//                 const oracleAddress                         = mockUsdMockFa2TokenAggregatorAddress.address;
//                 const tokenProtected                        = false;
                
//                 // check if collateral token exists
//                 const checkCollateralTokenExists   = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

//                 if(checkCollateralTokenExists === undefined){

//                     const adminSetMockFa2CollateralTokenOperation = await lendingControllerInstance.methods.setCollateralToken(

//                         setCollateralTokenActionType,
                        
//                         tokenName,
//                         tokenContractAddress,
//                         tokenDecimals,

//                         oracleAddress,
//                         tokenProtected,
                        
//                         // fa2 token type - token contract address + token id
//                         tokenType,
//                         tokenContractAddress,
//                         tokenId

//                     ).send();
//                     await adminSetMockFa2CollateralTokenOperation.confirmation();

//                     lendingControllerStorage        = await lendingControllerInstance.storage();
//                     const mockFa2CollateralToken    = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

//                     assert.equal(mockFa2CollateralToken.tokenName              , tokenName);

//                     assert.equal(mockFa2CollateralToken.tokenDecimals          , tokenDecimals);
//                     assert.equal(mockFa2CollateralToken.oracleAddress          , oracleAddress);
//                     assert.equal(mockFa2CollateralToken.protected              , tokenProtected);

//                 }

//             } catch(e){
//                 console.log(e);
//             } 
//         });

//         it('admin can set tez as a collateral token', async () => {

//             try{        
                
//                 // init variables
//                 await signerFactory(bob.sk);

//                 const setCollateralTokenActionType          = "createCollateralToken";
//                 const tokenName                             = "tez";
//                 const tokenContractAddress                  = zeroAddress;
//                 const tokenType                             = "tez";
//                 const tokenId                               = 0;

//                 const tokenDecimals                         = 6;
//                 const oracleAddress                         = mockUsdXtzAggregatorAddress.address;
//                 const tokenProtected                        = false;
                
//                 // check if collateral token exists
//                 const checkCollateralTokenExists   = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

//                 if(checkCollateralTokenExists === undefined){

//                     const adminSetMockFa2CollateralTokenOperation = await lendingControllerInstance.methods.setCollateralToken(
                        
//                         setCollateralTokenActionType,

//                         tokenName,
//                         tokenContractAddress,
//                         tokenDecimals,

//                         oracleAddress,
//                         tokenProtected,
                        
//                         // fa2 token type - token contract address + token id
//                         tokenType,
//                         tokenContractAddress,
//                         tokenId

//                     ).send();
//                     await adminSetMockFa2CollateralTokenOperation.confirmation();

//                     lendingControllerStorage        = await lendingControllerInstance.storage();
//                     const mockFa2CollateralToken    = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

//                     assert.equal(mockFa2CollateralToken.tokenName              , tokenName);

//                     assert.equal(mockFa2CollateralToken.tokenDecimals          , tokenDecimals);
//                     assert.equal(mockFa2CollateralToken.oracleAddress          , oracleAddress);
//                     assert.equal(mockFa2CollateralToken.protected              , tokenProtected);

//                 }

//             } catch(e){
//                 console.log(e);
//             } 
//         });


//         it('admin can set mToken - LP Token Pool: Mock FA12 Token as a collateral token', async () => {

//             try{        
                
//                 // init variables
//                 await signerFactory(bob.sk);

//                 const setCollateralTokenActionType          = "createCollateralToken";
//                 const tokenName                             = "mTokenMockFa12";
//                 const tokenContractAddress                  = lpTokenPoolMockFa12TokenAddress.address;
//                 const tokenType                             = "fa2";
//                 const tokenId                               = 0;

//                 const tokenDecimals                         = 6;
//                 const oracleAddress                         = mockUsdMockFa12TokenAggregatorAddress.address;
//                 const tokenProtected                        = false;
                
//                 // check if collateral token exists
//                 const checkCollateralTokenExists   = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

//                 if(checkCollateralTokenExists === undefined){

//                     const adminSetMockFa2CollateralTokenOperation = await lendingControllerInstance.methods.setCollateralToken(

//                         setCollateralTokenActionType,
                        
//                         tokenName,
//                         tokenContractAddress,
//                         tokenDecimals,

//                         oracleAddress,
//                         tokenProtected,
                        
//                         // fa2 token type - token contract address + token id
//                         tokenType,
//                         tokenContractAddress,
//                         tokenId

//                     ).send();
//                     await adminSetMockFa2CollateralTokenOperation.confirmation();

//                     lendingControllerStorage        = await lendingControllerInstance.storage();
//                     const mockFa2CollateralToken    = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

//                     assert.equal(mockFa2CollateralToken.tokenName              , tokenName);

//                     assert.equal(mockFa2CollateralToken.tokenDecimals          , tokenDecimals);
//                     assert.equal(mockFa2CollateralToken.oracleAddress          , oracleAddress);
//                     assert.equal(mockFa2CollateralToken.protected              , tokenProtected);

//                 }

//             } catch(e){
//                 console.log(e);
//             } 
//         });


//         it('admin can set mToken - LP Token Pool: Mock FA2 Token as a collateral token', async () => {

//             try{        
                
//                 // init variables
//                 await signerFactory(bob.sk);

//                 const setCollateralTokenActionType          = "createCollateralToken";
//                 const tokenName                             = "mTokenMockFa2";
//                 const tokenContractAddress                  = lpTokenPoolMockFa2TokenAddress.address;
//                 const tokenType                             = "fa2";
//                 const tokenId                               = 0;

//                 const tokenDecimals                         = 6;
//                 const oracleAddress                         = mockUsdMockFa2TokenAggregatorAddress.address;
//                 const tokenProtected                        = false;
                
//                 // check if collateral token exists
//                 const checkCollateralTokenExists   = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

//                 if(checkCollateralTokenExists === undefined){

//                     const adminSetMockFa2CollateralTokenOperation = await lendingControllerInstance.methods.setCollateralToken(

//                         setCollateralTokenActionType,
                        
//                         tokenName,
//                         tokenContractAddress,
//                         tokenDecimals,

//                         oracleAddress,
//                         tokenProtected,
                        
//                         // fa2 token type - token contract address + token id
//                         tokenType,
//                         tokenContractAddress,
//                         tokenId

//                     ).send();
//                     await adminSetMockFa2CollateralTokenOperation.confirmation();

//                     lendingControllerStorage        = await lendingControllerInstance.storage();
//                     const mockFa2CollateralToken    = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

//                     assert.equal(mockFa2CollateralToken.tokenName              , tokenName);

//                     assert.equal(mockFa2CollateralToken.tokenDecimals          , tokenDecimals);
//                     assert.equal(mockFa2CollateralToken.oracleAddress          , oracleAddress);
//                     assert.equal(mockFa2CollateralToken.protected              , tokenProtected);

//                 }

//             } catch(e){
//                 console.log(e);
//             } 
//         });


//         it('admin can set mToken - LP Token Pool: Tez as a collateral token', async () => {

//             try{        
                
//                 // init variables
//                 await signerFactory(bob.sk);

//                 const setCollateralTokenActionType          = "createCollateralToken";
//                 const tokenName                             = "mTokenTez";
//                 const tokenContractAddress                  = lpTokenPoolXtzAddress.address;
//                 const tokenType                             = "fa2";
//                 const tokenId                               = 0;

//                 const tokenDecimals                         = 6;
//                 const oracleAddress                         = mockUsdXtzAggregatorAddress.address;
//                 const tokenProtected                        = false;
                
//                 // check if collateral token exists
//                 const checkCollateralTokenExists   = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

//                 if(checkCollateralTokenExists === undefined){

//                     const adminSetMockFa2CollateralTokenOperation = await lendingControllerInstance.methods.setCollateralToken(

//                         setCollateralTokenActionType,
                        
//                         tokenName,
//                         tokenContractAddress,
//                         tokenDecimals,

//                         oracleAddress,
//                         tokenProtected,
                        
//                         // fa2 token type - token contract address + token id
//                         tokenType,
//                         tokenContractAddress,
//                         tokenId

//                     ).send();
//                     await adminSetMockFa2CollateralTokenOperation.confirmation();

//                     lendingControllerStorage        = await lendingControllerInstance.storage();
//                     const mockFa2CollateralToken    = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

//                     assert.equal(mockFa2CollateralToken.tokenName              , tokenName);

//                     assert.equal(mockFa2CollateralToken.tokenDecimals          , tokenDecimals);
//                     assert.equal(mockFa2CollateralToken.oracleAddress          , oracleAddress);
//                     assert.equal(mockFa2CollateralToken.protected              , tokenProtected);

//                 }

//             } catch(e){
//                 console.log(e);
//             } 
//         });



//         it('non-admin should not be able to call this entrypoint', async () => {
//             try{
//                 // Initial Values
//                 await signerFactory(alice.sk);
//                 lendingControllerStorage = await lendingControllerInstance.storage();
//                 const currentAdmin = lendingControllerStorage.admin;

//                 const setCollateralTokenActionType          = "createCollateralToken";

//                 const tokenName                             = "failTestCollateralToken";
//                 const tokenContractAddress                  = mockFa2TokenAddress.address;
//                 const tokenType                             = "fa2";
//                 const tokenId                               = 0;

//                 const tokenDecimals                         = 6;
//                 const oracleAddress                         = zeroAddress;
//                 const tokenProtected                        = false;
            

//                 await chai.expect(lendingControllerInstance.methods.setCollateralToken(
                        
//                     setCollateralTokenActionType,

//                     tokenName,
//                     tokenContractAddress,
//                     tokenDecimals,

//                     oracleAddress,
//                     tokenProtected,
                    
//                     // fa2 token type - token contract address + token id
//                     tokenType,
//                     tokenContractAddress,
//                     tokenId

//                 ).send()).to.be.rejected;

//                 // Final values
//                 lendingControllerStorage = await lendingControllerInstance.storage();
//                 const failTestCollateralToken   = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

//                 // Assertions
//                 assert.strictEqual(failTestCollateralToken, undefined);

//             } catch(e){
//                 console.log(e);
//             }
//         });
        
//     });



//     // 
//     // Test: Set Lending Controller Admin
//     //
//     describe('%setAdmin - Lending Controller', function () {
    
//         it('admin can set admin', async () => {
//             try{        
        
//                 await signerFactory(bob.sk);
//                 const previousAdmin = lendingControllerStorage.admin;
                
//                 if(previousAdmin == bob.pkh){
                    
//                     assert.equal(previousAdmin, bob.pkh);
//                     const setNewAdminOperation = await lendingControllerInstance.methods.setAdmin(governanceProxyAddress.address).send();
//                     await setNewAdminOperation.confirmation();

//                     const updatedLendingControllerStorage = await lendingControllerInstance.storage();
//                     const newAdmin = updatedLendingControllerStorage.admin;

//                     assert.equal(newAdmin, governanceProxyAddress.address);
//                 };

//             } catch(e){
//                 console.log(e);
//             } 

//         });   


//         it('non-admin cannot set admin', async () => {
//             try{        
        
//                 await signerFactory(mallory.sk);
        
//                     const failSetNewAdminOperation = await lendingControllerInstance.methods.setAdmin(governanceProxyAddress.address);
//                     await chai.expect(failSetNewAdminOperation.send()).to.be.rejected;    

//                     const updatedLendingControllerStorage = await lendingControllerInstance.storage();
//                     const admin = updatedLendingControllerStorage.admin;
//                     assert.equal(admin, governanceProxyAddress.address);

//             } catch(e){
//                 console.log(e);
//             } 

//         });   
//     })




//     // 
//     // Setup Lending Controller liquidity pools
//     //
//     describe('%addLiquidity - setup lending controller liquidity for interest rate tests', function () {

//         it('user (eve) can add liquidity for mock FA12 token into Lending Controller token pool (100 MockFA12 Tokens)', async () => {
    
//             // init variables
//             await signerFactory(eve.sk);
//             const loanTokenName = "mockFa12";
//             const liquidityAmount = 100000000; // 100 Mock FA12 Tokens

//             lendingControllerStorage = await lendingControllerInstance.storage();
            
//             // get mock fa12 token storage and lp token pool mock fa12 token storage
//             const mockFa12TokenStorage              = await mockFa12TokenInstance.storage();
//             const lpTokenPoolMockFa12TokenStorage   = await lpTokenPoolMockFa12TokenInstance.storage();
            
//             // get initial eve's Mock FA12 Token balance
//             const eveMockFa12Ledger                 = await mockFa12TokenStorage.ledger.get(eve.pkh);            
//             const eveInitialMockFa12TokenBalance    = eveMockFa12Ledger == undefined ? 0 : eveMockFa12Ledger.balance.toNumber();

//             // get initial eve's Token Pool FA2 LP - Mock FA12 Token - balance
//             const eveLpTokenPoolMockFa12Ledger                 = await lpTokenPoolMockFa12TokenStorage.ledger.get(eve.pkh);            
//             const eveInitialLpTokenPoolMockFa12TokenBalance    = eveLpTokenPoolMockFa12Ledger == undefined ? 0 : eveLpTokenPoolMockFa12Ledger.toNumber();

//             // get initial lending controller's Mock FA12 Token balance
//             const lendingControllerMockFa12Ledger                = await mockFa12TokenStorage.ledger.get(lendingControllerAddress.address);            
//             const lendingControllerInitialMockFa12TokenBalance   = lendingControllerMockFa12Ledger == undefined ? 0 : lendingControllerMockFa12Ledger.balance.toNumber();

//             // get initial lending controller token pool total
//             const initialLoanTokenRecord                 = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
//             const lendingControllerInitialTokenPoolTotal = initialLoanTokenRecord.tokenPoolTotal.toNumber();

//             // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
//             // reset token allowance
//             const resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
//                 lendingControllerAddress.address,
//                 0
//             ).send();
//             await resetTokenAllowance.confirmation();

//             // set new token allowance
//             const setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
//                 lendingControllerAddress.address,
//                 liquidityAmount
//             ).send();
//             await setNewTokenAllowance.confirmation();

//             // eve deposits mock FA12 tokens into lending controller token pool
//             const eveDepositTokenOperation  = await lendingControllerInstance.methods.addLiquidity(
//                 loanTokenName,
//                 liquidityAmount, 
//             ).send();
//             await eveDepositTokenOperation.confirmation();

//             // get updated storages
//             const updatedLendingControllerStorage         = await lendingControllerInstance.storage();
//             const updatedMockFa12TokenStorage             = await mockFa12TokenInstance.storage();
//             const updatedLpTokenPoolMockFa12TokenStorage  = await lpTokenPoolMockFa12TokenInstance.storage();

//             // check new balance for loan token pool total
//             const updatedLoanTokenRecord           = await updatedLendingControllerStorage.loanTokenLedger.get(loanTokenName);
//             assert.equal(updatedLoanTokenRecord.tokenPoolTotal, lendingControllerInitialTokenPoolTotal + liquidityAmount);

//             // check Eve's Mock FA12 Token balance
//             const updatedEveMockFa12Ledger         = await updatedMockFa12TokenStorage.ledger.get(eve.pkh);            
//             assert.equal(updatedEveMockFa12Ledger.balance, eveInitialMockFa12TokenBalance - liquidityAmount);

//             // check Lending Controller's Mock FA12 Token Balance
//             const lendingControllerMockFa12Account  = await updatedMockFa12TokenStorage.ledger.get(lendingControllerAddress.address);            
//             assert.equal(lendingControllerMockFa12Account.balance, lendingControllerInitialMockFa12TokenBalance + liquidityAmount);

//             // check Eve's LP Token Pool Mock FA12 Token balance
//             const updatedEveLpTokenPoolMockFa12Ledger        = await updatedLpTokenPoolMockFa12TokenStorage.ledger.get(eve.pkh);            
//             assert.equal(updatedEveLpTokenPoolMockFa12Ledger, eveInitialLpTokenPoolMockFa12TokenBalance + liquidityAmount);        

//         });

//         it('user (eve) can add liquidity for mock FA2 token into Lending Controller token pool (100 MockFA2 Tokens)', async () => {
    
//             // init variables
//             await signerFactory(eve.sk);
//             const loanTokenName = "mockFa2";
//             const liquidityAmount = 100000000; // 100 Mock FA2 Tokens

//             lendingControllerStorage = await lendingControllerInstance.storage();
            
//             // get mock fa2 token storage and lp token pool mock fa2 token storage
//             const mockFa2TokenStorage              = await mockFa2TokenInstance.storage();
//             const lpTokenPoolMockFa2TokenStorage   = await lpTokenPoolMockFa2TokenInstance.storage();
            
//             // get initial eve's Mock FA2 Token balance
//             const eveMockFa2Ledger                 = await mockFa2TokenStorage.ledger.get(eve.pkh);            
//             const eveInitialMockFa2TokenBalance    = eveMockFa2Ledger == undefined ? 0 : eveMockFa2Ledger.toNumber();

//             // get initial eve's Token Pool FA2 LP - Mock FA2 Token - balance
//             const eveLpTokenPoolMockFa2Ledger                 = await lpTokenPoolMockFa2TokenStorage.ledger.get(eve.pkh);            
//             const eveInitialLpTokenPoolMockFa2TokenBalance    = eveLpTokenPoolMockFa2Ledger == undefined ? 0 : eveLpTokenPoolMockFa2Ledger.toNumber();

//             // get initial lending controller's Mock FA2 Token balance
//             const lendingControllerMockFa2Ledger                = await mockFa2TokenStorage.ledger.get(lendingControllerAddress.address);            
//             const lendingControllerInitialMockFa2TokenBalance   = lendingControllerMockFa2Ledger == undefined ? 0 : lendingControllerMockFa2Ledger.toNumber();

//             // get initial lending controller token pool total
//             const initialLoanTokenRecord                 = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
//             const lendingControllerInitialTokenPoolTotal = initialLoanTokenRecord.tokenPoolTotal.toNumber();

//             // update operators for vault
//             const updateOperatorsOperation = await mockFa2TokenInstance.methods.update_operators([
//                 {
//                     add_operator: {
//                         owner: eve.pkh,
//                         operator: lendingControllerAddress.address,
//                         token_id: 0,
//                     },
//                 }])
//                 .send()
//             await updateOperatorsOperation.confirmation();

//             // eve deposits mock FA12 tokens into lending controller token pool
//             const eveDepositTokenOperation  = await lendingControllerInstance.methods.addLiquidity(
//                 loanTokenName,
//                 liquidityAmount, 
//             ).send();
//             await eveDepositTokenOperation.confirmation();

//             // get updated storages
//             const updatedLendingControllerStorage  = await lendingControllerInstance.storage();
//             const updatedMockFa2TokenStorage       = await mockFa2TokenInstance.storage();
            
//             const updatedLpTokenPoolMockFa2TokenStorage     = await lpTokenPoolMockFa2TokenInstance.storage();

//             // check new balance for loan token pool total
//             const updatedLoanTokenRecord           = await updatedLendingControllerStorage.loanTokenLedger.get(loanTokenName);
//             assert.equal(updatedLoanTokenRecord.tokenPoolTotal, lendingControllerInitialTokenPoolTotal + liquidityAmount);

//             // check Eve's Mock FA12 Token balance
//             const updatedEveMockFa2Ledger          = await updatedMockFa2TokenStorage.ledger.get(eve.pkh);            
//             assert.equal(updatedEveMockFa2Ledger, eveInitialMockFa2TokenBalance - liquidityAmount);

//             // check Lending Controller's Mock FA2 Token Balance
//             const lendingControllerMockFa2Account             = await updatedMockFa2TokenStorage.ledger.get(lendingControllerAddress.address);            
//             assert.equal(lendingControllerMockFa2Account, lendingControllerInitialMockFa2TokenBalance + liquidityAmount);

//             // check Eve's LP Token Pool Mock FA2 Token balance
//             const updatedEveLpTokenPoolMockFa2Ledger        = await updatedLpTokenPoolMockFa2TokenStorage.ledger.get(eve.pkh);            
//             assert.equal(updatedEveLpTokenPoolMockFa2Ledger, eveInitialLpTokenPoolMockFa2TokenBalance + liquidityAmount);        

//         });


//         it('user (eve) can add liquidity for tez into Lending Controller token pool (100 XTZ)', async () => {
    
//             // init variables
//             await signerFactory(eve.sk);
//             const loanTokenName = "tez";
//             const liquidityAmount = 100000000; // 100 XTZ

//             lendingControllerStorage = await lendingControllerInstance.storage();
            
//             // get LP token pool XTZ token storage (FA2 Token Standard)
//             const lpTokenPoolXtzStorage   = await lpTokenPoolXtzInstance.storage();

//             // get initial eve XTZ balance
//             const eveInitialXtzLedger   = await utils.tezos.tz.getBalance(eve.pkh);
//             const eveInitialXtzBalance  = eveInitialXtzLedger.toNumber();

//             // get initial eve's Token Pool FA2 LP - Tez - balance
//             const eveLpTokenPoolXtzLedger            = await lpTokenPoolXtzStorage.ledger.get(eve.pkh);            
//             const eveInitialLpTokenPoolXtzBalance    = eveLpTokenPoolXtzLedger == undefined ? 0 : eveLpTokenPoolXtzLedger.toNumber();
            
//             // get initial lending controller's XTZ balance
//             const lendingControllerInitialXtzLedger   = await utils.tezos.tz.getBalance(lendingControllerAddress.address);
//             const lendingControllerInitialXtzBalance  = lendingControllerInitialXtzLedger.toNumber();

//             // get initial lending controller token pool total
//             const initialLoanTokenRecord                 = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
//             const lendingControllerInitialTokenPoolTotal = initialLoanTokenRecord.tokenPoolTotal.toNumber();

//             // eve deposits mock XTZ into lending controller token pool
//             const eveAddLiquidityOperation  = await lendingControllerInstance.methods.addLiquidity(
//                 loanTokenName,
//                 liquidityAmount, 
//             ).send({ mutez : true, amount: liquidityAmount });
//             await eveAddLiquidityOperation.confirmation();

//             // get updated storages
//             const updatedLendingControllerStorage  = await lendingControllerInstance.storage();
//             const updatedLpTokenPoolXtzStorage     = await lpTokenPoolXtzInstance.storage();

//             // check new balance for loan token pool total
//             const updatedLoanTokenRecord           = await updatedLendingControllerStorage.loanTokenLedger.get(loanTokenName);
//             assert.equal(updatedLoanTokenRecord.tokenPoolTotal, lendingControllerInitialTokenPoolTotal + liquidityAmount);

//             // check Lending Controller's XTZ Balance
//             const lendingControllerXtzBalance           = await utils.tezos.tz.getBalance(lendingControllerAddress.address);
//             assert.equal(lendingControllerXtzBalance, lendingControllerInitialXtzBalance + liquidityAmount);

//             // check Eve's LP Token Pool XTZ balance
//             const updatedEveLpTokenPoolXtzLedger        = await updatedLpTokenPoolXtzStorage.ledger.get(eve.pkh);            
//             assert.equal(updatedEveLpTokenPoolXtzLedger, eveInitialLpTokenPoolXtzBalance + liquidityAmount);        

//             // check Eve's XTZ Balance and account for gas cost in transaction with almostEqual
//             const eveXtzBalance = await utils.tezos.tz.getBalance(eve.pkh);
//             assert.equal(almostEqual(eveXtzBalance, eveInitialXtzBalance - liquidityAmount, 0.0001), true)

//         });
    
//     })

    
//     // 
//     // Test Vault Liquidation
//     //
//     describe('%liquidateVault - test vault liquidation', function () {
 
//         it('simple one token test: user (mallory) can mark eve\'s vault for liquidation (interest accumulated over time) and liquidate vault with refunds for overflow - [Collateral Token: Mock FA-12 | Loan Token: Mock FA-12]', async () => {
            
//             // init variables and storage
//             lendingControllerStorage = await lendingControllerInstance.storage();
//             vaultFactoryStorage      = await vaultFactoryInstance.storage();

//             currentMockLevel      = lendingControllerStorage.mockLevel;

//             // config variables
//             const liquidationDelayInMins        = lendingControllerStorage.config.liquidationDelayInMins.toNumber();
//             const liquidationMaxDuration        = lendingControllerStorage.config.liquidationMaxDuration.toNumber();
//             const maxVaultLiquidationPercent    = lendingControllerStorage.config.maxVaultLiquidationPercent.toNumber();
//             const adminLiquidationFeePercent    = lendingControllerStorage.config.adminLiquidationFeePercent.toNumber();
//             const liquidationFeePercent         = lendingControllerStorage.config.liquidationFeePercent.toNumber();
//             const interestTreasuryShare         = lendingControllerStorage.config.interestTreasuryShare.toNumber();
            

//             // ----------------------------------------------------------------------------------------------
//             // Create Vault
//             // ----------------------------------------------------------------------------------------------


//             await signerFactory(eve.sk);

//             const vaultCounter  = vaultFactoryStorage.vaultCounter;
//             const vaultId       = vaultCounter.toNumber();
//             const vaultOwner    = eve.pkh;
//             const liquidator    = mallory.pkh;
//             const depositors    = "any";
//             const loanTokenName = "mockFa12";

//             const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
//                 eve.pkh,                // delegate to
//                 loanTokenName,          // loan token type
//                 depositors              // depositors type
//             ).send();
//             await userCreatesNewVaultOperation.confirmation();

//             const vaultHandle = {
//                 "id"    : vaultId,
//                 "owner" : vaultOwner
//             };
//             vaultRecord = await lendingControllerStorage.vaults.get(vaultHandle);
//             const vaultAddress   = vaultRecord.address;
//             const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

//             // console.log('   - vault originated: ' + vaultAddress);
//             // console.log('   - vault id: ' + vaultId);

//             // push new vault id to vault set
//             eveVaultSet.push(vaultId);

            
//             // ----------------------------------------------------------------------------------------------
//             // Deposit Collateral into Vault
//             // ----------------------------------------------------------------------------------------------


//             const mockFa12DepositAmount  = 8000000;   // 8 Mock FA12 Tokens - USD $12.00

//             // ---------------------------------
//             // Deposit Mock FA12 Tokens
//             // ---------------------------------

//             // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
//             // reset token allowance
//             const resetTokenAllowanceForDeposit = await mockFa12TokenInstance.methods.approve(
//                 vaultAddress,
//                 0
//             ).send();
//             await resetTokenAllowanceForDeposit.confirmation();

//             // set new token allowance
//             const setNewTokenAllowanceForDeposit = await mockFa12TokenInstance.methods.approve(
//                 vaultAddress,
//                 mockFa12DepositAmount
//             ).send();
//             await setNewTokenAllowanceForDeposit.confirmation();

//             // eve deposits mock FA12 tokens into vault
//             const eveDepositMockFa12TokenOperation  = await vaultInstance.methods.deposit(
//                 mockFa12DepositAmount,           
//                 "mockFa12"
//             ).send();
//             await eveDepositMockFa12TokenOperation.confirmation();

//             console.log('   - vault collateral deposited: Mock FA-12 Tokens: ' + mockFa12DepositAmount);

            
//             // ----------------------------------------------------------------------------------------------
//             // Borrow with Vault
//             // ----------------------------------------------------------------------------------------------


//             // borrow amount - 4 Mock FA12 Tokens
//             const borrowAmount = 4000000;   

//             // borrow operation
//             const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
//             await eveBorrowOperation.confirmation();

//             console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName);

//             // get initial Mock FA12 Token balance for Eve (vault owner), liquidator, vault, Treasury and Token Pool Reward Contract
//             vaultOwnerMockFa12TokenAccount          =  await mockFa12TokenStorage.ledger.get(vaultOwner);            
//             initialVaultOwnerMockFa12TokenBalance   = vaultOwnerMockFa12TokenAccount == undefined ? 0 : vaultOwnerMockFa12TokenAccount.balance.toNumber();

//             vaultMockFa12TokenAccount               =  await mockFa12TokenStorage.ledger.get(vaultAddress);            
//             initialVaultMockFa12TokenBalance        = vaultMockFa12TokenAccount == undefined ? 0 : vaultMockFa12TokenAccount.balance.toNumber();

//             liquidatorMockFa12TokenAccount          =  await mockFa12TokenStorage.ledger.get(liquidator);            
//             initialLiquidatorMockFa12TokenBalance   = liquidatorMockFa12TokenAccount == undefined ? 0 : liquidatorMockFa12TokenAccount.balance.toNumber();

//             treasuryMockFa12TokenAccount            =  await mockFa12TokenStorage.ledger.get(treasuryAddress.address);            
//             initialTreasuryMockFa12TokenBalance     = treasuryMockFa12TokenAccount == undefined ? 0 : treasuryMockFa12TokenAccount.balance.toNumber();

//             lendingControllerMockFa12TokenAccount            =  await mockFa12TokenStorage.ledger.get(lendingControllerAddress.address);            
//             initialLendingControllerMockFa12TokenBalance     = lendingControllerMockFa12TokenAccount == undefined ? 0 : lendingControllerMockFa12TokenAccount.balance.toNumber();

//             // get token pool stats
//             lendingControllerStorage       = await lendingControllerInstance.storage();
//             vaultRecord                    = await lendingControllerStorage.vaults.get(vaultHandle);
//             loanTokenRecord                = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
            
//             loanTokenDecimals              = loanTokenRecord.tokenDecimals;
//             const interestRateDecimals     = (27 - 2); 

//             const tokenPoolTotal           = loanTokenRecord.tokenPoolTotal.toNumber() / (10 ** loanTokenDecimals.toNumber());
//             const totalBorrowed            = loanTokenRecord.totalBorrowed.toNumber() / (10 ** loanTokenDecimals.toNumber());
//             const optimalUtilisationRate   = Number(loanTokenRecord.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
//             const utilisationRate          = Number(loanTokenRecord.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
//             const currentInterestRate      = Number(loanTokenRecord.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";

//             console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);

            
//             // ----------------------------------------------------------------------------------------------
//             // Set Block Levels For Mock Time Test - 7 years
//             // ----------------------------------------------------------------------------------------------


//             await signerFactory(bob.sk); // temporarily set to tester to increase block levels

//             lendingControllerStorage    = await lendingControllerInstance.storage();
//             vaultRecord                 = await lendingControllerStorage.vaults.get(vaultHandle);
//             lastUpdatedBlockLevel       = vaultRecord.lastUpdatedBlockLevel;

//             const yearsPassed  = 7; 
//             mockLevelChange = yearsPassed * oneYearLevelBlocks;
//             newMockLevel = lastUpdatedBlockLevel.toNumber() + mockLevelChange;

//             const setMockLevelOperationOne = await lendingControllerInstance.methods.updateConfig(newMockLevel, 'configMockLevel').send();
//             await setMockLevelOperationOne.confirmation();

//             lendingControllerStorage = await lendingControllerInstance.storage();
//             currentMockLevel = lendingControllerStorage.config.mockLevel;

//             assert.equal(currentMockLevel, newMockLevel);

//             console.log('   - time set to ' + yearsPassed + ' years ahead: ' + lastUpdatedBlockLevel + ' to ' + newMockLevel + ' | Changed by: ' + mockLevelChange);


//             // ----------------------------------------------------------------------------------------------
//             // Vault Marked for liquidation
//             // ----------------------------------------------------------------------------------------------


//             await signerFactory(mallory.sk); // mallory as liquidator

//             const markVaultForLiquidationOperation = await lendingControllerInstance.methods.markForLiquidation(vaultId, vaultOwner).send();
//             await markVaultForLiquidationOperation.confirmation();

//             lendingControllerStorage                = await lendingControllerInstance.storage();
//             vaultRecord                             = await lendingControllerStorage.vaults.get(vaultHandle);
//             currentMockLevel                        = lendingControllerStorage.config.mockLevel.toNumber();            
//             tempMap                                 = lendingControllerStorage.tempMap;

//             const expectedMarkedForLiquidationLevel = currentMockLevel;
//             const expectedLiquidationEndLevel       = currentMockLevel + (liquidationMaxDuration * oneMinuteLevelBlocks);

//             initialVaultLoanOutstandingTotal        = vaultRecord.loanOutstandingTotal;
//             initialVaultLoanPrincipalTotal          = vaultRecord.loanPrincipalTotal;
//             initialVaultBorrowIndex                 = vaultRecord.borrowIndex;

//             const vaultMarkedForLiquidationLevel    = vaultRecord.markedForLiquidationLevel;
//             const vaultLiquidationEndLevel          = vaultRecord.liquidationEndLevel;

//             assert.equal(vaultMarkedForLiquidationLevel, expectedMarkedForLiquidationLevel);
//             assert.equal(vaultLiquidationEndLevel, expectedLiquidationEndLevel);

//             // test vault cannot be marked for liquidation if it has already been marked
//             const failMarkVaultForLiquidation = await lendingControllerInstance.methods.markForLiquidation(vaultId, vaultOwner);
//             await chai.expect(failMarkVaultForLiquidation.send()).to.be.rejected;


//             // ----------------------------------------------------------------------------------------------
//             // After marked for liquidation: set block level ahead by half of liquidationDelayinMins
//             // ----------------------------------------------------------------------------------------------


//             await signerFactory(bob.sk); // temporarily set to tester to increase block levels

//             lendingControllerStorage    = await lendingControllerInstance.storage();
//             vaultRecord                 = await lendingControllerStorage.vaults.get(vaultHandle);
//             markedForLiquidationLevel   = vaultRecord.markedForLiquidationLevel;

//             minutesPassed  = liquidationDelayInMins / 2; 
//             mockLevelChange = minutesPassed * oneMinuteLevelBlocks;
//             newMockLevel = markedForLiquidationLevel.toNumber() + mockLevelChange;

//             const setMockLevelOperationTwo = await lendingControllerInstance.methods.updateConfig(newMockLevel, 'configMockLevel').send();
//             await setMockLevelOperationTwo.confirmation();

//             lendingControllerStorage = await lendingControllerInstance.storage();
//             currentMockLevel = lendingControllerStorage.config.mockLevel;

//             assert.equal(currentMockLevel, newMockLevel);

//             console.log('   - time set to middle of vault liquidation delay: ' + markedForLiquidationLevel + ' to ' + newMockLevel + ' | Changed by: ' + mockLevelChange);

//             // test vault cannot be marked for liquidation if it has already been marked
//             const failMarkVaultForLiquidationAgain = await lendingControllerInstance.methods.markForLiquidation(vaultId, vaultOwner);
//             await chai.expect(failMarkVaultForLiquidationAgain.send()).to.be.rejected;

//             // test vault cannot be liquidated if delay has not been passed
//             const failTestLiquidationAmount = 10;
//             failLiquidateVaultOperation = await lendingControllerInstance.methods.liquidateVault(vaultId, vaultOwner, failTestLiquidationAmount);
//             await chai.expect(failLiquidateVaultOperation.send()).to.be.rejected;


//             // ----------------------------------------------------------------------------------------------
//             // Set Block Levels For Mock Time Test - immediately after delay ends
//             // ----------------------------------------------------------------------------------------------


//             await signerFactory(bob.sk); // temporarily set to tester to increase block levels

//             lendingControllerStorage    = await lendingControllerInstance.storage();
//             vaultRecord                 = await lendingControllerStorage.vaults.get(vaultHandle);
//             markedForLiquidationLevel   = vaultRecord.markedForLiquidationLevel;

//             minutesPassed  = liquidationDelayInMins + 1;
//             mockLevelChange = minutesPassed * oneMinuteLevelBlocks;
//             newMockLevel = markedForLiquidationLevel.toNumber() + mockLevelChange;

//             const setMockLevelOperationThree = await lendingControllerInstance.methods.updateConfig(newMockLevel, 'configMockLevel').send();
//             await setMockLevelOperationThree.confirmation();

//             lendingControllerStorage = await lendingControllerInstance.storage();
//             currentMockLevel = lendingControllerStorage.config.mockLevel;

//             assert.equal(currentMockLevel, newMockLevel);

//             console.log('   - time set to immediately after vault liquidation delay: ' + markedForLiquidationLevel + ' to ' + newMockLevel + ' | Changed by: ' + mockLevelChange);

            
//             // ----------------------------------------------------------------------------------------------
//             // Liquidate Vault
//             // ----------------------------------------------------------------------------------------------


//             await signerFactory(mallory.sk); 
//             const liquidationAmount = 100;

//             // mallory resets mock FA12 tokens allowance then set new allowance to liquidate amount
//             // reset token allowance
//             resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
//                 lendingControllerAddress.address,
//                 0
//             ).send();
//             await resetTokenAllowance.confirmation();

//             // set new token allowance
//             setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
//                 lendingControllerAddress.address,
//                 liquidationAmount
//             ).send();
//             await setNewTokenAllowance.confirmation();

//             liquidateVaultOperation = await lendingControllerInstance.methods.liquidateVault(vaultId, vaultOwner, liquidationAmount).send();
//             await liquidateVaultOperation.confirmation();

//             // ----------------------------------------------------------------------------------------------
//             // Vault calculations on loan outstanding, accrued interest, and liquidation fees
//             // ----------------------------------------------------------------------------------------------


//             // Update storage
//             lendingControllerStorage    = await lendingControllerInstance.storage();
//             mockFa12TokenStorage        = await mockFa12TokenInstance.storage();

//             // vault record
//             vaultRecord                 = await lendingControllerStorage.vaults.get(vaultHandle);
//             vaultLoanOutstandingTotal   = vaultRecord.loanOutstandingTotal;
//             vaultLoanPrincipalTotal     = vaultRecord.loanPrincipalTotal;
//             vaultLoanInterestTotal      = vaultRecord.loanInterestTotal;
//             vaultBorrowIndex            = vaultRecord.borrowIndex;

//             // loan token record
//             loanTokenRecord             = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
//             updatedLoanTokenBorrowIndex = loanTokenRecord.borrowIndex;

//             // vault calculations
//             loanOutstandingWithAccruedInterest      = lendingHelper.calculateAccruedInterest(initialVaultLoanOutstandingTotal, initialVaultBorrowIndex, updatedLoanTokenBorrowIndex);
//             totalInterest                           = loanOutstandingWithAccruedInterest - initialVaultLoanPrincipalTotal.toNumber();
//             remainingInterest                       = lendingHelper.calculateRemainingInterest(liquidationAmount, totalInterest)


//             // check that calculations are correct - use of almostEqual as there may be a slight difference of 1 from rounding errors 
//             assert.equal(almostEqual(vaultLoanOutstandingTotal, loanOutstandingWithAccruedInterest - liquidationAmount, 0.0001), true);
//             assert.equal(almostEqual(vaultLoanInterestTotal, totalInterest - liquidationAmount, 0.0001), true);


//             // liquidation calculations
//             adminLiquidationFee                     = lendingHelper.calculateAdminLiquidationFee(adminLiquidationFeePercent, liquidationAmount);
//             liquidationIncentive                    = lendingHelper.calculateLiquidationIncentive(liquidationFeePercent, liquidationAmount);
            
//             liquidationAmountWithIncentive          = liquidationAmount + liquidationIncentive;                       // amount sent to liquidator
//             liquidationAmountWithFeesAndIncentive   = liquidationAmount + liquidationIncentive + adminLiquidationFee; // total liquidated from vault

//             vaultMaxLiquidationAmount               = lendingHelper.calculateVaultMaxLiquidationAmount(vaultLoanOutstandingTotal, maxVaultLiquidationPercent);
//             totalLiquidationAmount                  = lendingHelper.calculateTotalLiquidationAmount(liquidationAmount, vaultMaxLiquidationAmount);
//             totalInterestPaid                       = lendingHelper.calculateTotalInterestPaid(totalLiquidationAmount, vaultLoanInterestTotal);
            
//             interestSentToTreasury                  = lendingHelper.calculateInterestSentToTreasury(interestTreasuryShare, totalInterestPaid)
//             interestRewards                         = lendingHelper.calculateInterestRewards(interestSentToTreasury, totalInterestPaid);

//             finalLoanOutstandingTotal               = lendingHelper.calculateFinalLoanOutstandingTotal(totalLiquidationAmount, loanOutstandingWithAccruedInterest);
//             finalLoanPrincipalTotal                 = lendingHelper.calculateFinalLoanPrincipalTotal(totalLiquidationAmount, loanOutstandingWithAccruedInterest, remainingInterest, initialVaultLoanPrincipalTotal);
//             finalLoanInterestTotal                  = lendingHelper.calculateFinalLoanInterestTotal(remainingInterest);
            
            
//             // ----------------------------------------------------------------------------------------------
//             // Accounts and Balances
//             // ----------------------------------------------------------------------------------------------


//             // get updated Mock FA12 Token balance for Eve (vault owner), liquidator, vault, Treasury and Token Pool Reward Contract
//             vaultOwnerMockFa12TokenAccount          =  await mockFa12TokenStorage.ledger.get(vaultOwner);            
//             updatedVaultOwnerMockFa12TokenBalance   = vaultOwnerMockFa12TokenAccount == undefined ? 0 : vaultOwnerMockFa12TokenAccount.balance.toNumber();

//             vaultMockFa12TokenAccount               =  await mockFa12TokenStorage.ledger.get(vaultAddress);            
//             updatedVaultMockFa12TokenBalance        = vaultMockFa12TokenAccount == undefined ? 0 : vaultMockFa12TokenAccount.balance.toNumber();

//             liquidatorMockFa12TokenAccount          =  await mockFa12TokenStorage.ledger.get(liquidator);            
//             updatedLiquidatorMockFa12TokenBalance   = liquidatorMockFa12TokenAccount == undefined ? 0 : liquidatorMockFa12TokenAccount.balance.toNumber();

//             treasuryMockFa12TokenAccount            =  await mockFa12TokenStorage.ledger.get(treasuryAddress.address);            
//             updatedTreasuryMockFa12TokenBalance     = treasuryMockFa12TokenAccount == undefined ? 0 : treasuryMockFa12TokenAccount.balance.toNumber();

//             lendingControllerMockFa12TokenAccount            =  await mockFa12TokenStorage.ledger.get(lendingControllerAddress.address);            
//             updatedLendingControllerMockFa12TokenBalance     = lendingControllerMockFa12TokenAccount == undefined ? 0 : lendingControllerMockFa12TokenAccount.balance.toNumber();


//             // --------------------------------------------------------
//             // Simple test note: in this case, since there is only one collateral token,
//             // the token proportion will be equal to 1 (i.e. 1e27) and there are no calculations for token proportions
//             // --------------------------------------------------------


//             // check that there are no changes to the vault owner's balance
//             assert.equal(updatedVaultOwnerMockFa12TokenBalance, initialVaultOwnerMockFa12TokenBalance);

//             // vault should have a total reduction in balance equal to liquidationAmountWithFeesAndIncentive
//             assert.equal(updatedVaultMockFa12TokenBalance, initialVaultMockFa12TokenBalance - liquidationAmountWithFeesAndIncentive);
            
//             // with a liquidation amount of 100, liquidator's incentive of 6%, liquidator will receive 106 after liquidation - total net gain will be 106 - 100 = 6
//             assert.equal(updatedLiquidatorMockFa12TokenBalance, initialLiquidatorMockFa12TokenBalance - liquidationAmount + liquidationAmountWithIncentive);

//             // treasury should receive both admin fee and share from interest repaid (e.g. 6% and 1% respectively -> with a liquidation amount of 100, treasury should receive 7)
//             assert.equal(updatedTreasuryMockFa12TokenBalance, initialTreasuryMockFa12TokenBalance + adminLiquidationFee + interestSentToTreasury);

//             // lending controller should receive interest rewards
//             assert.equal(updatedLendingControllerMockFa12TokenBalance, initialLendingControllerMockFa12TokenBalance + interestRewards);

//             // check vault records that loan outstanding has decreased
//             // - no change to vault loan principal as liquidation amount is not enough to cover total interest accrued
//             assert.equal(vaultLoanOutstandingTotal, loanOutstandingWithAccruedInterest - liquidationAmount);
//             assert.equal(vaultLoanPrincipalTotal.toNumber(), initialVaultLoanPrincipalTotal.toNumber());
//             assert.equal(vaultLoanInterestTotal, remainingInterest);


//             // ----------------------------------------------------------------------------------------------
//             // Test refund with liquidation amount greater than the maximum allowed
//             // ----------------------------------------------------------------------------------------------


//             // set initial variables to be used for subsequent calculations and comparisons
//             initialVaultBorrowIndex                 = vaultBorrowIndex;
//             initialVaultLoanOutstandingTotal        = vaultLoanOutstandingTotal; 
//             initialVaultLoanPrincipalTotal          = vaultLoanPrincipalTotal;
//             initialVaultLoanInterestTotal           = vaultLoanInterestTotal;
            
//             initialVaultMockFa12TokenBalance                = updatedVaultMockFa12TokenBalance
//             initialLiquidatorMockFa12TokenBalance           = updatedLiquidatorMockFa12TokenBalance;
//             initialTreasuryMockFa12TokenBalance             = updatedTreasuryMockFa12TokenBalance;
//             initialLendingControllerMockFa12TokenBalance    = updatedLendingControllerMockFa12TokenBalance;


//             // get new max liquidation amount - i.e. this will be the total liquidated amount with an overflow
//             vaultMaxLiquidationAmount = lendingHelper.calculateVaultMaxLiquidationAmount(vaultLoanOutstandingTotal, maxVaultLiquidationPercent);
            
//             const overflowAmount            = 100000000; // 100 Mock FA12 token
//             const overflowLiquidationAmount = vaultMaxLiquidationAmount + overflowAmount;

//             // mallory resets mock FA12 tokens allowance then set new allowance to liquidate amount
//             // reset token allowance
//             resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
//                 lendingControllerAddress.address,
//                 0
//             ).send();
//             await resetTokenAllowance.confirmation();

//             // set new token allowance
//             setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
//                 lendingControllerAddress.address,
//                 overflowLiquidationAmount
//             ).send();
//             await setNewTokenAllowance.confirmation();


//             // liquidate vault with overflow liquidation amount
//             const overflowLiquidateVault = await lendingControllerInstance.methods.liquidateVault(vaultId, vaultOwner, overflowLiquidationAmount).send();
//             await overflowLiquidateVault.confirmation();

//             // -------------------------------------
//             // Get updated storage
//             // -------------------------------------

//             // Update storage
//             lendingControllerStorage    = await lendingControllerInstance.storage();
//             mockFa12TokenStorage        = await mockFa12TokenInstance.storage();

//             // loan token record
//             loanTokenRecord             = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
//             updatedLoanTokenBorrowIndex = loanTokenRecord.borrowIndex;

//             // vault record
//             vaultRecord                 = await lendingControllerStorage.vaults.get(vaultHandle);
//             vaultLoanOutstandingTotal   = vaultRecord.loanOutstandingTotal;
//             vaultLoanPrincipalTotal     = vaultRecord.loanPrincipalTotal;
//             vaultLoanInterestTotal      = vaultRecord.loanInterestTotal;
//             vaultBorrowIndex            = vaultRecord.borrowIndex;


//             // i.e. vaultMaxLiquidationAmount will be the total liquidation amount as it is less than overflowLiquidationAmount
//             totalLiquidationAmount                  = lendingHelper.calculateTotalLiquidationAmount(overflowLiquidationAmount, vaultMaxLiquidationAmount);

//             // liquidation calculations
//             adminLiquidationFee                     = lendingHelper.calculateAdminLiquidationFee(adminLiquidationFeePercent, totalLiquidationAmount);
//             liquidationIncentive                    = lendingHelper.calculateLiquidationIncentive(liquidationFeePercent, totalLiquidationAmount);
            
//             liquidationAmountWithIncentive          = totalLiquidationAmount + liquidationIncentive;                       // amount sent to liquidator
//             liquidationAmountWithFeesAndIncentive   = totalLiquidationAmount + liquidationIncentive + adminLiquidationFee; // total liquidated from vault


//             // vault calculations
//             loanOutstandingWithAccruedInterest      = lendingHelper.calculateAccruedInterest(initialVaultLoanOutstandingTotal, initialVaultBorrowIndex, updatedLoanTokenBorrowIndex);
//             totalInterest                           = loanOutstandingWithAccruedInterest - initialVaultLoanPrincipalTotal.toNumber();
//             remainingInterest                       = lendingHelper.calculateRemainingInterest(totalLiquidationAmount, totalInterest);
//             totalInterestPaid                       = lendingHelper.calculateTotalInterestPaid(totalLiquidationAmount, totalInterest);

//             interestSentToTreasury                  = lendingHelper.calculateInterestSentToTreasury(interestTreasuryShare, totalInterestPaid)
//             interestRewards                         = lendingHelper.calculateInterestRewards(interestSentToTreasury, totalInterestPaid);

//             finalLoanOutstandingTotal               = lendingHelper.calculateFinalLoanOutstandingTotal(totalLiquidationAmount, loanOutstandingWithAccruedInterest);
//             finalLoanPrincipalTotal                 = lendingHelper.calculateFinalLoanPrincipalTotal(totalLiquidationAmount, loanOutstandingWithAccruedInterest, remainingInterest, initialVaultLoanPrincipalTotal);
//             finalLoanInterestTotal                  = lendingHelper.calculateFinalLoanInterestTotal(remainingInterest);


//             // get updated Mock FA12 Token balance for liquidator, vault, Treasury and Token Pool Reward Contract
//             vaultMockFa12TokenAccount               =  await mockFa12TokenStorage.ledger.get(vaultAddress);            
//             updatedVaultMockFa12TokenBalance        = vaultMockFa12TokenAccount == undefined ? 0 : vaultMockFa12TokenAccount.balance.toNumber();

//             liquidatorMockFa12TokenAccount          =  await mockFa12TokenStorage.ledger.get(liquidator);            
//             updatedLiquidatorMockFa12TokenBalance   = liquidatorMockFa12TokenAccount == undefined ? 0 : liquidatorMockFa12TokenAccount.balance.toNumber();

//             treasuryMockFa12TokenAccount            =  await mockFa12TokenStorage.ledger.get(treasuryAddress.address);            
//             updatedTreasuryMockFa12TokenBalance     = treasuryMockFa12TokenAccount == undefined ? 0 : treasuryMockFa12TokenAccount.balance.toNumber();

//             lendingControllerMockFa12TokenAccount            =  await mockFa12TokenStorage.ledger.get(lendingControllerAddress.address);            
//             updatedLendingControllerMockFa12TokenBalance     = lendingControllerMockFa12TokenAccount == undefined ? 0 : lendingControllerMockFa12TokenAccount.balance.toNumber();


//             // ----------------------------------------------------------------------------------------------
//             // Refund checks and assertions
//             // ----------------------------------------------------------------------------------------------


//             // vault should have a total reduction in balance equal to liquidationAmountWithFeesAndIncentive 
//             assert.equal(updatedVaultMockFa12TokenBalance, initialVaultMockFa12TokenBalance - liquidationAmountWithFeesAndIncentive);
            
//             // liquidator should not have a deficit in balance from the overflow of tokens sent to liquidate the vault 
//             assert.equal(updatedLiquidatorMockFa12TokenBalance, initialLiquidatorMockFa12TokenBalance - totalLiquidationAmount + liquidationAmountWithIncentive);

//             // treasury should receive both admin fee and share from interest repaid 
//             assert.equal(updatedTreasuryMockFa12TokenBalance, initialTreasuryMockFa12TokenBalance + adminLiquidationFee + interestSentToTreasury);

//             // lending controller should receive interest rewards
//             assert.equal(updatedLendingControllerMockFa12TokenBalance, initialLendingControllerMockFa12TokenBalance + (totalLiquidationAmount - interestSentToTreasury));

//             // check that final vault calculations are correct - use of almostEqual as there may be a slight difference of 1 from rounding errors 
//             assert.equal(vaultLoanOutstandingTotal, finalLoanOutstandingTotal);
//             assert.equal(vaultLoanPrincipalTotal, finalLoanPrincipalTotal);
//             assert.equal(vaultLoanInterestTotal, finalLoanInterestTotal);

//             // check that remaining loan outstanding total is correct 
//             // i.e. if maxVaultLiquidationPercent is 50%, then not more than 50% of the loan outstanding can be liquidated, and there should be 50% remaining
//             assert.equal(vaultLoanOutstandingTotal, initialVaultLoanOutstandingTotal - vaultMaxLiquidationAmount);

//             // test vault cannot be liquidated again 
//             failLiquidateVaultOperation = await lendingControllerInstance.methods.liquidateVault(vaultId, vaultOwner, failTestLiquidationAmount);
//             await chai.expect(failLiquidateVaultOperation.send()).to.be.rejected;

//         })

//     })

// });