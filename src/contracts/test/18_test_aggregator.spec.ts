// import { createHash } from "crypto";

// const chai = require("chai");
// import { MichelsonMap } from "@taquito/taquito";
// const { InMemorySigner } = require("@taquito/signer");
// const chaiAsPromised = require('chai-as-promised');

// import assert, { ok, rejects, strictEqual } from "assert";
// import { MVK, Utils, zeroAddress } from "./helpers/Utils";
// import BigNumber from 'bignumber.js';
// import { packDataBytes, MichelsonData, MichelsonType } from '@taquito/michel-codec';
// import { bob, alice, eve, mallory, david, trudy, susie, oracleMaintainer} from "../scripts/sandbox/accounts";
// import doormanAddress            from '../deployments/doormanAddress.json';
// import aggregatorAddress         from '../deployments/aggregatorAddress.json';
// import delegationAddress         from '../deployments/delegationAddress.json';
// import mvkTokenAddress           from '../deployments/mvkTokenAddress.json';
// import aggregatorFactoryAddress  from '../deployments/aggregatorFactoryAddress.json';
// import { aggregatorStorageType } from './types/aggregatorStorageType';
// import treasuryAddress   from '../deployments/treasuryAddress.json';

// interface IOracleObservationType {
//     price: BigNumber;
//     epoch: number;
//     round: number;
//     aggregatorAddress: string;
// }

// chai.use(chaiAsPromised);
// chai.should();

// function wait(ms: number) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// describe('Aggregator Tests', async () => {

//   var utils: Utils
//   let aggregator
//   let doormanInstance
//   let mvkTokenInstance
//   let delegationInstance
//   let aggregatorFactoryInstance
//   let treasuryInstance

//   let doormanStorage
//   let mvkTokenStorage
//   let delegationStorage
//   let aggregatorFactoryStorage
//   let treasuryStorage;

//   const signerFactory = async (pk) => {
//     await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
//     return utils.tezos;
//   };

//   before("setup", async () => {
    
//     utils = new Utils();
//     await utils.init(bob.sk);

//     aggregator = await utils.tezos.contract.at(aggregatorAddress.address);
//     const aggregatorStorage = await aggregator.storage();

//     doormanInstance                 = await utils.tezos.contract.at(doormanAddress.address);
//     doormanStorage                  = await doormanInstance.storage();

//     delegationInstance              = await utils.tezos.contract.at(delegationAddress.address);
//     delegationStorage               = await delegationInstance.storage();

//     mvkTokenInstance                = await utils.tezos.contract.at(mvkTokenAddress.address);
//     mvkTokenStorage                 = await mvkTokenInstance.storage();

//     treasuryInstance                = await utils.tezos.contract.at(treasuryAddress.address);
//     treasuryStorage                 = await treasuryInstance.storage();

//     // setup oracles for test
//     if(aggregatorStorage.oracleAddresses.get(bob.pkh) === undefined){
//       const addBobOracle = await aggregator.methods.addOracle(
//         bob.pkh,
//         bob.pk,
//         bob.peerId,
//         ).send();
//       await addBobOracle.confirmation();
//     }

//     if(aggregatorStorage.oracleAddresses.get(eve.pkh) === undefined){
//       const addEveOracle = await aggregator.methods.addOracle(
//         eve.pkh,
//         eve.pk,
//         eve.peerId,
//         ).send();
//       await addEveOracle.confirmation();
//     }

//     if(aggregatorStorage.oracleAddresses.get(mallory.pkh) === undefined){
//       const addMalloryOracle = await aggregator.methods.addOracle(
//         mallory.pkh,
//         mallory.pk,
//         mallory.peerId,
//         ).send();
//       await addMalloryOracle.confirmation();
//     }

//     if(aggregatorStorage.oracleAddresses.get(oracleMaintainer.pkh) === undefined){
//       const addMaintainerOracle = await aggregator.methods.addOracle(
//         oracleMaintainer.pkh,
//         oracleMaintainer.pk,
//         oracleMaintainer.peerId,
//         ).send();
//       await addMaintainerOracle.confirmation();
//     }


//     // -----------------------------------------------
//     // set up second aggregator for tests
//     // -----------------------------------------------

//     aggregatorFactoryInstance       = await utils.tezos.contract.at(aggregatorFactoryAddress.address);
//     aggregatorFactoryStorage        = await aggregatorFactoryInstance.storage();

//     const oracleMap = MichelsonMap.fromLiteral({
//       [bob.pkh]              : {
//                                     oraclePublicKey: bob.pk,
//                                     oraclePeerId: bob.peerId
//                                 },
//       [eve.pkh]              : {
//                                     oraclePublicKey: eve.pk,
//                                     oraclePeerId: eve.peerId
//                                 },
//       [mallory.pkh]          : {
//                                     oraclePublicKey: mallory.pk,
//                                     oraclePeerId: mallory.peerId
//                                 },
//       [oracleMaintainer.pkh] : {
//                                     oraclePublicKey: oracleMaintainer.pk,
//                                     oraclePeerId: oracleMaintainer.peerId
//                                 },
//     });

//     const aggregatorMetadataBase = Buffer.from(
//       JSON.stringify({
//           name: 'MAVRYK Aggregator Contract',
//           version: 'v1.0.0',
//           authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
//       }),
//       'ascii',
//       ).toString('hex')

//     // Setup second aggregator
//     const createAggregatorOperation = await aggregatorFactoryInstance.methods.createAggregator(
//         'USD',
//         'DOGE',

//         'USDDOGE',
//         true,
        
//         oracleMap,

//         new BigNumber(8),             // decimals
//         new BigNumber(2),             // alphaPercentPerThousand

//         new BigNumber(60),            // percentOracleThreshold
//         new BigNumber(30),            // heartBeatSeconds


//         new BigNumber(10000000),      // rewardAmountStakedMvk ~ 0.01 MVK 
//         new BigNumber(1000000),       // rewardAmountXtz - 1 tez for testing (usual should be around ~ 0.0013 tez)
         
//         aggregatorMetadataBase        // metadata bytes

//     ).send();
//     await createAggregatorOperation.confirmation();

//     // Track original aggregator
//     const trackAggregatorOperation = await aggregatorFactoryInstance.methods.trackAggregator(
//         "USD", "test", aggregator.address
//       ).send();
//     await trackAggregatorOperation.confirmation();

//     console.log('-- -- -- -- -- Aggregator Tests -- -- -- --')
//     console.log('Doorman Contract deployed at:'               , doormanInstance.address);
//     console.log('Delegation Contract deployed at:'            , delegationInstance.address);
//     console.log('MVK Token Contract deployed at:'             , mvkTokenInstance.address);
//     console.log('Treasury Contract deployed at:'              , treasuryInstance.address);
//     console.log('Aggregator Contract deployed at:'            , aggregator.address);
//     console.log('Aggregator Factory Contract deployed at:'    , aggregatorFactoryInstance.address);
    
//     console.log('Bob address: '               + bob.pkh);
//     console.log('Alice address: '             + alice.pkh);
//     console.log('Eve address: '               + eve.pkh);
//     console.log('Mallory address: '           + mallory.pkh);
//     console.log('Oracle Maintainer address: ' + oracleMaintainer.pkh);

//     // Setup governance satellites for action snapshot later
//     // ------------------------------------------------------------------

//     // Bob stakes 100 MVK tokens and registers as a satellite
//     const bobSatellite      = await delegationStorage.satelliteLedger.get(bob.pkh);
//     const aliceSatellite    = await delegationStorage.satelliteLedger.get(alice.pkh);
//     const mallorySatellite  = await delegationStorage.satelliteLedger.get(mallory.pkh);
//     const eveSatellite      = await delegationStorage.satelliteLedger.get(eve.pkh);
//     const oracleSatellite   = await delegationStorage.satelliteLedger.get(oracleMaintainer.pkh);
    
//     if(bobSatellite === undefined){

//         await signerFactory(bob.sk);
//         var updateOperators = await mvkTokenInstance.methods
//             .update_operators([
//             {
//                 add_operator: {
//                     owner: bob.pkh,
//                     operator: doormanAddress.address,
//                     token_id: 0,
//                 },
//             },
//             ])
//             .send()
//         await updateOperators.confirmation();  
//         const bobStakeAmount                  = MVK(100);
//         const bobStakeAmountOperation         = await doormanInstance.methods.stake(bobStakeAmount).send();
//         await bobStakeAmountOperation.confirmation();                        
//         const bobRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite("New Satellite by Bob", "New Satellite Description - Bob", "https://image.url", "https://image.url", "1000").send();
//         await bobRegisterAsSatelliteOperation.confirmation();

//         // Bob transfers 150 MVK tokens to Oracle Maintainer
//         const bobTransferMvkToOracleMaintainerOperation = await mvkTokenInstance.methods.transfer([
//             {
//                 from_: bob.pkh,
//                 txs: [
//                     {
//                         to_: oracleMaintainer.pkh,
//                         token_id: 0,
//                         amount: MVK(150)
//                     }
//                 ]
//             }
//         ]).send();
//         await bobTransferMvkToOracleMaintainerOperation.confirmation();

//     }


//     if(aliceSatellite === undefined){

//         // Alice stakes 100 MVK tokens and registers as a satellite 
//         await signerFactory(alice.sk);
//         updateOperators = await mvkTokenInstance.methods
//             .update_operators([
//             {
//                 add_operator: {
//                     owner: alice.pkh,
//                     operator: doormanAddress.address,
//                     token_id: 0,
//                 },
//             },
//             ])
//             .send()
//         await updateOperators.confirmation(); 
//         const aliceStakeAmount                  = MVK(100);
//         const aliceStakeAmountOperation         = await doormanInstance.methods.stake(aliceStakeAmount).send();
//         await aliceStakeAmountOperation.confirmation();                        
//         const aliceRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite("New Satellite by Alice", "New Satellite Description - Alice", "https://image.url", "https://image.url", "1000").send();
//         await aliceRegisterAsSatelliteOperation.confirmation();
//     }


//     if(eveSatellite === undefined){

//         // Eve stakes 100 MVK tokens and registers as a satellite 
//         await signerFactory(eve.sk);
//         updateOperators = await mvkTokenInstance.methods
//             .update_operators([
//             {
//                 add_operator: {
//                     owner: eve.pkh,
//                     operator: doormanAddress.address,
//                     token_id: 0,
//                 },
//             },
//             ])
//             .send()
//         await updateOperators.confirmation(); 
//         const eveStakeAmount                  = MVK(100);
//         const eveStakeAmountOperation         = await doormanInstance.methods.stake(eveStakeAmount).send();
//         await eveStakeAmountOperation.confirmation();                        
//         const eveRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite("New Satellite by Eve", "New Satellite Description - Eve", "https://image.url", "https://image.url", "1000").send();
//         await eveRegisterAsSatelliteOperation.confirmation();
//     }


//     if(mallorySatellite === undefined){

//         // Mallory stakes 100 MVK tokens and registers as a satellite 
//         await signerFactory(mallory.sk);
//         updateOperators = await mvkTokenInstance.methods
//             .update_operators([
//             {
//                 add_operator: {
//                     owner: mallory.pkh,
//                     operator: doormanAddress.address,
//                     token_id: 0,
//                 },
//             },
//             ])
//             .send()
//         await updateOperators.confirmation(); 
//         const malloryStakeAmount                  = MVK(100);
//         const malloryStakeAmountOperation         = await doormanInstance.methods.stake(malloryStakeAmount).send();
//         await malloryStakeAmountOperation.confirmation();                        
//         const malloryRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite("New Satellite by Mallory", "New Satellite Description - Mallory", "https://image.url", "https://image.url", "1000").send();
//         await malloryRegisterAsSatelliteOperation.confirmation();
//     }


//     if(oracleSatellite === undefined){

//       // Oracle Maintainer stakes 100 MVK tokens and registers as a satellite 
//       await signerFactory(oracleMaintainer.sk);
//       updateOperators = await mvkTokenInstance.methods
//           .update_operators([
//           {
//               add_operator: {
//                   owner: oracleMaintainer.pkh,
//                   operator: doormanAddress.address,
//                   token_id: 0,
//               },
//           },
//           ])
//           .send()
//       await updateOperators.confirmation(); 
//       const oracleMaintainerStakeAmount                  = MVK(100);
//       const oracleMaintainerStakeAmountOperation         = await doormanInstance.methods.stake(oracleMaintainerStakeAmount).send();
//       await oracleMaintainerStakeAmountOperation.confirmation();                        
//       const oracleMaintainerRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite("New Satellite by Oracle Maintainer", "New Satellite Description - Oracle Maintainer", "https://image.url", "https://image.url", "1000").send();
//       await oracleMaintainerRegisterAsSatelliteOperation.confirmation();
//   }

//     // Setup funds in Treasury for transfer later
//     // ------------------------------------------------------------------

//     // Alice transfers 250 XTZ to Treasury
//     await signerFactory(alice.sk)
//     const aliceTransferTezToTreasuryOperation = await utils.tezos.contract.transfer({ to: treasuryInstance.address, amount: 250});
//     await aliceTransferTezToTreasuryOperation.confirmation();

//     // Alice transfers 100 MVK Tokens to Treasury
//     const aliceTransferMvkTokensToTreasuryOperation = await mvkTokenInstance.methods.transfer([
//         {
//             from_: alice.pkh,
//             txs: [
//                 {
//                     to_: treasuryInstance.address,
//                     token_id: 0,
//                     amount: MVK(100)
//                 }
//             ]
//         }
//     ]).send();
//     await aliceTransferMvkTokensToTreasuryOperation.confirmation();


//     // Set XTZ Reward to be higher for tests (from 0.0013 xtz to 1 xtz)
//     // ------------------------------------------------------------------

//     // Bob sets reward amount to be 1 tez
//     await signerFactory(bob.sk)
//     const rewardAmountXtz = 1000000; // 1 tez
//     const set_xtz_reward_amount_op = await aggregator.methods.updateConfig(
//       rewardAmountXtz, "configRewardAmountXtz"
//     ).send();
//     await set_xtz_reward_amount_op.confirmation();
  
//   });

//   describe('AddOracle', () => {

//     it(
//       'should fail if called by random address',
//       async () => {
//         await signerFactory(david.sk);

//         const op = aggregator.methods.addOracle(
//             susie.pkh,
//             susie.pk,
//             susie.peerId
//         )

//         await chai.expect(op.send()).to.be.rejectedWith();
//       },

//     );

//     it(
//       'should fail if oracle already registered',
//       async () => {
//         await signerFactory(bob.sk);

//         const op = await aggregator.methods.addOracle(
//             bob.pkh,
//             bob.pk,
//             bob.peerId
//         );

//         // await chai.expect(op.send()).rejects.toThrow("You can't add an already present whitelisted oracle");
//         await chai.expect(op.send()).to.be.rejectedWith();

//       });

//     it(
//       'should add susie',
//       async () => {
//         await signerFactory(bob.sk);

//         const op = aggregator.methods.addOracle(
//             susie.pkh,
//             susie.pk,
//             susie.peerId
//         );

//           const tx = await op.send();
//           await tx.confirmation();

//           const storage: aggregatorStorageType = await aggregator.storage();

//         assert.deepEqual(storage.oracleAddresses?.has(susie.pkh),true);
//       },

//     );
//   });

//   describe('RemoveOracle', () => {
//     it(
//       'should fail if called by random address',
//       async () => {
//         await signerFactory(david.sk);


//         const op = aggregator.methods.removeOracle(susie.pkh);

//         // await chai.expect(op.send()).rejects.toThrow(
//         //   'Only owner can do this action'
//         // );
//         await chai.expect(op.send()).to.be.rejectedWith();
//       },

//     );

//     it(
//       'should fail if oracle is not present in the map',
//       async () => {
//         await signerFactory(bob.sk);


//         const op = aggregator.methods.removeOracle(trudy.pkh);

//         // await chai.expect(op.send()).rejects.toThrow("You can't remove a not present whitelisted oracle");
//         await chai.expect(op.send()).to.be.rejectedWith();
//       }, );

//     it(
//       'should remove trudy',
//       async () => {
//         await signerFactory(bob.sk);

//         const storageb: aggregatorStorageType = await aggregator.storage();
//         const op = aggregator.methods.removeOracle(susie.pkh);
//           const tx = await op.send();
//           await tx.confirmation();

//         const storage: aggregatorStorageType = await aggregator.storage();
//         assert.deepEqual(storage.oracleAddresses?.has(susie.pkh), false);
//       },

//     );
//   });


//   describe('UpdateData', () => {

//     const observations = [
//       {
//          "oracle": bob.pkh,
//          "price": new BigNumber(10142857143)
//       },
//       {
//           "oracle": eve.pkh,
//           "price": new BigNumber(10142853322)
//        },
//        {
//           "oracle": mallory.pkh,
//           "price": new BigNumber(10142857900)
//        },
//        {
//           "oracle": oracleMaintainer.pkh,
//           "price": new BigNumber(10144537815)
//        },
//    ];

//    let epoch: number = 1;
//    let round: number = 1;

//   // const lastCompletedRoundView = aggregator.contractViews.getLastCompletedPrice().executeView({ viewCaller : bob.pkh});
//   // console.log(lastCompletedRoundView);

//    it(
//     'should fail if called by random address',
//     async () => {


//       const oracleObservations = new MichelsonMap<string, IOracleObservationType>();
//       for (const { oracle, price } of observations) {
//          oracleObservations.set(oracle, {
//              price,
//              epoch,
//              round,
//              aggregatorAddress: aggregatorAddress.address
//            });
//       };

//       const signatures = new MichelsonMap<string, string>();

//       await signerFactory(bob.sk);
//       signatures.set(bob.pkh, await utils.signOraclePriceResponses(oracleObservations));
//       await signerFactory(eve.sk);
//       signatures.set(eve.pkh, await utils.signOraclePriceResponses(oracleObservations));
//       await signerFactory(mallory.sk);
//       signatures.set(mallory.pkh, await utils.signOraclePriceResponses(oracleObservations));
//       await signerFactory(oracleMaintainer.sk);
//       signatures.set(oracleMaintainer.pkh, await utils.signOraclePriceResponses(oracleObservations));

//       await signerFactory(trudy.sk);
//       await chai.expect(aggregator.methods.updateData(
//         oracleObservations,
//         signatures
//       ).send()).to.be.rejected;
//      },
//   );

//     it(
//         'UpdateData should work',
//         async () => {


//          const oracleObservations = new MichelsonMap<string, IOracleObservationType>();
//          for (const { oracle, price } of observations) {
//             oracleObservations.set(oracle, {
//                 price,
//                 epoch,
//                 round,
//                 aggregatorAddress: aggregatorAddress.address
//               });
//          };

//          const signatures = new MichelsonMap<string, string>();

//          await signerFactory(bob.sk);
//          signatures.set(bob.pkh, await utils.signOraclePriceResponses(oracleObservations));
//          await signerFactory(eve.sk);
//          signatures.set(eve.pkh, await utils.signOraclePriceResponses(oracleObservations));
//          await signerFactory(mallory.sk);
//          signatures.set(mallory.pkh, await utils.signOraclePriceResponses(oracleObservations));
//          await signerFactory(oracleMaintainer.sk);
//          signatures.set(oracleMaintainer.pkh, await utils.signOraclePriceResponses(oracleObservations));


//           const op = aggregator.methods.updateData(
//             oracleObservations,
//             signatures
//           );

//           const tx = await op.send();
//           await tx.confirmation();
  
//           const storage: aggregatorStorageType = await aggregator.storage();
//           assert.deepEqual(storage.lastCompletedPrice.round,new BigNumber(round));
//           assert.deepEqual(storage.lastCompletedPrice.epoch,new BigNumber(epoch));
//           assert.deepEqual(storage.lastCompletedPrice.price,new BigNumber(10142857521));
//           assert.deepEqual(storage.lastCompletedPrice.percentOracleResponse,new BigNumber(4));
//           round++;
//         },
//       );

//     it(
//       'should fail if not many observations in observations map',
//       async () => {


//         const oracleObservations = new MichelsonMap<string, IOracleObservationType>();
//         oracleObservations.set(observations[0].oracle, {
//           price: observations[0].price,
//           epoch,
//           round,
//           aggregatorAddress: aggregatorAddress.address
//         });

//         const signatures = new MichelsonMap<string, string>();

//         await signerFactory(bob.sk);
//         signatures.set(bob.pkh, await utils.signOraclePriceResponses(oracleObservations));
//         await signerFactory(eve.sk);
//         signatures.set(eve.pkh, await utils.signOraclePriceResponses(oracleObservations));
//         await signerFactory(mallory.sk);
//         signatures.set(mallory.pkh, await utils.signOraclePriceResponses(oracleObservations));
//         await signerFactory(oracleMaintainer.sk);
//         signatures.set(oracleMaintainer.pkh, await utils.signOraclePriceResponses(oracleObservations));

//         await chai.expect(aggregator.methods.updateData(
//           oracleObservations,
//           signatures
//         ).send()).to.be.rejected;
//        },
//     );

//     it(
//       'should fail if not many signatures in signatures map',
//       async () => {


//         const oracleObservations = new MichelsonMap<string, IOracleObservationType>();
//          for (const { oracle, price } of observations) {
//             oracleObservations.set(oracle, {
//                 price,
//                 epoch,
//                 round,
//                 aggregatorAddress: aggregatorAddress.address
//               });
//          };

//         const signatures = new MichelsonMap<string, string>();

//         await chai.expect(aggregator.methods.updateData(
//           oracleObservations,
//           signatures
//         ).send()).to.be.rejected;
//        },
//     );

//     it(
//       'should fail if wrong aggregator address in obervations map',
//       async () => {

//         const oracleObservations = new MichelsonMap<string, IOracleObservationType>();
//          for (const { oracle, price } of observations) {
//             oracleObservations.set(oracle, {
//                 price,
//                 epoch,
//                 round,
//                 aggregatorAddress: aggregatorFactoryAddress.address
//               });
//          };

//         const signatures = new MichelsonMap<string, string>();

//         await signerFactory(bob.sk);
//         signatures.set(bob.pkh, await utils.signOraclePriceResponses(oracleObservations));
//         await signerFactory(eve.sk);
//         signatures.set(eve.pkh, await utils.signOraclePriceResponses(oracleObservations));
//         await signerFactory(mallory.sk);
//         signatures.set(mallory.pkh, await utils.signOraclePriceResponses(oracleObservations));
//         await signerFactory(oracleMaintainer.sk);
//         signatures.set(oracleMaintainer.pkh, await utils.signOraclePriceResponses(oracleObservations));

//         await chai.expect(aggregator.methods.updateData(
//           oracleObservations,
//           signatures
//         ).send()).to.be.rejected;
//        },
//     );

//     it(
//       'should fail if one of the oracle in obervations map id not authorized',
//       async () => {

//         const observations_bad = [
//           {
//              "oracle": bob.pkh,
//              "price": new BigNumber(10142857143)
//           },
//           {
//               "oracle": eve.pkh,
//               "price": new BigNumber(10142853322)
//            },
//            {
//               "oracle": mallory.pkh,
//               "price": new BigNumber(10142857900)
//            },
//            {
//               "oracle": trudy.pkh,
//               "price": new BigNumber(10144537815)
//            },
//        ];

//         const oracleObservations = new MichelsonMap<string, IOracleObservationType>();
//          for (const { oracle, price } of observations_bad) {
//             oracleObservations.set(oracle, {
//                 price,
//                 epoch,
//                 round,
//                 aggregatorAddress: aggregatorAddress.address
//               });
//          };

//         const signatures = new MichelsonMap<string, string>();

//         await signerFactory(bob.sk);
//         signatures.set(bob.pkh, await utils.signOraclePriceResponses(oracleObservations));
//         await signerFactory(eve.sk);
//         signatures.set(eve.pkh, await utils.signOraclePriceResponses(oracleObservations));
//         await signerFactory(mallory.sk);
//         signatures.set(mallory.pkh, await utils.signOraclePriceResponses(oracleObservations));
//         await signerFactory(oracleMaintainer.sk);
//         signatures.set(oracleMaintainer.pkh, await utils.signOraclePriceResponses(oracleObservations));

//         await chai.expect(aggregator.methods.updateData(
//           oracleObservations,
//           signatures
//         ).send()).to.be.rejected;
//        },
//     );

//     it(
//       'should fail if different epoch in signatures map',
//       async () => {

//         const observations_bad = [
//           {
//              "oracle": bob.pkh,
//              "price": new BigNumber(10142857143),
//              "epoch": 1
//           },
//           {
//               "oracle": eve.pkh,
//               "price": new BigNumber(10142853322),
//               "epoch": 1
//            },
//            {
//               "oracle": mallory.pkh,
//               "price": new BigNumber(10142857900),
//               "epoch": 1
//            },
//            {
//               "oracle": trudy.pkh,
//               "price": new BigNumber(10144537815),
//               "epoch": 2
//            },
//        ];

//         const oracleObservations = new MichelsonMap<string, IOracleObservationType>();
//          for (const { oracle, price, epoch } of observations_bad) {
//             oracleObservations.set(oracle, {
//                 price,
//                 epoch,
//                 round,
//                 aggregatorAddress: aggregatorFactoryAddress.address
//               });
//          };

//         const signatures = new MichelsonMap<string, string>();

//         await signerFactory(bob.sk);
//         signatures.set(bob.pkh, await utils.signOraclePriceResponses(oracleObservations));
//         await signerFactory(eve.sk);
//         signatures.set(eve.pkh, await utils.signOraclePriceResponses(oracleObservations));
//         await signerFactory(mallory.sk);
//         signatures.set(mallory.pkh, await utils.signOraclePriceResponses(oracleObservations));
//         await signerFactory(oracleMaintainer.sk);
//         signatures.set(oracleMaintainer.pkh, await utils.signOraclePriceResponses(oracleObservations));

//         await chai.expect(aggregator.methods.updateData(
//           oracleObservations,
//           signatures
//         ).send()).to.be.rejected;
//        },
//     );

//     it(
//       'should fail if different round in signatures map',
//       async () => {

//         const observations_bad = [
//           {
//              "oracle": bob.pkh,
//              "price": new BigNumber(10142857143),
//              "round": 2
//           },
//           {
//               "oracle": eve.pkh,
//               "price": new BigNumber(10142853322),
//               "round": 2
//            },
//            {
//               "oracle": mallory.pkh,
//               "price": new BigNumber(10142857900),
//               "round": 2
//            },
//            {
//               "oracle": trudy.pkh,
//               "price": new BigNumber(10144537815),
//               "round": 3
//            },
//        ];

//         const oracleObservations = new MichelsonMap<string, IOracleObservationType>();
//          for (const { oracle, price, round } of observations_bad) {
//             oracleObservations.set(oracle, {
//                 price,
//                 epoch,
//                 round,
//                 aggregatorAddress: aggregatorFactoryAddress.address
//               });
//          };

//         const signatures = new MichelsonMap<string, string>();

//         await signerFactory(bob.sk);
//         signatures.set(bob.pkh, await utils.signOraclePriceResponses(oracleObservations));
//         await signerFactory(eve.sk);
//         signatures.set(eve.pkh, await utils.signOraclePriceResponses(oracleObservations));
//         await signerFactory(mallory.sk);
//         signatures.set(mallory.pkh, await utils.signOraclePriceResponses(oracleObservations));
//         await signerFactory(oracleMaintainer.sk);
//         signatures.set(oracleMaintainer.pkh, await utils.signOraclePriceResponses(oracleObservations));

//         await chai.expect(aggregator.methods.updateData(
//           oracleObservations,
//           signatures
//         ).send()).to.be.rejected;
//        },
//     );

//     it(
//       'should fail if epoch in observations maps is not greather or equal than previous one',
//       async () => {

//         const oracleObservations = new MichelsonMap<string, IOracleObservationType>();
//          for (const { oracle, price } of observations) {
//             oracleObservations.set(oracle, {
//                 price,
//                 epoch: epoch - 1,
//                 round,
//                 aggregatorAddress: aggregatorAddress.address
//               });
//          };

//         const signatures = new MichelsonMap<string, string>();

//         await signerFactory(bob.sk);
//         signatures.set(bob.pkh, await utils.signOraclePriceResponses(oracleObservations));
//         await signerFactory(eve.sk);
//         signatures.set(eve.pkh, await utils.signOraclePriceResponses(oracleObservations));
//         await signerFactory(mallory.sk);
//         signatures.set(mallory.pkh, await utils.signOraclePriceResponses(oracleObservations));
//         await signerFactory(oracleMaintainer.sk);
//         signatures.set(oracleMaintainer.pkh, await utils.signOraclePriceResponses(oracleObservations));

//         await chai.expect(aggregator.methods.updateData(
//           oracleObservations,
//           signatures
//         ).send()).to.be.rejected;
//        },
//     );

//     it(
//       'should fail if round in observations maps is not greather than previous one with same epoch',
//       async () => {

//         const oracleObservations = new MichelsonMap<string, IOracleObservationType>();
//          for (const { oracle, price } of observations) {
//             oracleObservations.set(oracle, {
//                 price,
//                 epoch,
//                 round: round - 1,
//                 aggregatorAddress: aggregatorAddress.address
//               });
//          };

//         const signatures = new MichelsonMap<string, string>();

//         await signerFactory(bob.sk);
//         signatures.set(bob.pkh, await utils.signOraclePriceResponses(oracleObservations));
//         await signerFactory(eve.sk);
//         signatures.set(eve.pkh, await utils.signOraclePriceResponses(oracleObservations));
//         await signerFactory(mallory.sk);
//         signatures.set(mallory.pkh, await utils.signOraclePriceResponses(oracleObservations));
//         await signerFactory(oracleMaintainer.sk);
//         signatures.set(oracleMaintainer.pkh, await utils.signOraclePriceResponses(oracleObservations));

//         await chai.expect(aggregator.methods.updateData(
//           oracleObservations,
//           signatures
//         ).send()).to.be.rejected;
//        },
//     );

//     it(
//       'should fail if wrong oracle signature in signatures map',
//       async () => {

//         const oracleObservations = new MichelsonMap<string, IOracleObservationType>();
//          for (const { oracle, price } of observations) {
//             oracleObservations.set(oracle, {
//                 price,
//                 epoch,
//                 round,
//                 aggregatorAddress: aggregatorAddress.address
//               });
//          };

//         const signatures = new MichelsonMap<string, string>();

//         await signerFactory(bob.sk);
//         signatures.set(bob.pkh, await utils.signOraclePriceResponses(oracleObservations));
//         await signerFactory(trudy.sk);
//         signatures.set(eve.pkh, await utils.signOraclePriceResponses(oracleObservations));
//         await signerFactory(mallory.sk);
//         signatures.set(mallory.pkh, await utils.signOraclePriceResponses(oracleObservations));
//         await signerFactory(oracleMaintainer.sk);
//         signatures.set(oracleMaintainer.pkh, await utils.signOraclePriceResponses(oracleObservations));

//         await chai.expect(aggregator.methods.updateData(
//           oracleObservations,
//           signatures
//         ).send()).to.be.rejected;
//        },
//     );

//   });


//   describe('withdrawRewardXtz', () => {

//       it('oracles should be able to withdraw reward xtz', async () => {
            
//             await signerFactory(bob.sk);

//             const beforeStorage: aggregatorStorageType = await aggregator.storage();
//             const rewardAmountXtz           = beforeStorage.config.rewardAmountXtz.toNumber();

//             // For reference if needed:
//             // console.log("rewardAmountXtz: "          + rewardAmountXtz);
//             // console.log("rewardAmountStakedMvk:"     + rewardAmountStakedMvk);
//             // console.log("deviationRewardAmountXtz: " + deviationRewardAmountXtz);
//             // console.log("deviationRewardStakedMvk: " + deviationRewardStakedMvk);

//             const beforeOracleMaintainerRewardXtz            = await beforeStorage.oracleRewardXtz.get(oracleMaintainer.pkh);
//             const beforeEveRewardXtz                         = await beforeStorage.oracleRewardXtz.get(eve.pkh);

//             const beforeOracleMaintainerTezBalance           = await utils.tezos.tz.getBalance(oracleMaintainer.pkh);
//             const beforeEveTezBalance                        = await utils.tezos.tz.getBalance(eve.pkh);

//             const oracleMaintainerTezRewardAmount            = rewardAmountXtz;

//             // check that xtz reward amounts are correct
//             assert.equal(beforeOracleMaintainerRewardXtz, oracleMaintainerTezRewardAmount);         // 1000000 - one updateData
//             assert.equal(beforeEveRewardXtz, undefined);                                            // undefined because no rewards

//             // use alice to withdraw reward to the oracles and pay the gas cost for easier testing
//             await signerFactory(alice.sk);
            
//             const oracleMaintainer_withdraw_reward_xtz_op = await aggregator.methods.withdrawRewardXtz(oracleMaintainer.pkh).send();
//             await oracleMaintainer_withdraw_reward_xtz_op.confirmation();
            
//             const eve_withdraw_reward_xtz_op = await aggregator.methods.withdrawRewardXtz(eve.pkh).send();
//             await eve_withdraw_reward_xtz_op.confirmation();


//             const storage: aggregatorStorageType = await aggregator.storage();

//             // get updated satellite oracle rewards for xtz
//             const resetOracleMaintainerRewardXtz        = await storage.oracleRewardXtz.get(oracleMaintainer.pkh);
//             const resetEveRewardXtz                     = await storage.oracleRewardXtz.get(eve.pkh);

//             // check that reward xtz is now reset to zero after claiming
//             assert.equal(resetOracleMaintainerRewardXtz, 0);
//             assert.equal(resetEveRewardXtz, undefined);

//             // get updated xtz balance of satellites
//             const oracleMaintainerTezBalance       = await utils.tezos.tz.getBalance(oracleMaintainer.pkh);
//             const eveTezBalance                    = await utils.tezos.tz.getBalance(eve.pkh);

//             // check that tez balance has been updated by the right amount
//             assert.deepEqual(oracleMaintainerTezBalance, beforeOracleMaintainerTezBalance.plus(oracleMaintainerTezRewardAmount));      
//             assert.deepEqual(eveTezBalance, beforeEveTezBalance);      
//       });

//       it('oracles should be able to withdraw reward - staked MVK', async () => {
          
//           await signerFactory(bob.sk);

//           const beforeStorage: aggregatorStorageType = await aggregator.storage();
//           const beforeDelegationStorage = await delegationInstance.storage();

//           const satelliteFee     = 1000; // set when bob, eve, mallory registered as satellites in before setup

//           const bobStakedMvk     = 100;
//           const eveStakedMvk     = 100;
//           const malloryStakedMvk = 100;
//           const oracleMaintainerStakedMvk = 100;
//           // const totalStakedMvkThreeCommits = bobStakedMvk + eveStakedMvk + malloryStakedMvk;
//           // const totalStakedMvkTwoCommits = eveStakedMvk + malloryStakedMvk;

//           const totalStakedMvkFourObservations = 100 * 4;

//           const rewardAmountStakedMvk     = beforeStorage.config.rewardAmountStakedMvk.toNumber();

//           console.log("ici " + Array.from(beforeStorage.oracleRewardStakedMvk.entries()))
//           // satellite oracle rewards in staked MVK
//           const beforeBobRewardStakedMvk      = await beforeStorage.oracleRewardStakedMvk.get(bob.pkh);
//           const beforeEveRewardStakedMvk      = await beforeStorage.oracleRewardStakedMvk.get(eve.pkh);
//           const beforeMalloryRewardStakedMvk  = await beforeStorage.oracleRewardStakedMvk.get(mallory.pkh);

//           // satellite rewards balance before withdrawing rewards
//           const beforeBobRewardsLedger     = await beforeDelegationStorage.satelliteRewardsLedger.get(bob.pkh);
//           const beforeEveRewardsLedger     = await beforeDelegationStorage.satelliteRewardsLedger.get(eve.pkh);
//           const beforeMalloryRewardsLedger = await beforeDelegationStorage.satelliteRewardsLedger.get(mallory.pkh);

//           // check that unpaid rewards is equal to 0 before satellite oracle withdraws sMVK rewards
//           assert.equal(beforeBobRewardsLedger.unpaid.toNumber(), 0);
//           assert.equal(beforeEveRewardsLedger.unpaid.toNumber(), 0);
//           assert.equal(beforeMalloryRewardsLedger.unpaid.toNumber(), 0);

//           // percent oracle threshold is 49% so even two oracles reveals will be successful
//           // - N.B. rewards are a fixed amount (e.g. 5 sMVK) divided by the number of satellite oracles that participated in the commit/reveal
//           // const singleRewardSMvkWithThreeCommits = Math.trunc((bobStakedMvk / totalStakedMvkThreeCommits) * rewardAmountStakedMvk);
//           // const singleRewardSMvkWithTwoCommits   = Math.trunc((bobStakedMvk / totalStakedMvkTwoCommits) * rewardAmountStakedMvk);

//           // calculate satellite staked MVK rewards based on number of commits/reveals and request rate update deviation (also assuming one commit is followed by one reveal)
//           // const bobTotalStakedMvkReward       = singleRewardSMvk;
//           // const eveTotalStakedMvkReward       = singleRewardSMvkWithThreeCommits + singleRewardSMvkWithTwoCommits;
//           // const malloryTotalStakedMvkReward   = singleRewardSMvkWithThreeCommits + singleRewardSMvkWithTwoCommits;

//           // check that staked mvk reward amounts are correct
//           // assert.equal(beforeBobRewardStakedMvk, bobTotalStakedMvkReward);          // 3,333,333 - one reveal
//           // assert.equal(beforeEveRewardStakedMvk, eveTotalStakedMvkReward);          // 8,333,333 - one reveal with two commits, one reveal with three commits
//           // assert.equal(beforeMalloryRewardStakedMvk, malloryTotalStakedMvkReward);  // 21,333,333 -  one reveal with two commits, one reveal with three commits, one req rate upd dev

//           const oneObservationRewardSMvk  = Math.trunc((bobStakedMvk / totalStakedMvkFourObservations) * rewardAmountStakedMvk);
          
//           assert.equal(beforeBobRewardStakedMvk, oneObservationRewardSMvk);     
//           assert.equal(beforeEveRewardStakedMvk, oneObservationRewardSMvk);     
//           assert.equal(beforeMalloryRewardStakedMvk, oneObservationRewardSMvk); 

//           await signerFactory(bob.sk);
//           const bob_withdraw_reward_staked_mvk_op = await aggregator.methods.withdrawRewardStakedMvk(bob.pkh).send();
//           await bob_withdraw_reward_staked_mvk_op.confirmation();

//           const eve_withdraw_reward_staked_mvk_op = await aggregator.methods.withdrawRewardStakedMvk(eve.pkh).send();
//           await eve_withdraw_reward_staked_mvk_op.confirmation();

//           const mallory_withdraw_reward_staked_mvk_op = await aggregator.methods.withdrawRewardStakedMvk(mallory.pkh).send();
//           await mallory_withdraw_reward_staked_mvk_op.confirmation();

//           const storage: aggregatorStorageType = await aggregator.storage();
//           const delegationStorage = await delegationInstance.storage();

//           // get updated satellite rewards ledger
//           const bobRewardsLedger      = await delegationStorage.satelliteRewardsLedger.get(bob.pkh);
//           const eveRewardsLedger      = await delegationStorage.satelliteRewardsLedger.get(eve.pkh);
//           const malloryRewardsLedger  = await delegationStorage.satelliteRewardsLedger.get(mallory.pkh);

//           // get updated satellite oracle rewards for staked MVK (should be reset to zero)
//           const resetBobRewardStakedMvk        = await storage.oracleRewardStakedMvk.get(bob.pkh);
//           const resetEveRewardStakedMvk        = await storage.oracleRewardStakedMvk.get(eve.pkh);
//           const resetMalloryRewardStakedMvk    = await storage.oracleRewardStakedMvk.get(mallory.pkh);

//           // check that reward staked MVK is now reset to zero after claiming
//           assert.equal(resetBobRewardStakedMvk, 0);
//           assert.equal(resetEveRewardStakedMvk, 0);
//           assert.equal(resetMalloryRewardStakedMvk, 0);

//           // calculate satellite's staked MVK rewards from fees (the remainder will be for the satellite's delegates)
//           // const finalBobStakedMvkRewardsAfterFees     = satelliteFee * bobTotalStakedMvkReward / 10000;
//           // const finalEveStakedMvkRewardsAfterFees     = satelliteFee * eveTotalStakedMvkReward / 10000;
//           // const finalMalloryStakedMvkRewardsAfterFees = satelliteFee * malloryTotalStakedMvkReward / 10000;

//           const finalBobStakedMvkRewardsAfterFees     = satelliteFee * oneObservationRewardSMvk / 10000;
//           const finalEveStakedMvkRewardsAfterFees     = satelliteFee * oneObservationRewardSMvk / 10000;
//           const finalMalloryStakedMvkRewardsAfterFees = satelliteFee * oneObservationRewardSMvk / 10000;

//           // check that satellite's unpaid staked mvk rewards have increased by the right amount
//           assert.equal(bobRewardsLedger.unpaid.toNumber(), beforeBobRewardsLedger.unpaid.toNumber() + Math.trunc(finalBobStakedMvkRewardsAfterFees));
//           assert.equal(eveRewardsLedger.unpaid.toNumber(), beforeEveRewardsLedger.unpaid.toNumber() + Math.trunc(finalEveStakedMvkRewardsAfterFees));
//           assert.equal(malloryRewardsLedger.unpaid.toNumber(), beforeMalloryRewardsLedger.unpaid.toNumber() + Math.trunc(finalMalloryStakedMvkRewardsAfterFees));

//       });

//   });



//   describe('updateConfig', () => {
    
//     const decimals                      : BigNumber = new BigNumber(100);
//     const alphaPercentPerThousand             : BigNumber = new BigNumber(2);

//     const devTriggerBanDuration         : BigNumber = new BigNumber(100);
//     const perThousandDeviationTrigger   : BigNumber = new BigNumber(100);
//     const percentOracleThreshold        : BigNumber = new BigNumber(100);
//     const heartBeatSeconds              : BigNumber = new BigNumber(100);

//     const requestRateDevDepositFee      : BigNumber = new BigNumber(100);
    
//     const deviationRewardStakedMvk      : BigNumber = new BigNumber(100);
//     const deviationRewardAmountXtz      : BigNumber = new BigNumber(100);
//     const rewardAmountXtz               : BigNumber = new BigNumber(100);
//     const rewardAmountStakedMvk         : BigNumber = new BigNumber(100);

//     it(
//       'should fail if called by random address',
//       async () => {

//         await signerFactory(david.sk);

//         const test_update_config_decimals_op = aggregator.methods.updateConfig(
//           decimals, "configDecimals"
//         );
//         await chai.expect(test_update_config_decimals_op.send()).to.be.rejectedWith();

//         const test_update_config_alphaPercentPerThousand_op = aggregator.methods.updateConfig(
//           alphaPercentPerThousand, "configAlphaPercentPerThousand"
//         );
//         await chai.expect(test_update_config_alphaPercentPerThousand_op.send()).to.be.rejectedWith();


//         const test_update_config_percentOracleThreshold_op = aggregator.methods.updateConfig(
//           percentOracleThreshold, "configPercentOracleThreshold"
//         );
//         await chai.expect(test_update_config_percentOracleThreshold_op.send()).to.be.rejectedWith();

//         const test_update_config_heartBeatSeconds_op = aggregator.methods.updateConfig(
//           heartBeatSeconds, "configHeartBeatSeconds"
//         );
//         await chai.expect(test_update_config_heartBeatSeconds_op.send()).to.be.rejectedWith();



//         const test_update_config_deviationRewardStakedMvk_op = aggregator.methods.updateConfig(
//           deviationRewardStakedMvk, "configDeviationRewardStakedMvk"
//         );
//         await chai.expect(test_update_config_deviationRewardStakedMvk_op.send()).to.be.rejectedWith();

//         const test_update_config_deviationRewardAmountXtz_op = aggregator.methods.updateConfig(
//           deviationRewardAmountXtz, "configDeviationRewardAmountXtz"
//         );
//         await chai.expect(test_update_config_deviationRewardAmountXtz_op.send()).to.be.rejectedWith();

//         const test_update_config_rewardAmountXtz_op = aggregator.methods.updateConfig(
//           rewardAmountXtz, "configRewardAmountXtz"
//         );
//         await chai.expect(test_update_config_rewardAmountXtz_op.send()).to.be.rejectedWith();

//         const test_update_config_rewardAmountStakedMvk_op = aggregator.methods.updateConfig(
//           rewardAmountStakedMvk, "configRewardAmountStakedMvk"
//         );
//         await chai.expect(test_update_config_rewardAmountStakedMvk_op.send()).to.be.rejectedWith();
        
//       },

//     );

//     it(
//       'should update aggregator config',
//       async () => {
//         await signerFactory(bob.sk);

//         const test_update_config_decimals_op = await aggregator.methods.updateConfig(
//           decimals, "configDecimals"
//         ).send();
//         await test_update_config_decimals_op.confirmation();

//         const test_update_config_alphaPercentPerThousand_op = await aggregator.methods.updateConfig(
//           alphaPercentPerThousand, "configAlphaPercentPerThousand"
//         ).send();
//         await test_update_config_alphaPercentPerThousand_op.confirmation();

        
//         const test_update_config_percentOracleThreshold_op = await aggregator.methods.updateConfig(
//           percentOracleThreshold, "configPercentOracleThreshold"
//         ).send();
//         await test_update_config_percentOracleThreshold_op.confirmation();

//         const test_update_config_heartBeatSeconds_op = await aggregator.methods.updateConfig(
//           heartBeatSeconds, "configHeartBeatSeconds"
//         ).send();
//         await test_update_config_heartBeatSeconds_op.confirmation();


//         const test_update_config_rewardAmountXtz_op = await aggregator.methods.updateConfig(
//           rewardAmountXtz, "configRewardAmountXtz"
//         ).send();
//         await test_update_config_rewardAmountXtz_op.confirmation();

//         const test_update_config_rewardAmountStakedMvk_op = await aggregator.methods.updateConfig(
//           rewardAmountStakedMvk, "configRewardAmountStakedMvk"
//         ).send();
//         await test_update_config_rewardAmountStakedMvk_op.confirmation();

//         const storage: aggregatorStorageType = await aggregator.storage();
//         assert.deepEqual(storage.config.decimals,                        decimals);
//         assert.deepEqual(storage.config.alphaPercentPerThousand,         alphaPercentPerThousand);

//         assert.deepEqual(storage.config.percentOracleThreshold,          percentOracleThreshold);
//         assert.deepEqual(storage.config.heartBeatSeconds,                heartBeatSeconds);

//         assert.deepEqual(storage.config.rewardAmountXtz,                 rewardAmountXtz);
//         assert.deepEqual(storage.config.rewardAmountStakedMvk,           rewardAmountStakedMvk);
        
//       },

//     );

//   });

//   describe('setAdmin', () => {
//     it(
//       'should fail if called by random address',
//       async () => {
//         await signerFactory(david.sk);

//         const op = aggregator.methods.setAdmin(
//           bob.pkh
//         );

//         // await chai.expect(op.send()).rejects.toThrow(
//         //   'Only owner can do this action'
//         // );
//         await chai.expect(op.send()).to.be.rejectedWith();
//       },

//     );

//     it(
//       'should update oracle admin',
//       async () => {
//         await signerFactory(bob.sk);

//         const op = aggregator.methods.setAdmin(
//           bob.pkh
//         );

//         const tx = await op.send();
//         await tx.confirmation();

//         const storage: aggregatorStorageType = await aggregator.storage();
//         assert.deepEqual(storage.admin,bob.pkh);
//         },

//       );
//     });

//   describe('setGovernance', () => {
//     it(
//       'should fail if called by random address',
//       async () => {
//         await signerFactory(david.sk);

//         const op = aggregator.methods.setGovernance(
//           bob.pkh
//         );

//         await chai.expect(op.send()).to.be.rejectedWith();
//       },

//     );

//     it(
//       'should update contract governance',
//       async () => {
//         await signerFactory(bob.sk);

//         const op = aggregator.methods.setGovernance(
//           bob.pkh
//         );

//         const tx = await op.send();
//         await tx.confirmation();

//         const storage: aggregatorStorageType = await aggregator.storage();
//         assert.deepEqual(storage.governanceAddress,bob.pkh);
//         },

//       );
//     });

//   describe('setName', () => {
//     it(
//       'should fail if called by random address',
//       async () => {
//         await signerFactory(david.sk);

//         const op = aggregator.methods.setName(
//           "newName"
//         );

//         await chai.expect(op.send()).to.be.rejectedWith();
//       },

//     );

//     it(
//       'should update contract name',
//       async () => {
//         await signerFactory(bob.sk);

//         const op = aggregator.methods.setName(
//           "newName"
//         );

//         const tx = await op.send();
//         await tx.confirmation();

//         const storage: aggregatorStorageType = await aggregator.storage();
//         assert.deepEqual(storage.governanceAddress,bob.pkh);
//         },

//       );
//     });

//     describe('updateMetadata', () => {
//       it(
//         'should fail if called by random address',
//         async () => {
//           await signerFactory(david.sk);
  
//           // Initial values
//           const key   = ''
//           const hash  = Buffer.from('tezos-storage:data', 'ascii').toString('hex')
          
//           const op = aggregator.methods.updateMetadata(
//             key, hash
//           );
  
//           await chai.expect(op.send()).to.be.rejectedWith();
//         },
  
//       );
  
//       it(
//         'should update contract metadata',
//         async () => {
//           await signerFactory(bob.sk);
  
//           // Initial values
//           const key   = ''
//           const hash  = Buffer.from('tezos-storage:data', 'ascii').toString('hex')
          
//           const op = aggregator.methods.updateMetadata(
//             key, hash
//           );
  
//           const tx = await op.send();
//           await tx.confirmation();
  
//           const storage: aggregatorStorageType = await aggregator.storage();
//           const updatedData              = await storage.metadata.get(key);
//           assert.equal(updatedData, hash);
  
//           },
  
//         );
//       });


//   describe('updateWhitelistContracts', () => {
//     it(
//       'should fail if called by random address',
//       async () => {
//         await signerFactory(david.sk);

//         const op = aggregator.methods.updateWhitelistContracts(
//           "testContract", david.pkh
//         );

//         await chai.expect(op.send()).to.be.rejectedWith();
//       },

//     );

//     it(
//       'should update whitelist contracts',
//       async () => {
//         await signerFactory(bob.sk);

//         const op = aggregator.methods.updateWhitelistContracts(
//           "testContract", david.pkh
//         );

//         const tx = await op.send();
//         await tx.confirmation();

//         const storage: aggregatorStorageType = await aggregator.storage();
//         const whitelistTestContract = await storage.whitelistContracts.get("testContract");
//         assert.deepEqual(whitelistTestContract, david.pkh);
//         },

//       );
//     });

//   describe('updateGeneralContracts', () => {
//     it(
//       'should fail if called by random address',
//       async () => {
//         await signerFactory(david.sk);

//         const op = aggregator.methods.updateGeneralContracts(
//           "testContract", david.pkh
//         );

//         await chai.expect(op.send()).to.be.rejectedWith();
//       },

//     );

//     it(
//       'should update general contracts',
//       async () => {
//         await signerFactory(bob.sk);

//         const op = aggregator.methods.updateGeneralContracts(
//           "testContract", david.pkh
//         );

//         const tx = await op.send();
//         await tx.confirmation();

//         const storage: aggregatorStorageType = await aggregator.storage();
//         const generalTestContract = await storage.generalContracts.get("testContract");
//         assert.deepEqual(generalTestContract, david.pkh);
//         },

//       );
//     });

//   describe('pause and unpause', () => {
//     it(
//       'should fail if called by random address',
//       async () => {
//         await signerFactory(david.sk);

//         const op_pause_all = aggregator.methods.pauseAll();
//         await chai.expect(op_pause_all.send()).to.be.rejectedWith();

//         const op_unpause_all = aggregator.methods.unpauseAll();
//         await chai.expect(op_unpause_all.send()).to.be.rejectedWith();

//         // todo: other single entrypoints toggle pause to be refactored into one entrypoint
//       },

//     );

//     it(
//       'should pause or unpause entrypoints',
//       async () => {
//         await signerFactory(bob.sk);

//         const op_pause_all = aggregator.methods.pauseAll();

//         const pause_all_tx = await op_pause_all.send();
//         await pause_all_tx.confirmation();

//         const storage: aggregatorStorageType = await aggregator.storage();
//         const breakGlassConfig = await storage.breakGlassConfig;
//         assert.equal(breakGlassConfig.updateDataIsPaused, true);
//         assert.equal(breakGlassConfig.withdrawRewardXtzIsPaused, true);
//         assert.equal(breakGlassConfig.withdrawRewardStakedMvkIsPaused, true);

//         const op_unpause_all = aggregator.methods.unpauseAll();

//         const unpause_all_tx = await op_unpause_all.send();
//         await unpause_all_tx.confirmation();

//         const updatedStorage: aggregatorStorageType = await aggregator.storage();
//         const updatedBreakGlassConfig = await updatedStorage.breakGlassConfig;
//         assert.equal(updatedBreakGlassConfig.updateDataIsPaused, false);
//         assert.equal(updatedBreakGlassConfig.withdrawRewardXtzIsPaused, false);
//         assert.equal(updatedBreakGlassConfig.withdrawRewardStakedMvkIsPaused, false);
//         },

//       );
//     });

//   describe('setLambda', () => {
//     it(
//       'should fail if called by random address',
//       async () => {
//         await signerFactory(david.sk);

//         const bytes  = Buffer.from('tezos-storage:data', 'ascii').toString('hex')
//         const op = aggregator.methods.setLambda(
//           "testSetLambda", bytes
//         );

//         await chai.expect(op.send()).to.be.rejectedWith();
//       },

//     );

//   });
  

// });