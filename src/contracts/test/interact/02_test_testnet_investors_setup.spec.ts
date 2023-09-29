import { MVK, Utils } from "../helpers/Utils";
import { BigNumber } from "bignumber.js"

const chai = require("chai");
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

// ------------------------------------------------------------------------------
// Contract Address
// ------------------------------------------------------------------------------

import contractDeployments from '../contractDeployments.json'

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { bob, susie, eve, trudy, alice, oscar } from "../../scripts/sandbox/accounts";
import {
    signerFactory,
    updateOperators
} from '../helpers/helperFunctions'
import { mockSatelliteData } from "../helpers/mockTestnetData"

// ------------------------------------------------------------------------------
// Testnet Setup
// ------------------------------------------------------------------------------

describe("Testnet setup helper", async () => {
    
    var utils: Utils
    var tezos

    let doormanAddress
    let tokenId = 0

    let doormanInstance;
    let delegationInstance;
    let mvkTokenInstance;
    let lendingControllerInstance
    let aggregatorFactoryInstance
    let treasuryFactoryInstance
    let governanceInstance
    let vaultFactoryInstance

    // operations
    let updateOperatorsOperation
    let stakeOperation
    let registerOperation

    let treasuryFactoryStorage;
    let aggregatorFactoryStorage;

    let eurlAggregator;
    let usdtAggregator;
    let xtzAggregator;
    let btcAggregator;

    before("setup", async () => {
        try{
            utils = new Utils();
            await utils.init(bob.sk);
            tezos = utils.tezos;

            doormanAddress                          = contractDeployments.doorman.address
            
            doormanInstance                         = await utils.tezos.contract.at(contractDeployments.doorman.address);
            delegationInstance                      = await utils.tezos.contract.at(contractDeployments.delegation.address);
            mvkTokenInstance                        = await utils.tezos.contract.at(contractDeployments.mvkToken.address);
            lendingControllerInstance               = await utils.tezos.contract.at(contractDeployments.lendingController.address);
            aggregatorFactoryInstance               = await utils.tezos.contract.at(contractDeployments.aggregatorFactory.address);
            treasuryFactoryInstance                 = await utils.tezos.contract.at(contractDeployments.treasuryFactory.address);
            vaultFactoryInstance                    = await utils.tezos.contract.at(contractDeployments.vaultFactory.address);
            governanceInstance                      = await utils.tezos.contract.at(contractDeployments.governance.address);

            treasuryFactoryStorage                  = await treasuryFactoryInstance.storage();
            aggregatorFactoryStorage                = await aggregatorFactoryInstance.storage();

            console.log('-- -- -- -- -- Testnet Environment Setup -- -- -- --')
            console.log('Doorman Contract deployed at:'                         , contractDeployments.doorman.address);
            console.log('Delegation Contract deployed at:'                      , contractDeployments.delegation.address);
            console.log('MVK Token Contract deployed at:'                       , contractDeployments.mvkToken.address);
            console.log('Governance Contract deployed at:'                      , contractDeployments.governance.address);
            console.log('Emergency Governance Contract deployed at:'            , contractDeployments.emergencyGovernance.address);
            console.log('Vesting Contract deployed at:'                         , contractDeployments.vesting.address);
            console.log('Governance Financial Contract deployed at:'            , contractDeployments.governanceFinancial.address);
            console.log('Treasury Factory Contract deployed at:'                , contractDeployments.treasuryFactory.address);
            console.log('Treasury Contract deployed at:'                        , contractDeployments.treasury.address);
            console.log('Farm Contract deployed at:'                            , contractDeployments.farm.address);
            console.log('LP Token Contract deployed at:'                        , contractDeployments.mavrykFa12Token.address);
            console.log('Governance Satellite Contract deployed at:'            , contractDeployments.governanceSatellite.address);
            console.log('Aggregator Contract deployed at:'                      , contractDeployments.aggregator.address);
            console.log('Aggregator Factory Contract deployed at:'              , contractDeployments.aggregatorFactory.address);
            console.log('Lending Controller Contract deployed at:'              , contractDeployments.lendingController.address);
            console.log('Lending Controller Mock Time Contract deployed at:'    , contractDeployments.lendingControllerMockTime.address);
            console.log('Vault Factory Contract deployed at:'                   , contractDeployments.vaultFactory.address);
            console.log('Mavryk FA12 Token Contract deployed at:'               , contractDeployments.mavrykFa12Token.address);

            // Get oracle addresses
            const aggregatorAddresses: Array<string>    = aggregatorFactoryStorage.trackedAggregators;
            for(const index in aggregatorAddresses) {
                const aggregatorAddress         = aggregatorAddresses[index];
                const aggregatorInstance        = await utils.tezos.contract.at(aggregatorAddress);
                const aggregatorStorage : any   = await aggregatorInstance.storage();
                const aggregatorName            = aggregatorStorage.name;

                switch(aggregatorName){
                    case "USDT/USD":
                        usdtAggregator  = aggregatorAddress;
                        break;
                    case "EUROC/USD":
                        eurlAggregator  = aggregatorAddress;
                        break;
                    case "XTZ/USD":
                        xtzAggregator   = aggregatorAddress;
                        break;
                    case "BTC/USD":
                        btcAggregator   = aggregatorAddress;
                        break;
                    default: 
                        break
                }

            }

        } catch(e){
            console.log(e)
        }
    });

    describe("INVESTOR ENVIRONMENT SETUP", async () => {

        beforeEach("Set signer to admin (bob)", async () => {
            await signerFactory(tezos, bob.sk);
        });

        it('Creation of 5 Satellites', async () => {
            try{
                // Init var
                const stakeAmount   = MVK(200000);

                // Susie
                await signerFactory(tezos, susie.sk);
                updateOperatorsOperation        = await updateOperators(mvkTokenInstance, susie.pkh, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();
                var stakeOperation              = await doormanInstance.methods.stake(stakeAmount).send();
                await stakeOperation.confirmation();

                // Eve 
                await signerFactory(tezos, eve.sk);
                updateOperatorsOperation        = await updateOperators(mvkTokenInstance, eve.pkh, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();
                stakeOperation                  = await doormanInstance.methods.stake(stakeAmount).send();
                await stakeOperation.confirmation();

                // Mallory 
                await signerFactory(tezos, trudy.sk);
                updateOperatorsOperation        = await updateOperators(mvkTokenInstance, trudy.pkh, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();
                stakeOperation                  = await doormanInstance.methods.stake(stakeAmount).send();
                await stakeOperation.confirmation();

                // Alice 
                await signerFactory(tezos, alice.sk);
                updateOperatorsOperation        = await updateOperators(mvkTokenInstance, alice.pkh, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();
                stakeOperation                  = await doormanInstance.methods.stake(stakeAmount).send();
                await stakeOperation.confirmation();

                // Oscar 
                await signerFactory(tezos, oscar.sk);
                updateOperatorsOperation        = await updateOperators(mvkTokenInstance, oscar.pkh, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();
                stakeOperation                  = await doormanInstance.methods.stake(stakeAmount).send();
                await stakeOperation.confirmation();

                // ------------------------------
                // Register Satellite Operations
                // ------------------------------

                // Susie Satellite
                await signerFactory(tezos, susie.sk);
                registerOperation = await delegationInstance.methods.registerAsSatellite(
                    mockSatelliteData.susie.name, 
                    mockSatelliteData.susie.desc,
                    mockSatelliteData.susie.image,
                    mockSatelliteData.susie.website, 
                    mockSatelliteData.susie.satelliteFee,
                    mockSatelliteData.susie.oraclePublicKey,
                    mockSatelliteData.susie.oraclePeerId
                ).send();
                await registerOperation.confirmation();

                // Eve Satellite
                await signerFactory(tezos, eve.sk);
                registerOperation           = await delegationInstance.methods.registerAsSatellite(
                    mockSatelliteData.eve.name, 
                    mockSatelliteData.eve.desc,
                    mockSatelliteData.eve.image,
                    mockSatelliteData.eve.website, 
                    mockSatelliteData.eve.satelliteFee,
                    mockSatelliteData.eve.oraclePublicKey,
                    mockSatelliteData.eve.oraclePeerId
                ).send();
                await registerOperation.confirmation();

                // Mallory Satellite
                await signerFactory(tezos, trudy.sk);
                registerOperation           = await delegationInstance.methods.registerAsSatellite(
                    mockSatelliteData.trudy.name, 
                    mockSatelliteData.trudy.desc,
                    mockSatelliteData.trudy.image,
                    mockSatelliteData.trudy.website, 
                    mockSatelliteData.trudy.satelliteFee,
                    mockSatelliteData.trudy.oraclePublicKey,
                    mockSatelliteData.trudy.oraclePeerId
                ).send();
                await registerOperation.confirmation();

                // Alice Satellite
                await signerFactory(tezos, alice.sk);
                registerOperation           = await delegationInstance.methods.registerAsSatellite(
                    mockSatelliteData.alice.name, 
                    mockSatelliteData.alice.desc,
                    mockSatelliteData.alice.image,
                    mockSatelliteData.alice.website, 
                    mockSatelliteData.alice.satelliteFee,
                    mockSatelliteData.alice.oraclePublicKey,
                    mockSatelliteData.alice.oraclePeerId
                ).send();
                await registerOperation.confirmation();

                // Oscar Satellite
                await signerFactory(tezos, oscar.sk);
                registerOperation           = await delegationInstance.methods.registerAsSatellite(
                    mockSatelliteData.oscar.name, 
                    mockSatelliteData.oscar.desc,
                    mockSatelliteData.oscar.image,
                    mockSatelliteData.oscar.website, 
                    mockSatelliteData.oscar.satelliteFee,
                    mockSatelliteData.oscar.oraclePublicKey,
                    mockSatelliteData.oscar.oraclePeerId
                ).send();
                await registerOperation.confirmation();

            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Creation of 3 loan tokens', async () => {
            try{

                // Get aggregators addresses
                aggregatorFactoryStorage     	            = await aggregatorFactoryInstance.storage();
                const interestRateDecimals                  = 27;

                // EURL
                var setLoanTokenOperation = await lendingControllerInstance.methods.setLoanToken(
                    "createLoanToken",

                    "eurl",
                    6,

                    eurlAggregator,

                    contractDeployments.mTokenEurl.address,
                    
                    3000,
                    30 * 10 ** (interestRateDecimals - 2),
                    5 * 10 ** (interestRateDecimals - 2),
                    25 * 10 ** (interestRateDecimals - 2),
                    10 * 10 ** (interestRateDecimals - 2),
                    20 * 10 ** (interestRateDecimals - 2),
                    10000,

                    "fa2",
                    "KT1RcHjqDWWycYQGrz4KBYoGZSMmMuVpkmuS",
                    0
                ).send();
                await setLoanTokenOperation.confirmation();

                // XTZ
                var setLoanTokenOperation = await lendingControllerInstance.methods.setLoanToken(
                    "createLoanToken",

                    "tez",
                    6,

                    xtzAggregator,

                    contractDeployments.mTokenXtz.address,
                    
                    3000,
                    30 * 10 ** (interestRateDecimals - 2),
                    5 * 10 ** (interestRateDecimals - 2),
                    25 * 10 ** (interestRateDecimals - 2),
                    10 * 10 ** (interestRateDecimals - 2),
                    20 * 10 ** (interestRateDecimals - 2),
                    10000,

                    "tez",
                ).send();
                await setLoanTokenOperation.confirmation();

                // USDT
                var setLoanTokenOperation = await lendingControllerInstance.methods.setLoanToken(
                    "createLoanToken",

                    "usdt",
                    6,

                    usdtAggregator,

                    contractDeployments.mTokenUsdt.address,
                    
                    3000,
                    30 * 10 ** (interestRateDecimals - 2),
                    5 * 10 ** (interestRateDecimals - 2),
                    25 * 10 ** (interestRateDecimals - 2),
                    10 * 10 ** (interestRateDecimals - 2),
                    20 * 10 ** (interestRateDecimals - 2),
                    10000,

                    "fa2",
                    "KT1WNrZ7pEbpmYBGPib1e7UVCeC6GA6TkJYR",
                    0
                ).send();
                await setLoanTokenOperation.confirmation();

            } catch(e) {
                console.dir(e, {depth: 5});
            }
        });

        it('Creation of 4 collateral tokens', async () => {
            try{

                // Get aggregators addresses
                aggregatorFactoryStorage     	            = await aggregatorFactoryInstance.storage();

                // Eurl
                var setCollateralTokenOperation = await lendingControllerInstance.methods.setCollateralToken(
                    "createCollateralToken",

                    "eurl",
                    'KT1RcHjqDWWycYQGrz4KBYoGZSMmMuVpkmuS',
                    6,

                    eurlAggregator,
                    false,
                    false,
                    false,
                    null,
                    null, // Max deposit amount

                    // fa12 token type - token contract address
                    "fa2",
                    "KT1RcHjqDWWycYQGrz4KBYoGZSMmMuVpkmuS",
                    0

                ).send();
                await setCollateralTokenOperation.confirmation();

                // XTZ
                setCollateralTokenOperation = await lendingControllerInstance.methods.setCollateralToken(
                    "createCollateralToken",

                    "tez",
                    'tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg',
                    6,

                    xtzAggregator,
                    false,
                    false,
                    false,
                    null,
                    null, // Max deposit amount

                    "tez"

                ).send();
                await setCollateralTokenOperation.confirmation();
                
                // tzbtc
                setCollateralTokenOperation = await lendingControllerInstance.methods.setCollateralToken(
                    "createCollateralToken",

                    "tzbtc",
                    'KT1P8RdJ5MfHMK5phKJ5JsfNfask5v2b2NQS',
                    8,

                    btcAggregator,
                    false,
                    false,
                    false,
                    null,
                    null, // Max deposit amount

                    "fa12",
                    "KT1P8RdJ5MfHMK5phKJ5JsfNfask5v2b2NQS"
                ).send();
                await setCollateralTokenOperation.confirmation();
                
                // usdt
                setCollateralTokenOperation = await lendingControllerInstance.methods.setCollateralToken(
                    "createCollateralToken",

                    "usdt",
                    'KT1WNrZ7pEbpmYBGPib1e7UVCeC6GA6TkJYR',
                    6,

                    usdtAggregator,
                    false,
                    false,
                    false,
                    null,
                    null, // Max deposit amount

                    "fa2",
                    "KT1WNrZ7pEbpmYBGPib1e7UVCeC6GA6TkJYR",
                    0
                ).send();
                await setCollateralTokenOperation.confirmation();

            } catch(e) {
                console.dir(e, {depth: 5});
            }
        });

        it('Creation of 4 treasuries', async () => {
            try{

                // MVK Buyback for Oracles & Farms
                const mvkBuyBackTreasuryData = {
                    name: 'MVK Buyback for Oracles & Farms',
                    description: 'MAVRYK MVK Buyback for Oracles & Farms Treasury Contract',
                  }
              
                const mvkBuyBackTreasuryMetadataBase = Buffer.from(
                    JSON.stringify({
                        name: mvkBuyBackTreasuryData.description,
                        description: mvkBuyBackTreasuryData.name,
                        version: 'v1.0.0',
                        authors: ['MAVRYK Dev Team <info@mavryk.io>'],
                    }),
                    'ascii',
                    ).toString('hex')
                var createTreasuryOperation = await treasuryFactoryInstance.methods.createTreasury(
                    null,
                    mvkBuyBackTreasuryData.name,
                    false,
                    mvkBuyBackTreasuryMetadataBase
                ).send()
                await createTreasuryOperation.confirmation();

                // Set this first treasury as the main treasury (tmp)
                treasuryFactoryStorage                      = await treasuryFactoryInstance.storage();
                const trackedTreasuries                     = treasuryFactoryStorage.trackedTreasuries;
                const createdTreasuryAddress                = trackedTreasuries[0];
                const governanceUpdateGeneralContractsBatch = await utils.tezos.wallet
                .batch()
                .withContractCall(governanceInstance.methods.updateGeneralContracts("farmTreasury", createdTreasuryAddress, "update"))
                .withContractCall(governanceInstance.methods.updateGeneralContracts("aggregatorTreasury", createdTreasuryAddress, "update"))
                .withContractCall(governanceInstance.methods.updateGeneralContracts("taxTreasury", createdTreasuryAddress, "update"))
                .withContractCall(governanceInstance.methods.updateGeneralContracts("satelliteTreasury", createdTreasuryAddress, "update"))
                .withContractCall(governanceInstance.methods.updateGeneralContracts("paymentTreasury", createdTreasuryAddress, "update"))
                .withContractCall(governanceInstance.methods.updateGeneralContracts("lendingTreasury", createdTreasuryAddress, "update"))

                const governanceUpdateGeneralContractsBatchOperation = await governanceUpdateGeneralContractsBatch.send()
                await governanceUpdateGeneralContractsBatchOperation.confirmation();

                // Research & Development
                const rAndDTreasuryData = {
                    name: 'Research & Development',
                    description: 'MAVRYK Research & Development Treasury Contract',
                }
              
                const rAndDTreasuryMetadataBase = Buffer.from(
                    JSON.stringify({
                        name: rAndDTreasuryData.name,
                        description: rAndDTreasuryData.description,
                        version: 'v1.0.0',
                        authors: ['MAVRYK Dev Team <info@mavryk.io>'],
                    }),
                    'ascii',
                ).toString('hex')
                createTreasuryOperation = await treasuryFactoryInstance.methods.createTreasury(
                    null,
                    rAndDTreasuryData.name,
                    false,
                    rAndDTreasuryMetadataBase
                ).send()
                await createTreasuryOperation.confirmation();

                // Research & Development
                const investmentTreasuryData = {
                    name: 'Investment Fund',
                    description: 'MAVRYK Investment Fund Treasury Contract',
                }
              
                const investmentTreasuryMetadataBase = Buffer.from(
                    JSON.stringify({
                        name: investmentTreasuryData.name,
                        description: investmentTreasuryData.description,
                        version: 'v1.0.0',
                        authors: ['MAVRYK Dev Team <info@mavryk.io>'],
                    }),
                    'ascii',
                ).toString('hex')
                createTreasuryOperation = await treasuryFactoryInstance.methods.createTreasury(
                    null,
                    investmentTreasuryData.name,
                    false,
                    investmentTreasuryMetadataBase
                ).send()
                await createTreasuryOperation.confirmation();

                // Research & Development
                const daoValidatorFundTreasuryData = {
                    name: 'DAO Validator Fund',
                    description: 'MAVRYK DAO Validator Fund Treasury Contract',
                  }
              
                const daoValidatorFundTreasuryMetadataBase = Buffer.from(
                    JSON.stringify({
                        name: daoValidatorFundTreasuryData.description,
                        description: daoValidatorFundTreasuryData.name,
                        version: 'v1.0.0',
                        authors: ['MAVRYK Dev Team <info@mavryk.io>'],
                    }),
                    'ascii',
                ).toString('hex')
                createTreasuryOperation = await treasuryFactoryInstance.methods.createTreasury(
                    null,
                    daoValidatorFundTreasuryData.name,
                    false,
                    daoValidatorFundTreasuryMetadataBase
                ).send()
                await createTreasuryOperation.confirmation();

            } catch(e) {
                console.dir(e, {depth: 5});
            }
        });

        it('Configuration of 4 treasuries', async () => {
            try{

                // Set this first treasury as the main treasury (tmp)
                treasuryFactoryStorage                      = await treasuryFactoryInstance.storage();
                const trackedTreasuries                     = treasuryFactoryStorage.trackedTreasuries;

                // WhitelistTokenContracts and WhitelistContracts
                for(const index in trackedTreasuries){
                    const treasuryAddress       = trackedTreasuries[index];
                    const treasuryInstance: any = await utils.tezos.contract.at(treasuryAddress);
                    const treasuryBatch         = await utils.tezos.wallet
                    .batch()
                    .withContractCall(treasuryInstance.methods.updateWhitelistTokenContracts("KT1WNrZ7pEbpmYBGPib1e7UVCeC6GA6TkJYR", "update"))
                    .withContractCall(treasuryInstance.methods.updateWhitelistTokenContracts("KT1RcHjqDWWycYQGrz4KBYoGZSMmMuVpkmuS", "update"))
                    .withContractCall(treasuryInstance.methods.updateWhitelistTokenContracts("KT1P8RdJ5MfHMK5phKJ5JsfNfask5v2b2NQS", "update"))
                    .withContractCall(treasuryInstance.methods.updateWhitelistTokenContracts(contractDeployments.mvkToken.address, "update"))
                    .withContractCall(treasuryInstance.methods.updateWhitelistTokenContracts(contractDeployments.mTokenEurl.address, "update"))
                    .withContractCall(treasuryInstance.methods.updateWhitelistTokenContracts(contractDeployments.mTokenXtz.address, "update"))
                    .withContractCall(treasuryInstance.methods.updateWhitelistTokenContracts(contractDeployments.mTokenUsdt.address, "update"))
                    .withContractCall(treasuryInstance.methods.updateWhitelistContracts(contractDeployments.aggregatorFactory.address, "update"))
                    .withContractCall(treasuryInstance.methods.updateWhitelistContracts(contractDeployments.delegation.address, "update"))
                    .withContractCall(treasuryInstance.methods.updateWhitelistContracts(contractDeployments.doorman.address, "update"))
                    .withContractCall(treasuryInstance.methods.updateWhitelistContracts(contractDeployments.governance.address, "update"))
                    .withContractCall(treasuryInstance.methods.updateWhitelistContracts(contractDeployments.governanceFinancial.address, "update"))
    
                    const treasuryBatchOperation = await treasuryBatch.send()
                    await treasuryBatchOperation.confirmation();

                }

            } catch(e) {
                console.dir(e, {depth: 5});
            }
        });

        it('Configuration of vaultFactory', async () => {
            try{

                const updateConfigOperation = await vaultFactoryInstance.methods.updateConfig(15, "configVaultNameMaxLength").send();
                await updateConfigOperation.confirmation();

            } catch(e) {
                console.dir(e, {depth: 5});
            }
        });

        it('Configuration of governance', async () => {
            try{

                var updateConfigOperation   = await governanceInstance.methods.updateConfig(10800, "configBlocksPerProposalRound").send();
                await updateConfigOperation.confirmation();
                updateConfigOperation       = await governanceInstance.methods.updateConfig(10800, "configBlocksPerVotingRound").send();
                await updateConfigOperation.confirmation();
                updateConfigOperation       = await governanceInstance.methods.updateConfig(2880, "configBlocksPerTimelockRound").send();
                await updateConfigOperation.confirmation();

            } catch(e) {
                console.dir(e, {depth: 5});
            }
        });

        it('Configuration of delegation', async () => {
            try{

                var updateConfigOperation   = await delegationInstance.methods.updateConfig(new BigNumber(MVK(100)), "configMinimumStakedMvkBalance").send();
                await updateConfigOperation.confirmation();

            } catch(e) {
                console.dir(e, {depth: 5});
            }
        });
    });
});