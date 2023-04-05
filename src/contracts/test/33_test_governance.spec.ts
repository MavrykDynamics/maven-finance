import assert from "assert";
import { MVK, Utils } from "./helpers/Utils";

const chai = require("chai");
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

// ------------------------------------------------------------------------------
// Contract Address
// ------------------------------------------------------------------------------

import contractDeployments from './contractDeployments.json'

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { bob, alice, eve, mallory, trudy, oscar } from "../scripts/sandbox/accounts";
import { compileLambdaFunction } from "../scripts/proxyLambdaFunctionMaker/proxyLambdaFunctionPacker";
import * as helperFunctions from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("Governance tests", async () => {
    
    var utils: Utils;
    let tezos

    let doormanInstance;
    let delegationInstance;
    let mvkTokenInstance;
    let governanceInstance;
    let governanceProxyInstance;
    let emergencyGovernanceInstance;
    let breakGlassInstance;
    let councilInstance;

    let doormanStorage;
    let delegationStorage;
    let mvkTokenStorage;
    let governanceStorage;
    let governanceProxyStorage;
    let emergencyGovernanceStorage;
    let breakGlassStorage;
    let councilStorage;

    before("setup", async () => {
        try {
            
            utils = new Utils();
            await utils.init(bob.sk);
            let tezos
            
            doormanInstance             = await utils.tezos.contract.at(contractDeployments.doorman.address);
            delegationInstance          = await utils.tezos.contract.at(contractDeployments.delegation.address);
            mvkTokenInstance            = await utils.tezos.contract.at(contractDeployments.mvkToken.address);
            governanceInstance          = await utils.tezos.contract.at(contractDeployments.governance.address);
            governanceProxyInstance     = await utils.tezos.contract.at(contractDeployments.governanceProxy.address);
            emergencyGovernanceInstance = await utils.tezos.contract.at(contractDeployments.emergencyGovernance.address);
            breakGlassInstance          = await utils.tezos.contract.at(contractDeployments.breakGlass.address);
            councilInstance             = await utils.tezos.contract.at(contractDeployments.council.address);
                
            doormanStorage              = await doormanInstance.storage();
            delegationStorage           = await delegationInstance.storage();
            mvkTokenStorage             = await mvkTokenInstance.storage();
            governanceStorage           = await governanceInstance.storage();
            governanceProxyStorage      = await governanceProxyInstance.storage();
            emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
            breakGlassStorage           = await breakGlassInstance.storage();
            councilStorage              = await councilInstance.storage();
    
            // console.log('-- -- -- -- -- Governance Tests -- -- -- --')
            // console.log('Doorman Contract deployed at:', doormanInstance.address);
            // console.log('Delegation Contract deployed at:', delegationInstance.address);
            // console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
            // console.log('Governance Contract deployed at:', governanceInstance.address);
            // console.log('Emergency Governance Contract deployed at:', emergencyGovernanceInstance.address);
            // console.log('Bob address: ' + bob.pkh);
            // console.log('Alice address: ' + alice.pkh);
            // console.log('Eve address: ' + eve.pkh);
    
            // Init multiple satellites
            delegationStorage       = await delegationInstance.storage();
            const satelliteCreated  = await delegationStorage.satelliteLedger.get(eve.pkh);
            if(satelliteCreated === undefined){
                var updateOperators = await mvkTokenInstance.methods
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
                await updateOperators.confirmation();
                var stakeOperation = await doormanInstance.methods.stake(MVK(10000)).send();
                await stakeOperation.confirmation();
                
                await helperFunctions.signerFactory(tezos, alice.sk)
                updateOperators = await mvkTokenInstance.methods
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
                await updateOperators.confirmation();
                stakeOperation = await doormanInstance.methods.stake(MVK(1)).send();
                await stakeOperation.confirmation();
                
                var registerAsSatellite = await delegationInstance.methods
                .registerAsSatellite(
                    "Alice Satellite", 
                    "Test description", 
                    "Test image", 
                    "Test website", 
                    700
                ).send();
                await registerAsSatellite.confirmation();
    
                await helperFunctions.signerFactory(tezos, eve.sk)
                updateOperators = await mvkTokenInstance.methods
                    .update_operators([
                    {
                        add_operator: {
                            owner: eve.pkh,
                            operator: contractDeployments.doorman.address,
                            token_id: 0,
                        },
                    },
                    ])
                    .send()
                await updateOperators.confirmation();
                stakeOperation = await doormanInstance.methods.stake(MVK(20000)).send();
                await stakeOperation.confirmation();
                registerAsSatellite = await delegationInstance.methods
                .registerAsSatellite(
                    "Eve Satellite", 
                    "Test description", 
                    "Test image", 
                    "Test website", 
                    700
                ).send();
                await registerAsSatellite.confirmation();
    
                // Reset signer
                await helperFunctions.signerFactory(tezos, bob.sk)
        
                // Set council contract admin to governance proxy for later tests
                const setAdminOperation = await councilInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                await setAdminOperation.confirmation()
            }
        } catch (e) {
            console.dir(e, {depth: 5})
        }
    });

    describe("First Cycle", async () => {
        describe("%updateConfig", async () => {
            before("Configure delegation ratio on delegation contract", async () => {
                try{
                    // Initial Values
                    await helperFunctions.signerFactory(tezos, bob.sk)
                    delegationStorage   = await delegationInstance.storage();
                    const newConfigValue = 10;

                    // Operation
                    const updateConfigOperation = await delegationInstance.methods.updateConfig(newConfigValue,"configDelegationRatio").send();
                    await updateConfigOperation.confirmation();

                    // Final values
                    delegationStorage   = await delegationInstance.storage();
                    const updateConfigValue = delegationStorage.config.delegationRatio;

                    // Assertions
                    assert.equal(updateConfigValue, newConfigValue);
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            });
            beforeEach("Set signer to admin", async () => {
                await helperFunctions.signerFactory(tezos, bob.sk)
            });
            it('Admin should be able to call the entrypoint and configure the success reward', async () => {
                try{
                    // Initial Values
                    governanceStorage = await governanceInstance.storage();
                    const newConfigValue = 12000;

                    // Operation
                    const updateConfigOperation = await governanceInstance.methods.updateConfig(newConfigValue,"configSuccessReward").send();
                    await updateConfigOperation.confirmation();

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const updateConfigValue = governanceStorage.config.successReward;

                    // Assertions
                    assert.equal(updateConfigValue, newConfigValue);
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            });
            it('Admin should be able to call the entrypoint and configure the min proposal round vote percentage required', async () => {
                try{
                    // Initial Values
                    governanceStorage = await governanceInstance.storage();
                    const newConfigValue = 10;

                    // Operation
                    const updateConfigOperation = await governanceInstance.methods.updateConfig(newConfigValue,"configMinProposalRoundVotePct").send();
                    await updateConfigOperation.confirmation();

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const updateConfigValue = governanceStorage.config.minProposalRoundVotePercentage;

                    // Assertions
                    assert.equal(updateConfigValue, newConfigValue);
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            });
            it('Admin should not be able to call the entrypoint and configure the min proposal round vote percentage required if it exceed 100%', async () => {
                try{
                    // Initial Values
                    governanceStorage = await governanceInstance.storage();
                    const currentConfigValue = governanceStorage.config.minProposalRoundVotePercentage;
                    const newConfigValue = 10001;

                    // Operation
                    await chai.expect(governanceInstance.methods.updateConfig(newConfigValue,"configMinProposalRoundVotePct").send()).to.be.rejected;

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const updateConfigValue = governanceStorage.config.minProposalRoundVotePercentage;

                    // Assertions
                    assert.notEqual(newConfigValue, currentConfigValue);
                    assert.equal(updateConfigValue.toNumber(), currentConfigValue.toNumber());
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            });
            it('Admin should be able to call the entrypoint and configure the min proposal round votes required', async () => {
                try{
                    // Initial Values
                    governanceStorage = await governanceInstance.storage();
                    const newConfigValue = 1;

                    // Operation
                    const updateConfigOperation = await governanceInstance.methods.updateConfig(newConfigValue,"configMinProposalRoundVotesReq").send();
                    await updateConfigOperation.confirmation();

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const updateConfigValue = governanceStorage.config.minProposalRoundVotesRequired;

                    // Assertions
                    assert.equal(updateConfigValue, newConfigValue);
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            });
            it('Admin should be able to call the entrypoint and configure the min proposal round vote percentage required', async () => {
                try{
                    // Initial Values
                    governanceStorage = await governanceInstance.storage();
                    const newConfigValue = 1;

                    // Operation
                    const updateConfigOperation = await governanceInstance.methods.updateConfig(newConfigValue,"configMinQuorumPercentage").send();
                    await updateConfigOperation.confirmation();

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const updateConfigValue = governanceStorage.config.minQuorumPercentage;

                    // Assertions
                    assert.equal(updateConfigValue, newConfigValue);
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            });
            it('Admin should not be able to call the entrypoint and configure the min proposal round vote percentage required if it exceed 100%', async () => {
                try{
                    // Initial Values
                    governanceStorage = await governanceInstance.storage();
                    const currentConfigValue = governanceStorage.config.minQuorumPercentage;
                    const newConfigValue = 10001;

                    // Operation
                    await chai.expect(governanceInstance.methods.updateConfig(newConfigValue,"configMinQuorumPercentage").send()).to.be.rejected;

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const updateConfigValue = governanceStorage.config.minQuorumPercentage;

                    // Assertions
                    assert.notEqual(newConfigValue, currentConfigValue);
                    assert.equal(updateConfigValue.toNumber(), currentConfigValue.toNumber());
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            });
            it('Admin should be able to call the entrypoint and configure the min yay votes mvk total required', async () => {
                try{
                    // Initial Values
                    governanceStorage = await governanceInstance.storage();
                    const newConfigValue = 5050;

                    // Operation
                    const updateConfigOperation = await governanceInstance.methods.updateConfig(newConfigValue,"configMinYayVotePercentage").send();
                    await updateConfigOperation.confirmation();

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const updateConfigValue = governanceStorage.config.minYayVotePercentage;

                    // Assertions
                    assert.equal(updateConfigValue, newConfigValue);
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            });
            it('Admin should be able to call the entrypoint and configure the proposal submission fee', async () => {
                try{
                    // Initial Values
                    governanceStorage = await governanceInstance.storage();
                    const newConfigValue = 100000;

                    // Operation
                    const updateConfigOperation = await governanceInstance.methods.updateConfig(newConfigValue,"configProposeFeeMutez").send();
                    await updateConfigOperation.confirmation();

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const updateConfigValue = governanceStorage.config.proposalSubmissionFeeMutez;

                    // Assertions
                    assert.equal(updateConfigValue, newConfigValue);
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            });
            it('Admin should be able to call the entrypoint and configure the max proposals per satellite', async () => {
                try{
                    // Initial Values
                    governanceStorage = await governanceInstance.storage();
                    const newConfigValue = 5;

                    // Operation
                    const updateConfigOperation = await governanceInstance.methods.updateConfig(newConfigValue,"configMaxProposalsPerSatellite").send();
                    await updateConfigOperation.confirmation();

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const updateConfigValue = governanceStorage.config.maxProposalsPerSatellite;

                    // Assertions
                    assert.equal(updateConfigValue, newConfigValue);
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            });
            it('Admin should be able to call the entrypoint and configure the blocks per proposal round', async () => {
                try{
                    // Initial Values
                    governanceStorage = await governanceInstance.storage();
                    const newConfigValue = 0;

                    // Operation
                    const updateConfigOperation = await governanceInstance.methods.updateConfig(newConfigValue,"configBlocksPerProposalRound").send();
                    await updateConfigOperation.confirmation();

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const updateConfigValue = governanceStorage.config.blocksPerProposalRound;

                    // Assertions
                    assert.equal(updateConfigValue, newConfigValue);
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            });
            it('Admin should not be able to call the entrypoint and configure the blocks per proposal round if it exceed the maximum round duration', async () => {
                try{
                    // Initial Values
                    governanceStorage = await governanceInstance.storage();
                    const currentConfigValue = governanceStorage.config.blocksPerProposalRound;
                    const newConfigValue = 1000000000;

                    // Operation
                    await chai.expect(governanceInstance.methods.updateConfig(newConfigValue,"configBlocksPerProposalRound").send()).to.be.rejected;

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const updateConfigValue = governanceStorage.config.blocksPerProposalRound;

                    // Assertions
                    assert.notEqual(newConfigValue, currentConfigValue);
                    assert.equal(updateConfigValue.toNumber(), currentConfigValue.toNumber());
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            });
            it('Admin should be able to call the entrypoint and configure the blocks per voting round', async () => {
                try{
                    // Initial Values
                    governanceStorage = await governanceInstance.storage();
                    const newConfigValue = 0;

                    // Operation
                    const updateConfigOperation = await governanceInstance.methods.updateConfig(newConfigValue,"configBlocksPerVotingRound").send();
                    await updateConfigOperation.confirmation();

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const updateConfigValue = governanceStorage.config.blocksPerVotingRound;

                    // Assertions
                    assert.equal(updateConfigValue, newConfigValue);
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            });
            it('Admin should not be able to call the entrypoint and configure the blocks per voting round if it exceed the maximum round duration', async () => {
                try{
                    // Initial Values
                    governanceStorage = await governanceInstance.storage();
                    const currentConfigValue = governanceStorage.config.blocksPerVotingRound;
                    const newConfigValue = 1000000000;

                    // Operation
                    await chai.expect(governanceInstance.methods.updateConfig(newConfigValue,"configBlocksPerVotingRound").send()).to.be.rejected;

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const updateConfigValue = governanceStorage.config.blocksPerVotingRound;

                    // Assertions
                    assert.notEqual(newConfigValue, currentConfigValue);
                    assert.equal(updateConfigValue.toNumber(), currentConfigValue.toNumber());
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            });
            it('Admin should be able to call the entrypoint and configure the blocks per timelock round', async () => {
                try{
                    // Initial Values
                    governanceStorage = await governanceInstance.storage();
                    const newConfigValue = 0;

                    // Operation
                    const updateConfigOperation = await governanceInstance.methods.updateConfig(newConfigValue,"configBlocksPerTimelockRound").send();
                    await updateConfigOperation.confirmation();

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const updateConfigValue = governanceStorage.config.blocksPerTimelockRound;

                    // Assertions
                    assert.equal(updateConfigValue, newConfigValue);
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            });
            it('Admin should not be able to call the entrypoint and configure the blocks per timelock round if it exceed the maximum round duration', async () => {
                try{
                    // Initial Values
                    governanceStorage = await governanceInstance.storage();
                    const currentConfigValue = governanceStorage.config.blocksPerTimelockRound;
                    const newConfigValue = 1000000000;

                    // Operation
                    await chai.expect(governanceInstance.methods.updateConfig(newConfigValue,"configBlocksPerTimelockRound").send()).to.be.rejected;

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const updateConfigValue = governanceStorage.config.blocksPerTimelockRound;

                    // Assertions
                    assert.notEqual(newConfigValue, currentConfigValue);
                    assert.equal(updateConfigValue.toNumber(), currentConfigValue.toNumber());
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            });
            it('Non-admin should not be able to call the entrypoint', async () => {
                try{
                    // Initial Values
                    governanceStorage = await governanceInstance.storage();
                    const currentConfigValue = governanceStorage.config.blocksPerTimelockRound;
                    const newConfigValue = 1;

                    // Operation
                    await helperFunctions.signerFactory(tezos, alice.sk)
                    await chai.expect(governanceInstance.methods.updateConfig(newConfigValue,"configBlocksPerTimelockRound").send()).to.be.rejected;

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const updateConfigValue = governanceStorage.config.blocksPerTimelockRound;

                    // Assertions
                    assert.equal(updateConfigValue.toNumber(), currentConfigValue.toNumber());
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            });
        });

        describe("%startNextRound", async () => {

            beforeEach("Set signer to standard user", async () => {
                await helperFunctions.signerFactory(tezos, eve.sk)
            });

            it('User should be able to start the proposal round if no round has been initiated yet', async () => {
                try{
                    // Initial Values
                    governanceStorage = await governanceInstance.storage();
                    const currentCycleInfoRound                       = governanceStorage.currentCycleInfo.round
                    const currentCycleInfoRoundString                 = Object.keys(currentCycleInfoRound)[0]
                    const currentCycleInfoBlocksPerProposalRound      = governanceStorage.currentCycleInfo.blocksPerProposalRound
                    const currentCycleInfoBlocksPerVotingRound        = governanceStorage.currentCycleInfo.blocksPerVotingRound
                    const currentCycleInfoBlocksPerTimelockRound      = governanceStorage.currentCycleInfo.blocksPerTimelockRound
                    const currentCycleInfoRoundStartLevel             = governanceStorage.currentCycleInfo.roundStartLevel
                    const currentCycleInfoRoundEndLevel               = governanceStorage.currentCycleInfo.roundEndLevel
                    const currentCycleInfoCycleEndLevel               = governanceStorage.currentCycleInfo.cycleEndLevel
                    const cycleHighestVotedProposalId = governanceStorage.cycleHighestVotedProposalId

                    // Operation
                    const startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const finalRound                       = governanceStorage.currentCycleInfo.round
                    const finalRoundString                 = Object.keys(finalRound)[0]
                    const finalBlocksPerProposalRound      = governanceStorage.currentCycleInfo.blocksPerProposalRound
                    const finalBlocksPerVotingRound        = governanceStorage.currentCycleInfo.blocksPerVotingRound
                    const finalBlocksPerTimelockRound      = governanceStorage.currentCycleInfo.blocksPerTimelockRound
                    const finalRoundStartLevel             = governanceStorage.currentCycleInfo.roundStartLevel
                    const finalRoundEndLevel               = governanceStorage.currentCycleInfo.roundEndLevel
                    const finalCycleEndLevel               = governanceStorage.currentCycleInfo.cycleEndLevel
                    const finalRoundHighestVotedProposalId = governanceStorage.cycleHighestVotedProposalId

                    // Assertions
                    assert.equal(currentCycleInfoRoundString, "proposal");
                    assert.equal(currentCycleInfoBlocksPerProposalRound, 0);
                    assert.equal(currentCycleInfoBlocksPerVotingRound, 0);
                    assert.equal(currentCycleInfoBlocksPerTimelockRound, 0);
                    assert.equal(currentCycleInfoRoundStartLevel, 0);
                    assert.equal(currentCycleInfoRoundEndLevel, 0);
                    assert.equal(currentCycleInfoCycleEndLevel, 0);
                    assert.equal(cycleHighestVotedProposalId, 0);

                    assert.equal(finalRoundString, "proposal");
                    assert.notEqual(finalBlocksPerProposalRound, currentCycleInfoBlocksPerProposalRound);
                    assert.notEqual(finalBlocksPerVotingRound, currentCycleInfoBlocksPerVotingRound);
                    assert.notEqual(finalBlocksPerTimelockRound, currentCycleInfoBlocksPerTimelockRound);
                    assert.notEqual(finalRoundStartLevel, currentCycleInfoRoundStartLevel);
                    assert.notEqual(finalRoundEndLevel, currentCycleInfoRoundEndLevel);
                    assert.notEqual(finalCycleEndLevel, currentCycleInfoCycleEndLevel);
                    assert.notEqual(finalRoundHighestVotedProposalId, cycleHighestVotedProposalId);
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('User should be able to restart the proposal round from the proposal round if no proposals were submitted', async () => {
                try{
                    // Initial Values
                    governanceStorage = await governanceInstance.storage();
                    const currentCycleInfoRound                       = governanceStorage.currentCycleInfo.round
                    const currentCycleInfoRoundString                 = Object.keys(currentCycleInfoRound)[0]

                    // Operation
                    const startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const finalRound                       = governanceStorage.currentCycleInfo.round
                    const finalRoundString                 = Object.keys(finalRound)[0]

                    // Assertions
                    assert.equal(currentCycleInfoRoundString, "proposal");
                    assert.equal(finalRoundString, "proposal");
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('User should be able to restart the proposal round from the proposal round if no proposal received enough votes', async () => {
                try{
                    // Initial Values
                    governanceStorage = await governanceInstance.storage();
                    const currentCycleInfoRound                       = governanceStorage.currentCycleInfo.round
                    const currentCycleInfoRoundString                 = Object.keys(currentCycleInfoRound)[0]

                    delegationStorage   = await delegationInstance.storage();
                    const proposalId            = governanceStorage.nextProposalId.toNumber();
                    const proposalName          = "New Proposal #1";
                    const proposalDesc          = "Details about new proposal #1";
                    const proposalIpfs          = "ipfs://QM123456789";
                    const proposalSourceCode    = "Proposal Source Code";

                    // add proposal data
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.council.address,
                            "council",
                            "ConfigActionExpiryDays",
                            1234
                        ]
                    );

                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: lambdaFunction,
								codeDescription: ""
                            },
                        }
                    ]

                    // Operation
                    const proposeOperation = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 0.1});
                    await proposeOperation.confirmation();

                    const lockProposalOperation = await governanceInstance.methods.lockProposal(proposalId).send();
                    await lockProposalOperation.confirmation()

                    const startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const finalRound                       = governanceStorage.currentCycleInfo.round
                    const finalRoundString                 = Object.keys(finalRound)[0]

                    // Assertions
                    assert.equal(currentCycleInfoRoundString, "proposal");
                    assert.equal(finalRoundString, "proposal");
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('User should be able to switch from the proposal round to the voting round', async () => {
                try{
                    // Initial Values
                    governanceStorage = await governanceInstance.storage();
                    const currentCycleInfoRound                       = governanceStorage.currentCycleInfo.round
                    const currentCycleInfoRoundString                 = Object.keys(currentCycleInfoRound)[0]

                    delegationStorage   = await delegationInstance.storage();
                    const proposalId            = governanceStorage.nextProposalId.toNumber();
                    const proposalName          = "New Proposal #1";
                    const proposalDesc          = "Details about new proposal #1";
                    const proposalIpfs          = "ipfs://QM123456789";
                    const proposalSourceCode    = "Proposal Source Code";

                    // add proposal data
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.council.address,
                            "council",
                            "ConfigActionExpiryDays",
                            1234
                        ]
                    );

                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: lambdaFunction,
								codeDescription: ""
                            },
                        }
                    ]

                    // Operation
                    const proposeOperation = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 0.1});
                    await proposeOperation.confirmation();

                    const lockProposalOperation = await governanceInstance.methods.lockProposal(proposalId).send();
                    await lockProposalOperation.confirmation()

                    const voteForProposalOperation = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                    await voteForProposalOperation.confirmation()

                    const startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const finalRound                       = governanceStorage.currentCycleInfo.round
                    const finalRoundString                 = Object.keys(finalRound)[0]
                    const finalRoundHighestVotedProposalId = governanceStorage.cycleHighestVotedProposalId

                    // Assertions
                    assert.equal(currentCycleInfoRoundString, "proposal");
                    assert.equal(finalRoundString, "voting");
                    assert.equal(finalRoundHighestVotedProposalId, proposalId);
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('User should be able to switch from the voting round to the proposal round if the highest voted proposal did not receive enough votes', async () => {
                try{
                    // Initial Values
                    governanceStorage = await governanceInstance.storage();
                    const currentCycleInfoRound                       = governanceStorage.currentCycleInfo.round
                    const currentCycleInfoRoundString                 = Object.keys(currentCycleInfoRound)[0]

                    // Operation
                    const startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const finalRound                       = governanceStorage.currentCycleInfo.round
                    const finalRoundString                 = Object.keys(finalRound)[0]

                    // Assertions
                    assert.equal(currentCycleInfoRoundString, "voting");
                    assert.equal(finalRoundString, "proposal");
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('User should be able to switch from the voting round to the timelock round', async () => {
                try{
                    // Operation
                    governanceStorage           = await governanceInstance.storage();
                    delegationStorage           = await delegationInstance.storage();
                    const proposalId            = governanceStorage.nextProposalId.toNumber();
                    const proposalName          = "New Proposal #1";
                    const proposalDesc          = "Details about new proposal #1";
                    const proposalIpfs          = "ipfs://QM123456789";
                    const proposalSourceCode    = "Proposal Source Code";

                    // add proposal data
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.council.address,
                            "council",
                            "ConfigActionExpiryDays",
                            1234
                        ]
                    );

                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: lambdaFunction,
								codeDescription: ""
                            },
                        }
                    ]

                    // Operation
                    const proposeOperation = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 0.1});
                    await proposeOperation.confirmation();

                    const lockProposalOperation = await governanceInstance.methods.lockProposal(proposalId).send();
                    await lockProposalOperation.confirmation()

                    const voteForProposalOperation = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                    await voteForProposalOperation.confirmation()

                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    const votingRoundVoteOperation = await governanceInstance.methods.votingRoundVote("yay").send();
                    await votingRoundVoteOperation.confirmation();

                    startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    // Final values
                    governanceStorage                       = await governanceInstance.storage();
                    mvkTokenStorage                         = await mvkTokenInstance.storage();
                    const finalRound                        = governanceStorage.currentCycleInfo.round
                    const finalRoundString                  = Object.keys(finalRound)[0]

                    // Assertions
                    assert.equal(finalRoundString, "timelock");
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('User should be able to switch from the timelock round to the proposal round', async () => {
                try{
                    // Initial Values
                    governanceStorage = await governanceInstance.storage();
                    const currentCycleInfoRound                       = governanceStorage.currentCycleInfo.round
                    const currentCycleInfoRoundString                 = Object.keys(currentCycleInfoRound)[0]

                    // Operation
                    const startNextRoundOperation = await governanceInstance.methods.startNextRound(false).send();
                    await startNextRoundOperation.confirmation();

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const finalRound                       = governanceStorage.currentCycleInfo.round
                    const finalRoundString                 = Object.keys(finalRound)[0]

                    // Assertions
                    assert.equal(currentCycleInfoRoundString, "timelock");
                    assert.equal(finalRoundString, "proposal");
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

        })

        describe("%propose", async () => {
            beforeEach("Set signer to satellite", async () => {
                await helperFunctions.signerFactory(tezos, eve.sk)
            });

            it('Satellite should be able to call this entrypoint and create a proposal without metadata', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage();
                    const nextProposalId        = governanceStorage.nextProposalId;
                    const proposalName          = "New Proposal #2";
                    const proposalDesc          = "Details about new proposal #2";
                    const proposalIpfs          = "ipfs://QM123456789";
                    const proposalSourceCode    = "Proposal Source Code";

                    // add proposal data
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.council.address,
                            "council",
                            "ConfigActionExpiryDays",
                            1234
                        ]
                    );

                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: lambdaFunction,
								codeDescription: ""
                            },
                        }
                    ]

                    // Operation
                    const proposeOperation = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 0.1});
                    await proposeOperation.confirmation();

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const successReward = governanceStorage.config.successReward
                    const currentCycleInfoCycleEndLevel = governanceStorage.currentCycleInfo.cycleEndLevel
                    const minQuorumPercentage = governanceStorage.config.minQuorumPercentage
                    const minYayVotePercentage = governanceStorage.config.minYayVotePercentage
                    const minProposalRoundVotePercentage = governanceStorage.config.minProposalRoundVotePercentage
                    const minProposalRoundVotesRequired = governanceStorage.config.minProposalRoundVotesRequired
                    const cycleId = governanceStorage.cycleId
                    const finalNextProposalId = governanceStorage.nextProposalId;
                    const newProposal = await governanceStorage.proposalLedger.get(nextProposalId);
                    const cycleProposal = await governanceStorage.cycleProposals.get(nextProposalId)

                    // Assertions
                    assert.equal(nextProposalId.toNumber() + 1, finalNextProposalId.toNumber());
                    assert.notEqual(cycleProposal, undefined);
                    assert.notStrictEqual(newProposal, undefined);
                    assert.strictEqual(newProposal.proposerAddress, eve.pkh);
                    assert.strictEqual(newProposal.status, "ACTIVE");
                    assert.strictEqual(newProposal.title, proposalName);
                    assert.strictEqual(newProposal.description, proposalDesc);
                    assert.strictEqual(newProposal.invoice, proposalIpfs);
                    assert.strictEqual(newProposal.sourceCode, proposalSourceCode);
                    assert.equal(newProposal.successReward.toNumber(), successReward.toNumber());
                    assert.equal(newProposal.executed, false);
                    assert.equal(newProposal.locked, false);
                    assert.equal(newProposal.proposalVoteCount.toNumber(), 0);
                    assert.equal(newProposal.proposalVoteStakedMvkTotal.toNumber(), 0);
                    assert.equal(newProposal.minProposalRoundVotePercentage.toNumber(), minProposalRoundVotePercentage.toNumber());
                    assert.equal(newProposal.minProposalRoundVotesRequired.toNumber(), minProposalRoundVotesRequired.toNumber());
                    assert.equal(newProposal.yayVoteCount.toNumber(), 0);
                    assert.equal(newProposal.yayVoteStakedMvkTotal.toNumber(), 0);
                    assert.equal(newProposal.nayVoteCount.toNumber(), 0);
                    assert.equal(newProposal.nayVoteStakedMvkTotal.toNumber(), 0);
                    assert.equal(newProposal.passVoteCount.toNumber(), 0);
                    assert.equal(newProposal.passVoteStakedMvkTotal.toNumber(), 0);
                    assert.equal(newProposal.minQuorumPercentage.toNumber(), minQuorumPercentage.toNumber());
                    assert.equal(newProposal.minYayVotePercentage.toNumber(), minYayVotePercentage.toNumber());
                    assert.equal(newProposal.quorumCount.toNumber(), 0);
                    assert.equal(newProposal.quorumStakedMvkTotal.toNumber(), 0);
                    assert.equal(newProposal.cycle.toNumber(), cycleId.toNumber());
                    assert.equal(newProposal.currentCycleEndLevel.toNumber(), currentCycleInfoCycleEndLevel.toNumber());
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Satellite should be able to call this entrypoint and create a proposal with code and payment', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage();
                    delegationStorage           = await delegationInstance.storage();
                    const nextProposalId        = governanceStorage.nextProposalId;
                    const proposalName          = "New Proposal #3";
                    const proposalDesc          = "Details about new proposal #3";
                    const proposalIpfs          = "ipfs://QM123456789";
                    const proposalSourceCode    = "Proposal Source Code";

                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.council.address,
                            "council",
                            "ConfigActionExpiryDays",
                            1234
                        ]
                    );

                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: lambdaFunction,
								codeDescription: ""
                            },
                        }
                    ]
                    
                    const paymentData        = [
                        {
                            addOrSetPaymentData: {
                                title: "Payment#0",
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

                    // Operation
                    const proposeOperation = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData, paymentData).send({amount: 0.1});
                    await proposeOperation.confirmation();

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const successReward = governanceStorage.config.successReward
                    const currentCycleInfoCycleEndLevel = governanceStorage.currentCycleInfo.cycleEndLevel
                    const minQuorumPercentage = governanceStorage.config.minQuorumPercentage
                    const minYayVotePercentage = governanceStorage.config.minYayVotePercentage
                    const minProposalRoundVotePercentage = governanceStorage.config.minProposalRoundVotePercentage
                    const minProposalRoundVotesRequired = governanceStorage.config.minProposalRoundVotesRequired
                    const cycleId = governanceStorage.cycleId
                    const finalNextProposalId = governanceStorage.nextProposalId;
                    const newProposal = await governanceStorage.proposalLedger.get(nextProposalId.toNumber());
                    const proposalDataStorage = await newProposal.proposalData.get("0");
                    const paymentDataStorage = await newProposal.paymentData.get("0");
                    const cycleProposal = await governanceStorage.cycleProposals.get(nextProposalId)
                    
                    // Assertions
                    assert.notStrictEqual(proposalDataStorage, undefined);
                    assert.notStrictEqual(paymentDataStorage, undefined);
                    assert.strictEqual(proposalDataStorage.title, "Data#1");
                    assert.strictEqual(proposalDataStorage.encodedCode, lambdaFunction);
                    assert.strictEqual(paymentDataStorage.title,  "Payment#0");
                    assert.equal(nextProposalId.toNumber() + 1, finalNextProposalId.toNumber());
                    assert.notEqual(cycleProposal, undefined);
                    assert.notStrictEqual(newProposal, undefined);
                    assert.strictEqual(newProposal.proposerAddress, eve.pkh);
                    assert.strictEqual(newProposal.status, "ACTIVE");
                    assert.strictEqual(newProposal.title, proposalName);
                    assert.strictEqual(newProposal.description, proposalDesc);
                    assert.strictEqual(newProposal.invoice, proposalIpfs);
                    assert.strictEqual(newProposal.sourceCode, proposalSourceCode);
                    assert.equal(newProposal.successReward.toNumber(), successReward.toNumber());
                    assert.equal(newProposal.executed, false);
                    assert.equal(newProposal.locked, false);
                    assert.equal(newProposal.proposalVoteCount.toNumber(), 0);
                    assert.equal(newProposal.proposalVoteStakedMvkTotal.toNumber(), 0);
                    assert.equal(newProposal.minProposalRoundVotePercentage.toNumber(), minProposalRoundVotePercentage.toNumber());
                    assert.equal(newProposal.minProposalRoundVotesRequired.toNumber(), minProposalRoundVotesRequired.toNumber());
                    assert.equal(newProposal.yayVoteCount.toNumber(), 0);
                    assert.equal(newProposal.yayVoteStakedMvkTotal.toNumber(), 0);
                    assert.equal(newProposal.nayVoteCount.toNumber(), 0);
                    assert.equal(newProposal.nayVoteStakedMvkTotal.toNumber(), 0);
                    assert.equal(newProposal.passVoteCount.toNumber(), 0);
                    assert.equal(newProposal.passVoteStakedMvkTotal.toNumber(), 0);
                    assert.equal(newProposal.minQuorumPercentage.toNumber(), minQuorumPercentage.toNumber());
                    assert.equal(newProposal.minYayVotePercentage.toNumber(), minYayVotePercentage.toNumber());
                    assert.equal(newProposal.quorumCount.toNumber(), 0);
                    assert.equal(newProposal.quorumStakedMvkTotal.toNumber(), 0);
                    assert.equal(newProposal.cycle.toNumber(), cycleId.toNumber());
                    assert.equal(newProposal.currentCycleEndLevel.toNumber(), currentCycleInfoCycleEndLevel.toNumber());
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Non-satellite should not be able to call this entrypoint', async () => {
                try{
                    // Initial Values
                    delegationStorage   = await delegationInstance.storage();
                    const nextProposalId        = governanceStorage.nextProposalId;
                    const proposalName          = "New Proposal #3";
                    const proposalDesc          = "Details about new proposal #3";
                    const proposalIpfs          = "ipfs://QM123456789";
                    const proposalSourceCode    = "Proposal Source Code";

                    // Operation
                    await helperFunctions.signerFactory(tezos, bob.sk);
                    await chai.expect(governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode).send({amount: 0.1})).to.be.rejected;

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const newProposal = await governanceStorage.proposalLedger.get(nextProposalId);

                    // Assertions
                    assert.strictEqual(newProposal, undefined);
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Satellite should not be able to call this entrypoint if it was not in the previous snapshot', async () => {
                try{
                    // Initial Values
                    delegationStorage   = await delegationInstance.storage();
                    const nextProposalId        = governanceStorage.nextProposalId;
                    const proposalName          = "New Proposal #3";
                    const proposalDesc          = "Details about new proposal #3";
                    const proposalIpfs          = "ipfs://QM123456789";
                    const proposalSourceCode    = "Proposal Source Code";

                    // Operation
                    await helperFunctions.signerFactory(tezos, bob.sk);
                    const registerAsSatellite = await delegationInstance.methods
                    .registerAsSatellite(
                        "Bob Satellite", 
                        "Test description", 
                        "Test image",
                        "Test website",
                        10
                    ).send();
                    await registerAsSatellite.confirmation();
                    await chai.expect(governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode).send({amount: 0.1})).to.be.rejected;

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const newProposal = await governanceStorage.proposalLedger.get(nextProposalId);

                    // Assertions
                    assert.strictEqual(newProposal, undefined);
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })
        })

        describe("%updateProposalData", async () => {

            beforeEach("Set signer to satellite", async () => {
                await helperFunctions.signerFactory(tezos, eve.sk)
            });

            it('Satellite should be able to add data to an existing proposal', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = governanceStorage.nextProposalId.toNumber() - 1;
                    const proposalDebug         = await governanceStorage.proposalLedger.get(proposalId);

                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.council.address,
                            "council",
                            "ConfigActionExpiryDays",
                            1234
                        ]
                    );

                    // Operation
                    const addDataOperation = await governanceInstance.methods.updateProposalData(proposalId, [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: lambdaFunction,
								codeDescription: ""
                            },
                        }
                    ]).send();
                    await addDataOperation.confirmation();

                    // Final values
                    governanceStorage           = await governanceInstance.storage();
                    const proposal              = await governanceStorage.proposalLedger.get(proposalId);
                    const proposalDataStorage   = await proposal.proposalData.get("1");

                    // Assertions
                    assert.strictEqual(proposalDataStorage.title, "Data#1")
                    assert.strictEqual(proposalDataStorage.encodedCode, lambdaFunction)
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Satellite should be able to update a proposal data at a given index', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = governanceStorage.nextProposalId.toNumber() - 1;

                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.governance.address,
                            "governance",
                            "ConfigSuccessReward",
                            1200
                        ]
                    );

                    // Operation
                    const addDataOperation = await governanceInstance.methods.updateProposalData(proposalId, [
                        {
                            addOrSetProposalData: {
                                title: "Data#1.1",
                                encodedCode: lambdaFunction,
								codeDescription: "",
                                index: "1"
                            },
                        }
                    ]).send();
                    await addDataOperation.confirmation();

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const proposal = await governanceStorage.proposalLedger.get(proposalId);
                    const proposalDataStorage = await proposal.proposalData.get("1");

                    // Assertions
                    assert.strictEqual(proposalDataStorage.title, "Data#1.1")
                    assert.strictEqual(proposalDataStorage.encodedCode, lambdaFunction)
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Satellite should not be able to update data at an unexisting index', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = governanceStorage.nextProposalId.toNumber() - 1;

                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.governance.address,
                            "governance",
                            "ConfigSuccessReward",
                            1300
                        ]
                    );

                    // Operation
                    await chai.expect(governanceInstance.methods.updateProposalData(proposalId, [
                        {
                            addOrSetProposalData: {
                                title: "Data#1.2",
                                encodedCode: lambdaFunction,
								codeDescription: "",
                                index: "2"
                            },
                        }
                    ]).send()).to.be.rejected;

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const proposal = await governanceStorage.proposalLedger.get(proposalId);
                    const proposalDataStorage = await proposal.proposalData.get("2");

                    // Assertions
                    assert.strictEqual(proposalDataStorage, undefined)
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Satellite should be able to remove data from a proposal', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = governanceStorage.nextProposalId.toNumber() - 1;
                    const initProposal          = await governanceStorage.proposalLedger.get(proposalId);
                    const initDataStorage       = initProposal.proposalData.get("1");

                    // Operation
                    const removeOperation       = await governanceInstance.methods.updateProposalData(proposalId, [
                        {
                            removeProposalData: "1",
                        }
                    ]).send();
                    await removeOperation.confirmation();

                    // Final values
                    governanceStorage           = await governanceInstance.storage();
                    const proposal              = await governanceStorage.proposalLedger.get(proposalId);
                    const proposalDataStorage   = await proposal.proposalData.get("1");

                    // Assertions
                    assert.notStrictEqual(initDataStorage, undefined)
                    assert.strictEqual(proposalDataStorage, null)
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Satellite should be able to add, update and remove multiple data from a proposal', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = governanceStorage.nextProposalId.toNumber() - 1;

                    // Pack first data
                    const lambdaFunctionFirst   = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.governance.address,
                            "governance",
                            "ConfigSuccessReward",
                            1200
                        ]
                    );

                    // Pack second data
                    const lambdaFunctionSecond  = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.governance.address,
                            "governance",
                            "ConfigSuccessReward",
                            1600
                        ]
                    );

                    // Operation
                    const addDataOperation = await governanceInstance.methods.updateProposalData(proposalId, [
                        {
                            addOrSetProposalData: {
                                title: "Data#1.2",
                                encodedCode: lambdaFunctionFirst,
								codeDescription: "",
                                index: "1"
                            }
                        },
                        {
                            addOrSetProposalData: {
                                title: "Data#2",
                                encodedCode: lambdaFunctionSecond,
								codeDescription: ""
                            }
                        },
                        {
                            removeProposalData: "2"
                        },
                        {
                            addOrSetProposalData: {
                                title: "Data#3",
                                encodedCode: lambdaFunctionFirst,
								codeDescription: ""
                            }
                        },
                        {
                            addOrSetProposalData: {
                                title: "Data#2.1",
                                encodedCode: lambdaFunctionSecond,
								codeDescription: "",
                                index: "2"
                            }
                        }
                    ]).send();
                    await addDataOperation.confirmation();

                    // Final values
                    governanceStorage               = await governanceInstance.storage();
                    const proposal                  = await governanceStorage.proposalLedger.get(proposalId);
                    const firstProposalDataStorage  = await proposal.proposalData.get("1");
                    const secondProposalDataStorage = await proposal.proposalData.get("2");
                    const thirdProposalDataStorage  = await proposal.proposalData.get("3");

                    // Assertions
                    assert.strictEqual(firstProposalDataStorage.title, "Data#1.2")
                    assert.strictEqual(firstProposalDataStorage.encodedCode, lambdaFunctionFirst)
                    assert.strictEqual(secondProposalDataStorage.title, "Data#2.1")
                    assert.strictEqual(secondProposalDataStorage.encodedCode, lambdaFunctionSecond)
                    assert.strictEqual(thirdProposalDataStorage.title,  "Data#3")
                    assert.strictEqual(thirdProposalDataStorage.encodedCode, lambdaFunctionFirst)
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Satellite should be able to add payment data to a proposal', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = governanceStorage.nextProposalId.toNumber() - 1;

                    // Transaction data
                    const transaction           = {
                        "to_"    : bob.pkh,
                        "token"  : {
                            "fa2" : {
                                "tokenContractAddress" : contractDeployments.mvkToken.address,
                                "tokenId" : 0
                            }
                        },
                        "amount" : MVK(50)
                    }

                    // Operation
                    const addDataOperation      = await governanceInstance.methods.updateProposalData(proposalId, null, [
                        {
                            addOrSetPaymentData: {
                                title: "Payment#2",
                                transaction: transaction
                            }
                        }
                    ]).send();
                    await addDataOperation.confirmation();

                    // Final values
                    governanceStorage               = await governanceInstance.storage();
                    const proposal                  = await governanceStorage.proposalLedger.get(proposalId);
                    const firstProposalDataStorage  = await proposal.paymentData.get("1");


                    // Assertions
                    assert.strictEqual(firstProposalDataStorage.title, "Payment#2")
                    assert.notStrictEqual(firstProposalDataStorage.transaction, undefined)
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Satellite should be able to update payment data from a proposal', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = governanceStorage.nextProposalId.toNumber() - 1;

                    // Transaction data
                    const transaction           = {
                        "to_"    : alice.pkh,
                        "token"  : {
                            "fa2" : {
                                "tokenContractAddress" : contractDeployments.mvkToken.address,
                                "tokenId" : 0
                            }
                        },
                        "amount" : MVK(50)
                    }

                    // Operation
                    const addDataOperation      = await governanceInstance.methods.updateProposalData(proposalId, null, [
                        {
                            addOrSetPaymentData: {
                                title: "Payment#2.1",
                                transaction: transaction,
                                index: "1"
                            }
                        }
                    ]).send();
                    await addDataOperation.confirmation();

                    // Final values
                    governanceStorage               = await governanceInstance.storage();
                    const proposal                  = await governanceStorage.proposalLedger.get(proposalId);
                    const firstProposalDataStorage  = await proposal.paymentData.get("1");

                    // Assertions
                    assert.strictEqual(firstProposalDataStorage.title, "Payment#2.1")
                    assert.notStrictEqual(firstProposalDataStorage.transaction, undefined)
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Satellite should be able to remove payment data from a proposal', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = governanceStorage.nextProposalId.toNumber() - 1;

                    // Operation
                    const addDataOperation      = await governanceInstance.methods.updateProposalData(proposalId, null, [
                        {
                            removePaymentData: "1"
                        }
                    ]).send();
                    await addDataOperation.confirmation();

                    // Final values
                    governanceStorage               = await governanceInstance.storage();
                    const proposal                  = await governanceStorage.proposalLedger.get(proposalId);
                    const firstProposalDataStorage  = await proposal.paymentData.get("1");

                    // Assertions
                    assert.strictEqual(firstProposalDataStorage, null)
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Satellite should be able to remove add, set and remove data from a proposal', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = governanceStorage.nextProposalId.toNumber() - 1;

                    // Transaction data
                    const firstTransaction      = {
                        "to_"    : alice.pkh,
                        "token"  : {
                            "fa2" : {
                                "tokenContractAddress" : contractDeployments.mvkToken.address,
                                "tokenId" : 0
                            }
                        },
                        "amount" : MVK(50)
                    }
                    const secondTransaction     = {
                        "to_"    : bob.pkh,
                        "token"  : {
                            "fa2" : {
                                "tokenContractAddress" : contractDeployments.mvkToken.address,
                                "tokenId" : 0
                            }
                        },
                        "amount" : MVK(50)
                    }

                    // Operation
                    const addDataOperation      = await governanceInstance.methods.updateProposalData(proposalId, null, [
                        {
                            addOrSetPaymentData: {
                                title: "Payment#3",
                                transaction: firstTransaction,
                            }
                        },
                        {
                            addOrSetPaymentData: {
                                title: "Payment#3",
                                transaction: firstTransaction,
                                index: "1"
                            }
                        },
                        {
                            removePaymentData: "1"
                        },
                        {
                            addOrSetPaymentData: {
                                title: "Payment#2.2",
                                transaction: secondTransaction,
                                index: "1"
                            }
                        }
                    ]).send();
                    await addDataOperation.confirmation();

                    // Final values
                    governanceStorage               = await governanceInstance.storage();
                    const proposal                  = await governanceStorage.proposalLedger.get(proposalId);
                    const firstProposalDataStorage  = await proposal.paymentData.get("1");
                    const secondProposalDataStorage = await proposal.paymentData.get("2");

                    // Assertions
                    assert.strictEqual(firstProposalDataStorage.title, "Payment#2.2")
                    assert.notStrictEqual(firstProposalDataStorage.transaction, undefined)
                    assert.strictEqual(secondProposalDataStorage.title, "Payment#3")
                    assert.notStrictEqual(secondProposalDataStorage.transaction, undefined)
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Non-satellite should not be able to call this entrypoint', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = governanceStorage.nextProposalId.toNumber() - 1;

                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.governance.address,
                            "governance",
                            "ConfigSuccessReward",
                            1200
                        ]
                    );

                    // Operation
                    await helperFunctions.signerFactory(tezos, bob.sk);
                    await chai.expect(governanceInstance.methods.updateProposalData(proposalId, [
                        {
                            addOrSetProposalData: {
                                title: "Data#4",
                                encodedCode: lambdaFunction,
								codeDescription: ""
                            },
                        }
                    ]).send()).to.be.rejected;
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Satellite should not be able to call this entrypoint if the proposal doesn’t exist', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = 9999;

                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.governance.address,
                            "governance",
                            "ConfigSuccessReward",
                            1200
                        ]
                    );

                    // Operation
                    await chai.expect(governanceInstance.methods.updateProposalData(proposalId, [
                        {
                            addOrSetProposalData: {
                                title: "Data#4",
                                encodedCode: lambdaFunction,
								codeDescription: ""
                            },
                        }
                    ]).send()).to.be.rejected;
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Satellite should not be able to call this entrypoint if it did not create the proposal', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = governanceStorage.nextProposalId.toNumber() - 1;

                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.governance.address,
                            "governance",
                            "ConfigSuccessReward",
                            1200
                        ]
                    );

                    // Operation
                    await helperFunctions.signerFactory(tezos, alice.sk);
                    await chai.expect(governanceInstance.methods.updateProposalData(proposalId, [
                        {
                            addOrSetProposalData: {
                                title: "Data#4",
                                encodedCode: lambdaFunction,
								codeDescription: ""
                            },
                        }
                    ]).send()).to.be.rejected;
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })
        })

        describe("%lockProposal", async () => {

            beforeEach("Set signer to satellite", async () => {
                await helperFunctions.signerFactory(tezos, eve.sk)
            });

            it('Satellite should be able to call this entrypoint and lock a proposal', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = governanceStorage.nextProposalId.toNumber() - 1;

                    // Operation
                    const lockOperation = await governanceInstance.methods.lockProposal(proposalId).send();
                    await lockOperation.confirmation();

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const proposal = await governanceStorage.proposalLedger.get(proposalId);

                    // Assertions
                    assert.strictEqual(proposal.locked, true);
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Non-satellite should not be able to call this entrypoint', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = governanceStorage.nextProposalId.toNumber() - 1;

                    // Operation
                    await helperFunctions.signerFactory(tezos, bob.sk);
                    await chai.expect(governanceInstance.methods.lockProposal(proposalId).send()).to.be.rejected;
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Satellite should not be able to call this entrypoint if the proposal doesn’t exist', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = 9999;

                    // Operation
                    await chai.expect(governanceInstance.methods.lockProposal(proposalId).send()).to.be.rejected;

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const proposal = await governanceStorage.proposalLedger.get(proposalId);

                    // Assertions
                    assert.strictEqual(proposal, undefined);
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Satellite should not be able to call this entrypoint if the proposal is already locked', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = governanceStorage.nextProposalId.toNumber() - 1;

                    // Operation
                    await chai.expect(governanceInstance.methods.lockProposal(proposalId).send()).to.be.rejected;
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Satellite should not be able to call this entrypoint if it did not created the proposal', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = governanceStorage.nextProposalId.toNumber() - 1;

                    // Operation
                    await helperFunctions.signerFactory(tezos, alice.sk);
                    await chai.expect(governanceInstance.methods.lockProposal(proposalId).send()).to.be.rejected;
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })
        })

        describe("%proposalRoundVote", async () => {
            beforeEach("Set signer to satellite", async () => {
                await helperFunctions.signerFactory(tezos, eve.sk)
            });

            it('Satellite should be able to call this entrypoint and vote for a proposal', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const cycleId          = governanceStorage.cycleId.toNumber();
                    const proposalId            = governanceStorage.nextProposalId.toNumber() - 1;

                    // Operation
                    const voteOperation = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                    await voteOperation.confirmation();

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const roundVoter = await governanceStorage.roundVotes.get({
                        0: cycleId,
                        1: eve.pkh,
                    })
                    const proposal = await governanceStorage.proposalLedger.get(proposalId);
                    const proposalVoteCount = await proposal.proposalVoteCount;

                    // Assertions
                    assert.notStrictEqual(roundVoter, undefined)
                    assert.notEqual(proposalVoteCount.toNumber(), 0)
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Non-satellite should not be able to call this entrypoint', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const cycleId          = governanceStorage.cycleId.toNumber();
                    const proposalId            = governanceStorage.nextProposalId.toNumber() - 1;

                    // Operation
                    await helperFunctions.signerFactory(tezos, bob.sk)
                    await chai.expect(governanceInstance.methods.proposalRoundVote(proposalId).send()).to.be.rejected;

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const roundVoter = await governanceStorage.roundVotes.get({
                        0: cycleId,
                        1: bob.pkh,
                    })

                    // Assertions
                    assert.strictEqual(roundVoter, undefined)
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Satellite should not be able to call this entrypoint if it was not in the previous snapshot', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const cycleId          = governanceStorage.cycleId.toNumber();
                    const proposalId            = governanceStorage.nextProposalId.toNumber() - 1;

                    // Operation
                    await helperFunctions.signerFactory(tezos, mallory.sk)
                    const updateOperators = await mvkTokenInstance.methods
                        .update_operators([
                        {
                            add_operator: {
                                owner: mallory.pkh,
                                operator: contractDeployments.doorman.address,
                                token_id: 0,
                            },
                        },
                        ])
                        .send()
                    await updateOperators.confirmation();
                    const stakeOperation = await doormanInstance.methods.stake(MVK(20000)).send();
                    await stakeOperation.confirmation();
                    var registerAsSatellite = await delegationInstance.methods
                    .registerAsSatellite(
                        "Mallory Satellite", 
                        "Test description", 
                        "Test image",
                        "Test website",
                        7
                    ).send();
                    await registerAsSatellite.confirmation();

                    await chai.expect(governanceInstance.methods.proposalRoundVote(proposalId).send()).to.be.rejected;

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const roundVoter = await governanceStorage.roundVotes.get({
                        0: cycleId,
                        1: mallory.pkh,
                    })

                    // Assertions
                    assert.strictEqual(roundVoter, undefined)
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Satellite should not be able to call this entrypoint if the proposal was not locked', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = governanceStorage.nextProposalId.toNumber() - 2;

                    // Operation
                    await chai.expect(governanceInstance.methods.proposalRoundVote(proposalId).send()).to.be.rejected;
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Satellite should not be able to call this entrypoint if the proposal does not exist', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = 9999;

                    // Operation
                    await chai.expect(governanceInstance.methods.proposalRoundVote(proposalId).send()).to.be.rejected;
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Satellite should be able to change its vote', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const cycleId          = governanceStorage.cycleId.toNumber();
                    const proposalId            = governanceStorage.nextProposalId.toNumber() - 2;
                    const roundVoter            = await governanceStorage.roundVotes.get({
                        0: cycleId,
                        1: eve.pkh,
                    })
                    const previousProposal = await governanceStorage.proposalLedger.get(roundVoter.proposal.toNumber());
                    const previousProposalVoteCount = await previousProposal.proposalVoteCount;

                    // Add data to proposal for later execution
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.council.address,
                            "council",
                            "ConfigActionExpiryDays",
                            1234
                        ]
                    );

                    const addDataOperation = await governanceInstance.methods.updateProposalData(proposalId, [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: lambdaFunction,
								codeDescription: ""
                            },
                        }
                    ]).send();
                    await addDataOperation.confirmation()

                    // Operation
                    const lockOperation = await governanceInstance.methods.lockProposal(proposalId).send();
                    await lockOperation.confirmation();
                    const voteOperation = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                    await voteOperation.confirmation();

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const finalRoundVoter = await governanceStorage.roundVotes.get({
                        0: cycleId,
                        1: eve.pkh,
                    })
                    const proposal = await governanceStorage.proposalLedger.get(proposalId);
                    const proposalVoteCount = await proposal.proposalVoteCount;

                    const oldProposal = await governanceStorage.proposalLedger.get(roundVoter.proposal.toNumber());
                    const oldProposalVoteCount = await oldProposal.proposalVoteCount;

                    // Assertions
                    assert.notEqual(finalRoundVoter.proposal.toNumber(), roundVoter.proposal.toNumber())
                    assert.notEqual(proposalVoteCount.toNumber(), 0)
                    assert.strictEqual(previousProposalVoteCount.toNumber(), oldProposalVoteCount.toNumber() + 1)
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })
        })

        describe("%dropProposal", async () => {
            beforeEach("Set signer to satellite", async () => {
                await helperFunctions.signerFactory(tezos, eve.sk)
            });

            it('Proposer should be able to call this entrypoint and drop its proposal', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = governanceStorage.nextProposalId.toNumber() - 1;

                    // Operation
                    const dropOperation = await governanceInstance.methods.dropProposal(proposalId).send();
                    await dropOperation.confirmation();

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const proposal = await governanceStorage.proposalLedger.get(proposalId);

                    // Assertions
                    assert.strictEqual(proposal.status, "DROPPED")
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Proposer should not be able to call this entrypoint if its not a satellite', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = governanceStorage.nextProposalId.toNumber() - 2;

                    // Operation
                    await helperFunctions.signerFactory(tezos, trudy.sk)
                    await chai.expect(governanceInstance.methods.dropProposal(proposalId).send()).to.be.rejected;
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Proposer should not be able to call this entrypoint if it wants to drop a proposal it did not made', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = governanceStorage.nextProposalId.toNumber() - 2;

                    // Operation
                    await helperFunctions.signerFactory(tezos, alice.sk)
                    await chai.expect(governanceInstance.methods.dropProposal(proposalId).send()).to.be.rejected;

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const proposal = await governanceStorage.proposalLedger.get(proposalId);

                    // Assertions
                    assert.strictEqual(proposal.status, "ACTIVE")
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Proposer should not be able to call this entrypoint if the selected proposal was already dropped', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = governanceStorage.nextProposalId.toNumber() - 1;

                    // Operation
                    await chai.expect(governanceInstance.methods.dropProposal(proposalId).send()).to.be.rejected;

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const proposal = await governanceStorage.proposalLedger.get(proposalId);

                    // Assertions
                    assert.strictEqual(proposal.status, "DROPPED")
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })
        })

        describe("%votingRoundVote", async () => {
            before("Switch to voting round", async () => {
                // Operation
                const startVotingRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                await startVotingRoundOperation.confirmation();
            })

            beforeEach("Set signer to satellite", async () => {
                await helperFunctions.signerFactory(tezos, eve.sk)
            });

            it('Satellite should be able to call this entrypoint and vote', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()

                    const voteOperation = await governanceInstance.methods.votingRoundVote("yay").send();
                    await voteOperation.confirmation();
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Non-satellite should not be able to call this entrypoint', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()

                    await helperFunctions.signerFactory(tezos, bob.sk)
                    await chai.expect(governanceInstance.methods.votingRoundVote("yay").send()).to.be.rejected;
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Satellite should not be able to call this entrypoint if it was not in the previous snapshot', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()

                    await helperFunctions.signerFactory(tezos, mallory.sk)
                    await chai.expect(governanceInstance.methods.votingRoundVote("yay").send()).to.be.rejected;
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })
        })

        describe("%executeProposal", async () => {

            beforeEach("Set signer to satellite", async () => {
                await helperFunctions.signerFactory(tezos, eve.sk)
            });

            it('User should not be able to call this entrypoint if it’s the voting round', async () => {
                try{
                    // Initial Values
                    governanceStorage                    = await governanceInstance.storage()
                    const currentCycleInfoRound          = governanceStorage.currentCycleInfo.round
                    const currentCycleInfoRoundString    = Object.keys(currentCycleInfoRound)[0]
                    const highestVotedProposal           = governanceStorage.cycleHighestVotedProposalId;
                    const timelockProposal               = governanceStorage.timelockProposalId;

                    // Operation
                    await chai.expect(governanceInstance.methods.executeProposal(highestVotedProposal).send()).to.be.rejected;

                    // Assertions
                    assert.strictEqual(currentCycleInfoRoundString, "voting")
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('User should not be able to call this entrypoint if it’s the timelock round', async () => {
                try{
                    // Initial Values
                    governanceStorage                   = await governanceInstance.storage();
                    const proposalId                    = governanceStorage.timelockProposalId.toNumber();

                    // Operation
                    const startTimelockRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startTimelockRoundOperation.confirmation();
                    await chai.expect(governanceInstance.methods.executeProposal(proposalId).send()).to.be.rejected;

                    // Final values
                    governanceStorage                    = await governanceInstance.storage()
                    const currentCycleInfoRound          = governanceStorage.currentCycleInfo.round
                    const currentCycleInfoRoundString    = Object.keys(currentCycleInfoRound)[0]

                    // Assertions
                    assert.strictEqual(currentCycleInfoRoundString, "timelock")
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('User should be able to call this entrypoint manually in the next proposal round', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const highestVotedProposal  = governanceStorage.cycleHighestVotedProposalId;
                    const timelockProposal      = governanceStorage.timelockProposalId;
                
                    const startProposalRoundOperation = await governanceInstance.methods.startNextRound(false).send();
                    await startProposalRoundOperation.confirmation();

                    const executeOperation = await governanceInstance.methods.executeProposal(timelockProposal).send();
                    await executeOperation.confirmation();

                    // Final values
                    governanceStorage                    = await governanceInstance.storage()
                    const currentCycleInfoRound          = governanceStorage.currentCycleInfo.round
                    const currentCycleInfoRoundString    = Object.keys(currentCycleInfoRound)[0]

                    // Assertions
                    assert.strictEqual(currentCycleInfoRoundString, "proposal")
                    assert.equal(timelockProposal.toNumber(),highestVotedProposal.toNumber())
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })
        })

        describe("%distributeProposalRewards", async () => {

            beforeEach("Set signer to standard user", async () => {
                await helperFunctions.signerFactory(tezos, trudy.sk)
            });

            it('User should not be able to call this entrypoint if it did not vote on the proposal', async () => {
                try{
                    // Initial Values
                    governanceStorage   = await governanceInstance.storage()
                    const proposalId    = governanceStorage.nextProposalId.toNumber() - 2;
                    const proposal      = await governanceStorage.proposalLedger.get(proposalId);

                    // Operation
                    await chai.expect(governanceInstance.methods.distributeProposalRewards(mallory.pkh, [proposalId]).send()).to.be.rejected;

                    // Assertion
                    assert.equal(proposal.rewardClaimReady, true);
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('User should not be able to call this entrypoint if the reward cannot be claimed yet', async () => {
                try{
                    // Initial Values
                    governanceStorage                   = await governanceInstance.storage()
                    const proposalId                    = governanceStorage.nextProposalId.toNumber();
                    const firstProposalName             = "New Proposal #1";
                    const firstProposalDesc             = "Details about new proposal #1";
                    const firstProposalIpfs             = "ipfs://QM123456789";
                    const firstProposalSourceCode       = "Proposal Source Code";

                    // Propose a new proposal
                    await helperFunctions.signerFactory(tezos, eve.sk)
                    const proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send({amount: 0.1});
                    await proposeOperation.confirmation();

                    // Operation
                    await helperFunctions.signerFactory(tezos, trudy.sk)
                    await chai.expect(governanceInstance.methods.distributeProposalRewards(mallory.pkh, [proposalId]).send()).to.be.rejected;

                    // Final values
                    governanceStorage                   = await governanceInstance.storage()
                    const proposal                      = await governanceStorage.proposalLedger.get(proposalId);

                    // Assertion
                    assert.equal(proposal.rewardClaimReady, false);
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('User should be able to trigger a satellite claim for a given proposal', async () => {
                try{
                    // Initial Values
                    governanceStorage                   = await governanceInstance.storage();
                    delegationStorage                   = await delegationInstance.storage();
                    const satelliteRewardsBegin         = await delegationStorage.satelliteRewardsLedger.get(eve.pkh);
                    const proposalId                    = governanceStorage.nextProposalId.toNumber() - 3;
                    const proposal                      = await governanceStorage.proposalLedger.get(proposalId);
                    const claimTraceBegin               = await governanceStorage.proposalRewards.get({
                        0: proposalId,
                        1: eve.pkh
                    })

                    // Operation
                    const claimOperation    = await governanceInstance.methods.distributeProposalRewards(eve.pkh, [proposalId]).send();
                    await claimOperation.confirmation();

                    // Final values
                    governanceStorage               = await governanceInstance.storage();
                    delegationStorage               = await delegationInstance.storage();
                    const satelliteRewardsEnd       = await delegationStorage.satelliteRewardsLedger.get(eve.pkh);
                    const claimTraceEnd             = await governanceStorage.proposalRewards.get({
                        0: proposalId,
                        1: eve.pkh
                    })

                    // Log
                    // console.log("Satellite rewards before claim:", satelliteRewardsBegin);
                    // console.log("Satellite rewards after claim:", satelliteRewardsEnd);

                    // Assertion
                    assert.equal(proposal.rewardClaimReady, true);
                    assert.strictEqual(claimTraceBegin, undefined);
                    assert.notStrictEqual(claimTraceEnd, undefined);
                    assert.notEqual(satelliteRewardsBegin.unpaid.toNumber(), satelliteRewardsEnd.unpaid.toNumber());
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('User should not be able to trigger a satellite claim for a given proposal twice', async () => {
                try{
                    // Initial Values
                    governanceStorage                   = await governanceInstance.storage();
                    delegationStorage                   = await delegationInstance.storage();
                    const proposalId                    = governanceStorage.nextProposalId.toNumber() - 3;
                    const proposal                      = await governanceStorage.proposalLedger.get(proposalId);
                    const claimTraceBegin               = await governanceStorage.proposalRewards.get({
                        0: proposalId,
                        1: eve.pkh
                    })

                    // Operation
                    await chai.expect(governanceInstance.methods.distributeProposalRewards(eve.pkh, [proposalId]).send()).to.be.rejected;

                    // Assertion
                    assert.equal(proposal.rewardClaimReady, true);
                    assert.notStrictEqual(claimTraceBegin, undefined);

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })
        })
    })

    describe("Second Cycle", async () => {

        beforeEach("Set signer to satellite", async () => {
            await helperFunctions.signerFactory(tezos, eve.sk)
        });

        describe("%startNextRound", async () => {
            it('User should not be able to call the entrypoint if the current round has not ended', async () => {
                try{

                    // Initial Values
                    governanceStorage = await governanceInstance.storage();
                    const blocksPerProposalRound = governanceStorage.config.blocksPerProposalRound;

                    // Update config
                    await helperFunctions.signerFactory(tezos, bob.sk);
                    var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configBlocksPerProposalRound").send();
                    await updateConfigOperation.confirmation();
                    updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configBlocksPerVotingRound").send();
                    await updateConfigOperation.confirmation();
                    updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configBlocksPerTimelockRound").send();
                    await updateConfigOperation.confirmation();

                    // Initial Values
                    governanceStorage = await governanceInstance.storage();

                    // Operation
                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    await chai.expect(governanceInstance.methods.startNextRound(true).send()).to.be.rejected;

                    // Reset config
                    var updateConfigOperation = await governanceInstance.methods.updateConfig(0,"configBlocksPerProposalRound").send();
                    await updateConfigOperation.confirmation();
                    updateConfigOperation = await governanceInstance.methods.updateConfig(0,"configBlocksPerVotingRound").send();
                    await updateConfigOperation.confirmation();
                    updateConfigOperation = await governanceInstance.methods.updateConfig(0,"configBlocksPerTimelockRound").send();
                    await updateConfigOperation.confirmation();

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })    
        })

        describe("%propose", async () => {

            beforeEach("Set signer to satellite", async () => {
                await helperFunctions.signerFactory(tezos, eve.sk)
            });

            it('Satellite should not be able to call this entrypoint and create a proposal if it has already created enough proposals this cycle', async () => {
                try{
                    // Update config
                    await helperFunctions.signerFactory(tezos, bob.sk);
                    var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configMaxProposalsPerSatellite").send();
                    await updateConfigOperation.confirmation();

                    // Initial Values
                    await helperFunctions.signerFactory(tezos, eve.sk)
                    governanceStorage               = await governanceInstance.storage();
                    var currentCycleInfoRound       = governanceStorage.currentCycleInfo.round
                    var currentCycleInfoRoundString = Object.keys(currentCycleInfoRound)[0]

                    // Operation
                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();
                        governanceStorage           = await governanceInstance.storage();
                        currentCycleInfoRound                = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString          = Object.keys(currentCycleInfoRound)[0]
                    }

                    const firstProposalName          = "New Proposal #1";
                    const firstProposalDesc          = "Details about new proposal #1";
                    const firstProposalIpfs          = "ipfs://QM123456789";
                    const firstProposalSourceCode    = "Proposal Source Code";

                    // Create first proposal operation
                    const createFirstProposalOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send({amount: 0.1});
                    await createFirstProposalOperation.confirmation();

                    // Create second proposal operation - fail as max proposal is one
                    await chai.expect(governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send({amount: 0.1})).to.be.rejected; 

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Satellite should not be able to call this entrypoint if it registered during the current cycle', async () => {
                try{
                    // Initial Values
                    await helperFunctions.signerFactory(tezos, trudy.sk)
                    governanceStorage                   = await governanceInstance.storage();
                    var currentCycleInfoRound           = governanceStorage.currentCycleInfo.round
                    var currentCycleInfoRoundString     = Object.keys(currentCycleInfoRound)[0]
                    var currentCycle                    = governanceStorage.cycleId;

                    // Operation
                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();
                        governanceStorage           = await governanceInstance.storage();
                        currentCycleInfoRound                = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString          = Object.keys(currentCycleInfoRound)[0]
                    }
                    const firstProposalName         = "New Proposal #1";
                    const firstProposalDesc         = "Details about new proposal #1";
                    const firstProposalIpfs         = "ipfs://QM123456789";
                    const firstProposalSourceCode   = "Proposal Source Code";

                    // Register as satellite
                    const preregisteringSnapshot    = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: trudy.pkh})
                    const updateOperatorsOperation  = await mvkTokenInstance.methods.update_operators([
                    {
                        add_operator: {
                            owner: trudy.pkh,
                            operator: contractDeployments.doorman.address,
                            token_id: 0,
                        },
                    },
                    ])
                    .send()
                    await updateOperatorsOperation.confirmation();
                    const stakeOperation            = await doormanInstance.methods.stake(MVK(20000)).send();
                    await stakeOperation.confirmation();
                    const registerAsSatellite       = await delegationInstance.methods
                    .registerAsSatellite(
                        "Trudy Satellite", 
                        "Test description", 
                        "Test image", 
                        "Test website", 
                        700
                    ).send();
                    await registerAsSatellite.confirmation();

                    // Post registering values
                    governanceStorage               = await governanceInstance.storage();
                    currentCycle                    = governanceStorage.cycleId;
                    const postregisteringSnapshot   = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: trudy.pkh})

                    // Operation
                    await chai.expect(governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send({amount: 0.1})).to.be.rejected; 

                    // Assertions
                    assert.strictEqual(preregisteringSnapshot, undefined);
                    assert.notStrictEqual(postregisteringSnapshot, undefined);
                    assert.strictEqual(postregisteringSnapshot.ready, false);
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Satellite should not be able to call this entrypoint if it is not the proposal round', async () => {
                try{
                    // Update config
                    await helperFunctions.signerFactory(tezos, bob.sk);
                    var updateConfigOperation = await governanceInstance.methods.updateConfig(25,"configMaxProposalsPerSatellite").send();
                    await updateConfigOperation.confirmation();

                    // Initial Values
                    await helperFunctions.signerFactory(tezos, eve.sk);
                    governanceStorage           = await governanceInstance.storage();
                    const proposalId            = governanceStorage.nextProposalId; 
                    var currentCycleInfoRound            = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString      = Object.keys(currentCycleInfoRound)[0];

                    console.log(governanceStorage.currentCycleInfo);
                    console.log(currentCycleInfoRound);
                    console.log(currentCycleInfoRoundString);
                    console.log(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal");

                    // Operation
                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();
                        governanceStorage           = await governanceInstance.storage();
                        currentCycleInfoRound                = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString          = Object.keys(currentCycleInfoRound)[0]
                    }
                    const firstProposalName          = "New Proposal #1";
                    const firstProposalDesc          = "Details about new proposal #1";
                    const firstProposalIpfs          = "ipfs://QM123456789";
                    const firstProposalSourceCode    = "Proposal Source Code";

                    // add proposal data
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.council.address,
                            "council",
                            "ConfigActionExpiryDays",
                            1234
                        ]
                    );

                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: lambdaFunction,
								codeDescription: ""
                            },
                        }
                    ]

                    // Operation
                    var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode, proposalData).send({amount: 0.1});
                    await proposeOperation.confirmation();

                    const lockOperation = await governanceInstance.methods.lockProposal(proposalId).send();
                    await lockOperation.confirmation();

                    const proposalRoundVoteOperation = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                    await proposalRoundVoteOperation.confirmation();

                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    governanceStorage           = await governanceInstance.storage();
                    var currentCycleInfoRound            = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString      = Object.keys(currentCycleInfoRound)[0];

                    assert.strictEqual(currentCycleInfoRoundString, "voting");

                    // Operation
                    await chai.expect(governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send({amount: 0.1})).to.be.rejected; 
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })
        })

        describe("%updateProposalData", async () => {

            beforeEach("Set signer to satellite", async () => {
                await helperFunctions.signerFactory(tezos, eve.sk)
            });

            it('Satellite should not be able to call this entrypoint if it is not the proposal round', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage();
                    const proposalId            = governanceStorage.nextProposalId; 
                    var currentCycleInfoRound            = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString      = Object.keys(currentCycleInfoRound)[0];

                    // Operation
                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();
                        governanceStorage           = await governanceInstance.storage();
                        currentCycleInfoRound                = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString          = Object.keys(currentCycleInfoRound)[0]
                    }
                    const firstProposalName          = "New Proposal #1";
                    const firstProposalDesc          = "Details about new proposal #1";
                    const firstProposalIpfs          = "ipfs://QM123456789";
                    const firstProposalSourceCode    = "Proposal Source Code";

                    // add proposal data
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.council.address,
                            "council",
                            "ConfigActionExpiryDays",
                            1234
                        ]
                    );

                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: lambdaFunction,
								codeDescription: ""
                            },
                        }
                    ]

                    // Operation
                    var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode, proposalData).send({amount: 0.1});
                    await proposeOperation.confirmation();

                    // Operation
                    const lockProposalOperation  = await governanceInstance.methods.lockProposal(proposalId).send();
                    await lockProposalOperation.confirmation();

                    const proposalRoundVoteOperation = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                    await proposalRoundVoteOperation.confirmation();

                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    governanceStorage           = await governanceInstance.storage();
                    var currentCycleInfoRound            = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString      = Object.keys(currentCycleInfoRound)[0];

                    assert.strictEqual(currentCycleInfoRoundString, "voting");

                    // Operation
                    await chai.expect(governanceInstance.methods.updateProposalData(proposalId, [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: lambdaFunction,
								codeDescription: ""
                            },
                        }
                    ]).send()).to.be.rejected; 
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Satellite should not be able to call this entrypoint if the proposal is locked', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage();
                    const proposalId            = governanceStorage.nextProposalId; 
                    var currentCycleInfoRound            = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString      = Object.keys(currentCycleInfoRound)[0];

                    // Operation
                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();
                        governanceStorage           = await governanceInstance.storage();
                        currentCycleInfoRound                = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString          = Object.keys(currentCycleInfoRound)[0]
                    }
                    const firstProposalName          = "New Proposal #1";
                    const firstProposalDesc          = "Details about new proposal #1";
                    const firstProposalIpfs          = "ipfs://QM123456789";
                    const firstProposalSourceCode    = "Proposal Source Code";

                    // add proposal data
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.council.address,
                            "council",
                            "ConfigActionExpiryDays",
                            1234
                        ]
                    );

                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: lambdaFunction,
								codeDescription: ""
                            },
                        }
                    ]

                    // Operation
                    var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode, proposalData).send({amount: 0.1});
                    await proposeOperation.confirmation();

                    const lockOperation = await governanceInstance.methods.lockProposal(proposalId).send();
                    await lockOperation.confirmation();

                    // Test
                    // Operation
                    await chai.expect(governanceInstance.methods.updateProposalData(proposalId, [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: lambdaFunction,
								codeDescription: ""
                            },
                        }
                    ]).send()).to.be.rejected; 
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })
        })

        describe("%lockProposal", async () => {

            beforeEach("Set signer to satellite", async () => {
                await helperFunctions.signerFactory(tezos, eve.sk)
            });

            it('Satellite should not be able to call this entrypoint if it is not the proposal round', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage();
                    const proposalId            = governanceStorage.nextProposalId; 
                    var currentCycleInfoRound            = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString      = Object.keys(currentCycleInfoRound)[0];

                    // Operation
                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();
                        governanceStorage           = await governanceInstance.storage();
                        currentCycleInfoRound                = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString          = Object.keys(currentCycleInfoRound)[0]
                    }
                    const firstProposalName          = "New Proposal #1";
                    const firstProposalDesc          = "Details about new proposal #1";
                    const firstProposalIpfs          = "ipfs://QM123456789";
                    const firstProposalSourceCode    = "Proposal Source Code";

                    // add proposal data
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.council.address,
                            "council",
                            "ConfigActionExpiryDays",
                            1234
                        ]
                    );

                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: lambdaFunction,
								codeDescription: ""
                            },
                        }
                    ]

                    // Operation
                    var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode, proposalData).send({amount: 0.1});
                    await proposeOperation.confirmation();

                    // Operation
                    const lockProposalOperation  = await governanceInstance.methods.lockProposal(proposalId).send();
                    await lockProposalOperation.confirmation();

                    const proposalRoundVoteOperation = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                    await proposalRoundVoteOperation.confirmation();

                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    // Operation
                    await chai.expect(governanceInstance.methods.lockProposal(proposalId).send()).to.be.rejected; 
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })
        })

        describe("%proposalRoundVote", async () => {

            it('Satellite should not be able to call this entrypoint if it is not the proposal round', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage();
                    const proposalId            = governanceStorage.nextProposalId; 
                    var currentCycleInfoRound            = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString      = Object.keys(currentCycleInfoRound)[0];

                    // Operation
                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();
                        governanceStorage           = await governanceInstance.storage();
                        currentCycleInfoRound                = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString          = Object.keys(currentCycleInfoRound)[0]
                    }
                    const firstProposalName          = "New Proposal #1";
                    const firstProposalDesc          = "Details about new proposal #1";
                    const firstProposalIpfs          = "ipfs://QM123456789";
                    const firstProposalSourceCode    = "Proposal Source Code";

                    // add proposal data
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.council.address,
                            "council",
                            "ConfigActionExpiryDays",
                            1234
                        ]
                    );

                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: lambdaFunction,
								codeDescription: ""
                            },
                        }
                    ]

                    // Operation
                    var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode, proposalData).send({amount: 0.1});
                    await proposeOperation.confirmation();

                    // Operation
                    const lockProposalOperation  = await governanceInstance.methods.lockProposal(proposalId).send();
                    await lockProposalOperation.confirmation();

                    const proposalRoundVoteOperation = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                    await proposalRoundVoteOperation.confirmation();

                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    await chai.expect(governanceInstance.methods.proposalRoundVote(proposalId).send()).to.be.rejected;

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Satellite should not be able increase its total voting power during the current round', async () => {
                try{
                    // Initial Values
                    governanceStorage                   = await governanceInstance.storage();
                    const proposalId                    = governanceStorage.nextProposalId; 
                    var currentCycleInfoRound           = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString     = Object.keys(currentCycleInfoRound)[0];

                    // Operation
                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();
                        governanceStorage           = await governanceInstance.storage();
                        currentCycleInfoRound                = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString          = Object.keys(currentCycleInfoRound)[0]
                    }
                    const firstProposalName          = "New Proposal #1";
                    const firstProposalDesc          = "Details about new proposal #1";
                    const firstProposalIpfs          = "ipfs://QM123456789";
                    const firstProposalSourceCode    = "Proposal Source Code";

                    // Pre increase values
                    governanceStorage                   = await governanceInstance.storage();
                    doormanStorage                      = await doormanInstance.storage();
                    delegationStorage                   = await delegationInstance.storage();
                    var currentCycle                    = governanceStorage.cycleId;

                    // Eve stake 1 MVK to create a snapshot
                    var stakeOperation = await doormanInstance.methods.stake(MVK(1)).send();
                    await stakeOperation.confirmation();

                    const preIncreaseSnapshot           = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: eve.pkh})
                    const preIncreaseUserSMVK           = (await doormanStorage.userStakeBalanceLedger.get(eve.pkh)).balance.toNumber();
                    const preIncreaseSatellite          = await delegationStorage.satelliteLedger.get(eve.pkh);

                    // console.log('preIncreaseSnapshot');
                    // console.log(preIncreaseSnapshot);

                    // User increases its stake
                    var stakeOperation    = await doormanInstance.methods.stake(MVK(20)).send()
                    await stakeOperation.confirmation();

                    // User delegates to satellite
                    await helperFunctions.signerFactory(tezos, oscar.sk)
                    const updateOperators = await mvkTokenInstance.methods.update_operators([
                    {
                        add_operator: {
                            owner: oscar.pkh,
                            operator: contractDeployments.doorman.address,
                            token_id: 0,
                        },
                    },
                    ])
                    .send()
                    await updateOperators.confirmation();
                    stakeOperation = await doormanInstance.methods.stake(MVK(10000)).send();
                    await stakeOperation.confirmation();
                    const delegateOperation = await delegationInstance.methods.delegateToSatellite(oscar.pkh, eve.pkh).send()
                    await delegateOperation.confirmation()

                    // Post staking values
                    governanceStorage                   = await governanceInstance.storage();
                    doormanStorage                      = await doormanInstance.storage();
                    var currentCycle                    = governanceStorage.cycleId;

                    // add proposal data
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.council.address,
                            "council",
                            "ConfigActionExpiryDays",
                            1234
                        ]
                    );

                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: lambdaFunction,
								codeDescription: ""
                            },
                        }
                    ]

                    // Operation
                    await helperFunctions.signerFactory(tezos, eve.sk)
                    var proposeOperation                = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode, proposalData).send({amount: 0.1});
                    await proposeOperation.confirmation();

                    const lockProposalOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                    await lockProposalOperation.confirmation();

                    const voteOperation                 = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                    await voteOperation.confirmation();

                    // Final values
                    governanceStorage                   = await governanceInstance.storage();
                    const proposal                      = await governanceStorage.proposalLedger.get(proposalId);
                    const postIncreaseSnapshot          = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: eve.pkh})
                    const postIncreaseUserSMVK          = (await doormanStorage.userStakeBalanceLedger.get(eve.pkh)).balance.toNumber();
                    const postIncreaseSatellite         = await delegationStorage.satelliteLedger.get(eve.pkh);
                    
                    // console.log("BALANCE:", preIncreaseSatellite)
                    // console.log("BALANCE2:", postIncreaseSatellite)

                    console.log('postIncreaseSnapshot');
                    console.log(postIncreaseSnapshot);

                    // Assertions
                    assert.notEqual(postIncreaseUserSMVK, preIncreaseUserSMVK);
                    assert.notEqual(postIncreaseSatellite.stakedMvkBalance.toNumber(), preIncreaseSatellite.stakedMvkBalance.toNumber());
                    assert.notEqual(postIncreaseSatellite.totalDelegatedAmount.toNumber(), preIncreaseSatellite.totalDelegatedAmount.toNumber());
                    assert.equal(postIncreaseSnapshot.totalStakedMvkBalance.toNumber(), preIncreaseSnapshot.totalStakedMvkBalance.toNumber())
                    assert.equal(postIncreaseSnapshot.totalDelegatedAmount.toNumber(), preIncreaseSnapshot.totalDelegatedAmount.toNumber())
                    assert.equal(postIncreaseSnapshot.totalVotingPower.toNumber(), preIncreaseSnapshot.totalVotingPower.toNumber())
                    assert.equal(proposal.proposalVoteStakedMvkTotal.toNumber(), postIncreaseSnapshot.totalVotingPower.toNumber())
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Satellite should not be able to call this entrypoint if the proposal was dropped', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage();
                    const proposalId            = governanceStorage.nextProposalId; 
                    var currentCycleInfoRound            = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString      = Object.keys(currentCycleInfoRound)[0];

                    // Operation
                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();
                        governanceStorage           = await governanceInstance.storage();
                        currentCycleInfoRound                = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString          = Object.keys(currentCycleInfoRound)[0]
                    }
                    const firstProposalName          = "New Proposal #1";
                    const firstProposalDesc          = "Details about new proposal #1";
                    const firstProposalIpfs          = "ipfs://QM123456789";
                    const firstProposalSourceCode    = "Proposal Source Code";

                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.council.address,
                            "council",
                            "ConfigActionExpiryDays",
                            1234
                        ]
                    );

                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: lambdaFunction,
								codeDescription: ""
                            },
                        }
                    ]

                    // Operation
                    var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode, proposalData).send({amount: 0.1});
                    await proposeOperation.confirmation();

                    const lockProposalOperation  = await governanceInstance.methods.lockProposal(proposalId).send();
                    await lockProposalOperation.confirmation();

                    const dropProposalOperation = await governanceInstance.methods.dropProposal(proposalId).send();
                    await dropProposalOperation.confirmation();

                    await chai.expect(governanceInstance.methods.proposalRoundVote(proposalId).send()).to.be.rejected;
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Satellite should not be able to call this entrypoint if the proposal is not in the current round', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage();
                    const proposalId            = 1;
                    var currentCycleInfoRound            = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString      = Object.keys(currentCycleInfoRound)[0];

                    // Operation
                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();
                        governanceStorage           = await governanceInstance.storage();
                        currentCycleInfoRound                = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString          = Object.keys(currentCycleInfoRound)[0]
                    }

                    // Operation
                    await chai.expect(governanceInstance.methods.proposalRoundVote(proposalId).send()).to.be.rejected;
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Satellite should not be able to call this entrypoint if the proposal was executed', async () => {
                try{
                    // UpdateConfig
                    await helperFunctions.signerFactory(tezos, bob.sk)
                    var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configMinProposalRoundVotePct").send();
                    await updateConfigOperation.confirmation();
                    var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configMinProposalRoundVotesReq").send();
                    await updateConfigOperation.confirmation();
                    var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configMinQuorumPercentage").send();
                    await updateConfigOperation.confirmation();
                    var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configMinYayVotePercentage").send();
                    await updateConfigOperation.confirmation();
                    var updateConfigOperation = await delegationInstance.methods.updateConfig(1,"configDelegationRatio").send();
                    await updateConfigOperation.confirmation();
                    // Initial Values
                    await helperFunctions.signerFactory(tezos, eve.sk)
                    governanceStorage           = await governanceInstance.storage()
                    governanceStorage           = await governanceInstance.storage();
                    const proposalId            = governanceStorage.nextProposalId; 
                    var currentCycleInfoRound            = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString      = Object.keys(currentCycleInfoRound)[0];

                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();
                        governanceStorage           = await governanceInstance.storage();
                        currentCycleInfoRound                = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString          = Object.keys(currentCycleInfoRound)[0]
                    }
                    
                    const firstProposalName          = "New Proposal #1";
                    const firstProposalDesc          = "Details about new proposal #1";
                    const firstProposalIpfs          = "ipfs://QM123456789";
                    const firstProposalSourceCode    = "Proposal Source Code";

                    // Operation
                    var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send({amount: 0.1});
                    await proposeOperation.confirmation();

                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.council.address,
                            "council",
                            "ConfigActionExpiryDays",
                            1234
                        ]
                    );

                    const addDataOperation = await governanceInstance.methods.updateProposalData(proposalId, [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: lambdaFunction,
								codeDescription: ""
                            },
                        }
                    ]).send();
                    await addDataOperation.confirmation()

                    const lockOperation = await governanceInstance.methods.lockProposal(proposalId).send();
                    await lockOperation.confirmation()

                    const proposalRoundVoteOperation = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                    await proposalRoundVoteOperation.confirmation();

                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    const votingRoundVoteOperation = await governanceInstance.methods.votingRoundVote("yay").send();
                    await votingRoundVoteOperation.confirmation();

                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    await chai.expect(governanceInstance.methods.proposalRoundVote(proposalId).send()).to.be.rejected;
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })
        })

        describe("%dropProposal", async () => {
            
            beforeEach("Set signer to satellite", async () => {
                await helperFunctions.signerFactory(tezos, eve.sk)
            });

            it('Proposer should not be able to call this entrypoint if the delegation contract is not referenced in the generalContracts map or the getSatelliteOpt view doesn’t exist', async () => {
                try{
                    // Initial Values
                    await helperFunctions.signerFactory(tezos, eve.sk);
                    governanceStorage           = await governanceInstance.storage();
                    const proposalId            = governanceStorage.nextProposalId; 
                    var currentCycleInfoRound            = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString      = Object.keys(currentCycleInfoRound)[0];

                    // Operation
                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();
                        governanceStorage           = await governanceInstance.storage();
                        currentCycleInfoRound                = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString          = Object.keys(currentCycleInfoRound)[0]
                    }
                    const firstProposalName          = "New Proposal #1";
                    const firstProposalDesc          = "Details about new proposal #1";
                    const firstProposalIpfs          = "ipfs://QM123456789";
                    const firstProposalSourceCode    = "Proposal Source Code";

                    // Operation
                    var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send({amount: 0.1});
                    await proposeOperation.confirmation();

                    // Update config
                    await helperFunctions.signerFactory(tezos, bob.sk);
                    var updateGeneralContractOperation = await governanceInstance.methods.updateGeneralContracts("delegation", contractDeployments.delegation.address).send();
                    await updateGeneralContractOperation.confirmation();

                    await helperFunctions.signerFactory(tezos, eve.sk);
                    await chai.expect(governanceInstance.methods.dropProposal(proposalId).send()).to.be.rejected;

                    // Reset
                    await helperFunctions.signerFactory(tezos, bob.sk);
                    updateGeneralContractOperation = await governanceInstance.methods.updateGeneralContracts("delegation", contractDeployments.delegation.address).send();
                    await updateGeneralContractOperation.confirmation();

                    governanceStorage           = await governanceInstance.storage();
                    var generalContracts        = await governanceStorage.generalContracts;
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Proposer should not be able to call this entrypoint if the selected proposal was already executed', async () => {
                try{
                    // UpdateConfig
                    await helperFunctions.signerFactory(tezos, bob.sk)
                    var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configMinProposalRoundVotePct").send();
                    await updateConfigOperation.confirmation();
                    var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configMinProposalRoundVotesReq").send();
                    await updateConfigOperation.confirmation();
                    var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configMinQuorumPercentage").send();
                    await updateConfigOperation.confirmation();
                    var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configMinYayVotePercentage").send();
                    await updateConfigOperation.confirmation();
                    var updateConfigOperation = await delegationInstance.methods.updateConfig(1,"configDelegationRatio").send();
                    await updateConfigOperation.confirmation();

                    // Initial Values
                    await helperFunctions.signerFactory(tezos, eve.sk)
                    governanceStorage           = await governanceInstance.storage()
                    governanceStorage           = await governanceInstance.storage();
                    const proposalId            = governanceStorage.nextProposalId; 
                    var currentCycleInfoRound            = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString      = Object.keys(currentCycleInfoRound)[0];

                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();
                        governanceStorage           = await governanceInstance.storage();
                        currentCycleInfoRound                = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString          = Object.keys(currentCycleInfoRound)[0]
                    }
                    
                    const firstProposalName          = "New Proposal #1";
                    const firstProposalDesc          = "Details about new proposal #1";
                    const firstProposalIpfs          = "ipfs://QM123456789";
                    const firstProposalSourceCode    = "Proposal Source Code";

                    // Operation
                    var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send({amount: 0.1});
                    await proposeOperation.confirmation();

                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.council.address,
                            "council",
                            "ConfigActionExpiryDays",
                            1234
                        ]
                    );

                    const addDataOperation = await governanceInstance.methods.updateProposalData(proposalId, [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: lambdaFunction,
								codeDescription: ""
                            },
                        }
                    ]).send();
                    await addDataOperation.confirmation()

                    const lockOperation = await governanceInstance.methods.lockProposal(proposalId).send();
                    await lockOperation.confirmation()

                    const proposalRoundVoteOperation = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                    await proposalRoundVoteOperation.confirmation();

                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    const votingRoundVoteOperation = await governanceInstance.methods.votingRoundVote("yay").send();
                    await votingRoundVoteOperation.confirmation();

                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    await chai.expect(governanceInstance.methods.dropProposal(proposalId).send()).to.be.rejected;
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Proposer should not be able to call this entrypoint if the selected proposal is not in the current round', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    governanceStorage           = await governanceInstance.storage();
                    var currentCycleInfoRound            = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString      = Object.keys(currentCycleInfoRound)[0];

                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();
                        governanceStorage           = await governanceInstance.storage();
                        currentCycleInfoRound                = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString          = Object.keys(currentCycleInfoRound)[0]
                    }
                    await chai.expect(governanceInstance.methods.dropProposal(1).send()).to.be.rejected;
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('If dropped proposal was selected has highest voted proposal or timelock proposal, it should not be executed and should reset the current round', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage();
                    const proposalId            = governanceStorage.nextProposalId; 
                    var currentCycleInfoRound            = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString      = Object.keys(currentCycleInfoRound)[0];

                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();
                        governanceStorage           = await governanceInstance.storage();
                        currentCycleInfoRound                = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString          = Object.keys(currentCycleInfoRound)[0]
                    }
                    
                    const firstProposalName          = "New Proposal #1";
                    const firstProposalDesc          = "Details about new proposal #1";
                    const firstProposalIpfs          = "ipfs://QM123456789";
                    const firstProposalSourceCode    = "Proposal Source Code";

                    // Operation
                    var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send({amount: 0.1});
                    await proposeOperation.confirmation();

                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.council.address,
                            "council",
                            "ConfigActionExpiryDays",
                            1234
                        ]
                    );

                    const addDataOperation = await governanceInstance.methods.updateProposalData(proposalId, [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: lambdaFunction,
								codeDescription: ""
                            },
                        }
                    ]).send();
                    await addDataOperation.confirmation()

                    const lockOperation = await governanceInstance.methods.lockProposal(proposalId).send();
                    await lockOperation.confirmation()

                    const proposalRoundVoteOperation = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                    await proposalRoundVoteOperation.confirmation();

                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    // Final values
                    governanceStorage           = await governanceInstance.storage();
                    var currentCycleInfoRound            = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString      = Object.keys(currentCycleInfoRound)[0];

                    assert.strictEqual(currentCycleInfoRoundString, "voting");

                    const dropProposalOperation = await governanceInstance.methods.dropProposal(proposalId).send();
                    await dropProposalOperation.confirmation();

                    // Final values
                    governanceStorage           = await governanceInstance.storage();
                    currentCycleInfoRound                = governanceStorage.currentCycleInfo.round;
                    currentCycleInfoRoundString          = Object.keys(currentCycleInfoRound)[0];

                    assert.strictEqual(currentCycleInfoRoundString, "proposal");
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })
        })

        describe("%votingRoundVote", async () => {

            beforeEach("Set signer to satellite", async () => {
                await helperFunctions.signerFactory(tezos, eve.sk)
            });
            
            it('Satellite should not be able to call this entrypoint if it is not the voting round', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage();
                    var currentCycleInfoRound            = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString      = Object.keys(currentCycleInfoRound)[0];

                    // Operation
                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();
                        governanceStorage           = await governanceInstance.storage();
                        currentCycleInfoRound                = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString          = Object.keys(currentCycleInfoRound)[0]
                    }

                    await chai.expect(governanceInstance.methods.votingRoundVote("yay").send()).to.be.rejected;
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Satellite should not be able to call this entrypoint if the delegation contract is not referenced in the generalContracts map or the getSatelliteOpt view doesn’t exist', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage();
                    const proposalId            = governanceStorage.nextProposalId; 
                    var currentCycleInfoRound            = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString      = Object.keys(currentCycleInfoRound)[0];

                    // Operation
                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();
                        governanceStorage           = await governanceInstance.storage();
                        currentCycleInfoRound                = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString          = Object.keys(currentCycleInfoRound)[0]
                    }

                    const firstProposalName          = "New Proposal #1";
                    const firstProposalDesc          = "Details about new proposal #1";
                    const firstProposalIpfs          = "ipfs://QM123456789";
                    const firstProposalSourceCode    = "Proposal Source Code";

                    // Operation
                    var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send({amount: 0.1});
                    await proposeOperation.confirmation();

                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.council.address,
                            "council",
                            "ConfigActionExpiryDays",
                            1234
                        ]
                    );

                    const addDataOperation = await governanceInstance.methods.updateProposalData(proposalId, [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: lambdaFunction,
								codeDescription: ""
                            },
                        }
                    ]).send();
                    await addDataOperation.confirmation()

                    const lockOperation = await governanceInstance.methods.lockProposal(proposalId).send();
                    await lockOperation.confirmation()

                    const proposalRoundVoteOperation = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                    await proposalRoundVoteOperation.confirmation();

                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();


                    // Update config
                    await helperFunctions.signerFactory(tezos, bob.sk);
                    var updateGeneralContractOperation = await governanceInstance.methods.updateGeneralContracts("delegation", contractDeployments.delegation.address).send();
                    await updateGeneralContractOperation.confirmation();

                    await helperFunctions.signerFactory(tezos, eve.sk)
                    await chai.expect(governanceInstance.methods.votingRoundVote("yay").send()).to.be.rejected;

                    // Reset
                    await helperFunctions.signerFactory(tezos, bob.sk)
                    updateGeneralContractOperation = await governanceInstance.methods.updateGeneralContracts("delegation", contractDeployments.delegation.address).send();
                    await updateGeneralContractOperation.confirmation();
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })
        })

        describe("%executeProposal", async () => {
            
            beforeEach("Set signer to satellite", async () => {
                await helperFunctions.signerFactory(tezos, eve.sk)
            });
            
            it('User should be able to call this entrypoint automatically when switching from the timelock round to the new round', async () => {
                try{
                    // UpdateConfig
                    await helperFunctions.signerFactory(tezos, bob.sk)
                    var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configMinProposalRoundVotePct").send();
                    await updateConfigOperation.confirmation();
                    var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configMinProposalRoundVotesReq").send();
                    await updateConfigOperation.confirmation();
                    var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configMinQuorumPercentage").send();
                    await updateConfigOperation.confirmation();
                    var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configMinYayVotePercentage").send();
                    await updateConfigOperation.confirmation();
                    var updateConfigOperation = await delegationInstance.methods.updateConfig(1,"configDelegationRatio").send();
                    await updateConfigOperation.confirmation();

                    // Initial Values
                    await helperFunctions.signerFactory(tezos, eve.sk)
                    governanceStorage           = await governanceInstance.storage();
                    const proposalId            = governanceStorage.nextProposalId; 
                    var currentCycleInfoRound            = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString      = Object.keys(currentCycleInfoRound)[0];

                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();
                        governanceStorage           = await governanceInstance.storage();
                        currentCycleInfoRound                = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString          = Object.keys(currentCycleInfoRound)[0]
                    }
                    
                    const firstProposalName          = "New Proposal #1";
                    const firstProposalDesc          = "Details about new proposal #1";
                    const firstProposalIpfs          = "ipfs://QM123456789";
                    const firstProposalSourceCode    = "Proposal Source Code";

                    // Operation
                    var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send({amount: 0.1});
                    await proposeOperation.confirmation();

                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.council.address,
                            "council",
                            "ConfigActionExpiryDays",
                            1234
                        ]
                    );

                    const addDataOperation = await governanceInstance.methods.updateProposalData(proposalId, [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: lambdaFunction,
								codeDescription: ""
                            },
                        }
                    ]).send();
                    await addDataOperation.confirmation()

                    const lockOperation = await governanceInstance.methods.lockProposal(proposalId).send();
                    await lockOperation.confirmation()

                    const proposalRoundVoteOperation = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                    await proposalRoundVoteOperation.confirmation();

                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    var votingRoundVoteOperation = await governanceInstance.methods.votingRoundVote("yay").send();
                    await votingRoundVoteOperation.confirmation();

                    await helperFunctions.signerFactory(tezos, alice.sk)
                    votingRoundVoteOperation = await governanceInstance.methods.votingRoundVote("yay").send();
                    await votingRoundVoteOperation.confirmation();

                    await helperFunctions.signerFactory(tezos, eve.sk)

                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    
                    governanceStorage                   = await governanceInstance.storage();
                    var currentCycleInfoRound           = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString     = Object.keys(currentCycleInfoRound)[0];
                    var proposal                      = await governanceStorage.proposalLedger.get(proposalId);

                    assert.strictEqual(currentCycleInfoRoundString, "proposal")
                    assert.strictEqual(proposal.executed, true)
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })
            
            it('User should be able to call this entrypoint and execute a non-executed proposal from a previous cycle', async () => {
                try{

                    // Initial Values
                    await helperFunctions.signerFactory(tezos, eve.sk)
                    governanceStorage                       = await governanceInstance.storage();
                    const firstProposalId                   = governanceStorage.nextProposalId; 
                    var currentCycleInfoRound               = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString         = Object.keys(currentCycleInfoRound)[0];

                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();
                        governanceStorage           = await governanceInstance.storage();
                        currentCycleInfoRound                = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString          = Object.keys(currentCycleInfoRound)[0]
                    }
                    
                    const firstProposalName          = "New Proposal #1";
                    const firstProposalDesc          = "Details about new proposal #1";
                    const firstProposalIpfs          = "ipfs://QM123456789";
                    const firstProposalSourceCode    = "Proposal Source Code";

                    // First cycle operations
                    var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send({amount: 0.1});
                    await proposeOperation.confirmation();

                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.council.address,
                            "council",
                            "ConfigActionExpiryDays",
                            1234
                        ]
                    );

                    var addDataOperation = await governanceInstance.methods.updateProposalData(firstProposalId, [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: lambdaFunction,
								codeDescription: ""
                            },
                        }
                    ]).send();
                    await addDataOperation.confirmation()

                    var lockOperation = await governanceInstance.methods.lockProposal(firstProposalId).send();
                    await lockOperation.confirmation()

                    var proposalRoundVoteOperation = await governanceInstance.methods.proposalRoundVote(firstProposalId).send();
                    await proposalRoundVoteOperation.confirmation();

                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(false).send();
                    await startNextRoundOperation.confirmation();

                    var votingRoundVoteOperation = await governanceInstance.methods.votingRoundVote("yay").send();
                    await votingRoundVoteOperation.confirmation();

                    await helperFunctions.signerFactory(tezos, alice.sk)
                    votingRoundVoteOperation = await governanceInstance.methods.votingRoundVote("yay").send();
                    await votingRoundVoteOperation.confirmation();

                    await helperFunctions.signerFactory(tezos, eve.sk)

                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(false).send();
                    await startNextRoundOperation.confirmation();

                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(false).send();
                    await startNextRoundOperation.confirmation();

                    // Mid values
                    governanceStorage                       = await governanceInstance.storage();
                    const secondProposalId                  = governanceStorage.nextProposalId;
                    const midValuesProposal                 = await governanceStorage.proposalLedger.get(firstProposalId);

                    // Second cycle operations
                    var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send({amount: 0.1});
                    await proposeOperation.confirmation();

                    addDataOperation = await governanceInstance.methods.updateProposalData(secondProposalId, [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: lambdaFunction,
								codeDescription: ""
                            },
                        }
                    ]).send();
                    await addDataOperation.confirmation()

                    lockOperation = await governanceInstance.methods.lockProposal(secondProposalId).send();
                    await lockOperation.confirmation()

                    proposalRoundVoteOperation = await governanceInstance.methods.proposalRoundVote(secondProposalId).send();
                    await proposalRoundVoteOperation.confirmation();

                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(false).send();
                    await startNextRoundOperation.confirmation();

                    var votingRoundVoteOperation = await governanceInstance.methods.votingRoundVote("yay").send();
                    await votingRoundVoteOperation.confirmation();

                    await helperFunctions.signerFactory(tezos, alice.sk)
                    votingRoundVoteOperation = await governanceInstance.methods.votingRoundVote("yay").send();
                    await votingRoundVoteOperation.confirmation();

                    await helperFunctions.signerFactory(tezos, eve.sk)

                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(false).send();
                    await startNextRoundOperation.confirmation();

                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(false).send();
                    await startNextRoundOperation.confirmation();

                    // Execute first proposal
                    const executeProposalOperation      = await governanceInstance.methods.executeProposal(firstProposalId).send();
                    await executeProposalOperation.confirmation();

                    // Final values
                    governanceStorage                   = await governanceInstance.storage();
                    var proposal                        = await governanceStorage.proposalLedger.get(firstProposalId);

                    assert.strictEqual(midValuesProposal.executed, false)
                    assert.strictEqual(midValuesProposal.executionReady, true)
                    assert.strictEqual(proposal.executed, true)
                    assert.strictEqual(proposal.executionReady, true)
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('User should not be able to call this entrypoint if there is no proposal to execute', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage();
                    const proposalId            = governanceStorage.nextProposalId; 
                    var currentCycleInfoRound            = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString      = Object.keys(currentCycleInfoRound)[0];

                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();
                        governanceStorage           = await governanceInstance.storage();
                        currentCycleInfoRound                = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString          = Object.keys(currentCycleInfoRound)[0]
                    }
                    
                    const firstProposalName          = "New Proposal #1";
                    const firstProposalDesc          = "Details about new proposal #1";
                    const firstProposalIpfs          = "ipfs://QM123456789";
                    const firstProposalSourceCode    = "Proposal Source Code";

                    // Operation
                    var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send({amount: 0.1});
                    await proposeOperation.confirmation();

                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.council.address,
                            "council",
                            "ConfigActionExpiryDays",
                            1234
                        ]
                    );

                    const addDataOperation = await governanceInstance.methods.updateProposalData(proposalId, [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: lambdaFunction,
								codeDescription: ""
                            },
                        }
                    ]).send();
                    await addDataOperation.confirmation()

                    const lockOperation = await governanceInstance.methods.lockProposal(proposalId).send();
                    await lockOperation.confirmation()

                    const proposalRoundVoteOperation = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                    await proposalRoundVoteOperation.confirmation();

                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    var votingRoundVoteOperation = await governanceInstance.methods.votingRoundVote("nay").send();
                    await votingRoundVoteOperation.confirmation();

                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    await chai.expect(governanceInstance.methods.executeProposal(proposalId).send()).to.be.rejected;
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('User should be able to call this entrypoint automatically when switching from the timelock round to the new round', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage();
                    const proposalId            = governanceStorage.nextProposalId; 
                    var currentCycleInfoRound            = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString      = Object.keys(currentCycleInfoRound)[0];

                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();
                        governanceStorage           = await governanceInstance.storage();
                        currentCycleInfoRound                = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString          = Object.keys(currentCycleInfoRound)[0]
                    }
                    
                    const firstProposalName          = "New Proposal #1";
                    const firstProposalDesc          = "Details about new proposal #1";
                    const firstProposalIpfs          = "ipfs://QM123456789";
                    const firstProposalSourceCode    = "Proposal Source Code";

                    // Operation
                    var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send({amount: 0.1});
                    await proposeOperation.confirmation();

                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.council.address,
                            "council",
                            "ConfigActionExpiryDays",
                            1234
                        ]
                    );

                    const addDataOperation = await governanceInstance.methods.updateProposalData(proposalId, [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: lambdaFunction,
								codeDescription: ""
                            },
                        }
                    ]).send();
                    await addDataOperation.confirmation()

                    const lockOperation = await governanceInstance.methods.lockProposal(proposalId).send();
                    await lockOperation.confirmation()

                    const proposalRoundVoteOperation = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                    await proposalRoundVoteOperation.confirmation();

                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    var votingRoundVoteOperation = await governanceInstance.methods.votingRoundVote("yay").send();
                    await votingRoundVoteOperation.confirmation();

                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    
                    governanceStorage           = await governanceInstance.storage();
                    var currentCycleInfoRound            = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString      = Object.keys(currentCycleInfoRound)[0];
                    const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                    assert.strictEqual(currentCycleInfoRoundString, "proposal")
                    assert.strictEqual(proposal.executed, true)

                    await chai.expect(governanceInstance.methods.executeProposal(proposalId).send()).to.be.rejected;
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('User should not be able to call this entrypoint if the proposal was dropped', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage();
                    const proposalId            = governanceStorage.nextProposalId; 
                    var currentCycleInfoRound            = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString      = Object.keys(currentCycleInfoRound)[0];

                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();
                        governanceStorage           = await governanceInstance.storage();
                        currentCycleInfoRound                = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString          = Object.keys(currentCycleInfoRound)[0]
                    }
                    
                    const firstProposalName          = "New Proposal #1";
                    const firstProposalDesc          = "Details about new proposal #1";
                    const firstProposalIpfs          = "ipfs://QM123456789";
                    const firstProposalSourceCode    = "Proposal Source Code";

                    // Operation
                    var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send({amount: 0.1});
                    await proposeOperation.confirmation();

                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.council.address,
                            "council",
                            "ConfigActionExpiryDays",
                            1234
                        ]
                    );

                    const addDataOperation = await governanceInstance.methods.updateProposalData(proposalId, [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: lambdaFunction,
								codeDescription: ""
                            },
                        }
                    ]).send();
                    await addDataOperation.confirmation()

                    const lockOperation = await governanceInstance.methods.lockProposal(proposalId).send();
                    await lockOperation.confirmation()

                    const proposalRoundVoteOperation = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                    await proposalRoundVoteOperation.confirmation();

                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    var votingRoundVoteOperation = await governanceInstance.methods.votingRoundVote("yay").send();
                    await votingRoundVoteOperation.confirmation();

                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    var dropProposalOperation = await governanceInstance.methods.dropProposal(proposalId).send();
                    await dropProposalOperation.confirmation();

                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(false).send();
                    await startNextRoundOperation.confirmation();
                    
                    governanceStorage           = await governanceInstance.storage();
                    var currentCycleInfoRound            = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString      = Object.keys(currentCycleInfoRound)[0];
                    const proposal              = await governanceStorage.proposalLedger.get(proposalId);

                    assert.strictEqual(currentCycleInfoRoundString, "proposal")
                    assert.strictEqual(proposal.executed, false)
                    assert.strictEqual(proposal.status, "DROPPED")

                    await chai.expect(governanceInstance.methods.executeProposal(proposalId).send()).to.be.rejected;
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('User should not be able to call this entrypoint if the metadata cannot be unpacked', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage();
                    const proposalId            = governanceStorage.nextProposalId; 
                    var currentCycleInfoRound            = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString      = Object.keys(currentCycleInfoRound)[0];

                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();
                        governanceStorage           = await governanceInstance.storage();
                        currentCycleInfoRound                = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString          = Object.keys(currentCycleInfoRound)[0]
                    }
                    
                    const firstProposalName          = "New Proposal #1";
                    const firstProposalDesc          = "Details about new proposal #1";
                    const firstProposalIpfs          = "ipfs://QM123456789";
                    const firstProposalSourceCode    = "Proposal Source Code";

                    // Operation
                    var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send({amount: 0.1});
                    await proposeOperation.confirmation();

                    const addDataOperation = await governanceInstance.methods.updateProposalData(proposalId, [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: Buffer.from("TestWithWrongData", 'ascii').toString('hex'),
                                codeDescription: ""
                            },
                        }
                    ]).send();
                    await addDataOperation.confirmation()

                    const lockOperation = await governanceInstance.methods.lockProposal(proposalId).send();
                    await lockOperation.confirmation()

                    const proposalRoundVoteOperation = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                    await proposalRoundVoteOperation.confirmation();

                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    var votingRoundVoteOperation = await governanceInstance.methods.votingRoundVote("yay").send();
                    await votingRoundVoteOperation.confirmation();

                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(false).send();
                    await startNextRoundOperation.confirmation();
                    
                    governanceStorage                   = await governanceInstance.storage();
                    var currentCycleInfoRound           = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString     = Object.keys(currentCycleInfoRound)[0];
                    const proposal                      = await governanceStorage.proposalLedger.get(proposalId);

                    assert.strictEqual(currentCycleInfoRoundString, "proposal")
                    assert.strictEqual(proposal.executed, false)

                    await chai.expect(governanceInstance.methods.executeProposal(proposalId).send()).to.be.rejected;
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })
        })
    })

    describe("%breakGlass", async () => {

        before("Update emergency config", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk)
            var updateConfigOperation       = await emergencyGovernanceInstance.methods.updateConfig(1,"configStakedMvkPercentRequired").send();
            await updateConfigOperation.confirmation();
            updateConfigOperation           = await emergencyGovernanceInstance.methods.updateConfig(0,"configRequiredFeeMutez").send();
            await updateConfigOperation.confirmation();
        });

        beforeEach("Set signer to satellite", async () => {
            await helperFunctions.signerFactory(tezos, eve.sk)
        });

        it('Other contracts should not be able to call this entrypoint', async () => {
            try{
                // Set all contracts admin to governance address if it is not
                await helperFunctions.signerFactory(tezos, bob.sk);
                await chai.expect(governanceInstance.methods.breakGlass().send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5})
            }
        })

        it('Emergency Governance contract should not be able to call this entrypoint is the breakGlass contract does not exist in the generalContracts map', async () => {
            try{
                // Set all contracts admin to governance address if it is not
                await helperFunctions.signerFactory(tezos, bob.sk);
                governanceStorage             = await governanceInstance.storage();
                var generalContracts          = governanceStorage.generalContracts.entries();

                // Update general contracts
                var updateGeneralContractOperation = await governanceInstance.methods.updateGeneralContracts("breakGlass", contractDeployments.breakGlass.address).send();
                await updateGeneralContractOperation.confirmation();
                for (let entry of generalContracts){
                    // Get contract storage
                    var contract        = await utils.tezos.contract.at(entry[1]);
                    var storage:any     = await contract.storage();

                    // Check admin
                    if(storage.hasOwnProperty('admin') && storage.admin!==contractDeployments.governanceProxy.address){
                        var setAdminOperation   = await contract.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                        await setAdminOperation.confirmation()
                    }
                }

                // Trigger emergency governance and breakGlass
                const emergencyControlOperation = await emergencyGovernanceInstance.methods.triggerEmergencyControl(
                    "Test emergency governance", 
                    "For tests"
                ).send();
                await emergencyControlOperation.confirmation();
                await chai.expect(emergencyGovernanceInstance.methods.voteForEmergencyControl().send()).to.be.rejected;

                // Check if glass was broken
                breakGlassStorage       = await breakGlassInstance.storage();
                const glassBroken       = breakGlassStorage.glassBroken;
                assert.equal(glassBroken, false);

                // Check admin and pause in all contracts
                governanceStorage       = await governanceInstance.storage();
                generalContracts        = governanceStorage.generalContracts.entries();
                for (let entry of generalContracts){
                    // Get contract storage
                    var contract        = await utils.tezos.contract.at(entry[1]);
                    var storage:any     = await contract.storage();

                    // Check admin
                    if(storage.hasOwnProperty('admin')){
                        assert.equal(storage.admin, contractDeployments.governanceProxy.address)
                    }

                    // Check pause
                    var breakGlassConfig    = storage.breakGlassConfig
                    if(storage.hasOwnProperty('breakGlassConfig')){
                        for (let [key, value] of Object.entries(breakGlassConfig)){
                            assert.equal(value, false);
                        }
                    }
                }

                // Reset general contracts
                var updateGeneralContractOperation = await governanceInstance.methods.updateGeneralContracts("breakGlass", contractDeployments.breakGlass.address).send();
                await updateGeneralContractOperation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5})
            }
        })

        it('Emergency Governance contract should be able to call this entrypoint and call set the governance admin to the breakGlass address', async () => {
            try{
                // Set all contracts admin to governance address if it is not
                await helperFunctions.signerFactory(tezos, bob.sk);
                governanceStorage             = await governanceInstance.storage();
                var generalContracts          = governanceStorage.generalContracts.entries();

                for (let entry of generalContracts){
                    // Get contract storage
                    var contract        = await utils.tezos.contract.at(entry[1]);
                    var storage:any     = await contract.storage();

                    // Check admin
                    if(storage.hasOwnProperty('admin') && storage.admin!==contractDeployments.governanceProxy.address && storage.admin!==contractDeployments.breakGlass.address){
                        var setAdminOperation   = await contract.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                        await setAdminOperation.confirmation()
                    }
                }

                // Trigger emergency governance and breakGlass
                const voteOperation             = await emergencyGovernanceInstance.methods.voteForEmergencyControl().send();
                await voteOperation.confirmation();

                // Check if glass was broken
                breakGlassStorage       = await breakGlassInstance.storage();
                const glassBroken       = breakGlassStorage.glassBroken;
                assert.equal(glassBroken, true);

                // Check admin and pause in all contracts
                governanceStorage       = await governanceInstance.storage();
                assert.strictEqual(governanceStorage.admin, contractDeployments.breakGlass.address);
            } catch(e){
                console.dir(e, {depth: 5})
            }
        })
    })
});