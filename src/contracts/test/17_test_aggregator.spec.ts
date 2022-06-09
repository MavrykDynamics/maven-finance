// import {createHash} from "crypto";

// const chai = require("chai");
// const { InMemorySigner } = require("@taquito/signer");
// const chaiAsPromised = require('chai-as-promised');

// import assert, { ok, rejects, strictEqual } from "assert";
// import { Utils } from "./helpers/Utils";
// import BigNumber from 'bignumber.js';
// import { packDataBytes, MichelsonData, MichelsonType } from '@taquito/michel-codec';
// import { bob, alice, eve, mallory, david, trudy, susie } from "../scripts/sandbox/accounts";
// import aggregatorAddress from '../deployments/aggregatorAddress.json';
// import { aggregatorStorageType } from './types/aggregatorStorageType';

// chai.use(chaiAsPromised);
// chai.should();

// function wait(ms: number) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// describe('Aggregator', async () => {
//   const salt = 'azerty'; // same salt for all commit/reveal to avoid to store
//   var utils: Utils;
//   let aggregator;

//   const signerFactory = async (pk) => {
//     await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
//     return utils.tezos;
//   };

//   before("setup", async () => {
//     console.log('-- -- -- -- -- Aggregator Tests -- -- -- --')
//     utils = new Utils();
//     await utils.init(bob.sk);

//     aggregator = await utils.tezos.contract.at(aggregatorAddress.address);
//   });

//   describe('AddOracle', () => {

//     it(
//       'should fail if called by random address',
//       async () => {
//         await signerFactory(david.sk);

//         const op = aggregator.methods.addOracle(
//           susie.pkh
//         );

//         await chai.expect(op.send()).to.be.rejectedWith();
//       },

//     );

//     it(
//       'should fail if oracle already registered',
//       async () => {
//         await signerFactory(bob.sk);

//         const op = aggregator.methods.addOracle(bob.pkh);

//         // await chai.expect(op.send()).rejects.toThrow("You can't add an already present whitelisted oracle");
//         await chai.expect(op.send()).to.be.rejectedWith();

//       });

//     it(
//       'should add susie',
//       async () => {
//         await signerFactory(bob.sk);

//         const op = aggregator.methods.addOracle(
//           susie.pkh
//           );

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

//   describe('RequestRateUpdate', () => {
//     it(
//       'should fail if called by random address',
//       async () => {
//         await signerFactory(david.sk);


//         const op = aggregator.methods.requestRateUpdate();

//         // await chai.expect(op.send()).rejects.toThrow(
//         //   'Only maintainer can do this action'
//         // );
//         await chai.expect(op.send()).to.be.rejectedWith();
//       },

//     );

//     it(
//       'should increment round',
//       async () => {
//         await signerFactory(bob.sk);


//         const previousStorage: aggregatorStorageType = await aggregator.storage();
//         const previousRound = previousStorage.round;

//         const op = aggregator.methods.requestRateUpdate();
//         const tx = await op.send();
//         await tx.confirmation();

//         const storage: aggregatorStorageType = await aggregator.storage();

//         assert.deepEqual(storage.round,previousRound.plus(1));
//         assert.deepEqual(storage.switchBlock,new BigNumber(0));
//         assert.deepEqual(storage.deviationTriggerInfos.amount,new BigNumber(0));
//         assert.deepEqual(storage.deviationTriggerInfos.roundPrice,
//           new BigNumber(0)
//         );
//         assert.deepEqual(storage.observationCommits.size,0);
//         assert.deepEqual(storage.observationReveals.size,0);
//         assert.deepEqual(storage.switchBlock,new BigNumber(0));
//       },

//     );
//   });



//   describe('SetObservationCommit', () => {
//     it(
//       'should fail if called by random address',
//       async () => {
//         await signerFactory(david.sk);


//         const hash = createHash('sha256')
//             .update('1234', 'hex')
//             .digest('hex');
//         const op = aggregator.methods.setObservationCommit(
//           new BigNumber(10),
//           hash
//         );

//         // await chai.expect(op.send()).rejects.toThrow(
//         //   'Only authorized oracle contract can do this action'
//         // );
//         await chai.expect(op.send()).to.be.rejectedWith();
//       },

//     );

//     it(
//       'should set observation commit as bob',
//       async () => {
//         await signerFactory(bob.sk);

//         const beforeStorage: aggregatorStorageType = await aggregator.storage();
//         const round = beforeStorage.round;
//         const price = new BigNumber(123);
//         const data: MichelsonData = {
//           prim: 'Pair',
//           args: [
//             { prim: 'Pair', args: [{ int: price.toString() }, { string: salt }] },
//             { string: bob.pkh },
//           ],
//         };
//         const type: MichelsonType = {
//           prim: 'pair',
//           args: [
//             { prim: 'pair', args: [{ prim: 'nat' }, { prim: 'string' }] },
//             { prim: 'address' },
//           ],
//         };
//         const priceCodec = packDataBytes(data, type);

//         const hash = createHash('sha256')
//             .update(priceCodec.bytes, 'hex')
//             .digest('hex');
//         const op = aggregator.methods.setObservationCommit(round, hash);

//         const tx = await op.send();
//         await tx.confirmation();

//         const storage: aggregatorStorageType = await aggregator.storage();
//         assert.deepEqual(storage.observationCommits?.has(bob.pkh),true);
//         assert.deepEqual(storage.observationCommits?.get(bob.pkh),hash);
//         assert.deepEqual(storage.switchBlock,new BigNumber(0));
//         // The round should not be considered as completed yet (only 1/3 oracle sent an observation)
//         assert.notDeepEqual(storage.lastCompletedRoundPrice.round,round);
//       },

//     );

//     it(
//       'should set observation commit as eve',
//       async () => {
//         await signerFactory(eve.sk);

//         const beforeStorage: aggregatorStorageType = await aggregator.storage();
//         const round = beforeStorage.round;
//         const price = new BigNumber(123);
//         const data: MichelsonData = {
//           prim: 'Pair',
//           args: [
//             { prim: 'Pair', args: [{ int: price.toString() }, { string: salt }] },
//             { string: eve.pkh },
//           ],
//         };
//         const type: MichelsonType = {
//           prim: 'pair',
//           args: [
//             { prim: 'pair', args: [{ prim: 'nat' }, { prim: 'string' }] },
//             { prim: 'address' },
//           ],
//         };
//         const priceCodec = packDataBytes(data, type);
//         const hash = createHash('sha256')
//             .update(priceCodec.bytes, 'hex')
//             .digest('hex');
//         const op = aggregator.methods.setObservationCommit(round, hash);

//         const tx = await op.send();
//         await tx.confirmation();

//         const storage: aggregatorStorageType = await aggregator.storage();
//         assert.deepEqual(storage.observationCommits?.has(eve.pkh),true);
//         assert.deepEqual(storage.observationCommits?.get(eve.pkh),hash);
//         assert.notDeepEqual(storage.switchBlock,new BigNumber(0));
//       },

//     );

//     it(
//       'should set observation commit as mallory',
//       async () => {
//         await signerFactory(mallory.sk);


//         const beforeStorage: aggregatorStorageType = await aggregator.storage();

//         const round = beforeStorage.round;
//         const price = new BigNumber(123);
//         const data: MichelsonData = {
//           prim: 'Pair',
//           args: [
//             { prim: 'Pair', args: [{ int: price.toString() }, { string: salt }] },
//             { string: mallory.pkh },
//           ],
//         };
//         const type: MichelsonType = {
//           prim: 'pair',
//           args: [
//             { prim: 'pair', args: [{ prim: 'nat' }, { prim: 'string' }] },
//             { prim: 'address' },
//           ],
//         };
//         const priceCodec = packDataBytes(data, type);
//         const hash = createHash('sha256')
//             .update(priceCodec.bytes, 'hex')
//             .digest('hex');
//         const op = aggregator.methods.setObservationCommit(round, hash);

//         const tx = await op.send();
//         await tx.confirmation();

//         const storage: aggregatorStorageType = await aggregator.storage();
//         assert.deepEqual(storage.observationCommits?.has(mallory.pkh),true);
//         assert.deepEqual(storage.observationCommits?.get(mallory.pkh),hash);
//         assert.notDeepEqual(storage.switchBlock,new BigNumber(0));
//       },

//     );

//     it(
//       'should fail if bob try to reveal too soon',
//       async () => {
//         await signerFactory(bob.sk);

//         const beforeStorage: aggregatorStorageType = await aggregator.storage();
//         const round = beforeStorage.round;
//         const op = aggregator.methods.setObservationReveal(
//           round,
//           new BigNumber(123),
//           salt,
//           bob.pkh
//         );

//         // await chai.expect(op.send()).rejects.toThrow('You cannot reveal now');
//         await chai.expect(op.send()).to.be.rejectedWith();

//       },

//     );
//   });

//   describe('SetObservationReveal', () => {
//     before("Waiting",async () => {
//       console.log('Waiting for 2 blocks (1min)');
//       await wait(2 * 60 * 1000);
//       console.log('Waiting Finished');
//     });

//     it(
//       'should fail if someone commit too late',
//       async () => {
//         await signerFactory(bob.sk);


//         const hash = createHash('sha256')
//             .update('1234', 'hex')
//             .digest('hex');
//         const op = aggregator.methods.setObservationCommit(
//           new BigNumber(10),
//           hash
//         );

//         // await chai.expect(op.send()).rejects.toThrow('You cannot commit now');
//         await chai.expect(op.send()).to.be.rejectedWith();
//       },

//     );

//     it(
//       'should fail if called by random address',
//       async () => {
//         await signerFactory(david.sk);

//         const op = aggregator.methods.setObservationReveal(
//           new BigNumber(10),      // roundId
//           new BigNumber(123),     // priceSalted.0 -> price
//           salt,                    // priceSalted.1 -> salt
//           david.pkh
//         );

//         // await chai.expect(op.send()).rejects.toThrow(
//         //   'Only authorized oracle contract can do this action'
//         // );
//         await chai.expect(op.send()).to.be.rejectedWith();

//       },

//     );

//     it(
//       'should fail if with wrong round number',
//       async () => {
//         await signerFactory(bob.sk);

//         const beforeStorage: aggregatorStorageType = await aggregator.storage();
//         const round = beforeStorage.round;

//         const op = aggregator.methods.setObservationReveal(
//           round.minus(1),
//           new BigNumber(123),
//           salt,
//           bob.pkh
//         );

//         // await chai.expect(op.send()).rejects.toThrow('Wrong round number');
//         await chai.expect(op.send()).to.be.rejectedWith();

//       },

//     );

//     it(
//       'should set observation reveal as bob',
//       async () => {
//         await signerFactory(bob.sk);


//         const beforeStorage: aggregatorStorageType = await aggregator.storage();

//         const round = beforeStorage.round;
//         const price = new BigNumber(123);

//         const op = aggregator.methods.setObservationReveal(round, price, salt, bob.pkh);

//         const tx = await op.send();
//         await tx.confirmation();

//         const storage: aggregatorStorageType = await aggregator.storage();
//         assert.deepEqual(storage.observationReveals?.has(bob.pkh),true);
//         assert.deepEqual(storage.observationReveals?.get(bob.pkh),price);
//         // The round should not be considered as completed yet (only 1/3 oracle sent an observation)
//         assert.notDeepEqual(storage.lastCompletedRoundPrice.round,round);
//       },

//     );

//     it(
//       'should fail if reveal already did',
//       async () => {
//         await signerFactory(bob.sk);

//         const beforeStorage: aggregatorStorageType = await aggregator.storage();
//         const round = beforeStorage.round;

//         const op = aggregator.methods.setObservationReveal(
//           new BigNumber(123),
//           round,
//           salt,
//           bob.pkh
//         );

//         // await chai.expect(op.send()).rejects.toThrow(
//         //   'Oracle already answer a reveal'
//         // );
//         await chai.expect(op.send()).to.be.rejectedWith();
//       },

//     );

//     it(
//       'should set observation reveal as eve',
//       async () => {
//         await signerFactory(eve.sk);


//         const beforeStorage: aggregatorStorageType = await aggregator.storage();

//         const round = beforeStorage.round;
//         const price = new BigNumber(123);

//         const op = aggregator.methods.setObservationReveal(round, price, salt,eve.pkh);

//         const tx = await op.send();
//         await tx.confirmation();

//         const storage: aggregatorStorageType = await aggregator.storage();
//         assert.deepEqual(storage.observationReveals?.has(eve.pkh),true);
//         assert.deepEqual(storage.observationReveals?.get(eve.pkh),price);
//       },

//     );

//     it(
//       'should set observation reveal as mallory',
//       async () => {
//         await signerFactory(mallory.sk);


//         const beforeStorage: aggregatorStorageType = await aggregator.storage();

//         const round = beforeStorage.round;
//         const price = new BigNumber(123);

//         const op = aggregator.methods.setObservationReveal(round, price, salt,mallory.pkh);
//         const tx = await op.send();
//         await tx.confirmation();

//         const storage: aggregatorStorageType = await aggregator.storage();
//         assert.deepEqual(storage.observationReveals?.has(mallory.pkh),true);
//         assert.deepEqual(storage.observationReveals?.get(mallory.pkh),price);
//         // The round should be considered as completed (3/3 oracle sent an observation)
//         assert.notDeepEqual(storage.switchBlock,new BigNumber(0));
//         assert.deepEqual(storage.lastCompletedRoundPrice.round,storage.round);
//         assert.deepEqual(storage.lastCompletedRoundPrice.price,price);

//       },

//     );
//   });

//   describe('requestRateUpdateDeviation', () => {
//     it(
//       'should fail because no tezos sent',
//       async () => {
//         await signerFactory(eve.sk);

//         const previousStorage: aggregatorStorageType = await aggregator.storage();
//         const roundId = new BigNumber(previousStorage.round);
//         const price = new BigNumber(200);
//         const data: MichelsonData = {
//           prim: 'Pair',
//           args: [
//             { prim: 'Pair', args: [{ int: price.toString() }, { string: salt }] },
//             { string: eve.pkh },
//           ],
//         };
//         const type: MichelsonType = {
//           prim: 'pair',
//           args: [
//             { prim: 'pair', args: [{ prim: 'nat' }, { prim: 'string' }] },
//             { prim: 'address' },
//           ],
//         };
//         const priceCodec = packDataBytes(data, type);
//         const hash = createHash('sha256')
//             .update(priceCodec.bytes, 'hex')
//             .digest('hex');
//         const op = aggregator.methods.requestRateUpdateDeviation(
//           new BigNumber(roundId).plus(1),
//           hash
//         );

//         // await chai.expect(op.send()).rejects.toThrow(
//         //   'You should send XTZ to call this entrypoint'
//         // );
//         await chai.expect(op.send()).to.be.rejectedWith();

//       },

//     );

//     it(
//       'should trigger a new requestRateUpdateDeviation as mallory',
//       async () => {
//         await signerFactory(mallory.sk);

//         const previousStorage: aggregatorStorageType = await aggregator.storage();
//         const roundId = previousStorage.round;
//         const price = new BigNumber(200);
//         const data: MichelsonData = {
//           prim: 'Pair',
//           args: [
//             { prim: 'Pair', args: [{ int: price.toString() }, { string: salt }] },
//             { string: mallory.pkh },
//           ],
//         };
//         const type: MichelsonType = {
//           prim: 'pair',
//           args: [
//             { prim: 'pair', args: [{ prim: 'nat' }, { prim: 'string' }] },
//             { prim: 'address' },
//           ],
//         };
//         const priceCodec = packDataBytes(data, type);
//         const hash = createHash('sha256')
//             .update(priceCodec.bytes, 'hex')
//             .digest('hex');
//         const op = aggregator.methods.requestRateUpdateDeviation(
//           roundId.plus(1),
//           hash
//         );
//           const tx = await op.send({ amount: 1 });
//           await tx.confirmation();

//         const storage: aggregatorStorageType = await aggregator.storage();
//         assert.deepEqual(storage.round,roundId.plus(1));
//         assert.deepEqual(storage.observationCommits?.has(mallory.pkh),true);
//         assert.deepEqual(storage.observationCommits?.get(mallory.pkh),hash);
//       },

//     );

//     it(
//       'should fail because requestRateUpdateDeviation already requested',
//       async () => {
//         await signerFactory(eve.sk);

//         const previousStorage: aggregatorStorageType = await aggregator.storage();
//         const roundId = new BigNumber(previousStorage.round);
//         const price = 2000;
//         const data: MichelsonData = {
//           prim: 'Pair',
//           args: [
//             { prim: 'Pair', args: [{ int: price.toString() }, { string: salt }] },
//             { string: eve.pkh },
//           ],
//         };
//         const type: MichelsonType = {
//           prim: 'pair',
//           args: [
//             { prim: 'pair', args: [{ prim: 'nat' }, { prim: 'string' }] },
//             { prim: 'address' },
//           ],
//         };
//         const priceCodec = packDataBytes(data, type);
//         const hash = createHash('sha256')
//             .update(priceCodec.bytes, 'hex')
//             .digest('hex');
//         const op = aggregator.methods.requestRateUpdateDeviation(
//           new BigNumber(roundId).plus(1),
//           hash
//         );

//         // await chai.expect(op.send({ amount: 1 })).rejects.toThrow(
//         //   'Last round is not completed'
//         // );
//         await chai.expect(op.send()).to.be.rejectedWith();

//       },

//     );

//     it(
//       'should set observation commit as eve',
//       async () => {
//         await signerFactory(eve.sk);

//         const beforeStorage: aggregatorStorageType = await aggregator.storage();
//         const round = beforeStorage.round;
//         const price = new BigNumber(200);
//         const data: MichelsonData = {
//           prim: 'Pair',
//           args: [
//             { prim: 'Pair', args: [{ int: price.toString() }, { string: salt }] },
//             { string: eve.pkh },
//           ],
//         };
//         const type: MichelsonType = {
//           prim: 'pair',
//           args: [
//             { prim: 'pair', args: [{ prim: 'nat' }, { prim: 'string' }] },
//             { prim: 'address' },
//           ],
//         };
//         const priceCodec = packDataBytes(data, type);
//         const hash = createHash('sha256')
//             .update(priceCodec.bytes, 'hex')
//             .digest('hex');
//         const op = aggregator.methods.setObservationCommit(round, hash);
//         const tx = await op.send();
//         await tx.confirmation();

//         const storage: aggregatorStorageType = await aggregator.storage();
//         assert.deepEqual(storage.observationCommits?.has(eve.pkh),true);
//         assert.deepEqual(storage.observationCommits?.get(eve.pkh),hash);
//       },

//     );

//     it(
//       'should wait 2min',
//       async () => {
//         await wait(2 * 60 * 1000);
//       },
//     );

//     it(
//       'should set observation reveal as eve',
//       async () => {
//         await signerFactory(eve.sk);


//         const beforeStorage: aggregatorStorageType = await aggregator.storage();

//         const round = beforeStorage.round;
//         const price = new BigNumber(200);

//         const op = aggregator.methods.setObservationReveal(round, price, salt,eve.pkh);

//         const tx = await op.send();
//         await tx.confirmation();

//         const storage: aggregatorStorageType = await aggregator.storage();
//         assert.deepEqual(storage.observationReveals?.has(eve.pkh),true);
//         assert.deepEqual(storage.observationReveals?.get(eve.pkh),price);
//       },

//     );

//     it(
//       'should set observation reveal as mallory',
//       async () => {
//         await signerFactory(mallory.sk);


//         const beforeStorage: aggregatorStorageType = await aggregator.storage();

//         const round = beforeStorage.round;
//         const price = new BigNumber(200);

//         const op = aggregator.methods.setObservationReveal(round, price, salt,mallory.pkh);

//         const tx = await op.send();
//         await tx.confirmation();

//         const storage: aggregatorStorageType = await aggregator.storage();
//         assert.deepEqual(storage.observationReveals?.has(mallory.pkh),true);
//         assert.deepEqual(storage.observationReveals?.get(mallory.pkh),price);
//       },

//     );
//   });

//   describe('requestRateUpdateDeviation should fail', () => {
//     it(
//       'should trigger a new requestRateUpdateDeviation as david',
//       async () => {
//         await signerFactory(david.sk);

//         const previousBalanceMallory = await utils.tezos.tz.getBalance(
//           mallory.pkh
//         );
//         const previousBalanceEve = await utils.tezos.tz.getBalance(
//             eve.pkh
//           );
//         const previousStorage: aggregatorStorageType = await aggregator.storage();
//         const roundId = previousStorage.round;
//         const price = new BigNumber(200);
//         const data: MichelsonData = {
//           prim: 'Pair',
//           args: [
//             { prim: 'Pair', args: [{ int: price.toString() }, { string: salt }] },
//             { string: david.pkh },
//           ],
//         };
//         const type: MichelsonType = {
//           prim: 'pair',
//           args: [
//             { prim: 'pair', args: [{ prim: 'nat' }, { prim: 'string' }] },
//             { prim: 'address' },
//           ],
//         };
//         const priceCodec = packDataBytes(data, type);
//         const hash = createHash('sha256')
//             .update(priceCodec.bytes, 'hex')
//             .digest('hex');

//         const op = aggregator.methods['requestRateUpdateDeviation'](
//           roundId.plus(1),
//           hash
//         );
//         const tx = await op.send({ amount: 1 });
//         await tx.confirmation();

//         const storage: aggregatorStorageType = await aggregator.storage();
//         const BalanceMallory = await utils.tezos.tz.getBalance(
//           mallory.pkh
//         );
//         const BalanceEve = await utils.tezos.tz.getBalance(
//             eve.pkh
//           );
//         assert.deepEqual(storage.round,roundId.plus(1));
//         assert.deepEqual(storage.lastCompletedRoundPrice.price,new BigNumber(200));
//         assert.deepEqual(BalanceMallory,previousBalanceMallory.plus(2600 + 1));
//         assert.deepEqual(BalanceEve,previousBalanceEve.plus(1));

//       },

//     );

//     it(
//       'should set observation commit as eve',
//       async () => {
//         await signerFactory(eve.sk);

//         const beforeStorage: aggregatorStorageType = await aggregator.storage();
//         const round = beforeStorage.round;
//         const price = new BigNumber(200);
//         const data: MichelsonData = {
//           prim: 'Pair',
//           args: [
//             { prim: 'Pair', args: [{ int: price.toString() }, { string: salt }] },
//             { string: eve.pkh },
//           ],
//         };
//         const type: MichelsonType = {
//           prim: 'pair',
//           args: [
//             { prim: 'pair', args: [{ prim: 'nat' }, { prim: 'string' }] },
//             { prim: 'address' },
//           ],
//         };
//         const priceCodec = packDataBytes(data, type);
//         const hash = createHash('sha256')
//             .update(priceCodec.bytes, 'hex')
//             .digest('hex');
//         const op = aggregator.methods.setObservationCommit(round, hash);
//         const tx = await op.send();
//         await tx.confirmation();

//         const storage: aggregatorStorageType = await aggregator.storage();
//         assert.deepEqual(storage.observationCommits?.has(eve.pkh),true);
//         assert.deepEqual(storage.observationCommits?.get(eve.pkh),hash);
//       },

//     );

//     it(
//       'should wait 2min',
//       async () => {
//         await wait(2 * 60 * 1000);
//       },
//     );

//     it(
//       'should set observation reveal as eve',
//       async () => {
//         await signerFactory(eve.sk);


//         const beforeStorage: aggregatorStorageType = await aggregator.storage();

//         const round = beforeStorage.round;
//         const price = new BigNumber(200);

//         const op = aggregator.methods.setObservationReveal(round, price, salt,eve.pkh);

//         const tx = await op.send();
//         await tx.confirmation();

//         const storage: aggregatorStorageType = await aggregator.storage();
//         assert.deepEqual(storage.observationReveals?.has(eve.pkh),true);
//         assert.deepEqual(storage.observationReveals?.get(eve.pkh),price);
//       },

//     );

//     it(
//       'should set observation reveal as david',
//       async () => {
//         await signerFactory(david.sk);


//         const beforeStorage: aggregatorStorageType = await aggregator.storage();

//         const round = beforeStorage.round;
//         const price = new BigNumber(200);

//         const op = aggregator.methods.setObservationReveal(round, price, salt,david.pkh);

//         const tx = await op.send();
//         await tx.confirmation();

//         const storage: aggregatorStorageType = await aggregator.storage();
//         assert.deepEqual(storage.observationReveals?.has(david.pkh),true);
//         assert.deepEqual(storage.observationReveals?.get(david.pkh),price);
//       },

//     );

//     it.skip(
//       'should requestRateUpdate + give not back the tezos amount',
//       async () => {
//         await signerFactory(bob.sk);

//         const previousBalancedavid = await utils.tezos.tz.getBalance(
//           david.pkh
//         );

//         const previousStorage: aggregatorStorageType = await aggregator.storage();
//         const previousRound = previousStorage.round;

//         const op = aggregator.methods.requestRateUpdate();
//         const tx = await op.send();
//         await tx.confirmation();

//         const storage: aggregatorStorageType = await aggregator.storage();
//         const Balancedavid = await utils.tezos.tz.getBalance(
//           david.pkh
//         );
//         assert.deepEqual(storage.round,previousRound.plus(1));
//         assert.deepEqual(Balancedavid,previousBalancedavid);
//       },

//     );
//   });

//   describe('updateConfig', () => {
//     const decimals: BigNumber = new BigNumber(100);
//     const percentOracleThreshold: BigNumber = new BigNumber(100);
//     const rewardAmountXTZ: BigNumber = new BigNumber(100);
//     const deviationRewardAmountXTZ: BigNumber = new BigNumber(100);
//     const rewardAmountMVK: BigNumber = new BigNumber(100);
//     const deviationTriggerBanTimestamp: BigNumber = new BigNumber(100);
//     const perthousandDeviationTrigger: BigNumber = new BigNumber(100);
//     const numberBlocksDelay: BigNumber = new BigNumber(2);
//     const maintainer: string = bob.pkh;
//     it(
//       'should fail if called by random address',
//       async () => {
//         await signerFactory(david.sk);


//         const op = aggregator.methods.updateConfig(
//           decimals,
//           deviationRewardAmountXTZ,
//           maintainer,
//           deviationTriggerBanTimestamp,
//           numberBlocksDelay,
//           perthousandDeviationTrigger,
//           percentOracleThreshold,
//           rewardAmountXTZ,
//           rewardAmountMVK
//         );

//         // await chai.expect(op.send()).rejects.toThrow(
//         //   'Only owner can do this action'
//         // );
//         await chai.expect(op.send()).to.be.rejectedWith();
//       },

//     );

//     it(
//       'should update oracle config',
//       async () => {
//         await signerFactory(bob.sk);


//         const op = aggregator.methods.updateConfig(
//           decimals,
//           deviationRewardAmountXTZ,
//           maintainer,
//           deviationTriggerBanTimestamp,
//           numberBlocksDelay,
//           perthousandDeviationTrigger,
//           percentOracleThreshold,
//           rewardAmountXTZ,
//           rewardAmountMVK
//         );

//         const tx = await op.send();
//         await tx.confirmation();

//         const storage: aggregatorStorageType = await aggregator.storage();
//         assert.deepEqual(storage.config.decimals,decimals);
//         assert.deepEqual(storage.config.percentOracleThreshold,percentOracleThreshold);
//         assert.deepEqual(storage.config.rewardAmountXtz,rewardAmountXTZ);
//         assert.deepEqual(storage.config.rewardAmountStakedMvk,rewardAmountMVK);
//         assert.deepEqual(storage.config.deviationRewardAmountXtz,deviationRewardAmountXTZ);
//         assert.deepEqual(storage.config.deviationTriggerBanTimestamp,deviationTriggerBanTimestamp);
//         assert.deepEqual(storage.config.maintainer,maintainer);

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

// });
