import assert from "assert";
import { Utils } from "./helpers/Utils";

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

import { bob, alice, eve, mallory, susie, oscar, ivan, trudy } from "../scripts/sandbox/accounts";
import * as helperFunctions from './helpers/helperFunctions'
import { mockSatelliteData } from "./helpers/mockSampleData"

// ------------------------------------------------------------------------------
// Contract Notes
// ------------------------------------------------------------------------------

// For setup of satellties for subsequent tests
//   - satellites: alice, eve, susie, oscar, trudy

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("Setup: Mock Satellites", async () => {
    
    // default
    var utils : Utils
    var tezos

    let user
    let userSk
    let admin
    let adminSk

    // basic inputs for updating operators
    let doormanAddress
    let delegationAddress
    let tokenId = 0

    let stakeAmount

    // contract instances
    let doormanInstance
    let delegationInstance
    let mvkTokenInstance

    // contract storages
    let doormanStorage
    let delegationStorage
    let mvkTokenStorage

    let initialSatelliteRecord
    let updatedSatelliteRecord 
    
    let initialUserStakedRecord
    let initialUserStakedBalance

    let updatedUserStakedRecord
    let updatedUserStakedBalance

    let initialMinimumStakedMvkRequirement
    let updatedMinimumStakedMvkRequirement

    // operations
    let updateOperatorsOperation
    let stakeOperation
    let registerAsSatelliteOperation


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
            
        doormanStorage          = await doormanInstance.storage();
        delegationStorage       = await delegationInstance.storage();
        mvkTokenStorage         = await mvkTokenInstance.storage();

        console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')

    });

    describe("Setup mock satellites for subsequent tests", async () => {

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
                    
                    // check satellite details
                    assert.equal(updatedSatelliteRecord.name,                           mockSatelliteData.eve.name);
                    assert.equal(updatedSatelliteRecord.description,                    mockSatelliteData.eve.desc);
                    assert.equal(updatedSatelliteRecord.website,                        mockSatelliteData.eve.website);
                    assert.equal(updatedSatelliteRecord.stakedMvkBalance.toNumber(),    stakeAmount);
                    assert.equal(updatedSatelliteRecord.satelliteFee,                   mockSatelliteData.eve.satelliteFee);
                    assert.equal(updatedSatelliteRecord.totalDelegatedAmount,           0);
                    assert.equal(updatedSatelliteRecord.status,                         "ACTIVE");

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
                    
                    // check satellite details
                    assert.equal(updatedSatelliteRecord.name,                           mockSatelliteData.eve.name);
                    assert.equal(updatedSatelliteRecord.description,                    mockSatelliteData.eve.desc);
                    assert.equal(updatedSatelliteRecord.website,                        mockSatelliteData.eve.website);
                    assert.equal(updatedSatelliteRecord.stakedMvkBalance.toNumber(),    initialUserStakedBalance);
                    assert.equal(updatedSatelliteRecord.satelliteFee,                   mockSatelliteData.eve.satelliteFee);
                    assert.equal(updatedSatelliteRecord.totalDelegatedAmount,           0);
                    assert.equal(updatedSatelliteRecord.status,                         "ACTIVE");

                }

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('user (susie) should be able to register as a satellite', async () => {
            try{
                
                // init values
                user        = susie.pkh;
                userSk      = susie.sk;
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
                    
                    // check satellite details
                    assert.equal(updatedSatelliteRecord.name,                           mockSatelliteData.eve.name);
                    assert.equal(updatedSatelliteRecord.description,                    mockSatelliteData.eve.desc);
                    assert.equal(updatedSatelliteRecord.website,                        mockSatelliteData.eve.website);
                    assert.equal(updatedSatelliteRecord.stakedMvkBalance.toNumber(),    stakeAmount);
                    assert.equal(updatedSatelliteRecord.satelliteFee,                   mockSatelliteData.eve.satelliteFee);
                    assert.equal(updatedSatelliteRecord.totalDelegatedAmount,           0);
                    assert.equal(updatedSatelliteRecord.status,                         "ACTIVE");

                }

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('user (oscar) should be able to register as a satellite', async () => {
            try{
                
                // init values
                user        = oscar.pkh;
                userSk      = oscar.sk;
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
                    
                    // check satellite details
                    assert.equal(updatedSatelliteRecord.name,                           mockSatelliteData.eve.name);
                    assert.equal(updatedSatelliteRecord.description,                    mockSatelliteData.eve.desc);
                    assert.equal(updatedSatelliteRecord.website,                        mockSatelliteData.eve.website);
                    assert.equal(updatedSatelliteRecord.stakedMvkBalance.toNumber(),    initialUserStakedBalance);
                    assert.equal(updatedSatelliteRecord.satelliteFee,                   mockSatelliteData.eve.satelliteFee);
                    assert.equal(updatedSatelliteRecord.totalDelegatedAmount,           0);
                    assert.equal(updatedSatelliteRecord.status,                         "ACTIVE");
                }

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('user (trudy) should be able to register as a satellite', async () => {
            try{
                
                // init values
                user        = trudy.pkh;
                userSk      = trudy.sk;
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
                    
                    // check satellite details
                    assert.equal(updatedSatelliteRecord.name,                           mockSatelliteData.eve.name);
                    assert.equal(updatedSatelliteRecord.description,                    mockSatelliteData.eve.desc);
                    assert.equal(updatedSatelliteRecord.website,                        mockSatelliteData.eve.website);
                    assert.equal(updatedSatelliteRecord.stakedMvkBalance.toNumber(),    initialUserStakedBalance);
                    assert.equal(updatedSatelliteRecord.satelliteFee,                   mockSatelliteData.eve.satelliteFee);
                    assert.equal(updatedSatelliteRecord.totalDelegatedAmount,           0);
                    assert.equal(updatedSatelliteRecord.status,                         "ACTIVE");

                }

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

    });

});
