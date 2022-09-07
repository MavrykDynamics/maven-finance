import { createHash } from "crypto";
import { MichelsonMap } from '@taquito/michelson-encoder';
import assert from "assert";
import BigNumber from 'bignumber.js';

import delegationAddress from '../deployments/delegationAddress.json';
import mvkTokenAddress from '../deployments/mvkTokenAddress.json';

const chai = require("chai");
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);   
chai.should();
import { bob, alice, eve, mallory, oscar, trudy, isaac, david, susie, ivan, oracleMaintainer } from "../scripts/sandbox/accounts";
import aggregatorAddress from '../deployments/aggregatorAddress.json';
import aggregatorFactoryAddress from '../deployments/aggregatorFactoryAddress.json';

import { aggregatorStorageType } from './types/aggregatorStorageType';

import { packDataBytes, MichelsonData, MichelsonType } from '@taquito/michel-codec';
import { Utils } from './helpers/Utils';
import { InMemorySigner } from '@taquito/signer';

describe('AggregatorFactory', () => {

  var utils: Utils;

  let aggregatorInstance
  let aggregatorFactory

  let aggregatorStorage

  const aggregatorMetadataBase = Buffer.from(
        JSON.stringify({
            name: 'MAVRYK Aggregator Contract',
            version: 'v1.0.0',
            authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
        }),
        'ascii',
        ).toString('hex')
  

  const oracleMap = MichelsonMap.fromLiteral({
    [bob.pkh]              : {
                                  oraclePublicKey: bob.pk,
                                  oraclePeerId: bob.peerId
                              },
    [eve.pkh]              : {
                                  oraclePublicKey: eve.pk,
                                  oraclePeerId: eve.peerId
                              },
    [mallory.pkh]          : {
                                  oraclePublicKey: mallory.pk,
                                  oraclePeerId: mallory.peerId
                              },
    [oracleMaintainer.pkh] : {
                                  oraclePublicKey: oracleMaintainer.pk,
                                  oraclePeerId: oracleMaintainer.peerId
                              },
  });
  const signerFactory = async (pk) => {
    await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
    return utils.tezos;
  };

  before("setup", async () => {
    console.log('-- -- -- -- -- Aggregator Factory Tests -- -- -- --')
    utils = new Utils();
    await utils.init(bob.sk);

    aggregatorInstance                 = await utils.tezos.contract.at(aggregatorAddress.address);
    aggregatorStorage                  = await aggregatorInstance.storage();

    aggregatorFactory = await utils.tezos.contract.at(aggregatorFactoryAddress.address);
  });

  describe('deploy a new aggregator', () => {
    it('should fail if called by random address', async () => {
        await signerFactory(david.sk);

      const op = aggregatorFactory.methods.createAggregator(
        'USD',
        'TEST',

        'USDBTC',
        true,
        
        oracleMap,

        new BigNumber(8),             // decimals
        new BigNumber(2),             // alphaPercentPerThousand

        new BigNumber(86400),         // deviationTriggerBanTimestamp
        new BigNumber(5),             // perthousandDeviationTrigger
        new BigNumber(60),            // percentOracleThreshold
        new BigNumber(30),            // heartBeatSeconds

        new BigNumber(0),             // requestRateDeviationDepositFee 

        new BigNumber(10000000),      // deviationRewardStakedMvk
        new BigNumber(2600),          // deviationRewardAmountXtz
        new BigNumber(10000000),      // rewardAmountMvk ~ 0.01 MVK
        new BigNumber(1300),          // rewardAmountXtz ~ 0.0013 tez
        
        aggregatorMetadataBase        // metadata
      );

    await chai.expect(op.send()).to.be.rejectedWith();

    });
    
    it('should create a new Aggregator', async () => {
        await signerFactory(bob.sk);

      const op = aggregatorFactory.methods.createAggregator(
        'USD',
        'TEST',

        'USDBTC',
        true,
        
        oracleMap,

        new BigNumber(8),             // decimals
        new BigNumber(2),             // numberBlocksDelay

        new BigNumber(86400),         // deviationTriggerBanTimestamp
        new BigNumber(5),             // perthousandDeviationTrigger
        new BigNumber(60),            // percentOracleThreshold

        new BigNumber(0),             // requestRateDeviationDepositFee 

        new BigNumber(10000000),      // deviationRewardStakedMvk
        new BigNumber(2600),          // deviationRewardAmountXtz
        new BigNumber(10000000),      // rewardAmountMvk ~ 0.01 MVK
        new BigNumber(1300),          // rewardAmountXtz ~ 0.0013 tez
        
        oracleMaintainer.pkh,         // maintainer
        aggregatorMetadataBase        // metadata
      );

        const tx = await op.send();
        await tx.confirmation();

      const aggregatorFactoryStorage = await aggregatorFactory.storage();
  
      const newAggregatorAddress = aggregatorFactoryStorage.trackedAggregators.get({
        0: 'USD',
        1: 'TEST',
      }) as string;
      assert.notDeepEqual(newAggregatorAddress,null);

    });

  });  


  describe('trackAggregator', () => {

    it(
      'should fail if called by random address',
      async () => {
        await signerFactory(david.sk);

        const op = await aggregatorFactory.methods.trackAggregator(
            "USD", "test", aggregatorInstance.address
          );
        
        await chai.expect(op.send()).to.be.rejectedWith();     
        }
    );

    it(
      'should track aggregator',
      async () => {
        
        await signerFactory(bob.sk);

        const op = await aggregatorFactory.methods.trackAggregator(
          "USD", "test", aggregatorInstance.address
        ).send();

        await op.confirmation();

        let storageAggregatorFactory = await aggregatorFactory.storage();
        const trackedAggregator  = await storageAggregatorFactory.trackedAggregators.get({
          0: 'USD',
          1: 'test',
        }) as string
        assert.deepEqual(trackedAggregator, aggregatorInstance.address);

      }
    );
  });

  describe('untrackAggregator', () => {

    it(
      'should fail if called by random address',
      async () => {
        await signerFactory(david.sk);

        const op = await aggregatorFactory.methods.untrackAggregator(
            "USD", "test", aggregatorInstance.address
          );
        
        await chai.expect(op.send()).to.be.rejectedWith();     
        }
    );

    it(
      'should untrack aggregator',
      async () => {
        
        await signerFactory(bob.sk);

        const op = await aggregatorFactory.methods.untrackAggregator(
          "USD", "test", aggregatorInstance.address
        ).send();

        await op.confirmation();

        let storageAggregatorFactory = await aggregatorFactory.storage();
        const untrackedAggregator  = await storageAggregatorFactory.trackedAggregators.get({
          0: 'USD',
          1: 'test',
        }) as string

        assert.deepEqual(untrackedAggregator, null);

        // reset track aggregator for tests below
        const reset_op = await aggregatorFactory.methods.trackAggregator(
          "USD", "test", aggregatorInstance.address
        ).send();

        await reset_op.confirmation();

      }
    );
  });


  describe('%pauseAll', function() {

    it('Non-admin should not be able to pause all entrypoints', async() => {
      try{
          // Change signer
          await signerFactory(alice.sk);
          let storageAggregatorFactory = await aggregatorFactory.storage();

          // Initial values
          const createAggregatorIsPaused          = storageAggregatorFactory.breakGlassConfig.createAggregatorIsPaused;
          const trackAggregatorIsPaused           = storageAggregatorFactory.breakGlassConfig.trackAggregatorIsPaused;
          const untrackAggregatorIsPaused         = storageAggregatorFactory.breakGlassConfig.untrackAggregatorIsPaused;
          const distributeRewardXtzIsPaused       = storageAggregatorFactory.breakGlassConfig.distributeRewardXtzIsPaused;
          const distributeRewardStakedMvkIsPaused = storageAggregatorFactory.breakGlassConfig.distributeRewardStakedMvkIsPaused;

          assert.equal(createAggregatorIsPaused, false);
          assert.equal(trackAggregatorIsPaused, false);
          assert.equal(untrackAggregatorIsPaused, false);
          assert.equal(distributeRewardXtzIsPaused, false);
          assert.equal(distributeRewardStakedMvkIsPaused, false);
          
          // fail pause all
          await chai.expect(aggregatorFactory.methods.pauseAll().send()).to.be.rejected;

          // Final values
          const updatedAggregatorFactoryStorage          = await aggregatorFactory.storage();

          const updatedCreateAggregatorIsPaused          = updatedAggregatorFactoryStorage.breakGlassConfig.createAggregatorIsPaused;
          const updatedTrackAggregatorIsPaused           = updatedAggregatorFactoryStorage.breakGlassConfig.trackAggregatorIsPaused;
          const updatedUntrackAggregatorIsPaused         = updatedAggregatorFactoryStorage.breakGlassConfig.untrackAggregatorIsPaused;
          const updatedDistributeRewardXtzIsPaused       = updatedAggregatorFactoryStorage.breakGlassConfig.distributeRewardXtzIsPaused;
          const updatedDistributeRewardStakedMvkIsPaused = updatedAggregatorFactoryStorage.breakGlassConfig.distributeRewardStakedMvkIsPaused;

          // Assertion
          assert.equal(updatedCreateAggregatorIsPaused, false);
          assert.equal(updatedTrackAggregatorIsPaused, false);
          assert.equal(updatedUntrackAggregatorIsPaused, false);
          assert.equal(updatedDistributeRewardXtzIsPaused, false);
          assert.equal(updatedDistributeRewardStakedMvkIsPaused, false);

      }catch(e){
          console.dir(e, {depth: 5})
      }
    })
  
    it('Admin should be able to pause all entrypoints on the factory and the tracked aggregators', async() => {
        try{
            await signerFactory(bob.sk)
            let storageAggregatorFactory = await aggregatorFactory.storage();

            // Initial values
            const createAggregatorIsPaused          = storageAggregatorFactory.breakGlassConfig.createAggregatorIsPaused;
            const trackAggregatorIsPaused           = storageAggregatorFactory.breakGlassConfig.trackAggregatorIsPaused;
            const untrackAggregatorIsPaused         = storageAggregatorFactory.breakGlassConfig.untrackAggregatorIsPaused;
            const distributeRewardXtzIsPaused       = storageAggregatorFactory.breakGlassConfig.distributeRewardXtzIsPaused;
            const distributeRewardStakedMvkIsPaused = storageAggregatorFactory.breakGlassConfig.distributeRewardStakedMvkIsPaused;

            assert.equal(createAggregatorIsPaused, false);
            assert.equal(trackAggregatorIsPaused, false);
            assert.equal(untrackAggregatorIsPaused, false);
            assert.equal(distributeRewardXtzIsPaused, false);
            assert.equal(distributeRewardStakedMvkIsPaused, false);
            
            var aggregatorStorage: aggregatorStorageType = await aggregatorInstance.storage();

            const updatePriceIsPaused                 = aggregatorStorage.breakGlassConfig.updatePriceIsPaused;
            const withdrawRewardXtzIsPaused           = aggregatorStorage.breakGlassConfig.withdrawRewardXtzIsPaused;
            const withdrawRewardStakedMvkIsPaused     = aggregatorStorage.breakGlassConfig.withdrawRewardStakedMvkIsPaused

            assert.equal(updatePriceIsPaused, false);
            assert.equal(withdrawRewardXtzIsPaused, false);
            assert.equal(withdrawRewardStakedMvkIsPaused, false);

            // Create an operation
            const operation = await aggregatorFactory.methods.pauseAll().send();
            await operation.confirmation();

            // Final values
            const updatedAggregatorFactoryStorage                  = await aggregatorFactory.storage();
            const updatedAggregatorStorage : aggregatorStorageType = await aggregatorInstance.storage();

            const updatedUpdatePriceIsPaused                = updatedAggregatorStorage.breakGlassConfig.updatePriceIsPaused;
            const updatedWithdrawRewardXtzIsPaused          = updatedAggregatorStorage.breakGlassConfig.withdrawRewardXtzIsPaused;
            const updatedWithdrawRewardStakedMvkIsPaused    = updatedAggregatorStorage.breakGlassConfig.withdrawRewardStakedMvkIsPaused;

            assert.equal(updatedUpdatePriceIsPaused,                true);
            assert.equal(updatedWithdrawRewardXtzIsPaused,          true);
            assert.equal(updatedWithdrawRewardStakedMvkIsPaused,    true);
            
            const updatedCreateAggregatorIsPaused          = updatedAggregatorFactoryStorage.breakGlassConfig.createAggregatorIsPaused;
            const updatedTrackAggregatorIsPaused           = updatedAggregatorFactoryStorage.breakGlassConfig.trackAggregatorIsPaused;
            const updatedUntrackAggregatorIsPaused         = updatedAggregatorFactoryStorage.breakGlassConfig.untrackAggregatorIsPaused;
            const updatedDistributeRewardXtzIsPaused       = updatedAggregatorFactoryStorage.breakGlassConfig.distributeRewardXtzIsPaused;
            const updatedDistributeRewardStakedMvkIsPaused = updatedAggregatorFactoryStorage.breakGlassConfig.distributeRewardStakedMvkIsPaused;

            assert.equal(updatedCreateAggregatorIsPaused,           true);
            assert.equal(updatedTrackAggregatorIsPaused,            true);
            assert.equal(updatedUntrackAggregatorIsPaused,          true);
            assert.equal(updatedDistributeRewardXtzIsPaused,        true);
            assert.equal(updatedDistributeRewardStakedMvkIsPaused,  true);

            // Test calls
            await chai.expect(aggregatorFactory.methods.createAggregator(
              'USD',
              'TEST',
      
              'USDBTC',
              true,
              
              oracleMap,
      
              new BigNumber(8),             // decimals
              new BigNumber(2),             // numberBlocksDelay
      
              new BigNumber(86400),         // deviationTriggerBanTimestamp
              new BigNumber(5),             // perthousandDeviationTrigger
              new BigNumber(60),            // percentOracleThreshold
      
              new BigNumber(0),             // requestRateDeviationDepositFee 
      
              new BigNumber(10000000),      // deviationRewardStakedMvk
              new BigNumber(2600),          // deviationRewardAmountXtz
              new BigNumber(10000000),      // rewardAmountMvk ~ 0.01 MVK
              new BigNumber(1300),          // rewardAmountXtz ~ 0.0013 tez
              
              aggregatorMetadataBase        // metadata
            ).send()).to.be.rejected;

            await chai.expect(aggregatorFactory.methods.untrackAggregator("USD", "test").send()).to.be.rejected;
            await chai.expect(aggregatorFactory.methods.trackAggregator("USD", "test", aggregatorInstance.address).send()).to.be.rejected;

            // init params for aggregator test entrypoints
            const observations = [
              {
                 "oracle": bob.pkh,
                 "price": new BigNumber(10142857143)
              },
              {
                  "oracle": eve.pkh,
                  "price": new BigNumber(10142853322)
               },
               {
                  "oracle": mallory.pkh,
                  "price": new BigNumber(10142857900)
               },
               {
                  "oracle": oracleMaintainer.pkh,
                  "price": new BigNumber(10144537815)
               },
           ];
           const epoch: number = 1;
           const round: number = 1;
           const oracleObservations = new MichelsonMap<string, any>();
           for (const { oracle, price } of observations) {
              oracleObservations.set(oracle, {
                  price,
                  epoch,
                  round,
                  aggregatorAddress: aggregatorAddress.address
                });
           };
  
           const signatures = new MichelsonMap<string, string>();
  
           await signerFactory(bob.sk);
           signatures.set(bob.pkh, await utils.signOraclePriceResponses(oracleObservations));
           await signerFactory(eve.sk);
           signatures.set(eve.pkh, await utils.signOraclePriceResponses(oracleObservations));
           await signerFactory(mallory.sk);
           signatures.set(mallory.pkh, await utils.signOraclePriceResponses(oracleObservations));
           await signerFactory(oracleMaintainer.sk);
           signatures.set(oracleMaintainer.pkh, await utils.signOraclePriceResponses(oracleObservations));
  
            

            await chai.expect(aggregatorInstance.methods.updatePrice(oracleObservations, signatures).send()).to.be.rejected;
            await chai.expect(aggregatorInstance.methods.withdrawRewardXtz(bob.pkh).send()).to.be.rejected;
            await chai.expect(aggregatorInstance.methods.withdrawRewardStakedMvk(bob.pkh).send()).to.be.rejected;

        }catch(e){
            console.dir(e, {depth: 5})
        }
    })

  });

  describe('%unpauseAll', function() {

    it('Non-admin should not be able to unpause all entrypoints', async() => {
      try{
          // Change signer
          await signerFactory(alice.sk);
          let storageAggregatorFactory = await aggregatorFactory.storage();

          // Initial values
          const createAggregatorIsPaused          = storageAggregatorFactory.breakGlassConfig.createAggregatorIsPaused;
          const trackAggregatorIsPaused           = storageAggregatorFactory.breakGlassConfig.trackAggregatorIsPaused;
          const untrackAggregatorIsPaused         = storageAggregatorFactory.breakGlassConfig.untrackAggregatorIsPaused;
          const distributeRewardXtzIsPaused       = storageAggregatorFactory.breakGlassConfig.distributeRewardXtzIsPaused;
          const distributeRewardStakedMvkIsPaused = storageAggregatorFactory.breakGlassConfig.distributeRewardStakedMvkIsPaused;

          assert.equal(createAggregatorIsPaused,          true);
          assert.equal(trackAggregatorIsPaused,           true);
          assert.equal(untrackAggregatorIsPaused,         true);
          assert.equal(distributeRewardXtzIsPaused,       true);
          assert.equal(distributeRewardStakedMvkIsPaused, true);
          
          // fail pause all
          await chai.expect(aggregatorFactory.methods.unpauseAll().send()).to.be.rejected;

          // Final values
          const updatedAggregatorFactoryStorage          = await aggregatorFactory.storage();

          const updatedCreateAggregatorIsPaused          = updatedAggregatorFactoryStorage.breakGlassConfig.createAggregatorIsPaused;
          const updatedTrackAggregatorIsPaused           = updatedAggregatorFactoryStorage.breakGlassConfig.trackAggregatorIsPaused;
          const updatedUntrackAggregatorIsPaused         = updatedAggregatorFactoryStorage.breakGlassConfig.untrackAggregatorIsPaused;
          const updatedDistributeRewardXtzIsPaused       = updatedAggregatorFactoryStorage.breakGlassConfig.distributeRewardXtzIsPaused;
          const updatedDistributeRewardStakedMvkIsPaused = updatedAggregatorFactoryStorage.breakGlassConfig.distributeRewardStakedMvkIsPaused;

          // Assertion
          assert.equal(updatedCreateAggregatorIsPaused,          true);
          assert.equal(updatedTrackAggregatorIsPaused,           true);
          assert.equal(updatedUntrackAggregatorIsPaused,         true);
          assert.equal(updatedDistributeRewardXtzIsPaused,       true);
          assert.equal(updatedDistributeRewardStakedMvkIsPaused, true);

      }catch(e){
          console.dir(e, {depth: 5})
      }
    })

    it('should be able to unpause all entrypoints on the factory and the tracked aggregators', async() => {
        try{
            await signerFactory(bob.sk)
            let storageAggregatorFactory = await aggregatorFactory.storage();

            // Initial values
            const createAggregatorIsPaused          = storageAggregatorFactory.breakGlassConfig.createAggregatorIsPaused;
            const trackAggregatorIsPaused           = storageAggregatorFactory.breakGlassConfig.trackAggregatorIsPaused;
            const untrackAggregatorIsPaused         = storageAggregatorFactory.breakGlassConfig.untrackAggregatorIsPaused;
            const distributeRewardXtzIsPaused       = storageAggregatorFactory.breakGlassConfig.distributeRewardXtzIsPaused;
            const distributeRewardStakedMvkIsPaused = storageAggregatorFactory.breakGlassConfig.distributeRewardStakedMvkIsPaused;

            assert.equal(createAggregatorIsPaused,          true);
            assert.equal(trackAggregatorIsPaused,           true);
            assert.equal(untrackAggregatorIsPaused,         true);
            assert.equal(distributeRewardXtzIsPaused,       true);
            assert.equal(distributeRewardStakedMvkIsPaused, true);

            var aggregatorStorage: aggregatorStorageType = await aggregatorInstance.storage();
            const updatePriceIsPaused                 = aggregatorStorage.breakGlassConfig.updatePriceIsPaused;
            const withdrawRewardXtzIsPaused           = aggregatorStorage.breakGlassConfig.withdrawRewardXtzIsPaused;
            const withdrawRewardStakedMvkIsPaused     = aggregatorStorage.breakGlassConfig.withdrawRewardStakedMvkIsPaused

            assert.equal(updatePriceIsPaused,                 true);
            assert.equal(withdrawRewardXtzIsPaused,           true);
            assert.equal(withdrawRewardStakedMvkIsPaused,     true);

            // Create an operation
            const operation = await aggregatorFactory.methods.unpauseAll().send();
            await operation.confirmation();

            // Final values
            const updatedAggregatorFactoryStorage                  = await aggregatorFactory.storage();
            const updatedAggregatorStorage : aggregatorStorageType = await aggregatorInstance.storage();

            const updatedUpdatePriceIsPaused                = updatedAggregatorStorage.breakGlassConfig.updatePriceIsPaused;
            const updatedWithdrawRewardXtzIsPaused          = updatedAggregatorStorage.breakGlassConfig.withdrawRewardXtzIsPaused;
            const updatedWithdrawRewardStakedMvkIsPaused    = updatedAggregatorStorage.breakGlassConfig.withdrawRewardStakedMvkIsPaused;

            assert.equal(updatedUpdatePriceIsPaused,                false);
            assert.equal(updatedWithdrawRewardXtzIsPaused,          false);
            assert.equal(updatedWithdrawRewardStakedMvkIsPaused,    false);
            
            const updatedCreateAggregatorIsPaused          = updatedAggregatorFactoryStorage.breakGlassConfig.createAggregatorIsPaused;
            const updatedTrackAggregatorIsPaused           = updatedAggregatorFactoryStorage.breakGlassConfig.trackAggregatorIsPaused;
            const updatedUntrackAggregatorIsPaused         = updatedAggregatorFactoryStorage.breakGlassConfig.untrackAggregatorIsPaused;
            const updatedDistributeRewardXtzIsPaused       = updatedAggregatorFactoryStorage.breakGlassConfig.distributeRewardXtzIsPaused;
            const updatedDistributeRewardStakedMvkIsPaused = updatedAggregatorFactoryStorage.breakGlassConfig.distributeRewardStakedMvkIsPaused;

            assert.equal(updatedCreateAggregatorIsPaused,           false);
            assert.equal(updatedTrackAggregatorIsPaused,            false);
            assert.equal(updatedUntrackAggregatorIsPaused,          false);
            assert.equal(updatedDistributeRewardXtzIsPaused,        false);
            assert.equal(updatedDistributeRewardStakedMvkIsPaused,  false);

            // Test calls
            const test_create_aggregator_op = await aggregatorFactory.methods.createAggregator(
              'USD',
              'TESTv2',
      
              'USDTestv2',
              true,
              
              oracleMap,
      
              new BigNumber(8),             // decimals
              new BigNumber(2),             // alphaPercentPerThousand
      
              new BigNumber(86400),         // deviationTriggerBanTimestamp
              new BigNumber(5),             // perthousandDeviationTrigger
              new BigNumber(60),            // percentOracleThreshold
              new BigNumber(30),            // heartBeatSeconds

              new BigNumber(0),             // requestRateDeviationDepositFee 
      
              new BigNumber(10000000),      // deviationRewardStakedMvk
              new BigNumber(2600),          // deviationRewardAmountXtz
              new BigNumber(10000000),      // rewardAmountMvk ~ 0.01 MVK
              new BigNumber(1300),          // rewardAmountXtz ~ 0.0013 tez
              
              aggregatorMetadataBase        // metadata
            ).send();
            
            await test_create_aggregator_op.confirmation();

            const test_untrack_aggregator_op = await aggregatorFactory.methods.untrackAggregator('USD', 'test').send();
            await test_untrack_aggregator_op.confirmation();

            const test_track_aggregator_op = await aggregatorFactory.methods.trackAggregator('USD', 'test', aggregatorInstance.address).send();
            await test_track_aggregator_op.confirmation();

        }catch(e){
            console.dir(e, {depth: 5})
        }
    })

  });

  describe('setAdmin', () => {

    it(
      'should fail if called by random address',
      async () => {
        await signerFactory(david.sk);

        const op = aggregatorFactory.methods.setAdmin(alice.pkh);
        await chai.expect(op.send()).to.be.rejectedWith();     
        }
    );

    it(
      'should update an aggregator factory admin',
      async () => {
        await signerFactory(bob.sk);
        const op_1 = aggregatorFactory.methods.setAdmin(alice.pkh);
        const tx_1 = await op_1.send();
        await tx_1.confirmation();
        let storageAggregatorFactory = await aggregatorFactory.storage();
        assert.deepEqual(storageAggregatorFactory.admin,alice.pkh);

        await signerFactory(alice.sk);
        const op_2 = aggregatorFactory.methods.setAdmin(bob.pkh);
        const tx_2 = await op_2.send();
        await tx_2.confirmation();
        storageAggregatorFactory = await aggregatorFactory.storage();
        assert.deepEqual(storageAggregatorFactory.admin,bob.pkh);

      }
    );
  });

  describe('setGovernance', () => {
    it(
      'should fail if called by random address',
      async () => {
        await signerFactory(david.sk);

        const op = aggregatorFactory.methods.setGovernance(
          bob.pkh
        );

        await chai.expect(op.send()).to.be.rejectedWith();
      },

    );

    it(
      'should update contract governance',
      async () => {
        await signerFactory(bob.sk);

        const op = aggregatorFactory.methods.setGovernance(
          bob.pkh
        );

        const tx = await op.send();
        await tx.confirmation();

        const storageAggregatorFactory = await aggregatorFactory.storage();
        assert.deepEqual(storageAggregatorFactory.governanceAddress,bob.pkh);

        },

      );
    });

  describe('updateMetadata', () => {
    it(
      'should fail if called by random address',
      async () => {
        await signerFactory(david.sk);

        // Initial values
        const key   = ''
        const hash  = Buffer.from('tezos-storage:data', 'ascii').toString('hex')
        
        const op = aggregatorFactory.methods.updateMetadata(
          key, hash
        );

        await chai.expect(op.send()).to.be.rejectedWith();
      },

    );

    it(
      'should update contract metadata',
      async () => {
        await signerFactory(bob.sk);

        // Initial values
        const key   = ''
        const hash  = Buffer.from('tezos-storage:data', 'ascii').toString('hex')
        
        const op = aggregatorFactory.methods.updateMetadata(
          key, hash
        );

        const tx = await op.send();
        await tx.confirmation();

        const storageAggregatorFactory = await aggregatorFactory.storage();
        const updatedData              = await storageAggregatorFactory.metadata.get(key);
        assert.equal(updatedData, hash);

        },

      );
  });

  describe('updateConfig', () => {
    
    const aggregatorNameMaxLength       : BigNumber = new BigNumber(100);

    it(
      'should fail if called by random address',
      async () => {

        await signerFactory(david.sk);

        const test_update_config_aggregator_name_max_length_op = aggregatorFactory.methods.updateConfig(
          aggregatorNameMaxLength, "configAggregatorNameMaxLength"
        );
        await chai.expect(test_update_config_aggregator_name_max_length_op.send()).to.be.rejectedWith();

      },

    );

    it(
      'should update aggregator config',
      async () => {
        await signerFactory(bob.sk);

        const test_update_config_aggregator_name_max_length_op = await aggregatorFactory.methods.updateConfig(
          aggregatorNameMaxLength, "configAggregatorNameMaxLength"
        ).send();
        await test_update_config_aggregator_name_max_length_op.confirmation();

        const storageAggregatorFactory = await aggregatorFactory.storage();

        assert.deepEqual(storageAggregatorFactory.config.aggregatorNameMaxLength,  aggregatorNameMaxLength);
        
      },

    );

  });

  describe('updateWhitelistContracts', () => {
    it(
      'should fail if called by random address',
      async () => {
        await signerFactory(david.sk);

        const op = aggregatorFactory.methods.updateWhitelistContracts(
          "testContract", david.pkh
        );

        await chai.expect(op.send()).to.be.rejectedWith();
      },

    );

    it(
      'should update whitelist contracts',
      async () => {
        await signerFactory(bob.sk);

        const op = aggregatorFactory.methods.updateWhitelistContracts(
          "testContract", david.pkh
        );

        const tx = await op.send();
        await tx.confirmation();

        const storageAggregatorFactory = await aggregatorFactory.storage();
        const whitelistTestContract    = await storageAggregatorFactory.whitelistContracts.get("testContract");
        assert.deepEqual(whitelistTestContract, david.pkh);
        },

      );
  });
    
  describe('updateGeneralContracts', () => {
    it(
      'should fail if called by random address',
      async () => {
        await signerFactory(david.sk);

        const op = aggregatorFactory.methods.updateGeneralContracts(
          "testContract", david.pkh
        );

        await chai.expect(op.send()).to.be.rejectedWith();
      },

    );

    it(
      'should update general contracts',
      async () => {
        await signerFactory(bob.sk);

        const op = aggregatorFactory.methods.updateGeneralContracts(
          "testContract", david.pkh
        );

        const tx = await op.send();
        await tx.confirmation();

        const storageAggregatorFactory = await aggregatorFactory.storage();
        const generalTestContract      = await storageAggregatorFactory.generalContracts.get("testContract");
        assert.deepEqual(generalTestContract, david.pkh);
        },

      );
  });

  describe('setLambda', () => {
    it(
      'should fail if called by random address',
      async () => {
        await signerFactory(david.sk);

        const bytes  = Buffer.from('tezos-storage:data', 'ascii').toString('hex')
        const op = aggregatorFactory.methods.setLambda(
          "testSetLambda", bytes
        );

        await chai.expect(op.send()).to.be.rejectedWith();
      },

    );

  });

  describe('setProductLambda', () => {
    it(
      'should fail if called by random address',
      async () => {
        await signerFactory(david.sk);

        const bytes  = Buffer.from('tezos-storage:data', 'ascii').toString('hex')
        const op = aggregatorFactory.methods.setProductLambda(
          "testSetProductLambda", bytes
        );

        await chai.expect(op.send()).to.be.rejectedWith();
      },

    );

  });

});
