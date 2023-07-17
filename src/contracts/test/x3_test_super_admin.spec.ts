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

import { bob, alice, oscar} from "../scripts/sandbox/accounts";
import { createLambdaBytes } from "@mavrykdynamics/create-lambda-bytes"
import { 
    signerFactory,
    updateOperators
} from './helpers/helperFunctions'


// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("Break Glass Super Admin tests", async () => {
    
    var utils: Utils;
    let tezos

    let doormanAddress
    let tokenId = 0

    let doormanInstance;
    let delegationInstance;
    let mvkTokenInstance;
    let councilInstance;
    let governanceInstance;
    let governanceProxyInstance;
    let emergencyGovernanceInstance;
    let breakGlassInstance;
    let vestingInstance;
    let treasuryInstance;

    let doormanStorage;
    let delegationStorage;
    let mvkTokenStorage;
    let councilStorage;
    let governanceStorage;
    let governanceProxyStorage;
    let emergencyGovernanceStorage;
    let breakGlassStorage;
    let vestingStorage;
    let treasuryStorage;

    let updateOperatorsOperation

    before("setup", async () => {

        utils = new Utils();
        await utils.init(bob.sk);
        tezos = utils.tezos

        doormanAddress                  = contractDeployments.doorman.address;

        doormanInstance                 = await utils.tezos.contract.at(doormanAddress);
        delegationInstance              = await utils.tezos.contract.at(contractDeployments.delegation.address);
        mvkTokenInstance                = await utils.tezos.contract.at(contractDeployments.mvkToken.address);
        councilInstance                 = await utils.tezos.contract.at(contractDeployments.council.address);
        governanceInstance              = await utils.tezos.contract.at(contractDeployments.governance.address);
        governanceProxyInstance         = await utils.tezos.contract.at(contractDeployments.governanceProxy.address);
        emergencyGovernanceInstance     = await utils.tezos.contract.at(contractDeployments.emergencyGovernance.address);
        breakGlassInstance              = await utils.tezos.contract.at(contractDeployments.breakGlass.address);
        vestingInstance                 = await utils.tezos.contract.at(contractDeployments.vesting.address);
        treasuryInstance                = await utils.tezos.contract.at(contractDeployments.treasury.address);
            
        doormanStorage                  = await doormanInstance.storage();
        delegationStorage               = await delegationInstance.storage();
        mvkTokenStorage                 = await mvkTokenInstance.storage();
        councilStorage                  = await councilInstance.storage();
        governanceStorage               = await governanceInstance.storage();
        governanceProxyStorage          = await governanceProxyInstance.storage();
        emergencyGovernanceStorage      = await emergencyGovernanceInstance.storage();
        breakGlassStorage               = await breakGlassInstance.storage();
        vestingStorage                  = await vestingInstance.storage();
        treasuryStorage                 = await treasuryInstance.storage();

    });

    describe("Glass not broken", async () => {

    });

    describe("Glass broken", async() => {
        describe("Break Glass Contract", async () => {

            describe("%setSingleContractAdmin", async () => {

                // before("Trigger Break Glass", async () => {
                //     try{
                //         // Initial Values
                //         emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();

                //         // Set all contracts admin to governance address if it is not
                //         await signerFactory(tezos, bob.sk);
                //         governanceStorage             = await governanceInstance.storage();
                //         var generalContracts          = [
                //             contractDeployments.aggregatorFactory.address,
                //             contractDeployments.breakGlass.address,
                //             contractDeployments.council.address,
                //             contractDeployments.delegation.address,
                //             contractDeployments.doorman.address,
                //             contractDeployments.emergencyGovernance.address,
                //             contractDeployments.farmFactory.address,
                //             contractDeployments.vesting.address,
                //             contractDeployments.treasuryFactory.address,
                //             contractDeployments.lendingController.address,
                //             contractDeployments.vaultFactory.address,
                //             contractDeployments.governance.address,
                //         ]
                        
                //         var updateConfigOperation     = await emergencyGovernanceInstance.methods.updateConfig(1,"configStakedMvkPercentRequired").send();
                //         await updateConfigOperation.confirmation();
                //         updateConfigOperation         = await emergencyGovernanceInstance.methods.updateConfig(0,"configRequiredFeeMutez").send();
                //         await updateConfigOperation.confirmation();
                //         updateConfigOperation = await breakGlassInstance.methods.updateConfig(2,"configThreshold").send();
                //         await updateConfigOperation.confirmation();

                //         // Initial governance storage operations
                //         var updateGovernanceConfig  = await governanceInstance.methods.updateConfig(0, "configBlocksPerProposalRound").send();
                //         await updateGovernanceConfig.confirmation();
                //         updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configBlocksPerVotingRound").send();
                //         await updateGovernanceConfig.confirmation();
                //         updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configBlocksPerTimelockRound").send();
                //         await updateGovernanceConfig.confirmation();
                //         updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configMinProposalRoundVotePct").send();
                //         await updateGovernanceConfig.confirmation();
                //         updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configMinQuorumPercentage").send();
                //         await updateGovernanceConfig.confirmation();
                //         updateGovernanceConfig      = await governanceInstance.methods.updateConfig(1, "configMinYayVotePercentage").send();
                //         await updateGovernanceConfig.confirmation();

                //         // Register Alice and Bob as satellites
                //         updateOperatorsOperation = await updateOperators(mvkTokenInstance, bob.pkh, doormanAddress, tokenId);
                //         await updateOperatorsOperation.confirmation();
    
                //         var stakeOperation = await doormanInstance.methods.stake(MVK(100)).send();
                //         await stakeOperation.confirmation();

                //         var registerAsSatelliteOperation = await delegationInstance.methods
                //             .registerAsSatellite(
                //                 "Bob", 
                //                 "Bob description", 
                //                 "Bob image", 
                //                 "Bob website",
                //                 1000
                //             ).send();
                //         await registerAsSatelliteOperation.confirmation();

                //         await signerFactory(tezos, alice.sk)
                //         updateOperatorsOperation = await updateOperators(mvkTokenInstance, alice.pkh, doormanAddress, tokenId);
                //         await updateOperatorsOperation.confirmation();
    
                //         stakeOperation = await doormanInstance.methods.stake(MVK(100)).send();
                //         await stakeOperation.confirmation();
                //         var registerAsSatelliteOperation = await delegationInstance.methods
                //             .registerAsSatellite(
                //                 "Alice", 
                //                 "Alice description", 
                //                 "Alice image", 
                //                 "Alice website",
                //                 1000
                //             ).send();
                //         await registerAsSatelliteOperation.confirmation();

                //         // Set all contracts admin to proxy
                //         await signerFactory(tezos, bob.sk)
                //         var setAdminOperation         = await governanceInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                //         await setAdminOperation.confirmation();
                //         for (let entry of generalContracts){
                //             // Get contract storage
                //             var contract        = await utils.tezos.contract.at(entry);
                //             var storage:any     = await contract.storage();

                //             // Check admin
                //             if(storage.hasOwnProperty('admin') && storage.admin!==contractDeployments.governanceProxy.address && storage.admin!==contractDeployments.breakGlass.address){
                //                 setAdminOperation   = await contract.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                //                 await setAdminOperation.confirmation()
                //             }
                //         }
            
                //         const emergencyControlOperation = await emergencyGovernanceInstance.methods.triggerEmergencyControl(
                //             "Test emergency governance", 
                //             "For tests"
                //         ).send({amount: 0});
                //         await emergencyControlOperation.confirmation();
                        
                //         const voteOperation     = await emergencyGovernanceInstance.methods.voteForEmergencyControl().send();
                //         await voteOperation.confirmation();

                //         // Check if glass was broken
                //         breakGlassStorage       = await breakGlassInstance.storage();
                //         const glassBroken       = breakGlassStorage.glassBroken;
                //         assert.equal(glassBroken, true);
                //         console.log("GLASS BROKEN: ", glassBroken)

                //         // Break glass action to set govenance admin to bob
                //         await signerFactory(tezos, bob.sk)
                //         breakGlassStorage   = await breakGlassInstance.storage();
                //         var breakGlassActionID    = breakGlassStorage.actionCounter;
                //         const propagateActionOperation    = await breakGlassInstance.methods.propagateBreakGlass().send();
                //         await propagateActionOperation.confirmation();

                //         // Sign action propagate action
                //         await signerFactory(tezos, alice.sk);
                //         var signActionOperation   = await breakGlassInstance.methods.signAction(breakGlassActionID).send();
                //         await signActionOperation.confirmation();

                //         // Set admin action for governance contract
                //         await signerFactory(tezos, bob.sk);
                //         breakGlassStorage   = await breakGlassInstance.storage();
                //         breakGlassActionID    = breakGlassStorage.actionCounter;
                //         var setAdminActionOperation = await breakGlassInstance.methods.setSingleContractAdmin(contractDeployments.governance.address, bob.pkh).send();
                //         await setAdminActionOperation.confirmation()

                //         // Sign set admin action
                //         await signerFactory(tezos, alice.sk);
                //         signActionOperation   = await breakGlassInstance.methods.signAction(breakGlassActionID).send();
                //         await signActionOperation.confirmation();

                //         // Set admin action for delegation contract
                //         await signerFactory(tezos, bob.sk);
                //         breakGlassStorage   = await breakGlassInstance.storage();
                //         breakGlassActionID    = breakGlassStorage.actionCounter;
                //         setAdminActionOperation = await breakGlassInstance.methods.setSingleContractAdmin(contractDeployments.delegation.address, bob.pkh).send();
                //         await setAdminActionOperation.confirmation()

                //         // Sign set admin action
                //         await signerFactory(tezos, alice.sk);
                //         signActionOperation   = await breakGlassInstance.methods.signAction(breakGlassActionID).send();
                //         await signActionOperation.confirmation();

                //         // Unpause entrypoint in delegation contract for distribute reward in next test
                //         await signerFactory(tezos, bob.sk);
                //         var unpauseOperation  = await delegationInstance.methods.unpauseAll().send();
                //         await unpauseOperation.confirmation()

                //         // Set admin action for treasury contract
                //         await signerFactory(tezos, bob.sk);
                //         breakGlassStorage   = await breakGlassInstance.storage();
                //         breakGlassActionID    = breakGlassStorage.actionCounter;
                //         setAdminActionOperation = await breakGlassInstance.methods.setSingleContractAdmin(contractDeployments.treasury.address, bob.pkh).send();
                //         await setAdminActionOperation.confirmation()

                //         // Sign set admin action
                //         await signerFactory(tezos, alice.sk);
                //         signActionOperation   = await breakGlassInstance.methods.signAction(breakGlassActionID).send();
                //         await signActionOperation.confirmation();

                //         // Unpause entrypoint in delegation contract for distribute reward in next test
                //         await signerFactory(tezos, bob.sk);
                //         unpauseOperation  = await treasuryInstance.methods.unpauseAll().send();
                //         await unpauseOperation.confirmation()
                //     }
                //     catch (e){
                //         console.dir(e, {depth: 5})
                //     }
                // })

                // beforeEach("Set signer to admin", async () => {
                //     await signerFactory(tezos, bob.sk)
                // });

                // it("Break Glass Council should not be able to call this entrypoint if the new admin is not a whitelisted developer, the governance contract or the breakGlass contract", async() => {
                //     try{
                //         // Initial values
                //         governanceStorage           = await governanceInstance.storage();
                //         const newAdmin              = oscar.pkh;
                //         const targetContract        = doormanAddress;
                //         const whitelistedDevelopers = await governanceStorage.whitelistDevelopers;

                //         console.log("WHITELISTED DEVELOPERS: ", whitelistedDevelopers);

                //         // Operation
                //         await chai.expect(breakGlassInstance.methods.setSingleContractAdmin(targetContract, newAdmin).send()).to.be.rejected;

                //         // Assertions
                //         assert.strictEqual(whitelistedDevelopers.includes(newAdmin), false)
                //     }
                //     catch (e){
                //         console.dir(e, {depth: 5})
                //     }
                // })

                it("Break Glass Council should not be able to call this entrypoint, if the new admin was a whitelisted developer but was removed midway before the break glass action was executed", async() => {
                    try{
                        // Reset governance admin to proxy
                        const resetAdmin    = await governanceInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                        await resetAdmin.confirmation();

                        // Initial values
                        governanceStorage           = await governanceInstance.storage();
                        breakGlassStorage           = await breakGlassInstance.storage();
                        const breakGlassActionID    = breakGlassStorage.actionCounter;
                        const newAdmin              = bob.pkh;
                        const targetContract        = doormanAddress;
                        const whitelistedDevelopers = await governanceStorage.whitelistDevelopers;
                        const proposalId            = governanceStorage.nextProposalId.toNumber();
                        const proposalName          = "Remove Bob";
                        const proposalDesc          = "Details about new proposal";
                        const proposalIpfs          = "ipfs://QM123456789";
                        const proposalSourceCode    = "Proposal Source Code";

                        // Preparation
                        const setSingleContractAdminOperation   = await breakGlassInstance.methods.setSingleContractAdmin(targetContract, newAdmin).send();
                        await setSingleContractAdminOperation.confirmation();

                        // Remove User from whitelisted dev
                        const lambdaFunction        = await createLambdaBytes(
                            tezos.rpc.url,
                            contractDeployments.governanceProxy.address,
                            
                            'updateWhitelistDevelopers',
                            [
                                contractDeployments.governance.address,
                                newAdmin
                            ]
                        );

                        const proposalData = [
                            {
                                addOrSetProposalData: {
                                    title: "Metadata#1",
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
                        await signerFactory(tezos, alice.sk);
                        voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                        await voteOperation.confirmation();
                        await signerFactory(tezos, bob.sk);
                        nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                        await nextRoundOperation.confirmation();

                        // Votes operation -> both satellites vote
                        var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                        await votingRoundVoteOperation.confirmation();
                        await signerFactory(tezos, alice.sk);
                        votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                        await votingRoundVoteOperation.confirmation();

                        // Execute proposal
                        await signerFactory(tezos, bob.sk);
                        nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                        await nextRoundOperation.confirmation();
                        nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                        await nextRoundOperation.confirmation();

                        // Final values
                        governanceStorage   = await governanceInstance.storage();
                        const proposal      = await governanceStorage.proposalLedger.get(proposalId);
                        const whitelistedDevelopersEnd = await governanceStorage.whitelistDevelopers;

                        console.log(newAdmin);
                        console.log(whitelistedDevelopers);
                        console.log(whitelistedDevelopersEnd);

                        // Assertions
                        assert.strictEqual(whitelistedDevelopers.includes(newAdmin), true)
                        assert.strictEqual(whitelistedDevelopersEnd.includes(newAdmin), false)

                        // Operation
                        await signerFactory(tezos, alice.sk);
                        await chai.expect(breakGlassInstance.methods.signAction(breakGlassActionID).send()).to.be.rejected;
                    }
                    catch (e){
                        console.dir(e, {depth: 5})
                    }
                })

                // it("Break Glass Council should be able to call this entrypoint if the new admin is a whitelisted developer", async() => {
                //     try{
                //         // Reset delegation address to BreakGlass
                //         const resetAdmin    = await delegationInstance.methods.setAdmin(contractDeployments.breakGlass.address).send();
                //         await resetAdmin.confirmation();

                //         // Initial values
                //         governanceStorage           = await governanceInstance.storage();
                //         breakGlassStorage           = await breakGlassInstance.storage();
                //         const newAdmin              = alice.pkh;
                //         const targetContract        = contractDeployments.delegation.address;
                //         const breakGlassActionID    = breakGlassStorage.actionCounter;

                //         // Operation
                //         const setSingleContractAdminOperation   = await breakGlassInstance.methods.setSingleContractAdmin(targetContract, newAdmin).send();
                //         await setSingleContractAdminOperation.confirmation();

                //         // Sign action
                //         await signerFactory(tezos, alice.sk);
                //         const signActionOperation   = await breakGlassInstance.methods.signAction(breakGlassActionID).send();
                //         await signActionOperation.confirmation();

                //         // Final values
                //         governanceStorage           = await governanceInstance.storage();
                //         delegationStorage           = await delegationInstance.storage();
                //         const whitelistedDevelopers = await governanceStorage.whitelistDevelopers;

                //         // Assertions
                //         assert.strictEqual(whitelistedDevelopers.includes(newAdmin), true);
                //         assert.strictEqual(delegationStorage.admin, newAdmin);
                //     }
                //     catch (e){
                //         console.dir(e, {depth: 5})
                //     }
                // })

                // it("Break Glass Council should be able to call this entrypoint if the new admin is the governance contract", async() => {
                //     try{
                //         // Initial values
                //         governanceStorage           = await governanceInstance.storage();
                //         breakGlassStorage           = await breakGlassInstance.storage();
                //         const newAdmin              = contractDeployments.governanceProxy.address;
                //         const targetContract        = contractDeployments.council.address;
                //         const breakGlassActionID    = breakGlassStorage.actionCounter;

                //         // Operation
                //         councilStorage   = await councilInstance.storage();
                //         // console.log(councilStorage.admin)
                //         const setSingleContractAdminOperation   = await breakGlassInstance.methods.setSingleContractAdmin(targetContract, newAdmin).send();
                //         await setSingleContractAdminOperation.confirmation();

                //         // Sign action
                //         await signerFactory(tezos, alice.sk);
                //         const signActionOperation   = await breakGlassInstance.methods.signAction(breakGlassActionID).send();
                //         await signActionOperation.confirmation();

                //         // Final values
                //         councilStorage              = await councilInstance.storage();

                //         // Assertions
                //         assert.strictEqual(councilStorage.admin, newAdmin);
                //     }
                //     catch (e){
                //         console.dir(e, {depth: 5})
                //     }
                // })

                // it("Break Glass Council should be able to call this entrypoint if the new admin is the breakGlass contract", async() => {
                //     try{
                //         // Initial values
                //         governanceStorage           = await governanceInstance.storage();
                //         breakGlassStorage           = await breakGlassInstance.storage();
                //         const newAdmin              = contractDeployments.breakGlass.address;
                //         const targetContract        = contractDeployments.emergencyGovernance.address;
                //         const breakGlassActionID    = breakGlassStorage.actionCounter;

                //         // Operation
                //         const setSingleContractAdminOperation   = await breakGlassInstance.methods.setSingleContractAdmin(targetContract, newAdmin).send();
                //         await setSingleContractAdminOperation.confirmation();

                //         // Sign action
                //         await signerFactory(tezos, alice.sk);
                //         const signActionOperation   = await breakGlassInstance.methods.signAction(breakGlassActionID).send();
                //         await signActionOperation.confirmation();

                //         // Final values
                //         emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();

                //         // Assertions
                //         assert.strictEqual(emergencyGovernanceStorage.admin, newAdmin);
                //     }
                //     catch (e){
                //         console.dir(e, {depth: 5})
                //     }
                // })
            });
    
            describe("%setContractsAdmin", async () => {
                beforeEach("Set signer to admin", async () => {
                    await signerFactory(tezos, bob.sk)
                });
            });
    
        })
    })
});
