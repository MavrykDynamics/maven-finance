// const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
// const { InMemorySigner, importKey } = require("@taquito/signer");
// import assert, { ok, rejects, strictEqual } from "assert";
// import { Utils, MVK } from "./helpers/Utils";
// import fs from "fs";
// import { confirmOperation } from "../scripts/confirmation";
// import { BigNumber } from 'bignumber.js'

// const chai = require("chai");
// const chaiAsPromised = require('chai-as-promised');
// chai.use(chaiAsPromised);   
// chai.should();

// import env from "../env";
// import { bob, alice, eve, mallory, oscar, trudy, isaac, david, susie, ivan } from "../scripts/sandbox/accounts";

// import doormanAddress from '../deployments/doormanAddress.json';
// import delegationAddress from '../deployments/delegationAddress.json';
// import mvkTokenAddress from '../deployments/mvkTokenAddress.json';
// import councilAddress from '../deployments/councilAddress.json';
// import governanceAddress from '../deployments/governanceAddress.json';
// import governanceFinancialAddress from '../deployments/governanceFinancialAddress.json';
// import governanceProxyAddress from '../deployments/governanceProxyAddress.json';
// import emergencyGovernanceAddress from '../deployments/emergencyGovernanceAddress.json';
// import breakGlassAddress from '../deployments/breakGlassAddress.json';
// import vestingAddress from '../deployments/vestingAddress.json';
// import treasuryAddress from '../deployments/treasuryAddress.json';
// import mavrykFa12TokenAddress from '../deployments/mavrykFa12TokenAddress.json';
// import farmFactoryAddress from '../deployments/farmFactoryAddress.json'
// import treasuryFactoryAddress from '../deployments/treasuryFactoryAddress.json'
// import farmAddress from '../deployments/farmAddress.json'
// import doormanLambdas from '../build/lambdas/doormanLambdas.json'
// import { MichelsonMap } from "@taquito/taquito";
// import { farmStorageType } from "./types/farmStorageType";
// import { compileLambdaFunction } from "scripts/proxyLambdaFunctionMaker/proxyLambdaFunctionPacker";

// describe("Governance quorum tests", async () => {
//     var utils: Utils;

//     let doormanInstance;
//     let delegationInstance;
//     let mvkTokenInstance;
//     let councilInstance;
//     let governanceInstance;
//     let governanceFinancialInstance;
//     let governanceProxyInstance;
//     let emergencyGovernanceInstance;
//     let breakGlassInstance;
//     let vestingInstance;
//     let treasuryInstance;
//     let farmFactoryInstance;
//     let treasuryFactoryInstance;
//     let farmInstance;

//     let doormanStorage;
//     let delegationStorage;
//     let mvkTokenStorage;
//     let councilStorage;
//     let governanceStorage;
//     let governanceFinancialStorage;
//     let governanceProxyStorage;
//     let emergencyGovernanceStorage;
//     let breakGlassStorage;
//     let vestingStorage;
//     let treasuryStorage;
//     let farmFactoryStorage;
//     let treasuryFactoryStorage;
//     let farmStorage;

//     // For testing purposes
//     var aTrackedFarm;
//     var aTrackedTreasury;
    
//     const signerFactory = async (pk) => {
//         await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
//         return utils.tezos;
//     };

//     before("setup", async () => {
//         try {
//             utils = new Utils();
//             await utils.init(bob.sk);
    
//             doormanInstance    = await utils.tezos.contract.at(doormanAddress.address);
//             delegationInstance    = await utils.tezos.contract.at(delegationAddress.address);
//             mvkTokenInstance   = await utils.tezos.contract.at(mvkTokenAddress.address);
//             councilInstance   = await utils.tezos.contract.at(councilAddress.address);
//             governanceInstance = await utils.tezos.contract.at(governanceAddress.address);
//             governanceFinancialInstance = await utils.tezos.contract.at(governanceFinancialAddress.address);
//             governanceProxyInstance = await utils.tezos.contract.at(governanceProxyAddress.address);
//             emergencyGovernanceInstance    = await utils.tezos.contract.at(emergencyGovernanceAddress.address);
//             breakGlassInstance = await utils.tezos.contract.at(breakGlassAddress.address);
//             vestingInstance = await utils.tezos.contract.at(vestingAddress.address);
//             treasuryInstance = await utils.tezos.contract.at(treasuryAddress.address);
//             farmFactoryInstance = await utils.tezos.contract.at(farmFactoryAddress.address);
//             treasuryFactoryInstance = await utils.tezos.contract.at(treasuryFactoryAddress.address);
//             farmInstance    = await utils.tezos.contract.at(farmAddress.address);
                
//             doormanStorage    = await doormanInstance.storage();
//             delegationStorage    = await delegationInstance.storage();
//             mvkTokenStorage   = await mvkTokenInstance.storage();
//             councilStorage   = await councilInstance.storage();
//             governanceStorage = await governanceInstance.storage();
//             governanceFinancialStorage = await governanceFinancialInstance.storage();
//             governanceProxyStorage = await governanceProxyInstance.storage();
//             emergencyGovernanceStorage = await emergencyGovernanceInstance.storage();
//             breakGlassStorage = await breakGlassInstance.storage();
//             vestingStorage = await vestingInstance.storage();
//             treasuryStorage = await treasuryInstance.storage();
//             farmFactoryStorage  = await farmFactoryInstance.storage();
//             treasuryFactoryStorage  = await treasuryFactoryInstance.storage();
//             farmStorage = await farmInstance.storage();
    
//             console.log('-- -- -- -- -- Governance Quorum Tests -- -- -- --')
//             console.log('Doorman Contract deployed at:', doormanInstance.address);
//             console.log('Delegation Contract deployed at:', delegationInstance.address);
//             console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
//             console.log('Council Contract deployed at:', councilInstance.address);
//             console.log('Governance Contract deployed at:', governanceInstance.address);
//             console.log('Emergency Governance Contract deployed at:', emergencyGovernanceInstance.address);
//             console.log('Break Glass Contract deployed at:', breakGlassInstance.address);
//             console.log('Vesting Contract deployed at:', vestingInstance.address);
//             console.log('Treasury Contract deployed at:', treasuryInstance.address);
//             console.log('Farm Factory Contract deployed at:', farmFactoryAddress.address);
//             console.log('Treasury Factory Contract deployed at:', treasuryFactoryAddress.address);
//             console.log('Farm Contract deployed at:', farmAddress.address);
//             console.log('Bob address: ' + bob.pkh);
//             console.log('Alice address: ' + alice.pkh);
//             console.log('Eve address: ' + eve.pkh);
//             console.log('Mallory address: ' + mallory.pkh);
//             console.log('Oscar address: ' + oscar.pkh);
//             console.log('-- -- -- -- -- -- -- -- --')
    
//             // Check if cycle already started (for retest purposes)
//             const cycleEnd  = governanceStorage.currentCycleInfo.cycleEndLevel;
//             if (cycleEnd == 0) {
//                 // Update governance config for shorter cycles
//                 var updateGovernanceConfig  = await governanceInstance.methods.updateConfig(0, "configBlocksPerProposalRound").send();
//                 await updateGovernanceConfig.confirmation();
//                 updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configBlocksPerVotingRound").send();
//                 await updateGovernanceConfig.confirmation();
//                 updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configBlocksPerTimelockRound").send();
//                 await updateGovernanceConfig.confirmation();
//                 updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configMinProposalRoundVotePct").send();
//                 await updateGovernanceConfig.confirmation();
//                 updateGovernanceConfig      = await governanceInstance.methods.updateConfig(1, "configMinProposalRoundVotesReq").send();
//                 await updateGovernanceConfig.confirmation();
//                 updateGovernanceConfig      = await governanceInstance.methods.updateConfig(1, "configMinQuorumPercentage").send();
//                 await updateGovernanceConfig.confirmation();
//                 updateGovernanceConfig      = await governanceInstance.methods.updateConfig(5100, "configMinYayVotePercentage").send();
//                 await updateGovernanceConfig.confirmation();

//                 // Update council admin for tests
//                 const setAdminOperation = await councilInstance.methods.setAdmin(governanceProxyAddress.address).send()
//                 await setAdminOperation.confirmation()
    
//                 // Register satellites (BOB/ALICE)
//                 var updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//                 {
//                     add_operator: {
//                         owner    : bob.pkh,
//                         operator : doormanAddress.address,
//                         token_id : 0,
//                     },
//                 }])
//                 .send()
//                 await updateOperatorsOperation.confirmation();
//                 var stakeOperation = await doormanInstance.methods.stake(MVK(10000)).send();
//                 await stakeOperation.confirmation();
//                 var registerAsSatelliteOperation = await delegationInstance.methods
//                     .registerAsSatellite(
//                         "Bob", 
//                         "Bob description", 
//                         "Bob image", 
//                         "Bob website",
//                         1000
//                     ).send();
//                 await registerAsSatelliteOperation.confirmation();
    
//                 await signerFactory(alice.sk)
//                 var updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//                 {
//                     add_operator: {
//                         owner    : alice.pkh,
//                         operator : doormanAddress.address,
//                         token_id : 0,
//                     },
//                 }])
//                 .send()
//                 await updateOperatorsOperation.confirmation();
//                 stakeOperation = await doormanInstance.methods.stake(MVK(20000)).send();
//                 await stakeOperation.confirmation();
//                 var registerAsSatelliteOperation = await delegationInstance.methods
//                     .registerAsSatellite(
//                         "Alice", 
//                         "Alice description", 
//                         "Alice image", 
//                         "Alice website",
//                         1000
//                     ).send();
//                 await registerAsSatelliteOperation.confirmation();

//                 // Register delegates (EVE/MALLORY)
//                 await signerFactory(eve.sk)
//                 var updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//                 {
//                     add_operator: {
//                         owner    : eve.pkh,
//                         operator : doormanAddress.address,
//                         token_id : 0,
//                     },
//                 }])
//                 .send()
//                 await updateOperatorsOperation.confirmation();
//                 stakeOperation = await doormanInstance.methods.stake(MVK(1500)).send();
//                 await stakeOperation.confirmation();
//                 var delegateSatelliteOperation = await delegationInstance.methods.delegateToSatellite(eve.pkh, bob.pkh).send();
//                 await delegateSatelliteOperation.confirmation();

//                 await signerFactory(mallory.sk)
//                 var updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//                 {
//                     add_operator: {
//                         owner    : mallory.pkh,
//                         operator : doormanAddress.address,
//                         token_id : 0,
//                     },
//                 }])
//                 .send()
//                 await updateOperatorsOperation.confirmation();
//                 stakeOperation = await doormanInstance.methods.stake(MVK(500)).send();
//                 await stakeOperation.confirmation();
//                 var delegateSatelliteOperation = await delegationInstance.methods.delegateToSatellite(mallory.pkh, alice.pkh).send();
//                 await delegateSatelliteOperation.confirmation();
//             } else {
//                 // Start next round until new proposal round
//                 governanceStorage       = await governanceInstance.storage()
//                 var currentCycleInfoRound        = governanceStorage.currentCycleInfo.round
//                 var currentCycleInfoRoundString  = Object.keys(currentCycleInfoRound)[0]
    
//                 delegationStorage       = await delegationInstance.storage();
    
//                 while(currentCycleInfoRoundString!=="proposal"){
//                     var restartRound                = await governanceInstance.methods.startNextRound(false).send();
//                     await restartRound.confirmation()
//                     governanceStorage               = await governanceInstance.storage()
//                     currentCycleInfoRound                    = governanceStorage.currentCycleInfo.round
//                     currentCycleInfoRoundString              = Object.keys(currentCycleInfoRound)[0]
//                     console.log("Current round: ", currentCycleInfoRoundString)
//                 }
//             }
//         } catch(e){
//             console.dir(e, {depth:5})
//         }
//     });

//     describe("Proposal executed", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("Scenario - Satellites vote only yay and exceed quorum", async() => {
//             try{
//                 // Initial values
//                 governanceStorage           = await governanceInstance.storage();
//                 mvkTokenStorage             = await mvkTokenInstance.storage();
//                 const smvkTotalSupply       = (await mvkTokenStorage.ledger.get(doormanAddress.address)).toNumber()
//                 const proposalId            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName          = "Quorum test";
//                 const proposalDesc          = "Details about new proposal";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";
                
//                 // Update general map compiled params
//                 const lambdaFunction        = await compileLambdaFunction(
//                     'development',
//                     governanceProxyAddress.address,
//                     
//                     'updateConfig',
//                     [
//                         councilAddress.address,
//                         "council",
//                         "ConfigActionExpiryDays",
//                         1234
//                     ]
//                 );

//                 const proposalData      = [
//                     {
//                         addOrSetProposalData: {
//                             title: "ActionExpiryDays#1",
//                             encodedCode: lambdaFunction,
//                             codeDescription: ""
//                         }
//                     }
//                 ]

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
//                 await proposeOperation.confirmation();
                
//                 const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
//                 await lockOperation.confirmation();

//                 var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//                 await voteOperation.confirmation();
//                 await signerFactory(alice.sk);

//                 voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//                 await voteOperation.confirmation();
//                 await signerFactory(bob.sk);

//                 nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 // Votes operation -> both satellites vote
//                 var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
//                 await votingRoundVoteOperation.confirmation();
//                 await signerFactory(alice.sk);

//                 votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
//                 await votingRoundVoteOperation.confirmation();
//                 await signerFactory(bob.sk);

//                 // mid values
//                 governanceStorage                   = await governanceInstance.storage();
//                 var currentCycle                    = governanceStorage.cycleId;
//                 const firstSatelliteSnapshot        = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
//                 const secondSatelliteSnapshot       = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});

//                 // Restart the cycle
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage                   = await governanceInstance.storage();
//                 const firstSatelliteVotingPower     = firstSatelliteSnapshot.totalVotingPower.toNumber();
//                 const secondSatelliteVotingPower    = secondSatelliteSnapshot.totalVotingPower.toNumber();
//                 const totalSatelliteVotingPower     = firstSatelliteVotingPower + secondSatelliteVotingPower;
//                 const proposal                      = await governanceStorage.proposalLedger.get(proposalId);
//                 const minYayVotePercentage          = proposal.minYayVotePercentage.toNumber();
//                 const minQuorumPercentage           = proposal.minQuorumPercentage.toNumber();
//                 const quorumStakedMvkTotal          = proposal.quorumStakedMvkTotal.toNumber();
//                 const minQuorumStakedMvkTotal       = proposal.minQuorumStakedMvkTotal.toNumber();
//                 const minYayVoteRequired            = quorumStakedMvkTotal * minYayVotePercentage / 10000;
//                 const calcMinQuorumStakedMvkTotal   = smvkTotalSupply * minQuorumPercentage / 10000;

//                 // Assertions
//                 // console.log("PROPOSAL: ", proposal);
//                 // console.log("FIRST SNAPSHOT: ", firstSatelliteSnapshot);
//                 // console.log("SECOND SNAPSHOT: ", secondSatelliteSnapshot);
//                 // console.log("SMVK: ", smvkTotalSupply);
//                 assert.equal(minYayVoteRequired < totalSatelliteVotingPower, true)
//                 assert.equal(totalSatelliteVotingPower, quorumStakedMvkTotal)
//                 assert.equal(calcMinQuorumStakedMvkTotal, minQuorumStakedMvkTotal)
//                 assert.equal(proposal.executed, true)
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })

//         it("Scenario - Admin set yayVotePercentage to 20% and satellites vote yay and pass and exceed quorum", async() => {
//             try{
//                 // Initial values
//                 governanceStorage           = await governanceInstance.storage();
//                 mvkTokenStorage             = await mvkTokenInstance.storage();
//                 const smvkTotalSupply       = (await mvkTokenStorage.ledger.get(doormanAddress.address)).toNumber()
//                 const proposalId            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName          = "Quorum test";
//                 const proposalDesc          = "Details about new proposal";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";
                
//                 // Update general map compiled params
//                 const lambdaFunction        = await compileLambdaFunction(
//                     'development',
//                     governanceProxyAddress.address,
//                     
//                     'updateConfig',
//                     [
//                         councilAddress.address,
//                         "council",
//                         "ConfigActionExpiryDays",
//                         1234
//                     ]
//                 );

//                 const proposalData      = [
//                     {
//                         addOrSetProposalData: {
//                             title: "ActionExpiryDays#1",
//                             encodedCode: lambdaFunction,
//                             codeDescription: ""
//                         }
//                     }
//                 ]

//                 // Update min quorum
//                 var updateConfigOperation   = await governanceInstance.methods.updateConfig(1, "configMinQuorumPercentage").send();
//                 await updateConfigOperation.confirmation(); 
                
//                 updateConfigOperation   = await governanceInstance.methods.updateConfig(2000, "configMinYayVotePercentage").send();
//                 await updateConfigOperation.confirmation();


//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
//                 await proposeOperation.confirmation();
                
//                 const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
//                 await lockOperation.confirmation();

//                 var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//                 await voteOperation.confirmation();
//                 await signerFactory(alice.sk);

//                 voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//                 await voteOperation.confirmation();
//                 await signerFactory(bob.sk);

//                 nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 // Votes operation -> both satellites vote
//                 var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
//                 await votingRoundVoteOperation.confirmation();
//                 await signerFactory(alice.sk);

//                 votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("pass").send();
//                 await votingRoundVoteOperation.confirmation();
//                 await signerFactory(bob.sk);

//                 // mid values
//                 governanceStorage                   = await governanceInstance.storage();
//                 var currentCycle                    = governanceStorage.cycleId;
//                 const firstSatelliteSnapshot        = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
//                 const secondSatelliteSnapshot       = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});

//                 // Restart the cycle
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage                   = await governanceInstance.storage();
//                 const firstSatelliteVotingPower     = firstSatelliteSnapshot.totalVotingPower.toNumber();
//                 const secondSatelliteVotingPower    = secondSatelliteSnapshot.totalVotingPower.toNumber();
//                 const totalSatelliteVotingPower     = firstSatelliteVotingPower + secondSatelliteVotingPower;
//                 const proposal                      = await governanceStorage.proposalLedger.get(proposalId);
//                 const minYayVotePercentage          = proposal.minYayVotePercentage.toNumber();
//                 const minQuorumPercentage           = proposal.minQuorumPercentage.toNumber();
//                 const quorumStakedMvkTotal          = proposal.quorumStakedMvkTotal.toNumber();
//                 const minQuorumStakedMvkTotal       = proposal.minQuorumStakedMvkTotal.toNumber();
//                 const minYayVoteRequired            = quorumStakedMvkTotal * minYayVotePercentage / 10000;
//                 const calcMinQuorumStakedMvkTotal   = smvkTotalSupply * minQuorumPercentage / 10000;
                
//                 // Assertions
//                 assert.equal(minYayVoteRequired < totalSatelliteVotingPower, true)
//                 assert.equal(totalSatelliteVotingPower, quorumStakedMvkTotal)
//                 assert.equal(calcMinQuorumStakedMvkTotal, minQuorumStakedMvkTotal)
//                 assert.equal(proposal.executed, true)
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })

//         it("Scenario - Admin set yayVotePercentage to 51% and satellites vote yay and nay and exceed quorum", async() => {
//             try{
//                 // Initial values
//                 governanceStorage           = await governanceInstance.storage();
//                 mvkTokenStorage             = await mvkTokenInstance.storage();
//                 const smvkTotalSupply       = (await mvkTokenStorage.ledger.get(doormanAddress.address)).toNumber()
//                 const proposalId            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName          = "Quorum test";
//                 const proposalDesc          = "Details about new proposal";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";
                
//                 // Update general map compiled params
//                 const lambdaFunction        = await compileLambdaFunction(
//                     'development',
//                     governanceProxyAddress.address,
//                     
//                     'updateConfig',
//                     [
//                         councilAddress.address,
//                         "council",
//                         "ConfigActionExpiryDays",
//                         1234
//                     ]
//                 );

//                 const proposalData      = [
//                     {
//                         addOrSetProposalData: {
//                             title: "ActionExpiryDays#1",
//                             encodedCode: lambdaFunction,
//                             codeDescription: ""
//                         }
//                     }
//                 ]

//                 // Update min quorum
//                 var updateConfigOperation   = await governanceInstance.methods.updateConfig(1, "configMinQuorumPercentage").send();
//                 await updateConfigOperation.confirmation(); 
                
//                 updateConfigOperation   = await governanceInstance.methods.updateConfig(5100, "configMinYayVotePercentage").send();
//                 await updateConfigOperation.confirmation();


//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
//                 await proposeOperation.confirmation();
                
//                 const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
//                 await lockOperation.confirmation();

//                 var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//                 await voteOperation.confirmation();
//                 await signerFactory(alice.sk);

//                 voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//                 await voteOperation.confirmation();
//                 await signerFactory(bob.sk);

//                 nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 // Votes operation -> both satellites vote
//                 var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("nay").send();
//                 await votingRoundVoteOperation.confirmation();
//                 await signerFactory(alice.sk);

//                 votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
//                 await votingRoundVoteOperation.confirmation();
//                 await signerFactory(bob.sk);

//                 // mid values
//                 governanceStorage                   = await governanceInstance.storage();
//                 var currentCycle                    = governanceStorage.cycleId;
//                 const firstSatelliteSnapshot        = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
//                 const secondSatelliteSnapshot       = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});

//                 // Restart the cycle
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage                   = await governanceInstance.storage();
//                 const firstSatelliteVotingPower     = firstSatelliteSnapshot.totalVotingPower.toNumber();
//                 const secondSatelliteVotingPower    = secondSatelliteSnapshot.totalVotingPower.toNumber();
//                 const totalSatelliteVotingPower     = firstSatelliteVotingPower + secondSatelliteVotingPower;
//                 const proposal                      = await governanceStorage.proposalLedger.get(proposalId);
//                 const minYayVotePercentage          = proposal.minYayVotePercentage.toNumber();
//                 const minQuorumPercentage           = proposal.minQuorumPercentage.toNumber();
//                 const quorumStakedMvkTotal          = proposal.quorumStakedMvkTotal.toNumber();
//                 const minQuorumStakedMvkTotal       = proposal.minQuorumStakedMvkTotal.toNumber();
//                 const minYayVoteRequired            = quorumStakedMvkTotal * minYayVotePercentage / 10000;
//                 const calcMinQuorumStakedMvkTotal   = smvkTotalSupply * minQuorumPercentage / 10000;
                
//                 // Assertions
//                 assert.equal(minYayVoteRequired < totalSatelliteVotingPower, true)
//                 assert.equal(totalSatelliteVotingPower, quorumStakedMvkTotal)
//                 assert.equal(calcMinQuorumStakedMvkTotal, minQuorumStakedMvkTotal)
//                 assert.equal(proposal.executed, true)
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })
//     })

//     describe("Proposal not executed", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("Scenario - Satellites vote only yay but does not exceed quorum", async() => {
//             try{
//                 // Initial values
//                 governanceStorage           = await governanceInstance.storage();
//                 mvkTokenStorage             = await mvkTokenInstance.storage();
//                 const smvkTotalSupply       = (await mvkTokenStorage.ledger.get(doormanAddress.address)).toNumber()
//                 const proposalId            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName          = "Quorum test";
//                 const proposalDesc          = "Details about new proposal";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";
                
//                 // Update general map compiled params
//                 const lambdaFunction        = await compileLambdaFunction(
//                     'development',
//                     governanceProxyAddress.address,
//                     
//                     'updateConfig',
//                     [
//                         councilAddress.address,
//                         "council",
//                         "ConfigActionExpiryDays",
//                         1234
//                     ]
//                 );

//                 const proposalData      = [
//                     {
//                         addOrSetProposalData: {
//                             title: "ActionExpiryDays#1",
//                             encodedCode: lambdaFunction,
//                             codeDescription: ""
//                         }
//                     }
//                 ]

//                 // Update min quorum
//                 const updateGovernanceConfig= await governanceInstance.methods.updateConfig(10000, "configMinQuorumPercentage").send();
//                 await updateGovernanceConfig.confirmation();

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
//                 await proposeOperation.confirmation();
                
//                 const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
//                 await lockOperation.confirmation();

//                 var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//                 await voteOperation.confirmation();
//                 await signerFactory(alice.sk);

//                 voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//                 await voteOperation.confirmation();
//                 await signerFactory(bob.sk);

//                 nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 // Votes operation -> both satellites vote
//                 var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
//                 await votingRoundVoteOperation.confirmation();
//                 await signerFactory(alice.sk);

//                 votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
//                 await votingRoundVoteOperation.confirmation();
//                 await signerFactory(bob.sk);

//                 // mid values
//                 governanceStorage                   = await governanceInstance.storage();
//                 var currentCycle                    = governanceStorage.cycleId;
//                 const firstSatelliteSnapshot        = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
//                 const secondSatelliteSnapshot       = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});

//                 // Restart the cycle
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage                   = await governanceInstance.storage();
//                 const firstSatelliteVotingPower     = firstSatelliteSnapshot.totalVotingPower.toNumber();
//                 const secondSatelliteVotingPower    = secondSatelliteSnapshot.totalVotingPower.toNumber();
//                 const totalSatelliteVotingPower     = firstSatelliteVotingPower + secondSatelliteVotingPower;
//                 const proposal                      = await governanceStorage.proposalLedger.get(proposalId);
//                 const minYayVotePercentage          = proposal.minYayVotePercentage.toNumber();
//                 const minQuorumPercentage           = proposal.minQuorumPercentage.toNumber();
//                 const quorumStakedMvkTotal          = proposal.quorumStakedMvkTotal.toNumber();
//                 const minQuorumStakedMvkTotal       = proposal.minQuorumStakedMvkTotal.toNumber();
//                 const minYayVoteRequired            = quorumStakedMvkTotal * minYayVotePercentage / 10000;
//                 const calcMinQuorumStakedMvkTotal   = smvkTotalSupply * minQuorumPercentage / 10000;
                
//                 // Assertions
//                 // console.log("PROPOSAL: ", proposal);
//                 // console.log("FIRST SNAPSHOT: ", firstSatelliteSnapshot);
//                 // console.log("SECOND SNAPSHOT: ", secondSatelliteSnapshot);
//                 // console.log("SMVK: ", smvkTotalSupply);
//                 assert.equal(minYayVoteRequired < totalSatelliteVotingPower, true)
//                 assert.equal(totalSatelliteVotingPower, quorumStakedMvkTotal)
//                 assert.equal(calcMinQuorumStakedMvkTotal, minQuorumStakedMvkTotal)
//                 assert.equal(proposal.executed, false)
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })

//         it("Scenario - Admin set yayVotePercentage to 51% and satellites vote yay and nay and exceed quorum", async() => {
//             try{
//                 // Initial values
//                 governanceStorage           = await governanceInstance.storage();
//                 mvkTokenStorage             = await mvkTokenInstance.storage();
//                 const smvkTotalSupply       = (await mvkTokenStorage.ledger.get(doormanAddress.address)).toNumber()
//                 const proposalId            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName          = "Quorum test";
//                 const proposalDesc          = "Details about new proposal";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";
                
//                 // Update general map compiled params
//                 const lambdaFunction        = await compileLambdaFunction(
//                     'development',
//                     governanceProxyAddress.address,
//                     
//                     'updateConfig',
//                     [
//                         councilAddress.address,
//                         "council",
//                         "ConfigActionExpiryDays",
//                         1234
//                     ]
//                 );

//                 const proposalData      = [
//                     {
//                         addOrSetProposalData: {
//                             title: "ActionExpiryDays#1",
//                             encodedCode: lambdaFunction,
//                             codeDescription: ""
//                         }
//                     }
//                 ]

//                 // Update min quorum
//                 var updateConfigOperation   = await governanceInstance.methods.updateConfig(1, "configMinQuorumPercentage").send();
//                 await updateConfigOperation.confirmation(); 
                
//                 updateConfigOperation   = await governanceInstance.methods.updateConfig(2000, "configMinYayVotePercentage").send();
//                 await updateConfigOperation.confirmation();


//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
//                 await proposeOperation.confirmation();
                
//                 const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
//                 await lockOperation.confirmation();

//                 var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//                 await voteOperation.confirmation();
//                 await signerFactory(alice.sk);

//                 voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//                 await voteOperation.confirmation();
//                 await signerFactory(bob.sk);

//                 nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 // Votes operation -> both satellites vote
//                 var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
//                 await votingRoundVoteOperation.confirmation();
//                 await signerFactory(alice.sk);

//                 votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("nay").send();
//                 await votingRoundVoteOperation.confirmation();
//                 await signerFactory(bob.sk);

//                 // mid values
//                 governanceStorage                   = await governanceInstance.storage();
//                 var currentCycle                    = governanceStorage.cycleId;
//                 const firstSatelliteSnapshot        = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
//                 const secondSatelliteSnapshot       = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});

//                 // Restart the cycle
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage                   = await governanceInstance.storage();
//                 const firstSatelliteVotingPower     = firstSatelliteSnapshot.totalVotingPower.toNumber();
//                 const secondSatelliteVotingPower    = secondSatelliteSnapshot.totalVotingPower.toNumber();
//                 const totalSatelliteVotingPower     = firstSatelliteVotingPower + secondSatelliteVotingPower;
//                 const proposal                      = await governanceStorage.proposalLedger.get(proposalId);
//                 const minYayVotePercentage          = proposal.minYayVotePercentage.toNumber();
//                 const minQuorumPercentage           = proposal.minQuorumPercentage.toNumber();
//                 const quorumStakedMvkTotal          = proposal.quorumStakedMvkTotal.toNumber();
//                 const minQuorumStakedMvkTotal       = proposal.minQuorumStakedMvkTotal.toNumber();
//                 const minYayVoteRequired            = quorumStakedMvkTotal * minYayVotePercentage / 10000;
//                 const calcMinQuorumStakedMvkTotal   = smvkTotalSupply * minQuorumPercentage / 10000;
                
//                 // Assertions
//                 // console.log("PROPOSAL: ", proposal);
//                 // console.log("FIRST SNAPSHOT: ", firstSatelliteSnapshot);
//                 // console.log("SECOND SNAPSHOT: ", secondSatelliteSnapshot);
//                 // console.log("SMVK: ", smvkTotalSupply);
//                 assert.equal(minYayVoteRequired < totalSatelliteVotingPower, true)
//                 assert.equal(totalSatelliteVotingPower, quorumStakedMvkTotal)
//                 assert.equal(calcMinQuorumStakedMvkTotal, minQuorumStakedMvkTotal)
//                 assert.equal(proposal.executed, false)
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })

//         it("Scenario - Admin set yayVotePercentage to 80% and satellites vote yay and pass and exceed quorum", async() => {
//             try{
//                 // Initial values
//                 governanceStorage           = await governanceInstance.storage();
//                 mvkTokenStorage             = await mvkTokenInstance.storage();
//                 const smvkTotalSupply       = (await mvkTokenStorage.ledger.get(doormanAddress.address)).toNumber()
//                 const proposalId            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName          = "Quorum test";
//                 const proposalDesc          = "Details about new proposal";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";
                
//                 // Update general map compiled params
//                 const lambdaFunction        = await compileLambdaFunction(
//                     'development',
//                     governanceProxyAddress.address,
//                     
//                     'updateConfig',
//                     [
//                         councilAddress.address,
//                         "council",
//                         "ConfigActionExpiryDays",
//                         1234
//                     ]
//                 );

//                 const proposalData      = [
//                     {
//                         addOrSetProposalData: {
//                             title: "ActionExpiryDays#1",
//                             encodedCode: lambdaFunction,
//                             codeDescription: ""
//                         }
//                     }
//                 ]

//                 // Update min quorum
//                 var updateConfigOperation   = await governanceInstance.methods.updateConfig(1, "configMinQuorumPercentage").send();
//                 await updateConfigOperation.confirmation(); 
                
//                 updateConfigOperation   = await governanceInstance.methods.updateConfig(8000, "configMinYayVotePercentage").send();
//                 await updateConfigOperation.confirmation();


//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
//                 await proposeOperation.confirmation();
                
//                 const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
//                 await lockOperation.confirmation();

//                 var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//                 await voteOperation.confirmation();
//                 await signerFactory(alice.sk);

//                 voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//                 await voteOperation.confirmation();
//                 await signerFactory(bob.sk);

//                 nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 // Votes operation -> both satellites vote
//                 var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("pass").send();
//                 await votingRoundVoteOperation.confirmation();
//                 await signerFactory(alice.sk);

//                 votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
//                 await votingRoundVoteOperation.confirmation();
//                 await signerFactory(bob.sk);

//                 // mid values
//                 governanceStorage                   = await governanceInstance.storage();
//                 var currentCycle                    = governanceStorage.cycleId;
//                 const firstSatelliteSnapshot        = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
//                 const secondSatelliteSnapshot       = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});

//                 // Restart the cycle
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage                   = await governanceInstance.storage();
//                 const firstSatelliteVotingPower     = firstSatelliteSnapshot.totalVotingPower.toNumber();
//                 const secondSatelliteVotingPower    = secondSatelliteSnapshot.totalVotingPower.toNumber();
//                 const totalSatelliteVotingPower     = firstSatelliteVotingPower + secondSatelliteVotingPower;
//                 const proposal                      = await governanceStorage.proposalLedger.get(proposalId);
//                 const minYayVotePercentage          = proposal.minYayVotePercentage.toNumber();
//                 const minQuorumPercentage           = proposal.minQuorumPercentage.toNumber();
//                 const quorumStakedMvkTotal          = proposal.quorumStakedMvkTotal.toNumber();
//                 const minQuorumStakedMvkTotal       = proposal.minQuorumStakedMvkTotal.toNumber();
//                 const minYayVoteRequired            = quorumStakedMvkTotal * minYayVotePercentage / 10000;
//                 const calcMinQuorumStakedMvkTotal   = smvkTotalSupply * minQuorumPercentage / 10000;
                
//                 // Assertions
//                 // console.log("PROPOSAL: ", proposal);
//                 // console.log("FIRST SNAPSHOT: ", firstSatelliteSnapshot);
//                 // console.log("SECOND SNAPSHOT: ", secondSatelliteSnapshot);
//                 // console.log("SMVK: ", smvkTotalSupply);
//                 assert.equal(minYayVoteRequired < totalSatelliteVotingPower, true)
//                 assert.equal(totalSatelliteVotingPower, quorumStakedMvkTotal)
//                 assert.equal(calcMinQuorumStakedMvkTotal, minQuorumStakedMvkTotal)
//                 assert.equal(proposal.executed, false)
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })
//     })
// });