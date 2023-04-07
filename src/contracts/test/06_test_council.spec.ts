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

import { bob, alice, eve, mallory, oscar, trudy, isaac, david } from "../scripts/sandbox/accounts";
import * as helperFunctions from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("Test: Council Contract", async () => {
    
    var utils: Utils;
    let tezos

    // basic inputs for updating operators
    let doormanAddress
    let councilAddress
    let tokenId = 0
    let tokenAmount
    
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

    // housekeeping operations
    let setAdminOperation
    let setGovernanceOperation
    let resetAdminOperation
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


        // Setup funds in Council for transfer later
        // ------------------------------------------------------------------
        const councilAddress = contractDeployments.council.address;

        // Alice transfers 250 XTZ to Council
        await helperFunctions.signerFactory(tezos, alice.sk)
        const aliceTransferTezToCouncilOperation = await utils.tezos.contract.transfer({ to: councilAddress, amount: 250});
        await aliceTransferTezToCouncilOperation.confirmation();

        // set token amount to 250 tokens
        tokenAmount = 250000000;

        // Mallory transfers 0.250 MVK tokens to Treasury
        await helperFunctions.signerFactory(tezos, mallory.sk);
        transferOperation = await helperFunctions.fa2Transfer(mvkTokenInstance, mallory.pkh, councilAddress, tokenId, tokenAmount);
        await transferOperation.confirmation();

        // Mallory transfers 250 Mavryk FA12 Tokens to Council
        transferOperation = await helperFunctions.fa12Transfer(mavrykFa2TokenInstance, mallory.pkh, councilAddress, tokenAmount);
        await transferOperation.confirmation();

        // Mallory transfers 250 Mavryk FA2 Tokens to Council
        transferOperation = await helperFunctions.fa2Transfer(mavrykFa2TokenInstance, mallory.pkh, councilAddress, tokenId, tokenAmount);
        await transferOperation.confirmation();

    });

    // describe("%setAdmin", async () => {

    //     beforeEach("Set signer to admin", async () => {
    //         await helperFunctions.signerFactory(tezos, bob.sk)
    //     });
    //     it('Admin should be able to call this entrypoint and update the contract administrator with a new address', async () => {
    //         try{

    //             // Initial Values
    //             councilStorage = await councilInstance.storage();
    //             const currentAdmin = councilStorage.admin;

    //             // Operation
    //             const setAdminOperation = await councilInstance.methods.setAdmin(alice.pkh).send();
    //             await setAdminOperation.confirmation();

    //             // Final values
    //             councilStorage = await councilInstance.storage();
    //             const newAdmin = councilStorage.admin;

    //             // reset admin
    //             await helperFunctions.signerFactory(tezos, alice.sk);
    //             const resetAdminOperation = await councilInstance.methods.setAdmin(bob.pkh).send();
    //             await resetAdminOperation.confirmation();

    //             // Assertions
    //             assert.notStrictEqual(newAdmin, currentAdmin);
    //             assert.strictEqual(newAdmin, alice.pkh);
    //             assert.strictEqual(currentAdmin, bob.pkh);

    //         } catch(e){
    //             console.dir(e, {depth: 5});
    //         }
    //     });

    //     it('Non-admin should not be able to call this entrypoint', async () => {
    //         try{
    //             // Initial Values
    //             await helperFunctions.signerFactory(tezos, alice.sk);
    //             councilStorage = await councilInstance.storage();
    //             const currentAdmin = councilStorage.admin;

    //             // Operation
    //             await chai.expect(councilInstance.methods.setAdmin(alice.pkh).send()).to.be.rejected;

    //             // Final values
    //             councilStorage = await councilInstance.storage();
    //             const newAdmin = councilStorage.admin;

    //             // Assertions
    //             assert.strictEqual(newAdmin, currentAdmin);
    //         } catch(e){
    //             console.dir(e, {depth: 5});
    //         }
    //     });
    // });

    // describe("%updateConfig", async () => {
    //     beforeEach("Set signer to admin", async () => {
    //         await helperFunctions.signerFactory(tezos, bob.sk)
    //     });

    //     it('Admin should be able to call the entrypoint and configure the signer threshold', async () => {
    //         try{
    //             // Initial Values
    //             councilStorage = await councilInstance.storage();
    //             const newConfigValue = 2;

    //             // Operation
    //             const updateConfigOperation = await councilInstance.methods.updateConfig(newConfigValue,"configThreshold").send();
    //             await updateConfigOperation.confirmation();

    //             // Final values
    //             councilStorage = await councilInstance.storage();
    //             const updateConfigValue = councilStorage.config.threshold;

    //             // Assertions
    //             assert.equal(updateConfigValue, newConfigValue);
    //         } catch(e){
    //             console.dir(e, {depth: 5});
    //         }
    //     });

    //     it('Admin should not be able to call the entrypoint and configure the signer threshold if it is greater than the amount of members in the council', async () => {
    //         try{
    //             // Initial Values
    //             councilStorage = await councilInstance.storage();
    //             const currentConfigValue = councilStorage.config.threshold;
    //             const newConfigValue = 999

    //             // Operation
    //             await chai.expect(councilInstance.methods.updateConfig(newConfigValue,"configThreshold").send()).to.be.rejected;

    //             // Final values
    //             councilStorage = await councilInstance.storage();
    //             const updateConfigValue = councilStorage.config.threshold;

    //             // Assertions
    //             assert.notEqual(newConfigValue, currentConfigValue);
    //             assert.equal(updateConfigValue.toNumber(), currentConfigValue.toNumber());
    //         } catch(e){
    //             console.dir(e, {depth: 5});
    //         }
    //     });

    //     it('Admin should be able to call the entrypoint and configure the action expiry in days', async () => {
    //         try{
    //             // Initial Values
    //             councilStorage = await councilInstance.storage();
    //             const newConfigValue = 1;

    //             // Operation
    //             const updateConfigOperation = await councilInstance.methods.updateConfig(newConfigValue,"configActionExpiryDays").send();
    //             await updateConfigOperation.confirmation();

    //             // Final values
    //             councilStorage = await councilInstance.storage();
    //             const updateConfigValue = councilStorage.config.actionExpiryDays;

    //             // Assertions
    //             assert.equal(updateConfigValue, newConfigValue);
    //         } catch(e){
    //             console.dir(e, {depth: 5});
    //         }
    //     });
    
    //     it('Non-admin should not be able to call the entrypoint', async () => {
    //         try{
    //             // Initial Values
    //             councilStorage = await councilInstance.storage();
    //             const newConfigValue = 1;

    //             // Operation
    //             await helperFunctions.signerFactory(tezos, alice.sk);
    //             await chai.expect(councilInstance.methods.updateConfig(newConfigValue,"configThreshold").send()).to.be.rejected;
    //         } catch(e){
    //             console.dir(e, {depth: 5});
    //         }
    //     });
    // })

    describe("%updateCouncilMemberInfo", async () => {
        beforeEach("Set signer to council member", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk)
        });
        it('Council member should be able to call this entrypoint and update its information', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                var councilMember       = councilStorage.councilMembers.get(bob.pkh);
                const oldMemberName     = councilMember.name
                const oldMemberImage    = councilMember.image
                const oldMemberWebsite  = councilMember.website
                const newMemberName     = "Member Name";
                const newMemberImage    = "Member Image";
                const newMemberWebsite  = "Member Website";

                // Operation
                const updateOperation = await councilInstance.methods.updateCouncilMemberInfo(newMemberName, newMemberWebsite, newMemberImage).send();
                await updateOperation.confirmation();

                // Final values
                councilStorage  = await councilInstance.storage();
                councilMember   = councilStorage.councilMembers.get(bob.pkh);

                // Assertions
                assert.strictEqual(councilMember.name, newMemberName);
                assert.strictEqual(councilMember.image, newMemberImage);
                assert.strictEqual(councilMember.website, newMemberWebsite);
                assert.notStrictEqual(councilMember.name, oldMemberName);
                assert.notStrictEqual(councilMember.image, oldMemberImage);
                assert.notStrictEqual(councilMember.website, oldMemberWebsite);
                
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Non-council member should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                await helperFunctions.signerFactory(tezos, oscar.sk);
                councilStorage = await councilInstance.storage();
                const newMemberName     = "Member Name";
                const newMemberImage    = "Member Image";
                const newMemberWebsite  = "Member Website";

                // Operation
                await chai.expect(councilInstance.methods.updateCouncilMemberInfo(newMemberName, newMemberWebsite, newMemberImage).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    });

    describe("%councilActionAddVestee", async () => {
        beforeEach("Set signer to council", async () => {
            await helperFunctions.signerFactory(tezos, alice.sk)
        });
        
        it('Council member should be able to access this entrypoint and create a new action to add a new vestee (the action counter should increase in the storage)', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const cliffInMonths     = 0;
                const vestingInMonths   = 24;
                const vesteeAddress     = eve.pkh;
                const totalAllocated    = MVK(20000000);
                const nextActionID      = councilStorage.actionCounter;

                // Operation
                const newActionOperation = await councilInstance.methods.councilActionAddVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                const action                        = await councilStorage.councilActionsLedger.get(nextActionID);
                const actionSigner                  = action.signers.includes(alice.pkh)
                const dataMap                       = await action.dataMap;
                const packedVesteeAddress           = (await utils.tezos.rpc.packData({ data: { string: vesteeAddress }, type: { prim: 'address' } })).packed
                const packedTotalAllocatedAmount    = (await utils.tezos.rpc.packData({ data: { int: totalAllocated.toString() }, type: { prim: 'nat' } })).packed
                const packedCliffInMonths           = (await utils.tezos.rpc.packData({ data: { int: cliffInMonths.toString() }, type: { prim: 'nat' } })).packed
                const packedVestingInMonths         = (await utils.tezos.rpc.packData({ data: { int: vestingInMonths.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "addVestee");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("vesteeAddress"), packedVesteeAddress);
                assert.equal(dataMap.get("totalAllocatedAmount"), packedTotalAllocatedAmount);
                assert.equal(dataMap.get("cliffInMonths"), packedCliffInMonths);
                assert.equal(dataMap.get("vestingInMonths"), packedVestingInMonths);

                // Approve vestee for following tests
                await helperFunctions.signerFactory(tezos, bob.sk)
                const signOperation = await councilInstance.methods.signAction(nextActionID).send();
                await signOperation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Council member should not be able to call this entrypoint if the vestee already exists', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const cliffInMonths     = 0;
                const vestingInMonths   = 24;
                const vesteeAddress     = eve.pkh;
                const totalAllocated    = MVK(20000000);

                // Operation                
                await chai.expect(councilInstance.methods.councilActionAddVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Council member should not be able to access this entrypoint if the Vesting contract is not in the generalContact maps and if it does not contains an AddVestee entrypoint', async () => {
            try{
                // Update general contracts
                await helperFunctions.signerFactory(tezos, bob.sk);
                var updateOperation = await governanceInstance.methods.updateGeneralContracts("vesting", contractDeployments.vesting.address).send()
                await updateOperation.confirmation();

                // Initial Values
                councilStorage       = await councilInstance.storage();
                const cliffInMonths     = 0;
                const vestingInMonths   = 24;
                const vesteeAddress     = eve.pkh;
                const totalAllocated    = MVK(20000000);

                // Operation
                await helperFunctions.signerFactory(tezos, alice.sk);
                await chai.expect(councilInstance.methods.councilActionAddVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths).send()).to.be.rejected;

                // Reset general contracts
                await helperFunctions.signerFactory(tezos, bob.sk);
                updateOperation = await governanceInstance.methods.updateGeneralContracts("vesting", contractDeployments.vesting.address).send()
                await updateOperation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Non-council member should not be able to access this entrypoint', async () => {
            try{
                // Initial Values
                councilStorage       = await councilInstance.storage();
                const cliffInMonths     = 0;
                const vestingInMonths   = 24;
                const vesteeAddress     = eve.pkh;
                const totalAllocated    = MVK(20000000);

                // Operation
                await helperFunctions.signerFactory(tezos, isaac.sk);
                await chai.expect(councilInstance.methods.councilActionAddVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    })

    describe("%councilActionRemoveVestee", async () => {
        beforeEach("Set signer to council", async () => {
            await helperFunctions.signerFactory(tezos, alice.sk)
            vestingStorage  = await vestingInstance.storage();
        });
        
        it('Council member should not be able to call this entrypoint if the vestee does not exist', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const vesteeAddress     = alice.pkh;

                // Operation
                await chai.expect(councilInstance.methods.councilActionRemoveVestee(vesteeAddress).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Council member should not be able to access this entrypoint if the Vesting contract is not in the generalContact maps and if it does not contains an RemoveVestee entrypoint', async () => {
            try{
                // Update general contracts
                await helperFunctions.signerFactory(tezos, bob.sk);
                var updateOperation = await governanceInstance.methods.updateGeneralContracts("vesting", contractDeployments.vesting.address).send()
                await updateOperation.confirmation();

                // Initial Values
                councilStorage          = await councilInstance.storage();
                const vesteeAddress     = eve.pkh;

                // Operation
                await helperFunctions.signerFactory(tezos, alice.sk);
                await chai.expect(councilInstance.methods.councilActionRemoveVestee(vesteeAddress).send()).to.be.rejected;

                // Reset general contracts
                await helperFunctions.signerFactory(tezos, bob.sk);
                updateOperation = await governanceInstance.methods.updateGeneralContracts("vesting", contractDeployments.vesting.address).send()
                await updateOperation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Non-council member should not be able to access this entrypoint', async () => {
            try{
                // Initial Values
                councilStorage       = await councilInstance.storage();
                const vesteeAddress     = eve.pkh;

                // Operation
                await helperFunctions.signerFactory(tezos, isaac.sk);
                await chai.expect(councilInstance.methods.councilActionRemoveVestee(vesteeAddress).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Council member should be able to access this entrypoint and create a new action to remove a vestee (the action counter should increase in the storage)', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const vesteeAddress     = eve.pkh;
                const nextActionID      = councilStorage.actionCounter;

                // Operation
                const newActionOperation = await councilInstance.methods.councilActionRemoveVestee(vesteeAddress).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage              = await councilInstance.storage();
                const action                = await councilStorage.councilActionsLedger.get(nextActionID);
                const actionSigner          = action.signers.includes(alice.pkh)
                const dataMap               = await action.dataMap;
                const packedVesteeAddress   = (await utils.tezos.rpc.packData({ data: { string: vesteeAddress }, type: { prim: 'address' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "removeVestee");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("vesteeAddress"), packedVesteeAddress);

                // Remove vestee for following tests
                await helperFunctions.signerFactory(tezos, bob.sk)
                const signOperation = await councilInstance.methods.signAction(nextActionID).send();
                await signOperation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

    })

    describe("%councilActionUpdateVestee", async () => {
        before("Add vestee again", async () => {
            await helperFunctions.signerFactory(tezos, alice.sk)
            // Initial Values
            councilStorage          = await councilInstance.storage();
            const cliffInMonths     = 0;
            const vestingInMonths   = 24;
            const vesteeAddress     = eve.pkh;
            const totalAllocated    = MVK(20000000);
            const nextActionID      = councilStorage.actionCounter;

            // Operation
            const newActionOperation = await councilInstance.methods.councilActionAddVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths).send();
            await newActionOperation.confirmation();

            // Approve vestee for following tests
            await helperFunctions.signerFactory(tezos, bob.sk)
            const signOperation = await councilInstance.methods.signAction(nextActionID).send();
            await signOperation.confirmation();
        });

        beforeEach("Set signer to council", async () => {
            await helperFunctions.signerFactory(tezos, alice.sk)
        });
        
        it('Council member should be able to access this entrypoint and create a new action to update a  vestee (the action counter should increase in the storage)', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const cliffInMonths     = 0;
                const vestingInMonths   = 12;
                const vesteeAddress     = eve.pkh;
                const totalAllocated    = MVK(40000000);
                const nextActionID      = councilStorage.actionCounter;

                // Operation
                const newActionOperation = await councilInstance.methods.councilActionUpdateVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                const action                        = await councilStorage.councilActionsLedger.get(nextActionID);
                const actionSigner                  = action.signers.includes(alice.pkh)
                const dataMap                       = await action.dataMap;
                const packedVesteeAddress           = (await utils.tezos.rpc.packData({ data: { string: vesteeAddress }, type: { prim: 'address' } })).packed
                const packedTotalAllocatedAmount    = (await utils.tezos.rpc.packData({ data: { int: totalAllocated.toString() }, type: { prim: 'nat' } })).packed
                const packedCliffInMonths           = (await utils.tezos.rpc.packData({ data: { int: cliffInMonths.toString() }, type: { prim: 'nat' } })).packed
                const packedVestingInMonths         = (await utils.tezos.rpc.packData({ data: { int: vestingInMonths.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "updateVestee");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("vesteeAddress"), packedVesteeAddress);
                assert.equal(dataMap.get("newTotalAllocatedAmount"), packedTotalAllocatedAmount);
                assert.equal(dataMap.get("newCliffInMonths"), packedCliffInMonths);
                assert.equal(dataMap.get("newVestingInMonths"), packedVestingInMonths);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Council member should not be able to call this entrypoint if the vestee does not exist', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const cliffInMonths     = 0;
                const vestingInMonths   = 24;
                const vesteeAddress     = alice.pkh;
                const totalAllocated    = MVK(20000000);

                // Operation                
                await chai.expect(councilInstance.methods.councilActionUpdateVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Council member should not be able to access this entrypoint if the Vesting contract is not in the generalContact maps and if it does not contains an AddVestee entrypoint', async () => {
            try{
                // Update general contracts
                await helperFunctions.signerFactory(tezos, bob.sk);
                var updateOperation = await governanceInstance.methods.updateGeneralContracts("vesting", contractDeployments.vesting.address).send()
                await updateOperation.confirmation();

                // Initial Values
                councilStorage       = await councilInstance.storage();
                const cliffInMonths     = 0;
                const vestingInMonths   = 12;
                const vesteeAddress     = eve.pkh;
                const totalAllocated    = MVK(40000000);

                // Operation
                await helperFunctions.signerFactory(tezos, alice.sk);
                await chai.expect(councilInstance.methods.councilActionUpdateVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths).send()).to.be.rejected;

                // Reset general contracts
                await helperFunctions.signerFactory(tezos, bob.sk);
                updateOperation = await governanceInstance.methods.updateGeneralContracts("vesting", contractDeployments.vesting.address).send()
                await updateOperation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Non-council member should not be able to access this entrypoint', async () => {
            try{
                // Initial Values
                councilStorage       = await councilInstance.storage();
                const cliffInMonths     = 0;
                const vestingInMonths   = 12;
                const vesteeAddress     = eve.pkh;
                const totalAllocated    = MVK(40000000);

                // Operation
                await helperFunctions.signerFactory(tezos, isaac.sk);
                await chai.expect(councilInstance.methods.councilActionUpdateVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    })

    describe("%councilActionToggleVesteeLock", async () => {
        beforeEach("Set signer to council", async () => {
            await helperFunctions.signerFactory(tezos, alice.sk)
        });
        
        it('Council member should be able to access this entrypoint and create a new action to lock or unlock a vestee (the action counter should increase in the storage)', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const vesteeAddress     = eve.pkh;
                const nextActionID      = councilStorage.actionCounter;

                // Operation
                const newActionOperation = await councilInstance.methods.councilActionToggleVesteeLock(vesteeAddress).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                const action                        = await councilStorage.councilActionsLedger.get(nextActionID);
                const actionSigner                  = action.signers.includes(alice.pkh);
                const dataMap                       = await action.dataMap;
                const packedVesteeAddress           = (await utils.tezos.rpc.packData({ data: { string: vesteeAddress }, type: { prim: 'address' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "toggleVesteeLock");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("vesteeAddress"), packedVesteeAddress);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Council member should not be able to call this entrypoint if the vestee does not exist', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const vesteeAddress     = alice.pkh;

                // Operation                
                await chai.expect(councilInstance.methods.councilActionToggleVesteeLock(vesteeAddress).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Council member should not be able to access this entrypoint if the Vesting contract is not in the generalContact maps and if it does not contains an ToggleVesteeLock entrypoint', async () => {
            try{
                // Update general contracts
                await helperFunctions.signerFactory(tezos, bob.sk);
                var updateOperation = await governanceInstance.methods.updateGeneralContracts("vesting", contractDeployments.vesting.address).send()
                await updateOperation.confirmation();

                // Initial Values
                councilStorage       = await councilInstance.storage();
                const vesteeAddress     = eve.pkh;

                // Operation
                await helperFunctions.signerFactory(tezos, alice.sk);
                await chai.expect(councilInstance.methods.councilActionToggleVesteeLock(vesteeAddress).send()).to.be.rejected;

                // Reset general contracts
                await helperFunctions.signerFactory(tezos, bob.sk);
                updateOperation = await governanceInstance.methods.updateGeneralContracts("vesting", contractDeployments.vesting.address).send()
                await updateOperation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Non-council member should not be able to access this entrypoint', async () => {
            try{
                // Initial Values
                councilStorage       = await councilInstance.storage();
                const vesteeAddress     = eve.pkh;

                // Operation
                await helperFunctions.signerFactory(tezos, isaac.sk);
                await chai.expect(councilInstance.methods.councilActionToggleVesteeLock(vesteeAddress).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    })

    describe("%councilActionAddMember", async () => {
        beforeEach("Set signer to council", async () => {
            await helperFunctions.signerFactory(tezos, alice.sk)
        });
        
        it('Council member should be able to access this entrypoint and create a new action to add a council member (the action counter should increase in the storage)', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const newMember         = isaac.pkh;
                const newMemberName     = "Member Name";
                const newMemberImage    = "Member Image";
                const newMemberWebsite  = "Member Website";
                const nextActionID      = councilStorage.actionCounter;

                // Operation
                const newActionOperation = await councilInstance.methods.councilActionAddMember(newMember, newMemberName, newMemberWebsite, newMemberImage).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                const action                        = await councilStorage.councilActionsLedger.get(nextActionID);
                const actionSigner                  = action.signers.includes(alice.pkh)
                const dataMap                       = await action.dataMap;
                const packedCouncilMemberAddress    = (await utils.tezos.rpc.packData({ data: { string: newMember }, type: { prim: 'address' } })).packed
                const packedCouncilMemberName       = (await utils.tezos.rpc.packData({ data: { string: newMemberName }, type: { prim: 'string' } })).packed
                const packedCouncilMemberWebsite    = (await utils.tezos.rpc.packData({ data: { string: newMemberWebsite }, type: { prim: 'string' } })).packed
                const packedCouncilMemberImage      = (await utils.tezos.rpc.packData({ data: { string: newMemberImage }, type: { prim: 'string' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "addCouncilMember");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("councilMemberAddress"), packedCouncilMemberAddress);
                assert.equal(dataMap.get("councilMemberName"), packedCouncilMemberName);
                assert.equal(dataMap.get("councilMemberWebsite"), packedCouncilMemberWebsite);
                assert.equal(dataMap.get("councilMemberImage"), packedCouncilMemberImage);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Council member should not be able to access this entrypoint if the given member’s address is already in the council', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const newMember         = alice.pkh;
                const newMemberName     = "Member Name";
                const newMemberImage    = "Member Image";
                const newMemberWebsite  = "Member Website";

                // Operation                
                await chai.expect(councilInstance.methods.councilActionAddMember(newMember, newMemberName, newMemberWebsite, newMemberImage).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Non-council member should not be able to access this entrypoint', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const newMember         = isaac.pkh;
                const newMemberName     = "Member Name";
                const newMemberImage    = "Member Image";
                const newMemberWebsite  = "Member Website";

                // Operation
                await helperFunctions.signerFactory(tezos, isaac.sk);
                await chai.expect(councilInstance.methods.councilActionAddMember(newMember, newMemberName, newMemberWebsite, newMemberImage).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    })

    describe("%councilActionRemoveMember", async () => {
        beforeEach("Set signer to council", async () => {
            await helperFunctions.signerFactory(tezos, alice.sk)
        });
        
        it('Council member should be able to access this entrypoint and create a new action to remove a council member (the action counter should increase in the storage)', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const newMember         = eve.pkh;
                const nextActionID      = councilStorage.actionCounter;

                // Operation
                const newActionOperation = await councilInstance.methods.councilActionRemoveMember(newMember).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                const action                        = await councilStorage.councilActionsLedger.get(nextActionID);
                const actionSigner                  = action.signers.includes(alice.pkh)
                const dataMap                       = await action.dataMap;
                const packedCouncilMemberAddress    = (await utils.tezos.rpc.packData({ data: { string: newMember }, type: { prim: 'address' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
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

        it('Council member should not be able to access this entrypoint if the threshold is greater than the expected amount of members in the council', async () => {
            try{
                // Update config
                await helperFunctions.signerFactory(tezos, bob.sk);
                councilStorage  = await councilInstance.storage();
                const currentThreshold  = councilStorage.config.threshold;
                const updatedThreshold  = councilStorage.councilMembers.size;
                var updateConfigOperation   = await councilInstance.methods.updateConfig(updatedThreshold,"configThreshold").send();
                await updateConfigOperation.confirmation();

                // Initial Values
                councilStorage          = await councilInstance.storage();
                const newMember         = isaac.pkh;

                // Operation
                await chai.expect(councilInstance.methods.councilActionRemoveMember(newMember).send()).to.be.rejected;

                // Reset config
                var updateConfigOperation   = await councilInstance.methods.updateConfig(currentThreshold,"configThreshold").send();
                await updateConfigOperation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('Council member should not be able to access this entrypoint if the given member’s address is not in the council', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const newMember         = isaac.pkh;

                // Operation                
                await chai.expect(councilInstance.methods.councilActionRemoveMember(newMember).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Non-council member should not be able to access this entrypoint', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const newMember         = eve.pkh;

                // Operation
                await helperFunctions.signerFactory(tezos, isaac.sk);
                await chai.expect(councilInstance.methods.councilActionRemoveMember(newMember).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    })

    describe("%councilActionChangeMember", async () => {
        beforeEach("Set signer to council", async () => {
            await helperFunctions.signerFactory(tezos, alice.sk)
        });
        
        it('Council member should be able to access this entrypoint and create a new action to replace a council member by another (the action counter should increase in the storage)', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const oldMember         = eve.pkh;
                const newMember         = mallory.pkh;
                const nextActionID      = councilStorage.actionCounter;
                const newMemberName     = "Member Name";
                const newMemberImage    = "Member Image";
                const newMemberWebsite  = "Member Website";

                // Operation
                const newActionOperation = await councilInstance.methods.councilActionChangeMember(oldMember, newMember, newMemberName, newMemberWebsite, newMemberImage).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                const action                        = await councilStorage.councilActionsLedger.get(nextActionID);
                const actionSigner                  = action.signers.includes(alice.pkh)
                const dataMap                       = await action.dataMap;
                const packedOldCouncilMemberAddress = (await utils.tezos.rpc.packData({ data: { string: oldMember }, type: { prim: 'address' } })).packed
                const packedNewCouncilMemberAddress = (await utils.tezos.rpc.packData({ data: { string: newMember }, type: { prim: 'address' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
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

        it('Council member should not be able to access this entrypoint if the given old member address is not in the council', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const oldMember         = mallory.pkh;
                const newMember         = isaac.pkh;
                const newMemberName     = "Member Name";
                const newMemberImage    = "Member Image";
                const newMemberWebsite  = "Member Website";

                // Operation
                await chai.expect(councilInstance.methods.councilActionChangeMember(oldMember, newMember, newMemberName, newMemberWebsite, newMemberImage).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Council member should not be able to access this entrypoint if the given new member address is already in the council', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const oldMember         = eve.pkh;
                const newMember         = alice.pkh;
                const newMemberName     = "Member Name";
                const newMemberImage    = "Member Image";
                const newMemberWebsite  = "Member Website";

                // Operation
                await chai.expect(councilInstance.methods.councilActionChangeMember(oldMember, newMember, newMemberName, newMemberWebsite, newMemberImage).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Non-council member should not be able to access this entrypoint', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const oldMember         = eve.pkh;
                const newMember         = mallory.pkh;
                const newMemberName     = "Member Name";
                const newMemberImage    = "Member Image";
                const newMemberWebsite  = "Member Website";

                // Operation
                await helperFunctions.signerFactory(tezos, isaac.sk);
                await chai.expect(councilInstance.methods.councilActionChangeMember(oldMember, newMember, newMemberName, newMemberWebsite, newMemberImage).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    })

    describe("%councilActionTransfer", async () => {
        beforeEach("Set signer to council", async () => {
            await helperFunctions.signerFactory(tezos, alice.sk)
        });
        
        it('Council member should be able to access this entrypoint and create a new action to transfer tokens to given address (the action counter should increase in the storage)', async () => {
            try{
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const receiverAddress       = eve.pkh;
                const tokenContractAddress  = contractDeployments.mvkToken.address;
                const tokenType             = "FA2";
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const tokenId               = 0;
                const nextActionID          = councilStorage.actionCounter;

                // Operation
                const newActionOperation = await councilInstance.methods.councilActionTransfer(
                    receiverAddress,
                    tokenContractAddress,
                    tokenAmount,
                    tokenType,
                    tokenId,
                    purpose).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                const action                        = await councilStorage.councilActionsLedger.get(nextActionID);
                const actionSigner                  = action.signers.includes(alice.pkh)
                const dataMap                       = await action.dataMap;
                const packedReceiverAddress         = (await utils.tezos.rpc.packData({ data: { string: receiverAddress }, type: { prim: 'address' } })).packed
                const packedTokenContractAddress    = (await utils.tezos.rpc.packData({ data: { string: tokenContractAddress }, type: { prim: 'address' } })).packed
                const packedTokenType               = (await utils.tezos.rpc.packData({ data: { string: tokenType }, type: { prim: 'string' } })).packed
                const packedPurpose                 = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount             = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed
                const packedTokenId                 = (await utils.tezos.rpc.packData({ data: { int: tokenId.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "transfer");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
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
        
        it('Council member should not be able to access this entrypoint if the given tokenType is not FA12, FA2 or XTZ', async () => {
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
                await chai.expect(councilInstance.methods.councilActionTransfer(
                    receiverAddress,
                    tokenContractAddress,
                    tokenAmount,
                    tokenType,
                    tokenId,
                    purpose).send()
                ).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Non-council member should not be able to access this entrypoint', async () => {
            try{
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const receiverAddress       = eve.pkh;
                const tokenContractAddress  = contractDeployments.mvkToken.address;
                const tokenType             = "FA2";
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const tokenId               = 0;

                // Operation
                await helperFunctions.signerFactory(tezos, isaac.sk);
                await chai.expect(councilInstance.methods.councilActionTransfer(
                    receiverAddress,
                    tokenContractAddress,
                    tokenAmount,
                    tokenType,
                    tokenId,
                    purpose).send()
                ).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    })

    describe("%councilActionRequestTokens", async () => {
        beforeEach("Set signer to council", async () => {
            await helperFunctions.signerFactory(tezos, alice.sk)
        });
        
        it('Council member should be able to access this entrypoint and create a new action to request tokens from the given treasury (the action counter should increase in the storage)', async () => {
            try{
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const fromTreasury          = contractDeployments.treasury.address;
                const tokenContractAddress  = contractDeployments.mvkToken.address;
                const tokenName             = "MVK";
                const tokenType             = "FA2";
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const tokenId               = 0;
                const nextActionID          = councilStorage.actionCounter;

                // Operation
                const newActionOperation = await councilInstance.methods.councilActionRequestTokens(
                    fromTreasury,
                    tokenContractAddress,
                    tokenName,
                    tokenAmount,
                    tokenType,
                    tokenId,
                    purpose).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                const action                        = await councilStorage.councilActionsLedger.get(nextActionID);
                const actionSigner                  = action.signers.includes(alice.pkh)
                const dataMap                       = await action.dataMap;
                const packedTreasuryAddress         = (await utils.tezos.rpc.packData({ data: { string: fromTreasury }, type: { prim: 'address' } })).packed
                const packedTokenContractAddress    = (await utils.tezos.rpc.packData({ data: { string: tokenContractAddress }, type: { prim: 'address' } })).packed
                const packedTokenName               = (await utils.tezos.rpc.packData({ data: { string: tokenName }, type: { prim: 'string' } })).packed
                const packedTokenType               = (await utils.tezos.rpc.packData({ data: { string: tokenType }, type: { prim: 'string' } })).packed
                const packedPurpose                 = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount             = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed
                const packedTokenId                 = (await utils.tezos.rpc.packData({ data: { int: tokenId.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "requestTokens");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("treasuryAddress"), packedTreasuryAddress);
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

        it('Council member should not be able to access this entrypoint if the given tokenType is not FA12, FA2 or XTZ', async () => {
            try{
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const fromTreasury          = contractDeployments.treasury.address;
                const tokenContractAddress  = contractDeployments.mvkToken.address;
                const tokenName             = "MVK";
                const tokenType             = "FA3";
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const tokenId               = 0;

                // Operation
                await chai.expect(councilInstance.methods.councilActionRequestTokens(
                    fromTreasury,
                    tokenContractAddress,
                    tokenName,
                    tokenAmount,
                    tokenType,
                    tokenId,
                    purpose).send()
                ).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Non-council member should not be able to access this entrypoint', async () => {
            try{
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const fromTreasury          = contractDeployments.treasury.address;
                const tokenContractAddress  = contractDeployments.mvkToken.address;
                const tokenName             = "MVK";
                const tokenType             = "FA2";
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const tokenId               = 0;

                // Operation
                await helperFunctions.signerFactory(tezos, isaac.sk);
                await chai.expect(councilInstance.methods.councilActionRequestTokens(
                    fromTreasury,
                    tokenContractAddress,
                    tokenName,
                    tokenAmount,
                    tokenType,
                    tokenId,
                    purpose).send()
                ).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    })

    describe("%councilActionRequestMint", async () => {
        beforeEach("Set signer to council", async () => {
            await helperFunctions.signerFactory(tezos, alice.sk)
        });
        
        it('Council member should be able to access this entrypoint and create a new action to request a mint from the given treasury (the action counter should increase in the storage)', async () => {
            try{
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const fromTreasury          = contractDeployments.treasury.address;
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const nextActionID          = councilStorage.actionCounter;

                // Operation
                const newActionOperation = await councilInstance.methods.councilActionRequestMint(
                    fromTreasury,
                    tokenAmount,
                    purpose).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                const action                        = await councilStorage.councilActionsLedger.get(nextActionID);
                const actionSigner                  = action.signers.includes(alice.pkh)
                const dataMap                       = await action.dataMap;
                const packedTreasuryAddress         = (await utils.tezos.rpc.packData({ data: { string: fromTreasury }, type: { prim: 'address' } })).packed
                const packedPurpose                 = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount             = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "requestMint");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("treasuryAddress"), packedTreasuryAddress);
                assert.equal(dataMap.get("purpose"), packedPurpose);
                assert.equal(dataMap.get("tokenAmount"), packedTokenAmount);

                // Sign action for later drop 
                await helperFunctions.signerFactory(tezos, bob.sk)
                const signOperation = await councilInstance.methods.signAction(nextActionID).send();
                await signOperation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Non-council member should not be able to access this entrypoint', async () => {
            try{
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const fromTreasury          = contractDeployments.treasury.address;
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);

                // Operation
                await helperFunctions.signerFactory(tezos, isaac.sk);
                await chai.expect(councilInstance.methods.councilActionRequestMint(
                    fromTreasury,
                    tokenAmount,
                    purpose).send()
                ).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    })

    describe("%councilActionDropFinancialReq", async () => {
        beforeEach("Set signer to council", async () => {
            await helperFunctions.signerFactory(tezos, alice.sk)
        });
        
        it('Council member should be able to access this entrypoint and create a new action to request a mint from the given treasury (the action counter should increase in the storage)', async () => {
            try{
                // Initial Values
                councilStorage              = await councilInstance.storage();
                governanceFinancialStorage  = await governanceFinancialInstance.storage();
                const requestID             = governanceFinancialStorage.financialRequestCounter.toNumber() - 1;
                const nextActionID          = councilStorage.actionCounter;

                // Operation
                const newActionOperation = await councilInstance.methods.councilActionDropFinancialReq(requestID).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage              = await councilInstance.storage();
                const action                = await councilStorage.councilActionsLedger.get(nextActionID);
                const actionSigner          = action.signers.includes(alice.pkh)
                const dataMap               = await action.dataMap;
                const packedRequestId       = (await utils.tezos.rpc.packData({ data: { int: requestID.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "dropFinancialRequest");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("requestId"), packedRequestId);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
        
        it('Council member should not be able to access this entrypoint if the financial request linked to the provided ID doesn’t exist', async () => {
            try{
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const requestID             = 999;

                // Operation
                await chai.expect(councilInstance.methods.councilActionDropFinancialReq(requestID).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
        
        it('Council member should not be able to access this entrypoint if the financial request linked to the provided ID was flushed', async () => {
            try{
                // ----- REQUEST MINT
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const fromTreasury          = contractDeployments.treasury.address;
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const mintActionID          = councilStorage.actionCounter;

                // Operation
                var newActionOperation = await councilInstance.methods.councilActionRequestMint(
                    fromTreasury,
                    tokenAmount,
                    purpose).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage              = await councilInstance.storage();
                var action                  = await councilStorage.councilActionsLedger.get(mintActionID);
                var actionSigner            = action.signers.includes(alice.pkh)
                var dataMap                 = await action.dataMap;
                const packedTreasuryAddress = (await utils.tezos.rpc.packData({ data: { string: fromTreasury }, type: { prim: 'address' } })).packed
                const packedPurpose         = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount     = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "requestMint");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("treasuryAddress"), packedTreasuryAddress);
                assert.equal(dataMap.get("purpose"), packedPurpose);
                assert.equal(dataMap.get("tokenAmount"), packedTokenAmount);

                // ----- FLUSH REQUEST
                // Initial Values
                councilStorage                  = await councilInstance.storage();
                const flushActionID             = councilStorage.actionCounter;

                // Operation
                newActionOperation = await councilInstance.methods.flushAction(mintActionID).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage              = await councilInstance.storage();
                action                      = await councilStorage.councilActionsLedger.get(flushActionID);
                actionSigner                = action.signers.includes(alice.pkh)
                dataMap                     = await action.dataMap;
                var packedActionId          = (await utils.tezos.rpc.packData({ data: { int: mintActionID.toNumber().toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "flushAction");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("actionId"), packedActionId);

                // ----- SIGN FLUSH
                await helperFunctions.signerFactory(tezos, bob.sk)

                // Operation
                const signOperation = await councilInstance.methods.signAction(flushActionID).send();
                await signOperation.confirmation();

                // Final values
                councilStorage          = await councilInstance.storage();
                action                  = await councilStorage.councilActionsLedger.get(flushActionID);
                dataMap                 = await action.dataMap;
                packedActionId          = (await utils.tezos.rpc.packData({ data: { int: mintActionID.toNumber().toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "flushAction");
                assert.equal(action.executed, true);
                assert.equal(action.signersCount, 2);
                assert.equal(dataMap.get("actionId"), packedActionId);

                const flushedAction         = await councilStorage.councilActionsLedger.get(mintActionID);
                dataMap                     = await flushedAction.dataMap;

                assert.strictEqual(flushedAction.initiator, alice.pkh);
                assert.strictEqual(flushedAction.status, "FLUSHED");
                assert.strictEqual(flushedAction.actionType, "requestMint");
                assert.equal(flushedAction.executed, false);
                assert.equal(flushedAction.signersCount, 1);
                assert.equal(dataMap.get("treasuryAddress"), packedTreasuryAddress);
                assert.equal(dataMap.get("purpose"), packedPurpose);
                assert.equal(dataMap.get("tokenAmount"), packedTokenAmount);

                // ----- DROP
                await helperFunctions.signerFactory(tezos, alice.sk);
                await chai.expect(councilInstance.methods.councilActionDropFinancialReq(mintActionID).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
        
        it('Council member should not be able to access this entrypoint if the financial request linked to the provided ID was executed', async () => {
            try{
                // ----- REQUEST MINT
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const fromTreasury          = contractDeployments.treasury.address;
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const mintActionID          = councilStorage.actionCounter;

                // Operation
                var newActionOperation = await councilInstance.methods.councilActionRequestMint(
                    fromTreasury,
                    tokenAmount,
                    purpose).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage              = await councilInstance.storage();
                var action                  = await councilStorage.councilActionsLedger.get(mintActionID);
                var actionSigner            = action.signers.includes(alice.pkh)
                var dataMap                 = await action.dataMap;
                const packedTreasuryAddress = (await utils.tezos.rpc.packData({ data: { string: fromTreasury }, type: { prim: 'address' } })).packed
                const packedPurpose         = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount     = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "requestMint");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("treasuryAddress"), packedTreasuryAddress);
                assert.equal(dataMap.get("purpose"), packedPurpose);
                assert.equal(dataMap.get("tokenAmount"), packedTokenAmount);

                // ----- SIGN REQUEST
                // Operation
                await helperFunctions.signerFactory(tezos, bob.sk)
                newActionOperation = await councilInstance.methods.signAction(mintActionID).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                action              = await councilStorage.councilActionsLedger.get(mintActionID);
                actionSigner        = action.signers.includes(alice.pkh)
                var dataMap         = await action.dataMap;

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "requestMint");
                assert.equal(action.executed, true);
                assert.equal(action.signersCount, 2);
                assert.equal(dataMap.get("treasuryAddress"), packedTreasuryAddress);
                assert.equal(dataMap.get("purpose"), packedPurpose);
                assert.equal(dataMap.get("tokenAmount"), packedTokenAmount);

                // ----- DROP
                await helperFunctions.signerFactory(tezos, alice.sk);
                await chai.expect(councilInstance.methods.signAction(mintActionID).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Non-council member should not be able to access this entrypoint', async () => {
            try{
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const requestID             = councilStorage.actionCounter - 1;

                // Operation
                await helperFunctions.signerFactory(tezos, isaac.sk);
                await chai.expect(councilInstance.methods.councilActionDropFinancialReq(requestID).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    })

    describe("%flushAction", async () => {
        beforeEach("Set signer to council", async () => {
            await helperFunctions.signerFactory(tezos, alice.sk)
        });

        it('Council member should be able to access this entrypoint with a correct actionID and create a new action to flush a pending action (the action counter should increase in the storage)', async () => {
            try{
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const requestID             = 4;
                const nextActionID          = councilStorage.actionCounter;

                // Operation
                const newActionOperation = await councilInstance.methods.flushAction(requestID).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage          = await councilInstance.storage();
                const action            = await councilStorage.councilActionsLedger.get(nextActionID);
                const actionSigner      = action.signers.includes(alice.pkh)
                const dataMap           = await action.dataMap;
                const packedRequestId   = (await utils.tezos.rpc.packData({ data: { int: requestID.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "flushAction");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("actionId"), packedRequestId);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Council member should not be able to access this entrypoint if the action linked to the provided actionID doesn’t exist', async () => {
            try{
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const requestID             = 999;

                // Operation
                await chai.expect(councilInstance.methods.councilActionDropFinancialReq(requestID).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Council member should not be able to access this entrypoint if the action linked to the provided actionID was flushed', async () => {
            try{
                // ----- ADD MEMBER
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const councilMember         = mallory.pkh;
                const memberActionID        = councilStorage.actionCounter;
                const newMemberName         = "Member Name";
                const newMemberImage        = "Member Image";
                const newMemberWebsite      = "Member Website";

                // Operation
                var newActionOperation = await councilInstance.methods.councilActionAddMember(councilMember, newMemberName, newMemberWebsite, newMemberImage).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                var action                          = await councilStorage.councilActionsLedger.get(memberActionID);
                var actionSigner                    = action.signers.includes(alice.pkh)
                var flushDataMap                    = await action.dataMap;
                const packedCouncilMemberAddress    = (await utils.tezos.rpc.packData({ data: { string: councilMember }, type: { prim: 'address' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "addCouncilMember");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(flushDataMap.get("councilMemberAddress"), packedCouncilMemberAddress);

                // ----- FLUSH ACTION
                // Initial Values
                councilStorage                  = await councilInstance.storage();
                const flushActionID             = councilStorage.actionCounter;

                // Operation
                newActionOperation = await councilInstance.methods.flushAction(memberActionID).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage          = await councilInstance.storage();
                action                  = await councilStorage.councilActionsLedger.get(flushActionID);
                actionSigner            = action.signers.includes(alice.pkh)
                var dataMap             = await action.dataMap;
                const packedActionId    = (await utils.tezos.rpc.packData({ data: { int: memberActionID.toNumber().toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "flushAction");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("actionId"), packedActionId);

                // ----- SIGN DROP
                await helperFunctions.signerFactory(tezos, bob.sk)

                // Operation
                const signOperation = await councilInstance.methods.signAction(flushActionID).send();
                await signOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                action              = await councilStorage.councilActionsLedger.get(flushActionID);
                const flushedAction = await councilStorage.councilActionsLedger.get(memberActionID);

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "flushAction");
                assert.equal(action.executed, true);
                assert.equal(action.signersCount, 2);
                assert.equal(dataMap.get("actionId"), packedActionId);

                assert.strictEqual(flushedAction.initiator, alice.pkh);
                assert.strictEqual(flushedAction.status, "FLUSHED");
                assert.strictEqual(flushedAction.actionType, "addCouncilMember");
                assert.equal(flushedAction.executed, false);
                assert.equal(flushedAction.signersCount, 1);
                assert.equal(flushDataMap.get("councilMemberAddress"), packedCouncilMemberAddress);

                // ----- FLUSH AGAIN
                await helperFunctions.signerFactory(tezos, alice.sk);
                await chai.expect(councilInstance.methods.flushAction(memberActionID).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Council member should not be able to access this entrypoint if the action linked to the provided actionID was executed', async () => {
            try{
                // ----- ADD MEMBER
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const councilMember         = mallory.pkh;
                const memberActionID        = councilStorage.actionCounter;
                const newMemberName         = "Member Name";
                const newMemberImage        = "Member Image";
                const newMemberWebsite      = "Member Website";

                // Operation
                var newActionOperation = await councilInstance.methods.councilActionAddMember(councilMember, newMemberName, newMemberWebsite, newMemberImage).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                var action                          = await councilStorage.councilActionsLedger.get(memberActionID);
                var actionSigner                    = action.signers.includes(alice.pkh)
                var dataMap                         = await action.dataMap;
                const packedCouncilMemberAddress    = (await utils.tezos.rpc.packData({ data: { string: councilMember }, type: { prim: 'address' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "addCouncilMember");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("councilMemberAddress"), packedCouncilMemberAddress);

                // ----- SIGN ACTION
                await helperFunctions.signerFactory(tezos, bob.sk)

                // Operation
                const signOperation = await councilInstance.methods.signAction(memberActionID).send();
                await signOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                var action          = await councilStorage.councilActionsLedger.get(memberActionID);
                dataMap             = await action.dataMap;

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "addCouncilMember");
                assert.equal(action.executed, true);
                assert.equal(action.signersCount, 2);
                assert.equal(dataMap.get("councilMemberAddress"), packedCouncilMemberAddress);

                // ----- FLUSH
                await helperFunctions.signerFactory(tezos, alice.sk);
                await chai.expect(councilInstance.methods.flushAction(memberActionID).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Non-council member should not be able to access this entrypoint', async () => {
            try{
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const requestID             = councilStorage.actionCounter - 1;

                // Operation
                await helperFunctions.signerFactory(tezos, isaac.sk);
                await chai.expect(councilInstance.methods.councilActionDropFinancialReq(requestID).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    })

    describe("%signAction", async () => {
        beforeEach("Set signer to council", async () => {
            await helperFunctions.signerFactory(tezos, alice.sk)
        });

        it('addVestee --> should add a new vestee', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const cliffInMonths     = 0;
                const vestingInMonths   = 24;
                const vesteeAddress     = isaac.pkh;
                const totalAllocated    = MVK(20000000);
                const nextActionID      = councilStorage.actionCounter;

                // Operation
                const newActionOperation = await councilInstance.methods.councilActionAddVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                var action                          = await councilStorage.councilActionsLedger.get(nextActionID);
                var actionSigner                    = action.signers.includes(alice.pkh)
                var dataMap                         = await action.dataMap;
                const packedVesteeAddress           = (await utils.tezos.rpc.packData({ data: { string: vesteeAddress }, type: { prim: 'address' } })).packed
                const packedTotalAllocatedAmount    = (await utils.tezos.rpc.packData({ data: { int: totalAllocated.toString() }, type: { prim: 'nat' } })).packed
                const packedCliffInMonths           = (await utils.tezos.rpc.packData({ data: { int: cliffInMonths.toString() }, type: { prim: 'nat' } })).packed
                const packedVestingInMonths         = (await utils.tezos.rpc.packData({ data: { int: vestingInMonths.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "addVestee");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("vesteeAddress"), packedVesteeAddress);
                assert.equal(dataMap.get("totalAllocatedAmount"), packedTotalAllocatedAmount);
                assert.equal(dataMap.get("cliffInMonths"), packedCliffInMonths);
                assert.equal(dataMap.get("vestingInMonths"), packedVestingInMonths);

                // Operation
                await helperFunctions.signerFactory(tezos, bob.sk)
                const signOperation = await councilInstance.methods.signAction(nextActionID).send();
                await signOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                var action          = await councilStorage.councilActionsLedger.get(nextActionID);
                var actionSigner    = action.signers.includes(alice.pkh)
                dataMap             = await action.dataMap;

                vestingStorage      = await vestingInstance.storage();
                const vestee        = await vestingStorage.vesteeLedger.get(vesteeAddress);

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "addVestee");
                assert.equal(action.executed, true);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 2);
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

        it('addVestee --> should fail if the addVestee entrypoint doesn’t exist in the vesting contract or if the vesting contract is not in the generalContracts map', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const cliffInMonths     = 0;
                const vestingInMonths   = 24;
                const vesteeAddress     = mallory.pkh;
                const totalAllocated    = MVK(20000000);
                const nextActionID      = councilStorage.actionCounter;

                // Operation
                const newActionOperation = await councilInstance.methods.councilActionAddVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                var action                          = await councilStorage.councilActionsLedger.get(nextActionID);
                var actionSigner                    = action.signers.includes(alice.pkh)
                var dataMap                         = await action.dataMap;
                const packedVesteeAddress           = (await utils.tezos.rpc.packData({ data: { string: vesteeAddress }, type: { prim: 'address' } })).packed
                const packedTotalAllocatedAmount    = (await utils.tezos.rpc.packData({ data: { int: totalAllocated.toString() }, type: { prim: 'nat' } })).packed
                const packedCliffInMonths           = (await utils.tezos.rpc.packData({ data: { int: cliffInMonths.toString() }, type: { prim: 'nat' } })).packed
                const packedVestingInMonths         = (await utils.tezos.rpc.packData({ data: { int: vestingInMonths.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "addVestee");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("vesteeAddress"), packedVesteeAddress);
                assert.equal(dataMap.get("totalAllocatedAmount"), packedTotalAllocatedAmount);
                assert.equal(dataMap.get("cliffInMonths"), packedCliffInMonths);
                assert.equal(dataMap.get("vestingInMonths"), packedVestingInMonths);

                // Update general contracts
                await helperFunctions.signerFactory(tezos, bob.sk);
                var updateOperation = await governanceInstance.methods.updateGeneralContracts("vesting", contractDeployments.vesting.address).send()
                await updateOperation.confirmation();

                // Operation
                await chai.expect(councilInstance.methods.signAction(nextActionID).send()).to.be.rejected;

                // Reset general contracts
                updateOperation = await governanceInstance.methods.updateGeneralContracts("vesting", contractDeployments.vesting.address).send()
                await updateOperation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('updateVestee --> should fail if the addVestee entrypoint doesn’t exist in the vesting contract or if the vesting contract is not in the generalContracts map', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const cliffInMonths     = 0;
                const vestingInMonths   = 12;
                const vesteeAddress     = eve.pkh;
                const totalAllocated    = MVK(40000000);
                const nextActionID      = councilStorage.actionCounter;

                // Operation
                const newActionOperation = await councilInstance.methods.councilActionUpdateVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                var action                          = await councilStorage.councilActionsLedger.get(nextActionID);
                var actionSigner                    = action.signers.includes(alice.pkh)
                var dataMap                         = await action.dataMap;
                const packedVesteeAddress           = (await utils.tezos.rpc.packData({ data: { string: vesteeAddress }, type: { prim: 'address' } })).packed
                const packedTotalAllocatedAmount    = (await utils.tezos.rpc.packData({ data: { int: totalAllocated.toString() }, type: { prim: 'nat' } })).packed
                const packedCliffInMonths           = (await utils.tezos.rpc.packData({ data: { int: cliffInMonths.toString() }, type: { prim: 'nat' } })).packed
                const packedVestingInMonths         = (await utils.tezos.rpc.packData({ data: { int: vestingInMonths.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "updateVestee");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("vesteeAddress"), packedVesteeAddress);
                assert.equal(dataMap.get("newTotalAllocatedAmount"), packedTotalAllocatedAmount);
                assert.equal(dataMap.get("newCliffInMonths"), packedCliffInMonths);
                assert.equal(dataMap.get("newVestingInMonths"), packedVestingInMonths);

                // Update general contracts
                await helperFunctions.signerFactory(tezos, bob.sk);
                var updateOperation = await governanceInstance.methods.updateGeneralContracts("vesting", contractDeployments.vesting.address).send()
                await updateOperation.confirmation();

                // Operation
                await chai.expect(councilInstance.methods.signAction(nextActionID).send()).to.be.rejected;

                // Reset general contracts
                updateOperation = await governanceInstance.methods.updateGeneralContracts("vesting", contractDeployments.vesting.address).send()
                await updateOperation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('updateVestee --> should update a vestee', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const cliffInMonths     = 0;
                const vestingInMonths   = 12;
                const vesteeAddress     = eve.pkh;
                const totalAllocated    = MVK(40000000);
                const nextActionID      = councilStorage.actionCounter;

                // Operation
                const newActionOperation = await councilInstance.methods.councilActionUpdateVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                var action                          = await councilStorage.councilActionsLedger.get(nextActionID);
                var actionSigner                    = action.signers.includes(alice.pkh)
                var dataMap                         = await action.dataMap;
                const packedVesteeAddress           = (await utils.tezos.rpc.packData({ data: { string: vesteeAddress }, type: { prim: 'address' } })).packed
                const packedTotalAllocatedAmount    = (await utils.tezos.rpc.packData({ data: { int: totalAllocated.toString() }, type: { prim: 'nat' } })).packed
                const packedCliffInMonths           = (await utils.tezos.rpc.packData({ data: { int: cliffInMonths.toString() }, type: { prim: 'nat' } })).packed
                const packedVestingInMonths         = (await utils.tezos.rpc.packData({ data: { int: vestingInMonths.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "updateVestee");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("vesteeAddress"), packedVesteeAddress);
                assert.equal(dataMap.get("newTotalAllocatedAmount"), packedTotalAllocatedAmount);
                assert.equal(dataMap.get("newCliffInMonths"), packedCliffInMonths);
                assert.equal(dataMap.get("newVestingInMonths"), packedVestingInMonths);

                // Operation
                await helperFunctions.signerFactory(tezos, bob.sk)
                const signOperation = await councilInstance.methods.signAction(nextActionID).send();
                await signOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                var action          = await councilStorage.councilActionsLedger.get(nextActionID);
                var actionSigner    = action.signers.includes(alice.pkh)
                dataMap             = await action.dataMap;

                vestingStorage      = await vestingInstance.storage();
                const vestee        = await vestingStorage.vesteeLedger.get(vesteeAddress);

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "updateVestee");
                assert.equal(action.executed, true);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 2);
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

        it('toggleVesteeLock --> should fail if the toggleVesteeLock entrypoint doesn’t exist in the vesting contract or if the vesting contract is not in the generalContracts map', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const vesteeAddress     = eve.pkh;
                const nextActionID      = councilStorage.actionCounter;

                // Operation
                const newActionOperation = await councilInstance.methods.councilActionToggleVesteeLock(vesteeAddress).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage              = await councilInstance.storage();
                var action                  = await councilStorage.councilActionsLedger.get(nextActionID);
                var actionSigner            = action.signers.includes(alice.pkh)
                var dataMap                 = await action.dataMap;
                const packedVesteeAddress   = (await utils.tezos.rpc.packData({ data: { string: vesteeAddress }, type: { prim: 'address' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "toggleVesteeLock");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("vesteeAddress"), packedVesteeAddress);

                // Update general contracts
                await helperFunctions.signerFactory(tezos, bob.sk);
                var updateOperation = await governanceInstance.methods.updateGeneralContracts("vesting", contractDeployments.vesting.address).send()
                await updateOperation.confirmation();

                // Operation
                await chai.expect(councilInstance.methods.signAction(nextActionID).send()).to.be.rejected;

                // Reset general contracts
                updateOperation = await governanceInstance.methods.updateGeneralContracts("vesting", contractDeployments.vesting.address).send()
                await updateOperation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('toggleVesteeLock --> should lock or unlock a vestee', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const vesteeAddress     = eve.pkh;
                const nextActionID      = councilStorage.actionCounter;

                // Operation
                const newActionOperation = await councilInstance.methods.councilActionToggleVesteeLock(vesteeAddress).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage              = await councilInstance.storage();
                var action                  = await councilStorage.councilActionsLedger.get(nextActionID);
                var actionSigner            = action.signers.includes(alice.pkh)
                var dataMap                 = await action.dataMap;
                const packedVesteeAddress   = (await utils.tezos.rpc.packData({ data: { string: vesteeAddress }, type: { prim: 'address' } })).packed
                vestingStorage              = await vestingInstance.storage();
                var vestee                  = await vestingStorage.vesteeLedger.get(vesteeAddress);

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "toggleVesteeLock");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("vesteeAddress"), packedVesteeAddress);
                assert.strictEqual(vestee.status, "ACTIVE")

                // Operation
                await helperFunctions.signerFactory(tezos, bob.sk);
                const signOperation = await councilInstance.methods.signAction(nextActionID).send();
                await signOperation.confirmation();

                // Final values
                councilStorage              = await councilInstance.storage();
                var action                  = await councilStorage.councilActionsLedger.get(nextActionID);
                var actionSigner            = action.signers.includes(alice.pkh)
                dataMap                     = await action.dataMap;
                vestingStorage              = await vestingInstance.storage();
                vestee                      = await vestingStorage.vesteeLedger.get(vesteeAddress);

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "toggleVesteeLock");
                assert.equal(action.executed, true);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 2);
                assert.equal(dataMap.get("vesteeAddress"), packedVesteeAddress);
                assert.notStrictEqual(vestee, undefined);
                assert.strictEqual(vestee.status, "LOCKED")
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('removeVestee --> should fail if the removeVestee entrypoint doesn’t exist in the vesting contract or if the vesting contract is not in the generalContracts map', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const vesteeAddress     = eve.pkh;
                const nextActionID      = councilStorage.actionCounter;

                // Operation
                const newActionOperation = await councilInstance.methods.councilActionRemoveVestee(vesteeAddress).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage              = await councilInstance.storage();
                var action                  = await councilStorage.councilActionsLedger.get(nextActionID);
                var actionSigner            = action.signers.includes(alice.pkh)
                var dataMap                 = await action.dataMap;
                const packedVesteeAddress   = (await utils.tezos.rpc.packData({ data: { string: vesteeAddress }, type: { prim: 'address' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "removeVestee");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("vesteeAddress"), packedVesteeAddress);

                // Update general contracts
                await helperFunctions.signerFactory(tezos, bob.sk);
                var updateOperation = await governanceInstance.methods.updateGeneralContracts("vesting", contractDeployments.vesting.address).send()
                await updateOperation.confirmation();

                // Operation                
                await chai.expect(councilInstance.methods.signAction(nextActionID).send()).to.be.rejected;

                // Update general contracts
                var updateOperation = await governanceInstance.methods.updateGeneralContracts("vesting", contractDeployments.vesting.address).send()
                await updateOperation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('removeVestee --> should remove a vestee', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const vesteeAddress     = eve.pkh;
                const nextActionID      = councilStorage.actionCounter;

                // Operation
                const newActionOperation = await councilInstance.methods.councilActionRemoveVestee(vesteeAddress).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage              = await councilInstance.storage();
                var action                  = await councilStorage.councilActionsLedger.get(nextActionID);
                var actionSigner            = action.signers.includes(alice.pkh)
                var dataMap                 = await action.dataMap;
                const packedVesteeAddress   = (await utils.tezos.rpc.packData({ data: { string: vesteeAddress }, type: { prim: 'address' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "removeVestee");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("vesteeAddress"), packedVesteeAddress);

                // Operation
                await helperFunctions.signerFactory(tezos, bob.sk)
                const signOperation = await councilInstance.methods.signAction(nextActionID).send();
                await signOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                var action          = await councilStorage.councilActionsLedger.get(nextActionID);
                var actionSigner    = action.signers.includes(alice.pkh)
                dataMap             = await action.dataMap;

                vestingStorage      = await vestingInstance.storage();
                const vestee        = await vestingStorage.vesteeLedger.get(vesteeAddress);

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "removeVestee");
                assert.equal(action.executed, true);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 2);
                assert.equal(dataMap.get("vesteeAddress"), packedVesteeAddress);
                assert.strictEqual(vestee, undefined);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('addCouncilMember --> should add the given address as a council member if the address is not in it', async () => {
            try{
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const memberAddress         = david.pkh;
                const nextActionID          = councilStorage.actionCounter;
                const newMemberName         = "Member Name";
                const newMemberImage        = "Member Image";
                const newMemberWebsite      = "Member Website";

                // Operation
                const newActionOperation = await councilInstance.methods.councilActionAddMember(memberAddress, newMemberName, newMemberWebsite, newMemberImage).send();
                await newActionOperation.confirmation();

                // Action for future test
                const futureActionOperation = await councilInstance.methods.councilActionAddMember(memberAddress, newMemberName, newMemberWebsite, newMemberImage).send();
                await futureActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                var action                          = await councilStorage.councilActionsLedger.get(nextActionID);
                var actionSigner                    = action.signers.includes(alice.pkh)
                var dataMap                         = await action.dataMap;
                const packedCouncilMemberAddress    = (await utils.tezos.rpc.packData({ data: { string: memberAddress }, type: { prim: 'address' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "addCouncilMember");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("councilMemberAddress"), packedCouncilMemberAddress);

                // Operation
                await helperFunctions.signerFactory(tezos, bob.sk)
                const signOperation = await councilInstance.methods.signAction(nextActionID).send();
                await signOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                var action          = await councilStorage.councilActionsLedger.get(nextActionID);
                var actionSigner    = action.signers.includes(alice.pkh)
                var dataMap      = await action.dataMap;

                const memberUpdated = councilStorage.councilMembers.has(david.pkh);

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "addCouncilMember");
                assert.equal(action.executed, true);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 2);
                assert.equal(dataMap.get("councilMemberAddress"), packedCouncilMemberAddress);
                assert.equal(memberUpdated, true);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('addCouncilMember --> should fail if the member is already a council member', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const memberAddress     = david.pkh;
                const nextActionID      = councilStorage.actionCounter - 1;

                // Final values
                councilStorage                      = await councilInstance.storage();
                var action                          = await councilStorage.councilActionsLedger.get(nextActionID);
                var actionSigner                    = action.signers.includes(alice.pkh)
                var dataMap                         = await action.dataMap;
                const packedCouncilMemberAddress    = (await utils.tezos.rpc.packData({ data: { string: memberAddress }, type: { prim: 'address' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "addCouncilMember");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("councilMemberAddress"), packedCouncilMemberAddress);

                // Operation
                await helperFunctions.signerFactory(tezos, bob.sk)
                await chai.expect(councilInstance.methods.signAction(nextActionID).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('removeCouncilMember --> should fail if the threshold in the configuration is greater than the expected amount of members after execution', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const memberAddress     = mallory.pkh;
                const nextActionID      = councilStorage.actionCounter;

                // Operation
                const newActionOperation = await councilInstance.methods.councilActionRemoveMember(memberAddress).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                var action                          = await councilStorage.councilActionsLedger.get(nextActionID);
                var actionSigner                    = action.signers.includes(alice.pkh)
                var dataMap                         = await action.dataMap;
                const packedCouncilMemberAddress    = (await utils.tezos.rpc.packData({ data: { string: memberAddress }, type: { prim: 'address' } })).packed
                const councilSize                   = councilStorage.councilMembers.size;
                const oldThresold                   = councilStorage.config.threshold;

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "removeCouncilMember");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("councilMemberAddress"), packedCouncilMemberAddress);

                // Update config
                await helperFunctions.signerFactory(tezos, bob.sk)
                var updateConfigOperation = await councilInstance.methods.updateConfig(councilSize,"configThreshold").send();
                await updateConfigOperation.confirmation();

                // Operation
                var signOperation = await councilInstance.methods.signAction(nextActionID).send();
                await signOperation.confirmation();
                
                await helperFunctions.signerFactory(tezos, mallory.sk)
                signOperation = await councilInstance.methods.signAction(nextActionID).send();
                await signOperation.confirmation();

                await helperFunctions.signerFactory(tezos, david.sk)
                signOperation = await councilInstance.methods.signAction(nextActionID).send();
                await signOperation.confirmation();

                await helperFunctions.signerFactory(tezos, eve.sk)
                await chai.expect(councilInstance.methods.signAction(nextActionID).send()).to.be.rejected;

                // Reset config
                await helperFunctions.signerFactory(tezos, bob.sk)
                updateConfigOperation = await councilInstance.methods.updateConfig(oldThresold,"configThreshold").send();
                await updateConfigOperation.confirmation();
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('removeCouncilMember --> should remove the given address from the council members if the address is in it', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const memberAddress     = mallory.pkh;
                const nextActionID      = councilStorage.actionCounter;

                // Operation
                const newActionOperation = await councilInstance.methods.councilActionRemoveMember(memberAddress).send();
                await newActionOperation.confirmation();

                // Action for future test
                const futureActionOperation = await councilInstance.methods.councilActionRemoveMember(memberAddress).send();
                await futureActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                var action                          = await councilStorage.councilActionsLedger.get(nextActionID);
                var actionSigner                    = action.signers.includes(alice.pkh)
                var dataMap                         = await action.dataMap;
                const packedCouncilMemberAddress    = (await utils.tezos.rpc.packData({ data: { string: memberAddress }, type: { prim: 'address' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "removeCouncilMember");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("councilMemberAddress"), packedCouncilMemberAddress);

                // Operation
                await helperFunctions.signerFactory(tezos, bob.sk)
                const signOperation = await councilInstance.methods.signAction(nextActionID).send();
                await signOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                var action          = await councilStorage.councilActionsLedger.get(nextActionID);
                var actionSigner    = action.signers.includes(alice.pkh)
                var dataMap      = await action.dataMap;

                const memberUpdated = councilStorage.councilMembers.has(mallory.pkh);

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "removeCouncilMember");
                assert.equal(action.executed, true);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 2);
                assert.equal(dataMap.get("councilMemberAddress"), packedCouncilMemberAddress);
                assert.equal(memberUpdated, false);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('removeCouncilMember --> should fail if the member is not a council member', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const memberAddress     = mallory.pkh;
                const nextActionID      = councilStorage.actionCounter - 1;

                // Final values
                councilStorage                      = await councilInstance.storage();
                var action                          = await councilStorage.councilActionsLedger.get(nextActionID);
                var actionSigner                    = action.signers.includes(alice.pkh)
                var dataMap                         = await action.dataMap;
                const packedCouncilMemberAddress    = (await utils.tezos.rpc.packData({ data: { string: memberAddress }, type: { prim: 'address' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "removeCouncilMember");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("councilMemberAddress"), packedCouncilMemberAddress);

                // Operation
                await helperFunctions.signerFactory(tezos, bob.sk)
                await chai.expect(councilInstance.methods.signAction(nextActionID).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('changeCouncilMember --> should replace an old councilMember with a new one if the old member if the old member is a council member', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const oldMemberAddress  = eve.pkh;
                const newMemberAddress  = isaac.pkh;
                const nextActionID      = councilStorage.actionCounter;
                const newMemberName     = "Member Name";
                const newMemberImage    = "Member Image";
                const newMemberWebsite  = "Member Website";

                // Operation
                const newActionOperation = await councilInstance.methods.councilActionChangeMember(oldMemberAddress, newMemberAddress, newMemberName, newMemberWebsite, newMemberImage).send();
                await newActionOperation.confirmation();

                // Action for future test
                var futureNewAddress  = trudy.pkh;
                var futureActionOperation = await councilInstance.methods.councilActionChangeMember(oldMemberAddress, futureNewAddress, newMemberName, newMemberWebsite, newMemberImage).send();
                await futureActionOperation.confirmation();

                // Action for future test
                var futureOldAddress  = alice.pkh;
                var futureActionOperation = await councilInstance.methods.councilActionChangeMember(futureOldAddress, newMemberAddress, newMemberName, newMemberWebsite, newMemberImage).send();
                await futureActionOperation.confirmation();

                // Final values
                councilStorage                          = await councilInstance.storage();
                var action                              = await councilStorage.councilActionsLedger.get(nextActionID);
                var actionSigner                        = action.signers.includes(alice.pkh)
                var dataMap                             = await action.dataMap;
                const packedOldCouncilMemberAddress     = (await utils.tezos.rpc.packData({ data: { string: oldMemberAddress }, type: { prim: 'address' } })).packed
                const packedNewCouncilMemberAddress     = (await utils.tezos.rpc.packData({ data: { string: newMemberAddress }, type: { prim: 'address' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "changeCouncilMember");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("oldCouncilMemberAddress"), packedOldCouncilMemberAddress);
                assert.equal(dataMap.get("newCouncilMemberAddress"), packedNewCouncilMemberAddress);

                // Operation
                await helperFunctions.signerFactory(tezos, bob.sk)
                const signOperation = await councilInstance.methods.signAction(nextActionID).send();
                await signOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                var action          = await councilStorage.councilActionsLedger.get(nextActionID);
                var actionSigner    = action.signers.includes(alice.pkh)
                dataMap             = await action.dataMap;

                const memberRemoved = councilStorage.councilMembers.has(eve.pkh);
                const memberAdded = councilStorage.councilMembers.has(isaac.pkh);

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "changeCouncilMember");
                assert.equal(action.executed, true);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 2);
                assert.equal(dataMap.get("oldCouncilMemberAddress"), packedOldCouncilMemberAddress);
                assert.equal(dataMap.get("newCouncilMemberAddress"), packedNewCouncilMemberAddress);
                assert.equal(memberRemoved, false);
                assert.equal(memberAdded, true);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('changeCouncilMember --> should fail if the old member is not in the council', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const oldMemberAddress  = eve.pkh;
                const newMemberAddress  = trudy.pkh;
                const nextActionID      = councilStorage.actionCounter - 2;

                // Final values
                councilStorage                          = await councilInstance.storage();
                var action                              = await councilStorage.councilActionsLedger.get(nextActionID);
                var actionSigner                        = action.signers.includes(alice.pkh)
                var dataMap                             = await action.dataMap;
                const packedOldCouncilMemberAddress     = (await utils.tezos.rpc.packData({ data: { string: oldMemberAddress }, type: { prim: 'address' } })).packed
                const packedNewCouncilMemberAddress     = (await utils.tezos.rpc.packData({ data: { string: newMemberAddress }, type: { prim: 'address' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "changeCouncilMember");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("oldCouncilMemberAddress"), packedOldCouncilMemberAddress);
                assert.equal(dataMap.get("newCouncilMemberAddress"), packedNewCouncilMemberAddress);

                // Operation
                await helperFunctions.signerFactory(tezos, bob.sk)
                await chai.expect(councilInstance.methods.signAction(nextActionID).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('changeCouncilMember --> should fail if the new member is already in the council', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const oldMemberAddress  = alice.pkh;
                const newMemberAddress  = isaac.pkh;
                const nextActionID      = councilStorage.actionCounter - 1;

                // Final values
                councilStorage                          = await councilInstance.storage();
                var action                              = await councilStorage.councilActionsLedger.get(nextActionID);
                var actionSigner                        = action.signers.includes(alice.pkh)
                var dataMap                             = await action.dataMap;
                const packedOldCouncilMemberAddress     = (await utils.tezos.rpc.packData({ data: { string: oldMemberAddress }, type: { prim: 'address' } })).packed
                const packedNewCouncilMemberAddress     = (await utils.tezos.rpc.packData({ data: { string: newMemberAddress }, type: { prim: 'address' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "changeCouncilMember");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("oldCouncilMemberAddress"), packedOldCouncilMemberAddress);
                assert.equal(dataMap.get("newCouncilMemberAddress"), packedNewCouncilMemberAddress);

                // Operation
                await helperFunctions.signerFactory(tezos, bob.sk)
                await chai.expect(councilInstance.methods.signAction(nextActionID).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('transfer --> should transfer tokens from the council contract to a given address', async () => {
            try{
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const receiverAddress       = eve.pkh;
                const tokenContractAddress  = contractDeployments.mvkToken.address;
                const tokenType             = "FA2";
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const tokenId               = 0;
                const nextActionID          = councilStorage.actionCounter;

                // Operation
                const newActionOperation = await councilInstance.methods.councilActionTransfer(
                    receiverAddress,
                    tokenContractAddress,
                    tokenAmount,
                    tokenType,
                    tokenId,
                    purpose).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                var action                          = await councilStorage.councilActionsLedger.get(nextActionID);
                var actionSigner                    = action.signers.includes(alice.pkh)
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
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "transfer");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("receiverAddress"), packedReceiverAddress);
                assert.equal(dataMap.get("tokenContractAddress"), packedTokenContractAddress);
                assert.equal(dataMap.get("tokenType"), packedTokenType);
                assert.equal(dataMap.get("purpose"), packedPurpose);
                assert.equal(dataMap.get("tokenAmount"), packedTokenAmount);
                assert.equal(dataMap.get("tokenId"), packedTokenId);

                // Operation
                await helperFunctions.signerFactory(tezos, bob.sk)
                const signOperation = await councilInstance.methods.signAction(nextActionID).send();
                await signOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                var action          = await councilStorage.councilActionsLedger.get(nextActionID);
                var actionSigner    = action.signers.includes(alice.pkh)
                dataMap             = await action.dataMap;

                mvkTokenStorage             = await mvkTokenInstance.storage();
                const postCouncilBalance    = await mvkTokenStorage.ledger.get(contractDeployments.council.address);
                const postUserBalance       = await mvkTokenStorage.ledger.get(eve.pkh);

                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "transfer");
                assert.equal(action.executed, true);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 2);
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

        it('requestTokens --> should create a request in the governance contract requesting for tokens', async () => {
            try{
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const fromTreasury          = contractDeployments.treasury.address;
                const tokenContractAddress  = contractDeployments.mvkToken.address;
                const tokenName             = "MVK";
                const tokenType             = "FA2";
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const tokenId               = 0;
                const nextActionID          = councilStorage.actionCounter;
                governanceFinancialStorage  = await governanceFinancialInstance.storage();
                const governanceActionID    = governanceFinancialStorage.financialRequestCounter; 

                // Operation
                const newActionOperation = await councilInstance.methods.councilActionRequestTokens(
                    fromTreasury,
                    tokenContractAddress,
                    tokenName,
                    tokenAmount,
                    tokenType,
                    tokenId,
                    purpose).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage                      = await councilInstance.storage();
                var action                          = await councilStorage.councilActionsLedger.get(nextActionID);
                var actionSigner                    = action.signers.includes(alice.pkh)
                var dataMap                         = await action.dataMap;
                const packedTreasuryAddress         = (await utils.tezos.rpc.packData({ data: { string: fromTreasury }, type: { prim: 'address' } })).packed
                const packedTokenContractAddress    = (await utils.tezos.rpc.packData({ data: { string: tokenContractAddress }, type: { prim: 'address' } })).packed
                const packedTokenName               = (await utils.tezos.rpc.packData({ data: { string: tokenName }, type: { prim: 'string' } })).packed
                const packedTokenType               = (await utils.tezos.rpc.packData({ data: { string: tokenType }, type: { prim: 'string' } })).packed
                const packedPurpose                 = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount             = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed
                const packedTokenId                 = (await utils.tezos.rpc.packData({ data: { int: tokenId.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "requestTokens");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("treasuryAddress"), packedTreasuryAddress);
                assert.equal(dataMap.get("tokenContractAddress"), packedTokenContractAddress);
                assert.equal(dataMap.get("tokenName"), packedTokenName);
                assert.equal(dataMap.get("tokenType"), packedTokenType);
                assert.equal(dataMap.get("purpose"), packedPurpose);
                assert.equal(dataMap.get("tokenAmount"), packedTokenAmount);
                assert.equal(dataMap.get("tokenId"), packedTokenId);

                // Operation
                await helperFunctions.signerFactory(tezos, bob.sk)
                const signOperation = await councilInstance.methods.signAction(nextActionID).send();
                await signOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                action              = await councilStorage.councilActionsLedger.get(nextActionID);
                actionSigner        = action.signers.includes(alice.pkh)
                dataMap             = await action.dataMap;

                governanceFinancialStorage       = await governanceFinancialInstance.storage();
                const governanceAction          = await governanceFinancialStorage.financialRequestLedger.get(governanceActionID)

                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "requestTokens");
                assert.equal(action.executed, true);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 2);
                assert.equal(dataMap.get("treasuryAddress"), packedTreasuryAddress);
                assert.equal(dataMap.get("tokenContractAddress"), packedTokenContractAddress);
                assert.equal(dataMap.get("tokenName"), packedTokenName);
                assert.equal(dataMap.get("tokenType"), packedTokenType);
                assert.equal(dataMap.get("purpose"), packedPurpose);
                assert.equal(dataMap.get("tokenAmount"), packedTokenAmount);
                assert.equal(dataMap.get("tokenId"), packedTokenId);
                assert.notStrictEqual(governanceAction, undefined);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('requestMint --> should create a request in the governance contract requesting for a MVK mint', async () => {
            try{
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const fromTreasury          = contractDeployments.treasury.address;
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const nextActionID          = councilStorage.actionCounter;
                governanceFinancialStorage           = await governanceFinancialInstance.storage();
                const governanceActionID    = governanceFinancialStorage.financialRequestCounter; 

                // Operation
                const newActionOperation = await councilInstance.methods.councilActionRequestMint(
                    fromTreasury,
                    tokenAmount,
                    purpose).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage              = await councilInstance.storage();
                var action                  = await councilStorage.councilActionsLedger.get(nextActionID);
                var actionSigner            = action.signers.includes(alice.pkh)
                var dataMap                 = await action.dataMap;
                const packedTreasuryAddress = (await utils.tezos.rpc.packData({ data: { string: fromTreasury }, type: { prim: 'address' } })).packed
                const packedPurpose         = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount     = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "requestMint");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("treasuryAddress"), packedTreasuryAddress);
                assert.equal(dataMap.get("purpose"), packedPurpose);
                assert.equal(dataMap.get("tokenAmount"), packedTokenAmount);

                // Operation
                await helperFunctions.signerFactory(tezos, bob.sk)
                const signOperation = await councilInstance.methods.signAction(nextActionID).send();
                await signOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                action              = await councilStorage.councilActionsLedger.get(nextActionID);
                actionSigner        = action.signers.includes(alice.pkh)
                dataMap             = await action.dataMap;

                governanceFinancialStorage       = await governanceFinancialInstance.storage();
                const governanceAction  = await governanceFinancialStorage.financialRequestLedger.get(governanceActionID)

                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "requestMint");
                assert.equal(action.executed, true);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 2);
                assert.equal(dataMap.get("treasuryAddress"), packedTreasuryAddress);
                assert.equal(dataMap.get("purpose"), packedPurpose);
                assert.equal(dataMap.get("tokenAmount"), packedTokenAmount);
                assert.notStrictEqual(governanceAction, undefined);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
        
        it('dropFinancialRequest --> should drop a financial request in the governance contract', async () => {
            try{
                // Initial Values
                councilStorage              = await councilInstance.storage();
                governanceFinancialStorage           = await governanceFinancialInstance.storage();
                const requestID             = governanceFinancialStorage.financialRequestCounter - 1;
                const nextActionID          = councilStorage.actionCounter;

                // Operation
                const newActionOperation = await councilInstance.methods.councilActionDropFinancialReq(requestID).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage          = await councilInstance.storage();
                var action              = await councilStorage.councilActionsLedger.get(nextActionID);
                var actionSigner        = action.signers.includes(alice.pkh)
                var dataMap             = await action.dataMap;
                const packedRequestId   = (await utils.tezos.rpc.packData({ data: { int: requestID.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "dropFinancialRequest");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("requestId"), packedRequestId);

                // Operation
                await helperFunctions.signerFactory(tezos, bob.sk)
                const signOperation = await councilInstance.methods.signAction(nextActionID).send();
                await signOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                action              = await councilStorage.councilActionsLedger.get(nextActionID);
                actionSigner        = action.signers.includes(alice.pkh)
                dataMap             = await action.dataMap;

                governanceFinancialStorage       = await governanceFinancialInstance.storage();
                const dropAction        = await governanceFinancialStorage.financialRequestLedger.get(requestID)

                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "dropFinancialRequest");
                assert.equal(action.executed, true);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 2);
                assert.equal(dataMap.get("requestId"), packedRequestId);
                assert.equal(dropAction.status, false);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('flushAction --> should fail if the action was executed', async () => {
            try{
                // ----- REQUEST MINT
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const fromTreasury          = contractDeployments.treasury.address;
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const mintActionID          = councilStorage.actionCounter;

                // Operation
                var newActionOperation = await councilInstance.methods.councilActionRequestMint(
                    fromTreasury,
                    tokenAmount,
                    purpose).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage              = await councilInstance.storage();
                var action                  = await councilStorage.councilActionsLedger.get(mintActionID);
                var actionSigner            = action.signers.includes(alice.pkh)
                var dataMap                 = await action.dataMap;
                const packedTreasuryAddress = (await utils.tezos.rpc.packData({ data: { string: fromTreasury }, type: { prim: 'address' } })).packed
                const packedPurpose         = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount     = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "requestMint");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("treasuryAddress"), packedTreasuryAddress);
                assert.equal(dataMap.get("purpose"), packedPurpose);
                assert.equal(dataMap.get("tokenAmount"), packedTokenAmount);

                // ----- FLUSH REQUEST
                // Initial Values
                councilStorage                  = await councilInstance.storage();
                const flushActionID             = councilStorage.actionCounter;

                // Operation
                newActionOperation = await councilInstance.methods.flushAction(mintActionID).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage          = await councilInstance.storage();
                action                  = await councilStorage.councilActionsLedger.get(flushActionID);
                actionSigner            = action.signers.includes(alice.pkh)
                dataMap                 = await action.dataMap;
                var packedActionId      = (await utils.tezos.rpc.packData({ data: { int: mintActionID.toNumber().toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "flushAction");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("actionId"), packedActionId);

                // ----- SIGN MINT
                await helperFunctions.signerFactory(tezos, bob.sk)

                // Operation
                var signOperation = await councilInstance.methods.signAction(mintActionID).send();
                await signOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                action              = await councilStorage.councilActionsLedger.get(mintActionID);
                dataMap             = await action.dataMap;

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "requestMint");
                assert.equal(action.executed, true);
                assert.equal(action.signersCount, 2);
                assert.equal(dataMap.get("treasuryAddress"), packedTreasuryAddress);
                assert.equal(dataMap.get("purpose"), packedPurpose);
                assert.equal(dataMap.get("tokenAmount"), packedTokenAmount);

                // ----- SIGN FLUSH
                // Operation
                await chai.expect(councilInstance.methods.signAction(flushActionID).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('flushAction --> should fail if the action was flushed', async () => {
            try{
                // ----- REQUEST MINT
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const fromTreasury          = contractDeployments.treasury.address;
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const mintActionID          = councilStorage.actionCounter;

                // Operation
                var newActionOperation = await councilInstance.methods.councilActionRequestMint(
                    fromTreasury,
                    tokenAmount,
                    purpose).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage              = await councilInstance.storage();
                var action                  = await councilStorage.councilActionsLedger.get(mintActionID);
                var actionSigner            = action.signers.includes(alice.pkh)
                var dataMap                 = await action.dataMap;
                const packedTreasuryAddress = (await utils.tezos.rpc.packData({ data: { string: fromTreasury }, type: { prim: 'address' } })).packed
                const packedPurpose         = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount     = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "requestMint");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("treasuryAddress"), packedTreasuryAddress);
                assert.equal(dataMap.get("purpose"), packedPurpose);
                assert.equal(dataMap.get("tokenAmount"), packedTokenAmount);

                // ----- FLUSH REQUEST
                // Initial Values
                councilStorage                  = await councilInstance.storage();
                const flushActionID             = councilStorage.actionCounter;

                // Operation
                newActionOperation = await councilInstance.methods.flushAction(mintActionID).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                action              = await councilStorage.councilActionsLedger.get(flushActionID);
                actionSigner        = action.signers.includes(alice.pkh)
                dataMap             = await action.dataMap;
                var packedActionId  = (await utils.tezos.rpc.packData({ data: { int: mintActionID.toNumber().toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "flushAction");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("actionId"), packedActionId);

                // ----- SECOND FLUSH REQUEST
                // Initial Values
                councilStorage                  = await councilInstance.storage();
                const reflushActionID           = councilStorage.actionCounter;

                // Operation
                newActionOperation = await councilInstance.methods.flushAction(mintActionID).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                action              = await councilStorage.councilActionsLedger.get(reflushActionID);
                actionSigner        = action.signers.includes(alice.pkh)
                dataMap             = await action.dataMap;

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "flushAction");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("actionId"), packedActionId);

                // ----- SIGN FIRST FLUSH
                await helperFunctions.signerFactory(tezos, bob.sk)

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

        it('flushAction --> should flush a pending action', async () => {
            try{
                // ----- REQUEST MINT
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const fromTreasury          = contractDeployments.treasury.address;
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const mintActionID          = councilStorage.actionCounter;

                // Operation
                var newActionOperation = await councilInstance.methods.councilActionRequestMint(
                    fromTreasury,
                    tokenAmount,
                    purpose).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage              = await councilInstance.storage();
                var action                  = await councilStorage.councilActionsLedger.get(mintActionID);
                var actionSigner            = action.signers.includes(alice.pkh)
                var dataMap                 = await action.dataMap;
                const packedTreasuryAddress = (await utils.tezos.rpc.packData({ data: { string: fromTreasury }, type: { prim: 'address' } })).packed
                const packedPurpose         = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount     = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "requestMint");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("treasuryAddress"), packedTreasuryAddress);
                assert.equal(dataMap.get("purpose"), packedPurpose);
                assert.equal(dataMap.get("tokenAmount"), packedTokenAmount);

                // ----- FLUSH REQUEST
                // Initial Values
                councilStorage                  = await councilInstance.storage();
                const flushActionID             = councilStorage.actionCounter;

                // Operation
                newActionOperation = await councilInstance.methods.flushAction(mintActionID).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                action              = await councilStorage.councilActionsLedger.get(flushActionID);
                actionSigner        = action.signers.includes(alice.pkh)
                dataMap             = await action.dataMap;
                var packedActionId  = (await utils.tezos.rpc.packData({ data: { int: mintActionID.toNumber().toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "flushAction");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("actionId"), packedActionId);

                // ----- SIGN FIRST FLUSH
                await helperFunctions.signerFactory(tezos, bob.sk)

                // Operation
                var signOperation = await councilInstance.methods.signAction(flushActionID).send();
                await signOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                action              = await councilStorage.councilActionsLedger.get(flushActionID);
                actionSigner        = action.signers.includes(alice.pkh)
                dataMap             = await action.dataMap;

                const flushedAction = await councilStorage.councilActionsLedger.get(mintActionID);

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "flushAction");
                assert.equal(action.executed, true);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 2);
                assert.equal(dataMap.get("actionId"), packedActionId);
                assert.strictEqual(flushedAction.status, "FLUSHED");
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Council member should not be able to access this entrypoint if the action linked to the provided actionID was flushed', async () => {
            try{
                // Initial values
                await helperFunctions.signerFactory(tezos, bob.sk)
                councilStorage              = await councilInstance.storage();
                const flushedActionID       = councilStorage.actionCounter - 2;

                // Operation
                await chai.expect(councilInstance.methods.signAction(flushedActionID).send()).to.be.rejected;
                const flushedAction = await councilStorage.councilActionsLedger.get(flushedActionID);
                assert.strictEqual(flushedAction.status, "FLUSHED");
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Council member should not be able to access this entrypoint if the action linked to the provided actionID was executed', async () => {
            try{
                // Initial values
                await helperFunctions.signerFactory(tezos, bob.sk)
                councilStorage              = await councilInstance.storage();
                const executedActionID      = councilStorage.actionCounter - 1;

                // Operation
                await chai.expect(councilInstance.methods.signAction(executedActionID).send()).to.be.rejected;
                const executedAction = await councilStorage.councilActionsLedger.get(executedActionID);
                assert.strictEqual(executedAction.status, "EXECUTED");
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Council member should not be able to access this entrypoint if the action linked to the provided actionID doesn’t exist', async () => {
            try{
                // Initial values
                await helperFunctions.signerFactory(tezos, bob.sk)
                councilStorage              = await councilInstance.storage();
                const flushedActionID       = 999;

                // Operation
                await chai.expect(councilInstance.methods.signAction(flushedActionID).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Council member should not be able to sign the same action twice or more', async () => {
            try{
                // ----- REQUEST MINT
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const fromTreasury          = contractDeployments.treasury.address;
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const mintActionID          = councilStorage.actionCounter;

                // Operation
                var newActionOperation = await councilInstance.methods.councilActionRequestMint(
                    fromTreasury,
                    tokenAmount,
                    purpose).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage              = await councilInstance.storage();
                var action                  = await councilStorage.councilActionsLedger.get(mintActionID);
                var actionSigner            = action.signers.includes(alice.pkh)
                var dataMap                 = await action.dataMap;
                const packedTreasuryAddress = (await utils.tezos.rpc.packData({ data: { string: fromTreasury }, type: { prim: 'address' } })).packed
                const packedPurpose         = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount     = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "requestMint");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("treasuryAddress"), packedTreasuryAddress);
                assert.equal(dataMap.get("purpose"), packedPurpose);
                assert.equal(dataMap.get("tokenAmount"), packedTokenAmount);

                // Operation
                await helperFunctions.signerFactory(tezos, trudy.sk);
                await chai.expect(councilInstance.methods.signAction(mintActionID).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Non-council contract should not be able to access this entrypoint', async () => {
            try{
                // ----- REQUEST MINT
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const fromTreasury          = contractDeployments.treasury.address;
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const mintActionID          = councilStorage.actionCounter;

                // Operation
                var newActionOperation = await councilInstance.methods.councilActionRequestMint(
                    fromTreasury,
                    tokenAmount,
                    purpose).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage              = await councilInstance.storage();
                var action                  = await councilStorage.councilActionsLedger.get(mintActionID);
                var actionSigner            = action.signers.includes(alice.pkh)
                var dataMap                 = await action.dataMap;
                const packedTreasuryAddress = (await utils.tezos.rpc.packData({ data: { string: fromTreasury }, type: { prim: 'address' } })).packed
                const packedPurpose         = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount     = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "requestMint");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("treasuryAddress"), packedTreasuryAddress);
                assert.equal(dataMap.get("purpose"), packedPurpose);
                assert.equal(dataMap.get("tokenAmount"), packedTokenAmount);

                // Operation
                await helperFunctions.signerFactory(tezos, alice.sk);
                await chai.expect(councilInstance.methods.signAction(mintActionID).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    })


    describe('Access Control Checks', function () {

        beforeEach("Set signer to non-admin (mallory)", async () => {
            delegationStorage = await delegationInstance.storage();
            await helperFunctions.signerFactory(tezos, mallory.sk);
        });

        it('%setAdmin                 - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                delegationStorage        = await delegationInstance.storage();
                const currentAdmin  = doormanStorage.admin;

                // Operation
                setAdminOperation = await delegationInstance.methods.setAdmin(mallory.pkh);
                await chai.expect(setAdminOperation.send()).to.be.rejected;

                // Final values
                delegationStorage    = await delegationInstance.storage();
                const newAdmin  = delegationStorage.admin;

                // Assertions
                assert.strictEqual(newAdmin, currentAdmin);

            } catch(e){
                console.log(e);
            }
        });

        it('%setGovernance            - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                delegationStorage        = await delegationInstance.storage();
                const currentGovernance  = delegationStorage.governanceAddress;

                // Operation
                setGovernanceOperation = await delegationInstance.methods.setGovernance(mallory.pkh);
                await chai.expect(setGovernanceOperation.send()).to.be.rejected;

                // Final values
                delegationStorage        = await delegationInstance.storage();
                const updatedGovernance  = delegationStorage.governanceAddress;

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
                const hash  = Buffer.from('tezos-storage:data fail', 'ascii').toString('hex')

                delegationStorage       = await delegationInstance.storage();   
                const initialMetadata   = await delegationStorage.metadata.get(key);

                // Operation
                const updateOperation = await delegationInstance.methods.updateMetadata(key, hash);
                await chai.expect(updateOperation.send()).to.be.rejected;

                // Final values
                delegationStorage       = await delegationInstance.storage();            
                const updatedData       = await delegationStorage.metadata.get(key);

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
                delegationStorage        = await delegationInstance.storage();
                const initialConfigValue = delegationStorage.config.minMvkAmount;
                const newMinMvkAmount = MVK(10);

                // Operation
                const updateConfigOperation = await delegationInstance.methods.updateConfig(newMinMvkAmount, "configMinMvkAmount");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                // Final values
                delegationStorage        = await delegationInstance.storage();
                const updatedConfigValue = delegationStorage.config.minMvkAmount;

                // check that there is no change in config values
                assert.equal(updatedConfigValue.toNumber(), initialConfigValue.toNumber());
                assert.notEqual(updatedConfigValue.toNumber(), newMinMvkAmount);
                
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%updateWhitelistContracts - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // init values
                contractMapKey  = "mallory";
                storageMap      = "whitelistContracts";

                initialContractMapValue = await helperFunctions.getStorageMapValue(delegationStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await delegationInstance.methods.updateWhitelistContracts(contractMapKey, mallory.pkh, 'update')
                await chai.expect(updateWhitelistContractsOperation.send()).to.be.rejected;

                delegationStorage       = await delegationInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(delegationStorage, storageMap, contractMapKey);

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

                initialContractMapValue = await helperFunctions.getStorageMapValue(delegationStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await delegationInstance.methods.updateGeneralContracts(contractMapKey, mallory.pkh, 'update')
                await chai.expect(updateGeneralContractsOperation.send()).to.be.rejected;

                delegationStorage       = await delegationInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(delegationStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'mallory (key) should not be in the General Contracts map');

            } catch (e) {
                console.log(e)
            }
        })

        it("%setLambda                - non-admin (mallory) should not be able to call this entrypoint", async() => {
            try{

                // random lambda for testing
                const randomLambdaName  = "randomLambdaName";
                const randomLambdaBytes = "050200000cba0743096500000112075e09650000005a036e036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a0362036203620362036200000000036203620760036803690000000009650000000a0362036203620362036e00000000075e09650000006c09650000000a0362036203620362036200000000036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a036203620362036203620000000003620362076003680369000000000362075e07650765036203620362036c075e076507650368036e0362036e036200000000070702000001770743075e076507650368036e0362036e020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c03200342020000010e037a034c037a07430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700002034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f02000000090743036200810303270200000000072f020000000907430362009c0203270200000000070702000000600743036200808080809d8fc0d0bff2f1b26703420200000047037a034c037a0321052900080570000205290015034b031105710002031605700002033a0322072f020000001307430368010000000844495620627920300327020000000003160707020000001a037a037a03190332072c0200000002032002000000020327034f0707020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c032000808080809d8fc0d0bff2f1b2670342020000092d037a057a000505700005037a034c07430362008f03052100020529000f0529000307430359030a034c03190325072c0200000002032702000000020320053d036d05700002072e02000008a4072e020000007c057000030570000405700005057000060570000705200005072e020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000081c072e0200000044057000030570000405700005057000060570000705200005072e0200000010072e02000000020320020000000203200200000010072e020000000203200200000002032002000007cc072e0200000028057000030570000405700005057000060570000705200005072e02000000020320020000000203200200000798072e0200000774034c032003480521000305210003034c052900050316034c03190328072c020000000002000000090743036200880303270570000205210002034c0321052100030521000205290011034c0329072f020000002005290015074303620000074303620000074303620000074303620000054200050200000004034c03200743036200000521000203160319032a072c020000021c052100020521000407430362008e02057000020529000907430368010000000a64656c65676174696f6e034203420521000b034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f0200000009074303620081030327020000001a072f02000000060743035903030200000008032007430359030a074303620000034c072c020000007303200521000205210004034205210007034c0326052100030521000205290008034205700007034c03260521000205290005034c05290007034b0311052100030316033a0521000b034c0322072f02000000130743036801000000084449562062792030032702000000000316034c0316031202000000060570000603200521000305210003034205210008034c0326052100030521000205700004052900030312055000030571000205210003052100030570000405290005031205500005057100020521000305700002052100030570000403160312031205500001034c05210003034c0570000305290013034b031105500013034c02000000060570000503200521000205290015055000080521000205700002052900110570000205700003034c0346034c0350055000110571000205210003052900070743036200000790010000000c746f74616c5f737570706c790362072f020000000907430362008a01032702000000000521000405290007074303620000037703420790010000000b6765745f62616c616e63650362072f02000000090743036200890103270200000000034c052100090743036200a40105210004033a033a0322072f0200000013074303680100000008444956206279203003270200000000031605210009074303620002033a0312052100090521000a07430362008803033a033a0322072f020000001307430368010000000844495620627920300327020000000003160743036200a401034c0322072f0200000013074303680100000008444956206279203003270200000000031605210004033a05210009052100020322072f0200000013074303680100000008444956206279203003270200000000031605210005034b0311052100060570000a052100040322072f0200000013074303680100000008444956206279203003270200000000031605700007052900130312055000130571000507430362008c0305210004052100070342034205210009034c0326032005700005057000030342052100050570000305700002037a034c0570000305700002034b0311074303620000052100020319032a072c020000003b05210002034c057000030322072f02000000130743036801000000084449562062792030032702000000000316057000020529001503120550001502000000080570000205200002057100030521000405210003034c05290011034c0329072f0200000009074303620089030327020000000003210521000507430362008b03057000020316057000020342034205700007034c03260320032105700004057000020316034b031105500001052100040529000707430362000005700003034205210004037705700002037a057000040655055f0765046e000000062566726f6d5f065f096500000026046e0000000425746f5f04620000000925746f6b656e5f696404620000000725616d6f756e7400000000000000042574787300000009257472616e73666572072f0200000008074303620027032702000000000743036a0000053d0765036e055f096500000006036e0362036200000000053d096500000006036e036203620000000005700004057000050570000705420003031b057000040342031b034d0743036200000521000303160319032a072c02000000440521000405210003034205700005034c032605210003052100020570000403160312055000010571000205210005034c0570000505290013034b031105500013057100030200000006057000040320034c052100040529001505500008034c0521000405700004052900110570000305210005034c0346034c03500550001105710002052100030570000207430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700004034c03260655036e0000000e256f6e5374616b654368616e6765072f02000000090743036200b702032702000000000743036a000005700002034d053d036d034c031b034c031b02000000180570000305700004057000050570000605700007052000060200000036057000030570000405700005057000060570000705200005072e0200000010072e0200000002032002000000020320020000000203200342";

                const setLambdaOperation = delegationInstance.methods.setLambda(randomLambdaName, randomLambdaBytes); 
                await chai.expect(setLambdaOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

    })


});
