const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
const { InMemorySigner, importKey } = require("@taquito/signer");
import assert, { ok, rejects, strictEqual } from "assert";
import { MVK, Utils, zeroAddress } from "./helpers/Utils";
import fs from "fs";
import { confirmOperation } from "../scripts/confirmation";

const chai = require("chai");
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

import env from "../env";
import { bob, alice, eve, mallory, oscar, trudy, isaac } from "../scripts/sandbox/accounts";

import vestingAddress from '../deployments/vestingAddress.json';
import doormanAddress from '../deployments/doormanAddress.json';
import delegationAddress from '../deployments/delegationAddress.json';
import mvkTokenAddress from '../deployments/mvkTokenAddress.json';
import governanceAddress from '../deployments/governanceAddress.json';
import councilAddress from '../deployments/councilAddress.json';
import mockFa12TokenAddress  from '../deployments/mockFa12TokenAddress.json';
import mockFa2TokenAddress   from '../deployments/mockFa2TokenAddress.json';
import farmFactoryAddress   from '../deployments/farmFactoryAddress.json';
import treasuryAddress   from '../deployments/treasuryAddress.json';

describe("Council tests", async () => {
    var utils: Utils;

    let doormanInstance;
    let delegationInstance;
    let mvkTokenInstance;
    let governanceInstance;
    let vestingInstance;
    let councilInstance;
    let mockFa12TokenInstance;
    let mockFa2TokenInstance;
    let treasuryInstance;

    let doormanStorage;
    let delegationStorage;
    let mvkTokenStorage;
    let governanceStorage;
    let vestingStorage;
    let councilStorage;
    let mockFa12TokenStorage;
    let mockFa2TokenStorage;
    let treasuryStorage;
    
    const signerFactory = async (pk) => {
        await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
        return utils.tezos;
    };

    before("setup", async () => {

        utils = new Utils();
        await utils.init(bob.sk);
        
        vestingInstance    = await utils.tezos.contract.at(vestingAddress.address);
        doormanInstance    = await utils.tezos.contract.at(doormanAddress.address);
        delegationInstance = await utils.tezos.contract.at(delegationAddress.address);
        mvkTokenInstance   = await utils.tezos.contract.at(mvkTokenAddress.address);
        governanceInstance = await utils.tezos.contract.at(governanceAddress.address);
        councilInstance    = await utils.tezos.contract.at(councilAddress.address);
        mockFa12TokenInstance  = await utils.tezos.contract.at(mockFa12TokenAddress.address);
        mockFa2TokenInstance   = await utils.tezos.contract.at(mockFa2TokenAddress.address);
        treasuryInstance    = await utils.tezos.contract.at(treasuryAddress.address);
            
        vestingStorage    = await vestingInstance.storage();
        doormanStorage    = await doormanInstance.storage();
        delegationStorage = await delegationInstance.storage();
        mvkTokenStorage   = await mvkTokenInstance.storage();
        governanceStorage = await governanceInstance.storage();
        councilStorage         = await councilInstance.storage();
        mockFa12TokenStorage   = await mockFa12TokenInstance.storage();
        mockFa2TokenStorage    = await mockFa2TokenInstance.storage();
        treasuryStorage    = await treasuryInstance.storage();

        console.log('-- -- -- -- -- Council Tests -- -- -- --')
        console.log('Vesting Contract deployed at:', vestingInstance.address);
        console.log('Doorman Contract deployed at:', doormanInstance.address);
        console.log('Delegation Contract deployed at:', delegationInstance.address);
        console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
        console.log('Governance Contract deployed at:', governanceInstance.address);
        console.log('Council Contract deployed at:', councilInstance.address);
        console.log('Mock Fa12 Token Contract deployed at:', mockFa12TokenInstance.address);
        console.log('Mock Fa2 Token Contract deployed at:' , mockFa2TokenInstance.address);
        console.log('Bob address: ' + bob.pkh);
        console.log('Alice address: ' + alice.pkh);
        console.log('Eve address: ' + eve.pkh);


        // Setup funds in Council for transfer later
        // ------------------------------------------------------------------
        const councilContractAddress = councilAddress.address;

        // Alice transfers 250 XTZ to Council
        await signerFactory(alice.sk)
        const aliceTransferTezToCouncilOperation = await utils.tezos.contract.transfer({ to: councilContractAddress, amount: 250});
        await aliceTransferTezToCouncilOperation.confirmation();

        // Mallory transfers 250 MVK tokens to Treasury
        await signerFactory(mallory.sk);
        const malloryTransferMvkToCouncilOperation = await mvkTokenInstance.methods.transfer([
            {
                from_: mallory.pkh,
                txs: [
                    {
                        to_: councilContractAddress,
                        token_id: 0,
                        amount: 250000000
                    }
                ]
            }
        ]).send();
        await malloryTransferMvkToCouncilOperation.confirmation();

        // Mallory transfers 250 Mock FA12 Tokens to Council
        const malloryTransferMockFa12ToCouncilOperation = await mockFa12TokenInstance.methods.transfer(mallory.pkh, councilContractAddress, 250000000).send();
        await malloryTransferMockFa12ToCouncilOperation.confirmation();

        // Mallory transfers 250 Mock FA2 Tokens to Council
        const malloryTransferMockFa2ToCouncilOperation = await mockFa2TokenInstance.methods.transfer([
            {
                from_: mallory.pkh,
                txs: [
                    {
                        to_: councilContractAddress,
                        token_id: 0,
                        amount: 250000000
                    }
                ]
            }
        ]).send();
        await malloryTransferMockFa2ToCouncilOperation.confirmation();


    });

    describe("%setAdmin", async () => {
        beforeEach("Set signer to admin", async () => {
            await signerFactory(bob.sk)
        });
        it('Admin should be able to call this entrypoint and update the contract administrator with a new address', async () => {
            try{
                // Initial Values
                councilStorage = await councilInstance.storage();
                const currentAdmin = councilStorage.admin;

                // Operation
                const setAdminOperation = await councilInstance.methods.setAdmin(alice.pkh).send();
                await setAdminOperation.confirmation();

                // Final values
                councilStorage = await councilInstance.storage();
                const newAdmin = councilStorage.admin;

                // reset admin
                await signerFactory(alice.sk);
                const resetAdminOperation = await councilInstance.methods.setAdmin(bob.pkh).send();
                await resetAdminOperation.confirmation();

                // Assertions
                assert.notStrictEqual(newAdmin, currentAdmin);
                assert.strictEqual(newAdmin, alice.pkh);
                assert.strictEqual(currentAdmin, bob.pkh);
            } catch(e){
                console.log(e);
            }
        });

        it('Non-admin should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                await signerFactory(alice.sk);
                councilStorage = await councilInstance.storage();
                const currentAdmin = councilStorage.admin;

                // Operation
                await chai.expect(councilInstance.methods.setAdmin(alice.pkh).send()).to.be.rejected;

                // Final values
                councilStorage = await councilInstance.storage();
                const newAdmin = councilStorage.admin;

                // Assertions
                assert.strictEqual(newAdmin, currentAdmin);
            } catch(e){
                console.log(e);
            }
        });
    });

    describe("%updateConfig", async () => {
        beforeEach("Set signer to admin", async () => {
            await signerFactory(bob.sk)
        });

        it('Admin should be able to call the entrypoint and configure the signer threshold', async () => {
            try{
                // Initial Values
                councilStorage = await councilInstance.storage();
                const newConfigValue = 2;

                // Operation
                const updateConfigOperation = await councilInstance.methods.updateConfig(newConfigValue,"configThreshold").send();
                await updateConfigOperation.confirmation();

                // Final values
                councilStorage = await councilInstance.storage();
                const updateConfigValue = councilStorage.config.threshold;

                // Assertions
                assert.equal(updateConfigValue, newConfigValue);
            } catch(e){
                console.log(e);
            }
        });

        it('Admin should not be able to call the entrypoint and configure the signer threshold if it is greater than the amount of members in the council', async () => {
            try{
                // Initial Values
                councilStorage = await councilInstance.storage();
                const currentConfigValue = councilStorage.config.threshold;
                const newConfigValue = 999

                // Operation
                await chai.expect(councilInstance.methods.updateConfig(newConfigValue,"configThreshold").send()).to.be.rejected;

                // Final values
                councilStorage = await councilInstance.storage();
                const updateConfigValue = councilStorage.config.threshold;

                // Assertions
                assert.notEqual(newConfigValue, currentConfigValue);
                assert.equal(updateConfigValue.toNumber(), currentConfigValue.toNumber());
            } catch(e){
                console.log(e);
            }
        });

        it('Admin should be able to call the entrypoint and configure the action expiry in days', async () => {
            try{
                // Initial Values
                councilStorage = await councilInstance.storage();
                const newConfigValue = 1;

                // Operation
                const updateConfigOperation = await councilInstance.methods.updateConfig(newConfigValue,"configActionExpiryDays").send();
                await updateConfigOperation.confirmation();

                // Final values
                councilStorage = await councilInstance.storage();
                const updateConfigValue = councilStorage.config.actionExpiryDays;

                // Assertions
                assert.equal(updateConfigValue, newConfigValue);
            } catch(e){
                console.log(e);
            }
        });
    
        it('Non-admin should not be able to call the entrypoint', async () => {
            try{
                // Initial Values
                councilStorage = await councilInstance.storage();
                const newConfigValue = 1;

                // Operation
                await signerFactory(alice.sk);
                await chai.expect(councilInstance.methods.updateConfig(newConfigValue,"configThreshold").send()).to.be.rejected;
            } catch(e){
                console.log(e);
            }
        });
    })


    describe("%councilActionUpdateBlocksPerMin", async () => {
        beforeEach("Set signer to council", async () => {
            await signerFactory(alice.sk)
        });
        
        it('Council member should be able to access this entrypoint and create a new action to update the blocksPerMinute in a given contract (the action counter should increase in the storage)', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const actionValue       = 3;
                const nextActionID      = councilStorage.actionCounter;

                // Operation
                const newActionOperation = await councilInstance.methods.councilActionUpdateBlocksPerMin(farmFactoryAddress.address, actionValue).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage   = await councilInstance.storage();
                const action        = await councilStorage.councilActionsLedger.get(nextActionID);
                const actionSigner  = action.signers.includes(alice.pkh)
                const addressMap    = await action.addressMap;
                const natMap        = await action.natMap;

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "updateBlocksPerMinute");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(addressMap.get("contractAddress"), farmFactoryAddress.address);
                assert.equal(natMap.get("newBlocksPerMinute"), actionValue);
            } catch(e){
                console.log(e);
            }
        });

        it('Council member should not be able to access this entrypoint if the provided blocksPerMinute is not greater than 0', async () => {
            try{
                // Initial Values
                councilStorage       = await councilInstance.storage();
                const actionValue    = 0;

                // Operation
                await chai.expect(councilInstance.methods.councilActionUpdateBlocksPerMin(farmFactoryAddress.address, actionValue).send()).to.be.rejected;
            } catch(e){
                console.log(e);
            }
        });

        it('Council member should not be able to access this entrypoint if the given contract does not have an updateBlocksPerMinute entrypoint', async () => {
            try{
                // Initial Values
                councilStorage       = await councilInstance.storage();
                const actionValue    = 3;

                // Operation
                await chai.expect(councilInstance.methods.councilActionUpdateBlocksPerMin(doormanAddress.address, actionValue).send()).to.be.rejected;
            } catch(e){
                console.log(e);
            }
        });

        it('Non-council member should not be able to access this entrypoint', async () => {
            try{
                // Initial Values
                councilStorage       = await councilInstance.storage();
                const actionValue    = 3;

                // Operation
                await signerFactory(isaac.sk);
                await chai.expect(councilInstance.methods.councilActionUpdateBlocksPerMin(farmFactoryAddress.address, actionValue).send()).to.be.rejected;
            } catch(e){
                console.log(e);
            }
        });
    })

    describe("%councilActionAddVestee", async () => {
        beforeEach("Set signer to council", async () => {
            await signerFactory(alice.sk)
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
                councilStorage      = await councilInstance.storage();
                const action        = await councilStorage.councilActionsLedger.get(nextActionID);
                const actionSigner  = action.signers.includes(alice.pkh)
                const addressMap    = await action.addressMap;
                const natMap        = await action.natMap;

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "addVestee");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(addressMap.get("vesteeAddress"), vesteeAddress);
                assert.equal(natMap.get("totalAllocatedAmount"), totalAllocated);
                assert.equal(natMap.get("cliffInMonths"), cliffInMonths);
                assert.equal(natMap.get("vestingInMonths"), vestingInMonths);

                // Approve vestee for following tests
                await signerFactory(bob.sk)
                const signOperation = await councilInstance.methods.signAction(nextActionID).send();
                await signOperation.confirmation();
            } catch(e){
                console.log(e);
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
                console.log(e);
            }
        });

        it('Council member should not be able to access this entrypoint if the Vesting contract is not in the generalContact maps and if it does not contains an AddVestee entrypoint', async () => {
            try{
                // Update general contracts
                await signerFactory(bob.sk);
                var updateOperation = await councilInstance.methods.updateGeneralContracts("vesting", vestingAddress.address).send()
                await updateOperation.confirmation();

                // Initial Values
                councilStorage       = await councilInstance.storage();
                const cliffInMonths     = 0;
                const vestingInMonths   = 24;
                const vesteeAddress     = eve.pkh;
                const totalAllocated    = MVK(20000000);

                // Operation
                await signerFactory(alice.sk);
                await chai.expect(councilInstance.methods.councilActionAddVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths).send()).to.be.rejected;

                // Reset general contracts
                await signerFactory(bob.sk);
                updateOperation = await councilInstance.methods.updateGeneralContracts("vesting", vestingAddress.address).send()
                await updateOperation.confirmation();
            } catch(e){
                console.log(e);
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
                await signerFactory(isaac.sk);
                await chai.expect(councilInstance.methods.councilActionAddVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths).send()).to.be.rejected;
            } catch(e){
                console.log(e);
            }
        });
    })

    describe("%councilActionRemoveVestee", async () => {
        beforeEach("Set signer to council", async () => {
            await signerFactory(alice.sk)
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
                console.log(e);
            }
        });

        it('Council member should not be able to access this entrypoint if the Vesting contract is not in the generalContact maps and if it does not contains an RemoveVestee entrypoint', async () => {
            try{
                // Update general contracts
                await signerFactory(bob.sk);
                var updateOperation = await councilInstance.methods.updateGeneralContracts("vesting", vestingAddress.address).send()
                await updateOperation.confirmation();

                // Initial Values
                councilStorage          = await councilInstance.storage();
                const vesteeAddress     = eve.pkh;

                // Operation
                await signerFactory(alice.sk);
                await chai.expect(councilInstance.methods.councilActionRemoveVestee(vesteeAddress).send()).to.be.rejected;

                // Reset general contracts
                await signerFactory(bob.sk);
                updateOperation = await councilInstance.methods.updateGeneralContracts("vesting", vestingAddress.address).send()
                await updateOperation.confirmation();
            } catch(e){
                console.log(e);
            }
        });

        it('Non-council member should not be able to access this entrypoint', async () => {
            try{
                // Initial Values
                councilStorage       = await councilInstance.storage();
                const vesteeAddress     = eve.pkh;

                // Operation
                await signerFactory(isaac.sk);
                await chai.expect(councilInstance.methods.councilActionRemoveVestee(vesteeAddress).send()).to.be.rejected;
            } catch(e){
                console.log(e);
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
                councilStorage      = await councilInstance.storage();
                const action        = await councilStorage.councilActionsLedger.get(nextActionID);
                const actionSigner  = action.signers.includes(alice.pkh)
                const addressMap    = await action.addressMap;

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "removeVestee");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(addressMap.get("vesteeAddress"), vesteeAddress);

                // Remove vestee for following tests
                await signerFactory(bob.sk)
                const signOperation = await councilInstance.methods.signAction(nextActionID).send();
                await signOperation.confirmation();
            } catch(e){
                console.log(e);
            }
        });

    })

    describe("%councilActionUpdateVestee", async () => {
        before("Add vestee again", async () => {
            await signerFactory(alice.sk)
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
            await signerFactory(bob.sk)
            const signOperation = await councilInstance.methods.signAction(nextActionID).send();
            await signOperation.confirmation();
        });

        beforeEach("Set signer to council", async () => {
            await signerFactory(alice.sk)
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
                councilStorage      = await councilInstance.storage();
                const action        = await councilStorage.councilActionsLedger.get(nextActionID);
                const actionSigner  = action.signers.includes(alice.pkh)
                const addressMap    = await action.addressMap;
                const natMap        = await action.natMap;

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "updateVestee");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(addressMap.get("vesteeAddress"), vesteeAddress);
                assert.equal(natMap.get("newTotalAllocatedAmount"), totalAllocated);
                assert.equal(natMap.get("newCliffInMonths"), cliffInMonths);
                assert.equal(natMap.get("newVestingInMonths"), vestingInMonths);
            } catch(e){
                console.log(e);
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
                console.log(e);
            }
        });

        it('Council member should not be able to access this entrypoint if the Vesting contract is not in the generalContact maps and if it does not contains an AddVestee entrypoint', async () => {
            try{
                // Update general contracts
                await signerFactory(bob.sk);
                var updateOperation = await councilInstance.methods.updateGeneralContracts("vesting", vestingAddress.address).send()
                await updateOperation.confirmation();

                // Initial Values
                councilStorage       = await councilInstance.storage();
                const cliffInMonths     = 0;
                const vestingInMonths   = 12;
                const vesteeAddress     = eve.pkh;
                const totalAllocated    = MVK(40000000);

                // Operation
                await signerFactory(alice.sk);
                await chai.expect(councilInstance.methods.councilActionUpdateVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths).send()).to.be.rejected;

                // Reset general contracts
                await signerFactory(bob.sk);
                updateOperation = await councilInstance.methods.updateGeneralContracts("vesting", vestingAddress.address).send()
                await updateOperation.confirmation();
            } catch(e){
                console.log(e);
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
                await signerFactory(isaac.sk);
                await chai.expect(councilInstance.methods.councilActionUpdateVestee(vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths).send()).to.be.rejected;
            } catch(e){
                console.log(e);
            }
        });
    })

    describe("%councilActionToggleVesteeLock", async () => {
        beforeEach("Set signer to council", async () => {
            await signerFactory(alice.sk)
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
                councilStorage      = await councilInstance.storage();
                const action        = await councilStorage.councilActionsLedger.get(nextActionID);
                const actionSigner  = action.signers.includes(alice.pkh)
                const addressMap    = await action.addressMap;

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "toggleVesteeLock");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(addressMap.get("vesteeAddress"), vesteeAddress);
            } catch(e){
                console.log(e);
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
                console.log(e);
            }
        });

        it('Council member should not be able to access this entrypoint if the Vesting contract is not in the generalContact maps and if it does not contains an ToggleVesteeLock entrypoint', async () => {
            try{
                // Update general contracts
                await signerFactory(bob.sk);
                var updateOperation = await councilInstance.methods.updateGeneralContracts("vesting", vestingAddress.address).send()
                await updateOperation.confirmation();

                // Initial Values
                councilStorage       = await councilInstance.storage();
                const vesteeAddress     = eve.pkh;

                // Operation
                await signerFactory(alice.sk);
                await chai.expect(councilInstance.methods.councilActionToggleVesteeLock(vesteeAddress).send()).to.be.rejected;

                // Reset general contracts
                await signerFactory(bob.sk);
                updateOperation = await councilInstance.methods.updateGeneralContracts("vesting", vestingAddress.address).send()
                await updateOperation.confirmation();
            } catch(e){
                console.log(e);
            }
        });

        it('Non-council member should not be able to access this entrypoint', async () => {
            try{
                // Initial Values
                councilStorage       = await councilInstance.storage();
                const vesteeAddress     = eve.pkh;

                // Operation
                await signerFactory(isaac.sk);
                await chai.expect(councilInstance.methods.councilActionToggleVesteeLock(vesteeAddress).send()).to.be.rejected;
            } catch(e){
                console.log(e);
            }
        });
    })

    describe("%councilActionAddMember", async () => {
        beforeEach("Set signer to council", async () => {
            await signerFactory(alice.sk)
        });
        
        it('Council member should be able to access this entrypoint and create a new action to add a council member (the action counter should increase in the storage)', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const newMember         = isaac.pkh;
                const nextActionID      = councilStorage.actionCounter;

                // Operation
                const newActionOperation = await councilInstance.methods.councilActionAddMember(newMember).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                const action        = await councilStorage.councilActionsLedger.get(nextActionID);
                const actionSigner  = action.signers.includes(alice.pkh)
                const addressMap    = await action.addressMap;

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "addCouncilMember");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(addressMap.get("councilMemberAddress"), newMember);
            } catch(e){
                console.log(e);
            }
        });

        it('Council member should not be able to access this entrypoint if the given member’s address is already in the council', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const newMember         = alice.pkh;

                // Operation                
                await chai.expect(councilInstance.methods.councilActionAddMember(newMember).send()).to.be.rejected;
            } catch(e){
                console.log(e);
            }
        });

        it('Non-council member should not be able to access this entrypoint', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const newMember         = isaac.pkh;

                // Operation
                await signerFactory(isaac.sk);
                await chai.expect(councilInstance.methods.councilActionAddMember(newMember).send()).to.be.rejected;
            } catch(e){
                console.log(e);
            }
        });
    })

    describe("%councilActionRemoveMember", async () => {
        beforeEach("Set signer to council", async () => {
            await signerFactory(alice.sk)
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
                councilStorage      = await councilInstance.storage();
                const action        = await councilStorage.councilActionsLedger.get(nextActionID);
                const actionSigner  = action.signers.includes(alice.pkh)
                const addressMap    = await action.addressMap;

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "removeCouncilMember");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(addressMap.get("councilMemberAddress"), newMember);
            } catch(e){
                console.log(e);
            }
        });

        it('Council member should not be able to access this entrypoint if the threshold is greater than the expected amount of members in the council', async () => {
            try{
                // Update config
                await signerFactory(bob.sk);
                councilStorage  = await councilInstance.storage();
                const currentThreshold  = councilStorage.config.threshold;
                const updatedThreshold  = councilStorage.councilMembers.length;
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
                console.log(e);
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
                console.log(e);
            }
        });

        it('Non-council member should not be able to access this entrypoint', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const newMember         = eve.pkh;

                // Operation
                await signerFactory(isaac.sk);
                await chai.expect(councilInstance.methods.councilActionRemoveMember(newMember).send()).to.be.rejected;
            } catch(e){
                console.log(e);
            }
        });
    })

    describe("%councilActionChangeMember", async () => {
        beforeEach("Set signer to council", async () => {
            await signerFactory(alice.sk)
        });
        
        it('Council member should be able to access this entrypoint and create a new action to replace a council member by another (the action counter should increase in the storage)', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const oldMember         = eve.pkh;
                const newMember         = mallory.pkh;
                const nextActionID      = councilStorage.actionCounter;

                // Operation
                const newActionOperation = await councilInstance.methods.councilActionChangeMember(oldMember, newMember).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                const action        = await councilStorage.councilActionsLedger.get(nextActionID);
                const actionSigner  = action.signers.includes(alice.pkh)
                const addressMap    = await action.addressMap;

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "changeCouncilMember");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(addressMap.get("oldCouncilMemberAddress"), oldMember);
                assert.equal(addressMap.get("newCouncilMemberAddress"), newMember);
            } catch(e){
                console.log(e);
            }
        });

        it('Council member should not be able to access this entrypoint if the given old member address is not in the council', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const oldMember         = mallory.pkh;
                const newMember         = isaac.pkh;

                // Operation
                await chai.expect(councilInstance.methods.councilActionChangeMember(oldMember, newMember).send()).to.be.rejected;
            } catch(e){
                console.log(e);
            }
        });

        it('Council member should not be able to access this entrypoint if the given new member address is already in the council', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const oldMember         = eve.pkh;
                const newMember         = alice.pkh;

                // Operation
                await chai.expect(councilInstance.methods.councilActionChangeMember(oldMember, newMember).send()).to.be.rejected;
            } catch(e){
                console.log(e);
            }
        });

        it('Non-council member should not be able to access this entrypoint', async () => {
            try{
                // Initial Values
                councilStorage          = await councilInstance.storage();
                const oldMember         = eve.pkh;
                const newMember         = mallory.pkh;

                // Operation
                await signerFactory(isaac.sk);
                await chai.expect(councilInstance.methods.councilActionChangeMember(oldMember, newMember).send()).to.be.rejected;
            } catch(e){
                console.log(e);
            }
        });
    })

    describe("%councilActionTransfer", async () => {
        beforeEach("Set signer to council", async () => {
            await signerFactory(alice.sk)
        });
        
        it('Council member should be able to access this entrypoint and create a new action to transfer tokens to given address (the action counter should increase in the storage)', async () => {
            try{
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const receiverAddress       = eve.pkh;
                const tokenContractAddress  = mvkTokenAddress.address;
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
                councilStorage      = await councilInstance.storage();
                const action        = await councilStorage.councilActionsLedger.get(nextActionID);
                const actionSigner  = action.signers.includes(alice.pkh)
                const addressMap    = await action.addressMap;
                const stringMap     = await action.stringMap;
                const natMap        = await action.natMap;

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "transfer");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(addressMap.get("receiverAddress"), receiverAddress);
                assert.equal(addressMap.get("tokenContractAddress"), tokenContractAddress);
                assert.equal(stringMap.get("tokenType"), tokenType);
                assert.equal(stringMap.get("purpose"), purpose);
                assert.equal(natMap.get("tokenAmount"), tokenAmount);
                assert.equal(natMap.get("tokenId"), tokenId);
            } catch(e){
                console.log(e);
            }
        });
        
        it('Council member should not be able to access this entrypoint if the given tokenType is not FA12, FA2 or XTZ', async () => {
            try{
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const receiverAddress       = eve.pkh;
                const tokenContractAddress  = mvkTokenAddress.address;
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
                console.log(e);
            }
        });

        it('Non-council member should not be able to access this entrypoint', async () => {
            try{
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const receiverAddress       = eve.pkh;
                const tokenContractAddress  = mvkTokenAddress.address;
                const tokenType             = "FA2";
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const tokenId               = 0;

                // Operation
                await signerFactory(isaac.sk);
                await chai.expect(councilInstance.methods.councilActionTransfer(
                    receiverAddress,
                    tokenContractAddress,
                    tokenAmount,
                    tokenType,
                    tokenId,
                    purpose).send()
                ).to.be.rejected;
            } catch(e){
                console.log(e);
            }
        });
    })

    describe("%councilActionRequestTokens", async () => {
        beforeEach("Set signer to council", async () => {
            await signerFactory(alice.sk)
        });
        
        it('Council member should be able to access this entrypoint and create a new action to request tokens from the given treasury (the action counter should increase in the storage)', async () => {
            try{
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const fromTreasury          = treasuryAddress.address;
                const tokenContractAddress  = mvkTokenAddress.address;
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
                councilStorage      = await councilInstance.storage();
                const action        = await councilStorage.councilActionsLedger.get(nextActionID);
                const actionSigner  = action.signers.includes(alice.pkh)
                const addressMap    = await action.addressMap;
                const stringMap     = await action.stringMap;
                const natMap        = await action.natMap;

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "requestTokens");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(addressMap.get("treasuryAddress"), fromTreasury);
                assert.equal(addressMap.get("tokenContractAddress"), tokenContractAddress);
                assert.equal(stringMap.get("tokenName"), tokenName);
                assert.equal(stringMap.get("tokenType"), tokenType);
                assert.equal(stringMap.get("purpose"), purpose);
                assert.equal(natMap.get("tokenAmount"), tokenAmount);
                assert.equal(natMap.get("tokenId"), tokenId);
            } catch(e){
                console.log(e);
            }
        });

        it('Council member should not be able to access this entrypoint if the given tokenType is not FA12, FA2 or XTZ', async () => {
            try{
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const fromTreasury          = treasuryAddress.address;
                const tokenContractAddress  = mvkTokenAddress.address;
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
                console.log(e);
            }
        });

        it('Council member should not be able to access this entrypoint if the Governance contract is not in the generalContact maps and if it does not contains an requestTokens entrypoint', async () => {
            try{
                // Update general contracts
                await signerFactory(bob.sk);
                var updateOperation = await councilInstance.methods.updateGeneralContracts("governance", governanceAddress.address).send()
                await updateOperation.confirmation();

                // Initial Values
                councilStorage              = await councilInstance.storage();
                const fromTreasury          = treasuryAddress.address;
                const tokenContractAddress  = mvkTokenAddress.address;
                const tokenName             = "MVK";
                const tokenType             = "FA2";
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

                // Reset general contracts
                await signerFactory(bob.sk);
                updateOperation = await councilInstance.methods.updateGeneralContracts("governance", governanceAddress.address).send()
                await updateOperation.confirmation();
            } catch(e){
                console.log(e);
            }
        });

        it('Non-council member should not be able to access this entrypoint', async () => {
            try{
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const fromTreasury          = treasuryAddress.address;
                const tokenContractAddress  = mvkTokenAddress.address;
                const tokenName             = "MVK";
                const tokenType             = "FA2";
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const tokenId               = 0;

                // Operation
                await signerFactory(isaac.sk);
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
                console.log(e);
            }
        });
    })

    describe("%councilActionRequestMint", async () => {
        beforeEach("Set signer to council", async () => {
            await signerFactory(alice.sk)
        });
        
        it('Council member should be able to access this entrypoint and create a new action to request a mint from the given treasury (the action counter should increase in the storage)', async () => {
            try{
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const fromTreasury          = treasuryAddress.address;
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
                councilStorage      = await councilInstance.storage();
                const action        = await councilStorage.councilActionsLedger.get(nextActionID);
                const actionSigner  = action.signers.includes(alice.pkh)
                const addressMap    = await action.addressMap;
                const stringMap     = await action.stringMap;
                const natMap        = await action.natMap;

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "requestMint");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(addressMap.get("treasuryAddress"), fromTreasury);
                assert.equal(stringMap.get("purpose"), purpose);
                assert.equal(natMap.get("tokenAmount"), tokenAmount);
            } catch(e){
                console.log(e);
            }
        });

        it('Council member should not be able to access this entrypoint if the Governance contract is not in the generalContact maps and if it does not contains an requestTokens entrypoint', async () => {
            try{
                // Update general contracts
                await signerFactory(bob.sk);
                var updateOperation = await councilInstance.methods.updateGeneralContracts("governance", governanceAddress.address).send()
                await updateOperation.confirmation();

                // Initial Values
                councilStorage              = await councilInstance.storage();
                const fromTreasury          = treasuryAddress.address;
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);

                // Operation
                await chai.expect(councilInstance.methods.councilActionRequestMint(
                    fromTreasury,
                    tokenAmount,
                    purpose).send()
                ).to.be.rejected;

                // Reset general contracts
                await signerFactory(bob.sk);
                updateOperation = await councilInstance.methods.updateGeneralContracts("governance", governanceAddress.address).send()
                await updateOperation.confirmation();
            } catch(e){
                console.log(e);
            }
        });

        it('Non-council member should not be able to access this entrypoint', async () => {
            try{
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const fromTreasury          = treasuryAddress.address;
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);

                // Operation
                await signerFactory(isaac.sk);
                await chai.expect(councilInstance.methods.councilActionRequestMint(
                    fromTreasury,
                    tokenAmount,
                    purpose).send()
                ).to.be.rejected;
            } catch(e){
                console.log(e);
            }
        });
    })

    describe("%councilActionDropFinancialReq", async () => {
        beforeEach("Set signer to council", async () => {
            await signerFactory(alice.sk)
        });
        
        it('Council member should be able to access this entrypoint and create a new action to request a mint from the given treasury (the action counter should increase in the storage)', async () => {
            try{
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const requestID             = councilStorage.actionCounter - 1;
                const nextActionID          = councilStorage.actionCounter;

                // Operation
                const newActionOperation = await councilInstance.methods.councilActionDropFinancialReq(requestID).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                const action        = await councilStorage.councilActionsLedger.get(nextActionID);
                const actionSigner  = action.signers.includes(alice.pkh)
                const natMap        = await action.natMap;

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "dropFinancialRequest");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(natMap.get("requestId"), requestID);
            } catch(e){
                console.log(e);
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
                console.log(e);
            }
        });
        
        it('Council member should not be able to access this entrypoint if the financial request linked to the provided ID was flushed', async () => {
            try{
                // ----- REQUEST MINT
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const fromTreasury          = treasuryAddress.address;
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
                councilStorage      = await councilInstance.storage();
                var action          = await councilStorage.councilActionsLedger.get(mintActionID);
                var actionSigner    = action.signers.includes(alice.pkh)
                var addressMap      = await action.addressMap;
                var stringMap       = await action.stringMap;
                var natMap          = await action.natMap;

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "requestMint");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(addressMap.get("treasuryAddress"), fromTreasury);
                assert.equal(stringMap.get("purpose"), purpose);
                assert.equal(natMap.get("tokenAmount"), tokenAmount);

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
                natMap              = await action.natMap;

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "flushAction");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(natMap.get("actionId").toNumber(), mintActionID.toNumber());

                // ----- SIGN FLUSH
                await signerFactory(bob.sk)

                // Operation
                const signOperation = await councilInstance.methods.signAction(flushActionID).send();
                await signOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                action              = await councilStorage.councilActionsLedger.get(flushActionID);
                const flushedAction = await councilStorage.councilActionsLedger.get(mintActionID);

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "flushAction");
                assert.equal(action.executed, true);
                assert.equal(action.signersCount, 2);
                assert.equal(natMap.get("actionId").toNumber(), mintActionID.toNumber());

                assert.strictEqual(flushedAction.initiator, alice.pkh);
                assert.strictEqual(flushedAction.status, "FLUSHED");
                assert.strictEqual(flushedAction.actionType, "requestMint");
                assert.equal(flushedAction.executed, false);
                assert.equal(flushedAction.signersCount, 1);
                assert.equal(flushedAction.get("treasuryAddress"), fromTreasury);
                assert.equal(flushedAction.get("purpose"), purpose);
                assert.equal(flushedAction.get("tokenAmount"), tokenAmount);

                // ----- DROP
                await signerFactory(alice.sk);
                await chai.expect(councilInstance.methods.councilActionDropFinancialReq(mintActionID).send()).to.be.rejected;
            } catch(e){
                console.log(e);
            }
        });
        
        it('Council member should not be able to access this entrypoint if the financial request linked to the provided ID was executed', async () => {
            try{
                // ----- REQUEST MINT
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const fromTreasury          = treasuryAddress.address;
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
                councilStorage      = await councilInstance.storage();
                var action          = await councilStorage.councilActionsLedger.get(mintActionID);
                var actionSigner    = action.signers.includes(alice.pkh)
                var addressMap      = await action.addressMap;
                var stringMap       = await action.stringMap;
                var natMap          = await action.natMap;

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "requestMint");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(addressMap.get("treasuryAddress"), fromTreasury);
                assert.equal(stringMap.get("purpose"), purpose);
                assert.equal(natMap.get("tokenAmount"), tokenAmount);

                // ----- SIGN REQUEST
                // Operation
                await signerFactory(bob.sk)
                newActionOperation = await councilInstance.methods.signAction(mintActionID).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                action              = await councilStorage.councilActionsLedger.get(mintActionID);
                actionSigner        = action.signers.includes(alice.pkh)
                var addressMap      = await action.addressMap;
                var stringMap       = await action.stringMap;
                var natMap          = await action.natMap;

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "requestMint");
                assert.equal(action.executed, true);
                assert.equal(action.signersCount, 2);
                assert.equal(addressMap.get("treasuryAddress"), fromTreasury);
                assert.equal(stringMap.get("purpose"), purpose);
                assert.equal(natMap.get("tokenAmount"), tokenAmount);

                // ----- DROP
                await signerFactory(alice.sk);
                await chai.expect(councilInstance.methods.councilActionDropFinancialReq(mintActionID).send()).to.be.rejected;
            } catch(e){
                console.log(e);
            }
        });

        it('Non-council member should not be able to access this entrypoint', async () => {
            try{
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const requestID             = councilStorage.actionCounter - 1;

                // Operation
                await signerFactory(isaac.sk);
                await chai.expect(councilInstance.methods.councilActionDropFinancialReq(requestID).send()).to.be.rejected;
            } catch(e){
                console.log(e);
            }
        });
    })

    describe("%flushAction", async () => {
        beforeEach("Set signer to council", async () => {
            await signerFactory(alice.sk)
        });

        it('Council member should be able to access this entrypoint with a correct actionID and create a new action to flush a pending action (the action counter should increase in the storage)', async () => {
            try{
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const requestID             = 1;
                const nextActionID          = councilStorage.actionCounter;

                // Operation
                const newActionOperation = await councilInstance.methods.flushAction(requestID).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                const action        = await councilStorage.councilActionsLedger.get(nextActionID);
                const actionSigner  = action.signers.includes(alice.pkh)
                const natMap        = await action.natMap;

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "flushAction");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(natMap.get("actionId"), requestID);
            } catch(e){
                console.log(e);
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
                console.log(e);
            }
        });

        it('Council member should not be able to access this entrypoint if the action linked to the provided actionID was flushed', async () => {
            try{
                // ----- ADD MEMBER
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const councilMember         = mallory.pkh;
                const memberActionID        = councilStorage.actionCounter;

                // Operation
                var newActionOperation = await councilInstance.methods.councilActionAddMember(councilMember).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                var action          = await councilStorage.councilActionsLedger.get(memberActionID);
                var actionSigner    = action.signers.includes(alice.pkh)
                var addressMap      = await action.addressMap;

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "addCouncilMember");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(addressMap.get("councilMemberAddress"), councilMember);

                // ----- FLUSH ACTION
                // Initial Values
                councilStorage                  = await councilInstance.storage();
                const flushActionID             = councilStorage.actionCounter;

                // Operation
                newActionOperation = await councilInstance.methods.flushAction(memberActionID).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                action              = await councilStorage.councilActionsLedger.get(flushActionID);
                actionSigner        = action.signers.includes(alice.pkh)
                const natMap        = await action.natMap;

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "flushAction");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(natMap.get("actionId").toNumber(), memberActionID.toNumber());

                // ----- SIGN DROP
                await signerFactory(bob.sk)

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
                assert.equal(natMap.get("actionId"), memberActionID);

                assert.strictEqual(flushedAction.initiator, alice.pkh);
                assert.strictEqual(flushedAction.status, "FLUSHED");
                assert.strictEqual(flushedAction.actionType, "addCouncilMember");
                assert.equal(flushedAction.executed, false);
                assert.equal(flushedAction.signersCount, 1);
                assert.equal(addressMap.get("councilMemberAddress"), councilMember);

                // ----- FLUSH AGAIN
                await signerFactory(alice.sk);
                await chai.expect(councilInstance.methods.flushAction(memberActionID).send()).to.be.rejected;
            } catch(e){
                console.log(e);
            }
        });

        it('Council member should not be able to access this entrypoint if the action linked to the provided actionID was executed', async () => {
            try{
                // ----- ADD MEMBER
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const councilMember         = mallory.pkh;
                const memberActionID        = councilStorage.actionCounter;

                // Operation
                var newActionOperation = await councilInstance.methods.councilActionAddMember(councilMember).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                var action          = await councilStorage.councilActionsLedger.get(memberActionID);
                var actionSigner    = action.signers.includes(alice.pkh)
                var addressMap      = await action.addressMap;

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "addCouncilMember");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(addressMap.get("councilMemberAddress"), councilMember);

                // ----- SIGN ACTION
                await signerFactory(bob.sk)

                // Operation
                const signOperation = await councilInstance.methods.signAction(memberActionID).send();
                await signOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                var action          = await councilStorage.councilActionsLedger.get(memberActionID);
                var addressMap      = await action.addressMap;

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "addCouncilMember");
                assert.equal(action.executed, true);
                assert.equal(action.signersCount, 2);
                assert.equal(addressMap.get("councilMemberAddress"), councilMember);

                // ----- FLUSH
                await signerFactory(alice.sk);
                await chai.expect(councilInstance.methods.flushAction(memberActionID).send()).to.be.rejected;
            } catch(e){
                console.log(e);
            }
        });

        it('Non-council member should not be able to access this entrypoint', async () => {
            try{
                // Initial Values
                councilStorage              = await councilInstance.storage();
                const requestID             = councilStorage.actionCounter - 1;

                // Operation
                await signerFactory(isaac.sk);
                await chai.expect(councilInstance.methods.councilActionDropFinancialReq(requestID).send()).to.be.rejected;
            } catch(e){
                console.log(e);
            }
        });
    })

    describe("%signAction", async () => {
        beforeEach("Set signer to council", async () => {
            await signerFactory(alice.sk)
        });

        it('updateBlocksPerMinute --> should update the blocksPerMinute in the given contract', async () => {
            try{
                // // Set farmFactory admin to governance for test purposes
                const givenContractInstance     = await utils.tezos.contract.at(farmFactoryAddress.address);
                // const setAdminOperation         = await givenContractInstance.methods.setAdmin(governanceAddress.address).send();
                // await setAdminOperation.confirmation();

                // Initial Values
                councilStorage          = await councilInstance.storage();
                const actionValue       = 3;
                const nextActionID      = councilStorage.actionCounter;

                // Operation
                const newActionOperation = await councilInstance.methods.councilActionUpdateBlocksPerMin(farmFactoryAddress.address, actionValue).send();
                await newActionOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                var action          = await councilStorage.councilActionsLedger.get(nextActionID);
                var actionSigner    = action.signers.includes(alice.pkh)
                var addressMap      = await action.addressMap;
                var natMap          = await action.natMap;

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "updateBlocksPerMinute");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(addressMap.get("contractAddress"), farmFactoryAddress.address);
                assert.equal(natMap.get("newBlocksPerMinute"), actionValue);

                // Operation
                await signerFactory(bob.sk)
                const signOperation = await councilInstance.methods.signAction(nextActionID).send();
                await signOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                var action          = await councilStorage.councilActionsLedger.get(nextActionID);
                var actionSigner    = action.signers.includes(alice.pkh)
                var addressMap      = await action.addressMap;
                var natMap          = await action.natMap;
                const givenContractStorage:any  = await givenContractInstance.storage();

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "updateBlocksPerMinute");
                assert.equal(action.executed, true);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 2);
                assert.equal(addressMap.get("contractAddress"), farmFactoryAddress.address);
                assert.equal(natMap.get("newBlocksPerMinute"), actionValue);
                assert.equal(givenContractStorage.config, actionValue);
            } catch(e){
                console.log(e);
            }
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
                councilStorage      = await councilInstance.storage();
                var action          = await councilStorage.councilActionsLedger.get(nextActionID);
                var actionSigner    = action.signers.includes(alice.pkh)
                var addressMap      = await action.addressMap;
                var natMap          = await action.natMap;

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "addVestee");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(addressMap.get("vesteeAddress"), vesteeAddress);
                assert.equal(natMap.get("totalAllocatedAmount"), totalAllocated);
                assert.equal(natMap.get("cliffInMonths"), cliffInMonths);
                assert.equal(natMap.get("vestingInMonths"), vestingInMonths);

                // Operation
                await signerFactory(bob.sk)
                const signOperation = await councilInstance.methods.signAction(nextActionID).send();
                await signOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                var action          = await councilStorage.councilActionsLedger.get(nextActionID);
                var actionSigner    = action.signers.includes(alice.pkh)
                var addressMap      = await action.addressMap;
                var natMap          = await action.natMap;

                vestingStorage      = await vestingInstance.storage();
                const vestee        = await vestingStorage.vesteeLedger.get(vesteeAddress);

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "addVestee");
                assert.equal(action.executed, true);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 2);
                assert.equal(addressMap.get("vesteeAddress"), vesteeAddress);
                assert.equal(natMap.get("totalAllocatedAmount"), totalAllocated);
                assert.equal(natMap.get("cliffInMonths"), cliffInMonths);
                assert.equal(natMap.get("vestingInMonths"), vestingInMonths);
                assert.notStrictEqual(vestee, undefined);
                assert.equal(vestee.totalAllocatedAmount, totalAllocated);
                assert.equal(vestee.cliffMonths, cliffInMonths);
                assert.equal(vestee.vestingMonths, vestingInMonths);
            } catch(e){
                console.log(e);
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
                councilStorage      = await councilInstance.storage();
                var action          = await councilStorage.councilActionsLedger.get(nextActionID);
                var actionSigner    = action.signers.includes(alice.pkh)
                var addressMap      = await action.addressMap;
                var natMap          = await action.natMap;

                // Assertions
                assert.strictEqual(action.initiator, alice.pkh);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "addVestee");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(addressMap.get("vesteeAddress"), vesteeAddress);
                assert.equal(natMap.get("totalAllocatedAmount"), totalAllocated);
                assert.equal(natMap.get("cliffInMonths"), cliffInMonths);
                assert.equal(natMap.get("vestingInMonths"), vestingInMonths);

                // Update general contracts
                await signerFactory(bob.sk);
                var updateOperation = await councilInstance.methods.updateGeneralContracts("vesting", vestingAddress.address).send()
                await updateOperation.confirmation();

                // Operation
                await signerFactory(bob.sk)
                await chai.expect(councilInstance.methods.signAction(nextActionID).send()).to.be.rejected;

                // Reset general contracts
                await signerFactory(bob.sk);
                updateOperation = await councilInstance.methods.updateGeneralContracts("vesting", vestingAddress.address).send()
                await updateOperation.confirmation();
            } catch(e){
                console.log(e);
            }
        });
    })

    // it('council can add a new council member', async () => {
    //     try{        

    //         console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
    //         console.log("Test: Council can add a new council member") 
    //         console.log("---") // break

    //          // init constants
    //         const actionId                  = 1;

    //         // Council Members: Bob, Alice, Eve

    //         // params: new council member address
    //         const newCouncilMemberAddress   = mallory.pkh;

    //         const councilStorage            = await councilInstance.storage();
    //         const initialCouncilMemberCount = councilStorage.councilMembers.length;
            
    //         // check that there are 3 initial council members
    //         assert.equal(initialCouncilMemberCount, 3);
            
    //         // Council add new council member
    //         await signerFactory(bob.sk)
    //         const councilAddNewCouncilMemberOperation = await councilInstance.methods.councilActionAddMember(
    //             newCouncilMemberAddress
    //             ).send();
    //         await councilAddNewCouncilMemberOperation.confirmation();

    //         // assert that new addMember action has been created with PENDING status
    //         const updatedCouncilStorage    = await councilInstance.storage();
    //         const councilActionAddMember   = await updatedCouncilStorage.councilActionsLedger.get(actionId);

    //         // check details of council action
    //         assert.equal(councilActionAddMember.actionType,       "addCouncilMember");

    //         assert.equal(councilActionAddMember.addressMap.get("councilMemberAddress"),  newCouncilMemberAddress);
            
    //         assert.equal(councilActionAddMember.executed,         false);
    //         assert.equal(councilActionAddMember.status,           "PENDING");
    //         assert.equal(councilActionAddMember.signersCount,     1);
    //         assert.equal(councilActionAddMember.signers[0],       bob.pkh);

    //         // Council member 2 (alice) signs addMember action
    //         await signerFactory(alice.sk);
    //         const aliceSignsAddMemberOperation = await councilInstance.methods.signAction(actionId).send();
    //         await aliceSignsAddMemberOperation.confirmation();

    //         // Council member 3 (eve) signs addMember action
    //         await signerFactory(eve.sk);
    //         const eveSignsAddMemberOperation = await councilInstance.methods.signAction(actionId).send();
    //         await eveSignsAddMemberOperation.confirmation();

    //         // get updated storage
    //         const completedCouncilStorage          = await councilInstance.storage();
    //         const councilActionsAddMemberSigned    = await completedCouncilStorage.councilActionsLedger.get(actionId);
    //         const newCouncilMemberCount            = completedCouncilStorage.councilMembers.length;

    //         // check that council action is approved and has been executed
    //         assert.equal(councilActionsAddMemberSigned.signersCount,  3);
    //         assert.equal(councilActionsAddMemberSigned.executed,      true);
    //         assert.equal(councilActionsAddMemberSigned.status,        "EXECUTED");

    //         // check that there are now 4 council members
    //         assert.equal(newCouncilMemberCount, 4);

    //     } catch(e){
    //         console.log(e);
    //     } 

    // });    

    // it('council can remove a council member, and new council member can sign actions', async () => {
    //     try{        

    //         console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
    //         console.log("Test: Council can remove a council member, and new council member can sign actions") 
    //         console.log("---") // break

    //         // init constants
    //         const actionId                  = 2;

    //         // Council Members: Bob, Alice, Eve, Mallory

    //         // params: remove council member address
    //         const removedCouncilMemberAddress      = alice.pkh;

    //         const councilStorage            = await councilInstance.storage();
    //         const initialCouncilMemberCount = councilStorage.councilMembers.length;

    //         // check that there are 4 council members
    //         assert.equal(initialCouncilMemberCount, 4);

    //         // Council remove council member
    //         await signerFactory(bob.sk)
    //         const councilRemoveCouncilMemberOperation = await councilInstance.methods.councilActionRemoveMember(
    //             removedCouncilMemberAddress
    //             ).send();
    //         await councilRemoveCouncilMemberOperation.confirmation();

    //         // assert that new removeMember action has been created with PENDING status
    //         const updatedCouncilStorage    = await councilInstance.storage();
    //         const councilActionRemoveMember   = await updatedCouncilStorage.councilActionsLedger.get(actionId);
        
    //         // check details of council action
    //         assert.equal(councilActionRemoveMember.actionType,       "removeCouncilMember");

    //         assert.equal(councilActionRemoveMember.addressMap.get("councilMemberAddress"),  removedCouncilMemberAddress);
            
    //         assert.equal(councilActionRemoveMember.executed,         false);
    //         assert.equal(councilActionRemoveMember.status,           "PENDING");
    //         assert.equal(councilActionRemoveMember.signersCount,     1);
    //         assert.equal(councilActionRemoveMember.signers[0],       bob.pkh);

    //         // Council member 2 (mallory) signs removeMember action
    //         await signerFactory(mallory.sk);
    //         const mallorySignsRemoveMemberOperation = await councilInstance.methods.signAction(actionId).send();
    //         await mallorySignsRemoveMemberOperation.confirmation();

    //         // Council member 3 (eve) signs removeMember action
    //         await signerFactory(eve.sk);
    //         const eveSignsRemoveMemberOperation = await councilInstance.methods.signAction(actionId).send();
    //         await eveSignsRemoveMemberOperation.confirmation();

    //         // get updated storage
    //         const completedCouncilStorage           = await councilInstance.storage();
    //         const councilActionsRemoveMemberSigned  = await completedCouncilStorage.councilActionsLedger.get(actionId);
    //         const newCouncilMemberCount             = completedCouncilStorage.councilMembers.length;

    //         // check that council action is approved and has been executed
    //         assert.equal(councilActionsRemoveMemberSigned.signersCount,  3);
    //         assert.equal(councilActionsRemoveMemberSigned.executed,      true);
    //         assert.equal(councilActionsRemoveMemberSigned.status,        "EXECUTED");

    //         // check that there are now 3 council members
    //         assert.equal(newCouncilMemberCount, 3);

    //     } catch(e){
    //         console.log(e);
    //     } 

    // });    

    // it('council can change a council member', async () => {
    //     try{        

    //         console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
    //         console.log("Test: Council can change a council member") 
    //         console.log("---") // break

    //         // init constants
    //         const actionId                  = 3;
    //         // Council Members: Bob, Eve, Mallory

    //         // params: change council member address (mallory to alice)
    //         const oldCouncilMemberAddress      = mallory.pkh;
    //         const newCouncilMemberAddress      = alice.pkh;

    //         const councilStorage            = await councilInstance.storage();
    //         const initialCouncilMemberCount = councilStorage.councilMembers.length;

    //         // check that there are 3 council members
    //         assert.equal(initialCouncilMemberCount, 3);

    //         // Council remove council member
    //         await signerFactory(bob.sk)
    //         const councilChangeCouncilMemberOperation = await councilInstance.methods.councilActionChangeMember(
    //             oldCouncilMemberAddress, newCouncilMemberAddress
    //             ).send();
    //         await councilChangeCouncilMemberOperation.confirmation();

    //         // assert that new changeMember action has been created with PENDING status
    //         const updatedCouncilStorage    = await councilInstance.storage();
    //         const councilActionChangeMember   = await updatedCouncilStorage.councilActionsLedger.get(actionId);
        
    //         // check details of council action
    //         assert.equal(councilActionChangeMember.actionType,       "changeCouncilMember");

    //         assert.equal(councilActionChangeMember.addressMap.get("oldCouncilMemberAddress"),  oldCouncilMemberAddress);
    //         assert.equal(councilActionChangeMember.addressMap.get("newCouncilMemberAddress"),  newCouncilMemberAddress);

    //         assert.equal(councilActionChangeMember.executed,         false);
    //         assert.equal(councilActionChangeMember.status,           "PENDING");
    //         assert.equal(councilActionChangeMember.signersCount,     1);
    //         assert.equal(councilActionChangeMember.signers[0],       bob.pkh);

    //         // Council member 2 (mallory) signs changeMember action
    //         await signerFactory(mallory.sk);
    //         const mallorySignsChangeMemberOperation = await councilInstance.methods.signAction(actionId).send();
    //         await mallorySignsChangeMemberOperation.confirmation();

    //         // Council member 3 (eve) signs changeMember action
    //         await signerFactory(eve.sk);
    //         const eveSignsChangeMemberOperation = await councilInstance.methods.signAction(actionId).send();
    //         await eveSignsChangeMemberOperation.confirmation();

    //         // get updated storage
    //         const completedCouncilStorage           = await councilInstance.storage();
    //         const councilActionsChangeMemberSigned  = await completedCouncilStorage.councilActionsLedger.get(actionId);
    //         const newCouncilMemberCount             = completedCouncilStorage.councilMembers.length;

    //         // check that council action is approved and has been executed
    //         assert.equal(councilActionsChangeMemberSigned.signersCount,  3);
    //         assert.equal(councilActionsChangeMemberSigned.executed,      true);
    //         assert.equal(councilActionsChangeMemberSigned.status,        "EXECUTED");

    //         // check that there are now 3 council members
    //         assert.equal(newCouncilMemberCount, 3);
    //         assert.equal(completedCouncilStorage.councilMembers[2], alice.pkh);

    //     } catch(e){
    //         console.log(e);
    //     } 

    // });    


    // it('council can flush a council action', async () => {
    //     try{        

    //         console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
    //         console.log("Test: Council can flush a council action") 
    //         console.log("---") // break

    //         // init constants
    //         const actionId                  = 4;
    //         const flushActionId             = 5;
    //         // Council Members: Bob, Eve, Alice

    //         // params: new council member address (mallory)
    //         const councilMemberAddress      = mallory.pkh;
        
    //         const councilStorage            = await councilInstance.storage();
    //         const initialCouncilMemberCount = councilStorage.councilMembers.length;

    //         // check that there are 3 council members
    //         assert.equal(initialCouncilMemberCount, 3);

    //         // Council add council member
    //         await signerFactory(bob.sk)
    //         const councilAddCouncilMemberOperation = await councilInstance.methods.councilActionAddMember(
    //             councilMemberAddress
    //             ).send();
    //         await councilAddCouncilMemberOperation.confirmation();

    //         // assert that new addMember action has been created with PENDING status
    //         const updatedCouncilStorage       = await councilInstance.storage();
    //         const councilActionAddMember   = await updatedCouncilStorage.councilActionsLedger.get(actionId);
        
    //         // check details of council action
    //         assert.equal(councilActionAddMember.actionType,       "addCouncilMember");

    //         assert.equal(councilActionAddMember.addressMap.get("councilMemberAddress"),  councilMemberAddress);

    //         assert.equal(councilActionAddMember.executed,         false);
    //         assert.equal(councilActionAddMember.status,           "PENDING");
    //         assert.equal(councilActionAddMember.signersCount,     1);
    //         assert.equal(councilActionAddMember.signers[0],       bob.pkh);

    //         // Council member 2 (alice) signs addMember action
    //         await signerFactory(alice.sk);
    //         const aliceSignsAddMemberOperation = await councilInstance.methods.signAction(actionId).send();
    //         await aliceSignsAddMemberOperation.confirmation();

    //         // Council member 3 (eve) decides to flush addMemberAction
    //         await signerFactory(eve.sk);
    //         const eveFlushesAddMemberOperation = await councilInstance.methods.flushAction(actionId).send();
    //         await eveFlushesAddMemberOperation.confirmation();

    //         // assert that new flushAction has been created with PENDING status
    //         const updatedCouncilStorageWithFlush       = await councilInstance.storage();
    //         const councilActionFlush                   = await updatedCouncilStorageWithFlush.councilActionsLedger.get(flushActionId);
        
    //         // check details of council action
    //         assert.equal(councilActionFlush.actionType,       "flushAction");

    //         assert.equal(councilActionFlush.natMap.get("actionId"),  actionId);

    //         assert.equal(councilActionFlush.executed,         false);
    //         assert.equal(councilActionFlush.status,           "PENDING");
    //         assert.equal(councilActionFlush.signersCount,     1);
    //         assert.equal(councilActionFlush.signers[0],       eve.pkh);

    //         // Council member 1 (bob) decides to flush addMemberAction
    //         await signerFactory(bob.sk);
    //         const bobSignsFlushActionOperation = await councilInstance.methods.signAction(flushActionId).send();
    //         await bobSignsFlushActionOperation.confirmation();

    //         // Council member 2 (alice) decides to flush addMemberAction
    //         await signerFactory(bob.sk);
    //         const aliceSignsFlushActionOperation = await councilInstance.methods.signAction(flushActionId).send();
    //         await aliceSignsFlushActionOperation.confirmation();

    //         // get updated storage
    //         const completedCouncilStorage           = await councilInstance.storage();
    //         const councilActionsAddMemberFlushed    = await completedCouncilStorage.councilActionsLedger.get(actionId);
    //         const councilActionsFlushAction         = await completedCouncilStorage.councilActionsLedger.get(flushActionId);
    //         const newCouncilMemberCount             = completedCouncilStorage.councilMembers.length;

    //         // check that flush action is approved and has been executed
    //         assert.equal(councilActionsFlushAction.signersCount,  3);
    //         assert.equal(councilActionsFlushAction.executed,      true);
    //         assert.equal(councilActionsFlushAction.status,        "EXECUTED");

    //         // check that add council member action has been flushed
    //         assert.equal(councilActionsAddMemberFlushed.signersCount,  2);
    //         assert.equal(councilActionsAddMemberFlushed.executed,      false);
    //         assert.equal(councilActionsAddMemberFlushed.status,        "FLUSHED");

    //         // check that there are still 3 council members
    //         assert.equal(newCouncilMemberCount, 3);

    //     } catch(e){
    //         console.log(e);
    //     } 

    // });    

    // it('council can transfer mock FA12 tokens to a wallet address', async () => {
    //     try{        

    //         console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
    //         console.log("Test: Council can transfer mock FA12 tokens to a wallet address") 
    //         console.log("---") // break

    //         // init constants
    //         const actionId                  = 6;
    //         const councilContractAddress    = councilAddress.address;
    //         // Council Members: Bob, Alice, Eve

    //         const councilStorage            = await councilInstance.storage();
    //         const initialCouncilMemberCount = councilStorage.councilMembers.length;

    //         const mockFa12TokenStorage      = await mockFa12TokenInstance.storage();
    //         const councilMockFa12Ledger     = await mockFa12TokenStorage.ledger.get(councilContractAddress);
    //         const oscarMockFa12Ledger       = await mockFa12TokenStorage.ledger.get(oscar.pkh);            

    //         // check that there are 3 council members
    //         assert.equal(initialCouncilMemberCount, 3);
    //         // check that council has 250 mock FA12 tokens (transferred from mallory in test setup)
    //         assert.equal(councilMockFa12Ledger.balance, 250000000);

    //         // Council member create transfer mock FA12 token operation
    //         await signerFactory(bob.sk)
    //         const receiverAddress        = oscar.pkh;
    //         const tokenContractAddress   = mockFa12TokenAddress.address;
    //         const tokenAmount            = 150000000;
    //         const tokenType              = "FA12";
    //         const tokenId                = 0;

    //         const councilTransferTezOperation = await councilInstance.methods.councilActionTransfer(
    //             receiverAddress, 
    //             tokenContractAddress,
    //             tokenAmount,
    //             tokenType,
    //             tokenId
    //             ).send();
    //         await councilTransferTezOperation.confirmation();

    //         // assert that new transfer action has been created with PENDING status
    //         const updatedCouncilStorage       = await councilInstance.storage();
    //         const councilActionTransfer       = await updatedCouncilStorage.councilActionsLedger.get(actionId);
        
    //         // check details of council action
    //         assert.equal(councilActionTransfer.actionType,       "transfer");

    //         assert.equal(councilActionTransfer.addressMap.get("receiverAddress"),  receiverAddress);
    //         assert.equal(councilActionTransfer.addressMap.get("tokenContractAddress"),  tokenContractAddress);
    //         assert.equal(councilActionTransfer.natMap.get("tokenAmount"),  tokenAmount);
    //         assert.equal(councilActionTransfer.natMap.get("tokenId"),  tokenId);
    //         assert.equal(councilActionTransfer.stringMap.get("tokenType"),  tokenType);

    //         assert.equal(councilActionTransfer.executed,         false);
    //         assert.equal(councilActionTransfer.status,           "PENDING");
    //         assert.equal(councilActionTransfer.signersCount,     1);
    //         assert.equal(councilActionTransfer.signers[0],       bob.pkh);

    //         // Council member 2 (alice) signs transfer action
    //         await signerFactory(alice.sk);
    //         const aliceSignsTransferOperation = await councilInstance.methods.signAction(actionId).send();
    //         await aliceSignsTransferOperation.confirmation();

    //         // Council member 3 (eve) signs transfer action
    //         await signerFactory(eve.sk);
    //         const eveSignsTransferOperation = await councilInstance.methods.signAction(actionId).send();
    //         await eveSignsTransferOperation.confirmation();

    //         // get updated storage
    //         const completedCouncilStorage           = await councilInstance.storage();
    //         const councilActionsTransferSigned      = await completedCouncilStorage.councilActionsLedger.get(actionId);

    //         const updatedMockFa12TokenStorage       = await mockFa12TokenInstance.storage();
    //         const updatedCouncilMockFa12Ledger      = await updatedMockFa12TokenStorage.ledger.get(councilContractAddress);
    //         const updatedOscarMockFa12Ledger        = await updatedMockFa12TokenStorage.ledger.get(oscar.pkh);            

    //         // check that council action is approved and has been executed
    //         assert.equal(councilActionsTransferSigned.signersCount,  3);
    //         assert.equal(councilActionsTransferSigned.executed,      true);
    //         assert.equal(councilActionsTransferSigned.status,        "EXECUTED");

    //         // check that ocase has received 150 mock FA12 Tokens from the council contract
    //         assert.equal(updatedCouncilMockFa12Ledger.balance, 100000000);
    //         assert.equal(updatedOscarMockFa12Ledger.balance, 150000000);

    //     } catch(e){
    //         console.log(e);
    //     } 

    // });    


    // it('council can transfer mock FA2 tokens to a wallet address', async () => {
    //     try{        

    //         console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
    //         console.log("Test: Council can transfer mock FA2 tokens to a wallet address") 
    //         console.log("---") // break

    //         // init constants
    //         const actionId                  = 7;
    //         const councilContractAddress    = councilAddress.address;
    //         // Council Members: Bob, Alice, Eve

    //         const councilStorage            = await councilInstance.storage();
    //         const initialCouncilMemberCount = councilStorage.councilMembers.length;

    //         const mockFa2TokenStorage      = await mockFa2TokenInstance.storage();
    //         const councilMockFa2Ledger     = await mockFa2TokenStorage.ledger.get(councilContractAddress);
    //         const oscarMockFa2Ledger       = await mockFa2TokenStorage.ledger.get(oscar.pkh);            

    //         // check that there are 3 council members
    //         assert.equal(initialCouncilMemberCount, 3);
    //         // check that council has 250 mock FA2 tokens (transferred from mallory in test setup)
    //         assert.equal(councilMockFa2Ledger, 250000000);

    //         // Council member create transfer mock FA2 token operation
    //         await signerFactory(bob.sk)
    //         const receiverAddress        = oscar.pkh;
    //         const tokenContractAddress   = mockFa2TokenAddress.address;
    //         const tokenAmount            = 150000000;
    //         const tokenType              = "FA2";
    //         const tokenId                = 0;

    //         const councilTransferTezOperation = await councilInstance.methods.councilActionTransfer(
    //             receiverAddress, 
    //             tokenContractAddress,
    //             tokenAmount,
    //             tokenType,
    //             tokenId
    //             ).send();
    //         await councilTransferTezOperation.confirmation();

    //         // assert that new transfer action has been created with PENDING status
    //         const updatedCouncilStorage       = await councilInstance.storage();
    //         const councilActionTransfer       = await updatedCouncilStorage.councilActionsLedger.get(actionId);
        
    //         // check details of council action
    //         assert.equal(councilActionTransfer.actionType,       "transfer");

    //         assert.equal(councilActionTransfer.addressMap.get("receiverAddress"),  receiverAddress);
    //         assert.equal(councilActionTransfer.addressMap.get("tokenContractAddress"),  tokenContractAddress);
    //         assert.equal(councilActionTransfer.natMap.get("tokenAmount"),  tokenAmount);
    //         assert.equal(councilActionTransfer.natMap.get("tokenId"),  tokenId);
    //         assert.equal(councilActionTransfer.stringMap.get("tokenType"),  tokenType);
            
    //         assert.equal(councilActionTransfer.executed,         false);
    //         assert.equal(councilActionTransfer.status,           "PENDING");
    //         assert.equal(councilActionTransfer.signersCount,     1);
    //         assert.equal(councilActionTransfer.signers[0],       bob.pkh);

    //         // Council member 2 (alice) signs transfer action
    //         await signerFactory(alice.sk);
    //         const aliceSignsTransferOperation = await councilInstance.methods.signAction(actionId).send();
    //         await aliceSignsTransferOperation.confirmation();

    //         // Council member 3 (eve) signs transfer action
    //         await signerFactory(eve.sk);
    //         const eveSignsTransferOperation = await councilInstance.methods.signAction(actionId).send();
    //         await eveSignsTransferOperation.confirmation();

    //         // get updated storage
    //         const completedCouncilStorage           = await councilInstance.storage();
    //         const councilActionsTransferSigned      = await completedCouncilStorage.councilActionsLedger.get(actionId);

    //         const updatedMockFa2TokenStorage        = await mockFa2TokenInstance.storage();
    //         const updatedCouncilMockFa2Ledger       = await updatedMockFa2TokenStorage.ledger.get(councilContractAddress);
    //         const updatedOscarMockFa2Ledger         = await updatedMockFa2TokenStorage.ledger.get(oscar.pkh);            

    //         // check that council action is approved and has been executed
    //         assert.equal(councilActionsTransferSigned.signersCount,  3);
    //         assert.equal(councilActionsTransferSigned.executed,      true);
    //         assert.equal(councilActionsTransferSigned.status,        "EXECUTED");

    //         // check that ocase has received 150 mock FA12 Tokens from the council contract
    //         assert.equal(updatedCouncilMockFa2Ledger, 100000000);
    //         assert.equal(updatedOscarMockFa2Ledger, 150000000);

    //     } catch(e){
    //         console.log(e);
    //     } 

    // });    


    // it('council can transfer MVK tokens to a wallet address', async () => {
    //     try{        

    //         console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
    //         console.log("Test: Council can transfer MVK tokens to a wallet address") 
    //         console.log("---") // break

    //         // init constants
    //         const actionId                  = 8;
    //         const councilContractAddress    = councilAddress.address;
    //         // Council Members: Bob, Alice, Eve

    //         const councilStorage            = await councilInstance.storage();
    //         const initialCouncilMemberCount = councilStorage.councilMembers.length;

    //         const mvkTokenStorage           = await mvkTokenInstance.storage();
    //         const councilMvkLedger          = await mvkTokenStorage.ledger.get(councilContractAddress);
    //         const oscarMvkLedger            = await mvkTokenStorage.ledger.get(oscar.pkh);            

    //         // check that there are 3 council members
    //         assert.equal(initialCouncilMemberCount, 3);
    //         // check that council has 250 mvk tokens (transferred from mallory in test setup)
    //         assert.equal(councilMvkLedger, 250000000);

    //         // Council member create transfer mvk token operation
    //         await signerFactory(bob.sk)
    //         const receiverAddress        = oscar.pkh;
    //         const tokenContractAddress   = mvkTokenAddress.address;
    //         const tokenAmount            = 150000000;
    //         const tokenType              = "FA2";
    //         const tokenId                = 0;

    //         const councilTransferTezOperation = await councilInstance.methods.councilActionTransfer(
    //             receiverAddress, 
    //             tokenContractAddress,
    //             tokenAmount,
    //             tokenType,
    //             tokenId
    //             ).send();
    //         await councilTransferTezOperation.confirmation();

    //         // assert that new transfer action has been created with PENDING status
    //         const updatedCouncilStorage       = await councilInstance.storage();
    //         const councilActionTransfer       = await updatedCouncilStorage.councilActionsLedger.get(actionId);
        
    //         // check details of council action
    //         assert.equal(councilActionTransfer.actionType,       "transfer");

    //         assert.equal(councilActionTransfer.addressMap.get("receiverAddress"),  receiverAddress);
    //         assert.equal(councilActionTransfer.addressMap.get("tokenContractAddress"),  tokenContractAddress);
    //         assert.equal(councilActionTransfer.natMap.get("tokenAmount"),  tokenAmount);
    //         assert.equal(councilActionTransfer.natMap.get("tokenId"),  tokenId);
    //         assert.equal(councilActionTransfer.stringMap.get("tokenType"),  tokenType);

    //         assert.equal(councilActionTransfer.executed,         false);
    //         assert.equal(councilActionTransfer.status,           "PENDING");
    //         assert.equal(councilActionTransfer.signersCount,     1);
    //         assert.equal(councilActionTransfer.signers[0],       bob.pkh);

    //         // Council member 2 (alice) signs transfer action
    //         await signerFactory(alice.sk);
    //         const aliceSignsTransferOperation = await councilInstance.methods.signAction(actionId).send();
    //         await aliceSignsTransferOperation.confirmation();

    //         // Council member 3 (eve) signs transfer action
    //         await signerFactory(eve.sk);
    //         const eveSignsTransferOperation = await councilInstance.methods.signAction(actionId).send();
    //         await eveSignsTransferOperation.confirmation();

    //         // get updated storage
    //         const completedCouncilStorage           = await councilInstance.storage();
    //         const councilActionsTransferSigned      = await completedCouncilStorage.councilActionsLedger.get(actionId);

    //         const updatedMvkTokenStorage            = await mvkTokenInstance.storage();
    //         const updatedCouncilMvkLedger           = await updatedMvkTokenStorage.ledger.get(councilContractAddress);
    //         const updatedOscarMvkLedger             = await updatedMvkTokenStorage.ledger.get(oscar.pkh);            

    //         // check that council action is approved and has been executed
    //         assert.equal(councilActionsTransferSigned.signersCount,  3);
    //         assert.equal(councilActionsTransferSigned.executed,      true);
    //         assert.equal(councilActionsTransferSigned.status,        "EXECUTED");

    //         // check that ocase has received 150 mvk Tokens from the council contract
    //         assert.equal(updatedCouncilMvkLedger, 100000000);
    //         assert.equal(updatedOscarMvkLedger, 150000000);

    //     } catch(e){
    //         console.log(e);
    //     } 

    // });    

    // it('council can transfer tez to a wallet address', async () => {
    //     try{        

    //         console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
    //         console.log("Test: Council can transfer tez to a wallet address") 
    //         console.log("---") // break

    //         // init constants
    //         const actionId                  = 9;
    //         const councilContractAddress    = councilAddress.address;
    //         // Council Members: Bob, Alice, Eve

    //         const councilStorage            = await councilInstance.storage();
    //         const initialCouncilMemberCount = councilStorage.councilMembers.length;
    //         const councilTezBalance         = await utils.tezos.tz.getBalance(councilContractAddress);
    //         const oscarTezBalance           = await utils.tezos.tz.getBalance(oscar.pkh);

    //         // check that there are 3 council members
    //         assert.equal(initialCouncilMemberCount, 3);
    //         // check that council has 250 tez (transferred from mallory in test setup)
    //         assert.equal(councilTezBalance, 250000000);
    //         // check that oscar has initial 2000 tez balance
    //         // assert.equal(oscarTezBalance, 2000000000);
    //         // console.log("oscar tez balance: "+ oscarTezBalance);

    //         // Council member create transfer tez operation
    //         await signerFactory(bob.sk)
    //         const receiverAddress        = oscar.pkh;
    //         const tokenContractAddress   = zeroAddress;
    //         const tokenAmount            = 150000000;
    //         const tokenType              = "XTZ";
    //         const tokenId                = 0;

    //         const councilTransferTezOperation = await councilInstance.methods.councilActionTransfer(
    //             receiverAddress, 
    //             tokenContractAddress,
    //             tokenAmount,
    //             tokenType,
    //             tokenId
    //             ).send();
    //         await councilTransferTezOperation.confirmation();

    //         // assert that new transfer action has been created with PENDING status
    //         const updatedCouncilStorage       = await councilInstance.storage();
    //         const councilActionTransfer       = await updatedCouncilStorage.councilActionsLedger.get(actionId);
        
    //         // check details of council action
    //         assert.equal(councilActionTransfer.actionType,       "transfer");

    //         assert.equal(councilActionTransfer.addressMap.get("receiverAddress"),  receiverAddress);
    //         assert.equal(councilActionTransfer.addressMap.get("tokenContractAddress"),  tokenContractAddress);
    //         assert.equal(councilActionTransfer.natMap.get("tokenAmount"),  tokenAmount);
    //         assert.equal(councilActionTransfer.natMap.get("tokenId"),  tokenId);
    //         assert.equal(councilActionTransfer.stringMap.get("tokenType"),  tokenType);

    //         assert.equal(councilActionTransfer.executed,         false);
    //         assert.equal(councilActionTransfer.status,           "PENDING");
    //         assert.equal(councilActionTransfer.signersCount,     1);
    //         assert.equal(councilActionTransfer.signers[0],       bob.pkh);

    //         // Council member 2 (alice) signs transfer action
    //         await signerFactory(alice.sk);
    //         const aliceSignsTransferOperation = await councilInstance.methods.signAction(actionId).send();
    //         await aliceSignsTransferOperation.confirmation();

    //         // Council member 3 (eve) signs transfer action
    //         await signerFactory(eve.sk);
    //         const eveSignsTransferOperation = await councilInstance.methods.signAction(actionId).send();
    //         await eveSignsTransferOperation.confirmation();

    //         // get updated storage
    //         const completedCouncilStorage           = await councilInstance.storage();
    //         const councilActionsTransferSigned      = await completedCouncilStorage.councilActionsLedger.get(actionId);
    //         const updatedOscarTezBalance            = await utils.tezos.tz.getBalance(oscar.pkh);
    //         const updatedCouncilTezBalance          = await utils.tezos.tz.getBalance(councilContractAddress);

    //         // check that council action is approved and has been executed
    //         assert.equal(councilActionsTransferSigned.signersCount,  3);
    //         assert.equal(councilActionsTransferSigned.executed,      true);
    //         assert.equal(councilActionsTransferSigned.status,        "EXECUTED");

    //         // check that ocase has received 150 tez from the council contract
    //         assert.equal(updatedCouncilTezBalance, 100000000);
    //         // assert.equal(updatedOscarTezBalance, 2150000000);
    //         console.log("new oscar tez balance: "+ updatedOscarTezBalance);

    //         // Oscar transfers 150 XTZ back to the Council
    //         // await signerFactory(oscar.sk)
    //         // const oscarTransferTezToCouncilOperation = await utils.tezos.contract.transfer({ to: councilAddress.address, amount: 150});
    //         // await oscarTransferTezToCouncilOperation.confirmation();

    //     } catch(e){
    //         console.log(e);
    //     } 

    // });
});