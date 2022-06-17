// import { MichelsonMap } from '@taquito/michelson-encoder';
// import assert from "assert";
// import BigNumber from 'bignumber.js';

// import delegationAddress from '../deployments/delegationAddress.json';
// import mvkTokenAddress from '../deployments/mvkTokenAddress.json';

// const chai = require("chai");
// const chaiAsPromised = require('chai-as-promised');

// chai.use(chaiAsPromised);   
// chai.should();
// import { bob, alice, eve, mallory, oscar, trudy, isaac, david, susie, ivan, oracleMaintainer } from "../scripts/sandbox/accounts";
// import aggregatorAddress from '../deployments/aggregatorAddress.json';
// import aggregatorFactoryAddress from '../deployments/aggregatorFactoryAddress.json';
// import { Utils } from './helpers/Utils';
// import { InMemorySigner } from '@taquito/signer';

// describe('AggregatorFactory', () => {
//   let satelliteAddress: string;
//   var utils: Utils;

//   let aggregatorInstance
//   let aggregatorFactory

//   let aggregatorStorage

//   const aggregatorMetadataBase = Buffer.from(
//         JSON.stringify({
//             name: 'MAVRYK Aggregator Contract',
//             version: 'v1.0.0',
//             authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
//         }),
//         'ascii',
//         ).toString('hex')
  

//   const signerFactory = async (pk) => {
//     await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
//     return utils.tezos;
//   };

//   before("setup", async () => {
//     console.log('-- -- -- -- -- Aggregator Factory Tests -- -- -- --')
//     utils = new Utils();
//     await utils.init(bob.sk);

//     aggregatorInstance                 = await utils.tezos.contract.at(aggregatorAddress.address);
//     aggregatorStorage                  = await aggregatorInstance.storage();

//     aggregatorFactory = await utils.tezos.contract.at(aggregatorFactoryAddress.address);
//   });

//   describe('deploy a new aggregator', () => {
//     it('should fail if called by random address', async () => {
//         await signerFactory(david.sk);

//       const op = aggregatorFactory.methods.createAggregator(
//         'USD',
//         'TEST',

//         'USDBTC',
//         true,
        
//         MichelsonMap.fromLiteral({
//           [bob.pkh]: true,
//           [eve.pkh]: true,
//           [mallory.pkh]: true,
//           [oscar.pkh]: true,
//         }) as MichelsonMap<string, string>,

//         new BigNumber(8),             // decimals
//         new BigNumber(2),             // numberBlocksDelay

//         new BigNumber(86400),         // deviationTriggerBanTimestamp
//         new BigNumber(5),             // perthousandDeviationTrigger
//         new BigNumber(60),            // percentOracleThreshold

//         new BigNumber(0),             // requestRateDeviationDepositFee 

//         new BigNumber(10000000),      // deviationRewardStakedMvk
//         new BigNumber(2600),          // deviationRewardAmountXtz
//         new BigNumber(10000000),      // rewardAmountMvk ~ 0.01 MVK
//         new BigNumber(1300),          // rewardAmountXtz ~ 0.0013 tez
        
//         oracleMaintainer.pkh,         // maintainer
//         aggregatorMetadataBase        // metadata
//       );

//     await chai.expect(op.send()).to.be.rejectedWith();

//     });
    
//     it('should create a new Aggregator', async () => {
//         await signerFactory(bob.sk);

//       const op = aggregatorFactory.methods.createAggregator(
//         'USD',
//         'TEST',

//         'USDBTC',
//         true,
        
//         MichelsonMap.fromLiteral({
//           [bob.pkh]: true,
//           [eve.pkh]: true,
//           [mallory.pkh]: true,
//           [oscar.pkh]: true,
//         }) as MichelsonMap<string, string>,

//         new BigNumber(8),             // decimals
//         new BigNumber(2),             // numberBlocksDelay

//         new BigNumber(86400),         // deviationTriggerBanTimestamp
//         new BigNumber(5),             // perthousandDeviationTrigger
//         new BigNumber(60),            // percentOracleThreshold

//         new BigNumber(0),             // requestRateDeviationDepositFee 

//         new BigNumber(10000000),      // deviationRewardStakedMvk
//         new BigNumber(2600),          // deviationRewardAmountXtz
//         new BigNumber(10000000),      // rewardAmountMvk ~ 0.01 MVK
//         new BigNumber(1300),          // rewardAmountXtz ~ 0.0013 tez
        
//         oracleMaintainer.pkh,         // maintainer
//         aggregatorMetadataBase        // metadata
//       );

//         const tx = await op.send();
//         await tx.confirmation();

//       const aggregatorFactoryStorage = await aggregatorFactory.storage();
  
//       satelliteAddress = aggregatorFactoryStorage.trackedAggregators.get({
//         0: 'USD',
//         1: 'TEST',
//       }) as string;
//       assert.notDeepEqual(satelliteAddress,null);
//       console.log({satelliteAddress})

//     });

//   });  


//   describe('trackAggregator', () => {

//     it(
//       'should fail if called by random address',
//       async () => {
//         await signerFactory(david.sk);

//         const op = await aggregatorFactory.methods.trackAggregator(
//             "USD", "test", aggregatorInstance.address
//           );
        
//         await chai.expect(op.send()).to.be.rejectedWith();     
//         }
//     );

//     it(
//       'should track aggregator',
//       async () => {
        
//         await signerFactory(bob.sk);

//         const op = await aggregatorFactory.methods.trackAggregator(
//           "USD", "test", aggregatorInstance.address
//         ).send();

//         await op.confirmation();

//         let storageAggregatorFactory = await aggregatorFactory.storage();
//         const trackedAggregator  = await storageAggregatorFactory.trackedAggregators.get({
//           0: 'USD',
//           1: 'test',
//         }) as string
//         assert.deepEqual(trackedAggregator, aggregatorInstance.address);

//       }
//     );
//   });

//   describe('setAdmin', () => {

//     it(
//       'should fail if called by random address',
//       async () => {
//         await signerFactory(david.sk);

//         const op = aggregatorFactory.methods.setAdmin(alice.pkh);
//         await chai.expect(op.send()).to.be.rejectedWith();     
//         }
//     );

//     it(
//       'should update an aggregator factory admin',
//       async () => {
//         await signerFactory(bob.sk);
//         const op_1 = aggregatorFactory.methods.setAdmin(alice.pkh);
//         const tx_1 = await op_1.send();
//         await tx_1.confirmation();
//         let storageAggregatorFactory = await aggregatorFactory.storage();
//         assert.deepEqual(storageAggregatorFactory.admin,alice.pkh);

//         await signerFactory(alice.sk);
//         const op_2 = aggregatorFactory.methods.setAdmin(bob.pkh);
//         const tx_2 = await op_2.send();
//         await tx_2.confirmation();
//         storageAggregatorFactory = await aggregatorFactory.storage();
//         assert.deepEqual(storageAggregatorFactory.admin,bob.pkh);

//       }
//     );
//   });

//   describe('setGovernance', () => {
//     it(
//       'should fail if called by random address',
//       async () => {
//         await signerFactory(david.sk);

//         const op = aggregatorFactory.methods.setGovernance(
//           bob.pkh
//         );

//         await chai.expect(op.send()).to.be.rejectedWith();
//       },

//     );

//     it(
//       'should update contract governance',
//       async () => {
//         await signerFactory(bob.sk);

//         const op = aggregatorFactory.methods.setGovernance(
//           bob.pkh
//         );

//         const tx = await op.send();
//         await tx.confirmation();

//         const storageAggregatorFactory = await aggregatorFactory.storage();
//         assert.deepEqual(storageAggregatorFactory.governanceAddress,bob.pkh);

//         },

//       );
//     });


// });
