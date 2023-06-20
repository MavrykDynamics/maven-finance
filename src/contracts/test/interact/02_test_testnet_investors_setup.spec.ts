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

import { bob, eve, mallory, alice, oscar } from "../../scripts/sandbox/accounts";
import * as helperFunctions from '../helpers/helperFunctions'
import { mockSatelliteData } from "../helpers/mockTestnetData"

// ------------------------------------------------------------------------------
// Testnet Setup
// ------------------------------------------------------------------------------

import delegationAddress from '../../deployments/delegationAddress.json';
import mvkTokenAddress from '../../deployments/mvkTokenAddress.json';
import governanceAddress from '../../deployments/governanceAddress.json';
import governanceFinancialAddress from '../../deployments/governanceFinancialAddress.json';
import aggregatorFactoryAddress from '../../deployments/aggregatorFactoryAddress.json';
import mTokenEurlAddress from '../../deployments/mTokenEurlAddress.json';
import mTokenUsdtAddress from '../../deployments/mTokenUsdtAddress.json';
import mTokenXtzAddress from '../../deployments/mTokenXtzAddress.json';

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

    let doormanStorage;
    let delegationStorage;
    let mvkTokenStorage;
    let governanceStorage;
    let governanceProxyStorage;
    let emergencyGovernanceStorage;
    let breakGlassStorage;
    let councilStorage;
    let farmFactoryStorage;
    let vestingStorage;
    let governanceFinancialStorage;
    let treasuryFactoryStorage;
    let treasuryStorage;
    let farmStorage;
    let lpTokenStorage;
    let governanceSatelliteStorage;
    let aggregatorStorage;
    let aggregatorFactoryStorage;
    let tokenSaleStorage;
    let lendingControllerStorage;
    let lendingControllerMockTimeStorage;
    let vaultStorage;
    let vaultFactoryStorage;
    let mavrykFa12TokenStorage;

    let eurlAggregator;
    let usdtAggregator;
    let xtzAggregator;
    let btcAggregator;

    before("setup", async () => {
        try{
            utils = new Utils();
            await utils.init(bob.sk);
            tezos = utils.tezos;

            doormanAddress = contractDeployments.doorman.address
            
            doormanInstance                         = await utils.tezos.contract.at(contractDeployments.doorman.address);
            delegationInstance                      = await utils.tezos.contract.at(contractDeployments.delegation.address);
            mvkTokenInstance                        = await utils.tezos.contract.at(contractDeployments.mvkToken.address);
            lendingControllerInstance               = await utils.tezos.contract.at(contractDeployments.lendingController.address);
            aggregatorFactoryInstance               = await utils.tezos.contract.at(contractDeployments.aggregatorFactory.address);
            treasuryFactoryInstance                 = await utils.tezos.contract.at(contractDeployments.treasuryFactory.address);
            vaultFactoryInstance                    = await utils.tezos.contract.at(contractDeployments.vaultFactory.address);
            governanceInstance                      = await utils.tezos.contract.at(contractDeployments.governance.address);

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
            const aggregatorAddresses: Array<string>    = await aggregatorFactoryStorage.trackedAggregators;
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

        it('Creation of 5 Satellites', async () => {
            try{
                // Init var
                const stakeAmount   = MVK(200000);

                // Bob Satellite
                await helperFunctions.signerFactory(tezos, bob.sk);
                updateOperatorsOperation    = await mvkTokenInstance.methods
                    .update_operators([
                    {
                        add_operator: {
                            owner: bob.pkh,
                            operator: doormanAddress.address,
                            token_id: 0,
                        },
                    },
                    ])
                    .send()
                await updateOperatorsOperation.confirmation();
                var stakeOperation              = await doormanInstance.methods.stake(stakeAmount).send();
                await stakeOperation.confirmation();

                // Eve 
                await helperFunctions.signerFactory(tezos, eve.sk);
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, eve.pkh, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();

                await updateOperatorsOperation.confirmation();
                stakeOperation = await doormanInstance.methods.stake(MVK(200)).send();
                await stakeOperation.confirmation();

                // Mallory 
                await helperFunctions.signerFactory(tezos, mallory.sk);
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, mallory.pkh, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();

                stakeOperation = await doormanInstance.methods.stake(MVK(700)).send();
                await stakeOperation.confirmation();

                // ------------------------------
                // Register Satellite Operations
                // ------------------------------

                // Bob Satellite
                await helperFunctions.signerFactory(tezos, bob.sk);
                registerOperation = await delegationInstance.methods.registerAsSatellite(
                    mockSatelliteData.bob.name, 
                    mockSatelliteData.bob.desc,
                    mockSatelliteData.bob.image,
                    mockSatelliteData.bob.website, 
                    mockSatelliteData.bob.satelliteFee,
                    mockSatelliteData.bob.oraclePublicKey,
                    mockSatelliteData.bob.oraclePeerId
                ).send();
                await registerOperation.confirmation();

                // Eve Satellite
                await helperFunctions.signerFactory(tezos, eve.sk);
                updateOperatorsOperation    = await mvkTokenInstance.methods
                    .update_operators([
                    {
                        add_operator: {
                            owner: eve.pkh,
                            operator: doormanAddress.address,
                            token_id: 0,
                        },
                    },
                    ])
                    .send()
                await updateOperatorsOperation.confirmation();
                stakeOperation              = await doormanInstance.methods.stake(stakeAmount).send();
                await stakeOperation.confirmation();
                registerOperation           = await delegationInstance.methods.registerAsSatellite(
                    "Buzz Lightyear", 
                    "Buzz is a fabled part of our childhood. He was created by Disney and Pixar mainly voiced by Tim Allen. He is a Superhero toy action figure based on the in-universe media franchise Toy Story, consisting of a blockbuster feature film and animated series, a Space Ranger. While Buzz Lightyear's sole mission used to be defeating the evil Emperor Zurg, what he now cares about most is keeping Andy's toy family together. After he feature-film Lightyear starring Chris Evans, Buzz has decided to operate a satellite of the Mavryk Finance network and sign oracle price feeds to further grow and secure the future of financial independence.", 
                    "https://infura-ipfs.io/ipfs/QmcbigzB5PVfawr1jhctTWDgGTmLBZFbHPNfosDfq9zckQ", 
                    "https://toystory.disney.com/buzz-lightyear", 
                    350,
                    eve.pk,
                    eve.peerId
                ).send();
                await registerOperation.confirmation();

                // Mallory Satellite
                await helperFunctions.signerFactory(tezos, mallory.sk);
                updateOperatorsOperation    = await mvkTokenInstance.methods
                    .update_operators([
                    {
                        add_operator: {
                            owner: mallory.pkh,
                            operator: doormanAddress.address,
                            token_id: 0,
                        },
                    },
                    ])
                    .send()
                await updateOperatorsOperation.confirmation();
                stakeOperation              = await doormanInstance.methods.stake(stakeAmount).send();
                await stakeOperation.confirmation();
                registerOperation           = await delegationInstance.methods.registerAsSatellite(
                    "Captain Kirk", 
                    "James Tiberius \"Jim\" Kirk is a legendary Starfleet officer who lived during the 23rd century. His time in Starfleet, made Kirk arguably one of the most famous and sometimes infamous starship captains in Starfleet history. The highly decorated Kirk served as the commanding officer of the Constitution-class starships USS Enterprise and USS Enterprise-A, where he served Federation interests as an explorer, soldier, diplomat, and time traveler. He currently spends his time as a Mavryk Satellite and signs Oracle price feeds for the Mavryk Finance network.", 
                    "https://infura-ipfs.io/ipfs/QmT5aHNdawngnruJ2QtKxGd38H642fYjV7xqZ7HX5CuwRn", 
                    "https://intl.startrek.com/",
                    700,
                    mallory.pk,
                    mallory.peerId
                ).send();
                await registerOperation.confirmation();

                // Alice Satellite
                await helperFunctions.signerFactory(tezos, alice.sk);
                updateOperatorsOperation    = await mvkTokenInstance.methods
                    .update_operators([
                    {
                        add_operator: {
                            owner: alice.pkh,
                            operator: contractDeployments.doorman.address,
                            token_id: 0,
                        },
                    },
                    ])
                    .send()
                await updateOperatorsOperation.confirmation();
                stakeOperation              = await doormanInstance.methods.stake(stakeAmount).send();
                await stakeOperation.confirmation();
                registerOperation           = await delegationInstance.methods.registerAsSatellite(
                    "Bender Bending Rodriguez", 
                    "Bender Bending Rodriguez, the rebellious robot with a heart of gold, has found a new passion in the decentralized finance (DeFi) ecosystem. With his sharp wit and cunning, Bender has become a maverick in the blockchain and crypto space, always on the lookout for the latest trends and opportunities.\n\nNow, Bender uses his unique skills to navigate the DeFi world, taking risks and reaping the rewards. With his sharp mind and quick reflexes, Bender is a force to be reckoned with in the crypto space.\n\nBender frequently shouts \"Bite my shiny metal node!\" but don't be startled, despite his rough exterior, Bender has a soft spot for his fellow robots and Mavryks, he is fiercely loyal to the Mavryk Ecosystem.\n\nIn DeFi, Bender is a true original, pushing the boundaries and exploring new frontiers. With his wit, charm, and unyielding determination, Bender is a force to be reckoned with in the crypto world.", 
                    "https://cloudflare-ipfs.com/ipfs/QmNyw2PJEovUs9WgWHbZcKzzjxJdWL2qqAfEnZv1WkfGst", 
                    "https://mavryk.finance/", 
                    810,
                    alice.pk,
                    alice.peerId
                ).send();
                await registerOperation.confirmation();

                // Oscar Satellite
                await helperFunctions.signerFactory(tezos, oscar.sk);
                updateOperatorsOperation    = await mvkTokenInstance.methods
                    .update_operators([
                    {
                        add_operator: {
                            owner: oscar.pkh,
                            operator: contractDeployments.doorman.address,
                            token_id: 0,
                        },
                    },
                    ])
                    .send()
                await updateOperatorsOperation.confirmation();
                stakeOperation              = await doormanInstance.methods.stake(stakeAmount).send();
                await stakeOperation.confirmation();
                registerOperation           = await delegationInstance.methods.registerAsSatellite(
                    "R2-D2", 
                    "R2-D2 run's his Mavryk Satellite with unparalleled technical expertise and has a talent for solving complex problems. As an astromech droid, he's uniquely equipped to navigate the challenging terrain of DeFi and identify new opportunities for growth. R2-D2 is a natural leader with a deep sense of loyalty and compassion, always willing to lend a helping hand to his fellow maintainers and platform users. His adaptability and innovative spirit make him an invaluable asset to the DeFi ecosystem, and he's thrilled to be contributing to the future of finance through his work on the platform. In short, R2-D2 is a DeFi pioneer, leading the charge towards a more decentralized and equitable financial future.", 
                    "https://cloudflare-ipfs.com/ipfs/Qmf5UC3iLco9y3CUQpWXmzDdZwDCtZLFS8WL9oe85fKX9k", 
                    "https://mavryk.finance/", 
                    350,
                    oscar.pk,
                    oscar.peerId
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

                    mTokenEurlAddress.address,
                    
                    3000,
                    30 * 10 ** (interestRateDecimals - 2),
                    5 * 10 ** (interestRateDecimals - 2),
                    25 * 10 ** (interestRateDecimals - 2),
                    10 * 10 ** (interestRateDecimals - 2),
                    20 * 10 ** (interestRateDecimals - 2),
                    10000,

                    "fa2",
                    "KT1UhjCszVyY5dkNUXFGAwdNcVgVe2ZeuPv5",
                    0
                ).send();
                await setLoanTokenOperation.confirmation();

                // XTZ
                var setLoanTokenOperation = await lendingControllerInstance.methods.setLoanToken(
                    "createLoanToken",

                    "tez",
                    6,

                    xtzAggregator,

                    mTokenXtzAddress.address,
                    
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

                    mTokenUsdtAddress.address,
                    
                    3000,
                    30 * 10 ** (interestRateDecimals - 2),
                    5 * 10 ** (interestRateDecimals - 2),
                    25 * 10 ** (interestRateDecimals - 2),
                    10 * 10 ** (interestRateDecimals - 2),
                    20 * 10 ** (interestRateDecimals - 2),
                    10000,

                    "fa2",
                    "KT1H9hKtcqcMHuCoaisu8Qy7wutoUPFELcLm",
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
                    'KT1UhjCszVyY5dkNUXFGAwdNcVgVe2ZeuPv5',
                    6,

                    eurlAggregator,
                    false,
                    false,
                    false,
                    null,
                    null, // Max deposit amount

                    // fa12 token type - token contract address
                    "fa2",
                    "KT1UhjCszVyY5dkNUXFGAwdNcVgVe2ZeuPv5",
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
                    'KT1H9hKtcqcMHuCoaisu8Qy7wutoUPFELcLm',
                    6,

                    usdtAggregator,
                    false,
                    false,
                    false,
                    null,
                    null, // Max deposit amount

                    "fa2",
                    "KT1H9hKtcqcMHuCoaisu8Qy7wutoUPFELcLm",
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
                .withContractCall(governanceInstance.methods.updateGeneralContracts("farmTreasury", createdTreasuryAddress))
                .withContractCall(governanceInstance.methods.updateGeneralContracts("aggregatorTreasury", createdTreasuryAddress))
                .withContractCall(governanceInstance.methods.updateGeneralContracts("taxTreasury", createdTreasuryAddress))
                .withContractCall(governanceInstance.methods.updateGeneralContracts("satelliteTreasury", createdTreasuryAddress))
                .withContractCall(governanceInstance.methods.updateGeneralContracts("paymentTreasury", createdTreasuryAddress))
                .withContractCall(governanceInstance.methods.updateGeneralContracts("lendingTreasury", createdTreasuryAddress))

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
                    .withContractCall(treasuryInstance.methods.updateWhitelistTokenContracts("KT1H9hKtcqcMHuCoaisu8Qy7wutoUPFELcLm"))
                    .withContractCall(treasuryInstance.methods.updateWhitelistTokenContracts("KT1UhjCszVyY5dkNUXFGAwdNcVgVe2ZeuPv5"))
                    .withContractCall(treasuryInstance.methods.updateWhitelistTokenContracts("KT1P8RdJ5MfHMK5phKJ5JsfNfask5v2b2NQS"))
                    .withContractCall(treasuryInstance.methods.updateWhitelistTokenContracts(mvkTokenAddress.address))
                    .withContractCall(treasuryInstance.methods.updateWhitelistTokenContracts(mTokenEurlAddress.address))
                    .withContractCall(treasuryInstance.methods.updateWhitelistTokenContracts(mTokenXtzAddress.address))
                    .withContractCall(treasuryInstance.methods.updateWhitelistTokenContracts(mTokenUsdtAddress.address))
                    .withContractCall(treasuryInstance.methods.updateWhitelistContracts(aggregatorFactoryAddress.address))
                    .withContractCall(treasuryInstance.methods.updateWhitelistContracts(delegationAddress.address))
                    .withContractCall(treasuryInstance.methods.updateWhitelistContracts(doormanAddress.address))
                    .withContractCall(treasuryInstance.methods.updateWhitelistContracts(governanceAddress.address))
                    .withContractCall(treasuryInstance.methods.updateWhitelistContracts(governanceFinancialAddress.address))
    
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