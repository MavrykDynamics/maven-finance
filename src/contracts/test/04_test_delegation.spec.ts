import assert, { ok, rejects, strictEqual } from "assert";
import { Utils, MVK } from "./helpers/Utils";

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

import { bob, alice, eve, mallory, oscar } from "../scripts/sandbox/accounts";
import * as helperFunctions from './helpers/helperFunctions'
import { mockSatelliteData } from "./helpers/mockSampleData"

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("Test: Delegation Contract", async () => {
    
    // default
    var utils : Utils
    var tezos

    let user
    let userSk

    // basic inputs for updating operators
    let doormanAddress
    let delegationAddress
    let tokenId = 0

    // contract instances
    let doormanInstance
    let delegationInstance
    let mvkTokenInstance
    let governanceInstance
    let mavrykFa2TokenInstance

    // contract storages
    let doormanStorage
    let delegationStorage
    let mvkTokenStorage
    let governanceStorage
    let mavrykFa2TokenStorage

    // operations
    let transferOperation
    let updateOperatorsOperation
    let removeOperatorsOperation
    let stakeOperation
    let unstakeOperation
    let registerAsSatelliteOperation
    let unregisterAsSatelliteOperation
    let delegateOperation
    let undelegateOperation

    // housekeeping operations
    let setAdminOperation
    let setGovernanceOperation
    let resetAdminOperation
    let updateWhitelistContractsOperation
    let updateGeneralContractsOperation
    let togglePauseOperation
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

        doormanAddress  = contractDeployments.doorman.address;
        
        doormanInstance         = await utils.tezos.contract.at(contractDeployments.doorman.address);
        delegationInstance      = await utils.tezos.contract.at(contractDeployments.delegation.address);
        mvkTokenInstance        = await utils.tezos.contract.at(contractDeployments.mvkToken.address);
        governanceInstance      = await utils.tezos.contract.at(contractDeployments.governance.address);
        mavrykFa2TokenInstance  = await utils.tezos.contract.at(contractDeployments.mavrykFa2Token.address);
            
        doormanStorage          = await doormanInstance.storage();
        delegationStorage       = await delegationInstance.storage();
        mvkTokenStorage         = await mvkTokenInstance.storage();
        governanceStorage       = await governanceInstance.storage();
        mavrykFa2TokenStorage   = await mavrykFa2TokenInstance.storage();

        console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')

    });

    describe("%registerAsSatellite", async () => {

        beforeEach("Set signer to user", async () => {
            await helperFunctions.signerFactory(tezos, eve.sk)
        });

        it('user (eve) should be able to register as a satellite', async () => {
            try{
                
                // init values
                user                = eve.pkh;
                userSk              = eve.sk;
                const userStake     = MVK(100);

                // update operators operation for user
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, user, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();

                // user stake 100 MVK tokens
                stakeOperation = await doormanInstance.methods.stake(userStake).send();
                await stakeOperation.confirmation();

                // Check state before registering as satellite
                const beforeDelegationLedger     = await delegationStorage.satelliteLedger.get(user);        // should return null or undefined
                const beforeStakedBalance        = await doormanStorage.userStakeBalanceLedger.get(user);    // 100 MVK
                
                assert.equal(beforeDelegationLedger,       null);
                assert.equal(beforeStakedBalance.balance,  userStake);

                // user registers as a satellite
                registerAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite(
                    mockSatelliteData.eve.name, 
                    mockSatelliteData.eve.desc, 
                    mockSatelliteData.eve.image, 
                    mockSatelliteData.eve.website,
                    mockSatelliteData.eve.satelliteFee
                ).send();
                await registerAsSatelliteOperation.confirmation();

                // Check state after registering as satellite
                delegationStorage               = await delegationInstance.storage();
                const afterDelegationLedger     = await delegationStorage.satelliteLedger.get(user);         // should return bob's satellite record
                const afterStakedBalance        = await doormanStorage.userStakeBalanceLedger.get(user);     // 100 MVK
                
                // satellite details
                assert.equal(afterDelegationLedger.name,                   mockSatelliteData.eve.name);
                assert.equal(afterDelegationLedger.description,            mockSatelliteData.eve.desc);
                assert.equal(afterDelegationLedger.website,                mockSatelliteData.eve.website);
                assert.equal(afterDelegationLedger.stakedMvkBalance,       userStake);
                assert.equal(afterDelegationLedger.satelliteFee,           mockSatelliteData.eve.satelliteFee);
                assert.equal(afterDelegationLedger.totalDelegatedAmount,   0);
                assert.equal(afterDelegationLedger.status,                 "ACTIVE");

                // User's staked balance remains the same
                assert.equal(afterStakedBalance.balance, userStake);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Delegate should not be able to call this entrypoint', async () => {
            try{
                // Delegate to this satellite
                await helperFunctions.signerFactory(tezos, alice.sk)

                // Initial Values
                delegationStorage       = await delegationInstance.storage();
                const stakeAmount       = MVK(10);

                // update operators operation for user
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, alice.pkh, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();
                
                stakeOperation = await doormanInstance.methods.stake(stakeAmount).send();
                await stakeOperation.confirmation();

                delegateOperation = await delegationInstance.methods.delegateToSatellite(alice.pkh, eve.pkh).send();
                await delegateOperation.confirmation();

                // Final values
                delegationStorage           = await delegationInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                
                const stakeRecord           = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
                const delegateRecord        = await delegationStorage.delegateLedger.get(alice.pkh);
                const satelliteRecord       = await delegationStorage.satelliteLedger.get(eve.pkh);
                
                assert.strictEqual(delegateRecord.satelliteAddress, eve.pkh)
                assert.equal(satelliteRecord.totalDelegatedAmount.toNumber(), stakeRecord.balance.toNumber())

                // Delegate try to register
                registerAsSatelliteOperation = delegationInstance.methods.registerAsSatellite(
                    mockSatelliteData.alice.name, 
                    mockSatelliteData.alice.desc, 
                    mockSatelliteData.alice.image, 
                    mockSatelliteData.alice.website,
                    mockSatelliteData.alice.satelliteFee
                );
                await chai.expect(registerAsSatelliteOperation.send()).to.be.rejected;

                // Unregister and undelegate to reset storage
                undelegateOperation = await delegationInstance.methods.undelegateFromSatellite(alice.pkh).send()
                await undelegateOperation.confirmation()

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('User should not be able to call this entrypoint if it is paused', async () => {
            try{

                // Initial Values
                await helperFunctions.signerFactory(tezos, bob.sk)
                delegationStorage       = await delegationInstance.storage();
                
                const isPausedStart          = delegationStorage.breakGlassConfig.registerAsSatelliteIsPaused

                // Operation
                togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("registerAsSatellite", true).send();
                await togglePauseOperation.confirmation();

                // Final values
                delegationStorage       = await delegationInstance.storage();
                const isPausedEnd       = delegationStorage.breakGlassConfig.registerAsSatelliteIsPaused

                await helperFunctions.signerFactory(tezos, eve.sk)
                registerAsSatelliteOperation = delegationInstance.methods.registerAsSatellite(
                    mockSatelliteData.eve.name, 
                    mockSatelliteData.eve.desc, 
                    mockSatelliteData.eve.image, 
                    mockSatelliteData.eve.website,
                    mockSatelliteData.eve.satelliteFee
                );
                await chai.expect(registerAsSatelliteOperation.send()).to.be.rejected;

                // Reset admin
                await helperFunctions.signerFactory(tezos, bob.sk)
                togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("registerAsSatellite", false).send();
                await togglePauseOperation.confirmation();

                // Assertions
                assert.equal(isPausedStart, false);
                assert.equal(isPausedEnd, true);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('User should not be able to call this entrypoint if the doorman contract is not referenced in the generalContracts map', async () => {
            try{

                // Update generalContracts
                await helperFunctions.signerFactory(tezos, bob.sk)
                var updateOperation = await governanceInstance.methods.updateGeneralContracts("doorman", contractDeployments.doorman.address).send()
                await updateOperation.confirmation();

                // init values
                await helperFunctions.signerFactory(tezos, eve.sk)

                // registers as a satellite
                registerAsSatelliteOperation = delegationInstance.methods.registerAsSatellite(
                    mockSatelliteData.eve.name, 
                    mockSatelliteData.eve.desc, 
                    mockSatelliteData.eve.image, 
                    mockSatelliteData.eve.website,
                    mockSatelliteData.eve.satelliteFee
                );
                await chai.expect(registerAsSatelliteOperation.send()).to.be.rejected;

                // Reset generalContracts
                await helperFunctions.signerFactory(tezos, bob.sk)
                updateOperation = await governanceInstance.methods.updateGeneralContracts("doorman", contractDeployments.doorman.address).send()
                await updateOperation.confirmation();
                
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('User should not be able to call this entrypoint if the satellite already exists', async () => {
            try{
                
                // init values
                const userStake               = MVK(100);

                // update operators operation for user
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, eve.pkh, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();

                // Eve stake 100 MVK tokens
                stakeOperation = await doormanInstance.methods.stake(userStake).send();
                await stakeOperation.confirmation();

                // User registers as a satellite again
                registerAsSatelliteOperation = delegationInstance.methods.registerAsSatellite(
                    mockSatelliteData.eve.name, 
                    mockSatelliteData.eve.desc, 
                    mockSatelliteData.eve.image, 
                    mockSatelliteData.eve.website,
                    mockSatelliteData.eve.satelliteFee
                );
                await chai.expect(registerAsSatelliteOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('User should not be able to call this entrypoint if it doesn’t have the minimum SMVK requirement', async () => {
            try{

                // Operation
                await helperFunctions.signerFactory(tezos, bob.sk)
                var updateConfigOperation = await delegationInstance.methods.updateConfig(MVK(130),"configMinimumStakedMvkBalance").send();
                await updateConfigOperation.confirmation();

                // init values
                await helperFunctions.signerFactory(tezos, mallory.sk)
                const userStake               = MVK(1);

                // update operators operation for user
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, mallory.pkh, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();

                // user stake 100 MVK tokens
                stakeOperation = await doormanInstance.methods.stake(userStake).send();
                await stakeOperation.confirmation();

                // User registers as a satellite again
                registerAsSatelliteOperation = delegationInstance.methods.registerAsSatellite(
                    mockSatelliteData.eve.name, 
                    mockSatelliteData.eve.desc, 
                    mockSatelliteData.eve.image, 
                    mockSatelliteData.eve.website,
                    mockSatelliteData.eve.satelliteFee
                );
                await chai.expect(registerAsSatelliteOperation.send()).to.be.rejected;

                // Reset
                await helperFunctions.signerFactory(tezos, bob.sk)
                updateConfigOperation = await delegationInstance.methods.updateConfig(MVK(0.5),"configMinimumStakedMvkBalance").send();
                await updateConfigOperation.confirmation();

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    });

    describe("%unregisterAsSatellite", async () => {

        before("Set new satellite as Alice", async () => {
            // init values
            await helperFunctions.signerFactory(tezos, alice.sk)
            const userStake               = MVK(100);
            
            // update operators operation for user
            updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, alice.pkh, doormanAddress, tokenId);
            await updateOperatorsOperation.confirmation();

            // Alice stake 100 MVK tokens
            stakeOperation = await doormanInstance.methods.stake(userStake).send();
            await stakeOperation.confirmation();

            // Alice registers as a satellite
            registerAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite(
                mockSatelliteData.alice.name, 
                mockSatelliteData.alice.desc, 
                mockSatelliteData.alice.image, 
                mockSatelliteData.alice.website,
                mockSatelliteData.alice.satelliteFee
            ).send();
            await registerAsSatelliteOperation.confirmation();
        })

        beforeEach("Set signer to satellite", async () => {
            await helperFunctions.signerFactory(tezos, alice.sk)
        });

        it('Satellite should be able to call this entrypoint and unregister', async () => {
            try{

                // Unregisters as a satellite
                unregisterAsSatelliteOperation = await delegationInstance.methods.unregisterAsSatellite(alice.pkh).send();
                await unregisterAsSatelliteOperation.confirmation();

                // Check state after unregistering as satellite
                const satelliteExists  = await delegationStorage.satelliteLedger.get(alice.pkh); // should return null or undefined
                assert.equal(satelliteExists, null);

            } catch(e){
                console.dir(e, {depth: 5});
            } 

        });

        it('Non-satellite should not be able to call this entrypoint', async () => {
            try{
                
                // Unregisters as a satellite
                await helperFunctions.signerFactory(tezos, mallory.sk);
                
                unregisterAsSatelliteOperation = delegationInstance.methods.unregisterAsSatellite(mallory.pkh);
                await chai.expect(unregisterAsSatelliteOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('Satellite should not be able to call this entrypoint if the entrypoint is pause', async () => {
            try{

                // Initial Values
                delegationStorage       = await delegationInstance.storage();
                const isPausedStart     = delegationStorage.breakGlassConfig.unregisterAsSatelliteIsPaused

                // Operation
                await helperFunctions.signerFactory(tezos, bob.sk)
                togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("unregisterAsSatellite", true).send();
                await togglePauseOperation.confirmation();

                // Final values
                delegationStorage       = await delegationInstance.storage();
                const isPausedEnd       = delegationStorage.breakGlassConfig.unregisterAsSatelliteIsPaused

                await helperFunctions.signerFactory(tezos, alice.sk)
                unregisterAsSatelliteOperation = delegationInstance.methods.unregisterAsSatellite(alice.pkh);
                await chai.expect(unregisterAsSatelliteOperation.send()).to.be.rejected;

                // Reset admin
                await helperFunctions.signerFactory(tezos, bob.sk)
                togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("unregisterAsSatellite", false).send();
                await togglePauseOperation.confirmation();

                // Assertions
                assert.equal(isPausedStart, false);
                assert.equal(isPausedEnd, true);
                
            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });
    });

    describe("%updateSatelliteRecord", async () => {
        beforeEach("Set signer to satellite", async () => {
            await helperFunctions.signerFactory(tezos, eve.sk)
        });

        it('Satellite should be able to call this entrypoint and update its record', async () => {
            try{
                // init values
                const userStake                 = MVK(100);
                delegationStorage               = await delegationInstance.storage();
                const satelliteRecord           = await delegationStorage.satelliteLedger.get(eve.pkh);
                const satelliteName             = satelliteRecord.name;
                const satelliteDescription      = satelliteRecord.description;
                const satelliteWebsite          = satelliteRecord.website;
                const satelliteImage            = satelliteRecord.image;
                const satelliteFee              = satelliteRecord.satelliteFee;


                const updatedSatelliteName           = "Updated Satellite (Eve)";
                const updatedSatelliteDescription    = "Updated Satellite Description (Eve)";
                const updatedSatelliteWebsite        = "https://holderplace.com/300";
                const updatedSatelliteImage          = "https://placeholder.com/300";
                const updatedSatelliteFee            = "500";

                // Eve updates satellite record
                const updateOperation = await delegationInstance.methods.updateSatelliteRecord(
                    updatedSatelliteName, 
                    updatedSatelliteDescription, 
                    updatedSatelliteImage,
                    updatedSatelliteWebsite,
                    updatedSatelliteFee
                ).send();
                await updateOperation.confirmation();

                // Check state after registering as satellite
                delegationStorage               = await delegationInstance.storage();
                const updatedSatelliteRecord    = await delegationStorage.satelliteLedger.get(eve.pkh);
                
                // Bob's satellite details - check that record is updated
                assert.strictEqual(updatedSatelliteRecord.name,             updatedSatelliteName);
                assert.strictEqual(updatedSatelliteRecord.description,      updatedSatelliteDescription);
                assert.strictEqual(updatedSatelliteRecord.website,          updatedSatelliteWebsite);
                assert.equal(updatedSatelliteRecord.satelliteFee,           updatedSatelliteFee);
                assert.strictEqual(updatedSatelliteRecord.image,            updatedSatelliteImage);

                // Check that updated record is not equal to old record
                assert.notStrictEqual(updatedSatelliteRecord.name,          satelliteName);
                assert.notStrictEqual(updatedSatelliteRecord.description,   satelliteDescription);
                assert.notStrictEqual(updatedSatelliteRecord.website,       satelliteWebsite);
                assert.notEqual(updatedSatelliteRecord.satelliteFee,        satelliteFee);
                assert.strictEqual(updatedSatelliteRecord.image,            satelliteImage);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Non-satellite should not be able to call this entrypoint', async () => {
            try{

                // init values
                await helperFunctions.signerFactory(tezos, mallory.sk);

                // Non-user tries to update satellite record
                await chai.expect(delegationInstance.methods.updateSatelliteRecord(
                        mockSatelliteData.eve.name, 
                        mockSatelliteData.eve.desc, 
                        mockSatelliteData.eve.image, 
                        mockSatelliteData.eve.website,
                        mockSatelliteData.eve.satelliteFee
                ).send()
                ).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Satellite should not be able to call this entrypoint if the entrypoint is pause', async () => {
            try{

                // Initial Values
                delegationStorage       = await delegationInstance.storage();
                const isPausedStart     = delegationStorage.breakGlassConfig.updateSatelliteRecordIsPaused

                // Operation
                await helperFunctions.signerFactory(tezos, bob.sk)
                togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("updateSatelliteRecord", true).send();
                await togglePauseOperation.confirmation();

                // Final values
                delegationStorage       = await delegationInstance.storage();
                const isPausedEnd       = delegationStorage.breakGlassConfig.updateSatelliteRecordIsPaused

                await helperFunctions.signerFactory(tezos, eve.sk)
                await chai.expect(delegationInstance.methods.updateSatelliteRecord(
                    mockSatelliteData.eve.name, 
                    mockSatelliteData.eve.desc, 
                    mockSatelliteData.eve.image, 
                    mockSatelliteData.eve.website,
                    mockSatelliteData.eve.satelliteFee
                ).send()
                ).to.be.rejected;

                // Reset admin
                await helperFunctions.signerFactory(tezos, bob.sk)
                togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("updateSatelliteRecord", false).send();
                await togglePauseOperation.confirmation();

                // Assertions
                assert.equal(isPausedStart, false);
                assert.equal(isPausedEnd,   true);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    });

    describe("%delegateToSatellite", async () => {

        beforeEach("Set signer to user", async () => {
            await helperFunctions.signerFactory(tezos, alice.sk)
        });

        it('Satellite should not be able to call this entrypoint', async () => {
            try{

                // init values
                await helperFunctions.signerFactory(tezos, eve.sk);
                const stakeAmount   = MVK(10);

                // update operators operation for user
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, eve.pkh, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();
    
                // stake operation
                stakeOperation = await doormanInstance.methods.stake(stakeAmount).send();
                await stakeOperation.confirmation();

                // delegate operation
                delegateOperation = delegationInstance.methods.delegateToSatellite(eve.pkh, eve.pkh);
                await chai.expect(delegateOperation.send()).to.be.rejected;

                // Final values
                delegationStorage   = await delegationInstance.storage();

                const delegateRecord     = await delegationStorage.delegateLedger.get(eve.pkh)
                assert.strictEqual(delegateRecord, undefined)

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('User should not be able to call this entrypoint if it is paused', async () => {
            try{

                // Initial Values
                delegationStorage       = await delegationInstance.storage();
                const isPausedStart     = delegationStorage.breakGlassConfig.delegateToSatelliteIsPaused
                const stakeAmount       = MVK(10);

                // Operation
                await helperFunctions.signerFactory(tezos, bob.sk)

                // update operators operation for user
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, bob.pkh, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();
    
                stakeOperation = await doormanInstance.methods.stake(stakeAmount).send();
                await stakeOperation.confirmation();
                
                // Operation
                togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("delegateToSatellite", true).send();
                await togglePauseOperation.confirmation();

                // Final values
                delegationStorage       = await delegationInstance.storage();
                const isPausedEnd       = delegationStorage.breakGlassConfig.delegateToSatelliteIsPaused

                // delegate operation
                delegateOperation = delegationInstance.methods.delegateToSatellite(bob.pkh, eve.pkh);
                await chai.expect(delegateOperation.send()).to.be.rejected;

                // Reset admin
                togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("delegateToSatellite", false).send();
                await togglePauseOperation.confirmation();

                // Assertions
                assert.equal(isPausedStart, false);
                assert.equal(isPausedEnd, true);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('User should be able to call this entrypoint and delegate his SMVK to a provided satellite', async () => {
            try{
                // Initial Values
                delegationStorage       = await delegationInstance.storage();
                const stakeAmount       = MVK(10);

                // update operators operation for user
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, alice.pkh, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();

                // stake operation
                stakeOperation = await doormanInstance.methods.stake(stakeAmount).send();
                await stakeOperation.confirmation();

                // delegate operation
                delegateOperation   = await delegationInstance.methods.delegateToSatellite(alice.pkh, eve.pkh).send();
                await delegateOperation.confirmation();

                // Final values
                delegationStorage           = await delegationInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                const stakeRecord           = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
                const delegateRecord        = await delegationStorage.delegateLedger.get(alice.pkh);
                const satelliteRecord       = await delegationStorage.satelliteLedger.get(eve.pkh);
                
                assert.strictEqual(delegateRecord.satelliteAddress, eve.pkh)
                assert.equal(satelliteRecord.totalDelegatedAmount.toNumber(), stakeRecord.balance.toNumber())

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('User should not be able to delegate to the same satellite twice', async () => {
            try{
                
                delegateOperation = delegationInstance.methods.delegateToSatellite(alice.pkh, eve.pkh);
                await chai.expect(delegateOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('User should not be able to call the entrypoint if the contract doesn’t have the doorman contract in the generalContracts map', async () => {
            try{

                // Update generalContracts
                await helperFunctions.signerFactory(tezos, bob.sk)
                var updateOperation = await governanceInstance.methods.updateGeneralContracts("doorman", contractDeployments.doorman.address).send()
                await updateOperation.confirmation();

                // Initial values
                delegateOperation = delegationInstance.methods.delegateToSatellite(bob.pkh, eve.pkh);
                await chai.expect(delegateOperation.send()).to.be.rejected;

                // Reset operation
                await helperFunctions.signerFactory(tezos, bob.sk)
                var updateOperation = await governanceInstance.methods.updateGeneralContracts("doorman", contractDeployments.doorman.address).send()
                await updateOperation.confirmation();

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('User should not be able to call this entrypoint if the provided satellite does not exist', async () => {
            try{

                // Initial values
                const userStake = MVK(10);

                // update operators operation for user
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, alice.pkh, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();

                stakeOperation = await doormanInstance.methods.stake(userStake).send();
                await stakeOperation.confirmation();

                delegateOperation = delegationInstance.methods.delegateToSatellite(alice.pkh, mallory.pkh);
                await chai.expect(delegateOperation.send()).to.be.rejected;

                // Final values
                delegationStorage           = await delegationInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                const satelliteRecord       = await delegationStorage.satelliteLedger.get(mallory.pkh);
                
                assert.strictEqual(satelliteRecord, undefined);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('User should be able to call this entrypoint and redelegate his SMVK if he wants to change satellite', async () => {
            try{

                // Register a new satellite
                await helperFunctions.signerFactory(tezos, oscar.sk);

                // init values
                const userStake               = MVK(100);

                // update operators operation for user
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, oscar.pkh, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();

                // Oscar stake 100 MVK tokens
                stakeOperation = await doormanInstance.methods.stake(userStake).send();
                await stakeOperation.confirmation();

                // Check state before registering as satellite
                const beforeDelegationLedger  = await delegationStorage.satelliteLedger.get(oscar.pkh);        // should return null or undefined
                const beforeStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(oscar.pkh);    // 100 MVK
                
                assert.equal(beforeDelegationLedger,       null);
                assert.equal(beforeStakedBalance.balance,  userStake);

                // Registers as a satellite
                registerAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite(
                    mockSatelliteData.oscar.name, 
                    mockSatelliteData.oscar.desc, 
                    mockSatelliteData.oscar.image, 
                    mockSatelliteData.oscar.website,
                    mockSatelliteData.oscar.satelliteFee
                ).send();
                await registerAsSatelliteOperation.confirmation();

                // Check state after registering as satellite
                delegationStorage            = await delegationInstance.storage();
                const afterDelegationLedger  = await delegationStorage.satelliteLedger.get(oscar.pkh);         // should return bob's satellite record
                const afterStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(oscar.pkh);     // 100 MVK
                
                // Orscar's satellite details
                assert.equal(afterDelegationLedger.name,                   mockSatelliteData.oscar.name);
                assert.equal(afterDelegationLedger.description,            mockSatelliteData.oscar.desc);
                assert.equal(afterDelegationLedger.website,                mockSatelliteData.oscar.website);
                assert.equal(afterDelegationLedger.stakedMvkBalance,       userStake);
                assert.equal(afterDelegationLedger.satelliteFee,           mockSatelliteData.oscar.satelliteFee);
                assert.equal(afterDelegationLedger.totalDelegatedAmount,   0);
                assert.equal(afterDelegationLedger.status,                 "ACTIVE");

                // Oscar's staked balance remains the same
                assert.equal(afterStakedBalance.balance, userStake);

                // Alice redelegate to Oscar
                await helperFunctions.signerFactory(tezos, alice.sk)
                delegationStorage               = await delegationInstance.storage();
                
                const previousDelegation        = await delegationStorage.delegateLedger.get(alice.pkh);
                const userDelegation            = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
                const previousSatellite         = previousDelegation.satelliteAddress;

                const satelliteRecord           = await delegationStorage.satelliteLedger.get(previousSatellite);
                const previousDelegatedAmount   = satelliteRecord.totalDelegatedAmount;

                const redelegateOperation       = await delegationInstance.methods.delegateToSatellite(alice.pkh, oscar.pkh).send();
                await redelegateOperation.confirmation();
                
                delegationStorage               = await delegationInstance.storage();
                const newSatelliteRecord        = await delegationStorage.satelliteLedger.get(oscar.pkh);
                const updatedOldSatelliteLedger = await delegationStorage.satelliteLedger.get(previousSatellite);
                const updatedOldDelegatedAmount = updatedOldSatelliteLedger.totalDelegatedAmount;
                const newDelegation             = await delegationStorage.delegateLedger.get(alice.pkh);

                assert.strictEqual(newDelegation.satelliteAddress, oscar.pkh)
                assert.equal(updatedOldDelegatedAmount.toNumber(), previousDelegatedAmount.toNumber() - userDelegation.balance.toNumber());
                assert.equal(newSatelliteRecord.totalDelegatedAmount.toNumber(), userDelegation.balance.toNumber());

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    })

    describe("%undelegateFromSatellite", async () => {

        beforeEach("Set signer to user", async () => {
            await helperFunctions.signerFactory(tezos, alice.sk)
        });

        it('Satellite should not be able to call this entrypoint', async () => {
            try{

                // init values
                await helperFunctions.signerFactory(tezos, eve.sk);

                // Operation
                undelegateOperation = delegationInstance.methods.undelegateFromSatellite(eve.pkh);
                await chai.expect(undelegateOperation.send()).to.be.rejected;

                // Final values
                delegationStorage           = await delegationInstance.storage();
                const delegateRecord        = await delegationStorage.delegateLedger.get(eve.pkh)

                assert.strictEqual(delegateRecord, undefined)

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('User should not be able to call this entrypoint if it is pause', async () => {
            try{

                // Initial Value
                await helperFunctions.signerFactory(tezos, bob.sk)
                delegationStorage       = await delegationInstance.storage();
                const isPausedStart     = delegationStorage.breakGlassConfig.undelegateFromSatelliteIsPaused

                // Operation
                togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("undelegateFromSatellite", true).send();
                await togglePauseOperation.confirmation();

                // Final values
                delegationStorage       = await delegationInstance.storage();
                const isPausedEnd       = delegationStorage.breakGlassConfig.undelegateFromSatelliteIsPaused

                await helperFunctions.signerFactory(tezos, eve.sk);
                undelegateOperation = delegationInstance.methods.undelegateFromSatellite(eve.pkh);
                await chai.expect(undelegateOperation.send()).to.be.rejected;

                // Reset admin
                await helperFunctions.signerFactory(tezos, bob.sk)
                togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("undelegateFromSatellite", false).send();
                await togglePauseOperation.confirmation();

                // Assertions
                assert.equal(isPausedStart, false);
                assert.equal(isPausedEnd, true);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('User should not be able to undelegate if he never delegated before', async () => {
            try{

                // Register a new user
                await helperFunctions.signerFactory(tezos, mallory.sk)
                delegationStorage       = await delegationInstance.storage();
                const stakeAmount       = MVK(10);

                // update operators operation for user
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, mallory.pkh, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();
    
                stakeOperation = await doormanInstance.methods.stake(stakeAmount).send();
                await stakeOperation.confirmation();

                undelegateOperation = await delegationInstance.methods.undelegateFromSatellite(mallory.pkh);
                await chai.expect(undelegateOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('User should not be able to call this entrypoint if the provided satellite does not exist', async () => {
            try{
                
                delegateOperation = await delegationInstance.methods.delegateFromSatellite(alice.pkh, bob.pkh);
                await chai.expect(delegateOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('User should not be able to call the entrypoint if the contract doesn’t have the doorman contract in the generalContracts map', async () => {
            try{

                // Update generalContracts
                await helperFunctions.signerFactory(tezos, bob.sk)
                var updateOperation = await governanceInstance.methods.updateGeneralContracts("doorman", contractDeployments.doorman.address).send()
                await updateOperation.confirmation();

                // Initial values
                await helperFunctions.signerFactory(tezos, alice.sk);
                delegateOperation = delegationInstance.methods.delegateFromSatellite(alice.pkh, eve.pkh);
                await chai.expect(delegateOperation.send()).to.be.rejected;

                // Reset operation
                await helperFunctions.signerFactory(tezos, bob.sk)
                var updateOperation = await governanceInstance.methods.updateGeneralContracts("doorman", contractDeployments.doorman.address).send()
                await updateOperation.confirmation();

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('User should be able to call this entrypoint and undelegate his SMVK from a provided satellite', async () => {
            try{

                // Register a new user
                delegationStorage           = await delegationInstance.storage();
                const initSatelliteRecord   = await delegationStorage.satelliteLedger.get(oscar.pkh);

                // Operation
                const delegationOperation   = await delegationInstance.methods.undelegateFromSatellite(alice.pkh).send();
                await delegationOperation.confirmation();

                // Final Values
                delegationStorage       = await delegationInstance.storage();
                const satelliteRecord   = await delegationStorage.satelliteLedger.get(oscar.pkh);
                const delegateRecord    = await delegationStorage.delegateLedger.get(alice.pkh);

                // Assertions
                assert.strictEqual(delegateRecord, undefined);
                assert.notEqual(initSatelliteRecord.totalDelegatedAmount, satelliteRecord.totalDelegatedAmount);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        })

        it('User should be able to call this entrypoint and undelegate his SMVK from a satellite even if the satellite re-registered', async () => {
            try{

                // Init operation
                const delegationOperation   = await delegationInstance.methods.delegateToSatellite(alice.pkh, oscar.pkh).send();
                await delegationOperation.confirmation();
                
                // Init values
                delegationStorage           = await delegationInstance.storage();
                const initSatelliteRecord   = await delegationStorage.satelliteLedger.get(oscar.pkh);
                const initDelegateRecord    = await delegationStorage.delegateLedger.get(alice.pkh);
                const satelliteName         = "New Satellite (Oscar)";
                const satelliteDescription  = "New Satellite Description (Oscar)";
                const satelliteWebsite      = "https://placeholder.com/300";
                const satelliteImage        = "https://placeholder.com/300";
                const satelliteFee          = "800";

                // Re-register operation
                await helperFunctions.signerFactory(tezos, oscar.sk)
                const unregisterOperation           = await delegationInstance.methods.unregisterAsSatellite(oscar.pkh).send();
                await unregisterOperation.confirmation();
                const registerAsSatelliteOperation  = await delegationInstance.methods
                    .registerAsSatellite(
                        satelliteName, 
                        satelliteDescription, 
                        satelliteImage,
                        satelliteWebsite,
                        satelliteFee
                    ).send();
                await registerAsSatelliteOperation.confirmation();
                
                // Mid values
                delegationStorage           = await delegationInstance.storage();
                const midSatelliteRecord    = await delegationStorage.satelliteLedger.get(oscar.pkh);
                const midDelegateRecord     = await delegationStorage.delegateLedger.get(alice.pkh);

                // Undelegate operation
                await helperFunctions.signerFactory(tezos, alice.sk)
                const undelegateOperation   = await delegationInstance.methods.undelegateFromSatellite(alice.pkh).send();
                await undelegateOperation.confirmation();

                // Final Values
                delegationStorage           = await delegationInstance.storage();
                const finalSatelliteRecord  = await delegationStorage.satelliteLedger.get(oscar.pkh);
                const finalDelegateRecord   = await delegationStorage.delegateLedger.get(alice.pkh);

                // Assertions
                assert.notStrictEqual(initDelegateRecord, undefined);
                assert.notStrictEqual(midDelegateRecord, undefined);
                assert.strictEqual(finalDelegateRecord, undefined);
                assert.strictEqual(initSatelliteRecord.registeredDateTime, initDelegateRecord.satelliteRegisteredDateTime);
                assert.notStrictEqual(midSatelliteRecord.registeredDateTime, initDelegateRecord.satelliteRegisteredDateTime);
                assert.strictEqual(midSatelliteRecord.registeredDateTime, finalSatelliteRecord.registeredDateTime);
                assert.notEqual(initSatelliteRecord.totalDelegatedAmount.toNumber(), 0);
                assert.equal(midSatelliteRecord.totalDelegatedAmount.toNumber(), 0);
                assert.equal(finalSatelliteRecord.totalDelegatedAmount.toNumber(), 0);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        })

        it('User should be able to call this entrypoint and undelegate his SMVK from a satellite even if the satellite re-registered during an %onStakeChange call', async () => {
            try{

                // Init operation
                const delegationOperation   = await delegationInstance.methods.delegateToSatellite(alice.pkh, oscar.pkh).send();
                await delegationOperation.confirmation();
                
                // Init values
                delegationStorage           = await delegationInstance.storage();
                const initSatelliteRecord   = await delegationStorage.satelliteLedger.get(oscar.pkh);
                const initDelegateRecord    = await delegationStorage.delegateLedger.get(alice.pkh);
                const satelliteName         = "New Satellite (Oscar)";
                const satelliteDescription  = "New Satellite Description (Oscar)";
                const satelliteWebsite      = "https://placeholder.com/300";
                const satelliteImage        = "https://placeholder.com/300";
                const satelliteFee          = "800";
                const stakeAmount           = MVK(2);

                // Re-register operation
                await helperFunctions.signerFactory(tezos, oscar.sk)
                const unregisterOperation           = await delegationInstance.methods.unregisterAsSatellite(oscar.pkh).send();
                await unregisterOperation.confirmation();
                const registerAsSatelliteOperation = await delegationInstance.methods
                    .registerAsSatellite(
                        satelliteName, 
                        satelliteDescription, 
                        satelliteImage,
                        satelliteWebsite,
                        satelliteFee
                    ).send();
                await registerAsSatelliteOperation.confirmation();
                
                // Mid values
                delegationStorage           = await delegationInstance.storage();
                const midSatelliteRecord    = await delegationStorage.satelliteLedger.get(oscar.pkh);
                const midDelegateRecord     = await delegationStorage.delegateLedger.get(alice.pkh);

                // Stake operation
                await helperFunctions.signerFactory(tezos, alice.sk)
                const stakeOperation        = await doormanInstance.methods.stake(stakeAmount).send();
                await stakeOperation.confirmation();

                // Final Values
                delegationStorage           = await delegationInstance.storage();
                const finalSatelliteRecord  = await delegationStorage.satelliteLedger.get(oscar.pkh);
                const finalDelegateRecord   = await delegationStorage.delegateLedger.get(alice.pkh);

                // Assertions
                assert.notStrictEqual(initDelegateRecord, undefined);
                assert.notStrictEqual(midDelegateRecord, undefined);
                assert.strictEqual(finalDelegateRecord, undefined);
                assert.strictEqual(initSatelliteRecord.registeredDateTime, initDelegateRecord.satelliteRegisteredDateTime);
                assert.notStrictEqual(midSatelliteRecord.registeredDateTime, initDelegateRecord.satelliteRegisteredDateTime);
                assert.strictEqual(midSatelliteRecord.registeredDateTime, finalSatelliteRecord.registeredDateTime);
                assert.notEqual(initSatelliteRecord.totalDelegatedAmount.toNumber(), 0);
                assert.equal(midSatelliteRecord.totalDelegatedAmount.toNumber(), 0);
                assert.equal(finalSatelliteRecord.totalDelegatedAmount.toNumber(), 0);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        })
    })

    describe("%togglePauseEntrypoint", async () => {
        
        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk)
        });
        it('Admin should be able to call the entrypoint and pause or unpause the delegateToSatellite entrypoint', async () => {
            try{

                // Initial Values
                delegationStorage       = await delegationInstance.storage();
                const isPausedStart     = delegationStorage.breakGlassConfig.delegateToSatelliteIsPaused
                const stakeAmount   = MVK(10);

                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, bob.pkh, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();
    
                stakeOperation = await doormanInstance.methods.stake(stakeAmount).send();
                await stakeOperation.confirmation();

                // Operation
                togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("delegateToSatellite", true).send();
                await togglePauseOperation.confirmation();

                // Final values
                delegationStorage       = await delegationInstance.storage();
                const isPausedEnd       = delegationStorage.breakGlassConfig.delegateToSatelliteIsPaused

                delegateOperation = delegationInstance.methods.delegateToSatellite(bob.pkh, eve.pkh);
                await chai.expect(delegateOperation.send()).to.be.rejected;

                // Reset admin
                togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("delegateToSatellite", false).send();
                await togglePauseOperation.confirmation();

                // Assertions
                assert.equal(isPausedStart, false);
                assert.equal(isPausedEnd, true);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
        
        it('Admin should be able to call the entrypoint and pause or unpause the delegateToSatellite entrypoint', async () => {
            try{

                // Initial Values
                delegationStorage       = await delegationInstance.storage();
                const isPausedStart     = delegationStorage.breakGlassConfig.undelegateFromSatelliteIsPaused

                // Operation
                togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("undelegateFromSatellite", true).send();
                await togglePauseOperation.confirmation();

                // Final values
                delegationStorage       = await delegationInstance.storage();
                const isPausedEnd       = delegationStorage.breakGlassConfig.undelegateFromSatelliteIsPaused

                undelegateOperation = delegationInstance.methods.undelegateFromSatellite(bob.pkh);
                await chai.expect(undelegateOperation.send()).to.be.rejected;

                // Reset admin
                togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("undelegateFromSatellite", false).send();
                await togglePauseOperation.confirmation();

                // Assertions
                assert.equal(isPausedStart, false);
                assert.equal(isPausedEnd, true);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
        
        it('Admin should be able to call the entrypoint and pause or unpause the registerSatellite entrypoint', async () => {
            try{

                // Initial Values
                delegationStorage       = await delegationInstance.storage();
                const isPausedStart     = delegationStorage.breakGlassConfig.registerAsSatelliteIsPaused

                // Operation
                togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("registerAsSatellite", true).send();
                await togglePauseOperation.confirmation();

                // Final values
                delegationStorage       = await delegationInstance.storage();
                const isPausedEnd       = delegationStorage.breakGlassConfig.registerAsSatelliteIsPaused

                registerAsSatelliteOperation = delegationInstance.methods.registerAsSatellite(
                    mockSatelliteData.eve.name, 
                    mockSatelliteData.eve.desc, 
                    mockSatelliteData.eve.image, 
                    mockSatelliteData.eve.website,
                    mockSatelliteData.eve.satelliteFee
                )
                await chai.expect(registerAsSatelliteOperation.send()).to.be.rejected;

                // Reset admin
                togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("registerAsSatellite", false).send();
                await togglePauseOperation.confirmation();

                // Assertions
                assert.equal(isPausedStart, false);
                assert.equal(isPausedEnd, true);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('Admin should be able to call the entrypoint and pause or unpause the registerSatellite entrypoint', async () => {
            try{

                // Initial Values
                delegationStorage       = await delegationInstance.storage();
                const isPausedStart     = delegationStorage.breakGlassConfig.unregisterAsSatelliteIsPaused

                // Operation
                togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("unregisterAsSatellite", true).send();
                await togglePauseOperation.confirmation();

                // Final values
                delegationStorage       = await delegationInstance.storage();
                const isPausedEnd       = delegationStorage.breakGlassConfig.unregisterAsSatelliteIsPaused

                unregisterAsSatelliteOperation = delegationInstance.methods.unregisterAsSatellite(bob.pkh);
                await chai.expect(unregisterAsSatelliteOperation.send()).to.be.rejected;

                // Reset admin
                togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("unregisterAsSatellite", false).send();
                await togglePauseOperation.confirmation();

                // Assertions
                assert.equal(isPausedStart, false);
                assert.equal(isPausedEnd, true);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
        
        it('Admin should be able to call the entrypoint and pause or unpause the updateSatellite entrypoint', async () => {
            try{
                // Initial Values
                delegationStorage       = await delegationInstance.storage();
                const isPausedStart     = delegationStorage.breakGlassConfig.updateSatelliteRecordIsPaused

                // Operation
                togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("updateSatelliteRecord", true).send();
                await togglePauseOperation.confirmation();

                // Final values
                delegationStorage       = await delegationInstance.storage();
                const isPausedEnd       = delegationStorage.breakGlassConfig.updateSatelliteRecordIsPaused

                await chai.expect(delegationInstance.methods
                    .updateSatelliteRecord(
                        mockSatelliteData.eve.name, 
                        mockSatelliteData.eve.desc, 
                        mockSatelliteData.eve.image, 
                        mockSatelliteData.eve.website,
                        mockSatelliteData.eve.satelliteFee
                    ).send()
                ).to.be.rejected;

                // Reset admin
                togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("updateSatelliteRecord", false).send();
                await togglePauseOperation.confirmation();

                // Assertions
                assert.equal(isPausedStart, false);
                assert.equal(isPausedEnd, true);
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
        
        it('Non-admin should not be able to call the entrypoint', async () => {
            try{

                await helperFunctions.signerFactory(tezos, alice.sk);
                togglePauseOperation = delegationInstance.methods.togglePauseEntrypoint("updateSatelliteRecord", true);
                await chai.expect(togglePauseOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    })

    describe("%pauseAll", async () => {

        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk)
        });

        it('Admin should be able to call the entrypoint and pause all entrypoints in the contract', async () => {
            try{
                // Initial Values
                delegationStorage       = await delegationInstance.storage();
                for (let [key, value] of Object.entries(delegationStorage.breakGlassConfig)){
                    assert.equal(value, false);
                }

                // pause all operation
                pauseAllOperation = await delegationInstance.methods.pauseAll().send();
                await pauseAllOperation.confirmation();

                // Final values
                delegationStorage       = await delegationInstance.storage();
                for (let [key, value] of Object.entries(delegationStorage.breakGlassConfig)){
                    assert.equal(value, true);
                }

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
        it('Non-admin should not be able to call the entrypoint', async () => {
            try{
                
                await helperFunctions.signerFactory(tezos, alice.sk);

                // pause all operation
                pauseAllOperation = delegationInstance.methods.pauseAll();
                await chai.expect(pauseAllOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    })

    describe("%unpauseAll", async () => {

        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk)
        });

        it('Admin should be able to call the entrypoint and unpause all entrypoints in the contract', async () => {
            try{

                // Initial Values
                delegationStorage = await delegationInstance.storage();
                for (let [key, value] of Object.entries(delegationStorage.breakGlassConfig)){
                    assert.equal(value, true);
                }

                // unpause all operation
                unpauseAllOperation = await delegationInstance.methods.unpauseAll().send();
                await unpauseAllOperation.confirmation();

                // Final values
                delegationStorage = await delegationInstance.storage();
                for (let [key, value] of Object.entries(delegationStorage.breakGlassConfig)){
                    assert.equal(value, false);
                }

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
        it('Non-admin should not be able to call the entrypoint', async () => {
            try{

                await helperFunctions.signerFactory(tezos, alice.sk);

                // unpause all operation
                unpauseAllOperation = delegationInstance.methods.unpauseAll();
                await chai.expect(unpauseAllOperation.send()).to.be.rejected;

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

                updateWhitelistContractsOperation = await delegationInstance.methods.updateWhitelistContracts(contractMapKey, alice.pkh)
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

                updateGeneralContractsOperation = await delegationInstance.methods.updateGeneralContracts(contractMapKey, alice.pkh)
                await chai.expect(updateGeneralContractsOperation.send()).to.be.rejected;

                delegationStorage       = await delegationInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(delegationStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'mallory (key) should not be in the General Contracts map');

            } catch (e) {
                console.log(e)
            }
        })

        it('%mistakenTransfer         - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // Initial values
                const tokenAmount = 10;

                // Mistaken Operation - send 10 MavrykFa2Tokens to Delegation Contract
                transferOperation = await helperFunctions.fa2Transfer(mavrykFa2TokenInstance, mallory.pkh, delegationAddress, tokenId, tokenAmount);
                await transferOperation.confirmation();

                // mistaken transfer operation
                const mistakenTransferOperation = await delegationInstance.methods.mistakenTransfer(
                [
                    {
                        "to_"    : mallory.pkh,
                        "token"  : {
                            "fa2" : {
                                "tokenContractAddress": contractDeployments.mavrykFa2Token.address,
                                "tokenId" : 0
                            }
                        },
                        "amount" : tokenAmount
                    }
                ]);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch (e) {
                console.log(e)
            }
        })

        it("%pauseAll                 - non-admin (mallory) should not be able to call this entrypoint", async() => {
            try{

                pauseAllOperation = delegationInstance.methods.pauseAll(); 
                await chai.expect(pauseAllOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%unpauseAll               - non-admin (mallory) should not be able to call this entrypoint", async() => {
            try{

                unpauseAllOperation = delegationInstance.methods.unpauseAll(); 
                await chai.expect(unpauseAllOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%togglePauseEntrypoint    - non-admin (mallory) should not be able to call this entrypoint", async() => {
            try{
                
                // pause operations

                pauseOperation = delegationInstance.methods.togglePauseEntrypoint("delegateToSatellite", true); 
                await chai.expect(pauseOperation.send()).to.be.rejected;
                
                pauseOperation = delegationInstance.methods.togglePauseEntrypoint("undelegateFromSatellite", true); 
                await chai.expect(pauseOperation.send()).to.be.rejected;

                pauseOperation = delegationInstance.methods.togglePauseEntrypoint("registerAsSatellite", true); 
                await chai.expect(pauseOperation.send()).to.be.rejected;

                pauseOperation = delegationInstance.methods.togglePauseEntrypoint("unregisterAsSatellite", true); 
                await chai.expect(pauseOperation.send()).to.be.rejected;

                pauseOperation = delegationInstance.methods.togglePauseEntrypoint("updateSatelliteRecord", true); 
                await chai.expect(pauseOperation.send()).to.be.rejected;

                pauseOperation = delegationInstance.methods.togglePauseEntrypoint("distributeReward", true); 
                await chai.expect(pauseOperation.send()).to.be.rejected;

                // unpause operations

                unpauseOperation = delegationInstance.methods.togglePauseEntrypoint("delegateToSatellite", false); 
                await chai.expect(unpauseOperation.send()).to.be.rejected;
                
                unpauseOperation = delegationInstance.methods.togglePauseEntrypoint("undelegateFromSatellite", false); 
                await chai.expect(unpauseOperation.send()).to.be.rejected;

                unpauseOperation = delegationInstance.methods.togglePauseEntrypoint("registerAsSatellite", false); 
                await chai.expect(unpauseOperation.send()).to.be.rejected;

                unpauseOperation = delegationInstance.methods.togglePauseEntrypoint("unregisterAsSatellite", false); 
                await chai.expect(unpauseOperation.send()).to.be.rejected;

                unpauseOperation = delegationInstance.methods.togglePauseEntrypoint("updateSatelliteRecord", false); 
                await chai.expect(unpauseOperation.send()).to.be.rejected;

                unpauseOperation = delegationInstance.methods.togglePauseEntrypoint("distributeReward", false); 
                await chai.expect(unpauseOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%setLambda                - non-admin (mallory) should not be able to call this entrypoint", async() => {
            try{

                // random lambda for testing
                const randomLambdaName  = "delegateToSatellite";
                const randomLambdaBytes = "050200000cba0743096500000112075e09650000005a036e036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a0362036203620362036200000000036203620760036803690000000009650000000a0362036203620362036e00000000075e09650000006c09650000000a0362036203620362036200000000036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a036203620362036203620000000003620362076003680369000000000362075e07650765036203620362036c075e076507650368036e0362036e036200000000070702000001770743075e076507650368036e0362036e020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c03200342020000010e037a034c037a07430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700002034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f02000000090743036200810303270200000000072f020000000907430362009c0203270200000000070702000000600743036200808080809d8fc0d0bff2f1b26703420200000047037a034c037a0321052900080570000205290015034b031105710002031605700002033a0322072f020000001307430368010000000844495620627920300327020000000003160707020000001a037a037a03190332072c0200000002032002000000020327034f0707020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c032000808080809d8fc0d0bff2f1b2670342020000092d037a057a000505700005037a034c07430362008f03052100020529000f0529000307430359030a034c03190325072c0200000002032702000000020320053d036d05700002072e02000008a4072e020000007c057000030570000405700005057000060570000705200005072e020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000081c072e0200000044057000030570000405700005057000060570000705200005072e0200000010072e02000000020320020000000203200200000010072e020000000203200200000002032002000007cc072e0200000028057000030570000405700005057000060570000705200005072e02000000020320020000000203200200000798072e0200000774034c032003480521000305210003034c052900050316034c03190328072c020000000002000000090743036200880303270570000205210002034c0321052100030521000205290011034c0329072f020000002005290015074303620000074303620000074303620000074303620000054200050200000004034c03200743036200000521000203160319032a072c020000021c052100020521000407430362008e02057000020529000907430368010000000a64656c65676174696f6e034203420521000b034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f0200000009074303620081030327020000001a072f02000000060743035903030200000008032007430359030a074303620000034c072c020000007303200521000205210004034205210007034c0326052100030521000205290008034205700007034c03260521000205290005034c05290007034b0311052100030316033a0521000b034c0322072f02000000130743036801000000084449562062792030032702000000000316034c0316031202000000060570000603200521000305210003034205210008034c0326052100030521000205700004052900030312055000030571000205210003052100030570000405290005031205500005057100020521000305700002052100030570000403160312031205500001034c05210003034c0570000305290013034b031105500013034c02000000060570000503200521000205290015055000080521000205700002052900110570000205700003034c0346034c0350055000110571000205210003052900070743036200000790010000000c746f74616c5f737570706c790362072f020000000907430362008a01032702000000000521000405290007074303620000037703420790010000000b6765745f62616c616e63650362072f02000000090743036200890103270200000000034c052100090743036200a40105210004033a033a0322072f0200000013074303680100000008444956206279203003270200000000031605210009074303620002033a0312052100090521000a07430362008803033a033a0322072f020000001307430368010000000844495620627920300327020000000003160743036200a401034c0322072f0200000013074303680100000008444956206279203003270200000000031605210004033a05210009052100020322072f0200000013074303680100000008444956206279203003270200000000031605210005034b0311052100060570000a052100040322072f0200000013074303680100000008444956206279203003270200000000031605700007052900130312055000130571000507430362008c0305210004052100070342034205210009034c0326032005700005057000030342052100050570000305700002037a034c0570000305700002034b0311074303620000052100020319032a072c020000003b05210002034c057000030322072f02000000130743036801000000084449562062792030032702000000000316057000020529001503120550001502000000080570000205200002057100030521000405210003034c05290011034c0329072f0200000009074303620089030327020000000003210521000507430362008b03057000020316057000020342034205700007034c03260320032105700004057000020316034b031105500001052100040529000707430362000005700003034205210004037705700002037a057000040655055f0765046e000000062566726f6d5f065f096500000026046e0000000425746f5f04620000000925746f6b656e5f696404620000000725616d6f756e7400000000000000042574787300000009257472616e73666572072f0200000008074303620027032702000000000743036a0000053d0765036e055f096500000006036e0362036200000000053d096500000006036e036203620000000005700004057000050570000705420003031b057000040342031b034d0743036200000521000303160319032a072c02000000440521000405210003034205700005034c032605210003052100020570000403160312055000010571000205210005034c0570000505290013034b031105500013057100030200000006057000040320034c052100040529001505500008034c0521000405700004052900110570000305210005034c0346034c03500550001105710002052100030570000207430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700004034c03260655036e0000000e256f6e5374616b654368616e6765072f02000000090743036200b702032702000000000743036a000005700002034d053d036d034c031b034c031b02000000180570000305700004057000050570000605700007052000060200000036057000030570000405700005057000060570000705200005072e0200000010072e0200000002032002000000020320020000000203200342";

                const setLambdaOperation = delegationInstance.methods.setLambda(randomLambdaName, randomLambdaBytes); 
                await chai.expect(setLambdaOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

    })

});
