import assert from "assert";
import { Utils } from "./helpers/Utils";
import { treasuryStorageType } from "../storage/storageTypes/treasuryStorageType";

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

import { bob, alice, eve, baker, mallory } from "../scripts/sandbox/accounts";
import { mockMetadata, mockSatelliteData } from "./helpers/mockSampleData"
import { 
    signerFactory, 
    getStorageMapValue,
    fa12Transfer,
    fa2Transfer,
    mistakenTransferFa2Token,
    updateWhitelistContracts,
    updateGeneralContracts,
    randomNumberFromInterval
} from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("Treasury Factory tests", async () => {
    
    var utils: Utils;
    let tezos

    let user 
    let userSk 

    let admin 
    let adminSk 

    let tokenId = 0

    let treasuryAddress 
    let treasuryFactoryAddress 
    let governanceAddress 
    let mvkTokenAddress 
    let mavrykFa12TokenAddress
    let mavrykFa2TokenAddress

    let treasuryInstance;
    let treasuryFactoryInstance;
    let mvkTokenInstance;
    let governanceInstance;
    let mavrykFa12TokenInstance;
    let mavrykFa2TokenInstance;

    let treasuryStorage;
    let treasuryFactoryStorage;
    let mvkTokenStorage;
    let governanceStorage;
    let mavrykFa12TokenStorage;
    let mavrykFa2TokenStorage;

    // operations
    let transferOperation

    // housekeeping operations
    let setAdminOperation
    let setGovernanceOperation
    let resetAdminOperation
    let updateWhitelistContractsOperation
    let updateGeneralContractsOperation
    let mistakenTransferOperation
    let pauseOperation
    let pauseAllOperation
    let unpauseOperation
    let unpauseAllOperation

    // contract map value
    let storageMap
    let contractMapKey
    let initialContractMapValue
    let updatedContractMapValue

    before("setup", async () => {

        utils = new Utils();
        await utils.init(bob.sk);
        tezos = utils.tezos
        
        admin   = bob.pkh 
        adminSk = bob.sk 

        treasuryAddress             = contractDeployments.treasury.address;
        treasuryFactoryAddress      = contractDeployments.treasuryFactory.address;
        governanceAddress           = contractDeployments.governance.address;
        mvkTokenAddress             = contractDeployments.mvkToken.address;
        mavrykFa12TokenAddress      = contractDeployments.mavrykFa12Token.address;
        mavrykFa2TokenAddress       = contractDeployments.mavrykFa2Token.address;

        treasuryInstance            = await utils.tezos.contract.at(treasuryAddress);
        treasuryFactoryInstance     = await utils.tezos.contract.at(treasuryFactoryAddress);
        mvkTokenInstance            = await utils.tezos.contract.at(mvkTokenAddress);
        governanceInstance          = await utils.tezos.contract.at(governanceAddress);
        mavrykFa12TokenInstance     = await utils.tezos.contract.at(mavrykFa12TokenAddress);
        mavrykFa2TokenInstance      = await utils.tezos.contract.at(mavrykFa2TokenAddress);

        treasuryStorage             = await treasuryInstance.storage();
        treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
        mvkTokenStorage             = await mvkTokenInstance.storage();
        governanceStorage           = await governanceInstance.storage();
        mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage();
        mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage();

        console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        
    });

    describe('Treasury Factory', function() {

        describe('%createTreasury', function() {

            beforeEach("Set signer to admin", async() => {
                await signerFactory(tezos, bob.sk)
            })

            it('Admin should not be able to call this entrypoint if it is paused', async () => {
                try{
                    // Initial Values
                    treasuryFactoryStorage         = await treasuryFactoryInstance.storage();
                    const isPausedStart            = treasuryFactoryStorage.breakGlassConfig.createTreasuryIsPaused

                    // Operation
                    var togglePauseOperation = await treasuryFactoryInstance.methods.togglePauseEntrypoint("createTreasury", true).send();
                    await togglePauseOperation.confirmation();
    
                    // Final values
                    treasuryFactoryStorage       = await treasuryFactoryInstance.storage();
                    const isPausedEnd       = treasuryFactoryStorage.breakGlassConfig.createTreasuryIsPaused
    
                    await chai.expect(treasuryFactoryInstance.methods.createTreasury(
                        baker.pkh,
                        "testTreasury",
                        false,
                        mockMetadata.treasury
                    ).send()).to.be.rejected;
    
                    // Reset admin
                    var togglePauseOperation = await treasuryFactoryInstance.methods.togglePauseEntrypoint("createTreasury", false).send();
                    await togglePauseOperation.confirmation();
    
                    // Assertions
                    assert.equal(isPausedStart, false);
                    assert.equal(isPausedEnd, true);

                }catch(e){
                    console.dir(e, {depth: 5});
                }
            })
        });

        describe('%trackTreasury', function() {

            it('Admin should not be able to call this entrypoint if it is paused', async () => {
                try{
                    // Initial Values
                    treasuryFactoryStorage          = await treasuryFactoryInstance.storage();
                    const treasuryToTrack           = treasuryAddress;
                    const isPausedStart             = treasuryFactoryStorage.breakGlassConfig.trackTreasuryIsPaused

                    // Operation
                    var togglePauseOperation = await treasuryFactoryInstance.methods.togglePauseEntrypoint("trackTreasury", true).send();
                    await togglePauseOperation.confirmation();
    
                    // Final values
                    treasuryFactoryStorage       = await treasuryFactoryInstance.storage();
                    const isPausedEnd       = treasuryFactoryStorage.breakGlassConfig.trackTreasuryIsPaused
    
                    await chai.expect(treasuryFactoryInstance.methods.trackTreasury(treasuryAddress).send()).to.be.rejected;
    
                    // Reset admin
                    var togglePauseOperation = await treasuryFactoryInstance.methods.togglePauseEntrypoint("trackTreasury", false).send();
                    await togglePauseOperation.confirmation();
    
                    // Assertions
                    assert.equal(isPausedStart, false);
                    assert.equal(isPausedEnd, true);
                    assert.equal(treasuryFactoryStorage.trackedTreasuries.includes(treasuryToTrack), false);
                }catch(e){
                    console.dir(e, {depth: 5});
                }
            })
        

            it('Admin should not be able to call this entrypoint if the provided treasury is already tracked', async () => {
                try{
                    // Initial Values
                    const treasuryToTrack   = treasuryAddress;

                    // Operation
                    await chai.expect(treasuryFactoryInstance.methods.trackTreasury(treasuryToTrack).send()).to.be.rejected;

                    // Assertions
                    treasuryFactoryStorage  = await treasuryFactoryInstance.storage();
                    assert.equal(treasuryFactoryStorage.trackedTreasuries.includes(treasuryToTrack), true);
                }catch(e){
                    console.dir(e, {depth: 5});
                }
            })
        })

        describe('%untrackTreasury', function() {

            it('Admin should not be able to call this entrypoint if it is paused', async () => {
                try{
                    // Initial Values
                    treasuryFactoryStorage          = await treasuryFactoryInstance.storage();
                    const treasuryToUntrack         = treasuryAddress;
                    const isPausedStart             = treasuryFactoryStorage.breakGlassConfig.untrackTreasuryIsPaused

                    // Operation
                    var togglePauseOperation = await treasuryFactoryInstance.methods.togglePauseEntrypoint("untrackTreasury", true).send();
                    await togglePauseOperation.confirmation();
    
                    // Final values
                    treasuryFactoryStorage       = await treasuryFactoryInstance.storage();
                    const isPausedEnd       = treasuryFactoryStorage.breakGlassConfig.untrackTreasuryIsPaused
    
                    await chai.expect(treasuryFactoryInstance.methods.untrackTreasury(treasuryToUntrack).send()).to.be.rejected;
    
                    // Reset admin
                    var togglePauseOperation = await treasuryFactoryInstance.methods.togglePauseEntrypoint("untrackTreasury", false).send();
                    await togglePauseOperation.confirmation();
    
                    // Assertions
                    assert.equal(isPausedStart, false);
                    assert.equal(isPausedEnd, true);
                    assert.equal(treasuryFactoryStorage.trackedTreasuries.includes(treasuryToUntrack), true);
                }catch(e){
                    console.dir(e, {depth: 5});
                }
            })
  
        })
    });



    describe("Housekeeping Entrypoints", async () => {

        beforeEach("Set signer to admin (bob)", async () => {
            treasuryFactoryStorage        = await treasuryFactoryInstance.storage();
            await signerFactory(tezos, adminSk);
        });

        it('%setAdmin                 - admin (bob) should be able to update the contract admin address', async () => {
            try{
                
                // Initial Values
                treasuryFactoryStorage   = await treasuryFactoryInstance.storage();
                const currentAdmin  = treasuryFactoryStorage.admin;

                // Operation
                setAdminOperation   = await treasuryFactoryInstance.methods.setAdmin(alice.pkh).send();
                await setAdminOperation.confirmation();

                // Final values
                treasuryFactoryStorage   = await treasuryFactoryInstance.storage();
                const newAdmin      = treasuryFactoryStorage.admin;

                // Assertions
                assert.notStrictEqual(newAdmin, currentAdmin);
                assert.strictEqual(newAdmin, alice.pkh);
                assert.strictEqual(currentAdmin, bob.pkh);

                // reset admin
                await signerFactory(tezos, alice.sk);
                resetAdminOperation = await treasuryFactoryInstance.methods.setAdmin(bob.pkh).send();
                await resetAdminOperation.confirmation();

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%setGovernance            - admin (bob) should be able to update the contract governance address', async () => {
            try{
                
                // Initial Values
                treasuryFactoryStorage       = await treasuryFactoryInstance.storage();
                const currentGovernance = treasuryFactoryStorage.governanceAddress;

                // Operation
                setGovernanceOperation = await treasuryFactoryInstance.methods.setGovernance(alice.pkh).send();
                await setGovernanceOperation.confirmation();

                // Final values
                treasuryFactoryStorage       = await treasuryFactoryInstance.storage();
                const updatedGovernance = treasuryFactoryStorage.governanceAddress;

                // reset governance
                setGovernanceOperation = await treasuryFactoryInstance.methods.setGovernance(contractDeployments.governance.address).send();
                await setGovernanceOperation.confirmation();

                // Assertions
                assert.notStrictEqual(updatedGovernance, currentGovernance);
                assert.strictEqual(updatedGovernance, alice.pkh);
                assert.strictEqual(currentGovernance, contractDeployments.governance.address);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%updateMetadata           - admin (bob) should be able to update the contract metadata', async () => {
            try{
                // Initial values
                const key   = ''
                const hash  = Buffer.from('tezos-storage:data', 'ascii').toString('hex')

                // Operation
                const updateOperation = await treasuryFactoryInstance.methods.updateMetadata(key, hash).send();
                await updateOperation.confirmation();

                // Final values
                treasuryFactoryStorage       = await treasuryFactoryInstance.storage();            

                const updatedData       = await treasuryFactoryStorage.metadata.get(key);
                assert.equal(hash, updatedData);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('%updateConfig             - admin (bob) should be able to update contract config', async () => {
            try{
                
                // Initial Values
                treasuryFactoryStorage             = await treasuryFactoryInstance.storage();
                const initialTreasuryNameMaxLength = treasuryFactoryStorage.config.treasuryNameMaxLength.toNumber();
                const testAmount                   = 100;

                // Operation
                const updateConfigOperation = await treasuryFactoryInstance.methods.updateConfig(testAmount, "configTreasuryNameMaxLength").send();
                await updateConfigOperation.confirmation();

                // Final values
                treasuryFactoryStorage           = await treasuryFactoryInstance.storage();
                const updatedConfigValue           = treasuryFactoryStorage.config.treasuryNameMaxLength.toNumber();

                // Assertions
                assert.equal(updatedConfigValue, testAmount);

                // reset config operation
                const resetConfigOperation = await treasuryFactoryInstance.methods.updateConfig(initialTreasuryNameMaxLength, "configTreasuryNameMaxLength").send();
                await resetConfigOperation.confirmation();

                // Final values
                treasuryFactoryStorage   = await treasuryFactoryInstance.storage();
                const resetConfigValue     = treasuryFactoryStorage.config.treasuryNameMaxLength.toNumber();

                assert.equal(resetConfigValue, initialTreasuryNameMaxLength);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%updateWhitelistContracts - admin (bob) should be able to add user (eve) to the Whitelisted Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "whitelistContracts";

                initialContractMapValue           = await getStorageMapValue(treasuryFactoryStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await updateWhitelistContracts(treasuryFactoryInstance, contractMapKey, eve.pkh, 'update');
                await updateWhitelistContractsOperation.confirmation()

                treasuryFactoryStorage = await treasuryFactoryInstance.storage()
                updatedContractMapValue = await getStorageMapValue(treasuryFactoryStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'Eve (key) should not be in the Whitelist Contracts map before adding her to it')
                assert.strictEqual(updatedContractMapValue, eve.pkh,  'Eve (key) should be in the Whitelist Contracts map after adding her to it')

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%updateWhitelistContracts - admin (bob) should be able to remove user (eve) from the Whitelisted Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "whitelistContracts";

                initialContractMapValue = await getStorageMapValue(treasuryFactoryStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await updateWhitelistContracts(treasuryFactoryInstance, contractMapKey, eve.pkh, 'remove');
                await updateWhitelistContractsOperation.confirmation()

                treasuryFactoryStorage = await treasuryFactoryInstance.storage()
                updatedContractMapValue = await getStorageMapValue(treasuryFactoryStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, eve.pkh, 'Eve (key) should be in the Whitelist Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, undefined, 'Eve (key) should not be in the Whitelist Contracts map after adding her to it');

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%updateGeneralContracts   - admin (bob) should be able to add user (eve) to the General Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "generalContracts";

                initialContractMapValue = await getStorageMapValue(treasuryFactoryStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await updateGeneralContracts(treasuryFactoryInstance, contractMapKey, eve.pkh, 'update');
                await updateGeneralContractsOperation.confirmation()

                treasuryFactoryStorage = await treasuryFactoryInstance.storage()
                updatedContractMapValue = await getStorageMapValue(treasuryFactoryStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'eve (key) should not be in the General Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, eve.pkh, 'eve (key) should be in the General Contracts map after adding her to it');

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%updateGeneralContracts   - admin (bob) should be able to remove user (eve) from the General Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "generalContracts";

                initialContractMapValue = await getStorageMapValue(treasuryFactoryStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await updateGeneralContracts(treasuryFactoryInstance, contractMapKey, eve.pkh, 'remove');
                await updateGeneralContractsOperation.confirmation()

                treasuryFactoryStorage = await treasuryFactoryInstance.storage()
                updatedContractMapValue = await getStorageMapValue(treasuryFactoryStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, eve.pkh, 'eve (key) should be in the General Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, undefined, 'eve (key) should not be in the General Contracts map after adding her to it');

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%mistakenTransfer         - admin (bob) should be able to call this entrypoint for mock FA2 tokens', async () => {
            try {

                // Initial values
                const tokenAmount = 10;
                user              = mallory.pkh;
                userSk            = mallory.sk;

                // Mistaken Operation - user (mallory) send 10 MavrykFa2Tokens to Contract
                await signerFactory(tezos, userSk);
                transferOperation = await fa2Transfer(mavrykFa2TokenInstance, user, contractDeployments.treasuryFactory.address, tokenId, tokenAmount);
                await transferOperation.confirmation();
                
                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage();
                const initialUserBalance    = (await mavrykFa2TokenStorage.ledger.get(user)).toNumber()

                await signerFactory(tezos, bob.sk);
                mistakenTransferOperation = await mistakenTransferFa2Token(treasuryFactoryInstance, user, contractDeployments.mavrykFa2Token.address, tokenId, tokenAmount).send();
                await mistakenTransferOperation.confirmation();

                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage();
                const updatedUserBalance    = (await mavrykFa2TokenStorage.ledger.get(user)).toNumber();

                // increase in updated balance
                assert.equal(updatedUserBalance, initialUserBalance + tokenAmount);

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%pauseAll                 - admin (bob) should be able to pause all entrypoints in the contract', async () => {
            try{
                // Initial Values
                treasuryFactoryStorage       = await treasuryFactoryInstance.storage();
                for (let [key, value] of Object.entries(treasuryFactoryStorage.breakGlassConfig)){
                    assert.equal(value, false);
                }

                // pause all operation
                pauseAllOperation = await treasuryFactoryInstance.methods.pauseAll().send();
                await pauseAllOperation.confirmation();

                // Final values
                treasuryFactoryStorage       = await treasuryFactoryInstance.storage();
                for (let [key, value] of Object.entries(treasuryFactoryStorage.breakGlassConfig)){
                    assert.equal(value, true);
                }

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('%unpauseAll               - admin (bob) should be able to unpause all entrypoints in the contract', async () => {
            try{

                // Initial Values
                treasuryFactoryStorage = await treasuryFactoryInstance.storage();
                for (let [key, value] of Object.entries(treasuryFactoryStorage.breakGlassConfig)){
                    assert.equal(value, true);
                }

                // unpause all operation
                unpauseAllOperation = await treasuryFactoryInstance.methods.unpauseAll().send();
                await unpauseAllOperation.confirmation();

                // Final values
                treasuryFactoryStorage = await treasuryFactoryInstance.storage();
                for (let [key, value] of Object.entries(treasuryFactoryStorage.breakGlassConfig)){
                    assert.equal(value, false);
                }

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it("%togglePauseEntrypoint    - admin (bob) should be able to call this entrypoint", async() => {
            try{
                
                // pause operations

                pauseOperation = await treasuryFactoryInstance.methods.togglePauseEntrypoint("createTreasury", true).send();
                await pauseOperation.confirmation();
                
                pauseOperation = await treasuryFactoryInstance.methods.togglePauseEntrypoint("untrackTreasury", true).send();
                await pauseOperation.confirmation();

                pauseOperation = await treasuryFactoryInstance.methods.togglePauseEntrypoint("trackTreasury", true).send(); 
                await pauseOperation.confirmation();

                // update storage
                treasuryFactoryStorage              = await treasuryFactoryInstance.storage();

                // check that all entrypoints are paused
                for (let [key, value] of Object.entries(treasuryFactoryStorage.breakGlassConfig)){
                    assert.equal(value, true);
                }

                // unpause operations

                unpauseOperation = await treasuryFactoryInstance.methods.togglePauseEntrypoint("createTreasury", false).send();
                await unpauseOperation.confirmation();
                
                unpauseOperation = await treasuryFactoryInstance.methods.togglePauseEntrypoint("untrackTreasury", false).send();
                await unpauseOperation.confirmation();

                unpauseOperation = await treasuryFactoryInstance.methods.togglePauseEntrypoint("trackTreasury", false).send();
                await unpauseOperation.confirmation();

                // update storage
                treasuryFactoryStorage              = await treasuryFactoryInstance.storage();

                // check that all entrypoints are unpaused
                for (let [key, value] of Object.entries(treasuryFactoryStorage.breakGlassConfig)){
                    assert.equal(value, false);
                }

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })


        it('%createTreasury           - admin (bob) should be able to create a new tresaury', async () => {
            try {

                const initialTrackedTreasuries       = treasuryFactoryStorage.trackedTreasuries;
                const initialTrackedTreasuriesCount  = treasuryFactoryStorage.trackedTreasuries.length.toNumber();

                const randomNumber              = randomNumberFromInterval(1, 100000);
                const randomTreasuryName        = "testCreateTreasury" + randomNumber;

                // Operation
                const createTreasuryOperation = await treasuryFactoryInstance.methods.createTreasury(
                    baker.pkh,
                    randomTreasuryName,
                    true,
                    mockMetadata.treasury
                ).send();
                await createTreasuryOperation.confirmation();

                treasuryFactoryStorage                      = await treasuryFactoryInstance.storage();
                const treasuryAddress                       = treasuryFactoryStorage.trackedTreasuries[0];
                const treasuryInstance                      = await utils.tezos.contract.at(treasuryAddress);
                const treasuryStorage: treasuryStorageType  = await treasuryInstance.storage();
                
                const updatedTrackedTreasuries              = treasuryFactoryStorage.trackedTreasuries;
                const updatedTrackedTreasuriesCount         = treasuryFactoryStorage.trackedTreasuries.length.toNumber();

                assert.strictEqual(treasuryStorage.admin, admin);
                assert.strictEqual(treasuryStorage.mvkTokenAddress, mvkTokenAddress);
                
                assert.notEqual(initialTrackedTreasuries.includes(treasuryAddress), false);
                assert.equal(updatedTrackedTreasuries.includes(treasuryAddress), true);
                assert.equal(updatedTrackedTreasuriesCount, initialTrackedTreasuriesCount + 1);
                
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });


        it('%trackTreasury            - admin (bob) should be able to track a treasury', async () => {
            try {

                // Initial Values
                const treasuryToTrack   = treasuryAddress;

                // Operation
                const operation = await treasuryFactoryInstance.methods.trackTreasury(treasuryToTrack).send();
                await operation.confirmation();

                // Assertions
                treasuryFactoryStorage  = await treasuryFactoryInstance.storage();
                assert.equal(treasuryFactoryStorage.trackedTreasuries.includes(treasuryToTrack), true);

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('%untrackTreasury          - admin (bob) should be able to untrack a treasury', async () => {
            try {

                // Initial Values
                const treasuryToUntrack   = treasuryAddress;

                // Operation
                const operation = await treasuryFactoryInstance.methods.untrackTreasury(treasuryToUntrack).send();
                await operation.confirmation();

                // Assertions
                treasuryFactoryStorage  = await treasuryFactoryInstance.storage();
                assert.equal(treasuryFactoryStorage.trackedTreasuries.includes(treasuryToUntrack), false);

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('%untrackTreasury          - admin (bob) should not be able to untrack a treasury if it has already been untracked', async () => {
            try{
                
                // Initial Values
                const treasuryToUntrack   = treasuryAddress;

                // Operation
                await chai.expect(treasuryFactoryInstance.methods.untrackTreasury(treasuryToUntrack).send()).to.be.rejected;

                // Assertions
                treasuryFactoryStorage  = await treasuryFactoryInstance.storage();
                assert.equal(treasuryFactoryStorage.trackedTreasuries.includes(treasuryToUntrack), false);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        })

    });

    describe('Access Control Checks', function () {

        beforeEach("Set signer to non-admin (mallory)", async () => {
            treasuryFactoryStorage = await treasuryFactoryInstance.storage();
            await signerFactory(tezos, mallory.sk);
        });

        it('%setAdmin                 - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                treasuryFactoryStorage   = await treasuryFactoryInstance.storage();
                const currentAdmin         = treasuryFactoryStorage.admin;

                // Operation
                setAdminOperation = await treasuryFactoryInstance.methods.setAdmin(mallory.pkh);
                await chai.expect(setAdminOperation.send()).to.be.rejected;

                // Final values
                treasuryFactoryStorage   = await treasuryFactoryInstance.storage();
                const newAdmin             = treasuryFactoryStorage.admin;

                // Assertions
                assert.strictEqual(newAdmin, currentAdmin);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%setGovernance            - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                treasuryFactoryStorage = await treasuryFactoryInstance.storage();
                const currentGovernance  = treasuryFactoryStorage.governanceAddress;

                // Operation
                setGovernanceOperation = await treasuryFactoryInstance.methods.setGovernance(mallory.pkh);
                await chai.expect(setGovernanceOperation.send()).to.be.rejected;

                // Final values
                treasuryFactoryStorage = await treasuryFactoryInstance.storage();
                const updatedGovernance  = treasuryFactoryStorage.governanceAddress;

                // Assertions
                assert.strictEqual(updatedGovernance, currentGovernance);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%updateMetadata           - non-admin (mallory) should not be able to update the contract metadata', async () => {
            try{
                // Initial values
                const key   = ''
                const hash  = Buffer.from('tezos-storage:data fail', 'ascii').toString('hex')

                treasuryFactoryStorage = await treasuryFactoryInstance.storage();   
                const initialMetadata    = await treasuryFactoryStorage.metadata.get(key);

                // Operation
                const updateOperation = await treasuryFactoryInstance.methods.updateMetadata(key, hash);
                await chai.expect(updateOperation.send()).to.be.rejected;

                // Final values
                treasuryFactoryStorage = await treasuryFactoryInstance.storage();            
                const updatedData        = await treasuryFactoryStorage.metadata.get(key);

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
                treasuryFactoryStorage            = await treasuryFactoryInstance.storage();
                const initialConfigValue            = treasuryFactoryStorage.config.treasuryNameMaxLength;
                const testAmount                    = 123;

                // Operation
                const updateConfigOperation = await treasuryFactoryInstance.methods.updateConfig(testAmount, "configTreasuryNameMaxLength");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                // Final values
                treasuryFactoryStorage            = await treasuryFactoryInstance.storage();
                const updatedConfigValue            = treasuryFactoryStorage.config.treasuryNameMaxLength;

                // check that there is no change in config values
                assert.equal(updatedConfigValue.toNumber(), initialConfigValue.toNumber());
                assert.notEqual(updatedConfigValue.toNumber(), testAmount);
                
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%updateWhitelistContracts - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // init values
                contractMapKey  = "mallory";
                storageMap      = "whitelistContracts";

                initialContractMapValue = await getStorageMapValue(treasuryFactoryStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await treasuryFactoryInstance.methods.updateWhitelistContracts(contractMapKey, alice.pkh, 'update')
                await chai.expect(updateWhitelistContractsOperation.send()).to.be.rejected;

                treasuryFactoryStorage = await treasuryFactoryInstance.storage()
                updatedContractMapValue  = await getStorageMapValue(treasuryFactoryStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'mallory (key) should not be in the Whitelist Contracts map');

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%updateGeneralContracts   - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // init values
                contractMapKey  = "mallory";
                storageMap      = "generalContracts";

                initialContractMapValue = await getStorageMapValue(treasuryFactoryStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await treasuryFactoryInstance.methods.updateGeneralContracts(contractMapKey, alice.pkh, 'update')
                await chai.expect(updateGeneralContractsOperation.send()).to.be.rejected;

                treasuryFactoryStorage = await treasuryFactoryInstance.storage()
                updatedContractMapValue  = await getStorageMapValue(treasuryFactoryStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'mallory (key) should not be in the General Contracts map');

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%mistakenTransfer         - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // Initial values
                const tokenAmount = 10;

                // Mistaken Operation - send 10 MavrykFa2Tokens to Contract
                transferOperation = await fa2Transfer(mavrykFa2TokenInstance, mallory.pkh, contractDeployments.treasuryFactory.address, tokenId, tokenAmount);
                await transferOperation.confirmation();

                // mistaken transfer operation
                mistakenTransferOperation = await mistakenTransferFa2Token(treasuryFactoryInstance, mallory.pkh, contractDeployments.mavrykFa2Token.address, tokenId, tokenAmount);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%pauseAll                 - non-admin (mallory) should not be able to call this entrypoint", async() => {
            try{

                pauseAllOperation = treasuryFactoryInstance.methods.pauseAll(); 
                await chai.expect(pauseAllOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%unpauseAll               - non-admin (mallory) should not be able to call this entrypoint", async() => {
            try{

                unpauseAllOperation = treasuryFactoryInstance.methods.unpauseAll(); 
                await chai.expect(unpauseAllOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%togglePauseEntrypoint    - non-admin (mallory) should not be able to call this entrypoint", async() => {
            try{
                
                // pause operations

                pauseOperation = treasuryFactoryInstance.methods.togglePauseEntrypoint("createTreasury", true); 
                await chai.expect(pauseOperation.send()).to.be.rejected;
                
                pauseOperation = treasuryFactoryInstance.methods.togglePauseEntrypoint("untrackTreasury", true); 
                await chai.expect(pauseOperation.send()).to.be.rejected;

                pauseOperation = treasuryFactoryInstance.methods.togglePauseEntrypoint("trackTreasury", true); 
                await chai.expect(pauseOperation.send()).to.be.rejected;

                // unpause operations

                unpauseOperation = treasuryFactoryInstance.methods.togglePauseEntrypoint("createTreasury", false); 
                await chai.expect(unpauseOperation.send()).to.be.rejected;
                
                unpauseOperation = treasuryFactoryInstance.methods.togglePauseEntrypoint("untrackTreasury", false); 
                await chai.expect(unpauseOperation.send()).to.be.rejected;

                unpauseOperation = treasuryFactoryInstance.methods.togglePauseEntrypoint("trackTreasury", false); 
                await chai.expect(unpauseOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })


        it('%createTreasury           - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // Operation
                const createTreasuryOperation = treasuryFactoryInstance.methods.createTreasury(
                    baker.pkh,
                    "testTreasury",
                    false,
                    mockMetadata.treasury
                );
                await chai.expect(createTreasuryOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });


        it('%trackTreasury            - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                const treasuryToTrack   = treasuryAddress;

                const trackTreasuryOperation = treasuryFactoryInstance.methods.trackTreasury(treasuryToTrack);
                await chai.expect(trackTreasuryOperation.send()).to.be.rejected;

                // Assertions
                treasuryFactoryStorage  = await treasuryFactoryInstance.storage();
                assert.equal(treasuryFactoryStorage.trackedTreasuries.includes(treasuryToTrack), false);

            } catch(e) {
                console.dir(e, {depth: 5})
            }     
        });

        it('%untrackTreasury          - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                const treasuryToUntrack   = treasuryAddress;

                const untrackTreasuryOperation = treasuryFactoryInstance.methods.untrackTreasury(treasuryToUntrack)
                await chai.expect(untrackTreasuryOperation.send()).to.be.rejected;

                // Assertions
                treasuryFactoryStorage  = await treasuryFactoryInstance.storage();
                assert.equal(treasuryFactoryStorage.trackedTreasuries.includes(treasuryToUntrack), true);

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it("%setLambda                - non-admin (mallory) should not be able to call this entrypoint", async() => {
            try{

                // random lambda for testing
                const randomLambdaName  = "randomLambdaName";
                const randomLambdaBytes = "050200000cba0743096500000112075e09650000005a036e036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a0362036203620362036200000000036203620760036803690000000009650000000a0362036203620362036e00000000075e09650000006c09650000000a0362036203620362036200000000036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a036203620362036203620000000003620362076003680369000000000362075e07650765036203620362036c075e076507650368036e0362036e036200000000070702000001770743075e076507650368036e0362036e020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c03200342020000010e037a034c037a07430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700002034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f02000000090743036200810303270200000000072f020000000907430362009c0203270200000000070702000000600743036200808080809d8fc0d0bff2f1b26703420200000047037a034c037a0321052900080570000205290015034b031105710002031605700002033a0322072f020000001307430368010000000844495620627920300327020000000003160707020000001a037a037a03190332072c0200000002032002000000020327034f0707020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c032000808080809d8fc0d0bff2f1b2670342020000092d037a057a000505700005037a034c07430362008f03052100020529000f0529000307430359030a034c03190325072c0200000002032702000000020320053d036d05700002072e02000008a4072e020000007c057000030570000405700005057000060570000705200005072e020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000081c072e0200000044057000030570000405700005057000060570000705200005072e0200000010072e02000000020320020000000203200200000010072e020000000203200200000002032002000007cc072e0200000028057000030570000405700005057000060570000705200005072e02000000020320020000000203200200000798072e0200000774034c032003480521000305210003034c052900050316034c03190328072c020000000002000000090743036200880303270570000205210002034c0321052100030521000205290011034c0329072f020000002005290015074303620000074303620000074303620000074303620000054200050200000004034c03200743036200000521000203160319032a072c020000021c052100020521000407430362008e02057000020529000907430368010000000a64656c65676174696f6e034203420521000b034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f0200000009074303620081030327020000001a072f02000000060743035903030200000008032007430359030a074303620000034c072c020000007303200521000205210004034205210007034c0326052100030521000205290008034205700007034c03260521000205290005034c05290007034b0311052100030316033a0521000b034c0322072f02000000130743036801000000084449562062792030032702000000000316034c0316031202000000060570000603200521000305210003034205210008034c0326052100030521000205700004052900030312055000030571000205210003052100030570000405290005031205500005057100020521000305700002052100030570000403160312031205500001034c05210003034c0570000305290013034b031105500013034c02000000060570000503200521000205290015055000080521000205700002052900110570000205700003034c0346034c0350055000110571000205210003052900070743036200000790010000000c746f74616c5f737570706c790362072f020000000907430362008a01032702000000000521000405290007074303620000037703420790010000000b6765745f62616c616e63650362072f02000000090743036200890103270200000000034c052100090743036200a40105210004033a033a0322072f0200000013074303680100000008444956206279203003270200000000031605210009074303620002033a0312052100090521000a07430362008803033a033a0322072f020000001307430368010000000844495620627920300327020000000003160743036200a401034c0322072f0200000013074303680100000008444956206279203003270200000000031605210004033a05210009052100020322072f0200000013074303680100000008444956206279203003270200000000031605210005034b0311052100060570000a052100040322072f0200000013074303680100000008444956206279203003270200000000031605700007052900130312055000130571000507430362008c0305210004052100070342034205210009034c0326032005700005057000030342052100050570000305700002037a034c0570000305700002034b0311074303620000052100020319032a072c020000003b05210002034c057000030322072f02000000130743036801000000084449562062792030032702000000000316057000020529001503120550001502000000080570000205200002057100030521000405210003034c05290011034c0329072f0200000009074303620089030327020000000003210521000507430362008b03057000020316057000020342034205700007034c03260320032105700004057000020316034b031105500001052100040529000707430362000005700003034205210004037705700002037a057000040655055f0765046e000000062566726f6d5f065f096500000026046e0000000425746f5f04620000000925746f6b656e5f696404620000000725616d6f756e7400000000000000042574787300000009257472616e73666572072f0200000008074303620027032702000000000743036a0000053d0765036e055f096500000006036e0362036200000000053d096500000006036e036203620000000005700004057000050570000705420003031b057000040342031b034d0743036200000521000303160319032a072c02000000440521000405210003034205700005034c032605210003052100020570000403160312055000010571000205210005034c0570000505290013034b031105500013057100030200000006057000040320034c052100040529001505500008034c0521000405700004052900110570000305210005034c0346034c03500550001105710002052100030570000207430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700004034c03260655036e0000000e256f6e5374616b654368616e6765072f02000000090743036200b702032702000000000743036a000005700002034d053d036d034c031b034c031b02000000180570000305700004057000050570000605700007052000060200000036057000030570000405700005057000060570000705200005072e0200000010072e0200000002032002000000020320020000000203200342";

                const setLambdaOperation = treasuryFactoryInstance.methods.setLambda(randomLambdaName, randomLambdaBytes); 
                await chai.expect(setLambdaOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%setProductLambda         - non-admin (mallory) should not be able to call this entrypoint", async() => {
            try{

                // random lambda for testing
                const randomLambdaName  = "randomLambdaName";
                const randomLambdaBytes = "050200000cba0743096500000112075e09650000005a036e036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a0362036203620362036200000000036203620760036803690000000009650000000a0362036203620362036e00000000075e09650000006c09650000000a0362036203620362036200000000036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a036203620362036203620000000003620362076003680369000000000362075e07650765036203620362036c075e076507650368036e0362036e036200000000070702000001770743075e076507650368036e0362036e020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c03200342020000010e037a034c037a07430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700002034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f02000000090743036200810303270200000000072f020000000907430362009c0203270200000000070702000000600743036200808080809d8fc0d0bff2f1b26703420200000047037a034c037a0321052900080570000205290015034b031105710002031605700002033a0322072f020000001307430368010000000844495620627920300327020000000003160707020000001a037a037a03190332072c0200000002032002000000020327034f0707020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c032000808080809d8fc0d0bff2f1b2670342020000092d037a057a000505700005037a034c07430362008f03052100020529000f0529000307430359030a034c03190325072c0200000002032702000000020320053d036d05700002072e02000008a4072e020000007c057000030570000405700005057000060570000705200005072e020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000081c072e0200000044057000030570000405700005057000060570000705200005072e0200000010072e02000000020320020000000203200200000010072e020000000203200200000002032002000007cc072e0200000028057000030570000405700005057000060570000705200005072e02000000020320020000000203200200000798072e0200000774034c032003480521000305210003034c052900050316034c03190328072c020000000002000000090743036200880303270570000205210002034c0321052100030521000205290011034c0329072f020000002005290015074303620000074303620000074303620000074303620000054200050200000004034c03200743036200000521000203160319032a072c020000021c052100020521000407430362008e02057000020529000907430368010000000a64656c65676174696f6e034203420521000b034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f0200000009074303620081030327020000001a072f02000000060743035903030200000008032007430359030a074303620000034c072c020000007303200521000205210004034205210007034c0326052100030521000205290008034205700007034c03260521000205290005034c05290007034b0311052100030316033a0521000b034c0322072f02000000130743036801000000084449562062792030032702000000000316034c0316031202000000060570000603200521000305210003034205210008034c0326052100030521000205700004052900030312055000030571000205210003052100030570000405290005031205500005057100020521000305700002052100030570000403160312031205500001034c05210003034c0570000305290013034b031105500013034c02000000060570000503200521000205290015055000080521000205700002052900110570000205700003034c0346034c0350055000110571000205210003052900070743036200000790010000000c746f74616c5f737570706c790362072f020000000907430362008a01032702000000000521000405290007074303620000037703420790010000000b6765745f62616c616e63650362072f02000000090743036200890103270200000000034c052100090743036200a40105210004033a033a0322072f0200000013074303680100000008444956206279203003270200000000031605210009074303620002033a0312052100090521000a07430362008803033a033a0322072f020000001307430368010000000844495620627920300327020000000003160743036200a401034c0322072f0200000013074303680100000008444956206279203003270200000000031605210004033a05210009052100020322072f0200000013074303680100000008444956206279203003270200000000031605210005034b0311052100060570000a052100040322072f0200000013074303680100000008444956206279203003270200000000031605700007052900130312055000130571000507430362008c0305210004052100070342034205210009034c0326032005700005057000030342052100050570000305700002037a034c0570000305700002034b0311074303620000052100020319032a072c020000003b05210002034c057000030322072f02000000130743036801000000084449562062792030032702000000000316057000020529001503120550001502000000080570000205200002057100030521000405210003034c05290011034c0329072f0200000009074303620089030327020000000003210521000507430362008b03057000020316057000020342034205700007034c03260320032105700004057000020316034b031105500001052100040529000707430362000005700003034205210004037705700002037a057000040655055f0765046e000000062566726f6d5f065f096500000026046e0000000425746f5f04620000000925746f6b656e5f696404620000000725616d6f756e7400000000000000042574787300000009257472616e73666572072f0200000008074303620027032702000000000743036a0000053d0765036e055f096500000006036e0362036200000000053d096500000006036e036203620000000005700004057000050570000705420003031b057000040342031b034d0743036200000521000303160319032a072c02000000440521000405210003034205700005034c032605210003052100020570000403160312055000010571000205210005034c0570000505290013034b031105500013057100030200000006057000040320034c052100040529001505500008034c0521000405700004052900110570000305210005034c0346034c03500550001105710002052100030570000207430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700004034c03260655036e0000000e256f6e5374616b654368616e6765072f02000000090743036200b702032702000000000743036a000005700002034d053d036d034c031b034c031b02000000180570000305700004057000050570000605700007052000060200000036057000030570000405700005057000060570000705200005072e0200000010072e0200000002032002000000020320020000000203200342";

                const setProductLambdaOperation = treasuryFactoryInstance.methods.setProductLambda(randomLambdaName, randomLambdaBytes); 
                await chai.expect(setProductLambdaOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

    })

});