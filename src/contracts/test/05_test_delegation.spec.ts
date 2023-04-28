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

import { bob, alice, eve, mallory, oscar, ivan, trudy } from "../scripts/sandbox/accounts";
import * as helperFunctions from './helpers/helperFunctions'
import { mockSatelliteData } from "./helpers/mockSampleData"

// ------------------------------------------------------------------------------
// Contract Notes
// ------------------------------------------------------------------------------

// For testing of satellite's voting power: see x2_test_voting_power_ratio
// For testing of satellite's distribution of rewards: see 34_test_delegation_distribute_rewards

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
    let midSatelliteRecord
    let updatedSatelliteRecord 
    
    let initialUserStakedRecord
    let initialUserStakedBalance

    let updatedUserStakedRecord
    let updatedUserStakedBalance

    let initialDelegateRecord
    let midDelegateRecord
    let updatedDelegateRecord

    let initialMinimumStakedMvkRequirement
    let updatedMinimumStakedMvkRequirement

    let initialTotalDelegatedAmount
    let updatedTotalDelegatedAmount

    let isPausedStart 
    let isPausedEnd

    // operations
    let transferOperation
    let updateOperatorsOperation
    let removeOperatorsOperation
    let stakeOperation
    let unstakeOperation
    let updateSatelliteRecordOperation
    let registerAsSatelliteOperation
    let unregisterAsSatelliteOperation
    let delegateOperation
    let undelegateOperation
    let redelegateOperation

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

        it('user (alice) should be able to register as a satellite', async () => {
            try{
                
                // init values
                user        = alice.pkh;
                userSk      = alice.sk;
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

                // update user staked balance for assertion check below (satellite's staked mvk balance)
                doormanStorage                      = await doormanInstance.storage();
                initialUserStakedRecord             = await doormanStorage.userStakeBalanceLedger.get(user);
                initialUserStakedBalance            = initialUserStakedRecord.balance.toNumber();

                // if retest: run registerAsSatellite operation if satellite has not been registered yet, and skip for subsequent retesting
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
                    assert.equal(updatedSatelliteRecord.stakedMvkBalance.toNumber(),    initialUserStakedBalance);
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

                // update user staked balance for assertion check below (satellite's staked mvk balance)
                initialUserStakedBalance            = initialUserStakedRecord === undefined ? 0 : initialUserStakedRecord.balance.toNumber()

                // if retest: run registerAsSatellite operation if satellite has not been registered yet, and skip for subsequent retesting
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
                    assert.equal(updatedSatelliteRecord.stakedMvkBalance.toNumber(),    initialUserStakedBalance);
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

        it('user (trudy) should not be able to register as a satellite if she is delegated', async () => {
            try{

                // init values
                user        = trudy.pkh;
                userSk      = trudy.sk;
                satellite   = eve.pkh;
                stakeAmount = 0;

                // set signer to user
                await helperFunctions.signerFactory(tezos, userSk);

                // update storage
                delegationStorage       = await delegationInstance.storage();
                initialDelegateRecord   = await delegationStorage.delegateLedger.get(user);

                // if retest - skip if user is already delegated
                if(initialDelegateRecord == null){

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
                        mockSatelliteData.trudy.name, 
                        mockSatelliteData.trudy.desc, 
                        mockSatelliteData.trudy.image, 
                        mockSatelliteData.trudy.website,
                        mockSatelliteData.trudy.satelliteFee
                    );
                    await chai.expect(registerAsSatelliteOperation.send()).to.be.rejected;

                    // undelegate to reset storage
                    undelegateOperation = await delegationInstance.methods.undelegateFromSatellite(user).send()
                    await undelegateOperation.confirmation()
                }

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('user (trudy) should not be able to call this entrypoint if it is paused', async () => {
            try{

                // pause entrypoint
                await helperFunctions.signerFactory(tezos, adminSk)
                delegationStorage   = await delegationInstance.storage();
                isPausedStart       = delegationStorage.breakGlassConfig.registerAsSatelliteIsPaused

                // toggle pause operation
                togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("registerAsSatellite", true).send();
                await togglePauseOperation.confirmation();

                // init values
                user         = trudy.pkh;
                userSk       = trudy.sk;
                stakeAmount  = MVK(1);
                
                await helperFunctions.signerFactory(tezos, userSk)

                // update operators operation for user
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, user, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();

                // user stake MVK tokens
                stakeOperation = await doormanInstance.methods.stake(stakeAmount).send();
                await stakeOperation.confirmation();

                // Final values
                delegationStorage   = await delegationInstance.storage();
                isPausedEnd         = delegationStorage.breakGlassConfig.registerAsSatelliteIsPaused

                registerAsSatelliteOperation = delegationInstance.methods.registerAsSatellite(
                    mockSatelliteData.eve.name, 
                    mockSatelliteData.eve.desc, 
                    mockSatelliteData.eve.image, 
                    mockSatelliteData.eve.website,
                    mockSatelliteData.eve.satelliteFee
                );
                await chai.expect(registerAsSatelliteOperation.send()).to.be.rejected;

                // unpause entrypoint
                await helperFunctions.signerFactory(tezos, adminSk)
                togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("registerAsSatellite", false).send();
                await togglePauseOperation.confirmation();

                // Assertions
                assert.equal(isPausedStart, false);
                assert.equal(isPausedEnd, true);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('user (trudy) should not be able to call this entrypoint if the doorman contract is not referenced in the generalContracts map', async () => {
            try{

                // remove doorman contract reference from governance contract generalContracts map
                await helperFunctions.signerFactory(tezos, adminSk)
                var updateOperation = await governanceInstance.methods.updateGeneralContracts("doorman", doormanAddress, 'remove').send()
                await updateOperation.confirmation();

                // init values
                user         = trudy.pkh;
                userSk       = trudy.sk;
                stakeAmount  = 0;

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
                    mockSatelliteData.trudy.name, 
                    mockSatelliteData.trudy.desc, 
                    mockSatelliteData.trudy.image, 
                    mockSatelliteData.trudy.website,
                    mockSatelliteData.trudy.satelliteFee
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

        it('user (trudy) should not be able to register as a satellite if she does not meet the minimum staked MVK requirement', async () => {
            try{

                // init values
                user    = trudy.pkh;
                userSk  = trudy.sk;

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

    });

    describe("%unregisterAsSatellite", async () => {

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

        it('non-satellite user (trudy) should not be able to unregister as a satellite', async () => {
            try{
                
                // init values
                user    = trudy.pkh;
                userSk  = trudy.sk;

                // set signer to user
                await helperFunctions.signerFactory(tezos, userSk);
                
                // fail to unregister as a satellite
                unregisterAsSatelliteOperation = delegationInstance.methods.unregisterAsSatellite(user);
                await chai.expect(unregisterAsSatelliteOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('satellite (eve) should not be able to call this entrypoint if the entrypoint is paused', async () => {
            try{

                // pause entrypoint
                await helperFunctions.signerFactory(tezos, adminSk)
                delegationStorage   = await delegationInstance.storage();
                isPausedStart       = delegationStorage.breakGlassConfig.unregisterAsSatelliteIsPaused

                // toggle pause operation
                togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("unregisterAsSatellite", true).send();
                await togglePauseOperation.confirmation();

                // init values
                user         = eve.pkh;
                userSk       = eve.sk;
                
                await helperFunctions.signerFactory(tezos, userSk)

                // Final values
                delegationStorage   = await delegationInstance.storage();
                isPausedEnd         = delegationStorage.breakGlassConfig.unregisterAsSatelliteIsPaused

                await helperFunctions.signerFactory(tezos, alice.sk)
                unregisterAsSatelliteOperation = delegationInstance.methods.unregisterAsSatellite(user);
                await chai.expect(unregisterAsSatelliteOperation.send()).to.be.rejected;

                // unpause operation
                await helperFunctions.signerFactory(tezos, adminSk)
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

        it('satellite (eve) should be able to update her satellite record', async () => {
            try{

                // init values
                satellite   = eve.pkh;
                satelliteSk = eve.sk;

                // set signer to satellite
                await helperFunctions.signerFactory(tezos, satelliteSk);
                
                // init values
                delegationStorage               = await delegationInstance.storage();
                initialSatelliteRecord          = await delegationStorage.satelliteLedger.get(satellite);

                // eve updates satellite record (use alice's mock satellite data)
                updateSatelliteRecordOperation = await delegationInstance.methods.updateSatelliteRecord(
                    mockSatelliteData.alice.name, 
                    mockSatelliteData.alice.desc, 
                    mockSatelliteData.alice.image, 
                    mockSatelliteData.alice.website,
                    mockSatelliteData.alice.satelliteFee
                ).send();
                await updateSatelliteRecordOperation.confirmation();

                // Check state after registering as satellite
                delegationStorage         = await delegationInstance.storage();
                updatedSatelliteRecord    = await delegationStorage.satelliteLedger.get(satellite);
                
                // check that satellite record is updated
                assert.equal(updatedSatelliteRecord.name,             mockSatelliteData.alice.name);
                assert.equal(updatedSatelliteRecord.description,      mockSatelliteData.alice.desc);
                assert.equal(updatedSatelliteRecord.website,          mockSatelliteData.alice.website);
                assert.equal(updatedSatelliteRecord.satelliteFee,     mockSatelliteData.alice.satelliteFee);
                assert.equal(updatedSatelliteRecord.image,            mockSatelliteData.alice.image);

                // Check that updated record is not equal to old record
                assert.notEqual(updatedSatelliteRecord.name,          initialSatelliteRecord.name);
                assert.notEqual(updatedSatelliteRecord.description,   initialSatelliteRecord.description);
                assert.notEqual(updatedSatelliteRecord.website,       initialSatelliteRecord.website);
                assert.notEqual(updatedSatelliteRecord.satelliteFee,  initialSatelliteRecord.satelliteFee);
                assert.notEqual(updatedSatelliteRecord.image,         initialSatelliteRecord.image);

                // reset satellite info back to eve
                updateSatelliteRecordOperation = await delegationInstance.methods.updateSatelliteRecord(
                    mockSatelliteData.eve.name, 
                    mockSatelliteData.eve.desc, 
                    mockSatelliteData.eve.image, 
                    mockSatelliteData.eve.website,
                    mockSatelliteData.eve.satelliteFee
                ).send();
                await updateSatelliteRecordOperation.confirmation();

                // Check state after registering as satellite
                delegationStorage         = await delegationInstance.storage();
                updatedSatelliteRecord    = await delegationStorage.satelliteLedger.get(satellite);

                // check that satellite record is reset
                assert.equal(updatedSatelliteRecord.name,                       initialSatelliteRecord.name);
                assert.equal(updatedSatelliteRecord.description,                initialSatelliteRecord.description);
                assert.equal(updatedSatelliteRecord.website,                    initialSatelliteRecord.website);
                assert.equal(updatedSatelliteRecord.image,                      initialSatelliteRecord.image);
                assert.equal(updatedSatelliteRecord.satelliteFee.toNumber(),    initialSatelliteRecord.satelliteFee.toNumber());

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('non-satellite (trudy) should not be able to call this entrypoint', async () => {
            try{

                // init values
                user    = trudy.pkh;
                userSk  = trudy.sk;

                // set signer to user
                await helperFunctions.signerFactory(tezos, userSk);

                // non-user fails to update satellite record
                updateSatelliteRecordOperation = await delegationInstance.methods.updateSatelliteRecord(
                    mockSatelliteData.eve.name, 
                    mockSatelliteData.eve.desc, 
                    mockSatelliteData.eve.image, 
                    mockSatelliteData.eve.website,
                    mockSatelliteData.eve.satelliteFee
                );
                await chai.expect(updateSatelliteRecordOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('satellite (eve) should not be able to call this entrypoint if the entrypoint is paused', async () => {
            try{

                // pause entrypoint
                await helperFunctions.signerFactory(tezos, adminSk)
                delegationStorage   = await delegationInstance.storage();
                isPausedStart       = delegationStorage.breakGlassConfig.updateSatelliteRecordIsPaused

                // toggle pause operation
                togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("updateSatelliteRecord", true).send();
                await togglePauseOperation.confirmation();

                // init values
                user    = eve.pkh;
                userSk  = eve.sk;

                // set signer to user
                await helperFunctions.signerFactory(tezos, userSk);

                // Final values
                delegationStorage   = await delegationInstance.storage();
                isPausedEnd         = delegationStorage.breakGlassConfig.updateSatelliteRecordIsPaused

                await chai.expect(delegationInstance.methods.updateSatelliteRecord(
                    mockSatelliteData.eve.name, 
                    mockSatelliteData.eve.desc, 
                    mockSatelliteData.eve.image, 
                    mockSatelliteData.eve.website,
                    mockSatelliteData.eve.satelliteFee
                ).send()
                ).to.be.rejected;

                // unpause entrypoint
                await helperFunctions.signerFactory(tezos, adminSk)
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

        // todo: add one more test for multiple users delegating to a satellite

        it('user (trudy) should be able to delegate her staked MVK to a satellite', async () => {
            try{

                // init values
                user        = trudy.pkh;
                userSk      = trudy.sk;
                satellite   = eve.pkh;
                stakeAmount = MVK(1);

                // set signer to user
                await helperFunctions.signerFactory(tezos, userSk);

                // Initial Values
                delegationStorage           = await delegationInstance.storage();
                doormanStorage              = await doormanInstance.storage();

                initialUserStakedRecord     = await doormanStorage.userStakeBalanceLedger.get(user);
                initialUserStakedBalance    = initialUserStakedRecord === undefined ? 0 : initialUserStakedRecord.balance.toNumber()
                initialDelegateRecord       = await delegationStorage.delegateLedger.get(user);
                initialSatelliteRecord      = await delegationStorage.satelliteLedger.get(satellite);
                initialTotalDelegatedAmount = initialSatelliteRecord.totalDelegatedAmount.toNumber();

                // if retest - skip if user is already delegated
                if(initialDelegateRecord == null){

                    // update operators operation for user
                    updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, user, doormanAddress, tokenId);
                    await updateOperatorsOperation.confirmation();

                    // stake operation
                    stakeOperation = await doormanInstance.methods.stake(stakeAmount).send();
                    await stakeOperation.confirmation();

                    // delegate operation
                    delegateOperation   = await delegationInstance.methods.delegateToSatellite(user, satellite).send();
                    await delegateOperation.confirmation();

                    // Final values
                    delegationStorage           = await delegationInstance.storage();
                    doormanStorage              = await doormanInstance.storage();

                    updatedUserStakedRecord     = await doormanStorage.userStakeBalanceLedger.get(user);
                    updatedUserStakedBalance    = updatedUserStakedRecord === undefined ? 0 : updatedUserStakedRecord.balance.toNumber()
                    updatedDelegateRecord       = await delegationStorage.delegateLedger.get(user);
                    updatedSatelliteRecord      = await delegationStorage.satelliteLedger.get(satellite);
                    updatedTotalDelegatedAmount = updatedSatelliteRecord.totalDelegatedAmount.toNumber();

                    assert.strictEqual(updatedDelegateRecord.satelliteAddress, satellite)
                    assert.equal(updatedTotalDelegatedAmount, initialTotalDelegatedAmount + updatedUserStakedBalance)

                }
                
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('user (trudy) should be able to re-delegate his staked MVK and change satellite', async () => {
            try{

                // init values
                user        = trudy.pkh;
                userSk      = trudy.sk;
                satellite   = alice.pkh;

                // set signer to user
                await helperFunctions.signerFactory(tezos, userSk);

                // user redelegates to another satellite (from eve to alice)
                delegationStorage               = await delegationInstance.storage();
                doormanStorage                  = await doormanInstance.storage();
                
                initialDelegateRecord           = await delegationStorage.delegateLedger.get(user);
                initialUserStakedRecord         = await doormanStorage.userStakeBalanceLedger.get(user);
                initialUserStakedBalance        = initialUserStakedRecord === undefined ? 0 : initialUserStakedRecord.balance.toNumber()
                
                const previousSatellite                       = initialDelegateRecord.satelliteAddress;
                const previousSatelliteRecord                 = await delegationStorage.satelliteLedger.get(previousSatellite);
                const previousSatelliteTotalDelegatedAmount   = previousSatelliteRecord.totalDelegatedAmount.toNumber();

                const newSatelliteRecord                      = await delegationStorage.satelliteLedger.get(satellite);
                const newSatelliteTotalDelegatedAmount        = newSatelliteRecord.totalDelegatedAmount.toNumber();
                    
                // redelegate operation
                redelegateOperation       = await delegationInstance.methods.delegateToSatellite(user, satellite).send();
                await redelegateOperation.confirmation();
                
                // update storage
                delegationStorage               = await delegationInstance.storage();
                doormanStorage                  = await doormanInstance.storage();

                updatedDelegateRecord             = await delegationStorage.delegateLedger.get(user);

                const updatedPreviousSatelliteRecord                = await delegationStorage.satelliteLedger.get(previousSatellite);
                const updatedPreviousSatelliteTotalDelegatedAmount  = updatedPreviousSatelliteRecord.totalDelegatedAmount.toNumber();

                const updatedNewSatelliteRecord                 = await delegationStorage.satelliteLedger.get(satellite);
                const updatedNewSatelliteTotalDelegatedAmount   = updatedNewSatelliteRecord.totalDelegatedAmount.toNumber();

                // check that user is now delegated to the new satellite
                assert.strictEqual(updatedDelegateRecord.satelliteAddress, satellite)

                // check that the total delegated amount of previous and new satellite have changed accordingly
                assert.equal(updatedPreviousSatelliteTotalDelegatedAmount, previousSatelliteTotalDelegatedAmount - initialUserStakedBalance);
                assert.equal(updatedNewSatelliteTotalDelegatedAmount, newSatelliteTotalDelegatedAmount + initialUserStakedBalance);

                // reset delegate operation
                redelegateOperation       = await delegationInstance.methods.delegateToSatellite(user, previousSatellite).send();
                await redelegateOperation.confirmation();

                // update storage
                delegationStorage          = await delegationInstance.storage();
                updatedDelegateRecord      = await delegationStorage.delegateLedger.get(user);

                // check that user is now delegated to the previous satellite
                assert.strictEqual(updatedDelegateRecord.satelliteAddress, previousSatellite)

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('user (trudy) should not be able to delegate to the same satellite again', async () => {
            try{
                
                // init values
                user        = trudy.pkh;
                userSk      = trudy.sk;
                satellite   = eve.pkh;

                // set signer to user
                await helperFunctions.signerFactory(tezos, userSk);

                delegateOperation = delegationInstance.methods.delegateToSatellite(user, satellite);
                await chai.expect(delegateOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('user (trudy) should not be able to delegate to a non-existent satellite', async () => {
            try{

                // init values
                user            = trudy.pkh;
                userSk          = trudy.sk;
                satellite       = ivan.pkh; 
                stakeAmount     = MVK(1);

                // initial storage
                delegationStorage        = await delegationInstance.storage();
                initialSatelliteRecord   = await delegationStorage.satelliteLedger.get(satellite);

                // update operators operation for user
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, user, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();

                stakeOperation = await doormanInstance.methods.stake(stakeAmount).send();
                await stakeOperation.confirmation();

                delegateOperation = delegationInstance.methods.delegateToSatellite(user, satellite);
                await chai.expect(delegateOperation.send()).to.be.rejected;

                // updated storage
                delegationStorage          = await delegationInstance.storage();
                updatedSatelliteRecord     = await delegationStorage.satelliteLedger.get(satellite);
                
                assert.strictEqual(initialSatelliteRecord, undefined);
                assert.strictEqual(updatedSatelliteRecord, undefined);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('satellite (eve) should not be able to call this entrypoint', async () => {
            try{

                // init values
                user        = eve.pkh;
                userSk      = eve.sk;

                // init values
                await helperFunctions.signerFactory(tezos, userSk);

                // delegate operation
                delegateOperation = delegationInstance.methods.delegateToSatellite(user, user);
                await chai.expect(delegateOperation.send()).to.be.rejected;

                // Final values
                delegationStorage   = await delegationInstance.storage();

                const delegateRecord = await delegationStorage.delegateLedger.get(user)
                assert.strictEqual(delegateRecord, undefined)

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('user (oscar) should not be able to call this entrypoint if it is paused', async () => {
            try{

                // pause entrypoint
                await helperFunctions.signerFactory(tezos, adminSk)
                delegationStorage   = await delegationInstance.storage();
                isPausedStart       = delegationStorage.breakGlassConfig.delegateToSatelliteIsPaused

                // toggle pause operation
                togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("delegateToSatellite", true).send();
                await togglePauseOperation.confirmation();

                // init values
                user        = oscar.pkh;
                userSk      = oscar.sk;
                satellite   = eve.pkh;
                stakeAmount = MVK(1);

                // set signer to user
                await helperFunctions.signerFactory(tezos, userSk);

                // update operators operation for user
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, user, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();
    
                stakeOperation = await doormanInstance.methods.stake(stakeAmount).send();
                await stakeOperation.confirmation();
                
                // updated storage
                delegationStorage   = await delegationInstance.storage();
                isPausedEnd         = delegationStorage.breakGlassConfig.delegateToSatelliteIsPaused

                // delegate operation
                delegateOperation = delegationInstance.methods.delegateToSatellite(user, satellite);
                await chai.expect(delegateOperation.send()).to.be.rejected;

                // unpause entrypoint
                await helperFunctions.signerFactory(tezos, adminSk)
                togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("delegateToSatellite", false).send();
                await togglePauseOperation.confirmation();

                // Assertions
                assert.equal(isPausedStart, false);
                assert.equal(isPausedEnd, true);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('user (oscar) should not be able to call the entrypoint if the contract doesn’t have the doorman contract in the generalContracts map', async () => {
            try{

                // remove doorman contract reference from governance contract generalContracts map
                await helperFunctions.signerFactory(tezos, adminSk)
                var updateOperation = await governanceInstance.methods.updateGeneralContracts("doorman", doormanAddress, 'remove').send()
                await updateOperation.confirmation();

                // init values
                user         = trudy.pkh;
                userSk       = trudy.sk;
                satellite    = eve.pkh;

                // set signer to user
                await helperFunctions.signerFactory(tezos, userSk)

                // Initial values
                delegateOperation = delegationInstance.methods.delegateToSatellite(user, satellite);
                await chai.expect(delegateOperation.send()).to.be.rejected;

                // Reset operation
                await helperFunctions.signerFactory(tezos, adminSk)
                var updateOperation = await governanceInstance.methods.updateGeneralContracts("doorman", doormanAddress, 'update').send()
                await updateOperation.confirmation();

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

    })

    describe("%undelegateFromSatellite", async () => {

        it('satellite (eve) should not be able to call this entrypoint', async () => {
            try{

                // init values
                user        = alice.pkh;
                userSk      = alice.sk;
                
                // set signer to user
                await helperFunctions.signerFactory(tezos, userSk);

                // initial storage
                delegationStorage           = await delegationInstance.storage();
                initialDelegateRecord       = await delegationStorage.delegateLedger.get(user)

                // undelegate operation
                undelegateOperation = delegationInstance.methods.undelegateFromSatellite(user);
                await chai.expect(undelegateOperation.send()).to.be.rejected;

                // updated storage
                delegationStorage           = await delegationInstance.storage();
                updatedDelegateRecord       = await delegationStorage.delegateLedger.get(user)

                // check that there is no delegate record
                assert.strictEqual(initialDelegateRecord, undefined)
                assert.strictEqual(updatedDelegateRecord, undefined)

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('user (trudy) should not be able to call this entrypoint if it is paused', async () => {
            try{


                // pause entrypoint
                await helperFunctions.signerFactory(tezos, adminSk)
                delegationStorage   = await delegationInstance.storage();
                isPausedStart       = delegationStorage.breakGlassConfig.undelegateFromSatelliteIsPaused

                // toggle pause operation
                togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("undelegateFromSatellite", true).send();
                await togglePauseOperation.confirmation();

                // init values
                user        = trudy.pkh;
                userSk      = trudy.sk;

                // set signer to user
                await helperFunctions.signerFactory(tezos, userSk);

                undelegateOperation = delegationInstance.methods.undelegateFromSatellite(user);
                await chai.expect(undelegateOperation.send()).to.be.rejected;

                // updated storage
                delegationStorage   = await delegationInstance.storage();
                isPausedEnd         = delegationStorage.breakGlassConfig.undelegateFromSatelliteIsPaused
                
                // unpause entrypoint
                await helperFunctions.signerFactory(tezos, adminSk)
                togglePauseOperation = await delegationInstance.methods.togglePauseEntrypoint("undelegateFromSatellite", false).send();
                await togglePauseOperation.confirmation();

                // Assertions
                assert.equal(isPausedStart, false);
                assert.equal(isPausedEnd, true);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('user (oscar) should not be able to undelegate if he has never delegated before', async () => {
            try{

                // init values
                user        = oscar.pkh;
                userSk      = oscar.sk;
                stakeAmount = MVK(1);
                
                // set signer to user
                await helperFunctions.signerFactory(tezos, userSk);

                // update operators operation for user
                updateOperatorsOperation = await helperFunctions.updateOperators(mvkTokenInstance, user, doormanAddress, tokenId);
                await updateOperatorsOperation.confirmation();
    
                stakeOperation = await doormanInstance.methods.stake(stakeAmount).send();
                await stakeOperation.confirmation();

                undelegateOperation = await delegationInstance.methods.undelegateFromSatellite(user);
                await chai.expect(undelegateOperation.send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('user (oscar) should not be able to call the entrypoint if the doorman contract is missing', async () => {
            try{

                // remove doorman contract reference from governance contract generalContracts map
                await helperFunctions.signerFactory(tezos, adminSk)
                var updateOperation = await governanceInstance.methods.updateGeneralContracts("doorman", doormanAddress, 'remove').send()
                await updateOperation.confirmation();

                // init values
                user         = oscar.pkh;
                userSk       = oscar.sk;
                satellite    = eve.pkh;

                // Initial values
                await helperFunctions.signerFactory(tezos, userSk);
                delegateOperation = delegationInstance.methods.delegateToSatellite(user, satellite);
                await chai.expect(delegateOperation.send()).to.be.rejected;

                // Reset operation
                await helperFunctions.signerFactory(tezos, adminSk)
                var updateOperation = await governanceInstance.methods.updateGeneralContracts("doorman", doormanAddress, 'update').send()
                await updateOperation.confirmation();

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('user (trudy) should be able to call this entrypoint and undelegate her staked MVK from her satellite', async () => {
            try{

                // init values
                user        = trudy.pkh;
                userSk      = trudy.sk;

                // set signer to user
                await helperFunctions.signerFactory(tezos, userSk);

                // initial storage
                delegationStorage           = await delegationInstance.storage();
                doormanStorage              = await doormanInstance.storage();

                initialUserStakedRecord     = await doormanStorage.userStakeBalanceLedger.get(user);
                initialUserStakedBalance    = initialUserStakedRecord === undefined ? 0 : initialUserStakedRecord.balance.toNumber()

                initialDelegateRecord       = await delegationStorage.delegateLedger.get(user);
                satellite                   = initialDelegateRecord.satelliteAddress;
                initialSatelliteRecord      = await delegationStorage.satelliteLedger.get(satellite); 
                initialTotalDelegatedAmount = initialSatelliteRecord.totalDelegatedAmount.toNumber();

                // Operation
                undelegateOperation   = await delegationInstance.methods.undelegateFromSatellite(user).send();
                await undelegateOperation.confirmation();

                // Final Values
                delegationStorage           = await delegationInstance.storage();
                updatedDelegateRecord       = await delegationStorage.delegateLedger.get(user);
                updatedSatelliteRecord      = await delegationStorage.satelliteLedger.get(satellite);         
                updatedTotalDelegatedAmount = updatedSatelliteRecord.totalDelegatedAmount.toNumber();

                // check that delegate record is removed after undelegation
                assert.notStrictEqual(initialDelegateRecord, undefined);
                assert.strictEqual(updatedDelegateRecord, undefined);

                // check that satellite total delegated amount has decreased accordingly
                assert.equal(updatedTotalDelegatedAmount, initialTotalDelegatedAmount - initialUserStakedBalance);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        })

        it('user (trudy) should be able to undelegate her staked MVK from a satellite even if the satellite re-registered', async () => {
            try{

                // init values
                user        = trudy.pkh;
                userSk      = trudy.sk;
                satellite   = eve.pkh;
                satelliteSk = eve.sk;

                // delegate operation
                delegateOperation   = await delegationInstance.methods.delegateToSatellite(user, satellite).send();
                await delegateOperation.confirmation();
                
                // initial storage
                delegationStorage        = await delegationInstance.storage();
                initialSatelliteRecord   = await delegationStorage.satelliteLedger.get(satellite);
                initialDelegateRecord    = await delegationStorage.delegateLedger.get(user);

                // check initial state
                // i) delegate record should still exist 
                // ii) satellite registered time should be equal to delegate's satellite registered time
                // iii) satellite should have non-zero total delegated amount
                assert.notStrictEqual(initialDelegateRecord, undefined);
                assert.strictEqual(initialSatelliteRecord.registeredDateTime, initialDelegateRecord.satelliteRegisteredDateTime);
                assert.notEqual(initialSatelliteRecord.totalDelegatedAmount.toNumber(), 0);

                // Re-register operation
                await helperFunctions.signerFactory(tezos, satelliteSk);
                
                // unregisters as satellite
                unregisterAsSatelliteOperation = await delegationInstance.methods.unregisterAsSatellite(satellite).send();
                await unregisterAsSatelliteOperation.confirmation();

                // registers as satellite again
                registerAsSatelliteOperation  = await delegationInstance.methods.registerAsSatellite(
                    mockSatelliteData.eve.name, 
                    mockSatelliteData.eve.desc, 
                    mockSatelliteData.eve.image,
                    mockSatelliteData.eve.website,
                    mockSatelliteData.eve.satelliteFee
                ).send();
                await registerAsSatelliteOperation.confirmation();
                
                // mid-test storage
                delegationStorage     = await delegationInstance.storage();
                midSatelliteRecord    = await delegationStorage.satelliteLedger.get(satellite);
                midDelegateRecord     = await delegationStorage.delegateLedger.get(user);

                // check mid-state 
                // i) delegate record should still exist 
                // ii) satellite re-registered time should not be equal to delegate's satellite registered time
                // iii) satellite should have total delegated amount reset to 0
                assert.notStrictEqual(midDelegateRecord, undefined);
                assert.notStrictEqual(midSatelliteRecord.registeredDateTime, initialDelegateRecord.satelliteRegisteredDateTime);
                assert.equal(midSatelliteRecord.totalDelegatedAmount.toNumber(), 0);

                // undelegate operation
                await helperFunctions.signerFactory(tezos, userSk);
                undelegateOperation   = await delegationInstance.methods.undelegateFromSatellite(user).send();
                await undelegateOperation.confirmation();

                // final storage
                delegationStorage       = await delegationInstance.storage();
                updatedSatelliteRecord  = await delegationStorage.satelliteLedger.get(satellite);
                updatedDelegateRecord   = await delegationStorage.delegateLedger.get(user);

                // final assertions
                // i) delegate should be able to undelegate successfully
                // ii) mid-state satellite registered time should be equal to final satellite registered time
                // iii) final satellite's total delegated amount should be decreased accordingly by user staked MVK amount
                assert.strictEqual(updatedDelegateRecord, undefined);
                assert.strictEqual(midSatelliteRecord.registeredDateTime, updatedSatelliteRecord.registeredDateTime);                
                assert.equal(updatedSatelliteRecord.totalDelegatedAmount.toNumber(), 0);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        })

        it('user (trudy) should be able to automatically undelegate from a re-registered satellite during an %onStakeChange call (e.g. from a staking operation)', async () => {
            try{

                // init values
                user        = trudy.pkh;
                userSk      = trudy.sk;
                satellite   = eve.pkh;
                satelliteSk = eve.sk;

                // delegate operation
                delegateOperation   = await delegationInstance.methods.delegateToSatellite(user, satellite).send();
                await delegateOperation.confirmation();
                
                // initial storage
                delegationStorage        = await delegationInstance.storage();
                initialSatelliteRecord   = await delegationStorage.satelliteLedger.get(satellite);
                initialDelegateRecord    = await delegationStorage.delegateLedger.get(user);
                stakeAmount              = MVK(2);

                // check initial state
                // i) delegate record should still exist 
                // ii) satellite registered time should be equal to delegate's satellite registered time
                // iii) satellite should have non-zero total delegated amount
                assert.notStrictEqual(initialDelegateRecord, undefined);
                assert.strictEqual(initialSatelliteRecord.registeredDateTime, initialDelegateRecord.satelliteRegisteredDateTime);
                assert.notEqual(initialSatelliteRecord.totalDelegatedAmount.toNumber(), 0);

                // Re-register operation
                await helperFunctions.signerFactory(tezos, satelliteSk);

                // unregister as a satellite
                unregisterAsSatelliteOperation = await delegationInstance.methods.unregisterAsSatellite(satellite).send();
                await unregisterAsSatelliteOperation.confirmation();
                
                // registers as a satellite again
                registerAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite(
                    mockSatelliteData.eve.name, 
                    mockSatelliteData.eve.desc, 
                    mockSatelliteData.eve.image,
                    mockSatelliteData.eve.website,
                    mockSatelliteData.eve.satelliteFee
                ).send();
                await registerAsSatelliteOperation.confirmation();
                
                // mid-test storage
                delegationStorage     = await delegationInstance.storage();
                midSatelliteRecord    = await delegationStorage.satelliteLedger.get(satellite);
                midDelegateRecord     = await delegationStorage.delegateLedger.get(user);

                // check mid-state 
                // i) delegate record should still exist 
                // ii) satellite re-registered time should not be equal to delegate's satellite registered time
                // iii) satellite should have total delegated amount reset to 0
                assert.notStrictEqual(midDelegateRecord, undefined);
                assert.notStrictEqual(midSatelliteRecord.registeredDateTime, initialDelegateRecord.satelliteRegisteredDateTime);
                assert.equal(midSatelliteRecord.totalDelegatedAmount.toNumber(), 0);

                // user stake operation and trigger %onStakeChange
                await helperFunctions.signerFactory(tezos, userSk);
                stakeOperation = await doormanInstance.methods.stake(stakeAmount).send();
                await stakeOperation.confirmation();

                // final storage
                delegationStorage       = await delegationInstance.storage();
                updatedSatelliteRecord  = await delegationStorage.satelliteLedger.get(satellite);
                updatedDelegateRecord   = await delegationStorage.delegateLedger.get(user);

                // final assertions
                // i) delegate should be automatically undelegated after staking operation
                // ii) mid-state satellite registered time should be equal to final satellite registered time
                // iii) final satellite's total delegated amount should still be set to 0
                assert.strictEqual(updatedDelegateRecord, undefined);
                assert.strictEqual(midSatelliteRecord.registeredDateTime, updatedSatelliteRecord.registeredDateTime);
                assert.equal(updatedSatelliteRecord.totalDelegatedAmount.toNumber(), 0);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        })

    })


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
                console.dir(e, {depth: 5});
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
                console.dir(e, {depth: 5});
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
                console.dir(e, {depth: 5})
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
                console.dir(e, {depth: 5})
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
                console.dir(e, {depth: 5})
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
                console.dir(e, {depth: 5})
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
                console.dir(e, {depth: 5})
            }
        })

        it('%pauseAll                 - admin (bob) should be able to pause all entrypoints in the contract', async () => {
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


        it('%unpauseAll               - admin (bob) should be able to unpause all entrypoints in the contract', async () => {
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


        it("%togglePauseEntrypoint    - admin (bob) should be able to call this entrypoint", async() => {
            try{
                
                // pause operations

                pauseOperation = await delegationInstance.methods.togglePauseEntrypoint("delegateToSatellite", true).send();
                await pauseOperation.confirmation();
                
                pauseOperation = await delegationInstance.methods.togglePauseEntrypoint("undelegateFromSatellite", true).send();
                await pauseOperation.confirmation();

                pauseOperation = await delegationInstance.methods.togglePauseEntrypoint("registerAsSatellite", true).send(); 
                await pauseOperation.confirmation();

                pauseOperation = await delegationInstance.methods.togglePauseEntrypoint("unregisterAsSatellite", true).send();
                await pauseOperation.confirmation();

                pauseOperation = await delegationInstance.methods.togglePauseEntrypoint("updateSatelliteRecord", true).send();
                await pauseOperation.confirmation();

                pauseOperation = await delegationInstance.methods.togglePauseEntrypoint("distributeReward", true).send();
                await pauseOperation.confirmation();

                // update storage
                delegationStorage              = await delegationInstance.storage();

                // check that all entrypoints are paused
                for (let [key, value] of Object.entries(delegationStorage.breakGlassConfig)){
                    assert.equal(value, true);
                }

                // unpause operations

                unpauseOperation = await delegationInstance.methods.togglePauseEntrypoint("delegateToSatellite", false).send();
                await unpauseOperation.confirmation();
                
                unpauseOperation = await delegationInstance.methods.togglePauseEntrypoint("undelegateFromSatellite", false).send();
                await unpauseOperation.confirmation();

                unpauseOperation = await delegationInstance.methods.togglePauseEntrypoint("registerAsSatellite", false).send();
                await unpauseOperation.confirmation();

                unpauseOperation = await delegationInstance.methods.togglePauseEntrypoint("unregisterAsSatellite", false).send();
                await unpauseOperation.confirmation();

                unpauseOperation = await delegationInstance.methods.togglePauseEntrypoint("updateSatelliteRecord", false).send();
                await unpauseOperation.confirmation();

                unpauseOperation = await delegationInstance.methods.togglePauseEntrypoint("distributeReward", false).send();
                await unpauseOperation.confirmation();

                // update storage
                delegationStorage              = await delegationInstance.storage();

                // check that all entrypoints are unpaused
                for (let [key, value] of Object.entries(delegationStorage.breakGlassConfig)){
                    assert.equal(value, false);
                }

            } catch(e) {
                console.dir(e, {depth: 5})
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
                console.dir(e, {depth: 5});
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
                console.dir(e, {depth: 5});
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
                delegationStorage                   = await delegationInstance.storage();
                const updatedConfigValue            = delegationStorage.config.minimumStakedMvkBalance;

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
                console.dir(e, {depth: 5})
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
                console.dir(e, {depth: 5})
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
                mistakenTransferOperation = await helperFunctions.mistakenTransferFa2Token(delegationInstance, mallory.pkh, contractDeployments.mavrykFa2Token.address, tokenId, tokenAmount);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch (e) {
                console.dir(e, {depth: 5})
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


        it("%distributeReward         - non-admin (mallory) should not be able to call this entrypoint", async() => {
            try{

                const distributeRewardOperation = delegationInstance.methods.distributedReward([eve.pkh],MVK(50)); 
                await chai.expect(distributeRewardOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%onStakeChange            - non-admin (mallory) should not be able to call this entrypoint", async() => {
            try{

                // calling onStakeChange on herself
                var onStakeChangeOperation = delegationInstance.methods.onStakeChange(mallory.pkh); 
                await chai.expect(onStakeChangeOperation.send()).to.be.rejected;

                // calling onStakeChange on satellite (eve)
                onStakeChangeOperation = delegationInstance.methods.onStakeChange(eve.pkh); 
                await chai.expect(onStakeChangeOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%updateSatelliteStatus    - non-admin (mallory) should not be able to call this entrypoint", async() => {
            try{

                var updateSatelliteStatusOperation = delegationInstance.methods.updateSatelliteStatus(eve.pkh, "SUSPENDED"); 
                await chai.expect(updateSatelliteStatusOperation.send()).to.be.rejected;

                updateSatelliteStatusOperation = delegationInstance.methods.updateSatelliteStatus(eve.pkh, "BANNED"); 
                await chai.expect(updateSatelliteStatusOperation.send()).to.be.rejected;

                updateSatelliteStatusOperation = delegationInstance.methods.updateSatelliteStatus(eve.pkh, "ACTIVE"); 
                await chai.expect(updateSatelliteStatusOperation.send()).to.be.rejected;

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
