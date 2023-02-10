// const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
// const { InMemorySigner, importKey } = require("@taquito/signer");
// import assert, { ok, rejects, strictEqual, fail } from "assert";
// import { MVK, Utils, zeroAddress } from "./helpers/Utils";
// import { createHash } from "crypto";
// import { packDataBytes, MichelsonData, MichelsonType } from '@taquito/michel-codec';
// import fs from "fs";
// import { confirmOperation } from "../scripts/confirmation";
// import { MichelsonMap } from "@taquito/taquito";
// import {BigNumber} from "bignumber.js";

// const chai              = require("chai");
// const salt              = 'azerty';
// const chaiAsPromised    = require('chai-as-promised');
// chai.use(chaiAsPromised);   
// chai.should();

// import env from "../env";
// import { bob, alice, eve, mallory, trudy } from "../scripts/sandbox/accounts";

// import doormanAddress                   from '../deployments/doormanAddress.json';
// import delegationAddress                from '../deployments/delegationAddress.json';
// import governanceAddress                from '../deployments/governanceAddress.json';
// import governanceSatelliteAddress       from '../deployments/governanceSatelliteAddress.json';
// import mvkTokenAddress                  from '../deployments/mvkTokenAddress.json';
// import aggregatorAddress                from '../deployments/aggregatorAddress.json';
// import governanceFinancialAddress       from '../deployments/governanceFinancialAddress.json';
// import councilAddress                   from '../deployments/councilAddress.json';
// import treasuryAddress                  from '../deployments/treasuryAddress.json';
// import aggregatorFactoryAddress         from '../deployments/aggregatorFactoryAddress.json';
// import governanceProxyAddress           from '../deployments/governanceProxyAddress.json';

// import { config } from "yargs";
// import { aggregatorStorageType } from "./types/aggregatorStorageType";

// function wait(ms: number) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// describe("Satellite status tests", async () => {
//     var utils: Utils;

//     let doormanInstance;
//     let delegationInstance;
//     let mvkTokenInstance;
//     let governanceInstance;
//     let governanceSatelliteInstance;
//     let governanceFinancialInstance;
//     let aggregatorInstance;
//     let councilInstance;
//     let aggregatorFactoryInstance;
//     let governanceProxyInstance;
    
//     let doormanStorage;
//     let delegationStorage;
//     let mvkTokenStorage;
//     let governanceStorage;
//     let governanceSatelliteStorage;
//     let governanceFinancialStorage;
//     let aggregatorStorage;
//     let councilStorage;
//     let aggregatorFactoryStorage;
//     let governanceProxyStorage;
    
//     const signerFactory = async (pk) => {
//         await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
//         return utils.tezos;
//     };

//     before("setup", async () => {
//         try{
//             utils = new Utils();
//             await utils.init(bob.sk);
            
//             doormanInstance                 = await utils.tezos.contract.at(doormanAddress.address);
//             delegationInstance              = await utils.tezos.contract.at(delegationAddress.address);
//             mvkTokenInstance                = await utils.tezos.contract.at(mvkTokenAddress.address);
//             governanceInstance              = await utils.tezos.contract.at(governanceAddress.address);
//             governanceSatelliteInstance     = await utils.tezos.contract.at(governanceSatelliteAddress.address);
//             aggregatorInstance              = await utils.tezos.contract.at(aggregatorAddress.address);
//             governanceFinancialInstance     = await utils.tezos.contract.at(governanceFinancialAddress.address);
//             councilInstance                 = await utils.tezos.contract.at(councilAddress.address);
//             aggregatorFactoryInstance       = await utils.tezos.contract.at(aggregatorFactoryAddress.address);
//             governanceProxyInstance         = await utils.tezos.contract.at(governanceProxyAddress.address);
    
//             doormanStorage                  = await doormanInstance.storage();
//             delegationStorage               = await delegationInstance.storage();
//             mvkTokenStorage                 = await mvkTokenInstance.storage();
//             governanceStorage               = await governanceSatelliteInstance.storage();
//             governanceSatelliteStorage      = await governanceSatelliteInstance.storage();
//             aggregatorStorage               = await aggregatorInstance.storage();
//             governanceFinancialStorage      = await governanceFinancialInstance.storage();
//             councilStorage                  = await councilInstance.storage();
//             aggregatorFactoryStorage        = await aggregatorFactoryInstance.storage();
//             governanceProxyStorage          = await governanceProxyInstance.storage();
            
//             console.log('-- -- -- -- -- Satellite Status Tests -- -- -- --')
//             console.log('Doorman Contract deployed at:'               , doormanInstance.address);
//             console.log('Delegation Contract deployed at:'            , delegationInstance.address);
//             console.log('MVK Token Contract deployed at:'             , mvkTokenInstance.address);
//             console.log('Governance Contract deployed at:'            , governanceInstance.address);
//             console.log('Governance Satellite Contract deployed at:'  , governanceSatelliteInstance.address);
//             console.log('Governance Financial Contract deployed at:'  , governanceFinancialInstance.address);
//             console.log('Aggregator Contract deployed at:'            , aggregatorInstance.address);
//             console.log('Council Contract deployed at:'               , councilInstance.address);
//             console.log('Aggregator Factory Contract deployed at:'    , aggregatorFactoryInstance.address);
//             console.log('Governance Proxy Contract deployed at:'      , governanceProxyInstance.address);
            
//             console.log('Bob address: '     + bob.pkh);
//             console.log('Alice address: '   + alice.pkh);
//             console.log('Eve address: '     + eve.pkh);
//             console.log('Mallory address: ' + mallory.pkh);
    
//             delegationStorage       = await delegationInstance.storage();
//             const BobSatellite      = await delegationStorage.satelliteLedger.get(bob.pkh);
    
//             if(BobSatellite === undefined){

//                 // ------------------------------------------------------------------
//                 // Creation of 3 satellites
//                 // ------------------------------------------------------------------

//                 // 1st Satellite -> Bob
//                 var updateOperatorsOperation = await mvkTokenInstance.methods
//                     .update_operators([
//                     {
//                         add_operator: {
//                             owner: bob.pkh,
//                             operator: doormanAddress.address,
//                             token_id: 0,
//                         },
//                     },
//                     ])
//                     .send()
//                 await updateOperatorsOperation.confirmation();  
//                 var stakeAmount         = MVK(10000);
//                 var stakeOperation      = await doormanInstance.methods.stake(stakeAmount).send();
//                 await stakeOperation.confirmation();                        
//                 var registerAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite(
//                     "New Satellite by Bob", 
//                     "New Satellite Description - Bob", 
//                     "https://image.url", 
//                     "https://image.url", 
//                     "700"
//                 ).send();
//                 await registerAsSatelliteOperation.confirmation();
                
//                 // 2nd Satellite -> Alice
//                 await signerFactory(alice.sk)
//                 updateOperatorsOperation = await mvkTokenInstance.methods
//                 .update_operators([
//                 {
//                     add_operator: {
//                         owner: alice.pkh,
//                         operator: doormanAddress.address,
//                         token_id: 0,
//                     },
//                 },
//                 ])
//                 .send()
//                 await updateOperatorsOperation.confirmation();  
//                 stakeAmount         = MVK(10);
//                 stakeOperation      = await doormanInstance.methods.stake(stakeAmount).send();
//                 await stakeOperation.confirmation();                        
//                 registerAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite(
//                     "New Satellite by Alice", 
//                     "New Satellite Description - Alice", 
//                     "https://image.url", 
//                     "https://image.url", 
//                     "700"
//                 ).send();
//                 await registerAsSatelliteOperation.confirmation();
                
//                 // 3rd Satellite -> Eve
//                 await signerFactory(eve.sk)
//                 updateOperatorsOperation = await mvkTokenInstance.methods
//                 .update_operators([
//                 {
//                     add_operator: {
//                         owner: eve.pkh,
//                         operator: doormanAddress.address,
//                         token_id: 0,
//                     },
//                 },
//                 ])
//                 .send()
//                 await updateOperatorsOperation.confirmation();  
//                 stakeAmount         = MVK(30);
//                 stakeOperation      = await doormanInstance.methods.stake(stakeAmount).send();
//                 await stakeOperation.confirmation();                        
//                 registerAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite(
//                     "New Satellite by Eve", 
//                     "New Satellite Description - Eve", 
//                     "https://image.url", 
//                     "https://image.url", 
//                     "700"
//                 ).send();
//                 await registerAsSatelliteOperation.confirmation();

//                 // ------------------------------------------------------------------
//                 // Update 2nd & 3rd Satellites status
//                 // ------------------------------------------------------------------
                
//                 await signerFactory(bob.sk)
//                 var updateStatusOperation  = await delegationInstance.methods.updateSatelliteStatus(alice.pkh, "SUSPENDED").send()
//                 await updateStatusOperation.confirmation()
//                 updateStatusOperation  = await delegationInstance.methods.updateSatelliteStatus(eve.pkh, "BANNED").send()
//                 await updateStatusOperation.confirmation()
//             }
//         } catch(e) {
//             console.dir(e, {depth: 5})
//         }
//     });

//     describe("DELEGATION", async () => {

//         describe("%unregisterAsSatellite", async () => {

//             it('Suspended satellite should not be able to unregister', async () => {
//                 try{
    
//                     // Initial Values
//                     await signerFactory(alice.sk);
//                     delegationStorage       = await delegationInstance.storage()
//                     const satelliteRecord   = await delegationStorage.satelliteLedger.get(alice.pkh)
    
//                     // Operation
//                     await chai.expect(delegationInstance.methods.unregisterAsSatellite(alice.pkh).send()).to.be.rejected;
    
//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "SUSPENDED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
    
//             it('Banned satellite should not be able to unregister', async () => {
//                 try{
    
//                     // Initial Values
//                     await signerFactory(eve.sk);
//                     delegationStorage       = await delegationInstance.storage()
//                     const satelliteRecord   = await delegationStorage.satelliteLedger.get(eve.pkh)
    
//                     // Operation
//                     await chai.expect(delegationInstance.methods.unregisterAsSatellite(eve.pkh).send()).to.be.rejected;
    
//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "BANNED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//         })

//         describe("%updateSatelliteRecord", async () => {

//             it('Suspended satellite should be able to update its satellite record', async () => {
//                 try{
    
//                     // Initial Values
//                     await signerFactory(alice.sk);
//                     delegationStorage       = await delegationInstance.storage()
//                     var satelliteRecord     = await delegationStorage.satelliteLedger.get(alice.pkh)
    
//                     // Operation
//                     const operation         = await delegationInstance.methods.updateSatelliteRecord(
//                         "Updated Satellite by Alice",
//                         "Updated Satellite Description - Alice",
//                         "https://image.url",
//                         "https://image.url",
//                         "700")
//                     .send();
//                     await operation.confirmation()

//                     // Final values
//                     delegationStorage       = await delegationInstance.storage()
//                     satelliteRecord     = await delegationStorage.satelliteLedger.get(alice.pkh)
    
//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "SUSPENDED");
//                     assert.strictEqual(satelliteRecord.name, "Updated Satellite by Alice");
//                     assert.strictEqual(satelliteRecord.description, "Updated Satellite Description - Alice");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
    
//             it('Banned satellite should not be able to update its satellite record', async () => {
//                 try{
    
//                     // Initial Values
//                     await signerFactory(eve.sk);
//                     delegationStorage       = await delegationInstance.storage()
//                     const satelliteRecord   = await delegationStorage.satelliteLedger.get(eve.pkh)
    
//                     // Operation
//                     await chai.expect(delegationInstance.methods.updateSatelliteRecord(
//                         "Updated Satellite by Eve",
//                         "Updated Satellite Description - Eve",
//                         "https://image.url",
//                         "https://image.url",
//                         "700")
//                     .send()).to.be.rejected;
    
//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "BANNED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//         })

//     });

//     describe("GOVERNANCE SATELLITE", async () => {

//         describe("%suspendSatellite", async () => {

//             it('Suspended satellite should not be able to suspend a satellite', async () => {
//                 try{
    
//                     // Initial Values
//                     await signerFactory(alice.sk);
//                     delegationStorage       = await delegationInstance.storage()
//                     const satelliteRecord   = await delegationStorage.satelliteLedger.get(alice.pkh)
    
//                     // Operation
//                     await chai.expect(governanceSatelliteInstance.methods.suspendSatellite(bob.pkh, "Test purpose").send()).to.be.rejected;
    
//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "SUSPENDED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
    
//             it('Banned satellite should not be able to suspend a satellite', async () => {
//                 try{
    
//                     // Initial Values
//                     await signerFactory(eve.sk);
//                     delegationStorage       = await delegationInstance.storage()
//                     const satelliteRecord   = await delegationStorage.satelliteLedger.get(eve.pkh)
    
//                     // Operation
//                     await chai.expect(governanceSatelliteInstance.methods.suspendSatellite(bob.pkh, "Test purpose").send()).to.be.rejected;
    
//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "BANNED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//         });

//         describe("%restoreSatellite", async () => {

//             it('Suspended satellite should not be able to restore a satellite', async () => {
//                 try{
    
//                     // Initial Values
//                     await signerFactory(alice.sk);
//                     delegationStorage       = await delegationInstance.storage()
//                     const satelliteRecord   = await delegationStorage.satelliteLedger.get(alice.pkh)
    
//                     // Operation
//                     await chai.expect(governanceSatelliteInstance.methods.restoreSatellite(
//                         alice.pkh,
//                         alice.pk,
//                         alice.peerId,
//                         "Test purpose"
//                     ).send()).to.be.rejected;
    
//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "SUSPENDED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
    
//             it('Banned satellite should not be able to restore a satellite', async () => {
//                 try{
    
//                     // Initial Values
//                     await signerFactory(eve.sk);
//                     delegationStorage       = await delegationInstance.storage()
//                     const satelliteRecord   = await delegationStorage.satelliteLedger.get(eve.pkh)
    
//                     // Operation
//                     await chai.expect(governanceSatelliteInstance.methods.restoreSatellite(
//                         alice.pkh,
//                         alice.pk,
//                         alice.peerId,
//                         "Test purpose"
//                     ).send()).to.be.rejected;
    
//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "BANNED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//         })

//         describe("%banSatellite", async () => {

//             it('Suspended satellite should not be able to ban a satellite', async () => {
//                 try{
    
//                     // Initial Values
//                     await signerFactory(alice.sk);
//                     delegationStorage       = await delegationInstance.storage()
//                     const satelliteRecord   = await delegationStorage.satelliteLedger.get(alice.pkh)
    
//                     // Operation
//                     await chai.expect(governanceSatelliteInstance.methods.banSatellite(bob.pkh, "Test purpose").send()).to.be.rejected;
    
//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "SUSPENDED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
    
//             it('Banned satellite should not be able to ban a satellite', async () => {
//                 try{
    
//                     // Initial Values
//                     await signerFactory(eve.sk);
//                     delegationStorage       = await delegationInstance.storage()
//                     const satelliteRecord   = await delegationStorage.satelliteLedger.get(eve.pkh)
    
//                     // Operation
//                     await chai.expect(governanceSatelliteInstance.methods.banSatellite(bob.pkh, "Test purpose").send()).to.be.rejected;
    
//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "BANNED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//         })

//         describe("%removeAllSatelliteOracles", async () => {

//             it('Suspended satellite should not be able to remove all oracles from a satellite', async () => {
//                 try{
    
//                     // Initial Values
//                     await signerFactory(alice.sk);
//                     delegationStorage       = await delegationInstance.storage()
//                     const satelliteRecord   = await delegationStorage.satelliteLedger.get(alice.pkh)
    
//                     // Operation
//                     await chai.expect(governanceSatelliteInstance.methods.removeAllSatelliteOracles(bob.pkh, "Test purpose").send()).to.be.rejected;
    
//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "SUSPENDED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
    
//             it('Banned satellite should not be able to remove all oracles from a satellite', async () => {
//                 try{
    
//                     // Initial Values
//                     await signerFactory(eve.sk);
//                     delegationStorage       = await delegationInstance.storage()
//                     const satelliteRecord   = await delegationStorage.satelliteLedger.get(eve.pkh)
    
//                     // Operation
//                     await chai.expect(governanceSatelliteInstance.methods.removeAllSatelliteOracles(bob.pkh, "Test purpose").send()).to.be.rejected;
    
//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "BANNED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//         })

//         describe("%addOracleToAggregator", async () => {

//             it('Suspended satellite should not be able to add an oracle to an aggregator', async () => {
//                 try{
    
//                     // Initial Values
//                     await signerFactory(alice.sk);
//                     delegationStorage       = await delegationInstance.storage()
//                     const satelliteRecord   = await delegationStorage.satelliteLedger.get(alice.pkh)
    
//                     // Operation
//                     await chai.expect(governanceSatelliteInstance.methods.addOracleToAggregator(
//                         eve.pkh,
//                         aggregatorAddress.address,
//                         "Test purpose"
//                     ).send()).to.be.rejected;
    
//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "SUSPENDED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
    
//             it('Banned satellite should not be able to add an oracle to an aggregator', async () => {
//                 try{
    
//                     // Initial Values
//                     await signerFactory(eve.sk);
//                     delegationStorage       = await delegationInstance.storage()
//                     const satelliteRecord   = await delegationStorage.satelliteLedger.get(eve.pkh)
    
//                     // Operation
//                     await chai.expect(governanceSatelliteInstance.methods.addOracleToAggregator(
//                         eve.pkh,
//                         aggregatorAddress.address,
//                         "Test purpose"
//                     ).send()).to.be.rejected;
    
//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "BANNED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//         })

//         describe("%removeOracleInAggregator", async () => {

//             it('Suspended satellite should not be able to remove an oracle from an aggregator', async () => {
//                 try{
    
//                     // Initial Values
//                     await signerFactory(alice.sk);
//                     delegationStorage       = await delegationInstance.storage()
//                     const satelliteRecord   = await delegationStorage.satelliteLedger.get(alice.pkh)
    
//                     // Operation
//                     await chai.expect(governanceSatelliteInstance.methods.removeOracleInAggregator(bob.pkh, aggregatorAddress.address, "Test purpose").send()).to.be.rejected;
    
//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "SUSPENDED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
    
//             it('Banned satellite should not be able to remove an oracle from an aggregator', async () => {
//                 try{
    
//                     // Initial Values
//                     await signerFactory(eve.sk);
//                     delegationStorage       = await delegationInstance.storage()
//                     const satelliteRecord   = await delegationStorage.satelliteLedger.get(eve.pkh)
    
//                     // Operation
//                     await chai.expect(governanceSatelliteInstance.methods.removeOracleInAggregator(bob.pkh, aggregatorAddress.address, "Test purpose").send()).to.be.rejected;
    
//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "BANNED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//         })

//         describe("%togglePauseAggregator", async () => {

//             it('Suspended satellite should not be able to update an aggregator status', async () => {
//                 try{
    
//                     // Initial Values
//                     await signerFactory(alice.sk);
//                     delegationStorage       = await delegationInstance.storage()
//                     const satelliteRecord   = await delegationStorage.satelliteLedger.get(alice.pkh)
    
//                     // Operation
//                     await chai.expect(governanceSatelliteInstance.methods.togglePauseAggregator(aggregatorAddress.address, "Test purpose", "pauseAll").send()).to.be.rejected;
    
//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "SUSPENDED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
    
//             it('Banned satellite should not be able to update an aggregator status', async () => {
//                 try{
    
//                     // Initial Values
//                     await signerFactory(eve.sk);
//                     delegationStorage       = await delegationInstance.storage()
//                     const satelliteRecord   = await delegationStorage.satelliteLedger.get(eve.pkh)
    
//                     // Operation
//                     await chai.expect(governanceSatelliteInstance.methods.togglePauseAggregator(aggregatorAddress.address, "Test purpose", "pauseAll").send()).to.be.rejected;
    
//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "BANNED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//         })

//         describe("%dropAction", async () => {

//             before("Active satellite creates an action", async () => {
                
//                 try  {

//                     // Initial values
//                     await signerFactory(bob.sk);
//                     governanceSatelliteStorage      = await governanceSatelliteInstance.storage();
//                     const actionId                  = governanceSatelliteStorage.governanceSatelliteCounter.toNumber();
    
//                     // Operation
//                     const operation                 = await governanceSatelliteInstance.methods.togglePauseAggregator(aggregatorAddress.address, "Test purpose", "pauseAll").send()
//                     await operation.confirmation()
    
//                     // Final values
//                     governanceSatelliteStorage      = await governanceSatelliteInstance.storage();
//                     governanceStorage               = await governanceInstance.storage();
//                     delegationStorage               = await delegationInstance.storage();
//                     var currentCycle                = governanceStorage.cycleId;
//                     const firstSatelliteSnapshot    = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});
//                     const secondSatelliteSnapshot   = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: eve.pkh});
//                     const thirdSatelliteSnapshot    = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
//                     const firstSatelliteRecord      = await delegationStorage.satelliteLedger.get(alice.pkh);
//                     const secondSatelliteRecord     = await delegationStorage.satelliteLedger.get(eve.pkh);
//                     const thirdSatelliteRecord      = await delegationStorage.satelliteLedger.get(bob.pkh);
//                     const action                    = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
        
//                     // Assertions
//                     assert.notStrictEqual(action, undefined);
//                     assert.notStrictEqual(firstSatelliteSnapshot, undefined);
//                     assert.notStrictEqual(secondSatelliteSnapshot, undefined);
//                     assert.notStrictEqual(thirdSatelliteSnapshot, undefined);
//                     assert.notStrictEqual(firstSatelliteRecord.status, "ACTIVE");
//                     assert.notStrictEqual(secondSatelliteRecord.status, "ACTIVE");
//                     assert.strictEqual(thirdSatelliteRecord.status, "ACTIVE");

//                 } catch (e) {
//                     console.dir(e, {depth: 5})
//                 }

//             })

//             it('Suspended satellite should not be able to drop an action', async () => {
//                 try{
    
//                     // Initial Values
//                     await signerFactory(alice.sk);
//                     delegationStorage           = await delegationInstance.storage();
//                     governanceSatelliteStorage  = await governanceSatelliteInstance.storage();
//                     const actionId              = governanceSatelliteStorage.governanceSatelliteCounter.toNumber() - 1;
//                     const satelliteRecord       = await delegationStorage.satelliteLedger.get(alice.pkh)
    
//                     // Operation
//                     await chai.expect(governanceSatelliteInstance.methods.dropAction(actionId).send()).to.be.rejected;
    
//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "SUSPENDED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
    
//             it('Banned satellite should not be able to drop an action', async () => {
//                 try{
    
//                     // Initial Values
//                     await signerFactory(eve.sk);
//                     delegationStorage           = await delegationInstance.storage()
//                     governanceSatelliteStorage  = await governanceSatelliteInstance.storage();
//                     const actionId              = governanceSatelliteStorage.governanceSatelliteCounter.toNumber() - 1;
//                     const satelliteRecord       = await delegationStorage.satelliteLedger.get(eve.pkh)
    
//                     // Operation
//                     await chai.expect(governanceSatelliteInstance.methods.dropAction(actionId).send()).to.be.rejected;
    
//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "BANNED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//         })

//         describe("%voteForAction", async () => {

//             it('Suspended satellite should not be able to vote for an action', async () => {
//                 try{
    
//                     // Initial Values
//                     await signerFactory(alice.sk);
//                     delegationStorage           = await delegationInstance.storage();
//                     governanceSatelliteStorage  = await governanceSatelliteInstance.storage();
//                     const actionId              = governanceSatelliteStorage.governanceSatelliteCounter.toNumber() - 1;
//                     const satelliteRecord       = await delegationStorage.satelliteLedger.get(alice.pkh)
    
//                     // Operation
//                     await chai.expect(governanceSatelliteInstance.methods.voteForAction(actionId, "nay").send()).to.be.rejected;
    
//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "SUSPENDED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
    
//             it('Banned satellite should not be able to vote for an action', async () => {
//                 try{
    
//                     // Initial Values
//                     await signerFactory(eve.sk);
//                     delegationStorage           = await delegationInstance.storage()
//                     governanceSatelliteStorage  = await governanceSatelliteInstance.storage();
//                     const actionId              = governanceSatelliteStorage.governanceSatelliteCounter.toNumber() - 1;
//                     const satelliteRecord       = await delegationStorage.satelliteLedger.get(eve.pkh)
    
//                     // Operation
//                     await chai.expect(governanceSatelliteInstance.methods.voteForAction(actionId, "pass").send()).to.be.rejected;
    
//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "BANNED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
//         })
//     })

//     describe("GOVERNANCE FINANCIAL", async () => {

//         before("Create a governance financial action", async () => {
//             try{
//                 // Initial values
//                 await signerFactory(bob.sk)
//                 councilStorage                  = await councilInstance.storage();
//                 const councilActionId           = councilStorage.actionCounter;

//                 // Operation
//                 const updateConfigOperation         = await governanceFinancialInstance.methods.updateConfig(0,"configFinancialReqApprovalPct").send();
//                 await updateConfigOperation.confirmation();

//                 const councilRequestsMintOperation  = await councilInstance.methods.councilActionRequestMint(
//                     treasuryAddress.address, 
//                     MVK(10),
//                     "Test purpose"
//                 ).send();
//                 await councilRequestsMintOperation.confirmation()

//                 await signerFactory(alice.sk);
//                 const aliceSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
//                 await aliceSignsRequestMintActionOperation.confirmation();

//                 await signerFactory(eve.sk);
//                 const eveSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
//                 await eveSignsRequestMintActionOperation.confirmation();

//                 // Final values
//                 councilStorage                  = await councilInstance.storage();
//                 const councilActionsRequestMint = await councilStorage.councilActionsLedger.get(councilActionId);

//                 // Assertions
//                 assert.equal(councilActionsRequestMint.status,        "EXECUTED");
//             } catch(e) {
//                 console.dir(e, {depth: 5})
//             }
//         })

//         describe("%voteForRequest", async () => {

//             it('Suspended satellite should not be able to vote for a request', async () => {
//                 try{
    
//                     // Initial Values
//                     await signerFactory(alice.sk);
//                     delegationStorage               = await delegationInstance.storage();
//                     governanceFinancialStorage      = await governanceFinancialInstance.storage()
//                     const satelliteRecord           = await delegationStorage.satelliteLedger.get(alice.pkh)
//                     const requestId                 = governanceFinancialStorage.financialRequestCounter.toNumber() - 1;
    
//                     // Operation
//                     await chai.expect(governanceFinancialInstance.methods.voteForRequest(requestId, "nay").send()).to.be.rejected;
    
//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "SUSPENDED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('Banned satellite should not be able to vote for a request', async () => {
//                 try{
    
//                     // Initial Values
//                     await signerFactory(eve.sk);
//                     delegationStorage               = await delegationInstance.storage();
//                     governanceFinancialStorage      = await governanceFinancialInstance.storage()
//                     const satelliteRecord           = await delegationStorage.satelliteLedger.get(eve.pkh)
//                     const requestId                 = governanceFinancialStorage.financialRequestCounter.toNumber() - 1;
    
//                     // Operation
//                     await chai.expect(governanceFinancialInstance.methods.voteForRequest(requestId, "nay").send()).to.be.rejected;
    
//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "BANNED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
//         })
//     })

//     describe("AGGREGATOR", async () => {

//         before("Admin initialize the aggregator contract", async () => {
//             try{
//                 // Initial values
//                 await signerFactory(bob.sk)
//                 aggregatorStorage   = await aggregatorInstance.storage()

//                 // Operation
//                 var addOracleOperation          = await aggregatorInstance.methods.addOracle(alice.pkh, alice.pk, alice.peerId).send();
//                 await addOracleOperation.confirmation();
//                 addOracleOperation              = await aggregatorInstance.methods.addOracle(eve.pkh, eve.pk, eve.peerId).send();
//                 await addOracleOperation.confirmation();
//             } catch(e) {
//                 console.dir(e, {depth: 5})
//             }
//         })

//         describe("%withdrawRewardXtz", async () => {

//             before("Update the tracked aggregators on the aggregator factory", async () => {
//                 try{
//                     // Initial values
//                     await signerFactory(bob.sk)

//                     // Operation
//                     const trackOperation   = await aggregatorFactoryInstance.methods.trackAggregator(aggregatorAddress.address).send()
//                     await trackOperation.confirmation()
//                 } catch(e) {
//                     console.dir(e, {depth: 5})
//                 }
//             })

//             it('Suspended satellite should not be able to withdraw XTZ rewards', async () => {
//                 try{
//                     // Initial Values
//                     await signerFactory(alice.sk);
//                     delegationStorage               = await delegationInstance.storage();
//                     aggregatorStorage               = await aggregatorInstance.storage()
//                     const satelliteRecord           = await delegationStorage.satelliteLedger.get(alice.pkh);
                    
//                     // Operation
//                     await chai.expect(aggregatorInstance.methods.withdrawRewardXtz(alice.pkh).send()).to.be.rejected;
    
//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "SUSPENDED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('Banned satellite should not be able to withdraw XTZ rewards', async () => {
//                 try{
//                     // Initial Values
//                     await signerFactory(eve.sk);
//                     delegationStorage               = await delegationInstance.storage();
//                     aggregatorStorage               = await aggregatorInstance.storage()
//                     const satelliteRecord           = await delegationStorage.satelliteLedger.get(eve.pkh)
                    
//                     // Operation
//                     await chai.expect(aggregatorInstance.methods.withdrawRewardXtz(eve.pkh).send()).to.be.rejected;

//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "BANNED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
//         })

//         describe("%withdrawRewardSmvk", async () => {

//             it('Suspended satellite should not be able to withdraw SMVK rewards', async () => {
//                 try{
//                     // Initial Values
//                     await signerFactory(alice.sk);
//                     delegationStorage               = await delegationInstance.storage();
//                     aggregatorStorage               = await aggregatorInstance.storage()
//                     const satelliteRecord           = await delegationStorage.satelliteLedger.get(alice.pkh);
                    
//                     // Operation
//                     await chai.expect(aggregatorInstance.methods.withdrawRewardStakedMvk(alice.pkh).send()).to.be.rejected;
    
//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "SUSPENDED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('Banned satellite should not be able to withdraw SMVK rewards', async () => {
//                 try{
//                     // Initial Values
//                     await signerFactory(eve.sk);
//                     delegationStorage               = await delegationInstance.storage();
//                     aggregatorStorage               = await aggregatorInstance.storage()
//                     const satelliteRecord           = await delegationStorage.satelliteLedger.get(eve.pkh)
                    
//                     // Operation
//                     await chai.expect(aggregatorInstance.methods.withdrawRewardStakedMvk(eve.pkh).send()).to.be.rejected;

//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "BANNED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
//         })
//     })

//     describe("GOVERNANCE", async () => {

//         before("Admin initialized governance config", async () => {
//             try{
//                 // Initial values
//                 await signerFactory(bob.sk)

//                 // Operation
//                 var updateGovernanceConfig  = await governanceInstance.methods.updateConfig(0, "configBlocksPerProposalRound").send();
//                 await updateGovernanceConfig.confirmation();
//                 updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configBlocksPerVotingRound").send();
//                 await updateGovernanceConfig.confirmation();
//                 updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configBlocksPerTimelockRound").send();
//                 await updateGovernanceConfig.confirmation();
//                 updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configMinProposalRoundVotePct").send();
//                 await updateGovernanceConfig.confirmation();
//                 updateGovernanceConfig      = await governanceInstance.methods.updateConfig(1, "configMinProposalRoundVotesReq").send();
//                 await updateGovernanceConfig.confirmation();
//                 updateGovernanceConfig      = await governanceInstance.methods.updateConfig(1, "configMinQuorumPercentage").send();
//                 await updateGovernanceConfig.confirmation();
//                 updateGovernanceConfig      = await governanceInstance.methods.updateConfig(1, "configMinYayVotePercentage").send();
//                 await updateGovernanceConfig.confirmation();
//             } catch(e) {
//                 console.dir(e, {depth: 5})
//             }
//         })

//         describe("%propose", async () => {

//             it('Suspended satellite should not be able to propose', async () => {
//                 try{
//                     // Initial Values
//                     await signerFactory(alice.sk);
//                     delegationStorage               = await delegationInstance.storage();
//                     governanceStorage               = await governanceInstance.storage()
//                     const satelliteRecord           = await delegationStorage.satelliteLedger.get(alice.pkh);
//                     const proposalName              = "Quorum test";
//                     const proposalDesc              = "Details about new proposal";
//                     const proposalIpfs              = "ipfs://QM123456789";
//                     const proposalSourceCode        = "Proposal Source Code";
//                     const lambdaParams              = governanceProxyInstance.methods.dataPackingHelper(
//                         'updateCouncilConfig',
//                         1234,
//                         'configActionExpiryDays'
//                     ).toTransferParams();
//                     const lambdaParamsValue         = lambdaParams.parameter.value;
//                     const proxyDataPackingHelperType= await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                     const referenceDataPacked       = await utils.tezos.rpc.packData({
//                         data: lambdaParamsValue,
//                         type: proxyDataPackingHelperType
//                     }).catch(e => console.error('error:', e));

//                     var packedParam;
//                     if (referenceDataPacked) {
//                         packedParam = referenceDataPacked.packed
//                         // console.log('packed %updateCouncilConfig param: ' + packedParam);
//                     } else {
//                         throw `packing failed`
//                     };

//                     const proposalData      = [
//                         {
//                             addOrSetProposalData: {
//                                 title: "ActionExpiryDays#1",
//                                 encodedCode: packedParam,
//                                 codeDescription: ""
//                             }
//                         }
//                     ]
                    
//                     // Operation
//                     var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                     await nextRoundOperation.confirmation();
//                     await chai.expect(governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1})).to.be.rejected;
    
//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "SUSPENDED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('Banned satellite should not be able to propose', async () => {
//                 try{
//                     // Initial Values
//                     await signerFactory(eve.sk);
//                     delegationStorage               = await delegationInstance.storage();
//                     governanceStorage               = await governanceInstance.storage()
//                     const satelliteRecord           = await delegationStorage.satelliteLedger.get(eve.pkh);
//                     const proposalName              = "Quorum test";
//                     const proposalDesc              = "Details about new proposal";
//                     const proposalIpfs              = "ipfs://QM123456789";
//                     const proposalSourceCode        = "Proposal Source Code";
//                     const lambdaParams              = governanceProxyInstance.methods.dataPackingHelper(
//                         'updateCouncilConfig',
//                         1234,
//                         'configActionExpiryDays'
//                     ).toTransferParams();
//                     const lambdaParamsValue         = lambdaParams.parameter.value;
//                     const proxyDataPackingHelperType= await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                     const referenceDataPacked       = await utils.tezos.rpc.packData({
//                         data: lambdaParamsValue,
//                         type: proxyDataPackingHelperType
//                     }).catch(e => console.error('error:', e));

//                     var packedParam;
//                     if (referenceDataPacked) {
//                         packedParam = referenceDataPacked.packed
//                         // console.log('packed %updateCouncilConfig param: ' + packedParam);
//                     } else {
//                         throw `packing failed`
//                     };

//                     const proposalData      = [
//                         {
//                             addOrSetProposalData: {
//                                 title: "ActionExpiryDays#1",
//                                 encodedCode: packedParam,
//                                 codeDescription: ""
//                             }
//                         }
//                     ]
                    
//                     // Operation
//                     var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                     await nextRoundOperation.confirmation();
//                     await chai.expect(governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1})).to.be.rejected;
    
//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "BANNED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
//         })

//         describe("%updateProposalData", async () => {

//             beforeEach("Admin restores and restores satellites so they can propose", async () => {
//                 try{
//                     // Initial values
//                     await signerFactory(bob.sk)
    
//                     // Operation
//                     var updateStatusOperation   = await delegationInstance.methods.updateSatelliteStatus(alice.pkh, "ACTIVE").send()
//                     await updateStatusOperation.confirmation()
//                     updateStatusOperation       = await delegationInstance.methods.updateSatelliteStatus(eve.pkh, "ACTIVE").send()
//                     await updateStatusOperation.confirmation()
//                 } catch(e) {
//                     console.dir(e, {depth: 5})
//                 }
//             })

//             it('Suspended satellite should not be update proposal data', async () => {
//                 try{
//                     // Initial Values
//                     await signerFactory(alice.sk);
//                     governanceStorage               = await governanceInstance.storage()
//                     const proposalName              = "Quorum test";
//                     const proposalDesc              = "Details about new proposal";
//                     const proposalIpfs              = "ipfs://QM123456789";
//                     const proposalSourceCode        = "Proposal Source Code";
//                     const proposalId                = governanceStorage.nextProposalId.toNumber();
//                     const lambdaParams              = governanceProxyInstance.methods.dataPackingHelper(
//                         'updateCouncilConfig',
//                         1234,
//                         'configActionExpiryDays'
//                     ).toTransferParams();
//                     const lambdaParamsValue         = lambdaParams.parameter.value;
//                     const proxyDataPackingHelperType= await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                     const referenceDataPacked       = await utils.tezos.rpc.packData({
//                         data: lambdaParamsValue,
//                         type: proxyDataPackingHelperType
//                     }).catch(e => console.error('error:', e));

//                     var packedParam;
//                     if (referenceDataPacked) {
//                         packedParam = referenceDataPacked.packed
//                         // console.log('packed %updateCouncilConfig param: ' + packedParam);
//                     } else {
//                         throw `packing failed`
//                     };
                    
//                     const proposalData      = [
//                         {
//                             addOrSetProposalData: {
//                                 title: "Metadata#2",
//                                 encodedCode: packedParam,
//                                 codeDescription: ""
//                             }
//                         }
//                     ]
                    
//                     // Operation
//                     var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                     await nextRoundOperation.confirmation();

//                     const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode).send({amount: 1});
//                     await proposeOperation.confirmation();

//                     await signerFactory(bob.sk)
//                     var updateStatusOperation   = await delegationInstance.methods.updateSatelliteStatus(alice.pkh, "SUSPENDED").send()
//                     await updateStatusOperation.confirmation()

//                     await signerFactory(alice.sk)
//                     await chai.expect(governanceInstance.methods.updateProposalData(proposalId, proposalData).send()).to.be.rejected;
    
//                     // Final values
//                     delegationStorage               = await delegationInstance.storage();
//                     const satelliteRecord           = await delegationStorage.satelliteLedger.get(alice.pkh);

//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "SUSPENDED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('Suspended satellite should not be able to update payment data', async () => {
//                 try{
//                     // Initial Values
//                     await signerFactory(alice.sk);
//                     governanceStorage               = await governanceInstance.storage()
//                     const proposalName              = "Quorum test";
//                     const proposalDesc              = "Details about new proposal";
//                     const proposalIpfs              = "ipfs://QM123456789";
//                     const proposalSourceCode        = "Proposal Source Code";
//                     const proposalId                = governanceStorage.nextProposalId.toNumber();
//                     const lambdaParams              = governanceProxyInstance.methods.dataPackingHelper(
//                         'updateCouncilConfig',
//                         1234,
//                         'configActionExpiryDays'
//                     ).toTransferParams();
//                     const lambdaParamsValue         = lambdaParams.parameter.value;
//                     const proxyDataPackingHelperType= await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                     const referenceDataPacked       = await utils.tezos.rpc.packData({
//                         data: lambdaParamsValue,
//                         type: proxyDataPackingHelperType
//                     }).catch(e => console.error('error:', e));

//                     var packedParam;
//                     if (referenceDataPacked) {
//                         packedParam = referenceDataPacked.packed
//                         // console.log('packed %updateCouncilConfig param: ' + packedParam);
//                     } else {
//                         throw `packing failed`
//                     };

//                     const paymentData        = [
//                         {
//                             addOrSetPaymentData: {
//                                 title: "Payment#1",
//                                 transaction: {
//                                     "to_"    : bob.pkh,
//                                     "token"  : {
//                                         "fa2" : {
//                                             "tokenContractAddress" : mvkTokenAddress.address,
//                                             "tokenId" : 0
//                                         }
//                                     },
//                                     "amount" : MVK(50)
//                                 }
//                             }
//                         }
//                     ]
                    
//                     // Operation
//                     var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                     await nextRoundOperation.confirmation();

//                     const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode).send({amount: 1});
//                     await proposeOperation.confirmation();

//                     await signerFactory(bob.sk)
//                     var updateStatusOperation   = await delegationInstance.methods.updateSatelliteStatus(alice.pkh, "SUSPENDED").send()
//                     await updateStatusOperation.confirmation()

//                     await signerFactory(alice.sk)
//                     await chai.expect(governanceInstance.methods.updateProposalData(proposalId, null, paymentData).send()).to.be.rejected;
    
//                     // Final values
//                     delegationStorage               = await delegationInstance.storage();
//                     const satelliteRecord           = await delegationStorage.satelliteLedger.get(alice.pkh);

//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "SUSPENDED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('Banned satellite should not be able to withdraw SMVK rewards', async () => {
//                 try{
//                     // Initial Values
//                     await signerFactory(eve.sk);
//                     governanceStorage               = await governanceInstance.storage()
//                     const proposalName              = "Quorum test";
//                     const proposalDesc              = "Details about new proposal";
//                     const proposalIpfs              = "ipfs://QM123456789";
//                     const proposalSourceCode        = "Proposal Source Code";
//                     const proposalId                = governanceStorage.nextProposalId.toNumber();
//                     const lambdaParams              = governanceProxyInstance.methods.dataPackingHelper(
//                         'updateCouncilConfig',
//                         1234,
//                         'configActionExpiryDays'
//                     ).toTransferParams();
//                     const lambdaParamsValue         = lambdaParams.parameter.value;
//                     const proxyDataPackingHelperType= await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                     const referenceDataPacked       = await utils.tezos.rpc.packData({
//                         data: lambdaParamsValue,
//                         type: proxyDataPackingHelperType
//                     }).catch(e => console.error('error:', e));

//                     var packedParam;
//                     if (referenceDataPacked) {
//                         packedParam = referenceDataPacked.packed
//                         // console.log('packed %updateCouncilConfig param: ' + packedParam);
//                     } else {
//                         throw `packing failed`
//                     };
                    
//                     const proposalData      = [
//                         {
//                             addOrSetProposalData: {
//                                 title: "Metadata#2",
//                                 encodedCode: packedParam,
//                                 codeDescription: ""
//                             }
//                         }
//                     ]
                    
//                     // Operation
//                     var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                     await nextRoundOperation.confirmation();

//                     const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode).send({amount: 1});
//                     await proposeOperation.confirmation();

//                     await signerFactory(bob.sk)
//                     var updateStatusOperation   = await delegationInstance.methods.updateSatelliteStatus(eve.pkh, "BANNED").send()
//                     await updateStatusOperation.confirmation()

//                     await signerFactory(eve.sk)
//                     await chai.expect(governanceInstance.methods.updateProposalData(proposalId, proposalData).send()).to.be.rejected;
    
//                     // Final values
//                     delegationStorage               = await delegationInstance.storage();
//                     const satelliteRecord           = await delegationStorage.satelliteLedger.get(eve.pkh);

//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "BANNED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('Banned satellite should not be able to update payment data', async () => {
//                 try{
//                     // Initial Values
//                     await signerFactory(eve.sk);
//                     governanceStorage               = await governanceInstance.storage()
//                     const proposalName              = "Quorum test";
//                     const proposalDesc              = "Details about new proposal";
//                     const proposalIpfs              = "ipfs://QM123456789";
//                     const proposalSourceCode        = "Proposal Source Code";
//                     const proposalId                = governanceStorage.nextProposalId.toNumber();
//                     const lambdaParams              = governanceProxyInstance.methods.dataPackingHelper(
//                         'updateCouncilConfig',
//                         1234,
//                         'configActionExpiryDays'
//                     ).toTransferParams();
//                     const lambdaParamsValue         = lambdaParams.parameter.value;
//                     const proxyDataPackingHelperType= await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                     const referenceDataPacked       = await utils.tezos.rpc.packData({
//                         data: lambdaParamsValue,
//                         type: proxyDataPackingHelperType
//                     }).catch(e => console.error('error:', e));

//                     var packedParam;
//                     if (referenceDataPacked) {
//                         packedParam = referenceDataPacked.packed
//                         // console.log('packed %updateCouncilConfig param: ' + packedParam);
//                     } else {
//                         throw `packing failed`
//                     };

//                     const paymentData        = [
//                         {
//                             addOrSetPaymentData: {
//                                 title: "Payment#1",
//                                 transaction: {
//                                     "to_"    : bob.pkh,
//                                     "token"  : {
//                                         "fa2" : {
//                                             "tokenContractAddress" : mvkTokenAddress.address,
//                                             "tokenId" : 0
//                                         }
//                                     },
//                                     "amount" : MVK(50)
//                                 }
//                             }
//                         }
//                     ]

//                     // Operation
//                     var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                     await nextRoundOperation.confirmation();

//                     const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode).send({amount: 1});
//                     await proposeOperation.confirmation();

//                     await signerFactory(bob.sk)
//                     var updateStatusOperation   = await delegationInstance.methods.updateSatelliteStatus(eve.pkh, "BANNED").send()
//                     await updateStatusOperation.confirmation()

//                     await signerFactory(eve.sk)
//                     await chai.expect(governanceInstance.methods.updateProposalData(proposalId, null, paymentData).send()).to.be.rejected;
    
//                     // Final values
//                     delegationStorage               = await delegationInstance.storage();
//                     const satelliteRecord           = await delegationStorage.satelliteLedger.get(eve.pkh);

//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "BANNED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
//         })

//         describe("%lockProposal", async () => {

//             beforeEach("Admin restores and restores satellites so they can propose", async () => {
//                 try{
//                     // Initial values
//                     await signerFactory(bob.sk)
    
//                     // Operation
//                     var updateStatusOperation   = await delegationInstance.methods.updateSatelliteStatus(alice.pkh, "ACTIVE").send()
//                     await updateStatusOperation.confirmation()
//                     updateStatusOperation       = await delegationInstance.methods.updateSatelliteStatus(eve.pkh, "ACTIVE").send()
//                     await updateStatusOperation.confirmation()
//                 } catch(e) {
//                     console.dir(e, {depth: 5})
//                 }
//             })

//             it('Suspended satellite should not be able to lock a proposal', async () => {
//                 try{
//                     // Initial Values
//                     await signerFactory(alice.sk);
//                     governanceStorage               = await governanceInstance.storage()
//                     const proposalName              = "Quorum test";
//                     const proposalDesc              = "Details about new proposal";
//                     const proposalIpfs              = "ipfs://QM123456789";
//                     const proposalSourceCode        = "Proposal Source Code";
//                     const proposalId                = governanceStorage.nextProposalId.toNumber();
//                     const lambdaParams              = governanceProxyInstance.methods.dataPackingHelper(
//                         'updateCouncilConfig',
//                         1234,
//                         'configActionExpiryDays'
//                     ).toTransferParams();
//                     const lambdaParamsValue         = lambdaParams.parameter.value;
//                     const proxyDataPackingHelperType= await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                     const referenceDataPacked       = await utils.tezos.rpc.packData({
//                         data: lambdaParamsValue,
//                         type: proxyDataPackingHelperType
//                     }).catch(e => console.error('error:', e));

//                     var packedParam;
//                     if (referenceDataPacked) {
//                         packedParam = referenceDataPacked.packed
//                         // console.log('packed %updateCouncilConfig param: ' + packedParam);
//                     } else {
//                         throw `packing failed`
//                     };
                    
//                     // Operation
//                     var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                     await nextRoundOperation.confirmation();

//                     const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode).send({amount: 1});
//                     await proposeOperation.confirmation();

//                     await signerFactory(bob.sk)
//                     const updateStatusOperation = await delegationInstance.methods.updateSatelliteStatus(alice.pkh, "SUSPENDED").send()
//                     await updateStatusOperation.confirmation()

//                     await signerFactory(alice.sk)
//                     await chai.expect(governanceInstance.methods.lockProposal(proposalId).send()).to.be.rejected;
    
//                     // Final values
//                     delegationStorage               = await delegationInstance.storage();
//                     const satelliteRecord           = await delegationStorage.satelliteLedger.get(alice.pkh);

//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "SUSPENDED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('Banned satellite should not be able to lock a proposal', async () => {
//                 try{
//                     // Initial Values
//                     await signerFactory(eve.sk);
//                     governanceStorage               = await governanceInstance.storage()
//                     const proposalName              = "Quorum test";
//                     const proposalDesc              = "Details about new proposal";
//                     const proposalIpfs              = "ipfs://QM123456789";
//                     const proposalSourceCode        = "Proposal Source Code";
//                     const proposalId                = governanceStorage.nextProposalId.toNumber();
//                     const lambdaParams              = governanceProxyInstance.methods.dataPackingHelper(
//                         'updateCouncilConfig',
//                         1234,
//                         'configActionExpiryDays'
//                     ).toTransferParams();
//                     const lambdaParamsValue         = lambdaParams.parameter.value;
//                     const proxyDataPackingHelperType= await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                     const referenceDataPacked       = await utils.tezos.rpc.packData({
//                         data: lambdaParamsValue,
//                         type: proxyDataPackingHelperType
//                     }).catch(e => console.error('error:', e));

//                     var packedParam;
//                     if (referenceDataPacked) {
//                         packedParam = referenceDataPacked.packed
//                         // console.log('packed %updateCouncilConfig param: ' + packedParam);
//                     } else {
//                         throw `packing failed`
//                     };
                    
//                     // Operation
//                     var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                     await nextRoundOperation.confirmation();

//                     const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode).send({amount: 1});
//                     await proposeOperation.confirmation();

//                     await signerFactory(bob.sk)
//                     const updateStatusOperation = await delegationInstance.methods.updateSatelliteStatus(eve.pkh, "BANNED").send()
//                     await updateStatusOperation.confirmation()

//                     await signerFactory(eve.sk)
//                     await chai.expect(governanceInstance.methods.lockProposal(proposalId).send()).to.be.rejected;
    
//                     // Final values
//                     delegationStorage               = await delegationInstance.storage();
//                     const satelliteRecord           = await delegationStorage.satelliteLedger.get(eve.pkh);

//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "BANNED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
//         })

//         describe("%proposalRoundVote", async () => {

//             beforeEach("Admin restores and restores satellites so they can propose", async () => {
//                 try{
//                     // Initial values
//                     await signerFactory(bob.sk)
    
//                     // Operation
//                     var updateStatusOperation   = await delegationInstance.methods.updateSatelliteStatus(alice.pkh, "ACTIVE").send()
//                     await updateStatusOperation.confirmation()
//                     updateStatusOperation       = await delegationInstance.methods.updateSatelliteStatus(eve.pkh, "ACTIVE").send()
//                     await updateStatusOperation.confirmation()
//                 } catch(e) {
//                     console.dir(e, {depth: 5})
//                 }
//             })

//             it('Suspended satellite should not be able to vote for a proposal during the proposal round', async () => {
//                 try{
//                     // Initial Values
//                     await signerFactory(alice.sk);
//                     governanceStorage               = await governanceInstance.storage()
//                     const proposalName              = "Quorum test";
//                     const proposalDesc              = "Details about new proposal";
//                     const proposalIpfs              = "ipfs://QM123456789";
//                     const proposalSourceCode        = "Proposal Source Code";
//                     const proposalId                = governanceStorage.nextProposalId.toNumber();
//                     const lambdaParams              = governanceProxyInstance.methods.dataPackingHelper(
//                         'updateCouncilConfig',
//                         1234,
//                         'configActionExpiryDays'
//                     ).toTransferParams();
//                     const lambdaParamsValue         = lambdaParams.parameter.value;
//                     const proxyDataPackingHelperType= await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                     const referenceDataPacked       = await utils.tezos.rpc.packData({
//                         data: lambdaParamsValue,
//                         type: proxyDataPackingHelperType
//                     }).catch(e => console.error('error:', e));

//                     var packedParam;
//                     if (referenceDataPacked) {
//                         packedParam = referenceDataPacked.packed
//                         // console.log('packed %updateCouncilConfig param: ' + packedParam);
//                     } else {
//                         throw `packing failed`
//                     };

//                     const proposalData      = [
//                         {
//                             addOrSetProposalData: {
//                                 title: "ActionExpiryDays#1",
//                                 encodedCode: packedParam,
//                                 codeDescription: ""
//                             }
//                         }
//                     ]
                    
//                     // Operation
//                     var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                     await nextRoundOperation.confirmation();

//                     const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
//                     await proposeOperation.confirmation();
                
//                     const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
//                     await lockOperation.confirmation();

//                     await signerFactory(bob.sk)
//                     const updateStatusOperation = await delegationInstance.methods.updateSatelliteStatus(alice.pkh, "SUSPENDED").send()
//                     await updateStatusOperation.confirmation()

//                     await signerFactory(alice.sk)
//                     await chai.expect(governanceInstance.methods.proposalRoundVote(proposalId).send()).to.be.rejected;
    
//                     // Final values
//                     delegationStorage               = await delegationInstance.storage();
//                     const satelliteRecord           = await delegationStorage.satelliteLedger.get(alice.pkh);

//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "SUSPENDED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('Banned satellite should not be able to vote for a proposal during the proposal round', async () => {
//                 try{
//                     // Initial Values
//                     await signerFactory(eve.sk);
//                     governanceStorage               = await governanceInstance.storage()
//                     const proposalName              = "Quorum test";
//                     const proposalDesc              = "Details about new proposal";
//                     const proposalIpfs              = "ipfs://QM123456789";
//                     const proposalSourceCode        = "Proposal Source Code";
//                     const proposalId                = governanceStorage.nextProposalId.toNumber();
//                     const lambdaParams              = governanceProxyInstance.methods.dataPackingHelper(
//                         'updateCouncilConfig',
//                         1234,
//                         'configActionExpiryDays'
//                     ).toTransferParams();
//                     const lambdaParamsValue         = lambdaParams.parameter.value;
//                     const proxyDataPackingHelperType= await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                     const referenceDataPacked       = await utils.tezos.rpc.packData({
//                         data: lambdaParamsValue,
//                         type: proxyDataPackingHelperType
//                     }).catch(e => console.error('error:', e));

//                     var packedParam;
//                     if (referenceDataPacked) {
//                         packedParam = referenceDataPacked.packed
//                         // console.log('packed %updateCouncilConfig param: ' + packedParam);
//                     } else {
//                         throw `packing failed`
//                     };

//                     const proposalData      = [
//                         {
//                             addOrSetProposalData: {
//                                 title: "ActionExpiryDays#1",
//                                 encodedCode: packedParam,
//                                 codeDescription: ""
//                             }
//                         }
//                     ]
                    
//                     // Operation
//                     var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                     await nextRoundOperation.confirmation();

//                     const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
//                     await proposeOperation.confirmation();
                
//                     const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
//                     await lockOperation.confirmation();

//                     await signerFactory(bob.sk)
//                     const updateStatusOperation = await delegationInstance.methods.updateSatelliteStatus(eve.pkh, "BANNED").send()
//                     await updateStatusOperation.confirmation()

//                     await signerFactory(eve.sk)
//                     await chai.expect(governanceInstance.methods.proposalRoundVote(proposalId).send()).to.be.rejected;
    
//                     // Final values
//                     delegationStorage               = await delegationInstance.storage();
//                     const satelliteRecord           = await delegationStorage.satelliteLedger.get(eve.pkh);

//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "BANNED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
//         })

//         describe("%votingRoundVote", async () => {

//             beforeEach("Admin restores and restores satellites so they can propose", async () => {
//                 try{
//                     // Initial values
//                     await signerFactory(bob.sk)
    
//                     // Operation
//                     var updateStatusOperation   = await delegationInstance.methods.updateSatelliteStatus(alice.pkh, "ACTIVE").send()
//                     await updateStatusOperation.confirmation()
//                     updateStatusOperation       = await delegationInstance.methods.updateSatelliteStatus(eve.pkh, "ACTIVE").send()
//                     await updateStatusOperation.confirmation()
//                 } catch(e) {
//                     console.dir(e, {depth: 5})
//                 }
//             })

//             it('Suspended satellite should not be able to vote for a proposal during the voting round', async () => {
//                 try{
//                     // Initial Values
//                     await signerFactory(alice.sk);
//                     governanceStorage               = await governanceInstance.storage()
//                     const proposalName              = "Quorum test";
//                     const proposalDesc              = "Details about new proposal";
//                     const proposalIpfs              = "ipfs://QM123456789";
//                     const proposalSourceCode        = "Proposal Source Code";
//                     const proposalId                = governanceStorage.nextProposalId.toNumber();
//                     const lambdaParams              = governanceProxyInstance.methods.dataPackingHelper(
//                         'updateCouncilConfig',
//                         1234,
//                         'configActionExpiryDays'
//                     ).toTransferParams();
//                     const lambdaParamsValue         = lambdaParams.parameter.value;
//                     const proxyDataPackingHelperType= await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                     const referenceDataPacked       = await utils.tezos.rpc.packData({
//                         data: lambdaParamsValue,
//                         type: proxyDataPackingHelperType
//                     }).catch(e => console.error('error:', e));

//                     var packedParam;
//                     if (referenceDataPacked) {
//                         packedParam = referenceDataPacked.packed
//                         // console.log('packed %updateCouncilConfig param: ' + packedParam);
//                     } else {
//                         throw `packing failed`
//                     };

//                     const proposalData      = [
//                         {
//                             addOrSetProposalData: {
//                                 title: "ActionExpiryDays#1",
//                                 encodedCode: packedParam,
//                                 codeDescription: ""
//                             }
//                         }
//                     ]
                    
//                     // Operation
//                     var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                     await nextRoundOperation.confirmation();

//                     const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
//                     await proposeOperation.confirmation();
                
//                     const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
//                     await lockOperation.confirmation();

//                     var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//                     await voteOperation.confirmation();
//                     await signerFactory(bob.sk);
    
//                     voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//                     await voteOperation.confirmation();
//                     await signerFactory(alice.sk);

//                     nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
//                     await nextRoundOperation.confirmation();

//                     await signerFactory(bob.sk)
//                     const updateStatusOperation = await delegationInstance.methods.updateSatelliteStatus(alice.pkh, "SUSPENDED").send()
//                     await updateStatusOperation.confirmation()

//                     await signerFactory(alice.sk)
//                     await chai.expect(governanceInstance.methods.votingRoundVote("nay").send()).to.be.rejected;
    
//                     // Final values
//                     delegationStorage               = await delegationInstance.storage();
//                     const satelliteRecord           = await delegationStorage.satelliteLedger.get(alice.pkh);

//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "SUSPENDED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('Banned satellite should not be able to vote for a proposal during the voting round', async () => {
//                 try{
//                     // Initial Values
//                     await signerFactory(eve.sk);
//                     governanceStorage               = await governanceInstance.storage()
//                     const proposalName              = "Quorum test";
//                     const proposalDesc              = "Details about new proposal";
//                     const proposalIpfs              = "ipfs://QM123456789";
//                     const proposalSourceCode        = "Proposal Source Code";
//                     const proposalId                = governanceStorage.nextProposalId.toNumber();
//                     const lambdaParams              = governanceProxyInstance.methods.dataPackingHelper(
//                         'updateCouncilConfig',
//                         1234,
//                         'configActionExpiryDays'
//                     ).toTransferParams();
//                     const lambdaParamsValue         = lambdaParams.parameter.value;
//                     const proxyDataPackingHelperType= await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                     const referenceDataPacked       = await utils.tezos.rpc.packData({
//                         data: lambdaParamsValue,
//                         type: proxyDataPackingHelperType
//                     }).catch(e => console.error('error:', e));

//                     var packedParam;
//                     if (referenceDataPacked) {
//                         packedParam = referenceDataPacked.packed
//                         // console.log('packed %updateCouncilConfig param: ' + packedParam);
//                     } else {
//                         throw `packing failed`
//                     };

//                     const proposalData      = [
//                         {
//                             addOrSetProposalData: {
//                                 title: "ActionExpiryDays#1",
//                                 encodedCode: packedParam,
//                                 codeDescription: ""
//                             }
//                         }
//                     ]
                    
//                     // Operation
//                     var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                     await nextRoundOperation.confirmation();

//                     const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
//                     await proposeOperation.confirmation();
                
//                     const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
//                     await lockOperation.confirmation();

//                     var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//                     await voteOperation.confirmation();
//                     await signerFactory(bob.sk);
    
//                     voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//                     await voteOperation.confirmation();
//                     await signerFactory(eve.sk);

//                     nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
//                     await nextRoundOperation.confirmation();

//                     await signerFactory(bob.sk)
//                     const updateStatusOperation = await delegationInstance.methods.updateSatelliteStatus(eve.pkh, "BANNED").send()
//                     await updateStatusOperation.confirmation()

//                     await signerFactory(eve.sk)
//                     await chai.expect(governanceInstance.methods.votingRoundVote("nay").send()).to.be.rejected;
    
//                     // Final values
//                     delegationStorage               = await delegationInstance.storage();
//                     const satelliteRecord           = await delegationStorage.satelliteLedger.get(eve.pkh);

//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "BANNED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
//         })

//         describe("%processProposalPayment", async () => {

//             beforeEach("Admin restores and restores satellites so they can propose and set council admin to governance proxy", async () => {
//                 try{
//                     // Initial values
//                     await signerFactory(bob.sk)
    
//                     // Operation
//                     var updateStatusOperation   = await delegationInstance.methods.updateSatelliteStatus(alice.pkh, "ACTIVE").send()
//                     await updateStatusOperation.confirmation()
//                     updateStatusOperation       = await delegationInstance.methods.updateSatelliteStatus(eve.pkh, "ACTIVE").send()
//                     await updateStatusOperation.confirmation()
//                 } catch(e) {
//                     console.dir(e, {depth: 5})
//                 }
//             })

//             before("Admin set council admin to governance proxy", async () => {
//                 try{
//                     // Initial values
//                     await signerFactory(bob.sk)
    
//                     // Operation
//                     const setAdminOperation     = await councilInstance.methods.setAdmin(governanceProxyAddress.address).send()
//                     await setAdminOperation.confirmation()
//                 } catch(e) {
//                     console.dir(e, {depth: 5})
//                 }
//             })

//             it('Suspended satellite should not be able to process proposal payment', async () => {
//                 try{
//                     // Initial Values
//                     await signerFactory(alice.sk);
//                     governanceStorage               = await governanceInstance.storage()
//                     const proposalName              = "Quorum test";
//                     const proposalDesc              = "Details about new proposal";
//                     const proposalIpfs              = "ipfs://QM123456789";
//                     const proposalSourceCode        = "Proposal Source Code";
//                     const proposalId                = governanceStorage.nextProposalId.toNumber();
//                     const proposalPaymentData       = [
//                         {
//                             addOrSetPaymentData: {
//                                 title: "Payment#0",
//                                 transaction: {
//                                     "to_"    : bob.pkh,
//                                     "token"  : {
//                                         "fa2" : {
//                                             "tokenContractAddress" : mvkTokenAddress.address,
//                                             "tokenId" : 0
//                                         }
//                                     },
//                                     "amount" : MVK(50)
//                                 }
//                             }
//                         },
//                         {
//                             addOrSetPaymentData: {
//                                 title: "Payment#0",
//                                 transaction: {
//                                     "to_"    : eve.pkh,
//                                     "token"  : {
//                                         "fa2" : {
//                                             "tokenContractAddress" : mvkTokenAddress.address,
//                                             "tokenId" : 0
//                                         }
//                                     },
//                                     "amount" : MVK(50)
//                                 }
//                             }
//                         }
//                     ]
                    
//                     const lambdaParams              = governanceProxyInstance.methods.dataPackingHelper(
//                         'updateCouncilConfig',
//                         1234,
//                         'configActionExpiryDays'
//                     ).toTransferParams();
//                     const lambdaParamsValue         = lambdaParams.parameter.value;
//                     const proxyDataPackingHelperType= await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                     const referenceDataPacked       = await utils.tezos.rpc.packData({
//                         data: lambdaParamsValue,
//                         type: proxyDataPackingHelperType
//                     }).catch(e => console.error('error:', e));

//                     var packedParam;
//                     if (referenceDataPacked) {
//                         packedParam = referenceDataPacked.packed
//                         // console.log('packed %updateCouncilConfig param: ' + packedParam);
//                     } else {
//                         throw `packing failed`
//                     };

//                     const proposalData      = [
//                         {
//                             addOrSetProposalData: {
//                                 title: "ActionExpiryDays#1",
//                                 encodedCode: packedParam,
//                                 codeDescription: ""
//                             }
//                         }
//                     ]

//                     // Operation
//                     var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                     await nextRoundOperation.confirmation();


//                     const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData, proposalPaymentData).send({amount: 1});
//                     await proposeOperation.confirmation();

//                     const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
//                     await lockOperation.confirmation();

//                     var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//                     await voteOperation.confirmation();
//                     await signerFactory(bob.sk);

//                     voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//                     await voteOperation.confirmation();
//                     await signerFactory(alice.sk);

//                     nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
//                     await nextRoundOperation.confirmation();

//                     var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
//                     await votingRoundVoteOperation.confirmation();
//                     await signerFactory(bob.sk);

//                     votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
//                     await votingRoundVoteOperation.confirmation();
//                     await signerFactory(alice.sk);

//                     nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                     await nextRoundOperation.confirmation();

//                     nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                     await nextRoundOperation.confirmation();

//                     await signerFactory(bob.sk)
//                     const updateStatusOperation = await delegationInstance.methods.updateSatelliteStatus(alice.pkh, "SUSPENDED").send()
//                     await updateStatusOperation.confirmation()

//                     await signerFactory(alice.sk)
//                     await chai.expect(governanceInstance.methods.processProposalPayment(proposalId).send()).to.be.rejected;

//                     // Final values
//                     delegationStorage               = await delegationInstance.storage();
//                     const satelliteRecord           = await delegationStorage.satelliteLedger.get(alice.pkh);

//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "SUSPENDED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('Banned satellite should not be able to process proposal payment', async () => {
//                 try{
//                     // Initial Values
//                     await signerFactory(eve.sk);
//                     governanceStorage               = await governanceInstance.storage()
//                     const proposalName              = "Quorum test";
//                     const proposalDesc              = "Details about new proposal";
//                     const proposalIpfs              = "ipfs://QM123456789";
//                     const proposalSourceCode        = "Proposal Source Code";
//                     const proposalId                = governanceStorage.nextProposalId.toNumber();
//                     const proposalPaymentData       = [
//                         {
//                             addOrSetPaymentData: {
//                                 title: "Payment#0",
//                                 transaction: {
//                                     "to_"    : bob.pkh,
//                                     "token"  : {
//                                         "fa2" : {
//                                             "tokenContractAddress" : mvkTokenAddress.address,
//                                             "tokenId" : 0
//                                         }
//                                     },
//                                     "amount" : MVK(50)
//                                 }
//                             }
//                         },
//                         {
//                             addOrSetPaymentData: {
//                                 title: "Payment#0",
//                                 transaction: {
//                                     "to_"    : eve.pkh,
//                                     "token"  : {
//                                         "fa2" : {
//                                             "tokenContractAddress" : mvkTokenAddress.address,
//                                             "tokenId" : 0
//                                         }
//                                     },
//                                     "amount" : MVK(50)
//                                 }
//                             }
//                         }
//                     ]
                    
//                     const lambdaParams              = governanceProxyInstance.methods.dataPackingHelper(
//                         'updateCouncilConfig',
//                         1234,
//                         'configActionExpiryDays'
//                     ).toTransferParams();
//                     const lambdaParamsValue         = lambdaParams.parameter.value;
//                     const proxyDataPackingHelperType= await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                     const referenceDataPacked       = await utils.tezos.rpc.packData({
//                         data: lambdaParamsValue,
//                         type: proxyDataPackingHelperType
//                     }).catch(e => console.error('error:', e));

//                     var packedParam;
//                     if (referenceDataPacked) {
//                         packedParam = referenceDataPacked.packed
//                         // console.log('packed %updateCouncilConfig param: ' + packedParam);
//                     } else {
//                         throw `packing failed`
//                     };

//                     const proposalData      = [
//                         {
//                             addOrSetProposalData: {
//                                 title: "ActionExpiryDays#1",
//                                 encodedCode: packedParam,
//                                 codeDescription: ""
//                             }
//                         }
//                     ]
                    
//                     // Operation
//                     var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                     await nextRoundOperation.confirmation();

//                     const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData, proposalPaymentData).send({amount: 1});
//                     await proposeOperation.confirmation();
                
//                     const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
//                     await lockOperation.confirmation();

//                     var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//                     await voteOperation.confirmation();
//                     await signerFactory(bob.sk);
    
//                     voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//                     await voteOperation.confirmation();
//                     await signerFactory(eve.sk);

//                     nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
//                     await nextRoundOperation.confirmation();

//                     var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
//                     await votingRoundVoteOperation.confirmation();
//                     await signerFactory(bob.sk);
    
//                     votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
//                     await votingRoundVoteOperation.confirmation();
//                     await signerFactory(eve.sk);

//                     nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                     await nextRoundOperation.confirmation();
    
//                     nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
//                     await nextRoundOperation.confirmation();

//                     await signerFactory(bob.sk)
//                     const updateStatusOperation = await delegationInstance.methods.updateSatelliteStatus(eve.pkh, "BANNED").send()
//                     await updateStatusOperation.confirmation()

//                     await signerFactory(eve.sk)
//                     await chai.expect(governanceInstance.methods.processProposalPayment(proposalId).send()).to.be.rejected;
    
//                     // Final values
//                     delegationStorage               = await delegationInstance.storage();
//                     const satelliteRecord           = await delegationStorage.satelliteLedger.get(eve.pkh);

//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "BANNED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
//         })

//         describe("%dropProposal", async () => {

//             beforeEach("Admin restores and restores satellites so they can propose", async () => {
//                 try{
//                     // Initial values
//                     await signerFactory(bob.sk)
    
//                     // Operation
//                     var updateStatusOperation   = await delegationInstance.methods.updateSatelliteStatus(alice.pkh, "ACTIVE").send()
//                     await updateStatusOperation.confirmation()
//                     updateStatusOperation       = await delegationInstance.methods.updateSatelliteStatus(eve.pkh, "ACTIVE").send()
//                     await updateStatusOperation.confirmation()
//                 } catch(e) {
//                     console.dir(e, {depth: 5})
//                 }
//             })

//             it('Suspended satellite should not be able to drop a proposal', async () => {
//                 try{
//                     // Initial Values
//                     await signerFactory(alice.sk);
//                     governanceStorage               = await governanceInstance.storage()
//                     const proposalName              = "Quorum test";
//                     const proposalDesc              = "Details about new proposal";
//                     const proposalIpfs              = "ipfs://QM123456789";
//                     const proposalSourceCode        = "Proposal Source Code";
//                     const proposalId                = governanceStorage.nextProposalId.toNumber();
//                     const proposalPaymentData       = [
//                         {
//                             addOrSetPaymentData: {
//                                 title: "Payment#0",
//                                 transaction: {
//                                     "to_"    : bob.pkh,
//                                     "token"  : {
//                                         "fa2" : {
//                                             "tokenContractAddress" : mvkTokenAddress.address,
//                                             "tokenId" : 0
//                                         }
//                                     },
//                                     "amount" : MVK(50)
//                                 }
//                             }
//                         },
//                         {
//                             addOrSetPaymentData: {
//                                 title: "Payment#0",
//                                 transaction: {
//                                     "to_"    : eve.pkh,
//                                     "token"  : {
//                                         "fa2" : {
//                                             "tokenContractAddress" : mvkTokenAddress.address,
//                                             "tokenId" : 0
//                                         }
//                                     },
//                                     "amount" : MVK(50)
//                                 }
//                             }
//                         }
//                     ]
                    
//                     const lambdaParams              = governanceProxyInstance.methods.dataPackingHelper(
//                         'updateCouncilConfig',
//                         1234,
//                         'configActionExpiryDays'
//                     ).toTransferParams();
//                     const lambdaParamsValue         = lambdaParams.parameter.value;
//                     const proxyDataPackingHelperType= await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                     const referenceDataPacked       = await utils.tezos.rpc.packData({
//                         data: lambdaParamsValue,
//                         type: proxyDataPackingHelperType
//                     }).catch(e => console.error('error:', e));

//                     var packedParam;
//                     if (referenceDataPacked) {
//                         packedParam = referenceDataPacked.packed
//                         // console.log('packed %updateCouncilConfig param: ' + packedParam);
//                     } else {
//                         throw `packing failed`
//                     };

//                     const proposalData      = [
//                         {
//                             addOrSetProposalData: {
//                                 title: "ActionExpiryDays#1",
//                                 encodedCode: packedParam,
//                                 codeDescription: ""
//                             }
//                         }
//                     ]
                    
//                     // Operation
//                     var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                     await nextRoundOperation.confirmation();

//                     const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData, proposalPaymentData).send({amount: 1});
//                     await proposeOperation.confirmation();

//                     await signerFactory(bob.sk)
//                     const updateStatusOperation = await delegationInstance.methods.updateSatelliteStatus(alice.pkh, "SUSPENDED").send()
//                     await updateStatusOperation.confirmation()

//                     await signerFactory(alice.sk)
//                     await chai.expect(governanceInstance.methods.dropProposal(proposalId).send()).to.be.rejected;
    
//                     // Final values
//                     delegationStorage               = await delegationInstance.storage();
//                     const satelliteRecord           = await delegationStorage.satelliteLedger.get(alice.pkh);

//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "SUSPENDED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });

//             it('Banned satellite should not be able to drop a proposal', async () => {
//                 try{
//                     // Initial Values
//                     await signerFactory(eve.sk);
//                     governanceStorage               = await governanceInstance.storage()
//                     const proposalName              = "Quorum test";
//                     const proposalDesc              = "Details about new proposal";
//                     const proposalIpfs              = "ipfs://QM123456789";
//                     const proposalSourceCode        = "Proposal Source Code";
//                     const proposalId                = governanceStorage.nextProposalId.toNumber();
//                     const proposalPaymentData       = [
//                         {
//                             addOrSetPaymentData: {
//                                 title: "Payment#0",
//                                 transaction: {
//                                     "to_"    : bob.pkh,
//                                     "token"  : {
//                                         "fa2" : {
//                                             "tokenContractAddress" : mvkTokenAddress.address,
//                                             "tokenId" : 0
//                                         }
//                                     },
//                                     "amount" : MVK(50)
//                                 }
//                             }
//                         },
//                         {
//                             addOrSetPaymentData: {
//                                 title: "Payment#0",
//                                 transaction: {
//                                     "to_"    : eve.pkh,
//                                     "token"  : {
//                                         "fa2" : {
//                                             "tokenContractAddress" : mvkTokenAddress.address,
//                                             "tokenId" : 0
//                                         }
//                                     },
//                                     "amount" : MVK(50)
//                                 }
//                             }
//                         }
//                     ]
                    
//                     const lambdaParams              = governanceProxyInstance.methods.dataPackingHelper(
//                         'updateCouncilConfig',
//                         1234,
//                         'configActionExpiryDays'
//                     ).toTransferParams();
//                     const lambdaParamsValue         = lambdaParams.parameter.value;
//                     const proxyDataPackingHelperType= await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;

//                     const referenceDataPacked       = await utils.tezos.rpc.packData({
//                         data: lambdaParamsValue,
//                         type: proxyDataPackingHelperType
//                     }).catch(e => console.error('error:', e));

//                     var packedParam;
//                     if (referenceDataPacked) {
//                         packedParam = referenceDataPacked.packed
//                         // console.log('packed %updateCouncilConfig param: ' + packedParam);
//                     } else {
//                         throw `packing failed`
//                     };

//                     const proposalData      = [
//                         {
//                             addOrSetProposalData: {
//                                 title: "ActionExpiryDays#1",
//                                 encodedCode: packedParam,
//                                 codeDescription: ""
//                             }
//                         }
//                     ]
                    
//                     // Operation
//                     var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                     await nextRoundOperation.confirmation();

//                     const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData, proposalPaymentData).send({amount: 1});
//                     await proposeOperation.confirmation();

//                     await signerFactory(bob.sk)
//                     const updateStatusOperation = await delegationInstance.methods.updateSatelliteStatus(eve.pkh, "BANNED").send()
//                     await updateStatusOperation.confirmation()

//                     await signerFactory(eve.sk)
//                     await chai.expect(governanceInstance.methods.dropProposal(proposalId).send()).to.be.rejected;
    
//                     // Final values
//                     delegationStorage               = await delegationInstance.storage();
//                     const satelliteRecord           = await delegationStorage.satelliteLedger.get(eve.pkh);

//                     // Assertions
//                     assert.strictEqual(satelliteRecord.status, "BANNED");
//                 } catch(e){
//                     console.dir(e, {depth: 5});
//                 }
//             });
//         })
//     })
// });
