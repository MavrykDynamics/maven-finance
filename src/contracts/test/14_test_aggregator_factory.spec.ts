import delegationAddress from '../deployments/delegationAddress.json';
import mvkTokenAddress from '../deployments/mvkTokenAddress.json';
import assert from "assert";
import BigNumber from 'bignumber.js';
import { MichelsonMap } from '@taquito/michelson-encoder';

const chai = require("chai");
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);   
chai.should();
import { bob, alice, eve, mallory, oscar, trudy, isaac, david, susie, ivan } from "../scripts/sandbox/accounts";
import aggregatorFactoryAddress from '../deployments/aggregatorFactoryAddress.json';
import { Utils } from './helpers/Utils';
import { InMemorySigner } from '@taquito/signer';

describe('AggregatorFactory', () => {
  let satelliteAddress: string;
  let aggregatorFactory;
  var utils: Utils;

  const signerFactory = async (pk) => {
    await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
    return utils.tezos;
  };

  before("setup", async () => {
    console.log('-- -- -- -- -- Aggregator Factory Tests -- -- -- --')
    utils = new Utils();
    await utils.init(bob.sk);

    aggregatorFactory = await utils.tezos.contract.at(aggregatorFactoryAddress.address);
  });

  describe('deploy a new aggregator', () => {
    it('should fail if called by random address', async () => {
        await signerFactory(david.sk);

      const op = aggregatorFactory.methods.createAggregator(
        'USD',
        'TEST',
        MichelsonMap.fromLiteral({
          [bob.pkh]: true,
          [eve.pkh]: true,
          [mallory.pkh]: true,
          [oscar.pkh]: true,
        }) as MichelsonMap<string, string>,
        mvkTokenAddress.address,
        delegationAddress.address,
        new BigNumber(0),
        new BigNumber(2600),
        bob.pkh,
        new BigNumber(1),
        new BigNumber(2),
        new BigNumber(60),
        new BigNumber(5),
        new BigNumber(10000),
        new BigNumber(1),
        aggregatorFactoryAddress.address
      );
    //   await expect(op.send()).rejects.toThrow('ONLY_ADMINISTRATOR_ALLOWED');
    await chai.expect(op.send()).to.be.rejectedWith();

    });
    
    it('should create a new Aggregator', async () => {
        await signerFactory(bob.sk);

      const op = aggregatorFactory.methods.createAggregator(
        'USD',
        'TEST',
        MichelsonMap.fromLiteral({
          [bob.pkh]: true,
          [eve.pkh]: true,
          [mallory.pkh]: true,
          [oscar.pkh]: true,
        }) as MichelsonMap<string, string>,
        mvkTokenAddress.address,
        delegationAddress.address,
        new BigNumber(0),
        new BigNumber(2600),
        bob.pkh,
        new BigNumber(1),
        new BigNumber(2),
        new BigNumber(60),
        new BigNumber(5),
        new BigNumber(10000),
        new BigNumber(1),
        aggregatorFactoryAddress.address
      );

        const tx = await op.send();
        await tx.confirmation();

      const aggregatorFactoryStorage = await aggregatorFactory.storage();
  
      satelliteAddress = aggregatorFactoryStorage.trackedAggregators.get({
        0: 'USD',
        1: 'TEST',
      }) as string;
      assert.notDeepEqual(satelliteAddress,null);
      console.log({satelliteAddress})

    });

  });
  
  describe('AddSatellite', () => {
    it('should fail if called by random address', async () => {
        await signerFactory(david.sk);

        const op = aggregatorFactory.methods.addSatellite(trudy.pkh);
        await chai.expect(op.send()).to.be.rejectedWith();
    });

    it('should add trudy', async () => {
        await signerFactory(bob.sk);

        const op = aggregatorFactory.methods.addSatellite(trudy.pkh);
        const tx = await op.send();
        await tx.confirmation();
        const storageAggregatorFactory = await aggregatorFactory.storage();
        assert.deepEqual(storageAggregatorFactory.trackedSatellites.includes(trudy.pkh),true);

        const aggregatorAddresses = Array.from(storageAggregatorFactory.trackedAggregators.values());
        aggregatorAddresses.forEach(async element => {
            let aggregator = await utils.tezos.contract.at(element as string);
            const storageAggregator = await aggregator.storage() as any;
            assert.deepEqual(storageAggregator.oracleAddresses.has(trudy.pkh),true);
      });
    });
  });

  describe('banSatellite', () => {
    it(
      'should fail if called by random address',
      async () => {
        await signerFactory(david.sk);

        const op = aggregatorFactory.methods.banSatellite(trudy.pkh);
        await chai.expect(op.send()).to.be.rejectedWith();
      }
    );

    it('should fail if satellite is not already registered', async () => {

        await signerFactory(bob.sk);

        const op = aggregatorFactory.methods.banSatellite(trudy.pkh);
        const tx = await op.send();
        await tx.confirmation();
        const storageAggregatorFactory = await aggregatorFactory.storage();
        assert.deepEqual(storageAggregatorFactory.trackedSatellites.includes(trudy.pkh),false);

        const aggregatorAddresses = Array.from(storageAggregatorFactory.trackedAggregators.values());
        aggregatorAddresses.forEach(async element => {
            let aggregator = await utils.tezos.contract.at(element as string);
            const storageAggregator = await aggregator.storage() as any;
            assert.deepEqual(storageAggregator.oracleAddresses.has(trudy.pkh),false);
      });
    });
  });

  describe('updateAggregatorConfig', () => {
    const decimals: BigNumber = new BigNumber(100);
    const percentOracleThreshold: BigNumber = new BigNumber(100);
    const rewardAmountXTZ: BigNumber = new BigNumber(100);
    const deviationRewardAmountXTZ: BigNumber = new BigNumber(100);
    const rewardAmountMVK: BigNumber = new BigNumber(100);
    const minimalTezosAmountDeviationTrigger: BigNumber = new BigNumber(100);
    const perthousandDeviationTrigger: BigNumber = new BigNumber(100);
    const maintainer: string = bob.pkh;
    const numberBlocksDelay: BigNumber = new BigNumber(2);
    
    it(
      'should fail if called by random address',
      async () => {

        const aggregator = await utils.tezos.contract.at(satelliteAddress);
        const storage = await aggregator.storage() as any;
        await signerFactory(david.sk);
        const op = aggregatorFactory.methods.updateAggregatorConfig(
          satelliteAddress,
          decimals,
          deviationRewardAmountXTZ,
          maintainer,
          minimalTezosAmountDeviationTrigger,
          perthousandDeviationTrigger,
          percentOracleThreshold,
          rewardAmountMVK,
          rewardAmountXTZ,
          numberBlocksDelay,
        );
        await chai.expect(op.send()).to.be.rejectedWith();
      }
    );

    it(
      'should update an aggregator config',
      async () => {
        await signerFactory(bob.sk);

        const op = aggregatorFactory.methods.updateAggregatorConfig(
          satelliteAddress,
          decimals,
          deviationRewardAmountXTZ,
          maintainer,
          minimalTezosAmountDeviationTrigger,
          perthousandDeviationTrigger,
          percentOracleThreshold,
          rewardAmountMVK,
          rewardAmountXTZ,
          numberBlocksDelay,
        );

        const tx = await op.send();
        await tx.confirmation();

        const aggregator = await utils.tezos.contract.at(satelliteAddress);
        const storage = await aggregator.storage() as any;

        assert.deepEqual(storage.config.decimals,decimals);
        assert.deepEqual(storage.config.percentOracleThreshold,percentOracleThreshold);
        assert.deepEqual(storage.config.rewardAmountXTZ,rewardAmountXTZ);
        assert.deepEqual(storage.config.rewardAmountMVK,rewardAmountMVK);
        assert.deepEqual(storage.config.deviationRewardAmountXTZ,deviationRewardAmountXTZ);
        assert.deepEqual(storage.config.minimalTezosAmountDeviationTrigger,minimalTezosAmountDeviationTrigger);
        assert.deepEqual(storage.config.perthousandDeviationTrigger,perthousandDeviationTrigger);
        assert.deepEqual(storage.config.maintainer,maintainer);
      }
    );
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
      'should update an aggregator admin',
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
});
