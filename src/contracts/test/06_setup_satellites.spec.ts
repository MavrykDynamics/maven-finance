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

import { bob, alice, eve, mallory, susie, oscar, ivan, trudy, isaac, david } from "../scripts/sandbox/accounts";
import * as helperFunctions from './helpers/helperFunctions'
import { mockSatelliteData } from "./helpers/mockSampleData"

// ------------------------------------------------------------------------------
// Contract Notes
// ------------------------------------------------------------------------------

// For setup of satellties for subsequent tests
//   - satellites: alice, eve, susie, oscar, trudy
//   - delegates:
//          eve satellite: david, ivan, isaac
//          alice satellite: mallory
//          susie satellite: none
//          oscar satellite: none
//          trudy satellite: none
//    

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

    let satellite

    // basic inputs for updating operators
    let doormanAddress
    let delegationAddress
    let tokenId = 0

    let stakeAmount
    let stakeBonusAmount = MVK(700)

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

    let initialDelegateRecord
    let updatedDelegateRecord

    let initialTotalDelegatedAmount
    let updatedTotalDelegatedAmount

    // operations
    let updateOperatorsOperation
    let stakeOperation
    let delegateOperation
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

                initialMinimumStakedMvkRequirement  = delegationStorage.config.minimumStakedMvkBalance.toNumber();
                initialUserStakedRecord             = await doormanStorage.userStakeBalanceLedger.get(user);
                initialUserStakedBalance            = initialUserStakedRecord === undefined ? 0 : initialUserStakedRecord.balance.toNumber()
                
                // check that user has sufficient staked balance
                if(initialUserStakedBalance < initialMinimumStakedMvkRequirement + stakeBonusAmount){

                    stakeAmount = Math.abs(initialUserStakedBalance - initialMinimumStakedMvkRequirement) + stakeBonusAmount;

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
                        mockSatelliteData.alice.name, 
                        mockSatelliteData.alice.desc, 
                        mockSatelliteData.alice.image, 
                        mockSatelliteData.alice.website,
                        mockSatelliteData.alice.satelliteFee,
                        mockSatelliteData.alice.oraclePublicKey,
                        mockSatelliteData.alice.oraclePeerId
                    ).send();
                    await registerAsSatelliteOperation.confirmation();

                    // check state after registering as satellite
                    delegationStorage               = await delegationInstance.storage();
                    updatedSatelliteRecord          = await delegationStorage.satelliteLedger.get(user);         
                    
                    // check satellite details
                    assert.equal(updatedSatelliteRecord.name,                           mockSatelliteData.alice.name);
                    assert.equal(updatedSatelliteRecord.description,                    mockSatelliteData.alice.desc);
                    assert.equal(updatedSatelliteRecord.website,                        mockSatelliteData.alice.website);
                    assert.equal(updatedSatelliteRecord.stakedMvkBalance.toNumber(),    initialUserStakedBalance);
                    assert.equal(updatedSatelliteRecord.satelliteFee,                   mockSatelliteData.alice.satelliteFee);
                    assert.equal(updatedSatelliteRecord.oraclePublicKey,                mockSatelliteData.alice.oraclePublicKey);
                    assert.equal(updatedSatelliteRecord.oraclePeerId,                   mockSatelliteData.alice.oraclePeerId);
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

                initialMinimumStakedMvkRequirement  = delegationStorage.config.minimumStakedMvkBalance.toNumber();;
                initialUserStakedRecord             = await doormanStorage.userStakeBalanceLedger.get(user);
                initialUserStakedBalance            = initialUserStakedRecord === undefined ? 0 : initialUserStakedRecord.balance.toNumber()

                // check that user has sufficient staked balance
                if(initialUserStakedBalance < initialMinimumStakedMvkRequirement + stakeBonusAmount){

                    stakeAmount = Math.abs(initialUserStakedBalance - initialMinimumStakedMvkRequirement) + stakeBonusAmount;

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
                        mockSatelliteData.eve.satelliteFee,
                        mockSatelliteData.eve.oraclePublicKey,
                        mockSatelliteData.eve.oraclePeerId
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
                    assert.equal(updatedSatelliteRecord.oraclePublicKey,                mockSatelliteData.eve.oraclePublicKey);
                    assert.equal(updatedSatelliteRecord.oraclePeerId,                   mockSatelliteData.eve.oraclePeerId);
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

                initialMinimumStakedMvkRequirement  = delegationStorage.config.minimumStakedMvkBalance.toNumber();;
                initialUserStakedRecord             = await doormanStorage.userStakeBalanceLedger.get(user);
                initialUserStakedBalance            = initialUserStakedRecord === undefined ? 0 : initialUserStakedRecord.balance.toNumber()

                // check that user has sufficient staked balance
                if(initialUserStakedBalance < initialMinimumStakedMvkRequirement + stakeBonusAmount){

                    stakeAmount = Math.abs(initialUserStakedBalance - initialMinimumStakedMvkRequirement) + stakeBonusAmount;

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
                        mockSatelliteData.susie.name, 
                        mockSatelliteData.susie.desc, 
                        mockSatelliteData.susie.image, 
                        mockSatelliteData.susie.website,
                        mockSatelliteData.susie.satelliteFee,
                        mockSatelliteData.susie.oraclePublicKey,
                        mockSatelliteData.susie.oraclePeerId
                    ).send();
                    await registerAsSatelliteOperation.confirmation();

                    // check state after registering as satellite
                    delegationStorage               = await delegationInstance.storage();
                    updatedSatelliteRecord          = await delegationStorage.satelliteLedger.get(user);         
                    
                    // check satellite details
                    assert.equal(updatedSatelliteRecord.name,                           mockSatelliteData.susie.name);
                    assert.equal(updatedSatelliteRecord.description,                    mockSatelliteData.susie.desc);
                    assert.equal(updatedSatelliteRecord.website,                        mockSatelliteData.susie.website);
                    assert.equal(updatedSatelliteRecord.stakedMvkBalance.toNumber(),    stakeAmount);
                    assert.equal(updatedSatelliteRecord.satelliteFee,                   mockSatelliteData.susie.satelliteFee);
                    assert.equal(updatedSatelliteRecord.oraclePublicKey,                mockSatelliteData.susie.oraclePublicKey);
                    assert.equal(updatedSatelliteRecord.oraclePeerId,                   mockSatelliteData.susie.oraclePeerId);
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

                initialMinimumStakedMvkRequirement  = delegationStorage.config.minimumStakedMvkBalance.toNumber();;
                initialUserStakedRecord             = await doormanStorage.userStakeBalanceLedger.get(user);
                initialUserStakedBalance            = initialUserStakedRecord === undefined ? 0 : initialUserStakedRecord.balance.toNumber()

                // check that user has sufficient staked balance
                if(initialUserStakedBalance < initialMinimumStakedMvkRequirement + stakeBonusAmount){

                    stakeAmount = Math.abs(initialUserStakedBalance - initialMinimumStakedMvkRequirement) + stakeBonusAmount;

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
                        mockSatelliteData.oscar.name, 
                        mockSatelliteData.oscar.desc, 
                        mockSatelliteData.oscar.image, 
                        mockSatelliteData.oscar.website,
                        mockSatelliteData.oscar.satelliteFee,
                        mockSatelliteData.oscar.oraclePublicKey,
                        mockSatelliteData.oscar.oraclePeerId
                    ).send();
                    await registerAsSatelliteOperation.confirmation();

                    // check state after registering as satellite
                    delegationStorage               = await delegationInstance.storage();
                    updatedSatelliteRecord          = await delegationStorage.satelliteLedger.get(user);         
                    
                    // check satellite details
                    assert.equal(updatedSatelliteRecord.name,                           mockSatelliteData.oscar.name);
                    assert.equal(updatedSatelliteRecord.description,                    mockSatelliteData.oscar.desc);
                    assert.equal(updatedSatelliteRecord.website,                        mockSatelliteData.oscar.website);
                    assert.equal(updatedSatelliteRecord.stakedMvkBalance.toNumber(),    initialUserStakedBalance);
                    assert.equal(updatedSatelliteRecord.satelliteFee,                   mockSatelliteData.oscar.satelliteFee);
                    assert.equal(updatedSatelliteRecord.oraclePublicKey,                mockSatelliteData.oscar.oraclePublicKey);
                    assert.equal(updatedSatelliteRecord.oraclePeerId,                   mockSatelliteData.oscar.oraclePeerId);
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

                initialMinimumStakedMvkRequirement  = delegationStorage.config.minimumStakedMvkBalance.toNumber();;
                initialUserStakedRecord             = await doormanStorage.userStakeBalanceLedger.get(user);
                initialUserStakedBalance            = initialUserStakedRecord === undefined ? 0 : initialUserStakedRecord.balance.toNumber()

                // check that user has sufficient staked balance
                if(initialUserStakedBalance < initialMinimumStakedMvkRequirement + stakeBonusAmount){

                    stakeAmount = Math.abs(initialUserStakedBalance - initialMinimumStakedMvkRequirement) + stakeBonusAmount;

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
                        mockSatelliteData.trudy.name, 
                        mockSatelliteData.trudy.desc, 
                        mockSatelliteData.trudy.image, 
                        mockSatelliteData.trudy.website,
                        mockSatelliteData.trudy.satelliteFee,
                        mockSatelliteData.trudy.oraclePublicKey,
                        mockSatelliteData.trudy.oraclePeerId
                    ).send();
                    await registerAsSatelliteOperation.confirmation();

                    // check state after registering as satellite
                    delegationStorage               = await delegationInstance.storage();
                    updatedSatelliteRecord          = await delegationStorage.satelliteLedger.get(user);         
                    updatedUserStakedRecord         = await doormanStorage.userStakeBalanceLedger.get(user);    
                    
                    // check satellite details
                    assert.equal(updatedSatelliteRecord.name,                           mockSatelliteData.trudy.name);
                    assert.equal(updatedSatelliteRecord.description,                    mockSatelliteData.trudy.desc);
                    assert.equal(updatedSatelliteRecord.website,                        mockSatelliteData.trudy.website);
                    assert.equal(updatedSatelliteRecord.stakedMvkBalance.toNumber(),    initialUserStakedBalance);
                    assert.equal(updatedSatelliteRecord.satelliteFee,                   mockSatelliteData.trudy.satelliteFee);
                    assert.equal(updatedSatelliteRecord.oraclePublicKey,                mockSatelliteData.trudy.oraclePublicKey);
                    assert.equal(updatedSatelliteRecord.oraclePeerId,                   mockSatelliteData.trudy.oraclePeerId);
                    assert.equal(updatedSatelliteRecord.totalDelegatedAmount,           0);
                    assert.equal(updatedSatelliteRecord.status,                         "ACTIVE");

                }

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

    });

    describe("Setup delegates to mock satellites for subsequent tests", async () => {

        it('user (david) should be able to delegate his staked MVK to a satellite (eve)', async () => {
            try{

                // init values
                user        = david.pkh;
                userSk      = david.sk;
                satellite   = eve.pkh;
                stakeAmount = MVK(5);

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

        it('user (ivan) should be able to delegate his staked MVK to a satellite (eve)', async () => {
            try{

                // init values
                user        = ivan.pkh;
                userSk      = ivan.sk;
                satellite   = eve.pkh;
                stakeAmount = MVK(5);

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

        it('user (isaac) should be able to delegate his staked MVK to a satellite (eve)', async () => {
            try{

                // init values
                user        = isaac.pkh;
                userSk      = isaac.sk;
                satellite   = eve.pkh;
                stakeAmount = MVK(5);

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

        it('user (mallory) should be able to delegate her staked MVK to a satellite (alice)', async () => {
            try{

                // init values
                user        = mallory.pkh;
                userSk      = mallory.sk;
                satellite   = alice.pkh;
                stakeAmount = MVK(5);

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

    })

});
