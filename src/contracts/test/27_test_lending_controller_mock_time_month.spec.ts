// const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
// const { InMemorySigner, importKey } = require("@taquito/signer");
// import assert, { ok, rejects, strictEqual } from "assert";
// import { Utils, zeroAddress } from "./helpers/Utils";
// import fs from "fs";
// import { confirmOperation } from "../scripts/confirmation";
// import * as lendingHelper from "./helpers/lendingHelpers"
// import { BigNumber } from 'bignumber.js'

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

// import mTokenUsdtAddress  from "../deployments/mTokenUsdtAddress.json";
// import mTokenEurlAddress   from "../deployments/mTokenEurlAddress.json";
// import mTokenXtzAddress            from "../deployments/mTokenXtzAddress.json";

// import lendingControllerAddress         from '../deployments/lendingControllerMockTimeAddress.json';
// import lendingControllerMockTimeAddress from '../deployments/lendingControllerMockTimeAddress.json';

// import vaultFactoryAddress              from '../deployments/vaultFactoryAddress.json';
// import { vaultStorageType }             from "./types/vaultStorageType"

// describe("Lending Controller (Mock Time - One Month) tests", async () => {
    
//     var utils: Utils

//     //  - eve: first vault loan token: mockFa12, second vault loan token: mockFa2, third vault loan token - tez
//     //  - mallory: first vault loan token: mockFa12, second vault loan token: mockFa2
//     var eveVaultSet = []
//     var malloryVaultSet = [] 

//     let updateTokenRewardIndexOperation

//     // 3 seconds blocks (docker sandbox)
//     const oneDayLevelBlocks   = 28800
//     const oneMonthLevelBlocks = 864000
//     const oneYearLevelBlocks  = 10512000 // 365 days

//     const secondsInYears = 31536000
//     const fixedPointAccuracy = 10**27
    
//     let doormanInstance
//     let delegationInstance
//     let mvkTokenInstance
//     let treasuryInstance
    
//     let mockFa12TokenInstance
//     let mockFa2TokenInstance

//     let mockUsdMockFa12TokenAggregatorInstance
//     let mockUsdMockFa2TokenAggregatorInstance
//     let mockUsdXtzAggregatorInstance
//     let mockUsdMvkAggregatorInstance

//     let mockUsdMockFa12TokenAggregatorStorage
//     let mockUsdMockFa2TokenAggregatorStorage
//     let mockUsdXtzAggregatorStorage
//     let mockUsdMvkAggregatorStorage

//     let mTokenUsdtInstance
//     let mTokenEurlInstance
//     let mTokenXtzInstance

//     let governanceInstance
//     let governanceProxyInstance

//     let lendingControllerInstance
//     let vaultFactoryInstance

//     let doormanStorage
//     let delegationStorage
//     let mvkTokenStorage
//     let treasuryStorage

//     let mockFa12TokenStorage
//     let mockFa2TokenStorage
//     let governanceStorage
//     let governanceProxyStorage
    
//     let lendingControllerStorage
//     let vaultFactoryStorage

//     let vaultRecordView
//     let updatedVaultRecordView
//     let loanTokenRecordView
//     let updatedLoanTokenRecordView

//     let loanTokenRecord
//     let initialLoanTokenRecord
//     let updatedLoanTokenRecord

//     let initialTokenRewardIndex
//     let updatedTokenRewardIndex
//     let tokenRewardIndexIncrement

//     let initialTokenPoolTotal
//     let updatedTokenPoolTotal

//     let mTokenView
//     let initialMTokenBalance 
//     let updatedMTokenBalance
//     let initialUserRewardIndex 

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

//         mTokenUsdtInstance        = await utils.tezos.contract.at(mTokenUsdtAddress.address);
//         mTokenEurlInstance         = await utils.tezos.contract.at(mTokenEurlAddress.address);
//         mTokenXtzInstance                  = await utils.tezos.contract.at(mTokenXtzAddress.address);

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
//             'price': mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.data.toNumber(),
//             'priceDecimals': mockUsdMockFa12TokenAggregatorStorage.config.decimals.toNumber(),
//             'tokenDecimals': 0
//         })

//         tokenOracles.push({
//             'name': 'mockFa2', 
//             'price': mockUsdMockFa2TokenAggregatorStorage.lastCompletedData.data.toNumber(),
//             'priceDecimals': mockUsdMockFa2TokenAggregatorStorage.config.decimals.toNumber(),
//             'tokenDecimals': 0
//         })

//         tokenOracles.push({
//             'name': 'tez', 
//             'price': mockUsdXtzAggregatorStorage.lastCompletedData.data.toNumber(),
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

//         console.log('mTokenUsdt - deployed at:'    , mTokenUsdtInstance.address);
//         console.log('mTokenEurl - deployed at:'     , mTokenEurlInstance.address);
//         console.log('mTokenXtz - deployed at:'                , mTokenXtzInstance.address);

//         console.log('Mock Aggregator - USD / Mock FA12 Token - deployed at:'    , mockUsdMockFa12TokenAggregatorInstance.address);
//         console.log('Mock Aggregator - USD / Mock FA2 Token - deployed at:'     , mockUsdMockFa2TokenAggregatorInstance.address);
//         console.log('Mock Aggregator - USD / XTZ - deployed at:'                , mockUsdXtzAggregatorInstance.address);

//         console.log('Lending Controller Mock Time Contract deployed at:'        , lendingControllerInstance.address);

//         console.log('Alice address: ' + alice.pkh);
//         console.log('Bob address: '   + bob.pkh);
//         console.log('Eve address: '   + eve.pkh);

//         // ------------------------------------------------------------------
//         //
//         // Update mTokens (i.e. mTokens) tokenRewardIndex by transferring 0
//         //  - this will ensure that fetching user balances through on-chain views are accurate for continuous re-testing
//         //
//         // ------------------------------------------------------------------
//         await signerFactory(bob.sk);

//         const mockFa12LoanToken = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt("mockFa12").executeView({ viewCaller : bob.pkh});
//         const mockFa2LoanToken  = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt("mockFa2").executeView({ viewCaller : bob.pkh});
//         const tezLoanToken      = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt("tez").executeView({ viewCaller : bob.pkh});
        
//         if(!(mockFa12LoanToken == undefined || mockFa12LoanToken == null)){
//             updateTokenRewardIndexOperation = await mTokenUsdtInstance.methods.transfer([
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

//         if(!(mockFa2LoanToken == undefined || mockFa2LoanToken == null)){
//             updateTokenRewardIndexOperation = await mTokenEurlInstance.methods.transfer([
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

//         if(!(tezLoanToken == undefined || tezLoanToken == null)){
//             updateTokenRewardIndexOperation = await mTokenXtzInstance.methods.transfer([
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

//                 const mTokenContractAddress                = mTokenUsdtAddress.address;

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

//                         mTokenContractAddress,
                        
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

// //                     assert.equal(mockFa12LoanToken.tokenName              , tokenName);
    
//                     assert.equal(mockFa12LoanToken.mTokensTotal          , 0);
//                     assert.equal(mockFa12LoanToken.mTokenAddress , mTokenContractAddress);
    
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

//                 const mTokenContractAddress                = mTokenEurlAddress.address;

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

//                         mTokenContractAddress,
                        
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

//                     assert.equal(mockFa2LoanToken.mTokensTotal          , 0);
//                     assert.equal(mockFa2LoanToken.mTokenAddress , mTokenContractAddress);

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

//                 const mTokenContractAddress                = mTokenXtzAddress.address;

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

//                         mTokenContractAddress,
                        
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

//                     assert.equal(tezLoanToken.mTokensTotal          , 0);
//                     assert.equal(tezLoanToken.mTokenAddress , mTokenContractAddress);
    
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

//                 const mTokenContractAddress                = mTokenEurlAddress.address;

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

//                     mTokenContractAddress,
                    
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
                
//                 const isScaledToken                     = false;
//                 const isStakedToken                     = false;
//                 const stakingContractAddress            = null;
                
//                 const maxDepositAmount                  = null;

                
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
                        
//                         isScaledToken,
//                         isStakedToken,
//                         stakingContractAddress,

//                         maxDepositAmount,

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
                
//                 const isScaledToken                         = false;
//                 const isStakedToken                         = false;
//                 const stakingContractAddress                = null;
                
//                 const maxDepositAmount                      = null;

                
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

//                         isScaledToken,
//                         isStakedToken,
//                         stakingContractAddress,

//                         maxDepositAmount,
                        
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

//                 const isScaledToken                         = false;
//                 const isStakedToken                         = false;
//                 const stakingContractAddress                = null;
                
//                 const maxDepositAmount                      = null;
                
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

//                         isScaledToken,
//                         isStakedToken,
//                         stakingContractAddress,

//                         maxDepositAmount,
                        
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

//                 const isScaledToken                         = false;
//                 const isStakedToken                         = false;
//                 const stakingContractAddress                = null;
                
//                 const maxDepositAmount                      = null;
            

//                 await chai.expect(lendingControllerInstance.methods.setCollateralToken(
                        
//                     setCollateralTokenActionType,

//                     tokenName,
//                     tokenContractAddress,
//                     tokenDecimals,

//                     oracleAddress,
//                     tokenProtected,

//                     isScaledToken,
//                     isStakedToken,
//                     stakingContractAddress,

//                     maxDepositAmount,
                    
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
//             const mTokenPoolMockFa12TokenStorage   = await mTokenUsdtInstance.storage();

//             // get initial eve's Mock FA12 Token balance
//             const eveMockFa12Ledger                 = await mockFa12TokenStorage.ledger.get(eve.pkh);            
//             const eveInitialMockFa12TokenBalance    = eveMockFa12Ledger == undefined ? 0 : eveMockFa12Ledger.balance.toNumber();

//             // get initial eve's mEurl Token - Mock FA12 Token - balance
//             const eveMUsdtTokenLedger                 = await mTokenPoolMockFa12TokenStorage.ledger.get(eve.pkh);            
//             const eveInitialMUsdtTokenTokenBalance    = eveMUsdtTokenLedger == undefined ? 0 : eveMUsdtTokenLedger.toNumber();

//             // get initial lending controller's Mock FA12 Token balance
//             const lendingControllerMockFa12Ledger                = await mockFa12TokenStorage.ledger.get(lendingControllerAddress.address);            
//             const lendingControllerInitialMockFa12TokenBalance   = lendingControllerMockFa12Ledger == undefined ? 0 : lendingControllerMockFa12Ledger.balance.toNumber();

//             // get initial lending controller token pool total
//             initialLoanTokenRecord                 = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
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
//             const updatedMUsdtTokenTokenStorage  = await mTokenUsdtInstance.storage();

//             // check new balance for loan token pool total
//             updatedLoanTokenRecord           = await updatedLendingControllerStorage.loanTokenLedger.get(loanTokenName);
//             assert.equal(updatedLoanTokenRecord.tokenPoolTotal, lendingControllerInitialTokenPoolTotal + liquidityAmount);

//             // check Eve's Mock FA12 Token balance
//             const updatedEveMockFa12Ledger         = await updatedMockFa12TokenStorage.ledger.get(eve.pkh);            
//             assert.equal(updatedEveMockFa12Ledger.balance, eveInitialMockFa12TokenBalance - liquidityAmount);

//             // check Lending Controller's Mock FA12 Token Balance
//             const lendingControllerMockFa12Account  = await updatedMockFa12TokenStorage.ledger.get(lendingControllerAddress.address);            
//             assert.equal(lendingControllerMockFa12Account.balance, lendingControllerInitialMockFa12TokenBalance + liquidityAmount);

//             // check Eve's mUsdt Token Token balance
//             const updatedEveMUsdtTokenLedger        = await updatedMUsdtTokenTokenStorage.ledger.get(eve.pkh);            
//             assert.equal(updatedEveMUsdtTokenLedger, eveInitialMUsdtTokenTokenBalance + liquidityAmount);        

//         });

//         it('user (eve) can add liquidity for mock FA2 token into Lending Controller token pool (100 MockFA2 Tokens)', async () => {
    
//             // init variables
//             await signerFactory(eve.sk);
//             const loanTokenName = "mockFa2";
//             const liquidityAmount = 100000000; // 100 Mock FA2 Tokens

//             lendingControllerStorage = await lendingControllerInstance.storage();
            
//             // get mock fa2 token storage and lp token pool mock fa2 token storage
//             const mockFa2TokenStorage              = await mockFa2TokenInstance.storage();
//             const mTokenPoolMockFa2TokenStorage   = await mTokenEurlInstance.storage();
            
//             // get initial eve's Mock FA2 Token balance
//             const eveMockFa2Ledger                 = await mockFa2TokenStorage.ledger.get(eve.pkh);            
//             const eveInitialMockFa2TokenBalance    = eveMockFa2Ledger == undefined ? 0 : eveMockFa2Ledger.toNumber();

//             // get initial eve's mEurl Token - Mock FA2 Token - balance
//             const eveMEurlTokenLedger                 = await mTokenPoolMockFa2TokenStorage.ledger.get(eve.pkh);            
//             const eveInitialMEurlTokenTokenBalance    = eveMEurlTokenLedger == undefined ? 0 : eveMEurlTokenLedger.toNumber();

//             // get initial lending controller's Mock FA2 Token balance
//             const lendingControllerMockFa2Ledger                = await mockFa2TokenStorage.ledger.get(lendingControllerAddress.address);            
//             const lendingControllerInitialMockFa2TokenBalance   = lendingControllerMockFa2Ledger == undefined ? 0 : lendingControllerMockFa2Ledger.toNumber();

//             // get initial lending controller token pool total
//             initialLoanTokenRecord                 = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
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
            
//             const updatedMEurlTokenTokenStorage     = await mTokenEurlInstance.storage();

//             // check new balance for loan token pool total
//             updatedLoanTokenRecord           = await updatedLendingControllerStorage.loanTokenLedger.get(loanTokenName);
//             assert.equal(updatedLoanTokenRecord.tokenPoolTotal, lendingControllerInitialTokenPoolTotal + liquidityAmount);

//             // check Eve's Mock FA12 Token balance
//             const updatedEveMockFa2Ledger          = await updatedMockFa2TokenStorage.ledger.get(eve.pkh);            
//             assert.equal(updatedEveMockFa2Ledger, eveInitialMockFa2TokenBalance - liquidityAmount);

//             // check Lending Controller's Mock FA2 Token Balance
//             const lendingControllerMockFa2Account             = await updatedMockFa2TokenStorage.ledger.get(lendingControllerAddress.address);            
//             assert.equal(lendingControllerMockFa2Account, lendingControllerInitialMockFa2TokenBalance + liquidityAmount);

//             // check Eve's mEurl Token Token balance
//             const updatedEveMEurlTokenLedger        = await updatedMEurlTokenTokenStorage.ledger.get(eve.pkh);            
//             assert.equal(updatedEveMEurlTokenLedger, eveInitialMEurlTokenTokenBalance + liquidityAmount);        

//         });


//         it('user (eve) can add liquidity for tez into Lending Controller token pool (100 XTZ)', async () => {
    
//             // init variables
//             await signerFactory(eve.sk);
//             const loanTokenName = "tez";
//             const liquidityAmount = 100000000; // 100 XTZ

//             lendingControllerStorage = await lendingControllerInstance.storage();
            
//             // get mTokenXtz token storage (FA2 Token Standard)
//             const mTokenPoolXtzStorage   = await mTokenXtzInstance.storage();

//             // get initial eve XTZ balance
//             const eveInitialXtzLedger   = await utils.tezos.tz.getBalance(eve.pkh);
//             const eveInitialXtzBalance  = eveInitialXtzLedger.toNumber();

//             // get initial eve's mEurl Token - Tez - balance
//             const eveMXtzTokenLedger            = await mTokenPoolXtzStorage.ledger.get(eve.pkh);            
//             const eveInitialMXtzTokenBalance    = eveMXtzTokenLedger == undefined ? 0 : eveMXtzTokenLedger.toNumber();
            
//             // get initial lending controller's XTZ balance
//             const lendingControllerInitialXtzLedger   = await utils.tezos.tz.getBalance(lendingControllerAddress.address);
//             const lendingControllerInitialXtzBalance  = lendingControllerInitialXtzLedger.toNumber();

//             // get initial lending controller token pool total
//             initialLoanTokenRecord                 = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
//             const lendingControllerInitialTokenPoolTotal = initialLoanTokenRecord.tokenPoolTotal.toNumber();

//             // eve deposits mock XTZ into lending controller token pool
//             const eveAddLiquidityOperation  = await lendingControllerInstance.methods.addLiquidity(
//                 loanTokenName,
//                 liquidityAmount, 
//             ).send({ mutez : true, amount: liquidityAmount });
//             await eveAddLiquidityOperation.confirmation();

//             // get updated storages
//             const updatedLendingControllerStorage  = await lendingControllerInstance.storage();
//             const updatedMXtzTokenStorage     = await mTokenXtzInstance.storage();

//             // check new balance for loan token pool total
//             updatedLoanTokenRecord           = await updatedLendingControllerStorage.loanTokenLedger.get(loanTokenName);
//             assert.equal(updatedLoanTokenRecord.tokenPoolTotal, lendingControllerInitialTokenPoolTotal + liquidityAmount);

//             // check Lending Controller's XTZ Balance
//             const lendingControllerXtzBalance           = await utils.tezos.tz.getBalance(lendingControllerAddress.address);
//             assert.equal(lendingControllerXtzBalance, lendingControllerInitialXtzBalance + liquidityAmount);

//             // check Eve's mTokenXtz balance
//             const updatedEveMXtzTokenLedger        = await updatedMXtzTokenStorage.ledger.get(eve.pkh);            
//             assert.equal(updatedEveMXtzTokenLedger, eveInitialMXtzTokenBalance + liquidityAmount);        

//             // check Eve's XTZ Balance and account for gas cost in transaction with almostEqual
//             const eveXtzBalance = await utils.tezos.tz.getBalance(eve.pkh);
//             assert.equal(almostEqual(eveXtzBalance, eveInitialXtzBalance - liquidityAmount, 0.0001), true)

//         });
    
//     })

    
//     // 
//     // Test: repay
//     //
//     describe('%repay mockFA12 Tokens - mock time tests (1 month)', function () {

//         it('user (eve) can repay debt - Mock FA12 Token  - mock one month - utilisation rate below optimal utilisation rate - repayment greater than interest', async () => {

//             // Conditions: 
//             // - vault loan token: mock FA12 tokens
//             // - mock time: 1 month
//             // - token pool interest rate: below optimal utilisation rate
//             // - repay amount: greater than interest amount 

//             // Summary of steps:
//             // 1. Create Vault
//             // 2. Deposit collateral into vault (100 Mock FA12 Tokens, 100 Mock FA2 Tokens)
//             // 3. Borrow from vault (50 Mock FA12 Tokens)
//             // 4. Set block levels time to 1 year in future
//             // 5. Repay partial debt

//             // init variables
//             await signerFactory(eve.sk);
//             const lendingControllerStorage = await lendingControllerInstance.storage();
//             const vaultFactoryStorage      = await vaultFactoryInstance.storage();

//             // ----------------------------------------------------------------------------------------------
//             // Create Vault
//             // ----------------------------------------------------------------------------------------------

//             const vaultCounter  = vaultFactoryStorage.vaultCounter;
//             const vaultId       = vaultCounter.toNumber();
//             const vaultOwner    = eve.pkh;
//             const loanTokenName = "mockFa12";

//             const depositorsConfig      = "any";

//             const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
//                 eve.pkh,                // delegate to
//                 loanTokenName,          // loan token type
//                 depositorsConfig        // depositors config type - any / whitelist
//             ).send();
//             await userCreatesNewVaultOperation.confirmation();

//             const vaultHandle = {
//                 "id"    : vaultId,
//                 "owner" : vaultOwner
//             };
//             const newVaultRecord = await lendingControllerStorage.vaults.get(vaultHandle);
//             const vaultAddress   = newVaultRecord.address;
//             const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

//             console.log('   - vault originated: ' + vaultAddress);
//             console.log('   - vault id: ' + vaultId);

//             // push new vault id to vault set
//             eveVaultSet.push(vaultId);

//             // ----------------------------------------------------------------------------------------------
//             // Deposit Collateral into Vault
//             // ----------------------------------------------------------------------------------------------

//             const mockFa12DepositAmount      = 150000000;   // 150 Mock FA12 Tokens
//             const mockFa2DepositAmount       = 150000000;   // 150 Mock FA12 Tokens

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

//             // ---------------------------------
//             // Deposit Mock FA2 Tokens
//             // ---------------------------------

//             // update operators for vault
//             const updateOperatorsOperation = await mockFa2TokenInstance.methods.update_operators([
//             {
//                 add_operator: {
//                     owner: eve.pkh,
//                     operator: vaultAddress,
//                     token_id: 0,
//                 },
//             }])
//             .send()
//             await updateOperatorsOperation.confirmation();

//             // eve deposits mock FA2 tokens into vault
//             const eveDepositTokenOperation = await vaultInstance.methods.deposit(
//                 mockFa2DepositAmount,    
//                 "mockFa2"
//             ).send();
//             await eveDepositTokenOperation.confirmation();

//             console.log('   - vault collateral deposited');

//             // ----------------------------------------------------------------------------------------------
//             // Borrow with Vault
//             // ----------------------------------------------------------------------------------------------

//             // borrow amount - 20 Mock FA12 Tokens
//             const borrowAmount = 20000000;   

//             // borrow operation
//             const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
//             await eveBorrowOperation.confirmation();

//             console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName);

//             // get initial Mock FA12 Token balance for Eve, Treasury and Token Pool Reward Contract
//             const eveMockFa12Ledger                 = await mockFa12TokenStorage.ledger.get(eve.pkh);            
//             const eveInitialMockFa12TokenBalance    = eveMockFa12Ledger == undefined ? 0 : eveMockFa12Ledger.balance.toNumber();

//             const treasuryMockFa12Ledger                = await mockFa12TokenStorage.ledger.get(treasuryAddress.address);            
//             const treasuryInitialMockFa12TokenBalance   = treasuryMockFa12Ledger == undefined ? 0 : treasuryMockFa12Ledger.balance.toNumber();

//             // get token pool stats
//             const afterBorrowloanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
//             const loanTokenDecimals    = afterBorrowloanTokenRecordView.tokenDecimals;
//             const interestRateDecimals = (27 - 2); 

//             const tokenPoolTotal           = afterBorrowloanTokenRecordView.tokenPoolTotal.toNumber() / (10 ** loanTokenDecimals);
//             const totalBorrowed            = afterBorrowloanTokenRecordView.totalBorrowed.toNumber() / (10 ** loanTokenDecimals);
//             const optimalUtilisationRate   = Number(afterBorrowloanTokenRecordView.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
//             const utilisationRate          = Number(afterBorrowloanTokenRecordView.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
//             const currentInterestRate      = Number(afterBorrowloanTokenRecordView.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";

//             console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);

//             // ----------------------------------------------------------------------------------------------
//             // Set Block Levels For Mock Time Test - 1 month
//             // ----------------------------------------------------------------------------------------------

//             await signerFactory(bob.sk); // temporarily set to tester to increase block levels

//             const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
//             const updatedVault                      = await updatedLendingControllerStorage.vaults.get(vaultHandle);
//             const lastUpdatedBlockLevel             = updatedVault.lastUpdatedBlockLevel;

//             const newBlockLevel = lastUpdatedBlockLevel.toNumber() + oneMonthLevelBlocks;

//             const setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(newBlockLevel, 'configMockLevel').send();
//             await setMockLevelOperation.confirmation();

//             const mockTimeLendingControllerStorage = await lendingControllerInstance.storage();
//             const updatedMockLevel = mockTimeLendingControllerStorage.config.mockLevel;

//             assert.equal(updatedMockLevel, newBlockLevel);

//             console.log('   - time set to 1 month ahead: ' + lastUpdatedBlockLevel + ' to ' + newBlockLevel);

//             // ----------------------------------------------------------------------------------------------
//             // Repay partial debt 
//             // ----------------------------------------------------------------------------------------------

//             // set back to user
//             await signerFactory(eve.sk);  

//             // treasury share of interest repaid
//             const configInterestTreasuryShare = await lendingControllerStorage.config.interestTreasuryShare;

//             // repayment amount
//             const repayAmount = 500000; // 0.5 Mock FA12 Tokens

//             // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
//             // reset token allowance
//             const resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
//                 lendingControllerMockTimeAddress.address,
//                 0
//             ).send();
//             await resetTokenAllowance.confirmation();

//             // set new token allowance
//             const setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
//                 lendingControllerMockTimeAddress.address,
//                 repayAmount
//             ).send();
//             await setNewTokenAllowance.confirmation();

//             // get vault and loan token views, and storage
//             vaultRecordView        = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
//             loanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            
//             const beforeRepaymentStorage = await lendingControllerInstance.storage();

//             const initialVaultLoanOutstandingTotal         = vaultRecordView.loanOutstandingTotal;
//             const beforeRepaymentVaultBorrowIndex          = vaultRecordView.borrowIndex;
//             const beforeRepaymentVaultOutstandingTotal     = vaultRecordView.loanOutstandingTotal;
//             const beforeRepaymentVaultPrincipalTotal       = vaultRecordView.loanPrincipalTotal;
//             const beforeRepaymentTokenBorrowIndex          = loanTokenRecordView.borrowIndex;

//             initialTokenRewardIndex = loanTokenRecordView.accumulatedRewardsPerShare;
//             initialTokenPoolTotal   = loanTokenRecordView.tokenPoolTotal;

//             // repay operation
//             const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send();
//             await eveRepayOperation.confirmation();

//             console.log('   - repaid: ' + repayAmount + " | type: " + loanTokenName);

//             // get updated storage
//             const updatedLendingControllerStorageAfterRepay     = await lendingControllerInstance.storage();
//             const updatedVaultRecord                            = await updatedLendingControllerStorageAfterRepay.vaults.get(vaultHandle);
//             const updatedMockFa12TokenStorage                   = await mockFa12TokenInstance.storage();
            
//             // get updated Mock FA12 Token balance for Eve, Treasury and Token Pool Reward Contract
//             const updatedEveMockFa12Ledger                      = await updatedMockFa12TokenStorage.ledger.get(eve.pkh);            
//             const updatedEveMockFa12TokenBalance                = updatedEveMockFa12Ledger == undefined ? 0 : updatedEveMockFa12Ledger.balance.toNumber();

//             const updatedTreasuryMockFa12Ledger                 = await updatedMockFa12TokenStorage.ledger.get(treasuryAddress.address);            
//             const updatedTreasuryMockFa12TokenBalance           = updatedTreasuryMockFa12Ledger == undefined ? 0 : updatedTreasuryMockFa12Ledger.balance.toNumber();

//             // On-chain views to vault and loan token
//             updatedVaultRecordView     = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
//             updatedLoanTokenRecordView = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});

//             const updatedLoanOutstandingTotal             = updatedVaultRecordView.loanOutstandingTotal;
//             const updatedLoanPrincipalTotal               = updatedVaultRecordView.loanPrincipalTotal;
//             const updatedLoanInterestTotal                = updatedVaultRecordView.loanInterestTotal;

//             const afterRepaymentVaultBorrowIndex          = updatedVaultRecordView.borrowIndex;
//             const afterRepaymentTokenBorrowIndex          = updatedLoanTokenRecordView.borrowIndex;
            
//             const loanOutstandingWithAccruedInterest      = lendingHelper.calculateAccruedInterest(beforeRepaymentVaultOutstandingTotal, beforeRepaymentVaultBorrowIndex, afterRepaymentTokenBorrowIndex);
//             const totalInterest                           = loanOutstandingWithAccruedInterest - initialVaultLoanOutstandingTotal.toNumber();
            
//             // check if repayAmount covers whole or partial of total interest 
//             const totalInterestPaid                       = repayAmount < totalInterest ? repayAmount : totalInterest;
//             const remainingInterest                       = totalInterest - repayAmount < 0 ? 0 : totalInterest - repayAmount;
            
//             const finalLoanOutstandingTotal               = loanOutstandingWithAccruedInterest - repayAmount;
//             const finalLoanPrincipalTotal                 = remainingInterest > 0 ? beforeRepaymentVaultPrincipalTotal : loanOutstandingWithAccruedInterest - repayAmount;
//             const finalLoanInterestTotal                  = remainingInterest > 0 ? remainingInterest : 0;

//             const interestTreasuryShare                   = lendingHelper.calculateInterestSentToTreasury(configInterestTreasuryShare, totalInterestPaid);
//             const interestRewards                         = totalInterestPaid - interestTreasuryShare;

//             // calculate new reward index
//             updatedTokenRewardIndex                       = updatedLoanTokenRecordView.accumulatedRewardsPerShare;
//             const calculatedTokenRewardIndex              = lendingHelper.calculateNewRewardIndex(interestRewards, initialTokenPoolTotal, initialTokenRewardIndex);
//             assert.equal(almostEqual(updatedTokenRewardIndex.toNumber(), calculatedTokenRewardIndex, 0.00001), true);

//             console.log('   - final vault stats >> outstanding total: ' + finalLoanOutstandingTotal + " | principal total: " + finalLoanPrincipalTotal  + " | interest total: " + finalLoanInterestTotal);
//             console.log('   - interest stats >> total interest: ' + totalInterest + ' | interest paid: ' + totalInterestPaid +' | interest to treasury: ' + interestTreasuryShare + " | interest to reward pool: " + interestRewards);

//             assert.equal(updatedLoanOutstandingTotal.toNumber(), finalLoanOutstandingTotal);
//             assert.equal(updatedLoanPrincipalTotal.toNumber(), finalLoanPrincipalTotal);
//             assert.equal(updatedLoanInterestTotal.toNumber(), finalLoanInterestTotal);
//             assert.equal(afterRepaymentVaultBorrowIndex.toNumber(), afterRepaymentTokenBorrowIndex.toNumber());
//             assert.equal(updatedEveMockFa12TokenBalance, eveInitialMockFa12TokenBalance - repayAmount);

//             // check treasury fees and interest to token pool reward contract
//             assert.equal(updatedTreasuryMockFa12TokenBalance, treasuryInitialMockFa12TokenBalance + interestTreasuryShare)

//         })



//         it('user (eve) can repay debt - Mock FA12 Token  - mock one month - utilisation rate below optimal utilisation rate - repayment less than interest', async () => {

//             // Conditions: 
//             // - vault loan token: mock FA12 tokens
//             // - mock time: 1 month
//             // - token pool interest rate: below optimal utilisation rate
//             // - repay amount: less than interest amount

//             // Summary of steps:
//             // 1. Create Vault
//             // 2. Deposit collateral into vault (100 Mock FA12 Tokens, 100 Mock FA2 Tokens)
//             // 3. Borrow from vault (50 Mock FA12 Tokens)
//             // 4. Set block levels time to 1 year in future
//             // 5. Repay partial debt

//             // init variables
//             await signerFactory(eve.sk);
//             const lendingControllerStorage = await lendingControllerInstance.storage();
//             const vaultFactoryStorage      = await vaultFactoryInstance.storage();

//             // ----------------------------------------------------------------------------------------------
//             // Create Vault
//             // ----------------------------------------------------------------------------------------------
            
//             const vaultCounter  = vaultFactoryStorage.vaultCounter;
//             const vaultId       = vaultCounter.toNumber();
//             const vaultOwner    = eve.pkh;
//             const loanTokenName = "mockFa12";

//             const depositorsConfig      = "any";

//             const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
//                 eve.pkh,                // delegate to
//                 loanTokenName,          // loan token type
//                 depositorsConfig        // depositors config type - any / whitelist
//             ).send();
//             await userCreatesNewVaultOperation.confirmation();

//             const vaultHandle = {
//                 "id"    : vaultId,
//                 "owner" : vaultOwner
//             };
//             const newVaultRecord = await lendingControllerStorage.vaults.get(vaultHandle);
//             const vaultAddress   = newVaultRecord.address;
//             const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

//             console.log('   - vault originated: ' + vaultAddress);
//             console.log('   - vault id: ' + vaultId);

//             // push new vault id to vault set
//             eveVaultSet.push(vaultId);

//             // ----------------------------------------------------------------------------------------------
//             // Deposit Collateral into Vault
//             // ----------------------------------------------------------------------------------------------

//             const mockFa12DepositAmount      = 150000000;   // 150 Mock FA12 Tokens
//             const mockFa2DepositAmount       = 150000000;   // 150 Mock FA12 Tokens

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

//             // ---------------------------------
//             // Deposit Mock FA2 Tokens
//             // ---------------------------------

//             // update operators for vault
//             const updateOperatorsOperation = await mockFa2TokenInstance.methods.update_operators([
//             {
//                 add_operator: {
//                     owner: eve.pkh,
//                     operator: vaultAddress,
//                     token_id: 0,
//                 },
//             }])
//             .send()
//             await updateOperatorsOperation.confirmation();

//             // eve deposits mock FA2 tokens into vault
//             const eveDepositTokenOperation  = await vaultInstance.methods.deposit(
//                 mockFa2DepositAmount,      
//                 "mockFa2"
//             ).send();
//             await eveDepositTokenOperation.confirmation();

//             console.log('   - vault collateral deposited');

//             // ----------------------------------------------------------------------------------------------
//             // Borrow with Vault
//             // ----------------------------------------------------------------------------------------------

//             // borrow amount - 20 Mock FA12 Tokens
//             const borrowAmount = 20000000;   

//             // borrow operation
//             const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
//             await eveBorrowOperation.confirmation();

//             console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName);

//             // get initial Mock FA12 Token balance for Eve, Treasury and Token Pool Reward Contract
//             const eveMockFa12Ledger                 = await mockFa12TokenStorage.ledger.get(eve.pkh);            
//             const eveInitialMockFa12TokenBalance    = eveMockFa12Ledger == undefined ? 0 : eveMockFa12Ledger.balance.toNumber();

//             const treasuryMockFa12Ledger                = await mockFa12TokenStorage.ledger.get(treasuryAddress.address);            
//             const treasuryInitialMockFa12TokenBalance   = treasuryMockFa12Ledger == undefined ? 0 : treasuryMockFa12Ledger.balance.toNumber();

//             // get token pool stats
//             const afterBorrowloanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
//             const loanTokenDecimals    = afterBorrowloanTokenRecordView.tokenDecimals;
//             const interestRateDecimals = (27 - 2); 

//             const tokenPoolTotal           = afterBorrowloanTokenRecordView.tokenPoolTotal.toNumber() / (10 ** loanTokenDecimals);
//             const totalBorrowed            = afterBorrowloanTokenRecordView.totalBorrowed.toNumber() / (10 ** loanTokenDecimals);
//             const optimalUtilisationRate   = Number(afterBorrowloanTokenRecordView.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
//             const utilisationRate          = Number(afterBorrowloanTokenRecordView.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
//             const currentInterestRate      = Number(afterBorrowloanTokenRecordView.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";

//             console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);

//             // ----------------------------------------------------------------------------------------------
//             // Set Block Levels For Mock Time Test - 1 month
//             // ----------------------------------------------------------------------------------------------

//             await signerFactory(bob.sk); // temporarily set to tester to increase block levels

//             const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
//             const updatedVault                      = await updatedLendingControllerStorage.vaults.get(vaultHandle);
//             const lastUpdatedBlockLevel             = updatedVault.lastUpdatedBlockLevel;

//             const newBlockLevel = lastUpdatedBlockLevel.toNumber() + oneMonthLevelBlocks;

//             const setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(newBlockLevel, 'configMockLevel').send();
//             await setMockLevelOperation.confirmation();

//             const mockTimeLendingControllerStorage = await lendingControllerInstance.storage();
//             const updatedMockLevel = mockTimeLendingControllerStorage.config.mockLevel;

//             assert.equal(updatedMockLevel, newBlockLevel);

//             console.log('   - time set to 1 month ahead: ' + lastUpdatedBlockLevel + ' to ' + newBlockLevel);

//             // ----------------------------------------------------------------------------------------------
//             // Repay partial debt 
//             // ----------------------------------------------------------------------------------------------

//             // set back to user
//             await signerFactory(eve.sk);  

//             // treasury share of interest repaid
//             const configInterestTreasuryShare = await lendingControllerStorage.config.interestTreasuryShare;

//             // repayment amount
//             const repayAmount = 10000; // 0.01 Mock FA12 Tokens

//             // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
//             // reset token allowance
//             const resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
//                 lendingControllerMockTimeAddress.address,
//                 0
//             ).send();
//             await resetTokenAllowance.confirmation();

//             // set new token allowance
//             const setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
//                 lendingControllerMockTimeAddress.address,
//                 repayAmount
//             ).send();
//             await setNewTokenAllowance.confirmation();

//             // get vault and loan token views, and storage
//             const vaultRecordView        = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
//             const loanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
//             const beforeRepaymentStorage = await lendingControllerInstance.storage();

//             const initialVaultLoanOutstandingTotal         = vaultRecordView.loanOutstandingTotal;
//             const beforeRepaymentVaultBorrowIndex          = vaultRecordView.borrowIndex;
//             const beforeRepaymentVaultOutstandingTotal     = vaultRecordView.loanOutstandingTotal;
//             const beforeRepaymentVaultPrincipalTotal       = vaultRecordView.loanPrincipalTotal;
//             const beforeRepaymentTokenBorrowIndex          = loanTokenRecordView.borrowIndex;

//             initialTokenRewardIndex = loanTokenRecordView.accumulatedRewardsPerShare;
//             initialTokenPoolTotal   = loanTokenRecordView.tokenPoolTotal;

//             // const repayOpParam        = await lendingControllerInstance.methods.repay(vaultId, repayAmount).toTransferParams();
//             // const estimate            = await utils.tezos.estimate.transfer(repayOpParam);
//             // console.log("REPAY OP ESTIMATION: ", estimate);

//             // repay operation
//             const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send();
//             await eveRepayOperation.confirmation();

//             console.log('   - repaid: ' + repayAmount + " | type: " + loanTokenName);

//             // get updated storage
//             const updatedLendingControllerStorageAfterRepay     = await lendingControllerInstance.storage();
//             const updatedVaultRecord                            = await updatedLendingControllerStorageAfterRepay.vaults.get(vaultHandle);
//             const updatedMockFa12TokenStorage                   = await mockFa12TokenInstance.storage();
            
//             // get updated Mock FA12 Token balance for Eve, Treasury and Token Pool Reward Contract
//             const updatedEveMockFa12Ledger                      = await updatedMockFa12TokenStorage.ledger.get(eve.pkh);            
//             const updatedEveMockFa12TokenBalance                = updatedEveMockFa12Ledger == undefined ? 0 : updatedEveMockFa12Ledger.balance.toNumber();

//             const updatedTreasuryMockFa12Ledger                 = await updatedMockFa12TokenStorage.ledger.get(treasuryAddress.address);            
//             const updatedTreasuryMockFa12TokenBalance           = updatedTreasuryMockFa12Ledger == undefined ? 0 : updatedTreasuryMockFa12Ledger.balance.toNumber();

//             // On-chain views to vault and loan token
//             updatedVaultRecordView = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
//             updatedLoanTokenRecordView = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            
//             const updatedLoanOutstandingTotal             = updatedVaultRecordView.loanOutstandingTotal;
//             const updatedLoanPrincipalTotal               = updatedVaultRecordView.loanPrincipalTotal;
//             const updatedLoanInterestTotal                = updatedVaultRecordView.loanInterestTotal;

//             const afterRepaymentVaultBorrowIndex          = updatedVaultRecordView.borrowIndex;
//             const afterRepaymentTokenBorrowIndex          = updatedLoanTokenRecordView.borrowIndex;
            
//             const loanOutstandingWithAccruedInterest      = lendingHelper.calculateAccruedInterest(beforeRepaymentVaultOutstandingTotal, beforeRepaymentVaultBorrowIndex, afterRepaymentTokenBorrowIndex);
//             const totalInterest                           = loanOutstandingWithAccruedInterest - initialVaultLoanOutstandingTotal.toNumber();
            
//             // check if repayAmount covers whole or partial of total interest 
//             const totalInterestPaid                       = repayAmount < totalInterest ? repayAmount : totalInterest;
//             const remainingInterest                       = totalInterest - repayAmount < 0 ? 0 : totalInterest - repayAmount;

//             const finalLoanOutstandingTotal               = loanOutstandingWithAccruedInterest - repayAmount;
//             const finalLoanPrincipalTotal                 = remainingInterest > 0 ? beforeRepaymentVaultPrincipalTotal : loanOutstandingWithAccruedInterest - repayAmount;
//             const finalLoanInterestTotal                  = remainingInterest > 0 ? remainingInterest : 0;

//             const interestTreasuryShare                   = lendingHelper.calculateInterestSentToTreasury(configInterestTreasuryShare, totalInterestPaid);
//             const interestRewards                         = totalInterestPaid - interestTreasuryShare;

//             // calculate new reward index
//             updatedTokenRewardIndex                       = updatedLoanTokenRecordView.accumulatedRewardsPerShare;
//             const calculatedTokenRewardIndex              = lendingHelper.calculateNewRewardIndex(interestRewards, initialTokenPoolTotal, initialTokenRewardIndex);
//             assert.equal(almostEqual(updatedTokenRewardIndex.toNumber(), calculatedTokenRewardIndex, 0.00001), true);

//             console.log('   - final vault stats >> outstanding total: ' + finalLoanOutstandingTotal + " | principal total: " + finalLoanPrincipalTotal  + " | interest total: " + finalLoanInterestTotal);
//             console.log('   - interest stats >> total interest: ' + totalInterest + ' | interest paid: ' + totalInterestPaid +' | interest to treasury: ' + interestTreasuryShare + " | interest to reward pool: " + interestRewards);

//             assert.equal(updatedLoanOutstandingTotal.toNumber(), finalLoanOutstandingTotal);
//             assert.equal(updatedLoanPrincipalTotal.toNumber(), finalLoanPrincipalTotal);
//             assert.equal(updatedLoanInterestTotal.toNumber(), finalLoanInterestTotal);
//             assert.equal(afterRepaymentVaultBorrowIndex.toNumber(), afterRepaymentTokenBorrowIndex.toNumber());
//             assert.equal(updatedEveMockFa12TokenBalance, eveInitialMockFa12TokenBalance - repayAmount);

//             // check treasury fees and interest to token pool reward contract
//             assert.equal(updatedTreasuryMockFa12TokenBalance, treasuryInitialMockFa12TokenBalance + interestTreasuryShare)

//         })


//         it('user (eve) can repay debt - Mock FA12 Token  - mock one month - utilisation rate above optimal utilisation rate - repayment greater than interest', async () => {

//             // Conditions: 
//             // - vault loan token: mock FA12 tokens
//             // - mock time: 1 month
//             // - token pool interest rate: above optimal utilisation rate
//             // - repay amount: greater than interest amount

//             // Summary of steps:
//             // 1. Create Vault
//             // 2. Deposit collateral into vault (100 Mock FA12 Tokens, 100 Mock FA2 Tokens)
//             // 3. Borrow from vault (50 Mock FA12 Tokens)
//             // 4. Set block levels time to 1 year in future
//             // 5. Repay partial debt

//             // init variables
//             await signerFactory(eve.sk);
//             const lendingControllerStorage = await lendingControllerInstance.storage();
//             const vaultFactoryStorage      = await vaultFactoryInstance.storage();

//             // ----------------------------------------------------------------------------------------------
//             // Create Vault
//             // ----------------------------------------------------------------------------------------------

//             const vaultCounter  = vaultFactoryStorage.vaultCounter;
//             const vaultId       = vaultCounter.toNumber();
//             const vaultOwner    = eve.pkh;
//             const loanTokenName = "mockFa12";

//             const depositorsConfig      = "any";

//             const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
//                 eve.pkh,                // delegate to
//                 loanTokenName,          // loan token type
//                 depositorsConfig        // depositors config type - any / whitelist
//             ).send();
//             await userCreatesNewVaultOperation.confirmation();

//             const vaultHandle = {
//                 "id"    : vaultId,
//                 "owner" : vaultOwner
//             };
//             const newVaultRecord = await lendingControllerStorage.vaults.get(vaultHandle);
//             const vaultAddress   = newVaultRecord.address;
//             const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

//             console.log('   - vault originated: ' + vaultAddress);
//             console.log('   - vault id: ' + vaultId);

//             // push new vault id to vault set
//             eveVaultSet.push(vaultId);

//             // ----------------------------------------------------------------------------------------------
//             // Deposit Collateral into Vault
//             // ----------------------------------------------------------------------------------------------

//             const mockFa12DepositAmount      = 150000000;   // 150 Mock FA12 Tokens
//             const mockFa2DepositAmount       = 150000000;   // 150 Mock FA12 Tokens

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

//             // ---------------------------------
//             // Deposit Mock FA2 Tokens
//             // ---------------------------------

//             // update operators for vault
//             const updateOperatorsOperation = await mockFa2TokenInstance.methods.update_operators([
//             {
//                 add_operator: {
//                     owner: eve.pkh,
//                     operator: vaultAddress,
//                     token_id: 0,
//                 },
//             }])
//             .send()
//             await updateOperatorsOperation.confirmation();

//             // eve deposits mock FA2 tokens into vault
//             const eveDepositTokenOperation  = await vaultInstance.methods.deposit(
//                 mockFa2DepositAmount,   
//                 "mockFa2"
//             ).send();
//             await eveDepositTokenOperation.confirmation();

//             console.log('   - vault collateral deposited');

//             // ----------------------------------------------------------------------------------------------
//             // Borrow with Vault
//             // ----------------------------------------------------------------------------------------------

//             // borrow amount - 20 Mock FA12 Tokens
//             const borrowAmount = 20000000;   

//             // borrow operation
//             const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
//             await eveBorrowOperation.confirmation();

//             console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName);

//             // get initial Mock FA12 Token balance for Eve, Treasury and Token Pool Reward Contract
//             const eveMockFa12Ledger                 = await mockFa12TokenStorage.ledger.get(eve.pkh);            
//             const eveInitialMockFa12TokenBalance    = eveMockFa12Ledger == undefined ? 0 : eveMockFa12Ledger.balance.toNumber();

//             const treasuryMockFa12Ledger                = await mockFa12TokenStorage.ledger.get(treasuryAddress.address);            
//             const treasuryInitialMockFa12TokenBalance   = treasuryMockFa12Ledger == undefined ? 0 : treasuryMockFa12Ledger.balance.toNumber();

//             // get token pool stats
//             const afterBorrowloanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
//             const loanTokenDecimals    = afterBorrowloanTokenRecordView.tokenDecimals;
//             const interestRateDecimals = (27 - 2); 

//             const tokenPoolTotal           = afterBorrowloanTokenRecordView.tokenPoolTotal.toNumber() / (10 ** loanTokenDecimals);
//             const totalBorrowed            = afterBorrowloanTokenRecordView.totalBorrowed.toNumber() / (10 ** loanTokenDecimals);
//             const optimalUtilisationRate   = Number(afterBorrowloanTokenRecordView.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
//             const utilisationRate          = Number(afterBorrowloanTokenRecordView.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
//             const currentInterestRate      = Number(afterBorrowloanTokenRecordView.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";

//             console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);

//             // ----------------------------------------------------------------------------------------------
//             // Set Block Levels For Mock Time Test - 1 month
//             // ----------------------------------------------------------------------------------------------

//             await signerFactory(bob.sk); // temporarily set to tester to increase block levels

//             const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
//             const updatedVault                      = await updatedLendingControllerStorage.vaults.get(vaultHandle);
//             const lastUpdatedBlockLevel             = updatedVault.lastUpdatedBlockLevel;

//             const newBlockLevel = lastUpdatedBlockLevel.toNumber() + oneMonthLevelBlocks;

//             const setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(newBlockLevel, 'configMockLevel').send();
//             await setMockLevelOperation.confirmation();

//             const mockTimeLendingControllerStorage = await lendingControllerInstance.storage();
//             const updatedMockLevel = mockTimeLendingControllerStorage.config.mockLevel;

//             assert.equal(updatedMockLevel, newBlockLevel);

//             console.log('   - time set to 1 month ahead: ' + lastUpdatedBlockLevel + ' to ' + newBlockLevel);

//             // ----------------------------------------------------------------------------------------------
//             // Repay partial debt 
//             // ----------------------------------------------------------------------------------------------

//             // set back to user
//             await signerFactory(eve.sk);  

//             // treasury share of interest repaid
//             const configInterestTreasuryShare = await lendingControllerStorage.config.interestTreasuryShare;

//             // repayment amount
//             const repayAmount = 500000; // 0.5 Mock FA12 Tokens

//             // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
//             // reset token allowance
//             const resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
//                 lendingControllerMockTimeAddress.address,
//                 0
//             ).send();
//             await resetTokenAllowance.confirmation();

//             // set new token allowance
//             const setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
//                 lendingControllerMockTimeAddress.address,
//                 repayAmount
//             ).send();
//             await setNewTokenAllowance.confirmation();

//             // get vault and loan token views, and storage
//             const vaultRecordView        = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
//             const loanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
//             const beforeRepaymentStorage = await lendingControllerInstance.storage();

//             const initialVaultLoanOutstandingTotal         = vaultRecordView.loanOutstandingTotal;
//             const beforeRepaymentVaultBorrowIndex          = vaultRecordView.borrowIndex;
//             const beforeRepaymentVaultOutstandingTotal     = vaultRecordView.loanOutstandingTotal;
//             const beforeRepaymentVaultPrincipalTotal       = vaultRecordView.loanPrincipalTotal;
//             const beforeRepaymentTokenBorrowIndex          = loanTokenRecordView.borrowIndex;

//             initialTokenRewardIndex = loanTokenRecordView.accumulatedRewardsPerShare;
//             initialTokenPoolTotal   = loanTokenRecordView.tokenPoolTotal;

//             // const repayOpParam        = await lendingControllerInstance.methods.repay(vaultId, repayAmount).toTransferParams();
//             // const estimate              = await utils.tezos.estimate.transfer(repayOpParam);
//             // console.log("REPAY OP ESTIMATION: ", estimate);

//             // repay operation
//             const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send();
//             await eveRepayOperation.confirmation();

//             console.log('   - repaid: ' + repayAmount + " | type: " + loanTokenName);

//             // get updated storage
//             const updatedLendingControllerStorageAfterRepay     = await lendingControllerInstance.storage();
//             const updatedVaultRecord                            = await updatedLendingControllerStorageAfterRepay.vaults.get(vaultHandle);
//             const updatedMockFa12TokenStorage                   = await mockFa12TokenInstance.storage();
            
//             // get updated Mock FA12 Token balance for Eve, Treasury and Token Pool Reward Contract
//             const updatedEveMockFa12Ledger                      = await updatedMockFa12TokenStorage.ledger.get(eve.pkh);            
//             const updatedEveMockFa12TokenBalance                = updatedEveMockFa12Ledger == undefined ? 0 : updatedEveMockFa12Ledger.balance.toNumber();

//             const updatedTreasuryMockFa12Ledger                 = await updatedMockFa12TokenStorage.ledger.get(treasuryAddress.address);            
//             const updatedTreasuryMockFa12TokenBalance           = updatedTreasuryMockFa12Ledger == undefined ? 0 : updatedTreasuryMockFa12Ledger.balance.toNumber();

//             // On-chain views to vault and loan token
//             updatedVaultRecordView     = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
//             updatedLoanTokenRecordView = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
            
//             const updatedLoanOutstandingTotal             = updatedVaultRecordView.loanOutstandingTotal;
//             const updatedLoanPrincipalTotal               = updatedVaultRecordView.loanPrincipalTotal;
//             const updatedLoanInterestTotal                = updatedVaultRecordView.loanInterestTotal;

//             const afterRepaymentVaultBorrowIndex          = updatedVaultRecordView.borrowIndex;
//             const afterRepaymentTokenBorrowIndex          = updatedLoanTokenRecordView.borrowIndex;
            
//             const loanOutstandingWithAccruedInterest      = lendingHelper.calculateAccruedInterest(beforeRepaymentVaultOutstandingTotal, beforeRepaymentVaultBorrowIndex, afterRepaymentTokenBorrowIndex);
//             const totalInterest                           = loanOutstandingWithAccruedInterest - initialVaultLoanOutstandingTotal.toNumber();
            
//             // check if repayAmount covers whole or partial of total interest 
//             const totalInterestPaid                       = repayAmount < totalInterest ? repayAmount : totalInterest;
//             const remainingInterest                       = totalInterest - repayAmount < 0 ? 0 : totalInterest - repayAmount;

//             const finalLoanOutstandingTotal               = loanOutstandingWithAccruedInterest - repayAmount;
//             const finalLoanPrincipalTotal                 = remainingInterest > 0 ? beforeRepaymentVaultPrincipalTotal : loanOutstandingWithAccruedInterest - repayAmount;
//             const finalLoanInterestTotal                  = remainingInterest > 0 ? remainingInterest : 0;

//             const interestTreasuryShare                   = lendingHelper.calculateInterestSentToTreasury(configInterestTreasuryShare, totalInterestPaid);
//             const interestRewards                         = totalInterestPaid - interestTreasuryShare;

//             // calculate new reward index
//             updatedTokenRewardIndex                       = updatedLoanTokenRecordView.accumulatedRewardsPerShare;
//             const calculatedTokenRewardIndex              = lendingHelper.calculateNewRewardIndex(interestRewards, initialTokenPoolTotal, initialTokenRewardIndex);
//             assert.equal(almostEqual(updatedTokenRewardIndex.toNumber(), calculatedTokenRewardIndex, 0.00001), true);

//             console.log('   - final vault stats >> outstanding total: ' + finalLoanOutstandingTotal + " | principal total: " + finalLoanPrincipalTotal  + " | interest total: " + finalLoanInterestTotal);
//             console.log('   - interest stats >> total interest: ' + totalInterest + ' | interest paid: ' + totalInterestPaid +' | interest to treasury: ' + interestTreasuryShare + " | interest to reward pool: " + interestRewards);

//             assert.equal(updatedLoanOutstandingTotal.toNumber(), finalLoanOutstandingTotal);
//             assert.equal(updatedLoanPrincipalTotal.toNumber(), finalLoanPrincipalTotal);
//             assert.equal(updatedLoanInterestTotal.toNumber(), finalLoanInterestTotal);
//             assert.equal(afterRepaymentVaultBorrowIndex.toNumber(), afterRepaymentTokenBorrowIndex.toNumber());
//             assert.equal(updatedEveMockFa12TokenBalance, eveInitialMockFa12TokenBalance - repayAmount);

//             // check treasury fees and interest to token pool reward contract
//             assert.equal(updatedTreasuryMockFa12TokenBalance, treasuryInitialMockFa12TokenBalance + interestTreasuryShare)

//         })



//         it('user (eve) can repay debt - Mock FA12 Token  - mock one month - utilisation rate above optimal utilisation rate - repayment less than interest', async () => {

//             // Conditions: 
//             // - vault loan token: mock FA12 tokens
//             // - mock time: 1 month
//             // - token pool interest rate: above optimal utilisation rate
//             // - repay amount: less than interest amount

//             // Summary of steps:
//             // 1. Create Vault
//             // 2. Deposit collateral into vault (100 Mock FA12 Tokens, 100 Mock FA2 Tokens)
//             // 3. Borrow from vault (50 Mock FA12 Tokens)
//             // 4. Set block levels time to 1 year in future
//             // 5. Repay partial debt

//             // init variables
//             await signerFactory(eve.sk);
//             const lendingControllerStorage = await lendingControllerInstance.storage();
//             const vaultFactoryStorage      = await vaultFactoryInstance.storage();

//             // ----------------------------------------------------------------------------------------------
//             // Create Vault
//             // ----------------------------------------------------------------------------------------------

//             const vaultCounter  = vaultFactoryStorage.vaultCounter;
//             const vaultId       = vaultCounter.toNumber();
//             const vaultOwner    = eve.pkh;
//             const loanTokenName = "mockFa12";

//             const depositorsConfig      = "any";

//             const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
//                 eve.pkh,                // delegate to
//                 loanTokenName,          // loan token type
//                 depositorsConfig        // depositors config type - any / whitelist
//             ).send();
//             await userCreatesNewVaultOperation.confirmation();

//             const vaultHandle = {
//                 "id"    : vaultId,
//                 "owner" : vaultOwner
//             };
//             const newVaultRecord = await lendingControllerStorage.vaults.get(vaultHandle);
//             const vaultAddress   = newVaultRecord.address;
//             const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

//             console.log('   - vault originated: ' + vaultAddress);
//             console.log('   - vault id: ' + vaultId);

//             // push new vault id to vault set
//             eveVaultSet.push(vaultId);

//             // ----------------------------------------------------------------------------------------------
//             // Deposit Collateral into Vault
//             // ----------------------------------------------------------------------------------------------

//             const mockFa12DepositAmount      = 150000000;   // 150 Mock FA12 Tokens
//             const mockFa2DepositAmount       = 150000000;   // 150 Mock FA12 Tokens

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

//             // ---------------------------------
//             // Deposit Mock FA2 Tokens
//             // ---------------------------------

//             // update operators for vault
//             const updateOperatorsOperation = await mockFa2TokenInstance.methods.update_operators([
//             {
//                 add_operator: {
//                     owner: eve.pkh,
//                     operator: vaultAddress,
//                     token_id: 0,
//                 },
//             }])
//             .send()
//             await updateOperatorsOperation.confirmation();

//             // eve deposits mock FA2 tokens into vault
//             const eveDepositTokenOperation  = await vaultInstance.methods.deposit(
//                 mockFa2DepositAmount,  
//                 "mockFa2"
//             ).send();
//             await eveDepositTokenOperation.confirmation();

//             console.log('   - vault collateral deposited');

//             // ----------------------------------------------------------------------------------------------
//             // Borrow with Vault
//             // ----------------------------------------------------------------------------------------------

//             // borrow amount - 20 Mock FA12 Tokens
//             const borrowAmount = 20000000;   

//             // borrow operation
//             const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
//             await eveBorrowOperation.confirmation();

//             // get initial Mock FA12 Token balance for Eve, Treasury and Token Pool Reward Contract
//             const eveMockFa12Ledger                 = await mockFa12TokenStorage.ledger.get(eve.pkh);            
//             const eveInitialMockFa12TokenBalance    = eveMockFa12Ledger == undefined ? 0 : eveMockFa12Ledger.balance.toNumber();

//             const treasuryMockFa12Ledger                = await mockFa12TokenStorage.ledger.get(treasuryAddress.address);            
//             const treasuryInitialMockFa12TokenBalance   = treasuryMockFa12Ledger == undefined ? 0 : treasuryMockFa12Ledger.balance.toNumber();

//             // get token pool stats
//             const afterBorrowloanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
//             const loanTokenDecimals    = afterBorrowloanTokenRecordView.tokenDecimals;
//             const interestRateDecimals = (27 - 2); 

//             const tokenPoolTotal           = afterBorrowloanTokenRecordView.tokenPoolTotal.toNumber() / (10 ** loanTokenDecimals);
//             const totalBorrowed            = afterBorrowloanTokenRecordView.totalBorrowed.toNumber() / (10 ** loanTokenDecimals);
//             const optimalUtilisationRate   = Number(afterBorrowloanTokenRecordView.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
//             const utilisationRate          = Number(afterBorrowloanTokenRecordView.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
//             const currentInterestRate      = Number(afterBorrowloanTokenRecordView.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";

//             console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);

//             // ----------------------------------------------------------------------------------------------
//             // Set Block Levels For Mock Time Test - 1 month
//             // ----------------------------------------------------------------------------------------------

//             await signerFactory(bob.sk); // temporarily set to tester to increase block levels

//             const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
//             const updatedVault                      = await updatedLendingControllerStorage.vaults.get(vaultHandle);
//             const lastUpdatedBlockLevel             = updatedVault.lastUpdatedBlockLevel;

//             const newBlockLevel = lastUpdatedBlockLevel.toNumber() + oneMonthLevelBlocks;

//             const setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(newBlockLevel, 'configMockLevel').send();
//             await setMockLevelOperation.confirmation();

//             const mockTimeLendingControllerStorage = await lendingControllerInstance.storage();
//             const updatedMockLevel = mockTimeLendingControllerStorage.config.mockLevel;

//             assert.equal(updatedMockLevel, newBlockLevel);

//             console.log('   - time set to 1 month ahead: ' + lastUpdatedBlockLevel + ' to ' + newBlockLevel);

//             // ----------------------------------------------------------------------------------------------
//             // Repay partial debt 
//             // ----------------------------------------------------------------------------------------------

//             // set back to user
//             await signerFactory(eve.sk);  

//             // treasury share of interest repaid
//             const configInterestTreasuryShare = await lendingControllerStorage.config.interestTreasuryShare;

//             // repayment amount
//             const repayAmount = 10000; // 0.01 Mock FA12 Tokens

//             // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
//             // reset token allowance
//             const resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
//                 lendingControllerMockTimeAddress.address,
//                 0
//             ).send();
//             await resetTokenAllowance.confirmation();

//             // set new token allowance
//             const setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
//                 lendingControllerMockTimeAddress.address,
//                 repayAmount
//             ).send();
//             await setNewTokenAllowance.confirmation();

//             // get vault and loan token views, and storage
//             const vaultRecordView        = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
//             const loanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
//             const beforeRepaymentStorage = await lendingControllerInstance.storage();

//             const initialVaultLoanOutstandingTotal         = vaultRecordView.loanOutstandingTotal;
//             const beforeRepaymentVaultBorrowIndex          = vaultRecordView.borrowIndex;
//             const beforeRepaymentVaultOutstandingTotal     = vaultRecordView.loanOutstandingTotal;
//             const beforeRepaymentVaultPrincipalTotal       = vaultRecordView.loanPrincipalTotal;
//             const beforeRepaymentTokenBorrowIndex          = loanTokenRecordView.borrowIndex;

//             initialTokenRewardIndex = loanTokenRecordView.accumulatedRewardsPerShare;
//             initialTokenPoolTotal   = loanTokenRecordView.tokenPoolTotal;

//             // const repayOpParam        = await lendingControllerInstance.methods.repay(vaultId, repayAmount).toTransferParams();
//             // const estimate              = await utils.tezos.estimate.transfer(repayOpParam);
//             // console.log("REPAY OP ESTIMATION: ", estimate);

//             // repay operation
//             const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send();
//             await eveRepayOperation.confirmation();

//             console.log('   - repaid: ' + repayAmount + " | type: " + loanTokenName);

//             // get updated storage
//             const updatedLendingControllerStorageAfterRepay   = await lendingControllerInstance.storage();
//             const updatedVaultRecord                          = await updatedLendingControllerStorageAfterRepay.vaults.get(vaultHandle);
//             const updatedMockFa12TokenStorage                 = await mockFa12TokenInstance.storage();
            
//             // get updated Mock FA12 Token balance for Eve, Treasury and Token Pool Reward Contract
//             const updatedEveMockFa12Ledger                      = await updatedMockFa12TokenStorage.ledger.get(eve.pkh);            
//             const updatedEveMockFa12TokenBalance                = updatedEveMockFa12Ledger == undefined ? 0 : updatedEveMockFa12Ledger.balance.toNumber();

//             const updatedTreasuryMockFa12Ledger                 = await updatedMockFa12TokenStorage.ledger.get(treasuryAddress.address);            
//             const updatedTreasuryMockFa12TokenBalance           = updatedTreasuryMockFa12Ledger == undefined ? 0 : updatedTreasuryMockFa12Ledger.balance.toNumber();

//             // On-chain views to vault and loan token
//             updatedVaultRecordView     = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
//             updatedLoanTokenRecordView = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});

//             const updatedLoanOutstandingTotal             = updatedVaultRecordView.loanOutstandingTotal;
//             const updatedLoanPrincipalTotal               = updatedVaultRecordView.loanPrincipalTotal;
//             const updatedLoanInterestTotal                = updatedVaultRecordView.loanInterestTotal;

//             const afterRepaymentVaultBorrowIndex          = updatedVaultRecordView.borrowIndex;
//             const afterRepaymentTokenBorrowIndex          = updatedLoanTokenRecordView.borrowIndex;
            
//             const loanOutstandingWithAccruedInterest      = lendingHelper.calculateAccruedInterest(beforeRepaymentVaultOutstandingTotal, beforeRepaymentVaultBorrowIndex, afterRepaymentTokenBorrowIndex);
//             const totalInterest                           = loanOutstandingWithAccruedInterest - initialVaultLoanOutstandingTotal.toNumber();
            
//             // check if repayAmount covers whole or partial of total interest 
//             const totalInterestPaid                       = repayAmount < totalInterest ? repayAmount : totalInterest;
//             const remainingInterest                       = totalInterest - repayAmount < 0 ? 0 : totalInterest - repayAmount;
            
//             const finalLoanOutstandingTotal               = loanOutstandingWithAccruedInterest - repayAmount;
//             const finalLoanPrincipalTotal                 = remainingInterest > 0 ? beforeRepaymentVaultPrincipalTotal : loanOutstandingWithAccruedInterest - repayAmount;
//             const finalLoanInterestTotal                  = remainingInterest > 0 ? remainingInterest : 0;

//             const interestTreasuryShare                   = lendingHelper.calculateInterestSentToTreasury(configInterestTreasuryShare, totalInterestPaid);
//             const interestRewards                         = totalInterestPaid - interestTreasuryShare;

//             // calculate new reward index
//             updatedTokenRewardIndex                       = updatedLoanTokenRecordView.accumulatedRewardsPerShare;
//             const calculatedTokenRewardIndex              = lendingHelper.calculateNewRewardIndex(interestRewards, initialTokenPoolTotal, initialTokenRewardIndex);
//             assert.equal(almostEqual(updatedTokenRewardIndex.toNumber(), calculatedTokenRewardIndex, 0.00001), true);

//             console.log('   - final vault stats >> outstanding total: ' + finalLoanOutstandingTotal + " | principal total: " + finalLoanPrincipalTotal  + " | interest total: " + finalLoanInterestTotal);
//             console.log('   - interest stats >> total interest: ' + totalInterest + ' | interest paid: ' + totalInterestPaid +' | interest to treasury: ' + interestTreasuryShare + " | interest to reward pool: " + interestRewards);

//             assert.equal(updatedLoanOutstandingTotal.toNumber(), finalLoanOutstandingTotal);
//             assert.equal(updatedLoanPrincipalTotal.toNumber(), finalLoanPrincipalTotal);
//             assert.equal(updatedLoanInterestTotal.toNumber(), finalLoanInterestTotal);
//             assert.equal(afterRepaymentVaultBorrowIndex.toNumber(), afterRepaymentTokenBorrowIndex.toNumber());
//             assert.equal(updatedEveMockFa12TokenBalance, eveInitialMockFa12TokenBalance - repayAmount);

//             // check treasury fees and interest to token pool reward contract
//             assert.equal(updatedTreasuryMockFa12TokenBalance, treasuryInitialMockFa12TokenBalance + interestTreasuryShare)

//         })

//     })


//     describe('%repay mockFA2 Tokens - mock time tests (1 month)', function () {

//         it('user (eve) can repay debt - Mock FA2 Token  - mock one month - utilisation rate below optimal utilisation rate - repayment greater than interest', async () => {

//             // Conditions: 
//             // - vault loan token: mock FA2 tokens
//             // - mock time: 1 month
//             // - token pool interest rate: below optimal utilisation rate
//             // - repay amount: greater than interest amount 

//             // Summary of steps:
//             // 1. Create Vault
//             // 2. Deposit collateral into vault (100 Mock FA12 Tokens, 100 Mock FA2 Tokens)
//             // 3. Borrow from vault (20 Mock FA2 Tokens)
//             // 4. Set block levels time to 1 year in future
//             // 5. Repay partial debt

//             // init variables
//             await signerFactory(eve.sk);
//             const lendingControllerStorage = await lendingControllerInstance.storage();
//             const vaultFactoryStorage      = await vaultFactoryInstance.storage();

//             // ----------------------------------------------------------------------------------------------
//             // Create Vault
//             // ----------------------------------------------------------------------------------------------

//             const vaultCounter  = vaultFactoryStorage.vaultCounter;
//             const vaultId       = vaultCounter.toNumber();
//             const vaultOwner    = eve.pkh;
//             const loanTokenName = "mockFa2";

//             const depositorsConfig      = "any";

//             const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
//                 eve.pkh,                // delegate to
//                 loanTokenName,          // loan token type
//                 depositorsConfig        // depositors config type - any / whitelist
//             ).send();
//             await userCreatesNewVaultOperation.confirmation();

//             const vaultHandle = {
//                 "id"    : vaultId,
//                 "owner" : vaultOwner
//             };
//             const newVaultRecord = await lendingControllerStorage.vaults.get(vaultHandle);
//             const vaultAddress   = newVaultRecord.address;
//             const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

//             console.log('   - vault originated: ' + vaultAddress);
//             console.log('   - vault id: ' + vaultId);

//             // push new vault id to vault set
//             eveVaultSet.push(vaultId);

//             // ----------------------------------------------------------------------------------------------
//             // Deposit Collateral into Vault
//             // ----------------------------------------------------------------------------------------------

//             const mockFa12DepositAmount      = 150000000;   // 150 Mock FA12 Tokens
//             const mockFa2DepositAmount       = 150000000;   // 150 Mock FA12 Tokens

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

//             // ---------------------------------
//             // Deposit Mock FA2 Tokens
//             // ---------------------------------

//             // update operators for vault
//             const updateOperatorsOperation = await mockFa2TokenInstance.methods.update_operators([
//             {
//                 add_operator: {
//                     owner: eve.pkh,
//                     operator: vaultAddress,
//                     token_id: 0,
//                 },
//             }])
//             .send()
//             await updateOperatorsOperation.confirmation();

//             // eve deposits mock FA2 tokens into vault
//             const eveDepositTokenOperation = await vaultInstance.methods.deposit(
//                 mockFa2DepositAmount,  
//                 "mockFa2"
//             ).send();
//             await eveDepositTokenOperation.confirmation();

//             console.log('   - vault collateral deposited');

//             // ----------------------------------------------------------------------------------------------
//             // Borrow with Vault
//             // ----------------------------------------------------------------------------------------------

//             // borrow amount - 20 Mock FA12 Tokens
//             const borrowAmount = 20000000;   

//             // borrow operation
//             const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
//             await eveBorrowOperation.confirmation();

//             console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName);

//             // get initial Mock FA12 Token balance for Eve, Treasury and Token Pool Reward Contract
//             const eveMockFa2Ledger                 = await mockFa2TokenStorage.ledger.get(eve.pkh);            
//             const eveInitialMockFa2TokenBalance    = eveMockFa2Ledger == undefined ? 0 : eveMockFa2Ledger.toNumber();

//             const treasuryMockFa2Ledger                = await mockFa2TokenStorage.ledger.get(treasuryAddress.address);            
//             const treasuryInitialMockFa2TokenBalance   = treasuryMockFa2Ledger == undefined ? 0 : treasuryMockFa2Ledger.toNumber();

//             // get token pool stats
//             const afterBorrowloanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
//             const loanTokenDecimals    = afterBorrowloanTokenRecordView.tokenDecimals;
//             const interestRateDecimals = (27 - 2); 

//             const tokenPoolTotal           = afterBorrowloanTokenRecordView.tokenPoolTotal.toNumber() / (10 ** loanTokenDecimals);
//             const totalBorrowed            = afterBorrowloanTokenRecordView.totalBorrowed.toNumber() / (10 ** loanTokenDecimals);
//             const optimalUtilisationRate   = Number(afterBorrowloanTokenRecordView.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
//             const utilisationRate          = Number(afterBorrowloanTokenRecordView.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
//             const currentInterestRate      = Number(afterBorrowloanTokenRecordView.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";

//             console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);

//             // ----------------------------------------------------------------------------------------------
//             // Set Block Levels For Mock Time Test - 1 month
//             // ----------------------------------------------------------------------------------------------

//             await signerFactory(bob.sk); // temporarily set to tester to increase block levels

//             const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
//             const updatedVault                      = await updatedLendingControllerStorage.vaults.get(vaultHandle);
//             const lastUpdatedBlockLevel             = updatedVault.lastUpdatedBlockLevel;

//             const newBlockLevel = lastUpdatedBlockLevel.toNumber() + oneMonthLevelBlocks;

//             const setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(newBlockLevel, 'configMockLevel').send();
//             await setMockLevelOperation.confirmation();

//             const mockTimeLendingControllerStorage = await lendingControllerInstance.storage();
//             const updatedMockLevel = mockTimeLendingControllerStorage.config.mockLevel;

//             assert.equal(updatedMockLevel, newBlockLevel);

//             console.log('   - time set to 1 month ahead: ' + lastUpdatedBlockLevel + ' to ' + newBlockLevel);

//             // ----------------------------------------------------------------------------------------------
//             // Repay partial debt 
//             // ----------------------------------------------------------------------------------------------

//             // set back to user
//             await signerFactory(eve.sk);  

//             // treasury share of interest repaid
//             const configInterestTreasuryShare = await lendingControllerStorage.config.interestTreasuryShare;

//             // repayment amount
//             const repayAmount = 500000; // 0.5 Mock FA12 Tokens

//             // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
//             // reset token allowance
//             const resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
//                 lendingControllerMockTimeAddress.address,
//                 0
//             ).send();
//             await resetTokenAllowance.confirmation();

//             // set new token allowance
//             const setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
//                 lendingControllerMockTimeAddress.address,
//                 repayAmount
//             ).send();
//             await setNewTokenAllowance.confirmation();

//             // get vault and loan token views, and storage
//             const vaultRecordView        = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
//             const loanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
//             const beforeRepaymentStorage = await lendingControllerInstance.storage();

//             const initialVaultLoanOutstandingTotal         = vaultRecordView.loanOutstandingTotal;
//             const beforeRepaymentVaultBorrowIndex          = vaultRecordView.borrowIndex;
//             const beforeRepaymentVaultOutstandingTotal     = vaultRecordView.loanOutstandingTotal;
//             const beforeRepaymentVaultPrincipalTotal       = vaultRecordView.loanPrincipalTotal;
//             const beforeRepaymentTokenBorrowIndex          = loanTokenRecordView.borrowIndex;

//             initialTokenRewardIndex = loanTokenRecordView.accumulatedRewardsPerShare;
//             initialTokenPoolTotal   = loanTokenRecordView.tokenPoolTotal;

//             // const repayOpParam        = await lendingControllerInstance.methods.repay(vaultId, repayAmount).toTransferParams();
//             // const estimate            = await utils.tezos.estimate.transfer(repayOpParam);
//             // console.log("REPAY OP ESTIMATION: ", estimate);

//             // repay operation
//             const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send();
//             await eveRepayOperation.confirmation();

//             console.log('   - repaid: ' + repayAmount + " | type: " + loanTokenName);

//             // get updated storage
//             const updatedLendingControllerStorageAfterRepay     = await lendingControllerInstance.storage();
//             const updatedVaultRecord                            = await updatedLendingControllerStorageAfterRepay.vaults.get(vaultHandle);
//             const updatedMockFa2TokenStorage                    = await mockFa2TokenInstance.storage();
            
//             // get updated Mock FA2 Token balance for Eve, Treasury and Token Pool Reward Contract
//             const updatedEveMockFa2Ledger                       = await updatedMockFa2TokenStorage.ledger.get(eve.pkh);            
//             const updatedEveMockFa2TokenBalance                 = updatedEveMockFa2Ledger == undefined ? 0 : updatedEveMockFa2Ledger.toNumber();

//             const updatedTreasuryMockFa2Ledger                  = await updatedMockFa2TokenStorage.ledger.get(treasuryAddress.address);            
//             const updatedTreasuryMockFa2TokenBalance            = updatedTreasuryMockFa2Ledger == undefined ? 0 : updatedTreasuryMockFa2Ledger.toNumber();

//             // On-chain views to vault and loan token
//             updatedVaultRecordView     = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
//             updatedLoanTokenRecordView = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});

//             const updatedLoanOutstandingTotal             = updatedVaultRecordView.loanOutstandingTotal;
//             const updatedLoanPrincipalTotal               = updatedVaultRecordView.loanPrincipalTotal;
//             const updatedLoanInterestTotal                = updatedVaultRecordView.loanInterestTotal;

//             const afterRepaymentVaultBorrowIndex          = updatedVaultRecordView.borrowIndex;
//             const afterRepaymentTokenBorrowIndex          = updatedLoanTokenRecordView.borrowIndex;
            
//             const loanOutstandingWithAccruedInterest      = lendingHelper.calculateAccruedInterest(beforeRepaymentVaultOutstandingTotal, beforeRepaymentVaultBorrowIndex, afterRepaymentTokenBorrowIndex);
//             const totalInterest                           = loanOutstandingWithAccruedInterest - initialVaultLoanOutstandingTotal.toNumber();
            
//             // check if repayAmount covers whole or partial of total interest 
//             const totalInterestPaid                       = repayAmount < totalInterest ? repayAmount : totalInterest;
//             const remainingInterest                       = totalInterest - repayAmount < 0 ? 0 : totalInterest - repayAmount;
            
//             const finalLoanOutstandingTotal               = loanOutstandingWithAccruedInterest - repayAmount;
//             const finalLoanPrincipalTotal                 = remainingInterest > 0 ? beforeRepaymentVaultPrincipalTotal : loanOutstandingWithAccruedInterest - repayAmount;
//             const finalLoanInterestTotal                  = remainingInterest > 0 ? remainingInterest : 0;

//             const interestTreasuryShare                   = lendingHelper.calculateInterestSentToTreasury(configInterestTreasuryShare, totalInterestPaid);
//             const interestRewards                         = totalInterestPaid - interestTreasuryShare;

//             // calculate new reward index
//             updatedTokenRewardIndex                       = updatedLoanTokenRecordView.accumulatedRewardsPerShare;
//             const calculatedTokenRewardIndex              = lendingHelper.calculateNewRewardIndex(interestRewards, initialTokenPoolTotal, initialTokenRewardIndex);
//             assert.equal(almostEqual(updatedTokenRewardIndex.toNumber(), calculatedTokenRewardIndex, 0.00001), true);

//             console.log('   - final vault stats >> outstanding total: ' + finalLoanOutstandingTotal + " | principal total: " + finalLoanPrincipalTotal  + " | interest total: " + finalLoanInterestTotal);
//             console.log('   - interest stats >> total interest: ' + totalInterest + ' | interest paid: ' + totalInterestPaid +' | interest to treasury: ' + interestTreasuryShare + " | interest to reward pool: " + interestRewards);

//             assert.equal(updatedLoanOutstandingTotal.toNumber(), finalLoanOutstandingTotal);
//             assert.equal(updatedLoanPrincipalTotal.toNumber(), finalLoanPrincipalTotal);
//             assert.equal(updatedLoanInterestTotal.toNumber(), finalLoanInterestTotal);
//             assert.equal(afterRepaymentVaultBorrowIndex.toNumber(), afterRepaymentTokenBorrowIndex.toNumber());
//             assert.equal(updatedEveMockFa2TokenBalance, eveInitialMockFa2TokenBalance - repayAmount);

//             // check treasury fees and interest to token pool reward contract
//             assert.equal(updatedTreasuryMockFa2TokenBalance, treasuryInitialMockFa2TokenBalance + interestTreasuryShare)

//         })



//         it('user (eve) can repay debt - Mock FA2 Token  - mock one month - utilisation rate below optimal utilisation rate - repayment less than interest', async () => {

//             // Conditions: 
//             // - vault loan token: mock FA2 tokens
//             // - mock time: 1 month
//             // - token pool interest rate: below optimal utilisation rate
//             // - repay amount: less than interest amount 

//             // Summary of steps:
//             // 1. Create Vault
//             // 2. Deposit collateral into vault (100 Mock FA12 Tokens, 100 Mock FA2 Tokens)
//             // 3. Borrow from vault (20 Mock FA2 Tokens)
//             // 4. Set block levels time to 1 year in future
//             // 5. Repay partial debt

//             // init variables
//             await signerFactory(eve.sk);
//             const lendingControllerStorage = await lendingControllerInstance.storage();
//             const vaultFactoryStorage      = await vaultFactoryInstance.storage();

//             // ----------------------------------------------------------------------------------------------
//             // Create Vault
//             // ----------------------------------------------------------------------------------------------

//             const vaultCounter  = vaultFactoryStorage.vaultCounter;
//             const vaultId       = vaultCounter.toNumber();
//             const vaultOwner    = eve.pkh;
//             const loanTokenName = "mockFa2";

//             const depositorsConfig      = "any";

//             const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
//                 eve.pkh,                // delegate to
//                 loanTokenName,          // loan token type
//                 depositorsConfig        // depositors config type - any / whitelist
//             ).send();
//             await userCreatesNewVaultOperation.confirmation();

//             const vaultHandle = {
//                 "id"    : vaultId,
//                 "owner" : vaultOwner
//             };
//             const newVaultRecord = await lendingControllerStorage.vaults.get(vaultHandle);
//             const vaultAddress   = newVaultRecord.address;
//             const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

//             console.log('   - vault originated: ' + vaultAddress);
//             console.log('   - vault id: ' + vaultId);

//             // push new vault id to vault set
//             eveVaultSet.push(vaultId);

//             // ----------------------------------------------------------------------------------------------
//             // Deposit Collateral into Vault
//             // ----------------------------------------------------------------------------------------------

//             const mockFa12DepositAmount      = 150000000;   // 150 Mock FA12 Tokens
//             const mockFa2DepositAmount       = 150000000;   // 150 Mock FA12 Tokens

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

//             // ---------------------------------
//             // Deposit Mock FA2 Tokens
//             // ---------------------------------

//             // update operators for vault
//             const updateOperatorsOperation = await mockFa2TokenInstance.methods.update_operators([
//             {
//                 add_operator: {
//                     owner: eve.pkh,
//                     operator: vaultAddress,
//                     token_id: 0,
//                 },
//             }])
//             .send()
//             await updateOperatorsOperation.confirmation();

//             // eve deposits mock FA2 tokens into vault
//             const eveDepositTokenOperation = await vaultInstance.methods.deposit(
//                 mockFa2DepositAmount,      
//                 "mockFa2"
//             ).send();
//             await eveDepositTokenOperation.confirmation();

//             console.log('   - vault collateral deposited');

//             // ----------------------------------------------------------------------------------------------
//             // Borrow with Vault
//             // ----------------------------------------------------------------------------------------------

//             // borrow amount - 20 Mock FA12 Tokens
//             const borrowAmount = 20000000;   

//             // borrow operation
//             const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
//             await eveBorrowOperation.confirmation();

//             console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName);

//             // get initial Mock FA12 Token balance for Eve, Treasury and Token Pool Reward Contract
//             const eveMockFa2Ledger                 = await mockFa2TokenStorage.ledger.get(eve.pkh);            
//             const eveInitialMockFa2TokenBalance    = eveMockFa2Ledger == undefined ? 0 : eveMockFa2Ledger.toNumber();

//             const treasuryMockFa2Ledger                = await mockFa2TokenStorage.ledger.get(treasuryAddress.address);            
//             const treasuryInitialMockFa2TokenBalance   = treasuryMockFa2Ledger == undefined ? 0 : treasuryMockFa2Ledger.toNumber();

//             // get token pool stats
//             const afterBorrowloanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
//             const loanTokenDecimals    = afterBorrowloanTokenRecordView.tokenDecimals;
//             const interestRateDecimals = (27 - 2); 

//             const tokenPoolTotal           = afterBorrowloanTokenRecordView.tokenPoolTotal.toNumber() / (10 ** loanTokenDecimals);
//             const totalBorrowed            = afterBorrowloanTokenRecordView.totalBorrowed.toNumber() / (10 ** loanTokenDecimals);
//             const optimalUtilisationRate   = Number(afterBorrowloanTokenRecordView.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
//             const utilisationRate          = Number(afterBorrowloanTokenRecordView.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
//             const currentInterestRate      = Number(afterBorrowloanTokenRecordView.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";

//             console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);

//             // ----------------------------------------------------------------------------------------------
//             // Set Block Levels For Mock Time Test - 1 month
//             // ----------------------------------------------------------------------------------------------

//             await signerFactory(bob.sk); // temporarily set to tester to increase block levels

//             const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
//             const updatedVault                      = await updatedLendingControllerStorage.vaults.get(vaultHandle);
//             const lastUpdatedBlockLevel             = updatedVault.lastUpdatedBlockLevel;

//             const newBlockLevel = lastUpdatedBlockLevel.toNumber() + oneMonthLevelBlocks;

//             const setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(newBlockLevel, 'configMockLevel').send();
//             await setMockLevelOperation.confirmation();

//             const mockTimeLendingControllerStorage = await lendingControllerInstance.storage();
//             const updatedMockLevel = mockTimeLendingControllerStorage.config.mockLevel;

//             assert.equal(updatedMockLevel, newBlockLevel);

//             console.log('   - time set to 1 month ahead: ' + lastUpdatedBlockLevel + ' to ' + newBlockLevel);

//             // ----------------------------------------------------------------------------------------------
//             // Repay partial debt 
//             // ----------------------------------------------------------------------------------------------

//             // set back to user
//             await signerFactory(eve.sk);  

//             // treasury share of interest repaid
//             const configInterestTreasuryShare = await lendingControllerStorage.config.interestTreasuryShare;

//             // repayment amount
//             const repayAmount = 10000; // 0.01 Mock FA12 Tokens

//             // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
//             // reset token allowance
//             const resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
//                 lendingControllerMockTimeAddress.address,
//                 0
//             ).send();
//             await resetTokenAllowance.confirmation();

//             // set new token allowance
//             const setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
//                 lendingControllerMockTimeAddress.address,
//                 repayAmount
//             ).send();
//             await setNewTokenAllowance.confirmation();

//             // get vault and loan token views, and storage
//             const vaultRecordView        = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
//             const loanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
//             const beforeRepaymentStorage = await lendingControllerInstance.storage();

//             const initialVaultLoanOutstandingTotal         = vaultRecordView.loanOutstandingTotal;
//             const beforeRepaymentVaultBorrowIndex          = vaultRecordView.borrowIndex;
//             const beforeRepaymentVaultOutstandingTotal     = vaultRecordView.loanOutstandingTotal;
//             const beforeRepaymentVaultPrincipalTotal       = vaultRecordView.loanPrincipalTotal;
//             const beforeRepaymentTokenBorrowIndex          = loanTokenRecordView.borrowIndex;

//             initialTokenRewardIndex = loanTokenRecordView.accumulatedRewardsPerShare;
//             initialTokenPoolTotal   = loanTokenRecordView.tokenPoolTotal;

//             // const repayOpParam        = await lendingControllerInstance.methods.repay(vaultId, repayAmount).toTransferParams();
//             // const estimate            = await utils.tezos.estimate.transfer(repayOpParam);
//             // console.log("REPAY OP ESTIMATION: ", estimate);

//             // repay operation
//             const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send();
//             await eveRepayOperation.confirmation();

//             console.log('   - repaid: ' + repayAmount + " | type: " + loanTokenName);

//             // get updated storage
//             const updatedLendingControllerStorageAfterRepay     = await lendingControllerInstance.storage();
//             const updatedVaultRecord                            = await updatedLendingControllerStorageAfterRepay.vaults.get(vaultHandle);
//             const updatedMockFa2TokenStorage                    = await mockFa2TokenInstance.storage();
            
//             // get updated Mock FA2 Token balance for Eve, Treasury and Token Pool Reward Contract
//             const updatedEveMockFa2Ledger                       = await updatedMockFa2TokenStorage.ledger.get(eve.pkh);            
//             const updatedEveMockFa2TokenBalance                 = updatedEveMockFa2Ledger == undefined ? 0 : updatedEveMockFa2Ledger.toNumber();

//             const updatedTreasuryMockFa2Ledger                  = await updatedMockFa2TokenStorage.ledger.get(treasuryAddress.address);            
//             const updatedTreasuryMockFa2TokenBalance            = updatedTreasuryMockFa2Ledger == undefined ? 0 : updatedTreasuryMockFa2Ledger.toNumber();

//             // On-chain views to vault and loan token
//             updatedVaultRecordView     = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
//             updatedLoanTokenRecordView = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});

//             const updatedLoanOutstandingTotal             = updatedVaultRecordView.loanOutstandingTotal;
//             const updatedLoanPrincipalTotal               = updatedVaultRecordView.loanPrincipalTotal;
//             const updatedLoanInterestTotal                = updatedVaultRecordView.loanInterestTotal;

//             const afterRepaymentVaultBorrowIndex          = updatedVaultRecordView.borrowIndex;
//             const afterRepaymentTokenBorrowIndex          = updatedLoanTokenRecordView.borrowIndex;
            
//             const loanOutstandingWithAccruedInterest      = lendingHelper.calculateAccruedInterest(beforeRepaymentVaultOutstandingTotal, beforeRepaymentVaultBorrowIndex, afterRepaymentTokenBorrowIndex);
//             const totalInterest                           = loanOutstandingWithAccruedInterest - initialVaultLoanOutstandingTotal.toNumber();
            
//             // check if repayAmount covers whole or partial of total interest 
//             const totalInterestPaid                       = repayAmount < totalInterest ? repayAmount : totalInterest;
//             const remainingInterest                       = totalInterest - repayAmount < 0 ? 0 : totalInterest - repayAmount;
            
//             const finalLoanOutstandingTotal               = loanOutstandingWithAccruedInterest - repayAmount;
//             const finalLoanPrincipalTotal                 = remainingInterest > 0 ? beforeRepaymentVaultPrincipalTotal : loanOutstandingWithAccruedInterest - repayAmount;
//             const finalLoanInterestTotal                  = remainingInterest > 0 ? remainingInterest : 0;

//             const interestTreasuryShare                   = lendingHelper.calculateInterestSentToTreasury(configInterestTreasuryShare, totalInterestPaid);
//             const interestRewards                         = totalInterestPaid - interestTreasuryShare;

//             // calculate new reward index
//             updatedTokenRewardIndex                       = updatedLoanTokenRecordView.accumulatedRewardsPerShare;
//             const calculatedTokenRewardIndex              = lendingHelper.calculateNewRewardIndex(interestRewards, initialTokenPoolTotal, initialTokenRewardIndex);
//             assert.equal(almostEqual(updatedTokenRewardIndex.toNumber(), calculatedTokenRewardIndex, 0.00001), true);

//             console.log('   - final vault stats >> outstanding total: ' + finalLoanOutstandingTotal + " | principal total: " + finalLoanPrincipalTotal  + " | interest total: " + finalLoanInterestTotal);
//             console.log('   - interest stats >> total interest: ' + totalInterest + ' | interest paid: ' + totalInterestPaid +' | interest to treasury: ' + interestTreasuryShare + " | interest to reward pool: " + interestRewards);

//             assert.equal(updatedLoanOutstandingTotal.toNumber(), finalLoanOutstandingTotal);
//             assert.equal(updatedLoanPrincipalTotal.toNumber(), finalLoanPrincipalTotal);
//             assert.equal(updatedLoanInterestTotal.toNumber(), finalLoanInterestTotal);
//             assert.equal(afterRepaymentVaultBorrowIndex.toNumber(), afterRepaymentTokenBorrowIndex.toNumber());
//             assert.equal(updatedEveMockFa2TokenBalance, eveInitialMockFa2TokenBalance - repayAmount);

//             // check treasury fees and interest to token pool reward contract
//             assert.equal(updatedTreasuryMockFa2TokenBalance, treasuryInitialMockFa2TokenBalance + interestTreasuryShare)

//         })



//         it('user (eve) can repay debt - Mock FA2 Token  - mock one month - utilisation rate above optimal utilisation rate - repayment greater than interest', async () => {

//             // Conditions: 
//             // - vault loan token: mock FA2 tokens
//             // - mock time: 1 month
//             // - token pool interest rate: above optimal utilisation rate
//             // - repay amount: greater than interest amount 

//             // Summary of steps:
//             // 1. Create Vault
//             // 2. Deposit collateral into vault (100 Mock FA12 Tokens, 100 Mock FA2 Tokens)
//             // 3. Borrow from vault (20 Mock FA2 Tokens)
//             // 4. Set block levels time to 1 year in future
//             // 5. Repay partial debt

//             // init variables
//             await signerFactory(eve.sk);
//             const lendingControllerStorage = await lendingControllerInstance.storage();
//             const vaultFactoryStorage      = await vaultFactoryInstance.storage();

//             // ----------------------------------------------------------------------------------------------
//             // Create Vault
//             // ----------------------------------------------------------------------------------------------

//             const vaultCounter  = vaultFactoryStorage.vaultCounter;
//             const vaultId       = vaultCounter.toNumber();
//             const vaultOwner    = eve.pkh;
//             const loanTokenName = "mockFa2";

//             const depositorsConfig      = "any";

//             const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
//                 eve.pkh,                // delegate to
//                 loanTokenName,          // loan token type
//                 depositorsConfig        // depositors config type - any / whitelist
//             ).send();
//             await userCreatesNewVaultOperation.confirmation();

//             const vaultHandle = {
//                 "id"    : vaultId,
//                 "owner" : vaultOwner
//             };
//             const newVaultRecord = await lendingControllerStorage.vaults.get(vaultHandle);
//             const vaultAddress   = newVaultRecord.address;
//             const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

//             console.log('   - vault originated: ' + vaultAddress);
//             console.log('   - vault id: ' + vaultId);

//             // push new vault id to vault set
//             eveVaultSet.push(vaultId);

//             // ----------------------------------------------------------------------------------------------
//             // Deposit Collateral into Vault
//             // ----------------------------------------------------------------------------------------------

//             const mockFa12DepositAmount      = 150000000;   // 150 Mock FA12 Tokens
//             const mockFa2DepositAmount       = 150000000;   // 150 Mock FA12 Tokens

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

//             // ---------------------------------
//             // Deposit Mock FA2 Tokens
//             // ---------------------------------

//             // update operators for vault
//             const updateOperatorsOperation = await mockFa2TokenInstance.methods.update_operators([
//             {
//                 add_operator: {
//                     owner: eve.pkh,
//                     operator: vaultAddress,
//                     token_id: 0,
//                 },
//             }])
//             .send()
//             await updateOperatorsOperation.confirmation();

//             // eve deposits mock FA2 tokens into vault
//             const eveDepositTokenOperation = await vaultInstance.methods.deposit(
//                 mockFa2DepositAmount,      
//                 "mockFa2"
//             ).send();
//             await eveDepositTokenOperation.confirmation();

//             console.log('   - vault collateral deposited');

//             // ----------------------------------------------------------------------------------------------
//             // Borrow with Vault
//             // ----------------------------------------------------------------------------------------------

//             // borrow amount - 20 Mock FA12 Tokens
//             const borrowAmount = 20000000;   

//             // borrow operation
//             const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
//             await eveBorrowOperation.confirmation();

//             console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName);

//             // get initial Mock FA12 Token balance for Eve, Treasury and Token Pool Reward Contract
//             const eveMockFa2Ledger                 = await mockFa2TokenStorage.ledger.get(eve.pkh);            
//             const eveInitialMockFa2TokenBalance    = eveMockFa2Ledger == undefined ? 0 : eveMockFa2Ledger.toNumber();

//             const treasuryMockFa2Ledger                = await mockFa2TokenStorage.ledger.get(treasuryAddress.address);            
//             const treasuryInitialMockFa2TokenBalance   = treasuryMockFa2Ledger == undefined ? 0 : treasuryMockFa2Ledger.toNumber();

//             // get token pool stats
//             const afterBorrowloanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
//             const loanTokenDecimals    = afterBorrowloanTokenRecordView.tokenDecimals;
//             const interestRateDecimals = (27 - 2); 

//             const tokenPoolTotal           = afterBorrowloanTokenRecordView.tokenPoolTotal.toNumber() / (10 ** loanTokenDecimals);
//             const totalBorrowed            = afterBorrowloanTokenRecordView.totalBorrowed.toNumber() / (10 ** loanTokenDecimals);
//             const optimalUtilisationRate   = Number(afterBorrowloanTokenRecordView.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
//             const utilisationRate          = Number(afterBorrowloanTokenRecordView.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
//             const currentInterestRate      = Number(afterBorrowloanTokenRecordView.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";

//             console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);

//             // ----------------------------------------------------------------------------------------------
//             // Set Block Levels For Mock Time Test - 1 month
//             // ----------------------------------------------------------------------------------------------

//             await signerFactory(bob.sk); // temporarily set to tester to increase block levels

//             const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
//             const updatedVault                      = await updatedLendingControllerStorage.vaults.get(vaultHandle);
//             const lastUpdatedBlockLevel             = updatedVault.lastUpdatedBlockLevel;

//             const newBlockLevel = lastUpdatedBlockLevel.toNumber() + oneMonthLevelBlocks;

//             const setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(newBlockLevel, 'configMockLevel').send();
//             await setMockLevelOperation.confirmation();

//             const mockTimeLendingControllerStorage = await lendingControllerInstance.storage();
//             const updatedMockLevel = mockTimeLendingControllerStorage.config.mockLevel;

//             assert.equal(updatedMockLevel, newBlockLevel);

//             console.log('   - time set to 1 month ahead: ' + lastUpdatedBlockLevel + ' to ' + newBlockLevel);

//             // ----------------------------------------------------------------------------------------------
//             // Repay partial debt 
//             // ----------------------------------------------------------------------------------------------

//             // set back to user
//             await signerFactory(eve.sk);  

//             // treasury share of interest repaid
//             const configInterestTreasuryShare = await lendingControllerStorage.config.interestTreasuryShare;

//             // repayment amount
//             const repayAmount = 500000; // 0.5 Mock FA12 Tokens

//             // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
//             // reset token allowance
//             const resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
//                 lendingControllerMockTimeAddress.address,
//                 0
//             ).send();
//             await resetTokenAllowance.confirmation();

//             // set new token allowance
//             const setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
//                 lendingControllerMockTimeAddress.address,
//                 repayAmount
//             ).send();
//             await setNewTokenAllowance.confirmation();

//             // get vault and loan token views, and storage
//             const vaultRecordView        = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
//             const loanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
//             const beforeRepaymentStorage = await lendingControllerInstance.storage();

//             const initialVaultLoanOutstandingTotal         = vaultRecordView.loanOutstandingTotal;
//             const beforeRepaymentVaultBorrowIndex          = vaultRecordView.borrowIndex;
//             const beforeRepaymentVaultOutstandingTotal     = vaultRecordView.loanOutstandingTotal;
//             const beforeRepaymentVaultPrincipalTotal       = vaultRecordView.loanPrincipalTotal;
//             const beforeRepaymentTokenBorrowIndex          = loanTokenRecordView.borrowIndex;

//             initialTokenRewardIndex = loanTokenRecordView.accumulatedRewardsPerShare;
//             initialTokenPoolTotal   = loanTokenRecordView.tokenPoolTotal;

//             // const repayOpParam        = await lendingControllerInstance.methods.repay(vaultId, repayAmount).toTransferParams();
//             // const estimate            = await utils.tezos.estimate.transfer(repayOpParam);
//             // console.log("REPAY OP ESTIMATION: ", estimate);

//             // repay operation
//             const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send();
//             await eveRepayOperation.confirmation();

//             console.log('   - repaid: ' + repayAmount + " | type: " + loanTokenName);

//             // get updated storage
//             const updatedLendingControllerStorageAfterRepay     = await lendingControllerInstance.storage();
//             const updatedVaultRecord                            = await updatedLendingControllerStorageAfterRepay.vaults.get(vaultHandle);
//             const updatedMockFa2TokenStorage                    = await mockFa2TokenInstance.storage();
            
//             // get updated Mock FA2 Token balance for Eve, Treasury and Token Pool Reward Contract
//             const updatedEveMockFa2Ledger                       = await updatedMockFa2TokenStorage.ledger.get(eve.pkh);            
//             const updatedEveMockFa2TokenBalance                 = updatedEveMockFa2Ledger == undefined ? 0 : updatedEveMockFa2Ledger.toNumber();

//             const updatedTreasuryMockFa2Ledger                  = await updatedMockFa2TokenStorage.ledger.get(treasuryAddress.address);            
//             const updatedTreasuryMockFa2TokenBalance            = updatedTreasuryMockFa2Ledger == undefined ? 0 : updatedTreasuryMockFa2Ledger.toNumber();

//             // On-chain views to vault and loan token
//             updatedVaultRecordView     = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
//             updatedLoanTokenRecordView = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});

//             const updatedLoanOutstandingTotal             = updatedVaultRecordView.loanOutstandingTotal;
//             const updatedLoanPrincipalTotal               = updatedVaultRecordView.loanPrincipalTotal;
//             const updatedLoanInterestTotal                = updatedVaultRecordView.loanInterestTotal;

//             const afterRepaymentVaultBorrowIndex          = updatedVaultRecordView.borrowIndex;
//             const afterRepaymentTokenBorrowIndex          = updatedLoanTokenRecordView.borrowIndex;
            
//             const loanOutstandingWithAccruedInterest      = lendingHelper.calculateAccruedInterest(beforeRepaymentVaultOutstandingTotal, beforeRepaymentVaultBorrowIndex, afterRepaymentTokenBorrowIndex);
//             const totalInterest                           = loanOutstandingWithAccruedInterest - initialVaultLoanOutstandingTotal.toNumber();
            
//             // check if repayAmount covers whole or partial of total interest 
//             const totalInterestPaid                       = repayAmount < totalInterest ? repayAmount : totalInterest;
//             const remainingInterest                       = totalInterest - repayAmount < 0 ? 0 : totalInterest - repayAmount;
            
//             const finalLoanOutstandingTotal               = loanOutstandingWithAccruedInterest - repayAmount;
//             const finalLoanPrincipalTotal                 = remainingInterest > 0 ? beforeRepaymentVaultPrincipalTotal : loanOutstandingWithAccruedInterest - repayAmount;
//             const finalLoanInterestTotal                  = remainingInterest > 0 ? remainingInterest : 0;

//             const interestTreasuryShare                   = lendingHelper.calculateInterestSentToTreasury(configInterestTreasuryShare, totalInterestPaid);
//             const interestRewards                         = totalInterestPaid - interestTreasuryShare;

//             // calculate new reward index
//             updatedTokenRewardIndex                       = updatedLoanTokenRecordView.accumulatedRewardsPerShare;
//             const calculatedTokenRewardIndex              = lendingHelper.calculateNewRewardIndex(interestRewards, initialTokenPoolTotal, initialTokenRewardIndex);
//             assert.equal(almostEqual(updatedTokenRewardIndex.toNumber(), calculatedTokenRewardIndex, 0.00001), true);

//             console.log('   - final vault stats >> outstanding total: ' + finalLoanOutstandingTotal + " | principal total: " + finalLoanPrincipalTotal  + " | interest total: " + finalLoanInterestTotal);
//             console.log('   - interest stats >> total interest: ' + totalInterest + ' | interest paid: ' + totalInterestPaid +' | interest to treasury: ' + interestTreasuryShare + " | interest to reward pool: " + interestRewards);

//             assert.equal(updatedLoanOutstandingTotal.toNumber(), finalLoanOutstandingTotal);
//             assert.equal(updatedLoanPrincipalTotal.toNumber(), finalLoanPrincipalTotal);
//             assert.equal(updatedLoanInterestTotal.toNumber(), finalLoanInterestTotal);
//             assert.equal(afterRepaymentVaultBorrowIndex.toNumber(), afterRepaymentTokenBorrowIndex.toNumber());
//             assert.equal(updatedEveMockFa2TokenBalance, eveInitialMockFa2TokenBalance - repayAmount);

//             // check treasury fees and interest to token pool reward contract
//             assert.equal(updatedTreasuryMockFa2TokenBalance, treasuryInitialMockFa2TokenBalance + interestTreasuryShare)

//         })


//         it('user (eve) can repay debt - Mock FA2 Token  - mock one month - interest rate greater optimal utilisation rate - repayment less than interest', async () => {

//             // Conditions: 
//             // - vault loan token: mock FA2 tokens
//             // - mock time: 1 month
//             // - token pool interest rate: above optimal utilisation rate
//             // - repay amount: less than interest amount 

//             // Summary of steps:
//             // 1. Create Vault
//             // 2. Deposit collateral into vault (100 Mock FA12 Tokens, 100 Mock FA2 Tokens)
//             // 3. Borrow from vault (20 Mock FA2 Tokens)
//             // 4. Set block levels time to 1 year in future
//             // 5. Repay partial debt

//             // init variables
//             await signerFactory(eve.sk);
//             const lendingControllerStorage = await lendingControllerInstance.storage();
//             const vaultFactoryStorage      = await vaultFactoryInstance.storage();

//             // ----------------------------------------------------------------------------------------------
//             // Create Vault
//             // ----------------------------------------------------------------------------------------------

//             const vaultCounter  = vaultFactoryStorage.vaultCounter;
//             const vaultId       = vaultCounter.toNumber();
//             const vaultOwner    = eve.pkh;
//             const loanTokenName = "mockFa2";

//             const depositorsConfig      = "any";

//             const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
//                 eve.pkh,                // delegate to
//                 loanTokenName,          // loan token type
//                 depositorsConfig        // depositors config type - any / whitelist
//             ).send();
//             await userCreatesNewVaultOperation.confirmation();

//             const vaultHandle = {
//                 "id"    : vaultId,
//                 "owner" : vaultOwner
//             };
//             const newVaultRecord = await lendingControllerStorage.vaults.get(vaultHandle);
//             const vaultAddress   = newVaultRecord.address;
//             const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

//             console.log('   - vault originated: ' + vaultAddress);
//             console.log('   - vault id: ' + vaultId);

//             // push new vault id to vault set
//             eveVaultSet.push(vaultId);

//             // ----------------------------------------------------------------------------------------------
//             // Deposit Collateral into Vault
//             // ----------------------------------------------------------------------------------------------

//             const mockFa12DepositAmount      = 150000000;   // 150 Mock FA12 Tokens
//             const mockFa2DepositAmount       = 150000000;   // 150 Mock FA12 Tokens

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

//             // ---------------------------------
//             // Deposit Mock FA2 Tokens
//             // ---------------------------------

//             // update operators for vault
//             const updateOperatorsOperation = await mockFa2TokenInstance.methods.update_operators([
//             {
//                 add_operator: {
//                     owner: eve.pkh,
//                     operator: vaultAddress,
//                     token_id: 0,
//                 },
//             }])
//             .send()
//             await updateOperatorsOperation.confirmation();

//             // eve deposits mock FA2 tokens into vault
//             const eveDepositTokenOperation = await vaultInstance.methods.deposit(
//                 mockFa2DepositAmount,          
//                 "mockFa2"
//             ).send();
//             await eveDepositTokenOperation.confirmation();

//             console.log('   - vault collateral deposited');

//             // ----------------------------------------------------------------------------------------------
//             // Borrow with Vault
//             // ----------------------------------------------------------------------------------------------

//             // borrow amount - 20 Mock FA12 Tokens
//             const borrowAmount = 20000000;   

//             // borrow operation
//             const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
//             await eveBorrowOperation.confirmation();

//             console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName);

//             // get initial Mock FA12 Token balance for Eve, Treasury and Token Pool Reward Contract
//             const eveMockFa2Ledger                 = await mockFa2TokenStorage.ledger.get(eve.pkh);            
//             const eveInitialMockFa2TokenBalance    = eveMockFa2Ledger == undefined ? 0 : eveMockFa2Ledger.toNumber();

//             const treasuryMockFa2Ledger                = await mockFa2TokenStorage.ledger.get(treasuryAddress.address);            
//             const treasuryInitialMockFa2TokenBalance   = treasuryMockFa2Ledger == undefined ? 0 : treasuryMockFa2Ledger.toNumber();

//             // get token pool stats
//             const afterBorrowloanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
//             const loanTokenDecimals    = afterBorrowloanTokenRecordView.tokenDecimals;
//             const interestRateDecimals = (27 - 2); 

//             const tokenPoolTotal           = afterBorrowloanTokenRecordView.tokenPoolTotal.toNumber() / (10 ** loanTokenDecimals);
//             const totalBorrowed            = afterBorrowloanTokenRecordView.totalBorrowed.toNumber() / (10 ** loanTokenDecimals);
//             const optimalUtilisationRate   = Number(afterBorrowloanTokenRecordView.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
//             const utilisationRate          = Number(afterBorrowloanTokenRecordView.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
//             const currentInterestRate      = Number(afterBorrowloanTokenRecordView.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";

//             console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);

//             // ----------------------------------------------------------------------------------------------
//             // Set Block Levels For Mock Time Test - 1 month
//             // ----------------------------------------------------------------------------------------------

//             await signerFactory(bob.sk); // temporarily set to tester to increase block levels

//             const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
//             const updatedVault                      = await updatedLendingControllerStorage.vaults.get(vaultHandle);
//             const lastUpdatedBlockLevel             = updatedVault.lastUpdatedBlockLevel;

//             const newBlockLevel = lastUpdatedBlockLevel.toNumber() + oneMonthLevelBlocks;

//             const setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(newBlockLevel, 'configMockLevel').send();
//             await setMockLevelOperation.confirmation();

//             const mockTimeLendingControllerStorage = await lendingControllerInstance.storage();
//             const updatedMockLevel = mockTimeLendingControllerStorage.config.mockLevel;

//             assert.equal(updatedMockLevel, newBlockLevel);

//             console.log('   - time set to 1 month ahead: ' + lastUpdatedBlockLevel + ' to ' + newBlockLevel);

//             // ----------------------------------------------------------------------------------------------
//             // Repay partial debt 
//             // ----------------------------------------------------------------------------------------------

//             // set back to user
//             await signerFactory(eve.sk);  

//             // treasury share of interest repaid
//             const configInterestTreasuryShare = await lendingControllerStorage.config.interestTreasuryShare;

//             // repayment amount
//             const repayAmount = 10000; // 0.01 Mock FA12 Tokens

//             // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
//             // reset token allowance
//             const resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
//                 lendingControllerMockTimeAddress.address,
//                 0
//             ).send();
//             await resetTokenAllowance.confirmation();

//             // set new token allowance
//             const setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
//                 lendingControllerMockTimeAddress.address,
//                 repayAmount
//             ).send();
//             await setNewTokenAllowance.confirmation();

//             // get vault and loan token views, and storage
//             const vaultRecordView        = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
//             const loanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
//             const beforeRepaymentStorage = await lendingControllerInstance.storage();

//             const initialVaultLoanOutstandingTotal         = vaultRecordView.loanOutstandingTotal;
//             const beforeRepaymentVaultBorrowIndex          = vaultRecordView.borrowIndex;
//             const beforeRepaymentVaultOutstandingTotal     = vaultRecordView.loanOutstandingTotal;
//             const beforeRepaymentVaultPrincipalTotal       = vaultRecordView.loanPrincipalTotal;
//             const beforeRepaymentTokenBorrowIndex          = loanTokenRecordView.borrowIndex;

//             initialTokenRewardIndex = loanTokenRecordView.accumulatedRewardsPerShare;
//             initialTokenPoolTotal   = loanTokenRecordView.tokenPoolTotal;

//             // const repayOpParam        = await lendingControllerInstance.methods.repay(vaultId, repayAmount).toTransferParams();
//             // const estimate            = await utils.tezos.estimate.transfer(repayOpParam);
//             // console.log("REPAY OP ESTIMATION: ", estimate);

//             // repay operation
//             const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send();
//             await eveRepayOperation.confirmation();

//             console.log('   - repaid: ' + repayAmount + " | type: " + loanTokenName);

//             // get updated storage
//             const updatedLendingControllerStorageAfterRepay     = await lendingControllerInstance.storage();
//             const updatedVaultRecord                            = await updatedLendingControllerStorageAfterRepay.vaults.get(vaultHandle);
//             const updatedMockFa2TokenStorage                    = await mockFa2TokenInstance.storage();
            
//             // get updated Mock FA2 Token balance for Eve, Treasury and Token Pool Reward Contract
//             const updatedEveMockFa2Ledger                       = await updatedMockFa2TokenStorage.ledger.get(eve.pkh);            
//             const updatedEveMockFa2TokenBalance                 = updatedEveMockFa2Ledger == undefined ? 0 : updatedEveMockFa2Ledger.toNumber();

//             const updatedTreasuryMockFa2Ledger                  = await updatedMockFa2TokenStorage.ledger.get(treasuryAddress.address);            
//             const updatedTreasuryMockFa2TokenBalance            = updatedTreasuryMockFa2Ledger == undefined ? 0 : updatedTreasuryMockFa2Ledger.toNumber();

//             // On-chain views to vault and loan token
//             updatedVaultRecordView     = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
//             updatedLoanTokenRecordView = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});

//             const updatedLoanOutstandingTotal             = updatedVaultRecordView.loanOutstandingTotal;
//             const updatedLoanPrincipalTotal               = updatedVaultRecordView.loanPrincipalTotal;
//             const updatedLoanInterestTotal                = updatedVaultRecordView.loanInterestTotal;

//             const afterRepaymentVaultBorrowIndex          = updatedVaultRecordView.borrowIndex;
//             const afterRepaymentTokenBorrowIndex          = updatedLoanTokenRecordView.borrowIndex;
            
//             const loanOutstandingWithAccruedInterest      = lendingHelper.calculateAccruedInterest(beforeRepaymentVaultOutstandingTotal, beforeRepaymentVaultBorrowIndex, afterRepaymentTokenBorrowIndex);
//             const totalInterest                           = loanOutstandingWithAccruedInterest - initialVaultLoanOutstandingTotal.toNumber();
            
//             // check if repayAmount covers whole or partial of total interest 
//             const totalInterestPaid                       = repayAmount < totalInterest ? repayAmount : totalInterest;
//             const remainingInterest                       = totalInterest - repayAmount < 0 ? 0 : totalInterest - repayAmount;
            
//             const finalLoanOutstandingTotal               = loanOutstandingWithAccruedInterest - repayAmount;
//             const finalLoanPrincipalTotal                 = remainingInterest > 0 ? beforeRepaymentVaultPrincipalTotal : loanOutstandingWithAccruedInterest - repayAmount;
//             const finalLoanInterestTotal                  = remainingInterest > 0 ? remainingInterest : 0;

//             const interestTreasuryShare                   = lendingHelper.calculateInterestSentToTreasury(configInterestTreasuryShare, totalInterestPaid);
//             const interestRewards                         = totalInterestPaid - interestTreasuryShare;

//             // calculate new reward index
//             updatedTokenRewardIndex                       = updatedLoanTokenRecordView.accumulatedRewardsPerShare;
//             const calculatedTokenRewardIndex              = lendingHelper.calculateNewRewardIndex(interestRewards, initialTokenPoolTotal, initialTokenRewardIndex);
//             assert.equal(almostEqual(updatedTokenRewardIndex.toNumber(), calculatedTokenRewardIndex, 0.00001), true);

//             console.log('   - final vault stats >> outstanding total: ' + finalLoanOutstandingTotal + " | principal total: " + finalLoanPrincipalTotal  + " | interest total: " + finalLoanInterestTotal);
//             console.log('   - interest stats >> total interest: ' + totalInterest + ' | interest paid: ' + totalInterestPaid +' | interest to treasury: ' + interestTreasuryShare + " | interest to reward pool: " + interestRewards);

//             assert.equal(updatedLoanOutstandingTotal.toNumber(), finalLoanOutstandingTotal);
//             assert.equal(updatedLoanPrincipalTotal.toNumber(), finalLoanPrincipalTotal);
//             assert.equal(updatedLoanInterestTotal.toNumber(), finalLoanInterestTotal);
//             assert.equal(afterRepaymentVaultBorrowIndex.toNumber(), afterRepaymentTokenBorrowIndex.toNumber());
//             assert.equal(updatedEveMockFa2TokenBalance, eveInitialMockFa2TokenBalance - repayAmount);

//             // check treasury fees and interest to token pool reward contract
//             assert.equal(updatedTreasuryMockFa2TokenBalance, treasuryInitialMockFa2TokenBalance + interestTreasuryShare)

//         })

//     })



//     describe('%repay TEZ - mock time tests (1 month)', function () {

//         it('user (eve) can repay debt - TEZ  - mock one month - utilisation rate below optimal utilisation rate - repayment greater than interest', async () => {

//             // Conditions: 
//             // - vault loan token: tez
//             // - mock time: 1 month
//             // - token pool interest rate: below optimal utilisation rate
//             // - repay amount: greater than interest amount 

//             // Summary of steps:
//             // 1. Create Vault
//             // 2. Deposit collateral into vault (100 Mock FA12 Tokens, 100 Mock FA2 Tokens)
//             // 3. Borrow from vault (20 Tez)
//             // 4. Set block levels time to 1 year in future
//             // 5. Repay partial debt

//             // init variables
//             await signerFactory(eve.sk);
//             const lendingControllerStorage = await lendingControllerInstance.storage();
//             const vaultFactoryStorage      = await vaultFactoryInstance.storage();

//             // ----------------------------------------------------------------------------------------------
//             // Create Vault
//             // ----------------------------------------------------------------------------------------------

//             const vaultCounter  = vaultFactoryStorage.vaultCounter;
//             const vaultId       = vaultCounter.toNumber();
//             const vaultOwner    = eve.pkh;
//             const loanTokenName = "tez";

//             const depositorsConfig      = "any";

//             // user (eve) creates a new vault with no tez
//             const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
//                 eve.pkh,                // delegate to
//                 loanTokenName,          // loan token type
//                 depositorsConfig        // depositors config type - any / whitelist
//             ).send();
//             await userCreatesNewVaultOperation.confirmation();

//             const vaultHandle = {
//                 "id"    : vaultId,
//                 "owner" : vaultOwner
//             };
//             const newVaultRecord = await lendingControllerStorage.vaults.get(vaultHandle);
//             const vaultAddress   = newVaultRecord.address;
//             const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

//             console.log('   - vault originated: ' + vaultAddress);
//             console.log('   - vault id: ' + vaultId);

//             // push new vault id to vault set
//             eveVaultSet.push(vaultId);

//             // ----------------------------------------------------------------------------------------------
//             // Deposit Collateral into Vault
//             // ----------------------------------------------------------------------------------------------

//             const mockFa12DepositAmount      = 150000000;   // 150 Mock FA12 Tokens
//             const mockFa2DepositAmount       = 150000000;   // 150 Mock FA12 Tokens

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

//             // ---------------------------------
//             // Deposit Mock FA2 Tokens
//             // ---------------------------------

//             // update operators for vault
//             const updateOperatorsOperation = await mockFa2TokenInstance.methods.update_operators([
//             {
//                 add_operator: {
//                     owner: eve.pkh,
//                     operator: vaultAddress,
//                     token_id: 0,
//                 },
//             }])
//             .send()
//             await updateOperatorsOperation.confirmation();

//             // eve deposits mock FA2 tokens into vault
//             const eveDepositTokenOperation = await vaultInstance.methods.deposit(
//                 mockFa2DepositAmount,         
//                 "mockFa2"
//             ).send();
//             await eveDepositTokenOperation.confirmation();

//             console.log('   - vault collateral deposited');

//             // ----------------------------------------------------------------------------------------------
//             // Borrow with Vault
//             // ----------------------------------------------------------------------------------------------

//             // borrow amount - 20 Tez
//             const borrowAmount = 20000000;   

//             // borrow operation
//             const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
//             await eveBorrowOperation.confirmation();

//             console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName);

//             // get initial XTZ balance for Eve, Treasury and Token Pool Reward Contract
//             const eveXtzLedger   = await utils.tezos.tz.getBalance(eve.pkh);
//             const eveInitialXtzBalance  = eveXtzLedger.toNumber();

//             const treasuryXtzLedger   = await utils.tezos.tz.getBalance(treasuryAddress.address);
//             const treasuryInitialXtzBalance  = treasuryXtzLedger.toNumber();

//             // get token pool stats
//             const afterBorrowloanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
//             const loanTokenDecimals    = afterBorrowloanTokenRecordView.tokenDecimals;
//             const interestRateDecimals = (27 - 2); 

//             const tokenPoolTotal           = afterBorrowloanTokenRecordView.tokenPoolTotal.toNumber() / (10 ** loanTokenDecimals);
//             const totalBorrowed            = afterBorrowloanTokenRecordView.totalBorrowed.toNumber() / (10 ** loanTokenDecimals);
//             const optimalUtilisationRate   = Number(afterBorrowloanTokenRecordView.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
//             const utilisationRate          = Number(afterBorrowloanTokenRecordView.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
//             const currentInterestRate      = Number(afterBorrowloanTokenRecordView.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";

//             console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);

//             // ----------------------------------------------------------------------------------------------
//             // Set Block Levels For Mock Time Test - 1 month
//             // ----------------------------------------------------------------------------------------------

//             await signerFactory(bob.sk); // temporarily set to tester to increase block levels

//             const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
//             const updatedVault                      = await updatedLendingControllerStorage.vaults.get(vaultHandle);
//             const lastUpdatedBlockLevel             = updatedVault.lastUpdatedBlockLevel;

//             const newBlockLevel = lastUpdatedBlockLevel.toNumber() + oneMonthLevelBlocks;

//             const setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(newBlockLevel, 'configMockLevel').send();
//             await setMockLevelOperation.confirmation();

//             const mockTimeLendingControllerStorage = await lendingControllerInstance.storage();
//             const updatedMockLevel = mockTimeLendingControllerStorage.config.mockLevel;

//             assert.equal(updatedMockLevel, newBlockLevel);

//             console.log('   - time set to 1 month ahead: ' + lastUpdatedBlockLevel + ' to ' + newBlockLevel);

//             // ----------------------------------------------------------------------------------------------
//             // Repay partial debt 
//             // ----------------------------------------------------------------------------------------------

//             // set back to user
//             await signerFactory(eve.sk);  

//             // treasury share of interest repaid
//             const configInterestTreasuryShare = await lendingControllerStorage.config.interestTreasuryShare;

//             // repayment amount
//             const repayAmount = 500000; // 0.5 Tez

//             // get vault and loan token views, and storage
//             const vaultRecordView        = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
//             const loanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
//             const beforeRepaymentStorage = await lendingControllerInstance.storage();

//             const initialVaultLoanOutstandingTotal         = vaultRecordView.loanOutstandingTotal;
//             const beforeRepaymentVaultBorrowIndex          = vaultRecordView.borrowIndex;
//             const beforeRepaymentVaultOutstandingTotal     = vaultRecordView.loanOutstandingTotal;
//             const beforeRepaymentVaultPrincipalTotal       = vaultRecordView.loanPrincipalTotal;
//             const beforeRepaymentTokenBorrowIndex          = loanTokenRecordView.borrowIndex;

//             initialTokenRewardIndex = loanTokenRecordView.accumulatedRewardsPerShare;
//             initialTokenPoolTotal   = loanTokenRecordView.tokenPoolTotal;

//             // const repayOpParam        = await lendingControllerInstance.methods.repay(vaultId, repayAmount).toTransferParams();
//             // const estimate            = await utils.tezos.estimate.transfer(repayOpParam);
//             // console.log("REPAY OP ESTIMATION: ", estimate);

//             // repay operation
//             const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send({ mutez : true, amount : repayAmount});
//             await eveRepayOperation.confirmation();

//             console.log('   - repaid: ' + repayAmount + " | type: " + loanTokenName);

//             // get updated storage
//             const updatedLendingControllerStorageAfterRepay     = await lendingControllerInstance.storage();
//             const updatedVaultRecord                            = await updatedLendingControllerStorageAfterRepay.vaults.get(vaultHandle);
//             const updatedMockFa2TokenStorage                    = await mockFa2TokenInstance.storage();
            
//             // get updated XTZ balance for Eve, Treasury and Token Pool Reward Contract
//             const updatedEveXtzLedger                           = await utils.tezos.tz.getBalance(eve.pkh);
//             const updatedEveXtzBalance                          = updatedEveXtzLedger.toNumber();

//             const updatedTreasuryXtzLedger                      = await utils.tezos.tz.getBalance(treasuryAddress.address);
//             const updatedTreasuryXtzBalance                     = updatedTreasuryXtzLedger.toNumber();

//             // On-chain views to vault and loan token
//             updatedVaultRecordView     = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
//             updatedLoanTokenRecordView = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});

//             const updatedLoanOutstandingTotal             = updatedVaultRecordView.loanOutstandingTotal;
//             const updatedLoanPrincipalTotal               = updatedVaultRecordView.loanPrincipalTotal;
//             const updatedLoanInterestTotal                = updatedVaultRecordView.loanInterestTotal;

//             const afterRepaymentVaultBorrowIndex          = updatedVaultRecordView.borrowIndex;
//             const afterRepaymentTokenBorrowIndex          = updatedLoanTokenRecordView.borrowIndex;
            
//             const loanOutstandingWithAccruedInterest      = lendingHelper.calculateAccruedInterest(beforeRepaymentVaultOutstandingTotal, beforeRepaymentVaultBorrowIndex, afterRepaymentTokenBorrowIndex);
//             const totalInterest                           = loanOutstandingWithAccruedInterest - initialVaultLoanOutstandingTotal.toNumber();
            
//             // check if repayAmount covers whole or partial of total interest 
//             const totalInterestPaid                       = repayAmount < totalInterest ? repayAmount : totalInterest;
//             const remainingInterest                       = totalInterest - repayAmount < 0 ? 0 : totalInterest - repayAmount;
            
//             const finalLoanOutstandingTotal               = loanOutstandingWithAccruedInterest - repayAmount;
//             const finalLoanPrincipalTotal                 = remainingInterest > 0 ? beforeRepaymentVaultPrincipalTotal : loanOutstandingWithAccruedInterest - repayAmount;
//             const finalLoanInterestTotal                  = remainingInterest > 0 ? remainingInterest : 0;

//             const interestTreasuryShare                   = lendingHelper.calculateInterestSentToTreasury(configInterestTreasuryShare, totalInterestPaid);
//             const interestRewards                         = totalInterestPaid - interestTreasuryShare;

//             // calculate new reward index
//             updatedTokenRewardIndex                       = updatedLoanTokenRecordView.accumulatedRewardsPerShare;
//             const calculatedTokenRewardIndex              = lendingHelper.calculateNewRewardIndex(interestRewards, initialTokenPoolTotal, initialTokenRewardIndex);
//             assert.equal(almostEqual(updatedTokenRewardIndex.toNumber(), calculatedTokenRewardIndex, 0.00001), true);

//             console.log('   - final vault stats >> outstanding total: ' + finalLoanOutstandingTotal + " | principal total: " + finalLoanPrincipalTotal  + " | interest total: " + finalLoanInterestTotal);
//             console.log('   - interest stats >> total interest: ' + totalInterest + ' | interest paid: ' + totalInterestPaid +' | interest to treasury: ' + interestTreasuryShare + " | interest to reward pool: " + interestRewards);

//             assert.equal(updatedLoanOutstandingTotal.toNumber(), finalLoanOutstandingTotal);
//             assert.equal(updatedLoanPrincipalTotal.toNumber(), finalLoanPrincipalTotal);
//             assert.equal(updatedLoanInterestTotal.toNumber(), finalLoanInterestTotal);
//             assert.equal(afterRepaymentVaultBorrowIndex.toNumber(), afterRepaymentTokenBorrowIndex.toNumber());
            
//             // account for minor gas cost difference
//             assert.equal(almostEqual(updatedEveXtzBalance, eveInitialXtzBalance - repayAmount, 0.0001), true);

//             // check treasury fees and interest to token pool reward contract
//             assert.equal(updatedTreasuryXtzBalance, treasuryInitialXtzBalance + interestTreasuryShare)

//         })


//         it('user (eve) can repay debt - TEZ  - mock one month - utilisation rate below optimal utilisation rate - repayment less than interest', async () => {

//             // Conditions: 
//             // - vault loan token: tez
//             // - mock time: 1 month
//             // - token pool interest rate: below optimal utilisation rate
//             // - repay amount: less than interest amount 

//             // Summary of steps:
//             // 1. Create Vault
//             // 2. Deposit collateral into vault (100 Mock FA12 Tokens, 100 Mock FA2 Tokens)
//             // 3. Borrow from vault (20 Tez)
//             // 4. Set block levels time to 1 year in future
//             // 5. Repay partial debt

//             // init variables
//             await signerFactory(eve.sk);
//             const lendingControllerStorage = await lendingControllerInstance.storage();
//             const vaultFactoryStorage      = await vaultFactoryInstance.storage();

//             // ----------------------------------------------------------------------------------------------
//             // Create Vault
//             // ----------------------------------------------------------------------------------------------

//             const vaultCounter  = vaultFactoryStorage.vaultCounter;
//             const vaultId       = vaultCounter.toNumber();
//             const vaultOwner    = eve.pkh;
//             const loanTokenName = "tez";

//             const depositorsConfig      = "any";

//             // user (eve) creates a new vault with no tez
//             const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
//                 eve.pkh,                // delegate to
//                 loanTokenName,          // loan token type
//                 depositorsConfig        // depositors config type - any / whitelist
//             ).send();
//             await userCreatesNewVaultOperation.confirmation();

//             const vaultHandle = {
//                 "id"    : vaultId,
//                 "owner" : vaultOwner
//             };
//             const newVaultRecord = await lendingControllerStorage.vaults.get(vaultHandle);
//             const vaultAddress   = newVaultRecord.address;
//             const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

//             console.log('   - vault originated: ' + vaultAddress);
//             console.log('   - vault id: ' + vaultId);

//             // push new vault id to vault set
//             eveVaultSet.push(vaultId);

//             // ----------------------------------------------------------------------------------------------
//             // Deposit Collateral into Vault
//             // ----------------------------------------------------------------------------------------------

//             const mockFa12DepositAmount      = 150000000;   // 150 Mock FA12 Tokens
//             const mockFa2DepositAmount       = 150000000;   // 150 Mock FA12 Tokens

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

//             // ---------------------------------
//             // Deposit Mock FA2 Tokens
//             // ---------------------------------

//             // update operators for vault
//             const updateOperatorsOperation = await mockFa2TokenInstance.methods.update_operators([
//             {
//                 add_operator: {
//                     owner: eve.pkh,
//                     operator: vaultAddress,
//                     token_id: 0,
//                 },
//             }])
//             .send()
//             await updateOperatorsOperation.confirmation();

//             // eve deposits mock FA2 tokens into vault
//             const eveDepositTokenOperation = await vaultInstance.methods.deposit(
//                 mockFa2DepositAmount,                 
//                 "mockFa2"
//             ).send();
//             await eveDepositTokenOperation.confirmation();

//             console.log('   - vault collateral deposited');

//             // ----------------------------------------------------------------------------------------------
//             // Borrow with Vault
//             // ----------------------------------------------------------------------------------------------

//             // borrow amount - 20 Tez
//             const borrowAmount = 20000000;   

//             // borrow operation
//             const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
//             await eveBorrowOperation.confirmation();

//             console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName);

//             // get initial XTZ balance for Eve, Treasury and Token Pool Reward Contract
//             const eveXtzLedger   = await utils.tezos.tz.getBalance(eve.pkh);
//             const eveInitialXtzBalance  = eveXtzLedger.toNumber();

//             const treasuryXtzLedger   = await utils.tezos.tz.getBalance(treasuryAddress.address);
//             const treasuryInitialXtzBalance  = treasuryXtzLedger.toNumber();

//             // get token pool stats
//             const afterBorrowloanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
//             const loanTokenDecimals    = afterBorrowloanTokenRecordView.tokenDecimals;
//             const interestRateDecimals = (27 - 2); 

//             const tokenPoolTotal           = afterBorrowloanTokenRecordView.tokenPoolTotal.toNumber() / (10 ** loanTokenDecimals);
//             const totalBorrowed            = afterBorrowloanTokenRecordView.totalBorrowed.toNumber() / (10 ** loanTokenDecimals);
//             const optimalUtilisationRate   = Number(afterBorrowloanTokenRecordView.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
//             const utilisationRate          = Number(afterBorrowloanTokenRecordView.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
//             const currentInterestRate      = Number(afterBorrowloanTokenRecordView.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";

//             console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);

//             // ----------------------------------------------------------------------------------------------
//             // Set Block Levels For Mock Time Test - 1 month
//             // ----------------------------------------------------------------------------------------------

//             await signerFactory(bob.sk); // temporarily set to tester to increase block levels

//             const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
//             const updatedVault                      = await updatedLendingControllerStorage.vaults.get(vaultHandle);
//             const lastUpdatedBlockLevel             = updatedVault.lastUpdatedBlockLevel;

//             const newBlockLevel = lastUpdatedBlockLevel.toNumber() + oneMonthLevelBlocks;

//             const setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(newBlockLevel, 'configMockLevel').send();
//             await setMockLevelOperation.confirmation();

//             const mockTimeLendingControllerStorage = await lendingControllerInstance.storage();
//             const updatedMockLevel = mockTimeLendingControllerStorage.config.mockLevel;

//             assert.equal(updatedMockLevel, newBlockLevel);

//             console.log('   - time set to 1 month ahead: ' + lastUpdatedBlockLevel + ' to ' + newBlockLevel);

//             // ----------------------------------------------------------------------------------------------
//             // Repay partial debt 
//             // ----------------------------------------------------------------------------------------------

//             // set back to user
//             await signerFactory(eve.sk);  

//             // treasury share of interest repaid
//             const configInterestTreasuryShare = await lendingControllerStorage.config.interestTreasuryShare;

//             // repayment amount
//             const repayAmount = 10000; // 0.01 Tez

//             // get vault and loan token views, and storage
//             const vaultRecordView        = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
//             const loanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
//             const beforeRepaymentStorage = await lendingControllerInstance.storage();

//             const initialVaultLoanOutstandingTotal         = vaultRecordView.loanOutstandingTotal;
//             const beforeRepaymentVaultBorrowIndex          = vaultRecordView.borrowIndex;
//             const beforeRepaymentVaultOutstandingTotal     = vaultRecordView.loanOutstandingTotal;
//             const beforeRepaymentVaultPrincipalTotal       = vaultRecordView.loanPrincipalTotal;
//             const beforeRepaymentTokenBorrowIndex          = loanTokenRecordView.borrowIndex;

//             initialTokenRewardIndex = loanTokenRecordView.accumulatedRewardsPerShare;
//             initialTokenPoolTotal   = loanTokenRecordView.tokenPoolTotal;

//             // const repayOpParam        = await lendingControllerInstance.methods.repay(vaultId, repayAmount).toTransferParams();
//             // const estimate            = await utils.tezos.estimate.transfer(repayOpParam);
//             // console.log("REPAY OP ESTIMATION: ", estimate);

//             // repay operation
//             const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send({ mutez : true, amount : repayAmount});
//             await eveRepayOperation.confirmation();

//             console.log('   - repaid: ' + repayAmount + " | type: " + loanTokenName);

//             // get updated storage
//             const updatedLendingControllerStorageAfterRepay     = await lendingControllerInstance.storage();
//             const updatedVaultRecord                            = await updatedLendingControllerStorageAfterRepay.vaults.get(vaultHandle);
//             const updatedMockFa2TokenStorage                    = await mockFa2TokenInstance.storage();
            
//             // get updated XTZ balance for Eve, Treasury and Token Pool Reward Contract
//             const updatedEveXtzLedger                           = await utils.tezos.tz.getBalance(eve.pkh);
//             const updatedEveXtzBalance                          = updatedEveXtzLedger.toNumber();

//             const updatedTreasuryXtzLedger                      = await utils.tezos.tz.getBalance(treasuryAddress.address);
//             const updatedTreasuryXtzBalance                     = updatedTreasuryXtzLedger.toNumber();

//             // On-chain views to vault and loan token
//             updatedVaultRecordView     = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
//             updatedLoanTokenRecordView = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});

//             const updatedLoanOutstandingTotal             = updatedVaultRecordView.loanOutstandingTotal;
//             const updatedLoanPrincipalTotal               = updatedVaultRecordView.loanPrincipalTotal;
//             const updatedLoanInterestTotal                = updatedVaultRecordView.loanInterestTotal;

//             const afterRepaymentVaultBorrowIndex          = updatedVaultRecordView.borrowIndex;
//             const afterRepaymentTokenBorrowIndex          = updatedLoanTokenRecordView.borrowIndex;
            
//             const loanOutstandingWithAccruedInterest      = lendingHelper.calculateAccruedInterest(beforeRepaymentVaultOutstandingTotal, beforeRepaymentVaultBorrowIndex, afterRepaymentTokenBorrowIndex);
//             const totalInterest                           = loanOutstandingWithAccruedInterest - initialVaultLoanOutstandingTotal.toNumber();
            
//             // check if repayAmount covers whole or partial of total interest 
//             const totalInterestPaid                       = repayAmount < totalInterest ? repayAmount : totalInterest;
//             const remainingInterest                       = totalInterest - repayAmount < 0 ? 0 : totalInterest - repayAmount;
            
//             const finalLoanOutstandingTotal               = loanOutstandingWithAccruedInterest - repayAmount;
//             const finalLoanPrincipalTotal                 = remainingInterest > 0 ? beforeRepaymentVaultPrincipalTotal : loanOutstandingWithAccruedInterest - repayAmount;
//             const finalLoanInterestTotal                  = remainingInterest > 0 ? remainingInterest : 0;

//             const interestTreasuryShare                   = lendingHelper.calculateInterestSentToTreasury(configInterestTreasuryShare, totalInterestPaid);
//             const interestRewards                         = totalInterestPaid - interestTreasuryShare;

//             // calculate new reward index
//             updatedTokenRewardIndex                       = updatedLoanTokenRecordView.accumulatedRewardsPerShare;
//             const calculatedTokenRewardIndex              = lendingHelper.calculateNewRewardIndex(interestRewards, initialTokenPoolTotal, initialTokenRewardIndex);
//             assert.equal(almostEqual(updatedTokenRewardIndex.toNumber(), calculatedTokenRewardIndex, 0.00001), true);

//             console.log('   - final vault stats >> outstanding total: ' + finalLoanOutstandingTotal + " | principal total: " + finalLoanPrincipalTotal  + " | interest total: " + finalLoanInterestTotal);
//             console.log('   - interest stats >> total interest: ' + totalInterest + ' | interest paid: ' + totalInterestPaid +' | interest to treasury: ' + interestTreasuryShare + " | interest to reward pool: " + interestRewards);

//             assert.equal(updatedLoanOutstandingTotal.toNumber(), finalLoanOutstandingTotal);
//             assert.equal(updatedLoanPrincipalTotal.toNumber(), finalLoanPrincipalTotal);
//             assert.equal(updatedLoanInterestTotal.toNumber(), finalLoanInterestTotal);
//             assert.equal(afterRepaymentVaultBorrowIndex.toNumber(), afterRepaymentTokenBorrowIndex.toNumber());
            
//             // account for minor gas cost difference
//             assert.equal(almostEqual(updatedEveXtzBalance, eveInitialXtzBalance - repayAmount, 0.0001), true);

//             // check treasury fees and interest to token pool reward contract
//             assert.equal(updatedTreasuryXtzBalance, treasuryInitialXtzBalance + interestTreasuryShare)

//         })



//         it('user (eve) can repay debt - TEZ  - mock one month - utilisation rate above optimal utilisation rate - repayment greater than interest', async () => {

//             // Conditions: 
//             // - vault loan token: tez
//             // - mock time: 1 month
//             // - token pool interest rate: above optimal utilisation rate
//             // - repay amount: greater than interest amount 

//             // Summary of steps:
//             // 1. Create Vault
//             // 2. Deposit collateral into vault (100 Mock FA12 Tokens, 100 Mock FA2 Tokens)
//             // 3. Borrow from vault (20 Tez)
//             // 4. Set block levels time to 1 year in future
//             // 5. Repay partial debt

//             // init variables
//             await signerFactory(eve.sk);
//             const lendingControllerStorage = await lendingControllerInstance.storage();
//             const vaultFactoryStorage      = await vaultFactoryInstance.storage();

//             // ----------------------------------------------------------------------------------------------
//             // Create Vault
//             // ----------------------------------------------------------------------------------------------

//             const vaultCounter  = vaultFactoryStorage.vaultCounter;
//             const vaultId       = vaultCounter.toNumber();
//             const vaultOwner    = eve.pkh;
//             const loanTokenName = "tez";

//             const depositorsConfig      = "any";

//             // user (eve) creates a new vault with no tez
//             const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
//                 eve.pkh,                // delegate to
//                 loanTokenName,          // loan token type
//                 depositorsConfig        // depositors config type - any / whitelist
//             ).send();
//             await userCreatesNewVaultOperation.confirmation();

//             const vaultHandle = {
//                 "id"    : vaultId,
//                 "owner" : vaultOwner
//             };
//             const newVaultRecord = await lendingControllerStorage.vaults.get(vaultHandle);
//             const vaultAddress   = newVaultRecord.address;
//             const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

//             console.log('   - vault originated: ' + vaultAddress);
//             console.log('   - vault id: ' + vaultId);

//             // push new vault id to vault set
//             eveVaultSet.push(vaultId);

//             // ----------------------------------------------------------------------------------------------
//             // Deposit Collateral into Vault
//             // ----------------------------------------------------------------------------------------------

//             const mockFa12DepositAmount      = 150000000;   // 150 Mock FA12 Tokens
//             const mockFa2DepositAmount       = 150000000;   // 150 Mock FA12 Tokens

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

//             // ---------------------------------
//             // Deposit Mock FA2 Tokens
//             // ---------------------------------

//             // update operators for vault
//             const updateOperatorsOperation = await mockFa2TokenInstance.methods.update_operators([
//             {
//                 add_operator: {
//                     owner: eve.pkh,
//                     operator: vaultAddress,
//                     token_id: 0,
//                 },
//             }])
//             .send()
//             await updateOperatorsOperation.confirmation();

//             // eve deposits mock FA2 tokens into vault
//             const eveDepositTokenOperation = await vaultInstance.methods.deposit(
//                 mockFa2DepositAmount,             
//                 "mockFa2"
//             ).send();
//             await eveDepositTokenOperation.confirmation();

//             console.log('   - vault collateral deposited');

//             // ----------------------------------------------------------------------------------------------
//             // Borrow with Vault
//             // ----------------------------------------------------------------------------------------------

//             // borrow amount - 20 Tez
//             const borrowAmount = 20000000;   

//             // borrow operation
//             const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
//             await eveBorrowOperation.confirmation();

//             console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName);

//             // get initial XTZ balance for Eve, Treasury and Token Pool Reward Contract
//             const eveXtzLedger   = await utils.tezos.tz.getBalance(eve.pkh);
//             const eveInitialXtzBalance  = eveXtzLedger.toNumber();

//             const treasuryXtzLedger   = await utils.tezos.tz.getBalance(treasuryAddress.address);
//             const treasuryInitialXtzBalance  = treasuryXtzLedger.toNumber();

//             // get token pool stats
//             const afterBorrowloanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
//             const loanTokenDecimals    = afterBorrowloanTokenRecordView.tokenDecimals;
//             const interestRateDecimals = (27 - 2); 

//             const tokenPoolTotal           = afterBorrowloanTokenRecordView.tokenPoolTotal.toNumber() / (10 ** loanTokenDecimals);
//             const totalBorrowed            = afterBorrowloanTokenRecordView.totalBorrowed.toNumber() / (10 ** loanTokenDecimals);
//             const optimalUtilisationRate   = Number(afterBorrowloanTokenRecordView.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
//             const utilisationRate          = Number(afterBorrowloanTokenRecordView.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
//             const currentInterestRate      = Number(afterBorrowloanTokenRecordView.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";

//             console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);

//             // ----------------------------------------------------------------------------------------------
//             // Set Block Levels For Mock Time Test - 1 month
//             // ----------------------------------------------------------------------------------------------

//             await signerFactory(bob.sk); // temporarily set to tester to increase block levels

//             const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
//             const updatedVault                      = await updatedLendingControllerStorage.vaults.get(vaultHandle);
//             const lastUpdatedBlockLevel             = updatedVault.lastUpdatedBlockLevel;

//             const newBlockLevel = lastUpdatedBlockLevel.toNumber() + oneMonthLevelBlocks;

//             const setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(newBlockLevel, 'configMockLevel').send();
//             await setMockLevelOperation.confirmation();

//             const mockTimeLendingControllerStorage = await lendingControllerInstance.storage();
//             const updatedMockLevel = mockTimeLendingControllerStorage.config.mockLevel;

//             assert.equal(updatedMockLevel, newBlockLevel);

//             console.log('   - time set to 1 month ahead: ' + lastUpdatedBlockLevel + ' to ' + newBlockLevel);

//             // ----------------------------------------------------------------------------------------------
//             // Repay partial debt 
//             // ----------------------------------------------------------------------------------------------

//             // set back to user
//             await signerFactory(eve.sk);  

//             // treasury share of interest repaid
//             const configInterestTreasuryShare = await lendingControllerStorage.config.interestTreasuryShare;

//             // repayment amount
//             const repayAmount = 500000; // 0.5 Tez

//             // get vault and loan token views, and storage
//             const vaultRecordView        = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
//             const loanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
//             const beforeRepaymentStorage = await lendingControllerInstance.storage();

//             const initialVaultLoanOutstandingTotal         = vaultRecordView.loanOutstandingTotal;
//             const beforeRepaymentVaultBorrowIndex          = vaultRecordView.borrowIndex;
//             const beforeRepaymentVaultOutstandingTotal     = vaultRecordView.loanOutstandingTotal;
//             const beforeRepaymentVaultPrincipalTotal       = vaultRecordView.loanPrincipalTotal;
//             const beforeRepaymentTokenBorrowIndex          = loanTokenRecordView.borrowIndex;

//             initialTokenRewardIndex = loanTokenRecordView.accumulatedRewardsPerShare;
//             initialTokenPoolTotal   = loanTokenRecordView.tokenPoolTotal;

//             // const repayOpParam        = await lendingControllerInstance.methods.repay(vaultId, repayAmount).toTransferParams();
//             // const estimate            = await utils.tezos.estimate.transfer(repayOpParam);
//             // console.log("REPAY OP ESTIMATION: ", estimate);

//             // repay operation
//             const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send({ mutez : true, amount : repayAmount});
//             await eveRepayOperation.confirmation();

//             console.log('   - repaid: ' + repayAmount + " | type: " + loanTokenName);

//             // get updated storage
//             const updatedLendingControllerStorageAfterRepay     = await lendingControllerInstance.storage();
//             const updatedVaultRecord                            = await updatedLendingControllerStorageAfterRepay.vaults.get(vaultHandle);
//             const updatedMockFa2TokenStorage                    = await mockFa2TokenInstance.storage();
            
//             // get updated XTZ balance for Eve, Treasury and Token Pool Reward Contract
//             const updatedEveXtzLedger                           = await utils.tezos.tz.getBalance(eve.pkh);
//             const updatedEveXtzBalance                          = updatedEveXtzLedger.toNumber();

//             const updatedTreasuryXtzLedger                      = await utils.tezos.tz.getBalance(treasuryAddress.address);
//             const updatedTreasuryXtzBalance                     = updatedTreasuryXtzLedger.toNumber();

//             // On-chain views to vault and loan token
//             updatedVaultRecordView     = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
//             updatedLoanTokenRecordView = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});

//             const updatedLoanOutstandingTotal             = updatedVaultRecordView.loanOutstandingTotal;
//             const updatedLoanPrincipalTotal               = updatedVaultRecordView.loanPrincipalTotal;
//             const updatedLoanInterestTotal                = updatedVaultRecordView.loanInterestTotal;

//             const afterRepaymentVaultBorrowIndex          = updatedVaultRecordView.borrowIndex;
//             const afterRepaymentTokenBorrowIndex          = updatedLoanTokenRecordView.borrowIndex;
            
//             const loanOutstandingWithAccruedInterest      = lendingHelper.calculateAccruedInterest(beforeRepaymentVaultOutstandingTotal, beforeRepaymentVaultBorrowIndex, afterRepaymentTokenBorrowIndex);
//             const totalInterest                           = loanOutstandingWithAccruedInterest - initialVaultLoanOutstandingTotal.toNumber();
            
//             // check if repayAmount covers whole or partial of total interest 
//             const totalInterestPaid                       = repayAmount < totalInterest ? repayAmount : totalInterest;
//             const remainingInterest                       = totalInterest - repayAmount < 0 ? 0 : totalInterest - repayAmount;
            
//             const finalLoanOutstandingTotal               = loanOutstandingWithAccruedInterest - repayAmount;
//             const finalLoanPrincipalTotal                 = remainingInterest > 0 ? beforeRepaymentVaultPrincipalTotal : loanOutstandingWithAccruedInterest - repayAmount;
//             const finalLoanInterestTotal                  = remainingInterest > 0 ? remainingInterest : 0;

//             const interestTreasuryShare                   = lendingHelper.calculateInterestSentToTreasury(configInterestTreasuryShare, totalInterestPaid);
//             const interestRewards                         = totalInterestPaid - interestTreasuryShare;

//             // calculate new reward index
//             updatedTokenRewardIndex                       = updatedLoanTokenRecordView.accumulatedRewardsPerShare;
//             const calculatedTokenRewardIndex              = lendingHelper.calculateNewRewardIndex(interestRewards, initialTokenPoolTotal, initialTokenRewardIndex);
//             assert.equal(almostEqual(updatedTokenRewardIndex.toNumber(), calculatedTokenRewardIndex, 0.00001), true);

//             console.log('   - final vault stats >> outstanding total: ' + finalLoanOutstandingTotal + " | principal total: " + finalLoanPrincipalTotal  + " | interest total: " + finalLoanInterestTotal);
//             console.log('   - interest stats >> total interest: ' + totalInterest + ' | interest paid: ' + totalInterestPaid +' | interest to treasury: ' + interestTreasuryShare + " | interest to reward pool: " + interestRewards);

//             assert.equal(updatedLoanOutstandingTotal.toNumber(), finalLoanOutstandingTotal);
//             assert.equal(updatedLoanPrincipalTotal.toNumber(), finalLoanPrincipalTotal);
//             assert.equal(updatedLoanInterestTotal.toNumber(), finalLoanInterestTotal);
//             assert.equal(afterRepaymentVaultBorrowIndex.toNumber(), afterRepaymentTokenBorrowIndex.toNumber());
            
//             // account for minor gas cost difference
//             assert.equal(almostEqual(updatedEveXtzBalance, eveInitialXtzBalance - repayAmount, 0.0001), true);

//             // check treasury fees and interest to token pool reward contract
//             assert.equal(updatedTreasuryXtzBalance, treasuryInitialXtzBalance + interestTreasuryShare)

//         })


//         it('user (eve) can repay debt - TEZ  - mock one month - utilisation rate above optimal utilisation rate - repayment less than interest', async () => {

//             // Conditions: 
//             // - vault loan token: tez
//             // - mock time: 1 month
//             // - token pool interest rate: above optimal utilisation rate
//             // - repay amount: less than interest amount 

//             // Summary of steps:
//             // 1. Create Vault
//             // 2. Deposit collateral into vault (100 Mock FA12 Tokens, 100 Mock FA2 Tokens)
//             // 3. Borrow from vault (20 Tez)
//             // 4. Set block levels time to 1 year in future
//             // 5. Repay partial debt

//             // init variables
//             await signerFactory(eve.sk);
//             const lendingControllerStorage = await lendingControllerInstance.storage();
//             const vaultFactoryStorage      = await vaultFactoryInstance.storage();

//             // ----------------------------------------------------------------------------------------------
//             // Create Vault
//             // ----------------------------------------------------------------------------------------------

//             const vaultCounter  = vaultFactoryStorage.vaultCounter;
//             const vaultId       = vaultCounter.toNumber();
//             const vaultOwner    = eve.pkh;
//             const loanTokenName = "tez";

//             const depositorsConfig      = "any";

//             // user (eve) creates a new vault with no tez
//             const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
//                 eve.pkh,                // delegate to
//                 loanTokenName,          // loan token type
//                 depositorsConfig        // depositors config type - any / whitelist
//             ).send();
//             await userCreatesNewVaultOperation.confirmation();

//             const vaultHandle = {
//                 "id"    : vaultId,
//                 "owner" : vaultOwner
//             };
//             const newVaultRecord = await lendingControllerStorage.vaults.get(vaultHandle);
//             const vaultAddress   = newVaultRecord.address;
//             const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

//             console.log('   - vault originated: ' + vaultAddress);
//             console.log('   - vault id: ' + vaultId);

//             // push new vault id to vault set
//             eveVaultSet.push(vaultId);

//             // ----------------------------------------------------------------------------------------------
//             // Deposit Collateral into Vault
//             // ----------------------------------------------------------------------------------------------

//             const mockFa12DepositAmount      = 150000000;   // 150 Mock FA12 Tokens
//             const mockFa2DepositAmount       = 150000000;   // 150 Mock FA12 Tokens

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

//             // ---------------------------------
//             // Deposit Mock FA2 Tokens
//             // ---------------------------------

//             // update operators for vault
//             const updateOperatorsOperation = await mockFa2TokenInstance.methods.update_operators([
//             {
//                 add_operator: {
//                     owner: eve.pkh,
//                     operator: vaultAddress,
//                     token_id: 0,
//                 },
//             }])
//             .send()
//             await updateOperatorsOperation.confirmation();

//             // eve deposits mock FA2 tokens into vault
//             const eveDepositTokenOperation = await vaultInstance.methods.deposit(
//                 mockFa2DepositAmount,                  
//                 "mockFa2"
//             ).send();
//             await eveDepositTokenOperation.confirmation();

//             console.log('   - vault collateral deposited');

//             // ----------------------------------------------------------------------------------------------
//             // Borrow with Vault
//             // ----------------------------------------------------------------------------------------------

//             // borrow amount - 20 Tez
//             const borrowAmount = 20000000;   

//             // borrow operation
//             const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
//             await eveBorrowOperation.confirmation();

//             console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName);

//             // get initial XTZ balance for Eve, Treasury and Token Pool Reward Contract
//             const eveXtzLedger   = await utils.tezos.tz.getBalance(eve.pkh);
//             const eveInitialXtzBalance  = eveXtzLedger.toNumber();

//             const treasuryXtzLedger   = await utils.tezos.tz.getBalance(treasuryAddress.address);
//             const treasuryInitialXtzBalance  = treasuryXtzLedger.toNumber();

//             // get token pool stats
//             const afterBorrowloanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
//             const loanTokenDecimals    = afterBorrowloanTokenRecordView.tokenDecimals;
//             const interestRateDecimals = (27 - 2); 

//             const tokenPoolTotal           = afterBorrowloanTokenRecordView.tokenPoolTotal.toNumber() / (10 ** loanTokenDecimals);
//             const totalBorrowed            = afterBorrowloanTokenRecordView.totalBorrowed.toNumber() / (10 ** loanTokenDecimals);
//             const optimalUtilisationRate   = Number(afterBorrowloanTokenRecordView.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
//             const utilisationRate          = Number(afterBorrowloanTokenRecordView.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
//             const currentInterestRate      = Number(afterBorrowloanTokenRecordView.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";

//             console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);

//             // ----------------------------------------------------------------------------------------------
//             // Set Block Levels For Mock Time Test - 1 month
//             // ----------------------------------------------------------------------------------------------

//             await signerFactory(bob.sk); // temporarily set to tester to increase block levels

//             const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
//             const updatedVault                      = await updatedLendingControllerStorage.vaults.get(vaultHandle);
//             const lastUpdatedBlockLevel             = updatedVault.lastUpdatedBlockLevel;

//             const newBlockLevel = lastUpdatedBlockLevel.toNumber() + oneMonthLevelBlocks;

//             const setMockLevelOperation = await lendingControllerInstance.methods.updateConfig(newBlockLevel, 'configMockLevel').send();
//             await setMockLevelOperation.confirmation();

//             const mockTimeLendingControllerStorage = await lendingControllerInstance.storage();
//             const updatedMockLevel = mockTimeLendingControllerStorage.config.mockLevel;

//             assert.equal(updatedMockLevel, newBlockLevel);

//             console.log('   - time set to 1 month ahead: ' + lastUpdatedBlockLevel + ' to ' + newBlockLevel);

//             // ----------------------------------------------------------------------------------------------
//             // Repay partial debt 
//             // ----------------------------------------------------------------------------------------------

//             // set back to user
//             await signerFactory(eve.sk);  

//             // treasury share of interest repaid
//             const configInterestTreasuryShare = await lendingControllerStorage.config.interestTreasuryShare;

//             // repayment amount
//             const repayAmount = 10000; // 0.01 Tez

//             // get vault and loan token views, and storage
//             const vaultRecordView        = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
//             const loanTokenRecordView    = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});
//             const beforeRepaymentStorage = await lendingControllerInstance.storage();

//             const initialVaultLoanOutstandingTotal         = vaultRecordView.loanOutstandingTotal;
//             const beforeRepaymentVaultBorrowIndex          = vaultRecordView.borrowIndex;
//             const beforeRepaymentVaultOutstandingTotal     = vaultRecordView.loanOutstandingTotal;
//             const beforeRepaymentVaultPrincipalTotal       = vaultRecordView.loanPrincipalTotal;
//             const beforeRepaymentTokenBorrowIndex          = loanTokenRecordView.borrowIndex;

//             initialTokenRewardIndex = loanTokenRecordView.accumulatedRewardsPerShare;
//             initialTokenPoolTotal   = loanTokenRecordView.tokenPoolTotal;

//             // const repayOpParam        = await lendingControllerInstance.methods.repay(vaultId, repayAmount).toTransferParams();
//             // const estimate            = await utils.tezos.estimate.transfer(repayOpParam);
//             // console.log("REPAY OP ESTIMATION: ", estimate);

//             // repay operation
//             const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send({ mutez : true, amount : repayAmount});
//             await eveRepayOperation.confirmation();

//             console.log('   - repaid: ' + repayAmount + " | type: " + loanTokenName);

//             // get updated storage
//             const updatedLendingControllerStorageAfterRepay     = await lendingControllerInstance.storage();
//             const updatedVaultRecord                            = await updatedLendingControllerStorageAfterRepay.vaults.get(vaultHandle);
//             const updatedMockFa2TokenStorage                    = await mockFa2TokenInstance.storage();
            
//             // get updated XTZ balance for Eve, Treasury and Token Pool Reward Contract
//             const updatedEveXtzLedger                           = await utils.tezos.tz.getBalance(eve.pkh);
//             const updatedEveXtzBalance                          = updatedEveXtzLedger.toNumber();

//             const updatedTreasuryXtzLedger                      = await utils.tezos.tz.getBalance(treasuryAddress.address);
//             const updatedTreasuryXtzBalance                     = updatedTreasuryXtzLedger.toNumber();

//             // On-chain views to vault and loan token
//             updatedVaultRecordView     = await lendingControllerInstance.contractViews.getVaultOpt({ id: vaultId, owner: eve.pkh}).executeView({ viewCaller : bob.pkh});
//             updatedLoanTokenRecordView = await lendingControllerInstance.contractViews.getLoanTokenRecordOpt(loanTokenName).executeView({ viewCaller : bob.pkh});

//             const updatedLoanOutstandingTotal             = updatedVaultRecordView.loanOutstandingTotal;
//             const updatedLoanPrincipalTotal               = updatedVaultRecordView.loanPrincipalTotal;
//             const updatedLoanInterestTotal                = updatedVaultRecordView.loanInterestTotal;

//             const afterRepaymentVaultBorrowIndex          = updatedVaultRecordView.borrowIndex;
//             const afterRepaymentTokenBorrowIndex          = updatedLoanTokenRecordView.borrowIndex;
            
//             const loanOutstandingWithAccruedInterest      = lendingHelper.calculateAccruedInterest(beforeRepaymentVaultOutstandingTotal, beforeRepaymentVaultBorrowIndex, afterRepaymentTokenBorrowIndex);
//             const totalInterest                           = loanOutstandingWithAccruedInterest - initialVaultLoanOutstandingTotal.toNumber();
            
//             // check if repayAmount covers whole or partial of total interest 
//             const totalInterestPaid                       = repayAmount < totalInterest ? repayAmount : totalInterest;
//             const remainingInterest                       = totalInterest - repayAmount < 0 ? 0 : totalInterest - repayAmount;
            
//             const finalLoanOutstandingTotal               = loanOutstandingWithAccruedInterest - repayAmount;
//             const finalLoanPrincipalTotal                 = remainingInterest > 0 ? beforeRepaymentVaultPrincipalTotal : loanOutstandingWithAccruedInterest - repayAmount;
//             const finalLoanInterestTotal                  = remainingInterest > 0 ? remainingInterest : 0;

//             const interestTreasuryShare                   = lendingHelper.calculateInterestSentToTreasury(configInterestTreasuryShare, totalInterestPaid);
//             const interestRewards                         = totalInterestPaid - interestTreasuryShare;

//             // calculate new reward index
//             updatedTokenRewardIndex                       = updatedLoanTokenRecordView.accumulatedRewardsPerShare;
//             const calculatedTokenRewardIndex              = lendingHelper.calculateNewRewardIndex(interestRewards, initialTokenPoolTotal, initialTokenRewardIndex);
//             assert.equal(almostEqual(updatedTokenRewardIndex.toNumber(), calculatedTokenRewardIndex, 0.00001), true);

//             console.log('   - final vault stats >> outstanding total: ' + finalLoanOutstandingTotal + " | principal total: " + finalLoanPrincipalTotal  + " | interest total: " + finalLoanInterestTotal);
//             console.log('   - interest stats >> total interest: ' + totalInterest + ' | interest paid: ' + totalInterestPaid +' | interest to treasury: ' + interestTreasuryShare + " | interest to reward pool: " + interestRewards);

//             assert.equal(updatedLoanOutstandingTotal.toNumber(), finalLoanOutstandingTotal);
//             assert.equal(updatedLoanPrincipalTotal.toNumber(), finalLoanPrincipalTotal);
//             assert.equal(updatedLoanInterestTotal.toNumber(), finalLoanInterestTotal);
//             assert.equal(afterRepaymentVaultBorrowIndex.toNumber(), afterRepaymentTokenBorrowIndex.toNumber());
            
//             // account for minor gas cost difference
//             assert.equal(almostEqual(updatedEveXtzBalance, eveInitialXtzBalance - repayAmount, 0.0001), true);

//             // check treasury fees and interest to token pool reward contract
//             assert.equal(updatedTreasuryXtzBalance, treasuryInitialXtzBalance + interestTreasuryShare)

//         })


//     })


// });