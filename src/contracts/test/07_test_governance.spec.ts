import assert from "assert";

import { MVN, Utils } from "./helpers/Utils";

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
import { mockSatelliteData, mockPackedLambdaData } from "./helpers/mockSampleData"
import { 
    signerFactory, 
    getStorageMapValue,
    fa12Transfer,
    fa2Transfer,
    updateOperators,
    mistakenTransferFa2Token,
    updateWhitelistContracts,
    updateGeneralContracts,
    calcStakedMvnRequiredForActionApproval, 
    calcTotalVotingPower 
} from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("Governance tests", async () => {
    
    var utils: Utils;
    let tezos

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
    let satelliteFourSk 

    let satelliteFive

    let delegateOne 
    let delegateOneSk

    let delegateTwo
    let delegateTwoSk

    let delegateThree
    let delegateThreeSk

    let delegateFour
    let delegateFourSk

    let firstReferenceProposalId
    let secondReferenceProposalId
    let thirdReferenceProposalId
    let fourthReferenceProposalId

    let doormanAddress
    let governanceAddress
    let governanceProxyAddress
    let tokenId = 0
    let zeroBlocksPerRound
    let proposalSubmissionFeeMumav
    let delegationRatio
    let currentCycle

    let currentRound
    let currentRoundString
    let finalRound 
    let finalRoundString

    let proposalRecord
    let updatedProposalRecord

    let delegationConfigChange
    let doormanConfigChange
    let councilConfigChange

    let doormanInstance
    let delegationInstance
    let mvnTokenInstance
    let governanceInstance
    let governanceProxyInstance
    let emergencyGovernanceInstance
    let breakGlassInstance
    let councilInstance
    let mavenFa2TokenInstance

    let doormanStorage
    let delegationStorage
    let mvnTokenStorage
    let governanceStorage
    let governanceProxyStorage
    let emergencyGovernanceStorage
    let breakGlassStorage
    let councilStorage
    let mavenFa2TokenStorage

    let initialUserStakedRecord
    let initialUserStakedBalance

    let updatedUserStakedRecord
    let updatedUserStakedBalance

    let initialSatelliteRecord
    let updatedSatelliteRecord 
    
    let stakeAmount
    let initialMinimumStakedMvnRequirement

    // operations
    let updateOperatorsOperation
    let transferOperation
    let stakeOperation 
    let registerAsSatelliteOperation

    // housekeeping operations
    let setAdminOperation
    let setGovernanceOperation
    let resetAdminOperation
    let updateConfigOperation
    let updateWhitelistContractsOperation
    let updateGeneralContractsOperation
    let mistakenTransferOperation

    // contract map value
    let storageMap
    let contractMapKey
    let initialContractMapValue
    let updatedContractMapValue

    before("setup", async () => {
        try {
            
            utils = new Utils();
            await utils.init(bob.sk);
            tezos = utils.tezos

            admin                       = bob.pkh;
            adminSk                     = bob.sk;

            user                        = mallory.pkh;
            userSk                      = mallory.sk;

            doormanAddress              = contractDeployments.doorman.address;
            governanceAddress           = contractDeployments.governance.address;
            governanceProxyAddress      = contractDeployments.governanceProxy.address;
            
            doormanInstance             = await utils.tezos.contract.at(contractDeployments.doorman.address);
            delegationInstance          = await utils.tezos.contract.at(contractDeployments.delegation.address);
            mvnTokenInstance            = await utils.tezos.contract.at(contractDeployments.mvnToken.address);
            governanceInstance          = await utils.tezos.contract.at(contractDeployments.governance.address);
            governanceProxyInstance     = await utils.tezos.contract.at(contractDeployments.governanceProxy.address);
            emergencyGovernanceInstance = await utils.tezos.contract.at(contractDeployments.emergencyGovernance.address);
            breakGlassInstance          = await utils.tezos.contract.at(contractDeployments.breakGlass.address);
            councilInstance             = await utils.tezos.contract.at(contractDeployments.council.address);
            mavenFa2TokenInstance      = await utils.tezos.contract.at(contractDeployments.mavenFa2Token.address);
                
            doormanStorage              = await doormanInstance.storage();
            delegationStorage           = await delegationInstance.storage();
            mvnTokenStorage             = await mvnTokenInstance.storage();
            governanceStorage           = await governanceInstance.storage();
            governanceProxyStorage      = await governanceProxyInstance.storage();
            emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
            breakGlassStorage           = await breakGlassInstance.storage();
            councilStorage              = await councilInstance.storage();
            mavenFa2TokenStorage       = await mavenFa2TokenInstance.storage();
    
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')

            // initialise variables for calculating satellite's total voting power
            delegationRatio = delegationStorage.config.delegationRatio;

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

            satelliteOne    = eve.pkh;
            satelliteOneSk  = eve.sk;

            satelliteTwo    = alice.pkh;
            satelliteTwoSk  = alice.sk;

            satelliteThree   = trudy.pkh;
            satelliteThreeSk = trudy.sk;

            satelliteFour   = oscar.pkh;
            satelliteFourSk = oscar.sk;

            satelliteFive   = susie.pkh;

            delegateOne     = david.pkh;
            delegateOneSk   = david.sk;

            delegateTwo     = ivan.pkh;
            delegateTwoSk   = ivan.sk;

            delegateThree   = isaac.pkh;
            delegateThreeSk = isaac.sk;

            delegateFour    = mallory.pkh;
            delegateFourSk  = mallory.sk;

            // -----------------------------------------------
            //
            // Governance test setup
            //  - set blocks per round to 0 for first cycle testing
            //  - initialise proposal submission fee mumav
            //  - set admin of delegation, doorman, and council contracts to governance proxy contract for subsequent proposal testing
            //  - generate sample mock proposal data
            //
            // -----------------------------------------------

            // set signer to admin
            await signerFactory(tezos, adminSk)

            // -------------------
            // set blocks per round to 0 for first cycle testing
            // -------------------

            zeroBlocksPerRound = 0;

            updateConfigOperation = await governanceInstance.methods.updateConfig(zeroBlocksPerRound, "configBlocksPerProposalRound").send();
            await updateConfigOperation.confirmation();

            updateConfigOperation = await governanceInstance.methods.updateConfig(zeroBlocksPerRound, "configBlocksPerVotingRound").send();
            await updateConfigOperation.confirmation();

            updateConfigOperation = await governanceInstance.methods.updateConfig(zeroBlocksPerRound, "configBlocksPerTimelockRound").send();
            await updateConfigOperation.confirmation();

            // -------------------
            // set proposal submission fee mumav
            // -------------------

            proposalSubmissionFeeMumav   = governanceStorage.config.proposalSubmissionFeeMumav;

            // -------------------
            // set admin of council contract to governance proxy contract for subsequent proposal testing 
            // -------------------

            if(councilStorage.admin !== governanceProxyAddress){
                setAdminOperation = await councilInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                await setAdminOperation.confirmation();
            }

            councilStorage      = await councilInstance.storage();
            governanceStorage   = await governanceInstance.storage();

            // -------------------
            // reset round to proposal
            // -------------------

            currentRound                = governanceStorage.currentCycleInfo.round;
            currentRoundString          = Object.keys(currentRound)[0]

            while(currentRoundString !== "proposal"){

                const startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                await startNextRoundOperation.confirmation();

                governanceStorage   = await governanceInstance.storage();
                currentRound        = governanceStorage.currentCycleInfo.round;
                currentRoundString  = Object.keys(currentRound)[0];

            }; 

            // -------------------
            // generate sample mock proposal data
            // -------------------

            delegationConfigChange  = 100;
            doormanConfigChange     = MVN(1.5);
            councilConfigChange     = 1234;

            const delegationLambdaFunction = await createLambdaBytes(
                tezos.rpc.url,
                contractDeployments.governanceProxy.address,
                
                'updateConfig',
                [
                    contractDeployments.delegation.address,
                    "delegation",
                    "ConfigMaxSatellites",
                    delegationConfigChange
                ]
            );

            const doormanLambdaFunction = await createLambdaBytes(
                tezos.rpc.url,
                contractDeployments.governanceProxy.address,
                
                'updateConfig',
                [
                    contractDeployments.doorman.address,
                    "doorman",
                    "ConfigMinMvnAmount",
                    doormanConfigChange
                ]
            );

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

            mockPackedLambdaData.updateDoormanConfig    = doormanLambdaFunction;
            mockPackedLambdaData.updateDelegationConfig = delegationLambdaFunction;
            mockPackedLambdaData.updateCouncilConfig    = councilLambdaFunction;

            // todo: add test for nay votes majority should not pass

        } catch (e) {
            console.dir(e, {depth: 5})
        }
    });

    describe("First Cycle", async () => {

        beforeEach("Set signer to general user (mallory)", async () => {
            await signerFactory(tezos, userSk)
        });

        describe("%startNextRound", async () => {

            it('any user (mallory) should be able to start the next round (proposal round) if no round has been initiated yet', async () => {
                try{
                    
                    // initial storage
                    governanceStorage = await governanceInstance.storage();

                    // check current round is proposal round
                    currentRound                      = governanceStorage.currentCycleInfo.round
                    currentRoundString                = Object.keys(currentRound)[0]
                    assert.equal(currentRoundString, "proposal");

                    const currentCycleInfoBlocksPerProposalRound      = governanceStorage.currentCycleInfo.blocksPerProposalRound.toNumber()
                    const currentCycleInfoBlocksPerVotingRound        = governanceStorage.currentCycleInfo.blocksPerVotingRound.toNumber()
                    const currentCycleInfoBlocksPerTimelockRound      = governanceStorage.currentCycleInfo.blocksPerTimelockRound.toNumber()
                    const currentCycleInfoRoundStartLevel             = governanceStorage.currentCycleInfo.roundStartLevel.toNumber()
                    const currentCycleInfoRoundEndLevel               = governanceStorage.currentCycleInfo.roundEndLevel.toNumber()
                    const currentCycleInfoCycleEndLevel               = governanceStorage.currentCycleInfo.cycleEndLevel.toNumber()
                    
                    const cycleHighestVotedProposalId = governanceStorage.cycleHighestVotedProposalId

                    // initial assertions
                    assert.equal(currentCycleInfoBlocksPerProposalRound,    governanceStorage.config.blocksPerProposalRound.toNumber());
                    assert.equal(currentCycleInfoBlocksPerVotingRound,      governanceStorage.config.blocksPerVotingRound.toNumber());
                    assert.equal(currentCycleInfoBlocksPerTimelockRound,    governanceStorage.config.blocksPerTimelockRound.toNumber());
                    assert.equal(cycleHighestVotedProposalId,               0);
                    assert.equal(currentCycleInfoRoundEndLevel,             currentCycleInfoRoundStartLevel + governanceStorage.config.blocksPerProposalRound.toNumber());
                    assert.equal(currentCycleInfoCycleEndLevel,             currentCycleInfoRoundStartLevel + governanceStorage.config.blocksPerProposalRound.toNumber() + governanceStorage.config.blocksPerVotingRound.toNumber() + governanceStorage.config.blocksPerTimelockRound.toNumber());

                    // Operation
                    const startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    // updated storage
                    governanceStorage = await governanceInstance.storage();

                    finalRound                       = governanceStorage.currentCycleInfo.round
                    finalRoundString                 = Object.keys(finalRound)[0]

                    const finalBlocksPerProposalRound      = governanceStorage.currentCycleInfo.blocksPerProposalRound.toNumber()
                    const finalBlocksPerVotingRound        = governanceStorage.currentCycleInfo.blocksPerVotingRound.toNumber()
                    const finalBlocksPerTimelockRound      = governanceStorage.currentCycleInfo.blocksPerTimelockRound.toNumber()
                    const finalRoundStartLevel             = governanceStorage.currentCycleInfo.roundStartLevel.toNumber()
                    const finalRoundEndLevel               = governanceStorage.currentCycleInfo.roundEndLevel.toNumber()
                    const finalCycleEndLevel               = governanceStorage.currentCycleInfo.cycleEndLevel.toNumber()
                    const finalRoundHighestVotedProposalId = governanceStorage.cycleHighestVotedProposalId

                    // Assertions
                    assert.equal(finalRoundString,                          "proposal");
                    assert.equal(finalBlocksPerProposalRound,               currentCycleInfoBlocksPerProposalRound);
                    assert.equal(finalBlocksPerVotingRound,                 currentCycleInfoBlocksPerVotingRound);
                    assert.equal(finalBlocksPerTimelockRound,               currentCycleInfoBlocksPerTimelockRound);
                    assert.notEqual(finalRoundStartLevel,                   currentCycleInfoRoundStartLevel);
                    assert.notEqual(finalRoundEndLevel,                     currentCycleInfoRoundEndLevel);
                    assert.notEqual(finalCycleEndLevel,                     currentCycleInfoCycleEndLevel);
                    assert.notEqual(finalRoundHighestVotedProposalId,       cycleHighestVotedProposalId);

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('any user (mallory) should be able to restart the proposal round from the proposal round if no proposals were submitted', async () => {
                try{

                    // Initial Values
                    governanceStorage                   = await governanceInstance.storage();
                    
                    // check current round is proposal round
                    currentRound                      = governanceStorage.currentCycleInfo.round
                    currentRoundString                = Object.keys(currentRound)[0]
                    assert.equal(currentRoundString, "proposal");

                    // Operation
                    const startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    // Final values
                    governanceStorage                   = await governanceInstance.storage();
                    finalRound                    = governanceStorage.currentCycleInfo.round
                    finalRoundString              = Object.keys(finalRound)[0]

                    // Assertions
                    assert.equal(finalRoundString, "proposal");

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('any user (mallory) should be able to restart the proposal round from the proposal round if no proposal received enough votes', async () => {
                try{

                    // Initial Values
                    governanceStorage                  = await governanceInstance.storage();
                    
                    // check current round is proposal round
                    currentRound                      = governanceStorage.currentCycleInfo.round
                    currentRoundString                = Object.keys(currentRound)[0]
                    assert.equal(currentRoundString, "proposal");

                    delegationStorage           = await delegationInstance.storage();
                    const proposalId            = governanceStorage.nextProposalId.toNumber();
                    const proposalName          = "New Proposal #1";
                    const proposalDesc          = "Details about new proposal #1";
                    const proposalIpfs          = "ipfs://QM123456789";
                    const proposalSourceCode    = "Proposal Source Code";

                    // set signer to satellite one (eve) and add proposal data
                    await signerFactory(tezos, satelliteOneSk)
                    const proposalData = [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
								codeDescription: ""
                            },
                        }
                    ]

                    // Operation
                    const proposeOperation = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: proposalSubmissionFeeMumav, mumav: true});
                    await proposeOperation.confirmation();

                    const lockProposalOperation = await governanceInstance.methods.lockProposal(proposalId).send();
                    await lockProposalOperation.confirmation()

                    // set signer back to general user (mallory)
                    await signerFactory(tezos, userSk)
                    const startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    finalRound        = governanceStorage.currentCycleInfo.round
                    finalRoundString  = Object.keys(finalRound)[0]

                    // Assertions
                    assert.equal(finalRoundString, "proposal");

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('any user (mallory) should be able to switch from the proposal round to the voting round', async () => {
                try{
                    
                    // Initial Values
                    governanceStorage                 = await governanceInstance.storage();

                    // check current round is proposal round
                    currentRound                      = governanceStorage.currentCycleInfo.round
                    currentRoundString                = Object.keys(currentRound)[0]
                    assert.equal(currentRoundString, "proposal");

                    delegationStorage           = await delegationInstance.storage();
                    const proposalId            = governanceStorage.nextProposalId.toNumber();
                    const proposalName          = "New Proposal #1";
                    const proposalDesc          = "Details about new proposal #1";
                    const proposalIpfs          = "ipfs://QM123456789";
                    const proposalSourceCode    = "Proposal Source Code";

                    // set signer to satellite one (eve) and add proposal data
                    await signerFactory(tezos, satelliteOneSk)

                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
								codeDescription: ""
                            },
                        }
                    ]

                    // Operation
                    const proposeOperation = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: proposalSubmissionFeeMumav, mumav: true});
                    await proposeOperation.confirmation();

                    // Increase user stake if they cannot exceed the votes needed to switch to the voting round
                    governanceStorage           = await governanceInstance.storage();
                    doormanStorage              = await doormanInstance.storage();
                    const proposal              = await governanceStorage.proposalLedger.get(proposalId);
                    const minimumNeeded         = proposal.minProposalRoundVotesRequired.toNumber();
                    let satelliteSMVNRecord   = await doormanStorage.userStakeBalanceLedger.get(satelliteOne);
                    let satelliteSMVNBalance  = satelliteSMVNRecord.balance.toNumber();
                    const stakeRequired         = minimumNeeded - satelliteSMVNBalance;
                    if(stakeRequired > 0){
                        const stakeAmount   = stakeRequired + MVN();
                        stakeOperation      = await doormanInstance.methods.stakeMvn(stakeAmount).send();
                        await stakeOperation.confirmation();
                    }
                    doormanStorage              = await doormanInstance.storage();
                    satelliteSMVNRecord   = await doormanStorage.userStakeBalanceLedger.get(satelliteOne);
                    satelliteSMVNBalance  = satelliteSMVNRecord.balance.toNumber();

                    // Lock and vote for the proposal
                    const lockProposalOperation = await governanceInstance.methods.lockProposal(proposalId).send();
                    await lockProposalOperation.confirmation()

                    const voteForProposalOperation = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                    await voteForProposalOperation.confirmation()

                    // set signer back to general user (mallory)
                    await signerFactory(tezos, userSk)
                    const startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    // Final values
                    governanceStorage                = await governanceInstance.storage();
                    finalRound                       = governanceStorage.currentCycleInfo.round
                    finalRoundString                 = Object.keys(finalRound)[0]
                    const finalRoundHighestVotedProposalId = governanceStorage.cycleHighestVotedProposalId

                    // Assertions
                    assert.equal(finalRoundString, "voting");
                    assert.equal(finalRoundHighestVotedProposalId, proposalId);

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('any user (mallory) should be able to switch from the voting round to the proposal round if the highest voted proposal did not receive enough votes', async () => {
                try{
                    
                    // Initial Values
                    governanceStorage                   = await governanceInstance.storage();
                    const currentCycleInfoRound         = governanceStorage.currentCycleInfo.round
                    const currentCycleInfoRoundString   = Object.keys(currentCycleInfoRound)[0]

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

            it('any user (mallory) should be able to switch from the voting round to the timelock round', async () => {
                try{
                    
                    // Operation
                    governanceStorage                 = await governanceInstance.storage();
                    currentRound                      = governanceStorage.currentCycleInfo.round
                    currentRoundString                = Object.keys(currentRound)[0]
                    assert.equal(currentRoundString, "proposal");
                    
                    delegationStorage           = await delegationInstance.storage();
                    const proposalId            = governanceStorage.nextProposalId.toNumber();
                    const proposalName          = "New Proposal #1";
                    const proposalDesc          = "Details about new proposal #1";
                    const proposalIpfs          = "ipfs://QM123456789";
                    const proposalSourceCode    = "Proposal Source Code";

                    // set signer to satellite one (eve) and add proposal data
                    await signerFactory(tezos, satelliteOneSk)

                    const proposalData = [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
								codeDescription: ""
                            },
                        }
                    ]

                    // Operation
                    const proposeOperation = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: proposalSubmissionFeeMumav, mumav: true});
                    await proposeOperation.confirmation();

                    const lockProposalOperation = await governanceInstance.methods.lockProposal(proposalId).send();
                    await lockProposalOperation.confirmation()

                    const voteForProposalOperation = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                    await voteForProposalOperation.confirmation()

                    // set signer back to general user (mallory)
                    await signerFactory(tezos, userSk)
                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    // check that current round is voting round
                    governanceStorage                 = await governanceInstance.storage();
                    currentRound                      = governanceStorage.currentCycleInfo.round
                    currentRoundString                = Object.keys(currentRound)[0]
                    assert.equal(currentRoundString, "voting");

                    // set signer to satellite one (eve) and vote for voting round proposal
                    await signerFactory(tezos, satelliteOneSk)
                    const votingRoundVoteOperation = await governanceInstance.methods.votingRoundVote("yay").send();
                    await votingRoundVoteOperation.confirmation();

                    // ---------------------------------------
                    // Repeat votes from other satellites until sufficient votes
                    // ---------------------------------------

                    governanceStorage         = await governanceInstance.storage();
                    proposalRecord            = await governanceStorage.proposalLedger.get(proposalId);

                    const yayVotesRequired    = Math.floor((proposalRecord.quorumStakedMvnTotal * proposalRecord.minYayVotePercentage) / 10000);

                    const totalStakedMvnSupply         = await mvnTokenInstance.contractViews.get_balance({ "0": doormanAddress, "1": 0}).executeView({ viewCaller : admin});
                    const minQuorumPercentage          = governanceStorage.config.minQuorumPercentage;
                    // const stakedMvnRequiredForQuorum   = calcStakedMvnRequiredForActionApproval(totalStakedMvnSupply, minQuorumPercentage, 5);
                    const minQuorumStakedMvnTotal   = Math.floor((totalStakedMvnSupply * minQuorumPercentage) / 10000);

                    let yayVoteStakedMvnTotal = proposalRecord.yayVoteStakedMvnTotal;
                    let quorumStakedMvnTotal  = proposalRecord.quorumStakedMvnTotal;

                    // check if sufficient yay votes obtained
                    if(yayVoteStakedMvnTotal < yayVotesRequired || quorumStakedMvnTotal < minQuorumStakedMvnTotal){
                        // set signer to satellite two (alice) and vote for voting round proposal
                        await signerFactory(tezos, satelliteTwoSk)
                        const votingRoundVoteOperation = await governanceInstance.methods.votingRoundVote("yay").send();
                        await votingRoundVoteOperation.confirmation();
                    }

                    governanceStorage         = await governanceInstance.storage();
                    proposalRecord            = await governanceStorage.proposalLedger.get(proposalId);
                    yayVoteStakedMvnTotal     = proposalRecord.yayVoteStakedMvnTotal;
                    quorumStakedMvnTotal      = proposalRecord.quorumStakedMvnTotal;

                    if(yayVoteStakedMvnTotal < yayVotesRequired || quorumStakedMvnTotal < minQuorumStakedMvnTotal){
                        // set signer to satellite three (susie) and vote for voting round proposal
                        await signerFactory(tezos, satelliteThreeSk)
                        const votingRoundVoteOperation = await governanceInstance.methods.votingRoundVote("yay").send();
                        await votingRoundVoteOperation.confirmation();
                    }

                    governanceStorage         = await governanceInstance.storage();
                    proposalRecord            = await governanceStorage.proposalLedger.get(proposalId);
                    yayVoteStakedMvnTotal     = proposalRecord.yayVoteStakedMvnTotal;
                    quorumStakedMvnTotal      = proposalRecord.quorumStakedMvnTotal;

                    if(yayVoteStakedMvnTotal < yayVotesRequired || quorumStakedMvnTotal < minQuorumStakedMvnTotal){
                        // set signer to satellite four (oscar) and vote for voting round proposal
                        await signerFactory(tezos, satelliteFourSk)
                        const votingRoundVoteOperation = await governanceInstance.methods.votingRoundVote("yay").send();
                        await votingRoundVoteOperation.confirmation();
                    }

                    // ---------------------------------------

                    // set signer back to general user (mallory)
                    await signerFactory(tezos, userSk)
                    startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    // Final values
                    governanceStorage                       = await governanceInstance.storage();
                    mvnTokenStorage                         = await mvnTokenInstance.storage();
                    const finalRound                        = governanceStorage.currentCycleInfo.round
                    const finalRoundString                  = Object.keys(finalRound)[0]

                    // Assertions
                    assert.equal(finalRoundString, "timelock");

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('any user (mallory) should be able to switch from the timelock round to the proposal round', async () => {
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

            beforeEach("Set signer to satellite (eve)", async () => {
                await signerFactory(tezos, satelliteOneSk)
            });

            it('satellite (eve) should be able to create a proposal without metadata', async () => {
                try{

                    // Initial Values
                    governanceStorage           = await governanceInstance.storage();

                    const nextProposalId        = governanceStorage.nextProposalId;
                    const proposalName          = "New Proposal #2";
                    const proposalDesc          = "Details about new proposal #2";
                    const proposalIpfs          = "ipfs://QM123456789";
                    const proposalSourceCode    = "Proposal Source Code";

                    firstReferenceProposalId    = nextProposalId;

                    // add proposal data
                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
								codeDescription: ""
                            },
                        }
                    ]

                    // Operation
                    const proposeOperation = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: proposalSubmissionFeeMumav, mumav: true});
                    await proposeOperation.confirmation();

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const successReward = governanceStorage.config.successReward
                    const currentCycleInfoCycleEndLevel = governanceStorage.currentCycleInfo.cycleEndLevel
                    const minQuorumPercentage = governanceStorage.config.minQuorumPercentage
                    const minYayVotePercentage = governanceStorage.config.minYayVotePercentage
                    const minProposalRoundVotePercentage = governanceStorage.config.minProposalRoundVotePercentage
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
                    assert.equal(newProposal.proposalVoteStakedMvnTotal.toNumber(), 0);
                    assert.equal(newProposal.minProposalRoundVotePercentage.toNumber(), minProposalRoundVotePercentage.toNumber());
                    assert.equal(newProposal.yayVoteCount.toNumber(), 0);
                    assert.equal(newProposal.yayVoteStakedMvnTotal.toNumber(), 0);
                    assert.equal(newProposal.nayVoteCount.toNumber(), 0);
                    assert.equal(newProposal.nayVoteStakedMvnTotal.toNumber(), 0);
                    assert.equal(newProposal.passVoteCount.toNumber(), 0);
                    assert.equal(newProposal.passVoteStakedMvnTotal.toNumber(), 0);
                    assert.equal(newProposal.minQuorumPercentage.toNumber(), minQuorumPercentage.toNumber());
                    assert.equal(newProposal.minYayVotePercentage.toNumber(), minYayVotePercentage.toNumber());
                    assert.equal(newProposal.quorumCount.toNumber(), 0);
                    assert.equal(newProposal.quorumStakedMvnTotal.toNumber(), 0);
                    assert.equal(newProposal.cycle.toNumber(), cycleId.toNumber());
                    assert.equal(newProposal.currentCycleEndLevel.toNumber(), currentCycleInfoCycleEndLevel.toNumber());

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('satellite (eve) should be able to create a proposal with code and payment', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage();

                    delegationStorage           = await delegationInstance.storage();
                    const nextProposalId        = governanceStorage.nextProposalId;
                    const proposalName          = "New Proposal #3";
                    const proposalDesc          = "Details about new proposal #3";
                    const proposalIpfs          = "ipfs://QM123456789";
                    const proposalSourceCode    = "Proposal Source Code";

                    secondReferenceProposalId   = nextProposalId;

                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
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
                                            "tokenContractAddress" : contractDeployments.mvnToken.address,
                                            "tokenId" : 0
                                        }
                                    },
                                    "amount" : MVN(5)
                                }
                            }
                        }
                    ]

                    // Operation
                    const proposeOperation = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData, paymentData).send({amount: proposalSubmissionFeeMumav, mumav: true});
                    await proposeOperation.confirmation();

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
                    const paymentDataStorage = await newProposal.paymentData.get("0");
                    const cycleProposal = await governanceStorage.cycleProposals.get(nextProposalId)
                    
                    // Assertions
                    assert.notStrictEqual(proposalDataStorage, undefined);
                    assert.notStrictEqual(paymentDataStorage, undefined);
                    assert.strictEqual(proposalDataStorage.Some.title, "Data#1");
                    assert.strictEqual(proposalDataStorage.Some.encodedCode, mockPackedLambdaData.updateCouncilConfig);
                    assert.strictEqual(paymentDataStorage.Some.title,  "Payment#0");
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
                    assert.equal(newProposal.proposalVoteStakedMvnTotal.toNumber(), 0);
                    assert.equal(newProposal.minProposalRoundVotePercentage.toNumber(), minProposalRoundVotePercentage.toNumber());
                    assert.equal(newProposal.yayVoteCount.toNumber(), 0);
                    assert.equal(newProposal.yayVoteStakedMvnTotal.toNumber(), 0);
                    assert.equal(newProposal.nayVoteCount.toNumber(), 0);
                    assert.equal(newProposal.nayVoteStakedMvnTotal.toNumber(), 0);
                    assert.equal(newProposal.passVoteCount.toNumber(), 0);
                    assert.equal(newProposal.passVoteStakedMvnTotal.toNumber(), 0);
                    assert.equal(newProposal.minQuorumPercentage.toNumber(), minQuorumPercentage.toNumber());
                    assert.equal(newProposal.minYayVotePercentage.toNumber(), minYayVotePercentage.toNumber());
                    assert.equal(newProposal.quorumCount.toNumber(), 0);
                    assert.equal(newProposal.quorumStakedMvnTotal.toNumber(), 0);
                    assert.equal(newProposal.cycle.toNumber(), cycleId.toNumber());
                    assert.equal(newProposal.currentCycleEndLevel.toNumber(), currentCycleInfoCycleEndLevel.toNumber());

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('non-satellite (mallory) should not be able to call this entrypoint', async () => {
                try{
                    
                    // Initial Values
                    delegationStorage                   = await delegationInstance.storage();
                    governanceStorage                   = await governanceInstance.storage();

                    const nextProposalId        = governanceStorage.nextProposalId;
                    const proposalName          = "New Proposal #3";
                    const proposalDesc          = "Details about new proposal #3";
                    const proposalIpfs          = "ipfs://QM123456789";
                    const proposalSourceCode    = "Proposal Source Code";

                    // Operation
                    await signerFactory(tezos, userSk);
                    await chai.expect(governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode).send({amount: proposalSubmissionFeeMumav, mumav: true})).to.be.rejected;

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const newProposal = await governanceStorage.proposalLedger.get(nextProposalId);

                    // Assertions
                    assert.strictEqual(newProposal, undefined);

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('new satellite (baker) should not be able to call this entrypoint if it was not in the previous snapshot', async () => {
                try{

                    // Initial Values
                    governanceStorage           = await governanceInstance.storage();
                    const nextProposalId        = governanceStorage.nextProposalId;
                    const proposalName          = "New Proposal #3";
                    const proposalDesc          = "Details about new proposal #3";
                    const proposalIpfs          = "ipfs://QM123456789";
                    const proposalSourceCode    = "Proposal Source Code";

                    const newSatellite      = baker.pkh;
                    const newSatelliteSk    = baker.sk;

                    // set signer to new satellite (baker)
                    await signerFactory(tezos, newSatelliteSk);

                    delegationStorage                = await delegationInstance.storage();
                    doormanStorage                   = await doormanInstance.storage();
                    initialSatelliteRecord           = await delegationStorage.satelliteLedger.get(newSatellite);         

                    initialMinimumStakedMvnRequirement  = delegationStorage.config.minimumStakedMvnBalance;
                    initialUserStakedRecord             = await doormanStorage.userStakeBalanceLedger.get(newSatellite);
                    initialUserStakedBalance            = initialUserStakedRecord === undefined ? 0 : initialUserStakedRecord.balance.toNumber()

                    // check that user has sufficient staked balance
                    if(initialUserStakedBalance < initialMinimumStakedMvnRequirement){

                        stakeAmount = Math.abs(initialUserStakedBalance - initialMinimumStakedMvnRequirement) + 1;

                        // update operators operation for user
                        updateOperatorsOperation = await updateOperators(mvnTokenInstance, newSatellite, doormanAddress, tokenId);
                        await updateOperatorsOperation.confirmation();

                        // user stake MVN tokens
                        stakeOperation = await doormanInstance.methods.stakeMvn(stakeAmount).send();
                        await stakeOperation.confirmation();

                    }; 

                    // update user staked balance for assertion check below (satellite's staked mvn balance)
                    doormanStorage                      = await doormanInstance.storage();
                    initialUserStakedRecord             = await doormanStorage.userStakeBalanceLedger.get(newSatellite);
                    initialUserStakedBalance            = initialUserStakedRecord.balance.toNumber();

                    // if retest: run registerAsSatellite operation if satellite has not been registered yet, and skip for subsequent retesting
                    if(initialSatelliteRecord == null){

                        // user registers as a satellite
                        registerAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite(
                            mockSatelliteData.eve.name, 
                            mockSatelliteData.eve.desc, 
                            mockSatelliteData.eve.image, 
                            mockSatelliteData.eve.website,
                            mockSatelliteData.eve.satelliteFee,
                            mockSatelliteData.eve.oraclePublicKey,
                            mockSatelliteData.eve.oraclePeerId
                        ).send();
                        await registerAsSatelliteOperation.confirmation();

                        // check state after registering as satellite
                        delegationStorage               = await delegationInstance.storage();
                        updatedSatelliteRecord          = await delegationStorage.satelliteLedger.get(newSatellite);         
                        
                        // check satellite details
                        assert.equal(updatedSatelliteRecord.name,                           mockSatelliteData.eve.name);
                        assert.equal(updatedSatelliteRecord.description,                    mockSatelliteData.eve.desc);
                        assert.equal(updatedSatelliteRecord.website,                        mockSatelliteData.eve.website);
                        assert.equal(updatedSatelliteRecord.stakedMvnBalance.toNumber(),    initialUserStakedBalance);
                        assert.equal(updatedSatelliteRecord.satelliteFee,                   mockSatelliteData.eve.satelliteFee);
                        assert.equal(updatedSatelliteRecord.totalDelegatedAmount,           0);
                        assert.equal(updatedSatelliteRecord.status,                         "ACTIVE");
                    }

                    await chai.expect(governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode).send({amount: proposalSubmissionFeeMumav, mumav: true})).to.be.rejected;

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const newProposal = await governanceStorage.proposalLedger.get(nextProposalId);

                    // Assertions
                    assert.strictEqual(newProposal, undefined);

                    // remove baker as a satellite (unregisters as a satellite)
                    const unregisterAsSatelliteOperation = await delegationInstance.methods.unregisterAsSatellite(newSatellite).send();
                    await unregisterAsSatelliteOperation.confirmation();

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })
        })

        describe("%updateProposalData", async () => {

            beforeEach("Set signer to satellite one (eve)", async () => {
                await signerFactory(tezos, satelliteOneSk)
            });

            it('satellite (eve) should be able to add data to an existing proposal', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = secondReferenceProposalId;
                    const proposalDebug         = await governanceStorage.proposalLedger.get(proposalId);

                    // Operation
                    const addDataOperation = await governanceInstance.methods.updateProposalData(proposalId, [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
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
                    assert.strictEqual(proposalDataStorage.Some.title, "Data#1")
                    assert.strictEqual(proposalDataStorage.Some.encodedCode, mockPackedLambdaData.updateCouncilConfig,)
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('satellite (eve) should be able to update a proposal data at a given index', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = secondReferenceProposalId;

                    // Operation
                    const addDataOperation = await governanceInstance.methods.updateProposalData(proposalId, [
                        {
                            addOrSetProposalData: {
                                title: "Data#1.1",
                                encodedCode: mockPackedLambdaData.updateDelegationConfig,
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
                    assert.strictEqual(proposalDataStorage.Some.title, "Data#1.1")
                    assert.strictEqual(proposalDataStorage.Some.encodedCode, mockPackedLambdaData.updateDelegationConfig)

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('satellite (eve) should not be able to update data at an non-existent index', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = secondReferenceProposalId;

                    // Operation
                    await chai.expect(governanceInstance.methods.updateProposalData(proposalId, [
                        {
                            addOrSetProposalData: {
                                title: "Data#1.2",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
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

            it('satellite (eve) should be able to remove data from a proposal before it is locked', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = secondReferenceProposalId;
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

            it('satellite (eve) should be able to add, update and remove multiple data from a proposal', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = secondReferenceProposalId;

                    // Operation
                    const addDataOperation = await governanceInstance.methods.updateProposalData(proposalId, [
                        {
                            addOrSetProposalData: {
                                title: "Data#1.2",
                                encodedCode: mockPackedLambdaData.updateDelegationConfig,
								codeDescription: "",
                                index: "1"
                            }
                        },
                        {
                            addOrSetProposalData: {
                                title: "Data#2",
                                encodedCode: mockPackedLambdaData.updateDoormanConfig,
								codeDescription: ""
                            }
                        },
                        {
                            removeProposalData: "2"
                        },
                        {
                            addOrSetProposalData: {
                                title: "Data#3",
                                encodedCode: mockPackedLambdaData.updateDelegationConfig,
								codeDescription: ""
                            }
                        },
                        {
                            addOrSetProposalData: {
                                title: "Data#2.1",
                                encodedCode: mockPackedLambdaData.updateDoormanConfig,
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
                    assert.strictEqual(firstProposalDataStorage.Some.title, "Data#1.2")
                    assert.strictEqual(firstProposalDataStorage.Some.encodedCode, mockPackedLambdaData.updateDelegationConfig)
                    assert.strictEqual(secondProposalDataStorage.Some.title, "Data#2.1")
                    assert.strictEqual(secondProposalDataStorage.Some.encodedCode, mockPackedLambdaData.updateDoormanConfig)
                    assert.strictEqual(thirdProposalDataStorage.Some.title,  "Data#3")
                    assert.strictEqual(thirdProposalDataStorage.Some.encodedCode, mockPackedLambdaData.updateDelegationConfig)

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('satellite (eve) should be able to add payment data to a proposal', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = secondReferenceProposalId;

                    // Transaction data
                    const transaction           = {
                        "to_"    : bob.pkh,
                        "token"  : {
                            "fa2" : {
                                "tokenContractAddress" : contractDeployments.mvnToken.address,
                                "tokenId" : 0
                            }
                        },
                        "amount" : MVN(5)
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
                    assert.strictEqual(firstProposalDataStorage.Some.title, "Payment#2")
                    assert.notStrictEqual(firstProposalDataStorage.Some.transaction, undefined)

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('satellite (eve) should be able to update payment data from a proposal', async () => {
                try{

                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = secondReferenceProposalId;

                    // Transaction data
                    const transaction           = {
                        "to_"    : alice.pkh,
                        "token"  : {
                            "fa2" : {
                                "tokenContractAddress" : contractDeployments.mvnToken.address,
                                "tokenId" : 0
                            }
                        },
                        "amount" : MVN(5)
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
                    assert.strictEqual(firstProposalDataStorage.Some.title, "Payment#2.1")
                    assert.notStrictEqual(firstProposalDataStorage.Some.transaction, undefined)

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('satellite (eve) should be able to remove payment data from a proposal', async () => {
                try{

                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = secondReferenceProposalId;

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

            it('satellite (eve) should be able to remove add, set and remove data from a proposal', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = secondReferenceProposalId;

                    // Transaction data
                    const firstTransaction      = {
                        "to_"    : alice.pkh,
                        "token"  : {
                            "fa2" : {
                                "tokenContractAddress" : contractDeployments.mvnToken.address,
                                "tokenId" : 0
                            }
                        },
                        "amount" : MVN(5)
                    }
                    const secondTransaction     = {
                        "to_"    : bob.pkh,
                        "token"  : {
                            "fa2" : {
                                "tokenContractAddress" : contractDeployments.mvnToken.address,
                                "tokenId" : 0
                            }
                        },
                        "amount" : MVN(5)
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
                    assert.strictEqual(firstProposalDataStorage.Some.title, "Payment#2.2")
                    assert.notStrictEqual(firstProposalDataStorage.Some.transaction, undefined)
                    assert.strictEqual(secondProposalDataStorage.Some.title, "Payment#3")
                    assert.notStrictEqual(secondProposalDataStorage.Some.transaction, undefined)

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('non-satellite (mallory) should not be able to call this entrypoint', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = secondReferenceProposalId;

                    // Operation
                    await signerFactory(tezos, userSk);
                    await chai.expect(governanceInstance.methods.updateProposalData(proposalId, [
                        {
                            addOrSetProposalData: {
                                title: "Data#4",
                                encodedCode: mockPackedLambdaData.updateDelegationConfig,
								codeDescription: ""
                            },
                        }
                    ]).send()).to.be.rejected;

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('satellite (eve) should not be able to call %updateProposalData if the proposal does not exist', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = 9999;

                    // Operation
                    await chai.expect(governanceInstance.methods.updateProposalData(proposalId, [
                        {
                            addOrSetProposalData: {
                                title: "Data#4",
                                encodedCode: mockPackedLambdaData.updateDelegationConfig,
								codeDescription: ""
                            },
                        }
                    ]).send()).to.be.rejected;

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('satellite (eve) should not be able to call %updateProposalData with a proposal ID that it did not create', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = secondReferenceProposalId;

                    // Operation
                    await signerFactory(tezos, alice.sk);
                    await chai.expect(governanceInstance.methods.updateProposalData(proposalId, [
                        {
                            addOrSetProposalData: {
                                title: "Data#4",
                                encodedCode: mockPackedLambdaData.updateDelegationConfig,
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

            beforeEach("Set signer to satellite (eve)", async () => {
                await signerFactory(tezos, satelliteOneSk)
            });

            it('satellite (eve) should be able to lock a proposal she created', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = secondReferenceProposalId;

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

            it('non-satellite (mallory) should not be able to lock any proposal', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = secondReferenceProposalId;

                    // Operation
                    await signerFactory(tezos, userSk);
                    await chai.expect(governanceInstance.methods.lockProposal(proposalId).send()).to.be.rejected;

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('satellite (eve) should not be able to lock a proposal that does not exist', async () => {
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

            it('satellite (eve) should not be able to lock a proposal more than once', async () => {
                try{
                    
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = secondReferenceProposalId;

                    // Operation
                    await chai.expect(governanceInstance.methods.lockProposal(proposalId).send()).to.be.rejected;

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('satellite (eve) should not be able to lock a proposal she did not create', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = secondReferenceProposalId;

                    // Operation
                    await signerFactory(tezos, alice.sk);
                    await chai.expect(governanceInstance.methods.lockProposal(proposalId).send()).to.be.rejected;

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })
        })

        describe("%proposalRoundVote", async () => {
            
            beforeEach("Set signer to satellite one (eve)", async () => {
                await signerFactory(tezos, satelliteOneSk)
            });

            it('satellite (eve) should be able to vote for a proposal during the proposal round', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const cycleId               = governanceStorage.cycleId.toNumber();
                    const proposalId            = secondReferenceProposalId;

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

            it('non-satellite (mallory) should not be able to vote for a proposal', async () => {
                try{
                    // Initial Values
                    governanceStorage      = await governanceInstance.storage()
                    const cycleId          = governanceStorage.cycleId.toNumber();
                    const proposalId       = secondReferenceProposalId;

                    // Operation
                    await signerFactory(tezos, userSk)
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

            it('satellite should not be able increase its total voting power during the current round', async () => {
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
                    const firstProposalName          = "Test Voting Power change";
                    const firstProposalDesc          = "Details about new proposal #1";
                    const firstProposalIpfs          = "ipfs://QM123456789";
                    const firstProposalSourceCode    = "Proposal Source Code";

                    // Pre increase values
                    governanceStorage                   = await governanceInstance.storage();
                    doormanStorage                      = await doormanInstance.storage();
                    delegationStorage                   = await delegationInstance.storage();
                    var currentCycle                    = governanceStorage.cycleId;

                    // compound satellite one to create snapshot
                    await signerFactory(tezos, satelliteOneSk);
                    var compoundOperation = await doormanInstance.methods.compound([satelliteOne]).send();
                    await compoundOperation.confirmation();

                    const preIncreaseSnapshot           = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteOne})
                    const preIncreaseUserSMVN           = (await doormanStorage.userStakeBalanceLedger.get(satelliteOne)).balance.toNumber();
                    const preIncreaseSatellite          = await delegationStorage.satelliteLedger.get(satelliteOne);

                    // satellite increases her stake (which should not increase her total voting power)
                    var stakeOperation = await doormanInstance.methods.stakeMvn(MVN(3)).send()
                    await stakeOperation.confirmation();

                    // User (mallory) delegates to satellite
                    await signerFactory(tezos, mallory.sk)
                    var updateOperatorsOperation = await updateOperators(mvnTokenInstance, mallory.pkh, satelliteOne, tokenId);
                    await updateOperatorsOperation.confirmation();

                    var delegateOperation = await delegationInstance.methods.delegateToSatellite(mallory.pkh, satelliteOne).send()
                    await delegateOperation.confirmation()

                    // Post staking values
                    governanceStorage                   = await governanceInstance.storage();
                    doormanStorage                      = await doormanInstance.storage();
                    currentCycle                        = governanceStorage.cycleId;

                    // add proposal data
                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
								codeDescription: ""
                            },
                        }
                    ]

                    // Operation
                    await signerFactory(tezos, satelliteOneSk)
                    var proposeOperation                = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode, proposalData).send({amount: proposalSubmissionFeeMumav, mumav: true});
                    await proposeOperation.confirmation();

                    const lockProposalOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                    await lockProposalOperation.confirmation();

                    const voteOperation                 = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                    await voteOperation.confirmation();

                    // Final values
                    governanceStorage                   = await governanceInstance.storage();
                    const proposal                      = await governanceStorage.proposalLedger.get(proposalId);
                    const postIncreaseSnapshot          = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: eve.pkh})
                    const postIncreaseUserSMVN          = (await doormanStorage.userStakeBalanceLedger.get(eve.pkh)).balance.toNumber();
                    const postIncreaseSatellite         = await delegationStorage.satelliteLedger.get(eve.pkh);
                    
                    // console.log("BALANCE:", preIncreaseSatellite)
                    // console.log("BALANCE2:", postIncreaseSatellite)

                    // Assertions
                    assert.notEqual(postIncreaseUserSMVN, preIncreaseUserSMVN);
                    assert.notEqual(postIncreaseSatellite.stakedMvnBalance.toNumber(), preIncreaseSatellite.stakedMvnBalance.toNumber());
                    assert.notEqual(postIncreaseSatellite.totalDelegatedAmount.toNumber(), preIncreaseSatellite.totalDelegatedAmount.toNumber());
                    assert.equal(postIncreaseSnapshot.totalStakedMvnBalance.toNumber(), preIncreaseSnapshot.totalStakedMvnBalance.toNumber())
                    assert.equal(postIncreaseSnapshot.totalDelegatedAmount.toNumber(), preIncreaseSnapshot.totalDelegatedAmount.toNumber())
                    assert.equal(postIncreaseSnapshot.totalVotingPower.toNumber(), preIncreaseSnapshot.totalVotingPower.toNumber())
                    assert.equal(proposal.proposalVoteStakedMvnTotal.toNumber(), postIncreaseSnapshot.totalVotingPower.toNumber())

                    // Reset delegate 
                    // User (mallory) redelegates to satellite two (alice)
                    await signerFactory(tezos, mallory.sk)
                    updateOperatorsOperation = await updateOperators(mvnTokenInstance, mallory.pkh, satelliteTwo, tokenId);
                    await updateOperatorsOperation.confirmation();

                    delegateOperation = await delegationInstance.methods.delegateToSatellite(mallory.pkh, satelliteTwo).send()
                    await delegateOperation.confirmation()

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('new satellite (baker) should not be able to vote if it was not in the previous snapshot', async () => {
                try{
                    
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const cycleId               = governanceStorage.cycleId.toNumber();
                    const proposalId            = secondReferenceProposalId;

                    const newSatellite      = baker.pkh;
                    const newSatelliteSk    = baker.sk;

                    // set signer to random new satellite (baker)
                    await signerFactory(tezos, newSatelliteSk);

                    delegationStorage                = await delegationInstance.storage();
                    doormanStorage                   = await doormanInstance.storage();
                    initialSatelliteRecord           = await delegationStorage.satelliteLedger.get(newSatellite);         

                    initialMinimumStakedMvnRequirement  = delegationStorage.config.minimumStakedMvnBalance;
                    initialUserStakedRecord             = await doormanStorage.userStakeBalanceLedger.get(newSatellite);
                    initialUserStakedBalance            = initialUserStakedRecord === undefined ? 0 : initialUserStakedRecord.balance.toNumber()

                    // check that user has sufficient staked balance
                    if(initialUserStakedBalance < initialMinimumStakedMvnRequirement){

                        stakeAmount = Math.abs(initialUserStakedBalance - initialMinimumStakedMvnRequirement) + 1;

                        // update operators operation for user
                        updateOperatorsOperation = await updateOperators(mvnTokenInstance, newSatellite, doormanAddress, tokenId);
                        await updateOperatorsOperation.confirmation();

                        // user stake MVN tokens
                        stakeOperation = await doormanInstance.methods.stakeMvn(stakeAmount).send();
                        await stakeOperation.confirmation();

                    }; 

                    // update user staked balance for assertion check below (satellite's staked mvn balance)
                    doormanStorage                      = await doormanInstance.storage();
                    initialUserStakedRecord             = await doormanStorage.userStakeBalanceLedger.get(newSatellite);
                    initialUserStakedBalance            = initialUserStakedRecord.balance.toNumber();

                    // if retest: run registerAsSatellite operation if satellite has not been registered yet, and skip for subsequent retesting
                    if(initialSatelliteRecord == null){

                        // user registers as a satellite
                        registerAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite(
                            mockSatelliteData.eve.name, 
                            mockSatelliteData.eve.desc, 
                            mockSatelliteData.eve.image, 
                            mockSatelliteData.eve.website,
                            mockSatelliteData.eve.satelliteFee,
                            mockSatelliteData.eve.oraclePublicKey,
                            mockSatelliteData.eve.oraclePeerId
                        ).send();
                        await registerAsSatelliteOperation.confirmation();

                        // check state after registering as satellite
                        delegationStorage               = await delegationInstance.storage();
                        updatedSatelliteRecord          = await delegationStorage.satelliteLedger.get(newSatellite);         
                        
                        // check satellite details
                        assert.equal(updatedSatelliteRecord.name,                           mockSatelliteData.eve.name);
                        assert.equal(updatedSatelliteRecord.description,                    mockSatelliteData.eve.desc);
                        assert.equal(updatedSatelliteRecord.website,                        mockSatelliteData.eve.website);
                        assert.equal(updatedSatelliteRecord.stakedMvnBalance.toNumber(),    initialUserStakedBalance);
                        assert.equal(updatedSatelliteRecord.satelliteFee,                   mockSatelliteData.eve.satelliteFee);
                        assert.equal(updatedSatelliteRecord.totalDelegatedAmount,           0);
                        assert.equal(updatedSatelliteRecord.status,                         "ACTIVE");
                    }

                    await chai.expect(governanceInstance.methods.proposalRoundVote(proposalId).send()).to.be.rejected;

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const roundVoter = await governanceStorage.roundVotes.get({
                        0: cycleId,
                        1: mallory.pkh,
                    })

                    // Assertions
                    assert.strictEqual(roundVoter, undefined)

                    // remove baker as a satellite (unregisters as a satellite)
                    const unregisterAsSatelliteOperation = await delegationInstance.methods.unregisterAsSatellite(newSatellite).send();
                    await unregisterAsSatelliteOperation.confirmation();

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('satellite (eve) should not be able to vote for a proposal if it was not locked', async () => {
                try{

                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = firstReferenceProposalId;

                    // Operation
                    await chai.expect(governanceInstance.methods.proposalRoundVote(proposalId).send()).to.be.rejected;

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('satellite (eve) should not be able to vote for a proposal that does not exist', async () => {
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

            it('satellite (eve) should be able to change its vote', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const cycleId               = governanceStorage.cycleId.toNumber();
                    const proposalId            = firstReferenceProposalId;
                    const roundVoter            = await governanceStorage.roundVotes.get({
                        0: cycleId,
                        1: eve.pkh,
                    })
                    const previousProposal = await governanceStorage.proposalLedger.get(roundVoter.proposal.toNumber());
                    const previousProposalVoteCount = await previousProposal.proposalVoteCount;

                    // Add data to proposal for later execution
                    const addDataOperation = await governanceInstance.methods.updateProposalData(proposalId, [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
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

            beforeEach("Set signer to satellite one (eve)", async () => {
                await signerFactory(tezos, satelliteOneSk)
            });

            it('satellite (eve) should be able to drop a proposal if she created it', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = secondReferenceProposalId;

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

            it('non-satellite (mallory) should not be able to drop a proposal if she is not a satellite', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = firstReferenceProposalId;

                    // Operation
                    await signerFactory(tezos, userSk)
                    await chai.expect(governanceInstance.methods.dropProposal(proposalId).send()).to.be.rejected;

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('satellite (alice) should not be able to drop a proposal she did not create', async () => {
                try{

                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = firstReferenceProposalId;

                    // Operation
                    await signerFactory(tezos, satelliteTwoSk)
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

            it('satellite (eve) should not be able to drop a proposal if it has already been dropped', async () => {
                try{
                    
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const proposalId            = secondReferenceProposalId;

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

            beforeEach("Set signer to satellite (eve)", async () => {
                await signerFactory(tezos, satelliteOneSk)
            });

            it('satellite (eve) should be able to vote for a proposal in the voting round', async () => {
                try{

                    // Initial Values
                    governanceStorage = await governanceInstance.storage()

                    const voteOperation = await governanceInstance.methods.votingRoundVote("yay").send();
                    await voteOperation.confirmation();

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('non-satellite (mallory) should not be able to vote for a proposal in the voting round', async () => {
                try{
                    
                    // Initial Values
                    governanceStorage = await governanceInstance.storage()

                    await signerFactory(tezos, userSk)
                    await chai.expect(governanceInstance.methods.votingRoundVote("yay").send()).to.be.rejected;

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('new satellite (baker) should not be able to call this entrypoint if it was not in the previous snapshot', async () => {
                try{

                    // Initial Values
                    governanceStorage           = await governanceInstance.storage()
                    const cycleId               = governanceStorage.cycleId.toNumber();
                    const proposalId            = firstReferenceProposalId;

                    const newSatellite      = baker.pkh;
                    const newSatelliteSk    = baker.sk;

                    // set signer to random new satellite (baker)
                    await signerFactory(tezos, newSatelliteSk);

                    delegationStorage                = await delegationInstance.storage();
                    doormanStorage                   = await doormanInstance.storage();
                    initialSatelliteRecord           = await delegationStorage.satelliteLedger.get(newSatellite);         

                    initialMinimumStakedMvnRequirement  = delegationStorage.config.minimumStakedMvnBalance;
                    initialUserStakedRecord             = await doormanStorage.userStakeBalanceLedger.get(newSatellite);
                    initialUserStakedBalance            = initialUserStakedRecord === undefined ? 0 : initialUserStakedRecord.balance.toNumber()

                    // check that user has sufficient staked balance
                    if(initialUserStakedBalance < initialMinimumStakedMvnRequirement){

                        stakeAmount = Math.abs(initialUserStakedBalance - initialMinimumStakedMvnRequirement) + 1;

                        // update operators operation for user
                        updateOperatorsOperation = await updateOperators(mvnTokenInstance, newSatellite, doormanAddress, tokenId);
                        await updateOperatorsOperation.confirmation();

                        // user stake MVN tokens
                        stakeOperation = await doormanInstance.methods.stakeMvn(stakeAmount).send();
                        await stakeOperation.confirmation();

                    }; 

                    // update user staked balance for assertion check below (satellite's staked mvn balance)
                    doormanStorage                      = await doormanInstance.storage();
                    initialUserStakedRecord             = await doormanStorage.userStakeBalanceLedger.get(newSatellite);
                    initialUserStakedBalance            = initialUserStakedRecord.balance.toNumber();

                    // if retest: run registerAsSatellite operation if satellite has not been registered yet, and skip for subsequent retesting
                    if(initialSatelliteRecord == null){

                        // user registers as a satellite
                        registerAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite(
                            mockSatelliteData.eve.name, 
                            mockSatelliteData.eve.desc, 
                            mockSatelliteData.eve.image, 
                            mockSatelliteData.eve.website,
                            mockSatelliteData.eve.satelliteFee,
                            mockSatelliteData.eve.oraclePublicKey,
                            mockSatelliteData.eve.oraclePeerId
                        ).send();
                        await registerAsSatelliteOperation.confirmation();

                        // check state after registering as satellite
                        delegationStorage               = await delegationInstance.storage();
                        updatedSatelliteRecord          = await delegationStorage.satelliteLedger.get(newSatellite);         
                        
                        // check satellite details
                        assert.equal(updatedSatelliteRecord.name,                           mockSatelliteData.eve.name);
                        assert.equal(updatedSatelliteRecord.description,                    mockSatelliteData.eve.desc);
                        assert.equal(updatedSatelliteRecord.website,                        mockSatelliteData.eve.website);
                        assert.equal(updatedSatelliteRecord.stakedMvnBalance.toNumber(),    initialUserStakedBalance);
                        assert.equal(updatedSatelliteRecord.satelliteFee,                   mockSatelliteData.eve.satelliteFee);
                        assert.equal(updatedSatelliteRecord.totalDelegatedAmount,           0);
                        assert.equal(updatedSatelliteRecord.status,                         "ACTIVE");
                    }

                    await chai.expect(governanceInstance.methods.votingRoundVote(proposalId).send()).to.be.rejected;

                    // Final values
                    governanceStorage = await governanceInstance.storage();
                    const roundVoter = await governanceStorage.roundVotes.get({
                        0: cycleId,
                        1: mallory.pkh,
                    })

                    // Assertions
                    assert.strictEqual(roundVoter, undefined)

                    // remove baker as a satellite (unregisters as a satellite)
                    const unregisterAsSatelliteOperation = await delegationInstance.methods.unregisterAsSatellite(newSatellite).send();
                    await unregisterAsSatelliteOperation.confirmation();

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })
        })

        describe("%executeProposal", async () => {

            beforeEach("Set signer to satellite one (eve)", async () => {
                await signerFactory(tezos, satelliteOneSk)
            });

            it('satellite (eve) should not be able to execute proposal if it is the voting round', async () => {
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

            it('satellite (eve) should not be able to execute a proposal if it is the timelock round', async () => {
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

            it('satellite (eve) should be able to execute a proposal in the next proposal round', async () => {
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

            beforeEach("Set signer to standard user (mallory)", async () => {
                await signerFactory(tezos, userSk)
            });

            it('user (mallory) should not be able to distribute proposal rewards for a satellite (trudy) that did not vote on the proposal', async () => {
                try{
                    
                    // Initial Values
                    governanceStorage   = await governanceInstance.storage()
                    const proposalId    = firstReferenceProposalId;
                    const proposal      = await governanceStorage.proposalLedger.get(proposalId);

                    // Operation
                    await chai.expect(governanceInstance.methods.distributeProposalRewards(satelliteThree, [proposalId]).send()).to.be.rejected;

                    // Assertion
                    assert.equal(proposal.rewardClaimReady, true);

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('user (mallory) should not be able to distribute proposal rewards for a satellite (trudy) if the reward cannot be claimed yet', async () => {
                try{

                    // Initial Values
                    governanceStorage                   = await governanceInstance.storage()
                    const proposalId                    = governanceStorage.nextProposalId.toNumber();
                    const firstProposalName             = "New Proposal #1";
                    const firstProposalDesc             = "Details about new proposal #1";
                    const firstProposalIpfs             = "ipfs://QM123456789";
                    const firstProposalSourceCode       = "Proposal Source Code";

                    // Propose a new proposal 
                    await signerFactory(tezos, satelliteOneSk)
                    const proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send({amount: proposalSubmissionFeeMumav, mumav: true});
                    await proposeOperation.confirmation();

                    // Operation
                    await signerFactory(tezos, userSk)
                    await chai.expect(governanceInstance.methods.distributeProposalRewards(satelliteThree, [proposalId]).send()).to.be.rejected;

                    // Final values
                    governanceStorage                   = await governanceInstance.storage()
                    const proposal                      = await governanceStorage.proposalLedger.get(proposalId);

                    // Assertion
                    assert.equal(proposal.rewardClaimReady, false);

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('user (mallory) should not be able to distribute rewards to a satellite for repeated identical proposal ids', async () => {
                try{

                    // Initial Values
                    governanceStorage                   = await governanceInstance.storage();
                    delegationStorage                   = await delegationInstance.storage();
                    const satelliteRewardsBegin         = await delegationStorage.satelliteRewardsLedger.get(eve.pkh);
                    const proposalId                    = firstReferenceProposalId;
                    const proposal                      = await governanceStorage.proposalLedger.get(proposalId);
                    const claimTraceBegin               = await governanceStorage.proposalRewards.get({
                        0: proposalId,
                        1: eve.pkh
                    })

                    // Operation
                    let claimOperation    = await governanceInstance.methods.distributeProposalRewards(eve.pkh, [proposalId, proposalId]);
                    await chai.expect(claimOperation.send()).to.be.rejected;

                    claimOperation    = await governanceInstance.methods.distributeProposalRewards(eve.pkh, [proposalId, proposalId, proposalId]);
                    await chai.expect(claimOperation.send()).to.be.rejected;

                    // Final values
                    // governanceStorage               = await governanceInstance.storage();
                    // delegationStorage               = await delegationInstance.storage();
                    // const satelliteRewardsEnd       = await delegationStorage.satelliteRewardsLedger.get(eve.pkh);
                    // const claimTraceEnd             = await governanceStorage.proposalRewards.get({
                    //     0: proposalId,
                    //     1: eve.pkh
                    // })

                    // Log
                    // console.log("Satellite rewards before claim:", satelliteRewardsBegin);
                    // console.log("Satellite rewards after claim:", satelliteRewardsEnd);

                    // Assertion
                    // assert.equal(proposal.rewardClaimReady, true);
                    // assert.strictEqual(claimTraceBegin, undefined);
                    // assert.notStrictEqual(claimTraceEnd, undefined);
                    // assert.notEqual(satelliteRewardsBegin.unpaid.toNumber(), satelliteRewardsEnd.unpaid.toNumber());

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('user (mallory) should be able to distribute rewards to a satellite for a given proposal', async () => {
                try{

                    // Initial Values
                    governanceStorage                   = await governanceInstance.storage();
                    delegationStorage                   = await delegationInstance.storage();
                    const satelliteRewardsBegin         = await delegationStorage.satelliteRewardsLedger.get(eve.pkh);
                    const proposalId                    = firstReferenceProposalId;
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

            it('user (mallory) should not be able to distribute rewards to a satellite for a given proposal if it has already been distributed', async () => {
                try{
                
                    // Initial Values
                    governanceStorage         = await governanceInstance.storage();
                    delegationStorage         = await delegationInstance.storage();
                    const proposalId          = firstReferenceProposalId;
                    const proposal            = await governanceStorage.proposalLedger.get(proposalId);
                    const claimTraceBegin     = await governanceStorage.proposalRewards.get({
                        0: proposalId,
                        1: eve.pkh
                    })

                    // Operation
                    await chai.expect(governanceInstance.methods.distributeProposalRewards(satelliteOne, [proposalId]).send()).to.be.rejected;

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

        beforeEach("Set signer to satellite (eve)", async () => {
            
            await signerFactory(tezos, satelliteOneSk)
        });

        describe("%startNextRound", async () => {
            it('satellite (eve) should not be able to start the next round if the current round has not ended', async () => {
                try{

                    // Initial Values
                    governanceStorage = await governanceInstance.storage();

                    // Update config
                    await signerFactory(tezos, adminSk);
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

            beforeEach("Set signer to satellite (eve)", async () => {
                await signerFactory(tezos, satelliteOneSk)
            });

            it('satellite (eve) should not be able to create a new proposal if it has already created the maximum number of proposals this cycle', async () => {
                try{

                    governanceStorage       = await governanceInstance.storage();
                    const initialConfig     = governanceStorage.config;                    

                    // Update config
                    await signerFactory(tezos, adminSk);
                    var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configMaxProposalsPerSatellite").send();
                    await updateConfigOperation.confirmation();

                    // Initial Values
                    await signerFactory(tezos, satelliteOneSk)
                    governanceStorage               = await governanceInstance.storage();
                    var currentCycleInfoRound       = governanceStorage.currentCycleInfo.round
                    var currentCycleInfoRoundString = Object.keys(currentCycleInfoRound)[0]

                    // Operation
                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();

                        governanceStorage               = await governanceInstance.storage();
                        currentCycleInfoRound           = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString     = Object.keys(currentCycleInfoRound)[0]
                    }

                    const firstProposalName          = "New Proposal #1";
                    const firstProposalDesc          = "Details about new proposal #1";
                    const firstProposalIpfs          = "ipfs://QM123456789";
                    const firstProposalSourceCode    = "Proposal Source Code";

                    // Create first proposal operation
                    const createFirstProposalOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send({amount: proposalSubmissionFeeMumav, mumav: true});
                    await createFirstProposalOperation.confirmation();

                    // Create second proposal operation - fail as max proposal is one
                    await chai.expect(governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send({amount: proposalSubmissionFeeMumav, mumav: true})).to.be.rejected; 

                    // rest config back to initial values
                    await signerFactory(tezos, adminSk);
                    updateConfigOperation = await governanceInstance.methods.updateConfig(initialConfig.maxProposalsPerSatellite, "configMaxProposalsPerSatellite").send();
                    await updateConfigOperation.confirmation();

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('new satellite (baker) should not be able to create a new proposal if it registered during the current cycle', async () => {
                try{
                    // Initial Values
                    governanceStorage                   = await governanceInstance.storage();
                    var currentCycleInfoRound           = governanceStorage.currentCycleInfo.round
                    var currentCycleInfoRoundString     = Object.keys(currentCycleInfoRound)[0]
                    var currentCycle                    = governanceStorage.cycleId;

                    // Operation
                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();

                        governanceStorage               = await governanceInstance.storage();
                        currentCycleInfoRound           = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString     = Object.keys(currentCycleInfoRound)[0]
                    }
                    const firstProposalName         = "New Proposal #1";
                    const firstProposalDesc         = "Details about new proposal #1";
                    const firstProposalIpfs         = "ipfs://QM123456789";
                    const firstProposalSourceCode   = "Proposal Source Code";

                    const newSatellite              = baker.pkh;
                    const newSatelliteSk            = baker.sk;

                    const preregisteringSnapshot    = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: newSatellite})

                    // set signer to new satellite (baker)
                    await signerFactory(tezos, newSatelliteSk);

                    delegationStorage                = await delegationInstance.storage();
                    doormanStorage                   = await doormanInstance.storage();
                    initialSatelliteRecord           = await delegationStorage.satelliteLedger.get(newSatellite);         

                    initialMinimumStakedMvnRequirement  = delegationStorage.config.minimumStakedMvnBalance;
                    initialUserStakedRecord             = await doormanStorage.userStakeBalanceLedger.get(newSatellite);
                    initialUserStakedBalance            = initialUserStakedRecord === undefined ? 0 : initialUserStakedRecord.balance.toNumber()

                    // check that user has sufficient staked balance
                    if(initialUserStakedBalance < initialMinimumStakedMvnRequirement){

                        stakeAmount = Math.abs(initialUserStakedBalance - initialMinimumStakedMvnRequirement) + 1;

                        // update operators operation for user
                        updateOperatorsOperation = await updateOperators(mvnTokenInstance, newSatellite, doormanAddress, tokenId);
                        await updateOperatorsOperation.confirmation();

                        // user stake MVN tokens
                        stakeOperation = await doormanInstance.methods.stakeMvn(stakeAmount).send();
                        await stakeOperation.confirmation();

                    }; 

                    // update user staked balance for assertion check below (satellite's staked mvn balance)
                    doormanStorage                      = await doormanInstance.storage();
                    initialUserStakedRecord             = await doormanStorage.userStakeBalanceLedger.get(newSatellite);
                    initialUserStakedBalance            = initialUserStakedRecord.balance.toNumber();

                    // if retest: run registerAsSatellite operation if satellite has not been registered yet, and skip for subsequent retesting
                    if(initialSatelliteRecord == null){

                        // user registers as a satellite
                        registerAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite(
                            mockSatelliteData.eve.name, 
                            mockSatelliteData.eve.desc, 
                            mockSatelliteData.eve.image, 
                            mockSatelliteData.eve.website,
                            mockSatelliteData.eve.satelliteFee,
                            mockSatelliteData.eve.oraclePublicKey,
                            mockSatelliteData.eve.oraclePeerId
                        ).send();
                        await registerAsSatelliteOperation.confirmation();

                        // check state after registering as satellite
                        delegationStorage               = await delegationInstance.storage();
                        updatedSatelliteRecord          = await delegationStorage.satelliteLedger.get(newSatellite);         
                        
                        // check satellite details
                        assert.equal(updatedSatelliteRecord.name,                           mockSatelliteData.eve.name);
                        assert.equal(updatedSatelliteRecord.description,                    mockSatelliteData.eve.desc);
                        assert.equal(updatedSatelliteRecord.website,                        mockSatelliteData.eve.website);
                        assert.equal(updatedSatelliteRecord.stakedMvnBalance.toNumber(),    initialUserStakedBalance);
                        assert.equal(updatedSatelliteRecord.satelliteFee,                   mockSatelliteData.eve.satelliteFee);
                        assert.equal(updatedSatelliteRecord.totalDelegatedAmount,           0);
                        assert.equal(updatedSatelliteRecord.status,                         "ACTIVE");
                    }


                    // Post registering values
                    governanceStorage               = await governanceInstance.storage();
                    currentCycle                    = governanceStorage.cycleId;
                    const postregisteringSnapshot   = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: newSatellite})

                    // Operation
                    await chai.expect(governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send({amount: proposalSubmissionFeeMumav, mumav: true})).to.be.rejected; 

                    // Assertions
                    assert.strictEqual(preregisteringSnapshot, undefined);
                    assert.notStrictEqual(postregisteringSnapshot, undefined);
                    assert.strictEqual(postregisteringSnapshot.ready, false);

                    // remove baker as a satellite (unregisters as a satellite)
                    const unregisterAsSatelliteOperation = await delegationInstance.methods.unregisterAsSatellite(newSatellite).send();
                    await unregisterAsSatelliteOperation.confirmation();

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('satellite (eve) should not be able to create a new proposal if it is not the proposal round', async () => {
                try{

                    governanceStorage                   = await governanceInstance.storage();

                    // Update config
                    await signerFactory(tezos, bob.sk);
                    var updateConfigOperation = await governanceInstance.methods.updateConfig(25,"configMaxProposalsPerSatellite").send();
                    await updateConfigOperation.confirmation();

                    // Initial Values
                    await signerFactory(tezos, eve.sk);
                    governanceStorage           = await governanceInstance.storage();
                    const proposalId            = governanceStorage.nextProposalId; 
                    var currentCycleInfoRound            = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString      = Object.keys(currentCycleInfoRound)[0];

                    // console.log(governanceStorage.currentCycleInfo);
                    // console.log(currentCycleInfoRound);
                    // console.log(currentCycleInfoRoundString);
                    // console.log(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal");

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
                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
								codeDescription: ""
                            },
                        }
                    ]

                    // Operation
                    var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode, proposalData).send({amount: proposalSubmissionFeeMumav, mumav: true});
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
                    await chai.expect(governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send({amount: proposalSubmissionFeeMumav, mumav: true})).to.be.rejected; 

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })
        })

        describe("%updateProposalData", async () => {

            beforeEach("Set signer to satellite", async () => {
                await signerFactory(tezos, satelliteOneSk)
            });

            it(`satellite (eve) should not be able to update a proposal's data if it is not the proposal round`, async () => {
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
                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
								codeDescription: ""
                            },
                        }
                    ]

                    // Operation
                    var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode, proposalData).send({amount: proposalSubmissionFeeMumav, mumav: true});
                    await proposeOperation.confirmation();

                    // Operation
                    const lockProposalOperation  = await governanceInstance.methods.lockProposal(proposalId).send();
                    await lockProposalOperation.confirmation();

                    const proposalRoundVoteOperation = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                    await proposalRoundVoteOperation.confirmation();

                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    governanceStorage               = await governanceInstance.storage();
                    var currentCycleInfoRound       = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString = Object.keys(currentCycleInfoRound)[0];

                    assert.strictEqual(currentCycleInfoRoundString, "voting");

                    // Operation
                    await chai.expect(governanceInstance.methods.updateProposalData(proposalId, [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
								codeDescription: ""
                            },
                        }
                    ]).send()).to.be.rejected; 

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it(`satellite (eve) should not be able to update a proposal's data if the proposal is locked`, async () => {
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
                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
								codeDescription: ""
                            },
                        }
                    ]

                    // Operation
                    var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode, proposalData).send({amount: proposalSubmissionFeeMumav, mumav: true});
                    await proposeOperation.confirmation();

                    const lockOperation = await governanceInstance.methods.lockProposal(proposalId).send();
                    await lockOperation.confirmation();

                    // Test
                    // Operation
                    await chai.expect(governanceInstance.methods.updateProposalData(proposalId, [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
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
                await signerFactory(tezos, satelliteOneSk)
            });

            it('satellite (eve) should not be able to lock a proposal if it is no longer the proposal round', async () => {
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
                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
								codeDescription: ""
                            },
                        }
                    ]

                    // Operation
                    var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode, proposalData).send({amount: proposalSubmissionFeeMumav, mumav: true});
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

            it('satellite (eve) should not be able to call %proposalRoundVote if it is no longer the proposal round', async () => {
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
                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
								codeDescription: ""
                            },
                        }
                    ]

                    // Operation
                    var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode, proposalData).send({amount: proposalSubmissionFeeMumav, mumav: true});
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

            it('satellite should not be able increase its total voting power during the current round', async () => {
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
                    const firstProposalName          = "Test Voting Power change";
                    const firstProposalDesc          = "Details about new proposal #1";
                    const firstProposalIpfs          = "ipfs://QM123456789";
                    const firstProposalSourceCode    = "Proposal Source Code";

                    // Pre increase values
                    governanceStorage                   = await governanceInstance.storage();
                    doormanStorage                      = await doormanInstance.storage();
                    delegationStorage                   = await delegationInstance.storage();
                    var currentCycle                    = governanceStorage.cycleId;

                    // compound satellite one to create snapshot
                    await signerFactory(tezos, satelliteOneSk);
                    var compoundOperation = await doormanInstance.methods.compound([satelliteOne]).send();
                    await compoundOperation.confirmation();

                    const preIncreaseSnapshot           = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteOne})
                    const preIncreaseUserSMVN           = (await doormanStorage.userStakeBalanceLedger.get(satelliteOne)).balance.toNumber();
                    const preIncreaseSatellite          = await delegationStorage.satelliteLedger.get(satelliteOne);

                    // satellite increases her stake
                    var stakeOperation = await doormanInstance.methods.stakeMvn(MVN(3)).send()
                    await stakeOperation.confirmation();

                    // User (mallory) delegates to satellite
                    await signerFactory(tezos, mallory.sk)
                    var updateOperatorsOperation = await updateOperators(mvnTokenInstance, mallory.pkh, satelliteOne, tokenId);
                    await updateOperatorsOperation.confirmation();

                    var delegateOperation = await delegationInstance.methods.delegateToSatellite(mallory.pkh, satelliteOne).send()
                    await delegateOperation.confirmation()

                    // Post staking values
                    governanceStorage                   = await governanceInstance.storage();
                    doormanStorage                      = await doormanInstance.storage();
                    currentCycle                        = governanceStorage.cycleId;

                    // add proposal data
                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
								codeDescription: ""
                            },
                        }
                    ]

                    // Operation
                    await signerFactory(tezos, satelliteOneSk)
                    var proposeOperation                = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode, proposalData).send({amount: proposalSubmissionFeeMumav, mumav: true});
                    await proposeOperation.confirmation();

                    const lockProposalOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                    await lockProposalOperation.confirmation();

                    const voteOperation                 = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                    await voteOperation.confirmation();

                    // Final values
                    governanceStorage                   = await governanceInstance.storage();
                    const proposal                      = await governanceStorage.proposalLedger.get(proposalId);
                    const postIncreaseSnapshot          = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: eve.pkh})
                    const postIncreaseUserSMVN          = (await doormanStorage.userStakeBalanceLedger.get(eve.pkh)).balance.toNumber();
                    const postIncreaseSatellite         = await delegationStorage.satelliteLedger.get(eve.pkh);
                    
                    // console.log("BALANCE:", preIncreaseSatellite)
                    // console.log("BALANCE2:", postIncreaseSatellite)

                    // Assertions
                    assert.notEqual(postIncreaseUserSMVN, preIncreaseUserSMVN);
                    assert.notEqual(postIncreaseSatellite.stakedMvnBalance.toNumber(), preIncreaseSatellite.stakedMvnBalance.toNumber());
                    assert.notEqual(postIncreaseSatellite.totalDelegatedAmount.toNumber(), preIncreaseSatellite.totalDelegatedAmount.toNumber());
                    assert.equal(postIncreaseSnapshot.totalStakedMvnBalance.toNumber(), preIncreaseSnapshot.totalStakedMvnBalance.toNumber())
                    assert.equal(postIncreaseSnapshot.totalDelegatedAmount.toNumber(), preIncreaseSnapshot.totalDelegatedAmount.toNumber())
                    assert.equal(postIncreaseSnapshot.totalVotingPower.toNumber(), preIncreaseSnapshot.totalVotingPower.toNumber())
                    assert.equal(proposal.proposalVoteStakedMvnTotal.toNumber(), postIncreaseSnapshot.totalVotingPower.toNumber())

                    // Reset delegate 
                    // User (mallory) redelegates to satellite two (alice)
                    await signerFactory(tezos, mallory.sk)
                    updateOperatorsOperation = await updateOperators(mvnTokenInstance, mallory.pkh, satelliteTwo, tokenId);
                    await updateOperatorsOperation.confirmation();

                    delegateOperation = await delegationInstance.methods.delegateToSatellite(mallory.pkh, satelliteTwo).send()
                    await delegateOperation.confirmation()

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('satellite (eve) should not be able to call %proposalRoundVote if the proposal was dropped', async () => {
                try{
                    
                    // Initial Values
                    governanceStorage               = await governanceInstance.storage();
                    const proposalId                = governanceStorage.nextProposalId; 
                    var currentCycleInfoRound       = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString = Object.keys(currentCycleInfoRound)[0];

                    // Operation
                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();

                        governanceStorage               = await governanceInstance.storage();
                        currentCycleInfoRound           = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString     = Object.keys(currentCycleInfoRound)[0]
                    }
                    const firstProposalName          = "New Proposal #1";
                    const firstProposalDesc          = "Details about new proposal #1";
                    const firstProposalIpfs          = "ipfs://QM123456789";
                    const firstProposalSourceCode    = "Proposal Source Code";

                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
								codeDescription: ""
                            },
                        }
                    ]

                    // Operation
                    var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode, proposalData).send({amount: proposalSubmissionFeeMumav, mumav: true});
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

            it('satellite (eve) should not be able to call %proposalRoundVote if the proposal is not in the current round', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage();
                    const proposalId            = 1;
                    var currentCycleInfoRound            = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString      = Object.keys(currentCycleInfoRound)[0];

                    // Operation
                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation     = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();
                        governanceStorage               = await governanceInstance.storage();
                        currentCycleInfoRound           = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString     = Object.keys(currentCycleInfoRound)[0]
                    }

                    // Operation
                    await chai.expect(governanceInstance.methods.proposalRoundVote(proposalId).send()).to.be.rejected;

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('satellite (eve) should not be able to call %proposalRoundVote if the proposal was already executed', async () => {
                try{

                    // UpdateConfig
                    await signerFactory(tezos, adminSk)
                    var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configMinProposalRoundVotePct").send();
                    await updateConfigOperation.confirmation();
                    var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configMinQuorumPercentage").send();
                    await updateConfigOperation.confirmation();
                    var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configMinYayVotePercentage").send();
                    await updateConfigOperation.confirmation();

                    // Initial Values
                    await signerFactory(tezos, satelliteOneSk)
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
                    var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send({amount: proposalSubmissionFeeMumav, mumav: true});
                    await proposeOperation.confirmation();

                    const addDataOperation = await governanceInstance.methods.updateProposalData(proposalId, [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
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
                await signerFactory(tezos, satelliteOneSk)
            });

            it('satellite (eve) should not be able to drop a given proposal if it was already executed', async () => {
                try{
                    
                    // UpdateConfig
                    await signerFactory(tezos, adminSk)
                    var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configMinProposalRoundVotePct").send();
                    await updateConfigOperation.confirmation();
                    var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configMinQuorumPercentage").send();
                    await updateConfigOperation.confirmation();
                    var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configMinYayVotePercentage").send();
                    await updateConfigOperation.confirmation();

                    // Initial Values
                    await signerFactory(tezos, satelliteOneSk)
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
                    var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send({amount: proposalSubmissionFeeMumav, mumav: true});
                    await proposeOperation.confirmation();

                    const addDataOperation = await governanceInstance.methods.updateProposalData(proposalId, [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
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

            it('satellite (eve) should not be able to drop a given proposal if the selected proposal was not created in the current round', async () => {
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
                    var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send({amount: proposalSubmissionFeeMumav, mumav: true});
                    await proposeOperation.confirmation();

                    const addDataOperation = await governanceInstance.methods.updateProposalData(proposalId, [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
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
                    governanceStorage                  = await governanceInstance.storage();
                    var currentCycleInfoRound          = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString    = Object.keys(currentCycleInfoRound)[0];

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

            beforeEach("Set signer to satellite one (eve)", async () => {
                await signerFactory(tezos, satelliteOneSk)
            });
            
            it('satellite (eve) should not be able to call %votingRoundVote if it is not the voting round', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage();
                    var currentCycleInfoRound            = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString      = Object.keys(currentCycleInfoRound)[0];

                    // Operation
                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();
                        
                        governanceStorage               = await governanceInstance.storage();
                        currentCycleInfoRound           = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString     = Object.keys(currentCycleInfoRound)[0]
                    }

                    await chai.expect(governanceInstance.methods.votingRoundVote("yay").send()).to.be.rejected;

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

        })

        describe("%executeProposal", async () => {
            
            beforeEach("Set signer to satellite one (eve)", async () => {
                await signerFactory(tezos, satelliteOneSk)
            });
            
            after("Reset council admin", async () => {
                // Initial Values
                await signerFactory(tezos, satelliteOneSk)
                governanceStorage           = await governanceInstance.storage();
                councilStorage                          = await councilInstance.storage();
                const initCouncilAdmin                  = councilStorage.admin;
                const proposalId            = governanceStorage.nextProposalId; 
                var currentCycleInfoRound            = governanceStorage.currentCycleInfo.round;
                var currentCycleInfoRoundString      = Object.keys(currentCycleInfoRound)[0];

                while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    governanceStorage               = await governanceInstance.storage();
                    currentCycleInfoRound           = governanceStorage.currentCycleInfo.round
                    currentCycleInfoRoundString     = Object.keys(currentCycleInfoRound)[0]
                }
                
                const firstProposalName          = "New Proposal #1";
                const firstProposalDesc          = "Details about new proposal #1";
                const firstProposalIpfs          = "ipfs://QM123456789";
                const firstProposalSourceCode    = "Proposal Source Code";

                // Operation
                var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send({amount: proposalSubmissionFeeMumav, mumav: true});
                await proposeOperation.confirmation();

                // Create a real lambda function to reset the admin
                const lambdaFunction        = await createLambdaBytes(
                    tezos.rpc.url,
                    contractDeployments.governanceProxy.address,
                    
                    'setAdmin',
                    [
                        contractDeployments.council.address,
                        admin
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

                await signerFactory(tezos, satelliteTwoSk)
                votingRoundVoteOperation = await governanceInstance.methods.votingRoundVote("yay").send();
                await votingRoundVoteOperation.confirmation();

                await signerFactory(tezos, satelliteOneSk)

                var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                await startNextRoundOperation.confirmation();

                var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                await startNextRoundOperation.confirmation();

                governanceStorage                   = await governanceInstance.storage();
                councilStorage                      = await councilInstance.storage();
                const finalCouncilAdmin             = councilStorage.admin;
                var currentCycleInfoRound           = governanceStorage.currentCycleInfo.round;
                var currentCycleInfoRoundString     = Object.keys(currentCycleInfoRound)[0];
                var proposal                        = await governanceStorage.proposalLedger.get(proposalId);

                assert.strictEqual(currentCycleInfoRoundString, "proposal")
                assert.strictEqual(proposal.executed, true)
                assert.strictEqual(initCouncilAdmin, contractDeployments.governanceProxy.address);
                assert.strictEqual(finalCouncilAdmin, admin);
            });
            
            it('satellite (eve) should be able to execute a proposal automatically when switching from the timelock round to the new round', async () => {
                try{
                    // UpdateConfig
                    await signerFactory(tezos, bob.sk)
                    var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configMinProposalRoundVotePct").send();
                    await updateConfigOperation.confirmation();
                    var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configMinQuorumPercentage").send();
                    await updateConfigOperation.confirmation();
                    var updateConfigOperation = await governanceInstance.methods.updateConfig(1,"configMinYayVotePercentage").send();
                    await updateConfigOperation.confirmation();

                    // Initial Values
                    await signerFactory(tezos, satelliteOneSk)
                    governanceStorage           = await governanceInstance.storage();
                    const proposalId            = governanceStorage.nextProposalId; 
                    var currentCycleInfoRound            = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString      = Object.keys(currentCycleInfoRound)[0];

                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();

                        governanceStorage               = await governanceInstance.storage();
                        currentCycleInfoRound           = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString     = Object.keys(currentCycleInfoRound)[0]
                    }
                    
                    const firstProposalName          = "New Proposal #1";
                    const firstProposalDesc          = "Details about new proposal #1";
                    const firstProposalIpfs          = "ipfs://QM123456789";
                    const firstProposalSourceCode    = "Proposal Source Code";

                    // Operation
                    var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send({amount: proposalSubmissionFeeMumav, mumav: true});
                    await proposeOperation.confirmation();

                    const addDataOperation = await governanceInstance.methods.updateProposalData(proposalId, [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
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

                    await signerFactory(tezos, satelliteTwoSk)
                    votingRoundVoteOperation = await governanceInstance.methods.votingRoundVote("yay").send();
                    await votingRoundVoteOperation.confirmation();

                    await signerFactory(tezos, satelliteOneSk)

                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                    await startNextRoundOperation.confirmation();

                    governanceStorage                   = await governanceInstance.storage();
                    var currentCycleInfoRound           = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString     = Object.keys(currentCycleInfoRound)[0];
                    var proposal                        = await governanceStorage.proposalLedger.get(proposalId);

                    assert.strictEqual(currentCycleInfoRoundString, "proposal")
                    assert.strictEqual(proposal.executed, true)

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })
            
            it('satellite (eve) should be able to execute a non-executed proposal from a previous cycle', async () => {
                try{

                    // Initial Values
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
                    var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send({amount: proposalSubmissionFeeMumav, mumav: true});
                    await proposeOperation.confirmation();

                    var addDataOperation = await governanceInstance.methods.updateProposalData(firstProposalId, [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
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

                    await signerFactory(tezos, satelliteTwoSk)
                    votingRoundVoteOperation = await governanceInstance.methods.votingRoundVote("yay").send();
                    await votingRoundVoteOperation.confirmation();

                    await signerFactory(tezos, satelliteOneSk)

                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(false).send();
                    await startNextRoundOperation.confirmation();

                    var startNextRoundOperation = await governanceInstance.methods.startNextRound(false).send();
                    await startNextRoundOperation.confirmation();

                    // Mid values
                    governanceStorage             = await governanceInstance.storage();
                    const secondProposalId        = governanceStorage.nextProposalId;
                    const midValuesProposal       = await governanceStorage.proposalLedger.get(firstProposalId);

                    // Second cycle operations
                    var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send({amount: proposalSubmissionFeeMumav, mumav: true});
                    await proposeOperation.confirmation();

                    addDataOperation = await governanceInstance.methods.updateProposalData(secondProposalId, [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
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

                    await signerFactory(tezos, satelliteTwoSk)
                    votingRoundVoteOperation = await governanceInstance.methods.votingRoundVote("yay").send();
                    await votingRoundVoteOperation.confirmation();

                    await signerFactory(tezos, satelliteOneSk)
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

            it('satellite (eve) should not be able to call %executeProposal if there is no proposal to execute', async () => {
                try{
                    
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage();
                    const proposalId            = governanceStorage.nextProposalId; 
                    var currentCycleInfoRound            = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString      = Object.keys(currentCycleInfoRound)[0];

                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();

                        governanceStorage               = await governanceInstance.storage();
                        currentCycleInfoRound           = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString     = Object.keys(currentCycleInfoRound)[0]
                    }
                    
                    const firstProposalName          = "New Proposal #1";
                    const firstProposalDesc          = "Details about new proposal #1";
                    const firstProposalIpfs          = "ipfs://QM123456789";
                    const firstProposalSourceCode    = "Proposal Source Code";

                    // Operation
                    var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send({amount: proposalSubmissionFeeMumav, mumav: true});
                    await proposeOperation.confirmation();

                    const addDataOperation = await governanceInstance.methods.updateProposalData(proposalId, [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
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

            it('satellite (eve) should be able to call %executeProposal automatically when switching from the timelock round to the new round', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage();
                    const proposalId            = governanceStorage.nextProposalId; 
                    var currentCycleInfoRound            = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString      = Object.keys(currentCycleInfoRound)[0];

                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();

                        governanceStorage               = await governanceInstance.storage();
                        currentCycleInfoRound           = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString     = Object.keys(currentCycleInfoRound)[0]
                    }
                    
                    const firstProposalName          = "New Proposal #1";
                    const firstProposalDesc          = "Details about new proposal #1";
                    const firstProposalIpfs          = "ipfs://QM123456789";
                    const firstProposalSourceCode    = "Proposal Source Code";

                    // Operation
                    var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send({amount: proposalSubmissionFeeMumav, mumav: true});
                    await proposeOperation.confirmation();

                    const addDataOperation = await governanceInstance.methods.updateProposalData(proposalId, [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
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
                    
                    governanceStorage                   = await governanceInstance.storage();
                    var currentCycleInfoRound           = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString     = Object.keys(currentCycleInfoRound)[0];
                    const proposal                      = await governanceStorage.proposalLedger.get(proposalId);

                    assert.strictEqual(currentCycleInfoRoundString, "proposal")
                    assert.strictEqual(proposal.executed, true)

                    await chai.expect(governanceInstance.methods.executeProposal(proposalId).send()).to.be.rejected;

                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('satellite (eve) should not be able to execute a given proposal if it was dropped', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage();
                    const proposalId            = governanceStorage.nextProposalId; 
                    var currentCycleInfoRound            = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString      = Object.keys(currentCycleInfoRound)[0];

                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();

                        governanceStorage               = await governanceInstance.storage();
                        currentCycleInfoRound           = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString     = Object.keys(currentCycleInfoRound)[0]
                    }
                    
                    const firstProposalName          = "New Proposal #1";
                    const firstProposalDesc          = "Details about new proposal #1";
                    const firstProposalIpfs          = "ipfs://QM123456789";
                    const firstProposalSourceCode    = "Proposal Source Code";

                    // Operation
                    var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send({amount: proposalSubmissionFeeMumav, mumav: true});
                    await proposeOperation.confirmation();

                    const addDataOperation = await governanceInstance.methods.updateProposalData(proposalId, [
                        {
                            addOrSetProposalData: {
                                title: "Data#1",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
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
                    
                    governanceStorage                   = await governanceInstance.storage();
                    var currentCycleInfoRound           = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString     = Object.keys(currentCycleInfoRound)[0];
                    const proposal                      = await governanceStorage.proposalLedger.get(proposalId);

                    assert.strictEqual(currentCycleInfoRoundString, "proposal")
                    assert.strictEqual(proposal.executed, false)
                    assert.strictEqual(proposal.status, "DROPPED")

                    await chai.expect(governanceInstance.methods.executeProposal(proposalId).send()).to.be.rejected;
                    
                } catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('satellite (eve) should not be able to execute a proposal if the proposal data cannot be unpacked', async () => {
                try{
                    // Initial Values
                    governanceStorage           = await governanceInstance.storage();
                    const proposalId            = governanceStorage.nextProposalId; 
                    var currentCycleInfoRound            = governanceStorage.currentCycleInfo.round;
                    var currentCycleInfoRoundString      = Object.keys(currentCycleInfoRound)[0];

                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();
                        governanceStorage               = await governanceInstance.storage();
                        currentCycleInfoRound           = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString     = Object.keys(currentCycleInfoRound)[0]
                    }
                    
                    const firstProposalName          = "New Proposal #1";
                    const firstProposalDesc          = "Details about new proposal #1";
                    const firstProposalIpfs          = "ipfs://QM123456789";
                    const firstProposalSourceCode    = "Proposal Source Code";

                    // Operation
                    var proposeOperation = await governanceInstance.methods.propose(firstProposalName, firstProposalDesc, firstProposalIpfs, firstProposalSourceCode).send({amount: proposalSubmissionFeeMumav, mumav: true});
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


    describe("Housekeeping Entrypoints", async () => {

        beforeEach("Set signer to admin (bob)", async () => {
            governanceStorage        = await governanceInstance.storage();
            await signerFactory(tezos, bob.sk);
        });

        it('%setAdmin                 - admin (bob) should be able to update the contract admin address', async () => {
            try{
                
                // Initial Values
                governanceStorage   = await governanceInstance.storage();
                const currentAdmin  = governanceStorage.admin;

                // Operation
                setAdminOperation   = await governanceInstance.methods.setAdmin(alice.pkh).send();
                await setAdminOperation.confirmation();

                // Final values
                governanceStorage   = await governanceInstance.storage();
                const newAdmin      = governanceStorage.admin;

                // Assertions
                assert.notStrictEqual(newAdmin, currentAdmin);
                assert.strictEqual(newAdmin, alice.pkh);
                assert.strictEqual(currentAdmin, bob.pkh);

                // reset admin
                await signerFactory(tezos, alice.sk);
                resetAdminOperation = await governanceInstance.methods.setAdmin(bob.pkh).send();
                await resetAdminOperation.confirmation();

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%setGovernance            - admin (bob) should be able to update the contract governance address', async () => {
            try{
                
                // Initial Values
                governanceStorage            = await governanceInstance.storage();
                const currentGovernanceProxy = governanceStorage.governanceProxyAddress;

                // Operation
                var setGovernanceProxyOperation = await governanceInstance.methods.setGovernanceProxy(alice.pkh).send();
                await setGovernanceProxyOperation.confirmation();

                // Final values
                governanceStorage       = await governanceInstance.storage();
                const updatedGovernanceProxy = governanceStorage.governanceProxyAddress;

                // reset governance
                setGovernanceProxyOperation = await governanceInstance.methods.setGovernanceProxy(contractDeployments.governanceProxy.address).send();
                await setGovernanceProxyOperation.confirmation();

                // Assertions
                assert.notStrictEqual(updatedGovernanceProxy, currentGovernanceProxy);
                assert.strictEqual(updatedGovernanceProxy, alice.pkh);
                assert.strictEqual(currentGovernanceProxy, contractDeployments.governanceProxy.address);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%updateMetadata           - admin (bob) should be able to update the contract metadata', async () => {
            try{
                // Initial values
                const key   = ''
                const hash  = Buffer.from('mavryk-storage:data', 'ascii').toString('hex')

                // Operation
                const updateOperation = await governanceInstance.methods.updateMetadata(key, hash).send();
                await updateOperation.confirmation();

                // Final values
                governanceStorage       = await governanceInstance.storage();            

                const updatedData       = await governanceStorage.metadata.get(key);
                assert.equal(hash, updatedData);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('%updateConfig             - admin (bob) should be able to update contract configs', async () => {
            try{
                
                // Initial Values
                governanceStorage       = await governanceInstance.storage();
                const initialConfig     = governanceStorage.config;

                const zeroTestValue  = 0;
                const lowTestValue   = 1000;

                // update config operations
                var updateConfigOperation = await governanceInstance.methods.updateConfig(lowTestValue, "configSuccessReward").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await governanceInstance.methods.updateConfig(lowTestValue, "configCycleVotersReward").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await governanceInstance.methods.updateConfig(lowTestValue, "configMinProposalRoundVotePct").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await governanceInstance.methods.updateConfig(lowTestValue, "configMinQuorumPercentage").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await governanceInstance.methods.updateConfig(lowTestValue, "configMinYayVotePercentage").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await governanceInstance.methods.updateConfig(lowTestValue, "configProposeFeeMumav").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await governanceInstance.methods.updateConfig(lowTestValue, "configMaxProposalsPerSatellite").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await governanceInstance.methods.updateConfig(zeroTestValue, "configBlocksPerProposalRound").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await governanceInstance.methods.updateConfig(zeroTestValue, "configBlocksPerVotingRound").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await governanceInstance.methods.updateConfig(zeroTestValue, "configBlocksPerTimelockRound").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await governanceInstance.methods.updateConfig(lowTestValue, "configDataTitleMaxLength").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await governanceInstance.methods.updateConfig(lowTestValue, "configProposalTitleMaxLength").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await governanceInstance.methods.updateConfig(lowTestValue, "configProposalDescMaxLength").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await governanceInstance.methods.updateConfig(lowTestValue, "configProposalInvoiceMaxLength").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await governanceInstance.methods.updateConfig(lowTestValue, "configProposalCodeMaxLength").send();
                await updateConfigOperation.confirmation();

                // update storage
                governanceStorage        = await governanceInstance.storage();
                const updatedConfig      = governanceStorage.config;

                // Assertions
                assert.equal(updatedConfig.successReward                        , lowTestValue);
                assert.equal(updatedConfig.cycleVotersReward                    , lowTestValue);
                assert.equal(updatedConfig.minProposalRoundVotePercentage       , lowTestValue);
                assert.equal(updatedConfig.minQuorumPercentage                  , lowTestValue);
                assert.equal(updatedConfig.minYayVotePercentage                 , lowTestValue);
                assert.equal(updatedConfig.proposalSubmissionFeeMumav           , lowTestValue);
                assert.equal(updatedConfig.maxProposalsPerSatellite             , lowTestValue);

                assert.equal(updatedConfig.blocksPerProposalRound               , zeroTestValue);
                assert.equal(updatedConfig.blocksPerVotingRound                 , zeroTestValue);
                assert.equal(updatedConfig.blocksPerTimelockRound               , zeroTestValue);

                assert.equal(updatedConfig.proposalDataTitleMaxLength           , lowTestValue);
                assert.equal(updatedConfig.proposalTitleMaxLength               , lowTestValue);
                assert.equal(updatedConfig.proposalDescriptionMaxLength         , lowTestValue);
                assert.equal(updatedConfig.proposalInvoiceMaxLength             , lowTestValue);
                assert.equal(updatedConfig.proposalSourceCodeMaxLength          , lowTestValue);


                // reset config operation back to initial values
                var resetConfigOperation = await governanceInstance.methods.updateConfig(initialConfig.successReward, "configSuccessReward").send();
                await resetConfigOperation.confirmation();

                resetConfigOperation = await governanceInstance.methods.updateConfig(initialConfig.cycleVotersReward, "configCycleVotersReward").send();
                await resetConfigOperation.confirmation();
                
                resetConfigOperation = await governanceInstance.methods.updateConfig(initialConfig.minProposalRoundVotePercentage, "configMinProposalRoundVotePct").send();
                await resetConfigOperation.confirmation();

                resetConfigOperation = await governanceInstance.methods.updateConfig(initialConfig.minQuorumPercentage, "configMinQuorumPercentage").send();
                await resetConfigOperation.confirmation();

                resetConfigOperation = await governanceInstance.methods.updateConfig(initialConfig.minYayVotePercentage, "configMinYayVotePercentage").send();
                await resetConfigOperation.confirmation();

                resetConfigOperation = await governanceInstance.methods.updateConfig(initialConfig.proposalSubmissionFeeMumav, "configProposeFeeMumav").send();
                await resetConfigOperation.confirmation();

                resetConfigOperation = await governanceInstance.methods.updateConfig(initialConfig.maxProposalsPerSatellite, "configMaxProposalsPerSatellite").send();
                await resetConfigOperation.confirmation();

                resetConfigOperation = await governanceInstance.methods.updateConfig(initialConfig.blocksPerProposalRound, "configBlocksPerProposalRound").send();
                await resetConfigOperation.confirmation();

                resetConfigOperation = await governanceInstance.methods.updateConfig(initialConfig.blocksPerVotingRound, "configBlocksPerVotingRound").send();
                await resetConfigOperation.confirmation();

                resetConfigOperation = await governanceInstance.methods.updateConfig(initialConfig.blocksPerTimelockRound, "configBlocksPerTimelockRound").send();
                await resetConfigOperation.confirmation();

                resetConfigOperation = await governanceInstance.methods.updateConfig(initialConfig.proposalDataTitleMaxLength, "configDataTitleMaxLength").send();
                await resetConfigOperation.confirmation();

                resetConfigOperation = await governanceInstance.methods.updateConfig(initialConfig.proposalTitleMaxLength, "configProposalTitleMaxLength").send();
                await resetConfigOperation.confirmation();

                resetConfigOperation = await governanceInstance.methods.updateConfig(initialConfig.proposalDescriptionMaxLength, "configProposalDescMaxLength").send();
                await resetConfigOperation.confirmation();

                resetConfigOperation = await governanceInstance.methods.updateConfig(initialConfig.proposalInvoiceMaxLength, "configProposalInvoiceMaxLength").send();
                await resetConfigOperation.confirmation();

                resetConfigOperation = await governanceInstance.methods.updateConfig(initialConfig.proposalSourceCodeMaxLength, "configProposalCodeMaxLength").send();
                await resetConfigOperation.confirmation();

                // update storage
                governanceStorage  = await governanceInstance.storage();
                const resetConfig           = governanceStorage.config;

                assert.equal(resetConfig.successReward.toNumber(),                      initialConfig.successReward.toNumber());
                assert.equal(resetConfig.cycleVotersReward.toNumber(),                  initialConfig.cycleVotersReward.toNumber());
                assert.equal(resetConfig.minProposalRoundVotePercentage.toNumber(),     initialConfig.minProposalRoundVotePercentage.toNumber());
                assert.equal(resetConfig.minQuorumPercentage.toNumber(),                initialConfig.minQuorumPercentage.toNumber());
                assert.equal(resetConfig.minYayVotePercentage.toNumber(),               initialConfig.minYayVotePercentage.toNumber());
                assert.equal(resetConfig.proposalSubmissionFeeMumav.toNumber(),         initialConfig.proposalSubmissionFeeMumav.toNumber());
                assert.equal(resetConfig.maxProposalsPerSatellite.toNumber(),           initialConfig.maxProposalsPerSatellite.toNumber());

                assert.equal(resetConfig.blocksPerProposalRound.toNumber(),             initialConfig.blocksPerProposalRound.toNumber());
                assert.equal(resetConfig.blocksPerVotingRound.toNumber(),               initialConfig.blocksPerVotingRound.toNumber());
                assert.equal(resetConfig.blocksPerTimelockRound.toNumber(),             initialConfig.blocksPerTimelockRound.toNumber());

                assert.equal(resetConfig.proposalDataTitleMaxLength.toNumber(),         initialConfig.proposalDataTitleMaxLength.toNumber());
                assert.equal(resetConfig.proposalTitleMaxLength.toNumber(),             initialConfig.proposalTitleMaxLength.toNumber());
                assert.equal(resetConfig.proposalDescriptionMaxLength.toNumber(),       initialConfig.proposalDescriptionMaxLength.toNumber());
                assert.equal(resetConfig.proposalInvoiceMaxLength.toNumber(),           initialConfig.proposalInvoiceMaxLength.toNumber());
                assert.equal(resetConfig.proposalSourceCodeMaxLength.toNumber(),        initialConfig.proposalSourceCodeMaxLength.toNumber());

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('%updateConfig             - admin (bob) should not be able to update percentage configs beyond 100%', async () => {
            try{
                
                // Initial Values
                governanceStorage       = await governanceInstance.storage();
                const initialConfig     = governanceStorage.config;
                const highTestValue     = 10001;

                // Operation
                var updateConfigOperation = await governanceInstance.methods.updateConfig(highTestValue, "configMinProposalRoundVotePct");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = await governanceInstance.methods.updateConfig(highTestValue, "configMinQuorumPercentage");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = await governanceInstance.methods.updateConfig(highTestValue, "configMinYayVotePercentage");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                // Final values
                governanceStorage        = await governanceInstance.storage();
                const updatedConfig      = governanceStorage.config;

                // check that there is no change in config values
                assert.equal(updatedConfig.minProposalRoundVotePercentage.toNumber()       , initialConfig.minProposalRoundVotePercentage.toNumber());
                assert.equal(updatedConfig.minQuorumPercentage.toNumber()                  , initialConfig.minQuorumPercentage.toNumber());
                assert.equal(updatedConfig.minYayVotePercentage.toNumber()                 , initialConfig.minYayVotePercentage.toNumber());
                
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('%updateConfig             - admin (bob) should not be able to update blockPerRound configs beyond the max round duration', async () => {
            try{
                
                // Initial Values
                governanceStorage       = await governanceInstance.storage();
                const initialConfig     = governanceStorage.config;
                const highTestValue     = 1000000000;

                // Operation
                var updateConfigOperation = await governanceInstance.methods.updateConfig(highTestValue, "configBlocksPerProposalRound");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = await governanceInstance.methods.updateConfig(highTestValue, "configBlocksPerVotingRound");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = await governanceInstance.methods.updateConfig(highTestValue, "configBlocksPerTimelockRound");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                // Final values
                governanceStorage        = await governanceInstance.storage();
                const updatedConfig      = governanceStorage.config;

                // check that there is no change in config values
                assert.equal(updatedConfig.blocksPerProposalRound.toNumber()       , initialConfig.blocksPerProposalRound.toNumber());
                assert.equal(updatedConfig.blocksPerVotingRound.toNumber()         , initialConfig.blocksPerVotingRound.toNumber());
                assert.equal(updatedConfig.blocksPerTimelockRound.toNumber()       , initialConfig.blocksPerTimelockRound.toNumber());
                
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%updateWhitelistContracts - admin (bob) should be able to add user (eve) to the Whitelisted Contracts map', async () => {
            try {

                // init values
                contractMapKey  = eve.pkh;
                storageMap      = "whitelistContracts";

                initialContractMapValue           = await getStorageMapValue(governanceStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await updateWhitelistContracts(governanceInstance, contractMapKey, 'update');
                await updateWhitelistContractsOperation.confirmation()

                governanceStorage = await governanceInstance.storage()
                updatedContractMapValue = await getStorageMapValue(governanceStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'Eve (key) should not be in the Whitelist Contracts map before adding her to it')
                assert.notStrictEqual(updatedContractMapValue, undefined,  'Eve (key) should be in the Whitelist Contracts map after adding her to it')

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%updateWhitelistContracts - admin (bob) should be able to remove user (eve) from the Whitelisted Contracts map', async () => {
            try {

                // init values
                contractMapKey  = eve.pkh;
                storageMap      = "whitelistContracts";

                initialContractMapValue = await getStorageMapValue(governanceStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await updateWhitelistContracts(governanceInstance, contractMapKey, 'remove');
                await updateWhitelistContractsOperation.confirmation()

                governanceStorage = await governanceInstance.storage()
                updatedContractMapValue = await getStorageMapValue(governanceStorage, storageMap, contractMapKey);

                assert.notStrictEqual(initialContractMapValue, undefined, 'Eve (key) should be in the Whitelist Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, undefined, 'Eve (key) should not be in the Whitelist Contracts map after adding her to it');

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%updateGeneralContracts   - admin (bob) should be able to add user (eve) to the General Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "generalContracts";

                initialContractMapValue = await getStorageMapValue(governanceStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await updateGeneralContracts(governanceInstance, contractMapKey, eve.pkh, 'update');
                await updateGeneralContractsOperation.confirmation()

                governanceStorage = await governanceInstance.storage()
                updatedContractMapValue = await getStorageMapValue(governanceStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'eve (key) should not be in the General Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, eve.pkh, 'eve (key) should be in the General Contracts map after adding her to it');

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%updateGeneralContracts   - admin (bob) should be able to remove user (eve) from the General Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "generalContracts";

                initialContractMapValue = await getStorageMapValue(governanceStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await updateGeneralContracts(governanceInstance, contractMapKey, eve.pkh, 'remove');
                await updateGeneralContractsOperation.confirmation()

                governanceStorage = await governanceInstance.storage()
                updatedContractMapValue = await getStorageMapValue(governanceStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, eve.pkh, 'eve (key) should be in the General Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, undefined, 'eve (key) should not be in the General Contracts map after adding her to it');

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%mistakenTransfer         - admin (bob) should be able to call this entrypoint for mock FA2 tokens', async () => {
            try {

                // Initial values
                const tokenAmount = 10;
                user              = mallory.pkh;
                userSk            = mallory.sk;

                // Mistaken Operation - user (mallory) send 10 MavenFa2Tokens to MVN Token Contract
                await signerFactory(tezos, userSk);
                transferOperation = await fa2Transfer(mavenFa2TokenInstance, user, governanceAddress, tokenId, tokenAmount);
                await transferOperation.confirmation();
                
                mavenFa2TokenStorage       = await mavenFa2TokenInstance.storage();
                const initialUserBalance    = (await mavenFa2TokenStorage.ledger.get(user)).toNumber()

                await signerFactory(tezos, bob.sk);
                mistakenTransferOperation = await mistakenTransferFa2Token(governanceInstance, user, contractDeployments.mavenFa2Token.address, tokenId, tokenAmount).send();
                await mistakenTransferOperation.confirmation();

                mavenFa2TokenStorage       = await mavenFa2TokenInstance.storage();
                const updatedUserBalance    = (await mavenFa2TokenStorage.ledger.get(user)).toNumber();

                // increase in updated balance
                assert.equal(updatedUserBalance, initialUserBalance + tokenAmount);

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

    });



    describe('Access Control Checks', function () {

        beforeEach("Set signer to non-admin (mallory)", async () => {
            governanceStorage = await governanceInstance.storage();
            await signerFactory(tezos, mallory.sk);
        });

        it('%setAdmin                 - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                governanceStorage   = await governanceInstance.storage();
                const currentAdmin  = governanceStorage.admin;

                // Operation
                setAdminOperation = await governanceInstance.methods.setAdmin(mallory.pkh);
                await chai.expect(setAdminOperation.send()).to.be.rejected;

                // Final values
                governanceStorage    = await governanceInstance.storage();
                const newAdmin  = governanceStorage.admin;

                // Assertions
                assert.strictEqual(newAdmin, currentAdmin);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%setGovernanceProxy       - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                governanceStorage               = await governanceInstance.storage();
                const currentGovernanceProxy    = governanceStorage.governanceProxyAddress;

                // Operation
                const setGovernanceProxyOperation = await governanceInstance.methods.setGovernanceProxy(mallory.pkh);
                await chai.expect(setGovernanceProxyOperation.send()).to.be.rejected;

                // Final values
                governanceStorage               = await governanceInstance.storage();
                const updatedGovernanceProxy    = governanceStorage.governanceProxyAddress;

                // Assertions
                assert.strictEqual(updatedGovernanceProxy, currentGovernanceProxy);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%updateMetadata           - non-admin (mallory) should not be able to update the contract metadata', async () => {
            try{
                // Initial values
                const key   = ''
                const hash  = Buffer.from('mavryk-storage:data fail', 'ascii').toString('hex')

                governanceStorage       = await governanceInstance.storage();   
                const initialMetadata   = await governanceStorage.metadata.get(key);

                // Operation
                const updateOperation = await governanceInstance.methods.updateMetadata(key, hash);
                await chai.expect(updateOperation.send()).to.be.rejected;

                // Final values
                governanceStorage       = await governanceInstance.storage();            
                const updatedData       = await governanceStorage.metadata.get(key);

                // check that there is no change in metadata
                assert.equal(updatedData, initialMetadata);
                assert.notEqual(updatedData, hash);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('%updateConfig             - non-admin (admin) should not be able to update contract configs', async () => {
            try{
                
                // Initial Values
                governanceStorage       = await governanceInstance.storage();
                const initialConfig     = governanceStorage.config;

                const zeroTestValue  = 0;
                const lowTestValue   = 1000;

                // update config operations
                var updateConfigOperation = await governanceInstance.methods.updateConfig(lowTestValue, "configSuccessReward");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = await governanceInstance.methods.updateConfig(lowTestValue, "configCycleVotersReward");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = await governanceInstance.methods.updateConfig(lowTestValue, "configMinProposalRoundVotePct");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = await governanceInstance.methods.updateConfig(lowTestValue, "configMinQuorumPercentage");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = await governanceInstance.methods.updateConfig(lowTestValue, "configMinYayVotePercentage");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = await governanceInstance.methods.updateConfig(lowTestValue, "ConfigProposeFeeMumav");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = await governanceInstance.methods.updateConfig(lowTestValue, "configMaxProposalsPerSatellite");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = await governanceInstance.methods.updateConfig(zeroTestValue, "configBlocksPerProposalRound");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = await governanceInstance.methods.updateConfig(zeroTestValue, "configBlocksPerVotingRound");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = await governanceInstance.methods.updateConfig(zeroTestValue, "configBlocksPerTimelockRound");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = await governanceInstance.methods.updateConfig(lowTestValue, "configDataTitleMaxLength");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = await governanceInstance.methods.updateConfig(lowTestValue, "configProposalTitleMaxLength");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = await governanceInstance.methods.updateConfig(lowTestValue, "configProposalDescMaxLength");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = await governanceInstance.methods.updateConfig(lowTestValue, "configProposalInvoiceMaxLength");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = await governanceInstance.methods.updateConfig(lowTestValue, "configProposalCodeMaxLength");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                // update storage
                governanceStorage        = await governanceInstance.storage();
                const updatedConfig      = governanceStorage.config;

                assert.equal(updatedConfig.successReward.toNumber(),                      initialConfig.successReward.toNumber());
                assert.equal(updatedConfig.cycleVotersReward.toNumber(),                  initialConfig.cycleVotersReward.toNumber());
                assert.equal(updatedConfig.minProposalRoundVotePercentage.toNumber(),     initialConfig.minProposalRoundVotePercentage.toNumber());
                assert.equal(updatedConfig.minQuorumPercentage.toNumber(),                initialConfig.minQuorumPercentage.toNumber());
                assert.equal(updatedConfig.minYayVotePercentage.toNumber(),               initialConfig.minYayVotePercentage.toNumber());
                assert.equal(updatedConfig.proposalSubmissionFeeMumav.toNumber(),         initialConfig.proposalSubmissionFeeMumav.toNumber());
                assert.equal(updatedConfig.maxProposalsPerSatellite.toNumber(),           initialConfig.maxProposalsPerSatellite.toNumber());

                assert.equal(updatedConfig.blocksPerProposalRound.toNumber(),             initialConfig.blocksPerProposalRound.toNumber());
                assert.equal(updatedConfig.blocksPerVotingRound.toNumber(),               initialConfig.blocksPerVotingRound.toNumber());
                assert.equal(updatedConfig.blocksPerTimelockRound.toNumber(),             initialConfig.blocksPerTimelockRound.toNumber());

                assert.equal(updatedConfig.proposalDataTitleMaxLength.toNumber(),         initialConfig.proposalDataTitleMaxLength.toNumber());
                assert.equal(updatedConfig.proposalTitleMaxLength.toNumber(),             initialConfig.proposalTitleMaxLength.toNumber());
                assert.equal(updatedConfig.proposalDescriptionMaxLength.toNumber(),       initialConfig.proposalDescriptionMaxLength.toNumber());
                assert.equal(updatedConfig.proposalInvoiceMaxLength.toNumber(),           initialConfig.proposalInvoiceMaxLength.toNumber());
                assert.equal(updatedConfig.proposalSourceCodeMaxLength.toNumber(),        initialConfig.proposalSourceCodeMaxLength.toNumber());

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%updateWhitelistContracts - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // init values
                contractMapKey  = mallory.pkh;
                storageMap      = "whitelistContracts";

                initialContractMapValue = await getStorageMapValue(governanceStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await governanceInstance.methods.updateWhitelistContracts(contractMapKey, 'update')
                await chai.expect(updateWhitelistContractsOperation.send()).to.be.rejected;

                governanceStorage       = await governanceInstance.storage()
                updatedContractMapValue = await getStorageMapValue(governanceStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'mallory (key) should not be in the Whitelist Contracts map');

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%updateGeneralContracts   - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // init values
                contractMapKey  = "mallory";
                storageMap      = "generalContracts";

                initialContractMapValue = await getStorageMapValue(governanceStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await governanceInstance.methods.updateGeneralContracts(contractMapKey, alice.pkh, 'update')
                await chai.expect(updateGeneralContractsOperation.send()).to.be.rejected;

                governanceStorage       = await governanceInstance.storage()
                updatedContractMapValue = await getStorageMapValue(governanceStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'mallory (key) should not be in the General Contracts map');

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })
        

        it('%mistakenTransfer         - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // Initial values
                const tokenAmount = 10;

                // Mistaken Operation - send 10 MavenFa2Tokens to Delegation Contract
                transferOperation = await fa2Transfer(mavenFa2TokenInstance, mallory.pkh, governanceAddress, tokenId, tokenAmount);
                await transferOperation.confirmation();

                // mistaken transfer operation
                mistakenTransferOperation = await mistakenTransferFa2Token(governanceInstance, mallory.pkh, contractDeployments.mavenFa2Token.address, tokenId, tokenAmount);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%setLambda                - non-admin (mallory) should not be able to call this entrypoint", async() => {
            try{

                // random lambda for testing
                const randomLambdaName  = "randomLambdaName";
                const randomLambdaBytes = "050200000cba0743096500000112075e09650000005a036e036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a0362036203620362036200000000036203620760036803690000000009650000000a0362036203620362036e00000000075e09650000006c09650000000a0362036203620362036200000000036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a036203620362036203620000000003620362076003680369000000000362075e07650765036203620362036c075e076507650368036e0362036e036200000000070702000001770743075e076507650368036e0362036e020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c03200342020000010e037a034c037a07430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700002034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f02000000090743036200810303270200000000072f020000000907430362009c0203270200000000070702000000600743036200808080809d8fc0d0bff2f1b26703420200000047037a034c037a0321052900080570000205290015034b031105710002031605700002033a0322072f020000001307430368010000000844495620627920300327020000000003160707020000001a037a037a03190332072c0200000002032002000000020327034f0707020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c032000808080809d8fc0d0bff2f1b2670342020000092d037a057a000505700005037a034c07430362008f03052100020529000f0529000307430359030a034c03190325072c0200000002032702000000020320053d036d05700002072e02000008a4072e020000007c057000030570000405700005057000060570000705200005072e020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000081c072e0200000044057000030570000405700005057000060570000705200005072e0200000010072e02000000020320020000000203200200000010072e020000000203200200000002032002000007cc072e0200000028057000030570000405700005057000060570000705200005072e02000000020320020000000203200200000798072e0200000774034c032003480521000305210003034c052900050316034c03190328072c020000000002000000090743036200880303270570000205210002034c0321052100030521000205290011034c0329072f020000002005290015074303620000074303620000074303620000074303620000054200050200000004034c03200743036200000521000203160319032a072c020000021c052100020521000407430362008e02057000020529000907430368010000000a64656c65676174696f6e034203420521000b034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f0200000009074303620081030327020000001a072f02000000060743035903030200000008032007430359030a074303620000034c072c020000007303200521000205210004034205210007034c0326052100030521000205290008034205700007034c03260521000205290005034c05290007034b0311052100030316033a0521000b034c0322072f02000000130743036801000000084449562062792030032702000000000316034c0316031202000000060570000603200521000305210003034205210008034c0326052100030521000205700004052900030312055000030571000205210003052100030570000405290005031205500005057100020521000305700002052100030570000403160312031205500001034c05210003034c0570000305290013034b031105500013034c02000000060570000503200521000205290015055000080521000205700002052900110570000205700003034c0346034c0350055000110571000205210003052900070743036200000790010000000c746f74616c5f737570706c790362072f020000000907430362008a01032702000000000521000405290007074303620000037703420790010000000b6765745f62616c616e63650362072f02000000090743036200890103270200000000034c052100090743036200a40105210004033a033a0322072f0200000013074303680100000008444956206279203003270200000000031605210009074303620002033a0312052100090521000a07430362008803033a033a0322072f020000001307430368010000000844495620627920300327020000000003160743036200a401034c0322072f0200000013074303680100000008444956206279203003270200000000031605210004033a05210009052100020322072f0200000013074303680100000008444956206279203003270200000000031605210005034b0311052100060570000a052100040322072f0200000013074303680100000008444956206279203003270200000000031605700007052900130312055000130571000507430362008c0305210004052100070342034205210009034c0326032005700005057000030342052100050570000305700002037a034c0570000305700002034b0311074303620000052100020319032a072c020000003b05210002034c057000030322072f02000000130743036801000000084449562062792030032702000000000316057000020529001503120550001502000000080570000205200002057100030521000405210003034c05290011034c0329072f0200000009074303620089030327020000000003210521000507430362008b03057000020316057000020342034205700007034c03260320032105700004057000020316034b031105500001052100040529000707430362000005700003034205210004037705700002037a057000040655055f0765046e000000062566726f6d5f065f096500000026046e0000000425746f5f04620000000925746f6b656e5f696404620000000725616d6f756e7400000000000000042574787300000009257472616e73666572072f0200000008074303620027032702000000000743036a0000053d0765036e055f096500000006036e0362036200000000053d096500000006036e036203620000000005700004057000050570000705420003031b057000040342031b034d0743036200000521000303160319032a072c02000000440521000405210003034205700005034c032605210003052100020570000403160312055000010571000205210005034c0570000505290013034b031105500013057100030200000006057000040320034c052100040529001505500008034c0521000405700004052900110570000305210005034c0346034c03500550001105710002052100030570000207430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700004034c03260655036e0000000e256f6e5374616b654368616e6765072f02000000090743036200b702032702000000000743036a000005700002034d053d036d034c031b034c031b02000000180570000305700004057000050570000605700007052000060200000036057000030570000405700005057000060570000705200005072e0200000010072e0200000002032002000000020320020000000203200342";

                const setLambdaOperation = governanceInstance.methods.setLambda(randomLambdaName, randomLambdaBytes); 
                await chai.expect(setLambdaOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

    })

});