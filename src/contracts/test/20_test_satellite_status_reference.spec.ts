import assert from "assert";
import { MVK, Utils } from "./helpers/Utils";

const chai              = require("chai");
const chaiAsPromised    = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

// ------------------------------------------------------------------------------
// Contract Address
// ------------------------------------------------------------------------------

import contractDeployments from './contractDeployments.json'

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { bob, alice, eve, mallory, trudy, oscar, susie, isaac, david, ivan } from "../scripts/sandbox/accounts";
import { compileLambdaFunction } from "../scripts/proxyLambdaFunctionMaker/proxyLambdaFunctionPacker";
import { 
    signerFactory, 
    getStorageMapValue,
    fa12Transfer,
    fa2Transfer,
    mistakenTransferFa2Token,
    updateWhitelistContracts,
    updateGeneralContracts,
    calcStakedMvkRequiredForActionApproval, 
    calcTotalVotingPower 
} from './helpers/helperFunctions'
import { mockSatelliteData, mockPackedLambdaData } from "./helpers/mockSampleData"

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("Satellite status tests", async () => {
    
    var utils: Utils;
    let tezos

    let user 
    let userSk 

    let admin 
    let adminSk 

    let councilMember
    let councilMemberSk

    let councilMemberOne
    let councilMemberOneSk

    let councilMemberTwo
    let councilMemberTwoSk

    let councilMemberThree
    let councilMemberThreeSk

    let councilMemberFour
    let councilMemberFourSk
    
    let satellite
    let satelliteOne 
    let satelliteOneSk 

    let satelliteTwo
    let satelliteTwoSk

    let satelliteThree
    let satelliteThreeSk

    let satelliteFour 
    let satelliteFourSk

    let satelliteFive

    let delegateOne 
    let delegateOneSk

    let delegateTwo
    let delegateTwoSk

    let delegateThree
    let delegateThreeSk

    let delegateFour
    let delegateFourSk

    let proposalSubmissionFeeMutez
    let currentCycleInfoRound
    let currentCycleInfoRoundString

    let doormanInstance;
    let delegationInstance;
    let mvkTokenInstance;
    let governanceInstance;
    let governanceSatelliteInstance;
    let governanceFinancialInstance;
    let aggregatorInstance;
    let councilInstance;
    let aggregatorFactoryInstance;
    let governanceProxyInstance;
    
    let doormanStorage;
    let delegationStorage;
    let mvkTokenStorage;
    let governanceStorage;
    let governanceSatelliteStorage;
    let governanceFinancialStorage;
    let aggregatorStorage;
    let councilStorage;
    let aggregatorFactoryStorage;
    let governanceProxyStorage;

    before("setup", async () => {
        try{
            utils = new Utils();
            await utils.init(bob.sk);
            tezos = utils.tezos
            
            doormanInstance                 = await utils.tezos.contract.at(contractDeployments.doorman.address);
            delegationInstance              = await utils.tezos.contract.at(contractDeployments.delegation.address);
            mvkTokenInstance                = await utils.tezos.contract.at(contractDeployments.mvkToken.address);
            governanceInstance              = await utils.tezos.contract.at(contractDeployments.governance.address);
            governanceSatelliteInstance     = await utils.tezos.contract.at(contractDeployments.governanceSatellite.address);
            aggregatorInstance              = await utils.tezos.contract.at(contractDeployments.aggregator.address);
            governanceFinancialInstance     = await utils.tezos.contract.at(contractDeployments.governanceFinancial.address);
            councilInstance                 = await utils.tezos.contract.at(contractDeployments.council.address);
            aggregatorFactoryInstance       = await utils.tezos.contract.at(contractDeployments.aggregatorFactory.address);
            governanceProxyInstance         = await utils.tezos.contract.at(contractDeployments.governanceProxy.address);
    
            doormanStorage                  = await doormanInstance.storage();
            delegationStorage               = await delegationInstance.storage();
            mvkTokenStorage                 = await mvkTokenInstance.storage();
            governanceStorage               = await governanceSatelliteInstance.storage();
            governanceSatelliteStorage      = await governanceSatelliteInstance.storage();
            aggregatorStorage               = await aggregatorInstance.storage();
            governanceFinancialStorage      = await governanceFinancialInstance.storage();
            councilStorage                  = await councilInstance.storage();
            aggregatorFactoryStorage        = await aggregatorFactoryInstance.storage();
            governanceProxyStorage          = await governanceProxyInstance.storage();
            
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')

            // -----------------------------------------------
            //
            // Council Members
            //
            // -----------------------------------------------

            councilMemberOne        = eve.pkh;
            councilMemberOneSk      = eve.sk;

            councilMemberTwo        = trudy.pkh;
            councilMemberTwoSk      = trudy.sk;

            councilMemberThree      = alice.pkh;
            councilMemberThreeSk    = alice.sk;

            councilMemberFour       = susie.pkh;
            councilMemberFourSk     = susie.sk;
            
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

            satelliteOne     = eve.pkh;
            satelliteOneSk   = eve.sk;

            satelliteTwo     = alice.pkh;
            satelliteTwoSk   = alice.sk;

            satelliteThree   = trudy.pkh;
            satelliteThreeSk = trudy.sk;

            satelliteFour   = oscar.pkh;
            satelliteFive   = susie.pkh;

            delegateOne     = david.pkh;
            delegateOneSk   = david.sk;

            delegateTwo     = ivan.pkh;
            delegateTwoSk   = ivan.sk;

            delegateThree   = isaac.pkh;
            delegateThreeSk = isaac.sk;

            delegateFour    = mallory.pkh;
            delegateFourSk  = mallory.sk;

            // ------------------------------------------------------------------
            // Update 2nd & 3rd Satellites status
            // ------------------------------------------------------------------
            
            await signerFactory(tezos, adminSk)
            var updateStatusOperation  = await delegationInstance.methods.updateSatelliteStatus(satelliteOne, "SUSPENDED").send()
            await updateStatusOperation.confirmation()

            updateStatusOperation  = await delegationInstance.methods.updateSatelliteStatus(satelliteTwo, "BANNED").send()
            await updateStatusOperation.confirmation()

            // ----------------------------------------------
            // Governance round configurations
            // ----------------------------------------------

            // set signer to admin
            await signerFactory(tezos, adminSk)

            // -------------------
            // set proposal submission fee mutez
            // -------------------

            proposalSubmissionFeeMutez   = governanceStorage.config.proposalSubmissionFeeMutez;

            // -------------------
            // set blocks per round to 0 for first cycle testing
            // -------------------

            const blocksPerRound = 0;

            let updateConfigOperation = await governanceInstance.methods.updateConfig(blocksPerRound, "configBlocksPerProposalRound").send();
            await updateConfigOperation.confirmation();

            updateConfigOperation = await governanceInstance.methods.updateConfig(blocksPerRound, "configBlocksPerVotingRound").send();
            await updateConfigOperation.confirmation();

            updateConfigOperation = await governanceInstance.methods.updateConfig(blocksPerRound, "configBlocksPerTimelockRound").send();
            await updateConfigOperation.confirmation();

            governanceStorage               = await governanceInstance.storage()
            var startNextRoundOperation = await governanceInstance.methods.startNextRound(false).send();
            await startNextRoundOperation.confirmation();
            
            // -------------------
            // generate sample mock proposal data
            // -------------------

            const delegationConfigChange  = 100;
            const doormanConfigChange     = MVK(1.5);
            const councilConfigChange     = 1234;

            const delegationLambdaFunction = await compileLambdaFunction(
                'development',
                contractDeployments.governanceProxy.address,
                
                'updateConfig',
                [
                    contractDeployments.delegation.address,
                    "delegation",
                    "ConfigMaxSatellites",
                    delegationConfigChange
                ]
            );

            const doormanLambdaFunction = await compileLambdaFunction(
                'development',
                contractDeployments.governanceProxy.address,
                
                'updateConfig',
                [
                    contractDeployments.doorman.address,
                    "doorman",
                    "ConfigMinMvkAmount",
                    doormanConfigChange
                ]
            );

            const councilLambdaFunction = await compileLambdaFunction(
                'development',
                contractDeployments.governanceProxy.address,
                
                'updateConfig',
                [
                    contractDeployments.council.address,
                    "council",
                    "ConfigActionExpiryDays",
                    councilConfigChange
                ]
            );

            mockPackedLambdaData.updateDoormanConfig    = doormanLambdaFunction;
            mockPackedLambdaData.updateDelegationConfig = delegationLambdaFunction;
            mockPackedLambdaData.updateCouncilConfig    = councilLambdaFunction;

        } catch(e) {
            console.dir(e, {depth: 5})
        }
    });

    describe("DELEGATION", async () => {

        describe("%unregisterAsSatellite", async () => {

            it('Suspended satellite should not be able to unregister as a satellite', async () => {
                try{
    
                    // Initial Values
                    delegationStorage       = await delegationInstance.storage()
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(satelliteOne)
    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");

                    // Operation
                    await signerFactory(tezos, satelliteOneSk);
                    await chai.expect(delegationInstance.methods.unregisterAsSatellite(satelliteOne).send()).to.be.rejected;

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
    
            it('Banned satellite should not be able to unregister as a satellite', async () => {
                try{
    
                    // Initial Values
                    delegationStorage       = await delegationInstance.storage()
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(satelliteTwo)

                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "BANNED");
    
                    // Operation
                    await signerFactory(tezos, satelliteTwoSk);
                    await chai.expect(delegationInstance.methods.unregisterAsSatellite(satelliteTwo).send()).to.be.rejected;
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

        })

        describe("%updateSatelliteRecord", async () => {

            it('Suspended satellite should be able to update its satellite record', async () => {
                try{
    
                    // Initial Values
                    delegationStorage               = await delegationInstance.storage()
                    const initialSatelliteRecord    = await delegationStorage.satelliteLedger.get(satelliteOne)
    
                    assert.strictEqual(initialSatelliteRecord.status, "SUSPENDED");

                    // init values
                    const updatedName           = "Test update name";
                    const updatedDescription    = "Test update description";
                    const updatedImage          = "https://imageTest.url";
                    const updatedWebsite        = "https://websiteTest.url";
                    const updatedFee            = "123"
                    
                    // Operation
                    await signerFactory(tezos, satelliteOneSk);
                    const updateSatelliteRecordOperation = await delegationInstance.methods.updateSatelliteRecord(
                        updatedName,
                        updatedDescription,
                        updatedImage,
                        updatedWebsite,
                        updatedFee
                    ).send();
                    await updateSatelliteRecordOperation.confirmation()

                    // Final values
                    delegationStorage                = await delegationInstance.storage()
                    const updatedSatelliteRecord     = await delegationStorage.satelliteLedger.get(satelliteOne)
    
                    // Assertions
                    assert.strictEqual(updatedSatelliteRecord.status,       "SUSPENDED");
                    assert.strictEqual(updatedSatelliteRecord.name,         updatedName);
                    assert.strictEqual(updatedSatelliteRecord.description,  updatedDescription);
                    assert.strictEqual(updatedSatelliteRecord.image,        updatedImage);
                    assert.strictEqual(updatedSatelliteRecord.website,      updatedWebsite);
                    assert.strictEqual(updatedSatelliteRecord.fee,          updatedFee);

                    await signerFactory(tezos, satelliteOneSk);
                    const resetOperation         = await delegationInstance.methods.updateSatelliteRecord(
                        initialSatelliteRecord.name,
                        initialSatelliteRecord.description,
                        initialSatelliteRecord.image,
                        initialSatelliteRecord.website,
                        initialSatelliteRecord.fee
                    ).send();
                    await resetOperation.confirmation()

                    // Final values
                    delegationStorage                = await delegationInstance.storage()
                    const resetSatelliteRecord       = await delegationStorage.satelliteLedger.get(satelliteOne)

                    // Assertions
                    assert.strictEqual(resetSatelliteRecord.status,       "SUSPENDED");
                    assert.strictEqual(resetSatelliteRecord.name,         initialSatelliteRecord.name);
                    assert.strictEqual(resetSatelliteRecord.description,  initialSatelliteRecord.description);
                    assert.strictEqual(resetSatelliteRecord.image,        initialSatelliteRecord.image);
                    assert.strictEqual(resetSatelliteRecord.website,      initialSatelliteRecord.website);
                    assert.strictEqual(resetSatelliteRecord.fee,          initialSatelliteRecord.fee);

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
    
            it('Banned satellite should not be able to update its satellite record', async () => {
                try{
    
                    // Initial Values
                    await signerFactory(tezos, satelliteTwoSk);
                    delegationStorage       = await delegationInstance.storage()
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(satelliteTwo)
    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "BANNED");
                    
                    // Operation
                    const updateSatelliteRecordOperation = delegationInstance.methods.updateSatelliteRecord(
                        "Updated Satellite by Eve",
                        "Updated Satellite Description - Eve",
                        "https://image.url",
                        "https://image.url",
                        "700"
                    );
                    await chai.expect(updateSatelliteRecordOperation.send()).to.be.rejected;
    
                    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

        })

    });

    describe("GOVERNANCE SATELLITE", async () => {

        describe("%suspendSatellite", async () => {

            it('Suspended satellite should not be able to suspend a satellite', async () => {
                try{
    
                    // Initial Values
                    delegationStorage       = await delegationInstance.storage()
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(satelliteOne)
    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");

                    // Operation
                    await signerFactory(tezos, satelliteOneSk);
                    const suspendSatelliteOperation = governanceSatelliteInstance.methods.suspendSatellite(satelliteThree, "Test purpose");
                    await chai.expect(suspendSatelliteOperation.send()).to.be.rejected;
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
    
            it('Banned satellite should not be able to suspend a satellite', async () => {
                try{
    
                    // Initial Values
                    delegationStorage       = await delegationInstance.storage()
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(satelliteTwo)

                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "BANNED");
    
                    // Operation
                    await signerFactory(tezos, satelliteTwoSk);
                    const suspendSatelliteOperation = governanceSatelliteInstance.methods.suspendSatellite(satelliteThree, "Test purpose");
                    await chai.expect(suspendSatelliteOperation.send()).to.be.rejected;
                    

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

        });

        describe("%restoreSatellite", async () => {

            it('Suspended satellite should not be able to restore a satellite', async () => {
                try{
    
                    // Initial Values
                    delegationStorage       = await delegationInstance.storage()
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(satelliteOne)
                    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");

                    // Operation
                    await signerFactory(tezos, satelliteOneSk);
                    const restoreSatelliteOperation = governanceSatelliteInstance.methods.restoreSatellite(
                        satelliteOne,
                        "Test purpose"
                    );
                    await chai.expect(restoreSatelliteOperation.send()).to.be.rejected;
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
    
            it('Banned satellite should not be able to restore a satellite', async () => {
                try{
    
                    // Initial Values
                    delegationStorage       = await delegationInstance.storage()
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(satelliteTwo)
    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "BANNED");

                    // Operation
                    await signerFactory(tezos, satelliteTwoSk);
                    const restoreSatelliteOperation = governanceSatelliteInstance.methods.restoreSatellite(
                        satelliteOne,
                        "Test purpose"
                    );
                    await chai.expect(restoreSatelliteOperation.send()).to.be.rejected;
    
                    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

        })

        describe("%banSatellite", async () => {

            it('Suspended satellite should not be able to ban a satellite', async () => {
                try{
    
                    // Initial Values
                    delegationStorage       = await delegationInstance.storage()
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(satelliteOne)

                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");
    
                    // Operation
                    await signerFactory(tezos, satelliteOneSk);
                    const banSatelliteOperation = governanceSatelliteInstance.methods.banSatellite(satelliteThree, "Test purpose");
                    await chai.expect(banSatelliteOperation.send()).to.be.rejected;
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
    
            it('Banned satellite should not be able to ban a satellite', async () => {
                try{
    
                    // Initial Values
                    delegationStorage       = await delegationInstance.storage()
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(satelliteTwo)

                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "BANNED");
    
                    // Operation
                    await signerFactory(tezos, satelliteTwoSk);
                    const banSatelliteOperation = governanceSatelliteInstance.methods.banSatellite(satelliteThree, "Test purpose");
                    await chai.expect(banSatelliteOperation.send()).to.be.rejected;
                    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

        })

        describe("%removeAllSatelliteOracles", async () => {

            it('Suspended satellite should not be able to remove all oracles from a satellite', async () => {
                try{
    
                    // Initial Values
                    delegationStorage       = await delegationInstance.storage()
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(satelliteOne)
    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");

                    // Operation
                    await signerFactory(tezos, satelliteOneSk);
                    const removeAllSatelliteOraclesOperation = governanceSatelliteInstance.methods.removeAllSatelliteOracles(satelliteThree, "Test purpose");
                    await chai.expect(removeAllSatelliteOraclesOperation.send()).to.be.rejected;
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
    
            it('Banned satellite should not be able to remove all oracles from a satellite', async () => {
                try{
    
                    // Initial Values
                    await signerFactory(tezos, satelliteTwoSk);
                    delegationStorage       = await delegationInstance.storage()
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(satelliteTwo)
    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "BANNED");

                    // Operation
                    await signerFactory(tezos, satelliteTwoSk);
                    const removeAllSatelliteOraclesOperation = governanceSatelliteInstance.methods.removeAllSatelliteOracles(satelliteThree, "Test purpose");
                    await chai.expect(removeAllSatelliteOraclesOperation.send()).to.be.rejected;
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

        })

        describe("%addOracleToAggregator", async () => {

            it('Suspended satellite should not be able to add an oracle to an aggregator', async () => {
                try{
    
                    // Initial Values
                    delegationStorage       = await delegationInstance.storage()
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(satelliteOne)
    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");

                    // Operation
                    await signerFactory(tezos, satelliteOneSk);
                    const addOracleToAggregatorOperation = governanceSatelliteInstance.methods.addOracleToAggregator(
                        satelliteTwo,
                        contractDeployments.aggregator.address,
                        "Test purpose"
                    );
                    await chai.expect(addOracleToAggregatorOperation.send()).to.be.rejected;
                    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
    
            it('Banned satellite should not be able to add an oracle to an aggregator', async () => {
                try{
    
                    // Initial Values
                    delegationStorage       = await delegationInstance.storage()
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(satelliteTwo)

                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "BANNED");
    
                    // Operation
                    await signerFactory(tezos, satelliteTwoSk);
                    const addOracleToAggregatorOperation = governanceSatelliteInstance.methods.addOracleToAggregator(
                        satelliteTwo,
                        contractDeployments.aggregator.address,
                        "Test purpose"
                    );
                    await chai.expect(addOracleToAggregatorOperation.send()).to.be.rejected;
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

        })

        describe("%removeOracleInAggregator", async () => {

            it('Suspended satellite should not be able to remove an oracle from an aggregator', async () => {
                try{
    
                    // Initial Values
                    delegationStorage       = await delegationInstance.storage()
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(satelliteOne)
    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");

                    // Operation
                    await signerFactory(tezos, satelliteOneSk);
                    const removeOracleInAggregatorOperation = governanceSatelliteInstance.methods.removeOracleInAggregator(
                        satelliteThree, 
                        contractDeployments.aggregator.address, 
                        "Test purpose"
                    );
                    await chai.expect(removeOracleInAggregatorOperation.send()).to.be.rejected;
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
    
            it('Banned satellite should not be able to remove an oracle from an aggregator', async () => {
                try{
    
                    // Initial Values
                    delegationStorage       = await delegationInstance.storage()
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(satelliteTwo)
    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "BANNED");

                    // Operation
                    await signerFactory(tezos, satelliteTwoSk);
                    const removeOracleInAggregatorOperation = governanceSatelliteInstance.methods.removeOracleInAggregator(
                        satelliteThree, 
                        contractDeployments.aggregator.address, 
                        "Test purpose"
                    );
                    await chai.expect(removeOracleInAggregatorOperation.send()).to.be.rejected;
    
                    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

        })

        describe("%togglePauseAggregator", async () => {

            it('Suspended satellite should not be able to update an aggregator status', async () => {
                try{
    
                    // Initial Values
                    delegationStorage       = await delegationInstance.storage()
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(satelliteOne)
    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");

                    // Operation
                    await signerFactory(tezos, satelliteOneSk);
                    const togglePauseAggregatorOperation = governanceSatelliteInstance.methods.togglePauseAggregator(
                        contractDeployments.aggregator.address, 
                        "Test purpose", 
                        "pauseAll"
                    );
                    await chai.expect(togglePauseAggregatorOperation.send()).to.be.rejected;
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
    
            it('Banned satellite should not be able to update an aggregator status', async () => {
                try{
    
                    // Initial Values
                    delegationStorage       = await delegationInstance.storage()
                    const satelliteRecord   = await delegationStorage.satelliteLedger.get(satelliteTwo)
    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "BANNED");

                    // Operation
                    await signerFactory(tezos, satelliteTwoSk);
                    const togglePauseAggregatorOperation = governanceSatelliteInstance.methods.togglePauseAggregator(
                        contractDeployments.aggregator.address, 
                        "Test purpose", 
                        "pauseAll"
                    );
                    await chai.expect(togglePauseAggregatorOperation.send()).to.be.rejected;
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

        })

        describe("%dropAction", async () => {

            before("Active satellite creates an action", async () => {
                
                try  {

                    // Initial values
                    governanceSatelliteStorage      = await governanceSatelliteInstance.storage();
                    const actionId                  = governanceSatelliteStorage.governanceSatelliteCounter.toNumber();
    
                    // Operation
                    await signerFactory(tezos, satelliteThree);
                    const togglePauseAggregatorOperation = await governanceSatelliteInstance.methods.togglePauseAggregator(
                        contractDeployments.aggregator.address, 
                        "Test purpose", 
                        "pauseAll"
                    ).send()
                    await togglePauseAggregatorOperation.confirmation()
    
                    // Final values
                    governanceSatelliteStorage      = await governanceSatelliteInstance.storage();
                    governanceStorage               = await governanceInstance.storage();
                    delegationStorage               = await delegationInstance.storage();

                    var currentCycle                = governanceStorage.cycleId;
                    
                    const firstSatelliteSnapshot    = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteOne});
                    const secondSatelliteSnapshot   = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteTwo});
                    const thirdSatelliteSnapshot    = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: satelliteThree});

                    const firstSatelliteRecord      = await delegationStorage.satelliteLedger.get(satelliteOne);
                    const secondSatelliteRecord     = await delegationStorage.satelliteLedger.get(satelliteTwo);
                    const thirdSatelliteRecord      = await delegationStorage.satelliteLedger.get(satelliteThree);
                    const action                    = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
        
                    // Assertions
                    assert.notStrictEqual(action, undefined);
                    assert.notStrictEqual(firstSatelliteSnapshot, undefined);
                    assert.notStrictEqual(secondSatelliteSnapshot, undefined);
                    assert.notStrictEqual(thirdSatelliteSnapshot, undefined);
                    
                    assert.notStrictEqual(firstSatelliteRecord.status,  "ACTIVE");
                    assert.notStrictEqual(secondSatelliteRecord.status, "ACTIVE");
                    assert.strictEqual(thirdSatelliteRecord.status,     "ACTIVE");

                } catch (e) {
                    console.dir(e, {depth: 5})
                }

            })

            it('Suspended satellite should not be able to drop an action', async () => {
                try{
    
                    // initial storage
                    delegationStorage           = await delegationInstance.storage();
                    governanceSatelliteStorage  = await governanceSatelliteInstance.storage();

                    // initial values
                    const actionId              = governanceSatelliteStorage.governanceSatelliteCounter.toNumber() - 1;
                    const satelliteRecord       = await delegationStorage.satelliteLedger.get(satelliteOne)
    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");

                    // Operation
                    await signerFactory(tezos, satelliteOneSk);
                    const dropActionOperation = governanceSatelliteInstance.methods.dropAction(actionId);
                    await chai.expect(dropActionOperation.send()).to.be.rejected;

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
    
            it('Banned satellite should not be able to drop an action', async () => {
                try{
    
                    // initial storage
                    delegationStorage           = await delegationInstance.storage();
                    governanceSatelliteStorage  = await governanceSatelliteInstance.storage();

                    // initial values
                    const actionId              = governanceSatelliteStorage.governanceSatelliteCounter.toNumber() - 1;
                    const satelliteRecord       = await delegationStorage.satelliteLedger.get(satelliteTwo)

                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "BANNED");

                    // Operation
                    await signerFactory(tezos, satelliteTwoSk);
                    const dropActionOperation = governanceSatelliteInstance.methods.dropAction(actionId);
                    await chai.expect(dropActionOperation.send()).to.be.rejected;
                    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

        })

        describe("%voteForAction", async () => {

            it('Suspended satellite should not be able to vote for an action', async () => {
                try{
    
                    // initial storage
                    delegationStorage           = await delegationInstance.storage();
                    governanceSatelliteStorage  = await governanceSatelliteInstance.storage();

                    // initial values
                    const actionId              = governanceSatelliteStorage.governanceSatelliteCounter.toNumber() - 1;
                    const satelliteRecord       = await delegationStorage.satelliteLedger.get(satelliteOne)
    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");

                    // Operation
                    await signerFactory(tezos, satelliteOneSk);
                    const voteForActionOperation = governanceSatelliteInstance.methods.voteForAction(actionId, "nay");
                    await chai.expect(voteForActionOperation.send()).to.be.rejected;

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
    
            it('Banned satellite should not be able to vote for an action', async () => {
                try{
    
                    // initial storage
                    delegationStorage           = await delegationInstance.storage();
                    governanceSatelliteStorage  = await governanceSatelliteInstance.storage();

                    // initial values
                    const actionId              = governanceSatelliteStorage.governanceSatelliteCounter.toNumber() - 1;
                    const satelliteRecord       = await delegationStorage.satelliteLedger.get(satelliteTwo)

                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "BANNED");

                    // Operation
                    await signerFactory(tezos, satelliteTwoSk);
                    const voteForActionOperation = governanceSatelliteInstance.methods.voteForAction(actionId, "nay");
                    await chai.expect(voteForActionOperation.send()).to.be.rejected;
                    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        })
    })

    describe("GOVERNANCE FINANCIAL", async () => {

        before("Create a governance financial action", async () => {
            try{

                // set council member and signer
                const councilMember = councilMemberOne;
                await signerFactory(tezos, councilMemberOneSk);

                councilStorage              = await councilInstance.storage();
                const fromTreasury          = contractDeployments.treasury.address;
                const purpose               = "For testing purposes";
                const tokenAmount           = MVK(3);
                const nextActionId          = councilStorage.actionCounter;
                
                governanceFinancialStorage  = await governanceFinancialInstance.storage();
                const financialRequestId    = governanceFinancialStorage.financialRequestCounter; 

                // Operation
                const councilActionOperation = await councilInstance.methods.councilActionRequestMint(
                    fromTreasury,
                    tokenAmount,
                    purpose).send();
                await councilActionOperation.confirmation();

                // Final values
                councilStorage              = await councilInstance.storage();
                var action                  = await councilStorage.councilActionsLedger.get(nextActionId);
                var actionSigner            = action.signers.includes(councilMember)
                var dataMap                 = await action.dataMap;
                const packedTreasuryAddress = (await utils.tezos.rpc.packData({ data: { string: fromTreasury }, type: { prim: 'address' } })).packed
                const packedPurpose         = (await utils.tezos.rpc.packData({ data: { string: purpose }, type: { prim: 'string' } })).packed
                const packedTokenAmount     = (await utils.tezos.rpc.packData({ data: { int: tokenAmount.toString() }, type: { prim: 'nat' } })).packed

                // Assertions
                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "PENDING");
                assert.strictEqual(action.actionType, "requestMint");
                assert.equal(action.executed, false);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 1);
                assert.equal(dataMap.get("treasuryAddress"), packedTreasuryAddress);
                assert.equal(dataMap.get("purpose"), packedPurpose);
                assert.equal(dataMap.get("tokenAmount"), packedTokenAmount);

                // set signer as council member two
                await signerFactory(tezos, councilMemberTwoSk)
                let signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // set signer as council member three
                await signerFactory(tezos, councilMemberThreeSk)
                signActionOperation = await councilInstance.methods.signAction(nextActionId).send();
                await signActionOperation.confirmation();

                // Final values
                councilStorage      = await councilInstance.storage();
                action              = await councilStorage.councilActionsLedger.get(nextActionId);
                actionSigner        = action.signers.includes(councilMember)
                dataMap             = await action.dataMap;

                assert.strictEqual(action.initiator, councilMember);
                assert.strictEqual(action.status, "EXECUTED");
                assert.strictEqual(action.actionType, "requestMint");
                assert.equal(action.executed, true);
                assert.equal(actionSigner, true);
                assert.equal(action.signersCount, 3);
                assert.equal(dataMap.get("treasuryAddress"), packedTreasuryAddress);
                assert.equal(dataMap.get("purpose"), packedPurpose);
                assert.equal(dataMap.get("tokenAmount"), packedTokenAmount);
                
                // check that financial governance request now exists
                governanceFinancialStorage      = await governanceFinancialInstance.storage();
                const financialRequest          = await governanceFinancialStorage.financialRequestLedger.get(financialRequestId)
                assert.notStrictEqual(financialRequest, undefined);

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        describe("%voteForRequest", async () => {

            it('Suspended satellite should not be able to vote for a financial governance request', async () => {
                try{
    
                    // initial storage
                    delegationStorage           = await delegationInstance.storage();
                    governanceSatelliteStorage  = await governanceSatelliteInstance.storage();

                    // initial values
                    const requestId             = governanceFinancialStorage.financialRequestCounter.toNumber() - 1;
                    const satelliteRecord       = await delegationStorage.satelliteLedger.get(satelliteOne)
    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");

                    // Operation
                    await signerFactory(tezos, satelliteOneSk);
                    const voteForRequestOperation =  governanceFinancialInstance.methods.voteForRequest(requestId, "nay");
                    await chai.expect(voteForRequestOperation.send()).to.be.rejected;
                    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('Banned satellite should not be able to vote for a financial governance request', async () => {
                try{
    
                    // initial storage
                    delegationStorage           = await delegationInstance.storage();
                    governanceSatelliteStorage  = await governanceSatelliteInstance.storage();

                    // initial values
                    const requestId             = governanceFinancialStorage.financialRequestCounter.toNumber() - 1;
                    const satelliteRecord       = await delegationStorage.satelliteLedger.get(satelliteTwo)

                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "BANNED");

                    // Operation
                    await signerFactory(tezos, satelliteTwoSk);
                    const voteForRequestOperation =  governanceFinancialInstance.methods.voteForRequest(requestId, "nay");
                    await chai.expect(voteForRequestOperation.send()).to.be.rejected;
                    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        })
    })

    describe("AGGREGATOR", async () => {

        before("Admin initialize the aggregator contract", async () => {
            try{
                // Initial values
                await signerFactory(tezos, adminSk)
                aggregatorStorage   = await aggregatorInstance.storage()

                // Operation
                var addOracleOperation          = await aggregatorInstance.methods.addOracle(
                    satelliteOne, 
                    mockSatelliteData.eve.oraclePublicKey, 
                    mockSatelliteData.eve.oraclePeerId
                ).send();
                await addOracleOperation.confirmation();

                addOracleOperation              = await aggregatorInstance.methods.addOracle(
                    satelliteTwo, 
                    mockSatelliteData.alice.oraclePublicKey, 
                    mockSatelliteData.alice.oraclePeerId
                ).send();
                await addOracleOperation.confirmation();

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        describe("%withdrawRewardXtz", async () => {

            before("Update the tracked aggregators on the aggregator factory", async () => {
                try{
                    
                    // Initial values
                    await signerFactory(tezos, adminSk)

                    // Operation
                    const trackOperation   = await aggregatorFactoryInstance.methods.trackAggregator(contractDeployments.aggregator.address).send()
                    await trackOperation.confirmation()

                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            })

            it('Suspended satellite should not be able to withdraw XTZ rewards', async () => {
                try{
                    
                    // Initial Values
                    delegationStorage               = await delegationInstance.storage();
                    aggregatorStorage               = await aggregatorInstance.storage()
                    const satelliteRecord           = await delegationStorage.satelliteLedger.get(satelliteOne);
                    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");

                    // Operation
                    await signerFactory(tezos, satelliteOneSk);
                    const withdrawRewardXtzOperation = aggregatorInstance.methods.withdrawRewardXtz(satelliteOne);
                    await chai.expect(withdrawRewardXtzOperation.send()).to.be.rejected;

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('Banned satellite should not be able to withdraw XTZ rewards', async () => {
                try{
                    
                    // Initial Values
                    delegationStorage               = await delegationInstance.storage();
                    aggregatorStorage               = await aggregatorInstance.storage()
                    const satelliteRecord           = await delegationStorage.satelliteLedger.get(satelliteTwo)
                    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "BANNED");

                    // Operation
                    await signerFactory(tezos, satelliteTwoSk);
                    const withdrawRewardXtzOperation = aggregatorInstance.methods.withdrawRewardXtz(satelliteTwo);
                    await chai.expect(withdrawRewardXtzOperation.send()).to.be.rejected;
                    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        })

        describe("%withdrawRewardSmvk", async () => {

            it('Suspended satellite should not be able to withdraw SMVK rewards', async () => {
                try{
                    // Initial Values
                    delegationStorage               = await delegationInstance.storage();
                    aggregatorStorage               = await aggregatorInstance.storage()
                    const satelliteRecord           = await delegationStorage.satelliteLedger.get(satelliteOne);
                    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");

                    // Operation
                    await signerFactory(tezos, satelliteOneSk);
                    const withdrawRewardStakedMvkOperation = aggregatorInstance.methods.withdrawRewardStakedMvk(satelliteOne);
                    await chai.expect(withdrawRewardStakedMvkOperation.send()).to.be.rejected;
    
                    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('Banned satellite should not be able to withdraw SMVK rewards', async () => {
                try{
                    // Initial Values
                    delegationStorage               = await delegationInstance.storage();
                    aggregatorStorage               = await aggregatorInstance.storage()
                    const satelliteRecord           = await delegationStorage.satelliteLedger.get(satelliteTwo)
                    
                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "BANNED");

                    // Operation
                    await signerFactory(tezos, satelliteTwoSk);
                    const withdrawRewardStakedMvkOperation = aggregatorInstance.methods.withdrawRewardStakedMvk(satelliteTwo);
                    await chai.expect(withdrawRewardStakedMvkOperation.send()).to.be.rejected;

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        })
    })

    describe("GOVERNANCE", async () => {

        describe("%propose", async () => {

            it('Suspended satellite should not be able to propose', async () => {
                try{
                    
                    // Initial Values
                    delegationStorage               = await delegationInstance.storage();
                    governanceStorage               = await governanceInstance.storage()

                    // check round operation
                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();

                        governanceStorage               = await governanceInstance.storage();
                        currentCycleInfoRound           = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString     = Object.keys(currentCycleInfoRound)[0]
                    }
                    
                    // Check satellite statues
                    const satelliteRecord           = await delegationStorage.satelliteLedger.get(satelliteOne);
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");

                    // init sample proposal params
                    const proposalName              = "Quorum test";
                    const proposalDesc              = "Details about new proposal";
                    const proposalIpfs              = "ipfs://QM123456789";
                    const proposalSourceCode        = "Proposal Source Code";

                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "ActionExpiryDays#1",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
                                codeDescription: ""
                            }
                        }
                    ]
                    
                    // Propose Operation
                    await signerFactory(tezos, satelliteOneSk);
                    const proposeOperation = await governanceInstance.methods.propose(
                        proposalName, 
                        proposalDesc, 
                        proposalIpfs, 
                        proposalSourceCode, 
                        proposalData
                    );
                    await chai.expect(proposeOperation.send({amount: proposalSubmissionFeeMutez, mutez: true})).to.be.rejected;
                    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('Banned satellite should not be able to propose', async () => {
                try{
                    
                    // Initial Values
                    delegationStorage               = await delegationInstance.storage();
                    governanceStorage               = await governanceInstance.storage()

                    // check round operation
                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();

                        governanceStorage               = await governanceInstance.storage();
                        currentCycleInfoRound           = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString     = Object.keys(currentCycleInfoRound)[0]
                    }
                    
                    // init sample proposal params
                    const satelliteRecord           = await delegationStorage.satelliteLedger.get(satelliteTwo);
                    assert.strictEqual(satelliteRecord.status, "BANNED");

                    // init sample proposal params
                    const proposalName              = "Test test";
                    const proposalDesc              = "Details about new proposal";
                    const proposalIpfs              = "ipfs://QM123456789";
                    const proposalSourceCode        = "Proposal Source Code";

                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "ActionExpiryDays#1",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
                                codeDescription: ""
                            }
                        }
                    ]
                    
                    // Propose Operation
                    await signerFactory(tezos, satelliteTwoSk);
                    const proposeOperation = await governanceInstance.methods.propose(
                        proposalName, 
                        proposalDesc, 
                        proposalIpfs, 
                        proposalSourceCode, 
                        proposalData
                    );
                    await chai.expect(proposeOperation.send({amount: proposalSubmissionFeeMutez, mutez: true})).to.be.rejected;
                    
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        })

        describe("%updateProposalData", async () => {

            beforeEach("Admin restores and restores satellites so they can make a proposal", async () => {
                try{
                    // Initial values
                    await signerFactory(tezos, adminSk)
    
                    // Operation
                    var updateStatusOperation   = await delegationInstance.methods.updateSatelliteStatus(satelliteOne, "ACTIVE").send()
                    await updateStatusOperation.confirmation()
                    
                    updateStatusOperation       = await delegationInstance.methods.updateSatelliteStatus(satelliteTwo, "ACTIVE").send()
                    await updateStatusOperation.confirmation()

                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            })

            it('Suspended satellite should not be update proposal data', async () => {
                try{
                    
                    // initial storage
                    delegationStorage               = await delegationInstance.storage();
                    governanceStorage               = await governanceInstance.storage()

                    // check round operation
                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();

                        governanceStorage               = await governanceInstance.storage();
                        currentCycleInfoRound           = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString     = Object.keys(currentCycleInfoRound)[0]
                    }

                    // check satellite status - should be active in order to make a proposal first
                    const initialSatelliteRecord           = await delegationStorage.satelliteLedger.get(satelliteOne);
                    assert.strictEqual(initialSatelliteRecord.status, "ACTIVE");

                    const proposalName              = "Quorum test";
                    const proposalDesc              = "Details about new proposal";
                    const proposalIpfs              = "ipfs://QM123456789";
                    const proposalSourceCode        = "Proposal Source Code";
                    const proposalId                = governanceStorage.nextProposalId.toNumber();
                    
                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "Metadata#2",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
                                codeDescription: ""
                            }
                        }
                    ]

                    // propose operation by satellite
                    await signerFactory(tezos, satelliteOneSk);
                    const proposeOperation = await governanceInstance.methods.propose(
                        proposalName, 
                        proposalDesc, 
                        proposalIpfs, 
                        proposalSourceCode, 
                        proposalData
                    ).send({amount: proposalSubmissionFeeMutez, mutez: true});
                    await proposeOperation.confirmation();

                    // Admin - set satellite status to SUSPENDED
                    await signerFactory(tezos, adminSk)
                    var updateStatusOperation   = await delegationInstance.methods.updateSatelliteStatus(satelliteOne, "SUSPENDED").send()
                    await updateStatusOperation.confirmation()

                    // Check satellite is now suspended
                    delegationStorage               = await delegationInstance.storage();
                    const satelliteRecord           = await delegationStorage.satelliteLedger.get(satelliteOne);
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");

                    // should fail: update proposal data by satellite
                    await signerFactory(tezos, satelliteOneSk)
                    const updateProposalDataOperation = governanceInstance.methods.updateProposalData(proposalId, proposalData);
                    await chai.expect(updateProposalDataOperation.send()).to.be.rejected;
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('Suspended satellite should not be able to update payment data', async () => {
                try{

                    // initial storage
                    delegationStorage               = await delegationInstance.storage();
                    governanceStorage               = await governanceInstance.storage()

                    // check round operation
                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();

                        governanceStorage               = await governanceInstance.storage();
                        currentCycleInfoRound           = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString     = Object.keys(currentCycleInfoRound)[0]
                    }

                    // check satellite status - should be active in order to make a proposal first
                    const initialSatelliteRecord           = await delegationStorage.satelliteLedger.get(satelliteOne);
                    assert.strictEqual(initialSatelliteRecord.status, "ACTIVE");

                    const proposalName              = "Quorum test";
                    const proposalDesc              = "Details about new proposal";
                    const proposalIpfs              = "ipfs://QM123456789";
                    const proposalSourceCode        = "Proposal Source Code";
                    const proposalId                = governanceStorage.nextProposalId.toNumber();
                    
                    const paymentData               = [
                        {
                            addOrSetPaymentData: {
                                title: "Payment#1",
                                transaction: {
                                    "to_"    : bob.pkh,
                                    "token"  : {
                                        "fa2" : {
                                            "tokenContractAddress" : contractDeployments.mvkToken.address,
                                            "tokenId" : 0
                                        }
                                    },
                                    "amount" : MVK(50)
                                }
                            }
                        }
                    ]

                    // propose operation by satellite
                    await signerFactory(tezos, satelliteOneSk);
                    const proposeOperation = await governanceInstance.methods.propose(
                        proposalName, 
                        proposalDesc, 
                        proposalIpfs, 
                        proposalSourceCode, 
                    ).send({amount: proposalSubmissionFeeMutez, mutez: true});
                    await proposeOperation.confirmation();

                    // Admin - set satellite status to SUSPENDED
                    await signerFactory(tezos, adminSk)
                    var updateStatusOperation   = await delegationInstance.methods.updateSatelliteStatus(satelliteOne, "SUSPENDED").send()
                    await updateStatusOperation.confirmation()

                    // Check satellite is now suspended
                    delegationStorage               = await delegationInstance.storage();
                    const satelliteRecord           = await delegationStorage.satelliteLedger.get(satelliteOne);
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");

                    // should fail: update payment data by satellite
                    await signerFactory(tezos, satelliteOneSk)
                    const updatePaymentDataOperation = governanceInstance.methods.updateProposalData(proposalId, null, paymentData);
                    await chai.expect(updatePaymentDataOperation.send()).to.be.rejected;
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('Banned satellite should not be able to update proposal data', async () => {
                try{
                    
                    // initial storage
                    delegationStorage               = await delegationInstance.storage();
                    governanceStorage               = await governanceInstance.storage()

                    // check round operation
                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();

                        governanceStorage               = await governanceInstance.storage();
                        currentCycleInfoRound           = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString     = Object.keys(currentCycleInfoRound)[0]
                    }

                    // check satellite status - should be active in order to make a proposal first
                    const initialSatelliteRecord           = await delegationStorage.satelliteLedger.get(satelliteTwo);
                    assert.strictEqual(initialSatelliteRecord.status, "ACTIVE");

                    const proposalName              = "Quorum test";
                    const proposalDesc              = "Details about new proposal";
                    const proposalIpfs              = "ipfs://QM123456789";
                    const proposalSourceCode        = "Proposal Source Code";
                    const proposalId                = governanceStorage.nextProposalId.toNumber();
                    
                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "Metadata#2",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
                                codeDescription: ""
                            }
                        }
                    ]

                    await signerFactory(tezos, satelliteTwoSk);
                    const proposeOperation = await governanceInstance.methods.propose(
                        proposalName, 
                        proposalDesc, 
                        proposalIpfs, 
                        proposalSourceCode, 
                        proposalData
                    ).send({amount: proposalSubmissionFeeMutez, mutez: true});
                    await proposeOperation.confirmation();

                    // Admin - set satellite status to Banned
                    await signerFactory(tezos, adminSk)
                    var updateStatusOperation   = await delegationInstance.methods.updateSatelliteStatus(satelliteTwo, "BANNED").send()
                    await updateStatusOperation.confirmation()

                    // Check satellite is now banned
                    delegationStorage               = await delegationInstance.storage();
                    const satelliteRecord           = await delegationStorage.satelliteLedger.get(satelliteTwo);
                    assert.strictEqual(satelliteRecord.status, "BANNED");

                    // should fail: update proposal data by satellite
                    await signerFactory(tezos, satelliteTwoSk)
                    const updateProposalDataOperation = governanceInstance.methods.updateProposalData(proposalId, proposalData);
                    await chai.expect(updateProposalDataOperation.send()).to.be.rejected;
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('Banned satellite should not be able to update payment data', async () => {
                try{
                    
                    // initial storage
                    delegationStorage               = await delegationInstance.storage();
                    governanceStorage               = await governanceInstance.storage()

                    // check round operation
                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();

                        governanceStorage               = await governanceInstance.storage();
                        currentCycleInfoRound           = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString     = Object.keys(currentCycleInfoRound)[0]
                    }

                    // check satellite status - should be active in order to make a proposal first
                    const initialSatelliteRecord           = await delegationStorage.satelliteLedger.get(satelliteTwo);
                    assert.strictEqual(initialSatelliteRecord.status, "ACTIVE");

                    const proposalName              = "Quorum test";
                    const proposalDesc              = "Details about new proposal";
                    const proposalIpfs              = "ipfs://QM123456789";
                    const proposalSourceCode        = "Proposal Source Code";
                    const proposalId                = governanceStorage.nextProposalId.toNumber();

                    const paymentData        = [
                        {
                            addOrSetPaymentData: {
                                title: "Payment#1",
                                transaction: {
                                    "to_"    : bob.pkh,
                                    "token"  : {
                                        "fa2" : {
                                            "tokenContractAddress" : contractDeployments.mvkToken.address,
                                            "tokenId" : 0
                                        }
                                    },
                                    "amount" : MVK(50)
                                }
                            }
                        }
                    ]

                    await signerFactory(tezos, satelliteTwoSk);
                    const proposeOperation = await governanceInstance.methods.propose(
                        proposalName, 
                        proposalDesc, 
                        proposalIpfs, 
                        proposalSourceCode
                    ).send({amount: proposalSubmissionFeeMutez, mutez: true});
                    await proposeOperation.confirmation();

                    // Admin - set satellite status to Banned
                    await signerFactory(tezos, adminSk)
                    var updateStatusOperation   = await delegationInstance.methods.updateSatelliteStatus(satelliteTwo, "BANNED").send()
                    await updateStatusOperation.confirmation()

                    // Check satellite is now banned
                    delegationStorage               = await delegationInstance.storage();
                    const satelliteRecord           = await delegationStorage.satelliteLedger.get(satelliteTwo);
                    assert.strictEqual(satelliteRecord.status, "BANNED");

                    // should fail: update payment data by satellite
                    await signerFactory(tezos, satelliteTwoSk)
                    const updatePaymentDataOperation = governanceInstance.methods.updateProposalData(proposalId, null, paymentData);
                    await chai.expect(updatePaymentDataOperation.send()).to.be.rejected;

    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        })

        describe("%lockProposal", async () => {

            beforeEach("Admin restores and restores satellites so they can propose", async () => {
                try{
                    // Initial values
                    await signerFactory(tezos, adminSk)
    
                    // Operation
                    var updateStatusOperation   = await delegationInstance.methods.updateSatelliteStatus(satelliteOne, "ACTIVE").send()
                    await updateStatusOperation.confirmation()

                    updateStatusOperation       = await delegationInstance.methods.updateSatelliteStatus(satelliteTwo, "ACTIVE").send()
                    await updateStatusOperation.confirmation()

                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            })

            it('Suspended satellite should not be able to lock a proposal', async () => {
                try{
                    
                    // initial storage
                    delegationStorage               = await delegationInstance.storage();
                    governanceStorage               = await governanceInstance.storage()

                    // check round operation
                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();

                        governanceStorage               = await governanceInstance.storage();
                        currentCycleInfoRound           = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString     = Object.keys(currentCycleInfoRound)[0]
                    }

                    // check satellite status - should be active in order to make a proposal first
                    const initialSatelliteRecord           = await delegationStorage.satelliteLedger.get(satelliteOne);
                    assert.strictEqual(initialSatelliteRecord.status, "ACTIVE");

                    const proposalName              = "Quorum test";
                    const proposalDesc              = "Details about new proposal";
                    const proposalIpfs              = "ipfs://QM123456789";
                    const proposalSourceCode        = "Proposal Source Code";
                    const proposalId                = governanceStorage.nextProposalId.toNumber();
                    
                    // propose operation by satellite
                    await signerFactory(tezos, satelliteOneSk);
                    const proposeOperation = await governanceInstance.methods.propose(
                        proposalName, 
                        proposalDesc, 
                        proposalIpfs, 
                        proposalSourceCode
                    ).send({amount: proposalSubmissionFeeMutez, mutez: true});
                    await proposeOperation.confirmation();

                    // Admin - set satellite status to SUSPENDED
                    await signerFactory(tezos, adminSk)
                    const updateStatusOperation = await delegationInstance.methods.updateSatelliteStatus(satelliteOne, "SUSPENDED").send()
                    await updateStatusOperation.confirmation()

                    // Check satellite is now suspended
                    delegationStorage               = await delegationInstance.storage();
                    const satelliteRecord           = await delegationStorage.satelliteLedger.get(satelliteOne);
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");

                    // should fail: lock proposal by satellite
                    await signerFactory(tezos, satelliteOneSk)
                    const lockProposalOperation = governanceInstance.methods.lockProposal(proposalId);
                    await chai.expect(lockProposalOperation.send()).to.be.rejected;
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('Banned satellite should not be able to lock a proposal', async () => {
                try{
                    
                    // initial storage
                    delegationStorage               = await delegationInstance.storage();
                    governanceStorage               = await governanceInstance.storage()

                    // check round operation
                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();

                        governanceStorage               = await governanceInstance.storage();
                        currentCycleInfoRound           = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString     = Object.keys(currentCycleInfoRound)[0]
                    }

                    // check satellite status - should be active in order to make a proposal first
                    const initialSatelliteRecord           = await delegationStorage.satelliteLedger.get(satelliteTwo);
                    assert.strictEqual(initialSatelliteRecord.status, "ACTIVE");

                    const proposalName              = "Quorum test";
                    const proposalDesc              = "Details about new proposal";
                    const proposalIpfs              = "ipfs://QM123456789";
                    const proposalSourceCode        = "Proposal Source Code";
                    const proposalId                = governanceStorage.nextProposalId.toNumber();

                    await signerFactory(tezos, satelliteTwoSk);
                    const proposeOperation = await governanceInstance.methods.propose(
                        proposalName, 
                        proposalDesc, 
                        proposalIpfs, 
                        proposalSourceCode
                    ).send({amount: proposalSubmissionFeeMutez, mutez: true});
                    await proposeOperation.confirmation();

                    // Admin - set satellite status to Banned
                    await signerFactory(tezos, adminSk)
                    const updateStatusOperation = await delegationInstance.methods.updateSatelliteStatus(satelliteTwo, "BANNED").send()
                    await updateStatusOperation.confirmation()

                    // Check satellite is now banned
                    delegationStorage               = await delegationInstance.storage();
                    const satelliteRecord           = await delegationStorage.satelliteLedger.get(satelliteTwo);
                    assert.strictEqual(satelliteRecord.status, "BANNED");

                    // should fail: lock proposal by satellite
                    await signerFactory(tezos, satelliteTwoSk)
                    const lockProposalOperation = governanceInstance.methods.lockProposal(proposalId);
                    await chai.expect(lockProposalOperation.send()).to.be.rejected;
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        })

        describe("%proposalRoundVote", async () => {

            it('Suspended satellite should not be able to vote for a proposal during the proposal round', async () => {
                try{
                    
                    // initial storage
                    delegationStorage               = await delegationInstance.storage();
                    governanceStorage               = await governanceInstance.storage()

                    // check round operation
                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();

                        governanceStorage               = await governanceInstance.storage();
                        currentCycleInfoRound           = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString     = Object.keys(currentCycleInfoRound)[0]
                    }

                    // check satellite status - should be suspended
                    const initialSatelliteRecord           = await delegationStorage.satelliteLedger.get(satelliteOne);
                    assert.strictEqual(initialSatelliteRecord.status, "SUSPENDED");

                    // create proposal params
                    const proposalName              = "Quorum test";
                    const proposalDesc              = "Details about new proposal";
                    const proposalIpfs              = "ipfs://QM123456789";
                    const proposalSourceCode        = "Proposal Source Code";
                    const proposalId                = governanceStorage.nextProposalId.toNumber();

                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "ActionExpiryDays#1",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
                                codeDescription: ""
                            }
                        }
                    ]

                    // create proposal by SATELLITE THREE
                    await signerFactory(tezos, satelliteThreeSk);
                    const proposeOperation = await governanceInstance.methods.propose(
                        proposalName, 
                        proposalDesc, 
                        proposalIpfs, 
                        proposalSourceCode,
                        proposalData
                    ).send({amount: proposalSubmissionFeeMutez, mutez: true});
                    await proposeOperation.confirmation();
                
                    const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                    await lockOperation.confirmation();

                    // should fail: SATELLITE ONE should not be able to vote
                    await signerFactory(tezos, satelliteOneSk);
                    const proposalRoundVoteOperation = governanceInstance.methods.proposalRoundVote(proposalId);
                    await chai.expect(proposalRoundVoteOperation.send()).to.be.rejected;
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('Banned satellite should not be able to vote for a proposal during the proposal round', async () => {
                try{
                    
                    // initial storage
                    delegationStorage               = await delegationInstance.storage();
                    governanceStorage               = await governanceInstance.storage()

                    // check round operation
                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();

                        governanceStorage               = await governanceInstance.storage();
                        currentCycleInfoRound           = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString     = Object.keys(currentCycleInfoRound)[0]
                    }

                    // check satellite status - should be banned
                    const initialSatelliteRecord           = await delegationStorage.satelliteLedger.get(satelliteTwo);
                    assert.strictEqual(initialSatelliteRecord.status, "BANNED");

                    // create proposal params
                    const proposalName              = "Quorum test";
                    const proposalDesc              = "Details about new proposal";
                    const proposalIpfs              = "ipfs://QM123456789";
                    const proposalSourceCode        = "Proposal Source Code";
                    const proposalId                = governanceStorage.nextProposalId.toNumber();

                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "ActionExpiryDays#1",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
                                codeDescription: ""
                            }
                        }
                    ]
                    
                    // create proposal by SATELLITE THREE
                    const proposeOperation = await governanceInstance.methods.propose(
                        proposalName, 
                        proposalDesc, 
                        proposalIpfs, 
                        proposalSourceCode,
                        proposalData
                    ).send({amount: proposalSubmissionFeeMutez, mutez: true});
                    await proposeOperation.confirmation();
                
                    const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                    await lockOperation.confirmation();

                    // should fail: SATELLITE TWO should not be able to vote
                    await signerFactory(tezos, satelliteTwoSk)
                    const proposalRoundVoteOperation = governanceInstance.methods.proposalRoundVote(proposalId);
                    await chai.expect(proposalRoundVoteOperation.send()).to.be.rejected;
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        })

        describe("%votingRoundVote", async () => {

            it('Suspended satellite should not be able to vote for a proposal during the voting round', async () => {
                try{
                    
                    // initial storage
                    delegationStorage               = await delegationInstance.storage();
                    governanceStorage               = await governanceInstance.storage()

                    // check round operation
                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();

                        governanceStorage               = await governanceInstance.storage();
                        currentCycleInfoRound           = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString     = Object.keys(currentCycleInfoRound)[0]
                    }

                    // check satellite status - should be suspended
                    const initialSatelliteRecord           = await delegationStorage.satelliteLedger.get(satelliteOne);
                    assert.strictEqual(initialSatelliteRecord.status, "SUSPENDED");

                    // create proposal params
                    const proposalName              = "Quorum test";
                    const proposalDesc              = "Details about new proposal";
                    const proposalIpfs              = "ipfs://QM123456789";
                    const proposalSourceCode        = "Proposal Source Code";
                    const proposalId                = governanceStorage.nextProposalId.toNumber();

                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "ActionExpiryDays#1",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
                                codeDescription: ""
                            }
                        }
                    ]
                    
                    // create proposal by SATELLITE THREE
                    await signerFactory(tezos, satelliteThreeSk);
                    const proposeOperation = await governanceInstance.methods.propose(
                        proposalName, 
                        proposalDesc, 
                        proposalIpfs, 
                        proposalSourceCode,
                        proposalData
                    ).send({amount: proposalSubmissionFeeMutez, mutez: true});
                    await proposeOperation.confirmation();
                
                    const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                    await lockOperation.confirmation();

                    var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                    await voteOperation.confirmation();
    
                    // Set signer to satellite four 
                    await signerFactory(tezos, satelliteFourSk);
                    voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                    await voteOperation.confirmation();

                    const nextRoundOperation    = await governanceInstance.methods.startNextRound().send();
                    await nextRoundOperation.confirmation();

                    // Set signer back to suspended satellite 
                    await signerFactory(tezos, satelliteOneSk)
                    const votingRoundVoteOperation = governanceInstance.methods.votingRoundVote("nay");
                    await chai.expect(votingRoundVoteOperation.send()).to.be.rejected;
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('Banned satellite should not be able to vote for a proposal during the voting round', async () => {
                try{
                    // initial storage
                    delegationStorage               = await delegationInstance.storage();
                    governanceStorage               = await governanceInstance.storage()

                    // check round operation
                    while(governanceStorage.currentCycleInfo.cycleEndLevel == 0 || currentCycleInfoRoundString !== "proposal"){
                        var startNextRoundOperation = await governanceInstance.methods.startNextRound(true).send();
                        await startNextRoundOperation.confirmation();

                        governanceStorage               = await governanceInstance.storage();
                        currentCycleInfoRound           = governanceStorage.currentCycleInfo.round
                        currentCycleInfoRoundString     = Object.keys(currentCycleInfoRound)[0]
                    }

                    // check satellite status - should be banned
                    const initialSatelliteRecord           = await delegationStorage.satelliteLedger.get(satelliteTwo);
                    assert.strictEqual(initialSatelliteRecord.status, "BANNED");

                    // create proposal params
                    const proposalName              = "Quorum test";
                    const proposalDesc              = "Details about new proposal";
                    const proposalIpfs              = "ipfs://QM123456789";
                    const proposalSourceCode        = "Proposal Source Code";
                    const proposalId                = governanceStorage.nextProposalId.toNumber();

                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "ActionExpiryDays#1",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
                                codeDescription: ""
                            }
                        }
                    ]
                    
                    // create proposal by SATELLITE THREE
                    await signerFactory(tezos, satelliteThreeSk);
                    const proposeOperation = await governanceInstance.methods.propose(
                        proposalName, 
                        proposalDesc, 
                        proposalIpfs, 
                        proposalSourceCode,
                        proposalData
                    ).send({amount: proposalSubmissionFeeMutez, mutez: true});
                    await proposeOperation.confirmation();

                    const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                    await lockOperation.confirmation();

                    var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                    await voteOperation.confirmation();
                    await signerFactory(tezos, adminSk);
    
                    // Set signer to satellite four 
                    await signerFactory(tezos, satelliteFourSk);
                    voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                    await voteOperation.confirmation();

                    const nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                    await nextRoundOperation.confirmation();

                    // Set signer back to banned satellite 
                    await signerFactory(tezos, satelliteTwoSk)
                    const votingRoundVoteOperation = governanceInstance.methods.votingRoundVote("nay");
                    await chai.expect(votingRoundVoteOperation.send()).to.be.rejected;
    
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        })

        describe("%processProposalPayment", async () => {

            beforeEach("Admin restores and restores satellites so they can propose and set council admin to governance proxy", async () => {
                try{
                    // Initial values
                    await signerFactory(tezos, adminSk)
    
                    // Operation
                    var updateStatusOperation   = await delegationInstance.methods.updateSatelliteStatus(satelliteOne, "ACTIVE").send()
                    await updateStatusOperation.confirmation()

                    updateStatusOperation       = await delegationInstance.methods.updateSatelliteStatus(satelliteTwo, "ACTIVE").send()
                    await updateStatusOperation.confirmation()
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            })

            before("Admin set council admin to governance proxy", async () => {
                try{
                    // Initial values
                    await signerFactory(tezos, adminSk)
    
                    // Operation
                    const setAdminOperation     = await councilInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send()
                    await setAdminOperation.confirmation()

                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            })

            it('Suspended satellite should not be able to process proposal payment', async () => {
                try{
                    // Initial Values
                    await signerFactory(tezos, satelliteOneSk);
                    governanceStorage               = await governanceInstance.storage()
                    const proposalName              = "Quorum test";
                    const proposalDesc              = "Details about new proposal";
                    const proposalIpfs              = "ipfs://QM123456789";
                    const proposalSourceCode        = "Proposal Source Code";
                    const proposalId                = governanceStorage.nextProposalId.toNumber();
                    const proposalPaymentData       = [
                        {
                            addOrSetPaymentData: {
                                title: "Payment#0",
                                transaction: {
                                    "to_"    : bob.pkh,
                                    "token"  : {
                                        "fa2" : {
                                            "tokenContractAddress" : contractDeployments.mvkToken.address,
                                            "tokenId" : 0
                                        }
                                    },
                                    "amount" : MVK(50)
                                }
                            }
                        },
                        {
                            addOrSetPaymentData: {
                                title: "Payment#0",
                                transaction: {
                                    "to_"    : satelliteTwo,
                                    "token"  : {
                                        "fa2" : {
                                            "tokenContractAddress" : contractDeployments.mvkToken.address,
                                            "tokenId" : 0
                                        }
                                    },
                                    "amount" : MVK(50)
                                }
                            }
                        }
                    ]
                    
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.council.address,
                            "council",
                            "ConfigActionExpiryDays",
                            1234
                        ]
                    );

                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "ActionExpiryDays#1",
                                encodedCode: lambdaFunction,
                                codeDescription: ""
                            }
                        }
                    ]

                    // Operation
                    var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                    await nextRoundOperation.confirmation();


                    const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData, proposalPaymentData).send({amount: 1});
                    await proposeOperation.confirmation();

                    const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                    await lockOperation.confirmation();

                    var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                    await voteOperation.confirmation();
                    await signerFactory(tezos, adminSk);

                    voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                    await voteOperation.confirmation();
                    await signerFactory(tezos, satelliteOneSk);

                    nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                    await nextRoundOperation.confirmation();

                    var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                    await votingRoundVoteOperation.confirmation();
                    await signerFactory(tezos, adminSk);

                    votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                    await votingRoundVoteOperation.confirmation();
                    await signerFactory(tezos, satelliteOneSk);

                    nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                    await nextRoundOperation.confirmation();

                    nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                    await nextRoundOperation.confirmation();

                    await signerFactory(tezos, adminSk)
                    const updateStatusOperation = await delegationInstance.methods.updateSatelliteStatus(satelliteOne, "SUSPENDED").send()
                    await updateStatusOperation.confirmation()

                    await signerFactory(tezos, satelliteOneSk)
                    await chai.expect(governanceInstance.methods.processProposalPayment(proposalId).send()).to.be.rejected;

                    // Final values
                    delegationStorage               = await delegationInstance.storage();
                    const satelliteRecord           = await delegationStorage.satelliteLedger.get(satelliteOne);

                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('Banned satellite should not be able to process proposal payment', async () => {
                try{
                    // Initial Values
                    await signerFactory(tezos, satelliteTwoSk);
                    governanceStorage               = await governanceInstance.storage()
                    const proposalName              = "Quorum test";
                    const proposalDesc              = "Details about new proposal";
                    const proposalIpfs              = "ipfs://QM123456789";
                    const proposalSourceCode        = "Proposal Source Code";
                    const proposalId                = governanceStorage.nextProposalId.toNumber();
                    const proposalPaymentData       = [
                        {
                            addOrSetPaymentData: {
                                title: "Payment#0",
                                transaction: {
                                    "to_"    : bob.pkh,
                                    "token"  : {
                                        "fa2" : {
                                            "tokenContractAddress" : contractDeployments.mvkToken.address,
                                            "tokenId" : 0
                                        }
                                    },
                                    "amount" : MVK(50)
                                }
                            }
                        },
                        {
                            addOrSetPaymentData: {
                                title: "Payment#0",
                                transaction: {
                                    "to_"    : satelliteTwo,
                                    "token"  : {
                                        "fa2" : {
                                            "tokenContractAddress" : contractDeployments.mvkToken.address,
                                            "tokenId" : 0
                                        }
                                    },
                                    "amount" : MVK(50)
                                }
                            }
                        }
                    ]
                    
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.council.address,
                            "council",
                            "ConfigActionExpiryDays",
                            1234
                        ]
                    );

                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "ActionExpiryDays#1",
                                encodedCode: lambdaFunction,
                                codeDescription: ""
                            }
                        }
                    ]
                    
                    // Operation
                    var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                    await nextRoundOperation.confirmation();

                    const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData, proposalPaymentData).send({amount: 1});
                    await proposeOperation.confirmation();
                
                    const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                    await lockOperation.confirmation();

                    var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                    await voteOperation.confirmation();
                    await signerFactory(tezos, adminSk);
    
                    voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                    await voteOperation.confirmation();
                    await signerFactory(tezos, satelliteTwoSk);

                    nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                    await nextRoundOperation.confirmation();

                    var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                    await votingRoundVoteOperation.confirmation();
                    await signerFactory(tezos, adminSk);
    
                    votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
                    await votingRoundVoteOperation.confirmation();
                    await signerFactory(tezos, satelliteTwoSk);

                    nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                    await nextRoundOperation.confirmation();
    
                    nextRoundOperation          = await governanceInstance.methods.startNextRound(true).send();
                    await nextRoundOperation.confirmation();

                    await signerFactory(tezos, adminSk)
                    const updateStatusOperation = await delegationInstance.methods.updateSatelliteStatus(satelliteTwo, "BANNED").send()
                    await updateStatusOperation.confirmation()

                    await signerFactory(tezos, satelliteTwoSk)
                    await chai.expect(governanceInstance.methods.processProposalPayment(proposalId).send()).to.be.rejected;
    
                    // Final values
                    delegationStorage               = await delegationInstance.storage();
                    const satelliteRecord           = await delegationStorage.satelliteLedger.get(satelliteTwo);

                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "BANNED");
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        })

        describe("%dropProposal", async () => {

            beforeEach("Admin restores and restores satellites so they can propose", async () => {
                try{
                    // Initial values
                    await signerFactory(tezos, adminSk)
    
                    // Operation
                    var updateStatusOperation   = await delegationInstance.methods.updateSatelliteStatus(satelliteOne, "ACTIVE").send()
                    await updateStatusOperation.confirmation()
                    updateStatusOperation       = await delegationInstance.methods.updateSatelliteStatus(satelliteTwo, "ACTIVE").send()
                    await updateStatusOperation.confirmation()
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            })

            it('Suspended satellite should not be able to drop a proposal', async () => {
                try{
                    // Initial Values
                    await signerFactory(tezos, satelliteOneSk);
                    governanceStorage               = await governanceInstance.storage()
                    const proposalName              = "Quorum test";
                    const proposalDesc              = "Details about new proposal";
                    const proposalIpfs              = "ipfs://QM123456789";
                    const proposalSourceCode        = "Proposal Source Code";
                    const proposalId                = governanceStorage.nextProposalId.toNumber();
                    const proposalPaymentData       = [
                        {
                            addOrSetPaymentData: {
                                title: "Payment#0",
                                transaction: {
                                    "to_"    : bob.pkh,
                                    "token"  : {
                                        "fa2" : {
                                            "tokenContractAddress" : contractDeployments.mvkToken.address,
                                            "tokenId" : 0
                                        }
                                    },
                                    "amount" : MVK(50)
                                }
                            }
                        },
                        {
                            addOrSetPaymentData: {
                                title: "Payment#0",
                                transaction: {
                                    "to_"    : satelliteTwo,
                                    "token"  : {
                                        "fa2" : {
                                            "tokenContractAddress" : contractDeployments.mvkToken.address,
                                            "tokenId" : 0
                                        }
                                    },
                                    "amount" : MVK(50)
                                }
                            }
                        }
                    ]
                    
                
                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "ActionExpiryDays#1",
                                encodedCode: mockPackedLambdaData.updateCouncilConfig,
                                codeDescription: ""
                            }
                        }
                    ]
                    
                    // Operation
                    var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                    await nextRoundOperation.confirmation();

                    const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData, proposalPaymentData).send({amount: 1});
                    await proposeOperation.confirmation();

                    await signerFactory(tezos, adminSk)
                    const updateStatusOperation = await delegationInstance.methods.updateSatelliteStatus(satelliteOne, "SUSPENDED").send()
                    await updateStatusOperation.confirmation()

                    await signerFactory(tezos, satelliteOneSk)
                    await chai.expect(governanceInstance.methods.dropProposal(proposalId).send()).to.be.rejected;
    
                    // Final values
                    delegationStorage               = await delegationInstance.storage();
                    const satelliteRecord           = await delegationStorage.satelliteLedger.get(satelliteOne);

                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "SUSPENDED");
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('Banned satellite should not be able to drop a proposal', async () => {
                try{
                    // Initial Values
                    await signerFactory(tezos, satelliteTwoSk);
                    governanceStorage               = await governanceInstance.storage()
                    const proposalName              = "Quorum test";
                    const proposalDesc              = "Details about new proposal";
                    const proposalIpfs              = "ipfs://QM123456789";
                    const proposalSourceCode        = "Proposal Source Code";
                    const proposalId                = governanceStorage.nextProposalId.toNumber();
                    const proposalPaymentData       = [
                        {
                            addOrSetPaymentData: {
                                title: "Payment#0",
                                transaction: {
                                    "to_"    : bob.pkh,
                                    "token"  : {
                                        "fa2" : {
                                            "tokenContractAddress" : contractDeployments.mvkToken.address,
                                            "tokenId" : 0
                                        }
                                    },
                                    "amount" : MVK(50)
                                }
                            }
                        },
                        {
                            addOrSetPaymentData: {
                                title: "Payment#0",
                                transaction: {
                                    "to_"    : satelliteTwo,
                                    "token"  : {
                                        "fa2" : {
                                            "tokenContractAddress" : contractDeployments.mvkToken.address,
                                            "tokenId" : 0
                                        }
                                    },
                                    "amount" : MVK(50)
                                }
                            }
                        }
                    ]
                    
                    const lambdaFunction        = await compileLambdaFunction(
                        'development',
                        contractDeployments.governanceProxy.address,
                        
                        'updateConfig',
                        [
                            contractDeployments.council.address,
                            "council",
                            "ConfigActionExpiryDays",
                            1234
                        ]
                    );
                    const proposalData      = [
                        {
                            addOrSetProposalData: {
                                title: "ActionExpiryDays#1",
                                encodedCode: lambdaFunction,
                                codeDescription: ""
                            }
                        }
                    ]
                    
                    // Operation
                    var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                    await nextRoundOperation.confirmation();

                    const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData, proposalPaymentData).send({amount: 1});
                    await proposeOperation.confirmation();

                    await signerFactory(tezos, adminSk)
                    const updateStatusOperation = await delegationInstance.methods.updateSatelliteStatus(satelliteTwo, "BANNED").send()
                    await updateStatusOperation.confirmation()

                    await signerFactory(tezos, satelliteTwoSk)
                    await chai.expect(governanceInstance.methods.dropProposal(proposalId).send()).to.be.rejected;
    
                    // Final values
                    delegationStorage               = await delegationInstance.storage();
                    const satelliteRecord           = await delegationStorage.satelliteLedger.get(satelliteTwo);

                    // Assertions
                    assert.strictEqual(satelliteRecord.status, "BANNED");
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        })
    })
});
