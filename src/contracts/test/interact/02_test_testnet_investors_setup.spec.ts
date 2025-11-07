import { MVN, Utils } from "../helpers/Utils";
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
    let mvnTokenInstance;
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

    let eurtAggregator;
    let usdtAggregator;
    let mvrkAggregator;
    let btcAggregator;
    let oceanAggregator;
    let mars1Aggregator;

    before("setup", async () => {
        try{
            utils = new Utils();
            await utils.init(bob.sk);
            tezos = utils.tezos;

            doormanAddress                          = contractDeployments.doorman.address
            
            doormanInstance                         = await utils.tezos.contract.at(contractDeployments.doorman.address);
            delegationInstance                      = await utils.tezos.contract.at(contractDeployments.delegation.address);
            mvnTokenInstance                        = await utils.tezos.contract.at(contractDeployments.mvnToken.address);
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
            console.log('MVN Token Contract deployed at:'                       , contractDeployments.mvnToken.address);
            console.log('Governance Contract deployed at:'                      , contractDeployments.governance.address);
            console.log('Emergency Governance Contract deployed at:'            , contractDeployments.emergencyGovernance.address);
            console.log('Vesting Contract deployed at:'                         , contractDeployments.vesting.address);
            console.log('Governance Financial Contract deployed at:'            , contractDeployments.governanceFinancial.address);
            console.log('Treasury Factory Contract deployed at:'                , contractDeployments.treasuryFactory.address);
            console.log('Treasury Contract deployed at:'                        , contractDeployments.treasury.address);
            console.log('Farm Contract deployed at:'                            , contractDeployments.farm.address);
            console.log('LP Token Contract deployed at:'                        , contractDeployments.mavenFa12Token.address);
            console.log('Governance Satellite Contract deployed at:'            , contractDeployments.governanceSatellite.address);
            console.log('Aggregator Contract deployed at:'                      , contractDeployments.aggregator.address);
            console.log('Aggregator Factory Contract deployed at:'              , contractDeployments.aggregatorFactory.address);
            console.log('Lending Controller Contract deployed at:'              , contractDeployments.lendingController.address);
            console.log('Lending Controller Mock Time Contract deployed at:'    , contractDeployments.lendingControllerMockTime.address);
            console.log('Vault Factory Contract deployed at:'                   , contractDeployments.vaultFactory.address);
            console.log('Maven FA12 Token Contract deployed at:'                , contractDeployments.mavenFa12Token.address);

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
                        // usdtAggregator  = "KT1LXtigQdv8WfF1T8uTtjB75C1uCyE9Ty6G";
                        break;
                    // case "EURT/USD":
                    //     eurtAggregator  = aggregatorAddress;
                    //     break;
                    case "MVRK/USD":
                        mvrkAggregator   = aggregatorAddress;
                        // mvrkAggregator   = "KT1UZ4pxidJUVeCixmp8WjGUL2GuGCfLM3dp";
                        break;
                    case "BTC/USD":
                        btcAggregator   = aggregatorAddress;
                        // btcAggregator   = "KT1KuboiXGVbok9nFCgwKiUw8MbJA9mT5amT";
                        break;
                    case "OCEAN/USD":
                        oceanAggregator   = aggregatorAddress;
                        // oceanAggregator   = "KT1DF7gcTusnYRks9AHdRGncEt2ZQd2GrkZG";
                        break;
                    case "MARS1/USD":
                        mars1Aggregator   = aggregatorAddress;
                        // mars1Aggregator   = "KT1J27dgN5U5Zo73pXyq74VmudcnHQq3uTEK";
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
                const stakeAmount   = MVN(200000);

                // Susie
                await signerFactory(tezos, susie.sk);
                updateOperatorsOperation        = await updateOperators(mvnTokenInstance, susie.pkh, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();
                var stakeOperation              = await doormanInstance.methods.stakeMvn(stakeAmount).send();
                await stakeOperation.confirmation();

                // Eve 
                await signerFactory(tezos, eve.sk);
                updateOperatorsOperation        = await updateOperators(mvnTokenInstance, eve.pkh, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();
                stakeOperation                  = await doormanInstance.methods.stakeMvn(stakeAmount).send();
                await stakeOperation.confirmation();

                // Mallory 
                await signerFactory(tezos, trudy.sk);
                updateOperatorsOperation        = await updateOperators(mvnTokenInstance, trudy.pkh, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();
                stakeOperation                  = await doormanInstance.methods.stakeMvn(stakeAmount).send();
                await stakeOperation.confirmation();

                // Alice 
                await signerFactory(tezos, alice.sk);
                updateOperatorsOperation        = await updateOperators(mvnTokenInstance, alice.pkh, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();
                stakeOperation                  = await doormanInstance.methods.stakeMvn(stakeAmount).send();
                await stakeOperation.confirmation();

                // Oscar 
                await signerFactory(tezos, oscar.sk);
                updateOperatorsOperation        = await updateOperators(mvnTokenInstance, oscar.pkh, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();
                stakeOperation                  = await doormanInstance.methods.stakeMvn(stakeAmount).send();
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

        it('Creation of 2 loan tokens', async () => {
            try{

                // Get aggregators addresses
                aggregatorFactoryStorage     	            = await aggregatorFactoryInstance.storage();
                const interestRateDecimals                  = 27;

                // EURT
                // var setLoanTokenOperation = await lendingControllerInstance.methods.setLoanToken(
                //     "createLoanToken",

                //     "eurt",
                //     6,

                //     eurtAggregator,

                //     contractDeployments.mTokenEurt.address,
                    
                //     3000,
                //     30 * 10 ** (interestRateDecimals - 2),
                //     5 * 10 ** (interestRateDecimals - 2),
                //     25 * 10 ** (interestRateDecimals - 2),
                //     10 * 10 ** (interestRateDecimals - 2),
                //     20 * 10 ** (interestRateDecimals - 2),
                //     10000,

                //     "fa2",
                //     "KT1RcHjqDWWycYQGrz4KBYoGZSMmMuVpkmuS",
                //     0
                // ).send();
                // await setLoanTokenOperation.confirmation();

                // MVRK
                var setLoanTokenOperation = await lendingControllerInstance.methods.setLoanToken(
                    "createLoanToken",

                    "mav",
                    6,

                    mvrkAggregator,

                    contractDeployments.mTokenMvrk.address,
                    
                    3000,
                    30 * 10 ** (interestRateDecimals - 2),
                    5 * 10 ** (interestRateDecimals - 2),
                    25 * 10 ** (interestRateDecimals - 2),
                    10 * 10 ** (interestRateDecimals - 2),
                    20 * 10 ** (interestRateDecimals - 2),
                    10000,

                    "mav",
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
                    // contractDeployments.fakeUSDtToken.address,
                    "KT1StUZzJ34MhSNjkQMSyvZVrR9ppkHMFdFf",
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

                // Eurt
                // var setCollateralTokenOperation = await lendingControllerInstance.methods.setCollateralToken(
                //     "createCollateralToken",

                //     "eurt",
                //     'KT1RcHjqDWWycYQGrz4KBYoGZSMmMuVpkmuS',
                //     6,

                //     eurtAggregator,
                //     false,
                //     false,
                //     false,
                //     null,
                //     null, // Max deposit amount

                //     // fa12 token type - token contract address
                //     "fa2",
                //     "KT1RcHjqDWWycYQGrz4KBYoGZSMmMuVpkmuS",
                //     0

                // ).send();
                // await setCollateralTokenOperation.confirmation();

                // MVRK
                var setCollateralTokenOperation = await lendingControllerInstance.methods.setCollateralToken(
                    "createCollateralToken",

                    "mav",
                    'mv2ZZZZZZZZZZZZZZZZZZZZZZZZZZZDXMF2d',
                    6,

                    mvrkAggregator,
                    false,
                    false,
                    false,
                    null,
                    null, // Max deposit amount

                    "mav"

                ).send();
                await setCollateralTokenOperation.confirmation();
                
                // wbtc
                setCollateralTokenOperation = await lendingControllerInstance.methods.setCollateralToken(
                    "createCollateralToken",

                    "wbtc",
                    // contractDeployments.fakeWBTCToken.address,
                    "KT1C69d3yp4VaMW5v9dNoR6rBwTtg6x7h9K2",
                    8,

                    btcAggregator,
                    false,
                    false,
                    false,
                    null,
                    null, // Max deposit amount

                    "fa2",
                    // contractDeployments.fakeWBTCToken.address,
                    "KT1C69d3yp4VaMW5v9dNoR6rBwTtg6x7h9K2s",
                    0
                ).send();
                await setCollateralTokenOperation.confirmation();
                
                // usdt
                setCollateralTokenOperation = await lendingControllerInstance.methods.setCollateralToken(
                    "createCollateralToken",

                    "usdt",
                    // contractDeployments.fakeUSDtToken.address,
                    "KT1StUZzJ34MhSNjkQMSyvZVrR9ppkHMFdFf",
                    6,

                    usdtAggregator,
                    false,
                    false,
                    false,
                    null,
                    null, // Max deposit amount

                    "fa2",
                    // contractDeployments.fakeUSDtToken.address,
                    "KT1StUZzJ34MhSNjkQMSyvZVrR9ppkHMFdFf",
                    0
                ).send();
                await setCollateralTokenOperation.confirmation();
                
                // ocean
                setCollateralTokenOperation = await lendingControllerInstance.methods.setCollateralToken(
                    "createCollateralToken",

                    "ocean",
                    "KT1J1p1f1owAEjJigKGXhwzu3tVCvRPVgGCh",
                    3,

                    oceanAggregator,
                    false,
                    false,
                    false,
                    null,
                    null, // Max deposit amount

                    "fa2",
                    "KT1J1p1f1owAEjJigKGXhwzu3tVCvRPVgGCh",
                    0
                ).send();
                await setCollateralTokenOperation.confirmation();
                
                // mars1
                setCollateralTokenOperation = await lendingControllerInstance.methods.setCollateralToken(
                    "createCollateralToken",

                    "mars1",
                    "KT1CgLvrzj5MziwPWWzPkZj1eDeEpRAsYvQ9",
                    3,

                    mars1Aggregator,
                    false,
                    false,
                    false,
                    null,
                    null, // Max deposit amount

                    "fa2",
                    "KT1CgLvrzj5MziwPWWzPkZj1eDeEpRAsYvQ9",
                    0
                ).send();
                await setCollateralTokenOperation.confirmation();

            } catch(e) {
                console.dir(e, {depth: 5});
            }
        });

        it('Creation of 4 treasuries', async () => {
            try{

                // MVN Buyback for Oracles & Farms
                const mvnBuyBackTreasuryMetadataBase = Buffer.from(
                    JSON.stringify({
                        name: 'Maven Finance - MVN Buyback for Oracles & Farms Treasury',
                        version: 'v1.0.0',
                        authors: ['Mavryk Dynamics <info@mavryk.io>'],
                        homepage: "https://mavenfinance.io",
                        license: {
                            name: "MIT"
                        },
                        source: {
                            tools: [
                                "MavrykLIGO 0.60.0",
                                "Flexmasa atlas-update-run"
                            ],
                            location: "https://github.com/MavrykDynamics/maven-finance"
                        },
                        interfaces: [ 'MIP-16' ],
                        }),
                        'ascii',
                    ).toString('hex')
                var createTreasuryOperation = await treasuryFactoryInstance.methods.createTreasury(
                    null,
                    'Maven Finance - MVN Buyback for Oracles & Farms Treasury',
                    false,
                    mvnBuyBackTreasuryMetadataBase
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
                const rAndDTreasuryMetadataBase = Buffer.from(
                    JSON.stringify({
                        name: 'Maven Finance - Research & Development Treasury',
                        version: 'v1.0.0',
                        authors: ['Mavryk Dynamics <info@mavryk.io>'],
                        homepage: "https://mavenfinance.io",
                        license: {
                            name: "MIT"
                        },
                        source: {
                            tools: [
                                "MavrykLIGO 0.60.0",
                                "Flexmasa atlas-update-run"
                            ],
                            location: "https://github.com/MavrykDynamics/maven-finance"
                        },
                        interfaces: [ 'MIP-16' ],
                        }),
                        'ascii',
                    ).toString('hex')
                createTreasuryOperation = await treasuryFactoryInstance.methods.createTreasury(
                    null,
                    'Maven Finance - Research & Development Treasury',
                    false,
                    rAndDTreasuryMetadataBase
                ).send()
                await createTreasuryOperation.confirmation();

                // Research & Development              
                const investmentTreasuryMetadataBase = Buffer.from(
                    JSON.stringify({
                        name: 'Maven Finance - Investment Fund Treasury',
                        version: 'v1.0.0',
                        authors: ['Mavryk Dynamics <info@mavryk.io>'],
                        homepage: "https://mavenfinance.io",
                        license: {
                            name: "MIT"
                        },
                        source: {
                            tools: [
                                "MavrykLIGO 0.60.0",
                                "Flexmasa atlas-update-run"
                            ],
                            location: "https://github.com/MavrykDynamics/maven-finance"
                        },
                        interfaces: [ 'MIP-16' ],
                        }),
                        'ascii',
                    ).toString('hex')
                createTreasuryOperation = await treasuryFactoryInstance.methods.createTreasury(
                    null,
                    'Maven Finance - Investment Fund Treasury',
                    false,
                    investmentTreasuryMetadataBase
                ).send()
                await createTreasuryOperation.confirmation();

                // Research & Development              
                const daoValidatorFundTreasuryMetadataBase = Buffer.from(
                    JSON.stringify({
                        name: 'Maven Finance - DAO Validator Fund Treasury',
                        version: 'v1.0.0',
                        authors: ['Mavryk Dynamics <info@mavryk.io>'],
                        homepage: "https://mavenfinance.io",
                        license: {
                            name: "MIT"
                        },
                        source: {
                            tools: [
                                "MavrykLIGO 0.60.0",
                                "Flexmasa atlas-update-run"
                            ],
                            location: "https://github.com/MavrykDynamics/maven-finance"
                        },
                        interfaces: [ 'MIP-16' ],
                        }),
                        'ascii',
                    ).toString('hex')
                createTreasuryOperation = await treasuryFactoryInstance.methods.createTreasury(
                    null,
                    'Maven Finance - DAO Validator Fund Treasury',
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
                    .withContractCall(treasuryInstance.methods.updateWhitelistTokenContracts("KT1StUZzJ34MhSNjkQMSyvZVrR9ppkHMFdFf", "update"))
                    .withContractCall(treasuryInstance.methods.updateWhitelistTokenContracts("KT1C69d3yp4VaMW5v9dNoR6rBwTtg6x7h9K2", "update"))
                    .withContractCall(treasuryInstance.methods.updateWhitelistTokenContracts("KT1J1p1f1owAEjJigKGXhwzu3tVCvRPVgGCh", "update"))
                    .withContractCall(treasuryInstance.methods.updateWhitelistTokenContracts("KT1CgLvrzj5MziwPWWzPkZj1eDeEpRAsYvQ9", "update"))
                    .withContractCall(treasuryInstance.methods.updateWhitelistTokenContracts(contractDeployments.mvnToken.address, "update"))
                    .withContractCall(treasuryInstance.methods.updateWhitelistTokenContracts(contractDeployments.mTokenEurt.address, "update"))
                    .withContractCall(treasuryInstance.methods.updateWhitelistTokenContracts(contractDeployments.mTokenMvrk.address, "update"))
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

                var updateConfigOperation   = await delegationInstance.methods.updateConfig(new BigNumber(MVN(100)), "configMinimumStakedMvnBalance").send();
                await updateConfigOperation.confirmation();

            } catch(e) {
                console.dir(e, {depth: 5});
            }
        });
    });
});