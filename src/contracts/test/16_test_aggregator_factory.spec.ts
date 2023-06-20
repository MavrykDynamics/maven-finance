import { Utils } from './helpers/Utils';
import { MichelsonMap } from '@taquito/michelson-encoder';
import assert from "assert";
import BigNumber from 'bignumber.js';

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

import { bob, alice, eve, mallory, trudy, oscar, susie } from "../scripts/sandbox/accounts";
import { mockMetadata, mockSatelliteData } from "./helpers/mockSampleData"
import { 
    signerFactory, 
    getStorageMapValue,
    fa12Transfer,
    fa2Transfer,
    mistakenTransferFa2Token,
    updateWhitelistContracts,
    updateGeneralContracts,
    randomNumberFromInterval
} from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe('AggregatorFactory', () => {

    var utils: Utils;
    let tezos 

    let user
    let userSk

    let admin
    let adminSk

    let tokenId = 0

    let satellite
    let satelliteOne 
    let satelliteOneSk 
    
    let satelliteTwo
    let satelliteTwoSk 

    let satelliteThree
    let satelliteThreeSk

    let satelliteFour 
    let satelliteFive

    let aggregatorInstance;
    let aggregatorFactoryInstance;

    let aggregatorStorage;
    let aggregatorFactoryStorage;

    let governanceSatelliteInstance;
    let governanceSatelliteStorage;

    let mavrykFa2TokenInstance
    let mavrykFa2TokenStorage

    let oracleMap

    // operations
    let transferOperation

    // housekeeping operations
    let setAdminOperation
    let setGovernanceOperation
    let resetAdminOperation
    let updateWhitelistContractsOperation
    let updateGeneralContractsOperation
    let mistakenTransferOperation
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

        aggregatorInstance              = await utils.tezos.contract.at(contractDeployments.aggregator.address);
        aggregatorFactoryInstance       = await utils.tezos.contract.at(contractDeployments.aggregatorFactory.address);
        governanceSatelliteInstance     = await utils.tezos.contract.at(contractDeployments.governanceSatellite.address);
        mavrykFa2TokenInstance          = await utils.tezos.contract.at(contractDeployments.mavrykFa2Token.address);

        aggregatorStorage               = await aggregatorInstance.storage();
        aggregatorFactoryStorage        = await aggregatorFactoryInstance.storage();
        governanceSatelliteStorage      = await governanceSatelliteInstance.storage();
        mavrykFa2TokenStorage           = await mavrykFa2TokenInstance.storage();

        console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')

        // -----------------------------------------------
        //
        // Setup corresponds to 06_setup_satellites:
        //
        //   - satellites: alice, eve, susie, oscar, trudy
        //   - delegates:
        //          eve satellite: david, ivan, isaac
        //          alice satellite: mallory
        //          susie satellite: none
        //          oscar satellite: none
        //          trudy satellite: none
        //    
        // -----------------------------------------------

        // Satellites
        satelliteOne       = eve.pkh;
        satelliteOneSk     = eve.sk;

        satelliteTwo       = alice.pkh;
        satelliteTwoSk     = alice.sk;

        satelliteThree     = trudy.pkh;
        satelliteThreeSk   = trudy.sk;

        satelliteFour      = oscar.pkh;
        satelliteFive      = susie.pkh;

        oracleMap = MichelsonMap.fromLiteral({
            [satelliteOne]          : {
                                        oraclePublicKey: mockSatelliteData.eve.oraclePublicKey,
                                        oraclePeerId: mockSatelliteData.eve.oraclePeerId
                                    },
            [satelliteTwo]          : {
                                        oraclePublicKey: mockSatelliteData.alice.oraclePublicKey,
                                        oraclePeerId: mockSatelliteData.alice.oraclePeerId
                                    },
            [satelliteThree]        : {
                                        oraclePublicKey: mockSatelliteData.trudy.oraclePublicKey,
                                        oraclePeerId: mockSatelliteData.trudy.oraclePeerId
                                    }
        });
    
    });

    describe("Housekeeping Entrypoints", async () => {

        beforeEach("Set signer to admin (bob)", async () => {
            aggregatorFactoryStorage        = await aggregatorFactoryInstance.storage();
            await signerFactory(tezos, adminSk);
        });

        it('%setAdmin                 - admin (bob) should be able to update the contract admin address', async () => {
            try{
                
                // Initial Values
                aggregatorFactoryStorage   = await aggregatorFactoryInstance.storage();
                const currentAdmin  = aggregatorFactoryStorage.admin;

                // Operation
                setAdminOperation   = await aggregatorFactoryInstance.methods.setAdmin(alice.pkh).send();
                await setAdminOperation.confirmation();

                // Final values
                aggregatorFactoryStorage   = await aggregatorFactoryInstance.storage();
                const newAdmin      = aggregatorFactoryStorage.admin;

                // Assertions
                assert.notStrictEqual(newAdmin, currentAdmin);
                assert.strictEqual(newAdmin, alice.pkh);
                assert.strictEqual(currentAdmin, bob.pkh);

                // reset admin
                await signerFactory(tezos, alice.sk);
                resetAdminOperation = await aggregatorFactoryInstance.methods.setAdmin(bob.pkh).send();
                await resetAdminOperation.confirmation();

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%setGovernance            - admin (bob) should be able to update the contract governance address', async () => {
            try{
                
                // Initial Values
                aggregatorFactoryStorage       = await aggregatorFactoryInstance.storage();
                const currentGovernance = aggregatorFactoryStorage.governanceAddress;

                // Operation
                setGovernanceOperation = await aggregatorFactoryInstance.methods.setGovernance(alice.pkh).send();
                await setGovernanceOperation.confirmation();

                // Final values
                aggregatorFactoryStorage       = await aggregatorFactoryInstance.storage();
                const updatedGovernance = aggregatorFactoryStorage.governanceAddress;

                // reset governance
                setGovernanceOperation = await aggregatorFactoryInstance.methods.setGovernance(contractDeployments.governance.address).send();
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
                const updateOperation = await aggregatorFactoryInstance.methods.updateMetadata(key, hash).send();
                await updateOperation.confirmation();

                // Final values
                aggregatorFactoryStorage       = await aggregatorFactoryInstance.storage();            

                const updatedData       = await aggregatorFactoryStorage.metadata.get(key);
                assert.equal(hash, updatedData);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('%updateConfig             - admin (bob) should be able to update contract config', async () => {
            try{
                
                // Initial Values
                aggregatorFactoryStorage             = await aggregatorFactoryInstance.storage();
                const initialAggregatorNameMaxLength = aggregatorFactoryStorage.config.aggregatorNameMaxLength.toNumber();
                const testAmount                     = 100;

                // Operation
                const updateConfigOperation = await aggregatorFactoryInstance.methods.updateConfig(testAmount, "configAggregatorNameMaxLength").send();
                await updateConfigOperation.confirmation();

                // Final values
                aggregatorFactoryStorage           = await aggregatorFactoryInstance.storage();
                const updatedConfigValue           = aggregatorFactoryStorage.config.aggregatorNameMaxLength.toNumber();

                // Assertions
                assert.equal(updatedConfigValue, testAmount);

                // reset config operation
                const resetConfigOperation = await aggregatorFactoryInstance.methods.updateConfig(initialAggregatorNameMaxLength, "configAggregatorNameMaxLength").send();
                await resetConfigOperation.confirmation();

                // Final values
                aggregatorFactoryStorage   = await aggregatorFactoryInstance.storage();
                const resetConfigValue     = aggregatorFactoryStorage.config.aggregatorNameMaxLength.toNumber();

                assert.equal(resetConfigValue, initialAggregatorNameMaxLength);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%updateWhitelistContracts - admin (bob) should be able to add user (eve) to the Whitelisted Contracts map', async () => {
            try {

                // init values
                contractMapKey  = eve.pkh;
                storageMap      = "whitelistContracts";

                initialContractMapValue           = await getStorageMapValue(aggregatorFactoryStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await updateWhitelistContracts(aggregatorFactoryInstance, contractMapKey, 'update');
                await updateWhitelistContractsOperation.confirmation()

                aggregatorFactoryStorage = await aggregatorFactoryInstance.storage()
                updatedContractMapValue = await getStorageMapValue(aggregatorFactoryStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'Eve (key) should not be in the Whitelist Contracts map before adding her to it')
                assert.notStrictEqual(updatedContractMapValue, undefined,  'Eve (key) should be in the Whitelist Contracts map after adding her to it')

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%updateWhitelistContracts - admin (bob) should be able to remove user (eve) from the Whitelisted Contracts map', async () => {
            try {

                // init values
                contractMapKey  = eve.pkh;
                storageMap      = "whitelistContracts";

                initialContractMapValue = await getStorageMapValue(aggregatorFactoryStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await updateWhitelistContracts(aggregatorFactoryInstance, contractMapKey, 'remove');
                await updateWhitelistContractsOperation.confirmation()

                aggregatorFactoryStorage = await aggregatorFactoryInstance.storage()
                updatedContractMapValue = await getStorageMapValue(aggregatorFactoryStorage, storageMap, contractMapKey);

                assert.notStrictEqual(initialContractMapValue, undefined, 'Eve (key) should be in the Whitelist Contracts map before adding her to it');
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

                initialContractMapValue = await getStorageMapValue(aggregatorFactoryStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await updateGeneralContracts(aggregatorFactoryInstance, contractMapKey, eve.pkh, 'update');
                await updateGeneralContractsOperation.confirmation()

                aggregatorFactoryStorage = await aggregatorFactoryInstance.storage()
                updatedContractMapValue = await getStorageMapValue(aggregatorFactoryStorage, storageMap, contractMapKey);

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

                initialContractMapValue = await getStorageMapValue(aggregatorFactoryStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await updateGeneralContracts(aggregatorFactoryInstance, contractMapKey, eve.pkh, 'remove');
                await updateGeneralContractsOperation.confirmation()

                aggregatorFactoryStorage = await aggregatorFactoryInstance.storage()
                updatedContractMapValue = await getStorageMapValue(aggregatorFactoryStorage, storageMap, contractMapKey);

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

                // Mistaken Operation - user (mallory) send 10 MavrykFa2Tokens to Contract
                await signerFactory(tezos, userSk);
                transferOperation = await fa2Transfer(mavrykFa2TokenInstance, user, contractDeployments.aggregatorFactory.address, tokenId, tokenAmount);
                await transferOperation.confirmation();
                
                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage();
                const initialUserBalance    = (await mavrykFa2TokenStorage.ledger.get(user)).toNumber()

                await signerFactory(tezos, bob.sk);
                mistakenTransferOperation = await mistakenTransferFa2Token(aggregatorFactoryInstance, user, contractDeployments.mavrykFa2Token.address, tokenId, tokenAmount).send();
                await mistakenTransferOperation.confirmation();

                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage();
                const updatedUserBalance    = (await mavrykFa2TokenStorage.ledger.get(user)).toNumber();

                // increase in updated balance
                assert.equal(updatedUserBalance, initialUserBalance + tokenAmount);

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%createAggregator         - admin (bob) should be able to create a new aggregator', async () => {
            try {

                const startTrackedAggregators   = aggregatorFactoryStorage.trackedAggregators.length;

                const randomNumber              = randomNumberFromInterval(1, 1000000);
                const randomAggregatorName      = "testCreateAggregator" + randomNumber;

                // Operation
                const createAggregatorOperation = await aggregatorFactoryInstance.methods.createAggregator(
        
                    randomAggregatorName,
                    true,
                    
                    oracleMap,
        
                    new BigNumber(8),             // decimals
                    new BigNumber(2),             // alphaPercentPerThousand
        
                    new BigNumber(60),            // percentOracleThreshold
                    new BigNumber(30),            // heartBeatSeconds
        
                    new BigNumber(10000000),      // rewardAmountMvk ~ 0.01 MVK
                    new BigNumber(1300),          // rewardAmountXtz ~ 0.0013 tez
                    
                    mockMetadata.aggregator       // metadata
                ).send();
                await createAggregatorOperation.confirmation();

                // Final values
                aggregatorFactoryStorage        = await aggregatorFactoryInstance.storage();
                governanceSatelliteStorage      = await governanceSatelliteInstance.storage();
                const aggregatorRecord          = await governanceSatelliteStorage.aggregatorLedger.get(randomAggregatorName);
                const endTrackedAggregators     = aggregatorFactoryStorage.trackedAggregators.length;

                // Assertion
                assert.notEqual(endTrackedAggregators, startTrackedAggregators);
                assert.notStrictEqual(aggregatorRecord, undefined);
                assert.equal(aggregatorFactoryStorage.trackedAggregators.includes(aggregatorRecord), true);
                
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });


        it('%trackAggregator          - admin (bob) should be able to track an aggregator', async () => {
            try {

                // Operation
                const operation             = await aggregatorFactoryInstance.methods.trackAggregator(aggregatorInstance.address).send();
                await operation.confirmation();

                // Final values
                aggregatorFactoryStorage    = await aggregatorFactoryInstance.storage();

                // Assertion
                assert.equal(aggregatorFactoryStorage.trackedAggregators.includes(aggregatorInstance.address), true);

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('%untrackAggregator        - admin (bob) should be able to untrack an aggregator', async () => {
            try {

                // Operation
                const operation             = await aggregatorFactoryInstance.methods.untrackAggregator(aggregatorInstance.address).send();
                await operation.confirmation();
    
                // Final values
                aggregatorFactoryStorage    = await aggregatorFactoryInstance.storage();
    
                // Assertion
                assert.equal(aggregatorFactoryStorage.trackedAggregators.includes(aggregatorFactoryInstance.address), false);

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });


        it('%pauseAll                 - admin (bob) should be able to pause all entrypoints in the contract', async () => {
            try{
                // Initial Values
                aggregatorFactoryStorage       = await aggregatorFactoryInstance.storage();
                for (let [key, value] of Object.entries(aggregatorFactoryStorage.breakGlassConfig)){
                    assert.equal(value, false);
                }

                // pause all operation
                pauseAllOperation = await aggregatorFactoryInstance.methods.pauseAll().send();
                await pauseAllOperation.confirmation();

                // Final values
                aggregatorFactoryStorage       = await aggregatorFactoryInstance.storage();
                for (let [key, value] of Object.entries(aggregatorFactoryStorage.breakGlassConfig)){
                    assert.equal(value, true);
                }

                // Test operations
                const randomNumber          = randomNumberFromInterval(1, 1000000);
                const randomAggregatorName  = "testCreateAggregator" + randomNumber;

                await chai.expect(aggregatorFactoryInstance.methods.createAggregator(
            
                    randomAggregatorName,
                    true,
                    
                    oracleMap,
            
                    new BigNumber(8),             // decimals
                    new BigNumber(2),             // numberBlocksDelay
            
                    new BigNumber(60),            // percentOracleThreshold
                    new BigNumber(30),            // heartBeatSeconds

                    
                    new BigNumber(10000000),      // rewardAmountMvk ~ 0.01 MVK
                    new BigNumber(1300),          // rewardAmountXtz ~ 0.0013 tez
                    
                    mockMetadata.aggregator       // metadata
                ).send()).to.be.rejected;

                await chai.expect(aggregatorFactoryInstance.methods.untrackAggregator(aggregatorInstance.address).send()).to.be.rejected;
                await chai.expect(aggregatorFactoryInstance.methods.trackAggregator(aggregatorInstance.address).send()).to.be.rejected;

                // init params for aggregator test entrypoints
                const observations = [
                    {
                        "oracle": satelliteOne,
                        "data": new BigNumber(10142857143)
                    },
                    {
                        "oracle": satelliteTwo,
                        "data": new BigNumber(10142853322)
                    },
                    {
                        "oracle": satelliteThree,
                        "data": new BigNumber(10142857900)
                    }
                ];
                const epoch: number = 1;
                const round: number = 1;
                const oracleObservations = new MichelsonMap<string, any>();
                for (const { oracle, data } of observations) {
                    oracleObservations.set(oracle, {
                        data,
                        epoch,
                        round,
                        aggregatorAddress: contractDeployments.aggregator.address
                    });
                };
                const signatures = new MichelsonMap<string, string>();
                
                await signerFactory(tezos, satelliteOneSk);
                signatures.set(satelliteOne, await utils.signOracleDataResponses(oracleObservations));
                
                await signerFactory(tezos, satelliteTwoSk);
                signatures.set(satelliteTwo, await utils.signOracleDataResponses(oracleObservations));
                
                await signerFactory(tezos, satelliteThreeSk);
                signatures.set(satelliteThree, await utils.signOracleDataResponses(oracleObservations));

                await signerFactory(tezos, satelliteOneSk);
                await chai.expect(aggregatorInstance.methods.updateData(oracleObservations, signatures).send()).to.be.rejected;
                await chai.expect(aggregatorInstance.methods.withdrawRewardXtz(satelliteOne).send()).to.be.rejected;
                await chai.expect(aggregatorInstance.methods.withdrawRewardStakedMvk(satelliteOne).send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('%unpauseAll               - admin (bob) should be able to unpause all entrypoints in the contract', async () => {
            try{

                // Initial Values
                aggregatorFactoryStorage = await aggregatorFactoryInstance.storage();
                for (let [key, value] of Object.entries(aggregatorFactoryStorage.breakGlassConfig)){
                    assert.equal(value, true);
                }

                // unpause all operation
                unpauseAllOperation = await aggregatorFactoryInstance.methods.unpauseAll().send();
                await unpauseAllOperation.confirmation();

                // Final values
                aggregatorFactoryStorage = await aggregatorFactoryInstance.storage();
                for (let [key, value] of Object.entries(aggregatorFactoryStorage.breakGlassConfig)){
                    assert.equal(value, false);
                }

                // Test operations
                const randomNumber          = randomNumberFromInterval(1, 1000000);
                const randomAggregatorName  = "testCreateAggregator" + randomNumber;

                const testCreateAggregatorOp  = await aggregatorFactoryInstance.methods.createAggregator(
            
                    randomAggregatorName,
                    true,
                    
                    oracleMap,
            
                    new BigNumber(8),             // decimals
                    new BigNumber(2),             // alphaPercentPerThousand
            
                    new BigNumber(60),            // percentOracleThreshold
                    new BigNumber(30),            // heartBeatSeconds
            
                    new BigNumber(10000000),      // rewardAmountMvk ~ 0.01 MVK
                    new BigNumber(1300),          // rewardAmountXtz ~ 0.0013 tez
                    
                    mockMetadata.aggregator       // metadata

                ).send();
                await testCreateAggregatorOp.confirmation();

                const aggregatorAddress         = aggregatorFactoryStorage.trackedAggregators[0];

                const testUntrackAggregatorOp   = await aggregatorFactoryInstance.methods.untrackAggregator(aggregatorAddress).send();
                await testUntrackAggregatorOp.confirmation();

                const testTrackAggregatorOp     = await aggregatorFactoryInstance.methods.trackAggregator(aggregatorAddress).send();
                await testTrackAggregatorOp.confirmation();


            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it("%togglePauseEntrypoint    - admin (bob) should be able to call this entrypoint", async() => {
            try{
                
                // pause operations

                pauseOperation = await aggregatorFactoryInstance.methods.togglePauseEntrypoint("createAggregator", true).send();
                await pauseOperation.confirmation();
                
                pauseOperation = await aggregatorFactoryInstance.methods.togglePauseEntrypoint("untrackAggregator", true).send();
                await pauseOperation.confirmation();

                pauseOperation = await aggregatorFactoryInstance.methods.togglePauseEntrypoint("trackAggregator", true).send(); 
                await pauseOperation.confirmation();

                pauseOperation = await aggregatorFactoryInstance.methods.togglePauseEntrypoint("distributeRewardXtz", true).send();
                await pauseOperation.confirmation();

                pauseOperation = await aggregatorFactoryInstance.methods.togglePauseEntrypoint("distributeRewardStakedMvk", true).send();
                await pauseOperation.confirmation();

                // update storage
                aggregatorFactoryStorage              = await aggregatorFactoryInstance.storage();

                // check that all entrypoints are paused
                for (let [key, value] of Object.entries(aggregatorFactoryStorage.breakGlassConfig)){
                    assert.equal(value, true);
                }

                // unpause operations

                unpauseOperation = await aggregatorFactoryInstance.methods.togglePauseEntrypoint("createAggregator", false).send();
                await unpauseOperation.confirmation();
                
                unpauseOperation = await aggregatorFactoryInstance.methods.togglePauseEntrypoint("untrackAggregator", false).send();
                await unpauseOperation.confirmation();

                unpauseOperation = await aggregatorFactoryInstance.methods.togglePauseEntrypoint("trackAggregator", false).send();
                await unpauseOperation.confirmation();

                unpauseOperation = await aggregatorFactoryInstance.methods.togglePauseEntrypoint("distributeRewardXtz", false).send();
                await unpauseOperation.confirmation();

                unpauseOperation = await aggregatorFactoryInstance.methods.togglePauseEntrypoint("distributeRewardStakedMvk", false).send();
                await unpauseOperation.confirmation();

                // update storage
                aggregatorFactoryStorage              = await aggregatorFactoryInstance.storage();

                // check that all entrypoints are unpaused
                for (let [key, value] of Object.entries(aggregatorFactoryStorage.breakGlassConfig)){
                    assert.equal(value, false);
                }

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

    });


    describe('Access Control Checks', function () {

        beforeEach("Set signer to non-admin (mallory)", async () => {
            aggregatorFactoryStorage = await aggregatorFactoryInstance.storage();
            await signerFactory(tezos, mallory.sk);
        });

        it('%setAdmin                 - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                aggregatorFactoryStorage   = await aggregatorFactoryInstance.storage();
                const currentAdmin         = aggregatorFactoryStorage.admin;

                // Operation
                setAdminOperation = await aggregatorFactoryInstance.methods.setAdmin(mallory.pkh);
                await chai.expect(setAdminOperation.send()).to.be.rejected;

                // Final values
                aggregatorFactoryStorage   = await aggregatorFactoryInstance.storage();
                const newAdmin             = aggregatorFactoryStorage.admin;

                // Assertions
                assert.strictEqual(newAdmin, currentAdmin);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%setGovernance            - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                aggregatorFactoryStorage = await aggregatorFactoryInstance.storage();
                const currentGovernance  = aggregatorFactoryStorage.governanceAddress;

                // Operation
                setGovernanceOperation = await aggregatorFactoryInstance.methods.setGovernance(mallory.pkh);
                await chai.expect(setGovernanceOperation.send()).to.be.rejected;

                // Final values
                aggregatorFactoryStorage = await aggregatorFactoryInstance.storage();
                const updatedGovernance  = aggregatorFactoryStorage.governanceAddress;

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

                aggregatorFactoryStorage = await aggregatorFactoryInstance.storage();   
                const initialMetadata    = await aggregatorFactoryStorage.metadata.get(key);

                // Operation
                const updateOperation = await aggregatorFactoryInstance.methods.updateMetadata(key, hash);
                await chai.expect(updateOperation.send()).to.be.rejected;

                // Final values
                aggregatorFactoryStorage = await aggregatorFactoryInstance.storage();            
                const updatedData        = await aggregatorFactoryStorage.metadata.get(key);

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
                aggregatorFactoryStorage            = await aggregatorFactoryInstance.storage();
                const initialConfigValue            = aggregatorFactoryStorage.config.aggregatorNameMaxLength;
                const testAmount                    = 123;

                // Operation
                const updateConfigOperation = await aggregatorFactoryInstance.methods.updateConfig(testAmount, "configAggregatorNameMaxLength");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                // Final values
                aggregatorFactoryStorage            = await aggregatorFactoryInstance.storage();
                const updatedConfigValue            = aggregatorFactoryStorage.config.aggregatorNameMaxLength;

                // check that there is no change in config values
                assert.equal(updatedConfigValue.toNumber(), initialConfigValue.toNumber());
                assert.notEqual(updatedConfigValue.toNumber(), testAmount);
                
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%updateWhitelistContracts - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // init values
                contractMapKey  = mallory.pkh;
                storageMap      = "whitelistContracts";

                initialContractMapValue = await getStorageMapValue(aggregatorFactoryStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await aggregatorFactoryInstance.methods.updateWhitelistContracts(contractMapKey, 'update')
                await chai.expect(updateWhitelistContractsOperation.send()).to.be.rejected;

                aggregatorFactoryStorage = await aggregatorFactoryInstance.storage()
                updatedContractMapValue  = await getStorageMapValue(aggregatorFactoryStorage, storageMap, contractMapKey);

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

                initialContractMapValue = await getStorageMapValue(aggregatorFactoryStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await aggregatorFactoryInstance.methods.updateGeneralContracts(contractMapKey, alice.pkh, 'update')
                await chai.expect(updateGeneralContractsOperation.send()).to.be.rejected;

                aggregatorFactoryStorage = await aggregatorFactoryInstance.storage()
                updatedContractMapValue  = await getStorageMapValue(aggregatorFactoryStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'mallory (key) should not be in the General Contracts map');

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it('%mistakenTransfer         - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // Initial values
                const tokenAmount = 10;

                // Mistaken Operation - send 10 MavrykFa2Tokens to Contract
                transferOperation = await fa2Transfer(mavrykFa2TokenInstance, mallory.pkh, contractDeployments.aggregatorFactory.address, tokenId, tokenAmount);
                await transferOperation.confirmation();

                // mistaken transfer operation
                mistakenTransferOperation = await mistakenTransferFa2Token(aggregatorFactoryInstance, mallory.pkh, contractDeployments.mavrykFa2Token.address, tokenId, tokenAmount);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%pauseAll                 - non-admin (mallory) should not be able to call this entrypoint", async() => {
            try{

                pauseAllOperation = aggregatorFactoryInstance.methods.pauseAll(); 
                await chai.expect(pauseAllOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%unpauseAll               - non-admin (mallory) should not be able to call this entrypoint", async() => {
            try{

                unpauseAllOperation = aggregatorFactoryInstance.methods.unpauseAll(); 
                await chai.expect(unpauseAllOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%togglePauseEntrypoint    - non-admin (mallory) should not be able to call this entrypoint", async() => {
            try{
                
                // pause operations

                pauseOperation = aggregatorFactoryInstance.methods.togglePauseEntrypoint("createAggregator", true); 
                await chai.expect(pauseOperation.send()).to.be.rejected;
                
                pauseOperation = aggregatorFactoryInstance.methods.togglePauseEntrypoint("untrackAggregator", true); 
                await chai.expect(pauseOperation.send()).to.be.rejected;

                pauseOperation = aggregatorFactoryInstance.methods.togglePauseEntrypoint("trackAggregator", true); 
                await chai.expect(pauseOperation.send()).to.be.rejected;

                pauseOperation = aggregatorFactoryInstance.methods.togglePauseEntrypoint("distributeRewardXtz", true); 
                await chai.expect(pauseOperation.send()).to.be.rejected;

                pauseOperation = aggregatorFactoryInstance.methods.togglePauseEntrypoint("distributeRewardStakedMvk", true); 
                await chai.expect(pauseOperation.send()).to.be.rejected;

                // unpause operations

                unpauseOperation = aggregatorFactoryInstance.methods.togglePauseEntrypoint("createAggregator", false); 
                await chai.expect(unpauseOperation.send()).to.be.rejected;
                
                unpauseOperation = aggregatorFactoryInstance.methods.togglePauseEntrypoint("untrackAggregator", false); 
                await chai.expect(unpauseOperation.send()).to.be.rejected;

                unpauseOperation = aggregatorFactoryInstance.methods.togglePauseEntrypoint("trackAggregator", false); 
                await chai.expect(unpauseOperation.send()).to.be.rejected;

                unpauseOperation = aggregatorFactoryInstance.methods.togglePauseEntrypoint("distributeRewardXtz", false); 
                await chai.expect(unpauseOperation.send()).to.be.rejected;

                unpauseOperation = aggregatorFactoryInstance.methods.togglePauseEntrypoint("distributeRewardStakedMvk", false); 
                await chai.expect(unpauseOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })


        it('%createAggregator         - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // Operation
                const createAggregatorOperation = aggregatorFactoryInstance.methods.createAggregator(
                    'USD/BTC',
                    true,
                    
                    oracleMap,
        
                    new BigNumber(8),             // decimals
                    new BigNumber(2),             // alphaPercentPerThousand
        
                    new BigNumber(60),            // percentOracleThreshold
                    new BigNumber(30),            // heartBeatSeconds
        
                    new BigNumber(10000000),      // rewardAmountMvk ~ 0.01 MVK
                    new BigNumber(1300),          // rewardAmountXtz ~ 0.0013 tez
                    
                    mockMetadata.aggregator       // metadata
                );
                await chai.expect(createAggregatorOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });


        it('%trackAggregator          - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                const trackAggregatorOperation = aggregatorFactoryInstance.methods.trackAggregator(aggregatorInstance.address);
                await chai.expect(trackAggregatorOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }     
        });

        it('%untrackAggregator        - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                const untrackAggregatorOperation = aggregatorFactoryInstance.methods.untrackAggregator(aggregatorInstance.address)
                await chai.expect(untrackAggregatorOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it("%setLambda                - non-admin (mallory) should not be able to call this entrypoint", async() => {
            try{

                // random lambda for testing
                const randomLambdaName  = "randomLambdaName";
                const randomLambdaBytes = "050200000cba0743096500000112075e09650000005a036e036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a0362036203620362036200000000036203620760036803690000000009650000000a0362036203620362036e00000000075e09650000006c09650000000a0362036203620362036200000000036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a036203620362036203620000000003620362076003680369000000000362075e07650765036203620362036c075e076507650368036e0362036e036200000000070702000001770743075e076507650368036e0362036e020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c03200342020000010e037a034c037a07430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700002034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f02000000090743036200810303270200000000072f020000000907430362009c0203270200000000070702000000600743036200808080809d8fc0d0bff2f1b26703420200000047037a034c037a0321052900080570000205290015034b031105710002031605700002033a0322072f020000001307430368010000000844495620627920300327020000000003160707020000001a037a037a03190332072c0200000002032002000000020327034f0707020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c032000808080809d8fc0d0bff2f1b2670342020000092d037a057a000505700005037a034c07430362008f03052100020529000f0529000307430359030a034c03190325072c0200000002032702000000020320053d036d05700002072e02000008a4072e020000007c057000030570000405700005057000060570000705200005072e020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000081c072e0200000044057000030570000405700005057000060570000705200005072e0200000010072e02000000020320020000000203200200000010072e020000000203200200000002032002000007cc072e0200000028057000030570000405700005057000060570000705200005072e02000000020320020000000203200200000798072e0200000774034c032003480521000305210003034c052900050316034c03190328072c020000000002000000090743036200880303270570000205210002034c0321052100030521000205290011034c0329072f020000002005290015074303620000074303620000074303620000074303620000054200050200000004034c03200743036200000521000203160319032a072c020000021c052100020521000407430362008e02057000020529000907430368010000000a64656c65676174696f6e034203420521000b034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f0200000009074303620081030327020000001a072f02000000060743035903030200000008032007430359030a074303620000034c072c020000007303200521000205210004034205210007034c0326052100030521000205290008034205700007034c03260521000205290005034c05290007034b0311052100030316033a0521000b034c0322072f02000000130743036801000000084449562062792030032702000000000316034c0316031202000000060570000603200521000305210003034205210008034c0326052100030521000205700004052900030312055000030571000205210003052100030570000405290005031205500005057100020521000305700002052100030570000403160312031205500001034c05210003034c0570000305290013034b031105500013034c02000000060570000503200521000205290015055000080521000205700002052900110570000205700003034c0346034c0350055000110571000205210003052900070743036200000790010000000c746f74616c5f737570706c790362072f020000000907430362008a01032702000000000521000405290007074303620000037703420790010000000b6765745f62616c616e63650362072f02000000090743036200890103270200000000034c052100090743036200a40105210004033a033a0322072f0200000013074303680100000008444956206279203003270200000000031605210009074303620002033a0312052100090521000a07430362008803033a033a0322072f020000001307430368010000000844495620627920300327020000000003160743036200a401034c0322072f0200000013074303680100000008444956206279203003270200000000031605210004033a05210009052100020322072f0200000013074303680100000008444956206279203003270200000000031605210005034b0311052100060570000a052100040322072f0200000013074303680100000008444956206279203003270200000000031605700007052900130312055000130571000507430362008c0305210004052100070342034205210009034c0326032005700005057000030342052100050570000305700002037a034c0570000305700002034b0311074303620000052100020319032a072c020000003b05210002034c057000030322072f02000000130743036801000000084449562062792030032702000000000316057000020529001503120550001502000000080570000205200002057100030521000405210003034c05290011034c0329072f0200000009074303620089030327020000000003210521000507430362008b03057000020316057000020342034205700007034c03260320032105700004057000020316034b031105500001052100040529000707430362000005700003034205210004037705700002037a057000040655055f0765046e000000062566726f6d5f065f096500000026046e0000000425746f5f04620000000925746f6b656e5f696404620000000725616d6f756e7400000000000000042574787300000009257472616e73666572072f0200000008074303620027032702000000000743036a0000053d0765036e055f096500000006036e0362036200000000053d096500000006036e036203620000000005700004057000050570000705420003031b057000040342031b034d0743036200000521000303160319032a072c02000000440521000405210003034205700005034c032605210003052100020570000403160312055000010571000205210005034c0570000505290013034b031105500013057100030200000006057000040320034c052100040529001505500008034c0521000405700004052900110570000305210005034c0346034c03500550001105710002052100030570000207430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700004034c03260655036e0000000e256f6e5374616b654368616e6765072f02000000090743036200b702032702000000000743036a000005700002034d053d036d034c031b034c031b02000000180570000305700004057000050570000605700007052000060200000036057000030570000405700005057000060570000705200005072e0200000010072e0200000002032002000000020320020000000203200342";

                const setLambdaOperation = aggregatorFactoryInstance.methods.setLambda(randomLambdaName, randomLambdaBytes); 
                await chai.expect(setLambdaOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%setProductLambda         - non-admin (mallory) should not be able to call this entrypoint", async() => {
            try{

                // random lambda for testing
                const randomLambdaName  = "randomLambdaName";
                const randomLambdaBytes = "050200000cba0743096500000112075e09650000005a036e036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a0362036203620362036200000000036203620760036803690000000009650000000a0362036203620362036e00000000075e09650000006c09650000000a0362036203620362036200000000036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a036203620362036203620000000003620362076003680369000000000362075e07650765036203620362036c075e076507650368036e0362036e036200000000070702000001770743075e076507650368036e0362036e020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c03200342020000010e037a034c037a07430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700002034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f02000000090743036200810303270200000000072f020000000907430362009c0203270200000000070702000000600743036200808080809d8fc0d0bff2f1b26703420200000047037a034c037a0321052900080570000205290015034b031105710002031605700002033a0322072f020000001307430368010000000844495620627920300327020000000003160707020000001a037a037a03190332072c0200000002032002000000020327034f0707020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c032000808080809d8fc0d0bff2f1b2670342020000092d037a057a000505700005037a034c07430362008f03052100020529000f0529000307430359030a034c03190325072c0200000002032702000000020320053d036d05700002072e02000008a4072e020000007c057000030570000405700005057000060570000705200005072e020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000081c072e0200000044057000030570000405700005057000060570000705200005072e0200000010072e02000000020320020000000203200200000010072e020000000203200200000002032002000007cc072e0200000028057000030570000405700005057000060570000705200005072e02000000020320020000000203200200000798072e0200000774034c032003480521000305210003034c052900050316034c03190328072c020000000002000000090743036200880303270570000205210002034c0321052100030521000205290011034c0329072f020000002005290015074303620000074303620000074303620000074303620000054200050200000004034c03200743036200000521000203160319032a072c020000021c052100020521000407430362008e02057000020529000907430368010000000a64656c65676174696f6e034203420521000b034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f0200000009074303620081030327020000001a072f02000000060743035903030200000008032007430359030a074303620000034c072c020000007303200521000205210004034205210007034c0326052100030521000205290008034205700007034c03260521000205290005034c05290007034b0311052100030316033a0521000b034c0322072f02000000130743036801000000084449562062792030032702000000000316034c0316031202000000060570000603200521000305210003034205210008034c0326052100030521000205700004052900030312055000030571000205210003052100030570000405290005031205500005057100020521000305700002052100030570000403160312031205500001034c05210003034c0570000305290013034b031105500013034c02000000060570000503200521000205290015055000080521000205700002052900110570000205700003034c0346034c0350055000110571000205210003052900070743036200000790010000000c746f74616c5f737570706c790362072f020000000907430362008a01032702000000000521000405290007074303620000037703420790010000000b6765745f62616c616e63650362072f02000000090743036200890103270200000000034c052100090743036200a40105210004033a033a0322072f0200000013074303680100000008444956206279203003270200000000031605210009074303620002033a0312052100090521000a07430362008803033a033a0322072f020000001307430368010000000844495620627920300327020000000003160743036200a401034c0322072f0200000013074303680100000008444956206279203003270200000000031605210004033a05210009052100020322072f0200000013074303680100000008444956206279203003270200000000031605210005034b0311052100060570000a052100040322072f0200000013074303680100000008444956206279203003270200000000031605700007052900130312055000130571000507430362008c0305210004052100070342034205210009034c0326032005700005057000030342052100050570000305700002037a034c0570000305700002034b0311074303620000052100020319032a072c020000003b05210002034c057000030322072f02000000130743036801000000084449562062792030032702000000000316057000020529001503120550001502000000080570000205200002057100030521000405210003034c05290011034c0329072f0200000009074303620089030327020000000003210521000507430362008b03057000020316057000020342034205700007034c03260320032105700004057000020316034b031105500001052100040529000707430362000005700003034205210004037705700002037a057000040655055f0765046e000000062566726f6d5f065f096500000026046e0000000425746f5f04620000000925746f6b656e5f696404620000000725616d6f756e7400000000000000042574787300000009257472616e73666572072f0200000008074303620027032702000000000743036a0000053d0765036e055f096500000006036e0362036200000000053d096500000006036e036203620000000005700004057000050570000705420003031b057000040342031b034d0743036200000521000303160319032a072c02000000440521000405210003034205700005034c032605210003052100020570000403160312055000010571000205210005034c0570000505290013034b031105500013057100030200000006057000040320034c052100040529001505500008034c0521000405700004052900110570000305210005034c0346034c03500550001105710002052100030570000207430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700004034c03260655036e0000000e256f6e5374616b654368616e6765072f02000000090743036200b702032702000000000743036a000005700002034d053d036d034c031b034c031b02000000180570000305700004057000050570000605700007052000060200000036057000030570000405700005057000060570000705200005072e0200000010072e0200000002032002000000020320020000000203200342";

                const setProductLambdaOperation = aggregatorFactoryInstance.methods.setProductLambda(randomLambdaName, randomLambdaBytes); 
                await chai.expect(setProductLambdaOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

    })

});
