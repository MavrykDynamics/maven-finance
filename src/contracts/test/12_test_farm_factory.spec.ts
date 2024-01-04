import { farmStorageType } from "../storage/storageTypes/farmStorageType";
import { MVN, Utils } from "./helpers/Utils";

const chai = require("chai");
const assert = require("chai").assert;
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

import { bob, eve } from "../scripts/sandbox/accounts";
import { mockMetadata } from "./helpers/mockSampleData"
import { 
    fa2Transfer,
    getStorageMapValue,
    mistakenTransferFa2Token,
    signerFactory,
    updateGeneralContracts,
    updateWhitelistContracts
} from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("FarmFactory", async () => {
    
    var utils: Utils;
    let tezos;

    let userOne;
    let userOneSk;

    let admin;
    let adminSk;

    let tokenId = 0; 

    let mavenFa2TokenAddress;
    let mavenFa2TokenInstance;
    let mavenFa2TokenStorage;

    let farmInstance;
    let farmStorage;

    let farmAddress
    let farmFactoryAddress
    let mvnTokenAddress
    let lpTokenAddress 
    let doormanAddress

    let farmFactoryInstance;
    let farmFactoryStorage;

    let lpTokenInstance;
    let lpTokenStorage;

    let doormanInstance;
    let doormanStorage;

    let mvnTokenInstance;
    let mvnTokenStorage;

    // housekeeping operations
    let setAdminOperation;
    let setGovernanceOperation;
    let resetAdminOperation;
    let updateWhitelistContractsOperation;
    let updateGeneralContractsOperation;
    let mistakenTransferOperation;
    let pauseOperation;
    let pauseAllOperation;
    let unpauseOperation;
    let unpauseAllOperation;
    let transferOperation;

    // contract map value
    let storageMap;
    let contractMapKey;
    let initialContractMapValue;
    let updatedContractMapValue;

    before("setup", async () => {

        utils = new Utils();
        await utils.init(bob.sk);
        tezos = utils.tezos

        admin   = bob.pkh
        adminSk = bob.sk

        userOne    = eve.pkh
        userOneSk  = eve.sk

        farmAddress             = contractDeployments.farm.address;
        farmFactoryAddress      = contractDeployments.farmFactory.address;
        mvnTokenAddress         = contractDeployments.mvnToken.address;
        lpTokenAddress          = contractDeployments.mavenFa12Token.address;
        doormanAddress          = contractDeployments.doorman.address;
        
        farmFactoryInstance     = await utils.tezos.contract.at(farmFactoryAddress);
        lpTokenInstance         = await utils.tezos.contract.at(lpTokenAddress);
        doormanInstance         = await utils.tezos.contract.at(doormanAddress);
        mvnTokenInstance        = await utils.tezos.contract.at(mvnTokenAddress);

        // for mistaken transfers
        mavenFa2TokenAddress   = contractDeployments.mavenFa2Token.address 
        mavenFa2TokenInstance  = await utils.tezos.contract.at(mavenFa2TokenAddress);
        mavenFa2TokenStorage   = await mavenFa2TokenInstance.storage();

        farmFactoryStorage      = await farmFactoryInstance.storage();
        doormanStorage          = await doormanInstance.storage();
        lpTokenStorage          = await lpTokenInstance.storage();
        mvnTokenStorage         = await mvnTokenInstance.storage();

        // reset the farm tracking
        if(farmFactoryStorage.trackedFarms.includes(farmAddress)){
            const untrackOperation  = await farmFactoryInstance.methods.untrackFarm(farmAddress).send();
            await untrackOperation.confirmation()
        }
        
    });

    beforeEach("storage", async () => {
        farmFactoryStorage = await farmFactoryInstance.storage();
        lpTokenStorage    = await lpTokenInstance.storage();
        doormanStorage    = await doormanInstance.storage();
        mvnTokenStorage    = await mvnTokenInstance.storage();
        await signerFactory(tezos, bob.sk)
    })

    describe("Housekeeping Entrypoints", async () => {

        beforeEach("Set signer to admin (bob)", async () => {
            farmFactoryStorage        = await farmFactoryInstance.storage();
            await signerFactory(tezos, adminSk);
        });

        it('%setAdmin                 - admin (bob) should be able to update the contract admin address', async () => {
            try{
                
                // Initial Values
                farmFactoryStorage     = await farmFactoryInstance.storage();
                const currentAdmin = farmFactoryStorage.admin;
                assert.strictEqual(currentAdmin, admin);

                // Operation
                setAdminOperation = await farmFactoryInstance.methods.setAdmin(userOne).send();
                await setAdminOperation.confirmation();

                // Final values
                farmFactoryStorage   = await farmFactoryInstance.storage();
                const newAdmin = farmFactoryStorage.admin;

                // Assertions
                assert.notStrictEqual(newAdmin, currentAdmin);
                assert.strictEqual(newAdmin, userOne);
                
                // reset admin
                await signerFactory(tezos, userOneSk);
                resetAdminOperation = await farmFactoryInstance.methods.setAdmin(admin).send();
                await resetAdminOperation.confirmation();

            } catch(e){
                console.log(e);
            }
        });

        it('%setGovernance            - admin (bob) should be able to update the contract governance address', async () => {
            try{
                
                // Initial Values
                farmFactoryStorage       = await farmFactoryInstance.storage();
                const currentGovernance = farmFactoryStorage.governanceAddress;

                // Operation
                setGovernanceOperation = await farmFactoryInstance.methods.setGovernance(userOne).send();
                await setGovernanceOperation.confirmation();

                // Final values
                farmFactoryStorage   = await farmFactoryInstance.storage();
                const updatedGovernance = farmFactoryStorage.governanceAddress;

                // reset governance
                setGovernanceOperation = await farmFactoryInstance.methods.setGovernance(contractDeployments.governance.address).send();
                await setGovernanceOperation.confirmation();

                // Assertions
                assert.notStrictEqual(updatedGovernance, currentGovernance);
                assert.strictEqual(updatedGovernance, userOne);
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
                const updateOperation = await farmFactoryInstance.methods.updateMetadata(key, hash).send();
                await updateOperation.confirmation();

                // Final values
                farmFactoryStorage          = await farmFactoryInstance.storage();            

                const updatedData       = await farmFactoryStorage.metadata.get(key);
                assert.equal(hash, updatedData);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('%updateConfig             - admin (bob) should be able to update the farm name max length', async () => {
            try{

                // Initial values
                const currentConfigVariable     = farmFactoryStorage.config.farmNameMaxLength;
                const newConfigVariable         = currentConfigVariable == 10 ? 20 : 10;

                // Operation
                const operation = await farmFactoryInstance.methods.updateConfig(newConfigVariable, "configFarmNameMaxLength").send();
                await operation.confirmation()

                // Final values
                farmFactoryStorage          = await farmFactoryInstance.storage();
                const updatedConfigVariable     = farmFactoryStorage.config.farmNameMaxLength;

                // Assertions
                assert.notEqual(currentConfigVariable, newConfigVariable);
                assert.equal(updatedConfigVariable, newConfigVariable);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('%updateWhitelistContracts - admin (bob) should be able to add userOne (eve) to the Whitelisted Contracts map', async () => {
            try {

                // init values
                contractMapKey  = eve.pkh;
                storageMap      = "whitelistContracts";

                initialContractMapValue           = await getStorageMapValue(farmFactoryStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await updateWhitelistContracts(farmFactoryInstance, contractMapKey, 'update');
                await updateWhitelistContractsOperation.confirmation()

                farmFactoryStorage = await farmFactoryInstance.storage()
                updatedContractMapValue = await getStorageMapValue(farmFactoryStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'Eve (key) should not be in the Whitelist Contracts map before adding her to it')
                assert.notStrictEqual(updatedContractMapValue, undefined,  'Eve (key) should be in the Whitelist Contracts map after adding her to it')

            } catch (e) {
                console.log(e)
            }
        })

        it('%updateWhitelistContracts - admin (bob) should be able to remove userOne (eve) from the Whitelisted Contracts map', async () => {
            try {

                // init values
                contractMapKey  = eve.pkh;
                storageMap      = "whitelistContracts";

                initialContractMapValue = await getStorageMapValue(farmFactoryStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await updateWhitelistContracts(farmFactoryInstance, contractMapKey, 'remove');
                await updateWhitelistContractsOperation.confirmation()

                farmFactoryStorage = await farmFactoryInstance.storage()
                updatedContractMapValue = await getStorageMapValue(farmFactoryStorage, storageMap, contractMapKey);

                assert.notStrictEqual(initialContractMapValue, undefined, 'Eve (key) should be in the Whitelist Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, undefined, 'Eve (key) should not be in the Whitelist Contracts map after adding her to it');

            } catch (e) {
                console.log(e)
            }
        })

        it('%updateGeneralContracts   - admin (bob) should be able to add userOne (eve) to the General Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "generalContracts";

                initialContractMapValue = await getStorageMapValue(farmFactoryStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await updateGeneralContracts(farmFactoryInstance, contractMapKey, eve.pkh, 'update');
                await updateGeneralContractsOperation.confirmation()

                farmFactoryStorage = await farmFactoryInstance.storage()
                updatedContractMapValue = await getStorageMapValue(farmFactoryStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'eve (key) should not be in the General Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, eve.pkh, 'eve (key) should be in the General Contracts map after adding her to it');

            } catch (e) {
                console.log(e)
            }
        })

        it('%updateGeneralContracts   - admin (bob) should be able to remove userOne (eve) from the General Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "generalContracts";

                initialContractMapValue = await getStorageMapValue(farmFactoryStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await updateGeneralContracts(farmFactoryInstance, contractMapKey, eve.pkh, 'remove');
                await updateGeneralContractsOperation.confirmation()

                farmFactoryStorage = await farmFactoryInstance.storage()
                updatedContractMapValue = await getStorageMapValue(farmFactoryStorage, storageMap, contractMapKey);

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

                // Mistaken Operation - userOne (eve) send 10 MavenFa2Tokens to MVN Token Contract
                await signerFactory(tezos, userOneSk);
                transferOperation = await fa2Transfer(mavenFa2TokenInstance, userOne, farmFactoryAddress, tokenId, tokenAmount);
                await transferOperation.confirmation();
                
                mavenFa2TokenStorage       = await mavenFa2TokenInstance.storage();
                const initialUserBalance    = (await mavenFa2TokenStorage.ledger.get(userOne)).toNumber()

                await signerFactory(tezos, adminSk);
                mistakenTransferOperation = await mistakenTransferFa2Token(farmFactoryInstance, userOne, mavenFa2TokenAddress, tokenId, tokenAmount).send();
                await mistakenTransferOperation.confirmation();

                mavenFa2TokenStorage       = await mavenFa2TokenInstance.storage();
                const updatedUserBalance    = (await mavenFa2TokenStorage.ledger.get(userOne)).toNumber();

                // increase in updated balance
                assert.equal(updatedUserBalance, initialUserBalance + tokenAmount);

            } catch (e) {
                console.log(e)
            }
        })

        it("%pauseAll                 - admin (bob) should be able to call this entrypoint", async() => {
            try{

                pauseAllOperation = await farmFactoryInstance.methods.pauseAll().send(); 
                await pauseAllOperation.confirmation();

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%unpauseAll               - admin (bob) should be able to call this entrypoint", async() => {
            try{

                unpauseAllOperation = await farmFactoryInstance.methods.unpauseAll().send(); 
                await unpauseAllOperation.confirmation();

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%togglePauseEntrypoint    - admin (bob) should be able to call this entrypoint", async() => {
            try{
                
                // pause operations

                pauseOperation = await farmFactoryInstance.methods.togglePauseEntrypoint("createFarm", true).send(); 
                await pauseOperation.confirmation();
                
                pauseOperation = await farmFactoryInstance.methods.togglePauseEntrypoint("createFarmMToken", true).send(); 
                await pauseOperation.confirmation();

                pauseOperation = await farmFactoryInstance.methods.togglePauseEntrypoint("untrackFarm", true).send();
                await pauseOperation.confirmation();

                pauseOperation = await farmFactoryInstance.methods.togglePauseEntrypoint("trackFarm", true).send();
                await pauseOperation.confirmation();

                // update storage
                farmFactoryStorage = await farmFactoryInstance.storage();

                // check that entrypoints are paused
                assert.equal(farmFactoryStorage.breakGlassConfig.createFarmIsPaused             , true)
                assert.equal(farmFactoryStorage.breakGlassConfig.createFarmMTokenIsPaused       , true)
                assert.equal(farmFactoryStorage.breakGlassConfig.trackFarmIsPaused              , true)
                assert.equal(farmFactoryStorage.breakGlassConfig.untrackFarmIsPaused            , true)

                // unpause operations

                pauseOperation = await farmFactoryInstance.methods.togglePauseEntrypoint("createFarm", false).send(); 
                await pauseOperation.confirmation();
                
                pauseOperation = await farmFactoryInstance.methods.togglePauseEntrypoint("createFarmMToken", false).send(); 
                await pauseOperation.confirmation();

                pauseOperation = await farmFactoryInstance.methods.togglePauseEntrypoint("untrackFarm", false).send();
                await pauseOperation.confirmation();

                pauseOperation = await farmFactoryInstance.methods.togglePauseEntrypoint("trackFarm", false).send();
                await pauseOperation.confirmation();

                // update storage
                farmFactoryStorage = await farmFactoryInstance.storage();

                // check that entrypoints are paused
                assert.equal(farmFactoryStorage.breakGlassConfig.createFarmIsPaused             , false)
                assert.equal(farmFactoryStorage.breakGlassConfig.createFarmMTokenIsPaused       , false)
                assert.equal(farmFactoryStorage.breakGlassConfig.trackFarmIsPaused              , false)
                assert.equal(farmFactoryStorage.breakGlassConfig.untrackFarmIsPaused            , false)

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });


        it('%createFarm               - admin (bob) should be able to create a new farm', async () => {
            try{
                // Initial values
                farmFactoryStorage                      = await farmFactoryInstance.storage();
                const initTrackedFarms                  = farmFactoryStorage.trackedFarms;

                // Create a transaction for initiating a farm
                const operation = await farmFactoryInstance.methods.createFarm(
                    "testFarm",
                    false,
                    false,
                    false,
                    12000,
                    100,
                    mockMetadata.farm,
                    lpTokenAddress,
                    0,
                    "fa12",
                ).send();
                await operation.confirmation()

                // Created farms
                farmFactoryStorage                      = await farmFactoryInstance.storage();
                const finalTrackedFarms                 = farmFactoryStorage.trackedFarms;
                const newFarmAddresses                  = finalTrackedFarms.filter(item => initTrackedFarms.indexOf(item) < 0);
                const newFarmAddress                    = newFarmAddresses[0];

                // Get the new farm
                farmInstance                            = await utils.tezos.contract.at(newFarmAddress);
                farmStorage                             = await farmInstance.storage();

                assert.strictEqual(farmStorage.config.lpToken.tokenAddress, lpTokenAddress);
                assert.equal(farmStorage.config.lpToken.tokenId, 0);
                assert.equal(farmStorage.config.lpToken.tokenBalance.toNumber(), 0);
                assert.equal(Object.keys(farmStorage.config.lpToken.tokenStandard)[0], "fa12");
                assert.equal(farmStorage.config.plannedRewards.currentRewardPerBlock, 100);
                assert.equal(farmStorage.config.plannedRewards.totalBlocks, 12000);
                assert.equal(farmStorage.open, true);
                assert.equal(farmStorage.init, true);

            }catch(e){
                console.dir(e, {depth: 5});
            }
        })

        it('%createFarm               - admin (bob) should not be able to create a new finite farm without a specified duration', async () => {
            try{
                // Create a transaction for initiating a farm
                const operation = await farmFactoryInstance.methods.createFarm(
                    "testFarm",
                    false,
                    false,
                    false,
                    0,
                    100,
                    mockMetadata.farm,
                    lpTokenAddress,
                    0,
                    "fa12"
                )
                await chai.expect(operation.send()).to.be.rejected;
            }catch(e){
                console.dir(e, {depth: 5});
            }
        })

        it('%trackFarm                - admin (bob) should be able to track a farm', async () => {
            try{
                // Create a transaction for initiating a farm
                const operation = await farmFactoryInstance.methods.trackFarm(farmAddress).send();
                await operation.confirmation();

                // Farm storage
                farmFactoryStorage      = await farmFactoryInstance.storage();
                const createdFarm       = await farmFactoryStorage.trackedFarms.includes(farmAddress);
                assert.equal(createdFarm,true);
            }catch(e){
                console.dir(e, {depth: 5});
            }
        })

        it('%trackFarm                - admin (bob) should not be able to track a treasury if it is already tracked', async () => {
            try{
                // Create a transaction for initiating a farm
                await chai.expect(farmFactoryInstance.methods.trackFarm(farmAddress).send()).to.be.rejected;
            }catch(e){
                console.dir(e, {depth: 5})
            }
        })

        it('%untrackFarm              - admin (bob) should be able to untrack a treasury', async () => {
            try{
                // Create a transaction for initiating a farm
                const operation = await farmFactoryInstance.methods.untrackFarm(farmAddress).send();
                await operation.confirmation();

                // Farm storage
                farmFactoryStorage      = await farmFactoryInstance.storage();
                const createdFarm       = await farmFactoryStorage.trackedFarms.includes(farmAddress);
                assert.equal(createdFarm,false);
            }catch(e){
                console.dir(e, {depth: 5});
            }
        })

        it('%untrackFarm              - admin (bob) should not be able to untrack a farm if it has already been untracked', async () => {
            try{
                // Create a transaction for initiating a farm
                await chai.expect(farmFactoryInstance.methods.untrackFarm(farmAddress).send()).to.be.rejected;
            }catch(e){
                console.dir(e, {depth: 5})
            }
        })

    });


    describe('Access Control Checks', function () {

        beforeEach("Set signer to non-admin (eve)", async () => {
            await signerFactory(tezos, eve.sk);
        });

        it('%setAdmin                 - non-admin (eve) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                farmFactoryStorage        = await farmFactoryInstance.storage();
                const currentAdmin  = farmFactoryStorage.admin;

                // Operation
                setAdminOperation = await farmFactoryInstance.methods.setAdmin(userOne);
                await chai.expect(setAdminOperation.send()).to.be.rejected;

                // Final values
                farmFactoryStorage    = await farmFactoryInstance.storage();
                const newAdmin  = farmFactoryStorage.admin;

                // Assertions
                assert.strictEqual(newAdmin, currentAdmin);

            } catch(e){
                console.log(e);
            }
        });

        it('%setGovernance            - non-admin (eve) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                farmFactoryStorage        = await farmFactoryInstance.storage();
                const currentGovernance  = farmFactoryStorage.governanceAddress;

                // Operation
                setGovernanceOperation = await farmFactoryInstance.methods.setGovernance(userOne);
                await chai.expect(setGovernanceOperation.send()).to.be.rejected;

                // Final values
                farmFactoryStorage    = await farmFactoryInstance.storage();
                const updatedGovernance  = farmFactoryStorage.governanceAddress;

                // Assertions
                assert.strictEqual(updatedGovernance, currentGovernance);

            } catch(e){
                console.log(e);
            }
        });

        it('%updateMetadata           - non-admin (eve) should not be able to update the contract metadata', async () => {
            try{
                // Initial values
                const key   = ''
                const hash  = Buffer.from('tezos-storage:data fail', 'ascii').toString('hex')

                farmFactoryStorage          = await farmFactoryInstance.storage();   
                const initialMetadata   = await farmFactoryStorage.metadata.get(key);

                // Operation
                const updateOperation = await farmFactoryInstance.methods.updateMetadata(key, hash);
                await chai.expect(updateOperation.send()).to.be.rejected;

                // Final values
                farmFactoryStorage          = await farmFactoryInstance.storage();            
                const updatedData       = await farmFactoryStorage.metadata.get(key);

                // check that there is no change in metadata
                assert.equal(updatedData, initialMetadata);
                assert.notEqual(updatedData, hash);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('%updateConfig             - non-admin (eve) should not be able to update contract config', async () => {
            try{
                
                // Initial Values
                farmFactoryStorage          = await farmFactoryInstance.storage();
                const initialConfigValue    = farmFactoryStorage.config.farmNameMaxLength;
                const newConfigValue        = initialConfigValue == 10 ? 20 : 10;

                // Operation
                const updateConfigOperation = await farmFactoryInstance.methods.updateConfig(newConfigValue, "configFarmNameMaxLength");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                // Final values
                farmFactoryStorage       = await farmFactoryInstance.storage();
                const updatedConfigValue = farmFactoryStorage.config.farmNameMaxLength;

                // check that there is no change in config values
                assert.deepEqual(updatedConfigValue, initialConfigValue);
                assert.notEqual(updatedConfigValue.toNumber(), newConfigValue);
                
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%updateWhitelistContracts - non-admin (eve) should not be able to call this entrypoint', async () => {
            try {

                // init values
                contractMapKey  = userOne;
                storageMap      = "whitelistContracts";

                initialContractMapValue = await getStorageMapValue(farmFactoryStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await farmFactoryInstance.methods.updateWhitelistContracts(contractMapKey, "update")
                await chai.expect(updateWhitelistContractsOperation.send()).to.be.rejected;

                farmFactoryStorage = await farmFactoryInstance.storage()
                updatedContractMapValue = await getStorageMapValue(farmFactoryStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'eve (key) should not be in the Whitelist Contracts map');

            } catch (e) {
                console.log(e)
            }
        })

        it('%updateGeneralContracts   - non-admin (eve) should not be able to call this entrypoint', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "generalContracts";

                initialContractMapValue = await getStorageMapValue(farmFactoryStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await farmFactoryInstance.methods.updateGeneralContracts(contractMapKey, userOne)
                await chai.expect(updateGeneralContractsOperation.send()).to.be.rejected;

                farmFactoryStorage          = await farmFactoryInstance.storage()
                updatedContractMapValue = await getStorageMapValue(farmFactoryStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'eve (key) should not be in the General Contracts map');

            } catch (e) {
                console.log(e)
            }
        })

        it('%mistakenTransfer         - non-admin (eve) should not be able to call this entrypoint', async () => {
            try {

                // Initial values
                userOne = userOne;
                const tokenAmount = 10;

                // Mistaken Operation - send 10 MavenFa2Tokens to MVN Token Contract
                transferOperation = await fa2Transfer(mavenFa2TokenInstance, userOne, farmFactoryAddress, tokenId, tokenAmount);
                await transferOperation.confirmation();

                // mistaken transfer operation
                mistakenTransferOperation = await mistakenTransferFa2Token(farmFactoryInstance, userOne, mavenFa2TokenAddress, tokenId, tokenAmount);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch (e) {
                console.log(e)
            }
        })

        it("%pauseAll                 - non-admin (eve) should not be able to call this entrypoint", async() => {
            try{

                pauseAllOperation = farmFactoryInstance.methods.pauseAll(); 
                await chai.expect(pauseAllOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%unpauseAll               - non-admin (eve) should not be able to call this entrypoint", async() => {
            try{

                unpauseAllOperation = farmFactoryInstance.methods.unpauseAll(); 
                await chai.expect(unpauseAllOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%togglePauseEntrypoint    - non-admin (eve) should not be able to call this entrypoint", async() => {
            try{
                
                // pause operations

                pauseOperation = farmFactoryInstance.methods.togglePauseEntrypoint("createFarm", true); 
                await chai.expect(pauseOperation.send()).to.be.rejected;
                
                pauseOperation = farmFactoryInstance.methods.togglePauseEntrypoint("createFarmMToken", true); 
                await chai.expect(pauseOperation.send()).to.be.rejected;

                pauseOperation = farmFactoryInstance.methods.togglePauseEntrypoint("trackFarm", true); 
                await chai.expect(pauseOperation.send()).to.be.rejected;

                pauseOperation = farmFactoryInstance.methods.togglePauseEntrypoint("untrackFarm", true); 
                await chai.expect(pauseOperation.send()).to.be.rejected;

                // unpause operations

                unpauseOperation = farmFactoryInstance.methods.togglePauseEntrypoint("createFarm", false); 
                await chai.expect(unpauseOperation.send()).to.be.rejected;
                
                unpauseOperation = farmFactoryInstance.methods.togglePauseEntrypoint("createFarmMToken", false); 
                await chai.expect(unpauseOperation.send()).to.be.rejected;

                unpauseOperation = farmFactoryInstance.methods.togglePauseEntrypoint("trackFarm", false); 
                await chai.expect(unpauseOperation.send()).to.be.rejected;

                unpauseOperation = farmFactoryInstance.methods.togglePauseEntrypoint("untrackFarm", false); 
                await chai.expect(unpauseOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%createFarm               - non-admin (eve) should not be able to call this entrypoint', async () => {
            try{
                await signerFactory(tezos, userOneSk)
                // Create a transaction for initiating a farm
                await chai.expect(farmFactoryInstance.methods.createFarm(
                    "testFarm",
                    false,
                    false,
                    false,
                    12000,
                    0,
                    mockMetadata.farm,
                    lpTokenAddress,
                    0,
                    "fa12"
                ).send()).to.be.rejected;
            }catch(e){
                console.dir(e, {depth: 5})
            }
        })

        it('%trackFarm                - non-admin (eve) should not be able to call this entrypoint', async () => {
            try{
                // Create a transaction for initiating a farm
                await signerFactory(tezos, userOneSk);
                await chai.expect(farmFactoryInstance.methods.trackFarm(farmAddress).send()).to.be.rejected;
                
                // Assertions
                farmFactoryStorage  = await farmFactoryInstance.storage();
                assert.equal(farmFactoryStorage.trackedFarms.includes(farmAddress), false);
            }catch(e){
                console.dir(e, {depth: 5})
            }
        })

        it('%untrackFarm              - non-admin (eve) should not be able to call this entrypoint', async () => {
            try{

                // Assertions
                farmFactoryStorage  = await farmFactoryInstance.storage();
                assert.equal(farmFactoryStorage.trackedFarms.includes(farmAddress), false);

                // set signer as admin to first track treasury
                await signerFactory(tezos, adminSk);
                const trackFarmOperation = await farmFactoryInstance.methods.trackFarm(farmAddress).send();
                await trackFarmOperation.confirmation();

                // set signer back to admin to test untracking of treasury
                await signerFactory(tezos, userOneSk);
                let untrackFarmOperation = farmFactoryInstance.methods.untrackFarm(farmAddress)
                await chai.expect(untrackFarmOperation.send()).to.be.rejected;

                // assertions - check that trackedFarms still includes treasury (not untracked)
                farmFactoryStorage  = await farmFactoryInstance.storage();
                assert.equal(farmFactoryStorage.trackedFarms.includes(farmAddress), true);

                // reset test - set signer back to admin and untrack treasury
                await signerFactory(tezos, adminSk);
                untrackFarmOperation = await farmFactoryInstance.methods.untrackFarm(farmAddress).send();
                await untrackFarmOperation.confirmation();

            }catch(e){
                console.dir(e, {depth: 5})
            }
        })

        it("%setLambda                - non-admin (eve) should not be able to call this entrypoint", async() => {
            try{

                // random lambda for testing
                const randomLambdaName  = "randomLambdaName";
                const randomLambdaBytes = "050200000cba0743096500000112075e09650000005a036e036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a0362036203620362036200000000036203620760036803690000000009650000000a0362036203620362036e00000000075e09650000006c09650000000a0362036203620362036200000000036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a036203620362036203620000000003620362076003680369000000000362075e07650765036203620362036c075e076507650368036e0362036e036200000000070702000001770743075e076507650368036e0362036e020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c03200342020000010e037a034c037a07430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700002034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f02000000090743036200810303270200000000072f020000000907430362009c0203270200000000070702000000600743036200808080809d8fc0d0bff2f1b26703420200000047037a034c037a0321052900080570000205290015034b031105710002031605700002033a0322072f020000001307430368010000000844495620627920300327020000000003160707020000001a037a037a03190332072c0200000002032002000000020327034f0707020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c032000808080809d8fc0d0bff2f1b2670342020000092d037a057a000505700005037a034c07430362008f03052100020529000f0529000307430359030a034c03190325072c0200000002032702000000020320053d036d05700002072e02000008a4072e020000007c057000030570000405700005057000060570000705200005072e020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000081c072e0200000044057000030570000405700005057000060570000705200005072e0200000010072e02000000020320020000000203200200000010072e020000000203200200000002032002000007cc072e0200000028057000030570000405700005057000060570000705200005072e02000000020320020000000203200200000798072e0200000774034c032003480521000305210003034c052900050316034c03190328072c020000000002000000090743036200880303270570000205210002034c0321052100030521000205290011034c0329072f020000002005290015074303620000074303620000074303620000074303620000054200050200000004034c03200743036200000521000203160319032a072c020000021c052100020521000407430362008e02057000020529000907430368010000000a64656c65676174696f6e034203420521000b034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f0200000009074303620081030327020000001a072f02000000060743035903030200000008032007430359030a074303620000034c072c020000007303200521000205210004034205210007034c0326052100030521000205290008034205700007034c03260521000205290005034c05290007034b0311052100030316033a0521000b034c0322072f02000000130743036801000000084449562062792030032702000000000316034c0316031202000000060570000603200521000305210003034205210008034c0326052100030521000205700004052900030312055000030571000205210003052100030570000405290005031205500005057100020521000305700002052100030570000403160312031205500001034c05210003034c0570000305290013034b031105500013034c02000000060570000503200521000205290015055000080521000205700002052900110570000205700003034c0346034c0350055000110571000205210003052900070743036200000790010000000c746f74616c5f737570706c790362072f020000000907430362008a01032702000000000521000405290007074303620000037703420790010000000b6765745f62616c616e63650362072f02000000090743036200890103270200000000034c052100090743036200a40105210004033a033a0322072f0200000013074303680100000008444956206279203003270200000000031605210009074303620002033a0312052100090521000a07430362008803033a033a0322072f020000001307430368010000000844495620627920300327020000000003160743036200a401034c0322072f0200000013074303680100000008444956206279203003270200000000031605210004033a05210009052100020322072f0200000013074303680100000008444956206279203003270200000000031605210005034b0311052100060570000a052100040322072f0200000013074303680100000008444956206279203003270200000000031605700007052900130312055000130571000507430362008c0305210004052100070342034205210009034c0326032005700005057000030342052100050570000305700002037a034c0570000305700002034b0311074303620000052100020319032a072c020000003b05210002034c057000030322072f02000000130743036801000000084449562062792030032702000000000316057000020529001503120550001502000000080570000205200002057100030521000405210003034c05290011034c0329072f0200000009074303620089030327020000000003210521000507430362008b03057000020316057000020342034205700007034c03260320032105700004057000020316034b031105500001052100040529000707430362000005700003034205210004037705700002037a057000040655055f0765046e000000062566726f6d5f065f096500000026046e0000000425746f5f04620000000925746f6b656e5f696404620000000725616d6f756e7400000000000000042574787300000009257472616e73666572072f0200000008074303620027032702000000000743036a0000053d0765036e055f096500000006036e0362036200000000053d096500000006036e036203620000000005700004057000050570000705420003031b057000040342031b034d0743036200000521000303160319032a072c02000000440521000405210003034205700005034c032605210003052100020570000403160312055000010571000205210005034c0570000505290013034b031105500013057100030200000006057000040320034c052100040529001505500008034c0521000405700004052900110570000305210005034c0346034c03500550001105710002052100030570000207430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700004034c03260655036e0000000e256f6e5374616b654368616e6765072f02000000090743036200b702032702000000000743036a000005700002034d053d036d034c031b034c031b02000000180570000305700004057000050570000605700007052000060200000036057000030570000405700005057000060570000705200005072e0200000010072e0200000002032002000000020320020000000203200342";

                const setLambdaOperation = farmFactoryInstance.methods.setLambda(randomLambdaName, randomLambdaBytes); 
                await chai.expect(setLambdaOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%setProductLambda         - non-admin (eve) should not be able to call this entrypoint", async() => {
            try{

                // random lambda for testing
                const randomLambdaName  = "randomLambdaName";
                const randomLambdaBytes = "050200000cba0743096500000112075e09650000005a036e036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a0362036203620362036200000000036203620760036803690000000009650000000a0362036203620362036e00000000075e09650000006c09650000000a0362036203620362036200000000036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a036203620362036203620000000003620362076003680369000000000362075e07650765036203620362036c075e076507650368036e0362036e036200000000070702000001770743075e076507650368036e0362036e020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c03200342020000010e037a034c037a07430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700002034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f02000000090743036200810303270200000000072f020000000907430362009c0203270200000000070702000000600743036200808080809d8fc0d0bff2f1b26703420200000047037a034c037a0321052900080570000205290015034b031105710002031605700002033a0322072f020000001307430368010000000844495620627920300327020000000003160707020000001a037a037a03190332072c0200000002032002000000020327034f0707020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c032000808080809d8fc0d0bff2f1b2670342020000092d037a057a000505700005037a034c07430362008f03052100020529000f0529000307430359030a034c03190325072c0200000002032702000000020320053d036d05700002072e02000008a4072e020000007c057000030570000405700005057000060570000705200005072e020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000081c072e0200000044057000030570000405700005057000060570000705200005072e0200000010072e02000000020320020000000203200200000010072e020000000203200200000002032002000007cc072e0200000028057000030570000405700005057000060570000705200005072e02000000020320020000000203200200000798072e0200000774034c032003480521000305210003034c052900050316034c03190328072c020000000002000000090743036200880303270570000205210002034c0321052100030521000205290011034c0329072f020000002005290015074303620000074303620000074303620000074303620000054200050200000004034c03200743036200000521000203160319032a072c020000021c052100020521000407430362008e02057000020529000907430368010000000a64656c65676174696f6e034203420521000b034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f0200000009074303620081030327020000001a072f02000000060743035903030200000008032007430359030a074303620000034c072c020000007303200521000205210004034205210007034c0326052100030521000205290008034205700007034c03260521000205290005034c05290007034b0311052100030316033a0521000b034c0322072f02000000130743036801000000084449562062792030032702000000000316034c0316031202000000060570000603200521000305210003034205210008034c0326052100030521000205700004052900030312055000030571000205210003052100030570000405290005031205500005057100020521000305700002052100030570000403160312031205500001034c05210003034c0570000305290013034b031105500013034c02000000060570000503200521000205290015055000080521000205700002052900110570000205700003034c0346034c0350055000110571000205210003052900070743036200000790010000000c746f74616c5f737570706c790362072f020000000907430362008a01032702000000000521000405290007074303620000037703420790010000000b6765745f62616c616e63650362072f02000000090743036200890103270200000000034c052100090743036200a40105210004033a033a0322072f0200000013074303680100000008444956206279203003270200000000031605210009074303620002033a0312052100090521000a07430362008803033a033a0322072f020000001307430368010000000844495620627920300327020000000003160743036200a401034c0322072f0200000013074303680100000008444956206279203003270200000000031605210004033a05210009052100020322072f0200000013074303680100000008444956206279203003270200000000031605210005034b0311052100060570000a052100040322072f0200000013074303680100000008444956206279203003270200000000031605700007052900130312055000130571000507430362008c0305210004052100070342034205210009034c0326032005700005057000030342052100050570000305700002037a034c0570000305700002034b0311074303620000052100020319032a072c020000003b05210002034c057000030322072f02000000130743036801000000084449562062792030032702000000000316057000020529001503120550001502000000080570000205200002057100030521000405210003034c05290011034c0329072f0200000009074303620089030327020000000003210521000507430362008b03057000020316057000020342034205700007034c03260320032105700004057000020316034b031105500001052100040529000707430362000005700003034205210004037705700002037a057000040655055f0765046e000000062566726f6d5f065f096500000026046e0000000425746f5f04620000000925746f6b656e5f696404620000000725616d6f756e7400000000000000042574787300000009257472616e73666572072f0200000008074303620027032702000000000743036a0000053d0765036e055f096500000006036e0362036200000000053d096500000006036e036203620000000005700004057000050570000705420003031b057000040342031b034d0743036200000521000303160319032a072c02000000440521000405210003034205700005034c032605210003052100020570000403160312055000010571000205210005034c0570000505290013034b031105500013057100030200000006057000040320034c052100040529001505500008034c0521000405700004052900110570000305210005034c0346034c03500550001105710002052100030570000207430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700004034c03260655036e0000000e256f6e5374616b654368616e6765072f02000000090743036200b702032702000000000743036a000005700002034d053d036d034c031b034c031b02000000180570000305700004057000050570000605700007052000060200000036057000030570000405700005057000060570000705200005072e0200000010072e0200000002032002000000020320020000000203200342";

                const setLambdaOperation = farmFactoryInstance.methods.setProductLambda(randomLambdaName, randomLambdaBytes); 
                await chai.expect(setLambdaOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })
    })
});