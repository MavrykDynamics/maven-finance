import { TezosToolkit } from '@taquito/taquito';
// import { AccountName, accountPerNetwork, accounts } from '../lib/accounts';

import { getTezosToolkitFor } from './helper';
import BigNumber from 'bignumber.js';
import {
  AGGREGATOR_FACTORY_SMART_CONTRACT_ADDRESS,
  default as deployer,
  MigrationResult,
  MVK_TOKEN_SMART_CONTRACT_ADDRESS,
} from '../lib/migrations/00_aggregator';
import { networkConfig } from '../lib/scripts/env';
import { ContractProvider } from '@taquito/taquito/dist/types/contract/interface';
import { MichelsonMap } from '@taquito/michelson-encoder';
import {
  AggregatorFactoryContractAbstraction,
  AggregatorFactoryStorage,
} from '../lib/aggregatorFactory';
import {
  AggregatorContractAbstraction,
  AggregatorStorage,
} from '../lib/aggregator';

import { bob, alice, eve, mallory, oscar, trudy, isaac, david, susie, ivan } from "../scripts/sandbox/accounts";
import aggregatorAddress from '../deployments/aggregatorAddress.json';
import aggregatorFactoryAddress from '../deployments/aggregatorFactoryAddress.json';

describe('AggregatorFactory', () => {
  let tezosToolkits: Record<AccountName, TezosToolkit>;
  let aggregatorAddress: string;
  let aggregatorFactoryAddress: string;
  let addresses: MigrationResult;
  const timeoutMS = 10000;
  beforeAll(async () => {
    tezosToolkits = {
      alice: await getTezosToolkitFor('alice'),
      bob: await getTezosToolkitFor('bob'),
      eve: await getTezosToolkitFor('eve'),
      mallory: await getTezosToolkitFor('mallory'),
      oscar: await getTezosToolkitFor('oscar'),
      trudy: await getTezosToolkitFor('trudy'),
      isaac: await getTezosToolkitFor('isaac'),
      david: await getTezosToolkitFor('david'),
      susie: await getTezosToolkitFor('susie'),
      ivan: await getTezosToolkitFor('ivan'),
    };

    addresses = await deployer(networkConfig, 'development');
    console.log('deployer step completed with result: ', addresses);
    aggregatorFactoryAddress =
      addresses[AGGREGATOR_FACTORY_SMART_CONTRACT_ADDRESS];

    const aggregatorFactory = await tezosToolkits.alice.contract.at<
      AggregatorFactoryContractAbstraction<ContractProvider>
    >(aggregatorFactoryAddress);

    const createTestAggregator = await aggregatorFactory.methods
      .createAggregator(
        'USD',
        'TEST',
        MichelsonMap.fromLiteral({
          [accountPerNetwork['development'].bob.pkh]: accountPerNetwork['development'].bob.pk,
          [accountPerNetwork['development'].eve.pkh]: accountPerNetwork['development'].eve.pk,
          [accountPerNetwork['development'].mallory.pkh]: accountPerNetwork['development'].mallory.pk,
          [accountPerNetwork['development'].oscar.pkh]: accountPerNetwork['development'].oscar.pk,
        }) as MichelsonMap<string, string>,
        addresses[MVK_TOKEN_SMART_CONTRACT_ADDRESS],
        new BigNumber(0),
        accountPerNetwork['development'].bob.pkh,
        new BigNumber(1),
        new BigNumber(2),
        new BigNumber(60),
        new BigNumber(5),
        new BigNumber(10000),
        new BigNumber(1),
        aggregatorFactoryAddress
      )
      .send();

    await createTestAggregator.confirmation();

    const aggregatorFactoryStorage = await aggregatorFactory.storage();

    aggregatorAddress = aggregatorFactoryStorage.trackedAggregators.get({
      0: 'USD',
      1: 'TEST',
    }) as string;
  }, 120000);

  beforeEach(async () => {
    // noop
  });

  describe('AddSatellite', () => {
    it('should fail if called by random address', async () => {
      const aggregatorFactory =
        await tezosToolkits.david.contract.at<AggregatorFactoryContractAbstraction>(
          aggregatorFactoryAddress
        );

      const op = aggregatorFactory.methods.addSatellite(accounts.trudy.pkh);
      await expect(op.send()).rejects.toThrow('ONLY_ADMINISTRATOR_ALLOWED');
    }, timeoutMS);

    it('should add trudy', async () => {
      const aggregatorFactory =
        await tezosToolkits.alice.contract.at<AggregatorFactoryContractAbstraction>(
          aggregatorFactoryAddress
        );

      const op = aggregatorFactory.methods.addSatellite(accounts.trudy.pkh);
      const tx = await op.send();
      await tx.confirmation();

      const storageAggregatorFactory: AggregatorFactoryStorage = await aggregatorFactory.storage();
      expect(storageAggregatorFactory.trackedSatellite.includes(accounts.trudy.pkh)).toBeTruthy();

      const aggregatorAddresses = Array.from(storageAggregatorFactory.trackedAggregators.values());
      aggregatorAddresses.forEach(async element => {
        const aggregator =
        await tezosToolkits.david.contract.at<AggregatorContractAbstraction>(
          element as unknown as string
        );
        const storageAggregator: AggregatorStorage = await aggregator.storage();
        expect(storageAggregator.oracleAddresses.has(accounts.trudy.pkh)).toBeTruthy();
      });
    }, timeoutMS);
  });

  describe('banSatellite', () => {
    it(
      'should fail if called by random address',
      async () => {
        const aggregatorFactory =
          await tezosToolkits.david.contract.at<AggregatorFactoryContractAbstraction>(
            aggregatorFactoryAddress
          );

        const op = aggregatorFactory.methods.banSatellite(accounts.trudy.pkh);
        await expect(op.send()).rejects.toThrow('ONLY_ADMINISTRATOR_ALLOWED');
      },
      timeoutMS
    );

    it('should fail if satellite is not already registered', async () => {
      const aggregatorFactory =
        await tezosToolkits.alice.contract.at<AggregatorFactoryContractAbstraction>(
          aggregatorFactoryAddress
        );

      const op = aggregatorFactory.methods.banSatellite(accounts.susie.pkh);
      await expect(op.send()).rejects.toThrow("You can't perform things on a not registered satellite");
    }, timeoutMS);

    it('should add trudy', async () => {
      const aggregatorFactory =
        await tezosToolkits.alice.contract.at<AggregatorFactoryContractAbstraction>(
          aggregatorFactoryAddress
        );

      const op = aggregatorFactory.methods.banSatellite(accounts.trudy.pkh);
      const tx = await op.send();
      await tx.confirmation();

      const storageAggregatorFactory: AggregatorFactoryStorage = await aggregatorFactory.storage();
      expect(storageAggregatorFactory.trackedSatellite.includes(accounts.trudy.pkh)).toBeFalsy();

      const aggregatorAddresses = Array.from(storageAggregatorFactory.trackedAggregators.values());
      aggregatorAddresses.forEach(async element => {
        const aggregator =
        await tezosToolkits.david.contract.at<AggregatorContractAbstraction>(
          element as unknown as string
        );
        const storageAggregator: AggregatorStorage = await aggregator.storage();
        expect(storageAggregator.oracleAddresses.has(accounts.trudy.pkh)).toBeFalsy();
      });
    }, timeoutMS);
  });

  describe('updateAggregatorConfig', () => {
    const decimals: BigNumber = new BigNumber(100);
    const percentOracleThreshold: BigNumber = new BigNumber(100);
    const rewardAmountXTZ: BigNumber = new BigNumber(100);
    const rewardAmountMVK: BigNumber = new BigNumber(100);
    const minimalTezosAmountDeviationTrigger: BigNumber = new BigNumber(100);
    const perthousandDeviationTrigger: BigNumber = new BigNumber(100);
    const maintainer: string = accountPerNetwork['development'].bob.pkh;
    const numberBlocksDelay: BigNumber = new BigNumber(2);

    it(
      'should fail if called by random address',
      async () => {
        const aggregatorFactory =
          await tezosToolkits.david.contract.at<AggregatorFactoryContractAbstraction>(
            aggregatorFactoryAddress
          );

        const op = aggregatorFactory.methods.updateAggregatorConfig(
          decimals,
          maintainer,
          minimalTezosAmountDeviationTrigger,
          numberBlocksDelay,
          perthousandDeviationTrigger,
          percentOracleThreshold,
          rewardAmountXTZ,
          rewardAmountMVK,
          aggregatorAddress
        );

        await expect(op.send()).rejects.toThrow('ONLY_ADMINISTRATOR_ALLOWED');
      },
      timeoutMS
    );

    it(
      'should update an aggregator config',
      async () => {
        const aggregatorFactory =
          await tezosToolkits.alice.contract.at<AggregatorFactoryContractAbstraction>(
            aggregatorFactoryAddress
          );

        const op = aggregatorFactory.methods.updateAggregatorConfig(
          decimals,
          maintainer,
          minimalTezosAmountDeviationTrigger,
          numberBlocksDelay,
          perthousandDeviationTrigger,
          percentOracleThreshold,
          rewardAmountXTZ,
          rewardAmountMVK,
          aggregatorAddress,
        );

        const tx = await op.send();
        await tx.confirmation();

        const aggregator =
          await tezosToolkits.alice.contract.at<AggregatorContractAbstraction>(
            aggregatorAddress
          );
        const storage: AggregatorStorage = await aggregator.storage();

        expect(storage.aggregatorConfig.decimals).toEqual(decimals);
        expect(storage.aggregatorConfig.percentOracleThreshold).toEqual(
          percentOracleThreshold
        );
        expect(storage.aggregatorConfig.rewardAmountXTZ).toEqual(
          rewardAmountXTZ
        );
        expect(storage.aggregatorConfig.rewardAmountMVK).toEqual(
          rewardAmountMVK
        );
        expect(
          storage.aggregatorConfig.minimalTezosAmountDeviationTrigger
        ).toEqual(minimalTezosAmountDeviationTrigger);
        expect(storage.aggregatorConfig.perthousandDeviationTrigger).toEqual(
          perthousandDeviationTrigger
        );
        expect(storage.aggregatorConfig.maintainer).toEqual(maintainer);
      },
      timeoutMS
    );
  });

  describe('updateAggregatorOwner', () => {

    it(
      'should fail if called by random address',
      async () => {
        const aggregatorFactory =
          await tezosToolkits.david.contract.at<AggregatorFactoryContractAbstraction>(
            aggregatorFactoryAddress
          );

        const op = aggregatorFactory.methods.updateAggregatorOwner(
          accountPerNetwork['development'].bob.pkh,
          aggregatorAddress
        );

        await expect(op.send()).rejects.toThrow('ONLY_ADMINISTRATOR_ALLOWED');
      },
      timeoutMS
    );

    it(
      'should update an aggregator owner',
      async () => {
        const aggregatorFactory =
          await tezosToolkits.alice.contract.at<AggregatorFactoryContractAbstraction>(
            aggregatorFactoryAddress
          );

        const op = aggregatorFactory.methods.updateAggregatorOwner(
          accountPerNetwork['development'].bob.pkh,
          aggregatorAddress
        );

        const tx = await op.send();
        await tx.confirmation();

        const aggregator =
          await tezosToolkits.alice.contract.at<AggregatorContractAbstraction>(
            aggregatorAddress
          );
        const storage: AggregatorStorage = await aggregator.storage();

        expect(storage.owner).toEqual(accountPerNetwork['development'].bob.pkh);
      },
      timeoutMS
    );
  });
});
