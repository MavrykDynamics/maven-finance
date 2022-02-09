const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
const { InMemorySigner, importKey } = require("@taquito/signer");
import assert, { ok, rejects, strictEqual } from "assert";
import { Utils, zeroAddress } from "./helpers/Utils";
import fs from "fs";
import { confirmOperation } from "../scripts/confirmation";

const chai = require("chai");
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

import env from "../env";
import { alice, bob, eve, mallory } from "../scripts/sandbox/accounts";

import doormanAddress from '../deployments/doormanAddress.json';
import delegationAddress from '../deployments/delegationAddress.json';
import mvkTokenAddress from '../deployments/mvkTokenAddress.json';
import governanceAddress from '../deployments/governanceAddress.json';

// import governanceLambdaParamBytes from "../build/lambdas/governanceLambdaParametersBytes.json";
import { config } from "yargs";

describe("Governance tests", async () => {
    var utils: Utils;

    let doormanInstance;
    let delegationInstance;
    let mvkTokenInstance;
    let governanceInstance;

    let doormanStorage;
    let delegationStorage;
    let mvkTokenStorage;
    let governanceStorage;
    
    const signerFactory = async (pk) => {
        await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
        return utils.tezos;
    };

    const proposalId = 1;

    before("setup", async () => {

        utils = new Utils();
        await utils.init(alice.sk);
        
        doormanInstance    = await utils.tezos.contract.at(doormanAddress.address);
        delegationInstance = await utils.tezos.contract.at(delegationAddress.address);
        mvkTokenInstance   = await utils.tezos.contract.at(mvkTokenAddress.address);
        governanceInstance = await utils.tezos.contract.at(governanceAddress.address);
            
        doormanStorage    = await doormanInstance.storage();
        delegationStorage = await delegationInstance.storage();
        mvkTokenStorage   = await mvkTokenInstance.storage();
        governanceStorage = await governanceInstance.storage();

        console.log('-- -- -- -- -- Governance Tests -- -- -- --')
        console.log('Doorman Contract deployed at:', doormanInstance.address);
        console.log('Delegation Contract deployed at:', delegationInstance.address);
        console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
        console.log('Governance Contract deployed at:', governanceInstance.address);
        console.log('Alice address: ' + alice.pkh);
        console.log('Bob address: ' + bob.pkh);
        console.log('Eve address: ' + eve.pkh);

    });

    it('admin can start a new proposal round', async () => {
        try{        

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: Admin can start a new proposal round") 
            console.log("---") // break

            // console.log('storage: console log checks  ----');
            const beforeGovernanceStorage = await governanceInstance.storage();
            console.log("Before Test Block Level: " + beforeGovernanceStorage.tempFlag);

            await signerFactory(bob.sk);
            // Bob stakes 100 MVK tokens and registers as a satellite before the proposal round starts
            const bobStakeAmountOperation = await doormanInstance.methods.stake(100000000).send();
            await bobStakeAmountOperation.confirmation();                        
            const bobRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite("New Satellite by Bob", "New Satellite Description - Bob", "https://image.url", "700").send();
            await bobRegisterAsSatelliteOperation.confirmation();

            await signerFactory(alice.sk);

            // Alice stakes 100 MVK tokens and registers as a satellite before the proposal round starts
            const aliceStakeAmountOperation = await doormanInstance.methods.stake(100000000).send();
            await aliceStakeAmountOperation.confirmation();                        
            const aliceRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite("New Satellite by Alice", "New Satellite Description - Alice", "https://image.url", "700").send();
            await aliceRegisterAsSatelliteOperation.confirmation();

            // admin starts a new proposal round
            const adminStartsNewProposalRoundOperation = await governanceInstance.methods.startProposalRound().send();
            await adminStartsNewProposalRoundOperation.confirmation();

            // await governanceStorage;
            const newGovernanceStorage = await governanceInstance.storage();
            console.log("After Test Block Level: " + newGovernanceStorage.tempFlag);

            // check active satellites in console
            // const activeSatellitesMap = await newGovernanceStorage.activeSatellitesMap;
            // console.log(activeSatellitesMap);   

            // console.log("after: alice active satellite: ----")
            // const aliceActiveSatellite = await newGovernanceStorage.activeSatellitesMap.get(alice.pkh);
            // console.log(aliceActiveSatellite);

            // console.log(" --- --- --- ")

            console.log("after: alice active satellite snapshot: ----")
            const activeSatellitesMap    = await newGovernanceStorage.snapshotLedger;
            const aliceSatelliteSnapshot = await newGovernanceStorage.snapshotLedger.get(alice.pkh);
            
            // console.log(activeSatellitesMap);
            // console.log(aliceSatelliteSnapshot);
            
            // console.log(newGovernanceStorage);

        } catch(e){
            console.log(e);
        } 
    });

    it('alice can create a new proposal during the proposal round', async () => {
        try{        

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: alice can create a new proposal during the proposal round") 
            console.log("---") // break

            const beforeGovernanceStorage = await governanceInstance.storage();
            console.log("Before Test Block Level: " + beforeGovernanceStorage.tempFlag);

            // admin creates a new proposal
            const aliceCreatesNewProposalOperation = await governanceInstance.methods.propose("New Proposal #1", "Details about new proposal #1", "ipfs://hash").send();
            await aliceCreatesNewProposalOperation.confirmation();
            
            // console.log("after: console log checks  ----")
            const newGovernanceStorage = await governanceInstance.storage();
            console.log("After Test Block Level: " + newGovernanceStorage.tempFlag);

        } catch(e){
            console.log(e);
        } 
    });

    it('alice can add proposal data to her proposal during the proposal round', async () => {
        try{        

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: alice can add proposal data to her proposal during the proposal round") 
            console.log("---") // break

            const beforeGovernanceStorage = await governanceInstance.storage();
            console.log("Before Test Block Level: " + beforeGovernanceStorage.tempFlag);

            // config success reward
            const configSuccessRewardParam = governanceInstance.methods.callGovernanceLambdaProxy(
                'updateGovernanceConfig', 995, 'configSuccessReward'
            ).toTransferParams();
            const configSuccessRewardParamValue = configSuccessRewardParam.parameter.value;
            const callGovernanceLambdaEntrypointType = await governanceInstance.entrypoints.entrypoints.callGovernanceLambdaProxy;

            const updateConfigSuccessRewardPacked = await utils.tezos.rpc.packData({
                data: configSuccessRewardParamValue,
                type: callGovernanceLambdaEntrypointType
            }).catch(e => console.error('error:', e));

            var packedUpdateConfigSuccessRewardParam;
            if (updateConfigSuccessRewardPacked) {
                packedUpdateConfigSuccessRewardParam = updateConfigSuccessRewardPacked.packed
              console.log('packed success reward param: ' + packedUpdateConfigSuccessRewardParam);
            } else {
              throw `packing failed`
            };
            
            const aliceAddsConfigSuccessRewardDataOperation = await governanceInstance.methods.addUpdateProposalData(proposalId, "Update Governance Config - Success Reward to be 995n", packedUpdateConfigSuccessRewardParam).send();
            await aliceAddsConfigSuccessRewardDataOperation.confirmation();

            console.log('4b test governance');

            // config success reward
            const configMinQuorumMvkTotalParam = governanceInstance.methods.callGovernanceLambdaProxy(
                'updateGovernanceConfig', 42000, 'configMinQuorumMvkTotal'
            ).toTransferParams();
            const configMinQuorumMvkTotalParamValue = configMinQuorumMvkTotalParam.parameter.value;

            const updateConfigMinQuorumMvkTotalPacked = await utils.tezos.rpc.packData({
                data: configMinQuorumMvkTotalParamValue,
                type: callGovernanceLambdaEntrypointType
            }).catch(e => console.error('error:', e));

            var packedUpdateConfigMinQuorumMvkTotalParam;
            if (updateConfigMinQuorumMvkTotalPacked) {
                packedUpdateConfigMinQuorumMvkTotalParam = updateConfigMinQuorumMvkTotalPacked.packed
              console.log('packed min quorum mvk total param: ' + packedUpdateConfigMinQuorumMvkTotalParam);
            } else {
              throw `packing failed`
            };
            
            const aliceAddsConfigMinQUorumMvkTotalDataOperation = await governanceInstance.methods.addUpdateProposalData(proposalId, "Update Governance Config - Min Quorum MVk Total to be 42000n", packedUpdateConfigMinQuorumMvkTotalParam).send();
            await aliceAddsConfigMinQUorumMvkTotalDataOperation.confirmation();
            
            // console.log("after: console log checks  ----")
            const newGovernanceStorage = await governanceInstance.storage();
            console.log("After Test Block Level: " + newGovernanceStorage.tempFlag);
            
            // const proposalCheck = await newGovernanceStorage.proposalLedger.get(1);
            // console.log(proposalCheck);
            
        } catch(e){
            console.log(e);
        } 
    });

    it('alice and bob can vote for her proposal during the proposal round', async () => {
        try{        

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: alice and bob can vote for her proposal during the proposal round") 
            console.log("---") // break

            // console.log('storage: console log checks  ----');
            const beforeGovernanceStorage = await governanceInstance.storage();
            console.log("Before Test Block Level: " + beforeGovernanceStorage.tempFlag);

            await signerFactory(bob.sk)
            const bobVotesForHisProposalOperation = await governanceInstance.methods.proposalRoundVote(proposalId).send();
            await bobVotesForHisProposalOperation.confirmation();

            // alice votes for her proposal
            await signerFactory(alice.sk)
            const aliceVotesForHerProposalOperation = await governanceInstance.methods.proposalRoundVote(proposalId).send();
            await aliceVotesForHerProposalOperation.confirmation();

            // console.log("after: console log checks  ----")
            const newGovernanceStorage = await governanceInstance.storage();
            console.log("After Test Block Level: " + newGovernanceStorage.tempFlag);
            // console.log(newGovernanceStorage);
            const currentRoundProposals  = await newGovernanceStorage.currentRoundProposals;
            const currentRoundVotes      = await newGovernanceStorage.currentRoundVotes;
            const aliceProposal          = await newGovernanceStorage.proposalLedger.get(proposalId);
            const aliceProposalPassVotes = await aliceProposal.passVotersMap;

            // console.log(currentRoundProposals);
            // console.log(currentRoundVotes);
            // console.log(aliceProposal);
            // console.log(aliceProposalPassVotes);
            // console.log('end vote for proposal check')

        } catch(e){
            console.log(e);
        } 
    });

    it('admin can start a new voting round', async () => {
        try{        

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: Admin can start a new voting round") 
            console.log("---") // break

            // console.log('storage: console log checks  ----');
            const beforeGovernanceStorage = await governanceInstance.storage();
            // console.log("Before Test Block Level: " + beforeGovernanceStorage.tempFlag);

            await signerFactory(alice.sk);
            // admin starts a new voting round
            const adminStartsNewVotingRoundOperation = await governanceInstance.methods.startVotingRound().send();
            await adminStartsNewVotingRoundOperation.confirmation();

            // console.log("after: console log checks  ----")
            const newGovernanceStorage = await governanceInstance.storage();
            // console.log("After Test Block Level: " + newGovernanceStorage.tempFlag);

        } catch(e){
            console.log(e);
        } 
    });

    it('alice and bob can vote for her proposal during the voting round', async () => {
        try{        

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: alice and bob can vote for her proposal during the voting round") 
            console.log("---") // break

            // console.log('storage: console log checks  ----');
            const beforeGovernanceStorage = await governanceInstance.storage();
            console.log("Before Test Block Level: " + beforeGovernanceStorage.tempFlag);

            await signerFactory(alice.sk);
            const aliceVotingRoundVoteOperation = await governanceInstance.methods.votingRoundVote(proposalId, 1).send();
            await aliceVotingRoundVoteOperation.confirmation();

            await signerFactory(bob.sk)
            const bobVotingRoundVoteOperation = await governanceInstance.methods.votingRoundVote(proposalId, 1).send();
            await bobVotingRoundVoteOperation.confirmation();

            // console.log("after: console log checks  ----")
            const newGovernanceStorage = await governanceInstance.storage();
            console.log("After Test Block Level: " + newGovernanceStorage.tempFlag);
            
            // console.log(newGovernanceStorage);

        } catch(e){
            console.log(e);
        } 
    });

    it('alice can execute her proposal', async () => {
        try{        

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: alice can execute her proposal") 
            console.log("---") // break

            // console.log('storage: console log checks  ----');
            const beforeGovernanceStorage = await governanceInstance.storage();
            console.log("Before Test Block Level: ");            
            
            console.log('old config success reward: ' + beforeGovernanceStorage.config.successReward);
            console.log('old config min quorum mvk total reward: ' + beforeGovernanceStorage.config.minQuorumMvkTotal);

            // admin starts timelock round
            await signerFactory(alice.sk);
            const adminStartsTimelockRoundOperation = await governanceInstance.methods.startTimelockRound().send();
            await adminStartsTimelockRoundOperation.confirmation();

            // admin starts a new proposal round
            await signerFactory(alice.sk);
            const adminStartsNewProposalRoundOperation = await governanceInstance.methods.startProposalRound().send();
            await adminStartsNewProposalRoundOperation.confirmation();

            const aliceExecuteProposalOperation = await governanceInstance.methods.executeProposal(proposalId).send();
            await aliceExecuteProposalOperation.confirmation();

            // console.log("after: console log checks  ----")
            const newGovernanceStorage = await governanceInstance.storage();
            console.log("After Test Block Level: " + newGovernanceStorage.tempFlag);
            
            // console.log(newGovernanceStorage);
            console.log('new config success reward: ' + newGovernanceStorage.config.successReward);
            console.log('new config min quorum mvk total reward: ' + newGovernanceStorage.config.minQuorumMvkTotal);

        } catch(e){
            console.log(e);
        } 
    });

    it('admin submits 2nd proposal in 2nd proposal round', async () => {
        try{        

            console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
            console.log("Test: Admin submits 2nd proposal in 2nd proposal round") 
            console.log("---") // break

            const nextProposalId = 2;

            // console.log('storage: console log checks  ----');
            const beforeGovernanceStorage = await governanceInstance.storage();
            const beforeDelegationStorage = await delegationInstance.storage();
            console.log("Before Test Block Level: " + beforeGovernanceStorage.tempFlag);
            // console.log(beforeGovernanceStorage);
            console.log("Current Round:" +beforeGovernanceStorage.currentRound);

            console.log('old config delegation max satellites: ' + beforeDelegationStorage.config.maxSatellites);
            console.log('old config governance voting power ratio: ' + beforeGovernanceStorage.config.votingPowerRatio);
        
            // admin starts a new proposal round
            const aliceCreatesNewProposalOperation = await governanceInstance.methods.propose("New Proposal #2", "Details about new proposal #2", "ipfs://hash").send();
            await aliceCreatesNewProposalOperation.confirmation();

            // config delegation max satellite
            const configDelegationMaxSatellitesParam = governanceInstance.methods.callGovernanceLambdaProxy(
                'updateDelegationConfig', 555, 'configMaxSatellites'
            ).toTransferParams();
            const configDelegationMaxSatelliteParamValue = configDelegationMaxSatellitesParam.parameter.value;
            const callGovernanceLambdaEntrypointType = await governanceInstance.entrypoints.entrypoints.callGovernanceLambdaProxy;

            const updateConfigDelegationMaxSatellitePacked = await utils.tezos.rpc.packData({
                data: configDelegationMaxSatelliteParamValue,
                type: callGovernanceLambdaEntrypointType
            }).catch(e => console.error('error:', e));

            var packedUpdateConfigMaxSatelliteParam;
            if (updateConfigDelegationMaxSatellitePacked) {
                packedUpdateConfigMaxSatelliteParam = updateConfigDelegationMaxSatellitePacked.packed
                console.log('packed success reward param: ' + packedUpdateConfigMaxSatelliteParam);
            } else {
              throw `packing failed`
            };
            
            const aliceAddsConfigDelegationMaxSatelliteOperation = await governanceInstance.methods.addUpdateProposalData(nextProposalId, "Update Delegation Config - Max Satellites to 555", packedUpdateConfigMaxSatelliteParam).send();
            await aliceAddsConfigDelegationMaxSatelliteOperation.confirmation();

            // config success reward
            const configVotingPowerRatioParam = governanceInstance.methods.callGovernanceLambdaProxy(
                'updateGovernanceConfig', 25000, 'configVotingPowerRatio'
            ).toTransferParams();
            const configVotingPowerRatioParamValue = configVotingPowerRatioParam.parameter.value;

            const updateConfigVotingPowerRatioPacked = await utils.tezos.rpc.packData({
                data: configVotingPowerRatioParamValue,
                type: callGovernanceLambdaEntrypointType
            }).catch(e => console.error('error:', e));

            var packedUpdateConfigVotingPowerRatioParam;
            if (updateConfigVotingPowerRatioPacked) {
                packedUpdateConfigVotingPowerRatioParam = updateConfigVotingPowerRatioPacked.packed
              console.log('packed min quorum mvk total param: ' + packedUpdateConfigVotingPowerRatioParam);
            } else {
              throw `packing failed`
            };
            
            const aliceAddsConfigVotingPowerRatioDataOperation = await governanceInstance.methods.addUpdateProposalData(nextProposalId, "Update Governance Config - Voting Power Ratio to be 25000", packedUpdateConfigVotingPowerRatioParam).send();
            await aliceAddsConfigVotingPowerRatioDataOperation.confirmation();

            // proposal round: bob votes for proposal
            await signerFactory(bob.sk)
            const bobVotesForHisProposalOperation = await governanceInstance.methods.proposalRoundVote(nextProposalId).send();
            await bobVotesForHisProposalOperation.confirmation();

            // proposal round: alice votes for proposal
            await signerFactory(alice.sk)
            const aliceVotesForHerProposalOperation = await governanceInstance.methods.proposalRoundVote(nextProposalId).send();
            await aliceVotesForHerProposalOperation.confirmation();

            // admin starts a new voting round
            const adminStartsNewVotingRoundOperation = await governanceInstance.methods.startVotingRound().send();
            await adminStartsNewVotingRoundOperation.confirmation();

            console.log("==== Start Voting Round ===")
            const midGovernanceStorage = await governanceInstance.storage();
            console.log("Current Round:" +midGovernanceStorage.currentRound);

            // alice and bob votes for the second proposal 
            await signerFactory(alice.sk);
            const aliceVotingRoundVoteOperation = await governanceInstance.methods.votingRoundVote(nextProposalId, 1).send();
            await aliceVotingRoundVoteOperation.confirmation();

            await signerFactory(bob.sk)
            const bobVotingRoundVoteOperation = await governanceInstance.methods.votingRoundVote(nextProposalId, 1).send();
            await bobVotingRoundVoteOperation.confirmation();

            // admin starts timelock round
            await signerFactory(alice.sk);
            const adminStartsTimelockRoundOperation = await governanceInstance.methods.startTimelockRound().send();
            await adminStartsTimelockRoundOperation.confirmation();

            // admin starts a new proposal round - 3rd round
            await signerFactory(alice.sk);
            const adminStartsNewProposalRoundOperation = await governanceInstance.methods.startProposalRound().send();
            await adminStartsNewProposalRoundOperation.confirmation();

            // alice executes proposal 
            const aliceExecuteProposalOperation = await governanceInstance.methods.executeProposal(nextProposalId).send();
            await aliceExecuteProposalOperation.confirmation();

            const newGovernanceStorage = await governanceInstance.storage();
            const newDelegationStorage = await delegationInstance.storage();

            // console.log(newGovernanceStorage);
            console.log('new config delegation max satellites: ' + newDelegationStorage.config.maxSatellites);
            console.log('new config governance voting power ratio: ' + newGovernanceStorage.config.votingPowerRatio);
        
        } catch(e){
            console.log(e);
        } 
    });


});