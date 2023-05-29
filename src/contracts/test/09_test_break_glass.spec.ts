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

import { bob, alice, eve, mallory, oscar, trudy, isaac, david, susie, ivan, baker } from "../scripts/sandbox/accounts";
import * as helperFunctions from './helpers/helperFunctions'
import { createLambdaBytes } from '@mavrykdynamics/create-lambda-bytes'

// ------------------------------------------------------------------------------
// Contract Notes
// ------------------------------------------------------------------------------

// Council Members set in deployment
//   - alice, eve, susie, trudy

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("Test: Break Glass Contract", async () => {
    
    var utils: Utils;
    let tezos

    let user 
    let userSk 

    let admin 
    let adminSk

    let councilMember
    let councilMemberSk

    let councilMemberOne
    let councilMemberOneSk

    let councilMemberTwo
    let councilMemberTwoSk

    let councilMemberThree
    let councilMemberThreeSk

    let councilMemberFour
    let councilMemberFourSk

    let stakeAmount
    let unstakeAmount
    let tokenId = 0

    let userStakeRecord
    let initialUserStakeRecord
    let updatedUserStakeRecord

    let userStakedBalance
    let initialUserStakedBalance
    let updatedUserStakedBalance

    let doormanAddress
    let governanceProxyAddress
    let mavrykFa2TokenAddress

    let doormanInstance;
    let delegationInstance;
    let mvkTokenInstance;
    let councilInstance;
    let governanceInstance;
    let emergencyGovernanceInstance;
    let breakGlassInstance;
    let vestingInstance;
    let treasuryInstance;
    let mavrykFa2TokenInstance
    let governanceProxyInstance

    let doormanStorage;
    let delegationStorage;
    let mvkTokenStorage;
    let councilStorage;
    let governanceStorage;
    let emergencyGovernanceStorage;
    let breakGlassStorage;
    let vestingStorage;
    let treasuryStorage;
    let mavrykFa2TokenStorage
    let governanceProxyStorage

    // operations
    let updateOperatorsOperation
    let updateConfigOperation
    let stakeOperation
    let unstakeOperation
    let transferOperation
    let emergencyGovernanceOperation
    let voteOperation
    let dropOperation
    let signActionOperation
    let councilActionOperation

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
        tezos = utils.tezos 

        admin       = bob.pkh
        adminSk     = bob.sk

        councilMemberOne        = eve.pkh;
        councilMemberOneSk      = eve.sk;

        councilMemberTwo        = alice.pkh;
        councilMemberTwoSk      = alice.sk;

        councilMemberThree      = susie.pkh;
        councilMemberThreeSk    = susie.sk;

        councilMemberFour       = trudy.pkh;
        councilMemberFourSk     = trudy.sk;

        doormanAddress          = contractDeployments.doorman.address;
        governanceProxyAddress  = contractDeployments.governanceProxy.address;
        mavrykFa2TokenAddress   = contractDeployments.mavrykFa2Token.address;

        doormanInstance                 = await utils.tezos.contract.at(doormanAddress);
        delegationInstance              = await utils.tezos.contract.at(contractDeployments.delegation.address);
        mvkTokenInstance                = await utils.tezos.contract.at(contractDeployments.mvkToken.address);
        councilInstance                 = await utils.tezos.contract.at(contractDeployments.council.address);
        governanceInstance              = await utils.tezos.contract.at(contractDeployments.governance.address);
        emergencyGovernanceInstance     = await utils.tezos.contract.at(contractDeployments.emergencyGovernance.address);
        breakGlassInstance              = await utils.tezos.contract.at(contractDeployments.breakGlass.address);
        vestingInstance                 = await utils.tezos.contract.at(contractDeployments.vesting.address);
        treasuryInstance                = await utils.tezos.contract.at(contractDeployments.treasury.address);
        mavrykFa2TokenInstance          = await utils.tezos.contract.at(mavrykFa2TokenAddress);
        governanceProxyInstance         = await utils.tezos.contract.at(governanceProxyAddress);
            
        doormanStorage                  = await doormanInstance.storage();
        delegationStorage               = await delegationInstance.storage();
        mvkTokenStorage                 = await mvkTokenInstance.storage();
        councilStorage                  = await councilInstance.storage();
        governanceStorage               = await governanceInstance.storage();
        emergencyGovernanceStorage      = await emergencyGovernanceInstance.storage();
        breakGlassStorage               = await breakGlassInstance.storage();
        vestingStorage                  = await vestingInstance.storage();
        treasuryStorage                 = await treasuryInstance.storage();
        mavrykFa2TokenStorage           = await mavrykFa2TokenInstance.storage();
        governanceProxyStorage          = await governanceProxyInstance.storage();

        console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')

    });


    describe("create council actions for internal control", async () => {

        beforeEach("Set signer to council member (eve)", async () => {
            councilMember   = councilMemberOne;
            await helperFunctions.signerFactory(tezos, councilMemberOneSk)
        });

        it('%updateCouncilMemberInfo        - council member (eve) should be able to update her information', async () => {
            try{
                
                // initial storage
                breakGlassStorage               = await breakGlassInstance.storage();
                const initialCouncilMemberInfo  = breakGlassStorage.councilMembers.get(councilMember);
                
                const oldMemberName     = initialCouncilMemberInfo.name
                const oldMemberImage    = initialCouncilMemberInfo.image
                const oldMemberWebsite  = initialCouncilMemberInfo.website
                
                const randomNumber      = await helperFunctions.randomNumberFromInterval(1, 10);
                const newMemberName     = "Eve " + randomNumber;
                const newMemberImage    = "Eve Image " + randomNumber;
                const newMemberWebsite  = "Eve Website " + randomNumber;

                // Operation
                councilActionOperation = await breakGlassInstance.methods.updateCouncilMemberInfo(newMemberName, newMemberWebsite, newMemberImage).send();
                await councilActionOperation.confirmation();

                // Final values
                breakGlassStorage             = await breakGlassInstance.storage();
                const updatedCouncilMemberInfo   = breakGlassStorage.councilMembers.get(councilMember);

                // Assertions
                assert.strictEqual(updatedCouncilMemberInfo.name       , newMemberName);
                assert.strictEqual(updatedCouncilMemberInfo.image      , newMemberImage);
                assert.strictEqual(updatedCouncilMemberInfo.website    , newMemberWebsite);

                assert.notStrictEqual(updatedCouncilMemberInfo.name    , oldMemberName);
                assert.notStrictEqual(updatedCouncilMemberInfo.image   , oldMemberImage);
                assert.notStrictEqual(updatedCouncilMemberInfo.website , oldMemberWebsite);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%councilActionAddMember         - council member (eve) should be able to create a new action to add a council member (isaac)', async () => {
            try{

                // Initial Values
                breakGlassStorage       = await breakGlassInstance.storage();
                const newMember         = isaac.pkh;
                const newMemberName     = "Isaac";
                const newMemberImage    = "Isaac Image";
                const newMemberWebsite  = "Isaac Website";
                const nextActionId      = breakGlassStorage.actionCounter;

                // Operation
                councilActionOperation = await breakGlassInstance.methods.councilActionAddMember(newMember, newMemberName, newMemberWebsite, newMemberImage).send();
                await councilActionOperation.confirmation();

                // Final values
                breakGlassStorage                   = await breakGlassInstance.storage();
                const action                        = await breakGlassStorage.actionsLedger.get(nextActionId);
                const actionSigner                  = action.signers.includes(councilMember)
                const dataMap                       = await action.dataMap;
                const packedCouncilMemberAddress    = (await utils.tezos.rpc.packData({ data: { string: newMember }, type: { prim: 'address' } })).packed
                const packedCouncilMemberName       = (await utils.tezos.rpc.packData({ data: { string: newMemberName }, type: { prim: 'string' } })).packed
                const packedCouncilMemberWebsite    = (await utils.tezos.rpc.packData({ data: { string: newMemberWebsite }, type: { prim: 'string' } })).packed
                const packedCouncilMemberImage      = (await utils.tezos.rpc.packData({ data: { string: newMemberImage }, type: { prim: 'string' } })).packed

                // Assertions
                assert.strictEqual(action.initiator     , councilMember);
                assert.strictEqual(action.status        , "PENDING");
                assert.strictEqual(action.actionType    , "addCouncilMember");
                
                assert.equal(action.executed            , false);
                assert.equal(actionSigner               , true);
                assert.equal(action.signersCount        , 1);

                assert.equal(dataMap.get("councilMemberAddress")    , packedCouncilMemberAddress);
                assert.equal(dataMap.get("councilMemberName")       , packedCouncilMemberName);
                assert.equal(dataMap.get("councilMemberWebsite")    , packedCouncilMemberWebsite);
                assert.equal(dataMap.get("councilMemberImage")      , packedCouncilMemberImage);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it(`%councilActionAddMember         - council member (eve) should not be able to add an existing council member (alice)`, async () => {
            try{
                
                // Initial Values
                breakGlassStorage       = await breakGlassInstance.storage();
                const newMember         = alice.pkh;
                const newMemberName     = "Alice";
                const newMemberImage    = "Alice Image";
                const newMemberWebsite  = "Alice Website";

                // Operation                
                councilActionOperation = await breakGlassInstance.methods.councilActionAddMember(newMember, newMemberName, newMemberWebsite, newMemberImage);
                await chai.expect(councilActionOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%councilActionRemoveMember      - council member (eve) should be able to create a new action to remove a council member (alice)', async () => {
            try{

                breakGlassStorage       = await breakGlassInstance.storage();
                const memberToBeRemoved = councilMemberThree;
                const nextActionId      = breakGlassStorage.actionCounter;

                // Operation
                councilActionOperation = await breakGlassInstance.methods.councilActionRemoveMember(memberToBeRemoved).send();
                await councilActionOperation.confirmation();

                // Final values
                breakGlassStorage                   = await breakGlassInstance.storage();
                const action                        = await breakGlassStorage.actionsLedger.get(nextActionId);
                const actionSigner                  = action.signers.includes(councilMember)
                const dataMap                       = await action.dataMap;
                const packedCouncilMemberAddress    = (await utils.tezos.rpc.packData({ data: { string: memberToBeRemoved }, type: { prim: 'address' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "removeCouncilMember");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("councilMemberAddress"), packedCouncilMemberAddress);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it(`%councilActionRemoveMember      - council member (eve) should not be able to remove a council member if this results in the signers threshold not being met`, async () => {
            try{

                // Note: Config signer's threshold is the number of required approvals from council members before an action gets executed
                //  - if it is higher than the total number of council members, than an action will never be able to be executed
                
                breakGlassStorage       = await breakGlassInstance.storage();
                const oldThreshold      = breakGlassStorage.config.threshold;
                const newThreshold      = breakGlassStorage.councilMembers.size;
                
                // set signer as admin and update config
                await helperFunctions.signerFactory(tezos, adminSk);
                updateConfigOperation   = await breakGlassInstance.methods.updateConfig(newThreshold, "configThreshold").send();
                await updateConfigOperation.confirmation();

                // initial storage
                breakGlassStorage          = await breakGlassInstance.storage();
                const memberToBeRemoved = councilMemberTwo;

                // Operation
                await helperFunctions.signerFactory(tezos, councilMemberOneSk);
                councilActionOperation = breakGlassInstance.methods.councilActionRemoveMember(memberToBeRemoved);
                await chai.expect(councilActionOperation.send()).to.be.rejected;

                // set signer as admin and reset config
                await helperFunctions.signerFactory(tezos, adminSk);

                updateConfigOperation   = await breakGlassInstance.methods.updateConfig(oldThreshold, "configThreshold").send();
                await updateConfigOperation.confirmation();

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%councilActionRemoveMember      - council member (eve) should not be able to access this entrypoint if the given address (isaac) is not a council member', async () => {
            try{
                // Initial Values
                breakGlassStorage          = await breakGlassInstance.storage();
                const memberAddress     = isaac.pkh;

                // Operation                
                councilActionOperation = breakGlassInstance.methods.councilActionRemoveMember(memberAddress);
                await chai.expect(councilActionOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('%councilActionChangeMember      - council member (eve) should be able to create a new council action to replace a council member (alice) by another (mallory)', async () => {
            try{
                // Initial Values
                breakGlassStorage       = await breakGlassInstance.storage();
                
                const oldMember         = councilMemberThree;
                const newMember         = mallory.pkh;
                
                const nextActionId      = breakGlassStorage.actionCounter;
                const newMemberName     = "Mallory";
                const newMemberImage    = "Mallory Image";
                const newMemberWebsite  = "Mallory Website";

                // Operation
                councilActionOperation = await breakGlassInstance.methods.councilActionChangeMember(oldMember, newMember, newMemberName, newMemberWebsite, newMemberImage).send();
                await councilActionOperation.confirmation();

                // Final values
                breakGlassStorage                   = await breakGlassInstance.storage();
                const action                        = await breakGlassStorage.actionsLedger.get(nextActionId);
                const actionSigner                  = action.signers.includes(councilMember)
                const dataMap                       = await action.dataMap;
                const packedOldCouncilMemberAddress = (await utils.tezos.rpc.packData({ data: { string: oldMember }, type: { prim: 'address' } })).packed
                const packedNewCouncilMemberAddress = (await utils.tezos.rpc.packData({ data: { string: newMember }, type: { prim: 'address' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "changeCouncilMember");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("oldCouncilMemberAddress"), packedOldCouncilMemberAddress);
                assert.equal(dataMap.get("newCouncilMemberAddress"), packedNewCouncilMemberAddress);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%councilActionChangeMember      - council member (eve) should not be able to call this entrypoint if the old member address is not a council member', async () => {
            try{

                // Initial Values
                breakGlassStorage       = await breakGlassInstance.storage();
                const oldMember         = mallory.pkh;
                const newMember         = isaac.pkh;
                const newMemberName     = "Isaac";
                const newMemberImage    = "Isaac Image";
                const newMemberWebsite  = "Isaac Website";

                // Operation
                councilActionOperation = breakGlassInstance.methods.councilActionChangeMember(oldMember, newMember, newMemberName, newMemberWebsite, newMemberImage)
                await chai.expect(councilActionOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%councilActionChangeMember      - council member (eve) should not be able to call this entrypoint if the new member address is already a council member', async () => {
            try{

                // Initial Values
                breakGlassStorage       = await breakGlassInstance.storage();
                const oldMember         = councilMemberOne;
                const newMember         = councilMemberTwo;
                const newMemberName     = "Trudy";
                const newMemberImage    = "Trudy Image";
                const newMemberWebsite  = "Trudy Website";

                // Operation
                councilActionOperation = breakGlassInstance.methods.councilActionChangeMember(oldMember, newMember, newMemberName, newMemberWebsite, newMemberImage)
                await chai.expect(councilActionOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

    })


    describe("glass not broken: break glass actions should not be accessible", async () => {

        beforeEach("Set signer to council member", async () => {
            breakGlassStorage       = await breakGlassInstance.storage();
            await helperFunctions.signerFactory(tezos, councilMemberOneSk)
        });

        it('%setSingleContractAdmin         - council member (eve) should not be able to access this entrypoint if glass is not broken', async () => {
            try{

                // Initial Values
                breakGlassStorage       = await breakGlassInstance.storage();
                const newAdmin          = oscar.pkh;
                const targetContract    = contractDeployments.doorman.address;
                const glassBroken       = breakGlassStorage.glassBroken;

                // Operation
                await chai.expect(breakGlassInstance.methods.setSingleContractAdmin(targetContract, newAdmin).send()).to.be.rejected;
                assert.equal(glassBroken, false);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%setAllContractsAdmin           - council member (eve) should not be able to access this entrypoint if glass is not broken', async () => {
            try{

                // Initial Values
                breakGlassStorage       = await breakGlassInstance.storage();
                const newAdmin          = oscar.pkh;
                const glassBroken       = breakGlassStorage.glassBroken;

                // Operation
                await chai.expect(breakGlassInstance.methods.setAllContractsAdmin(newAdmin).send()).to.be.rejected;
                assert.equal(glassBroken, false);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%pauseAllEntrypoints            - council member (eve) should not be able to access this entrypoint if glass is not broken', async () => {
            try{

                // Initial Values
                breakGlassStorage       = await breakGlassInstance.storage();
                const glassBroken       = breakGlassStorage.glassBroken;

                // Operation
                await chai.expect(breakGlassInstance.methods.pauseAllEntrypoints().send()).to.be.rejected;
                assert.equal(glassBroken, false);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%unpauseAllEntrypoints          - council member (eve) should not be able to access this entrypoint if glass is not broken', async () => {
            try{

                // Initial Values
                breakGlassStorage       = await breakGlassInstance.storage();
                const glassBroken       = breakGlassStorage.glassBroken;

                // Operation
                await chai.expect(breakGlassInstance.methods.unpauseAllEntrypoints().send()).to.be.rejected;
                assert.equal(glassBroken, false);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('%removeBreakGlassControl        - council member (eve) should not be able to access this entrypoint if glass is not broken', async () => {
            try{
                // Initial Values
                breakGlassStorage       = await breakGlassInstance.storage();
                const glassBroken       = breakGlassStorage.glassBroken;

                // Operation
                await chai.expect(breakGlassInstance.methods.removeBreakGlassControl().send()).to.be.rejected;
                assert.equal(glassBroken, false);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%setAllContractsAdmin           - council member (eve) should not be able to access this entrypoint if glass is not broken', async () => {
            try{
                // Initial Values
                breakGlassStorage       = await breakGlassInstance.storage();
                const newAdmin          = oscar.pkh;

                // Operation
                await chai.expect(breakGlassInstance.methods.setAllContractsAdmin(newAdmin).send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

    });


    describe("%breakGlass", async () => {

        it('%breakGlass                     - council member (eve) should not be able to trigger breakGlass', async () => {
            try{
                
                // Operation
                await helperFunctions.signerFactory(tezos, councilMemberOneSk)
                await chai.expect(breakGlassInstance.methods.breakGlass().send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%breakGlass                     - user (mallory) should not be able to trigger breakGlass', async () => {
            try{
                
                // Operation
                await helperFunctions.signerFactory(tezos, mallory.sk)
                await chai.expect(breakGlassInstance.methods.breakGlass().send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%breakGlass                     - emergency governance contract should be able to trigger breakGlass with enough votes', async () => {
            try{

                // set signer to proposer (eve)
                user    = eve.pkh;
                userSk  = eve.sk;
                await helperFunctions.signerFactory(tezos, userSk)
                
                // initial values
                emergencyGovernanceStorage      = await emergencyGovernanceInstance.storage();
                doormanStorage                  = await doormanInstance.storage();

                const requiredFeeMutez           = emergencyGovernanceStorage.config.requiredFeeMutez;
                const sMvkRequiredToTrigger      = emergencyGovernanceStorage.config.minStakedMvkRequiredToTrigger;

                initialUserStakeRecord          = await doormanStorage.userStakeBalanceLedger.get(user);
                initialUserStakedBalance        = initialUserStakeRecord === undefined ? 0 : initialUserStakeRecord.balance.toNumber()

                // ensure that user has enough staked MVK to trigger emergency governance
                if(initialUserStakedBalance < sMvkRequiredToTrigger){
                    
                    updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, user, doormanAddress, tokenId);
                    await updateOperatorsOperation.confirmation();

                    // set stake amount so that user's final staked balance will be above sMvkRequiredToTrigger
                    stakeAmount    = Math.abs(initialUserStakedBalance - sMvkRequiredToTrigger) + 1;
                    stakeOperation = await doormanInstance.methods.stake(stakeAmount).send();
                    await stakeOperation.confirmation();
                }

                // ---------------------------------------------------------------
                // Set all contracts admin to governance address if it is not
                // ---------------------------------------------------------------

                await helperFunctions.signerFactory(tezos, adminSk);
                governanceStorage             = await governanceInstance.storage();
                var generalContracts          = governanceStorage.generalContracts.entries();

                var setAdminOperation         = await governanceInstance.methods.setAdmin(governanceProxyAddress).send();
                await setAdminOperation.confirmation();

                for (let entry of generalContracts){
                    // Get contract storage
                    var contract        = await utils.tezos.contract.at(entry[1]);
                    var storage :any    = await contract.storage();

                    // Check admin
                    if(storage.hasOwnProperty('admin') && storage.admin! == governanceProxyAddress){
                        setAdminOperation   = await contract.methods.setAdmin(governanceProxyAddress).send();
                        await setAdminOperation.confirmation()
                    }
                }

                const emergencyTitle  = "Test emergency control";
                const emergencyDesc   = "Test description";

                await helperFunctions.signerFactory(tezos, userSk)
                const emergencyControlOperation = await emergencyGovernanceInstance.methods.triggerEmergencyControl(
                    emergencyTitle, emergencyDesc
                ).send({amount: requiredFeeMutez, mutez: true});
                await emergencyControlOperation.confirmation();

                // user (eve) vote for emergency control
                await helperFunctions.signerFactory(tezos, userSk)
                voteOperation     = await emergencyGovernanceInstance.methods.voteForEmergencyControl().send();
                await voteOperation.confirmation();

                // user (alice) vote for emergency control
                await helperFunctions.signerFactory(tezos, alice.sk)
                voteOperation     = await emergencyGovernanceInstance.methods.voteForEmergencyControl().send();
                await voteOperation.confirmation();

                // user (mallory) vote for emergency control
                await helperFunctions.signerFactory(tezos, mallory.sk)
                voteOperation     = await emergencyGovernanceInstance.methods.voteForEmergencyControl().send();
                await voteOperation.confirmation();

                // user (trudy) vote for emergency control
                await helperFunctions.signerFactory(tezos, trudy.sk)
                voteOperation     = await emergencyGovernanceInstance.methods.voteForEmergencyControl().send();
                await voteOperation.confirmation();

                // Check if glass was broken
                breakGlassStorage       = await breakGlassInstance.storage();
                const glassBroken       = breakGlassStorage.glassBroken;
                assert.equal(glassBroken, true);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('%propagateBreakGlass            - council member (eve) should be able to create council action to propagate break glass', async () => {
            try{
                
                // Propagate break glass
                breakGlassStorage         = await breakGlassInstance.storage();
                var breakGlassActionID    = breakGlassStorage.actionCounter;
                
                // propagate break glass operation
                await helperFunctions.signerFactory(tezos, councilMemberOneSk)
                const propagateActionOperation    = await breakGlassInstance.methods.propagateBreakGlass().send();
                await propagateActionOperation.confirmation();
                
                // Sign council action to propagate action
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk);
                var signActionOperation   = await breakGlassInstance.methods.signAction(breakGlassActionID).send();
                await signActionOperation.confirmation();

                await helperFunctions.signerFactory(tezos, councilMemberThreeSk);
                signActionOperation   = await breakGlassInstance.methods.signAction(breakGlassActionID).send();
                await signActionOperation.confirmation();

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

    
    });


    describe("%flushAction", async() => {

        beforeEach("Set signer to council member (eve)", async () => {
            councilMember = councilMemberOne;
            await helperFunctions.signerFactory(tezos, councilMemberOneSk)
        });


        it('%flushAction                    - council member (eve) should be able to create a new action to flush a pending action', async () => {
            try{
                // Initial Values
                breakGlassStorage       = await breakGlassInstance.storage();
                const nextActionID      = breakGlassStorage.actionCounter;
                const flushedAction     = 1;

                // Operation
                const newActionOperation = await breakGlassInstance.methods.flushAction(flushedAction).send();
                await newActionOperation.confirmation();

                // Final values
                breakGlassStorage       = await breakGlassInstance.storage();
                const action            = await breakGlassStorage.actionsLedger.get(nextActionID);
                const actionSigner      = action.signers.includes(councilMember)
                const dataMap           = await action.dataMap;
                const packedFlushedId   = (await utils.tezos.rpc.packData({ data: { int: flushedAction.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "flushAction");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(breakGlassStorage.glassBroken, true);
                assert.equal(dataMap.get("actionId"), packedFlushedId);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%flushAction                    - council member (eve) should not be able to flush a non-existent action', async () => {
            try{
                // Initial Values
                const flushedAction = 9999;

                // Operation
                await chai.expect(breakGlassInstance.methods.flushAction(flushedAction).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%flushAction                    - council member (eve) should not be able to flush an action after it has already been flushed', async () => {
            try{
                // Initial Values
                breakGlassStorage       = await breakGlassInstance.storage();
                const newCouncilMember  = oscar.pkh;
                const newMemberName     = "Member Name";
                const newMemberImage    = "Member Image";
                const newMemberWebsite  = "Member Website";
                var actionId       = breakGlassStorage.actionCounter;

                // Operation
                const newActionOperation = await breakGlassInstance.methods.councilActionAddMember(newCouncilMember, newMemberName, newMemberWebsite, newMemberImage).send();
                await newActionOperation.confirmation();

                // Mid Values
                breakGlassStorage       = await breakGlassInstance.storage();
                const flushActionId     = breakGlassStorage.actionCounter;

                // Operation
                const flushActionOperation = await breakGlassInstance.methods.flushAction(actionId).send();
                await flushActionOperation.confirmation();

                // Operation
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk);
                let signOperation = await breakGlassInstance.methods.signAction(flushActionId).send();
                await signOperation.confirmation();

                await helperFunctions.signerFactory(tezos, councilMemberThreeSk);
                signOperation = await breakGlassInstance.methods.signAction(flushActionId).send();
                await signOperation.confirmation();

                breakGlassStorage       = await breakGlassInstance.storage();
                const flushedAction     = await breakGlassStorage.actionsLedger.get(flushActionId);
                const newAction         = await breakGlassStorage.actionsLedger.get(actionId);
                const signerThreshold   = breakGlassStorage.config.threshold;

                assert.equal(flushedAction.executed, true);
                assert.equal(flushedAction.signersCount.toNumber(), signerThreshold.toNumber());
                assert.equal(flushedAction.status, "EXECUTED");

                assert.equal(newAction.executed, false);
                assert.equal(newAction.status, "FLUSHED");

                // Operation
                await chai.expect(breakGlassInstance.methods.flushAction(actionId).send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('%flushAction                    - council member (eve) should not be able to flush an executed action', async () => {
            try{
                // Initial Values
                breakGlassStorage       = await breakGlassInstance.storage();
                const newCouncilMember  = isaac.pkh;
                const newMemberName     = "Member Name";
                const newMemberImage    = "Member Image";
                const newMemberWebsite  = "Member Website";
                const nextActionID      = breakGlassStorage.actionCounter;

                // Operation
                const newActionOperation = await breakGlassInstance.methods.councilActionAddMember(newCouncilMember, newMemberName, newMemberWebsite, newMemberImage).send();
                await newActionOperation.confirmation();

                // Final values
                breakGlassStorage                   = await breakGlassInstance.storage();
                var action                          = await breakGlassStorage.actionsLedger.get(nextActionID);
                const actionSigner                  = action.signers.includes(councilMember)
                const dataMap                       = await action.dataMap;
                const packedCouncilMemberAddress    = (await utils.tezos.rpc.packData({ data: { string: newCouncilMember }, type: { prim: 'address' } })).packed
                const packedCouncilMemberName       = (await utils.tezos.rpc.packData({ data: { string: newMemberName }, type: { prim: 'string' } })).packed
                const packedCouncilMemberWebsite    = (await utils.tezos.rpc.packData({ data: { string: newMemberWebsite }, type: { prim: 'string' } })).packed
                const packedCouncilMemberImage      = (await utils.tezos.rpc.packData({ data: { string: newMemberImage }, type: { prim: 'string' } })).packed
                const signerThreshold               = breakGlassStorage.config.threshold;

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "addCouncilMember");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("councilMemberAddress"), packedCouncilMemberAddress);
                assert.equal(dataMap.get("councilMemberName"), packedCouncilMemberName);
                assert.equal(dataMap.get("councilMemberImage"), packedCouncilMemberImage);
                assert.equal(dataMap.get("councilMemberWebsite"), packedCouncilMemberWebsite);

                // Sign Operations
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk);
                let signOperation = await breakGlassInstance.methods.signAction(nextActionID).send();
                await signOperation.confirmation();

                await helperFunctions.signerFactory(tezos, councilMemberThreeSk);
                signOperation = await breakGlassInstance.methods.signAction(nextActionID).send();
                await signOperation.confirmation();

                // Final values
                breakGlassStorage       = await breakGlassInstance.storage();
                action                  = await breakGlassStorage.actionsLedger.get(nextActionID);

                const newCouncilStorage = breakGlassStorage.councilMembers.has(newCouncilMember)

                assert.equal(action.executed, true);
                assert.equal(action.signersCount.toNumber(), signerThreshold.toNumber());
                assert.equal(action.status, "EXECUTED");
                assert.equal(newCouncilStorage, true);

                // Operation
                await helperFunctions.signerFactory(tezos, councilMemberOneSk);
                await chai.expect(breakGlassInstance.methods.flushAction(nextActionID).send()).to.be.rejected;

                breakGlassStorage       = await breakGlassInstance.storage();
                const resetActionID     = breakGlassStorage.actionCounter;

                // Operation
                const resetActionOperation = await breakGlassInstance.methods.councilActionRemoveMember(newCouncilMember).send();
                await resetActionOperation.confirmation();

                // Sign Operations
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk);
                signOperation = await breakGlassInstance.methods.signAction(resetActionID).send();
                await signOperation.confirmation();

                await helperFunctions.signerFactory(tezos, councilMemberThreeSk);
                signOperation = await breakGlassInstance.methods.signAction(resetActionID).send();
                await signOperation.confirmation();

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

    })

    describe("glass broken", async () => {

        beforeEach("Set signer to council member (eve)", async () => {

            councilMember       = councilMemberOne;
            breakGlassStorage   = await breakGlassInstance.storage();

            await helperFunctions.signerFactory(tezos, councilMemberOneSk)
        });

        it('%setSingleContractAdmin         - council member (eve) should not be able to create a new action to set a non-whitelisted developer address (oscar) as a new contract admin', async () => {
            try{
                
                // Initial Values
                breakGlassStorage           = await breakGlassInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                governanceStorage           = await governanceInstance.storage();

                const newAdmin              = oscar.pkh;
                const targetContract        = contractDeployments.doorman.address;
                const whitelistedDevelopers = await governanceStorage.whitelistDevelopers;

                // Assertions
                assert.strictEqual(whitelistedDevelopers.includes(newAdmin), false)

                // Operation
                const newActionOperation = breakGlassInstance.methods.setSingleContractAdmin(targetContract, newAdmin);
                await chai.expect(newActionOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('%setSingleContractAdmin         - council member (eve) should be able to create a new action to set a new admin (whitelisted developer - bob) on a target contract', async () => {
            try{
                
                // Initial Values
                breakGlassStorage       = await breakGlassInstance.storage();
                doormanStorage          = await doormanInstance.storage();
                const nextActionID      = breakGlassStorage.actionCounter;
                const newAdmin          = bob.pkh;
                const targetContract    = contractDeployments.doorman.address;

                // Operation
                const newActionOperation = await breakGlassInstance.methods.setSingleContractAdmin(targetContract, newAdmin).send();
                await newActionOperation.confirmation();

                // Final values
                breakGlassStorage                   = await breakGlassInstance.storage();
                const action                        = await breakGlassStorage.actionsLedger.get(nextActionID);
                const actionSigner                  = action.signers.includes(councilMember)
                const dataMap                       = await action.dataMap;
                const packedAdmin                   = (await utils.tezos.rpc.packData({ data: { string: newAdmin }, type: { prim: 'address' } })).packed
                const packedContract                = (await utils.tezos.rpc.packData({ data: { string: targetContract }, type: { prim: 'address' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "setSingleContractAdmin");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("newAdminAddress"), packedAdmin);
                assert.equal(dataMap.get("targetContractAddress"), packedContract);
                assert.equal(breakGlassStorage.glassBroken, true);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('%setSingleContractAdmin         - council member (eve) should be able to create a new action to set a new admin (governance proxy contract) on a target contract', async () => {
            try{
                
                // Initial Values
                breakGlassStorage       = await breakGlassInstance.storage();
                doormanStorage          = await doormanInstance.storage();
                const nextActionID      = breakGlassStorage.actionCounter;
                const newAdmin          = governanceProxyAddress;
                const targetContract    = contractDeployments.doorman.address;

                // Operation
                const newActionOperation = await breakGlassInstance.methods.setSingleContractAdmin(targetContract, newAdmin).send();
                await newActionOperation.confirmation();

                // Final values
                breakGlassStorage                   = await breakGlassInstance.storage();
                const action                        = await breakGlassStorage.actionsLedger.get(nextActionID);
                const actionSigner                  = action.signers.includes(councilMember)
                const dataMap                       = await action.dataMap;
                const packedAdmin                   = (await utils.tezos.rpc.packData({ data: { string: newAdmin }, type: { prim: 'address' } })).packed
                const packedContract                = (await utils.tezos.rpc.packData({ data: { string: targetContract }, type: { prim: 'address' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "setSingleContractAdmin");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("newAdminAddress"), packedAdmin);
                assert.equal(dataMap.get("targetContractAddress"), packedContract);
                assert.equal(breakGlassStorage.glassBroken, true);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('%setSingleContractAdmin         - council member (eve) should be able to create a new action to set a new admin (break glass contract) on a target contract', async () => {
            try{
                
                // Initial Values
                breakGlassStorage       = await breakGlassInstance.storage();
                doormanStorage          = await doormanInstance.storage();
                const nextActionID      = breakGlassStorage.actionCounter;
                const newAdmin          = contractDeployments.breakGlass.address;
                const targetContract    = contractDeployments.doorman.address;

                // Operation
                const newActionOperation = await breakGlassInstance.methods.setSingleContractAdmin(targetContract, newAdmin).send();
                await newActionOperation.confirmation();

                // Final values
                breakGlassStorage                   = await breakGlassInstance.storage();
                const action                        = await breakGlassStorage.actionsLedger.get(nextActionID);
                const actionSigner                  = action.signers.includes(councilMember)
                const dataMap                       = await action.dataMap;
                const packedAdmin                   = (await utils.tezos.rpc.packData({ data: { string: newAdmin }, type: { prim: 'address' } })).packed
                const packedContract                = (await utils.tezos.rpc.packData({ data: { string: targetContract }, type: { prim: 'address' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "setSingleContractAdmin");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("newAdminAddress"), packedAdmin);
                assert.equal(dataMap.get("targetContractAddress"), packedContract);
                assert.equal(breakGlassStorage.glassBroken, true);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('%setAllContractsAdmin           - council member (eve) should not be able to create a new action to set a non-whitelisted developer address as the new admin in all contracts', async () => {
            try{

                // Initial Values
                breakGlassStorage           = await breakGlassInstance.storage();
                governanceStorage           = await governanceInstance.storage();

                const newAdmin              = oscar.pkh;
                const whitelistedDevelopers = await governanceStorage.whitelistDevelopers;

                // Assertions
                assert.strictEqual(whitelistedDevelopers.includes(newAdmin), false)

                // Operation
                const newActionOperation = breakGlassInstance.methods.setAllContractsAdmin(newAdmin);
                await chai.expect(newActionOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('%setAllContractsAdmin           - council member (eve) should be able to create a new action to set new admin (governance proxy contract) in all contracts', async () => {
            try{

                // Initial Values
                breakGlassStorage       = await breakGlassInstance.storage();
                const nextActionID      = breakGlassStorage.actionCounter;
                const newAdmin          = governanceProxyAddress;

                // Operation
                const newActionOperation = await breakGlassInstance.methods.setAllContractsAdmin(newAdmin).send();
                await newActionOperation.confirmation();

                // Final values
                breakGlassStorage   = await breakGlassInstance.storage();
                const action        = await breakGlassStorage.actionsLedger.get(nextActionID);
                const actionSigner  = action.signers.includes(councilMember)
                const dataMap       = await action.dataMap;
                const packedAdmin   = (await utils.tezos.rpc.packData({ data: { string: newAdmin }, type: { prim: 'address' } })).packed

                // Assertions
                assert.strictEqual(action.initiator,councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "setAllContractsAdmin");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("newAdminAddress"), packedAdmin);
                assert.equal(breakGlassStorage.glassBroken, true);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('%setAllContractsAdmin           - council member (eve) should be able to create a new action to set new admin (breakGlass contract) in all contracts', async () => {
            try{

                // Initial Values
                breakGlassStorage       = await breakGlassInstance.storage();
                const nextActionID      = breakGlassStorage.actionCounter;
                const newAdmin          = contractDeployments.breakGlass.address;

                // Operation
                const newActionOperation = await breakGlassInstance.methods.setAllContractsAdmin(newAdmin).send();
                await newActionOperation.confirmation();

                // Final values
                breakGlassStorage   = await breakGlassInstance.storage();
                const action        = await breakGlassStorage.actionsLedger.get(nextActionID);
                const actionSigner  = action.signers.includes(councilMember)
                const dataMap       = await action.dataMap;
                const packedAdmin   = (await utils.tezos.rpc.packData({ data: { string: newAdmin }, type: { prim: 'address' } })).packed

                // Assertions
                assert.strictEqual(action.initiator,councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "setAllContractsAdmin");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("newAdminAddress"), packedAdmin);
                assert.equal(breakGlassStorage.glassBroken, true);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%setAllContractsAdmin           - council member (eve) should be able to create a new action to set new admin (whitelisted developer - bob) in all contracts', async () => {
            try{

                // Initial Values
                breakGlassStorage       = await breakGlassInstance.storage();
                const nextActionID      = breakGlassStorage.actionCounter;
                const newAdmin          = bob.pkh;

                // Operation
                const newActionOperation = await breakGlassInstance.methods.setAllContractsAdmin(newAdmin).send();
                await newActionOperation.confirmation();

                // Final values
                breakGlassStorage   = await breakGlassInstance.storage();
                const action        = await breakGlassStorage.actionsLedger.get(nextActionID);
                const actionSigner  = action.signers.includes(councilMember)
                const dataMap       = await action.dataMap;
                const packedAdmin   = (await utils.tezos.rpc.packData({ data: { string: newAdmin }, type: { prim: 'address' } })).packed

                // Assertions
                assert.strictEqual(action.initiator,councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "setAllContractsAdmin");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("newAdminAddress"), packedAdmin);
                assert.equal(breakGlassStorage.glassBroken, true);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('%pauseAllEntrypoints            - council member (eve) should be able to create a new action to pause entrypoints in all contracts', async () => {
            try{
                // Initial Values
                breakGlassStorage       = await breakGlassInstance.storage();
                const nextActionID      = breakGlassStorage.actionCounter;

                // Operation
                const newActionOperation = await breakGlassInstance.methods.pauseAllEntrypoints().send();
                await newActionOperation.confirmation();

                // Final values
                breakGlassStorage   = await breakGlassInstance.storage();
                const action        = await breakGlassStorage.actionsLedger.get(nextActionID);
                const actionSigner  = action.signers.includes(councilMember)

                // Assertions
                assert.strictEqual(action.initiator,councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "pauseAllEntrypoints");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(breakGlassStorage.glassBroken, true);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%unpauseAllEntrypoints          - council member (eve) should be able to create a new action to unpause entrypoints in all contracts', async () => {
            try{
                // Initial Values
                breakGlassStorage       = await breakGlassInstance.storage();
                const nextActionID      = breakGlassStorage.actionCounter;

                // Operation
                const newActionOperation = await breakGlassInstance.methods.unpauseAllEntrypoints().send();
                await newActionOperation.confirmation();

                // Final values
                breakGlassStorage   = await breakGlassInstance.storage();
                const action        = await breakGlassStorage.actionsLedger.get(nextActionID);
                const actionSigner  = action.signers.includes(councilMember)

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "unpauseAllEntrypoints");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(breakGlassStorage.glassBroken, true);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('%removeBreakGlassControl        - council member (eve) should be able to create a new action to remove the break glass control', async () => {
            try{

                // Initial Values
                breakGlassStorage       = await breakGlassInstance.storage();
                const nextActionID      = breakGlassStorage.actionCounter;

                // Operation
                const newActionOperation = await breakGlassInstance.methods.removeBreakGlassControl().send();
                await newActionOperation.confirmation();

                // Final values
                breakGlassStorage   = await breakGlassInstance.storage();
                const action        = await breakGlassStorage.actionsLedger.get(nextActionID);
                const actionSigner  = action.signers.includes(councilMember)

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "removeBreakGlassControl");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(breakGlassStorage.glassBroken, true);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('%setSingleContractAdmin         - council member (eve) should not be able to access this entrypoint if the provided contract does not have a setAdmin entrypoint', async () => {
            try{
                
                // Initial Values
                breakGlassStorage       = await breakGlassInstance.storage();
                const newAdmin          = oscar.pkh;
                const targetContract    = trudy.pkh;

                // Operation
                await chai.expect(breakGlassInstance.methods.setSingleContractAdmin(targetContract, newAdmin).send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%setSingleContractAdmin         - non-council member (mallory) should not be able to access this entrypoint', async () => {
            try{
                // Initial Values
                await helperFunctions.signerFactory(tezos, mallory.sk);
                const newAdmin          = oscar.pkh;
                const targetContract    = contractDeployments.doorman.address;

                await chai.expect(breakGlassInstance.methods.setSingleContractAdmin(targetContract, newAdmin).send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%setAllContractsAdmin           - non-council member (mallory) should not be able to access this entrypoint', async () => {
            try{

                // Initial Values
                await helperFunctions.signerFactory(tezos, mallory.sk);
                const newAdmin          = oscar.pkh;
                await chai.expect(breakGlassInstance.methods.setAllContractsAdmin(newAdmin).send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%pauseAllEntrypoints            - non-council member (mallory) should not be able to access this entrypoint', async () => {
            try{
                
                // Initial Values
                await helperFunctions.signerFactory(tezos, mallory.sk);
                await chai.expect(breakGlassInstance.methods.pauseAllEntrypoints().send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
        it('%unpauseAllEntrypoints          - non-council member (mallory) should not be able to access this entrypoint', async () => {
            try{
                // Initial Values
                await helperFunctions.signerFactory(tezos, mallory.sk);
                await chai.expect(breakGlassInstance.methods.unpauseAllEntrypoints().send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%removeBreakGlassControl        - non-council member (mallory) should not be able to access this entrypoint', async () => {
            try{
                
                // Initial Values
                await helperFunctions.signerFactory(tezos, mallory.sk);
                await chai.expect(breakGlassInstance.methods.removeBreakGlassControl().send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

    })

    describe("%signAction", async () => {

        before("Set breakGlass contract admin to Bob for various tests", async() => {
            try{
                breakGlassStorage               = await breakGlassInstance.storage();
                const nextActionID              = breakGlassStorage.actionCounter;

                // council action set break glass contract admin to bob
                await helperFunctions.signerFactory(tezos, councilMemberOneSk);
                const setContractAdminOperation   = await breakGlassInstance.methods.setSingleContractAdmin(contractDeployments.breakGlass.address, admin).send();
                await setContractAdminOperation.confirmation();

                await helperFunctions.signerFactory(tezos, councilMemberTwoSk);
                signActionOperation   = await breakGlassInstance.methods.signAction(nextActionID).send();
                await signActionOperation.confirmation();

                await helperFunctions.signerFactory(tezos, councilMemberThreeSk);
                signActionOperation   = await breakGlassInstance.methods.signAction(nextActionID).send();
                await signActionOperation.confirmation();

                // // set signer to admin and update config action expiry days
                // await helperFunctions.signerFactory(tezos, adminSk);
                // var updateConfigOperation = await breakGlassInstance.methods.updateConfig(1,"configActionExpiryDays").send();
                // await updateConfigOperation.confirmation();

                // reset signer back to council member one
                await helperFunctions.signerFactory(tezos, councilMemberOneSk)

            } catch (e) {
                console.dir(e, {depth: 5});
            }
        })

        beforeEach("Set signer to council member (eve)", async () => {
            councilMember = councilMemberOne 
            await helperFunctions.signerFactory(tezos, councilMemberOneSk)
        });

        it('addCouncilMember               --> should add an ordinary user (david) as a council member ', async () => {
            try{
                // Initial Values
                breakGlassStorage       = await breakGlassInstance.storage();
                const newCouncilMember  = david.pkh;
                const newMemberName     = "Member Name";
                const newMemberImage    = "Member Image";
                const newMemberWebsite  = "Member Website";
                const nextActionID      = breakGlassStorage.actionCounter;

                // Operation
                const newActionOperation = await breakGlassInstance.methods.councilActionAddMember(newCouncilMember, newMemberName, newMemberWebsite, newMemberImage).send();
                await newActionOperation.confirmation();

                // Create the same action for the next test
                const duplicatedActionOperation = await breakGlassInstance.methods.councilActionAddMember(newCouncilMember, newMemberName, newMemberWebsite, newMemberImage).send();
                await duplicatedActionOperation.confirmation();

                // Final values
                breakGlassStorage                   = await breakGlassInstance.storage();
                var action                          = await breakGlassStorage.actionsLedger.get(nextActionID);
                const actionSigner                  = action.signers.includes(councilMember)
                const dataMap                       = await action.dataMap;
                const packedCouncilMemberAddress    = (await utils.tezos.rpc.packData({ data: { string: newCouncilMember }, type: { prim: 'address' } })).packed
                const packedCouncilMemberName       = (await utils.tezos.rpc.packData({ data: { string: newMemberName }, type: { prim: 'string' } })).packed
                const packedCouncilMemberWebsite    = (await utils.tezos.rpc.packData({ data: { string: newMemberWebsite }, type: { prim: 'string' } })).packed
                const packedCouncilMemberImage      = (await utils.tezos.rpc.packData({ data: { string: newMemberImage }, type: { prim: 'string' } })).packed
                const signerThreshold   = breakGlassStorage.config.threshold;

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "addCouncilMember");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("councilMemberAddress"), packedCouncilMemberAddress);
                assert.equal(dataMap.get("councilMemberName"), packedCouncilMemberName);
                assert.equal(dataMap.get("councilMemberImage"), packedCouncilMemberImage);
                assert.equal(dataMap.get("councilMemberWebsite"), packedCouncilMemberWebsite);

                // Sign Action Operation
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk);
                signActionOperation = await breakGlassInstance.methods.signAction(nextActionID).send();
                await signActionOperation.confirmation();

                await helperFunctions.signerFactory(tezos, councilMemberThreeSk);
                signActionOperation = await breakGlassInstance.methods.signAction(nextActionID).send();
                await signActionOperation.confirmation();

                // Final values
                breakGlassStorage       = await breakGlassInstance.storage();
                action                  = await breakGlassStorage.actionsLedger.get(nextActionID);

                assert.equal(action.executed, true);
                assert.equal(action.signersCount.toNumber(), signerThreshold.toNumber());
                assert.equal(action.status, "EXECUTED");

                const newCouncilStorage = breakGlassStorage.councilMembers.has(newCouncilMember)
                assert.equal(newCouncilStorage, true);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('removeCouncilMember            --> should remove a given council member (david) from the council', async () => {
            try{
                // Initial Values
                breakGlassStorage           = await breakGlassInstance.storage();
                const removedCouncilMember  = david.pkh;
                const nextActionID          = breakGlassStorage.actionCounter;

                // Operation
                const newActionOperation = await breakGlassInstance.methods.councilActionRemoveMember(removedCouncilMember).send();
                await newActionOperation.confirmation();

                // Final values
                breakGlassStorage                   = await breakGlassInstance.storage();
                var action                          = await breakGlassStorage.actionsLedger.get(nextActionID);
                const actionSigner                  = action.signers.includes(councilMember)
                const dataMap                       = await action.dataMap;
                const packedCouncilMemberAddress    = (await utils.tezos.rpc.packData({ data: { string: removedCouncilMember }, type: { prim: 'address' } })).packed
                const signerThreshold   = breakGlassStorage.config.threshold;

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "removeCouncilMember");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("councilMemberAddress"), packedCouncilMemberAddress);

                // Sign Action Operation
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk);
                signActionOperation = await breakGlassInstance.methods.signAction(nextActionID).send();
                await signActionOperation.confirmation();

                await helperFunctions.signerFactory(tezos, councilMemberThreeSk);
                signActionOperation = await breakGlassInstance.methods.signAction(nextActionID).send();
                await signActionOperation.confirmation();

                // Final values
                breakGlassStorage       = await breakGlassInstance.storage();
                action                  = await breakGlassStorage.actionsLedger.get(nextActionID);

                assert.equal(action.executed, true);
                assert.equal(action.signersCount.toNumber(), signerThreshold.toNumber());
                assert.equal(action.status, "EXECUTED");

                const newCouncilStorage = breakGlassStorage.councilMembers.has(removedCouncilMember)
                assert.equal(newCouncilStorage, false);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('removeCouncilMember            --> should fail if the config signers threshold is changed midway to be greater than the total number of council members', async () => {
            try{
                // Initial Values
                breakGlassStorage       = await breakGlassInstance.storage();
                const memberAddress     = councilMemberFour;
                const nextActionID      = breakGlassStorage.actionCounter;

                // Operation
                const newActionOperation = await breakGlassInstance.methods.councilActionRemoveMember(memberAddress).send();
                await newActionOperation.confirmation();

                // Final values
                breakGlassStorage                   = await breakGlassInstance.storage();
                var action                          = await breakGlassStorage.actionsLedger.get(nextActionID);
                var actionSigner                    = action.signers.includes(councilMember)
                var dataMap                         = await action.dataMap;
                const packedCouncilMemberAddress    = (await utils.tezos.rpc.packData({ data: { string: memberAddress }, type: { prim: 'address' } })).packed

                const councilMembersSize            = councilStorage.councilMembers.size;   // 4 
                const oldThreshold                  = councilStorage.config.threshold;      // 3
                const newThreshold                  = councilMembersSize;                   // 4

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "removeCouncilMember");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("councilMemberAddress"), packedCouncilMemberAddress);

                // Update config
                await helperFunctions.signerFactory(tezos, adminSk)
                var updateConfigOperation = await breakGlassInstance.methods.updateConfig(newThreshold, "configThreshold").send();
                await updateConfigOperation.confirmation();

                // Sign action Operation
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk);
                var signOperation = await breakGlassInstance.methods.signAction(nextActionID).send();
                await signOperation.confirmation();
                
                await helperFunctions.signerFactory(tezos, councilMemberThreeSk);
                signOperation = await breakGlassInstance.methods.signAction(nextActionID).send();
                await signOperation.confirmation();

                await helperFunctions.signerFactory(tezos, councilMemberFourSk);
                await chai.expect(breakGlassInstance.methods.signAction(nextActionID).send()).to.be.rejected;

                // Reset config
                await helperFunctions.signerFactory(tezos, adminSk)
                updateConfigOperation = await breakGlassInstance.methods.updateConfig(oldThreshold, "configThreshold").send();
                await updateConfigOperation.confirmation();

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('changeCouncilMember            --> should be able to replace a council member (alice) with another user (isaac)', async () => {
            try{

                // Initial Values
                breakGlassStorage       = await breakGlassInstance.storage();
                var nextActionId        = breakGlassStorage.actionCounter;
                
                const oldMemberAddress  = councilMemberThree;
                const newMemberAddress  = isaac.pkh;
                const newMemberName     = "Isaac";
                const newMemberImage    = "Isaac Image";
                const newMemberWebsite  = "Isaac Website";

                // Operation
                const newActionOperation = await breakGlassInstance.methods.councilActionChangeMember(oldMemberAddress, newMemberAddress, newMemberName, newMemberWebsite, newMemberImage).send();
                await newActionOperation.confirmation();

                // Final values
                breakGlassStorage                       = await breakGlassInstance.storage();
                var action                              = await breakGlassStorage.actionsLedger.get(nextActionId);
                var actionSigner                        = action.signers.includes(councilMember)
                var dataMap                             = await action.dataMap;
                const packedOldCouncilMemberAddress     = (await utils.tezos.rpc.packData({ data: { string: oldMemberAddress }, type: { prim: 'address' } })).packed
                const packedNewCouncilMemberAddress     = (await utils.tezos.rpc.packData({ data: { string: newMemberAddress }, type: { prim: 'address' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "changeCouncilMember");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("oldCouncilMemberAddress"), packedOldCouncilMemberAddress);
                assert.equal(dataMap.get("newCouncilMemberAddress"), packedNewCouncilMemberAddress);

                // set signer as council member two
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await breakGlassInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // set signer as council member three
                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await breakGlassInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // Final values
                breakGlassStorage   = await breakGlassInstance.storage();
                var action          = await breakGlassStorage.actionsLedger.get(nextActionId);
                var actionSigner    = action.signers.includes(councilMember)
                dataMap             = await action.dataMap;

                const memberRemoved = breakGlassStorage.councilMembers.has(oldMemberAddress);
                const memberAdded   = breakGlassStorage.councilMembers.has(newMemberAddress);

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "changeCouncilMember");
                assert.equal(action.executed, true);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 3);
                assert.equal(dataMap.get("oldCouncilMemberAddress"), packedOldCouncilMemberAddress);
                assert.equal(dataMap.get("newCouncilMemberAddress"), packedNewCouncilMemberAddress);
                assert.equal(memberRemoved, false);
                assert.equal(memberAdded, true);

                // Reset change - set alice back as council member
                breakGlassStorage   = await breakGlassInstance.storage();
                nextActionId        = breakGlassStorage.actionCounter;

                // Operation
                await helperFunctions.signerFactory(tezos, councilMemberOneSk)
                councilActionOperation = await breakGlassInstance.methods.councilActionChangeMember(newMemberAddress, oldMemberAddress, "Alice", "Alice Website", "Alice Image").send();
                await councilActionOperation.confirmation();

                // set signer as council member two
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await breakGlassInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // set signer as signer
                await helperFunctions.signerFactory(tezos, isaac.sk)
                signActionOperation = await breakGlassInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();
            
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('changeCouncilMember            --> should fail if the old member address (trudy) is removed from the council midway', async () => {
            try{

                // Initial Values
                breakGlassStorage       = await breakGlassInstance.storage();
                const actionId          = breakGlassStorage.actionCounter;
                
                const oldMemberAddress  = councilMemberTwo;
                const newMemberAddress  = isaac.pkh;
                const newMemberName     = "Isaac";
                const newMemberImage    = "Isaac Image";
                const newMemberWebsite  = "Isaac Website";

                // change council member (trudy) with user (isaac) operation
                councilActionOperation = await breakGlassInstance.methods.councilActionChangeMember(oldMemberAddress, newMemberAddress, newMemberName, newMemberWebsite, newMemberImage).send();
                await councilActionOperation.confirmation();

                // Final values
                breakGlassStorage                       = await breakGlassInstance.storage();
                var action                              = await breakGlassStorage.actionsLedger.get(actionId);
                var actionSigner                        = action.signers.includes(councilMember)
                var dataMap                             = await action.dataMap;
                const packedOldCouncilMemberAddress     = (await utils.tezos.rpc.packData({ data: { string: oldMemberAddress }, type: { prim: 'address' } })).packed
                const packedNewCouncilMemberAddress     = (await utils.tezos.rpc.packData({ data: { string: newMemberAddress }, type: { prim: 'address' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "changeCouncilMember");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("oldCouncilMemberAddress"), packedOldCouncilMemberAddress);
                assert.equal(dataMap.get("newCouncilMemberAddress"), packedNewCouncilMemberAddress);

                // remove trudy as a council member
                breakGlassStorage          = await breakGlassInstance.storage();
                const nextActionId      = breakGlassStorage.actionCounter;

                await helperFunctions.signerFactory(tezos, councilMemberOneSk)
                councilActionOperation = await breakGlassInstance.methods.councilActionRemoveMember(councilMemberTwo).send();
                await councilActionOperation.confirmation();

                // set signer as council member three
                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await breakGlassInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // set signer as council member four
                await helperFunctions.signerFactory(tezos, councilMemberFourSk)
                signActionOperation = await breakGlassInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // trudy removed as council member
                // ------ 

                // sign previous action to change council members should now fail

                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await breakGlassInstance.methods.signAction(actionId).send();
                await signActionOperation.confirmation();

                await helperFunctions.signerFactory(tezos, councilMemberFourSk)
                signActionOperation = await breakGlassInstance.methods.signAction(actionId);
                await chai.expect(signActionOperation.send()).to.be.rejected;

                // reset test - add trudy back as a council member

                breakGlassStorage           = await breakGlassInstance.storage();
                const resetActionId      = breakGlassStorage.actionCounter;
                const memberName         = "Trudy";
                const memberImage        = "Trudy Image";
                const memberWebsite      = "Trudy Website";

                await helperFunctions.signerFactory(tezos, councilMemberOneSk)
                councilActionOperation = await breakGlassInstance.methods.councilActionAddMember(councilMemberTwo, memberName, memberImage, memberWebsite).send();
                await councilActionOperation.confirmation();

                // set signer as council member three
                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await breakGlassInstance.methods.signAction(resetActionId).send();
                await signActionOperation.confirmation();

                // set signer as council member four
                await helperFunctions.signerFactory(tezos, councilMemberFourSk)
                signActionOperation = await breakGlassInstance.methods.signAction(resetActionId).send();
                await signActionOperation.confirmation();

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('changeCouncilMember            --> should fail if the new member address (david) is added to the council midway', async () => {
            try{

                // Initial Values
                breakGlassStorage          = await breakGlassInstance.storage();
                const oldMemberAddress  = councilMemberTwo;
                const newMemberAddress  = david.pkh;
                const newMemberName     = "David";
                const newMemberImage    = "David Image";
                const newMemberWebsite  = "David Website";
                const actionId          = breakGlassStorage.actionCounter;

                // change council member (trudy) with user (david) operation
                councilActionOperation = await breakGlassInstance.methods.councilActionChangeMember(oldMemberAddress, newMemberAddress, newMemberName, newMemberWebsite, newMemberImage).send();
                await councilActionOperation.confirmation();

                // Final values
                breakGlassStorage                       = await breakGlassInstance.storage();
                var action                              = await breakGlassStorage.actionsLedger.get(actionId);
                var actionSigner                        = action.signers.includes(councilMember)
                var dataMap                             = await action.dataMap;
                const packedOldCouncilMemberAddress     = (await utils.tezos.rpc.packData({ data: { string: oldMemberAddress }, type: { prim: 'address' } })).packed
                const packedNewCouncilMemberAddress     = (await utils.tezos.rpc.packData({ data: { string: newMemberAddress }, type: { prim: 'address' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "changeCouncilMember");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("oldCouncilMemberAddress"), packedOldCouncilMemberAddress);
                assert.equal(dataMap.get("newCouncilMemberAddress"), packedNewCouncilMemberAddress);

                // add david as a council member
                breakGlassStorage          = await breakGlassInstance.storage();
                const nextActionId      = breakGlassStorage.actionCounter;

                await helperFunctions.signerFactory(tezos, councilMemberOneSk)
                councilActionOperation = await breakGlassInstance.methods.councilActionAddMember(newMemberAddress, newMemberName, newMemberImage, newMemberWebsite).send();
                await councilActionOperation.confirmation();

                // set signer as council member three
                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await breakGlassInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // set signer as council member four
                await helperFunctions.signerFactory(tezos, councilMemberFourSk)
                signActionOperation = await breakGlassInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // david added as council member
                // ------ 

                // sign previous action to change council members should now fail

                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await breakGlassInstance.methods.signAction(actionId).send();
                await signActionOperation.confirmation();

                await helperFunctions.signerFactory(tezos, councilMemberFourSk)
                signActionOperation = await breakGlassInstance.methods.signAction(actionId);
                await chai.expect(signActionOperation.send()).to.be.rejected;

                // reset test - remove david from the council

                breakGlassStorage          = await breakGlassInstance.storage();
                const resetActionId     = breakGlassStorage.actionCounter;

                await helperFunctions.signerFactory(tezos, councilMemberOneSk)
                councilActionOperation = await breakGlassInstance.methods.councilActionRemoveMember(newMemberAddress).send();
                await councilActionOperation.confirmation();

                // set signer as council member three
                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await breakGlassInstance.methods.signAction(resetActionId).send();
                await signActionOperation.confirmation();

                // set signer as council member four
                await helperFunctions.signerFactory(tezos, councilMemberFourSk)
                signActionOperation = await breakGlassInstance.methods.signAction(resetActionId).send();
                await signActionOperation.confirmation();

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('pauseAllEntrypoints            --> should pause all entrypoints in all contracts referenced in the Governance contract General Contracts map', async () => {
            try{
                // Initial Values
                breakGlassStorage       = await breakGlassInstance.storage();
                const nextActionID      = breakGlassStorage.actionCounter;

                // Operation
                const newActionOperation = await breakGlassInstance.methods.pauseAllEntrypoints().send();
                await newActionOperation.confirmation();

                // Final values
                breakGlassStorage   = await breakGlassInstance.storage();
                var action          = await breakGlassStorage.actionsLedger.get(nextActionID);
                const actionSigner  = action.signers.includes(councilMember)

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "pauseAllEntrypoints");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(breakGlassStorage.glassBroken, true);

                // Sign Action Operation
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk);
                signActionOperation = await breakGlassInstance.methods.signAction(nextActionID).send();
                await signActionOperation.confirmation();

                await helperFunctions.signerFactory(tezos, councilMemberThreeSk);
                signActionOperation = await breakGlassInstance.methods.signAction(nextActionID).send();
                await signActionOperation.confirmation();

                // Final values
                breakGlassStorage               = await breakGlassInstance.storage();
                governanceStorage               = await governanceInstance.storage();
                action                          = await breakGlassStorage.actionsLedger.get(nextActionID);
                const generalContracts          = governanceStorage.generalContracts.entries();

                assert.equal(action.executed, true);
                assert.equal(action.status, "EXECUTED");

                // Check the entrypoints are paused
                for (let entry of generalContracts){
                    
                    // Get contract storage and check entrypoints are paused
                    var contract         = await utils.tezos.contract.at(entry[1]);
                    var storage:any      = await contract.storage();

                    var breakGlassConfig = storage.breakGlassConfig;
                    if(storage.hasOwnProperty('breakGlassConfig')){

                        for (let [key, value] of Object.entries(breakGlassConfig)){
                            // for contracts with only one entrypoint to be paused, an "empty" variable is used in the record
                            if(key !== "empty"){
                                assert.equal(value, true);
                            }
                        }

                    }
                }

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('unpauseAllEntrypoints          --> should unpause all entrypoints in all contracts referenced in the generalContracts map in the breakGlass storage', async () => {
            try{
                
                // Initial Values
                breakGlassStorage       = await breakGlassInstance.storage();
                const nextActionID      = breakGlassStorage.actionCounter;

                // Operation
                const newActionOperation = await breakGlassInstance.methods.unpauseAllEntrypoints().send();
                await newActionOperation.confirmation();

                // Final values
                breakGlassStorage   = await breakGlassInstance.storage();
                var action          = await breakGlassStorage.actionsLedger.get(nextActionID);
                const actionSigner  = action.signers.includes(councilMember)

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "unpauseAllEntrypoints");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(breakGlassStorage.glassBroken, true);

                // Sign Action Operation
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk);
                signActionOperation = await breakGlassInstance.methods.signAction(nextActionID).send();
                await signActionOperation.confirmation();

                await helperFunctions.signerFactory(tezos, councilMemberThreeSk);
                signActionOperation = await breakGlassInstance.methods.signAction(nextActionID).send();
                await signActionOperation.confirmation();

                // Final values
                breakGlassStorage       = await breakGlassInstance.storage();
                governanceStorage       = await governanceInstance.storage();
                action                  = await breakGlassStorage.actionsLedger.get(nextActionID);
                const generalContracts  = governanceStorage.generalContracts.entries();

                assert.equal(action.executed, true);
                assert.equal(action.status, "EXECUTED");

                // Check the entrypoints are unpaused
                for (let entry of generalContracts){
                    
                    // Get contract storage and check that entrypoints are unpaused
                    var contract        = await utils.tezos.contract.at(entry[1]);
                    var storage:any     = await contract.storage();
                    
                    var breakGlassConfig    = storage.breakGlassConfig

                    if(storage.hasOwnProperty('breakGlassConfig')){
                        for (let [key, value] of Object.entries(breakGlassConfig)){

                            // for contracts with only one entrypoint to be paused, an "empty" variable is used in the record
                            if(key !== "empty"){
                                assert.equal(value, false);
                            }
                        }
                    }
                }
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('setSingleContractAdmin         --> should update the admin of a target contract', async () => {
            try{
                // Initial Values
                breakGlassStorage       = await breakGlassInstance.storage();
                const nextActionID      = breakGlassStorage.actionCounter;
                const newAdmin          = admin;
                const targetContract    = contractDeployments.doorman.address;

                // Operation
                const newActionOperation = await breakGlassInstance.methods.setSingleContractAdmin(targetContract, newAdmin).send();
                await newActionOperation.confirmation();

                // Final values
                breakGlassStorage                   = await breakGlassInstance.storage();
                var action                          = await breakGlassStorage.actionsLedger.get(nextActionID);
                const actionSigner                  = action.signers.includes(councilMember)
                const dataMap                       = await action.dataMap;
                const packedAdmin                   = (await utils.tezos.rpc.packData({ data: { string: newAdmin }, type: { prim: 'address' } })).packed
                const packedContract                = (await utils.tezos.rpc.packData({ data: { string: targetContract }, type: { prim: 'address' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "setSingleContractAdmin");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("newAdminAddress"), packedAdmin);
                assert.equal(dataMap.get("targetContractAddress"), packedContract);
                assert.equal(breakGlassStorage.glassBroken, true);

                // Sign Action Operation
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk);
                signActionOperation = await breakGlassInstance.methods.signAction(nextActionID).send();
                await signActionOperation.confirmation();

                await helperFunctions.signerFactory(tezos, councilMemberThreeSk);
                signActionOperation = await breakGlassInstance.methods.signAction(nextActionID).send();
                await signActionOperation.confirmation();

                // Final values
                breakGlassStorage       = await breakGlassInstance.storage();
                action                  = await breakGlassStorage.actionsLedger.get(nextActionID);

                assert.equal(action.executed, true);
                assert.equal(action.status, "EXECUTED");

                var contract        = await utils.tezos.contract.at(targetContract);
                var storage:any     = await contract.storage();
                if(storage.hasOwnProperty('admin')){
                    assert.equal(storage.admin, newAdmin);
                }

                // Reset contract admin
                await helperFunctions.signerFactory(tezos, adminSk);
                const resetOperation    = await doormanInstance.methods.setAdmin(contractDeployments.breakGlass.address).send();
                await resetOperation.confirmation();

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('setAllContractsAdmin           --> should update the admin in all contracts referenced in the Governance General Contracts map', async () => {
            try{
                // Initial Values
                breakGlassStorage       = await breakGlassInstance.storage();
                const nextActionID      = breakGlassStorage.actionCounter;
                const newAdmin          = admin;

                // Operation
                const newActionOperation = await breakGlassInstance.methods.setAllContractsAdmin(newAdmin).send();
                await newActionOperation.confirmation();

                // Final values
                breakGlassStorage       = await breakGlassInstance.storage();
                var action              = await breakGlassStorage.actionsLedger.get(nextActionID);
                const actionSigner      = action.signers.includes(councilMember)
                const dataMap           = await action.dataMap;
                const packedAdmin       = (await utils.tezos.rpc.packData({ data: { string: newAdmin }, type: { prim: 'address' } })).packed
                const signerThreshold   = breakGlassStorage.config.threshold;

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "setAllContractsAdmin");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("newAdminAddress"), packedAdmin);
                assert.equal(breakGlassStorage.glassBroken, true);

                // Sign Action Operation
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk);
                signActionOperation = await breakGlassInstance.methods.signAction(nextActionID).send();
                await signActionOperation.confirmation();

                await helperFunctions.signerFactory(tezos, councilMemberThreeSk);
                signActionOperation = await breakGlassInstance.methods.signAction(nextActionID).send();
                await signActionOperation.confirmation();

                // Final values
                breakGlassStorage       = await breakGlassInstance.storage();
                governanceStorage       = await governanceInstance.storage();
                action                  = await breakGlassStorage.actionsLedger.get(nextActionID);
                var generalContracts    = governanceStorage.generalContracts.entries();

                assert.equal(action.executed, true);
                assert.equal(action.signersCount.toNumber(), signerThreshold.toNumber());
                assert.equal(action.status, "EXECUTED");
                assert.equal(breakGlassStorage.admin, newAdmin);

                // Check the contracts admin
                for (let entry of generalContracts){
                    // Get contract storage
                    var contract        = await utils.tezos.contract.at(entry[1]);
                    var storage:any     = await contract.storage();

                    // Check admin
                    if(storage.hasOwnProperty('admin')){
                        assert.equal(storage.admin, newAdmin)
                    }
                }

                // check admin for governance contract
                if(governanceStorage.hasOwnProperty('admin')){
                    assert.equal(governanceStorage.admin, newAdmin)
                }

                // reset all contracts admin to breakGlass for future tests
                // await helperFunctions.signerFactory(tezos, adminSk)
                // governanceStorage       = await governanceInstance.storage();
                // generalContracts        = await governanceStorage.generalContracts.entries();
                // var setAdminOperation   = await breakGlassInstance.methods.setAdmin(contractDeployments.breakGlass.address).send();
                // await setAdminOperation.confirmation();

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        
        it('flushAction                    --> should flush a pending action', async () => {
            try{
                // Initial Values
                breakGlassStorage       = await breakGlassInstance.storage();
                const nextActionID      = breakGlassStorage.actionCounter;

                // Sample Action

                const newCouncilMember  = ivan.pkh;
                const newMemberName     = "Member Name";
                const newMemberImage    = "Member Image";
                const newMemberWebsite  = "Member Website";

                const newActionOperation = await breakGlassInstance.methods.councilActionAddMember(newCouncilMember, newMemberName, newMemberWebsite, newMemberImage).send();
                await newActionOperation.confirmation();

                // Flush Action
                breakGlassStorage       = await breakGlassInstance.storage();
                const flushActionID     = breakGlassStorage.actionCounter;
                
                const flushActionOperation = await breakGlassInstance.methods.flushAction(nextActionID).send();
                await flushActionOperation.confirmation();

                // Sign Flush Action Operation
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk);
                signActionOperation = await breakGlassInstance.methods.signAction(flushActionID).send();
                await signActionOperation.confirmation();

                await helperFunctions.signerFactory(tezos, councilMemberThreeSk);
                signActionOperation = await breakGlassInstance.methods.signAction(flushActionID).send();
                await signActionOperation.confirmation();

                // Final values
                breakGlassStorage       = await breakGlassInstance.storage();
                const originalAction    = await breakGlassStorage.actionsLedger.get(nextActionID);
                const flushAction       = await breakGlassStorage.actionsLedger.get(flushActionID);

                assert.equal(originalAction.executed, false);
                assert.equal(originalAction.status, "FLUSHED");

                assert.equal(flushAction.executed, true);
                assert.equal(flushAction.status, "EXECUTED");

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('signAction                     --> should fail if the action was executed', async () => {
            try{
                
                // Initial Values
                breakGlassStorage       = await breakGlassInstance.storage();
                const nextActionID      = breakGlassStorage.actionCounter;

                // Sample Action
                const newCouncilMember  = ivan.pkh;
                const newMemberName     = "Member Name";
                const newMemberImage    = "Member Image";
                const newMemberWebsite  = "Member Website";

                const newActionOperation = await breakGlassInstance.methods.councilActionAddMember(newCouncilMember, newMemberName, newMemberWebsite, newMemberImage).send();
                await newActionOperation.confirmation();

                // Flush Action
                breakGlassStorage       = await breakGlassInstance.storage();
                const flushActionID     = breakGlassStorage.actionCounter;

                const flushActionOperation = await breakGlassInstance.methods.flushAction(nextActionID).send();
                await flushActionOperation.confirmation();

                // Sign Sample Action Operation
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk);
                signActionOperation = await breakGlassInstance.methods.signAction(nextActionID).send();
                await signActionOperation.confirmation();

                await helperFunctions.signerFactory(tezos, councilMemberThreeSk);
                signActionOperation = await breakGlassInstance.methods.signAction(nextActionID).send();
                await signActionOperation.confirmation();

                // update storage
                breakGlassStorage       = await breakGlassInstance.storage();
                const originalAction    = await breakGlassStorage.actionsLedger.get(nextActionID);

                // check that original action is executed
                assert.equal(originalAction.executed, true);
                assert.equal(originalAction.status, "EXECUTED");

                // Sign Flush Action Operation
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk);
                signActionOperation = await breakGlassInstance.methods.signAction(flushActionID).send();
                await signActionOperation.confirmation();

                // Flush action should fail as sample action has already been executed
                await helperFunctions.signerFactory(tezos, councilMemberThreeSk);
                await chai.expect(breakGlassInstance.methods.signAction(flushActionID).send()).to.be.rejected;
                
                // Reset test
                breakGlassStorage       = await breakGlassInstance.storage();
                const resetActionID     = breakGlassStorage.actionCounter;

                await helperFunctions.signerFactory(tezos, councilMemberOneSk);
                const resetActionOperation = await breakGlassInstance.methods.councilActionRemoveMember(newCouncilMember).send();
                await resetActionOperation.confirmation();

                // Sign Reset Action Operation
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk);
                signActionOperation = await breakGlassInstance.methods.signAction(resetActionID).send();
                await signActionOperation.confirmation();

                await helperFunctions.signerFactory(tezos, councilMemberThreeSk);
                signActionOperation = await breakGlassInstance.methods.signAction(resetActionID).send();
                await signActionOperation.confirmation();

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('signAction                     --> should fail if the action was flushed', async () => {
            try{
                
                // Initial Values
                breakGlassStorage       = await breakGlassInstance.storage();
                const nextActionID      = breakGlassStorage.actionCounter;

                // Sample Action
                const newCouncilMember  = ivan.pkh;
                const newMemberName     = "Member Name";
                const newMemberImage    = "Member Image";
                const newMemberWebsite  = "Member Website";

                const newActionOperation = await breakGlassInstance.methods.councilActionAddMember(newCouncilMember, newMemberName, newMemberWebsite, newMemberImage).send();
                await newActionOperation.confirmation();

                // First Flush Action
                breakGlassStorage       = await breakGlassInstance.storage();
                const flushActionID     = breakGlassStorage.actionCounter;
                const flushActionOperation = await breakGlassInstance.methods.flushAction(nextActionID).send();
                await flushActionOperation.confirmation();

                // Second Flush Action
                breakGlassStorage           = await breakGlassInstance.storage();
                const secondFlushActionID   = breakGlassStorage.actionCounter;
                const secondFlushActionOperation = await breakGlassInstance.methods.flushAction(nextActionID).send();
                await secondFlushActionOperation.confirmation();

                // Sign Flush Action Operation
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk);
                signActionOperation = await breakGlassInstance.methods.signAction(flushActionID).send();
                await signActionOperation.confirmation();

                // Flush action should fail as sample action has already been executed
                await helperFunctions.signerFactory(tezos, councilMemberThreeSk);
                signActionOperation = await breakGlassInstance.methods.signAction(flushActionID).send();
                await signActionOperation.confirmation();

                // update storage
                breakGlassStorage       = await breakGlassInstance.storage();
                const originalAction    = await breakGlassStorage.actionsLedger.get(nextActionID);

                // check that original action is flushed
                assert.equal(originalAction.executed, false);
                assert.equal(originalAction.status, "FLUSHED");
                
                // Sign second flush Action Operation
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk);
                signActionOperation = await breakGlassInstance.methods.signAction(secondFlushActionID).send();
                await signActionOperation.confirmation();

                // Second Flush action should fail as sample action has already been flushed
                await helperFunctions.signerFactory(tezos, councilMemberThreeSk);
                await chai.expect(breakGlassInstance.methods.signAction(secondFlushActionID).send()).to.be.rejected;


            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('signAction                     --> should not be able to sign an action more than once', async () => {
            try{
                // Initial Values
                breakGlassStorage       = await breakGlassInstance.storage();
                const newCouncilMember  = oscar.pkh;
                const newMemberName     = "Member Name";
                const newMemberImage    = "Member Image";
                const newMemberWebsite  = "Member Website";
                const nextActionID      = breakGlassStorage.actionCounter;

                // Operation - note: council member automatically signs for the action
                const newActionOperation = await breakGlassInstance.methods.councilActionAddMember(newCouncilMember, newMemberName, newMemberWebsite, newMemberImage).send();
                await newActionOperation.confirmation();

                // Operation - fail to sign action again
                await chai.expect(breakGlassInstance.methods.signAction(nextActionID).send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('signAction                     --> should not be able to sign an expired action', async () => {
            try{

                // set signer to admin and set action expiry days to zero
                await helperFunctions.signerFactory(tezos, adminSk)
                var updateConfigOperation = await breakGlassInstance.methods.updateConfig(0, "configActionExpiryDays").send();
                await updateConfigOperation.confirmation();

                // Initial Values
                breakGlassStorage       = await breakGlassInstance.storage();
                var nextActionID        = breakGlassStorage.actionCounter;
                const newCouncilMember  = ivan.pkh;
                const newMemberName     = "Member Name";
                const newMemberImage    = "Member Image";
                const newMemberWebsite  = "Member Website";

                // Operation
                await helperFunctions.signerFactory(tezos, councilMemberOneSk);
                const newActionOperation = await breakGlassInstance.methods.councilActionAddMember(newCouncilMember, newMemberName, newMemberWebsite, newMemberImage).send();
                await newActionOperation.confirmation();

                // Assertions
                breakGlassStorage       = await breakGlassInstance.storage();
                var action              = await breakGlassStorage.actionsLedger.get(nextActionID);
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "addCouncilMember");
                assert.equal(action.executed, false);
                assert.equal(action.signersCount, 1);

                // Update contract config
                var nextActionID        = breakGlassStorage.actionCounter;
                breakGlassStorage       = await breakGlassInstance.storage();

                // Fail to sign action as action has expired
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk);
                signActionOperation   = await breakGlassInstance.methods.signAction(nextActionID);
                await chai.expect(signActionOperation.send()).to.be.rejected;

                // Reset action expiry days
                await helperFunctions.signerFactory(tezos, adminSk)
                var updateConfigOperation = await breakGlassInstance.methods.updateConfig(1, "configActionExpiryDays").send();
                await updateConfigOperation.confirmation();

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('signAction                     --> should fail if action doesn’t exist', async () => {
            try{

                // Initial Values
                breakGlassStorage       = await breakGlassInstance.storage();
                const nextActionID      = 999;
                var action              = await breakGlassStorage.actionsLedger.get(nextActionID);

                // Assertions
                assert.strictEqual(action, undefined);

                // Operation
                await helperFunctions.signerFactory(tezos, eve.sk);
                await chai.expect(breakGlassInstance.methods.signAction(nextActionID).send()).to.be.rejected;
                
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('removeBreakGlassControl        --> should set glassBroken to false and unpause all entrypoints in all contracts in the Governance Contract generalContracts map', async () => {
            try{
                
                // Bob (whitelisted developer) has to reset the admin of the governance contract back to the break glass contract
                await helperFunctions.signerFactory(tezos, adminSk)
                const resetGovernanceAdminOperation = await governanceInstance.methods.setAdmin(contractDeployments.breakGlass.address).send();
                await resetGovernanceAdminOperation.confirmation();

                // Initial Values
                breakGlassStorage       = await breakGlassInstance.storage();
                governanceStorage       = await governanceInstance.storage();
                var nextActionID        = breakGlassStorage.actionCounter;

                var generalContracts  = governanceStorage.generalContracts.entries();
                await helperFunctions.signerFactory(tezos, adminSk)
                for (let entry of generalContracts){
                    // Get contract storage
                    var contract        = await utils.tezos.contract.at(entry[1]);
                    var storage:any     = await contract.storage();

                    // Set admin
                    if(storage.hasOwnProperty('admin') && storage.admin!==contractDeployments.breakGlass.address && entry[1]!==contractDeployments.breakGlass.address){
                        var setAdminOperation   = await contract.methods.setAdmin(contractDeployments.breakGlass.address).send();
                        await setAdminOperation.confirmation();              
                    }
                }

                // Operation
                nextActionID        = breakGlassStorage.actionCounter;
                await helperFunctions.signerFactory(tezos, councilMemberOneSk)
                const newActionOperation = await breakGlassInstance.methods.removeBreakGlassControl().send();
                await newActionOperation.confirmation();

                // Final values
                breakGlassStorage   = await breakGlassInstance.storage();
                var action          = await breakGlassStorage.actionsLedger.get(nextActionID);
                const actionSigner  = action.signers.includes(councilMember)
                const signerThreshold   = breakGlassStorage.config.threshold;

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "removeBreakGlassControl");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(breakGlassStorage.glassBroken, true);

                // Sign Action Operation
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk);
                signActionOperation = await breakGlassInstance.methods.signAction(nextActionID).send();
                await signActionOperation.confirmation();

                await helperFunctions.signerFactory(tezos, councilMemberThreeSk);
                signActionOperation = await breakGlassInstance.methods.signAction(nextActionID).send();
                await signActionOperation.confirmation();

                // Final values
                breakGlassStorage       = await breakGlassInstance.storage();
                governanceStorage       = await governanceInstance.storage();
                action                  = await breakGlassStorage.actionsLedger.get(nextActionID);
                generalContracts        = governanceStorage.generalContracts.entries();

                assert.equal(action.executed, true);
                assert.equal(action.signersCount.toNumber(), signerThreshold.toNumber());
                assert.equal(action.status, "EXECUTED");
                assert.equal(breakGlassStorage.glassBroken, false);

                // Check the contracts admin
                for (let entry of generalContracts){
                    
                    // Get contract storage
                    var contract        = await utils.tezos.contract.at(entry[1]);
                    var storage:any     = await contract.storage();
                    
                    if(storage.hasOwnProperty('admin')){
                        
                        // console.log(`contract: ${entry} | admin: ${storage.admin}`);

                        // if admin is the governance proxy contract
                        // - prevents duplicates (e.g. farmTreasury, aggregatorTreasury)
                        if(storage.admin == governanceProxyAddress){

                            // Check admin is equal to governance proxy contract now
                            // assert.equal(storage.admin, governanceProxyAddress)

                            // Set Admin Lambda
                            const setAdminLambdaFunction = await createLambdaBytes(
                                tezos.rpc.url,             // network
                                governanceProxyAddress,    // governance proxy address
                                
                                'setAdmin',                // entrypoint name
                                [
                                    contract.address,      // contract address
                                    admin                  // bob
                                ]
                            );
                            
                            await helperFunctions.signerFactory(tezos, adminSk);
                            setAdminOperation     = await governanceProxyInstance.methods.executeGovernanceAction(setAdminLambdaFunction).send();
                            await setAdminOperation.confirmation();

                            var storage : any   = await contract.storage();
                            
                        }
                    }
                }

                // check admin for governance contract
                if(governanceStorage.hasOwnProperty('admin')){
                    assert.equal(governanceStorage.admin, governanceProxyAddress);

                    // Set Admin Lambda
                    const setAdminLambdaFunction = await createLambdaBytes(
                        tezos.rpc.url,             // network
                        governanceProxyAddress,    // governance proxy address
                        
                        'setAdmin',                // entrypoint name
                        [
                            contractDeployments.governance.address,      // contract address
                            admin                  // bob
                        ]
                    );
                    
                    setAdminOperation     = await governanceProxyInstance.methods.executeGovernanceAction(setAdminLambdaFunction).send();
                    await setAdminOperation.confirmation();

                    governanceStorage = await governanceInstance.storage();
                    
                    console.log(`contract: governance | updated admin: ${governanceStorage.admin}`);
                }

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

    
    })


    describe("Housekeeping Entrypoints", async () => {

        beforeEach("Set signer to admin (bob)", async () => {
            breakGlassStorage = await breakGlassInstance.storage();
            await helperFunctions.signerFactory(tezos, adminSk);
        });

        it('%setAdmin                 - admin (bob) should be able to update the contract admin address', async () => {
            try{
                
                // Initial Values
                breakGlassStorage   = await breakGlassInstance.storage();
                const currentAdmin  = breakGlassStorage.admin;
                assert.strictEqual(currentAdmin, admin);

                // Operation
                setAdminOperation = await breakGlassInstance.methods.setAdmin(alice.pkh).send();
                await setAdminOperation.confirmation();

                // Final values
                breakGlassStorage   = await breakGlassInstance.storage();
                const newAdmin      = breakGlassStorage.admin;

                // Assertions
                assert.notStrictEqual(newAdmin, currentAdmin);
                assert.strictEqual(newAdmin, alice.pkh);
                
                // reset admin
                await helperFunctions.signerFactory(tezos, alice.sk);
                resetAdminOperation = await breakGlassInstance.methods.setAdmin(admin).send();
                await resetAdminOperation.confirmation();

            } catch(e){
                console.log(e);
            }
        });

        it('%setGovernance            - admin (bob) should be able to update the contract governance address', async () => {
            try{
                
                // Initial Values
                breakGlassStorage       = await breakGlassInstance.storage();
                const currentGovernance = breakGlassStorage.governanceAddress;

                // Operation
                setGovernanceOperation = await breakGlassInstance.methods.setGovernance(alice.pkh).send();
                await setGovernanceOperation.confirmation();

                // Final values
                breakGlassStorage       = await breakGlassInstance.storage();
                const updatedGovernance = breakGlassStorage.governanceAddress;

                // reset governance
                setGovernanceOperation = await breakGlassInstance.methods.setGovernance(contractDeployments.governance.address).send();
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
                const hash  = Buffer.from('tezos-storage:data', 'ascii').toString('hex')

                // Operation
                const updateOperation = await breakGlassInstance.methods.updateMetadata(key, hash).send();
                await updateOperation.confirmation();

                // Final values
                breakGlassStorage = await breakGlassInstance.storage();            

                const updatedData = await breakGlassStorage.metadata.get(key);
                assert.equal(hash, updatedData);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('%updateConfig             - admin (bob) should be able to update contract config', async () => {
            try{
                
                // Initial Values
                breakGlassStorage   = await breakGlassInstance.storage();
                const initialConfig = breakGlassStorage.config;

                const lowTestValue  = 1;

                // update config operations
                var updateConfigOperation = await breakGlassInstance.methods.updateConfig(lowTestValue, "configThreshold").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await breakGlassInstance.methods.updateConfig(lowTestValue, "configActionExpiryDays").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await breakGlassInstance.methods.updateConfig(lowTestValue, "configCouncilNameMaxLength").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await breakGlassInstance.methods.updateConfig(lowTestValue, "configCouncilWebsiteMaxLength").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await breakGlassInstance.methods.updateConfig(lowTestValue, "configCouncilImageMaxLength").send();
                await updateConfigOperation.confirmation();


                // update storage
                councilStorage           = await breakGlassInstance.storage();
                const updatedConfig      = councilStorage.config;

                // Assertions
                assert.equal(updatedConfig.threshold                    , lowTestValue);
                assert.equal(updatedConfig.actionExpiryDays             , lowTestValue);
                assert.equal(updatedConfig.councilMemberNameMaxLength   , lowTestValue);
                assert.equal(updatedConfig.councilMemberWebsiteMaxLength  , lowTestValue);
                assert.equal(updatedConfig.councilMemberImageMaxLength    , lowTestValue);

                // reset config operation
                var resetConfigOperation = await breakGlassInstance.methods.updateConfig(initialConfig.threshold, "configThreshold").send();
                await resetConfigOperation.confirmation();

                resetConfigOperation = await breakGlassInstance.methods.updateConfig(initialConfig.actionExpiryDays, "configActionExpiryDays").send();
                await resetConfigOperation.confirmation();
                
                resetConfigOperation = await breakGlassInstance.methods.updateConfig(initialConfig.councilMemberNameMaxLength, "configCouncilNameMaxLength").send();
                await resetConfigOperation.confirmation();

                resetConfigOperation = await breakGlassInstance.methods.updateConfig(initialConfig.councilMemberWebsiteMaxLength, "configCouncilWebsiteMaxLength").send();
                await resetConfigOperation.confirmation();

                resetConfigOperation = await breakGlassInstance.methods.updateConfig(initialConfig.councilMemberImageMaxLength, "configCouncilImageMaxLength").send();
                await resetConfigOperation.confirmation();

                // update storage
                breakGlassStorage  = await breakGlassInstance.storage();
                const resetConfig           = breakGlassStorage.config;

                assert.equal(resetConfig.threshold.toNumber(),                      initialConfig.threshold.toNumber());
                assert.equal(resetConfig.actionExpiryDays.toNumber(),               initialConfig.actionExpiryDays.toNumber());
                assert.equal(resetConfig.councilMemberNameMaxLength.toNumber(),     initialConfig.councilMemberNameMaxLength.toNumber());
                assert.equal(resetConfig.councilMemberWebsiteMaxLength.toNumber(),  initialConfig.councilMemberWebsiteMaxLength.toNumber());
                assert.equal(resetConfig.councilMemberImageMaxLength.toNumber(),    initialConfig.councilMemberImageMaxLength.toNumber());

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%updateConfig             - admin (bob) should not be able to set threshold to be greater than size of council members', async () => {
            try{
                
                // Initial Values
                breakGlassStorage               = await breakGlassInstance.storage();
                const currentCouncilMembersSize = breakGlassStorage.councilMembers.size;
                const newThreshold              = currentCouncilMembersSize + 1;

                // update config operations
                var updateConfigOperation = await breakGlassInstance.methods.updateConfig(newThreshold, "configThreshold");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%updateWhitelistContracts - admin (bob) should be able to add user (eve) to the Whitelisted Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "whitelistContracts";

                initialContractMapValue           = await helperFunctions.getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await helperFunctions.updateWhitelistContracts(doormanInstance, contractMapKey, eve.pkh, 'update');
                await updateWhitelistContractsOperation.confirmation()

                doormanStorage = await doormanInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'Eve (key) should not be in the Whitelist Contracts map before adding her to it')
                assert.strictEqual(updatedContractMapValue, eve.pkh,  'Eve (key) should be in the Whitelist Contracts map after adding her to it')

            } catch (e) {
                console.log(e)
            }
        })

        it('%updateWhitelistContracts - admin (bob) should be able to remove user (eve) from the Whitelisted Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "whitelistContracts";

                initialContractMapValue = await helperFunctions.getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await helperFunctions.updateWhitelistContracts(doormanInstance, contractMapKey, eve.pkh, 'remove');
                await updateWhitelistContractsOperation.confirmation()

                doormanStorage = await doormanInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, eve.pkh, 'Eve (key) should be in the Whitelist Contracts map before adding her to it');
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

                initialContractMapValue = await helperFunctions.getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await helperFunctions.updateGeneralContracts(doormanInstance, contractMapKey, eve.pkh, 'update');
                await updateGeneralContractsOperation.confirmation()

                doormanStorage = await doormanInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(doormanStorage, storageMap, contractMapKey);

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

                initialContractMapValue = await helperFunctions.getStorageMapValue(doormanStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await helperFunctions.updateGeneralContracts(doormanInstance, contractMapKey, eve.pkh, 'remove');
                await updateGeneralContractsOperation.confirmation()

                doormanStorage = await doormanInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(doormanStorage, storageMap, contractMapKey);

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

                // Mistaken Operation - user (mallory) send 10 MavrykFa2Tokens to MVK Token Contract
                await helperFunctions.signerFactory(tezos, userSk);
                transferOperation = await helperFunctions.fa2Transfer(mavrykFa2TokenInstance, user, doormanAddress, tokenId, tokenAmount);
                await transferOperation.confirmation();
                
                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage();
                const initialUserBalance    = (await mavrykFa2TokenStorage.ledger.get(user)).toNumber()

                await helperFunctions.signerFactory(tezos, adminSk);
                mistakenTransferOperation = await helperFunctions.mistakenTransferFa2Token(doormanInstance, user, mavrykFa2TokenAddress, tokenId, tokenAmount).send();
                await mistakenTransferOperation.confirmation();

                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage();
                const updatedUserBalance    = (await mavrykFa2TokenStorage.ledger.get(user)).toNumber();

                // increase in updated balance
                assert.equal(updatedUserBalance, initialUserBalance + tokenAmount);

            } catch (e) {
                console.log(e)
            }
        })

    });



    describe('Access Control Checks', function () {

        beforeEach("Set signer to non-admin (mallory)", async () => {
            
            breakGlassStorage = await breakGlassInstance.storage();
            await helperFunctions.signerFactory(tezos, mallory.sk);
        });

        it('%setAdmin                       - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                breakGlassStorage  = await breakGlassInstance.storage();
                const currentAdmin = breakGlassStorage.admin;

                // fail: set admin operation
                setAdminOperation = await breakGlassInstance.methods.setAdmin(mallory.pkh);
                await chai.expect(setAdminOperation.send()).to.be.rejected;

                // Final values
                breakGlassStorage  = await breakGlassInstance.storage();
                const newAdmin     = breakGlassStorage.admin;

                // Assertions
                assert.strictEqual(newAdmin, currentAdmin);

            } catch(e){
                console.log(e);
            }
        });

        it('%setGovernance                  - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                breakGlassStorage  = await breakGlassInstance.storage();
                const currentGovernance     = breakGlassStorage.governanceAddress;

                // fail: set governance operation
                setGovernanceOperation = await breakGlassInstance.methods.setGovernance(mallory.pkh);
                await chai.expect(setGovernanceOperation.send()).to.be.rejected;

                // Final values
                breakGlassStorage  = await breakGlassInstance.storage();
                const updatedGovernance     = breakGlassStorage.governanceAddress;

                // Assertions
                assert.strictEqual(updatedGovernance, currentGovernance);

            } catch(e){
                console.log(e);
            }
        });

        it('%updateMetadata                 - non-admin (mallory) should not be able to update the contract metadata', async () => {
            try{
                // Initial values
                const key   = ''
                const hash  = Buffer.from('tezos-storage:data fail', 'ascii').toString('hex')

                breakGlassStorage  = await breakGlassInstance.storage();   
                const initialMetadata       = await breakGlassStorage.metadata.get(key);

                // fail: update metadata operation
                const updateOperation = await breakGlassInstance.methods.updateMetadata(key, hash);
                await chai.expect(updateOperation.send()).to.be.rejected;

                // Final values
                breakGlassStorage  = await breakGlassInstance.storage();            
                const updatedData           = await breakGlassStorage.metadata.get(key);

                // check that there is no change in metadata
                assert.equal(updatedData, initialMetadata);
                assert.notEqual(updatedData, hash);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('%updateConfig                   - non-admin (mallory) should not be able to update contract config', async () => {
            try{
                
                // Initial Values
                breakGlassStorage   = await breakGlassInstance.storage();
                const initialConfig = breakGlassStorage.config;

                const lowTestValue  = 1;

                // fail: update config operations
                var updateConfigOperation = await breakGlassInstance.methods.updateConfig(lowTestValue, "configThreshold");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = await breakGlassInstance.methods.updateConfig(lowTestValue, "configActionExpiryDays");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = await breakGlassInstance.methods.updateConfig(lowTestValue, "configCouncilNameMaxLength");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = await breakGlassInstance.methods.updateConfig(lowTestValue, "configCouncilWebsiteMaxLength");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = await breakGlassInstance.methods.updateConfig(lowTestValue, "configCouncilImageMaxLength");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                // updated storage
                breakGlassStorage    = await breakGlassInstance.storage();
                const updatedConfig  = breakGlassStorage.config;

                // check that there is no change to config
                assert.equal(updatedConfig.threshold.toNumber(),                        initialConfig.threshold.toNumber());
                assert.equal(updatedConfig.actionExpiryDays.toNumber(),                 initialConfig.actionExpiryDays.toNumber());
                assert.equal(updatedConfig.councilMemberNameMaxLength.toNumber(),       initialConfig.councilMemberNameMaxLength.toNumber());
                assert.equal(updatedConfig.councilMemberWebsiteMaxLength.toNumber(),    initialConfig.councilMemberWebsiteMaxLength.toNumber());
                assert.equal(updatedConfig.councilMemberImageMaxLength.toNumber(),      initialConfig.councilMemberImageMaxLength.toNumber());

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%updateWhitelistContracts       - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // init values
                contractMapKey  = "governance";
                storageMap      = "whitelistContracts";

                initialContractMapValue = await helperFunctions.getStorageMapValue(breakGlassStorage, storageMap, contractMapKey);

                // fail: update whitelist contracts operation
                updateWhitelistContractsOperation = await breakGlassInstance.methods.updateWhitelistContracts(contractMapKey, alice.pkh, "update")
                await chai.expect(updateWhitelistContractsOperation.send()).to.be.rejected;

                updateWhitelistContractsOperation = await breakGlassInstance.methods.updateWhitelistContracts(contractMapKey, alice.pkh, "remove")
                await chai.expect(updateWhitelistContractsOperation.send()).to.be.rejected;

                breakGlassStorage  = await breakGlassInstance.storage()
                updatedContractMapValue     = await helperFunctions.getStorageMapValue(breakGlassStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'mallory (key) should not be in the Whitelist Contracts map');

            } catch (e) {
                console.log(e)
            }
        })

        it('%updateGeneralContracts         - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // init values
                contractMapKey  = "governance";
                storageMap      = "generalContracts";

                initialContractMapValue = await helperFunctions.getStorageMapValue(breakGlassStorage, storageMap, contractMapKey);

                // fail: update general contracts operation
                updateGeneralContractsOperation = await breakGlassInstance.methods.updateGeneralContracts(contractMapKey, alice.pkh, "update")
                await chai.expect(updateGeneralContractsOperation.send()).to.be.rejected;

                updateGeneralContractsOperation = await breakGlassInstance.methods.updateGeneralContracts(contractMapKey, alice.pkh, "remove")
                await chai.expect(updateGeneralContractsOperation.send()).to.be.rejected;

                breakGlassStorage  = await breakGlassInstance.storage()
                updatedContractMapValue     = await helperFunctions.getStorageMapValue(breakGlassStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'mallory (key) should not be in the General Contracts map');

            } catch (e) {
                console.log(e)
            }
        })

        it('%mistakenTransfer               - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // Initial values
                user = mallory.pkh;
                const tokenAmount = 10;

                // Mistaken Operation - send 10 MavrykFa2Tokens to MVK Token Contract
                transferOperation = await helperFunctions.fa2Transfer(mavrykFa2TokenInstance, user, doormanAddress, tokenId, tokenAmount);
                await transferOperation.confirmation();

                // fail: mistaken transfer operation
                mistakenTransferOperation = await helperFunctions.mistakenTransferFa2Token(breakGlassInstance, user, mavrykFa2TokenAddress, tokenId, tokenAmount);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch (e) {
                console.log(e)
            }
        })

        it('%updateCouncilMemberInfo        - non-council member (mallory) should not be able to access this entrypoint', async () => {
            try{
                
                // Initial Values
                councilStorage = await councilInstance.storage();
                const newMemberName     = "Mallory";
                const newMemberImage    = "Mallory Image";
                const newMemberWebsite  = "Mallory Website";

                // Operation
                councilActionOperation = councilInstance.methods.updateCouncilMemberInfo(newMemberName, newMemberWebsite, newMemberImage)
                await chai.expect(councilActionOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('%councilActionAddMember         - non-council member (mallory) should not be able to access this entrypoint and create a new council action', async () => {
            try{
            
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const newMember         = isaac.pkh;
                const newMemberName     = "Isaac";
                const newMemberImage    = "Isaac Image";
                const newMemberWebsite  = "Isaac Website";

                // Operation
                councilActionOperation = councilInstance.methods.councilActionAddMember(newMember, newMemberName, newMemberWebsite, newMemberImage)
                await chai.expect(councilActionOperation.send()).to.be.rejected;
                
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%councilActionRemoveMember      - non-council member (mallory) should not be able to access this entrypoint and create a new council action', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const memberAddress     = councilMemberOne;

                // Operation
                councilActionOperation = councilInstance.methods.councilActionRemoveMember(memberAddress);
                await chai.expect(councilActionOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%councilActionChangeMember      - non-council member (mallory) should not be able to access this entrypoint and create a new council action', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const oldMember         = councilMemberOne;
                const newMember         = mallory.pkh;
                const newMemberName     = "Mallory";
                const newMemberImage    = "Mallory Image";
                const newMemberWebsite  = "Mallory Website";

                // Operation
                councilActionOperation = councilInstance.methods.councilActionChangeMember(oldMember, newMember, newMemberName, newMemberWebsite, newMemberImage)
                await chai.expect(councilActionOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it("%setLambda                      - non-admin (mallory) should not be able to call this entrypoint", async() => {
            try{

                // random lambda for testing
                const randomLambdaName  = "randomLambdaName";
                const randomLambdaBytes = "050200000cba0743096500000112075e09650000005a036e036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a0362036203620362036200000000036203620760036803690000000009650000000a0362036203620362036e00000000075e09650000006c09650000000a0362036203620362036200000000036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a036203620362036203620000000003620362076003680369000000000362075e07650765036203620362036c075e076507650368036e0362036e036200000000070702000001770743075e076507650368036e0362036e020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c03200342020000010e037a034c037a07430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700002034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f02000000090743036200810303270200000000072f020000000907430362009c0203270200000000070702000000600743036200808080809d8fc0d0bff2f1b26703420200000047037a034c037a0321052900080570000205290015034b031105710002031605700002033a0322072f020000001307430368010000000844495620627920300327020000000003160707020000001a037a037a03190332072c0200000002032002000000020327034f0707020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c032000808080809d8fc0d0bff2f1b2670342020000092d037a057a000505700005037a034c07430362008f03052100020529000f0529000307430359030a034c03190325072c0200000002032702000000020320053d036d05700002072e02000008a4072e020000007c057000030570000405700005057000060570000705200005072e020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000081c072e0200000044057000030570000405700005057000060570000705200005072e0200000010072e02000000020320020000000203200200000010072e020000000203200200000002032002000007cc072e0200000028057000030570000405700005057000060570000705200005072e02000000020320020000000203200200000798072e0200000774034c032003480521000305210003034c052900050316034c03190328072c020000000002000000090743036200880303270570000205210002034c0321052100030521000205290011034c0329072f020000002005290015074303620000074303620000074303620000074303620000054200050200000004034c03200743036200000521000203160319032a072c020000021c052100020521000407430362008e02057000020529000907430368010000000a64656c65676174696f6e034203420521000b034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f0200000009074303620081030327020000001a072f02000000060743035903030200000008032007430359030a074303620000034c072c020000007303200521000205210004034205210007034c0326052100030521000205290008034205700007034c03260521000205290005034c05290007034b0311052100030316033a0521000b034c0322072f02000000130743036801000000084449562062792030032702000000000316034c0316031202000000060570000603200521000305210003034205210008034c0326052100030521000205700004052900030312055000030571000205210003052100030570000405290005031205500005057100020521000305700002052100030570000403160312031205500001034c05210003034c0570000305290013034b031105500013034c02000000060570000503200521000205290015055000080521000205700002052900110570000205700003034c0346034c0350055000110571000205210003052900070743036200000790010000000c746f74616c5f737570706c790362072f020000000907430362008a01032702000000000521000405290007074303620000037703420790010000000b6765745f62616c616e63650362072f02000000090743036200890103270200000000034c052100090743036200a40105210004033a033a0322072f0200000013074303680100000008444956206279203003270200000000031605210009074303620002033a0312052100090521000a07430362008803033a033a0322072f020000001307430368010000000844495620627920300327020000000003160743036200a401034c0322072f0200000013074303680100000008444956206279203003270200000000031605210004033a05210009052100020322072f0200000013074303680100000008444956206279203003270200000000031605210005034b0311052100060570000a052100040322072f0200000013074303680100000008444956206279203003270200000000031605700007052900130312055000130571000507430362008c0305210004052100070342034205210009034c0326032005700005057000030342052100050570000305700002037a034c0570000305700002034b0311074303620000052100020319032a072c020000003b05210002034c057000030322072f02000000130743036801000000084449562062792030032702000000000316057000020529001503120550001502000000080570000205200002057100030521000405210003034c05290011034c0329072f0200000009074303620089030327020000000003210521000507430362008b03057000020316057000020342034205700007034c03260320032105700004057000020316034b031105500001052100040529000707430362000005700003034205210004037705700002037a057000040655055f0765046e000000062566726f6d5f065f096500000026046e0000000425746f5f04620000000925746f6b656e5f696404620000000725616d6f756e7400000000000000042574787300000009257472616e73666572072f0200000008074303620027032702000000000743036a0000053d0765036e055f096500000006036e0362036200000000053d096500000006036e036203620000000005700004057000050570000705420003031b057000040342031b034d0743036200000521000303160319032a072c02000000440521000405210003034205700005034c032605210003052100020570000403160312055000010571000205210005034c0570000505290013034b031105500013057100030200000006057000040320034c052100040529001505500008034c0521000405700004052900110570000305210005034c0346034c03500550001105710002052100030570000207430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700004034c03260655036e0000000e256f6e5374616b654368616e6765072f02000000090743036200b702032702000000000743036a000005700002034d053d036d034c031b034c031b02000000180570000305700004057000050570000605700007052000060200000036057000030570000405700005057000060570000705200005072e0200000010072e0200000002032002000000020320020000000203200342";

                // fail: set lambda operation
                const setLambdaOperation = breakGlassInstance.methods.setLambda(randomLambdaName, randomLambdaBytes); 
                await chai.expect(setLambdaOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

    })

});
