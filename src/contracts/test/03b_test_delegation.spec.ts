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
// import { bob, alice, eve, mallory, oscar, trudy } from "../scripts/sandbox/accounts";

// import doormanAddress from '../deployments/doormanAddress.json';
// import delegationAddress from '../deployments/delegationAddress.json';
// import mvkTokenAddress from '../deployments/mvkTokenAddress.json';
// import governanceAddress from '../deployments/governanceAddress.json';
// import governanceProxyAddress from '../deployments/governanceProxyAddress.json';
// import treasuryAddress from '../deployments/treasuryAddress.json';
// import { MichelsonMap } from "@taquito/taquito";

// describe("Delegation tests", async () => {
//     var utils: Utils;
//     var tezos;

//     let doormanInstance;
//     let delegationInstance;
//     let mvkTokenInstance;
//     let governanceInstance;
//     let governanceProxyInstance;

//     let doormanStorage;
//     let delegationStorage;
//     let mvkTokenStorage;
//     let governanceStorage;
    
//     const signerFactory = async (pk) => {
//         await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
//         return utils.tezos;
//     };

//     const almostEqual = (actual, expected, delta) => {
//         let greaterLimit  = expected + expected * delta
//         console.log("GREATER: ", greaterLimit) 
//         let lowerLimit    = expected - expected * delta
//         console.log("LOWER: ", lowerLimit)
//         console.log("STUDIED: ", actual)
//         return actual <= greaterLimit && actual >= lowerLimit
//     }

//     before("setup", async () => {

//         utils = new Utils();
//         await utils.init(bob.sk);
        
//         doormanInstance         = await utils.tezos.contract.at(doormanAddress.address);
//         delegationInstance      = await utils.tezos.contract.at(delegationAddress.address);
//         mvkTokenInstance        = await utils.tezos.contract.at(mvkTokenAddress.address);
//         governanceInstance      = await utils.tezos.contract.at(governanceAddress.address);
//         governanceProxyInstance = await utils.tezos.contract.at(governanceProxyAddress.address);
            
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

//     describe("%distributeRewards", async () => {
//         before("Set admin to whitelist and init satellite and delegators", async () => {
//             try{
//                 // Set Whitelist
//                 await signerFactory(bob.sk)
//                 const updateWhitelistOperation  = await delegationInstance.methods.updateWhitelistContracts("bob", bob.pkh).send();
//                 await updateWhitelistOperation.confirmation();

//                 // Init values
//                 const bobSatelliteName                  = "New Satellite (Bob)";
//                 const bobSatelliteDescription           = "New Satellite Description (Bob)";
//                 const bobSatelliteImage                 = "https://placeholder.com/300";
//                 const bobSatelliteWebsite               = "https://placeholder.com/300";
//                 const bobSatelliteFee                   = "1000"; // 10% fee
//                 const mallorySatelliteName              = "New Satellite (Mallory)";
//                 const mallorySatelliteDescription       = "New Satellite Description (Mallory)";
//                 const mallorySatelliteImage             = "https://placeholder.com/300";
//                 const mallorySatelliteWebsite           = "https://placeholder.com/300";
//                 const mallorySatelliteFee               = "2000"; // 20% fee

//                 // Register Bob
//                 var updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//                 {
//                     add_operator: {
//                         owner    : bob.pkh,
//                         operator : doormanAddress.address,
//                         token_id : 0,
//                     },
//                 }])
//                 .send()
//                 await updateOperatorsOperation.confirmation();

//                 var stakeOperation = await doormanInstance.methods.stake(MVK(10)).send();
//                 await stakeOperation.confirmation();

//                 var registerAsSatelliteOperation = await delegationInstance.methods
//                     .registerAsSatellite(
//                         bobSatelliteName, 
//                         bobSatelliteDescription, 
//                         bobSatelliteImage,
//                         bobSatelliteWebsite,
//                         bobSatelliteFee
//                     ).send();
//                 await registerAsSatelliteOperation.confirmation();

//                 // Register Mallory
//                 await signerFactory(mallory.sk);
//                 var updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//                 {
//                     add_operator: {
//                         owner    : mallory.pkh,
//                         operator : doormanAddress.address,
//                         token_id : 0,
//                     },
//                 }])
//                 .send()
//                 await updateOperatorsOperation.confirmation();

//                 var stakeOperation = await doormanInstance.methods.stake(MVK(10)).send();
//                 await stakeOperation.confirmation();

//                 registerAsSatelliteOperation = await delegationInstance.methods
//                     .registerAsSatellite(
//                         mallorySatelliteName, 
//                         mallorySatelliteDescription, 
//                         mallorySatelliteImage, 
//                         mallorySatelliteWebsite,
//                         mallorySatelliteFee
//                     ).send();
//                 await registerAsSatelliteOperation.confirmation();

//                 // Delegate Alice
//                 await signerFactory(alice.sk);
//                 updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//                 {
//                     add_operator: {
//                         owner    : alice.pkh,
//                         operator : doormanAddress.address,
//                         token_id : 0,
//                     },
//                 }])
//                 .send()
//                 await updateOperatorsOperation.confirmation();

//                 var stakeOperation = await doormanInstance.methods.stake(MVK(10)).send();
//                 await stakeOperation.confirmation();

//                 var delegationOperation   = await delegationInstance.methods.delegateToSatellite(alice.pkh, bob.pkh).send();
//                 await delegationOperation.confirmation();

//                 // Delegate Eve
//                 await signerFactory(eve.sk);
//                 updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//                 {
//                     add_operator: {
//                         owner    : eve.pkh,
//                         operator : doormanAddress.address,
//                         token_id : 0,
//                     },
//                 }])
//                 .send()
//                 await updateOperatorsOperation.confirmation();

//                 stakeOperation = await doormanInstance.methods.stake(MVK(20)).send();
//                 await stakeOperation.confirmation();

//                 delegationOperation   = await delegationInstance.methods.delegateToSatellite(eve.pkh, bob.pkh).send();
//                 await delegationOperation.confirmation();

//                 // Delegate Oscar
//                 await signerFactory(oscar.sk);
//                 updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//                 {
//                     add_operator: {
//                         owner    : oscar.pkh,
//                         operator : doormanAddress.address,
//                         token_id : 0,
//                     },
//                 }])
//                 .send()
//                 await updateOperatorsOperation.confirmation();

//                 stakeOperation = await doormanInstance.methods.stake(MVK(30)).send();
//                 await stakeOperation.confirmation();

//                 delegationOperation   = await delegationInstance.methods.delegateToSatellite(oscar.pkh, mallory.pkh).send();
//                 await delegationOperation.confirmation();

//                 // Delegate Trudy
//                 await signerFactory(trudy.sk);
//                 updateOperatorsOperation = await mvkTokenInstance.methods.update_operators([
//                 {
//                     add_operator: {
//                         owner    : trudy.pkh,
//                         operator : doormanAddress.address,
//                         token_id : 0,
//                     },
//                 }])
//                 .send()
//                 await updateOperatorsOperation.confirmation();

//                 stakeOperation = await doormanInstance.methods.stake(MVK(20)).send();
//                 await stakeOperation.confirmation();

//                 delegationOperation   = await delegationInstance.methods.delegateToSatellite(trudy.pkh, mallory.pkh).send();
//                 await delegationOperation.confirmation();

//                 await signerFactory(bob.sk)

//                 // Set delegation admin in order for the packed data to work
//                 const setDoormanAdmin        = await doormanInstance.methods.setAdmin(governanceProxyAddress.address).send();
//                 await setDoormanAdmin.confirmation();
//             } catch (e){
//                 console.dir(e, {depth: 5});
//             }
//         });
//         beforeEach("Set signer to admin", async () => {
//             await signerFactory(bob.sk)
//         });
        
//         it('Reward distribution tests #1', async () => {
//             try{
//                 // Initial Values
//                 delegationStorage = await delegationInstance.storage();

//                 // Distribute Operation
//                 const distributeOperation = await delegationInstance.methods.distributeReward([bob.pkh],MVK(50)).send();
//                 await distributeOperation.confirmation();
//                 delegationStorage = await delegationInstance.storage();
//                 doormanStorage  = await doormanInstance.storage();
//                 var satelliteRecord = await delegationStorage.satelliteRewardsLedger.get(bob.pkh)
//                 var satelliteStake  = await doormanStorage.userStakeBalanceLedger.get(bob.pkh)
//                 console.log("PRE-CLAIM SATELLITE: ", satelliteRecord.unpaid.toNumber(), satelliteStake.balance.toNumber())

//                 // Claim operations
//                 var claimOperation = await doormanInstance.methods.compound(bob.pkh).send();
//                 await claimOperation.confirmation()
//                 delegationStorage = await delegationInstance.storage();
//                 doormanStorage  = await doormanInstance.storage();
//                 var satelliteRecord = await delegationStorage.satelliteRewardsLedger.get(bob.pkh)
//                 satelliteStake  = await doormanStorage.userStakeBalanceLedger.get(bob.pkh)
//                 console.log("POST-CLAIM SATELLITE: ", satelliteRecord.unpaid.toNumber(), satelliteStake.balance.toNumber())

//                 await signerFactory(alice.sk);
//                 claimOperation = await doormanInstance.methods.compound(alice.pkh).send();
//                 await claimOperation.confirmation()
//                 delegationStorage = await delegationInstance.storage();
//                 doormanStorage  = await doormanInstance.storage();
//                 var delegateRecord = await delegationStorage.satelliteRewardsLedger.get(alice.pkh)
//                 var delegateStake  = await doormanStorage.userStakeBalanceLedger.get(alice.pkh)
//                 console.log("POST-CLAIM ALICE: ", delegateRecord.unpaid.toNumber(), " | ", delegateStake.balance.toNumber())

//                 await signerFactory(eve.sk);
//                 claimOperation = await doormanInstance.methods.compound(eve.pkh).send();
//                 await claimOperation.confirmation()
//                 delegationStorage = await delegationInstance.storage();
//                 doormanStorage  = await doormanInstance.storage();
//                 var delegateRecord = await delegationStorage.satelliteRewardsLedger.get(eve.pkh)
//                 delegateStake  = await doormanStorage.userStakeBalanceLedger.get(eve.pkh)
//                 console.log("POST-CLAIM EVE: ", delegateRecord.unpaid.toNumber(), " | ", delegateStake.balance.toNumber())
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });

//         it('Reward distribution tests #2', async () => {
//             try{
//                 console.log("configuration:\n- 2 satellites (Bob|Mallory)\n- 2 delegates on Bob (Alice|Eve)\n- Operations: \n   DistributeReward(100MVK)\n   Unregister(Bob)\n   Undelegate(Alice)\n   Claim(Bob)\n   Delegate(Alice->Mallory)\n   Claim(Alice)\n   Claim(Eve)");

//                 // Initial Values
//                 delegationStorage           = await delegationInstance.storage();
//                 doormanStorage              = await doormanInstance.storage();
//                 mvkTokenStorage             = await mvkTokenInstance.storage();
//                 const reward                = MVK(100);
//                 const initSatelliteSMVK     = await doormanStorage.userStakeBalanceLedger.get(bob.pkh) 
//                 const initSatelliteRewards  = await delegationStorage.satelliteRewardsLedger.get(bob.pkh)
                
//                 var satelliteTest           = await delegationStorage.satelliteLedger.get(bob.pkh);
//                 var aliceTest               = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
//                 var eveTest                 = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);

//                 const initSatelliteRecord   = await delegationStorage.satelliteLedger.get(bob.pkh);
//                 const initDoormanBalance    = await mvkTokenStorage.ledger.get(doormanAddress.address);
//                 const satelliteVotingPower  = initSatelliteRecord.totalDelegatedAmount.toNumber() + initSatelliteRecord.stakedMvkBalance.toNumber();
//                 const satelliteFee          = initSatelliteRecord.satelliteFee.toNumber();

//                 // Distribute Operation
//                 const distributeOperation       = await delegationInstance.methods.distributeReward([bob.pkh, mallory.pkh],reward).send();
//                 await distributeOperation.confirmation();

//                 // var claimOperation = await doormanInstance.methods.compound().send();
//                 // await claimOperation.confirmation()
//                 delegationStorage               = await delegationInstance.storage();
//                 doormanStorage                  = await doormanInstance.storage();
//                 mvkTokenStorage                 = await mvkTokenInstance.storage();
//                 const satelliteFeeReward        = satelliteFee / 10000 * reward/2
//                 const distributedReward         = reward / 2 - satelliteFeeReward
//                 const accumulatedRewardPerShare = distributedReward / satelliteVotingPower
//                 var unpaidRewards               = initSatelliteRewards.unpaid.toNumber() + satelliteFeeReward
//                 var satelliteRewards            = await delegationStorage.satelliteRewardsLedger.get(bob.pkh)
//                 var satelliteStake              = await doormanStorage.userStakeBalanceLedger.get(bob.pkh)
//                 var doormanBalance              = await mvkTokenStorage.ledger.get(doormanAddress.address);
//                 satelliteTest                   = await delegationStorage.satelliteLedger.get(bob.pkh);
//                 aliceTest                       = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
//                 eveTest                         = await doormanStorage.userStakeBalanceLedger.get(eve.pkh);

//                 // Assertions
//                 assert.equal(satelliteRewards.unpaid.toNumber(), unpaidRewards)
//                 assert.equal(initSatelliteSMVK.balance.toNumber(), satelliteStake.balance.toNumber())
//                 assert.equal(doormanBalance.toNumber(), initDoormanBalance.toNumber() + reward)
//                 console.log("PRE-UNREGISTER SATELLITE: ", satelliteRewards.unpaid.toNumber(), " | ", satelliteStake.balance.toNumber())

//                 // Unregister operation
//                 const unregisterOperation   = await delegationInstance.methods.unregisterAsSatellite(bob.pkh).send();
//                 await unregisterOperation.confirmation();
//                 delegationStorage   = await delegationInstance.storage();
//                 doormanStorage      = await doormanInstance.storage();
//                 satelliteRewards    = await delegationStorage.satelliteRewardsLedger.get(bob.pkh)
//                 satelliteStake      = await doormanStorage.userStakeBalanceLedger.get(bob.pkh)

//                 // New unpaid reward
//                 unpaidRewards       = initSatelliteRewards.unpaid.toNumber() + satelliteFeeReward + initSatelliteSMVK.balance.toNumber() * accumulatedRewardPerShare

//                 // Assertions
//                 assert.equal(satelliteRewards.unpaid.toNumber(), unpaidRewards)
//                 assert.equal(initSatelliteSMVK.balance.toNumber(), satelliteStake.balance.toNumber())
//                 console.log("POST-UNREGISTER SATELLITE: ", satelliteRewards.unpaid.toNumber(), " | ", satelliteStake.balance.toNumber())

//                 // Undelegate operation
//                 await signerFactory(alice.sk);
//                 const initAliceSMVK     = await doormanStorage.userStakeBalanceLedger.get(alice.pkh) 
//                 const initAliceRewards  = await delegationStorage.satelliteRewardsLedger.get(alice.pkh)
//                 const undelegateOperation = await delegationInstance.methods.undelegateFromSatellite(alice.pkh).send();
//                 await undelegateOperation.confirmation()
//                 unpaidRewards   = initAliceRewards.unpaid.toNumber() + initAliceSMVK.balance.toNumber() * accumulatedRewardPerShare
//                 delegationStorage = await delegationInstance.storage();
//                 doormanStorage  = await doormanInstance.storage();
//                 var delegateRewards = await delegationStorage.satelliteRewardsLedger.get(alice.pkh)
//                 var delegateStake  = await doormanStorage.userStakeBalanceLedger.get(alice.pkh)

//                 // Assertions
//                 assert.equal(delegateRewards.unpaid.toNumber(), unpaidRewards);
//                 assert.equal(initAliceSMVK.balance.toNumber(), delegateStake.balance.toNumber())
//                 console.log("POST-REDELEGATE ALICE: ", delegateRewards.unpaid.toNumber(), " | ", delegateStake.balance.toNumber())

//                 // Satellite Claim operation
//                 var paidRewards   = initSatelliteRewards.unpaid.toNumber() + satelliteFeeReward + initSatelliteSMVK.balance.toNumber() * accumulatedRewardPerShare
//                 satelliteRewards = await delegationStorage.satelliteRewardsLedger.get(bob.pkh)
//                 console.log("START: ", satelliteRewards)

//                 var claimOperation = await doormanInstance.methods.compound(bob.pkh).send();
//                 await claimOperation.confirmation()
//                 claimOperation = await doormanInstance.methods.compound(mallory.pkh).send(); // COMPOUND FOR MALLORY TO PREPARE NEXT TEXT
//                 await claimOperation.confirmation()
//                 delegationStorage = await delegationInstance.storage();
//                 doormanStorage  = await doormanInstance.storage();
//                 satelliteRewards = await delegationStorage.satelliteRewardsLedger.get(bob.pkh)
//                 satelliteStake  = await doormanStorage.userStakeBalanceLedger.get(bob.pkh)

//                 console.log("START: ", satelliteRewards)
//                 console.log("POST-CLAIM SATELLITE: ", satelliteRewards.unpaid.toNumber(), " | ", satelliteStake.balance.toNumber())

//                 // Assertions
//                 assert.equal(satelliteRewards.unpaid.toNumber(), 0)
//                 assert.equal(initSatelliteSMVK.balance.toNumber() + paidRewards, satelliteStake.balance.toNumber())
//                 console.log("POST-UNREGISTER SATELLITE: ", satelliteRewards.unpaid.toNumber(), " | ", satelliteStake.balance.toNumber())

//                 // Alice redelegate operation
//                 await signerFactory(alice.sk);
//                 const delegateOperation = await delegationInstance.methods.delegateToSatellite(alice.pkh, mallory.pkh).send();
//                 await delegateOperation.confirmation()
//                 delegationStorage = await delegationInstance.storage();
//                 doormanStorage  = await doormanInstance.storage();
//                 delegateRewards = await delegationStorage.satelliteRewardsLedger.get(alice.pkh)
//                 delegateStake  = await doormanStorage.userStakeBalanceLedger.get(alice.pkh)

//                 // Assertions
//                 assert.equal(delegateRewards.unpaid.toNumber(), unpaidRewards);
//                 assert.equal(initAliceSMVK.balance.toNumber(), delegateStake.balance.toNumber())
//                 console.log("POST-DELEGATE ALICE: ", delegateRewards.unpaid.toNumber(), " | ", delegateStake.balance.toNumber())

//                 // Claims operations
//                 claimOperation = await doormanInstance.methods.compound(alice.pkh).send();
//                 await claimOperation.confirmation()
//                 delegationStorage = await delegationInstance.storage();
//                 doormanStorage  = await doormanInstance.storage();
//                 paidRewards   = initAliceRewards.unpaid.toNumber() + initAliceSMVK.balance.toNumber() * accumulatedRewardPerShare
//                 delegateRewards = await delegationStorage.satelliteRewardsLedger.get(alice.pkh)
//                 delegateStake  = await doormanStorage.userStakeBalanceLedger.get(alice.pkh)
                
//                 // Assertions
//                 assert.equal(delegateRewards.unpaid.toNumber(), 0)
//                 assert.equal(initAliceSMVK.balance.toNumber() + paidRewards, delegateStake.balance.toNumber())
//                 console.log("POST-CLAIM ALICE: ", delegateRewards.unpaid.toNumber(), " | ", delegateStake.balance.toNumber())

//                 await signerFactory(eve.sk);
//                 const initEveSMVK     = await doormanStorage.userStakeBalanceLedger.get(eve.pkh) 
//                 const initEveRewards  = await delegationStorage.satelliteRewardsLedger.get(eve.pkh)
//                 claimOperation = await doormanInstance.methods.compound(eve.pkh).send();
//                 await claimOperation.confirmation()
//                 delegationStorage = await delegationInstance.storage();
//                 doormanStorage  = await doormanInstance.storage();
//                 paidRewards   = initEveRewards.unpaid.toNumber() + initEveSMVK.balance.toNumber() * accumulatedRewardPerShare
//                 delegateRewards = await delegationStorage.satelliteRewardsLedger.get(eve.pkh)
//                 delegateStake  = await doormanStorage.userStakeBalanceLedger.get(eve.pkh)
                
//                 // Assertions
//                 console.log("POST-CLAIM EVE: ", delegateRewards.unpaid.toNumber(), " | ", delegateStake.balance.toNumber())
//                 assert.equal(delegateRewards.unpaid.toNumber(), 0)
//                 assert.equal(initEveSMVK.balance.toNumber() + paidRewards, delegateStake.balance.toNumber())

//                 // Reset -> Re-register as a Satellite
//                 await signerFactory(bob.sk);
//                 const bobSatelliteName                  = "New Satellite (Bob)";
//                 const bobSatelliteDescription           = "New Satellite Description (Bob)";
//                 const bobSatelliteImage                 = "https://placeholder.com/300";
//                 const bobSatelliteWebsite               = "https://placeholder.com/300";
//                 const bobSatelliteFee                   = "1000"; // 10% fee
//                 const registerAsSatelliteOperation = await delegationInstance.methods
//                     .registerAsSatellite(
//                         bobSatelliteName, 
//                         bobSatelliteDescription, 
//                         bobSatelliteImage,
//                         bobSatelliteWebsite, 
//                         bobSatelliteFee
//                     ).send();
//                 await registerAsSatelliteOperation.confirmation();
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });

//         it('End of governance cycle should trigger this entrypoint: Voters should earn the cycle reward while proposer should not earn the success reward if the proposal is not executed', async () => {
//             try{
//                 // Initial Values
//                 delegationStorage           = await delegationInstance.storage();
//                 doormanStorage              = await doormanInstance.storage();
//                 governanceStorage           = await governanceInstance.storage();
//                 mvkTokenStorage             = await mvkTokenInstance.storage();
//                 console.log(governanceStorage.lambdaLedger)
//                 const initDoormanBalance    = await mvkTokenStorage.ledger.get(doormanAddress.address);
//                 const proposalId            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName          = "New Proposal #1";
//                 const proposalDesc          = "Details about new proposal #1";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";
//                 const proposalReward        = governanceStorage.config.cycleVotersReward.toNumber();

//                 // Satellite ledger
//                 const firstSatelliteRecordStart     = await delegationStorage.satelliteRewardsLedger.get(bob.pkh)
//                 const firstSatelliteStakeStart      = await doormanStorage.userStakeBalanceLedger.get(bob.pkh)
//                 const secondSatelliteRecordStart    = await delegationStorage.satelliteRewardsLedger.get(mallory.pkh)
//                 const secondSatelliteStakeStart     = await doormanStorage.userStakeBalanceLedger.get(mallory.pkh)
//                 const firstSatellite                = await delegationStorage.satelliteLedger.get(bob.pkh);
//                 const firstSatelliteFeePct          = firstSatellite.satelliteFee.toNumber();
//                 const firstSatelliteFee             = firstSatelliteFeePct / 10000 * proposalReward/2;
//                 const firstSatelliteVotingPower     = firstSatellite.totalDelegatedAmount.toNumber() + firstSatellite.stakedMvkBalance.toNumber();
//                 const firstSatelliteDistributed     = proposalReward / 2 - firstSatelliteFee
//                 const firstSatelliteAccu            = firstSatelliteDistributed / firstSatelliteVotingPower
//                 const secondSatellite               = await delegationStorage.satelliteLedger.get(mallory.pkh);
//                 const secondSatelliteFeePct         = secondSatellite.satelliteFee.toNumber();
//                 const secondSatelliteFee            = secondSatelliteFeePct / 10000 * proposalReward/2;
//                 const secondSatelliteVotingPower    = secondSatellite.totalDelegatedAmount.toNumber() + secondSatellite.stakedMvkBalance.toNumber();
//                 const secondSatelliteDistributed    = proposalReward / 2 - secondSatelliteFee
//                 const secondSatelliteAccu           = secondSatelliteDistributed / secondSatelliteVotingPower;
//                 console.log("PRE-OPERATION SATELLITE BOB: ", firstSatelliteRecordStart.unpaid.toNumber(), " | ", firstSatelliteStakeStart.balance.toNumber())
//                 console.log("PRE-OPERATION SATELLITE MALLORY: ", secondSatelliteRecordStart.unpaid.toNumber(), " | ", secondSatelliteStakeStart.balance.toNumber())

//                 // Prepare proposal metadata
//                 console.log(governanceProxyInstance.methods)
//                 const configSuccessRewardParam = governanceProxyInstance.methods.dataPackingHelper(
//                     'updateContractGeneralMap', doormanAddress.address, 'bob', bob.pkh
//                 ).toTransferParams();
//                 const configSuccessRewardParamValue = configSuccessRewardParam.parameter.value;
//                 const callGovernanceLambdaEntrypointType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
    
//                 const updateConfigSuccessRewardPacked = await utils.tezos.rpc.packData({
//                     data: configSuccessRewardParamValue,
//                     type: callGovernanceLambdaEntrypointType
//                 }).catch(e => console.error('error:', e));
    
//                 var packedUpdateConfigSuccessRewardParam;
//                 if (updateConfigSuccessRewardPacked) {
//                     packedUpdateConfigSuccessRewardParam = updateConfigSuccessRewardPacked.packed
//                     console.log('packed success reward param: ' + packedUpdateConfigSuccessRewardParam);
//                 } else {
//                   throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "Metadata#1",
//                         data: packedUpdateConfigSuccessRewardParam
//                     }
//                 ]

//                 // Initial governance storage operations
//                 var updateGovernanceConfig  = await governanceInstance.methods.updateConfig(0, "configBlocksPerProposalRound").send();
//                 await updateGovernanceConfig.confirmation();
//                 updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configBlocksPerVotingRound").send();
//                 await updateGovernanceConfig.confirmation();
//                 updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configBlocksPerTimelockRound").send();
//                 await updateGovernanceConfig.confirmation();
//                 updateGovernanceConfig      = await governanceInstance.methods.updateConfig(1, "configMinProposalRoundVotePct").send();
//                 await updateGovernanceConfig.confirmation();
//                 updateGovernanceConfig      = await governanceInstance.methods.updateConfig(1, "configMinProposalRoundVotesReq").send();
//                 await updateGovernanceConfig.confirmation();
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
//                 await proposeOperation.confirmation();
//                 const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
//                 await lockOperation.confirmation();
//                 var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//                 await voteOperation.confirmation();
//                 await signerFactory(mallory.sk);
//                 voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//                 await voteOperation.confirmation();
//                 await signerFactory(bob.sk);
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 // Votes operation -> both satellites vote
//                 var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("nay").send();
//                 await votingRoundVoteOperation.confirmation();
//                 await signerFactory(mallory.sk);
//                 votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("pass").send();
//                 await votingRoundVoteOperation.confirmation();
//                 await signerFactory(bob.sk);

//                 // Restart proposal round
//                 nextRoundOperation              = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation              = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 governanceStorage               = await governanceInstance.storage();
//                 console.log("ROUND: ", governanceStorage.currentCycleInfo.round)

//                 // Post governance cycle reward distribution
//                 var governanceClaimOperation    = await governanceInstance.methods.distributeProposalRewards(bob.pkh, [proposalId]).send();
//                 await governanceClaimOperation.confirmation();
//                 governanceClaimOperation        = await governanceInstance.methods.distributeProposalRewards(mallory.pkh, [proposalId]).send();
//                 await governanceClaimOperation.confirmation();

//                 // Final values
//                 delegationStorage                       = await delegationInstance.storage();
//                 doormanStorage                          = await doormanInstance.storage();
//                 mvkTokenStorage                         = await mvkTokenInstance.storage();
//                 const finalDoormanBalance               = await mvkTokenStorage.ledger.get(doormanAddress.address);
//                 const firstSatelliteRecordNoClaim       = await delegationStorage.satelliteRewardsLedger.get(bob.pkh)
//                 const firstSatelliteStakeNoClaim        = await doormanStorage.userStakeBalanceLedger.get(bob.pkh)
//                 const secondSatelliteRecordNoClaim      = await delegationStorage.satelliteRewardsLedger.get(mallory.pkh)
//                 const secondSatelliteStakeNoClaim       = await doormanStorage.userStakeBalanceLedger.get(mallory.pkh)

//                 // Assertions
//                 assert.equal(finalDoormanBalance.toNumber(), initDoormanBalance.toNumber() + proposalReward)
//                 console.log("POST-OPERATION SATELLITE BOB: ", firstSatelliteRecordNoClaim.unpaid.toNumber(), " | ", firstSatelliteStakeNoClaim.balance.toNumber())
//                 console.log("POST-OPERATION SATELLITE MALLORY: ", secondSatelliteRecordNoClaim.unpaid.toNumber(), " | ", secondSatelliteStakeNoClaim.balance.toNumber())

//                 // Claim operations
//                 await signerFactory(bob.sk)
//                 var claimOperation              = await doormanInstance.methods.compound(bob.pkh).send();
//                 await claimOperation.confirmation();
//                 await signerFactory(mallory.sk)
//                 claimOperation                  = await doormanInstance.methods.compound(mallory.pkh).send();
//                 await claimOperation.confirmation();

//                 // Final values
//                 delegationStorage                   = await delegationInstance.storage();
//                 doormanStorage                      = await doormanInstance.storage();
//                 const firstSatelliteReward          = firstSatelliteAccu * firstSatelliteStakeStart.balance.toNumber() + firstSatelliteFee + firstSatelliteRecordStart.unpaid.toNumber()
//                 const secondSatelliteReward         = secondSatelliteAccu * secondSatelliteStakeStart.balance.toNumber() + secondSatelliteFee + secondSatelliteRecordStart.unpaid.toNumber();
//                 const firstSatelliteRecordEnd       = await delegationStorage.satelliteRewardsLedger.get(bob.pkh)
//                 const firstSatelliteStakeEnd        = await doormanStorage.userStakeBalanceLedger.get(bob.pkh)
//                 const secondSatelliteRecordEnd      = await delegationStorage.satelliteRewardsLedger.get(mallory.pkh)
//                 const secondSatelliteStakeEnd       = await doormanStorage.userStakeBalanceLedger.get(mallory.pkh)

//                 // Assertions
//                 assert.equal(firstSatelliteRecordEnd.unpaid.toNumber(), 0)
//                 assert.equal(secondSatelliteRecordEnd.unpaid.toNumber(), 0)
//                 assert.equal(almostEqual(firstSatelliteStakeEnd.balance.toNumber(),firstSatelliteStakeStart.balance.toNumber() + firstSatelliteReward, 0.01), true)
//                 assert.equal(almostEqual(secondSatelliteStakeEnd.balance.toNumber(),secondSatelliteStakeStart.balance.toNumber() + secondSatelliteReward, 0.01), true)
//                 console.log("POST-CLAIM SATELLITE BOB: ", firstSatelliteRecordEnd.unpaid.toNumber(), " | ", firstSatelliteStakeEnd.balance.toNumber())
//                 console.log("POST-CLAIM SATELLITE MALLORY: ", secondSatelliteRecordEnd.unpaid.toNumber(), " | ", secondSatelliteStakeEnd.balance.toNumber()) 
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });


//         it('End of governance cycle should trigger this entrypoint: Voters should earn the cycle reward while proposer should earn the success reward if the proposal is executed', async () => {
//             try{
//                 // Initial Values
//                 delegationStorage           = await delegationInstance.storage();
//                 doormanStorage              = await doormanInstance.storage();
//                 governanceStorage           = await governanceInstance.storage();
//                 mvkTokenStorage             = await mvkTokenInstance.storage();
//                 const initDoormanBalance    = await mvkTokenStorage.ledger.get(doormanAddress.address);
//                 const proposalId            = governanceStorage.nextProposalId.toNumber();
//                 const proposalName          = "New Proposal #1";
//                 const proposalDesc          = "Details about new proposal #1";
//                 const proposalIpfs          = "ipfs://QM123456789";
//                 const proposalSourceCode    = "Proposal Source Code";
//                 const proposalReward        = governanceStorage.config.cycleVotersReward.toNumber();
//                 const proposerReward        = governanceStorage.config.successReward.toNumber();

//                 // Satellite ledger
//                 const firstSatelliteRecordStart     = await delegationStorage.satelliteRewardsLedger.get(bob.pkh)
//                 const firstSatelliteStakeStart      = await doormanStorage.userStakeBalanceLedger.get(bob.pkh)
//                 const secondSatelliteRecordStart    = await delegationStorage.satelliteRewardsLedger.get(mallory.pkh)
//                 const secondSatelliteStakeStart     = await doormanStorage.userStakeBalanceLedger.get(mallory.pkh)
//                 const firstSatellite                = await delegationStorage.satelliteLedger.get(bob.pkh);
//                 const firstSatelliteFeePct          = firstSatellite.satelliteFee.toNumber();
//                 const firstSatelliteFee             = firstSatelliteFeePct / 10000 * proposalReward/2;
//                 const firstSatelliteVotingPower     = firstSatellite.totalDelegatedAmount.toNumber() + firstSatellite.stakedMvkBalance.toNumber();
//                 const firstSatelliteDistributed     = proposalReward / 2 - firstSatelliteFee
//                 const firstSatelliteAccu            = firstSatelliteDistributed / firstSatelliteVotingPower
//                 const secondSatellite               = await delegationStorage.satelliteLedger.get(mallory.pkh);
//                 const secondSatelliteFeePct         = secondSatellite.satelliteFee.toNumber();
//                 const secondSatelliteFee            = secondSatelliteFeePct / 10000 * proposalReward/2;
//                 const secondSatelliteVotingPower    = secondSatellite.totalDelegatedAmount.toNumber() + secondSatellite.stakedMvkBalance.toNumber();
//                 const secondSatelliteDistributed    = proposalReward / 2 - secondSatelliteFee
//                 const secondSatelliteAccu           = secondSatelliteDistributed / secondSatelliteVotingPower;
//                 console.log("PRE-OPERATION SATELLITE BOB: ", firstSatelliteRecordStart.unpaid.toNumber(), " | ", firstSatelliteStakeStart.balance.toNumber())
//                 console.log("PRE-OPERATION SATELLITE MALLORY: ", secondSatelliteRecordStart.unpaid.toNumber(), " | ", secondSatelliteStakeStart.balance.toNumber())

//                 // Prepare proposal metadata
//                 const configSuccessRewardParam = governanceProxyInstance.methods.dataPackingHelper(
//                     'updateContractGeneralMap', doormanAddress.address, 'bob', bob.pkh
//                 ).toTransferParams();
//                 const configSuccessRewardParamValue = configSuccessRewardParam.parameter.value;
//                 const callGovernanceLambdaEntrypointType = await governanceProxyInstance.entrypoints.entrypoints.dataPackingHelper;
    
//                 const updateConfigSuccessRewardPacked = await utils.tezos.rpc.packData({
//                     data: configSuccessRewardParamValue,
//                     type: callGovernanceLambdaEntrypointType
//                 }).catch(e => console.error('error:', e));
    
//                 var packedUpdateConfigSuccessRewardParam;
//                 if (updateConfigSuccessRewardPacked) {
//                     packedUpdateConfigSuccessRewardParam = updateConfigSuccessRewardPacked.packed
//                     console.log('packed success reward param: ' + packedUpdateConfigSuccessRewardParam);
//                 } else {
//                   throw `packing failed`
//                 };

//                 const proposalMetadata      = [
//                     {
//                         title: "Metadata#1",
//                         data: packedUpdateConfigSuccessRewardParam
//                     }
//                 ]

//                 // Initial governance storage operations
//                 var updateGovernanceConfig  = await governanceInstance.methods.updateConfig(0, "configBlocksPerProposalRound").send();
//                 await updateGovernanceConfig.confirmation();
//                 updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configBlocksPerVotingRound").send();
//                 await updateGovernanceConfig.confirmation();
//                 updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configBlocksPerTimelockRound").send();
//                 await updateGovernanceConfig.confirmation();
//                 updateGovernanceConfig      = await governanceInstance.methods.updateConfig(1, "configMinProposalRoundVotePct").send();
//                 await updateGovernanceConfig.confirmation();
//                 updateGovernanceConfig      = await governanceInstance.methods.updateConfig(1, "configMinProposalRoundVotesReq").send();
//                 await updateGovernanceConfig.confirmation();
//                 var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalMetadata).send({amount: 1});
//                 await proposeOperation.confirmation();
//                 const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
//                 await lockOperation.confirmation();
//                 var voteOperation           = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//                 await voteOperation.confirmation();
//                 await signerFactory(mallory.sk);
//                 voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
//                 await voteOperation.confirmation();
//                 await signerFactory(bob.sk);
//                 nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
//                 await nextRoundOperation.confirmation();

//                 // Votes operation -> both satellites vote
//                 var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
//                 await votingRoundVoteOperation.confirmation();
//                 await signerFactory(mallory.sk);
//                 votingRoundVoteOperation        = await governanceInstance.methods.votingRoundVote("yay").send();
//                 await votingRoundVoteOperation.confirmation();
//                 await signerFactory(bob.sk);

//                 // Restart proposal round
//                 nextRoundOperation              = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 nextRoundOperation              = await governanceInstance.methods.startNextRound(true).send();
//                 await nextRoundOperation.confirmation();
//                 governanceStorage               = await governanceInstance.storage();
//                 console.log("ROUND: ", governanceStorage.currentCycleInfo.round)

//                 // Post governance cycle reward distribution
//                 var governanceClaimOperation    = await governanceInstance.methods.distributeProposalRewards(bob.pkh, [proposalId]).send();
//                 await governanceClaimOperation.confirmation();
//                 governanceClaimOperation        = await governanceInstance.methods.distributeProposalRewards(mallory.pkh, [proposalId]).send();
//                 await governanceClaimOperation.confirmation();

//                 // Final values
//                 delegationStorage                       = await delegationInstance.storage();
//                 doormanStorage                          = await doormanInstance.storage();
//                 mvkTokenStorage                         = await mvkTokenInstance.storage();
//                 const finalDoormanBalance               = await mvkTokenStorage.ledger.get(doormanAddress.address);
//                 const firstSatelliteRecordNoClaim       = await delegationStorage.satelliteRewardsLedger.get(bob.pkh)
//                 const firstSatelliteStakeNoClaim        = await doormanStorage.userStakeBalanceLedger.get(bob.pkh)
//                 const secondSatelliteRecordNoClaim      = await delegationStorage.satelliteRewardsLedger.get(mallory.pkh)
//                 const secondSatelliteStakeNoClaim       = await doormanStorage.userStakeBalanceLedger.get(mallory.pkh)

//                 // Assertions
//                 assert.equal(finalDoormanBalance.toNumber(), initDoormanBalance.toNumber() + proposalReward + proposerReward)
//                 console.log("POST-OPERATION SATELLITE BOB: ", firstSatelliteRecordNoClaim.unpaid.toNumber(), " | ", firstSatelliteStakeNoClaim.balance.toNumber())
//                 console.log("POST-OPERATION SATELLITE MALLORY: ", secondSatelliteRecordNoClaim.unpaid.toNumber(), " | ", secondSatelliteStakeNoClaim.balance.toNumber())

//                 // Claim operations
//                 var claimOperation  = await doormanInstance.methods.compound(bob.pkh).send();
//                 await claimOperation.confirmation();
//                 claimOperation  = await doormanInstance.methods.compound(mallory.pkh).send();
//                 await claimOperation.confirmation();

//                 // Final values
//                 delegationStorage                   = await delegationInstance.storage();
//                 doormanStorage                      = await doormanInstance.storage();
//                 const firstSatelliteReward          = firstSatelliteAccu * firstSatelliteStakeStart.balance.toNumber() + firstSatelliteFee + firstSatelliteRecordStart.unpaid.toNumber() + proposerReward;
//                 const secondSatelliteReward         = secondSatelliteAccu * secondSatelliteStakeStart.balance.toNumber() + secondSatelliteFee + secondSatelliteRecordStart.unpaid.toNumber();
//                 const firstSatelliteRecordEnd       = await delegationStorage.satelliteRewardsLedger.get(bob.pkh)
//                 const firstSatelliteStakeEnd        = await doormanStorage.userStakeBalanceLedger.get(bob.pkh)
//                 const secondSatelliteRecordEnd      = await delegationStorage.satelliteRewardsLedger.get(mallory.pkh)
//                 const secondSatelliteStakeEnd       = await doormanStorage.userStakeBalanceLedger.get(mallory.pkh)

//                 // Assertions
//                 assert.equal(firstSatelliteRecordEnd.unpaid.toNumber(), 0)
//                 assert.equal(secondSatelliteRecordEnd.unpaid.toNumber(), 0)
//                 assert.equal(almostEqual(firstSatelliteStakeEnd.balance.toNumber(),firstSatelliteStakeStart.balance.toNumber() + firstSatelliteReward, 0.01), true)
//                 assert.equal(almostEqual(secondSatelliteStakeEnd.balance.toNumber(),secondSatelliteStakeStart.balance.toNumber() + secondSatelliteReward, 0.01), true)
//                 console.log("POST-CLAIM SATELLITE BOB: ", firstSatelliteRecordEnd.unpaid.toNumber(), " | ", firstSatelliteStakeEnd.balance.toNumber())
//                 console.log("POST-CLAIM SATELLITE MALLORY: ", secondSatelliteRecordEnd.unpaid.toNumber(), " | ", secondSatelliteStakeEnd.balance.toNumber()) 
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });

//         it('Non-whitelist contract should not be able to call this entrypoint', async () => {
//             try{
//                 // Initial Values
//                 delegationStorage = await delegationInstance.storage();

//                 // Distribute Operation
//                 await signerFactory(alice.sk);
//                 await chai.expect(delegationInstance.methods.distributeReward([bob.pkh],MVK(50)).send()).to.be.rejected;
//             } catch(e){
//                 console.dir(e, {depth: 5});
//             }
//         });

//         it('Whitelist should not be able to call this entrypoint if the doorman contract is not referenced in the storage', async () => {
//             try{
//                 // Initial Values
//                 delegationStorage = await delegationInstance.storage();

//                 // Preparation operation
//                 var updateGeneralContractsOperation   = await governanceInstance.methods.updateGeneralContracts("doorman", doormanAddress.address).send();
//                 await updateGeneralContractsOperation.confirmation();

//                 // Distribute Operation
//                 await chai.expect(delegationInstance.methods.distributeReward([bob.pkh],MVK(50)).send()).to.be.rejected;

//                 // Reset operation
//                 updateGeneralContractsOperation   = await governanceInstance.methods.updateGeneralContracts("doorman", doormanAddress.address).send();
//                 await updateGeneralContractsOperation.confirmation();
//             }
//             catch(e) {
//                 console.dir(e, {depth: 5});
//             }
//         })

//         it('Whitelist should not be able to call this entrypoint if the satellite treasury contract is not referenced in the storage', async () => {
//             try{
//                 // Initial Values
//                 delegationStorage = await delegationInstance.storage();

//                 // Preparation operation
//                 var updateGeneralContractsOperation   = await governanceInstance.methods.updateGeneralContracts("satelliteTreasury", treasuryAddress.address).send();
//                 await updateGeneralContractsOperation.confirmation();

//                 // Distribute Operation
//                 await chai.expect(delegationInstance.methods.distributeReward([bob.pkh],MVK(50)).send()).to.be.rejected;

//                 // Reset operation
//                 updateGeneralContractsOperation   = await governanceInstance.methods.updateGeneralContracts("satelliteTreasury", treasuryAddress.address).send();
//                 await updateGeneralContractsOperation.confirmation();
//             }
//             catch(e) {
//                 console.dir(e, {depth: 5});
//             }
//         })

//         it('Whitelist should not be able to call this entrypoint if one of the provided satellites does not exist', async () => {
//             try{
//                 // Initial Values
//                 delegationStorage = await delegationInstance.storage();

//                 // Distribute Operation
//                 await chai.expect(delegationInstance.methods.distributeReward([bob.pkh, trudy.pkh],MVK(50)).send()).to.be.rejected;
//             }
//             catch(e) {
//                 console.dir(e, {depth: 5});
//             }
//         })
//     });
// });
