import assert from "assert";
import { Utils, MVK } from "./helpers/Utils";

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

import { bob, alice, eve, mallory } from "../scripts/sandbox/accounts";
import * as helperFunctions from './helpers/helperFunctions'
import { compileLambdaFunction } from "scripts/proxyLambdaFunctionMaker/proxyLambdaFunctionPacker";

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("Governance quorum tests", async () => {
    
    var utils: Utils;
    let tezos

    let doormanInstance;
    let delegationInstance;
    let mvkTokenInstance;
    let councilInstance;
    let governanceInstance;
    let governanceFinancialInstance;
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
    let governanceFinancialStorage;
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

    before("setup", async () => {
        try {
            utils = new Utils();
            await utils.init(bob.sk);
    
            doormanInstance                 = await utils.tezos.contract.at(contractDeployments.doorman.address);
            delegationInstance              = await utils.tezos.contract.at(contractDeployments.delegation.address);
            mvkTokenInstance                = await utils.tezos.contract.at(contractDeployments.mvkToken.address);
            councilInstance                 = await utils.tezos.contract.at(contractDeployments.council.address);
            governanceInstance              = await utils.tezos.contract.at(contractDeployments.governance.address);
            governanceFinancialInstance     = await utils.tezos.contract.at(contractDeployments.governanceFinancial.address);
            governanceProxyInstance         = await utils.tezos.contract.at(contractDeployments.governanceProxy.address);
            emergencyGovernanceInstance     = await utils.tezos.contract.at(contractDeployments.emergencyGovernance.address);
            breakGlassInstance              = await utils.tezos.contract.at(contractDeployments.breakGlass.address);
            vestingInstance                 = await utils.tezos.contract.at(contractDeployments.vesting.address);
            treasuryInstance                = await utils.tezos.contract.at(contractDeployments.treasury.address);
            farmFactoryInstance             = await utils.tezos.contract.at(contractDeployments.farmFactory.address);
            treasuryFactoryInstance         = await utils.tezos.contract.at(contractDeployments.treasuryFactory.address);
            farmInstance                    = await utils.tezos.contract.at(contractDeployments.farm.address);
                
            doormanStorage                  = await doormanInstance.storage();
            delegationStorage               = await delegationInstance.storage();
            mvkTokenStorage                 = await mvkTokenInstance.storage();
            councilStorage                  = await councilInstance.storage();
            governanceStorage               = await governanceInstance.storage();
            governanceFinancialStorage      = await governanceFinancialInstance.storage();
            governanceProxyStorage          = await governanceProxyInstance.storage();
            emergencyGovernanceStorage      = await emergencyGovernanceInstance.storage();
            breakGlassStorage               = await breakGlassInstance.storage();
            vestingStorage                  = await vestingInstance.storage();
            treasuryStorage                 = await treasuryInstance.storage();
            farmFactoryStorage              = await farmFactoryInstance.storage();
            treasuryFactoryStorage          = await treasuryFactoryInstance.storage();
            farmStorage                     = await farmInstance.storage();
    
            // console.log('-- -- -- -- -- Governance Quorum Tests -- -- -- --')
            // console.log('Doorman Contract deployed at:', doormanInstance.address);
            // console.log('Delegation Contract deployed at:', delegationInstance.address);
            // console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
            // console.log('Council Contract deployed at:', councilInstance.address);
            // console.log('Governance Contract deployed at:', governanceInstance.address);
            // console.log('Emergency Governance Contract deployed at:', emergencyGovernanceInstance.address);
            // console.log('Break Glass Contract deployed at:', breakGlassInstance.address);
            // console.log('Vesting Contract deployed at:', vestingInstance.address);
            // console.log('Treasury Contract deployed at:', treasuryInstance.address);
            // console.log('Farm Factory Contract deployed at:', contractDeployments.farmFactory.address);
            // console.log('Treasury Factory Contract deployed at:', contractDeployments.treasuryFactory.address);
            // console.log('Farm Contract deployed at:', contractDeployments.farm.address);
            // console.log('Bob address: ' + bob.pkh);
            // console.log('Alice address: ' + alice.pkh);
            // console.log('Eve address: ' + eve.pkh);
            // console.log('Mallory address: ' + mallory.pkh);
            // console.log('Oscar address: ' + oscar.pkh);
            // console.log('-- -- -- -- -- -- -- -- --')
    
            // Check if cycle already started (for retest purposes)
            const cycleEnd  = governanceStorage.currentCycleInfo.cycleEndLevel;
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
                updateGovernanceConfig      = await governanceInstance.methods.updateConfig(1, "configMinQuorumPercentage").send();
                await updateGovernanceConfig.confirmation();
                updateGovernanceConfig      = await governanceInstance.methods.updateConfig(5100, "configMinYayVotePercentage").send();
                await updateGovernanceConfig.confirmation();

                // Update council admin for tests
                const setAdminOperation = await councilInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send()
                await setAdminOperation.confirmation()
    
                // Register satellites (BOB/ALICE)
                var updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
                {
                    add_operator: {
                        owner    : bob.pkh,
                        operator : contractDeployments.doorman.address,
                        token_id : 0,
                    },
                }])
                .send()
                await updateOperatorsOperation.confirmation();
                var stakeOperation = await doormanInstance.methods.stake(MVK(10000)).send();
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
    
                await helperFunctions.signerFactory(tezos, alice.sk)
                var updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
                {
                    add_operator: {
                        owner    : alice.pkh,
                        operator : contractDeployments.doorman.address,
                        token_id : 0,
                    },
                }])
                .send()
                await updateOperatorsOperation.confirmation();
                stakeOperation = await doormanInstance.methods.stake(MVK(20000)).send();
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

                // Register delegates (EVE/MALLORY)
                await helperFunctions.signerFactory(tezos, eve.sk)
                var updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
                {
                    add_operator: {
                        owner    : eve.pkh,
                        operator : contractDeployments.doorman.address,
                        token_id : 0,
                    },
                }])
                .send()
                await updateOperatorsOperation.confirmation();
                stakeOperation = await doormanInstance.methods.stake(MVK(1500)).send();
                await stakeOperation.confirmation();
                var delegateSatelliteOperation = await delegationInstance.methods.delegateToSatellite(eve.pkh, bob.pkh).send();
                await delegateSatelliteOperation.confirmation();

                await helperFunctions.signerFactory(tezos, mallory.sk)
                var updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
                {
                    add_operator: {
                        owner    : mallory.pkh,
                        operator : contractDeployments.doorman.address,
                        token_id : 0,
                    },
                }])
                .send()
                await updateOperatorsOperation.confirmation();
                stakeOperation = await doormanInstance.methods.stake(MVK(500)).send();
                await stakeOperation.confirmation();
                var delegateSatelliteOperation = await delegationInstance.methods.delegateToSatellite(mallory.pkh, alice.pkh).send();
                await delegateSatelliteOperation.confirmation();
            } else {
                // Start next round until new proposal round
                governanceStorage       = await governanceInstance.storage()
                var currentCycleInfoRound        = governanceStorage.currentCycleInfo.round
                var currentCycleInfoRoundString  = Object.keys(currentCycleInfoRound)[0]
    
                delegationStorage       = await delegationInstance.storage();
    
                while(currentCycleInfoRoundString!=="proposal"){
                    var restartRound                = await governanceInstance.methods.startNextRound(false).send();
                    await restartRound.confirmation()
                    governanceStorage               = await governanceInstance.storage()
                    currentCycleInfoRound                    = governanceStorage.currentCycleInfo.round
                    currentCycleInfoRoundString              = Object.keys(currentCycleInfoRound)[0]
                    console.log("Current round: ", currentCycleInfoRoundString)
                }
            }
        } catch(e){
            console.dir(e, {depth:5})
        }
    });

    describe("Proposal executed", async() => {
        beforeEach("Set signer to admin", async() => {
            await helperFunctions.signerFactory(tezos, bob.sk)
        })

        it("Scenario - Satellites vote only yay and exceed quorum", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                mvkTokenStorage             = await mvkTokenInstance.storage();
                const smvkTotalSupply       = (await mvkTokenStorage.ledger.get(contractDeployments.doorman.address)).toNumber()
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Quorum test";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";
                
                // Update general map compiled params
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
                            title: "ActionExpiryDays#1",
                            encodedCode: lambdaFunction,
                            codeDescription: ""
                        }
                    }
                ]

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();

                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await helperFunctions.signerFactory(tezos, alice.sk);

                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await helperFunctions.signerFactory(tezos, bob.sk);

                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await helperFunctions.signerFactory(tezos, alice.sk);

                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await helperFunctions.signerFactory(tezos, bob.sk);

                // mid values
                governanceStorage                   = await governanceInstance.storage();
                var currentCycle                    = governanceStorage.cycleId;
                const firstSatelliteSnapshot        = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
                const secondSatelliteSnapshot       = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});

                // Restart the cycle
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage                   = await governanceInstance.storage();
                const firstSatelliteVotingPower     = firstSatelliteSnapshot.totalVotingPower.toNumber();
                const secondSatelliteVotingPower    = secondSatelliteSnapshot.totalVotingPower.toNumber();
                const totalSatelliteVotingPower     = firstSatelliteVotingPower + secondSatelliteVotingPower;
                const proposal                      = await governanceStorage.proposalLedger.get(proposalId);
                const minYayVotePercentage          = proposal.minYayVotePercentage.toNumber();
                const minQuorumPercentage           = proposal.minQuorumPercentage.toNumber();
                const quorumStakedMvkTotal          = proposal.quorumStakedMvkTotal.toNumber();
                const minQuorumStakedMvkTotal       = proposal.minQuorumStakedMvkTotal.toNumber();
                const minYayVoteRequired            = quorumStakedMvkTotal * minYayVotePercentage / 10000;
                const calcMinQuorumStakedMvkTotal   = smvkTotalSupply * minQuorumPercentage / 10000;

                // Assertions
                // console.log("PROPOSAL: ", proposal);
                // console.log("FIRST SNAPSHOT: ", firstSatelliteSnapshot);
                // console.log("SECOND SNAPSHOT: ", secondSatelliteSnapshot);
                // console.log("SMVK: ", smvkTotalSupply);
                assert.equal(minYayVoteRequired < totalSatelliteVotingPower, true)
                assert.equal(totalSatelliteVotingPower, quorumStakedMvkTotal)
                assert.equal(calcMinQuorumStakedMvkTotal, minQuorumStakedMvkTotal)
                assert.equal(proposal.executed, true)
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })

        it("Scenario - Admin set yayVotePercentage to 20% and satellites vote yay and pass and exceed quorum", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                mvkTokenStorage             = await mvkTokenInstance.storage();
                const smvkTotalSupply       = (await mvkTokenStorage.ledger.get(contractDeployments.doorman.address)).toNumber()
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Quorum test";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";
                
                // Update general map compiled params
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
                            title: "ActionExpiryDays#1",
                            encodedCode: lambdaFunction,
                            codeDescription: ""
                        }
                    }
                ]

                // Update min quorum
                var updateConfigOperation   = await governanceInstance.methods.updateConfig(1, "configMinQuorumPercentage").send();
                await updateConfigOperation.confirmation(); 
                
                updateConfigOperation   = await governanceInstance.methods.updateConfig(2000, "configMinYayVotePercentage").send();
                await updateConfigOperation.confirmation();


                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();

                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await helperFunctions.signerFactory(tezos, alice.sk);

                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await helperFunctions.signerFactory(tezos, bob.sk);

                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await helperFunctions.signerFactory(tezos, alice.sk);

                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("pass").send();
                await votingRoundVoteOperation.confirmation();
                await helperFunctions.signerFactory(tezos, bob.sk);

                // mid values
                governanceStorage                   = await governanceInstance.storage();
                var currentCycle                    = governanceStorage.cycleId;
                const firstSatelliteSnapshot        = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
                const secondSatelliteSnapshot       = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});

                // Restart the cycle
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage                   = await governanceInstance.storage();
                const firstSatelliteVotingPower     = firstSatelliteSnapshot.totalVotingPower.toNumber();
                const secondSatelliteVotingPower    = secondSatelliteSnapshot.totalVotingPower.toNumber();
                const totalSatelliteVotingPower     = firstSatelliteVotingPower + secondSatelliteVotingPower;
                const proposal                      = await governanceStorage.proposalLedger.get(proposalId);
                const minYayVotePercentage          = proposal.minYayVotePercentage.toNumber();
                const minQuorumPercentage           = proposal.minQuorumPercentage.toNumber();
                const quorumStakedMvkTotal          = proposal.quorumStakedMvkTotal.toNumber();
                const minQuorumStakedMvkTotal       = proposal.minQuorumStakedMvkTotal.toNumber();
                const minYayVoteRequired            = quorumStakedMvkTotal * minYayVotePercentage / 10000;
                const calcMinQuorumStakedMvkTotal   = smvkTotalSupply * minQuorumPercentage / 10000;
                
                // Assertions
                assert.equal(minYayVoteRequired < totalSatelliteVotingPower, true)
                assert.equal(totalSatelliteVotingPower, quorumStakedMvkTotal)
                assert.equal(calcMinQuorumStakedMvkTotal, minQuorumStakedMvkTotal)
                assert.equal(proposal.executed, true)
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })

        it("Scenario - Admin set yayVotePercentage to 51% and satellites vote yay and nay and exceed quorum", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                mvkTokenStorage             = await mvkTokenInstance.storage();
                const smvkTotalSupply       = (await mvkTokenStorage.ledger.get(contractDeployments.doorman.address)).toNumber()
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Quorum test";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";
                
                // Update general map compiled params
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
                            title: "ActionExpiryDays#1",
                            encodedCode: lambdaFunction,
                            codeDescription: ""
                        }
                    }
                ]

                // Update min quorum
                var updateConfigOperation   = await governanceInstance.methods.updateConfig(1, "configMinQuorumPercentage").send();
                await updateConfigOperation.confirmation(); 
                
                updateConfigOperation   = await governanceInstance.methods.updateConfig(5100, "configMinYayVotePercentage").send();
                await updateConfigOperation.confirmation();


                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();

                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await helperFunctions.signerFactory(tezos, alice.sk);

                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await helperFunctions.signerFactory(tezos, bob.sk);

                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("nay").send();
                await votingRoundVoteOperation.confirmation();
                await helperFunctions.signerFactory(tezos, alice.sk);

                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await helperFunctions.signerFactory(tezos, bob.sk);

                // mid values
                governanceStorage                   = await governanceInstance.storage();
                var currentCycle                    = governanceStorage.cycleId;
                const firstSatelliteSnapshot        = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
                const secondSatelliteSnapshot       = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});

                // Restart the cycle
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage                   = await governanceInstance.storage();
                const firstSatelliteVotingPower     = firstSatelliteSnapshot.totalVotingPower.toNumber();
                const secondSatelliteVotingPower    = secondSatelliteSnapshot.totalVotingPower.toNumber();
                const totalSatelliteVotingPower     = firstSatelliteVotingPower + secondSatelliteVotingPower;
                const proposal                      = await governanceStorage.proposalLedger.get(proposalId);
                const minYayVotePercentage          = proposal.minYayVotePercentage.toNumber();
                const minQuorumPercentage           = proposal.minQuorumPercentage.toNumber();
                const quorumStakedMvkTotal          = proposal.quorumStakedMvkTotal.toNumber();
                const minQuorumStakedMvkTotal       = proposal.minQuorumStakedMvkTotal.toNumber();
                const minYayVoteRequired            = quorumStakedMvkTotal * minYayVotePercentage / 10000;
                const calcMinQuorumStakedMvkTotal   = smvkTotalSupply * minQuorumPercentage / 10000;
                
                // Assertions
                assert.equal(minYayVoteRequired < totalSatelliteVotingPower, true)
                assert.equal(totalSatelliteVotingPower, quorumStakedMvkTotal)
                assert.equal(calcMinQuorumStakedMvkTotal, minQuorumStakedMvkTotal)
                assert.equal(proposal.executed, true)
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("Proposal not executed", async() => {
        beforeEach("Set signer to admin", async() => {
            await helperFunctions.signerFactory(tezos, bob.sk)
        })

        it("Scenario - Satellites vote only yay but does not exceed quorum", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                mvkTokenStorage             = await mvkTokenInstance.storage();
                const smvkTotalSupply       = (await mvkTokenStorage.ledger.get(contractDeployments.doorman.address)).toNumber()
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Quorum test";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";
                
                // Update general map compiled params
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
                            title: "ActionExpiryDays#1",
                            encodedCode: lambdaFunction,
                            codeDescription: ""
                        }
                    }
                ]

                // Update min quorum
                const updateGovernanceConfig= await governanceInstance.methods.updateConfig(10000, "configMinQuorumPercentage").send();
                await updateGovernanceConfig.confirmation();

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();

                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await helperFunctions.signerFactory(tezos, alice.sk);

                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await helperFunctions.signerFactory(tezos, bob.sk);

                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await helperFunctions.signerFactory(tezos, alice.sk);

                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await helperFunctions.signerFactory(tezos, bob.sk);

                // mid values
                governanceStorage                   = await governanceInstance.storage();
                var currentCycle                    = governanceStorage.cycleId;
                const firstSatelliteSnapshot        = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
                const secondSatelliteSnapshot       = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});

                // Restart the cycle
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage                   = await governanceInstance.storage();
                const firstSatelliteVotingPower     = firstSatelliteSnapshot.totalVotingPower.toNumber();
                const secondSatelliteVotingPower    = secondSatelliteSnapshot.totalVotingPower.toNumber();
                const totalSatelliteVotingPower     = firstSatelliteVotingPower + secondSatelliteVotingPower;
                const proposal                      = await governanceStorage.proposalLedger.get(proposalId);
                const minYayVotePercentage          = proposal.minYayVotePercentage.toNumber();
                const minQuorumPercentage           = proposal.minQuorumPercentage.toNumber();
                const quorumStakedMvkTotal          = proposal.quorumStakedMvkTotal.toNumber();
                const minQuorumStakedMvkTotal       = proposal.minQuorumStakedMvkTotal.toNumber();
                const minYayVoteRequired            = quorumStakedMvkTotal * minYayVotePercentage / 10000;
                const calcMinQuorumStakedMvkTotal   = smvkTotalSupply * minQuorumPercentage / 10000;
                
                // Assertions
                // console.log("PROPOSAL: ", proposal);
                // console.log("FIRST SNAPSHOT: ", firstSatelliteSnapshot);
                // console.log("SECOND SNAPSHOT: ", secondSatelliteSnapshot);
                // console.log("SMVK: ", smvkTotalSupply);
                assert.equal(minYayVoteRequired < totalSatelliteVotingPower, true)
                assert.equal(totalSatelliteVotingPower, quorumStakedMvkTotal)
                assert.equal(calcMinQuorumStakedMvkTotal, minQuorumStakedMvkTotal)
                assert.equal(proposal.executed, false)
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })

        it("Scenario - Admin set yayVotePercentage to 51% and satellites vote yay and nay and exceed quorum", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                mvkTokenStorage             = await mvkTokenInstance.storage();
                const smvkTotalSupply       = (await mvkTokenStorage.ledger.get(contractDeployments.doorman.address)).toNumber()
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Quorum test";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";
                
                // Update general map compiled params
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
                            title: "ActionExpiryDays#1",
                            encodedCode: lambdaFunction,
                            codeDescription: ""
                        }
                    }
                ]

                // Update min quorum
                var updateConfigOperation   = await governanceInstance.methods.updateConfig(1, "configMinQuorumPercentage").send();
                await updateConfigOperation.confirmation(); 
                
                updateConfigOperation   = await governanceInstance.methods.updateConfig(2000, "configMinYayVotePercentage").send();
                await updateConfigOperation.confirmation();


                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();

                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await helperFunctions.signerFactory(tezos, alice.sk);

                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await helperFunctions.signerFactory(tezos, bob.sk);

                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await helperFunctions.signerFactory(tezos, alice.sk);

                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("nay").send();
                await votingRoundVoteOperation.confirmation();
                await helperFunctions.signerFactory(tezos, bob.sk);

                // mid values
                governanceStorage                   = await governanceInstance.storage();
                var currentCycle                    = governanceStorage.cycleId;
                const firstSatelliteSnapshot        = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
                const secondSatelliteSnapshot       = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});

                // Restart the cycle
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage                   = await governanceInstance.storage();
                const firstSatelliteVotingPower     = firstSatelliteSnapshot.totalVotingPower.toNumber();
                const secondSatelliteVotingPower    = secondSatelliteSnapshot.totalVotingPower.toNumber();
                const totalSatelliteVotingPower     = firstSatelliteVotingPower + secondSatelliteVotingPower;
                const proposal                      = await governanceStorage.proposalLedger.get(proposalId);
                const minYayVotePercentage          = proposal.minYayVotePercentage.toNumber();
                const minQuorumPercentage           = proposal.minQuorumPercentage.toNumber();
                const quorumStakedMvkTotal          = proposal.quorumStakedMvkTotal.toNumber();
                const minQuorumStakedMvkTotal       = proposal.minQuorumStakedMvkTotal.toNumber();
                const minYayVoteRequired            = quorumStakedMvkTotal * minYayVotePercentage / 10000;
                const calcMinQuorumStakedMvkTotal   = smvkTotalSupply * minQuorumPercentage / 10000;
                
                // Assertions
                // console.log("PROPOSAL: ", proposal);
                // console.log("FIRST SNAPSHOT: ", firstSatelliteSnapshot);
                // console.log("SECOND SNAPSHOT: ", secondSatelliteSnapshot);
                // console.log("SMVK: ", smvkTotalSupply);
                assert.equal(minYayVoteRequired < totalSatelliteVotingPower, true)
                assert.equal(totalSatelliteVotingPower, quorumStakedMvkTotal)
                assert.equal(calcMinQuorumStakedMvkTotal, minQuorumStakedMvkTotal)
                assert.equal(proposal.executed, false)
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })

        it("Scenario - Admin set yayVotePercentage to 80% and satellites vote yay and pass and exceed quorum", async() => {
            try{
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                mvkTokenStorage             = await mvkTokenInstance.storage();
                const smvkTotalSupply       = (await mvkTokenStorage.ledger.get(contractDeployments.doorman.address)).toNumber()
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Quorum test";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";
                
                // Update general map compiled params
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
                            title: "ActionExpiryDays#1",
                            encodedCode: lambdaFunction,
                            codeDescription: ""
                        }
                    }
                ]

                // Update min quorum
                var updateConfigOperation   = await governanceInstance.methods.updateConfig(1, "configMinQuorumPercentage").send();
                await updateConfigOperation.confirmation(); 
                
                updateConfigOperation   = await governanceInstance.methods.updateConfig(8000, "configMinYayVotePercentage").send();
                await updateConfigOperation.confirmation();


                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();

                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await helperFunctions.signerFactory(tezos, alice.sk);

                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                await helperFunctions.signerFactory(tezos, bob.sk);

                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("pass").send();
                await votingRoundVoteOperation.confirmation();
                await helperFunctions.signerFactory(tezos, alice.sk);

                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                await helperFunctions.signerFactory(tezos, bob.sk);

                // mid values
                governanceStorage                   = await governanceInstance.storage();
                var currentCycle                    = governanceStorage.cycleId;
                const firstSatelliteSnapshot        = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
                const secondSatelliteSnapshot       = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});

                // Restart the cycle
                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage                   = await governanceInstance.storage();
                const firstSatelliteVotingPower     = firstSatelliteSnapshot.totalVotingPower.toNumber();
                const secondSatelliteVotingPower    = secondSatelliteSnapshot.totalVotingPower.toNumber();
                const totalSatelliteVotingPower     = firstSatelliteVotingPower + secondSatelliteVotingPower;
                const proposal                      = await governanceStorage.proposalLedger.get(proposalId);
                const minYayVotePercentage          = proposal.minYayVotePercentage.toNumber();
                const minQuorumPercentage           = proposal.minQuorumPercentage.toNumber();
                const quorumStakedMvkTotal          = proposal.quorumStakedMvkTotal.toNumber();
                const minQuorumStakedMvkTotal       = proposal.minQuorumStakedMvkTotal.toNumber();
                const minYayVoteRequired            = quorumStakedMvkTotal * minYayVotePercentage / 10000;
                const calcMinQuorumStakedMvkTotal   = smvkTotalSupply * minQuorumPercentage / 10000;
                
                // Assertions
                // console.log("PROPOSAL: ", proposal);
                // console.log("FIRST SNAPSHOT: ", firstSatelliteSnapshot);
                // console.log("SECOND SNAPSHOT: ", secondSatelliteSnapshot);
                // console.log("SMVK: ", smvkTotalSupply);
                assert.equal(minYayVoteRequired < totalSatelliteVotingPower, true)
                assert.equal(totalSatelliteVotingPower, quorumStakedMvkTotal)
                assert.equal(calcMinQuorumStakedMvkTotal, minQuorumStakedMvkTotal)
                assert.equal(proposal.executed, false)
            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })
});