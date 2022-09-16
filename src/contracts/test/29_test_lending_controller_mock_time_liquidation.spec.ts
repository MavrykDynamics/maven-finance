// const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
// const { InMemorySigner, importKey } = require("@taquito/signer");
// import assert, { ok, rejects, strictEqual } from "assert";
// import { Utils, zeroAddress, TEZ } from "./helpers/Utils";
// import fs from "fs";
// import { confirmOperation } from "../scripts/confirmation";

// const chai = require("chai");
// const chaiAsPromised = require('chai-as-promised');
// chai.use(chaiAsPromised);   
// chai.should();

// import env from "../env";
// import { alice, bob, eve, mallory } from "../scripts/sandbox/accounts";

// import doormanAddress from '../deployments/doormanAddress.json';
// import delegationAddress from '../deployments/delegationAddress.json';
// import mvkTokenAddress from '../deployments/mvkTokenAddress.json';
// import treasuryAddress from '../deployments/treasuryAddress.json';
// import governanceAddress from '../deployments/governanceAddress.json';
// import governanceProxyAddress from '../deployments/governanceProxyAddress.json';
// import mockFa12TokenAddress from '../deployments/mavrykFa12TokenAddress.json';
// import mockFa2TokenAddress from '../deployments/mavrykFa2TokenAddress.json';

// import mockUsdMockFa12TokenAggregatorAddress from "../deployments/mockUsdMockFa12TokenAggregatorAddress.json";
// import mockUsdMockFa2TokenAggregatorAddress from "../deployments/mockUsdMockFa2TokenAggregatorAddress.json";
// import mockUsdXtzAggregatorAddress from "../deployments/mockUsdXtzAggregatorAddress.json";

// import lpTokenPoolMockFa12TokenAddress from "../deployments/lpTokenPoolMockFa12TokenAddress.json";
// import lpTokenPoolMockFa2TokenAddress from "../deployments/lpTokenPoolMockFa2TokenAddress.json";
// import lpTokenPoolXtzAddress from "../deployments/lpTokenPoolXtzAddress.json";

// import lendingControllerAddress from '../deployments/lendingControllerMockTimeAddress.json';
// import lendingControllerMockTimeAddress from '../deployments/lendingControllerMockTimeAddress.json';

// import tokenPoolRewardAddress from '../deployments/tokenPoolRewardAddress.json';
// import vaultFactoryAddress from '../deployments/vaultFactoryAddress.json';
// import { vaultStorageType } from "./types/vaultStorageType"

// describe("Lending Controller (Mock Time) tests", async () => {
    
//     var utils: Utils

//     //  - eve: first vault loan token: mockFa12, second vault loan token: mockFa2, third vault loan token - tez
//     //  - mallory: first vault loan token: mockFa12, second vault loan token: mockFa2
//     var eveVaultSet = []
//     var malloryVaultSet = [] 

//     const oneDayLevelBlocks = 4320
//     const oneMonthLevelBlocks = 129600
//     const oneYearLevelBlocks = 1576800

//     const secondsInYears = 31536000
//     const fixedPointAccuracy = 10**27
    
//     let doormanInstance
//     let delegationInstance
//     let mvkTokenInstance
//     let treasuryInstance
//     let tokenPoolRewardInstance
    
//     let mockFa12TokenInstance
//     let mockFa2TokenInstance

//     let mockUsdMockFa12TokenAggregatorInstance
//     let mockUsdMockFa2TokenAggregatorInstance
//     let mockUsdXtzAggregatorInstance

//     let lpTokenPoolMockFa12TokenInstance
//     let lpTokenPoolMockFa2TokenInstance
//     let lpTokenPoolXtzInstance

//     let governanceInstance
//     let governanceProxyInstance

//     let lendingControllerInstance
//     let vaultFactoryInstance

//     let doormanStorage
//     let delegationStorage
//     let mvkTokenStorage
//     let treasuryStorage
//     let tokenPoolRewardStorage

//     let mockFa12TokenStorage
//     let mockFa2TokenStorage
//     let governanceStorage
//     let governanceProxyStorage
//     let mockUsdMockFa12TokenAggregatorStorage
//     let mockUsdMockFa2TokenAggregatorStorage
//     let mockUsdXtzAggregatorStorage

//     let lendingControllerStorage
//     let vaultFactoryStorage

//     let tokenOracles : {name : string, price : number, priceDecimals : number, tokenDecimals : number}[] = []
    
//     // Begin Helper Functions

//     const almostEqual = (actual, expected, delta) => {
//         let greaterLimit  = expected + expected * delta
//         let lowerLimit    = expected - expected * delta
//         // console.log("GREATER: ", greaterLimit) 
//         // console.log("LOWER: ", lowerLimit)
//         // console.log("STUDIED: ", actual)
//         return actual <= greaterLimit && actual >= lowerLimit
//     }


//     const calculateCompoundedInterest = (interestRate, lastUpdatedBlockLevel, blockLevel) => {

//         let interestRateOverSecondsInYear = Math.floor(interestRate / secondsInYears)
//         let exp = blockLevel - lastUpdatedBlockLevel

//         let expMinusOne = exp - 1
//         let expMinusTwo = exp - 2

//         let basePowerTwo = Math.floor((interestRateOverSecondsInYear ** 2) / (secondsInYears ** 2))
//         let basePowerThree = Math.floor((interestRateOverSecondsInYear ** 3) / (secondsInYears ** 3))

//         let firstTerm  = Math.floor(exp * interestRateOverSecondsInYear)
//         let secondTerm = Math.floor((exp * expMinusOne * basePowerTwo) / 2)
//         let thirdTerm  = Math.floor((exp * expMinusOne * expMinusTwo * basePowerThree) / 6)

//         let compoundedInterest = fixedPointAccuracy + firstTerm + secondTerm + thirdTerm

//         return compoundedInterest

//     }


//     const calculateUtilisationRate = (tokenPoolTotal, totalBorrowed) => {

//         let utilisationRate = Math.floor(totalBorrowed / tokenPoolTotal)
//         return utilisationRate

//     }
    

//     const calculateCurrentInterestRate = (utilisationRate, optimalUtilisationRate, baseInterestRate, interestRateBelowOptimalUtilisation, interestRateAboveOptimalUtilisation) => {

//         let currentInterestRate
//         let firstTerm = baseInterestRate

//         if(utilisationRate > optimalUtilisationRate){

//             let secondTerm = interestRateBelowOptimalUtilisation

//             let utilisationRateLessOptimalRate = utilisationRate - optimalUtilisationRate
//             let coefficientDenominator = fixedPointAccuracy - optimalUtilisationRate

//             let thirdTerm = Math.floor((utilisationRateLessOptimalRate / coefficientDenominator) * interestRateAboveOptimalUtilisation)

//             currentInterestRate = firstTerm + secondTerm + thirdTerm

//         } else {

//             let secondTermCoefficient = Math.floor(utilisationRate / optimalUtilisationRate)
//             let secondTerm = Math.floor(secondTermCoefficient * interestRateBelowOptimalUtilisation)

//             currentInterestRate = firstTerm + secondTerm
//         }

//         return currentInterestRate
//     }


//     const calculateBorrowIndex = (compoundedInterest, currentBorrowIndex) => {
//         return Math.floor((currentBorrowIndex * compoundedInterest) / fixedPointAccuracy)
//     }


//     const calculateAccruedInterest = (currentLoanOutstandingTotal, vaultBorrowIndex, tokenBorrowIndex) => {

//         let newLoanOutstandingTotal = 0
        
//         if(currentLoanOutstandingTotal > 0){
//             if(vaultBorrowIndex > 0){
//                 newLoanOutstandingTotal = Math.floor((currentLoanOutstandingTotal * tokenBorrowIndex) / vaultBorrowIndex)
//             }
//         }

//         return newLoanOutstandingTotal
//     }

//     const calculateInterestTreasuryShare = (interestTreasuryShare, totalInterestPaid) => {
//         let interestSentToTreasury = Math.floor((totalInterestPaid * interestTreasuryShare) / 10000);
//         return interestSentToTreasury
//     }


//     const rebaseTokenValue = (tokenValueRaw, rebaseDecimals) => {
//         return tokenValueRaw * (10 ** rebaseDecimals);
//     }


//     const calculateVaultCollateralValue = (collateralBalanceLedger) => {
        
//         let mockFa12Balance             = collateralBalanceLedger.get('mockFa12') == undefined ? 0 : collateralBalanceLedger.get('mockFa12');
//         let mockFa2Balance              = collateralBalanceLedger.get('mockFa2')  == undefined ? 0 : collateralBalanceLedger.get('mockFa2');
//         let xtzBalance                  = collateralBalanceLedger.get('tez')      == undefined ? 0 : collateralBalanceLedger.get('tez');

//         let mockFa12TokenPrice          = tokenOracles.find(o => o.name === "mockFa12").price;
//         let mockFa2TokenPrice           = tokenOracles.find(o => o.name === "mockFa2").price;
//         let tezPrice                    = tokenOracles.find(o => o.name === "tez").price;

//         let mockFa12TokenPriceDecimals  = tokenOracles.find(o => o.name === "mockFa12").priceDecimals;
//         let mockFa2TokenPriceDecimals   = tokenOracles.find(o => o.name === "mockFa2").priceDecimals;
//         let tezPriceDecimals            = tokenOracles.find(o => o.name === "tez").priceDecimals;

//         let mockFa12TokenDecimals       = tokenOracles.find(o => o.name === "mockFa12").tokenDecimals;
//         let mockFa2TokenDecimals        = tokenOracles.find(o => o.name === "mockFa2").tokenDecimals;
//         let tezTokenDecimals            = tokenOracles.find(o => o.name === "tez").tokenDecimals;

//         // rebased to no decimals (Math.floor to simulate smart contract division)
//         let vaultMockFa12TokenValue     = Math.floor(Math.floor(mockFa12Balance / (10 ** mockFa12TokenDecimals)) * mockFa12TokenPrice) / (10 ** mockFa12TokenPriceDecimals);
//         let vaultMockFa2TokenValue      = Math.floor(Math.floor(mockFa2Balance  / (10 ** mockFa2TokenDecimals))  * mockFa2TokenPrice)  / (10 ** mockFa2TokenPriceDecimals);
//         let vaultXtzValue               = Math.floor(Math.floor(xtzBalance      / (10 ** tezTokenDecimals))      * tezPrice)           / (10 ** tezPriceDecimals);
        
//         let vaultCollateralValue        = vaultMockFa12TokenValue + vaultMockFa2TokenValue + vaultXtzValue;

//         return vaultCollateralValue
//     }


//     const isUnderCollaterized = (collateralRatio, loanOutstandingTotal, vaultCollateralValue) => {
//         let maxLoanValue = (vaultCollateralValue * collateralRatio) / 1000;
//         if(loanOutstandingTotal > maxLoanValue){
//             // is under collaterized (not enough collateral for loans)
//             return true;
//         } else {
//             // is over collaterized (enough collateral for loans)
//             return false;
//         }
//     }


//     const isLiquidatable = (liquidationRatio, loanOutstandingTotal, vaultCollateralValue) => {
//         let liquidationThresholdValue = (vaultCollateralValue * liquidationRatio) / 1000;
//         if(loanOutstandingTotal > liquidationThresholdValue){
//             // is liquidatable
//             return true;
//         } else {
//             // is not liquidatable
//             return false;
//         }
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
//         tokenPoolRewardInstance                 = await utils.tezos.contract.at(tokenPoolRewardAddress.address);

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

//         lendingControllerInstance               = await utils.tezos.contract.at(lendingControllerMockTimeAddress.address);
//         vaultFactoryInstance                    = await utils.tezos.contract.at(vaultFactoryAddress.address);

//         doormanStorage                          = await doormanInstance.storage();
//         delegationStorage                       = await delegationInstance.storage();
//         mvkTokenStorage                         = await mvkTokenInstance.storage();
//         treasuryStorage                         = await treasuryInstance.storage();
//         tokenPoolRewardStorage                  = await tokenPoolRewardInstance.storage();

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

//         tokenOracles.push({
//             'name': 'mockFa12', 
//             'price': parseInt(mockUsdMockFa12TokenAggregatorStorage.lastCompletedRoundPrice.price),
//             'priceDecimals': parseInt(mockUsdMockFa12TokenAggregatorStorage.config.decimals),
//             'tokenDecimals': 0
//         })

//         tokenOracles.push({
//             'name': 'mockFa2', 
//             'price': parseInt(mockUsdMockFa2TokenAggregatorStorage.lastCompletedRoundPrice.price),
//             'priceDecimals': parseInt(mockUsdMockFa2TokenAggregatorStorage.config.decimals),
//             'tokenDecimals': 0
//         })

//         tokenOracles.push({
//             'name': 'tez', 
//             'price': parseInt(mockUsdXtzAggregatorStorage.lastCompletedRoundPrice.price),
//             'priceDecimals': parseInt(mockUsdXtzAggregatorStorage.config.decimals),
//             'tokenDecimals': 0
//         })

//         console.log('-- -- -- -- -- Lending Controller (Mock Time) Tests -- -- -- --')
//         console.log('Doorman Contract deployed at:'             , doormanInstance.address);
//         console.log('Delegation Contract deployed at:'          , delegationInstance.address);
//         console.log('MVK Token Contract deployed at:'           , mvkTokenInstance.address);
//         console.log('Lending Treasury Contract deployed at:'    , treasuryInstance.address);
//         console.log('Token Pool Reward Contract deployed at:'   , tokenPoolRewardInstance.address);

//         console.log('Mock FA12 Token Contract deployed at:'     , mockFa12TokenInstance.address);
//         console.log('Mock FA2 Token Contract deployed at:'      , mockFa2TokenInstance.address);
//         console.log('Governance Contract deployed at:'          , governanceInstance.address);
//         console.log('Governance Proxy Contract deployed at:'    , governanceProxyInstance.address);

//         console.log('LP Token Pool - Mock FA12 Token - deployed at:'    , lpTokenPoolMockFa12TokenInstance.address);
//         console.log('LP Token Pool - Mock FA2 Token - deployed at:'     , lpTokenPoolMockFa2TokenInstance.address);
//         console.log('LP Token Pool - XTZ - deployed at:'                , lpTokenPoolXtzInstance.address);

//         console.log('Mock Aggregator - USD / Mock FA12 Token - deployed at:'    , mockUsdMockFa12TokenAggregatorInstance.address);
//         console.log('Mock Aggregator - USD / Mock FA2 Token - deployed at:'     , mockUsdMockFa2TokenAggregatorInstance.address);
//         console.log('Mock Aggregator - USD / XTZ - deployed at:'                , mockUsdXtzAggregatorInstance.address);

//         console.log('Lending Controller Mock Time Contract deployed at:'        , lendingControllerInstance.address);

//         console.log('Alice address: ' + alice.pkh);
//         console.log('Bob address: '   + bob.pkh);
//         console.log('Eve address: '   + eve.pkh);

//     });



//     // 
//     // Setup and test Lending Controller SetLoanToken entrypoint
//     //
//     describe('%setLoanToken - setup and test lending controller %setLoanToken entrypoint', function () {

//         it('admin can set lending controller mock FA12 loan token', async () => {

//             try{        
                
//                 // init variables
//                 await signerFactory(bob.sk);

//                 const tokenName                             = "mockFa12";
//                 const tokenContractAddress                  = mockFa12TokenAddress.address;
//                 const tokenType                             = "fa12";
//                 const tokenDecimals                         = 6;

//                 const oracleType                            = "oracle";
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
                        
//                         tokenName,
//                         tokenDecimals,

//                         oracleType,
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
//                     // assert.equal(mockFa12LoanToken.tokenContractAddress   , tokenContractAddress);
    
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
//                     // assert.equal(mockFa12LoanToken.tokenContractAddress   , tokenContractAddress);

//                 }

//             } catch(e){
//                 console.log(e);
//             } 
//         });

//         it('admin can set lending controller mock FA2 loan token', async () => {

//             try{        
                
//                 // init variables
//                 await signerFactory(bob.sk);

//                 const tokenName                             = "mockFa2";
//                 const tokenContractAddress                  = mockFa2TokenAddress.address;
//                 const tokenType                             = "fa2";
//                 const tokenId                               = 0;
//                 const tokenDecimals                         = 6;

//                 const oracleType                            = "oracle";
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
                        
//                         tokenName,
//                         tokenDecimals,

//                         oracleType,
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
//                     // assert.equal(mockFa2LoanToken.tokenContractAddress   , tokenContractAddress);
//                     // assert.equal(mockFa2LoanToken.tokenId                , tokenId);

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
//                     // assert.equal(mockFa2LoanToken.tokenContractAddress   , tokenContractAddress);
//                     // assert.equal(mockFa2LoanToken.tokenId                , tokenId);

//                 }
                
                
//             } catch(e){
//                 console.log(e);
//             } 
//         });


//         it('admin can set lending controller tez loan token', async () => {

//             try{        
                
//                 // init variables
//                 await signerFactory(bob.sk);

//                 const tokenName                             = "tez";
//                 const tokenType                             = "tez";
//                 const tokenDecimals                         = 6;

//                 const oracleType                            = "oracle";
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
                        
//                         tokenName,
//                         tokenDecimals,

//                         oracleType,
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

//                 const tokenName                             = "failTestLoanToken";
//                 const tokenContractAddress                  = mockFa2TokenAddress.address;
//                 const tokenType                             = "fa2";
//                 const tokenId                               = 0;
//                 const tokenDecimals                         = 6;

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
                        
//                     tokenName,
//                     tokenDecimals,

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
//     // Setup and test Lending Controller UpdateCollateralToken entrypoint - tokens which vault owners can use as collateral
//     //
//     describe('%updateCollateralToken - setup and test lending controller %updateCollateralToken entrypoint', function () {

//         it('admin can set lending controller mock FA12 as a collateral token', async () => {

//             try{        
                
//                 // init variables
//                 await signerFactory(bob.sk);

//                 const tokenName                  = "mockFa12";
//                 const tokenContractAddress       = mockFa12TokenAddress.address;
//                 const tokenType                  = "fa12";
//                 const tokenId                    = 0;

//                 const tokenDecimals              = 6;
//                 const oracleType                 = "oracle";
//                 const oracleAddress              = mockUsdMockFa12TokenAggregatorAddress.address;
                
//                 // check if collateral token exists
//                 const checkCollateralTokenExists   = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

//                 if(checkCollateralTokenExists === undefined){

//                     const adminSetMockFa12CollateralTokenOperation = await lendingControllerInstance.methods.updateCollateralToken(
                        
//                         tokenName,
//                         tokenContractAddress,
//                         tokenDecimals,

//                         oracleType,
//                         oracleAddress,

//                         // fa12 token type - token contract address
//                         tokenType,
//                         tokenContractAddress,

//                     ).send();
//                     await adminSetMockFa12CollateralTokenOperation.confirmation();

//                     lendingControllerStorage        = await lendingControllerInstance.storage();
//                     const mockFa12CollateralToken   = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 
                
//                     assert.equal(mockFa12CollateralToken.tokenName              , tokenName);
//                     // assert.equal(mockFa12CollateralToken.tokenContractAddress   , tokenContractAddress);
//                     // assert.equal(mockFa12CollateralToken.tokenId                , tokenId);

//                     assert.equal(mockFa12CollateralToken.tokenDecimals          , tokenDecimals);
//                     assert.equal(mockFa12CollateralToken.oracleType             , oracleType);
//                     assert.equal(mockFa12CollateralToken.oracleAddress          , oracleAddress);

//                 }
                

//             } catch(e){
//                 console.log(e);
//             } 
//         });

//         it('admin can set lending controller mock FA2 collateral token', async () => {

//             try{        
                
//                 // init variables
//                 await signerFactory(bob.sk);

//                 const tokenName                             = "mockFa2";
//                 const tokenContractAddress                  = mockFa2TokenAddress.address;
//                 const tokenType                             = "fa2";
//                 const tokenId                               = 0;

//                 const tokenDecimals                         = 6;
//                 const oracleType                            = "oracle";
//                 const oracleAddress                         = mockUsdMockFa2TokenAggregatorAddress.address;;
                
//                 // check if collateral token exists
//                 const checkCollateralTokenExists   = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

//                 if(checkCollateralTokenExists === undefined){

//                     const adminSetMockFa2CollateralTokenOperation = await lendingControllerInstance.methods.updateCollateralToken(
                        
//                         tokenName,
//                         tokenContractAddress,
//                         tokenDecimals,

//                         oracleType,
//                         oracleAddress,
                        
//                         // fa2 token type - token contract address + token id
//                         tokenType,
//                         tokenContractAddress,
//                         tokenId

//                     ).send();
//                     await adminSetMockFa2CollateralTokenOperation.confirmation();

//                     lendingControllerStorage        = await lendingControllerInstance.storage();
//                     const mockFa2CollateralToken    = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

//                     assert.equal(mockFa2CollateralToken.tokenName              , tokenName);
//                     // assert.equal(mockFa2CollateralToken.tokenContractAddress   , tokenContractAddress);
//                     // assert.equal(mockFa2CollateralToken.tokenId                , tokenId);

//                     assert.equal(mockFa2CollateralToken.tokenDecimals          , tokenDecimals);
//                     assert.equal(mockFa2CollateralToken.oracleType             , oracleType);
//                     assert.equal(mockFa2CollateralToken.oracleAddress          , oracleAddress);

//                 }

//             } catch(e){
//                 console.log(e);
//             } 
//         });

//         it('admin can set lending controller tez collateral token', async () => {

//             try{        
                
//                 // init variables
//                 await signerFactory(bob.sk);

//                 const tokenName                             = "tez";
//                 const tokenContractAddress                  = zeroAddress;
//                 const tokenType                             = "tez";
//                 const tokenId                               = 0;

//                 const tokenDecimals                         = 6;
//                 const oracleType                            = "oracle";
//                 const oracleAddress                         = mockUsdXtzAggregatorAddress.address;;
                
//                 // check if collateral token exists
//                 const checkCollateralTokenExists   = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

//                 if(checkCollateralTokenExists === undefined){

//                     const adminSetMockFa2CollateralTokenOperation = await lendingControllerInstance.methods.updateCollateralToken(
                        
//                         tokenName,
//                         tokenContractAddress,
//                         tokenDecimals,

//                         oracleType,
//                         oracleAddress,
                        
//                         // fa2 token type - token contract address + token id
//                         tokenType,
//                         tokenContractAddress,
//                         tokenId

//                     ).send();
//                     await adminSetMockFa2CollateralTokenOperation.confirmation();

//                     lendingControllerStorage        = await lendingControllerInstance.storage();
//                     const mockFa2CollateralToken    = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

//                     assert.equal(mockFa2CollateralToken.tokenName              , tokenName);
//                     // assert.equal(mockFa2CollateralToken.tokenContractAddress   , tokenContractAddress);
//                     // assert.equal(mockFa2CollateralToken.tokenId                , tokenId);

//                     assert.equal(mockFa2CollateralToken.tokenDecimals          , tokenDecimals);
//                     assert.equal(mockFa2CollateralToken.oracleType             , oracleType);
//                     assert.equal(mockFa2CollateralToken.oracleAddress          , oracleAddress);

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

//                 const tokenName                             = "failTestCollateralToken";
//                 const tokenContractAddress                  = mockFa2TokenAddress.address;
//                 const tokenType                             = "fa2";
//                 const tokenId                               = 0;

//                 const tokenDecimals                         = 6;
//                 const oracleType                            = "oracle";
//                 const oracleAddress                         = zeroAddress;
            

//                 await chai.expect(lendingControllerInstance.methods.updateCollateralToken(
                        
//                     tokenName,
//                     tokenContractAddress,
//                     tokenDecimals,

//                     oracleType,
//                     oracleAddress,
                    
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
//             const eveInitialMockFa12TokenBalance    = eveMockFa12Ledger == undefined ? 0 : parseInt(eveMockFa12Ledger.balance);

//             // get initial eve's Token Pool FA2 LP - Mock FA12 Token - balance
//             const eveLpTokenPoolMockFa12Ledger                 = await lpTokenPoolMockFa12TokenStorage.ledger.get(eve.pkh);            
//             const eveInitialLpTokenPoolMockFa12TokenBalance    = eveLpTokenPoolMockFa12Ledger == undefined ? 0 : parseInt(eveLpTokenPoolMockFa12Ledger);

//             // get initial lending controller's Mock FA12 Token balance
//             const lendingControllerMockFa12Ledger                = await mockFa12TokenStorage.ledger.get(lendingControllerAddress.address);            
//             const lendingControllerInitialMockFa12TokenBalance   = lendingControllerMockFa12Ledger == undefined ? 0 : parseInt(lendingControllerMockFa12Ledger.balance);

//             // get initial lending controller token pool total
//             const initialLoanTokenRecord                 = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
//             const lendingControllerInitialTokenPoolTotal = parseInt(initialLoanTokenRecord.tokenPoolTotal);

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
//             const eveInitialMockFa2TokenBalance    = eveMockFa2Ledger == undefined ? 0 : parseInt(eveMockFa2Ledger);

//             // get initial eve's Token Pool FA2 LP - Mock FA2 Token - balance
//             const eveLpTokenPoolMockFa2Ledger                 = await lpTokenPoolMockFa2TokenStorage.ledger.get(eve.pkh);            
//             const eveInitialLpTokenPoolMockFa2TokenBalance    = eveLpTokenPoolMockFa2Ledger == undefined ? 0 : parseInt(eveLpTokenPoolMockFa2Ledger);

//             // get initial lending controller's Mock FA2 Token balance
//             const lendingControllerMockFa2Ledger                = await mockFa2TokenStorage.ledger.get(lendingControllerAddress.address);            
//             const lendingControllerInitialMockFa2TokenBalance   = lendingControllerMockFa2Ledger == undefined ? 0 : parseInt(lendingControllerMockFa2Ledger);

//             // get initial lending controller token pool total
//             const initialLoanTokenRecord                 = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
//             const lendingControllerInitialTokenPoolTotal = parseInt(initialLoanTokenRecord.tokenPoolTotal);

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
//             const eveInitialLpTokenPoolXtzBalance    = eveLpTokenPoolXtzLedger == undefined ? 0 : parseInt(eveLpTokenPoolXtzLedger);
            
//             // get initial lending controller's XTZ balance
//             const lendingControllerInitialXtzLedger   = await utils.tezos.tz.getBalance(lendingControllerAddress.address);
//             const lendingControllerInitialXtzBalance  = lendingControllerInitialXtzLedger.toNumber();

//             // get initial lending controller token pool total
//             const initialLoanTokenRecord                 = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
//             const lendingControllerInitialTokenPoolTotal = parseInt(initialLoanTokenRecord.tokenPoolTotal);

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

    



// });