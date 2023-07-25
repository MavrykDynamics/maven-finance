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

import { bob, alice, eve, mallory, trudy, oscar, susie, david, ivan, isaac, baker } from "../scripts/sandbox/accounts";
import { createLambdaBytes } from "@mavrykdynamics/create-lambda-bytes"
import { 
    signerFactory, 
    updateOperators
} from './helpers/helperFunctions'
import { mockSatelliteData, mockPackedLambdaData } from "./helpers/mockSampleData";


// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("Governance quorum tests", async () => {
    
    var utils: Utils;
    let tezos

    let doormanAddress 
    let tokenId = 0
    let currentCycle

    let user 
    let userSk 

    let admin 
    let adminSk 

    let satelliteOne 
    let satelliteOneSk 

    let satelliteTwo
    let satelliteTwoSk

    let satelliteThree
    let satelliteThreeSk

    let satelliteFour 
    let satelliteFive

    let delegateOne 
    let delegateOneSk

    let delegateTwo
    let delegateTwoSk

    let delegateThree
    let delegateThreeSk

    let delegateFour
    let delegateFourSk

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

    let updateOperatorsOperation

    // For testing purposes
    var aTrackedFarm;
    var aTrackedTreasury;

    before("setup", async () => {
        try {

            utils = new Utils();
            await utils.init(bob.sk);
            tezos = utils.tezos;

            admin   = bob.pkh;
            adminSk = bob.sk;

            doormanAddress                  = contractDeployments.doorman.address;
    
            doormanInstance                 = await utils.tezos.contract.at(doormanAddress);
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

            // -----------------------------------------------
            //
            // Setup corresponds to 06_setup_satellites:
            //
            //   - satellites: alice, eve, susie, oscar, trudy
            //   - delegates:
            //          eve satellite: david, ivan, isaac
            //          alice satellite: mallory
            //          susie satellite: none
            //          oscar satellite: none
            //          trudy satellite: none
            //    
            // -----------------------------------------------

            satelliteOne     = eve.pkh;
            satelliteOneSk   = eve.sk;

            satelliteTwo     = alice.pkh;
            satelliteTwoSk   = alice.sk;

            satelliteThree   = trudy.pkh;
            satelliteThreeSk = trudy.sk;

            satelliteFour    = oscar.pkh;
            satelliteFive    = susie.pkh;

            delegateOne     = david.pkh;
            delegateOneSk   = david.sk;

            delegateTwo     = ivan.pkh;
            delegateTwoSk   = ivan.sk;

            delegateThree   = isaac.pkh;
            delegateThreeSk = isaac.sk;

            delegateFour    = mallory.pkh;
            delegateFourSk  = mallory.sk;

            // -------------------
            // generate sample mock proposal data
            // -------------------

            // Update general map compiled params
            const councilConfigChange     = 1234;
            const councilLambdaFunction = await createLambdaBytes(
                tezos.rpc.url,
                contractDeployments.governanceProxy.address,
                
                'updateConfig',
                [
                    contractDeployments.council.address,
                    "council",
                    "ConfigActionExpiryDays",
                    councilConfigChange
                ]
            );

            mockPackedLambdaData.updateCouncilConfig    = councilLambdaFunction;

    
            // -------------------
            // check governance cycles
            // -------------------

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
                updateGovernanceConfig      = await governanceInstance.methods.updateConfig(1, "configMinQuorumPercentage").send();
                await updateGovernanceConfig.confirmation();
                updateGovernanceConfig      = await governanceInstance.methods.updateConfig(5100, "configMinYayVotePercentage").send();
                await updateGovernanceConfig.confirmation();

                // Update council admin for tests
                const setAdminOperation = await councilInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send()
                await setAdminOperation.confirmation()
                
            } else {
                // Start next round until new proposal round
                governanceStorage                = await governanceInstance.storage()
                var currentCycleInfoRound        = governanceStorage.currentCycleInfo.round
                var currentCycleInfoRoundString  = Object.keys(currentCycleInfoRound)[0]
    
                delegationStorage                = await delegationInstance.storage();
    
                while(currentCycleInfoRoundString!=="proposal"){
                    var restartRound                = await governanceInstance.methods.startNextRound(false).send();
                    await restartRound.confirmation()
                    governanceStorage               = await governanceInstance.storage()
                    currentCycleInfoRound           = governanceStorage.currentCycleInfo.round
                    currentCycleInfoRoundString     = Object.keys(currentCycleInfoRound)[0]
                    console.log("Current round: ", currentCycleInfoRoundString)
                }
            }
        } catch(e){
            console.dir(e, {depth:5})
        }
    });

    describe("Proposal executed", async() => {

        beforeEach("Set signer to satellite one", async() => {
            await signerFactory(tezos, satelliteOneSk)
        })

        it("Scenario - Satellites vote only yay and exceed quorum (1%)", async() => {
            try{

                // Initial values
                governanceStorage           = await governanceInstance.storage();
                mvkTokenStorage             = await mvkTokenInstance.storage();

                // get current cycle and relevant config variables
                currentCycle                = governanceStorage.cycleId;
                const minQuorumPercentage   = governanceStorage.config.minQuorumPercentage.toNumber();
                const minYayVotePercentage  = governanceStorage.config.minYayVotePercentage.toNumber();
                
                // get total staked mvk supply by calling get_balance view on MVK Token Contract with Doorman address
                const totalStakedMvkSupply  = await mvkTokenInstance.contractViews.get_balance({ "0": doormanAddress, "1": 0}).executeView({ viewCaller : admin});

                // calculation on required sMVK and yay votes
                const minQuorumStakedMvkTotal   = totalStakedMvkSupply * minQuorumPercentage / 10000;
                const minYayVoteRequired        = minQuorumStakedMvkTotal * minYayVotePercentage / 10000;

                // proposal details
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Quorum test";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";
                const proposalData          = [
                    {
                        addOrSetProposalData: {
                            title: "ActionExpiryDays#1",
                            encodedCode: mockPackedLambdaData.updateCouncilConfig,
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

                await signerFactory(tezos, satelliteTwoSk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();

                await signerFactory(tezos, satelliteOneSk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                
                await signerFactory(tezos, satelliteTwoSk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();

                // mid values
                governanceStorage                   = await governanceInstance.storage();
                
                const firstSatelliteSnapshot        = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteOne});
                const secondSatelliteSnapshot       = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteTwo});

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

                const proposal                          = await governanceStorage.proposalLedger.get(proposalId);
                const minYayVotePercentage              = proposal.minYayVotePercentage.toNumber();
                const minQuorumPercentage               = proposal.minQuorumPercentage.toNumber();
                const quorumStakedMvkTotal              = proposal.quorumStakedMvkTotal.toNumber();
                const proposalMinQuorumStakedMvkTotal   = proposal.minQuorumStakedMvkTotal.toNumber();
                
                // Assertions
                // console.log("PROPOSAL: ", proposal);
                // console.log("FIRST SNAPSHOT: ", firstSatelliteSnapshot);
                // console.log("SECOND SNAPSHOT: ", secondSatelliteSnapshot);
                // console.log("SMVK: ", totalStakedMvkSupply);
                
                assert.equal(minYayVoteRequired < totalSatelliteVotingPower, true)
                assert.equal(totalSatelliteVotingPower, quorumStakedMvkTotal)
                assert.equal(minQuorumStakedMvkTotal, proposalMinQuorumStakedMvkTotal)

                assert.equal(proposal.executed, true)

            } catch(e) {
                console.dir(e, {depth:5})
            }
        })

        it("Scenario - Admin set yayVotePercentage to 20% and satellites vote yay and pass and exceed quorum (1%)", async() => {
            try{
                
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                mvkTokenStorage             = await mvkTokenInstance.storage();
                
                // get current cycle and relevant config variables
                currentCycle                = governanceStorage.cycleId;
                const minQuorumPercentage   = governanceStorage.config.minQuorumPercentage.toNumber();
                const minYayVotePercentage  = governanceStorage.config.minYayVotePercentage.toNumber();
                
                // get total staked mvk supply by calling get_balance view on MVK Token Contract with Doorman address
                const totalStakedMvkSupply  = await mvkTokenInstance.contractViews.get_balance({ "0": doormanAddress, "1": 0}).executeView({ viewCaller : admin});

                // calculation on required sMVK and yay votes
                const minQuorumStakedMvkTotal   = totalStakedMvkSupply * minQuorumPercentage / 10000;
                const minYayVoteRequired        = minQuorumStakedMvkTotal * minYayVotePercentage / 10000;
                
                // proposal details
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Quorum test";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";
                const proposalData          = [
                    {
                        addOrSetProposalData: {
                            title: "ActionExpiryDays#1",
                            encodedCode: mockPackedLambdaData.updateCouncilConfig,
                            codeDescription: ""
                        }
                    }
                ]

                // Update min quorum
                await signerFactory(tezos, adminSk);
                var updateConfigOperation   = await governanceInstance.methods.updateConfig(1, "configMinQuorumPercentage").send();
                await updateConfigOperation.confirmation(); 
                
                updateConfigOperation   = await governanceInstance.methods.updateConfig(2000, "configMinYayVotePercentage").send();
                await updateConfigOperation.confirmation();


                // Start governance rounds
                await signerFactory(tezos, satelliteOneSk);
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();

                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                
                await signerFactory(tezos, satelliteTwoSk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();

                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                
                await signerFactory(tezos,satelliteTwoSk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("pass").send();
                await votingRoundVoteOperation.confirmation();

                // mid values
                governanceStorage                   = await governanceInstance.storage();
                var currentCycle                    = governanceStorage.cycleId;
                const firstSatelliteSnapshot        = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteOne});
                const secondSatelliteSnapshot       = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteTwo});

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
                
                const proposal                          = await governanceStorage.proposalLedger.get(proposalId);
                const minYayVotePercentage              = proposal.minYayVotePercentage.toNumber();
                const minQuorumPercentage               = proposal.minQuorumPercentage.toNumber();
                const quorumStakedMvkTotal              = proposal.quorumStakedMvkTotal.toNumber();
                const proposalMinQuorumStakedMvkTotal   = proposal.minQuorumStakedMvkTotal.toNumber();
                
                // Assertions
                assert.equal(minYayVoteRequired < totalSatelliteVotingPower, true)
                assert.equal(totalSatelliteVotingPower, quorumStakedMvkTotal)
                assert.equal(minQuorumStakedMvkTotal, proposalMinQuorumStakedMvkTotal)
                
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
                
                // get current cycle and relevant config variables
                currentCycle                = governanceStorage.cycleId;
                const minQuorumPercentage   = governanceStorage.config.minQuorumPercentage.toNumber();
                const minYayVotePercentage  = governanceStorage.config.minYayVotePercentage.toNumber();
                
                // get total staked mvk supply by calling get_balance view on MVK Token Contract with Doorman address
                const totalStakedMvkSupply      = await mvkTokenInstance.contractViews.get_balance({ "0": doormanAddress, "1": 0}).executeView({ viewCaller : admin});

                // calculation on required sMVK and yay votes
                const minQuorumStakedMvkTotal   = totalStakedMvkSupply * minQuorumPercentage / 10000;
                const minYayVoteRequired        = minQuorumStakedMvkTotal * minYayVotePercentage / 10000;
                
                // proposal details
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Quorum test";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";                
                const proposalData          = [
                    {
                        addOrSetProposalData: {
                            title: "ActionExpiryDays#1",
                            encodedCode: mockPackedLambdaData.updateCouncilConfig,
                            codeDescription: ""
                        }
                    }
                ]

                // Update min quorum
                await signerFactory(tezos, adminSk);
                var updateConfigOperation   = await governanceInstance.methods.updateConfig(1, "configMinQuorumPercentage").send();
                await updateConfigOperation.confirmation(); 
                
                updateConfigOperation   = await governanceInstance.methods.updateConfig(5100, "configMinYayVotePercentage").send();
                await updateConfigOperation.confirmation();


                // Start governance rounds
                await signerFactory(tezos, satelliteOneSk);
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();

                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                
                await signerFactory(tezos, satelliteTwoSk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();

                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("nay").send();
                await votingRoundVoteOperation.confirmation();
                
                await signerFactory(tezos, satelliteOneSk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();

                // mid values
                governanceStorage                   = await governanceInstance.storage();
                var currentCycle                    = governanceStorage.cycleId;
                const firstSatelliteSnapshot        = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteOne});
                const secondSatelliteSnapshot       = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteTwo});

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
                
                const proposal                          = await governanceStorage.proposalLedger.get(proposalId);
                const minYayVotePercentage              = proposal.minYayVotePercentage.toNumber();
                const minQuorumPercentage               = proposal.minQuorumPercentage.toNumber();
                const quorumStakedMvkTotal              = proposal.quorumStakedMvkTotal.toNumber();
                const proposalMinQuorumStakedMvkTotal   = proposal.minQuorumStakedMvkTotal.toNumber();

                // Assertions
                assert.equal(minYayVoteRequired < totalSatelliteVotingPower, true)
                assert.equal(totalSatelliteVotingPower, quorumStakedMvkTotal)
                assert.equal(minQuorumStakedMvkTotal, proposalMinQuorumStakedMvkTotal)
                
                assert.equal(proposal.executed, true)

            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })

    describe("Proposal not executed", async() => {

        beforeEach("Set signer to satellite one", async() => {
            await signerFactory(tezos, satelliteOneSk)
        })

        it("Scenario - Satellites vote only yay but does not exceed quorum (100%)", async() => {
            try{

                // Initial values
                governanceStorage           = await governanceInstance.storage();
                mvkTokenStorage             = await mvkTokenInstance.storage();
                
                // get current cycle and relevant config variables
                currentCycle                = governanceStorage.cycleId;
                const minQuorumPercentage   = governanceStorage.config.minQuorumPercentage.toNumber();
                const minYayVotePercentage  = governanceStorage.config.minYayVotePercentage.toNumber();

                // get total staked mvk supply by calling get_balance view on MVK Token Contract with Doorman address
                const totalStakedMvkSupply  = await mvkTokenInstance.contractViews.get_balance({ "0": doormanAddress, "1": 0}).executeView({ viewCaller : admin});

                // calculation on required sMVK and yay votes
                const minQuorumStakedMvkTotal   = totalStakedMvkSupply * minQuorumPercentage / 10000;
                const minYayVoteRequired        = minQuorumStakedMvkTotal * minYayVotePercentage / 10000;

                // proposal details
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Quorum test";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";
                const proposalData          = [
                    {
                        addOrSetProposalData: {
                            title: "ActionExpiryDays#1",
                            encodedCode: mockPackedLambdaData.updateCouncilConfig,
                            codeDescription: ""
                        }
                    }
                ]

                // Update min quorum
                await signerFactory(tezos, adminSk);
                const updateGovernanceConfig= await governanceInstance.methods.updateConfig(10000, "configMinQuorumPercentage").send();
                await updateGovernanceConfig.confirmation();

                // Start governance rounds
                await signerFactory(tezos, satelliteOneSk);
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();

                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                
                await signerFactory(tezos, satelliteTwoSk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();

                await signerFactory(tezos, satelliteOneSk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();
                
                await signerFactory(tezos, satelliteTwoSk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();

                // mid values
                governanceStorage                   = await governanceInstance.storage();
                var currentCycle                    = governanceStorage.cycleId;
                const firstSatelliteSnapshot        = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteOne});
                const secondSatelliteSnapshot       = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteTwo});

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
                
                const proposal                          = await governanceStorage.proposalLedger.get(proposalId);
                const minYayVotePercentage              = proposal.minYayVotePercentage.toNumber();
                const minQuorumPercentage               = proposal.minQuorumPercentage.toNumber();
                const quorumStakedMvkTotal              = proposal.quorumStakedMvkTotal.toNumber();
                const proposalMinQuorumStakedMvkTotal   = proposal.minQuorumStakedMvkTotal.toNumber();
                
                // Assertions
                // console.log("PROPOSAL: ", proposal);
                // console.log("FIRST SNAPSHOT: ", firstSatelliteSnapshot);
                // console.log("SECOND SNAPSHOT: ", secondSatelliteSnapshot);
                // console.log("SMVK: ", smvkTotalSupply);
                assert.equal(minYayVoteRequired < totalSatelliteVotingPower, true)
                assert.equal(totalSatelliteVotingPower, quorumStakedMvkTotal)
                assert.equal(minQuorumStakedMvkTotal, proposalMinQuorumStakedMvkTotal)
                
                assert.equal(proposal.executed, false)

            } catch(e) {
                console.dir(e, {depth:5})
            }
        })

        it("Scenario - Admin set yayVotePercentage to 51% and satellites vote yay and nay and exceed quorum (1%)", async() => {
            try{

                // Initial values
                governanceStorage           = await governanceInstance.storage();
                mvkTokenStorage             = await mvkTokenInstance.storage();
                
                // get current cycle and relevant config variables
                currentCycle                = governanceStorage.cycleId;
                const minQuorumPercentage   = governanceStorage.config.minQuorumPercentage.toNumber();
                const minYayVotePercentage  = governanceStorage.config.minYayVotePercentage.toNumber();
                
                // get total staked mvk supply by calling get_balance view on MVK Token Contract with Doorman address
                const totalStakedMvkSupply  = await mvkTokenInstance.contractViews.get_balance({ "0": doormanAddress, "1": 0}).executeView({ viewCaller : admin});

                // calculation on required sMVK and yay votes
                const minQuorumStakedMvkTotal   = totalStakedMvkSupply * minQuorumPercentage / 10000;
                const minYayVoteRequired        = minQuorumStakedMvkTotal * minYayVotePercentage / 10000;

                // proposal details
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Quorum test";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";
                const proposalData          = [
                    {
                        addOrSetProposalData: {
                            title: "ActionExpiryDays#1",
                            encodedCode: mockPackedLambdaData.updateCouncilConfig,
                            codeDescription: ""
                        }
                    }
                ]

                // Update min quorum
                await signerFactory(tezos, adminSk);
                var updateConfigOperation   = await governanceInstance.methods.updateConfig(1, "configMinQuorumPercentage").send();
                await updateConfigOperation.confirmation(); 
                
                updateConfigOperation   = await governanceInstance.methods.updateConfig(5100, "configMinYayVotePercentage").send();
                await updateConfigOperation.confirmation();


                // Start governance rounds
                await signerFactory(tezos, satelliteOneSk);
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();

                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                
                await signerFactory(tezos, satelliteTwoSk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();

                await signerFactory(tezos, satelliteOneSk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();

                await signerFactory(tezos, satelliteTwoSk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("nay").send();
                await votingRoundVoteOperation.confirmation();

                // mid values
                governanceStorage                   = await governanceInstance.storage();
                var currentCycle                    = governanceStorage.cycleId;
                const firstSatelliteSnapshot        = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteOne});
                const secondSatelliteSnapshot       = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteTwo});

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
                
                const proposal                          = await governanceStorage.proposalLedger.get(proposalId);
                const minYayVotePercentage              = proposal.minYayVotePercentage.toNumber();
                const minQuorumPercentage               = proposal.minQuorumPercentage.toNumber();
                const quorumStakedMvkTotal              = proposal.quorumStakedMvkTotal.toNumber();
                const proposalMinQuorumStakedMvkTotal   = proposal.minQuorumStakedMvkTotal.toNumber();
                
                // Assertions
                // console.log("PROPOSAL: ", proposal);
                // console.log("FIRST SNAPSHOT: ", firstSatelliteSnapshot);
                // console.log("SECOND SNAPSHOT: ", secondSatelliteSnapshot);
                // console.log("SMVK: ", smvkTotalSupply);
                assert.equal(minYayVoteRequired < totalSatelliteVotingPower, true)
                assert.equal(totalSatelliteVotingPower, quorumStakedMvkTotal)
                assert.equal(minQuorumStakedMvkTotal, proposalMinQuorumStakedMvkTotal)
                
                assert.equal(proposal.executed, false)

            } catch(e) {
                console.dir(e, {depth:5})
            }
        })

        it("Scenario - Admin set yayVotePercentage to 80% and satellites vote yay and pass and exceed quorum (1%)", async() => {
            try{
                
                // Initial values
                governanceStorage           = await governanceInstance.storage();
                mvkTokenStorage             = await mvkTokenInstance.storage();
                
                // get current cycle and relevant config variables
                currentCycle                = governanceStorage.cycleId;
                const minQuorumPercentage   = governanceStorage.config.minQuorumPercentage.toNumber();
                const minYayVotePercentage  = governanceStorage.config.minYayVotePercentage.toNumber();
                
                // get total staked mvk supply by calling get_balance view on MVK Token Contract with Doorman address
                const totalStakedMvkSupply  = await mvkTokenInstance.contractViews.get_balance({ "0": doormanAddress, "1": 0}).executeView({ viewCaller : admin});

                // calculation on required sMVK and yay votes
                const minQuorumStakedMvkTotal   = totalStakedMvkSupply * minQuorumPercentage / 10000;
                const minYayVoteRequired        = minQuorumStakedMvkTotal * minYayVotePercentage / 10000;
                
                // proposal details
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Quorum test";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";
                const proposalData          = [
                    {
                        addOrSetProposalData: {
                            title: "ActionExpiryDays#1",
                            encodedCode: mockPackedLambdaData.updateCouncilConfig,
                            codeDescription: ""
                        }
                    }
                ]

                // Update min quorum
                await signerFactory(tezos, adminSk);
                var updateConfigOperation   = await governanceInstance.methods.updateConfig(1, "configMinQuorumPercentage").send();
                await updateConfigOperation.confirmation(); 
                
                updateConfigOperation   = await governanceInstance.methods.updateConfig(8000, "configMinYayVotePercentage").send();
                await updateConfigOperation.confirmation();


                // Start governance rounds
                await signerFactory(tezos, satelliteOneSk);
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();

                var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();
                
                await signerFactory(tezos, satelliteTwoSk);
                voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                await voteOperation.confirmation();

                await signerFactory(tezos, satelliteOneSk);
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();

                // Votes operation -> both satellites vote
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("pass").send();
                await votingRoundVoteOperation.confirmation();
                
                await signerFactory(tezos, satelliteTwoSk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();

                // mid values
                governanceStorage                   = await governanceInstance.storage();
                var currentCycle                    = governanceStorage.cycleId;
                const firstSatelliteSnapshot        = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteOne});
                const secondSatelliteSnapshot       = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteTwo});

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
                
                const proposal                          = await governanceStorage.proposalLedger.get(proposalId);
                const minYayVotePercentage              = proposal.minYayVotePercentage.toNumber();
                const minQuorumPercentage               = proposal.minQuorumPercentage.toNumber();
                const quorumStakedMvkTotal              = proposal.quorumStakedMvkTotal.toNumber();
                const proposalMinQuorumStakedMvkTotal   = proposal.minQuorumStakedMvkTotal.toNumber();
                
                // Assertions
                // console.log("PROPOSAL: ", proposal);
                // console.log("FIRST SNAPSHOT: ", firstSatelliteSnapshot);
                // console.log("SECOND SNAPSHOT: ", secondSatelliteSnapshot);
                // console.log("SMVK: ", smvkTotalSupply);
                assert.equal(minYayVoteRequired < totalSatelliteVotingPower, true)
                assert.equal(totalSatelliteVotingPower, quorumStakedMvkTotal)
                assert.equal(minQuorumStakedMvkTotal, proposalMinQuorumStakedMvkTotal)
                
                assert.equal(proposal.executed, false)

            } catch(e) {
                console.dir(e, {depth:5})
            }
        })
    })
});