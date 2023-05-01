import assert from "assert";
import { MVK, Utils } from "./helpers/Utils";
import { MichelsonMap } from "@taquito/taquito";
import {BigNumber} from "bignumber.js";

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

import { bob, alice, eve, mallory, trudy, ivan, isaac, susie, david, oscar } from "../scripts/sandbox/accounts";
import { aggregatorStorageType } from "../storage/storageTypes/aggregatorStorageType";
import * as helperFunctions from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("Governance Satellite tests", async () => {
    
    var utils: Utils;
    let tezos

    let user 
    let userSk 

    let admin 
    let adminSk 

    let satelliteOne 
    let satelliteTwo
    let satelliteThree
    let satelliteFour 
    let satelliteFive

    let delegateOne 
    let delegateOneSk

    let delegateTwo
    let delegateTwoSk

    let delegateThree
    let delegateThreeSk

    let delegateFour
    let delegateFourSk

    let doormanAddress 
    let governanceSatelliteAddress
    let tokenId = 0

    let doormanInstance;
    let delegationInstance;
    let mvkTokenInstance;
    let mavrykFa2TokenInstance
    let governanceInstance;
    let governanceSatelliteInstance;
    let aggregatorInstance;
    let aggregatorFactoryInstance;
    
    let doormanStorage;
    let delegationStorage;
    let mvkTokenStorage;
    let mavrykFa2TokenStorage
    let governanceStorage;
    let governanceSatelliteStorage;
    let aggregatorStorage;
    let aggregatorFactoryStorage;

    let updateOperatorsOperation 
    let transferOperation

    // housekeeping operations
    let setAdminOperation
    let setGovernanceOperation
    let resetAdminOperation
    let updateWhitelistContractsOperation
    let updateGeneralContractsOperation
    let mistakenTransferOperation

    // contract map value
    let storageMap
    let contractMapKey
    let initialContractMapValue
    let updatedContractMapValue

    before("setup", async () => {
        try{
            
            utils = new Utils();
            await utils.init(bob.sk);

            admin   = bob.pkh;
            adminSk = bob.sk;

            doormanAddress                  = contractDeployments.doorman.address;
            governanceSatelliteAddress      = contractDeployments.governanceSatellite.address;
            
            doormanInstance                 = await utils.tezos.contract.at(doormanAddress);
            delegationInstance              = await utils.tezos.contract.at(contractDeployments.delegation.address);
            mvkTokenInstance                = await utils.tezos.contract.at(contractDeployments.mvkToken.address);
            governanceInstance              = await utils.tezos.contract.at(contractDeployments.governance.address);
            governanceSatelliteInstance     = await utils.tezos.contract.at(contractDeployments.governanceSatellite.address);
            aggregatorInstance              = await utils.tezos.contract.at(contractDeployments.aggregator.address);
            aggregatorFactoryInstance       = await utils.tezos.contract.at(contractDeployments.aggregatorFactory.address);
            mavrykFa2TokenInstance          = await utils.tezos.contract.at(contractDeployments.mavrykFa2Token.address);
    
            doormanStorage                  = await doormanInstance.storage();
            delegationStorage               = await delegationInstance.storage();
            mvkTokenStorage                 = await mvkTokenInstance.storage();
            governanceStorage               = await governanceSatelliteInstance.storage();
            governanceSatelliteStorage      = await governanceSatelliteInstance.storage();
            aggregatorStorage               = await aggregatorInstance.storage();
            aggregatorFactoryStorage        = await aggregatorFactoryInstance.storage();
            mavrykFa2TokenStorage           = await mavrykFa2TokenInstance.storage();
            
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

            satelliteOne    = eve.pkh;
            satelliteTwo    = alice.pkh;
            satelliteThree  = trudy.pkh;
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

            // Setup Oracles
            await helperFunctions.signerFactory(tezos, bob.sk);

            const oracleMap = MichelsonMap.fromLiteral({});

            const aggregatorMetadataBase = Buffer.from(
                JSON.stringify({
                    name: 'MAVRYK Aggregator Contract',
                    icon: 'https://logo.chainbit.xyz/xtz',
                    version: 'v1.0.0',
                    authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
                }),
                'ascii',
                ).toString('hex')

            // Setup Aggregators
            const createAggregatorsBatch = await utils.tezos.wallet
            .batch()
            .withContractCall(aggregatorFactoryInstance.methods.createAggregator(
                'USD/BTC',
                true,

                oracleMap,

                new BigNumber(8),             // decimals
                new BigNumber(2),             // alphaPercentPerThousand

                new BigNumber(60),            // percentOracleThreshold
                new BigNumber(30),            // heartBeatSeconds

                new BigNumber(10000000),      // rewardAmountStakedMvk
                new BigNumber(1300),          // rewardAmountXtz
                
                aggregatorMetadataBase        // metadata bytes
            ))
            .withContractCall(aggregatorFactoryInstance.methods.createAggregator(
                'USD/XTZ',
                true,

                oracleMap,

                new BigNumber(6),             // decimals
                new BigNumber(2),             // alphaPercentPerThousand

                new BigNumber(60),            // percentOracleThreshold
                new BigNumber(30),            // heartBeatSeconds

                new BigNumber(10000000),      // rewardAmountStakedMvk
                new BigNumber(1300),          // rewardAmountXtz
                
                aggregatorMetadataBase        // metadata bytes
            ))
            .withContractCall(aggregatorFactoryInstance.methods.createAggregator(
                'USD/DOGE',
                true,

                oracleMap,

                new BigNumber(8),             // decimals
                new BigNumber(2),             // alphaPercentPerThousand

                new BigNumber(60),            // percentOracleThreshold
                new BigNumber(30),            // heartBeatSeconds

                new BigNumber(10000000),      // rewardAmountStakedMvk
                new BigNumber(1300),          // rewardAmountXtz
                
                aggregatorMetadataBase        // metadata bytes
            ))

          const createAggregatorsBatchOperation = await createAggregatorsBatch.send()
          await createAggregatorsBatchOperation.confirmation()

          console.log("Aggregators deployed")

          // Start a new governance cycle to validate all satellites
          const updateConfigOperation   = await governanceInstance.methods.updateConfig(0, "configBlocksPerProposalRound").send();
          await updateConfigOperation.confirmation();
          const startNextRoundOperation = await governanceInstance.methods.startNextRound(false).send();
          await startNextRoundOperation.confirmation();
        } catch(e) {
            console.dir(e, {depth: 5})
        }
    });

    
    describe("%updateConfig", async () => {

        before("Configure delegation ratio on delegation contract", async () => {
            try{
                // Initial Values
                await helperFunctions.signerFactory(tezos, bob.sk)
                delegationStorage   = await delegationInstance.storage();
                const newConfigValue = 10;

                // Operation
                const updateConfigOperation = await delegationInstance.methods.updateConfig(newConfigValue,"configDelegationRatio").send();
                await updateConfigOperation.confirmation();

                // Final values
                delegationStorage   = await delegationInstance.storage();
                const updateConfigValue = delegationStorage.config.delegationRatio;

                // Assertions
                assert.equal(updateConfigValue, newConfigValue);
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        beforeEach("Set signer to admin", async () => {
            await helperFunctions.signerFactory(tezos, bob.sk)
        });

        it('Admin should be able to call the entrypoint and configure the approval percentage', async () => {
            try{
                // Initial Values
                governanceSatelliteStorage = await governanceSatelliteInstance.storage();
                const newConfigValue = 6700;

                // Operation
                const updateConfigOperation = await governanceSatelliteInstance.methods.updateConfig(newConfigValue,"configApprovalPercentage").send();
                await updateConfigOperation.confirmation();

                // Final values
                governanceSatelliteStorage = await governanceSatelliteInstance.storage();
                const updateConfigValue = governanceSatelliteStorage.config.governanceSatelliteApprovalPercentage;

                // Assertions
                assert.equal(updateConfigValue, newConfigValue);
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should not be able to call the entrypoint and configure the approval percentage if it exceed 100%', async () => {
            try{
                // Initial Values
                governanceSatelliteStorage = await governanceSatelliteInstance.storage();
                const currentConfigValue = governanceSatelliteStorage.config.governanceSatelliteApprovalPercentage;
                const newConfigValue = 10001;

                // Operation
                await chai.expect(governanceSatelliteInstance.methods.updateConfig(newConfigValue,"configApprovalPercentage").send()).to.be.rejected;

                // Final values
                governanceSatelliteStorage = await governanceSatelliteInstance.storage();
                const updateConfigValue = governanceSatelliteStorage.config.governanceSatelliteApprovalPercentage;

                // Assertions
                assert.notEqual(newConfigValue, currentConfigValue);
                assert.equal(updateConfigValue.toNumber(), currentConfigValue.toNumber());
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should be able to call the entrypoint and configure the action duration in days', async () => {
            try{
                // Initial Values
                governanceSatelliteStorage = await governanceSatelliteInstance.storage();
                const newConfigValue = 1;

                // Operation
                const updateConfigOperation = await governanceSatelliteInstance.methods.updateConfig(newConfigValue,"configSatelliteDurationInDays").send();
                await updateConfigOperation.confirmation();

                // Final values
                governanceSatelliteStorage = await governanceSatelliteInstance.storage();
                const updateConfigValue = governanceSatelliteStorage.config.governanceSatelliteDurationInDays;

                // Assertions
                assert.equal(updateConfigValue, newConfigValue);
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Non-admin should not be able to call the entrypoint', async () => {
            try{
                // Initial Values
                governanceSatelliteStorage = await governanceSatelliteInstance.storage();
                const currentConfigValue = governanceSatelliteStorage.config.governanceSatelliteDurationInDays;
                const newConfigValue = 1;

                // Operation
                await helperFunctions.signerFactory(tezos, alice.sk)
                await chai.expect(governanceSatelliteInstance.methods.updateConfig(newConfigValue,"configSatelliteDurationInDays").send()).to.be.rejected;

                // Final values
                governanceSatelliteStorage = await governanceSatelliteInstance.storage();
                const updateConfigValue = governanceSatelliteStorage.config.governanceSatelliteDurationInDays;

                // Assertions
                assert.equal(updateConfigValue.toNumber(), currentConfigValue.toNumber());
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    }); // end %updateConfig tests

    describe("%suspendSatellite, %restoreSatellite", async () => {

        it('Any satellite should be able to create a governance action to suspend a satellite', async () => {
            try{        

              // some init constants
                governanceSatelliteStorage     = await governanceSatelliteInstance.storage();
                const delegationStorage        = await delegationInstance.storage();
                const aliceSatelliteRecord     = await delegationStorage.satelliteLedger.get(alice.pkh);

                assert.equal(aliceSatelliteRecord.status, "ACTIVE");

                const actionId                 = governanceSatelliteStorage.governanceSatelliteCounter;
                const bobStakeAmount           = MVK(100);
                const aliceStakeAmount         = MVK(100);
                const eveStakeAmount           = MVK(100);
                const malloryStakeAmount       = MVK(100);

                // governance satellite action params
                const satelliteToBeSuspended   = alice.pkh;
                const purpose                  = "Test Suspend Satellite";            
    
                // Satellite Bob creates a governance action - suspend Alice
                await helperFunctions.signerFactory(tezos, bob.sk);
                const governanceSatelliteOperation = await governanceSatelliteInstance.methods.suspendSatellite(
                        satelliteToBeSuspended,
                        purpose
                    ).send();
                await governanceSatelliteOperation.confirmation();
    

                governanceSatelliteStorage                      = await governanceSatelliteInstance.storage();
                const governanceAction                          = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
                const initiatorsActions                         = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);
                
                const governanceSatelliteApprovalPercentage     = governanceSatelliteStorage.config.governanceSatelliteApprovalPercentage;
                const governanceSatellitePercentageDecimals     = 4;
                const totalStakedMvkSupply                      = bobStakeAmount + aliceStakeAmount + eveStakeAmount + malloryStakeAmount;
                const stakedMvkRequiredForApproval              = (totalStakedMvkSupply * governanceSatelliteApprovalPercentage) / (10 ** governanceSatellitePercentageDecimals);
    
                // check details of governance satellite action
                assert.equal(governanceAction.initiator,                                 bob.pkh);
                assert.equal(governanceAction.governanceType,                            "SUSPEND");
                assert.equal(governanceAction.status,                                    true);
                assert.equal(governanceAction.executed,                                  false);
                assert.equal(governanceAction.governancePurpose,                         purpose);
                assert.equal(governanceAction.yayVoteStakedMvkTotal.toNumber(),                   0);
                assert.equal(governanceAction.nayVoteStakedMvkTotal.toNumber(),                   0);
                assert.equal(governanceAction.passVoteStakedMvkTotal.toNumber(),                  0);
                assert.equal(governanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
                assert.equal(governanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
                var actionsInitiatorCheck = false
                for(const i in initiatorsActions){
                    
                    if(initiatorsActions[i].toNumber() == actionId.toNumber()){
                        actionsInitiatorCheck   = true;
                    }
                }
                assert.equal(actionsInitiatorCheck, true)
    
                // 3 satellites vote yay, one satellite votes nay
                await helperFunctions.signerFactory(tezos, bob.sk);
                const bobVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await bobVotesForGovernanceActionOperation.confirmation();
    
                await helperFunctions.signerFactory(tezos, eve.sk);
                const eveVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await eveVotesForGovernanceActionOperation.confirmation();
                
                await helperFunctions.signerFactory(tezos, alice.sk);
                const aliceVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "nay").send();
                await aliceVotesForGovernanceActionOperation.confirmation();

                await helperFunctions.signerFactory(tezos, mallory.sk);
                const malloryVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await malloryVotesForGovernanceActionOperation.confirmation();
    
                // get updated storage
                const updatedGovernanceSatelliteStorage                = await governanceSatelliteInstance.storage();        
                const updatedGovernanceAction                          = await updatedGovernanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
                const updatedInitiatorsActions                         = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);          

                const updatedDelegationStorage                         = await delegationInstance.storage();        
                const updatedAliceSatelliteRecord                      = await updatedDelegationStorage.satelliteLedger.get(alice.pkh);
                
                governanceStorage                                      = await governanceInstance.storage();
                const currentCycle                                     = governanceStorage.cycleId;
                const aliceSnapshot                                    = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});
                const eveSnapshot                                      = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: eve.pkh});
                const bobSnapshot                                      = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
                const mallorySnapshot                                  = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: mallory.pkh});
                
                // check details of governance satellite action snapshot ledger
                assert.equal(bobSnapshot.totalDelegatedAmount.toNumber(),        0);
                assert.equal(bobSnapshot.totalStakedMvkBalance.toNumber(),       bobStakeAmount);
                assert.equal(bobSnapshot.totalVotingPower.toNumber(),            bobStakeAmount);
    
                assert.equal(aliceSnapshot.totalDelegatedAmount.toNumber(),      0);
                assert.equal(aliceSnapshot.totalStakedMvkBalance.toNumber(),     aliceStakeAmount);
                assert.equal(aliceSnapshot.totalVotingPower.toNumber(),          aliceStakeAmount);

                assert.equal(eveSnapshot.totalDelegatedAmount.toNumber(),        0);
                assert.equal(eveSnapshot.totalStakedMvkBalance.toNumber(),       eveStakeAmount);
                assert.equal(eveSnapshot.totalVotingPower.toNumber(),            eveStakeAmount);

                assert.equal(mallorySnapshot.totalDelegatedAmount.toNumber(),    0);
                assert.equal(mallorySnapshot.totalStakedMvkBalance.toNumber(),   malloryStakeAmount);
                assert.equal(mallorySnapshot.totalVotingPower.toNumber(),        malloryStakeAmount);

                // check that governance action has been executed
                assert.equal(updatedGovernanceAction.yayVoteStakedMvkTotal,            MVK(300));
                assert.equal(updatedGovernanceAction.nayVoteStakedMvkTotal,            MVK(100));
                assert.equal(updatedGovernanceAction.status,                  true);
                assert.equal(updatedGovernanceAction.executed,                true);
                actionsInitiatorCheck = false
                for(const i in updatedInitiatorsActions){
                    if(updatedInitiatorsActions[i].toNumber() == actionId.toNumber()){
                        actionsInitiatorCheck   = true;
                    }
                }
                assert.equal(actionsInitiatorCheck, false)

                // check that alice is now suspended
                assert.equal(updatedAliceSatelliteRecord.status,              "SUSPENDED");
            
            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        
        it('Any satellite should be able to create a governance action to restore a satellite', async () => {
          try{        

            // some init constants
              governanceSatelliteStorage     = await governanceSatelliteInstance.storage();
              const delegationStorage        = await delegationInstance.storage();        
              const aliceSatelliteRecord     = await delegationStorage.satelliteLedger.get(alice.pkh);

              assert.equal(aliceSatelliteRecord.status, "SUSPENDED");

              const actionId                 = governanceSatelliteStorage.governanceSatelliteCounter;
              const bobStakeAmount           = MVK(100);
              const aliceStakeAmount         = MVK(100);
              const eveStakeAmount           = MVK(100);
              const malloryStakeAmount       = MVK(100);

              // governance satellite action params
              const satelliteToBeSuspended   = alice.pkh;
              const purpose                  = "Test restore Satellite";            
  
              // Satellite Bob creates a governance action - restore Alice
              await helperFunctions.signerFactory(tezos, bob.sk);
              const governanceSatelliteOperation = await governanceSatelliteInstance.methods.restoreSatellite(
                      satelliteToBeSuspended,
                      purpose
                  ).send();
              await governanceSatelliteOperation.confirmation();
  

              governanceSatelliteStorage                     = await governanceSatelliteInstance.storage();
              const governanceAction                         = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
              const initiatorsActions                        = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);
              
              const governanceSatelliteApprovalPercentage    = governanceSatelliteStorage.config.governanceSatelliteApprovalPercentage;
              const governanceSatellitePercentageDecimals    = 4;
              const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount + eveStakeAmount + malloryStakeAmount;
              const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * governanceSatelliteApprovalPercentage) / (10 ** governanceSatellitePercentageDecimals);

  
              // check details of governance satellite action
              assert.equal(governanceAction.initiator,                                 bob.pkh);
              assert.equal(governanceAction.governanceType,                            "RESTORE");
              assert.equal(governanceAction.status,                                    true);
              assert.equal(governanceAction.executed,                                  false);
              assert.equal(governanceAction.governancePurpose,                         purpose);
              assert.equal(governanceAction.yayVoteStakedMvkTotal.toNumber(),                   0);
              assert.equal(governanceAction.nayVoteStakedMvkTotal.toNumber(),                   0);
              assert.equal(governanceAction.passVoteStakedMvkTotal.toNumber(),                  0);
              assert.equal(governanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
              assert.equal(governanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
              var actionsInitiatorCheck = false
                for(const i in initiatorsActions){
                    
                    if(initiatorsActions[i].toNumber() == actionId.toNumber()){
                        actionsInitiatorCheck   = true;
                    }
                }
                assert.equal(actionsInitiatorCheck, true)
  
              // 3 satellites vote yay 
              await helperFunctions.signerFactory(tezos, bob.sk);
              const bobVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
              await bobVotesForGovernanceActionOperation.confirmation();
  
              await helperFunctions.signerFactory(tezos, eve.sk);
              const eveVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
              await eveVotesForGovernanceActionOperation.confirmation();

              await helperFunctions.signerFactory(tezos, mallory.sk);
              const malloryVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
              await malloryVotesForGovernanceActionOperation.confirmation();
  
              // get updated storage
              const updatedGovernanceSatelliteStorage               = await governanceSatelliteInstance.storage();        
              const updatedGovernanceAction                         = await updatedGovernanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
              const updatedInitiatorsActions                        = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);

              const updatedDelegationStorage                        = await delegationInstance.storage();        
              const updatedAliceSatelliteRecord                     = await updatedDelegationStorage.satelliteLedger.get(alice.pkh);
              governanceStorage                                     = await governanceInstance.storage();
              const currentCycle                                    = governanceStorage.cycleId;
              const aliceSnapshot                                   = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});
              const eveSnapshot                                     = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: eve.pkh});
              const bobSnapshot                                     = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
              const mallorySnapshot                                 = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: mallory.pkh});
              
              // check details of governance satellite action snapshot ledger
              assert.equal(bobSnapshot.totalDelegatedAmount.toNumber(),        0);
              assert.equal(bobSnapshot.totalStakedMvkBalance.toNumber(),       bobStakeAmount);
              assert.equal(bobSnapshot.totalVotingPower.toNumber(),            bobStakeAmount);
  
              assert.equal(aliceSnapshot.totalDelegatedAmount.toNumber(),      0);
              assert.equal(aliceSnapshot.totalStakedMvkBalance.toNumber(),     aliceStakeAmount);
              assert.equal(aliceSnapshot.totalVotingPower.toNumber(),          aliceStakeAmount);
              
              assert.equal(eveSnapshot.totalDelegatedAmount.toNumber(),        0);
              assert.equal(eveSnapshot.totalStakedMvkBalance.toNumber(),       eveStakeAmount);
              assert.equal(eveSnapshot.totalVotingPower.toNumber(),            eveStakeAmount);

              assert.equal(mallorySnapshot.totalDelegatedAmount.toNumber(),    0);
              assert.equal(mallorySnapshot.totalStakedMvkBalance.toNumber(),   malloryStakeAmount);
              assert.equal(mallorySnapshot.totalVotingPower.toNumber(),        malloryStakeAmount);

              // check that governance action has been executed
              assert.equal(updatedGovernanceAction.yayVoteStakedMvkTotal,            MVK(300));
              assert.equal(updatedGovernanceAction.nayVoteStakedMvkTotal,            0);
              assert.equal(updatedGovernanceAction.status,                  true);
              assert.equal(updatedGovernanceAction.executed,                true);
              var actionsInitiatorCheck = false
                for(const i in updatedInitiatorsActions){
                    if(updatedInitiatorsActions[i].toNumber() == actionId.toNumber()){
                        actionsInitiatorCheck   = true;
                    }
                }
                assert.equal(actionsInitiatorCheck, false)

              // check that alice is now active
              assert.equal(updatedAliceSatelliteRecord.status,              "ACTIVE");
          
          } catch(e){
              console.dir(e, {depth: 5})
          } 
      });

      it('Any satellite should not be able to create too many governance actions', async () => {
        try{

            // Update config
            await helperFunctions.signerFactory(tezos, bob.sk);
            var updateConfigOperation      = await governanceSatelliteInstance.methods.updateConfig(1, "configMaxActionsPerSatellite").send()
            await updateConfigOperation.confirmation()

            // some init constants
            governanceSatelliteStorage     = await governanceSatelliteInstance.storage();
            governanceStorage              = await governanceInstance.storage();
            
            assert.equal(governanceSatelliteStorage.config.maxActionsPerSatellite, 1);

            const actionId                 = governanceSatelliteStorage.governanceSatelliteCounter;
            const actionsIdsBegin          = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh)

            // governance satellite action params
            const satelliteToBeSuspended   = alice.pkh;
            const purpose                  = "Test Restore Satellite";

            // Create an action
            var operation = await governanceSatelliteInstance.methods.suspendSatellite(satelliteToBeSuspended, purpose).send();
            await  operation.confirmation();

            // Satellite Bob exceeds the number of actions it can create this round
            await chai.expect(governanceSatelliteInstance.methods.suspendSatellite(satelliteToBeSuspended, purpose).send()).to.be.eventually.rejected;

            // Drop the action to create another one
            const dropOperation = await governanceSatelliteInstance.methods.dropAction(actionId).send();
            await dropOperation.confirmation();

            // Create another action
            operation = await governanceSatelliteInstance.methods.suspendSatellite(satelliteToBeSuspended, purpose).send();
            await operation.confirmation();

            // Final values
            governanceSatelliteStorage     = await governanceSatelliteInstance.storage();
            const actionsIdsEnd            = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh)

            // Assertions
            assert.notEqual(actionsIdsBegin, actionsIdsEnd);
            assert.equal(actionsIdsBegin.length <= 1, true);
            assert.equal(actionsIdsEnd.length == 1, true);

            // Reset config
            updateConfigOperation      = await governanceSatelliteInstance.methods.updateConfig(20, "configMaxActionsPerSatellite").send()
            await updateConfigOperation.confirmation()

        } catch(e){
            console.dir(e, {depth: 5})
        } 
    });
        
    });  // end %suspendSatellite, %restoreSatellite tests


    describe("%banSatellite, #restoreSatellite", async () => {

      it('Any satellite should be able to create a governance action to ban a satellite', async () => {
          try{        

            // some init constants
              governanceSatelliteStorage     = await governanceSatelliteInstance.storage();
              const delegationStorage        = await delegationInstance.storage();        
              const aliceSatelliteRecord     = await delegationStorage.satelliteLedger.get(alice.pkh);

              assert.equal(aliceSatelliteRecord.status, "ACTIVE");

              const actionId                 = governanceSatelliteStorage.governanceSatelliteCounter;
              const bobStakeAmount           = MVK(100);
              const aliceStakeAmount         = MVK(100);
              const eveStakeAmount           = MVK(100);
              const malloryStakeAmount       = MVK(100);

              // governance satellite action params
              const satelliteToBeSuspended   = alice.pkh;
              const purpose                  = "Test Ban Satellite";            
  
              // Satellite Bob creates a governance action to ban Alice
              await helperFunctions.signerFactory(tezos, bob.sk);
              const governanceSatelliteOperation = await governanceSatelliteInstance.methods.banSatellite(
                      satelliteToBeSuspended,
                      purpose
                  ).send();
              await governanceSatelliteOperation.confirmation();
  

              governanceSatelliteStorage                     = await governanceSatelliteInstance.storage();
              const governanceAction                         = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
              const initiatorsActions                        = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);
              
              const governanceSatelliteApprovalPercentage    = governanceSatelliteStorage.config.governanceSatelliteApprovalPercentage;
              const governanceSatellitePercentageDecimals    = 4;
              const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount + eveStakeAmount + malloryStakeAmount;
              const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * governanceSatelliteApprovalPercentage) / (10 ** governanceSatellitePercentageDecimals);

  
              // check details of governance satellite action
              assert.equal(governanceAction.initiator,                                 bob.pkh);
              assert.equal(governanceAction.governanceType,                            "BAN");
              assert.equal(governanceAction.status,                                    true);
              assert.equal(governanceAction.executed,                                  false);
              assert.equal(governanceAction.governancePurpose,                         purpose);
              assert.equal(governanceAction.yayVoteStakedMvkTotal.toNumber(),                   0);
              assert.equal(governanceAction.nayVoteStakedMvkTotal.toNumber(),                   0);
              assert.equal(governanceAction.passVoteStakedMvkTotal.toNumber(),                  0);
              assert.equal(governanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
              assert.equal(governanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
              var actionsInitiatorCheck = false
                for(const i in initiatorsActions){
                    
                    if(initiatorsActions[i].toNumber() == actionId.toNumber()){
                        actionsInitiatorCheck   = true;
                    }
                }
                assert.equal(actionsInitiatorCheck, true)
  
              // 3 satellites vote yay, one satellite votes nay
              await helperFunctions.signerFactory(tezos, bob.sk);
              const bobVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
              await bobVotesForGovernanceActionOperation.confirmation();
  
              await helperFunctions.signerFactory(tezos, eve.sk);
              const eveVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
              await eveVotesForGovernanceActionOperation.confirmation();
              
              await helperFunctions.signerFactory(tezos, alice.sk);
              const aliceVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "nay").send();
              await aliceVotesForGovernanceActionOperation.confirmation();

              await helperFunctions.signerFactory(tezos, mallory.sk);
              const malloryVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
              await malloryVotesForGovernanceActionOperation.confirmation();
  
              // get updated storage
              const updatedGovernanceSatelliteStorage               = await governanceSatelliteInstance.storage();        
              const updatedGovernanceAction                         = await updatedGovernanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
              const updatedInitiatorsActions                        = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);

              const updatedDelegationStorage                        = await delegationInstance.storage();        
              const updatedAliceSatelliteRecord                     = await updatedDelegationStorage.satelliteLedger.get(alice.pkh);
              governanceStorage                                     = await governanceInstance.storage();
              const currentCycle                                    = governanceStorage.cycleId;
              const aliceSnapshot                                   = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});
              const eveSnapshot                                     = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: eve.pkh});
              const bobSnapshot                                     = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
              const mallorySnapshot                                 = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: mallory.pkh});
              
              // check details of governance satellite action snapshot ledger
              assert.equal(bobSnapshot.totalDelegatedAmount.toNumber(),        0);
              assert.equal(bobSnapshot.totalStakedMvkBalance.toNumber(),       bobStakeAmount);
              assert.equal(bobSnapshot.totalVotingPower.toNumber(),            bobStakeAmount);
  
              assert.equal(aliceSnapshot.totalDelegatedAmount.toNumber(),      0);
              assert.equal(aliceSnapshot.totalStakedMvkBalance.toNumber(),     aliceStakeAmount);
              assert.equal(aliceSnapshot.totalVotingPower.toNumber(),          aliceStakeAmount);

              assert.equal(eveSnapshot.totalDelegatedAmount.toNumber(),        0);
              assert.equal(eveSnapshot.totalStakedMvkBalance.toNumber(),       eveStakeAmount);
              assert.equal(eveSnapshot.totalVotingPower.toNumber(),            eveStakeAmount);

              assert.equal(mallorySnapshot.totalDelegatedAmount.toNumber(),    0);
              assert.equal(mallorySnapshot.totalStakedMvkBalance.toNumber(),   malloryStakeAmount);
              assert.equal(mallorySnapshot.totalVotingPower.toNumber(),        malloryStakeAmount);

              // check that governance action has been executed
              assert.equal(updatedGovernanceAction.yayVoteStakedMvkTotal,            MVK(300));
              assert.equal(updatedGovernanceAction.nayVoteStakedMvkTotal,            MVK(100));
              assert.equal(updatedGovernanceAction.status,                  true);
              assert.equal(updatedGovernanceAction.executed,                true);
              var actionsInitiatorCheck = false
            for(const i in updatedInitiatorsActions){
                if(updatedInitiatorsActions[i].toNumber() == actionId.toNumber()){
                    actionsInitiatorCheck   = true;
                 }
             }
             assert.equal(actionsInitiatorCheck, false)

              // check that alice is now banned
              assert.equal(updatedAliceSatelliteRecord.status,              "BANNED");
          
          } catch(e){
              console.dir(e, {depth: 5})
          } 
      });

      
      it('Any satellite should be able to create a governance action to restore a satellite', async () => {
        try{        

          // some init constants
            governanceSatelliteStorage     = await governanceSatelliteInstance.storage();
            const delegationStorage        = await delegationInstance.storage();        
            const aliceSatelliteRecord     = await delegationStorage.satelliteLedger.get(alice.pkh);

            assert.equal(aliceSatelliteRecord.status, "BANNED");

            const actionId                 = governanceSatelliteStorage.governanceSatelliteCounter;
            const bobStakeAmount           = MVK(100);
            const aliceStakeAmount         = MVK(100);
            const eveStakeAmount           = MVK(100);
            const malloryStakeAmount       = MVK(100);

            // governance satellite action params
            const satelliteToBeSuspended   = alice.pkh;
            const purpose                  = "Test Restore Satellite";            

            // Satellite Bob creates a governance action - restore Alice
            await helperFunctions.signerFactory(tezos, bob.sk);
            const governanceSatelliteOperation = await governanceSatelliteInstance.methods.restoreSatellite(
                    satelliteToBeSuspended,
                    purpose
                ).send();
            await governanceSatelliteOperation.confirmation();


            governanceSatelliteStorage                     = await governanceSatelliteInstance.storage();
            const governanceAction                         = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
            const initiatorsActions                        = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);
            
            const governanceSatelliteApprovalPercentage    = governanceSatelliteStorage.config.governanceSatelliteApprovalPercentage;
            const governanceSatellitePercentageDecimals    = 4;
            const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount + eveStakeAmount + malloryStakeAmount;
            const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * governanceSatelliteApprovalPercentage) / (10 ** governanceSatellitePercentageDecimals);


            // check details of governance satellite action
            assert.equal(governanceAction.initiator,                                 bob.pkh);
            assert.equal(governanceAction.governanceType,                            "RESTORE");
            assert.equal(governanceAction.status,                                    true);
            assert.equal(governanceAction.executed,                                  false);
            assert.equal(governanceAction.governancePurpose,                         purpose);
            assert.equal(governanceAction.yayVoteStakedMvkTotal.toNumber(),                   0);
            assert.equal(governanceAction.nayVoteStakedMvkTotal.toNumber(),                   0);
            assert.equal(governanceAction.passVoteStakedMvkTotal.toNumber(),                  0);
            assert.equal(governanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
            assert.equal(governanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
              var actionsInitiatorCheck = false
                for(const i in initiatorsActions){
                    
                    if(initiatorsActions[i].toNumber() == actionId.toNumber()){
                        actionsInitiatorCheck   = true;
                    }
                }
                assert.equal(actionsInitiatorCheck, true)

            // 3 satellites vote yay to restore alice satellite
            await helperFunctions.signerFactory(tezos, bob.sk);
            const bobVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
            await bobVotesForGovernanceActionOperation.confirmation();

            await helperFunctions.signerFactory(tezos, eve.sk);
            const eveVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
            await eveVotesForGovernanceActionOperation.confirmation();

            await helperFunctions.signerFactory(tezos, mallory.sk);
            const malloryVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
            await malloryVotesForGovernanceActionOperation.confirmation();

            // get updated storage
            const updatedGovernanceSatelliteStorage        = await governanceSatelliteInstance.storage();        
            const updatedGovernanceAction                  = await updatedGovernanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
            const updatedInitiatorsActions                 = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);

            const updatedDelegationStorage                 = await delegationInstance.storage();        
            const updatedAliceSatelliteRecord              = await updatedDelegationStorage.satelliteLedger.get(alice.pkh);
            governanceStorage                              = await governanceInstance.storage();
            const currentCycle                             = governanceStorage.cycleId;
            const aliceSnapshot                            = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});
            const eveSnapshot                              = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: eve.pkh});
            const bobSnapshot                              = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
            const mallorySnapshot                          = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: mallory.pkh});
            
            // check details of governance satellite action snapshot ledger
            assert.equal(bobSnapshot.totalDelegatedAmount.toNumber(),        0);
            assert.equal(bobSnapshot.totalStakedMvkBalance.toNumber(),       bobStakeAmount);
            assert.equal(bobSnapshot.totalVotingPower.toNumber(),            bobStakeAmount);

            assert.equal(aliceSnapshot.totalDelegatedAmount.toNumber(),      0);
            assert.equal(aliceSnapshot.totalStakedMvkBalance.toNumber(),     aliceStakeAmount);
            assert.equal(aliceSnapshot.totalVotingPower.toNumber(),          aliceStakeAmount);
            
            assert.equal(eveSnapshot.totalDelegatedAmount.toNumber(),        0);
            assert.equal(eveSnapshot.totalStakedMvkBalance.toNumber(),       eveStakeAmount);
            assert.equal(eveSnapshot.totalVotingPower.toNumber(),            eveStakeAmount);

            assert.equal(mallorySnapshot.totalDelegatedAmount.toNumber(),    0);
            assert.equal(mallorySnapshot.totalStakedMvkBalance.toNumber(),   malloryStakeAmount);
            assert.equal(mallorySnapshot.totalVotingPower.toNumber(),        malloryStakeAmount);

            // check that governance action has been executed
            assert.equal(updatedGovernanceAction.yayVoteStakedMvkTotal,            MVK(300));
            assert.equal(updatedGovernanceAction.nayVoteStakedMvkTotal,            0);
            assert.equal(updatedGovernanceAction.status,                  true);
            assert.equal(updatedGovernanceAction.executed,                true);
            var actionsInitiatorCheck = false
            for(const i in updatedInitiatorsActions){
                if(updatedInitiatorsActions[i].toNumber() == actionId.toNumber()){
                    actionsInitiatorCheck   = true;
                }
             }
             assert.equal(actionsInitiatorCheck, false)

            // check that alice is now restored - status set to ACTIVE
            assert.equal(updatedAliceSatelliteRecord.status,              "ACTIVE");
        
        } catch(e){
            console.dir(e, {depth: 5})
        } 
    });

  }); // end %banSatellite, #restoreSatellite tests

  describe("%addOracleToAggregator, %removeOracleInAggregator, %removeAllSatelliteOracles", async () => {

    it('Any satellite should be able to create a governance action to add oracle to aggregator', async () => {
        try{        

            // some init constants
            governanceSatelliteStorage     = await governanceSatelliteInstance.storage();
            aggregatorFactoryStorage       = await aggregatorFactoryInstance.storage();

            // get aggregator address from pair key
            const usdBtcAggregatorAddress  = aggregatorFactoryStorage.trackedAggregators[0];
            
            // get aggregator contract
            const aggregatorInstance = await utils.tezos.contract.at(usdBtcAggregatorAddress);
            const aggregatorStorage : aggregatorStorageType = await aggregatorInstance.storage();

            // check that user is not in aggregator oracleLedger set
            const aggregatorOracles        = await aggregatorStorage.oracleLedger.get(bob.pkh);
            assert.equal(aggregatorOracles,      undefined);

            // get bob satellite oracle record
            const bobSatelliteOracleRecord             = await governanceSatelliteStorage.satelliteAggregatorLedger.get(bob.pkh);
            const numberOraclesSubscribedAtStart       = bobSatelliteOracleRecord == undefined ? 0 : bobSatelliteOracleRecord.size;
            
            const actionId                 = governanceSatelliteStorage.governanceSatelliteCounter;
            const bobStakeAmount           = MVK(100);
            const aliceStakeAmount         = MVK(100);
            const eveStakeAmount           = MVK(100);
            const malloryStakeAmount       = MVK(100);

            // governance satellite action params
            const oracleAddress            = bob.pkh;
            const aggregatorAddress        = usdBtcAggregatorAddress;
            const purpose                  = "Test Add Oracle To Aggregator";            

            // Satellite Bob creates a governance action to add oracle to aggregator
            await helperFunctions.signerFactory(tezos, bob.sk);
            const governanceSatelliteOperation = await governanceSatelliteInstance.methods.addOracleToAggregator(
                    oracleAddress,
                    aggregatorAddress,
                    purpose
                ).send();
            await governanceSatelliteOperation.confirmation();

            governanceSatelliteStorage                     = await governanceSatelliteInstance.storage();
            const governanceAction                         = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
            const initiatorsActions                        = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);
            
            const governanceSatelliteApprovalPercentage    = governanceSatelliteStorage.config.governanceSatelliteApprovalPercentage;
            const governanceSatellitePercentageDecimals    = 4;
            const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount + eveStakeAmount + malloryStakeAmount;
            const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * governanceSatelliteApprovalPercentage) / (10 ** governanceSatellitePercentageDecimals);

            // check details of governance satellite action
            assert.equal(governanceAction.initiator,                                 bob.pkh);
            assert.equal(governanceAction.governanceType,                            "ADD_ORACLE_TO_AGGREGATOR");
            assert.equal(governanceAction.status,                                    true);
            assert.equal(governanceAction.executed,                                  false);
            assert.equal(governanceAction.governancePurpose,                         purpose);
            assert.equal(governanceAction.yayVoteStakedMvkTotal.toNumber(),                   0);
            assert.equal(governanceAction.nayVoteStakedMvkTotal.toNumber(),                   0);
            assert.equal(governanceAction.passVoteStakedMvkTotal.toNumber(),                  0);
            assert.equal(governanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
            assert.equal(governanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
              var actionsInitiatorCheck = false
                for(const i in initiatorsActions){
                    
                    if(initiatorsActions[i].toNumber() == actionId.toNumber()){
                        actionsInitiatorCheck   = true;
                    }
                }
                assert.equal(actionsInitiatorCheck, true)

            // 3 satellites vote yay, one satellite votes nay
            await helperFunctions.signerFactory(tezos, bob.sk);
            const bobVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
            await bobVotesForGovernanceActionOperation.confirmation();

            await helperFunctions.signerFactory(tezos, eve.sk);
            const eveVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
            await eveVotesForGovernanceActionOperation.confirmation();
            
            await helperFunctions.signerFactory(tezos, alice.sk);
            const aliceVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "nay").send();
            await aliceVotesForGovernanceActionOperation.confirmation();

            await helperFunctions.signerFactory(tezos, mallory.sk);
            const malloryVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
            await malloryVotesForGovernanceActionOperation.confirmation();

            // get updated storage
            const updatedGovernanceSatelliteStorage                 = await governanceSatelliteInstance.storage();        
            const updatedGovernanceAction                           = await updatedGovernanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
            const updatedInitiatorsActions                          = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);

            const updatedBobSatelliteOracleRecord                   = await updatedGovernanceSatelliteStorage.satelliteAggregatorLedger.get(bob.pkh);
            const bobUsdBtcOracleAggregatorRecord                   = await updatedBobSatelliteOracleRecord.get(usdBtcAggregatorAddress);

            const updatedAggregatorStorage : aggregatorStorageType  = await aggregatorInstance.storage();
            const updatedAggregatorOracles : any                    = await updatedAggregatorStorage.oracleLedger.get(bob.pkh);
            governanceStorage                                       = await governanceInstance.storage();
            const currentCycle                                      = governanceStorage.cycleId;
            const aliceSnapshot                                     = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});
            const eveSnapshot                                       = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: eve.pkh});
            const bobSnapshot                                       = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
            const mallorySnapshot                                   = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: mallory.pkh});
            
            // check details of governance satellite action snapshot ledger
            assert.equal(bobSnapshot.totalDelegatedAmount.toNumber(),        0);
            assert.equal(bobSnapshot.totalStakedMvkBalance.toNumber(),       bobStakeAmount);
            assert.equal(bobSnapshot.totalVotingPower.toNumber(),            bobStakeAmount);

            assert.equal(aliceSnapshot.totalDelegatedAmount.toNumber(),      0);
            assert.equal(aliceSnapshot.totalStakedMvkBalance.toNumber(),     aliceStakeAmount);
            assert.equal(aliceSnapshot.totalVotingPower.toNumber(),          aliceStakeAmount);

            assert.equal(eveSnapshot.totalDelegatedAmount.toNumber(),        0);
            assert.equal(eveSnapshot.totalStakedMvkBalance.toNumber(),       eveStakeAmount);
            assert.equal(eveSnapshot.totalVotingPower.toNumber(),            eveStakeAmount);

            assert.equal(mallorySnapshot.totalDelegatedAmount.toNumber(),    0);
            assert.equal(mallorySnapshot.totalStakedMvkBalance.toNumber(),   malloryStakeAmount);
            assert.equal(mallorySnapshot.totalVotingPower.toNumber(),        malloryStakeAmount);
            
            // check that governance action has been executed
            assert.equal(updatedGovernanceAction.yayVoteStakedMvkTotal,            MVK(300));
            assert.equal(updatedGovernanceAction.nayVoteStakedMvkTotal,            MVK(100));
            assert.equal(updatedGovernanceAction.status,                  true);
            assert.equal(updatedGovernanceAction.executed,                true);
            var actionsInitiatorCheck = false
            for(const i in updatedInitiatorsActions){
                if(updatedInitiatorsActions[i].toNumber() == actionId.toNumber()){
                    actionsInitiatorCheck   = true;
                 }
             }
             assert.equal(actionsInitiatorCheck, false)

            // check that bob oracle aggregator record is updated
            assert.notEqual(bobUsdBtcOracleAggregatorRecord, undefined);

            // check that bob is now added to aggregator oracleLedger Set
            assert.equal(updatedAggregatorOracles.oraclePeerId, bob.peerId);
            assert.equal(updatedAggregatorOracles.oraclePublicKey, bob.pk);
        
        } catch(e){
            console.dir(e, {depth: 5})
        } 
    });

    
    it('Any satellite should be able to create a governance action to remove an oracle from an aggregator', async () => {
      try{        

            // some init constants
            governanceSatelliteStorage     = await governanceSatelliteInstance.storage();
            aggregatorFactoryStorage       = await aggregatorFactoryInstance.storage();

            // get aggregator address from pair key
            const usdBtcAggregatorAddress  = aggregatorFactoryStorage.trackedAggregators[0];

            // get aggregator contract
            const aggregatorInstance = await utils.tezos.contract.at(usdBtcAggregatorAddress);
            const aggregatorStorage : aggregatorStorageType = await aggregatorInstance.storage();

            // check that user is in aggregator oracleLedger set (from previous test)
            const aggregatorOracles : any                   = await aggregatorStorage.oracleLedger.get(bob.pkh);
            assert.equal(aggregatorOracles.oraclePeerId, bob.peerId);
            assert.equal(aggregatorOracles.oraclePublicKey, bob.pk);

            // get bob satellite oracle record
            const bobSatelliteOracleRecord             = await governanceSatelliteStorage.satelliteAggregatorLedger.get(bob.pkh);
            const numberOraclesSubscribedAtStart       = bobSatelliteOracleRecord.size;
            
            const actionId                 = governanceSatelliteStorage.governanceSatelliteCounter;
            const bobStakeAmount           = MVK(100);
            const aliceStakeAmount         = MVK(100);
            const eveStakeAmount           = MVK(100);
            const malloryStakeAmount       = MVK(100);

            // governance satellite action params
            const oracleAddress            = bob.pkh;
            const aggregatorAddress        = usdBtcAggregatorAddress;
            const purpose                  = "Test Remove Oracle In Aggregator";            

            // Satellite Bob creates a governance action to add oracle to aggregator
            await helperFunctions.signerFactory(tezos, bob.sk);
            const governanceSatelliteOperation = await governanceSatelliteInstance.methods.removeOracleInAggregator(
                    oracleAddress,
                    aggregatorAddress,
                    purpose
                ).send();
            await governanceSatelliteOperation.confirmation();

            governanceSatelliteStorage                     = await governanceSatelliteInstance.storage();
            const governanceAction                         = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
            const initiatorsActions                        = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);
            
            const governanceSatelliteApprovalPercentage    = governanceSatelliteStorage.config.governanceSatelliteApprovalPercentage;
            const governanceSatellitePercentageDecimals    = 4;
            const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount + eveStakeAmount + malloryStakeAmount;
            const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * governanceSatelliteApprovalPercentage) / (10 ** governanceSatellitePercentageDecimals);


            // check details of governance satellite action
            assert.equal(governanceAction.initiator,                                 bob.pkh);
            assert.equal(governanceAction.governanceType,                            "REMOVE_ORACLE_IN_AGGREGATOR");
            assert.equal(governanceAction.status,                                    true);
            assert.equal(governanceAction.executed,                                  false);
            assert.equal(governanceAction.governancePurpose,                         purpose);
            assert.equal(governanceAction.yayVoteStakedMvkTotal.toNumber(),                   0);
            assert.equal(governanceAction.nayVoteStakedMvkTotal.toNumber(),                   0);
            assert.equal(governanceAction.passVoteStakedMvkTotal.toNumber(),                  0);
            assert.equal(governanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
            assert.equal(governanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
              var actionsInitiatorCheck = false
                for(const i in initiatorsActions){
                    
                    if(initiatorsActions[i].toNumber() == actionId.toNumber()){
                        actionsInitiatorCheck   = true;
                    }
                }
                assert.equal(actionsInitiatorCheck, true)

            // 3 satellites vote yay to suspend alice satellite, alice's satellite votes nay
            await helperFunctions.signerFactory(tezos, bob.sk);
            const bobVotesForGovernanceActionOperation              = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
            await bobVotesForGovernanceActionOperation.confirmation();

            await helperFunctions.signerFactory(tezos, eve.sk);
            const eveVotesForGovernanceActionOperation              = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
            await eveVotesForGovernanceActionOperation.confirmation();

            await helperFunctions.signerFactory(tezos, mallory.sk);
            const malloryVotesForGovernanceActionOperation          = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
            await malloryVotesForGovernanceActionOperation.confirmation();

            // get updated storage
            const updatedGovernanceSatelliteStorage                 = await governanceSatelliteInstance.storage();        
            const updatedGovernanceAction                           = await updatedGovernanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
            const updatedInitiatorsActions                          = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);

            const updatedBobSatelliteOracleRecord                   = await updatedGovernanceSatelliteStorage.satelliteAggregatorLedger.get(bob.pkh);
            const bobUsdBtcOracleAggregatorRecord                   = await updatedBobSatelliteOracleRecord.get(usdBtcAggregatorAddress);

            const updatedAggregatorStorage : aggregatorStorageType  = await aggregatorInstance.storage();
            const updatedAggregatorOracles                          = await updatedAggregatorStorage.oracleLedger.get(bob.pkh);
            governanceStorage                                       = await governanceInstance.storage();
            const currentCycle                                      = governanceStorage.cycleId;
            const eveSnapshot                                       = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: eve.pkh});
            const bobSnapshot                                       = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
            const mallorySnapshot                                   = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: mallory.pkh});
            
            // check details of governance satellite action snapshot ledger
            assert.equal(bobSnapshot.totalDelegatedAmount.toNumber(),        0);
            assert.equal(bobSnapshot.totalStakedMvkBalance.toNumber(),       bobStakeAmount);
            assert.equal(bobSnapshot.totalVotingPower.toNumber(),            bobStakeAmount);

            assert.equal(eveSnapshot.totalDelegatedAmount.toNumber(),        0);
            assert.equal(eveSnapshot.totalStakedMvkBalance.toNumber(),       eveStakeAmount);
            assert.equal(eveSnapshot.totalVotingPower.toNumber(),            eveStakeAmount);

            assert.equal(mallorySnapshot.totalDelegatedAmount.toNumber(),    0);
            assert.equal(mallorySnapshot.totalStakedMvkBalance.toNumber(),   malloryStakeAmount);
            assert.equal(mallorySnapshot.totalVotingPower.toNumber(),        malloryStakeAmount);

            // check that governance action has been executed
            assert.equal(updatedGovernanceAction.yayVoteStakedMvkTotal,            MVK(300));
            assert.equal(updatedGovernanceAction.nayVoteStakedMvkTotal,            0);
            assert.equal(updatedGovernanceAction.status,                  true);
            assert.equal(updatedGovernanceAction.executed,                true);
            var actionsInitiatorCheck = false
            for(const i in updatedInitiatorsActions){
                if(updatedInitiatorsActions[i].toNumber() == actionId.toNumber()){
                    actionsInitiatorCheck   = true;
                 }
             }
             assert.equal(actionsInitiatorCheck, false)

            // check that bob oracle aggregator record is updated
            assert.equal(bobUsdBtcOracleAggregatorRecord,                           undefined);

            // check that bob is now removed from aggregator oracleLedger Set
            assert.equal(updatedAggregatorOracles, undefined);

      } catch(e){
          console.dir(e, {depth: 5})
      } 
    });

    it('Any satellite should be able to create a governance action to remove all satellite oracles', async () => {
        try{        

            // some init constants
            governanceSatelliteStorage     = await governanceSatelliteInstance.storage();
            aggregatorFactoryStorage       = await aggregatorFactoryInstance.storage();

            // Test flow: add three aggregators to bob's satellite, then initiate governance action to remove all satellite oracles 

            // get aggregator address from pair key
            const usdBtcAggregatorAddress  = aggregatorFactoryStorage.trackedAggregators[0];

            // get aggregator address from pair key
            const usdXtzAggregatorAddress  = aggregatorFactoryStorage.trackedAggregators[1];

            // get aggregator address from pair key
            const usdDogeAggregatorAddress  = aggregatorFactoryStorage.trackedAggregators[2];
            
            // get aggregator contracts
            const usdBtcAggregatorInstance       = await utils.tezos.contract.at(usdBtcAggregatorAddress);
            const usdXtzAggregatorInstance       = await utils.tezos.contract.at(usdXtzAggregatorAddress);
            const usdDogeAggregatorInstance      = await utils.tezos.contract.at(usdDogeAggregatorAddress);
            
            const usdBtcAggregatorStorage   : aggregatorStorageType  = await usdBtcAggregatorInstance.storage();
            const usdXtzAggregatorStorage   : aggregatorStorageType  = await usdXtzAggregatorInstance.storage();
            const usdDogeAggregatorStorage  : aggregatorStorageType  = await usdDogeAggregatorInstance.storage();

            // check that user is not in aggregator oracleLedger set
            const usdBtcAggregatorOracles        = await usdBtcAggregatorStorage.oracleLedger.get(bob.pkh);
            const usdXtzAggregatorOracles        = await usdXtzAggregatorStorage.oracleLedger.get(bob.pkh);
            const usdDogeAggregatorOracles       = await usdDogeAggregatorStorage.oracleLedger.get(bob.pkh);
            
            assert.equal(usdBtcAggregatorOracles,      undefined);
            assert.equal(usdXtzAggregatorOracles,      undefined);
            assert.equal(usdDogeAggregatorOracles,     undefined);

            const actionId                 = governanceSatelliteStorage.governanceSatelliteCounter;
            const bobStakeAmount           = MVK(100);
            const aliceStakeAmount         = MVK(100);
            const eveStakeAmount           = MVK(100);
            const malloryStakeAmount       = MVK(100);

            // --------------------------------------------------------
            // governance satellite action params - add bob to first aggregator
            // --------------------------------------------------------

            const oracleAddress            = bob.pkh;
            const aggregatorAddress        = usdBtcAggregatorAddress;
            const purpose                  = "Test Add Oracle To Aggregator";            

            // Satellite Bob creates a governance action to add oracle to aggregator
            await helperFunctions.signerFactory(tezos, bob.sk);
            const governanceSatelliteAddOracleFirstOperation = await governanceSatelliteInstance.methods.addOracleToAggregator(
                    oracleAddress,
                    aggregatorAddress,
                    purpose
                ).send();
            await governanceSatelliteAddOracleFirstOperation.confirmation();

            governanceSatelliteStorage                     = await governanceSatelliteInstance.storage();
            const governanceAction                         = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
            const initiatorsActions                        = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);
            
            const governanceSatelliteApprovalPercentage    = governanceSatelliteStorage.config.governanceSatelliteApprovalPercentage;
            const governanceSatellitePercentageDecimals    = 4;
            const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount + eveStakeAmount + malloryStakeAmount;
            const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * governanceSatelliteApprovalPercentage) / (10 ** governanceSatellitePercentageDecimals);

            // check details of governance satellite action
            assert.equal(governanceAction.initiator,                                 bob.pkh);
            assert.equal(governanceAction.governanceType,                            "ADD_ORACLE_TO_AGGREGATOR");
            assert.equal(governanceAction.status,                                    true);
            assert.equal(governanceAction.executed,                                  false);
            assert.equal(governanceAction.governancePurpose,                         purpose);
            assert.equal(governanceAction.yayVoteStakedMvkTotal.toNumber(),                   0);
            assert.equal(governanceAction.nayVoteStakedMvkTotal.toNumber(),                   0);
            assert.equal(governanceAction.passVoteStakedMvkTotal.toNumber(),                  0);
            assert.equal(governanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
            assert.equal(governanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
              var actionsInitiatorCheck = false
                for(const i in initiatorsActions){
                    
                    if(initiatorsActions[i].toNumber() == actionId.toNumber()){
                        actionsInitiatorCheck   = true;
                    }
                }
                assert.equal(actionsInitiatorCheck, true)
        
            // 3 satellites vote yay, one satellite votes nay
            await helperFunctions.signerFactory(tezos, bob.sk);
            const bobVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
            await bobVotesForGovernanceActionOperation.confirmation();

            await helperFunctions.signerFactory(tezos, eve.sk);
            const eveVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
            await eveVotesForGovernanceActionOperation.confirmation();
            
            await helperFunctions.signerFactory(tezos, alice.sk);
            const aliceVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "nay").send();
            await aliceVotesForGovernanceActionOperation.confirmation();

            await helperFunctions.signerFactory(tezos, mallory.sk);
            const malloryVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
            await malloryVotesForGovernanceActionOperation.confirmation();

            // --------------------------------------------------------
            // governance satellite action params - add bob to second aggregator
            // --------------------------------------------------------

            // Satellite Bob creates a governance action to add oracle to aggregator
            await helperFunctions.signerFactory(tezos, bob.sk);
            const secondGovernanceSatelliteStorage         = await governanceSatelliteInstance.storage();
            const secondActionId                           = secondGovernanceSatelliteStorage.governanceSatelliteCounter;

            const governanceSatelliteAddOracleSecondOperation = await governanceSatelliteInstance.methods.addOracleToAggregator(
                    oracleAddress,
                    usdXtzAggregatorAddress,
                    purpose
                ).send();
            await governanceSatelliteAddOracleSecondOperation.confirmation();

            const secondGovernanceAction                   = await secondGovernanceSatelliteStorage.governanceSatelliteActionLedger.get(secondActionId);
            
            // check details of governance satellite action
            assert.equal(secondGovernanceAction.initiator,                                 bob.pkh);
            assert.equal(secondGovernanceAction.governanceType,                            "ADD_ORACLE_TO_AGGREGATOR");
            assert.equal(secondGovernanceAction.status,                                    true);
            assert.equal(secondGovernanceAction.executed,                                  false);
            assert.equal(secondGovernanceAction.governancePurpose,                         purpose);
            assert.equal(secondGovernanceAction.yayVoteStakedMvkTotal.toNumber(),                   0);
            assert.equal(secondGovernanceAction.nayVoteStakedMvkTotal.toNumber(),                   0);
            assert.equal(secondGovernanceAction.passVoteStakedMvkTotal.toNumber(),                  0);
            assert.equal(secondGovernanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
            assert.equal(secondGovernanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
        
            // 3 satellites vote yay, one satellite votes nay
            await helperFunctions.signerFactory(tezos, bob.sk);
            const bobVotesForGovernanceActionSecondOperation = await governanceSatelliteInstance.methods.voteForAction(secondActionId, "yay").send();
            await bobVotesForGovernanceActionSecondOperation.confirmation();

            await helperFunctions.signerFactory(tezos, eve.sk);
            const eveVotesForGovernanceActionSecondOperation = await governanceSatelliteInstance.methods.voteForAction(secondActionId, "yay").send();
            await eveVotesForGovernanceActionSecondOperation.confirmation();
            
            await helperFunctions.signerFactory(tezos, alice.sk);
            const aliceVotesForGovernanceActionSecondOperation = await governanceSatelliteInstance.methods.voteForAction(secondActionId, "nay").send();
            await aliceVotesForGovernanceActionSecondOperation.confirmation();

            await helperFunctions.signerFactory(tezos, mallory.sk);
            const malloryVotesForGovernanceActionSecondOperation = await governanceSatelliteInstance.methods.voteForAction(secondActionId, "yay").send();
            await malloryVotesForGovernanceActionSecondOperation.confirmation();

            // --------------------------------------------------------
            // governance satellite action params - add bob to third aggregator
            // --------------------------------------------------------

            // Satellite Bob creates a governance action to add oracle to aggregator
            await helperFunctions.signerFactory(tezos, bob.sk);
            const thirdGovernanceSatelliteStorage         = await governanceSatelliteInstance.storage();
            const thirdActionId                           = thirdGovernanceSatelliteStorage.governanceSatelliteCounter;

            const governanceSatelliteAddOracleThirdOperation = await governanceSatelliteInstance.methods.addOracleToAggregator(
                    oracleAddress,
                    usdDogeAggregatorAddress,
                    purpose
                ).send();
            await governanceSatelliteAddOracleThirdOperation.confirmation();

            const thirdGovernanceAction                   = await thirdGovernanceSatelliteStorage.governanceSatelliteActionLedger.get(thirdActionId);
            
            // check details of governance satellite action
            assert.equal(thirdGovernanceAction.initiator,                                 bob.pkh);
            assert.equal(thirdGovernanceAction.governanceType,                            "ADD_ORACLE_TO_AGGREGATOR");
            assert.equal(thirdGovernanceAction.status,                                    true);
            assert.equal(thirdGovernanceAction.executed,                                  false);
            assert.equal(thirdGovernanceAction.governancePurpose,                         purpose);
            assert.equal(thirdGovernanceAction.yayVoteStakedMvkTotal.toNumber(),                   0);
            assert.equal(thirdGovernanceAction.nayVoteStakedMvkTotal.toNumber(),                   0);
            assert.equal(thirdGovernanceAction.passVoteStakedMvkTotal.toNumber(),                  0);
            assert.equal(thirdGovernanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
            assert.equal(thirdGovernanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
        
            // 3 satellites vote yay, one satellite votes nay
            await helperFunctions.signerFactory(tezos, bob.sk);
            const bobVotesForGovernanceActionThirdOperation = await governanceSatelliteInstance.methods.voteForAction(thirdActionId, "yay").send();
            await bobVotesForGovernanceActionThirdOperation.confirmation();

            await helperFunctions.signerFactory(tezos, eve.sk);
            const eveVotesForGovernanceActionThirdOperation = await governanceSatelliteInstance.methods.voteForAction(thirdActionId, "yay").send();
            await eveVotesForGovernanceActionThirdOperation.confirmation();
            
            await helperFunctions.signerFactory(tezos, alice.sk);
            const aliceVotesForGovernanceActionThirdOperation = await governanceSatelliteInstance.methods.voteForAction(thirdActionId, "nay").send();
            await aliceVotesForGovernanceActionThirdOperation.confirmation();

            await helperFunctions.signerFactory(tezos, mallory.sk);
            const malloryVotesForGovernanceActionThirdOperation = await governanceSatelliteInstance.methods.voteForAction(thirdActionId, "yay").send();
            await malloryVotesForGovernanceActionThirdOperation.confirmation();

            // --------------------------------------------------------
            // governance satellite check storage that bob is now linked to three aggregators
            // --------------------------------------------------------

            // get updated storage
            const updatedGovernanceSatelliteStorage    = await governanceSatelliteInstance.storage();        
            const updatedGovernanceAction              = await updatedGovernanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
            const updatedInitiatorsActions             = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);

            const updatedBobSatelliteOracleRecord      = await updatedGovernanceSatelliteStorage.satelliteAggregatorLedger.get(bob.pkh);

            const bobUsdBtcOracleAggregatorRecord      = await updatedBobSatelliteOracleRecord.get(usdBtcAggregatorAddress);
            const bobUsdXtzOracleAggregatorRecord      = await updatedBobSatelliteOracleRecord.get(usdXtzAggregatorAddress);
            const bobUsdDogeOracleAggregatorRecord     = await updatedBobSatelliteOracleRecord.get(usdDogeAggregatorAddress);

            const updatedUsdBtcAggregatorStorage   : aggregatorStorageType  = await usdBtcAggregatorInstance.storage();
            const updatedUsdXtzAggregatorStorage   : aggregatorStorageType  = await usdXtzAggregatorInstance.storage();
            const updatedUsdDogeAggregatorStorage  : aggregatorStorageType  = await usdDogeAggregatorInstance.storage();

            // check that user is not in aggregator oracleLedger set
            const updatedUsdBtcAggregatorOracles : any        = await updatedUsdBtcAggregatorStorage.oracleLedger.get(bob.pkh);
            const updatedUsdXtzAggregatorOracles : any        = await updatedUsdXtzAggregatorStorage.oracleLedger.get(bob.pkh);
            const updatedUsdDogeAggregatorOracles : any       = await updatedUsdDogeAggregatorStorage.oracleLedger.get(bob.pkh);
            
            // check that governance action has been executed
            assert.equal(updatedGovernanceAction.yayVoteStakedMvkTotal,            MVK(300));
            assert.equal(updatedGovernanceAction.nayVoteStakedMvkTotal,            MVK(100));
            assert.equal(updatedGovernanceAction.status,                  true);
            assert.equal(updatedGovernanceAction.executed,                true);
            var actionsInitiatorCheck = false
            for(const i in updatedInitiatorsActions){
                if(updatedInitiatorsActions[i].toNumber() == actionId.toNumber()){
                    actionsInitiatorCheck   = true;
                 }
             }
             assert.equal(actionsInitiatorCheck, false)

            // check that bob oracle aggregator record is updated
            assert.notEqual(bobUsdBtcOracleAggregatorRecord,  undefined);
            assert.notEqual(bobUsdXtzOracleAggregatorRecord,  undefined);
            assert.notEqual(bobUsdDogeOracleAggregatorRecord, undefined);

            // check that bob is now added to aggregator oracleLedger Set
            assert.equal(updatedUsdBtcAggregatorOracles.oraclePeerId, bob.peerId);
            assert.equal(updatedUsdBtcAggregatorOracles.oraclePublicKey, bob.pk);
            assert.equal(updatedUsdXtzAggregatorOracles.oraclePeerId, bob.peerId);
            assert.equal(updatedUsdXtzAggregatorOracles.oraclePublicKey, bob.pk);
            assert.equal(updatedUsdDogeAggregatorOracles.oraclePeerId, bob.peerId);
            assert.equal(updatedUsdDogeAggregatorOracles.oraclePublicKey, bob.pk);

            // --------------------------------------------------------
            // governance satellite action params - remove all satellite oracles
            // --------------------------------------------------------

            // governance satellite action params
            const satelliteAddress         = bob.pkh;
            const purposeRemove            = "Test Remove All Satellite Oracles";            

            // Satellite Bob creates a governance action to remove all satellite oracles
            await helperFunctions.signerFactory(tezos, bob.sk);
            const fourthGovernanceSatelliteStorage         = await governanceSatelliteInstance.storage();
            const fourthActionId                           = fourthGovernanceSatelliteStorage.governanceSatelliteCounter;

            const governanceSatelliteOperation = await governanceSatelliteInstance.methods.removeAllSatelliteOracles(
                    satelliteAddress,
                    purposeRemove
                ).send();
            await governanceSatelliteOperation.confirmation();

            const fourthGovernanceAction                   = await fourthGovernanceSatelliteStorage.governanceSatelliteActionLedger.get(fourthActionId);
            
            // check details of governance satellite action
            assert.equal(fourthGovernanceAction.initiator,                                 bob.pkh);
            assert.equal(fourthGovernanceAction.governanceType,                            "REMOVE_ALL_SATELLITE_ORACLES");
            assert.equal(fourthGovernanceAction.status,                                    true);
            assert.equal(fourthGovernanceAction.executed,                                  false);
            assert.equal(fourthGovernanceAction.governancePurpose,                         purposeRemove);
            assert.equal(fourthGovernanceAction.yayVoteStakedMvkTotal.toNumber(),                   0);
            assert.equal(fourthGovernanceAction.nayVoteStakedMvkTotal.toNumber(),                   0);
            assert.equal(fourthGovernanceAction.passVoteStakedMvkTotal.toNumber(),                  0);
            assert.equal(fourthGovernanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
            assert.equal(fourthGovernanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);

            // 3 satellites vote yay, one satellite votes nay
            await helperFunctions.signerFactory(tezos, bob.sk);
            const bobVotesForGovernanceActionFourthOperation = await governanceSatelliteInstance.methods.voteForAction(fourthActionId, "yay").send();
            await bobVotesForGovernanceActionFourthOperation.confirmation();

            await helperFunctions.signerFactory(tezos, eve.sk);
            const eveVotesForGovernanceActionFourthOperation = await governanceSatelliteInstance.methods.voteForAction(fourthActionId, "yay").send();
            await eveVotesForGovernanceActionFourthOperation.confirmation();
            
            await helperFunctions.signerFactory(tezos, alice.sk);
            const aliceVotesForGovernanceActionFourthOperation = await governanceSatelliteInstance.methods.voteForAction(fourthActionId, "nay").send();
            await aliceVotesForGovernanceActionFourthOperation.confirmation();

            await helperFunctions.signerFactory(tezos, mallory.sk);
            const malloryVotesForGovernanceActionFourthOperation = await governanceSatelliteInstance.methods.voteForAction(fourthActionId, "yay").send();
            await malloryVotesForGovernanceActionFourthOperation.confirmation();

            // --------------------------------------------------------
            // governance satellite action params - remove all satellite oracles
            // --------------------------------------------------------

            const finalUpdatedGovernanceSatelliteStorage    = await governanceSatelliteInstance.storage();        
            const finalUpdatedGovernanceAction              = await finalUpdatedGovernanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);              

            const finalUpdatedBobSatelliteOracleRecord      = await finalUpdatedGovernanceSatelliteStorage.satelliteAggregatorLedger.get(bob.pkh);
            const finalBobUsdBtcOracleAggregatorRecord      = await finalUpdatedBobSatelliteOracleRecord.get(usdBtcAggregatorAddress);
            const finalBobUsdXtzOracleAggregatorRecord      = await finalUpdatedBobSatelliteOracleRecord.get(usdXtzAggregatorAddress);
            const finalBobUsdDogeOracleAggregatorRecord     = await finalUpdatedBobSatelliteOracleRecord.get(usdDogeAggregatorAddress);

            const finalUpdatedUsdBtcAggregatorStorage   : aggregatorStorageType  = await usdBtcAggregatorInstance.storage();
            const finalUpdatedUsdXtzAggregatorStorage   : aggregatorStorageType  = await usdXtzAggregatorInstance.storage();
            const finalUpdatedUsdDogeAggregatorStorage  : aggregatorStorageType  = await usdDogeAggregatorInstance.storage();

            // check that user is not in aggregator oracleLedger set
            const finalUpdatedUsdBtcAggregatorOracles        = await finalUpdatedUsdBtcAggregatorStorage.oracleLedger.get(bob.pkh);
            const finalUpdatedUsdXtzAggregatorOracles        = await finalUpdatedUsdXtzAggregatorStorage.oracleLedger.get(bob.pkh);
            const finalUpdatedUsdDogeAggregatorOracles       = await finalUpdatedUsdDogeAggregatorStorage.oracleLedger.get(bob.pkh);
            
            // check that governance action has been executed
            assert.equal(finalUpdatedGovernanceAction.yayVoteStakedMvkTotal,            MVK(300));
            assert.equal(finalUpdatedGovernanceAction.nayVoteStakedMvkTotal,            MVK(100));
            assert.equal(finalUpdatedGovernanceAction.status,                  true);
            assert.equal(finalUpdatedGovernanceAction.executed,                true);

            // check that bob oracle aggregator record is finalUpdated
            assert.equal(finalBobUsdBtcOracleAggregatorRecord,                          undefined);
            assert.equal(finalBobUsdXtzOracleAggregatorRecord,                          undefined);
            assert.equal(finalBobUsdDogeOracleAggregatorRecord,                         undefined);

            // check that bob is now added to aggregator oracleLedger Set
            assert.equal(finalUpdatedUsdBtcAggregatorOracles,      undefined);
            assert.equal(finalUpdatedUsdXtzAggregatorOracles,      undefined);
            assert.equal(finalUpdatedUsdDogeAggregatorOracles,     undefined);
        
        } catch(e){
            console.dir(e, {depth: 5})
        } 
    });

});  // end %addOracleToAggregator, %removeOracleInAggregator, %removeAllSatelliteOracles tests


  describe("%togglePauseAggregator", async () => {

        it('Any satellite should be able to create a governance action to update aggregator status', async () => {
            try{        

                // some init constants
                governanceSatelliteStorage     = await governanceSatelliteInstance.storage();
                
                // get aggregator address from pair key
                const usdBtcAggregatorAddress  = aggregatorFactoryStorage.trackedAggregators[0];

                // get aggregator contract
                const aggregatorInstance       = await utils.tezos.contract.at(usdBtcAggregatorAddress);
                aggregatorStorage              = await aggregatorInstance.storage();
                assert.equal(aggregatorStorage.breakGlassConfig.updateDataIsPaused, false);
                assert.equal(aggregatorStorage.breakGlassConfig.withdrawRewardXtzIsPaused, false);
                assert.equal(aggregatorStorage.breakGlassConfig.withdrawRewardStakedMvkIsPaused, false);

                const actionId                 = governanceSatelliteStorage.governanceSatelliteCounter;
                const bobStakeAmount           = MVK(100);
                const aliceStakeAmount         = MVK(100);
                const eveStakeAmount           = MVK(100);
                const malloryStakeAmount       = MVK(100);

                // governance satellite action params
                const aggregatorAddress        = usdBtcAggregatorAddress;
                const newStatus                = "pauseAll"
                const purpose                  = "Test Update Aggregator Status";            
    
                // Satellite Bob creates a governance action - suspend Alice
                await helperFunctions.signerFactory(tezos, bob.sk);
                const governanceSatelliteOperation = await governanceSatelliteInstance.methods.togglePauseAggregator(
                        aggregatorAddress,
                        purpose,
                        newStatus
                    ).send();
                await governanceSatelliteOperation.confirmation();
    
                governanceSatelliteStorage                     = await governanceSatelliteInstance.storage();
                const governanceAction                         = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
                const initiatorsActions                        = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);
                
                const governanceSatelliteApprovalPercentage    = governanceSatelliteStorage.config.governanceSatelliteApprovalPercentage;
                const governanceSatellitePercentageDecimals    = 4;
                const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount + eveStakeAmount + malloryStakeAmount;
                const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * governanceSatelliteApprovalPercentage) / (10 ** governanceSatellitePercentageDecimals);

    
                // check details of governance satellite action
                assert.equal(governanceAction.initiator,                                 bob.pkh);
                assert.equal(governanceAction.governanceType,                            "TOGGLE_PAUSE_AGGREGATOR");
                assert.equal(governanceAction.status,                                    true);
                assert.equal(governanceAction.executed,                                  false);
                assert.equal(governanceAction.governancePurpose,                         purpose);
                assert.equal(governanceAction.yayVoteStakedMvkTotal.toNumber(),                   0);
                assert.equal(governanceAction.nayVoteStakedMvkTotal.toNumber(),                   0);
                assert.equal(governanceAction.passVoteStakedMvkTotal.toNumber(),                  0);
                assert.equal(governanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
                assert.equal(governanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
                var actionsInitiatorCheck = false
                for(const i in initiatorsActions){
                    if(initiatorsActions[i].toNumber() == actionId.toNumber()){
                        actionsInitiatorCheck   = true;
                    }
                }
                assert.equal(actionsInitiatorCheck, true)
    
                // 3 satellites vote yay, one satellite votes nay
                await helperFunctions.signerFactory(tezos, bob.sk);
                const bobVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await bobVotesForGovernanceActionOperation.confirmation();
    
                await helperFunctions.signerFactory(tezos, eve.sk);
                const eveVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await eveVotesForGovernanceActionOperation.confirmation();
                
                await helperFunctions.signerFactory(tezos, alice.sk);
                const aliceVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "nay").send();
                await aliceVotesForGovernanceActionOperation.confirmation();

                await helperFunctions.signerFactory(tezos, mallory.sk);
                const malloryVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await malloryVotesForGovernanceActionOperation.confirmation();
    
                // get updated storage
                const updatedGovernanceSatelliteStorage            = await governanceSatelliteInstance.storage();        
                const updatedGovernanceAction                      = await updatedGovernanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
                const updatedInitiatorsActions                     = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);

                governanceStorage                                  = await governanceInstance.storage();
                const currentCycle                                 = governanceStorage.cycleId;
                const aliceSnapshot                                = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});
                const eveSnapshot                                  = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: eve.pkh});
                const bobSnapshot                                  = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
                const mallorySnapshot                              = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: mallory.pkh});
                
                // check details of governance satellite action snapshot ledger
                assert.equal(bobSnapshot.totalDelegatedAmount.toNumber(),        0);
                assert.equal(bobSnapshot.totalStakedMvkBalance.toNumber(),       bobStakeAmount);
                assert.equal(bobSnapshot.totalVotingPower.toNumber(),            bobStakeAmount);
    
                assert.equal(aliceSnapshot.totalDelegatedAmount.toNumber(),      0);
                assert.equal(aliceSnapshot.totalStakedMvkBalance.toNumber(),     aliceStakeAmount);
                assert.equal(aliceSnapshot.totalVotingPower.toNumber(),          aliceStakeAmount);

                assert.equal(eveSnapshot.totalDelegatedAmount.toNumber(),        0);
                assert.equal(eveSnapshot.totalStakedMvkBalance.toNumber(),       eveStakeAmount);
                assert.equal(eveSnapshot.totalVotingPower.toNumber(),            eveStakeAmount);

                assert.equal(mallorySnapshot.totalDelegatedAmount.toNumber(),    0);
                assert.equal(mallorySnapshot.totalStakedMvkBalance.toNumber(),   malloryStakeAmount);
                assert.equal(mallorySnapshot.totalVotingPower.toNumber(),        malloryStakeAmount);

                // check that governance action has been executed
                assert.equal(updatedGovernanceAction.yayVoteStakedMvkTotal,            MVK(300));
                assert.equal(updatedGovernanceAction.nayVoteStakedMvkTotal,            MVK(100));
                assert.equal(updatedGovernanceAction.status,                  true);
                assert.equal(updatedGovernanceAction.executed,                true);
                var actionsInitiatorCheck = false
                for(const i in updatedInitiatorsActions){
                    if(updatedInitiatorsActions[i].toNumber() == actionId.toNumber()){
                        actionsInitiatorCheck   = true;
                    }
                }
                assert.equal(actionsInitiatorCheck, false)

                // check that aggregator is now inactive
                aggregatorStorage              = await aggregatorInstance.storage();
                assert.equal(aggregatorStorage.breakGlassConfig.updateDataIsPaused, true);
                assert.equal(aggregatorStorage.breakGlassConfig.withdrawRewardXtzIsPaused, true);
                assert.equal(aggregatorStorage.breakGlassConfig.withdrawRewardStakedMvkIsPaused, true);
            
            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });
        
    });  // end %togglePauseAggregator tests


    describe("%fixMistakenTransfer", async () => {

        it('Any satellite should be able to create a governance action to resolve a mistaken transfer made by a user', async () => {
            try{        
    
                // some init constants
                governanceSatelliteStorage      = await governanceSatelliteInstance.storage();
                mvkTokenStorage                 = await mvkTokenInstance.storage()
                var contractAccount             = await mvkTokenStorage.ledger.get(contractDeployments.aggregatorFactory.address)
                var userAccount                 = await mvkTokenStorage.ledger.get(bob.pkh)
                const initAccountBalance        = contractAccount ? contractAccount.toNumber() : 0;
                const initUserBalance           = userAccount ? userAccount.toNumber() : 0;
                const tokenAmount               = MVK(200);
                const purpose                   = "Transfer made by mistake to the aggregator factory"
                const actionId                  = governanceSatelliteStorage.governanceSatelliteCounter;
                const bobStakeAmount            = MVK(100);
                const aliceStakeAmount          = MVK(100);
                const eveStakeAmount            = MVK(100);
                const malloryStakeAmount        = MVK(100);
    
                await helperFunctions.signerFactory(tezos, bob.sk);
    
                // Mistake Operation
                const transferOperation         = await mvkTokenInstance.methods.transfer([
                    {
                        from_: bob.pkh,
                        txs: [
                            {
                                to_: contractDeployments.aggregatorFactory.address,
                                token_id: 0,
                                amount: tokenAmount
                            }
                        ]
                    }
                ]).send();
                await transferOperation.confirmation();
    
                // Mid values
                mvkTokenStorage             = await mvkTokenInstance.storage()
                contractAccount             = await mvkTokenStorage.ledger.get(contractDeployments.aggregatorFactory.address)
                userAccount                 = await mvkTokenStorage.ledger.get(bob.pkh)
                const midAccountBalance     = contractAccount ? contractAccount.toNumber() : 0;          
    
                // Mid assertions
                assert.equal(midAccountBalance, initAccountBalance + tokenAmount)
    
                // Satellite Bob creates a governance action
                const governanceSatelliteOperation = await governanceSatelliteInstance.methods.fixMistakenTransfer(
                        contractDeployments.aggregatorFactory.address,
                        purpose,
                        [
                            {
                                "to_"    : bob.pkh,
                                "token"  : {
                                    "fa2" : {
                                        "tokenContractAddress": contractDeployments.mvkToken.address,
                                        "tokenId" : 0
                                    }
                                },
                                "amount" : tokenAmount
                            }
                        ]
                    ).send();
                await governanceSatelliteOperation.confirmation();
    
                governanceSatelliteStorage                     = await governanceSatelliteInstance.storage();
                const governanceAction                         = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
                const initiatorsActions                        = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);
                
                const governanceSatelliteApprovalPercentage    = governanceSatelliteStorage.config.governanceSatelliteApprovalPercentage;
                const governanceSatellitePercentageDecimals    = 4;
                const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount + eveStakeAmount + malloryStakeAmount;
                const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * governanceSatelliteApprovalPercentage) / (10 ** governanceSatellitePercentageDecimals);
    
    
                // check details of governance satellite action
                assert.equal(governanceAction.initiator,                                 bob.pkh);
                assert.equal(governanceAction.governanceType,                            "MISTAKEN_TRANSFER_FIX");
                assert.equal(governanceAction.status,                                    true);
                assert.equal(governanceAction.executed,                                  false);
                assert.equal(governanceAction.governancePurpose,                         purpose);
                assert.equal(governanceAction.yayVoteStakedMvkTotal.toNumber(),                   0);
                assert.equal(governanceAction.nayVoteStakedMvkTotal.toNumber(),                   0);
                assert.equal(governanceAction.passVoteStakedMvkTotal.toNumber(),                  0);
                assert.equal(governanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
                assert.equal(governanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
                var actionsInitiatorCheck = false
                for(const i in initiatorsActions){
                    if(initiatorsActions[i].toNumber() == actionId.toNumber()){
                        actionsInitiatorCheck   = true;
                    }
                }
                assert.equal(actionsInitiatorCheck, true)
    
                // 3 satellites vote yay, one satellite votes nay
                await helperFunctions.signerFactory(tezos, bob.sk);
                const bobVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await bobVotesForGovernanceActionOperation.confirmation();
    
                await helperFunctions.signerFactory(tezos, eve.sk);
                const eveVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await eveVotesForGovernanceActionOperation.confirmation();
                
                await helperFunctions.signerFactory(tezos, alice.sk);
                const aliceVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "nay").send();
                await aliceVotesForGovernanceActionOperation.confirmation();
    
                await helperFunctions.signerFactory(tezos, mallory.sk);
                const malloryVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
                await malloryVotesForGovernanceActionOperation.confirmation();
    
                // get updated storage
                governanceSatelliteStorage                  = await governanceSatelliteInstance.storage();
                mvkTokenStorage                             = await mvkTokenInstance.storage()      
                const updatedGovernanceAction               = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
                const updatedInitiatorsActions              = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);
                contractAccount                             = await mvkTokenStorage.ledger.get(contractDeployments.aggregatorFactory.address)
                userAccount                                 = await mvkTokenStorage.ledger.get(bob.pkh)
                const endAccountBalance                     = contractAccount ? contractAccount.toNumber() : 0;
                const endUserBalance                        = userAccount ? userAccount.toNumber() : 0;
                governanceStorage                              = await governanceInstance.storage();
                const currentCycle                             = governanceStorage.cycleId;
                const aliceSnapshot                            = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});
                const eveSnapshot                              = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: eve.pkh});
                const bobSnapshot                              = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
                const mallorySnapshot                          = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: mallory.pkh});
                
                // check details of governance satellite action snapshot ledger
                assert.equal(bobSnapshot.totalDelegatedAmount.toNumber(),        0);
                assert.equal(bobSnapshot.totalStakedMvkBalance.toNumber(),       bobStakeAmount);
                assert.equal(bobSnapshot.totalVotingPower.toNumber(),            bobStakeAmount);
    
                assert.equal(aliceSnapshot.totalDelegatedAmount.toNumber(),      0);
                assert.equal(aliceSnapshot.totalStakedMvkBalance.toNumber(),     aliceStakeAmount);
                assert.equal(aliceSnapshot.totalVotingPower.toNumber(),          aliceStakeAmount);
    
                assert.equal(eveSnapshot.totalDelegatedAmount.toNumber(),        0);
                assert.equal(eveSnapshot.totalStakedMvkBalance.toNumber(),       eveStakeAmount);
                assert.equal(eveSnapshot.totalVotingPower.toNumber(),            eveStakeAmount);
    
                assert.equal(mallorySnapshot.totalDelegatedAmount.toNumber(),    0);
                assert.equal(mallorySnapshot.totalStakedMvkBalance.toNumber(),   malloryStakeAmount);
                assert.equal(mallorySnapshot.totalVotingPower.toNumber(),        malloryStakeAmount);
    
                // check that governance action has been executed
                assert.equal(updatedGovernanceAction.yayVoteStakedMvkTotal,            MVK(300));
                assert.equal(updatedGovernanceAction.nayVoteStakedMvkTotal,            MVK(100));
                assert.equal(updatedGovernanceAction.status,                  true);
                assert.equal(updatedGovernanceAction.executed,                true);
                var actionsInitiatorCheck = false
            for(const i in updatedInitiatorsActions){
                if(updatedInitiatorsActions[i].toNumber() == actionId.toNumber()){
                    actionsInitiatorCheck   = true;
                 }
             }
             assert.equal(actionsInitiatorCheck, false)
    
                // Final assertions
                assert.equal(endAccountBalance, initAccountBalance)
                assert.equal(endUserBalance, initUserBalance)
            
            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });
        
    });  // end %fixMistakenTransfer tests

    describe("%dropAction", async () => {

        it('Satellite should be able to drop an action it created', async () => {
            try{
    
            // some init constants
            governanceSatelliteStorage     = await governanceSatelliteInstance.storage();
            const delegationStorage        = await delegationInstance.storage();        
            const aliceSatelliteRecord     = await delegationStorage.satelliteLedger.get(alice.pkh);

            assert.equal(aliceSatelliteRecord.status, "ACTIVE");

            const actionId                 = governanceSatelliteStorage.governanceSatelliteCounter;
            const bobStakeAmount           = MVK(100);
            const aliceStakeAmount         = MVK(100);
            const eveStakeAmount           = MVK(100);
            const malloryStakeAmount       = MVK(100);

            // governance satellite action params
            const satelliteToBeSuspended   = alice.pkh;
            const purpose                  = "Test Ban Satellite";            

            // Satellite Bob creates a governance action to ban Alice
            await helperFunctions.signerFactory(tezos, bob.sk);
            const governanceSatelliteOperation = await governanceSatelliteInstance.methods.banSatellite(
                    satelliteToBeSuspended,
                    purpose
                ).send();
            await governanceSatelliteOperation.confirmation();


            governanceSatelliteStorage                     = await governanceSatelliteInstance.storage();
            const governanceAction                         = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
            const initiatorsActions                        = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);

            const governanceSatelliteApprovalPercentage    = governanceSatelliteStorage.config.governanceSatelliteApprovalPercentage;
            const governanceSatellitePercentageDecimals    = 4;
            const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount + eveStakeAmount + malloryStakeAmount;
            const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * governanceSatelliteApprovalPercentage) / (10 ** governanceSatellitePercentageDecimals);


            // check details of governance satellite action
            assert.equal(governanceAction.initiator,                                 bob.pkh);
            assert.equal(governanceAction.governanceType,                            "BAN");
            assert.equal(governanceAction.status,                                    true);
            assert.equal(governanceAction.executed,                                  false);
            assert.equal(governanceAction.governancePurpose,                         purpose);
            assert.equal(governanceAction.yayVoteStakedMvkTotal.toNumber(),                   0);
            assert.equal(governanceAction.nayVoteStakedMvkTotal.toNumber(),                   0);
            assert.equal(governanceAction.passVoteStakedMvkTotal.toNumber(),                  0);
            assert.equal(governanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
            assert.equal(governanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
              var actionsInitiatorCheck = false
                for(const i in initiatorsActions){
                    
                    if(initiatorsActions[i].toNumber() == actionId.toNumber()){
                        actionsInitiatorCheck   = true;
                    }
                }
                assert.equal(actionsInitiatorCheck, true)

            // 3 satellites vote yay, one satellite votes nay
            await helperFunctions.signerFactory(tezos, bob.sk);
            const dropsActionOperation  = await governanceSatelliteInstance.methods.dropAction(actionId).send();
            await dropsActionOperation.confirmation();

            // get updated storage
            const updatedGovernanceSatelliteStorage                = await governanceSatelliteInstance.storage();        
            const updatedGovernanceAction                          = await updatedGovernanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
            const updatedInitiatorsActions                         = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);
            governanceStorage                              = await governanceInstance.storage();
            const currentCycle                             = governanceStorage.cycleId;
            const aliceSnapshot                            = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});
            const eveSnapshot                              = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: eve.pkh});
            const bobSnapshot                              = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
            const mallorySnapshot                          = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: mallory.pkh});

            // check details of governance satellite action snapshot ledger
            assert.equal(bobSnapshot.totalDelegatedAmount.toNumber(),        0);
            assert.equal(bobSnapshot.totalStakedMvkBalance.toNumber(),       bobStakeAmount);
            assert.equal(bobSnapshot.totalVotingPower.toNumber(),            bobStakeAmount);

            assert.equal(aliceSnapshot.totalDelegatedAmount.toNumber(),      0);
            assert.equal(aliceSnapshot.totalStakedMvkBalance.toNumber(),     aliceStakeAmount);
            assert.equal(aliceSnapshot.totalVotingPower.toNumber(),          aliceStakeAmount);

            assert.equal(eveSnapshot.totalDelegatedAmount.toNumber(),        0);
            assert.equal(eveSnapshot.totalStakedMvkBalance.toNumber(),       eveStakeAmount);
            assert.equal(eveSnapshot.totalVotingPower.toNumber(),            eveStakeAmount);

            assert.equal(mallorySnapshot.totalDelegatedAmount.toNumber(),    0);
            assert.equal(mallorySnapshot.totalStakedMvkBalance.toNumber(),   malloryStakeAmount);
            assert.equal(mallorySnapshot.totalVotingPower.toNumber(),        malloryStakeAmount);

            // check that governance action has been dropped and remove from the satellite actions
            assert.equal(updatedGovernanceAction.status,                  false);
            assert.equal(updatedGovernanceAction.executed,                false);
            var actionsInitiatorCheck = false
            for(const i in updatedInitiatorsActions){
                if(updatedInitiatorsActions[i].toNumber() == actionId.toNumber()){
                    actionsInitiatorCheck   = true;
                 }
             }
             assert.equal(actionsInitiatorCheck, false)
            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });

        it('Satellite should be not able to drop an action it did not create', async () => {
            
            try{
                
                // some init constants
                governanceSatelliteStorage     = await governanceSatelliteInstance.storage();
                const delegationStorage        = await delegationInstance.storage();        
                const aliceSatelliteRecord     = await delegationStorage.satelliteLedger.get(alice.pkh);

                assert.equal(aliceSatelliteRecord.status, "ACTIVE");

                const actionId                 = governanceSatelliteStorage.governanceSatelliteCounter;
                const bobStakeAmount           = MVK(100);
                const aliceStakeAmount         = MVK(100);
                const eveStakeAmount           = MVK(100);
                const malloryStakeAmount       = MVK(100);

                // governance satellite action params
                const satelliteToBeSuspended   = alice.pkh;
                const purpose                  = "Test Ban Satellite";            

                // Satellite Bob creates a governance action to ban Alice
                await helperFunctions.signerFactory(tezos, bob.sk);
                const governanceSatelliteOperation = await governanceSatelliteInstance.methods.banSatellite(
                        satelliteToBeSuspended,
                        purpose
                    ).send();
                await governanceSatelliteOperation.confirmation();


                governanceSatelliteStorage                     = await governanceSatelliteInstance.storage();
                governanceStorage                              = await governanceInstance.storage();
                const currentCycle                             = governanceStorage.cycleId;
                const aliceSnapshot                            = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});
                const eveSnapshot                              = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: eve.pkh});
                const bobSnapshot                              = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
                const mallorySnapshot                          = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: mallory.pkh});
                const governanceAction                         = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
                const initiatorsActions                        = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);

                const governanceSatelliteApprovalPercentage    = governanceSatelliteStorage.config.governanceSatelliteApprovalPercentage;
                const governanceSatellitePercentageDecimals    = 4;
                const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount + eveStakeAmount + malloryStakeAmount;
                const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * governanceSatelliteApprovalPercentage) / (10 ** governanceSatellitePercentageDecimals);


                // check details of governance satellite action
                assert.equal(governanceAction.initiator,                                 bob.pkh);
                assert.equal(governanceAction.governanceType,                            "BAN");
                assert.equal(governanceAction.status,                                    true);
                assert.equal(governanceAction.executed,                                  false);
                assert.equal(governanceAction.governancePurpose,                         purpose);
                assert.equal(governanceAction.yayVoteStakedMvkTotal.toNumber(),                   0);
                assert.equal(governanceAction.nayVoteStakedMvkTotal.toNumber(),                   0);
                assert.equal(governanceAction.passVoteStakedMvkTotal.toNumber(),                  0);
                assert.equal(governanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
                assert.equal(governanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
                var actionsInitiatorCheck = false
                for(const i in initiatorsActions){
                    if(initiatorsActions[i].toNumber() == actionId.toNumber()){
                        actionsInitiatorCheck   = true;
                    }
                }
                assert.equal(actionsInitiatorCheck, true)
                
                // check details of governance satellite action snapshot ledger
                assert.equal(bobSnapshot.totalDelegatedAmount.toNumber(),        0);
                assert.equal(bobSnapshot.totalStakedMvkBalance.toNumber(),       bobStakeAmount);
                assert.equal(bobSnapshot.totalVotingPower.toNumber(),            bobStakeAmount);

                assert.equal(aliceSnapshot.totalDelegatedAmount.toNumber(),      0);
                assert.equal(aliceSnapshot.totalStakedMvkBalance.toNumber(),     aliceStakeAmount);
                assert.equal(aliceSnapshot.totalVotingPower.toNumber(),          aliceStakeAmount);

                assert.equal(eveSnapshot.totalDelegatedAmount.toNumber(),        0);
                assert.equal(eveSnapshot.totalStakedMvkBalance.toNumber(),       eveStakeAmount);
                assert.equal(eveSnapshot.totalVotingPower.toNumber(),            eveStakeAmount);

                assert.equal(mallorySnapshot.totalDelegatedAmount.toNumber(),    0);
                assert.equal(mallorySnapshot.totalStakedMvkBalance.toNumber(),   malloryStakeAmount);
                assert.equal(mallorySnapshot.totalVotingPower.toNumber(),        malloryStakeAmount);

                // 3 satellites vote yay, one satellite votes nay
                await helperFunctions.signerFactory(tezos, eve.sk);
                await chai.expect(governanceSatelliteInstance.methods.dropAction(actionId).send()).to.be.rejected;

            } catch(e){
                console.dir(e, {depth: 5})
            } 
        
        });  // end %dropAction tests
    })
    
    describe("permissions tests", async () => {

        it('Non-satellite should not be able to create any governance action', async () => {
            try{        

                // some init constants
                governanceSatelliteStorage     = await governanceSatelliteInstance.storage();
                
                // get aggregator address from pair key
                const usdBtcAggregatorAddress  = aggregatorFactoryStorage.trackedAggregators[0];
                
                // dummy governance satellite action params
                const actionId                 = governanceSatelliteStorage.governanceSatelliteCounter;
                var oracleAddress              = trudy.pkh;
                const aggregatorAddress        = usdBtcAggregatorAddress;
                const newStatus                = "pauseAll"
                const purpose                  = "Test Purpose";            

                // init non-satellite user
                await helperFunctions.signerFactory(tezos, trudy.sk);

                // fail to create governance action to suspend Satellite
                const failSuspendSatelliteOperation = governanceSatelliteInstance.methods.suspendSatellite(
                    bob.pkh,
                    purpose
                ).send();
                await chai.expect(failSuspendSatelliteOperation).to.be.eventually.rejected;


                // fail to create governance action to restore Satellite
                const failRestoreSatelliteOperation = governanceSatelliteInstance.methods.restoreSatellite(
                    bob.pkh,
                    purpose
                ).send();
                await chai.expect(failRestoreSatelliteOperation).to.be.eventually.rejected;


                // fail to create governance action to ban Satellite
                const failBanSatelliteOperation = governanceSatelliteInstance.methods.banSatellite(
                    bob.pkh,
                    purpose
                ).send();
                await chai.expect(failBanSatelliteOperation).to.be.eventually.rejected;


                // fail to create governance action to add oracle to aggregator
                const failAddOracleToAggregatorOperation = governanceSatelliteInstance.methods.addOracleToAggregator(
                        oracleAddress,
                        aggregatorAddress,
                        purpose
                    ).send();
                await chai.expect(failAddOracleToAggregatorOperation).to.be.eventually.rejected;


                // fail to create governance action to remove oracle in aggregator
                const failRemoveOracleInAggregatorOperation = governanceSatelliteInstance.methods.removeOracleInAggregator(
                    oracleAddress,
                    aggregatorAddress,
                    purpose
                ).send();
                await chai.expect(failRemoveOracleInAggregatorOperation).to.be.eventually.rejected;


                // fail to create governance action to remove all satellite oracles
                const failRemoveAllSatelliteOraclesOperation = governanceSatelliteInstance.methods.removeAllSatelliteOracles(
                    bob.pkh,
                    purpose
                ).send();
                await chai.expect(failRemoveAllSatelliteOraclesOperation).to.be.eventually.rejected;

                
                // fail to create governance action to update aggregator status
                const failTogglePauseAggregatorOperation = governanceSatelliteInstance.methods.togglePauseAggregator(
                    aggregatorAddress,
                    purpose,
                    newStatus
                ).send();
                await chai.expect(failTogglePauseAggregatorOperation).to.be.eventually.rejected;


                // Satellite Bob creates a governance action to add oracle to aggregator (with a real satellite)
                await helperFunctions.signerFactory(tezos, bob.sk);
                oracleAddress   = alice.pkh;
                const governanceSatelliteOperation = await governanceSatelliteInstance.methods.addOracleToAggregator(
                        oracleAddress,
                        aggregatorAddress,
                        purpose
                    ).send();
                await governanceSatelliteOperation.confirmation();


                await helperFunctions.signerFactory(tezos, trudy.sk);
                // fail to create governance action to drop governance action
                const failDropActionOperation = governanceSatelliteInstance.methods.dropAction(
                    actionId
                ).send();
                await chai.expect(failDropActionOperation).to.be.eventually.rejected;


                // fail to create governance action to vote for governance action
                const failVoteYayForActionOperation = governanceSatelliteInstance.methods.voteForAction(
                    actionId,
                    "yay"
                ).send();
                await chai.expect(failVoteYayForActionOperation).to.be.eventually.rejected;


                // fail to create governance action to vote for governance action
                const failVoteNayForActionOperation = governanceSatelliteInstance.methods.voteForAction(
                    actionId,
                    "nay"
                ).send();
                await chai.expect(failVoteNayForActionOperation).to.be.eventually.rejected;


                // fail to create governance action to vote for governance action
                const failVotePassForActionOperation = governanceSatelliteInstance.methods.voteForAction(
                    actionId,
                    "pass"
                ).send();
                await chai.expect(failVotePassForActionOperation).to.be.eventually.rejected;

            
            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });
        
    });  // end permissions tests


    describe("Housekeeping Entrypoints", async () => {

        beforeEach("Set signer to admin (bob)", async () => {
            governanceSatelliteStorage        = await governanceSatelliteInstance.storage();
            await helperFunctions.signerFactory(tezos, bob.sk);
        });

        it('%setAdmin                 - admin (bob) should be able to update the contract admin address', async () => {
            try{
                
                // Initial Values
                governanceSatelliteStorage   = await governanceSatelliteInstance.storage();
                const currentAdmin  = governanceSatelliteStorage.admin;

                // Operation
                setAdminOperation   = await governanceSatelliteInstance.methods.setAdmin(alice.pkh).send();
                await setAdminOperation.confirmation();

                // Final values
                governanceSatelliteStorage   = await governanceSatelliteInstance.storage();
                const newAdmin      = governanceSatelliteStorage.admin;

                // Assertions
                assert.notStrictEqual(newAdmin, currentAdmin);
                assert.strictEqual(newAdmin, alice.pkh);
                assert.strictEqual(currentAdmin, bob.pkh);

                // reset admin
                await helperFunctions.signerFactory(tezos, alice.sk);
                resetAdminOperation = await governanceSatelliteInstance.methods.setAdmin(bob.pkh).send();
                await resetAdminOperation.confirmation();

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%setGovernance            - admin (bob) should be able to update the contract governance address', async () => {
            try{
                
                // Initial Values
                governanceSatelliteStorage       = await governanceSatelliteInstance.storage();
                const currentGovernance = governanceSatelliteStorage.governanceAddress;

                // Operation
                setGovernanceOperation = await governanceSatelliteInstance.methods.setGovernance(alice.pkh).send();
                await setGovernanceOperation.confirmation();

                // Final values
                governanceSatelliteStorage       = await governanceSatelliteInstance.storage();
                const updatedGovernance = governanceSatelliteStorage.governanceAddress;

                // reset governance
                setGovernanceOperation = await governanceSatelliteInstance.methods.setGovernance(contractDeployments.governance.address).send();
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
                const updateOperation = await governanceSatelliteInstance.methods.updateMetadata(key, hash).send();
                await updateOperation.confirmation();

                // Final values
                governanceSatelliteStorage       = await governanceSatelliteInstance.storage();            

                const updatedData       = await governanceSatelliteStorage.metadata.get(key);
                assert.equal(hash, updatedData);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('%updateConfig             - admin (bob) should be able to update contract config', async () => {
            try{
                
                // Initial Values
                governanceSatelliteStorage            = await governanceSatelliteInstance.storage();
                const testValue = 10;

                const initialFinancialReqApprovalPct  = governanceSatelliteStorage.config.financialRequestApprovalPercentage.toNumber();
                const initialFinancialReqDurationDays = governanceSatelliteStorage.config.financialRequestDurationInDays.toNumber();

                // Operation
                var updateConfigOperation = await governanceSatelliteInstance.methods.updateConfig(testValue, "configFinancialReqApprovalPct").send();
                await updateConfigOperation.confirmation();

                updateConfigOperation = await governanceSatelliteInstance.methods.updateConfig(testValue, "configFinancialReqDurationDays");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                // Final values
                governanceSatelliteStorage              = await governanceSatelliteInstance.storage();
                const updatedFinancialReqApprovalPct    = governanceSatelliteStorage.config.financialRequestApprovalPercentage.toNumber();
                const updatedFinancialReqDurationDays   = governanceSatelliteStorage.config.financialRequestDurationInDays.toNumber();

                // Assertions
                assert.equal(updatedFinancialReqApprovalPct, testValue);
                assert.equal(updatedFinancialReqDurationDays, testValue);

                // reset config operation
                var resetConfigOperation = await governanceSatelliteInstance.methods.updateConfig(initialFinancialReqApprovalPct, "configFinancialReqApprovalPct").send();
                await resetConfigOperation.confirmation();

                resetConfigOperation = await governanceSatelliteInstance.methods.updateConfig(initialFinancialReqDurationDays, "configFinancialReqDurationDays").send();
                await resetConfigOperation.confirmation();

                // Final values
                governanceSatelliteStorage            = await governanceSatelliteInstance.storage();
                const resetFinancialReqApprovalPct    = governanceSatelliteStorage.config.financialRequestApprovalPercentage.toNumber();
                const resetFinancialReqDurationDays   = governanceSatelliteStorage.config.financialRequestDurationInDays.toNumber();

                assert.equal(resetFinancialReqApprovalPct, initialFinancialReqApprovalPct);
                assert.equal(resetFinancialReqDurationDays, initialFinancialReqDurationDays);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });


        it('%updateConfig             - admin (bob) should not be able to update financial required approval percentage beyond 100%', async () => {
            try{
                
                // Initial Values
                governanceSatelliteStorage          = await governanceSatelliteInstance.storage();
                const testValue = 10001;
                
                const initialFinancialReqApprovalPct  = governanceSatelliteStorage.config.financialRequestApprovalPercentage;

                // Operation
                var updateConfigOperation = await governanceSatelliteInstance.methods.updateConfig(testValue, "configFinancialReqApprovalPct");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                // Final values
                governanceSatelliteStorage              = await governanceSatelliteInstance.storage();
                const updatedFinancialReqApprovalPct    = governanceSatelliteStorage.config.financialRequestApprovalPercentage;

                // check that there is no change in config values
                assert.equal(updatedFinancialReqApprovalPct.toNumber(), initialFinancialReqApprovalPct.toNumber());
                assert.notEqual(updatedFinancialReqApprovalPct.toNumber(), testValue);

                
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%updateWhitelistContracts - admin (bob) should be able to add user (eve) to the Whitelisted Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "whitelistContracts";

                initialContractMapValue           = await helperFunctions.getStorageMapValue(governanceSatelliteStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await helperFunctions.updateWhitelistContracts(governanceSatelliteInstance, contractMapKey, eve.pkh, 'update');
                await updateWhitelistContractsOperation.confirmation()

                governanceSatelliteStorage = await governanceSatelliteInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(governanceSatelliteStorage, storageMap, contractMapKey);

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

                initialContractMapValue = await helperFunctions.getStorageMapValue(governanceSatelliteStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await helperFunctions.updateWhitelistContracts(governanceSatelliteInstance, contractMapKey, eve.pkh, 'remove');
                await updateWhitelistContractsOperation.confirmation()

                governanceSatelliteStorage = await governanceSatelliteInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(governanceSatelliteStorage, storageMap, contractMapKey);

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

                initialContractMapValue = await helperFunctions.getStorageMapValue(governanceSatelliteStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await helperFunctions.updateGeneralContracts(governanceSatelliteInstance, contractMapKey, eve.pkh, 'update');
                await updateGeneralContractsOperation.confirmation()

                governanceSatelliteStorage = await governanceSatelliteInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(governanceSatelliteStorage, storageMap, contractMapKey);

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

                initialContractMapValue = await helperFunctions.getStorageMapValue(governanceSatelliteStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await helperFunctions.updateGeneralContracts(governanceSatelliteInstance, contractMapKey, eve.pkh, 'remove');
                await updateGeneralContractsOperation.confirmation()

                governanceSatelliteStorage = await governanceSatelliteInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(governanceSatelliteStorage, storageMap, contractMapKey);

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
                transferOperation = await helperFunctions.fa2Transfer(mavrykFa2TokenInstance, user, governanceSatelliteAddress, tokenId, tokenAmount);
                await transferOperation.confirmation();
                
                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage();
                const initialUserBalance    = (await mavrykFa2TokenStorage.ledger.get(user)).toNumber()

                await helperFunctions.signerFactory(tezos, bob.sk);
                mistakenTransferOperation = await helperFunctions.mistakenTransferFa2Token(governanceSatelliteInstance, user, contractDeployments.mavrykFa2Token.address, tokenId, tokenAmount).send();
                await mistakenTransferOperation.confirmation();

                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage();
                const updatedUserBalance    = (await mavrykFa2TokenStorage.ledger.get(user)).toNumber();

                // increase in updated balance
                assert.equal(updatedUserBalance, initialUserBalance + tokenAmount);

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

    });



    describe('Access Control Checks', function () {

        beforeEach("Set signer to non-admin (mallory)", async () => {
            governanceSatelliteStorage = await governanceSatelliteInstance.storage();
            await helperFunctions.signerFactory(tezos, mallory.sk);
        });

        it('%setAdmin                 - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                governanceSatelliteStorage        = await governanceSatelliteInstance.storage();
                const currentAdmin  = doormanStorage.admin;

                // Operation
                setAdminOperation = await governanceSatelliteInstance.methods.setAdmin(mallory.pkh);
                await chai.expect(setAdminOperation.send()).to.be.rejected;

                // Final values
                governanceSatelliteStorage    = await governanceSatelliteInstance.storage();
                const newAdmin  = governanceSatelliteStorage.admin;

                // Assertions
                assert.strictEqual(newAdmin, currentAdmin);

            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%setGovernance            - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                governanceSatelliteStorage        = await governanceSatelliteInstance.storage();
                const currentGovernance  = governanceSatelliteStorage.governanceAddress;

                // Operation
                setGovernanceOperation = await governanceSatelliteInstance.methods.setGovernance(mallory.pkh);
                await chai.expect(setGovernanceOperation.send()).to.be.rejected;

                // Final values
                governanceSatelliteStorage        = await governanceSatelliteInstance.storage();
                const updatedGovernance  = governanceSatelliteStorage.governanceAddress;

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

                governanceSatelliteStorage       = await governanceSatelliteInstance.storage();   
                const initialMetadata   = await governanceSatelliteStorage.metadata.get(key);

                // Operation
                const updateOperation = await governanceSatelliteInstance.methods.updateMetadata(key, hash);
                await chai.expect(updateOperation.send()).to.be.rejected;

                // Final values
                governanceSatelliteStorage       = await governanceSatelliteInstance.storage();            
                const updatedData       = await governanceSatelliteStorage.metadata.get(key);

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
                governanceSatelliteStorage          = await governanceSatelliteInstance.storage();
                const testValue = 10;
                
                const initialFinancialReqApprovalPct  = governanceSatelliteStorage.config.financialRequestApprovalPercentage;
                const initialFinancialReqDurationDays = governanceSatelliteStorage.config.financialRequestDurationInDays;

                // Operation
                var updateConfigOperation = await governanceSatelliteInstance.methods.updateConfig(testValue, "configFinancialReqApprovalPct");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                updateConfigOperation = await governanceSatelliteInstance.methods.updateConfig(testValue, "configFinancialReqDurationDays");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                // Final values
                governanceSatelliteStorage              = await governanceSatelliteInstance.storage();
                const updatedFinancialReqApprovalPct    = governanceSatelliteStorage.config.financialRequestApprovalPercentage;
                const updatedFinancialReqDurationDays   = governanceSatelliteStorage.config.financialRequestDurationInDays;

                // check that there is no change in config values
                assert.equal(updatedFinancialReqApprovalPct.toNumber(), initialFinancialReqApprovalPct.toNumber());
                assert.notEqual(updatedFinancialReqApprovalPct.toNumber(), testValue);

                assert.equal(updatedFinancialReqDurationDays.toNumber(), initialFinancialReqDurationDays.toNumber());
                assert.notEqual(updatedFinancialReqDurationDays.toNumber(), testValue);
                
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%updateWhitelistContracts - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // init values
                contractMapKey  = "mallory";
                storageMap      = "whitelistContracts";

                initialContractMapValue = await helperFunctions.getStorageMapValue(governanceSatelliteStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await governanceSatelliteInstance.methods.updateWhitelistContracts(contractMapKey, alice.pkh, 'update')
                await chai.expect(updateWhitelistContractsOperation.send()).to.be.rejected;

                governanceSatelliteStorage       = await governanceSatelliteInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(governanceSatelliteStorage, storageMap, contractMapKey);

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

                initialContractMapValue = await helperFunctions.getStorageMapValue(governanceSatelliteStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await governanceSatelliteInstance.methods.updateGeneralContracts(contractMapKey, alice.pkh, 'update')
                await chai.expect(updateGeneralContractsOperation.send()).to.be.rejected;

                governanceSatelliteStorage       = await governanceSatelliteInstance.storage()
                updatedContractMapValue = await helperFunctions.getStorageMapValue(governanceSatelliteStorage, storageMap, contractMapKey);

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
                transferOperation = await helperFunctions.fa2Transfer(mavrykFa2TokenInstance, mallory.pkh, governanceSatelliteAddress, tokenId, tokenAmount);
                await transferOperation.confirmation();

                // mistaken transfer operation
                mistakenTransferOperation = await helperFunctions.mistakenTransferFa2Token(governanceSatelliteInstance, mallory.pkh, contractDeployments.mavrykFa2Token.address, tokenId, tokenAmount);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%setLambda                - non-admin (mallory) should not be able to call this entrypoint", async() => {
            try{

                // random lambda for testing
                const randomLambdaName  = "randomLambdaName";
                const randomLambdaBytes = "050200000cba0743096500000112075e09650000005a036e036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a0362036203620362036200000000036203620760036803690000000009650000000a0362036203620362036e00000000075e09650000006c09650000000a0362036203620362036200000000036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a036203620362036203620000000003620362076003680369000000000362075e07650765036203620362036c075e076507650368036e0362036e036200000000070702000001770743075e076507650368036e0362036e020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c03200342020000010e037a034c037a07430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700002034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f02000000090743036200810303270200000000072f020000000907430362009c0203270200000000070702000000600743036200808080809d8fc0d0bff2f1b26703420200000047037a034c037a0321052900080570000205290015034b031105710002031605700002033a0322072f020000001307430368010000000844495620627920300327020000000003160707020000001a037a037a03190332072c0200000002032002000000020327034f0707020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c032000808080809d8fc0d0bff2f1b2670342020000092d037a057a000505700005037a034c07430362008f03052100020529000f0529000307430359030a034c03190325072c0200000002032702000000020320053d036d05700002072e02000008a4072e020000007c057000030570000405700005057000060570000705200005072e020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000081c072e0200000044057000030570000405700005057000060570000705200005072e0200000010072e02000000020320020000000203200200000010072e020000000203200200000002032002000007cc072e0200000028057000030570000405700005057000060570000705200005072e02000000020320020000000203200200000798072e0200000774034c032003480521000305210003034c052900050316034c03190328072c020000000002000000090743036200880303270570000205210002034c0321052100030521000205290011034c0329072f020000002005290015074303620000074303620000074303620000074303620000054200050200000004034c03200743036200000521000203160319032a072c020000021c052100020521000407430362008e02057000020529000907430368010000000a64656c65676174696f6e034203420521000b034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f0200000009074303620081030327020000001a072f02000000060743035903030200000008032007430359030a074303620000034c072c020000007303200521000205210004034205210007034c0326052100030521000205290008034205700007034c03260521000205290005034c05290007034b0311052100030316033a0521000b034c0322072f02000000130743036801000000084449562062792030032702000000000316034c0316031202000000060570000603200521000305210003034205210008034c0326052100030521000205700004052900030312055000030571000205210003052100030570000405290005031205500005057100020521000305700002052100030570000403160312031205500001034c05210003034c0570000305290013034b031105500013034c02000000060570000503200521000205290015055000080521000205700002052900110570000205700003034c0346034c0350055000110571000205210003052900070743036200000790010000000c746f74616c5f737570706c790362072f020000000907430362008a01032702000000000521000405290007074303620000037703420790010000000b6765745f62616c616e63650362072f02000000090743036200890103270200000000034c052100090743036200a40105210004033a033a0322072f0200000013074303680100000008444956206279203003270200000000031605210009074303620002033a0312052100090521000a07430362008803033a033a0322072f020000001307430368010000000844495620627920300327020000000003160743036200a401034c0322072f0200000013074303680100000008444956206279203003270200000000031605210004033a05210009052100020322072f0200000013074303680100000008444956206279203003270200000000031605210005034b0311052100060570000a052100040322072f0200000013074303680100000008444956206279203003270200000000031605700007052900130312055000130571000507430362008c0305210004052100070342034205210009034c0326032005700005057000030342052100050570000305700002037a034c0570000305700002034b0311074303620000052100020319032a072c020000003b05210002034c057000030322072f02000000130743036801000000084449562062792030032702000000000316057000020529001503120550001502000000080570000205200002057100030521000405210003034c05290011034c0329072f0200000009074303620089030327020000000003210521000507430362008b03057000020316057000020342034205700007034c03260320032105700004057000020316034b031105500001052100040529000707430362000005700003034205210004037705700002037a057000040655055f0765046e000000062566726f6d5f065f096500000026046e0000000425746f5f04620000000925746f6b656e5f696404620000000725616d6f756e7400000000000000042574787300000009257472616e73666572072f0200000008074303620027032702000000000743036a0000053d0765036e055f096500000006036e0362036200000000053d096500000006036e036203620000000005700004057000050570000705420003031b057000040342031b034d0743036200000521000303160319032a072c02000000440521000405210003034205700005034c032605210003052100020570000403160312055000010571000205210005034c0570000505290013034b031105500013057100030200000006057000040320034c052100040529001505500008034c0521000405700004052900110570000305210005034c0346034c03500550001105710002052100030570000207430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700004034c03260655036e0000000e256f6e5374616b654368616e6765072f02000000090743036200b702032702000000000743036a000005700002034d053d036d034c031b034c031b02000000180570000305700004057000050570000605700007052000060200000036057000030570000405700005057000060570000705200005072e0200000010072e0200000002032002000000020320020000000203200342";

                const setLambdaOperation = governanceSatelliteInstance.methods.setLambda(randomLambdaName, randomLambdaBytes); 
                await chai.expect(setLambdaOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

    })
    

});