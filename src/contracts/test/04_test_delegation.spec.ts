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

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("Test: Delegation Contract", async () => {
    
    // default
    var utils: Utils
    var tezos

    // basic inputs for updating operators
    let doormanAddress
    let tokenId = 0

    // contract instances
    let doormanInstance;
    let delegationInstance;
    let mvkTokenInstance;
    let governanceInstance;

    // contract storages
    let doormanStorage;
    let delegationStorage;
    let mvkTokenStorage;
    let governanceStorage;

    // operations
    let setAdminOperation
    let resetAdminOperation
    let updateOperatorsOperation
    let removeOperatorsOperation
    let stakeOperation
    let unstakeOperation
    let registerAsSatelliteOperation
    let unregisterAsSatelliteOperation
    let delegateOperation
    let undelegateOperation
    let togglePauseOperation
    let pauseAllOperation
    let unpauseAllOperation


    before("setup", async () => {

        utils = new Utils();
        await utils.init(bob.sk);
        tezos = utils.tezos

        doormanAddress  = contractDeployments.doorman.address;
        
        doormanInstance    = await utils.tezos.contract.at(contractDeployments.doorman.address);
        delegationInstance = await utils.tezos.contract.at(contractDeployments.delegation.address);
        mvkTokenInstance   = await utils.tezos.contract.at(contractDeployments.mvkToken.address);
        governanceInstance = await utils.tezos.contract.at(contractDeployments.governance.address);
            
        doormanStorage    = await doormanInstance.storage();
        delegationStorage = await delegationInstance.storage();
        mvkTokenStorage   = await mvkTokenInstance.storage();
        governanceStorage = await governanceInstance.storage();

        console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')

    });

    describe("%setAdmin", async () => {

        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk)
        });

        it('Admin should be able to call this entrypoint and update the contract administrator with a new address', async () => {
            try{

                // Initial Values
                delegationStorage = await delegationInstance.storage();
                const currentAdmin = delegationStorage.admin;

                // Operation
                setAdminOperation = await delegationInstance.methods.setAdmin(alice.pkh).send();
                await setAdminOperation.confirmation();

                // Final values
                delegationStorage = await delegationInstance.storage();
                const newAdmin = delegationStorage.admin;

                // reset admin
                await helperFunctions.signerFactory(tezos, alice.sk);
                resetAdminOperation = await delegationInstance.methods.setAdmin(bob.pkh).send();
                await resetAdminOperation.confirmation();

                // Assertions
                assert.notStrictEqual(newAdmin, currentAdmin);
                assert.strictEqual(newAdmin, alice.pkh);
                assert.strictEqual(currentAdmin, bob.pkh);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
        it('Non-admin should not be able to call this entrypoint', async () => {
            try{

                // Initial Values
                await helperFunctions.signerFactory(tezos, alice.sk);
                delegationStorage = await delegationInstance.storage();
                const currentAdmin = delegationStorage.admin;

                // Operation
                setAdminOperation = delegationInstance.methods.setAdmin(alice.pkh);
                await chai.expect(setAdminOperation.send()).to.be.rejected;

                // Final values
                delegationStorage = await delegationInstance.storage();
                const newAdmin = delegationStorage.admin;

                // Assertions
                assert.strictEqual(newAdmin, currentAdmin);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    });

    describe("%updateConfig", async () => {

        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk)
        });

        it('Admin should be able to call the entrypoint and configure the delegation ratio', async () => {
            try{

                // Initial Values
                delegationStorage = await delegationInstance.storage();
                const newConfigValue = 1;

                // Operation
                const updateConfigOperation = await delegationInstance.methods.updateConfig(newConfigValue,"configDelegationRatio").send();
                await updateConfigOperation.confirmation();

                // Final values
                delegationStorage = await delegationInstance.storage();
                const updateConfigValue = delegationStorage.config.delegationRatio;

                // Assertions
                assert.equal(updateConfigValue, newConfigValue);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
        it('Admin should not be able to call the entrypoint and configure the delegation ratio if it exceed 100%', async () => {
            try{

                // Initial Values
                delegationStorage = await delegationInstance.storage();
                const currentConfigValue = delegationStorage.config.delegationRatio;
                const newConfigValue = 10001;

                // Operation
                await chai.expect(delegationInstance.methods.updateConfig(newConfigValue,"configDelegationRatio").send()).to.be.rejected;

                // Final values
                delegationStorage = await delegationInstance.storage();
                const updateConfigValue = delegationStorage.config.delegationRatio;

                // Assertions
                assert.notEqual(newConfigValue, currentConfigValue);
                assert.equal(updateConfigValue.toNumber(), currentConfigValue.toNumber());

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
        it('Admin should be able to call the entrypoint and configure the maximum amount of satellites', async () => {
            try{

                // Initial Values
                delegationStorage = await delegationInstance.storage();
                const newConfigValue = 12345;

                // Operation
                const updateConfigOperation = await delegationInstance.methods.updateConfig(newConfigValue,"configMaxSatellites").send();
                await updateConfigOperation.confirmation();

                // Final values
                delegationStorage = await delegationInstance.storage();
                const updateConfigValue = delegationStorage.config.maxSatellites;

                // Assertions
                assert.equal(updateConfigValue, newConfigValue);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
        it('Admin should be able to call the entrypoint and configure the minimum sMVK balance to access an entrypoint', async () => {
            try{

                // Initial Values
                delegationStorage = await delegationInstance.storage();
                const newConfigValue = MVK(0.5);

                // Operation
                const updateConfigOperation = await delegationInstance.methods.updateConfig(newConfigValue,"configMinimumStakedMvkBalance").send();
                await updateConfigOperation.confirmation();

                // Final values
                delegationStorage = await delegationInstance.storage();
                const updateConfigValue = delegationStorage.config.minimumStakedMvkBalance;

                // Assertions
                assert.equal(updateConfigValue, newConfigValue);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
        it('Admin should not be able to call the entrypoint and configure the minimum sMVK balance if it goes below 0.1MVK', async () => {
            try{

                // Initial Values
                delegationStorage = await delegationInstance.storage();
                const currentConfigValue = delegationStorage.config.minimumStakedMvkBalance;
                const newConfigValue = MVK(0.09);

                // Operation
                await chai.expect(delegationInstance.methods.updateConfig(newConfigValue,"ConfigMinimumStakedMvkBalance").send()).to.be.rejected;

                // Final values
                delegationStorage = await delegationInstance.storage();
                const updateConfigValue = delegationStorage.config.minimumStakedMvkBalance;

                // Assertions
                assert.notEqual(newConfigValue, currentConfigValue);
                assert.equal(updateConfigValue.toNumber(), currentConfigValue.toNumber());

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
        it('Non-admin should not be able to call the entrypoint', async () => {
            try{

                // Initial Values
                delegationStorage = await delegationInstance.storage();
                const currentConfigValue = delegationStorage.config.minimumStakedMvkBalance;
                const newConfigValue = MVK(10);

                // Operation
                await helperFunctions.signerFactory(tezos, alice.sk)
                await chai.expect(delegationInstance.methods.updateConfig(newConfigValue,"configMinimumStakedMvkBalance").send()).to.be.rejected;

                // Final values
                delegationStorage = await delegationInstance.storage();
                const updateConfigValue = delegationStorage.config.minimumStakedMvkBalance;

                // Assertions
                assert.equal(updateConfigValue.toNumber(), currentConfigValue.toNumber());

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });
    });

    describe("%registerAsSatellite", async () => {

        beforeEach("Set signer to user", async () => {
            await helperFunctions.signerFactory(tezos, eve.sk)
        });

        it('User should be able to call this entrypoint', async () => {
            try{
                // init values
                const userStake               = MVK(100);

                const satelliteName           = "New Satellite (Eve)";
                const satelliteDescription    = "New Satellite Description (Eve)";
                const satelliteImage          = "https://placeholder.com/300";
                const satelliteWebsite        = "https://placeholder.com/300";
                const satelliteFee            = "700";

                // update operators operation for user
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, eve.pkh, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();

                // user stake 100 MVK tokens
                stakeOperation = await doormanInstance.methods.stake(userStake).send();
                await stakeOperation.confirmation();

                // Check state before registering as satellite
                const beforeDelegationLedger     = await delegationStorage.satelliteLedger.get(eve.pkh);        // should return null or undefined
                const beforeStakedBalance        = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);    // 100 MVK
                assert.equal(beforeDelegationLedger,       null);
                assert.equal(beforeStakedBalance.balance,  userStake);

                // user registers as a satellite
                registerAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite(
                    satelliteName, 
                    satelliteDescription, 
                    satelliteImage, 
                    satelliteWebsite,
                    satelliteFee
                ).send();
                await registerAsSatelliteOperation.confirmation();

                // Check state after registering as satellite
                delegationStorage               = await delegationInstance.storage();
                const afterDelegationLedger     = await delegationStorage.satelliteLedger.get(eve.pkh);         // should return bob's satellite record
                const afterStakedBalance        = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);     // 100 MVK
                
                // satellite details
                assert.equal(afterDelegationLedger.name,                   satelliteName);
                assert.equal(afterDelegationLedger.description,            satelliteDescription);
                assert.equal(afterDelegationLedger.website,                satelliteWebsite);
                assert.equal(afterDelegationLedger.stakedMvkBalance,       userStake);
                assert.equal(afterDelegationLedger.satelliteFee,           satelliteFee);
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
                const satelliteName           = "New Satellite (Alice)";
                const satelliteDescription    = "New Satellite Description (Alice)";
                const satelliteImage          = "https://placeholder.com/300";
                const satelliteWebsite        = "https://placeholder.com/300";
                const satelliteFee            = "700";

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
                    satelliteName, 
                    satelliteDescription, 
                    satelliteImage, 
                    satelliteWebsite,
                    satelliteFee
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
                const satelliteName           = "New Satellite (Eve)";
                const satelliteDescription    = "New Satellite Description (Eve)";
                const satelliteWebsite        = "https://placeholder.com/300";
                const satelliteImage          = "https://placeholder.com/300";
                const satelliteFee            = "700";

                // Operation
                togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("registerAsSatellite", true).send();
                await togglePauseOperation.confirmation();

                // Final values
                delegationStorage       = await delegationInstance.storage();
                const isPausedEnd       = delegationStorage.breakGlassConfig.registerAsSatelliteIsPaused

                await helperFunctions.signerFactory(tezos, eve.sk)
                registerAsSatelliteOperation = delegationInstance.methods.registerAsSatellite(
                    satelliteName, 
                    satelliteDescription, 
                    satelliteImage, 
                    satelliteWebsite,
                    satelliteFee
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
                const satelliteName           = "New Satellite (Eve)";
                const satelliteDescription    = "New Satellite Description (Eve)";
                const satelliteImage          = "https://placeholder.com/300";
                const satelliteWebsite        = "https://placeholder.com/300";
                const satelliteFee            = "700";

                // registers as a satellite
                registerAsSatelliteOperation = delegationInstance.methods.registerAsSatellite(
                    satelliteName, 
                    satelliteDescription, 
                    satelliteImage, 
                    satelliteWebsite,
                    satelliteFee
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
                const satelliteName           = "New Satellite (Eve)";
                const satelliteDescription    = "New Satellite Description (Eve)";
                const satelliteWebsite        = "https://placeholder.com/300";
                const satelliteImage          = "https://placeholder.com/300";
                const satelliteFee            = "700";

                // update operators operation for user
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, eve.pkh, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();

                // Eve stake 100 MVK tokens
                stakeOperation = await doormanInstance.methods.stake(userStake).send();
                await stakeOperation.confirmation();

                // User registers as a satellite again
                registerAsSatelliteOperation = delegationInstance.methods.registerAsSatellite(
                    satelliteName, 
                    satelliteDescription, 
                    satelliteImage, 
                    satelliteWebsite,
                    satelliteFee
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
                const satelliteName           = "New Satellite (Eve)";
                const satelliteDescription    = "New Satellite Description (Eve)";
                const satelliteWebsite        = "https://placeholder.com/300";
                const satelliteImage          = "https://placeholder.com/300";
                const satelliteFee            = "700";

                // update operators operation for user
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, mallory.pkh, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();

                // user stake 100 MVK tokens
                stakeOperation = await doormanInstance.methods.stake(userStake).send();
                await stakeOperation.confirmation();

                // User registers as a satellite again
                registerAsSatelliteOperation = delegationInstance.methods.registerAsSatellite(
                    satelliteName, 
                    satelliteDescription, 
                    satelliteImage, 
                    satelliteWebsite,
                    satelliteFee
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
            const satelliteName           = "New Satellite (Alice)";
            const satelliteDescription    = "New Satellite Description (Alice)";
            const satelliteWebsite        = "https://placeholder.com/300";
            const satelliteImage          = "https://placeholder.com/300";
            const satelliteFee            = "700";

            // update operators operation for user
            updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, alice.pkh, doormanAddress, tokenId);
            await updateOperatorsOperation.confirmation();

            // Alice stake 100 MVK tokens
            stakeOperation = await doormanInstance.methods.stake(userStake).send();
            await stakeOperation.confirmation();

            // Alice registers as a satellite
            registerAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite(
                satelliteName, 
                satelliteDescription, 
                satelliteImage, 
                satelliteWebsite,
                satelliteFee
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
                const updatedSatelliteName          = "New Satellite (Eve)";
                const updatedSatelliteDescription   = "New Satellite Description (Eve)";
                const updatedSatelliteWebsite       = "https://placeholder.com/300";
                const updatedSatelliteImage         = "https://placeholder.com/300";
                const updatedSatelliteFee           = "500";

                // Non-user tries to update satellite record
                await chai.expect(delegationInstance.methods.updateSatelliteRecord(
                        updatedSatelliteName, 
                        updatedSatelliteDescription, 
                        updatedSatelliteImage, 
                        updatedSatelliteWebsite,
                        updatedSatelliteFee
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
                const updatedSatelliteName          = "New Satellite (Eve)";
                const updatedSatelliteDescription   = "New Satellite Description (Eve)";
                const updatedSatelliteWebsite       = "https://placeholder.com/300";
                const updatedSatelliteImage         = "https://placeholder.com/300";
                const updatedSatelliteFee           = "500";

                // Operation
                await helperFunctions.signerFactory(tezos, bob.sk)
                togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("updateSatelliteRecord", true).send();
                await togglePauseOperation.confirmation();

                // Final values
                delegationStorage       = await delegationInstance.storage();
                const isPausedEnd       = delegationStorage.breakGlassConfig.updateSatelliteRecordIsPaused

                await helperFunctions.signerFactory(tezos, eve.sk)
                await chai.expect(delegationInstance.methods.updateSatelliteRecord(
                        updatedSatelliteName, 
                        updatedSatelliteDescription, 
                        updatedSatelliteImage,
                        updatedSatelliteWebsite,
                        updatedSatelliteFee
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

                const satelliteName           = "New Satellite (Oscar)";
                const satelliteDescription    = "New Satellite Description (Oscar)";
                const satelliteWebsite        = "https://placeholder.com/300";
                const satelliteImage          = "https://placeholder.com/300";
                const satelliteFee            = "800";

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
                    satelliteName, 
                    satelliteDescription, 
                    satelliteImage,
                    satelliteWebsite,
                    satelliteFee
                ).send();
                await registerAsSatelliteOperation.confirmation();

                // Check state after registering as satellite
                delegationStorage            = await delegationInstance.storage();
                const afterDelegationLedger  = await delegationStorage.satelliteLedger.get(oscar.pkh);         // should return bob's satellite record
                const afterStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(oscar.pkh);     // 100 MVK
                
                // Orscar's satellite details
                assert.equal(afterDelegationLedger.name,                   satelliteName);
                assert.equal(afterDelegationLedger.description,            satelliteDescription);
                assert.equal(afterDelegationLedger.website,                satelliteWebsite);
                assert.equal(afterDelegationLedger.stakedMvkBalance,       userStake);
                assert.equal(afterDelegationLedger.satelliteFee,           satelliteFee);
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
                const satelliteName           = "New Satellite (Eve)";
                const satelliteDescription    = "New Satellite Description (Eve)";
                const satelliteWebsite        = "https://placeholder.com/300";
                const satelliteImage          = "https://placeholder.com/300";
                const satelliteFee            = "700";

                // Operation
                togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("registerAsSatellite", true).send();
                await togglePauseOperation.confirmation();

                // Final values
                delegationStorage       = await delegationInstance.storage();
                const isPausedEnd       = delegationStorage.breakGlassConfig.registerAsSatelliteIsPaused

                registerAsSatelliteOperation = delegationInstance.methods.registerAsSatellite(
                    satelliteName, 
                    satelliteDescription, 
                    satelliteImage, 
                    satelliteWebsite,
                    satelliteFee
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
                const updatedSatelliteName          = "New Satellite (Eve)";
                const updatedSatelliteDescription   = "New Satellite Description (Eve)";
                const updatedSatelliteWebsite       = "https://placeholder.com/300";
                const updatedSatelliteImage         = "https://placeholder.com/300";
                const updatedSatelliteFee           = "500";

                // Operation
                togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("updateSatelliteRecord", true).send();
                await togglePauseOperation.confirmation();

                // Final values
                delegationStorage       = await delegationInstance.storage();
                const isPausedEnd       = delegationStorage.breakGlassConfig.updateSatelliteRecordIsPaused

                await chai.expect(delegationInstance.methods
                    .updateSatelliteRecord(
                        updatedSatelliteName, 
                        updatedSatelliteDescription, 
                        updatedSatelliteImage, 
                        updatedSatelliteWebsite,
                        updatedSatelliteFee
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
});
