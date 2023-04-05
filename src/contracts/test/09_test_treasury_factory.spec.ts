import assert from "assert";
import { Utils } from "./helpers/Utils";
import { treasuryStorageType } from "../storage/storageTypes/treasuryStorageType";

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

import { bob, alice, eve, baker } from "../scripts/sandbox/accounts";
import * as helperFunctions from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("Treasury Factory tests", async () => {
    
    var utils: Utils;
    let tezos

    let treasuryAddress 
    let treasuryFactoryAddress 
    let governanceAddress 
    let mvkTokenAddress 
    let mavrykFa12TokenAddress
    let mavrykFa2TokenAddress

    let treasuryInstance;
    let treasuryFactoryInstance;
    let mvkTokenInstance;
    let governanceInstance;
    let mavrykFa12TokenInstance;
    let mavrykFa2TokenInstance;

    let treasuryStorage;
    let treasuryFactoryStorage;
    let mvkTokenStorage;
    let governanceStorage;
    let mavrykFa12TokenStorage;
    let mavrykFa2TokenStorage;
    
    const treasuryMetadataBase = Buffer.from(
        JSON.stringify({
          name: 'MAVRYK PLENTY-USDTz Farm',
          description: 'MAVRYK Farm Contract',
          version: 'v1.0.0',
          liquidityPairToken: {
            tokenAddress: ['KT18qSo4Ch2Mfq4jP3eME7SWHB8B8EDTtVBu'],
            origin: ['Plenty'],
            token0: {
              symbol: ['PLENTY'],
              tokenAddress: ['KT1GRSvLoikDsXujKgZPsGLX8k8VvR2Tq95b']
            },
            token1: {
              symbol: ['USDtz'],
              tokenAddress: ['KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9']
            }
          },
          authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
        }),
        'ascii',
    ).toString('hex')

    before("setup", async () => {

        utils = new Utils();
        await utils.init(bob.sk);
        tezos = utils.tezos
        
        treasuryAddress             = contractDeployments.treasury.address;
        treasuryFactoryAddress      = contractDeployments.treasuryFactory.address;
        governanceAddress           = contractDeployments.governance.address;
        mvkTokenAddress             = contractDeployments.mvkToken.address;
        mavrykFa12TokenAddress      = contractDeployments.mavrykFa12Token.address;
        mavrykFa2TokenAddress       = contractDeployments.mavrykFa2Token.address;

        treasuryInstance            = await utils.tezos.contract.at(treasuryAddress);
        treasuryFactoryInstance     = await utils.tezos.contract.at(treasuryFactoryAddress);
        mvkTokenInstance            = await utils.tezos.contract.at(mvkTokenAddress);
        governanceInstance          = await utils.tezos.contract.at(governanceAddress);
        mavrykFa12TokenInstance     = await utils.tezos.contract.at(mavrykFa12TokenAddress);
        mavrykFa2TokenInstance      = await utils.tezos.contract.at(mavrykFa2TokenAddress);

        treasuryStorage             = await treasuryInstance.storage();
        treasuryFactoryStorage      = await treasuryFactoryInstance.storage();
        mvkTokenStorage             = await mvkTokenInstance.storage();
        governanceStorage           = await governanceInstance.storage();
        mavrykFa12TokenStorage      = await mavrykFa12TokenInstance.storage();
        mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage();

        // console.log("Treasury metadata in bytes:")
        // console.log(treasuryMetadataBase)

        // console.log('-- -- -- -- -- Treasury Tests -- -- -- --')
        // console.log('Treasury Contract deployed at:', treasuryInstance.address);
        // console.log('Treasury Factory Contract deployed at:', treasuryFactoryInstance.address);
        // console.log('MVK Token Contract deployed at:', mvkTokenInstance.address);
        // console.log('Governance Contract deployed at:', governanceInstance.address);
        // console.log('Mavryk Fa12 Token Contract deployed at:', mavrykFa12TokenInstance.address);
        // console.log('Mavryk Fa2 Token Contract deployed at:' , mavrykFa2TokenInstance.address);
        // console.log('Bob address: ' + bob.pkh);
        // console.log('Alice address: ' + alice.pkh);
        // console.log('Eve address: ' + eve.pkh);
        
    });

    describe('Treasury Factory', function() {

        beforeEach("Set signer to admin", async() => {
            await helperFunctions.signerFactory(tezos, bob.sk)
        })

        describe('%setAdmin', function() {
            
            it('Admin should be able to call this entrypoint and update the contract administrator with a new address', async () => {
                try{        
    
                    const setAdminOperation = await treasuryInstance.methods.setAdmin(eve.pkh).send();
                    await setAdminOperation.confirmation();
    
                    treasuryFactoryStorage   = await treasuryInstance.storage();            
                    assert.equal(treasuryFactoryStorage.admin, eve.pkh);
    
                    // reset treasury admin to bob
                    await helperFunctions.signerFactory(tezos, eve.sk);
                    const resetAdminOperation = await treasuryInstance.methods.setAdmin(bob.pkh).send();
                    await resetAdminOperation.confirmation();
                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });

            it('Non-admin should not be able to call this entrypoint', async () => {
                try{
                    await helperFunctions.signerFactory(tezos, eve.sk);
                    await chai.expect(treasuryInstance.methods.setAdmin(alice.pkh).send()).to.be.eventually.rejected;
                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            }); 
        })

        describe('%togglePauseEntrypoint', function() {

            beforeEach("Set signer to admin", async () => {
                await helperFunctions.signerFactory(tezos, bob.sk)
            });
            
            it('Admin should be able to call this entrypoint', async () => {
                try{
                    // Initial Values
                    treasuryFactoryStorage         = await treasuryFactoryInstance.storage();
                    const isPausedStart            = treasuryFactoryStorage.breakGlassConfig.createTreasuryIsPaused

                    // Operation
                    var togglePauseOperation = await treasuryFactoryInstance.methods.togglePauseEntrypoint("createTreasury", true).send();
                    await togglePauseOperation.confirmation();
    
                    // Final values
                    treasuryFactoryStorage       = await treasuryFactoryInstance.storage();
                    const isPausedEnd       = treasuryFactoryStorage.breakGlassConfig.createTreasuryIsPaused
    
                    await chai.expect(treasuryFactoryInstance.methods.createTreasury(
                        baker.pkh,
                        "testTreasury",
                        true,
                        treasuryMetadataBase
                    ).send()).to.be.rejected;
    
                    // Reset admin
                    var togglePauseOperation = await treasuryFactoryInstance.methods.togglePauseEntrypoint("createTreasury", false).send();
                    await togglePauseOperation.confirmation();
    
                    // Assertions
                    assert.equal(isPausedStart, false);
                    assert.equal(isPausedEnd, true);
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
            
            it('Admin should be able to call this entrypoint', async () => {
                try{
                    // Initial Values
                    treasuryFactoryStorage         = await treasuryFactoryInstance.storage();
                    const isPausedStart            = treasuryFactoryStorage.breakGlassConfig.trackTreasuryIsPaused

                    // Operation
                    var togglePauseOperation = await treasuryFactoryInstance.methods.togglePauseEntrypoint("trackTreasury", true).send();
                    await togglePauseOperation.confirmation();
    
                    // Final values
                    treasuryFactoryStorage       = await treasuryFactoryInstance.storage();
                    const isPausedEnd       = treasuryFactoryStorage.breakGlassConfig.trackTreasuryIsPaused
    
                    await chai.expect(treasuryFactoryInstance.methods.trackTreasury(treasuryAddress).send()).to.be.rejected;
    
                    // Reset admin
                    var togglePauseOperation = await treasuryFactoryInstance.methods.togglePauseEntrypoint("trackTreasury", false).send();
                    await togglePauseOperation.confirmation();
    
                    // Assertions
                    assert.equal(isPausedStart, false);
                    assert.equal(isPausedEnd, true);
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
            
            it('Admin should be able to call this entrypoint', async () => {
                try{
                    // Initial Values
                    treasuryFactoryStorage         = await treasuryFactoryInstance.storage();
                    const isPausedStart            = treasuryFactoryStorage.breakGlassConfig.untrackTreasuryIsPaused

                    // Operation
                    var togglePauseOperation = await treasuryFactoryInstance.methods.togglePauseEntrypoint("untrackTreasury", true).send();
                    await togglePauseOperation.confirmation();
    
                    // Final values
                    treasuryFactoryStorage       = await treasuryFactoryInstance.storage();
                    const isPausedEnd       = treasuryFactoryStorage.breakGlassConfig.untrackTreasuryIsPaused
    
                    await chai.expect(treasuryFactoryInstance.methods.untrackTreasury(treasuryAddress).send()).to.be.rejected;
    
                    // Reset admin
                    var togglePauseOperation = await treasuryFactoryInstance.methods.togglePauseEntrypoint("untrackTreasury", false).send();
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
                    await chai.expect(treasuryFactoryInstance.methods.togglePauseEntrypoint("untrackTreasury", true).send()).to.be.rejected;
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
                    treasuryFactoryStorage       = await treasuryFactoryInstance.storage();
                    for (let [key, value] of Object.entries(treasuryFactoryStorage.breakGlassConfig)){
                        assert.equal(value, false);
                    }

                    // Operation
                    var pauseOperation = await treasuryFactoryInstance.methods.pauseAll().send();
                    await pauseOperation.confirmation();

                    // Final values
                    treasuryFactoryStorage       = await treasuryFactoryInstance.storage();
                    for (let [key, value] of Object.entries(treasuryFactoryStorage.breakGlassConfig)){
                        assert.equal(value, true);
                    }

                    for(let treasury of treasuryFactoryStorage.trackedTreasuries){
                        var trackedTreasuryInstance                         = await utils.tezos.contract.at(treasury);
                        var trackedTreasuryStorage: treasuryStorageType     = await trackedTreasuryInstance.storage();
                        for (let [key, value] of Object.entries(trackedTreasuryStorage.breakGlassConfig)){
                            assert.equal(value, true);
                        }
                    }
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
            it('Non-admin should not be able to call the entrypoint', async () => {
                try{
                    await helperFunctions.signerFactory(tezos, alice.sk);
                    await chai.expect(treasuryFactoryInstance.methods.pauseAll().send()).to.be.rejected;
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
                    treasuryFactoryStorage       = await treasuryFactoryInstance.storage();
                    for (let [key, value] of Object.entries(treasuryFactoryStorage.breakGlassConfig)){
                        assert.equal(value, true);
                    }

                    // Operation
                    var pauseOperation = await treasuryFactoryInstance.methods.unpauseAll().send();
                    await pauseOperation.confirmation();

                    // Final values
                    treasuryFactoryStorage       = await treasuryFactoryInstance.storage();
                    for (let [key, value] of Object.entries(treasuryFactoryStorage.breakGlassConfig)){
                        assert.equal(value, false);
                    }

                    for(let treasury of treasuryFactoryStorage.trackedTreasuries){
                        var trackedTreasuryInstance                             = await utils.tezos.contract.at(treasury);
                        var trackedTreasuryStorage: treasuryStorageType         = await trackedTreasuryInstance.storage();
                        for (let [key, value] of Object.entries(trackedTreasuryStorage.breakGlassConfig)){
                            assert.equal(value, false);
                        }
                    }
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
            it('Non-admin should not be able to call the entrypoint', async () => {
                try{
                    await helperFunctions.signerFactory(tezos, alice.sk);
                    await chai.expect(treasuryFactoryInstance.methods.unpauseAll().send()).to.be.rejected;
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        })

        describe('%createTreasury', function() {

            beforeEach("Set signer to admin", async() => {
                await helperFunctions.signerFactory(tezos, bob.sk)
            })

            it('Admin should be able to call this entrypoint', async () => {
                try{
                    // Operation
                    const operation = await treasuryFactoryInstance.methods.createTreasury(
                        baker.pkh,
                        "testTreasury1",
                        true,
                        treasuryMetadataBase).send();
                    await operation.confirmation()

                    // Final values
                    treasuryFactoryStorage    = await treasuryFactoryInstance.storage();
                    const treasuryAddress                       = treasuryFactoryStorage.trackedTreasuries[0];
                    const treasuryInstance                      = await utils.tezos.contract.at(treasuryAddress);
                    const treasuryStorage: treasuryStorageType  = await treasuryInstance.storage();

                    assert.strictEqual(treasuryStorage.admin, bob.pkh);
                    assert.strictEqual(treasuryStorage.mvkTokenAddress, mvkTokenAddress);
                }catch(e){
                    console.dir(e, {depth: 5});
                }
            })

            it('Non-admin should not be able to call this entrypoint', async () => {
                try{
                    // Operation
                    await helperFunctions.signerFactory(tezos, alice.sk);
                    await chai.expect(treasuryFactoryInstance.methods.createTreasury(
                        baker.pkh,
                        "testTreasury",
                        false,
                        treasuryMetadataBase).send()).to.be.eventually.rejected;
                }catch(e){
                    console.dir(e, {depth: 5});
                }
            })

            it('Admin should not be able to call this entrypoint if it is paused', async () => {
                try{
                    // Initial Values
                    treasuryFactoryStorage         = await treasuryFactoryInstance.storage();
                    const isPausedStart            = treasuryFactoryStorage.breakGlassConfig.createTreasuryIsPaused

                    // Operation
                    var togglePauseOperation = await treasuryFactoryInstance.methods.togglePauseEntrypoint("createTreasury", true).send();
                    await togglePauseOperation.confirmation();
    
                    // Final values
                    treasuryFactoryStorage       = await treasuryFactoryInstance.storage();
                    const isPausedEnd       = treasuryFactoryStorage.breakGlassConfig.createTreasuryIsPaused
    
                    await chai.expect(treasuryFactoryInstance.methods.createTreasury(
                        baker.pkh,
                        "testTreasury",
                        false,
                        treasuryMetadataBase
                    ).send()).to.be.rejected;
    
                    // Reset admin
                    var togglePauseOperation = await treasuryFactoryInstance.methods.togglePauseEntrypoint("createTreasury", false).send();
                    await togglePauseOperation.confirmation();
    
                    // Assertions
                    assert.equal(isPausedStart, false);
                    assert.equal(isPausedEnd, true);
                }catch(e){
                    console.dir(e, {depth: 5});
                }
            })
        });

        describe('%trackTreasury', function() {

            beforeEach("Set signer to admin", async() => {
                await helperFunctions.signerFactory(tezos, bob.sk)
            })

            it('Non-admin should not be able to call this entrypoint', async () => {
                try{
                    // Initial Values
                    treasuryFactoryStorage  = await treasuryFactoryInstance.storage();
                    const treasuryToTrack   = treasuryAddress;

                    // Operation
                    await helperFunctions.signerFactory(tezos, alice.sk)
                    await chai.expect(treasuryFactoryInstance.methods.trackTreasury(treasuryToTrack).send()).to.be.rejected;

                    // Assertions
                    assert.equal(treasuryFactoryStorage.trackedTreasuries.includes(treasuryToTrack), false);
                }catch(e){
                    console.dir(e, {depth: 5});
                }
            })

            it('Admin should not be able to call this entrypoint if it is paused', async () => {
                try{
                    // Initial Values
                    treasuryFactoryStorage          = await treasuryFactoryInstance.storage();
                    const treasuryToTrack           = treasuryAddress;
                    const isPausedStart             = treasuryFactoryStorage.breakGlassConfig.trackTreasuryIsPaused

                    // Operation
                    var togglePauseOperation = await treasuryFactoryInstance.methods.togglePauseEntrypoint("trackTreasury", true).send();
                    await togglePauseOperation.confirmation();
    
                    // Final values
                    treasuryFactoryStorage       = await treasuryFactoryInstance.storage();
                    const isPausedEnd       = treasuryFactoryStorage.breakGlassConfig.trackTreasuryIsPaused
    
                    await chai.expect(treasuryFactoryInstance.methods.trackTreasury(treasuryAddress).send()).to.be.rejected;
    
                    // Reset admin
                    var togglePauseOperation = await treasuryFactoryInstance.methods.togglePauseEntrypoint("trackTreasury", false).send();
                    await togglePauseOperation.confirmation();
    
                    // Assertions
                    assert.equal(isPausedStart, false);
                    assert.equal(isPausedEnd, true);
                    assert.equal(treasuryFactoryStorage.trackedTreasuries.includes(treasuryToTrack), false);
                }catch(e){
                    console.dir(e, {depth: 5});
                }
            })

            it('Admin should be able to call this entrypoint', async () => {
                try{
                    // Initial Values
                    const treasuryToTrack   = treasuryAddress;

                    // Operation
                    const operation = await treasuryFactoryInstance.methods.trackTreasury(treasuryToTrack).send();
                    await operation.confirmation();

                    // Assertions
                    treasuryFactoryStorage  = await treasuryFactoryInstance.storage();
                    assert.equal(treasuryFactoryStorage.trackedTreasuries.includes(treasuryToTrack), true);
                }catch(e){
                    console.dir(e, {depth: 5});
                }
            })

            it('Admin should not be able to call this entrypoint if the provided treasury is already tracked', async () => {
                try{
                    // Initial Values
                    const treasuryToTrack   = treasuryAddress;

                    // Operation
                    await chai.expect(treasuryFactoryInstance.methods.trackTreasury(treasuryToTrack).send()).to.be.rejected;

                    // Assertions
                    treasuryFactoryStorage  = await treasuryFactoryInstance.storage();
                    assert.equal(treasuryFactoryStorage.trackedTreasuries.includes(treasuryToTrack), true);
                }catch(e){
                    console.dir(e, {depth: 5});
                }
            })
        })

        describe('%untrackTreasury', function() {

            beforeEach("Set signer to admin", async() => {
                await helperFunctions.signerFactory(tezos, bob.sk)
            })

            it('Non-admin should not be able to call this entrypoint', async () => {
                try{
                    // Initial Values
                    treasuryFactoryStorage  = await treasuryFactoryInstance.storage();
                    const treasuryToUntrack = treasuryAddress;

                    // Operation
                    await helperFunctions.signerFactory(tezos, alice.sk)
                    await chai.expect(treasuryFactoryInstance.methods.untrackTreasury(treasuryToUntrack).send()).to.be.rejected;

                    // Assertions
                    assert.equal(treasuryFactoryStorage.trackedTreasuries.includes(treasuryToUntrack), true);
                }catch(e){
                    console.dir(e, {depth: 5});
                }
            })

            it('Admin should not be able to call this entrypoint if it is paused', async () => {
                try{
                    // Initial Values
                    treasuryFactoryStorage          = await treasuryFactoryInstance.storage();
                    const treasuryToUntrack         = treasuryAddress;
                    const isPausedStart             = treasuryFactoryStorage.breakGlassConfig.untrackTreasuryIsPaused

                    // Operation
                    var togglePauseOperation = await treasuryFactoryInstance.methods.togglePauseEntrypoint("untrackTreasury", true).send();
                    await togglePauseOperation.confirmation();
    
                    // Final values
                    treasuryFactoryStorage       = await treasuryFactoryInstance.storage();
                    const isPausedEnd       = treasuryFactoryStorage.breakGlassConfig.untrackTreasuryIsPaused
    
                    await chai.expect(treasuryFactoryInstance.methods.untrackTreasury(treasuryToUntrack).send()).to.be.rejected;
    
                    // Reset admin
                    var togglePauseOperation = await treasuryFactoryInstance.methods.togglePauseEntrypoint("untrackTreasury", false).send();
                    await togglePauseOperation.confirmation();
    
                    // Assertions
                    assert.equal(isPausedStart, false);
                    assert.equal(isPausedEnd, true);
                    assert.equal(treasuryFactoryStorage.trackedTreasuries.includes(treasuryToUntrack), true);
                }catch(e){
                    console.dir(e, {depth: 5});
                }
            })

            it('Admin should be able to call this entrypoint', async () => {
                try{
                    // Initial Values
                    const treasuryToUntrack   = treasuryAddress;

                    // Operation
                    const operation = await treasuryFactoryInstance.methods.untrackTreasury(treasuryToUntrack).send();
                    await operation.confirmation();

                    // Assertions
                    treasuryFactoryStorage  = await treasuryFactoryInstance.storage();
                    assert.equal(treasuryFactoryStorage.trackedTreasuries.includes(treasuryToUntrack), false);
                }catch(e){
                    console.dir(e, {depth: 5});
                }
            })

            it('Admin should not be able to call this entrypoint if the provided treasury is already tracked', async () => {
                try{
                    // Initial Values
                    const treasuryToUntrack   = treasuryAddress;

                    // Operation
                    await chai.expect(treasuryFactoryInstance.methods.untrackTreasury(treasuryToUntrack).send()).to.be.rejected;

                    // Assertions
                    treasuryFactoryStorage  = await treasuryFactoryInstance.storage();
                    assert.equal(treasuryFactoryStorage.trackedTreasuries.includes(treasuryToUntrack), false);
                }catch(e){
                    console.dir(e, {depth: 5});
                }
            })
        })
    });
});