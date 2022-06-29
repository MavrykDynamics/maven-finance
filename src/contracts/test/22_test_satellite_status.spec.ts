const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
const { InMemorySigner, importKey } = require("@taquito/signer");
import assert, { ok, rejects, strictEqual, fail } from "assert";
import { MVK, Utils, zeroAddress } from "./helpers/Utils";
import fs from "fs";
import { confirmOperation } from "../scripts/confirmation";
import { MichelsonMap } from "@taquito/taquito";
import {BigNumber} from "bignumber.js";

const chai = require("chai");
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

import env from "../env";
import { bob, alice, eve, mallory, trudy, oracleMaintainer } from "../scripts/sandbox/accounts";

import doormanAddress                   from '../deployments/doormanAddress.json';
import delegationAddress                from '../deployments/delegationAddress.json';
import governanceAddress                from '../deployments/governanceAddress.json';
import governanceSatelliteAddress       from '../deployments/governanceSatelliteAddress.json';
import mvkTokenAddress                  from '../deployments/mvkTokenAddress.json';
import aggregatorAddress                from '../deployments/aggregatorAddress.json';
import governanceFinancialAddress       from '../deployments/governanceFinancialAddress.json';


import { config } from "yargs";
import { aggregatorStorageType } from "./types/aggregatorStorageType";

describe("Satellite status tests", async () => {
    var utils: Utils;

    let doormanInstance;
    let delegationInstance;
    let mvkTokenInstance;
    let governanceInstance;
    let governanceSatelliteInstance;
    let governanceFinancialInstance;
    let aggregatorInstance;
    
    let doormanStorage;
    let delegationStorage;
    let mvkTokenStorage;
    let governanceStorage;
    let governanceSatelliteStorage;
    let governanceFinancialStorage;
    let aggregatorStorage;
    
    const signerFactory = async (pk) => {
        await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
        return utils.tezos;
    };

    before("setup", async () => {
        try{
            utils = new Utils();
            await utils.init(bob.sk);
            
            doormanInstance                 = await utils.tezos.contract.at(doormanAddress.address);
            delegationInstance              = await utils.tezos.contract.at(delegationAddress.address);
            mvkTokenInstance                = await utils.tezos.contract.at(mvkTokenAddress.address);
            governanceInstance              = await utils.tezos.contract.at(governanceAddress.address);
            governanceSatelliteInstance     = await utils.tezos.contract.at(governanceSatelliteAddress.address);
            aggregatorInstance              = await utils.tezos.contract.at(aggregatorAddress.address);
            governanceFinancialInstance     = await utils.tezos.contract.at(governanceFinancialAddress.address);
    
            doormanStorage                  = await doormanInstance.storage();
            delegationStorage               = await delegationInstance.storage();
            mvkTokenStorage                 = await mvkTokenInstance.storage();
            governanceStorage               = await governanceSatelliteInstance.storage();
            governanceSatelliteStorage      = await governanceSatelliteInstance.storage();
            aggregatorStorage               = await aggregatorInstance.storage();
            governanceFinancialStorage      = await governanceFinancialInstance.storage();
            
            console.log('-- -- -- -- -- Governance Satellite Tests -- -- -- --')
            console.log('Doorman Contract deployed at:'               , doormanInstance.address);
            console.log('Delegation Contract deployed at:'            , delegationInstance.address);
            console.log('MVK Token Contract deployed at:'             , mvkTokenInstance.address);
            console.log('Governance Contract deployed at:'            , governanceInstance.address);
            console.log('Governance Satellite Contract deployed at:'  , governanceSatelliteInstance.address);
            console.log('Governance Financial Contract deployed at:'  , governanceFinancialInstance.address);
            console.log('Aggregator Contract deployed at:'            , aggregatorInstance.address);
            
            console.log('Bob address: '     + bob.pkh);
            console.log('Alice address: '   + alice.pkh);
            console.log('Eve address: '     + eve.pkh);
            console.log('Mallory address: ' + mallory.pkh);
    
            delegationStorage = await delegationInstance.storage();
            const satelliteMap = await delegationStorage.satelliteLedger;
    
            if(satelliteMap.get(bob.pkh) === undefined){

                // ------------------------------------------------------------------
                // Creation of 3 satellites
                // ------------------------------------------------------------------

                // 1st Satellite -> Bob
                var updateOperatorsOperation = await mvkTokenInstance.methods
                    .update_operators([
                    {
                        add_operator: {
                            owner: bob.pkh,
                            operator: doormanAddress.address,
                            token_id: 0,
                        },
                    },
                    ])
                    .send()
                await updateOperatorsOperation.confirmation();  
                var stakeAmount         = MVK(10000);
                var stakeOperation      = await doormanInstance.methods.stake(stakeAmount).send();
                await stakeOperation.confirmation();                        
                var registerAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite(
                    "New Satellite by Bob", 
                    "New Satellite Description - Bob", 
                    "https://image.url", 
                    "https://image.url", 
                    "700"
                ).send();
                await registerAsSatelliteOperation.confirmation();
                
                // 2nd Satellite -> Alice
                await signerFactory(alice.sk)
                updateOperatorsOperation = await mvkTokenInstance.methods
                .update_operators([
                {
                    add_operator: {
                        owner: alice.pkh,
                        operator: doormanAddress.address,
                        token_id: 0,
                    },
                },
                ])
                .send()
                await updateOperatorsOperation.confirmation();  
                stakeAmount         = MVK(10);
                stakeOperation      = await doormanInstance.methods.stake(stakeAmount).send();
                await stakeOperation.confirmation();                        
                registerAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite(
                    "New Satellite by Alice", 
                    "New Satellite Description - Alice", 
                    "https://image.url", 
                    "https://image.url", 
                    "700"
                ).send();
                await registerAsSatelliteOperation.confirmation();
                
                // 3rd Satellite -> Eve
                await signerFactory(eve.sk)
                updateOperatorsOperation = await mvkTokenInstance.methods
                .update_operators([
                {
                    add_operator: {
                        owner: eve.pkh,
                        operator: doormanAddress.address,
                        token_id: 0,
                    },
                },
                ])
                .send()
                await updateOperatorsOperation.confirmation();  
                stakeAmount         = MVK(30);
                stakeOperation      = await doormanInstance.methods.stake(stakeAmount).send();
                await stakeOperation.confirmation();                        
                registerAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite(
                    "New Satellite by Eve", 
                    "New Satellite Description - Eve", 
                    "https://image.url", 
                    "https://image.url", 
                    "700"
                ).send();
                await registerAsSatelliteOperation.confirmation();

                // ------------------------------------------------------------------
                // Update 2nd & 3rd Satellites status
                // ------------------------------------------------------------------
                
                await signerFactory(bob.sk)
                var updateStatusOperation  = await delegationInstance.methods.updateSatelliteStatus(alice.pkh, "SUSPENDED").send()
                await updateStatusOperation.confirmation()
                updateStatusOperation  = await delegationInstance.methods.updateSatelliteStatus(eve.pkh, "BANNED").send()
                await updateStatusOperation.confirmation()
            }
        } catch(e) {
            console.dir(e, {depth: 5})
        }
    });

    describe("DELEGATION", async () => {

        describe("%unregisterAsSatellite", async () => {

            it('Suspended satellite should not be able to unregister', async () => {
                try{
    
                    // Initial Values
                    await signerFactory(alice.sk);
                    delegationStorage       = await delegationInstance.storage()
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(alice.pkh)
    
                    // Operation
                    await chai.expect(delegationInstance.methods.unregisterAsSatellite(alice.pkh).send()).to.be.rejected;
    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");
                } catch(e){
                    console.log(e);
                }
            });
    
            it('Banned satellite should not be able to unregister', async () => {
                try{
    
                    // Initial Values
                    await signerFactory(eve.sk);
                    delegationStorage       = await delegationInstance.storage()
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(eve.pkh)
    
                    // Operation
                    await chai.expect(delegationInstance.methods.unregisterAsSatellite(eve.pkh).send()).to.be.rejected;
    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "BANNED");
                } catch(e){
                    console.log(e);
                }
            });

        })

        describe("%updateSatelliteRecord", async () => {

            it('Suspended satellite should be able to update its satellite record', async () => {
                try{
    
                    // Initial Values
                    await signerFactory(alice.sk);
                    delegationStorage       = await delegationInstance.storage()
                    var satelliteRecord     = await delegationStorage.satelliteLedger.get(alice.pkh)
    
                    // Operation
                    const operation         = await delegationInstance.methods.updateSatelliteRecord(
                        "Updated Satellite by Alice",
                        "Updated Satellite Description - Alice",
                        "https://image.url",
                        "https://image.url",
                        "700")
                    .send();
                    await operation.confirmation()

                    // Final values
                    delegationStorage       = await delegationInstance.storage()
                    satelliteRecord     = await delegationStorage.satelliteLedger.get(alice.pkh)
    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");
                    assert.strictEqual(satelliteRecord.name, "Updated Satellite by Alice");
                    assert.strictEqual(satelliteRecord.description, "Updated Satellite Description - Alice");
                } catch(e){
                    console.log(e);
                }
            });
    
            it('Banned satellite should not be able to update its satellite record', async () => {
                try{
    
                    // Initial Values
                    await signerFactory(eve.sk);
                    delegationStorage       = await delegationInstance.storage()
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(eve.pkh)
    
                    // Operation
                    await chai.expect(delegationInstance.methods.updateSatelliteRecord(
                        "Updated Satellite by Eve",
                        "Updated Satellite Description - Eve",
                        "https://image.url",
                        "https://image.url",
                        "700")
                    .send()).to.be.rejected;
    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "BANNED");
                } catch(e){
                    console.log(e);
                }
            });

        })

    });

    describe("GOVERNANCE SATELLITE", async () => {

        describe("%suspendSatellite", async () => {

            it('Suspended satellite should not be able to suspend a satellite', async () => {
                try{
    
                    // Initial Values
                    await signerFactory(alice.sk);
                    delegationStorage       = await delegationInstance.storage()
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(alice.pkh)
    
                    // Operation
                    await chai.expect(governanceSatelliteInstance.methods.suspendSatellite(bob.pkh, "Test purpose").send()).to.be.rejected;
    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");
                } catch(e){
                    console.log(e);
                }
            });
    
            it('Banned satellite should not be able to suspend a satellite', async () => {
                try{
    
                    // Initial Values
                    await signerFactory(eve.sk);
                    delegationStorage       = await delegationInstance.storage()
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(eve.pkh)
    
                    // Operation
                    await chai.expect(governanceSatelliteInstance.methods.suspendSatellite(bob.pkh, "Test purpose").send()).to.be.rejected;
    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "BANNED");
                } catch(e){
                    console.log(e);
                }
            });

        });

        describe("%unsuspendSatellite", async () => {

            it('Suspended satellite should not be able to unsuspend a satellite', async () => {
                try{
    
                    // Initial Values
                    await signerFactory(alice.sk);
                    delegationStorage       = await delegationInstance.storage()
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(alice.pkh)
    
                    // Operation
                    await chai.expect(governanceSatelliteInstance.methods.unsuspendSatellite(alice.pkh, "Test purpose").send()).to.be.rejected;
    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");
                } catch(e){
                    console.log(e);
                }
            });
    
            it('Banned satellite should not be able to unsuspend a satellite', async () => {
                try{
    
                    // Initial Values
                    await signerFactory(eve.sk);
                    delegationStorage       = await delegationInstance.storage()
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(eve.pkh)
    
                    // Operation
                    await chai.expect(governanceSatelliteInstance.methods.unsuspendSatellite(alice.pkh, "Test purpose").send()).to.be.rejected;
    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "BANNED");
                } catch(e){
                    console.log(e);
                }
            });

        })

        describe("%banSatellite", async () => {

            it('Suspended satellite should not be able to ban a satellite', async () => {
                try{
    
                    // Initial Values
                    await signerFactory(alice.sk);
                    delegationStorage       = await delegationInstance.storage()
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(alice.pkh)
    
                    // Operation
                    await chai.expect(governanceSatelliteInstance.methods.banSatellite(bob.pkh, "Test purpose").send()).to.be.rejected;
    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");
                } catch(e){
                    console.log(e);
                }
            });
    
            it('Banned satellite should not be able to ban a satellite', async () => {
                try{
    
                    // Initial Values
                    await signerFactory(eve.sk);
                    delegationStorage       = await delegationInstance.storage()
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(eve.pkh)
    
                    // Operation
                    await chai.expect(governanceSatelliteInstance.methods.banSatellite(bob.pkh, "Test purpose").send()).to.be.rejected;
    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "BANNED");
                } catch(e){
                    console.log(e);
                }
            });

        })

        describe("%unbanSatellite", async () => {

            it('Suspended satellite should not be able to unban a satellite', async () => {
                try{
    
                    // Initial Values
                    await signerFactory(alice.sk);
                    delegationStorage       = await delegationInstance.storage()
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(alice.pkh)
    
                    // Operation
                    await chai.expect(governanceSatelliteInstance.methods.unbanSatellite(eve.pkh, "Test purpose").send()).to.be.rejected;
    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");
                } catch(e){
                    console.log(e);
                }
            });
    
            it('Banned satellite should not be able to unban a satellite', async () => {
                try{
    
                    // Initial Values
                    await signerFactory(eve.sk);
                    delegationStorage       = await delegationInstance.storage()
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(eve.pkh)
    
                    // Operation
                    await chai.expect(governanceSatelliteInstance.methods.unbanSatellite(eve.pkh, "Test purpose").send()).to.be.rejected;
    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "BANNED");
                } catch(e){
                    console.log(e);
                }
            });

        })

        describe("%removeAllSatelliteOracles", async () => {

            it('Suspended satellite should not be able to remove all oracles from a satellite', async () => {
                try{
    
                    // Initial Values
                    await signerFactory(alice.sk);
                    delegationStorage       = await delegationInstance.storage()
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(alice.pkh)
    
                    // Operation
                    await chai.expect(governanceSatelliteInstance.methods.removeAllSatelliteOracles(bob.pkh, "Test purpose").send()).to.be.rejected;
    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");
                } catch(e){
                    console.log(e);
                }
            });
    
            it('Banned satellite should not be able to remove all oracles from a satellite', async () => {
                try{
    
                    // Initial Values
                    await signerFactory(eve.sk);
                    delegationStorage       = await delegationInstance.storage()
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(eve.pkh)
    
                    // Operation
                    await chai.expect(governanceSatelliteInstance.methods.removeAllSatelliteOracles(bob.pkh, "Test purpose").send()).to.be.rejected;
    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "BANNED");
                } catch(e){
                    console.log(e);
                }
            });

        })

        describe("%addOracleToAggregator", async () => {

            it('Suspended satellite should not be able to add an oracle to an aggregator', async () => {
                try{
    
                    // Initial Values
                    await signerFactory(alice.sk);
                    delegationStorage       = await delegationInstance.storage()
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(alice.pkh)
    
                    // Operation
                    await chai.expect(governanceSatelliteInstance.methods.addOracleToAggregator(eve.pkh, aggregatorAddress.address, "Test purpose").send()).to.be.rejected;
    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");
                } catch(e){
                    console.log(e);
                }
            });
    
            it('Banned satellite should not be able to add an oracle to an aggregator', async () => {
                try{
    
                    // Initial Values
                    await signerFactory(eve.sk);
                    delegationStorage       = await delegationInstance.storage()
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(eve.pkh)
    
                    // Operation
                    await chai.expect(governanceSatelliteInstance.methods.addOracleToAggregator(eve.pkh, aggregatorAddress.address, "Test purpose").send()).to.be.rejected;
    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "BANNED");
                } catch(e){
                    console.log(e);
                }
            });

        })

        describe("%removeOracleInAggregator", async () => {

            it('Suspended satellite should not be able to remove an oracle from an aggregator', async () => {
                try{
    
                    // Initial Values
                    await signerFactory(alice.sk);
                    delegationStorage       = await delegationInstance.storage()
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(alice.pkh)
    
                    // Operation
                    await chai.expect(governanceSatelliteInstance.methods.removeOracleInAggregator(bob.pkh, aggregatorAddress.address, "Test purpose").send()).to.be.rejected;
    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");
                } catch(e){
                    console.log(e);
                }
            });
    
            it('Banned satellite should not be able to remove an oracle from an aggregator', async () => {
                try{
    
                    // Initial Values
                    await signerFactory(eve.sk);
                    delegationStorage       = await delegationInstance.storage()
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(eve.pkh)
    
                    // Operation
                    await chai.expect(governanceSatelliteInstance.methods.removeOracleInAggregator(bob.pkh, aggregatorAddress.address, "Test purpose").send()).to.be.rejected;
    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "BANNED");
                } catch(e){
                    console.log(e);
                }
            });

        })

        describe("%setAggregatorMaintainer", async () => {

            it('Suspended satellite should not be able to set an aggregator maintainer', async () => {
                try{
    
                    // Initial Values
                    await signerFactory(alice.sk);
                    delegationStorage       = await delegationInstance.storage()
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(alice.pkh)
    
                    // Operation
                    await chai.expect(governanceSatelliteInstance.methods.setAggregatorMaintainer(aggregatorAddress.address, alice.pkh, "Test purpose").send()).to.be.rejected;
    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");
                } catch(e){
                    console.log(e);
                }
            });
    
            it('Banned satellite should not be able to set an aggregator maintainer', async () => {
                try{
    
                    // Initial Values
                    await signerFactory(eve.sk);
                    delegationStorage       = await delegationInstance.storage()
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(eve.pkh)
    
                    // Operation
                    await chai.expect(governanceSatelliteInstance.methods.setAggregatorMaintainer(aggregatorAddress.address, alice.pkh, "Test purpose").send()).to.be.rejected;
    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "BANNED");
                } catch(e){
                    console.log(e);
                }
            });

        })

        describe("%updateAggregatorStatus", async () => {

            it('Suspended satellite should not be able to update an aggregator status', async () => {
                try{
    
                    // Initial Values
                    await signerFactory(alice.sk);
                    delegationStorage       = await delegationInstance.storage()
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(alice.pkh)
    
                    // Operation
                    await chai.expect(governanceSatelliteInstance.methods.updateAggregatorStatus(aggregatorAddress.address, "INACTIVE", "Test purpose").send()).to.be.rejected;
    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");
                } catch(e){
                    console.log(e);
                }
            });
    
            it('Banned satellite should not be able to update an aggregator status', async () => {
                try{
    
                    // Initial Values
                    await signerFactory(eve.sk);
                    delegationStorage       = await delegationInstance.storage()
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(eve.pkh)
    
                    // Operation
                    await chai.expect(governanceSatelliteInstance.methods.updateAggregatorStatus(aggregatorAddress.address, "INACTIVE", "Test purpose").send()).to.be.rejected;
    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "BANNED");
                } catch(e){
                    console.log(e);
                }
            });

        })

        describe("%dropAction", async () => {

            before("Active satellite creates an action", async () => {
                
                try  {

                    // Initial values
                    await signerFactory(bob.sk);
                    governanceSatelliteStorage  = await governanceSatelliteInstance.storage();
                    console.log("LAMBDAS: ", governanceSatelliteStorage.lambdaLedger)
                    const actionId              = governanceSatelliteStorage.governanceSatelliteCounter.toNumber();
    
                    // Operation
                    const operation             = await governanceSatelliteInstance.methods.setAggregatorMaintainer(aggregatorAddress.address, eve.pkh, "Test purpose").send()
                    await operation.confirmation()
    
                    // Final values
                    governanceSatelliteStorage  = await governanceSatelliteInstance.storage();
                    const action                = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
                    const satelliteSnapshot     = await governanceSatelliteStorage.governanceSatelliteSnapshotLedger.get(actionId);
    
                    console.log("SATELLITE SNAPSHOT: ", satelliteSnapshot)
    
                    // Assertions
                    assert.notStrictEqual(action, undefined);
                    assert.equal(satelliteSnapshot.includes(alice.pkh), false);
                    assert.equal(satelliteSnapshot.includes(eve.pkh), false);
                    assert.equal(satelliteSnapshot.includes(bob.pkh), true);

                } catch (e) {
                    console.dir(e, {depth: 5})
                }

            })

            it('Suspended satellite should not be able to drop an action', async () => {
                try{
    
                    // Initial Values
                    await signerFactory(alice.sk);
                    delegationStorage           = await delegationInstance.storage();
                    governanceSatelliteStorage  = await governanceSatelliteInstance.storage();
                    const actionId              = governanceSatelliteStorage.governanceSatelliteCounter.toNumber() - 1;
                    const satelliteRecord       = await delegationStorage.satelliteLedger.get(alice.pkh)
    
                    // Operation
                    await chai.expect(governanceSatelliteInstance.methods.dropAction(actionId).send()).to.be.rejected;
    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");
                } catch(e){
                    console.log(e);
                }
            });
    
            it('Banned satellite should not be able to drop an action', async () => {
                try{
    
                    // Initial Values
                    await signerFactory(eve.sk);
                    delegationStorage           = await delegationInstance.storage()
                    governanceSatelliteStorage  = await governanceSatelliteInstance.storage();
                    const actionId              = governanceSatelliteStorage.governanceSatelliteCounter.toNumber() - 1;
                    const satelliteRecord       = await delegationStorage.satelliteLedger.get(eve.pkh)
    
                    // Operation
                    await chai.expect(governanceSatelliteInstance.methods.dropAction(actionId).send()).to.be.rejected;
    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "BANNED");
                } catch(e){
                    console.log(e);
                }
            });

        })

        describe("%voteForAction", async () => {

            it('Suspended satellite should not be able to vote for an action', async () => {
                try{
    
                    // Initial Values
                    await signerFactory(alice.sk);
                    delegationStorage           = await delegationInstance.storage();
                    governanceSatelliteStorage  = await governanceSatelliteInstance.storage();
                    const actionId              = governanceSatelliteStorage.governanceSatelliteCounter.toNumber() - 1;
                    const satelliteRecord       = await delegationStorage.satelliteLedger.get(alice.pkh)
    
                    // Operation
                    await chai.expect(governanceSatelliteInstance.methods.voteForAction(actionId, "nay").send()).to.be.rejected;
    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");
                } catch(e){
                    console.log(e);
                }
            });
    
            it('Banned satellite should not be able to vote for an action', async () => {
                try{
    
                    // Initial Values
                    await signerFactory(eve.sk);
                    delegationStorage           = await delegationInstance.storage()
                    governanceSatelliteStorage  = await governanceSatelliteInstance.storage();
                    const actionId              = governanceSatelliteStorage.governanceSatelliteCounter.toNumber() - 1;
                    const satelliteRecord       = await delegationStorage.satelliteLedger.get(eve.pkh)
    
                    // Operation
                    await chai.expect(governanceSatelliteInstance.methods.voteForAction(actionId, "pass").send()).to.be.rejected;
    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "BANNED");
                } catch(e){
                    console.log(e);
                }
            });

        })
    })
});
