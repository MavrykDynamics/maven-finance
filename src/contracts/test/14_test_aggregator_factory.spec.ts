// import { TezosToolkit } from '@taquito/taquito';
// // import { AccountName, accountPerNetwork, accounts } from '../lib/accounts';
// import delegationAddress from '../deployments/delegationAddress.json';
// const chai = require("chai");
// const chaiAsPromised = require('chai-as-promised');
// import assert, { ok, rejects, strictEqual } from "assert";

// import BigNumber from 'bignumber.js';

// import { MichelsonMap } from '@taquito/michelson-encoder';


// chai.use(chaiAsPromised);   
// chai.should();
// import { bob, alice, eve, mallory, oscar, trudy, isaac, david, susie, ivan } from "../scripts/sandbox/accounts";
// import aggregatorFactoryAddress from '../deployments/aggregatorFactoryAddress.json';
// import { Utils } from './helpers/Utils';
// import { InMemorySigner } from '@taquito/signer';

// describe('AggregatorFactory', () => {
//   let aggregatorAddress: string;
//   let aggregatorFactory;
//   var utils: Utils;

//   const signerFactory = async (pk) => {
//     await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
//     return utils.tezos;
//   };

//   before("setup", async () => {
//     console.log('-- -- -- -- -- Aggregator Factory Tests -- -- -- --')
//     utils = new Utils();
//     await utils.init(bob.sk);

//     aggregatorFactory = await utils.tezos.contract.at(aggregatorFactoryAddress.address);
//   });

//   describe('deploy a new aggregator', () => {
//     it('should fail if called by random address', async () => {
//         await signerFactory(david.sk);

//       const op = aggregatorFactory.methods.createAggregator(
//         'USD',
//         'TEST',
//         MichelsonMap.fromLiteral({
//           [bob.pkh]: true,
//           [eve.pkh]: true,
//           [mallory.pkh]: true,
//           [oscar.pkh]: true,
//         }) as MichelsonMap<string, string>,
//         delegationAddress.address,
//         new BigNumber(0),
//         bob.pkh,
//         new BigNumber(1),
//         new BigNumber(2),
//         new BigNumber(60),
//         new BigNumber(5),
//         new BigNumber(10000),
//         new BigNumber(1),
//         aggregatorFactoryAddress.address
//       );
//     //   await expect(op.send()).rejects.toThrow('ONLY_ADMINISTRATOR_ALLOWED');
//     await chai.expect(op.send()).to.be.rejectedWith();

//     });
    
//     it('should create a new Aggregator', async () => {
//         await signerFactory(bob.sk);

//       const op = aggregatorFactory.methods.createAggregator(
//         'USD',
//         'TEST',
//         MichelsonMap.fromLiteral({
//           [bob.pkh]: true,
//           [eve.pkh]: true,
//           [mallory.pkh]: true,
//           [oscar.pkh]: true,
//         }) as MichelsonMap<string, string>,
//         delegationAddress.address,
//         new BigNumber(0),
//         bob.pkh,
//         new BigNumber(1),
//         new BigNumber(2),
//         new BigNumber(60),
//         new BigNumber(5),
//         new BigNumber(10000),
//         new BigNumber(1),
//         aggregatorFactoryAddress.address
//       );

//         const tx = await op.send();
//         await tx.confirmation();

//       const aggregatorFactoryStorage = await aggregatorFactory.storage();
  
//       aggregatorAddress = aggregatorFactoryStorage.trackedAggregators.get({
//         0: 'USD',
//         1: 'TEST',
//       }) as string;
//       assert.notDeepEqual(aggregatorAddress,null);
//       console.log({aggregatorAddress})

//     });

//   });
  
//   describe('AddSatellite', () => {
//     it('should fail if called by random address', async () => {
//         await signerFactory(david.sk);

//         const op = aggregatorFactory.methods.addSatellite(trudy.pkh);
//         await chai.expect(op.send()).to.be.rejectedWith();
//     });

//     it('should add trudy', async () => {
//         await signerFactory(bob.sk);

//         const op = aggregatorFactory.methods.addSatellite(trudy.pkh);
//         try {

//             const tx = await op.send();
//             await tx.confirmation();
//         } catch (e){
//             console.dir(e, {depth: 5})
//         }

//       const storageAggregatorFactory = await aggregatorFactory.storage();
//       assert.deepEqual(storageAggregatorFactory.trackedSatellites.includes(trudy.pkh),true);

//       const aggregatorAddresses = Array.from(storageAggregatorFactory.trackedAggregators.values());
//       aggregatorAddresses.forEach(async element => {
//         let aggregator = await utils.tezos.contract.at(element as string);

//         const storageAggregator = await aggregator.storage() as any;
//         assert.deepEqual(storageAggregator.oracleAddresses.has(trudy.pkh),true);

//       });
//     });
//   });

// //   describe('banSatellite', () => {
// //     it(
// //       'should fail if called by random address',
// //       async () => {
// //         const aggregatorFactory =
// //           await tezosToolkits.david.contract.at<AggregatorFactoryContractAbstraction>(
// //             aggregatorFactoryAddress
// //           );

// //         const op = aggregatorFactory.methods.banSatellite(accounts.trudy.pkh);
// //         await expect(op.send()).rejects.toThrow('ONLY_ADMINISTRATOR_ALLOWED');
// //       },
// //       timeoutMS
// //     );

// //     it('should fail if satellite is not already registered', async () => {
// //       const aggregatorFactory =
// //         await tezosToolkits.alice.contract.at<AggregatorFactoryContractAbstraction>(
// //           aggregatorFactoryAddress
// //         );

// //       const op = aggregatorFactory.methods.banSatellite(accounts.susie.pkh);
// //       await expect(op.send()).rejects.toThrow("You can't perform things on a not registered satellite");
// //     }, timeoutMS);

// //     it('should add trudy', async () => {
// //       const aggregatorFactory =
// //         await tezosToolkits.alice.contract.at<AggregatorFactoryContractAbstraction>(
// //           aggregatorFactoryAddress
// //         );

// //       const op = aggregatorFactory.methods.banSatellite(accounts.trudy.pkh);
// //       const tx = await op.send();
// //       await tx.confirmation();

// //       const storageAggregatorFactory: AggregatorFactoryStorage = await aggregatorFactory.storage();
// //       expect(storageAggregatorFactory.trackedSatellite.includes(accounts.trudy.pkh)).toBeFalsy();

// //       const aggregatorAddresses = Array.from(storageAggregatorFactory.trackedAggregators.values());
// //       aggregatorAddresses.forEach(async element => {
// //         const aggregator =
// //         await tezosToolkits.david.contract.at<AggregatorContractAbstraction>(
// //           element as unknown as string
// //         );
// //         const storageAggregator: AggregatorStorage = await aggregator.storage();
// //         expect(storageAggregator.oracleAddresses.has(accounts.trudy.pkh)).toBeFalsy();
// //       });
// //     }, timeoutMS);
// //   });

// //   describe('updateAggregatorConfig', () => {
// //     const decimals: BigNumber = new BigNumber(100);
// //     const percentOracleThreshold: BigNumber = new BigNumber(100);
// //     const rewardAmountXTZ: BigNumber = new BigNumber(100);
// //     const rewardAmountMVK: BigNumber = new BigNumber(100);
// //     const minimalTezosAmountDeviationTrigger: BigNumber = new BigNumber(100);
// //     const perthousandDeviationTrigger: BigNumber = new BigNumber(100);
// //     const maintainer: string = accountPerNetwork['development'].bob.pkh;
// //     const numberBlocksDelay: BigNumber = new BigNumber(2);

// //     it(
// //       'should fail if called by random address',
// //       async () => {
// //         const aggregatorFactory =
// //           await tezosToolkits.david.contract.at<AggregatorFactoryContractAbstraction>(
// //             aggregatorFactoryAddress
// //           );

// //         const op = aggregatorFactory.methods.updateAggregatorConfig(
// //           decimals,
// //           maintainer,
// //           minimalTezosAmountDeviationTrigger,
// //           numberBlocksDelay,
// //           perthousandDeviationTrigger,
// //           percentOracleThreshold,
// //           rewardAmountXTZ,
// //           rewardAmountMVK,
// //           aggregatorAddress
// //         );

// //         await expect(op.send()).rejects.toThrow('ONLY_ADMINISTRATOR_ALLOWED');
// //       },
// //       timeoutMS
// //     );

// //     it(
// //       'should update an aggregator config',
// //       async () => {
// //         const aggregatorFactory =
// //           await tezosToolkits.alice.contract.at<AggregatorFactoryContractAbstraction>(
// //             aggregatorFactoryAddress
// //           );

// //         const op = aggregatorFactory.methods.updateAggregatorConfig(
// //           decimals,
// //           maintainer,
// //           minimalTezosAmountDeviationTrigger,
// //           numberBlocksDelay,
// //           perthousandDeviationTrigger,
// //           percentOracleThreshold,
// //           rewardAmountXTZ,
// //           rewardAmountMVK,
// //           aggregatorAddress,
// //         );

// //         const tx = await op.send();
// //         await tx.confirmation();

// //         const aggregator =
// //           await tezosToolkits.alice.contract.at<AggregatorContractAbstraction>(
// //             aggregatorAddress
// //           );
// //         const storage: AggregatorStorage = await aggregator.storage();

// //         expect(storage.aggregatorConfig.decimals).toEqual(decimals);
// //         expect(storage.aggregatorConfig.percentOracleThreshold).toEqual(
// //           percentOracleThreshold
// //         );
// //         expect(storage.aggregatorConfig.rewardAmountXTZ).toEqual(
// //           rewardAmountXTZ
// //         );
// //         expect(storage.aggregatorConfig.rewardAmountMVK).toEqual(
// //           rewardAmountMVK
// //         );
// //         expect(
// //           storage.aggregatorConfig.minimalTezosAmountDeviationTrigger
// //         ).toEqual(minimalTezosAmountDeviationTrigger);
// //         expect(storage.aggregatorConfig.perthousandDeviationTrigger).toEqual(
// //           perthousandDeviationTrigger
// //         );
// //         expect(storage.aggregatorConfig.maintainer).toEqual(maintainer);
// //       },
// //       timeoutMS
// //     );
// //   });

// //   describe('updateAggregatorOwner', () => {

// //     it(
// //       'should fail if called by random address',
// //       async () => {
// //         const aggregatorFactory =
// //           await tezosToolkits.david.contract.at<AggregatorFactoryContractAbstraction>(
// //             aggregatorFactoryAddress
// //           );

// //         const op = aggregatorFactory.methods.updateAggregatorOwner(
// //           accountPerNetwork['development'].bob.pkh,
// //           aggregatorAddress
// //         );

// //         await expect(op.send()).rejects.toThrow('ONLY_ADMINISTRATOR_ALLOWED');
// //       },
// //       timeoutMS
// //     );

// //     it(
// //       'should update an aggregator owner',
// //       async () => {
// //         const aggregatorFactory =
// //           await tezosToolkits.alice.contract.at<AggregatorFactoryContractAbstraction>(
// //             aggregatorFactoryAddress
// //           );

// //         const op = aggregatorFactory.methods.updateAggregatorOwner(
// //           accountPerNetwork['development'].bob.pkh,
// //           aggregatorAddress
// //         );

// //         const tx = await op.send();
// //         await tx.confirmation();

// //         const aggregator =
// //           await tezosToolkits.alice.contract.at<AggregatorContractAbstraction>(
// //             aggregatorAddress
// //           );
// //         const storage: AggregatorStorage = await aggregator.storage();

// //         expect(storage.owner).toEqual(accountPerNetwork['development'].bob.pkh);
// //       },
// //       timeoutMS
// //     );
// //   });
// });
