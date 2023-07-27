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
import { almostEqual, signerFactory } from './helpers/helperFunctions'
import { mockSatelliteData } from "./helpers/mockSampleData";

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

    let satelliteOneSk
    let satelliteTwoSk
    let satelliteThreeSk
    let satelliteFourSk
    let satelliteFiveSk

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

        satelliteOneSk  = eve.sk;
        satelliteTwoSk  = alice.sk;
        satelliteThreeSk= trudy.sk;
        satelliteFourSk = oscar.sk;
        satelliteFiveSk = susie.sk;

        delegateOne     = david.pkh;
        delegateOneSk   = david.sk;

        delegateTwo     = ivan.pkh;
        delegateTwoSk   = ivan.sk;

        delegateThree   = isaac.pkh;
        delegateThreeSk = isaac.sk;

        delegateFour    = mallory.pkh;
        delegateFourSk  = mallory.sk;

        // Whitelist Bob in the delegation contract (to be able to call the %distributeReward entrypoint)
        const adminHasWhitelist = await delegationStorage.whitelistContracts.get(admin)
        if(adminHasWhitelist === undefined) {
            await signerFactory(tezos, adminSk)
            const updateWhitelistOperation  = await delegationInstance.methods.updateWhitelistContracts(admin, 'update').send();
            await updateWhitelistOperation.confirmation();
        }

        // Set doorman admin in order for the packed data to work
        if(doormanStorage.admin !== contractDeployments.governanceProxy.address) {
            const setDoormanAdmin = await doormanInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
            await setDoormanAdmin.confirmation();
        }

    });

    describe("%distributeRewards", async () => {

        beforeEach("set signer to admin (bob)", async () => {
            delegationStorage  = await delegationInstance.storage();
            await signerFactory(tezos, adminSk)
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
            var claimOperation = await doormanInstance.methods.compound([satelliteOne]).send();
            await claimOperation.confirmation()
            
            // update storage
            delegationStorage   = await delegationInstance.storage();
            doormanStorage      = await doormanInstance.storage();
            
            var satelliteRecord = await delegationStorage.satelliteRewardsLedger.get(satelliteOne)
            satelliteStake      = await doormanStorage.userStakeBalanceLedger.get(satelliteOne)

            console.log("POST-CLAIM SATELLITE: ", satelliteRecord.unpaid.toNumber(), satelliteStake.balance.toNumber())

            await signerFactory(tezos, delegateOneSk);
            claimOperation = await doormanInstance.methods.compound([delegateOne]).send();
            await claimOperation.confirmation()

            // update storage
            delegationStorage = await delegationInstance.storage();
            doormanStorage  = await doormanInstance.storage();
            
            var delegateRecord = await delegationStorage.satelliteRewardsLedger.get(delegateOne)
            var delegateStake  = await doormanStorage.userStakeBalanceLedger.get(delegateOne)
            
            console.log("POST-CLAIM DAVID: ", delegateRecord.unpaid.toNumber(), " | ", delegateRecord.paid.toNumber(), " | ", delegateStake.balance.toNumber())

            await signerFactory(tezos, delegateTwoSk);
            claimOperation = await doormanInstance.methods.compound([delegateTwo]).send();
            await claimOperation.confirmation()
            
            // update storage
            delegationStorage = await delegationInstance.storage();
            doormanStorage  = await doormanInstance.storage();
            
            var delegateRecord = await delegationStorage.satelliteRewardsLedger.get(delegateTwo)
            delegateStake  = await doormanStorage.userStakeBalanceLedger.get(delegateTwo)
            console.log("POST-CLAIM IVAN: ", delegateRecord.unpaid.toNumber(), " | ", delegateRecord.paid.toNumber(), " | ", delegateStake.balance.toNumber())

        });

    })

    describe("%distributeRewards", async () => {

        beforeEach("Set signer to admin (bob)", async () => {
            delegationStorage  = await delegationInstance.storage();
            await signerFactory(tezos, adminSk)
        });
        
        it('scenario #1:\n- rewards are distributed to satellite (eve)\n- satellite (eve) and delegates (david/ivan) are compounding', async () => {
            try{
                
                // Initial Values
                delegationStorage = await delegationInstance.storage();

                // Distribute Operation
                const distributeOperation = await delegationInstance.methods.distributeReward([satelliteOne],MVK(50)).send();
                await distributeOperation.confirmation();
                delegationStorage = await delegationInstance.storage();
                doormanStorage  = await doormanInstance.storage();
                var satelliteRecord = await delegationStorage.satelliteRewardsLedger.get(satelliteOne)
                var satelliteStake  = await doormanStorage.userStakeBalanceLedger.get(satelliteOne)
                console.log("PRE-CLAIM SATELLITE: ", satelliteRecord.unpaid.toNumber(), satelliteStake.balance.toNumber())

                // Claim operations
                var claimOperation = await doormanInstance.methods.compound([satelliteOne, delegateOne, delegateTwo]).send();
                await claimOperation.confirmation()
                delegationStorage = await delegationInstance.storage();
                doormanStorage  = await doormanInstance.storage();
                var satelliteRecord = await delegationStorage.satelliteRewardsLedger.get(satelliteOne)
                satelliteStake  = await doormanStorage.userStakeBalanceLedger.get(satelliteOne)
                console.log("POST-CLAIM SATELLITE: ", satelliteRecord.unpaid.toNumber(), satelliteStake.balance.toNumber())
                var delegateRecord = await delegationStorage.satelliteRewardsLedger.get(delegateOne)
                var delegateStake  = await doormanStorage.userStakeBalanceLedger.get(delegateOne)
                console.log("POST-CLAIM DAVID: ", delegateRecord.unpaid.toNumber(), " | ", delegateRecord.paid.toNumber(), " | ", delegateStake.balance.toNumber())
                var delegateRecord = await delegationStorage.satelliteRewardsLedger.get(delegateTwo)
                delegateStake  = await doormanStorage.userStakeBalanceLedger.get(delegateTwo)
                console.log("POST-CLAIM IVAN: ", delegateRecord.unpaid.toNumber(), " | ", delegateRecord.paid.toNumber(), " | ", delegateStake.balance.toNumber())
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('scenario #2:\n- rewards are distributed to satellites (eve/alice)\n- satellite (eve) unregisters\n- delegate (david) undelegates from satellite (eve)\n- ex-satellite and satellite (eve/alice) compound\n- user (david) delegates to satellite (alice)\n- user (eve) registers as satellite', async () => {
            try{

                // Initial Values
                delegationStorage           = await delegationInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                mvkTokenStorage             = await mvkTokenInstance.storage();
                const reward                = MVK(100);
                const initSatelliteSMVK     = await doormanStorage.userStakeBalanceLedger.get(satelliteOne) 
                const initSatelliteRewards  = await delegationStorage.satelliteRewardsLedger.get(satelliteOne)
                
                var satelliteTest           = await delegationStorage.satelliteLedger.get(satelliteOne);
                var aliceTest               = await doormanStorage.userStakeBalanceLedger.get(delegateOne);
                var eveTest                 = await doormanStorage.userStakeBalanceLedger.get(delegateTwo);

                const initSatelliteRecord   = await delegationStorage.satelliteLedger.get(satelliteOne);
                const initDoormanBalance    = await mvkTokenStorage.ledger.get(contractDeployments.doorman.address);
                const satelliteVotingPower  = initSatelliteRecord.totalDelegatedAmount.toNumber() + initSatelliteRecord.stakedMvkBalance.toNumber();
                const satelliteFee          = initSatelliteRecord.satelliteFee.toNumber();

                // Distribute Operation
                const distributeOperation       = await delegationInstance.methods.distributeReward([satelliteOne, satelliteTwo],reward).send();
                await distributeOperation.confirmation();

                delegationStorage               = await delegationInstance.storage();
                doormanStorage                  = await doormanInstance.storage();
                mvkTokenStorage                 = await mvkTokenInstance.storage();
                const satelliteFeeReward        = Math.trunc(satelliteFee / 10000 * reward/2)
                const distributedReward         = reward / 2 - satelliteFeeReward
                const accumulatedRewardPerShare = distributedReward / satelliteVotingPower
                var unpaidRewards               = Math.trunc(initSatelliteRewards.unpaid.toNumber() + satelliteFeeReward)
                var satelliteRewards            = await delegationStorage.satelliteRewardsLedger.get(satelliteOne)
                var satelliteStake              = await doormanStorage.userStakeBalanceLedger.get(satelliteOne)
                var doormanBalance              = await mvkTokenStorage.ledger.get(contractDeployments.doorman.address);
                satelliteTest                   = await delegationStorage.satelliteLedger.get(satelliteOne);
                aliceTest                       = await doormanStorage.userStakeBalanceLedger.get(delegateOne);
                eveTest                         = await doormanStorage.userStakeBalanceLedger.get(delegateTwo);

                // Assertions
                assert.equal(satelliteRewards.unpaid.toNumber(), unpaidRewards)
                assert.equal(initSatelliteSMVK.balance.toNumber(), satelliteStake.balance.toNumber())
                assert.equal(doormanBalance.toNumber(), initDoormanBalance.toNumber() + reward)
                console.log("PRE-UNREGISTER SATELLITE: ", satelliteRewards.unpaid.toNumber(), " | ", satelliteStake.balance.toNumber())

                // Unregister operation
                await signerFactory(tezos, satelliteOneSk);
                const unregisterOperation   = await delegationInstance.methods.unregisterAsSatellite(satelliteOne).send();
                await unregisterOperation.confirmation();
                delegationStorage   = await delegationInstance.storage();
                doormanStorage      = await doormanInstance.storage();
                satelliteRewards    = await delegationStorage.satelliteRewardsLedger.get(satelliteOne)
                satelliteStake      = await doormanStorage.userStakeBalanceLedger.get(satelliteOne)

                // New unpaid reward
                unpaidRewards       = Math.trunc(initSatelliteRewards.unpaid.toNumber() + satelliteFeeReward + initSatelliteSMVK.balance.toNumber() * accumulatedRewardPerShare)

                // Assertions
                assert.equal(satelliteRewards.unpaid.toNumber(), unpaidRewards)
                assert.equal(initSatelliteSMVK.balance.toNumber(), satelliteStake.balance.toNumber())
                console.log("POST-UNREGISTER SATELLITE: ", satelliteRewards.unpaid.toNumber(), " | ", satelliteStake.balance.toNumber())

                // Undelegate operation
                await signerFactory(tezos, delegateOneSk);
                const initDelegateOneSMVK     = await doormanStorage.userStakeBalanceLedger.get(delegateOne) 
                const initDelegateOneRewards  = await delegationStorage.satelliteRewardsLedger.get(delegateOne)
                const undelegateOperation = await delegationInstance.methods.undelegateFromSatellite(delegateOne).send();
                await undelegateOperation.confirmation()
                delegationStorage = await delegationInstance.storage();
                doormanStorage  = await doormanInstance.storage();
                var delegateRewards = await delegationStorage.satelliteRewardsLedger.get(delegateOne)
                var delegateStake  = await doormanStorage.userStakeBalanceLedger.get(delegateOne)

                // Assertions
                assert.equal(delegateRewards.paid.toNumber(), initDelegateOneRewards.paid.toNumber());
                assert.equal(initDelegateOneSMVK.balance.toNumber(), delegateStake.balance.toNumber())
                console.log("POST-REDELEGATE ALICE: ", delegateRewards.unpaid.toNumber(), " | ", delegateStake.balance.toNumber())

                // Satellite Claim operation
                var paidRewards   = Math.trunc(initSatelliteRewards.unpaid.toNumber() + satelliteFeeReward + initSatelliteSMVK.balance.toNumber() * accumulatedRewardPerShare)
                satelliteRewards = await delegationStorage.satelliteRewardsLedger.get(satelliteOne)
                console.log("START: ", satelliteRewards)

                var claimOperation = await doormanInstance.methods.compound([satelliteOne, satelliteTwo]).send(); // COMPOUND FOR SATELLITE TWO TO PREPARE NEXT TEXT
                await claimOperation.confirmation()
                delegationStorage = await delegationInstance.storage();
                doormanStorage  = await doormanInstance.storage();
                satelliteRewards = await delegationStorage.satelliteRewardsLedger.get(satelliteOne)
                satelliteStake  = await doormanStorage.userStakeBalanceLedger.get(satelliteOne)

                console.log("START: ", satelliteRewards)
                console.log("POST-CLAIM SATELLITE: ", satelliteRewards.unpaid.toNumber(), " | ", satelliteStake.balance.toNumber())

                // Assertions
                assert.equal(satelliteRewards.unpaid.toNumber(), 0)
                assert.equal(initSatelliteSMVK.balance.toNumber() + paidRewards, satelliteStake.balance.toNumber())
                console.log("POST-UNREGISTER SATELLITE: ", satelliteRewards.unpaid.toNumber(), " | ", satelliteStake.balance.toNumber())

                // DelegateOne redelegate operation
                await signerFactory(tezos, delegateOneSk);
                const delegateOperation = await delegationInstance.methods.delegateToSatellite(delegateOne, satelliteTwo).send();
                await delegateOperation.confirmation()
                delegationStorage = await delegationInstance.storage();
                doormanStorage  = await doormanInstance.storage();
                delegateRewards = await delegationStorage.satelliteRewardsLedger.get(delegateOne)
                delegateStake  = await doormanStorage.userStakeBalanceLedger.get(delegateOne)

                // Assertions
                assert.equal(initDelegateOneSMVK.balance.toNumber(), delegateStake.balance.toNumber())
                console.log("POST-DELEGATE ALICE: ", delegateRewards.unpaid.toNumber(), " | ", delegateStake.balance.toNumber())

                // Init variables for claim
                const initDelegateTwoSMVK     = await doormanStorage.userStakeBalanceLedger.get(delegateTwo) 
                const initDelegateTwoRewards  = await delegationStorage.satelliteRewardsLedger.get(delegateTwo)

                // Claims operations
                claimOperation = await doormanInstance.methods.compound([delegateOne, delegateTwo]).send();
                await claimOperation.confirmation()
                delegationStorage = await delegationInstance.storage();
                doormanStorage  = await doormanInstance.storage();
                delegateRewards = await delegationStorage.satelliteRewardsLedger.get(delegateOne)
                delegateStake  = await doormanStorage.userStakeBalanceLedger.get(delegateOne)
                paidRewards   = delegateRewards.paid.toNumber() - initDelegateOneRewards.paid.toNumber()
                
                // Assertions
                assert.equal(delegateRewards.unpaid.toNumber(), delegateRewards.unpaid.toNumber())
                assert.equal(initDelegateOneSMVK.balance.toNumber() + paidRewards, delegateStake.balance.toNumber())
                console.log("POST-CLAIM DAVID: ", delegateRewards.unpaid.toNumber(), " | ", delegateRewards.paid.toNumber(), " | ", delegateStake.balance.toNumber())
                paidRewards   = Math.trunc(initDelegateTwoRewards.unpaid.toNumber() + initDelegateTwoSMVK.balance.toNumber() * accumulatedRewardPerShare)
                delegateRewards = await delegationStorage.satelliteRewardsLedger.get(delegateTwo)
                delegateStake  = await doormanStorage.userStakeBalanceLedger.get(delegateTwo)
                
                // Assertions
                console.log("POST-CLAIM IVAN: ", delegateRewards.unpaid.toNumber(), " | ", delegateRewards.paid.toNumber(), " | ", delegateStake.balance.toNumber())
                assert.equal(delegateRewards.unpaid.toNumber(), 0)
                assert.equal(initDelegateTwoSMVK.balance.toNumber() + paidRewards, delegateStake.balance.toNumber())

                // Reset -> Re-register as a Satellite
                await signerFactory(tezos, satelliteOneSk);
                const registerAsSatelliteOperation = await delegationInstance.methods
                    .registerAsSatellite(
                        mockSatelliteData.eve.name, 
                        mockSatelliteData.eve.desc, 
                        mockSatelliteData.eve.image,
                        mockSatelliteData.eve.website, 
                        mockSatelliteData.eve.satelliteFee,
                        mockSatelliteData.eve.oraclePublicKey, 
                        mockSatelliteData.eve.oraclePeerId
                    ).send();
                await registerAsSatelliteOperation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('satellites (eve/alice) who voted during the governance cycle should earn the cycle reward while proposer (eve) should not earn the success reward if the proposal is not executed', async () => {
            try{
                // Initial Values
                delegationStorage           = await delegationInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                governanceStorage           = await governanceInstance.storage();
                mvkTokenStorage             = await mvkTokenInstance.storage();
                const initDoormanBalance    = await mvkTokenStorage.ledger.get(contractDeployments.doorman.address);
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "New Proposal #1";
                const proposalDesc          = "Details about new proposal #1";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";
                const proposalReward        = governanceStorage.config.cycleVotersReward.toNumber();

                // Satellite ledger
                const firstSatelliteRecordStart     = await delegationStorage.satelliteRewardsLedger.get(satelliteOne)
                const firstSatelliteStakeStart      = await doormanStorage.userStakeBalanceLedger.get(satelliteOne)
                const secondSatelliteRecordStart    = await delegationStorage.satelliteRewardsLedger.get(satelliteTwo)
                const secondSatelliteStakeStart     = await doormanStorage.userStakeBalanceLedger.get(satelliteTwo)
                const firstSatellite                = await delegationStorage.satelliteLedger.get(satelliteOne);
                const firstSatelliteFeePct          = firstSatellite.satelliteFee.toNumber();
                const firstSatelliteFee             = firstSatelliteFeePct / 10000 * proposalReward/2;
                const firstSatelliteVotingPower     = firstSatellite.totalDelegatedAmount.toNumber() + firstSatellite.stakedMvkBalance.toNumber();
                const firstSatelliteDistributed     = proposalReward / 2 - firstSatelliteFee
                const firstSatelliteAccu            = firstSatelliteDistributed / firstSatelliteVotingPower
                const secondSatellite               = await delegationStorage.satelliteLedger.get(satelliteTwo);
                const secondSatelliteFeePct         = secondSatellite.satelliteFee.toNumber();
                const secondSatelliteFee            = secondSatelliteFeePct / 10000 * proposalReward/2;
                const secondSatelliteVotingPower    = secondSatellite.totalDelegatedAmount.toNumber() + secondSatellite.stakedMvkBalance.toNumber();
                const secondSatelliteDistributed    = proposalReward / 2 - secondSatelliteFee
                const secondSatelliteAccu           = secondSatelliteDistributed / secondSatelliteVotingPower;
                console.log("PRE-OPERATION SATELLITE ONE: ", firstSatelliteRecordStart.unpaid.toNumber(), " | ", firstSatelliteStakeStart.balance.toNumber())
                console.log("PRE-OPERATION SATELLITE TWO: ", secondSatelliteRecordStart.unpaid.toNumber(), " | ", secondSatelliteStakeStart.balance.toNumber())

                // Prepare proposal data
                const lambdaFunction                = await createLambdaBytes(
                    tezos.rpc.url,
                    contractDeployments.governanceProxy.address,
                    
                    'updateGeneralContracts',
                    [
                        contractDeployments.doorman.address,
                        "satelliteOne",
                        satelliteOne,
                        "Update"
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

                // Initial governance storage operations
                var updateGovernanceConfig  = await governanceInstance.methods.updateConfig(0, "configBlocksPerProposalRound").send();
                await updateGovernanceConfig.confirmation();
                updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configBlocksPerVotingRound").send();
                await updateGovernanceConfig.confirmation();
                updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configBlocksPerTimelockRound").send();
                await updateGovernanceConfig.confirmation();
                updateGovernanceConfig      = await governanceInstance.methods.updateConfig(1, "configMinProposalRoundVotePct").send();
                await updateGovernanceConfig.confirmation();

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
                var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("nay").send();
                await votingRoundVoteOperation.confirmation();

                await signerFactory(tezos, satelliteTwoSk);
                votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("pass").send();
                await votingRoundVoteOperation.confirmation();
                await signerFactory(tezos, satelliteOneSk);


                // Restart proposal round
                nextRoundOperation              = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                nextRoundOperation              = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                governanceStorage               = await governanceInstance.storage();

                // Post governance cycle reward distribution
                await signerFactory(tezos, adminSk);
                var governanceClaimOperation    = await governanceInstance.methods.distributeProposalRewards(satelliteOne, [proposalId]).send();
                await governanceClaimOperation.confirmation();

                governanceClaimOperation        = await governanceInstance.methods.distributeProposalRewards(satelliteTwo, [proposalId]).send();
                await governanceClaimOperation.confirmation();

                // Final values
                delegationStorage                       = await delegationInstance.storage();
                doormanStorage                          = await doormanInstance.storage();
                mvkTokenStorage                         = await mvkTokenInstance.storage();
                const finalDoormanBalance               = await mvkTokenStorage.ledger.get(contractDeployments.doorman.address);
                const firstSatelliteRecordNoClaim       = await delegationStorage.satelliteRewardsLedger.get(satelliteOne)
                const firstSatelliteStakeNoClaim        = await doormanStorage.userStakeBalanceLedger.get(satelliteOne)
                const secondSatelliteRecordNoClaim      = await delegationStorage.satelliteRewardsLedger.get(satelliteTwo)
                const secondSatelliteStakeNoClaim       = await doormanStorage.userStakeBalanceLedger.get(satelliteTwo)

                // Assertions
                assert.equal(finalDoormanBalance.toNumber(), initDoormanBalance.toNumber() + proposalReward)
                console.log("POST-OPERATION SATELLITE ONE: ", firstSatelliteRecordNoClaim.unpaid.toNumber(), " | ", firstSatelliteStakeNoClaim.balance.toNumber())
                console.log("POST-OPERATION SATELLITE TWO: ", secondSatelliteRecordNoClaim.unpaid.toNumber(), " | ", secondSatelliteStakeNoClaim.balance.toNumber())

                // Claim operations
                var claimOperation                  = await doormanInstance.methods.compound([satelliteOne, satelliteTwo]).send();
                await claimOperation.confirmation();

                // Final values
                delegationStorage                   = await delegationInstance.storage();
                doormanStorage                      = await doormanInstance.storage();
                const firstSatelliteReward          = firstSatelliteAccu * firstSatelliteStakeStart.balance.toNumber() + firstSatelliteFee + firstSatelliteRecordStart.unpaid.toNumber()
                const secondSatelliteReward         = secondSatelliteAccu * secondSatelliteStakeStart.balance.toNumber() + secondSatelliteFee + secondSatelliteRecordStart.unpaid.toNumber();
                const firstSatelliteRecordEnd       = await delegationStorage.satelliteRewardsLedger.get(satelliteOne)
                const firstSatelliteStakeEnd        = await doormanStorage.userStakeBalanceLedger.get(satelliteOne)
                const secondSatelliteRecordEnd      = await delegationStorage.satelliteRewardsLedger.get(satelliteTwo)
                const secondSatelliteStakeEnd       = await doormanStorage.userStakeBalanceLedger.get(satelliteTwo)

                // Assertions
                assert.equal(firstSatelliteRecordEnd.unpaid.toNumber(), 0)
                assert.equal(secondSatelliteRecordEnd.unpaid.toNumber(), 0)
                assert.equal(almostEqual(firstSatelliteStakeEnd.balance.toNumber(),firstSatelliteStakeStart.balance.toNumber() + firstSatelliteReward, 0.01), true)
                assert.equal(almostEqual(secondSatelliteStakeEnd.balance.toNumber(),secondSatelliteStakeStart.balance.toNumber() + secondSatelliteReward, 0.01), true)
                console.log("POST-CLAIM SATELLITE ONE: ", firstSatelliteRecordEnd.unpaid.toNumber(), " | ", firstSatelliteStakeEnd.balance.toNumber())
                console.log("POST-CLAIM SATELLITE TWO: ", secondSatelliteRecordEnd.unpaid.toNumber(), " | ", secondSatelliteStakeEnd.balance.toNumber()) 
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('satellites (eve/alice) who voted during the governance cycle should earn the cycle reward while proposer (eve) should earn the success reward if the proposal is executed', async () => {
            try{
                // Initial Values
                delegationStorage           = await delegationInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                governanceStorage           = await governanceInstance.storage();
                mvkTokenStorage             = await mvkTokenInstance.storage();
                const initDoormanBalance    = await mvkTokenStorage.ledger.get(contractDeployments.doorman.address);
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "New Proposal #1";
                const proposalDesc          = "Details about new proposal #1";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";
                const proposalReward        = governanceStorage.config.cycleVotersReward.toNumber();
                const proposerReward        = governanceStorage.config.successReward.toNumber();

                // Satellite ledger
                const firstSatelliteRecordStart     = await delegationStorage.satelliteRewardsLedger.get(satelliteOne)
                const firstSatelliteStakeStart      = await doormanStorage.userStakeBalanceLedger.get(satelliteOne)
                const secondSatelliteRecordStart    = await delegationStorage.satelliteRewardsLedger.get(satelliteTwo)
                const secondSatelliteStakeStart     = await doormanStorage.userStakeBalanceLedger.get(satelliteTwo)
                const firstSatellite                = await delegationStorage.satelliteLedger.get(satelliteOne);
                const firstSatelliteFeePct          = firstSatellite.satelliteFee.toNumber();
                const firstSatelliteFee             = firstSatelliteFeePct / 10000 * proposalReward/2;
                const firstSatelliteVotingPower     = firstSatellite.totalDelegatedAmount.toNumber() + firstSatellite.stakedMvkBalance.toNumber();
                const firstSatelliteDistributed     = proposalReward / 2 - firstSatelliteFee
                const firstSatelliteAccu            = firstSatelliteDistributed / firstSatelliteVotingPower
                const secondSatellite               = await delegationStorage.satelliteLedger.get(satelliteTwo);
                const secondSatelliteFeePct         = secondSatellite.satelliteFee.toNumber();
                const secondSatelliteFee            = secondSatelliteFeePct / 10000 * proposalReward/2;
                const secondSatelliteVotingPower    = secondSatellite.totalDelegatedAmount.toNumber() + secondSatellite.stakedMvkBalance.toNumber();
                const secondSatelliteDistributed    = proposalReward / 2 - secondSatelliteFee
                const secondSatelliteAccu           = secondSatelliteDistributed / secondSatelliteVotingPower;
                console.log("PRE-OPERATION SATELLITE ONE: ", firstSatelliteRecordStart.unpaid.toNumber(), " | ", firstSatelliteStakeStart.balance.toNumber())
                console.log("PRE-OPERATION SATELLITE TWO: ", secondSatelliteRecordStart.unpaid.toNumber(), " | ", secondSatelliteStakeStart.balance.toNumber())

                // Prepare proposal metadata
                const lambdaFunction                = await createLambdaBytes(
                    tezos.rpc.url,
                    contractDeployments.governanceProxy.address,
                    
                    'updateGeneralContracts',
                    [
                        contractDeployments.doorman.address,
                        "satelliteOne",
                        satelliteOne,
                        "Update"
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

                // Initial governance storage operations
                var updateGovernanceConfig  = await governanceInstance.methods.updateConfig(0, "configBlocksPerProposalRound").send();
                await updateGovernanceConfig.confirmation();
                updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configBlocksPerVotingRound").send();
                await updateGovernanceConfig.confirmation();
                updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configBlocksPerTimelockRound").send();
                await updateGovernanceConfig.confirmation();
                updateGovernanceConfig      = await governanceInstance.methods.updateConfig(1, "configMinProposalRoundVotePct").send();
                await updateGovernanceConfig.confirmation();

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
                await signerFactory(tezos, satelliteOneSk);

                // Restart proposal round
                nextRoundOperation              = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                nextRoundOperation              = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();
                governanceStorage               = await governanceInstance.storage();

                // Post governance cycle reward distribution
                var governanceClaimOperation    = await governanceInstance.methods.distributeProposalRewards(satelliteOne, [proposalId]).send();
                await governanceClaimOperation.confirmation();
                governanceClaimOperation        = await governanceInstance.methods.distributeProposalRewards(satelliteTwo, [proposalId]).send();
                await governanceClaimOperation.confirmation();

                // Final values
                delegationStorage                       = await delegationInstance.storage();
                doormanStorage                          = await doormanInstance.storage();
                mvkTokenStorage                         = await mvkTokenInstance.storage();
                const finalDoormanBalance               = await mvkTokenStorage.ledger.get(contractDeployments.doorman.address);
                const firstSatelliteRecordNoClaim       = await delegationStorage.satelliteRewardsLedger.get(satelliteOne)
                const firstSatelliteStakeNoClaim        = await doormanStorage.userStakeBalanceLedger.get(satelliteOne)
                const secondSatelliteRecordNoClaim      = await delegationStorage.satelliteRewardsLedger.get(satelliteTwo)
                const secondSatelliteStakeNoClaim       = await doormanStorage.userStakeBalanceLedger.get(satelliteTwo)

                // Assertions
                assert.equal(finalDoormanBalance.toNumber(), initDoormanBalance.toNumber() + proposalReward + proposerReward)
                console.log("POST-OPERATION SATELLITE ONE: ", firstSatelliteRecordNoClaim.unpaid.toNumber(), " | ", firstSatelliteStakeNoClaim.balance.toNumber())
                console.log("POST-OPERATION SATELLITE TWO: ", secondSatelliteRecordNoClaim.unpaid.toNumber(), " | ", secondSatelliteStakeNoClaim.balance.toNumber())

                // Claim operations
                var claimOperation  = await doormanInstance.methods.compound([satelliteOne, satelliteTwo]).send();
                await claimOperation.confirmation();

                // Final values
                delegationStorage                   = await delegationInstance.storage();
                doormanStorage                      = await doormanInstance.storage();
                const firstSatelliteReward          = firstSatelliteAccu * firstSatelliteStakeStart.balance.toNumber() + firstSatelliteFee + firstSatelliteRecordStart.unpaid.toNumber() + proposerReward;
                const secondSatelliteReward         = secondSatelliteAccu * secondSatelliteStakeStart.balance.toNumber() + secondSatelliteFee + secondSatelliteRecordStart.unpaid.toNumber();
                const firstSatelliteRecordEnd       = await delegationStorage.satelliteRewardsLedger.get(satelliteOne)
                const firstSatelliteStakeEnd        = await doormanStorage.userStakeBalanceLedger.get(satelliteOne)
                const secondSatelliteRecordEnd      = await delegationStorage.satelliteRewardsLedger.get(satelliteTwo)
                const secondSatelliteStakeEnd       = await doormanStorage.userStakeBalanceLedger.get(satelliteTwo)

                // Assertions
                assert.equal(firstSatelliteRecordEnd.unpaid.toNumber(), 0)
                assert.equal(secondSatelliteRecordEnd.unpaid.toNumber(), 0)
                assert.equal(almostEqual(firstSatelliteStakeEnd.balance.toNumber(),firstSatelliteStakeStart.balance.toNumber() + firstSatelliteReward, 0.01), true)
                assert.equal(almostEqual(secondSatelliteStakeEnd.balance.toNumber(),secondSatelliteStakeStart.balance.toNumber() + secondSatelliteReward, 0.01), true)
                console.log("POST-CLAIM SATELLITE ONE: ", firstSatelliteRecordEnd.unpaid.toNumber(), " | ", firstSatelliteStakeEnd.balance.toNumber())
                console.log("POST-CLAIM SATELLITE TWO: ", secondSatelliteRecordEnd.unpaid.toNumber(), " | ", secondSatelliteStakeEnd.balance.toNumber()) 
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('non-whitelist contract (david) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                delegationStorage = await delegationInstance.storage();

                // Distribute Operation
                await signerFactory(tezos, delegateOneSk);
                await chai.expect(delegationInstance.methods.distributeReward([satelliteOne],MVK(50)).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('whitelist (bob) should not be able to call this entrypoint if the doorman contract is not referenced in the storage', async () => {
            try{
                // Initial Values
                delegationStorage = await delegationInstance.storage();

                // Preparation operation
                var updateGeneralContractsOperation   = await governanceInstance.methods.updateGeneralContracts("doorman", contractDeployments.doorman.address, "remove").send();
                await updateGeneralContractsOperation.confirmation();

                // Distribute Operation
                await chai.expect(delegationInstance.methods.distributeReward([satelliteOne],MVK(50)).send()).to.be.rejected;

                // Reset operation
                updateGeneralContractsOperation   = await governanceInstance.methods.updateGeneralContracts("doorman", contractDeployments.doorman.address, "update").send();
                await updateGeneralContractsOperation.confirmation();
            }
            catch(e) {
                console.dir(e, {depth: 5});
            }
        })

        it('whitelist (bob) should not be able to call this entrypoint if the satellite treasury contract is not referenced in the storage', async () => {
            try{
                // Initial Values
                delegationStorage = await delegationInstance.storage();

                // Preparation operation
                var updateGeneralContractsOperation   = await governanceInstance.methods.updateGeneralContracts("satelliteTreasury", contractDeployments.treasury.address, "remove").send();
                await updateGeneralContractsOperation.confirmation();

                // Distribute Operation
                await chai.expect(delegationInstance.methods.distributeReward([satelliteOne],MVK(50)).send()).to.be.rejected;

                // Reset operation
                updateGeneralContractsOperation   = await governanceInstance.methods.updateGeneralContracts("satelliteTreasury", contractDeployments.treasury.address, "update").send();
                await updateGeneralContractsOperation.confirmation();
            }
            catch(e) {
                console.dir(e, {depth: 5});
            }
        })

        it('whitelist (bob) should not be able to call this entrypoint if one of the provided satellites (david) does not exist', async () => {
            try{
                // Initial Values
                delegationStorage = await delegationInstance.storage();

                // Distribute Operation
                await chai.expect(delegationInstance.methods.distributeReward([satelliteOne, delegateOne],MVK(50)).send()).to.be.rejected;
            }
            catch(e) {
                console.dir(e, {depth: 5});
            }
        })
    });
});
