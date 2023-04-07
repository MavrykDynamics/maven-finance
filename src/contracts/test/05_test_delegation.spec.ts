import assert from "assert";
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

import { bob, alice, eve, mallory, oscar, ivan } from "../scripts/sandbox/accounts";
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
    let admin
    let adminSk
    let satellite
    let satelliteSk

    // basic inputs for updating operators
    let doormanAddress
    let delegationAddress
    let tokenId = 0

    let stakeAmount

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

    let initialSatelliteRecord
    let updatedSatelliteRecord 
    
    let initialUserStakedRecord
    let initialUserStakedBalance

    let updatedUserStakedRecord
    let updatedUserStakedBalance

    let initialDelegateRecord
    let updatedDelegateRecord

    let initialMinimumStakedMvkRequirement
    let updatedMinimumStakedMvkRequirement

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
    let mistakenTransferOperation
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

        admin   = bob.pkh
        adminSk = bob.sk 

        doormanAddress          = contractDeployments.doorman.address;
        delegationAddress       = contractDeployments.delegation.address;
        
        doormanInstance         = await utils.tezos.contract.at(doormanAddress);
        delegationInstance      = await utils.tezos.contract.at(delegationAddress);
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

        it('user (eve) should be able to register as a satellite', async () => {
            try{
                
                // init values
                user        = eve.pkh;
                userSk      = eve.sk;
                stakeAmount = 0;
                
                // set signer to user
                await helperFunctions.signerFactory(tezos, userSk);

                delegationStorage                = await delegationInstance.storage();
                doormanStorage                   = await doormanInstance.storage();
                initialSatelliteRecord           = await delegationStorage.satelliteLedger.get(user);         

                initialMinimumStakedMvkRequirement  = delegationStorage.config.minimumStakedMvkBalance;
                initialUserStakedRecord             = await doormanStorage.userStakeBalanceLedger.get(user);
                initialUserStakedBalance            = initialUserStakedRecord === undefined ? 0 : initialUserStakedRecord.balance.toNumber()

                // check that user has sufficient staked balance
                if(initialUserStakedBalance < initialMinimumStakedMvkRequirement){

                    stakeAmount = Math.abs(initialUserStakedBalance - initialMinimumStakedMvkRequirement) + 1;

                    // update operators operation for user
                    updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, user, doormanAddress, tokenId);
                    await updateOperatorsOperation.confirmation();

                    // user stake MVK tokens
                    stakeOperation = await doormanInstance.methods.stake(stakeAmount).send();
                    await stakeOperation.confirmation();

                }; 

                // for retestability: run registerAsSatellite operation if satellite has not been registered yet, and skip for subsequent retesting
                if(initialSatelliteRecord == null){

                    // user registers as a satellite
                    registerAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite(
                        mockSatelliteData.eve.name, 
                        mockSatelliteData.eve.desc, 
                        mockSatelliteData.eve.image, 
                        mockSatelliteData.eve.website,
                        mockSatelliteData.eve.satelliteFee
                    ).send();
                    await registerAsSatelliteOperation.confirmation();

                    // check state after registering as satellite
                    delegationStorage               = await delegationInstance.storage();
                    updatedSatelliteRecord          = await delegationStorage.satelliteLedger.get(user);         
                    updatedUserStakedRecord         = await doormanStorage.userStakeBalanceLedger.get(user);    
                    updatedUserStakedBalance        = updatedUserStakedRecord === undefined ? 0 : updatedUserStakedRecord.balance.toNumber()
                    
                    // check satellite details
                    assert.equal(updatedSatelliteRecord.name,                           mockSatelliteData.eve.name);
                    assert.equal(updatedSatelliteRecord.description,                    mockSatelliteData.eve.desc);
                    assert.equal(updatedSatelliteRecord.website,                        mockSatelliteData.eve.website);
                    assert.equal(updatedSatelliteRecord.stakedMvkBalance.toNumber(),    stakeAmount);
                    assert.equal(updatedSatelliteRecord.satelliteFee,                   mockSatelliteData.eve.satelliteFee);
                    assert.equal(updatedSatelliteRecord.totalDelegatedAmount,           0);
                    assert.equal(updatedSatelliteRecord.status,                         "ACTIVE");

                    // check user's staked balance is updated
                    assert.equal(updatedUserStakedBalance   , initialUserStakedBalance + stakeAmount);
                }

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('user (ivan) who delegates to satellite (eve) should not be able to register as satellite', async () => {
            try{

                // init values
                user        = ivan.pkh;
                userSk      = ivan.sk;
                satellite   = eve.pkh;
                stakeAmount = 0;

                // set signer to user
                await helperFunctions.signerFactory(tezos, userSk);

                // delegate operation
                delegateOperation = await delegationInstance.methods.delegateToSatellite(user, satellite).send();
                await delegateOperation.confirmation();

                // update storage
                delegationStorage                   = await delegationInstance.storage();
                doormanStorage                      = await doormanInstance.storage();
                initialMinimumStakedMvkRequirement  = delegationStorage.config.minimumStakedMvkBalance;
                
                initialUserStakedRecord     = await doormanStorage.userStakeBalanceLedger.get(user);
                initialUserStakedBalance    = initialUserStakedRecord === undefined ? 0 : initialUserStakedRecord.balance.toNumber()
                initialDelegateRecord       = await delegationStorage.delegateLedger.get(user);
                initialSatelliteRecord      = await delegationStorage.satelliteLedger.get(satellite);

                // check that user has sufficient staked balance
                if(initialUserStakedBalance < initialMinimumStakedMvkRequirement){

                    stakeAmount = Math.abs(initialUserStakedBalance - initialMinimumStakedMvkRequirement) + 1;

                    // update operators operation for user
                    updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, user, doormanAddress, tokenId);
                    await updateOperatorsOperation.confirmation();

                    // user stake MVK tokens
                    stakeOperation = await doormanInstance.methods.stake(stakeAmount).send();
                    await stakeOperation.confirmation();

                }
                
                // check that delegate record is set 
                assert.strictEqual(initialDelegateRecord.satelliteAddress, satellite)
                assert.equal(initialSatelliteRecord.totalDelegatedAmount.toNumber(), initialUserStakedBalance)

                // delegate try to register
                registerAsSatelliteOperation = delegationInstance.methods.registerAsSatellite(
                    mockSatelliteData.ivan.name, 
                    mockSatelliteData.ivan.desc, 
                    mockSatelliteData.ivan.image, 
                    mockSatelliteData.ivan.website,
                    mockSatelliteData.ivan.satelliteFee
                );
                await chai.expect(registerAsSatelliteOperation.send()).to.be.rejected;

                // undelegate to reset storage
                undelegateOperation = await delegationInstance.methods.undelegateFromSatellite(user).send()
                await undelegateOperation.confirmation()

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        // it('user (alice) should not be able to call this entrypoint if it is paused', async () => {
        //     try{

        //         // Initial Values
        //         await helperFunctions.signerFactory(tezos, bob.sk)
        //         delegationStorage       = await delegationInstance.storage();
                
        //         const isPausedStart          = delegationStorage.breakGlassConfig.registerAsSatelliteIsPaused

        //         // Operation
        //         togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("registerAsSatellite", true).send();
        //         await togglePauseOperation.confirmation();

        //         // Final values
        //         delegationStorage       = await delegationInstance.storage();
        //         const isPausedEnd       = delegationStorage.breakGlassConfig.registerAsSatelliteIsPaused

        //         await helperFunctions.signerFactory(tezos, eve.sk)
        //         registerAsSatelliteOperation = delegationInstance.methods.registerAsSatellite(
        //             mockSatelliteData.eve.name, 
        //             mockSatelliteData.eve.desc, 
        //             mockSatelliteData.eve.image, 
        //             mockSatelliteData.eve.website,
        //             mockSatelliteData.eve.satelliteFee
        //         );
        //         await chai.expect(registerAsSatelliteOperation.send()).to.be.rejected;

        //         // Reset admin
        //         await helperFunctions.signerFactory(tezos, bob.sk)
        //         togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("registerAsSatellite", false).send();
        //         await togglePauseOperation.confirmation();

        //         // Assertions
        //         assert.equal(isPausedStart, false);
        //         assert.equal(isPausedEnd, true);

        //     } catch(e){
        //         console.dir(e, {depth: 5});
        //     }
        // });

        it('user (ivan) should not be able to call this entrypoint if the doorman contract is not referenced in the generalContracts map', async () => {
            try{

                // init values
                user         = ivan.pkh;
                userSk       = ivan.sk;
                stakeAmount  = 0;

                // remove doorman contract reference from governance contract generalContracts map
                await helperFunctions.signerFactory(tezos, adminSk)
                var updateOperation = await governanceInstance.methods.updateGeneralContracts("doorman", doormanAddress, 'remove').send()
                await updateOperation.confirmation();

                // set signer to user
                await helperFunctions.signerFactory(tezos, userSk)

                // update storage
                delegationStorage           = await delegationInstance.storage();
                doormanStorage              = await doormanInstance.storage();
                initialMinimumStakedMvkRequirement  = delegationStorage.config.minimumStakedMvkBalance;
                
                initialUserStakedRecord     = await doormanStorage.userStakeBalanceLedger.get(user);
                initialUserStakedBalance    = initialUserStakedRecord === undefined ? 0 : initialUserStakedRecord.balance.toNumber()

                // check that user has sufficient staked balance
                if(initialUserStakedBalance < initialMinimumStakedMvkRequirement){

                    stakeAmount = Math.abs(initialUserStakedBalance - initialMinimumStakedMvkRequirement) + 1;

                    // update operators operation for user
                    updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, user, doormanAddress, tokenId);
                    await updateOperatorsOperation.confirmation();

                    // user stake MVK tokens
                    stakeOperation = await doormanInstance.methods.stake(stakeAmount).send();
                    await stakeOperation.confirmation();

                }

                // registers as a satellite
                registerAsSatelliteOperation = delegationInstance.methods.registerAsSatellite(
                    mockSatelliteData.ivan.name, 
                    mockSatelliteData.ivan.desc, 
                    mockSatelliteData.ivan.image, 
                    mockSatelliteData.ivan.website,
                    mockSatelliteData.ivan.satelliteFee
                );
                await chai.expect(registerAsSatelliteOperation.send()).to.be.rejected;

                // add doorman contract reference to governance contract generalContracts map
                await helperFunctions.signerFactory(tezos, adminSk)
                updateOperation = await governanceInstance.methods.updateGeneralContracts("doorman", doormanAddress, 'update').send()
                await updateOperation.confirmation();
                
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('user (ivan) should not be able to register as a satellite if she does not meet the minimum staked MVK requirement', async () => {
            try{

                // init values
                user    = ivan.pkh;
                userSk  = ivan.sk;

                delegationStorage         = await delegationInstance.storage();
                doormanStorage            = await doormanInstance.storage();
                initialUserStakedRecord   = await doormanStorage.userStakeBalanceLedger.get(user);
                initialUserStakedBalance  = initialUserStakedRecord === undefined ? 0 : initialUserStakedRecord.balance.toNumber()

                const initialMinimumStakedMvkRequirement = delegationStorage.config.minimumStakedMvkBalance;
                const newMinimumStakedMvkRequirement     = MVK(100);

                // Operation
                await helperFunctions.signerFactory(tezos, adminSk)
                var updateConfigOperation = await delegationInstance.methods.updateConfig(newMinimumStakedMvkRequirement, "configMinimumStakedMvkBalance").send();
                await updateConfigOperation.confirmation();

                // set signer to user
                await helperFunctions.signerFactory(tezos, userSk)
                
                // min amount required to stake on doorman contract
                stakeAmount = MVK(1); 

                // update operators operation for user
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, user, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();

                // user stake 100 MVK tokens
                stakeOperation = await doormanInstance.methods.stake(stakeAmount).send();
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
                await helperFunctions.signerFactory(tezos, adminSk)
                updateConfigOperation = await delegationInstance.methods.updateConfig(initialMinimumStakedMvkRequirement, "configMinimumStakedMvkBalance").send();
                await updateConfigOperation.confirmation();

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('satellite (eve) should not be able to call this entrypoint again if she is already registered as a satellite', async () => {
            try{
                
                // init values
                user        = eve.pkh;
                userSk      = eve.sk;
                stakeAmount = 0;
                
                // update storage
                delegationStorage                   = await delegationInstance.storage();
                doormanStorage                      = await doormanInstance.storage();
                initialMinimumStakedMvkRequirement  = delegationStorage.config.minimumStakedMvkBalance;
                
                initialUserStakedRecord     = await doormanStorage.userStakeBalanceLedger.get(user);
                initialUserStakedBalance    = initialUserStakedRecord === undefined ? 0 : initialUserStakedRecord.balance.toNumber()

                // check that user has sufficient staked balance
                if(initialUserStakedBalance < initialMinimumStakedMvkRequirement){

                    stakeAmount = Math.abs(initialUserStakedBalance - initialMinimumStakedMvkRequirement) + 1;

                    // update operators operation for user
                    updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, user, doormanAddress, tokenId);
                    await updateOperatorsOperation.confirmation();

                    // user stake MVK tokens
                    stakeOperation = await doormanInstance.methods.stake(stakeAmount).send();
                    await stakeOperation.confirmation();

                }

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

    });

    describe("%unregisterAsSatellite", async () => {

    //     // before("Set new satellite as Alice", async () => {
    //     //     // init values
    //     //     await helperFunctions.signerFactory(tezos, alice.sk)
    //     //     const userStake               = MVK(100);
            
    //     //     // update operators operation for user
    //     //     updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, alice.pkh, doormanAddress, tokenId);
    //     //     await updateOperatorsOperation.confirmation();

    //     //     // Alice stake 100 MVK tokens
    //     //     stakeOperation = await doormanInstance.methods.stake(userStake).send();
    //     //     await stakeOperation.confirmation();

    //     //     // Alice registers as a satellite
    //     //     registerAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite(
    //     //         mockSatelliteData.alice.name, 
    //     //         mockSatelliteData.alice.desc, 
    //     //         mockSatelliteData.alice.image, 
    //     //         mockSatelliteData.alice.website,
    //     //         mockSatelliteData.alice.satelliteFee
    //     //     ).send();
    //     //     await registerAsSatelliteOperation.confirmation();
    //     // })


        it('satellite (eve) should be able to unregister as a satellite', async () => {
            try{

                // init values
                satellite   = eve.pkh;
                satelliteSk = eve.sk;

                // set signer to satellite
                await helperFunctions.signerFactory(tezos, satelliteSk);

                // Unregisters as a satellite
                unregisterAsSatelliteOperation = await delegationInstance.methods.unregisterAsSatellite(satellite).send();
                await unregisterAsSatelliteOperation.confirmation();

                // Check state after unregistering as satellite
                const satelliteExists  = await delegationStorage.satelliteLedger.get(satellite); 
                assert.equal(satelliteExists, null);

            } catch(e){
                console.dir(e, {depth: 5});
            } 

        });

        it('user (eve) should be able to register as a satellite again after unregistering', async () => {
            try{

                // init values
                user         = eve.pkh;
                userSk       = eve.sk;
                stakeAmount  = 0;
                
                // set signer to user
                await helperFunctions.signerFactory(tezos, userSk);

                // update storage
                delegationStorage                   = await delegationInstance.storage();
                doormanStorage                      = await doormanInstance.storage();
                initialMinimumStakedMvkRequirement  = delegationStorage.config.minimumStakedMvkBalance;
                
                initialUserStakedRecord     = await doormanStorage.userStakeBalanceLedger.get(user);
                initialUserStakedBalance    = initialUserStakedRecord === undefined ? 0 : initialUserStakedRecord.balance.toNumber()

                // check that user has sufficient staked balance
                if(initialUserStakedBalance < initialMinimumStakedMvkRequirement){

                    stakeAmount = Math.abs(initialUserStakedBalance - initialMinimumStakedMvkRequirement) + 1;

                    // update operators operation for user
                    updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, user, doormanAddress, tokenId);
                    await updateOperatorsOperation.confirmation();

                    // user stake MVK tokens
                    stakeOperation = await doormanInstance.methods.stake(stakeAmount).send();
                    await stakeOperation.confirmation();

                }

                // user registers as a satellite
                registerAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite(
                    mockSatelliteData.eve.name, 
                    mockSatelliteData.eve.desc, 
                    mockSatelliteData.eve.image, 
                    mockSatelliteData.eve.website,
                    mockSatelliteData.eve.satelliteFee
                ).send();
                await registerAsSatelliteOperation.confirmation();

                // update storage
                delegationStorage               = await delegationInstance.storage();
                doormanStorage                  = await doormanInstance.storage();

                // check state after registering as satellite
                updatedSatelliteRecord          = await delegationStorage.satelliteLedger.get(user);         
                updatedUserStakedRecord         = await doormanStorage.userStakeBalanceLedger.get(user);    
                updatedUserStakedBalance        = updatedUserStakedRecord === undefined ? 0 : updatedUserStakedRecord.balance.toNumber()
                
                // check satellite details
                assert.equal(updatedSatelliteRecord.name,                           mockSatelliteData.eve.name);
                assert.equal(updatedSatelliteRecord.description,                    mockSatelliteData.eve.desc);
                assert.equal(updatedSatelliteRecord.website,                        mockSatelliteData.eve.website);
                assert.equal(updatedSatelliteRecord.stakedMvkBalance.toNumber(),    updatedUserStakedBalance);
                assert.equal(updatedSatelliteRecord.satelliteFee,                   mockSatelliteData.eve.satelliteFee);
                assert.equal(updatedSatelliteRecord.totalDelegatedAmount,           0);
                assert.equal(updatedSatelliteRecord.status,                         "ACTIVE");

                // check user's staked balance is updated
                assert.equal(updatedUserStakedBalance, initialUserStakedBalance + stakeAmount);

            } catch(e){
                console.dir(e, {depth: 5});
            } 

        });

        it('non-satellite user (ivan) should not be able to unregister as a satellite', async () => {
            try{
                
                // init values
                user    = ivan.pkh;
                userSk  = ivan.sk;

                // set signer to user
                await helperFunctions.signerFactory(tezos, userSk);
                
                // fail to unregister as a satellite
                unregisterAsSatelliteOperation = delegationInstance.methods.unregisterAsSatellite(user);
                await chai.expect(unregisterAsSatelliteOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        // it('satellite (eve) should not be able to call this entrypoint if the entrypoint is paused', async () => {
        //     try{

        //         // Initial Values
        //         delegationStorage       = await delegationInstance.storage();
        //         const isPausedStart     = delegationStorage.breakGlassConfig.unregisterAsSatelliteIsPaused

        //         // Operation
        //         await helperFunctions.signerFactory(tezos, bob.sk)
        //         togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("unregisterAsSatellite", true).send();
        //         await togglePauseOperation.confirmation();

        //         // Final values
        //         delegationStorage       = await delegationInstance.storage();
        //         const isPausedEnd       = delegationStorage.breakGlassConfig.unregisterAsSatelliteIsPaused

        //         await helperFunctions.signerFactory(tezos, alice.sk)
        //         unregisterAsSatelliteOperation = delegationInstance.methods.unregisterAsSatellite(alice.pkh);
        //         await chai.expect(unregisterAsSatelliteOperation.send()).to.be.rejected;

        //         // Reset admin
        //         await helperFunctions.signerFactory(tezos, bob.sk)
        //         togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("unregisterAsSatellite", false).send();
        //         await togglePauseOperation.confirmation();

        //         // Assertions
        //         assert.equal(isPausedStart, false);
        //         assert.equal(isPausedEnd, true);
                
        //     } catch(e){
        //         console.dir(e, {depth: 5});
        //     } 
        // });
    });

    // describe("%updateSatelliteRecord", async () => {

    //     beforeEach("Set signer to satellite", async () => {
    //         await helperFunctions.signerFactory(tezos, eve.sk)
    //     });

    //     it('Satellite should be able to call this entrypoint and update its record', async () => {
    //         try{
    //             // init values
    //             const userStake                 = MVK(100);
    //             delegationStorage               = await delegationInstance.storage();
    //             const satelliteRecord           = await delegationStorage.satelliteLedger.get(eve.pkh);
    //             const satelliteName             = satelliteRecord.name;
    //             const satelliteDescription      = satelliteRecord.description;
    //             const satelliteWebsite          = satelliteRecord.website;
    //             const satelliteImage            = satelliteRecord.image;
    //             const satelliteFee              = satelliteRecord.satelliteFee;


    //             const updatedSatelliteName           = "Updated Satellite (Eve)";
    //             const updatedSatelliteDescription    = "Updated Satellite Description (Eve)";
    //             const updatedSatelliteWebsite        = "https://holderplace.com/300";
    //             const updatedSatelliteImage          = "https://placeholder.com/300";
    //             const updatedSatelliteFee            = "500";

    //             // Eve updates satellite record
    //             const updateOperation = await delegationInstance.methods.updateSatelliteRecord(
    //                 updatedSatelliteName, 
    //                 updatedSatelliteDescription, 
    //                 updatedSatelliteImage,
    //                 updatedSatelliteWebsite,
    //                 updatedSatelliteFee
    //             ).send();
    //             await updateOperation.confirmation();

    //             // Check state after registering as satellite
    //             delegationStorage               = await delegationInstance.storage();
    //             const updatedSatelliteRecord    = await delegationStorage.satelliteLedger.get(eve.pkh);
                
    //             // Bob's satellite details - check that record is updated
    //             assert.strictEqual(updatedSatelliteRecord.name,             updatedSatelliteName);
    //             assert.strictEqual(updatedSatelliteRecord.description,      updatedSatelliteDescription);
    //             assert.strictEqual(updatedSatelliteRecord.website,          updatedSatelliteWebsite);
    //             assert.equal(updatedSatelliteRecord.satelliteFee,           updatedSatelliteFee);
    //             assert.strictEqual(updatedSatelliteRecord.image,            updatedSatelliteImage);

    //             // Check that updated record is not equal to old record
    //             assert.notStrictEqual(updatedSatelliteRecord.name,          satelliteName);
    //             assert.notStrictEqual(updatedSatelliteRecord.description,   satelliteDescription);
    //             assert.notStrictEqual(updatedSatelliteRecord.website,       satelliteWebsite);
    //             assert.notEqual(updatedSatelliteRecord.satelliteFee,        satelliteFee);
    //             assert.strictEqual(updatedSatelliteRecord.image,            satelliteImage);

    //         } catch(e){
    //             console.dir(e, {depth: 5});
    //         }
    //     });

    //     it('Non-satellite should not be able to call this entrypoint', async () => {
    //         try{

    //             // init values
    //             await helperFunctions.signerFactory(tezos, mallory.sk);

    //             // Non-user tries to update satellite record
    //             await chai.expect(delegationInstance.methods.updateSatelliteRecord(
    //                     mockSatelliteData.eve.name, 
    //                     mockSatelliteData.eve.desc, 
    //                     mockSatelliteData.eve.image, 
    //                     mockSatelliteData.eve.website,
    //                     mockSatelliteData.eve.satelliteFee
    //             ).send()
    //             ).to.be.rejected;

    //         } catch(e){
    //             console.dir(e, {depth: 5});
    //         }
    //     });

    //     it('Satellite should not be able to call this entrypoint if the entrypoint is pause', async () => {
    //         try{

    //             // Initial Values
    //             delegationStorage       = await delegationInstance.storage();
    //             const isPausedStart     = delegationStorage.breakGlassConfig.updateSatelliteRecordIsPaused

    //             // Operation
    //             await helperFunctions.signerFactory(tezos, bob.sk)
    //             togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("updateSatelliteRecord", true).send();
    //             await togglePauseOperation.confirmation();

    //             // Final values
    //             delegationStorage       = await delegationInstance.storage();
    //             const isPausedEnd       = delegationStorage.breakGlassConfig.updateSatelliteRecordIsPaused

    //             await helperFunctions.signerFactory(tezos, eve.sk)
    //             await chai.expect(delegationInstance.methods.updateSatelliteRecord(
    //                 mockSatelliteData.eve.name, 
    //                 mockSatelliteData.eve.desc, 
    //                 mockSatelliteData.eve.image, 
    //                 mockSatelliteData.eve.website,
    //                 mockSatelliteData.eve.satelliteFee
    //             ).send()
    //             ).to.be.rejected;

    //             // Reset admin
    //             await helperFunctions.signerFactory(tezos, bob.sk)
    //             togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("updateSatelliteRecord", false).send();
    //             await togglePauseOperation.confirmation();

    //             // Assertions
    //             assert.equal(isPausedStart, false);
    //             assert.equal(isPausedEnd,   true);

    //         } catch(e){
    //             console.dir(e, {depth: 5});
    //         }
    //     });
    // });

    // describe("%delegateToSatellite", async () => {

    //     beforeEach("Set signer to user", async () => {
    //         await helperFunctions.signerFactory(tezos, alice.sk)
    //     });

    //     it('Satellite should not be able to call this entrypoint', async () => {
    //         try{

    //             // init values
    //             await helperFunctions.signerFactory(tezos, eve.sk);
    //             const stakeAmount   = MVK(10);

    //             // update operators operation for user
    //             updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, eve.pkh, doormanAddress, tokenId);
    //             await updateOperatorsOperation.confirmation();
    
    //             // stake operation
    //             stakeOperation = await doormanInstance.methods.stake(stakeAmount).send();
    //             await stakeOperation.confirmation();

    //             // delegate operation
    //             delegateOperation = delegationInstance.methods.delegateToSatellite(eve.pkh, eve.pkh);
    //             await chai.expect(delegateOperation.send()).to.be.rejected;

    //             // Final values
    //             delegationStorage   = await delegationInstance.storage();

    //             const delegateRecord     = await delegationStorage.delegateLedger.get(eve.pkh)
    //             assert.strictEqual(delegateRecord, undefined)

    //         } catch(e){
    //             console.dir(e, {depth: 5});
    //         }
    //     });

    //     it('User should not be able to call this entrypoint if it is paused', async () => {
    //         try{

    //             // Initial Values
    //             delegationStorage       = await delegationInstance.storage();
    //             const isPausedStart     = delegationStorage.breakGlassConfig.delegateToSatelliteIsPaused
    //             const stakeAmount       = MVK(10);

    //             // Operation
    //             await helperFunctions.signerFactory(tezos, bob.sk)

    //             // update operators operation for user
    //             updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, bob.pkh, doormanAddress, tokenId);
    //             await updateOperatorsOperation.confirmation();
    
    //             stakeOperation = await doormanInstance.methods.stake(stakeAmount).send();
    //             await stakeOperation.confirmation();
                
    //             // Operation
    //             togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("delegateToSatellite", true).send();
    //             await togglePauseOperation.confirmation();

    //             // Final values
    //             delegationStorage       = await delegationInstance.storage();
    //             const isPausedEnd       = delegationStorage.breakGlassConfig.delegateToSatelliteIsPaused

    //             // delegate operation
    //             delegateOperation = delegationInstance.methods.delegateToSatellite(bob.pkh, eve.pkh);
    //             await chai.expect(delegateOperation.send()).to.be.rejected;

    //             // Reset admin
    //             togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("delegateToSatellite", false).send();
    //             await togglePauseOperation.confirmation();

    //             // Assertions
    //             assert.equal(isPausedStart, false);
    //             assert.equal(isPausedEnd, true);

    //         } catch(e){
    //             console.dir(e, {depth: 5});
    //         }
    //     });

    //     it('User should be able to call this entrypoint and delegate his SMVK to a provided satellite', async () => {
    //         try{
    //             // Initial Values
    //             delegationStorage       = await delegationInstance.storage();
    //             const stakeAmount       = MVK(10);

    //             // update operators operation for user
    //             updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, alice.pkh, doormanAddress, tokenId);
    //             await updateOperatorsOperation.confirmation();

    //             // stake operation
    //             stakeOperation = await doormanInstance.methods.stake(stakeAmount).send();
    //             await stakeOperation.confirmation();

    //             // delegate operation
    //             delegateOperation   = await delegationInstance.methods.delegateToSatellite(alice.pkh, eve.pkh).send();
    //             await delegateOperation.confirmation();

    //             // Final values
    //             delegationStorage           = await delegationInstance.storage();
    //             doormanStorage              = await doormanInstance.storage();
    //             const stakeRecord           = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
    //             const delegateRecord        = await delegationStorage.delegateLedger.get(alice.pkh);
    //             const satelliteRecord       = await delegationStorage.satelliteLedger.get(eve.pkh);
                
    //             assert.strictEqual(delegateRecord.satelliteAddress, eve.pkh)
    //             assert.equal(satelliteRecord.totalDelegatedAmount.toNumber(), stakeRecord.balance.toNumber())

    //         } catch(e){
    //             console.dir(e, {depth: 5});
    //         }
    //     });

    //     it('User should not be able to delegate to the same satellite twice', async () => {
    //         try{
                
    //             delegateOperation = delegationInstance.methods.delegateToSatellite(alice.pkh, eve.pkh);
    //             await chai.expect(delegateOperation.send()).to.be.rejected;

    //         } catch(e){
    //             console.dir(e, {depth: 5});
    //         }
    //     });

    //     it('User should not be able to call the entrypoint if the contract doesn’t have the doorman contract in the generalContracts map', async () => {
    //         try{

    //             // Update generalContracts
    //             await helperFunctions.signerFactory(tezos, bob.sk)
    //             var updateOperation = await governanceInstance.methods.updateGeneralContracts("doorman", doormanAddress).send()
    //             await updateOperation.confirmation();

    //             // Initial values
    //             delegateOperation = delegationInstance.methods.delegateToSatellite(bob.pkh, eve.pkh);
    //             await chai.expect(delegateOperation.send()).to.be.rejected;

    //             // Reset operation
    //             await helperFunctions.signerFactory(tezos, bob.sk)
    //             var updateOperation = await governanceInstance.methods.updateGeneralContracts("doorman", doormanAddress).send()
    //             await updateOperation.confirmation();

    //         } catch(e){
    //             console.dir(e, {depth: 5});
    //         }
    //     });

    //     it('User should not be able to call this entrypoint if the provided satellite does not exist', async () => {
    //         try{

    //             // Initial values
    //             const userStake = MVK(10);

    //             // update operators operation for user
    //             updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, alice.pkh, doormanAddress, tokenId);
    //             await updateOperatorsOperation.confirmation();

    //             stakeOperation = await doormanInstance.methods.stake(userStake).send();
    //             await stakeOperation.confirmation();

    //             delegateOperation = delegationInstance.methods.delegateToSatellite(alice.pkh, mallory.pkh);
    //             await chai.expect(delegateOperation.send()).to.be.rejected;

    //             // Final values
    //             delegationStorage           = await delegationInstance.storage();
    //             doormanStorage              = await doormanInstance.storage();
    //             const satelliteRecord       = await delegationStorage.satelliteLedger.get(mallory.pkh);
                
    //             assert.strictEqual(satelliteRecord, undefined);

    //         } catch(e){
    //             console.dir(e, {depth: 5});
    //         }
    //     });


    //     it('User should be able to call this entrypoint and redelegate his SMVK if he wants to change satellite', async () => {
    //         try{

    //             // Register a new satellite
    //             await helperFunctions.signerFactory(tezos, oscar.sk);

    //             // init values
    //             const userStake               = MVK(100);

    //             // update operators operation for user
    //             updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, oscar.pkh, doormanAddress, tokenId);
    //             await updateOperatorsOperation.confirmation();

    //             // Oscar stake 100 MVK tokens
    //             stakeOperation = await doormanInstance.methods.stake(userStake).send();
    //             await stakeOperation.confirmation();

    //             // Check state before registering as satellite
    //             const beforeDelegationLedger  = await delegationStorage.satelliteLedger.get(oscar.pkh);        // should return null or undefined
    //             const beforeStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(oscar.pkh);    // 100 MVK
                
    //             assert.equal(beforeDelegationLedger,       null);
    //             assert.equal(beforeStakedBalance.balance,  userStake);

    //             // Registers as a satellite
    //             registerAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite(
    //                 mockSatelliteData.oscar.name, 
    //                 mockSatelliteData.oscar.desc, 
    //                 mockSatelliteData.oscar.image, 
    //                 mockSatelliteData.oscar.website,
    //                 mockSatelliteData.oscar.satelliteFee
    //             ).send();
    //             await registerAsSatelliteOperation.confirmation();

    //             // Check state after registering as satellite
    //             delegationStorage            = await delegationInstance.storage();
    //             const afterDelegationLedger  = await delegationStorage.satelliteLedger.get(oscar.pkh);         // should return bob's satellite record
    //             const afterStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(oscar.pkh);     // 100 MVK
                
    //             // Orscar's satellite details
    //             assert.equal(afterDelegationLedger.name,                   mockSatelliteData.oscar.name);
    //             assert.equal(afterDelegationLedger.description,            mockSatelliteData.oscar.desc);
    //             assert.equal(afterDelegationLedger.website,                mockSatelliteData.oscar.website);
    //             assert.equal(afterDelegationLedger.stakedMvkBalance,       userStake);
    //             assert.equal(afterDelegationLedger.satelliteFee,           mockSatelliteData.oscar.satelliteFee);
    //             assert.equal(afterDelegationLedger.totalDelegatedAmount,   0);
    //             assert.equal(afterDelegationLedger.status,                 "ACTIVE");

    //             // Oscar's staked balance remains the same
    //             assert.equal(afterStakedBalance.balance, userStake);

    //             // Alice redelegate to Oscar
    //             await helperFunctions.signerFactory(tezos, alice.sk)
    //             delegationStorage               = await delegationInstance.storage();
                
    //             const previousDelegation        = await delegationStorage.delegateLedger.get(alice.pkh);
    //             const userDelegation            = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
    //             const previousSatellite         = previousDelegation.satelliteAddress;

    //             const satelliteRecord           = await delegationStorage.satelliteLedger.get(previousSatellite);
    //             const previousDelegatedAmount   = satelliteRecord.totalDelegatedAmount;

    //             const redelegateOperation       = await delegationInstance.methods.delegateToSatellite(alice.pkh, oscar.pkh).send();
    //             await redelegateOperation.confirmation();
                
    //             delegationStorage               = await delegationInstance.storage();
    //             const newSatelliteRecord        = await delegationStorage.satelliteLedger.get(oscar.pkh);
    //             const updatedOldSatelliteLedger = await delegationStorage.satelliteLedger.get(previousSatellite);
    //             const updatedOldDelegatedAmount = updatedOldSatelliteLedger.totalDelegatedAmount;
    //             const newDelegation             = await delegationStorage.delegateLedger.get(alice.pkh);

    //             assert.strictEqual(newDelegation.satelliteAddress, oscar.pkh)
    //             assert.equal(updatedOldDelegatedAmount.toNumber(), previousDelegatedAmount.toNumber() - userDelegation.balance.toNumber());
    //             assert.equal(newSatelliteRecord.totalDelegatedAmount.toNumber(), userDelegation.balance.toNumber());

    //         } catch(e){
    //             console.dir(e, {depth: 5});
    //         }
    //     });
    // })

    // describe("%undelegateFromSatellite", async () => {

    //     beforeEach("Set signer to user", async () => {
    //         await helperFunctions.signerFactory(tezos, alice.sk)
    //     });

    //     it('Satellite should not be able to call this entrypoint', async () => {
    //         try{

    //             // init values
    //             await helperFunctions.signerFactory(tezos, eve.sk);

    //             // Operation
    //             undelegateOperation = delegationInstance.methods.undelegateFromSatellite(eve.pkh);
    //             await chai.expect(undelegateOperation.send()).to.be.rejected;

    //             // Final values
    //             delegationStorage           = await delegationInstance.storage();
    //             const delegateRecord        = await delegationStorage.delegateLedger.get(eve.pkh)

    //             assert.strictEqual(delegateRecord, undefined)

    //         } catch(e){
    //             console.dir(e, {depth: 5});
    //         }
    //     });

    //     it('User should not be able to call this entrypoint if it is pause', async () => {
    //         try{

    //             // Initial Value
    //             await helperFunctions.signerFactory(tezos, bob.sk)
    //             delegationStorage       = await delegationInstance.storage();
    //             const isPausedStart     = delegationStorage.breakGlassConfig.undelegateFromSatelliteIsPaused

    //             // Operation
    //             togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("undelegateFromSatellite", true).send();
    //             await togglePauseOperation.confirmation();

    //             // Final values
    //             delegationStorage       = await delegationInstance.storage();
    //             const isPausedEnd       = delegationStorage.breakGlassConfig.undelegateFromSatelliteIsPaused

    //             await helperFunctions.signerFactory(tezos, eve.sk);
    //             undelegateOperation = delegationInstance.methods.undelegateFromSatellite(eve.pkh);
    //             await chai.expect(undelegateOperation.send()).to.be.rejected;

    //             // Reset admin
    //             await helperFunctions.signerFactory(tezos, bob.sk)
    //             togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("undelegateFromSatellite", false).send();
    //             await togglePauseOperation.confirmation();

    //             // Assertions
    //             assert.equal(isPausedStart, false);
    //             assert.equal(isPausedEnd, true);

    //         } catch(e){
    //             console.dir(e, {depth: 5});
    //         }
    //     });

    //     it('User should not be able to undelegate if he never delegated before', async () => {
    //         try{

    //             // Register a new user
    //             await helperFunctions.signerFactory(tezos, mallory.sk)
    //             delegationStorage       = await delegationInstance.storage();
    //             const stakeAmount       = MVK(10);

    //             // update operators operation for user
    //             updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, mallory.pkh, doormanAddress, tokenId);
    //             await updateOperatorsOperation.confirmation();
    
    //             stakeOperation = await doormanInstance.methods.stake(stakeAmount).send();
    //             await stakeOperation.confirmation();

    //             undelegateOperation = await delegationInstance.methods.undelegateFromSatellite(mallory.pkh);
    //             await chai.expect(undelegateOperation.send()).to.be.rejected;

    //         } catch(e){
    //             console.dir(e, {depth: 5});
    //         }
    //     });

    //     it('User should not be able to call this entrypoint if the provided satellite does not exist', async () => {
    //         try{
                
    //             delegateOperation = await delegationInstance.methods.delegateToSatellite(alice.pkh, bob.pkh);
    //             await chai.expect(delegateOperation.send()).to.be.rejected;

    //         } catch(e){
    //             console.dir(e, {depth: 5});
    //         }
    //     });

    //     it('User should not be able to call the entrypoint if the contract doesn’t have the doorman contract in the generalContracts map', async () => {
    //         try{

    //             // Update generalContracts
    //             await helperFunctions.signerFactory(tezos, bob.sk)
    //             var updateOperation = await governanceInstance.methods.updateGeneralContracts("doorman", doormanAddress).send()
    //             await updateOperation.confirmation();

    //             // Initial values
    //             await helperFunctions.signerFactory(tezos, alice.sk);
    //             delegateOperation = delegationInstance.methods.delegateToSatellite(alice.pkh, eve.pkh);
    //             await chai.expect(delegateOperation.send()).to.be.rejected;

    //             // Reset operation
    //             await helperFunctions.signerFactory(tezos, bob.sk)
    //             var updateOperation = await governanceInstance.methods.updateGeneralContracts("doorman", doormanAddress).send()
    //             await updateOperation.confirmation();

    //         } catch(e){
    //             console.dir(e, {depth: 5});
    //         }
    //     });

    //     it('User should be able to call this entrypoint and undelegate his SMVK from a provided satellite', async () => {
    //         try{

    //             // Register a new user
    //             delegationStorage           = await delegationInstance.storage();
    //             const initSatelliteRecord   = await delegationStorage.satelliteLedger.get(oscar.pkh);

    //             // Operation
    //             const delegationOperation   = await delegationInstance.methods.undelegateFromSatellite(alice.pkh).send();
    //             await delegationOperation.confirmation();

    //             // Final Values
    //             delegationStorage       = await delegationInstance.storage();
    //             const satelliteRecord   = await delegationStorage.satelliteLedger.get(oscar.pkh);
    //             const delegateRecord    = await delegationStorage.delegateLedger.get(alice.pkh);

    //             // Assertions
    //             assert.strictEqual(delegateRecord, undefined);
    //             assert.notEqual(initSatelliteRecord.totalDelegatedAmount, satelliteRecord.totalDelegatedAmount);

    //         } catch(e){
    //             console.dir(e, {depth: 5});
    //         }
    //     })
    // })

    // describe("%togglePauseEntrypoint", async () => {
        
    //     beforeEach("Set signer to admin", async () => {
    //         await helperFunctions.signerFactory(tezos, bob.sk)
    //     });
    //     it('Admin should be able to call the entrypoint and pause or unpause the delegateToSatellite entrypoint', async () => {
    //         try{

    //             // Initial Values
    //             delegationStorage       = await delegationInstance.storage();
    //             const isPausedStart     = delegationStorage.breakGlassConfig.delegateToSatelliteIsPaused
    //             const stakeAmount   = MVK(10);

    //             updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, bob.pkh, doormanAddress, tokenId);
    //             await updateOperatorsOperation.confirmation();
    
    //             stakeOperation = await doormanInstance.methods.stake(stakeAmount).send();
    //             await stakeOperation.confirmation();

    //             // Operation
    //             togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("delegateToSatellite", true).send();
    //             await togglePauseOperation.confirmation();

    //             // Final values
    //             delegationStorage       = await delegationInstance.storage();
    //             const isPausedEnd       = delegationStorage.breakGlassConfig.delegateToSatelliteIsPaused

    //             delegateOperation = delegationInstance.methods.delegateToSatellite(bob.pkh, eve.pkh);
    //             await chai.expect(delegateOperation.send()).to.be.rejected;

    //             // Reset admin
    //             togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("delegateToSatellite", false).send();
    //             await togglePauseOperation.confirmation();

    //             // Assertions
    //             assert.equal(isPausedStart, false);
    //             assert.equal(isPausedEnd, true);

    //         } catch(e){
    //             console.dir(e, {depth: 5});
    //         }
    //     });
        
    //     it('Admin should be able to call the entrypoint and pause or unpause the delegateToSatellite entrypoint', async () => {
    //         try{

    //             // Initial Values
    //             delegationStorage       = await delegationInstance.storage();
    //             const isPausedStart     = delegationStorage.breakGlassConfig.undelegateFromSatelliteIsPaused

    //             // Operation
    //             togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("undelegateFromSatellite", true).send();
    //             await togglePauseOperation.confirmation();

    //             // Final values
    //             delegationStorage       = await delegationInstance.storage();
    //             const isPausedEnd       = delegationStorage.breakGlassConfig.undelegateFromSatelliteIsPaused

    //             undelegateOperation = delegationInstance.methods.undelegateFromSatellite(bob.pkh);
    //             await chai.expect(undelegateOperation.send()).to.be.rejected;

    //             // Reset admin
    //             togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("undelegateFromSatellite", false).send();
    //             await togglePauseOperation.confirmation();

    //             // Assertions
    //             assert.equal(isPausedStart, false);
    //             assert.equal(isPausedEnd, true);

    //         } catch(e){
    //             console.dir(e, {depth: 5});
    //         }
    //     });
        
    //     it('Admin should be able to call the entrypoint and pause or unpause the registerSatellite entrypoint', async () => {
    //         try{

    //             // Initial Values
    //             delegationStorage       = await delegationInstance.storage();
    //             const isPausedStart     = delegationStorage.breakGlassConfig.registerAsSatelliteIsPaused

    //             // Operation
    //             togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("registerAsSatellite", true).send();
    //             await togglePauseOperation.confirmation();

    //             // Final values
    //             delegationStorage       = await delegationInstance.storage();
    //             const isPausedEnd       = delegationStorage.breakGlassConfig.registerAsSatelliteIsPaused

    //             registerAsSatelliteOperation = delegationInstance.methods.registerAsSatellite(
    //                 mockSatelliteData.eve.name, 
    //                 mockSatelliteData.eve.desc, 
    //                 mockSatelliteData.eve.image, 
    //                 mockSatelliteData.eve.website,
    //                 mockSatelliteData.eve.satelliteFee
    //             )
    //             await chai.expect(registerAsSatelliteOperation.send()).to.be.rejected;

    //             // Reset admin
    //             togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("registerAsSatellite", false).send();
    //             await togglePauseOperation.confirmation();

    //             // Assertions
    //             assert.equal(isPausedStart, false);
    //             assert.equal(isPausedEnd, true);

    //         } catch(e){
    //             console.dir(e, {depth: 5});
    //         }
    //     });

    //     it('Admin should be able to call the entrypoint and pause or unpause the registerSatellite entrypoint', async () => {
    //         try{

    //             // Initial Values
    //             delegationStorage       = await delegationInstance.storage();
    //             const isPausedStart     = delegationStorage.breakGlassConfig.unregisterAsSatelliteIsPaused

    //             // Operation
    //             togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("unregisterAsSatellite", true).send();
    //             await togglePauseOperation.confirmation();

    //             // Final values
    //             delegationStorage       = await delegationInstance.storage();
    //             const isPausedEnd       = delegationStorage.breakGlassConfig.unregisterAsSatelliteIsPaused

    //             unregisterAsSatelliteOperation = delegationInstance.methods.unregisterAsSatellite(bob.pkh);
    //             await chai.expect(unregisterAsSatelliteOperation.send()).to.be.rejected;

    //             // Reset admin
    //             togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("unregisterAsSatellite", false).send();
    //             await togglePauseOperation.confirmation();

    //             // Assertions
    //             assert.equal(isPausedStart, false);
    //             assert.equal(isPausedEnd, true);

    //         } catch(e){
    //             console.dir(e, {depth: 5});
    //         }
    //     });
        
    //     it('Admin should be able to call the entrypoint and pause or unpause the updateSatellite entrypoint', async () => {
    //         try{
    //             // Initial Values
    //             delegationStorage       = await delegationInstance.storage();
    //             const isPausedStart     = delegationStorage.breakGlassConfig.updateSatelliteRecordIsPaused

    //             // Operation
    //             togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("updateSatelliteRecord", true).send();
    //             await togglePauseOperation.confirmation();

    //             // Final values
    //             delegationStorage       = await delegationInstance.storage();
    //             const isPausedEnd       = delegationStorage.breakGlassConfig.updateSatelliteRecordIsPaused

    //             await chai.expect(delegationInstance.methods
    //                 .updateSatelliteRecord(
    //                     mockSatelliteData.eve.name, 
    //                     mockSatelliteData.eve.desc, 
    //                     mockSatelliteData.eve.image, 
    //                     mockSatelliteData.eve.website,
    //                     mockSatelliteData.eve.satelliteFee
    //                 ).send()
    //             ).to.be.rejected;

    //             // Reset admin
    //             togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("updateSatelliteRecord", false).send();
    //             await togglePauseOperation.confirmation();

    //             // Assertions
    //             assert.equal(isPausedStart, false);
    //             assert.equal(isPausedEnd, true);
    //         } catch(e){
    //             console.dir(e, {depth: 5});
    //         }
    //     });
        
    //     it('Non-admin should not be able to call the entrypoint', async () => {
    //         try{

    //             await helperFunctions.signerFactory(tezos, alice.sk);
    //             togglePauseOperation = delegationInstance.methods.togglePauseEntrypoint("updateSatelliteRecord", true);
    //             await chai.expect(togglePauseOperation.send()).to.be.rejected;

    //         } catch(e){
    //             console.dir(e, {depth: 5});
    //         }
    //     });
    // })

    // describe("%pauseAll", async () => {

    //     beforeEach("Set signer to admin", async () => {
    //         await helperFunctions.signerFactory(tezos, bob.sk)
    //     });

    //     it('Admin should be able to call the entrypoint and pause all entrypoints in the contract', async () => {
    //         try{
    //             // Initial Values
    //             delegationStorage       = await delegationInstance.storage();
    //             for (let [key, value] of Object.entries(delegationStorage.breakGlassConfig)){
    //                 assert.equal(value, false);
    //             }

    //             // pause all operation
    //             pauseAllOperation = await delegationInstance.methods.pauseAll().send();
    //             await pauseAllOperation.confirmation();

    //             // Final values
    //             delegationStorage       = await delegationInstance.storage();
    //             for (let [key, value] of Object.entries(delegationStorage.breakGlassConfig)){
    //                 assert.equal(value, true);
    //             }

    //         } catch(e){
    //             console.dir(e, {depth: 5});
    //         }
    //     });
    //     it('Non-admin should not be able to call the entrypoint', async () => {
    //         try{
                
    //             await helperFunctions.signerFactory(tezos, alice.sk);

    //             // pause all operation
    //             pauseAllOperation = delegationInstance.methods.pauseAll();
    //             await chai.expect(pauseAllOperation.send()).to.be.rejected;

    //         } catch(e){
    //             console.dir(e, {depth: 5});
    //         }
    //     });
    // })

    // describe("%unpauseAll", async () => {

    //     beforeEach("Set signer to admin", async () => {
    //         await helperFunctions.signerFactory(tezos, bob.sk)
    //     });

    //     it('Admin should be able to call the entrypoint and unpause all entrypoints in the contract', async () => {
    //         try{

    //             // Initial Values
    //             delegationStorage = await delegationInstance.storage();
    //             for (let [key, value] of Object.entries(delegationStorage.breakGlassConfig)){
    //                 assert.equal(value, true);
    //             }

    //             // unpause all operation
    //             unpauseAllOperation = await delegationInstance.methods.unpauseAll().send();
    //             await unpauseAllOperation.confirmation();

    //             // Final values
    //             delegationStorage = await delegationInstance.storage();
    //             for (let [key, value] of Object.entries(delegationStorage.breakGlassConfig)){
    //                 assert.equal(value, false);
    //             }

    //         } catch(e){
    //             console.dir(e, {depth: 5});
    //         }
    //     });
    //     it('Non-admin should not be able to call the entrypoint', async () => {
    //         try{

    //             await helperFunctions.signerFactory(tezos, alice.sk);

    //             // unpause all operation
    //             unpauseAllOperation = delegationInstance.methods.unpauseAll();
    //             await chai.expect(unpauseAllOperation.send()).to.be.rejected;

    //         } catch(e){
    //             console.dir(e, {depth: 5});
    //         }
    //     });
    // })



    describe("Housekeeping Entrypoints", async () => {

        beforeEach("Set signer to admin (bob)", async () => {
            delegationStorage        = await delegationInstance.storage();
            await helperFunctions.signerFactory(tezos, bob.sk);
        });

        it('%setAdmin                 - admin (bob) should be able to update the contract admin address', async () => {
            try{
                
                // Initial Values
                delegationStorage   = await delegationInstance.storage();
                const currentAdmin  = delegationStorage.admin;

                // Operation
                setAdminOperation   = await delegationInstance.methods.setAdmin(alice.pkh).send();
                await setAdminOperation.confirmation();

                // Final values
                delegationStorage   = await delegationInstance.storage();
                const newAdmin      = delegationStorage.admin;

                // Assertions
                assert.notStrictEqual(newAdmin, currentAdmin);
                assert.strictEqual(newAdmin, alice.pkh);
                assert.strictEqual(currentAdmin, bob.pkh);

                // reset admin
                await helperFunctions.signerFactory(tezos, alice.sk);
                resetAdminOperation = await delegationInstance.methods.setAdmin(bob.pkh).send();
                await resetAdminOperation.confirmation();

            } catch(e){
                console.log(e);
            }
        });

        it('%setGovernance            - admin (bob) should be able to update the contract governance address', async () => {
            try{
                
                // Initial Values
                delegationStorage       = await delegationInstance.storage();
                const currentGovernance = delegationStorage.governanceAddress;

                // Operation
                setGovernanceOperation = await delegationInstance.methods.setGovernance(alice.pkh).send();
                await setGovernanceOperation.confirmation();

                // Final values
                delegationStorage       = await delegationInstance.storage();
                const updatedGovernance = delegationStorage.governanceAddress;

                // reset governance
                setGovernanceOperation = await delegationInstance.methods.setGovernance(contractDeployments.governance.address).send();
                await setGovernanceOperation.confirmation();

                // Assertions
                assert.notStrictEqual(updatedGovernance, currentGovernance);
                assert.strictEqual(updatedGovernance, alice.pkh);
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
                const updateOperation = await delegationInstance.methods.updateMetadata(key, hash).send();
                await updateOperation.confirmation();

                // Final values
                delegationStorage       = await delegationInstance.storage();            

                const updatedData       = await delegationStorage.metadata.get(key);
                assert.equal(hash, updatedData);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('%updateConfig             - admin (bob) should be able to update contract config', async () => {
            try{
                
                // Initial Values
                delegationStorage                    = await delegationInstance.storage();
                const initialMinimumStakedMvkBalance = delegationStorage.config.minimumStakedMvkBalance.toNumber();
                const newMinimumStakedMvkBalance     = MVK(50);

                // Operation
                const updateConfigOperation = await delegationInstance.methods.updateConfig(newMinimumStakedMvkBalance, "configMinimumStakedMvkBalance").send();
                await updateConfigOperation.confirmation();

                // Final values
                delegationStorage           = await delegationInstance.storage();
                const updatedConfigValue = delegationStorage.config.minimumStakedMvkBalance.toNumber();

                // Assertions
                assert.equal(updatedConfigValue, newMinimumStakedMvkBalance);

                // reset config operation
                const resetConfigOperation = await delegationInstance.methods.updateConfig(initialMinimumStakedMvkBalance, "configMinimumStakedMvkBalance").send();
                await resetConfigOperation.confirmation();

                // Final values
                delegationStorage        = await delegationInstance.storage();
                const resetConfigValue   = delegationStorage.config.minimumStakedMvkBalance.toNumber();

                assert.equal(resetConfigValue, initialMinimumStakedMvkBalance);


            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%updateWhitelistContracts - admin (bob) should be able to add user (eve) to the Whitelisted Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "whitelistContracts";

                initialContractMapValue           = await helperFunctions.getStorageMapValue(delegationStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await helperFunctions.updateWhitelistContracts(delegationInstance, contractMapKey, eve.pkh, 'update');
                await updateWhitelistContractsOperation.confirmation()

                delegationStorage = await delegationInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(delegationStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'Eve (key) should not be in the Whitelist Contracts map before adding her to it')
                assert.strictEqual(updatedContractMapValue, eve.pkh,  'Eve (key) should be in the Whitelist Contracts map after adding her to it')

            } catch (e) {
                console.log(e)
            }
        })

        it('%updateWhitelistContracts - admin (bob) should be able to remove user (eve) from the Whitelisted Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "whitelistContracts";

                initialContractMapValue = await helperFunctions.getStorageMapValue(delegationStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await helperFunctions.updateWhitelistContracts(delegationInstance, contractMapKey, eve.pkh, 'remove');
                await updateWhitelistContractsOperation.confirmation()

                delegationStorage = await delegationInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(delegationStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, eve.pkh, 'Eve (key) should be in the Whitelist Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, undefined, 'Eve (key) should not be in the Whitelist Contracts map after adding her to it');

            } catch (e) {
                console.log(e)
            }
        })

        it('%updateGeneralContracts   - admin (bob) should be able to add user (eve) to the General Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "generalContracts";

                initialContractMapValue = await helperFunctions.getStorageMapValue(delegationStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await helperFunctions.updateGeneralContracts(delegationInstance, contractMapKey, eve.pkh, 'update');
                await updateGeneralContractsOperation.confirmation()

                delegationStorage = await delegationInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(delegationStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'eve (key) should not be in the General Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, eve.pkh, 'eve (key) should be in the General Contracts map after adding her to it');

            } catch (e) {
                console.log(e)
            }
        })

        it('%updateGeneralContracts   - admin (bob) should be able to remove user (eve) from the General Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "generalContracts";

                initialContractMapValue = await helperFunctions.getStorageMapValue(delegationStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await helperFunctions.updateGeneralContracts(delegationInstance, contractMapKey, eve.pkh, 'remove');
                await updateGeneralContractsOperation.confirmation()

                delegationStorage = await delegationInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(delegationStorage, storageMap, contractMapKey);

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
                user              = mallory.pkh;
                userSk            = mallory.sk;

                // Mistaken Operation - user (mallory) send 10 MavrykFa2Tokens to MVK Token Contract
                await helperFunctions.signerFactory(tezos, userSk);
                transferOperation = await helperFunctions.fa2Transfer(mavrykFa2TokenInstance, user, delegationAddress, tokenId, tokenAmount);
                await transferOperation.confirmation();
                
                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage();
                const initialUserBalance    = (await mavrykFa2TokenStorage.ledger.get(user)).toNumber()

                await helperFunctions.signerFactory(tezos, bob.sk);
                mistakenTransferOperation = await helperFunctions.mistakenTransferFa2Token(delegationInstance, user, contractDeployments.mavrykFa2Token.address, tokenId, tokenAmount).send();
                await mistakenTransferOperation.confirmation();

                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage();
                const updatedUserBalance    = (await mavrykFa2TokenStorage.ledger.get(user)).toNumber();

                // increase in updated balance
                assert.equal(updatedUserBalance, initialUserBalance + tokenAmount);

            } catch (e) {
                console.log(e)
            }
        })

    });



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
                delegationStorage                   = await delegationInstance.storage();
                const initialConfigValue            = delegationStorage.config.minimumStakedMvkBalance;
                const newMinimumStakedMvkBalance    = MVK(10);

                // Operation
                const updateConfigOperation = await delegationInstance.methods.updateConfig(newMinimumStakedMvkBalance, "configMinimumStakedMvkBalance");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                // Final values
                delegationStorage        = await delegationInstance.storage();
                const updatedConfigValue = delegationStorage.config.minMvkAmount;

                // check that there is no change in config values
                assert.equal(updatedConfigValue.toNumber(), initialConfigValue.toNumber());
                assert.notEqual(updatedConfigValue.toNumber(), newMinimumStakedMvkBalance);
                
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

                updateWhitelistContractsOperation = await delegationInstance.methods.updateWhitelistContracts(contractMapKey, alice.pkh, 'update')
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

                updateGeneralContractsOperation = await delegationInstance.methods.updateGeneralContracts(contractMapKey, alice.pkh, 'update')
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
                mistakenTransferOperation = await helperFunctions.mistakenTransferFa2Token(delegationInstance, mallory.pkh, contractDeployments.mavrykFa2Token.address, tokenId, tokenAmount).send();
                await mistakenTransferOperation.confirmation();

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
