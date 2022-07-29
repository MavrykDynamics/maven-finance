const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
const { InMemorySigner, importKey } = require("@taquito/signer");
import assert, { ok, rejects, strictEqual, fail } from "assert";
import { MVK, Utils, zeroAddress } from "./helpers/Utils";
import { createHash } from "crypto";
import { packDataBytes, MichelsonData, MichelsonType } from '@taquito/michel-codec';
import fs from "fs";
import { confirmOperation } from "../scripts/confirmation";
import { Estimate, MichelsonMap, OpKind, TransferParams } from "@taquito/taquito";
import {BigNumber} from "bignumber.js";
import randomUserAccounts from "./helpers/random_accounts.json";

const chai              = require("chai");
const salt              = 'azerty';
const chaiAsPromised    = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

import env from "../env";
import { bob, alice, eve, mallory, trudy, oracleMaintainer } from "../scripts/sandbox/accounts";

import doormanAddress                   from '../deployments/doormanAddress.json';
import delegationAddress                from '../deployments/delegationAddress.json';
import governanceAddress                from '../deployments/governanceAddress.json';
import governanceSatelliteAddress       from '../deployments/governanceSatelliteAddress.json';
import mvkTokenAddress                  from '../deployments/mvkTokenAddress.json';
import aggregatorAddress                from '../deployments/aggregatorAddress.json';
import governanceFinancialAddress       from '../deployments/governanceFinancialAddress.json';
import councilAddress                   from '../deployments/councilAddress.json';
import treasuryAddress                  from '../deployments/treasuryAddress.json';
import aggregatorFactoryAddress         from '../deployments/aggregatorFactoryAddress.json';
import governanceProxyAddress           from '../deployments/governanceProxyAddress.json';
import farmFactoryAddress               from '../deployments/farmFactoryAddress.json';
import lpTokenAddress                   from '../deployments/lpTokenAddress.json';

import { config } from "yargs";
import { aggregatorStorageType } from "./types/aggregatorStorageType";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("Stress tests", async () => {
    var utils: Utils;

    let doormanInstance;
    let delegationInstance;
    let mvkTokenInstance;
    let governanceInstance;
    let governanceSatelliteInstance;
    let governanceFinancialInstance;
    let aggregatorInstance;
    let councilInstance;
    let aggregatorFactoryInstance;
    let governanceProxyInstance;
    let farmFactoryInstance;
    
    let doormanStorage;
    let delegationStorage;
    let mvkTokenStorage;
    let governanceStorage;
    let governanceSatelliteStorage;
    let governanceFinancialStorage;
    let aggregatorStorage;
    let councilStorage;
    let aggregatorFactoryStorage;
    let governanceProxyStorage;
    let farmFactoryStorage;
    
    const signerFactory = async (pk) => {
        await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
        return utils.tezos;
    };

    before("setup", async () => {
        try{
            utils = new Utils();
            await utils.init(bob.sk);
            
            doormanInstance                 = await utils.tezos.contract.at(doormanAddress.address);
            delegationInstance              = await utils.tezos.contract.at(delegationAddress.address);
            mvkTokenInstance                = await utils.tezos.contract.at(mvkTokenAddress.address);
            governanceInstance              = await utils.tezos.contract.at(governanceAddress.address);
            governanceSatelliteInstance     = await utils.tezos.contract.at(governanceSatelliteAddress.address);
            aggregatorInstance              = await utils.tezos.contract.at(aggregatorAddress.address);
            governanceFinancialInstance     = await utils.tezos.contract.at(governanceFinancialAddress.address);
            councilInstance                 = await utils.tezos.contract.at(councilAddress.address);
            aggregatorFactoryInstance       = await utils.tezos.contract.at(aggregatorFactoryAddress.address);
            governanceProxyInstance         = await utils.tezos.contract.at(governanceProxyAddress.address);
            farmFactoryInstance             = await utils.tezos.contract.at(farmFactoryAddress.address);
    
            doormanStorage                  = await doormanInstance.storage();
            delegationStorage               = await delegationInstance.storage();
            mvkTokenStorage                 = await mvkTokenInstance.storage();
            governanceStorage               = await governanceInstance.storage();
            governanceSatelliteStorage      = await governanceSatelliteInstance.storage();
            aggregatorStorage               = await aggregatorInstance.storage();
            governanceFinancialStorage      = await governanceFinancialInstance.storage();
            councilStorage                  = await councilInstance.storage();
            aggregatorFactoryStorage        = await aggregatorFactoryInstance.storage();
            governanceProxyStorage          = await governanceProxyInstance.storage();
            farmFactoryStorage              = await farmFactoryInstance.storage();
            
            console.log('-- -- -- -- -- Stress Tests -- -- -- --')
            console.log('Doorman Contract deployed at:'               , doormanInstance.address);
            console.log('Delegation Contract deployed at:'            , delegationInstance.address);
            console.log('MVK Token Contract deployed at:'             , mvkTokenInstance.address);
            console.log('Governance Contract deployed at:'            , governanceInstance.address);
            console.log('Governance Satellite Contract deployed at:'  , governanceSatelliteInstance.address);
            console.log('Governance Financial Contract deployed at:'  , governanceFinancialInstance.address);
            console.log('Aggregator Contract deployed at:'            , aggregatorInstance.address);
            console.log('Council Contract deployed at:'               , councilInstance.address);
            console.log('Aggregator Factory Contract deployed at:'    , aggregatorFactoryInstance.address);
            console.log('Governance Proxy Contract deployed at:'      , governanceProxyInstance.address);
            console.log('Farm Factory Contract deployed at:'          , farmFactoryInstance.address);
            
            console.log('Bob address: '     + bob.pkh);
            console.log('Alice address: '   + alice.pkh);
            console.log('Eve address: '     + eve.pkh);
            console.log('Mallory address: ' + mallory.pkh);

            // Transfer TEZ and MVK for each user
            await signerFactory(bob.sk);
            const batchSize     = 50
            const tezAmount     = 5
            const mvkAmount     = 20
            const userAmount    = randomUserAccounts.length;
            const batchesCount  = Math.ceil(userAmount / batchSize);
            var txsTransferList = []

            console.log("There will be", userAmount, "users in this stress test")

            for(let i = 0; i < batchesCount; i++) {
                const batch = utils.tezos.wallet.batch();
                for (const index in randomUserAccounts){
                    const account: any  = randomUserAccounts[index];

                    if(parseInt(index) < (batchSize * (i + 1)) && (parseInt(index) >= batchSize * i)){
                        // Prepare a transfer of MVK
                        txsTransferList.push({
                            to_: account.pkh,
                            token_id: 0,
                            amount: MVK(mvkAmount),
                        })
                        // Transfer only if receiver as less than 1XTZ
                        const userBalance   = await utils.tezos.tz.getBalance(account.pkh);
                        if(userBalance.toNumber() < 1){
                            batch.withTransfer({ to: account.pkh, amount: tezAmount })
                            const transferEstimation    = await utils.tezos.estimate.transfer({ to: account.pkh, amount: tezAmount })
                            console.log("Transfer estimation for",account.pkh,":",transferEstimation)
                        }
                    }
                }
                const batchOperation    = await batch.send()
                await batchOperation.confirmation()
            }
            
            const transferOperation = await mvkTokenInstance.methods.transfer([
                {
                    from_: bob.pkh,
                    txs: txsTransferList
                }
            ]).send()
            await transferOperation.confirmation()

            // Update delegation config for max satellites
            const updateConfigOperation = await delegationInstance.methods.updateConfig(userAmount,"configMaxSatellites").send();
            await updateConfigOperation.confirmation()

        } catch(e) {
            console.dir(e, {depth: 5})
        }
    });

    describe("Registering as satellite", async () => {

        it('%update_operators / %stake / %registerAsSatellite', async () => {
            try{
                // Initial values
                mvkTokenStorage         = await mvkTokenInstance.storage();
                var minimalCost         = {
                    batchIndex: 0,
                    totalCostMutez: MVK(999999),
                    estimations: []
                }
                var maximalCost         = {
                    batchIndex: 0,
                    totalCostMutez: 0,
                    estimations: []
                }

                // Operation
                for (const index in randomUserAccounts){
                    
                    delegationStorage           = await delegationInstance.storage();
                    doormanStorage              = await doormanInstance.storage();
                    const accessAmount          = delegationStorage.config.minimumStakedMvkBalance.toNumber() > doormanStorage.config.minMvkAmount.toNumber() ? delegationStorage.config.minimumStakedMvkBalance.toNumber() : doormanStorage.config.minMvkAmount.toNumber();
                    const account: any          = randomUserAccounts[index];
                    var satelliteRecord         = await delegationStorage.satelliteLedger.get(account.pkh);
                    const satelliteName         = account.pkh;
                    const satelliteDescription  = "Test Description";
                    const satelliteImage        = "https://placeholder.com/300";
                    const satelliteWebsite      = "https://placeholder.com/300";
                    const satelliteFee          = Math.trunc(Math.random() * 1000);
                    const stakeAmount           = MVK(Math.trunc(15 * Math.random())) + accessAmount + 1;
                    await signerFactory(account.sk);

                    if(satelliteRecord===undefined){

                        // Calculate each operation gas cost estimation
                        const operatorsParams       = await mvkTokenInstance.methods.update_operators([
                        {
                            add_operator: {
                            owner: account.pkh,
                            operator: doormanAddress.address,
                            token_id: 0,
                            },
                        }]).toTransferParams({})
                        const stakeParams           = await doormanInstance.methods.stake(stakeAmount).toTransferParams({})
                        const registerParams        = await delegationInstance.methods.registerAsSatellite(
                            satelliteName, 
                            satelliteDescription, 
                            satelliteImage, 
                            satelliteWebsite,
                            satelliteFee
                        ).toTransferParams({})
                        const batchOpEstimate = await utils.tezos.estimate
                        .batch([
                            { kind: OpKind.TRANSACTION, to: mvkTokenAddress.address, parameter: operatorsParams.parameter, amount: 0},
                            { kind: OpKind.TRANSACTION, to: doormanAddress.address, parameter: stakeParams.parameter, amount: 0},
                            { kind: OpKind.TRANSACTION, to: delegationAddress.address, parameter: registerParams.parameter, amount: 0},
                        ])

                        // Create a complete operation batch
                        const userBatch = utils.tezos.wallet.batch()
                        .withContractCall(mvkTokenInstance.methods.update_operators([
                        {
                            add_operator: {
                            owner: account.pkh,
                            operator: doormanAddress.address,
                            token_id: 0,
                            },
                        }]))
                        .withContractCall(doormanInstance.methods.stake(stakeAmount))
                        .withContractCall(delegationInstance.methods.registerAsSatellite(
                            satelliteName, 
                            satelliteDescription, 
                            satelliteImage, 
                            satelliteWebsite,
                            satelliteFee
                        ));

                        // Send the batch
                        const batchOperation    = await userBatch.send()
                        await batchOperation.confirmation()

                        var batchTotalCost      = []
                        var totalCost           = 0
                        batchOpEstimate.forEach((estimate: Estimate) => {
                            batchTotalCost.push({
                                estimate: estimate,
                                totalCostMutez: estimate.totalCost
                            })
                            totalCost   += estimate.totalCost
                        })

                        // Calculate difference between min and max for the registering operation
                        const registeringCost           = batchOpEstimate[batchOpEstimate.length-1].totalCost;
                        const minimalRegisteringCost    = minimalCost.estimations.length > 0 ? minimalCost.estimations[minimalCost.estimations.length-1].totalCost : MVK(999999);
                        const maximalRegisteringCost    = maximalCost.estimations.length > 0 ? maximalCost.estimations[maximalCost.estimations.length-1].totalCost : 0;
                        minimalCost         = {
                            batchIndex: minimalRegisteringCost > registeringCost ? parseInt(index) : minimalCost.batchIndex,
                            totalCostMutez: minimalRegisteringCost > registeringCost ? totalCost : minimalCost.totalCostMutez,
                            estimations: minimalRegisteringCost > registeringCost ? batchTotalCost : minimalCost.estimations
                        }
                        maximalCost         = {
                            batchIndex: maximalRegisteringCost < registeringCost ? parseInt(index) : maximalCost.batchIndex,
                            totalCostMutez: maximalRegisteringCost < registeringCost ? totalCost : maximalCost.totalCostMutez,
                            estimations: maximalRegisteringCost < registeringCost ? batchTotalCost : maximalCost.estimations
                        }

                        // Print the result and the estimations
                        delegationStorage       = await delegationInstance.storage();
                        satelliteRecord         = await delegationStorage.satelliteLedger.get(account.pkh);
                        console.log("Satellite record for", account.pkh, ":", satelliteRecord);
                        console.log("   - Batch estimation :", batchTotalCost);
                    }
                }

                console.log("Registering complete")
                console.dir(minimalCost, {depth: 5});
                console.dir(maximalCost, {depth: 5});
                
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

    })

    describe("Starting a proposal round", async () => {

        before("setup", async() => {
            try{
                // Update config for shorter rounds
                await signerFactory(bob.sk)
                var updateGovernanceConfig  = await governanceInstance.methods.updateConfig(0, "configBlocksPerProposalRound").send();
                await updateGovernanceConfig.confirmation();
                updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configBlocksPerVotingRound").send();
                await updateGovernanceConfig.confirmation();
                updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configBlocksPerTimelockRound").send();
                await updateGovernanceConfig.confirmation();
                updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configMinProposalRoundVotePct").send();
                await updateGovernanceConfig.confirmation();
                updateGovernanceConfig      = await governanceInstance.methods.updateConfig(1, "configMinProposalRoundVotesReq").send();
                await updateGovernanceConfig.confirmation();
                updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configMinQuorumPercentage").send();
                await updateGovernanceConfig.confirmation();
                updateGovernanceConfig      = await governanceInstance.methods.updateConfig(1, "configMinYayVotePercentage").send();
                await updateGovernanceConfig.confirmation();
            } catch(e){
                console.dir(e, {depth: 5});
            }
        })

        it('%startNextRound', async () => {
            try{
                // Initial values
                await signerFactory(randomUserAccounts[0].sk);
                governanceStorage           = await governanceInstance.storage();

                // Operation
                const operationParams       = await governanceInstance.methods.startNextRound(false).toTransferParams({})
                const operationEstimation   = await utils.tezos.estimate.transfer(operationParams);
                const operation             = await governanceInstance.methods.startNextRound(false).send();
                await operation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                const currentRound          = governanceStorage.currentCycleInfo.round;

                // Print Estimation
                const operationTotalCost    = {
                    estimate: operationEstimation,
                    totalCostMutez: operationEstimation.totalCost
                }
                console.log("Round: ", currentRound)
                console.log("Operation total cost: ", operationTotalCost)
            } catch(e){
                console.dir(e, {depth: 5});
            }
        })
    })

    describe("Creating a governance satellite action", async () => {

        it('%suspendSatellite', async () => {
            try{
                // Initial values
                await signerFactory(randomUserAccounts[0].sk);
                governanceSatelliteStorage  = await governanceSatelliteInstance.storage();
                const satelliteToSuspend    = randomUserAccounts[1].pkh;
                const purpose               = "Stress test"
                const actionId              = governanceSatelliteStorage.governanceSatelliteCounter;

                // Operation
                const operationParams       = await governanceSatelliteInstance.methods.suspendSatellite(satelliteToSuspend, purpose).toTransferParams({})
                const operationEstimation   = await utils.tezos.estimate.transfer(operationParams);

                // Print Estimation
                const operationTotalCost    = {
                    estimate: operationEstimation,
                    totalCostMutez: operationEstimation.totalCost
                }
                console.log("Operation total cost: ", operationTotalCost)

                // Operation
                const operation             = await governanceSatelliteInstance.methods.suspendSatellite(satelliteToSuspend, purpose).send();
                await operation.confirmation();

                // Final values
                governanceSatelliteStorage  = await governanceSatelliteInstance.storage();
                const satelliteAction       = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
                console.log("Governance satellite action:", satelliteAction)
            } catch(e){
                console.dir(e, {depth: 5});
            }
        })
    })

    describe("Creating a governance financial action", async () => {

        describe("setup", async() => {
            try{
                // Update config to simplify council votes
                await signerFactory(bob.sk)
                var updateConfigOperation   = await delegationInstance.methods.updateConfig(10,"configDelegationRatio").send();
                await updateConfigOperation.confirmation();
                updateConfigOperation       = await governanceFinancialInstance.methods.updateConfig(10,"configFinancialReqApprovalPct").send();
                await updateConfigOperation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5});
            }
        })

        it('Council contract should be able to call this entrypoint and mint MVK', async () => {
            try{

                // some init constants
                councilStorage                  = await councilInstance.storage();
                governanceFinancialStorage      = await governanceFinancialInstance.storage();
                const financialActionId         = governanceFinancialStorage.financialRequestCounter;
                const councilActionId           = councilStorage.actionCounter;
                const financialRequestID        = governanceFinancialStorage.financialRequestCounter;

                // request mint params
                const treasury                  = treasuryAddress.address;
                const tokenAmount               = MVK(1000); // 1000 MVK
                const purpose                   = "Test Council Request Mint 1000 MVK";            

                // Council member (bob) requests for MVK to be minted and transferred from the Treasury
                await signerFactory(bob.sk);
                const councilRequestsMintOperation = await councilInstance.methods.councilActionRequestMint(
                        treasury, 
                        tokenAmount,
                        purpose
                    ).send();
                await councilRequestsMintOperation.confirmation();

                // council members sign action, and action is executed once threshold of 3 signers is reached
                await signerFactory(alice.sk);
                const firstVoteParams                       = await councilInstance.methods.signAction(councilActionId).toTransferParams({})
                const firstVoteEstimation                   = await utils.tezos.estimate.transfer(firstVoteParams);

                // Print Estimation
                const firstVoteTotalCost    = {
                    estimate: firstVoteEstimation,
                    totalCostMutez: firstVoteEstimation.totalCost
                }
                console.log("First council vote operation total cost: ", firstVoteTotalCost)

                // First sign operation
                const aliceSignsRequestMintActionOperation  = await councilInstance.methods.signAction(councilActionId).send();
                await aliceSignsRequestMintActionOperation.confirmation();

                await signerFactory(eve.sk);
                const secondVoteParams                       = await councilInstance.methods.signAction(councilActionId).toTransferParams({})
                const secondVoteEstimation                   = await utils.tezos.estimate.transfer(secondVoteParams);

                // Print Estimation
                const secondVoteTotalCost    = {
                    estimate: secondVoteEstimation,
                    totalCostMutez: secondVoteEstimation.totalCost
                }
                console.log("Second council vote operation total cost: ", secondVoteTotalCost)

                const eveSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await eveSignsRequestMintActionOperation.confirmation();

                // Final values
                governanceFinancialStorage      = await governanceFinancialInstance.storage();
                const financialAction           = await governanceFinancialStorage.financialRequestLedger.get(financialActionId);

                console.log("Governance financial action:", financialAction)
            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });
    });

    describe("Distribute SMVK rewards to all satellite", async () => {

        before("Add Admin to delegation whitelist contracts", async () => {
            try{
                await signerFactory(bob.sk)
                const updateWhitelistContractsOperation = await delegationInstance.methods.updateWhitelistContracts('Admin', bob.pkh).send()
                await updateWhitelistContractsOperation.confirmation();
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%distributeReward", async () => {
            try{

                // Initial values
                var satellitesSet   = []
                for (const index in randomUserAccounts){
                    const account: any  = randomUserAccounts[index];
                    satellitesSet.push(account.pkh)
                }

                // Estimation
                const distributeRewardParams        = await delegationInstance.methods.distributeReward(satellitesSet,MVK(50)).toTransferParams({})
                const distributeRewardEstimation    = await utils.tezos.estimate.transfer(distributeRewardParams);
                const distributeRewardTotalCost     = {
                    estimate: distributeRewardEstimation,
                    totalCostMutez: distributeRewardEstimation.totalCost
                }
                console.log("Estimate: ", distributeRewardTotalCost)

                // Operation
                const distributeRewardOperation     = await delegationInstance.methods.distributeReward(satellitesSet,MVK(50)).send();
                await distributeRewardOperation.confirmation();
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })
    })

    describe("Run though a governance cycle", async () => {

        before("Set farm factory admin to proxy contract", async () => {
            try{
                await signerFactory(bob.sk)
                const setAdminOperation = await farmFactoryInstance.methods.setAdmin(governanceProxyAddress.address).send();
                await setAdminOperation.confirmation();
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it('Council contract should be able to call this entrypoint and mint MVK', async () => {
            try{
                // Initial values
                await signerFactory(randomUserAccounts[0].sk);
                governanceStorage           = await governanceInstance.storage();
                farmFactoryStorage          = await farmFactoryInstance.storage();
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Create a farm";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

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

                // Create a farm compiled params
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'createFarm',
                    "testFarm",
                    false,
                    false,
                    false,
                    12000,
                    100,
                    farmMetadataBase,
                    lpTokenAddress.address,
                    0,
                    "fa12",
                ).toTransferParams();
                const lambdaParamsValue = lambdaParams.parameter.value;
                const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

                const referenceDataPacked = await utils.tezos.rpc.packData({
                    data: lambdaParamsValue,
                    type: proxyDataPackingHelperType
                }).catch(e => console.error('error:', e));

                var packedParam;
                if (referenceDataPacked) {
                    packedParam = referenceDataPacked.packed
                    console.log('packed %createFarm param: ' + packedParam);
                } else {
                throw `packing failed`
                };

                const proposalMetadata      = [
                    {
                        title: "FirstFarm#1",
                        data: packedParam
                    }
                ]

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();

                for (const index in randomUserAccounts){
                    const account: any  = randomUserAccounts[index];
                    await signerFactory(account.sk);

                    const proposalVoteParams        = await governanceInstance.methods.proposalRoundVote(proposalId).toTransferParams({})
                    const proposalVoteEstimation    = await utils.tezos.estimate.transfer(proposalVoteParams);
                    const proposalVoteTotalCost     = {
                        estimate: proposalVoteEstimation,
                        totalCostMutez: proposalVoteEstimation.totalCost
                    }

                    var voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                    await voteOperation.confirmation();
                    console.log(account.pkh, "voted for proposal #", proposalId, "during the proposal round")
                    console.log("Estimation: ", proposalVoteTotalCost)
                }

                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> all satellites vote
                for (const index in randomUserAccounts){
                    const account: any  = randomUserAccounts[index];
                    await signerFactory(account.sk);

                    const votingVoteParams          = await governanceInstance.methods.votingRoundVote("yay").toTransferParams({})
                    const votingVoteEstimation      = await utils.tezos.estimate.transfer(votingVoteParams);
                    const votingVoteTotalCost       = {
                        estimate: votingVoteEstimation,
                        totalCostMutez: votingVoteEstimation.totalCost
                    }

                    var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                    await votingRoundVoteOperation.confirmation();
                    console.log(account.pkh, "voted for proposal #", proposalId, "during the voting round")
                    console.log("Estimation: ", votingVoteTotalCost)
                }

                // Execute proposal
                var startNextRoundParams        = await governanceInstance.methods.startNextRound(true).toTransferParams({})
                var startNextRoundEstimation    = await utils.tezos.estimate.transfer(startNextRoundParams);
                var startNextRoundTotalCost     = {
                    estimate: startNextRoundEstimation,
                    totalCostMutez: startNextRoundEstimation.totalCost
                }
                console.log("startNextRound #1 estimation: ", startNextRoundTotalCost)

                nextRoundOperation              = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                startNextRoundParams            = await governanceInstance.methods.startNextRound(false).toTransferParams({})
                startNextRoundEstimation        = await utils.tezos.estimate.transfer(startNextRoundParams);
                var startNextRoundTotalCost     = {
                    estimate: startNextRoundEstimation,
                    totalCostMutez: startNextRoundEstimation.totalCost
                }

                console.log("startNextRound #2 estimation: ", startNextRoundTotalCost)
                nextRoundOperation              = await governanceInstance.methods.startNextRound(false).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage               = await governanceInstance.storage();
                const proposal                  = await governanceStorage.proposalLedger.get(proposalId);
                console.log("Final proposal: ", proposal)
            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });
    });
})