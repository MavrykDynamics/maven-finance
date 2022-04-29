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
// import { bob, alice, eve, mallory } from "../scripts/sandbox/accounts";

// import doormanAddress from '../deployments/doormanAddress.json';
// import delegationAddress from '../deployments/delegationAddress.json';
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

//     let doormanStorage;
//     let delegationStorage;
//     let mvkTokenStorage;
//     let governanceStorage;
//     let governanceProxyStorage;
//     let emergencyGovernanceStorage;
//     let breakGlassStorage;
    
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
            
//         doormanStorage    = await doormanInstance.storage();
//         delegationStorage = await delegationInstance.storage();
//         mvkTokenStorage   = await mvkTokenInstance.storage();
//         governanceStorage = await governanceInstance.storage();
//         governanceProxyStorage  = await governanceProxyInstance.storage();
//         emergencyGovernanceStorage = await emergencyGovernanceInstance.storage();
//         breakGlassStorage = await breakGlassInstance.storage();

//         console.log('-- -- -- -- -- Governance Tests -- -- -- --')
//         console.log('Doorman Contract deployed at:', doormanInstance.address);
//         console.log('Delegation Contract deployed at:', delegationInstance.address);
//         console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
//         console.log('Governance Contract deployed at:', governanceInstance.address);
//         console.log('Emergency Governance Contract deployed at:', emergencyGovernanceInstance.address);
//         console.log('Bob address: ' + bob.pkh);
//         console.log('Alice address: ' + alice.pkh);
//         console.log('Eve address: ' + eve.pkh);

//         // Init multiple satellites
//         delegationStorage = await delegationInstance.storage();
//         const satelliteMap = await delegationStorage.satelliteLedger;
//         if(satelliteMap.get(eve.pkh) === undefined){
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
//             var stakeOperation = await doormanInstance.methods.stake(MVK(10000)).send();
//             await stakeOperation.confirmation();
            
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
//             stakeOperation = await doormanInstance.methods.stake(MVK(1)).send();
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
//         }

//         // Reset signer
//         await signerFactory(bob.sk)
//     });

//     // it('test pack data', async () => {
//     //     try{        

//     //         console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
//     //         console.log("Test: test pack data") 
//     //         console.log("---") // break

//     //         // const configParams = ["configSuccessReward", 1000];
            
//     //         // const config_wrapped_param = await governanceInstance.methods.updateConfig(
//     //         //     1000, "configSuccessReward"
//     //         // ).toTransferParams();

//     //         // const config_wrapped_param = await governanceInstance.methods.updateConfig("configSuccessReward", 1000).send();
//     //         // await config_wrapped_param.confirmation();
//     //         // console.log(config_wrapped_param);

//     //         // const config_wrapped_param_type = await governanceInstance.entrypoints.entrypoints.updateConfig;
//     //         // console.log(config_wrapped_param_type);

//     //         // const governance_lambda_wrapped_param = governanceInstance.methods.callGovernanceLambda(
//     //         //     {updateGovernanceConfig: [1000, "configSuccessReward"]}
//     //         // ).toTransferParams();

//     //         // const parameterSchema = governanceInstance.parameterSchema.ExtractSignatures();
//     //         // const parameterSchema = governanceInstance.parameterSchema.ExtractSchema();
//     //         // console.log(JSON.stringify(parameterSchema,null,2));
            
//     //         const governance_lambda_wrapped_param = governanceInstance.methods.callGovernanceLambda(
//     //             'updateGovernanceConfig', 1000, 'configSuccessReward'
//     //         ).toTransferParams();
//     //         console.log(governance_lambda_wrapped_param);

//     //         const governance_lambda_wrapped_param_value = governance_lambda_wrapped_param.parameter.value;
//     //         console.log(governance_lambda_wrapped_param_value);

//     //         const config_wrapped_param_type = await governanceInstance.entrypoints.entrypoints.updateConfig;
//     //         console.log(config_wrapped_param_type);

//     //         const call_governance_wrapped_param_type = await governanceInstance.entrypoints.entrypoints.callGovernanceLambda;
//     //         console.log(call_governance_wrapped_param_type);

//     //         const raw_packed = await utils.tezos.rpc.packData({
//     //             data: governance_lambda_wrapped_param_value,
//     //             type: call_governance_wrapped_param_type
//     //         }).catch(e => console.error('error:', e));

//     //         var packed_param;
//     //         if (raw_packed) {
//     //           packed_param = raw_packed.packed
//     //           console.log('packed param: ' + packed_param);
//     //         } else {
//     //           throw `packing failed`
//     //         };

//     //     } catch(e){
//     //         console.dir(e, {depth: 5})
//     //     } 
//     // });

//     // describe("%setAdmin", async () => {
//     //     beforeEach("Set signer to admin", async () => {
//     //         await signerFactory(bob.sk)
//     //     });
//     //     it('Admin should be able to call this entrypoint and update the contract administrator with a new address', async () => {
//     //         try{
//     //             // Initial Values
//     //             governanceStorage = await governanceInstance.storage();
//     //             const currentAdmin = governanceStorage.admin;

//     //             // Operation
//     //             const setAdminOperation = await governanceInstance.methods.setAdmin(alice.pkh).send();
//     //             await setAdminOperation.confirmation();

//     //             // Final values
//     //             governanceStorage = await governanceInstance.storage();
//     //             const newAdmin = governanceStorage.admin;

//     //             // reset admin
//     //             await signerFactory(alice.sk);
//     //             const resetAdminOperation = await governanceInstance.methods.setAdmin(bob.pkh).send();
//     //             await resetAdminOperation.confirmation();

//     //             // Assertions
//     //             assert.notStrictEqual(newAdmin, currentAdmin);
//     //             assert.strictEqual(newAdmin, alice.pkh);
//     //             assert.strictEqual(currentAdmin, bob.pkh);
//     //         } catch(e){
//     //             console.dir(e, {depth: 5})
//     //         }
//     //     });
//     //     it('Non-admin should not be able to call this entrypoint', async () => {
//     //         try{
//     //             // Initial Values
//     //             await signerFactory(alice.sk);
//     //             governanceStorage = await governanceInstance.storage();
//     //             const currentAdmin = governanceStorage.admin;

//     //             // Operation
//     //             await chai.expect(governanceInstance.methods.setAdmin(alice.pkh).send()).to.be.rejected;

//     //             // Final values
//     //             governanceStorage = await governanceInstance.storage();
//     //             const newAdmin = governanceStorage.admin;

//     //             // Assertions
//     //             assert.strictEqual(newAdmin, currentAdmin);
//     //         } catch(e){
//     //             console.dir(e, {depth: 5})
//     //         }
//     //     });
//     // });

//     describe("First Cycle", async () => {
//     // describe("%updateConfig", async () => {
//         //     beforeEach("Set signer to admin", async () => {
//         //         await signerFactory(bob.sk)
//         //     });
//         //     it('Admin should be able to call the entrypoint and configure the success reward', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const newConfigValue = 12000;

//         //             // Operation
//         //             const updateConfigOperation = await governanceInstance.methods.updateConfig(newConfigValue,"configSuccessReward").send();
//         //             await updateConfigOperation.confirmation();

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const updateConfigValue = governanceStorage.config.successReward;

//         //             // Assertions
//         //             assert.equal(updateConfigValue, newConfigValue);
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     });
//         //     it('Admin should be able to call the entrypoint and configure the min proposal round vote percentage required', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const newConfigValue = 10;

//         //             // Operation
//         //             const updateConfigOperation = await governanceInstance.methods.updateConfig(newConfigValue,"configMinProposalRoundVotePct").send();
//         //             await updateConfigOperation.confirmation();

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const updateConfigValue = governanceStorage.config.minProposalRoundVotePercentage;

//         //             // Assertions
//         //             assert.equal(updateConfigValue, newConfigValue);
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     });
//         //     it('Admin should not be able to call the entrypoint and configure the min proposal round vote percentage required if it exceed 100%', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const currentConfigValue = governanceStorage.config.minProposalRoundVotePercentage;
//         //             const newConfigValue = 10001;

//         //             // Operation
//         //             await chai.expect(governanceInstance.methods.updateConfig(newConfigValue,"configMinProposalRoundVotePct").send()).to.be.rejected;

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const updateConfigValue = governanceStorage.config.minProposalRoundVotePercentage;

//         //             // Assertions
//         //             assert.notEqual(newConfigValue, currentConfigValue);
//         //             assert.equal(updateConfigValue.toNumber(), currentConfigValue.toNumber());
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     });
//         //     it('Admin should be able to call the entrypoint and configure the min proposal round votes required', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const newConfigValue = 1;

//         //             // Operation
//         //             const updateConfigOperation = await governanceInstance.methods.updateConfig(newConfigValue,"configMinProposalRoundVotesReq").send();
//         //             await updateConfigOperation.confirmation();

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const updateConfigValue = governanceStorage.config.minProposalRoundVotesRequired;

//         //             // Assertions
//         //             assert.equal(updateConfigValue, newConfigValue);
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     });
//         //     it('Admin should be able to call the entrypoint and configure the min proposal round vote percentage required', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const newConfigValue = 10;

//         //             // Operation
//         //             const updateConfigOperation = await governanceInstance.methods.updateConfig(newConfigValue,"configMinQuorumPercentage").send();
//         //             await updateConfigOperation.confirmation();

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const updateConfigValue = governanceStorage.config.minQuorumPercentage;

//         //             // Assertions
//         //             assert.equal(updateConfigValue, newConfigValue);
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     });
//         //     it('Admin should not be able to call the entrypoint and configure the min proposal round vote percentage required if it exceed 100%', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const currentConfigValue = governanceStorage.config.minQuorumPercentage;
//         //             const newConfigValue = 10001;

//         //             // Operation
//         //             await chai.expect(governanceInstance.methods.updateConfig(newConfigValue,"configMinQuorumPercentage").send()).to.be.rejected;

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const updateConfigValue = governanceStorage.config.minQuorumPercentage;

//         //             // Assertions
//         //             assert.notEqual(newConfigValue, currentConfigValue);
//         //             assert.equal(updateConfigValue.toNumber(), currentConfigValue.toNumber());
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     });
//         //     it('Admin should be able to call the entrypoint and configure the min quorum mvk total required', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const newConfigValue = MVK(2);

//         //             // Operation
//         //             const updateConfigOperation = await governanceInstance.methods.updateConfig(newConfigValue,"configMinQuorumMvkTotal").send();
//         //             await updateConfigOperation.confirmation();

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const updateConfigValue = governanceStorage.config.minQuorumMvkTotal;

//         //             // Assertions
//         //             assert.equal(updateConfigValue, newConfigValue);
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     });
//         //     it('Admin should be able to call the entrypoint and configure the voting power ratio', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const newConfigValue = 10;

//         //             // Operation
//         //             const updateConfigOperation = await governanceInstance.methods.updateConfig(newConfigValue,"configVotingPowerRatio").send();
//         //             await updateConfigOperation.confirmation();

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const updateConfigValue = governanceStorage.config.votingPowerRatio;

//         //             // Assertions
//         //             assert.equal(updateConfigValue, newConfigValue);
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     });
//         //     it('Admin should not be able to call the entrypoint and configure the voting power ratio if it exceed 100%', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const currentConfigValue = governanceStorage.config.votingPowerRatio;
//         //             const newConfigValue = 10001;

//         //             // Operation
//         //             await chai.expect(governanceInstance.methods.updateConfig(newConfigValue,"configVotingPowerRatio").send()).to.be.rejected;

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const updateConfigValue = governanceStorage.config.votingPowerRatio;

//         //             // Assertions
//         //             assert.notEqual(newConfigValue, currentConfigValue);
//         //             assert.equal(updateConfigValue.toNumber(), currentConfigValue.toNumber());
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     });
//         //     it('Admin should be able to call the entrypoint and configure the proposal submission fee', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const newConfigValue = MVK(0.1);

//         //             // Operation
//         //             const updateConfigOperation = await governanceInstance.methods.updateConfig(newConfigValue,"configProposalSubmissionFee").send();
//         //             await updateConfigOperation.confirmation();

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const updateConfigValue = governanceStorage.config.proposalSubmissionFee;

//         //             // Assertions
//         //             assert.equal(updateConfigValue, newConfigValue);
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     });
//         //     it('Admin should be able to call the entrypoint and configure the min sMVK required percentage', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const newConfigValue = 5;

//         //             // Operation
//         //             const updateConfigOperation = await governanceInstance.methods.updateConfig(newConfigValue,"configMinimumStakeReqPercentage").send();
//         //             await updateConfigOperation.confirmation();

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const updateConfigValue = governanceStorage.config.minimumStakeReqPercentage;

//         //             // Assertions
//         //             assert.equal(updateConfigValue, newConfigValue);
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     });
//         //     it('Admin should not be able to call the entrypoint and configure the min sMVK required percentage if it exceed 100%', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const currentConfigValue = governanceStorage.config.minimumStakeReqPercentage;
//         //             const newConfigValue = 10001;

//         //             // Operation
//         //             await chai.expect(governanceInstance.methods.updateConfig(newConfigValue,"configMinimumStakeReqPercentage").send()).to.be.rejected;

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const updateConfigValue = governanceStorage.config.minimumStakeReqPercentage;

//         //             // Assertions
//         //             assert.notEqual(newConfigValue, currentConfigValue);
//         //             assert.equal(updateConfigValue.toNumber(), currentConfigValue.toNumber());
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     });
//         //     it('Admin should be able to call the entrypoint and configure the max proposals per delegate', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const newConfigValue = 1;

//         //             // Operation
//         //             const updateConfigOperation = await governanceInstance.methods.updateConfig(newConfigValue,"configMaxProposalsPerDelegate").send();
//         //             await updateConfigOperation.confirmation();

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const updateConfigValue = governanceStorage.config.maxProposalsPerDelegate;

//         //             // Assertions
//         //             assert.equal(updateConfigValue, newConfigValue);
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     });
//         //     it('Admin should be able to call the entrypoint and configure the blocks per proposal round', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const newConfigValue = 0;

//         //             // Operation
//         //             const updateConfigOperation = await governanceInstance.methods.updateConfig(newConfigValue,"configBlocksPerProposalRound").send();
//         //             await updateConfigOperation.confirmation();

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const updateConfigValue = governanceStorage.config.blocksPerProposalRound;

//         //             // Assertions
//         //             assert.equal(updateConfigValue, newConfigValue);
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     });
//         //     it('Admin should not be able to call the entrypoint and configure the blocks per proposal round if it exceed the maximum round duration', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const currentConfigValue = governanceStorage.config.blocksPerProposalRound;
//         //             const newConfigValue = 1000000000;

//         //             // Operation
//         //             await chai.expect(governanceInstance.methods.updateConfig(newConfigValue,"configBlocksPerProposalRound").send()).to.be.rejected;

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const updateConfigValue = governanceStorage.config.blocksPerProposalRound;

//         //             // Assertions
//         //             assert.notEqual(newConfigValue, currentConfigValue);
//         //             assert.equal(updateConfigValue.toNumber(), currentConfigValue.toNumber());
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     });
//         //     it('Admin should be able to call the entrypoint and configure the blocks per voting round', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const newConfigValue = 0;

//         //             // Operation
//         //             const updateConfigOperation = await governanceInstance.methods.updateConfig(newConfigValue,"configBlocksPerVotingRound").send();
//         //             await updateConfigOperation.confirmation();

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const updateConfigValue = governanceStorage.config.blocksPerVotingRound;

//         //             // Assertions
//         //             assert.equal(updateConfigValue, newConfigValue);
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     });
//         //     it('Admin should not be able to call the entrypoint and configure the blocks per voting round if it exceed the maximum round duration', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const currentConfigValue = governanceStorage.config.blocksPerVotingRound;
//         //             const newConfigValue = 1000000000;

//         //             // Operation
//         //             await chai.expect(governanceInstance.methods.updateConfig(newConfigValue,"configBlocksPerVotingRound").send()).to.be.rejected;

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const updateConfigValue = governanceStorage.config.blocksPerVotingRound;

//         //             // Assertions
//         //             assert.notEqual(newConfigValue, currentConfigValue);
//         //             assert.equal(updateConfigValue.toNumber(), currentConfigValue.toNumber());
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     });
//         //     it('Admin should be able to call the entrypoint and configure the blocks per timelock round', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const newConfigValue = 0;

//         //             // Operation
//         //             const updateConfigOperation = await governanceInstance.methods.updateConfig(newConfigValue,"configBlocksPerTimelockRound").send();
//         //             await updateConfigOperation.confirmation();

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const updateConfigValue = governanceStorage.config.blocksPerTimelockRound;

//         //             // Assertions
//         //             assert.equal(updateConfigValue, newConfigValue);
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     });
//         //     it('Admin should not be able to call the entrypoint and configure the blocks per timelock round if it exceed the maximum round duration', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const currentConfigValue = governanceStorage.config.blocksPerTimelockRound;
//         //             const newConfigValue = 1000000000;

//         //             // Operation
//         //             await chai.expect(governanceInstance.methods.updateConfig(newConfigValue,"configBlocksPerTimelockRound").send()).to.be.rejected;

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const updateConfigValue = governanceStorage.config.blocksPerTimelockRound;

//         //             // Assertions
//         //             assert.notEqual(newConfigValue, currentConfigValue);
//         //             assert.equal(updateConfigValue.toNumber(), currentConfigValue.toNumber());
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     });
//         //     it('Admin should be able to call the entrypoint and configure the financial required approval percentage', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const newConfigValue = 10;

//         //             // Operation
//         //             const updateConfigOperation = await governanceInstance.methods.updateConfig(newConfigValue,"configFinancialReqApprovalPct").send();
//         //             await updateConfigOperation.confirmation();

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const updateConfigValue = governanceStorage.config.financialRequestApprovalPercentage;

//         //             // Assertions
//         //             assert.equal(updateConfigValue, newConfigValue);
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     });
//         //     it('Admin should not be able to call the entrypoint and configure the financial required approval percentage if it exceed 100%', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const currentConfigValue = governanceStorage.config.financialRequestApprovalPercentage;
//         //             const newConfigValue = 10001;

//         //             // Operation
//         //             await chai.expect(governanceInstance.methods.updateConfig(newConfigValue,"configFinancialReqApprovalPct").send()).to.be.rejected;

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const updateConfigValue = governanceStorage.config.financialRequestApprovalPercentage;

//         //             // Assertions
//         //             assert.notEqual(newConfigValue, currentConfigValue);
//         //             assert.equal(updateConfigValue.toNumber(), currentConfigValue.toNumber());
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     });
//         //     it('Admin should be able to call the entrypoint and configure the financial required duration in days', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const newConfigValue = 1;

//         //             // Operation
//         //             const updateConfigOperation = await governanceInstance.methods.updateConfig(newConfigValue,"configFinancialReqDurationDays").send();
//         //             await updateConfigOperation.confirmation();

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const updateConfigValue = governanceStorage.config.financialRequestDurationInDays;

//         //             // Assertions
//         //             assert.equal(updateConfigValue, newConfigValue);
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     });
//         //     it('Non-admin should not be able to call the entrypoint', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const currentConfigValue = governanceStorage.config.financialRequestDurationInDays;
//         //             const newConfigValue = 1;

//         //             // Operation
//         //             await signerFactory(alice.sk)
//         //             await chai.expect(governanceInstance.methods.updateConfig(newConfigValue,"configFinancialReqDurationDays").send()).to.be.rejected;

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const updateConfigValue = governanceStorage.config.financialRequestDurationInDays;

//         //             // Assertions
//         //             assert.equal(updateConfigValue.toNumber(), currentConfigValue.toNumber());
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     });
//         // });

//         // describe("%startNextRound", async () => {
//         //     beforeEach("Set signer to standard user", async () => {
//         //         await signerFactory(eve.sk)
//         //     });

//         //     it('User should be able to start the proposal round if no round has been initiated yet', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const currentRound                       = governanceStorage.currentRound
//         //             const currentRoundString                 = Object.keys(currentRound)[0]
//         //             const currentBlocksPerProposalRound      = governanceStorage.currentBlocksPerProposalRound
//         //             const currentBlocksPerVotingRound        = governanceStorage.currentBlocksPerVotingRound
//         //             const currentBlocksPerTimelockRound      = governanceStorage.currentBlocksPerTimelockRound
//         //             const currentRoundStartLevel             = governanceStorage.currentRoundStartLevel
//         //             const currentRoundEndLevel               = governanceStorage.currentRoundEndLevel
//         //             const currentCycleEndLevel               = governanceStorage.currentCycleEndLevel
//         //             const currentRoundHighestVotedProposalId = governanceStorage.currentRoundHighestVotedProposalId

//         //             // Operation
//         //             const startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//         //             await startNextRoundOperation.confirmation();

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const finalRound                       = governanceStorage.currentRound
//         //             const finalRoundString                 = Object.keys(finalRound)[0]
//         //             const finalBlocksPerProposalRound      = governanceStorage.currentBlocksPerProposalRound
//         //             const finalBlocksPerVotingRound        = governanceStorage.currentBlocksPerVotingRound
//         //             const finalBlocksPerTimelockRound      = governanceStorage.currentBlocksPerTimelockRound
//         //             const finalRoundStartLevel             = governanceStorage.currentRoundStartLevel
//         //             const finalRoundEndLevel               = governanceStorage.currentRoundEndLevel
//         //             const finalCycleEndLevel               = governanceStorage.currentCycleEndLevel
//         //             const finalRoundHighestVotedProposalId = governanceStorage.currentRoundHighestVotedProposalId

//         //             // Assertions
//         //             assert.equal(currentRoundString, "proposal");
//         //             assert.equal(currentBlocksPerProposalRound, 0);
//         //             assert.equal(currentBlocksPerVotingRound, 0);
//         //             assert.equal(currentBlocksPerTimelockRound, 0);
//         //             assert.equal(currentRoundStartLevel, 0);
//         //             assert.equal(currentRoundEndLevel, 0);
//         //             assert.equal(currentCycleEndLevel, 0);
//         //             assert.equal(currentRoundHighestVotedProposalId, 0);

//         //             assert.equal(finalRoundString, "proposal");
//         //             assert.notEqual(finalBlocksPerProposalRound, currentBlocksPerProposalRound);
//         //             assert.notEqual(finalBlocksPerVotingRound, currentBlocksPerVotingRound);
//         //             assert.notEqual(finalBlocksPerTimelockRound, currentBlocksPerTimelockRound);
//         //             assert.notEqual(finalRoundStartLevel, currentRoundStartLevel);
//         //             assert.notEqual(finalRoundEndLevel, currentRoundEndLevel);
//         //             assert.notEqual(finalCycleEndLevel, currentCycleEndLevel);
//         //             assert.notEqual(finalRoundHighestVotedProposalId, currentRoundHighestVotedProposalId);
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     })

//         //     it('User should be able to restart the proposal round from the proposal round if no proposals were submitted', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const currentRound                       = governanceStorage.currentRound
//         //             const currentRoundString                 = Object.keys(currentRound)[0]

//         //             // Operation
//         //             const startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//         //             await startNextRoundOperation.confirmation();

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const finalRound                       = governanceStorage.currentRound
//         //             const finalRoundString                 = Object.keys(finalRound)[0]

//         //             // Assertions
//         //             assert.equal(currentRoundString, "proposal");
//         //             assert.equal(finalRoundString, "proposal");
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     })

//         //     it('User should be able to restart the proposal round from the proposal round if no proposal received enough votes', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const currentRound                       = governanceStorage.currentRound
//         //             const currentRoundString                 = Object.keys(currentRound)[0]

//         //             delegationStorage   = await delegationInstance.storage();
//         //             const proposalId            = governanceStorage.nextProposalId.toNumber();
//         //             const proposalName          = "New Proposal #1";
//         //             const proposalDesc          = "Details about new proposal #1";
//         //             const proposalIpfs          = "ipfs://QM123456789";
//         //             const proposalSourceCode    = "Proposal Source Code";

//         //             // Operation
//         //             const proposeOperation = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode).send();
//         //             await proposeOperation.confirmation();

//         //             const lockProposalOperation = await governanceInstance.methods.lockProposal(proposalId).send();
//         //             await lockProposalOperation.confirmation()

//         //             const startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//         //             await startNextRoundOperation.confirmation();

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const finalRound                       = governanceStorage.currentRound
//         //             const finalRoundString                 = Object.keys(finalRound)[0]

//         //             // Assertions
//         //             assert.equal(currentRoundString, "proposal");
//         //             assert.equal(finalRoundString, "proposal");
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     })

//         //     it('User should be able to switch from the proposal round to the voting round', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const currentRound                       = governanceStorage.currentRound
//         //             const currentRoundString                 = Object.keys(currentRound)[0]

//         //             delegationStorage   = await delegationInstance.storage();
//         //             const proposalId            = governanceStorage.nextProposalId.toNumber();
//         //             const proposalName          = "New Proposal #1";
//         //             const proposalDesc          = "Details about new proposal #1";
//         //             const proposalIpfs          = "ipfs://QM123456789";
//         //             const proposalSourceCode    = "Proposal Source Code";

//         //             // Operation
//         //             const proposeOperation = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode).send();
//         //             await proposeOperation.confirmation();

//         //             const lockProposalOperation = await governanceInstance.methods.lockProposal(proposalId).send();
//         //             await lockProposalOperation.confirmation()

//         //             const voteForProposalOperation = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//         //             await voteForProposalOperation.confirmation()

//         //             const startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//         //             await startNextRoundOperation.confirmation();

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const finalRound                       = governanceStorage.currentRound
//         //             const finalRoundString                 = Object.keys(finalRound)[0]
//         //             const finalRoundHighestVotedProposalId = governanceStorage.currentRoundHighestVotedProposalId

//         //             // Assertions
//         //             assert.equal(currentRoundString, "proposal");
//         //             assert.equal(finalRoundString, "voting");
//         //             assert.equal(finalRoundHighestVotedProposalId, proposalId);
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     })

//         //     it('User should be able to switch from the voting round to the proposal round if the highest voted proposal did not receive enough votes', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const currentRound                       = governanceStorage.currentRound
//         //             const currentRoundString                 = Object.keys(currentRound)[0]

//         //             // Operation
//         //             const startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//         //             await startNextRoundOperation.confirmation();

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const finalRound                       = governanceStorage.currentRound
//         //             const finalRoundString                 = Object.keys(finalRound)[0]

//         //             // Assertions
//         //             assert.equal(currentRoundString, "voting");
//         //             assert.equal(finalRoundString, "proposal");
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     })

//         //     it('User should be able to switch from the voting round to the timelock round', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const currentRound                       = governanceStorage.currentRound

//         //             // Operation
//         //             delegationStorage   = await delegationInstance.storage();
//         //             const proposalId            = governanceStorage.nextProposalId.toNumber();
//         //             const proposalName          = "New Proposal #1";
//         //             const proposalDesc          = "Details about new proposal #1";
//         //             const proposalIpfs          = "ipfs://QM123456789";
//         //             const proposalSourceCode    = "Proposal Source Code";

//         //             // Operation
//         //             const proposeOperation = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode).send();
//         //             await proposeOperation.confirmation();

//         //             const lockProposalOperation = await governanceInstance.methods.lockProposal(proposalId).send();
//         //             await lockProposalOperation.confirmation()

//         //             const voteForProposalOperation = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//         //             await voteForProposalOperation.confirmation()

//         //             var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//         //             await startNextRoundOperation.confirmation();

//         //             const votingRoundVoteOperation = await governanceInstance.methods.votingRoundVote("yay").send();
//         //             await votingRoundVoteOperation.confirmation();

//         //             startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//         //             await startNextRoundOperation.confirmation();

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const finalRound                       = governanceStorage.currentRound
//         //             const finalRoundString                 = Object.keys(finalRound)[0]

//         //             // Assertions
//         //             assert.equal(finalRoundString, "timelock");
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     })

//         //     it('User should be able to switch from the timelock round to the proposal round', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const currentRound                       = governanceStorage.currentRound
//         //             const currentRoundString                 = Object.keys(currentRound)[0]

//         //             // Operation
//         //             const startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//         //             await startNextRoundOperation.confirmation();

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const finalRound                       = governanceStorage.currentRound
//         //             const finalRoundString                 = Object.keys(finalRound)[0]

//         //             // Assertions
//         //             assert.equal(currentRoundString, "timelock");
//         //             assert.equal(finalRoundString, "proposal");
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     })

//         //     // it('User should not be able to call the entrypoint if the current round has not ended yet', async () => {
//         //     //     try{
//         //     //         // Initial Values
//         //     //         governanceStorage = await governanceInstance.storage();
//         //     //         const currentRound                       = governanceStorage.currentRound
//         //     //         const currentRoundString                 = Object.keys(currentRound)[0]
//         //     //         const currentBlocksPerProposalRound      = governanceStorage.currentBlocksPerProposalRound
//         //     //         const currentBlocksPerVotingRound        = governanceStorage.currentBlocksPerVotingRound
//         //     //         const currentBlocksPerTimelockRound      = governanceStorage.currentBlocksPerTimelockRound
//         //     //         const currentRoundStartLevel             = governanceStorage.currentRoundStartLevel
//         //     //         const currentRoundEndLevel               = governanceStorage.currentRoundEndLevel
//         //     //         const currentCycleEndLevel               = governanceStorage.currentCycleEndLevel
//         //     //         const currentRoundHighestVotedProposalId = governanceStorage.currentRoundHighestVotedProposalId

//         //     //         const roundDurationConfig = 1

//         //     //         // Operation
//         //     //         var updateConfigOperation = await governanceInstance.methods.updateConfig(roundDurationConfig, "configBlocksPerProposalRound").send();
//         //     //         await updateConfigOperation.confirmation();
//         //     //         await chai.expect(governanceInstance.methods.startNextRound(true).send()).to.be.rejected;

//         //     //         // Final values
//         //     //         governanceStorage = await governanceInstance.storage();
//         //     //         const finalRound                       = governanceStorage.currentRound
//         //     //         const finalRoundString                 = Object.keys(finalRound)[0]
//         //     //         const finalBlocksPerProposalRound      = governanceStorage.currentBlocksPerProposalRound
//         //     //         const finalBlocksPerVotingRound        = governanceStorage.currentBlocksPerVotingRound
//         //     //         const finalBlocksPerTimelockRound      = governanceStorage.currentBlocksPerTimelockRound
//         //     //         const finalRoundStartLevel             = governanceStorage.currentRoundStartLevel
//         //     //         const finalRoundEndLevel               = governanceStorage.currentRoundEndLevel
//         //     //         const finalCycleEndLevel               = governanceStorage.currentCycleEndLevel
//         //     //         const finalRoundHighestVotedProposalId = governanceStorage.currentRoundHighestVotedProposalId

//         //     //         // Assertions
//         //     //         assert.equal(finalRoundString, currentRoundString);
//         //     //         assert.equal(finalBlocksPerProposalRound.toNumber(), currentBlocksPerProposalRound.toNumber());
//         //     //         assert.equal(finalBlocksPerVotingRound.toNumber(), currentBlocksPerVotingRound.toNumber());
//         //     //         assert.equal(finalBlocksPerTimelockRound.toNumber(), currentBlocksPerTimelockRound.toNumber());
//         //     //         assert.equal(finalRoundStartLevel.toNumber(), currentRoundStartLevel.toNumber());
//         //     //         assert.equal(finalRoundEndLevel.toNumber(), currentRoundEndLevel.toNumber());
//         //     //         assert.equal(finalCycleEndLevel.toNumber(), currentCycleEndLevel.toNumber());
//         //     //         assert.equal(finalRoundHighestVotedProposalId.toNumber(), currentRoundHighestVotedProposalId.toNumber());
//         //     //     } catch(e){
//         //     //         console.dir(e, {depth: 5})
//         //     //     }
//         //     // })
//         // })

//         // describe("%propose", async () => {
//         //     beforeEach("Set signer to satellite", async () => {
//         //         await signerFactory(eve.sk)
//         //     });

//         //     it('Satellite should be able to call this entrypoint and create a proposal without metadata', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage           = await governanceInstance.storage();
//         //             const nextProposalId        = governanceStorage.nextProposalId;
//         //             const proposalName          = "New Proposal #2";
//         //             const proposalDesc          = "Details about new proposal #2";
//         //             const proposalIpfs          = "ipfs://QM123456789";
//         //             const proposalSourceCode    = "Proposal Source Code";

//         //             // Operation
//         //             const proposeOperation = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode).send();
//         //             await proposeOperation.confirmation();

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const successReward = governanceStorage.config.successReward
//         //             const currentCycleEndLevel = governanceStorage.currentCycleEndLevel
//         //             const minQuorumPercentage = governanceStorage.config.minQuorumPercentage
//         //             const minQuorumMvkTotal = governanceStorage.config.minQuorumMvkTotal
//         //             const minProposalRoundVotePercentage = governanceStorage.config.minProposalRoundVotePercentage
//         //             const minProposalRoundVotesRequired = governanceStorage.config.minProposalRoundVotesRequired
//         //             const cycleCounter = governanceStorage.cycleCounter
//         //             const finalNextProposalId = governanceStorage.nextProposalId;
//         //             const newProposal = await governanceStorage.proposalLedger.get(nextProposalId);
//         //             const newCurrentRoundProposal = governanceStorage.currentRoundProposals.get(nextProposalId);

//         //             // Assertions
//         //             assert.equal(nextProposalId.toNumber() + 1, finalNextProposalId.toNumber());
//         //             assert.notStrictEqual(newCurrentRoundProposal, undefined);
//         //             assert.notStrictEqual(newProposal, undefined);
//         //             assert.strictEqual(newProposal.proposerAddress, eve.pkh);
//         //             assert.strictEqual(newProposal.status, "ACTIVE");
//         //             assert.strictEqual(newProposal.title, proposalName);
//         //             assert.strictEqual(newProposal.description, proposalDesc);
//         //             assert.strictEqual(newProposal.invoice, proposalIpfs);
//         //             assert.strictEqual(newProposal.sourceCode, proposalSourceCode);
//         //             assert.equal(newProposal.successReward.toNumber(), successReward.toNumber());
//         //             assert.equal(newProposal.executed, false);
//         //             assert.equal(newProposal.locked, false);
//         //             assert.equal(newProposal.passVoteCount.toNumber(), 0);
//         //             assert.equal(newProposal.passVoteMvkTotal.toNumber(), 0);
//         //             assert.equal(newProposal.minProposalRoundVotePercentage.toNumber(), minProposalRoundVotePercentage.toNumber());
//         //             assert.equal(newProposal.minProposalRoundVotesRequired.toNumber(), minProposalRoundVotesRequired.toNumber());
//         //             assert.equal(newProposal.upvoteCount.toNumber(), 0);
//         //             assert.equal(newProposal.upvoteMvkTotal.toNumber(), 0);
//         //             assert.equal(newProposal.downvoteCount.toNumber(), 0);
//         //             assert.equal(newProposal.downvoteMvkTotal.toNumber(), 0);
//         //             assert.equal(newProposal.abstainCount.toNumber(), 0);
//         //             assert.equal(newProposal.abstainMvkTotal.toNumber(), 0);
//         //             assert.equal(newProposal.minQuorumPercentage.toNumber(), minQuorumPercentage.toNumber());
//         //             assert.equal(newProposal.minQuorumMvkTotal.toNumber(), minQuorumMvkTotal.toNumber());
//         //             assert.equal(newProposal.quorumCount.toNumber(), 0);
//         //             assert.equal(newProposal.quorumMvkTotal.toNumber(), 0);
//         //             assert.equal(newProposal.cycle.toNumber(), cycleCounter.toNumber());
//         //             assert.equal(newProposal.currentCycleEndLevel.toNumber(), currentCycleEndLevel.toNumber());
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     })

//         //     it('Satellite should be able to call this entrypoint and create a proposal with metadata', async () => {
//         //         try{
//         //             // Initial Values
//         //             delegationStorage   = await delegationInstance.storage();
//         //             const nextProposalId        = governanceStorage.nextProposalId;
//         //             const proposalName          = "New Proposal #3";
//         //             const proposalDesc          = "Details about new proposal #3";
//         //             const proposalIpfs          = "ipfs://QM123456789";
//         //             const proposalSourceCode    = "Proposal Source Code";

//         //             const configSuccessRewardParam = governanceProxyInstance.methods.dataPackingHelper(
//         //                 'updateGovernanceConfig', 995, 'configSuccessReward'
//         //             ).toTransferParams();
//         //             const configSuccessRewardParamValue = configSuccessRewardParam.parameter.value;
//         //             const callGovernanceLambdaEntrypointType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
        
//         //             const updateConfigSuccessRewardPacked = await utils.tezos.rpc.packData({
//         //                 data: configSuccessRewardParamValue,
//         //                 type: callGovernanceLambdaEntrypointType
//         //             }).catch(e => console.error('error:', e));
        
//         //             var packedUpdateConfigSuccessRewardParam;
//         //             if (updateConfigSuccessRewardPacked) {
//         //                 packedUpdateConfigSuccessRewardParam = updateConfigSuccessRewardPacked.packed
//         //                 // console.log('packed success reward param: ' + packedUpdateConfigSuccessRewardParam);
//         //             } else {
//         //               throw `packing failed`
//         //             };

//         //             const proposalMetadata      = MichelsonMap.fromLiteral({
//         //                 "Metadata#1": packedUpdateConfigSuccessRewardParam
//         //             });

//         //             // Operation
//         //             const proposeOperation = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send();
//         //             await proposeOperation.confirmation();

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const successReward = governanceStorage.config.successReward
//         //             const currentCycleEndLevel = governanceStorage.currentCycleEndLevel
//         //             const minQuorumPercentage = governanceStorage.config.minQuorumPercentage
//         //             const minQuorumMvkTotal = governanceStorage.config.minQuorumMvkTotal
//         //             const minProposalRoundVotePercentage = governanceStorage.config.minProposalRoundVotePercentage
//         //             const minProposalRoundVotesRequired = governanceStorage.config.minProposalRoundVotesRequired
//         //             const cycleCounter = governanceStorage.cycleCounter
//         //             const finalNextProposalId = governanceStorage.nextProposalId;
//         //             const newProposal = await governanceStorage.proposalLedger.get(nextProposalId.toNumber());
//         //             const proposalMetadataStorage = await newProposal.proposalMetadata.get("Metadata#1");
//         //             const newCurrentRoundProposal = governanceStorage.currentRoundProposals.get(nextProposalId);

//         //             // Assertions
//         //             assert.notStrictEqual(proposalMetadataStorage, undefined);
//         //             assert.strictEqual(proposalMetadataStorage, packedUpdateConfigSuccessRewardParam);
//         //             assert.equal(nextProposalId.toNumber() + 1, finalNextProposalId.toNumber());
//         //             assert.notStrictEqual(newCurrentRoundProposal, undefined);
//         //             assert.notStrictEqual(newProposal, undefined);
//         //             assert.strictEqual(newProposal.proposerAddress, eve.pkh);
//         //             assert.strictEqual(newProposal.status, "ACTIVE");
//         //             assert.strictEqual(newProposal.title, proposalName);
//         //             assert.strictEqual(newProposal.description, proposalDesc);
//         //             assert.strictEqual(newProposal.invoice, proposalIpfs);
//         //             assert.strictEqual(newProposal.sourceCode, proposalSourceCode);
//         //             assert.equal(newProposal.successReward.toNumber(), successReward.toNumber());
//         //             assert.equal(newProposal.executed, false);
//         //             assert.equal(newProposal.locked, false);
//         //             assert.equal(newProposal.passVoteCount.toNumber(), 0);
//         //             assert.equal(newProposal.passVoteMvkTotal.toNumber(), 0);
//         //             assert.equal(newProposal.minProposalRoundVotePercentage.toNumber(), minProposalRoundVotePercentage.toNumber());
//         //             assert.equal(newProposal.minProposalRoundVotesRequired.toNumber(), minProposalRoundVotesRequired.toNumber());
//         //             assert.equal(newProposal.upvoteCount.toNumber(), 0);
//         //             assert.equal(newProposal.upvoteMvkTotal.toNumber(), 0);
//         //             assert.equal(newProposal.downvoteCount.toNumber(), 0);
//         //             assert.equal(newProposal.downvoteMvkTotal.toNumber(), 0);
//         //             assert.equal(newProposal.abstainCount.toNumber(), 0);
//         //             assert.equal(newProposal.abstainMvkTotal.toNumber(), 0);
//         //             assert.equal(newProposal.minQuorumPercentage.toNumber(), minQuorumPercentage.toNumber());
//         //             assert.equal(newProposal.minQuorumMvkTotal.toNumber(), minQuorumMvkTotal.toNumber());
//         //             assert.equal(newProposal.quorumCount.toNumber(), 0);
//         //             assert.equal(newProposal.quorumMvkTotal.toNumber(), 0);
//         //             assert.equal(newProposal.cycle.toNumber(), cycleCounter.toNumber());
//         //             assert.equal(newProposal.currentCycleEndLevel.toNumber(), currentCycleEndLevel.toNumber());
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     })

//         //     it('Non-satellite should not be able to call this entrypoint', async () => {
//         //         try{
//         //             // Initial Values
//         //             delegationStorage   = await delegationInstance.storage();
//         //             const nextProposalId        = governanceStorage.nextProposalId;
//         //             const proposalName          = "New Proposal #3";
//         //             const proposalDesc          = "Details about new proposal #3";
//         //             const proposalIpfs          = "ipfs://QM123456789";
//         //             const proposalSourceCode    = "Proposal Source Code";

//         //             // Operation
//         //             await signerFactory(bob.sk);
//         //             await chai.expect(governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode).send()).to.be.rejected;

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const newProposal = await governanceStorage.proposalLedger.get(nextProposalId);

//         //             // Assertions
//         //             assert.strictEqual(newProposal, undefined);
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     })

//         //     it('Satellite should not be able to call this entrypoint if it was not in the previous snapshot', async () => {
//         //         try{
//         //             // Initial Values
//         //             delegationStorage   = await delegationInstance.storage();
//         //             const nextProposalId        = governanceStorage.nextProposalId;
//         //             const proposalName          = "New Proposal #3";
//         //             const proposalDesc          = "Details about new proposal #3";
//         //             const proposalIpfs          = "ipfs://QM123456789";
//         //             const proposalSourceCode    = "Proposal Source Code";

//         //             // Operation
//         //             await signerFactory(bob.sk);
//         //             const registerAsSatellite = await delegationInstance.methods
//         //             .registerAsSatellite(
//         //                 "Bob Satellite", 
//         //                 "Test description", 
//         //                 "Test image", 
//         //                 10
//         //             ).send();
//         //             await registerAsSatellite.confirmation();
//         //             await chai.expect(governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode).send()).to.be.rejected;

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const newProposal = await governanceStorage.proposalLedger.get(nextProposalId);

//         //             // Assertions
//         //             assert.strictEqual(newProposal, undefined);
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     })

//         //     it('Satellite should not be able to call this entrypoint if it does not have enough sMVK', async () => {
//         //         try{
//         //             // Initial Values
//         //             delegationStorage   = await delegationInstance.storage();
//         //             const nextProposalId        = governanceStorage.nextProposalId;
//         //             const proposalName          = "New Proposal #4";
//         //             const proposalDesc          = "Details about new proposal #4";
//         //             const proposalIpfs          = "ipfs://QM123456789";
//         //             const proposalSourceCode    = "Proposal Source Code";

//         //             // Operation
//         //             await signerFactory(alice.sk);
//         //             await chai.expect(governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode).send()).to.be.rejected;

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const newProposal = await governanceStorage.proposalLedger.get(nextProposalId);

//         //             // Assertions
//         //             assert.strictEqual(newProposal, undefined);
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     })
//         // })

//         // describe("%addUpdateProposalData", async () => {
//         //     beforeEach("Set signer to satellite", async () => {
//         //         await signerFactory(eve.sk)
//         //     });

//         //     it('Satellite should be able to call this entrypoint and update a proposal and add a metadata to an existing proposal', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage           = await governanceInstance.storage()
//         //             var governanceKeys          = governanceStorage.currentRoundProposals.keys()
//         //             governanceKeys.next()
//         //             const proposalId            = governanceKeys.next().value

//         //             const configSuccessRewardParam = governanceProxyInstance.methods.dataPackingHelper(
//         //                 'updateGovernanceConfig', 995, 'configSuccessReward'
//         //             ).toTransferParams();
//         //             const configSuccessRewardParamValue = configSuccessRewardParam.parameter.value;
//         //             const callGovernanceLambdaEntrypointType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
        
//         //             const updateConfigSuccessRewardPacked = await utils.tezos.rpc.packData({
//         //                 data: configSuccessRewardParamValue,
//         //                 type: callGovernanceLambdaEntrypointType
//         //             }).catch(e => console.error('error:', e));
        
//         //             var packedUpdateConfigSuccessRewardParam;
//         //             if (updateConfigSuccessRewardPacked) {
//         //                 packedUpdateConfigSuccessRewardParam = updateConfigSuccessRewardPacked.packed
//         //                 // console.log('packed success reward param: ' + packedUpdateConfigSuccessRewardParam);
//         //             } else {
//         //               throw `packing failed`
//         //             };

//         //             // Operation
//         //             const addMetadataOperation = await governanceInstance.methods.addUpdateProposalData(parseInt(proposalId), "Metadata#2", packedUpdateConfigSuccessRewardParam).send();
//         //             await addMetadataOperation.confirmation();

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const proposal = await governanceStorage.proposalLedger.get(proposalId);
//         //             const proposalMetadataStorage = await proposal.proposalMetadata.get("Metadata#2");

//         //             // Assertions
//         //             assert.strictEqual(proposalMetadataStorage, packedUpdateConfigSuccessRewardParam)
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     })

//         //     it('Satellite should be able to call this entrypoint and update a proposal and update a metadata to an existing proposal', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage           = await governanceInstance.storage()
//         //             var governanceKeys          = governanceStorage.currentRoundProposals.keys()
//         //             governanceKeys.next()
//         //             const proposalId            = governanceKeys.next().value

//         //             const configSuccessRewardParam = governanceProxyInstance.methods.dataPackingHelper(
//         //                 'updateGovernanceConfig', 1200, 'configSuccessReward'
//         //             ).toTransferParams();
//         //             const configSuccessRewardParamValue = configSuccessRewardParam.parameter.value;
//         //             const callGovernanceLambdaEntrypointType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
        
//         //             const updateConfigSuccessRewardPacked = await utils.tezos.rpc.packData({
//         //                 data: configSuccessRewardParamValue,
//         //                 type: callGovernanceLambdaEntrypointType
//         //             }).catch(e => console.error('error:', e));
        
//         //             var packedUpdateConfigSuccessRewardParam;
//         //             if (updateConfigSuccessRewardPacked) {
//         //                 packedUpdateConfigSuccessRewardParam = updateConfigSuccessRewardPacked.packed
//         //                 // console.log('packed success reward param: ' + packedUpdateConfigSuccessRewardParam);
//         //             } else {
//         //               throw `packing failed`
//         //             };

//         //             // Operation
//         //             const addMetadataOperation = await governanceInstance.methods.addUpdateProposalData(parseInt(proposalId), "Metadata#2", packedUpdateConfigSuccessRewardParam).send();
//         //             await addMetadataOperation.confirmation();

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const proposal = await governanceStorage.proposalLedger.get(proposalId);
//         //             const proposalMetadataStorage = await proposal.proposalMetadata.get("Metadata#2");

//         //             // Assertions
//         //             assert.strictEqual(proposalMetadataStorage, packedUpdateConfigSuccessRewardParam)
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     })

//         //     it('Non-satellite should not be able to call this entrypoint', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage           = await governanceInstance.storage()
//         //             var governanceKeys          = governanceStorage.currentRoundProposals.keys()
//         //             governanceKeys.next()
//         //             const proposalId            = governanceKeys.next().value

//         //             const configSuccessRewardParam = governanceProxyInstance.methods.dataPackingHelper(
//         //                 'updateGovernanceConfig', 1200, 'configSuccessReward'
//         //             ).toTransferParams();
//         //             const configSuccessRewardParamValue = configSuccessRewardParam.parameter.value;
//         //             const callGovernanceLambdaEntrypointType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
        
//         //             const updateConfigSuccessRewardPacked = await utils.tezos.rpc.packData({
//         //                 data: configSuccessRewardParamValue,
//         //                 type: callGovernanceLambdaEntrypointType
//         //             }).catch(e => console.error('error:', e));
        
//         //             var packedUpdateConfigSuccessRewardParam;
//         //             if (updateConfigSuccessRewardPacked) {
//         //                 packedUpdateConfigSuccessRewardParam = updateConfigSuccessRewardPacked.packed
//         //                 // console.log('packed success reward param: ' + packedUpdateConfigSuccessRewardParam);
//         //             } else {
//         //               throw `packing failed`
//         //             };

//         //             // Operation
//         //             await signerFactory(bob.sk);
//         //             await chai.expect(governanceInstance.methods.addUpdateProposalData(parseInt(proposalId), "Metadata#3", packedUpdateConfigSuccessRewardParam).send()).to.be.rejected;

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const proposal = await governanceStorage.proposalLedger.get(proposalId);
//         //             const proposalMetadataStorage = await proposal.proposalMetadata.get("Metadata#3");

//         //             // Assertions
//         //             assert.strictEqual(proposalMetadataStorage, undefined)
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     })

//         //     it('Satellite should not be able to call this entrypoint if the proposal doesn’t exist', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage           = await governanceInstance.storage()
//         //             const proposalId            = 9999;

//         //             const configSuccessRewardParam = governanceProxyInstance.methods.dataPackingHelper(
//         //                 'updateGovernanceConfig', 1200, 'configSuccessReward'
//         //             ).toTransferParams();
//         //             const configSuccessRewardParamValue = configSuccessRewardParam.parameter.value;
//         //             const callGovernanceLambdaEntrypointType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
        
//         //             const updateConfigSuccessRewardPacked = await utils.tezos.rpc.packData({
//         //                 data: configSuccessRewardParamValue,
//         //                 type: callGovernanceLambdaEntrypointType
//         //             }).catch(e => console.error('error:', e));
        
//         //             var packedUpdateConfigSuccessRewardParam;
//         //             if (updateConfigSuccessRewardPacked) {
//         //                 packedUpdateConfigSuccessRewardParam = updateConfigSuccessRewardPacked.packed
//         //                 // console.log('packed success reward param: ' + packedUpdateConfigSuccessRewardParam);
//         //             } else {
//         //               throw `packing failed`
//         //             };

//         //             // Operation
//         //             await chai.expect(governanceInstance.methods.addUpdateProposalData(proposalId, "Metadata#3", packedUpdateConfigSuccessRewardParam).send()).to.be.rejected;

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const proposal = await governanceStorage.proposalLedger.get(proposalId);

//         //             // Assertions
//         //             assert.strictEqual(proposal, undefined)
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     })

//         //     it('Satellite should not be able to call this entrypoint if it did not created the proposal  ', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage           = await governanceInstance.storage()
//         //             var governanceKeys          = governanceStorage.currentRoundProposals.keys()
//         //             governanceKeys.next()
//         //             const proposalId            = governanceKeys.next().value

//         //             const configSuccessRewardParam = governanceProxyInstance.methods.dataPackingHelper(
//         //                 'updateGovernanceConfig', 1200, 'configSuccessReward'
//         //             ).toTransferParams();
//         //             const configSuccessRewardParamValue = configSuccessRewardParam.parameter.value;
//         //             const callGovernanceLambdaEntrypointType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
        
//         //             const updateConfigSuccessRewardPacked = await utils.tezos.rpc.packData({
//         //                 data: configSuccessRewardParamValue,
//         //                 type: callGovernanceLambdaEntrypointType
//         //             }).catch(e => console.error('error:', e));
        
//         //             var packedUpdateConfigSuccessRewardParam;
//         //             if (updateConfigSuccessRewardPacked) {
//         //                 packedUpdateConfigSuccessRewardParam = updateConfigSuccessRewardPacked.packed
//         //                 // console.log('packed success reward param: ' + packedUpdateConfigSuccessRewardParam);
//         //             } else {
//         //               throw `packing failed`
//         //             };

//         //             // Operation
//         //             await signerFactory(alice.sk);
//         //             await chai.expect(governanceInstance.methods.addUpdateProposalData(parseInt(proposalId), "Metadata#3", packedUpdateConfigSuccessRewardParam).send()).to.be.rejected;

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const proposal = await governanceStorage.proposalLedger.get(proposalId);
//         //             const proposalMetadataStorage = await proposal.proposalMetadata.get("Metadata#3");

//         //             // Assertions
//         //             assert.strictEqual(proposalMetadataStorage, undefined)
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     })
//         // })

//         // describe("%lockProposal", async () => {
//         //     beforeEach("Set signer to satellite", async () => {
//         //         await signerFactory(eve.sk)
//         //     });

//         //     it('Satellite should be able to call this entrypoint and lock a proposal', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage           = await governanceInstance.storage()
//         //             var governanceKeys          = governanceStorage.currentRoundProposals.keys()
//         //             governanceKeys.next()
//         //             const proposalId            = governanceKeys.next().value

//         //             // Operation
//         //             const lockOperation = await governanceInstance.methods.lockProposal(parseInt(proposalId)).send();
//         //             await lockOperation.confirmation();

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const proposal = await governanceStorage.proposalLedger.get(proposalId);

//         //             // Assertions
//         //             assert.strictEqual(proposal.locked, true);
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     })

//         //     it('Non-satellite should not be able to call this entrypoint', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage           = await governanceInstance.storage()
//         //             const proposalId            = governanceStorage.currentRoundProposals.keys().next().value

//         //             // Operation
//         //             await signerFactory(bob.sk);
//         //             await chai.expect(governanceInstance.methods.lockProposal(parseInt(proposalId)).send()).to.be.rejected;

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const proposal = await governanceStorage.proposalLedger.get(proposalId);

//         //             // Assertions
//         //             assert.strictEqual(proposal.locked, false);
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     })

//         //     it('Satellite should not be able to call this entrypoint if the proposal doesn’t exist', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage           = await governanceInstance.storage()
//         //             const proposalId            = 9999;

//         //             // Operation
//         //             await chai.expect(governanceInstance.methods.lockProposal(proposalId).send()).to.be.rejected;

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const proposal = await governanceStorage.proposalLedger.get(proposalId);

//         //             // Assertions
//         //             assert.strictEqual(proposal, undefined);
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     })

//         //     it('Satellite should not be able to call this entrypoint if the proposal is already locked', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage           = await governanceInstance.storage()
//         //             var governanceKeys          = governanceStorage.currentRoundProposals.keys()
//         //             governanceKeys.next()
//         //             const proposalId            = governanceKeys.next().value

//         //             // Operation
//         //             await chai.expect(governanceInstance.methods.lockProposal(parseInt(proposalId)).send()).to.be.rejected;

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const proposal = await governanceStorage.proposalLedger.get(proposalId);

//         //             // Assertions
//         //             assert.strictEqual(proposal.locked, true);
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     })

//         //     it('Satellite should not be able to call this entrypoint if it did not created the proposal', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage           = await governanceInstance.storage()
//         //             const proposalId            = governanceStorage.currentRoundProposals.keys().next().value

//         //             // Operation
//         //             await signerFactory(alice.sk);
//         //             await chai.expect(governanceInstance.methods.lockProposal(parseInt(proposalId)).send()).to.be.rejected;

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const proposal = await governanceStorage.proposalLedger.get(proposalId);

//         //             // Assertions
//         //             assert.strictEqual(proposal.locked, false);
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     })
//         // })

//         // describe("%proposalRoundVote", async () => {
//         //     beforeEach("Set signer to satellite", async () => {
//         //         await signerFactory(eve.sk)
//         //     });

//         //     it('Satellite should be able to call this entrypoint and vote for a proposal', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage           = await governanceInstance.storage()
//         //             var governanceKeys          = governanceStorage.currentRoundProposals.keys()
//         //             governanceKeys.next()
//         //             const proposalId            = governanceKeys.next().value

//         //             // Operation
//         //             const voteOperation = await governanceInstance.methods.proposalRoundVote(parseInt(proposalId)).send();
//         //             await voteOperation.confirmation();

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const roundVoters = await governanceStorage.currentRoundVotes;
//         //             const roundVoter = await roundVoters.get(eve.pkh);
//         //             const proposal = await governanceStorage.proposalLedger.get(proposalId);
//         //             const passVoteCount = await proposal.passVoteCount;
//         //             const passVoters = await proposal.passVotersMap;
//         //             const passVoter = await passVoters.get(eve.pkh);

//         //             // Assertions
//         //             assert.notStrictEqual(roundVoter, undefined)
//         //             assert.notStrictEqual(passVoter, undefined)
//         //             assert.notEqual(passVoteCount.toNumber(), 0)
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     })

//         //     it('Non-satellite should not be able to call this entrypoint', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage           = await governanceInstance.storage()
//         //             var governanceKeys          = governanceStorage.currentRoundProposals.keys()
//         //             governanceKeys.next()
//         //             const proposalId            = governanceKeys.next().value

//         //             // Operation
//         //             await signerFactory(bob.sk)
//         //             await chai.expect(governanceInstance.methods.proposalRoundVote(parseInt(proposalId)).send()).to.be.rejected;

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const roundVoters = await governanceStorage.currentRoundVotes;
//         //             const roundVoter = await roundVoters.get(bob.pkh);
//         //             const proposal = await governanceStorage.proposalLedger.get(proposalId);
//         //             const passVoters = await proposal.passVotersMap;
//         //             const passVoter = await passVoters.get(bob.pkh);

//         //             // Assertions
//         //             assert.strictEqual(roundVoter, undefined)
//         //             assert.strictEqual(passVoter, undefined)
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     })

//         //     it('Satellite should not be able to call this entrypoint if it was not in the previous snapshot', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage           = await governanceInstance.storage()
//         //             var governanceKeys          = governanceStorage.currentRoundProposals.keys()
//         //             governanceKeys.next()
//         //             const proposalId            = governanceKeys.next().value

//         //             // Operation
//         //             await signerFactory(mallory.sk)
//         //             const updateOperators = await mvkTokenInstance.methods
//         //                 .update_operators([
//         //                 {
//         //                     add_operator: {
//         //                         owner: mallory.pkh,
//         //                         operator: doormanAddress.address,
//         //                         token_id: 0,
//         //                     },
//         //                 },
//         //                 ])
//         //                 .send()
//         //             await updateOperators.confirmation();
//         //             const stakeOperation = await doormanInstance.methods.stake(MVK(20000)).send();
//         //             await stakeOperation.confirmation();
//         //             var registerAsSatellite = await delegationInstance.methods
//         //             .registerAsSatellite(
//         //                 "Mallory Satellite", 
//         //                 "Test description", 
//         //                 "Test image", 
//         //                 7
//         //             ).send();
//         //             await registerAsSatellite.confirmation();

//         //             await chai.expect(governanceInstance.methods.proposalRoundVote(proposalId).send()).to.be.rejected;

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const roundVoters = await governanceStorage.currentRoundVotes;
//         //             const roundVoter = await roundVoters.get(mallory.pkh);
//         //             const proposal = await governanceStorage.proposalLedger.get(proposalId);
//         //             const passVoters = await proposal.passVotersMap;
//         //             const passVoter = await passVoters.get(mallory.pkh);

//         //             // Assertions
//         //             assert.strictEqual(roundVoter, undefined)
//         //             assert.strictEqual(passVoter, undefined)
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     })

//         //     it('Satellite should not be able to call this entrypoint if the proposal was not locked', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage           = await governanceInstance.storage()
//         //             const proposalId            = governanceStorage.currentRoundProposals.keys().next().value

//         //             // Operation
//         //             await chai.expect(governanceInstance.methods.proposalRoundVote(parseInt(proposalId)).send()).to.be.rejected;

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const roundVoters = await governanceStorage.currentRoundVotes;
//         //             const roundVoter = await roundVoters.get(eve.pkh);
//         //             const proposal = await governanceStorage.proposalLedger.get(proposalId);
//         //             const passVoters = await proposal.passVotersMap;
//         //             const passVoter = await passVoters.get(eve.pkh);

//         //             // Assertions
//         //             assert.notStrictEqual(roundVoter, undefined)
//         //             assert.notStrictEqual(passVoter, undefined)
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     })

//         //     it('Satellite should not be able to call this entrypoint if the proposal does not exist', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage           = await governanceInstance.storage()
//         //             const proposalId            = 9999;

//         //             // Operation
//         //             await chai.expect(governanceInstance.methods.proposalRoundVote(proposalId).send()).to.be.rejected;

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const roundVoters = await governanceStorage.currentRoundVotes;
//         //             const roundVoter = await roundVoters.get(eve.pkh);
//         //             const proposal = await governanceStorage.proposalLedger.get(proposalId);
//         //             const passVoters = await proposal.passVotersMap;
//         //             const passVoter = await passVoters.get(eve.pkh);

//         //             // Assertions
//         //             assert.strictEqual(roundVoter, undefined)
//         //             assert.strictEqual(passVoter, undefined)
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     })

//         //     it('Satellite should be able to change its vote', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage           = await governanceInstance.storage()
//         //             const proposalId            = governanceStorage.currentRoundProposals.keys().next().value
//         //             const roundVoters           = await governanceStorage.currentRoundVotes;
//         //             const roundVoter            = await roundVoters.get(eve.pkh);
//         //             const previousProposal = await governanceStorage.proposalLedger.get(roundVoter);
//         //             const previousPassVoteCount = await previousProposal.passVoteCount;
//         //             const previousPassVoters = await previousProposal.passVotersMap;
//         //             const previousPassVoter = await previousPassVoters.get(eve.pkh);

//         //             // Operation
//         //             const lockOperation = await governanceInstance.methods.lockProposal(proposalId).send();
//         //             await lockOperation.confirmation();
//         //             const voteOperation = await governanceInstance.methods.proposalRoundVote(parseInt(proposalId)).send();
//         //             await voteOperation.confirmation();

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const finalRoundVoters = await governanceStorage.currentRoundVotes;
//         //             const finalRoundVoter = await finalRoundVoters.get(eve.pkh);
//         //             const proposal = await governanceStorage.proposalLedger.get(proposalId);
//         //             const passVoteCount = await proposal.passVoteCount;
//         //             const passVoters = await proposal.passVotersMap;
//         //             const passVoter = await passVoters.get(eve.pkh);

//         //             const oldProposal = await governanceStorage.proposalLedger.get(roundVoter);
//         //             const oldPassVoteCount = await oldProposal.passVoteCount;
//         //             const oldPassVoters = await oldProposal.passVotersMap;
//         //             const oldPassVoter = await oldPassVoters.get(eve.pkh);

//         //             // Assertions
//         //             assert.notEqual(finalRoundVoter.toNumber(), roundVoter.toNumber())
//         //             assert.notStrictEqual(passVoter, undefined)
//         //             assert.notEqual(passVoteCount.toNumber(), 0)
//         //             assert.notStrictEqual(previousPassVoter, undefined)
//         //             assert.strictEqual(oldPassVoter, undefined)
//         //             assert.strictEqual(previousPassVoteCount.toNumber(), oldPassVoteCount.toNumber() + 1)
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     })
//         // })

//         // describe("%dropProposal", async () => {
//         //     beforeEach("Set signer to satellite", async () => {
//         //         await signerFactory(eve.sk)
//         //     });

//         //     it('Proposer should be able to call this entrypoint and drop its proposal', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage           = await governanceInstance.storage()
//         //             var governanceKeys          = governanceStorage.currentRoundProposals.keys()
//         //             governanceKeys.next()
//         //             const proposalId            = governanceKeys.next().value

//         //             // Operation
//         //             const dropOperation = await governanceInstance.methods.dropProposal(parseInt(proposalId)).send();
//         //             await dropOperation.confirmation();

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const proposal = await governanceStorage.proposalLedger.get(proposalId);

//         //             // Assertions
//         //             assert.strictEqual(proposal.status, "DROPPED")
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     })

//         //     it('Proposer should not be able to call this entrypoint if its not a satellite', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage           = await governanceInstance.storage()
//         //             const proposalId            = governanceStorage.currentRoundProposals.keys().next().value

//         //             // Operation
//         //             await signerFactory(bob.sk)
//         //             await chai.expect(governanceInstance.methods.dropProposal(parseInt(proposalId)).send()).to.be.rejected;

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const proposal = await governanceStorage.proposalLedger.get(proposalId);

//         //             // Assertions
//         //             assert.strictEqual(proposal.status, "ACTIVE")
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     })

//         //     it('Proposer should not be able to call this entrypoint if it wants to drop a proposal it did not made', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage           = await governanceInstance.storage()
//         //             const proposalId            = governanceStorage.currentRoundProposals.keys().next().value

//         //             // Operation
//         //             await signerFactory(alice.sk)
//         //             await chai.expect(governanceInstance.methods.dropProposal(parseInt(proposalId)).send()).to.be.rejected;

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const proposal = await governanceStorage.proposalLedger.get(proposalId);

//         //             // Assertions
//         //             assert.strictEqual(proposal.status, "ACTIVE")
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     })

//         //     it('Proposer should not be able to call this entrypoint if the selected proposal was already dropped', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage           = await governanceInstance.storage()
//         //             const proposalId            = governanceStorage.currentRoundProposals.keys().next().value

//         //             // Operation
//         //             await chai.expect(governanceInstance.methods.dropProposal(parseInt(proposalId)).send()).to.be.rejected;

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const proposal = await governanceStorage.proposalLedger.get(proposalId);

//         //             // Assertions
//         //             assert.strictEqual(proposal.status, "ACTIVE")
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     })
//         // })

//         // describe("%votingRoundVote", async () => {
//         //     before("Switch to voting round", async () => {
//         //         // Operation
//         //         const startVotingRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//         //         await startVotingRoundOperation.confirmation();
//         //     })

//         //     beforeEach("Set signer to satellite", async () => {
//         //         await signerFactory(eve.sk)
//         //     });

//         //     it('Satellite should be able to call this entrypoint and vote', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage           = await governanceInstance.storage()
//         //             const currentRound          = governanceStorage.currentRound
//         //             const currentRoundString    = Object.keys(currentRound)[0]
//         //             const proposalsRound        = await governanceStorage.currentRoundProposals;
//         //             const proposalId            = Object.keys(proposalsRound)[-1];
//         //             const highestVotedProposal  = governanceStorage.currentRoundHighestVotedProposalId;

//         //             const voteOperation = await governanceInstance.methods.votingRoundVote("yay").send();
//         //             await voteOperation.confirmation();

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const proposal = await governanceStorage.proposalLedger.get(proposalId);
//         //             const voters = await proposal.voters;
//         //             const voter = await voters.get(eve.pkh);

//         //             // Assertions
//         //             assert.strictEqual(currentRoundString, "voting")
//         //             assert.equal(proposalId,highestVotedProposal.toNumber())
//         //             assert.notStrictEqual(voter,undefined)
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     })

//         //     it('Non-satellite should not be able to call this entrypoint', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage           = await governanceInstance.storage()
//         //             const currentRound          = governanceStorage.currentRound
//         //             const currentRoundString    = Object.keys(currentRound)[0]
//         //             const proposalsRound        = await governanceStorage.currentRoundProposals;
//         //             const proposalId            = Object.keys(proposalsRound)[-1];
//         //             const highestVotedProposal  = governanceStorage.currentRoundHighestVotedProposalId;

//         //             await signerFactory(bob.sk)
//         //             const voteOperation = await governanceInstance.methods.votingRoundVote("yay").send();
//         //             await voteOperation.confirmation();

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const proposal = await governanceStorage.proposalLedger.get(proposalId);
//         //             const voters = await proposal.voters;
//         //             const voter = await voters.get(bob.pkh);

//         //             // Assertions
//         //             assert.strictEqual(currentRoundString, "voting")
//         //             assert.equal(proposalId,highestVotedProposal.toNumber())
//         //             assert.strictEqual(voter,undefined)
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     })

//         //     it('Satellite should not be able to call this entrypoint if it was not in the previous snapshot', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage           = await governanceInstance.storage()
//         //             const currentRound          = governanceStorage.currentRound
//         //             const currentRoundString    = Object.keys(currentRound)[0]
//         //             const proposalsRound        = await governanceStorage.currentRoundProposals;
//         //             const proposalId            = Object.keys(proposalsRound)[-1];
//         //             const highestVotedProposal  = await governanceStorage.currentRoundHighestVotedProposalId;

//         //             await signerFactory(mallory.sk)
//         //             const voteOperation = await governanceInstance.methods.votingRoundVote("yay").send();
//         //             await voteOperation.confirmation();

//         //             // Final values
//         //             governanceStorage = await governanceInstance.storage();
//         //             const proposal = await governanceStorage.proposalLedger.get(proposalId);
//         //             const voters = await proposal.voters;
//         //             const voter = await voters.get(mallory.pkh);

//         //             // Assertions
//         //             assert.strictEqual(currentRoundString, "voting")
//         //             assert.equal(proposalId,highestVotedProposal.toNumber())
//         //             assert.strictEqual(voter,undefined)
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     })
//         // })

//         // describe("%executeProposal", async () => {

//         //     beforeEach("Set signer to satellite", async () => {
//         //         await signerFactory(eve.sk)
//         //     });

//         //     it('User should not be able to call this entrypoint if it’s the voting round', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage           = await governanceInstance.storage()
//         //             const currentRound          = governanceStorage.currentRound
//         //             const currentRoundString    = Object.keys(currentRound)[0]
//         //             const highestVotedProposal  = governanceStorage.currentRoundHighestVotedProposalId;
//         //             const timelockProposal      = governanceStorage.timelockProposalId;

//         //             // Operation
//         //             await chai.expect(governanceInstance.methods.executeProposal().send()).to.be.rejected;

//         //             // Assertions
//         //             assert.strictEqual(currentRoundString, "voting")
//         //             assert.equal(timelockProposal.toNumber(),highestVotedProposal.toNumber())
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     })

//         //     it('User should not be able to call this entrypoint if it’s the timelock round', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage           = await governanceInstance.storage()
//         //             const highestVotedProposal  = governanceStorage.currentRoundHighestVotedProposalId;
//         //             const timelockProposal      = governanceStorage.timelockProposalId;

//         //             // Operation
//         //             const startTimelockRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//         //             await startTimelockRoundOperation.confirmation();
//         //             await chai.expect(governanceInstance.methods.executeProposal().send()).to.be.rejected;

//         //             // Final values
//         //             governanceStorage           = await governanceInstance.storage()
//         //             const currentRound          = governanceStorage.currentRound
//         //             const currentRoundString    = Object.keys(currentRound)[0]

//         //             // Assertions
//         //             assert.strictEqual(currentRoundString, "timelock")
//         //             assert.equal(timelockProposal.toNumber(),highestVotedProposal.toNumber())
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     })

//         //     it('User should be able to call this entrypoint manually in the next proposal round', async () => {
//         //         try{
//         //             // Initial Values
//         //             governanceStorage           = await governanceInstance.storage()
//         //             const highestVotedProposal  = governanceStorage.currentRoundHighestVotedProposalId;
//         //             const timelockProposal      = governanceStorage.timelockProposalId;

//         //             const startProposalRoundOperation = await governanceInstance.methods.startNextRound(false).send();
//         //             await startProposalRoundOperation.confirmation();
//         //             const executeOperation = await governanceInstance.methods.executeProposal().send();
//         //             await executeOperation.confirmation();

//         //             // Final values
//         //             governanceStorage           = await governanceInstance.storage()
//         //             const currentRound          = governanceStorage.currentRound
//         //             const currentRoundString    = Object.keys(currentRound)[0]

//         //             // Assertions
//         //             assert.strictEqual(currentRoundString, "proposal")
//         //             assert.equal(timelockProposal.toNumber(),highestVotedProposal.toNumber())
//         //         } catch(e){
//         //             console.dir(e, {depth: 5})
//         //         }
//         //     })
//         // })
//     })

//     describe("Second Cycle", async () => {

//         beforeEach("Set signer to satellite", async () => {
//             await signerFactory(eve.sk)
//         });

//         describe("%startNextRound", async () => {
//             it('User should not be able to call the entrypoint if the current round has not ended', async () => {
//                 try{
//                     // Update config
//                     await signerFactory(bob.sk);
//                     var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configBlocksPerProposalRound").send();
//                     await updateConfigOperation.confirmation();
//                     updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configBlocksPerVotingRound").send();
//                     await updateConfigOperation.confirmation();
//                     updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configBlocksPerTimelockRound").send();
//                     await updateConfigOperation.confirmation();

//                     // Initial Values
//                     governanceStorage = await governanceInstance.storage();

//                     // Operation
//                     if(governanceStorage.currentCycleEndLevel == 0){
//                         var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                         await startNextRoundOperation.confirmation();
//                     }
//                     await chai.expect(governanceInstance.methods.startNextRound(true).send()).to.be.rejected;

//                     // Reset config
//                     var updateConfigOperation = await governanceInstance.methods.updateConfig(0,"configBlocksPerProposalRound").send();
//                     await updateConfigOperation.confirmation();
//                     updateConfigOperation = await governanceInstance.methods.updateConfig(0,"configBlocksPerVotingRound").send();
//                     await updateConfigOperation.confirmation();
//                     updateConfigOperation = await governanceInstance.methods.updateConfig(0,"configBlocksPerTimelockRound").send();
//                     await updateConfigOperation.confirmation();
//                 } catch(e){
//                     console.dir(e, {depth: 5})
//                 }
//             })    
//         })

//         describe("%propose", async () => {

//             beforeEach("Set signer to satellite", async () => {
//                 await signerFactory(eve.sk)
//             });

//             it('Satellite should not be able to call this entrypoint and create a proposal if it has already created enough proposals this cycle', async () => {
//                 try{
//                     // Update config
//                     await signerFactory(bob.sk);
//                     var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configMaxProposalsPerDelegate").send();
//                     await updateConfigOperation.confirmation();

//                     // Initial Values
//                     await signerFactory(eve.sk)
//                     governanceStorage           = await governanceInstance.storage();
//                     var currentRound            = governanceStorage.currentRound
//                     var currentRoundString      = Object.keys(currentRound)[0]

//                     // Operation
//                     while(governanceStorage.currentCycleEndLevel == 0 || currentRoundString !== "proposal"){
//                         var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                         await startNextRoundOperation.confirmation();
//                         governanceStorage           = await governanceInstance.storage();
//                         currentRound                = governanceStorage.currentRound
//                         currentRoundString          = Object.keys(currentRound)[0]
//                     }
//                     const firstProposalName          = "New Proposal #1";
//                     const firstProposalDesc          = "Details about new proposal #1";
//                     const firstProposalIpfs          = "ipfs://QM123456789";
//                     const firstProposalSourceCode    = "Proposal Source Code";

//                     // Operation
//                     var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send();
//                     await proposeOperation.confirmation();

//                     const secondProposalName          = "New Proposal #2";
//                     const secondProposalDesc          = "Details about new proposal #2";
//                     const secondProposalIpfs          = "ipfs://QM123456789";
//                     const secondProposalSourceCode    = "Proposal Source Code";

//                     // Operation
//                     await chai.expect(governanceInstance.methods.propose(secondProposalName, secondProposalDesc, secondProposalIpfs, secondProposalSourceCode).send()).to.be.rejected; 
//                 } catch(e){
//                     console.dir(e, {depth: 5})
//                 }
//             })

//             it('Satellite should not be able to call this entrypoint if it is not the proposal round', async () => {
//                 try{
//                     // Update config
//                     await signerFactory(bob.sk);
//                     var updateConfigOperation = await governanceInstance.methods.updateConfig(25,"configMaxProposalsPerDelegate").send();
//                     await updateConfigOperation.confirmation();

//                     // Initial Values
//                     await signerFactory(eve.sk);
//                     governanceStorage           = await governanceInstance.storage();
//                     const proposalId            = governanceStorage.nextProposalId; 
//                     var currentRound            = governanceStorage.currentRound
//                     var currentRoundString      = Object.keys(currentRound)[0]

//                     // Operation
//                     while(governanceStorage.currentCycleEndLevel == 0 || currentRoundString !== "proposal"){
//                         var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                         await startNextRoundOperation.confirmation();
//                         governanceStorage           = await governanceInstance.storage();
//                         currentRound                = governanceStorage.currentRound
//                         currentRoundString          = Object.keys(currentRound)[0]
//                     }
//                     const firstProposalName          = "New Proposal #1";
//                     const firstProposalDesc          = "Details about new proposal #1";
//                     const firstProposalIpfs          = "ipfs://QM123456789";
//                     const firstProposalSourceCode    = "Proposal Source Code";

//                     // Operation
//                     var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send();
//                     await proposeOperation.confirmation();

//                     const lockOperation = await governanceInstance.methods.lockProposal(proposalId).send();
//                     await lockOperation.confirmation();

//                     const proposalRoundVoteOperation = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//                     await proposalRoundVoteOperation.confirmation();

//                     var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                     await startNextRoundOperation.confirmation();

//                     governanceStorage           = await governanceInstance.storage();
//                     var currentRound            = governanceStorage.currentRound;
//                     var currentRoundString      = Object.keys(currentRound)[0];

//                     assert.strictEqual(currentRoundString, "voting");

//                     // Operation
//                     await chai.expect(governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send()).to.be.rejected; 
//                 } catch(e){
//                     console.dir(e, {depth: 5})
//                 }
//             })
//         })

//         describe("%addUpdateProposalData", async () => {

//             beforeEach("Set signer to satellite", async () => {
//                 await signerFactory(eve.sk)
//             });

//             it('Satellite should not be able to call this entrypoint if it is not the proposal round', async () => {
//                 try{
//                     // Initial Values
//                     governanceStorage           = await governanceInstance.storage();
//                     const proposalId            = governanceStorage.nextProposalId; 
//                     var currentRound            = governanceStorage.currentRound;
//                     var currentRoundString      = Object.keys(currentRound)[0];

//                     // Operation
//                     while(governanceStorage.currentCycleEndLevel == 0 || currentRoundString !== "proposal"){
//                         var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                         await startNextRoundOperation.confirmation();
//                         governanceStorage           = await governanceInstance.storage();
//                         currentRound                = governanceStorage.currentRound
//                         currentRoundString          = Object.keys(currentRound)[0]
//                     }
//                     const firstProposalName          = "New Proposal #1";
//                     const firstProposalDesc          = "Details about new proposal #1";
//                     const firstProposalIpfs          = "ipfs://QM123456789";
//                     const firstProposalSourceCode    = "Proposal Source Code";

//                     // Operation
//                     var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send();
//                     await proposeOperation.confirmation();

//                     // Operation
//                     const lockProposalOperation  = await governanceInstance.methods.lockProposal(proposalId).send();
//                     await lockProposalOperation.confirmation();

//                     const proposalRoundVoteOperation = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//                     await proposalRoundVoteOperation.confirmation();

//                     var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                     await startNextRoundOperation.confirmation();

//                     const configSuccessRewardParam = governanceProxyInstance.methods.dataPackingHelper(
//                         'updateGovernanceConfig', 995, 'configSuccessReward'
//                     ).toTransferParams();
//                     const configSuccessRewardParamValue = configSuccessRewardParam.parameter.value;
//                     const callGovernanceLambdaEntrypointType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
//                     const updateConfigSuccessRewardPacked = await utils.tezos.rpc.packData({
//                         data: configSuccessRewardParamValue,
//                         type: callGovernanceLambdaEntrypointType
//                     }).catch(e => console.error('error:', e));
        
//                     var packedUpdateConfigSuccessRewardParam;
//                     if (updateConfigSuccessRewardPacked) {
//                         packedUpdateConfigSuccessRewardParam = updateConfigSuccessRewardPacked.packed
//                     } else {
//                       throw `packing failed`
//                     };

//                     governanceStorage           = await governanceInstance.storage();
//                     var currentRound            = governanceStorage.currentRound;
//                     var currentRoundString      = Object.keys(currentRound)[0];

//                     assert.strictEqual(currentRoundString, "voting");

//                     // Operation
//                     await chai.expect(governanceInstance.methods.addUpdateProposalData(proposalId, "Metadata#1", packedUpdateConfigSuccessRewardParam).send()).to.be.rejected; 
//                 } catch(e){
//                     console.dir(e, {depth: 5})
//                 }
//             })

//             it('Satellite should not be able to call this entrypoint if the proposal is locked', async () => {
//                 try{
//                     // Initial Values
//                     governanceStorage           = await governanceInstance.storage();
//                     const proposalId            = governanceStorage.nextProposalId; 
//                     var currentRound            = governanceStorage.currentRound;
//                     var currentRoundString      = Object.keys(currentRound)[0];

//                     // Operation
//                     while(governanceStorage.currentCycleEndLevel == 0 || currentRoundString !== "proposal"){
//                         var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                         await startNextRoundOperation.confirmation();
//                         governanceStorage           = await governanceInstance.storage();
//                         currentRound                = governanceStorage.currentRound
//                         currentRoundString          = Object.keys(currentRound)[0]
//                     }
//                     const firstProposalName          = "New Proposal #1";
//                     const firstProposalDesc          = "Details about new proposal #1";
//                     const firstProposalIpfs          = "ipfs://QM123456789";
//                     const firstProposalSourceCode    = "Proposal Source Code";

//                     // Operation
//                     var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send();
//                     await proposeOperation.confirmation();

//                     const lockOperation = await governanceInstance.methods.lockProposal(proposalId).send();
//                     await lockOperation.confirmation();

//                     // Test
//                     const configSuccessRewardParam = governanceProxyInstance.methods.dataPackingHelper(
//                         'updateGovernanceConfig', 995, 'configSuccessReward'
//                     ).toTransferParams();
//                     const configSuccessRewardParamValue = configSuccessRewardParam.parameter.value;
//                     const callGovernanceLambdaEntrypointType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
        
//                     const updateConfigSuccessRewardPacked = await utils.tezos.rpc.packData({
//                         data: configSuccessRewardParamValue,
//                         type: callGovernanceLambdaEntrypointType
//                     }).catch(e => console.error('error:', e));
        
//                     var packedUpdateConfigSuccessRewardParam;
//                     if (updateConfigSuccessRewardPacked) {
//                         packedUpdateConfigSuccessRewardParam = updateConfigSuccessRewardPacked.packed
//                     } else {
//                       throw `packing failed`
//                     };

//                     // Operation
//                     await chai.expect(governanceInstance.methods.addUpdateProposalData(proposalId, "Metadata#1", packedUpdateConfigSuccessRewardParam).send()).to.be.rejected; 
//                 } catch(e){
//                     console.dir(e, {depth: 5})
//                 }
//             })
//         })

//         describe("%lockProposal", async () => {

//             beforeEach("Set signer to satellite", async () => {
//                 await signerFactory(eve.sk)
//             });

//             it('Satellite should not be able to call this entrypoint if it is not the proposal round', async () => {
//                 try{
//                     // Initial Values
//                     governanceStorage           = await governanceInstance.storage();
//                     const proposalId            = governanceStorage.nextProposalId; 
//                     var currentRound            = governanceStorage.currentRound;
//                     var currentRoundString      = Object.keys(currentRound)[0];

//                     // Operation
//                     while(governanceStorage.currentCycleEndLevel == 0 || currentRoundString !== "proposal"){
//                         var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                         await startNextRoundOperation.confirmation();
//                         governanceStorage           = await governanceInstance.storage();
//                         currentRound                = governanceStorage.currentRound
//                         currentRoundString          = Object.keys(currentRound)[0]
//                     }
//                     const firstProposalName          = "New Proposal #1";
//                     const firstProposalDesc          = "Details about new proposal #1";
//                     const firstProposalIpfs          = "ipfs://QM123456789";
//                     const firstProposalSourceCode    = "Proposal Source Code";

//                     // Operation
//                     var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send();
//                     await proposeOperation.confirmation();

//                     // Operation
//                     const lockProposalOperation  = await governanceInstance.methods.lockProposal(proposalId).send();
//                     await lockProposalOperation.confirmation();

//                     const proposalRoundVoteOperation = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//                     await proposalRoundVoteOperation.confirmation();

//                     var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                     await startNextRoundOperation.confirmation();

//                     // Operation
//                     await chai.expect(governanceInstance.methods.lockProposal(proposalId).send()).to.be.rejected; 
//                 } catch(e){
//                     console.dir(e, {depth: 5})
//                 }
//             })
//         })

//         describe("%proposalRoundVote", async () => {
//             it('Satellite should not be able to call this entrypoint if it is not the proposal round', async () => {
//                 try{
//                     // Initial Values
//                     governanceStorage           = await governanceInstance.storage();
//                     const proposalId            = governanceStorage.nextProposalId; 
//                     var currentRound            = governanceStorage.currentRound;
//                     var currentRoundString      = Object.keys(currentRound)[0];

//                     // Operation
//                     while(governanceStorage.currentCycleEndLevel == 0 || currentRoundString !== "proposal"){
//                         var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                         await startNextRoundOperation.confirmation();
//                         governanceStorage           = await governanceInstance.storage();
//                         currentRound                = governanceStorage.currentRound
//                         currentRoundString          = Object.keys(currentRound)[0]
//                     }
//                     const firstProposalName          = "New Proposal #1";
//                     const firstProposalDesc          = "Details about new proposal #1";
//                     const firstProposalIpfs          = "ipfs://QM123456789";
//                     const firstProposalSourceCode    = "Proposal Source Code";

//                     // Operation
//                     var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send();
//                     await proposeOperation.confirmation();

//                     // Operation
//                     const lockProposalOperation  = await governanceInstance.methods.lockProposal(proposalId).send();
//                     await lockProposalOperation.confirmation();

//                     const proposalRoundVoteOperation = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//                     await proposalRoundVoteOperation.confirmation();

//                     var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                     await startNextRoundOperation.confirmation();

//                     await chai.expect(governanceInstance.methods.proposalRoundVote(proposalId).send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5})
//                 }
//             })

//             it('Satellite should not be able to call this entrypoint if the proposal was dropped', async () => {
//                 try{
//                     // Initial Values
//                     governanceStorage           = await governanceInstance.storage();
//                     const proposalId            = governanceStorage.nextProposalId; 
//                     var currentRound            = governanceStorage.currentRound;
//                     var currentRoundString      = Object.keys(currentRound)[0];

//                     // Operation
//                     while(governanceStorage.currentCycleEndLevel == 0 || currentRoundString !== "proposal"){
//                         var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                         await startNextRoundOperation.confirmation();
//                         governanceStorage           = await governanceInstance.storage();
//                         currentRound                = governanceStorage.currentRound
//                         currentRoundString          = Object.keys(currentRound)[0]
//                     }
//                     const firstProposalName          = "New Proposal #1";
//                     const firstProposalDesc          = "Details about new proposal #1";
//                     const firstProposalIpfs          = "ipfs://QM123456789";
//                     const firstProposalSourceCode    = "Proposal Source Code";

//                     // Operation
//                     var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send();
//                     await proposeOperation.confirmation();

//                     const lockProposalOperation  = await governanceInstance.methods.lockProposal(proposalId).send();
//                     await lockProposalOperation.confirmation();

//                     const dropProposalOperation = await governanceInstance.methods.dropProposal(proposalId).send();
//                     await dropProposalOperation.confirmation();

//                     await chai.expect(governanceInstance.methods.proposalRoundVote(proposalId).send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5})
//                 }
//             })

//             it('Satellite should not be able to call this entrypoint if the proposal is not in the current round', async () => {
//                 try{
//                     // Initial Values
//                     governanceStorage           = await governanceInstance.storage();
//                     const proposalId            = 1;
//                     var currentRound            = governanceStorage.currentRound;
//                     var currentRoundString      = Object.keys(currentRound)[0];

//                     // Operation
//                     while(governanceStorage.currentCycleEndLevel == 0 || currentRoundString !== "proposal"){
//                         var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                         await startNextRoundOperation.confirmation();
//                         governanceStorage           = await governanceInstance.storage();
//                         currentRound                = governanceStorage.currentRound
//                         currentRoundString          = Object.keys(currentRound)[0]
//                     }

//                     // Operation
//                     await chai.expect(governanceInstance.methods.proposalRoundVote(proposalId).send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5})
//                 }
//             })

//             it('Satellite should not be able to call this entrypoint if the proposal was executed', async () => {
//                 try{
//                     // UpdateConfig
//                     await signerFactory(bob.sk)
//                     var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configMinProposalRoundVotePct").send();
//                     await updateConfigOperation.confirmation();
//                     var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configMinProposalRoundVotesReq").send();
//                     await updateConfigOperation.confirmation();
//                     var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configMinQuorumPercentage").send();
//                     await updateConfigOperation.confirmation();
//                     var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configMinQuorumMvkTotal").send();
//                     await updateConfigOperation.confirmation();
//                     var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configVotingPowerRatio").send();
//                     await updateConfigOperation.confirmation();
//                     var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configMinimumStakeReqPercentage").send();
//                     await updateConfigOperation.confirmation();

//                     // Initial Values
//                     await signerFactory(eve.sk)
//                     governanceStorage           = await governanceInstance.storage()
//                     governanceStorage           = await governanceInstance.storage();
//                     const proposalId            = governanceStorage.nextProposalId; 
//                     var currentRound            = governanceStorage.currentRound;
//                     var currentRoundString      = Object.keys(currentRound)[0];

//                     while(governanceStorage.currentCycleEndLevel == 0 || currentRoundString !== "proposal"){
//                         var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                         await startNextRoundOperation.confirmation();
//                         governanceStorage           = await governanceInstance.storage();
//                         currentRound                = governanceStorage.currentRound
//                         currentRoundString          = Object.keys(currentRound)[0]
//                     }
                    
//                     const firstProposalName          = "New Proposal #1";
//                     const firstProposalDesc          = "Details about new proposal #1";
//                     const firstProposalIpfs          = "ipfs://QM123456789";
//                     const firstProposalSourceCode    = "Proposal Source Code";

//                     // Operation
//                     var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send();
//                     await proposeOperation.confirmation();

//                     const configSuccessRewardParam = governanceProxyInstance.methods.dataPackingHelper(
//                         'updateGovernanceConfig', 995, 'configSuccessReward'
//                     ).toTransferParams();
//                     const configSuccessRewardParamValue = configSuccessRewardParam.parameter.value;
//                     const callGovernanceLambdaEntrypointType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
        
//                     const updateConfigSuccessRewardPacked = await utils.tezos.rpc.packData({
//                         data: configSuccessRewardParamValue,
//                         type: callGovernanceLambdaEntrypointType
//                     }).catch(e => console.error('error:', e));
        
//                     var packedUpdateConfigSuccessRewardParam;
//                     if (updateConfigSuccessRewardPacked) {
//                         packedUpdateConfigSuccessRewardParam = updateConfigSuccessRewardPacked.packed
//                     } else {
//                       throw `packing failed`
//                     };

//                     const addDataOperation = await governanceInstance.methods.addUpdateProposalData(proposalId, "Metadata#1", packedUpdateConfigSuccessRewardParam).send();
//                     await addDataOperation.confirmation()

//                     const lockOperation = await governanceInstance.methods.lockProposal(proposalId).send();
//                     await lockOperation.confirmation()

//                     const proposalRoundVoteOperation = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//                     await proposalRoundVoteOperation.confirmation();

//                     var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                     await startNextRoundOperation.confirmation();

//                     const votingRoundVoteOperation = await governanceInstance.methods.votingRoundVote("yay").send();
//                     await votingRoundVoteOperation.confirmation();

//                     var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                     await startNextRoundOperation.confirmation();

//                     var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                     await startNextRoundOperation.confirmation();

//                     await chai.expect(governanceInstance.methods.proposalRoundVote(proposalId).send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5})
//                 }
//             })
//         })

//         describe("%dropProposal", async () => {
            
//             beforeEach("Set signer to satellite", async () => {
//                 await signerFactory(eve.sk)
//             });

//             it('Proposer should not be able to call this entrypoint if the delegation contract is not referenced in the generalContracts map or the getSatelliteOpt view doesn’t exist', async () => {
//                 try{
//                     // Initial Values
//                     await signerFactory(eve.sk);
//                     governanceStorage           = await governanceInstance.storage();
//                     const proposalId            = governanceStorage.nextProposalId; 
//                     var currentRound            = governanceStorage.currentRound;
//                     var currentRoundString      = Object.keys(currentRound)[0];

//                     // Operation
//                     while(governanceStorage.currentCycleEndLevel == 0 || currentRoundString !== "proposal"){
//                         var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                         await startNextRoundOperation.confirmation();
//                         governanceStorage           = await governanceInstance.storage();
//                         currentRound                = governanceStorage.currentRound
//                         currentRoundString          = Object.keys(currentRound)[0]
//                     }
//                     const firstProposalName          = "New Proposal #1";
//                     const firstProposalDesc          = "Details about new proposal #1";
//                     const firstProposalIpfs          = "ipfs://QM123456789";
//                     const firstProposalSourceCode    = "Proposal Source Code";

//                     // Operation
//                     var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send();
//                     await proposeOperation.confirmation();

//                     // Update config
//                     await signerFactory(bob.sk);
//                     var updateGeneralContractOperation = await governanceInstance.methods.updateGeneralContracts("delegation", delegationAddress.address).send();
//                     await updateGeneralContractOperation.confirmation();

//                     await signerFactory(eve.sk);
//                     await chai.expect(governanceInstance.methods.dropProposal(proposalId).send()).to.be.rejected;

//                     // Reset
//                     await signerFactory(bob.sk);
//                     updateGeneralContractOperation = await governanceInstance.methods.updateGeneralContracts("delegation", delegationAddress.address).send();
//                     await updateGeneralContractOperation.confirmation();

//                     governanceStorage           = await governanceInstance.storage();
//                     var generalContracts        = await governanceStorage.generalContracts;
//                 } catch(e){
//                     console.dir(e, {depth: 5})
//                 }
//             })

//             it('Proposer should not be able to call this entrypoint if the selected proposal was already executed', async () => {
//                 try{
//                     // UpdateConfig
//                     await signerFactory(bob.sk)
//                     var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configMinProposalRoundVotePct").send();
//                     await updateConfigOperation.confirmation();
//                     var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configMinProposalRoundVotesReq").send();
//                     await updateConfigOperation.confirmation();
//                     var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configMinQuorumPercentage").send();
//                     await updateConfigOperation.confirmation();
//                     var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configMinQuorumMvkTotal").send();
//                     await updateConfigOperation.confirmation();
//                     var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configVotingPowerRatio").send();
//                     await updateConfigOperation.confirmation();
//                     var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configMinimumStakeReqPercentage").send();
//                     await updateConfigOperation.confirmation();

//                     // Initial Values
//                     await signerFactory(eve.sk)
//                     governanceStorage           = await governanceInstance.storage()
//                     governanceStorage           = await governanceInstance.storage();
//                     const proposalId            = governanceStorage.nextProposalId; 
//                     var currentRound            = governanceStorage.currentRound;
//                     var currentRoundString      = Object.keys(currentRound)[0];

//                     while(governanceStorage.currentCycleEndLevel == 0 || currentRoundString !== "proposal"){
//                         var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                         await startNextRoundOperation.confirmation();
//                         governanceStorage           = await governanceInstance.storage();
//                         currentRound                = governanceStorage.currentRound
//                         currentRoundString          = Object.keys(currentRound)[0]
//                     }
                    
//                     const firstProposalName          = "New Proposal #1";
//                     const firstProposalDesc          = "Details about new proposal #1";
//                     const firstProposalIpfs          = "ipfs://QM123456789";
//                     const firstProposalSourceCode    = "Proposal Source Code";

//                     // Operation
//                     var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send();
//                     await proposeOperation.confirmation();

//                     const configSuccessRewardParam = governanceProxyInstance.methods.dataPackingHelper(
//                         'updateGovernanceConfig', 995, 'configSuccessReward'
//                     ).toTransferParams();
//                     const configSuccessRewardParamValue = configSuccessRewardParam.parameter.value;
//                     const callGovernanceLambdaEntrypointType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
        
//                     const updateConfigSuccessRewardPacked = await utils.tezos.rpc.packData({
//                         data: configSuccessRewardParamValue,
//                         type: callGovernanceLambdaEntrypointType
//                     }).catch(e => console.error('error:', e));
        
//                     var packedUpdateConfigSuccessRewardParam;
//                     if (updateConfigSuccessRewardPacked) {
//                         packedUpdateConfigSuccessRewardParam = updateConfigSuccessRewardPacked.packed
//                     } else {
//                       throw `packing failed`
//                     };

//                     const addDataOperation = await governanceInstance.methods.addUpdateProposalData(proposalId, "Metadata#1", packedUpdateConfigSuccessRewardParam).send();
//                     await addDataOperation.confirmation()

//                     const lockOperation = await governanceInstance.methods.lockProposal(proposalId).send();
//                     await lockOperation.confirmation()

//                     const proposalRoundVoteOperation = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//                     await proposalRoundVoteOperation.confirmation();

//                     var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                     await startNextRoundOperation.confirmation();

//                     const votingRoundVoteOperation = await governanceInstance.methods.votingRoundVote("yay").send();
//                     await votingRoundVoteOperation.confirmation();

//                     var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                     await startNextRoundOperation.confirmation();

//                     var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                     await startNextRoundOperation.confirmation();

//                     await chai.expect(governanceInstance.methods.dropProposal(proposalId).send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5})
//                 }
//             })

//             it('Proposer should not be able to call this entrypoint if the selected proposal is not in the current round', async () => {
//                 try{
//                     // Initial Values
//                     governanceStorage           = await governanceInstance.storage()
//                     governanceStorage           = await governanceInstance.storage();
//                     var currentRound            = governanceStorage.currentRound;
//                     var currentRoundString      = Object.keys(currentRound)[0];

//                     while(governanceStorage.currentCycleEndLevel == 0 || currentRoundString !== "proposal"){
//                         var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                         await startNextRoundOperation.confirmation();
//                         governanceStorage           = await governanceInstance.storage();
//                         currentRound                = governanceStorage.currentRound
//                         currentRoundString          = Object.keys(currentRound)[0]
//                     }
//                     await chai.expect(governanceInstance.methods.dropProposal(1).send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5})
//                 }
//             })

//             it('If dropped proposal was selected has highest voted proposal or timelock proposal, it should not be executed and should reset the current round', async () => {
//                 try{
//                     // Initial Values
//                     governanceStorage           = await governanceInstance.storage();
//                     const proposalId            = governanceStorage.nextProposalId; 
//                     var currentRound            = governanceStorage.currentRound;
//                     var currentRoundString      = Object.keys(currentRound)[0];

//                     while(governanceStorage.currentCycleEndLevel == 0 || currentRoundString !== "proposal"){
//                         var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                         await startNextRoundOperation.confirmation();
//                         governanceStorage           = await governanceInstance.storage();
//                         currentRound                = governanceStorage.currentRound
//                         currentRoundString          = Object.keys(currentRound)[0]
//                     }
                    
//                     const firstProposalName          = "New Proposal #1";
//                     const firstProposalDesc          = "Details about new proposal #1";
//                     const firstProposalIpfs          = "ipfs://QM123456789";
//                     const firstProposalSourceCode    = "Proposal Source Code";

//                     // Operation
//                     var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send();
//                     await proposeOperation.confirmation();

//                     const configSuccessRewardParam = governanceProxyInstance.methods.dataPackingHelper(
//                         'updateGovernanceConfig', 995, 'configSuccessReward'
//                     ).toTransferParams();
//                     const configSuccessRewardParamValue = configSuccessRewardParam.parameter.value;
//                     const callGovernanceLambdaEntrypointType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
        
//                     const updateConfigSuccessRewardPacked = await utils.tezos.rpc.packData({
//                         data: configSuccessRewardParamValue,
//                         type: callGovernanceLambdaEntrypointType
//                     }).catch(e => console.error('error:', e));
        
//                     var packedUpdateConfigSuccessRewardParam;
//                     if (updateConfigSuccessRewardPacked) {
//                         packedUpdateConfigSuccessRewardParam = updateConfigSuccessRewardPacked.packed
//                     } else {
//                       throw `packing failed`
//                     };

//                     const addDataOperation = await governanceInstance.methods.addUpdateProposalData(proposalId, "Metadata#1", packedUpdateConfigSuccessRewardParam).send();
//                     await addDataOperation.confirmation()

//                     const lockOperation = await governanceInstance.methods.lockProposal(proposalId).send();
//                     await lockOperation.confirmation()

//                     const proposalRoundVoteOperation = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//                     await proposalRoundVoteOperation.confirmation();

//                     var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                     await startNextRoundOperation.confirmation();

//                     // Final values
//                     governanceStorage           = await governanceInstance.storage();
//                     var currentRound            = governanceStorage.currentRound;
//                     var currentRoundString      = Object.keys(currentRound)[0];

//                     assert.strictEqual(currentRoundString, "voting");

//                     const dropProposalOperation = await governanceInstance.methods.dropProposal(proposalId).send();
//                     await dropProposalOperation.confirmation();

//                     // Final values
//                     governanceStorage           = await governanceInstance.storage();
//                     currentRound                = governanceStorage.currentRound;
//                     currentRoundString          = Object.keys(currentRound)[0];

//                     assert.strictEqual(currentRoundString, "proposal");
//                 } catch(e){
//                     console.dir(e, {depth: 5})
//                 }
//             })
//         })

//         describe("%votingRoundVote", async () => {

//             beforeEach("Set signer to satellite", async () => {
//                 await signerFactory(eve.sk)
//             });
            
//             it('Satellite should not be able to call this entrypoint if it is not the voting round', async () => {
//                 try{
//                     // Initial Values
//                     governanceStorage           = await governanceInstance.storage();
//                     var currentRound            = governanceStorage.currentRound;
//                     var currentRoundString      = Object.keys(currentRound)[0];

//                     // Operation
//                     while(governanceStorage.currentCycleEndLevel == 0 || currentRoundString !== "proposal"){
//                         var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                         await startNextRoundOperation.confirmation();
//                         governanceStorage           = await governanceInstance.storage();
//                         currentRound                = governanceStorage.currentRound
//                         currentRoundString          = Object.keys(currentRound)[0]
//                     }

//                     await chai.expect(governanceInstance.methods.votingRoundVote("yay").send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5})
//                 }
//             })

//             it('Satellite should not be able to call this entrypoint if the delegation contract is not referenced in the generalContracts map or the getSatelliteOpt view doesn’t exist', async () => {
//                 try{
//                     // Initial Values
//                     governanceStorage           = await governanceInstance.storage();
//                     const proposalId            = governanceStorage.nextProposalId; 
//                     var currentRound            = governanceStorage.currentRound;
//                     var currentRoundString      = Object.keys(currentRound)[0];

//                     // Operation
//                     while(governanceStorage.currentCycleEndLevel == 0 || currentRoundString !== "proposal"){
//                         var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                         await startNextRoundOperation.confirmation();
//                         governanceStorage           = await governanceInstance.storage();
//                         currentRound                = governanceStorage.currentRound
//                         currentRoundString          = Object.keys(currentRound)[0]
//                     }

//                     const firstProposalName          = "New Proposal #1";
//                     const firstProposalDesc          = "Details about new proposal #1";
//                     const firstProposalIpfs          = "ipfs://QM123456789";
//                     const firstProposalSourceCode    = "Proposal Source Code";

//                     // Operation
//                     var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send();
//                     await proposeOperation.confirmation();

//                     const configSuccessRewardParam = governanceProxyInstance.methods.dataPackingHelper(
//                         'updateGovernanceConfig', 995, 'configSuccessReward'
//                     ).toTransferParams();
//                     const configSuccessRewardParamValue = configSuccessRewardParam.parameter.value;
//                     const callGovernanceLambdaEntrypointType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
        
//                     const updateConfigSuccessRewardPacked = await utils.tezos.rpc.packData({
//                         data: configSuccessRewardParamValue,
//                         type: callGovernanceLambdaEntrypointType
//                     }).catch(e => console.error('error:', e));
        
//                     var packedUpdateConfigSuccessRewardParam;
//                     if (updateConfigSuccessRewardPacked) {
//                         packedUpdateConfigSuccessRewardParam = updateConfigSuccessRewardPacked.packed
//                     } else {
//                       throw `packing failed`
//                     };

//                     const addDataOperation = await governanceInstance.methods.addUpdateProposalData(proposalId, "Metadata#1", packedUpdateConfigSuccessRewardParam).send();
//                     await addDataOperation.confirmation()

//                     const lockOperation = await governanceInstance.methods.lockProposal(proposalId).send();
//                     await lockOperation.confirmation()

//                     const proposalRoundVoteOperation = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//                     await proposalRoundVoteOperation.confirmation();

//                     var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                     await startNextRoundOperation.confirmation();


//                     // Update config
//                     await signerFactory(bob.sk);
//                     var updateGeneralContractOperation = await governanceInstance.methods.updateGeneralContracts("delegation", delegationAddress.address).send();
//                     await updateGeneralContractOperation.confirmation();

//                     await signerFactory(eve.sk)
//                     await chai.expect(governanceInstance.methods.votingRoundVote("yay").send()).to.be.rejected;

//                     // Reset
//                     await signerFactory(bob.sk)
//                     updateGeneralContractOperation = await governanceInstance.methods.updateGeneralContracts("delegation", delegationAddress.address).send();
//                     await updateGeneralContractOperation.confirmation();
//                 } catch(e){
//                     console.dir(e, {depth: 5})
//                 }
//             })
//         })

//         describe("%executeProposal", async () => {
            
//             beforeEach("Set signer to satellite", async () => {
//                 await signerFactory(eve.sk)
//             });
            
//             it('User should be able to call this entrypoint automatically when switching from the timelock round to the new round', async () => {
//                 try{
//                     // UpdateConfig
//                     await signerFactory(bob.sk)
//                     var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configMinProposalRoundVotePct").send();
//                     await updateConfigOperation.confirmation();
//                     var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configMinProposalRoundVotesReq").send();
//                     await updateConfigOperation.confirmation();
//                     var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configMinQuorumPercentage").send();
//                     await updateConfigOperation.confirmation();
//                     var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configMinQuorumMvkTotal").send();
//                     await updateConfigOperation.confirmation();
//                     var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configVotingPowerRatio").send();
//                     await updateConfigOperation.confirmation();
//                     var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configMinimumStakeReqPercentage").send();
//                     await updateConfigOperation.confirmation();

//                     // Initial Values
//                     await signerFactory(eve.sk)
//                     governanceStorage           = await governanceInstance.storage();
//                     const proposalId            = governanceStorage.nextProposalId; 
//                     var currentRound            = governanceStorage.currentRound;
//                     var currentRoundString      = Object.keys(currentRound)[0];

//                     while(governanceStorage.currentCycleEndLevel == 0 || currentRoundString !== "proposal"){
//                         var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                         await startNextRoundOperation.confirmation();
//                         governanceStorage           = await governanceInstance.storage();
//                         currentRound                = governanceStorage.currentRound
//                         currentRoundString          = Object.keys(currentRound)[0]
//                     }
                    
//                     const firstProposalName          = "New Proposal #1";
//                     const firstProposalDesc          = "Details about new proposal #1";
//                     const firstProposalIpfs          = "ipfs://QM123456789";
//                     const firstProposalSourceCode    = "Proposal Source Code";

//                     // Operation
//                     var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send();
//                     await proposeOperation.confirmation();

//                     const configSuccessRewardParam = governanceProxyInstance.methods.dataPackingHelper(
//                         'updateGovernanceConfig', 995, 'configSuccessReward'
//                     ).toTransferParams();
//                     const configSuccessRewardParamValue = configSuccessRewardParam.parameter.value;
//                     const callGovernanceLambdaEntrypointType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
        
//                     const updateConfigSuccessRewardPacked = await utils.tezos.rpc.packData({
//                         data: configSuccessRewardParamValue,
//                         type: callGovernanceLambdaEntrypointType
//                     }).catch(e => console.error('error:', e));
        
//                     var packedUpdateConfigSuccessRewardParam;
//                     if (updateConfigSuccessRewardPacked) {
//                         packedUpdateConfigSuccessRewardParam = updateConfigSuccessRewardPacked.packed
//                     } else {
//                       throw `packing failed`
//                     };

//                     const addDataOperation = await governanceInstance.methods.addUpdateProposalData(proposalId, "Metadata#1", packedUpdateConfigSuccessRewardParam).send();
//                     await addDataOperation.confirmation()

//                     const lockOperation = await governanceInstance.methods.lockProposal(proposalId).send();
//                     await lockOperation.confirmation()

//                     const proposalRoundVoteOperation = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//                     await proposalRoundVoteOperation.confirmation();

//                     var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                     await startNextRoundOperation.confirmation();

//                     const votingRoundVoteOperation = await governanceInstance.methods.votingRoundVote("yay").send();
//                     await votingRoundVoteOperation.confirmation();

//                     var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                     await startNextRoundOperation.confirmation();

//                     var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                     await startNextRoundOperation.confirmation();

                    
//                     governanceStorage           = await governanceInstance.storage();
//                     var currentRound            = governanceStorage.currentRound;
//                     var currentRoundString      = Object.keys(currentRound)[0];
//                     const proposal              = await governanceStorage.proposalLedger.get(proposalId);

//                     assert.strictEqual(currentRoundString, "proposal")
//                     assert.strictEqual(proposal.executed, true)
//                 } catch(e){
//                     console.dir(e, {depth: 5})
//                 }
//             })

//             it('User should not be able to call this entrypoint if there is no proposal to execute', async () => {
//                 try{
//                     // Initial Values
//                     governanceStorage           = await governanceInstance.storage();
//                     const proposalId            = governanceStorage.nextProposalId; 
//                     var currentRound            = governanceStorage.currentRound;
//                     var currentRoundString      = Object.keys(currentRound)[0];

//                     while(governanceStorage.currentCycleEndLevel == 0 || currentRoundString !== "proposal"){
//                         var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                         await startNextRoundOperation.confirmation();
//                         governanceStorage           = await governanceInstance.storage();
//                         currentRound                = governanceStorage.currentRound
//                         currentRoundString          = Object.keys(currentRound)[0]
//                     }
                    
//                     const firstProposalName          = "New Proposal #1";
//                     const firstProposalDesc          = "Details about new proposal #1";
//                     const firstProposalIpfs          = "ipfs://QM123456789";
//                     const firstProposalSourceCode    = "Proposal Source Code";

//                     // Operation
//                     var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send();
//                     await proposeOperation.confirmation();

//                     const configSuccessRewardParam = governanceProxyInstance.methods.dataPackingHelper(
//                         'updateGovernanceConfig', 995, 'configSuccessReward'
//                     ).toTransferParams();
//                     const configSuccessRewardParamValue = configSuccessRewardParam.parameter.value;
//                     const callGovernanceLambdaEntrypointType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
        
//                     const updateConfigSuccessRewardPacked = await utils.tezos.rpc.packData({
//                         data: configSuccessRewardParamValue,
//                         type: callGovernanceLambdaEntrypointType
//                     }).catch(e => console.error('error:', e));
        
//                     var packedUpdateConfigSuccessRewardParam;
//                     if (updateConfigSuccessRewardPacked) {
//                         packedUpdateConfigSuccessRewardParam = updateConfigSuccessRewardPacked.packed
//                     } else {
//                       throw `packing failed`
//                     };

//                     const addDataOperation = await governanceInstance.methods.addUpdateProposalData(proposalId, "Metadata#1", packedUpdateConfigSuccessRewardParam).send();
//                     await addDataOperation.confirmation()

//                     const lockOperation = await governanceInstance.methods.lockProposal(proposalId).send();
//                     await lockOperation.confirmation()

//                     const proposalRoundVoteOperation = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//                     await proposalRoundVoteOperation.confirmation();

//                     var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                     await startNextRoundOperation.confirmation();

//                     const votingRoundVoteOperation = await governanceInstance.methods.votingRoundVote("nay").send();
//                     await votingRoundVoteOperation.confirmation();

//                     var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                     await startNextRoundOperation.confirmation();

//                     await chai.expect(governanceInstance.methods.executeProposal().send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5})
//                 }
//             })

//             it('User should be able to call this entrypoint automatically when switching from the timelock round to the new round', async () => {
//                 try{
//                     // Initial Values
//                     governanceStorage           = await governanceInstance.storage();
//                     const proposalId            = governanceStorage.nextProposalId; 
//                     var currentRound            = governanceStorage.currentRound;
//                     var currentRoundString      = Object.keys(currentRound)[0];

//                     while(governanceStorage.currentCycleEndLevel == 0 || currentRoundString !== "proposal"){
//                         var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                         await startNextRoundOperation.confirmation();
//                         governanceStorage           = await governanceInstance.storage();
//                         currentRound                = governanceStorage.currentRound
//                         currentRoundString          = Object.keys(currentRound)[0]
//                     }
                    
//                     const firstProposalName          = "New Proposal #1";
//                     const firstProposalDesc          = "Details about new proposal #1";
//                     const firstProposalIpfs          = "ipfs://QM123456789";
//                     const firstProposalSourceCode    = "Proposal Source Code";

//                     // Operation
//                     var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send();
//                     await proposeOperation.confirmation();

//                     const configSuccessRewardParam = governanceProxyInstance.methods.dataPackingHelper(
//                         'updateGovernanceConfig', 995, 'configSuccessReward'
//                     ).toTransferParams();
//                     const configSuccessRewardParamValue = configSuccessRewardParam.parameter.value;
//                     const callGovernanceLambdaEntrypointType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
        
//                     const updateConfigSuccessRewardPacked = await utils.tezos.rpc.packData({
//                         data: configSuccessRewardParamValue,
//                         type: callGovernanceLambdaEntrypointType
//                     }).catch(e => console.error('error:', e));
        
//                     var packedUpdateConfigSuccessRewardParam;
//                     if (updateConfigSuccessRewardPacked) {
//                         packedUpdateConfigSuccessRewardParam = updateConfigSuccessRewardPacked.packed
//                     } else {
//                       throw `packing failed`
//                     };

//                     const addDataOperation = await governanceInstance.methods.addUpdateProposalData(proposalId, "Metadata#1", packedUpdateConfigSuccessRewardParam).send();
//                     await addDataOperation.confirmation()

//                     const lockOperation = await governanceInstance.methods.lockProposal(proposalId).send();
//                     await lockOperation.confirmation()

//                     const proposalRoundVoteOperation = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//                     await proposalRoundVoteOperation.confirmation();

//                     var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                     await startNextRoundOperation.confirmation();

//                     const votingRoundVoteOperation = await governanceInstance.methods.votingRoundVote("yay").send();
//                     await votingRoundVoteOperation.confirmation();

//                     var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                     await startNextRoundOperation.confirmation();

//                     var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                     await startNextRoundOperation.confirmation();

                    
//                     governanceStorage           = await governanceInstance.storage();
//                     var currentRound            = governanceStorage.currentRound;
//                     var currentRoundString      = Object.keys(currentRound)[0];
//                     const proposal              = await governanceStorage.proposalLedger.get(proposalId);

//                     assert.strictEqual(currentRoundString, "proposal")
//                     assert.strictEqual(proposal.executed, true)

//                     await chai.expect(governanceInstance.methods.executeProposal().send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5})
//                 }
//             })

//             it('User should not be able to call this entrypoint if the proposal was dropped', async () => {
//                 try{
//                     // Initial Values
//                     governanceStorage           = await governanceInstance.storage();
//                     const proposalId            = governanceStorage.nextProposalId; 
//                     var currentRound            = governanceStorage.currentRound;
//                     var currentRoundString      = Object.keys(currentRound)[0];

//                     while(governanceStorage.currentCycleEndLevel == 0 || currentRoundString !== "proposal"){
//                         var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                         await startNextRoundOperation.confirmation();
//                         governanceStorage           = await governanceInstance.storage();
//                         currentRound                = governanceStorage.currentRound
//                         currentRoundString          = Object.keys(currentRound)[0]
//                     }
                    
//                     const firstProposalName          = "New Proposal #1";
//                     const firstProposalDesc          = "Details about new proposal #1";
//                     const firstProposalIpfs          = "ipfs://QM123456789";
//                     const firstProposalSourceCode    = "Proposal Source Code";

//                     // Operation
//                     var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send();
//                     await proposeOperation.confirmation();

//                     const configSuccessRewardParam = governanceProxyInstance.methods.dataPackingHelper(
//                         'updateGovernanceConfig', 995, 'configSuccessReward'
//                     ).toTransferParams();
//                     const configSuccessRewardParamValue = configSuccessRewardParam.parameter.value;
//                     const callGovernanceLambdaEntrypointType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
        
//                     const updateConfigSuccessRewardPacked = await utils.tezos.rpc.packData({
//                         data: configSuccessRewardParamValue,
//                         type: callGovernanceLambdaEntrypointType
//                     }).catch(e => console.error('error:', e));
        
//                     var packedUpdateConfigSuccessRewardParam;
//                     if (updateConfigSuccessRewardPacked) {
//                         packedUpdateConfigSuccessRewardParam = updateConfigSuccessRewardPacked.packed
//                     } else {
//                       throw `packing failed`
//                     };

//                     const addDataOperation = await governanceInstance.methods.addUpdateProposalData(proposalId, "Metadata#1", packedUpdateConfigSuccessRewardParam).send();
//                     await addDataOperation.confirmation()

//                     const lockOperation = await governanceInstance.methods.lockProposal(proposalId).send();
//                     await lockOperation.confirmation()

//                     const proposalRoundVoteOperation = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//                     await proposalRoundVoteOperation.confirmation();

//                     var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                     await startNextRoundOperation.confirmation();

//                     const votingRoundVoteOperation = await governanceInstance.methods.votingRoundVote("yay").send();
//                     await votingRoundVoteOperation.confirmation();

//                     var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                     await startNextRoundOperation.confirmation();

//                     var dropProposalOperation = await governanceInstance.methods.dropProposal(proposalId).send();
//                     await dropProposalOperation.confirmation();

//                     var startNextRoundOperation = await governanceInstance.methods.startNextRound(false).send();
//                     await startNextRoundOperation.confirmation();
                    
//                     governanceStorage           = await governanceInstance.storage();
//                     var currentRound            = governanceStorage.currentRound;
//                     var currentRoundString      = Object.keys(currentRound)[0];
//                     const proposal              = await governanceStorage.proposalLedger.get(proposalId);

//                     assert.strictEqual(currentRoundString, "proposal")
//                     assert.strictEqual(proposal.executed, false)
//                     assert.strictEqual(proposal.status, "DROPPED")

//                     await chai.expect(governanceInstance.methods.executeProposal().send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5})
//                 }
//             })

//             it('User should not be able to call this entrypoint if there is no data to execute in the proposal', async () => {
//                 try{
//                     // Initial Values
//                     governanceStorage           = await governanceInstance.storage();
//                     const proposalId            = governanceStorage.nextProposalId; 
//                     var currentRound            = governanceStorage.currentRound;
//                     var currentRoundString      = Object.keys(currentRound)[0];

//                     while(governanceStorage.currentCycleEndLevel == 0 || currentRoundString !== "proposal"){
//                         var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                         await startNextRoundOperation.confirmation();
//                         governanceStorage           = await governanceInstance.storage();
//                         currentRound                = governanceStorage.currentRound
//                         currentRoundString          = Object.keys(currentRound)[0]
//                     }
                    
//                     const firstProposalName          = "New Proposal #1";
//                     const firstProposalDesc          = "Details about new proposal #1";
//                     const firstProposalIpfs          = "ipfs://QM123456789";
//                     const firstProposalSourceCode    = "Proposal Source Code";

//                     // Operation
//                     var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send();
//                     await proposeOperation.confirmation();

//                     const lockOperation = await governanceInstance.methods.lockProposal(proposalId).send();
//                     await lockOperation.confirmation()

//                     const proposalRoundVoteOperation = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//                     await proposalRoundVoteOperation.confirmation();

//                     var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                     await startNextRoundOperation.confirmation();

//                     const votingRoundVoteOperation = await governanceInstance.methods.votingRoundVote("yay").send();
//                     await votingRoundVoteOperation.confirmation();

//                     var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                     await startNextRoundOperation.confirmation();

//                     var dropProposalOperation = await governanceInstance.methods.dropProposal(proposalId).send();
//                     await dropProposalOperation.confirmation();

//                     var startNextRoundOperation = await governanceInstance.methods.startNextRound(false).send();
//                     await startNextRoundOperation.confirmation();
                    
//                     governanceStorage           = await governanceInstance.storage();
//                     var currentRound            = governanceStorage.currentRound;
//                     var currentRoundString      = Object.keys(currentRound)[0];
//                     const proposal              = await governanceStorage.proposalLedger.get(proposalId);

//                     assert.strictEqual(currentRoundString, "proposal")
//                     assert.strictEqual(proposal.executed, false)
                    
//                     await chai.expect(governanceInstance.methods.executeProposal().send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5})
//                 }
//             })

//             it('User should not be able to call this entrypoint if the metadata cannot be unpack', async () => {
//                 try{
//                     // Initial Values
//                     governanceStorage           = await governanceInstance.storage();
//                     const proposalId            = governanceStorage.nextProposalId; 
//                     var currentRound            = governanceStorage.currentRound;
//                     var currentRoundString      = Object.keys(currentRound)[0];

//                     while(governanceStorage.currentCycleEndLevel == 0 || currentRoundString !== "proposal"){
//                         var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                         await startNextRoundOperation.confirmation();
//                         governanceStorage           = await governanceInstance.storage();
//                         currentRound                = governanceStorage.currentRound
//                         currentRoundString          = Object.keys(currentRound)[0]
//                     }
                    
//                     const firstProposalName          = "New Proposal #1";
//                     const firstProposalDesc          = "Details about new proposal #1";
//                     const firstProposalIpfs          = "ipfs://QM123456789";
//                     const firstProposalSourceCode    = "Proposal Source Code";

//                     // Operation
//                     var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send();
//                     await proposeOperation.confirmation();

//                     const addDataOperation = await governanceInstance.methods.addUpdateProposalData(proposalId, "Metadata#1", "TestWithWrongData").send();
//                     await addDataOperation.confirmation()

//                     const lockOperation = await governanceInstance.methods.lockProposal(proposalId).send();
//                     await lockOperation.confirmation()

//                     const proposalRoundVoteOperation = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//                     await proposalRoundVoteOperation.confirmation();

//                     var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                     await startNextRoundOperation.confirmation();

//                     const votingRoundVoteOperation = await governanceInstance.methods.votingRoundVote("yay").send();
//                     await votingRoundVoteOperation.confirmation();

//                     var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
//                     await startNextRoundOperation.confirmation();

//                     var startNextRoundOperation = await governanceInstance.methods.startNextRound(false).send();
//                     await startNextRoundOperation.confirmation();
                    
//                     governanceStorage           = await governanceInstance.storage();
//                     var currentRound            = governanceStorage.currentRound;
//                     var currentRoundString      = Object.keys(currentRound)[0];
//                     const proposal              = await governanceStorage.proposalLedger.get(proposalId);

//                     assert.strictEqual(currentRoundString, "proposal")
//                     assert.strictEqual(proposal.executed, false)

//                     await chai.expect(governanceInstance.methods.executeProposal().send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5})
//                 }
//             })
//         })
//     })

//     describe("%breakGlass", async () => {

//         beforeEach("Set signer to satellite", async () => {
//             await signerFactory(eve.sk)
//         });

//         it('Other contracts should not be able to call this entrypoint', async () => {
//             try{
//                 // Set all contracts admin to governance address if it is not
//                 await signerFactory(bob.sk);
//                 await chai.expect(governanceInstance.methods.breakGlass().send()).to.be.rejected;
//             } catch(e){
//                 console.dir(e, {depth: 5})
//             }
//         })

//         it('Emergency Governance contract should not be able to call this entrypoint is the breakGlass contract does not exist in the generalContracts map', async () => {
//             try{
//                 // Set all contracts admin to governance address if it is not
//                 await signerFactory(bob.sk);
//                 governanceStorage             = await governanceInstance.storage();
//                 var generalContracts          = governanceStorage.generalContracts.entries();

//                 // Update general contracts
//                 var updateGeneralContractOperation = await governanceInstance.methods.updateGeneralContracts("breakGlass", breakGlassAddress.address).send();
//                 await updateGeneralContractOperation.confirmation();
//                 for (let entry of generalContracts){
//                     // Get contract storage
//                     var contract        = await utils.tezos.contract.at(entry[1]);
//                     var storage:any     = await contract.storage();

//                     // Check admin
//                     if(storage.hasOwnProperty('admin') && storage.admin!==breakGlassAddress.address){
//                         var setAdminOperation   = await contract.methods.setAdmin(governanceProxyAddress.address).send();
//                         await setAdminOperation.confirmation()
//                     }
//                 }

//                 // Trigger emergency governance and breakGlass
//                 var updateConfigOperation       = await emergencyGovernanceInstance.methods.updateConfig(1,"configStakedMvkPercentRequired").send();
//                 await updateConfigOperation.confirmation();
//                 updateConfigOperation           = await emergencyGovernanceInstance.methods.updateConfig(0,"configRequiredFeeMutez").send();
//                 await updateConfigOperation.confirmation();
//                 const emergencyControlOperation = await emergencyGovernanceInstance.methods.triggerEmergencyControl(
//                     "Test emergency governance", 
//                     "For tests"
//                 ).send();
//                 await emergencyControlOperation.confirmation();
//                 await chai.expect(emergencyGovernanceInstance.methods.voteForEmergencyControl().send()).to.be.rejected;

//                 // Check if glass was broken
//                 breakGlassStorage       = await breakGlassInstance.storage();
//                 const glassBroken       = breakGlassStorage.glassBroken;
//                 assert.equal(glassBroken, false);

//                 // Check admin and pause in all contracts
//                 governanceStorage       = await governanceInstance.storage();
//                 generalContracts        = governanceStorage.generalContracts.entries();
//                 for (let entry of generalContracts){
//                     // Get contract storage
//                     var contract        = await utils.tezos.contract.at(entry[1]);
//                     var storage:any     = await contract.storage();

//                     // Check admin
//                     if(storage.hasOwnProperty('admin')){
//                         assert.equal(storage.admin, governanceAddress.address)
//                     }

//                     // Check pause
//                     var breakGlassConfig    = storage.breakGlassConfig
//                     if(storage.hasOwnProperty('breakGlassConfig')){
//                         for (let [key, value] of Object.entries(breakGlassConfig)){
//                             assert.equal(value, false);
//                         }
//                     }
//                 }

//                 // Reset general contracts
//                 var updateGeneralContractOperation = await governanceInstance.methods.updateGeneralContracts("breakGlass", breakGlassAddress.address).send();
//                 await updateGeneralContractOperation.confirmation();
//             } catch(e){
//                 console.dir(e, {depth: 5})
//             }
//         })

//         it('Emergency Governance contract should be able to call this entrypoint and call setAdmin/pauseAll in all contracts of the generalContracts map', async () => {
//             try{
//                 // Set all contracts admin to governance address if it is not
//                 await signerFactory(bob.sk);
//                 governanceStorage             = await governanceInstance.storage();
//                 var generalContracts          = governanceStorage.generalContracts.entries();

//                 var updateConfigOperation       = await emergencyGovernanceInstance.methods.updateConfig(1,"configStakedMvkPercentRequired").send();
//                 await updateConfigOperation.confirmation();
//                 updateConfigOperation           = await emergencyGovernanceInstance.methods.updateConfig(0,"configRequiredFeeMutez").send();
//                 await updateConfigOperation.confirmation();

//                 for (let entry of generalContracts){
//                     // Get contract storage
//                     var contract        = await utils.tezos.contract.at(entry[1]);
//                     var storage:any     = await contract.storage();

//                     // Check admin
//                     if(storage.hasOwnProperty('admin') && storage.admin!==governanceAddress.address && storage.admin!==breakGlassAddress.address){
//                         var setAdminOperation   = await contract.methods.setAdmin(governanceProxyAddress.address).send();
//                         await setAdminOperation.confirmation()
//                     }
//                 }

//                 // Trigger emergency governance and breakGlass
//                 // const emergencyControlOperation = await emergencyGovernanceInstance.methods.triggerEmergencyControl(
//                 //     "Test emergency governance", 
//                 //     "For tests"
//                 // ).send();
//                 // await emergencyControlOperation.confirmation();
//                 const voteOperation             = await emergencyGovernanceInstance.methods.voteForEmergencyControl().send();
//                 await voteOperation.confirmation();

//                 // Check if glass was broken
//                 breakGlassStorage       = await breakGlassInstance.storage();
//                 const glassBroken       = breakGlassStorage.glassBroken;
//                 assert.equal(glassBroken, true);

//                 // Check admin and pause in all contracts
//                 governanceStorage       = await governanceInstance.storage();
//                 generalContracts        = governanceStorage.generalContracts.entries();
//                 for (let entry of generalContracts){
//                     // Get contract storage
//                     var contract        = await utils.tezos.contract.at(entry[1]);
//                     var storage:any     = await contract.storage();

//                     // Check admin
//                     if(storage.hasOwnProperty('admin')){
//                         assert.equal(storage.admin, breakGlassAddress.address)
//                     }

//                     // Check pause
//                     var breakGlassConfig    = storage.breakGlassConfig
//                     if(storage.hasOwnProperty('breakGlassConfig')){
//                         for (let [key, value] of Object.entries(breakGlassConfig)){
//                             assert.equal(value, true);
//                         }
//                     }
//                 }
//             } catch(e){
//                 console.dir(e, {depth: 5})
//             }
//         })
//     })
// });