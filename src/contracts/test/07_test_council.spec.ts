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

import { bob, alice, eve, mallory, oscar, trudy, susie, isaac, david, baker } from "../scripts/sandbox/accounts";
import * as helperFunctions from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Notes
// ------------------------------------------------------------------------------

// Council Members set in deployment
//   - alice, eve, susie, trudy

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("Test: Council Contract", async () => {
    
    var utils: Utils;
    let tezos

    let admin 
    let adminSk 

    // basic inputs for updating operators
    let doormanAddress
    let councilAddress
    let tokenId = 0
    let tokenAmount
    
    let user
    let userSk 
    
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

    let vesteeAddress

    let initialCouncilMemberInfo
    let updatedCouncilMemberInfo

    // instances
    let doormanInstance;
    let delegationInstance;
    let mvkTokenInstance;
    let governanceFinancialInstance;
    let vestingInstance;
    let councilInstance;
    let mavrykFa12TokenInstance;
    let mavrykFa2TokenInstance;
    let treasuryInstance;
    let governanceInstance;

    // storages
    let doormanStorage;
    let delegationStorage;
    let mvkTokenStorage;
    let governanceFinancialStorage;
    let vestingStorage;
    let councilStorage;
    let mavrykFa12TokenStorage;
    let mavrykFa2TokenStorage;
    let treasuryStorage;
    let governanceStorage;

    // operations
    let transferOperation
    let councilActionOperation
    let signActionOperation

    // housekeeping operations
    let setAdminOperation
    let resetAdminOperation
    let setGovernanceOperation
    let updateConfigOperation
    let updateWhitelistContractsOperation
    let updateGeneralContractsOperation
    
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

        councilMemberTwo        = trudy.pkh;
        councilMemberTwoSk      = trudy.sk;

        councilMemberThree      = alice.pkh;
        councilMemberThreeSk    = alice.sk;

        councilMemberFour       = susie.pkh;
        councilMemberFourSk     = susie.sk;

        councilAddress          = contractDeployments.council.address;

        vestingInstance                 = await utils.tezos.contract.at(contractDeployments.vesting.address);
        doormanInstance                 = await utils.tezos.contract.at(contractDeployments.doorman.address);
        delegationInstance              = await utils.tezos.contract.at(contractDeployments.delegation.address);
        mvkTokenInstance                = await utils.tezos.contract.at(contractDeployments.mvkToken.address);
        governanceFinancialInstance     = await utils.tezos.contract.at(contractDeployments.governanceFinancial.address);
        councilInstance                 = await utils.tezos.contract.at(contractDeployments.council.address);
        mavrykFa12TokenInstance         = await utils.tezos.contract.at(contractDeployments.mavrykFa12Token.address);
        mavrykFa2TokenInstance          = await utils.tezos.contract.at(contractDeployments.mavrykFa2Token.address);
        treasuryInstance                = await utils.tezos.contract.at(contractDeployments.treasury.address);
        governanceInstance              = await utils.tezos.contract.at(contractDeployments.governance.address);
            
        vestingStorage                  = await vestingInstance.storage();
        doormanStorage                  = await doormanInstance.storage();
        delegationStorage               = await delegationInstance.storage();
        mvkTokenStorage                 = await mvkTokenInstance.storage();
        governanceFinancialStorage      = await governanceFinancialInstance.storage();
        councilStorage                  = await councilInstance.storage();
        mavrykFa12TokenStorage          = await mavrykFa12TokenInstance.storage();
        mavrykFa2TokenStorage           = await mavrykFa2TokenInstance.storage();
        treasuryStorage                 = await treasuryInstance.storage();
        governanceStorage               = await governanceInstance.storage();

        console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')

        // Operation
        const startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
        await startNextRoundOperation.confirmation();

    });


    describe("create council actions for vesting", async () => {

        beforeEach("Set signer to council member (eve)", async () => {
            
            councilMember   = councilMemberOne;
            vestingStorage  = await vestingInstance.storage();
            
            await helperFunctions.signerFactory(tezos, councilMemberOneSk)
        });

        it('%councilActionAddVestee        - council member (eve) should be able to create a new council action to add a new vestee (isaac)', async () => {
            try{
                
                // initial values
                vesteeAddress   = isaac.pkh;
                
                // initial storage
                councilStorage          = await councilInstance.storage();
                const cliffInMonths     = 0;
                const vestingInMonths   = 24;
                const totalAllocated    = MVK(20000000);
                const nextActionId      = councilStorage.actionCounter;

                // Operation
                councilActionOperation = await councilInstance.methods.councilActionAddVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                const action                        = await councilStorage.councilActionsLedger.get(nextActionId);
                const actionSigner                  = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
                const dataMap                       = await action.dataMap;
                const packedVesteeAddress           = (await utils.tezos.rpc.packData({ data: { string: vesteeAddress }, type: { prim: 'address' } })).packed
                const packedTotalAllocatedAmount    = (await utils.tezos.rpc.packData({ data: { int: totalAllocated.toString() }, type: { prim: 'nat' } })).packed
                const packedCliffInMonths           = (await utils.tezos.rpc.packData({ data: { int: cliffInMonths.toString() }, type: { prim: 'nat' } })).packed
                const packedVestingInMonths         = (await utils.tezos.rpc.packData({ data: { int: vestingInMonths.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator     , councilMember);
                assert.strictEqual(action.actionType    , "addVestee");
                assert.strictEqual(action.status        , "PENDING");
                
                assert.notStrictEqual(actionSigner      , undefined);
                assert.equal(action.executed            , false);
                assert.equal(action.signersCount        , 1);

                assert.equal(dataMap.get("vesteeAddress")           , packedVesteeAddress);
                assert.equal(dataMap.get("totalAllocatedAmount")    , packedTotalAllocatedAmount);
                assert.equal(dataMap.get("cliffInMonths")           , packedCliffInMonths);
                assert.equal(dataMap.get("vestingInMonths")         , packedVestingInMonths);

                // Set signer as council members and approve vestee for following tests
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it(`%councilActionAddVestee        - council member (eve) should not be able to call this entrypoint if the vestee (isaac) already exists`, async () => {
            try{

                // Initial Values
                councilStorage          = await councilInstance.storage();
                const cliffInMonths     = 0;
                const vestingInMonths   = 24;
                vesteeAddress           = isaac.pkh;
                const totalAllocated    = MVK(20000000);

                // Operation       
                councilActionOperation = await councilInstance.methods.councilActionAddVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths);         
                await chai.expect(councilActionOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%councilActionUpdateVestee     - council member (eve) should be able to create a new council action to update a vestee (isaac)', async () => {
            try{

                // initial values
                vesteeAddress   = isaac.pkh;

                // initial storage
                councilStorage          = await councilInstance.storage();
                const cliffInMonths     = 0;
                const vestingInMonths   = 12;
                const totalAllocated    = MVK(40000000);
                const nextActionId      = councilStorage.actionCounter;

                // Operation
                councilActionOperation = await councilInstance.methods.councilActionUpdateVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                const action                        = await councilStorage.councilActionsLedger.get(nextActionId);
                const actionSigner                  = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
                const dataMap                       = await action.dataMap;
                const packedVesteeAddress           = (await utils.tezos.rpc.packData({ data: { string: vesteeAddress }, type: { prim: 'address' } })).packed
                const packedTotalAllocatedAmount    = (await utils.tezos.rpc.packData({ data: { int: totalAllocated.toString() }, type: { prim: 'nat' } })).packed
                const packedCliffInMonths           = (await utils.tezos.rpc.packData({ data: { int: cliffInMonths.toString() }, type: { prim: 'nat' } })).packed
                const packedVestingInMonths         = (await utils.tezos.rpc.packData({ data: { int: vestingInMonths.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator     , councilMember);
                assert.strictEqual(action.actionType    , "updateVestee");
                assert.strictEqual(action.status        , "PENDING");
                
                assert.notStrictEqual(actionSigner      , undefined);
                assert.equal(action.executed            , false);
                assert.equal(action.signersCount        , 1);

                assert.equal(dataMap.get("vesteeAddress")               , packedVesteeAddress);
                assert.equal(dataMap.get("newTotalAllocatedAmount")     , packedTotalAllocatedAmount);
                assert.equal(dataMap.get("newCliffInMonths")            , packedCliffInMonths);
                assert.equal(dataMap.get("newVestingInMonths")          , packedVestingInMonths);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it(`%councilActionUpdateVestee     - council member (eve) should not be able to call this entrypoint if the vestee does not exist`, async () => {
            try{
                
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const cliffInMonths     = 0;
                const vestingInMonths   = 24;
                const vesteeAddress     = david.pkh;
                const totalAllocated    = MVK(20000000);

                // Operation                
                councilActionOperation = await councilInstance.methods.councilActionUpdateVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths);
                await chai.expect(councilActionOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%councilActionToggleVesteeLock - council member (eve) should be able to create a new council action to lock or unlock a vestee (isaac)', async () => {
            try{
                
                // initial values
                vesteeAddress   = isaac.pkh;

                // initial storage
                councilStorage          = await councilInstance.storage();
                const nextActionId      = councilStorage.actionCounter;

                // Operation
                councilActionOperation = await councilInstance.methods.councilActionToggleVesteeLock(vesteeAddress).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                const action                        = await councilStorage.councilActionsLedger.get(nextActionId);
                const actionSigner                  = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember});
                const dataMap                       = await action.dataMap;
                const packedVesteeAddress           = (await utils.tezos.rpc.packData({ data: { string: vesteeAddress }, type: { prim: 'address' } })).packed

                // Assertions
                assert.strictEqual(action.initiator     , councilMember);
                assert.strictEqual(action.status        , "PENDING");
                assert.strictEqual(action.actionType    , "toggleVesteeLock");
                
                assert.equal(action.executed            , false);
                assert.notStrictEqual(actionSigner      , undefined);
                assert.equal(action.signersCount        , 1);
                
                assert.equal(dataMap.get("vesteeAddress"), packedVesteeAddress);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it(`%councilActionToggleVesteeLock - council member (eve) should not be able to call this entrypoint if the vestee does not exist`, async () => {
            try{
                
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const vesteeAddress     = alice.pkh;

                // Operation                
                councilActionOperation = await councilInstance.methods.councilActionToggleVesteeLock(vesteeAddress);
                await chai.expect(councilActionOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('%councilActionRemoveVestee     - council member (eve) should be able to create a new council action to remove a vestee (isaac)', async () => {
            try{
                
                // initial values
                vesteeAddress   = isaac.pkh;

                // initial storage
                councilStorage          = await councilInstance.storage();
                const nextActionId      = councilStorage.actionCounter;

                // Operation
                councilActionOperation = await councilInstance.methods.councilActionRemoveVestee(vesteeAddress).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage              = await councilInstance.storage();
                const action                = await councilStorage.councilActionsLedger.get(nextActionId);
                const actionSigner          = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMemberOne})
                const dataMap               = await action.dataMap;
                const packedVesteeAddress   = (await utils.tezos.rpc.packData({ data: { string: vesteeAddress }, type: { prim: 'address' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, councilMemberOne);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "removeVestee");
                assert.equal(action.executed, false);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("vesteeAddress"), packedVesteeAddress);

                // Set signers to other council members and remove vestee for following tests
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%councilActionRemoveVestee     - council member (eve) should not be able to remove a non-existent vestee', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const vesteeAddress     = david.pkh;

                // Operation
                councilActionOperation = await councilInstance.methods.councilActionRemoveVestee(vesteeAddress);
                await chai.expect(councilActionOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

    })



    describe("create council actions for internal control", async () => {

        beforeEach("Set signer to council member (eve)", async () => {
            councilMember   = councilMemberOne;
            await helperFunctions.signerFactory(tezos, councilMemberOneSk)
        });

        it('%updateCouncilMemberInfo       - council member (eve) should be able to update her information', async () => {
            try{
                
                // initial storage
                councilStorage            = await councilInstance.storage();
                initialCouncilMemberInfo  = await councilStorage.councilMembers.get(councilMember);
                
                const oldMemberName     = initialCouncilMemberInfo.name
                const oldMemberImage    = initialCouncilMemberInfo.image
                const oldMemberWebsite  = initialCouncilMemberInfo.website
                
                const randomNumber      = await helperFunctions.randomNumberFromInterval(1, 10);
                const newMemberName     = "Eve " + randomNumber;
                const newMemberImage    = "Eve Image " + randomNumber;
                const newMemberWebsite  = "Eve Website " + randomNumber;

                // Operation
                councilActionOperation = await councilInstance.methods.updateCouncilMemberInfo(newMemberName, newMemberWebsite, newMemberImage).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage             = await councilInstance.storage();
                updatedCouncilMemberInfo   = await councilStorage.councilMembers.get(councilMember);

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

        it('%councilActionAddMember        - council member (eve) should be able to create a new action to add a council member (isaac)', async () => {
            try{

                // Initial Values
                councilStorage          = await councilInstance.storage();
                const newMember         = isaac.pkh;
                const newMemberName     = "Isaac";
                const newMemberImage    = "Isaac Image";
                const newMemberWebsite  = "Isaac Website";
                const nextActionId      = councilStorage.actionCounter;

                // Operation
                councilActionOperation = await councilInstance.methods.councilActionAddMember(newMember, newMemberName, newMemberWebsite, newMemberImage).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                const action                        = await councilStorage.councilActionsLedger.get(nextActionId);
                const actionSigner                  = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
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
                assert.notStrictEqual(actionSigner      , undefined);
                assert.equal(action.signersCount        , 1);

                assert.equal(dataMap.get("councilMemberAddress")    , packedCouncilMemberAddress);
                assert.equal(dataMap.get("councilMemberName")       , packedCouncilMemberName);
                assert.equal(dataMap.get("councilMemberWebsite")    , packedCouncilMemberWebsite);
                assert.equal(dataMap.get("councilMemberImage")      , packedCouncilMemberImage);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it(`%councilActionAddMember        - council member (eve) should not be able to add an existing council member (alice)`, async () => {
            try{
                
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const newMember         = alice.pkh;
                const newMemberName     = "Alice";
                const newMemberImage    = "Alice Image";
                const newMemberWebsite  = "Alice Website";

                // Operation                
                councilActionOperation = await councilInstance.methods.councilActionAddMember(newMember, newMemberName, newMemberWebsite, newMemberImage);
                await chai.expect(councilActionOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%councilActionRemoveMember     - council member (eve) should be able to create a new action to remove a council member (alice)', async () => {
            try{

                councilStorage          = await councilInstance.storage();
                const memberToBeRemoved = councilMemberThree;
                const nextActionId      = councilStorage.actionCounter;

                // Operation
                councilActionOperation = await councilInstance.methods.councilActionRemoveMember(memberToBeRemoved).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                const action                        = await councilStorage.councilActionsLedger.get(nextActionId);
                const actionSigner                  = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
                const dataMap                       = await action.dataMap;
                const packedCouncilMemberAddress    = (await utils.tezos.rpc.packData({ data: { string: memberToBeRemoved }, type: { prim: 'address' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "removeCouncilMember");
                assert.equal(action.executed, false);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("councilMemberAddress"), packedCouncilMemberAddress);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it(`%councilActionRemoveMember     - council member (eve) should not be able to remove a council member if this results in the signers threshold not being met`, async () => {
            try{

                // Note: Config signer's threshold is the number of required approvals from council members before an action gets executed
                //  - if it is higher than the total number of council members, than an action will never be able to be executed
                
                councilStorage  = await councilInstance.storage();
                const oldThreshold      = councilStorage.config.threshold;
                const newThreshold      = councilStorage.councilSize;
                
                // set signer as admin and update config
                await helperFunctions.signerFactory(tezos, adminSk);
                updateConfigOperation   = await councilInstance.methods.updateConfig(newThreshold, "configThreshold").send();
                await updateConfigOperation.confirmation();

                // initial storage
                councilStorage          = await councilInstance.storage();
                const memberToBeRemoved = councilMemberTwo;

                // Operation
                await helperFunctions.signerFactory(tezos, councilMemberOneSk);
                councilActionOperation = councilInstance.methods.councilActionRemoveMember(memberToBeRemoved);
                await chai.expect(councilActionOperation.send()).to.be.rejected;

                // set signer as admin and reset config
                await helperFunctions.signerFactory(tezos, adminSk);

                updateConfigOperation   = await councilInstance.methods.updateConfig(oldThreshold, "configThreshold").send();
                await updateConfigOperation.confirmation();

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%councilActionRemoveMember     - council member (eve) should not be able to access this entrypoint if the given address (isaac) is not a council member', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const memberAddress     = isaac.pkh;

                // Operation                
                councilActionOperation = councilInstance.methods.councilActionRemoveMember(memberAddress);
                await chai.expect(councilActionOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('%councilActionChangeMember     - council member (eve) should be able to create a new council action to replace a council member (alice) by another (mallory)', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                
                const oldMember         = councilMemberThree;
                const newMember         = mallory.pkh;
                
                const nextActionId      = councilStorage.actionCounter;
                const newMemberName     = "Mallory";
                const newMemberImage    = "Mallory Image";
                const newMemberWebsite  = "Mallory Website";

                // Operation
                councilActionOperation = await councilInstance.methods.councilActionChangeMember(oldMember, newMember, newMemberName, newMemberWebsite, newMemberImage).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                const action                        = await councilStorage.councilActionsLedger.get(nextActionId);
                const actionSigner                  = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
                const dataMap                       = await action.dataMap;
                const packedOldCouncilMemberAddress = (await utils.tezos.rpc.packData({ data: { string: oldMember }, type: { prim: 'address' } })).packed
                const packedNewCouncilMemberAddress = (await utils.tezos.rpc.packData({ data: { string: newMember }, type: { prim: 'address' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "changeCouncilMember");
                assert.equal(action.executed, false);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("oldCouncilMemberAddress"), packedOldCouncilMemberAddress);
                assert.equal(dataMap.get("newCouncilMemberAddress"), packedNewCouncilMemberAddress);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%councilActionChangeMember     - council member (eve) should not be able to call this entrypoint if the old member address is not a council member', async () => {
            try{

                // Initial Values
                councilStorage          = await councilInstance.storage();
                const oldMember         = mallory.pkh;
                const newMember         = isaac.pkh;
                const newMemberName     = "Isaac";
                const newMemberImage    = "Isaac Image";
                const newMemberWebsite  = "Isaac Website";

                // Operation
                councilActionOperation = councilInstance.methods.councilActionChangeMember(oldMember, newMember, newMemberName, newMemberWebsite, newMemberImage)
                await chai.expect(councilActionOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%councilActionChangeMember     - council member (eve) should not be able to call this entrypoint if the new member address is already a council member', async () => {
            try{

                // Initial Values
                councilStorage          = await councilInstance.storage();
                const oldMember         = councilMemberOne;
                const newMember         = councilMemberTwo;
                const newMemberName     = "Trudy";
                const newMemberImage    = "Trudy Image";
                const newMemberWebsite  = "Trudy Website";

                // Operation
                councilActionOperation = councilInstance.methods.councilActionChangeMember(oldMember, newMember, newMemberName, newMemberWebsite, newMemberImage)
                await chai.expect(councilActionOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%councilActionSetBaker         - council member (eve) should be able to create a new council action to set a baker for the council contract', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const bakerAddress      = baker.pkh;
                const nextActionId      = councilStorage.actionCounter;
                
                // Operation
                councilActionOperation = await councilInstance.methods.councilActionSetBaker(bakerAddress).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                const action                        = await councilStorage.councilActionsLedger.get(nextActionId);
                const actionSigner                  = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
                const dataMap                       = await action.dataMap;

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "setBaker");
                assert.equal(action.executed, false);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 1);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

    })



    describe("create council actions for financial governance", async () => {

        beforeEach("Set signer to council member (eve)", async () => {
            councilMember = councilMemberOne;
            await helperFunctions.signerFactory(tezos, councilMemberOneSk)
        });

        it('%councilActionTransfer         - council member (eve) should be able to create a council action to transfer tokens from the Council contract to a given address', async () => {
            try{

                // Initial Values
                councilStorage              = await councilInstance.storage();
                const receiverAddress       = eve.pkh;
                const tokenContractAddress  = contractDeployments.mvkToken.address;
                const tokenType             = "FA2";
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const tokenId               = 0;
                const nextActionId          = councilStorage.actionCounter;

                // Operation
                councilActionOperation = await councilInstance.methods.councilActionTransfer(
                    receiverAddress,
                    tokenContractAddress,
                    tokenAmount,
                    tokenType,
                    tokenId,
                    purpose
                ).send();

                await councilActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                const action                        = await councilStorage.councilActionsLedger.get(nextActionId);
                const actionSigner                  = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
                const dataMap                       = await action.dataMap;
                const packedReceiverAddress         = (await utils.tezos.rpc.packData({ data: { string: receiverAddress }, type: { prim: 'address' } })).packed
                const packedTokenContractAddress    = (await utils.tezos.rpc.packData({ data: { string: tokenContractAddress }, type: { prim: 'address' } })).packed
                const packedTokenType               = (await utils.tezos.rpc.packData({ data: { string: tokenType }, type: { prim: 'string' } })).packed
                const packedPurpose                 = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount             = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed
                const packedTokenId                 = (await utils.tezos.rpc.packData({ data: { int: tokenId.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "transfer");
                assert.equal(action.executed, false);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("receiverAddress"), packedReceiverAddress);
                assert.equal(dataMap.get("tokenContractAddress"), packedTokenContractAddress);
                assert.equal(dataMap.get("tokenType"), packedTokenType);
                assert.equal(dataMap.get("purpose"), packedPurpose);
                assert.equal(dataMap.get("tokenAmount"), packedTokenAmount);
                assert.equal(dataMap.get("tokenId"), packedTokenId);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%councilActionTransfer         - council member (eve) should not be able to  not be able to create a new council action for transfers if the given tokenType is not FA12, FA2 or XTZ', async () => {
            try{
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const receiverAddress       = eve.pkh;
                const tokenContractAddress  = contractDeployments.mvkToken.address;
                const tokenType             = "FA3";
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const tokenId               = 0;

                // Operation
                councilActionOperation = councilInstance.methods.councilActionTransfer(
                    receiverAddress,
                    tokenContractAddress,
                    tokenAmount,
                    tokenType,
                    tokenId,
                    purpose
                );

                await chai.expect(councilActionOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%councilActionRequestTokens    - council member (eve) should be able to create a new council action to request tokens from a given treasury', async () => {
            try{
                
                // initial storage
                councilStorage              = await councilInstance.storage();
                const fromTreasury          = contractDeployments.treasury.address;
                const receiverAddress       = councilAddress;
                const tokenContractAddress  = contractDeployments.mvkToken.address;
                const tokenName             = "MVK";
                const tokenType             = "FA2";
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const tokenId               = 0;
                const nextActionId          = councilStorage.actionCounter;

                // Operation
                councilActionOperation = await councilInstance.methods.councilActionRequestTokens(
                    fromTreasury,
                    receiverAddress,
                    tokenContractAddress,
                    tokenName,
                    tokenAmount,
                    tokenType,
                    tokenId,
                    purpose).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                const action                        = await councilStorage.councilActionsLedger.get(nextActionId);
                const actionSigner                  = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
                const dataMap                       = await action.dataMap;
                const packedTreasuryAddress         = (await utils.tezos.rpc.packData({ data: { string: fromTreasury }, type: { prim: 'address' } })).packed
                const packedReceiverAddress         = (await utils.tezos.rpc.packData({ data: { string: receiverAddress }, type: { prim: 'address' } })).packed
                const packedTokenContractAddress    = (await utils.tezos.rpc.packData({ data: { string: tokenContractAddress }, type: { prim: 'address' } })).packed
                const packedTokenName               = (await utils.tezos.rpc.packData({ data: { string: tokenName }, type: { prim: 'string' } })).packed
                const packedTokenType               = (await utils.tezos.rpc.packData({ data: { string: tokenType }, type: { prim: 'string' } })).packed
                const packedPurpose                 = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount             = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed
                const packedTokenId                 = (await utils.tezos.rpc.packData({ data: { int: tokenId.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "requestTokens");
                assert.equal(action.executed, false);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("treasuryAddress"), packedTreasuryAddress);
                assert.equal(dataMap.get("receiverAddress"), packedReceiverAddress);
                assert.equal(dataMap.get("tokenContractAddress"), packedTokenContractAddress);
                assert.equal(dataMap.get("tokenName"), packedTokenName);
                assert.equal(dataMap.get("tokenType"), packedTokenType);
                assert.equal(dataMap.get("purpose"), packedPurpose);
                assert.equal(dataMap.get("tokenAmount"), packedTokenAmount);
                assert.equal(dataMap.get("tokenId"), packedTokenId);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('%councilActionRequestTokens    - council member (eve) should not be able to create a new council action for the request of tokens if the given tokenType is not FA12, FA2 or XTZ', async () => {
            try{
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const fromTreasury          = contractDeployments.treasury.address;
                const receiverAddress       = councilAddress;
                const tokenContractAddress  = contractDeployments.mvkToken.address;
                const tokenName             = "MVK";
                const tokenType             = "FA3";
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const tokenId               = 0;

                // Operation
                councilActionOperation = councilInstance.methods.councilActionRequestTokens(
                    fromTreasury,
                    receiverAddress,
                    tokenContractAddress,
                    tokenName,
                    tokenAmount,
                    tokenType,
                    tokenId,
                    purpose
                );

                await chai.expect(councilActionOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('%councilActionRequestMint      - council member (eve) should be able to create a new action to request minting of MVK from a given treasury', async () => {
            try{
                
                // initial storage
                councilStorage              = await councilInstance.storage();
                const fromTreasury          = contractDeployments.treasury.address;
                const receiverAddress       = councilAddress;
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const nextActionId          = councilStorage.actionCounter;

                // Operation
                councilActionOperation = await councilInstance.methods.councilActionRequestMint(
                    fromTreasury,
                    receiverAddress,
                    tokenAmount,
                    purpose
                ).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                const action                        = await councilStorage.councilActionsLedger.get(nextActionId);
                const actionSigner                  = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
                const dataMap                       = await action.dataMap;
                const packedTreasuryAddress         = (await utils.tezos.rpc.packData({ data: { string: fromTreasury }, type: { prim: 'address' } })).packed
                const packedReceiverAddress         = (await utils.tezos.rpc.packData({ data: { string: receiverAddress }, type: { prim: 'address' } })).packed
                const packedPurpose                 = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount             = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "requestMint");
                assert.equal(action.executed, false);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("treasuryAddress"), packedTreasuryAddress);
                assert.equal(dataMap.get("receiverAddress"), packedReceiverAddress);
                assert.equal(dataMap.get("purpose"), packedPurpose);
                assert.equal(dataMap.get("tokenAmount"), packedTokenAmount);

                // Sign action for subsequent testing of dropping a financial request
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('%councilActionSetContractBaker - council member (eve) should be able to create a new action to set a contract baker on a target contract address', async () => {
            try{
                
                // initial storage
                councilStorage              = await councilInstance.storage();
                const targetContractAddress = contractDeployments.treasury.address;
                const contractBaker         = baker.pkh;
                const nextActionId          = councilStorage.actionCounter;

                // Operation
                councilActionOperation = await councilInstance.methods.councilActionSetContractBaker(
                    targetContractAddress,
                    contractBaker
                ).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                const action                        = await councilStorage.councilActionsLedger.get(nextActionId);
                const actionSigner                  = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
                const dataMap                       = await action.dataMap;
                const packedTargetContractAddress   = (await utils.tezos.rpc.packData({ data: { string: targetContractAddress }, type: { prim: 'address' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "setContractBaker");
                assert.equal(action.executed, false);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("targetContractAddress"), packedTargetContractAddress);

                // Sign action for subsequent testing of dropping a financial request
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('%councilActionDropFinancialReq - council member (eve) should be able to create a new council action to drop a given financial request', async () => {
            try{

                // initial storage
                councilStorage              = await councilInstance.storage();
                governanceFinancialStorage  = await governanceFinancialInstance.storage();
                const requestId             = governanceFinancialStorage.financialRequestCounter.toNumber() - 1;
                const nextActionId          = councilStorage.actionCounter;

                // Operation
                councilActionOperation = await councilInstance.methods.councilActionDropFinancialReq(requestId).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage              = await councilInstance.storage();
                const action                = await councilStorage.councilActionsLedger.get(nextActionId);
                const actionSigner          = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
                const dataMap               = await action.dataMap;
                const packedRequestId       = (await utils.tezos.rpc.packData({ data: { int: requestId.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "dropFinancialRequest");
                assert.equal(action.executed, false);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("requestId"), packedRequestId);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
        
        it('%councilActionDropFinancialReq - council member (eve) should not be able to drop a financial request does not exist', async () => {
            try{
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const requestId             = 999;

                // Operation
                councilActionOperation = councilInstance.methods.councilActionDropFinancialReq(requestId);
                await chai.expect(councilActionOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

    })

    describe("%flushAction", async () => {

        beforeEach("Set signer to council", async () => {
            councilMember = councilMemberOne;
            await helperFunctions.signerFactory(tezos, councilMemberOneSk)
        });

        it('council member (eve) should be able to create a new council action to flush a pending council action ', async () => {
            try{

                // setup new pending action
                const newMember         = isaac.pkh;
                const newMemberName     = "Isaac Name";
                const newMemberImage    = "Isaac Image";
                const newMemberWebsite  = "Isaac Website";
                const actionId          = councilStorage.actionCounter;

                // Operation
                councilActionOperation = await councilInstance.methods.councilActionAddMember(newMember, newMemberName, newMemberWebsite, newMemberImage).send();
                await councilActionOperation.confirmation();

                // Initial Values
                councilStorage              = await councilInstance.storage();
                const nextActionId          = councilStorage.actionCounter;

                // Operation
                councilActionOperation = await councilInstance.methods.flushAction(actionId).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage          = await councilInstance.storage();
                const action            = await councilStorage.councilActionsLedger.get(nextActionId);
                const actionSigner      = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
                const dataMap           = await action.dataMap;
                const packedRequestId   = (await utils.tezos.rpc.packData({ data: { int: actionId.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "flushAction");
                assert.equal(action.executed, false);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("actionId"), packedRequestId);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('council member (eve) should not be able to flush a council action that does not exist', async () => {
            try{
                
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const actionId              = 999;

                // Operation
                councilActionOperation = councilInstance.methods.flushAction(actionId)
                await chai.expect(councilActionOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('council member (eve) should not be able to flush a council action after it has already been flushed', async () => {
            try{
                
                // ----- ADD MEMBER
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const newCouncilMember      = mallory.pkh;
                const actionId              = councilStorage.actionCounter;
                const newMemberName         = "Mallory";
                const newMemberImage        = "Mallory Image";
                const newMemberWebsite      = "Mallory Website";

                // Operation
                councilActionOperation = await councilInstance.methods.councilActionAddMember(newCouncilMember, newMemberName, newMemberWebsite, newMemberImage).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                var action                          = await councilStorage.councilActionsLedger.get(actionId);
                var actionSigner                    = await councilStorage.councilActionsSigners.get({0: actionId, 1: councilMember})
                var flushDataMap                    = await action.dataMap;
                const packedCouncilMemberAddress    = (await utils.tezos.rpc.packData({ data: { string: newCouncilMember }, type: { prim: 'address' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "addCouncilMember");
                assert.equal(action.executed, false);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 1);
                assert.equal(flushDataMap.get("councilMemberAddress"), packedCouncilMemberAddress);

                // ----- FLUSH ACTION
                // Initial Values
                councilStorage                  = await councilInstance.storage();
                const flushActionID             = councilStorage.actionCounter;

                // Operation
                councilActionOperation = await councilInstance.methods.flushAction(actionId).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage          = await councilInstance.storage();
                action                  = await councilStorage.councilActionsLedger.get(flushActionID);
                actionSigner            = await councilStorage.councilActionsSigners.get({0: flushActionID, 1: councilMember})
                var dataMap             = await action.dataMap;
                const packedActionId    = (await utils.tezos.rpc.packData({ data: { int: actionId.toNumber().toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "flushAction");
                assert.equal(action.executed, false);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("actionId"), packedActionId);

                // ----- SIGN DROP

                // set signer as council member two
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(flushActionID).send();
                await signActionOperation.confirmation();

                // set signer as council member three
                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(flushActionID).send();
                await signActionOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                action              = await councilStorage.councilActionsLedger.get(flushActionID);
                const flushedAction = await councilStorage.councilActionsLedger.get(actionId);

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "flushAction");
                assert.equal(action.executed, true);
                assert.equal(action.signersCount, 3);
                assert.equal(dataMap.get("actionId"), packedActionId);

                assert.strictEqual(flushedAction.initiator, councilMember);
                assert.strictEqual(flushedAction.status, "FLUSHED");
                assert.strictEqual(flushedAction.actionType, "addCouncilMember");
                assert.equal(flushedAction.executed, false);
                assert.equal(flushedAction.signersCount, 1);
                assert.equal(flushDataMap.get("councilMemberAddress"), packedCouncilMemberAddress);

                // ----- FLUSH AGAIN
                await helperFunctions.signerFactory(tezos, councilMemberOneSk);
                
                councilActionOperation = councilInstance.methods.flushAction(actionId)
                await chai.expect(councilActionOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('council member (eve) should not be able to flush an executed action', async () => {
            try{
                
                // ----- ADD MEMBER
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const newCouncilMember      = mallory.pkh;
                const memberActionID        = councilStorage.actionCounter;
                const newMemberName         = "Mallory";
                const newMemberImage        = "Mallory Image";
                const newMemberWebsite      = "Mallory Website";

                // Operation
                councilActionOperation = await councilInstance.methods.councilActionAddMember(newCouncilMember, newMemberName, newMemberWebsite, newMemberImage).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                var action                          = await councilStorage.councilActionsLedger.get(memberActionID);
                var actionSigner                    = await councilStorage.councilActionsSigners.get({0: memberActionID, 1: councilMember})
                var dataMap                         = await action.dataMap;
                const packedCouncilMemberAddress    = (await utils.tezos.rpc.packData({ data: { string: newCouncilMember }, type: { prim: 'address' } })).packed
                const councilSize                   = councilStorage.councilSize;

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "addCouncilMember");
                assert.equal(action.executed, false);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("councilMemberAddress"), packedCouncilMemberAddress);

                // ----- SIGN ACTION

                // set signer as council member two
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(memberActionID).send();
                await signActionOperation.confirmation();

                // set signer as council member three
                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(memberActionID).send();
                await signActionOperation.confirmation();

                // Final values
                councilStorage          = await councilInstance.storage();
                var action              = await councilStorage.councilActionsLedger.get(memberActionID);
                dataMap                 = await action.dataMap;
                const newCouncilSize    = councilStorage.councilSize;

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "addCouncilMember");
                assert.equal(action.executed, true);
                assert.equal(action.signersCount, 3);
                assert.equal(dataMap.get("councilMemberAddress"), packedCouncilMemberAddress);
                assert.deepEqual(newCouncilSize, councilSize.plus(1));

                // ----- FLUSH
                await helperFunctions.signerFactory(tezos, councilMemberOneSk);
                await chai.expect(councilInstance.methods.flushAction(memberActionID).send()).to.be.rejected;

                // Reset state - remove Mallory as council member

                councilStorage              = await councilInstance.storage();
                const nextActionId          = councilStorage.actionCounter;

                // Operation
                councilActionOperation = await councilInstance.methods.councilActionRemoveMember(newCouncilMember).send();
                await councilActionOperation.confirmation();

                // set signer as council member two
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // set signer as council member three
                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();


            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

    })

    describe("%signAction - test execution of given council actions", async () => {
        
        beforeEach("Set signer to council member (eve)", async () => {
            councilMember = councilMemberOne;
            vesteeAddress = isaac.pkh;
            await helperFunctions.signerFactory(tezos, councilMemberOneSk)
        });

        it('addVestee                      --> should add a new vestee (isaac)', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const cliffInMonths     = 0;
                const vestingInMonths   = 24;
                const totalAllocated    = MVK(20000000);
                const nextActionId      = councilStorage.actionCounter;

                // Operation
                councilActionOperation = await councilInstance.methods.councilActionAddVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                var action                          = await councilStorage.councilActionsLedger.get(nextActionId);
                var actionSigner                    = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
                var dataMap                         = await action.dataMap;
                const packedVesteeAddress           = (await utils.tezos.rpc.packData({ data: { string: vesteeAddress }, type: { prim: 'address' } })).packed
                const packedTotalAllocatedAmount    = (await utils.tezos.rpc.packData({ data: { int: totalAllocated.toString() }, type: { prim: 'nat' } })).packed
                const packedCliffInMonths           = (await utils.tezos.rpc.packData({ data: { int: cliffInMonths.toString() }, type: { prim: 'nat' } })).packed
                const packedVestingInMonths         = (await utils.tezos.rpc.packData({ data: { int: vestingInMonths.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "addVestee");
                assert.equal(action.executed, false);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("vesteeAddress"), packedVesteeAddress);
                assert.equal(dataMap.get("totalAllocatedAmount"), packedTotalAllocatedAmount);
                assert.equal(dataMap.get("cliffInMonths"), packedCliffInMonths);
                assert.equal(dataMap.get("vestingInMonths"), packedVestingInMonths);

                // set signer as council member two
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // set signer as council member three
                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                var action          = await councilStorage.councilActionsLedger.get(nextActionId);
                var actionSigner    = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
                dataMap             = await action.dataMap;

                vestingStorage      = await vestingInstance.storage();
                const vestee        = await vestingStorage.vesteeLedger.get(vesteeAddress);

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "addVestee");
                assert.equal(action.executed, true);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 3);
                assert.equal(dataMap.get("vesteeAddress"), packedVesteeAddress);
                assert.equal(dataMap.get("totalAllocatedAmount"), packedTotalAllocatedAmount);
                assert.equal(dataMap.get("cliffInMonths"), packedCliffInMonths);
                assert.equal(dataMap.get("vestingInMonths"), packedVestingInMonths);
                assert.notStrictEqual(vestee, undefined);
                assert.equal(vestee.totalAllocatedAmount, totalAllocated);
                assert.equal(vestee.cliffMonths, cliffInMonths);
                assert.equal(vestee.vestingMonths, vestingInMonths);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('updateVestee                   --> should update a vestee (isaac)', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const cliffInMonths     = 0;
                const vestingInMonths   = 12;
                const totalAllocated    = MVK(40000000);
                const nextActionId      = councilStorage.actionCounter;

                // Operation
                councilActionOperation = await councilInstance.methods.councilActionUpdateVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                var action                          = await councilStorage.councilActionsLedger.get(nextActionId);
                var actionSigner                    = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
                var dataMap                         = await action.dataMap;
                const packedVesteeAddress           = (await utils.tezos.rpc.packData({ data: { string: vesteeAddress }, type: { prim: 'address' } })).packed
                const packedTotalAllocatedAmount    = (await utils.tezos.rpc.packData({ data: { int: totalAllocated.toString() }, type: { prim: 'nat' } })).packed
                const packedCliffInMonths           = (await utils.tezos.rpc.packData({ data: { int: cliffInMonths.toString() }, type: { prim: 'nat' } })).packed
                const packedVestingInMonths         = (await utils.tezos.rpc.packData({ data: { int: vestingInMonths.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "updateVestee");
                assert.equal(action.executed, false);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("vesteeAddress"), packedVesteeAddress);
                assert.equal(dataMap.get("newTotalAllocatedAmount"), packedTotalAllocatedAmount);
                assert.equal(dataMap.get("newCliffInMonths"), packedCliffInMonths);
                assert.equal(dataMap.get("newVestingInMonths"), packedVestingInMonths);

                // set signer as council member two
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // set signer as council member three
                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                var action          = await councilStorage.councilActionsLedger.get(nextActionId);
                var actionSigner    = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
                dataMap             = await action.dataMap;

                vestingStorage      = await vestingInstance.storage();
                const vestee        = await vestingStorage.vesteeLedger.get(vesteeAddress);

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "updateVestee");
                assert.equal(action.executed, true);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 3);
                assert.equal(dataMap.get("vesteeAddress"), packedVesteeAddress);
                assert.equal(dataMap.get("newTotalAllocatedAmount"), packedTotalAllocatedAmount);
                assert.equal(dataMap.get("newCliffInMonths"), packedCliffInMonths);
                assert.equal(dataMap.get("newVestingInMonths"), packedVestingInMonths);
                assert.notStrictEqual(vestee, undefined);
                assert.equal(vestee.totalAllocatedAmount, totalAllocated);
                assert.equal(vestee.cliffMonths, cliffInMonths);
                assert.equal(vestee.vestingMonths, vestingInMonths);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        
        it('toggleVesteeLock               --> should lock or unlock a vestee (isaac)', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const nextActionId      = councilStorage.actionCounter;

                // Operation
                councilActionOperation = await councilInstance.methods.councilActionToggleVesteeLock(vesteeAddress).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage              = await councilInstance.storage();
                var action                  = await councilStorage.councilActionsLedger.get(nextActionId);
                var actionSigner            = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
                var dataMap                 = await action.dataMap;
                const packedVesteeAddress   = (await utils.tezos.rpc.packData({ data: { string: vesteeAddress }, type: { prim: 'address' } })).packed
                vestingStorage              = await vestingInstance.storage();
                var vestee                  = await vestingStorage.vesteeLedger.get(vesteeAddress);

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "toggleVesteeLock");
                assert.equal(action.executed, false);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("vesteeAddress"), packedVesteeAddress);
                assert.strictEqual(vestee.status, "ACTIVE")

                // set signer as council member two
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // set signer as council member three
                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // Final values
                councilStorage              = await councilInstance.storage();
                var action                  = await councilStorage.councilActionsLedger.get(nextActionId);
                var actionSigner            = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
                dataMap                     = await action.dataMap;
                vestingStorage              = await vestingInstance.storage();
                vestee                      = await vestingStorage.vesteeLedger.get(vesteeAddress);

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "toggleVesteeLock");
                assert.equal(action.executed, true);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 3);
                assert.equal(dataMap.get("vesteeAddress"), packedVesteeAddress);
                assert.notStrictEqual(vestee, undefined);
                assert.strictEqual(vestee.status, "LOCKED")

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('removeVestee                   --> should remove a vestee (isaac)', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const nextActionId      = councilStorage.actionCounter;

                // Operation
                councilActionOperation = await councilInstance.methods.councilActionRemoveVestee(vesteeAddress).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage              = await councilInstance.storage();
                var action                  = await councilStorage.councilActionsLedger.get(nextActionId);
                var actionSigner            = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
                var dataMap                 = await action.dataMap;
                const packedVesteeAddress   = (await utils.tezos.rpc.packData({ data: { string: vesteeAddress }, type: { prim: 'address' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "removeVestee");
                assert.equal(action.executed, false);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("vesteeAddress"), packedVesteeAddress);

                // set signer as council member two
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // set signer as council member three
                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                var action          = await councilStorage.councilActionsLedger.get(nextActionId);
                var actionSigner    = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
                dataMap             = await action.dataMap;

                vestingStorage      = await vestingInstance.storage();
                const vestee        = await vestingStorage.vesteeLedger.get(vesteeAddress);

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "removeVestee");
                assert.equal(action.executed, true);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 3);
                assert.equal(dataMap.get("vesteeAddress"), packedVesteeAddress);
                assert.strictEqual(vestee, undefined);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('addCouncilMember               --> should add an ordinary user (david) as a council member', async () => {
            try{
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const memberAddress         = david.pkh;
                const nextActionId          = councilStorage.actionCounter;
                const newMemberName         = "David";
                const newMemberImage        = "David Image";
                const newMemberWebsite      = "David Website";

                // Operation
                councilActionOperation = await councilInstance.methods.councilActionAddMember(memberAddress, newMemberName, newMemberWebsite, newMemberImage).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                var action                          = await councilStorage.councilActionsLedger.get(nextActionId);
                var actionSigner                    = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
                var dataMap                         = await action.dataMap;
                const packedCouncilMemberAddress    = (await utils.tezos.rpc.packData({ data: { string: memberAddress }, type: { prim: 'address' } })).packed
                const councilSize                   = councilStorage.councilSize;

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "addCouncilMember");
                assert.equal(action.executed, false);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("councilMemberAddress"), packedCouncilMemberAddress);

                // set signer as council member two
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // set signer as council member three
                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                var action          = await councilStorage.councilActionsLedger.get(nextActionId);
                var actionSigner    = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
                var dataMap      = await action.dataMap;

                const memberUpdated     = await councilStorage.councilMembers.get(david.pkh);
                const newCouncilSize    = councilStorage.councilSize;

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "addCouncilMember");
                assert.equal(action.executed, true);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 3);
                assert.equal(dataMap.get("councilMemberAddress"), packedCouncilMemberAddress);
                assert.notStrictEqual(memberUpdated, undefined);
                assert.deepEqual(newCouncilSize, councilSize.plus(1));

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('removeCouncilMember            --> should remove a given council member (david) from the council', async () => {
            try{
                
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const memberAddress     = david.pkh;
                const nextActionId      = councilStorage.actionCounter;

                // Operation
                await helperFunctions.signerFactory(tezos, councilMemberOneSk)
                councilActionOperation = await councilInstance.methods.councilActionRemoveMember(memberAddress).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                var action                          = await councilStorage.councilActionsLedger.get(nextActionId);
                var actionSigner                    = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
                var dataMap                         = await action.dataMap;
                const packedCouncilMemberAddress    = (await utils.tezos.rpc.packData({ data: { string: memberAddress }, type: { prim: 'address' } })).packed
                const councilSize                   = councilStorage.councilSize;

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "removeCouncilMember");
                assert.equal(action.executed, false);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("councilMemberAddress"), packedCouncilMemberAddress);

                // set signer as council member two
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // set signer as council member three
                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                var action          = await councilStorage.councilActionsLedger.get(nextActionId);
                var actionSigner    = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
                var dataMap         = await action.dataMap;

                const memberUpdated     = await councilStorage.councilMembers.get(memberAddress);
                const newCouncilSize    = councilStorage.councilSize;

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "removeCouncilMember");
                assert.equal(action.executed, true);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 3);
                assert.equal(dataMap.get("councilMemberAddress"), packedCouncilMemberAddress);
                assert.strictEqual(memberUpdated, undefined);
                assert.deepEqual(newCouncilSize, councilSize.minus(1));

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('removeCouncilMember            --> should fail if the config signers threshold is changed midway to be greater than the total number of council members', async () => {
            try{
                
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const memberAddress     = councilMemberTwo;
                const nextActionId      = councilStorage.actionCounter;

                // Operation
                councilActionOperation = await councilInstance.methods.councilActionRemoveMember(memberAddress).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                var action                          = await councilStorage.councilActionsLedger.get(nextActionId);
                var actionSigner                    = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
                var dataMap                         = await action.dataMap;
                const packedCouncilMemberAddress    = (await utils.tezos.rpc.packData({ data: { string: memberAddress }, type: { prim: 'address' } })).packed

                const councilMembersSize            = councilStorage.councilSize;   // 4 
                const oldThreshold                  = councilStorage.config.threshold;      // 3
                const newThreshold                  = councilMembersSize;                   // 4

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "removeCouncilMember");
                assert.equal(action.executed, false);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("councilMemberAddress"), packedCouncilMemberAddress);

                // update config operation
                await helperFunctions.signerFactory(tezos, adminSk)
                var updateConfigOperation = await councilInstance.methods.updateConfig(newThreshold, "configThreshold").send();
                await updateConfigOperation.confirmation();

                // set signer as council member two
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // set signer as council member three
                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // set signer as council member four
                await helperFunctions.signerFactory(tezos, councilMemberFourSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId);
                await chai.expect(signActionOperation.send()).to.be.rejected;

                // --------------------------
                // reset config threshold
                await helperFunctions.signerFactory(tezos, adminSk)
                updateConfigOperation = await councilInstance.methods.updateConfig(oldThreshold, "configThreshold").send();
                await updateConfigOperation.confirmation();

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('removeCouncilMember            --> should fail if the given address (mallory) is not a council member', async () => {
            try{
                
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const memberAddress     = mallory.pkh;

                // Operation
                councilActionOperation = await councilInstance.methods.councilActionRemoveMember(memberAddress);
                await chai.expect(councilActionOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('changeCouncilMember            --> should be able to replace a council member (alice) with another user (isaac)', async () => {
            try{

                // Initial Values
                councilStorage          = await councilInstance.storage();
                const oldMemberAddress  = councilMemberThree;
                const newMemberAddress  = isaac.pkh;
                var nextActionId        = councilStorage.actionCounter;
                const newMemberName     = "Isaac";
                const newMemberImage    = "Isaac Image";
                const newMemberWebsite  = "Isaac Website";

                // Operation
                councilActionOperation = await councilInstance.methods.councilActionChangeMember(oldMemberAddress, newMemberAddress, newMemberName, newMemberWebsite, newMemberImage).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage                          = await councilInstance.storage();
                var action                              = await councilStorage.councilActionsLedger.get(nextActionId);
                var actionSigner                        = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
                var dataMap                             = await action.dataMap;
                const packedOldCouncilMemberAddress     = (await utils.tezos.rpc.packData({ data: { string: oldMemberAddress }, type: { prim: 'address' } })).packed
                const packedNewCouncilMemberAddress     = (await utils.tezos.rpc.packData({ data: { string: newMemberAddress }, type: { prim: 'address' } })).packed
                const councilSize                       = councilStorage.councilSize;

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "changeCouncilMember");
                assert.equal(action.executed, false);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("oldCouncilMemberAddress"), packedOldCouncilMemberAddress);
                assert.equal(dataMap.get("newCouncilMemberAddress"), packedNewCouncilMemberAddress);

                // set signer as council member two
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // set signer as council member three
                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                var action          = await councilStorage.councilActionsLedger.get(nextActionId);
                var actionSigner    = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
                dataMap             = await action.dataMap;

                const memberRemoved = await councilStorage.councilMembers.get(oldMemberAddress);
                const memberAdded   = await councilStorage.councilMembers.get(newMemberAddress);
                const newCouncilSize= councilStorage.councilSize;

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "changeCouncilMember");
                assert.equal(action.executed, true);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 3);
                assert.equal(dataMap.get("oldCouncilMemberAddress"), packedOldCouncilMemberAddress);
                assert.equal(dataMap.get("newCouncilMemberAddress"), packedNewCouncilMemberAddress);
                assert.strictEqual(memberRemoved, undefined);
                assert.notStrictEqual(memberAdded, undefined);
                assert.deepEqual(newCouncilSize, councilSize);

                // Reset change - set alice back as council member
                councilStorage      = await councilInstance.storage();
                var nextActionId      = councilStorage.actionCounter;

                // Operation
                await helperFunctions.signerFactory(tezos, councilMemberOneSk)
                councilActionOperation = await councilInstance.methods.councilActionChangeMember(newMemberAddress, oldMemberAddress, "Alice", "Alice Website", "Alice Image").send();
                await councilActionOperation.confirmation();

                // set signer as council member two
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // set signer as signer
                await helperFunctions.signerFactory(tezos, isaac.sk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();
            
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('changeCouncilMember            --> should fail if the old member address (trudy) is removed from the council midway', async () => {
            try{

                // Initial Values
                councilStorage          = await councilInstance.storage();
                const oldMemberAddress  = councilMemberTwo;
                const newMemberAddress  = isaac.pkh;
                const newMemberName     = "Isaac";
                const newMemberImage    = "Isaac Image";
                const newMemberWebsite  = "Isaac Website";
                const actionId          = councilStorage.actionCounter;

                // change council member (trudy) with user (isaac) operation
                councilActionOperation = await councilInstance.methods.councilActionChangeMember(oldMemberAddress, newMemberAddress, newMemberName, newMemberWebsite, newMemberImage).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage                          = await councilInstance.storage();
                var action                              = await councilStorage.councilActionsLedger.get(actionId);
                var actionSigner                        = await councilStorage.councilActionsSigners.get({0: actionId, 1: councilMember})
                var dataMap                             = await action.dataMap;
                const packedOldCouncilMemberAddress     = (await utils.tezos.rpc.packData({ data: { string: oldMemberAddress }, type: { prim: 'address' } })).packed
                const packedNewCouncilMemberAddress     = (await utils.tezos.rpc.packData({ data: { string: newMemberAddress }, type: { prim: 'address' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "changeCouncilMember");
                assert.equal(action.executed, false);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("oldCouncilMemberAddress"), packedOldCouncilMemberAddress);
                assert.equal(dataMap.get("newCouncilMemberAddress"), packedNewCouncilMemberAddress);

                // remove trudy as a council member
                councilStorage          = await councilInstance.storage();
                const nextActionId      = councilStorage.actionCounter;

                await helperFunctions.signerFactory(tezos, councilMemberOneSk)
                councilActionOperation = await councilInstance.methods.councilActionRemoveMember(councilMemberTwo).send();
                await councilActionOperation.confirmation();

                // set signer as council member three
                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // set signer as council member four
                await helperFunctions.signerFactory(tezos, councilMemberFourSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // trudy removed as council member
                // ------ 

                // sign previous action to change council members should now fail

                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(actionId).send();
                await signActionOperation.confirmation();

                await helperFunctions.signerFactory(tezos, councilMemberFourSk)
                signActionOperation = await councilInstance.methods.signAction(actionId);
                await chai.expect(signActionOperation.send()).to.be.rejected;

                // reset test - add trudy back as a council member

                councilStorage           = await councilInstance.storage();
                const resetActionId      = councilStorage.actionCounter;
                const memberName         = "Trudy";
                const memberImage        = "Trudy Image";
                const memberWebsite      = "Trudy Website";

                await helperFunctions.signerFactory(tezos, councilMemberOneSk)
                councilActionOperation = await councilInstance.methods.councilActionAddMember(councilMemberTwo, memberName, memberImage, memberWebsite).send();
                await councilActionOperation.confirmation();

                // set signer as council member three
                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(resetActionId).send();
                await signActionOperation.confirmation();

                // set signer as council member four
                await helperFunctions.signerFactory(tezos, councilMemberFourSk)
                signActionOperation = await councilInstance.methods.signAction(resetActionId).send();
                await signActionOperation.confirmation();

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('changeCouncilMember            --> should fail if the new member address (david) is added to the council midway', async () => {
            try{

                // Initial Values
                councilStorage          = await councilInstance.storage();
                const oldMemberAddress  = councilMemberTwo;
                const newMemberAddress  = david.pkh;
                const newMemberName     = "David";
                const newMemberImage    = "David Image";
                const newMemberWebsite  = "David Website";
                const actionId          = councilStorage.actionCounter;

                // change council member (trudy) with user (david) operation
                councilActionOperation = await councilInstance.methods.councilActionChangeMember(oldMemberAddress, newMemberAddress, newMemberName, newMemberWebsite, newMemberImage).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage                          = await councilInstance.storage();
                var action                              = await councilStorage.councilActionsLedger.get(actionId);
                var actionSigner                        = await councilStorage.councilActionsSigners.get({0: actionId, 1: councilMember})
                var dataMap                             = await action.dataMap;
                const packedOldCouncilMemberAddress     = (await utils.tezos.rpc.packData({ data: { string: oldMemberAddress }, type: { prim: 'address' } })).packed
                const packedNewCouncilMemberAddress     = (await utils.tezos.rpc.packData({ data: { string: newMemberAddress }, type: { prim: 'address' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "changeCouncilMember");
                assert.equal(action.executed, false);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("oldCouncilMemberAddress"), packedOldCouncilMemberAddress);
                assert.equal(dataMap.get("newCouncilMemberAddress"), packedNewCouncilMemberAddress);

                // add david as a council member
                councilStorage          = await councilInstance.storage();
                const nextActionId      = councilStorage.actionCounter;

                await helperFunctions.signerFactory(tezos, councilMemberOneSk)
                councilActionOperation = await councilInstance.methods.councilActionAddMember(newMemberAddress, newMemberName, newMemberImage, newMemberWebsite).send();
                await councilActionOperation.confirmation();

                // set signer as council member three
                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // set signer as council member four
                await helperFunctions.signerFactory(tezos, councilMemberFourSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // david added as council member
                // ------ 

                // sign previous action to change council members should now fail

                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(actionId).send();
                await signActionOperation.confirmation();

                await helperFunctions.signerFactory(tezos, councilMemberFourSk)
                signActionOperation = await councilInstance.methods.signAction(actionId);
                await chai.expect(signActionOperation.send()).to.be.rejected;

                // reset test - remove david from the council

                councilStorage          = await councilInstance.storage();
                const resetActionId     = councilStorage.actionCounter;

                await helperFunctions.signerFactory(tezos, councilMemberOneSk)
                councilActionOperation = await councilInstance.methods.councilActionRemoveMember(newMemberAddress).send();
                await councilActionOperation.confirmation();

                // set signer as council member three
                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(resetActionId).send();
                await signActionOperation.confirmation();

                // set signer as council member four
                await helperFunctions.signerFactory(tezos, councilMemberFourSk)
                signActionOperation = await councilInstance.methods.signAction(resetActionId).send();
                await signActionOperation.confirmation();

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('setBaker                       --> should be able to set a baker on the Council contract', async () => {
            try{

                // Initial Values
                councilStorage          = await councilInstance.storage();
                const bakerAddress      = baker.pkh;
                var nextActionId        = councilStorage.actionCounter;

                // Operation
                councilActionOperation = await councilInstance.methods.councilActionSetBaker(bakerAddress).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage                          = await councilInstance.storage();
                var action                              = await councilStorage.councilActionsLedger.get(nextActionId);
                var actionSigner                        = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
                var dataMap                             = await action.dataMap;

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "setBaker");
                assert.equal(action.executed, false);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 1);

                // set signer as council member two
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // set signer as council member three
                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                var action          = await councilStorage.councilActionsLedger.get(nextActionId);
                var actionSigner    = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
                dataMap             = await action.dataMap;

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "setBaker");
                assert.equal(action.executed, true);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 3);
            
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('setBaker                       --> should be able to remove baker on the Council contract', async () => {
            try{

                // Initial Values
                councilStorage          = await councilInstance.storage();
                const bakerAddress      = null;
                var nextActionId        = councilStorage.actionCounter;

                // Operation
                councilActionOperation = await councilInstance.methods.councilActionSetBaker(bakerAddress).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage                          = await councilInstance.storage();
                var action                              = await councilStorage.councilActionsLedger.get(nextActionId);
                var actionSigner                        = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
                var dataMap                             = await action.dataMap;

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "setBaker");
                assert.equal(action.executed, false);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 1);

                // set signer as council member two
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // set signer as council member three
                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                var action          = await councilStorage.councilActionsLedger.get(nextActionId);
                var actionSigner    = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
                dataMap             = await action.dataMap;

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "setBaker");
                assert.equal(action.executed, true);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 3);
            
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('transfer                       --> should transfer tokens from the council contract to a given address', async () => {
            try{
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const receiverAddress       = eve.pkh;
                const tokenContractAddress  = contractDeployments.mvkToken.address;
                const tokenType             = "FA2";
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const tokenId               = 0;
                const nextActionId          = councilStorage.actionCounter;

                // Operation
                councilActionOperation = await councilInstance.methods.councilActionTransfer(
                    receiverAddress,
                    tokenContractAddress,
                    tokenAmount,
                    tokenType,
                    tokenId,
                    purpose).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                var action                          = await councilStorage.councilActionsLedger.get(nextActionId);
                var actionSigner                    = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
                var dataMap                         = await action.dataMap;
                const packedReceiverAddress         = (await utils.tezos.rpc.packData({ data: { string: receiverAddress }, type: { prim: 'address' } })).packed
                const packedTokenContractAddress    = (await utils.tezos.rpc.packData({ data: { string: tokenContractAddress }, type: { prim: 'address' } })).packed
                const packedTokenType               = (await utils.tezos.rpc.packData({ data: { string: tokenType }, type: { prim: 'string' } })).packed
                const packedPurpose                 = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount             = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed
                const packedTokenId                 = (await utils.tezos.rpc.packData({ data: { int: tokenId.toString() }, type: { prim: 'nat' } })).packed
                mvkTokenStorage                     = await mvkTokenInstance.storage();
                const preCouncilBalance             = await mvkTokenStorage.ledger.get(contractDeployments.council.address);
                const preUserBalance                = await mvkTokenStorage.ledger.get(eve.pkh);

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "transfer");
                assert.equal(action.executed, false);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 1);

                assert.equal(dataMap.get("receiverAddress"), packedReceiverAddress);
                assert.equal(dataMap.get("tokenContractAddress"), packedTokenContractAddress);
                assert.equal(dataMap.get("tokenType"), packedTokenType);
                assert.equal(dataMap.get("purpose"), packedPurpose);
                assert.equal(dataMap.get("tokenAmount"), packedTokenAmount);
                assert.equal(dataMap.get("tokenId"), packedTokenId);

                // set signer as council member two
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // set signer as council member three
                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                var action          = await councilStorage.councilActionsLedger.get(nextActionId);
                var actionSigner    = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
                dataMap             = await action.dataMap;

                mvkTokenStorage             = await mvkTokenInstance.storage();
                const postCouncilBalance    = await mvkTokenStorage.ledger.get(contractDeployments.council.address);
                const postUserBalance       = await mvkTokenStorage.ledger.get(eve.pkh);

                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "transfer");
                assert.equal(action.executed, true);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 3);
                assert.equal(dataMap.get("receiverAddress"), packedReceiverAddress);
                assert.equal(dataMap.get("tokenContractAddress"), packedTokenContractAddress);
                assert.equal(dataMap.get("tokenType"), packedTokenType);
                assert.equal(dataMap.get("purpose"), packedPurpose);
                assert.equal(dataMap.get("tokenAmount"), packedTokenAmount);
                assert.equal(dataMap.get("tokenId"), packedTokenId);

                assert.notEqual(postCouncilBalance.toNumber(), preCouncilBalance.toNumber());
                assert.notEqual(postUserBalance.toNumber(), preUserBalance.toNumber());
                assert.equal(postUserBalance.toNumber(), preUserBalance.toNumber() + tokenAmount);
                assert.equal(postCouncilBalance.toNumber(), preCouncilBalance.toNumber() - tokenAmount);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('requestTokens                  --> should create a financial request for the specified token in the Governance Financial contract', async () => {
            try{
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const fromTreasury          = contractDeployments.treasury.address;
                const receiverAddress       = councilAddress;
                const tokenContractAddress  = contractDeployments.mvkToken.address;
                const tokenName             = "MVK";
                const tokenType             = "FA2";
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const tokenId               = 0;
                const nextActionId          = councilStorage.actionCounter;
                
                governanceFinancialStorage  = await governanceFinancialInstance.storage();
                const financialRequestId    = governanceFinancialStorage.financialRequestCounter; 

                // Operation
                councilActionOperation = await councilInstance.methods.councilActionRequestTokens(
                    fromTreasury,
                    receiverAddress,
                    tokenContractAddress,
                    tokenName,
                    tokenAmount,
                    tokenType,
                    tokenId,
                    purpose
                ).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                var action                          = await councilStorage.councilActionsLedger.get(nextActionId);
                var actionSigner                    = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
                var dataMap                         = await action.dataMap;
                const packedTreasuryAddress         = (await utils.tezos.rpc.packData({ data: { string: fromTreasury }, type: { prim: 'address' } })).packed
                const packedReceiverAddress         = (await utils.tezos.rpc.packData({ data: { string: receiverAddress }, type: { prim: 'address' } })).packed
                const packedTokenContractAddress    = (await utils.tezos.rpc.packData({ data: { string: tokenContractAddress }, type: { prim: 'address' } })).packed
                const packedTokenName               = (await utils.tezos.rpc.packData({ data: { string: tokenName }, type: { prim: 'string' } })).packed
                const packedTokenType               = (await utils.tezos.rpc.packData({ data: { string: tokenType }, type: { prim: 'string' } })).packed
                const packedPurpose                 = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount             = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed
                const packedTokenId                 = (await utils.tezos.rpc.packData({ data: { int: tokenId.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "requestTokens");
                assert.equal(action.executed, false);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("treasuryAddress"), packedTreasuryAddress);
                assert.equal(dataMap.get("receiverAddress"), packedReceiverAddress);
                assert.equal(dataMap.get("tokenContractAddress"), packedTokenContractAddress);
                assert.equal(dataMap.get("tokenName"), packedTokenName);
                assert.equal(dataMap.get("tokenType"), packedTokenType);
                assert.equal(dataMap.get("purpose"), packedPurpose);
                assert.equal(dataMap.get("tokenAmount"), packedTokenAmount);
                assert.equal(dataMap.get("tokenId"), packedTokenId);

                // set signer as council member two
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // set signer as council member three
                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                action              = await councilStorage.councilActionsLedger.get(nextActionId);
                actionSigner        = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
                dataMap             = await action.dataMap;

                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "requestTokens");
                assert.equal(action.executed, true);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 3);
                assert.equal(dataMap.get("treasuryAddress"), packedTreasuryAddress);
                assert.equal(dataMap.get("receiverAddress"), packedReceiverAddress);
                assert.equal(dataMap.get("tokenContractAddress"), packedTokenContractAddress);
                assert.equal(dataMap.get("tokenName"), packedTokenName);
                assert.equal(dataMap.get("tokenType"), packedTokenType);
                assert.equal(dataMap.get("purpose"), packedPurpose);
                assert.equal(dataMap.get("tokenAmount"), packedTokenAmount);
                assert.equal(dataMap.get("tokenId"), packedTokenId);
                
                // check that financial governance request now exists
                governanceFinancialStorage      = await governanceFinancialInstance.storage();
                const financialRequest          = await governanceFinancialStorage.financialRequestLedger.get(financialRequestId)
                assert.notStrictEqual(financialRequest, undefined);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('requestMint                    --> should create a financial request for minting of MVK in the Governance Financial contract', async () => {
            try{
                // Initial Values
                councilStorage              = await councilInstance.storage();

                const fromTreasury          = contractDeployments.treasury.address;
                const receiverAddress       = councilAddress;
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const nextActionId          = councilStorage.actionCounter;
                
                governanceFinancialStorage  = await governanceFinancialInstance.storage();
                const financialRequestId    = governanceFinancialStorage.financialRequestCounter; 

                // Operation
                councilActionOperation = await councilInstance.methods.councilActionRequestMint(
                    fromTreasury,
                    receiverAddress,
                    tokenAmount,
                    purpose).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage              = await councilInstance.storage();
                var action                  = await councilStorage.councilActionsLedger.get(nextActionId);
                var actionSigner            = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
                var dataMap                 = await action.dataMap;
                const packedTreasuryAddress = (await utils.tezos.rpc.packData({ data: { string: fromTreasury }, type: { prim: 'address' } })).packed
                const packedReceiverAddress = (await utils.tezos.rpc.packData({ data: { string: receiverAddress }, type: { prim: 'address' } })).packed
                const packedPurpose         = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount     = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "requestMint");
                assert.equal(action.executed, false);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("treasuryAddress"), packedTreasuryAddress);
                assert.equal(dataMap.get("receiverAddress"), packedReceiverAddress);
                assert.equal(dataMap.get("purpose"), packedPurpose);
                assert.equal(dataMap.get("tokenAmount"), packedTokenAmount);

                // set signer as council member two
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // set signer as council member three
                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                action              = await councilStorage.councilActionsLedger.get(nextActionId);
                actionSigner        = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
                dataMap             = await action.dataMap;

                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "requestMint");
                assert.equal(action.executed, true);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 3);
                assert.equal(dataMap.get("treasuryAddress"), packedTreasuryAddress);
                assert.equal(dataMap.get("receiverAddress"), packedReceiverAddress);
                assert.equal(dataMap.get("purpose"), packedPurpose);
                assert.equal(dataMap.get("tokenAmount"), packedTokenAmount);
                
                // check that financial governance request now exists
                governanceFinancialStorage      = await governanceFinancialInstance.storage();
                const financialRequest          = await governanceFinancialStorage.financialRequestLedger.get(financialRequestId)
                assert.notStrictEqual(financialRequest, undefined);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('setContractBaker               --> should create a financial request to set a baker on a target contract address in the Governance Financial contract', async () => {
            try{
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const targetContractAddress = contractDeployments.treasury.address;
                const bakerAddress          = baker.pkh;
                const nextActionId          = councilStorage.actionCounter;
                
                governanceFinancialStorage  = await governanceFinancialInstance.storage();
                const financialRequestId    = governanceFinancialStorage.financialRequestCounter; 

                // Operation
                councilActionOperation = await councilInstance.methods.councilActionSetContractBaker(
                    targetContractAddress,
                    bakerAddress
                ).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                var action                          = await councilStorage.councilActionsLedger.get(nextActionId);
                var actionSigner                    = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
                var dataMap                         = await action.dataMap;
                const packedTargetContractAddress   = (await utils.tezos.rpc.packData({ data: { string: targetContractAddress }, type: { prim: 'address' } })).packed
                
                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "setContractBaker");
                assert.equal(action.executed, false);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("targetContractAddress"), packedTargetContractAddress);
                
                // set signer as council member two
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // set signer as council member three
                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                action              = await councilStorage.councilActionsLedger.get(nextActionId);
                actionSigner        = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
                dataMap             = await action.dataMap;

                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "setContractBaker");
                assert.equal(action.executed, true);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 3);
                assert.equal(dataMap.get("targetContractAddress"), packedTargetContractAddress);

                // check that financial governance request now exists
                governanceFinancialStorage      = await governanceFinancialInstance.storage();
                const financialRequest          = await governanceFinancialStorage.financialRequestLedger.get(financialRequestId)
                assert.notStrictEqual(financialRequest, undefined);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
        
        it('dropFinancialRequest           --> should drop a financial request in the Governance Financial contract', async () => {
            try{
                // Initial Values
                councilStorage              = await councilInstance.storage();
                governanceFinancialStorage  = await governanceFinancialInstance.storage();
                const requestId             = governanceFinancialStorage.financialRequestCounter - 1;
                const nextActionId          = councilStorage.actionCounter;

                // Operation
                councilActionOperation = await councilInstance.methods.councilActionDropFinancialReq(requestId).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage          = await councilInstance.storage();
                var action              = await councilStorage.councilActionsLedger.get(nextActionId);
                var actionSigner        = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
                var dataMap             = await action.dataMap;
                const packedRequestId   = (await utils.tezos.rpc.packData({ data: { int: requestId.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "dropFinancialRequest");
                assert.equal(action.executed, false);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("requestId"), packedRequestId);

                // set signer as council member two
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // set signer as council member three
                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                action              = await councilStorage.councilActionsLedger.get(nextActionId);
                actionSigner        = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
                dataMap             = await action.dataMap;

                governanceFinancialStorage     = await governanceFinancialInstance.storage();
                const dropAction               = await governanceFinancialStorage.financialRequestLedger.get(requestId)

                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "dropFinancialRequest");
                assert.equal(action.executed, true);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 3);
                assert.equal(dataMap.get("requestId"), packedRequestId);
                assert.equal(dropAction.status, false);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('flushAction                    --> should fail if the action was already executed', async () => {
            try{
               
                // ----- REQUEST MINT
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const fromTreasury          = contractDeployments.treasury.address;
                const receiverAddress       = councilAddress;
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const mintActionID          = councilStorage.actionCounter;

                // Operation
                councilActionOperation = await councilInstance.methods.councilActionRequestMint(
                    fromTreasury,
                    receiverAddress,
                    tokenAmount,
                    purpose).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage              = await councilInstance.storage();
                var action                  = await councilStorage.councilActionsLedger.get(mintActionID);
                var actionSigner            = await councilStorage.councilActionsSigners.get({0: mintActionID, 1: councilMember})
                var dataMap                 = await action.dataMap;
                const packedTreasuryAddress = (await utils.tezos.rpc.packData({ data: { string: fromTreasury }, type: { prim: 'address' } })).packed
                const packedReceiverAddress = (await utils.tezos.rpc.packData({ data: { string: receiverAddress }, type: { prim: 'address' } })).packed
                const packedPurpose         = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount     = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "requestMint");
                assert.equal(action.executed, false);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("treasuryAddress"), packedTreasuryAddress);
                assert.equal(dataMap.get("receiverAddress"), packedReceiverAddress);
                assert.equal(dataMap.get("purpose"), packedPurpose);
                assert.equal(dataMap.get("tokenAmount"), packedTokenAmount);

                // ----- FLUSH REQUEST
                // Initial Values
                councilStorage                  = await councilInstance.storage();
                const flushActionID             = councilStorage.actionCounter;

                // Operation
                councilActionOperation = await councilInstance.methods.flushAction(mintActionID).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage          = await councilInstance.storage();
                action                  = await councilStorage.councilActionsLedger.get(flushActionID);
                actionSigner            = await councilStorage.councilActionsSigners.get({0: flushActionID, 1: councilMember})
                dataMap                 = await action.dataMap;
                var packedActionId      = (await utils.tezos.rpc.packData({ data: { int: mintActionID.toNumber().toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "flushAction");
                assert.equal(action.executed, false);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("actionId"), packedActionId);

                // ----- SIGN MINT

                // set signer as council member two
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(mintActionID).send();
                await signActionOperation.confirmation();

                // set signer as council member three
                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(mintActionID).send();
                await signActionOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                action              = await councilStorage.councilActionsLedger.get(mintActionID);
                dataMap             = await action.dataMap;

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "requestMint");
                assert.equal(action.executed, true);
                assert.equal(action.signersCount, 3);
                assert.equal(dataMap.get("treasuryAddress"), packedTreasuryAddress);
                assert.equal(dataMap.get("receiverAddress"), packedReceiverAddress);
                assert.equal(dataMap.get("purpose"), packedPurpose);
                assert.equal(dataMap.get("tokenAmount"), packedTokenAmount);

                // ----- SIGN FLUSH

                // set signer as council member two
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(flushActionID).send();
                await signActionOperation.confirmation();

                // set signer as council member three
                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(flushActionID);
                await chai.expect(signActionOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('flushAction                    --> should fail if the action was flushed', async () => {
            try{
                // ----- REQUEST MINT
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const fromTreasury          = contractDeployments.treasury.address;
                const receiverAddress       = councilAddress;
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const mintActionID          = councilStorage.actionCounter;

                // Operation
                councilActionOperation = await councilInstance.methods.councilActionRequestMint(
                    fromTreasury,
                    receiverAddress,
                    tokenAmount,
                    purpose).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage              = await councilInstance.storage();
                var action                  = await councilStorage.councilActionsLedger.get(mintActionID);
                var actionSigner            = await councilStorage.councilActionsSigners.get({0: mintActionID, 1: councilMember})
                var dataMap                 = await action.dataMap;
                const packedTreasuryAddress = (await utils.tezos.rpc.packData({ data: { string: fromTreasury }, type: { prim: 'address' } })).packed
                const packedReceiverAddress = (await utils.tezos.rpc.packData({ data: { string: receiverAddress }, type: { prim: 'address' } })).packed
                const packedPurpose         = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount     = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "requestMint");
                assert.equal(action.executed, false);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("treasuryAddress"), packedTreasuryAddress);
                assert.equal(dataMap.get("receiverAddress"), packedReceiverAddress);
                assert.equal(dataMap.get("purpose"), packedPurpose);
                assert.equal(dataMap.get("tokenAmount"), packedTokenAmount);

                // ----- FLUSH REQUEST
                // Initial Values
                councilStorage                  = await councilInstance.storage();
                const flushActionID             = councilStorage.actionCounter;

                // Operation
                councilActionOperation = await councilInstance.methods.flushAction(mintActionID).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                action              = await councilStorage.councilActionsLedger.get(flushActionID);
                actionSigner        = await councilStorage.councilActionsSigners.get({0: flushActionID, 1: councilMember})
                dataMap             = await action.dataMap;
                var packedActionId  = (await utils.tezos.rpc.packData({ data: { int: mintActionID.toNumber().toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "flushAction");
                assert.equal(action.executed, false);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("actionId"), packedActionId);

                // ----- SECOND FLUSH REQUEST
                // Initial Values
                councilStorage                  = await councilInstance.storage();
                const reflushActionID           = councilStorage.actionCounter;

                // Operation
                councilActionOperation = await councilInstance.methods.flushAction(mintActionID).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                action              = await councilStorage.councilActionsLedger.get(reflushActionID);
                actionSigner        = await councilStorage.councilActionsSigners.get({0: reflushActionID, 1: councilMember})
                dataMap             = await action.dataMap;

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "flushAction");
                assert.equal(action.executed, false);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("actionId"), packedActionId);

                // ----- SIGN FIRST FLUSH
                await helperFunctions.signerFactory(tezos, trudy.sk)

                // Operation
                var signOperation = await councilInstance.methods.signAction(flushActionID).send();
                await signOperation.confirmation();

                // ----- TRY SECOND FLUSH
                // Operation
                await chai.expect(councilInstance.methods.signAction(flushActionID).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('flushAction                    --> should flush a pending action', async () => {
            try{

                // ----- REQUEST MINT
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const fromTreasury          = contractDeployments.treasury.address;
                const receiverAddress       = councilAddress;
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const mintActionID          = councilStorage.actionCounter;

                // Operation
                councilActionOperation = await councilInstance.methods.councilActionRequestMint(
                    fromTreasury,
                    receiverAddress,
                    tokenAmount,
                    purpose).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage              = await councilInstance.storage();
                var action                  = await councilStorage.councilActionsLedger.get(mintActionID);
                var actionSigner            = await councilStorage.councilActionsSigners.get({0: mintActionID, 1: councilMember})
                var dataMap                 = await action.dataMap;
                const packedTreasuryAddress = (await utils.tezos.rpc.packData({ data: { string: fromTreasury }, type: { prim: 'address' } })).packed
                const packedReceiverAddress = (await utils.tezos.rpc.packData({ data: { string: receiverAddress }, type: { prim: 'address' } })).packed
                const packedPurpose         = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount     = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "requestMint");
                assert.equal(action.executed, false);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("treasuryAddress"), packedTreasuryAddress);
                assert.equal(dataMap.get("receiverAddress"), packedReceiverAddress);
                assert.equal(dataMap.get("purpose"), packedPurpose);
                assert.equal(dataMap.get("tokenAmount"), packedTokenAmount);

                // ----- FLUSH REQUEST
                // Initial Values
                councilStorage                  = await councilInstance.storage();
                const flushActionID             = councilStorage.actionCounter;

                // Operation
                councilActionOperation = await councilInstance.methods.flushAction(mintActionID).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                action              = await councilStorage.councilActionsLedger.get(flushActionID);
                actionSigner        = await councilStorage.councilActionsSigners.get({0: flushActionID, 1: councilMember})
                dataMap             = await action.dataMap;
                var packedActionId  = (await utils.tezos.rpc.packData({ data: { int: mintActionID.toNumber().toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "flushAction");
                assert.equal(action.executed, false);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("actionId"), packedActionId);

                // ----- SIGN FIRST FLUSH

                // set signer as council member two
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(flushActionID).send();
                await signActionOperation.confirmation();

                // set signer as council member three
                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(flushActionID).send();
                await signActionOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                action              = await councilStorage.councilActionsLedger.get(flushActionID);
                actionSigner        = await councilStorage.councilActionsSigners.get({0: flushActionID, 1: councilMember})
                dataMap             = await action.dataMap;

                const flushedAction = await councilStorage.councilActionsLedger.get(mintActionID);

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "flushAction");
                assert.equal(action.executed, true);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 3);
                assert.equal(dataMap.get("actionId"), packedActionId);
                assert.strictEqual(flushedAction.status, "FLUSHED");

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('signAction                     --> should fail if council action was already flushed', async () => {
            try{

                // Initial values
                councilStorage              = await councilInstance.storage();
                const flushedActionID       = councilStorage.actionCounter - 2;

                const flushedAction = await councilStorage.councilActionsLedger.get(flushedActionID);
                assert.strictEqual(flushedAction.status, "FLUSHED");

                // Operation
                signActionOperation = await councilInstance.methods.signAction(flushedActionID);
                await chai.expect(signActionOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('signAction                     --> should fail if council action was already executed', async () => {
            try{

                // Initial values
                councilStorage              = await councilInstance.storage();
                const executedActionID      = councilStorage.actionCounter - 1;

                const executedAction = await councilStorage.councilActionsLedger.get(executedActionID);
                assert.strictEqual(executedAction.status, "EXECUTED");

                // Operation
                signActionOperation = await councilInstance.methods.signAction(executedActionID);
                await chai.expect(signActionOperation.send()).to.be.rejected;
                
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('signAction                     --> should fail if council action does not exist', async () => {
            try{
                
                // initial storage
                councilStorage              = await councilInstance.storage();
                const flushedActionID       = 999;

                // Operation
                signActionOperation = await councilInstance.methods.signAction(flushedActionID);
                await chai.expect(signActionOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('signAction                     --> should fail if council action was already signed by council member', async () => {
            try{
                
                // ----- REQUEST MINT
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const fromTreasury          = contractDeployments.treasury.address;
                const receiverAddress       = councilAddress;
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const mintActionID          = councilStorage.actionCounter;

                // Operation
                councilActionOperation = await councilInstance.methods.councilActionRequestMint(
                    fromTreasury,
                    receiverAddress,
                    tokenAmount,
                    purpose
                ).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage              = await councilInstance.storage();
                var action                  = await councilStorage.councilActionsLedger.get(mintActionID);
                var actionSigner            = await councilStorage.councilActionsSigners.get({0: mintActionID, 1: councilMember})
                var dataMap                 = await action.dataMap;
                const packedTreasuryAddress = (await utils.tezos.rpc.packData({ data: { string: fromTreasury }, type: { prim: 'address' } })).packed
                const packedReceiverAddress = (await utils.tezos.rpc.packData({ data: { string: receiverAddress }, type: { prim: 'address' } })).packed
                const packedPurpose         = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount     = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "requestMint");
                assert.equal(action.executed, false);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("treasuryAddress"), packedTreasuryAddress);
                assert.equal(dataMap.get("receiverAddress"), packedReceiverAddress);
                assert.equal(dataMap.get("purpose"), packedPurpose);
                assert.equal(dataMap.get("tokenAmount"), packedTokenAmount);

                // Operation
                signActionOperation = await councilInstance.methods.signAction(mintActionID);
                await chai.expect(signActionOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

    })



    describe("Housekeeping Entrypoints", async () => {

        beforeEach("Set signer to admin (bob)", async () => {
            councilStorage        = await councilInstance.storage();
            await helperFunctions.signerFactory(tezos, adminSk);
        });

        it('%setAdmin                       - admin (bob) should be able to update the contract admin address', async () => {
            try{
                
                // Initial Values
                councilStorage     = await councilInstance.storage();
                const currentAdmin = councilStorage.admin;
                assert.strictEqual(currentAdmin, admin);

                // Operation
                setAdminOperation = await councilInstance.methods.setAdmin(alice.pkh).send();
                await setAdminOperation.confirmation();

                // Final values
                councilStorage   = await councilInstance.storage();
                const newAdmin = councilStorage.admin;

                // Assertions
                assert.notStrictEqual(newAdmin, currentAdmin);
                assert.strictEqual(newAdmin, alice.pkh);
                
                // reset admin
                await helperFunctions.signerFactory(tezos, alice.sk);
                resetAdminOperation = await councilInstance.methods.setAdmin(admin).send();
                await resetAdminOperation.confirmation();

            } catch(e){
                console.log(e);
            }
        });

        it('%setGovernance                  - admin (bob) should be able to update the contract governance address', async () => {
            try{
                
                // Initial Values
                councilStorage       = await councilInstance.storage();
                const currentGovernance = councilStorage.governanceAddress;

                // Operation
                setGovernanceOperation = await councilInstance.methods.setGovernance(alice.pkh).send();
                await setGovernanceOperation.confirmation();

                // Final values
                councilStorage   = await councilInstance.storage();
                const updatedGovernance = councilStorage.governanceAddress;

                // reset governance
                setGovernanceOperation = await councilInstance.methods.setGovernance(contractDeployments.governance.address).send();
                await setGovernanceOperation.confirmation();

                // Assertions
                assert.notStrictEqual(updatedGovernance, currentGovernance);
                assert.strictEqual(updatedGovernance, alice.pkh);
                assert.strictEqual(currentGovernance, contractDeployments.governance.address);

            } catch(e){
                console.log(e);
            }
        });

        it('%updateMetadata                 - admin (bob) should be able to update the contract metadata', async () => {
            try{
                // Initial values
                const key   = ''
                const hash  = Buffer.from('tezos-storage:data', 'ascii').toString('hex')

                // Operation
                const updateOperation = await councilInstance.methods.updateMetadata(key, hash).send();
                await updateOperation.confirmation();

                // Final values
                councilStorage          = await councilInstance.storage();            

                const updatedData       = await councilStorage.metadata.get(key);
                assert.equal(hash, updatedData);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('%updateConfig                   - admin (bob) should be able to update contract config', async () => {
            try{
                
                // Initial Values
                councilStorage            = await councilInstance.storage();
                const initialConfig       = councilStorage.config;

                const testValue           = 1;

                // update config operations
                var updateConfigOperation = await councilInstance.methods.updateConfig(testValue, "configThreshold").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await councilInstance.methods.updateConfig(testValue, "configActionExpiryDays").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await councilInstance.methods.updateConfig(testValue, "configCouncilNameMaxLength").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await councilInstance.methods.updateConfig(testValue, "configCouncilWebsiteMaxLength").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await councilInstance.methods.updateConfig(testValue, "configCouncilImageMaxLength").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await councilInstance.methods.updateConfig(testValue, "configRequestTokenNameMaxLength").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await councilInstance.methods.updateConfig(testValue, "configRequestPurposeMaxLength").send();
                await updateConfigOperation.confirmation();

                // update storage
                councilStorage           = await councilInstance.storage();
                const updatedConfig      = councilStorage.config;

                // Assertions
                assert.equal(updatedConfig.threshold                    , testValue);
                assert.equal(updatedConfig.actionExpiryDays             , testValue);
                assert.equal(updatedConfig.councilMemberNameMaxLength   , testValue);
                assert.equal(updatedConfig.councilMemberWebsiteMaxLength, testValue);
                assert.equal(updatedConfig.councilMemberImageMaxLength  , testValue);
                assert.equal(updatedConfig.requestTokenNameMaxLength    , testValue);
                assert.equal(updatedConfig.requestPurposeMaxLength      , testValue);

                // reset config operation
                var resetConfigOperation = await councilInstance.methods.updateConfig(initialConfig.threshold, "configThreshold").send();
                await resetConfigOperation.confirmation();

                resetConfigOperation = await councilInstance.methods.updateConfig(initialConfig.actionExpiryDays, "configActionExpiryDays").send();
                await resetConfigOperation.confirmation();
                
                resetConfigOperation = await councilInstance.methods.updateConfig(initialConfig.councilMemberNameMaxLength, "configCouncilNameMaxLength").send();
                await resetConfigOperation.confirmation();

                resetConfigOperation = await councilInstance.methods.updateConfig(initialConfig.councilMemberWebsiteMaxLength, "configCouncilWebsiteMaxLength").send();
                await resetConfigOperation.confirmation();

                resetConfigOperation = await councilInstance.methods.updateConfig(initialConfig.councilMemberImageMaxLength, "configCouncilImageMaxLength").send();
                await resetConfigOperation.confirmation();

                resetConfigOperation = await councilInstance.methods.updateConfig(initialConfig.requestTokenNameMaxLength, "configRequestTokenNameMaxLength").send();
                await resetConfigOperation.confirmation();

                resetConfigOperation = await councilInstance.methods.updateConfig(initialConfig.requestPurposeMaxLength, "configRequestPurposeMaxLength").send();
                await resetConfigOperation.confirmation();

                // update storage
                councilStorage           = await councilInstance.storage();
                const resetConfig        = councilStorage.config;

                assert.equal(resetConfig.threshold.toNumber(),                      initialConfig.threshold.toNumber());
                assert.equal(resetConfig.actionExpiryDays.toNumber(),              initialConfig.actionExpiryDays.toNumber());
                assert.equal(resetConfig.councilMemberNameMaxLength.toNumber(),    initialConfig.councilMemberNameMaxLength.toNumber());
                assert.equal(resetConfig.councilMemberWebsiteMaxLength.toNumber(), initialConfig.councilMemberWebsiteMaxLength.toNumber());
                assert.equal(resetConfig.councilMemberImageMaxLength.toNumber(),   initialConfig.councilMemberImageMaxLength.toNumber());
                assert.equal(resetConfig.requestTokenNameMaxLength.toNumber(),     initialConfig.requestTokenNameMaxLength.toNumber());
                assert.equal(resetConfig.requestPurposeMaxLength.toNumber(),       initialConfig.requestPurposeMaxLength.toNumber());

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%updateConfig                   - admin (bob) should not be able to configure the signer threshold to be greater than the number of members in the council', async () => {
            try{
                
                // initial Values
                councilStorage = await councilInstance.storage();
                const currentThresholdConfigValue = councilStorage.config.threshold;
                const newConfigValue = 999

                // update config operation
                var updateConfigOperation = await councilInstance.methods.updateConfig(newConfigValue, "configThreshold");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                // update storage
                councilStorage = await councilInstance.storage();
                const updateConfigValue = councilStorage.config.threshold;

                // check that there is no change
                assert.notEqual(newConfigValue, currentThresholdConfigValue);
                assert.equal(updateConfigValue.toNumber(), currentThresholdConfigValue.toNumber());

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%updateWhitelistContracts       - admin (bob) should be able to add user (eve) to the Whitelisted Contracts map', async () => {
            try {

                // init values
                contractMapKey  = eve.pkh;
                storageMap      = "whitelistContracts";

                initialContractMapValue           = await helperFunctions.getStorageMapValue(councilStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await helperFunctions.updateWhitelistContracts(councilInstance, contractMapKey, 'update');
                await updateWhitelistContractsOperation.confirmation()

                councilStorage = await councilInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(councilStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'Eve (key) should not be in the Whitelist Contracts map before adding her to it')
                assert.notStrictEqual(updatedContractMapValue, undefined,  'Eve (key) should be in the Whitelist Contracts map after adding her to it')

            } catch (e) {
                console.log(e)
            }
        })

        it('%updateWhitelistContracts       - admin (bob) should be able to remove user (eve) from the Whitelisted Contracts map', async () => {
            try {

                // init values
                contractMapKey  = eve.pkh;
                storageMap      = "whitelistContracts";

                initialContractMapValue = await helperFunctions.getStorageMapValue(councilStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await helperFunctions.updateWhitelistContracts(councilInstance, contractMapKey, 'remove');
                await updateWhitelistContractsOperation.confirmation()

                councilStorage = await councilInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(councilStorage, storageMap, contractMapKey);

                assert.notStrictEqual(initialContractMapValue, undefined, 'Eve (key) should be in the Whitelist Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, undefined, 'Eve (key) should not be in the Whitelist Contracts map after adding her to it');

            } catch (e) {
                console.log(e)
            }
        })

        it('%updateGeneralContracts         - admin (bob) should be able to add user (eve) to the General Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "generalContracts";

                initialContractMapValue = await helperFunctions.getStorageMapValue(councilStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await helperFunctions.updateGeneralContracts(councilInstance, contractMapKey, eve.pkh, 'update');
                await updateGeneralContractsOperation.confirmation()

                councilStorage = await councilInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(councilStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'eve (key) should not be in the General Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, eve.pkh, 'eve (key) should be in the General Contracts map after adding her to it');

            } catch (e) {
                console.log(e)
            }
        })

        it('%updateGeneralContracts         - admin (bob) should be able to remove user (eve) from the General Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "generalContracts";

                initialContractMapValue = await helperFunctions.getStorageMapValue(councilStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await helperFunctions.updateGeneralContracts(councilInstance, contractMapKey, eve.pkh, 'remove');
                await updateGeneralContractsOperation.confirmation()

                councilStorage = await councilInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(councilStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, eve.pkh, 'eve (key) should be in the General Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, undefined, 'eve (key) should not be in the General Contracts map after adding her to it');

            } catch (e) {
                console.log(e)
            }
        })

    });


    describe('Access Control Checks', function () {

        beforeEach("Set signer to non-admin (mallory)", async () => {
            councilStorage = await councilInstance.storage();
            vesteeAddress  = oscar.pkh;
            await helperFunctions.signerFactory(tezos, mallory.sk);
        });

        it('%setAdmin                       - non-admin (mallory) should not be able to access this entrypoint', async () => {
            try{
                // Initial Values
                councilStorage      = await councilInstance.storage();
                const currentAdmin  = councilStorage.admin;

                // Operation
                setAdminOperation = await councilInstance.methods.setAdmin(mallory.pkh);
                await chai.expect(setAdminOperation.send()).to.be.rejected;

                // Final values
                councilStorage  = await councilInstance.storage();
                const newAdmin  = councilStorage.admin;

                // Assertions
                assert.strictEqual(newAdmin, currentAdmin);

            } catch(e){
                console.log(e);
            }
        });

        it('%setGovernance                  - non-admin (mallory) should not be able to access this entrypoint', async () => {
            try{
                // Initial Values
                councilStorage        = await councilInstance.storage();
                const currentGovernance  = councilStorage.governanceAddress;

                // Operation
                setGovernanceOperation = await councilInstance.methods.setGovernance(mallory.pkh);
                await chai.expect(setGovernanceOperation.send()).to.be.rejected;

                // Final values
                councilStorage        = await councilInstance.storage();
                const updatedGovernance  = councilStorage.governanceAddress;

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

                councilStorage       = await councilInstance.storage();   
                const initialMetadata   = await councilStorage.metadata.get(key);

                // Operation
                const updateOperation = await councilInstance.methods.updateMetadata(key, hash);
                await chai.expect(updateOperation.send()).to.be.rejected;

                // Final values
                councilStorage       = await councilInstance.storage();            
                const updatedData       = await councilStorage.metadata.get(key);

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
                councilStorage            = await councilInstance.storage();
                const initialConfig       = councilStorage.config;
                const testValue           = 1;

                // update config operations
                var updateConfigOperation = await councilInstance.methods.updateConfig(testValue, "configThreshold");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = await councilInstance.methods.updateConfig(testValue, "configActionExpiryDays");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = await councilInstance.methods.updateConfig(testValue, "configCouncilNameMaxLength");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = await councilInstance.methods.updateConfig(testValue, "configCouncilWebsiteMaxLength");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = await councilInstance.methods.updateConfig(testValue, "configCouncilImageMaxLength");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = await councilInstance.methods.updateConfig(testValue, "configRequestTokenNameMaxLength");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = await councilInstance.methods.updateConfig(testValue, "configRequestPurposeMaxLength");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                // update storage
                councilStorage           = await councilInstance.storage();
                const updatedConfig      = councilStorage.config;

                // check that there is no change to config
                assert.equal(updatedConfig.threshold.toNumber()                         , initialConfig.threshold.toNumber());
                assert.equal(updatedConfig.actionExpiryDays.toNumber()                  , initialConfig.actionExpiryDays.toNumber());
                assert.equal(updatedConfig.councilMemberNameMaxLength.toNumber()        , initialConfig.councilMemberNameMaxLength.toNumber());
                assert.equal(updatedConfig.councilMemberWebsiteMaxLength.toNumber()     , initialConfig.councilMemberWebsiteMaxLength.toNumber());
                assert.equal(updatedConfig.councilMemberImageMaxLength.toNumber()       , initialConfig.councilMemberImageMaxLength.toNumber());
                assert.equal(updatedConfig.requestTokenNameMaxLength.toNumber()         , initialConfig.requestTokenNameMaxLength.toNumber());
                assert.equal(updatedConfig.requestPurposeMaxLength.toNumber()           , initialConfig.requestPurposeMaxLength.toNumber());

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%updateWhitelistContracts       - non-admin (mallory) should not be able to access this entrypoint', async () => {
            try {

                // init values
                contractMapKey  = mallory.pkh;
                storageMap      = "whitelistContracts";

                initialContractMapValue = await helperFunctions.getStorageMapValue(councilStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await councilInstance.methods.updateWhitelistContracts(contractMapKey, 'update')
                await chai.expect(updateWhitelistContractsOperation.send()).to.be.rejected;

                councilStorage       = await councilInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(councilStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'mallory (key) should not be in the Whitelist Contracts map');

            } catch (e) {
                console.log(e)
            }
        })

        it('%updateGeneralContracts         - non-admin (mallory) should not be able to access this entrypoint', async () => {
            try {

                // init values
                contractMapKey  = "mallory";
                storageMap      = "generalContracts";

                initialContractMapValue = await helperFunctions.getStorageMapValue(councilStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await councilInstance.methods.updateGeneralContracts(contractMapKey, mallory.pkh, 'update')
                await chai.expect(updateGeneralContractsOperation.send()).to.be.rejected;

                councilStorage       = await councilInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(councilStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'mallory (key) should not be in the General Contracts map');

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


        it('%councilActionAddVestee         - non-council member (mallory) should not be able to access this entrypoint and create a new council action', async () => {
            try{

                // Initial Values
                councilStorage          = await councilInstance.storage();
                const cliffInMonths     = 0;
                const vestingInMonths   = 24;
                const totalAllocated    = MVK(20000000);

                // Operation
                councilActionOperation = councilInstance.methods.councilActionAddVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths)
                await chai.expect(councilActionOperation.send()).to.be.rejected;

                // -----------------------------------------------------------------------------
                // Council Member add vestee for tests below (update, remove, toggleVesteeLock)
                // -----------------------------------------------------------------------------

                councilStorage       = await councilInstance.storage();
                const nextActionId   = councilStorage.actionCounter;

                await helperFunctions.signerFactory(tezos, councilMemberOneSk);
                
                councilActionOperation = await councilInstance.methods.councilActionAddVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths).send();
                await councilActionOperation.confirmation();

                // set signer as council member two
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // set signer as council member three
                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                councilStorage       = await councilInstance.storage();
                const action         = await councilStorage.councilActionsLedger.get(nextActionId);

                // Assertions
                assert.strictEqual(action.actionType    , "addVestee");
                assert.strictEqual(action.status        , "EXECUTED");
                assert.equal(action.executed            , true);
                assert.equal(action.signersCount        , 3);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%councilActionUpdateVestee      - non-council member (mallory) should not be able to access this entrypoint and create a new council action', async () => {
            try{
                
                // Initial Values
                councilStorage       = await councilInstance.storage();
                const cliffInMonths     = 0;
                const vestingInMonths   = 12;
                const totalAllocated    = MVK(40000000);

                // Operation
                councilActionOperation = councilInstance.methods.councilActionUpdateVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths)
                await chai.expect(councilActionOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
        it('%councilActionRemoveVestee      - non-council member (mallory) should not be able to access this entrypoint and create a new council action', async () => {
            try{
                
                // Initial Values
                councilStorage       = await councilInstance.storage();

                // Operation
                councilActionOperation = councilInstance.methods.councilActionRemoveVestee(vesteeAddress)
                await chai.expect(councilActionOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%councilActionToggleVesteeLock  - non-council member (mallory) should not be able to access this entrypoint and create a new council action', async () => {
            try{
                // Initial Values

                councilStorage       = await councilInstance.storage();

                // Operation
                councilActionOperation = councilInstance.methods.councilActionToggleVesteeLock(vesteeAddress)
                await chai.expect(councilActionOperation.send()).to.be.rejected;

                // -----------------------------------------------------------------------------
                // Council Member remove vestee for retesting
                // -----------------------------------------------------------------------------

                councilStorage       = await councilInstance.storage();
                const nextActionId   = councilStorage.actionCounter;

                await helperFunctions.signerFactory(tezos, councilMemberOneSk);
                
                councilActionOperation = await councilInstance.methods.councilActionRemoveVestee(vesteeAddress).send();
                await councilActionOperation.confirmation();

                // set signer as council member two
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // set signer as council member three
                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                councilStorage       = await councilInstance.storage();
                const action         = await councilStorage.councilActionsLedger.get(nextActionId);

                // Assertions
                assert.strictEqual(action.actionType    , "removeVestee");
                assert.strictEqual(action.status        , "EXECUTED");
                assert.equal(action.executed            , true);
                assert.equal(action.signersCount        , 3);

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

        it('%councilActionTransfer          - non-council member (mallory) should not be able to access this entrypoint and create a new council action', async () => {
            try{
                
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const receiverAddress       = mallory.pkh;
                const tokenContractAddress  = contractDeployments.mvkToken.address;
                const tokenType             = "FA2";
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const tokenId               = 0;

                // Operation
                councilActionOperation = councilInstance.methods.councilActionTransfer(
                    receiverAddress,
                    tokenContractAddress,
                    tokenAmount,
                    tokenType,
                    tokenId,
                    purpose
                );

                await chai.expect(councilActionOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%councilActionRequestTokens     - non-council member (mallory) should not be able to access this entrypoint and create a new council action', async () => {
            try{
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const fromTreasury          = contractDeployments.treasury.address;
                const receiverAddress       = councilAddress;
                const tokenContractAddress  = contractDeployments.mvkToken.address;
                const tokenName             = "MVK";
                const tokenType             = "FA2";
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const tokenId               = 0;

                // Operation
                councilActionOperation = councilInstance.methods.councilActionRequestTokens(
                    fromTreasury,
                    receiverAddress,
                    tokenContractAddress,
                    tokenName,
                    tokenAmount,
                    tokenType,
                    tokenId,
                    purpose
                );

                await chai.expect(councilActionOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%councilActionRequestMint       - non-council member (mallory) should not be able to access this entrypoint and create a new council action', async () => {
            try{
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const fromTreasury          = contractDeployments.treasury.address;
                const receiverAddress       = councilAddress;
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);

                // Operation
                councilActionOperation = await councilInstance.methods.councilActionRequestMint(
                    fromTreasury,
                    receiverAddress,
                    tokenAmount,
                    purpose
                );
                await chai.expect(councilActionOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%councilActionDropFinancialReq  - non-council member (mallory) should not be able to access this entrypoint and create a new council action', async () => {
            try{

                // -----------------------------------------------------------------------------
                // Create Sample Council Action to be dropped
                // -----------------------------------------------------------------------------

                // initial storage
                councilStorage              = await councilInstance.storage();
                
                const fromTreasury          = contractDeployments.treasury.address;
                const receiverAddress       = councilAddress;
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const nextActionId          = councilStorage.actionCounter;

                governanceFinancialStorage  = await governanceFinancialInstance.storage();
                const requestId             = governanceFinancialStorage.financialRequestCounter;

                // Operation
                await helperFunctions.signerFactory(tezos, councilMemberOneSk)
                councilActionOperation = await councilInstance.methods.councilActionRequestMint(
                    fromTreasury,
                    receiverAddress,
                    tokenAmount,
                    purpose
                ).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                const action                        = await councilStorage.councilActionsLedger.get(nextActionId);
                const actionSigner                  = await councilStorage.councilActionsSigners.get({0: nextActionId, 1: councilMember})
                const dataMap                       = await action.dataMap;
                const packedTreasuryAddress         = (await utils.tezos.rpc.packData({ data: { string: fromTreasury }, type: { prim: 'address' } })).packed
                const packedReceiverAddress         = (await utils.tezos.rpc.packData({ data: { string: receiverAddress }, type: { prim: 'address' } })).packed
                const packedPurpose                 = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount             = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "requestMint");
                assert.equal(action.executed, false);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("treasuryAddress"), packedTreasuryAddress);
                assert.equal(dataMap.get("receiverAddress"), packedReceiverAddress);
                assert.equal(dataMap.get("purpose"), packedPurpose);
                assert.equal(dataMap.get("tokenAmount"), packedTokenAmount);

                // Sign action for subsequent testing of dropping a financial request
                await helperFunctions.signerFactory(tezos, councilMemberTwoSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                await helperFunctions.signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // -----------------------------------------------------------------------------

                // Set signer back to non-admin (mallory)
                await helperFunctions.signerFactory(tezos, mallory.sk);

                // Fail to create council action to drop a financial request
                councilActionOperation = councilInstance.methods.councilActionDropFinancialReq(requestId);                
                await chai.expect(councilActionOperation.send()).to.be.rejected;
            
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%signAction                     - non-council member (mallory) should not be able to access this entrypoint', async () => {
            try{
                
                // -----------------------------------------------------------------------------
                // Create Sample Council Action to be signed
                // -----------------------------------------------------------------------------

                // Initial Values
                councilStorage              = await councilInstance.storage();
                const fromTreasury          = contractDeployments.treasury.address;
                const receiverAddress       = councilAddress;
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const actionId              = councilStorage.actionCounter;

                // set signer as council member one
                await helperFunctions.signerFactory(tezos, councilMemberOneSk);

                // Operation
                councilActionOperation = await councilInstance.methods.councilActionRequestMint(
                    fromTreasury,
                    receiverAddress,
                    tokenAmount,
                    purpose).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage              = await councilInstance.storage();
                var action                  = await councilStorage.councilActionsLedger.get(actionId);
                var actionSigner            = await councilStorage.councilActionsSigners.get({0: actionId, 1: councilMember})
                var dataMap                 = await action.dataMap;
                const packedTreasuryAddress = (await utils.tezos.rpc.packData({ data: { string: fromTreasury }, type: { prim: 'address' } })).packed
                const packedReceiverAddress = (await utils.tezos.rpc.packData({ data: { string: receiverAddress }, type: { prim: 'address' } })).packed
                const packedPurpose         = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount     = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "requestMint");
                assert.equal(action.executed, false);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("treasuryAddress"), packedTreasuryAddress);
                assert.equal(dataMap.get("receiverAddress"), packedReceiverAddress);
                assert.equal(dataMap.get("purpose"), packedPurpose);
                assert.equal(dataMap.get("tokenAmount"), packedTokenAmount);

                // -----------------------------------------------------------------------------

                // Set signer back to non-admin(mallory)
                await helperFunctions.signerFactory(tezos, mallory.sk);

                // sign action operation fail
                councilActionOperation = councilInstance.methods.signAction(actionId);
                await chai.expect(councilActionOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%flushAction                    - non-council member (mallory) should not be able to access this entrypoint', async () => {
            try{
                
                // Create Sample Council Action to be flushed

                // Initial Values
                councilStorage              = await councilInstance.storage();
                const fromTreasury          = contractDeployments.treasury.address;
                const receiverAddress       = councilAddress;
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const actionId              = councilStorage.actionCounter;

                // set signer as council member one
                await helperFunctions.signerFactory(tezos, councilMemberOneSk);

                // Operation
                councilActionOperation = await councilInstance.methods.councilActionRequestMint(
                    fromTreasury,
                    receiverAddress,
                    tokenAmount,
                    purpose).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage              = await councilInstance.storage();
                var action                  = await councilStorage.councilActionsLedger.get(actionId);
                var actionSigner            = await councilStorage.councilActionsSigners.get({0: actionId, 1: councilMember})
                var dataMap                 = await action.dataMap;
                const packedTreasuryAddress = (await utils.tezos.rpc.packData({ data: { string: fromTreasury }, type: { prim: 'address' } })).packed
                const packedReceiverAddress = (await utils.tezos.rpc.packData({ data: { string: receiverAddress }, type: { prim: 'address' } })).packed
                const packedPurpose         = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount     = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "requestMint");
                assert.equal(action.executed, false);
                assert.notStrictEqual(actionSigner, undefined);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("treasuryAddress"), packedTreasuryAddress);
                assert.equal(dataMap.get("receiverAddress"), packedReceiverAddress);
                assert.equal(dataMap.get("purpose"), packedPurpose);
                assert.equal(dataMap.get("tokenAmount"), packedTokenAmount);

                // Set signer back to non-admin(mallory)
                await helperFunctions.signerFactory(tezos, mallory.sk);

                // sign action operation fail
                councilActionOperation = councilInstance.methods.flushAction(actionId);
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

                const setLambdaOperation = councilInstance.methods.setLambda(randomLambdaName, randomLambdaBytes); 
                await chai.expect(setLambdaOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

    })

});
