const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
const { InMemorySigner, importKey } = require("@taquito/signer");
import assert, { ok, rejects, strictEqual } from "assert";
import { Utils, MVK } from "./helpers/Utils";
import fs from "fs";
import { confirmOperation } from "../scripts/confirmation";
import { BigNumber } from 'bignumber.js'

const chai = require("chai");
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

import env from "../env";
import { bob, alice, eve, mallory, oscar, trudy, isaac, david, susie, ivan } from "../scripts/sandbox/accounts";

import doormanAddress from '../deployments/doormanAddress.json';
import delegationAddress from '../deployments/delegationAddress.json';
import mvkTokenAddress from '../deployments/mvkTokenAddress.json';
import councilAddress from '../deployments/councilAddress.json';
import governanceAddress from '../deployments/governanceAddress.json';
import governanceProxyAddress from '../deployments/governanceProxyAddress.json';
import emergencyGovernanceAddress from '../deployments/emergencyGovernanceAddress.json';
import breakGlassAddress from '../deployments/breakGlassAddress.json';
import vestingAddress from '../deployments/vestingAddress.json';
import treasuryAddress from '../deployments/treasuryAddress.json';
import lpTokenAddress from '../deployments/lpTokenAddress.json';
import farmFactoryAddress from '../deployments/farmFactoryAddress.json'
import treasuryFactoryAddress from '../deployments/treasuryFactoryAddress.json'
import farmAddress from '../deployments/farmAddress.json'
import doormanLambdas from '../build/lambdas/doormanLambdas.json'
import { MichelsonMap } from "@taquito/taquito";
import { farmStorageType } from "./types/farmStorageType";

describe("Governance proxy lambdas tests", async () => {
    var utils: Utils;

    let doormanInstance;
    let delegationInstance;
    let mvkTokenInstance;
    let councilInstance;
    let governanceInstance;
    let governanceProxyInstance;
    let emergencyGovernanceInstance;
    let breakGlassInstance;
    let vestingInstance;
    let treasuryInstance;
    let farmFactoryInstance;
    let treasuryFactoryInstance;
    let farmInstance;

    let doormanStorage;
    let delegationStorage;
    let mvkTokenStorage;
    let councilStorage;
    let governanceStorage;
    let governanceProxyStorage;
    let emergencyGovernanceStorage;
    let breakGlassStorage;
    let vestingStorage;
    let treasuryStorage;
    let farmFactoryStorage;
    let treasuryFactoryStorage;
    let farmStorage;

    // For testing purposes
    var aTrackedFarm;
    var aTrackedTreasury;
    
    const signerFactory = async (pk) => {
        await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
        return utils.tezos;
    };

    before("setup", async () => {
        try {
            utils = new Utils();
            await utils.init(bob.sk);
    
            doormanInstance    = await utils.tezos.contract.at(doormanAddress.address);
            delegationInstance    = await utils.tezos.contract.at(delegationAddress.address);
            mvkTokenInstance   = await utils.tezos.contract.at(mvkTokenAddress.address);
            councilInstance   = await utils.tezos.contract.at(councilAddress.address);
            governanceInstance = await utils.tezos.contract.at(governanceAddress.address);
            governanceProxyInstance = await utils.tezos.contract.at(governanceProxyAddress.address);
            emergencyGovernanceInstance    = await utils.tezos.contract.at(emergencyGovernanceAddress.address);
            breakGlassInstance = await utils.tezos.contract.at(breakGlassAddress.address);
            vestingInstance = await utils.tezos.contract.at(vestingAddress.address);
            treasuryInstance = await utils.tezos.contract.at(treasuryAddress.address);
            farmFactoryInstance = await utils.tezos.contract.at(farmFactoryAddress.address);
            treasuryFactoryInstance = await utils.tezos.contract.at(treasuryFactoryAddress.address);
            farmInstance    = await utils.tezos.contract.at(farmAddress.address);
                
            doormanStorage    = await doormanInstance.storage();
            delegationStorage    = await delegationInstance.storage();
            mvkTokenStorage   = await mvkTokenInstance.storage();
            councilStorage   = await councilInstance.storage();
            governanceStorage = await governanceInstance.storage();
            governanceProxyStorage = await governanceProxyInstance.storage();
            emergencyGovernanceStorage = await emergencyGovernanceInstance.storage();
            breakGlassStorage = await breakGlassInstance.storage();
            vestingStorage = await vestingInstance.storage();
            treasuryStorage = await treasuryInstance.storage();
            farmFactoryStorage  = await farmFactoryInstance.storage();
            treasuryFactoryStorage  = await treasuryFactoryInstance.storage();
            farmStorage = await farmInstance.storage();
    
            console.log('-- -- -- -- -- Governance Proxy Tests -- -- -- --')
            console.log('Doorman Contract deployed at:', doormanInstance.address);
            console.log('Delegation Contract deployed at:', delegationInstance.address);
            console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
            console.log('Council Contract deployed at:', councilInstance.address);
            console.log('Governance Contract deployed at:', governanceInstance.address);
            console.log('Emergency Governance Contract deployed at:', emergencyGovernanceInstance.address);
            console.log('Break Glass Contract deployed at:', breakGlassInstance.address);
            console.log('Vesting Contract deployed at:', vestingInstance.address);
            console.log('Treasury Contract deployed at:', treasuryInstance.address);
            console.log('Farm Factory Contract deployed at:', farmFactoryAddress.address);
            console.log('Treasury Factory Contract deployed at:', treasuryFactoryAddress.address);
            console.log('Farm Contract deployed at:', farmAddress.address);
            console.log('Bob address: ' + bob.pkh);
            console.log('Alice address: ' + alice.pkh);
            console.log('Eve address: ' + eve.pkh);
            console.log('Mallory address: ' + mallory.pkh);
            console.log('Oscar address: ' + oscar.pkh);
            console.log('-- -- -- -- -- -- -- -- --')
    
            // Check if cycle already started (for retest purposes)
            const cycleEnd  = governanceStorage.currentCycleEndLevel;
            if (cycleEnd == 0) {
                // Update governance config for shorter cycles
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
                updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configMinimumStakeReqPercentage").send();
                await updateGovernanceConfig.confirmation();
                updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configMinQuorumPercentage").send();
                await updateGovernanceConfig.confirmation();
                updateGovernanceConfig      = await governanceInstance.methods.updateConfig(1, "configMinQuorumMvkTotal").send();
                await updateGovernanceConfig.confirmation();
                updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configMinimumStakeReqPercentage").send();
                await updateGovernanceConfig.confirmation();
    
                // Register satellites
                var updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
                {
                    add_operator: {
                        owner    : bob.pkh,
                        operator : doormanAddress.address,
                        token_id : 0,
                    },
                }])
                .send()
                await updateOperatorsOperation.confirmation();
                var stakeOperation = await doormanInstance.methods.stake(MVK(100)).send();
                await stakeOperation.confirmation();
                var registerAsSatelliteOperation = await delegationInstance.methods
                    .registerAsSatellite(
                        "Bob", 
                        "Bob description", 
                        "Bob image", 
                        "Bob website",
                        1000
                    ).send();
                await registerAsSatelliteOperation.confirmation();
    
                await signerFactory(alice.sk)
                var updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
                {
                    add_operator: {
                        owner    : alice.pkh,
                        operator : doormanAddress.address,
                        token_id : 0,
                    },
                }])
                .send()
                await updateOperatorsOperation.confirmation();
                stakeOperation = await doormanInstance.methods.stake(MVK(100)).send();
                await stakeOperation.confirmation();
                var registerAsSatelliteOperation = await delegationInstance.methods
                    .registerAsSatellite(
                        "Alice", 
                        "Alice description", 
                        "Alice image", 
                        "Alice website",
                        1000
                    ).send();
                await registerAsSatelliteOperation.confirmation();
        
                // Set contracts admin to governance proxy
                await signerFactory(bob.sk);
                governanceStorage               = await governanceInstance.storage();            
                const generalContracts          = governanceStorage.generalContracts.entries();
                var setAdminOperation           = await governanceInstance.methods.setAdmin(governanceProxyAddress.address).send();
                await setAdminOperation.confirmation();
                setAdminOperation               = await mvkTokenInstance.methods.setAdmin(governanceProxyAddress.address).send();
                await setAdminOperation.confirmation();
                setAdminOperation               = await farmInstance.methods.setAdmin(governanceProxyAddress.address).send();
                await setAdminOperation.confirmation();
                for (let entry of generalContracts){
                    // Get contract storage
                    var contract        = await utils.tezos.contract.at(entry[1]);
                    var storage:any     = await contract.storage();
    
                    // Check admin
                    if(storage.hasOwnProperty('admin') && storage.admin!==governanceProxyAddress.address && storage.admin!==breakGlassAddress.address){
                        setAdminOperation   = await contract.methods.setAdmin(governanceProxyAddress.address).send();
                        await setAdminOperation.confirmation()
                    }
                }
            } else {
                // Start next round until new proposal round
                governanceStorage       = await governanceInstance.storage()
                var currentRound        = governanceStorage.currentRound
                var currentRoundString  = Object.keys(currentRound)[0]
    
                delegationStorage       = await delegationInstance.storage();
                console.log(await delegationStorage.satelliteLedger.size);
    
                while(currentRoundString!=="proposal"){
                    var restartRound                = await governanceInstance.methods.startNextRound(false).send();
                    await restartRound.confirmation()
                    governanceStorage               = await governanceInstance.storage()
                    currentRound                    = governanceStorage.currentRound
                    currentRoundString              = Object.keys(currentRound)[0]
                    console.log("Current round: ", currentRoundString)
                }
            }
        } catch(e){
            console.dir(e, {depth:5})
        }
    });

    describe("%createFarm", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Creation of a single farm", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                farmFactoryStorage          = await farmFactoryInstance.storage();
                const initTrackedFarms      = await farmFactoryStorage.trackedFarms;
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

                const proposalMetadata      = MichelsonMap.fromLiteral({
                    "FirstFarm#1": packedParam
                });

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                farmFactoryStorage          = await farmFactoryInstance.storage();
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);
                const endTrackedFarms       = await farmFactoryStorage.trackedFarms;
                
                // Assertions
                console.log("TRACKED FARMS: ", endTrackedFarms);
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endTrackedFarms.length, initTrackedFarms.length);
                aTrackedFarm    = endTrackedFarms[0]
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })

        it("Scenario - Creation of multiple farms (stress test)", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                farmFactoryStorage          = await farmFactoryInstance.storage();
                const initTrackedFarms      = await farmFactoryStorage.trackedFarms;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Create multiple farms";
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

                const proposalMetadata      = MichelsonMap.fromLiteral({
                    "FirstFarm#1": packedParam,
                    "FirstFarm#2": packedParam,
                });

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                const nextRoundParam        = await governanceInstance.methods.startNextRound(true).toTransferParams();
                const estimate              = await utils.tezos.estimate.transfer(nextRoundParam);
                console.log("ESTIMATION: ", estimate)

                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                farmFactoryStorage          = await farmFactoryInstance.storage();
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);
                const endTrackedFarms       = await farmFactoryStorage.trackedFarms;

                // Assertions
                console.log("TRACKED FARMS: ", endTrackedFarms);
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endTrackedFarms.length, initTrackedFarms.length);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%untrackFarm", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Untrack a previously created farm", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                farmFactoryStorage          = await farmFactoryInstance.storage();
                const initTrackedFarms      = await farmFactoryStorage.trackedFarms;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Untrack a farm";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";
                
                console.log("INIT TRACKED FARMS: ", initTrackedFarms);
                console.log(initTrackedFarms.length)

                // Untrack a farm compiled params
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'untrackFarm',
                    aTrackedFarm
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
                    console.log('packed %untrackFarm param: ' + packedParam);
                } else {
                throw `packing failed`
                };

                const proposalMetadata      = MichelsonMap.fromLiteral({
                    "Untrack#1": packedParam
                });

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                farmFactoryStorage          = await farmFactoryInstance.storage();
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);
                const endTrackedFarms       = await farmFactoryStorage.trackedFarms;
                
                // Assertions
                console.log("TRACKED FARMS: ", endTrackedFarms);
                console.log(endTrackedFarms.length)
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endTrackedFarms.length, initTrackedFarms.length);
                assert.equal(endTrackedFarms.includes(aTrackedFarm), false);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%trackFarm", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Track the previously untracked farm", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                farmFactoryStorage          = await farmFactoryInstance.storage();
                const initTrackedFarms      = await farmFactoryStorage.trackedFarms;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Track a farm";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Untrack a farm compiled params
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'trackFarm',
                    aTrackedFarm
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
                    console.log('packed %trackFarm param: ' + packedParam);
                } else {
                    throw `packing failed`
                };

                const proposalMetadata      = MichelsonMap.fromLiteral({
                    "Track#1": packedParam
                });

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                farmFactoryStorage          = await farmFactoryInstance.storage();
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);
                const endTrackedFarms       = await farmFactoryStorage.trackedFarms;
                
                // Assertions
                console.log("TRACKED FARMS: ", endTrackedFarms);
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endTrackedFarms.length, initTrackedFarms.length);
                assert.equal(endTrackedFarms.includes(aTrackedFarm), true);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%createTreasury", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Creation of a single treasury", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
                const inittrackedTreasuries = await treasuryFactoryStorage.trackedTreasuries;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Create a treasury";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                const treasuryMetadataBase = Buffer.from(
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
                    'createTreasury',
                    treasuryMetadataBase
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
                    console.log('packed %createTreasury param: ' + packedParam);
                } else {
                throw `packing failed`
                };

                const proposalMetadata      = MichelsonMap.fromLiteral({
                    "FirstTreasury#1": packedParam
                });

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);
                const endtrackedTreasuries  = await treasuryFactoryStorage.trackedTreasuries;
                
                // Assertions
                console.log("TRACKED TREASURIES: ", endtrackedTreasuries);
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endtrackedTreasuries.length, inittrackedTreasuries.length);
                aTrackedTreasury    = endtrackedTreasuries[0]
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })

        it("Scenario - Creation of multiple treasuries", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
                const inittrackedTreasuries = await treasuryFactoryStorage.trackedTreasuries;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Create a treasury";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                const treasuryMetadataBase = Buffer.from(
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
                    'createTreasury',
                    treasuryMetadataBase
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
                    console.log('packed %createTreasury param: ' + packedParam);
                } else {
                throw `packing failed`
                };

                const proposalMetadata      = MichelsonMap.fromLiteral({
                    "FirstTreasury#1": packedParam,
                    "FirstTreasury#2": packedParam,
                });

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                const nextRoundParam        = await governanceInstance.methods.startNextRound(true).toTransferParams();
                const estimate              = await utils.tezos.estimate.transfer(nextRoundParam);
                console.log("ESTIMATION: ", estimate)

                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);
                const endtrackedTreasuries  = await treasuryFactoryStorage.trackedTreasuries;
                
                // Assertions
                console.log("TRACKED TREASURIES: ", endtrackedTreasuries);
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endtrackedTreasuries.length, inittrackedTreasuries.length);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%untrackTreasury", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Untrack a previously created treasury", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
                const inittrackedTreasuries = await treasuryFactoryStorage.trackedTreasuries;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Untrack a farm";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";
                
                console.log("INIT TRACKED TREASURIES: ", inittrackedTreasuries);
                console.log(inittrackedTreasuries.length)

                // Untrack a farm compiled params
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'untrackTreasury',
                    aTrackedTreasury
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
                    console.log('packed %untrackFarm param: ' + packedParam);
                } else {
                throw `packing failed`
                };

                const proposalMetadata      = MichelsonMap.fromLiteral({
                    "Untrack#1": packedParam
                });

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);
                const endtrackedTreasuries  = await treasuryFactoryStorage.trackedTreasuries;
                
                // Assertions
                console.log("TRACKED TREASURIES: ", endtrackedTreasuries);
                console.log(endtrackedTreasuries.length)
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endtrackedTreasuries.length, inittrackedTreasuries.length);
                assert.equal(endtrackedTreasuries.includes(aTrackedTreasury), false);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%trackTreasury", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Track the previously untracked farm", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
                const inittrackedTreasuries = await treasuryFactoryStorage.trackedTreasuries;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Track a farm";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Untrack a farm compiled params
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'trackTreasury',
                    aTrackedTreasury
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
                    console.log('packed %trackFarm param: ' + packedParam);
                } else {
                    throw `packing failed`
                };

                const proposalMetadata      = MichelsonMap.fromLiteral({
                    "Track#1": packedParam
                });

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);
                const endtrackedTreasuries  = await treasuryFactoryStorage.trackedTreasuries;
                
                // Assertions
                console.log("TRACKED TREASURIES: ", endtrackedTreasuries);
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endtrackedTreasuries.length, inittrackedTreasuries.length);
                assert.equal(endtrackedTreasuries.includes(aTrackedTreasury), true);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%updateMvkInflationRate", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Update the Mvk Inflation rate", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                mvkTokenStorage             = await mvkTokenInstance.storage();
                const initMVKInflationRate  = mvkTokenStorage.inflationRate;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Update MVK Inflation Rate";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Untrack a farm compiled params
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'updateMvkInflationRate',
                    700
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
                    console.log('packed %updateMvkInflationRate param: ' + packedParam);
                } else {
                    throw `packing failed`
                };

                const proposalMetadata      = MichelsonMap.fromLiteral({
                    "Track#1": packedParam
                });

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                mvkTokenStorage             = await mvkTokenInstance.storage();
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);
                const endMVKInflationRate   = mvkTokenStorage.inflationRate;
                
                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endMVKInflationRate, initMVKInflationRate);
                assert.equal(endMVKInflationRate, 700);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%setContractAdmin", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Set a contract admin to another address", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                delegationStorage           = await delegationInstance.storage();
                const initAdmin             = delegationStorage.admin;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Set contract";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Set a contract admin compiled params
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'setContractAdmin',
                    alice.pkh,
                    delegationAddress.address
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
                    console.log('packed %setContractAdmin param: ' + packedParam);
                } else {
                    throw `packing failed`
                };

                const proposalMetadata      = MichelsonMap.fromLiteral({
                    "SetAdmin#1": packedParam
                });

                //Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                delegationStorage           = await delegationInstance.storage();
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);
                const endAdmin              = delegationStorage.admin;
                
                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(initAdmin, endAdmin);
                assert.equal(endAdmin, alice.pkh);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%setContractGovernance", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Set all contracts governance to another address", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                governanceProxyStorage      = await governanceProxyInstance.storage();
                const generalContracts      = governanceStorage.generalContracts.entries();
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Set contract";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Set a contract governance compiled params
                const proposalMetadata      = MichelsonMap.fromLiteral({});
                var generalCounter          = 0;
                for (let entry of generalContracts){
                    // Get contract storage
                    var contract        = await utils.tezos.contract.at(entry[1]);
                    var storage:any     = await contract.storage();

                    generalCounter++;
                    var entryName       = "Governance#"+generalCounter

                    // Check admin
                    if(storage.hasOwnProperty('governanceAddress')){
                        var lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                            'setContractGovernance',
                            entry[1],
                            alice.pkh,
                        ).toTransferParams();
                        var lambdaParamsValue = lambdaParams.parameter.value;
                        var proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
        
                        var referenceDataPacked = await utils.tezos.rpc.packData({
                            data: lambdaParamsValue,
                            type: proxyDataPackingHelperType
                        }).catch(e => console.error('error:', e));
        
                        var packedParam;
                        if (referenceDataPacked) {
                            packedParam = referenceDataPacked.packed
                            console.log('packed %setContractGovernance param: ' + packedParam);
                        } else {
                            throw `packing failed`
                        };

                        // Add new setGovernance data
                        proposalMetadata.set(entryName, packedParam);
                    }
                }

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);
                
                // Assertions
                assert.strictEqual(proposal.executed, true);
                for (let entry of generalContracts){
                    // Get contract storage
                    var contract        = await utils.tezos.contract.at(entry[1]);
                    var storage:any     = await contract.storage();

                    // Check admin
                    if(storage.hasOwnProperty('governanceAddress')){
                        assert.strictEqual(storage.governanceAddress, alice.pkh);
                    }
                }
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%updateContractMetadata", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Update version of the doorman contract", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                const initMetadata          = await doormanStorage.metadata.get("data");
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Update metadata";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                const newMetadata           = Buffer.from(
                    JSON.stringify({
                    name: 'MAVRYK Doorman Contract',
                    version: 'v1.0.1',
                    authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
                    source: {
                        tools: ['Ligo', 'Flextesa'],
                        location: 'https://ligolang.org/',
                    },
                    }),
                    'ascii',
                ).toString('hex')

                // Set a contract governance compiled params
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'updateContractMetadata',
                    doormanAddress.address,
                    "data",
                    newMetadata
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
                    console.log('packed %updateContractMetadata param: ' + packedParam);
                } else {
                    throw `packing failed`
                };

                const proposalMetadata      = MichelsonMap.fromLiteral({
                    "Metadata#1": packedParam
                });

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);
                const endMetadata           = await doormanStorage.metadata.get("data");

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notStrictEqual(endMetadata, initMetadata);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%updateContractWhitelistMap", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Add a new address to the delegation contract whitelist map", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                delegationStorage           = await delegationInstance.storage();
                const initWhitelist         = delegationStorage.whitelistContracts;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Update whitelist";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Update whitelist map compiled params
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'updateContractWhitelistMap',
                    delegationAddress.address,
                    "bob",
                    bob.pkh
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
                    console.log('packed %updateContractWhitelistMap param: ' + packedParam);
                } else {
                    throw `packing failed`
                };

                const proposalMetadata      = MichelsonMap.fromLiteral({
                    "Whitelist#1": packedParam
                });

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                delegationStorage           = await delegationInstance.storage();
                const endWhitelist          = delegationStorage.whitelistContracts;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notStrictEqual(endWhitelist.size, initWhitelist.size);
                assert.strictEqual(endWhitelist.get("bob"), bob.pkh);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%updateContractGeneralMap", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Add a new address to the delegation contract whitelist map", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                delegationStorage           = await delegationInstance.storage();
                const initGeneral           = delegationStorage.generalContracts;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Update general";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Update general map compiled params
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'updateContractGeneralMap',
                    delegationAddress.address,
                    "bob",
                    bob.pkh
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
                    console.log('packed %updateContractGeneralMap param: ' + packedParam);
                } else {
                    throw `packing failed`
                };

                const proposalMetadata      = MichelsonMap.fromLiteral({
                    "General#1": packedParam
                });

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                delegationStorage           = await delegationInstance.storage();
                const endGeneral            = delegationStorage.generalContracts;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notStrictEqual(endGeneral.size, initGeneral.size);
                assert.strictEqual(endGeneral.get("bob"), bob.pkh);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%updateContractWhitelistTokenMap", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Add a new token to the treasury factory contract whitelist tokens map", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
                const initWhitelist         = await treasuryFactoryStorage.whitelistTokenContracts;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Update whitelist tokens";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Update general map compiled params
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'updateContractWhitelistTokenMap',
                    treasuryFactoryAddress.address,
                    "bob",
                    bob.pkh
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
                    console.log('packed %updateContractWhitelistTokenMap param: ' + packedParam);
                } else {
                    throw `packing failed`
                };

                const proposalMetadata      = MichelsonMap.fromLiteral({
                    "Whitelist#1": packedParam
                });

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
                const endWhitelist          = await treasuryFactoryStorage.whitelistTokenContracts;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notStrictEqual(endWhitelist.size, initWhitelist.size);
                assert.strictEqual(endWhitelist.get("bob"), bob.pkh);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%updateWhitelistDevelopersSet", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Add a new developer to the governance developers set", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                const initWhitelist         = governanceStorage.whitelistDevelopers;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Update whitelist developers";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Update general map compiled params
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'updateWhitelistDevelopersSet',
                    trudy.pkh
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
                    console.log('packed %updateContractWhitelistTokenMap param: ' + packedParam);
                } else {
                    throw `packing failed`
                };

                const proposalMetadata      = MichelsonMap.fromLiteral({
                    "Whitelist#1": packedParam
                });

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                delegationStorage           = await delegationInstance.storage();
                const endWhitelist          = governanceStorage.whitelistDevelopers;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notStrictEqual(endWhitelist.length, initWhitelist.length);
                assert.equal(endWhitelist.includes(trudy.pkh), true);
                assert.equal(initWhitelist.includes(trudy.pkh), false);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%updateGovernanceConfig", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Update the governance successReward", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                const initSuccessReward     = governanceStorage.config.successReward;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Update successReward";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Update general map compiled params
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'updateGovernanceConfig',
                    MVK(10),
                    'configSuccessReward'
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
                    console.log('packed %updateGovernanceConfig param: ' + packedParam);
                } else {
                    throw `packing failed`
                };

                const proposalMetadata      = MichelsonMap.fromLiteral({
                    "SuccessReward#1": packedParam
                });

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                const endSuccessReward      = governanceStorage.config.successReward;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endSuccessReward, initSuccessReward);
                assert.equal(endSuccessReward, MVK(10));
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%updateDelegationConfig", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Update the delegation maxSatellites", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                delegationStorage           = await delegationInstance.storage();
                const initSatellites        = delegationStorage.config.maxSatellites;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Update maxSatellites";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Update general map compiled params
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'updateDelegationConfig',
                    1234,
                    'configMaxSatellites'
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
                    console.log('packed %updateDelegationConfig param: ' + packedParam);
                } else {
                    throw `packing failed`
                };

                const proposalMetadata      = MichelsonMap.fromLiteral({
                    "MaxSatellites#1": packedParam
                });

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                delegationStorage           = await delegationInstance.storage();
                const endSatellites         = delegationStorage.config.maxSatellites;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endSatellites, initSatellites);
                assert.equal(endSatellites, 1234);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%updateBreakGlassConfig", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Update the break glass actionExpiryDays", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                breakGlassStorage           = await breakGlassInstance.storage();
                const initExpiry            = breakGlassStorage.config.actionExpiryDays;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Update actionExpiryDays";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Update general map compiled params
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'updateBreakGlassConfig',
                    1234,
                    'configActionExpiryDays'
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
                    console.log('packed %updateBreakGlassConfig param: ' + packedParam);
                } else {
                    throw `packing failed`
                };

                const proposalMetadata      = MichelsonMap.fromLiteral({
                    "ActionExpiryDays#1": packedParam
                });

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                breakGlassStorage           = await breakGlassInstance.storage();
                const endExpiry             = breakGlassStorage.config.actionExpiryDays;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endExpiry, initExpiry);
                assert.equal(endExpiry, 1234);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%updateEmergencyConfig", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Update the emergency governance voteExpiryDays", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                const initExpiry            = emergencyGovernanceStorage.config.voteExpiryDays;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Update voteExpiryDays";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Update general map compiled params
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'updateEmergencyConfig',
                    1234,
                    'configVoteExpiryDays'
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
                    console.log('packed %updateEmergencyConfig param: ' + packedParam);
                } else {
                    throw `packing failed`
                };

                const proposalMetadata      = MichelsonMap.fromLiteral({
                    "VoteExpiryDays#1": packedParam
                });

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                const endExpiry             = emergencyGovernanceStorage.config.voteExpiryDays;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endExpiry, initExpiry);
                assert.equal(endExpiry, 1234);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%updateCouncilConfig", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Update the council actionExpiryDays", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                councilStorage              = await councilInstance.storage();
                const initExpiry            = councilStorage.config.actionExpiryDays;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Update actionExpiryDays";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Update general map compiled params
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'updateCouncilConfig',
                    1234,
                    'configActionExpiryDays'
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
                    console.log('packed %updateCouncilConfig param: ' + packedParam);
                } else {
                    throw `packing failed`
                };

                const proposalMetadata      = MichelsonMap.fromLiteral({
                    "ActionExpiryDays#1": packedParam
                });

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                councilStorage              = await councilInstance.storage();
                const endExpiry             = councilStorage.config.actionExpiryDays;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endExpiry, initExpiry);
                assert.equal(endExpiry, 1234);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%updateDoormanMinMVKAmount", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Update the doorman minMvkAmount", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                doormanStorage              = await breakGlassInstance.storage();
                const initAmount            = doormanStorage.minMvkAmount;
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Update minMvkAmount";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                // Update general map compiled params
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'updateDoormanMinMvkAmount',
                    new BigNumber(MVK(0.01))
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
                    console.log('packed %updateDoormanMinMVKAmount param: ' + packedParam);
                } else {
                    throw `packing failed`
                };

                const proposalMetadata      = MichelsonMap.fromLiteral({
                    "MinMvkAmount#1": packedParam
                });

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                const endAmount             = doormanStorage.minMvkAmount;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endAmount, initAmount);
                assert.equal(endAmount.toNumber(), MVK(0.01));
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%updateFarmConfig", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Update a farm rewardPerBlock", async() => {
            try{
                // Initial values
                governanceStorage                           = await governanceInstance.storage();
                const aTrackedFarmInstance                  = await utils.tezos.contract.at(aTrackedFarm);
                var aTrackedFarmStorage: farmStorageType    = await aTrackedFarmInstance.storage();
                const initReward                            = aTrackedFarmStorage.config.plannedRewards.currentRewardPerBlock;
                const proposalId                            = governanceStorage.nextProposalId.toNumber();
                const proposalName                          = "Update rewardPerBlock";
                const proposalDesc                          = "Details about new proposal";
                const proposalIpfs                          = "ipfs://QM123456789";
                const proposalSourceCode                    = "Proposal Source Code";

                // Update general map compiled params
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'updateFarmConfig',
                    aTrackedFarm,
                    MVK(123),
                    'configRewardPerBlock'
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
                    console.log('packed %updateFarmConfig param: ' + packedParam);
                } else {
                    throw `packing failed`
                };

                const proposalMetadata      = MichelsonMap.fromLiteral({
                    "RewardPerBlock#1": packedParam
                });

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                aTrackedFarmStorage         = await aTrackedFarmInstance.storage();
                const endReward             = aTrackedFarmStorage.config.plannedRewards.currentRewardPerBlock;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endReward, initReward);
                assert.equal(endReward, MVK(123));
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%initFarm", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Initialize a farm", async() => {
            try{
                // Initial values
                governanceStorage                   = await governanceInstance.storage();
                farmStorage                         = await farmInstance.storage();
                const initConfig                    = farmStorage.config;
                const proposalId                    = governanceStorage.nextProposalId.toNumber();
                const proposalName                  = "Init a farm";
                const proposalDesc                  = "Details about new proposal";
                const proposalIpfs                  = "ipfs://QM123456789";
                const proposalSourceCode            = "Proposal Source Code";

                // Update general map compiled params
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'initFarm',
                    farmAddress.address,
                    100,
                    MVK(100),
                    2,
                    false,
                    false
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
                    console.log('packed %initFarm param: ' + packedParam);
                } else {
                    throw `packing failed`
                };

                const proposalMetadata      = MichelsonMap.fromLiteral({
                    "InitFarm#1": packedParam
                });

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                farmStorage                 = await farmInstance.storage();
                const endConfig             = farmStorage.config;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endConfig, initConfig);
                assert.equal(endConfig.plannedRewards.currentRewardPerBlock, MVK(100));
                assert.equal(endConfig.plannedRewards.totalBlocks, 100);
                assert.equal(endConfig.infinite, false);
                assert.equal(endConfig.blocksPerMinute, 2);
                assert.equal(endConfig.forceRewardFromTransfer, false);
                assert.equal(farmStorage.init, true);
                assert.equal(farmStorage.open, true);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%closeFarm", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Close a farm", async() => {
            try{
                // Initial values
                governanceStorage                   = await governanceInstance.storage();
                farmStorage                         = await farmInstance.storage();
                const initOpen                      = farmStorage.open;
                const proposalId                    = governanceStorage.nextProposalId.toNumber();
                const proposalName                  = "Close a farm";
                const proposalDesc                  = "Details about new proposal";
                const proposalIpfs                  = "ipfs://QM123456789";
                const proposalSourceCode            = "Proposal Source Code";

                // Update general map compiled params
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'closeFarm',
                    farmAddress.address
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
                    console.log('packed %closeFarm param: ' + packedParam);
                } else {
                    throw `packing failed`
                };

                const proposalMetadata      = MichelsonMap.fromLiteral({
                    "CloseFarm#1": packedParam
                });

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                farmStorage                 = await farmInstance.storage();
                const endOpen               = farmStorage.open;
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endOpen, initOpen);
                assert.equal(endOpen, false);
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%transferTreasury", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Transfer MVK from a treasury to a user address", async() => {
            try{
                // Initial values
                governanceStorage                   = await governanceInstance.storage();
                treasuryStorage                     = await treasuryInstance.storage();
                mvkTokenStorage                     = await mvkTokenInstance.storage();
                const initUserBalance               = await mvkTokenStorage.ledger.get(bob.pkh);
                const initTreasuryBalance           = await mvkTokenStorage.ledger.get(treasuryAddress.address);
                const proposalId                    = governanceStorage.nextProposalId.toNumber();
                const proposalName                  = "Transfer MVK";
                const proposalDesc                  = "Details about new proposal";
                const proposalIpfs                  = "ipfs://QM123456789";
                const proposalSourceCode            = "Proposal Source Code";

                // Update general map compiled params
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'transferTreasury',
                    treasuryAddress.address,
                    [
                        {
                            "to_"    : bob.pkh,
                            "token"  : {
                                "fa2" : {
                                    "tokenContractAddress" : mvkTokenAddress.address,
                                    "tokenId" : 0
                                }
                            },
                            "amount" : MVK(10)
                        }
                    ]
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
                    console.log('packed %transferTreasury param: ' + packedParam);
                } else {
                    throw `packing failed`
                };

                const proposalMetadata      = MichelsonMap.fromLiteral({
                    "TransferTreasury#1": packedParam
                });

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                treasuryStorage             = await treasuryInstance.storage();
                mvkTokenStorage             = await mvkTokenInstance.storage();
                const endUserBalance        = await mvkTokenStorage.ledger.get(bob.pkh);
                const endTreasuryBalance    = await mvkTokenStorage.ledger.get(treasuryAddress.address);
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endUserBalance.toNumber(), initUserBalance.toNumber());
                assert.notEqual(endTreasuryBalance.toNumber(), initTreasuryBalance.toNumber());
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%mintMvkAndTransferTreasury", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Mint and Transfer MVK from a treasury to a user address", async() => {
            try{
                // Initial values
                governanceStorage                   = await governanceInstance.storage();
                treasuryStorage                     = await treasuryInstance.storage();
                mvkTokenStorage                     = await mvkTokenInstance.storage();
                const initMVKTotalSupply            = mvkTokenStorage.totalSupply; 
                const initUserBalance               = await mvkTokenStorage.ledger.get(bob.pkh);
                const proposalId                    = governanceStorage.nextProposalId.toNumber();
                const proposalName                  = "Transfer MVK";
                const proposalDesc                  = "Details about new proposal";
                const proposalIpfs                  = "ipfs://QM123456789";
                const proposalSourceCode            = "Proposal Source Code";

                // Update general map compiled params
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'mintMvkAndTransferTreasury',
                    treasuryAddress.address,
                    bob.pkh,
                    MVK(100)
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
                    console.log('packed %mintMvkAndTransferTreasury param: ' + packedParam);
                } else {
                    throw `packing failed`
                };

                const proposalMetadata      = MichelsonMap.fromLiteral({
                    "MintMvkAndTransferTreasury#1": packedParam
                });

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                treasuryStorage             = await treasuryInstance.storage();
                mvkTokenStorage             = await mvkTokenInstance.storage();
                const endMVKTotalSupply     = mvkTokenStorage.totalSupply; 
                const endUserBalance        = await mvkTokenStorage.ledger.get(bob.pkh);
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.notEqual(endUserBalance.toNumber(), initUserBalance.toNumber());
                assert.equal(initUserBalance.toNumber() + MVK(100), endUserBalance.toNumber());
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%setContractLambda", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Update the unstake entrypoint of the doorman contract with a new exit fee calculation", async() => {
            try{
                // Initial values
                governanceStorage                   = await governanceInstance.storage();
                doormanStorage                      = await doormanInstance.storage();
                mvkTokenStorage                     = await mvkTokenInstance.storage();

                const firstUserMvkBalance           = await mvkTokenStorage.ledger.get(bob.pkh);
                const initMVKTotalSupply            = mvkTokenStorage.totalSupply.toNumber();
                const initSMVKTotalSupply           = doormanStorage.stakedMvkTotalSupply.toNumber();

                const proposalId                    = governanceStorage.nextProposalId.toNumber();
                const proposalName                  = "Update the unstake entrypoint of the doorman contract";
                const proposalDesc                  = "Details about new proposal";
                const proposalIpfs                  = "ipfs://QM123456789";
                const proposalSourceCode            = "Proposal Source Code";

                const unstakeAmount                 = MVK(50);

                // Unstake once to calculate an exit fee and compound with both users to set the new SMVK Total Supply amount
                var unstakeOperation    = await doormanInstance.methods.unstake(unstakeAmount).send()
                await unstakeOperation.confirmation();
                var compoundOperation   = await doormanInstance.methods.compound(bob.pkh).send()
                await compoundOperation.confirmation();
                compoundOperation   = await doormanInstance.methods.compound(alice.pkh).send()
                await compoundOperation.confirmation()

                // Refresh the values and calculate the exit fee
                mvkTokenStorage                             = await mvkTokenInstance.storage();
                doormanStorage                              = await doormanInstance.storage();
                const firstRefreshedSMVKTotalSupply         = doormanStorage.stakedMvkTotalSupply.toNumber();
                const firstRefreshedUserMvkBalance          = await mvkTokenStorage.ledger.get(bob.pkh);
                const firstExitFee                          = Math.abs(firstUserMvkBalance.toNumber() + unstakeAmount - firstRefreshedUserMvkBalance.toNumber())
                console.log("OLD UNSTAKE EXIT FEE: ", firstExitFee);
                console.log("INIT SMVK: ", initSMVKTotalSupply);
                console.log("NEW SMVK: ", firstRefreshedSMVKTotalSupply);

                // Stake MVK for later use (calculate next exit fee)
                const restakeAmount             = Math.abs(firstRefreshedSMVKTotalSupply - initSMVKTotalSupply);
                console.log("NEW STAKE AMOUNT: ", restakeAmount);

                var stakeOperation              = await doormanInstance.methods.stake(restakeAmount).send()
                await stakeOperation.confirmation();

                // Refreshed values
                mvkTokenStorage                             = await mvkTokenInstance.storage();
                doormanStorage                              = await doormanInstance.storage();
                const secondRefreshedMVKTotalSupply         = mvkTokenStorage.totalSupply.toNumber();
                const secondRefreshedSMVKTotalSupply        = doormanStorage.stakedMvkTotalSupply.toNumber();
                
                // Assertions
                assert.equal(initMVKTotalSupply, secondRefreshedMVKTotalSupply);
                assert.equal(initSMVKTotalSupply, secondRefreshedSMVKTotalSupply);

                // Update unstake lambda compiled params
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'setContractLambda',
                    doormanAddress.address,
                    'lambdaUnstake',
                    doormanLambdas[13]
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
                    console.log('packed %setContractLambda param: ' + packedParam);
                } else {
                    throw `packing failed`
                };

                const proposalMetadata      = MichelsonMap.fromLiteral({
                    "SetContractLambda#1": packedParam
                });

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                
                // Try the new unstake entrypoint with the updated exit fee reward calculation
                mvkTokenStorage                             = await mvkTokenInstance.storage();
                doormanStorage                              = await doormanInstance.storage();
                const preUnstakeUserMVKBalance              = await mvkTokenStorage.ledger.get(bob.pkh)

                var unstakeOperation    = await doormanInstance.methods.unstake(unstakeAmount).send()
                await unstakeOperation.confirmation();
                var compoundOperation   = await doormanInstance.methods.compound(bob.pkh).send()
                await compoundOperation.confirmation();
                compoundOperation   = await doormanInstance.methods.compound(alice.pkh).send()
                await compoundOperation.confirmation()

                // Refresh the values and calculate the exit fee
                mvkTokenStorage                             = await mvkTokenInstance.storage();
                doormanStorage                              = await doormanInstance.storage();
                const finalRefreshedUserMvkBalance          = await mvkTokenStorage.ledger.get(bob.pkh);
                const finalExitFee                          = Math.abs(preUnstakeUserMVKBalance.toNumber() + unstakeAmount - finalRefreshedUserMvkBalance.toNumber())
                console.log("FINAL EXIT FEE: ", finalExitFee)
                assert.notEqual(finalExitFee, firstExitFee)
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("%setFactoryProductLambda", async() => {
        beforeEach("Set signer to admin", async() => {
            await signerFactory(bob.sk)
        })

        it("Scenario - Use the deposit entrypoint of the farm contract as the withdraw entrypoint (set from the FarmFactory contract)", async() => {
            try{
                // Initial values
                governanceStorage                   = await governanceInstance.storage();
                farmFactoryStorage                  = await farmFactoryInstance.storage();
                const proposalId                    = governanceStorage.nextProposalId.toNumber();
                const proposalName                  = "Use the deposit entrypoint as the withdraw entrypoint";
                const proposalDesc                  = "Details about new proposal";
                const proposalIpfs                  = "ipfs://QM123456789";
                const proposalSourceCode            = "Proposal Source Code";

                // Update unstake lambda compiled params
                const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
                    'setFactoryProductLambda',
                    farmFactoryAddress.address,
                    'lambdaWithdraw',
                    farmFactoryStorage.farmLambdaLedger.get("lambdaDeposit")
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
                    console.log('packed %setFactoryProductLambda param: ' + packedParam);
                } else {
                    throw `packing failed`
                };

                const proposalMetadata      = MichelsonMap.fromLiteral({
                    "SetFactoryProductLambda#1": packedParam
                });

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();
                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(alice.sk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await signerFactory(bob.sk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(alice.sk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(bob.sk);

                // Execute proposal
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                farmFactoryStorage          = await farmFactoryInstance.storage();
                const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                // Assertions
                assert.strictEqual(proposal.executed, true);
                assert.equal(farmFactoryStorage.farmLambdaLedger.get("lambdaDeposit"), farmFactoryStorage.farmLambdaLedger.get("lambdaWithdraw"))
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })
});