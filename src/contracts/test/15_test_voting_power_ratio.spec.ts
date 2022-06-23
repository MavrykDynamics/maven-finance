// const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
// const { InMemorySigner, importKey } = require("@taquito/signer");
// import assert, { ok, rejects, strictEqual } from "assert";
// import { MVK, Utils, zeroAddress } from "./helpers/Utils";
// import fs from "fs";
// import { confirmOperation } from "../scripts/confirmation";
// import { BigNumber } from "bignumber.js";

// const chai = require("chai");
// const chaiAsPromised = require('chai-as-promised');
// chai.use(chaiAsPromised);   
// chai.should();

// import env from "../env";
// import { bob, alice, eve, mallory, trudy, oscar } from "../scripts/sandbox/accounts";

// import doormanAddress from '../deployments/doormanAddress.json';
// import delegationAddress from '../deployments/delegationAddress.json';
// import councilAddress from '../deployments/councilAddress.json'
// import mvkTokenAddress from '../deployments/mvkTokenAddress.json';
// import governanceAddress from '../deployments/governanceAddress.json';
// import governanceProxyAddress from '../deployments/governanceProxyAddress.json';
// import emergencyGovernanceAddress from '../deployments/emergencyGovernanceAddress.json';
// import breakGlassAddress from '../deployments/breakGlassAddress.json';

// // import governanceLambdaParamBytes from "../build/lambdas/governanceLambdaParametersBytes.json";
// import { config } from "yargs";
// import { MichelsonMap } from "@taquito/taquito";

// describe("Governance tests", async () => {
//     var utils: Utils;

//     let doormanInstance;
//     let delegationInstance;
//     let mvkTokenInstance;
//     let governanceInstance;
//     let governanceProxyInstance;
//     let emergencyGovernanceInstance;
//     let breakGlassInstance;
//     let councilInstance;

//     let doormanStorage;
//     let delegationStorage;
//     let mvkTokenStorage;
//     let governanceStorage;
//     let governanceProxyStorage;
//     let emergencyGovernanceStorage;
//     let breakGlassStorage;
//     let councilStorage;
    
//     const signerFactory = async (pk) => {
//         await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
//         return utils.tezos;
//     };

//     before("setup", async () => {

//         utils = new Utils();
//         await utils.init(bob.sk);
        
//         doormanInstance    = await utils.tezos.contract.at(doormanAddress.address);
//         delegationInstance = await utils.tezos.contract.at(delegationAddress.address);
//         mvkTokenInstance   = await utils.tezos.contract.at(mvkTokenAddress.address);
//         governanceInstance = await utils.tezos.contract.at(governanceAddress.address);
//         governanceProxyInstance = await utils.tezos.contract.at(governanceProxyAddress.address);
//         emergencyGovernanceInstance = await utils.tezos.contract.at(emergencyGovernanceAddress.address);
//         breakGlassInstance = await utils.tezos.contract.at(breakGlassAddress.address);
//         councilInstance = await utils.tezos.contract.at(councilAddress.address);
            
//         doormanStorage    = await doormanInstance.storage();
//         delegationStorage = await delegationInstance.storage();
//         mvkTokenStorage   = await mvkTokenInstance.storage();
//         governanceStorage = await governanceInstance.storage();
//         governanceProxyStorage  = await governanceProxyInstance.storage();
//         emergencyGovernanceStorage = await emergencyGovernanceInstance.storage();
//         breakGlassStorage = await breakGlassInstance.storage();
//         councilStorage  = await councilInstance.storage();

//         console.log('-- -- -- -- -- Governance Tests -- -- -- --')
//         console.log('Doorman Contract deployed at:', doormanInstance.address);
//         console.log('Delegation Contract deployed at:', delegationInstance.address);
//         console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
//         console.log('Governance Contract deployed at:', governanceInstance.address);
//         console.log('Emergency Governance Contract deployed at:', emergencyGovernanceInstance.address);
//         console.log('Bob address: ' + bob.pkh);
//         console.log('Alice address: ' + alice.pkh);
//         console.log('Eve address: ' + eve.pkh);

//         // Init multiple satellites with multiple delegates
//         delegationStorage = await delegationInstance.storage();
//         const satelliteMap = await delegationStorage.satelliteLedger;
//         if(satelliteMap.get(eve.pkh) === undefined){

//             /**
//              * Init First Satellite:
//              * Alice
//              * 
//              * Delegates:
//              * Bob and Trudy
//              */
//             await signerFactory(alice.sk)
//             updateOperators = await mvkTokenInstance.methods
//                 .update_operators([
//                 {
//                     add_operator: {
//                         owner: alice.pkh,
//                         operator: doormanAddress.address,
//                         token_id: 0,
//                     },
//                 },
//                 ])
//                 .send()
//             await updateOperators.confirmation();
//             var stakeOperation = await doormanInstance.methods.stake(MVK(100)).send();
//             await stakeOperation.confirmation();
//             var registerAsSatellite = await delegationInstance.methods
//             .registerAsSatellite(
//                 "Alice Satellite", 
//                 "Test description", 
//                 "Test image", 
//                 "Test website", 
//                 700
//             ).send();
//             await registerAsSatellite.confirmation();

//             await signerFactory(bob.sk)
//             var updateOperators = await mvkTokenInstance.methods
//                 .update_operators([
//                 {
//                     add_operator: {
//                         owner: bob.pkh,
//                         operator: doormanAddress.address,
//                         token_id: 0,
//                     },
//                 },
//                 ])
//                 .send()
//             await updateOperators.confirmation();
//             stakeOperation = await doormanInstance.methods.stake(MVK(10000)).send();
//             await stakeOperation.confirmation();
//             var delegateOperation   = await delegationInstance.methods.delegateToSatellite(bob.pkh, alice.pkh).send()
//             await delegateOperation.confirmation()

//             await signerFactory(trudy.sk)
//             var updateOperators = await mvkTokenInstance.methods
//                 .update_operators([
//                 {
//                     add_operator: {
//                         owner: trudy.pkh,
//                         operator: doormanAddress.address,
//                         token_id: 0,
//                     },
//                 },
//                 ])
//                 .send()
//             await updateOperators.confirmation();
//             stakeOperation = await doormanInstance.methods.stake(MVK(1234)).send();
//             await stakeOperation.confirmation();
//             var delegateOperation   = await delegationInstance.methods.delegateToSatellite(trudy.pkh, alice.pkh).send()
//             await delegateOperation.confirmation()

//             /**
//              * Init Second Satellite:
//              * Eve
//              * 
//              * Delegates:
//              * Mallory and Oscar
//              */
//             await signerFactory(eve.sk)
//             updateOperators = await mvkTokenInstance.methods
//                 .update_operators([
//                 {
//                     add_operator: {
//                         owner: eve.pkh,
//                         operator: doormanAddress.address,
//                         token_id: 0,
//                     },
//                 },
//                 ])
//                 .send()
//             await updateOperators.confirmation();
//             stakeOperation = await doormanInstance.methods.stake(MVK(20000)).send();
//             await stakeOperation.confirmation();
//             registerAsSatellite = await delegationInstance.methods
//             .registerAsSatellite(
//                 "Eve Satellite", 
//                 "Test description", 
//                 "Test image", 
//                 "Test website", 
//                 700
//             ).send();
//             await registerAsSatellite.confirmation();

//             await signerFactory(mallory.sk)
//             var updateOperators = await mvkTokenInstance.methods
//                 .update_operators([
//                 {
//                     add_operator: {
//                         owner: mallory.pkh,
//                         operator: doormanAddress.address,
//                         token_id: 0,
//                     },
//                 },
//                 ])
//                 .send()
//             await updateOperators.confirmation();
//             stakeOperation = await doormanInstance.methods.stake(MVK(200)).send();
//             await stakeOperation.confirmation();
//             var delegateOperation   = await delegationInstance.methods.delegateToSatellite(mallory.pkh, eve.pkh).send()
//             await delegateOperation.confirmation()

//             await signerFactory(oscar.sk)
//             var updateOperators = await mvkTokenInstance.methods
//                 .update_operators([
//                 {
//                     add_operator: {
//                         owner: oscar.pkh,
//                         operator: doormanAddress.address,
//                         token_id: 0,
//                     },
//                 },
//                 ])
//                 .send()
//             await updateOperators.confirmation();
//             stakeOperation = await doormanInstance.methods.stake(MVK(800)).send();
//             await stakeOperation.confirmation();
//             var delegateOperation   = await delegationInstance.methods.delegateToSatellite(oscar.pkh, alice.pkh).send()
//             await delegateOperation.confirmation()
//         }

//         // Reset signer
//         await signerFactory(bob.sk)

//         // Set council contract admin to governance proxy for later tests
//         const setAdminOperation = await councilInstance.methods.setAdmin(governanceProxyAddress.address).send();
//         await setAdminOperation.confirmation()
//     });

//     describe("%updateConfig", async () => {
//         beforeEach("Set signer to admin", async () => {
//             await signerFactory(bob.sk)
//         });

//         it('Admin updates the voting power ratio', async () => {
//             try{
//                 // Initial Values
//                 governanceStorage = await governanceInstance.storage();
//                 const newConfigValue = 5000;

//                 // Operation
//                 const updateConfigOperation = await governanceInstance.methods.updateConfig(newConfigValue,"configVotingPowerRatio").send();
//                 await updateConfigOperation.confirmation();

//                 // Final values
//                 governanceStorage = await governanceInstance.storage();
//                 const updateConfigValue = governanceStorage.config.votingPowerRatio;

//                 // Assertions
//                 assert.equal(updateConfigValue, newConfigValue);
//             } catch(e){
//                 console.dir(e, {depth: 5})
//             }
//         });

//         it('Admin should be able to call the entrypoint and configure the min proposal round vote percentage required', async () => {
//             try{
//                 // Initial Values
//                 governanceStorage = await governanceInstance.storage();
//                 const newConfigValue = 1;

//                 // Operation
//                 const updateConfigOperation = await governanceInstance.methods.updateConfig(newConfigValue,"configMinProposalRoundVotePct").send();
//                 await updateConfigOperation.confirmation();

//                 // Final values
//                 governanceStorage = await governanceInstance.storage();
//                 const updateConfigValue = governanceStorage.config.minProposalRoundVotePercentage;

//                 // Assertions
//                 assert.equal(updateConfigValue, newConfigValue);
//             } catch(e){
//                 console.dir(e, {depth: 5})
//             }
//         });

//         it('Admin should be able to call the entrypoint and configure the min proposal round votes required', async () => {
//             try{
//                 // Initial Values
//                 governanceStorage = await governanceInstance.storage();
//                 const newConfigValue = 1;

//                 // Operation
//                 const updateConfigOperation = await governanceInstance.methods.updateConfig(newConfigValue,"configMinProposalRoundVotesReq").send();
//                 await updateConfigOperation.confirmation();

//                 // Final values
//                 governanceStorage = await governanceInstance.storage();
//                 const updateConfigValue = governanceStorage.config.minProposalRoundVotesRequired;

//                 // Assertions
//                 assert.equal(updateConfigValue, newConfigValue);
//             } catch(e){
//                 console.dir(e, {depth: 5})
//             }
//         });

//         it('Admin should be able to call the entrypoint and configure the min proposal round vote percentage required', async () => {
//             try{
//                 // Initial Values
//                 governanceStorage = await governanceInstance.storage();
//                 const newConfigValue = 10;

//                 // Operation
//                 const updateConfigOperation = await governanceInstance.methods.updateConfig(newConfigValue,"configMinQuorumPercentage").send();
//                 await updateConfigOperation.confirmation();

//                 // Final values
//                 governanceStorage = await governanceInstance.storage();
//                 const updateConfigValue = governanceStorage.config.minQuorumPercentage;

//                 // Assertions
//                 assert.equal(updateConfigValue, newConfigValue);
//             } catch(e){
//                 console.dir(e, {depth: 5})
//             }
//         });

//         it('Admin should be able to call the entrypoint and configure the min quorum mvk total required', async () => {
//             try{
//                 // Initial Values
//                 governanceStorage = await governanceInstance.storage();
//                 const newConfigValue = MVK(2);

//                 // Operation
//                 const updateConfigOperation = await governanceInstance.methods.updateConfig(newConfigValue,"configMinQuorumStakedMvkTotal").send();
//                 await updateConfigOperation.confirmation();

//                 // Final values
//                 governanceStorage = await governanceInstance.storage();
//                 const updateConfigValue = governanceStorage.config.minQuorumStakedMvkTotal;

//                 // Assertions
//                 assert.equal(updateConfigValue, newConfigValue);
//             } catch(e){
//                 console.dir(e, {depth: 5})
//             }
//         });

//         it('Admin should be able to call the entrypoint and configure the blocks per proposal round', async () => {
//             try{
//                 // Initial Values
//                 governanceStorage = await governanceInstance.storage();
//                 const newConfigValue = 0;

//                 // Operation
//                 const updateConfigOperation = await governanceInstance.methods.updateConfig(newConfigValue,"configBlocksPerProposalRound").send();
//                 await updateConfigOperation.confirmation();

//                 // Final values
//                 governanceStorage = await governanceInstance.storage();
//                 const updateConfigValue = governanceStorage.config.blocksPerProposalRound;

//                 // Assertions
//                 assert.equal(updateConfigValue, newConfigValue);
//             } catch(e){
//                 console.dir(e, {depth: 5})
//             }
//         });
        
//         it('Admin should be able to call the entrypoint and configure the blocks per voting round', async () => {
//             try{
//                 // Initial Values
//                 governanceStorage = await governanceInstance.storage();
//                 const newConfigValue = 0;

//                 // Operation
//                 const updateConfigOperation = await governanceInstance.methods.updateConfig(newConfigValue,"configBlocksPerVotingRound").send();
//                 await updateConfigOperation.confirmation();

//                 // Final values
//                 governanceStorage = await governanceInstance.storage();
//                 const updateConfigValue = governanceStorage.config.blocksPerVotingRound;

//                 // Assertions
//                 assert.equal(updateConfigValue, newConfigValue);
//             } catch(e){
//                 console.dir(e, {depth: 5})
//             }
//         });
        
//         it('Admin should be able to call the entrypoint and configure the blocks per timelock round', async () => {
//             try{
//                 // Initial Values
//                 governanceStorage = await governanceInstance.storage();
//                 const newConfigValue = 0;

//                 // Operation
//                 const updateConfigOperation = await governanceInstance.methods.updateConfig(newConfigValue,"configBlocksPerTimelockRound").send();
//                 await updateConfigOperation.confirmation();

//                 // Final values
//                 governanceStorage = await governanceInstance.storage();
//                 const updateConfigValue = governanceStorage.config.blocksPerTimelockRound;

//                 // Assertions
//                 assert.equal(updateConfigValue, newConfigValue);
//             } catch(e){
//                 console.dir(e, {depth: 5})
//             }
//         });
//     });

//     describe("Init cycle with Proposal Round", async () => {
//         beforeEach("Set signer to standard user", async () => {
//             await signerFactory(eve.sk)
//         });

//         it('User starts a proposal round (check that the snapshot is correct)', async () => {
//             try{
//                 // Initial Values
//                 governanceStorage = await governanceInstance.storage();
//                 const currentCycleInfoRound                       = governanceStorage.currentCycleInfo.round
//                 const currentCycleInfoRoundString                 = Object.keys(currentCycleInfoRound)[0]
//                 const currentCycleInfoBlocksPerProposalRound      = governanceStorage.currentCycleInfo.blocksPerProposalRound
//                 const currentCycleInfoBlocksPerVotingRound        = governanceStorage.currentCycleInfo.blocksPerVotingRound
//                 const currentCycleInfoBlocksPerTimelockRound      = governanceStorage.currentCycleInfo.blocksPerTimelockRound
//                 const currentCycleInfoRoundStartLevel             = governanceStorage.currentCycleInfo.roundStartLevel
//                 const currentCycleInfoRoundEndLevel               = governanceStorage.currentCycleInfo.roundEndLevel
//                 const currentCycleInfoCycleEndLevel               = governanceStorage.currentCycleInfo.cycleEndLevel
//                 const cycleHighestVotedProposalId = governanceStorage.cycleHighestVotedProposalId

//                 // Operation
//                 const startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                 await startNextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage = await governanceInstance.storage();
//                 const finalRound                       = governanceStorage.currentCycleInfo.round
//                 const finalRoundString                 = Object.keys(finalRound)[0]
//                 const finalBlocksPerProposalRound      = governanceStorage.currentCycleInfo.blocksPerProposalRound
//                 const finalBlocksPerVotingRound        = governanceStorage.currentCycleInfo.blocksPerVotingRound
//                 const finalBlocksPerTimelockRound      = governanceStorage.currentCycleInfo.blocksPerTimelockRound
//                 const finalRoundStartLevel             = governanceStorage.currentCycleInfo.roundStartLevel
//                 const finalRoundEndLevel               = governanceStorage.currentCycleInfo.roundEndLevel
//                 const finalCycleEndLevel               = governanceStorage.currentCycleInfo.cycleEndLevel
//                 const finalRoundHighestVotedProposalId = governanceStorage.cycleHighestVotedProposalId

//                 // Assertions
//                 assert.equal(currentCycleInfoRoundString, "proposal");
//                 assert.equal(currentCycleInfoBlocksPerProposalRound, 0);
//                 assert.equal(currentCycleInfoBlocksPerVotingRound, 0);
//                 assert.equal(currentCycleInfoBlocksPerTimelockRound, 0);
//                 assert.equal(currentCycleInfoRoundStartLevel, 0);
//                 assert.equal(currentCycleInfoRoundEndLevel, 0);
//                 assert.equal(currentCycleInfoCycleEndLevel, 0);
//                 assert.equal(cycleHighestVotedProposalId, 0);

//                 assert.equal(finalRoundString, "proposal");
//                 assert.notEqual(finalBlocksPerProposalRound, currentCycleInfoBlocksPerProposalRound);
//                 assert.notEqual(finalBlocksPerVotingRound, currentCycleInfoBlocksPerVotingRound);
//                 assert.notEqual(finalBlocksPerTimelockRound, currentCycleInfoBlocksPerTimelockRound);
//                 assert.notEqual(finalRoundStartLevel, currentCycleInfoRoundStartLevel);
//                 assert.notEqual(finalRoundEndLevel, currentCycleInfoRoundEndLevel);
//                 assert.notEqual(finalCycleEndLevel, currentCycleInfoCycleEndLevel);
//                 assert.notEqual(finalRoundHighestVotedProposalId, cycleHighestVotedProposalId);

//                 // Check storage
//                 delegationStorage       = await delegationInstance.storage()
//                 governanceStorage       = await governanceInstance.storage()
//                 const snapshotLedger    = governanceStorage.snapshotLedger
//                 console.log("SATELLITES SNAPSHOT")
//                 console.dir(snapshotLedger, {depth: 5})

//                 const firstSatellite    = delegationStorage.satelliteLedger.get(alice.pkh);
//                 console.log("FIRST SATELLITE (ALICE)")
//                 console.dir(firstSatellite, {depth: 5})

//                 const secondSatellite   = delegationStorage.satelliteLedger.get(eve.pkh);
//                 console.log("SECOND SATELLITE (EVE)")
//                 console.dir(secondSatellite, {depth: 5})
//             } catch(e){
//                 console.dir(e, {depth: 5})
//             }
//         })
//     })

//     describe("Propose & Vote", async () => {
//         beforeEach("Set signer to satellite", async () => {
//             await signerFactory(alice.sk)
//         });

//         it('Alice (satellite) proposes a proposal and locks it. Alice and Eve vote for it', async () => {
//             try{
//                 // Initial Values
//                 governanceStorage           = await governanceInstance.storage();
//                 delegationStorage           = await delegationInstance.storage();
//                 const nextProposalId        = governanceStorage.nextProposalId;
//                 const proposalName          = "New Proposal";
//                 const proposalDesc          = "Details about new proposal";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";

//                 const configSuccessRewardParam = governanceProxyInstance.methods.dataPackingHelper(
//                 'updateCouncilConfig',
//                 1234,
//                 'configActionExpiryDays'
//                 ).toTransferParams();
//                 const configSuccessRewardParamValue = configSuccessRewardParam.parameter.value;
//                 const callGovernanceLambdaEntrypointType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
    
//                 const updateConfigSuccessRewardPacked = await utils.tezos.rpc.packData({
//                     data: configSuccessRewardParamValue,
//                     type: callGovernanceLambdaEntrypointType
//                 }).catch(e => console.error('error:', e));
    
//                 var packedUpdateConfigSuccessRewardParam;
//                 if (updateConfigSuccessRewardPacked) {
//                     packedUpdateConfigSuccessRewardParam = updateConfigSuccessRewardPacked.packed
//                     // console.log('packed success reward param: ' + packedUpdateConfigSuccessRewardParam);
//                 } else {
//                 throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "Metadata#1",
//                         data: packedUpdateConfigSuccessRewardParam
//                     }
//                 ]

//                 // Operation
//                 const proposeOperation  = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
//                 await proposeOperation.confirmation();

//                 const lockOperation     = await governanceInstance.methods.lockProposal(nextProposalId).send()
//                 await lockOperation.confirmation();

//                 // Final values
//                 governanceStorage = await governanceInstance.storage();
//                 const successReward = governanceStorage.config.successReward
//                 const currentCycleInfoCycleEndLevel = governanceStorage.currentCycleInfo.cycleEndLevel
//                 const minQuorumPercentage = governanceStorage.config.minQuorumPercentage
//                 const minQuorumStakedMvkTotal = governanceStorage.config.minQuorumStakedMvkTotal
//                 const minProposalRoundVotePercentage = governanceStorage.config.minProposalRoundVotePercentage
//                 const minProposalRoundVotesRequired = governanceStorage.config.minProposalRoundVotesRequired
//                 const cycleCounter = governanceStorage.cycleCounter
//                 const finalNextProposalId = governanceStorage.nextProposalId;
//                 const newProposal = await governanceStorage.proposalLedger.get(nextProposalId.toNumber());
//                 const proposalMetadataStorage = await newProposal.proposalMetadata.get("0");
//                 const newCurrentRoundProposal = governanceStorage.currentCycleInfo.roundProposals.get(nextProposalId);

//                 console.log("PROPOSAL: ", newProposal)

//                 // Assertions
//                 assert.notStrictEqual(proposalMetadataStorage, undefined);
//                 assert.strictEqual(proposalMetadataStorage.data, packedUpdateConfigSuccessRewardParam);
//                 assert.equal(nextProposalId.toNumber() + 1, finalNextProposalId.toNumber());
//                 assert.notStrictEqual(newCurrentRoundProposal, undefined);
//                 assert.notStrictEqual(newProposal, undefined);
//                 assert.strictEqual(newProposal.proposerAddress, alice.pkh);
//                 assert.strictEqual(newProposal.status, "ACTIVE");
//                 assert.strictEqual(newProposal.title, proposalName);
//                 assert.strictEqual(newProposal.description, proposalDesc);
//                 assert.strictEqual(newProposal.invoice, proposalIpfs);
//                 assert.strictEqual(newProposal.sourceCode, proposalSourceCode);
//                 assert.equal(newProposal.successReward.toNumber(), successReward.toNumber());
//                 assert.equal(newProposal.executed, false);
//                 assert.equal(newProposal.locked, true);
//                 assert.equal(newProposal.proposalVoteCount.toNumber(), 0);
//                 assert.equal(newProposal.proposalVoteStakedMvkTotal.toNumber(), 0);
//                 assert.equal(newProposal.minProposalRoundVotePercentage.toNumber(), minProposalRoundVotePercentage.toNumber());
//                 assert.equal(newProposal.minProposalRoundVotesRequired.toNumber(), minProposalRoundVotesRequired.toNumber());
//                 assert.equal(newProposal.yayVoteCount.toNumber(), 0);
//                 assert.equal(newProposal.yayVoteStakedMvkTotal.toNumber(), 0);
//                 assert.equal(newProposal.nayVoteCount.toNumber(), 0);
//                 assert.equal(newProposal.nayVoteStakedMvkTotal.toNumber(), 0);
//                 assert.equal(newProposal.passVoteCount.toNumber(), 0);
//                 assert.equal(newProposal.passVoteStakedMvkTotal.toNumber(), 0);
//                 assert.equal(newProposal.minQuorumPercentage.toNumber(), minQuorumPercentage.toNumber());
//                 assert.equal(newProposal.minQuorumStakedMvkTotal.toNumber(), minQuorumStakedMvkTotal.toNumber());
//                 assert.equal(newProposal.quorumCount.toNumber(), 0);
//                 assert.equal(newProposal.quorumStakedMvkTotal.toNumber(), 0);
//                 assert.equal(newProposal.cycle.toNumber(), cycleCounter.toNumber());
//                 assert.equal(newProposal.currentCycleEndLevel.toNumber(), currentCycleInfoCycleEndLevel.toNumber());
//             } catch(e){
//                 console.dir(e, {depth: 5})
//             }
//         })

//         it('Alice and Eve vote for the previous proposal', async () => {
//             try{
//                 // Initial Values
//                 governanceStorage           = await governanceInstance.storage();
//                 const nextProposalId        = governanceStorage.nextProposalId.toNumber() - 1;

//                 var voteForProposalOperation = await governanceInstance.methods.proposalRoundVote(nextProposalId).send();
//                 await voteForProposalOperation.confirmation()

//                 await signerFactory(eve.sk)
//                 voteForProposalOperation = await governanceInstance.methods.proposalRoundVote(nextProposalId).send();
//                 await voteForProposalOperation.confirmation()
//             } catch(e){
//                 console.dir(e, {depth: 5})
//             }
//         })

//         it('User switches to voting round', async () => {
//             try{
//                 // Initial Values
//                 governanceStorage           = await governanceInstance.storage();
//                 const previousProposalId    = governanceStorage.nextProposalId.toNumber() - 1;

//                 // Operation
//                 const startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                 await startNextRoundOperation.confirmation();
                
//                 // Final values
//                 governanceStorage                   = await governanceInstance.storage();                
//                 const currentCycleInfoRound         = governanceStorage.currentCycleInfo.round
//                 const currentCycleInfoRoundString   = Object.keys(currentCycleInfoRound)[0]
//                 const cycleHighestVotedProposalId   = governanceStorage.cycleHighestVotedProposalId

//                 // Assertions
//                 assert.equal(cycleHighestVotedProposalId.toNumber(), previousProposalId);
//                 assert.strictEqual(currentCycleInfoRoundString, "voting");
//             } catch(e){
//                 console.dir(e, {depth: 5})
//             }
//         })

//         it('Satellites vote for proposal', async () => {
//             try{
//                 // Initial Values
//                 governanceStorage           = await governanceInstance.storage();
//                 const previousProposalId    = governanceStorage.nextProposalId.toNumber() - 1;

//                 // Operation
//                 var votingRoundVoteOperation = await governanceInstance.methods.votingRoundVote("yay").send();
//                 await votingRoundVoteOperation.confirmation();

//                 await signerFactory(eve.sk);

//                 votingRoundVoteOperation = await governanceInstance.methods.votingRoundVote("yay").send();
//                 await votingRoundVoteOperation.confirmation();
                
//                 // Final values
//                 governanceStorage       = await governanceInstance.storage();
//                 const proposal          = await governanceStorage.proposalLedger.get(previousProposalId);
//                 const snapshotLedger    = governanceStorage.snapshotLedger
//                 const firstVotingPower  = snapshotLedger.get(alice.pkh);
//                 const secondVotingPower = snapshotLedger.get(eve.pkh);
//                 const totalVotingPower  = firstVotingPower.totalVotingPower.toNumber() + secondVotingPower.totalVotingPower.toNumber()

//                 console.log("PROPOSAL AFTER VOTES")
//                 console.dir(proposal, {depth: 5});
                
//                 console.log("SATELLITES SNAPSHOT")
//                 console.dir(snapshotLedger, {depth: 5})

//                 // Assertion
//                 assert.equal(totalVotingPower, proposal.quorumStakedMvkTotal.toNumber())
//             } catch(e){
//                 console.dir(e, {depth: 5})
//             }
//         })
//     })
// });