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
import { 
    signerFactory, 
    updateOperators
} from './helpers/helperFunctions'
import { createLambdaBytes } from "@mavrykdynamics/create-lambda-bytes"
import { mockSatelliteData } from "./helpers/mockSampleData";

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("Governance - Voting Power Ratio - tests", async () => {
    
    var utils: Utils;
    let tezos 

    let doormanAddress 
    let tokenId = 0

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

    let updateOperatorsOperation

    before("setup", async () => {

        utils = new Utils();
        await utils.init(bob.sk);
        tezos = utils.tezos 

        doormanAddress                  = contractDeployments.doorman.address;
        
        doormanInstance                 = await utils.tezos.contract.at(doormanAddress);
        delegationInstance              = await utils.tezos.contract.at(contractDeployments.delegation.address);
        mvkTokenInstance                = await utils.tezos.contract.at(contractDeployments.mvkToken.address);
        governanceInstance              = await utils.tezos.contract.at(contractDeployments.governance.address);
        governanceProxyInstance         = await utils.tezos.contract.at(contractDeployments.governanceProxy.address);
        emergencyGovernanceInstance     = await utils.tezos.contract.at(contractDeployments.emergencyGovernance.address);
        breakGlassInstance              = await utils.tezos.contract.at(contractDeployments.breakGlass.address);
        councilInstance                 = await utils.tezos.contract.at(contractDeployments.council.address);
            
        doormanStorage                  = await doormanInstance.storage();
        delegationStorage               = await delegationInstance.storage();
        mvkTokenStorage                 = await mvkTokenInstance.storage();
        governanceStorage               = await governanceInstance.storage();
        governanceProxyStorage          = await governanceProxyInstance.storage();
        emergencyGovernanceStorage      = await emergencyGovernanceInstance.storage();
        breakGlassStorage               = await breakGlassInstance.storage();
        councilStorage                  = await councilInstance.storage();

        // Init multiple satellites with multiple delegates
        delegationStorage       = await delegationInstance.storage();
        const eveSatellite      = await delegationStorage.satelliteLedger.get(eve.pkh);

        if(eveSatellite === undefined){

            /**
             * Init First Satellite:
             * Alice
             * 
             * Delegates:
             * Bob and Trudy
             */
            await signerFactory(tezos, alice.sk)
            updateOperatorsOperation = await updateOperators(mvkTokenInstance, alice.pkh, doormanAddress, tokenId);
            await updateOperatorsOperation.confirmation();

            var stakeOperation = await doormanInstance.methods.stake(MVK(100)).send();
            await stakeOperation.confirmation();
            var registerAsSatellite = await delegationInstance.methods
            .registerAsSatellite(
                mockSatelliteData.alice.name, 
                mockSatelliteData.alice.desc, 
                mockSatelliteData.alice.image,
                mockSatelliteData.alice.website, 
                mockSatelliteData.alice.satelliteFee,
                mockSatelliteData.alice.oraclePublicKey, 
                mockSatelliteData.alice.oraclePeerId
            ).send();
            await registerAsSatellite.confirmation();

            await signerFactory(tezos, bob.sk)
            updateOperatorsOperation = await updateOperators(mvkTokenInstance, bob.pkh, doormanAddress, tokenId);
            await updateOperatorsOperation.confirmation();

            stakeOperation = await doormanInstance.methods.stake(MVK(10000)).send();
            await stakeOperation.confirmation();

            var delegateOperation   = await delegationInstance.methods.delegateToSatellite(bob.pkh, alice.pkh).send()
            await delegateOperation.confirmation()

            await signerFactory(tezos, trudy.sk)
            updateOperatorsOperation = await updateOperators(mvkTokenInstance, trudy.pkh, doormanAddress, tokenId);
            await updateOperatorsOperation.confirmation();

            stakeOperation = await doormanInstance.methods.stake(MVK(1234)).send();
            await stakeOperation.confirmation();
            var delegateOperation   = await delegationInstance.methods.delegateToSatellite(trudy.pkh, alice.pkh).send()
            await delegateOperation.confirmation()

            /**
             * Init Second Satellite:
             * Eve
             * 
             * Delegates:
             * Mallory and Oscar
             */
            await signerFactory(tezos, eve.sk)
            updateOperatorsOperation = await updateOperators(mvkTokenInstance, eve.pkh, doormanAddress, tokenId);
            await updateOperatorsOperation.confirmation();

            stakeOperation = await doormanInstance.methods.stake(MVK(20000)).send();
            await stakeOperation.confirmation();
            registerAsSatellite = await delegationInstance.methods
            .registerAsSatellite(
                mockSatelliteData.eve.name, 
                mockSatelliteData.eve.desc, 
                mockSatelliteData.eve.image,
                mockSatelliteData.eve.website, 
                mockSatelliteData.eve.satelliteFee,
                mockSatelliteData.eve.oraclePublicKey, 
                mockSatelliteData.eve.oraclePeerId
            ).send();
            await registerAsSatellite.confirmation();

            await signerFactory(tezos, mallory.sk)
            updateOperatorsOperation = await updateOperators(mvkTokenInstance, mallory.pkh, doormanAddress, tokenId);
            await updateOperatorsOperation.confirmation();

            stakeOperation = await doormanInstance.methods.stake(MVK(200)).send();
            await stakeOperation.confirmation();
            var delegateOperation   = await delegationInstance.methods.delegateToSatellite(mallory.pkh, eve.pkh).send()
            await delegateOperation.confirmation()

            await signerFactory(tezos, oscar.sk)
            updateOperatorsOperation = await updateOperators(mvkTokenInstance, oscar.pkh, doormanAddress, tokenId);
            await updateOperatorsOperation.confirmation();

            stakeOperation = await doormanInstance.methods.stake(MVK(800)).send();
            await stakeOperation.confirmation();
            var delegateOperation   = await delegationInstance.methods.delegateToSatellite(oscar.pkh, alice.pkh).send()
            await delegateOperation.confirmation()
        }

        // Reset signer
        await signerFactory(tezos, bob.sk)

        // Set council contract admin to governance proxy for later tests
        const setAdminOperation = await councilInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
        await setAdminOperation.confirmation()
    });

    describe("%updateConfig", async () => {

        before("Configure delegation ratio on delegation contract", async () => {
            try{
                // Initial Values
                await signerFactory(tezos, bob.sk)
                delegationStorage   = await delegationInstance.storage();
                const newConfigValue = 5000;

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
            await signerFactory(tezos, bob.sk)
        });

        it('Admin should be able to call the entrypoint and configure the min proposal round vote percentage required', async () => {
            try{
                // Initial Values
                governanceStorage = await governanceInstance.storage();
                const newConfigValue = 1;

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

        it('Admin should be able to call the entrypoint and configure the min proposal round vote percentage required', async () => {
            try{
                // Initial Values
                governanceStorage = await governanceInstance.storage();
                const newConfigValue = 10;

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

        it('Admin should be able to call the entrypoint and configure the min quorum mvk total required', async () => {
            try{
                // Initial Values
                governanceStorage = await governanceInstance.storage();
                const newConfigValue = 2;

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
    });

    describe("Init cycle with Proposal Round", async () => {
        beforeEach("Set signer to standard user", async () => {
            await signerFactory(tezos, eve.sk)
        });

        it('User starts a proposal round (check that the snapshot is correct)', async () => {
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

                // Check storage
                delegationStorage       = await delegationInstance.storage()
                governanceStorage       = await governanceInstance.storage()

                const firstSatellite    = await delegationStorage.satelliteLedger.get(alice.pkh);
                // console.log("FIRST SATELLITE (ALICE)")
                // console.dir(firstSatellite, {depth: 5})

                const secondSatellite   = await delegationStorage.satelliteLedger.get(eve.pkh);
                // console.log("SECOND SATELLITE (EVE)")
                // console.dir(secondSatellite, {depth: 5})

            } catch(e){
                console.dir(e, {depth: 5})
            }
        })
    })

    describe("Propose & Vote", async () => {
        beforeEach("Set signer to satellite", async () => {
            await signerFactory(tezos, alice.sk)
        });

        it('Alice (satellite) proposes a proposal and locks it. Alice and Eve vote for it', async () => {
            try{
                // Initial Values
                governanceStorage           = await governanceInstance.storage();
                delegationStorage           = await delegationInstance.storage();
                const nextProposalId        = governanceStorage.nextProposalId;
                const proposalName          = "New Proposal";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                const lambdaFunction        = await createLambdaBytes(
                    tezos.rpc.url,
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
                            title: "Metadata#1",
                            encodedCode: lambdaFunction,
                            codeDescription: ""
                        }
                    }
                ]

                // Operation
                const proposeOperation  = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();

                const lockOperation     = await governanceInstance.methods.lockProposal(nextProposalId).send()
                await lockOperation.confirmation();

                // Final values
                governanceStorage = await governanceInstance.storage();
                const successReward = governanceStorage.config.successReward
                const currentCycleInfoCycleEndLevel = governanceStorage.currentCycleInfo.cycleEndLevel
                const minQuorumPercentage = governanceStorage.config.minQuorumPercentage
                const minYayVotePercentage = governanceStorage.config.minYayVotePercentage
                const minProposalRoundVotePercentage = governanceStorage.config.minProposalRoundVotePercentage
                const cycleId = governanceStorage.cycleId
                const finalNextProposalId = governanceStorage.nextProposalId;
                const newProposal = await governanceStorage.proposalLedger.get(nextProposalId.toNumber());
                const proposalDataStorage = await newProposal.proposalData.get("0");
                const newCurrentRoundProposal = governanceStorage.cycleProposals.get(nextProposalId);

                // console.log("PROPOSAL: ", newProposal)

                // Assertions
                assert.notStrictEqual(proposalDataStorage, undefined);
                assert.strictEqual(proposalDataStorage.encodedCode, lambdaFunction);
                assert.equal(nextProposalId.toNumber() + 1, finalNextProposalId.toNumber());
                assert.notStrictEqual(newCurrentRoundProposal, undefined);
                assert.notStrictEqual(newProposal, undefined);
                assert.strictEqual(newProposal.proposerAddress, alice.pkh);
                assert.strictEqual(newProposal.status, "ACTIVE");
                assert.strictEqual(newProposal.title, proposalName);
                assert.strictEqual(newProposal.description, proposalDesc);
                assert.strictEqual(newProposal.invoice, proposalIpfs);
                assert.strictEqual(newProposal.sourceCode, proposalSourceCode);
                assert.equal(newProposal.successReward.toNumber(), successReward.toNumber());
                assert.equal(newProposal.executed, false);
                assert.equal(newProposal.locked, true);
                assert.equal(newProposal.proposalVoteCount.toNumber(), 0);
                assert.equal(newProposal.proposalVoteStakedMvkTotal.toNumber(), 0);
                assert.equal(newProposal.minProposalRoundVotePercentage.toNumber(), minProposalRoundVotePercentage.toNumber());
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

        it('Alice and Eve vote for the previous proposal', async () => {
            try{
                // Initial Values
                governanceStorage           = await governanceInstance.storage();
                const nextProposalId        = governanceStorage.nextProposalId.toNumber() - 1;

                var voteForProposalOperation = await governanceInstance.methods.proposalRoundVote(nextProposalId).send();
                await voteForProposalOperation.confirmation()

                await signerFactory(tezos, eve.sk)
                voteForProposalOperation = await governanceInstance.methods.proposalRoundVote(nextProposalId).send();
                await voteForProposalOperation.confirmation()
            } catch(e){
                console.dir(e, {depth: 5})
            }
        })

        it('User switches to voting round', async () => {
            try{
                // Initial Values
                governanceStorage           = await governanceInstance.storage();
                const previousProposalId    = governanceStorage.nextProposalId.toNumber() - 1;

                // Operation
                const startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                await startNextRoundOperation.confirmation();
                
                // Final values
                governanceStorage                   = await governanceInstance.storage();                
                const currentCycleInfoRound         = governanceStorage.currentCycleInfo.round
                const currentCycleInfoRoundString   = Object.keys(currentCycleInfoRound)[0]
                const cycleHighestVotedProposalId   = governanceStorage.cycleHighestVotedProposalId

                // Assertions
                assert.equal(cycleHighestVotedProposalId.toNumber(), previousProposalId);
                assert.strictEqual(currentCycleInfoRoundString, "voting");
            } catch(e){
                console.dir(e, {depth: 5})
            }
        })

        it('Satellites vote for proposal', async () => {
            try{
                // Initial Values
                governanceStorage           = await governanceInstance.storage();
                var currentCycle            = governanceStorage.cycleId;
                const previousProposalId    = governanceStorage.nextProposalId.toNumber() - 1;

                // Operation
                var votingRoundVoteOperation = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();

                await signerFactory(tezos, eve.sk);

                votingRoundVoteOperation = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                
                // Final values
                governanceStorage       = await governanceInstance.storage();
                const proposal          = await governanceStorage.proposalLedger.get(previousProposalId);
                const firstVotingPower  = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});
                const secondVotingPower = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: eve.pkh});
                const totalVotingPower  = firstVotingPower.totalVotingPower.toNumber() + secondVotingPower.totalVotingPower.toNumber()

                // console.log("PROPOSAL AFTER VOTES")
                // console.dir(proposal, {depth: 5});

                // Assertion
                assert.equal(totalVotingPower, proposal.quorumStakedMvkTotal.toNumber())
            } catch(e){
                console.dir(e, {depth: 5})
            }
        })
    })
});