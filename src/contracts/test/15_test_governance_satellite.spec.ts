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
import { bob, alice, eve, mallory, oracle0, oracle1, oracle2, oracleMaintainer } from "../scripts/sandbox/accounts";

import doormanAddress                   from '../deployments/doormanAddress.json';
import delegationAddress                from '../deployments/delegationAddress.json';
import governanceAddress                from '../deployments/governanceAddress.json';
import governanceSatelliteAddress       from '../deployments/governanceSatelliteAddress.json';
import mvkTokenAddress                  from '../deployments/mvkTokenAddress.json';
import aggregatorAddress                from '../deployments/aggregatorAddress.json';
import aggregatorFactoryAddress         from '../deployments/aggregatorFactoryAddress.json';


import { config } from "yargs";

describe("Governance Satellite tests", async () => {
    var utils: Utils;

    let doormanInstance;
    let delegationInstance;
    let mvkTokenInstance;
    let governanceInstance;
    let governanceSatelliteInstance;
    let aggregatorInstance;
    let aggregatorFactoryInstance;
    
    let doormanStorage;
    let delegationStorage;
    let mvkTokenStorage;
    let governanceStorage;
    let governanceSatelliteStorage;
    let aggregatorStorage;
    let aggregatorFactoryStorage;
    
    
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
            aggregatorFactoryInstance       = await utils.tezos.contract.at(aggregatorFactoryAddress.address);
    
            doormanStorage                  = await doormanInstance.storage();
            delegationStorage               = await delegationInstance.storage();
            mvkTokenStorage                 = await mvkTokenInstance.storage();
            governanceStorage               = await governanceSatelliteInstance.storage();
            governanceSatelliteStorage      = await governanceSatelliteInstance.storage();
            aggregatorStorage               = await aggregatorInstance.storage();
            aggregatorFactoryStorage        = await aggregatorFactoryInstance.storage();
            
            console.log('-- -- -- -- -- Governance Satellite Tests -- -- -- --')
            console.log('Doorman Contract deployed at:'               , doormanInstance.address);
            console.log('Delegation Contract deployed at:'            , delegationInstance.address);
            console.log('MVK Token Contract deployed at:'             , mvkTokenInstance.address);
            console.log('Governance Contract deployed at:'            , governanceInstance.address);
            console.log('Governance Satellite Contract deployed at:'  , governanceSatelliteInstance.address);
            console.log('Aggregator Contract deployed at:'            , aggregatorInstance.address);
            console.log('Aggregator Factory Contract deployed at:'    , aggregatorFactoryInstance.address);
            
            console.log('Bob address: '     + bob.pkh);
            console.log('Alice address: '   + alice.pkh);
            console.log('Eve address: '     + eve.pkh);
            console.log('Mallory address: ' + mallory.pkh);
    
            // Setup governance satellites for action snapshot later
            // ------------------------------------------------------------------
    
            // Bob stakes 100 MVK tokens and registers as a satellite
            delegationStorage = await delegationInstance.storage();
            const satelliteMap = await delegationStorage.satelliteLedger;
            
            if(satelliteMap.get(bob.pkh) === undefined){

                var updateOperators = await mvkTokenInstance.methods
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
                await updateOperators.confirmation();  
                const bobStakeAmount                  = MVK(100);
                const bobStakeAmountOperation         = await doormanInstance.methods.stake(bobStakeAmount).send();
                await bobStakeAmountOperation.confirmation();                        
                const bobRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite("New Satellite by Bob", "New Satellite Description - Bob", "https://image.url", "https://image.url", "700").send();
                await bobRegisterAsSatelliteOperation.confirmation();
            }


            if(satelliteMap.get(alice.pkh) === undefined){

                // Alice stakes 100 MVK tokens and registers as a satellite 
                await signerFactory(alice.sk);
                updateOperators = await mvkTokenInstance.methods
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
                await updateOperators.confirmation(); 
                const aliceStakeAmount                  = MVK(100);
                const aliceStakeAmountOperation         = await doormanInstance.methods.stake(aliceStakeAmount).send();
                await aliceStakeAmountOperation.confirmation();                        
                const aliceRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite("New Satellite by Alice", "New Satellite Description - Alice", "https://image.url", "https://image.url", "700").send();
                await aliceRegisterAsSatelliteOperation.confirmation();
            }


            if(satelliteMap.get(eve.pkh) === undefined){

                // Eve stakes 100 MVK tokens and registers as a satellite 
                await signerFactory(eve.sk);
                updateOperators = await mvkTokenInstance.methods
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
                await updateOperators.confirmation(); 
                const eveStakeAmount                  = MVK(100);
                const eveStakeAmountOperation         = await doormanInstance.methods.stake(eveStakeAmount).send();
                await eveStakeAmountOperation.confirmation();                        
                const eveRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite("New Satellite by Eve", "New Satellite Description - Eve", "https://image.url", "https://image.url", "700").send();
                await eveRegisterAsSatelliteOperation.confirmation();
            }


            if(satelliteMap.get(mallory.pkh) === undefined){

                // Mallory stakes 100 MVK tokens and registers as a satellite 
                await signerFactory(mallory.sk);
                updateOperators = await mvkTokenInstance.methods
                    .update_operators([
                    {
                        add_operator: {
                            owner: mallory.pkh,
                            operator: doormanAddress.address,
                            token_id: 0,
                        },
                    },
                    ])
                    .send()
                await updateOperators.confirmation(); 
                const malloryStakeAmount                  = MVK(100);
                const malloryStakeAmountOperation         = await doormanInstance.methods.stake(malloryStakeAmount).send();
                await malloryStakeAmountOperation.confirmation();                        
                const malloryRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite("New Satellite by Mallory", "New Satellite Description - Mallory", "https://image.url", "https://image.url", "700").send();
                await malloryRegisterAsSatelliteOperation.confirmation();
            }

            // Setup Oracles
            await signerFactory(bob.sk);

            // const oracleMap = MichelsonMap.fromLiteral({
            //   [oracle0.pkh] : true,
            //   [oracle1.pkh] : true,
            //   [oracle2.pkh] : true,
            // }) as MichelsonMap<
            //     string,
            //     boolean
            //     >

            const oracleMap = MichelsonMap.fromLiteral({});

            // Setup Aggregators
            const createAggregatorsBatch = await utils.tezos.wallet
            .batch()
            .withContractCall(aggregatorFactoryInstance.methods.createAggregator(
                'USD',
                'BTC',
                
                oracleMap,

                new BigNumber(8),             // decimals
                new BigNumber(2),             // numberBlocksDelay
                oracleMaintainer.pkh,         // maintainer

                new BigNumber(0),             // minimalTezosAmountDeviationTrigger
                new BigNumber(5),             // perthousandDeviationTrigger
                new BigNumber(60),            // percentOracleThreshold

                new BigNumber(2600),          // deviationRewardAmountXtz
                new BigNumber(5),             // rewardAmountMvk
                new BigNumber(1300),          // rewardAmountXtz
                
                governanceSatelliteAddress.address
            ))
            .withContractCall(aggregatorFactoryInstance.methods.createAggregator(
                'USD',
                'XTZ',

                oracleMap,

                new BigNumber(8),             // decimals
                new BigNumber(2),             // numberBlocksDelay
                oracleMaintainer.pkh,         // maintainer
                
                new BigNumber(0),             // minimalTezosAmountDeviationTrigger
                new BigNumber(5),             // perthousandDeviationTrigger
                new BigNumber(60),            // percentOracleThreshold

                new BigNumber(2600),          // deviationRewardAmountXtz
                new BigNumber(5),             // rewardAmountMvk
                new BigNumber(1300),          // rewardAmountXtz
                
                governanceSatelliteAddress.address
            ))
            .withContractCall(aggregatorFactoryInstance.methods.createAggregator(
                'USD',
                'DOGE',

                oracleMap,

                new BigNumber(16),            // decimals
                new BigNumber(2),             // numberBlocksDelay
                oracleMaintainer.pkh,         // maintainer
                
                new BigNumber(0),             // minimalTezosAmountDeviationTrigger
                new BigNumber(5),             // perthousandDeviationTrigger
                new BigNumber(60),            // percentOracleThreshold
                
                new BigNumber(2600),          // deviationRewardAmountXtz
                new BigNumber(5),             // rewardAmountMvk
                new BigNumber(1300),          // rewardAmountXtz
                
                governanceSatelliteAddress.address
            ))

          const createAggregatorsBatchOperation = await createAggregatorsBatch.send()
          await createAggregatorsBatchOperation.confirmation()

          console.log("Aggregators deployed")


        } catch(e) {
            console.dir(e, {depth: 5})
        }
    });

    

    // describe("%setAdmin", async () => {

    //     beforeEach("Set signer to admin", async () => {
    //         await signerFactory(bob.sk)
    //     });

    //     it('Admin should be able to call this entrypoint and update the contract administrator with a new address', async () => {
    //         try{

    //             // Initial Values
    //             governanceSatelliteStorage = await governanceSatelliteInstance.storage();
    //             const currentAdmin = governanceSatelliteStorage.admin;

    //             // Operation
    //             const setAdminOperation = await governanceSatelliteInstance.methods.setAdmin(alice.pkh).send();
    //             await setAdminOperation.confirmation();

    //             // Final values
    //             governanceSatelliteStorage = await governanceSatelliteInstance.storage();
    //             const newAdmin = governanceSatelliteStorage.admin;

    //             // reset admin
    //             await signerFactory(alice.sk);
    //             const resetAdminOperation = await governanceSatelliteInstance.methods.setAdmin(bob.pkh).send();
    //             await resetAdminOperation.confirmation();

    //             // Assertions
    //             assert.notStrictEqual(newAdmin, currentAdmin);
    //             assert.strictEqual(newAdmin, alice.pkh);
    //             assert.strictEqual(currentAdmin, bob.pkh);

    //         } catch(e){
    //             console.log(e);
    //         }
    //     });

    //     it('Non-admin should not be able to call this entrypoint', async () => {
    //         try{
    //             // Initial Values
    //             await signerFactory(alice.sk);
    //             governanceSatelliteStorage = await governanceSatelliteInstance.storage();
    //             const currentAdmin = governanceSatelliteStorage.admin;

    //             // Operation
    //             await chai.expect(governanceSatelliteInstance.methods.setAdmin(alice.pkh).send()).to.be.rejected;

    //             // Final values
    //             governanceSatelliteStorage = await governanceSatelliteInstance.storage();
    //             const newAdmin = governanceSatelliteStorage.admin;

    //             // Assertions
    //             assert.strictEqual(newAdmin, currentAdmin);
    //         } catch(e){
    //             console.log(e);
    //         }
    //     });
        
    // }); // end %setAdmin tests

    

    // describe("%setGovernance", async () => {

    //     beforeEach("Set signer to admin", async () => {
    //         await signerFactory(bob.sk)
    //     });

    //     it('Admin should be able to call this entrypoint and update the governance contract with a new address', async () => {
    //         try{
    //             // Initial Values
    //             governanceSatelliteStorage = await governanceSatelliteInstance.storage();
    //             const currentGovernance = governanceSatelliteStorage.governanceAddress;

    //             // Operation
    //             const setGovernanceOperation = await governanceSatelliteInstance.methods.setGovernance(alice.pkh).send();
    //             await setGovernanceOperation.confirmation();

    //             // Final values
    //             governanceSatelliteStorage = await governanceSatelliteInstance.storage();
    //             const newGovernance = governanceSatelliteStorage.governanceAddress;

    //             // reset admin
    //             await signerFactory(alice.sk);
    //             const resetGovernanceOperation = await governanceSatelliteInstance.methods.setGovernance(governanceAddress.address).send();
    //             await resetGovernanceOperation.confirmation();

    //             // Assertions
    //             assert.notStrictEqual(newGovernance, currentGovernance);
    //             assert.strictEqual(newGovernance, alice.pkh);
    //             assert.strictEqual(currentGovernance, governanceAddress.address);

    //         } catch(e){
    //             console.log(e);
    //         }
    //     });

    //     it('Non-admin should not be able to call this entrypoint', async () => {
    //         try{
    //             // Initial Values
    //             await signerFactory(alice.sk);
    //             governanceSatelliteStorage = await governanceSatelliteInstance.storage();
    //             const currentGovernance = governanceSatelliteStorage.governanceAddress;

    //             // Operation
    //             await chai.expect(governanceSatelliteInstance.methods.setGovernance(alice.pkh).send()).to.be.rejected;

    //             // Final values
    //             governanceSatelliteStorage = await governanceSatelliteInstance.storage();
    //             const newGovernance = governanceSatelliteStorage.governanceAddress;

    //             // Assertions
    //             assert.strictEqual(newGovernance, currentGovernance);
    //         } catch(e){
    //             console.log(e);
    //         }
    //     });
        
    // }); // end %setGovernance tests

    // describe("%updateConfig", async () => {

    //     beforeEach("Set signer to admin", async () => {
    //         await signerFactory(bob.sk)
    //     });

    //     it('Admin should not be able to call the entrypoint and configure the voting power ratio if it exceed 100%', async () => {
    //         try{
    //             // Initial Values
    //             governanceSatelliteStorage = await governanceSatelliteInstance.storage();
    //             const currentConfigValue = governanceSatelliteStorage.config.votingPowerRatio;
    //             const newConfigValue = 10001;

    //             // Operation
    //             await chai.expect(governanceSatelliteInstance.methods.updateConfig(newConfigValue, "configVotingPowerRatio").send()).to.be.rejected;

    //             // Final values
    //             governanceSatelliteStorage = await governanceSatelliteInstance.storage();
    //             const updateConfigValue = governanceSatelliteStorage.config.votingPowerRatio;

    //             // Assertions
    //             assert.notEqual(newConfigValue, currentConfigValue);
    //             assert.equal(updateConfigValue.toNumber(), currentConfigValue.toNumber());

    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin should be able to call the entrypoint and configure the approval percentage', async () => {
    //         try{
    //             // Initial Values
    //             governanceSatelliteStorage = await governanceSatelliteInstance.storage();
    //             const newConfigValue = 6700;

    //             // Operation
    //             const updateConfigOperation = await governanceSatelliteInstance.methods.updateConfig(newConfigValue,"configApprovalPercentage").send();
    //             await updateConfigOperation.confirmation();

    //             // Final values
    //             governanceSatelliteStorage = await governanceSatelliteInstance.storage();
    //             const updateConfigValue = governanceSatelliteStorage.config.governanceSatelliteApprovalPercentage;

    //             // Assertions
    //             assert.equal(updateConfigValue, newConfigValue);
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin should not be able to call the entrypoint and configure the approval percentage if it exceed 100%', async () => {
    //         try{
    //             // Initial Values
    //             governanceSatelliteStorage = await governanceSatelliteInstance.storage();
    //             const currentConfigValue = governanceSatelliteStorage.config.governanceSatelliteApprovalPercentage;
    //             const newConfigValue = 10001;

    //             // Operation
    //             await chai.expect(governanceSatelliteInstance.methods.updateConfig(newConfigValue,"configApprovalPercentage").send()).to.be.rejected;

    //             // Final values
    //             governanceSatelliteStorage = await governanceSatelliteInstance.storage();
    //             const updateConfigValue = governanceSatelliteStorage.config.governanceSatelliteApprovalPercentage;

    //             // Assertions
    //             assert.notEqual(newConfigValue, currentConfigValue);
    //             assert.equal(updateConfigValue.toNumber(), currentConfigValue.toNumber());
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Admin should be able to call the entrypoint and configure the action duration in days', async () => {
    //         try{
    //             // Initial Values
    //             governanceSatelliteStorage = await governanceSatelliteInstance.storage();
    //             const newConfigValue = 1;

    //             // Operation
    //             const updateConfigOperation = await governanceSatelliteInstance.methods.updateConfig(newConfigValue,"configSatelliteDurationInDays").send();
    //             await updateConfigOperation.confirmation();

    //             // Final values
    //             governanceSatelliteStorage = await governanceSatelliteInstance.storage();
    //             const updateConfigValue = governanceSatelliteStorage.config.governanceSatelliteDurationInDays;

    //             // Assertions
    //             assert.equal(updateConfigValue, newConfigValue);
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });

    //     it('Non-admin should not be able to call the entrypoint', async () => {
    //         try{
    //             // Initial Values
    //             governanceSatelliteStorage = await governanceSatelliteInstance.storage();
    //             const currentConfigValue = governanceSatelliteStorage.config.governanceSatelliteDurationInDays;
    //             const newConfigValue = 1;

    //             // Operation
    //             await signerFactory(alice.sk)
    //             await chai.expect(governanceSatelliteInstance.methods.updateConfig(newConfigValue,"configSatelliteDurationInDays").send()).to.be.rejected;

    //             // Final values
    //             governanceSatelliteStorage = await governanceSatelliteInstance.storage();
    //             const updateConfigValue = governanceSatelliteStorage.config.governanceSatelliteDurationInDays;

    //             // Assertions
    //             assert.equal(updateConfigValue.toNumber(), currentConfigValue.toNumber());
    //         } catch(e){
    //             console.dir(e, {depth: 5})
    //         }
    //     });
    // }); // end %updateConfig tests

  //   describe("%suspendSatellite, #unsuspendSatellite", async () => {

  //       it('Any satellite should be able to create a governance action to suspend a satellite', async () => {
  //           try{        

  //             // some init constants
  //               governanceSatelliteStorage     = await governanceSatelliteInstance.storage();
  //               const delegationStorage        = await delegationInstance.storage();        
  //               const aliceSatelliteRecord     = await delegationStorage.satelliteLedger.get(alice.pkh);

  //               assert.equal(aliceSatelliteRecord.status, "ACTIVE");

  //               const actionId                 = governanceSatelliteStorage.governanceSatelliteCounter;
  //               const bobStakeAmount           = MVK(100);
  //               const aliceStakeAmount         = MVK(100);
  //               const eveStakeAmount           = MVK(100);
  //               const malloryStakeAmount       = MVK(100);

  //               // governance satellite action params
  //               const satelliteToBeSuspended   = alice.pkh;
  //               const purpose                  = "Test Suspend Satellite";            
    
  //               // Satellite Bob creates a governance action - suspend Alice
  //               await signerFactory(bob.sk);
  //               const governanceSatelliteOperation = await governanceSatelliteInstance.methods.suspendSatellite(
  //                       satelliteToBeSuspended,
  //                       purpose
  //                   ).send();
  //               await governanceSatelliteOperation.confirmation();
    

  //               governanceSatelliteStorage                     = await governanceSatelliteInstance.storage();
  //               const governanceAction                         = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
  //               const governanceSatelliteActionSnapshotLedger  = await governanceSatelliteStorage.governanceSatelliteSnapshotLedger.get(actionId);
                
  //               const governanceSatelliteApprovalPercentage    = governanceSatelliteStorage.config.governanceSatelliteApprovalPercentage;
  //               const governanceSatellitePercentageDecimals    = 4;
  //               const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount + eveStakeAmount + malloryStakeAmount;
  //               const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * governanceSatelliteApprovalPercentage) / (10 ** governanceSatellitePercentageDecimals);

    
  //               // check details of financial request
  //               assert.equal(governanceAction.initiator,                                 bob.pkh);
  //               assert.equal(governanceAction.governanceType,                            "SUSPEND");
  //               assert.equal(governanceAction.status,                                    true);
  //               assert.equal(governanceAction.executed,                                  false);
  //               assert.equal(governanceAction.governancePurpose,                         purpose);
  //               assert.equal(governanceAction.yayVoteTotal.toNumber(),                   0);
  //               assert.equal(governanceAction.nayVoteTotal.toNumber(),                   0);
  //               assert.equal(governanceAction.passVoteTotal.toNumber(),                  0);
  //               assert.equal(governanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
  //               assert.equal(governanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
                
  //               // check details of governance satellite action snapshot ledger
  //               const bobSnapshot = await governanceSatelliteActionSnapshotLedger.get(bob.pkh);
  //               assert.equal(bobSnapshot.totalDelegatedAmount.toNumber(),        0);
  //               assert.equal(bobSnapshot.totalStakedMvkBalance.toNumber(),       bobStakeAmount);
  //               assert.equal(bobSnapshot.totalVotingPower.toNumber(),            bobStakeAmount);
    
  //               const aliceSnapshot   = await governanceSatelliteActionSnapshotLedger.get(alice.pkh);
  //               assert.equal(aliceSnapshot.totalDelegatedAmount.toNumber(),      0);
  //               assert.equal(aliceSnapshot.totalStakedMvkBalance.toNumber(),     aliceStakeAmount);
  //               assert.equal(aliceSnapshot.totalVotingPower.toNumber(),          aliceStakeAmount);

  //               const eveSnapshot   = await governanceSatelliteActionSnapshotLedger.get(eve.pkh);
  //               assert.equal(eveSnapshot.totalDelegatedAmount.toNumber(),        0);
  //               assert.equal(eveSnapshot.totalStakedMvkBalance.toNumber(),       eveStakeAmount);
  //               assert.equal(eveSnapshot.totalVotingPower.toNumber(),            eveStakeAmount);

  //               const mallorySnapshot   = await governanceSatelliteActionSnapshotLedger.get(mallory.pkh);
  //               assert.equal(mallorySnapshot.totalDelegatedAmount.toNumber(),    0);
  //               assert.equal(mallorySnapshot.totalStakedMvkBalance.toNumber(),   malloryStakeAmount);
  //               assert.equal(mallorySnapshot.totalVotingPower.toNumber(),        malloryStakeAmount);
    
  //               // 3 satellites vote yay, one satellite votes nay
  //               await signerFactory(bob.sk);
  //               const bobVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
  //               await bobVotesForGovernanceActionOperation.confirmation();
    
  //               await signerFactory(eve.sk);
  //               const eveVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
  //               await eveVotesForGovernanceActionOperation.confirmation();
                
  //               await signerFactory(alice.sk);
  //               const aliceVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "nay").send();
  //               await aliceVotesForGovernanceActionOperation.confirmation();

  //               await signerFactory(mallory.sk);
  //               const malloryVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
  //               await malloryVotesForGovernanceActionOperation.confirmation();
    
  //               // get updated storage
  //               const updatedGovernanceSatelliteStorage                = await governanceSatelliteInstance.storage();        
  //               const updatedGovernanceAction                          = await updatedGovernanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);              

  //               const updatedDelegationStorage                         = await delegationInstance.storage();        
  //               const updatedAliceSatelliteRecord                      = await updatedDelegationStorage.satelliteLedger.get(alice.pkh);

  //               // check that governance action has been executed
  //               assert.equal(updatedGovernanceAction.yayVoteTotal,            MVK(300));
  //               assert.equal(updatedGovernanceAction.nayVoteTotal,            MVK(100));
  //               assert.equal(updatedGovernanceAction.status,                  true);
  //               assert.equal(updatedGovernanceAction.executed,                true);

  //               // check that alice is now suspended
  //               assert.equal(updatedAliceSatelliteRecord.status,              "SUSPENDED");
            
  //           } catch(e){
  //               console.dir(e, {depth: 5})
  //           } 
  //       });

        
  //       it('Any satellite should be able to create a governance action to unsuspend a satellite', async () => {
  //         try{        

  //           // some init constants
  //             governanceSatelliteStorage     = await governanceSatelliteInstance.storage();
  //             const delegationStorage        = await delegationInstance.storage();        
  //             const aliceSatelliteRecord     = await delegationStorage.satelliteLedger.get(alice.pkh);

  //             assert.equal(aliceSatelliteRecord.status, "SUSPENDED");

  //             const actionId                 = governanceSatelliteStorage.governanceSatelliteCounter;
  //             const bobStakeAmount           = MVK(100);
  //             const aliceStakeAmount         = MVK(100);
  //             const eveStakeAmount           = MVK(100);
  //             const malloryStakeAmount       = MVK(100);

  //             // governance satellite action params
  //             const satelliteToBeSuspended   = alice.pkh;
  //             const purpose                  = "Test Unsuspend Satellite";            
  
  //             // Satellite Bob creates a governance action - unsuspend Alice
  //             await signerFactory(bob.sk);
  //             const governanceSatelliteOperation = await governanceSatelliteInstance.methods.unsuspendSatellite(
  //                     satelliteToBeSuspended,
  //                     purpose
  //                 ).send();
  //             await governanceSatelliteOperation.confirmation();
  

  //             governanceSatelliteStorage                     = await governanceSatelliteInstance.storage();
  //             const governanceAction                         = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
  //             const governanceSatelliteActionSnapshotLedger  = await governanceSatelliteStorage.governanceSatelliteSnapshotLedger.get(actionId);
              
  //             const governanceSatelliteApprovalPercentage    = governanceSatelliteStorage.config.governanceSatelliteApprovalPercentage;
  //             const governanceSatellitePercentageDecimals    = 4;
  //             const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount + eveStakeAmount + malloryStakeAmount;
  //             const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * governanceSatelliteApprovalPercentage) / (10 ** governanceSatellitePercentageDecimals);

  
  //             // check details of financial request
  //             assert.equal(governanceAction.initiator,                                 bob.pkh);
  //             assert.equal(governanceAction.governanceType,                            "UNSUSPEND");
  //             assert.equal(governanceAction.status,                                    true);
  //             assert.equal(governanceAction.executed,                                  false);
  //             assert.equal(governanceAction.governancePurpose,                         purpose);
  //             assert.equal(governanceAction.yayVoteTotal.toNumber(),                   0);
  //             assert.equal(governanceAction.nayVoteTotal.toNumber(),                   0);
  //             assert.equal(governanceAction.passVoteTotal.toNumber(),                  0);
  //             assert.equal(governanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
  //             assert.equal(governanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
              
  //             // check details of governance satellite action snapshot ledger
  //             const bobSnapshot = await governanceSatelliteActionSnapshotLedger.get(bob.pkh);
  //             assert.equal(bobSnapshot.totalDelegatedAmount.toNumber(),        0);
  //             assert.equal(bobSnapshot.totalStakedMvkBalance.toNumber(),       bobStakeAmount);
  //             assert.equal(bobSnapshot.totalVotingPower.toNumber(),            bobStakeAmount);
  
  //             const aliceSnapshot   = await governanceSatelliteActionSnapshotLedger.get(alice.pkh);
  //             assert.equal(aliceSnapshot, undefined);
              
  //             const eveSnapshot   = await governanceSatelliteActionSnapshotLedger.get(eve.pkh);
  //             assert.equal(eveSnapshot.totalDelegatedAmount.toNumber(),        0);
  //             assert.equal(eveSnapshot.totalStakedMvkBalance.toNumber(),       eveStakeAmount);
  //             assert.equal(eveSnapshot.totalVotingPower.toNumber(),            eveStakeAmount);

  //             const mallorySnapshot   = await governanceSatelliteActionSnapshotLedger.get(mallory.pkh);
  //             assert.equal(mallorySnapshot.totalDelegatedAmount.toNumber(),    0);
  //             assert.equal(mallorySnapshot.totalStakedMvkBalance.toNumber(),   malloryStakeAmount);
  //             assert.equal(mallorySnapshot.totalVotingPower.toNumber(),        malloryStakeAmount);
  
  //             // 3 satellites vote yay 
  //             await signerFactory(bob.sk);
  //             const bobVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
  //             await bobVotesForGovernanceActionOperation.confirmation();
  
  //             await signerFactory(eve.sk);
  //             const eveVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
  //             await eveVotesForGovernanceActionOperation.confirmation();

  //             await signerFactory(mallory.sk);
  //             const malloryVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
  //             await malloryVotesForGovernanceActionOperation.confirmation();
  
  //             // get updated storage
  //             const updatedGovernanceSatelliteStorage                = await governanceSatelliteInstance.storage();        
  //             const updatedGovernanceAction                          = await updatedGovernanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);              

  //             const updatedDelegationStorage                         = await delegationInstance.storage();        
  //             const updatedAliceSatelliteRecord                      = await updatedDelegationStorage.satelliteLedger.get(alice.pkh);

  //             // check that governance action has been executed
  //             assert.equal(updatedGovernanceAction.yayVoteTotal,            MVK(300));
  //             assert.equal(updatedGovernanceAction.nayVoteTotal,            0);
  //             assert.equal(updatedGovernanceAction.status,                  true);
  //             assert.equal(updatedGovernanceAction.executed,                true);

  //             // check that alice is now active
  //             assert.equal(updatedAliceSatelliteRecord.status,              "ACTIVE");
          
  //         } catch(e){
  //             console.dir(e, {depth: 5})
  //         } 
  //     });
        
  //   });


  //   describe("%banSatellite, #unbanSatellite", async () => {

  //     it('Any satellite should be able to create a governance action to ban a satellite', async () => {
  //         try{        

  //           // some init constants
  //             governanceSatelliteStorage     = await governanceSatelliteInstance.storage();
  //             const delegationStorage        = await delegationInstance.storage();        
  //             const aliceSatelliteRecord     = await delegationStorage.satelliteLedger.get(alice.pkh);

  //             assert.equal(aliceSatelliteRecord.status, "ACTIVE");

  //             const actionId                 = governanceSatelliteStorage.governanceSatelliteCounter;
  //             const bobStakeAmount           = MVK(100);
  //             const aliceStakeAmount         = MVK(100);
  //             const eveStakeAmount           = MVK(100);
  //             const malloryStakeAmount       = MVK(100);

  //             // governance satellite action params
  //             const satelliteToBeSuspended   = alice.pkh;
  //             const purpose                  = "Test Ban Satellite";            
  
  //             // Satellite Bob creates a governance action to ban Alice
  //             await signerFactory(bob.sk);
  //             const governanceSatelliteOperation = await governanceSatelliteInstance.methods.banSatellite(
  //                     satelliteToBeSuspended,
  //                     purpose
  //                 ).send();
  //             await governanceSatelliteOperation.confirmation();
  

  //             governanceSatelliteStorage                     = await governanceSatelliteInstance.storage();
  //             const governanceAction                         = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
  //             const governanceSatelliteActionSnapshotLedger  = await governanceSatelliteStorage.governanceSatelliteSnapshotLedger.get(actionId);
              
  //             const governanceSatelliteApprovalPercentage    = governanceSatelliteStorage.config.governanceSatelliteApprovalPercentage;
  //             const governanceSatellitePercentageDecimals    = 4;
  //             const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount + eveStakeAmount + malloryStakeAmount;
  //             const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * governanceSatelliteApprovalPercentage) / (10 ** governanceSatellitePercentageDecimals);

  
  //             // check details of financial request
  //             assert.equal(governanceAction.initiator,                                 bob.pkh);
  //             assert.equal(governanceAction.governanceType,                            "BAN");
  //             assert.equal(governanceAction.status,                                    true);
  //             assert.equal(governanceAction.executed,                                  false);
  //             assert.equal(governanceAction.governancePurpose,                         purpose);
  //             assert.equal(governanceAction.yayVoteTotal.toNumber(),                   0);
  //             assert.equal(governanceAction.nayVoteTotal.toNumber(),                   0);
  //             assert.equal(governanceAction.passVoteTotal.toNumber(),                  0);
  //             assert.equal(governanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
  //             assert.equal(governanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
              
  //             // check details of governance satellite action snapshot ledger
  //             const bobSnapshot = await governanceSatelliteActionSnapshotLedger.get(bob.pkh);
  //             assert.equal(bobSnapshot.totalDelegatedAmount.toNumber(),        0);
  //             assert.equal(bobSnapshot.totalStakedMvkBalance.toNumber(),       bobStakeAmount);
  //             assert.equal(bobSnapshot.totalVotingPower.toNumber(),            bobStakeAmount);
  
  //             const aliceSnapshot   = await governanceSatelliteActionSnapshotLedger.get(alice.pkh);
  //             assert.equal(aliceSnapshot.totalDelegatedAmount.toNumber(),      0);
  //             assert.equal(aliceSnapshot.totalStakedMvkBalance.toNumber(),     aliceStakeAmount);
  //             assert.equal(aliceSnapshot.totalVotingPower.toNumber(),          aliceStakeAmount);

  //             const eveSnapshot   = await governanceSatelliteActionSnapshotLedger.get(eve.pkh);
  //             assert.equal(eveSnapshot.totalDelegatedAmount.toNumber(),        0);
  //             assert.equal(eveSnapshot.totalStakedMvkBalance.toNumber(),       eveStakeAmount);
  //             assert.equal(eveSnapshot.totalVotingPower.toNumber(),            eveStakeAmount);

  //             const mallorySnapshot   = await governanceSatelliteActionSnapshotLedger.get(mallory.pkh);
  //             assert.equal(mallorySnapshot.totalDelegatedAmount.toNumber(),    0);
  //             assert.equal(mallorySnapshot.totalStakedMvkBalance.toNumber(),   malloryStakeAmount);
  //             assert.equal(mallorySnapshot.totalVotingPower.toNumber(),        malloryStakeAmount);
  
  //             // 3 satellites vote yay, one satellite votes nay
  //             await signerFactory(bob.sk);
  //             const bobVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
  //             await bobVotesForGovernanceActionOperation.confirmation();
  
  //             await signerFactory(eve.sk);
  //             const eveVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
  //             await eveVotesForGovernanceActionOperation.confirmation();
              
  //             await signerFactory(alice.sk);
  //             const aliceVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "nay").send();
  //             await aliceVotesForGovernanceActionOperation.confirmation();

  //             await signerFactory(mallory.sk);
  //             const malloryVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
  //             await malloryVotesForGovernanceActionOperation.confirmation();
  
  //             // get updated storage
  //             const updatedGovernanceSatelliteStorage                = await governanceSatelliteInstance.storage();        
  //             const updatedGovernanceAction                          = await updatedGovernanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);              

  //             const updatedDelegationStorage                         = await delegationInstance.storage();        
  //             const updatedAliceSatelliteRecord                      = await updatedDelegationStorage.satelliteLedger.get(alice.pkh);

  //             // check that governance action has been executed
  //             assert.equal(updatedGovernanceAction.yayVoteTotal,            MVK(300));
  //             assert.equal(updatedGovernanceAction.nayVoteTotal,            MVK(100));
  //             assert.equal(updatedGovernanceAction.status,                  true);
  //             assert.equal(updatedGovernanceAction.executed,                true);

  //             // check that alice is now banned
  //             assert.equal(updatedAliceSatelliteRecord.status,              "BANNED");
          
  //         } catch(e){
  //             console.dir(e, {depth: 5})
  //         } 
  //     });

      
  //     it('Any satellite should be able to create a governance action to unban a satellite', async () => {
  //       try{        

  //         // some init constants
  //           governanceSatelliteStorage     = await governanceSatelliteInstance.storage();
  //           const delegationStorage        = await delegationInstance.storage();        
  //           const aliceSatelliteRecord     = await delegationStorage.satelliteLedger.get(alice.pkh);

  //           assert.equal(aliceSatelliteRecord.status, "BANNED");

  //           const actionId                 = governanceSatelliteStorage.governanceSatelliteCounter;
  //           const bobStakeAmount           = MVK(100);
  //           const aliceStakeAmount         = MVK(100);
  //           const eveStakeAmount           = MVK(100);
  //           const malloryStakeAmount       = MVK(100);

  //           // governance satellite action params
  //           const satelliteToBeSuspended   = alice.pkh;
  //           const purpose                  = "Test Unban Satellite";            

  //           // Satellite Bob creates a governance action - unban Alice
  //           await signerFactory(bob.sk);
  //           const governanceSatelliteOperation = await governanceSatelliteInstance.methods.unbanSatellite(
  //                   satelliteToBeSuspended,
  //                   purpose
  //               ).send();
  //           await governanceSatelliteOperation.confirmation();


  //           governanceSatelliteStorage                     = await governanceSatelliteInstance.storage();
  //           const governanceAction                         = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
  //           const governanceSatelliteActionSnapshotLedger  = await governanceSatelliteStorage.governanceSatelliteSnapshotLedger.get(actionId);
            
  //           const governanceSatelliteApprovalPercentage    = governanceSatelliteStorage.config.governanceSatelliteApprovalPercentage;
  //           const governanceSatellitePercentageDecimals    = 4;
  //           const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount + eveStakeAmount + malloryStakeAmount;
  //           const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * governanceSatelliteApprovalPercentage) / (10 ** governanceSatellitePercentageDecimals);


  //           // check details of financial request
  //           assert.equal(governanceAction.initiator,                                 bob.pkh);
  //           assert.equal(governanceAction.governanceType,                            "UNBAN");
  //           assert.equal(governanceAction.status,                                    true);
  //           assert.equal(governanceAction.executed,                                  false);
  //           assert.equal(governanceAction.governancePurpose,                         purpose);
  //           assert.equal(governanceAction.yayVoteTotal.toNumber(),                   0);
  //           assert.equal(governanceAction.nayVoteTotal.toNumber(),                   0);
  //           assert.equal(governanceAction.passVoteTotal.toNumber(),                  0);
  //           assert.equal(governanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
  //           assert.equal(governanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
            
  //           // check details of governance satellite action snapshot ledger
  //           const bobSnapshot = await governanceSatelliteActionSnapshotLedger.get(bob.pkh);
  //           assert.equal(bobSnapshot.totalDelegatedAmount.toNumber(),        0);
  //           assert.equal(bobSnapshot.totalStakedMvkBalance.toNumber(),       bobStakeAmount);
  //           assert.equal(bobSnapshot.totalVotingPower.toNumber(),            bobStakeAmount);

  //           const aliceSnapshot   = await governanceSatelliteActionSnapshotLedger.get(alice.pkh);
  //           assert.equal(aliceSnapshot, undefined);
            
  //           const eveSnapshot   = await governanceSatelliteActionSnapshotLedger.get(eve.pkh);
  //           assert.equal(eveSnapshot.totalDelegatedAmount.toNumber(),        0);
  //           assert.equal(eveSnapshot.totalStakedMvkBalance.toNumber(),       eveStakeAmount);
  //           assert.equal(eveSnapshot.totalVotingPower.toNumber(),            eveStakeAmount);

  //           const mallorySnapshot   = await governanceSatelliteActionSnapshotLedger.get(mallory.pkh);
  //           assert.equal(mallorySnapshot.totalDelegatedAmount.toNumber(),    0);
  //           assert.equal(mallorySnapshot.totalStakedMvkBalance.toNumber(),   malloryStakeAmount);
  //           assert.equal(mallorySnapshot.totalVotingPower.toNumber(),        malloryStakeAmount);

  //           // 3 satellites vote yay to unban alice satellite
  //           await signerFactory(bob.sk);
  //           const bobVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
  //           await bobVotesForGovernanceActionOperation.confirmation();

  //           await signerFactory(eve.sk);
  //           const eveVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
  //           await eveVotesForGovernanceActionOperation.confirmation();

  //           await signerFactory(mallory.sk);
  //           const malloryVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
  //           await malloryVotesForGovernanceActionOperation.confirmation();

  //           // get updated storage
  //           const updatedGovernanceSatelliteStorage                = await governanceSatelliteInstance.storage();        
  //           const updatedGovernanceAction                          = await updatedGovernanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);              

  //           const updatedDelegationStorage                         = await delegationInstance.storage();        
  //           const updatedAliceSatelliteRecord                      = await updatedDelegationStorage.satelliteLedger.get(alice.pkh);

  //           // check that governance action has been executed
  //           assert.equal(updatedGovernanceAction.yayVoteTotal,            MVK(300));
  //           assert.equal(updatedGovernanceAction.nayVoteTotal,            0);
  //           assert.equal(updatedGovernanceAction.status,                  true);
  //           assert.equal(updatedGovernanceAction.executed,                true);

  //           // check that alice is now unbanned - status set to ACTIVE
  //           assert.equal(updatedAliceSatelliteRecord.status,              "ACTIVE");
        
  //       } catch(e){
  //           console.dir(e, {depth: 5})
  //       } 
  //   });

  // });

  describe("%addOracleToAggregator, #removeOracleInAggregator", async () => {

    it('Any satellite should be able to create a governance action to add oracle to aggregator', async () => {
        try{        

            // some init constants
            governanceSatelliteStorage     = await governanceSatelliteInstance.storage();
            aggregatorFactoryStorage       = await aggregatorFactoryInstance.storage();

            const pairOne = "USD";
            const pairTwo = "BTC";
            const usdBtcKey = {
              0 : pairOne,
              1 : pairTwo
            }
            const usdBtcAggregatorAddress  = aggregatorFactoryStorage.trackedAggregators.get(usdBtcKey);
            
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
            await signerFactory(bob.sk);
            const governanceSatelliteOperation = await governanceSatelliteInstance.methods.addOracleToAggregator(
                    oracleAddress,
                    aggregatorAddress,
                    purpose
                ).send();
            await governanceSatelliteOperation.confirmation();


            governanceSatelliteStorage                     = await governanceSatelliteInstance.storage();
            const governanceAction                         = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
            const governanceSatelliteActionSnapshotLedger  = await governanceSatelliteStorage.governanceSatelliteSnapshotLedger.get(actionId);
            
            const governanceSatelliteApprovalPercentage    = governanceSatelliteStorage.config.governanceSatelliteApprovalPercentage;
            const governanceSatellitePercentageDecimals    = 4;
            const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount + eveStakeAmount + malloryStakeAmount;
            const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * governanceSatelliteApprovalPercentage) / (10 ** governanceSatellitePercentageDecimals);

            // check details of financial request
            assert.equal(governanceAction.initiator,                                 bob.pkh);
            assert.equal(governanceAction.governanceType,                            "ADD_ORACLE_TO_AGGREGATOR");
            assert.equal(governanceAction.status,                                    true);
            assert.equal(governanceAction.executed,                                  false);
            assert.equal(governanceAction.governancePurpose,                         purpose);
            assert.equal(governanceAction.yayVoteTotal.toNumber(),                   0);
            assert.equal(governanceAction.nayVoteTotal.toNumber(),                   0);
            assert.equal(governanceAction.passVoteTotal.toNumber(),                  0);
            assert.equal(governanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
            assert.equal(governanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
            
            // check details of governance satellite action snapshot ledger
            const bobSnapshot = await governanceSatelliteActionSnapshotLedger.get(bob.pkh);
            assert.equal(bobSnapshot.totalDelegatedAmount.toNumber(),        0);
            assert.equal(bobSnapshot.totalStakedMvkBalance.toNumber(),       bobStakeAmount);
            assert.equal(bobSnapshot.totalVotingPower.toNumber(),            bobStakeAmount);

            const aliceSnapshot   = await governanceSatelliteActionSnapshotLedger.get(alice.pkh);
            assert.equal(aliceSnapshot.totalDelegatedAmount.toNumber(),      0);
            assert.equal(aliceSnapshot.totalStakedMvkBalance.toNumber(),     aliceStakeAmount);
            assert.equal(aliceSnapshot.totalVotingPower.toNumber(),          aliceStakeAmount);

            const eveSnapshot   = await governanceSatelliteActionSnapshotLedger.get(eve.pkh);
            assert.equal(eveSnapshot.totalDelegatedAmount.toNumber(),        0);
            assert.equal(eveSnapshot.totalStakedMvkBalance.toNumber(),       eveStakeAmount);
            assert.equal(eveSnapshot.totalVotingPower.toNumber(),            eveStakeAmount);

            const mallorySnapshot   = await governanceSatelliteActionSnapshotLedger.get(mallory.pkh);
            assert.equal(mallorySnapshot.totalDelegatedAmount.toNumber(),    0);
            assert.equal(mallorySnapshot.totalStakedMvkBalance.toNumber(),   malloryStakeAmount);
            assert.equal(mallorySnapshot.totalVotingPower.toNumber(),        malloryStakeAmount);

            // 3 satellites vote yay, one satellite votes nay
            await signerFactory(bob.sk);
            const bobVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
            await bobVotesForGovernanceActionOperation.confirmation();

            await signerFactory(eve.sk);
            const eveVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
            await eveVotesForGovernanceActionOperation.confirmation();
            
            await signerFactory(alice.sk);
            const aliceVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "nay").send();
            await aliceVotesForGovernanceActionOperation.confirmation();

            await signerFactory(mallory.sk);
            const malloryVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
            await malloryVotesForGovernanceActionOperation.confirmation();

            // get updated storage
            const updatedGovernanceSatelliteStorage                = await governanceSatelliteInstance.storage();        
            const updatedGovernanceAction                          = await updatedGovernanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);              

            const updatedBobSatelliteOracleRecord                  = await updatedGovernanceSatelliteStorage.satelliteOracleLedger.get(bob.pkh);
            const bobUsdBtcOracleAggregatorRecord                  = await updatedBobSatelliteOracleRecord.aggregatorPairs.get(usdBtcAggregatorAddress);

            // check that governance action has been executed
            assert.equal(updatedGovernanceAction.yayVoteTotal,            MVK(300));
            assert.equal(updatedGovernanceAction.nayVoteTotal,            MVK(100));
            assert.equal(updatedGovernanceAction.status,                  true);
            assert.equal(updatedGovernanceAction.executed,                true);

            // check that bob oracle is added to aggregator
            assert.equal(updatedBobSatelliteOracleRecord.aggregatorsSubscribed,     1);
            assert.equal(bobUsdBtcOracleAggregatorRecord.aggregatorPair[0],         pairOne);
            assert.equal(bobUsdBtcOracleAggregatorRecord.aggregatorPair[1],         pairTwo);
            assert.equal(bobUsdBtcOracleAggregatorRecord.aggregatorAddress,         usdBtcAggregatorAddress);

        
        } catch(e){
            console.dir(e, {depth: 5})
        } 
    });

    
  //   it('Any satellite should be able to create a governance action to remove an oracle from an aggregator', async () => {
  //     try{        

  //       // some init constants
  //         governanceSatelliteStorage     = await governanceSatelliteInstance.storage();
  //         const delegationStorage        = await delegationInstance.storage();        
  //         const aliceSatelliteRecord     = await delegationStorage.satelliteLedger.get(alice.pkh);

  //         assert.equal(aliceSatelliteRecord.status, "BANNED");

  //         const actionId                 = governanceSatelliteStorage.governanceSatelliteCounter;
  //         const bobStakeAmount           = MVK(100);
  //         const aliceStakeAmount         = MVK(100);
  //         const eveStakeAmount           = MVK(100);
  //         const malloryStakeAmount       = MVK(100);

  //         // governance satellite action params
  //         const satelliteToBeSuspended   = alice.pkh;
  //         const purpose                  = "Test Unban Satellite";            

  //         // Satellite Bob creates a governance action - unban Alice
  //         await signerFactory(bob.sk);
  //         const governanceSatelliteOperation = await governanceSatelliteInstance.methods.unbanSatellite(
  //                 satelliteToBeSuspended,
  //                 purpose
  //             ).send();
  //         await governanceSatelliteOperation.confirmation();


  //         governanceSatelliteStorage                     = await governanceSatelliteInstance.storage();
  //         const governanceAction                         = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
  //         const governanceSatelliteActionSnapshotLedger  = await governanceSatelliteStorage.governanceSatelliteSnapshotLedger.get(actionId);
          
  //         const governanceSatelliteApprovalPercentage    = governanceSatelliteStorage.config.governanceSatelliteApprovalPercentage;
  //         const governanceSatellitePercentageDecimals    = 4;
  //         const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount + eveStakeAmount + malloryStakeAmount;
  //         const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * governanceSatelliteApprovalPercentage) / (10 ** governanceSatellitePercentageDecimals);


  //         // check details of financial request
  //         assert.equal(governanceAction.initiator,                                 bob.pkh);
  //         assert.equal(governanceAction.governanceType,                            "UNBAN");
  //         assert.equal(governanceAction.status,                                    true);
  //         assert.equal(governanceAction.executed,                                  false);
  //         assert.equal(governanceAction.governancePurpose,                         purpose);
  //         assert.equal(governanceAction.yayVoteTotal.toNumber(),                   0);
  //         assert.equal(governanceAction.nayVoteTotal.toNumber(),                   0);
  //         assert.equal(governanceAction.passVoteTotal.toNumber(),                  0);
  //         assert.equal(governanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
  //         assert.equal(governanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
          
  //         // check details of governance satellite action snapshot ledger
  //         const bobSnapshot = await governanceSatelliteActionSnapshotLedger.get(bob.pkh);
  //         assert.equal(bobSnapshot.totalDelegatedAmount.toNumber(),        0);
  //         assert.equal(bobSnapshot.totalStakedMvkBalance.toNumber(),       bobStakeAmount);
  //         assert.equal(bobSnapshot.totalVotingPower.toNumber(),            bobStakeAmount);

  //         const aliceSnapshot   = await governanceSatelliteActionSnapshotLedger.get(alice.pkh);
  //         assert.equal(aliceSnapshot, undefined);
          
  //         const eveSnapshot   = await governanceSatelliteActionSnapshotLedger.get(eve.pkh);
  //         assert.equal(eveSnapshot.totalDelegatedAmount.toNumber(),        0);
  //         assert.equal(eveSnapshot.totalStakedMvkBalance.toNumber(),       eveStakeAmount);
  //         assert.equal(eveSnapshot.totalVotingPower.toNumber(),            eveStakeAmount);

  //         const mallorySnapshot   = await governanceSatelliteActionSnapshotLedger.get(mallory.pkh);
  //         assert.equal(mallorySnapshot.totalDelegatedAmount.toNumber(),    0);
  //         assert.equal(mallorySnapshot.totalStakedMvkBalance.toNumber(),   malloryStakeAmount);
  //         assert.equal(mallorySnapshot.totalVotingPower.toNumber(),        malloryStakeAmount);

  //         // 3 satellites vote yay to suspend alice satellite, alice's satellite votes nay
  //         await signerFactory(bob.sk);
  //         const bobVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
  //         await bobVotesForGovernanceActionOperation.confirmation();

  //         await signerFactory(eve.sk);
  //         const eveVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
  //         await eveVotesForGovernanceActionOperation.confirmation();

  //         await signerFactory(mallory.sk);
  //         const malloryVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
  //         await malloryVotesForGovernanceActionOperation.confirmation();

  //         // get updated storage
  //         const updatedGovernanceSatelliteStorage                = await governanceSatelliteInstance.storage();        
  //         const updatedGovernanceAction                          = await updatedGovernanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);              

  //         const updatedDelegationStorage                         = await delegationInstance.storage();        
  //         const updatedAliceSatelliteRecord                      = await updatedDelegationStorage.satelliteLedger.get(alice.pkh);

  //         // check that governance action has been executed
  //         assert.equal(updatedGovernanceAction.yayVoteTotal,            MVK(300));
  //         assert.equal(updatedGovernanceAction.nayVoteTotal,            0);
  //         assert.equal(updatedGovernanceAction.status,                  true);
  //         assert.equal(updatedGovernanceAction.executed,                true);

  //         // check that alice is now suspended
  //         assert.equal(updatedAliceSatelliteRecord.status,              "ACTIVE");
      
  //     } catch(e){
  //         console.dir(e, {depth: 5})
  //     } 
  // });

});
    

});
