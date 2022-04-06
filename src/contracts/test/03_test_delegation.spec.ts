const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
const { InMemorySigner, importKey } = require("@taquito/signer");
import assert, { ok, rejects, strictEqual } from "assert";
import { Utils, zeroAddress, MVK } from "./helpers/Utils";
import fs from "fs";
import { confirmOperation } from "../scripts/confirmation";

const chai = require("chai");
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

import env from "../env";
import { bob, alice, eve, mallory } from "../scripts/sandbox/accounts";

import doormanAddress from '../deployments/doormanAddress.json';
import delegationAddress from '../deployments/delegationAddress.json';
import mvkTokenAddress from '../deployments/mvkTokenAddress.json';
import governanceAddress from '../deployments/governanceAddress.json';

describe("Delegation tests", async () => {
    var utils: Utils;
    var tezos;

    let doormanInstance;
    let delegationInstance;
    let mvkTokenInstance;
    let governanceInstance;

    let doormanStorage;
    let delegationStorage;
    let mvkTokenStorage;
    let governanceStorage;
    
    const signerFactory = async (pk) => {
        await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
        return utils.tezos;
    };

    before("setup", async () => {

        utils = new Utils();
        await utils.init(bob.sk);
        
        doormanInstance    = await utils.tezos.contract.at(doormanAddress.address);
        delegationInstance = await utils.tezos.contract.at(delegationAddress.address);
        mvkTokenInstance   = await utils.tezos.contract.at(mvkTokenAddress.address);
        governanceInstance = await utils.tezos.contract.at(governanceAddress.address);
            
        doormanStorage    = await doormanInstance.storage();
        delegationStorage = await delegationInstance.storage();
        mvkTokenStorage   = await mvkTokenInstance.storage();
        governanceStorage = await governanceInstance.storage();

        console.log('-- -- -- -- -- Delegation Tests -- -- -- --')
        console.log('Doorman Contract deployed at:', doormanInstance.address);
        console.log('Delegation Contract deployed at:', delegationInstance.address);
        console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
        console.log('Governance Contract deployed at:', governanceInstance.address);
        console.log('Bob address: ' + bob.pkh);
        console.log('Alice address: ' + alice.pkh);
        console.log('Eve address: ' + eve.pkh);

        tezos = doormanInstance.tezos;

    });

    describe("%setAdmin", async () => {
        beforeEach("Set signer to admin", async () => {
            await signerFactory(bob.sk)
        });
        it('Admin should be able to call this entrypoint and update the contract administrator with a new address', async () => {
            try{
                // Initial Values
                delegationStorage = await delegationInstance.storage();
                const currentAdmin = delegationStorage.admin;

                // Operation
                const setAdminOperation = await delegationInstance.methods.setAdmin(alice.pkh).send();
                await setAdminOperation.confirmation();

                // Final values
                delegationStorage = await delegationInstance.storage();
                const newAdmin = delegationStorage.admin;

                // reset admin
                await signerFactory(alice.sk);
                const resetAdminOperation = await delegationInstance.methods.setAdmin(bob.pkh).send();
                await resetAdminOperation.confirmation();

                // Assertions
                assert.notStrictEqual(newAdmin, currentAdmin);
                assert.strictEqual(newAdmin, alice.pkh);
                assert.strictEqual(currentAdmin, bob.pkh);
            } catch(e){
                console.log(e);
            }
        });
        it('Non-admin should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                await signerFactory(alice.sk);
                delegationStorage = await delegationInstance.storage();
                const currentAdmin = delegationStorage.admin;

                // Operation
                await chai.expect(delegationInstance.methods.setAdmin(alice.pkh).send()).to.be.rejected;

                // Final values
                delegationStorage = await delegationInstance.storage();
                const newAdmin = delegationStorage.admin;

                // Assertions
                assert.strictEqual(newAdmin, currentAdmin);
            } catch(e){
                console.log(e);
            }
        });
    });

    describe("%updateConfig", async () => {
        beforeEach("Set signer to admin", async () => {
            await signerFactory(bob.sk)
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
                console.log(e);
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
                console.log(e);
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
                console.log(e);
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
                console.log(e);
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
                console.log(e);
            }
        });
        it('Non-admin should not be able to call the entrypoint', async () => {
            try{
                // Initial Values
                delegationStorage = await delegationInstance.storage();
                const currentConfigValue = delegationStorage.config.minimumStakedMvkBalance;
                const newConfigValue = MVK(10);

                // Operation
                await signerFactory(alice.sk)
                await chai.expect(delegationInstance.methods.updateConfig(newConfigValue,"configMinimumStakedMvkBalance").send()).to.be.rejected;

                // Final values
                delegationStorage = await delegationInstance.storage();
                const updateConfigValue = delegationStorage.config.minimumStakedMvkBalance;

                // Assertions
                assert.equal(updateConfigValue.toNumber(), currentConfigValue.toNumber());
            } catch(e){
                console.log(e);
            }
        });
    });

    describe("%registerAsSatellite", async () => {
        beforeEach("Set signer to user", async () => {
            await signerFactory(eve.sk)
        });

        it('User should be able to call this entrypoint', async () => {
            try{
                // init values
                const userStake               = MVK(100);
                const doormanContractAddress  = doormanAddress.address;
                const satelliteName           = "New Satellite (Eve)";
                const satelliteDescription    = "New Satellite Description (Eve)";
                const satelliteImage          = "https://placeholder.com/300";
                const satelliteFee            = "700";

                // Bob assigns doorman contract as an operator
                const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
                {
                    add_operator: {
                        owner    : eve.pkh,
                        operator : doormanContractAddress,
                        token_id : 0,
                    },
                }])
                .send()
                await updateOperatorsOperation.confirmation();

                // Bob stake 100 MVK tokens
                const stakeAmountOperation = await doormanInstance.methods.stake(userStake).send();
                await stakeAmountOperation.confirmation();

                // Check state before registering as satellite
                const beforeDelegationLedgerBob  = await delegationStorage.satelliteLedger.get(eve.pkh);        // should return null or undefined
                const beforeBobStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);    // 100 MVK
                assert.equal(beforeDelegationLedgerBob,       null);
                assert.equal(beforeBobStakedBalance.balance,  userStake);

                // Bob registers as a satellite
                const registerAsSatelliteOperation = await delegationInstance.methods
                    .registerAsSatellite(
                        satelliteName, 
                        satelliteDescription, 
                        satelliteImage, 
                        satelliteFee
                    ).send();
                await registerAsSatelliteOperation.confirmation();

                // Check state after registering as satellite
                delegationStorage               = await delegationInstance.storage();
                const afterDelegationLedgerBob  = await delegationStorage.satelliteLedger.get(eve.pkh);         // should return bob's satellite record
                const afterBobStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);     // 100 MVK
                
                // Bob's satellite details
                assert.equal(afterDelegationLedgerBob.name,                   satelliteName);
                assert.equal(afterDelegationLedgerBob.description,            satelliteDescription);
                assert.equal(afterDelegationLedgerBob.stakedMvkBalance,       userStake);
                assert.equal(afterDelegationLedgerBob.satelliteFee,           satelliteFee);
                assert.equal(afterDelegationLedgerBob.totalDelegatedAmount,   0);
                assert.equal(afterDelegationLedgerBob.status,                 1);

                // Bob's staked balance remains the same
                assert.equal(afterBobStakedBalance.balance, userStake);
            } catch(e){
                console.log(e);
            }
        });

        it('User should not be able to call this entrypoint if it is pause', async () => {
            try{
                // Initial Values
                await signerFactory(bob.sk)
                delegationStorage       = await delegationInstance.storage();
                const isPausedStart     = delegationStorage.breakGlassConfig.registerAsSatelliteIsPaused
                const satelliteName           = "New Satellite (Eve)";
                const satelliteDescription    = "New Satellite Description (Eve)";
                const satelliteImage          = "https://placeholder.com/300";
                const satelliteFee            = "700";

                // Operation
                var togglePauseOperation = await delegationInstance.methods.togglePauseRegisterSatellite().send();
                await togglePauseOperation.confirmation();

                // Final values
                delegationStorage       = await delegationInstance.storage();
                const isPausedEnd       = delegationStorage.breakGlassConfig.registerAsSatelliteIsPaused

                await chai.expect(delegationInstance.methods
                    .registerAsSatellite(
                        satelliteName, 
                        satelliteDescription, 
                        satelliteImage, 
                        satelliteFee
                    ).send()
                ).to.be.rejected;

                // Reset admin
                var togglePauseOperation = await delegationInstance.methods.togglePauseRegisterSatellite().send();
                await togglePauseOperation.confirmation();

                // Assertions
                assert.equal(isPausedStart, false);
                assert.equal(isPausedEnd, true);
            } catch(e){
                console.log(e);
            }
        });

        it('User should not be able to call this entrypoint if the doorman contract is not referenced in the generalContracts map', async () => {
            try{
                // Update generalContracts
                await signerFactory(bob.sk)
                var updateOperation = await delegationInstance.methods.updateGeneralContracts("doorman", doormanAddress.address).send()
                await updateOperation.confirmation();

                // init values
                const userStake               = MVK(100);
                const doormanContractAddress  = doormanAddress.address;
                const satelliteName           = "New Satellite (Eve)";
                const satelliteDescription    = "New Satellite Description (Eve)";
                const satelliteImage          = "https://placeholder.com/300";
                const satelliteFee            = "700";

                // Bob assigns doorman contract as an operator
                const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
                {
                    add_operator: {
                        owner    : bob.pkh,
                        operator : doormanContractAddress,
                        token_id : 0,
                    },
                }])
                .send()
                await updateOperatorsOperation.confirmation();

                // Bob stake 100 MVK tokens
                const stakeAmountOperation = await doormanInstance.methods.stake(userStake).send();
                await stakeAmountOperation.confirmation();

                // registers as a satellite
                await chai.expect(delegationInstance.methods
                    .registerAsSatellite(
                        satelliteName, 
                        satelliteDescription, 
                        satelliteImage, 
                        satelliteFee
                    ).send()
                ).to.be.rejected;

                // Reset generalContracts
                updateOperation = await delegationInstance.methods.updateGeneralContracts("doorman", doormanAddress.address).send()
                await updateOperation.confirmation();
            } catch(e){
                console.log(e);
            }
        });

        it('User should not be able to call this entrypoint if the satellite already exists', async () => {
            try{
                // init values
                const userStake               = MVK(100);
                const doormanContractAddress  = doormanAddress.address;
                const satelliteName           = "New Satellite (Eve)";
                const satelliteDescription    = "New Satellite Description (Eve)";
                const satelliteImage          = "https://placeholder.com/300";
                const satelliteFee            = "700";

                // Bob assigns doorman contract as an operator
                const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
                {
                    add_operator: {
                        owner    : eve.pkh,
                        operator : doormanContractAddress,
                        token_id : 0,
                    },
                }])
                .send()
                await updateOperatorsOperation.confirmation();

                // Bob stake 100 MVK tokens
                const stakeAmountOperation = await doormanInstance.methods.stake(userStake).send();
                await stakeAmountOperation.confirmation();

                // User registers as a satellite again
                await chai.expect(delegationInstance.methods
                    .registerAsSatellite(
                        satelliteName, 
                        satelliteDescription, 
                        satelliteImage, 
                        satelliteFee
                    ).send()
                ).to.be.rejected;
            } catch(e){
                console.log(e);
            }
        });

        it('User should not be able to call this entrypoint if it doesn’t have the minimum SMVK requirement', async () => {
            try{
                // Operation
                await signerFactory(bob.sk)
                var updateConfigOperation = await delegationInstance.methods.updateConfig(MVK(130),"configMinimumStakedMvkBalance").send();
                await updateConfigOperation.confirmation();

                // init values
                const userStake               = MVK(100);
                const doormanContractAddress  = doormanAddress.address;
                const satelliteName           = "New Satellite (Eve)";
                const satelliteDescription    = "New Satellite Description (Eve)";
                const satelliteImage          = "https://placeholder.com/300";
                const satelliteFee            = "700";

                // Bob assigns doorman contract as an operator
                const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
                {
                    add_operator: {
                        owner    : bob.pkh,
                        operator : doormanContractAddress,
                        token_id : 0,
                    },
                }])
                .send()
                await updateOperatorsOperation.confirmation();

                // Bob stake 100 MVK tokens
                const stakeAmountOperation = await doormanInstance.methods.stake(userStake).send();
                await stakeAmountOperation.confirmation();

                // User registers as a satellite again
                await chai.expect(delegationInstance.methods
                    .registerAsSatellite(
                        satelliteName, 
                        satelliteDescription, 
                        satelliteImage, 
                        satelliteFee
                    ).send()
                ).to.be.rejected;

                // Reset 
                updateConfigOperation = await delegationInstance.methods.updateConfig(MVK(0.5),"configMinimumStakedMvkBalance").send();
                await updateConfigOperation.confirmation();
            } catch(e){
                console.log(e);
            }
        });
    });

    describe("%unregisterAsSatellite", async () => {
        before("Set new satellite as Alice", async () => {
            // init values
            await signerFactory(alice.sk)
            const userStake               = MVK(100);
            const doormanContractAddress  = doormanAddress.address;
            const satelliteName           = "New Satellite (Alice)";
            const satelliteDescription    = "New Satellite Description (Alice)";
            const satelliteImage          = "https://placeholder.com/300";
            const satelliteFee            = "700";

            // Alice assigns doorman contract as an operator
            const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
            {
                add_operator: {
                    owner    : alice.pkh,
                    operator : doormanContractAddress,
                    token_id : 0,
                },
            }])
            .send()
            await updateOperatorsOperation.confirmation();

            // Alice stake 100 MVK tokens
            const stakeAmountOperation = await doormanInstance.methods.stake(userStake).send();
            await stakeAmountOperation.confirmation();
            // Alice registers as a satellite
            const registerAsSatelliteOperation = await delegationInstance.methods
                .registerAsSatellite(
                    satelliteName, 
                    satelliteDescription, 
                    satelliteImage, 
                    satelliteFee
                ).send();
            await registerAsSatelliteOperation.confirmation();
        })

        beforeEach("Set signer to satellite", async () => {
            await signerFactory(alice.sk)
        });

        it('Satellite should be able to call this entrypoint and unregister', async () => {
            try{
                // Unregisters as a satellite
                const unregisterAsSatelliteOperation = await delegationInstance.methods.unregisterAsSatellite().send();
                await unregisterAsSatelliteOperation.confirmation();

                // Check state after unregistering as satellite
                const satelliteExists  = await delegationStorage.satelliteLedger.get(alice.pkh); // should return null or undefined
                assert.equal(satelliteExists,       null);
            } catch(e){
                console.log(e);
            } 

        });

        it('Non-satellite should not be able to call this entrypoint', async () => {
            try{
                // Unregisters as a satellite
                await signerFactory(mallory.sk);
                await chai.expect(delegationInstance.methods.unregisterAsSatellite().send()).to.be.rejected;
            } catch(e){
                console.log(e);
            } 
        });

        it('Satellite should not be able to call this entrypoint if the entrypoint is pause', async () => {
            try{
                // Initial Values
                delegationStorage       = await delegationInstance.storage();
                const isPausedStart     = delegationStorage.breakGlassConfig.unregisterAsSatelliteIsPaused

                // Operation
                await signerFactory(bob.sk)
                var togglePauseOperation = await delegationInstance.methods.togglePauseUnregisterSatellite().send();
                await togglePauseOperation.confirmation();

                // Final values
                delegationStorage       = await delegationInstance.storage();
                const isPausedEnd       = delegationStorage.breakGlassConfig.unregisterAsSatelliteIsPaused

                await signerFactory(alice.sk)
                await chai.expect(delegationInstance.methods
                    .unregisterAsSatellite().send()
                ).to.be.rejected;

                // Reset admin
                await signerFactory(bob.sk)
                var togglePauseOperation = await delegationInstance.methods.togglePauseUnregisterSatellite().send();
                await togglePauseOperation.confirmation();

                // Assertions
                assert.equal(isPausedStart, false);
                assert.equal(isPausedEnd, true);
            } catch(e){
                console.log(e);
            } 
        });
    })

    describe("%togglePauseDelegateToSatellite", async () => {
        beforeEach("Set signer to admin", async () => {
            await signerFactory(bob.sk)
        });
        it('Admin should be able to call the entrypoint and pause or unpause the delegateToSatellite entrypoint', async () => {
            try{
                // Initial Values
                delegationStorage       = await delegationInstance.storage();
                const isPausedStart     = delegationStorage.breakGlassConfig.delegateToSatelliteIsPaused

                // Operation
                var togglePauseOperation = await delegationInstance.methods.togglePauseDelegateToSatellite().send();
                await togglePauseOperation.confirmation();

                // Final values
                delegationStorage       = await delegationInstance.storage();
                const isPausedEnd       = delegationStorage.breakGlassConfig.delegateToSatelliteIsPaused

                await chai.expect(delegationInstance.methods.delegateToSatellite(eve.pkh).send()).to.be.rejected;

                // Reset admin
                var togglePauseOperation = await delegationInstance.methods.togglePauseDelegateToSatellite().send();
                await togglePauseOperation.confirmation();

                // Assertions
                assert.equal(isPausedStart, false);
                assert.equal(isPausedEnd, true);
            } catch(e){
                console.log(e);
            }
        });

        it('Non-admin should not be able to call the entrypoint', async () => {
            try{
                await signerFactory(alice.sk);
                await chai.expect(delegationInstance.methods.togglePauseDelegateToSatellite().send()).to.be.rejected;
            } catch(e){
                console.log(e);
            }
        });
    })

    describe("%togglePauseUndelegateSatellite", async () => {
        beforeEach("Set signer to admin", async () => {
            await signerFactory(bob.sk)
        });
        it('Admin should be able to call the entrypoint and pause or unpause the delegateToSatellite entrypoint', async () => {
            try{
                // Initial Values
                delegationStorage       = await delegationInstance.storage();
                const isPausedStart     = delegationStorage.breakGlassConfig.undelegateFromSatelliteIsPaused

                // Operation
                var togglePauseOperation = await delegationInstance.methods.togglePauseUndelegateSatellite().send();
                await togglePauseOperation.confirmation();

                // Final values
                delegationStorage       = await delegationInstance.storage();
                const isPausedEnd       = delegationStorage.breakGlassConfig.undelegateFromSatelliteIsPaused

                await chai.expect(delegationInstance.methods.undelegateFromSatellite().send()).to.be.rejected;

                // Reset admin
                var togglePauseOperation = await delegationInstance.methods.togglePauseUndelegateSatellite().send();
                await togglePauseOperation.confirmation();

                // Assertions
                assert.equal(isPausedStart, false);
                assert.equal(isPausedEnd, true);
            } catch(e){
                console.log(e);
            }
        });
        it('Non-admin should not be able to call the entrypoint', async () => {
            try{
                await signerFactory(alice.sk);
                await chai.expect(delegationInstance.methods.togglePauseUndelegateSatellite().send()).to.be.rejected;
            } catch(e){
                console.log(e);
            }
        });
    })

    describe("%togglePauseRegisterSatellite", async () => {
        beforeEach("Set signer to admin", async () => {
            await signerFactory(bob.sk)
        });
        it('Admin should be able to call the entrypoint and pause or unpause the registerSatellite entrypoint', async () => {
            try{
                // Initial Values
                delegationStorage       = await delegationInstance.storage();
                const isPausedStart     = delegationStorage.breakGlassConfig.registerAsSatelliteIsPaused
                const satelliteName           = "New Satellite (Eve)";
                const satelliteDescription    = "New Satellite Description (Eve)";
                const satelliteImage          = "https://placeholder.com/300";
                const satelliteFee            = "700";

                // Operation
                var togglePauseOperation = await delegationInstance.methods.togglePauseRegisterSatellite().send();
                await togglePauseOperation.confirmation();

                // Final values
                delegationStorage       = await delegationInstance.storage();
                const isPausedEnd       = delegationStorage.breakGlassConfig.registerAsSatelliteIsPaused

                await chai.expect(delegationInstance.methods
                    .registerAsSatellite(
                        satelliteName, 
                        satelliteDescription, 
                        satelliteImage, 
                        satelliteFee
                    ).send()
                ).to.be.rejected;

                // Reset admin
                var togglePauseOperation = await delegationInstance.methods.togglePauseRegisterSatellite().send();
                await togglePauseOperation.confirmation();

                // Assertions
                assert.equal(isPausedStart, false);
                assert.equal(isPausedEnd, true);
            } catch(e){
                console.log(e);
            }
        });
        it('Non-admin should not be able to call the entrypoint', async () => {
            try{
                await signerFactory(alice.sk);
                await chai.expect(delegationInstance.methods.togglePauseRegisterSatellite().send()).to.be.rejected;
            } catch(e){
                console.log(e);
            }
        });
    })

    describe("%togglePauseUnregisterSatellite", async () => {
        beforeEach("Set signer to admin", async () => {
            await signerFactory(bob.sk)
        });
        it('Admin should be able to call the entrypoint and pause or unpause the registerSatellite entrypoint', async () => {
            try{
                // Initial Values
                delegationStorage       = await delegationInstance.storage();
                const isPausedStart     = delegationStorage.breakGlassConfig.unregisterAsSatelliteIsPaused

                // Operation
                var togglePauseOperation = await delegationInstance.methods.togglePauseUnregisterSatellite().send();
                await togglePauseOperation.confirmation();

                // Final values
                delegationStorage       = await delegationInstance.storage();
                const isPausedEnd       = delegationStorage.breakGlassConfig.unregisterAsSatelliteIsPaused

                await chai.expect(delegationInstance.methods
                    .unregisterAsSatellite().send()
                ).to.be.rejected;

                // Reset admin
                var togglePauseOperation = await delegationInstance.methods.togglePauseUnregisterSatellite().send();
                await togglePauseOperation.confirmation();

                // Assertions
                assert.equal(isPausedStart, false);
                assert.equal(isPausedEnd, true);
            } catch(e){
                console.log(e);
            }
        });
        it('Non-admin should not be able to call the entrypoint', async () => {
            try{
                await signerFactory(alice.sk);
                await chai.expect(delegationInstance.methods.togglePauseUnregisterSatellite().send()).to.be.rejected;
            } catch(e){
                console.log(e);
            }
        });
    })

    // it('bob cannot register twice as a satellite', async () => {
    //     try{        
            
    //         console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
    //         console.log("Test: Bob cannot register twice as a satellite") 
    //         console.log("---") // break

    //         const failRegisterAsSatelliteTwiceOperation = await delegationInstance.methods.registerAsSatellite("New Satellite", "New Satellite Description", "https://image.url", "700");    
    //         await chai.expect(failRegisterAsSatelliteTwiceOperation.send()).to.be.eventually.rejected;

    //     } catch(e){
    //         console.log(e);
    //     } 
    // });

    // it(`bob stakes another 100 MVK tokens and increases her satellite bond`, async () => {
    //     try{

    //         console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
    //         console.log("Test: Bob stakes another 100 MVK tokens and increases her satellite bond:") 
    //         console.log("---") // break

    //         // init values
    //         const userStake               = MVK(100);
    //         const newUserStakedBalance    = MVK(200);

    //         // Check state before stake action
    //         const beforeDelegationLedgerBob  = await delegationStorage.satelliteLedger.get(bob.pkh);        // should return null or undefined
    //         const beforeBobStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);    // BigNumber { s: 1, e: 8, c: [ 100000000 ] }
    //         assert.equal(beforeDelegationLedgerBob.stakedMvkBalance, userStake);
    //         assert.equal(beforeBobStakedBalance.balance,             userStake);
             
    //         // bob stake another 100 MVK tokens 
    //         const stakeAmountOperation = await doormanInstance.methods.stake(userStake).send();
    //         await stakeAmountOperation.confirmation();
            
    //         // Check state after stake action
    //         const afterDelegationLedgerBob  = await delegationStorage.satelliteLedger.get(bob.pkh);         // should return bob's satellite record
    //         const afterBobStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);     // should return BigNumber { s: 1, e: 8, c: [ 100000000 ] }
    //         assert.equal(afterDelegationLedgerBob.stakedMvkBalance, newUserStakedBalance);
    //         assert.equal(afterBobStakedBalance.balance,             newUserStakedBalance);
        
    //     } catch(e){
    //         console.log(e);
    //     }
    // });

    // it(`bob unstakes 100 MVK tokens and decreases her satellite bond`, async () => {
    //     try{

    //         console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
    //         console.log("Test: Bob unstakes 100 MVK tokens and decreases her satellite bond:") 
    //         console.log("---") // break

    //         // init values
    //         const userUnstake             = MVK(100);
    //         const oldUserStakedBalance    = MVK(200);

    //         // Check state before unstake action
    //         const beforeDelegationLedgerBob  = await delegationStorage.satelliteLedger.get(bob.pkh);        // should return null or undefined
    //         const beforeBobStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);    // BigNumber { s: 1, e: 8, c: [ 100000000 ] }
    //         assert.equal(beforeDelegationLedgerBob.stakedMvkBalance, oldUserStakedBalance);
    //         assert.equal(beforeBobStakedBalance.balance,             oldUserStakedBalance);
            
    //         // bob unstakes 100 MVK tokens 
    //         const unstakeAmountOperation = await doormanInstance.methods.unstake(userUnstake).send();
    //         await unstakeAmountOperation.confirmation();
            
    //         // Check state after unstake action
    //         const afterDelegationLedgerBob  = await delegationStorage.satelliteLedger.get(bob.pkh);         // should return bob's satellite record
    //         const afterBobStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);     // should return BigNumber { s: 1, e: 8, c: [ 100000000 ] }
    //         assert.notEqual(afterDelegationLedgerBob.stakedMvkBalance, oldUserStakedBalance);
    //         assert.notEqual(afterBobStakedBalance.balance,             oldUserStakedBalance);

    //     } catch(e){
    //         console.log(e);
    //     }
    // });

    // it('alice and eve can delegate to bob satellite', async () => {
    //     try{        

    //         console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
    //         console.log("Test: Alice and Eve can delegate to Bob's satellite") 
    //         console.log("---") // break

    //         // init values
    //         const userStake                 = MVK(100);
    //         const doormanContractAddress    = doormanAddress.address;
    //         const finalTotalDelegatedAmount = userStake + userStake;

    //         // Alice assigns doorman contract as an operator, and stakes 100 MVK
    //         await signerFactory(alice.sk);
    //         const aliceUpdateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
    //             {
    //                 add_operator: {
    //                     owner    : alice.pkh,
    //                     operator : doormanContractAddress,
    //                     token_id : 0,
    //                 },
    //             }])
    //             .send()
    //         await aliceUpdateOperatorsOperation.confirmation();
    //         const aliceStakeAmountOperation = await doormanInstance.methods.stake(userStake).send();
    //         await aliceStakeAmountOperation.confirmation();

    //         // Eve assigns doorman contract as an operator, and stakes 100 MVK
    //         await signerFactory(eve.sk);
    //         const eveUpdateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
    //             {
    //                 add_operator: {
    //                     owner    : eve.pkh,
    //                     operator : doormanContractAddress,
    //                     token_id : 0,
    //                 },
    //             }])
    //             .send()
    //         await eveUpdateOperatorsOperation.confirmation();
    //         const eveStakeAmountOperation = await doormanInstance.methods.stake(userStake).send();
    //         await eveStakeAmountOperation.confirmation();

    //         // Check that alice and eve has new staked balance of 100 MVK
    //         const aliceStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);    // 100 MVK
    //         const eveStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);    // 100 MVk
    //         assert.equal(aliceStakedBalance.balance,  userStake);
    //         assert.equal(eveStakedBalance.balance,  userStake);

    //         // Alice delegates to Bob's Satellite
    //         await signerFactory(alice.sk);
    //         const aliceDelegatesToBobSatelliteOperation = await delegationInstance.methods.delegateToSatellite(bob.pkh).send();
    //         await aliceDelegatesToBobSatelliteOperation.confirmation();

    //         // Eve delegates to Bob's Satellite
    //         await signerFactory(eve.sk);
    //         const eveDelegatesToBobSatelliteOperation = await delegationInstance.methods.delegateToSatellite(bob.pkh).send();
    //         await eveDelegatesToBobSatelliteOperation.confirmation();
            
    //         // Check that total Delegated Amount is equal to Alice's and Eve's combined staked balance
    //         const bobSatellite  = await delegationStorage.satelliteLedger.get(bob.pkh); 
    //         assert.equal(bobSatellite.totalDelegatedAmount, finalTotalDelegatedAmount);
        
    //     } catch(e){
    //         console.log(e);
    //     } 
    // });

    // it('alice redelegates from bob to mallory satellite', async () => {
    //     try{        

    //         console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
    //         console.log("Test: Alice redelegates from Bob's to Mallory's Satellite") 
    //         console.log("---") // break

    //         // init values
    //         const userStake               = MVK(100);
    //         const doormanContractAddress  = doormanAddress.address;
    //         const satelliteName           = "Mallory's Satellite";
    //         const satelliteDescription    = "Mallory's Satellite Description";
    //         const satelliteImage          = "https://placeholder.com/300";
    //         const satelliteFee            = "700";

    //         // Mallory assigns doorman contract as an operator
    //         await signerFactory(mallory.sk);
    //         const updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
    //         {
    //             add_operator: {
    //                 owner    : mallory.pkh,
    //                 operator : doormanContractAddress,
    //                 token_id : 0,
    //             },
    //         }])
    //         .send()
    //         await updateOperatorsOperation.confirmation();

    //         // Mallory stake 100 MVK tokens
    //         const stakeAmountOperation = await doormanInstance.methods.stake(userStake).send();
    //         await stakeAmountOperation.confirmation();

    //         // Check state before registering as satellite
    //         const mallorySatelliteExists   = await delegationStorage.satelliteLedger.get(mallory.pkh);        // should return null or undefined
    //         const malloryStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(mallory.pkh);    // 100 MVK
    //         assert.equal(mallorySatelliteExists,         null);
    //         assert.equal(malloryStakedBalance.balance,  userStake);

    //         // Mallory registers as a satellite
    //         const registerAsSatelliteOperation = await delegationInstance.methods
    //             .registerAsSatellite(
    //                 satelliteName, 
    //                 satelliteDescription, 
    //                 satelliteImage, 
    //                 satelliteFee
    //             ).send();
    //         await registerAsSatelliteOperation.confirmation();

    //         // Check state after registering as satellite
    //         const mallorySatellite         = await delegationStorage.satelliteLedger.get(mallory.pkh);         

    //         // Mallory's satellite details
    //         assert.equal(mallorySatellite.name,                   satelliteName);
    //         assert.equal(mallorySatellite.description,            satelliteDescription);
    //         assert.equal(mallorySatellite.stakedMvkBalance,       userStake);
    //         assert.equal(mallorySatellite.satelliteFee,           satelliteFee);
    //         assert.equal(mallorySatellite.totalDelegatedAmount,   0);
    //         assert.equal(mallorySatellite.status,                 1);

    //         // Alice redelegates from Bob to Mallory's Satellite
    //         await signerFactory(alice.sk);        
    //         const aliceDelegatesToMallorySatelliteOperation = await delegationInstance.methods.delegateToSatellite(mallory.pkh).send();
    //         await aliceDelegatesToMallorySatelliteOperation.confirmation();
            
    //         // Check details of satellite
    //         const bobSatellite         = await delegationStorage.satelliteLedger.get(bob.pkh);         
    //         assert.equal(bobSatellite.totalDelegatedAmount, userStake); // from eve's staked balance in previous test

    //         // Check state after registering as satellite
    //         const updatedMallorySatellite     = await delegationStorage.satelliteLedger.get(mallory.pkh);         
    //         assert.equal(updatedMallorySatellite.totalDelegatedAmount, userStake); // from alice's delegation

    //     } catch(e){
    //         console.log(e);
    //     } 
    // });

    // it('bob cannot delegate to another satellite as a satellite', async () => {
    //     try{        

    //         console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
    //         console.log("Test: Bob cannot delegate to another satellite as a satellite") 
    //         console.log("---") // break

    //         // Bob tries to delegate to mallory's satellite
    //         await signerFactory(bob.sk); 
    //         const failDelegateToSatelliteAsSatelliteOperation = await delegationInstance.methods.delegateToSatellite(mallory.pkh);    
    //         await chai.expect(failDelegateToSatelliteAsSatelliteOperation.send()).to.be.eventually.rejected;
            
    //         // Check state for mallory satellite remains unchanged
    //         const mallorySatellite     = await delegationStorage.satelliteLedger.get(mallory.pkh);         
    //         assert.equal(mallorySatellite.totalDelegatedAmount, MVK(100)); // from alice's delegation in previous test
        
    //     } catch(e){
    //         console.log(e);
    //     } 
    // });


    // it('eve can undelegate from bob satellite', async () => {
    //     try{        

    //         console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
    //         console.log("Test: Eve can undelegate from bob's satellite") 
    //         console.log("---") // break

    //         // init values
    //         const userStake = MVK(100);

    //         // Eve undelegates from Bob's satellite
    //         await signerFactory(eve.sk);               
    //         const eveUndelegatesFromBobSatelliteOperation = await delegationInstance.methods.undelegateFromSatellite(bob.pkh).send();
    //         await eveUndelegatesFromBobSatelliteOperation.confirmation();
            
    //         // Check details of satellite
    //         const bobSatellite         = await delegationStorage.satelliteLedger.get(bob.pkh);         
    //         assert.equal(bobSatellite.totalDelegatedAmount, 0)
            
    //         // Check Eve's staked balance remains unchanged
    //         const eveStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);    // 100 MVk; 
    //         assert.equal(eveStakedBalance.balance, userStake);

    //     } catch(e){
    //         console.log(e);
    //     } 
    // });

    // it('bob cannot unregister twice as a satellite', async () => {
    //     try{        
            
    //         console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
    //         console.log("Test: Bob cannot unregister twice as a satellite") 
    //         console.log("---") // break

    //         // Bob unregisters as a satellite again
    //         await signerFactory(bob.sk); 
    //         const failUnregisterAsSatelliteTwiceOperation = await delegationInstance.methods.unregisterAsSatellite();    
    //         await chai.expect(failUnregisterAsSatelliteTwiceOperation.send()).to.be.eventually.rejected;

    //     } catch(e){
    //         console.log(e);
    //     } 
    // });


    // it('mallory can unregister as a satellite (one delegate - alice)', async () => {
    //     try{        

    //         console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
    //         console.log("Test: Mallory can unregister as a satellite (one delegate - Alice)") 
    //         console.log("---") // break

    //         // init values
    //         const userStake = MVK(100);

    //         // Mallory unregisters as a satellite
    //         await signerFactory(mallory.sk); 
    //         const unregisterAsSatelliteOperation = await delegationInstance.methods.unregisterAsSatellite().send();
    //         await unregisterAsSatelliteOperation.confirmation();

    //         // Check state after unregistering as satellite
    //         const mallorySatelliteExists  = await delegationStorage.satelliteLedger.get(mallory.pkh); // should return null or undefined
    //         assert.equal(mallorySatelliteExists,       null);

    //     } catch(e){
    //         console.log(e);
    //     } 

    // });


    // it('alice can undelegate from mallory satellite (after it has been unregistered)', async () => {
    //     try{        

    //         console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
    //         console.log("Test: Alice can undelegate from mallory's satellite (after it has been unregistered)") 
    //         console.log("---") // break

    //         // init values
    //         const userStake = MVK(100);

    //         // Alice undelegates from Mallory's satellite
    //         await signerFactory(alice.sk);               
    //         const aliceUndelegatesFromMallorySatelliteOperation = await delegationInstance.methods.undelegateFromSatellite(mallory.pkh).send();
    //         await aliceUndelegatesFromMallorySatelliteOperation.confirmation();
            
    //         // Satellite should not exist after it has been unregistered
    //         const mallorySatelliteExists  = await delegationStorage.satelliteLedger.get(mallory.pkh); // should return null or undefined
    //         assert.equal(mallorySatelliteExists, null);
            
    //         // Check Alice's staked balance remains unchanged
    //         const aliceStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);    // 100 MVk; 
    //         assert.equal(aliceStakedBalance.balance, userStake);

    //     } catch(e){
    //         console.log(e);
    //     } 
    // });


    // it(`bob cannot unstake more than the minimum satellite bond requirement (e.g. 100 MVK)`, async () => {
    //     try{

    //         console.log("-- -- -- -- -- -- -- -- -- -- -- -- --") // break
    //         console.log("Test: Bob  cannot unstake more than the minimum satellite bond requirement (e.g. 100 MVK):") 
    //         console.log("---") // break

    //         // console.log('Storage test: console log checks  ----');
    //         // console.log(delegationStorage);
    //         // console.log(doormanStorage);
    //         // console.log("Minimum Staked Balance: " + delegationStorage.config.minimumStakedMvkBalance);

    //         const beforeDelegationLedgerBob  = await delegationStorage.satelliteLedger.get(bob.pkh);        // should return null or undefined
    //         const beforeBobStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);    // BigNumber { s: 1, e: 8, c: [ 100000000 ] }
    //         assert.equal(beforeDelegationLedgerBob.stakedMvkBalance, 100000000);
    //         assert.equal(beforeBobStakedBalance, 100000000);
            
    //         // console.log("Before test: console log checks ----")
    //         // console.log(beforeDelegationLedgerBob);
    //         // console.log(beforeBobStakedBalance);
             
    //         // bob unstakes another 50 MVK tokens - 50,000,000 in muMVK
    //         const failUnstakeOperation = await  doormanInstance.methods.unstake(50000000);
    //         await chai.expect(failUnstakeOperation.send()).to.be.eventually.rejected;

    //         const afterDelegationLedgerBob  = await delegationStorage.satelliteLedger.get(bob.pkh);         // should return bob's satellite record
    //         const afterBobStakedBalance     = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);     // should return BigNumber { s: 1, e: 8, c: [ 100000000 ] }
    //         assert.equal(afterDelegationLedgerBob.stakedMvkBalance, 100000000);
    //         assert.equal(afterBobStakedBalance, 100000000);
        
    //         // console.log("After test: console log checks  ----")
    //         // console.log(afterDelegationLedgerBob);
    //         // console.log(afterBobStakedBalance);

    //     } catch(e){
    //         console.log(e);
    //     }
    // });
    

});