// const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
// const { InMemorySigner, importKey } = require("@taquito/signer");
// import assert, { ok, rejects, strictEqual } from "assert";
// import { MVK, Utils, zeroAddress } from "./helpers/Utils";
// import fs from "fs";
// import { confirmOperation } from "../scripts/confirmation";

// const chai = require("chai");
// const chaiAsPromised = require('chai-as-promised');
// chai.use(chaiAsPromised);   
// chai.should();

// import env from "../env";
// import { bob, alice, eve, mallory, oscar, trudy, isaac, david } from "../scripts/sandbox/accounts";

// import vestingAddress from '../deployments/vestingAddress.json';
// import doormanAddress from '../deployments/doormanAddress.json';
// import delegationAddress from '../deployments/delegationAddress.json';
// import mvkTokenAddress from '../deployments/mvkTokenAddress.json';
// import governanceAddress from '../deployments/governanceAddress.json';
// import councilAddress from '../deployments/councilAddress.json';
// import mockFa12TokenAddress  from '../deployments/mockFa12TokenAddress.json';
// import mockFa2TokenAddress   from '../deployments/mockFa2TokenAddress.json';
// import farmFactoryAddress   from '../deployments/farmFactoryAddress.json';
// import treasuryAddress   from '../deployments/treasuryAddress.json';

// describe("Council tests", async () => {
//     var utils: Utils;

//     let doormanInstance;
//     let delegationInstance;
//     let mvkTokenInstance;
//     let governanceInstance;
//     let vestingInstance;
//     let councilInstance;
//     let mockFa12TokenInstance;
//     let mockFa2TokenInstance;
//     let treasuryInstance;

//     let doormanStorage;
//     let delegationStorage;
//     let mvkTokenStorage;
//     let governanceStorage;
//     let vestingStorage;
//     let councilStorage;
//     let mockFa12TokenStorage;
//     let mockFa2TokenStorage;
//     let treasuryStorage;
    
//     const signerFactory = async (pk) => {
//         await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
//         return utils.tezos;
//     };

//     before("setup", async () => {

//         utils = new Utils();
//         await utils.init(bob.sk);
        
//         vestingInstance    = await utils.tezos.contract.at(vestingAddress.address);
//         doormanInstance    = await utils.tezos.contract.at(doormanAddress.address);
//         delegationInstance = await utils.tezos.contract.at(delegationAddress.address);
//         mvkTokenInstance   = await utils.tezos.contract.at(mvkTokenAddress.address);
//         governanceInstance = await utils.tezos.contract.at(governanceAddress.address);
//         councilInstance    = await utils.tezos.contract.at(councilAddress.address);
//         mockFa12TokenInstance  = await utils.tezos.contract.at(mockFa12TokenAddress.address);
//         mockFa2TokenInstance   = await utils.tezos.contract.at(mockFa2TokenAddress.address);
//         treasuryInstance    = await utils.tezos.contract.at(treasuryAddress.address);
            
//         vestingStorage    = await vestingInstance.storage();
//         doormanStorage    = await doormanInstance.storage();
//         delegationStorage = await delegationInstance.storage();
//         mvkTokenStorage   = await mvkTokenInstance.storage();
//         governanceStorage = await governanceInstance.storage();
//         councilStorage         = await councilInstance.storage();
//         mockFa12TokenStorage   = await mockFa12TokenInstance.storage();
//         mockFa2TokenStorage    = await mockFa2TokenInstance.storage();
//         treasuryStorage    = await treasuryInstance.storage();

//         console.log('-- -- -- -- -- Council Tests -- -- -- --')
//         console.log('Vesting Contract deployed at:', vestingInstance.address);
//         console.log('Doorman Contract deployed at:', doormanInstance.address);
//         console.log('Delegation Contract deployed at:', delegationInstance.address);
//         console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
//         console.log('Governance Contract deployed at:', governanceInstance.address);
//         console.log('Council Contract deployed at:', councilInstance.address);
//         console.log('Mock Fa12 Token Contract deployed at:', mockFa12TokenInstance.address);
//         console.log('Mock Fa2 Token Contract deployed at:' , mockFa2TokenInstance.address);
//         console.log('Bob address: ' + bob.pkh);
//         console.log('Alice address: ' + alice.pkh);
//         console.log('Eve address: ' + eve.pkh);


//         // Setup funds in Council for transfer later
//         // ------------------------------------------------------------------
//         const councilContractAddress = councilAddress.address;

//         // Alice transfers 250 XTZ to Council
//         await signerFactory(alice.sk)
//         const aliceTransferTezToCouncilOperation = await utils.tezos.contract.transfer({ to: councilContractAddress, amount: 250});
//         await aliceTransferTezToCouncilOperation.confirmation();

//         // Mallory transfers 250 MVK tokens to Treasury
//         await signerFactory(mallory.sk);
//         const malloryTransferMvkToCouncilOperation = await mvkTokenInstance.methods.transfer([
//             {
//                 from_: mallory.pkh,
//                 txs: [
//                     {
//                         to_: councilContractAddress,
//                         token_id: 0,
//                         amount: 250000000
//                     }
//                 ]
//             }
//         ]).send();
//         await malloryTransferMvkToCouncilOperation.confirmation();

//         // Mallory transfers 250 Mock FA12 Tokens to Council
//         const malloryTransferMockFa12ToCouncilOperation = await mockFa12TokenInstance.methods.transfer(mallory.pkh, councilContractAddress, 250000000).send();
//         await malloryTransferMockFa12ToCouncilOperation.confirmation();

//         // Mallory transfers 250 Mock FA2 Tokens to Council
//         const malloryTransferMockFa2ToCouncilOperation = await mockFa2TokenInstance.methods.transfer([
//             {
//                 from_: mallory.pkh,
//                 txs: [
//                     {
//                         to_: councilContractAddress,
//                         token_id: 0,
//                         amount: 250000000
//                     }
//                 ]
//             }
//         ]).send();
//         await malloryTransferMockFa2ToCouncilOperation.confirmation();


//     });

//     describe("%setAdmin", async () => {
//         beforeEach("Set signer to admin", async () => {
//             await signerFactory(bob.sk)
//         });
//         it('Admin should be able to call this entrypoint and update the contract administrator with a new address', async () => {
//             try{
//                 // Initial Values
//                 councilStorage = await councilInstance.storage();
//                 const currentAdmin = councilStorage.admin;

//                 // Operation
//                 const setAdminOperation = await councilInstance.methods.setAdmin(alice.pkh).send();
//                 await setAdminOperation.confirmation();

//                 // Final values
//                 councilStorage = await councilInstance.storage();
//                 const newAdmin = councilStorage.admin;

//                 // reset admin
//                 await signerFactory(alice.sk);
//                 const resetAdminOperation = await councilInstance.methods.setAdmin(bob.pkh).send();
//                 await resetAdminOperation.confirmation();

//                 // Assertions
//                 assert.notStrictEqual(newAdmin, currentAdmin);
//                 assert.strictEqual(newAdmin, alice.pkh);
//                 assert.strictEqual(currentAdmin, bob.pkh);
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Non-admin should not be able to call this entrypoint', async () => {
//             try{
//                 // Initial Values
//                 await signerFactory(alice.sk);
//                 councilStorage = await councilInstance.storage();
//                 const currentAdmin = councilStorage.admin;

//                 // Operation
//                 await chai.expect(councilInstance.methods.setAdmin(alice.pkh).send()).to.be.rejected;

//                 // Final values
//                 councilStorage = await councilInstance.storage();
//                 const newAdmin = councilStorage.admin;

//                 // Assertions
//                 assert.strictEqual(newAdmin, currentAdmin);
//             } catch(e){
//                 console.log(e);
//             }
//         });
//     });

//     describe("%updateConfig", async () => {
//         beforeEach("Set signer to admin", async () => {
//             await signerFactory(bob.sk)
//         });

//         it('Admin should be able to call the entrypoint and configure the signer threshold', async () => {
//             try{
//                 // Initial Values
//                 councilStorage = await councilInstance.storage();
//                 const newConfigValue = 2;

//                 // Operation
//                 const updateConfigOperation = await councilInstance.methods.updateConfig(newConfigValue,"configThreshold").send();
//                 await updateConfigOperation.confirmation();

//                 // Final values
//                 councilStorage = await councilInstance.storage();
//                 const updateConfigValue = councilStorage.config.threshold;

//                 // Assertions
//                 assert.equal(updateConfigValue, newConfigValue);
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Admin should not be able to call the entrypoint and configure the signer threshold if it is greater than the amount of members in the council', async () => {
//             try{
//                 // Initial Values
//                 councilStorage = await councilInstance.storage();
//                 const currentConfigValue = councilStorage.config.threshold;
//                 const newConfigValue = 999

//                 // Operation
//                 await chai.expect(councilInstance.methods.updateConfig(newConfigValue,"configThreshold").send()).to.be.rejected;

//                 // Final values
//                 councilStorage = await councilInstance.storage();
//                 const updateConfigValue = councilStorage.config.threshold;

//                 // Assertions
//                 assert.notEqual(newConfigValue, currentConfigValue);
//                 assert.equal(updateConfigValue.toNumber(), currentConfigValue.toNumber());
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Admin should be able to call the entrypoint and configure the action expiry in days', async () => {
//             try{
//                 // Initial Values
//                 councilStorage = await councilInstance.storage();
//                 const newConfigValue = 1;

//                 // Operation
//                 const updateConfigOperation = await councilInstance.methods.updateConfig(newConfigValue,"configActionExpiryDays").send();
//                 await updateConfigOperation.confirmation();

//                 // Final values
//                 councilStorage = await councilInstance.storage();
//                 const updateConfigValue = councilStorage.config.actionExpiryDays;

//                 // Assertions
//                 assert.equal(updateConfigValue, newConfigValue);
//             } catch(e){
//                 console.log(e);
//             }
//         });
    
//         it('Non-admin should not be able to call the entrypoint', async () => {
//             try{
//                 // Initial Values
//                 councilStorage = await councilInstance.storage();
//                 const newConfigValue = 1;

//                 // Operation
//                 await signerFactory(alice.sk);
//                 await chai.expect(councilInstance.methods.updateConfig(newConfigValue,"configThreshold").send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });
//     })

//     describe("%updateCouncilMemberInfo", async () => {
//         beforeEach("Set signer to council member", async () => {
//             await signerFactory(bob.sk)
//         });
//         it('Council member should be able to call this entrypoint and update its information', async () => {
//             try{
//                 // Initial Values
//                 councilStorage          = await councilInstance.storage();
//                 var councilMember       = councilStorage.councilMembers.get(bob.pkh);
//                 const oldMemberName     = councilMember.name
//                 const oldMemberImage    = councilMember.image
//                 const oldMemberWebsite  = councilMember.website
//                 const newMemberName     = "Member Name";
//                 const newMemberImage    = "Member Image";
//                 const newMemberWebsite  = "Member Website";

//                 // Operation
//                 const updateOperation = await councilInstance.methods.updateCouncilMemberInfo(newMemberName, newMemberWebsite, newMemberImage).send();
//                 await updateOperation.confirmation();

//                 // Final values
//                 councilStorage  = await councilInstance.storage();
//                 councilMember   = councilStorage.councilMembers.get(bob.pkh);

//                 // Assertions
//                 assert.strictEqual(councilMember.name, newMemberName);
//                 assert.strictEqual(councilMember.image, newMemberImage);
//                 assert.strictEqual(councilMember.website, newMemberWebsite);
//                 assert.notStrictEqual(councilMember.name, oldMemberName);
//                 assert.notStrictEqual(councilMember.image, oldMemberImage);
//                 assert.notStrictEqual(councilMember.website, oldMemberWebsite);
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Non-council member should not be able to call this entrypoint', async () => {
//             try{
//                 // Initial Values
//                 await signerFactory(oscar.sk);
//                 councilStorage = await councilInstance.storage();
//                 const newMemberName     = "Member Name";
//                 const newMemberImage    = "Member Image";
//                 const newMemberWebsite  = "Member Website";

//                 // Operation
//                 await chai.expect(councilInstance.methods.updateCouncilMemberInfo(newMemberName, newMemberWebsite, newMemberImage).send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });
//     });

//     describe("%councilActionUpdateBlocksPerMin", async () => {
//         beforeEach("Set signer to council", async () => {
//             await signerFactory(alice.sk)
//         });
        
//         it('Council member should be able to access this entrypoint and create a new action to update the blocksPerMinute in a given contract (the action counter should increase in the storage)', async () => {
//             try{
//                 // Initial Values
//                 councilStorage          = await councilInstance.storage();
//                 const actionValue       = 3;
//                 const nextActionID      = councilStorage.actionCounter;

//                 // Operation
//                 const newActionOperation = await councilInstance.methods.councilActionUpdateBlocksPerMin(farmFactoryAddress.address, actionValue).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage   = await councilInstance.storage();
//                 const action        = await councilStorage.councilActionsLedger.get(nextActionID);
//                 const actionSigner  = action.signers.includes(alice.pkh)
//                 const addressMap    = await action.addressMap;
//                 const natMap        = await action.natMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "updateBlocksPerMinute");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(addressMap.get("contractAddress"), farmFactoryAddress.address);
//                 assert.equal(natMap.get("newBlocksPerMinute"), actionValue);
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Council member should not be able to access this entrypoint if the provided blocksPerMinute is not greater than 0', async () => {
//             try{
//                 // Initial Values
//                 councilStorage       = await councilInstance.storage();
//                 const actionValue    = 0;

//                 // Operation
//                 await chai.expect(councilInstance.methods.councilActionUpdateBlocksPerMin(farmFactoryAddress.address, actionValue).send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Council member should not be able to access this entrypoint if the given contract does not have an updateBlocksPerMinute entrypoint', async () => {
//             try{
//                 // Initial Values
//                 councilStorage       = await councilInstance.storage();
//                 const actionValue    = 3;

//                 // Operation
//                 await chai.expect(councilInstance.methods.councilActionUpdateBlocksPerMin(doormanAddress.address, actionValue).send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Non-council member should not be able to access this entrypoint', async () => {
//             try{
//                 // Initial Values
//                 councilStorage       = await councilInstance.storage();
//                 const actionValue    = 3;

//                 // Operation
//                 await signerFactory(isaac.sk);
//                 await chai.expect(councilInstance.methods.councilActionUpdateBlocksPerMin(farmFactoryAddress.address, actionValue).send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });
//     })

//     describe("%councilActionAddVestee", async () => {
//         beforeEach("Set signer to council", async () => {
//             await signerFactory(alice.sk)
//         });
        
//         it('Council member should be able to access this entrypoint and create a new action to add a new vestee (the action counter should increase in the storage)', async () => {
//             try{
//                 // Initial Values
//                 councilStorage          = await councilInstance.storage();
//                 const cliffInMonths     = 0;
//                 const vestingInMonths   = 24;
//                 const vesteeAddress     = eve.pkh;
//                 const totalAllocated    = MVK(20000000);
//                 const nextActionID      = councilStorage.actionCounter;

//                 // Operation
//                 const newActionOperation = await councilInstance.methods.councilActionAddVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 const action        = await councilStorage.councilActionsLedger.get(nextActionID);
//                 const actionSigner  = action.signers.includes(alice.pkh)
//                 const addressMap    = await action.addressMap;
//                 const natMap        = await action.natMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "addVestee");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(addressMap.get("vesteeAddress"), vesteeAddress);
//                 assert.equal(natMap.get("totalAllocatedAmount"), totalAllocated);
//                 assert.equal(natMap.get("cliffInMonths"), cliffInMonths);
//                 assert.equal(natMap.get("vestingInMonths"), vestingInMonths);

//                 // Approve vestee for following tests
//                 await signerFactory(bob.sk)
//                 const signOperation = await councilInstance.methods.signAction(nextActionID).send();
//                 await signOperation.confirmation();
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Council member should not be able to call this entrypoint if the vestee already exists', async () => {
//             try{
//                 // Initial Values
//                 councilStorage          = await councilInstance.storage();
//                 const cliffInMonths     = 0;
//                 const vestingInMonths   = 24;
//                 const vesteeAddress     = eve.pkh;
//                 const totalAllocated    = MVK(20000000);

//                 // Operation                
//                 await chai.expect(councilInstance.methods.councilActionAddVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths).send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Council member should not be able to access this entrypoint if the Vesting contract is not in the generalContact maps and if it does not contains an AddVestee entrypoint', async () => {
//             try{
//                 // Update general contracts
//                 await signerFactory(bob.sk);
//                 var updateOperation = await councilInstance.methods.updateGeneralContracts("vesting", vestingAddress.address).send()
//                 await updateOperation.confirmation();

//                 // Initial Values
//                 councilStorage       = await councilInstance.storage();
//                 const cliffInMonths     = 0;
//                 const vestingInMonths   = 24;
//                 const vesteeAddress     = eve.pkh;
//                 const totalAllocated    = MVK(20000000);

//                 // Operation
//                 await signerFactory(alice.sk);
//                 await chai.expect(councilInstance.methods.councilActionAddVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths).send()).to.be.rejected;

//                 // Reset general contracts
//                 await signerFactory(bob.sk);
//                 updateOperation = await councilInstance.methods.updateGeneralContracts("vesting", vestingAddress.address).send()
//                 await updateOperation.confirmation();
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Non-council member should not be able to access this entrypoint', async () => {
//             try{
//                 // Initial Values
//                 councilStorage       = await councilInstance.storage();
//                 const cliffInMonths     = 0;
//                 const vestingInMonths   = 24;
//                 const vesteeAddress     = eve.pkh;
//                 const totalAllocated    = MVK(20000000);

//                 // Operation
//                 await signerFactory(isaac.sk);
//                 await chai.expect(councilInstance.methods.councilActionAddVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths).send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });
//     })

//     describe("%councilActionRemoveVestee", async () => {
//         beforeEach("Set signer to council", async () => {
//             await signerFactory(alice.sk)
//             vestingStorage  = await vestingInstance.storage();
//         });
        
//         it('Council member should not be able to call this entrypoint if the vestee does not exist', async () => {
//             try{
//                 // Initial Values
//                 councilStorage          = await councilInstance.storage();
//                 const vesteeAddress     = alice.pkh;

//                 // Operation
//                 await chai.expect(councilInstance.methods.councilActionRemoveVestee(vesteeAddress).send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Council member should not be able to access this entrypoint if the Vesting contract is not in the generalContact maps and if it does not contains an RemoveVestee entrypoint', async () => {
//             try{
//                 // Update general contracts
//                 await signerFactory(bob.sk);
//                 var updateOperation = await councilInstance.methods.updateGeneralContracts("vesting", vestingAddress.address).send()
//                 await updateOperation.confirmation();

//                 // Initial Values
//                 councilStorage          = await councilInstance.storage();
//                 const vesteeAddress     = eve.pkh;

//                 // Operation
//                 await signerFactory(alice.sk);
//                 await chai.expect(councilInstance.methods.councilActionRemoveVestee(vesteeAddress).send()).to.be.rejected;

//                 // Reset general contracts
//                 await signerFactory(bob.sk);
//                 updateOperation = await councilInstance.methods.updateGeneralContracts("vesting", vestingAddress.address).send()
//                 await updateOperation.confirmation();
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Non-council member should not be able to access this entrypoint', async () => {
//             try{
//                 // Initial Values
//                 councilStorage       = await councilInstance.storage();
//                 const vesteeAddress     = eve.pkh;

//                 // Operation
//                 await signerFactory(isaac.sk);
//                 await chai.expect(councilInstance.methods.councilActionRemoveVestee(vesteeAddress).send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Council member should be able to access this entrypoint and create a new action to remove a vestee (the action counter should increase in the storage)', async () => {
//             try{
//                 // Initial Values
//                 councilStorage          = await councilInstance.storage();
//                 const vesteeAddress     = eve.pkh;
//                 const nextActionID      = councilStorage.actionCounter;

//                 // Operation
//                 const newActionOperation = await councilInstance.methods.councilActionRemoveVestee(vesteeAddress).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 const action        = await councilStorage.councilActionsLedger.get(nextActionID);
//                 const actionSigner  = action.signers.includes(alice.pkh)
//                 const addressMap    = await action.addressMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "removeVestee");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(addressMap.get("vesteeAddress"), vesteeAddress);

//                 // Remove vestee for following tests
//                 await signerFactory(bob.sk)
//                 const signOperation = await councilInstance.methods.signAction(nextActionID).send();
//                 await signOperation.confirmation();
//             } catch(e){
//                 console.log(e);
//             }
//         });

//     })

//     describe("%councilActionUpdateVestee", async () => {
//         before("Add vestee again", async () => {
//             await signerFactory(alice.sk)
//             // Initial Values
//             councilStorage          = await councilInstance.storage();
//             const cliffInMonths     = 0;
//             const vestingInMonths   = 24;
//             const vesteeAddress     = eve.pkh;
//             const totalAllocated    = MVK(20000000);
//             const nextActionID      = councilStorage.actionCounter;

//             // Operation
//             const newActionOperation = await councilInstance.methods.councilActionAddVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths).send();
//             await newActionOperation.confirmation();

//             // Approve vestee for following tests
//             await signerFactory(bob.sk)
//             const signOperation = await councilInstance.methods.signAction(nextActionID).send();
//             await signOperation.confirmation();
//         });

//         beforeEach("Set signer to council", async () => {
//             await signerFactory(alice.sk)
//         });
        
//         it('Council member should be able to access this entrypoint and create a new action to update a  vestee (the action counter should increase in the storage)', async () => {
//             try{
//                 // Initial Values
//                 councilStorage          = await councilInstance.storage();
//                 const cliffInMonths     = 0;
//                 const vestingInMonths   = 12;
//                 const vesteeAddress     = eve.pkh;
//                 const totalAllocated    = MVK(40000000);
//                 const nextActionID      = councilStorage.actionCounter;

//                 // Operation
//                 const newActionOperation = await councilInstance.methods.councilActionUpdateVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 const action        = await councilStorage.councilActionsLedger.get(nextActionID);
//                 const actionSigner  = action.signers.includes(alice.pkh)
//                 const addressMap    = await action.addressMap;
//                 const natMap        = await action.natMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "updateVestee");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(addressMap.get("vesteeAddress"), vesteeAddress);
//                 assert.equal(natMap.get("newTotalAllocatedAmount"), totalAllocated);
//                 assert.equal(natMap.get("newCliffInMonths"), cliffInMonths);
//                 assert.equal(natMap.get("newVestingInMonths"), vestingInMonths);
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Council member should not be able to call this entrypoint if the vestee does not exist', async () => {
//             try{
//                 // Initial Values
//                 councilStorage          = await councilInstance.storage();
//                 const cliffInMonths     = 0;
//                 const vestingInMonths   = 24;
//                 const vesteeAddress     = alice.pkh;
//                 const totalAllocated    = MVK(20000000);

//                 // Operation                
//                 await chai.expect(councilInstance.methods.councilActionUpdateVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths).send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Council member should not be able to access this entrypoint if the Vesting contract is not in the generalContact maps and if it does not contains an AddVestee entrypoint', async () => {
//             try{
//                 // Update general contracts
//                 await signerFactory(bob.sk);
//                 var updateOperation = await councilInstance.methods.updateGeneralContracts("vesting", vestingAddress.address).send()
//                 await updateOperation.confirmation();

//                 // Initial Values
//                 councilStorage       = await councilInstance.storage();
//                 const cliffInMonths     = 0;
//                 const vestingInMonths   = 12;
//                 const vesteeAddress     = eve.pkh;
//                 const totalAllocated    = MVK(40000000);

//                 // Operation
//                 await signerFactory(alice.sk);
//                 await chai.expect(councilInstance.methods.councilActionUpdateVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths).send()).to.be.rejected;

//                 // Reset general contracts
//                 await signerFactory(bob.sk);
//                 updateOperation = await councilInstance.methods.updateGeneralContracts("vesting", vestingAddress.address).send()
//                 await updateOperation.confirmation();
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Non-council member should not be able to access this entrypoint', async () => {
//             try{
//                 // Initial Values
//                 councilStorage       = await councilInstance.storage();
//                 const cliffInMonths     = 0;
//                 const vestingInMonths   = 12;
//                 const vesteeAddress     = eve.pkh;
//                 const totalAllocated    = MVK(40000000);

//                 // Operation
//                 await signerFactory(isaac.sk);
//                 await chai.expect(councilInstance.methods.councilActionUpdateVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths).send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });
//     })

//     describe("%councilActionToggleVesteeLock", async () => {
//         beforeEach("Set signer to council", async () => {
//             await signerFactory(alice.sk)
//         });
        
//         it('Council member should be able to access this entrypoint and create a new action to lock or unlock a vestee (the action counter should increase in the storage)', async () => {
//             try{
//                 // Initial Values
//                 councilStorage          = await councilInstance.storage();
//                 const vesteeAddress     = eve.pkh;
//                 const nextActionID      = councilStorage.actionCounter;

//                 // Operation
//                 const newActionOperation = await councilInstance.methods.councilActionToggleVesteeLock(vesteeAddress).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 const action        = await councilStorage.councilActionsLedger.get(nextActionID);
//                 const actionSigner  = action.signers.includes(alice.pkh)
//                 const addressMap    = await action.addressMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "toggleVesteeLock");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(addressMap.get("vesteeAddress"), vesteeAddress);
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Council member should not be able to call this entrypoint if the vestee does not exist', async () => {
//             try{
//                 // Initial Values
//                 councilStorage          = await councilInstance.storage();
//                 const vesteeAddress     = alice.pkh;

//                 // Operation                
//                 await chai.expect(councilInstance.methods.councilActionToggleVesteeLock(vesteeAddress).send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Council member should not be able to access this entrypoint if the Vesting contract is not in the generalContact maps and if it does not contains an ToggleVesteeLock entrypoint', async () => {
//             try{
//                 // Update general contracts
//                 await signerFactory(bob.sk);
//                 var updateOperation = await councilInstance.methods.updateGeneralContracts("vesting", vestingAddress.address).send()
//                 await updateOperation.confirmation();

//                 // Initial Values
//                 councilStorage       = await councilInstance.storage();
//                 const vesteeAddress     = eve.pkh;

//                 // Operation
//                 await signerFactory(alice.sk);
//                 await chai.expect(councilInstance.methods.councilActionToggleVesteeLock(vesteeAddress).send()).to.be.rejected;

//                 // Reset general contracts
//                 await signerFactory(bob.sk);
//                 updateOperation = await councilInstance.methods.updateGeneralContracts("vesting", vestingAddress.address).send()
//                 await updateOperation.confirmation();
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Non-council member should not be able to access this entrypoint', async () => {
//             try{
//                 // Initial Values
//                 councilStorage       = await councilInstance.storage();
//                 const vesteeAddress     = eve.pkh;

//                 // Operation
//                 await signerFactory(isaac.sk);
//                 await chai.expect(councilInstance.methods.councilActionToggleVesteeLock(vesteeAddress).send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });
//     })

//     describe("%councilActionAddMember", async () => {
//         beforeEach("Set signer to council", async () => {
//             await signerFactory(alice.sk)
//         });
        
//         it('Council member should be able to access this entrypoint and create a new action to add a council member (the action counter should increase in the storage)', async () => {
//             try{
//                 // Initial Values
//                 councilStorage          = await councilInstance.storage();
//                 const newMember         = isaac.pkh;
//                 const newMemberName     = "Member Name";
//                 const newMemberImage    = "Member Image";
//                 const newMemberWebsite  = "Member Website";
//                 const nextActionID      = councilStorage.actionCounter;

//                 // Operation
//                 const newActionOperation = await councilInstance.methods.councilActionAddMember(newMember, newMemberName, newMemberWebsite, newMemberImage).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 const action        = await councilStorage.councilActionsLedger.get(nextActionID);
//                 const actionSigner  = action.signers.includes(alice.pkh)
//                 const addressMap    = await action.addressMap;
//                 const stringMap    = await action.stringMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "addCouncilMember");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(addressMap.get("councilMemberAddress"), newMember);
//                 assert.equal(stringMap.get("councilMemberName"), newMemberName);
//                 assert.equal(stringMap.get("councilMemberWebsite"), newMemberWebsite);
//                 assert.equal(stringMap.get("councilMemberImage"), newMemberImage);
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Council member should not be able to access this entrypoint if the given member’s address is already in the council', async () => {
//             try{
//                 // Initial Values
//                 councilStorage          = await councilInstance.storage();
//                 const newMember         = alice.pkh;
//                 const newMemberName     = "Member Name";
//                 const newMemberImage    = "Member Image";
//                 const newMemberWebsite  = "Member Website";

//                 // Operation                
//                 await chai.expect(councilInstance.methods.councilActionAddMember(newMember, newMemberName, newMemberWebsite, newMemberImage).send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Non-council member should not be able to access this entrypoint', async () => {
//             try{
//                 // Initial Values
//                 councilStorage          = await councilInstance.storage();
//                 const newMember         = isaac.pkh;
//                 const newMemberName     = "Member Name";
//                 const newMemberImage    = "Member Image";
//                 const newMemberWebsite  = "Member Website";

//                 // Operation
//                 await signerFactory(isaac.sk);
//                 await chai.expect(councilInstance.methods.councilActionAddMember(newMember, newMemberName, newMemberWebsite, newMemberImage).send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });
//     })

//     describe("%councilActionRemoveMember", async () => {
//         beforeEach("Set signer to council", async () => {
//             await signerFactory(alice.sk)
//         });
        
//         it('Council member should be able to access this entrypoint and create a new action to remove a council member (the action counter should increase in the storage)', async () => {
//             try{
//                 // Initial Values
//                 councilStorage          = await councilInstance.storage();
//                 const newMember         = eve.pkh;
//                 const nextActionID      = councilStorage.actionCounter;

//                 // Operation
//                 const newActionOperation = await councilInstance.methods.councilActionRemoveMember(newMember).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 const action        = await councilStorage.councilActionsLedger.get(nextActionID);
//                 const actionSigner  = action.signers.includes(alice.pkh)
//                 const addressMap    = await action.addressMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "removeCouncilMember");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(addressMap.get("councilMemberAddress"), newMember);
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Council member should not be able to access this entrypoint if the threshold is greater than the expected amount of members in the council', async () => {
//             try{
//                 // Update config
//                 await signerFactory(bob.sk);
//                 councilStorage  = await councilInstance.storage();
//                 const currentThreshold  = councilStorage.config.threshold;
//                 const updatedThreshold  = councilStorage.councilMembers.size;
//                 var updateConfigOperation   = await councilInstance.methods.updateConfig(updatedThreshold,"configThreshold").send();
//                 await updateConfigOperation.confirmation();

//                 // Initial Values
//                 councilStorage          = await councilInstance.storage();
//                 const newMember         = isaac.pkh;

//                 // Operation
//                 await chai.expect(councilInstance.methods.councilActionRemoveMember(newMember).send()).to.be.rejected;

//                 // Reset config
//                 var updateConfigOperation   = await councilInstance.methods.updateConfig(currentThreshold,"configThreshold").send();
//                 await updateConfigOperation.confirmation();
//             } catch(e){
//                 console.log(e);
//             }
//         });


//         it('Council member should not be able to access this entrypoint if the given member’s address is not in the council', async () => {
//             try{
//                 // Initial Values
//                 councilStorage          = await councilInstance.storage();
//                 const newMember         = isaac.pkh;

//                 // Operation                
//                 await chai.expect(councilInstance.methods.councilActionRemoveMember(newMember).send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Non-council member should not be able to access this entrypoint', async () => {
//             try{
//                 // Initial Values
//                 councilStorage          = await councilInstance.storage();
//                 const newMember         = eve.pkh;

//                 // Operation
//                 await signerFactory(isaac.sk);
//                 await chai.expect(councilInstance.methods.councilActionRemoveMember(newMember).send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });
//     })

//     describe("%councilActionChangeMember", async () => {
//         beforeEach("Set signer to council", async () => {
//             await signerFactory(alice.sk)
//         });
        
//         it('Council member should be able to access this entrypoint and create a new action to replace a council member by another (the action counter should increase in the storage)', async () => {
//             try{
//                 // Initial Values
//                 councilStorage          = await councilInstance.storage();
//                 const oldMember         = eve.pkh;
//                 const newMember         = mallory.pkh;
//                 const nextActionID      = councilStorage.actionCounter;
//                 const newMemberName     = "Member Name";
//                 const newMemberImage    = "Member Image";
//                 const newMemberWebsite  = "Member Website";

//                 // Operation
//                 const newActionOperation = await councilInstance.methods.councilActionChangeMember(oldMember, newMember, newMemberName, newMemberWebsite, newMemberImage).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 const action        = await councilStorage.councilActionsLedger.get(nextActionID);
//                 const actionSigner  = action.signers.includes(alice.pkh)
//                 const addressMap    = await action.addressMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "changeCouncilMember");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(addressMap.get("oldCouncilMemberAddress"), oldMember);
//                 assert.equal(addressMap.get("newCouncilMemberAddress"), newMember);
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Council member should not be able to access this entrypoint if the given old member address is not in the council', async () => {
//             try{
//                 // Initial Values
//                 councilStorage          = await councilInstance.storage();
//                 const oldMember         = mallory.pkh;
//                 const newMember         = isaac.pkh;
//                 const newMemberName     = "Member Name";
//                 const newMemberImage    = "Member Image";
//                 const newMemberWebsite  = "Member Website";

//                 // Operation
//                 await chai.expect(councilInstance.methods.councilActionChangeMember(oldMember, newMember, newMemberName, newMemberWebsite, newMemberImage).send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Council member should not be able to access this entrypoint if the given new member address is already in the council', async () => {
//             try{
//                 // Initial Values
//                 councilStorage          = await councilInstance.storage();
//                 const oldMember         = eve.pkh;
//                 const newMember         = alice.pkh;
//                 const newMemberName     = "Member Name";
//                 const newMemberImage    = "Member Image";
//                 const newMemberWebsite  = "Member Website";

//                 // Operation
//                 await chai.expect(councilInstance.methods.councilActionChangeMember(oldMember, newMember, newMemberName, newMemberWebsite, newMemberImage).send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Non-council member should not be able to access this entrypoint', async () => {
//             try{
//                 // Initial Values
//                 councilStorage          = await councilInstance.storage();
//                 const oldMember         = eve.pkh;
//                 const newMember         = mallory.pkh;
//                 const newMemberName     = "Member Name";
//                 const newMemberImage    = "Member Image";
//                 const newMemberWebsite  = "Member Website";

//                 // Operation
//                 await signerFactory(isaac.sk);
//                 await chai.expect(councilInstance.methods.councilActionChangeMember(oldMember, newMember, newMemberName, newMemberWebsite, newMemberImage).send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });
//     })

//     describe("%councilActionTransfer", async () => {
//         beforeEach("Set signer to council", async () => {
//             await signerFactory(alice.sk)
//         });
        
//         it('Council member should be able to access this entrypoint and create a new action to transfer tokens to given address (the action counter should increase in the storage)', async () => {
//             try{
//                 // Initial Values
//                 councilStorage              = await councilInstance.storage();
//                 const receiverAddress       = eve.pkh;
//                 const tokenContractAddress  = mvkTokenAddress.address;
//                 const tokenType             = "FA2";
//                 const purpose               = "For testing purposes";
//                 const tokenAmount           = MVK(3);
//                 const tokenId               = 0;
//                 const nextActionID          = councilStorage.actionCounter;

//                 // Operation
//                 const newActionOperation = await councilInstance.methods.councilActionTransfer(
//                     receiverAddress,
//                     tokenContractAddress,
//                     tokenAmount,
//                     tokenType,
//                     tokenId,
//                     purpose).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 const action        = await councilStorage.councilActionsLedger.get(nextActionID);
//                 const actionSigner  = action.signers.includes(alice.pkh)
//                 const addressMap    = await action.addressMap;
//                 const stringMap     = await action.stringMap;
//                 const natMap        = await action.natMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "transfer");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(addressMap.get("receiverAddress"), receiverAddress);
//                 assert.equal(addressMap.get("tokenContractAddress"), tokenContractAddress);
//                 assert.equal(stringMap.get("tokenType"), tokenType);
//                 assert.equal(stringMap.get("purpose"), purpose);
//                 assert.equal(natMap.get("tokenAmount"), tokenAmount);
//                 assert.equal(natMap.get("tokenId"), tokenId);
//             } catch(e){
//                 console.log(e);
//             }
//         });
        
//         it('Council member should not be able to access this entrypoint if the given tokenType is not FA12, FA2 or XTZ', async () => {
//             try{
//                 // Initial Values
//                 councilStorage              = await councilInstance.storage();
//                 const receiverAddress       = eve.pkh;
//                 const tokenContractAddress  = mvkTokenAddress.address;
//                 const tokenType             = "FA3";
//                 const purpose               = "For testing purposes";
//                 const tokenAmount           = MVK(3);
//                 const tokenId               = 0;

//                 // Operation
//                 await chai.expect(councilInstance.methods.councilActionTransfer(
//                     receiverAddress,
//                     tokenContractAddress,
//                     tokenAmount,
//                     tokenType,
//                     tokenId,
//                     purpose).send()
//                 ).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Non-council member should not be able to access this entrypoint', async () => {
//             try{
//                 // Initial Values
//                 councilStorage              = await councilInstance.storage();
//                 const receiverAddress       = eve.pkh;
//                 const tokenContractAddress  = mvkTokenAddress.address;
//                 const tokenType             = "FA2";
//                 const purpose               = "For testing purposes";
//                 const tokenAmount           = MVK(3);
//                 const tokenId               = 0;

//                 // Operation
//                 await signerFactory(isaac.sk);
//                 await chai.expect(councilInstance.methods.councilActionTransfer(
//                     receiverAddress,
//                     tokenContractAddress,
//                     tokenAmount,
//                     tokenType,
//                     tokenId,
//                     purpose).send()
//                 ).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });
//     })

//     describe("%councilActionRequestTokens", async () => {
//         beforeEach("Set signer to council", async () => {
//             await signerFactory(alice.sk)
//         });
        
//         it('Council member should be able to access this entrypoint and create a new action to request tokens from the given treasury (the action counter should increase in the storage)', async () => {
//             try{
//                 // Initial Values
//                 councilStorage              = await councilInstance.storage();
//                 const fromTreasury          = treasuryAddress.address;
//                 const tokenContractAddress  = mvkTokenAddress.address;
//                 const tokenName             = "MVK";
//                 const tokenType             = "FA2";
//                 const purpose               = "For testing purposes";
//                 const tokenAmount           = MVK(3);
//                 const tokenId               = 0;
//                 const nextActionID          = councilStorage.actionCounter;

//                 // Operation
//                 const newActionOperation = await councilInstance.methods.councilActionRequestTokens(
//                     fromTreasury,
//                     tokenContractAddress,
//                     tokenName,
//                     tokenAmount,
//                     tokenType,
//                     tokenId,
//                     purpose).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 const action        = await councilStorage.councilActionsLedger.get(nextActionID);
//                 const actionSigner  = action.signers.includes(alice.pkh)
//                 const addressMap    = await action.addressMap;
//                 const stringMap     = await action.stringMap;
//                 const natMap        = await action.natMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "requestTokens");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(addressMap.get("treasuryAddress"), fromTreasury);
//                 assert.equal(addressMap.get("tokenContractAddress"), tokenContractAddress);
//                 assert.equal(stringMap.get("tokenName"), tokenName);
//                 assert.equal(stringMap.get("tokenType"), tokenType);
//                 assert.equal(stringMap.get("purpose"), purpose);
//                 assert.equal(natMap.get("tokenAmount"), tokenAmount);
//                 assert.equal(natMap.get("tokenId"), tokenId);
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Council member should not be able to access this entrypoint if the given tokenType is not FA12, FA2 or XTZ', async () => {
//             try{
//                 // Initial Values
//                 councilStorage              = await councilInstance.storage();
//                 const fromTreasury          = treasuryAddress.address;
//                 const tokenContractAddress  = mvkTokenAddress.address;
//                 const tokenName             = "MVK";
//                 const tokenType             = "FA3";
//                 const purpose               = "For testing purposes";
//                 const tokenAmount           = MVK(3);
//                 const tokenId               = 0;

//                 // Operation
//                 await chai.expect(councilInstance.methods.councilActionRequestTokens(
//                     fromTreasury,
//                     tokenContractAddress,
//                     tokenName,
//                     tokenAmount,
//                     tokenType,
//                     tokenId,
//                     purpose).send()
//                 ).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Non-council member should not be able to access this entrypoint', async () => {
//             try{
//                 // Initial Values
//                 councilStorage              = await councilInstance.storage();
//                 const fromTreasury          = treasuryAddress.address;
//                 const tokenContractAddress  = mvkTokenAddress.address;
//                 const tokenName             = "MVK";
//                 const tokenType             = "FA2";
//                 const purpose               = "For testing purposes";
//                 const tokenAmount           = MVK(3);
//                 const tokenId               = 0;

//                 // Operation
//                 await signerFactory(isaac.sk);
//                 await chai.expect(councilInstance.methods.councilActionRequestTokens(
//                     fromTreasury,
//                     tokenContractAddress,
//                     tokenName,
//                     tokenAmount,
//                     tokenType,
//                     tokenId,
//                     purpose).send()
//                 ).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });
//     })

//     describe("%councilActionRequestMint", async () => {
//         beforeEach("Set signer to council", async () => {
//             await signerFactory(alice.sk)
//         });
        
//         it('Council member should be able to access this entrypoint and create a new action to request a mint from the given treasury (the action counter should increase in the storage)', async () => {
//             try{
//                 // Initial Values
//                 councilStorage              = await councilInstance.storage();
//                 const fromTreasury          = treasuryAddress.address;
//                 const purpose               = "For testing purposes";
//                 const tokenAmount           = MVK(3);
//                 const nextActionID          = councilStorage.actionCounter;

//                 // Operation
//                 const newActionOperation = await councilInstance.methods.councilActionRequestMint(
//                     fromTreasury,
//                     tokenAmount,
//                     purpose).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 const action        = await councilStorage.councilActionsLedger.get(nextActionID);
//                 const actionSigner  = action.signers.includes(alice.pkh)
//                 const addressMap    = await action.addressMap;
//                 const stringMap     = await action.stringMap;
//                 const natMap        = await action.natMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "requestMint");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(addressMap.get("treasuryAddress"), fromTreasury);
//                 assert.equal(stringMap.get("purpose"), purpose);
//                 assert.equal(natMap.get("tokenAmount"), tokenAmount);
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Non-council member should not be able to access this entrypoint', async () => {
//             try{
//                 // Initial Values
//                 councilStorage              = await councilInstance.storage();
//                 const fromTreasury          = treasuryAddress.address;
//                 const purpose               = "For testing purposes";
//                 const tokenAmount           = MVK(3);

//                 // Operation
//                 await signerFactory(isaac.sk);
//                 await chai.expect(councilInstance.methods.councilActionRequestMint(
//                     fromTreasury,
//                     tokenAmount,
//                     purpose).send()
//                 ).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });
//     })

//     describe("%councilActionDropFinancialReq", async () => {
//         beforeEach("Set signer to council", async () => {
//             await signerFactory(alice.sk)
//         });
        
//         it('Council member should be able to access this entrypoint and create a new action to request a mint from the given treasury (the action counter should increase in the storage)', async () => {
//             try{
//                 // Initial Values
//                 councilStorage              = await councilInstance.storage();
//                 const requestID             = councilStorage.actionCounter - 1;
//                 const nextActionID          = councilStorage.actionCounter;

//                 // Operation
//                 const newActionOperation = await councilInstance.methods.councilActionDropFinancialReq(requestID).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 const action        = await councilStorage.councilActionsLedger.get(nextActionID);
//                 const actionSigner  = action.signers.includes(alice.pkh)
//                 const natMap        = await action.natMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "dropFinancialRequest");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(natMap.get("requestId"), requestID);
//             } catch(e){
//                 console.log(e);
//             }
//         });
        
//         it('Council member should not be able to access this entrypoint if the financial request linked to the provided ID doesn’t exist', async () => {
//             try{
//                 // Initial Values
//                 councilStorage              = await councilInstance.storage();
//                 const requestID             = 999;

//                 // Operation
//                 await chai.expect(councilInstance.methods.councilActionDropFinancialReq(requestID).send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });
        
//         it('Council member should not be able to access this entrypoint if the financial request linked to the provided ID was flushed', async () => {
//             try{
//                 // ----- REQUEST MINT
//                 // Initial Values
//                 councilStorage              = await councilInstance.storage();
//                 const fromTreasury          = treasuryAddress.address;
//                 const purpose               = "For testing purposes";
//                 const tokenAmount           = MVK(3);
//                 const mintActionID          = councilStorage.actionCounter;

//                 // Operation
//                 var newActionOperation = await councilInstance.methods.councilActionRequestMint(
//                     fromTreasury,
//                     tokenAmount,
//                     purpose).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 var action          = await councilStorage.councilActionsLedger.get(mintActionID);
//                 var actionSigner    = action.signers.includes(alice.pkh)
//                 var addressMap      = await action.addressMap;
//                 var stringMap       = await action.stringMap;
//                 var natMap          = await action.natMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "requestMint");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(addressMap.get("treasuryAddress"), fromTreasury);
//                 assert.equal(stringMap.get("purpose"), purpose);
//                 assert.equal(natMap.get("tokenAmount"), tokenAmount);

//                 // ----- FLUSH REQUEST
//                 // Initial Values
//                 councilStorage                  = await councilInstance.storage();
//                 const flushActionID             = councilStorage.actionCounter;

//                 // Operation
//                 newActionOperation = await councilInstance.methods.flushAction(mintActionID).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 action              = await councilStorage.councilActionsLedger.get(flushActionID);
//                 actionSigner        = action.signers.includes(alice.pkh)
//                 addressMap          = await action.addressMap;
//                 stringMap           = await action.stringMap;
//                 natMap              = await action.natMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "flushAction");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(natMap.get("actionId").toNumber(), mintActionID.toNumber());

//                 // ----- SIGN FLUSH
//                 await signerFactory(bob.sk)

//                 // Operation
//                 const signOperation = await councilInstance.methods.signAction(flushActionID).send();
//                 await signOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 action              = await councilStorage.councilActionsLedger.get(flushActionID);
//                 addressMap          = await action.addressMap;
//                 stringMap           = await action.stringMap;
//                 natMap              = await action.natMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "EXECUTED");
//                 assert.strictEqual(action.actionType, "flushAction");
//                 assert.equal(action.executed, true);
//                 assert.equal(action.signersCount, 2);
//                 assert.equal(natMap.get("actionId").toNumber(), mintActionID.toNumber());

//                 const flushedAction = await councilStorage.councilActionsLedger.get(mintActionID);
//                 addressMap          = await flushedAction.addressMap;
//                 stringMap           = await flushedAction.stringMap;
//                 natMap              = await flushedAction.natMap;

//                 assert.strictEqual(flushedAction.initiator, alice.pkh);
//                 assert.strictEqual(flushedAction.status, "FLUSHED");
//                 assert.strictEqual(flushedAction.actionType, "requestMint");
//                 assert.equal(flushedAction.executed, false);
//                 assert.equal(flushedAction.signersCount, 1);
//                 assert.equal(addressMap.get("treasuryAddress"), fromTreasury);
//                 assert.equal(stringMap.get("purpose"), purpose);
//                 assert.equal(natMap.get("tokenAmount"), tokenAmount);

//                 // ----- DROP
//                 await signerFactory(alice.sk);
//                 await chai.expect(councilInstance.methods.councilActionDropFinancialReq(mintActionID).send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });
        
//         it('Council member should not be able to access this entrypoint if the financial request linked to the provided ID was executed', async () => {
//             try{
//                 // ----- REQUEST MINT
//                 // Initial Values
//                 councilStorage              = await councilInstance.storage();
//                 const fromTreasury          = treasuryAddress.address;
//                 const purpose               = "For testing purposes";
//                 const tokenAmount           = MVK(3);
//                 const mintActionID          = councilStorage.actionCounter;

//                 // Operation
//                 var newActionOperation = await councilInstance.methods.councilActionRequestMint(
//                     fromTreasury,
//                     tokenAmount,
//                     purpose).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 var action          = await councilStorage.councilActionsLedger.get(mintActionID);
//                 var actionSigner    = action.signers.includes(alice.pkh)
//                 var addressMap      = await action.addressMap;
//                 var stringMap       = await action.stringMap;
//                 var natMap          = await action.natMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "requestMint");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(addressMap.get("treasuryAddress"), fromTreasury);
//                 assert.equal(stringMap.get("purpose"), purpose);
//                 assert.equal(natMap.get("tokenAmount"), tokenAmount);

//                 // ----- SIGN REQUEST
//                 // Operation
//                 await signerFactory(bob.sk)
//                 newActionOperation = await councilInstance.methods.signAction(mintActionID).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 action              = await councilStorage.councilActionsLedger.get(mintActionID);
//                 actionSigner        = action.signers.includes(alice.pkh)
//                 var addressMap      = await action.addressMap;
//                 var stringMap       = await action.stringMap;
//                 var natMap          = await action.natMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "EXECUTED");
//                 assert.strictEqual(action.actionType, "requestMint");
//                 assert.equal(action.executed, true);
//                 assert.equal(action.signersCount, 2);
//                 assert.equal(addressMap.get("treasuryAddress"), fromTreasury);
//                 assert.equal(stringMap.get("purpose"), purpose);
//                 assert.equal(natMap.get("tokenAmount"), tokenAmount);

//                 // ----- DROP
//                 await signerFactory(alice.sk);
//                 await chai.expect(councilInstance.methods.signAction(mintActionID).send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Non-council member should not be able to access this entrypoint', async () => {
//             try{
//                 // Initial Values
//                 councilStorage              = await councilInstance.storage();
//                 const requestID             = councilStorage.actionCounter - 1;

//                 // Operation
//                 await signerFactory(isaac.sk);
//                 await chai.expect(councilInstance.methods.councilActionDropFinancialReq(requestID).send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });
//     })

//     describe("%flushAction", async () => {
//         beforeEach("Set signer to council", async () => {
//             await signerFactory(alice.sk)
//         });

//         it('Council member should be able to access this entrypoint with a correct actionID and create a new action to flush a pending action (the action counter should increase in the storage)', async () => {
//             try{
//                 // Initial Values
//                 councilStorage              = await councilInstance.storage();
//                 const requestID             = 1;
//                 const nextActionID          = councilStorage.actionCounter;

//                 // Operation
//                 const newActionOperation = await councilInstance.methods.flushAction(requestID).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 const action        = await councilStorage.councilActionsLedger.get(nextActionID);
//                 const actionSigner  = action.signers.includes(alice.pkh)
//                 const natMap        = await action.natMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "flushAction");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(natMap.get("actionId"), requestID);
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Council member should not be able to access this entrypoint if the action linked to the provided actionID doesn’t exist', async () => {
//             try{
//                 // Initial Values
//                 councilStorage              = await councilInstance.storage();
//                 const requestID             = 999;

//                 // Operation
//                 await chai.expect(councilInstance.methods.councilActionDropFinancialReq(requestID).send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Council member should not be able to access this entrypoint if the action linked to the provided actionID was flushed', async () => {
//             try{
//                 // ----- ADD MEMBER
//                 // Initial Values
//                 councilStorage              = await councilInstance.storage();
//                 const councilMember         = mallory.pkh;
//                 const memberActionID        = councilStorage.actionCounter;
//                 const newMemberName         = "Member Name";
//                 const newMemberImage        = "Member Image";
//                 const newMemberWebsite      = "Member Website";

//                 // Operation
//                 var newActionOperation = await councilInstance.methods.councilActionAddMember(councilMember, newMemberName, newMemberWebsite, newMemberImage).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 var action          = await councilStorage.councilActionsLedger.get(memberActionID);
//                 var actionSigner    = action.signers.includes(alice.pkh)
//                 var addressMap      = await action.addressMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "addCouncilMember");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(addressMap.get("councilMemberAddress"), councilMember);

//                 // ----- FLUSH ACTION
//                 // Initial Values
//                 councilStorage                  = await councilInstance.storage();
//                 const flushActionID             = councilStorage.actionCounter;

//                 // Operation
//                 newActionOperation = await councilInstance.methods.flushAction(memberActionID).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 action              = await councilStorage.councilActionsLedger.get(flushActionID);
//                 actionSigner        = action.signers.includes(alice.pkh)
//                 const natMap        = await action.natMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "flushAction");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(natMap.get("actionId").toNumber(), memberActionID.toNumber());

//                 // ----- SIGN DROP
//                 await signerFactory(bob.sk)

//                 // Operation
//                 const signOperation = await councilInstance.methods.signAction(flushActionID).send();
//                 await signOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 action              = await councilStorage.councilActionsLedger.get(flushActionID);
//                 const flushedAction = await councilStorage.councilActionsLedger.get(memberActionID);

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "EXECUTED");
//                 assert.strictEqual(action.actionType, "flushAction");
//                 assert.equal(action.executed, true);
//                 assert.equal(action.signersCount, 2);
//                 assert.equal(natMap.get("actionId").toNumber(), memberActionID.toNumber());

//                 assert.strictEqual(flushedAction.initiator, alice.pkh);
//                 assert.strictEqual(flushedAction.status, "FLUSHED");
//                 assert.strictEqual(flushedAction.actionType, "addCouncilMember");
//                 assert.equal(flushedAction.executed, false);
//                 assert.equal(flushedAction.signersCount, 1);
//                 assert.equal(addressMap.get("councilMemberAddress"), councilMember);

//                 // ----- FLUSH AGAIN
//                 await signerFactory(alice.sk);
//                 await chai.expect(councilInstance.methods.flushAction(memberActionID).send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Council member should not be able to access this entrypoint if the action linked to the provided actionID was executed', async () => {
//             try{
//                 // ----- ADD MEMBER
//                 // Initial Values
//                 councilStorage              = await councilInstance.storage();
//                 const councilMember         = mallory.pkh;
//                 const memberActionID        = councilStorage.actionCounter;
//                 const newMemberName         = "Member Name";
//                 const newMemberImage        = "Member Image";
//                 const newMemberWebsite      = "Member Website";

//                 // Operation
//                 var newActionOperation = await councilInstance.methods.councilActionAddMember(councilMember, newMemberName, newMemberWebsite, newMemberImage).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 var action          = await councilStorage.councilActionsLedger.get(memberActionID);
//                 var actionSigner    = action.signers.includes(alice.pkh)
//                 var addressMap      = await action.addressMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "addCouncilMember");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(addressMap.get("councilMemberAddress"), councilMember);

//                 // ----- SIGN ACTION
//                 await signerFactory(bob.sk)

//                 // Operation
//                 const signOperation = await councilInstance.methods.signAction(memberActionID).send();
//                 await signOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 var action          = await councilStorage.councilActionsLedger.get(memberActionID);
//                 var addressMap      = await action.addressMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "EXECUTED");
//                 assert.strictEqual(action.actionType, "addCouncilMember");
//                 assert.equal(action.executed, true);
//                 assert.equal(action.signersCount, 2);
//                 assert.equal(addressMap.get("councilMemberAddress"), councilMember);

//                 // ----- FLUSH
//                 await signerFactory(alice.sk);
//                 await chai.expect(councilInstance.methods.flushAction(memberActionID).send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Non-council member should not be able to access this entrypoint', async () => {
//             try{
//                 // Initial Values
//                 councilStorage              = await councilInstance.storage();
//                 const requestID             = councilStorage.actionCounter - 1;

//                 // Operation
//                 await signerFactory(isaac.sk);
//                 await chai.expect(councilInstance.methods.councilActionDropFinancialReq(requestID).send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });
//     })

//     describe("%signAction", async () => {
//         beforeEach("Set signer to council", async () => {
//             await signerFactory(alice.sk)
//         });

//         it('updateBlocksPerMinute --> should update the blocksPerMinute in the given contract', async () => {
//             try{
//                 // // Set farmFactory admin to governance for test purposes
//                 const givenContractInstance     = await utils.tezos.contract.at(farmFactoryAddress.address);
//                 // const setAdminOperation         = await givenContractInstance.methods.setAdmin(governanceAddress.address).send();
//                 // await setAdminOperation.confirmation();

//                 // Initial Values
//                 councilStorage          = await councilInstance.storage();
//                 const actionValue       = 3;
//                 const nextActionID      = councilStorage.actionCounter;

//                 // Operation
//                 const newActionOperation = await councilInstance.methods.councilActionUpdateBlocksPerMin(farmFactoryAddress.address, actionValue).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 var action          = await councilStorage.councilActionsLedger.get(nextActionID);
//                 var actionSigner    = action.signers.includes(alice.pkh)
//                 var addressMap      = await action.addressMap;
//                 var natMap          = await action.natMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "updateBlocksPerMinute");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(addressMap.get("contractAddress"), farmFactoryAddress.address);
//                 assert.equal(natMap.get("newBlocksPerMinute"), actionValue);

//                 // Operation
//                 await signerFactory(bob.sk)
//                 const signOperation = await councilInstance.methods.signAction(nextActionID).send();
//                 await signOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 var action          = await councilStorage.councilActionsLedger.get(nextActionID);
//                 var actionSigner    = action.signers.includes(alice.pkh)
//                 var addressMap      = await action.addressMap;
//                 var natMap          = await action.natMap;
//                 const givenContractStorage:any  = await givenContractInstance.storage();

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "EXECUTED");
//                 assert.strictEqual(action.actionType, "updateBlocksPerMinute");
//                 assert.equal(action.executed, true);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 2);
//                 assert.equal(addressMap.get("contractAddress"), farmFactoryAddress.address);
//                 assert.equal(natMap.get("newBlocksPerMinute"), actionValue);
//                 assert.equal(givenContractStorage.config, actionValue);
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('addVestee --> should add a new vestee', async () => {
//             try{
//                 // Initial Values
//                 councilStorage          = await councilInstance.storage();
//                 const cliffInMonths     = 0;
//                 const vestingInMonths   = 24;
//                 const vesteeAddress     = isaac.pkh;
//                 const totalAllocated    = MVK(20000000);
//                 const nextActionID      = councilStorage.actionCounter;

//                 // Operation
//                 const newActionOperation = await councilInstance.methods.councilActionAddVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 var action          = await councilStorage.councilActionsLedger.get(nextActionID);
//                 var actionSigner    = action.signers.includes(alice.pkh)
//                 var addressMap      = await action.addressMap;
//                 var natMap          = await action.natMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "addVestee");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(addressMap.get("vesteeAddress"), vesteeAddress);
//                 assert.equal(natMap.get("totalAllocatedAmount"), totalAllocated);
//                 assert.equal(natMap.get("cliffInMonths"), cliffInMonths);
//                 assert.equal(natMap.get("vestingInMonths"), vestingInMonths);

//                 // Operation
//                 await signerFactory(bob.sk)
//                 const signOperation = await councilInstance.methods.signAction(nextActionID).send();
//                 await signOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 var action          = await councilStorage.councilActionsLedger.get(nextActionID);
//                 var actionSigner    = action.signers.includes(alice.pkh)
//                 var addressMap      = await action.addressMap;
//                 var natMap          = await action.natMap;

//                 vestingStorage      = await vestingInstance.storage();
//                 const vestee        = await vestingStorage.vesteeLedger.get(vesteeAddress);

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "EXECUTED");
//                 assert.strictEqual(action.actionType, "addVestee");
//                 assert.equal(action.executed, true);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 2);
//                 assert.equal(addressMap.get("vesteeAddress"), vesteeAddress);
//                 assert.equal(natMap.get("totalAllocatedAmount"), totalAllocated);
//                 assert.equal(natMap.get("cliffInMonths"), cliffInMonths);
//                 assert.equal(natMap.get("vestingInMonths"), vestingInMonths);
//                 assert.notStrictEqual(vestee, undefined);
//                 assert.equal(vestee.totalAllocatedAmount, totalAllocated);
//                 assert.equal(vestee.cliffMonths, cliffInMonths);
//                 assert.equal(vestee.vestingMonths, vestingInMonths);
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('addVestee --> should fail if the addVestee entrypoint doesn’t exist in the vesting contract or if the vesting contract is not in the generalContracts map', async () => {
//             try{
//                 // Initial Values
//                 councilStorage          = await councilInstance.storage();
//                 const cliffInMonths     = 0;
//                 const vestingInMonths   = 24;
//                 const vesteeAddress     = mallory.pkh;
//                 const totalAllocated    = MVK(20000000);
//                 const nextActionID      = councilStorage.actionCounter;

//                 // Operation
//                 const newActionOperation = await councilInstance.methods.councilActionAddVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 var action          = await councilStorage.councilActionsLedger.get(nextActionID);
//                 var actionSigner    = action.signers.includes(alice.pkh)
//                 var addressMap      = await action.addressMap;
//                 var natMap          = await action.natMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "addVestee");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(addressMap.get("vesteeAddress"), vesteeAddress);
//                 assert.equal(natMap.get("totalAllocatedAmount"), totalAllocated);
//                 assert.equal(natMap.get("cliffInMonths"), cliffInMonths);
//                 assert.equal(natMap.get("vestingInMonths"), vestingInMonths);

//                 // Update general contracts
//                 await signerFactory(bob.sk);
//                 var updateOperation = await councilInstance.methods.updateGeneralContracts("vesting", vestingAddress.address).send()
//                 await updateOperation.confirmation();

//                 // Operation
//                 await chai.expect(councilInstance.methods.signAction(nextActionID).send()).to.be.rejected;

//                 // Reset general contracts
//                 updateOperation = await councilInstance.methods.updateGeneralContracts("vesting", vestingAddress.address).send()
//                 await updateOperation.confirmation();
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('updateVestee --> should fail if the addVestee entrypoint doesn’t exist in the vesting contract or if the vesting contract is not in the generalContracts map', async () => {
//             try{
//                 // Initial Values
//                 councilStorage          = await councilInstance.storage();
//                 const cliffInMonths     = 0;
//                 const vestingInMonths   = 12;
//                 const vesteeAddress     = eve.pkh;
//                 const totalAllocated    = MVK(40000000);
//                 const nextActionID      = councilStorage.actionCounter;

//                 // Operation
//                 const newActionOperation = await councilInstance.methods.councilActionUpdateVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 var action          = await councilStorage.councilActionsLedger.get(nextActionID);
//                 var actionSigner    = action.signers.includes(alice.pkh)
//                 var addressMap      = await action.addressMap;
//                 var natMap          = await action.natMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "updateVestee");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(addressMap.get("vesteeAddress"), vesteeAddress);
//                 assert.equal(natMap.get("newTotalAllocatedAmount"), totalAllocated);
//                 assert.equal(natMap.get("newCliffInMonths"), cliffInMonths);
//                 assert.equal(natMap.get("newVestingInMonths"), vestingInMonths);

//                 // Update general contracts
//                 await signerFactory(bob.sk);
//                 var updateOperation = await councilInstance.methods.updateGeneralContracts("vesting", vestingAddress.address).send()
//                 await updateOperation.confirmation();

//                 // Operation
//                 await chai.expect(councilInstance.methods.signAction(nextActionID).send()).to.be.rejected;

//                 // Reset general contracts
//                 updateOperation = await councilInstance.methods.updateGeneralContracts("vesting", vestingAddress.address).send()
//                 await updateOperation.confirmation();
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('updateVestee --> should update a vestee', async () => {
//             try{
//                 // Initial Values
//                 councilStorage          = await councilInstance.storage();
//                 const cliffInMonths     = 0;
//                 const vestingInMonths   = 12;
//                 const vesteeAddress     = eve.pkh;
//                 const totalAllocated    = MVK(40000000);
//                 const nextActionID      = councilStorage.actionCounter;

//                 // Operation
//                 const newActionOperation = await councilInstance.methods.councilActionUpdateVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 var action          = await councilStorage.councilActionsLedger.get(nextActionID);
//                 var actionSigner    = action.signers.includes(alice.pkh)
//                 var addressMap      = await action.addressMap;
//                 var natMap          = await action.natMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "updateVestee");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(addressMap.get("vesteeAddress"), vesteeAddress);
//                 assert.equal(natMap.get("newTotalAllocatedAmount"), totalAllocated);
//                 assert.equal(natMap.get("newCliffInMonths"), cliffInMonths);
//                 assert.equal(natMap.get("newVestingInMonths"), vestingInMonths);

//                 // Operation
//                 await signerFactory(bob.sk)
//                 const signOperation = await councilInstance.methods.signAction(nextActionID).send();
//                 await signOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 var action          = await councilStorage.councilActionsLedger.get(nextActionID);
//                 var actionSigner    = action.signers.includes(alice.pkh)
//                 var addressMap      = await action.addressMap;
//                 var natMap          = await action.natMap;

//                 vestingStorage      = await vestingInstance.storage();
//                 const vestee        = await vestingStorage.vesteeLedger.get(vesteeAddress);

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "EXECUTED");
//                 assert.strictEqual(action.actionType, "updateVestee");
//                 assert.equal(action.executed, true);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 2);
//                 assert.equal(addressMap.get("vesteeAddress"), vesteeAddress);
//                 assert.equal(natMap.get("newTotalAllocatedAmount"), totalAllocated);
//                 assert.equal(natMap.get("newCliffInMonths"), cliffInMonths);
//                 assert.equal(natMap.get("newVestingInMonths"), vestingInMonths);
//                 assert.notStrictEqual(vestee, undefined);
//                 assert.equal(vestee.totalAllocatedAmount, totalAllocated);
//                 assert.equal(vestee.cliffMonths, cliffInMonths);
//                 assert.equal(vestee.vestingMonths, vestingInMonths);
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('toggleVesteeLock --> should fail if the toggleVesteeLock entrypoint doesn’t exist in the vesting contract or if the vesting contract is not in the generalContracts map', async () => {
//             try{
//                 // Initial Values
//                 councilStorage          = await councilInstance.storage();
//                 const vesteeAddress     = eve.pkh;
//                 const nextActionID      = councilStorage.actionCounter;

//                 // Operation
//                 const newActionOperation = await councilInstance.methods.councilActionToggleVesteeLock(vesteeAddress).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 var action          = await councilStorage.councilActionsLedger.get(nextActionID);
//                 var actionSigner    = action.signers.includes(alice.pkh)
//                 var addressMap      = await action.addressMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "toggleVesteeLock");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(addressMap.get("vesteeAddress"), vesteeAddress);

//                 // Update general contracts
//                 await signerFactory(bob.sk);
//                 var updateOperation = await councilInstance.methods.updateGeneralContracts("vesting", vestingAddress.address).send()
//                 await updateOperation.confirmation();

//                 // Operation
//                 await chai.expect(councilInstance.methods.signAction(nextActionID).send()).to.be.rejected;

//                 // Reset general contracts
//                 updateOperation = await councilInstance.methods.updateGeneralContracts("vesting", vestingAddress.address).send()
//                 await updateOperation.confirmation();
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('toggleVesteeLock --> should lock or unlock a vestee', async () => {
//             try{
//                 // Initial Values
//                 councilStorage          = await councilInstance.storage();
//                 const vesteeAddress     = eve.pkh;
//                 const nextActionID      = councilStorage.actionCounter;

//                 // Operation
//                 const newActionOperation = await councilInstance.methods.councilActionToggleVesteeLock(vesteeAddress).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 var action          = await councilStorage.councilActionsLedger.get(nextActionID);
//                 var actionSigner    = action.signers.includes(alice.pkh)
//                 var addressMap      = await action.addressMap;
//                 vestingStorage      = await vestingInstance.storage();
//                 var vestee          = await vestingStorage.vesteeLedger.get(vesteeAddress);

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "toggleVesteeLock");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(addressMap.get("vesteeAddress"), vesteeAddress);
//                 assert.strictEqual(vestee.status, "ACTIVE")

//                 // Operation
//                 await signerFactory(bob.sk);
//                 const signOperation = await councilInstance.methods.signAction(nextActionID).send();
//                 await signOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 var action          = await councilStorage.councilActionsLedger.get(nextActionID);
//                 var actionSigner    = action.signers.includes(alice.pkh)
//                 var addressMap      = await action.addressMap;

//                 vestingStorage      = await vestingInstance.storage();
//                 vestee              = await vestingStorage.vesteeLedger.get(vesteeAddress);

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "EXECUTED");
//                 assert.strictEqual(action.actionType, "toggleVesteeLock");
//                 assert.equal(action.executed, true);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 2);
//                 assert.equal(addressMap.get("vesteeAddress"), vesteeAddress);
//                 assert.notStrictEqual(vestee, undefined);
//                 assert.strictEqual(vestee.status, "LOCKED")
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('removeVestee --> should fail if the removeVestee entrypoint doesn’t exist in the vesting contract or if the vesting contract is not in the generalContracts map', async () => {
//             try{
//                 // Initial Values
//                 councilStorage          = await councilInstance.storage();
//                 const vesteeAddress     = eve.pkh;
//                 const nextActionID      = councilStorage.actionCounter;

//                 // Operation
//                 const newActionOperation = await councilInstance.methods.councilActionRemoveVestee(vesteeAddress).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 var action          = await councilStorage.councilActionsLedger.get(nextActionID);
//                 var actionSigner    = action.signers.includes(alice.pkh)
//                 var addressMap      = await action.addressMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "removeVestee");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(addressMap.get("vesteeAddress"), vesteeAddress);

//                 // Update general contracts
//                 await signerFactory(bob.sk);
//                 var updateOperation = await councilInstance.methods.updateGeneralContracts("vesting", vestingAddress.address).send()
//                 await updateOperation.confirmation();

//                 // Operation                
//                 await chai.expect(councilInstance.methods.signAction(nextActionID).send()).to.be.rejected;

//                 // Update general contracts
//                 var updateOperation = await councilInstance.methods.updateGeneralContracts("vesting", vestingAddress.address).send()
//                 await updateOperation.confirmation();
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('removeVestee --> should remove a vestee', async () => {
//             try{
//                 // Initial Values
//                 councilStorage          = await councilInstance.storage();
//                 const vesteeAddress     = eve.pkh;
//                 const nextActionID      = councilStorage.actionCounter;

//                 // Operation
//                 const newActionOperation = await councilInstance.methods.councilActionRemoveVestee(vesteeAddress).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 var action          = await councilStorage.councilActionsLedger.get(nextActionID);
//                 var actionSigner    = action.signers.includes(alice.pkh)
//                 var addressMap      = await action.addressMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "removeVestee");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(addressMap.get("vesteeAddress"), vesteeAddress);

//                 // Operation
//                 await signerFactory(bob.sk)
//                 const signOperation = await councilInstance.methods.signAction(nextActionID).send();
//                 await signOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 var action          = await councilStorage.councilActionsLedger.get(nextActionID);
//                 var actionSigner    = action.signers.includes(alice.pkh)
//                 var addressMap      = await action.addressMap;

//                 vestingStorage      = await vestingInstance.storage();
//                 const vestee        = await vestingStorage.vesteeLedger.get(vesteeAddress);

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "EXECUTED");
//                 assert.strictEqual(action.actionType, "removeVestee");
//                 assert.equal(action.executed, true);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 2);
//                 assert.equal(addressMap.get("vesteeAddress"), vesteeAddress);
//                 assert.strictEqual(vestee, undefined);
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('addCouncilMember --> should add the given address as a council member if the address is not in it', async () => {
//             try{
//                 // Initial Values
//                 councilStorage              = await councilInstance.storage();
//                 const memberAddress         = david.pkh;
//                 const nextActionID          = councilStorage.actionCounter;
//                 const newMemberName         = "Member Name";
//                 const newMemberImage        = "Member Image";
//                 const newMemberWebsite      = "Member Website";

//                 // Operation
//                 const newActionOperation = await councilInstance.methods.councilActionAddMember(memberAddress, newMemberName, newMemberWebsite, newMemberImage).send();
//                 await newActionOperation.confirmation();

//                 // Action for future test
//                 const futureActionOperation = await councilInstance.methods.councilActionAddMember(memberAddress, newMemberName, newMemberWebsite, newMemberImage).send();
//                 await futureActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 var action          = await councilStorage.councilActionsLedger.get(nextActionID);
//                 var actionSigner    = action.signers.includes(alice.pkh)
//                 var addressMap      = await action.addressMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "addCouncilMember");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(addressMap.get("councilMemberAddress"), memberAddress);

//                 // Operation
//                 await signerFactory(bob.sk)
//                 const signOperation = await councilInstance.methods.signAction(nextActionID).send();
//                 await signOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 var action          = await councilStorage.councilActionsLedger.get(nextActionID);
//                 var actionSigner    = action.signers.includes(alice.pkh)
//                 var addressMap      = await action.addressMap;

//                 const memberUpdated = councilStorage.councilMembers.has(david.pkh);

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "EXECUTED");
//                 assert.strictEqual(action.actionType, "addCouncilMember");
//                 assert.equal(action.executed, true);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 2);
//                 assert.equal(addressMap.get("councilMemberAddress"), memberAddress);
//                 assert.equal(memberUpdated, true);
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('addCouncilMember --> should fail if the member is already a council member', async () => {
//             try{
//                 // Initial Values
//                 councilStorage          = await councilInstance.storage();
//                 const memberAddress     = david.pkh;
//                 const nextActionID      = councilStorage.actionCounter - 1;

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 var action          = await councilStorage.councilActionsLedger.get(nextActionID);
//                 var actionSigner    = action.signers.includes(alice.pkh)
//                 var addressMap      = await action.addressMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "addCouncilMember");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(addressMap.get("councilMemberAddress"), memberAddress);

//                 // Operation
//                 await signerFactory(bob.sk)
//                 await chai.expect(councilInstance.methods.signAction(nextActionID).send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('removeCouncilMember --> should fail if the threshold in the configuration is greater than the expected amount of members after execution', async () => {
//             try{
//                 // Initial Values
//                 councilStorage          = await councilInstance.storage();
//                 const memberAddress     = mallory.pkh;
//                 const nextActionID      = councilStorage.actionCounter;

//                 // Operation
//                 const newActionOperation = await councilInstance.methods.councilActionRemoveMember(memberAddress).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 var action          = await councilStorage.councilActionsLedger.get(nextActionID);
//                 var actionSigner    = action.signers.includes(alice.pkh)
//                 var addressMap      = await action.addressMap;
//                 const councilSize   = councilStorage.councilMembers.size;
//                 const oldThresold   = councilStorage.config.threshold;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "removeCouncilMember");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(addressMap.get("councilMemberAddress"), memberAddress);

//                 // Update config
//                 await signerFactory(bob.sk)
//                 var updateConfigOperation = await councilInstance.methods.updateConfig(councilSize,"configThreshold").send();
//                 await updateConfigOperation.confirmation();

//                 // Operation
//                 var signOperation = await councilInstance.methods.signAction(nextActionID).send();
//                 await signOperation.confirmation();
                
//                 await signerFactory(mallory.sk)
//                 signOperation = await councilInstance.methods.signAction(nextActionID).send();
//                 await signOperation.confirmation();

//                 await signerFactory(david.sk)
//                 signOperation = await councilInstance.methods.signAction(nextActionID).send();
//                 await signOperation.confirmation();

//                 await signerFactory(eve.sk)
//                 await chai.expect(councilInstance.methods.signAction(nextActionID).send()).to.be.rejected;

//                 // Reset config
//                 await signerFactory(bob.sk)
//                 updateConfigOperation = await councilInstance.methods.updateConfig(oldThresold,"configThreshold").send();
//                 await updateConfigOperation.confirmation();
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('removeCouncilMember --> should remove the given address from the council members if the address is in it', async () => {
//             try{
//                 // Initial Values
//                 councilStorage          = await councilInstance.storage();
//                 const memberAddress     = mallory.pkh;
//                 const nextActionID      = councilStorage.actionCounter;

//                 // Operation
//                 const newActionOperation = await councilInstance.methods.councilActionRemoveMember(memberAddress).send();
//                 await newActionOperation.confirmation();

//                 // Action for future test
//                 const futureActionOperation = await councilInstance.methods.councilActionRemoveMember(memberAddress).send();
//                 await futureActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 var action          = await councilStorage.councilActionsLedger.get(nextActionID);
//                 var actionSigner    = action.signers.includes(alice.pkh)
//                 var addressMap      = await action.addressMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "removeCouncilMember");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(addressMap.get("councilMemberAddress"), memberAddress);

//                 // Operation
//                 await signerFactory(bob.sk)
//                 const signOperation = await councilInstance.methods.signAction(nextActionID).send();
//                 await signOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 var action          = await councilStorage.councilActionsLedger.get(nextActionID);
//                 var actionSigner    = action.signers.includes(alice.pkh)
//                 var addressMap      = await action.addressMap;

//                 const memberUpdated = councilStorage.councilMembers.has(mallory.pkh);

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "EXECUTED");
//                 assert.strictEqual(action.actionType, "removeCouncilMember");
//                 assert.equal(action.executed, true);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 2);
//                 assert.equal(addressMap.get("councilMemberAddress"), memberAddress);
//                 assert.equal(memberUpdated, false);
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('removeCouncilMember --> should fail if the member is not a council member', async () => {
//             try{
//                 // Initial Values
//                 councilStorage          = await councilInstance.storage();
//                 const memberAddress     = mallory.pkh;
//                 const nextActionID      = councilStorage.actionCounter - 1;

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 var action          = await councilStorage.councilActionsLedger.get(nextActionID);
//                 var actionSigner    = action.signers.includes(alice.pkh)
//                 var addressMap      = await action.addressMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "removeCouncilMember");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(addressMap.get("councilMemberAddress"), memberAddress);

//                 // Operation
//                 await signerFactory(bob.sk)
//                 await chai.expect(councilInstance.methods.signAction(nextActionID).send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('changeCouncilMember --> should replace an old councilMember with a new one if the old member if the old member is a council member', async () => {
//             try{
//                 // Initial Values
//                 councilStorage          = await councilInstance.storage();
//                 const oldMemberAddress  = eve.pkh;
//                 const newMemberAddress  = isaac.pkh;
//                 const nextActionID      = councilStorage.actionCounter;
//                 const newMemberName     = "Member Name";
//                 const newMemberImage    = "Member Image";
//                 const newMemberWebsite  = "Member Website";

//                 // Operation
//                 const newActionOperation = await councilInstance.methods.councilActionChangeMember(oldMemberAddress, newMemberAddress, newMemberName, newMemberWebsite, newMemberImage).send();
//                 await newActionOperation.confirmation();

//                 // Action for future test
//                 var futureNewAddress  = trudy.pkh;
//                 var futureActionOperation = await councilInstance.methods.councilActionChangeMember(oldMemberAddress, futureNewAddress, newMemberName, newMemberWebsite, newMemberImage).send();
//                 await futureActionOperation.confirmation();

//                 // Action for future test
//                 var futureOldAddress  = alice.pkh;
//                 var futureActionOperation = await councilInstance.methods.councilActionChangeMember(futureOldAddress, newMemberAddress, newMemberName, newMemberWebsite, newMemberImage).send();
//                 await futureActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 var action          = await councilStorage.councilActionsLedger.get(nextActionID);
//                 var actionSigner    = action.signers.includes(alice.pkh)
//                 var addressMap      = await action.addressMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "changeCouncilMember");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(addressMap.get("oldCouncilMemberAddress"), oldMemberAddress);
//                 assert.equal(addressMap.get("newCouncilMemberAddress"), newMemberAddress);

//                 // Operation
//                 await signerFactory(bob.sk)
//                 const signOperation = await councilInstance.methods.signAction(nextActionID).send();
//                 await signOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 var action          = await councilStorage.councilActionsLedger.get(nextActionID);
//                 var actionSigner    = action.signers.includes(alice.pkh)
//                 var addressMap      = await action.addressMap;

//                 const memberRemoved = councilStorage.councilMembers.has(eve.pkh);
//                 const memberAdded = councilStorage.councilMembers.has(isaac.pkh);

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "EXECUTED");
//                 assert.strictEqual(action.actionType, "changeCouncilMember");
//                 assert.equal(action.executed, true);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 2);
//                 assert.equal(addressMap.get("oldCouncilMemberAddress"), oldMemberAddress);
//                 assert.equal(addressMap.get("newCouncilMemberAddress"), newMemberAddress);
//                 assert.equal(memberRemoved, false);
//                 assert.equal(memberAdded, true);
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('changeCouncilMember --> should fail if the old member is not in the council', async () => {
//             try{
//                 // Initial Values
//                 councilStorage          = await councilInstance.storage();
//                 const oldMemberAddress  = eve.pkh;
//                 const newMemberAddress  = trudy.pkh;
//                 const nextActionID      = councilStorage.actionCounter - 2;

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 var action          = await councilStorage.councilActionsLedger.get(nextActionID);
//                 var actionSigner    = action.signers.includes(alice.pkh)
//                 var addressMap      = await action.addressMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "changeCouncilMember");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(addressMap.get("oldCouncilMemberAddress"), oldMemberAddress);
//                 assert.equal(addressMap.get("newCouncilMemberAddress"), newMemberAddress);

//                 // Operation
//                 await signerFactory(bob.sk)
//                 await chai.expect(councilInstance.methods.signAction(nextActionID).send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('changeCouncilMember --> should fail if the new member is already in the council', async () => {
//             try{
//                 // Initial Values
//                 councilStorage          = await councilInstance.storage();
//                 const oldMemberAddress  = alice.pkh;
//                 const newMemberAddress  = isaac.pkh;
//                 const nextActionID      = councilStorage.actionCounter - 1;

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 var action          = await councilStorage.councilActionsLedger.get(nextActionID);
//                 var actionSigner    = action.signers.includes(alice.pkh)
//                 var addressMap      = await action.addressMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "changeCouncilMember");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(addressMap.get("oldCouncilMemberAddress"), oldMemberAddress);
//                 assert.equal(addressMap.get("newCouncilMemberAddress"), newMemberAddress);

//                 // Operation
//                 await signerFactory(bob.sk)
//                 await chai.expect(councilInstance.methods.signAction(nextActionID).send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('transfer --> should transfer tokens from the council contract to a given address', async () => {
//             try{
//                 // Initial Values
//                 councilStorage              = await councilInstance.storage();
//                 const receiverAddress       = eve.pkh;
//                 const tokenContractAddress  = mvkTokenAddress.address;
//                 const tokenType             = "FA2";
//                 const purpose               = "For testing purposes";
//                 const tokenAmount           = MVK(3);
//                 const tokenId               = 0;
//                 const nextActionID          = councilStorage.actionCounter;

//                 // Operation
//                 const newActionOperation = await councilInstance.methods.councilActionTransfer(
//                     receiverAddress,
//                     tokenContractAddress,
//                     tokenAmount,
//                     tokenType,
//                     tokenId,
//                     purpose).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 var action          = await councilStorage.councilActionsLedger.get(nextActionID);
//                 var actionSigner    = action.signers.includes(alice.pkh)
//                 var addressMap      = await action.addressMap;
//                 var stringMap       = await action.stringMap;
//                 var natMap          = await action.natMap;

//                 mvkTokenStorage         = await mvkTokenInstance.storage();
//                 const preCouncilBalance = await mvkTokenStorage.ledger.get(councilAddress.address);
//                 const preUserBalance    = await mvkTokenStorage.ledger.get(eve.pkh);

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "transfer");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(addressMap.get("receiverAddress"), receiverAddress);
//                 assert.equal(addressMap.get("tokenContractAddress"), tokenContractAddress);
//                 assert.equal(stringMap.get("tokenType"), tokenType);
//                 assert.equal(stringMap.get("purpose"), purpose);
//                 assert.equal(natMap.get("tokenAmount"), tokenAmount);
//                 assert.equal(natMap.get("tokenId"), tokenId);

//                 // Operation
//                 await signerFactory(bob.sk)
//                 const signOperation = await councilInstance.methods.signAction(nextActionID).send();
//                 await signOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 var action          = await councilStorage.councilActionsLedger.get(nextActionID);
//                 var actionSigner    = action.signers.includes(alice.pkh)
//                 var addressMap      = await action.addressMap;

//                 mvkTokenStorage             = await mvkTokenInstance.storage();
//                 const postCouncilBalance    = await mvkTokenStorage.ledger.get(councilAddress.address);
//                 const postUserBalance       = await mvkTokenStorage.ledger.get(eve.pkh);

//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "EXECUTED");
//                 assert.strictEqual(action.actionType, "transfer");
//                 assert.equal(action.executed, true);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 2);
//                 assert.equal(addressMap.get("receiverAddress"), receiverAddress);
//                 assert.equal(addressMap.get("tokenContractAddress"), tokenContractAddress);
//                 assert.equal(stringMap.get("tokenType"), tokenType);
//                 assert.equal(stringMap.get("purpose"), purpose);
//                 assert.equal(natMap.get("tokenAmount"), tokenAmount);
//                 assert.equal(natMap.get("tokenId"), tokenId);
//                 assert.notEqual(postCouncilBalance.toNumber(), preCouncilBalance.toNumber());
//                 assert.notEqual(postUserBalance.toNumber(), preUserBalance.toNumber());
//                 assert.equal(postUserBalance.toNumber(), preUserBalance.toNumber() + tokenAmount);
//                 assert.equal(postCouncilBalance.toNumber(), preCouncilBalance.toNumber() - tokenAmount);
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('requestTokens --> should create a request in the governance contract requesting for tokens', async () => {
//             try{
//                 // Initial Values
//                 councilStorage              = await councilInstance.storage();
//                 const fromTreasury          = treasuryAddress.address;
//                 const tokenContractAddress  = mvkTokenAddress.address;
//                 const tokenName             = "MVK";
//                 const tokenType             = "FA2";
//                 const purpose               = "For testing purposes";
//                 const tokenAmount           = MVK(3);
//                 const tokenId               = 0;
//                 const nextActionID          = councilStorage.actionCounter;
//                 governanceStorage           = await governanceInstance.storage();
//                 const governanceActionID    = governanceStorage.financialRequestCounter; 

//                 // Operation
//                 const newActionOperation = await councilInstance.methods.councilActionRequestTokens(
//                     fromTreasury,
//                     tokenContractAddress,
//                     tokenName,
//                     tokenAmount,
//                     tokenType,
//                     tokenId,
//                     purpose).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 var action          = await councilStorage.councilActionsLedger.get(nextActionID);
//                 var actionSigner    = action.signers.includes(alice.pkh)
//                 var addressMap      = await action.addressMap;
//                 var stringMap       = await action.stringMap;
//                 var natMap          = await action.natMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "requestTokens");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(addressMap.get("treasuryAddress"), fromTreasury);
//                 assert.equal(addressMap.get("tokenContractAddress"), tokenContractAddress);
//                 assert.equal(stringMap.get("tokenName"), tokenName);
//                 assert.equal(stringMap.get("tokenType"), tokenType);
//                 assert.equal(stringMap.get("purpose"), purpose);
//                 assert.equal(natMap.get("tokenAmount"), tokenAmount);
//                 assert.equal(natMap.get("tokenId"), tokenId);

//                 // Operation
//                 await signerFactory(bob.sk)
//                 const signOperation = await councilInstance.methods.signAction(nextActionID).send();
//                 await signOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 action              = await councilStorage.councilActionsLedger.get(nextActionID);
//                 actionSigner        = action.signers.includes(alice.pkh)
//                 addressMap          = await action.addressMap;
//                 stringMap           = await action.stringMap;
//                 natMap              = await action.natMap;

//                 governanceStorage       = await governanceInstance.storage();
//                 const governanceAction  = await governanceStorage.financialRequestLedger.get(governanceActionID)

//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "EXECUTED");
//                 assert.strictEqual(action.actionType, "requestTokens");
//                 assert.equal(action.executed, true);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 2);
//                 assert.equal(addressMap.get("treasuryAddress"), fromTreasury);
//                 assert.equal(addressMap.get("tokenContractAddress"), tokenContractAddress);
//                 assert.equal(stringMap.get("tokenName"), tokenName);
//                 assert.equal(stringMap.get("tokenType"), tokenType);
//                 assert.equal(stringMap.get("purpose"), purpose);
//                 assert.equal(natMap.get("tokenAmount"), tokenAmount);
//                 assert.equal(natMap.get("tokenId"), tokenId);
//                 assert.notStrictEqual(governanceAction, undefined);
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('requestMint --> should create a request in the governance contract requesting for a MVK mint', async () => {
//             try{
//                 // Initial Values
//                 councilStorage              = await councilInstance.storage();
//                 const fromTreasury          = treasuryAddress.address;
//                 const purpose               = "For testing purposes";
//                 const tokenAmount           = MVK(3);
//                 const nextActionID          = councilStorage.actionCounter;
//                 governanceStorage           = await governanceInstance.storage();
//                 const governanceActionID    = governanceStorage.financialRequestCounter; 

//                 // Operation
//                 const newActionOperation = await councilInstance.methods.councilActionRequestMint(
//                     fromTreasury,
//                     tokenAmount,
//                     purpose).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 var action          = await councilStorage.councilActionsLedger.get(nextActionID);
//                 var actionSigner    = action.signers.includes(alice.pkh)
//                 var addressMap      = await action.addressMap;
//                 var stringMap       = await action.stringMap;
//                 var natMap          = await action.natMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "requestMint");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(addressMap.get("treasuryAddress"), fromTreasury);
//                 assert.equal(stringMap.get("purpose"), purpose);
//                 assert.equal(natMap.get("tokenAmount"), tokenAmount);

//                 // Operation
//                 await signerFactory(bob.sk)
//                 const signOperation = await councilInstance.methods.signAction(nextActionID).send();
//                 await signOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 action              = await councilStorage.councilActionsLedger.get(nextActionID);
//                 actionSigner        = action.signers.includes(alice.pkh)
//                 addressMap          = await action.addressMap;
//                 stringMap           = await action.stringMap;
//                 natMap              = await action.natMap;

//                 governanceStorage       = await governanceInstance.storage();
//                 const governanceAction  = await governanceStorage.financialRequestLedger.get(governanceActionID)

//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "EXECUTED");
//                 assert.strictEqual(action.actionType, "requestMint");
//                 assert.equal(action.executed, true);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 2);
//                 assert.equal(addressMap.get("treasuryAddress"), fromTreasury);
//                 assert.equal(stringMap.get("purpose"), purpose);
//                 assert.equal(natMap.get("tokenAmount"), tokenAmount);
//                 assert.notStrictEqual(governanceAction, undefined);
//             } catch(e){
//                 console.log(e);
//             }
//         });
        
//         it('dropFinancialRequest --> should drop a financial request in the governance contract', async () => {
//             try{
//                 // Initial Values
//                 councilStorage              = await councilInstance.storage();
//                 governanceStorage           = await governanceInstance.storage();
//                 const requestID             = governanceStorage.financialRequestCounter - 1;
//                 const nextActionID          = councilStorage.actionCounter;

//                 // Operation
//                 const newActionOperation = await councilInstance.methods.councilActionDropFinancialReq(requestID).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 var action          = await councilStorage.councilActionsLedger.get(nextActionID);
//                 var actionSigner    = action.signers.includes(alice.pkh)
//                 var natMap          = await action.natMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "dropFinancialRequest");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(natMap.get("requestId"), requestID);

//                 // Operation
//                 await signerFactory(bob.sk)
//                 const signOperation = await councilInstance.methods.signAction(nextActionID).send();
//                 await signOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 action              = await councilStorage.councilActionsLedger.get(nextActionID);
//                 actionSigner        = action.signers.includes(alice.pkh)
//                 natMap              = await action.natMap;

//                 governanceStorage       = await governanceInstance.storage();
//                 const dropAction        = await governanceStorage.financialRequestLedger.get(requestID)

//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "EXECUTED");
//                 assert.strictEqual(action.actionType, "dropFinancialRequest");
//                 assert.equal(action.executed, true);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 2);
//                 assert.equal(natMap.get("requestId"), requestID);
//                 assert.equal(dropAction.status, false);
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('flushAction --> should fail if the action was executed', async () => {
//             try{
//                 // ----- REQUEST MINT
//                 // Initial Values
//                 councilStorage              = await councilInstance.storage();
//                 const fromTreasury          = treasuryAddress.address;
//                 const purpose               = "For testing purposes";
//                 const tokenAmount           = MVK(3);
//                 const mintActionID          = councilStorage.actionCounter;

//                 // Operation
//                 var newActionOperation = await councilInstance.methods.councilActionRequestMint(
//                     fromTreasury,
//                     tokenAmount,
//                     purpose).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 var action          = await councilStorage.councilActionsLedger.get(mintActionID);
//                 var actionSigner    = action.signers.includes(alice.pkh)
//                 var addressMap      = await action.addressMap;
//                 var stringMap       = await action.stringMap;
//                 var natMap          = await action.natMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "requestMint");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(addressMap.get("treasuryAddress"), fromTreasury);
//                 assert.equal(stringMap.get("purpose"), purpose);
//                 assert.equal(natMap.get("tokenAmount"), tokenAmount);

//                 // ----- FLUSH REQUEST
//                 // Initial Values
//                 councilStorage                  = await councilInstance.storage();
//                 const flushActionID             = councilStorage.actionCounter;

//                 // Operation
//                 newActionOperation = await councilInstance.methods.flushAction(mintActionID).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 action              = await councilStorage.councilActionsLedger.get(flushActionID);
//                 actionSigner        = action.signers.includes(alice.pkh)
//                 natMap              = await action.natMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "flushAction");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(natMap.get("actionId").toNumber(), mintActionID.toNumber());

//                 // ----- SIGN MINT
//                 await signerFactory(bob.sk)

//                 // Operation
//                 var signOperation = await councilInstance.methods.signAction(mintActionID).send();
//                 await signOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 action              = await councilStorage.councilActionsLedger.get(mintActionID);
//                 natMap              = await action.natMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "EXECUTED");
//                 assert.strictEqual(action.actionType, "requestMint");
//                 assert.equal(action.executed, true);
//                 assert.equal(action.signersCount, 2);
//                 assert.equal(addressMap.get("treasuryAddress"), fromTreasury);
//                 assert.equal(stringMap.get("purpose"), purpose);
//                 assert.equal(natMap.get("tokenAmount"), tokenAmount);

//                 // ----- SIGN FLUSH
//                 // Operation
//                 await chai.expect(councilInstance.methods.signAction(flushActionID).send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('flushAction --> should fail if the action was flushed', async () => {
//             try{
//                 // ----- REQUEST MINT
//                 // Initial Values
//                 councilStorage              = await councilInstance.storage();
//                 const fromTreasury          = treasuryAddress.address;
//                 const purpose               = "For testing purposes";
//                 const tokenAmount           = MVK(3);
//                 const mintActionID          = councilStorage.actionCounter;

//                 // Operation
//                 var newActionOperation = await councilInstance.methods.councilActionRequestMint(
//                     fromTreasury,
//                     tokenAmount,
//                     purpose).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 var action          = await councilStorage.councilActionsLedger.get(mintActionID);
//                 var actionSigner    = action.signers.includes(alice.pkh)
//                 var addressMap      = await action.addressMap;
//                 var stringMap       = await action.stringMap;
//                 var natMap          = await action.natMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "requestMint");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(addressMap.get("treasuryAddress"), fromTreasury);
//                 assert.equal(stringMap.get("purpose"), purpose);
//                 assert.equal(natMap.get("tokenAmount"), tokenAmount);

//                 // ----- FLUSH REQUEST
//                 // Initial Values
//                 councilStorage                  = await councilInstance.storage();
//                 const flushActionID             = councilStorage.actionCounter;

//                 // Operation
//                 newActionOperation = await councilInstance.methods.flushAction(mintActionID).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 action              = await councilStorage.councilActionsLedger.get(flushActionID);
//                 actionSigner        = action.signers.includes(alice.pkh)
//                 natMap              = await action.natMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "flushAction");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(natMap.get("actionId").toNumber(), mintActionID.toNumber());

//                 // ----- SECOND FLUSH REQUEST
//                 // Initial Values
//                 councilStorage                  = await councilInstance.storage();
//                 const reflushActionID           = councilStorage.actionCounter;

//                 // Operation
//                 newActionOperation = await councilInstance.methods.flushAction(mintActionID).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 action              = await councilStorage.councilActionsLedger.get(reflushActionID);
//                 actionSigner        = action.signers.includes(alice.pkh)
//                 natMap              = await action.natMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "flushAction");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(natMap.get("actionId").toNumber(), mintActionID.toNumber());

//                 // ----- SIGN FIRST FLUSH
//                 await signerFactory(bob.sk)

//                 // Operation
//                 var signOperation = await councilInstance.methods.signAction(flushActionID).send();
//                 await signOperation.confirmation();

//                 // ----- TRY SECOND FLUSH
//                 // Operation
//                 await chai.expect(councilInstance.methods.signAction(flushActionID).send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('flushAction --> should flush a pending action', async () => {
//             try{
//                 // ----- REQUEST MINT
//                 // Initial Values
//                 councilStorage              = await councilInstance.storage();
//                 const fromTreasury          = treasuryAddress.address;
//                 const purpose               = "For testing purposes";
//                 const tokenAmount           = MVK(3);
//                 const mintActionID          = councilStorage.actionCounter;

//                 // Operation
//                 var newActionOperation = await councilInstance.methods.councilActionRequestMint(
//                     fromTreasury,
//                     tokenAmount,
//                     purpose).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 var action          = await councilStorage.councilActionsLedger.get(mintActionID);
//                 var actionSigner    = action.signers.includes(alice.pkh)
//                 var addressMap      = await action.addressMap;
//                 var stringMap       = await action.stringMap;
//                 var natMap          = await action.natMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "requestMint");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(addressMap.get("treasuryAddress"), fromTreasury);
//                 assert.equal(stringMap.get("purpose"), purpose);
//                 assert.equal(natMap.get("tokenAmount"), tokenAmount);

//                 // ----- FLUSH REQUEST
//                 // Initial Values
//                 councilStorage                  = await councilInstance.storage();
//                 const flushActionID             = councilStorage.actionCounter;

//                 // Operation
//                 newActionOperation = await councilInstance.methods.flushAction(mintActionID).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 action              = await councilStorage.councilActionsLedger.get(flushActionID);
//                 actionSigner        = action.signers.includes(alice.pkh)
//                 natMap              = await action.natMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "flushAction");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(natMap.get("actionId").toNumber(), mintActionID.toNumber());

//                 // ----- SIGN FIRST FLUSH
//                 await signerFactory(bob.sk)

//                 // Operation
//                 var signOperation = await councilInstance.methods.signAction(flushActionID).send();
//                 await signOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 action              = await councilStorage.councilActionsLedger.get(flushActionID);
//                 actionSigner        = action.signers.includes(alice.pkh)
//                 natMap              = await action.natMap;

//                 const flushedAction = await councilStorage.councilActionsLedger.get(mintActionID);

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "EXECUTED");
//                 assert.strictEqual(action.actionType, "flushAction");
//                 assert.equal(action.executed, true);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 2);
//                 assert.equal(natMap.get("actionId").toNumber(), mintActionID.toNumber());
//                 assert.strictEqual(flushedAction.status, "FLUSHED");
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Council member should not be able to access this entrypoint if the action linked to the provided actionID was flushed', async () => {
//             try{
//                 // Initial values
//                 await signerFactory(bob.sk)
//                 councilStorage              = await councilInstance.storage();
//                 const flushedActionID       = councilStorage.actionCounter - 2;

//                 // Operation
//                 await chai.expect(councilInstance.methods.signAction(flushedActionID).send()).to.be.rejected;
//                 const flushedAction = await councilStorage.councilActionsLedger.get(flushedActionID);
//                 assert.strictEqual(flushedAction.status, "FLUSHED");
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Council member should not be able to access this entrypoint if the action linked to the provided actionID was executed', async () => {
//             try{
//                 // Initial values
//                 await signerFactory(bob.sk)
//                 councilStorage              = await councilInstance.storage();
//                 const executedActionID      = councilStorage.actionCounter - 1;

//                 // Operation
//                 await chai.expect(councilInstance.methods.signAction(executedActionID).send()).to.be.rejected;
//                 const executedAction = await councilStorage.councilActionsLedger.get(executedActionID);
//                 assert.strictEqual(executedAction.status, "EXECUTED");
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Council member should not be able to access this entrypoint if the action linked to the provided actionID doesn’t exist', async () => {
//             try{
//                 // Initial values
//                 await signerFactory(bob.sk)
//                 councilStorage              = await councilInstance.storage();
//                 const flushedActionID       = 999;

//                 // Operation
//                 await chai.expect(councilInstance.methods.signAction(flushedActionID).send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Council member should not be able to sign the same action twice or more', async () => {
//             try{
//                 // ----- REQUEST MINT
//                 // Initial Values
//                 councilStorage              = await councilInstance.storage();
//                 const fromTreasury          = treasuryAddress.address;
//                 const purpose               = "For testing purposes";
//                 const tokenAmount           = MVK(3);
//                 const mintActionID          = councilStorage.actionCounter;

//                 // Operation
//                 var newActionOperation = await councilInstance.methods.councilActionRequestMint(
//                     fromTreasury,
//                     tokenAmount,
//                     purpose).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 var action          = await councilStorage.councilActionsLedger.get(mintActionID);
//                 var actionSigner    = action.signers.includes(alice.pkh)
//                 var addressMap      = await action.addressMap;
//                 var stringMap       = await action.stringMap;
//                 var natMap          = await action.natMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "requestMint");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(addressMap.get("treasuryAddress"), fromTreasury);
//                 assert.equal(stringMap.get("purpose"), purpose);
//                 assert.equal(natMap.get("tokenAmount"), tokenAmount);

//                 // Operation
//                 await signerFactory(trudy.sk);
//                 await chai.expect(councilInstance.methods.signAction(mintActionID).send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Non-council contract should not be able to access this entrypoint', async () => {
//             try{
//                 // ----- REQUEST MINT
//                 // Initial Values
//                 councilStorage              = await councilInstance.storage();
//                 const fromTreasury          = treasuryAddress.address;
//                 const purpose               = "For testing purposes";
//                 const tokenAmount           = MVK(3);
//                 const mintActionID          = councilStorage.actionCounter;

//                 // Operation
//                 var newActionOperation = await councilInstance.methods.councilActionRequestMint(
//                     fromTreasury,
//                     tokenAmount,
//                     purpose).send();
//                 await newActionOperation.confirmation();

//                 // Final values
//                 councilStorage      = await councilInstance.storage();
//                 var action          = await councilStorage.councilActionsLedger.get(mintActionID);
//                 var actionSigner    = action.signers.includes(alice.pkh)
//                 var addressMap      = await action.addressMap;
//                 var stringMap       = await action.stringMap;
//                 var natMap          = await action.natMap;

//                 // Assertions
//                 assert.strictEqual(action.initiator, alice.pkh);
//                 assert.strictEqual(action.status, "PENDING");
//                 assert.strictEqual(action.actionType, "requestMint");
//                 assert.equal(action.executed, false);
//                 assert.equal(actionSigner, true);
//                 assert.equal(action.signersCount, 1);
//                 assert.equal(addressMap.get("treasuryAddress"), fromTreasury);
//                 assert.equal(stringMap.get("purpose"), purpose);
//                 assert.equal(natMap.get("tokenAmount"), tokenAmount);

//                 // Operation
//                 await signerFactory(alice.sk);
//                 await chai.expect(councilInstance.methods.signAction(mintActionID).send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });
//     })
// });