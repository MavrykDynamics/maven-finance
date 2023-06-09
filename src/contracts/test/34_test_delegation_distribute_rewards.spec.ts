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

import { bob, alice, eve, mallory, oscar, susie, trudy, david, isaac, ivan } from "../scripts/sandbox/accounts";
import { createLambdaBytes } from "@mavrykdynamics/create-lambda-bytes"
import * as helperFunctions from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("Delegation Contract: Distribute Reward tests", async () => {
    
    var utils: Utils;
    var tezos;

    let admin 
    let adminSk 

    let satelliteOne 
    let satelliteTwo
    let satelliteThree
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
    let governanceInstance;
    let governanceProxyInstance;

    let doormanStorage;
    let delegationStorage;
    let mvkTokenStorage;
    let governanceStorage;

    before("setup", async () => {

        utils = new Utils();
        await utils.init(bob.sk);
        tezos = utils.tezos

        admin   = bob.pkh;
        adminSk = bob.sk;
        
        doormanInstance         = await utils.tezos.contract.at(contractDeployments.doorman.address);
        delegationInstance      = await utils.tezos.contract.at(contractDeployments.delegation.address);
        mvkTokenInstance        = await utils.tezos.contract.at(contractDeployments.mvkToken.address);
        governanceInstance      = await utils.tezos.contract.at(contractDeployments.governance.address);
        governanceProxyInstance = await utils.tezos.contract.at(contractDeployments.governanceProxy.address);
            
        doormanStorage    = await doormanInstance.storage();
        delegationStorage = await delegationInstance.storage();
        mvkTokenStorage   = await mvkTokenInstance.storage();
        governanceStorage = await governanceInstance.storage();

        console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')

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
        satelliteTwo    = alice.pkh;
        satelliteThree  = trudy.pkh;
        satelliteFour   = oscar.pkh;
        satelliteFive   = susie.pkh;

        delegateOne     = david.pkh;
        delegateOneSk   = david.sk;

        delegateTwo     = ivan.pkh;
        delegateTwoSk   = ivan.sk;

        delegateThree   = isaac.pkh;
        delegateThreeSk = isaac.sk;

        delegateFour    = mallory.pkh;
        delegateFourSk  = mallory.sk;

        // Whitelist Bob in the delegation contract (to be able to call the %distributeReward entrypoint)
        await helperFunctions.signerFactory(tezos, adminSk)
        const updateWhitelistOperation  = await delegationInstance.methods.updateWhitelistContracts(admin, 'update').send();
        await updateWhitelistOperation.confirmation();

        // Set doorman admin in order for the packed data to work
        const setDoormanAdmin = await doormanInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
        await setDoormanAdmin.confirmation();

    });

    describe("%distributeRewards", async () => {

        beforeEach("Set signer to admin (bob)", async () => {
            delegationStorage  = await delegationInstance.storage();
            await helperFunctions.signerFactory(tezos, adminSk)
        });

        it("whitelisted address (bob) should be able to access %distributeReward for one satellite", async () => {
            
            // distribute reward operation to satellite one (eve)
            const distributeOperation = await delegationInstance.methods.distributeReward([satelliteOne],MVK(50)).send();
            await distributeOperation.confirmation();

            // update storage
            delegationStorage = await delegationInstance.storage();
            doormanStorage    = await doormanInstance.storage();
            
            var satelliteRecord = await delegationStorage.satelliteRewardsLedger.get(satelliteOne)
            var satelliteStake  = await doormanStorage.userStakeBalanceLedger.get(satelliteOne)

            console.log("PRE-CLAIM SATELLITE: ", satelliteRecord.unpaid.toNumber(), satelliteStake.balance.toNumber())

            // Claim operations
            var claimOperation = await doormanInstance.methods.compound(satelliteOne).send();
            await claimOperation.confirmation()
            
            // update storage
            delegationStorage   = await delegationInstance.storage();
            doormanStorage      = await doormanInstance.storage();
            
            var satelliteRecord = await delegationStorage.satelliteRewardsLedger.get(satelliteOne)
            satelliteStake      = await doormanStorage.userStakeBalanceLedger.get(satelliteOne)

            console.log("POST-CLAIM SATELLITE: ", satelliteRecord.unpaid.toNumber(), satelliteStake.balance.toNumber())

            await helperFunctions.signerFactory(tezos, delegateOneSk);
            claimOperation = await doormanInstance.methods.compound(delegateOne).send();
            await claimOperation.confirmation()

            // update storage
            delegationStorage = await delegationInstance.storage();
            doormanStorage  = await doormanInstance.storage();
            
            var delegateRecord = await delegationStorage.satelliteRewardsLedger.get(delegateOne)
            var delegateStake  = await doormanStorage.userStakeBalanceLedger.get(delegateOne)
            
            console.log("POST-CLAIM ALICE: ", delegateRecord.unpaid.toNumber(), " | ", delegateStake.balance.toNumber())

            await helperFunctions.signerFactory(tezos, delegateTwoSk);
            claimOperation = await doormanInstance.methods.compound(delegateTwo).send();
            await claimOperation.confirmation()
            
            // update storage
            delegationStorage = await delegationInstance.storage();
            doormanStorage  = await doormanInstance.storage();
            
            var delegateRecord = await delegationStorage.satelliteRewardsLedger.get(delegateTwo)
            delegateStake  = await doormanStorage.userStakeBalanceLedger.get(delegateTwo)
            console.log("POST-CLAIM EVE: ", delegateRecord.unpaid.toNumber(), " | ", delegateStake.balance.toNumber())

        });

    })

    // describe("%distributeRewards", async () => {
        
    //     it('Reward distribution tests #1', async () => {
    //         try{
                
    //             // Initial Values
    //             delegationStorage = await delegationInstance.storage();

    //             // Distribute Operation
    //             const distributeOperation = await delegationInstance.methods.distributeReward([bob.pkh],MVK(50)).send();
    //             await distributeOperation.confirmation();
    //             delegationStorage = await delegationInstance.storage();
    //             doormanStorage  = await doormanInstance.storage();
    //             var satelliteRecord = await delegationStorage.satelliteRewardsLedger.get(bob.pkh)
    //             var satelliteStake  = await doormanStorage.userStakeBalanceLedger.get(bob.pkh)
    //             console.log("PRE-CLAIM SATELLITE: ", satelliteRecord.unpaid.toNumber(), satelliteStake.balance.toNumber())

    //             // Claim operations
    //             var claimOperation = await doormanInstance.methods.compound(bob.pkh).send();
    //             await claimOperation.confirmation()
    //             delegationStorage = await delegationInstance.storage();
    //             doormanStorage  = await doormanInstance.storage();
    //             var satelliteRecord = await delegationStorage.satelliteRewardsLedger.get(bob.pkh)
    //             satelliteStake  = await doormanStorage.userStakeBalanceLedger.get(bob.pkh)
    //             console.log("POST-CLAIM SATELLITE: ", satelliteRecord.unpaid.toNumber(), satelliteStake.balance.toNumber())

    //             await helperFunctions.signerFactory(tezos, alice.sk);
    //             claimOperation = await doormanInstance.methods.compound(alice.pkh).send();
    //             await claimOperation.confirmation()
    //             delegationStorage = await delegationInstance.storage();
    //             doormanStorage  = await doormanInstance.storage();
    //             var delegateRecord = await delegationStorage.satelliteRewardsLedger.get(alice.pkh)
    //             var delegateStake  = await doormanStorage.userStakeBalanceLedger.get(alice.pkh)
    //             console.log("POST-CLAIM ALICE: ", delegateRecord.unpaid.toNumber(), " | ", delegateStake.balance.toNumber())

    //             await helperFunctions.signerFactory(tezos, eve.sk);
    //             claimOperation = await doormanInstance.methods.compound(eve.pkh).send();
    //             await claimOperation.confirmation()
    //             delegationStorage = await delegationInstance.storage();
    //             doormanStorage  = await doormanInstance.storage();
    //             var delegateRecord = await delegationStorage.satelliteRewardsLedger.get(eve.pkh)
    //             delegateStake  = await doormanStorage.userStakeBalanceLedger.get(eve.pkh)
    //             console.log("POST-CLAIM EVE: ", delegateRecord.unpaid.toNumber(), " | ", delegateStake.balance.toNumber())
    //         } catch(e){
    //             console.dir(e, {depth: 5});
    //         }
    //     });

    //     it('Reward distribution tests #2', async () => {
    //         try{
                
    //             console.log("configuration:\n- 2 satellites (Bob|Mallory)\n- 2 delegates on Bob (Alice|Eve)\n- Operations: \n   DistributeReward(100MVK)\n   Unregister(Bob)\n   Undelegate(Alice)\n   Claim(Bob)\n   Delegate(Alice->Mallory)\n   Claim(Alice)\n   Claim(Eve)");

    //             // Initial Values
    //             delegationStorage           = await delegationInstance.storage();
    //             doormanStorage              = await doormanInstance.storage();
    //             mvkTokenStorage             = await mvkTokenInstance.storage();
    //             const reward                = MVK(100);
    //             const initSatelliteSMVK     = await doormanStorage.userStakeBalanceLedger.get(bob.pkh) 
    //             const initSatelliteRewards  = await delegationStorage.satelliteRewardsLedger.get(bob.pkh)
                
    //             var satelliteTest           = await delegationStorage.satelliteLedger.get(bob.pkh);
    //             var aliceTest               = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
    //             var eveTest                 = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);

    //             const initSatelliteRecord   = await delegationStorage.satelliteLedger.get(bob.pkh);
    //             const initDoormanBalance    = await mvkTokenStorage.ledger.get(contractDeployments.doorman.address);
    //             const satelliteVotingPower  = initSatelliteRecord.totalDelegatedAmount.toNumber() + initSatelliteRecord.stakedMvkBalance.toNumber();
    //             const satelliteFee          = initSatelliteRecord.satelliteFee.toNumber();

    //             // Distribute Operation
    //             const distributeOperation       = await delegationInstance.methods.distributeReward([bob.pkh, mallory.pkh],reward).send();
    //             await distributeOperation.confirmation();

    //             // var claimOperation = await doormanInstance.methods.compound().send();
    //             // await claimOperation.confirmation()
    //             delegationStorage               = await delegationInstance.storage();
    //             doormanStorage                  = await doormanInstance.storage();
    //             mvkTokenStorage                 = await mvkTokenInstance.storage();
    //             const satelliteFeeReward        = satelliteFee / 10000 * reward/2
    //             const distributedReward         = reward / 2 - satelliteFeeReward
    //             const accumulatedRewardPerShare = distributedReward / satelliteVotingPower
    //             var unpaidRewards               = initSatelliteRewards.unpaid.toNumber() + satelliteFeeReward
    //             var satelliteRewards            = await delegationStorage.satelliteRewardsLedger.get(bob.pkh)
    //             var satelliteStake              = await doormanStorage.userStakeBalanceLedger.get(bob.pkh)
    //             var doormanBalance              = await mvkTokenStorage.ledger.get(contractDeployments.doorman.address);
    //             satelliteTest                   = await delegationStorage.satelliteLedger.get(bob.pkh);
    //             aliceTest                       = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
    //             eveTest                         = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);

    //             // Assertions
    //             assert.equal(satelliteRewards.unpaid.toNumber(), unpaidRewards)
    //             assert.equal(initSatelliteSMVK.balance.toNumber(), satelliteStake.balance.toNumber())
    //             assert.equal(doormanBalance.toNumber(), initDoormanBalance.toNumber() + reward)
    //             console.log("PRE-UNREGISTER SATELLITE: ", satelliteRewards.unpaid.toNumber(), " | ", satelliteStake.balance.toNumber())

    //             // Unregister operation
    //             const unregisterOperation   = await delegationInstance.methods.unregisterAsSatellite(bob.pkh).send();
    //             await unregisterOperation.confirmation();
    //             delegationStorage   = await delegationInstance.storage();
    //             doormanStorage      = await doormanInstance.storage();
    //             satelliteRewards    = await delegationStorage.satelliteRewardsLedger.get(bob.pkh)
    //             satelliteStake      = await doormanStorage.userStakeBalanceLedger.get(bob.pkh)

    //             // New unpaid reward
    //             unpaidRewards       = initSatelliteRewards.unpaid.toNumber() + satelliteFeeReward + initSatelliteSMVK.balance.toNumber() * accumulatedRewardPerShare

    //             // Assertions
    //             assert.equal(satelliteRewards.unpaid.toNumber(), unpaidRewards)
    //             assert.equal(initSatelliteSMVK.balance.toNumber(), satelliteStake.balance.toNumber())
    //             console.log("POST-UNREGISTER SATELLITE: ", satelliteRewards.unpaid.toNumber(), " | ", satelliteStake.balance.toNumber())

    //             // Undelegate operation
    //             await helperFunctions.signerFactory(tezos, alice.sk);
    //             const initAliceSMVK     = await doormanStorage.userStakeBalanceLedger.get(alice.pkh) 
    //             const initAliceRewards  = await delegationStorage.satelliteRewardsLedger.get(alice.pkh)
    //             const undelegateOperation = await delegationInstance.methods.undelegateFromSatellite(alice.pkh).send();
    //             await undelegateOperation.confirmation()
    //             unpaidRewards   = initAliceRewards.unpaid.toNumber() + initAliceSMVK.balance.toNumber() * accumulatedRewardPerShare
    //             delegationStorage = await delegationInstance.storage();
    //             doormanStorage  = await doormanInstance.storage();
    //             var delegateRewards = await delegationStorage.satelliteRewardsLedger.get(alice.pkh)
    //             var delegateStake  = await doormanStorage.userStakeBalanceLedger.get(alice.pkh)

    //             // Assertions
    //             assert.equal(delegateRewards.unpaid.toNumber(), unpaidRewards);
    //             assert.equal(initAliceSMVK.balance.toNumber(), delegateStake.balance.toNumber())
    //             console.log("POST-REDELEGATE ALICE: ", delegateRewards.unpaid.toNumber(), " | ", delegateStake.balance.toNumber())

    //             // Satellite Claim operation
    //             var paidRewards   = initSatelliteRewards.unpaid.toNumber() + satelliteFeeReward + initSatelliteSMVK.balance.toNumber() * accumulatedRewardPerShare
    //             satelliteRewards = await delegationStorage.satelliteRewardsLedger.get(bob.pkh)
    //             console.log("START: ", satelliteRewards)

    //             var claimOperation = await doormanInstance.methods.compound(bob.pkh).send();
    //             await claimOperation.confirmation()
    //             claimOperation = await doormanInstance.methods.compound(mallory.pkh).send(); // COMPOUND FOR MALLORY TO PREPARE NEXT TEXT
    //             await claimOperation.confirmation()
    //             delegationStorage = await delegationInstance.storage();
    //             doormanStorage  = await doormanInstance.storage();
    //             satelliteRewards = await delegationStorage.satelliteRewardsLedger.get(bob.pkh)
    //             satelliteStake  = await doormanStorage.userStakeBalanceLedger.get(bob.pkh)

    //             console.log("START: ", satelliteRewards)
    //             console.log("POST-CLAIM SATELLITE: ", satelliteRewards.unpaid.toNumber(), " | ", satelliteStake.balance.toNumber())

    //             // Assertions
    //             assert.equal(satelliteRewards.unpaid.toNumber(), 0)
    //             assert.equal(initSatelliteSMVK.balance.toNumber() + paidRewards, satelliteStake.balance.toNumber())
    //             console.log("POST-UNREGISTER SATELLITE: ", satelliteRewards.unpaid.toNumber(), " | ", satelliteStake.balance.toNumber())

    //             // Alice redelegate operation
    //             await helperFunctions.signerFactory(tezos, alice.sk);
    //             const delegateOperation = await delegationInstance.methods.delegateToSatellite(alice.pkh, mallory.pkh).send();
    //             await delegateOperation.confirmation()
    //             delegationStorage = await delegationInstance.storage();
    //             doormanStorage  = await doormanInstance.storage();
    //             delegateRewards = await delegationStorage.satelliteRewardsLedger.get(alice.pkh)
    //             delegateStake  = await doormanStorage.userStakeBalanceLedger.get(alice.pkh)

    //             // Assertions
    //             assert.equal(delegateRewards.unpaid.toNumber(), unpaidRewards);
    //             assert.equal(initAliceSMVK.balance.toNumber(), delegateStake.balance.toNumber())
    //             console.log("POST-DELEGATE ALICE: ", delegateRewards.unpaid.toNumber(), " | ", delegateStake.balance.toNumber())

    //             // Claims operations
    //             claimOperation = await doormanInstance.methods.compound(alice.pkh).send();
    //             await claimOperation.confirmation()
    //             delegationStorage = await delegationInstance.storage();
    //             doormanStorage  = await doormanInstance.storage();
    //             paidRewards   = initAliceRewards.unpaid.toNumber() + initAliceSMVK.balance.toNumber() * accumulatedRewardPerShare
    //             delegateRewards = await delegationStorage.satelliteRewardsLedger.get(alice.pkh)
    //             delegateStake  = await doormanStorage.userStakeBalanceLedger.get(alice.pkh)
                
    //             // Assertions
    //             assert.equal(delegateRewards.unpaid.toNumber(), 0)
    //             assert.equal(initAliceSMVK.balance.toNumber() + paidRewards, delegateStake.balance.toNumber())
    //             console.log("POST-CLAIM ALICE: ", delegateRewards.unpaid.toNumber(), " | ", delegateStake.balance.toNumber())

    //             await helperFunctions.signerFactory(tezos, eve.sk);
    //             const initEveSMVK     = await doormanStorage.userStakeBalanceLedger.get(eve.pkh) 
    //             const initEveRewards  = await delegationStorage.satelliteRewardsLedger.get(eve.pkh)
    //             claimOperation = await doormanInstance.methods.compound(eve.pkh).send();
    //             await claimOperation.confirmation()
    //             delegationStorage = await delegationInstance.storage();
    //             doormanStorage  = await doormanInstance.storage();
    //             paidRewards   = initEveRewards.unpaid.toNumber() + initEveSMVK.balance.toNumber() * accumulatedRewardPerShare
    //             delegateRewards = await delegationStorage.satelliteRewardsLedger.get(eve.pkh)
    //             delegateStake  = await doormanStorage.userStakeBalanceLedger.get(eve.pkh)
                
    //             // Assertions
    //             console.log("POST-CLAIM EVE: ", delegateRewards.unpaid.toNumber(), " | ", delegateStake.balance.toNumber())
    //             assert.equal(delegateRewards.unpaid.toNumber(), 0)
    //             assert.equal(initEveSMVK.balance.toNumber() + paidRewards, delegateStake.balance.toNumber())

    //             // Reset -> Re-register as a Satellite
    //             await helperFunctions.signerFactory(tezos, bob.sk);
    //             const bobSatelliteName                  = "New Satellite (Bob)";
    //             const bobSatelliteDescription           = "New Satellite Description (Bob)";
    //             const bobSatelliteImage                 = "https://placeholder.com/300";
    //             const bobSatelliteWebsite               = "https://placeholder.com/300";
    //             const bobSatelliteFee                   = "1000"; // 10% fee
    //             const registerAsSatelliteOperation = await delegationInstance.methods
    //                 .registerAsSatellite(
    //                     bobSatelliteName, 
    //                     bobSatelliteDescription, 
    //                     bobSatelliteImage,
    //                     bobSatelliteWebsite, 
    //                     bobSatelliteFee
    //                 ).send();
    //             await registerAsSatelliteOperation.confirmation();
    //         } catch(e){
    //             console.dir(e, {depth: 5});
    //         }
    //     });

    //     it('End of governance cycle should trigger this entrypoint: Voters should earn the cycle reward while proposer should not earn the success reward if the proposal is not executed', async () => {
    //         try{
    //             // Initial Values
    //             delegationStorage           = await delegationInstance.storage();
    //             doormanStorage              = await doormanInstance.storage();
    //             governanceStorage           = await governanceInstance.storage();
    //             mvkTokenStorage             = await mvkTokenInstance.storage();
    //             console.log(governanceStorage.lambdaLedger)
    //             const initDoormanBalance    = await mvkTokenStorage.ledger.get(contractDeployments.doorman.address);
    //             const proposalId            = governanceStorage.nextProposalId.toNumber();
    //             const proposalName          = "New Proposal #1";
    //             const proposalDesc          = "Details about new proposal #1";
    //             const proposalIpfs          = "ipfs://QM123456789";
    //             const proposalSourceCode    = "Proposal Source Code";
    //             const proposalReward        = governanceStorage.config.cycleVotersReward.toNumber();

    //             // Satellite ledger
    //             const firstSatelliteRecordStart     = await delegationStorage.satelliteRewardsLedger.get(bob.pkh)
    //             const firstSatelliteStakeStart      = await doormanStorage.userStakeBalanceLedger.get(bob.pkh)
    //             const secondSatelliteRecordStart    = await delegationStorage.satelliteRewardsLedger.get(mallory.pkh)
    //             const secondSatelliteStakeStart     = await doormanStorage.userStakeBalanceLedger.get(mallory.pkh)
    //             const firstSatellite                = await delegationStorage.satelliteLedger.get(bob.pkh);
    //             const firstSatelliteFeePct          = firstSatellite.satelliteFee.toNumber();
    //             const firstSatelliteFee             = firstSatelliteFeePct / 10000 * proposalReward/2;
    //             const firstSatelliteVotingPower     = firstSatellite.totalDelegatedAmount.toNumber() + firstSatellite.stakedMvkBalance.toNumber();
    //             const firstSatelliteDistributed     = proposalReward / 2 - firstSatelliteFee
    //             const firstSatelliteAccu            = firstSatelliteDistributed / firstSatelliteVotingPower
    //             const secondSatellite               = await delegationStorage.satelliteLedger.get(mallory.pkh);
    //             const secondSatelliteFeePct         = secondSatellite.satelliteFee.toNumber();
    //             const secondSatelliteFee            = secondSatelliteFeePct / 10000 * proposalReward/2;
    //             const secondSatelliteVotingPower    = secondSatellite.totalDelegatedAmount.toNumber() + secondSatellite.stakedMvkBalance.toNumber();
    //             const secondSatelliteDistributed    = proposalReward / 2 - secondSatelliteFee
    //             const secondSatelliteAccu           = secondSatelliteDistributed / secondSatelliteVotingPower;
    //             console.log("PRE-OPERATION SATELLITE BOB: ", firstSatelliteRecordStart.unpaid.toNumber(), " | ", firstSatelliteStakeStart.balance.toNumber())
    //             console.log("PRE-OPERATION SATELLITE MALLORY: ", secondSatelliteRecordStart.unpaid.toNumber(), " | ", secondSatelliteStakeStart.balance.toNumber())

    //             // Prepare proposal data
    //             const lambdaFunction                = await createLambdaBytes(
    //                 tezos.rpc.url,
    //                 contractDeployments.governanceProxy.address,
                    
    //                 'updateGeneralContracts',
    //                 [
    //                     contractDeployments.doorman.address,
    //                     "bob",
    //                     bob.pkh
    //                 ]
    //             );

    //             const proposalData      = [
    //                 {
    //                     addOrSetProposalData: {
    //                         title: "Metadata#1",
    //                         encodedCode: lambdaFunction,
	// 					    codeDescription: ""
    //                     }
    //                 }
    //             ]

    //             // Initial governance storage operations
    //             var updateGovernanceConfig  = await governanceInstance.methods.updateConfig(0, "configBlocksPerProposalRound").send();
    //             await updateGovernanceConfig.confirmation();
    //             updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configBlocksPerVotingRound").send();
    //             await updateGovernanceConfig.confirmation();
    //             updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configBlocksPerTimelockRound").send();
    //             await updateGovernanceConfig.confirmation();
    //             updateGovernanceConfig      = await governanceInstance.methods.updateConfig(1, "configMinProposalRoundVotePct").send();
    //             await updateGovernanceConfig.confirmation();
    //             updateGovernanceConfig      = await governanceInstance.methods.updateConfig(1, "configMinProposalRoundVotesReq").send();
    //             await updateGovernanceConfig.confirmation();
    //             var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
    //             await nextRoundOperation.confirmation();

    //             const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
    //             await proposeOperation.confirmation();
    //             const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
    //             await lockOperation.confirmation();
    //             var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
    //             await voteOperation.confirmation();
    //             await helperFunctions.signerFactory(tezos, mallory.sk);
    //             voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
    //             await voteOperation.confirmation();
    //             await helperFunctions.signerFactory(tezos, bob.sk);
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
    //             await nextRoundOperation.confirmation();

    //             // Votes operation -> both satellites vote
    //             var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("nay").send();
    //             await votingRoundVoteOperation.confirmation();
    //             await helperFunctions.signerFactory(tezos, mallory.sk);
    //             votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("pass").send();
    //             await votingRoundVoteOperation.confirmation();
    //             await helperFunctions.signerFactory(tezos, bob.sk);

    //             // Restart proposal round
    //             nextRoundOperation              = await governanceInstance.methods.startNextRound(true).send();
    //             await nextRoundOperation.confirmation();
    //             nextRoundOperation              = await governanceInstance.methods.startNextRound(true).send();
    //             await nextRoundOperation.confirmation();
    //             governanceStorage               = await governanceInstance.storage();
    //             console.log("ROUND: ", governanceStorage.currentCycleInfo.round)

    //             // Post governance cycle reward distribution
    //             var governanceClaimOperation    = await governanceInstance.methods.distributeProposalRewards(bob.pkh, [proposalId]).send();
    //             await governanceClaimOperation.confirmation();
    //             governanceClaimOperation        = await governanceInstance.methods.distributeProposalRewards(mallory.pkh, [proposalId]).send();
    //             await governanceClaimOperation.confirmation();

    //             // Final values
    //             delegationStorage                       = await delegationInstance.storage();
    //             doormanStorage                          = await doormanInstance.storage();
    //             mvkTokenStorage                         = await mvkTokenInstance.storage();
    //             const finalDoormanBalance               = await mvkTokenStorage.ledger.get(contractDeployments.doorman.address);
    //             const firstSatelliteRecordNoClaim       = await delegationStorage.satelliteRewardsLedger.get(bob.pkh)
    //             const firstSatelliteStakeNoClaim        = await doormanStorage.userStakeBalanceLedger.get(bob.pkh)
    //             const secondSatelliteRecordNoClaim      = await delegationStorage.satelliteRewardsLedger.get(mallory.pkh)
    //             const secondSatelliteStakeNoClaim       = await doormanStorage.userStakeBalanceLedger.get(mallory.pkh)

    //             // Assertions
    //             assert.equal(finalDoormanBalance.toNumber(), initDoormanBalance.toNumber() + proposalReward)
    //             console.log("POST-OPERATION SATELLITE BOB: ", firstSatelliteRecordNoClaim.unpaid.toNumber(), " | ", firstSatelliteStakeNoClaim.balance.toNumber())
    //             console.log("POST-OPERATION SATELLITE MALLORY: ", secondSatelliteRecordNoClaim.unpaid.toNumber(), " | ", secondSatelliteStakeNoClaim.balance.toNumber())

    //             // Claim operations
    //             await helperFunctions.signerFactory(tezos, bob.sk)
    //             var claimOperation              = await doormanInstance.methods.compound(bob.pkh).send();
    //             await claimOperation.confirmation();
    //             await helperFunctions.signerFactory(tezos, mallory.sk)
    //             claimOperation                  = await doormanInstance.methods.compound(mallory.pkh).send();
    //             await claimOperation.confirmation();

    //             // Final values
    //             delegationStorage                   = await delegationInstance.storage();
    //             doormanStorage                      = await doormanInstance.storage();
    //             const firstSatelliteReward          = firstSatelliteAccu * firstSatelliteStakeStart.balance.toNumber() + firstSatelliteFee + firstSatelliteRecordStart.unpaid.toNumber()
    //             const secondSatelliteReward         = secondSatelliteAccu * secondSatelliteStakeStart.balance.toNumber() + secondSatelliteFee + secondSatelliteRecordStart.unpaid.toNumber();
    //             const firstSatelliteRecordEnd       = await delegationStorage.satelliteRewardsLedger.get(bob.pkh)
    //             const firstSatelliteStakeEnd        = await doormanStorage.userStakeBalanceLedger.get(bob.pkh)
    //             const secondSatelliteRecordEnd      = await delegationStorage.satelliteRewardsLedger.get(mallory.pkh)
    //             const secondSatelliteStakeEnd       = await doormanStorage.userStakeBalanceLedger.get(mallory.pkh)

    //             // Assertions
    //             assert.equal(firstSatelliteRecordEnd.unpaid.toNumber(), 0)
    //             assert.equal(secondSatelliteRecordEnd.unpaid.toNumber(), 0)
    //             assert.equal(helperFunctions.almostEqual(firstSatelliteStakeEnd.balance.toNumber(),firstSatelliteStakeStart.balance.toNumber() + firstSatelliteReward, 0.01), true)
    //             assert.equal(helperFunctions.almostEqual(secondSatelliteStakeEnd.balance.toNumber(),secondSatelliteStakeStart.balance.toNumber() + secondSatelliteReward, 0.01), true)
    //             console.log("POST-CLAIM SATELLITE BOB: ", firstSatelliteRecordEnd.unpaid.toNumber(), " | ", firstSatelliteStakeEnd.balance.toNumber())
    //             console.log("POST-CLAIM SATELLITE MALLORY: ", secondSatelliteRecordEnd.unpaid.toNumber(), " | ", secondSatelliteStakeEnd.balance.toNumber()) 
    //         } catch(e){
    //             console.dir(e, {depth: 5});
    //         }
    //     });


    //     it('End of governance cycle should trigger this entrypoint: Voters should earn the cycle reward while proposer should earn the success reward if the proposal is executed', async () => {
    //         try{
    //             // Initial Values
    //             delegationStorage           = await delegationInstance.storage();
    //             doormanStorage              = await doormanInstance.storage();
    //             governanceStorage           = await governanceInstance.storage();
    //             mvkTokenStorage             = await mvkTokenInstance.storage();
    //             const initDoormanBalance    = await mvkTokenStorage.ledger.get(contractDeployments.doorman.address);
    //             const proposalId            = governanceStorage.nextProposalId.toNumber();
    //             const proposalName          = "New Proposal #1";
    //             const proposalDesc          = "Details about new proposal #1";
    //             const proposalIpfs          = "ipfs://QM123456789";
    //             const proposalSourceCode    = "Proposal Source Code";
    //             const proposalReward        = governanceStorage.config.cycleVotersReward.toNumber();
    //             const proposerReward        = governanceStorage.config.successReward.toNumber();

    //             // Satellite ledger
    //             const firstSatelliteRecordStart     = await delegationStorage.satelliteRewardsLedger.get(bob.pkh)
    //             const firstSatelliteStakeStart      = await doormanStorage.userStakeBalanceLedger.get(bob.pkh)
    //             const secondSatelliteRecordStart    = await delegationStorage.satelliteRewardsLedger.get(mallory.pkh)
    //             const secondSatelliteStakeStart     = await doormanStorage.userStakeBalanceLedger.get(mallory.pkh)
    //             const firstSatellite                = await delegationStorage.satelliteLedger.get(bob.pkh);
    //             const firstSatelliteFeePct          = firstSatellite.satelliteFee.toNumber();
    //             const firstSatelliteFee             = firstSatelliteFeePct / 10000 * proposalReward/2;
    //             const firstSatelliteVotingPower     = firstSatellite.totalDelegatedAmount.toNumber() + firstSatellite.stakedMvkBalance.toNumber();
    //             const firstSatelliteDistributed     = proposalReward / 2 - firstSatelliteFee
    //             const firstSatelliteAccu            = firstSatelliteDistributed / firstSatelliteVotingPower
    //             const secondSatellite               = await delegationStorage.satelliteLedger.get(mallory.pkh);
    //             const secondSatelliteFeePct         = secondSatellite.satelliteFee.toNumber();
    //             const secondSatelliteFee            = secondSatelliteFeePct / 10000 * proposalReward/2;
    //             const secondSatelliteVotingPower    = secondSatellite.totalDelegatedAmount.toNumber() + secondSatellite.stakedMvkBalance.toNumber();
    //             const secondSatelliteDistributed    = proposalReward / 2 - secondSatelliteFee
    //             const secondSatelliteAccu           = secondSatelliteDistributed / secondSatelliteVotingPower;
    //             console.log("PRE-OPERATION SATELLITE BOB: ", firstSatelliteRecordStart.unpaid.toNumber(), " | ", firstSatelliteStakeStart.balance.toNumber())
    //             console.log("PRE-OPERATION SATELLITE MALLORY: ", secondSatelliteRecordStart.unpaid.toNumber(), " | ", secondSatelliteStakeStart.balance.toNumber())

    //             // Prepare proposal metadata
    //             const lambdaFunction                = await createLambdaBytes(
    //                 tezos.rpc.url,
    //                 contractDeployments.governanceProxy.address,
                    
    //                 'updateGeneralContracts',
    //                 [
    //                     contractDeployments.doorman.address,
    //                     "bob",
    //                     bob.pkh
    //                 ]
    //             );

    //             const proposalData      = [
    //                 {
    //                     addOrSetProposalData: {
    //                         title: "Metadata#1",
    //                         encodedCode: lambdaFunction,
	// 					    codeDescription: ""
    //                     }
    //                 }
    //             ]

    //             // Initial governance storage operations
    //             var updateGovernanceConfig  = await governanceInstance.methods.updateConfig(0, "configBlocksPerProposalRound").send();
    //             await updateGovernanceConfig.confirmation();
    //             updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configBlocksPerVotingRound").send();
    //             await updateGovernanceConfig.confirmation();
    //             updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configBlocksPerTimelockRound").send();
    //             await updateGovernanceConfig.confirmation();
    //             updateGovernanceConfig      = await governanceInstance.methods.updateConfig(1, "configMinProposalRoundVotePct").send();
    //             await updateGovernanceConfig.confirmation();
    //             updateGovernanceConfig      = await governanceInstance.methods.updateConfig(1, "configMinProposalRoundVotesReq").send();
    //             await updateGovernanceConfig.confirmation();
    //             var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
    //             await nextRoundOperation.confirmation();

    //             const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
    //             await proposeOperation.confirmation();
    //             const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
    //             await lockOperation.confirmation();
    //             var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
    //             await voteOperation.confirmation();
    //             await helperFunctions.signerFactory(tezos, mallory.sk);
    //             voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
    //             await voteOperation.confirmation();
    //             await helperFunctions.signerFactory(tezos, bob.sk);
    //             nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
    //             await nextRoundOperation.confirmation();

    //             // Votes operation -> both satellites vote
    //             var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
    //             await votingRoundVoteOperation.confirmation();
    //             await helperFunctions.signerFactory(tezos, mallory.sk);
    //             votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
    //             await votingRoundVoteOperation.confirmation();
    //             await helperFunctions.signerFactory(tezos, bob.sk);

    //             // Restart proposal round
    //             nextRoundOperation              = await governanceInstance.methods.startNextRound(true).send();
    //             await nextRoundOperation.confirmation();
    //             nextRoundOperation              = await governanceInstance.methods.startNextRound(true).send();
    //             await nextRoundOperation.confirmation();
    //             governanceStorage               = await governanceInstance.storage();
    //             console.log("ROUND: ", governanceStorage.currentCycleInfo.round)

    //             // Post governance cycle reward distribution
    //             var governanceClaimOperation    = await governanceInstance.methods.distributeProposalRewards(bob.pkh, [proposalId]).send();
    //             await governanceClaimOperation.confirmation();
    //             governanceClaimOperation        = await governanceInstance.methods.distributeProposalRewards(mallory.pkh, [proposalId]).send();
    //             await governanceClaimOperation.confirmation();

    //             // Final values
    //             delegationStorage                       = await delegationInstance.storage();
    //             doormanStorage                          = await doormanInstance.storage();
    //             mvkTokenStorage                         = await mvkTokenInstance.storage();
    //             const finalDoormanBalance               = await mvkTokenStorage.ledger.get(contractDeployments.doorman.address);
    //             const firstSatelliteRecordNoClaim       = await delegationStorage.satelliteRewardsLedger.get(bob.pkh)
    //             const firstSatelliteStakeNoClaim        = await doormanStorage.userStakeBalanceLedger.get(bob.pkh)
    //             const secondSatelliteRecordNoClaim      = await delegationStorage.satelliteRewardsLedger.get(mallory.pkh)
    //             const secondSatelliteStakeNoClaim       = await doormanStorage.userStakeBalanceLedger.get(mallory.pkh)

    //             // Assertions
    //             assert.equal(finalDoormanBalance.toNumber(), initDoormanBalance.toNumber() + proposalReward + proposerReward)
    //             console.log("POST-OPERATION SATELLITE BOB: ", firstSatelliteRecordNoClaim.unpaid.toNumber(), " | ", firstSatelliteStakeNoClaim.balance.toNumber())
    //             console.log("POST-OPERATION SATELLITE MALLORY: ", secondSatelliteRecordNoClaim.unpaid.toNumber(), " | ", secondSatelliteStakeNoClaim.balance.toNumber())

    //             // Claim operations
    //             var claimOperation  = await doormanInstance.methods.compound(bob.pkh).send();
    //             await claimOperation.confirmation();
    //             claimOperation  = await doormanInstance.methods.compound(mallory.pkh).send();
    //             await claimOperation.confirmation();

    //             // Final values
    //             delegationStorage                   = await delegationInstance.storage();
    //             doormanStorage                      = await doormanInstance.storage();
    //             const firstSatelliteReward          = firstSatelliteAccu * firstSatelliteStakeStart.balance.toNumber() + firstSatelliteFee + firstSatelliteRecordStart.unpaid.toNumber() + proposerReward;
    //             const secondSatelliteReward         = secondSatelliteAccu * secondSatelliteStakeStart.balance.toNumber() + secondSatelliteFee + secondSatelliteRecordStart.unpaid.toNumber();
    //             const firstSatelliteRecordEnd       = await delegationStorage.satelliteRewardsLedger.get(bob.pkh)
    //             const firstSatelliteStakeEnd        = await doormanStorage.userStakeBalanceLedger.get(bob.pkh)
    //             const secondSatelliteRecordEnd      = await delegationStorage.satelliteRewardsLedger.get(mallory.pkh)
    //             const secondSatelliteStakeEnd       = await doormanStorage.userStakeBalanceLedger.get(mallory.pkh)

    //             // Assertions
    //             assert.equal(firstSatelliteRecordEnd.unpaid.toNumber(), 0)
    //             assert.equal(secondSatelliteRecordEnd.unpaid.toNumber(), 0)
    //             assert.equal(helperFunctions.almostEqual(firstSatelliteStakeEnd.balance.toNumber(),firstSatelliteStakeStart.balance.toNumber() + firstSatelliteReward, 0.01), true)
    //             assert.equal(helperFunctions.almostEqual(secondSatelliteStakeEnd.balance.toNumber(),secondSatelliteStakeStart.balance.toNumber() + secondSatelliteReward, 0.01), true)
    //             console.log("POST-CLAIM SATELLITE BOB: ", firstSatelliteRecordEnd.unpaid.toNumber(), " | ", firstSatelliteStakeEnd.balance.toNumber())
    //             console.log("POST-CLAIM SATELLITE MALLORY: ", secondSatelliteRecordEnd.unpaid.toNumber(), " | ", secondSatelliteStakeEnd.balance.toNumber()) 
    //         } catch(e){
    //             console.dir(e, {depth: 5});
    //         }
    //     });

    //     it('Non-whitelist contract should not be able to call this entrypoint', async () => {
    //         try{
    //             // Initial Values
    //             delegationStorage = await delegationInstance.storage();

    //             // Distribute Operation
    //             await helperFunctions.signerFactory(tezos, alice.sk);
    //             await chai.expect(delegationInstance.methods.distributeReward([bob.pkh],MVK(50)).send()).to.be.rejected;
    //         } catch(e){
    //             console.dir(e, {depth: 5});
    //         }
    //     });

    //     it('Whitelist should not be able to call this entrypoint if the doorman contract is not referenced in the storage', async () => {
    //         try{
    //             // Initial Values
    //             delegationStorage = await delegationInstance.storage();

    //             // Preparation operation
    //             var updateGeneralContractsOperation   = await governanceInstance.methods.updateGeneralContracts("doorman", contractDeployments.doorman.address).send();
    //             await updateGeneralContractsOperation.confirmation();

    //             // Distribute Operation
    //             await chai.expect(delegationInstance.methods.distributeReward([bob.pkh],MVK(50)).send()).to.be.rejected;

    //             // Reset operation
    //             updateGeneralContractsOperation   = await governanceInstance.methods.updateGeneralContracts("doorman", contractDeployments.doorman.address).send();
    //             await updateGeneralContractsOperation.confirmation();
    //         }
    //         catch(e) {
    //             console.dir(e, {depth: 5});
    //         }
    //     })

    //     it('Whitelist should not be able to call this entrypoint if the satellite treasury contract is not referenced in the storage', async () => {
    //         try{
    //             // Initial Values
    //             delegationStorage = await delegationInstance.storage();

    //             // Preparation operation
    //             var updateGeneralContractsOperation   = await governanceInstance.methods.updateGeneralContracts("satelliteTreasury", contractDeployments.treasury.address).send();
    //             await updateGeneralContractsOperation.confirmation();

    //             // Distribute Operation
    //             await chai.expect(delegationInstance.methods.distributeReward([bob.pkh],MVK(50)).send()).to.be.rejected;

    //             // Reset operation
    //             updateGeneralContractsOperation   = await governanceInstance.methods.updateGeneralContracts("satelliteTreasury", contractDeployments.treasury.address).send();
    //             await updateGeneralContractsOperation.confirmation();
    //         }
    //         catch(e) {
    //             console.dir(e, {depth: 5});
    //         }
    //     })

    //     it('Whitelist should not be able to call this entrypoint if one of the provided satellites does not exist', async () => {
    //         try{
    //             // Initial Values
    //             delegationStorage = await delegationInstance.storage();

    //             // Distribute Operation
    //             await chai.expect(delegationInstance.methods.distributeReward([bob.pkh, trudy.pkh],MVK(50)).send()).to.be.rejected;
    //         }
    //         catch(e) {
    //             console.dir(e, {depth: 5});
    //         }
    //     })
    // });
});
