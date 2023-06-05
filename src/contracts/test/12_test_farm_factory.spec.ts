import { MVK, Utils } from "./helpers/Utils";
import { farmStorageType } from "../storage/storageTypes/farmStorageType";

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

import { bob, alice, eve } from "../scripts/sandbox/accounts";
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

describe("FarmFactory", async () => {
    
    var utils: Utils;
    let tezos 

    let farmAddress: string;
    let farmInstance;
    let farmStorage;

    let farmFactoryAddress
    let mvkTokenAddress
    let lpTokenAddress 
    let doormanAddress
    let treasuryAddress

    let farmFactoryInstance;
    let farmFactoryStorage;

    let lpTokenInstance;
    let lpTokenStorage;

    let doormanInstance;
    let doormanStorage;

    let mvkTokenInstance;
    let mvkTokenStorage;

    before("setup", async () => {

        utils = new Utils();
        await utils.init(bob.sk);
        tezos = utils.tezos

        farmAddress             = contractDeployments.farm.address;
        farmFactoryAddress      = contractDeployments.farmFactory.address;
        mvkTokenAddress         = contractDeployments.mvkToken.address;
        lpTokenAddress          = contractDeployments.mavrykFa12Token.address;
        treasuryAddress         = contractDeployments.treasury.address;
        doormanAddress          = contractDeployments.doorman.address;
        
        farmFactoryInstance     = await utils.tezos.contract.at(farmFactoryAddress);
        lpTokenInstance         = await utils.tezos.contract.at(lpTokenAddress);
        doormanInstance         = await utils.tezos.contract.at(doormanAddress);
        mvkTokenInstance        = await utils.tezos.contract.at(mvkTokenAddress);
        

        farmFactoryStorage      = await farmFactoryInstance.storage();
        doormanStorage          = await doormanInstance.storage();
        lpTokenStorage          = await lpTokenInstance.storage();
        mvkTokenStorage         = await mvkTokenInstance.storage();
        
    });

    beforeEach("storage", async () => {
        farmFactoryStorage = await farmFactoryInstance.storage();
        lpTokenStorage    = await lpTokenInstance.storage();
        doormanStorage    = await doormanInstance.storage();
        mvkTokenStorage    = await mvkTokenInstance.storage();
        await signerFactory(tezos, bob.sk)
    })

    describe('Farm Factory', function() {
        describe('%createFarm', function() {
            it('Create a farm being the admin', async () => {
                try{
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
                    farmFactoryStorage    = await farmFactoryInstance.storage();

                    // Get the new farm
                    farmAddress                             = farmFactoryStorage.trackedFarms[0];
                    farmInstance                            = await utils.tezos.contract.at(farmAddress);
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

            it('Create a farm without being the admin', async () => {
                try{
                    await signerFactory(tezos, alice.sk)
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

            it('Create a farm being the admin but without specific duration and finite', async () => {
                try{
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
                        "fa12"
                    ).send();
                    await operation.confirmation()

                    // Created farms
                    farmFactoryStorage    = await farmFactoryInstance.storage();

                    // Get the new farm
                    farmAddress                             = farmFactoryStorage.trackedFarms[0];
                    farmInstance                            = await utils.tezos.contract.at(farmAddress);
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

        });

        describe('%setAdmin', function() {
            it('Admin should be able to set a new admin', async() => {
                try{
                    // Initial values
                    const previousAdmin = farmFactoryStorage.admin;

                    // Create a transaction for initiating a farm
                    const operation = await farmFactoryInstance.methods.setAdmin(alice.pkh).send();
                    await operation.confirmation();

                    // Final values
                    farmFactoryStorage = await farmFactoryInstance.storage();

                    // Assertion
                    assert.strictEqual(farmFactoryStorage.admin,alice.pkh);
                    assert.strictEqual(previousAdmin,bob.pkh);

                    // Reset admin
                    await signerFactory(tezos, alice.sk);
                    const resetOperation = await farmFactoryInstance.methods.setAdmin(bob.pkh).send();
                    await resetOperation.confirmation();
                }catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Non-admin should not be able to set a new admin', async() => {
                try{
                    // Create a transaction for initiating a farm
                    await signerFactory(tezos, eve.sk)
                    const operation = farmFactoryInstance.methods.setAdmin(bob.pkh);
                    await chai.expect(operation.send()).to.be.rejected;

                    // Final values
                    farmFactoryStorage = await farmFactoryInstance.storage();

                    // Assertion
                    assert.strictEqual(farmFactoryStorage.admin,bob.pkh)
                }catch(e){
                    console.dir(e, {depth: 5})
                }
            })
        });

        describe('%pauseAll', function() {
            it('Admin should be able to pause all entrypoints on the factory and the tracked farms', async() => {
                try{
                    await signerFactory(tezos, bob.sk)
                    // Initial values
                    const createFarmIsPaused = farmFactoryStorage.breakGlassConfig.createFarmIsPaused;
                    const trackFarmIsPaused = farmFactoryStorage.breakGlassConfig.trackFarmIsPaused;
                    const untrackFarmIsPaused = farmFactoryStorage.breakGlassConfig.untrackFarmIsPaused;
                    const trackedFarms = await farmFactoryStorage.trackedFarms;
                    const farmAddress = trackedFarms[0]
                    const farmInstance   = await utils.tezos.contract.at(farmAddress);
                    var farmStorage: farmStorageType = await farmInstance.storage();
                    const depositIsPaused = farmStorage.breakGlassConfig.depositIsPaused;
                    const withdrawIsPaused = farmStorage.breakGlassConfig.withdrawIsPaused;
                    const claimIsPaused = farmStorage.breakGlassConfig.claimIsPaused;

                    // Create an operation
                    const operation = await farmFactoryInstance.methods.pauseAll().send();
                    await operation.confirmation();

                    // Final values
                    farmFactoryStorage = await farmFactoryInstance.storage();
                    farmStorage = await farmInstance.storage();
                    const depositIsPausedEnd = farmStorage.breakGlassConfig.depositIsPaused;
                    const withdrawIsPausedEnd = farmStorage.breakGlassConfig.withdrawIsPaused;
                    const claimIsPausedEnd = farmStorage.breakGlassConfig.claimIsPaused;
                    const createFarmIsPausedEnd = farmFactoryStorage.breakGlassConfig.createFarmIsPaused;
                    const trackFarmIsPausedEnd = farmFactoryStorage.breakGlassConfig.trackFarmIsPaused;
                    const untrackFarmIsPausedEnd = farmFactoryStorage.breakGlassConfig.untrackFarmIsPaused;

                    // Test calls
                    await chai.expect(farmFactoryInstance.methods.createFarm(
                        "testFarm",
                        false,
                        false,
                        false,
                        12000,
                        100,
                        mockMetadata.farm,
                        lpTokenAddress,
                        0,
                        "fa12"
                    ).send()).to.be.rejected;
                    await chai.expect(farmFactoryInstance.methods.untrackFarm(farmAddress).send()).to.be.rejected;
                    await chai.expect(farmFactoryInstance.methods.trackFarm(farmAddress).send()).to.be.rejected;
                    await chai.expect(farmInstance.methods.deposit(MVK(2)).send()).to.be.rejected;
                    await chai.expect(farmInstance.methods.withdraw(MVK()).send()).to.be.rejected;
                    await chai.expect(farmInstance.methods.claim(bob.pkh).send()).to.be.rejected;

                    // Assertion
                    assert.notEqual(depositIsPaused,depositIsPausedEnd);
                    assert.notEqual(withdrawIsPaused,withdrawIsPausedEnd);
                    assert.notEqual(claimIsPaused,claimIsPausedEnd);
                    assert.notEqual(createFarmIsPaused,createFarmIsPausedEnd);
                    assert.notEqual(untrackFarmIsPaused,untrackFarmIsPausedEnd);
                    assert.notEqual(trackFarmIsPaused,trackFarmIsPausedEnd);
                }catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Non-admin should not be able to pause all entrypoints', async() => {
                try{
                    // Change signer
                    await signerFactory(tezos, alice.sk);

                    // Initial values
                    const createFarmIsPaused = farmFactoryStorage.breakGlassConfig.createFarmIsPaused;
                    const trackFarmIsPaused = farmFactoryStorage.breakGlassConfig.trackFarmIsPaused;
                    const untrackFarmIsPaused = farmFactoryStorage.breakGlassConfig.untrackFarmIsPaused;

                    // Create a transaction for initiating a farm
                    await chai.expect(farmFactoryInstance.methods.pauseAll().send()).to.be.rejected;

                    // Final values
                    farmFactoryStorage = await farmFactoryInstance.storage();

                    // Final values
                    farmFactoryStorage = await farmFactoryInstance.storage();
                    const createFarmIsPausedEnd = farmFactoryStorage.breakGlassConfig.createFarmIsPaused;
                    const trackFarmIsPausedEnd = farmFactoryStorage.breakGlassConfig.trackFarmIsPaused;
                    const untrackFarmIsPausedEnd = farmFactoryStorage.breakGlassConfig.untrackFarmIsPaused;

                    // Assertion
                    assert.equal(createFarmIsPaused,createFarmIsPausedEnd);
                    assert.equal(untrackFarmIsPaused,untrackFarmIsPausedEnd);
                    assert.equal(trackFarmIsPaused,trackFarmIsPausedEnd);
                }catch(e){
                    console.dir(e, {depth: 5})
                }
            })

        });

        describe('%unpauseAll', function() {
            it('Admin should be able to unpause all entrypoints and all tracked farms', async() => {
                try{
                    // Initial values
                    await signerFactory(tezos, bob.sk)
                    const createFarmIsPaused = farmFactoryStorage.breakGlassConfig.createFarmIsPaused;
                    const trackFarmIsPaused = farmFactoryStorage.breakGlassConfig.trackFarmIsPaused;
                    const untrackFarmIsPaused = farmFactoryStorage.breakGlassConfig.untrackFarmIsPaused;
                    const trackedFarms = await farmFactoryStorage.trackedFarms;
                    const farmAddress = trackedFarms[0]
                    const farmInstance   = await utils.tezos.contract.at(farmAddress);
                    var farmStorage: farmStorageType = await farmInstance.storage();
                    const depositIsPaused = farmStorage.breakGlassConfig.depositIsPaused;
                    const withdrawIsPaused = farmStorage.breakGlassConfig.withdrawIsPaused;
                    const claimIsPaused = farmStorage.breakGlassConfig.claimIsPaused;
                    const userLedgerStart = await lpTokenStorage.ledger.get(bob.pkh);
                    const approvalsStart = await userLedgerStart.allowances.get(farmAddress);

                    // Create an operation
                    const operation = await farmFactoryInstance.methods.unpauseAll().send();
                    await operation.confirmation();

                    // Final values
                    farmFactoryStorage = await farmFactoryInstance.storage();
                    farmStorage = await farmInstance.storage();
                    const depositIsPausedEnd = farmStorage.breakGlassConfig.depositIsPaused;
                    const withdrawIsPausedEnd = farmStorage.breakGlassConfig.withdrawIsPaused;
                    const claimIsPausedEnd = farmStorage.breakGlassConfig.claimIsPaused;
                    const createFarmIsPausedEnd = farmFactoryStorage.breakGlassConfig.createFarmIsPaused;
                    const trackFarmIsPausedEnd = farmFactoryStorage.breakGlassConfig.trackFarmIsPaused;
                    const untrackFarmIsPausedEnd = farmFactoryStorage.breakGlassConfig.untrackFarmIsPaused;

                    // Test calls
                    const createFarmOperation = await farmFactoryInstance.methods.createFarm(
                        "testFarm",
                        false,
                        false,
                        false,
                        12000,
                        100,
                        mockMetadata.farm,
                        lpTokenAddress,
                        0,
                        "fa12"
                    ).send();
                    await createFarmOperation.confirmation();
                    const untrackFarmOperation = await farmFactoryInstance.methods.untrackFarm(farmAddress).send();
                    await untrackFarmOperation.confirmation();
                    const trackFarmOperation = await farmFactoryInstance.methods.trackFarm(farmAddress).send();
                    await trackFarmOperation.confirmation();

                    // Test calls
                    if(approvalsStart===undefined){
                        const approveOperation = await lpTokenInstance.methods.approve(farmAddress,2).send();
                        await approveOperation.confirmation();
                    }
                    const depositOperation = await farmInstance.methods.deposit(2).send();
                    await depositOperation.confirmation();
                    const withdrawOperation = await farmInstance.methods.withdraw(1).send();
                    await withdrawOperation.confirmation();
                    const claimOperation = await farmInstance.methods.claim(bob.pkh).send();
                    await claimOperation.confirmation();

                    // Assertion
                    assert.notEqual(depositIsPaused,depositIsPausedEnd);
                    assert.notEqual(withdrawIsPaused,withdrawIsPausedEnd);
                    assert.notEqual(claimIsPaused,claimIsPausedEnd);
                    assert.notEqual(createFarmIsPaused,createFarmIsPausedEnd);
                    assert.notEqual(untrackFarmIsPaused,untrackFarmIsPausedEnd);
                    assert.notEqual(trackFarmIsPaused,trackFarmIsPausedEnd);
                }catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Non-admin should not be able to unpause all entrypoints', async() => {
                try{
                    // Change signer
                    await signerFactory(tezos, alice.sk);

                    // Initial values
                    const createFarmIsPaused = farmFactoryStorage.breakGlassConfig.createFarmIsPaused;
                    const trackFarmIsPaused = farmFactoryStorage.breakGlassConfig.trackFarmIsPaused;
                    const untrackFarmIsPaused = farmFactoryStorage.breakGlassConfig.untrackFarmIsPaused;

                    // Create a transaction for initiating a farm
                    await chai.expect(farmFactoryInstance.methods.unpauseAll().send()).to.be.rejected;

                    // Final values
                    farmFactoryStorage = await farmFactoryInstance.storage();

                    // Final values
                    farmFactoryStorage = await farmFactoryInstance.storage();
                    const createFarmIsPausedEnd = farmFactoryStorage.breakGlassConfig.createFarmIsPaused;
                    const trackFarmIsPausedEnd = farmFactoryStorage.breakGlassConfig.trackFarmIsPaused;
                    const untrackFarmIsPausedEnd = farmFactoryStorage.breakGlassConfig.untrackFarmIsPaused;
                    
                    // Assertion
                    assert.equal(createFarmIsPaused,createFarmIsPausedEnd);
                    assert.equal(untrackFarmIsPaused,untrackFarmIsPausedEnd);
                    assert.equal(trackFarmIsPaused,trackFarmIsPausedEnd);
                }catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Non-admin should not be able to unpause all entrypoints on all tracked farms', async() => {
                try{
                    // Change signer
                    await signerFactory(tezos, alice.sk);

                    // Initial values
                    const trackedFarms = await farmFactoryStorage.trackedFarms;
                    const farmAddress = trackedFarms[0]
                    const farmInstance   = await utils.tezos.contract.at(farmAddress);
                    var farmStorage: farmStorageType = await farmInstance.storage();

                    const depositIsPaused = farmStorage.breakGlassConfig.depositIsPaused;
                    const withdrawIsPaused = farmStorage.breakGlassConfig.withdrawIsPaused;
                    const claimIsPaused = farmStorage.breakGlassConfig.claimIsPaused;

                    // Create a transaction for initiating a farm
                    await chai.expect(farmFactoryInstance.methods.unpauseAll().send()).to.be.rejected;

                    // Final values
                    farmStorage = await farmInstance.storage();
                    const depositIsPausedEnd = farmStorage.breakGlassConfig.depositIsPaused;
                    const withdrawIsPausedEnd = farmStorage.breakGlassConfig.withdrawIsPaused;
                    const claimIsPausedEnd = farmStorage.breakGlassConfig.claimIsPaused;
                    
                    // Assertion
                    assert.equal(depositIsPaused,depositIsPausedEnd);
                    assert.equal(withdrawIsPaused,withdrawIsPausedEnd);
                    assert.equal(claimIsPaused,claimIsPausedEnd);
                }catch(e){
                    console.dir(e, {depth: 5})
                }
            })
        });

        describe('%togglePauseEntrypoint', function() {
            it('Admin should be able to pause and unpause the createFarm entrypoint', async() => {
                try{
                    // Initial values
                    const createFarmIsPaused = farmFactoryStorage.breakGlassConfig.createFarmIsPaused;

                    // Create an operation
                    const pauseOperation = await farmFactoryInstance.methods.togglePauseEntrypoint("createFarm", true).send();
                    await pauseOperation.confirmation();

                    // Final values
                    farmFactoryStorage = await farmFactoryInstance.storage();
                    const createFarmIsPausedPause = farmFactoryStorage.breakGlassConfig.createFarmIsPaused;

                    // Test calls
                    await chai.expect(farmFactoryInstance.methods.createFarm(
                        "testFarm",
                        false,
                        false,
                        false,
                        12000,
                        100,
                        mockMetadata.farm,
                        lpTokenAddress,
                        0,
                        "fa12"
                    ).send()).to.be.rejected;

                    // Create an operation
                    const unpauseOperation = await farmFactoryInstance.methods.togglePauseEntrypoint("createFarm", false).send();
                    await unpauseOperation.confirmation();

                    // Final values
                    farmFactoryStorage = await farmFactoryInstance.storage();
                    const createFarmIsPausedUnpause = farmFactoryStorage.breakGlassConfig.createFarmIsPaused;

                    // Assertion
                    assert.notEqual(createFarmIsPaused,createFarmIsPausedPause);
                    assert.equal(createFarmIsPaused,createFarmIsPausedUnpause);
                }catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Admin should be able to pause and unpause the untrackFarm entrypoint', async() => {
                try{
                    // Initial values
                    const untrackFarmIsPaused = farmFactoryStorage.breakGlassConfig.untrackFarmIsPaused;

                    // Create an operation
                    const pauseOperation = await farmFactoryInstance.methods.togglePauseEntrypoint("untrackFarm", true).send();
                    await pauseOperation.confirmation();

                    // Final values
                    farmFactoryStorage = await farmFactoryInstance.storage();
                    const untrackFarmIsPausedPause = farmFactoryStorage.breakGlassConfig.untrackFarmIsPaused;

                    // Test calls
                    await chai.expect(farmFactoryInstance.methods.untrackFarm(farmAddress).send()).to.be.rejected;

                    // Create an operation
                    const unpauseOperation = await farmFactoryInstance.methods.togglePauseEntrypoint("untrackFarm", false).send();
                    await unpauseOperation.confirmation();

                    // Final values
                    farmFactoryStorage = await farmFactoryInstance.storage();
                    const untrackFarmIsPausedUnpause = farmFactoryStorage.breakGlassConfig.untrackFarmIsPaused;

                    // Assertion
                    assert.notEqual(untrackFarmIsPaused,untrackFarmIsPausedPause);
                    assert.equal(untrackFarmIsPaused,untrackFarmIsPausedUnpause);
                }catch(e){
                    console.dir(e, {depth: 5})
                }
            })
            
            it('Admin should be able to pause and unpause the trackFarm entrypoint', async() => {
                try{
                    // Initial values
                    const trackFarmIsPaused = farmFactoryStorage.breakGlassConfig.trackFarmIsPaused;

                    // Create an operation
                    const pauseOperation = await farmFactoryInstance.methods.togglePauseEntrypoint("trackFarm", true).send();
                    await pauseOperation.confirmation();

                    // Final values
                    farmFactoryStorage = await farmFactoryInstance.storage();
                    const trackFarmIsPausedPause = farmFactoryStorage.breakGlassConfig.trackFarmIsPaused;

                    // Test calls
                    await chai.expect(farmFactoryInstance.methods.trackFarm(farmAddress).send()).to.be.rejected;

                    // Create an operation
                    const unpauseOperation = await farmFactoryInstance.methods.togglePauseEntrypoint("trackFarm", false).send();
                    await unpauseOperation.confirmation();

                    // Final values
                    farmFactoryStorage = await farmFactoryInstance.storage();
                    const trackFarmIsPausedUnpause = farmFactoryStorage.breakGlassConfig.trackFarmIsPaused;

                    // Assertion
                    assert.notEqual(trackFarmIsPaused,trackFarmIsPausedPause);
                    assert.equal(trackFarmIsPaused,trackFarmIsPausedUnpause);
                }catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Non-admin should not be able to pause and unpause the trackFarm entrypoint', async() => {
                try{
                    // Change signer
                    await signerFactory(tezos, alice.sk);

                    // Initial values
                    const trackFarmIsPaused = farmFactoryStorage.breakGlassConfig.trackFarmIsPaused;

                    // Create a transaction for initiating a farm
                    await chai.expect(farmFactoryInstance.methods.togglePauseEntrypoint("trackFarm", true).send()).to.be.rejected;

                    // Final values
                    farmFactoryStorage = await farmFactoryInstance.storage();
                    const trackFarmIsPausedEnd = farmFactoryStorage.breakGlassConfig.trackFarmIsPaused;
                    
                    // Assertion
                    assert.equal(trackFarmIsPaused,trackFarmIsPausedEnd);
                }catch(e){
                    console.dir(e, {depth: 5})
                }
            })
        });

        describe('%untrackFarm', function() {
            it('Untrack the previously created farm', async () => {
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

            it('Untrack an unexisting farm', async () => {
                try{
                    // Create a transaction for initiating a farm
                    await chai.expect(farmFactoryInstance.methods.untrackFarm(alice.pkh).send()).to.be.rejected;
                }catch(e){
                    console.log(e)
                }
            })
        });

        describe('%trackFarm', function() {
            it('Admin should be able to track the previously untracked farm', async () => {
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

            it('Admin should not be able to track an already tracked farm', async () => {
                try{
                    // Create a transaction for initiating a farm
                    await chai.expect(farmFactoryInstance.methods.trackFarm(farmAddress).send()).to.be.rejected;
                }catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Non-admin should not be able to track a farm', async () => {
                try{
                    // Create a transaction for initiating a farm
                    await signerFactory(tezos, alice.sk);
                    await chai.expect(farmFactoryInstance.methods.trackFarm(farmAddress).send()).to.be.rejected;
                }catch(e){
                    console.dir(e, {depth: 5})
                }
            })
        });

    });

    describe('Newly created farm', function() {
        describe('%claim', function() {
            it('Create a farm, deposit and try to claim in it', async () => {
                try{
                    // Deposit
                    const amountToDeposit = 2;

                    // Create a transaction for initiating a farm
                    const createFarmOperation = await farmFactoryInstance.methods.createFarm(
                        "testFarm",
                        false,
                        false,
                        false,
                        100,
                        12000,
                        mockMetadata.farm,
                        lpTokenAddress,
                        0,
                        "fa12"
                    ).send();
                    await createFarmOperation.confirmation()

                    // Created farms
                    farmFactoryStorage    = await farmFactoryInstance.storage();

                    // Get the new farm
                    farmAddress                             = farmFactoryStorage.trackedFarms[farmFactoryStorage.trackedFarms.length - 1];
                    farmInstance                            = await utils.tezos.contract.at(farmAddress);
                    farmStorage                             = await farmInstance.storage();

                     // Create a transaction for allowing farm to spend LP Token in the name of Bob
                    const bobLedgerStart = await lpTokenStorage.ledger.get(bob.pkh);
                    const bobApprovalsStart = await bobLedgerStart.allowances.get(farmAddress);

                    // Check Bob has no pending approvals for the farm
                    if(bobApprovalsStart===undefined || bobApprovalsStart<amountToDeposit){
                        const allowances = bobApprovalsStart===undefined ? amountToDeposit : Math.abs(bobApprovalsStart - amountToDeposit);
                        const approveOperation = await lpTokenInstance.methods.approve(farmAddress,allowances).send();
                        await approveOperation.confirmation();
                    }
                    // Deposit operation
                    const depositOperation = await farmInstance.methods.deposit(amountToDeposit).send();
                    await depositOperation.confirmation();

                    // Claim operation after a few blocks
                    await new Promise(resolve => setTimeout(resolve, 6000));
                    const claimOperation = await farmInstance.methods.claim(bob.pkh).send();
                    await claimOperation.confirmation()
                    
                    farmStorage = await farmInstance.storage();
                    doormanStorage = await doormanInstance.storage();

                    // Depositor's record
                    const depositorRecord = await farmStorage.depositorLedger.get(bob.pkh)
                    console.log("User's deposit in Farm Contract")
                    console.log(depositorRecord)

                    // Stake's record
                    const doormanRecord = await doormanStorage.userStakeBalanceLedger.get(bob.pkh)
                    console.log("User's balance in Doorman Contract")
                    console.log(doormanRecord)

                    // Doorman's balance in MVK Token Contract
                    const doormanLedger = await mvkTokenStorage.ledger.get(doormanAddress)
                    console.log("Doorman's ledger in MVK Token Contract")
                    console.log(doormanLedger)
                }catch(e){
                    console.dir(e, {depth: 5});
                }
            })

            it('Create a farm, deposit and try to claim in it with a farm unknown to the farm factory', async () => {
                try{
                    // Deposit
                    const amountToDeposit = 2;
                    
                    // Untrack the farm
                    const untrackOperation = await farmFactoryInstance.methods.untrackFarm(farmAddress).send();
                    await untrackOperation.confirmation();

                    // Create a transaction for allowing farm to spend LP Token in the name of Bob
                    const bobLedgerStart = await lpTokenStorage.ledger.get(bob.pkh);
                    const bobApprovalsStart = await bobLedgerStart.allowances.get(farmAddress);

                    // Check Bob has no pending approvals for the farm
                    if(bobApprovalsStart===undefined || bobApprovalsStart<amountToDeposit){
                        const allowances = bobApprovalsStart===undefined ? amountToDeposit : Math.abs(bobApprovalsStart - amountToDeposit);
                        const approveOperation = await lpTokenInstance.methods.approve(farmAddress,allowances).send();
                        await approveOperation.confirmation();
                    }
                    // Deposit operation
                    const depositOperation = await farmInstance.methods.deposit(amountToDeposit).send();
                    await depositOperation.confirmation();

                    // Claim operation after a few blocks
                    await new Promise(resolve => setTimeout(resolve, 6000));
                    await chai.expect(farmInstance.methods.claim(bob.pkh).send()).to.be.rejected;
                }catch(e){
                    console.log(e)
                }
            })
        });
    });
});