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
// import lpTokenAddress from '../deployments/lpTokenAddress.json';
// import farmFactoryAddress from '../deployments/farmFactoryAddress.json'
// import treasuryFactoryAddress from '../deployments/treasuryFactoryAddress.json'
// import farmAddress from '../deployments/farmAddress.json'
// import doormanLambdas from '../build/lambdas/doormanLambdas.json'
// import { MichelsonMap } from "@taquito/taquito";
// import { farmStorageType } from "./types/farmStorageType";

// describe("Governance proxy lambdas tests", async () => {
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
    
//             console.log('-- -- -- -- -- Governance Proxy Tests -- -- -- --')
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
//                 updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configMinimumStakeReqPercentage").send();
//                 await updateGovernanceConfig.confirmation();
//                 updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configMinQuorumPercentage").send();
//                 await updateGovernanceConfig.confirmation();
//                 updateGovernanceConfig      = await governanceInstance.methods.updateConfig(1, "configMinQuorumMvkTotal").send();
//                 await updateGovernanceConfig.confirmation();
//                 updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configMinimumStakeReqPercentage").send();
//                 await updateGovernanceConfig.confirmation();
    
//                 // Register satellites
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
//                 var stakeOperation = await doormanInstance.methods.stake(MVK(100)).send();
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
//                 stakeOperation = await doormanInstance.methods.stake(MVK(100)).send();
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
        
//                 // Set contracts admin to governance proxy
//                 await signerFactory(bob.sk);
//                 governanceStorage               = await governanceInstance.storage();            
//                 const generalContracts          = governanceStorage.generalContracts.entries();
//                 var setAdminOperation           = await governanceInstance.methods.setAdmin(governanceProxyAddress.address).send();
//                 await setAdminOperation.confirmation();
//                 setAdminOperation               = await mvkTokenInstance.methods.setAdmin(governanceProxyAddress.address).send();
//                 await setAdminOperation.confirmation();
//                 setAdminOperation               = await farmInstance.methods.setAdmin(governanceProxyAddress.address).send();
//                 await setAdminOperation.confirmation();
//                 for (let entry of generalContracts){
//                     // Get contract storage
//                     var contract        = await utils.tezos.contract.at(entry[1]);
//                     var storage:any     = await contract.storage();
    
//                     // Check admin
//                     if(storage.hasOwnProperty('admin') && storage.admin!==governanceProxyAddress.address && storage.admin!==breakGlassAddress.address){
//                         setAdminOperation   = await contract.methods.setAdmin(governanceProxyAddress.address).send();
//                         await setAdminOperation.confirmation()
//                     }
//                 }
//             } else {
//                 // Start next round until new proposal round
//                 governanceStorage       = await governanceInstance.storage()
//                 var currentCycleInfoRound        = governanceStorage.currentCycleInfo.round
//                 var currentCycleInfoRoundString  = Object.keys(currentCycleInfoRound)[0]
    
//                 delegationStorage       = await delegationInstance.storage();
//                 console.log(await delegationStorage.satelliteLedger.size);
    
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

//     describe('%setAdmin', function() {

//         it('Non-admin should not be able to call this entrypoint', async () => {
//             try{        

//                 await signerFactory(eve.sk);
//                 await chai.expect(governanceProxyInstance.methods.setAdmin(eve.pkh).send()).to.be.eventually.rejected;

//             } catch(e){
//                 console.log(e);
//             } 
//         }); 
        
//         it('Admin should be able to call this entrypoint and update the contract administrator with a new address', async () => {
//             try{        

//                 await signerFactory(bob.sk);
//                 const setAdminOperation = await governanceProxyInstance.methods.setAdmin(eve.pkh).send();
//                 await setAdminOperation.confirmation();

//                 governanceProxyStorage   = await governanceProxyInstance.storage();            
//                 assert.equal(governanceProxyStorage.admin, eve.pkh);

//                 // reset treasury admin to bob
//                 await signerFactory(eve.sk);
//                 const resetAdminOperation = await governanceProxyInstance.methods.setAdmin(bob.pkh).send();
//                 await resetAdminOperation.confirmation();

//                 governanceProxyStorage   = await governanceProxyInstance.storage();            
//                 assert.equal(governanceProxyStorage.admin, bob.pkh);

//             } catch(e){
//                 console.log(e);
//             } 
//         });
//     })

//     describe('%updateMetadata', function() {

//         it('Non-admin should not be able to call this entrypoint', async () => {
//             try{
//                 // Initial values
//                 const key   = ''
//                 const hash  = Buffer.from('tezos-storage:dato', 'ascii').toString('hex')

//                 // Operation
//                 await signerFactory(eve.sk);
//                 await chai.expect(governanceProxyInstance.methods.updateMetadata(key,hash).send()).to.be.eventually.rejected;

//             } catch(e){
//                 console.log(e);
//             } 
//         }); 
        
//         it('Admin should be able to call this entrypoint', async () => {
//             try{
//                 // Initial values
//                 const key   = ''
//                 const hash  = Buffer.from('tezos-storage:dato', 'ascii').toString('hex')

//                 // Operation
//                 await signerFactory(bob.sk);
//                 const updateOperation = await governanceProxyInstance.methods.updateMetadata(key,hash).send();
//                 await updateOperation.confirmation();

//                 // Final values
//                 governanceProxyStorage      = await governanceProxyInstance.storage();            
//                 const updatedData           = await governanceProxyStorage.metadata.get(key);
//                 assert.equal(hash, updatedData);

//             } catch(e){
//                 console.log(e);
//             } 
//         });
//     })

//     describe('%updateWhitelistContracts', function() {

//         it('Non-admin should not be able to call this entrypoint', async () => {
//             try{
//                 // Operation
//                 await signerFactory(eve.sk);
//                 await chai.expect(governanceProxyInstance.methods.updateWhitelistContracts("bob",bob.pkh).send()).to.be.eventually.rejected;

//             } catch(e){
//                 console.log(e);
//             } 
//         }); 
        
//         it('Admin should be able to call this entrypoint', async () => {
//             try{
//                 // Operation
//                 await signerFactory(bob.sk);
//                 const updateOperation = await governanceProxyInstance.methods.updateWhitelistContracts("bob",bob.pkh).send();
//                 await updateOperation.confirmation();

//                 // Final values
//                 governanceProxyStorage      = await governanceProxyInstance.storage();            
//                 const contract              = governanceProxyStorage.whitelistContracts.get("bob");
//                 assert.equal(contract, bob.pkh);

//             } catch(e){
//                 console.log(e);
//             } 
//         });
//     })

//     describe('%updateGeneralContracts', function() {

//         it('Non-admin should not be able to call this entrypoint', async () => {
//             try{
//                 // Operation
//                 await signerFactory(eve.sk);
//                 await chai.expect(governanceProxyInstance.methods.updateGeneralContracts("bob",bob.pkh).send()).to.be.eventually.rejected;

//             } catch(e){
//                 console.log(e);
//             } 
//         }); 
        
//         it('Admin should be able to call this entrypoint', async () => {
//             try{
//                 // Operation
//                 await signerFactory(bob.sk);
//                 const updateOperation = await governanceProxyInstance.methods.updateGeneralContracts("bob",bob.pkh).send();
//                 await updateOperation.confirmation();

//                 // Final values
//                 governanceProxyStorage      = await governanceProxyInstance.storage();            
//                 const contract              = await governanceProxyStorage.generalContracts.get("bob");
//                 assert.equal(contract, bob.pkh);

//             } catch(e){
//                 console.log(e);
//             } 
//         });
//     })

//     describe('%updateWhitelistTokenContracts', function() {

//         it('Non-admin should not be able to call this entrypoint', async () => {
//             try{
//                 // Operation
//                 await signerFactory(eve.sk);
//                 await chai.expect(governanceProxyInstance.methods.updateWhitelistTokenContracts("bob",bob.pkh).send()).to.be.eventually.rejected;

//             } catch(e){
//                 console.log(e);
//             } 
//         }); 
        
//         it('Admin should be able to call this entrypoint', async () => {
//             try{
//                 // Operation
//                 await signerFactory(bob.sk);
//                 const updateOperation = await governanceProxyInstance.methods.updateWhitelistTokenContracts("bob",bob.pkh).send();
//                 await updateOperation.confirmation();

//                 // Final values
//                 governanceProxyStorage      = await governanceProxyInstance.storage();            
//                 const contract              = await governanceProxyStorage.whitelistTokenContracts.get("bob");
//                 assert.equal(contract, bob.pkh);

//             } catch(e){
//                 console.log(e);
//             } 
//         });
//     })

//     describe("%processProposalSingleData", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("User should be able to execute the proposal data one by one (execution is in FILO)", async() => {
//             try{
//                 // Initial values
//                 governanceStorage           = await governanceInstance.storage();
//                 farmFactoryStorage          = await farmFactoryInstance.storage();
//                 mvkTokenStorage             = await mvkTokenInstance.storage();
//                 const proposalId            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName          = "Update maxSatellites";
//                 const proposalDesc          = "Details about new proposal";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";

//                 // Update general map compiled params
//                 const firstLambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'updateDelegationConfig',
//                     23,
//                     'configMaxSatellites'
//                 ).toTransferParams();
//                 const firstLambdaParamsValue = firstLambdaParams.parameter.value;
//                 const firstProxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const firstReferenceDataPacked = await utils.tezos.rpc.packData({
//                     data: firstLambdaParamsValue,
//                     type: firstProxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var firstPackedParam;
//                 if (firstReferenceDataPacked) {
//                     firstPackedParam = firstReferenceDataPacked.packed
//                     console.log('packed %updateDelegationConfig param: ' + firstPackedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const secondLambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'updateDelegationConfig',
//                     15,
//                     'configMaxSatellites'
//                 ).toTransferParams();
//                 const secondLambdaParamsValue = secondLambdaParams.parameter.value;
//                 const secondProxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const secondReferenceDataPacked = await utils.tezos.rpc.packData({
//                     data: secondLambdaParamsValue,
//                     type: secondProxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var secondPackedParam;
//                 if (secondReferenceDataPacked) {
//                     secondPackedParam = secondReferenceDataPacked.packed
//                     console.log('packed %updateDelegationConfig param: ' + secondPackedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "MaxSatellites#1",
//                         data: firstPackedParam
//                     },
//                     {
//                         title: "MaxSatellites#2",
//                         data: firstPackedParam
//                     },
//                     {
//                         title: "MaxSatellites#3",
//                         data: firstPackedParam
//                     },
//                     {
//                         title: "MaxSatellites#4",
//                         data: firstPackedParam
//                     },
//                     {
//                         title: "MaxSatellites#5",
//                         data: firstPackedParam
//                     },
//                     {
//                         title: "MaxSatellites#6",
//                         data: firstPackedParam
//                     },
//                     {
//                         title: "MaxSatellites#7",
//                         data: firstPackedParam
//                     },
//                     {
//                         title: "MaxSatellites#8",
//                         data: firstPackedParam
//                     },
//                     {
//                         title: "MaxSatellites#9",
//                         data: firstPackedParam
//                     },
//                     {
//                         title: "MaxSatellites#10",
//                         data: secondPackedParam
//                     }
//                 ];

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
//                 await proposeOperation.confirmation();
//                 var addDataOperation = await governanceInstance.methods.updateProposalData(proposalId, "MaxSatellites#11", secondPackedParam).send();
//                 await addDataOperation.confirmation()
//                 addDataOperation = await governanceInstance.methods.updateProposalData(proposalId, "MaxSatellites#5", firstPackedParam).send();
//                 await addDataOperation.confirmation()
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(false).send();
//                 await nextRoundOperation.confirmation();

//                 // Mid values
//                 governanceStorage   = await governanceInstance.storage();
//                 const initProposal  = await governanceStorage.proposalLedger.get(proposalId);

//                 // Process data in batch and check which operation was executed last
//                 const executeSingleDataBatch = await utils.tezos.wallet
//                 .batch()
//                 .withContractCall(governanceInstance.methods.processProposalSingleData())
//                 .withContractCall(governanceInstance.methods.processProposalSingleData())
//                 .withContractCall(governanceInstance.methods.processProposalSingleData())
//                 .withContractCall(governanceInstance.methods.processProposalSingleData())
//                 .withContractCall(governanceInstance.methods.processProposalSingleData())
//                 .withContractCall(governanceInstance.methods.processProposalSingleData())
//                 .withContractCall(governanceInstance.methods.processProposalSingleData())
//                 .withContractCall(governanceInstance.methods.processProposalSingleData())
//                 .withContractCall(governanceInstance.methods.processProposalSingleData())
//                 .withContractCall(governanceInstance.methods.processProposalSingleData())
//                 const processProposalSingleDataBatchOperation = await executeSingleDataBatch.send()
//                 await processProposalSingleDataBatchOperation.confirmation()

//                 // Final values
//                 governanceStorage           = await governanceInstance.storage();
//                 delegationStorage           = await delegationInstance.storage();
//                 const finalProposal         = await governanceStorage.proposalLedger.get(proposalId);
//                 const finalMaxSatellites    = delegationStorage.config.maxSatellites;

//                 console.dir(finalProposal, {depth: 5});

//                 // Assertions
//                 assert.equal(initProposal.executed, false)
//                 assert.equal(finalProposal.executed, true)
//                 assert.equal(finalMaxSatellites.toNumber(), 15)
//             } catch(e){
//                 console.dir(e, {depth:5})
//             }
//         })

//         it("Extra check to see if execution is also in FILO with standard execution", async() => {
//             try{
//                 // Initial values
//                 governanceStorage           = await governanceInstance.storage();
//                 farmFactoryStorage          = await farmFactoryInstance.storage();
//                 mvkTokenStorage             = await mvkTokenInstance.storage();
//                 const proposalId            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName          = "Update maxSatellites";
//                 const proposalDesc          = "Details about new proposal";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";

//                 // Update general map compiled params
//                 const firstLambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'updateDelegationConfig',
//                     30,
//                     'configMaxSatellites'
//                 ).toTransferParams();
//                 const firstLambdaParamsValue = firstLambdaParams.parameter.value;
//                 const firstProxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const firstReferenceDataPacked = await utils.tezos.rpc.packData({
//                     data: firstLambdaParamsValue,
//                     type: firstProxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var firstPackedParam;
//                 if (firstReferenceDataPacked) {
//                     firstPackedParam = firstReferenceDataPacked.packed
//                     console.log('packed %updateDelegationConfig param: ' + firstPackedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const secondLambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'updateDelegationConfig',
//                     35,
//                     'configMaxSatellites'
//                 ).toTransferParams();
//                 const secondLambdaParamsValue = secondLambdaParams.parameter.value;
//                 const secondProxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const secondReferenceDataPacked = await utils.tezos.rpc.packData({
//                     data: secondLambdaParamsValue,
//                     type: secondProxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var secondPackedParam;
//                 if (secondReferenceDataPacked) {
//                     secondPackedParam = secondReferenceDataPacked.packed
//                     console.log('packed %updateDelegationConfig param: ' + secondPackedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "MaxSatellites#1",
//                         data: firstPackedParam
//                     },
//                     {
//                         title: "MaxSatellites#2",
//                         data: firstPackedParam
//                     },
//                     {
//                         title: "MaxSatellites#3",
//                         data: firstPackedParam
//                     },
//                     {
//                         title: "MaxSatellites#4",
//                         data: firstPackedParam
//                     },
//                     {
//                         title: "MaxSatellites#5",
//                         data: firstPackedParam
//                     },
//                     {
//                         title: "MaxSatellites#6",
//                         data: firstPackedParam
//                     },
//                     {
//                         title: "MaxSatellites#7",
//                         data: firstPackedParam
//                     },
//                     {
//                         title: "MaxSatellites#8",
//                         data: firstPackedParam
//                     },
//                     {
//                         title: "MaxSatellites#9",
//                         data: firstPackedParam
//                     },
//                     {
//                         title: "MaxSatellites#10",
//                         data: secondPackedParam
//                     }
//                 ]

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 governanceStorage           = await governanceInstance.storage();

//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage           = await governanceInstance.storage();
//                 delegationStorage           = await delegationInstance.storage();
//                 const finalProposal         = await governanceStorage.proposalLedger.get(proposalId);
//                 const finalMaxSatellites    = delegationStorage.config.maxSatellites;

//                 // Assertions
//                 assert.equal(finalProposal.executed, true)
//                 assert.equal(finalMaxSatellites.toNumber(), 35)
//             } catch(e){
//                 console.dir(e, {depth:5})
//             }
//         })
//     })

//     describe("%updatePaymentData", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("Proposer should be able to add payment data to a proposal", async() => {
//             try{
//                 // Initial values
//                 governanceStorage           = await governanceInstance.storage();
//                 farmFactoryStorage          = await farmFactoryInstance.storage();
//                 mvkTokenStorage             = await mvkTokenInstance.storage();
//                 const proposalId            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName          = "Update maxSatellites";
//                 const proposalDesc          = "Details about new proposal";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";

//                 // Update general map compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'updateDelegationConfig',
//                     23,
//                     'configMaxSatellites'
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %updateDelegationConfig param: ' + packedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "MaxSatellites#1",
//                         data: packedParam
//                     }
//                 ]

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
//                 await proposeOperation.confirmation();

//                 // Mid values
//                 governanceStorage           = await governanceInstance.storage();
//                 const initProposal          = await governanceStorage.proposalLedger.get(proposalId);

//                 // Add proposal data
//                 var addPaymentDataOperation   = await governanceInstance.methods.updatePaymentData(proposalId, "Payment#1", bob.pkh, "fa2", mvkTokenAddress.address, 0, MVK(50)).send()
//                 await addPaymentDataOperation.confirmation();
//                 addPaymentDataOperation   = await governanceInstance.methods.updatePaymentData(proposalId, "Payment#2", eve.pkh, "fa2", mvkTokenAddress.address, 0, MVK(20)).send()
//                 await addPaymentDataOperation.confirmation();

//                 // Final values
//                 governanceStorage           = await governanceInstance.storage();
//                 const finalProposal         = await governanceStorage.proposalLedger.get(proposalId);

//                 // Assertions
//                 assert.notEqual(finalProposal.paymentMetadata, initProposal.paymentMetadata);
//                 assert.notStrictEqual(finalProposal.paymentMetadata.get("0"), undefined);
//                 assert.notStrictEqual(finalProposal.paymentMetadata.get("1"), undefined);
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })

//         it("Non-proposer should not be able to add payment data to a proposal", async() => {
//             try{
//                 // Initial values
//                 governanceStorage           = await governanceInstance.storage();
//                 farmFactoryStorage          = await farmFactoryInstance.storage();
//                 mvkTokenStorage             = await mvkTokenInstance.storage();
//                 const proposalId            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName          = "Update maxSatellites";
//                 const proposalDesc          = "Details about new proposal";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";

//                 // Update general map compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'updateDelegationConfig',
//                     23,
//                     'configMaxSatellites'
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %updateDelegationConfig param: ' + packedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "MaxSatellites#1",
//                         data: packedParam
//                     }
//                 ]

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
//                 await proposeOperation.confirmation();

//                 // Add proposal data
//                 await signerFactory(eve.sk)
//                 await chai.expect(governanceInstance.methods.updatePaymentData(proposalId, "Payment#1", bob.pkh, "fa2", mvkTokenAddress.address, 0, MVK(50)).send()).to.be.rejected;                
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })

//         it("Proposer should not be able to add payment data to a proposal if it is locked", async() => {
//             try{
//                 // Initial values
//                 governanceStorage           = await governanceInstance.storage();
//                 farmFactoryStorage          = await farmFactoryInstance.storage();
//                 mvkTokenStorage             = await mvkTokenInstance.storage();
//                 const proposalId            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName          = "Update maxSatellites";
//                 const proposalDesc          = "Details about new proposal";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";

//                 // Update general map compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'updateDelegationConfig',
//                     23,
//                     'configMaxSatellites'
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %updateDelegationConfig param: ' + packedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "MaxSatellites#1",
//                         data: packedParam
//                     }
//                 ]

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
//                 await proposeOperation.confirmation();
//                 const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
//                 await lockOperation.confirmation();

//                 // Add proposal data
//                 await chai.expect(governanceInstance.methods.updatePaymentData(proposalId, "Payment#1", bob.pkh, "fa2", mvkTokenAddress.address, 0, MVK(50)).send()).to.be.rejected;                
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })
//     })

//     describe("%processProposalPayment", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("Proposer should be able to process the payment after a proposal is successful", async() => {
//             try{
//                 // Initial values
//                 governanceStorage           = await governanceInstance.storage();
//                 farmFactoryStorage          = await farmFactoryInstance.storage();
//                 mvkTokenStorage             = await mvkTokenInstance.storage();
//                 const initSatellites        = delegationStorage.config.maxSatellites;
//                 const initFirstUserMVK      = await mvkTokenStorage.ledger.get(bob.pkh);
//                 const initSecondUserMVK     = await mvkTokenStorage.ledger.get(eve.pkh);
//                 const proposalId            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName          = "Update maxSatellites";
//                 const proposalDesc          = "Details about new proposal";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";
//                 const proposalPaymentData   = [
//                     {
//                         title: "Payment#1",
//                         transaction: {
//                             "to_"    : bob.pkh,
//                             "token"  : {
//                                 "fa2" : {
//                                     "tokenContractAddress" : mvkTokenAddress.address,
//                                     "tokenId" : 0
//                                 }
//                             },
//                             "amount" : MVK(50)
//                         }
//                     },
//                     {
//                         title: "Payment#2",
//                         transaction: {
//                             "to_"    : eve.pkh,
//                             "token"  : {
//                                 "fa2" : {
//                                     "tokenContractAddress" : mvkTokenAddress.address,
//                                     "tokenId" : 0
//                                 }
//                             },
//                             "amount" : MVK(20)
//                         }
//                     }
//                 ];

//                 // Update general map compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'updateDelegationConfig',
//                     23,
//                     'configMaxSatellites'
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %updateDelegationConfig param: ' + packedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "MaxSatellites#1",
//                         data: packedParam
//                     }
//                 ]

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata, proposalPaymentData).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Mid values
//                 governanceStorage           = await governanceInstance.storage();
//                 delegationStorage           = await delegationInstance.storage();
//                 const endSatellites         = delegationStorage.config.maxSatellites;
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);

//                 // Assertions
//                 assert.strictEqual(proposal.executed, true);
//                 assert.notEqual(endSatellites, initSatellites);
//                 assert.equal(endSatellites, 23);

//                 // Process payment data
//                 const processPaymentOperation   = await governanceInstance.methods.processProposalPayment(proposalId).send()
//                 await processPaymentOperation.confirmation();

//                 // Final values
//                 mvkTokenStorage             = await mvkTokenInstance.storage();
//                 const endFirstUserMVK       = await mvkTokenStorage.ledger.get(bob.pkh);
//                 const endSecondUserMVK      = await mvkTokenStorage.ledger.get(eve.pkh);

//                 // Assertions
//                 assert.equal(endFirstUserMVK.toNumber(), initFirstUserMVK.toNumber() + MVK(50))
//                 assert.equal(endSecondUserMVK.toNumber(), initSecondUserMVK.toNumber() + MVK(20))
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })

//         it("Proposer should not be able to process the payment twice", async() => {
//             try{
//                 // Initial values
//                 governanceStorage           = await governanceInstance.storage();
//                 farmFactoryStorage          = await farmFactoryInstance.storage();
//                 const proposalId            = governanceStorage.nextProposalId.toNumber() - 1;
                
//                 // Process payment data
//                 await chai.expect(governanceInstance.methods.processProposalPayment(proposalId).send()).to.be.rejected;
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })

//         it("Proposer should not be able to process the payment if there is no payment data in the proposal", async() => {
//             try{
//                 // Initial values
//                 governanceStorage           = await governanceInstance.storage();
//                 farmFactoryStorage          = await farmFactoryInstance.storage();
//                 mvkTokenStorage             = await mvkTokenInstance.storage();
//                 const initSatellites        = delegationStorage.config.maxSatellites;
//                 const proposalId            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName          = "Update maxSatellites";
//                 const proposalDesc          = "Details about new proposal";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";

//                 // Update general map compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'updateDelegationConfig',
//                     23,
//                     'configMaxSatellites'
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %updateDelegationConfig param: ' + packedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "MaxSatellites#1",
//                         data: packedParam
//                     }
//                 ]

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Mid values
//                 governanceStorage           = await governanceInstance.storage();
//                 delegationStorage           = await delegationInstance.storage();
//                 const endSatellites         = delegationStorage.config.maxSatellites;
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);

//                 // Assertions
//                 assert.strictEqual(proposal.executed, true);
//                 assert.notEqual(endSatellites, initSatellites);
//                 assert.equal(endSatellites, 23);

//                 // Process payment data
//                 await chai.expect(governanceInstance.methods.processProposalPayment(proposalId).send()).to.be.rejected;                
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })

//         it("Non-proposer should be able to process the payment", async() => {
//             try{
//                 // Initial values
//                 governanceStorage           = await governanceInstance.storage();
//                 farmFactoryStorage          = await farmFactoryInstance.storage();
//                 mvkTokenStorage             = await mvkTokenInstance.storage();
//                 const initSatellites        = delegationStorage.config.maxSatellites;
//                 const proposalId            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName          = "Update maxSatellites";
//                 const proposalDesc          = "Details about new proposal";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";
//                 const proposalPaymentData   = [
//                     {
//                         title: "Payment#1",
//                         transaction: {
//                             "to_"    : bob.pkh,
//                             "token"  : {
//                                 "fa2" : {
//                                     "tokenContractAddress" : mvkTokenAddress.address,
//                                     "tokenId" : 0
//                                 }
//                             },
//                             "amount" : MVK(50)
//                         }
//                     },
//                     {
//                         title: "Payment#2",
//                         transaction: {
//                             "to_"    : eve.pkh,
//                             "token"  : {
//                                 "fa2" : {
//                                     "tokenContractAddress" : mvkTokenAddress.address,
//                                     "tokenId" : 0
//                                 }
//                             },
//                             "amount" : MVK(20)
//                         }
//                     }
//                 ];

//                 // Update general map compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'updateDelegationConfig',
//                     23,
//                     'configMaxSatellites'
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %updateDelegationConfig param: ' + packedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "MaxSatellites#1",
//                         data: packedParam
//                     }
//                 ]

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata, proposalPaymentData).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Mid values
//                 governanceStorage           = await governanceInstance.storage();
//                 delegationStorage           = await delegationInstance.storage();
//                 const endSatellites         = delegationStorage.config.maxSatellites;
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);

//                 // Assertions
//                 assert.strictEqual(proposal.executed, true);
//                 assert.notEqual(endSatellites, initSatellites);
//                 assert.equal(endSatellites, 23);

//                 // Process payment data
//                 await signerFactory(eve.sk);
//                 await chai.expect(governanceInstance.methods.processProposalPayment(proposalId).send()).to.be.rejected;                
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })

//         it("Proposer should not be able to process the payment after a proposal is not successful", async() => {
//             try{
//                 // Initial values
//                 governanceStorage           = await governanceInstance.storage();
//                 farmFactoryStorage          = await farmFactoryInstance.storage();
//                 mvkTokenStorage             = await mvkTokenInstance.storage();
//                 const proposalId            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName          = "Update nothing";
//                 const proposalDesc          = "Details about new proposal";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";
//                 const proposalPaymentData   = [
//                     {
//                         title: "Payment#1",
//                         transaction: {
//                             "to_"    : bob.pkh,
//                             "token"  : {
//                                 "fa2" : {
//                                     "tokenContractAddress" : mvkTokenAddress.address,
//                                     "tokenId" : 0
//                                 }
//                             },
//                             "amount" : MVK(50)
//                         }
//                     },
//                     {
//                         title: "Payment#2",
//                         transaction: {
//                             "to_"    : eve.pkh,
//                             "token"  : {
//                                 "fa2" : {
//                                     "tokenContractAddress" : mvkTokenAddress.address,
//                                     "tokenId" : 0
//                                 }
//                             },
//                             "amount" : MVK(20)
//                         }
//                     }
//                 ];

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, null, proposalPaymentData).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 await chai.expect(governanceInstance.methods.startNextRound(true).send()).to.be.rejected;
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(false).send();
//                 await nextRoundOperation.confirmation();

//                 // Mid values
//                 governanceStorage           = await governanceInstance.storage();
//                 delegationStorage           = await delegationInstance.storage();
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);

//                 // Assertions
//                 assert.strictEqual(proposal.executed, false);

//                 // Process payment data
//                 await chai.expect(governanceInstance.methods.processProposalPayment(proposalId).send()).to.be.rejected;
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })
//     })

//     describe("%createFarm", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("Scenario - Creation of a single farm", async() => {
//             try{
//                 // Initial values
//                 governanceStorage           = await governanceInstance.storage();
//                 farmFactoryStorage          = await farmFactoryInstance.storage();
//                 const initTrackedFarms      = await farmFactoryStorage.trackedFarms;
//                 const proposalId            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName          = "Create a farm";
//                 const proposalDesc          = "Details about new proposal";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";

//                 const farmMetadataBase = Buffer.from(
//                     JSON.stringify({
//                     name: 'MAVRYK PLENTY-USDTz Farm',
//                     description: 'MAVRYK Farm Contract',
//                     version: 'v1.0.0',
//                     liquidityPairToken: {
//                         tokenAddress: ['KT18qSo4Ch2Mfq4jP3eME7SWHB8B8EDTtVBu'],
//                         origin: ['Plenty'],
//                         token0: {
//                             symbol: ['PLENTY'],
//                             tokenAddress: ['KT1GRSvLoikDsXujKgZPsGLX8k8VvR2Tq95b']
//                         },
//                         token1: {
//                             symbol: ['USDtz'],
//                             tokenAddress: ['KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9']
//                         }
//                     },
//                     authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
//                     }),
//                     'ascii',
//                 ).toString('hex')

//                 // Create a farm compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'createFarm',
//                     "testFarm",
//                     false,
//                     false,
//                     false,
//                     12000,
//                     100,
//                     farmMetadataBase,
//                     lpTokenAddress.address,
//                     0,
//                     "fa12",
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %createFarm param: ' + packedParam);
//                 } else {
//                 throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "FirstFarm#1",
//                         data: packedParam
//                     }
//                 ]

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage           = await governanceInstance.storage();
//                 farmFactoryStorage          = await farmFactoryInstance.storage();
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);
//                 const endTrackedFarms       = await farmFactoryStorage.trackedFarms;
                
//                 // Assertions
//                 console.log("TRACKED FARMS: ", endTrackedFarms);
//                 assert.strictEqual(proposal.executed, true);
//                 assert.notEqual(endTrackedFarms.length, initTrackedFarms.length);
//                 aTrackedFarm    = endTrackedFarms[0]
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })

//         it("Scenario - Creation of multiple farms (stress test)", async() => {
//             try{
//                 // Initial values
//                 governanceStorage           = await governanceInstance.storage();
//                 farmFactoryStorage          = await farmFactoryInstance.storage();
//                 const initTrackedFarms      = await farmFactoryStorage.trackedFarms;
//                 const proposalId            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName          = "Create multiple farms";
//                 const proposalDesc          = "Details about new proposal";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";

//                 const farmMetadataBase = Buffer.from(
//                     JSON.stringify({
//                     name: 'MAVRYK PLENTY-USDTz Farm',
//                     description: 'MAVRYK Farm Contract',
//                     version: 'v1.0.0',
//                     liquidityPairToken: {
//                         tokenAddress: ['KT18qSo4Ch2Mfq4jP3eME7SWHB8B8EDTtVBu'],
//                         origin: ['Plenty'],
//                         token0: {
//                             symbol: ['PLENTY'],
//                             tokenAddress: ['KT1GRSvLoikDsXujKgZPsGLX8k8VvR2Tq95b']
//                         },
//                         token1: {
//                             symbol: ['USDtz'],
//                             tokenAddress: ['KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9']
//                         }
//                     },
//                     authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
//                     }),
//                     'ascii',
//                 ).toString('hex')

//                 // Create a farm compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'createFarm',
//                     "testFarm",
//                     false,
//                     false,
//                     false,
//                     12000,
//                     100,
//                     farmMetadataBase,
//                     lpTokenAddress.address,
//                     0,
//                     "fa12",
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %createFarm param: ' + packedParam);
//                 } else {
//                 throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "FirstFarm#1",
//                         data: packedParam
//                     },
//                     {
//                         title: "FirstFarm#2",
//                         data: packedParam
//                     }
//                 ]
                

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 const nextRoundParam        = await governanceInstance.methods.startNextRound(true).toTransferParams();
//                 const estimate              = await utils.tezos.estimate.transfer(nextRoundParam);
//                 console.log("ESTIMATION: ", estimate)

//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage           = await governanceInstance.storage();
//                 farmFactoryStorage          = await farmFactoryInstance.storage();
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);
//                 const endTrackedFarms       = await farmFactoryStorage.trackedFarms;

//                 // Assertions
//                 console.log("TRACKED FARMS: ", endTrackedFarms);
//                 assert.strictEqual(proposal.executed, true);
//                 assert.notEqual(endTrackedFarms.length, initTrackedFarms.length);
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })
//     })

//     describe("%untrackFarm", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("Scenario - Untrack a previously created farm", async() => {
//             try{
//                 // Initial values
//                 governanceStorage           = await governanceInstance.storage();
//                 farmFactoryStorage          = await farmFactoryInstance.storage();
//                 const initTrackedFarms      = await farmFactoryStorage.trackedFarms;
//                 const proposalId            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName          = "Untrack a farm";
//                 const proposalDesc          = "Details about new proposal";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";
                
//                 console.log("INIT TRACKED FARMS: ", initTrackedFarms);
//                 console.log(initTrackedFarms.length)

//                 // Untrack a farm compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'untrackFarm',
//                     aTrackedFarm
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %untrackFarm param: ' + packedParam);
//                 } else {
//                 throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "Untrack#1",
//                         data: packedParam
//                     }
//                 ]

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage           = await governanceInstance.storage();
//                 farmFactoryStorage          = await farmFactoryInstance.storage();
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);
//                 const endTrackedFarms       = await farmFactoryStorage.trackedFarms;
                
//                 // Assertions
//                 console.log("TRACKED FARMS: ", endTrackedFarms);
//                 console.log(endTrackedFarms.length)
//                 assert.strictEqual(proposal.executed, true);
//                 assert.notEqual(endTrackedFarms.length, initTrackedFarms.length);
//                 assert.equal(endTrackedFarms.includes(aTrackedFarm), false);
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })
//     })

//     describe("%trackFarm", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("Scenario - Track the previously untracked farm", async() => {
//             try{
//                 // Initial values
//                 governanceStorage           = await governanceInstance.storage();
//                 farmFactoryStorage          = await farmFactoryInstance.storage();
//                 const initTrackedFarms      = await farmFactoryStorage.trackedFarms;
//                 const proposalId            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName          = "Track a farm";
//                 const proposalDesc          = "Details about new proposal";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";

//                 // Untrack a farm compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'trackFarm',
//                     aTrackedFarm
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %trackFarm param: ' + packedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "Track#1",
//                         data: packedParam
//                     }
//                 ];

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage           = await governanceInstance.storage();
//                 farmFactoryStorage          = await farmFactoryInstance.storage();
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);
//                 const endTrackedFarms       = await farmFactoryStorage.trackedFarms;
                
//                 // Assertions
//                 console.log("TRACKED FARMS: ", endTrackedFarms);
//                 assert.strictEqual(proposal.executed, true);
//                 assert.notEqual(endTrackedFarms.length, initTrackedFarms.length);
//                 assert.equal(endTrackedFarms.includes(aTrackedFarm), true);
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })
//     })

//     describe("%createTreasury", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("Scenario - Creation of a single treasury and send MVK to a user through payment data", async() => {
//             try{
//                 // Initial values
//                 governanceStorage           = await governanceInstance.storage();
//                 treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
//                 const inittrackedTreasuries = await treasuryFactoryStorage.trackedTreasuries;
//                 const proposalId            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName          = "Create a treasury";
//                 const proposalDesc          = "Details about new proposal";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";

//                 const treasuryMetadataBase = Buffer.from(
//                 JSON.stringify({
//                     name: 'MAVRYK PLENTY-USDTz Farm',
//                     description: 'MAVRYK Farm Contract',
//                     version: 'v1.0.0',
//                     liquidityPairToken: {
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
//                     },
//                     authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
//                 }),
//                 'ascii',
//                 ).toString('hex')
                    
//                 // Create a farm compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'createTreasury',
//                     "testTreasuryPropo",
//                     false,
//                     treasuryMetadataBase
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %createTreasury param: ' + packedParam);
//                 } else {
//                 throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "FirstTreasury#1",
//                         data: packedParam
//                     }
//                 ];

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Mid values
//                 governanceStorage           = await governanceInstance.storage();
//                 treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);
//                 const endtrackedTreasuries  = await treasuryFactoryStorage.trackedTreasuries;
                
//                 // Assertions
//                 console.log("TRACKED TREASURIES: ", endtrackedTreasuries);
//                 assert.strictEqual(proposal.executed, true);
//                 assert.notEqual(endtrackedTreasuries.length, inittrackedTreasuries.length);
//                 aTrackedTreasury    = endtrackedTreasuries[0]
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })

//         it("Scenario - Creation of multiple treasuries", async() => {
//             try{
//                 // Initial values
//                 governanceStorage           = await governanceInstance.storage();
//                 treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
//                 const inittrackedTreasuries = await treasuryFactoryStorage.trackedTreasuries;
//                 const proposalId            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName          = "Create a treasury";
//                 const proposalDesc          = "Details about new proposal";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";

//                 const treasuryMetadataBase = Buffer.from(
//                 JSON.stringify({
//                     name: 'MAVRYK PLENTY-USDTz Farm',
//                     description: 'MAVRYK Farm Contract',
//                     version: 'v1.0.0',
//                     liquidityPairToken: {
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
//                     },
//                     authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
//                 }),
//                 'ascii',
//                 ).toString('hex')
                    
//                 // Create a farm compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'createTreasury',
//                     "testTreasuryPropo",
//                     false,
//                     treasuryMetadataBase
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %createTreasury param: ' + packedParam);
//                 } else {
//                 throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "FirstTreasury#1",
//                         data: packedParam
//                     },
//                     {
//                         title: "FirstTreasury#2",
//                         data: packedParam
//                     }
//                 ];

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 const nextRoundParam        = await governanceInstance.methods.startNextRound(true).toTransferParams();
//                 const estimate              = await utils.tezos.estimate.transfer(nextRoundParam);
//                 console.log("ESTIMATION: ", estimate)

//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage           = await governanceInstance.storage();
//                 treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);
//                 const endtrackedTreasuries  = await treasuryFactoryStorage.trackedTreasuries;
                
//                 // Assertions
//                 console.log("TRACKED TREASURIES: ", endtrackedTreasuries);
//                 assert.strictEqual(proposal.executed, true);
//                 assert.notEqual(endtrackedTreasuries.length, inittrackedTreasuries.length);
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })
//     })

//     describe("%untrackTreasury", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("Scenario - Untrack a previously created treasury", async() => {
//             try{
//                 // Initial values
//                 governanceStorage           = await governanceInstance.storage();
//                 treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
//                 const inittrackedTreasuries = await treasuryFactoryStorage.trackedTreasuries;
//                 const proposalId            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName          = "Untrack a farm";
//                 const proposalDesc          = "Details about new proposal";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";
                
//                 console.log("INIT TRACKED TREASURIES: ", inittrackedTreasuries);
//                 console.log(inittrackedTreasuries.length)

//                 // Untrack a farm compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'untrackTreasury',
//                     aTrackedTreasury
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %untrackFarm param: ' + packedParam);
//                 } else {
//                 throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "Untrack#1",
//                         data: packedParam
//                     }
//                 ];

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage           = await governanceInstance.storage();
//                 treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);
//                 const endtrackedTreasuries  = await treasuryFactoryStorage.trackedTreasuries;
                
//                 // Assertions
//                 console.log("TRACKED TREASURIES: ", endtrackedTreasuries);
//                 console.log(endtrackedTreasuries.length)
//                 assert.strictEqual(proposal.executed, true);
//                 assert.notEqual(endtrackedTreasuries.length, inittrackedTreasuries.length);
//                 assert.equal(endtrackedTreasuries.includes(aTrackedTreasury), false);
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })
//     })

//     describe("%trackTreasury", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("Scenario - Track the previously untracked farm", async() => {
//             try{
//                 // Initial values
//                 governanceStorage           = await governanceInstance.storage();
//                 treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
//                 const inittrackedTreasuries = await treasuryFactoryStorage.trackedTreasuries;
//                 const proposalId            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName          = "Track a farm";
//                 const proposalDesc          = "Details about new proposal";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";

//                 // Untrack a farm compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'trackTreasury',
//                     aTrackedTreasury
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %trackFarm param: ' + packedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "Track#1",
//                         data: packedParam
//                     }
//                 ];

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage           = await governanceInstance.storage();
//                 treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);
//                 const endtrackedTreasuries  = await treasuryFactoryStorage.trackedTreasuries;
                
//                 // Assertions
//                 console.log("TRACKED TREASURIES: ", endtrackedTreasuries);
//                 assert.strictEqual(proposal.executed, true);
//                 assert.notEqual(endtrackedTreasuries.length, inittrackedTreasuries.length);
//                 assert.equal(endtrackedTreasuries.includes(aTrackedTreasury), true);
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })
//     })

//     describe("%updateMvkInflationRate", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("Scenario - Update the Mvk Inflation rate", async() => {
//             try{
//                 // Initial values
//                 governanceStorage           = await governanceInstance.storage();
//                 mvkTokenStorage             = await mvkTokenInstance.storage();
//                 const initMVKInflationRate  = mvkTokenStorage.inflationRate;
//                 const proposalId            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName          = "Update MVK Inflation Rate";
//                 const proposalDesc          = "Details about new proposal";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";

//                 // Untrack a farm compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'updateMvkInflationRate',
//                     700
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %updateMvkInflationRate param: ' + packedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "Track#1",
//                         data: packedParam
//                     }
//                 ];

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage           = await governanceInstance.storage();
//                 mvkTokenStorage             = await mvkTokenInstance.storage();
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);
//                 const endMVKInflationRate   = mvkTokenStorage.inflationRate;
                
//                 // Assertions
//                 assert.strictEqual(proposal.executed, true);
//                 assert.notEqual(endMVKInflationRate, initMVKInflationRate);
//                 assert.equal(endMVKInflationRate, 700);
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })
//     })

//     describe("%setContractAdmin", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("Scenario - Set a contract admin to another address", async() => {
//             try{
//                 // Initial values
//                 governanceStorage           = await governanceInstance.storage();
//                 delegationStorage           = await delegationInstance.storage();
//                 const initAdmin             = delegationStorage.admin;
//                 const proposalId            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName          = "Set contract";
//                 const proposalDesc          = "Details about new proposal";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";

//                 // Set a contract admin compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'setContractAdmin',
//                     delegationAddress.address,
//                     alice.pkh,
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %setContractAdmin param: ' + packedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "SetAdmin#1",
//                         data: packedParam
//                     }
//                 ];

//                 //Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage           = await governanceInstance.storage();
//                 delegationStorage           = await delegationInstance.storage();
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);
//                 const endAdmin              = delegationStorage.admin;
                
//                 // Assertions
//                 assert.strictEqual(proposal.executed, true);
//                 assert.notEqual(initAdmin, endAdmin);
//                 assert.equal(endAdmin, alice.pkh);

//                 // Reset the contract admin
//                 await signerFactory(alice.sk);
//                 const resetAdminOperation   = await delegationInstance.methods.setAdmin(governanceProxyAddress.address).send();
//                 await resetAdminOperation.confirmation()
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })
//     })

//     describe("%setContractGovernance", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("Scenario - Set all contracts governance to another address (same address for the tests)", async() => {
//             try{
//                 // Initial values
//                 governanceStorage           = await governanceInstance.storage();
//                 governanceProxyStorage      = await governanceProxyInstance.storage();
//                 const generalContracts      = governanceStorage.generalContracts.entries();
//                 const proposalId            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName          = "Set contract";
//                 const proposalDesc          = "Details about new proposal";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";

//                 // Set a contract governance compiled params
//                 const proposalMetadata      = [];
//                 var generalCounter          = 0;
//                 for (let entry of generalContracts){
//                     // Get contract storage
//                     var contract        = await utils.tezos.contract.at(entry[1]);
//                     var storage:any     = await contract.storage();

//                     var entryName       = "Governance#"+generalCounter

//                     // Check admin
//                     if(storage.hasOwnProperty('governanceAddress')){
//                         var lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                             'setContractGovernance',
//                             entry[1],
//                             governanceAddress.address,
//                         ).toTransferParams();
//                         var lambdaParamsValue = lambdaParams.parameter.value;
//                         var proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
        
//                         var referenceDataPacked = await utils.tezos.rpc.packData({
//                             data: lambdaParamsValue,
//                             type: proxyDataPackingHelperType
//                         }).catch(e => console.error('error:', e));
        
//                         var packedParam;
//                         if (referenceDataPacked) {
//                             packedParam = referenceDataPacked.packed
//                             console.log('packed %setContractGovernance param: ' + packedParam);
//                         } else {
//                             throw `packing failed`
//                         };

//                         // Add new setGovernance data
//                         proposalMetadata[generalCounter] = {
//                             title: entryName, 
//                             data: packedParam
//                         }
//                         generalCounter++;
//                     }
//                 }

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage           = await governanceInstance.storage();
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);
                
//                 // Assertions
//                 assert.strictEqual(proposal.executed, true);
//                 for (let entry of generalContracts){
//                     // Get contract storage
//                     var contract        = await utils.tezos.contract.at(entry[1]);
//                     var storage:any     = await contract.storage();

//                     // Check admin
//                     if(storage.hasOwnProperty('governanceAddress')){
//                         assert.strictEqual(storage.governanceAddress, governanceAddress.address);
//                     }
//                 }
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })
//     })

//     describe("%updateContractMetadata", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("Scenario - Update version of the doorman contract", async() => {
//             try{
//                 // Initial values
//                 governanceStorage           = await governanceInstance.storage();
//                 doormanStorage              = await doormanInstance.storage();
//                 const initMetadata          = await doormanStorage.metadata.get("data");
//                 const proposalId            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName          = "Update metadata";
//                 const proposalDesc          = "Details about new proposal";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";

//                 const newMetadata           = Buffer.from(
//                     JSON.stringify({
//                     name: 'MAVRYK Doorman Contract',
//                     version: 'v1.0.1',
//                     authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
//                     source: {
//                         tools: ['Ligo', 'Flextesa'],
//                         location: 'https://ligolang.org/',
//                     },
//                     }),
//                     'ascii',
//                 ).toString('hex')

//                 // Set a contract governance compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'updateContractMetadata',
//                     doormanAddress.address,
//                     "data",
//                     newMetadata
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %updateContractMetadata param: ' + packedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "Metadata#1",
//                         data: packedParam
//                     }
//                 ];

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();
<<<<<<< HEAD

=======
>>>>>>> 98e53109fdf7adf19ebdf1975d12dd77342727b9
//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage           = await governanceInstance.storage();
//                 doormanStorage              = await doormanInstance.storage();
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);
//                 const endMetadata           = await doormanStorage.metadata.get("data");

//                 // Assertions
//                 assert.strictEqual(proposal.executed, true);
//                 assert.notStrictEqual(endMetadata, initMetadata);
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })
//     })

//     describe("%updateContractWhitelistMap", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("Scenario - Add a new address to the delegation contract whitelist map", async() => {
//             try{
//                 // Initial values
//                 governanceStorage           = await governanceInstance.storage();
//                 delegationStorage           = await delegationInstance.storage();
//                 const initWhitelist         = delegationStorage.whitelistContracts;
//                 const proposalId            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName          = "Update whitelist";
//                 const proposalDesc          = "Details about new proposal";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";

//                 // Update whitelist map compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'updateContractWhitelistMap',
//                     delegationAddress.address,
//                     "bob",
//                     bob.pkh
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %updateContractWhitelistMap param: ' + packedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "Whitelist#1",
//                         data: packedParam
//                     }
//                 ];

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage           = await governanceInstance.storage();
//                 delegationStorage           = await delegationInstance.storage();
//                 const endWhitelist          = delegationStorage.whitelistContracts;
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);

//                 // Assertions
//                 assert.strictEqual(proposal.executed, true);
//                 assert.notStrictEqual(endWhitelist.size, initWhitelist.size);
//                 assert.strictEqual(endWhitelist.get("bob"), bob.pkh);
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })
//     })

//     describe("%updateContractGeneralMap", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("Scenario - Add a new address to the delegation contract whitelist map", async() => {
//             try{
//                 // Initial values
//                 governanceStorage           = await governanceInstance.storage();
//                 delegationStorage           = await delegationInstance.storage();
//                 const initGeneral           = delegationStorage.generalContracts;
//                 const proposalId            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName          = "Update general";
//                 const proposalDesc          = "Details about new proposal";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";

//                 // Update general map compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'updateContractGeneralMap',
//                     delegationAddress.address,
//                     "bob",
//                     bob.pkh
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %updateContractGeneralMap param: ' + packedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "General#1",
//                         data: packedParam
//                     }
//                 ];

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage           = await governanceInstance.storage();
//                 delegationStorage           = await delegationInstance.storage();
//                 const endGeneral            = delegationStorage.generalContracts;
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);

//                 // Assertions
//                 assert.strictEqual(proposal.executed, true);
//                 assert.notStrictEqual(endGeneral.size, initGeneral.size);
//                 assert.strictEqual(endGeneral.get("bob"), bob.pkh);
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })
//     })

//     describe("%updateContractWhitelistTokenMap", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("Scenario - Add a new token to the treasury factory contract whitelist tokens map", async() => {
//             try{
//                 // Initial values
//                 governanceStorage           = await governanceInstance.storage();
//                 treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
//                 const initWhitelist         = await treasuryFactoryStorage.whitelistTokenContracts;
//                 const proposalId            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName          = "Update whitelist tokens";
//                 const proposalDesc          = "Details about new proposal";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";

//                 // Update general map compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'updateContractWhitelistTokenMap',
//                     treasuryFactoryAddress.address,
//                     "bob",
//                     bob.pkh
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %updateContractWhitelistTokenMap param: ' + packedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "Whitelist#1",
//                         data: packedParam
//                     }
//                 ];

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage           = await governanceInstance.storage();
//                 treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
//                 const endWhitelist          = await treasuryFactoryStorage.whitelistTokenContracts;
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);

//                 // Assertions
//                 assert.strictEqual(proposal.executed, true);
//                 assert.notStrictEqual(endWhitelist.size, initWhitelist.size);
//                 assert.strictEqual(endWhitelist.get("bob"), bob.pkh);
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })
//     })

//     describe("%updateWhitelistDevelopersSet", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("Scenario - Add a new developer to the governance developers set", async() => {
//             try{
//                 // Initial values
//                 governanceStorage           = await governanceInstance.storage();
//                 const initWhitelist         = governanceStorage.whitelistDevelopers;
//                 const proposalId            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName          = "Update whitelist developers";
//                 const proposalDesc          = "Details about new proposal";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";

//                 // Update general map compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'updateWhitelistDevelopersSet',
//                     trudy.pkh
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %updateContractWhitelistTokenMap param: ' + packedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "Whitelist#1",
//                         data: packedParam
//                     }
//                 ];

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage           = await governanceInstance.storage();
//                 delegationStorage           = await delegationInstance.storage();
//                 const endWhitelist          = governanceStorage.whitelistDevelopers;
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);

//                 // Assertions
//                 assert.strictEqual(proposal.executed, true);
//                 assert.notStrictEqual(endWhitelist.length, initWhitelist.length);
//                 assert.equal(endWhitelist.includes(trudy.pkh), true);
//                 assert.equal(initWhitelist.includes(trudy.pkh), false);
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })
//     })

//     describe("%updateGovernanceConfig", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("Scenario - Update the governance successReward", async() => {
//             try{
//                 // Initial values
//                 governanceStorage           = await governanceInstance.storage();
//                 const initSuccessReward     = governanceStorage.config.successReward;
//                 const proposalId            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName          = "Update successReward";
//                 const proposalDesc          = "Details about new proposal";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";

//                 // Update general map compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'updateGovernanceConfig',
//                     MVK(10),
//                     'configSuccessReward'
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %updateGovernanceConfig param: ' + packedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "SuccessReward#1",
//                         data: packedParam
//                     }
//                 ];

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage           = await governanceInstance.storage();
//                 const endSuccessReward      = governanceStorage.config.successReward;
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);

//                 // Assertions
//                 assert.strictEqual(proposal.executed, true);
//                 assert.notEqual(endSuccessReward, initSuccessReward);
//                 assert.equal(endSuccessReward, MVK(10));
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })
//     })

//     describe("%updateGovernanceFinancialConfig", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("Scenario - Update the governanceFinancial financialRequestDurationInDays", async() => {
//             try{
//                 // Initial values
//                 governanceStorage                   = await governanceInstance.storage();
//                 governanceFinancialStorage          = await governanceFinancialInstance.storage();
//                 const initDays                      = governanceFinancialStorage.config.financialRequestDurationInDays;
//                 const proposalId                    = governanceStorage.nextProposalId.toNumber();
//                 const proposalName                  = "Update financialRequestDurationInDays";
//                 const proposalDesc                  = "Details about new proposal";
//                 const proposalIpfs                  = "ipfs://QM123456789";
//                 const proposalSourceCode            = "Proposal Source Code";

//                 // Update general map compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'updateGovernanceFinancialConfig',
//                     1,
//                     'configFinancialReqDurationDays'
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %updateGovernanceFinancialConfig param: ' + packedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "Days#1",
//                         data: packedParam
//                     }
//                 ];

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage           = await governanceInstance.storage();
//                 governanceFinancialStorage  = await governanceFinancialInstance.storage();
//                 const endDays               = governanceFinancialStorage.config.financialRequestDurationInDays;
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);

//                 // Assertions
//                 assert.strictEqual(proposal.executed, true);
//                 assert.notEqual(endDays, initDays);
//                 assert.equal(endDays, 1);
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })
//     })

//     describe("%updateDelegationConfig", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("Scenario - Update the delegation maxSatellites", async() => {
//             try{
//                 // Initial values
//                 governanceStorage           = await governanceInstance.storage();
//                 delegationStorage           = await delegationInstance.storage();
//                 const initSatellites        = delegationStorage.config.maxSatellites;
//                 const proposalId            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName          = "Update maxSatellites";
//                 const proposalDesc          = "Details about new proposal";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";

//                 // Update general map compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'updateDelegationConfig',
//                     1234,
//                     'configMaxSatellites'
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %updateDelegationConfig param: ' + packedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "MaxSatellites#1",
//                         data: packedParam
//                     }
//                 ];

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage           = await governanceInstance.storage();
//                 delegationStorage           = await delegationInstance.storage();
//                 const endSatellites         = delegationStorage.config.maxSatellites;
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);

//                 // Assertions
//                 assert.strictEqual(proposal.executed, true);
//                 assert.notEqual(endSatellites, initSatellites);
//                 assert.equal(endSatellites, 1234);
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })
//     })

//     describe("%updateBreakGlassConfig", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("Scenario - Update the break glass actionExpiryDays", async() => {
//             try{
//                 // Initial values
//                 governanceStorage           = await governanceInstance.storage();
//                 breakGlassStorage           = await breakGlassInstance.storage();
//                 const initExpiry            = breakGlassStorage.config.actionExpiryDays;
//                 const proposalId            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName          = "Update actionExpiryDays";
//                 const proposalDesc          = "Details about new proposal";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";

//                 // Update general map compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'updateBreakGlassConfig',
//                     1234,
//                     'configActionExpiryDays'
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %updateBreakGlassConfig param: ' + packedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "ActionExpiryDays#1",
//                         data: packedParam
//                     }
//                 ];

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage           = await governanceInstance.storage();
//                 breakGlassStorage           = await breakGlassInstance.storage();
//                 const endExpiry             = breakGlassStorage.config.actionExpiryDays;
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);

//                 // Assertions
//                 assert.strictEqual(proposal.executed, true);
//                 assert.notEqual(endExpiry, initExpiry);
//                 assert.equal(endExpiry, 1234);
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })
//     })

//     describe("%updateEmergencyConfig", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("Scenario - Update the emergency governance voteExpiryDays", async() => {
//             try{
//                 // Initial values
//                 governanceStorage           = await governanceInstance.storage();
//                 emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
//                 const initExpiry            = emergencyGovernanceStorage.config.voteExpiryDays;
//                 const proposalId            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName          = "Update voteExpiryDays";
//                 const proposalDesc          = "Details about new proposal";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";

//                 // Update general map compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'updateEmergencyConfig',
//                     1234,
//                     'configVoteExpiryDays'
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %updateEmergencyConfig param: ' + packedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "VoteExpiryDays#1",
//                         data: packedParam
//                     }
//                 ];

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage           = await governanceInstance.storage();
//                 emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
//                 const endExpiry             = emergencyGovernanceStorage.config.voteExpiryDays;
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);

//                 // Assertions
//                 assert.strictEqual(proposal.executed, true);
//                 assert.notEqual(endExpiry, initExpiry);
//                 assert.equal(endExpiry, 1234);
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })
//     })

//     describe("%updateCouncilConfig", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("Scenario - Update the council actionExpiryDays", async() => {
//             try{
//                 // Initial values
//                 governanceStorage           = await governanceInstance.storage();
//                 councilStorage              = await councilInstance.storage();
//                 const initExpiry            = councilStorage.config.actionExpiryDays;
//                 const proposalId            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName          = "Update actionExpiryDays";
//                 const proposalDesc          = "Details about new proposal";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";

//                 // Update general map compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'updateCouncilConfig',
//                     1234,
//                     'configActionExpiryDays'
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %updateCouncilConfig param: ' + packedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "ActionExpiryDays#1",
//                         data: packedParam
//                     }
//                 ];

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage           = await governanceInstance.storage();
//                 councilStorage              = await councilInstance.storage();
//                 const endExpiry             = councilStorage.config.actionExpiryDays;
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);

//                 // Assertions
//                 assert.strictEqual(proposal.executed, true);
//                 assert.notEqual(endExpiry, initExpiry);
//                 assert.equal(endExpiry, 1234);
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })
//     })

//     describe("%updateFarmFactoryConfig", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("Scenario - Update the farm factory farm name max length", async() => {
//             try{
//                 // Initial values
//                 governanceStorage           = await governanceInstance.storage();
//                 farmFactoryStorage          = await farmFactoryInstance.storage();
//                 const initMaxLength         = farmFactoryStorage.config.farmNameMaxLength;
//                 const proposalId            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName          = "Update farm name max length";
//                 const proposalDesc          = "Details about new proposal";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";

//                 // Update general map compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'updateFarmFactoryConfig',
//                     1234,
//                     'configFarmNameMaxLength'
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %updateFarmFactoryConfig param: ' + packedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "MaxLength#1",
//                         data: packedParam
//                     }
//                 ];

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage           = await governanceInstance.storage();
//                 farmFactoryStorage          = await farmFactoryInstance.storage();
//                 const endMaxLength          = farmFactoryStorage.config.farmNameMaxLength;
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);

//                 // Assertions
//                 assert.strictEqual(proposal.executed, true);
//                 assert.notEqual(endMaxLength, initMaxLength);
//                 assert.equal(endMaxLength, 1234);
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })
//     })

//     describe("%updateTreasuryFactoryConfig", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("Scenario - Update the treasury factory farm name max length", async() => {
//             try{
//                 // Initial values
//                 governanceStorage           = await governanceInstance.storage();
//                 treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
//                 const initMaxLength         = treasuryFactoryStorage.config.treasuryNameMaxLength;
//                 const proposalId            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName          = "Update treasury name max length";
//                 const proposalDesc          = "Details about new proposal";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";

//                 // Update general map compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'updateTreasuryFactoryConfig',
//                     1234,
//                     'configTreasuryNameMaxLength'
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %updateTreasuryFactoryConfig param: ' + packedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "MaxLength#1",
//                         data: packedParam
//                     }
//                 ];

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage           = await governanceInstance.storage();
//                 treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
//                 const endMaxLength          = treasuryFactoryStorage.config.treasuryNameMaxLength;
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);

//                 // Assertions
//                 assert.strictEqual(proposal.executed, true);
//                 assert.notEqual(endMaxLength, initMaxLength);
//                 assert.equal(endMaxLength, 1234);
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })
//     })

//     describe("%updateDoormanMinMVKAmount", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("Scenario - Update the doorman minMvkAmount", async() => {
//             try{
//                 // Initial values
//                 governanceStorage           = await governanceInstance.storage();
//                 doormanStorage              = await breakGlassInstance.storage();
//                 const initAmount            = doormanStorage.minMvkAmount;
//                 const proposalId            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName          = "Update minMvkAmount";
//                 const proposalDesc          = "Details about new proposal";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";

//                 // Update general map compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'updateDoormanMinMvkAmount',
//                     new BigNumber(MVK(0.01))
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %updateDoormanMinMVKAmount param: ' + packedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "MinMvkAmount#1",
//                         data: packedParam
//                     }
//                 ];

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage           = await governanceInstance.storage();
//                 doormanStorage              = await doormanInstance.storage();
//                 const endAmount             = doormanStorage.minMvkAmount;
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);

//                 // Assertions
//                 assert.strictEqual(proposal.executed, true);
//                 assert.notEqual(endAmount, initAmount);
//                 assert.equal(endAmount.toNumber(), MVK(0.01));
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })
//     })

//     describe("%updateFarmConfig", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("Scenario - Update a farm rewardPerBlock", async() => {
//             try{
//                 // Initial values
//                 governanceStorage                           = await governanceInstance.storage();
//                 const aTrackedFarmInstance                  = await utils.tezos.contract.at(aTrackedFarm);
//                 var aTrackedFarmStorage: farmStorageType    = await aTrackedFarmInstance.storage();
//                 const initReward                            = aTrackedFarmStorage.config.plannedRewards.currentRewardPerBlock;
//                 const proposalId                            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName                          = "Update rewardPerBlock";
//                 const proposalDesc                          = "Details about new proposal";
//                 const proposalIpfs                          = "ipfs://QM123456789";
//                 const proposalSourceCode                    = "Proposal Source Code";

//                 // Update general map compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'updateFarmConfig',
//                     aTrackedFarm,
//                     MVK(123),
//                     'configRewardPerBlock'
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %updateFarmConfig param: ' + packedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "RewardPerBlock#1",
//                         data: packedParam
//                     }
//                 ];

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage           = await governanceInstance.storage();
//                 aTrackedFarmStorage         = await aTrackedFarmInstance.storage();
//                 const endReward             = aTrackedFarmStorage.config.plannedRewards.currentRewardPerBlock;
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);

//                 // Assertions
//                 assert.strictEqual(proposal.executed, true);
//                 assert.notEqual(endReward, initReward);
//                 assert.equal(endReward, MVK(123));
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })
//     })

//     describe("%initFarm", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("Scenario - Initialize a farm", async() => {
//             try{
//                 // Initial values
//                 governanceStorage                   = await governanceInstance.storage();
//                 farmStorage                         = await farmInstance.storage();
//                 const initConfig                    = farmStorage.config;
//                 const proposalId                    = governanceStorage.nextProposalId.toNumber();
//                 const proposalName                  = "Init a farm";
//                 const proposalDesc                  = "Details about new proposal";
//                 const proposalIpfs                  = "ipfs://QM123456789";
//                 const proposalSourceCode            = "Proposal Source Code";

//                 // Update general map compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'initFarm',
//                     farmAddress.address,
//                     100,
//                     MVK(100),
//                     2,
//                     false,
//                     false
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %initFarm param: ' + packedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "InitFarm#1",
//                         data: packedParam
//                     }
//                 ];

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage           = await governanceInstance.storage();
//                 farmStorage                 = await farmInstance.storage();
//                 const endConfig             = farmStorage.config;
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);

//                 // Assertions
//                 assert.strictEqual(proposal.executed, true);
//                 assert.notEqual(endConfig, initConfig);
//                 assert.equal(endConfig.plannedRewards.currentRewardPerBlock, MVK(100));
//                 assert.equal(endConfig.plannedRewards.totalBlocks, 100);
//                 assert.equal(endConfig.infinite, false);
//                 assert.equal(endConfig.blocksPerMinute, 2);
//                 assert.equal(endConfig.forceRewardFromTransfer, false);
//                 assert.equal(farmStorage.init, true);
//                 assert.equal(farmStorage.open, true);
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })
//     })

//     describe("%closeFarm", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("Scenario - Close a farm", async() => {
//             try{
//                 // Initial values
//                 governanceStorage                   = await governanceInstance.storage();
//                 farmStorage                         = await farmInstance.storage();
//                 const initOpen                      = farmStorage.open;
//                 const proposalId                    = governanceStorage.nextProposalId.toNumber();
//                 const proposalName                  = "Close a farm";
//                 const proposalDesc                  = "Details about new proposal";
//                 const proposalIpfs                  = "ipfs://QM123456789";
//                 const proposalSourceCode            = "Proposal Source Code";

//                 // Update general map compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'closeFarm',
//                     farmAddress.address
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %closeFarm param: ' + packedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "CloseFarm#1",
//                         data: packedParam
//                     }
//                 ];

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage           = await governanceInstance.storage();
//                 farmStorage                 = await farmInstance.storage();
//                 const endOpen               = farmStorage.open;
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);

//                 // Assertions
//                 assert.strictEqual(proposal.executed, true);
//                 assert.notEqual(endOpen, initOpen);
//                 assert.equal(endOpen, false);
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })
//     })

//     describe("%transferTreasury", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("Scenario - Transfer MVK from a treasury to a user address", async() => {
//             try{
//                 // Initial values
//                 governanceStorage                   = await governanceInstance.storage();
//                 treasuryStorage                     = await treasuryInstance.storage();
//                 mvkTokenStorage                     = await mvkTokenInstance.storage();
//                 const initUserBalance               = await mvkTokenStorage.ledger.get(bob.pkh);
//                 const initTreasuryBalance           = await mvkTokenStorage.ledger.get(treasuryAddress.address);
//                 const proposalId                    = governanceStorage.nextProposalId.toNumber();
//                 const proposalName                  = "Transfer MVK";
//                 const proposalDesc                  = "Details about new proposal";
//                 const proposalIpfs                  = "ipfs://QM123456789";
//                 const proposalSourceCode            = "Proposal Source Code";

//                 // Update general map compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'transferTreasury',
//                     treasuryAddress.address,
//                     [
//                         {
//                             "to_"    : bob.pkh,
//                             "token"  : {
//                                 "fa2" : {
//                                     "tokenContractAddress" : mvkTokenAddress.address,
//                                     "tokenId" : 0
//                                 }
//                             },
//                             "amount" : MVK(10)
//                         }
//                     ]
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %transferTreasury param: ' + packedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "TransferTreasury#1",
//                         data: packedParam
//                     }
//                 ];

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage           = await governanceInstance.storage();
//                 treasuryStorage             = await treasuryInstance.storage();
//                 mvkTokenStorage             = await mvkTokenInstance.storage();
//                 const endUserBalance        = await mvkTokenStorage.ledger.get(bob.pkh);
//                 const endTreasuryBalance    = await mvkTokenStorage.ledger.get(treasuryAddress.address);
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);

//                 // Assertions
//                 assert.strictEqual(proposal.executed, true);
//                 assert.notEqual(endUserBalance.toNumber(), initUserBalance.toNumber());
//                 assert.notEqual(endTreasuryBalance.toNumber(), initTreasuryBalance.toNumber());
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })
//     })

//     describe("%mintMvkAndTransferTreasury", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("Scenario - Mint and Transfer MVK from a treasury to a user address", async() => {
//             try{
//                 // Initial values
//                 governanceStorage                   = await governanceInstance.storage();
//                 treasuryStorage                     = await treasuryInstance.storage();
//                 mvkTokenStorage                     = await mvkTokenInstance.storage();
//                 const initMVKTotalSupply            = mvkTokenStorage.totalSupply; 
//                 const initUserBalance               = await mvkTokenStorage.ledger.get(bob.pkh);
//                 const proposalId                    = governanceStorage.nextProposalId.toNumber();
//                 const proposalName                  = "Transfer MVK";
//                 const proposalDesc                  = "Details about new proposal";
//                 const proposalIpfs                  = "ipfs://QM123456789";
//                 const proposalSourceCode            = "Proposal Source Code";

//                 // Update general map compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'mintMvkAndTransferTreasury',
//                     treasuryAddress.address,
//                     bob.pkh,
//                     MVK(100)
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %mintMvkAndTransferTreasury param: ' + packedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "MintMvkAndTransferTreasury#1",
//                         data: packedParam
//                     }
//                 ];

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage           = await governanceInstance.storage();
//                 treasuryStorage             = await treasuryInstance.storage();
//                 mvkTokenStorage             = await mvkTokenInstance.storage();
//                 const endMVKTotalSupply     = mvkTokenStorage.totalSupply; 
//                 const endUserBalance        = await mvkTokenStorage.ledger.get(bob.pkh);
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);

//                 // Assertions
//                 assert.strictEqual(proposal.executed, true);
//                 assert.notEqual(endUserBalance.toNumber(), initUserBalance.toNumber());
//                 assert.equal(initUserBalance.toNumber() + MVK(100), endUserBalance.toNumber());
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })
//     })

//     describe("%updateMvkOperatorsTreasury", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("Scenario - Update the treasury operators", async() => {
//             try{
//                 // Initial values
//                 governanceStorage                   = await governanceInstance.storage();
//                 treasuryStorage                     = await treasuryInstance.storage();
//                 const proposalId                    = governanceStorage.nextProposalId.toNumber();
//                 const proposalName                  = "Update operators Treasury";
//                 const proposalDesc                  = "Details about new proposal";
//                 const proposalIpfs                  = "ipfs://QM123456789";
//                 const proposalSourceCode            = "Proposal Source Code";

//                 // Update general map compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'updateMvkOperatorsTreasury',
//                     treasuryAddress.address,
//                     [
//                         {
//                             add_operator: {
//                                 owner: treasuryAddress.address,
//                                 operator: bob.pkh,
//                                 token_id: 0,
//                             },
//                         },
//                     ]
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %updateMvkOperatorsTreasury param: ' + packedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "UpdateMvkOperatorsTreasury#1",
//                         data: packedParam
//                     }
//                 ];

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage           = await governanceInstance.storage();
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);

//                 // Assertions
//                 assert.strictEqual(proposal.executed, true);
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })
//     })


//     describe("%stakeMvkTreasury", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("Scenario - Mint and Transfer MVK from a treasury to a user address", async() => {
//             try{
//                 // Initial values
//                 governanceStorage                   = await governanceInstance.storage();
//                 treasuryStorage                     = await treasuryInstance.storage();
//                 mvkTokenStorage                     = await mvkTokenInstance.storage();
//                 doormanStorage                      = await doormanInstance.storage();
//                 const initTreasuryMVK               = await mvkTokenStorage.ledger.get(treasuryAddress.address);
//                 const initTreasurySMVK              = await doormanStorage.userStakeBalanceLedger.get(treasuryAddress.address);
//                 const proposalId                    = governanceStorage.nextProposalId.toNumber();
//                 const proposalName                  = "Stake MVK";
//                 const proposalDesc                  = "Details about new proposal";
//                 const proposalIpfs                  = "ipfs://QM123456789";
//                 const proposalSourceCode            = "Proposal Source Code";

//                 // Update general map compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'stakeMvkTreasury',
//                     treasuryAddress.address,
//                     MVK(10)
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %stakeMvkTreasury param: ' + packedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "StakeMvkTreasury#1",
//                         data: packedParam
//                     }
//                 ];

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage           = await governanceInstance.storage();
//                 treasuryStorage             = await treasuryInstance.storage();
//                 mvkTokenStorage             = await mvkTokenInstance.storage();
//                 doormanStorage              = await doormanInstance.storage();
//                 const endTreasuryMVK        = await mvkTokenStorage.ledger.get(treasuryAddress.address);
//                 const endTreasurySMVK       = await doormanStorage.userStakeBalanceLedger.get(treasuryAddress.address);
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);

//                 // Assertions
//                 assert.strictEqual(proposal.executed, true);
//                 assert.notEqual(endTreasuryMVK.toNumber(), initTreasuryMVK.toNumber());
//                 assert.strictEqual(initTreasurySMVK, undefined)
//                 assert.notStrictEqual(endTreasurySMVK, undefined)
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })
//     })

//     describe("%unstakeMvkTreasury", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("Scenario - Mint and Transfer MVK from a treasury to a user address", async() => {
//             try{
//                 // Initial values
//                 governanceStorage                   = await governanceInstance.storage();
//                 treasuryStorage                     = await treasuryInstance.storage();
//                 mvkTokenStorage                     = await mvkTokenInstance.storage();
//                 doormanStorage                      = await doormanInstance.storage();
//                 const initTreasuryMVK               = await mvkTokenStorage.ledger.get(treasuryAddress.address);
//                 const initTreasurySMVK              = await doormanStorage.userStakeBalanceLedger.get(treasuryAddress.address);
//                 const proposalId                    = governanceStorage.nextProposalId.toNumber();
//                 const proposalName                  = "Untake MVK";
//                 const proposalDesc                  = "Details about new proposal";
//                 const proposalIpfs                  = "ipfs://QM123456789";
//                 const proposalSourceCode            = "Proposal Source Code";

//                 // Update general map compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'unstakeMvkTreasury',
//                     treasuryAddress.address,
//                     MVK(5)
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %unstakeMvkTreasury param: ' + packedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "UnstakeMvkTreasury#1",
//                         data: packedParam
//                     }
//                 ];

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage           = await governanceInstance.storage();
//                 treasuryStorage             = await treasuryInstance.storage();
//                 mvkTokenStorage             = await mvkTokenInstance.storage();
//                 doormanStorage              = await doormanInstance.storage();
//                 const endTreasuryMVK        = await mvkTokenStorage.ledger.get(treasuryAddress.address);
//                 const endTreasurySMVK       = await doormanStorage.userStakeBalanceLedger.get(treasuryAddress.address);
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);

//                 // Assertions
//                 assert.strictEqual(proposal.executed, true);
//                 assert.notEqual(endTreasuryMVK.toNumber(), initTreasuryMVK.toNumber());
//                 assert.notEqual(endTreasurySMVK.balance.toNumber(), initTreasurySMVK.balance.toNumber());
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })
//     })

//     describe("%setContractLambda", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("Scenario - Update the unstake entrypoint of the doorman contract with a new exit fee calculation", async() => {
//             try{
//                 // Initial values
//                 governanceStorage                   = await governanceInstance.storage();
//                 doormanStorage                      = await doormanInstance.storage();
//                 mvkTokenStorage                     = await mvkTokenInstance.storage();

//                 const firstUserMvkBalance           = await mvkTokenStorage.ledger.get(bob.pkh);
//                 const initMVKTotalSupply            = mvkTokenStorage.totalSupply.toNumber();
//                 const initSMVKTotalSupply           = ((await mvkTokenStorage.ledger.get(doormanAddress.address)) === undefined ? new BigNumber(0) : (await mvkTokenStorage.ledger.get(doormanAddress.address))).toNumber();

//                 const proposalId                    = governanceStorage.nextProposalId.toNumber();
//                 const proposalName                  = "Update the unstake entrypoint of the doorman contract";
//                 const proposalDesc                  = "Details about new proposal";
//                 const proposalIpfs                  = "ipfs://QM123456789";
//                 const proposalSourceCode            = "Proposal Source Code";

//                 const unstakeAmount                 = MVK(50);

//                 // Unstake once to calculate an exit fee and compound with both users to set the new SMVK Total Supply amount
//                 var unstakeOperation    = await doormanInstance.methods.unstake(unstakeAmount).send()
//                 await unstakeOperation.confirmation();
//                 var compoundOperation   = await doormanInstance.methods.compound(bob.pkh).send()
//                 await compoundOperation.confirmation();
//                 compoundOperation   = await doormanInstance.methods.compound(alice.pkh).send()
//                 await compoundOperation.confirmation()

//                 // Refresh the values and calculate the exit fee
//                 mvkTokenStorage                             = await mvkTokenInstance.storage();
//                 doormanStorage                              = await doormanInstance.storage();
//                 const firstRefreshedSMVKTotalSupply         = ((await mvkTokenStorage.ledger.get(doormanAddress.address)) === undefined ? new BigNumber(0) : (await mvkTokenStorage.ledger.get(doormanAddress.address))).toNumber();
//                 const firstRefreshedUserMvkBalance          = await mvkTokenStorage.ledger.get(bob.pkh);
//                 const firstExitFee                          = Math.abs(firstUserMvkBalance.toNumber() + unstakeAmount - firstRefreshedUserMvkBalance.toNumber())
//                 console.log("OLD UNSTAKE EXIT FEE: ", firstExitFee);
//                 console.log("INIT SMVK: ", initSMVKTotalSupply);
//                 console.log("NEW SMVK: ", firstRefreshedSMVKTotalSupply);

//                 // Stake MVK for later use (calculate next exit fee)
//                 const restakeAmount             = Math.abs(firstRefreshedSMVKTotalSupply - initSMVKTotalSupply);
//                 console.log("NEW STAKE AMOUNT: ", restakeAmount);

//                 var stakeOperation              = await doormanInstance.methods.stake(restakeAmount).send()
//                 await stakeOperation.confirmation();

//                 // Refreshed values
//                 mvkTokenStorage                             = await mvkTokenInstance.storage();
//                 doormanStorage                              = await doormanInstance.storage();
//                 const secondRefreshedMVKTotalSupply         = mvkTokenStorage.totalSupply.toNumber();
//                 const secondRefreshedSMVKTotalSupply        = ((await mvkTokenStorage.ledger.get(doormanAddress.address)) === undefined ? new BigNumber(0) : (await mvkTokenStorage.ledger.get(doormanAddress.address))).toNumber();
                
//                 // Assertions
//                 assert.equal(initMVKTotalSupply, secondRefreshedMVKTotalSupply);
//                 assert.equal(initSMVKTotalSupply, secondRefreshedSMVKTotalSupply);

//                 // Update unstake lambda compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'setContractLambda',
//                     doormanAddress.address,
//                     'lambdaUnstake',
//                     doormanLambdas[15]
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %setContractLambda param: ' + packedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "SetContractLambda#1",
//                         data: packedParam
//                     }
//                 ];

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage           = await governanceInstance.storage();
//                 doormanStorage              = await doormanInstance.storage();
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);

//                 // Assertions
//                 assert.strictEqual(proposal.executed, true);
                
//                 // Try the new unstake entrypoint with the updated exit fee reward calculation
//                 mvkTokenStorage                             = await mvkTokenInstance.storage();
//                 doormanStorage                              = await doormanInstance.storage();
//                 const preUnstakeUserMVKBalance              = await mvkTokenStorage.ledger.get(bob.pkh)

//                 var unstakeOperation    = await doormanInstance.methods.unstake(unstakeAmount).send()
//                 await unstakeOperation.confirmation();
//                 var compoundOperation   = await doormanInstance.methods.compound(bob.pkh).send()
//                 await compoundOperation.confirmation();
//                 compoundOperation   = await doormanInstance.methods.compound(alice.pkh).send()
//                 await compoundOperation.confirmation()

//                 // Refresh the values and calculate the exit fee
//                 mvkTokenStorage                             = await mvkTokenInstance.storage();
//                 doormanStorage                              = await doormanInstance.storage();
//                 const finalRefreshedUserMvkBalance          = await mvkTokenStorage.ledger.get(bob.pkh);
//                 const finalExitFee                          = Math.abs(preUnstakeUserMVKBalance.toNumber() + unstakeAmount - finalRefreshedUserMvkBalance.toNumber())
//                 console.log("FINAL EXIT FEE: ", finalExitFee)
//                 assert.notEqual(finalExitFee, firstExitFee)
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })
//     })

//     describe("%setFactoryProductLambda", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("Scenario - Use the deposit entrypoint of the farm contract as the withdraw entrypoint (set from the FarmFactory contract)", async() => {
//             try{
//                 // Initial values
//                 governanceStorage                   = await governanceInstance.storage();
//                 farmFactoryStorage                  = await farmFactoryInstance.storage();
//                 const proposalId                    = governanceStorage.nextProposalId.toNumber();
//                 const proposalName                  = "Use the deposit entrypoint as the withdraw entrypoint";
//                 const proposalDesc                  = "Details about new proposal";
//                 const proposalIpfs                  = "ipfs://QM123456789";
//                 const proposalSourceCode            = "Proposal Source Code";

//                 // Update unstake lambda compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'setFactoryProductLambda',
//                     farmFactoryAddress.address,
//                     'lambdaWithdraw',
//                     farmFactoryStorage.farmLambdaLedger.get("lambdaDeposit")
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %setFactoryProductLambda param: ' + packedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "SetFactoryProductLambda#1",
//                         data: packedParam
//                     }
//                 ];

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage           = await governanceInstance.storage();
//                 farmFactoryStorage          = await farmFactoryInstance.storage();
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);

//                 // Assertions
//                 assert.strictEqual(proposal.executed, true);
//                 assert.equal(farmFactoryStorage.farmLambdaLedger.get("lambdaDeposit"), farmFactoryStorage.farmLambdaLedger.get("lambdaWithdraw"))
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })
//     })

//     describe("%addVestee", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("Scenario - Create a new vestee", async() => {
//             try{
//                 // Initial values
//                 governanceStorage                   = await governanceInstance.storage();
//                 vestingStorage                      = await vestingInstance.storage();
//                 const proposalId                    = governanceStorage.nextProposalId.toNumber();
//                 const proposalName                  = "Use the deposit entrypoint as the withdraw entrypoint";
//                 const proposalDesc                  = "Details about new proposal";
//                 const proposalIpfs                  = "ipfs://QM123456789";
//                 const proposalSourceCode            = "Proposal Source Code";
//                 const cliffInMonths                 = 0;
//                 const vestingInMonths               = 24;
//                 const vesteeAddress                 = eve.pkh;
//                 const totalAllocated                = MVK(20000000);

//                 // Update unstake lambda compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'addVestee',
//                     vesteeAddress, 
//                     totalAllocated, 
//                     cliffInMonths, 
//                     vestingInMonths
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %addVestee param: ' + packedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "AddVestee#1",
//                         data: packedParam
//                     }
//                 ];

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage           = await governanceInstance.storage();
//                 vestingStorage              = await vestingInstance.storage();
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);
//                 const vestee                = await vestingStorage.vesteeLedger.get(vesteeAddress);

//                 // Assertions
//                 assert.strictEqual(proposal.executed, true);
//                 assert.equal(vestee.totalAllocatedAmount, totalAllocated)
//                 assert.equal(vestee.cliffMonths, cliffInMonths)
//                 assert.equal(vestee.vestingMonths, vestingInMonths)
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })
//     })

//     describe("%updateVestee", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("Scenario - Update the previously created vestee", async() => {
//             try{
//                 // Initial values
//                 governanceStorage                   = await governanceInstance.storage();
//                 vestingStorage                      = await vestingInstance.storage();
//                 const proposalId                    = governanceStorage.nextProposalId.toNumber();
//                 const proposalName                  = "Use the deposit entrypoint as the withdraw entrypoint";
//                 const proposalDesc                  = "Details about new proposal";
//                 const proposalIpfs                  = "ipfs://QM123456789";
//                 const proposalSourceCode            = "Proposal Source Code";
//                 const cliffInMonths                 = 2;
//                 const vestingInMonths               = 12;
//                 const vesteeAddress                 = eve.pkh;
//                 const totalAllocated                = MVK(40000000);

//                 // Update unstake lambda compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'updateVestee',
//                     vesteeAddress, 
//                     totalAllocated, 
//                     cliffInMonths, 
//                     vestingInMonths
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %addVestee param: ' + packedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "UpdateVestee#1",
//                         data: packedParam
//                     }
//                 ];

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage           = await governanceInstance.storage();
//                 vestingStorage              = await vestingInstance.storage();
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);
//                 const vestee                = await vestingStorage.vesteeLedger.get(vesteeAddress);

//                 // Assertions
//                 assert.strictEqual(proposal.executed, true);
//                 assert.equal(vestee.totalAllocatedAmount, totalAllocated)
//                 assert.equal(vestee.cliffMonths, cliffInMonths)
//                 assert.equal(vestee.vestingMonths, vestingInMonths)
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })
//     })

//     describe("%toggleVesteeLock", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("Scenario - Lock the previously created vestee", async() => {
//             try{
//                 // Initial values
//                 governanceStorage                   = await governanceInstance.storage();
//                 vestingStorage                      = await vestingInstance.storage();
//                 const proposalId                    = governanceStorage.nextProposalId.toNumber();
//                 const proposalName                  = "Use the deposit entrypoint as the withdraw entrypoint";
//                 const proposalDesc                  = "Details about new proposal";
//                 const proposalIpfs                  = "ipfs://QM123456789";
//                 const proposalSourceCode            = "Proposal Source Code";
//                 const vesteeAddress                 = eve.pkh;

//                 // Update unstake lambda compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'toggleVesteeLock',
//                     vesteeAddress
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %toggleVesteeLock param: ' + packedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "ToggleVesteeLock#1",
//                         data: packedParam
//                     }
//                 ];

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage           = await governanceInstance.storage();
//                 vestingStorage              = await vestingInstance.storage();
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);
//                 const vestee                = await vestingStorage.vesteeLedger.get(vesteeAddress);

//                 // Assertions
//                 assert.strictEqual(proposal.executed, true);
//                 assert.strictEqual(vestee.status, "LOCKED")
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })
//     })

//     describe("%removeVestee", async() => {
//         beforeEach("Set signer to admin", async() => {
//             await signerFactory(bob.sk)
//         })

//         it("Scenario - Remove the previously created vestee", async() => {
//             try{
//                 // Initial values
//                 governanceStorage                   = await governanceInstance.storage();
//                 vestingStorage                      = await vestingInstance.storage();
//                 const proposalId                    = governanceStorage.nextProposalId.toNumber();
//                 const proposalName                  = "Use the deposit entrypoint as the withdraw entrypoint";
//                 const proposalDesc                  = "Details about new proposal";
//                 const proposalIpfs                  = "ipfs://QM123456789";
//                 const proposalSourceCode            = "Proposal Source Code";
//                 const vesteeAddress                 = eve.pkh;

//                 // Update unstake lambda compiled params
//                 const lambdaParams = governanceProxyInstance.methods.dataPackingHelper(
//                     'removeVestee',
//                     vesteeAddress
//                 ).toTransferParams();
//                 const lambdaParamsValue = lambdaParams.parameter.value;
//                 const proxyDataPackingHelperType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                 const referenceDataPacked = await utils.tezos.rpc.packData({
//                     data: lambdaParamsValue,
//                     type: proxyDataPackingHelperType
//                 }).catch(e => console.error('error:', e));

//                 var packedParam;
//                 if (referenceDataPacked) {
//                     packedParam = referenceDataPacked.packed
//                     console.log('packed %removeVestee param: ' + packedParam);
//                 } else {
//                     throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "RemoveVestee#1",
//                         data: packedParam
//                     }
//                 ];

//                 // Start governance rounds
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
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

//                 // Execute proposal
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();

//                 // Final values
//                 governanceStorage           = await governanceInstance.storage();
//                 vestingStorage              = await vestingInstance.storage();
//                 const proposal              = await governanceStorage.proposalLedger.get(proposalId);
//                 const vestee                = await vestingStorage.vesteeLedger.get(vesteeAddress);

//                 // Assertions
//                 assert.strictEqual(proposal.executed, true);
//                 assert.strictEqual(vestee, undefined)
//             } catch(e) {
//                 console.dir(e, {depth:5})
//             }
//         })
//     })
// });
