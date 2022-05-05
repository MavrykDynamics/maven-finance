const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
const { InMemorySigner, importKey } = require("@taquito/signer");
import assert, { ok, rejects, strictEqual } from "assert";
import { Utils, MVK } from "./helpers/Utils";
import fs from "fs";
import { confirmOperation } from "../scripts/confirmation";

const chai = require("chai");
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

import env from "../env";
import { bob, alice, eve, mallory, oscar, trudy, isaac, david, susie, ivan } from "../scripts/sandbox/accounts";

import doormanAddress from '../deployments/doormanAddress.json';
import delegationAddress from '../deployments/delegationAddress.json';
import mvkTokenAddress from '../deployments/mvkTokenAddress.json';
import councilAddress from '../deployments/councilAddress.json';
import governanceAddress from '../deployments/governanceAddress.json';
import governanceProxyAddress from '../deployments/governanceProxyAddress.json';
import emergencyGovernanceAddress from '../deployments/emergencyGovernanceAddress.json';
import breakGlassAddress from '../deployments/breakGlassAddress.json';
import vestingAddress from '../deployments/vestingAddress.json';
import treasuryAddress from '../deployments/treasuryAddress.json';
import { MichelsonMap } from "@taquito/taquito";

describe("Break Glass Super Admin tests", async () => {
    var utils: Utils;

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
    
    const signerFactory = async (pk) => {
        await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
        return utils.tezos;
    };

    before("setup", async () => {

        utils = new Utils();
        await utils.init(bob.sk);

        doormanInstance    = await utils.tezos.contract.at(doormanAddress.address);
        delegationInstance    = await utils.tezos.contract.at(delegationAddress.address);
        mvkTokenInstance   = await utils.tezos.contract.at(mvkTokenAddress.address);
        councilInstance   = await utils.tezos.contract.at(councilAddress.address);
        governanceInstance = await utils.tezos.contract.at(governanceAddress.address);
        governanceProxyInstance = await utils.tezos.contract.at(governanceProxyAddress.address);
        emergencyGovernanceInstance    = await utils.tezos.contract.at(emergencyGovernanceAddress.address);
        breakGlassInstance = await utils.tezos.contract.at(breakGlassAddress.address);
        vestingInstance = await utils.tezos.contract.at(vestingAddress.address);
        treasuryInstance = await utils.tezos.contract.at(treasuryAddress.address);
            
        doormanStorage    = await doormanInstance.storage();
        delegationStorage    = await delegationInstance.storage();
        mvkTokenStorage   = await mvkTokenInstance.storage();
        councilStorage   = await councilInstance.storage();
        governanceStorage = await governanceInstance.storage();
        governanceProxyStorage = await governanceProxyInstance.storage();
        emergencyGovernanceStorage = await emergencyGovernanceInstance.storage();
        breakGlassStorage = await breakGlassInstance.storage();
        vestingStorage = await vestingInstance.storage();
        treasuryStorage = await treasuryInstance.storage();

        console.log('-- -- -- -- -- Break Glass Tests -- -- -- --')
        console.log('Doorman Contract deployed at:', doormanInstance.address);
        console.log('Delegation Contract deployed at:', delegationInstance.address);
        console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
        console.log('Council Contract deployed at:', councilInstance.address);
        console.log('Governance Contract deployed at:', governanceInstance.address);
        console.log('Emergency Governance Contract deployed at:', emergencyGovernanceInstance.address);
        console.log('Break Glass Contract deployed at:', breakGlassInstance.address);
        console.log('Vesting Contract deployed at:', vestingInstance.address);
        console.log('Treasury Contract deployed at:', treasuryInstance.address);
        console.log('Bob address: ' + bob.pkh);
        console.log('Alice address: ' + alice.pkh);
        console.log('Eve address: ' + eve.pkh);
        console.log('Mallory address: ' + mallory.pkh);
        console.log('Oscar address: ' + oscar.pkh);
        console.log('-- -- -- -- -- -- -- -- --')
    });

    describe("Glass not broken", async () => {

    });

    describe("Glass broken", async() => {
        describe("Break Glass Contract", async () => {

            describe("%setSingleContractAdmin", async () => {

                before("Trigger Break Glass", async () => {
                    try{
                        // Initial Values
                        emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();

                        // Set all contracts admin to governance address if it is not
                        await signerFactory(bob.sk);
                        governanceStorage             = await governanceInstance.storage();
                        var generalContracts          = governanceStorage.generalContracts.entries();
                        var updateConfigOperation     = await emergencyGovernanceInstance.methods.updateConfig(1,"configStakedMvkPercentRequired").send();
                        await updateConfigOperation.confirmation();
                        updateConfigOperation         = await emergencyGovernanceInstance.methods.updateConfig(0,"configRequiredFeeMutez").send();
                        await updateConfigOperation.confirmation();
                        updateConfigOperation = await breakGlassInstance.methods.updateConfig(2,"configThreshold").send();
                        await updateConfigOperation.confirmation();

                        // Initial governance storage operations
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
                        updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configMinimumStakeReqPercentage").send();
                        await updateGovernanceConfig.confirmation();
                        updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configMinQuorumPercentage").send();
                        await updateGovernanceConfig.confirmation();
                        updateGovernanceConfig      = await governanceInstance.methods.updateConfig(1, "configMinQuorumMvkTotal").send();
                        await updateGovernanceConfig.confirmation();
                        updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configMinimumStakeReqPercentage").send();
                        await updateGovernanceConfig.confirmation();

                        // Register Alice and Bob as satellites
                        var updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
                        {
                            add_operator: {
                                owner    : bob.pkh,
                                operator : doormanAddress.address,
                                token_id : 0,
                            },
                        }])
                        .send()
                        await updateOperatorsOperation.confirmation();
                        var stakeOperation = await doormanInstance.methods.stake(MVK(100)).send();
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

                        await signerFactory(alice.sk)
                        var updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
                        {
                            add_operator: {
                                owner    : alice.pkh,
                                operator : doormanAddress.address,
                                token_id : 0,
                            },
                        }])
                        .send()
                        await updateOperatorsOperation.confirmation();
                        stakeOperation = await doormanInstance.methods.stake(MVK(100)).send();
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

                        // Set all contracts admin to proxy
                        await signerFactory(bob.sk)
                        var setAdminOperation         = await governanceInstance.methods.setAdmin(governanceProxyAddress.address).send();
                        await setAdminOperation.confirmation();
                        for (let entry of generalContracts){
                            // Get contract storage
                            var contract        = await utils.tezos.contract.at(entry[1]);
                            var storage:any     = await contract.storage();

                            // Check admin
                            if(storage.hasOwnProperty('admin') && storage.admin!==governanceProxyAddress.address && storage.admin!==breakGlassAddress.address){
                                setAdminOperation   = await contract.methods.setAdmin(governanceProxyAddress.address).send();
                                await setAdminOperation.confirmation()
                            }
                        }
            
                        const emergencyControlOperation = await emergencyGovernanceInstance.methods.triggerEmergencyControl(
                            "Test emergency governance", 
                            "For tests"
                        ).send({amount: 0});
                        await emergencyControlOperation.confirmation();
                        
                        const voteOperation     = await emergencyGovernanceInstance.methods.voteForEmergencyControl().send();
                        await voteOperation.confirmation();

                        // Check if glass was broken
                        breakGlassStorage       = await breakGlassInstance.storage();
                        const glassBroken       = breakGlassStorage.glassBroken;
                        assert.equal(glassBroken, true);
                        console.log("GLASS BROKEN: ", glassBroken)

                        // Break glass action to set govenance admin to bob
                        await signerFactory(bob.sk)
                        breakGlassStorage   = await breakGlassInstance.storage();
                        var breakGlassActionID    = breakGlassStorage.actionCounter;
                        const propagateActionOperation    = await breakGlassInstance.methods.propagateBreakGlass().send();
                        await propagateActionOperation.confirmation();

                        // Sign action propagate action
                        await signerFactory(alice.sk);
                        var signActionOperation   = await breakGlassInstance.methods.signAction(breakGlassActionID).send();
                        await signActionOperation.confirmation();

                        // Set admin action for governance contract
                        await signerFactory(bob.sk);
                        breakGlassStorage   = await breakGlassInstance.storage();
                        breakGlassActionID    = breakGlassStorage.actionCounter;
                        var setAdminActionOperation = await breakGlassInstance.methods.setSingleContractAdmin(bob.pkh, governanceAddress.address).send();
                        await setAdminActionOperation.confirmation()

                        // Sign set admin action
                        await signerFactory(alice.sk);
                        signActionOperation   = await breakGlassInstance.methods.signAction(breakGlassActionID).send();
                        await signActionOperation.confirmation();

                        // Set admin action for delegation contract
                        await signerFactory(bob.sk);
                        breakGlassStorage   = await breakGlassInstance.storage();
                        breakGlassActionID    = breakGlassStorage.actionCounter;
                        setAdminActionOperation = await breakGlassInstance.methods.setSingleContractAdmin(bob.pkh, delegationAddress.address).send();
                        await setAdminActionOperation.confirmation()

                        // Sign set admin action
                        await signerFactory(alice.sk);
                        signActionOperation   = await breakGlassInstance.methods.signAction(breakGlassActionID).send();
                        await signActionOperation.confirmation();

                        // Unpause entrypoint in delegation contract for distribute reward in next test
                        await signerFactory(bob.sk);
                        var unpauseOperation  = await delegationInstance.methods.unpauseAll().send();
                        await unpauseOperation.confirmation()

                        // Set admin action for treasury contract
                        await signerFactory(bob.sk);
                        breakGlassStorage   = await breakGlassInstance.storage();
                        breakGlassActionID    = breakGlassStorage.actionCounter;
                        setAdminActionOperation = await breakGlassInstance.methods.setSingleContractAdmin(bob.pkh, treasuryAddress.address).send();
                        await setAdminActionOperation.confirmation()

                        // Sign set admin action
                        await signerFactory(alice.sk);
                        signActionOperation   = await breakGlassInstance.methods.signAction(breakGlassActionID).send();
                        await signActionOperation.confirmation();

                        // Unpause entrypoint in delegation contract for distribute reward in next test
                        await signerFactory(bob.sk);
                        unpauseOperation  = await treasuryInstance.methods.unpauseAll().send();
                        await unpauseOperation.confirmation()
                    }
                    catch (e){
                        console.dir(e, {depth: 5})
                    }
                })

                beforeEach("Set signer to admin", async () => {
                    await signerFactory(bob.sk)
                });

                it("Council should not be able to call this entrypoint if the new admin is not a whitelisted developer, the governance contract or the breakGlass contract", async() => {
                    try{
                        // Initial values
                        governanceStorage           = await governanceInstance.storage();
                        const newAdmin              = oscar.pkh;
                        const targetContract        = doormanAddress.address;
                        const whitelistedDevelopers = await governanceStorage.whitelistDevelopers;

                        console.log("WHITELISTED: ", whitelistedDevelopers);

                        // Operation
                        await chai.expect(breakGlassInstance.methods.setSingleContractAdmin(newAdmin, targetContract).send()).to.be.rejected;

                        // Assertions
                        assert.strictEqual(whitelistedDevelopers.includes(newAdmin), false)
                    }
                    catch (e){
                        console.dir(e, {depth: 5})
                    }
                })

                it("Council should not be able to call this entrypoint if the new admin was a whitelisted developer being removed before executing the action", async() => {
                    try{
                        // Reset governance admin to proxy
                        const resetAdmin    = await governanceInstance.methods.setAdmin(governanceProxyAddress.address).send();
                        await resetAdmin.confirmation();

                        // Initial values
                        governanceStorage           = await governanceInstance.storage();
                        breakGlassStorage           = await breakGlassInstance.storage();
                        const breakGlassActionID    = breakGlassStorage.actionCounter;
                        const newAdmin              = bob.pkh;
                        const targetContract        = doormanAddress.address;
                        const whitelistedDevelopers = await governanceStorage.whitelistDevelopers;
                        const proposalId            = governanceStorage.nextProposalId.toNumber();
                        const proposalName          = "Remove Bob";
                        const proposalDesc          = "Details about new proposal";
                        const proposalIpfs          = "ipfs://QM123456789";
                        const proposalSourceCode    = "Proposal Source Code";

                        // Preparation
                        const setSingleContractAdminOperation   = await breakGlassInstance.methods.setSingleContractAdmin(newAdmin, targetContract).send();
                        await setSingleContractAdminOperation.confirmation();

                        // Remove User from whitelisted dev
                        const updateWhitelistDevelopersParam = governanceProxyInstance.methods.dataPackingHelper(
                            'updateWhitelistDevelopersSet', newAdmin
                        ).toTransferParams();
                        const updateWhitelistDevelopersParamValue = updateWhitelistDevelopersParam.parameter.value;
                        const callGovernanceLambdaEntrypointType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
            
                        const updateUpdateWhitelistDevelopersPacked = await utils.tezos.rpc.packData({
                            data: updateWhitelistDevelopersParamValue,
                            type: callGovernanceLambdaEntrypointType
                        }).catch(e => console.error('error:', e));
            
                        var packedUpdateUpdateWhitelistDevelopersParam;
                        if (updateUpdateWhitelistDevelopersPacked) {
                            packedUpdateUpdateWhitelistDevelopersParam = updateUpdateWhitelistDevelopersPacked.packed
                            // console.log('packed success reward param: ' + packedUpdateUpdateWhitelistDevelopersParam);
                        } else {
                        throw `packing failed`
                        };

                        const proposalMetadata      = MichelsonMap.fromLiteral({
                            "Metadata#1": packedUpdateUpdateWhitelistDevelopersParam
                        });

                        // Start governance rounds
                        var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                        await nextRoundOperation.confirmation();

                        const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
                        await proposeOperation.confirmation();
                        const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                        await lockOperation.confirmation();
                        var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                        await voteOperation.confirmation();
                        await signerFactory(alice.sk);
                        voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                        await voteOperation.confirmation();
                        await signerFactory(bob.sk);
                        nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                        await nextRoundOperation.confirmation();

                        // Votes operation -> both satellites vote
                        var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                        await votingRoundVoteOperation.confirmation();
                        await signerFactory(alice.sk);
                        votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                        await votingRoundVoteOperation.confirmation();
                        await signerFactory(bob.sk);

                        // Execute proposal
                        nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                        await nextRoundOperation.confirmation();
                        nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                        await nextRoundOperation.confirmation();

                        // Final values
                        governanceStorage   = await governanceInstance.storage();
                        const proposal      = await governanceStorage.proposalLedger.get(proposalId);
                        const whitelistedDevelopersEnd = await governanceStorage.whitelistDevelopers;

                        // Assertions
                        assert.strictEqual(whitelistedDevelopers.includes(newAdmin), true)
                        assert.strictEqual(whitelistedDevelopersEnd.includes(newAdmin), false)

                        // Operation
                        await signerFactory(alice.sk);
                        await chai.expect(breakGlassInstance.methods.signAction(breakGlassActionID).send()).to.be.rejected;
                    }
                    catch (e){
                        console.dir(e, {depth: 5})
                    }
                })

                it("Council should be able to call this entrypoint if the new admin is a whitelisted developer", async() => {
                    try{
                        // Reset delegation address to BreakGlass
                        const resetAdmin    = await delegationInstance.methods.setAdmin(breakGlassAddress.address).send();
                        await resetAdmin.confirmation();

                        // Initial values
                        governanceStorage           = await governanceInstance.storage();
                        breakGlassStorage           = await breakGlassInstance.storage();
                        const newAdmin              = alice.pkh;
                        const targetContract        = delegationAddress.address;
                        const breakGlassActionID    = breakGlassStorage.actionCounter;

                        // Operation
                        const setSingleContractAdminOperation   = await breakGlassInstance.methods.setSingleContractAdmin(newAdmin, targetContract).send();
                        await setSingleContractAdminOperation.confirmation();

                        // Sign action
                        await signerFactory(alice.sk);
                        const signActionOperation   = await breakGlassInstance.methods.signAction(breakGlassActionID).send();
                        await signActionOperation.confirmation();

                        // Final values
                        governanceStorage           = await governanceInstance.storage();
                        delegationStorage           = await delegationInstance.storage();
                        const whitelistedDevelopers = await governanceStorage.whitelistDevelopers;

                        // Assertions
                        assert.strictEqual(whitelistedDevelopers.includes(newAdmin), true);
                        assert.strictEqual(delegationStorage.admin, newAdmin);
                    }
                    catch (e){
                        console.dir(e, {depth: 5})
                    }
                })

                it("Council should be able to call this entrypoint if the new admin is the governance contract", async() => {
                    try{
                        // Initial values
                        governanceStorage           = await governanceInstance.storage();
                        breakGlassStorage           = await breakGlassInstance.storage();
                        const newAdmin              = governanceAddress.address;
                        const targetContract        = councilAddress.address;
                        const breakGlassActionID    = breakGlassStorage.actionCounter;

                        // Operation
                        councilStorage   = await councilInstance.storage();
                        console.log(councilStorage.admin)
                        const setSingleContractAdminOperation   = await breakGlassInstance.methods.setSingleContractAdmin(newAdmin, targetContract).send();
                        await setSingleContractAdminOperation.confirmation();

                        // Sign action
                        await signerFactory(alice.sk);
                        const signActionOperation   = await breakGlassInstance.methods.signAction(breakGlassActionID).send();
                        await signActionOperation.confirmation();

                        // Final values
                        councilStorage              = await councilInstance.storage();

                        // Assertions
                        assert.strictEqual(councilStorage.admin, newAdmin);
                    }
                    catch (e){
                        console.dir(e, {depth: 5})
                    }
                })

                it("Council should be able to call this entrypoint if the new admin is the breakGlass contract", async() => {
                    try{
                        // Initial values
                        governanceStorage           = await governanceInstance.storage();
                        breakGlassStorage           = await breakGlassInstance.storage();
                        const newAdmin              = breakGlassAddress.address;
                        const targetContract        = emergencyGovernanceAddress.address;
                        const breakGlassActionID    = breakGlassStorage.actionCounter;

                        // Operation
                        const setSingleContractAdminOperation   = await breakGlassInstance.methods.setSingleContractAdmin(newAdmin, targetContract).send();
                        await setSingleContractAdminOperation.confirmation();

                        // Sign action
                        await signerFactory(alice.sk);
                        const signActionOperation   = await breakGlassInstance.methods.signAction(breakGlassActionID).send();
                        await signActionOperation.confirmation();

                        // Final values
                        emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();

                        // Assertions
                        assert.strictEqual(emergencyGovernanceStorage.admin, newAdmin);
                    }
                    catch (e){
                        console.dir(e, {depth: 5})
                    }
                })
            });
    
            describe("%setAllContractsAdmin", async () => {
                beforeEach("Set signer to admin", async () => {
                    await signerFactory(bob.sk)
                });
            });
    
        })
    })
});