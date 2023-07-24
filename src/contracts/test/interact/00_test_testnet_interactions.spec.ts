import { createLambdaBytes } from "@mavrykdynamics/create-lambda-bytes"
import { MichelsonMap } from "@taquito/taquito"
import { BigNumber } from "bignumber.js"

import { MVK, Utils, zeroAddress } from "../helpers/Utils"

// import governanceLambdaParamBytes from "../build/lambdas/governanceLambdaParametersBytes.json";

const chai = require("chai")
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised);   
chai.should();

// ------------------------------------------------------------------------------
// Contract Address
// ------------------------------------------------------------------------------

import contractDeployments from '../contractDeployments.json'

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { bob, alice, eve, mallory, trudy } from "../../scripts/sandbox/accounts";
import * as helperFunctions from '../helpers/helperFunctions'
import { mockSatelliteData } from "../helpers/mockSampleData"

// ------------------------------------------------------------------------------
// Testnet Setup
// ------------------------------------------------------------------------------

interface IOracleObservationType {
    data                : BigNumber;
    epoch               : number;
    round               : number;
    aggregatorAddress   : string;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("Testnet interactions helper", async () => {
    
    var utils: Utils;
    var tezos

    let doormanInstance;
    let delegationInstance;
    let mvkTokenInstance;
    let governanceInstance;
    let governanceProxyInstance;
    let emergencyGovernanceInstance;
    let breakGlassInstance;
    let councilInstance;
    let farmFactoryInstance;
    let vestingInstance;
    let governanceFinancialInstance;
    let treasuryFactoryInstance;
    let treasuryInstance;
    let farmInstance;
    let farmMTokenInstance;
    let lpTokenInstance;
    let governanceSatelliteInstance;
    let aggregatorInstance;
    let aggregatorFactoryInstance;
    let lendingControllerInstance;
    let lendingControllerMockTimeInstance;
    let mTokenEurlInstance;
    let mTokenUsdtInstance;
    let vaultInstance;
    let vaultFactoryInstance;
    let mavrykFa12TokenInstance;

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
    let lendingControllerStorage;
    let lendingControllerMockTimeStorage;
    let mTokenEurlStorage;
    let vaultStorage;
    let vaultFactoryStorage;
    let mavrykFa12TokenStorage;

    let createdTreasuryAddress;

    const treasuryMetadataBase = Buffer.from(
        JSON.stringify({
          name: 'MAVRYK Farm Treasury',
          description: 'MAVRYK Treasury Contract',
          version: 'v1.0.0',
          authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
        }),
        'ascii',
      ).toString('hex')

    let createdFarmAddress;
    const farmMetadataBase = Buffer.from(
        JSON.stringify({
            name: 'MAVRYK PLENTY-USDTz Farm',
            description: 'MAVRYK Farm Contract',
            version: 'v1.0.0',
            liquidityPairToken: {
                tokenAddress: ['KT18qSo4Ch2Mfq4jP3eME7SWHB8B8EDTtVBu'],
                origin: ['Plenty'],
                token0: {
                symbol: ['PLENTY'],
                tokenAddress: ['KT1GRSvLoikDsXujKgZPsGLX8k8VvR2Tq95b']
                },
                token1: {
                symbol: ['USDtz'],
                tokenAddress: ['KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9']
                }
            },
            authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
            }),
            'ascii',
        ).toString('hex')

    let createdAggregatorAddress;

    let createdVaultAddress;

    const oneDayLevelBlocks = 4320
    const oneMonthLevelBlocks = 129600
    const oneYearLevelBlocks = 1576800

    let generalContractsSet;

    before("setup", async () => {
        try{
            utils = new Utils();
            await utils.init(bob.sk);
            tezos = utils.tezos;
            
            doormanInstance                         = await utils.tezos.contract.at(contractDeployments.doorman.address);
            delegationInstance                      = await utils.tezos.contract.at(contractDeployments.delegation.address);
            mvkTokenInstance                        = await utils.tezos.contract.at(contractDeployments.mvkToken.address);
            governanceInstance                      = await utils.tezos.contract.at(contractDeployments.governance.address);
            governanceProxyInstance                 = await utils.tezos.contract.at(contractDeployments.governanceProxy.address);
            emergencyGovernanceInstance             = await utils.tezos.contract.at(contractDeployments.emergencyGovernance.address);
            breakGlassInstance                      = await utils.tezos.contract.at(contractDeployments.breakGlass.address);
            councilInstance                         = await utils.tezos.contract.at(contractDeployments.council.address);
            farmFactoryInstance                     = await utils.tezos.contract.at(contractDeployments.farmFactory.address);
            vestingInstance                         = await utils.tezos.contract.at(contractDeployments.vesting.address);
            governanceFinancialInstance             = await utils.tezos.contract.at(contractDeployments.governanceFinancial.address);
            treasuryFactoryInstance                 = await utils.tezos.contract.at(contractDeployments.treasuryFactory.address);
            treasuryInstance                        = await utils.tezos.contract.at(contractDeployments.treasury.address);
            farmInstance                            = await utils.tezos.contract.at(contractDeployments.farm.address);
            farmMTokenInstance                      = await utils.tezos.contract.at(contractDeployments.farmMToken.address);
            lpTokenInstance                         = await utils.tezos.contract.at(contractDeployments.mavrykFa12Token.address);
            governanceSatelliteInstance             = await utils.tezos.contract.at(contractDeployments.governanceSatellite.address);
            aggregatorInstance                      = await utils.tezos.contract.at(contractDeployments.aggregator.address);
            aggregatorFactoryInstance               = await utils.tezos.contract.at(contractDeployments.aggregatorFactory.address);
            lendingControllerInstance               = await utils.tezos.contract.at(contractDeployments.lendingController.address);
            // lendingControllerMockTimeInstance       = await utils.tezos.contract.at(contractDeployments.lendingControllerMockTime.address);
            mTokenUsdtInstance                      = await utils.tezos.contract.at(contractDeployments.mTokenUsdt.address);
            mTokenEurlInstance                      = await utils.tezos.contract.at(contractDeployments.mTokenEurl.address);
            vaultFactoryInstance                    = await utils.tezos.contract.at(contractDeployments.vaultFactory.address);
            mavrykFa12TokenInstance                 = await utils.tezos.contract.at(contractDeployments.mavrykFa12Token.address);
    
            doormanStorage                          = await doormanInstance.storage();
            delegationStorage                       = await delegationInstance.storage();
            mvkTokenStorage                         = await mvkTokenInstance.storage();
            governanceStorage                       = await governanceInstance.storage();
            governanceProxyStorage                  = await governanceProxyInstance.storage();
            emergencyGovernanceStorage              = await emergencyGovernanceInstance.storage();
            breakGlassStorage                       = await breakGlassInstance.storage();
            councilStorage                          = await councilInstance.storage();
            farmFactoryStorage                      = await farmFactoryInstance.storage();
            vestingStorage                          = await vestingInstance.storage();
            governanceFinancialStorage              = await governanceFinancialInstance.storage();
            treasuryFactoryStorage                  = await treasuryFactoryInstance.storage();
            treasuryStorage                         = await treasuryInstance.storage();
            farmStorage                             = await farmInstance.storage();
            lpTokenStorage                          = await lpTokenInstance.storage();
            governanceSatelliteStorage              = await governanceSatelliteInstance.storage();
            aggregatorStorage                       = await aggregatorInstance.storage();
            aggregatorFactoryStorage                = await aggregatorFactoryInstance.storage();
            lendingControllerStorage                = await lendingControllerInstance.storage();
            // lendingControllerMockTimeStorage        = await lendingControllerMockTimeInstance.storage();
            mTokenEurlStorage                       = await mTokenEurlInstance.storage();
            vaultFactoryStorage                     = await vaultFactoryInstance.storage();
            mavrykFa12TokenStorage                  = await mavrykFa12TokenInstance.storage();
    
            console.log('-- -- -- -- -- Testnet Interactions Helper -- -- -- --')
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
            console.log('Farm mToken Contract deployed at:'                     , contractDeployments.farmMToken.address);
            console.log('LP Token Contract deployed at:'                        , contractDeployments.mavrykFa12Token.address);
            console.log('Governance Satellite Contract deployed at:'            , contractDeployments.governanceSatellite.address);
            console.log('Aggregator Contract deployed at:'                      , contractDeployments.aggregator.address);
            console.log('Aggregator Factory Contract deployed at:'              , contractDeployments.aggregatorFactory.address);
            console.log('Lending Controller Contract deployed at:'              , contractDeployments.lendingController.address);
            // console.log('Lending Controller Mock Time Contract deployed at:'    , contractDeployments.lendingControllerMockTime.address);
            console.log('MToken USDT Contract deployed at:'                     , contractDeployments.mTokenUsdt.address);
            console.log('MToken EURL Contract deployed at:'                     , contractDeployments.mTokenEurl.address);
            console.log('Vault Factory Contract deployed at:'                   , contractDeployments.vaultFactory.address);
            console.log('Mavryk FA12 Token Contract deployed at:'               , contractDeployments.mavrykFa12Token.address);

            generalContractsSet             = [
                contractDeployments.aggregatorFactory.address,
                contractDeployments.breakGlass.address,
                contractDeployments.council.address,
                contractDeployments.delegation.address,
                contractDeployments.doorman.address,
                contractDeployments.emergencyGovernance.address,
                contractDeployments.farmFactory.address,
                contractDeployments.vesting.address,
                contractDeployments.treasuryFactory.address,
                contractDeployments.lendingController.address,
                contractDeployments.vaultFactory.address,
                contractDeployments.governance.address
            ]

        } catch(e){
            console.log(e)
        }
    });

    describe("MVK TOKEN", async () => {

        before("Send XTZ to treasury", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk);

            // Admin sends 2000XTZ to treasury contract
            const transferOperation = await utils.tezos.contract.transfer({ to: contractDeployments.treasury.address, amount: 500});
            await transferOperation.confirmation();
        });

        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk);
        });

        it('Admin sets admin', async () => {
            try{
                // Operation
                const operation = await mvkTokenInstance.methods.setAdmin(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets governance', async () => {
            try{
                // Operation
                const operation = await mvkTokenInstance.methods.setGovernance(contractDeployments.governance.address).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates whitelist contracts', async () => {
            try{
                // Operation
                const operation = await mvkTokenInstance.methods.updateWhitelistContracts(bob.pkh, "update").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates general contracts', async () => {
            try{
                // Operation
                const operation = await mvkTokenInstance.methods.updateGeneralContracts("test", bob.pkh, "update").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin transfers MVK', async () => {
            try{
                // Operation
                const operation = await mvkTokenInstance.methods.transfer([
                    {
                        from_: bob.pkh,
                        txs: [
                        {
                            to_: contractDeployments.treasury.address,
                            token_id: 0,
                            amount: MVK(5000),
                        },
                        {
                            to_: eve.pkh,
                            token_id: 0,
                            amount: MVK(1),
                        },
                        {
                            to_: alice.pkh,
                            token_id: 0,
                            amount: 0,
                        },
                        ],
                    },
                    ])
                    .send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates its operators', async () => {
            try{
                // Operation
                const operation = await mvkTokenInstance.methods.update_operators([
                    {
                        add_operator: {
                            owner: bob.pkh,
                            operator: contractDeployments.doorman.address,
                            token_id: 0,
                        },
                    },
                    ])
                    .send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin mints 50MVK', async () => {
            try{
                // Operation
                const operation = await mvkTokenInstance.methods.mint(bob.pkh, MVK(50)).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin burns 10MVK', async () => {
            try{
                // Operation
                const operation = await mvkTokenInstance.methods.burn(MVK(10)).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates the MVK inflation rate', async () => {
            try{
                // Operation
                const operation = await mvkTokenInstance.methods.updateInflationRate(700).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    })

    describe("DOORMAN", async () => {
        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk);
        });

        it('Admin add Doorman as an operator', async () => {
            try{
                // Operation
                const operation = await mvkTokenInstance.methods
                    .update_operators([
                    {
                        add_operator: {
                            owner: bob.pkh,
                            operator: contractDeployments.doorman.address,
                            token_id: 0,
                        },
                    },
                    ])
                    .send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin stakes 100MVK', async () => {
            try{
                // Operation
                const operation = await doormanInstance.methods.stake(MVK(100)).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin unstakes 50MVK', async () => {
            try{
                // Operation
                const operation = await doormanInstance.methods.unstake(MVK(50)).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin compounds', async () => {
            try{
                // Operation
                const operation = await doormanInstance.methods.compound([bob.pkh]).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin exits', async () => {
            try{
                // Operation
                var operation   = await doormanInstance.methods.exit().send();
                await operation.confirmation();

                // Admin restake
                operation       = await doormanInstance.methods.stake(MVK(100)).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets admin', async () => {
            try{
                // Operation
                const operation = await doormanInstance.methods.setAdmin(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets governance', async () => {
            try{
                // Operation
                const operation = await doormanInstance.methods.setGovernance(contractDeployments.governance.address).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates min MVK amount', async () => {
            try{
                // Operation
                const operation = await doormanInstance.methods.updateConfig(new BigNumber(MVK(0.01)), "configMinMvkAmount").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates whitelist contracts', async () => {
            try{
                // Operation
                const operation = await doormanInstance.methods.updateWhitelistContracts(bob.pkh, "update").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates general contracts', async () => {
            try{
                // Operation
                const operation = await doormanInstance.methods.updateGeneralContracts("test", bob.pkh, "update").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses stake', async () => {
            try{
                // Operation
                const operation = await doormanInstance.methods.togglePauseEntrypoint("stake", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses unstake', async () => {
            try{
                // Operation
                const operation = await doormanInstance.methods.togglePauseEntrypoint("unstake", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses exit', async () => {
            try{
                // Operation
                const operation = await doormanInstance.methods.togglePauseEntrypoint("exit", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses compound', async () => {
            try{
                // Operation
                const operation = await doormanInstance.methods.togglePauseEntrypoint("compound", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses farmClaim', async () => {
            try{
                // Operation
                const operation = await doormanInstance.methods.togglePauseEntrypoint("farmClaim", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses onVaultDepositStake', async () => {
            try{
                // Operation
                const operation = await doormanInstance.methods.togglePauseEntrypoint("onVaultDepositStake", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses onVaultWithdrawStake', async () => {
            try{
                // Operation
                const operation = await doormanInstance.methods.togglePauseEntrypoint("onVaultWithdrawStake", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses onVaultLiquidateStake', async () => {
            try{
                // Operation
                const operation = await doormanInstance.methods.togglePauseEntrypoint("onVaultLiquidateStake", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses all entrypoint', async () => {
            try{
                // Operation
                const operation = await doormanInstance.methods.pauseAll().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin unpauses all entrypoint', async () => {
            try{
                // Operation
                const operation = await doormanInstance.methods.unpauseAll().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    })

    describe("DELEGATION", async () => {
        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk);
        });

        it('Admin sets admin', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods.setAdmin(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets governance', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods.setGovernance(contractDeployments.governance.address).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates min SMVK balance required to interact with the entrypoints', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods.updateConfig(new BigNumber(MVK(0.01)), "configMinimumStakedMvkBalance").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates delegation ratio', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods.updateConfig(100, "configDelegationRatio").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates maximum satellites', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods.updateConfig(100, "configMaxSatellites").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates satellite name max length', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods.updateConfig(500, "configSatNameMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });


        it('Admin updates satellite description max length', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods.updateConfig(1000, "configSatDescMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });


        it('Admin updates satellite image max length', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods.updateConfig(1000, "configSatImageMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });


        it('Admin updates satellite website max length', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods.updateConfig(1000, "configSatWebsiteMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates whitelist contracts', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods.updateWhitelistContracts(bob.pkh, "update").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates general contracts', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods.updateGeneralContracts("test", bob.pkh, "update").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses delegateToSatellite', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods.togglePauseEntrypoint("delegateToSatellite", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses undelegateSatellite', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods.togglePauseEntrypoint("undelegateFromSatellite", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses registerSatellite', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods.togglePauseEntrypoint("registerAsSatellite", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses unregisterSatellite', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods.togglePauseEntrypoint("unregisterAsSatellite", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses updateSatellite', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods.togglePauseEntrypoint("updateSatelliteRecord", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses distributeReward', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods.togglePauseEntrypoint("distributeReward", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses all entrypoint', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods.pauseAll().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin unpauses all entrypoint', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods.unpauseAll().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin registers as a satellite', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods
                .registerAsSatellite(
                    mockSatelliteData.bob.name, 
                    mockSatelliteData.bob.desc, 
                    mockSatelliteData.bob.image,
                    mockSatelliteData.bob.website, 
                    mockSatelliteData.bob.satelliteFee,
                    mockSatelliteData.bob.oraclePublicKey, 
                    mockSatelliteData.bob.oraclePeerId
                ).send();
                await operation.confirmation();

                // Start governance cycle to validate satellite

                var updateOperation = await governanceInstance.methods.updateConfig(0, "configBlocksPerProposalRound").send();
                await updateOperation.confirmation();
                updateOperation = await governanceInstance.methods.updateConfig(0, "configBlocksPerVotingRound").send();
                await updateOperation.confirmation();
                updateOperation = await governanceInstance.methods.updateConfig(0, "configBlocksPerTimelockRound").send();
                await updateOperation.confirmation();
                const nextRoundOperation    = await governanceInstance.methods.startNextRound(false).send();
                await nextRoundOperation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates its satellite record', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods
                .updateSatelliteRecord(
                    "Astronaut Satellite", 
                    "This is the description", 
                    "https://www.iheartradio.ca/image/policy:1.15731844:1627581512/rick.jpg?f=default&$p$f=20c1bb3", 
                    "https://mavryk.finance/", 
                    1000
                ).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin unregister its satellite', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods
                .unregisterAsSatellite(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin register as satellite and user delegates to it', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods
                .registerAsSatellite(
                    mockSatelliteData.bob.name, 
                    mockSatelliteData.bob.desc, 
                    mockSatelliteData.bob.image,
                    mockSatelliteData.bob.website, 
                    mockSatelliteData.bob.satelliteFee,
                    mockSatelliteData.bob.oraclePublicKey, 
                    mockSatelliteData.bob.oraclePeerId
                ).send();
                await operation.confirmation();

                // Delegate Part
                await helperFunctions.signerFactory(tezos, alice.sk);
                var delegationOperation = await mvkTokenInstance.methods
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
                await delegationOperation.confirmation()
                delegationOperation = await doormanInstance.methods.stake(MVK(10)).send()
                await delegationOperation.confirmation()
                delegationOperation = await delegationInstance.methods.delegateToSatellite(alice.pkh, bob.pkh).send()
                await delegationOperation.confirmation()
            await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin distributes rewards', async () => {
            try{
                // Operation
                const operation = await delegationInstance.methods.distributeReward([bob.pkh], MVK(100)).send();
                await operation.confirmation();
            await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('User undelegates from satellite', async () => {
            try{
                // Operation
                await helperFunctions.signerFactory(tezos, alice.sk);
                const operation = await delegationInstance.methods.undelegateFromSatellite(alice.pkh).send();
                await operation.confirmation();
            await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    });

    describe("COUNCIL", async () => {
        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk);
        });

        it('Admin sets admin', async () => {
            try{
                // Operation
                const operation = await councilInstance.methods.setAdmin(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets governance', async () => {
            try{
                // Operation
                const operation = await councilInstance.methods.setGovernance(contractDeployments.governance.address).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates threshold', async () => {
            try{
                // Operation
                const operation = await councilInstance.methods.updateConfig(1, "configThreshold").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates action expiry in days', async () => {
            try{
                // Operation
                const operation = await councilInstance.methods.updateConfig(1, "configActionExpiryDays").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates council member name max length', async () => {
            try{
                // Operation
                const operation = await councilInstance.methods.updateConfig(500, "configCouncilNameMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates council member website max length', async () => {
            try{
                // Operation
                const operation = await councilInstance.methods.updateConfig(500, "configCouncilWebsiteMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates council member image max length', async () => {
            try{
                // Operation
                const operation = await councilInstance.methods.updateConfig(500, "configCouncilImageMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates request token name max length', async () => {
            try{
                // Operation
                const operation = await councilInstance.methods.updateConfig(500, "configRequestTokenNameMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates request purpose max length', async () => {
            try{
                // Operation
                const operation = await councilInstance.methods.updateConfig(500, "configRequestPurposeMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates whitelist contracts', async () => {
            try{
                // Operation
                const operation = await councilInstance.methods.updateWhitelistContracts(bob.pkh, "update").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates general contracts', async () => {
            try{
                // Operation
                const operation = await councilInstance.methods.updateGeneralContracts("bob", bob.pkh, "update").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Council member updates council member info', async () => {
            try{
                // Operation
                await helperFunctions.signerFactory(tezos, eve.sk)
                const operation = await councilInstance.methods.updateCouncilMemberInfo("Bob", "https://mavryk.finance/", "https://www.iheartradio.ca/image/policy:1.15731844:1627581512/rick.jpg?f=default&$p$f=20c1bb3").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Council member adds a council member', async () => {
            try{
                // Operation
                await helperFunctions.signerFactory(tezos, eve.sk)
                const operation = await councilInstance.methods.councilActionAddMember(bob.pkh, "Trudy", "https://mavryk.finance/", "https://www.iheartradio.ca/image/policy:1.15731844:1627581512/rick.jpg?f=default&$p$f=20c1bb3").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Council member removes a council member', async () => {
            try{
                // Operation
                await helperFunctions.signerFactory(tezos, eve.sk)
                const operation = await councilInstance.methods.councilActionRemoveMember(alice.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Council member changes a council member', async () => {
            try{
                // Operation
                await helperFunctions.signerFactory(tezos, eve.sk)
                const operation = await councilInstance.methods.councilActionChangeMember(alice.pkh, bob.pkh, "Trudy", "Bob Image", "Bob website").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Council member sets a baker', async () => {
            try{
                // Operation
                await helperFunctions.signerFactory(tezos, eve.sk)
                const operation = await councilInstance.methods.councilActionSetBaker().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Council member adds a new vestee', async () => {
            try{
                // Operation
                await helperFunctions.signerFactory(tezos, eve.sk)
                councilStorage  = await councilInstance.storage();
                const actionId  = councilStorage.actionCounter;
                var operation   = await councilInstance.methods.councilActionAddVestee(bob.pkh, new BigNumber(MVK(1000000000)), 0, 24).send()
                await operation.confirmation();

                await helperFunctions.signerFactory(tezos, alice.sk);
                operation       = await councilInstance.methods.signAction(actionId).send()
                await operation.confirmation();

            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Council member updates a vestee', async () => {
            try{
                // Operation
                await helperFunctions.signerFactory(tezos, eve.sk)
                const operation = await councilInstance.methods.councilActionUpdateVestee(bob.pkh, new BigNumber(MVK(1000000000)), 0, 24).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Council member locks a vestee', async () => {
            try{
                // Operation
                await helperFunctions.signerFactory(tezos, eve.sk)
                const operation = await councilInstance.methods.councilActionToggleVesteeLock(bob.pkh).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Council member removes a vestee', async () => {
            try{
                // Operation
                await helperFunctions.signerFactory(tezos, eve.sk)
                councilStorage  = await councilInstance.storage();
                const actionId  = councilStorage.actionCounter;
                var operation   = await councilInstance.methods.councilActionRemoveVestee(bob.pkh).send()
                await operation.confirmation();

                await helperFunctions.signerFactory(tezos, alice.sk);
                operation       = await councilInstance.methods.signAction(actionId).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Council member transfers token', async () => {
            try{
                // Operation
                await helperFunctions.signerFactory(tezos, eve.sk)
                const operation = await councilInstance.methods.councilActionTransfer(
                    bob.pkh,
                    contractDeployments.mvkToken.address,
                    MVK(20),
                    "FA2",
                    0,
                    "For testing purposes"
                ).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Council member requests token', async () => {
            try{
                // Operation
                await helperFunctions.signerFactory(tezos, eve.sk)
                const operation = await councilInstance.methods.councilActionRequestTokens(
                    contractDeployments.treasury.address,
                    bob.pkh,
                    contractDeployments.mvkToken.address,
                    "MVK",
                    MVK(20),
                    "FA2",
                    0,
                    "For testing purposes"
                ).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Council member requests mint', async () => {
            try{
                // Operation
                await helperFunctions.signerFactory(tezos, eve.sk)
                const operation = await councilInstance.methods.councilActionRequestMint(
                    contractDeployments.treasury.address,
                    bob.pkh,
                    MVK(20),
                    "For testing purposes"
                ).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Council member sets another contract baker', async () => {
            try{
                // Operation
                await helperFunctions.signerFactory(tezos, eve.sk)
                const operation = await councilInstance.methods.councilActionSetContractBaker(contractDeployments.treasury.address).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Council member flushes an action', async () => {
            try{
                // Operation
                await helperFunctions.signerFactory(tezos, eve.sk)
                const operation = await councilInstance.methods.flushAction(1).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Council member signs an action', async () => {
            try{
                // Operation
                await helperFunctions.signerFactory(tezos, eve.sk)
                councilStorage  = await councilInstance.storage();
                const actionId  = councilStorage.actionCounter;
                var operation = await councilInstance.methods.councilActionRequestTokens(
                    contractDeployments.treasury.address,
                    bob.pkh,
                    contractDeployments.mvkToken.address,
                    "MVK",
                    MVK(20),
                    "FA2",
                    0,
                    "For testing purposes"
                ).send()
                await operation.confirmation();

                await helperFunctions.signerFactory(tezos, alice.sk);
                operation = await councilInstance.methods.signAction(actionId).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Council member drops financial request', async () => {
            try{
                // Operation
                await helperFunctions.signerFactory(tezos, eve.sk)
                governanceFinancialStorage  = await governanceFinancialInstance.storage();
                const actionId              = governanceFinancialStorage.financialRequestCounter.toNumber() - 1;
                const operation             = await councilInstance.methods.councilActionDropFinancialReq(actionId).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    })

    describe("VESTING", async () => {
        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk);
        });

        it('Admin sets admin', async () => {
            try{
                // Operation
                const operation = await vestingInstance.methods.setAdmin(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets governance', async () => {
            try{
                // Operation
                const operation = await vestingInstance.methods.setGovernance(contractDeployments.governance.address).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates whitelist contracts', async () => {
            try{
                // Operation
                const operation = await vestingInstance.methods.updateWhitelistContracts(bob.pkh, "update").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates general contracts', async () => {
            try{
                // Operation
                const operation = await vestingInstance.methods.updateGeneralContracts("test", bob.pkh, "update").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin adds a new vestee', async () => {
            try{
                // Operation
                const operation = await vestingInstance.methods.addVestee(bob.pkh, MVK(2000000), 0, 24).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin claims', async () => {
            try{
                // Operation
                await wait(60 * 1000);
                const operation = await vestingInstance.methods.claim().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates a vestee', async () => {
            try{
                // Operation
                const operation = await vestingInstance.methods.updateVestee(bob.pkh, MVK(2000000), 0, 36).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin locks a vestee', async () => {
            try{
                // Operation
                const operation = await vestingInstance.methods.toggleVesteeLock(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin removes a vestee', async () => {
            try{
                // Operation
                const operation = await vestingInstance.methods.removeVestee(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    })

    describe("GOVERNANCE FINANCIAL", async () => {
        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk);
        });

        it('Admin sets admin', async () => {
            try{
                // Operation
                const operation = await governanceFinancialInstance.methods.setAdmin(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets governance', async () => {
            try{
                // Operation
                const operation = await governanceFinancialInstance.methods.setGovernance(contractDeployments.governance.address).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates the request approval percentage', async () => {
            try{
                // Operation
                const operation = await governanceFinancialInstance.methods.updateConfig(10, "configApprovalPercentage").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates the request duration in days', async () => {
            try{
                // Operation
                const operation = await governanceFinancialInstance.methods.updateConfig(1, "configFinancialReqDurationDays").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin updates general contracts', async () => {
            try{
                // Operation
                const operation = await governanceFinancialInstance.methods.updateGeneralContracts("test", bob.pkh, "update").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin updates whitelist token contracts', async () => {
            try{
                // Operation
                const operation = await governanceFinancialInstance.methods.updateWhitelistTokenContracts(bob.pkh, "update").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Council member requests tokens', async () => {
            try{
                // Operation
                await helperFunctions.signerFactory(tezos, eve.sk);
                councilStorage          = await councilInstance.storage()
                const actionCounter     = councilStorage.actionCounter
                var operation           = await councilInstance.methods.councilActionRequestTokens(
                    contractDeployments.treasury.address,
                    bob.pkh,
                    contractDeployments.mvkToken.address,
                    "MVK",
                    MVK(20),
                    "FA2",
                    0,
                    "For testing purposes"
                ).send()
                await operation.confirmation();
                await helperFunctions.signerFactory(tezos, alice.sk);
                operation               = await councilInstance.methods.signAction(actionCounter).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Council member requests mint', async () => {
            try{
                // Operation
                await helperFunctions.signerFactory(tezos, eve.sk);
                councilStorage          = await councilInstance.storage()
                const actionCounter     = councilStorage.actionCounter
                var operation = await councilInstance.methods.councilActionRequestMint(
                    contractDeployments.treasury.address,
                    bob.pkh,
                    MVK(20),
                    "For testing purposes"
                ).send()
                await operation.confirmation();
                await helperFunctions.signerFactory(tezos, alice.sk);
                operation               = await councilInstance.methods.signAction(actionCounter).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Council member drops financial request', async () => {
            try{
                // Operation
                await helperFunctions.signerFactory(tezos, eve.sk);
                councilStorage              = await councilInstance.storage()
                governanceFinancialStorage  = await governanceFinancialInstance.storage()
                const requestToDrop         = governanceFinancialStorage.financialRequestCounter.toNumber() - 1;
                const actionCounter         = councilStorage.actionCounter
                var operation               = await councilInstance.methods.councilActionDropFinancialReq(requestToDrop).send()
                await operation.confirmation();
                await helperFunctions.signerFactory(tezos, alice.sk);
                operation                   = await councilInstance.methods.signAction(actionCounter).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin votes for first request', async () => {
            try{
                // Operation
                councilStorage              = await councilInstance.storage()
                governanceFinancialStorage  = await governanceFinancialInstance.storage()
                const requestToDrop         = governanceFinancialStorage.financialRequestCounter.toNumber() - 2
                await helperFunctions.signerFactory(tezos, bob.sk);
                const operation             = await governanceFinancialInstance.methods.voteForRequest(requestToDrop, "yay").send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    })

    describe("TREASURY FACTORY", async () => {
        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk);
        });

        it('Admin sets admin', async () => {
            try{
                // Operation
                const operation = await treasuryFactoryInstance.methods.setAdmin(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets governance', async () => {
            try{
                // Operation
                const operation = await treasuryFactoryInstance.methods.setGovernance(contractDeployments.governance.address).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates whitelist contracts', async () => {
            try{
                // Operation
                const operation = await treasuryFactoryInstance.methods.updateWhitelistContracts(bob.pkh, "update").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates general contracts', async () => {
            try{
                // Operation
                const operation = await treasuryFactoryInstance.methods.updateGeneralContracts("bob", bob.pkh, "update").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin updates whitelist token contracts', async () => {
            try{
                // Operation
                const operation = await treasuryFactoryInstance.methods.updateWhitelistTokenContracts(bob.pkh, "update").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates treasury name max length', async () => {
            try{
                // Operation
                const operation = await treasuryFactoryInstance.methods.updateConfig(100, "configTreasuryNameMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses create treasury entrypoint', async () => {
            try{
                // Operation
                const operation = await treasuryFactoryInstance.methods.togglePauseEntrypoint("createTreasury", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses track treasury entrypoint', async () => {
            try{
                // Operation
                const operation = await treasuryFactoryInstance.methods.togglePauseEntrypoint("trackTreasury", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses untrack treasury entrypoint', async () => {
            try{
                // Operation
                const operation = await treasuryFactoryInstance.methods.togglePauseEntrypoint("untrackTreasury", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses all entrypoints', async () => {
            try{
                // Operation
                const operation = await treasuryFactoryInstance.methods.pauseAll().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin unpauses all entrypoints', async () => {
            try{
                // Operation
                const operation = await treasuryFactoryInstance.methods.unpauseAll().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin creates a treasury', async () => {
            try{
                // Operation
                const operation = await treasuryFactoryInstance.methods.createTreasury(
                    null,
                    "treasuryInteraction",
                    true,
                    treasuryMetadataBase
                ).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin untracks a treasury', async () => {
            try{
                // Operation
                treasuryFactoryStorage  = await treasuryFactoryInstance.storage();
                const trackedTreasuries = treasuryFactoryStorage.trackedTreasuries
                createdTreasuryAddress  = trackedTreasuries[0]
                const operation = await treasuryFactoryInstance.methods.untrackTreasury(createdTreasuryAddress).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin tracks a treasury', async () => {
            try{
                // Operation
                const operation = await treasuryFactoryInstance.methods.trackTreasury(createdTreasuryAddress).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    })

    describe("TREASURY", async () => {
        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk);
        });

        it('Admin sets admin', async () => {
            try{
                // Operation
                const operation = await treasuryInstance.methods.setAdmin(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets governance', async () => {
            try{
                // Operation
                const operation = await treasuryInstance.methods.setGovernance(contractDeployments.governance.address).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets baker', async () => {
            try{
                // Operation
                const operation = await treasuryInstance.methods.setBaker(null).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates whitelist contracts', async () => {
            try{
                // Operation
                const operation = await treasuryInstance.methods.updateWhitelistContracts(bob.pkh, "update").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates general contracts', async () => {
            try{
                // Operation
                const operation = await treasuryInstance.methods.updateGeneralContracts("bob", bob.pkh, "update").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin updates whitelist token contracts', async () => {
            try{
                // Operation
                const operation = await treasuryInstance.methods.updateWhitelistTokenContracts(bob.pkh, "update").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses create transfer entrypoint', async () => {
            try{
                // Operation
                const operation = await treasuryInstance.methods.togglePauseEntrypoint("transfer", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses mint and transfer entrypoint', async () => {
            try{
                // Operation
                const operation = await treasuryInstance.methods.togglePauseEntrypoint("mintMvkAndTransfer", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses stake tokens entrypoint', async () => {
            try{
                // Operation
                const operation = await treasuryInstance.methods.togglePauseEntrypoint("stakeTokens", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses unstake tokens entrypoint', async () => {
            try{
                // Operation
                const operation = await treasuryInstance.methods.togglePauseEntrypoint("unstakeTokens", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses all entrypoints', async () => {
            try{
                // Operation
                const operation = await treasuryInstance.methods.pauseAll().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin unpauses all entrypoints', async () => {
            try{
                // Operation
                const operation = await treasuryInstance.methods.unpauseAll().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    })

    describe("FARM FACTORY", async () => {
        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk);
        });

        it('Admin sets admin', async () => {
            try{
                // Operation
                const operation = await farmFactoryInstance.methods.setAdmin(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets governance', async () => {
            try{
                // Operation
                const operation = await farmFactoryInstance.methods.setGovernance(contractDeployments.governance.address).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates whitelist contracts', async () => {
            try{
                // Operation
                const operation = await farmFactoryInstance.methods.updateWhitelistContracts(bob.pkh, "update").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates general contracts', async () => {
            try{
                // Operation
                const operation = await farmFactoryInstance.methods.updateGeneralContracts("bob", bob.pkh, "update").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates farm name max length', async () => {
            try{
                // Operation
                const operation = await farmFactoryInstance.methods.updateConfig(100, "configFarmNameMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses create farm entrypoint', async () => {
            try{
                // Operation
                const operation = await farmFactoryInstance.methods.togglePauseEntrypoint("createFarm", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses track farm entrypoint', async () => {
            try{
                // Operation
                const operation = await farmFactoryInstance.methods.togglePauseEntrypoint("trackFarm", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses untrack farm entrypoint', async () => {
            try{
                // Operation
                const operation = await farmFactoryInstance.methods.togglePauseEntrypoint("untrackFarm", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses all entrypoints', async () => {
            try{
                // Operation
                const operation = await farmFactoryInstance.methods.pauseAll().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin unpauses all entrypoints', async () => {
            try{
                // Operation
                const operation = await farmFactoryInstance.methods.unpauseAll().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin creates a farm', async () => {
            try{
                // Operation
                const farmMetadataBase2 = Buffer.from(
                    JSON.stringify({
                    name: "MAVRYK USDT.e-USDC.e Farm",
                    description: "Mavryk Farm Contract for USDT.e-USDC.e",
                    version: "v1.0.0",
                    liquidityPairToken: {
                        tokenAddress: ["KT1CDeAxaiqbA5aMkPMmqqYXxqgfFwocJHza"],
                        origin: ["Mavryk Finance"],
                        symbol: ["MLP"],
                        thumbnailUri: "https://infura-ipfs.io/ipfs/QmaazYGXFxbLvdVBUkxkprsZuBpQeraMWyUkU1gGsigiYm",
                        decimals: 15,
                        token0: {
                            symbol: ["USDT.e"],
                            tokenAddress: ["KT1GRSvLoikDsXujKgZPsGLX8k8VvR2Tq95b"],
                            thumbnailUri: "https://infura-ipfs.io/ipfs/QmdQ4R6TtBe75wSVEsLfRDtAn36Bv2zLAHyVe1cuLYeyfK"
                        },
                        token1: {
                            symbol: ["USDC.e"],
                            tokenAddress: ["KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9"],
                            thumbnailUri: "https://www.plentydefi.com/static/media/usdc_icon.771d659c.svg"
                        }
                    },
                    authors: ["MAVRYK Dev Team <contact@mavryk.finance>"]
                    }),
                    'ascii',
                ).toString('hex')
                const operation = await farmFactoryInstance.methods.createFarm(
                    "testFarm",
                    false,
                    false,
                    false,
                    12000,
                    100,
                    farmMetadataBase2,
                    contractDeployments.mavrykFa12Token.address,
                    0,
                    "fa12",
                ).send();
                await operation.confirmation()
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin untracks a farm', async () => {
            try{
                // Operation
                farmFactoryStorage  = await farmFactoryInstance.storage();
                const trackedFarms  = farmFactoryStorage.trackedFarms
                createdFarmAddress  = trackedFarms[0]
                const operation = await farmFactoryInstance.methods.untrackFarm(createdFarmAddress).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin tracks a farm', async () => {
            try{
                // Operation
                const operation = await farmFactoryInstance.methods.trackFarm(createdFarmAddress).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    })

    describe("FARM", async () => {
        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk);
        });

        it('Admin sets admin', async () => {
            try{
                // Operation
                const operation = await farmInstance.methods.setAdmin(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets governance', async () => {
            try{
                // Operation
                const operation = await farmInstance.methods.setGovernance(contractDeployments.governance.address).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin init a farm', async () => {
            try{
                // Operation
                const operation = await farmInstance.methods.initFarm(
                    12000,
                    100,
                    false,
                    false
                ).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates the rewards from transfer boolean', async () => {
            try{
                // Operation
                const operation = await farmInstance.methods.updateConfig(0, "configForceRewardFromTransfer").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates rewards per block', async () => {
            try{
                // Operation
                const operation = await farmInstance.methods.updateConfig(new BigNumber(MVK(2)), "configRewardPerBlock").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates whitelist contracts', async () => {
            try{
                // Operation
                const operation = await farmInstance.methods.updateWhitelistContracts(bob.pkh, "update").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates general contracts', async () => {
            try{
                // Operation
                const operation = await farmInstance.methods.updateGeneralContracts("bob", bob.pkh, "update").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses deposit entrypoint', async () => {
            try{
                // Operation
                const operation = await farmInstance.methods.togglePauseEntrypoint("deposit", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses withdraw entrypoint', async () => {
            try{
                // Operation
                const operation = await farmInstance.methods.togglePauseEntrypoint("withdraw", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses claim entrypoint', async () => {
            try{
                // Operation
                const operation = await farmInstance.methods.togglePauseEntrypoint("claim", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses all entrypoints', async () => {
            try{
                // Operation
                const operation = await farmInstance.methods.pauseAll().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin unpauses all entrypoints', async () => {
            try{
                // Operation
                const operation = await farmInstance.methods.unpauseAll().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin deposits 2LP into the farm', async () => {
            try{
                // Operation
                var operation = await lpTokenInstance.methods.approve(contractDeployments.farm.address, 2).send()
                await operation.confirmation();
                operation = await farmInstance.methods.deposit(2).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin withdraw 1LP from the farm', async () => {
            try{
                // Operation
                const operation = await farmInstance.methods.withdraw(1).send();
                await operation.confirmation()
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin claims from the farm', async () => {
            try{
                // Operation
                var operation   = await farmFactoryInstance.methods.trackFarm(contractDeployments.farm.address).send()
                await operation.confirmation();
                operation       = await farmInstance.methods.claim([bob.pkh]).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin closes a farm', async () => {
            try{
                // Operation
                const operation = await farmInstance.methods.closeFarm().send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    })

    describe("AGGREGATOR FACTORY", async () => {
        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk);
        });

        it('Admin sets admin', async () => {
            try{
                // Operation
                const operation = await aggregatorFactoryInstance.methods.setAdmin(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets governance', async () => {
            try{
                // Operation
                const operation = await aggregatorFactoryInstance.methods.setGovernance(contractDeployments.governance.address).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates aggregator name max length', async () => {
            try{
                // Operation
                const operation = await aggregatorFactoryInstance.methods.updateConfig(500, "configAggregatorNameMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates whitelist contracts', async () => {
            try{
                // Operation
                const operation = await aggregatorFactoryInstance.methods.updateWhitelistContracts(bob.pkh, "update").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates general contracts', async () => {
            try{
                // Operation
                const operation = await aggregatorFactoryInstance.methods.updateGeneralContracts("bob", bob.pkh, "update").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses create aggregator', async () => {
            try{
                // Operation
                const operation = await aggregatorFactoryInstance.methods.togglePauseEntrypoint("createAggregator", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses track aggregator', async () => {
            try{
                // Operation
                const operation = await aggregatorFactoryInstance.methods.togglePauseEntrypoint("trackAggregator", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses untrack aggregator', async () => {
            try{
                // Operation
                const operation = await aggregatorFactoryInstance.methods.togglePauseEntrypoint("untrackAggregator", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses distribute reward xtz', async () => {
            try{
                // Operation
                const operation = await aggregatorFactoryInstance.methods.togglePauseEntrypoint("distributeRewardXtz", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses distribute reward smvk', async () => {
            try{
                // Operation
                const operation = await aggregatorFactoryInstance.methods.togglePauseEntrypoint("distributeRewardStakedMvk", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses all entrypoints', async () => {
            try{
                // Operation
                const operation = await aggregatorFactoryInstance.methods.pauseAll().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin unpauses all entrypoints', async () => {
            try{
                // Operation
                const operation = await aggregatorFactoryInstance.methods.unpauseAll().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin creates three aggregators with different metadata', async () => {
            try{
  
                const oracleMap = MichelsonMap.fromLiteral({
                    [bob.pkh]              : {
                                                oraclePublicKey: bob.pk,
                                                oraclePeerId: bob.peerId
                                            },
                    [eve.pkh]              : {
                                                oraclePublicKey: eve.pk,
                                                oraclePeerId: eve.peerId
                                            },
                    [mallory.pkh]          : {
                                                oraclePublicKey: mallory.pk,
                                                oraclePeerId: mallory.peerId
                                            }
                });

                // USD/BTC Aggregator
                var aggregatorMetadata = Buffer.from(
                    JSON.stringify({
                        name: 'MAVRYK Aggregator Contract',
                        icon: 'https://logo.chainbit.xyz/btc',
                        version: 'v1.0.0',
                        authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
                        category: 'cryptocurrency'
                    }),
                    'ascii',
                ).toString('hex')
                var operation = await aggregatorFactoryInstance.methods.createAggregator(
    
                    'USD/BTC',
                    true,
                    
                    oracleMap,
    
                    new BigNumber(8),             // decimals
                    new BigNumber(2),             // alphaPercentPerThousand
                    
                    new BigNumber(60),            // percentOracleThreshold
                    new BigNumber(30),            // heartbeatSeconds

                    new BigNumber(10000000),      // rewardAmountStakedMvk
                    new BigNumber(1300),          // rewardAmountXtz
                    
                    aggregatorMetadata            // metadata
                ).send()
                await operation.confirmation();

                // USD/BTC Aggregator
                aggregatorMetadata = Buffer.from(
                    JSON.stringify({
                        name: 'MAVRYK Aggregator Contract',
                        icon: 'https://logo.chainbit.xyz/usdt',
                        version: 'v1.0.0',
                        authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
                        category: 'stablecoin'
                    }),
                    'ascii',
                ).toString('hex')
                operation = await aggregatorFactoryInstance.methods.createAggregator(
    
                    'USD/USDT',
                    true,
                    
                    oracleMap,
    
                    new BigNumber(6),             // decimals
                    new BigNumber(2),             // alphaPercentPerThousand
                    
                    new BigNumber(60),            // percentOracleThreshold
                    new BigNumber(30),            // heartbeatSeconds

                    new BigNumber(10000000),      // rewardAmountStakedMvk
                    new BigNumber(1300),          // rewardAmountXtz
                    
                    aggregatorMetadata        // metadata
                ).send()
                await operation.confirmation();

                // USD/BTC Aggregator
                aggregatorMetadata = Buffer.from(
                    JSON.stringify({
                        name: 'MAVRYK Aggregator Contract',
                        icon: 'https://logo.chainbit.xyz/link',
                        version: 'v1.0.0',
                        authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
                        category: 'commodities'
                    }),
                    'ascii',
                ).toString('hex')
                operation = await aggregatorFactoryInstance.methods.createAggregator(
    
                    'USD/WTI',
                    true,
                    
                    oracleMap,
    
                    new BigNumber(6),             // decimals
                    new BigNumber(2),             // alphaPercentPerThousand
                    
                    new BigNumber(60),            // percentOracleThreshold
                    new BigNumber(30),            // heartbeatSeconds

                    new BigNumber(10000000),      // rewardAmountStakedMvk
                    new BigNumber(1300),          // rewardAmountXtz
                    
                    aggregatorMetadata        // metadata
                ).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin untracks an aggregator', async () => {
            try{
                // Operation
                aggregatorFactoryStorage    = await aggregatorFactoryInstance.storage();
                createdAggregatorAddress    = await aggregatorFactoryStorage.trackedAggregators[0]
                const operation             = await aggregatorFactoryInstance.methods.untrackAggregator(createdAggregatorAddress).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin tracks an aggregator', async () => {
            try{
                // Operation
                const operation = await aggregatorFactoryInstance.methods.trackAggregator(createdAggregatorAddress).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    })

    describe("AGGREGATOR", async () => {

        before("AggregatorFactory tracks aggregator", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk);
            
            // Operation
            const operation = await aggregatorFactoryInstance.methods.trackAggregator(contractDeployments.aggregator.address).send();
            await operation.confirmation();
        });

        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk);
        });

        it('Admin sets admin', async () => {
            try{
                // Operation
                const operation = await aggregatorInstance.methods.setAdmin(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets governance', async () => {
            try{
                // Operation
                const operation = await aggregatorInstance.methods.setGovernance(contractDeployments.governance.address).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets name', async () => {
            try{
                // Operation
                const operation = await aggregatorInstance.methods.setName("AggregatorTest").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates whitelist contracts', async () => {
            try{
                // Operation
                const operation = await aggregatorInstance.methods.updateWhitelistContracts(bob.pkh, "update").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates general contracts', async () => {
            try{
                // Operation
                const operation = await aggregatorInstance.methods.updateGeneralContracts("test", bob.pkh, "update").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin adds an oracle', async () => {
            try{
                // Operation
                const operation = await aggregatorInstance.methods.addOracle(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates an oracle', async () => {
            try{
                // Operation
                const operation = await aggregatorInstance.methods.updateOracle().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin removes an oracle', async () => {
            try{
                // Operation
                var operation   = await aggregatorInstance.methods.removeOracle(bob.pkh).send();
                await operation.confirmation();
                var operation       = await aggregatorInstance.methods.addOracle(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses %updateData', async () => {
            try{
                // Operation
                const operation = await aggregatorInstance.methods.togglePauseEntrypoint("updateData", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses %withdrawRewardXtz', async () => {
            try{
                // Operation
                const operation = await aggregatorInstance.methods.togglePauseEntrypoint("withdrawRewardXtz", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses %withdrawRewardStakedMvk', async () => {
            try{
                // Operation
                const operation = await aggregatorInstance.methods.togglePauseEntrypoint("withdrawRewardStakedMvk", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses all entrypoints', async () => {
            try{
                // Operation
                const operation = await aggregatorInstance.methods.pauseAll().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin unpauses all entrypoints', async () => {
            try{
                // Operation
                const operation = await aggregatorInstance.methods.unpauseAll().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates data', async () => {
            try{
                // Initial values
                const observations = [
                {
                    "oracle": bob.pkh,
                    "data": new BigNumber(10142857143)
                }
                ];
                const epoch: number = 1;
                const round: number = 1;
                const oracleObservations = new MichelsonMap<string, IOracleObservationType>();
                for (const { oracle, data } of observations) {
                   oracleObservations.set(oracle, {
                       data,
                       epoch,
                       round,
                       aggregatorAddress: contractDeployments.aggregator.address
                     });
                };
       
                const signatures = new MichelsonMap<string, string>();
       
                await helperFunctions.signerFactory(tezos, bob.sk);;
                signatures.set(bob.pkh, await utils.signOracleDataResponses(oracleObservations));
       
                // Operation
                aggregatorStorage   = await aggregatorInstance.storage()

                const operation = await aggregatorInstance.methods.updateData(
                    oracleObservations,
                    signatures
                ).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin withdraws rewards xtz', async () => {
            try{
                // Operation
                var operation = await aggregatorInstance.methods.withdrawRewardXtz(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin withdraws rewards smvk', async () => {
            try{
                // Operation
                var operation = await aggregatorInstance.methods.withdrawRewardStakedMvk(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates decimals', async () => {
            try{
                // Operation
                var operation = await aggregatorInstance.methods.updateConfig(9, "configDecimals").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates heart beat seconds', async () => {
            try{
                // Operation
                var operation = await aggregatorInstance.methods.updateConfig(15, "configHeartbeatSeconds").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates the alpha percent per thousand', async () => {
            try{
                // Operation
                var operation = await aggregatorInstance.methods.updateConfig(2, "configAlphaPercentPerThousand").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates number percentage oracle threshold', async () => {
            try{
                // Operation
                var operation = await aggregatorInstance.methods.updateConfig(50, "configPercentOracleThreshold").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates reward smvk', async () => {
            try{
                // Operation
                var operation = await aggregatorInstance.methods.updateConfig(MVK(1), "configRewardAmountStakedMvk").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates reward xtz', async () => {
            try{
                // Operation
                var operation = await aggregatorInstance.methods.updateConfig(100, "configRewardAmountXtz").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    })

    describe("GOVERNANCE", async () => {

        before("Set FarmFactory admin", async () => {
            // Set the farm factory admin
            const setAdminOperation     = await farmFactoryInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
            await setAdminOperation.confirmation()
        })

        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk);
        });

        it('Admin sets admin', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.setAdmin(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets governance proxy', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.setGovernanceProxy(contractDeployments.governanceProxy.address).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates success reward', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.updateConfig(new BigNumber(MVK(300)), "configSuccessReward").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates cycle voters reward', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.updateConfig(new BigNumber(MVK(500)), "configCycleVotersReward").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates min proposal round vote pct', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.updateConfig(0, "configMinProposalRoundVotePct").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates min quorum pct', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.updateConfig(0, "configMinQuorumPercentage").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates min yay vote mvk total', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.updateConfig(1, "configMinYayVotePercentage").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates propose fee mutez', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.updateConfig(1000000, "configProposeFeeMutez").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates max proposal per satellite', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.updateConfig(2, "configMaxProposalsPerSatellite").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates blocks per proposal round', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.updateConfig(0, "configBlocksPerProposalRound").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates blocks per voting round', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.updateConfig(0, "configBlocksPerVotingRound").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates blocks per timelock round', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.updateConfig(0, "configBlocksPerTimelockRound").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin updates proposal data title max length', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.updateConfig(500, "configDataTitleMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin updates proposal title max length', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.updateConfig(500, "configProposalTitleMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });


        it('Admin updates proposal description max length', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.updateConfig(1000, "configProposalDescMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });


        it('Admin updates proposal invoice max length', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.updateConfig(1000, "configProposalInvoiceMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates proposal code max length', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.updateConfig(1000, "configProposalCodeMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates whitelist developers', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.updateWhitelistDevelopers(trudy.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates general contracts', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.updateGeneralContracts("test", bob.pkh, "update").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets other contract admin', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.setContractAdmin(contractDeployments.doorman.address, bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets other contract governance', async () => {
            try{
                // Operation
                const operation = await governanceInstance.methods.setContractGovernance(contractDeployments.doorman.address, contractDeployments.governance.address).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin executes an entire proposal (with %executeProposal)', async () => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Create a farm";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Create a farm compiled params
                const lambdaFunction        = await createLambdaBytes(
                    tezos.rpc.url,
                    contractDeployments.governanceProxy.address,
                    
                    'createFarm',
                    [
                        contractDeployments.farmFactory.address,
                        "testFarm",
                        false,
                        false,
                        false,
                        12000,
                        100,
                        farmMetadataBase,
                        contractDeployments.mavrykFa12Token.address,
                        0,
                        "FA12"
                    ]
                );
                const proposalData      = [
                    {
                        addOrSetProposalData: {
                            title: "FirstFarm#1",
                            encodedCode: lambdaFunction,
                            codeDescription: ""
                        }
                    }
                ]

                const paymentData        = [
                    {
                        addOrSetPaymentData: {
                            title: "Payment#1",
                            transaction: {
                                "to_"    : bob.pkh,
                                "token"  : {
                                    "fa2" : {
                                        "tokenContractAddress" : contractDeployments.mvkToken.address,
                                        "tokenId" : 0
                                    }
                                },
                                "amount" : MVK(50)
                            }
                        }
                    },
                    {
                        addOrSetPaymentData: {
                            title: "Payment#2",
                            transaction: {
                                "to_"    : bob.pkh,
                                "token"  : {
                                    "fa2" : {
                                        "tokenContractAddress" : contractDeployments.mvkToken.address,
                                        "tokenId" : 0
                                    }
                                },
                                "amount" : MVK(50)
                            }
                        }
                    }
                ]

                // Start governance rounds
                var nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();
                const proposeOperation          = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const addPaymentDataOperation   = await governanceInstance.methods.updateProposalData(proposalId, null, paymentData).send()
                await addPaymentDataOperation.confirmation();
                const lockOperation             = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                nextRoundOperation              = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin claims rewards for the past proposal', async () => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                const proposalId            = governanceStorage.nextProposalId.toNumber() - 1;

                // Operation
                const distributeRewardsOperation    = await governanceInstance.methods.distributeProposalRewards(
                    bob.pkh,
                    [
                        proposalId
                    ]
                ).send();
                await distributeRewardsOperation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin executes an entire proposal (with %processProposalSingleData)', async () => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Create multiple farms";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Create a farm compiled params
                const lambdaFunction        = await createLambdaBytes(
                    tezos.rpc.url,
                    contractDeployments.governanceProxy.address,
                    
                    'createFarm',
                    [
                        contractDeployments.farmFactory.address,
                        "testFarm",
                        false,
                        false,
                        false,
                        12000,
                        100,
                        farmMetadataBase,
                        contractDeployments.mavrykFa12Token.address,
                        0,
                        "FA12"
                    ]
                );
                const proposalData      = [
                    {
                        addOrSetProposalData: {
                            title: "FirstFarm#1",
                            encodedCode: lambdaFunction,
                            codeDescription: ""
                        }
                    },
                    {
                        addOrSetProposalData: {
                            title: "FirstFarm#2",
                            encodedCode: lambdaFunction,
                            codeDescription: ""
                        }
                    },
                    {
                        addOrSetProposalData: {
                            title: "FirstFarm#3",
                            encodedCode: lambdaFunction,
                            codeDescription: ""
                        }
                    },
                    {
                        addOrSetProposalData: {
                            title: "FirstFarm#4",
                            encodedCode: lambdaFunction,
                            codeDescription: ""
                        }
                    },
                    {
                        addOrSetProposalData: {
                            title: "FirstFarm#5",
                            encodedCode: lambdaFunction,
                            codeDescription: ""
                        }
                    }
                ]

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();
                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(false).send();
                await nextRoundOperation.confirmation();

                const executeSingleDataBatch = await utils.tezos.wallet
                .batch()
                .withContractCall(governanceInstance.methods.processProposalSingleData(proposalId))
                .withContractCall(governanceInstance.methods.processProposalSingleData(proposalId))
                .withContractCall(governanceInstance.methods.processProposalSingleData(proposalId))
                .withContractCall(governanceInstance.methods.processProposalSingleData(proposalId))
                .withContractCall(governanceInstance.methods.processProposalSingleData(proposalId))
                const processProposalSingleDataBatchOperation = await executeSingleDataBatch.send()
                await processProposalSingleDataBatchOperation.confirmation()
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin drops a proposal', async () => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "proposal to drop";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Create a farm compiled params
                const lambdaFunction        = await createLambdaBytes(
                    tezos.rpc.url,
                    contractDeployments.governanceProxy.address,
                    
                    'createFarm',
                    [
                        contractDeployments.farmFactory.address,
                        "testFarm",
                        false,
                        false,
                        false,
                        12000,
                        100,
                        farmMetadataBase,
                        contractDeployments.mavrykFa12Token.address,
                        0,
                        "FA12"
                    ]
                );

                const proposalData      = [
                    {
                        addOrSetProposalData: {
                            title: "FirstFarm#1",
                            encodedCode: lambdaFunction,
                            codeDescription: ""
                        }
                    }
                ]

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();
                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const dropOperation         = await governanceInstance.methods.dropProposal(proposalId).send();
                await dropOperation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    });

    describe("GOVERNANCE SATELLITE", async () => {

        before("Register another satellite for testing purposes", async () => {
            // Operation
            await helperFunctions.signerFactory(tezos, alice.sk);
            const operation = await delegationInstance.methods
            .registerAsSatellite(
                mockSatelliteData.alice.name, 
                mockSatelliteData.alice.desc, 
                mockSatelliteData.alice.image,
                mockSatelliteData.alice.website, 
                mockSatelliteData.alice.satelliteFee,
                mockSatelliteData.alice.oraclePublicKey, 
                mockSatelliteData.alice.oraclePeerId
            ).send();
            await operation.confirmation();
            await helperFunctions.signerFactory(tezos, bob.sk);
        })

        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk);
        });

        it('Admin sets admin', async () => {
            try{
                // Operation
                const operation = await governanceSatelliteInstance.methods.setAdmin(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets governance', async () => {
            try{
                // Operation
                const operation = await governanceSatelliteInstance.methods.setGovernance(contractDeployments.governance.address).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates approval percentage', async () => {
            try{
                // Operation
                const operation = await governanceSatelliteInstance.methods.updateConfig(1, "configApprovalPercentage").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates satellite duration in days', async () => {
            try{
                // Operation
                const operation = await governanceSatelliteInstance.methods.updateConfig(1, "configActionDurationInDays").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates purpose max length', async () => {
            try{
                // Operation
                const operation = await governanceSatelliteInstance.methods.updateConfig(500, "configPurposeMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates whitelist contracts', async () => {
            try{
                // Operation
                const operation = await governanceSatelliteInstance.methods.updateWhitelistContracts(bob.pkh, "update").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates general contracts', async () => {
            try{
                // Operation
                const operation = await governanceSatelliteInstance.methods.updateGeneralContracts("bob", bob.pkh, "update").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin suspends a satellite', async () => {
            try{
                // Operation
                governanceSatelliteStorage  = await governanceSatelliteInstance.storage()
                const actionId              = governanceSatelliteStorage.governanceSatelliteCounter
                var operation               = await governanceSatelliteInstance.methods.suspendSatellite(alice.pkh, "For tests purposes").send();
                await operation.confirmation();

                operation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin bans a satellite', async () => {
            try{
                // Operation
                governanceSatelliteStorage  = await governanceSatelliteInstance.storage()
                const actionId              = governanceSatelliteStorage.governanceSatelliteCounter
                var operation               = await governanceSatelliteInstance.methods.banSatellite(alice.pkh, "For tests purposes").send();
                await operation.confirmation();

                operation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin restores a satellite', async () => {
            try{
                // Operation
                governanceSatelliteStorage  = await governanceSatelliteInstance.storage()
                const actionId              = governanceSatelliteStorage.governanceSatelliteCounter
                var operation               = await governanceSatelliteInstance.methods.restoreSatellite(alice.pkh, "For tests purposes").send();
                await operation.confirmation();

                operation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates an aggregator status', async () => {
            try{
                // Operation
                governanceSatelliteStorage  = await governanceSatelliteInstance.storage()
                const actionId              = governanceSatelliteStorage.governanceSatelliteCounter
                var operation               = await governanceSatelliteInstance.methods.togglePauseAggregator(contractDeployments.aggregator.address, "For tests purposes", "unpauseAll").send();
                await operation.confirmation();

                operation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin adds an oracle to an aggregator', async () => {
            try{
                // Operation
                governanceSatelliteStorage  = await governanceSatelliteInstance.storage()
                const actionId              = governanceSatelliteStorage.governanceSatelliteCounter
                var operation               = await governanceSatelliteInstance.methods.addOracleToAggregator(alice.pkh, contractDeployments.aggregator.address,"For tests purposes").send();
                await operation.confirmation();

                operation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin removes all satellite oracles', async () => {
            try{
                // Operation
                governanceSatelliteStorage  = await governanceSatelliteInstance.storage()
                const actionId              = governanceSatelliteStorage.governanceSatelliteCounter
                var operation               = await governanceSatelliteInstance.methods.removeAllSatelliteOracles(alice.pkh, "For tests purposes").send();
                await operation.confirmation();

                operation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin resolve a mistaken transfer', async () => {
            try{
                // Operation
                governanceSatelliteStorage  = await governanceSatelliteInstance.storage()
                const actionId              = governanceSatelliteStorage.governanceSatelliteCounter
                var contractAccount         = await mvkTokenStorage.ledger.get(contractDeployments.aggregatorFactory.address)
                var userAccount             = await mvkTokenStorage.ledger.get(bob.pkh)
                const tokenAmount           = MVK(200);
                const purpose               = "Transfer made by mistake to the aggregator factory"

                // Mistake Operation
                const transferOperation     = await mvkTokenInstance.methods.transfer([
                    {
                        from_: bob.pkh,
                        txs: [
                            {
                                to_: contractDeployments.aggregatorFactory.address,
                                token_id: 0,
                                amount: tokenAmount
                            }
                        ]
                    }
                ]).send();
                await transferOperation.confirmation();

                // Satellite Bob creates a governance action
                const governanceSatelliteOperation = await governanceSatelliteInstance.methods.fixMistakenTransfer(
                        contractDeployments.aggregatorFactory.address,
                        purpose,
                        [
                            {
                                "to_"    : bob.pkh,
                                "token"  : {
                                    "fa2" : {
                                        "tokenContractAddress": contractDeployments.mvkToken.address,
                                        "tokenId" : 0
                                    }
                                },
                                "amount" : tokenAmount
                            }
                        ]
                    ).send();
                await governanceSatelliteOperation.confirmation();

                const operation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin drops an action', async () => {
            try{
                // Operation
                governanceSatelliteStorage  = await governanceSatelliteInstance.storage()
                const actionId              = governanceSatelliteStorage.governanceSatelliteCounter
                var operation               = await governanceSatelliteInstance.methods.togglePauseAggregator(contractDeployments.aggregator.address, "For tests purposes", "unpauseAll").send();
                await operation.confirmation();

                operation = await governanceSatelliteInstance.methods.dropAction(actionId).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin removes an oracle in an aggregator', async () => {
            try{
                // Operation
                governanceSatelliteStorage  = await governanceSatelliteInstance.storage()
                var actionId                = governanceSatelliteStorage.governanceSatelliteCounter
                var operation               = await governanceSatelliteInstance.methods.addOracleToAggregator(alice.pkh, contractDeployments.aggregator.address, "For tests purposes").send();
                await operation.confirmation();

                operation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await operation.confirmation();
                
                governanceSatelliteStorage  = await governanceSatelliteInstance.storage()
                actionId                    = governanceSatelliteStorage.governanceSatelliteCounter
                var operation               = await governanceSatelliteInstance.methods.removeOracleInAggregator(alice.pkh, contractDeployments.aggregator.address, "For tests purposes").send();
                await operation.confirmation();

                operation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    })

    describe("EMERGENCY GOVERNANCE", async () => {
        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk);
        });

        it('Admin sets admin', async () => {
            try{
                // Operation
                const operation = await emergencyGovernanceInstance.methods.setAdmin(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets governance', async () => {
            try{
                // Operation
                const operation = await emergencyGovernanceInstance.methods.setGovernance(contractDeployments.governance.address).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates vote expiry days', async () => {
            try{
                // Operation
                const operation = await emergencyGovernanceInstance.methods.updateConfig(1, "configDurationInMinutes").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates required fee mutez to trigger emergency', async () => {
            try{
                // Operation
                const operation = await emergencyGovernanceInstance.methods.updateConfig(1000000, "configRequiredFeeMutez").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates SMVK percentage required', async () => {
            try{
                // Operation
                const operation = await emergencyGovernanceInstance.methods.updateConfig(0, "configStakedMvkPercentRequired").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates minimum SMVK for voting', async () => {
            try{
                // Operation
                const operation = await emergencyGovernanceInstance.methods.updateConfig(new BigNumber(MVK(0.1)), "configMinStakedMvkForVoting").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates minimum SMVK to trigger', async () => {
            try{
                // Operation
                const operation = await emergencyGovernanceInstance.methods.updateConfig(new BigNumber(MVK(0.1)), "configMinStakedMvkToTrigger").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates proposal title max length', async () => {
            try{
                // Operation
                const operation = await emergencyGovernanceInstance.methods.updateConfig(500, "configProposalTitleMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates proposal description max length', async () => {
            try{
                // Operation
                const operation = await emergencyGovernanceInstance.methods.updateConfig(500, "configProposalDescMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates general contracts', async () => {
            try{
                // Operation
                const operation = await emergencyGovernanceInstance.methods.updateGeneralContracts("bob", bob.pkh, "update").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin triggers emergency governance', async () => {
            try{
                // Operation
                const operation = await emergencyGovernanceInstance.methods.triggerEmergencyControl("Emergency title", "Emergency description").send({amount: 1});
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin votes for emergency governance', async () => {
            try{
                // Operation
                var operation = await emergencyGovernanceInstance.methods.triggerEmergencyControl("Emergency title", "Emergency description").send({amount: 1});
                await operation.confirmation();

                // Operation
                operation = await emergencyGovernanceInstance.methods.voteForEmergencyControl().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    })

    describe("BREAK GLASS", async () => {
        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk);
        });

        it('Admin sets admin', async () => {
            try{
                // Operation
                const operation = await breakGlassInstance.methods.setAdmin(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets governance', async () => {
            try{
                // Operation
                const operation = await breakGlassInstance.methods.setGovernance(contractDeployments.governance.address).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates threshold', async () => {
            try{
                // Operation
                const operation = await breakGlassInstance.methods.updateConfig(0, "configThreshold").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates action expiry days', async () => {
            try{
                // Operation
                const operation = await breakGlassInstance.methods.updateConfig(1, "configActionExpiryDays").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates name max length', async () => {
            try{
                // Operation
                const operation = await breakGlassInstance.methods.updateConfig(500, "configCouncilNameMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates website max length', async () => {
            try{
                // Operation
                const operation = await breakGlassInstance.methods.updateConfig(500, "configCouncilWebsiteMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates image max length', async () => {
            try{
                // Operation
                const operation = await breakGlassInstance.methods.updateConfig(500, "configCouncilImageMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates general contracts', async () => {
            try{
                // Operation
                const operation = await breakGlassInstance.methods.updateGeneralContracts("bob", bob.pkh, "update").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates whitelist contracts', async () => {
            try{
                // Operation
                const operation = await breakGlassInstance.methods.updateWhitelistContracts(bob.pkh, "update").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Council member updates its council member info', async () => {
            try{
                // Operation
                await helperFunctions.signerFactory(tezos, eve.sk)
                const operation = await breakGlassInstance.methods.updateCouncilMemberInfo("Eve", "Eve Image", "Eve Website").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Council member adds a new council member', async () => {
            try{
                // Operation
                await helperFunctions.signerFactory(tezos, eve.sk)
                const operation = await breakGlassInstance.methods.councilActionAddMember(bob.pkh, "Bob", "Bob Image", "Bob Website").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Council member removes a council member', async () => {
            try{
                // Operation
                await helperFunctions.signerFactory(tezos, eve.sk)
                const operation = await breakGlassInstance.methods.councilActionRemoveMember(alice.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Council member changes a council member', async () => {
            try{
                // Operation
                await helperFunctions.signerFactory(tezos, eve.sk)
                const operation = await breakGlassInstance.methods.councilActionChangeMember(alice.pkh, bob.pkh, "Bob", "Bob Image", "Bob Website").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Council member propagate break glass', async () => {
            try{
                // Operation
                await helperFunctions.signerFactory(tezos, eve.sk)
                const operation = await breakGlassInstance.methods.propagateBreakGlass(generalContractsSet).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Council member sets contracts admin', async () => {
            try{
                // Operation
                await helperFunctions.signerFactory(tezos, eve.sk)
                const operation = await breakGlassInstance.methods.setContractsAdmin(generalContractsSet, bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Council member pauses all entrypoint', async () => {
            try{
                // Operation
                await helperFunctions.signerFactory(tezos, eve.sk)
                const operation = await breakGlassInstance.methods.pauseAllEntrypoints(generalContractsSet).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Council member unpauses all entrypoint', async () => {
            try{
                // Operation
                await helperFunctions.signerFactory(tezos, eve.sk)
                const operation = await breakGlassInstance.methods.unpauseAllEntrypoints(generalContractsSet).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Council member removes break glass control', async () => {
            try{
                // Operation
                await helperFunctions.signerFactory(tezos, eve.sk)
                const operation = await breakGlassInstance.methods.removeBreakGlassControl(generalContractsSet).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Council member flushes an action', async () => {
            try{
                // Operation
                await helperFunctions.signerFactory(tezos, eve.sk)
                const operation = await breakGlassInstance.methods.flushAction(1).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Council member signs an action', async () => {
            try{
                // Operation
                await helperFunctions.signerFactory(tezos, eve.sk)
                breakGlassStorage   = await breakGlassInstance.storage();
                const recordId      = breakGlassStorage.actionCounter
                var operation = await breakGlassInstance.methods.flushAction(1).send();
                await operation.confirmation();

                await helperFunctions.signerFactory(tezos, alice.sk);
                operation = await breakGlassInstance.methods.signAction(recordId).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    })

    describe("LENDING CONTROLLER", async () => {
        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk);
        });

        it('Admin sets admin', async () => {
            try{
                // Operation
                const operation = await lendingControllerInstance.methods.setAdmin(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets governance', async () => {
            try{
                // Operation
                const operation = await lendingControllerInstance.methods.setGovernance(contractDeployments.governance.address).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates collateral ratio', async () => {
            try{
                // Operation
                const operation = await lendingControllerInstance.methods.updateConfig(2000, "configCollateralRatio").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates liquidation ratio', async () => {
            try{
                // Operation
                const operation = await lendingControllerInstance.methods.updateConfig(1500, "configLiquidationRatio").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates liquidation fee percent', async () => {
            try{
                // Operation
                const operation = await lendingControllerInstance.methods.updateConfig(600, "configLiquidationFeePercent").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates admin liquidation fee', async () => {
            try{
                // Operation
                const operation = await lendingControllerInstance.methods.updateConfig(600, "configAdminLiquidationFee").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates minimum loan fee percent', async () => {
            try{
                // Operation
                const operation = await lendingControllerInstance.methods.updateConfig(100, "configMinimumLoanFeePercent").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates minimum loan fee treasury share', async () => {
            try{
                // Operation
                const operation = await lendingControllerInstance.methods.updateConfig(4000, "configMinLoanFeeTreasuryShare").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates interest treasury share', async () => {
            try{
                // Operation
                const operation = await lendingControllerInstance.methods.updateConfig(100, "configInterestTreasuryShare").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses setLoanToken', async () => {
            try{
                // Operation
                const operation = await lendingControllerInstance.methods.togglePauseEntrypoint("setLoanToken", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses addLiquidity', async () => {
            try{
                // Operation
                const operation = await lendingControllerInstance.methods.togglePauseEntrypoint("addLiquidity", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses removeLiquidity', async () => {
            try{
                // Operation
                const operation = await lendingControllerInstance.methods.togglePauseEntrypoint("removeLiquidity", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses setLoanToken', async () => {
            try{
                // Operation
                const operation = await lendingControllerInstance.methods.togglePauseEntrypoint("setLoanToken", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses setCollateralToken', async () => {
            try{
                // Operation
                const operation = await lendingControllerInstance.methods.togglePauseEntrypoint("setCollateralToken", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses addLiquidity', async () => {
            try{
                // Operation
                const operation = await lendingControllerInstance.methods.togglePauseEntrypoint("addLiquidity", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses removeLiquidity', async () => {
            try{
                // Operation
                const operation = await lendingControllerInstance.methods.togglePauseEntrypoint("removeLiquidity", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses registerVaultCreation', async () => {
            try{
                // Operation
                const operation = await lendingControllerInstance.methods.togglePauseEntrypoint("registerVaultCreation", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses closeVault', async () => {
            try{
                // Operation
                const operation = await lendingControllerInstance.methods.togglePauseEntrypoint("closeVault", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses registerDeposit', async () => {
            try{
                // Operation
                const operation = await lendingControllerInstance.methods.togglePauseEntrypoint("registerDeposit", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses registerWithdrawal', async () => {
            try{
                // Operation
                const operation = await lendingControllerInstance.methods.togglePauseEntrypoint("registerWithdrawal", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses markForLiquidation', async () => {
            try{
                // Operation
                const operation = await lendingControllerInstance.methods.togglePauseEntrypoint("markForLiquidation", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses liquidateVault', async () => {
            try{
                // Operation
                const operation = await lendingControllerInstance.methods.togglePauseEntrypoint("liquidateVault", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses borrow', async () => {
            try{
                // Operation
                const operation = await lendingControllerInstance.methods.togglePauseEntrypoint("borrow", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses repay', async () => {
            try{
                // Operation
                const operation = await lendingControllerInstance.methods.togglePauseEntrypoint("repay", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses vaultDepositStakedToken', async () => {
            try{
                // Operation
                const operation = await lendingControllerInstance.methods.togglePauseEntrypoint("vaultDepositStakedToken", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses vaultWithdrawStakedToken', async () => {
            try{
                // Operation
                const operation = await lendingControllerInstance.methods.togglePauseEntrypoint("vaultWithdrawStakedToken", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses vaultWithdraw', async () => {
            try{
                // Operation
                const operation = await lendingControllerInstance.methods.togglePauseEntrypoint("vaultWithdraw", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses vaultDeposit', async () => {
            try{
                // Operation
                const operation = await lendingControllerInstance.methods.togglePauseEntrypoint("vaultDeposit", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses vaultOnLiquidate', async () => {
            try{
                // Operation
                const operation = await lendingControllerInstance.methods.togglePauseEntrypoint("vaultOnLiquidate", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses all entrypoints', async () => {
            try{
                // Operation
                const operation = await lendingControllerInstance.methods.pauseAll().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin unpauses all entrypoints', async () => {
            try{
                // Operation
                const operation = await lendingControllerInstance.methods.unpauseAll().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets loan token', async () => {
            try{
                // Initial values
                const tokenName                             = "usdt";
                const tokenContractAddress                  = contractDeployments.mTokenUsdt.address;
                const tokenType                             = "fa2";
                const tokenDecimals                         = 6;
                const tokenId                               = 0;

                const oracleAddress                         = contractDeployments.aggregator.address;

                const mTokenAddress                         = contractDeployments.mTokenUsdt.address;

                const interestRateDecimals                  = 27;
                const reserveRatio                          = 3000; // 30% reserves (4 decimals)
                const optimalUtilisationRate                = 30 * (10 ** (interestRateDecimals - 2));  // 30% utilisation rate kink
                const baseInterestRate                      = 5  * (10 ** (interestRateDecimals - 2));  // 5%
                const maxInterestRate                       = 25 * (10 ** (interestRateDecimals - 2));  // 25% 
                const interestRateBelowOptimalUtilisation   = 10 * (10 ** (interestRateDecimals - 2));  // 10% 
                const interestRateAboveOptimalUtilisation   = 20 * (10 ** (interestRateDecimals - 2));  // 20%

                const minRepaymentAmount                    = 1000;

                // Operation
                const operation = await lendingControllerInstance.methods.setLoanToken(
                    "createLoanToken",

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

                    // fa2 token type - token contract address
                    tokenType,
                    tokenContractAddress,
                    tokenId
                ).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin adds liquidity', async () => {
            try{
                // Initial values
                const loanTokenName             = "usdt";
                const liquidityAmount           = 20000; // 0.2 Mock FA12 Tokens

                // Operation
                var operation = await mTokenUsdtInstance.methods.update_operators([
                    {
                        add_operator: {
                            owner: bob.pkh,
                            operator: contractDeployments.lendingController.address,
                            token_id: 0,
                        },
                    },
                    ])
                    .send()
                await operation.confirmation();
                operation = await lendingControllerInstance.methods.addLiquidity(
                    loanTokenName,
                    liquidityAmount, 
                ).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin removes liquidity', async () => {
            try{
                // Initial values
                const loanTokenName = "usdt";
                const liquidityAmount = 10000; // 0.1 Mock FA12 Tokens

                // Operation
                const operation = await lendingControllerInstance.methods.removeLiquidity(
                    loanTokenName,
                    liquidityAmount, 
                ).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets collateral token', async () => {
            try{
                // Initial values
                const tokenName                  = "musdt";
                const tokenContractAddress       = contractDeployments.mTokenUsdt.address;
                const tokenType                  = "fa12";

                const tokenDecimals              = 6;
                const oracleAddress              = contractDeployments.aggregator.address;

                // Operation
                const operation = await lendingControllerInstance.methods.setCollateralToken(
                    "createCollateralToken",

                    tokenName,
                    tokenContractAddress,
                    tokenDecimals,

                    oracleAddress,
                    false,
                    true,
                    false,
                    null,
                    null, // Max deposit amount

                    // fa12 token type - token contract address
                    tokenType,
                    tokenContractAddress,
                    0

                ).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin creates a vault', async () => {
            try{
                // Initial values
                const depositors    = "any";
                const loanTokenName = "usdt";

                // Operation
                const operation = await vaultFactoryInstance.methods.createVault(
                    null,
                    loanTokenName,          // loan token type
                    "vaultName",
                    null,
                    depositors              // depositors type
                ).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin closes a vault', async () => {
            try{
                // Initial values
                vaultFactoryStorage         = await vaultFactoryInstance.storage();
                var vaultId                 = vaultFactoryStorage.vaultCounter.toNumber() - 1;
                const depositors            = "any";
                const loanTokenName         = "usdt";

                // Operation
                const operation = await lendingControllerInstance.methods.closeVault(vaultId).send();
                await operation.confirmation();

                // Recreation of a new vault for following tests
                const createVaultOperation = await vaultFactoryInstance.methods.createVault(
                    null,
                    loanTokenName,          // loan token type
                    "vaultName",
                    null,
                    depositors              // depositors type
                ).send();
                await createVaultOperation.confirmation();

                // Save newly created vault address
                lendingControllerStorage            = await lendingControllerInstance.storage();
                vaultFactoryStorage                 = await vaultFactoryInstance.storage();
                var vaultId                         = vaultFactoryStorage.vaultCounter.toNumber() - 1;
                const vaultHandle = {
                    "id"    : vaultId,
                    "owner" : bob.pkh
                };
                const vault                         = await lendingControllerStorage.vaults.get(vaultHandle)
                createdVaultAddress                 = vault.address;

                // Adds TEZ as a collateral token
                const tokenName                             = "tez";
                const tokenContractAddress                  = zeroAddress;
                const tokenType                             = "tez";
                const tokenId                               = 0;

                const tokenDecimals                         = 6;
                const oracleAddress                         = contractDeployments.aggregator.address;

                // Operation
                const updateCollateralOperation = await lendingControllerInstance.methods.setCollateralToken(
                    "createCollateralToken",

                    tokenName,
                    tokenContractAddress,
                    tokenDecimals,

                    oracleAddress,
                    false,
                    false,
                    false,
                    null,
                    MVK(10), // Max deposit amount
                    
                    // fa2 token type - token contract address + token id
                    tokenType,
                    tokenContractAddress,
                    tokenId

                ).send();
                await updateCollateralOperation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin deposits into the new vault', async () => {
            try{
                // Initial values
                const depositAmountMutez    = 10000000;

                console.log("ADDRESS:",createdVaultAddress)

                const newVaultInstance      = await utils.tezos.contract.at(createdVaultAddress);

                // Operation
                const operation = await newVaultInstance.methods.initVaultAction("deposit", depositAmountMutez, "tez").send({ mutez : true, amount : depositAmountMutez });
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin deposits XTZ into the new vault by directly sending XTZ to the vault', async () => {
            try{
                // Initial values
                const depositAmountTez    = 10;

                console.log("ADDRESS:",createdVaultAddress)

                // Operation
                const operation = await utils.tezos.contract.transfer({ to: createdVaultAddress, amount: depositAmountTez});
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin withdraws from the new vault', async () => {
            try{
                // Initial values
                const withdrawAmountMutez   = 1000000;
                const newVaultInstance      = await utils.tezos.contract.at(createdVaultAddress);

                // Operation
                const operation = await newVaultInstance.methods.initVaultAction("withdraw", withdrawAmountMutez, "tez").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin borrows from a vault', async () => {
            try{
                // Initial values
                vaultFactoryStorage         = await vaultFactoryInstance.storage();
                const vaultId               = vaultFactoryStorage.vaultCounter.toNumber() - 1;
                const borrowAmount          = 1000;

                // Operation
                const operation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin repays the vault', async () => {
            try{
                // Initial values
                vaultFactoryStorage         = await vaultFactoryInstance.storage();
                const vaultId               = vaultFactoryStorage.vaultCounter.toNumber() - 1;
                const repayAmount           = 1000;

                // Operation
                const approveOperation  = await mavrykFa12TokenInstance.methods.approve(contractDeployments.lendingController.address, repayAmount).send()
                await approveOperation.confirmation();
                const operation         = await lendingControllerInstance.methods.repay(vaultId, repayAmount).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin deposits smvk into the vault', async () => {
            try{
                // Initial values
                vaultFactoryStorage                     = await vaultFactoryInstance.storage();
                const vaultId                           = vaultFactoryStorage.vaultCounter.toNumber() - 1;
                const depositAmount                     = 1000;
                const tokenName                         = "smvk";
                const tokenContractAddress              = contractDeployments.mvkToken.address;
                const tokenType                         = "fa2";
                const tokenId                           = 0;

                const tokenDecimals                     = 9;
                const oracleAddress                     = contractDeployments.aggregator.address;
                const tokenProtected                    = true; // sMVK is protected

                // Add SMVK as collateral
                const setCollateralTokenOperation       = await lendingControllerInstance.methods.setCollateralToken(
                    "createCollateralToken",

                    tokenName,
                    tokenContractAddress,
                    tokenDecimals,

                    oracleAddress,
                    tokenProtected,
                    false,
                    true,
                    contractDeployments.doorman.address,
                    null, // Max deposit amount

                    // fa2 token type - token contract address
                    tokenType,
                    tokenContractAddress,
                    tokenId

                ).send();
                await setCollateralTokenOperation.confirmation();

                // Operation
                const operation                         = await lendingControllerInstance.methods.vaultDepositStakedToken("smvk", vaultId, depositAmount).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin withdraws smvk from the vault', async () => {
            try{
                // Initial values
                vaultFactoryStorage         = await vaultFactoryInstance.storage();
                const vaultId               = vaultFactoryStorage.vaultCounter.toNumber() - 1;
                const withdrawAmount        = 1000;

                // Operation
                const operation             = await lendingControllerInstance.methods.vaultWithdrawStakedToken("smvk", vaultId, withdrawAmount).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        // it('Admin marks a vault for liquidation', async () => {
        //     try{
        //         // Initial values
        //         lendingControllerStorage    = await lendingControllerInstance.storage();
        //         const vaultId               = lendingControllerStorage.vaultCounter.toNumber() - 1;

        //         // Operation
        //         const operation = await lendingControllerInstance.methods.markForLiquidation(bob.pkh, vaultId).send();
        //         await operation.confirmation();
        //     } catch(e){
        //         console.dir(e, {depth: 5})
        //     }
        // });

        // it('Admin liquidates a vault', async () => {
        //     try{
        //         // Initial values
        //         lendingControllerStorage    = await lendingControllerInstance.storage();
        //         const vaultId               = lendingControllerStorage.vaultCounter.toNumber() - 1;

        //         // Operation
        //         const operation = await lendingControllerInstance.methods.markForLiquidation(bob.pkh, vaultId).send();
        //         await operation.confirmation();
        //     } catch(e){
        //         console.dir(e, {depth: 5})
        //     }
        // });
    });

    // describe("LENDING CONTROLLER MOCK TIME", async () => {

    //     beforeEach("Set signer to admin", async () => {
    //         await helperFunctions.signerFactory(tezos, bob.sk);
    //     });

    //     it('Admin sets admin', async () => {
    //         try{
    //             // Operation
    //             const operation = await lendingControllerMockTimeInstance.methods.setAdmin(bob.pkh).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin sets governance', async () => {
    //         try{
    //             // Operation
    //             const operation = await lendingControllerMockTimeInstance.methods.setGovernance(contractDeployments.governance.address).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });
        
    //     it('Admin updates whitelist token contracts', async () => {
    //         try{
    //             // Operation
    //             const operation = await lendingControllerMockTimeInstance.methods.updateWhitelistTokenContracts(bob.pkh, "update").send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin updates collateral ratio', async () => {
    //         try{
    //             // Operation
    //             const operation = await lendingControllerMockTimeInstance.methods.updateConfig(2000, "configCollateralRatio").send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin updates liquidation ratio', async () => {
    //         try{
    //             // Operation
    //             const operation = await lendingControllerMockTimeInstance.methods.updateConfig(1500, "configLiquidationRatio").send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin updates liquidation fee percent', async () => {
    //         try{
    //             // Operation
    //             const operation = await lendingControllerMockTimeInstance.methods.updateConfig(600, "configLiquidationFeePercent").send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin updates admin liquidation fee', async () => {
    //         try{
    //             // Operation
    //             const operation = await lendingControllerMockTimeInstance.methods.updateConfig(600, "configAdminLiquidationFee").send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin updates minimum loan fee percent', async () => {
    //         try{
    //             // Operation
    //             const operation = await lendingControllerMockTimeInstance.methods.updateConfig(100, "configMinimumLoanFeePercent").send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin updates minimum loan fee treasury share', async () => {
    //         try{
    //             // Operation
    //             const operation = await lendingControllerMockTimeInstance.methods.updateConfig(4000, "configMinLoanFeeTreasuryShare").send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin updates interest treasury share', async () => {
    //         try{
    //             // Operation
    //             const operation = await lendingControllerMockTimeInstance.methods.updateConfig(100, "configInterestTreasuryShare").send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin updates mock level', async () => {
    //         try{
    //             // Operation
    //             const operation = await lendingControllerMockTimeInstance.methods.updateConfig(0, "configMockLevel").send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin pauses setLoanToken', async () => {
    //         try{
    //             // Operation
    //             const operation = await lendingControllerMockTimeInstance.methods.togglePauseEntrypoint("setLoanToken", true).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin pauses addLiquidity', async () => {
    //         try{
    //             // Operation
    //             const operation = await lendingControllerMockTimeInstance.methods.togglePauseEntrypoint("addLiquidity", true).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin pauses removeLiquidity', async () => {
    //         try{
    //             // Operation
    //             const operation = await lendingControllerMockTimeInstance.methods.togglePauseEntrypoint("removeLiquidity", true).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin pauses setLoanToken', async () => {
    //         try{
    //             // Operation
    //             const operation = await lendingControllerMockTimeInstance.methods.togglePauseEntrypoint("setLoanToken", true).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin pauses setCollateralToken', async () => {
    //         try{
    //             // Operation
    //             const operation = await lendingControllerMockTimeInstance.methods.togglePauseEntrypoint("setCollateralToken", true).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin pauses addLiquidity', async () => {
    //         try{
    //             // Operation
    //             const operation = await lendingControllerMockTimeInstance.methods.togglePauseEntrypoint("addLiquidity", true).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin pauses removeLiquidity', async () => {
    //         try{
    //             // Operation
    //             const operation = await lendingControllerMockTimeInstance.methods.togglePauseEntrypoint("removeLiquidity", true).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin pauses registerVaultCreation', async () => {
    //         try{
    //             // Operation
    //             const operation = await lendingControllerMockTimeInstance.methods.togglePauseEntrypoint("registerVaultCreation", true).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin pauses closeVault', async () => {
    //         try{
    //             // Operation
    //             const operation = await lendingControllerMockTimeInstance.methods.togglePauseEntrypoint("closeVault", true).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin pauses registerDeposit', async () => {
    //         try{
    //             // Operation
    //             const operation = await lendingControllerMockTimeInstance.methods.togglePauseEntrypoint("registerDeposit", true).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin pauses registerWithdrawal', async () => {
    //         try{
    //             // Operation
    //             const operation = await lendingControllerMockTimeInstance.methods.togglePauseEntrypoint("registerWithdrawal", true).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin pauses markForLiquidation', async () => {
    //         try{
    //             // Operation
    //             const operation = await lendingControllerMockTimeInstance.methods.togglePauseEntrypoint("markForLiquidation", true).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin pauses liquidateVault', async () => {
    //         try{
    //             // Operation
    //             const operation = await lendingControllerMockTimeInstance.methods.togglePauseEntrypoint("liquidateVault", true).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin pauses borrow', async () => {
    //         try{
    //             // Operation
    //             const operation = await lendingControllerMockTimeInstance.methods.togglePauseEntrypoint("borrow", true).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin pauses repay', async () => {
    //         try{
    //             // Operation
    //             const operation = await lendingControllerMockTimeInstance.methods.togglePauseEntrypoint("repay", true).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin pauses vaultDepositStakedToken', async () => {
    //         try{
    //             // Operation
    //             const operation = await lendingControllerMockTimeInstance.methods.togglePauseEntrypoint("vaultDepositStakedToken", true).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin pauses vaultWithdrawStakedToken', async () => {
    //         try{
    //             // Operation
    //             const operation = await lendingControllerMockTimeInstance.methods.togglePauseEntrypoint("vaultWithdrawStakedToken", true).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin pauses vaultWithdraw', async () => {
    //         try{
    //             // Operation
    //             const operation = await lendingControllerMockTimeInstance.methods.togglePauseEntrypoint("vaultWithdraw", true).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin pauses vaultDeposit', async () => {
    //         try{
    //             // Operation
    //             const operation = await lendingControllerMockTimeInstance.methods.togglePauseEntrypoint("vaultDeposit", true).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin pauses vaultOnLiquidate', async () => {
    //         try{
    //             // Operation
    //             const operation = await lendingControllerMockTimeInstance.methods.togglePauseEntrypoint("vaultOnLiquidate", true).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin pauses all entrypoints', async () => {
    //         try{
    //             // Operation
    //             const operation = await lendingControllerMockTimeInstance.methods.pauseAll().send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin unpauses all entrypoints', async () => {
    //         try{
    //             // Operation
    //             const operation = await lendingControllerMockTimeInstance.methods.unpauseAll().send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin sets loan token', async () => {
    //         try{
    //             // Initial values
    //             const tokenName                             = "usdt";
    //             const tokenContractAddress                  = contractDeployments.mTokenUsdt.address;
    //             const tokenType                             = "fa2";
    //             const tokenDecimals                         = 6;
    //             const tokenId                               = 0;

    //             const oracleAddress                         = contractDeployments.aggregator.address;

    //             const mTokenAddress                         = contractDeployments.mTokenUsdt.address;

    //             const interestRateDecimals                  = 27;
    //             const reserveRatio                          = 3000; // 30% reserves (4 decimals)
    //             const optimalUtilisationRate                = 30 * (10 ** (interestRateDecimals - 2));  // 30% utilisation rate kink
    //             const baseInterestRate                      = 5  * (10 ** (interestRateDecimals - 2));  // 5%
    //             const maxInterestRate                       = 25 * (10 ** (interestRateDecimals - 2));  // 25% 
    //             const interestRateBelowOptimalUtilisation   = 10 * (10 ** (interestRateDecimals - 2));  // 10% 
    //             const interestRateAboveOptimalUtilisation   = 20 * (10 ** (interestRateDecimals - 2));  // 20%

    //             const minRepaymentAmount                    = 1000;

    //             // Operation
    //             const operation = await lendingControllerMockTimeInstance.methods.setLoanToken(
    //                 "createLoanToken",

    //                 tokenName,
    //                 tokenDecimals,

    //                 oracleAddress,

    //                 mTokenAddress,
                    
    //                 reserveRatio,
    //                 optimalUtilisationRate,
    //                 baseInterestRate,
    //                 maxInterestRate,
    //                 interestRateBelowOptimalUtilisation,
    //                 interestRateAboveOptimalUtilisation,
    //                 minRepaymentAmount,

    //                 // fa2 token type - token contract address
    //                 tokenType,
    //                 tokenContractAddress,
    //                 tokenId
    //             ).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin adds liquidity', async () => {
    //         try{
    //             // Initial values
    //             const loanTokenName             = "usdt";
    //             const liquidityAmount           = 20000; // 0.2 Mock FA12 Tokens

    //             // Operation
    //             var operation = await mTokenUsdtInstance.methods.update_operators([
    //                 {
    //                     add_operator: {
    //                         owner: bob.pkh,
    //                         operator: contractDeployments.lendingControllerMockTime.address,
    //                         token_id: 0,
    //                     },
    //                 },
    //                 ])
    //                 .send()
    //             await operation.confirmation();
    //             operation = await lendingControllerMockTimeInstance.methods.addLiquidity(
    //                 loanTokenName,
    //                 liquidityAmount, 
    //             ).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin removes liquidity', async () => {
    //         try{
    //             // Initial values
    //             const loanTokenName = "usdt";
    //             const liquidityAmount = 10000; // 0.1 Mock FA12 Tokens

    //             // Operation
    //             const operation = await lendingControllerMockTimeInstance.methods.removeLiquidity(
    //                 loanTokenName,
    //                 liquidityAmount, 
    //             ).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin sets collateral token', async () => {
    //         try{
    //             // Initial values
    //             const tokenName                  = "musdt";
    //             const tokenContractAddress       = contractDeployments.mTokenUsdt.address;
    //             const tokenType                  = "fa12";

    //             const tokenDecimals              = 6;
    //             const oracleAddress              = contractDeployments.aggregator.address;

    //             // Operation
    //             const operation = await lendingControllerMockTimeInstance.methods.setCollateralToken(
    //                 "createCollateralToken",

    //                 tokenName,
    //                 tokenContractAddress,
    //                 tokenDecimals,

    //                 oracleAddress,
    //                 false,
    //                 true,
    //                 false,
    //                 null,
    //                 null, // Max deposit amount

    //                 // fa12 token type - token contract address
    //                 tokenType,
    //                 tokenContractAddress,
    //                 0

    //             ).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin creates a vault', async () => {
    //         try{
    //             // Initial values
    //             const depositors    = "any";
    //             const loanTokenName = "usdt";

    //             // Operation
    //             const operation = await vaultFactoryInstance.methods.createVault(
    //                 null,
    //                 loanTokenName,          // loan token type
    //                 "vaultName",
    //                 null,
    //                 depositors              // depositors type
    //             ).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin closes a vault', async () => {
    //         try{
    //             // Initial values
    //             vaultFactoryStorage         = await vaultFactoryInstance.storage();
    //             var vaultId                 = vaultFactoryStorage.vaultCounter.toNumber() - 1;
    //             const depositors            = "any";
    //             const loanTokenName         = "usdt";

    //             // Operation
    //             const operation = await lendingControllerMockTimeInstance.methods.closeVault(vaultId).send();
    //             await operation.confirmation();

    //             // Recreation of a new vault for following tests
    //             const createVaultOperation = await vaultFactoryInstance.methods.createVault(
    //                 null,
    //                 loanTokenName,          // loan token type
    //                 "vaultName",
    //                 null,
    //                 depositors              // depositors type
    //             ).send();
    //             await createVaultOperation.confirmation();

    //             // Save newly created vault address
    //             lendingControllerMockTimeStorage    = await lendingControllerMockTimeInstance.storage();
    //             vaultFactoryStorage                 = await vaultFactoryInstance.storage();
    //             var vaultId                         = vaultFactoryStorage.vaultCounter.toNumber() - 1;
    //             const vaultHandle = {
    //                 "id"    : vaultId,
    //                 "owner" : bob.pkh
    //             };
    //             const vault                         = await lendingControllerMockTimeStorage.vaults.get(vaultHandle)
    //             createdVaultAddress                 = vault.address;

    //             // Adds TEZ as a collateral token
    //             const tokenName                             = "tez";
    //             const tokenContractAddress                  = zeroAddress;
    //             const tokenType                             = "tez";
    //             const tokenId                               = 0;

    //             const tokenDecimals                         = 6;
    //             const oracleAddress                         = contractDeployments.aggregator.address;

    //             // Operation
    //             const updateCollateralOperation = await lendingControllerMockTimeInstance.methods.setCollateralToken(
    //                 "createCollateralToken",

    //                 tokenName,
    //                 tokenContractAddress,
    //                 tokenDecimals,

    //                 oracleAddress,
    //                 false,
    //                 false,
    //                 false,
    //                 null,
    //                 MVK(10), // Max deposit amount
                    
    //                 // fa2 token type - token contract address + token id
    //                 tokenType,
    //                 tokenContractAddress,
    //                 tokenId

    //             ).send();
    //             await updateCollateralOperation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin deposits into the new vault', async () => {
    //         try{
    //             // Initial values
    //             const depositAmountMutez    = 10000000;

    //             console.log("ADDRESS:",createdVaultAddress)

    //             const newVaultInstance      = await utils.tezos.contract.at(createdVaultAddress);

    //             // Operation
    //             const operation = await newVaultInstance.methods.initVaultAction("deposit", depositAmountMutez, "tez").send({ mutez : true, amount : depositAmountMutez });
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin deposits XTZ into the new vault by directly sending XTZ to the vault', async () => {
    //         try{
    //             // Initial values
    //             const depositAmountTez    = 10;

    //             console.log("ADDRESS:",createdVaultAddress)

    //             // Operation
    //             const operation = await utils.tezos.contract.transfer({ to: createdVaultAddress, amount: depositAmountTez});
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin withdraws from the new vault', async () => {
    //         try{
    //             // Initial values
    //             const withdrawAmountMutez   = 1000000;
    //             const newVaultInstance      = await utils.tezos.contract.at(createdVaultAddress);

    //             // Operation
    //             const operation = await newVaultInstance.methods.initVaultAction("withdraw", withdrawAmountMutez, "tez").send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin borrows from a vault', async () => {
    //         try{
    //             // Initial values
    //             vaultFactoryStorage         = await vaultFactoryInstance.storage();
    //             const vaultId               = vaultFactoryStorage.vaultCounter.toNumber() - 1;
    //             const borrowAmount          = 1000;

    //             // Operation
    //             const operation = await lendingControllerMockTimeInstance.methods.borrow(vaultId, borrowAmount).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin repays the vault', async () => {
    //         try{
    //             // Initial values
    //             vaultFactoryStorage         = await vaultFactoryInstance.storage();
    //             const vaultId               = vaultFactoryStorage.vaultCounter.toNumber() - 1;
    //             const repayAmount           = 1000;

    //             // Operation
    //             const approveOperation  = await mavrykFa12TokenInstance.methods.approve(contractDeployments.lendingControllerMockTime.address, repayAmount).send()
    //             await approveOperation.confirmation();
    //             const operation         = await lendingControllerMockTimeInstance.methods.repay(vaultId, repayAmount).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin deposits smvk into the vault', async () => {
    //         try{
    //             // Initial values
    //             vaultFactoryStorage                     = await vaultFactoryInstance.storage();
    //             const vaultId                           = vaultFactoryStorage.vaultCounter.toNumber() - 1;
    //             const depositAmount                     = 1000;
    //             const tokenName                         = "smvk";
    //             const tokenContractAddress              = contractDeployments.mvkToken.address;
    //             const tokenType                         = "fa2";
    //             const tokenId                           = 0;

    //             const tokenDecimals                     = 9;
    //             const oracleAddress                     = contractDeployments.aggregator.address;
    //             const tokenProtected                    = true; // sMVK is protected

    //             // Add SMVK as collateral
    //             const setCollateralTokenOperation       = await lendingControllerMockTimeInstance.methods.setCollateralToken(
    //                 "createCollateralToken",

    //                 tokenName,
    //                 tokenContractAddress,
    //                 tokenDecimals,

    //                 oracleAddress,
    //                 tokenProtected,
    //                 false,
    //                 true,
    //                 contractDeployments.doorman.address,
    //                 null, // Max deposit amount

    //                 // fa2 token type - token contract address
    //                 tokenType,
    //                 tokenContractAddress,
    //                 tokenId

    //             ).send();
    //             await setCollateralTokenOperation.confirmation();

    //             // Operation
    //             const operation                         = await lendingControllerMockTimeInstance.methods.vaultDepositStakedToken("smvk", vaultId, depositAmount).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin withdraws smvk from the vault', async () => {
    //         try{
    //             // Initial values
    //             vaultFactoryStorage         = await vaultFactoryInstance.storage();
    //             const vaultId               = vaultFactoryStorage.vaultCounter.toNumber() - 1;
    //             const withdrawAmount        = 1000;

    //             // Operation
    //             const operation             = await lendingControllerMockTimeInstance.methods.vaultWithdrawStakedToken("smvk", vaultId, withdrawAmount).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin marks a vault for liquidation', async () => {
    //         try{
    //             // Initial values
    //             lendingControllerMockTimeStorage    = await lendingControllerMockTimeInstance.storage();
    //             vaultFactoryStorage                 = await vaultFactoryInstance.storage();
    //             const vaultId                       = vaultFactoryStorage.vaultCounter.toNumber() - 1;
    //             const vaultHandle = {
    //                 "id"    : vaultId,
    //                 "owner" : bob.pkh
    //             };
    //             const vault                         = await lendingControllerMockTimeStorage.vaults.get(vaultHandle)
    //             const tmpVaultInstance              = await utils.tezos.contract.at(vault.address);
    //             const borrowAmount                  = 1000;
    //             const withdrawAmount                = (await vault.collateralBalanceLedger.get("tez")).toNumber();
    //             const lastUpdatedBlockLevel         = vault.lastUpdatedBlockLevel.toNumber();
    //             const mockLevel                     = oneMonthLevelBlocks + lastUpdatedBlockLevel;

    //             // Operation
    //             const borrowOperation               = await lendingControllerMockTimeInstance.methods.borrow(vaultId, borrowAmount).send();
    //             await borrowOperation.confirmation();

    //             // Withdraw all from vault
    //             const withdrawOperation             = await tmpVaultInstance.methods.withdraw(withdrawAmount, "tez").send();
    //             await withdrawOperation.confirmation();

    //             // Update Mock Level
    //             const updateConfigOperation         = await lendingControllerMockTimeInstance.methods.updateConfig(mockLevel, "configMockLevel").send();
    //             await updateConfigOperation.confirmation();

    //             // Operation
    //             const operation                     = await lendingControllerMockTimeInstance.methods.markForLiquidation(vaultId, bob.pkh).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin liquidates a vault', async () => {
    //         try{
    //             // Initial values
    //             lendingControllerMockTimeStorage    = await lendingControllerMockTimeInstance.storage();
    //             const vaultId                       = vaultFactoryStorage.vaultCounter.toNumber() - 1;
    //             const vaultHandle = {
    //                 "id"    : vaultId,
    //                 "owner" : bob.pkh
    //             };
    //             const vault                         = await lendingControllerMockTimeStorage.vaults.get(vaultHandle)
    //             const mockLevel                     = vault.markedForLiquidationLevel.toNumber() + oneDayLevelBlocks;

    //             // Update Mock Level
    //             const updateConfigOperation         = await lendingControllerMockTimeInstance.methods.updateConfig(mockLevel, "configMockLevel").send();
    //             await updateConfigOperation.confirmation();

    //             // Approve
    //             const approveOperation  = await mavrykFa12TokenInstance.methods.approve(contractDeployments.lendingControllerMockTime.address, 100).send()
    //             await approveOperation.confirmation();

    //             // Operation
    //             const operation                     = await lendingControllerMockTimeInstance.methods.liquidateVault(vaultId, bob.pkh, 100).send();
    //             await operation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });
    // });

    describe("FARM MTOKEN", async () => {
        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk);
        });

        it('Admin sets admin', async () => {
            try{
                // Operation
                const operation = await farmMTokenInstance.methods.setAdmin(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets governance', async () => {
            try{
                // Operation
                const operation = await farmMTokenInstance.methods.setGovernance(contractDeployments.governance.address).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin init a farm', async () => {
            try{
                // Operation
                const operation = await farmMTokenInstance.methods.initFarm(
                    12000,
                    100,
                    false,
                    false
                ).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates the rewards from transfer boolean', async () => {
            try{
                // Operation
                const operation = await farmMTokenInstance.methods.updateConfig(0, "configForceRewardFromTransfer").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates rewards per block', async () => {
            try{
                // Operation
                const operation = await farmMTokenInstance.methods.updateConfig(new BigNumber(MVK(2)), "configRewardPerBlock").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates whitelist contracts', async () => {
            try{
                // Operation
                const operation = await farmMTokenInstance.methods.updateWhitelistContracts(bob.pkh, "update").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates general contracts', async () => {
            try{
                // Operation
                const operation = await farmMTokenInstance.methods.updateGeneralContracts("bob", bob.pkh, "update").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses deposit entrypoint', async () => {
            try{
                // Operation
                const operation = await farmMTokenInstance.methods.togglePauseEntrypoint("deposit", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses withdraw entrypoint', async () => {
            try{
                // Operation
                const operation = await farmMTokenInstance.methods.togglePauseEntrypoint("withdraw", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses claim entrypoint', async () => {
            try{
                // Operation
                const operation = await farmMTokenInstance.methods.togglePauseEntrypoint("claim", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin pauses all entrypoints', async () => {
            try{
                // Operation
                const operation = await farmMTokenInstance.methods.pauseAll().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin unpauses all entrypoints', async () => {
            try{
                // Operation
                const operation = await farmMTokenInstance.methods.unpauseAll().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin deposits 2LP into the farm', async () => {
            try{
                // Operation
                var operation = await mTokenUsdtInstance.methods.update_operators([
                    {
                        add_operator: {
                            owner: bob.pkh,
                            operator: contractDeployments.farmMToken.address,
                            token_id: 0,
                        },
                    },
                    ])
                    .send()
                await operation.confirmation();
                operation = await farmMTokenInstance.methods.deposit(2).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin withdraw 1LP from the farm', async () => {
            try{
                // Operation
                const operation = await farmMTokenInstance.methods.withdraw(1).send();
                await operation.confirmation()
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin claims from the farm', async () => {
            try{
                // Operation
                var operation   = await farmFactoryInstance.methods.trackFarm(contractDeployments.farmMToken.address).send()
                await operation.confirmation();
                operation       = await farmMTokenInstance.methods.claim([bob.pkh]).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin closes a farm', async () => {
            try{
                // Operation
                const operation = await farmMTokenInstance.methods.closeFarm().send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    })

    describe("MToken", async () => {

        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk);
        });

        it('Admin sets admin', async () => {
            try{
                // Operation
                const operation = await mTokenEurlInstance.methods.setAdmin(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets governance', async () => {
            try{
                // Operation
                const operation = await mTokenEurlInstance.methods.setGovernance(contractDeployments.governance.address).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates whitelist contracts', async () => {
            try{
                // Operation
                const operation = await mTokenEurlInstance.methods.updateWhitelistContracts(bob.pkh, "update").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin transfers MVK', async () => {
            try{
                // Operation
                const operation = await mTokenEurlInstance.methods.transfer([
                    {
                        from_: bob.pkh,
                        txs: [
                        {
                            to_: bob.pkh,
                            token_id: 0,
                            amount: 100,
                        },
                        {
                            to_: eve.pkh,
                            token_id: 0,
                            amount: 100,
                        },
                        {
                            to_: alice.pkh,
                            token_id: 0,
                            amount: 0,
                        },
                        ],
                    },
                    ])
                    .send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates its operators', async () => {
            try{
                // Operation
                const operation = await mTokenEurlInstance.methods.update_operators([
                    {
                        add_operator: {
                            owner: bob.pkh,
                            operator: alice.pkh,
                            token_id: 0,
                        },
                    },
                    ])
                    .send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin compounds', async () => {
            try{
                // Operation
                const operation = await mTokenEurlInstance.methods.compound([bob.pkh]).send()
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    });

    describe("VAULT FACTORY", async () => {

        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk);
        });
        
        it('Admin sets admin', async () => {
            try{
                // Operation
                const operation = await vaultFactoryInstance.methods.setAdmin(bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin sets governance', async () => {
            try{
                // Operation
                const operation = await vaultFactoryInstance.methods.setGovernance(contractDeployments.governance.address).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates whitelist contracts', async () => {
            try{
                // Operation
                const operation = await vaultFactoryInstance.methods.updateWhitelistContracts(bob.pkh, "update").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates general contracts', async () => {
            try{
                // Operation
                const operation = await vaultFactoryInstance.methods.updateGeneralContracts("test", bob.pkh, "update").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates the vault name max length', async () => {
            try{
                // Operation
                const operation = await vaultFactoryInstance.methods.updateConfig(400, "configVaultNameMaxLength").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses the create vault entrypoint', async () => {
            try{
                // Operation
                const operation = await vaultFactoryInstance.methods.togglePauseEntrypoint("createVault", true).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin pauses all entrypoint', async () => {
            try{
                // Operation
                const operation = await vaultFactoryInstance.methods.pauseAll().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin unpauses all entrypoint', async () => {
            try{
                // Operation
                const operation = await vaultFactoryInstance.methods.unpauseAll().send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin creates a vault', async () => {
            try{
                // Initial values
                const loanTokenName     = "usdt";
                const whitelistedUsers  = [bob.pkh, alice.pkh];

                // Operation
                const operation = await vaultFactoryInstance.methods.createVault(
                    null,
                    loanTokenName,          // loan token type
                    "vaultName",
                    null,
                    "whitelist",
                    whitelistedUsers
                ).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    });

    describe("VAULT", async () => {

        before("Initialize vault variables", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk);

            // Save the vault address
            lendingControllerMockTimeStorage    = await lendingControllerMockTimeInstance.storage();
            vaultFactoryStorage                 = await vaultFactoryInstance.storage();
            const vaultId                       = vaultFactoryStorage.vaultCounter.toNumber() - 1;
            const vaultHandle = {
                "id"    : vaultId,
                "owner" : bob.pkh
            };
            const vault                         = await lendingControllerMockTimeStorage.vaults.get(vaultHandle)
            vaultInstance                       = await utils.tezos.contract.at(vault.address);
            vaultStorage                        = await vaultInstance.storage();
        });

        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk);
        });
        
        it('Admin delegates vault tez to baker', async () => {
            try{
                // Operation
                const operation = await vaultInstance.methods.initVaultAction("setBaker", null).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
        
        it('Admin updates the depositor', async () => {
            try{
                // Operation
                const operation = await vaultInstance.methods.initVaultAction("updateDepositor", "whitelist", true, bob.pkh).send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin updates the vault name', async () => {
            try{
                // Operation
                const operation = await vaultInstance.methods.initVaultAction("updateVaultName", "newVaultName").send();
                await operation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    });
});