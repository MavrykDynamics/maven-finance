// const { TezosToolkit, ContractAbstraction, ContractProvider, Tezos, TezosOperationError } = require("@taquito/taquito")
// const { InMemorySigner, importKey } = require("@taquito/signer");
// import assert, { ok, rejects, strictEqual, fail } from "assert";
// import { MVK, Utils, zeroAddress } from "./helpers/Utils";
// import fs from "fs";
// import { confirmOperation } from "../scripts/confirmation";
// import { MichelsonMap } from "@taquito/taquito";
// import {BigNumber} from "bignumber.js";

// const chai = require("chai");
// const chaiAsPromised = require('chai-as-promised');
// chai.use(chaiAsPromised);   
// chai.should();

// import env from "../env";
// import { bob, alice, eve, mallory, trudy, susie, oracle0, oracle1, oracle2, oracleMaintainer } from "../scripts/sandbox/accounts";

// import doormanAddress                   from '../deployments/doormanAddress.json';
// import delegationAddress                from '../deployments/delegationAddress.json';
// import governanceAddress                from '../deployments/governanceAddress.json';
// import governanceSatelliteAddress       from '../deployments/governanceSatelliteAddress.json';
// import mvkTokenAddress                  from '../deployments/mvkTokenAddress.json';
// import aggregatorAddress                from '../deployments/aggregatorAddress.json';
// import aggregatorFactoryAddress         from '../deployments/aggregatorFactoryAddress.json';


// import { config } from "yargs";
// import { aggregatorStorageType } from "./types/aggregatorStorageType";

// describe("Governance Satellite tests", async () => {
//     var utils: Utils;

//     let doormanInstance;
//     let delegationInstance;
//     let mvkTokenInstance;
//     let governanceInstance;
//     let governanceSatelliteInstance;
//     let aggregatorInstance;
//     let aggregatorFactoryInstance;
    
//     let doormanStorage;
//     let delegationStorage;
//     let mvkTokenStorage;
//     let governanceStorage;
//     let governanceSatelliteStorage;
//     let aggregatorStorage;
//     let aggregatorFactoryStorage;
    
    
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
//             aggregatorFactoryInstance       = await utils.tezos.contract.at(aggregatorFactoryAddress.address);
    
//             doormanStorage                  = await doormanInstance.storage();
//             delegationStorage               = await delegationInstance.storage();
//             mvkTokenStorage                 = await mvkTokenInstance.storage();
//             governanceStorage               = await governanceSatelliteInstance.storage();
//             governanceSatelliteStorage      = await governanceSatelliteInstance.storage();
//             aggregatorStorage               = await aggregatorInstance.storage();
//             aggregatorFactoryStorage        = await aggregatorFactoryInstance.storage();
            
//             console.log('-- -- -- -- -- Governance Satellite Tests -- -- -- --')
//             console.log('Doorman Contract deployed at:'               , doormanInstance.address);
//             console.log('Delegation Contract deployed at:'            , delegationInstance.address);
//             console.log('MVK Token Contract deployed at:'             , mvkTokenInstance.address);
//             console.log('Governance Contract deployed at:'            , governanceInstance.address);
//             console.log('Governance Satellite Contract deployed at:'  , governanceSatelliteInstance.address);
//             console.log('Aggregator Contract deployed at:'            , aggregatorInstance.address);
//             console.log('Aggregator Factory Contract deployed at:'    , aggregatorFactoryInstance.address);
            
//             console.log('Bob address: '     + bob.pkh);
//             console.log('Alice address: '   + alice.pkh);
//             console.log('Eve address: '     + eve.pkh);
//             console.log('Mallory address: ' + mallory.pkh);
    
//             // Setup governance satellites for action snapshot later
//             // ------------------------------------------------------------------
    
//             // Bob stakes 100 MVK tokens and registers as a satellite
//             delegationStorage       = await delegationInstance.storage();
//             const bobSatellite      = await delegationStorage.satelliteLedger.get(bob.pkh);
//             const aliceSatellite    = await delegationStorage.satelliteLedger.get(alice.pkh);
//             const eveSatellite      = await delegationStorage.satelliteLedger.get(eve.pkh);
//             const mallorySatellite  = await delegationStorage.satelliteLedger.get(mallory.pkh);
            
//             if(bobSatellite === undefined){

//                 var updateOperators = await mvkTokenInstance.methods
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
//                 await updateOperators.confirmation();  
//                 const bobStakeAmount                  = MVK(100);
//                 const bobStakeAmountOperation         = await doormanInstance.methods.stake(bobStakeAmount).send();
//                 await bobStakeAmountOperation.confirmation();                        
//                 const bobRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite("New Satellite by Bob", "New Satellite Description - Bob", "https://image.url", "https://image.url", "700").send();
//                 await bobRegisterAsSatelliteOperation.confirmation();
//             }


//             if(aliceSatellite === undefined){

//                 // Alice stakes 100 MVK tokens and registers as a satellite 
//                 await signerFactory(alice.sk);
//                 updateOperators = await mvkTokenInstance.methods
//                     .update_operators([
//                     {
//                         add_operator: {
//                             owner: alice.pkh,
//                             operator: doormanAddress.address,
//                             token_id: 0,
//                         },
//                     },
//                     ])
//                     .send()
//                 await updateOperators.confirmation(); 
//                 const aliceStakeAmount                  = MVK(100);
//                 const aliceStakeAmountOperation         = await doormanInstance.methods.stake(aliceStakeAmount).send();
//                 await aliceStakeAmountOperation.confirmation();                        
//                 const aliceRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite("New Satellite by Alice", "New Satellite Description - Alice", "https://image.url", "https://image.url", "700").send();
//                 await aliceRegisterAsSatelliteOperation.confirmation();
//             }


//             if(eveSatellite === undefined){

//                 // Eve stakes 100 MVK tokens and registers as a satellite 
//                 await signerFactory(eve.sk);
//                 updateOperators = await mvkTokenInstance.methods
//                     .update_operators([
//                     {
//                         add_operator: {
//                             owner: eve.pkh,
//                             operator: doormanAddress.address,
//                             token_id: 0,
//                         },
//                     },
//                     ])
//                     .send()
//                 await updateOperators.confirmation(); 
//                 const eveStakeAmount                  = MVK(100);
//                 const eveStakeAmountOperation         = await doormanInstance.methods.stake(eveStakeAmount).send();
//                 await eveStakeAmountOperation.confirmation();                        
//                 const eveRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite("New Satellite by Eve", "New Satellite Description - Eve", "https://image.url", "https://image.url", "700").send();
//                 await eveRegisterAsSatelliteOperation.confirmation();
//             }


//             if(mallorySatellite === undefined){

//                 // Mallory stakes 100 MVK tokens and registers as a satellite 
//                 await signerFactory(mallory.sk);
//                 updateOperators = await mvkTokenInstance.methods
//                     .update_operators([
//                     {
//                         add_operator: {
//                             owner: mallory.pkh,
//                             operator: doormanAddress.address,
//                             token_id: 0,
//                         },
//                     },
//                     ])
//                     .send()
//                 await updateOperators.confirmation(); 
//                 const malloryStakeAmount                  = MVK(100);
//                 const malloryStakeAmountOperation         = await doormanInstance.methods.stake(malloryStakeAmount).send();
//                 await malloryStakeAmountOperation.confirmation();                        
//                 const malloryRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite("New Satellite by Mallory", "New Satellite Description - Mallory", "https://image.url", "https://image.url", "700").send();
//                 await malloryRegisterAsSatelliteOperation.confirmation();
//             }

//             // Setup Oracles
//             await signerFactory(bob.sk);

//             // const oracleMap = MichelsonMap.fromLiteral({
//             //   [oracle0.pkh] : true,
//             //   [oracle1.pkh] : true,
//             //   [oracle2.pkh] : true,
//             // }) as MichelsonMap<
//             //     string,
//             //     boolean
//             //     >

//             const oracleMap = MichelsonMap.fromLiteral({});

//             const aggregatorMetadataBase = Buffer.from(
//                 JSON.stringify({
//                     name: 'MAVRYK Aggregator Contract',
//                     version: 'v1.0.0',
//                     authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
//                 }),
//                 'ascii',
//                 ).toString('hex')

//             // Setup Aggregators
//             const createAggregatorsBatch = await utils.tezos.wallet
//             .batch()
//             .withContractCall(aggregatorFactoryInstance.methods.createAggregator(
//                 'USD',
//                 'BTC',

//                 'USDBTC',
//                 true,
                
//                 oracleMap,

//                 new BigNumber(8),             // decimals
//                 new BigNumber(2),             // numberBlocksDelay

//                 new BigNumber(60),            // percentOracleThreshold

//                 new BigNumber(10000000),      // rewardAmountStakedMvk
//                 new BigNumber(1300),          // rewardAmountXtz
                
//                 oracleMaintainer.pkh,         // maintainer
//                 aggregatorMetadataBase        // metadata bytes
//             ))
//             .withContractCall(aggregatorFactoryInstance.methods.createAggregator(
//                 'USD',
//                 'XTZ',

//                 'USDXTZ',
//                 true,

//                 oracleMap,

//                 new BigNumber(8),             // decimals
//                 new BigNumber(2),             // numberBlocksDelay
                    
//                 new BigNumber(60),            // percentOracleThreshold

//                 new BigNumber(10000000),      // rewardAmountStakedMvk
//                 new BigNumber(1300),          // rewardAmountXtz
                
//                 oracleMaintainer.pkh,         // maintainer
//                 aggregatorMetadataBase        // metadata bytes
//             ))
//             .withContractCall(aggregatorFactoryInstance.methods.createAggregator(
//                 'USD',
//                 'DOGE',

//                 'USDDOGE',
//                 true,

//                 oracleMap,

//                 new BigNumber(16),            // decimals
//                 new BigNumber(2),             // numberBlocksDelay
                
//                 new BigNumber(60),            // percentOracleThreshold
                    
//                 new BigNumber(10000000),      // rewardAmountStakedMvk
//                 new BigNumber(1300),          // rewardAmountXtz
                
//                 oracleMaintainer.pkh,         // maintainer
//                 aggregatorMetadataBase        // metadata bytes
//             ))

//           const createAggregatorsBatchOperation = await createAggregatorsBatch.send()
//           await createAggregatorsBatchOperation.confirmation()

//           console.log("Aggregators deployed")

//           // Start a new governance cycle to validate all satellites
//           const updateConfigOperation   = await governanceInstance.methods.updateConfig(0, "configBlocksPerProposalRound").send();
//           await updateConfigOperation.confirmation();
//           const startNextRoundOperation = await governanceInstance.methods.startNextRound(false).send();
//           await startNextRoundOperation.confirmation();
//         } catch(e) {
//             console.dir(e, {depth: 5})
//         }
//     });

    

//     describe("%setAdmin", async () => {

//         beforeEach("Set signer to admin", async () => {
//             await signerFactory(bob.sk)
//         });

//         it('Admin should be able to call this entrypoint and update the contract administrator with a new address', async () => {
//             try{

//                 // Initial Values
//                 governanceSatelliteStorage = await governanceSatelliteInstance.storage();
//                 const currentAdmin = governanceSatelliteStorage.admin;

//                 // Operation
//                 const setAdminOperation = await governanceSatelliteInstance.methods.setAdmin(alice.pkh).send();
//                 await setAdminOperation.confirmation();

//                 // Final values
//                 governanceSatelliteStorage = await governanceSatelliteInstance.storage();
//                 const newAdmin = governanceSatelliteStorage.admin;

//                 // reset admin
//                 await signerFactory(alice.sk);
//                 const resetAdminOperation = await governanceSatelliteInstance.methods.setAdmin(bob.pkh).send();
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
//                 governanceSatelliteStorage = await governanceSatelliteInstance.storage();
//                 const currentAdmin = governanceSatelliteStorage.admin;

//                 // Operation
//                 await chai.expect(governanceSatelliteInstance.methods.setAdmin(alice.pkh).send()).to.be.rejected;

//                 // Final values
//                 governanceSatelliteStorage = await governanceSatelliteInstance.storage();
//                 const newAdmin = governanceSatelliteStorage.admin;

//                 // Assertions
//                 assert.strictEqual(newAdmin, currentAdmin);
//             } catch(e){
//                 console.log(e);
//             }
//         });
        
//     }); // end %setAdmin tests

    

//     describe("%setGovernance", async () => {

//         beforeEach("Set signer to admin", async () => {
//             await signerFactory(bob.sk)
//         });

//         it('Admin should be able to call this entrypoint and update the governance contract with a new address', async () => {
//             try{
//                 // Initial Values
//                 governanceSatelliteStorage = await governanceSatelliteInstance.storage();
//                 const currentGovernance = governanceSatelliteStorage.governanceAddress;

//                 // Operation
//                 const setGovernanceOperation = await governanceSatelliteInstance.methods.setGovernance(alice.pkh).send();
//                 await setGovernanceOperation.confirmation();

//                 // Final values
//                 governanceSatelliteStorage = await governanceSatelliteInstance.storage();
//                 const newGovernance = governanceSatelliteStorage.governanceAddress;

//                 // reset admin
//                 await signerFactory(alice.sk);
//                 const resetGovernanceOperation = await governanceSatelliteInstance.methods.setGovernance(governanceAddress.address).send();
//                 await resetGovernanceOperation.confirmation();

//                 // Assertions
//                 assert.notStrictEqual(newGovernance, currentGovernance);
//                 assert.strictEqual(newGovernance, alice.pkh);
//                 assert.strictEqual(currentGovernance, governanceAddress.address);

//             } catch(e){
//                 console.log(e);
//             }
//         });

//         it('Non-admin should not be able to call this entrypoint', async () => {
//             try{
//                 // Initial Values
//                 await signerFactory(alice.sk);
//                 governanceSatelliteStorage = await governanceSatelliteInstance.storage();
//                 const currentGovernance = governanceSatelliteStorage.governanceAddress;

//                 // Operation
//                 await chai.expect(governanceSatelliteInstance.methods.setGovernance(alice.pkh).send()).to.be.rejected;

//                 // Final values
//                 governanceSatelliteStorage = await governanceSatelliteInstance.storage();
//                 const newGovernance = governanceSatelliteStorage.governanceAddress;

//                 // Assertions
//                 assert.strictEqual(newGovernance, currentGovernance);
//             } catch(e){
//                 console.log(e);
//             }
//         });
        
//     }); // end %setGovernance tests

//     describe("%updateConfig", async () => {

//         before("Configure delegation ratio on delegation contract", async () => {
//             try{
//                 // Initial Values
//                 await signerFactory(bob.sk)
//                 delegationStorage   = await delegationInstance.storage();
//                 const newConfigValue = 10;

//                 // Operation
//                 const updateConfigOperation = await delegationInstance.methods.updateConfig(newConfigValue,"configDelegationRatio").send();
//                 await updateConfigOperation.confirmation();

//                 // Final values
//                 delegationStorage   = await delegationInstance.storage();
//                 const updateConfigValue = delegationStorage.config.delegationRatio;

//                 // Assertions
//                 assert.equal(updateConfigValue, newConfigValue);
//             } catch(e){
//                 console.dir(e, {depth: 5})
//             }
//         });

//         beforeEach("Set signer to admin", async () => {
//             await signerFactory(bob.sk)
//         });

//         it('Admin should be able to call the entrypoint and configure the approval percentage', async () => {
//             try{
//                 // Initial Values
//                 governanceSatelliteStorage = await governanceSatelliteInstance.storage();
//                 const newConfigValue = 6700;

//                 // Operation
//                 const updateConfigOperation = await governanceSatelliteInstance.methods.updateConfig(newConfigValue,"configApprovalPercentage").send();
//                 await updateConfigOperation.confirmation();

//                 // Final values
//                 governanceSatelliteStorage = await governanceSatelliteInstance.storage();
//                 const updateConfigValue = governanceSatelliteStorage.config.governanceSatelliteApprovalPercentage;

//                 // Assertions
//                 assert.equal(updateConfigValue, newConfigValue);
//             } catch(e){
//                 console.dir(e, {depth: 5})
//             }
//         });

//         it('Admin should not be able to call the entrypoint and configure the approval percentage if it exceed 100%', async () => {
//             try{
//                 // Initial Values
//                 governanceSatelliteStorage = await governanceSatelliteInstance.storage();
//                 const currentConfigValue = governanceSatelliteStorage.config.governanceSatelliteApprovalPercentage;
//                 const newConfigValue = 10001;

//                 // Operation
//                 await chai.expect(governanceSatelliteInstance.methods.updateConfig(newConfigValue,"configApprovalPercentage").send()).to.be.rejected;

//                 // Final values
//                 governanceSatelliteStorage = await governanceSatelliteInstance.storage();
//                 const updateConfigValue = governanceSatelliteStorage.config.governanceSatelliteApprovalPercentage;

//                 // Assertions
//                 assert.notEqual(newConfigValue, currentConfigValue);
//                 assert.equal(updateConfigValue.toNumber(), currentConfigValue.toNumber());
//             } catch(e){
//                 console.dir(e, {depth: 5})
//             }
//         });

//         it('Admin should be able to call the entrypoint and configure the action duration in days', async () => {
//             try{
//                 // Initial Values
//                 governanceSatelliteStorage = await governanceSatelliteInstance.storage();
//                 const newConfigValue = 1;

//                 // Operation
//                 const updateConfigOperation = await governanceSatelliteInstance.methods.updateConfig(newConfigValue,"configSatelliteDurationInDays").send();
//                 await updateConfigOperation.confirmation();

//                 // Final values
//                 governanceSatelliteStorage = await governanceSatelliteInstance.storage();
//                 const updateConfigValue = governanceSatelliteStorage.config.governanceSatelliteDurationInDays;

//                 // Assertions
//                 assert.equal(updateConfigValue, newConfigValue);
//             } catch(e){
//                 console.dir(e, {depth: 5})
//             }
//         });

//         it('Non-admin should not be able to call the entrypoint', async () => {
//             try{
//                 // Initial Values
//                 governanceSatelliteStorage = await governanceSatelliteInstance.storage();
//                 const currentConfigValue = governanceSatelliteStorage.config.governanceSatelliteDurationInDays;
//                 const newConfigValue = 1;

//                 // Operation
//                 await signerFactory(alice.sk)
//                 await chai.expect(governanceSatelliteInstance.methods.updateConfig(newConfigValue,"configSatelliteDurationInDays").send()).to.be.rejected;

//                 // Final values
//                 governanceSatelliteStorage = await governanceSatelliteInstance.storage();
//                 const updateConfigValue = governanceSatelliteStorage.config.governanceSatelliteDurationInDays;

//                 // Assertions
//                 assert.equal(updateConfigValue.toNumber(), currentConfigValue.toNumber());
//             } catch(e){
//                 console.dir(e, {depth: 5})
//             }
//         });
//     }); // end %updateConfig tests

//     describe("%suspendSatellite, %restoreSatellite", async () => {

//         it('Any satellite should be able to create a governance action to suspend a satellite', async () => {
//             try{        

//               // some init constants
//                 governanceSatelliteStorage     = await governanceSatelliteInstance.storage();
//                 const delegationStorage        = await delegationInstance.storage();
//                 const aliceSatelliteRecord     = await delegationStorage.satelliteLedger.get(alice.pkh);

//                 assert.equal(aliceSatelliteRecord.status, "ACTIVE");

//                 const actionId                 = governanceSatelliteStorage.governanceSatelliteCounter;
//                 const bobStakeAmount           = MVK(100);
//                 const aliceStakeAmount         = MVK(100);
//                 const eveStakeAmount           = MVK(100);
//                 const malloryStakeAmount       = MVK(100);

//                 // governance satellite action params
//                 const satelliteToBeSuspended   = alice.pkh;
//                 const purpose                  = "Test Suspend Satellite";            
    
//                 // Satellite Bob creates a governance action - suspend Alice
//                 await signerFactory(bob.sk);
//                 const governanceSatelliteOperation = await governanceSatelliteInstance.methods.suspendSatellite(
//                         satelliteToBeSuspended,
//                         purpose
//                     ).send();
//                 await governanceSatelliteOperation.confirmation();
    

//                 governanceSatelliteStorage                      = await governanceSatelliteInstance.storage();
//                 const governanceAction                          = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
//                 const initiatorsActions                         = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);
                
//                 const governanceSatelliteApprovalPercentage     = governanceSatelliteStorage.config.governanceSatelliteApprovalPercentage;
//                 const governanceSatellitePercentageDecimals     = 4;
//                 const totalStakedMvkSupply                      = bobStakeAmount + aliceStakeAmount + eveStakeAmount + malloryStakeAmount;
//                 const stakedMvkRequiredForApproval              = (totalStakedMvkSupply * governanceSatelliteApprovalPercentage) / (10 ** governanceSatellitePercentageDecimals);
    
//                 // check details of governance satellite action
//                 assert.equal(governanceAction.initiator,                                 bob.pkh);
//                 assert.equal(governanceAction.governanceType,                            "SUSPEND");
//                 assert.equal(governanceAction.status,                                    true);
//                 assert.equal(governanceAction.executed,                                  false);
//                 assert.equal(governanceAction.governancePurpose,                         purpose);
//                 assert.equal(governanceAction.yayVoteStakedMvkTotal.toNumber(),                   0);
//                 assert.equal(governanceAction.nayVoteStakedMvkTotal.toNumber(),                   0);
//                 assert.equal(governanceAction.passVoteStakedMvkTotal.toNumber(),                  0);
//                 assert.equal(governanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
//                 assert.equal(governanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
//                 var actionsInitiatorCheck = false
//                 for(const i in initiatorsActions){
                    
//                     if(initiatorsActions[i].toNumber() == actionId.toNumber()){
//                         actionsInitiatorCheck   = true;
//                     }
//                 }
//                 assert.equal(actionsInitiatorCheck, true)
    
//                 // 3 satellites vote yay, one satellite votes nay
//                 await signerFactory(bob.sk);
//                 const bobVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
//                 await bobVotesForGovernanceActionOperation.confirmation();
    
//                 await signerFactory(eve.sk);
//                 const eveVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
//                 await eveVotesForGovernanceActionOperation.confirmation();
                
//                 await signerFactory(alice.sk);
//                 const aliceVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "nay").send();
//                 await aliceVotesForGovernanceActionOperation.confirmation();

//                 await signerFactory(mallory.sk);
//                 const malloryVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
//                 await malloryVotesForGovernanceActionOperation.confirmation();
    
//                 // get updated storage
//                 const updatedGovernanceSatelliteStorage                = await governanceSatelliteInstance.storage();        
//                 const updatedGovernanceAction                          = await updatedGovernanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
//                 const updatedInitiatorsActions                         = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);          

//                 const updatedDelegationStorage                         = await delegationInstance.storage();        
//                 const updatedAliceSatelliteRecord                      = await updatedDelegationStorage.satelliteLedger.get(alice.pkh);
                
//                 governanceStorage                                      = await governanceInstance.storage();
//                 const currentCycle                                     = governanceStorage.cycleId;
//                 const aliceSnapshot                                    = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});
//                 const eveSnapshot                                      = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: eve.pkh});
//                 const bobSnapshot                                      = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
//                 const mallorySnapshot                                  = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: mallory.pkh});
                
//                 // check details of governance satellite action snapshot ledger
//                 assert.equal(bobSnapshot.totalDelegatedAmount.toNumber(),        0);
//                 assert.equal(bobSnapshot.totalStakedMvkBalance.toNumber(),       bobStakeAmount);
//                 assert.equal(bobSnapshot.totalVotingPower.toNumber(),            bobStakeAmount);
    
//                 assert.equal(aliceSnapshot.totalDelegatedAmount.toNumber(),      0);
//                 assert.equal(aliceSnapshot.totalStakedMvkBalance.toNumber(),     aliceStakeAmount);
//                 assert.equal(aliceSnapshot.totalVotingPower.toNumber(),          aliceStakeAmount);

//                 assert.equal(eveSnapshot.totalDelegatedAmount.toNumber(),        0);
//                 assert.equal(eveSnapshot.totalStakedMvkBalance.toNumber(),       eveStakeAmount);
//                 assert.equal(eveSnapshot.totalVotingPower.toNumber(),            eveStakeAmount);

//                 assert.equal(mallorySnapshot.totalDelegatedAmount.toNumber(),    0);
//                 assert.equal(mallorySnapshot.totalStakedMvkBalance.toNumber(),   malloryStakeAmount);
//                 assert.equal(mallorySnapshot.totalVotingPower.toNumber(),        malloryStakeAmount);

//                 // check that governance action has been executed
//                 assert.equal(updatedGovernanceAction.yayVoteStakedMvkTotal,            MVK(300));
//                 assert.equal(updatedGovernanceAction.nayVoteStakedMvkTotal,            MVK(100));
//                 assert.equal(updatedGovernanceAction.status,                  true);
//                 assert.equal(updatedGovernanceAction.executed,                true);
//                 actionsInitiatorCheck = false
//                 for(const i in updatedInitiatorsActions){
//                     if(updatedInitiatorsActions[i].toNumber() == actionId.toNumber()){
//                         actionsInitiatorCheck   = true;
//                     }
//                 }
//                 assert.equal(actionsInitiatorCheck, false)

//                 // check that alice is now suspended
//                 assert.equal(updatedAliceSatelliteRecord.status,              "SUSPENDED");
            
//             } catch(e){
//                 console.dir(e, {depth: 5})
//             } 
//         });

        
//         it('Any satellite should be able to create a governance action to restore a satellite', async () => {
//           try{        

//             // some init constants
//               governanceSatelliteStorage     = await governanceSatelliteInstance.storage();
//               const delegationStorage        = await delegationInstance.storage();        
//               const aliceSatelliteRecord     = await delegationStorage.satelliteLedger.get(alice.pkh);

//               assert.equal(aliceSatelliteRecord.status, "SUSPENDED");

//               const actionId                 = governanceSatelliteStorage.governanceSatelliteCounter;
//               const bobStakeAmount           = MVK(100);
//               const aliceStakeAmount         = MVK(100);
//               const eveStakeAmount           = MVK(100);
//               const malloryStakeAmount       = MVK(100);

//               // governance satellite action params
//               const satelliteToBeSuspended   = alice.pkh;
//               const purpose                  = "Test restore Satellite";            
  
//               // Satellite Bob creates a governance action - restore Alice
//               await signerFactory(bob.sk);
//               const governanceSatelliteOperation = await governanceSatelliteInstance.methods.restoreSatellite(
//                       satelliteToBeSuspended,
//                       purpose
//                   ).send();
//               await governanceSatelliteOperation.confirmation();
  

//               governanceSatelliteStorage                     = await governanceSatelliteInstance.storage();
//               const governanceAction                         = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
//               const initiatorsActions                        = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);
              
//               const governanceSatelliteApprovalPercentage    = governanceSatelliteStorage.config.governanceSatelliteApprovalPercentage;
//               const governanceSatellitePercentageDecimals    = 4;
//               const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount + eveStakeAmount + malloryStakeAmount;
//               const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * governanceSatelliteApprovalPercentage) / (10 ** governanceSatellitePercentageDecimals);

  
//               // check details of governance satellite action
//               assert.equal(governanceAction.initiator,                                 bob.pkh);
//               assert.equal(governanceAction.governanceType,                            "RESTORE");
//               assert.equal(governanceAction.status,                                    true);
//               assert.equal(governanceAction.executed,                                  false);
//               assert.equal(governanceAction.governancePurpose,                         purpose);
//               assert.equal(governanceAction.yayVoteStakedMvkTotal.toNumber(),                   0);
//               assert.equal(governanceAction.nayVoteStakedMvkTotal.toNumber(),                   0);
//               assert.equal(governanceAction.passVoteStakedMvkTotal.toNumber(),                  0);
//               assert.equal(governanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
//               assert.equal(governanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
//               var actionsInitiatorCheck = false
//                 for(const i in initiatorsActions){
                    
//                     if(initiatorsActions[i].toNumber() == actionId.toNumber()){
//                         actionsInitiatorCheck   = true;
//                     }
//                 }
//                 assert.equal(actionsInitiatorCheck, true)
  
//               // 3 satellites vote yay 
//               await signerFactory(bob.sk);
//               const bobVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
//               await bobVotesForGovernanceActionOperation.confirmation();
  
//               await signerFactory(eve.sk);
//               const eveVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
//               await eveVotesForGovernanceActionOperation.confirmation();

//               await signerFactory(mallory.sk);
//               const malloryVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
//               await malloryVotesForGovernanceActionOperation.confirmation();
  
//               // get updated storage
//               const updatedGovernanceSatelliteStorage               = await governanceSatelliteInstance.storage();        
//               const updatedGovernanceAction                         = await updatedGovernanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
//               const updatedInitiatorsActions                        = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);

//               const updatedDelegationStorage                        = await delegationInstance.storage();        
//               const updatedAliceSatelliteRecord                     = await updatedDelegationStorage.satelliteLedger.get(alice.pkh);
//               governanceStorage                                     = await governanceInstance.storage();
//               const currentCycle                                    = governanceStorage.cycleId;
//               const aliceSnapshot                                   = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});
//               const eveSnapshot                                     = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: eve.pkh});
//               const bobSnapshot                                     = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
//               const mallorySnapshot                                 = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: mallory.pkh});
              
//               // check details of governance satellite action snapshot ledger
//               assert.equal(bobSnapshot.totalDelegatedAmount.toNumber(),        0);
//               assert.equal(bobSnapshot.totalStakedMvkBalance.toNumber(),       bobStakeAmount);
//               assert.equal(bobSnapshot.totalVotingPower.toNumber(),            bobStakeAmount);
  
//               assert.equal(aliceSnapshot.totalDelegatedAmount.toNumber(),      0);
//               assert.equal(aliceSnapshot.totalStakedMvkBalance.toNumber(),     aliceStakeAmount);
//               assert.equal(aliceSnapshot.totalVotingPower.toNumber(),          aliceStakeAmount);
              
//               assert.equal(eveSnapshot.totalDelegatedAmount.toNumber(),        0);
//               assert.equal(eveSnapshot.totalStakedMvkBalance.toNumber(),       eveStakeAmount);
//               assert.equal(eveSnapshot.totalVotingPower.toNumber(),            eveStakeAmount);

//               assert.equal(mallorySnapshot.totalDelegatedAmount.toNumber(),    0);
//               assert.equal(mallorySnapshot.totalStakedMvkBalance.toNumber(),   malloryStakeAmount);
//               assert.equal(mallorySnapshot.totalVotingPower.toNumber(),        malloryStakeAmount);

//               // check that governance action has been executed
//               assert.equal(updatedGovernanceAction.yayVoteStakedMvkTotal,            MVK(300));
//               assert.equal(updatedGovernanceAction.nayVoteStakedMvkTotal,            0);
//               assert.equal(updatedGovernanceAction.status,                  true);
//               assert.equal(updatedGovernanceAction.executed,                true);
//               var actionsInitiatorCheck = false
//                 for(const i in updatedInitiatorsActions){
//                     if(updatedInitiatorsActions[i].toNumber() == actionId.toNumber()){
//                         actionsInitiatorCheck   = true;
//                     }
//                 }
//                 assert.equal(actionsInitiatorCheck, false)

//               // check that alice is now active
//               assert.equal(updatedAliceSatelliteRecord.status,              "ACTIVE");
          
//           } catch(e){
//               console.dir(e, {depth: 5})
//           } 
//       });

//       it('Any satellite should not be able to create too many governance actions', async () => {
//         try{

//             // Update config
//             await signerFactory(bob.sk);
//             var updateConfigOperation      = await governanceSatelliteInstance.methods.updateConfig(1, "configMaxActionsPerSatellite").send()
//             await updateConfigOperation.confirmation()

//             // some init constants
//             governanceSatelliteStorage     = await governanceSatelliteInstance.storage();
//             governanceStorage              = await governanceInstance.storage();
            
//             assert.equal(governanceSatelliteStorage.config.maxActionsPerSatellite, 1);

//             const actionId                 = governanceSatelliteStorage.governanceSatelliteCounter;
//             const actionsIdsBegin          = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh)

//             // governance satellite action params
//             const satelliteToBeSuspended   = alice.pkh;
//             const purpose                  = "Test Restore Satellite";

//             // Create an action
//             var operation = await governanceSatelliteInstance.methods.suspendSatellite(satelliteToBeSuspended, purpose).send();
//             await  operation.confirmation();

//             // Satellite Bob exceeds the number of actions it can create this round
//             await chai.expect(governanceSatelliteInstance.methods.suspendSatellite(satelliteToBeSuspended, purpose).send()).to.be.eventually.rejected;

//             // Drop the action to create another one
//             const dropOperation = await governanceSatelliteInstance.methods.dropAction(actionId).send();
//             await dropOperation.confirmation();

//             // Create another action
//             operation = await governanceSatelliteInstance.methods.suspendSatellite(satelliteToBeSuspended, purpose).send();
//             await operation.confirmation();

//             // Final values
//             governanceSatelliteStorage     = await governanceSatelliteInstance.storage();
//             const actionsIdsEnd            = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh)

//             // Assertions
//             assert.notEqual(actionsIdsBegin, actionsIdsEnd);
//             assert.equal(actionsIdsBegin.length <= 1, true);
//             assert.equal(actionsIdsEnd.length == 1, true);

//             // Reset config
//             updateConfigOperation      = await governanceSatelliteInstance.methods.updateConfig(20, "configMaxActionsPerSatellite").send()
//             await updateConfigOperation.confirmation()

//         } catch(e){
//             console.dir(e, {depth: 5})
//         } 
//     });
        
//     });  // end %suspendSatellite, %restoreSatellite tests


//     describe("%banSatellite, #restoreSatellite", async () => {

//       it('Any satellite should be able to create a governance action to ban a satellite', async () => {
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
//               const purpose                  = "Test Ban Satellite";            
  
//               // Satellite Bob creates a governance action to ban Alice
//               await signerFactory(bob.sk);
//               const governanceSatelliteOperation = await governanceSatelliteInstance.methods.banSatellite(
//                       satelliteToBeSuspended,
//                       purpose
//                   ).send();
//               await governanceSatelliteOperation.confirmation();
  

//               governanceSatelliteStorage                     = await governanceSatelliteInstance.storage();
//               const governanceAction                         = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
//               const initiatorsActions                        = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);
              
//               const governanceSatelliteApprovalPercentage    = governanceSatelliteStorage.config.governanceSatelliteApprovalPercentage;
//               const governanceSatellitePercentageDecimals    = 4;
//               const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount + eveStakeAmount + malloryStakeAmount;
//               const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * governanceSatelliteApprovalPercentage) / (10 ** governanceSatellitePercentageDecimals);

  
//               // check details of governance satellite action
//               assert.equal(governanceAction.initiator,                                 bob.pkh);
//               assert.equal(governanceAction.governanceType,                            "BAN");
//               assert.equal(governanceAction.status,                                    true);
//               assert.equal(governanceAction.executed,                                  false);
//               assert.equal(governanceAction.governancePurpose,                         purpose);
//               assert.equal(governanceAction.yayVoteStakedMvkTotal.toNumber(),                   0);
//               assert.equal(governanceAction.nayVoteStakedMvkTotal.toNumber(),                   0);
//               assert.equal(governanceAction.passVoteStakedMvkTotal.toNumber(),                  0);
//               assert.equal(governanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
//               assert.equal(governanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
//               var actionsInitiatorCheck = false
//                 for(const i in initiatorsActions){
                    
//                     if(initiatorsActions[i].toNumber() == actionId.toNumber()){
//                         actionsInitiatorCheck   = true;
//                     }
//                 }
//                 assert.equal(actionsInitiatorCheck, true)
  
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
//               const updatedGovernanceSatelliteStorage               = await governanceSatelliteInstance.storage();        
//               const updatedGovernanceAction                         = await updatedGovernanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
//               const updatedInitiatorsActions                        = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);

//               const updatedDelegationStorage                        = await delegationInstance.storage();        
//               const updatedAliceSatelliteRecord                     = await updatedDelegationStorage.satelliteLedger.get(alice.pkh);
//               governanceStorage                                     = await governanceInstance.storage();
//               const currentCycle                                    = governanceStorage.cycleId;
//               const aliceSnapshot                                   = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});
//               const eveSnapshot                                     = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: eve.pkh});
//               const bobSnapshot                                     = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
//               const mallorySnapshot                                 = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: mallory.pkh});
              
//               // check details of governance satellite action snapshot ledger
//               assert.equal(bobSnapshot.totalDelegatedAmount.toNumber(),        0);
//               assert.equal(bobSnapshot.totalStakedMvkBalance.toNumber(),       bobStakeAmount);
//               assert.equal(bobSnapshot.totalVotingPower.toNumber(),            bobStakeAmount);
  
//               assert.equal(aliceSnapshot.totalDelegatedAmount.toNumber(),      0);
//               assert.equal(aliceSnapshot.totalStakedMvkBalance.toNumber(),     aliceStakeAmount);
//               assert.equal(aliceSnapshot.totalVotingPower.toNumber(),          aliceStakeAmount);

//               assert.equal(eveSnapshot.totalDelegatedAmount.toNumber(),        0);
//               assert.equal(eveSnapshot.totalStakedMvkBalance.toNumber(),       eveStakeAmount);
//               assert.equal(eveSnapshot.totalVotingPower.toNumber(),            eveStakeAmount);

//               assert.equal(mallorySnapshot.totalDelegatedAmount.toNumber(),    0);
//               assert.equal(mallorySnapshot.totalStakedMvkBalance.toNumber(),   malloryStakeAmount);
//               assert.equal(mallorySnapshot.totalVotingPower.toNumber(),        malloryStakeAmount);

//               // check that governance action has been executed
//               assert.equal(updatedGovernanceAction.yayVoteStakedMvkTotal,            MVK(300));
//               assert.equal(updatedGovernanceAction.nayVoteStakedMvkTotal,            MVK(100));
//               assert.equal(updatedGovernanceAction.status,                  true);
//               assert.equal(updatedGovernanceAction.executed,                true);
//               var actionsInitiatorCheck = false
//             for(const i in updatedInitiatorsActions){
//                 if(updatedInitiatorsActions[i].toNumber() == actionId.toNumber()){
//                     actionsInitiatorCheck   = true;
//                  }
//              }
//              assert.equal(actionsInitiatorCheck, false)

//               // check that alice is now banned
//               assert.equal(updatedAliceSatelliteRecord.status,              "BANNED");
          
//           } catch(e){
//               console.dir(e, {depth: 5})
//           } 
//       });

      
//       it('Any satellite should be able to create a governance action to restore a satellite', async () => {
//         try{        

//           // some init constants
//             governanceSatelliteStorage     = await governanceSatelliteInstance.storage();
//             const delegationStorage        = await delegationInstance.storage();        
//             const aliceSatelliteRecord     = await delegationStorage.satelliteLedger.get(alice.pkh);

//             assert.equal(aliceSatelliteRecord.status, "BANNED");

//             const actionId                 = governanceSatelliteStorage.governanceSatelliteCounter;
//             const bobStakeAmount           = MVK(100);
//             const aliceStakeAmount         = MVK(100);
//             const eveStakeAmount           = MVK(100);
//             const malloryStakeAmount       = MVK(100);

//             // governance satellite action params
//             const satelliteToBeSuspended   = alice.pkh;
//             const purpose                  = "Test Restore Satellite";            

//             // Satellite Bob creates a governance action - restore Alice
//             await signerFactory(bob.sk);
//             const governanceSatelliteOperation = await governanceSatelliteInstance.methods.restoreSatellite(
//                     satelliteToBeSuspended,
//                     purpose
//                 ).send();
//             await governanceSatelliteOperation.confirmation();


//             governanceSatelliteStorage                     = await governanceSatelliteInstance.storage();
//             const governanceAction                         = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
//             const initiatorsActions                        = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);
            
//             const governanceSatelliteApprovalPercentage    = governanceSatelliteStorage.config.governanceSatelliteApprovalPercentage;
//             const governanceSatellitePercentageDecimals    = 4;
//             const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount + eveStakeAmount + malloryStakeAmount;
//             const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * governanceSatelliteApprovalPercentage) / (10 ** governanceSatellitePercentageDecimals);


//             // check details of governance satellite action
//             assert.equal(governanceAction.initiator,                                 bob.pkh);
//             assert.equal(governanceAction.governanceType,                            "RESTORE");
//             assert.equal(governanceAction.status,                                    true);
//             assert.equal(governanceAction.executed,                                  false);
//             assert.equal(governanceAction.governancePurpose,                         purpose);
//             assert.equal(governanceAction.yayVoteStakedMvkTotal.toNumber(),                   0);
//             assert.equal(governanceAction.nayVoteStakedMvkTotal.toNumber(),                   0);
//             assert.equal(governanceAction.passVoteStakedMvkTotal.toNumber(),                  0);
//             assert.equal(governanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
//             assert.equal(governanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
//               var actionsInitiatorCheck = false
//                 for(const i in initiatorsActions){
                    
//                     if(initiatorsActions[i].toNumber() == actionId.toNumber()){
//                         actionsInitiatorCheck   = true;
//                     }
//                 }
//                 assert.equal(actionsInitiatorCheck, true)

//             // 3 satellites vote yay to restore alice satellite
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
//             const updatedGovernanceSatelliteStorage        = await governanceSatelliteInstance.storage();        
//             const updatedGovernanceAction                  = await updatedGovernanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
//             const updatedInitiatorsActions                 = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);

//             const updatedDelegationStorage                 = await delegationInstance.storage();        
//             const updatedAliceSatelliteRecord              = await updatedDelegationStorage.satelliteLedger.get(alice.pkh);
//             governanceStorage                              = await governanceInstance.storage();
//             const currentCycle                             = governanceStorage.cycleId;
//             const aliceSnapshot                            = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});
//             const eveSnapshot                              = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: eve.pkh});
//             const bobSnapshot                              = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
//             const mallorySnapshot                          = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: mallory.pkh});
            
//             // check details of governance satellite action snapshot ledger
//             assert.equal(bobSnapshot.totalDelegatedAmount.toNumber(),        0);
//             assert.equal(bobSnapshot.totalStakedMvkBalance.toNumber(),       bobStakeAmount);
//             assert.equal(bobSnapshot.totalVotingPower.toNumber(),            bobStakeAmount);

//             assert.equal(aliceSnapshot.totalDelegatedAmount.toNumber(),      0);
//             assert.equal(aliceSnapshot.totalStakedMvkBalance.toNumber(),     aliceStakeAmount);
//             assert.equal(aliceSnapshot.totalVotingPower.toNumber(),          aliceStakeAmount);
            
//             assert.equal(eveSnapshot.totalDelegatedAmount.toNumber(),        0);
//             assert.equal(eveSnapshot.totalStakedMvkBalance.toNumber(),       eveStakeAmount);
//             assert.equal(eveSnapshot.totalVotingPower.toNumber(),            eveStakeAmount);

//             assert.equal(mallorySnapshot.totalDelegatedAmount.toNumber(),    0);
//             assert.equal(mallorySnapshot.totalStakedMvkBalance.toNumber(),   malloryStakeAmount);
//             assert.equal(mallorySnapshot.totalVotingPower.toNumber(),        malloryStakeAmount);

//             // check that governance action has been executed
//             assert.equal(updatedGovernanceAction.yayVoteStakedMvkTotal,            MVK(300));
//             assert.equal(updatedGovernanceAction.nayVoteStakedMvkTotal,            0);
//             assert.equal(updatedGovernanceAction.status,                  true);
//             assert.equal(updatedGovernanceAction.executed,                true);
//             var actionsInitiatorCheck = false
//             for(const i in updatedInitiatorsActions){
//                 if(updatedInitiatorsActions[i].toNumber() == actionId.toNumber()){
//                     actionsInitiatorCheck   = true;
//                  }
//              }
//              assert.equal(actionsInitiatorCheck, false)

//             // check that alice is now restored - status set to ACTIVE
//             assert.equal(updatedAliceSatelliteRecord.status,              "ACTIVE");
        
//         } catch(e){
//             console.dir(e, {depth: 5})
//         } 
//     });

//   }); // end %banSatellite, #restoreSatellite tests

//   describe("%addOracleToAggregator, %removeOracleInAggregator, %removeAllSatelliteOracles", async () => {

//     it('Any satellite should be able to create a governance action to add oracle to aggregator', async () => {
//         try{        

//             // some init constants
//             governanceSatelliteStorage     = await governanceSatelliteInstance.storage();
//             aggregatorFactoryStorage       = await aggregatorFactoryInstance.storage();

//             // get aggregator address from pair key
//             const pairOne = "USD";
//             const pairTwo = "BTC";
//             const usdBtcKey = {
//               0 : pairOne,
//               1 : pairTwo
//             }
//             const usdBtcAggregatorAddress  = aggregatorFactoryStorage.trackedAggregators.get(usdBtcKey);
            
//             // get aggregator contract
//             const aggregatorInstance = await utils.tezos.contract.at(usdBtcAggregatorAddress);
//             const aggregatorStorage : aggregatorStorageType = await aggregatorInstance.storage();

//             // check that user is not in aggregator oracleAddresses set
//             const aggregatorOracles        = await aggregatorStorage.oracleAddresses.get(bob.pkh);
//             assert.equal(aggregatorOracles,      undefined);

//             // get bob satellite oracle record
//             const bobSatelliteOracleRecord             = await governanceSatelliteStorage.satelliteOracleLedger.get(bob.pkh);
//             const numberOraclesSubscribedAtStart       = bobSatelliteOracleRecord == undefined ? 0 : bobSatelliteOracleRecord.aggregatorsSubscribed.toNumber();
            
//             const actionId                 = governanceSatelliteStorage.governanceSatelliteCounter;
//             const bobStakeAmount           = MVK(100);
//             const aliceStakeAmount         = MVK(100);
//             const eveStakeAmount           = MVK(100);
//             const malloryStakeAmount       = MVK(100);

//             // governance satellite action params
//             const oracleAddress            = bob.pkh;
//             const aggregatorAddress        = usdBtcAggregatorAddress;
//             const purpose                  = "Test Add Oracle To Aggregator";            

//             // Satellite Bob creates a governance action to add oracle to aggregator
//             await signerFactory(bob.sk);
//             const governanceSatelliteOperation = await governanceSatelliteInstance.methods.addOracleToAggregator(
//                     oracleAddress,
//                     aggregatorAddress,
//                     purpose
//                 ).send();
//             await governanceSatelliteOperation.confirmation();

//             governanceSatelliteStorage                     = await governanceSatelliteInstance.storage();
//             const governanceAction                         = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
//             const initiatorsActions                        = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);
            
//             const governanceSatelliteApprovalPercentage    = governanceSatelliteStorage.config.governanceSatelliteApprovalPercentage;
//             const governanceSatellitePercentageDecimals    = 4;
//             const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount + eveStakeAmount + malloryStakeAmount;
//             const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * governanceSatelliteApprovalPercentage) / (10 ** governanceSatellitePercentageDecimals);

//             // check details of governance satellite action
//             assert.equal(governanceAction.initiator,                                 bob.pkh);
//             assert.equal(governanceAction.governanceType,                            "ADD_ORACLE_TO_AGGREGATOR");
//             assert.equal(governanceAction.status,                                    true);
//             assert.equal(governanceAction.executed,                                  false);
//             assert.equal(governanceAction.governancePurpose,                         purpose);
//             assert.equal(governanceAction.yayVoteStakedMvkTotal.toNumber(),                   0);
//             assert.equal(governanceAction.nayVoteStakedMvkTotal.toNumber(),                   0);
//             assert.equal(governanceAction.passVoteStakedMvkTotal.toNumber(),                  0);
//             assert.equal(governanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
//             assert.equal(governanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
//               var actionsInitiatorCheck = false
//                 for(const i in initiatorsActions){
                    
//                     if(initiatorsActions[i].toNumber() == actionId.toNumber()){
//                         actionsInitiatorCheck   = true;
//                     }
//                 }
//                 assert.equal(actionsInitiatorCheck, true)

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
//             const updatedGovernanceSatelliteStorage                 = await governanceSatelliteInstance.storage();        
//             const updatedGovernanceAction                           = await updatedGovernanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
//             const updatedInitiatorsActions                          = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);

//             const updatedBobSatelliteOracleRecord                   = await updatedGovernanceSatelliteStorage.satelliteOracleLedger.get(bob.pkh);
//             const bobUsdBtcOracleAggregatorRecord                   = await updatedBobSatelliteOracleRecord.aggregatorPairs.get(usdBtcAggregatorAddress);

//             const updatedAggregatorStorage : aggregatorStorageType  = await aggregatorInstance.storage();
//             const updatedAggregatorOracles                          = await updatedAggregatorStorage.oracleAddresses.get(bob.pkh);
//             governanceStorage                                       = await governanceInstance.storage();
//             const currentCycle                                      = governanceStorage.cycleId;
//             const aliceSnapshot                                     = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});
//             const eveSnapshot                                       = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: eve.pkh});
//             const bobSnapshot                                       = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
//             const mallorySnapshot                                   = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: mallory.pkh});
            
//             // check details of governance satellite action snapshot ledger
//             assert.equal(bobSnapshot.totalDelegatedAmount.toNumber(),        0);
//             assert.equal(bobSnapshot.totalStakedMvkBalance.toNumber(),       bobStakeAmount);
//             assert.equal(bobSnapshot.totalVotingPower.toNumber(),            bobStakeAmount);

//             assert.equal(aliceSnapshot.totalDelegatedAmount.toNumber(),      0);
//             assert.equal(aliceSnapshot.totalStakedMvkBalance.toNumber(),     aliceStakeAmount);
//             assert.equal(aliceSnapshot.totalVotingPower.toNumber(),          aliceStakeAmount);

//             assert.equal(eveSnapshot.totalDelegatedAmount.toNumber(),        0);
//             assert.equal(eveSnapshot.totalStakedMvkBalance.toNumber(),       eveStakeAmount);
//             assert.equal(eveSnapshot.totalVotingPower.toNumber(),            eveStakeAmount);

//             assert.equal(mallorySnapshot.totalDelegatedAmount.toNumber(),    0);
//             assert.equal(mallorySnapshot.totalStakedMvkBalance.toNumber(),   malloryStakeAmount);
//             assert.equal(mallorySnapshot.totalVotingPower.toNumber(),        malloryStakeAmount);
            
//             // check that governance action has been executed
//             assert.equal(updatedGovernanceAction.yayVoteStakedMvkTotal,            MVK(300));
//             assert.equal(updatedGovernanceAction.nayVoteStakedMvkTotal,            MVK(100));
//             assert.equal(updatedGovernanceAction.status,                  true);
//             assert.equal(updatedGovernanceAction.executed,                true);
//             var actionsInitiatorCheck = false
//             for(const i in updatedInitiatorsActions){
//                 if(updatedInitiatorsActions[i].toNumber() == actionId.toNumber()){
//                     actionsInitiatorCheck   = true;
//                  }
//              }
//              assert.equal(actionsInitiatorCheck, false)

//             // check that bob oracle aggregator record is updated
//             assert.equal(updatedBobSatelliteOracleRecord.aggregatorsSubscribed,     numberOraclesSubscribedAtStart + 1);
//             assert.equal(bobUsdBtcOracleAggregatorRecord.aggregatorPair[0],         pairOne);
//             assert.equal(bobUsdBtcOracleAggregatorRecord.aggregatorPair[1],         pairTwo);
//             assert.equal(bobUsdBtcOracleAggregatorRecord.aggregatorAddress,         usdBtcAggregatorAddress);

//             // check that bob is now added to aggregator oracleAddresses Set
//             assert.equal(updatedAggregatorOracles, true);

        
//         } catch(e){
//             console.dir(e, {depth: 5})
//         } 
//     });

    
//     it('Any satellite should be able to create a governance action to remove an oracle from an aggregator', async () => {
//       try{        

//             // some init constants
//             governanceSatelliteStorage     = await governanceSatelliteInstance.storage();
//             aggregatorFactoryStorage       = await aggregatorFactoryInstance.storage();

//             // get aggregator address from pair key
//             const pairOne = "USD";
//             const pairTwo = "BTC";
//             const usdBtcKey = {
//                 0 : pairOne,
//                 1 : pairTwo
//             }
//             const usdBtcAggregatorAddress  = aggregatorFactoryStorage.trackedAggregators.get(usdBtcKey);

//             // get aggregator contract
//             const aggregatorInstance = await utils.tezos.contract.at(usdBtcAggregatorAddress);
//             const aggregatorStorage : aggregatorStorageType = await aggregatorInstance.storage();

//             // check that user is in aggregator oracleAddresses set (from previous test)
//             const aggregatorOracles        = await aggregatorStorage.oracleAddresses.get(bob.pkh);
//             assert.equal(aggregatorOracles, true);

//             // get bob satellite oracle record
//             const bobSatelliteOracleRecord             = await governanceSatelliteStorage.satelliteOracleLedger.get(bob.pkh);
//             const numberOraclesSubscribedAtStart       = bobSatelliteOracleRecord.aggregatorsSubscribed.toNumber();
            
//             const actionId                 = governanceSatelliteStorage.governanceSatelliteCounter;
//             const bobStakeAmount           = MVK(100);
//             const aliceStakeAmount         = MVK(100);
//             const eveStakeAmount           = MVK(100);
//             const malloryStakeAmount       = MVK(100);

//             // governance satellite action params
//             const oracleAddress            = bob.pkh;
//             const aggregatorAddress        = usdBtcAggregatorAddress;
//             const purpose                  = "Test Remove Oracle In Aggregator";            

//             // Satellite Bob creates a governance action to add oracle to aggregator
//             await signerFactory(bob.sk);
//             const governanceSatelliteOperation = await governanceSatelliteInstance.methods.removeOracleInAggregator(
//                     oracleAddress,
//                     aggregatorAddress,
//                     purpose
//                 ).send();
//             await governanceSatelliteOperation.confirmation();

//             governanceSatelliteStorage                     = await governanceSatelliteInstance.storage();
//             const governanceAction                         = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
//             const initiatorsActions                        = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);
            
//             const governanceSatelliteApprovalPercentage    = governanceSatelliteStorage.config.governanceSatelliteApprovalPercentage;
//             const governanceSatellitePercentageDecimals    = 4;
//             const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount + eveStakeAmount + malloryStakeAmount;
//             const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * governanceSatelliteApprovalPercentage) / (10 ** governanceSatellitePercentageDecimals);


//             // check details of governance satellite action
//             assert.equal(governanceAction.initiator,                                 bob.pkh);
//             assert.equal(governanceAction.governanceType,                            "REMOVE_ORACLE_IN_AGGREGATOR");
//             assert.equal(governanceAction.status,                                    true);
//             assert.equal(governanceAction.executed,                                  false);
//             assert.equal(governanceAction.governancePurpose,                         purpose);
//             assert.equal(governanceAction.yayVoteStakedMvkTotal.toNumber(),                   0);
//             assert.equal(governanceAction.nayVoteStakedMvkTotal.toNumber(),                   0);
//             assert.equal(governanceAction.passVoteStakedMvkTotal.toNumber(),                  0);
//             assert.equal(governanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
//             assert.equal(governanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
//               var actionsInitiatorCheck = false
//                 for(const i in initiatorsActions){
                    
//                     if(initiatorsActions[i].toNumber() == actionId.toNumber()){
//                         actionsInitiatorCheck   = true;
//                     }
//                 }
//                 assert.equal(actionsInitiatorCheck, true)

//             // 3 satellites vote yay to suspend alice satellite, alice's satellite votes nay
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
//             const updatedGovernanceSatelliteStorage     = await governanceSatelliteInstance.storage();        
//             const updatedGovernanceAction               = await updatedGovernanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
//             const updatedInitiatorsActions                         = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);

//             const updatedBobSatelliteOracleRecord       = await updatedGovernanceSatelliteStorage.satelliteOracleLedger.get(bob.pkh);
//             const bobUsdBtcOracleAggregatorRecord       = await updatedBobSatelliteOracleRecord.aggregatorPairs.get(usdBtcAggregatorAddress);

//             const updatedAggregatorStorage : aggregatorStorageType = await aggregatorInstance.storage();
//             const updatedAggregatorOracles                         = await updatedAggregatorStorage.oracleAddresses.get(bob.pkh);
//             governanceStorage                              = await governanceInstance.storage();
//             const currentCycle                             = governanceStorage.cycleId;
//             const eveSnapshot                              = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: eve.pkh});
//             const bobSnapshot                              = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
//             const mallorySnapshot                          = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: mallory.pkh});
            
//             // check details of governance satellite action snapshot ledger
//             assert.equal(bobSnapshot.totalDelegatedAmount.toNumber(),        0);
//             assert.equal(bobSnapshot.totalStakedMvkBalance.toNumber(),       bobStakeAmount);
//             assert.equal(bobSnapshot.totalVotingPower.toNumber(),            bobStakeAmount);

//             assert.equal(eveSnapshot.totalDelegatedAmount.toNumber(),        0);
//             assert.equal(eveSnapshot.totalStakedMvkBalance.toNumber(),       eveStakeAmount);
//             assert.equal(eveSnapshot.totalVotingPower.toNumber(),            eveStakeAmount);

//             assert.equal(mallorySnapshot.totalDelegatedAmount.toNumber(),    0);
//             assert.equal(mallorySnapshot.totalStakedMvkBalance.toNumber(),   malloryStakeAmount);
//             assert.equal(mallorySnapshot.totalVotingPower.toNumber(),        malloryStakeAmount);

//             // check that governance action has been executed
//             assert.equal(updatedGovernanceAction.yayVoteStakedMvkTotal,            MVK(300));
//             assert.equal(updatedGovernanceAction.nayVoteStakedMvkTotal,            0);
//             assert.equal(updatedGovernanceAction.status,                  true);
//             assert.equal(updatedGovernanceAction.executed,                true);
//             var actionsInitiatorCheck = false
//             for(const i in updatedInitiatorsActions){
//                 if(updatedInitiatorsActions[i].toNumber() == actionId.toNumber()){
//                     actionsInitiatorCheck   = true;
//                  }
//              }
//              assert.equal(actionsInitiatorCheck, false)

//             // check that bob oracle aggregator record is updated
//             assert.equal(updatedBobSatelliteOracleRecord.aggregatorsSubscribed,     numberOraclesSubscribedAtStart - 1);
//             assert.equal(bobUsdBtcOracleAggregatorRecord,                           undefined);

//             // check that bob is now removed from aggregator oracleAddresses Set
//             assert.equal(updatedAggregatorOracles, undefined);

//       } catch(e){
//           console.dir(e, {depth: 5})
//       } 
//     });

//     it('Any satellite should be able to create a governance action to remove all satellite oracles', async () => {
//         try{        

//             // some init constants
//             governanceSatelliteStorage     = await governanceSatelliteInstance.storage();
//             aggregatorFactoryStorage       = await aggregatorFactoryInstance.storage();

//             // Test flow: add three aggregators to bob's satellite, then initiate governance action to remove all satellite oracles 

//             // get aggregator address from pair key
//             const firstAggregatorPairOne = "USD";
//             const firstAggregatorPairTwo = "BTC";
//             const usdBtcKey = {
//                 0 : firstAggregatorPairOne,
//                 1 : firstAggregatorPairTwo
//             }
//             const usdBtcAggregatorAddress  = aggregatorFactoryStorage.trackedAggregators.get(usdBtcKey);

//             // get aggregator address from pair key
//             const secondAggregatorPairOne = "USD";
//             const secondAggregatorPairTwo = "XTZ";
//             const usdXtzKey = {
//                 0 : secondAggregatorPairOne,
//                 1 : secondAggregatorPairTwo
//             }
//             const usdXtzAggregatorAddress  = aggregatorFactoryStorage.trackedAggregators.get(usdXtzKey);

//             // get aggregator address from pair key
//             const thirdAggregatorPairOne = "USD";
//             const thirdAggregatorPairTwo = "DOGE";
//             const usdDogeKey = {
//                 0 : thirdAggregatorPairOne,
//                 1 : thirdAggregatorPairTwo
//             }
//             const usdDogeAggregatorAddress  = aggregatorFactoryStorage.trackedAggregators.get(usdDogeKey);
            
//             // get aggregator contracts
//             const usdBtcAggregatorInstance       = await utils.tezos.contract.at(usdBtcAggregatorAddress);
//             const usdXtzAggregatorInstance       = await utils.tezos.contract.at(usdXtzAggregatorAddress);
//             const usdDogeAggregatorInstance      = await utils.tezos.contract.at(usdDogeAggregatorAddress);
            
//             const usdBtcAggregatorStorage   : aggregatorStorageType  = await usdBtcAggregatorInstance.storage();
//             const usdXtzAggregatorStorage   : aggregatorStorageType  = await usdXtzAggregatorInstance.storage();
//             const usdDogeAggregatorStorage  : aggregatorStorageType  = await usdDogeAggregatorInstance.storage();

//             // check that user is not in aggregator oracleAddresses set
//             const usdBtcAggregatorOracles        = await usdBtcAggregatorStorage.oracleAddresses.get(bob.pkh);
//             const usdXtzAggregatorOracles        = await usdXtzAggregatorStorage.oracleAddresses.get(bob.pkh);
//             const usdDogeAggregatorOracles       = await usdDogeAggregatorStorage.oracleAddresses.get(bob.pkh);
            
//             assert.equal(usdBtcAggregatorOracles,      undefined);
//             assert.equal(usdXtzAggregatorOracles,      undefined);
//             assert.equal(usdDogeAggregatorOracles,     undefined);

//             // get bob satellite oracle record
//             const bobSatelliteOracleRecord             = await governanceSatelliteStorage.satelliteOracleLedger.get(bob.pkh);
//             const numberOraclesSubscribedAtStart       = bobSatelliteOracleRecord == undefined ? 0 : bobSatelliteOracleRecord.aggregatorsSubscribed.toNumber();
            
//             const actionId                 = governanceSatelliteStorage.governanceSatelliteCounter;
//             const bobStakeAmount           = MVK(100);
//             const aliceStakeAmount         = MVK(100);
//             const eveStakeAmount           = MVK(100);
//             const malloryStakeAmount       = MVK(100);

//             // --------------------------------------------------------
//             // governance satellite action params - add bob to first aggregator
//             // --------------------------------------------------------

//             const oracleAddress            = bob.pkh;
//             const aggregatorAddress        = usdBtcAggregatorAddress;
//             const purpose                  = "Test Add Oracle To Aggregator";            

//             // Satellite Bob creates a governance action to add oracle to aggregator
//             await signerFactory(bob.sk);
//             const governanceSatelliteAddOracleFirstOperation = await governanceSatelliteInstance.methods.addOracleToAggregator(
//                     oracleAddress,
//                     aggregatorAddress,
//                     purpose
//                 ).send();
//             await governanceSatelliteAddOracleFirstOperation.confirmation();

//             governanceSatelliteStorage                     = await governanceSatelliteInstance.storage();
//             const governanceAction                         = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
//             const initiatorsActions                        = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);
            
//             const governanceSatelliteApprovalPercentage    = governanceSatelliteStorage.config.governanceSatelliteApprovalPercentage;
//             const governanceSatellitePercentageDecimals    = 4;
//             const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount + eveStakeAmount + malloryStakeAmount;
//             const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * governanceSatelliteApprovalPercentage) / (10 ** governanceSatellitePercentageDecimals);

//             // check details of governance satellite action
//             assert.equal(governanceAction.initiator,                                 bob.pkh);
//             assert.equal(governanceAction.governanceType,                            "ADD_ORACLE_TO_AGGREGATOR");
//             assert.equal(governanceAction.status,                                    true);
//             assert.equal(governanceAction.executed,                                  false);
//             assert.equal(governanceAction.governancePurpose,                         purpose);
//             assert.equal(governanceAction.yayVoteStakedMvkTotal.toNumber(),                   0);
//             assert.equal(governanceAction.nayVoteStakedMvkTotal.toNumber(),                   0);
//             assert.equal(governanceAction.passVoteStakedMvkTotal.toNumber(),                  0);
//             assert.equal(governanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
//             assert.equal(governanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
//               var actionsInitiatorCheck = false
//                 for(const i in initiatorsActions){
                    
//                     if(initiatorsActions[i].toNumber() == actionId.toNumber()){
//                         actionsInitiatorCheck   = true;
//                     }
//                 }
//                 assert.equal(actionsInitiatorCheck, true)
        
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

//             // --------------------------------------------------------
//             // governance satellite action params - add bob to second aggregator
//             // --------------------------------------------------------

//             // Satellite Bob creates a governance action to add oracle to aggregator
//             await signerFactory(bob.sk);
//             const secondGovernanceSatelliteStorage         = await governanceSatelliteInstance.storage();
//             const secondActionId                           = secondGovernanceSatelliteStorage.governanceSatelliteCounter;

//             const governanceSatelliteAddOracleSecondOperation = await governanceSatelliteInstance.methods.addOracleToAggregator(
//                     oracleAddress,
//                     usdXtzAggregatorAddress,
//                     purpose
//                 ).send();
//             await governanceSatelliteAddOracleSecondOperation.confirmation();

//             const secondGovernanceAction                   = await secondGovernanceSatelliteStorage.governanceSatelliteActionLedger.get(secondActionId);
            
//             // check details of governance satellite action
//             assert.equal(secondGovernanceAction.initiator,                                 bob.pkh);
//             assert.equal(secondGovernanceAction.governanceType,                            "ADD_ORACLE_TO_AGGREGATOR");
//             assert.equal(secondGovernanceAction.status,                                    true);
//             assert.equal(secondGovernanceAction.executed,                                  false);
//             assert.equal(secondGovernanceAction.governancePurpose,                         purpose);
//             assert.equal(secondGovernanceAction.yayVoteStakedMvkTotal.toNumber(),                   0);
//             assert.equal(secondGovernanceAction.nayVoteStakedMvkTotal.toNumber(),                   0);
//             assert.equal(secondGovernanceAction.passVoteStakedMvkTotal.toNumber(),                  0);
//             assert.equal(secondGovernanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
//             assert.equal(secondGovernanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
        
//             // 3 satellites vote yay, one satellite votes nay
//             await signerFactory(bob.sk);
//             const bobVotesForGovernanceActionSecondOperation = await governanceSatelliteInstance.methods.voteForAction(secondActionId, "yay").send();
//             await bobVotesForGovernanceActionSecondOperation.confirmation();

//             await signerFactory(eve.sk);
//             const eveVotesForGovernanceActionSecondOperation = await governanceSatelliteInstance.methods.voteForAction(secondActionId, "yay").send();
//             await eveVotesForGovernanceActionSecondOperation.confirmation();
            
//             await signerFactory(alice.sk);
//             const aliceVotesForGovernanceActionSecondOperation = await governanceSatelliteInstance.methods.voteForAction(secondActionId, "nay").send();
//             await aliceVotesForGovernanceActionSecondOperation.confirmation();

//             await signerFactory(mallory.sk);
//             const malloryVotesForGovernanceActionSecondOperation = await governanceSatelliteInstance.methods.voteForAction(secondActionId, "yay").send();
//             await malloryVotesForGovernanceActionSecondOperation.confirmation();

//             // --------------------------------------------------------
//             // governance satellite action params - add bob to third aggregator
//             // --------------------------------------------------------

//             // Satellite Bob creates a governance action to add oracle to aggregator
//             await signerFactory(bob.sk);
//             const thirdGovernanceSatelliteStorage         = await governanceSatelliteInstance.storage();
//             const thirdActionId                           = thirdGovernanceSatelliteStorage.governanceSatelliteCounter;

//             const governanceSatelliteAddOracleThirdOperation = await governanceSatelliteInstance.methods.addOracleToAggregator(
//                     oracleAddress,
//                     usdDogeAggregatorAddress,
//                     purpose
//                 ).send();
//             await governanceSatelliteAddOracleThirdOperation.confirmation();

//             const thirdGovernanceAction                   = await thirdGovernanceSatelliteStorage.governanceSatelliteActionLedger.get(thirdActionId);
            
//             // check details of governance satellite action
//             assert.equal(thirdGovernanceAction.initiator,                                 bob.pkh);
//             assert.equal(thirdGovernanceAction.governanceType,                            "ADD_ORACLE_TO_AGGREGATOR");
//             assert.equal(thirdGovernanceAction.status,                                    true);
//             assert.equal(thirdGovernanceAction.executed,                                  false);
//             assert.equal(thirdGovernanceAction.governancePurpose,                         purpose);
//             assert.equal(thirdGovernanceAction.yayVoteStakedMvkTotal.toNumber(),                   0);
//             assert.equal(thirdGovernanceAction.nayVoteStakedMvkTotal.toNumber(),                   0);
//             assert.equal(thirdGovernanceAction.passVoteStakedMvkTotal.toNumber(),                  0);
//             assert.equal(thirdGovernanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
//             assert.equal(thirdGovernanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
        
//             // 3 satellites vote yay, one satellite votes nay
//             await signerFactory(bob.sk);
//             const bobVotesForGovernanceActionThirdOperation = await governanceSatelliteInstance.methods.voteForAction(thirdActionId, "yay").send();
//             await bobVotesForGovernanceActionThirdOperation.confirmation();

//             await signerFactory(eve.sk);
//             const eveVotesForGovernanceActionThirdOperation = await governanceSatelliteInstance.methods.voteForAction(thirdActionId, "yay").send();
//             await eveVotesForGovernanceActionThirdOperation.confirmation();
            
//             await signerFactory(alice.sk);
//             const aliceVotesForGovernanceActionThirdOperation = await governanceSatelliteInstance.methods.voteForAction(thirdActionId, "nay").send();
//             await aliceVotesForGovernanceActionThirdOperation.confirmation();

//             await signerFactory(mallory.sk);
//             const malloryVotesForGovernanceActionThirdOperation = await governanceSatelliteInstance.methods.voteForAction(thirdActionId, "yay").send();
//             await malloryVotesForGovernanceActionThirdOperation.confirmation();

//             // --------------------------------------------------------
//             // governance satellite check storage that bob is now linked to three aggregators
//             // --------------------------------------------------------

//             // get updated storage
//             const updatedGovernanceSatelliteStorage    = await governanceSatelliteInstance.storage();        
//             const updatedGovernanceAction              = await updatedGovernanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
//             const updatedInitiatorsActions             = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);

//             const updatedBobSatelliteOracleRecord      = await updatedGovernanceSatelliteStorage.satelliteOracleLedger.get(bob.pkh);

//             const bobUsdBtcOracleAggregatorRecord      = await updatedBobSatelliteOracleRecord.aggregatorPairs.get(usdBtcAggregatorAddress);
//             const bobUsdXtzOracleAggregatorRecord      = await updatedBobSatelliteOracleRecord.aggregatorPairs.get(usdXtzAggregatorAddress);
//             const bobUsdDogeOracleAggregatorRecord     = await updatedBobSatelliteOracleRecord.aggregatorPairs.get(usdDogeAggregatorAddress);

//             const updatedUsdBtcAggregatorStorage   : aggregatorStorageType  = await usdBtcAggregatorInstance.storage();
//             const updatedUsdXtzAggregatorStorage   : aggregatorStorageType  = await usdXtzAggregatorInstance.storage();
//             const updatedUsdDogeAggregatorStorage  : aggregatorStorageType  = await usdDogeAggregatorInstance.storage();

//             // check that user is not in aggregator oracleAddresses set
//             const updatedUsdBtcAggregatorOracles        = await updatedUsdBtcAggregatorStorage.oracleAddresses.get(bob.pkh);
//             const updatedUsdXtzAggregatorOracles        = await updatedUsdXtzAggregatorStorage.oracleAddresses.get(bob.pkh);
//             const updatedUsdDogeAggregatorOracles       = await updatedUsdDogeAggregatorStorage.oracleAddresses.get(bob.pkh);
            
//             // check that governance action has been executed
//             assert.equal(updatedGovernanceAction.yayVoteStakedMvkTotal,            MVK(300));
//             assert.equal(updatedGovernanceAction.nayVoteStakedMvkTotal,            MVK(100));
//             assert.equal(updatedGovernanceAction.status,                  true);
//             assert.equal(updatedGovernanceAction.executed,                true);
//             var actionsInitiatorCheck = false
//             for(const i in updatedInitiatorsActions){
//                 if(updatedInitiatorsActions[i].toNumber() == actionId.toNumber()){
//                     actionsInitiatorCheck   = true;
//                  }
//              }
//              assert.equal(actionsInitiatorCheck, false)

//             // check that bob oracle aggregator record is updated
//             assert.equal(updatedBobSatelliteOracleRecord.aggregatorsSubscribed,     numberOraclesSubscribedAtStart + 3);
//             assert.equal(bobUsdBtcOracleAggregatorRecord.aggregatorAddress,         usdBtcAggregatorAddress);
//             assert.equal(bobUsdXtzOracleAggregatorRecord.aggregatorAddress,         usdXtzAggregatorAddress);
//             assert.equal(bobUsdDogeOracleAggregatorRecord.aggregatorAddress,        usdDogeAggregatorAddress);

//             // check that bob is now added to aggregator oracleAddresses Set
//             assert.equal(updatedUsdBtcAggregatorOracles,      true);
//             assert.equal(updatedUsdXtzAggregatorOracles,      true);
//             assert.equal(updatedUsdDogeAggregatorOracles,     true);

//             // --------------------------------------------------------
//             // governance satellite action params - remove all satellite oracles
//             // --------------------------------------------------------

//             // governance satellite action params
//             const satelliteAddress         = bob.pkh;
//             const purposeRemove            = "Test Remove All Satellite Oracles";            

//             // Satellite Bob creates a governance action to remove all satellite oracles
//             await signerFactory(bob.sk);
//             const fourthGovernanceSatelliteStorage         = await governanceSatelliteInstance.storage();
//             const fourthActionId                           = fourthGovernanceSatelliteStorage.governanceSatelliteCounter;

//             const governanceSatelliteOperation = await governanceSatelliteInstance.methods.removeAllSatelliteOracles(
//                     satelliteAddress,
//                     purposeRemove
//                 ).send();
//             await governanceSatelliteOperation.confirmation();

//             const fourthGovernanceAction                   = await fourthGovernanceSatelliteStorage.governanceSatelliteActionLedger.get(fourthActionId);
            
//             // check details of governance satellite action
//             assert.equal(fourthGovernanceAction.initiator,                                 bob.pkh);
//             assert.equal(fourthGovernanceAction.governanceType,                            "REMOVE_ALL_SATELLITE_ORACLES");
//             assert.equal(fourthGovernanceAction.status,                                    true);
//             assert.equal(fourthGovernanceAction.executed,                                  false);
//             assert.equal(fourthGovernanceAction.governancePurpose,                         purposeRemove);
//             assert.equal(fourthGovernanceAction.yayVoteStakedMvkTotal.toNumber(),                   0);
//             assert.equal(fourthGovernanceAction.nayVoteStakedMvkTotal.toNumber(),                   0);
//             assert.equal(fourthGovernanceAction.passVoteStakedMvkTotal.toNumber(),                  0);
//             assert.equal(fourthGovernanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
//             assert.equal(fourthGovernanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);

//             // 3 satellites vote yay, one satellite votes nay
//             await signerFactory(bob.sk);
//             const bobVotesForGovernanceActionFourthOperation = await governanceSatelliteInstance.methods.voteForAction(fourthActionId, "yay").send();
//             await bobVotesForGovernanceActionFourthOperation.confirmation();

//             await signerFactory(eve.sk);
//             const eveVotesForGovernanceActionFourthOperation = await governanceSatelliteInstance.methods.voteForAction(fourthActionId, "yay").send();
//             await eveVotesForGovernanceActionFourthOperation.confirmation();
            
//             await signerFactory(alice.sk);
//             const aliceVotesForGovernanceActionFourthOperation = await governanceSatelliteInstance.methods.voteForAction(fourthActionId, "nay").send();
//             await aliceVotesForGovernanceActionFourthOperation.confirmation();

//             await signerFactory(mallory.sk);
//             const malloryVotesForGovernanceActionFourthOperation = await governanceSatelliteInstance.methods.voteForAction(fourthActionId, "yay").send();
//             await malloryVotesForGovernanceActionFourthOperation.confirmation();

//             // --------------------------------------------------------
//             // governance satellite action params - remove all satellite oracles
//             // --------------------------------------------------------

//             const finalUpdatedGovernanceSatelliteStorage    = await governanceSatelliteInstance.storage();        
//             const finalUpdatedGovernanceAction              = await finalUpdatedGovernanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);              

//             const finalUpdatedBobSatelliteOracleRecord      = await finalUpdatedGovernanceSatelliteStorage.satelliteOracleLedger.get(bob.pkh);
//             const finalBobUsdBtcOracleAggregatorRecord      = await finalUpdatedBobSatelliteOracleRecord.aggregatorPairs.get(usdBtcAggregatorAddress);
//             const finalBobUsdXtzOracleAggregatorRecord      = await finalUpdatedBobSatelliteOracleRecord.aggregatorPairs.get(usdXtzAggregatorAddress);
//             const finalBobUsdDogeOracleAggregatorRecord     = await finalUpdatedBobSatelliteOracleRecord.aggregatorPairs.get(usdDogeAggregatorAddress);

//             const finalUpdatedUsdBtcAggregatorStorage   : aggregatorStorageType  = await usdBtcAggregatorInstance.storage();
//             const finalUpdatedUsdXtzAggregatorStorage   : aggregatorStorageType  = await usdXtzAggregatorInstance.storage();
//             const finalUpdatedUsdDogeAggregatorStorage  : aggregatorStorageType  = await usdDogeAggregatorInstance.storage();

//             // check that user is not in aggregator oracleAddresses set
//             const finalUpdatedUsdBtcAggregatorOracles        = await finalUpdatedUsdBtcAggregatorStorage.oracleAddresses.get(bob.pkh);
//             const finalUpdatedUsdXtzAggregatorOracles        = await finalUpdatedUsdXtzAggregatorStorage.oracleAddresses.get(bob.pkh);
//             const finalUpdatedUsdDogeAggregatorOracles       = await finalUpdatedUsdDogeAggregatorStorage.oracleAddresses.get(bob.pkh);
            
//             // check that governance action has been executed
//             assert.equal(finalUpdatedGovernanceAction.yayVoteStakedMvkTotal,            MVK(300));
//             assert.equal(finalUpdatedGovernanceAction.nayVoteStakedMvkTotal,            MVK(100));
//             assert.equal(finalUpdatedGovernanceAction.status,                  true);
//             assert.equal(finalUpdatedGovernanceAction.executed,                true);

//             // check that bob oracle aggregator record is finalUpdated
//             assert.equal(finalUpdatedBobSatelliteOracleRecord.aggregatorsSubscribed,    0);
//             assert.equal(finalBobUsdBtcOracleAggregatorRecord,                          undefined);
//             assert.equal(finalBobUsdXtzOracleAggregatorRecord,                          undefined);
//             assert.equal(finalBobUsdDogeOracleAggregatorRecord,                         undefined);

//             // check that bob is now added to aggregator oracleAddresses Set
//             assert.equal(finalUpdatedUsdBtcAggregatorOracles,      undefined);
//             assert.equal(finalUpdatedUsdXtzAggregatorOracles,      undefined);
//             assert.equal(finalUpdatedUsdDogeAggregatorOracles,     undefined);
        
//         } catch(e){
//             console.dir(e, {depth: 5})
//         } 
//     });

// });  // end %addOracleToAggregator, %removeOracleInAggregator, %removeAllSatelliteOracles tests


//   describe("%updateAggregatorStatus", async () => {

//         it('Any satellite should be able to create a governance action to update aggregator status', async () => {
//             try{        

//                 // some init constants
//                 governanceSatelliteStorage     = await governanceSatelliteInstance.storage();
                
//                 // get aggregator address from pair key
//                 const pairOne = "USD";
//                 const pairTwo = "BTC";
//                 const usdBtcKey = {
//                     0 : pairOne,
//                     1 : pairTwo
//                 }
//                 const usdBtcAggregatorAddress  = aggregatorFactoryStorage.trackedAggregators.get(usdBtcKey);
                
//                 const aggregatorRecord         = await governanceSatelliteStorage.aggregatorLedger.get(usdBtcAggregatorAddress);
//                 assert.equal(aggregatorRecord.status, "ACTIVE");

//                 // get aggregator contract
//                 const aggregatorInstance       = await utils.tezos.contract.at(usdBtcAggregatorAddress);
//                 const aggregatorStorage        = await aggregatorInstance.storage();

//                 const actionId                 = governanceSatelliteStorage.governanceSatelliteCounter;
//                 const bobStakeAmount           = MVK(100);
//                 const aliceStakeAmount         = MVK(100);
//                 const eveStakeAmount           = MVK(100);
//                 const malloryStakeAmount       = MVK(100);

//                 // governance satellite action params
//                 const aggregatorAddress        = usdBtcAggregatorAddress;
//                 const newStatus                = "INACTIVE"
//                 const purpose                  = "Test Update Aggregator Status";            
    
//                 // Satellite Bob creates a governance action - suspend Alice
//                 await signerFactory(bob.sk);
//                 const governanceSatelliteOperation = await governanceSatelliteInstance.methods.updateAggregatorStatus(
//                         aggregatorAddress,
//                         newStatus,
//                         purpose
//                     ).send();
//                 await governanceSatelliteOperation.confirmation();
    
//                 governanceSatelliteStorage                     = await governanceSatelliteInstance.storage();
//                 const governanceAction                         = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
//                 const initiatorsActions                        = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);
                
//                 const governanceSatelliteApprovalPercentage    = governanceSatelliteStorage.config.governanceSatelliteApprovalPercentage;
//                 const governanceSatellitePercentageDecimals    = 4;
//                 const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount + eveStakeAmount + malloryStakeAmount;
//                 const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * governanceSatelliteApprovalPercentage) / (10 ** governanceSatellitePercentageDecimals);

    
//                 // check details of governance satellite action
//                 assert.equal(governanceAction.initiator,                                 bob.pkh);
//                 assert.equal(governanceAction.governanceType,                            "UPDATE_AGGREGATOR_STATUS");
//                 assert.equal(governanceAction.status,                                    true);
//                 assert.equal(governanceAction.executed,                                  false);
//                 assert.equal(governanceAction.governancePurpose,                         purpose);
//                 assert.equal(governanceAction.yayVoteStakedMvkTotal.toNumber(),                   0);
//                 assert.equal(governanceAction.nayVoteStakedMvkTotal.toNumber(),                   0);
//                 assert.equal(governanceAction.passVoteStakedMvkTotal.toNumber(),                  0);
//                 assert.equal(governanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
//                 assert.equal(governanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
//                 var actionsInitiatorCheck = false
//                 for(const i in initiatorsActions){
//                     if(initiatorsActions[i].toNumber() == actionId.toNumber()){
//                         actionsInitiatorCheck   = true;
//                     }
//                 }
//                 assert.equal(actionsInitiatorCheck, true)
    
//                 // 3 satellites vote yay, one satellite votes nay
//                 await signerFactory(bob.sk);
//                 const bobVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
//                 await bobVotesForGovernanceActionOperation.confirmation();
    
//                 await signerFactory(eve.sk);
//                 const eveVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
//                 await eveVotesForGovernanceActionOperation.confirmation();
                
//                 await signerFactory(alice.sk);
//                 const aliceVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "nay").send();
//                 await aliceVotesForGovernanceActionOperation.confirmation();

//                 await signerFactory(mallory.sk);
//                 const malloryVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
//                 await malloryVotesForGovernanceActionOperation.confirmation();
    
//                 // get updated storage
//                 const updatedGovernanceSatelliteStorage            = await governanceSatelliteInstance.storage();        
//                 const updatedGovernanceAction                      = await updatedGovernanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
//                 const updatedInitiatorsActions                     = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);

//                 const updatedAggregatorRecord                      = await updatedGovernanceSatelliteStorage.aggregatorLedger.get(usdBtcAggregatorAddress);
//                 governanceStorage                              = await governanceInstance.storage();
//                 const currentCycle                             = governanceStorage.cycleId;
//                 const aliceSnapshot                            = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});
//                 const eveSnapshot                              = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: eve.pkh});
//                 const bobSnapshot                              = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
//                 const mallorySnapshot                          = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: mallory.pkh});
                
//                 // check details of governance satellite action snapshot ledger
//                 assert.equal(bobSnapshot.totalDelegatedAmount.toNumber(),        0);
//                 assert.equal(bobSnapshot.totalStakedMvkBalance.toNumber(),       bobStakeAmount);
//                 assert.equal(bobSnapshot.totalVotingPower.toNumber(),            bobStakeAmount);
    
//                 assert.equal(aliceSnapshot.totalDelegatedAmount.toNumber(),      0);
//                 assert.equal(aliceSnapshot.totalStakedMvkBalance.toNumber(),     aliceStakeAmount);
//                 assert.equal(aliceSnapshot.totalVotingPower.toNumber(),          aliceStakeAmount);

//                 assert.equal(eveSnapshot.totalDelegatedAmount.toNumber(),        0);
//                 assert.equal(eveSnapshot.totalStakedMvkBalance.toNumber(),       eveStakeAmount);
//                 assert.equal(eveSnapshot.totalVotingPower.toNumber(),            eveStakeAmount);

//                 assert.equal(mallorySnapshot.totalDelegatedAmount.toNumber(),    0);
//                 assert.equal(mallorySnapshot.totalStakedMvkBalance.toNumber(),   malloryStakeAmount);
//                 assert.equal(mallorySnapshot.totalVotingPower.toNumber(),        malloryStakeAmount);

//                 // check that governance action has been executed
//                 assert.equal(updatedGovernanceAction.yayVoteStakedMvkTotal,            MVK(300));
//                 assert.equal(updatedGovernanceAction.nayVoteStakedMvkTotal,            MVK(100));
//                 assert.equal(updatedGovernanceAction.status,                  true);
//                 assert.equal(updatedGovernanceAction.executed,                true);
//                 var actionsInitiatorCheck = false
//             for(const i in updatedInitiatorsActions){
//                 if(updatedInitiatorsActions[i].toNumber() == actionId.toNumber()){
//                     actionsInitiatorCheck   = true;
//                  }
//              }
//              assert.equal(actionsInitiatorCheck, false)

//                 // check that aggregator is now inactive
//                 assert.equal(updatedAggregatorRecord.status, "INACTIVE");
            
//             } catch(e){
//                 console.dir(e, {depth: 5})
//             } 
//         });
        
//     });  // end %updateAggregatorStatus tests


//     describe("%fixMistakenTransfer", async () => {

//         it('Any satellite should be able to create a governance action to resolve a mistaken transfer made by a user', async () => {
//             try{        
    
//                 // some init constants
//                 governanceSatelliteStorage      = await governanceSatelliteInstance.storage();
//                 mvkTokenStorage                 = await mvkTokenInstance.storage()
//                 var contractAccount             = await mvkTokenStorage.ledger.get(aggregatorFactoryAddress.address)
//                 var userAccount                 = await mvkTokenStorage.ledger.get(bob.pkh)
//                 const initAccountBalance        = contractAccount ? contractAccount.toNumber() : 0;
//                 const initUserBalance           = userAccount ? userAccount.toNumber() : 0;
//                 const tokenAmount               = MVK(200);
//                 const purpose                   = "Transfer made by mistake to the aggregator factory"
//                 const actionId                  = governanceSatelliteStorage.governanceSatelliteCounter;
//                 const bobStakeAmount            = MVK(100);
//                 const aliceStakeAmount          = MVK(100);
//                 const eveStakeAmount            = MVK(100);
//                 const malloryStakeAmount        = MVK(100);
    
//                 await signerFactory(bob.sk);
    
//                 // Mistake Operation
//                 const transferOperation         = await mvkTokenInstance.methods.transfer([
//                     {
//                         from_: bob.pkh,
//                         txs: [
//                             {
//                                 to_: aggregatorFactoryAddress.address,
//                                 token_id: 0,
//                                 amount: tokenAmount
//                             }
//                         ]
//                     }
//                 ]).send();
//                 await transferOperation.confirmation();
    
//                 // Mid values
//                 mvkTokenStorage             = await mvkTokenInstance.storage()
//                 contractAccount             = await mvkTokenStorage.ledger.get(aggregatorFactoryAddress.address)
//                 userAccount                 = await mvkTokenStorage.ledger.get(bob.pkh)
//                 const midAccountBalance     = contractAccount ? contractAccount.toNumber() : 0;          
    
//                 // Mid assertions
//                 assert.equal(midAccountBalance, initAccountBalance + tokenAmount)
    
//                 // Satellite Bob creates a governance action
//                 const governanceSatelliteOperation = await governanceSatelliteInstance.methods.fixMistakenTransfer(
//                         aggregatorFactoryAddress.address,
//                         purpose,
//                         [
//                             {
//                                 "to_"    : bob.pkh,
//                                 "token"  : {
//                                     "fa2" : {
//                                         "tokenContractAddress": mvkTokenAddress.address,
//                                         "tokenId" : 0
//                                     }
//                                 },
//                                 "amount" : tokenAmount
//                             }
//                         ]
//                     ).send();
//                 await governanceSatelliteOperation.confirmation();
    
//                 governanceSatelliteStorage                     = await governanceSatelliteInstance.storage();
//                 const governanceAction                         = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
//                 const initiatorsActions                        = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);
                
//                 const governanceSatelliteApprovalPercentage    = governanceSatelliteStorage.config.governanceSatelliteApprovalPercentage;
//                 const governanceSatellitePercentageDecimals    = 4;
//                 const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount + eveStakeAmount + malloryStakeAmount;
//                 const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * governanceSatelliteApprovalPercentage) / (10 ** governanceSatellitePercentageDecimals);
    
    
//                 // check details of governance satellite action
//                 assert.equal(governanceAction.initiator,                                 bob.pkh);
//                 assert.equal(governanceAction.governanceType,                            "MISTAKEN_TRANSFER_FIX");
//                 assert.equal(governanceAction.status,                                    true);
//                 assert.equal(governanceAction.executed,                                  false);
//                 assert.equal(governanceAction.governancePurpose,                         purpose);
//                 assert.equal(governanceAction.yayVoteStakedMvkTotal.toNumber(),                   0);
//                 assert.equal(governanceAction.nayVoteStakedMvkTotal.toNumber(),                   0);
//                 assert.equal(governanceAction.passVoteStakedMvkTotal.toNumber(),                  0);
//                 assert.equal(governanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
//                 assert.equal(governanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
//                 var actionsInitiatorCheck = false
//                 for(const i in initiatorsActions){
//                     if(initiatorsActions[i].toNumber() == actionId.toNumber()){
//                         actionsInitiatorCheck   = true;
//                     }
//                 }
//                 assert.equal(actionsInitiatorCheck, true)
    
//                 // 3 satellites vote yay, one satellite votes nay
//                 await signerFactory(bob.sk);
//                 const bobVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
//                 await bobVotesForGovernanceActionOperation.confirmation();
    
//                 await signerFactory(eve.sk);
//                 const eveVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
//                 await eveVotesForGovernanceActionOperation.confirmation();
                
//                 await signerFactory(alice.sk);
//                 const aliceVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "nay").send();
//                 await aliceVotesForGovernanceActionOperation.confirmation();
    
//                 await signerFactory(mallory.sk);
//                 const malloryVotesForGovernanceActionOperation = await governanceSatelliteInstance.methods.voteForAction(actionId, "yay").send();
//                 await malloryVotesForGovernanceActionOperation.confirmation();
    
//                 // get updated storage
//                 governanceSatelliteStorage                  = await governanceSatelliteInstance.storage();
//                 mvkTokenStorage                             = await mvkTokenInstance.storage()      
//                 const updatedGovernanceAction               = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
//                 const updatedInitiatorsActions              = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);
//                 contractAccount                             = await mvkTokenStorage.ledger.get(aggregatorFactoryAddress.address)
//                 userAccount                                 = await mvkTokenStorage.ledger.get(bob.pkh)
//                 const endAccountBalance                     = contractAccount ? contractAccount.toNumber() : 0;
//                 const endUserBalance                        = userAccount ? userAccount.toNumber() : 0;
//                 governanceStorage                              = await governanceInstance.storage();
//                 const currentCycle                             = governanceStorage.cycleId;
//                 const aliceSnapshot                            = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});
//                 const eveSnapshot                              = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: eve.pkh});
//                 const bobSnapshot                              = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
//                 const mallorySnapshot                          = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: mallory.pkh});
                
//                 // check details of governance satellite action snapshot ledger
//                 assert.equal(bobSnapshot.totalDelegatedAmount.toNumber(),        0);
//                 assert.equal(bobSnapshot.totalStakedMvkBalance.toNumber(),       bobStakeAmount);
//                 assert.equal(bobSnapshot.totalVotingPower.toNumber(),            bobStakeAmount);
    
//                 assert.equal(aliceSnapshot.totalDelegatedAmount.toNumber(),      0);
//                 assert.equal(aliceSnapshot.totalStakedMvkBalance.toNumber(),     aliceStakeAmount);
//                 assert.equal(aliceSnapshot.totalVotingPower.toNumber(),          aliceStakeAmount);
    
//                 assert.equal(eveSnapshot.totalDelegatedAmount.toNumber(),        0);
//                 assert.equal(eveSnapshot.totalStakedMvkBalance.toNumber(),       eveStakeAmount);
//                 assert.equal(eveSnapshot.totalVotingPower.toNumber(),            eveStakeAmount);
    
//                 assert.equal(mallorySnapshot.totalDelegatedAmount.toNumber(),    0);
//                 assert.equal(mallorySnapshot.totalStakedMvkBalance.toNumber(),   malloryStakeAmount);
//                 assert.equal(mallorySnapshot.totalVotingPower.toNumber(),        malloryStakeAmount);
    
//                 // check that governance action has been executed
//                 assert.equal(updatedGovernanceAction.yayVoteStakedMvkTotal,            MVK(300));
//                 assert.equal(updatedGovernanceAction.nayVoteStakedMvkTotal,            MVK(100));
//                 assert.equal(updatedGovernanceAction.status,                  true);
//                 assert.equal(updatedGovernanceAction.executed,                true);
//                 var actionsInitiatorCheck = false
//             for(const i in updatedInitiatorsActions){
//                 if(updatedInitiatorsActions[i].toNumber() == actionId.toNumber()){
//                     actionsInitiatorCheck   = true;
//                  }
//              }
//              assert.equal(actionsInitiatorCheck, false)
    
//                 // Final assertions
//                 assert.equal(endAccountBalance, initAccountBalance)
//                 assert.equal(endUserBalance, initUserBalance)
            
//             } catch(e){
//                 console.dir(e, {depth: 5})
//             } 
//         });
        
//     });  // end %fixMistakenTransfer tests

//     describe("%dropAction", async () => {

//         it('Satellite should be able to drop an action it created', async () => {
//             try{
    
//             // some init constants
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
//             const initiatorsActions                        = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);

//             const governanceSatelliteApprovalPercentage    = governanceSatelliteStorage.config.governanceSatelliteApprovalPercentage;
//             const governanceSatellitePercentageDecimals    = 4;
//             const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount + eveStakeAmount + malloryStakeAmount;
//             const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * governanceSatelliteApprovalPercentage) / (10 ** governanceSatellitePercentageDecimals);


//             // check details of governance satellite action
//             assert.equal(governanceAction.initiator,                                 bob.pkh);
//             assert.equal(governanceAction.governanceType,                            "BAN");
//             assert.equal(governanceAction.status,                                    true);
//             assert.equal(governanceAction.executed,                                  false);
//             assert.equal(governanceAction.governancePurpose,                         purpose);
//             assert.equal(governanceAction.yayVoteStakedMvkTotal.toNumber(),                   0);
//             assert.equal(governanceAction.nayVoteStakedMvkTotal.toNumber(),                   0);
//             assert.equal(governanceAction.passVoteStakedMvkTotal.toNumber(),                  0);
//             assert.equal(governanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
//             assert.equal(governanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
//               var actionsInitiatorCheck = false
//                 for(const i in initiatorsActions){
                    
//                     if(initiatorsActions[i].toNumber() == actionId.toNumber()){
//                         actionsInitiatorCheck   = true;
//                     }
//                 }
//                 assert.equal(actionsInitiatorCheck, true)

//             // 3 satellites vote yay, one satellite votes nay
//             await signerFactory(bob.sk);
//             const dropsActionOperation  = await governanceSatelliteInstance.methods.dropAction(actionId).send();
//             await dropsActionOperation.confirmation();

//             // get updated storage
//             const updatedGovernanceSatelliteStorage                = await governanceSatelliteInstance.storage();        
//             const updatedGovernanceAction                          = await updatedGovernanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
//             const updatedInitiatorsActions                         = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);
//             governanceStorage                              = await governanceInstance.storage();
//             const currentCycle                             = governanceStorage.cycleId;
//             const aliceSnapshot                            = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});
//             const eveSnapshot                              = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: eve.pkh});
//             const bobSnapshot                              = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
//             const mallorySnapshot                          = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: mallory.pkh});

//             // check details of governance satellite action snapshot ledger
//             assert.equal(bobSnapshot.totalDelegatedAmount.toNumber(),        0);
//             assert.equal(bobSnapshot.totalStakedMvkBalance.toNumber(),       bobStakeAmount);
//             assert.equal(bobSnapshot.totalVotingPower.toNumber(),            bobStakeAmount);

//             assert.equal(aliceSnapshot.totalDelegatedAmount.toNumber(),      0);
//             assert.equal(aliceSnapshot.totalStakedMvkBalance.toNumber(),     aliceStakeAmount);
//             assert.equal(aliceSnapshot.totalVotingPower.toNumber(),          aliceStakeAmount);

//             assert.equal(eveSnapshot.totalDelegatedAmount.toNumber(),        0);
//             assert.equal(eveSnapshot.totalStakedMvkBalance.toNumber(),       eveStakeAmount);
//             assert.equal(eveSnapshot.totalVotingPower.toNumber(),            eveStakeAmount);

//             assert.equal(mallorySnapshot.totalDelegatedAmount.toNumber(),    0);
//             assert.equal(mallorySnapshot.totalStakedMvkBalance.toNumber(),   malloryStakeAmount);
//             assert.equal(mallorySnapshot.totalVotingPower.toNumber(),        malloryStakeAmount);

//             // check that governance action has been dropped and remove from the satellite actions
//             assert.equal(updatedGovernanceAction.status,                  false);
//             assert.equal(updatedGovernanceAction.executed,                false);
//             var actionsInitiatorCheck = false
//             for(const i in updatedInitiatorsActions){
//                 if(updatedInitiatorsActions[i].toNumber() == actionId.toNumber()){
//                     actionsInitiatorCheck   = true;
//                  }
//              }
//              assert.equal(actionsInitiatorCheck, false)
//             } catch(e){
//                 console.dir(e, {depth: 5})
//             } 
//         });

//         it('Satellite should be not able to drop an action it did not create', async () => {
            
//             try{
                
//                 // some init constants
//                 governanceSatelliteStorage     = await governanceSatelliteInstance.storage();
//                 const delegationStorage        = await delegationInstance.storage();        
//                 const aliceSatelliteRecord     = await delegationStorage.satelliteLedger.get(alice.pkh);

//                 assert.equal(aliceSatelliteRecord.status, "ACTIVE");

//                 const actionId                 = governanceSatelliteStorage.governanceSatelliteCounter;
//                 const bobStakeAmount           = MVK(100);
//                 const aliceStakeAmount         = MVK(100);
//                 const eveStakeAmount           = MVK(100);
//                 const malloryStakeAmount       = MVK(100);

//                 // governance satellite action params
//                 const satelliteToBeSuspended   = alice.pkh;
//                 const purpose                  = "Test Ban Satellite";            

//                 // Satellite Bob creates a governance action to ban Alice
//                 await signerFactory(bob.sk);
//                 const governanceSatelliteOperation = await governanceSatelliteInstance.methods.banSatellite(
//                         satelliteToBeSuspended,
//                         purpose
//                     ).send();
//                 await governanceSatelliteOperation.confirmation();


//                 governanceSatelliteStorage                     = await governanceSatelliteInstance.storage();
//                 governanceStorage                              = await governanceInstance.storage();
//                 const currentCycle                             = governanceStorage.cycleId;
//                 const aliceSnapshot                            = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: alice.pkh});
//                 const eveSnapshot                              = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: eve.pkh});
//                 const bobSnapshot                              = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: bob.pkh});
//                 const mallorySnapshot                          = await governanceStorage.snapshotLedger.get({ 0: currentCycle, 1: mallory.pkh});
//                 const governanceAction                         = await governanceSatelliteStorage.governanceSatelliteActionLedger.get(actionId);
//                 const initiatorsActions                        = await governanceSatelliteStorage.actionsInitiators.get(bob.pkh);

//                 const governanceSatelliteApprovalPercentage    = governanceSatelliteStorage.config.governanceSatelliteApprovalPercentage;
//                 const governanceSatellitePercentageDecimals    = 4;
//                 const totalStakedMvkSupply                     = bobStakeAmount + aliceStakeAmount + eveStakeAmount + malloryStakeAmount;
//                 const stakedMvkRequiredForApproval             = (totalStakedMvkSupply * governanceSatelliteApprovalPercentage) / (10 ** governanceSatellitePercentageDecimals);


//                 // check details of governance satellite action
//                 assert.equal(governanceAction.initiator,                                 bob.pkh);
//                 assert.equal(governanceAction.governanceType,                            "BAN");
//                 assert.equal(governanceAction.status,                                    true);
//                 assert.equal(governanceAction.executed,                                  false);
//                 assert.equal(governanceAction.governancePurpose,                         purpose);
//                 assert.equal(governanceAction.yayVoteStakedMvkTotal.toNumber(),                   0);
//                 assert.equal(governanceAction.nayVoteStakedMvkTotal.toNumber(),                   0);
//                 assert.equal(governanceAction.passVoteStakedMvkTotal.toNumber(),                  0);
//                 assert.equal(governanceAction.stakedMvkPercentageForApproval.toNumber(), 6700);
//                 assert.equal(governanceAction.stakedMvkRequiredForApproval.toNumber(),   stakedMvkRequiredForApproval);
//                 var actionsInitiatorCheck = false
//                 for(const i in initiatorsActions){
//                     if(initiatorsActions[i].toNumber() == actionId.toNumber()){
//                         actionsInitiatorCheck   = true;
//                     }
//                 }
//                 assert.equal(actionsInitiatorCheck, true)
                
//                 // check details of governance satellite action snapshot ledger
//                 assert.equal(bobSnapshot.totalDelegatedAmount.toNumber(),        0);
//                 assert.equal(bobSnapshot.totalStakedMvkBalance.toNumber(),       bobStakeAmount);
//                 assert.equal(bobSnapshot.totalVotingPower.toNumber(),            bobStakeAmount);

//                 assert.equal(aliceSnapshot.totalDelegatedAmount.toNumber(),      0);
//                 assert.equal(aliceSnapshot.totalStakedMvkBalance.toNumber(),     aliceStakeAmount);
//                 assert.equal(aliceSnapshot.totalVotingPower.toNumber(),          aliceStakeAmount);

//                 assert.equal(eveSnapshot.totalDelegatedAmount.toNumber(),        0);
//                 assert.equal(eveSnapshot.totalStakedMvkBalance.toNumber(),       eveStakeAmount);
//                 assert.equal(eveSnapshot.totalVotingPower.toNumber(),            eveStakeAmount);

//                 assert.equal(mallorySnapshot.totalDelegatedAmount.toNumber(),    0);
//                 assert.equal(mallorySnapshot.totalStakedMvkBalance.toNumber(),   malloryStakeAmount);
//                 assert.equal(mallorySnapshot.totalVotingPower.toNumber(),        malloryStakeAmount);

//                 // 3 satellites vote yay, one satellite votes nay
//                 await signerFactory(eve.sk);
//                 await chai.expect(governanceSatelliteInstance.methods.dropAction(actionId)).to.be.rejected;

//             } catch(e){
//                 console.dir(e, {depth: 5})
//             } 
        
//         });  // end %dropAction tests
//     })
    
//     describe("permissions tests", async () => {

//         it('Non-satellite should not be able to create any governance action', async () => {
//             try{        

//                 // some init constants
//                 governanceSatelliteStorage     = await governanceSatelliteInstance.storage();
                
//                 // get aggregator address from pair key
//                 const pairOne = "USD";
//                 const pairTwo = "BTC";
//                 const usdBtcKey = {
//                     0 : pairOne,
//                     1 : pairTwo
//                 }
//                 const usdBtcAggregatorAddress  = aggregatorFactoryStorage.trackedAggregators.get(usdBtcKey);
                
//                 // dummy governance satellite action params
//                 const actionId                 = governanceSatelliteStorage.governanceSatelliteCounter;
//                 var oracleAddress              = trudy.pkh;
//                 const aggregatorAddress        = usdBtcAggregatorAddress;
//                 const newStatus                = "INACTIVE"
//                 const purpose                  = "Test Purpose";            

//                 // init non-satellite user
//                 await signerFactory(trudy.sk);

//                 // fail to create governance action to suspend Satellite
//                 const failSuspendSatelliteOperation = governanceSatelliteInstance.methods.suspendSatellite(
//                     bob.pkh,
//                     purpose
//                 ).send();
//                 await chai.expect(failSuspendSatelliteOperation).to.be.eventually.rejected;


//                 // fail to create governance action to restore Satellite
//                 const failRestoreSatelliteOperation = governanceSatelliteInstance.methods.restoreSatellite(
//                     bob.pkh,
//                     purpose
//                 ).send();
//                 await chai.expect(failRestoreSatelliteOperation).to.be.eventually.rejected;


//                 // fail to create governance action to ban Satellite
//                 const failBanSatelliteOperation = governanceSatelliteInstance.methods.banSatellite(
//                     bob.pkh,
//                     purpose
//                 ).send();
//                 await chai.expect(failBanSatelliteOperation).to.be.eventually.rejected;


//                 // fail to create governance action to add oracle to aggregator
//                 const failAddOracleToAggregatorOperation = governanceSatelliteInstance.methods.addOracleToAggregator(
//                         oracleAddress,
//                         aggregatorAddress,
//                         purpose
//                     ).send();
//                 await chai.expect(failAddOracleToAggregatorOperation).to.be.eventually.rejected;


//                 // fail to create governance action to remove oracle in aggregator
//                 const failRemoveOracleInAggregatorOperation = governanceSatelliteInstance.methods.removeOracleInAggregator(
//                     oracleAddress,
//                     aggregatorAddress,
//                     purpose
//                 ).send();
//                 await chai.expect(failRemoveOracleInAggregatorOperation).to.be.eventually.rejected;


//                 // fail to create governance action to remove all satellite oracles
//                 const failRemoveAllSatelliteOraclesOperation = governanceSatelliteInstance.methods.removeAllSatelliteOracles(
//                     bob.pkh,
//                     purpose
//                 ).send();
//                 await chai.expect(failRemoveAllSatelliteOraclesOperation).to.be.eventually.rejected;


//                 // fail to create governance action to set aggregator maintainer
//                 const failSetAggregatorMaintainerOperation = governanceSatelliteInstance.methods.updateAggregatorStatus(
//                     aggregatorAddress,
//                     bob.pkh,
//                     purpose
//                 ).send();
//                 await chai.expect(failSetAggregatorMaintainerOperation).to.be.eventually.rejected;

                
//                 // fail to create governance action to update aggregator status
//                 const failUpdateAggregatorStatusOperation = governanceSatelliteInstance.methods.updateAggregatorStatus(
//                     aggregatorAddress,
//                     newStatus,
//                     purpose
//                 ).send();
//                 await chai.expect(failUpdateAggregatorStatusOperation).to.be.eventually.rejected;
                

//                 // fail to create governance action to register aggregator
//                 const failRegisterAggregatorOperation = governanceSatelliteInstance.methods.registerAggregator(
//                     "BTC",
//                     "USD",
//                     aggregatorAddress
//                 ).send();
//                 await chai.expect(failRegisterAggregatorOperation).to.be.eventually.rejected;


//                 // Satellite Bob creates a governance action to add oracle to aggregator (with a real satellite)
//                 await signerFactory(bob.sk);
//                 oracleAddress   = alice.pkh;
//                 const governanceSatelliteOperation = await governanceSatelliteInstance.methods.addOracleToAggregator(
//                         oracleAddress,
//                         aggregatorAddress,
//                         purpose
//                     ).send();
//                 await governanceSatelliteOperation.confirmation();


//                 await signerFactory(trudy.sk);
//                 // fail to create governance action to drop governance action
//                 const failDropActionOperation = governanceSatelliteInstance.methods.dropAction(
//                     actionId
//                 ).send();
//                 await chai.expect(failDropActionOperation).to.be.eventually.rejected;


//                 // fail to create governance action to vote for governance action
//                 const failVoteYayForActionOperation = governanceSatelliteInstance.methods.voteForAction(
//                     actionId,
//                     "yay"
//                 ).send();
//                 await chai.expect(failVoteYayForActionOperation).to.be.eventually.rejected;


//                 // fail to create governance action to vote for governance action
//                 const failVoteNayForActionOperation = governanceSatelliteInstance.methods.voteForAction(
//                     actionId,
//                     "nay"
//                 ).send();
//                 await chai.expect(failVoteNayForActionOperation).to.be.eventually.rejected;


//                 // fail to create governance action to vote for governance action
//                 const failVotePassForActionOperation = governanceSatelliteInstance.methods.voteForAction(
//                     actionId,
//                     "pass"
//                 ).send();
//                 await chai.expect(failVotePassForActionOperation).to.be.eventually.rejected;

            
//             } catch(e){
//                 console.dir(e, {depth: 5})
//             } 
//         });
        
//     });  // end permissions tests
    

// });