// const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
// const { InMemorySigner, importKey } = require("@taquito/signer");
// import assert, { ok, rejects, strictEqual } from "assert";
// import { Utils, zeroAddress } from "./helpers/Utils";
// import fs from "fs";
// import { confirmOperation } from "../scripts/confirmation";

// const chai = require("chai");
// const chaiAsPromised = require('chai-as-promised');
// chai.use(chaiAsPromised);   
// chai.should();

// import env from "../env";
// import { bob, alice, eve, mallory } from "../scripts/sandbox/accounts";

// import doormanAddress from '../deployments/doormanAddress.json';
// import delegationAddress from '../deployments/delegationAddress.json';
// import mvkTokenAddress from '../deployments/mvkTokenAddress.json';
// import governanceAddress from '../deployments/governanceAddress.json';

// // import governanceLambdaParamBytes from "../build/lambdas/governanceLambdaParametersBytes.json";
// import { config } from "yargs";

// describe("Governance tests", async () => {
//     var utils: Utils;

//     let doormanInstance;
//     let delegationInstance;
//     let mvkTokenInstance;
//     let governanceInstance;

//     let doormanStorage;
//     let delegationStorage;
//     let mvkTokenStorage;
//     let governanceStorage;
    
//     const signerFactory = async (pk) => {
//         await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
//         return utils.tezos;
//     };

//     const proposalId = 1;

//     before("setup", async () => {

//         utils = new Utils();
//         await utils.init(bob.sk);
        
//         doormanInstance    = await utils.tezos.contract.at(doormanAddress.address);
//         delegationInstance = await utils.tezos.contract.at(delegationAddress.address);
//         mvkTokenInstance   = await utils.tezos.contract.at(mvkTokenAddress.address);
//         governanceInstance = await utils.tezos.contract.at(governanceAddress.address);
            
//         doormanStorage    = await doormanInstance.storage();
//         delegationStorage = await delegationInstance.storage();
//         mvkTokenStorage   = await mvkTokenInstance.storage();
//         governanceStorage = await governanceInstance.storage();

//         console.log('-- -- -- -- -- Governance Tests -- -- -- --')
//         console.log('Doorman Contract deployed at:', doormanInstance.address);
//         console.log('Delegation Contract deployed at:', delegationInstance.address);
//         console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
//         console.log('Governance Contract deployed at:', governanceInstance.address);
//         console.log('Bob address: ' + bob.pkh);
//         console.log('Alice address: ' + alice.pkh);
//         console.log('Eve address: ' + eve.pkh);

//     });

//     it('admin can start a new proposal round', async () => {
//         try{        

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Admin can start a new proposal round") 
//             console.log("---") // break

//             await signerFactory(alice.sk);
//             // Alice stakes 100 MVK tokens and registers as a satellite before the proposal round starts
//             const aliceStakeAmount                = 100000000000;
//             const aliceUpdateOperatorOperation    = await mvkTokenInstance.methods.update_operators([
//                 {
//                     add_operator: {
//                         owner: alice.pkh,
//                         operator: doormanAddress.address,
//                         token_id: 0,
//                     },
//                 },
//             ])
//             .send()
//             await aliceUpdateOperatorOperation.confirmation()
//             const aliceStakeAmountOperation       = await doormanInstance.methods.stake(aliceStakeAmount).send();
//             await aliceStakeAmountOperation.confirmation();                        

//             const aliceRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite("New Satellite by Alice", "New Satellite Description - Alice", "https://image.url", "700").send();
//             await aliceRegisterAsSatelliteOperation.confirmation();

//             await signerFactory(bob.sk);

//             // Bob stakes 100 MVK tokens and registers as a satellite before the proposal round starts
//             const bobStakeAmount              = 100000000000;
//             const bobUpdateOperatorOperation    = await mvkTokenInstance.methods.update_operators([
//                 {
//                     add_operator: {
//                         owner: bob.pkh,
//                         operator: doormanAddress.address,
//                         token_id: 0,
//                     },
//                 },
//             ])
//             .send()
//             await bobUpdateOperatorOperation.confirmation()
//             const bobStakeAmountOperation     = await doormanInstance.methods.stake(bobStakeAmount).send();
//             await bobStakeAmountOperation.confirmation();                        

//             const bobRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite("New Satellite by Bob", "New Satellite Description - Bob", "https://image.url", "700").send();
//             await bobRegisterAsSatelliteOperation.confirmation();

//             // admin starts a new proposal round
//             const adminStartsNewProposalRoundOperation = await governanceInstance.methods.startProposalRound().send();
//             await adminStartsNewProposalRoundOperation.confirmation();

//             // get new storage and assert tests
//             console.log("--- --- ---")
//             const newGovernanceStorage = await governanceInstance.storage();        
//             const activeSatellitesMap    = await newGovernanceStorage.activeSatellitesMap;
//             const bobSatelliteSnapshot = await newGovernanceStorage.snapshotLedger.get(bob.pkh);
//             const aliceSatelliteSnapshot   = await newGovernanceStorage.snapshotLedger.get(alice.pkh);

//             assert.equal(newGovernanceStorage.currentRound, 'proposal')
            
//             assert.equal(bobSatelliteSnapshot.totalDelegatedAmount,  0);
//             assert.equal(bobSatelliteSnapshot.totalMvkBalance,       bobStakeAmount);
//             assert.equal(bobSatelliteSnapshot.totalVotingPower,      bobStakeAmount);

//             assert.equal(aliceSatelliteSnapshot.totalDelegatedAmount,    0);
//             assert.equal(aliceSatelliteSnapshot.totalMvkBalance,         aliceStakeAmount);
//             assert.equal(aliceSatelliteSnapshot.totalVotingPower,        aliceStakeAmount);

//             // key of wallet address in activeSatellitesMap returns timestamp of when satellite was added - hence assert notEqual null to check for an entry
//             assert.notEqual(activeSatellitesMap.get(bob.pkh), null); 
//             assert.notEqual(activeSatellitesMap.get(alice.pkh), null);
            
//         } catch(e){
//             console.log(e);
//         } 
//     });

//     it('bob can create a new proposal during the proposal round', async () => {
//         try{        

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: bob can create a new proposal during the proposal round") 
//             console.log("---") // break

//             // admin creates a new proposal
//             const proposalName          = "New Proposal #1";
//             const proposalDesc          = "Details about new proposal #1";
//             const proposalIpfs          = "ipfs://QM123456789";
//             const proposalSourceCode    = "Proposal Source Code";

//             const bobCreatesNewProposalOperation = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode).send();
//             await bobCreatesNewProposalOperation.confirmation();
            
//             // get new storage and assert tests
//             console.log("--- --- ---")
//             const proposalId            = 1;
//             const newGovernanceStorage  = await governanceInstance.storage();
//             const proposalRecord        = await newGovernanceStorage.proposalLedger.get(proposalId);

//             assert.equal(proposalRecord.title,       proposalName);
//             assert.equal(proposalRecord.description, proposalDesc);
//             assert.equal(proposalRecord.invoice,     proposalIpfs);
//             assert.equal(proposalRecord.sourceCode,  proposalSourceCode);
//             assert.equal(proposalRecord.status,      "ACTIVE");
//             assert.equal(proposalRecord.executed,    false);
//             assert.equal(proposalRecord.locked,      false);

//         } catch(e){
//             console.log(e);
//         } 
//     });

//     it('bob can add proposal data to her proposal during the proposal round', async () => {
//         try{        

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: bob can add proposal data to her proposal during the proposal round") 
//             console.log("---") // break

//             // add lambda to proposal - config success reward
//             const configSuccessRewardParam = governanceProxyInstance.methods.dataPackingHelper(
//                 'updateGovernanceConfig', 995, 'configSuccessReward'
//             ).toTransferParams();
//             const configSuccessRewardParamValue = configSuccessRewardParam.parameter.value;
//             const callGovernanceLambdaEntrypointType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//             const updateConfigSuccessRewardPacked = await utils.tezos.rpc.packData({
//                 data: configSuccessRewardParamValue,
//                 type: callGovernanceLambdaEntrypointType
//             }).catch(e => console.error('error:', e));

//             var packedUpdateConfigSuccessRewardParam;
//             if (updateConfigSuccessRewardPacked) {
//                 packedUpdateConfigSuccessRewardParam = updateConfigSuccessRewardPacked.packed
//                 console.log('packed success reward param: ' + packedUpdateConfigSuccessRewardParam);
//             } else {
//               throw `packing failed`
//             };
            
//             const firstMetadataTitle                        = "Update Governance Config - Success Reward to be 995n";
//             const bobAddsConfigSuccessRewardDataOperation = await governanceInstance.methods.addUpdateProposalData(proposalId, firstMetadataTitle, packedUpdateConfigSuccessRewardParam).send();
//             await bobAddsConfigSuccessRewardDataOperation.confirmation();

//             // add lambda to proposal - config success reward
//             const configMinQuorumMvkTotalParam = governanceProxyInstance.methods.dataPackingHelper(
//                 'updateGovernanceConfig', 42000, 'configMinQuorumMvkTotal'
//             ).toTransferParams();
//             const configMinQuorumMvkTotalParamValue = configMinQuorumMvkTotalParam.parameter.value;

//             const updateConfigMinQuorumMvkTotalPacked = await utils.tezos.rpc.packData({
//                 data: configMinQuorumMvkTotalParamValue,
//                 type: callGovernanceLambdaEntrypointType
//             }).catch(e => console.error('error:', e));

//             var packedUpdateConfigMinQuorumMvkTotalParam;
//             if (updateConfigMinQuorumMvkTotalPacked) {
//                 packedUpdateConfigMinQuorumMvkTotalParam = updateConfigMinQuorumMvkTotalPacked.packed
//                 console.log('packed min quorum mvk total param: ' + packedUpdateConfigMinQuorumMvkTotalParam);
//             } else {
//               throw `packing failed`
//             };
            
//             const secondMetadataTitle                           = "Update Governance Config - Min Quorum MVk Total to be 42000n"
//             const bobAddsConfigMinQUorumMvkTotalDataOperation = await governanceInstance.methods.addUpdateProposalData(proposalId, secondMetadataTitle, packedUpdateConfigMinQuorumMvkTotalParam).send();
//             await bobAddsConfigMinQUorumMvkTotalDataOperation.confirmation();

//             // Bob locks proposal once done with adding proposal data
//             const bobLocksProposal = await governanceInstance.methods.lockProposal(proposalId).send();
//             await bobLocksProposal.confirmation();
            
//             // get new storage and assert tests
//             console.log("--- --- ---")
//             const newGovernanceStorage = await governanceInstance.storage();
//             const proposalRecord        = await newGovernanceStorage.proposalLedger.get(proposalId);

//             assert.equal(proposalRecord.locked, true);      
//             assert.equal(proposalRecord.proposalMetadata.get(firstMetadataTitle), packedUpdateConfigSuccessRewardParam);
//             assert.equal(proposalRecord.proposalMetadata.get(secondMetadataTitle), packedUpdateConfigMinQuorumMvkTotalParam);

//         } catch(e){
//             console.log(e);
//         } 
//     });

//     it('bob and alice can vote for her proposal during the proposal round', async () => {
//         try{        

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: bob and alice can vote for her proposal during the proposal round") 
//             console.log("---") // break

//             await signerFactory(alice.sk)
//             const aliceVotesForHisProposalOperation = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//             await aliceVotesForHisProposalOperation.confirmation();

//             // bob votes for her proposal
//             await signerFactory(bob.sk)
//             const bobVotesForHerProposalOperation = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//             await bobVotesForHerProposalOperation.confirmation();

//             // get new storage and assert tests
//             console.log("--- --- ---")
//             const newGovernanceStorage = await governanceInstance.storage();

//             const currentRoundProposals  = await newGovernanceStorage.currentRoundProposals;
//             const currentRoundVotes      = await newGovernanceStorage.currentRoundVotes;
//             const bobProposal          = await newGovernanceStorage.proposalLedger.get(proposalId);
//             const bobProposalPassVotes = await bobProposal.passVotersMap;
//             const bobSatelliteSnapshot = await newGovernanceStorage.snapshotLedger.get(bob.pkh);
//             const aliceSatelliteSnapshot   = await newGovernanceStorage.snapshotLedger.get(alice.pkh);

//             assert.equal(currentRoundVotes.get(bob.pkh), proposalId);
//             assert.equal(currentRoundVotes.get(alice.pkh),   proposalId);

//             assert.equal(bobProposalPassVotes.get(bob.pkh)[0].c, 100000000);
//             assert.equal(bobProposalPassVotes.get(alice.pkh)[0].c,   100000000);

//             assert.equal(currentRoundProposals.get("1"), 200000000);

//         } catch(e){
//             console.log(e);
//         } 
//     });

//     it('admin can start a new voting round', async () => {
//         try{        

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: Admin can start a new voting round") 
//             console.log("---") // break

//             // admin starts a new voting round
//             await signerFactory(bob.sk);
//             const adminStartsNewVotingRoundOperation = await governanceInstance.methods.startVotingRound().send();
//             await adminStartsNewVotingRoundOperation.confirmation();

//             // get new storage and assert tests
//             console.log("--- --- ---")
//             const newGovernanceStorage   = await governanceInstance.storage();
//             const currentRoundVotes      = await newGovernanceStorage.currentRoundVotes;
            
//             assert.equal(newGovernanceStorage.currentRound, 'voting');
//             assert.equal(newGovernanceStorage.currentRoundHighestVotedProposalId, proposalId);

//             // check that current round votes has been flushed from proposal round to voting round
//             assert.equal(currentRoundVotes.get(bob.pkh), null);

//         } catch(e){
//             console.log(e);
//         } 
//     });

//     it('bob and alice can vote for her proposal during the voting round', async () => {
//         try{

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: bob and alice can vote for her proposal during the voting round") 
//             console.log("---") // break

//             await signerFactory(bob.sk);
//             const bobVotingRoundVoteOperation = await governanceInstance.methods.votingRoundVote(proposalId, 1).send();
//             await bobVotingRoundVoteOperation.confirmation();

//             await signerFactory(alice.sk)
//             const aliceVotingRoundVoteOperation = await governanceInstance.methods.votingRoundVote(proposalId, 1).send();
//             await aliceVotingRoundVoteOperation.confirmation();

//             // get new storage and assert tests
//             console.log("--- --- ---")
//             const newGovernanceStorage = await governanceInstance.storage();
            
//             const bobProposal          = await newGovernanceStorage.proposalLedger.get(proposalId);
//             const bobProposalVoters    = await bobProposal.voters;

//             assert.equal(bobProposal.upvoteCount, 2);
//             assert.equal(bobProposal.upvoteMvkTotal, 200000000);
//             assert.equal(bobProposal.downvoteCount, 0);
//             assert.equal(bobProposal.downvoteMvkTotal, 0);
//             assert.equal(bobProposal.abstainCount, 0);
//             assert.equal(bobProposal.abstainMvkTotal, 0);
            
//             assert.equal(bobProposalVoters.get(bob.pkh)[0], 1);             // voteType - 1 is Yay, 0 is Nay, 2 is abstain 
//             assert.equal(bobProposalVoters.get(bob.pkh)[1], 100000000);     // total voting power    
//             assert.equal(bobProposalVoters.get(alice.pkh)[0],   1);             // voteType - 1 is Yay, 0 is Nay, 2 is abstain 
//             assert.equal(bobProposalVoters.get(alice.pkh)[1],   100000000);     // total voting power    

//         } catch(e){
//             console.log(e);
//         } 
//     });

//     it('bob can execute her proposal', async () => {
//         try{        

//             console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//             console.log("Test: bob can execute her proposal") 
//             console.log("---") // break

//             // get old storage and assert tests for old values
//             console.log("--- --- ---")
//             const oldGovernanceStorage = await governanceInstance.storage();
//             assert.equal(oldGovernanceStorage.config.successReward, 10000);
//             assert.equal(oldGovernanceStorage.config.minQuorumMvkTotal, 10000);

//             // admin starts timelock round
//             await signerFactory(bob.sk);
//             const adminStartsTimelockRoundOperation = await governanceInstance.methods.startTimelockRound().send();
//             await adminStartsTimelockRoundOperation.confirmation();

//             // admin starts a new proposal round
//             await signerFactory(bob.sk);
//             const adminStartsNewProposalRoundOperation = await governanceInstance.methods.startProposalRound().send();
//             await adminStartsNewProposalRoundOperation.confirmation();

//             const bobExecuteProposalOperation = await governanceInstance.methods.executeProposal(proposalId).send();
//             await bobExecuteProposalOperation.confirmation();

//             // get new storage and assert tests for new values
//             console.log("--- --- ---")
//             const newGovernanceStorage = await governanceInstance.storage();            
//             assert.equal(newGovernanceStorage.config.successReward,     995);
//             assert.equal(newGovernanceStorage.config.minQuorumMvkTotal, 42000);

//         } catch(e){
//             console.log(e);
//         } 
//     });

//     // it('admin submits 2nd proposal in 2nd proposal round', async () => {
//     //     try{        

//     //         console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//     //         console.log("Test: Admin submits 2nd proposal in 2nd proposal round") 
//     //         console.log("---") // break

//     //         const nextProposalId = 2;

//     //         // console.log('storage: console log checks  ----');
//     //         const beforeGovernanceStorage = await governanceInstance.storage();
//     //         const beforeDelegationStorage = await delegationInstance.storage();

//     //         // console.log(beforeGovernanceStorage);
//     //         console.log("Current Round:" +beforeGovernanceStorage.currentRound);

//     //         console.log('old config delegation max satellites: ' + beforeDelegationStorage.config.maxSatellites);
//     //         console.log('old config governance voting power ratio: ' + beforeGovernanceStorage.config.votingPowerRatio);
        
//     //         // admin starts a new proposal round
//     //         const bobCreatesNewProposalOperation = await governanceInstance.methods.propose("New Proposal #2", "Details about new proposal #2", "ipfs://hash").send();
//     //         await bobCreatesNewProposalOperation.confirmation();

//     //         // config delegation max satellite
//     //         const configDelegationMaxSatellitesParam = governanceProxyInstance.methods.dataPackingHelper(
//     //             'updateDelegationConfig', 555, 'configMaxSatellites'
//     //         ).toTransferParams();
//     //         const configDelegationMaxSatelliteParamValue = configDelegationMaxSatellitesParam.parameter.value;
//     //         const callGovernanceLambdaEntrypointType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//     //         const updateConfigDelegationMaxSatellitePacked = await utils.tezos.rpc.packData({
//     //             data: configDelegationMaxSatelliteParamValue,
//     //             type: callGovernanceLambdaEntrypointType
//     //         }).catch(e => console.error('error:', e));

//     //         var packedUpdateConfigMaxSatelliteParam;
//     //         if (updateConfigDelegationMaxSatellitePacked) {
//     //             packedUpdateConfigMaxSatelliteParam = updateConfigDelegationMaxSatellitePacked.packed
//     //             console.log('packed success reward param: ' + packedUpdateConfigMaxSatelliteParam);
//     //         } else {
//     //           throw `packing failed`
//     //         };
            
//     //         const bobAddsConfigDelegationMaxSatelliteOperation = await governanceInstance.methods.addUpdateProposalData(nextProposalId, "Update Delegation Config - Max Satellites to 555", packedUpdateConfigMaxSatelliteParam).send();
//     //         await bobAddsConfigDelegationMaxSatelliteOperation.confirmation();

//     //         // config success reward
//     //         const configVotingPowerRatioParam = governanceProxyInstance.methods.dataPackingHelper(
//     //             'updateGovernanceConfig', 25000, 'configVotingPowerRatio'
//     //         ).toTransferParams();
//     //         const configVotingPowerRatioParamValue = configVotingPowerRatioParam.parameter.value;

//     //         const updateConfigVotingPowerRatioPacked = await utils.tezos.rpc.packData({
//     //             data: configVotingPowerRatioParamValue,
//     //             type: callGovernanceLambdaEntrypointType
//     //         }).catch(e => console.error('error:', e));

//     //         var packedUpdateConfigVotingPowerRatioParam;
//     //         if (updateConfigVotingPowerRatioPacked) {
//     //             packedUpdateConfigVotingPowerRatioParam = updateConfigVotingPowerRatioPacked.packed
//     //           console.log('packed min quorum mvk total param: ' + packedUpdateConfigVotingPowerRatioParam);
//     //         } else {
//     //           throw `packing failed`
//     //         };
            
//     //         const bobAddsConfigVotingPowerRatioDataOperation = await governanceInstance.methods.addUpdateProposalData(nextProposalId, "Update Governance Config - Voting Power Ratio to be 25000", packedUpdateConfigVotingPowerRatioParam).send();
//     //         await bobAddsConfigVotingPowerRatioDataOperation.confirmation();

//     //         // Bob locks proposal once done with adding proposal data
//     //         const bobLocksProposal = await governanceInstance.methods.lockProposal(nextProposalId).send();
//     //         await bobLocksProposal.confirmation();

//     //         // proposal round: alice votes for proposal
//     //         await signerFactory(alice.sk)
//     //         const aliceVotesForHisProposalOperation = await governanceInstance.methods.proposalRoundVote(nextProposalId).send();
//     //         await aliceVotesForHisProposalOperation.confirmation();

//     //         // proposal round: bob votes for proposal
//     //         await signerFactory(bob.sk)
//     //         const bobVotesForHerProposalOperation = await governanceInstance.methods.proposalRoundVote(nextProposalId).send();
//     //         await bobVotesForHerProposalOperation.confirmation();

//     //         // admin starts a new voting round
//     //         const adminStartsNewVotingRoundOperation = await governanceInstance.methods.startVotingRound().send();
//     //         await adminStartsNewVotingRoundOperation.confirmation();

//     //         console.log("==== Start Voting Round ===")
//     //         const midGovernanceStorage = await governanceInstance.storage();
//     //         console.log("Current Round:" +midGovernanceStorage.currentRound);

//     //         // bob and alice votes for the second proposal 
//     //         await signerFactory(bob.sk);
//     //         const bobVotingRoundVoteOperation = await governanceInstance.methods.votingRoundVote(nextProposalId, 1).send();
//     //         await bobVotingRoundVoteOperation.confirmation();

//     //         await signerFactory(alice.sk)
//     //         const aliceVotingRoundVoteOperation = await governanceInstance.methods.votingRoundVote(nextProposalId, 1).send();
//     //         await aliceVotingRoundVoteOperation.confirmation();

//     //         // admin starts timelock round
//     //         await signerFactory(bob.sk);
//     //         const adminStartsTimelockRoundOperation = await governanceInstance.methods.startTimelockRound().send();
//     //         await adminStartsTimelockRoundOperation.confirmation();

//     //         // admin starts a new proposal round - 3rd round
//     //         await signerFactory(bob.sk);
//     //         const adminStartsNewProposalRoundOperation = await governanceInstance.methods.startProposalRound().send();
//     //         await adminStartsNewProposalRoundOperation.confirmation();

//     //         // bob executes proposal 
//     //         const bobExecuteProposalOperation = await governanceInstance.methods.executeProposal(nextProposalId).send();
//     //         await bobExecuteProposalOperation.confirmation();

//     //         const newGovernanceStorage = await governanceInstance.storage();
//     //         const newDelegationStorage = await delegationInstance.storage();

//     //         // console.log(newGovernanceStorage);
//     //         console.log('new config delegation max satellites: ' + newDelegationStorage.config.maxSatellites);
//     //         console.log('new config governance voting power ratio: ' + newGovernanceStorage.config.votingPowerRatio);
        
//     //     } catch(e){
//     //         console.log(e);
//     //     } 
//     // });


// });