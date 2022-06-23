// const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
// const { InMemorySigner, importKey } = require("@taquito/signer");
// import assert, { ok, rejects, strictEqual } from "assert";
// import { Utils, MVK } from "./helpers/Utils";
// import fs from "fs";
// import { confirmOperation } from "../scripts/confirmation";

// const chai = require("chai");
// const chaiAsPromised = require('chai-as-promised');
// chai.use(chaiAsPromised);   
// chai.should();

// import env from "../env";
// import { bob, alice, eve, mallory, oscar, trudy, isaac, david, susie, ivan } from "../scripts/sandbox/accounts";

// import doormanAddress from '../deployments/doormanAddress.json';
// import delegationAddress from '../deployments/delegationAddress.json';
// import mvkTokenAddress from '../deployments/mvkTokenAddress.json';
// import councilAddress from '../deployments/councilAddress.json';
// import governanceAddress from '../deployments/governanceAddress.json';
// import governanceProxyAddress from '../deployments/governanceProxyAddress.json';
// import emergencyGovernanceAddress from '../deployments/emergencyGovernanceAddress.json';
// import breakGlassAddress from '../deployments/breakGlassAddress.json';
// import vestingAddress from '../deployments/vestingAddress.json';
// import treasuryAddress from '../deployments/treasuryAddress.json';

// describe("Break Glass tests", async () => {
//     var utils: Utils;

//     let doormanInstance;
//     let delegationInstance;
//     let mvkTokenInstance;
//     let councilInstance;
//     let governanceInstance;
//     let emergencyGovernanceInstance;
//     let breakGlassInstance;
//     let vestingInstance;
//     let treasuryInstance;

//     let doormanStorage;
//     let delegationStorage;
//     let mvkTokenStorage;
//     let councilStorage;
//     let governanceStorage;
//     let emergencyGovernanceStorage;
//     let breakGlassStorage;
//     let vestingStorage;
//     let treasuryStorage;
    
//     const signerFactory = async (pk) => {
//         await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
//         return utils.tezos;
//     };

//     before("setup", async () => {

//         utils = new Utils();
//         await utils.init(bob.sk);

//         doormanInstance    = await utils.tezos.contract.at(doormanAddress.address);
//         delegationInstance    = await utils.tezos.contract.at(delegationAddress.address);
//         mvkTokenInstance   = await utils.tezos.contract.at(mvkTokenAddress.address);
//         councilInstance   = await utils.tezos.contract.at(councilAddress.address);
//         governanceInstance = await utils.tezos.contract.at(governanceAddress.address);
//         emergencyGovernanceInstance    = await utils.tezos.contract.at(emergencyGovernanceAddress.address);
//         breakGlassInstance = await utils.tezos.contract.at(breakGlassAddress.address);
//         vestingInstance = await utils.tezos.contract.at(vestingAddress.address);
//         treasuryInstance = await utils.tezos.contract.at(treasuryAddress.address);
            
//         doormanStorage    = await doormanInstance.storage();
//         delegationStorage    = await delegationInstance.storage();
//         mvkTokenStorage   = await mvkTokenInstance.storage();
//         councilStorage   = await councilInstance.storage();
//         governanceStorage = await governanceInstance.storage();
//         emergencyGovernanceStorage = await emergencyGovernanceInstance.storage();
//         breakGlassStorage = await breakGlassInstance.storage();
//         vestingStorage = await vestingInstance.storage();
//         treasuryStorage = await treasuryInstance.storage();

//         console.log('-- -- -- -- -- Break Glass Tests -- -- -- --')
//         console.log('Doorman Contract deployed at:', doormanInstance.address);
//         console.log('Delegation Contract deployed at:', delegationInstance.address);
//         console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
//         console.log('Council Contract deployed at:', councilInstance.address);
//         console.log('Governance Contract deployed at:', governanceInstance.address);
//         console.log('Emergency Governance Contract deployed at:', emergencyGovernanceInstance.address);
//         console.log('Break Glass Contract deployed at:', breakGlassInstance.address);
//         console.log('Vesting Contract deployed at:', vestingInstance.address);
//         console.log('Treasury Contract deployed at:', treasuryInstance.address);
//         console.log('Bob address: ' + bob.pkh);
//         console.log('Alice address: ' + alice.pkh);
//         console.log('Eve address: ' + eve.pkh);
//         console.log('Mallory address: ' + mallory.pkh);
//         console.log('Oscar address: ' + oscar.pkh);
//         console.log('-- -- -- -- -- -- -- -- --')
//     });

//     describe("Glass not broken", async () => {
//         describe("%setAdmin", async () => {
//             beforeEach("Set signer to admin", async () => {
//                 await signerFactory(bob.sk)
//             });
//             it('Admin should be able to call this entrypoint and update the contract administrator with a new address', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage = await breakGlassInstance.storage();
//                     const currentAdmin = breakGlassStorage.admin;

//                     // Operation
//                     const setAdminOperation = await breakGlassInstance.methods.setAdmin(alice.pkh).send();
//                     await setAdminOperation.confirmation();

//                     // Final values
//                     breakGlassStorage = await breakGlassInstance.storage();
//                     const newAdmin = breakGlassStorage.admin;

//                     // reset admin
//                     await signerFactory(alice.sk);
//                     const resetAdminOperation = await breakGlassInstance.methods.setAdmin(bob.pkh).send();
//                     await resetAdminOperation.confirmation();

//                     // Assertions
//                     assert.notStrictEqual(newAdmin, currentAdmin);
//                     assert.strictEqual(newAdmin, alice.pkh);
//                     assert.strictEqual(currentAdmin, bob.pkh);
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('Non-admin should not be able to call this entrypoint', async () => {
//                 try{
//                     // Initial Values
//                     await signerFactory(alice.sk);
//                     breakGlassStorage = await breakGlassInstance.storage();
//                     const currentAdmin = breakGlassStorage.admin;

//                     // Operation
//                     await chai.expect(breakGlassInstance.methods.setAdmin(alice.pkh).send()).to.be.rejected;

//                     // Final values
//                     breakGlassStorage = await breakGlassInstance.storage();
//                     const newAdmin = breakGlassStorage.admin;

//                     // Assertions
//                     assert.strictEqual(newAdmin, currentAdmin);
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
//         });

//         describe("%updateConfig", async () => {
//             beforeEach("Set signer to admin", async () => {
//                 await signerFactory(bob.sk)
//             });

//             it('Admin should be able to call the entrypoint and configure the signer threshold', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage = await breakGlassInstance.storage();
//                     const newConfigValue = 1;

//                     // Operation
//                     const updateConfigOperation = await breakGlassInstance.methods.updateConfig(newConfigValue,"configThreshold").send();
//                     await updateConfigOperation.confirmation();

//                     // Final values
//                     breakGlassStorage = await breakGlassInstance.storage();
//                     const updateConfigValue = breakGlassStorage.config.threshold;

//                     // Assertions
//                     assert.equal(updateConfigValue, newConfigValue);
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('Admin should not be able to call the entrypoint and configure the signer threshold if it is greater than the amount of members in the council', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage = await breakGlassInstance.storage();
//                     const currentConfigValue = breakGlassStorage.config.threshold;
//                     const newConfigValue = 999
    
//                     // Operation
//                     await chai.expect(breakGlassInstance.methods.updateConfig(newConfigValue,"configThreshold").send()).to.be.rejected;
    
//                     // Final values
//                     breakGlassStorage = await breakGlassInstance.storage();
//                     const updateConfigValue = breakGlassStorage.config.threshold;
    
//                     // Assertions
//                     assert.notEqual(newConfigValue, currentConfigValue);
//                     assert.equal(updateConfigValue.toNumber(), currentConfigValue.toNumber());
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('Admin should be able to call the entrypoint and configure the action expiry in days', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage = await breakGlassInstance.storage();
//                     const newConfigValue = 1;

//                     // Operation
//                     const updateConfigOperation = await breakGlassInstance.methods.updateConfig(newConfigValue,"configActionExpiryDays").send();
//                     await updateConfigOperation.confirmation();

//                     // Final values
//                     breakGlassStorage = await breakGlassInstance.storage();
//                     const updateConfigValue = breakGlassStorage.config.actionExpiryDays;

//                     // Assertions
//                     assert.equal(updateConfigValue, newConfigValue);
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
    
//             it('Non-admin should not be able to call the entrypoint', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage = await breakGlassInstance.storage();
//                     const newConfigValue = 1;
    
//                     // Operation
//                     await signerFactory(alice.sk);
//                     await chai.expect(breakGlassInstance.methods.updateConfig(newConfigValue,"configThreshold").send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
//         });

//         describe("%updateCouncilMemberInfo", async () => {
//             beforeEach("Set signer to council member", async () => {
//                 await signerFactory(bob.sk)
//             });
//             it('Council member should be able to call this entrypoint and update its information', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage          = await breakGlassInstance.storage();
//                     var councilMember       = breakGlassStorage.councilMembers.get(bob.pkh);
//                     const oldMemberName     = councilMember.name
//                     const oldMemberImage    = councilMember.image
//                     const oldMemberWebsite  = councilMember.website
//                     const newMemberName     = "Member Name";
//                     const newMemberImage    = "Member Image";
//                     const newMemberWebsite  = "Member Website";

//                     // Operation
//                     const updateOperation = await breakGlassInstance.methods.updateCouncilMemberInfo(newMemberName, newMemberWebsite, newMemberImage).send();
//                     await updateOperation.confirmation();

//                     // Final values
//                     breakGlassStorage  = await breakGlassInstance.storage();
//                     councilMember   = breakGlassStorage.councilMembers.get(bob.pkh);

//                     // Assertions
//                     assert.strictEqual(councilMember.name, newMemberName);
//                     assert.strictEqual(councilMember.image, newMemberImage);
//                     assert.strictEqual(councilMember.website, newMemberWebsite);
//                     assert.notStrictEqual(councilMember.name, oldMemberName);
//                     assert.notStrictEqual(councilMember.image, oldMemberImage);
//                     assert.notStrictEqual(councilMember.website, oldMemberWebsite);
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('Non-council member should not be able to call this entrypoint', async () => {
//                 try{
//                     // Initial Values
//                     await signerFactory(oscar.sk);
//                     breakGlassStorage = await breakGlassInstance.storage();
//                     const newMemberName     = "Member Name";
//                     const newMemberImage    = "Member Image";
//                     const newMemberWebsite  = "Member Website";

//                     // Operation
//                     await chai.expect(breakGlassInstance.methods.updateCouncilMemberInfo(newMemberName, newMemberWebsite, newMemberImage).send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
//         });

//         describe("%addCouncilMember", async () => {
//             beforeEach("Set signer to council member", async () => {
//                 await signerFactory(alice.sk)
//             });

//             it('Council member should be able to access this entrypoint and create a new action to add a council member (the action counter should increase in the storage)', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const councilMember     = oscar.pkh;
//                     const newMemberName     = "Member Name";
//                     const newMemberImage    = "Member Image";
//                     const newMemberWebsite  = "Member Website";
//                     const nextActionID      = breakGlassStorage.actionCounter;

//                     // Operation
//                     const newActionOperation = await breakGlassInstance.methods.addCouncilMember(councilMember, newMemberName, newMemberWebsite, newMemberImage).send();
//                     await newActionOperation.confirmation();

//                     // Final values
//                     breakGlassStorage   = await breakGlassInstance.storage();
//                     const action        = await breakGlassStorage.actionsLedger.get(nextActionID);
//                     const actionSigner  = action.signers.includes(alice.pkh)
//                     const addressMap    = await action.addressMap;
//                     const stringMap     = await action.stringMap;

//                     // Assertions
//                     assert.strictEqual(action.initiator, alice.pkh);
//                     assert.strictEqual(action.status, "PENDING");
//                     assert.strictEqual(action.actionType, "addCouncilMember");
//                     assert.equal(action.executed, false);
//                     assert.equal(actionSigner, true);
//                     assert.equal(action.signersCount, 1);
//                     assert.equal(addressMap.get("councilMemberAddress"), councilMember);
//                     assert.equal(stringMap.get("councilMemberName"), newMemberName);
//                     assert.equal(stringMap.get("councilMemberWebsite"), newMemberWebsite);
//                     assert.equal(stringMap.get("councilMemberImage"), newMemberImage);
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('Council member should not be able to access this entrypoint if the given member’s address is already in the council', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const councilMember     = alice.pkh;
//                     const newMemberName     = "Member Name";
//                     const newMemberImage    = "Member Image";
//                     const newMemberWebsite  = "Member Website";

//                     // Operation
//                     await chai.expect(breakGlassInstance.methods.addCouncilMember(councilMember, newMemberName, newMemberWebsite, newMemberImage).send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('Non-council member should not be able to access this entrypoint', async () => {
//                 try{
//                     // Initial Values
//                     await signerFactory(oscar.sk);
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const councilMember     = oscar.pkh;
//                     const newMemberName     = "Member Name";
//                     const newMemberImage    = "Member Image";
//                     const newMemberWebsite  = "Member Website";

//                     // Operation
//                     await chai.expect(breakGlassInstance.methods.addCouncilMember(councilMember, newMemberName, newMemberWebsite, newMemberImage).send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
//         })

//         describe("%removeCouncilMember", async () => {
//             beforeEach("Set signer to council member", async () => {
//                 await signerFactory(alice.sk)
//             });

//             it('Council member should be able to access this entrypoint and create a new action to remove a council member (the action counter should increase in the storage)', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const councilMember     = bob.pkh;
//                     const nextActionID      = breakGlassStorage.actionCounter;

//                     // Operation
//                     const newActionOperation = await breakGlassInstance.methods.removeCouncilMember(councilMember).send();
//                     await newActionOperation.confirmation();

//                     // Final values
//                     breakGlassStorage   = await breakGlassInstance.storage();
//                     const action        = await breakGlassStorage.actionsLedger.get(nextActionID);
//                     const actionSigner  = action.signers.includes(alice.pkh)
//                     const addressMap    = await action.addressMap;

//                     // Assertions
//                     assert.strictEqual(action.initiator, alice.pkh);
//                     assert.strictEqual(action.status, "PENDING");
//                     assert.strictEqual(action.actionType, "removeCouncilMember");
//                     assert.equal(action.executed, false);
//                     assert.equal(actionSigner, true);
//                     assert.equal(action.signersCount, 1);
//                     assert.equal(addressMap.get("councilMemberAddress"), councilMember);
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('Council member should not be able to access this entrypoint if the threshold is greater than the expected amount of members in the council', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage           = await breakGlassInstance.storage();
//                     const councilMember         = bob.pkh;
//                     const councilMembersAmount  = breakGlassStorage.councilMembers.size;

//                     // Set threshold to council members
//                     await signerFactory(bob.sk);
//                     var updateConfigOperation = await breakGlassInstance.methods.updateConfig(councilMembersAmount,"configThreshold").send();
//                     await updateConfigOperation.confirmation();

//                     // Operation
//                     await signerFactory(alice.sk);
//                     await chai.expect(breakGlassInstance.methods.removeCouncilMember(councilMember).send()).to.be.rejected;

//                     // Final values
//                     breakGlassStorage   = await breakGlassInstance.storage();
//                     const threshold     = breakGlassStorage.config.threshold

//                     // Assertions
//                     assert.equal(threshold, councilMembersAmount);

//                     // Reset threshold
//                     await signerFactory(bob.sk);
//                     updateConfigOperation = await breakGlassInstance.methods.updateConfig(2,"configThreshold").send();
//                     await updateConfigOperation.confirmation();
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('Council member should not be able to access this entrypoint if the given member’s address is not in the council', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const councilMember     = oscar.pkh;

//                     // Operation
//                     await chai.expect(breakGlassInstance.methods.removeCouncilMember(councilMember).send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('Non-council member should not be able to access this entrypoint', async () => {
//                 try{
//                     // Initial Values
//                     await signerFactory(oscar.sk);
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const councilMember     = bob.pkh;

//                     // Operation
//                     await chai.expect(breakGlassInstance.methods.removeCouncilMember(councilMember).send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
//         })


//         describe("%changeCouncilMember", async () => {
//             beforeEach("Set signer to council member", async () => {
//                 await signerFactory(alice.sk)
//             });

//             it('Council member should be able to access this entrypoint and create a new action to replace a council member by another (the action counter should increase in the storage)', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage           = await breakGlassInstance.storage();
//                     const oldCouncilMember      = bob.pkh;
//                     const newCouncilMember      = oscar.pkh;
//                     const newMemberName         = "Member Name";
//                     const newMemberImage        = "Member Image";
//                     const newMemberWebsite      = "Member Website";
//                     const nextActionID          = breakGlassStorage.actionCounter;

//                     // Operation
//                     const newActionOperation = await breakGlassInstance.methods.changeCouncilMember(oldCouncilMember, newCouncilMember, newMemberName, newMemberWebsite, newMemberImage).send();
//                     await newActionOperation.confirmation();

//                     // Final values
//                     breakGlassStorage   = await breakGlassInstance.storage();
//                     const action        = await breakGlassStorage.actionsLedger.get(nextActionID);
//                     const actionSigner  = action.signers.includes(alice.pkh)
//                     const addressMap    = await action.addressMap;
//                     const stringMap     = await action.stringMap;

//                     // Assertions
//                     assert.strictEqual(action.initiator, alice.pkh);
//                     assert.strictEqual(action.status, "PENDING");
//                     assert.strictEqual(action.actionType, "changeCouncilMember");
//                     assert.equal(action.executed, false);
//                     assert.equal(actionSigner, true);
//                     assert.equal(action.signersCount, 1);
//                     assert.equal(addressMap.get("oldCouncilMemberAddress"), oldCouncilMember);
//                     assert.equal(addressMap.get("newCouncilMemberAddress"), newCouncilMember);
//                     assert.equal(stringMap.get("newCouncilMemberName"), newMemberName);
//                     assert.equal(stringMap.get("newCouncilMemberWebsite"), newMemberWebsite);
//                     assert.equal(stringMap.get("newCouncilMemberImage"), newMemberImage);
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('Council member should not be able to access this entrypoint if the given old member’s address is not in the council', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage           = await breakGlassInstance.storage();
//                     const oldCouncilMember      = mallory.pkh;
//                     const newCouncilMember      = oscar.pkh;
//                     const newMemberName         = "Member Name";
//                     const newMemberImage        = "Member Image";
//                     const newMemberWebsite      = "Member Website";

//                     // Operation
//                     await chai.expect(breakGlassInstance.methods.changeCouncilMember(oldCouncilMember, newCouncilMember, newMemberName, newMemberWebsite, newMemberImage).send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('Council member should not be able to access this entrypoint if the given new member’s address is already in the council', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage           = await breakGlassInstance.storage();
//                     const oldCouncilMember      = bob.pkh;
//                     const newCouncilMember      = alice.pkh;
//                     const newMemberName         = "Member Name";
//                     const newMemberImage        = "Member Image";
//                     const newMemberWebsite      = "Member Website";

//                     // Operation
//                     await chai.expect(breakGlassInstance.methods.changeCouncilMember(oldCouncilMember, newCouncilMember, newMemberName, newMemberWebsite, newMemberImage).send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('Non-council member should not be able to access this entrypoint', async () => {
//                 try{
//                     // Initial Values
//                     await signerFactory(oscar.sk);
//                     breakGlassStorage           = await breakGlassInstance.storage();
//                     const oldCouncilMember      = bob.pkh;
//                     const newCouncilMember      = oscar.pkh;
//                     const newMemberName         = "Member Name";
//                     const newMemberImage        = "Member Image";
//                     const newMemberWebsite      = "Member Website";

//                     // Operation
//                     await chai.expect(breakGlassInstance.methods.changeCouncilMember(oldCouncilMember, newCouncilMember, newMemberName, newMemberWebsite, newMemberImage).send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
//         })

//         describe("%setSingleContractAdmin", async () => {

//             beforeEach("Set signer to council member", async () => {
//                 await signerFactory(alice.sk)
//             });

//             it('Council member should not be able to access this entrypoint if glass was not broken', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const newAdmin          = oscar.pkh;
//                     const targetContract    = doormanAddress.address;
//                     const glassBroken       = breakGlassStorage.glassBroken;

//                     // Operation
//                     await chai.expect(breakGlassInstance.methods.setSingleContractAdmin(newAdmin, targetContract).send()).to.be.rejected;
//                     assert.equal(glassBroken, false);
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
//         });

//         describe("%setAllContractsAdmin", async () => {

//             beforeEach("Set signer to council member", async () => {
//                 await signerFactory(alice.sk)
//             });

//             it('Council member should not be able to access this entrypoint if glass was not broken', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const newAdmin          = oscar.pkh;
//                     const glassBroken       = breakGlassStorage.glassBroken;

//                     // Operation
//                     await chai.expect(breakGlassInstance.methods.setAllContractsAdmin(newAdmin).send()).to.be.rejected;
//                     assert.equal(glassBroken, false);
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
//         });

//         describe("%pauseAllEntrypoints", async () => {

//             beforeEach("Set signer to council member", async () => {
//                 await signerFactory(alice.sk)
//             });

//             it('Council member should not be able to access this entrypoint if glass was not broken', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const glassBroken       = breakGlassStorage.glassBroken;

//                     // Operation
//                     await chai.expect(breakGlassInstance.methods.pauseAllEntrypoints().send()).to.be.rejected;
//                     assert.equal(glassBroken, false);
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
//         });

//         describe("%unpauseAllEntrypoints", async () => {

//             beforeEach("Set signer to council member", async () => {
//                 await signerFactory(alice.sk)
//             });

//             it('Council member should not be able to access this entrypoint if glass was not broken', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const glassBroken       = breakGlassStorage.glassBroken;

//                     // Operation
//                     await chai.expect(breakGlassInstance.methods.unpauseAllEntrypoints().send()).to.be.rejected;
//                     assert.equal(glassBroken, false);
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
//         });

//         describe("%removeBreakGlassControl", async () => {

//             beforeEach("Set signer to council member", async () => {
//                 await signerFactory(alice.sk)
//             });

//             it('Council member should not be able to access this entrypoint if glass was not broken', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const glassBroken       = breakGlassStorage.glassBroken;

//                     // Operation
//                     await chai.expect(breakGlassInstance.methods.removeBreakGlassControl().send()).to.be.rejected;
//                     assert.equal(glassBroken, false);
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
//         });

//         describe("%setAllContractsAdmin", async () => {

//             beforeEach("Set signer to council member", async () => {
//                 await signerFactory(alice.sk)
//             });

//             it('Council member should not be able to access this entrypoint if glass was not broken', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const newAdmin          = oscar.pkh;

//                     // Operation
//                     await chai.expect(breakGlassInstance.methods.setAllContractsAdmin(newAdmin).send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
//         });




//         describe("%signAction", async () => {

//             beforeEach("Set signer to council member", async () => {
//                 await signerFactory(alice.sk)
//             });

//             it('pauseAllEntrypoints --> should fail if glass not broken', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const nextActionID      = breakGlassStorage.actionCounter;

//                     // Operation
//                     await chai.expect(breakGlassInstance.methods.pauseAllEntrypoints().send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('unpauseAllEntrypoints --> should fail if glass not broken', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const nextActionID      = breakGlassStorage.actionCounter;

//                     // Operation
//                     await chai.expect(breakGlassInstance.methods.unpauseAllEntrypoints().send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('setSingleContractAdmin --> should fail if glass not broken', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const nextActionID      = breakGlassStorage.actionCounter;
//                     const newAdmin          = oscar.pkh;
//                     const targetContract    = doormanAddress.address;

//                     // Operation
//                     await chai.expect(breakGlassInstance.methods.setSingleContractAdmin(newAdmin, targetContract).send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('setAllContractAdmin --> should fail if glass not broken', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const nextActionID      = breakGlassStorage.actionCounter;
//                     const newAdmin          = bob.pkh;

//                     // Operation
//                     await chai.expect(breakGlassInstance.methods.setAllContractsAdmin(newAdmin).send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('removeBreakGlassControl --> should fail if glass not broken', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const nextActionID      = breakGlassStorage.actionCounter;

//                     // Operation
//                     await chai.expect(breakGlassInstance.methods.removeBreakGlassControl().send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
//         })

//         describe("%breakGlass", async () => {
//             beforeEach("Set signer to council member", async () => {
//                 await signerFactory(alice.sk)
//             });

//             it('Other contracts should not be able to access this entrypoint and trigger breakGlass', async () => {
//                 try{
//                     // Operation
//                     await chai.expect(breakGlassInstance.methods.breakGlass().send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('Emergency Governance contract should be able to access this entrypoint and trigger breakGlass', async () => {
//                 try{
//                     // Initial Values
//                     emergencyGovernanceStorage  = await emergencyGovernanceInstance.storage();
//                     const emergencyID           = emergencyGovernanceStorage.currentEmergencyGovernanceId;
//                     var emergencyProposal       = await emergencyGovernanceStorage.emergencyGovernanceLedger.get(emergencyID);

//                     // Set all contracts admin to governance address if it is not
//                     await signerFactory(bob.sk);
//                     governanceStorage             = await governanceInstance.storage();
//                     var generalContracts          = governanceStorage.generalContracts.entries();
//                     var updateConfigOperation     = await emergencyGovernanceInstance.methods.updateConfig(1,"configStakedMvkPercentRequired").send();
//                     await updateConfigOperation.confirmation();
//                     updateConfigOperation         = await emergencyGovernanceInstance.methods.updateConfig(0,"configRequiredFeeMutez").send();
//                     await updateConfigOperation.confirmation();

//                     var setAdminOperation         = await governanceInstance.methods.setAdmin(governanceProxyAddress.address).send();
//                     await setAdminOperation.confirmation();

//                     for (let entry of generalContracts){
//                         // Get contract storage
//                         var contract        = await utils.tezos.contract.at(entry[1]);
//                         var storage:any     = await contract.storage();

//                         // Check admin
//                         if(storage.hasOwnProperty('admin') && storage.admin!==governanceProxyAddress.address){
//                             setAdminOperation   = await contract.methods.setAdmin(governanceProxyAddress.address).send();
//                             await setAdminOperation.confirmation()
//                         }
//                     }

//                     // User stake more to trigger break glass
//                     await signerFactory(mallory.sk);
//                     const stakeAmount           = MVK(10)
//                     const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//                     {
//                         add_operator: {
//                             owner: mallory.pkh,
//                             operator: doormanAddress.address,
//                             token_id: 0,
//                         },
//                     }])
//                     .send()
//                     await updateOperatorsOperation.confirmation();
        
//                     const stakeOperation    = await doormanInstance.methods.stake(stakeAmount).send();
//                     await stakeOperation.confirmation();

//                     const stakeRecord       = await doormanStorage.userStakeBalanceLedger.get(mallory.pkh);
//                     assert.notEqual(stakeRecord.balance, 0);

//                     const emergencyControlOperation = await emergencyGovernanceInstance.methods.triggerEmergencyControl(
//                         "Test emergency governance", 
//                         "For tests"
//                     ).send({amount: 0});
//                     await emergencyControlOperation.confirmation();
                    
//                     const voteOperation     = await emergencyGovernanceInstance.methods.voteForEmergencyControl().send();
//                     await voteOperation.confirmation();

//                     // Check if glass was broken
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const glassBroken       = breakGlassStorage.glassBroken;
//                     assert.equal(glassBroken, true);

//                     // Propagate break glass
//                     await signerFactory(bob.sk)
//                     breakGlassStorage   = await breakGlassInstance.storage();
//                     var breakGlassActionID    = breakGlassStorage.actionCounter;
//                     const propagateActionOperation    = await breakGlassInstance.methods.propagateBreakGlass().send();
//                     await propagateActionOperation.confirmation();
                    
//                     // Sign action propagate action
//                     await signerFactory(alice.sk);
//                     var signActionOperation   = await breakGlassInstance.methods.signAction(breakGlassActionID).send();
//                     await signActionOperation.confirmation();
//                     await signerFactory(eve.sk);
//                     signActionOperation   = await breakGlassInstance.methods.signAction(breakGlassActionID).send();
//                     await signActionOperation.confirmation();
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
//         });
//     });

//     describe("Glass broken", async () => {

//         describe("%setSingleContractAdmin", async () => {

//             beforeEach("Set signer to council member", async () => {
//                 await signerFactory(alice.sk)
//             });

//             it('Council member should be able to access this entrypoint and create a new action to update the admin in one contract (the action counter should increase in the storage)', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     doormanStorage          = await doormanInstance.storage();
//                     const nextActionID      = breakGlassStorage.actionCounter;
//                     const newAdmin          = bob.pkh;
//                     const targetContract    = doormanAddress.address;

//                     // Operation
//                     const newActionOperation = await breakGlassInstance.methods.setSingleContractAdmin(newAdmin, targetContract).send();
//                     await newActionOperation.confirmation();

//                     // Final values
//                     breakGlassStorage   = await breakGlassInstance.storage();
//                     const action        = await breakGlassStorage.actionsLedger.get(nextActionID);
//                     const actionSigner  = action.signers.includes(alice.pkh)
//                     const addressMap    = await action.addressMap;

//                     // Assertions
//                     assert.strictEqual(action.initiator, alice.pkh);
//                     assert.strictEqual(action.status, "PENDING");
//                     assert.strictEqual(action.actionType, "setSingleContractAdmin");
//                     assert.equal(action.executed, false);
//                     assert.equal(actionSigner, true);
//                     assert.equal(action.signersCount, 1);
//                     assert.equal(addressMap.get("newAdminAddress"), newAdmin);
//                     assert.equal(addressMap.get("targetContractAddress"), targetContract);
//                     assert.equal(breakGlassStorage.glassBroken, true);
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('Council member should not be able to access this entrypoint if the provided contract does not have a setAdmin entrypoint', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const newAdmin          = oscar.pkh;
//                     const targetContract    = trudy.pkh;

//                     // Operation
//                     await chai.expect(breakGlassInstance.methods.setSingleContractAdmin(newAdmin, targetContract).send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('Non-council member should not be able to access this entrypoint', async () => {
//                 try{
//                     // Initial Values
//                     await signerFactory(mallory.sk);
//                     const newAdmin          = oscar.pkh;
//                     const targetContract    = doormanAddress.address;

//                     // Operation
//                     await chai.expect(breakGlassInstance.methods.setSingleContractAdmin(newAdmin, targetContract).send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
//         })

//         describe("%setAllContractsAdmin", async () => {

//             beforeEach("Set signer to council member", async () => {
//                 await signerFactory(alice.sk)
//             });

//             it('Council member should be able to access this entrypoint and create a new action to update the admin in all contracts (the action counter should increase in the storage)', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const nextActionID      = breakGlassStorage.actionCounter;
//                     const newAdmin          = bob.pkh;

//                     // Operation
//                     const newActionOperation = await breakGlassInstance.methods.setAllContractsAdmin(newAdmin).send();
//                     await newActionOperation.confirmation();

//                     // Final values
//                     breakGlassStorage   = await breakGlassInstance.storage();
//                     const action        = await breakGlassStorage.actionsLedger.get(nextActionID);
//                     const actionSigner  = action.signers.includes(alice.pkh)
//                     const addressMap    = await action.addressMap;

//                     // Assertions
//                     assert.strictEqual(action.initiator, alice.pkh);
//                     assert.strictEqual(action.status, "PENDING");
//                     assert.strictEqual(action.actionType, "setAllContractsAdmin");
//                     assert.equal(action.executed, false);
//                     assert.equal(actionSigner, true);
//                     assert.equal(action.signersCount, 1);
//                     assert.equal(addressMap.get("newAdminAddress"), newAdmin);
//                     assert.equal(breakGlassStorage.glassBroken, true);
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('Non-council member should not be able to access this entrypoint', async () => {
//                 try{
//                     // Initial Values
//                     await signerFactory(mallory.sk);
//                     const newAdmin          = oscar.pkh;

//                     // Operation
//                     await chai.expect(breakGlassInstance.methods.setAllContractsAdmin(newAdmin).send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
//         })

//         describe("%pauseAllEntrypoints", async () => {

//             beforeEach("Set signer to council member", async () => {
//                 await signerFactory(alice.sk)
//             });

//             it('Council member should be able to access this entrypoint and create a new action to pause entrypoints in all contracts (the action counter should increase in the storage)', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const nextActionID      = breakGlassStorage.actionCounter;

//                     // Operation
//                     const newActionOperation = await breakGlassInstance.methods.pauseAllEntrypoints().send();
//                     await newActionOperation.confirmation();

//                     // Final values
//                     breakGlassStorage   = await breakGlassInstance.storage();
//                     const action        = await breakGlassStorage.actionsLedger.get(nextActionID);
//                     const actionSigner  = action.signers.includes(alice.pkh)

//                     // Assertions
//                     assert.strictEqual(action.initiator, alice.pkh);
//                     assert.strictEqual(action.status, "PENDING");
//                     assert.strictEqual(action.actionType, "pauseAllEntrypoints");
//                     assert.equal(action.executed, false);
//                     assert.equal(actionSigner, true);
//                     assert.equal(action.signersCount, 1);
//                     assert.equal(breakGlassStorage.glassBroken, true);
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('Non-council member should not be able to access this entrypoint', async () => {
//                 try{
//                     // Initial Values
//                     await signerFactory(mallory.sk);
//                     const newAdmin          = oscar.pkh;

//                     // Operation
//                     await chai.expect(breakGlassInstance.methods.setAllContractsAdmin(newAdmin).send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
//         })

//         describe("%unpauseAllEntrypoints", async () => {

//             beforeEach("Set signer to council member", async () => {
//                 await signerFactory(alice.sk)
//             });

//             it('Council member should be able to access this entrypoint and create a new action to unpause entrypoints in all contracts (the action counter should increase in the storage)', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const nextActionID      = breakGlassStorage.actionCounter;

//                     // Operation
//                     const newActionOperation = await breakGlassInstance.methods.unpauseAllEntrypoints().send();
//                     await newActionOperation.confirmation();

//                     // Final values
//                     breakGlassStorage   = await breakGlassInstance.storage();
//                     const action        = await breakGlassStorage.actionsLedger.get(nextActionID);
//                     const actionSigner  = action.signers.includes(alice.pkh)

//                     // Assertions
//                     assert.strictEqual(action.initiator, alice.pkh);
//                     assert.strictEqual(action.status, "PENDING");
//                     assert.strictEqual(action.actionType, "unpauseAllEntrypoints");
//                     assert.equal(action.executed, false);
//                     assert.equal(actionSigner, true);
//                     assert.equal(action.signersCount, 1);
//                     assert.equal(breakGlassStorage.glassBroken, true);
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('Non-council member should not be able to access this entrypoint', async () => {
//                 try{
//                     // Initial Values
//                     await signerFactory(mallory.sk);
//                     const newAdmin          = oscar.pkh;

//                     // Operation
//                     await chai.expect(breakGlassInstance.methods.setAllContractsAdmin(newAdmin).send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
//         })

//         describe("%removeBreakGlassControl", async () => {

//             beforeEach("Set signer to council member", async () => {
//                 await signerFactory(alice.sk)
//             });

//             it('Council member should be able to access this entrypoint and create a new action to remove the break glass control (the action counter should increase in the storage)', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const nextActionID      = breakGlassStorage.actionCounter;

//                     // Operation
//                     const newActionOperation = await breakGlassInstance.methods.removeBreakGlassControl().send();
//                     await newActionOperation.confirmation();

//                     // Final values
//                     breakGlassStorage   = await breakGlassInstance.storage();
//                     const action        = await breakGlassStorage.actionsLedger.get(nextActionID);
//                     const actionSigner  = action.signers.includes(alice.pkh)

//                     // Assertions
//                     assert.strictEqual(action.initiator, alice.pkh);
//                     assert.strictEqual(action.status, "PENDING");
//                     assert.strictEqual(action.actionType, "removeBreakGlassControl");
//                     assert.equal(action.executed, false);
//                     assert.equal(actionSigner, true);
//                     assert.equal(action.signersCount, 1);
//                     assert.equal(breakGlassStorage.glassBroken, true);
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('Non-council member should not be able to access this entrypoint', async () => {
//                 try{
//                     // Initial Values
//                     await signerFactory(mallory.sk);
//                     const newAdmin          = oscar.pkh;

//                     // Operation
//                     await chai.expect(breakGlassInstance.methods.setAllContractsAdmin(newAdmin).send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
//         })

//         describe("%flushAction", async () => {

//             beforeEach("Set signer to council member", async () => {
//                 await signerFactory(alice.sk)
//             });

//             it('Council member should be able to access this entrypoint with a correct actionID and create a new action to flush a pending action (the action counter should increase in the storage)', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const nextActionID      = breakGlassStorage.actionCounter;
//                     const flushedAction     = 1;

//                     // Operation
//                     const newActionOperation = await breakGlassInstance.methods.flushAction(flushedAction).send();
//                     await newActionOperation.confirmation();

//                     // Final values
//                     breakGlassStorage   = await breakGlassInstance.storage();
//                     const action        = await breakGlassStorage.actionsLedger.get(nextActionID);
//                     const actionSigner  = action.signers.includes(alice.pkh)
//                     const natMap        = await action.natMap;

//                     // Assertions
//                     assert.strictEqual(action.initiator, alice.pkh);
//                     assert.strictEqual(action.status, "PENDING");
//                     assert.strictEqual(action.actionType, "flushAction");
//                     assert.equal(action.executed, false);
//                     assert.equal(actionSigner, true);
//                     assert.equal(action.signersCount, 1);
//                     assert.equal(breakGlassStorage.glassBroken, true);
//                     assert.equal(natMap.get("actionId"), flushedAction);
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('Non-council member should not be able to access this entrypoint', async () => {
//                 try{
//                     // Initial Values
//                     await signerFactory(mallory.sk);
//                     const flushedAction     = 1;

//                     // Operation
//                     await chai.expect(breakGlassInstance.methods.flushAction(flushedAction).send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('Council member should not be able to access this entrypoint if the action linked to the provided actionID doesn’t exist', async () => {
//                 try{
//                     // Initial Values
//                     const flushedAction     = 9999;

//                     // Operation
//                     await chai.expect(breakGlassInstance.methods.flushAction(flushedAction).send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('Council member should not be able to access this entrypoint if the action linked to the provided actionID was flushed', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const councilMember     = oscar.pkh;
//                     const newMemberName     = "Member Name";
//                     const newMemberImage    = "Member Image";
//                     const newMemberWebsite  = "Member Website";
//                     var flushActionId       = breakGlassStorage.actionCounter;

//                     // Operation
//                     const flusedActionOperation = await breakGlassInstance.methods.addCouncilMember(councilMember, newMemberName, newMemberWebsite, newMemberImage).send();
//                     await flusedActionOperation.confirmation();

//                     // Mid Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const nextActionID      = breakGlassStorage.actionCounter;

//                     // Operation
//                     const newActionOperation = await breakGlassInstance.methods.flushAction(flushActionId).send();
//                     await newActionOperation.confirmation();

//                     // Operation
//                     await signerFactory(bob.sk);
//                     const signOperation = await breakGlassInstance.methods.signAction(nextActionID).send();
//                     await signOperation.confirmation();

//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const executedAction    = await breakGlassStorage.actionsLedger.get(nextActionID);
//                     const flushedAction     = await breakGlassStorage.actionsLedger.get(flushActionId);
//                     const signerThreshold   = breakGlassStorage.config.threshold;

//                     assert.equal(executedAction.executed, true);
//                     assert.equal(executedAction.signersCount.toNumber(), signerThreshold.toNumber());
//                     assert.equal(executedAction.status, "EXECUTED");

//                     assert.equal(flushedAction.executed, false);
//                     assert.equal(flushedAction.status, "FLUSHED");

//                     // Operation
//                     await chai.expect(breakGlassInstance.methods.flushAction(flushActionId).send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });


//             it('Council member should not be able to access this entrypoint if the action linked to the provided actionID was executed', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const councilMember     = isaac.pkh;
//                     const newMemberName     = "Member Name";
//                     const newMemberImage    = "Member Image";
//                     const newMemberWebsite  = "Member Website";
//                     const nextActionID      = breakGlassStorage.actionCounter;

//                     // Operation
//                     const newActionOperation = await breakGlassInstance.methods.addCouncilMember(councilMember, newMemberName, newMemberWebsite, newMemberImage).send();
//                     await newActionOperation.confirmation();

//                     // Create the same action for the following test
//                     const duplicatedActionOperation = await breakGlassInstance.methods.addCouncilMember(councilMember, newMemberName, newMemberWebsite, newMemberImage).send();
//                     await duplicatedActionOperation.confirmation();

//                     // Final values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     var action              = await breakGlassStorage.actionsLedger.get(nextActionID);
//                     const actionSigner      = action.signers.includes(alice.pkh)
//                     const addressMap        = await action.addressMap;
//                     const stringMap         = await action.stringMap;
//                     const signerThreshold   = breakGlassStorage.config.threshold;

//                     // Assertions
//                     assert.strictEqual(action.initiator, alice.pkh);
//                     assert.strictEqual(action.status, "PENDING");
//                     assert.strictEqual(action.actionType, "addCouncilMember");
//                     assert.equal(action.executed, false);
//                     assert.equal(actionSigner, true);
//                     assert.equal(action.signersCount, 1);
//                     assert.equal(addressMap.get("councilMemberAddress"), councilMember);
//                     assert.equal(stringMap.get("councilMemberName"), newMemberName);
//                     assert.equal(stringMap.get("councilMemberImage"), newMemberImage);
//                     assert.equal(stringMap.get("councilMemberWebsite"), newMemberWebsite);

//                     // Operation
//                     await signerFactory(bob.sk);
//                     const signOperation = await breakGlassInstance.methods.signAction(nextActionID).send();
//                     await signOperation.confirmation();

//                     // Final values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     action                  = await breakGlassStorage.actionsLedger.get(nextActionID);

//                     const newCouncilStorage = breakGlassStorage.councilMembers.has(isaac.pkh)

//                     assert.equal(action.executed, true);
//                     assert.equal(action.signersCount.toNumber(), signerThreshold.toNumber());
//                     assert.equal(action.status, "EXECUTED");
//                     assert.equal(newCouncilStorage, true);

//                     // Operation
//                     await signerFactory(alice.sk);
//                     await chai.expect(breakGlassInstance.methods.flushAction(nextActionID).send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
//         })

//         describe("%signAction", async () => {

//             before("Set breakGlass admin to Bob for various tests", async() => {
//                 try{
//                     breakGlassStorage               = await breakGlassInstance.storage();
//                     const nextActionID              = breakGlassStorage.actionCounter;

//                     var setContractAdminOperation   = await breakGlassInstance.methods.setSingleContractAdmin(bob.pkh, breakGlassAddress.address).send();
//                     await setContractAdminOperation.confirmation();

//                     await signerFactory(eve.sk);
//                     var voteOperation   = await breakGlassInstance.methods.signAction(nextActionID).send();
//                     await voteOperation.confirmation();

//                     await signerFactory(bob.sk);
//                     var updateConfigOperation = await breakGlassInstance.methods.updateConfig(1,"configActionExpiryDays").send();
//                     await updateConfigOperation.confirmation();
    
//                     await signerFactory(alice.sk);
//                 } catch (e) {
//                     console.dir(e, {depth: 5});
//                 }
//             })

//             beforeEach("Set signer to council member", async () => {
//                 await signerFactory(alice.sk)
//             });

//             it('Council member should not be able to sign the same action twice or more', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const councilMember     = oscar.pkh;
//                     const newMemberName     = "Member Name";
//                     const newMemberImage    = "Member Image";
//                     const newMemberWebsite  = "Member Website";
//                     const nextActionID      = breakGlassStorage.actionCounter;

//                     // Operation
//                     const newActionOperation = await breakGlassInstance.methods.addCouncilMember(councilMember, newMemberName, newMemberWebsite, newMemberImage).send();
//                     await newActionOperation.confirmation();

//                     // Create the same action for the following test
//                     const duplicatedActionOperation = await breakGlassInstance.methods.addCouncilMember(councilMember, newMemberName, newMemberWebsite, newMemberImage).send();
//                     await duplicatedActionOperation.confirmation();

//                     // Final values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     var action              = await breakGlassStorage.actionsLedger.get(nextActionID);
//                     const actionSigner      = action.signers.includes(alice.pkh)
//                     const addressMap        = await action.addressMap;
//                     const stringMap        = await action.stringMap;
//                     const signerThreshold   = breakGlassStorage.config.threshold;

//                     // Assertions
//                     assert.strictEqual(action.initiator, alice.pkh);
//                     assert.strictEqual(action.status, "PENDING");
//                     assert.strictEqual(action.actionType, "addCouncilMember");
//                     assert.equal(action.executed, false);
//                     assert.equal(actionSigner, true);
//                     assert.equal(action.signersCount, 1);
//                     assert.equal(addressMap.get("councilMemberAddress"), councilMember);
//                     assert.equal(stringMap.get("councilMemberName"), newMemberName);
//                     assert.equal(stringMap.get("councilMemberImage"), newMemberImage);
//                     assert.equal(stringMap.get("councilMemberWebsite"), newMemberWebsite);

//                     // Operation
//                     await signerFactory(bob.sk);
//                     const signOperation = await breakGlassInstance.methods.signAction(nextActionID).send();
//                     await signOperation.confirmation();

//                     // Final values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     action                  = await breakGlassStorage.actionsLedger.get(nextActionID);

//                     const newCouncilStorage = breakGlassStorage.councilMembers.has(oscar.pkh)

//                     assert.equal(action.executed, true);
//                     assert.equal(action.signersCount.toNumber(), signerThreshold.toNumber());
//                     assert.equal(action.status, "EXECUTED");
//                     assert.equal(newCouncilStorage, true);

//                     // Operation
//                     await chai.expect(breakGlassInstance.methods.signAction(nextActionID).send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('addCouncilMember --> should add the given address as a council member if the address is not in it', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const councilMember     = susie.pkh;
//                     const newMemberName     = "Member Name";
//                     const newMemberImage    = "Member Image";
//                     const newMemberWebsite  = "Member Website";
//                     const nextActionID      = breakGlassStorage.actionCounter;

//                     // Operation
//                     const newActionOperation = await breakGlassInstance.methods.addCouncilMember(councilMember, newMemberName, newMemberWebsite, newMemberImage).send();
//                     await newActionOperation.confirmation();

//                     // Create the same action for the following test
//                     const duplicatedActionOperation = await breakGlassInstance.methods.addCouncilMember(councilMember, newMemberName, newMemberWebsite, newMemberImage).send();
//                     await duplicatedActionOperation.confirmation();

//                     // Final values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     var action              = await breakGlassStorage.actionsLedger.get(nextActionID);
//                     const actionSigner      = action.signers.includes(alice.pkh)
//                     const addressMap        = await action.addressMap;
//                     const stringMap         = await action.stringMap;
//                     const signerThreshold   = breakGlassStorage.config.threshold;

//                     // Assertions
//                     assert.strictEqual(action.initiator, alice.pkh);
//                     assert.strictEqual(action.status, "PENDING");
//                     assert.strictEqual(action.actionType, "addCouncilMember");
//                     assert.equal(action.executed, false);
//                     assert.equal(actionSigner, true);
//                     assert.equal(action.signersCount, 1);
//                     assert.equal(addressMap.get("councilMemberAddress"), councilMember);
//                     assert.equal(stringMap.get("councilMemberName"), newMemberName);
//                     assert.equal(stringMap.get("councilMemberImage"), newMemberImage);
//                     assert.equal(stringMap.get("councilMemberWebsite"), newMemberWebsite);

//                     // Operation
//                     await signerFactory(bob.sk);
//                     const signOperation = await breakGlassInstance.methods.signAction(nextActionID).send();
//                     await signOperation.confirmation();

//                     // Final values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     action                  = await breakGlassStorage.actionsLedger.get(nextActionID);

//                     const newCouncilStorage = breakGlassStorage.councilMembers.has(susie.pkh)

//                     assert.equal(action.executed, true);
//                     assert.equal(action.signersCount.toNumber(), signerThreshold.toNumber());
//                     assert.equal(action.status, "EXECUTED");
//                     assert.equal(newCouncilStorage, true);
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('addCouncilMember --> should fail if the member is already in the storage', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const councilMember     = susie.pkh;
//                     const newMemberName     = "Member Name";
//                     const newMemberImage    = "Member Image";
//                     const newMemberWebsite  = "Member Website";
//                     const nextActionID      = breakGlassStorage.actionCounter - 1; // Get the previously duplicated action
//                     var action              = await breakGlassStorage.actionsLedger.get(nextActionID);
//                     const actionSigner      = action.signers.includes(alice.pkh)
//                     const addressMap        = await action.addressMap;
//                     const stringMap         = await action.stringMap;

//                     // Assertions
//                     assert.strictEqual(action.initiator, alice.pkh);
//                     assert.strictEqual(action.status, "PENDING");
//                     assert.strictEqual(action.actionType, "addCouncilMember");
//                     assert.equal(action.executed, false);
//                     assert.equal(actionSigner, true);
//                     assert.equal(action.signersCount, 1);
//                     assert.equal(addressMap.get("councilMemberAddress"), councilMember);
//                     assert.equal(stringMap.get("councilMemberName"), newMemberName);
//                     assert.equal(stringMap.get("councilMemberImage"), newMemberImage);
//                     assert.equal(stringMap.get("councilMemberWebsite"), newMemberWebsite);

//                     // Operation
//                     await signerFactory(bob.sk);
//                     await chai.expect(breakGlassInstance.methods.signAction(nextActionID).send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('removeCouncilMember --> should remove the given address from the council members if the address is in it', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const councilMember     = oscar.pkh;
//                     const nextActionID      = breakGlassStorage.actionCounter;

//                     // Operation
//                     const newActionOperation = await breakGlassInstance.methods.removeCouncilMember(councilMember).send();
//                     await newActionOperation.confirmation();

//                     // Create the same action for the following test
//                     const duplicatedActionOperation = await breakGlassInstance.methods.removeCouncilMember(councilMember).send();
//                     await duplicatedActionOperation.confirmation();

//                     // Final values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     var action              = await breakGlassStorage.actionsLedger.get(nextActionID);
//                     const actionSigner      = action.signers.includes(alice.pkh)
//                     const addressMap        = await action.addressMap;
//                     const signerThreshold   = breakGlassStorage.config.threshold;

//                     // Assertions
//                     assert.strictEqual(action.initiator, alice.pkh);
//                     assert.strictEqual(action.status, "PENDING");
//                     assert.strictEqual(action.actionType, "removeCouncilMember");
//                     assert.equal(action.executed, false);
//                     assert.equal(actionSigner, true);
//                     assert.equal(action.signersCount, 1);
//                     assert.equal(addressMap.get("councilMemberAddress"), councilMember);

//                     // Operation
//                     await signerFactory(bob.sk);
//                     const signOperation = await breakGlassInstance.methods.signAction(nextActionID).send();
//                     await signOperation.confirmation();

//                     // Final values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     action                  = await breakGlassStorage.actionsLedger.get(nextActionID);

//                     const newCouncilStorage = breakGlassStorage.councilMembers.has(oscar.pkh)

//                     assert.equal(action.executed, true);
//                     assert.equal(action.signersCount.toNumber(), signerThreshold.toNumber());
//                     assert.equal(action.status, "EXECUTED");
//                     assert.equal(newCouncilStorage, false);
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('removeCouncilMember --> should fail if the member is not in the council', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const councilMember     = oscar.pkh;
//                     const nextActionID      = breakGlassStorage.actionCounter - 1; // Get the previously duplicated action
//                     var action              = await breakGlassStorage.actionsLedger.get(nextActionID);
//                     const actionSigner      = action.signers.includes(alice.pkh)
//                     const addressMap        = await action.addressMap;

//                     // Assertions
//                     assert.strictEqual(action.initiator, alice.pkh);
//                     assert.strictEqual(action.status, "PENDING");
//                     assert.strictEqual(action.actionType, "removeCouncilMember");
//                     assert.equal(action.executed, false);
//                     assert.equal(actionSigner, true);
//                     assert.equal(action.signersCount, 1);
//                     assert.equal(addressMap.get("councilMemberAddress"), councilMember);

//                     // Operation
//                     await signerFactory(bob.sk);
//                     await chai.expect(breakGlassInstance.methods.signAction(nextActionID).send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('removeCouncilMember --> should fail if the threshold in the configuration is greater than the expected amount of members after execution', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const memberAddress     = eve.pkh;
//                     const nextActionID      = breakGlassStorage.actionCounter;

//                     // Operation
//                     const newActionOperation = await breakGlassInstance.methods.removeCouncilMember(memberAddress).send();
//                     await newActionOperation.confirmation();

//                     // Final values
//                     breakGlassStorage      = await breakGlassInstance.storage();
//                     var action          = await breakGlassStorage.actionsLedger.get(nextActionID);
//                     var actionSigner    = action.signers.includes(alice.pkh)
//                     var addressMap      = await action.addressMap;
//                     const councilSize   = breakGlassStorage.councilMembers.size;
//                     // const oldThresold   = breakGlassStorage.config.threshold;

//                     // Assertions
//                     assert.strictEqual(action.initiator, alice.pkh);
//                     assert.strictEqual(action.status, "PENDING");
//                     assert.strictEqual(action.actionType, "removeCouncilMember");
//                     assert.equal(action.executed, false);
//                     assert.equal(actionSigner, true);
//                     assert.equal(action.signersCount, 1);
//                     assert.equal(addressMap.get("councilMemberAddress"), memberAddress);

//                     // Update config
//                     await signerFactory(bob.sk)
//                     var updateConfigOperation = await breakGlassInstance.methods.updateConfig(councilSize,"configThreshold").send();
//                     await updateConfigOperation.confirmation();

//                     // Operation
//                     var signOperation = await breakGlassInstance.methods.signAction(nextActionID).send();
//                     await signOperation.confirmation();
                    
//                     await signerFactory(isaac.sk)
//                     signOperation = await breakGlassInstance.methods.signAction(nextActionID).send();
//                     await signOperation.confirmation();

//                     await signerFactory(eve.sk)
//                     signOperation = await breakGlassInstance.methods.signAction(nextActionID).send();
//                     await signOperation.confirmation();

//                     await signerFactory(susie.sk)
//                     await chai.expect(breakGlassInstance.methods.signAction(nextActionID).send()).to.be.rejected;

//                     // Reset config
//                     await signerFactory(bob.sk)
//                     updateConfigOperation = await breakGlassInstance.methods.updateConfig(2,"configThreshold").send();
//                     await updateConfigOperation.confirmation();
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('changeCouncilMember --> should replace an old councilMember with a new one if the old member if the old member is a council member', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage           = await breakGlassInstance.storage();
//                     const oldCouncilMember      = bob.pkh;
//                     const newCouncilMember      = mallory.pkh;
//                     const nextActionID          = breakGlassStorage.actionCounter;
//                     const newMemberName         = "Member Name";
//                     const newMemberImage        = "Member Image";
//                     const newMemberWebsite      = "Member Website";

//                     // Operation
//                     const newActionOperation = await breakGlassInstance.methods.changeCouncilMember(oldCouncilMember, newCouncilMember, newMemberName, newMemberWebsite, newMemberImage).send();
//                     await newActionOperation.confirmation();

//                     // Create a difference action for the following test
//                     var otherNewAddress             = trudy.pkh
//                     const unexistingOldOperation    = await breakGlassInstance.methods.changeCouncilMember(oldCouncilMember, otherNewAddress, newMemberName, newMemberWebsite, newMemberImage).send()
//                     await unexistingOldOperation.confirmation();

//                     // Create a difference action for the following test
//                     var otherOldAddress             = alice.pkh
//                     const existingNewOperation      = await breakGlassInstance.methods.changeCouncilMember(otherOldAddress, newCouncilMember, newMemberName, newMemberWebsite, newMemberImage).send()
//                     await existingNewOperation.confirmation();

//                     // Final values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     var action              = await breakGlassStorage.actionsLedger.get(nextActionID);
//                     const actionSigner      = action.signers.includes(alice.pkh)
//                     const addressMap        = await action.addressMap;
//                     const stringMap         = await action.stringMap;
//                     const signerThreshold   = breakGlassStorage.config.threshold;

//                     // Assertions
//                     assert.strictEqual(action.initiator, alice.pkh);
//                     assert.strictEqual(action.status, "PENDING");
//                     assert.strictEqual(action.actionType, "changeCouncilMember");
//                     assert.equal(action.executed, false);
//                     assert.equal(actionSigner, true);
//                     assert.equal(action.signersCount, 1);
//                     assert.equal(addressMap.get("oldCouncilMemberAddress"), oldCouncilMember);
//                     assert.equal(addressMap.get("newCouncilMemberAddress"), newCouncilMember);
//                     assert.equal(stringMap.get("newCouncilMemberName"), newMemberName);
//                     assert.equal(stringMap.get("newCouncilMemberWebsite"), newMemberWebsite);
//                     assert.equal(stringMap.get("newCouncilMemberImage"), newMemberImage);

//                     // Operation
//                     await signerFactory(bob.sk);
//                     const signOperation = await breakGlassInstance.methods.signAction(nextActionID).send();
//                     await signOperation.confirmation();

//                     // Final values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     action                  = await breakGlassStorage.actionsLedger.get(nextActionID);

//                     const newCouncilStorage = breakGlassStorage.councilMembers.has(bob.pkh)

//                     assert.equal(action.executed, true);
//                     assert.equal(action.status, "EXECUTED");
//                     assert.equal(newCouncilStorage, false);
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('changeCouncilMember --> should fail if the old member is not in the council', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage           = await breakGlassInstance.storage();
//                     const oldCouncilMember      = alice.pkh;
//                     const newCouncilMember      = mallory.pkh;
//                     const nextActionID          = breakGlassStorage.actionCounter - 1; // Get the previously duplicated action
//                     var action                  = await breakGlassStorage.actionsLedger.get(nextActionID);
//                     const actionSigner          = action.signers.includes(alice.pkh)
//                     const addressMap            = await action.addressMap;
//                     const stringMap             = await action.stringMap;
//                     const newMemberName         = "Member Name";
//                     const newMemberImage        = "Member Image";
//                     const newMemberWebsite      = "Member Website";

//                     // Assertions
//                     assert.strictEqual(action.initiator, alice.pkh);
//                     assert.strictEqual(action.status, "PENDING");
//                     assert.strictEqual(action.actionType, "changeCouncilMember");
//                     assert.equal(action.executed, false);
//                     assert.equal(actionSigner, true);
//                     assert.equal(action.signersCount, 1);
//                     assert.equal(addressMap.get("oldCouncilMemberAddress"), oldCouncilMember);
//                     assert.equal(addressMap.get("newCouncilMemberAddress"), newCouncilMember);
//                     assert.equal(stringMap.get("newCouncilMemberName"), newMemberName);
//                     assert.equal(stringMap.get("newCouncilMemberWebsite"), newMemberWebsite);
//                     assert.equal(stringMap.get("newCouncilMemberImage"), newMemberImage);

//                     // Operation
//                     await signerFactory(bob.sk);
//                     await chai.expect(breakGlassInstance.methods.signAction(nextActionID).send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('changeCouncilMember --> should fail if the new member is already in the council', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const oldCouncilMember  = bob.pkh;
//                     const newCouncilMember  = trudy.pkh;
//                     const newMemberName     = "Member Name";
//                     const newMemberImage    = "Member Image";
//                     const newMemberWebsite  = "Member Website";
//                     const nextActionID      = breakGlassStorage.actionCounter - 2; // Get the previously duplicated action
//                     var action              = await breakGlassStorage.actionsLedger.get(nextActionID);
//                     const actionSigner      = action.signers.includes(alice.pkh)
//                     const addressMap        = await action.addressMap;
//                     const stringMap         = await action.stringMap;

//                     // Assertions
//                     assert.strictEqual(action.initiator, alice.pkh);
//                     assert.strictEqual(action.status, "PENDING");
//                     assert.strictEqual(action.actionType, "changeCouncilMember");
//                     assert.equal(action.executed, false);
//                     assert.equal(actionSigner, true);
//                     assert.equal(action.signersCount, 1);
//                     assert.equal(addressMap.get("oldCouncilMemberAddress"), oldCouncilMember);
//                     assert.equal(addressMap.get("newCouncilMemberAddress"), newCouncilMember);
//                     assert.equal(stringMap.get("newCouncilMemberName"), newMemberName);
//                     assert.equal(stringMap.get("newCouncilMemberWebsite"), newMemberWebsite);
//                     assert.equal(stringMap.get("newCouncilMemberImage"), newMemberImage);

//                     // Operation
//                     await signerFactory(bob.sk);
//                     await chai.expect(breakGlassInstance.methods.signAction(nextActionID).send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('pauseAllEntrypoints --> should pause all entrypoints in all contracts referenced in the generalContracts map in the breakGlass storage', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const nextActionID      = breakGlassStorage.actionCounter;

//                     var gContracts      = governanceStorage.generalContracts.entries();
//                     for (let entry of gContracts){
//                         // Get contract storage
//                         var contract        = await utils.tezos.contract.at(entry[1]);
//                         var storage:any     = await contract.storage();

//                         // Check pause
//                         var breakGlassConfig    = storage.breakGlassConfig
//                     }

//                     // Operation
//                     const newActionOperation = await breakGlassInstance.methods.pauseAllEntrypoints().send();
//                     await newActionOperation.confirmation();

//                     // Final values
//                     breakGlassStorage   = await breakGlassInstance.storage();
//                     var action          = await breakGlassStorage.actionsLedger.get(nextActionID);
//                     const actionSigner  = action.signers.includes(alice.pkh)
//                     const signerThreshold   = breakGlassStorage.config.threshold;

//                     // Assertions
//                     assert.strictEqual(action.initiator, alice.pkh);
//                     assert.strictEqual(action.status, "PENDING");
//                     assert.strictEqual(action.actionType, "pauseAllEntrypoints");
//                     assert.equal(action.executed, false);
//                     assert.equal(actionSigner, true);
//                     assert.equal(action.signersCount, 1);
//                     assert.equal(breakGlassStorage.glassBroken, true);

//                     // Operation
//                     await signerFactory(eve.sk);
//                     const signOperation = await breakGlassInstance.methods.signAction(nextActionID).send();
//                     await signOperation.confirmation();

//                     // Final values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     governanceStorage       = await governanceInstance.storage();
//                     action                  = await breakGlassStorage.actionsLedger.get(nextActionID);
//                     const generalContracts  = governanceStorage.generalContracts.entries();

//                     assert.equal(action.executed, true);
//                     assert.equal(action.status, "EXECUTED");

//                     // Check the entrypoints are paused
//                     for (let entry of generalContracts){
//                         // Get contract storage
//                         var contract        = await utils.tezos.contract.at(entry[1]);
//                         var storage:any     = await contract.storage();

//                         // Check pause
//                         var breakGlassConfig    = storage.breakGlassConfig
//                         if(storage.hasOwnProperty('breakGlassConfig')){
//                             for (let [key, value] of Object.entries(breakGlassConfig)){
//                                 assert.equal(value, true);
//                             }
//                         }
//                     }
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('unpauseAllEntrypoints --> should unpause all entrypoints in all contracts referenced in the generalContracts map in the breakGlass storage', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const nextActionID      = breakGlassStorage.actionCounter;

//                     // Operation
//                     const newActionOperation = await breakGlassInstance.methods.unpauseAllEntrypoints().send();
//                     await newActionOperation.confirmation();

//                     // Final values
//                     breakGlassStorage   = await breakGlassInstance.storage();
//                     var action          = await breakGlassStorage.actionsLedger.get(nextActionID);
//                     const actionSigner  = action.signers.includes(alice.pkh)
//                     const signerThreshold   = breakGlassStorage.config.threshold;

//                     // Assertions
//                     assert.strictEqual(action.initiator, alice.pkh);
//                     assert.strictEqual(action.status, "PENDING");
//                     assert.strictEqual(action.actionType, "unpauseAllEntrypoints");
//                     assert.equal(action.executed, false);
//                     assert.equal(actionSigner, true);
//                     assert.equal(action.signersCount, 1);
//                     assert.equal(breakGlassStorage.glassBroken, true);

//                     // Operation
//                     await signerFactory(eve.sk);
//                     const signOperation = await breakGlassInstance.methods.signAction(nextActionID).send();
//                     await signOperation.confirmation();

//                     // Final values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     governanceStorage       = await governanceInstance.storage();
//                     action                  = await breakGlassStorage.actionsLedger.get(nextActionID);
//                     const generalContracts  = governanceStorage.generalContracts.entries();

//                     assert.equal(action.executed, true);
//                     assert.equal(action.status, "EXECUTED");

//                     // Check the entrypoints are paused
//                     for (let entry of generalContracts){
//                         // Get contract storage
//                         var contract        = await utils.tezos.contract.at(entry[1]);
//                         var storage:any     = await contract.storage();

//                         // Check pause
//                         var breakGlassConfig    = storage.breakGlassConfig
//                         if(storage.hasOwnProperty('breakGlassConfig')){
//                             for (let [key, value] of Object.entries(breakGlassConfig)){
//                                 assert.equal(value, false);
//                             }
//                         }
//                     }
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('setSingleContractAdmin --> should update the administrator to the given address in the given contract', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const nextActionID      = breakGlassStorage.actionCounter;
//                     const newAdmin          = bob.pkh;
//                     const targetContract    = doormanAddress.address;

//                     // Operation
//                     const newActionOperation = await breakGlassInstance.methods.setSingleContractAdmin(newAdmin, targetContract).send();
//                     await newActionOperation.confirmation();

//                     // Final values
//                     breakGlassStorage   = await breakGlassInstance.storage();
//                     var action          = await breakGlassStorage.actionsLedger.get(nextActionID);
//                     const actionSigner  = action.signers.includes(alice.pkh)
//                     const addressMap    = await action.addressMap;
//                     const signerThreshold   = breakGlassStorage.config.threshold;

//                     // Assertions
//                     assert.strictEqual(action.initiator, alice.pkh);
//                     assert.strictEqual(action.status, "PENDING");
//                     assert.strictEqual(action.actionType, "setSingleContractAdmin");
//                     assert.equal(action.executed, false);
//                     assert.equal(actionSigner, true);
//                     assert.equal(action.signersCount, 1);
//                     assert.equal(addressMap.get("newAdminAddress"), newAdmin);
//                     assert.equal(addressMap.get("targetContractAddress"), targetContract);
//                     assert.equal(breakGlassStorage.glassBroken, true);

//                     // Operation
//                     await signerFactory(eve.sk);
//                     const signOperation = await breakGlassInstance.methods.signAction(nextActionID).send();
//                     await signOperation.confirmation();

//                     // Final values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     action                  = await breakGlassStorage.actionsLedger.get(nextActionID);

//                     assert.equal(action.executed, true);
//                     assert.equal(action.status, "EXECUTED");

//                     var contract        = await utils.tezos.contract.at(targetContract);
//                     var storage:any     = await contract.storage();
//                     if(storage.hasOwnProperty('admin')){
//                         assert.equal(storage.admin, newAdmin);
//                     }

//                     // Reset contract admin
//                     await signerFactory(bob.sk);
//                     const resetOperation    = await doormanInstance.methods.setAdmin(breakGlassAddress.address).send();
//                     await resetOperation.confirmation();
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('setAllContractsAdmin --> should update the administrator to the given address in all contracts referenced in the generalContracts map in the storage', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const nextActionID      = breakGlassStorage.actionCounter;
//                     const newAdmin          = bob.pkh;

//                     // Operation
//                     const newActionOperation = await breakGlassInstance.methods.setAllContractsAdmin(newAdmin).send();
//                     await newActionOperation.confirmation();

//                     // Final values
//                     breakGlassStorage   = await breakGlassInstance.storage();
//                     var action          = await breakGlassStorage.actionsLedger.get(nextActionID);
//                     const actionSigner  = action.signers.includes(alice.pkh)
//                     const addressMap    = await action.addressMap;
//                     const signerThreshold   = breakGlassStorage.config.threshold;

//                     // Assertions
//                     assert.strictEqual(action.initiator, alice.pkh);
//                     assert.strictEqual(action.status, "PENDING");
//                     assert.strictEqual(action.actionType, "setAllContractsAdmin");
//                     assert.equal(action.executed, false);
//                     assert.equal(actionSigner, true);
//                     assert.equal(action.signersCount, 1);
//                     assert.equal(addressMap.get("newAdminAddress"), newAdmin);
//                     assert.equal(breakGlassStorage.glassBroken, true);

//                     // Operation
//                     await signerFactory(eve.sk);
//                     const signOperation = await breakGlassInstance.methods.signAction(nextActionID).send();
//                     await signOperation.confirmation();

//                     // Final values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     governanceStorage       = await governanceInstance.storage();
//                     action                  = await breakGlassStorage.actionsLedger.get(nextActionID);
//                     var generalContracts    = governanceStorage.generalContracts.entries();

//                     assert.equal(action.executed, true);
//                     assert.equal(action.signersCount.toNumber(), signerThreshold.toNumber());
//                     assert.equal(action.status, "EXECUTED");
//                     assert.equal(breakGlassStorage.admin, newAdmin);

//                     // Check the contracts admin
//                     for (let entry of generalContracts){
//                         // Get contract storage
//                         var contract        = await utils.tezos.contract.at(entry[1]);
//                         var storage:any     = await contract.storage();

//                         // Check admin
//                         if(storage.hasOwnProperty('admin')){
//                             assert.equal(storage.admin, newAdmin)
//                         }
//                     }

//                     // reset all contracts admin to breakGlass for future tests
//                     await signerFactory(bob.sk)
//                     governanceStorage       = await governanceInstance.storage();
//                     generalContracts        = await governanceStorage.generalContracts.entries();
//                     var setAdminOperation   = await breakGlassInstance.methods.setAdmin(breakGlassAddress.address).send();
//                     await setAdminOperation.confirmation();
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });


//             it('Council member should not be able to access this entrypoint if the action linked to the provided actionID expired', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     var nextActionID        = breakGlassStorage.actionCounter;
//                     const councilMember     = ivan.pkh;
//                     const newMemberName     = "Member Name";
//                     const newMemberImage    = "Member Image";
//                     const newMemberWebsite  = "Member Website";

//                     // Operation
//                     const newActionOperation = await breakGlassInstance.methods.addCouncilMember(councilMember, newMemberName, newMemberWebsite, newMemberImage).send();
//                     await newActionOperation.confirmation();

//                     // Assertions
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     var action              = await breakGlassStorage.actionsLedger.get(nextActionID);
//                     assert.strictEqual(action.initiator, alice.pkh);
//                     assert.strictEqual(action.status, "PENDING");
//                     assert.strictEqual(action.actionType, "addCouncilMember");
//                     assert.equal(action.executed, false);
//                     assert.equal(action.signersCount, 1);

//                     // Update contract config
//                     var nextActionID        = breakGlassStorage.actionCounter;
//                     breakGlassStorage       = await breakGlassInstance.storage();

//                     // Reset contract config
//                     await signerFactory(alice.sk)
//                     var setContractAdminOperation   = await breakGlassInstance.methods.setSingleContractAdmin(bob.pkh, breakGlassAddress.address).send();
//                     await setContractAdminOperation.confirmation();

//                     await signerFactory(eve.sk);
//                     var voteOperation   = await breakGlassInstance.methods.signAction(nextActionID).send();
//                     await voteOperation.confirmation();

//                     await signerFactory(bob.sk)
//                     var updateConfigOperation = await breakGlassInstance.methods.updateConfig(0,"configActionExpiryDays").send();
//                     await updateConfigOperation.confirmation();

//                     // Operation
//                     await signerFactory(eve.sk);
//                     await chai.expect(breakGlassInstance.methods.signAction(nextActionID).send()).to.be.rejected;

//                     // Reset storage
//                     await signerFactory(bob.sk)
//                     var updateConfigOperation = await breakGlassInstance.methods.updateConfig(1,"configActionExpiryDays").send();
//                     await updateConfigOperation.confirmation();
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('removeBreakGlassControl --> should set the glassBroken variable to false and unpause all the entrypoints in all the contracts in the generalContracts map in the storage', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     governanceStorage       = await governanceInstance.storage();
//                     var nextActionID        = breakGlassStorage.actionCounter;

//                     var generalContracts  = governanceStorage.generalContracts.entries();
//                     await signerFactory(bob.sk)
//                     for (let entry of generalContracts){
//                         // Get contract storage
//                         var contract        = await utils.tezos.contract.at(entry[1]);
//                         var storage:any     = await contract.storage();

//                         // Check admin
//                         if(storage.hasOwnProperty('admin') && storage.admin!==breakGlassAddress.address && entry[1]!==breakGlassAddress.address){
//                             var setAdminOperation   = await contract.methods.setAdmin(breakGlassAddress.address).send();
//                             await setAdminOperation.confirmation();              
//                         }
//                     }

//                     // Reset admin to breakGlass contract
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     var setContractAdminOperation = await breakGlassInstance.methods.setAdmin(breakGlassAddress.address).send();
//                     await setContractAdminOperation.confirmation();

//                     // Operation
//                     nextActionID        = breakGlassStorage.actionCounter;
//                     await signerFactory(alice.sk);
//                     const newActionOperation = await breakGlassInstance.methods.removeBreakGlassControl().send();
//                     await newActionOperation.confirmation();

//                     // Final values
//                     breakGlassStorage   = await breakGlassInstance.storage();
//                     var action          = await breakGlassStorage.actionsLedger.get(nextActionID);
//                     const actionSigner  = action.signers.includes(alice.pkh)
//                     const signerThreshold   = breakGlassStorage.config.threshold;

//                     // Assertions
//                     assert.strictEqual(action.initiator, alice.pkh);
//                     assert.strictEqual(action.status, "PENDING");
//                     assert.strictEqual(action.actionType, "removeBreakGlassControl");
//                     assert.equal(action.executed, false);
//                     assert.equal(actionSigner, true);
//                     assert.equal(action.signersCount, 1);
//                     assert.equal(breakGlassStorage.glassBroken, true);

//                     // Operation
//                     await signerFactory(eve.sk);
//                     const signOperation = await breakGlassInstance.methods.signAction(nextActionID).send();
//                     await signOperation.confirmation();

//                     // Final values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     governanceStorage       = await governanceInstance.storage();
//                     action                  = await breakGlassStorage.actionsLedger.get(nextActionID);
//                     generalContracts        = governanceStorage.generalContracts.entries();

//                     assert.equal(action.executed, true);
//                     assert.equal(action.signersCount.toNumber(), signerThreshold.toNumber());
//                     assert.equal(action.status, "EXECUTED");
//                     assert.equal(breakGlassStorage.glassBroken, false);
                    
//                     // Check the contracts admin
//                     for (let entry of generalContracts){
//                         // Get contract storage
//                         var contract        = await utils.tezos.contract.at(entry[1]);
//                         var storage:any     = await contract.storage();

//                         // Check admin
//                         if(storage.hasOwnProperty('admin')){
//                             assert.equal(storage.admin, governanceProxyAddress.address)
//                         }
//                     }
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('flushAction --> should flush an action in a pending state', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const nextActionID      = breakGlassStorage.actionCounter;
//                     const flushedAction     = 1;

//                     // Operation
//                     const newActionOperation    = await breakGlassInstance.methods.flushAction(flushedAction).send();
//                     await newActionOperation.confirmation();

//                     // Other operation for future tests
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const executedOperation     = await breakGlassInstance.methods.flushAction(nextActionID).send();
//                     await executedOperation.confirmation();

//                     // Other operation for future tests
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const flushedOperation      = await breakGlassInstance.methods.flushAction(flushedAction).send();
//                     await flushedOperation.confirmation();

//                     // Final values
//                     breakGlassStorage   = await breakGlassInstance.storage();
//                     var action          = await breakGlassStorage.actionsLedger.get(nextActionID);
//                     const actionSigner  = action.signers.includes(alice.pkh)
//                     const signerThreshold   = breakGlassStorage.config.threshold;
//                     const natMap            = await action.natMap;

//                     // Assertions
//                     assert.strictEqual(action.initiator, alice.pkh);
//                     assert.strictEqual(action.status, "PENDING");
//                     assert.strictEqual(action.actionType, "flushAction");
//                     assert.equal(action.executed, false);
//                     assert.equal(actionSigner, true);
//                     assert.equal(action.signersCount, 1);
//                     assert.equal(breakGlassStorage.glassBroken, false);
//                     assert.equal(natMap.get("actionId"), flushedAction);
                    
//                     // Operation
//                     await signerFactory(eve.sk);
//                     const signOperation = await breakGlassInstance.methods.signAction(nextActionID).send();
//                     await signOperation.confirmation();

//                     // Final values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     action                  = await breakGlassStorage.actionsLedger.get(nextActionID);

//                     assert.equal(action.executed, true);
//                     assert.equal(action.signersCount.toNumber(), signerThreshold.toNumber());
//                     assert.equal(action.status, "EXECUTED");

//                     const otherAction       = await breakGlassStorage.actionsLedger.get(flushedAction);
//                     assert.equal(otherAction.executed, false);
//                     assert.equal(otherAction.status, "FLUSHED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('flushAction --> should fail if the action was executed', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const nextActionID      = breakGlassStorage.actionCounter - 2; // Get the previously duplicated action
//                     const executedAction    = breakGlassStorage.actionCounter - 3;

//                     var action              = await breakGlassStorage.actionsLedger.get(nextActionID);
//                     const actionSigner      = action.signers.includes(alice.pkh)
//                     const natMap            = await action.natMap;

//                     // Assertions
//                     assert.strictEqual(action.initiator, alice.pkh);
//                     assert.strictEqual(action.status, "PENDING");
//                     assert.strictEqual(action.actionType, "flushAction");
//                     assert.equal(action.executed, false);
//                     assert.equal(actionSigner, true);
//                     assert.equal(action.signersCount, 1);
//                     assert.equal(natMap.get("actionId"), executedAction);
//                     action              = await breakGlassStorage.actionsLedger.get(executedAction);
//                     assert.equal(action.executed, true);

//                     // Operation
//                     await signerFactory(bob.sk);
//                     await chai.expect(breakGlassInstance.methods.signAction(nextActionID).send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('flushAction --> should fail if the action was flushed', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const nextActionID      = breakGlassStorage.actionCounter - 2; // Get the previously duplicated action
//                     const flushedAction     = 1;
//                     var action              = await breakGlassStorage.actionsLedger.get(nextActionID);
//                     const actionSigner      = action.signers.includes(alice.pkh)
//                     const natMap            = await action.natMap;

//                     // Assertions
//                     assert.strictEqual(action.initiator, alice.pkh);
//                     assert.strictEqual(action.status, "PENDING");
//                     assert.strictEqual(action.actionType, "flushAction");
//                     assert.equal(action.executed, false);
//                     assert.equal(actionSigner, true);

//                     action              = await breakGlassStorage.actionsLedger.get(flushedAction);
//                     assert.equal(action.status, "FLUSHED");

//                     // Operation
//                     await signerFactory(eve.sk);
//                     await chai.expect(breakGlassInstance.methods.signAction(flushedAction).send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('Council member should not be able to access this entrypoint if the action linked to the provided actionID was executed', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const nextActionID      = breakGlassStorage.actionCounter - 3;
//                     var action              = await breakGlassStorage.actionsLedger.get(nextActionID);

//                     // Assertions
//                     assert.strictEqual(action.status, "EXECUTED");
//                     assert.equal(action.executed, true);

//                     // Operation
//                     await signerFactory(eve.sk);
//                     await chai.expect(breakGlassInstance.methods.signAction(nextActionID).send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('Council member should not be able to access this entrypoint if the action linked to the provided actionID doesn’t exist', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const nextActionID      = 999;
//                     var action              = await breakGlassStorage.actionsLedger.get(nextActionID);

//                     // Assertions
//                     assert.strictEqual(action, undefined);

//                     // Operation
//                     await signerFactory(eve.sk);
//                     await chai.expect(breakGlassInstance.methods.signAction(nextActionID).send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('Council member should not be able to access this entrypoint if the action linked to the provided actionID was flushed', async () => {
//                 try{
//                     // Initial Values
//                     breakGlassStorage       = await breakGlassInstance.storage();
//                     const nextActionID      = 1;
//                     var action              = await breakGlassStorage.actionsLedger.get(nextActionID);

//                     // Assertions
//                     assert.strictEqual(action.status, "FLUSHED");
//                     assert.equal(action.executed, false);

//                     // Operation
//                     await signerFactory(eve.sk);
//                     await chai.expect(breakGlassInstance.methods.signAction(nextActionID).send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('Non-council contract should not be able to access this entrypoint', async () => {
//                 try{
//                     // Initial values
//                     await signerFactory(david.sk);
//                     const actionID  = 1;

//                     // Operation
//                     await chai.expect(breakGlassInstance.methods.signAction(actionID).send()).to.be.rejected;
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
//         })
//     })
// });
