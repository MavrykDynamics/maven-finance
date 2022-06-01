// const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
// const { InMemorySigner, importKey } = require("@taquito/signer");
// import assert, { ok, rejects, strictEqual } from "assert";
// import { Utils, zeroAddress, MVK } from "./helpers/Utils";
// import fs from "fs";
// import { confirmOperation } from "../scripts/confirmation";

// const chai = require("chai");
// const chaiAsPromised = require('chai-as-promised');
// chai.use(chaiAsPromised);   
// chai.should();

// import env from "../env";
// import { bob, alice, eve, mallory, oscar } from "../scripts/sandbox/accounts";

// import doormanAddress from '../deployments/doormanAddress.json';
// import delegationAddress from '../deployments/delegationAddress.json';
// import mvkTokenAddress from '../deployments/mvkTokenAddress.json';
// import governanceAddress from '../deployments/governanceAddress.json';

// describe("Delegation tests", async () => {
//     var utils: Utils;
//     var tezos;

//     let doormanInstance;
//     let delegationInstance;
//     let mvkTokenInstance;
//     let governanceInstance;

//     let doormanStorage;
//     let delegationStorage;
//     let mvkTokenStorage;
//     let governanceStorage;
    
//     const signerFactory = async (pk) => {
//         await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
//         return utils.tezos;
//     };

//     before("setup", async () => {

//         utils = new Utils();
//         await utils.init(bob.sk);
        
//         doormanInstance    = await utils.tezos.contract.at(doormanAddress.address);
//         delegationInstance = await utils.tezos.contract.at(delegationAddress.address);
//         mvkTokenInstance   = await utils.tezos.contract.at(mvkTokenAddress.address);
//         governanceInstance = await utils.tezos.contract.at(governanceAddress.address);
            
//         doormanStorage    = await doormanInstance.storage();
//         delegationStorage = await delegationInstance.storage();
//         mvkTokenStorage   = await mvkTokenInstance.storage();
//         governanceStorage = await governanceInstance.storage();

//         console.log('-- -- -- -- -- Delegation Tests -- -- -- --')
//         console.log('Doorman Contract deployed at:', doormanInstance.address);
//         console.log('Delegation Contract deployed at:', delegationInstance.address);
//         console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
//         console.log('Governance Contract deployed at:', governanceInstance.address);
//         console.log('Bob address: ' + bob.pkh);
//         console.log('Alice address: ' + alice.pkh);
//         console.log('Eve address: ' + eve.pkh);

//         tezos = doormanInstance.tezos;

//     });

//     describe("%setAdmin", async () => {
//         beforeEach("Set signer to admin", async () => {
//             await signerFactory(bob.sk)
//         });
//         it('Admin should be able to call this entrypoint and update the contract administrator with a new address', async () => {
//             try{
//                 // Initial Values
//                 delegationStorage = await delegationInstance.storage();
//                 const currentAdmin = delegationStorage.admin;

//                 // Operation
//                 const setAdminOperation = await delegationInstance.methods.setAdmin(alice.pkh).send();
//                 await setAdminOperation.confirmation();

//                 // Final values
//                 delegationStorage = await delegationInstance.storage();
//                 const newAdmin = delegationStorage.admin;

//                 // reset admin
//                 await signerFactory(alice.sk);
//                 const resetAdminOperation = await delegationInstance.methods.setAdmin(bob.pkh).send();
//                 await resetAdminOperation.confirmation();

//                 // Assertions
//                 assert.notStrictEqual(newAdmin, currentAdmin);
//                 assert.strictEqual(newAdmin, alice.pkh);
//                 assert.strictEqual(currentAdmin, bob.pkh);
//             } catch(e){
//                 console.log(e);
//             }
//         });
//         it('Non-admin should not be able to call this entrypoint', async () => {
//             try{
//                 // Initial Values
//                 await signerFactory(alice.sk);
//                 delegationStorage = await delegationInstance.storage();
//                 const currentAdmin = delegationStorage.admin;

//                 // Operation
//                 await chai.expect(delegationInstance.methods.setAdmin(alice.pkh).send()).to.be.rejected;

//                 // Final values
//                 delegationStorage = await delegationInstance.storage();
//                 const newAdmin = delegationStorage.admin;

//                 // Assertions
//                 assert.strictEqual(newAdmin, currentAdmin);
//             } catch(e){
//                 console.log(e);
//             }
//         });
//     });

//     describe("%updateConfig", async () => {
//         beforeEach("Set signer to admin", async () => {
//             await signerFactory(bob.sk)
//         });
//         it('Admin should be able to call the entrypoint and configure the delegation ratio', async () => {
//             try{
//                 // Initial Values
//                 delegationStorage = await delegationInstance.storage();
//                 const newConfigValue = 1;

//                 // Operation
//                 const updateConfigOperation = await delegationInstance.methods.updateConfig(newConfigValue,"configDelegationRatio").send();
//                 await updateConfigOperation.confirmation();

//                 // Final values
//                 delegationStorage = await delegationInstance.storage();
//                 const updateConfigValue = delegationStorage.config.delegationRatio;

//                 // Assertions
//                 assert.equal(updateConfigValue, newConfigValue);
//             } catch(e){
//                 console.log(e);
//             }
//         });
//         it('Admin should not be able to call the entrypoint and configure the delegation ratio if it exceed 100%', async () => {
//             try{
//                 // Initial Values
//                 delegationStorage = await delegationInstance.storage();
//                 const currentConfigValue = delegationStorage.config.delegationRatio;
//                 const newConfigValue = 10001;

//                 // Operation
//                 await chai.expect(delegationInstance.methods.updateConfig(newConfigValue,"configDelegationRatio").send()).to.be.rejected;

//                 // Final values
//                 delegationStorage = await delegationInstance.storage();
//                 const updateConfigValue = delegationStorage.config.delegationRatio;

//                 // Assertions
//                 assert.notEqual(newConfigValue, currentConfigValue);
//                 assert.equal(updateConfigValue.toNumber(), currentConfigValue.toNumber());
//             } catch(e){
//                 console.log(e);
//             }
//         });
//         it('Admin should be able to call the entrypoint and configure the maximum amount of satellites', async () => {
//             try{
//                 // Initial Values
//                 delegationStorage = await delegationInstance.storage();
//                 const newConfigValue = 12345;

//                 // Operation
//                 const updateConfigOperation = await delegationInstance.methods.updateConfig(newConfigValue,"configMaxSatellites").send();
//                 await updateConfigOperation.confirmation();

//                 // Final values
//                 delegationStorage = await delegationInstance.storage();
//                 const updateConfigValue = delegationStorage.config.maxSatellites;

//                 // Assertions
//                 assert.equal(updateConfigValue, newConfigValue);
//             } catch(e){
//                 console.log(e);
//             }
//         });
//         it('Admin should be able to call the entrypoint and configure the minimum sMVK balance to access an entrypoint', async () => {
//             try{
//                 // Initial Values
//                 delegationStorage = await delegationInstance.storage();
//                 const newConfigValue = MVK(0.5);

//                 // Operation
//                 const updateConfigOperation = await delegationInstance.methods.updateConfig(newConfigValue,"configMinimumStakedMvkBalance").send();
//                 await updateConfigOperation.confirmation();

//                 // Final values
//                 delegationStorage = await delegationInstance.storage();
//                 const updateConfigValue = delegationStorage.config.minimumStakedMvkBalance;

//                 // Assertions
//                 assert.equal(updateConfigValue, newConfigValue);
//             } catch(e){
//                 console.log(e);
//             }
//         });
//         it('Admin should not be able to call the entrypoint and configure the minimum sMVK balance if it goes below 0.1MVK', async () => {
//             try{
//                 // Initial Values
//                 delegationStorage = await delegationInstance.storage();
//                 const currentConfigValue = delegationStorage.config.minimumStakedMvkBalance;
//                 const newConfigValue = MVK(0.09);

//                 // Operation
//                 await chai.expect(delegationInstance.methods.updateConfig(newConfigValue,"ConfigMinimumStakedMvkBalance").send()).to.be.rejected;

//                 // Final values
//                 delegationStorage = await delegationInstance.storage();
//                 const updateConfigValue = delegationStorage.config.minimumStakedMvkBalance;

//                 // Assertions
//                 assert.notEqual(newConfigValue, currentConfigValue);
//                 assert.equal(updateConfigValue.toNumber(), currentConfigValue.toNumber());
//             } catch(e){
//                 console.log(e);
//             }
//         });
//         it('Non-admin should not be able to call the entrypoint', async () => {
//             try{
//                 // Initial Values
//                 delegationStorage = await delegationInstance.storage();
//                 const currentConfigValue = delegationStorage.config.minimumStakedMvkBalance;
//                 const newConfigValue = MVK(10);

//                 // Operation
//                 await signerFactory(alice.sk)
//                 await chai.expect(delegationInstance.methods.updateConfig(newConfigValue,"configMinimumStakedMvkBalance").send()).to.be.rejected;

//                 // Final values
//                 delegationStorage = await delegationInstance.storage();
//                 const updateConfigValue = delegationStorage.config.minimumStakedMvkBalance;

//                 // Assertions
//                 assert.equal(updateConfigValue.toNumber(), currentConfigValue.toNumber());
//             } catch(e){
//                 console.log(e);
//             }
//         });
//     });

//     describe("%registerAsSatellite", async () => {
//         beforeEach("Set signer to user", async () => {
//             await signerFactory(eve.sk)
//         });

//         it('User should be able to call this entrypoint', async () => {
//             try{
//                 // init values
//                 const userStake               = MVK(100);
//                 const doormanContractAddress  = doormanAddress.address;
//                 const satelliteName           = "New Satellite (Eve)";
//                 const satelliteDescription    = "New Satellite Description (Eve)";
//                 const satelliteImage          = "https://placeholder.com/300";
//                 const satelliteWebsite        = "https://placeholder.com/300";
//                 const satelliteFee            = "700";

//                 // Bob assigns doorman contract as an operator
//                 const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//                 {
//                     add_operator: {
//                         owner    : eve.pkh,
//                         operator : doormanContractAddress,
//                         token_id : 0,
//                     },
//                 }])
//                 .send()
//                 await updateOperatorsOperation.confirmation();

//                 // Bob stake 100 MVK tokens
//                 const stakeAmountOperation = await doormanInstance.methods.stake(userStake).send();
//                 await stakeAmountOperation.confirmation();

//                 // Check state before registering as satellite
//                 const beforeDelegationLedgerBob  = await delegationStorage.satelliteLedger.get(eve.pkh);        // should return null or undefined
//                 const beforeBobStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);    // 100 MVK
//                 assert.equal(beforeDelegationLedgerBob,       null);
//                 assert.equal(beforeBobStakedBalance.balance,  userStake);

//                 // Bob registers as a satellite
//                 const registerAsSatelliteOperation = await delegationInstance.methods
//                     .registerAsSatellite(
//                         satelliteName, 
//                         satelliteDescription, 
//                         satelliteImage, 
//                         satelliteWebsite,
//                         satelliteFee
//                     ).send();
//                 await registerAsSatelliteOperation.confirmation();

//                 // Check state after registering as satellite
//                 delegationStorage               = await delegationInstance.storage();
//                 const afterDelegationLedgerBob  = await delegationStorage.satelliteLedger.get(eve.pkh);         // should return bob's satellite record
//                 const afterBobStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);     // 100 MVK
                
//                 // Bob's satellite details
//                 assert.equal(afterDelegationLedgerBob.name,                   satelliteName);
//                 assert.equal(afterDelegationLedgerBob.description,            satelliteDescription);
//                 assert.equal(afterDelegationLedgerBob.website,                satelliteWebsite);
//                 assert.equal(afterDelegationLedgerBob.stakedMvkBalance,       userStake);
//                 assert.equal(afterDelegationLedgerBob.satelliteFee,           satelliteFee);
//                 assert.equal(afterDelegationLedgerBob.totalDelegatedAmount,   0);
//                 assert.equal(afterDelegationLedgerBob.status,                 1);

//                 // Bob's staked balance remains the same
//                 assert.equal(afterBobStakedBalance.balance, userStake);
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Delegate should not be able to call this entrypoint', async () => {
//             try{
//                 // Delegate to this satellite
//                 await signerFactory(alice.sk)
//                 const satelliteName           = "New Satellite (Alice)";
//                 const satelliteDescription    = "New Satellite Description (Alice)";
//                 const satelliteImage          = "https://placeholder.com/300";
//                 const satelliteWebsite        = "https://placeholder.com/300";
//                 const satelliteFee            = "700";

//                 // Initial Values
//                 delegationStorage       = await delegationInstance.storage();
//                 const stakeAmount       = MVK(10);

//                 // Operation
//                 const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//                 {
//                     add_operator: {
//                         owner    : alice.pkh,
//                         operator : doormanAddress.address,
//                         token_id : 0,
//                     },
//                 }])
//                 .send()
//                 await updateOperatorsOperation.confirmation();
    
//                 const stakeAmountOperation = await doormanInstance.methods.stake(stakeAmount).send();
//                 await stakeAmountOperation.confirmation();

//                 const delegationOperation   = await delegationInstance.methods.delegateToSatellite(alice.pkh, eve.pkh).send();
//                 await delegationOperation.confirmation();

//                 // Final values
//                 delegationStorage           = await delegationInstance.storage();
//                 doormanStorage              = await doormanInstance.storage();
//                 const stakeRecord           = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
//                 const delegateRecord        = await delegationStorage.delegateLedger.get(alice.pkh);
//                 const satelliteRecord       = await delegationStorage.satelliteLedger.get(eve.pkh);
//                 assert.strictEqual(delegateRecord.satelliteAddress, eve.pkh)
//                 assert.equal(satelliteRecord.totalDelegatedAmount.toNumber(), stakeRecord.balance.toNumber())

//                 // Delegate try to register
//                 await chai.expect(delegationInstance.methods
//                     .registerAsSatellite(
//                         satelliteName, 
//                         satelliteDescription, 
//                         satelliteImage, 
//                         satelliteWebsite,
//                         satelliteFee
//                     ).send()
//                 ).to.be.rejected;

//                 // Unregister and undelegate to reset storage
//                 const undelegateOperation = await delegationInstance.methods.undelegateFromSatellite(alice.pkh).send()
//                 await undelegateOperation.confirmation()
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('User should not be able to call this entrypoint if it is pause', async () => {
//             try{
//                 // Initial Values
//                 await signerFactory(bob.sk)
//                 delegationStorage       = await delegationInstance.storage();
//                 const isPausedStart     = delegationStorage.breakGlassConfig.registerAsSatelliteIsPaused
//                 const satelliteName           = "New Satellite (Eve)";
//                 const satelliteDescription    = "New Satellite Description (Eve)";
//                 const satelliteWebsite        = "https://placeholder.com/300";
//                 const satelliteImage          = "https://placeholder.com/300";
//                 const satelliteFee            = "700";

//                 // Operation
//                 var togglePauseOperation = await delegationInstance.methods.togglePauseRegisterSatellite().send();
//                 await togglePauseOperation.confirmation();

//                 // Final values
//                 delegationStorage       = await delegationInstance.storage();
//                 const isPausedEnd       = delegationStorage.breakGlassConfig.registerAsSatelliteIsPaused

//                 await chai.expect(delegationInstance.methods
//                     .registerAsSatellite(
//                         satelliteName, 
//                         satelliteDescription, 
//                         satelliteImage, 
//                         satelliteWebsite,
//                         satelliteFee
//                     ).send()
//                 ).to.be.rejected;

//                 // Reset admin
//                 var togglePauseOperation = await delegationInstance.methods.togglePauseRegisterSatellite().send();
//                 await togglePauseOperation.confirmation();

//                 // Assertions
//                 assert.equal(isPausedStart, false);
//                 assert.equal(isPausedEnd, true);
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('User should not be able to call this entrypoint if the doorman contract is not referenced in the generalContracts map', async () => {
//             try{
//                 // Update generalContracts
//                 await signerFactory(bob.sk)
//                 var updateOperation = await governanceInstance.methods.updateGeneralContracts("doorman", doormanAddress.address).send()
//                 await updateOperation.confirmation();

//                 // init values
//                 const satelliteName           = "New Satellite (Eve)";
//                 const satelliteDescription    = "New Satellite Description (Eve)";
//                 const satelliteImage          = "https://placeholder.com/300";
//                 const satelliteWebsite        = "https://placeholder.com/300";
//                 const satelliteFee            = "700";

//                 // registers as a satellite
//                 await chai.expect(delegationInstance.methods
//                     .registerAsSatellite(
//                         satelliteName, 
//                         satelliteDescription, 
//                         satelliteImage, 
//                         satelliteWebsite,
//                         satelliteFee
//                     ).send()
//                 ).to.be.rejected;

//                 // Reset generalContracts
//                 updateOperation = await governanceInstance.methods.updateGeneralContracts("doorman", doormanAddress.address).send()
//                 await updateOperation.confirmation();
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('User should not be able to call this entrypoint if the satellite already exists', async () => {
//             try{
//                 // init values
//                 const userStake               = MVK(100);
//                 const doormanContractAddress  = doormanAddress.address;
//                 const satelliteName           = "New Satellite (Eve)";
//                 const satelliteDescription    = "New Satellite Description (Eve)";
//                 const satelliteWebsite        = "https://placeholder.com/300";
//                 const satelliteImage          = "https://placeholder.com/300";
//                 const satelliteFee            = "700";

//                 // Bob assigns doorman contract as an operator
//                 const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//                 {
//                     add_operator: {
//                         owner    : eve.pkh,
//                         operator : doormanContractAddress,
//                         token_id : 0,
//                     },
//                 }])
//                 .send()
//                 await updateOperatorsOperation.confirmation();

//                 // Bob stake 100 MVK tokens
//                 const stakeAmountOperation = await doormanInstance.methods.stake(userStake).send();
//                 await stakeAmountOperation.confirmation();

//                 // User registers as a satellite again
//                 await chai.expect(delegationInstance.methods
//                     .registerAsSatellite(
//                         satelliteName, 
//                         satelliteDescription, 
//                         satelliteImage,
//                         satelliteWebsite,
//                         satelliteFee
//                     ).send()
//                 ).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('User should not be able to call this entrypoint if it doesn’t have the minimum SMVK requirement', async () => {
//             try{
//                 // Operation
//                 await signerFactory(bob.sk)
//                 var updateConfigOperation = await delegationInstance.methods.updateConfig(MVK(130),"configMinimumStakedMvkBalance").send();
//                 await updateConfigOperation.confirmation();

//                 // init values
//                 await signerFactory(mallory.sk)
//                 const userStake               = MVK(1);
//                 const doormanContractAddress  = doormanAddress.address;
//                 const satelliteName           = "New Satellite (Eve)";
//                 const satelliteDescription    = "New Satellite Description (Eve)";
//                 const satelliteWebsite        = "https://placeholder.com/300";
//                 const satelliteImage          = "https://placeholder.com/300";
//                 const satelliteFee            = "700";

//                 // Bob assigns doorman contract as an operator
//                 const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//                 {
//                     add_operator: {
//                         owner    : mallory.pkh,
//                         operator : doormanContractAddress,
//                         token_id : 0,
//                     },
//                 }])
//                 .send()
//                 await updateOperatorsOperation.confirmation();

//                 // Bob stake 100 MVK tokens
//                 const stakeAmountOperation = await doormanInstance.methods.stake(userStake).send();
//                 await stakeAmountOperation.confirmation();

//                 // User registers as a satellite again
//                 await chai.expect(delegationInstance.methods
//                     .registerAsSatellite(
//                         satelliteName, 
//                         satelliteDescription, 
//                         satelliteImage,
//                         satelliteWebsite,
//                         satelliteFee
//                     ).send()
//                 ).to.be.rejected;

//                 // Reset
//                 await signerFactory(bob.sk)
//                 updateConfigOperation = await delegationInstance.methods.updateConfig(MVK(0.5),"configMinimumStakedMvkBalance").send();
//                 await updateConfigOperation.confirmation();
//             } catch(e){
//                 console.log(e);
//             }
//         });
//     });

//     describe("%unregisterAsSatellite", async () => {
//         before("Set new satellite as Alice", async () => {
//             // init values
//             await signerFactory(alice.sk)
//             const userStake               = MVK(100);
//             const doormanContractAddress  = doormanAddress.address;
//             const satelliteName           = "New Satellite (Alice)";
//             const satelliteDescription    = "New Satellite Description (Alice)";
//             const satelliteWebsite        = "https://placeholder.com/300";
//             const satelliteImage          = "https://placeholder.com/300";
//             const satelliteFee            = "700";

//             // Alice assigns doorman contract as an operator
//             const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//             {
//                 add_operator: {
//                     owner    : alice.pkh,
//                     operator : doormanContractAddress,
//                     token_id : 0,
//                 },
//             }])
//             .send()
//             await updateOperatorsOperation.confirmation();

//             // Alice stake 100 MVK tokens
//             const stakeAmountOperation = await doormanInstance.methods.stake(userStake).send();
//             await stakeAmountOperation.confirmation();
//             // Alice registers as a satellite
//             const registerAsSatelliteOperation = await delegationInstance.methods
//                 .registerAsSatellite(
//                     satelliteName, 
//                     satelliteDescription, 
//                     satelliteImage, 
//                     satelliteWebsite,
//                     satelliteFee
//                 ).send();
//             await registerAsSatelliteOperation.confirmation();
//         })

//         beforeEach("Set signer to satellite", async () => {
//             await signerFactory(alice.sk)
//         });

//         it('Satellite should be able to call this entrypoint and unregister', async () => {
//             try{
//                 // Unregisters as a satellite
//                 const unregisterAsSatelliteOperation = await delegationInstance.methods.unregisterAsSatellite(alice.pkh).send();
//                 await unregisterAsSatelliteOperation.confirmation();

//                 // Check state after unregistering as satellite
//                 const satelliteExists  = await delegationStorage.satelliteLedger.get(alice.pkh); // should return null or undefined
//                 assert.equal(satelliteExists,       null);
//             } catch(e){
//                 console.log(e);
//             } 

//         });

//         it('Non-satellite should not be able to call this entrypoint', async () => {
//             try{
//                 // Unregisters as a satellite
//                 await signerFactory(mallory.sk);
//                 await chai.expect(delegationInstance.methods.unregisterAsSatellite(mallory.pkh).send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             } 
//         });

//         it('Satellite should not be able to call this entrypoint if the entrypoint is pause', async () => {
//             try{
//                 // Initial Values
//                 delegationStorage       = await delegationInstance.storage();
//                 const isPausedStart     = delegationStorage.breakGlassConfig.unregisterAsSatelliteIsPaused

//                 // Operation
//                 await signerFactory(bob.sk)
//                 var togglePauseOperation = await delegationInstance.methods.togglePauseUnregisterSatellite().send();
//                 await togglePauseOperation.confirmation();

//                 // Final values
//                 delegationStorage       = await delegationInstance.storage();
//                 const isPausedEnd       = delegationStorage.breakGlassConfig.unregisterAsSatelliteIsPaused

//                 await signerFactory(alice.sk)
//                 await chai.expect(delegationInstance.methods
//                     .unregisterAsSatellite(alice.pkh).send()
//                 ).to.be.rejected;

//                 // Reset admin
//                 await signerFactory(bob.sk)
//                 var togglePauseOperation = await delegationInstance.methods.togglePauseUnregisterSatellite().send();
//                 await togglePauseOperation.confirmation();

//                 // Assertions
//                 assert.equal(isPausedStart, false);
//                 assert.equal(isPausedEnd, true);
//             } catch(e){
//                 console.log(e);
//             } 
//         });
//     });

//     describe("%updateSatelliteRecord", async () => {
//         beforeEach("Set signer to satellite", async () => {
//             await signerFactory(eve.sk)
//         });

//         it('Satellite should be able to call this entrypoint and update its record', async () => {
//             try{
//                 // init values
//                 const userStake                 = MVK(100);
//                 delegationStorage               = await delegationInstance.storage();
//                 const satelliteRecord           = await delegationStorage.satelliteLedger.get(eve.pkh);
//                 const satelliteName             = satelliteRecord.name;
//                 const satelliteDescription      = satelliteRecord.description;
//                 const satelliteWebsite          = satelliteRecord.website;
//                 const satelliteImage            = satelliteRecord.image;
//                 const satelliteFee              = satelliteRecord.satelliteFee;


//                 const updatedSatelliteName           = "Updated Satellite (Eve)";
//                 const updatedSatelliteDescription    = "Updated Satellite Description (Eve)";
//                 const updatedSatelliteWebsite        = "https://holderplace.com/300";
//                 const updatedSatelliteImage          = "https://placeholder.com/300";
//                 const updatedSatelliteFee            = "500";

//                 // Bob registers as a satellite
//                 const updateOperation = await delegationInstance.methods
//                     .updateSatelliteRecord(
//                         updatedSatelliteName, 
//                         updatedSatelliteDescription, 
//                         updatedSatelliteImage,
//                         updatedSatelliteWebsite,
//                         updatedSatelliteFee
//                     ).send();
//                 await updateOperation.confirmation();

//                 // Check state after registering as satellite
//                 delegationStorage               = await delegationInstance.storage();
//                 const updatedSatelliteRecord    = await delegationStorage.satelliteLedger.get(eve.pkh);
                
//                 // Bob's satellite details
//                 assert.strictEqual(updatedSatelliteRecord.name,                   updatedSatelliteName);
//                 assert.strictEqual(updatedSatelliteRecord.description,            updatedSatelliteDescription);
//                 assert.strictEqual(updatedSatelliteRecord.website,            updatedSatelliteWebsite);
//                 assert.equal(updatedSatelliteRecord.satelliteFee,           updatedSatelliteFee);
//                 assert.strictEqual(updatedSatelliteRecord.image,   updatedSatelliteImage);
//                 assert.notStrictEqual(updatedSatelliteRecord.name,                   satelliteName);
//                 assert.notStrictEqual(updatedSatelliteRecord.description,            satelliteDescription);
//                 assert.notStrictEqual(updatedSatelliteRecord.website,            satelliteWebsite);
//                 assert.notEqual(updatedSatelliteRecord.satelliteFee,           satelliteFee);
//                 assert.strictEqual(updatedSatelliteRecord.image,   satelliteImage);
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Non-satellite should not be able to call this entrypoint', async () => {
//             try{
//                 // init values
//                 await signerFactory(mallory.sk);
//                 const updatedSatelliteName          = "New Satellite (Eve)";
//                 const updatedSatelliteDescription   = "New Satellite Description (Eve)";
//                 const updatedSatelliteWebsite       = "https://placeholder.com/300";
//                 const updatedSatelliteImage         = "https://placeholder.com/300";
//                 const updatedSatelliteFee           = "500";

//                 // Bob registers as a satellite
//                 await chai.expect(delegationInstance.methods
//                     .updateSatelliteRecord(
//                         updatedSatelliteName, 
//                         updatedSatelliteDescription, 
//                         updatedSatelliteImage, 
//                         updatedSatelliteWebsite,
//                         updatedSatelliteFee
//                     ).send()
//                 ).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Satellite should not be able to call this entrypoint if the entrypoint is pause', async () => {
//             try{
//                 // Initial Values
//                 delegationStorage       = await delegationInstance.storage();
//                 const isPausedStart     = delegationStorage.breakGlassConfig.updateSatelliteRecordIsPaused
//                 const updatedSatelliteName          = "New Satellite (Eve)";
//                 const updatedSatelliteDescription   = "New Satellite Description (Eve)";
//                 const updatedSatelliteWebsite       = "https://placeholder.com/300";
//                 const updatedSatelliteImage         = "https://placeholder.com/300";
//                 const updatedSatelliteFee           = "500";

//                 // Operation
//                 await signerFactory(bob.sk)
//                 var togglePauseOperation = await delegationInstance.methods.togglePauseUpdateSatellite().send();
//                 await togglePauseOperation.confirmation();

//                 // Final values
//                 delegationStorage       = await delegationInstance.storage();
//                 const isPausedEnd       = delegationStorage.breakGlassConfig.updateSatelliteRecordIsPaused

//                 await signerFactory(eve.sk)
//                 await chai.expect(delegationInstance.methods
//                     .updateSatelliteRecord(
//                         updatedSatelliteName, 
//                         updatedSatelliteDescription, 
//                         updatedSatelliteImage,
//                         updatedSatelliteWebsite,
//                         updatedSatelliteFee
//                     ).send()
//                 ).to.be.rejected;

//                 // Reset admin
//                 await signerFactory(bob.sk)
//                 var togglePauseOperation = await delegationInstance.methods.togglePauseUpdateSatellite().send();
//                 await togglePauseOperation.confirmation();

//                 // Assertions
//                 assert.equal(isPausedStart, false);
//                 assert.equal(isPausedEnd, true);
//             } catch(e){
//                 console.log(e);
//             }
//         });
//     });

//     describe("%delegateToSatellite", async () => {
//         beforeEach("Set signer to user", async () => {
//             await signerFactory(alice.sk)
//         });

//         it('Satellite should not be able to call this entrypoint', async () => {
//             try{
//                 // init values
//                 await signerFactory(eve.sk);
//                 const stakeAmount   = MVK(10);

//                 // Operation
//                 const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//                 {
//                     add_operator: {
//                         owner    : eve.pkh,
//                         operator : doormanAddress.address,
//                         token_id : 0,
//                     },
//                 }])
//                 .send()
//                 await updateOperatorsOperation.confirmation();
    
//                 const stakeAmountOperation = await doormanInstance.methods.stake(stakeAmount).send();
//                 await stakeAmountOperation.confirmation();
    
//                 await chai.expect(delegationInstance.methods.delegateToSatellite(eve.pkh, eve.pkh).send()).to.be.rejected;

//                 // Final values
//                 delegationStorage   = await delegationInstance.storage();
//                 const delegateRecord     = await delegationStorage.delegateLedger.get(eve.pkh)
//                 assert.strictEqual(delegateRecord, undefined)
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('User should not be able to call this entrypoint if it is paused', async () => {
//             try{
//                 // Initial Values
//                 delegationStorage       = await delegationInstance.storage();
//                 const isPausedStart     = delegationStorage.breakGlassConfig.delegateToSatelliteIsPaused
//                 const stakeAmount       = MVK(10);

//                 // Operation
//                 await signerFactory(bob.sk)
//                 const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//                 {
//                     add_operator: {
//                         owner    : bob.pkh,
//                         operator : doormanAddress.address,
//                         token_id : 0,
//                     },
//                 }])
//                 .send()
//                 await updateOperatorsOperation.confirmation();
    
//                 const stakeAmountOperation = await doormanInstance.methods.stake(stakeAmount).send();
//                 await stakeAmountOperation.confirmation();
                
//                 // Operation
//                 var togglePauseOperation = await delegationInstance.methods.togglePauseDelegateToSatellite().send();
//                 await togglePauseOperation.confirmation();

//                 // Final values
//                 delegationStorage       = await delegationInstance.storage();
//                 const isPausedEnd       = delegationStorage.breakGlassConfig.delegateToSatelliteIsPaused

//                 await chai.expect(delegationInstance.methods.delegateToSatellite(bob.pkh, eve.pkh).send()).to.be.rejected;

//                 // Reset admin
//                 var togglePauseOperation = await delegationInstance.methods.togglePauseDelegateToSatellite().send();
//                 await togglePauseOperation.confirmation();

//                 // Assertions
//                 assert.equal(isPausedStart, false);
//                 assert.equal(isPausedEnd, true);
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('User should be able to call this entrypoint and delegate his SMVK to a provided satellite', async () => {
//             try{
//                 // Initial Values
//                 delegationStorage       = await delegationInstance.storage();
//                 const stakeAmount       = MVK(10);

//                 // Operation
//                 const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//                 {
//                     add_operator: {
//                         owner    : alice.pkh,
//                         operator : doormanAddress.address,
//                         token_id : 0,
//                     },
//                 }])
//                 .send()
//                 await updateOperatorsOperation.confirmation();
    
//                 const stakeAmountOperation = await doormanInstance.methods.stake(stakeAmount).send();
//                 await stakeAmountOperation.confirmation();

//                 const delegationOperation   = await delegationInstance.methods.delegateToSatellite(alice.pkh, eve.pkh).send();
//                 await delegationOperation.confirmation();

//                 // Final values
//                 delegationStorage           = await delegationInstance.storage();
//                 doormanStorage              = await doormanInstance.storage();
//                 const stakeRecord           = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
//                 const delegateRecord        = await delegationStorage.delegateLedger.get(alice.pkh);
//                 const satelliteRecord       = await delegationStorage.satelliteLedger.get(eve.pkh);
//                 assert.strictEqual(delegateRecord.satelliteAddress, eve.pkh)
//                 assert.equal(satelliteRecord.totalDelegatedAmount.toNumber(), stakeRecord.balance.toNumber())
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('User should not be able to delegate to the same satellite twice', async () => {
//             try{
//                 await chai.expect(delegationInstance.methods.delegateToSatellite(alice.pkh, eve.pkh).send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('User should not be able to call the entrypoint if the contract doesn’t have the doorman contract in the generalContracts map', async () => {
//             try{
//                 // Update generalContracts
//                 await signerFactory(bob.sk)
//                 var updateOperation = await governanceInstance.methods.updateGeneralContracts("doorman", doormanAddress.address).send()
//                 await updateOperation.confirmation();

//                 // Initial values
//                 await chai.expect(delegationInstance.methods.delegateToSatellite(bob.pkh, eve.pkh).send()).to.be.rejected;

//                 // Reset operation
//                 await signerFactory(bob.sk)
//                 var updateOperation = await governanceInstance.methods.updateGeneralContracts("doorman", doormanAddress.address).send()
//                 await updateOperation.confirmation();
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('User should not be able to call this entrypoint if the provided satellite does not exist', async () => {
//             try{
//                 // Initial values
//                 const userStake = MVK(10);
//                 const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//                 {
//                     add_operator: {
//                         owner    : alice.pkh,
//                         operator : doormanAddress.address,
//                         token_id : 0,
//                     },
//                 }])
//                 .send()
//                 await updateOperatorsOperation.confirmation();
    
//                 const stakeAmountOperation = await doormanInstance.methods.stake(userStake).send();
//                 await stakeAmountOperation.confirmation();

//                 await chai.expect(delegationInstance.methods.delegateToSatellite(alice.pkh, mallory.pkh).send()).to.be.rejected;

//                 // Final values
//                 delegationStorage           = await delegationInstance.storage();
//                 doormanStorage              = await doormanInstance.storage();
//                 const satelliteRecord       = await delegationStorage.satelliteLedger.get(mallory.pkh);
//                 assert.strictEqual(satelliteRecord, undefined);
//             } catch(e){
//                 console.log(e);
//             }
//         });


//         it('User should be able to call this entrypoint and redelegate his SMVK if he wants to change satellite', async () => {
//             try{
//                 // Register a new satellite
//                 await signerFactory(oscar.sk);

//                 // init values
//                 const userStake               = MVK(100);
//                 const doormanContractAddress  = doormanAddress.address;
//                 const satelliteName           = "New Satellite (Oscar)";
//                 const satelliteDescription    = "New Satellite Description (Oscar)";
//                 const satelliteWebsite        = "https://placeholder.com/300";
//                 const satelliteImage          = "https://placeholder.com/300";
//                 const satelliteFee            = "800";

//                 // Bob assigns doorman contract as an operator
//                 const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//                 {
//                     add_operator: {
//                         owner    : oscar.pkh,
//                         operator : doormanContractAddress,
//                         token_id : 0,
//                     },
//                 }])
//                 .send()
//                 await updateOperatorsOperation.confirmation();

//                 // Bob stake 100 MVK tokens
//                 const stakeAmountOperation = await doormanInstance.methods.stake(userStake).send();
//                 await stakeAmountOperation.confirmation();

//                 // Check state before registering as satellite
//                 const beforeDelegationLedgerBob  = await delegationStorage.satelliteLedger.get(oscar.pkh);        // should return null or undefined
//                 const beforeBobStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(oscar.pkh);    // 100 MVK
//                 assert.equal(beforeDelegationLedgerBob,       null);
//                 assert.equal(beforeBobStakedBalance.balance,  userStake);

//                 // Registers as a satellite
//                 const registerAsSatelliteOperation = await delegationInstance.methods
//                     .registerAsSatellite(
//                         satelliteName, 
//                         satelliteDescription, 
//                         satelliteImage,
//                         satelliteWebsite,
//                         satelliteFee
//                     ).send();
//                 await registerAsSatelliteOperation.confirmation();

//                 // Check state after registering as satellite
//                 delegationStorage               = await delegationInstance.storage();
//                 const afterDelegationLedgerBob  = await delegationStorage.satelliteLedger.get(oscar.pkh);         // should return bob's satellite record
//                 const afterBobStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(oscar.pkh);     // 100 MVK
                
//                 // Bob's satellite details
//                 assert.equal(afterDelegationLedgerBob.name,                   satelliteName);
//                 assert.equal(afterDelegationLedgerBob.description,            satelliteDescription);
//                 assert.equal(afterDelegationLedgerBob.website,                satelliteWebsite);
//                 assert.equal(afterDelegationLedgerBob.stakedMvkBalance,       userStake);
//                 assert.equal(afterDelegationLedgerBob.satelliteFee,           satelliteFee);
//                 assert.equal(afterDelegationLedgerBob.totalDelegatedAmount,   0);
//                 assert.equal(afterDelegationLedgerBob.status,                 1);

//                 // Bob's staked balance remains the same
//                 assert.equal(afterBobStakedBalance.balance, userStake);

//                 // Alice redelegate to Oscar
//                 await signerFactory(alice.sk)
//                 delegationStorage               = await delegationInstance.storage();
//                 const previousDelegation        = await delegationStorage.delegateLedger.get(alice.pkh);
//                 const userDelegation            = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
//                 const previousSatellite         = previousDelegation.satelliteAddress;

//                 const satelliteRecord           = await delegationStorage.satelliteLedger.get(previousSatellite);
//                 const previousDelegatedAmount   = satelliteRecord.totalDelegatedAmount;

//                 const redelegateOperation       = await delegationInstance.methods.delegateToSatellite(alice.pkh, oscar.pkh).send();
//                 await redelegateOperation.confirmation();
                
//                 delegationStorage               = await delegationInstance.storage();
//                 const newSatelliteRecord        = await delegationStorage.satelliteLedger.get(oscar.pkh);
//                 const updatedOldSatelliteLedger = await delegationStorage.satelliteLedger.get(previousSatellite);
//                 const updatedOldDelegatedAmount = updatedOldSatelliteLedger.totalDelegatedAmount;
//                 const newDelegation             = await delegationStorage.delegateLedger.get(alice.pkh);

//                 assert.strictEqual(newDelegation.satelliteAddress, oscar.pkh)
//                 assert.equal(updatedOldDelegatedAmount.toNumber(), previousDelegatedAmount.toNumber() - userDelegation.balance.toNumber());
//                 assert.equal(newSatelliteRecord.totalDelegatedAmount.toNumber(), userDelegation.balance.toNumber());
//             } catch(e){
//                 console.log(e);
//             }
//         });
//     })

//     describe("%undelegateFromSatellite", async () => {
//         beforeEach("Set signer to user", async () => {
//             await signerFactory(alice.sk)
//         });

//         it('Satellite should not be able to call this entrypoint', async () => {
//             try{
//                 // init values
//                 await signerFactory(eve.sk);

//                 // Operation
//                 await chai.expect(delegationInstance.methods.undelegateFromSatellite(eve.pkh).send()).to.be.rejected;

//                 // Final values
//                 delegationStorage           = await delegationInstance.storage();
//                 const delegateRecord        = await delegationStorage.delegateLedger.get(eve.pkh)
//                 assert.strictEqual(delegateRecord, undefined)
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('User should not be able to call this entrypoint if it is pause', async () => {
//             try{
//                 // Initial Value
//                 await signerFactory(bob.sk)
//                 delegationStorage       = await delegationInstance.storage();
//                 const isPausedStart     = delegationStorage.breakGlassConfig.undelegateFromSatelliteIsPaused

//                 // Operation
//                 var togglePauseOperation = await delegationInstance.methods.togglePauseUndelegateSatellite().send();
//                 await togglePauseOperation.confirmation();

//                 // Final values
//                 delegationStorage       = await delegationInstance.storage();
//                 const isPausedEnd       = delegationStorage.breakGlassConfig.undelegateFromSatelliteIsPaused

//                 await signerFactory(eve.sk);
//                 await chai.expect(delegationInstance.methods.undelegateFromSatellite(eve.pkh).send()).to.be.rejected;

//                 // Reset admin
//                 await signerFactory(bob.sk)
//                 var togglePauseOperation = await delegationInstance.methods.togglePauseUndelegateSatellite().send();
//                 await togglePauseOperation.confirmation();

//                 // Assertions
//                 assert.equal(isPausedStart, false);
//                 assert.equal(isPausedEnd, true);
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('User should not be able to undelegate if he never delegated before', async () => {
//             try{
//                 // Register a new user
//                 await signerFactory(mallory.sk)
//                 delegationStorage       = await delegationInstance.storage();
//                 const stakeAmount       = MVK(10);

//                 // Operation
//                 const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//                 {
//                     add_operator: {
//                         owner    : mallory.pkh,
//                         operator : doormanAddress.address,
//                         token_id : 0,
//                     },
//                 }])
//                 .send()
//                 await updateOperatorsOperation.confirmation();
    
//                 const stakeAmountOperation = await doormanInstance.methods.stake(stakeAmount).send();
//                 await stakeAmountOperation.confirmation();

//                 await chai.expect(delegationInstance.methods.undelegateFromSatellite(mallory.pkh).send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('User should not be able to call this entrypoint if the provided satellite does not exist', async () => {
//             try{
//                 await chai.expect(delegationInstance.methods.delegateToSatellite(alice.pkh, bob.pkh).send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('User should not be able to call the entrypoint if the contract doesn’t have the doorman contract in the generalContracts map', async () => {
//             try{
//                 // Update generalContracts
//                 await signerFactory(bob.sk)
//                 var updateOperation = await governanceInstance.methods.updateGeneralContracts("doorman", doormanAddress.address).send()
//                 await updateOperation.confirmation();

//                 // Initial values
//                 await signerFactory(alice.sk);
//                 await chai.expect(delegationInstance.methods.delegateToSatellite(alice.pkh, eve.pkh).send()).to.be.rejected;

//                 // Reset operation
//                 await signerFactory(bob.sk)
//                 var updateOperation = await governanceInstance.methods.updateGeneralContracts("doorman", doormanAddress.address).send()
//                 await updateOperation.confirmation();
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('User should be able to call this entrypoint and undelegate his SMVK from a provided satellite', async () => {
//             try{
//                 // Register a new user
//                 delegationStorage           = await delegationInstance.storage();
//                 const initSatelliteRecord   = await delegationStorage.satelliteLedger.get(oscar.pkh);

//                 // Operation
//                 const delegationOperation   = await delegationInstance.methods.undelegateFromSatellite(alice.pkh).send();
//                 await delegationOperation.confirmation();

//                 // Final Values
//                 delegationStorage       = await delegationInstance.storage();
//                 const satelliteRecord   = await delegationStorage.satelliteLedger.get(oscar.pkh);
//                 const delegateRecord    = await delegationStorage.delegateLedger.get(alice.pkh);

//                 // Assertions
//                 assert.strictEqual(delegateRecord, undefined);
//                 assert.notEqual(initSatelliteRecord.totalDelegatedAmount, satelliteRecord.totalDelegatedAmount);
//             } catch(e){
//                 console.log(e);
//             }
//         })
//     })

//     describe("%togglePauseDelegateToSatellite", async () => {
//         beforeEach("Set signer to admin", async () => {
//             await signerFactory(bob.sk)
//         });
//         it('Admin should be able to call the entrypoint and pause or unpause the delegateToSatellite entrypoint', async () => {
//             try{
//                 // Initial Values
//                 delegationStorage       = await delegationInstance.storage();
//                 const isPausedStart     = delegationStorage.breakGlassConfig.delegateToSatelliteIsPaused
//                 const stakeAmount   = MVK(10);

//                 // Operation
//                 const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//                 {
//                     add_operator: {
//                         owner    : bob.pkh,
//                         operator : doormanAddress.address,
//                         token_id : 0,
//                     },
//                 }])
//                 .send()
//                 await updateOperatorsOperation.confirmation();
    
//                 const stakeAmountOperation = await doormanInstance.methods.stake(stakeAmount).send();
//                 await stakeAmountOperation.confirmation();

//                 // Operation
//                 var togglePauseOperation = await delegationInstance.methods.togglePauseDelegateToSatellite().send();
//                 await togglePauseOperation.confirmation();

//                 // Final values
//                 delegationStorage       = await delegationInstance.storage();
//                 const isPausedEnd       = delegationStorage.breakGlassConfig.delegateToSatelliteIsPaused

//                 await chai.expect(delegationInstance.methods.delegateToSatellite(bob.pkh, eve.pkh).send()).to.be.rejected;

//                 // Reset admin
//                 var togglePauseOperation = await delegationInstance.methods.togglePauseDelegateToSatellite().send();
//                 await togglePauseOperation.confirmation();

//                 // Assertions
//                 assert.equal(isPausedStart, false);
//                 assert.equal(isPausedEnd, true);
//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Non-admin should not be able to call the entrypoint', async () => {
//             try{
//                 await signerFactory(alice.sk);
//                 await chai.expect(delegationInstance.methods.togglePauseDelegateToSatellite().send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });
//     })

//     describe("%togglePauseUndelegateSatellite", async () => {
//         beforeEach("Set signer to admin", async () => {
//             await signerFactory(bob.sk)
//         });
//         it('Admin should be able to call the entrypoint and pause or unpause the delegateToSatellite entrypoint', async () => {
//             try{
//                 // Initial Values
//                 delegationStorage       = await delegationInstance.storage();
//                 const isPausedStart     = delegationStorage.breakGlassConfig.undelegateFromSatelliteIsPaused

//                 // Operation
//                 var togglePauseOperation = await delegationInstance.methods.togglePauseUndelegateSatellite().send();
//                 await togglePauseOperation.confirmation();

//                 // Final values
//                 delegationStorage       = await delegationInstance.storage();
//                 const isPausedEnd       = delegationStorage.breakGlassConfig.undelegateFromSatelliteIsPaused

//                 await chai.expect(delegationInstance.methods.undelegateFromSatellite(bob.pkh).send()).to.be.rejected;

//                 // Reset admin
//                 var togglePauseOperation = await delegationInstance.methods.togglePauseUndelegateSatellite().send();
//                 await togglePauseOperation.confirmation();

//                 // Assertions
//                 assert.equal(isPausedStart, false);
//                 assert.equal(isPausedEnd, true);
//             } catch(e){
//                 console.log(e);
//             }
//         });
//         it('Non-admin should not be able to call the entrypoint', async () => {
//             try{
//                 await signerFactory(alice.sk);
//                 await chai.expect(delegationInstance.methods.togglePauseUndelegateSatellite().send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });
//     })

//     describe("%togglePauseRegisterSatellite", async () => {
//         beforeEach("Set signer to admin", async () => {
//             await signerFactory(bob.sk)
//         });
//         it('Admin should be able to call the entrypoint and pause or unpause the registerSatellite entrypoint', async () => {
//             try{
//                 // Initial Values
//                 delegationStorage       = await delegationInstance.storage();
//                 const isPausedStart     = delegationStorage.breakGlassConfig.registerAsSatelliteIsPaused
//                 const satelliteName           = "New Satellite (Eve)";
//                 const satelliteDescription    = "New Satellite Description (Eve)";
//                 const satelliteWebsite        = "https://placeholder.com/300";
//                 const satelliteImage          = "https://placeholder.com/300";
//                 const satelliteFee            = "700";

//                 // Operation
//                 var togglePauseOperation = await delegationInstance.methods.togglePauseRegisterSatellite().send();
//                 await togglePauseOperation.confirmation();

//                 // Final values
//                 delegationStorage       = await delegationInstance.storage();
//                 const isPausedEnd       = delegationStorage.breakGlassConfig.registerAsSatelliteIsPaused

//                 await chai.expect(delegationInstance.methods
//                     .registerAsSatellite(
//                         satelliteName, 
//                         satelliteDescription, 
//                         satelliteImage, 
//                         satelliteWebsite,
//                         satelliteFee
//                     ).send()
//                 ).to.be.rejected;

//                 // Reset admin
//                 var togglePauseOperation = await delegationInstance.methods.togglePauseRegisterSatellite().send();
//                 await togglePauseOperation.confirmation();

//                 // Assertions
//                 assert.equal(isPausedStart, false);
//                 assert.equal(isPausedEnd, true);
//             } catch(e){
//                 console.log(e);
//             }
//         });
//         it('Non-admin should not be able to call the entrypoint', async () => {
//             try{
//                 await signerFactory(alice.sk);
//                 await chai.expect(delegationInstance.methods.togglePauseRegisterSatellite().send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });
//     })

//     describe("%togglePauseUnregisterSatellite", async () => {
//         before("Alice delegates to Eve's Satellite", async () => {
//             await signerFactory(alice.sk)
//             const delegateOperation = await delegationInstance.methods.delegateToSatellite(alice.pkh, eve.pkh).send();
//             await delegateOperation.confirmation();
//         });

//         beforeEach("Set signer to admin", async () => {
//             await signerFactory(bob.sk)
//         });

//         it('Admin should be able to call the entrypoint and pause or unpause the registerSatellite entrypoint', async () => {
//             try{
//                 // Initial Values
//                 delegationStorage       = await delegationInstance.storage();
//                 const isPausedStart     = delegationStorage.breakGlassConfig.unregisterAsSatelliteIsPaused

//                 // Operation
//                 var togglePauseOperation = await delegationInstance.methods.togglePauseUnregisterSatellite().send();
//                 await togglePauseOperation.confirmation();

//                 // Final values
//                 delegationStorage       = await delegationInstance.storage();
//                 const isPausedEnd       = delegationStorage.breakGlassConfig.unregisterAsSatelliteIsPaused

//                 await chai.expect(delegationInstance.methods
//                     .unregisterAsSatellite(bob.pkh).send()
//                 ).to.be.rejected;

//                 // Reset admin
//                 var togglePauseOperation = await delegationInstance.methods.togglePauseUnregisterSatellite().send();
//                 await togglePauseOperation.confirmation();

//                 // Assertions
//                 assert.equal(isPausedStart, false);
//                 assert.equal(isPausedEnd, true);
//             } catch(e){
//                 console.log(e);
//             }
//         });
//         it('Non-admin should not be able to call the entrypoint', async () => {
//             try{
//                 await signerFactory(alice.sk);
//                 await chai.expect(delegationInstance.methods.togglePauseUnregisterSatellite().send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });
//     })

//     describe("%togglePauseUpdateSatellite", async () => {
//         beforeEach("Set signer to admin", async () => {
//             await signerFactory(bob.sk)
//         });
//         it('Admin should be able to call the entrypoint and pause or unpause the updateSatellite entrypoint', async () => {
//             try{
//                 // Initial Values
//                 delegationStorage       = await delegationInstance.storage();
//                 const isPausedStart     = delegationStorage.breakGlassConfig.updateSatelliteRecordIsPaused
//                 const updatedSatelliteName          = "New Satellite (Eve)";
//                 const updatedSatelliteDescription   = "New Satellite Description (Eve)";
//                 const updatedSatelliteWebsite       = "https://placeholder.com/300";
//                 const updatedSatelliteImage         = "https://placeholder.com/300";
//                 const updatedSatelliteFee           = "500";

//                 // Operation
//                 var togglePauseOperation = await delegationInstance.methods.togglePauseUpdateSatellite().send();
//                 await togglePauseOperation.confirmation();

//                 // Final values
//                 delegationStorage       = await delegationInstance.storage();
//                 const isPausedEnd       = delegationStorage.breakGlassConfig.updateSatelliteRecordIsPaused

//                 await chai.expect(delegationInstance.methods
//                     .updateSatelliteRecord(
//                         updatedSatelliteName, 
//                         updatedSatelliteDescription, 
//                         updatedSatelliteImage, 
//                         updatedSatelliteWebsite,
//                         updatedSatelliteFee
//                     ).send()
//                 ).to.be.rejected;

//                 // Reset admin
//                 var togglePauseOperation = await delegationInstance.methods.togglePauseUpdateSatellite().send();
//                 await togglePauseOperation.confirmation();

//                 // Assertions
//                 assert.equal(isPausedStart, false);
//                 assert.equal(isPausedEnd, true);
//             } catch(e){
//                 console.log(e);
//             }
//         });
//         it('Non-admin should not be able to call the entrypoint', async () => {
//             try{
//                 await signerFactory(alice.sk);
//                 await chai.expect(delegationInstance.methods.togglePauseUpdateSatellite().send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });
//     })

//     describe("%pauseAll", async () => {
//         beforeEach("Set signer to admin", async () => {
//             await signerFactory(bob.sk)
//         });

//         it('Admin should be able to call the entrypoint and pause all entrypoints in the contract', async () => {
//             try{
//                 // Initial Values
//                 delegationStorage       = await delegationInstance.storage();
//                 for (let [key, value] of Object.entries(delegationStorage.breakGlassConfig)){
//                     assert.equal(value, false);
//                 }

//                 // Operation
//                 var pauseOperation = await delegationInstance.methods.pauseAll().send();
//                 await pauseOperation.confirmation();

//                 // Final values
//                 delegationStorage       = await delegationInstance.storage();
//                 for (let [key, value] of Object.entries(delegationStorage.breakGlassConfig)){
//                     assert.equal(value, true);
//                 }
//             } catch(e){
//                 console.log(e);
//             }
//         });
//         it('Non-admin should not be able to call the entrypoint', async () => {
//             try{
//                 await signerFactory(alice.sk);
//                 await chai.expect(delegationInstance.methods.pauseAll().send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });
//     })

//     describe("%unpauseAll", async () => {
//         beforeEach("Set signer to admin", async () => {
//             await signerFactory(bob.sk)
//         });

//         it('Admin should be able to call the entrypoint and unpause all entrypoints in the contract', async () => {
//             try{
//                 // Initial Values
//                 delegationStorage       = await delegationInstance.storage();
//                 for (let [key, value] of Object.entries(delegationStorage.breakGlassConfig)){
//                     assert.equal(value, true);
//                 }

//                 // Operation
//                 var pauseOperation = await delegationInstance.methods.unpauseAll().send();
//                 await pauseOperation.confirmation();

//                 // Final values
//                 delegationStorage       = await delegationInstance.storage();
//                 for (let [key, value] of Object.entries(delegationStorage.breakGlassConfig)){
//                     assert.equal(value, false);
//                 }
//             } catch(e){
//                 console.log(e);
//             }
//         });
//         it('Non-admin should not be able to call the entrypoint', async () => {
//             try{
//                 await signerFactory(alice.sk);
//                 await chai.expect(delegationInstance.methods.unpauseAll().send()).to.be.rejected;
//             } catch(e){
//                 console.log(e);
//             }
//         });
//     })

//     describe("Extra tests", async () => {
//         it('Delegator stakes 5 MVK', async () => {
//             try{
//                 // Initial values
//                 const stakeAmount           = MVK(5);
//                 delegationStorage           = await delegationInstance.storage();
//                 doormanStorage              = await doormanInstance.storage();
//                 const oldUserStakeRecord    = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
//                 const oldSatelliteStakeRecord    = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);
//                 const oldSatelliteRecord    = await delegationStorage.satelliteLedger.get(eve.pkh);
//                 const oldDelegateRecord     = await delegationStorage.delegateLedger.get(alice.pkh);

//                 console.log("SATELLITE OLD RECORD: ", oldSatelliteRecord);
//                 console.log("SATELLITE OLD STAKE RECORD: ", oldSatelliteStakeRecord);
//                 console.log("DELEGATOR OLD RECORD: ", oldDelegateRecord);
//                 console.log("DELEGATOR OLD STAKE RECORD: ", oldUserStakeRecord);

//                 // Operation
//                 await signerFactory(alice.sk)
//                 const stakeOperation  = await doormanInstance.methods.stake(stakeAmount).send();
//                 await stakeOperation.confirmation();

//                 // Final values
//                 delegationStorage           = await delegationInstance.storage();
//                 doormanStorage              = await doormanInstance.storage();
//                 const newUserStakeRecord    = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
//                 const newSatelliteStakeRecord    = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);
//                 const newSatelliteRecord    = await delegationStorage.satelliteLedger.get(eve.pkh);
//                 const newDelegateRecord     = await delegationStorage.delegateLedger.get(alice.pkh);

//                 console.log("SATELLITE NEW RECORD: ", newSatelliteRecord);
//                 console.log("SATELLITE NEW STAKE RECORD: ", newSatelliteStakeRecord);
//                 console.log("DELEGATOR NEW RECORD: ", newDelegateRecord);
//                 console.log("DELEGATOR NEW STAKE RECORD: ", newUserStakeRecord);

//                 // Assertions
//                 assert.notStrictEqual(oldSatelliteRecord, undefined)
//                 assert.notStrictEqual(oldDelegateRecord, undefined)
//                 assert.notStrictEqual(newSatelliteRecord, undefined)
//                 assert.notStrictEqual(newDelegateRecord, undefined)
//             } catch(e){
//                 console.log(e);
//             }
//         });
//         it('Delegator unstakes 5 MVK', async () => {
//             try{
//                 // Initial values
//                 const stakeAmount           = MVK(5);
//                 delegationStorage           = await delegationInstance.storage();
//                 doormanStorage              = await doormanInstance.storage();
//                 const oldUserStakeRecord    = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
//                 const oldSatelliteStakeRecord    = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);
//                 const oldSatelliteRecord    = await delegationStorage.satelliteLedger.get(eve.pkh);
//                 const oldDelegateRecord     = await delegationStorage.delegateLedger.get(alice.pkh);

//                 console.log("SATELLITE OLD RECORD: ", oldSatelliteRecord);
//                 console.log("SATELLITE OLD STAKE RECORD: ", oldSatelliteStakeRecord);
//                 console.log("DELEGATOR OLD RECORD: ", oldDelegateRecord);
//                 console.log("DELEGATOR OLD STAKE RECORD: ", oldUserStakeRecord);

//                 // Operation
//                 await signerFactory(alice.sk)
//                 const stakeOperation  = await doormanInstance.methods.unstake(stakeAmount).send();
//                 await stakeOperation.confirmation();

//                 // Final values
//                 delegationStorage           = await delegationInstance.storage();
//                 doormanStorage              = await doormanInstance.storage();
//                 const newUserStakeRecord    = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
//                 const newSatelliteStakeRecord    = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);
//                 const newSatelliteRecord    = await delegationStorage.satelliteLedger.get(eve.pkh);
//                 const newDelegateRecord     = await delegationStorage.delegateLedger.get(alice.pkh);

//                 console.log("SATELLITE NEW RECORD: ", newSatelliteRecord);
//                 console.log("SATELLITE NEW STAKE RECORD: ", newSatelliteStakeRecord);
//                 console.log("DELEGATOR NEW RECORD: ", newDelegateRecord);
//                 console.log("DELEGATOR NEW STAKE RECORD: ", newUserStakeRecord);

//                 // Assertions
//                 assert.notStrictEqual(oldSatelliteRecord, undefined)
//                 assert.notStrictEqual(oldDelegateRecord, undefined)
//                 assert.notStrictEqual(newSatelliteRecord, undefined)
//                 assert.notStrictEqual(newDelegateRecord, undefined)
//             } catch(e){
//                 console.log(e);
//             }
//         });
//         it('Satellite stakes 5 MVK', async () => {
//             try{
//                 // Initial values
//                 const stakeAmount           = MVK(5);
//                 delegationStorage           = await delegationInstance.storage();
//                 doormanStorage              = await doormanInstance.storage();
//                 const oldUserStakeRecord    = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
//                 const oldSatelliteStakeRecord    = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);
//                 const oldSatelliteRecord    = await delegationStorage.satelliteLedger.get(eve.pkh);
//                 const oldDelegateRecord     = await delegationStorage.delegateLedger.get(alice.pkh);

//                 console.log("SATELLITE OLD RECORD: ", oldSatelliteRecord);
//                 console.log("SATELLITE OLD STAKE RECORD: ", oldSatelliteStakeRecord);
//                 console.log("DELEGATOR OLD RECORD: ", oldDelegateRecord);
//                 console.log("DELEGATOR OLD STAKE RECORD: ", oldUserStakeRecord);

//                 // Operation
//                 await signerFactory(eve.sk)
//                 const stakeOperation  = await doormanInstance.methods.stake(stakeAmount).send();
//                 await stakeOperation.confirmation();

//                 // Final values
//                 delegationStorage           = await delegationInstance.storage();
//                 doormanStorage              = await doormanInstance.storage();
//                 const newUserStakeRecord    = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
//                 const newSatelliteStakeRecord    = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);
//                 const newSatelliteRecord    = await delegationStorage.satelliteLedger.get(eve.pkh);
//                 const newDelegateRecord     = await delegationStorage.delegateLedger.get(alice.pkh);

//                 console.log("SATELLITE NEW RECORD: ", newSatelliteRecord);
//                 console.log("SATELLITE NEW STAKE RECORD: ", newSatelliteStakeRecord);
//                 console.log("DELEGATOR NEW RECORD: ", newDelegateRecord);
//                 console.log("DELEGATOR NEW STAKE RECORD: ", newUserStakeRecord);

//                 // Assertions
//                 assert.notStrictEqual(oldSatelliteRecord, undefined)
//                 assert.notStrictEqual(oldDelegateRecord, undefined)
//                 assert.notStrictEqual(newSatelliteRecord, undefined)
//                 assert.notStrictEqual(newDelegateRecord, undefined)
//             } catch(e){
//                 console.log(e);
//             }
//         });
//     })
// });