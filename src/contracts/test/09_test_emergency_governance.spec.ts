import { MichelsonMap } from '@mavrykdynamics/taquito-michelson-encoder'
import assert from "assert";
import { BigNumber } from 'bignumber.js'

import { MVN, Utils } from "./helpers/Utils";

const saveContractAddress = require("./helpers/saveContractAddress")

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

import { GeneralContract, setGeneralContractLambdas } from './helpers/deploymentTestHelper'
import { breakGlassStorage as resetBreakGlassStorage } from '../storage/breakGlassStorage'
import { bob, alice, eve, mallory, oscar, trudy, susie } from "../scripts/sandbox/accounts";
import { 
    signerFactory, 
    wait,
    getStorageMapValue,
    fa2Transfer,
    updateOperators,
    mistakenTransferFa2Token,
    updateWhitelistContracts,
    updateGeneralContracts
} from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Notes
// ------------------------------------------------------------------------------

// Known edge cases: 
//
// 1. After an emergency control has been triggered, and staked MVN snapshot taken, a user can buy MVN
//    from the open market (or obtain it elsewhere) and stake it to increase his voting power (even if that MVN 
//    was not part of the earlier staked MVN snapshot)
//
// 2. After an emergency control has been triggered, and staked MVN snapshot taken, a user can vote, unstake
//     his MVN (incurring the exit fee costs), transfer the balance to another address, stake the MVN and vote
//     for emergency governance with the "same sMVN" again
//
// -----------------------------------------------------------------------------------------------------------
//
// NB: These are acceptable cases as users have to incur a cost to increase his effective voting power, while the 
//      final impact of an errant break glass event to interrupt the Maven system is fairly minor. The community
//      will also be able to update the stakedMvnPercentageRequired config in future through governance if needed.

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("Emergency Governance tests", async () => {
    
    var utils: Utils;
    let tezos 

    let user 
    let userSk 

    let admin 
    let adminSk

    let doormanAddress
    let mavenFa2TokenAddress

    let emergencyProposal
    let emergencyTitle
    let emergencyDesc

    let initialTotalStakedMvnVotes
    let updatedTotalStakedMvnVotes

    let stakeAmount
    let unstakeAmount
    let tokenId = 0

    let userStakeRecord
    let initialUserStakeRecord
    let updatedUserStakeRecord

    let userStakedBalance
    let initialUserStakedBalance
    let updatedUserStakedBalance

    let doormanInstance
    let delegationInstance
    let mvnTokenInstance
    let councilInstance
    let governanceInstance
    let emergencyGovernanceInstance
    let breakGlassInstance
    let vestingInstance
    let treasuryInstance
    let mavenFa2TokenInstance

    let doormanStorage
    let delegationStorage
    let mvnTokenStorage
    let councilStorage
    let governanceStorage
    let emergencyGovernanceStorage
    let breakGlassStorage
    let vestingStorage
    let treasuryStorage
    let mavenFa2TokenStorage

    // operations
    let updateOperatorsOperation
    let stakeOperation
    let unstakeOperation
    let transferOperation
    let emergencyGovernanceOperation
    let voteOperation
    let signActionOperation

    // housekeeping operations
    let setAdminOperation
    let setGovernanceOperation
    let resetAdminOperation
    let updateWhitelistContractsOperation
    let updateGeneralContractsOperation
    let mistakenTransferOperation

    // contract map value
    let storageMap
    let contractMapKey
    let initialContractMapValue
    let updatedContractMapValue
    

    before("setup", async () => {

        utils = new Utils();
        await utils.init(bob.sk);
        tezos = utils.tezos;

        admin           = bob.pkh
        adminSk         = bob.sk 

        emergencyTitle  = "Test emergency control";
        emergencyDesc   = "Test description";

        doormanAddress                  = contractDeployments.doorman.address;
        mavenFa2TokenAddress           = contractDeployments.mavenFa2Token.address;

        doormanInstance                 = await utils.tezos.contract.at(doormanAddress);
        delegationInstance              = await utils.tezos.contract.at(contractDeployments.delegation.address);
        mvnTokenInstance                = await utils.tezos.contract.at(contractDeployments.mvnToken.address);
        councilInstance                 = await utils.tezos.contract.at(contractDeployments.council.address);
        governanceInstance              = await utils.tezos.contract.at(contractDeployments.governance.address);
        emergencyGovernanceInstance     = await utils.tezos.contract.at(contractDeployments.emergencyGovernance.address);
        breakGlassInstance              = await utils.tezos.contract.at(contractDeployments.breakGlass.address);
        vestingInstance                 = await utils.tezos.contract.at(contractDeployments.vesting.address);
        treasuryInstance                = await utils.tezos.contract.at(contractDeployments.treasury.address);
        mavenFa2TokenInstance          = await utils.tezos.contract.at(mavenFa2TokenAddress);
            
        doormanStorage                  = await doormanInstance.storage();
        delegationStorage               = await delegationInstance.storage();
        mvnTokenStorage                 = await mvnTokenInstance.storage();
        councilStorage                  = await councilInstance.storage();
        governanceStorage               = await governanceInstance.storage();
        emergencyGovernanceStorage      = await emergencyGovernanceInstance.storage();
        breakGlassStorage               = await breakGlassInstance.storage();
        vestingStorage                  = await vestingInstance.storage();
        treasuryStorage                 = await treasuryInstance.storage();
        mavenFa2TokenStorage           = await mavenFa2TokenInstance.storage();

        console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')

    });
    
    describe("%triggerEmergencyControl", async () => {

        beforeEach("Set default signer to user (eve)", async () => {
            await signerFactory(tezos, eve.sk)
        });

        it('user (eve) should not be able to trigger emergency control if she did not send the required mav fees', async () => {
            try{

                user   = eve.pkh;
                userSk = eve.sk;

                // initial values and storage: set stake amount to minimum sMVN required to trigger an emergency governance
                emergencyGovernanceStorage      = await emergencyGovernanceInstance.storage();
                doormanStorage                  = await doormanInstance.storage();

                const sMvnRequiredToTrigger     = emergencyGovernanceStorage.config.minStakedMvnRequiredToTrigger;
                stakeAmount                     = sMvnRequiredToTrigger; 

                initialUserStakeRecord          = await doormanStorage.userStakeBalanceLedger.get(user);
                initialUserStakedBalance        = initialUserStakeRecord === undefined ? 0 : initialUserStakeRecord.balance.toNumber()

                // ensure that user has enough staked MVN to trigger emergency governance
                if(initialUserStakedBalance < sMvnRequiredToTrigger){
                    
                    updateOperatorsOperation = await updateOperators(mvnTokenInstance, user, doormanAddress, tokenId);
                    await updateOperatorsOperation.confirmation();

                    // set stake amount so that user's final staked balance will be above sMvnRequiredToTrigger
                    stakeAmount    = Math.abs(initialUserStakedBalance - sMvnRequiredToTrigger) + 1;
                    stakeOperation = await doormanInstance.methods.stakeMvn(stakeAmount).send();
                    await stakeOperation.confirmation();
                }

                // fail: trigger emergency control operation
                emergencyGovernanceOperation = emergencyGovernanceInstance.methods.triggerEmergencyControl(emergencyTitle, emergencyDesc);
                await chai.expect(emergencyGovernanceOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('user (eve) should not be able to trigger emergency control if she sends the wrong mav fees', async () => {
            try{

                user   = eve.pkh;
                userSk = eve.sk;

                // initial values and storage: set stake amount to minimum sMVN required to trigger an emergency governance
                emergencyGovernanceStorage      = await emergencyGovernanceInstance.storage();
                doormanStorage                  = await doormanInstance.storage();
                
                const requiredFeeMumav          = emergencyGovernanceStorage.config.requiredFeeMumav;
                const sMvnRequiredToTrigger     = emergencyGovernanceStorage.config.minStakedMvnRequiredToTrigger;
                stakeAmount                     = sMvnRequiredToTrigger; 

                initialUserStakeRecord          = await doormanStorage.userStakeBalanceLedger.get(user);
                initialUserStakedBalance        = initialUserStakeRecord === undefined ? 0 : initialUserStakeRecord.balance.toNumber()

                const belowRequiredFeeMutz      = requiredFeeMumav - 1;
                const aboveRequiredFeeMutz      = requiredFeeMumav + 1;
            
                // ensure that user has enough staked MVN to trigger emergency governance
                if(initialUserStakedBalance < sMvnRequiredToTrigger){

                    updateOperatorsOperation = await updateOperators(mvnTokenInstance, user, doormanAddress, tokenId);
                    await updateOperatorsOperation.confirmation();

                    // set stake amount so that user's final staked balance will be above sMvnRequiredToTrigger
                    stakeAmount    = Math.abs(initialUserStakedBalance - sMvnRequiredToTrigger) + 1;
                    stakeOperation = await doormanInstance.methods.stakeMvn(stakeAmount).send();
                    await stakeOperation.confirmation();
                }

                // fail: trigger emergency control operation
                emergencyGovernanceOperation = emergencyGovernanceInstance.methods.triggerEmergencyControl(emergencyTitle, emergencyDesc);
                await chai.expect(emergencyGovernanceOperation.send({ amount : belowRequiredFeeMutz, mumav: true})).to.be.rejected;

                // fail: trigger emergency control operation
                emergencyGovernanceOperation = emergencyGovernanceInstance.methods.triggerEmergencyControl(emergencyTitle, emergencyDesc);
                await chai.expect(emergencyGovernanceOperation.send({ amount : aboveRequiredFeeMutz, mumav: true})).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('user (bob) should not be able to trigger emergency control if he does not have enough staked MVN', async () => {
            try{
                
                // set signer
                user   = bob.pkh;
                userSk = bob.sk;
                await signerFactory(tezos, userSk);

                // Operation
                emergencyGovernanceStorage      = await emergencyGovernanceInstance.storage();
                doormanStorage                  = await doormanInstance.storage();
                const requiredFeeMumav          = emergencyGovernanceStorage.config.requiredFeeMumav;
                const sMvnRequiredToTrigger     = emergencyGovernanceStorage.config.minStakedMvnRequiredToTrigger;
                initialUserStakeRecord          = await doormanStorage.userStakeBalanceLedger.get(user);
                initialUserStakedBalance        = initialUserStakeRecord === undefined ? 0 : initialUserStakeRecord.balance.toNumber()

                // ensure that user staked balance does not exceed staked MVN required to trigger
                if(initialUserStakedBalance > sMvnRequiredToTrigger){
                    
                    // set unstake amount so that user's final staked balance will be below sMvnRequiredToTrigger
                    unstakeAmount    = Math.abs(sMvnRequiredToTrigger - initialUserStakedBalance) + 1;
                    unstakeOperation = await doormanInstance.methods.unstakeMvn(unstakeAmount).send();
                    await unstakeOperation.confirmation();
                }

                // fail: trigger emergency control operation
                emergencyGovernanceOperation = emergencyGovernanceInstance.methods.triggerEmergencyControl(emergencyTitle, emergencyDesc);
                await chai.expect(emergencyGovernanceOperation.send({amount : requiredFeeMumav, mumav: true})).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('user (eve) should not be able to trigger emergency control if relevant contracts (treasury, doorman) are missing in Governance General Contracts Map', async () => {
            try{

                // set signer to user (eve)
                user   = eve.pkh;
                userSk = eve.sk;
                await signerFactory(tezos, userSk);

                // initial values
                emergencyGovernanceStorage      = await emergencyGovernanceInstance.storage();
                doormanStorage                  = await doormanInstance.storage();

                const requiredFeeMumav           = emergencyGovernanceStorage.config.requiredFeeMumav;
                const sMvnRequiredToTrigger      = emergencyGovernanceStorage.config.minStakedMvnRequiredToTrigger;

                initialUserStakeRecord          = await doormanStorage.userStakeBalanceLedger.get(user);
                initialUserStakedBalance        = initialUserStakeRecord === undefined ? 0 : initialUserStakeRecord.balance.toNumber()
                
                // ensure that user has enough staked MVN to trigger emergency governance
                if(initialUserStakedBalance < sMvnRequiredToTrigger){

                    updateOperatorsOperation = await updateOperators(mvnTokenInstance, user, doormanAddress, tokenId);
                    await updateOperatorsOperation.confirmation();

                    // set stake amount so that user's final staked balance will be above sMvnRequiredToTrigger
                    stakeAmount    = Math.abs(initialUserStakedBalance - sMvnRequiredToTrigger) + 1;
                    stakeOperation = await doormanInstance.methods.stakeMvn(stakeAmount).send();
                    await stakeOperation.confirmation();
                }

                // Remove taxTreasury and doorman contract in Governance General Contracts map
                await signerFactory(tezos, adminSk);
                updateGeneralContractsOperation = await governanceInstance.methods.updateGeneralContracts("taxTreasury", contractDeployments.treasury.address, "remove").send();
                await updateGeneralContractsOperation.confirmation()

                updateGeneralContractsOperation = await governanceInstance.methods.updateGeneralContracts("doorman", contractDeployments.doorman.address, "remove").send();
                await updateGeneralContractsOperation.confirmation()

                // fail: trigger emergency control operation
                await signerFactory(tezos, userSk);
                emergencyGovernanceOperation  = await emergencyGovernanceInstance.methods.triggerEmergencyControl(emergencyTitle, emergencyDesc);
                await chai.expect(emergencyGovernanceOperation.send({amount : requiredFeeMumav, mumav: true})).to.be.rejected;

                // reset contracts in Governance General Contracts map
                await signerFactory(tezos, adminSk);
                updateGeneralContractsOperation = await governanceInstance.methods.updateGeneralContracts("taxTreasury", contractDeployments.treasury.address, "update").send();
                await updateGeneralContractsOperation.confirmation()

                updateGeneralContractsOperation = await governanceInstance.methods.updateGeneralContracts("doorman", contractDeployments.doorman.address, "update").send();
                await updateGeneralContractsOperation.confirmation()

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('user (eve) should be able to trigger an emergency control with sufficient staked MVN and correct mav fees sent', async () => {
            try{
                
                user   = eve.pkh;
                userSk = eve.sk;

                // set signer to bob
                await signerFactory(tezos, bob.sk);
                const emergencyGovernanceDurationInMinutes = 1;
                var updateConfigOperation = await emergencyGovernanceInstance.methods.updateConfig(emergencyGovernanceDurationInMinutes, "configDurationInMinutes").send();
                await updateConfigOperation.confirmation();

                // set signer to user
                await signerFactory(tezos, userSk);

                // initial values
                emergencyGovernanceStorage      = await emergencyGovernanceInstance.storage();
                doormanStorage                  = await doormanInstance.storage();

                const requiredFeeMumav           = emergencyGovernanceStorage.config.requiredFeeMumav;
                const sMvnRequiredToTrigger      = emergencyGovernanceStorage.config.minStakedMvnRequiredToTrigger;
                const stakeMvnPercentageRequired = emergencyGovernanceStorage.config.stakedMvnPercentageRequired;

                initialUserStakeRecord          = await doormanStorage.userStakeBalanceLedger.get(user);
                initialUserStakedBalance        = initialUserStakeRecord === undefined ? 0 : initialUserStakeRecord.balance.toNumber()

                // get total staked mvn supply by calling get_balance view on MVN Token Contract with Doorman address
                const totalStakedMvnSupply           = await mvnTokenInstance.contractViews.get_balance({ "0": doormanAddress, "1": 0}).executeView({ viewCaller : user});

                // calculate staked MVN required for break glass
                const stakedMvnRequiredForBreakGlass = Math.floor((stakeMvnPercentageRequired * totalStakedMvnSupply / 10000))
                
                // ensure that user has enough staked MVN to trigger emergency governance
                if(initialUserStakedBalance < sMvnRequiredToTrigger){

                    updateOperatorsOperation = await updateOperators(mvnTokenInstance, user, doormanAddress, tokenId);
                    await updateOperatorsOperation.confirmation();
                    
                    // set stake amount so that user's final staked balance will be above sMvnRequiredToTrigger
                    stakeAmount    = Math.abs(initialUserStakedBalance - sMvnRequiredToTrigger) + 1;
                    stakeOperation = await doormanInstance.methods.stakeMvn(stakeAmount).send();
                    await stakeOperation.confirmation();
                }

                // Operation
                emergencyGovernanceOperation  = await emergencyGovernanceInstance.methods.triggerEmergencyControl(emergencyTitle, emergencyDesc).send({amount: requiredFeeMumav, mumav: true});
                await emergencyGovernanceOperation.confirmation();

                // Final values
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                const emergencyID           = emergencyGovernanceStorage.currentEmergencyGovernanceId;
                const emergencyProposal     = await emergencyGovernanceStorage.emergencyGovernanceLedger.get(emergencyID);

                // check that emergency id is not zero, and emergency proposal is not undefined
                assert.notEqual(emergencyID         , 0);
                assert.notEqual(emergencyProposal   , undefined);

                // check new emergency proposal record
                assert.equal(emergencyProposal.proposerAddress      , user);
                assert.equal(emergencyProposal.executed             , false);

                assert.equal(emergencyProposal.title                , emergencyTitle);
                assert.equal(emergencyProposal.description          , emergencyDesc);
                assert.equal(emergencyProposal.totalStakedMvnVotes  , 0);

                assert.equal(emergencyProposal.stakedMvnPercentageRequired.toNumber()   , emergencyGovernanceStorage.config.stakedMvnPercentageRequired.toNumber());
                assert.equal(emergencyProposal.stakedMvnRequiredForBreakGlass.toNumber(), stakedMvnRequiredForBreakGlass);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('user (eve) should not be able to trigger another emergency control if there is already one ongoing', async () => {
            try{
                
                user   = eve.pkh;
                userSk = eve.sk;

                // Initial Values
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                const requiredFeeMumav      = emergencyGovernanceStorage.config.requiredFeeMumav;
                const emergencyID           = emergencyGovernanceStorage.currentEmergencyGovernanceId;
                
                // check that there is an existing emergency governance ongoing
                assert.notEqual(emergencyID, 0);

                // fail: vote for emergency control
                emergencyGovernanceOperation = await emergencyGovernanceInstance.methods.triggerEmergencyControl(emergencyTitle, emergencyDesc);
                await chai.expect(emergencyGovernanceOperation.send({amount: requiredFeeMumav, mumav: true})).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('user (eve) should be able to trigger an emergency control after the previous one has expired', async () => {
            try{
                
                user   = eve.pkh;
                userSk = eve.sk;

                // wait for current emergency governance to expire
                await wait(60 * 1000);

                // initial values
                emergencyGovernanceStorage      = await emergencyGovernanceInstance.storage();
                doormanStorage                  = await doormanInstance.storage();

                const requiredFeeMumav           = emergencyGovernanceStorage.config.requiredFeeMumav;
                const sMvnRequiredToTrigger      = emergencyGovernanceStorage.config.minStakedMvnRequiredToTrigger;
                const stakeMvnPercentageRequired = emergencyGovernanceStorage.config.stakedMvnPercentageRequired;

                initialUserStakeRecord          = await doormanStorage.userStakeBalanceLedger.get(user);
                initialUserStakedBalance        = initialUserStakeRecord === undefined ? 0 : initialUserStakeRecord.balance.toNumber()

                // get total staked mvn supply by calling get_balance view on MVN Token Contract with Doorman address
                const totalStakedMvnSupply           = await mvnTokenInstance.contractViews.get_balance({ "0": doormanAddress, "1": 0}).executeView({ viewCaller : user});

                // calculate staked MVN required for break glass
                const stakedMvnRequiredForBreakGlass = Math.floor((stakeMvnPercentageRequired * totalStakedMvnSupply / 10000))
                
                // ensure that user has enough staked MVN to trigger emergency governance
                if(initialUserStakedBalance < sMvnRequiredToTrigger){

                    updateOperatorsOperation = await updateOperators(mvnTokenInstance, user, doormanAddress, tokenId);
                    await updateOperatorsOperation.confirmation();
                    
                    // set stake amount so that user's final staked balance will be above sMvnRequiredToTrigger
                    stakeAmount    = Math.abs(initialUserStakedBalance - sMvnRequiredToTrigger) + 1;
                    stakeOperation = await doormanInstance.methods.stakeMvn(stakeAmount).send();
                    await stakeOperation.confirmation();
                }

                // Operation
                emergencyGovernanceOperation  = await emergencyGovernanceInstance.methods.triggerEmergencyControl(emergencyTitle, emergencyDesc).send({amount: requiredFeeMumav, mumav: true});
                await emergencyGovernanceOperation.confirmation();

                // Final values
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                const emergencyID           = emergencyGovernanceStorage.currentEmergencyGovernanceId;
                const emergencyProposal     = await emergencyGovernanceStorage.emergencyGovernanceLedger.get(emergencyID);

                // check that emergency id is not zero, and emergency proposal is not undefined
                assert.notEqual(emergencyID         , 0);
                assert.notEqual(emergencyProposal   , undefined);

                // check new emergency proposal record
                assert.equal(emergencyProposal.proposerAddress      , user);
                assert.equal(emergencyProposal.executed             , false);

                assert.equal(emergencyProposal.title                , emergencyTitle);
                assert.equal(emergencyProposal.description          , emergencyDesc);
                assert.equal(emergencyProposal.totalStakedMvnVotes  , 0);

                assert.equal(emergencyProposal.stakedMvnPercentageRequired.toNumber()   , emergencyGovernanceStorage.config.stakedMvnPercentageRequired.toNumber());
                assert.equal(emergencyProposal.stakedMvnRequiredForBreakGlass.toNumber(), stakedMvnRequiredForBreakGlass);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    })

    describe("%voteForEmergencyControl", async () => {

        beforeEach("Set signer to user (eve)", async () => {
            await signerFactory(tezos, eve.sk)
        });

        it('user (oscar) should not be able to call this entrypoint if he does not have enough staked MVN to vote', async () => {
            try{

                // set signer
                user   = oscar.pkh;
                userSk = oscar.sk;
                await signerFactory(tezos, userSk);

                const compoundOperation   = await doormanInstance.methods.compound([user]).send();
                await compoundOperation.confirmation();

                // Initial Values
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage()
                doormanStorage              = await doormanInstance.storage()
                const sMvnRequiredToVote    = emergencyGovernanceStorage.config.minStakedMvnRequiredToVote;

                initialUserStakeRecord          = await doormanStorage.userStakeBalanceLedger.get(user);
                initialUserStakedBalance        = initialUserStakeRecord === undefined ? 0 : initialUserStakeRecord.balance.toNumber()

                // ensure that user staked balance does not exceed staked MVN required to vote
                if(initialUserStakedBalance >= sMvnRequiredToVote){
                    // set unstake amount so that user's final staked balance will be below sMvnRequiredToVote
                    unstakeAmount    = Math.abs(sMvnRequiredToVote - initialUserStakedBalance) + 500000000;
                    unstakeOperation = await doormanInstance.methods.unstakeMvn(unstakeAmount).send();
                    await unstakeOperation.confirmation();
                } 

                doormanStorage              = await doormanInstance.storage()
                updatedUserStakeRecord      = await doormanStorage.userStakeBalanceLedger.get(user);
                updatedUserStakedBalance    = updatedUserStakeRecord === undefined ? 0 : updatedUserStakeRecord.balance.toNumber()

                assert.equal(updatedUserStakedBalance < sMvnRequiredToVote, true);
                
                // fail: vote for emergency control
                emergencyGovernanceOperation = await emergencyGovernanceInstance.methods.voteForEmergencyControl();
                await chai.expect(emergencyGovernanceOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('user (alice) should not be able to vote for emergency control if relevant contracts (doorman) is missing in Governance General Contracts Map', async () => {
            try{

                // set signer to user (alice)
                user   = alice.pkh;
                userSk = alice.sk;
                await signerFactory(tezos, userSk);

                // initial values
                emergencyGovernanceStorage      = await emergencyGovernanceInstance.storage();
                doormanStorage                  = await doormanInstance.storage();

                const requiredFeeMumav          = emergencyGovernanceStorage.config.requiredFeeMumav;
                const sMvnRequiredToVote        = emergencyGovernanceStorage.config.minStakedMvnRequiredToVote;

                // get user staked balance
                initialUserStakeRecord      = await doormanStorage.userStakeBalanceLedger.get(user);
                initialUserStakedBalance    = initialUserStakeRecord === undefined ? 0 : initialUserStakeRecord.balance.toNumber()

                // ensure that user has enough staked MVN to vote for emergency governance
                if(initialUserStakedBalance < sMvnRequiredToVote){
                    
                    updateOperatorsOperation = await updateOperators(mvnTokenInstance, user, doormanAddress, tokenId);
                    await updateOperatorsOperation.confirmation();

                    // set stake amount so that user's final staked balance will be above sMvnRequiredToVote
                    stakeAmount    = Math.abs(initialUserStakedBalance - sMvnRequiredToVote) + 1;
                    stakeOperation = await doormanInstance.methods.stakeMvn(stakeAmount).send();
                    await stakeOperation.confirmation();
                }

                // Remove doorman contract in Governance General Contracts map
                await signerFactory(tezos, adminSk);
                updateGeneralContractsOperation = await governanceInstance.methods.updateGeneralContracts("doorman", contractDeployments.doorman.address, "remove").send();
                await updateGeneralContractsOperation.confirmation()

                // fail: trigger emergency control operation
                await signerFactory(tezos, userSk);
                voteOperation = await emergencyGovernanceInstance.methods.voteForEmergencyControl();
                await chai.expect(emergencyGovernanceOperation.send()).to.be.rejected;

                // reset contracts in Governance General Contracts map
                await signerFactory(tezos, adminSk);
                updateGeneralContractsOperation = await governanceInstance.methods.updateGeneralContracts("doorman", contractDeployments.doorman.address, "update").send();
                await updateGeneralContractsOperation.confirmation()

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('user (alice) should be able to vote for the current proposal without triggering the break glass (insufficient votes)', async () => {
            try{

                // set signer
                user   = alice.pkh;
                userSk = alice.sk;
                await signerFactory(tezos, userSk);
                
                // initial Values
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                const sMvnRequiredToVote    = emergencyGovernanceStorage.config.minStakedMvnRequiredToVote;
                const emergencyID           = emergencyGovernanceStorage.currentEmergencyGovernanceId;
                emergencyProposal           = await emergencyGovernanceStorage.emergencyGovernanceLedger.get(emergencyID);
                initialTotalStakedMvnVotes  = emergencyProposal.totalStakedMvnVotes;
                
                // get user staked balance
                initialUserStakeRecord      = await doormanStorage.userStakeBalanceLedger.get(user);
                initialUserStakedBalance    = initialUserStakeRecord === undefined ? 0 : initialUserStakeRecord.balance.toNumber()

                // ensure that user has enough staked MVN to vote for emergency governance
                if(initialUserStakedBalance < sMvnRequiredToVote){
                    
                    updateOperatorsOperation = await updateOperators(mvnTokenInstance, user, doormanAddress, tokenId);
                    await updateOperatorsOperation.confirmation();

                    // set stake amount so that user's final staked balance will be above sMvnRequiredToVote
                    stakeAmount    = Math.abs(initialUserStakedBalance - sMvnRequiredToVote) + 1;
                    stakeOperation = await doormanInstance.methods.stakeMvn(stakeAmount).send();
                    await stakeOperation.confirmation();
                }

                // get updated user staked balance
                doormanStorage              = await doormanInstance.storage();
                updatedUserStakeRecord      = await doormanStorage.userStakeBalanceLedger.get(user);
                updatedUserStakedBalance    = updatedUserStakeRecord === undefined ? 0 : updatedUserStakeRecord.balance.toNumber()
                assert.notEqual(updatedUserStakeRecord, 0);
                
                // vote for emergency control operation
                voteOperation = await emergencyGovernanceInstance.methods.voteForEmergencyControl().send();
                await voteOperation.confirmation();

                // Final values
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                doormanStorage              = await doormanInstance.storage()

                emergencyProposal           = await emergencyGovernanceStorage.emergencyGovernanceLedger.get(emergencyID);
                updatedTotalStakedMvnVotes  = emergencyProposal.totalStakedMvnVotes;
                const userVote              = await emergencyGovernanceStorage.emergencyGovernanceVoters.get({
                    0: emergencyGovernanceStorage.currentEmergencyGovernanceId,
                    1: user
                });

                // check that user vote is recorded in emergency proposal
                assert.notStrictEqual(userVote, undefined);
                assert.equal(userVote[0].toNumber(), updatedUserStakedBalance);

                assert.equal(updatedUserStakedBalance < emergencyProposal.stakedMvnRequiredForBreakGlass, true);
                assert.equal(updatedTotalStakedMvnVotes.toNumber(), initialTotalStakedMvnVotes.toNumber() + updatedUserStakedBalance);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('user (mallory) should be able to vote for the current proposal without triggering the break glass (insufficient votes)', async () => {
            try{

                // set signer
                user   = mallory.pkh;
                userSk = mallory.sk;
                await signerFactory(tezos, userSk);
                
                // Initial Values
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                const sMvnRequiredToVote    = emergencyGovernanceStorage.config.minStakedMvnRequiredToVote;
                const emergencyID           = emergencyGovernanceStorage.currentEmergencyGovernanceId;
                emergencyProposal           = await emergencyGovernanceStorage.emergencyGovernanceLedger.get(emergencyID);
                initialTotalStakedMvnVotes  = emergencyProposal.totalStakedMvnVotes;
                
                // get user staked balance
                initialUserStakeRecord      = await doormanStorage.userStakeBalanceLedger.get(user);
                initialUserStakedBalance    = initialUserStakeRecord === undefined ? 0 : initialUserStakeRecord.balance.toNumber()

                // ensure that user has enough staked MVN to vote for emergency governance
                if(initialUserStakedBalance < sMvnRequiredToVote){
                    
                    updateOperatorsOperation = await updateOperators(mvnTokenInstance, user, doormanAddress, tokenId);
                    await updateOperatorsOperation.confirmation();

                    // set stake amount so that user's final staked balance will be above sMvnRequiredToVote
                    stakeAmount    = Math.abs(initialUserStakedBalance - sMvnRequiredToVote) + 1;
                    stakeOperation = await doormanInstance.methods.stakeMvn(stakeAmount).send();
                    await stakeOperation.confirmation();
                }

                // get updated user staked balance
                doormanStorage              = await doormanInstance.storage();
                updatedUserStakeRecord      = await doormanStorage.userStakeBalanceLedger.get(user);
                updatedUserStakedBalance    = updatedUserStakeRecord === undefined ? 0 : updatedUserStakeRecord.balance.toNumber()
                assert.notEqual(updatedUserStakeRecord, 0);

                // vote for emergency control operation
                voteOperation = await emergencyGovernanceInstance.methods.voteForEmergencyControl().send();
                await voteOperation.confirmation();

                // Final values
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                doormanStorage              = await doormanInstance.storage()

                emergencyProposal           = await emergencyGovernanceStorage.emergencyGovernanceLedger.get(emergencyID);
                updatedTotalStakedMvnVotes  = emergencyProposal.totalStakedMvnVotes;
                const userVote              = await emergencyGovernanceStorage.emergencyGovernanceVoters.get({
                    0: emergencyGovernanceStorage.currentEmergencyGovernanceId,
                    1: user
                });

                // check that user vote is recorded in emergency proposal
                assert.notStrictEqual(userVote, undefined);
                assert.equal(userVote[0].toNumber(), updatedUserStakedBalance);

                assert.equal(updatedUserStakedBalance < emergencyProposal.stakedMvnRequiredForBreakGlass, true);
                assert.equal(updatedTotalStakedMvnVotes.toNumber(), initialTotalStakedMvnVotes.toNumber() + updatedUserStakedBalance);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('user (alice) should not be able to vote for emergency control again', async () => {
            try{

                // set signer
                user   = alice.pkh;
                userSk = alice.sk;
                await signerFactory(tezos, userSk);
        
                // initial stoage
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();

                // fail: vote for emergency control
                voteOperation = await emergencyGovernanceInstance.methods.voteForEmergencyControl();
                await chai.expect(voteOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('proposer (eve) should not be able to vote emergency control and trigger break glass if relevant contracts (breakGlass) is missing in Governance General Contracts Map', async () => {
            try{

                let tempStakeAmount = 0 

                // Remove breakGlass contract in Governance General Contracts map
                await signerFactory(tezos, adminSk);
                updateGeneralContractsOperation = await governanceInstance.methods.updateGeneralContracts("breakGlass", contractDeployments.breakGlass.address, "remove").send();
                await updateGeneralContractsOperation.confirmation()

                // set signer to user (eve)
                user   = eve.pkh;
                userSk = eve.sk;
                await signerFactory(tezos, userSk);

                // initial values
                emergencyGovernanceStorage      = await emergencyGovernanceInstance.storage();
                doormanStorage                  = await doormanInstance.storage();

                const emergencyGovernanceRecord = await emergencyGovernanceStorage.emergencyGovernanceLedger.get(emergencyGovernanceStorage.currentEmergencyGovernanceId);
                const sMvnRequired              = emergencyGovernanceRecord.stakedMvnRequiredForBreakGlass.toNumber();

                // get user staked balance
                initialUserStakeRecord      = await doormanStorage.userStakeBalanceLedger.get(user);
                initialUserStakedBalance    = initialUserStakeRecord === undefined ? 0 : initialUserStakeRecord.balance.toNumber()

                // ensure that user has enough staked MVN to trigger the emergency governance
                if(initialUserStakedBalance < sMvnRequired){
                    
                    updateOperatorsOperation = await updateOperators(mvnTokenInstance, user, doormanAddress, tokenId);
                    await updateOperatorsOperation.confirmation();

                    // set stake amount so that user's final staked balance will be above sMvnRequired
                    tempStakeAmount    = Math.abs(initialUserStakedBalance - sMvnRequired) + 1;
                    stakeOperation     = await doormanInstance.methods.stakeMvn(tempStakeAmount).send();
                    await stakeOperation.confirmation();
                }

                // fail: trigger emergency control operation
                voteOperation = await emergencyGovernanceInstance.methods.voteForEmergencyControl();
                await chai.expect(emergencyGovernanceOperation.send()).to.be.rejected;

                // reset contracts in Governance General Contracts map
                await signerFactory(tezos, adminSk);

                updateGeneralContractsOperation = await governanceInstance.methods.updateGeneralContracts("breakGlass", contractDeployments.breakGlass.address, "update").send();
                await updateGeneralContractsOperation.confirmation()

                // reset stake balance (so that it will not affect subsequent tests)
                await signerFactory(tezos, userSk);
                if(tempStakeAmount > 0){
                    // reset stake balance to initial
                    unstakeOperation = await doormanInstance.methods.unstakeMvn(tempStakeAmount).send();
                    await unstakeOperation.confirmation();
                }

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('proposer (oscar) should be able to vote for the current proposal and trigger break glass automatically with sufficient votes', async () => {
            try{
                
                // set signer
                user   = oscar.pkh;
                userSk = oscar.sk;

                // Initial Values
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                const emergencyID           = emergencyGovernanceStorage.currentEmergencyGovernanceId;
                var emergencyProposal       = await emergencyGovernanceStorage.emergencyGovernanceLedger.get(emergencyID);

                // get user staked balance
                doormanStorage              = await doormanInstance.storage();
                initialUserStakeRecord      = await doormanStorage.userStakeBalanceLedger.get(user);
                initialUserStakedBalance    = initialUserStakeRecord === undefined ? 0 : initialUserStakeRecord.balance.toNumber()

                voteOperation = await emergencyGovernanceInstance.methods.voteForEmergencyControl().send();
                await voteOperation.confirmation();

                // updated storage
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                breakGlassStorage           = await breakGlassInstance.storage();
                const actionID              = breakGlassStorage.actionCounter;
                governanceStorage           = await governanceInstance.storage();

                // updated emergency proposal
                emergencyProposal           = await emergencyGovernanceStorage.emergencyGovernanceLedger.get(emergencyID);
                updatedTotalStakedMvnVotes  = emergencyProposal.totalStakedMvnVotes;

                // check assertions
                assert.equal(emergencyProposal.executed, true);
                
                // check glassBroken is true, and Governance contract admin set to Break Glass Contract
                assert.equal(breakGlassStorage.glassBroken, true);
                assert.equal(governanceStorage.admin, contractDeployments.breakGlass.address);

                // Reset contract states
                breakGlassStorage       = await breakGlassInstance.storage();
                const nextActionID      = breakGlassStorage.actionCounter;
                const targetAddress     = contractDeployments.governance.address;

                await signerFactory(tezos, eve.sk);
                const resetAdminOperation = await breakGlassInstance.methods.setContractsAdmin([targetAddress], admin).send();
                await resetAdminOperation.confirmation();

                await signerFactory(tezos, alice.sk);
                signActionOperation = await breakGlassInstance.methods.signAction(nextActionID).send();
                await signActionOperation.confirmation();

                await signerFactory(tezos, trudy.sk);
                signActionOperation = await breakGlassInstance.methods.signAction(nextActionID).send();
                await signActionOperation.confirmation();

                // check Governance contract admin set to Break Glass Contract
                governanceStorage = await governanceInstance.storage();
                assert.equal(governanceStorage.admin, admin);

                // reset break glass storage
                resetBreakGlassStorage.governanceAddress = contractDeployments.governance.address
                resetBreakGlassStorage.mvnTokenAddress   = contractDeployments.mvnToken.address
                            
                resetBreakGlassStorage.councilMembers.set(alice.pkh, {
                    name: "Alice",
                    image: "Alice image",
                    website: "Alice website"
                })
                resetBreakGlassStorage.councilMembers.set(eve.pkh, {
                    name: "Eve",
                    image: "Eve image",
                    website: "Eve website"
                })
                resetBreakGlassStorage.councilMembers.set(susie.pkh, {
                    name: "Susie",
                    image: "Susie image",
                    website: "Susie website"
                })
                resetBreakGlassStorage.councilMembers.set(trudy.pkh, {
                    name: "Trudy",
                    image: "Trudy image",
                    website: "Trudy website"
                })
                resetBreakGlassStorage.councilSize = new BigNumber(4)

                resetBreakGlassStorage.whitelistContracts = MichelsonMap.fromLiteral({
                    [contractDeployments.emergencyGovernance.address]: null
                })

                await signerFactory(tezos, adminSk);
                const resetBreakGlassContract = await GeneralContract.originate(tezos, "breakGlass", resetBreakGlassStorage);
                await saveContractAddress('breakGlassAddress', resetBreakGlassContract.contract.address, false)
                await setGeneralContractLambdas(tezos, "breakGlass", resetBreakGlassContract.contract, false);

                updateGeneralContractsOperation = await governanceInstance.methods.updateGeneralContracts("breakGlass", resetBreakGlassContract.contract.address, 'update').send();
                await updateGeneralContractsOperation.confirmation();

                governanceStorage = await governanceInstance.storage();

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

    });


    describe("Housekeeping Entrypoints", async () => {

        beforeEach("Set signer to admin (bob)", async () => {
            emergencyGovernanceStorage = await emergencyGovernanceInstance.storage();
            await signerFactory(tezos, adminSk);
        });

        it('%setAdmin                 - admin (bob) should be able to update the contract admin address', async () => {
            try{
                
                // Initial Values
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                const currentAdmin          = emergencyGovernanceStorage.admin;
                assert.strictEqual(currentAdmin, admin);

                // Operation
                setAdminOperation = await emergencyGovernanceInstance.methods.setAdmin(alice.pkh).send();
                await setAdminOperation.confirmation();

                // Final values
                emergencyGovernanceStorage   = await emergencyGovernanceInstance.storage();
                const newAdmin               = emergencyGovernanceStorage.admin;

                // Assertions
                assert.notStrictEqual(newAdmin, currentAdmin);
                assert.strictEqual(newAdmin, alice.pkh);
                
                // reset admin
                await signerFactory(tezos, alice.sk);
                resetAdminOperation = await emergencyGovernanceInstance.methods.setAdmin(admin).send();
                await resetAdminOperation.confirmation();

            } catch(e){
                console.log(e);
            }
        });

        it('%setGovernance            - admin (bob) should be able to update the contract governance address', async () => {
            try{
                
                // Initial Values
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                const currentGovernance     = emergencyGovernanceStorage.governanceAddress;

                // Operation
                setGovernanceOperation = await emergencyGovernanceInstance.methods.setGovernance(alice.pkh).send();
                await setGovernanceOperation.confirmation();

                // Final values
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                const updatedGovernance     = emergencyGovernanceStorage.governanceAddress;

                // reset governance
                setGovernanceOperation = await emergencyGovernanceInstance.methods.setGovernance(contractDeployments.governance.address).send();
                await setGovernanceOperation.confirmation();

                // Assertions
                assert.notStrictEqual(updatedGovernance, currentGovernance);
                assert.strictEqual(updatedGovernance, alice.pkh);
                assert.strictEqual(currentGovernance, contractDeployments.governance.address);

            } catch(e){
                console.log(e);
            }
        });

        it('%updateMetadata           - admin (bob) should be able to update the contract metadata', async () => {
            try{
                // Initial values
                const key   = ''
                const hash  = Buffer.from('mavryk-storage:data', 'ascii').toString('hex')

                // Operation
                const updateOperation = await emergencyGovernanceInstance.methods.updateMetadata(key, hash).send();
                await updateOperation.confirmation();

                // Final values
                emergencyGovernanceStorage = await emergencyGovernanceInstance.storage();            

                const updatedData          = await emergencyGovernanceStorage.metadata.get(key);
                assert.equal(hash, updatedData);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('%updateConfig             - admin (bob) should be able to update contract config', async () => {
            try{
                
                // Initial Values
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                const initialConfig         = emergencyGovernanceStorage.config;

                const lowTestValue  = 1000;
                const highTestValue = 11000000; // for minStakedMvnForVoting and minStakedMvnForTrigger

                // update config operations
                var updateConfigOperation = await emergencyGovernanceInstance.methods.updateConfig(lowTestValue, "configDurationInMinutes").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await emergencyGovernanceInstance.methods.updateConfig(lowTestValue, "configRequiredFeeMumav").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await emergencyGovernanceInstance.methods.updateConfig(lowTestValue, "configStakedMvnPercentRequired").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await emergencyGovernanceInstance.methods.updateConfig(highTestValue, "configMinStakedMvnForVoting").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await emergencyGovernanceInstance.methods.updateConfig(highTestValue, "configMinStakedMvnToTrigger").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await emergencyGovernanceInstance.methods.updateConfig(lowTestValue, "configProposalTitleMaxLength").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await emergencyGovernanceInstance.methods.updateConfig(lowTestValue, "configProposalDescMaxLength").send();
                await updateConfigOperation.confirmation();

                // update storage
                councilStorage           = await emergencyGovernanceInstance.storage();
                const updatedConfig      = councilStorage.config;

                // Assertions
                assert.equal(updatedConfig.durationInMinutes                , lowTestValue);
                assert.equal(updatedConfig.requiredFeeMumav                 , lowTestValue);
                assert.equal(updatedConfig.stakedMvnPercentageRequired      , lowTestValue);
                assert.equal(updatedConfig.minStakedMvnRequiredToVote       , highTestValue);
                assert.equal(updatedConfig.minStakedMvnRequiredToTrigger    , highTestValue);
                assert.equal(updatedConfig.proposalTitleMaxLength           , lowTestValue);
                assert.equal(updatedConfig.proposalDescMaxLength            , lowTestValue);

                // reset config operation
                var resetConfigOperation = await emergencyGovernanceInstance.methods.updateConfig(initialConfig.durationInMinutes, "configDurationInMinutes").send();
                await resetConfigOperation.confirmation();

                resetConfigOperation = await emergencyGovernanceInstance.methods.updateConfig(initialConfig.requiredFeeMumav, "configRequiredFeeMumav").send();
                await resetConfigOperation.confirmation();
                
                resetConfigOperation = await emergencyGovernanceInstance.methods.updateConfig(initialConfig.stakedMvnPercentageRequired, "configStakedMvnPercentRequired").send();
                await resetConfigOperation.confirmation();

                resetConfigOperation = await emergencyGovernanceInstance.methods.updateConfig(initialConfig.minStakedMvnRequiredToVote, "configMinStakedMvnForVoting").send();
                await resetConfigOperation.confirmation();

                resetConfigOperation = await emergencyGovernanceInstance.methods.updateConfig(initialConfig.minStakedMvnRequiredToTrigger, "configMinStakedMvnToTrigger").send();
                await resetConfigOperation.confirmation();

                resetConfigOperation = await emergencyGovernanceInstance.methods.updateConfig(initialConfig.proposalTitleMaxLength, "configProposalTitleMaxLength").send();
                await resetConfigOperation.confirmation();

                resetConfigOperation = await emergencyGovernanceInstance.methods.updateConfig(initialConfig.proposalDescMaxLength, "configProposalDescMaxLength").send();
                await resetConfigOperation.confirmation();

                // update storage
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                const resetConfig           = emergencyGovernanceStorage.config;

                assert.equal(resetConfig.durationInMinutes.toNumber(),              initialConfig.durationInMinutes.toNumber());
                assert.equal(resetConfig.requiredFeeMumav.toNumber(),               initialConfig.requiredFeeMumav.toNumber());
                assert.equal(resetConfig.stakedMvnPercentageRequired.toNumber(),    initialConfig.stakedMvnPercentageRequired.toNumber());
                assert.equal(resetConfig.minStakedMvnRequiredToVote.toNumber(),     initialConfig.minStakedMvnRequiredToVote.toNumber());
                assert.equal(resetConfig.minStakedMvnRequiredToTrigger.toNumber(),  initialConfig.minStakedMvnRequiredToTrigger.toNumber());
                assert.equal(resetConfig.proposalTitleMaxLength.toNumber(),         initialConfig.proposalTitleMaxLength.toNumber());
                assert.equal(resetConfig.proposalDescMaxLength.toNumber(),          initialConfig.proposalDescMaxLength.toNumber());

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('%updateWhitelistContracts - admin (bob) should be able to add user (eve) to the Whitelisted Contracts map', async () => {
            try {

                // init values
                contractMapKey  = eve.pkh;
                storageMap      = "whitelistContracts";

                initialContractMapValue           = await getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await updateWhitelistContracts(doormanInstance, contractMapKey, 'update');
                await updateWhitelistContractsOperation.confirmation()

                doormanStorage = await doormanInstance.storage()
                updatedContractMapValue = await getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'Eve (key) should not be in the Whitelist Contracts map before adding her to it')
                assert.notStrictEqual(updatedContractMapValue, undefined,  'Eve (key) should be in the Whitelist Contracts map after adding her to it')

            } catch (e) {
                console.log(e)
            }
        })

        it('%updateWhitelistContracts - admin (bob) should be able to remove user (eve) from the Whitelisted Contracts map', async () => {
            try {

                // init values
                contractMapKey  = eve.pkh;
                storageMap      = "whitelistContracts";

                initialContractMapValue = await getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await updateWhitelistContracts(doormanInstance, contractMapKey, 'remove');
                await updateWhitelistContractsOperation.confirmation()

                doormanStorage = await doormanInstance.storage()
                updatedContractMapValue = await getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                assert.notStrictEqual(initialContractMapValue, undefined, 'Eve (key) should be in the Whitelist Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, undefined, 'Eve (key) should not be in the Whitelist Contracts map after adding her to it');

            } catch (e) {
                console.log(e)
            }
        })

        it('%updateGeneralContracts   - admin (bob) should be able to add user (eve) to the General Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "generalContracts";

                initialContractMapValue = await getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await updateGeneralContracts(doormanInstance, contractMapKey, eve.pkh, 'update');
                await updateGeneralContractsOperation.confirmation()

                doormanStorage = await doormanInstance.storage()
                updatedContractMapValue = await getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'eve (key) should not be in the General Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, eve.pkh, 'eve (key) should be in the General Contracts map after adding her to it');

            } catch (e) {
                console.log(e)
            }
        })

        it('%updateGeneralContracts   - admin (bob) should be able to remove user (eve) from the General Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "generalContracts";

                initialContractMapValue = await getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await updateGeneralContracts(doormanInstance, contractMapKey, eve.pkh, 'remove');
                await updateGeneralContractsOperation.confirmation()

                doormanStorage = await doormanInstance.storage()
                updatedContractMapValue = await getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, eve.pkh, 'eve (key) should be in the General Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, undefined, 'eve (key) should not be in the General Contracts map after adding her to it');

            } catch (e) {
                console.log(e)
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
                transferOperation = await fa2Transfer(mavenFa2TokenInstance, user, doormanAddress, tokenId, tokenAmount);
                await transferOperation.confirmation();
                
                mavenFa2TokenStorage       = await mavenFa2TokenInstance.storage();
                const initialUserBalance    = (await mavenFa2TokenStorage.ledger.get(user)).toNumber()

                await signerFactory(tezos, adminSk);
                mistakenTransferOperation = await mistakenTransferFa2Token(doormanInstance, user, mavenFa2TokenAddress, tokenId, tokenAmount).send();
                await mistakenTransferOperation.confirmation();

                mavenFa2TokenStorage       = await mavenFa2TokenInstance.storage();
                const updatedUserBalance    = (await mavenFa2TokenStorage.ledger.get(user)).toNumber();

                // increase in updated balance
                assert.equal(updatedUserBalance, initialUserBalance + tokenAmount);

            } catch (e) {
                console.log(e)
            }
        })

    });


    describe('Access Control Checks', function () {

        beforeEach("Set signer to non-admin (mallory)", async () => {
            
            emergencyGovernanceStorage = await emergencyGovernanceInstance.storage();
            await signerFactory(tezos, mallory.sk);
        });

        it('%setAdmin                 - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                const currentAdmin          = emergencyGovernanceStorage.admin;

                // fail: set admin operation
                setAdminOperation = await emergencyGovernanceInstance.methods.setAdmin(mallory.pkh);
                await chai.expect(setAdminOperation.send()).to.be.rejected;

                // Final values
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                const newAdmin              = emergencyGovernanceStorage.admin;

                // Assertions
                assert.strictEqual(newAdmin, currentAdmin);

            } catch(e){
                console.log(e);
            }
        });

        it('%setGovernance            - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                const currentGovernance     = emergencyGovernanceStorage.governanceAddress;

                // fail: set governance operation
                setGovernanceOperation = await emergencyGovernanceInstance.methods.setGovernance(mallory.pkh);
                await chai.expect(setGovernanceOperation.send()).to.be.rejected;

                // Final values
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                const updatedGovernance     = emergencyGovernanceStorage.governanceAddress;

                // Assertions
                assert.strictEqual(updatedGovernance, currentGovernance);

            } catch(e){
                console.log(e);
            }
        });

        it('%updateMetadata           - non-admin (mallory) should not be able to update the contract metadata', async () => {
            try{
                // Initial values
                const key   = ''
                const hash  = Buffer.from('mavryk-storage:data fail', 'ascii').toString('hex')

                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();   
                const initialMetadata       = await emergencyGovernanceStorage.metadata.get(key);

                // fail: update metadata operation
                const updateOperation = await emergencyGovernanceInstance.methods.updateMetadata(key, hash);
                await chai.expect(updateOperation.send()).to.be.rejected;

                // Final values
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();            
                const updatedData           = await emergencyGovernanceStorage.metadata.get(key);

                // check that there is no change in metadata
                assert.equal(updatedData, initialMetadata);
                assert.notEqual(updatedData, hash);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('%updateConfig             - non-admin (mallory) should not be able to update contract config', async () => {
            try{
                
                // Initial Values
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                const initialConfig         = emergencyGovernanceStorage.config;

                const lowTestValue  = 1000;
                const highTestValue = 11000000; // for minStakedMvnForVoting and minStakedMvnForTrigger

                // fail: update config operations
                var updateConfigOperation = await emergencyGovernanceInstance.methods.updateConfig(lowTestValue, "configDurationInMinutes");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = await emergencyGovernanceInstance.methods.updateConfig(lowTestValue, "configRequiredFeeMumav");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = await emergencyGovernanceInstance.methods.updateConfig(lowTestValue, "configStakedMvnPercentRequired");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = await emergencyGovernanceInstance.methods.updateConfig(highTestValue, "configMinStakedMvnForVoting");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = await emergencyGovernanceInstance.methods.updateConfig(highTestValue, "configMinStakedMvnToTrigger");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = await emergencyGovernanceInstance.methods.updateConfig(lowTestValue, "configProposalTitleMaxLength");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = await emergencyGovernanceInstance.methods.updateConfig(lowTestValue, "configProposalDescMaxLength");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                // updated storage
                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
                const updatedConfig         = emergencyGovernanceStorage.config;

                // check that there is no change to config
                assert.equal(updatedConfig.durationInMinutes.toNumber(),              initialConfig.durationInMinutes.toNumber());
                assert.equal(updatedConfig.requiredFeeMumav.toNumber(),               initialConfig.requiredFeeMumav.toNumber());
                assert.equal(updatedConfig.stakedMvnPercentageRequired.toNumber(),    initialConfig.stakedMvnPercentageRequired.toNumber());
                assert.equal(updatedConfig.minStakedMvnRequiredToVote.toNumber(),     initialConfig.minStakedMvnRequiredToVote.toNumber());
                assert.equal(updatedConfig.minStakedMvnRequiredToTrigger.toNumber(),  initialConfig.minStakedMvnRequiredToTrigger.toNumber());
                assert.equal(updatedConfig.proposalTitleMaxLength.toNumber(),         initialConfig.proposalTitleMaxLength.toNumber());
                assert.equal(updatedConfig.proposalDescMaxLength.toNumber(),          initialConfig.proposalDescMaxLength.toNumber());

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%updateWhitelistContracts - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // init values
                contractMapKey  = mallory.pkh;
                storageMap      = "whitelistContracts";

                initialContractMapValue = await getStorageMapValue(emergencyGovernanceStorage, storageMap, contractMapKey);

                // fail: update whitelist contracts operation
                updateWhitelistContractsOperation = await emergencyGovernanceInstance.methods.updateWhitelistContracts(contractMapKey, "update")
                await chai.expect(updateWhitelistContractsOperation.send()).to.be.rejected;

                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage()
                updatedContractMapValue     = await getStorageMapValue(emergencyGovernanceStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'mallory (key) should not be in the Whitelist Contracts map');

            } catch (e) {
                console.log(e)
            }
        })

        it('%updateGeneralContracts   - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // init values
                contractMapKey  = "mallory";
                storageMap      = "generalContracts";

                initialContractMapValue = await getStorageMapValue(emergencyGovernanceStorage, storageMap, contractMapKey);

                // fail: update general contracts operation
                updateGeneralContractsOperation = await emergencyGovernanceInstance.methods.updateGeneralContracts(contractMapKey, alice.pkh, "update")
                await chai.expect(updateGeneralContractsOperation.send()).to.be.rejected;

                emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage()
                updatedContractMapValue     = await getStorageMapValue(emergencyGovernanceStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'mallory (key) should not be in the General Contracts map');

            } catch (e) {
                console.log(e)
            }
        })

        it('%mistakenTransfer         - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // Initial values
                user = mallory.pkh;
                const tokenAmount = 10;

                // Mistaken Operation - send 10 MavenFa2Tokens to MVN Token Contract
                transferOperation = await fa2Transfer(mavenFa2TokenInstance, user, doormanAddress, tokenId, tokenAmount);
                await transferOperation.confirmation();

                // fail: mistaken transfer operation
                mistakenTransferOperation = await mistakenTransferFa2Token(emergencyGovernanceInstance, user, mavenFa2TokenAddress, tokenId, tokenAmount);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch (e) {
                console.log(e)
            }
        })

        it("%setLambda                - non-admin (mallory) should not be able to call this entrypoint", async() => {
            try{

                // random lambda for testing
                const randomLambdaName  = "randomLambdaName";
                const randomLambdaBytes = "050200000cba0743096500000112075e09650000005a036e036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a0362036203620362036200000000036203620760036803690000000009650000000a0362036203620362036e00000000075e09650000006c09650000000a0362036203620362036200000000036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a036203620362036203620000000003620362076003680369000000000362075e07650765036203620362036c075e076507650368036e0362036e036200000000070702000001770743075e076507650368036e0362036e020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c03200342020000010e037a034c037a07430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700002034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f02000000090743036200810303270200000000072f020000000907430362009c0203270200000000070702000000600743036200808080809d8fc0d0bff2f1b26703420200000047037a034c037a0321052900080570000205290015034b031105710002031605700002033a0322072f020000001307430368010000000844495620627920300327020000000003160707020000001a037a037a03190332072c0200000002032002000000020327034f0707020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c032000808080809d8fc0d0bff2f1b2670342020000092d037a057a000505700005037a034c07430362008f03052100020529000f0529000307430359030a034c03190325072c0200000002032702000000020320053d036d05700002072e02000008a4072e020000007c057000030570000405700005057000060570000705200005072e020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000081c072e0200000044057000030570000405700005057000060570000705200005072e0200000010072e02000000020320020000000203200200000010072e020000000203200200000002032002000007cc072e0200000028057000030570000405700005057000060570000705200005072e02000000020320020000000203200200000798072e0200000774034c032003480521000305210003034c052900050316034c03190328072c020000000002000000090743036200880303270570000205210002034c0321052100030521000205290011034c0329072f020000002005290015074303620000074303620000074303620000074303620000054200050200000004034c03200743036200000521000203160319032a072c020000021c052100020521000407430362008e02057000020529000907430368010000000a64656c65676174696f6e034203420521000b034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f0200000009074303620081030327020000001a072f02000000060743035903030200000008032007430359030a074303620000034c072c020000007303200521000205210004034205210007034c0326052100030521000205290008034205700007034c03260521000205290005034c05290007034b0311052100030316033a0521000b034c0322072f02000000130743036801000000084449562062792030032702000000000316034c0316031202000000060570000603200521000305210003034205210008034c0326052100030521000205700004052900030312055000030571000205210003052100030570000405290005031205500005057100020521000305700002052100030570000403160312031205500001034c05210003034c0570000305290013034b031105500013034c02000000060570000503200521000205290015055000080521000205700002052900110570000205700003034c0346034c0350055000110571000205210003052900070743036200000790010000000c746f74616c5f737570706c790362072f020000000907430362008a01032702000000000521000405290007074303620000037703420790010000000b6765745f62616c616e63650362072f02000000090743036200890103270200000000034c052100090743036200a40105210004033a033a0322072f0200000013074303680100000008444956206279203003270200000000031605210009074303620002033a0312052100090521000a07430362008803033a033a0322072f020000001307430368010000000844495620627920300327020000000003160743036200a401034c0322072f0200000013074303680100000008444956206279203003270200000000031605210004033a05210009052100020322072f0200000013074303680100000008444956206279203003270200000000031605210005034b0311052100060570000a052100040322072f0200000013074303680100000008444956206279203003270200000000031605700007052900130312055000130571000507430362008c0305210004052100070342034205210009034c0326032005700005057000030342052100050570000305700002037a034c0570000305700002034b0311074303620000052100020319032a072c020000003b05210002034c057000030322072f02000000130743036801000000084449562062792030032702000000000316057000020529001503120550001502000000080570000205200002057100030521000405210003034c05290011034c0329072f0200000009074303620089030327020000000003210521000507430362008b03057000020316057000020342034205700007034c03260320032105700004057000020316034b031105500001052100040529000707430362000005700003034205210004037705700002037a057000040655055f0765046e000000062566726f6d5f065f096500000026046e0000000425746f5f04620000000925746f6b656e5f696404620000000725616d6f756e7400000000000000042574787300000009257472616e73666572072f0200000008074303620027032702000000000743036a0000053d0765036e055f096500000006036e0362036200000000053d096500000006036e036203620000000005700004057000050570000705420003031b057000040342031b034d0743036200000521000303160319032a072c02000000440521000405210003034205700005034c032605210003052100020570000403160312055000010571000205210005034c0570000505290013034b031105500013057100030200000006057000040320034c052100040529001505500008034c0521000405700004052900110570000305210005034c0346034c03500550001105710002052100030570000207430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700004034c03260655036e0000000e256f6e5374616b654368616e6765072f02000000090743036200b702032702000000000743036a000005700002034d053d036d034c031b034c031b02000000180570000305700004057000050570000605700007052000060200000036057000030570000405700005057000060570000705200005072e0200000010072e0200000002032002000000020320020000000203200342";

                // fail: set lambda operation
                const setLambdaOperation = emergencyGovernanceInstance.methods.setLambda(randomLambdaName, randomLambdaBytes); 
                await chai.expect(setLambdaOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

    })

});
