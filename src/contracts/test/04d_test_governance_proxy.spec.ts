const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
const { InMemorySigner, importKey } = require("@taquito/signer");
import assert, { ok, rejects, strictEqual } from "assert";
import { Utils, MVK } from "./helpers/Utils";
import fs from "fs";
import { confirmOperation } from "../scripts/confirmation";

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
import { MichelsonMap } from "@taquito/taquito";

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

    // For testing purposes
    var aTrackedFarm;
    var aTrackedTreasury;
    
    const signerFactory = async (pk) => {
        await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
        return utils.tezos;
    };

    before("setup", async () => {

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
    });

    // describe("%createFarm", async() => {
    //     beforeEach("Set signer to admin", async() => {
    //         await signerFactory(bob.sk)
    //     })

    //     it("Scenario - Creation of a single farm", async() => {
    //         try{
    //             // Initial values
    //             governanceStorage           = await governanceInstance.storage();
    //             farmFactoryStorage          = await farmFactoryInstance.storage();
    //             const initTrackedFarms      = await farmFactoryStorage.trackedFarms;
    //             const proposalId            = governanceStorage.nextProposalId.toNumber();
    //             const proposalName          = "Create a farm";
    //             const proposalDesc          = "Details about new proposal";
    //             const proposalIpfs          = "ipfs://QM123456789";
    //             const proposalSourceCode    = "Proposal Source Code";

    //             const farmMetadataBase = Buffer.from(
    //                 JSON.stringify({
    //                 name: 'MAVRYK PLENTY-USDTz Farm',
    //                 description: 'MAVRYK Farm Contract',
    //                 version: 'v1.0.0',
    //                 liquidityPairToken: {
    //                     tokenAddress: ['KT18qSo4Ch2Mfq4jP3eME7SWHB8B8EDTtVBu'],
    //                     origin: ['Plenty'],
    //                     token0: {
    //                         symbol: ['PLENTY'],
    //                         tokenAddress: ['KT1GRSvLoikDsXujKgZPsGLX8k8VvR2Tq95b']
    //                     },
    //                     token1: {
    //                         symbol: ['USDtz'],
    //                         tokenAddress: ['KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9']
    //                     }
    //                 },
    //                 authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
    //                 }),
    //                 'ascii',
    //             ).toString('hex')

    //             // Create a farm compiled params
    //             const createFarmParams = governanceProxyInstance.methods.dataPackingHelper(
    //                 'createFarm',
    //                 false,
    //                 false,
    //                 12000,
    //                 100,
    //                 farmMetadataBase,
    //                 lpTokenAddress.address,
    //                 0,
    //                 "fa12",
    //             ).toTransferParams();
    //             const createFarmParamValue = createFarmParams.parameter.value;
    //             const callGovernanceLambdaEntrypointType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

    //             const createFarmPacked = await utils.tezos.rpc.packData({
    //                 data: createFarmParamValue,
    //                 type: callGovernanceLambdaEntrypointType
    //             }).catch(e => console.error('error:', e));

    //             var packedUpdateUpdateWhitelistDevelopersParam;
    //             if (createFarmPacked) {
    //                 packedUpdateUpdateWhitelistDevelopersParam = createFarmPacked.packed
    //                 console.log('packed %createFarm param: ' + packedUpdateUpdateWhitelistDevelopersParam);
    //             } else {
    //             throw `packing failed`
    //             };

    //             const proposalMetadata      = MichelsonMap.fromLiteral({
    //                 "FirstFarm#1": packedUpdateUpdateWhitelistDevelopersParam
    //             });

    //             // Start governance rounds
    //             var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
    //             await nextRoundOperation.confirmation();

    //             const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
    //             await proposeOperation.confirmation();
    //             const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
    //             await lockOperation.confirmation();
    //             var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
    //             await voteOperation.confirmation();
    //             await signerFactory(alice.sk);
    //             voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
    //             await voteOperation.confirmation();
    //             await signerFactory(bob.sk);
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
    //             await nextRoundOperation.confirmation();

    //             // Votes operation -> both satellites vote
    //             var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
    //             await votingRoundVoteOperation.confirmation();
    //             await signerFactory(alice.sk);
    //             votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
    //             await votingRoundVoteOperation.confirmation();
    //             await signerFactory(bob.sk);

    //             // Execute proposal
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
    //             await nextRoundOperation.confirmation();
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
    //             await nextRoundOperation.confirmation();

    //             // Final values
    //             governanceStorage           = await governanceInstance.storage();
    //             farmFactoryStorage          = await farmFactoryInstance.storage();
    //             const proposal              = await governanceStorage.proposalLedger.get(proposalId);
    //             const endTrackedFarms       = await farmFactoryStorage.trackedFarms;
                
    //             // Assertions
    //             console.log("TRACKED FARMS: ", endTrackedFarms);
    //             assert.strictEqual(proposal.executed, true);
    //             assert.notEqual(endTrackedFarms.length, initTrackedFarms.length);
    //             aTrackedFarm    = endTrackedFarms[0]
    //         } catch(e) {
    //             console.dir(e, {depth:5})
    //         }
    //     })

    //     it("Scenario - Creation of multiple farms (stress test)", async() => {
    //         try{
    //             // Initial values
    //             governanceStorage           = await governanceInstance.storage();
    //             farmFactoryStorage          = await farmFactoryInstance.storage();
    //             const initTrackedFarms      = await farmFactoryStorage.trackedFarms;
    //             const proposalId            = governanceStorage.nextProposalId.toNumber();
    //             const proposalName          = "Create multiple farms";
    //             const proposalDesc          = "Details about new proposal";
    //             const proposalIpfs          = "ipfs://QM123456789";
    //             const proposalSourceCode    = "Proposal Source Code";

    //             const farmMetadataBase = Buffer.from(
    //                 JSON.stringify({
    //                 name: 'MAVRYK PLENTY-USDTz Farm',
    //                 description: 'MAVRYK Farm Contract',
    //                 version: 'v1.0.0',
    //                 liquidityPairToken: {
    //                     tokenAddress: ['KT18qSo4Ch2Mfq4jP3eME7SWHB8B8EDTtVBu'],
    //                     origin: ['Plenty'],
    //                     token0: {
    //                         symbol: ['PLENTY'],
    //                         tokenAddress: ['KT1GRSvLoikDsXujKgZPsGLX8k8VvR2Tq95b']
    //                     },
    //                     token1: {
    //                         symbol: ['USDtz'],
    //                         tokenAddress: ['KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9']
    //                     }
    //                 },
    //                 authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
    //                 }),
    //                 'ascii',
    //             ).toString('hex')

    //             // Create a farm compiled params
    //             const createFarmParams = governanceProxyInstance.methods.dataPackingHelper(
    //                 'createFarm',
    //                 false,
    //                 false,
    //                 12000,
    //                 100,
    //                 farmMetadataBase,
    //                 lpTokenAddress.address,
    //                 0,
    //                 "fa12",
    //             ).toTransferParams();
    //             const createFarmParamValue = createFarmParams.parameter.value;
    //             const callGovernanceLambdaEntrypointType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

    //             const createFarmPacked = await utils.tezos.rpc.packData({
    //                 data: createFarmParamValue,
    //                 type: callGovernanceLambdaEntrypointType
    //             }).catch(e => console.error('error:', e));

    //             var packedUpdateUpdateWhitelistDevelopersParam;
    //             if (createFarmPacked) {
    //                 packedUpdateUpdateWhitelistDevelopersParam = createFarmPacked.packed
    //                 console.log('packed %createFarm param: ' + packedUpdateUpdateWhitelistDevelopersParam);
    //             } else {
    //             throw `packing failed`
    //             };

    //             const proposalMetadata      = MichelsonMap.fromLiteral({
    //                 "FirstFarm#1": packedUpdateUpdateWhitelistDevelopersParam,
    //                 "FirstFarm#2": packedUpdateUpdateWhitelistDevelopersParam,
    //                 "FirstFarm#3": packedUpdateUpdateWhitelistDevelopersParam,
    //                 "FirstFarm#4": packedUpdateUpdateWhitelistDevelopersParam,
    //                 "FirstFarm#5": packedUpdateUpdateWhitelistDevelopersParam,
    //                 "FirstFarm#6": packedUpdateUpdateWhitelistDevelopersParam,
    //             });

    //             // Start governance rounds
    //             var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
    //             await nextRoundOperation.confirmation();

    //             const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
    //             await proposeOperation.confirmation();
    //             const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
    //             await lockOperation.confirmation();
    //             var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
    //             await voteOperation.confirmation();
    //             await signerFactory(alice.sk);
    //             voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
    //             await voteOperation.confirmation();
    //             await signerFactory(bob.sk);
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
    //             await nextRoundOperation.confirmation();

    //             // Votes operation -> both satellites vote
    //             var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
    //             await votingRoundVoteOperation.confirmation();
    //             await signerFactory(alice.sk);
    //             votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
    //             await votingRoundVoteOperation.confirmation();
    //             await signerFactory(bob.sk);

    //             // Execute proposal
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
    //             await nextRoundOperation.confirmation();

    //             const nextRoundParam        = await governanceInstance.methods.startNextRound(true).toTransferParams();
    //             const estimate              = await utils.tezos.estimate.transfer(nextRoundParam);
    //             console.log("ESTIMATION: ", estimate)

    //             nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
    //             await nextRoundOperation.confirmation();

    //             // Final values
    //             governanceStorage           = await governanceInstance.storage();
    //             farmFactoryStorage          = await farmFactoryInstance.storage();
    //             const proposal              = await governanceStorage.proposalLedger.get(proposalId);
    //             const endTrackedFarms       = await farmFactoryStorage.trackedFarms;

    //             // Assertions
    //             console.log("TRACKED FARMS: ", endTrackedFarms);
    //             assert.strictEqual(proposal.executed, true);
    //             assert.notEqual(endTrackedFarms.length, initTrackedFarms.length);
    //         } catch(e) {
    //             console.dir(e, {depth:5})
    //         }
    //     })
    // })

    // describe("%untrackFarm", async() => {
    //     beforeEach("Set signer to admin", async() => {
    //         await signerFactory(bob.sk)
    //     })

    //     it("Scenario - Untrack a previously created farm", async() => {
    //         try{
    //             // Initial values
    //             governanceStorage           = await governanceInstance.storage();
    //             farmFactoryStorage          = await farmFactoryInstance.storage();
    //             const initTrackedFarms      = await farmFactoryStorage.trackedFarms;
    //             const proposalId            = governanceStorage.nextProposalId.toNumber();
    //             const proposalName          = "Untrack a farm";
    //             const proposalDesc          = "Details about new proposal";
    //             const proposalIpfs          = "ipfs://QM123456789";
    //             const proposalSourceCode    = "Proposal Source Code";
                
    //             console.log("INIT TRACKED FARMS: ", initTrackedFarms);
    //             console.log(initTrackedFarms.length)

    //             // Untrack a farm compiled params
    //             const untrackFarmParams = governanceProxyInstance.methods.dataPackingHelper(
    //                 'untrackFarm',
    //                 aTrackedFarm
    //             ).toTransferParams();
    //             const untrackFarmParamValue = untrackFarmParams.parameter.value;
    //             const callGovernanceLambdaEntrypointType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

    //             const untrackFarmPacked = await utils.tezos.rpc.packData({
    //                 data: untrackFarmParamValue,
    //                 type: callGovernanceLambdaEntrypointType
    //             }).catch(e => console.error('error:', e));

    //             var packedUpdateUpdateWhitelistDevelopersParam;
    //             if (untrackFarmPacked) {
    //                 packedUpdateUpdateWhitelistDevelopersParam = untrackFarmPacked.packed
    //                 console.log('packed %untrackFarm param: ' + packedUpdateUpdateWhitelistDevelopersParam);
    //             } else {
    //             throw `packing failed`
    //             };

    //             const proposalMetadata      = MichelsonMap.fromLiteral({
    //                 "Untrack#1": packedUpdateUpdateWhitelistDevelopersParam
    //             });

    //             // Start governance rounds
    //             var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
    //             await nextRoundOperation.confirmation();

    //             const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
    //             await proposeOperation.confirmation();
    //             const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
    //             await lockOperation.confirmation();
    //             var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
    //             await voteOperation.confirmation();
    //             await signerFactory(alice.sk);
    //             voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
    //             await voteOperation.confirmation();
    //             await signerFactory(bob.sk);
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
    //             await nextRoundOperation.confirmation();

    //             // Votes operation -> both satellites vote
    //             var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
    //             await votingRoundVoteOperation.confirmation();
    //             await signerFactory(alice.sk);
    //             votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
    //             await votingRoundVoteOperation.confirmation();
    //             await signerFactory(bob.sk);

    //             // Execute proposal
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
    //             await nextRoundOperation.confirmation();
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
    //             await nextRoundOperation.confirmation();

    //             // Final values
    //             governanceStorage           = await governanceInstance.storage();
    //             farmFactoryStorage          = await farmFactoryInstance.storage();
    //             const proposal              = await governanceStorage.proposalLedger.get(proposalId);
    //             const endTrackedFarms       = await farmFactoryStorage.trackedFarms;
                
    //             // Assertions
    //             console.log("TRACKED FARMS: ", endTrackedFarms);
    //             console.log(endTrackedFarms.length)
    //             assert.strictEqual(proposal.executed, true);
    //             assert.notEqual(endTrackedFarms.length, initTrackedFarms.length);
    //             assert.equal(endTrackedFarms.includes(aTrackedFarm), false);
    //         } catch(e) {
    //             console.dir(e, {depth:5})
    //         }
    //     })
    // })

    // describe("%trackFarm", async() => {
    //     beforeEach("Set signer to admin", async() => {
    //         await signerFactory(bob.sk)
    //     })

    //     it("Scenario - Track the previously untracked farm", async() => {
    //         try{
    //             // Initial values
    //             governanceStorage           = await governanceInstance.storage();
    //             farmFactoryStorage          = await farmFactoryInstance.storage();
    //             const initTrackedFarms      = await farmFactoryStorage.trackedFarms;
    //             const proposalId            = governanceStorage.nextProposalId.toNumber();
    //             const proposalName          = "Track a farm";
    //             const proposalDesc          = "Details about new proposal";
    //             const proposalIpfs          = "ipfs://QM123456789";
    //             const proposalSourceCode    = "Proposal Source Code";

    //             // Untrack a farm compiled params
    //             const untrackFarmParams = governanceProxyInstance.methods.dataPackingHelper(
    //                 'trackFarm',
    //                 aTrackedFarm
    //             ).toTransferParams();
    //             const untrackFarmParamValue = untrackFarmParams.parameter.value;
    //             const callGovernanceLambdaEntrypointType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

    //             const untrackFarmPacked = await utils.tezos.rpc.packData({
    //                 data: untrackFarmParamValue,
    //                 type: callGovernanceLambdaEntrypointType
    //             }).catch(e => console.error('error:', e));

    //             var packedUpdateUpdateWhitelistDevelopersParam;
    //             if (untrackFarmPacked) {
    //                 packedUpdateUpdateWhitelistDevelopersParam = untrackFarmPacked.packed
    //                 console.log('packed %trackFarm param: ' + packedUpdateUpdateWhitelistDevelopersParam);
    //             } else {
    //                 throw `packing failed`
    //             };

    //             const proposalMetadata      = MichelsonMap.fromLiteral({
    //                 "Track#1": packedUpdateUpdateWhitelistDevelopersParam
    //             });

    //             // Start governance rounds
    //             var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
    //             await nextRoundOperation.confirmation();

    //             const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
    //             await proposeOperation.confirmation();
    //             const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
    //             await lockOperation.confirmation();
    //             var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
    //             await voteOperation.confirmation();
    //             await signerFactory(alice.sk);
    //             voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
    //             await voteOperation.confirmation();
    //             await signerFactory(bob.sk);
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
    //             await nextRoundOperation.confirmation();

    //             // Votes operation -> both satellites vote
    //             var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
    //             await votingRoundVoteOperation.confirmation();
    //             await signerFactory(alice.sk);
    //             votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
    //             await votingRoundVoteOperation.confirmation();
    //             await signerFactory(bob.sk);

    //             // Execute proposal
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
    //             await nextRoundOperation.confirmation();
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
    //             await nextRoundOperation.confirmation();

    //             // Final values
    //             governanceStorage           = await governanceInstance.storage();
    //             farmFactoryStorage          = await farmFactoryInstance.storage();
    //             const proposal              = await governanceStorage.proposalLedger.get(proposalId);
    //             const endTrackedFarms       = await farmFactoryStorage.trackedFarms;
                
    //             // Assertions
    //             console.log("TRACKED FARMS: ", endTrackedFarms);
    //             assert.strictEqual(proposal.executed, true);
    //             assert.notEqual(endTrackedFarms.length, initTrackedFarms.length);
    //             assert.equal(endTrackedFarms.includes(aTrackedFarm), true);
    //         } catch(e) {
    //             console.dir(e, {depth:5})
    //         }
    //     })
    // })

    // describe("%createTreasury", async() => {
    //     beforeEach("Set signer to admin", async() => {
    //         await signerFactory(bob.sk)
    //     })

    //     it("Scenario - Creation of a single treasury", async() => {
    //         try{
    //             // Initial values
    //             governanceStorage           = await governanceInstance.storage();
    //             treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
    //             const inittrackedTreasuries = await treasuryFactoryStorage.trackedTreasuries;
    //             const proposalId            = governanceStorage.nextProposalId.toNumber();
    //             const proposalName          = "Create a treasury";
    //             const proposalDesc          = "Details about new proposal";
    //             const proposalIpfs          = "ipfs://QM123456789";
    //             const proposalSourceCode    = "Proposal Source Code";

    //             const treasuryMetadataBase = Buffer.from(
    //             JSON.stringify({
    //                 name: 'MAVRYK PLENTY-USDTz Farm',
    //                 description: 'MAVRYK Farm Contract',
    //                 version: 'v1.0.0',
    //                 liquidityPairToken: {
    //                 tokenAddress: ['KT18qSo4Ch2Mfq4jP3eME7SWHB8B8EDTtVBu'],
    //                 origin: ['Plenty'],
    //                 token0: {
    //                     symbol: ['PLENTY'],
    //                     tokenAddress: ['KT1GRSvLoikDsXujKgZPsGLX8k8VvR2Tq95b']
    //                 },
    //                 token1: {
    //                     symbol: ['USDtz'],
    //                     tokenAddress: ['KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9']
    //                 }
    //                 },
    //                 authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
    //             }),
    //             'ascii',
    //             ).toString('hex')
                    
    //             // Create a farm compiled params
    //             const createTreasuryParams = governanceProxyInstance.methods.dataPackingHelper(
    //                 'createTreasury',
    //                 treasuryMetadataBase
    //             ).toTransferParams();
    //             const createTreasuryParamValue = createTreasuryParams.parameter.value;
    //             const callGovernanceLambdaEntrypointType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

    //             const createTreasuryPacked = await utils.tezos.rpc.packData({
    //                 data: createTreasuryParamValue,
    //                 type: callGovernanceLambdaEntrypointType
    //             }).catch(e => console.error('error:', e));

    //             var packedUpdateUpdateWhitelistDevelopersParam;
    //             if (createTreasuryPacked) {
    //                 packedUpdateUpdateWhitelistDevelopersParam = createTreasuryPacked.packed
    //                 console.log('packed %createTreasury param: ' + packedUpdateUpdateWhitelistDevelopersParam);
    //             } else {
    //             throw `packing failed`
    //             };

    //             const proposalMetadata      = MichelsonMap.fromLiteral({
    //                 "FirstTreasury#1": packedUpdateUpdateWhitelistDevelopersParam
    //             });

    //             // Start governance rounds
    //             var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
    //             await nextRoundOperation.confirmation();

    //             const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
    //             await proposeOperation.confirmation();
    //             const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
    //             await lockOperation.confirmation();
    //             var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
    //             await voteOperation.confirmation();
    //             await signerFactory(alice.sk);
    //             voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
    //             await voteOperation.confirmation();
    //             await signerFactory(bob.sk);
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
    //             await nextRoundOperation.confirmation();

    //             // Votes operation -> both satellites vote
    //             var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
    //             await votingRoundVoteOperation.confirmation();
    //             await signerFactory(alice.sk);
    //             votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
    //             await votingRoundVoteOperation.confirmation();
    //             await signerFactory(bob.sk);

    //             // Execute proposal
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
    //             await nextRoundOperation.confirmation();
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
    //             await nextRoundOperation.confirmation();

    //             // Final values
    //             governanceStorage           = await governanceInstance.storage();
    //             treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
    //             const proposal              = await governanceStorage.proposalLedger.get(proposalId);
    //             const endtrackedTreasuries  = await treasuryFactoryStorage.trackedTreasuries;
                
    //             // Assertions
    //             console.log("TRACKED TREASURIES: ", endtrackedTreasuries);
    //             assert.strictEqual(proposal.executed, true);
    //             assert.notEqual(endtrackedTreasuries.length, inittrackedTreasuries.length);
    //             aTrackedTreasury    = endtrackedTreasuries[0]
    //         } catch(e) {
    //             console.dir(e, {depth:5})
    //         }
    //     })

    //     it("Scenario - Creation of multiple treasuries", async() => {
    //         try{
    //             // Initial values
    //             governanceStorage           = await governanceInstance.storage();
    //             treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
    //             const inittrackedTreasuries = await treasuryFactoryStorage.trackedTreasuries;
    //             const proposalId            = governanceStorage.nextProposalId.toNumber();
    //             const proposalName          = "Create a treasury";
    //             const proposalDesc          = "Details about new proposal";
    //             const proposalIpfs          = "ipfs://QM123456789";
    //             const proposalSourceCode    = "Proposal Source Code";

    //             const treasuryMetadataBase = Buffer.from(
    //             JSON.stringify({
    //                 name: 'MAVRYK PLENTY-USDTz Farm',
    //                 description: 'MAVRYK Farm Contract',
    //                 version: 'v1.0.0',
    //                 liquidityPairToken: {
    //                 tokenAddress: ['KT18qSo4Ch2Mfq4jP3eME7SWHB8B8EDTtVBu'],
    //                 origin: ['Plenty'],
    //                 token0: {
    //                     symbol: ['PLENTY'],
    //                     tokenAddress: ['KT1GRSvLoikDsXujKgZPsGLX8k8VvR2Tq95b']
    //                 },
    //                 token1: {
    //                     symbol: ['USDtz'],
    //                     tokenAddress: ['KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9']
    //                 }
    //                 },
    //                 authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
    //             }),
    //             'ascii',
    //             ).toString('hex')
                    
    //             // Create a farm compiled params
    //             const createTreasuryParams = governanceProxyInstance.methods.dataPackingHelper(
    //                 'createTreasury',
    //                 treasuryMetadataBase
    //             ).toTransferParams();
    //             const createTreasuryParamValue = createTreasuryParams.parameter.value;
    //             const callGovernanceLambdaEntrypointType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

    //             const createTreasuryPacked = await utils.tezos.rpc.packData({
    //                 data: createTreasuryParamValue,
    //                 type: callGovernanceLambdaEntrypointType
    //             }).catch(e => console.error('error:', e));

    //             var packedUpdateUpdateWhitelistDevelopersParam;
    //             if (createTreasuryPacked) {
    //                 packedUpdateUpdateWhitelistDevelopersParam = createTreasuryPacked.packed
    //                 console.log('packed %createTreasury param: ' + packedUpdateUpdateWhitelistDevelopersParam);
    //             } else {
    //             throw `packing failed`
    //             };

    //             const proposalMetadata      = MichelsonMap.fromLiteral({
    //                 "FirstTreasury#1": packedUpdateUpdateWhitelistDevelopersParam,
    //                 "FirstTreasury#2": packedUpdateUpdateWhitelistDevelopersParam,
    //                 "FirstTreasury#3": packedUpdateUpdateWhitelistDevelopersParam,
    //                 "FirstTreasury#4": packedUpdateUpdateWhitelistDevelopersParam,
    //                 "FirstTreasury#5": packedUpdateUpdateWhitelistDevelopersParam
    //             });

    //             // Start governance rounds
    //             var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
    //             await nextRoundOperation.confirmation();

    //             const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
    //             await proposeOperation.confirmation();
    //             const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
    //             await lockOperation.confirmation();
    //             var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
    //             await voteOperation.confirmation();
    //             await signerFactory(alice.sk);
    //             voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
    //             await voteOperation.confirmation();
    //             await signerFactory(bob.sk);
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
    //             await nextRoundOperation.confirmation();

    //             // Votes operation -> both satellites vote
    //             var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
    //             await votingRoundVoteOperation.confirmation();
    //             await signerFactory(alice.sk);
    //             votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
    //             await votingRoundVoteOperation.confirmation();
    //             await signerFactory(bob.sk);

    //             // Execute proposal
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
    //             await nextRoundOperation.confirmation();

    //             const nextRoundParam        = await governanceInstance.methods.startNextRound(true).toTransferParams();
    //             const estimate              = await utils.tezos.estimate.transfer(nextRoundParam);
    //             console.log("ESTIMATION: ", estimate)

    //             nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
    //             await nextRoundOperation.confirmation();

    //             // Final values
    //             governanceStorage           = await governanceInstance.storage();
    //             treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
    //             const proposal              = await governanceStorage.proposalLedger.get(proposalId);
    //             const endtrackedTreasuries  = await treasuryFactoryStorage.trackedTreasuries;
                
    //             // Assertions
    //             console.log("TRACKED TREASURIES: ", endtrackedTreasuries);
    //             assert.strictEqual(proposal.executed, true);
    //             assert.notEqual(endtrackedTreasuries.length, inittrackedTreasuries.length);
    //         } catch(e) {
    //             console.dir(e, {depth:5})
    //         }
    //     })
    // })

    // describe("%untrackTreasury", async() => {
    //     beforeEach("Set signer to admin", async() => {
    //         await signerFactory(bob.sk)
    //     })

    //     it("Scenario - Untrack a previously created treasury", async() => {
    //         try{
    //             // Initial values
    //             governanceStorage           = await governanceInstance.storage();
    //             treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
    //             const inittrackedTreasuries = await treasuryFactoryStorage.trackedTreasuries;
    //             const proposalId            = governanceStorage.nextProposalId.toNumber();
    //             const proposalName          = "Untrack a farm";
    //             const proposalDesc          = "Details about new proposal";
    //             const proposalIpfs          = "ipfs://QM123456789";
    //             const proposalSourceCode    = "Proposal Source Code";
                
    //             console.log("INIT TRACKED TREASURIES: ", inittrackedTreasuries);
    //             console.log(inittrackedTreasuries.length)

    //             // Untrack a farm compiled params
    //             const untrackTreasuryParams = governanceProxyInstance.methods.dataPackingHelper(
    //                 'untrackTreasury',
    //                 aTrackedTreasury
    //             ).toTransferParams();
    //             const untrackTreasuryParamValue = untrackTreasuryParams.parameter.value;
    //             const callGovernanceLambdaEntrypointType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

    //             const untrackTreasuryPacked = await utils.tezos.rpc.packData({
    //                 data: untrackTreasuryParamValue,
    //                 type: callGovernanceLambdaEntrypointType
    //             }).catch(e => console.error('error:', e));

    //             var packedUpdateUpdateWhitelistDevelopersParam;
    //             if (untrackTreasuryPacked) {
    //                 packedUpdateUpdateWhitelistDevelopersParam = untrackTreasuryPacked.packed
    //                 console.log('packed %untrackFarm param: ' + packedUpdateUpdateWhitelistDevelopersParam);
    //             } else {
    //             throw `packing failed`
    //             };

    //             const proposalMetadata      = MichelsonMap.fromLiteral({
    //                 "Untrack#1": packedUpdateUpdateWhitelistDevelopersParam
    //             });

    //             // Start governance rounds
    //             var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
    //             await nextRoundOperation.confirmation();

    //             const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
    //             await proposeOperation.confirmation();
    //             const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
    //             await lockOperation.confirmation();
    //             var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
    //             await voteOperation.confirmation();
    //             await signerFactory(alice.sk);
    //             voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
    //             await voteOperation.confirmation();
    //             await signerFactory(bob.sk);
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
    //             await nextRoundOperation.confirmation();

    //             // Votes operation -> both satellites vote
    //             var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
    //             await votingRoundVoteOperation.confirmation();
    //             await signerFactory(alice.sk);
    //             votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
    //             await votingRoundVoteOperation.confirmation();
    //             await signerFactory(bob.sk);

    //             // Execute proposal
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
    //             await nextRoundOperation.confirmation();
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
    //             await nextRoundOperation.confirmation();

    //             // Final values
    //             governanceStorage           = await governanceInstance.storage();
    //             treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
    //             const proposal              = await governanceStorage.proposalLedger.get(proposalId);
    //             const endtrackedTreasuries  = await treasuryFactoryStorage.trackedTreasuries;
                
    //             // Assertions
    //             console.log("TRACKED TREASURIES: ", endtrackedTreasuries);
    //             console.log(endtrackedTreasuries.length)
    //             assert.strictEqual(proposal.executed, true);
    //             assert.notEqual(endtrackedTreasuries.length, inittrackedTreasuries.length);
    //             assert.equal(endtrackedTreasuries.includes(aTrackedTreasury), false);
    //         } catch(e) {
    //             console.dir(e, {depth:5})
    //         }
    //     })
    // })

    // describe("%trackTreasury", async() => {
    //     beforeEach("Set signer to admin", async() => {
    //         await signerFactory(bob.sk)
    //     })

    //     it("Scenario - Track the previously untracked farm", async() => {
    //         try{
    //             // Initial values
    //             governanceStorage           = await governanceInstance.storage();
    //             treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
    //             const inittrackedTreasuries = await treasuryFactoryStorage.trackedTreasuries;
    //             const proposalId            = governanceStorage.nextProposalId.toNumber();
    //             const proposalName          = "Track a farm";
    //             const proposalDesc          = "Details about new proposal";
    //             const proposalIpfs          = "ipfs://QM123456789";
    //             const proposalSourceCode    = "Proposal Source Code";

    //             // Untrack a farm compiled params
    //             const untrackTreasuryParams = governanceProxyInstance.methods.dataPackingHelper(
    //                 'trackTreasury',
    //                 aTrackedTreasury
    //             ).toTransferParams();
    //             const untrackTreasuryParamValue = untrackTreasuryParams.parameter.value;
    //             const callGovernanceLambdaEntrypointType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

    //             const untrackTreasuryPacked = await utils.tezos.rpc.packData({
    //                 data: untrackTreasuryParamValue,
    //                 type: callGovernanceLambdaEntrypointType
    //             }).catch(e => console.error('error:', e));

    //             var packedUpdateUpdateWhitelistDevelopersParam;
    //             if (untrackTreasuryPacked) {
    //                 packedUpdateUpdateWhitelistDevelopersParam = untrackTreasuryPacked.packed
    //                 console.log('packed %trackFarm param: ' + packedUpdateUpdateWhitelistDevelopersParam);
    //             } else {
    //                 throw `packing failed`
    //             };

    //             const proposalMetadata      = MichelsonMap.fromLiteral({
    //                 "Track#1": packedUpdateUpdateWhitelistDevelopersParam
    //             });

    //             // Start governance rounds
    //             var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
    //             await nextRoundOperation.confirmation();

    //             const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
    //             await proposeOperation.confirmation();
    //             const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
    //             await lockOperation.confirmation();
    //             var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
    //             await voteOperation.confirmation();
    //             await signerFactory(alice.sk);
    //             voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
    //             await voteOperation.confirmation();
    //             await signerFactory(bob.sk);
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
    //             await nextRoundOperation.confirmation();

    //             // Votes operation -> both satellites vote
    //             var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
    //             await votingRoundVoteOperation.confirmation();
    //             await signerFactory(alice.sk);
    //             votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
    //             await votingRoundVoteOperation.confirmation();
    //             await signerFactory(bob.sk);

    //             // Execute proposal
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
    //             await nextRoundOperation.confirmation();
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
    //             await nextRoundOperation.confirmation();

    //             // Final values
    //             governanceStorage           = await governanceInstance.storage();
    //             treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
    //             const proposal              = await governanceStorage.proposalLedger.get(proposalId);
    //             const endtrackedTreasuries  = await treasuryFactoryStorage.trackedTreasuries;
                
    //             // Assertions
    //             console.log("TRACKED TREASURIES: ", endtrackedTreasuries);
    //             assert.strictEqual(proposal.executed, true);
    //             assert.notEqual(endtrackedTreasuries.length, inittrackedTreasuries.length);
    //             assert.equal(endtrackedTreasuries.includes(aTrackedTreasury), true);
    //         } catch(e) {
    //             console.dir(e, {depth:5})
    //         }
    //     })
    // })

    // describe("%updateMvkInflationRate", async() => {
    //     beforeEach("Set signer to admin", async() => {
    //         await signerFactory(bob.sk)
    //     })

    //     it("Scenario - Update the Mvk Inflation rate", async() => {
    //         try{
    //             // Initial values
    //             governanceStorage           = await governanceInstance.storage();
    //             mvkTokenStorage             = await mvkTokenInstance.storage();
    //             const initMVKInflationRate  = mvkTokenStorage.inflationRate;
    //             const proposalId            = governanceStorage.nextProposalId.toNumber();
    //             const proposalName          = "Update MVK Inflation Rate";
    //             const proposalDesc          = "Details about new proposal";
    //             const proposalIpfs          = "ipfs://QM123456789";
    //             const proposalSourceCode    = "Proposal Source Code";

    //             // Untrack a farm compiled params
    //             const updateInflationParams = governanceProxyInstance.methods.dataPackingHelper(
    //                 'updateMvkInflationRate',
    //                 700
    //             ).toTransferParams();
    //             const updateInflationParamValue = updateInflationParams.parameter.value;
    //             const callGovernanceLambdaEntrypointType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

    //             const updateInflationPacked = await utils.tezos.rpc.packData({
    //                 data: updateInflationParamValue,
    //                 type: callGovernanceLambdaEntrypointType
    //             }).catch(e => console.error('error:', e));

    //             var packedUpdateUpdateWhitelistDevelopersParam;
    //             if (updateInflationPacked) {
    //                 packedUpdateUpdateWhitelistDevelopersParam = updateInflationPacked.packed
    //                 console.log('packed %updateMvkInflationRate param: ' + packedUpdateUpdateWhitelistDevelopersParam);
    //             } else {
    //                 throw `packing failed`
    //             };

    //             const proposalMetadata      = MichelsonMap.fromLiteral({
    //                 "Track#1": packedUpdateUpdateWhitelistDevelopersParam
    //             });

    //             // Start governance rounds
    //             var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
    //             await nextRoundOperation.confirmation();

    //             const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
    //             await proposeOperation.confirmation();
    //             const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
    //             await lockOperation.confirmation();
    //             var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
    //             await voteOperation.confirmation();
    //             await signerFactory(alice.sk);
    //             voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
    //             await voteOperation.confirmation();
    //             await signerFactory(bob.sk);
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
    //             await nextRoundOperation.confirmation();

    //             // Votes operation -> both satellites vote
    //             var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
    //             await votingRoundVoteOperation.confirmation();
    //             await signerFactory(alice.sk);
    //             votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
    //             await votingRoundVoteOperation.confirmation();
    //             await signerFactory(bob.sk);

    //             // Execute proposal
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
    //             await nextRoundOperation.confirmation();
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
    //             await nextRoundOperation.confirmation();

    //             // Final values
    //             governanceStorage           = await governanceInstance.storage();
    //             mvkTokenStorage             = await mvkTokenInstance.storage();
    //             const proposal              = await governanceStorage.proposalLedger.get(proposalId);
    //             const endMVKInflationRate   = mvkTokenStorage.inflationRate;
                
    //             // Assertions
    //             assert.strictEqual(proposal.executed, true);
    //             assert.notEqual(endMVKInflationRate, initMVKInflationRate);
    //             assert.equal(endMVKInflationRate, 700);
    //         } catch(e) {
    //             console.dir(e, {depth:5})
    //         }
    //     })
    // })

    // describe("%setContractAdmin", async() => {
    //     beforeEach("Set signer to admin", async() => {
    //         await signerFactory(bob.sk)
    //     })

    //     it("Scenario - Set a contract admin to another address", async() => {
    //         try{
    //             // Initial values
    //             governanceStorage           = await governanceInstance.storage();
    //             delegationStorage           = await delegationInstance.storage();
    //             const initAdmin             = delegationStorage.admin;
    //             const proposalId            = governanceStorage.nextProposalId.toNumber();
    //             const proposalName          = "Set contract";
    //             const proposalDesc          = "Details about new proposal";
    //             const proposalIpfs          = "ipfs://QM123456789";
    //             const proposalSourceCode    = "Proposal Source Code";

    //             // Set a contract admin compiled params
    //             const setAdminParams = governanceProxyInstance.methods.dataPackingHelper(
    //                 'setContractAdmin',
    //                 alice.pkh,
    //                 delegationAddress.address
    //             ).toTransferParams();
    //             const setAdminParamValue = setAdminParams.parameter.value;
    //             const callGovernanceLambdaEntrypointType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

    //             const setAdminPacked = await utils.tezos.rpc.packData({
    //                 data: setAdminParamValue,
    //                 type: callGovernanceLambdaEntrypointType
    //             }).catch(e => console.error('error:', e));

    //             var packedUpdateUpdateWhitelistDevelopersParam;
    //             if (setAdminPacked) {
    //                 packedUpdateUpdateWhitelistDevelopersParam = setAdminPacked.packed
    //                 console.log('packed %setContractAdmin param: ' + packedUpdateUpdateWhitelistDevelopersParam);
    //             } else {
    //                 throw `packing failed`
    //             };

    //             const proposalMetadata      = MichelsonMap.fromLiteral({
    //                 "SetAdmin#1": packedUpdateUpdateWhitelistDevelopersParam
    //             });

    //             //Start governance rounds
    //             var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
    //             await nextRoundOperation.confirmation();

    //             const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
    //             await proposeOperation.confirmation();
    //             const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
    //             await lockOperation.confirmation();
    //             var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
    //             await voteOperation.confirmation();
    //             await signerFactory(alice.sk);
    //             voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
    //             await voteOperation.confirmation();
    //             await signerFactory(bob.sk);
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
    //             await nextRoundOperation.confirmation();

    //             // Votes operation -> both satellites vote
    //             var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
    //             await votingRoundVoteOperation.confirmation();
    //             await signerFactory(alice.sk);
    //             votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
    //             await votingRoundVoteOperation.confirmation();
    //             await signerFactory(bob.sk);

    //             // Execute proposal
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
    //             await nextRoundOperation.confirmation();
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
    //             await nextRoundOperation.confirmation();

    //             // Final values
    //             governanceStorage           = await governanceInstance.storage();
    //             delegationStorage           = await delegationInstance.storage();
    //             const proposal              = await governanceStorage.proposalLedger.get(proposalId);
    //             const endAdmin              = delegationStorage.admin;
                
    //             // Assertions
    //             assert.strictEqual(proposal.executed, true);
    //             assert.notEqual(initAdmin, endAdmin);
    //             assert.equal(endAdmin, alice.pkh);
    //         } catch(e) {
    //             console.dir(e, {depth:5})
    //         }
    //     })
    // })

    // describe("%setContractGovernance", async() => {
    //     beforeEach("Set signer to admin", async() => {
    //         await signerFactory(bob.sk)
    //     })

    //     it("Scenario - Set all contracts governance to another address", async() => {
    //         try{
    //             // Initial values
    //             governanceStorage           = await governanceInstance.storage();
    //             governanceProxyStorage      = await governanceProxyInstance.storage();
    //             const generalContracts      = governanceStorage.generalContracts.entries();
    //             const proposalId            = governanceStorage.nextProposalId.toNumber();
    //             const proposalName          = "Set contract";
    //             const proposalDesc          = "Details about new proposal";
    //             const proposalIpfs          = "ipfs://QM123456789";
    //             const proposalSourceCode    = "Proposal Source Code";

    //             // Set a contract governance compiled params
    //             const proposalMetadata      = MichelsonMap.fromLiteral({});
    //             var generalCounter          = 0;
    //             for (let entry of generalContracts){
    //                 // Get contract storage
    //                 var contract        = await utils.tezos.contract.at(entry[1]);
    //                 var storage:any     = await contract.storage();

    //                 generalCounter++;
    //                 var entryName       = "Governance#"+generalCounter

    //                 // Check admin
    //                 if(storage.hasOwnProperty('governanceAddress')){
    //                     var setGovernanceParams = governanceProxyInstance.methods.dataPackingHelper(
    //                         'setContractGovernance',
    //                         entry[1],
    //                         alice.pkh,
    //                     ).toTransferParams();
    //                     var setGovernanceParamValue = setGovernanceParams.parameter.value;
    //                     var callGovernanceLambdaEntrypointType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
        
    //                     var setGovernancePacked = await utils.tezos.rpc.packData({
    //                         data: setGovernanceParamValue,
    //                         type: callGovernanceLambdaEntrypointType
    //                     }).catch(e => console.error('error:', e));
        
    //                     var packedUpdateUpdateWhitelistDevelopersParam;
    //                     if (setGovernancePacked) {
    //                         packedUpdateUpdateWhitelistDevelopersParam = setGovernancePacked.packed
    //                         console.log('packed %setContractGovernance param: ' + packedUpdateUpdateWhitelistDevelopersParam);
    //                     } else {
    //                         throw `packing failed`
    //                     };

    //                     // Add new setGovernance data
    //                     proposalMetadata.set(entryName, packedUpdateUpdateWhitelistDevelopersParam);
    //                 }
    //             }

    //             // Start governance rounds
    //             var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
    //             await nextRoundOperation.confirmation();

    //             const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
    //             await proposeOperation.confirmation();
    //             const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
    //             await lockOperation.confirmation();
    //             var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
    //             await voteOperation.confirmation();
    //             await signerFactory(alice.sk);
    //             voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
    //             await voteOperation.confirmation();
    //             await signerFactory(bob.sk);
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
    //             await nextRoundOperation.confirmation();

    //             // Votes operation -> both satellites vote
    //             var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
    //             await votingRoundVoteOperation.confirmation();
    //             await signerFactory(alice.sk);
    //             votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
    //             await votingRoundVoteOperation.confirmation();
    //             await signerFactory(bob.sk);

    //             // Execute proposal
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
    //             await nextRoundOperation.confirmation();
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
    //             await nextRoundOperation.confirmation();

    //             // Final values
    //             governanceStorage           = await governanceInstance.storage();
    //             const proposal              = await governanceStorage.proposalLedger.get(proposalId);
                
    //             // Assertions
    //             assert.strictEqual(proposal.executed, true);
    //             for (let entry of generalContracts){
    //                 // Get contract storage
    //                 var contract        = await utils.tezos.contract.at(entry[1]);
    //                 var storage:any     = await contract.storage();

    //                 // Check admin
    //                 if(storage.hasOwnProperty('governanceAddress')){
    //                     assert.strictEqual(storage.governanceAddress, alice.pkh);
    //                 }
    //             }
    //         } catch(e) {
    //             console.dir(e, {depth:5})
    //         }
    //     })
    // })

    // describe("%updateContractMetadata", async() => {
    //     beforeEach("Set signer to admin", async() => {
    //         await signerFactory(bob.sk)
    //     })

    //     it("Scenario - Update version of the doorman contract", async() => {
    //         try{
    //             // Initial values
    //             governanceStorage           = await governanceInstance.storage();
    //             doormanStorage              = await doormanInstance.storage();
    //             const initMetadata          = await doormanStorage.metadata.get("data");
    //             const proposalId            = governanceStorage.nextProposalId.toNumber();
    //             const proposalName          = "Update metadata";
    //             const proposalDesc          = "Details about new proposal";
    //             const proposalIpfs          = "ipfs://QM123456789";
    //             const proposalSourceCode    = "Proposal Source Code";

    //             const newMetadata           = Buffer.from(
    //                 JSON.stringify({
    //                 name: 'MAVRYK Doorman Contract',
    //                 version: 'v1.0.1',
    //                 authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
    //                 source: {
    //                     tools: ['Ligo', 'Flextesa'],
    //                     location: 'https://ligolang.org/',
    //                 },
    //                 }),
    //                 'ascii',
    //             ).toString('hex')

    //             // Set a contract governance compiled params
    //             const updateMetadataParams = governanceProxyInstance.methods.dataPackingHelper(
    //                 'updateContractMetadata',
    //                 doormanAddress.address,
    //                 "data",
    //                 newMetadata
    //             ).toTransferParams();
    //             const updateMetadataParamValue = updateMetadataParams.parameter.value;
    //             const callGovernanceLambdaEntrypointType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

    //             const updateMetadataPacked = await utils.tezos.rpc.packData({
    //                 data: updateMetadataParamValue,
    //                 type: callGovernanceLambdaEntrypointType
    //             }).catch(e => console.error('error:', e));

    //             var packedUpdateUpdateWhitelistDevelopersParam;
    //             if (updateMetadataPacked) {
    //                 packedUpdateUpdateWhitelistDevelopersParam = updateMetadataPacked.packed
    //                 console.log('packed %updateContractMetadata param: ' + packedUpdateUpdateWhitelistDevelopersParam);
    //             } else {
    //                 throw `packing failed`
    //             };

    //             const proposalMetadata      = MichelsonMap.fromLiteral({
    //                 "Metadata#1": packedUpdateUpdateWhitelistDevelopersParam
    //             });

    //             // Start governance rounds
    //             var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
    //             await nextRoundOperation.confirmation();

    //             const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
    //             await proposeOperation.confirmation();
    //             const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
    //             await lockOperation.confirmation();
    //             var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
    //             await voteOperation.confirmation();
    //             await signerFactory(alice.sk);
    //             voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
    //             await voteOperation.confirmation();
    //             await signerFactory(bob.sk);
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
    //             await nextRoundOperation.confirmation();

    //             // Votes operation -> both satellites vote
    //             var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
    //             await votingRoundVoteOperation.confirmation();
    //             await signerFactory(alice.sk);
    //             votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
    //             await votingRoundVoteOperation.confirmation();
    //             await signerFactory(bob.sk);

    //             // Execute proposal
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
    //             await nextRoundOperation.confirmation();
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
    //             await nextRoundOperation.confirmation();

    //             // Final values
    //             governanceStorage           = await governanceInstance.storage();
    //             doormanStorage              = await doormanInstance.storage();
    //             const proposal              = await governanceStorage.proposalLedger.get(proposalId);
    //             const endMetadata           = await doormanStorage.metadata.get("data");

    //             // Assertions
    //             assert.strictEqual(proposal.executed, true);
    //             assert.notStrictEqual(endMetadata, initMetadata);
    //         } catch(e) {
    //             console.dir(e, {depth:5})
    //         }
    //     })
    // })

    // describe("%updateContractWhitelistMap", async() => {
    //     beforeEach("Set signer to admin", async() => {
    //         await signerFactory(bob.sk)
    //     })

    //     it("Scenario - Add a new address to the delegation contract whitelist map", async() => {
    //         try{
    //             // Initial values
    //             governanceStorage           = await governanceInstance.storage();
    //             delegationStorage           = await delegationInstance.storage();
    //             const initWhitelist         = delegationStorage.whitelistContracts;
    //             const proposalId            = governanceStorage.nextProposalId.toNumber();
    //             const proposalName          = "Update whitelist";
    //             const proposalDesc          = "Details about new proposal";
    //             const proposalIpfs          = "ipfs://QM123456789";
    //             const proposalSourceCode    = "Proposal Source Code";

    //             // Update whitelist map compiled params
    //             const updateWhitelistParams = governanceProxyInstance.methods.dataPackingHelper(
    //                 'updateContractWhitelistMap',
    //                 delegationAddress.address,
    //                 "bob",
    //                 bob.pkh
    //             ).toTransferParams();
    //             const updateWhitelistParamValue = updateWhitelistParams.parameter.value;
    //             const callGovernanceLambdaEntrypointType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

    //             const updateWhitelistPacked = await utils.tezos.rpc.packData({
    //                 data: updateWhitelistParamValue,
    //                 type: callGovernanceLambdaEntrypointType
    //             }).catch(e => console.error('error:', e));

    //             var packedUpdateUpdateWhitelistDevelopersParam;
    //             if (updateWhitelistPacked) {
    //                 packedUpdateUpdateWhitelistDevelopersParam = updateWhitelistPacked.packed
    //                 console.log('packed %updateContractWhitelistMap param: ' + packedUpdateUpdateWhitelistDevelopersParam);
    //             } else {
    //                 throw `packing failed`
    //             };

    //             const proposalMetadata      = MichelsonMap.fromLiteral({
    //                 "Whitelist#1": packedUpdateUpdateWhitelistDevelopersParam
    //             });

    //             // Start governance rounds
    //             var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
    //             await nextRoundOperation.confirmation();

    //             const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
    //             await proposeOperation.confirmation();
    //             const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
    //             await lockOperation.confirmation();
    //             var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
    //             await voteOperation.confirmation();
    //             await signerFactory(alice.sk);
    //             voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
    //             await voteOperation.confirmation();
    //             await signerFactory(bob.sk);
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
    //             await nextRoundOperation.confirmation();

    //             // Votes operation -> both satellites vote
    //             var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
    //             await votingRoundVoteOperation.confirmation();
    //             await signerFactory(alice.sk);
    //             votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
    //             await votingRoundVoteOperation.confirmation();
    //             await signerFactory(bob.sk);

    //             // Execute proposal
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
    //             await nextRoundOperation.confirmation();
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
    //             await nextRoundOperation.confirmation();

    //             // Final values
    //             governanceStorage           = await governanceInstance.storage();
    //             delegationStorage           = await delegationInstance.storage();
    //             const endWhitelist          = delegationStorage.whitelistContracts;
    //             const proposal              = await governanceStorage.proposalLedger.get(proposalId);

    //             // Assertions
    //             assert.strictEqual(proposal.executed, true);
    //             assert.notStrictEqual(endWhitelist.size, initWhitelist.size);
    //             assert.strictEqual(endWhitelist.get("bob"), bob.pkh);
    //         } catch(e) {
    //             console.dir(e, {depth:5})
    //         }
    //     })
    // })

    // describe("%updateContractGeneralMap", async() => {
    //     beforeEach("Set signer to admin", async() => {
    //         await signerFactory(bob.sk)
    //     })

    //     it("Scenario - Add a new address to the delegation contract whitelist map", async() => {
    //         try{
    //             // Initial values
    //             governanceStorage           = await governanceInstance.storage();
    //             delegationStorage           = await delegationInstance.storage();
    //             const initGeneral           = delegationStorage.generalContracts;
    //             const proposalId            = governanceStorage.nextProposalId.toNumber();
    //             const proposalName          = "Update general";
    //             const proposalDesc          = "Details about new proposal";
    //             const proposalIpfs          = "ipfs://QM123456789";
    //             const proposalSourceCode    = "Proposal Source Code";

    //             // Update general map compiled params
    //             const updateGeneralParams = governanceProxyInstance.methods.dataPackingHelper(
    //                 'updateContractGeneralMap',
    //                 delegationAddress.address,
    //                 "bob",
    //                 bob.pkh
    //             ).toTransferParams();
    //             const updateGeneralParamValue = updateGeneralParams.parameter.value;
    //             const callGovernanceLambdaEntrypointType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

    //             const updateGeneralPacked = await utils.tezos.rpc.packData({
    //                 data: updateGeneralParamValue,
    //                 type: callGovernanceLambdaEntrypointType
    //             }).catch(e => console.error('error:', e));

    //             var packedUpdateUpdateWhitelistDevelopersParam;
    //             if (updateGeneralPacked) {
    //                 packedUpdateUpdateWhitelistDevelopersParam = updateGeneralPacked.packed
    //                 console.log('packed %updateContractGeneralMap param: ' + packedUpdateUpdateWhitelistDevelopersParam);
    //             } else {
    //                 throw `packing failed`
    //             };

    //             const proposalMetadata      = MichelsonMap.fromLiteral({
    //                 "General#1": packedUpdateUpdateWhitelistDevelopersParam
    //             });

    //             // Start governance rounds
    //             var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
    //             await nextRoundOperation.confirmation();

    //             const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
    //             await proposeOperation.confirmation();
    //             const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
    //             await lockOperation.confirmation();
    //             var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
    //             await voteOperation.confirmation();
    //             await signerFactory(alice.sk);
    //             voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
    //             await voteOperation.confirmation();
    //             await signerFactory(bob.sk);
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
    //             await nextRoundOperation.confirmation();

    //             // Votes operation -> both satellites vote
    //             var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
    //             await votingRoundVoteOperation.confirmation();
    //             await signerFactory(alice.sk);
    //             votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
    //             await votingRoundVoteOperation.confirmation();
    //             await signerFactory(bob.sk);

    //             // Execute proposal
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
    //             await nextRoundOperation.confirmation();
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
    //             await nextRoundOperation.confirmation();

    //             // Final values
    //             governanceStorage           = await governanceInstance.storage();
    //             delegationStorage           = await delegationInstance.storage();
    //             const endGeneral            = delegationStorage.generalContracts;
    //             const proposal              = await governanceStorage.proposalLedger.get(proposalId);

    //             // Assertions
    //             assert.strictEqual(proposal.executed, true);
    //             assert.notStrictEqual(endGeneral.size, initGeneral.size);
    //             assert.strictEqual(endGeneral.get("bob"), bob.pkh);
    //         } catch(e) {
    //             console.dir(e, {depth:5})
    //         }
    //     })
    // })
});