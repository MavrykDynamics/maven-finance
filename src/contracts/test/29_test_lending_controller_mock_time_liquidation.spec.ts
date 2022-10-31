// import { createHash } from "crypto";

// const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
// const { InMemorySigner, importKey } = require("@taquito/signer");
// import { MichelsonMap } from "@taquito/taquito";
// import assert, { ok, rejects, strictEqual } from "assert";
// import { Utils, zeroAddress, TEZ, MVK } from "./helpers/Utils";
// import * as lendingHelper from "./helpers/lendingHelpers"
// import fs from "fs";
// import BigNumber from 'bignumber.js';
// import { packDataBytes, MichelsonData, MichelsonType } from '@taquito/michel-codec';
// import { confirmOperation } from "../scripts/confirmation";


// const chai = require("chai");
// const chaiAsPromised = require('chai-as-promised');
// chai.use(chaiAsPromised);   
// chai.should();


// import env from "../env";
// import { alice, bob, eve, mallory, oscar, trudy, oracleMaintainer } from "../scripts/sandbox/accounts";

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

// // import tokenPoolRewardAddress           from '../deployments/tokenPoolRewardAddress.json';
// import vaultFactoryAddress              from '../deployments/vaultFactoryAddress.json';

// import { vaultStorageType }             from "./types/vaultStorageType"
// import { aggregatorStorageType }        from './types/aggregatorStorageType';


// // Interface for oracle observation type
// interface IOracleObservationType {
//     data: BigNumber;
//     epoch: number;
//     round: number;
//     aggregatorAddress: string;
// }


// describe("Lending Controller (Mock Time - Liquidation) tests", async () => {
    
//     var utils: Utils

//     // ------------------------------------------------
//     //  General
//     // ------------------------------------------------

//     //  vault sets 
//     var eveVaultSet     = []
//     var malloryVaultSet = [] 

//     // 3 seconds blocks (docker sandbox)
//     const oneMinuteLevelBlocks = 20
//     const oneDayLevelBlocks   = 28800
//     const oneMonthLevelBlocks = 864000
//     const oneYearLevelBlocks  = 10512000 // 365 days

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

//     // helper functions to set token prices
//     async function setTokenPrice(epoch, round, observations, tokenName){
            
//         const oracleObservations     = new MichelsonMap<string, IOracleObservationType>();
//         const oracleVotingPowers     = new Map<string, number>();
//         var totalVotingPower         = 0;

//         for (const { oracle, data } of observations) {
            
//             // Get oracle voting power
//             const satelliteRecord  = await delegationStorage.satelliteLedger.get(oracle);
//             const votingPower      = satelliteRecord.totalDelegatedAmount.toNumber() + satelliteRecord.stakedMvkBalance.toNumber();
//             totalVotingPower      += votingPower;
//             oracleVotingPowers.set(oracle, votingPower)

//             if(tokenName == "mockFa12"){
//                 // Set observations
//                 oracleObservations.set(oracle, {
//                     data,
//                     epoch,
//                     round,
//                     aggregatorAddress: mockUsdMockFa12TokenAggregatorAddress.address
//                 });
//             } else if(tokenName == "mockFa2"){
//                 // Set observations
//                 oracleObservations.set(oracle, {
//                     data,
//                     epoch,
//                     round,
//                     aggregatorAddress: mockUsdMockFa2TokenAggregatorAddress.address
//                 });
//             } else if(tokenName == "tez"){
//                 // Set observations
//                 oracleObservations.set(oracle, {
//                     data,
//                     epoch,
//                     round,
//                     aggregatorAddress: mockUsdXtzAggregatorAddress.address
//                 });
//             } else if(tokenName == "smvk"){
//                 // Set observations
//                 oracleObservations.set(oracle, {
//                     data,
//                     epoch,
//                     round,
//                     aggregatorAddress: mockUsdMvkAggregatorAddress.address
//                 });
//             }
//         };
        
//         const signatures = new MichelsonMap<string, string>();
        
//         // Sign observations
//         await signerFactory(bob.sk);
//         signatures.set(bob.pkh, await utils.signOracleDataResponses(oracleObservations));
//         await signerFactory(eve.sk);
//         signatures.set(eve.pkh, await utils.signOracleDataResponses(oracleObservations));
//         await signerFactory(mallory.sk);
//         signatures.set(mallory.pkh, await utils.signOracleDataResponses(oracleObservations));
//         await signerFactory(oscar.sk);
//         signatures.set(oscar.pkh, await utils.signOracleDataResponses(oracleObservations));

//         // Operations
//         if(tokenName == "mockFa12"){

//             setPriceOperation = await mockUsdMockFa12TokenAggregatorInstance.methods.updateData(oracleObservations, signatures).send();

//         } else if(tokenName == "mockFa2"){

//             setPriceOperation = await mockUsdMockFa2TokenAggregatorInstance.methods.updateData(oracleObservations, signatures).send();

//         } else if(tokenName == "tez"){

//             setPriceOperation = await mockUsdXtzAggregatorInstance.methods.updateData(oracleObservations, signatures).send();
            
//         } else if(tokenName == "smvk"){

//             setPriceOperation = await mockUsdMvkAggregatorInstance.methods.updateData(oracleObservations, signatures).send();
            
//         }

//         await setPriceOperation.confirmation();
           
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


//         console.log('-- -- -- -- -- Lending Controller (Mock Time) Tests -- -- -- --')
//         console.log('Doorman Contract deployed at:'             , doormanInstance.address);
//         console.log('Delegation Contract deployed at:'          , delegationInstance.address);
//         console.log('MVK Token Contract deployed at:'           , mvkTokenInstance.address);
//         console.log('Lending Treasury Contract deployed at:'    , treasuryInstance.address);

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
//         console.log('Mock Aggregator - USD / MVK - deployed at:'                , mockUsdMvkAggregatorInstance.address);

//         console.log('Lending Controller Mock Time Contract deployed at:'        , lendingControllerInstance.address);

//         console.log('Alice address: ' + alice.pkh);
//         console.log('Bob address: '   + bob.pkh);
//         console.log('Eve address: '   + eve.pkh);
//         console.log('Mallory address: ' + mallory.pkh);
//         console.log('Oscar address: ' + oscar.pkh);
//         console.log('Trudy address: ' + trudy.pkh);

//         // ------------------------------------------------------------------
//         //
//         // Setup governance satellites for action snapshot later 
//         //
//         // ----------------------

//         const bobSatellite      = await delegationStorage.satelliteLedger.get(bob.pkh);
//         const mallorySatellite  = await delegationStorage.satelliteLedger.get(mallory.pkh);
//         const eveSatellite      = await delegationStorage.satelliteLedger.get(eve.pkh);
//         const oscarSatellite    = await delegationStorage.satelliteLedger.get(oscar.pkh);
        
//         if(bobSatellite === undefined){

//             // Bob stakes 100 MVK tokens and registers as a satellite
//             await signerFactory(bob.sk);
//             var updateOperators = await mvkTokenInstance.methods.update_operators([
//                 {
//                     add_operator: {
//                         owner: bob.pkh,
//                         operator: doormanAddress.address,
//                         token_id: 0,
//                     },
//                 },
//             ]).send()
//             await updateOperators.confirmation();  
//             const bobStakeAmount                  = MVK(100);
//             const bobStakeAmountOperation         = await doormanInstance.methods.stake(bobStakeAmount).send();
//             await bobStakeAmountOperation.confirmation();                        
//             const bobRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite("New Satellite by Bob", "New Satellite Description - Bob", "https://image.url", "https://image.url", "1000").send();
//             await bobRegisterAsSatelliteOperation.confirmation();

//         }


//         if(eveSatellite === undefined){

//             // Eve stakes 100 MVK tokens and registers as a satellite 
//             await signerFactory(eve.sk);
//             updateOperators = await mvkTokenInstance.methods.update_operators([
//                 {
//                     add_operator: {
//                         owner: eve.pkh,
//                         operator: doormanAddress.address,
//                         token_id: 0,
//                     },
//                 },
//             ]).send()
//             await updateOperators.confirmation(); 
//             const eveStakeAmount                  = MVK(100);
//             const eveStakeAmountOperation         = await doormanInstance.methods.stake(eveStakeAmount).send();
//             await eveStakeAmountOperation.confirmation();                        
//             const eveRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite("New Satellite by Eve", "New Satellite Description - Eve", "https://image.url", "https://image.url", "1000").send();
//             await eveRegisterAsSatelliteOperation.confirmation();
//         }


//         if(mallorySatellite === undefined){

//             // Mallory stakes 100 MVK tokens and registers as a satellite 
//             await signerFactory(mallory.sk);
//             updateOperators = await mvkTokenInstance.methods.update_operators([
//                 {
//                     add_operator: {
//                         owner: mallory.pkh,
//                         operator: doormanAddress.address,
//                         token_id: 0,
//                     },
//                 },
//             ]).send()
//             await updateOperators.confirmation(); 
//             const malloryStakeAmount                  = MVK(100);
//             const malloryStakeAmountOperation         = await doormanInstance.methods.stake(malloryStakeAmount).send();
//             await malloryStakeAmountOperation.confirmation();                        
//             const malloryRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite("New Satellite by Mallory", "New Satellite Description - Mallory", "https://image.url", "https://image.url", "1000").send();
//             await malloryRegisterAsSatelliteOperation.confirmation();
//         }


//         if(oscarSatellite === undefined){

//             // Oscar stakes 100 MVK tokens and registers as a satellite 
//             await signerFactory(oscar.sk);
//             updateOperators = await mvkTokenInstance.methods.update_operators([
//                 {
//                     add_operator: {
//                         owner: oscar.pkh,
//                         operator: doormanAddress.address,
//                         token_id: 0,
//                     },
//                 },
//             ]).send()
//             await updateOperators.confirmation(); 
//             const oscarStakeAmount                  = MVK(100);
//             const oscarStakeAmountOperation         = await doormanInstance.methods.stake(oscarStakeAmount).send();
//             await oscarStakeAmountOperation.confirmation();                        
//             const oscarRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite("New Satellite by Oscar", "New Satellite Description - Oscar", "https://image.url", "https://image.url", "1000").send();
//             await oscarRegisterAsSatelliteOperation.confirmation();
//         }


//         // ------------------------------------------------------------------
//         //
//         // Reset Oracle Prices
//         //
//         // ----------------------
//         //
//         // Basic price setup
//         //
//         // MockFA12 price -> 1,500,000 or $1.50
//         // MockFA2 price  -> 3,500,000 or $3.50 
//         // Tez price      -> 1,800,000 or $1.80
//         // Mvk price      -> 1,000,000,000 or $1.00
//         //
//         // Note: oracle/aggregator prices follow the same default price set in Lending Helpers 
//         //
//         // ------------------------------------------------------------------

//         const mockUsdMockFa12TokenLastData      = await mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.data;
//         const mockUsdMockFa2TokenLastData       = await mockUsdMockFa2TokenAggregatorStorage.lastCompletedData.data;
//         const mockUsdTezLastData                = await mockUsdXtzAggregatorStorage.lastCompletedData.data;
//         const mockUsdMvkLastData                = await mockUsdMvkAggregatorStorage.lastCompletedData.data;

//         mockFa12TokenIndex                      = lendingHelper.defaultPriceObservations.findIndex((o => o.name === "mockFa12"));
//         mockFa2TokenIndex                       = lendingHelper.defaultPriceObservations.findIndex((o => o.name === "mockFa2"));
//         tezIndex                                = lendingHelper.defaultPriceObservations.findIndex((o => o.name === "tez"));
//         mvkIndex                                = lendingHelper.defaultPriceObservations.findIndex((o => o.name === "smvk"));

//         const defaultMockFa12TokenMedianPrice   = lendingHelper.defaultPriceObservations[mockFa12TokenIndex].medianPrice;
//         const defaultMockFa2TokenMedianPrice    = lendingHelper.defaultPriceObservations[mockFa2TokenIndex].medianPrice;
//         const defaultTezMedianPrice             = lendingHelper.defaultPriceObservations[tezIndex].medianPrice;
//         const defaultMvkMedianPrice             = lendingHelper.defaultPriceObservations[mvkIndex].medianPrice;

//         // reset Mock FA12 token price
//         if(mockUsdMockFa12TokenLastData != defaultMockFa12TokenMedianPrice){

//             epoch = await mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.epoch;
//             epoch = parseInt(epoch) + 1;
//             round = 1;

//             // default observation data for mock FA-12 token
//             defaultObservations = lendingHelper.defaultPriceObservations[mockFa12TokenIndex].observations;

//             // reset token price to default observations
//             await setTokenPrice(epoch, round, defaultObservations, "mockFa12");
//         }


//         // reset Mock FA2 token price
//         if(mockUsdMockFa2TokenLastData != defaultMockFa2TokenMedianPrice){

//             epoch = await mockUsdMockFa2TokenAggregatorStorage.lastCompletedData.epoch;
//             epoch = parseInt(epoch) + 1;
//             round = 1;

//             // default observation data for mock FA-2 token
//             defaultObservations = lendingHelper.defaultPriceObservations[mockFa2TokenIndex].observations;

//             // reset token price to default observations
//             await setTokenPrice(epoch, round, defaultObservations, "mockFa2");
//         }


//         // reset Tez price
//         if(mockUsdTezLastData != defaultTezMedianPrice){

//             epoch = await mockUsdXtzAggregatorStorage.lastCompletedData.epoch;
//             epoch = parseInt(epoch) + 1;
//             round = 1;

//             // default observation data for xtz
//             defaultObservations = lendingHelper.defaultPriceObservations[tezIndex].observations;

//             // reset token price to default observations
//             await setTokenPrice(epoch, round, defaultObservations, "tez");
//         }


//         // reset Mvk price
//         if(mockUsdMvkLastData != defaultMvkMedianPrice){

//             epoch = await mockUsdMvkAggregatorStorage.lastCompletedData.epoch;
//             epoch = parseInt(epoch) + 1;
//             round = 1;

//             // default observation data for mvk
//             defaultObservations = lendingHelper.defaultPriceObservations[mvkIndex].observations;

//             // reset token price to default observations
//             await setTokenPrice(epoch, round, defaultObservations, "smvk");
//         }

//         // Update token oracles for local test calulations
//         mockUsdMockFa12TokenAggregatorStorage   = await mockUsdMockFa12TokenAggregatorInstance.storage();
//         mockUsdMockFa2TokenAggregatorStorage    = await mockUsdMockFa2TokenAggregatorInstance.storage();
//         mockUsdXtzAggregatorStorage             = await mockUsdXtzAggregatorInstance.storage();
//         mockUsdMvkAggregatorStorage             = await mockUsdMvkAggregatorInstance.storage();

//         tokenOracles.push({
//             'name': 'mockFa12', 
//             'price': parseInt(mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.data),
//             'priceDecimals': parseInt(mockUsdMockFa12TokenAggregatorStorage.config.decimals),
//             'tokenDecimals': 6
//         })

//         tokenOracles.push({
//             'name': 'mockFa2', 
//             'price': parseInt(mockUsdMockFa2TokenAggregatorStorage.lastCompletedData.data),
//             'priceDecimals': parseInt(mockUsdMockFa2TokenAggregatorStorage.config.decimals),
//             'tokenDecimals': 6
//         })

//         tokenOracles.push({
//             'name': 'tez', 
//             'price': parseInt(mockUsdXtzAggregatorStorage.lastCompletedData.data),
//             'priceDecimals': parseInt(mockUsdXtzAggregatorStorage.config.decimals),
//             'tokenDecimals': 6
//         })

//         tokenOracles.push({
//             'name': "smvk", 
//             'price': parseInt(mockUsdMvkAggregatorStorage.lastCompletedData.data),
//             'priceDecimals': parseInt(mockUsdMvkAggregatorStorage.config.decimals),
//             'tokenDecimals': 9
//         })

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
        
//         if(mockFa12LoanToken !== undefined){
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

//         if(mockFa2LoanToken !== undefined){
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

//         if(tezLoanToken !== undefined){
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
//                 mockFa12TokenIndex = tokenOracles.findIndex((o => o.name === "mockFa12"));
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
                
//                     // other variables will be affected from repeated tests
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

//                     // other variables will be affected from repeated tests
//                     assert.equal(mockFa2LoanToken.tokenName, tokenName);

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
                
//                     // other variables will be affected from repeated tests
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

//                 const oracleAddress                         = mockUsdMockFa2TokenAggregatorAddress.address;

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
//                 const isScaledToken                     = false;
                
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


//         it('admin can set staked MVK as a collateral token', async () => {

//             try{        
                
//                 // init variables
//                 await signerFactory(bob.sk);

//                 const setCollateralTokenActionType      = "createCollateralToken";
//                 const tokenName                         = "smvk";
//                 const tokenContractAddress              = mvkTokenAddress.address;
//                 const tokenType                         = "fa2";
//                 const tokenId                           = 0;

//                 const tokenDecimals                     = 9;
//                 const oracleAddress                     = mockUsdMvkAggregatorAddress.address;
//                 const tokenProtected                    = true; // sMVK is protected
//                 const isScaledToken                     = false;
                
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

//                         // fa12 token type - token contract address
//                         tokenType,
//                         tokenContractAddress,
//                         tokenId

//                     ).send();
//                     await adminSetMockFa12CollateralTokenOperation.confirmation();

//                 }

//                 lendingControllerStorage   = await lendingControllerInstance.storage();
//                 const stakedMvkCollateralTokenRecord       = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 
            
//                 assert.equal(stakedMvkCollateralTokenRecord.tokenName              , tokenName);
//                 assert.equal(stakedMvkCollateralTokenRecord.tokenDecimals          , tokenDecimals);
//                 assert.equal(stakedMvkCollateralTokenRecord.oracleAddress          , oracleAddress);
//                 assert.equal(stakedMvkCollateralTokenRecord.protected              , tokenProtected);
                

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
            
//                 await chai.expect(lendingControllerInstance.methods.setCollateralToken(
                        
//                     setCollateralTokenActionType,

//                     tokenName,
//                     tokenContractAddress,
//                     tokenDecimals,

//                     oracleAddress,
//                     tokenProtected,
//                     isScaledToken,
                    
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
            
//             // get initial eve's Mock FA12 Token balance
//             const eveMockFa12Ledger                 = await mockFa12TokenStorage.ledger.get(eve.pkh);            
//             const eveInitialMockFa12TokenBalance    = eveMockFa12Ledger == undefined ? 0 : parseInt(eveMockFa12Ledger.balance);

//             // get initial eve's Token Pool FA2 LP - Mock FA12 Token - balance
//             const eveInitialLpTokenPoolMockFa12TokenBalance    = await lpTokenPoolMockFa12TokenInstance.contractViews.get_balance({ 0 : eve.pkh, 1 : 0}).executeView({ viewCaller : bob.pkh});

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
//             const updatedEveLpTokenPoolMockFa12Ledger    = await lpTokenPoolMockFa12TokenInstance.contractViews.get_balance({ 0 : eve.pkh, 1 : 0}).executeView({ viewCaller : bob.pkh});
//             assert.equal(updatedEveLpTokenPoolMockFa12Ledger, parseInt(eveInitialLpTokenPoolMockFa12TokenBalance) + liquidityAmount);        

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
//             assert.equal(almostEqual(eveXtzBalance, eveInitialXtzBalance - liquidityAmount, 0.001), true)

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
//             const liquidationDelayInMins        = parseInt(lendingControllerStorage.config.liquidationDelayInMins);
//             const liquidationMaxDuration        = parseInt(lendingControllerStorage.config.liquidationMaxDuration);
//             const maxVaultLiquidationPercent    = parseInt(lendingControllerStorage.config.maxVaultLiquidationPercent);
//             const adminLiquidationFeePercent    = parseInt(lendingControllerStorage.config.adminLiquidationFeePercent);
//             const liquidationFeePercent         = parseInt(lendingControllerStorage.config.liquidationFeePercent);
//             const interestTreasuryShare         = parseInt(lendingControllerStorage.config.interestTreasuryShare);
            

//             // ----------------------------------------------------------------------------------------------
//             // Create Vault
//             // ----------------------------------------------------------------------------------------------


//             await signerFactory(eve.sk);

//             const vaultCounter  = vaultFactoryStorage.vaultCounter;
//             const vaultId       = parseInt(vaultCounter);
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
//             initialVaultOwnerMockFa12TokenBalance   = vaultOwnerMockFa12TokenAccount == undefined ? 0 : parseInt(vaultOwnerMockFa12TokenAccount.balance);

//             vaultMockFa12TokenAccount               =  await mockFa12TokenStorage.ledger.get(vaultAddress);            
//             initialVaultMockFa12TokenBalance        = vaultMockFa12TokenAccount == undefined ? 0 : parseInt(vaultMockFa12TokenAccount.balance);

//             liquidatorMockFa12TokenAccount          =  await mockFa12TokenStorage.ledger.get(liquidator);            
//             initialLiquidatorMockFa12TokenBalance   = liquidatorMockFa12TokenAccount == undefined ? 0 : parseInt(liquidatorMockFa12TokenAccount.balance);

//             treasuryMockFa12TokenAccount            =  await mockFa12TokenStorage.ledger.get(treasuryAddress.address);            
//             initialTreasuryMockFa12TokenBalance     = treasuryMockFa12TokenAccount == undefined ? 0 : parseInt(treasuryMockFa12TokenAccount.balance);

//             lendingControllerMockFa12TokenAccount            =  await mockFa12TokenStorage.ledger.get(lendingControllerAddress.address);            
//             initialLendingControllerMockFa12TokenBalance     = lendingControllerMockFa12TokenAccount == undefined ? 0 : parseInt(lendingControllerMockFa12TokenAccount.balance);

//             // get token pool stats
//             lendingControllerStorage       = await lendingControllerInstance.storage();
//             vaultRecord                    = await lendingControllerStorage.vaults.get(vaultHandle);
//             loanTokenRecord                = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
            
//             loanTokenDecimals              = loanTokenRecord.tokenDecimals;
//             const interestRateDecimals     = (27 - 2); 

//             const tokenPoolTotal           = parseInt(loanTokenRecord.tokenPoolTotal) / (10 ** loanTokenDecimals);
//             const totalBorrowed            = parseInt(loanTokenRecord.totalBorrowed) / (10 ** loanTokenDecimals);
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
//             newMockLevel = parseInt(lastUpdatedBlockLevel) + mockLevelChange;

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
//             currentMockLevel                        = parseInt(lendingControllerStorage.config.mockLevel);            
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
//             newMockLevel = parseInt(markedForLiquidationLevel) + mockLevelChange;

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
//             newMockLevel = parseInt(markedForLiquidationLevel) + mockLevelChange;

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
//             totalInterest                           = loanOutstandingWithAccruedInterest - parseInt(initialVaultLoanPrincipalTotal);
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
//             updatedVaultOwnerMockFa12TokenBalance   = vaultOwnerMockFa12TokenAccount == undefined ? 0 : parseInt(vaultOwnerMockFa12TokenAccount.balance);

//             vaultMockFa12TokenAccount               =  await mockFa12TokenStorage.ledger.get(vaultAddress);            
//             updatedVaultMockFa12TokenBalance        = vaultMockFa12TokenAccount == undefined ? 0 : parseInt(vaultMockFa12TokenAccount.balance);

//             liquidatorMockFa12TokenAccount          =  await mockFa12TokenStorage.ledger.get(liquidator);            
//             updatedLiquidatorMockFa12TokenBalance   = liquidatorMockFa12TokenAccount == undefined ? 0 : parseInt(liquidatorMockFa12TokenAccount.balance);

//             treasuryMockFa12TokenAccount            =  await mockFa12TokenStorage.ledger.get(treasuryAddress.address);            
//             updatedTreasuryMockFa12TokenBalance     = treasuryMockFa12TokenAccount == undefined ? 0 : parseInt(treasuryMockFa12TokenAccount.balance);

//             lendingControllerMockFa12TokenAccount            =  await mockFa12TokenStorage.ledger.get(lendingControllerAddress.address);            
//             updatedLendingControllerMockFa12TokenBalance     = lendingControllerMockFa12TokenAccount == undefined ? 0 : parseInt(lendingControllerMockFa12TokenAccount.balance);


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
//             assert.equal(parseInt(vaultLoanPrincipalTotal), parseInt(initialVaultLoanPrincipalTotal));
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
//             totalInterest                           = loanOutstandingWithAccruedInterest - parseInt(initialVaultLoanPrincipalTotal);
//             remainingInterest                       = lendingHelper.calculateRemainingInterest(totalLiquidationAmount, totalInterest);
//             totalInterestPaid                       = lendingHelper.calculateTotalInterestPaid(totalLiquidationAmount, totalInterest);

//             interestSentToTreasury                  = lendingHelper.calculateInterestSentToTreasury(interestTreasuryShare, totalInterestPaid)
//             interestRewards                         = lendingHelper.calculateInterestRewards(interestSentToTreasury, totalInterestPaid);

//             finalLoanOutstandingTotal               = lendingHelper.calculateFinalLoanOutstandingTotal(totalLiquidationAmount, loanOutstandingWithAccruedInterest);
//             finalLoanPrincipalTotal                 = lendingHelper.calculateFinalLoanPrincipalTotal(totalLiquidationAmount, loanOutstandingWithAccruedInterest, remainingInterest, initialVaultLoanPrincipalTotal);
//             finalLoanInterestTotal                  = lendingHelper.calculateFinalLoanInterestTotal(remainingInterest);


//             // get updated Mock FA12 Token balance for liquidator, vault, Treasury and Token Pool Reward Contract
//             vaultMockFa12TokenAccount               =  await mockFa12TokenStorage.ledger.get(vaultAddress);            
//             updatedVaultMockFa12TokenBalance        = vaultMockFa12TokenAccount == undefined ? 0 : parseInt(vaultMockFa12TokenAccount.balance);

//             liquidatorMockFa12TokenAccount          =  await mockFa12TokenStorage.ledger.get(liquidator);            
//             updatedLiquidatorMockFa12TokenBalance   = liquidatorMockFa12TokenAccount == undefined ? 0 : parseInt(liquidatorMockFa12TokenAccount.balance);

//             treasuryMockFa12TokenAccount            =  await mockFa12TokenStorage.ledger.get(treasuryAddress.address);            
//             updatedTreasuryMockFa12TokenBalance     = treasuryMockFa12TokenAccount == undefined ? 0 : parseInt(treasuryMockFa12TokenAccount.balance);

//             lendingControllerMockFa12TokenAccount            =  await mockFa12TokenStorage.ledger.get(lendingControllerAddress.address);            
//             updatedLendingControllerMockFa12TokenBalance     = lendingControllerMockFa12TokenAccount == undefined ? 0 : parseInt(lendingControllerMockFa12TokenAccount.balance);

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


        

//         it('simple one token test: user (mallory) can mark eve\'s vault for liquidation (oracle price shock for collateral token) and liquidate vault - [Collateral Token: Mock FA-12 | Loan Token: Mock FA-2]', async () => {

//             // init variables and storage
//             lendingControllerStorage = await lendingControllerInstance.storage();
//             vaultFactoryStorage      = await vaultFactoryInstance.storage();

//             currentMockLevel      = lendingControllerStorage.mockLevel;

//             // config variables
//             const liquidationDelayInMins        = parseInt(lendingControllerStorage.config.liquidationDelayInMins);
//             const liquidationMaxDuration        = parseInt(lendingControllerStorage.config.liquidationMaxDuration);
//             const maxVaultLiquidationPercent    = parseInt(lendingControllerStorage.config.maxVaultLiquidationPercent);
//             const adminLiquidationFeePercent    = parseInt(lendingControllerStorage.config.adminLiquidationFeePercent);
//             const liquidationFeePercent         = parseInt(lendingControllerStorage.config.liquidationFeePercent);
//             const interestTreasuryShare         = parseInt(lendingControllerStorage.config.interestTreasuryShare);
            

//             // ----------------------------------------------------------------------------------------------
//             // Create Vault
//             // ----------------------------------------------------------------------------------------------


//             await signerFactory(eve.sk);

//             const vaultCounter  = vaultFactoryStorage.vaultCounter;
//             const vaultId       = parseInt(vaultCounter);
//             const vaultOwner    = eve.pkh;
//             const liquidator    = mallory.pkh;
//             const depositors    = "any";
//             const loanTokenName = "mockFa2";

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
//             vaultRecord          = await lendingControllerStorage.vaults.get(vaultHandle);
//             const vaultAddress   = vaultRecord.address;
//             const vaultInstance  = await utils.tezos.contract.at(vaultAddress);

//             // console.log('   - vault originated: ' + vaultAddress);
//             // console.log('   - vault id: ' + vaultId);

//             // push new vault id to vault set
//             eveVaultSet.push(vaultId);


//             // ----------------------------------------------------------------------------------------------
//             // Deposit Collateral into Vault
//             // ----------------------------------------------------------------------------------------------


//             const mockFa12DepositAmount  = 20000000;   // 20 Mock FA12 Tokens - USD $30.00

//             // ---------------------------------
//             // Deposit Mock FA12 Tokens
//             // ---------------------------------

//             // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
//             // reset token allowance
//             resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
//                 vaultAddress,
//                 0
//             ).send();
//             await resetTokenAllowance.confirmation();

//             // set new token allowance
//             setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
//                 vaultAddress,
//                 mockFa12DepositAmount
//             ).send();
//             await setNewTokenAllowance.confirmation();

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


//             // borrow amount - 4 Mock FA2 Tokens - USD $14.00 
//             const borrowAmount = 4000000;   

//             // borrow operation
//             const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
//             await eveBorrowOperation.confirmation();

//             lendingControllerStorage   = await lendingControllerInstance.storage();
//             currentMockLevel           = parseInt(lendingControllerStorage.config.mockLevel);            

//             console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName + " | current block level: " + currentMockLevel);

//             // get initial Mock FA-12 Token and Mock FA-2 balance for Eve (vault owner), liquidator, vault, Treasury and Token Pool Reward Contract
//             vaultOwnerMockFa12TokenAccount          =  await mockFa12TokenStorage.ledger.get(vaultOwner);            
//             vaultOwnerMockFa2TokenAccount           =  await mockFa2TokenStorage.ledger.get(vaultOwner);            
//             initialVaultOwnerMockFa12TokenBalance   = vaultOwnerMockFa12TokenAccount == undefined ? 0 : parseInt(vaultOwnerMockFa12TokenAccount.balance);
//             initialVaultOwnerMockFa2TokenBalance    = vaultOwnerMockFa2TokenAccount == undefined ? 0 : parseInt(vaultOwnerMockFa2TokenAccount);

//             vaultMockFa12TokenAccount               =  await mockFa12TokenStorage.ledger.get(vaultAddress);            
//             vaultMockFa2TokenAccount                =  await mockFa2TokenStorage.ledger.get(vaultAddress);            
//             initialVaultMockFa12TokenBalance        = vaultMockFa12TokenAccount == undefined ? 0 : parseInt(vaultMockFa12TokenAccount.balance);
//             initialVaultMockFa2TokenBalance         = vaultMockFa2TokenAccount == undefined ? 0 : parseInt(vaultMockFa2TokenAccount);

//             liquidatorMockFa12TokenAccount          =  await mockFa12TokenStorage.ledger.get(liquidator);            
//             liquidatorMockFa2TokenAccount           =  await mockFa2TokenStorage.ledger.get(liquidator);            
//             initialLiquidatorMockFa12TokenBalance   = liquidatorMockFa12TokenAccount == undefined ? 0 : parseInt(liquidatorMockFa12TokenAccount.balance);
//             initialLiquidatorMockFa2TokenBalance    = liquidatorMockFa2TokenAccount == undefined ? 0 : parseInt(liquidatorMockFa2TokenAccount);

//             treasuryMockFa12TokenAccount            =  await mockFa12TokenStorage.ledger.get(treasuryAddress.address);            
//             treasuryMockFa2TokenAccount             =  await mockFa2TokenStorage.ledger.get(treasuryAddress.address);            
//             initialTreasuryMockFa12TokenBalance     = treasuryMockFa12TokenAccount == undefined ? 0 : parseInt(treasuryMockFa12TokenAccount.balance);
//             initialTreasuryMockFa2TokenBalance      = treasuryMockFa2TokenAccount == undefined ? 0 : parseInt(treasuryMockFa2TokenAccount);

//             lendingControllerMockFa12TokenAccount         =  await mockFa12TokenStorage.ledger.get(lendingControllerAddress.address);            
//             lendingControllerMockFa2TokenAccount          =  await mockFa2TokenStorage.ledger.get(lendingControllerAddress.address);            
//             initialLendingControllerMockFa12TokenBalance  = lendingControllerMockFa12TokenAccount == undefined ? 0 : parseInt(lendingControllerMockFa12TokenAccount.balance);
//             initialLendingControllerMockFa2TokenBalance   = lendingControllerMockFa2TokenAccount == undefined ? 0 : parseInt(lendingControllerMockFa2TokenAccount);

//             lendingControllerMockFa12TokenAccount          =  await mockFa12TokenStorage.ledger.get(lendingControllerAddress.address);            
//             lendingControllerMockFa2TokenAccount           =  await mockFa2TokenStorage.ledger.get(lendingControllerAddress.address);            
//             initialLendingControllerMockFa12TokenBalance   = lendingControllerMockFa12TokenAccount == undefined ? 0 : parseInt(lendingControllerMockFa12TokenAccount.balance);
//             initialLendingControllerMockFa2TokenBalance    = lendingControllerMockFa2TokenAccount == undefined ? 0 : parseInt(lendingControllerMockFa2TokenAccount);


//             // get token pool stats
//             lendingControllerStorage       = await lendingControllerInstance.storage();
//             vaultRecord                    = await lendingControllerStorage.vaults.get(vaultHandle);
//             loanTokenRecord                = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
            
//             loanTokenDecimals              = loanTokenRecord.tokenDecimals;
//             const interestRateDecimals     = (27 - 2); 

//             const tokenPoolTotal           = parseInt(loanTokenRecord.tokenPoolTotal) / (10 ** loanTokenDecimals);
//             const totalBorrowed            = parseInt(loanTokenRecord.totalBorrowed) / (10 ** loanTokenDecimals);
//             const optimalUtilisationRate   = Number(loanTokenRecord.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
//             const utilisationRate          = Number(loanTokenRecord.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
//             const currentInterestRate      = Number(loanTokenRecord.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";

//             console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);


//             // ----------------------------------------------------------------------------------------------
//             // Set Oracle price shock - token price drops by 2/3
//             // ----------------------------------------------------------------------------------------------

//             console.log('- start oracle price shock');

//             await signerFactory(bob.sk); // temporarily set to tester to increase block levels

//             mockUsdMockFa12TokenAggregatorStorage   = await mockUsdMockFa12TokenAggregatorInstance.storage();

//             lastEpoch   = mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.epoch
//             epoch       = parseInt(lastEpoch) + 1;
//             round       = 1;

//             lendingControllerStorage     = await lendingControllerInstance.storage();
//             vaultRecord                  = await lendingControllerStorage.vaults.get(vaultHandle);
//             lastUpdatedBlockLevel        = vaultRecord.lastUpdatedBlockLevel;

//             // local token oracles array map
//             const tokenOraclesIndex      = tokenOracles.findIndex((o => o.name === "mockFa12"));
//             const currentPrice           = tokenOracles[tokenOraclesIndex].price;

//             // price shock observation data for mock FA-12 token
//             mockFa12TokenIndex     = lendingHelper.priceDecreaseObservations.findIndex((o => o.name === "mockFa12"));
//             const priceShockObservations = lendingHelper.priceDecreaseObservations[mockFa12TokenIndex].observations;
//             const newMedianPrice         = lendingHelper.priceDecreaseObservations[mockFa12TokenIndex].medianPrice;

//             // set price shock for mock FA-12 token
//             await setTokenPrice(epoch, round, priceShockObservations, "mockFa12");

//             // Update price in token oracles array for local calculations
//             tokenOracles[tokenOraclesIndex].price = newMedianPrice;

//             mockUsdMockFa12TokenAggregatorStorage = await mockUsdMockFa12TokenAggregatorInstance.storage();
            
//             assert.deepEqual(mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.round, new BigNumber(round));
//             assert.deepEqual(mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.epoch, new BigNumber(epoch));
//             assert.deepEqual(mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.data,  new BigNumber(newMedianPrice));
//             assert.deepEqual(mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.percentOracleResponse,new BigNumber(4));

//             console.log('   - Mock FA-12 Token price change from ' + currentPrice + ' to ' + newMedianPrice);


//             // ----------------------------------------------------------------------------------------------
//             // Vault Marked for liquidation
//             // ----------------------------------------------------------------------------------------------

//             console.log('- mark vault for liquidation');

//             await signerFactory(mallory.sk); // mallory as liquidator

//             const markVaultForLiquidationOperation = await lendingControllerInstance.methods.markForLiquidation(vaultId, vaultOwner).send();
//             await markVaultForLiquidationOperation.confirmation();

//             lendingControllerStorage   = await lendingControllerInstance.storage();
//             vaultRecord                = await lendingControllerStorage.vaults.get(vaultHandle);
//             currentMockLevel           = parseInt(lendingControllerStorage.config.mockLevel);            
//             tempMap                    = lendingControllerStorage.tempMap;

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

//             minutesPassed               = liquidationDelayInMins / 2; 
//             mockLevelChange             = minutesPassed * oneMinuteLevelBlocks;
//             newMockLevel                = parseInt(markedForLiquidationLevel) + mockLevelChange;

//             const setMockLevelOperationTwo = await lendingControllerInstance.methods.updateConfig(newMockLevel, 'configMockLevel').send();
//             await setMockLevelOperationTwo.confirmation();

//             lendingControllerStorage = await lendingControllerInstance.storage();
//             currentMockLevel         = lendingControllerStorage.config.mockLevel;

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
//             // Set Block Levels For Mock Time Test - immediately after liquidation delay ends
//             // ----------------------------------------------------------------------------------------------


//             await signerFactory(bob.sk); // temporarily set to tester to increase block levels

//             lendingControllerStorage    = await lendingControllerInstance.storage();
//             vaultRecord                 = await lendingControllerStorage.vaults.get(vaultHandle);
//             markedForLiquidationLevel   = vaultRecord.markedForLiquidationLevel;

//             minutesPassed               = liquidationDelayInMins + 1;
//             mockLevelChange             = minutesPassed * oneMinuteLevelBlocks;
//             newMockLevel                = parseInt(markedForLiquidationLevel) + mockLevelChange;

//             const setMockLevelOperationThree = await lendingControllerInstance.methods.updateConfig(newMockLevel, 'configMockLevel').send();
//             await setMockLevelOperationThree.confirmation();

//             lendingControllerStorage = await lendingControllerInstance.storage();
//             currentMockLevel = lendingControllerStorage.config.mockLevel;

//             assert.equal(currentMockLevel, newMockLevel);

//             console.log('   - time set to immediately after vault liquidation delay: ' + markedForLiquidationLevel + ' to ' + newMockLevel + ' | Changed by: ' + mockLevelChange);


//             // ----------------------------------------------------------------------------------------------
//             // Vault calculations on loan outstanding, accrued interest, and liquidation fees
//             // ----------------------------------------------------------------------------------------------


//             await signerFactory(mallory.sk); 
//             const liquidationAmount = 100;

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
//             totalInterest                           = parseInt(initialVaultLoanPrincipalTotal) > loanOutstandingWithAccruedInterest ? 0 :  loanOutstandingWithAccruedInterest - parseInt(initialVaultLoanPrincipalTotal);


//             // check that calculations are correct - use of almostEqual as there may be a slight difference of 1 from rounding errors 
//             assert.equal(almostEqual(vaultLoanOutstandingTotal, loanOutstandingWithAccruedInterest, 0.0001), true);
//             assert.equal(vaultLoanInterestTotal, totalInterest);


//             // liquidation calculations - raw amounts 
//             adminLiquidationFee                    = lendingHelper.calculateAdminLiquidationFee(adminLiquidationFeePercent, liquidationAmount);
//             liquidationIncentive                   = lendingHelper.calculateLiquidationIncentive(liquidationFeePercent, liquidationAmount);            
//             liquidationAmountWithIncentive         = liquidationAmount + liquidationIncentive; 
//             liquidationAmountWithFeesAndIncentive  = liquidationAmount + liquidationIncentive + adminLiquidationFee; 

//             // convert from Mock FA2 Token qty to Mock FA12 qty
//             // - amount to treasury (admin)
//             adminLiquidationFee                    = lendingHelper.multiplyByTokenPrice("mockFa2", tokenOracles, adminLiquidationFee);
//             adminLiquidationFee                    = lendingHelper.divideByTokenPrice("mockFa12", tokenOracles, adminLiquidationFee);
            
//             // convert from Mock FA2 Token qty to Mock FA12 qty
//             // - amount sent to liquidator
//             liquidationAmountWithIncentive         = lendingHelper.multiplyByTokenPrice("mockFa2", tokenOracles, liquidationAmountWithIncentive);
//             liquidationAmountWithIncentive         = lendingHelper.divideByTokenPrice("mockFa12", tokenOracles, liquidationAmountWithIncentive);
            
//             // convert from Mock FA2 Token qty to Mock FA12 qty
//             // - total liquidated from vault
//             liquidationAmountWithFeesAndIncentive  = lendingHelper.multiplyByTokenPrice("mockFa2", tokenOracles, liquidationAmountWithFeesAndIncentive);
//             liquidationAmountWithFeesAndIncentive  = lendingHelper.divideByTokenPrice("mockFa12", tokenOracles, liquidationAmountWithFeesAndIncentive);

//             vaultMaxLiquidationAmount              = lendingHelper.calculateVaultMaxLiquidationAmount(vaultLoanOutstandingTotal, maxVaultLiquidationPercent);
            
//             // convert from Mock FA2 Token qty to Mock FA12 qty
//             // - total liquidation amount
//             totalLiquidationAmount          = lendingHelper.calculateTotalLiquidationAmount(liquidationAmount, vaultMaxLiquidationAmount);
//             totalLiquidationAmount          = lendingHelper.multiplyByTokenPrice("mockFa2", tokenOracles, totalLiquidationAmount);
//             totalLiquidationAmount          = lendingHelper.divideByTokenPrice("mockFa12", tokenOracles, totalLiquidationAmount);

//             totalInterestPaid               = lendingHelper.calculateTotalInterestPaid(totalLiquidationAmount, vaultLoanInterestTotal);
//             interestSentToTreasury          = lendingHelper.calculateInterestSentToTreasury(interestTreasuryShare, totalInterestPaid)
//             interestRewards                 = lendingHelper.calculateInterestRewards(interestSentToTreasury, totalInterestPaid);


//             // ----------------------------------------------------------------------------------------------
//             // Liquidate Vault Operation
//             // ----------------------------------------------------------------------------------------------

//             await signerFactory(mallory.sk); 
//             // mallory sets operator for lending controller
//             updateOperatorsOperation = await mockFa2TokenInstance.methods.update_operators([
//                 {
//                     add_operator: {
//                         owner: liquidator,
//                         operator: lendingControllerAddress.address,
//                         token_id: 0,
//                     },
//                 }])
//                 .send()
//             await updateOperatorsOperation.confirmation();

//             liquidateVaultOperation = await lendingControllerInstance.methods.liquidateVault(vaultId, vaultOwner, liquidationAmount).send();
//             await liquidateVaultOperation.confirmation();

//             // ----------------------------------------------------------------------------------------------
//             // Updated vault calculations after liquidation
//             // ----------------------------------------------------------------------------------------------


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


//             // vault calculations
//             totalLiquidationAmount                  = lendingHelper.calculateTotalLiquidationAmount(liquidationAmount, vaultMaxLiquidationAmount);
//             totalInterestPaid                       = lendingHelper.calculateTotalInterestPaid(totalLiquidationAmount, vaultLoanInterestTotal);

//             loanOutstandingWithAccruedInterest      = lendingHelper.calculateAccruedInterest(initialVaultLoanOutstandingTotal, initialVaultBorrowIndex, updatedLoanTokenBorrowIndex);
//             totalInterest                           = loanOutstandingWithAccruedInterest - parseInt(initialVaultLoanPrincipalTotal);
//             remainingInterest                       = lendingHelper.calculateRemainingInterest(totalLiquidationAmount, totalInterest)

//             finalLoanOutstandingTotal               = lendingHelper.calculateFinalLoanOutstandingTotal(totalLiquidationAmount, loanOutstandingWithAccruedInterest);
//             finalLoanPrincipalTotal                 = lendingHelper.calculateFinalLoanPrincipalTotal(totalLiquidationAmount, loanOutstandingWithAccruedInterest, remainingInterest, initialVaultLoanPrincipalTotal);
//             finalLoanInterestTotal                  = lendingHelper.calculateFinalLoanInterestTotal(remainingInterest);


//             // ----------------------------------------------------------------------------------------------
//             // Accounts and Balances
//             // ----------------------------------------------------------------------------------------------


//             // get updated Mock FA-12 and Mock FA-2 Token balance for Eve (vault owner), liquidator, vault, Treasury and Token Pool Reward Contract
//             vaultOwnerMockFa12TokenAccount          =  await mockFa12TokenStorage.ledger.get(vaultOwner);            
//             vaultOwnerMockFa2TokenAccount           =  await mockFa2TokenStorage.ledger.get(vaultOwner);            
//             updatedVaultOwnerMockFa12TokenBalance   = vaultOwnerMockFa12TokenAccount == undefined ? 0 : parseInt(vaultOwnerMockFa12TokenAccount.balance);
//             updatedVaultOwnerMockFa2TokenBalance    = vaultOwnerMockFa2TokenAccount == undefined ? 0 : parseInt(vaultOwnerMockFa2TokenAccount);

//             vaultMockFa12TokenAccount               =  await mockFa12TokenStorage.ledger.get(vaultAddress);            
//             vaultMockFa2TokenAccount                =  await mockFa2TokenStorage.ledger.get(vaultAddress);            
//             updatedVaultMockFa12TokenBalance        = vaultMockFa12TokenAccount == undefined ? 0 : parseInt(vaultMockFa12TokenAccount.balance);
//             updatedVaultMockFa2TokenBalance         = vaultMockFa2TokenAccount == undefined ? 0 : parseInt(vaultMockFa2TokenAccount);

//             liquidatorMockFa12TokenAccount          =  await mockFa12TokenStorage.ledger.get(liquidator);            
//             liquidatorMockFa2TokenAccount           =  await mockFa2TokenStorage.ledger.get(liquidator);            
//             updatedLiquidatorMockFa12TokenBalance   = liquidatorMockFa12TokenAccount == undefined ? 0 : parseInt(liquidatorMockFa12TokenAccount.balance);
//             updatedLiquidatorMockFa2TokenBalance    = liquidatorMockFa2TokenAccount == undefined ? 0 : parseInt(liquidatorMockFa2TokenAccount);

//             treasuryMockFa12TokenAccount            =  await mockFa12TokenStorage.ledger.get(treasuryAddress.address);            
//             treasuryMockFa2TokenAccount             =  await mockFa2TokenStorage.ledger.get(treasuryAddress.address);            
//             updatedTreasuryMockFa12TokenBalance     = treasuryMockFa12TokenAccount == undefined ? 0 : parseInt(treasuryMockFa12TokenAccount.balance);
//             updatedTreasuryMockFa2TokenBalance      = treasuryMockFa2TokenAccount == undefined ? 0 : parseInt(treasuryMockFa2TokenAccount);

//             lendingControllerMockFa12TokenAccount         =  await mockFa12TokenStorage.ledger.get(lendingControllerAddress.address);            
//             lendingControllerMockFa2TokenAccount          =  await mockFa2TokenStorage.ledger.get(lendingControllerAddress.address);            
//             updatedLendingControllerMockFa12TokenBalance  = lendingControllerMockFa12TokenAccount == undefined ? 0 : parseInt(lendingControllerMockFa12TokenAccount.balance);
//             updatedLendingControllerMockFa2TokenBalance   = lendingControllerMockFa2TokenAccount == undefined ? 0 : parseInt(lendingControllerMockFa2TokenAccount);

//             lendingControllerMockFa12TokenAccount          =  await mockFa12TokenStorage.ledger.get(lendingControllerAddress.address);            
//             lendingControllerMockFa2TokenAccount           =  await mockFa2TokenStorage.ledger.get(lendingControllerAddress.address);            
//             updatedLendingControllerMockFa12TokenBalance   = lendingControllerMockFa12TokenAccount == undefined ? 0 : parseInt(lendingControllerMockFa12TokenAccount.balance);
//             updatedLendingControllerMockFa2TokenBalance    = lendingControllerMockFa2TokenAccount == undefined ? 0 : parseInt(lendingControllerMockFa2TokenAccount);


//             // --------------------------------------------------------
//             // Simple test note: in this case, since there is only one collateral token,
//             // the token proportion will be equal to 1 (i.e. 1e27) and there are no calculations for token proportions
//             // --------------------------------------------------------
            
//             // check that there are no changes to the vault owner's balance
//             assert.equal(updatedVaultOwnerMockFa12TokenBalance, initialVaultOwnerMockFa12TokenBalance);
//             assert.equal(updatedVaultOwnerMockFa2TokenBalance , initialVaultOwnerMockFa2TokenBalance);

//             // vault should have a total reduction in balance equal to liquidationAmountWithFeesAndIncentive
//             assert.equal(updatedVaultMockFa12TokenBalance, initialVaultMockFa12TokenBalance - liquidationAmountWithFeesAndIncentive);
            
//             // liquidator uses Mock FA-2 tokens to liquidate and receives Mock FA-12 tokens from vault collateral
//             assert.equal(updatedLiquidatorMockFa2TokenBalance, initialLiquidatorMockFa2TokenBalance - liquidationAmount);
//             assert.equal(updatedLiquidatorMockFa12TokenBalance, initialLiquidatorMockFa12TokenBalance + liquidationAmountWithIncentive);

//             // treasury should receive both admin fee and share from interest repaid (if there is interest)
//             assert.equal(updatedTreasuryMockFa12TokenBalance, initialTreasuryMockFa12TokenBalance + adminLiquidationFee + interestSentToTreasury);

//             // reward pool should receive interest share from total interest paid
//             assert.equal(updatedLendingControllerMockFa12TokenBalance, initialLendingControllerMockFa12TokenBalance + interestRewards);

//             // check vault records 
//             // - since not a lot of time has passed for interest to accrue, the liquidation amount has covered the total loan interest accrued
//             // - use almost equal as there could be a slight rounding error of 1
//             assert.equal(almostEqual(vaultLoanOutstandingTotal, finalLoanOutstandingTotal, 0.0001), true);
//             assert.equal(almostEqual(vaultLoanPrincipalTotal, finalLoanPrincipalTotal, 0.0001), true);
//             assert.equal(vaultLoanInterestTotal, 0);

//         })



//         it('advanced multiple token test: user (mallory) can mark eve\'s vault for liquidation (oracle price shock for collateral token) and liquidate vault - [Collateral Token: Mock FA-12, Mock FA-2, Tez, MVK | Loan Token: Mock FA-2]', async () => {
    
//             // init variables and storage
//             lendingControllerStorage = await lendingControllerInstance.storage();
//             vaultFactoryStorage      = await vaultFactoryInstance.storage();
    
//             currentMockLevel         = lendingControllerStorage.mockLevel;
//             maxDecimals              = lendingControllerStorage.config.maxDecimalsForCalculation;
    
//             // config variables
//             const liquidationDelayInMins        = parseInt(lendingControllerStorage.config.liquidationDelayInMins);
//             const liquidationMaxDuration        = parseInt(lendingControllerStorage.config.liquidationMaxDuration);
//             const maxVaultLiquidationPercent    = parseInt(lendingControllerStorage.config.maxVaultLiquidationPercent);
//             const adminLiquidationFeePercent    = parseInt(lendingControllerStorage.config.adminLiquidationFeePercent);
//             const liquidationFeePercent         = parseInt(lendingControllerStorage.config.liquidationFeePercent);
//             const interestTreasuryShare         = parseInt(lendingControllerStorage.config.interestTreasuryShare);
            
//             // ----------------------------------------------------------------------------------------------
//             // Reset token prices back to default
//             // ----------------------------------------------------------------------------------------------

//             // reset token prices
//             mockFa12TokenIndex                  = lendingHelper.defaultPriceObservations.findIndex((o => o.name === "mockFa12"));
//             mockFa2TokenIndex                   = lendingHelper.defaultPriceObservations.findIndex((o => o.name === "mockFa2"));
//             tezIndex                            = lendingHelper.defaultPriceObservations.findIndex((o => o.name === "tez"));
//             mvkIndex                            = lendingHelper.defaultPriceObservations.findIndex((o => o.name === "smvk"));

//             round = 1;

//             // ---------------------------------
//             // Reset Mock FA-12 token prices to default observation data
//             // ---------------------------------

//             epoch = await mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.epoch;
//             epoch = parseInt(epoch) + 1;            
//             defaultObservations = lendingHelper.defaultPriceObservations[mockFa12TokenIndex].observations;
//             await setTokenPrice(epoch, round, defaultObservations, "mockFa12");

//             const mockFa12TokenMedianPrice = lendingHelper.defaultPriceObservations[mockFa12TokenIndex].medianPrice;
//             tokenOracles[mockFa12TokenIndex].price = mockFa12TokenMedianPrice;

//             mockUsdMockFa12TokenAggregatorStorage = await mockUsdMockFa12TokenAggregatorInstance.storage();
//             assert.deepEqual(mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.round,new BigNumber(round));
//             assert.deepEqual(mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.epoch,new BigNumber(epoch));
//             assert.deepEqual(mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.data,new BigNumber(mockFa12TokenMedianPrice));
//             assert.deepEqual(mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.percentOracleResponse,new BigNumber(4));

//             // ---------------------------------
//             // Reset Mock FA-2 token prices to default observation data
//             // ---------------------------------

//             epoch = await mockUsdMockFa2TokenAggregatorStorage.lastCompletedData.epoch;
//             epoch = parseInt(epoch) + 1;            
//             defaultObservations = lendingHelper.defaultPriceObservations[mockFa2TokenIndex].observations;
//             await setTokenPrice(epoch, round, defaultObservations, "mockFa2");

//             const mockFa2TokenMedianPrice = lendingHelper.defaultPriceObservations[mockFa2TokenIndex].medianPrice;
//             tokenOracles[mockFa2TokenIndex].price = mockFa2TokenMedianPrice;

//             mockUsdMockFa2TokenAggregatorStorage = await mockUsdMockFa2TokenAggregatorInstance.storage();
//             assert.deepEqual(mockUsdMockFa2TokenAggregatorStorage.lastCompletedData.round,new BigNumber(round));
//             assert.deepEqual(mockUsdMockFa2TokenAggregatorStorage.lastCompletedData.epoch,new BigNumber(epoch));
//             assert.deepEqual(mockUsdMockFa2TokenAggregatorStorage.lastCompletedData.data,new BigNumber(mockFa2TokenMedianPrice));
//             assert.deepEqual(mockUsdMockFa2TokenAggregatorStorage.lastCompletedData.percentOracleResponse,new BigNumber(4));

//             // ---------------------------------
//             // Reset tez prices to default observation data
//             // ---------------------------------

//             epoch = await mockUsdXtzAggregatorStorage.lastCompletedData.epoch;
//             epoch = parseInt(epoch) + 1;            
//             defaultObservations = lendingHelper.defaultPriceObservations[tezIndex].observations;
//             await setTokenPrice(epoch, round, defaultObservations, "tez");

//             const tezMedianPrice = lendingHelper.defaultPriceObservations[tezIndex].medianPrice;
//             tokenOracles[tezIndex].price = tezMedianPrice;

//             mockUsdXtzAggregatorStorage = await mockUsdXtzAggregatorInstance.storage();
//             assert.deepEqual(mockUsdXtzAggregatorStorage.lastCompletedData.round,new BigNumber(round));
//             assert.deepEqual(mockUsdXtzAggregatorStorage.lastCompletedData.epoch,new BigNumber(epoch));
//             assert.deepEqual(mockUsdXtzAggregatorStorage.lastCompletedData.data,new BigNumber(tezMedianPrice));
//             assert.deepEqual(mockUsdXtzAggregatorStorage.lastCompletedData.percentOracleResponse,new BigNumber(4));

//             // ---------------------------------
//             // Reset mvk prices to default observation data
//             // ---------------------------------

//             epoch = await mockUsdMvkAggregatorStorage.lastCompletedData.epoch;
//             epoch = parseInt(epoch) + 1;            
//             defaultObservations = lendingHelper.defaultPriceObservations[mvkIndex].observations;
//             await setTokenPrice(epoch, round, defaultObservations, "smvk");

//             const mvkMedianPrice = lendingHelper.defaultPriceObservations[mvkIndex].medianPrice;
//             tokenOracles[mvkIndex].price = mvkMedianPrice;

//             mockUsdMvkAggregatorStorage = await mockUsdMvkAggregatorInstance.storage();
//             assert.deepEqual(mockUsdMvkAggregatorStorage.lastCompletedData.round,new BigNumber(round));
//             assert.deepEqual(mockUsdMvkAggregatorStorage.lastCompletedData.epoch,new BigNumber(epoch));
//             assert.deepEqual(mockUsdMvkAggregatorStorage.lastCompletedData.data,new BigNumber(mvkMedianPrice));
//             assert.deepEqual(mockUsdMvkAggregatorStorage.lastCompletedData.percentOracleResponse,new BigNumber(4));

//             // ----------------------------------------------------------------------------------------------
//             // Create Vault
//             // ----------------------------------------------------------------------------------------------
    
//             await signerFactory(eve.sk);
    
//             const vaultCounter  = vaultFactoryStorage.vaultCounter;
//             const vaultId       = parseInt(vaultCounter);
//             const vaultOwner    = eve.pkh;
//             const liquidator    = mallory.pkh;
//             const depositors    = "any";
//             const loanTokenName = "mockFa2";
    
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
    
//             const mockFa12DepositAmount  = 20000000;      // 20 Mock FA12 Tokens - USD $30.00
//             const mockFa2DepositAmount   = 6000000;       // 6 Mock FA12 Tokens - USD $21.00
//             const tezDepositAmount       = 10000000;      // 10 Tez - USD $18.00
//             const mvkDepositAmount       = 10000000000;   // 10 MVK - USD $10.00
    
//             // Total: $79.00
    
//             // ---------------------------------
//             // Deposit Mock FA12 Tokens
//             // ---------------------------------
    
//             // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
//             // reset token allowance
//             resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
//                 vaultAddress,
//                 0
//             ).send();
//             await resetTokenAllowance.confirmation();
    
//             // set new token allowance
//             setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
//                 vaultAddress,
//                 mockFa12DepositAmount
//             ).send();
//             await setNewTokenAllowance.confirmation();
    
//             // eve deposits mock FA12 tokens into vault
//             const eveDepositMockFa12TokenOperation  = await vaultInstance.methods.deposit(
//                 mockFa12DepositAmount,           
//                 "mockFa12"
//             ).send();
//             await eveDepositMockFa12TokenOperation.confirmation();
    
//             // ---------------------------------
//             // Deposit Mock FA2 Tokens
//             // ---------------------------------
    
//             // eve sets operator for lending controller
//             updateOperatorsOperation = await mockFa2TokenInstance.methods.update_operators([
//             {
//                 add_operator: {
//                     owner: vaultOwner,
//                     operator: vaultAddress,
//                     token_id: 0,
//                 },
//             }]).send()
//             await updateOperatorsOperation.confirmation();
    
//             // eve deposits mock FA2 tokens into vault
//             const eveDepositMockFa2TokenOperation  = await vaultInstance.methods.deposit(
//                 mockFa2DepositAmount,           
//                 "mockFa2"
//             ).send();
//             await eveDepositMockFa2TokenOperation.confirmation();
    
//             // ---------------------------------
//             // Deposit Tez
//             // ---------------------------------
    
//             const eveDepositTezOperation  = await vaultInstance.methods.deposit(
//                     tezDepositAmount,  // amt
//                     "tez"              // token
//             ).send({ mutez : true, amount : tezDepositAmount });
//             await eveDepositTezOperation.confirmation();
    
//             // ---------------------------------
//             // Deposit Staked MVK
//             // ---------------------------------

//             console.log('start deposit staked mvk');

//             // eve set doorman as operator for vault
//             updateOperatorsOperation = await vaultInstance.methods.updateMvkOperators([
//             {
//                 add_operator: {
//                     owner: vaultAddress,
//                     operator: doormanAddress.address,
//                     token_id: 0,
//                 },
//             }]).send();
//             await updateOperatorsOperation.confirmation();
    
//             // vault staked mvk operation
//             const eveVaultDepositStakedMvkOperation  = await lendingControllerInstance.methods.vaultDepositStakedMvk(
//                 vaultId,                 
//                 mvkDepositAmount                            
//             ).send();
//             await eveVaultDepositStakedMvkOperation.confirmation();
    
//             console.log('   - vault collateral deposited: Mock FA-12 Tokens: ' + mockFa12DepositAmount + " | Mock FA-2 Tokens: " + mockFa12DepositAmount + " | Tez: " + tezDepositAmount + " | sMVK: " + mvkDepositAmount);
    
//             // ----------------------------------------------------------------------------------------------
//             // Borrow with Vault
//             // ----------------------------------------------------------------------------------------------
    
//             // borrow amount - 10 Mock FA2 Tokens - USD $35.00 
//             const borrowAmount = 10000000;   
    
//             // borrow operation
//             const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
//             await eveBorrowOperation.confirmation();
    
//             lendingControllerStorage   = await lendingControllerInstance.storage();
//             currentMockLevel           = parseInt(lendingControllerStorage.config.mockLevel);            
    
//             console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName + " | current block level: " + currentMockLevel);
    
//             // get initial Mock FA-12 Token and Mock FA-2 balance for Eve (vault owner), liquidator, vault, Treasury and Token Pool Reward Contract
//             mockFa12TokenStorage     = await mockFa12TokenInstance.storage();
//             mockFa2TokenStorage      = await mockFa2TokenInstance.storage();
//             lendingControllerStorage = await lendingControllerInstance.storage();
//             doormanStorage           = await doormanInstance.storage();

//             // Vault Owner
//             vaultOwnerMockFa12TokenAccount          = await mockFa12TokenStorage.ledger.get(vaultOwner);            
//             vaultOwnerMockFa2TokenAccount           = await mockFa2TokenStorage.ledger.get(vaultOwner);            
//             vaultOwnerTezAccount                    = await utils.tezos.tz.getBalance(vaultOwner);
//             vaultOwnerStakedMvkAccount              = await doormanStorage.userStakeBalanceLedger.get(vaultOwner);

//             initialVaultOwnerMockFa12TokenBalance   = vaultOwnerMockFa12TokenAccount == undefined ? 0 : parseInt(vaultOwnerMockFa12TokenAccount.balance);
//             initialVaultOwnerMockFa2TokenBalance    = vaultOwnerMockFa2TokenAccount == undefined ? 0 : parseInt(vaultOwnerMockFa2TokenAccount);
//             initialVaultOwnerTezBalance             = vaultOwnerTezAccount.toNumber();
//             initialVaultOwnerStakedMvkBalance       = vaultOwnerStakedMvkAccount == undefined ? 0 : vaultOwnerStakedMvkAccount.balance.toNumber();
            
//             // ----
    
//             // Vault 
//             vaultMockFa12TokenAccount               = await mockFa12TokenStorage.ledger.get(vaultAddress);            
//             vaultMockFa2TokenAccount                = await mockFa2TokenStorage.ledger.get(vaultAddress);            
//             vaultTezAccount                         = await utils.tezos.tz.getBalance(vaultAddress);
//             vaultStakedMvkAccount                   = await doormanStorage.userStakeBalanceLedger.get(vaultAddress);

//             initialVaultMockFa12TokenBalance        = vaultMockFa12TokenAccount == undefined ? 0 : parseInt(vaultMockFa12TokenAccount.balance);
//             initialVaultMockFa2TokenBalance         = vaultMockFa2TokenAccount == undefined ? 0 : parseInt(vaultMockFa2TokenAccount);
//             initialVaultTezBalance                  = vaultTezAccount.toNumber();
//             initialVaultStakedMvkBalance            = vaultStakedMvkAccount == undefined ? 0 : vaultStakedMvkAccount.balance.toNumber();

//             // ----            
    
//             // Liquidator
//             liquidatorMockFa12TokenAccount          = await mockFa12TokenStorage.ledger.get(liquidator);            
//             liquidatorMockFa2TokenAccount           = await mockFa2TokenStorage.ledger.get(liquidator);            
//             liquidatorTezAccount                    = await utils.tezos.tz.getBalance(liquidator);
//             liquidatorStakedMvkAccount              = await doormanStorage.userStakeBalanceLedger.get(liquidator);

//             initialLiquidatorMockFa12TokenBalance   = liquidatorMockFa12TokenAccount == undefined ? 0 : parseInt(liquidatorMockFa12TokenAccount.balance);
//             initialLiquidatorMockFa2TokenBalance    = liquidatorMockFa2TokenAccount == undefined ? 0 : parseInt(liquidatorMockFa2TokenAccount);
//             initialLiquidatorTezBalance             = liquidatorTezAccount.toNumber();
//             initialLiquidatorStakedMvkBalance       = liquidatorStakedMvkAccount == undefined ? 0 : liquidatorStakedMvkAccount.balance.toNumber();

//             // ----            
    
//             // Treasury
//             treasuryMockFa12TokenAccount            = await mockFa12TokenStorage.ledger.get(treasuryAddress.address);            
//             treasuryMockFa2TokenAccount             = await mockFa2TokenStorage.ledger.get(treasuryAddress.address);            
//             treasuryTezAccount                      = await utils.tezos.tz.getBalance(treasuryAddress.address);
//             treasuryStakedMvkAccount                = await doormanStorage.userStakeBalanceLedger.get(treasuryAddress.address);

//             initialTreasuryMockFa12TokenBalance     = treasuryMockFa12TokenAccount == undefined ? 0 : parseInt(treasuryMockFa12TokenAccount.balance);
//             initialTreasuryMockFa2TokenBalance      = treasuryMockFa2TokenAccount == undefined ? 0 : parseInt(treasuryMockFa2TokenAccount);
//             initialTreasuryTezBalance               = treasuryTezAccount.toNumber();
//             initialTreasuryStakedMvkBalance         = treasuryStakedMvkAccount == undefined ? 0 : treasuryStakedMvkAccount.balance.toNumber();

//             // ----            

//             // Lending Controller
//             lendingControllerMockFa12TokenAccount         = await mockFa12TokenStorage.ledger.get(lendingControllerAddress.address);            
//             lendingControllerMockFa2TokenAccount          = await mockFa2TokenStorage.ledger.get(lendingControllerAddress.address);            
//             lendingControllerTezAccount                   = await utils.tezos.tz.getBalance(lendingControllerAddress.address);

//             initialLendingControllerMockFa12TokenBalance  = lendingControllerMockFa12TokenAccount == undefined ? 0 : parseInt(lendingControllerMockFa12TokenAccount.balance);
//             initialLendingControllerMockFa2TokenBalance   = lendingControllerMockFa2TokenAccount == undefined ? 0 : parseInt(lendingControllerMockFa2TokenAccount);
//             initialLendingControllerTezBalance            = lendingControllerTezAccount.toNumber();

//             // ----            
    
//             // get token pool stats
//             lendingControllerStorage       = await lendingControllerInstance.storage();
//             vaultRecord                    = await lendingControllerStorage.vaults.get(vaultHandle);
//             loanTokenRecord                = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
            
//             loanTokenDecimals              = loanTokenRecord.tokenDecimals;
//             const interestRateDecimals     = (27 - 2); 
    
//             const tokenPoolTotal           = parseInt(loanTokenRecord.tokenPoolTotal) / (10 ** loanTokenDecimals);
//             const totalBorrowed            = parseInt(loanTokenRecord.totalBorrowed) / (10 ** loanTokenDecimals);
//             const optimalUtilisationRate   = Number(loanTokenRecord.optimalUtilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
//             const utilisationRate          = Number(loanTokenRecord.utilisationRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
//             const currentInterestRate      = Number(loanTokenRecord.currentInterestRate / (10 ** interestRateDecimals)).toFixed(3) + "%";
    
//             console.log('   - token pool stats >> Token Pool Total: ' + tokenPoolTotal + ' | Total Borrowed: ' + totalBorrowed + ' | Utilisation Rate: ' + utilisationRate + ' | Optimal Utilisation Rate: ' + optimalUtilisationRate + ' | Current Interest Rate: ' + currentInterestRate);
    
//             // ----------------------------------------------------------------------------------------------
//             // Set oracle price changes
//             // - price shock for Mock FA-12 Token (collateral token) - price drops by 2/3
//             // - price shock for Tez (collateral token) - price drops by 2/3
//             // ----------------------------------------------------------------------------------------------
    
//             await signerFactory(bob.sk); // temporarily set to tester to increase block levels
    
//             mockUsdMockFa12TokenAggregatorStorage     = await mockUsdMockFa12TokenAggregatorInstance.storage();
//             lastEpoch                                 = mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.epoch
//             epoch                                     = parseInt(lastEpoch) + 1;
//             round                                     = 1;
    
//             lendingControllerStorage                  = await lendingControllerInstance.storage();
//             vaultRecord                               = await lendingControllerStorage.vaults.get(vaultHandle);
//             lastUpdatedBlockLevel                     = vaultRecord.lastUpdatedBlockLevel;
    
//             // local token oracles array map
//             const mockFa12TokenCurrentPrice           = tokenOracles[mockFa12TokenIndex].price;

//             // price shock observation data for mock FA-12 token
//             mockFa12TokenIndex                        = lendingHelper.priceDecreaseObservations.findIndex((o => o.name === "mockFa12"));
//             const mockFa12TokenPriceShockObservations = lendingHelper.priceDecreaseObservations[mockFa12TokenIndex].observations;
//             const newMockFa12TokenMedianPrice         = lendingHelper.priceDecreaseObservations[mockFa12TokenIndex].medianPrice;

//             // set price shock for mock FA-12 token
//             await setTokenPrice(epoch, round, mockFa12TokenPriceShockObservations, "mockFa12");
    
//             // Update price in token oracles array for local calculations
//             tokenOracles[mockFa12TokenIndex].price = newMockFa12TokenMedianPrice;
    
//             mockUsdMockFa12TokenAggregatorStorage = await mockUsdMockFa12TokenAggregatorInstance.storage();
//             assert.deepEqual(mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.round,new BigNumber(round));
//             assert.deepEqual(mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.epoch,new BigNumber(epoch));
//             assert.deepEqual(mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.data,new BigNumber(newMockFa12TokenMedianPrice));
//             assert.deepEqual(mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.percentOracleResponse,new BigNumber(4));
    
//             console.log('   - Mock FA-12 Token price change from ' + mockFa12TokenCurrentPrice + ' to ' + newMockFa12TokenMedianPrice);

//             mockUsdXtzAggregatorStorage   = await mockUsdXtzAggregatorInstance.storage();
//             lastEpoch                     = mockUsdXtzAggregatorStorage.lastCompletedData.epoch
//             epoch                         = parseInt(lastEpoch) + 1;
//             round                         = 1;
    
//             lendingControllerStorage     = await lendingControllerInstance.storage();
//             vaultRecord                  = await lendingControllerStorage.vaults.get(vaultHandle);
//             lastUpdatedBlockLevel        = vaultRecord.lastUpdatedBlockLevel;
    
//             // local token oracles array map
//             const tezCurrentPrice           = tokenOracles[tezIndex].price;

//             // price shock observation data for mock FA-12 token
//             const tezPriceShockObservations = lendingHelper.priceDecreaseObservations[tezIndex].observations;
//             const newTezMedianPrice         = lendingHelper.priceDecreaseObservations[tezIndex].medianPrice;

//             // set price shock for mock FA-12 token
//             await setTokenPrice(epoch, round, tezPriceShockObservations, "tez");
    
//             // Update price in token oracles array for local calculations
//             tokenOracles[tezIndex].price = newTezMedianPrice;
    
//             mockUsdXtzAggregatorStorage = await mockUsdXtzAggregatorInstance.storage();
//             assert.deepEqual(mockUsdXtzAggregatorStorage.lastCompletedData.round,new BigNumber(round));
//             assert.deepEqual(mockUsdXtzAggregatorStorage.lastCompletedData.epoch,new BigNumber(epoch));
//             assert.deepEqual(mockUsdXtzAggregatorStorage.lastCompletedData.data,new BigNumber(newTezMedianPrice));
//             assert.deepEqual(mockUsdXtzAggregatorStorage.lastCompletedData.percentOracleResponse,new BigNumber(4));
    
//             console.log('   - XTZ price change from ' + tezCurrentPrice + ' to ' + newTezMedianPrice);
    
//             // ----------------------------------------------------------------------------------------------
//             // Vault Marked for liquidation
//             // ----------------------------------------------------------------------------------------------

//             console.log('mark for liquidation');

//             await signerFactory(mallory.sk); // mallory as liquidator

//             // note: requires mock level to not be 0
//             const markVaultForLiquidationOperation = await lendingControllerInstance.methods.markForLiquidation(vaultId, vaultOwner).send();
//             await markVaultForLiquidationOperation.confirmation();
    
//             lendingControllerStorage   = await lendingControllerInstance.storage();
//             vaultRecord                = await lendingControllerStorage.vaults.get(vaultHandle);
//             currentMockLevel           = parseInt(lendingControllerStorage.config.mockLevel);            
//             tempMap                    = lendingControllerStorage.tempMap;
    
//             const expectedMarkedForLiquidationLevel = currentMockLevel;
//             const expectedLiquidationEndLevel       = currentMockLevel + (liquidationMaxDuration * oneMinuteLevelBlocks);
    
//             initialVaultLoanOutstandingTotal = vaultRecord.loanOutstandingTotal;
//             initialVaultLoanPrincipalTotal   = vaultRecord.loanPrincipalTotal;
//             initialVaultBorrowIndex          = vaultRecord.borrowIndex;
    
//             const vaultMarkedForLiquidationLevel    = vaultRecord.markedForLiquidationLevel;
//             const vaultLiquidationEndLevel          = vaultRecord.liquidationEndLevel;
    
//             assert.equal(vaultMarkedForLiquidationLevel, expectedMarkedForLiquidationLevel);
//             assert.equal(vaultLiquidationEndLevel, expectedLiquidationEndLevel);

//             console.log('fail test: mark for liquidation again');
    
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
    
//             minutesPassed   = liquidationDelayInMins / 2; 
//             mockLevelChange = minutesPassed * oneMinuteLevelBlocks;
//             newMockLevel    = parseInt(markedForLiquidationLevel) + mockLevelChange;
    
//             const setMockLevelOperationTwo = await lendingControllerInstance.methods.updateConfig(newMockLevel, 'configMockLevel').send();
//             await setMockLevelOperationTwo.confirmation();
    
//             lendingControllerStorage = await lendingControllerInstance.storage();
//             currentMockLevel         = lendingControllerStorage.config.mockLevel;
    
//             assert.equal(currentMockLevel, newMockLevel);
    
//             console.log('   - time set to middle of vault liquidation delay: ' + markedForLiquidationLevel + ' to ' + newMockLevel + ' | Changed by: ' + mockLevelChange);
//             console.log('fail test: mark for liquidation again');
    
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
    
//             minutesPassed   = liquidationDelayInMins + 1;
//             mockLevelChange = minutesPassed * oneMinuteLevelBlocks;
//             newMockLevel    = parseInt(markedForLiquidationLevel) + mockLevelChange;
    
//             const setMockLevelOperationThree = await lendingControllerInstance.methods.updateConfig(newMockLevel, 'configMockLevel').send();
//             await setMockLevelOperationThree.confirmation();
    
//             lendingControllerStorage = await lendingControllerInstance.storage();
//             currentMockLevel         = lendingControllerStorage.config.mockLevel;
    
//             assert.equal(currentMockLevel, newMockLevel);
    
//             console.log('   - time set to immediately after vault liquidation delay: ' + markedForLiquidationLevel + ' to ' + newMockLevel + ' | Changed by: ' + mockLevelChange);
    
//             // ----------------------------------------------------------------------------------------------
//             // Calculate liquidate vault effects
//             // ----------------------------------------------------------------------------------------------
    
//             await signerFactory(mallory.sk); 
//             const liquidationAmount = 100;
    
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
//             totalInterest                           = parseInt(initialVaultLoanPrincipalTotal) > loanOutstandingWithAccruedInterest ? 0 :  loanOutstandingWithAccruedInterest - parseInt(initialVaultLoanPrincipalTotal);

    
//             // check that calculations are correct - use of almostEqual as there may be a slight difference of 1 from rounding errors 
//             assert.equal(almostEqual(vaultLoanOutstandingTotal, loanOutstandingWithAccruedInterest, 0.0001), true);
//             assert.equal(almostEqual(vaultLoanInterestTotal, totalInterest, 0.0001), true);
    

//             // calculate value of collateral 
//             const vaultCollateralValue          = lendingHelper.calculateVaultCollateralValue(tokenOracles, vaultRecord.collateralBalanceLedger);
//             const mockFa12CollateralTokenValue  = lendingHelper.calculateTokenValue(mockFa12DepositAmount   , "mockFa12"    , tokenOracles);
//             const mockFa2CollateralTokenValue   = lendingHelper.calculateTokenValue(mockFa2DepositAmount    , "mockFa2"     , tokenOracles);
//             const tezCollateralTokenValue       = lendingHelper.calculateTokenValue(tezDepositAmount        , "tez"         , tokenOracles);
//             const mvkCollateralTokenValue       = lendingHelper.calculateTokenValue(mvkDepositAmount        , "smvk"         , tokenOracles);

//             // calculate proportion of collateral based on their value
//             const mockFa12TokenProportion       = lendingHelper.calculateTokenProportion(mockFa12CollateralTokenValue, vaultCollateralValue);
//             const mockFa2TokenProportion        = lendingHelper.calculateTokenProportion(mockFa2CollateralTokenValue, vaultCollateralValue);
//             const tezProportion                 = lendingHelper.calculateTokenProportion(tezCollateralTokenValue, vaultCollateralValue);
//             const mvkProportion                 = lendingHelper.calculateTokenProportion(mvkCollateralTokenValue, vaultCollateralValue);


//             // liquidation calculations - raw amounts 
//             adminLiquidationFee                    = lendingHelper.calculateAdminLiquidationFee(adminLiquidationFeePercent, liquidationAmount);
//             liquidationIncentive                   = lendingHelper.calculateLiquidationIncentive(liquidationFeePercent, liquidationAmount);            
//             liquidationAmountWithIncentive         = liquidationAmount + liquidationIncentive; 
//             liquidationAmountWithFeesAndIncentive  = liquidationAmount + liquidationIncentive + adminLiquidationFee; 
    
//             // max liquidation amount, final (total) liquidation amount, and total interest paid
//             vaultMaxLiquidationAmount              = lendingHelper.calculateVaultMaxLiquidationAmount(vaultLoanOutstandingTotal, maxVaultLiquidationPercent);
//             totalLiquidationAmount                 = lendingHelper.calculateTotalLiquidationAmount(liquidationAmount, vaultMaxLiquidationAmount);
//             totalInterestPaid                      = lendingHelper.calculateTotalInterestPaid(totalLiquidationAmount, totalInterest);


//             // -----------------
//             // Convert tokens based on their proportion
//             // -----------------

//             // - amount to treasury (admin)
//             adminLiquidationFeeMockFa12                     = mockFa12TokenProportion * adminLiquidationFee;
//             adminLiquidationFeeMockFa12                     = lendingHelper.convertLoanTokenToCollateralToken("mockFa2", "mockFa12", tokenOracles, adminLiquidationFeeMockFa12);

//             adminLiquidationFeeMockFa2                      = mockFa2TokenProportion * adminLiquidationFee;
//             adminLiquidationFeeMockFa2                      = lendingHelper.convertLoanTokenToCollateralToken("mockFa2", "mockFa2", tokenOracles, adminLiquidationFeeMockFa2);

//             adminLiquidationFeeTez                          = tezProportion * adminLiquidationFee;
//             adminLiquidationFeeTez                          = lendingHelper.convertLoanTokenToCollateralToken("mockFa2", "tez", tokenOracles, adminLiquidationFeeTez);
                
//             adminLiquidationFeeMvk                          = mvkProportion * adminLiquidationFee;
//             adminLiquidationFeeMvk                          = lendingHelper.convertLoanTokenToCollateralToken("mockFa2", "smvk", tokenOracles, adminLiquidationFeeMvk);

//             // - amount sent to liquidator
//             liquidationAmountWithIncentiveMockFa12          = mockFa12TokenProportion * liquidationAmountWithIncentive
//             liquidationAmountWithIncentiveMockFa12          = lendingHelper.convertLoanTokenToCollateralToken("mockFa2", "mockFa12", tokenOracles, liquidationAmountWithIncentiveMockFa12);

//             liquidationAmountWithIncentiveMockFa2           = mockFa2TokenProportion * liquidationAmountWithIncentive
//             liquidationAmountWithIncentiveMockFa2           = lendingHelper.convertLoanTokenToCollateralToken("mockFa2", "mockFa2", tokenOracles, liquidationAmountWithIncentiveMockFa2);

//             liquidationAmountWithIncentiveTez               = tezProportion * liquidationAmountWithIncentive
//             liquidationAmountWithIncentiveTez               = lendingHelper.convertLoanTokenToCollateralToken("mockFa2", "tez", tokenOracles, liquidationAmountWithIncentiveTez);

//             liquidationAmountWithIncentiveMvk               = mvkProportion * liquidationAmountWithIncentive
//             liquidationAmountWithIncentiveMvk               = lendingHelper.convertLoanTokenToCollateralToken("mockFa2", "smvk", tokenOracles, liquidationAmountWithIncentiveMvk);
            
//             // - total liquidated from vault
//             liquidationAmountWithFeesAndIncentiveMockFa12   = mockFa12TokenProportion * liquidationAmountWithFeesAndIncentive;
//             liquidationAmountWithFeesAndIncentiveMockFa12   = lendingHelper.convertLoanTokenToCollateralToken("mockFa2", "mockFa12", tokenOracles, liquidationAmountWithFeesAndIncentiveMockFa12);

//             liquidationAmountWithFeesAndIncentiveMockFa2    = mockFa2TokenProportion * liquidationAmountWithFeesAndIncentive;            
//             liquidationAmountWithFeesAndIncentiveMockFa2    = lendingHelper.convertLoanTokenToCollateralToken("mockFa2", "mockFa2", tokenOracles, liquidationAmountWithFeesAndIncentiveMockFa2);
    
//             liquidationAmountWithFeesAndIncentiveTez        = tezProportion * liquidationAmountWithFeesAndIncentive;
//             liquidationAmountWithFeesAndIncentiveTez        = lendingHelper.convertLoanTokenToCollateralToken("mockFa2", "tez", tokenOracles, liquidationAmountWithFeesAndIncentiveTez);

//             liquidationAmountWithFeesAndIncentiveMvk        = mvkProportion * liquidationAmountWithFeesAndIncentive;
//             liquidationAmountWithFeesAndIncentiveMvk        = lendingHelper.convertLoanTokenToCollateralToken("mockFa2", "smvk", tokenOracles, liquidationAmountWithFeesAndIncentiveMvk);

//             // - total liquidation amount
//             totalLiquidationAmountMockFa12                  = mockFa12TokenProportion * totalLiquidationAmount;
//             totalLiquidationAmountMockFa12                  = lendingHelper.convertLoanTokenToCollateralToken("mockFa2", "mockFa12", tokenOracles, totalLiquidationAmountMockFa12);

//             totalLiquidationAmountMockFa2                   = mockFa2TokenProportion * totalLiquidationAmount;
//             totalLiquidationAmountMockFa2                   = lendingHelper.convertLoanTokenToCollateralToken("mockFa2", "mockFa2", tokenOracles, totalLiquidationAmountMockFa2);

//             totalLiquidationAmountTez                       = tezProportion * totalLiquidationAmount;
//             totalLiquidationAmountTez                       = lendingHelper.convertLoanTokenToCollateralToken("mockFa2", "tez", tokenOracles, totalLiquidationAmountTez);

//             totalLiquidationAmountMvk                       = mvkProportion * totalLiquidationAmount;
//             totalLiquidationAmountMvk                       = lendingHelper.convertLoanTokenToCollateralToken("mockFa2", "smvk", tokenOracles, totalLiquidationAmountMvk);
    
//             // interest will be in the loan token type (i.e. mock FA2)
//             interestSentToTreasury                          = lendingHelper.calculateInterestSentToTreasury(interestTreasuryShare, totalInterestPaid)
//             interestRewards                        = lendingHelper.calculateInterestRewards(interestSentToTreasury, totalInterestPaid);

            
//             // ----------------------------------------------------------------------------------------------
//             // Liquidate vault operation
//             // ----------------------------------------------------------------------------------------------
    
//             console.log(" - ")
//             console.log('start vault liquidation');

//             // mallory sets operator for lending controller
//             updateOperatorsOperation = await mockFa2TokenInstance.methods.update_operators([
//                 {
//                     add_operator: {
//                         owner: liquidator,
//                         operator: lendingControllerAddress.address,
//                         token_id: 0,
//                     },
//                 }])
//                 .send()
//             await updateOperatorsOperation.confirmation();

//             // mallory sets operator for doorman
//             updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//             {
//                 add_operator: {
//                     owner: liquidator,
//                     operator: doormanAddress.address,
//                     token_id: 0,
//                 },
//             }])
//             .send()
//             await updateOperatorsOperation.confirmation();
    
//             liquidateVaultOperation = await lendingControllerInstance.methods.liquidateVault(vaultId, vaultOwner, liquidationAmount).send();
//             await liquidateVaultOperation.confirmation();


//             // ---------------------------------------
//             // after liquidation - get updated storage
//             // ---------------------------------------

    
//             // Update storage
//             lendingControllerStorage    = await lendingControllerInstance.storage();
//             mockFa12TokenStorage        = await mockFa12TokenInstance.storage();
//             doormanStorage              = await doormanInstance.storage();

//             // loan token record
//             loanTokenRecord             = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
//             updatedLoanTokenBorrowIndex = loanTokenRecord.borrowIndex;
    
//             // vault record
//             vaultRecord                 = await lendingControllerStorage.vaults.get(vaultHandle);
//             vaultLoanOutstandingTotal   = vaultRecord.loanOutstandingTotal;
//             vaultLoanPrincipalTotal     = vaultRecord.loanPrincipalTotal;
//             vaultLoanInterestTotal      = vaultRecord.loanInterestTotal;
//             vaultBorrowIndex            = vaultRecord.borrowIndex;
    
//             console.log('after liquidation');
//             console.log(vaultRecord);

//             // vault calculations
//             totalLiquidationAmount                  = lendingHelper.calculateTotalLiquidationAmount(liquidationAmount, vaultMaxLiquidationAmount);
//             totalInterestPaid                       = lendingHelper.calculateTotalInterestPaid(totalLiquidationAmount, vaultLoanInterestTotal);

//             loanOutstandingWithAccruedInterest      = lendingHelper.calculateAccruedInterest(initialVaultLoanOutstandingTotal, initialVaultBorrowIndex, updatedLoanTokenBorrowIndex);
//             totalInterest                           = loanOutstandingWithAccruedInterest - parseInt(initialVaultLoanPrincipalTotal);
//             remainingInterest                       = lendingHelper.calculateRemainingInterest(totalLiquidationAmount, totalInterest)

//             finalLoanOutstandingTotal               = lendingHelper.calculateFinalLoanOutstandingTotal(totalLiquidationAmount, loanOutstandingWithAccruedInterest);
//             finalLoanPrincipalTotal                 = lendingHelper.calculateFinalLoanPrincipalTotal(totalLiquidationAmount, loanOutstandingWithAccruedInterest, remainingInterest, initialVaultLoanPrincipalTotal);
//             finalLoanInterestTotal                  = lendingHelper.calculateFinalLoanInterestTotal(remainingInterest);

    
//             // ---------------------------------------
//             // get updated accounts and balances
//             // ---------------------------------------


//             // Vault Owner
//             vaultOwnerMockFa12TokenAccount          = await mockFa12TokenStorage.ledger.get(vaultOwner);            
//             vaultOwnerMockFa2TokenAccount           = await mockFa2TokenStorage.ledger.get(vaultOwner);            
//             vaultOwnerTezAccount                    = await utils.tezos.tz.getBalance(vaultOwner);
//             vaultOwnerStakedMvkAccount              = await doormanStorage.userStakeBalanceLedger.get(vaultOwner);

//             updatedVaultOwnerMockFa12TokenBalance   = vaultOwnerMockFa12TokenAccount == undefined ? 0 : parseInt(vaultOwnerMockFa12TokenAccount.balance);
//             updatedVaultOwnerMockFa2TokenBalance    = vaultOwnerMockFa2TokenAccount == undefined ? 0 : parseInt(vaultOwnerMockFa2TokenAccount);
//             updatedVaultOwnerTezBalance             = vaultOwnerTezAccount.toNumber();
//             updatedVaultOwnerStakedMvkBalance       = vaultOwnerStakedMvkAccount == undefined ? 0 : vaultOwnerStakedMvkAccount.balance.toNumber();
    
//             // ----
    
//             // Vault 
//             vaultMockFa12TokenAccount               = await mockFa12TokenStorage.ledger.get(vaultAddress);            
//             vaultMockFa2TokenAccount                = await mockFa2TokenStorage.ledger.get(vaultAddress);            
//             vaultTezAccount                         = await utils.tezos.tz.getBalance(vaultAddress);
//             vaultStakedMvkAccount                   = await doormanStorage.userStakeBalanceLedger.get(vaultAddress);

//             updatedVaultMockFa12TokenBalance        = vaultMockFa12TokenAccount == undefined ? 0 : parseInt(vaultMockFa12TokenAccount.balance);
//             updatedVaultMockFa2TokenBalance         = vaultMockFa2TokenAccount == undefined ? 0 : parseInt(vaultMockFa2TokenAccount);
//             updatedVaultTezBalance                  = vaultTezAccount.toNumber();
//             updatedVaultStakedMvkBalance            = vaultStakedMvkAccount == undefined ? 0 : vaultStakedMvkAccount.balance.toNumber();
    
//             // ----            
    
//             // Liquidator
//             liquidatorMockFa12TokenAccount          = await mockFa12TokenStorage.ledger.get(liquidator);            
//             liquidatorMockFa2TokenAccount           = await mockFa2TokenStorage.ledger.get(liquidator);            
//             liquidatorTezAccount                    = await utils.tezos.tz.getBalance(liquidator);
//             liquidatorStakedMvkAccount              = await doormanStorage.userStakeBalanceLedger.get(liquidator);

//             updatedLiquidatorMockFa12TokenBalance   = liquidatorMockFa12TokenAccount == undefined ? 0 : parseInt(liquidatorMockFa12TokenAccount.balance);
//             updatedLiquidatorMockFa2TokenBalance    = liquidatorMockFa2TokenAccount == undefined ? 0 : parseInt(liquidatorMockFa2TokenAccount);
//             updatedLiquidatorTezBalance             = liquidatorTezAccount.toNumber();
//             updatedLiquidatorStakedMvkBalance       = liquidatorStakedMvkAccount == undefined ? 0 : liquidatorStakedMvkAccount.balance.toNumber();
    
//             // ----            
    
//             // Treasury
//             treasuryMockFa12TokenAccount            = await mockFa12TokenStorage.ledger.get(treasuryAddress.address);            
//             treasuryMockFa2TokenAccount             = await mockFa2TokenStorage.ledger.get(treasuryAddress.address);            
//             treasuryTezAccount                      = await utils.tezos.tz.getBalance(treasuryAddress.address);
//             treasuryStakedMvkAccount                = await doormanStorage.userStakeBalanceLedger.get(treasuryAddress.address);

//             updatedTreasuryMockFa12TokenBalance     = treasuryMockFa12TokenAccount == undefined ? 0 : parseInt(treasuryMockFa12TokenAccount.balance);
//             updatedTreasuryMockFa2TokenBalance      = treasuryMockFa2TokenAccount == undefined ? 0 : parseInt(treasuryMockFa2TokenAccount);
//             updatedTreasuryTezBalance               = treasuryTezAccount.toNumber();
//             updatedTreasuryStakedMvkBalance         = treasuryStakedMvkAccount == undefined ? 0 : treasuryStakedMvkAccount.balance.toNumber();

//             // ----            

//             // Lending Controller
//             lendingControllerMockFa12TokenAccount         = await mockFa12TokenStorage.ledger.get(lendingControllerAddress.address);            
//             lendingControllerMockFa2TokenAccount          = await mockFa2TokenStorage.ledger.get(lendingControllerAddress.address);            
//             lendingControllerTezAccount                   = await utils.tezos.tz.getBalance(lendingControllerAddress.address);

//             updatedLendingControllerMockFa12TokenBalance  = lendingControllerMockFa12TokenAccount == undefined ? 0 : parseInt(lendingControllerMockFa12TokenAccount.balance);
//             updatedLendingControllerMockFa2TokenBalance   = lendingControllerMockFa2TokenAccount == undefined ? 0 : parseInt(lendingControllerMockFa2TokenAccount);
//             updatedLendingControllerTezBalance            = lendingControllerTezAccount.toNumber();

            
//             // --------------------------------------------------------
//             // Advanced test checks and assertions
//             // --------------------------------------------------------
            
//             // vault owner: check that there are no changes to the vault owner's balance
//             assert.equal(updatedVaultOwnerMockFa12TokenBalance  , initialVaultOwnerMockFa12TokenBalance);
//             assert.equal(updatedVaultOwnerMockFa2TokenBalance   , initialVaultOwnerMockFa2TokenBalance);
//             assert.equal(updatedVaultOwnerTezBalance            , initialVaultOwnerTezBalance);
//             assert.equal(updatedVaultOwnerStakedMvkBalance      , initialVaultOwnerStakedMvkBalance);
    
//             // vault: should have a total reduction in balance equal to liquidationAmountWithFeesAndIncentive
//             // - use of almostEqual as there may be a slight difference of 1 from rounding errors 
//             assert.equal(almostEqual(updatedVaultMockFa12TokenBalance   , initialVaultMockFa12TokenBalance - liquidationAmountWithFeesAndIncentiveMockFa12  , 0.0001), true);
//             assert.equal(almostEqual(updatedVaultMockFa2TokenBalance    , initialVaultMockFa2TokenBalance  - liquidationAmountWithFeesAndIncentiveMockFa2   , 0.0001), true);
//             assert.equal(almostEqual(updatedVaultTezBalance             , initialVaultTezBalance           - liquidationAmountWithFeesAndIncentiveTez       , 0.0001), true);
//             assert.equal(almostEqual(updatedVaultStakedMvkBalance       , initialVaultStakedMvkBalance     - liquidationAmountWithFeesAndIncentiveMvk       , 0.0001), true);
            
//             // liquidator: uses Mock FA-2 tokens to liquidate and receives other collateral tokens from vault collateral
//             // - tez: account for gas cost of sending liquidateVault operation
//             assert.equal(updatedLiquidatorMockFa12TokenBalance, initialLiquidatorMockFa12TokenBalance + liquidationAmountWithIncentiveMockFa12);
//             assert.equal(updatedLiquidatorMockFa2TokenBalance, initialLiquidatorMockFa2TokenBalance - liquidationAmount + liquidationAmountWithIncentiveMockFa2);
//             assert.equal(almostEqual(updatedLiquidatorTezBalance, initialLiquidatorTezBalance + liquidationAmountWithIncentiveTez, 0.0001), true);
//             assert.equal(updatedLiquidatorStakedMvkBalance, initialLiquidatorStakedMvkBalance + liquidationAmountWithIncentiveMvk);
    
//             // treasury should receive both admin fee and share from interest repaid (if there is interest)
//             // - no interest paid
//             assert.equal(updatedTreasuryMockFa12TokenBalance, initialTreasuryMockFa12TokenBalance + adminLiquidationFeeMockFa12);
//             assert.equal(almostEqual(updatedTreasuryMockFa2TokenBalance, initialTreasuryMockFa2TokenBalance + adminLiquidationFeeMockFa2, 0.0001), true);
//             assert.equal(updatedTreasuryTezBalance, initialTreasuryTezBalance + adminLiquidationFeeTez);
//             assert.equal(updatedTreasuryStakedMvkBalance, initialTreasuryStakedMvkBalance + adminLiquidationFeeMvk);
    
//             // reward pool should receive interest share from total interest paid
//             // - no interest paid
//             assert.equal(updatedLendingControllerMockFa12TokenBalance, initialLendingControllerMockFa12TokenBalance);
    
//             // check vault records 
//             // - there could be some accrued interest leftover as the liquidation amount is very small (e.g. 0.0001 Mock FA2 token ~ $0.00035)
//             assert.equal(vaultLoanOutstandingTotal, finalLoanOutstandingTotal);
//             assert.equal(parseInt(vaultLoanPrincipalTotal), parseInt(finalLoanPrincipalTotal));
//             assert.equal(vaultLoanInterestTotal, finalLoanInterestTotal);
    
//         })    

//     })



//     describe('%closeVault - test close vault', function () {

//         it('user (eve) can close her vaults (single collateral token) - open, borrow, repay all after one day, close - [Collateral Token: Mock FA-12, Mock FA-2, Tez, MVK | Loan Token: Mock FA-12]', async () => {

//             // init variables and storage
//             lendingControllerStorage = await lendingControllerInstance.storage();
//             doormanStorage           = await doormanInstance.storage();
//             vaultFactoryStorage      = await vaultFactoryInstance.storage();

//             currentMockLevel         = lendingControllerStorage.mockLevel;

//             // ----------------------------------------------------------------------------------------------
//             // Reset token prices back to default
//             // ----------------------------------------------------------------------------------------------

//             // reset token prices
//             mockFa12TokenIndex                  = lendingHelper.defaultPriceObservations.findIndex((o => o.name === "mockFa12"));
//             mockFa2TokenIndex                   = lendingHelper.defaultPriceObservations.findIndex((o => o.name === "mockFa2"));
//             tezIndex                            = lendingHelper.defaultPriceObservations.findIndex((o => o.name === "tez"));
//             mvkIndex                            = lendingHelper.defaultPriceObservations.findIndex((o => o.name === "smvk"));

//             round = 1;

//             // ---------------------------------
//             // Reset Mock FA-12 token prices to default observation data
//             // ---------------------------------

//             epoch = await mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.epoch;
//             epoch = parseInt(epoch) + 1;            
//             defaultObservations = lendingHelper.defaultPriceObservations[mockFa12TokenIndex].observations;
//             await setTokenPrice(epoch, round, defaultObservations, "mockFa12");

//             const mockFa12TokenMedianPrice = lendingHelper.defaultPriceObservations[mockFa12TokenIndex].medianPrice;
//             tokenOracles[mockFa12TokenIndex].price = mockFa12TokenMedianPrice;

//             mockUsdMockFa12TokenAggregatorStorage = await mockUsdMockFa12TokenAggregatorInstance.storage();
//             assert.deepEqual(mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.round,new BigNumber(round));
//             assert.deepEqual(mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.epoch,new BigNumber(epoch));
//             assert.deepEqual(mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.data,new BigNumber(mockFa12TokenMedianPrice));
//             assert.deepEqual(mockUsdMockFa12TokenAggregatorStorage.lastCompletedData.percentOracleResponse,new BigNumber(4));

//             // ---------------------------------
//             // Reset Mock FA-2 token prices to default observation data
//             // ---------------------------------

//             epoch = await mockUsdMockFa2TokenAggregatorStorage.lastCompletedData.epoch;
//             epoch = parseInt(epoch) + 1;            
//             defaultObservations = lendingHelper.defaultPriceObservations[mockFa2TokenIndex].observations;
//             await setTokenPrice(epoch, round, defaultObservations, "mockFa2");

//             const mockFa2TokenMedianPrice = lendingHelper.defaultPriceObservations[mockFa2TokenIndex].medianPrice;
//             tokenOracles[mockFa2TokenIndex].price = mockFa2TokenMedianPrice;

//             mockUsdMockFa2TokenAggregatorStorage = await mockUsdMockFa2TokenAggregatorInstance.storage();
//             assert.deepEqual(mockUsdMockFa2TokenAggregatorStorage.lastCompletedData.round,new BigNumber(round));
//             assert.deepEqual(mockUsdMockFa2TokenAggregatorStorage.lastCompletedData.epoch,new BigNumber(epoch));
//             assert.deepEqual(mockUsdMockFa2TokenAggregatorStorage.lastCompletedData.data,new BigNumber(mockFa2TokenMedianPrice));
//             assert.deepEqual(mockUsdMockFa2TokenAggregatorStorage.lastCompletedData.percentOracleResponse,new BigNumber(4));

//             // ---------------------------------
//             // Reset tez prices to default observation data
//             // ---------------------------------

//             epoch = await mockUsdXtzAggregatorStorage.lastCompletedData.epoch;
//             epoch = parseInt(epoch) + 1;            
//             defaultObservations = lendingHelper.defaultPriceObservations[tezIndex].observations;
//             await setTokenPrice(epoch, round, defaultObservations, "tez");

//             const tezMedianPrice = lendingHelper.defaultPriceObservations[tezIndex].medianPrice;
//             tokenOracles[tezIndex].price = tezMedianPrice;

//             mockUsdXtzAggregatorStorage = await mockUsdXtzAggregatorInstance.storage();
//             assert.deepEqual(mockUsdXtzAggregatorStorage.lastCompletedData.round,new BigNumber(round));
//             assert.deepEqual(mockUsdXtzAggregatorStorage.lastCompletedData.epoch,new BigNumber(epoch));
//             assert.deepEqual(mockUsdXtzAggregatorStorage.lastCompletedData.data,new BigNumber(tezMedianPrice));
//             assert.deepEqual(mockUsdXtzAggregatorStorage.lastCompletedData.percentOracleResponse,new BigNumber(4));

//             // ---------------------------------
//             // Reset mvk prices to default observation data
//             // ---------------------------------

//             epoch = await mockUsdMvkAggregatorStorage.lastCompletedData.epoch;
//             epoch = parseInt(epoch) + 1;            
//             defaultObservations = lendingHelper.defaultPriceObservations[mvkIndex].observations;
//             await setTokenPrice(epoch, round, defaultObservations, "smvk");

//             const mvkMedianPrice = lendingHelper.defaultPriceObservations[mvkIndex].medianPrice;
//             tokenOracles[mvkIndex].price = mvkMedianPrice;

//             mockUsdMvkAggregatorStorage = await mockUsdMvkAggregatorInstance.storage();
//             assert.deepEqual(mockUsdMvkAggregatorStorage.lastCompletedData.round,new BigNumber(round));
//             assert.deepEqual(mockUsdMvkAggregatorStorage.lastCompletedData.epoch,new BigNumber(epoch));
//             assert.deepEqual(mockUsdMvkAggregatorStorage.lastCompletedData.data,new BigNumber(mvkMedianPrice));
//             assert.deepEqual(mockUsdMvkAggregatorStorage.lastCompletedData.percentOracleResponse,new BigNumber(4));


//             // ----------------------------------------------------------------------------------------------
//             // Create Vault
//             // ----------------------------------------------------------------------------------------------


//             await signerFactory(eve.sk);

//             const vaultCounter  = vaultFactoryStorage.vaultCounter;
//             const vaultId       = parseInt(vaultCounter);
//             const vaultOwner    = eve.pkh;
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

//             console.log('   - vault originated: ' + vaultAddress);
//             console.log('   - vault id: ' + vaultId);

//             // push new vault id to vault set
//             eveVaultSet.push(vaultId);


//             // ----------------------------------------------------------------------------------------------
//             // Deposit Collateral into Vault
//             // ----------------------------------------------------------------------------------------------


//             const mockFa12DepositAmount  = 10000000;      // 10 Mock FA12 Tokens - USD $15.00
//             const mockFa2DepositAmount   = 10000000;      // 10 Mock FA12 Tokens - USD $35.00
//             const tezDepositAmount       = 10000000;      // 10 Tez - USD $18.00
//             const mvkDepositAmount       = 10000000000;   // 10 MVK - USD $10.00
    
//             // Total: $78.00
    
//             // ---------------------------------
//             // Deposit Mock FA12 Tokens
//             // ---------------------------------
    
//             // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
//             // reset token allowance
//             resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
//                 vaultAddress,
//                 0
//             ).send();
//             await resetTokenAllowance.confirmation();
    
//             // set new token allowance
//             setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
//                 vaultAddress,
//                 mockFa12DepositAmount
//             ).send();
//             await setNewTokenAllowance.confirmation();
    
//             // eve deposits mock FA12 tokens into vault
//             const eveDepositMockFa12TokenOperation  = await vaultInstance.methods.deposit(
//                 mockFa12DepositAmount,           
//                 "mockFa12"
//             ).send();
//             await eveDepositMockFa12TokenOperation.confirmation();
    
//             // ---------------------------------
//             // Deposit Mock FA2 Tokens
//             // ---------------------------------
    
//             // eve sets operator for lending controller
//             updateOperatorsOperation = await mockFa2TokenInstance.methods.update_operators([
//             {
//                 add_operator: {
//                     owner: vaultOwner,
//                     operator: vaultAddress,
//                     token_id: 0,
//                 },
//             }]).send()
//             await updateOperatorsOperation.confirmation();
    
//             // eve deposits mock FA2 tokens into vault
//             const eveDepositMockFa2TokenOperation  = await vaultInstance.methods.deposit(
//                 mockFa2DepositAmount,           
//                 "mockFa2"
//             ).send();
//             await eveDepositMockFa2TokenOperation.confirmation();
    
//             // ---------------------------------
//             // Deposit Tez
//             // ---------------------------------
    
//             const eveDepositTezOperation  = await vaultInstance.methods.deposit(
//                     tezDepositAmount,  // amt
//                     "tez"              // token
//             ).send({ mutez : true, amount : tezDepositAmount });
//             await eveDepositTezOperation.confirmation();
    
//             // ---------------------------------
//             // Deposit Staked MVK
//             // ---------------------------------

//             // eve set doorman as operator for vault
//             updateOperatorsOperation = await vaultInstance.methods.updateMvkOperators([
//             {
//                 add_operator: {
//                     owner: vaultAddress,
//                     operator: doormanAddress.address,
//                     token_id: 0,
//                 },
//             }]).send();
//             await updateOperatorsOperation.confirmation();
    
//             // vault staked mvk operation
//             const eveVaultDepositStakedMvkOperation  = await lendingControllerInstance.methods.vaultDepositStakedMvk(
//                 vaultId,                 
//                 mvkDepositAmount                            
//             ).send();
//             await eveVaultDepositStakedMvkOperation.confirmation();
    
//             console.log('   - vault collateral deposited: Mock FA-12 Tokens: ' + mockFa12DepositAmount + " | Mock FA-2 Tokens: " + mockFa12DepositAmount + " | Tez: " + tezDepositAmount + " | sMVK: " + mvkDepositAmount);
    

//             // ----------------------------------------------------------------------------------------------
//             // Borrow with Vault
//             // ----------------------------------------------------------------------------------------------


//             // borrow amount - 5 Mock FA12 Tokens
//             const borrowAmount = 5000000;   

//             // borrow operation
//             const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
//             await eveBorrowOperation.confirmation();

//             console.log('   - borrowed: ' + borrowAmount + " | type: " + loanTokenName);

//             mockFa12TokenStorage                    = await mockFa12TokenInstance.storage();
//             mockFa2TokenStorage                     = await mockFa2TokenInstance.storage();
//             lendingControllerStorage                = await lendingControllerInstance.storage();
//             doormanStorage                          = await doormanInstance.storage();

//             // vault record
//             vaultRecord                             = await lendingControllerStorage.vaults.get(vaultHandle);
//             initialVaultLoanOutstandingTotal        = vaultRecord.loanOutstandingTotal;
//             initialVaultLoanPrincipalTotal          = vaultRecord.loanPrincipalTotal;
//             initialVaultBorrowIndex                 = vaultRecord.borrowIndex;

//             // Vault Owner
//             vaultOwnerMockFa12TokenAccount          = await mockFa12TokenStorage.ledger.get(vaultOwner);            
//             vaultOwnerMockFa2TokenAccount           = await mockFa2TokenStorage.ledger.get(vaultOwner);            
//             vaultOwnerTezAccount                    = await utils.tezos.tz.getBalance(vaultOwner);
//             vaultOwnerStakedMvkAccount              = await doormanStorage.userStakeBalanceLedger.get(vaultOwner);

//             initialVaultOwnerMockFa12TokenBalance   = vaultOwnerMockFa12TokenAccount == undefined ? 0 : parseInt(vaultOwnerMockFa12TokenAccount.balance);
//             initialVaultOwnerMockFa2TokenBalance    = vaultOwnerMockFa2TokenAccount == undefined ? 0 : parseInt(vaultOwnerMockFa2TokenAccount);
//             initialVaultOwnerTezBalance             = vaultOwnerTezAccount.toNumber();
//             initialVaultOwnerStakedMvkBalance       = vaultOwnerStakedMvkAccount == undefined ? 0 : vaultOwnerStakedMvkAccount.balance.toNumber();
            
//             // ----
    
//             // Vault 
//             vaultMockFa12TokenAccount               = await mockFa12TokenStorage.ledger.get(vaultAddress);            
//             vaultMockFa2TokenAccount                = await mockFa2TokenStorage.ledger.get(vaultAddress);            
//             vaultTezAccount                         = await utils.tezos.tz.getBalance(vaultAddress);
//             vaultStakedMvkAccount                   = await doormanStorage.userStakeBalanceLedger.get(vaultAddress);

//             initialVaultMockFa12TokenBalance        = vaultMockFa12TokenAccount == undefined ? 0 : parseInt(vaultMockFa12TokenAccount.balance);
//             initialVaultMockFa2TokenBalance         = vaultMockFa2TokenAccount == undefined ? 0 : parseInt(vaultMockFa2TokenAccount);
//             initialVaultTezBalance                  = vaultTezAccount.toNumber();
//             initialVaultStakedMvkBalance            = vaultStakedMvkAccount == undefined ? 0 : vaultStakedMvkAccount.balance.toNumber();

            
//             // ----------------------------------------------------------------------------------------------
//             // Set Block Levels For Mock Time Test - 1 month
//             // ----------------------------------------------------------------------------------------------


//             await signerFactory(bob.sk); // temporarily set to tester to increase block levels

//             lendingControllerStorage    = await lendingControllerInstance.storage();
//             vaultRecord                 = await lendingControllerStorage.vaults.get(vaultHandle);
//             lastUpdatedBlockLevel       = vaultRecord.lastUpdatedBlockLevel;

//             const monthsPassed  = 1; 
//             mockLevelChange = monthsPassed * oneMonthLevelBlocks;
//             newMockLevel = parseInt(lastUpdatedBlockLevel) + mockLevelChange;

//             const setMockLevelOperationOne = await lendingControllerInstance.methods.updateConfig(newMockLevel, 'configMockLevel').send();
//             await setMockLevelOperationOne.confirmation();

//             lendingControllerStorage = await lendingControllerInstance.storage();
//             currentMockLevel = lendingControllerStorage.config.mockLevel;

//             assert.equal(currentMockLevel, newMockLevel);

//             console.log('   - time set to ' + monthsPassed + ' months ahead: ' + lastUpdatedBlockLevel + ' to ' + newMockLevel + ' | Changed by: ' + mockLevelChange);


//             // ----------------------------------------------------------------------------------------------
//             // Calculate new loan outstanding with accrued interest
//             // ----------------------------------------------------------------------------------------------


//             await signerFactory(eve.sk); // mallory as liquidator

//             lendingControllerStorage   = await lendingControllerInstance.storage();
//             vaultRecord                = await lendingControllerStorage.vaults.get(vaultHandle);

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
//             totalInterest                           = parseInt(initialVaultLoanPrincipalTotal) > loanOutstandingWithAccruedInterest ? 0 :  loanOutstandingWithAccruedInterest - parseInt(initialVaultLoanPrincipalTotal);

//             // check that calculations are correct - use of almostEqual as there may be a slight difference of 1 from rounding errors 
//             assert.equal(almostEqual(vaultLoanOutstandingTotal, loanOutstandingWithAccruedInterest, 0.0001), true);
//             assert.equal(almostEqual(vaultLoanInterestTotal, totalInterest, 0.0001), true);
            
//             // ----------------------------------------------------------------------------------------------
//             // Fail test to close vault if there is still loan outstanding
//             // ----------------------------------------------------------------------------------------------


//             const failCloseVaultOperation = await lendingControllerInstance.methods.closeVault(vaultId);
//             await chai.expect(failCloseVaultOperation.send()).to.be.rejected;    


//             // ----------------------------------------------------------------------------------------------
//             // Repay all loans and test refund
//             // ----------------------------------------------------------------------------------------------


//             // repayment amount - set greater than loan outstanding to test refund
//             const overflowRefundAmount = 1000000; // 1 Mock FA-2 Token
//             const repayAmount          = loanOutstandingWithAccruedInterest + overflowRefundAmount; 

//             // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
//             // reset token allowance
//             resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
//                 lendingControllerMockTimeAddress.address,
//                 0
//             ).send();
//             await resetTokenAllowance.confirmation();

//             // set new token allowance
//             setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
//                 lendingControllerMockTimeAddress.address,
//                 repayAmount
//             ).send();
//             await setNewTokenAllowance.confirmation();

//             // repay operation
//             const eveRepayOperation = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send();
//             await eveRepayOperation.confirmation();

//             console.log('   - repaid: ' + repayAmount + " | type: " + loanTokenName);

//             // update storage
//             mockFa12TokenStorage     = await mockFa12TokenInstance.storage();
//             mockFa2TokenStorage      = await mockFa2TokenInstance.storage();
//             lendingControllerStorage = await lendingControllerInstance.storage();
//             doormanStorage           = await doormanInstance.storage();
//             tempMap                  = lendingControllerStorage.tempMap;


//             // vault record
//             vaultRecord                 = await lendingControllerStorage.vaults.get(vaultHandle);
//             vaultLoanOutstandingTotal   = vaultRecord.loanOutstandingTotal;
//             vaultLoanPrincipalTotal     = vaultRecord.loanPrincipalTotal;
//             vaultLoanInterestTotal      = vaultRecord.loanInterestTotal;
//             vaultBorrowIndex            = vaultRecord.borrowIndex;

//             // loan token record
//             loanTokenRecord              = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
//             updatedLoanTokenBorrowIndex  = loanTokenRecord.borrowIndex;
            
//             // check that vault borrow index is equal to loan token borrow index
//             assert.equal(parseInt(vaultBorrowIndex), parseInt(updatedLoanTokenBorrowIndex));


//             // check if repayAmount covers whole or partial of total interest 
//             loanOutstandingWithAccruedInterest      = lendingHelper.calculateAccruedInterest(initialVaultLoanOutstandingTotal, initialVaultBorrowIndex, updatedLoanTokenBorrowIndex);
//             totalInterest                           = parseInt(initialVaultLoanPrincipalTotal) > loanOutstandingWithAccruedInterest ? 0 :  loanOutstandingWithAccruedInterest - parseInt(initialVaultLoanPrincipalTotal);
//             totalInterestPaid                       = lendingHelper.calculateTotalInterestPaid(repayAmount, vaultLoanInterestTotal);
//             remainingInterest                       = lendingHelper.calculateRemainingInterest(repayAmount, totalInterest);

//             finalLoanOutstandingTotal               = lendingHelper.calculateFinalLoanOutstandingTotal(repayAmount, loanOutstandingWithAccruedInterest);
//             finalLoanPrincipalTotal                 = lendingHelper.calculateFinalLoanPrincipalTotal(repayAmount, loanOutstandingWithAccruedInterest, remainingInterest, initialVaultLoanPrincipalTotal);
//             finalLoanInterestTotal                  = lendingHelper.calculateFinalLoanInterestTotal(remainingInterest);


//             // check that calculations are correct and that loans are now 0
//             assert.equal(vaultLoanOutstandingTotal, finalLoanOutstandingTotal);
//             assert.equal(vaultLoanOutstandingTotal, 0);

//             assert.equal(vaultLoanPrincipalTotal, finalLoanPrincipalTotal);
//             assert.equal(vaultLoanPrincipalTotal, 0);

//             assert.equal(vaultLoanInterestTotal, finalLoanInterestTotal);
//             assert.equal(vaultLoanInterestTotal, 0);


//             // Vault Owner
//             vaultOwnerMockFa12TokenAccount          =  await mockFa12TokenStorage.ledger.get(vaultOwner);            
//             vaultOwnerMockFa2TokenAccount           =  await mockFa2TokenStorage.ledger.get(vaultOwner);            
//             vaultOwnerTezAccount                    = await utils.tezos.tz.getBalance(vaultOwner);
//             vaultOwnerStakedMvkAccount              = await doormanStorage.userStakeBalanceLedger.get(vaultOwner);

//             updatedVaultOwnerMockFa12TokenBalance   = vaultOwnerMockFa12TokenAccount == undefined ? 0 : parseInt(vaultOwnerMockFa12TokenAccount.balance);
//             updatedVaultOwnerMockFa2TokenBalance    = vaultOwnerMockFa2TokenAccount == undefined ? 0 : parseInt(vaultOwnerMockFa2TokenAccount);
//             updatedVaultOwnerTezBalance             = vaultOwnerTezAccount.toNumber();
//             updatedVaultOwnerStakedMvkBalance       = vaultOwnerStakedMvkAccount == undefined ? 0 : vaultOwnerStakedMvkAccount.balance.toNumber();
    
//             // ----
    
//             // Vault 
//             vaultMockFa12TokenAccount               =  await mockFa12TokenStorage.ledger.get(vaultAddress);            
//             vaultMockFa2TokenAccount                =  await mockFa2TokenStorage.ledger.get(vaultAddress);            
//             vaultTezAccount                         = await utils.tezos.tz.getBalance(vaultAddress);
//             vaultStakedMvkAccount                   = await doormanStorage.userStakeBalanceLedger.get(vaultAddress);

//             updatedVaultMockFa12TokenBalance        = vaultMockFa12TokenAccount == undefined ? 0 : parseInt(vaultMockFa12TokenAccount.balance);
//             updatedVaultMockFa2TokenBalance         = vaultMockFa2TokenAccount == undefined ? 0 : parseInt(vaultMockFa2TokenAccount);
//             updatedVaultTezBalance                  = vaultTezAccount.toNumber();
//             updatedVaultStakedMvkBalance            = vaultStakedMvkAccount == undefined ? 0 : vaultStakedMvkAccount.balance.toNumber();
    

//             // check that repay amount refunds the overflow amount
//             assert.equal(updatedVaultOwnerMockFa12TokenBalance, initialVaultOwnerMockFa12TokenBalance - loanOutstandingWithAccruedInterest);

//             // check that there are no changes to vault collateral balance
//             assert.equal(updatedVaultMockFa12TokenBalance, initialVaultMockFa12TokenBalance);
//             assert.equal(updatedVaultMockFa2TokenBalance, initialVaultMockFa2TokenBalance);
//             assert.equal(updatedVaultTezBalance, initialVaultTezBalance);
//             assert.equal(updatedVaultStakedMvkBalance, initialVaultStakedMvkBalance);

            
//             // ----------------------------------------------------------------------------------------------
//             // After repayment of loans - Close vault operation
//             // ----------------------------------------------------------------------------------------------


//             // set balances for comparison below
//             initialVaultOwnerMockFa12TokenBalance = updatedVaultOwnerMockFa12TokenBalance
//             initialVaultOwnerMockFa2TokenBalance  = updatedVaultOwnerMockFa2TokenBalance
//             initialVaultOwnerTezBalance           = updatedVaultOwnerTezBalance
//             initialVaultOwnerStakedMvkBalance     = updatedVaultOwnerStakedMvkBalance

//             initialVaultMockFa12TokenBalance      = updatedVaultMockFa12TokenBalance
//             initialVaultMockFa2TokenBalance       = updatedVaultMockFa2TokenBalance
//             initialVaultTezBalance                = updatedVaultTezBalance
//             initialVaultStakedMvkBalance          = updatedVaultStakedMvkBalance


//             // update storage
//             mockFa12TokenStorage     = await mockFa12TokenInstance.storage();
//             mockFa2TokenStorage      = await mockFa2TokenInstance.storage();
//             lendingControllerStorage = await lendingControllerInstance.storage();
//             doormanStorage           = await doormanInstance.storage();
//             vaultRecord              = await lendingControllerStorage.vaults.get(vaultHandle);


//             // get remaining collateral token balance in vault 
//             const remainingMockFa12CollateralBalance    = await vaultRecord.collateralBalanceLedger.get('mockFa12');
//             const remainingMockFa2CollateralBalance     = await vaultRecord.collateralBalanceLedger.get('mockFa2');
//             const remainingTezCollateralBalance         = await vaultRecord.collateralBalanceLedger.get('tez');
//             const remainingStakedMvkCollateralBalance   = await vaultRecord.collateralBalanceLedger.get("smvk");
            
//             console.log('   - remaining collateral: Mock FA12 token: ' + remainingMockFa12CollateralBalance + ' | Mock FA2 token: ' + remainingMockFa2CollateralBalance + ' | Tez: ' + remainingTezCollateralBalance + ' | Staked MVK: ' + remainingStakedMvkCollateralBalance);

//             // close vault operation
//             const closeVaultOperation = await lendingControllerInstance.methods.closeVault(vaultId).send();
//             await closeVaultOperation.confirmation();
//             console.log('   - close vault id: ' + vaultId);

//             // Vault Owner
//             vaultOwnerMockFa12TokenAccount          =  await mockFa12TokenStorage.ledger.get(vaultOwner);            
//             vaultOwnerMockFa2TokenAccount           =  await mockFa2TokenStorage.ledger.get(vaultOwner);            
//             vaultOwnerTezAccount                    = await utils.tezos.tz.getBalance(vaultOwner);
//             vaultOwnerStakedMvkAccount              = await doormanStorage.userStakeBalanceLedger.get(vaultOwner);

//             updatedVaultOwnerMockFa12TokenBalance   = vaultOwnerMockFa12TokenAccount == undefined ? 0 : parseInt(vaultOwnerMockFa12TokenAccount.balance);
//             updatedVaultOwnerMockFa2TokenBalance    = vaultOwnerMockFa2TokenAccount == undefined ? 0 : parseInt(vaultOwnerMockFa2TokenAccount);
//             updatedVaultOwnerTezBalance             = vaultOwnerTezAccount.toNumber();
//             updatedVaultOwnerStakedMvkBalance       = vaultOwnerStakedMvkAccount == undefined ? 0 : vaultOwnerStakedMvkAccount.balance.toNumber();
    

//             // check that vault owner receives the remaining collateral balances
//             assert.equal(updatedVaultOwnerMockFa12TokenBalance  , initialVaultOwnerMockFa12TokenBalance  + parseInt(remainingMockFa12CollateralBalance));
//             assert.equal(updatedVaultOwnerMockFa2TokenBalance   , initialVaultOwnerMockFa2TokenBalance   + parseInt(remainingMockFa2CollateralBalance));
//             assert.equal(updatedVaultOwnerStakedMvkBalance      , initialVaultOwnerStakedMvkBalance      + parseInt(remainingStakedMvkCollateralBalance));
//             // account for minor difference from gas cost to transact operation
//             assert.equal(almostEqual(updatedVaultOwnerTezBalance  , initialVaultOwnerTezBalance          + parseInt(remainingTezCollateralBalance), 0.0001), true);

//             // update storage
//             lendingControllerStorage   = await lendingControllerInstance.storage();
//             vaultRecord                = await lendingControllerStorage.vaults.get(vaultHandle);

//             // check that vault has been removed, and is now undefined
//             assert.equal(vaultRecord, undefined);

//         })

//     })

// });


// // ----------------------
// //
// // CONSOLE LOGS 
// //
// // ----------------------


//     // ----------------------
//     // CHANGES IN BALANCES
//     // ----------------------

//     // console.log("---");
//     // console.log("vault owner");
//     // console.log("-");

//     // console.log("initialVaultOwnerMockFa12TokenBalance: "+ initialVaultOwnerMockFa12TokenBalance);
//     // console.log("updatedVaultOwnerMockFa12TokenBalance: "+ updatedVaultOwnerMockFa12TokenBalance);
//     // console.log("change: "+ (updatedVaultOwnerMockFa12TokenBalance - initialVaultOwnerMockFa12TokenBalance));

//     // console.log("-");

//     // console.log("initialVaultOwnerMockFa2TokenBalance: "+ initialVaultOwnerMockFa2TokenBalance);
//     // console.log("updatedVaultOwnerMockFa2TokenBalance: "+ updatedVaultOwnerMockFa2TokenBalance);
//     // console.log("change: "+ (updatedVaultOwnerMockFa2TokenBalance - initialVaultOwnerMockFa2TokenBalance));

//     // console.log("-");

//     // console.log("initialVaultOwnerTezBalance: "+ initialVaultOwnerTezBalance);
//     // console.log("updatedVaultOwnerTezBalance: "+ updatedVaultOwnerTezBalance);
//     // console.log("change: "+ (updatedVaultOwnerTezBalance - initialVaultOwnerTezBalance));

//     // console.log("-");

//     // console.log("initialVaultOwnerStakedMvkBalance: "+ initialVaultOwnerStakedMvkBalance);
//     // console.log("updatedVaultOwnerStakedMvkBalance: "+ updatedVaultOwnerStakedMvkBalance);
//     // console.log("change: "+ (updatedVaultOwnerStakedMvkBalance - initialVaultOwnerStakedMvkBalance));
//     // console.log("---");


//     // console.log("");


//     // console.log("---");
//     // console.log("vault");
//     // console.log("-");

//     // console.log("initialVaultMockFa12TokenBalance: "+ initialVaultMockFa12TokenBalance);
//     // console.log("updatedVaultMockFa12TokenBalance: "+ updatedVaultMockFa12TokenBalance);
//     // console.log("change: "+ (updatedVaultMockFa12TokenBalance - initialVaultMockFa12TokenBalance));

//     // console.log("-");

//     // console.log("initialVaultMockFa2TokenBalance: "+ initialVaultMockFa2TokenBalance);
//     // console.log("updatedVaultMockFa2TokenBalance: "+ updatedVaultMockFa2TokenBalance);
//     // console.log("change: "+ (updatedVaultMockFa2TokenBalance - initialVaultMockFa2TokenBalance));

//     // console.log("-");

//     // console.log("initialVaultTezBalance: "+ initialVaultTezBalance);
//     // console.log("updatedVaultTezBalance: "+ updatedVaultTezBalance);
//     // console.log("change: "+ (updatedVaultTezBalance - initialVaultTezBalance));

//     // console.log("-");

//     // console.log("initialVaultStakedMvkBalance: "+ initialVaultStakedMvkBalance);
//     // console.log("updatedVaultStakedMvkBalance: "+ updatedVaultStakedMvkBalance);
//     // console.log("change: "+ (updatedVaultStakedMvkBalance - initialVaultStakedMvkBalance));

//     // console.log("---");


//     // console.log("");


//     // console.log("---");
//     // console.log("liquidator");
//     // console.log("-");

//     // console.log("initialLiquidatorMockFa12TokenBalance: "+ initialLiquidatorMockFa12TokenBalance);
//     // console.log("updatedLiquidatorMockFa12TokenBalance: "+ updatedLiquidatorMockFa12TokenBalance);
//     // console.log("change: "+ (updatedLiquidatorMockFa12TokenBalance - initialLiquidatorMockFa12TokenBalance));

//     // console.log("-");

//     // console.log("initialLiquidatorMockFa2TokenBalance: "+ initialLiquidatorMockFa2TokenBalance);
//     // console.log("updatedLiquidatorMockFa2TokenBalance: "+ updatedLiquidatorMockFa2TokenBalance);
//     // console.log("change: "+ (updatedLiquidatorMockFa2TokenBalance - initialLiquidatorMockFa2TokenBalance));

//     // console.log("-");

//     // console.log("initialLiquidatorTezBalance: "+ initialLiquidatorTezBalance);
//     // console.log("updatedLiquidatorTezBalance: "+ updatedLiquidatorTezBalance);
//     // console.log("change: "+ (updatedLiquidatorTezBalance - initialLiquidatorTezBalance));

//     // console.log("-");

//     // console.log("initialLiquidatorStakedMvkBalance: "+ initialLiquidatorStakedMvkBalance);
//     // console.log("updatedLiquidatorStakedMvkBalance: "+ updatedLiquidatorStakedMvkBalance);
//     // console.log("change: "+ (updatedLiquidatorStakedMvkBalance - initialLiquidatorStakedMvkBalance));
//     // console.log("---");


//     // console.log("");


//     // console.log("---");
//     // console.log("treasury");
//     // console.log("---");

//     // console.log("initialTreasuryMockFa12TokenBalance: "+ initialTreasuryMockFa12TokenBalance);
//     // console.log("updatedTreasuryMockFa12TokenBalance: "+ updatedTreasuryMockFa12TokenBalance);
//     // console.log("change: "+ (updatedTreasuryMockFa12TokenBalance - initialTreasuryMockFa12TokenBalance));

//     // console.log("-");

//     // console.log("initialTreasuryMockFa2TokenBalance: "+ initialTreasuryMockFa2TokenBalance);
//     // console.log("updatedTreasuryMockFa2TokenBalance: "+ updatedTreasuryMockFa2TokenBalance);
//     // console.log("change: "+ (updatedTreasuryMockFa2TokenBalance - initialTreasuryMockFa2TokenBalance));

//     // console.log("-");

//     // console.log("initialTreasuryTezBalance: "+ initialTreasuryTezBalance);
//     // console.log("updatedTreasuryTezBalance: "+ updatedTreasuryTezBalance);
//     // console.log("change: "+ (updatedTreasuryTezBalance - initialTreasuryTezBalance));

//     // console.log("-");

//     // console.log("initialTreasuryStakedMvkBalance: "+ initialTreasuryStakedMvkBalance);
//     // console.log("updatedTreasuryStakedMvkBalance: "+ updatedTreasuryStakedMvkBalance);
//     // console.log("change: "+ (updatedTreasuryStakedMvkBalance - initialTreasuryStakedMvkBalance));

//     // console.log("---");

//     // console.log("");


//     // console.log("---");
//     // console.log("lending controller");
//     // console.log("-");

//     // console.log("initialLendingControllerMockFa12TokenBalance: "+ initialLendingControllerMockFa12TokenBalance);
//     // console.log("updatedLendingControllerMockFa12TokenBalance: "+ updatedLendingControllerMockFa12TokenBalance);
//     // console.log("change: "+ (updatedLendingControllerMockFa12TokenBalance - initialLendingControllerMockFa12TokenBalance));

//     // console.log("-");

//     // console.log("initialLendingControllerMockFa2TokenBalance: "+ initialLendingControllerMockFa2TokenBalance);
//     // console.log("updatedLendingControllerMockFa2TokenBalance: "+ updatedLendingControllerMockFa2TokenBalance);
//     // console.log("change: "+ (updatedLendingControllerMockFa2TokenBalance - initialLendingControllerMockFa2TokenBalance));

//     // console.log("-");

//     // console.log("initialLendingControllerTezBalance: "+ initialLendingControllerTezBalance);
//     // console.log("updatedLendingControllerTezBalance: "+ updatedLendingControllerTezBalance);
//     // console.log("change: "+ (updatedLendingControllerTezBalance - initialLendingControllerTezBalance));

//     // console.log("---");


//     // ----------------------
//     // LOANS
//     // ----------------------


//     // console.log('----')
//     // console.log("loanOutstandingWithAccruedInterest: "   + loanOutstandingWithAccruedInterest);
//     // console.log('-')
//     // console.log("totalInterest: "                        + totalInterest);
//     // console.log("remainingInterest: "                    + remainingInterest);
//     // console.log("totalInterestPaid: "                    + totalInterestPaid);
//     // console.log("interestSentToTreasury: "               + interestSentToTreasury);
//     // console.log("interestRewards: "                      + interestRewards);
//     // console.log('-')
//     // console.log("finalLoanOutstandingTotal: "            + finalLoanOutstandingTotal);
//     // console.log("finalLoanPrincipalTotal: "              + finalLoanPrincipalTotal);
//     // console.log("finalLoanInterestTotal: "               + finalLoanInterestTotal);
//     // console.log('----')


//     // ----------------------
//     // LIQUIDATION AMOUNTS
//     // ----------------------

//     // console.log('final liquidation amounts');
            
//     // console.log('')
//     // console.log('totalLiquidationAmount: '       + totalLiquidationAmount ); 
    
//     // console.log('')
//     // console.log('admin liquidation amounts');
//     // console.log('adminLiquidationFeeMockFa12: '  + adminLiquidationFeeMockFa12 ); 
//     // console.log('adminLiquidationFeeMockFa2: '   + adminLiquidationFeeMockFa2 ); 
//     // console.log('adminLiquidationFeeTez: '       + adminLiquidationFeeTez ); 
//     // console.log('adminLiquidationFeeMvk: '       + adminLiquidationFeeMvk ); 

//     // console.log('')
//     // console.log('liquidation amounts with incentive');
//     // console.log('liquidationAmountWithIncentiveMockFa12: '   + liquidationAmountWithIncentiveMockFa12 ); 
//     // console.log('liquidationAmountWithIncentiveMockFa2: '    + liquidationAmountWithIncentiveMockFa2 ); 
//     // console.log('liquidationAmountWithIncentiveTez: '        + liquidationAmountWithIncentiveTez ); 
//     // console.log('liquidationAmountWithIncentiveMvk: '        + liquidationAmountWithIncentiveMvk ); 

//     // console.log('')
//     // console.log('liquidation amounts with fees and incentive');
//     // console.log('liquidationAmountWithFeesAndIncentiveMockFa12: '    + liquidationAmountWithFeesAndIncentiveMockFa12 ); 
//     // console.log('liquidationAmountWithFeesAndIncentiveMockFa2: '     + liquidationAmountWithFeesAndIncentiveMockFa2 ); 
//     // console.log('liquidationAmountWithFeesAndIncentiveTez: '         + liquidationAmountWithFeesAndIncentiveTez ); 
//     // console.log('liquidationAmountWithFeesAndIncentiveMvk: '         + liquidationAmountWithFeesAndIncentiveMvk ); 

//     // console.log('')
//     // console.log('total liquidation amounts');
//     // console.log('totalLiquidationAmountMockFa12: '   + totalLiquidationAmountMockFa12 ); 
//     // console.log('totalLiquidationAmountMockFa2: '    + totalLiquidationAmountMockFa2 ); 
//     // console.log('totalLiquidationAmountTez: '        + totalLiquidationAmountTez ); 
//     // console.log('totalLiquidationAmountMvk: '        + totalLiquidationAmountMvk );
