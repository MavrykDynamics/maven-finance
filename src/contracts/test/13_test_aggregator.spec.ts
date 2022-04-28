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
import { AggregatorFactoryContractAbstraction } from '../lib/aggregatorFactory';
import {
  AggregatorContractAbstraction,
  AggregatorStorage,
} from '../lib/aggregator';
import { packDataBytes } from '@taquito/michel-codec';

import { bob, alice, eve, mallory, oscar, trudy, isaac, david, susie, ivan } from "../scripts/sandbox/accounts";
import aggregatorAddress from '../deployments/aggregatorAddress.json';
import aggregatorFactoryAddress from '../deployments/aggregatorFactoryAddress.json';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const sha256 = require("sha256");
import { TextEncoder } from 'util'
global.TextEncoder = TextEncoder

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('Aggregator', () => {
  let tezosToolkits: Record<AccountName, TezosToolkit>;
  let aggregatorAddress: string;
  let addresses: MigrationResult;
  const salt = 'azerty'; // same salt for all commit/reveal to avoid to store
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
    const aggregatorFactoryAddress =
      addresses[AGGREGATOR_FACTORY_SMART_CONTRACT_ADDRESS];

    const aggregatorFactory = await tezosToolkits.alice.contract.at<
      AggregatorFactoryContractAbstraction<ContractProvider>
    >(aggregatorFactoryAddress);

    const createTestAggregator = await aggregatorFactory.methods
      .createAggregator(
        'USD',
        'TEST',
        MichelsonMap.fromLiteral({
          [accountPerNetwork['development'].bob.pkh]:
            accountPerNetwork['development'].bob.pk,
          [accountPerNetwork['development'].eve.pkh]:
            accountPerNetwork['development'].eve.pk,
          [accountPerNetwork['development'].mallory.pkh]:
            accountPerNetwork['development'].mallory.pk,
          [accountPerNetwork['development'].oscar.pkh]:
            accountPerNetwork['development'].oscar.pk,
        }) as MichelsonMap<string, string>,
        addresses[MVK_TOKEN_SMART_CONTRACT_ADDRESS],
        new BigNumber(0),
        accountPerNetwork['development'].bob.pkh,
        new BigNumber(1),
        new BigNumber(2),
        new BigNumber(49),
        new BigNumber(5),
        new BigNumber(1),
        new BigNumber(10000),
        accountPerNetwork['development'].alice.pkh
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

  describe('AddOracle', () => {
    it(
      'should fail if called by random address',
      async () => {
        const aggregator =
          await tezosToolkits.david.contract.at<AggregatorContractAbstraction>(
            aggregatorAddress
          );

        const op = aggregator.methods.addOracle(
          accounts.trudy.pkh
        );

        await expect(op.send()).rejects.toThrow(
          'Only owner can do this action'
        );
      },
      timeoutMS
    );

    it(
      'should fail if oracle already registered',
      async () => {
        const aggregator =
          await tezosToolkits.alice.contract.at<AggregatorContractAbstraction>(
            aggregatorAddress
          );

        const op = aggregator.methods.addOracle(accounts.bob.pkh,accounts.bob.pk);

        await expect(op.send()).rejects.toThrow("You can't add an already present whitelisted oracle");
      }, timeoutMS);

    it(
      'should add trudy',
      async () => {
        const aggregator =
          await tezosToolkits.alice.contract.at<AggregatorContractAbstraction>(
            aggregatorAddress
          );

        const op = aggregator.methods.addOracle(
          accounts.trudy.pkh
        );
        const tx = await op.send();
        await tx.confirmation();

        const storage: AggregatorStorage = await aggregator.storage();

        expect(storage.oracleAddresses.has(accounts.trudy.pkh)).toBeTruthy();
      },
      timeoutMS
    );
  });

  describe('RemoveOracle', () => {
    it(
      'should fail if called by random address',
      async () => {
        const aggregator =
          await tezosToolkits.david.contract.at<AggregatorContractAbstraction>(
            aggregatorAddress
          );

        const op = aggregator.methods.removeOracle(accounts.trudy.pkh);

        await expect(op.send()).rejects.toThrow(
          'Only owner can do this action'
        );
      },
      timeoutMS
    );

    it(
      'should fail if oracle is not present in the map',
      async () => {
        const aggregator =
          await tezosToolkits.alice.contract.at<AggregatorContractAbstraction>(
            aggregatorAddress
          );

        const op = aggregator.methods.removeOracle(accounts.susie.pkh);

        await expect(op.send()).rejects.toThrow("You can't remove a not present whitelisted oracle");
      }, timeoutMS);

    it(
      'should remove trudy',
      async () => {
        const aggregator =
          await tezosToolkits.alice.contract.at<AggregatorContractAbstraction>(
            aggregatorAddress
          );

        const op = aggregator.methods.removeOracle(accounts.trudy.pkh);
        const tx = await op.send();
        await tx.confirmation();

        const storage: AggregatorStorage = await aggregator.storage();

        expect(storage.oracleAddresses.has(accounts.trudy.pkh)).toBeFalsy();
      },
      timeoutMS
    );
  });

  describe('RequestRateUpdate', () => {
    it(
      'should fail if called by random address',
      async () => {
        const aggregator =
          await tezosToolkits.david.contract.at<AggregatorContractAbstraction>(
            aggregatorAddress
          );

        const op = aggregator.methods.requestRateUpdate();

        await expect(op.send()).rejects.toThrow(
          'Only maintainer can do this action'
        );
      },
      timeoutMS
    );

    it(
      'should increment round',
      async () => {
        const aggregator =
          await tezosToolkits.bob.contract.at<AggregatorContractAbstraction>(
            aggregatorAddress
          );

        const previousStorage: AggregatorStorage = await aggregator.storage();
        const previousRound = previousStorage.round;

        const op = aggregator.methods.requestRateUpdate();
        const tx = await op.send();
        await tx.confirmation();

        const storage: AggregatorStorage = await aggregator.storage();

        expect(storage.round).toEqual(previousRound.plus(1));
        expect(storage.switchBlock).toEqual(new BigNumber(0));
        expect(storage.deviationTriggerInfos.amount).toEqual(new BigNumber(0));
        expect(storage.deviationTriggerInfos.roundPrice).toEqual(
          new BigNumber(0)
        );
        expect(storage.observationCommits.size).toEqual(0);
        expect(storage.observationReveals.size).toEqual(0);
        expect(storage.switchBlock).toEqual(new BigNumber(0));
      },
      timeoutMS
    );
  });

  describe('SetObservationCommit', () => {
    it(
      'should fail if called by random address',
      async () => {
        const aggregator =
          await tezosToolkits.david.contract.at<AggregatorContractAbstraction>(
            aggregatorAddress
          );

        const hash = sha256('1234');
        const op = aggregator.methods.setObservationCommit(
          new BigNumber(10),
          hash
        );

        await expect(op.send()).rejects.toThrow(
          'Only authorized oracle contract can do this action'
        );
      },
      timeoutMS
    );

    it(
      'should set observation commit as bob',
      async () => {
        const aggregator =
          await tezosToolkits.bob.contract.at<AggregatorContractAbstraction>(
            aggregatorAddress
          );

        const beforeStorage: AggregatorStorage = await aggregator.storage();

        const round = beforeStorage.round;
        const price = new BigNumber(123);
        const data: any = { prim: "Pair", args: [ { int: price.toNumber() }, { string: salt } ] };
        const typ: any = { prim: "pair", args: [ { prim: "int" }, { prim: "string" } ] };
        const priceCodec = packDataBytes(data,typ);

        const hash = sha256(priceCodec.bytes);
        const op = aggregator.methods.setObservationCommit(round, hash);

        const tx = await op.send();
        await tx.confirmation();

        const storage: AggregatorStorage = await aggregator.storage();

        expect(storage.observationCommits?.has(accounts.bob.pkh)).toBeTruthy();

        expect(storage.observationCommits?.get(accounts.bob.pkh)).toEqual(
          hash
        );

        // The round should not be considered as completed yet (only 1/3 oracle sent an observation)
        expect(storage.lastCompletedRoundPrice.round).not.toEqual(round);
      },
      timeoutMS
    );

    it(
      'should set observation commit as eve',
      async () => {
        const aggregator =
          await tezosToolkits.eve.contract.at<AggregatorContractAbstraction>(
            aggregatorAddress
          );

        const beforeStorage: AggregatorStorage = await aggregator.storage();

        const round = beforeStorage.round;
        const price = new BigNumber(123);
        const data: any = { prim: "Pair", args: [ { int: price.toNumber() }, { string: salt } ] };
        const typ: any = { prim: "pair", args: [ { prim: "int" }, { prim: "string" } ] };
        const priceCodec = packDataBytes(data,typ);
        const sign = await tezosToolkits.eve.signer.sign(priceCodec.bytes);

        const op = aggregator.methods.setObservationCommit(round, sign.sig);

        const tx = await op.send();
        await tx.confirmation();

        const storage: AggregatorStorage = await aggregator.storage();

        expect(storage.observationCommits?.has(accounts.eve.pkh)).toBeTruthy();

        expect(storage.observationCommits?.get(accounts.eve.pkh)).toEqual(
          hash
        );
      },
      timeoutMS
    );

    it(
      'should set observation commit as mallory',
      async () => {
        const aggregator =
          await tezosToolkits.mallory.contract.at<AggregatorContractAbstraction>(
            aggregatorAddress
          );

        const beforeStorage: AggregatorStorage = await aggregator.storage();

        const round = beforeStorage.round;
        const price = new BigNumber(123);
        const data: any = { prim: "Pair", args: [ { int: price.toNumber() }, { string: salt } ] };
        const typ: any = { prim: "pair", args: [ { prim: "int" }, { prim: "string" } ] };
        const priceCodec = packDataBytes(data,typ);
        const sign = await tezosToolkits.mallory.signer.sign(priceCodec.bytes);

        const op = aggregator.methods.setObservationCommit(round, sign.sig);

        const tx = await op.send();
        await tx.confirmation();

        const storage: AggregatorStorage = await aggregator.storage();

        expect(
          storage.observationCommits?.has(accounts.mallory.pkh)
        ).toBeTruthy();

        expect(storage.observationCommits?.get(accounts.mallory.pkh)).toEqual(
          hash
        );
        expect(storage.switchBlock).not.toEqual(new BigNumber(0));
      },
      timeoutMS
    );

    it(
      'should fail if bob try to reveal too soon',
      async () => {
        const aggregator =
          await tezosToolkits.bob.contract.at<AggregatorContractAbstraction>(
            aggregatorAddress
          );
        const beforeStorage: AggregatorStorage = await aggregator.storage();
        const round = beforeStorage.round;

        const op = aggregator.methods.setObservationReveal(
          new BigNumber(123),
          salt,
          round
        );

        await expect(op.send()).rejects.toThrow('You cannot reveal now');
      },
      timeoutMS
    );
  });

  describe('SetObservationReveal', () => {
    beforeAll(async () => {
      console.log('Waiting for 2 blocks (1min)');
      await wait(2 * 60 * 1000);
      console.log('Waiting Finished');
    }, 3 * 60 * 1000);

    it(
      'should fail if someone commit too late',
      async () => {
        const aggregator =
          await tezosToolkits.bob.contract.at<AggregatorContractAbstraction>(
            aggregatorAddress
          );

        const hash = sha256('1234');

        const op = aggregator.methods.setObservationCommit(
          new BigNumber(10),
          hash
        );

        await expect(op.send()).rejects.toThrow('You cannot commit now');
      },
      timeoutMS
    );

    it(
      'should fail if called by random address',
      async () => {
        const aggregator =
          await tezosToolkits.david.contract.at<AggregatorContractAbstraction>(
            aggregatorAddress
          );
        const op = aggregator.methods.setObservationReveal(
          new BigNumber(10),
          salt,
          new BigNumber(123)
        );

        await expect(op.send()).rejects.toThrow(
          'Only authorized oracle contract can do this action'
        );
      },
      timeoutMS
    );

    it(
      'should fail if with wrong round number',
      async () => {
        const aggregator =
          await tezosToolkits.bob.contract.at<AggregatorContractAbstraction>(
            aggregatorAddress
          );
        const beforeStorage: AggregatorStorage = await aggregator.storage();
        const round = beforeStorage.round;

        const op = aggregator.methods.setObservationReveal(
          new BigNumber(123),
          salt,
          round.minus(1)
        );

        await expect(op.send()).rejects.toThrow('Wrong round number');
      },
      timeoutMS
    );

    // it(
    //   'should fail if with wrong signature value',
    //   async () => {
    //     const aggregator =
    //       await tezosToolkits.bob.contract.at<AggregatorContractAbstraction>(
    //         aggregatorAddress
    //       );
    //       const beforeStorage: AggregatorStorage = await aggregator.storage();
    //       const round = beforeStorage.round;

    //     const op = aggregator.methods.setObservationReveal(
    //       new BigNumber(120),
    //       round
    //     );

    //     await expect(op.send()).rejects.toThrow(
    //       'This reveal does not match your commitment'
    //     );
    //   },
    //   timeoutMS
    // );

    it(
      'should set observation reveal as bob',
      async () => {
        const aggregator =
          await tezosToolkits.bob.contract.at<AggregatorContractAbstraction>(
            aggregatorAddress
          );

        const beforeStorage: AggregatorStorage = await aggregator.storage();

        const round = beforeStorage.round;
        const price = new BigNumber(123);

        const op = aggregator.methods.setObservationReveal(price, salt, round);

        const tx = await op.send();
        await tx.confirmation();

        const storage: AggregatorStorage = await aggregator.storage();

        expect(storage.observationReveals?.has(accounts.bob.pkh)).toBeTruthy();

        expect(storage.observationReveals?.get(accounts.bob.pkh)).toEqual(
          price
        );

        // The round should not be considered as completed yet (only 1/3 oracle sent an observation)
        expect(storage.lastCompletedRoundPrice.round).not.toEqual(round);
      },
      timeoutMS
    );

    it(
      'should fail if reveal already did',
      async () => {
        const aggregator =
          await tezosToolkits.bob.contract.at<AggregatorContractAbstraction>(
            aggregatorAddress
          );
        const beforeStorage: AggregatorStorage = await aggregator.storage();
        const round = beforeStorage.round;

        const op = aggregator.methods.setObservationReveal(
          new BigNumber(123),
          salt,
          round
        );

        await expect(op.send()).rejects.toThrow(
          'Oracle already answer a reveal'
        );
      },
      timeoutMS
    );

    it(
      'should set observation reveal as eve',
      async () => {
        const aggregator =
          await tezosToolkits.eve.contract.at<AggregatorContractAbstraction>(
            aggregatorAddress
          );

        const beforeStorage: AggregatorStorage = await aggregator.storage();

        const round = beforeStorage.round;
        const price = new BigNumber(123);

        const op = aggregator.methods.setObservationReveal(price, salt, round);

        const tx = await op.send();
        await tx.confirmation();

        const storage: AggregatorStorage = await aggregator.storage();

        expect(storage.observationReveals?.has(accounts.eve.pkh)).toBeTruthy();

        expect(storage.observationReveals?.get(accounts.eve.pkh)).toEqual(
          price
        );
      },
      timeoutMS
    );

    it(
      'should set observation reveal as mallory',
      async () => {
        const aggregator =
          await tezosToolkits.mallory.contract.at<AggregatorContractAbstraction>(
            aggregatorAddress
          );

        const beforeStorage: AggregatorStorage = await aggregator.storage();

        const round = beforeStorage.round;
        const price = new BigNumber(123);

        const op = aggregator.methods.setObservationReveal(price, salt, round);

        const tx = await op.send();
        await tx.confirmation();

        const storage: AggregatorStorage = await aggregator.storage();

        expect(
          storage.observationReveals?.has(accounts.mallory.pkh)
        ).toBeTruthy();

        expect(storage.observationReveals?.get(accounts.mallory.pkh)).toEqual(
          price
        );
        expect(storage.switchBlock).not.toEqual(new BigNumber(0));

        // The round should be considered as completed (3/3 oracle sent an observation)
        expect(storage.lastCompletedRoundPrice.round).toEqual(round);
        expect(storage.lastCompletedRoundPrice.price).toEqual(price);
      },
      timeoutMS
    );
  });

  describe('requestRateUpdateDeviation', () => {
    it(
      'should fail because no tezos sent',
      async () => {
        const aggregator = await tezosToolkits.eve.contract.at(
          aggregatorAddress
        );
        const previousStorage: AggregatorStorage = await aggregator.storage();
        const roundId = new BigNumber(previousStorage.round);
        const price = new BigNumber(200);
        const priceCodec = packDataBytes({ int: price }, { prim: 'bytes' });
        const hash = sha256(priceCodec.bytes);
        const op = aggregator.methods['requestRateUpdateDeviation'](
          new BigNumber(roundId).plus(1),
          hash
        );

        await expect(op.send()).rejects.toThrow(
          'You should send XTZ to call this entrypoint'
        );
      },
      timeoutMS
    );

    it(
      'should trigger a new requestRateUpdateDeviation as mallory',
      async () => {
        const aggregator = await tezosToolkits.mallory.contract.at(
          aggregatorAddress
        );
        const previousStorage: AggregatorStorage = await aggregator.storage();
        const roundId = previousStorage.round;
        const price = new BigNumber(200);
        const data: any = { prim: "Pair", args: [ { int: price.toNumber() }, { string: salt } ] };
        const typ: any = { prim: "pair", args: [ { prim: "int" }, { prim: "string" } ] };
        const priceCodec = packDataBytes(data,typ);
        const sign = await tezosToolkits.mallory.signer.sign(priceCodec.bytes);

        const op = aggregator.methods['requestRateUpdateDeviation'](
          roundId.plus(1),
          hash
        );
        const tx = await op.send({ amount: 1 });
        await tx.confirmation();

        const storage: AggregatorStorage = await aggregator.storage();
        expect(storage.round).toEqual(roundId.plus(1));
      },
      timeoutMS
    );

    it(
      'should fail because requestRateUpdateDeviation already requested',
      async () => {
        const aggregator = await tezosToolkits.eve.contract.at(
          aggregatorAddress
        );
        const previousStorage: AggregatorStorage = await aggregator.storage();
        const roundId = new BigNumber(previousStorage.round);
        const price = 2000;
        const data: any = { prim: "Pair", args: [ { int: price }, { string: salt } ] };
        const typ: any = { prim: "pair", args: [ { prim: "int" }, { prim: "string" } ] };
        const priceCodec = packDataBytes(data,typ);
        const sign = await tezosToolkits.mallory.signer.sign(priceCodec.bytes);
        const op = aggregator.methods['requestRateUpdateDeviation'](
          new BigNumber(roundId).plus(1),
          hash
        );

        await expect(op.send({ amount: 1 })).rejects.toThrow(
          'Last round is not completed'
        );
      },
      timeoutMS
    );

    it(
      'should set observation commit as eve',
      async () => {
        const aggregator =
          await tezosToolkits.eve.contract.at<AggregatorContractAbstraction>(
            aggregatorAddress
          );
        const beforeStorage: AggregatorStorage = await aggregator.storage();
        const round = beforeStorage.round;
        const price = new BigNumber(200);
        const data: any = { prim: "Pair", args: [ { int: price.toNumber() }, { string: salt } ] };
        const typ: any = { prim: "pair", args: [ { prim: "int" }, { prim: "string" } ] };
        const priceCodec = packDataBytes(data,typ);
        const sign = await tezosToolkits.eve.signer.sign(priceCodec.bytes);
        const op = aggregator.methods.setObservationCommit(round, sign.sig);
        const tx = await op.send();
        await tx.confirmation();

        const storage: AggregatorStorage = await aggregator.storage();
        expect(storage.observationCommits?.has(accounts.eve.pkh)).toBeTruthy();
        expect(storage.observationCommits?.get(accounts.eve.pkh)).toEqual(
          hash
        );

        // expect(storage.lastCompletedRoundPrice.round).toEqual(round);
        // expect(storage.lastCompletedRoundPrice.price).toEqual(price);
      },
      timeoutMS
    );

    it(
      'should wait 2min',
      async () => {
        await wait(2 * 60 * 1000);
      },
      3 * 60 * 1000
    );

    it(
      'should set observation reveal as eve',
      async () => {
        const aggregator =
          await tezosToolkits.eve.contract.at<AggregatorContractAbstraction>(
            aggregatorAddress
          );

        const beforeStorage: AggregatorStorage = await aggregator.storage();

        const round = beforeStorage.round;
        const price = new BigNumber(200);

        const op = aggregator.methods.setObservationReveal(price, salt, round);

        const tx = await op.send();
        await tx.confirmation();

        const storage: AggregatorStorage = await aggregator.storage();

        expect(storage.observationReveals?.has(accounts.eve.pkh)).toBeTruthy();

        expect(storage.observationReveals?.get(accounts.eve.pkh)).toEqual(
          price
        );
      },
      timeoutMS
    );

    it(
      'should set observation reveal as mallory',
      async () => {
        const aggregator =
          await tezosToolkits.mallory.contract.at<AggregatorContractAbstraction>(
            aggregatorAddress
          );

        const beforeStorage: AggregatorStorage = await aggregator.storage();

        const round = beforeStorage.round;
        const price = new BigNumber(200);

        const op = aggregator.methods.setObservationReveal(price, salt, round);

        const tx = await op.send();
        await tx.confirmation();

        const storage: AggregatorStorage = await aggregator.storage();

        expect(
          storage.observationReveals?.has(accounts.mallory.pkh)
        ).toBeTruthy();

        expect(storage.observationReveals?.get(accounts.mallory.pkh)).toEqual(
          price
        );
      },
      timeoutMS
    );
  });

  describe('requestRateUpdateDeviation should fail', () => {
    it(
      'should trigger a new requestRateUpdateDeviation as oscar',
      async () => {
        const aggregator = await tezosToolkits.oscar.contract.at(
          aggregatorAddress
        );
        const previousBalanceMallory = await tezosToolkits.bob.tz.getBalance(
          accounts.mallory.pkh
        );
        const previousStorage: AggregatorStorage = await aggregator.storage();
        const roundId = previousStorage.round;
        const price = new BigNumber(200);
        const data: any = { prim: "Pair", args: [ { int: price.toNumber() }, { string: salt } ] };
        const typ: any = { prim: "pair", args: [ { prim: "int" }, { prim: "string" } ] };
        const priceCodec = packDataBytes(data,typ);
                const sign = await tezosToolkits.oscar.signer.sign(priceCodec.bytes);


        const op = aggregator.methods['requestRateUpdateDeviation'](
          roundId.plus(1),
          hash
        );
        const tx = await op.send({ amount: 1 });
        await tx.confirmation();

        const storage: AggregatorStorage = await aggregator.storage();
        const BalanceMallory = await tezosToolkits.oscar.tz.getBalance(
          accounts.mallory.pkh
        );
        expect(storage.round).toEqual(roundId.plus(1));
        expect(BalanceMallory).toEqual(previousBalanceMallory.plus(1000000));
      },
      timeoutMS
    );

    it(
      'should set observation commit as eve',
      async () => {
        const aggregator =
          await tezosToolkits.eve.contract.at<AggregatorContractAbstraction>(
            aggregatorAddress
          );
        const beforeStorage: AggregatorStorage = await aggregator.storage();
        const round = beforeStorage.round;
        const price = new BigNumber(200);
        const data: any = { prim: "Pair", args: [ { int: price.toNumber() }, { string: salt } ] };
        const typ: any = { prim: "pair", args: [ { prim: "int" }, { prim: "string" } ] };
        const priceCodec = packDataBytes(data,typ);
        const sign = await tezosToolkits.eve.signer.sign(priceCodec.bytes);
        const op = aggregator.methods.setObservationCommit(round, sign.sig);
        const tx = await op.send();
        await tx.confirmation();

        const storage: AggregatorStorage = await aggregator.storage();
        expect(storage.observationCommits?.has(accounts.eve.pkh)).toBeTruthy();
        expect(storage.observationCommits?.get(accounts.eve.pkh)).toEqual(
          hash
        );

        // expect(storage.lastCompletedRoundPrice.round).toEqual(round);
        // expect(storage.lastCompletedRoundPrice.price).toEqual(price);
      },
      timeoutMS
    );

    it(
      'should wait 2min',
      async () => {
        await wait(2 * 60 * 1000);
      },
      3 * 60 * 1000
    );

    it(
      'should set observation reveal as eve',
      async () => {
        const aggregator =
          await tezosToolkits.eve.contract.at<AggregatorContractAbstraction>(
            aggregatorAddress
          );

        const beforeStorage: AggregatorStorage = await aggregator.storage();

        const round = beforeStorage.round;
        const price = new BigNumber(200);

        const op = aggregator.methods.setObservationReveal(price, salt, round);

        const tx = await op.send();
        await tx.confirmation();

        const storage: AggregatorStorage = await aggregator.storage();

        expect(storage.observationReveals?.has(accounts.eve.pkh)).toBeTruthy();

        expect(storage.observationReveals?.get(accounts.eve.pkh)).toEqual(
          price
        );
      },
      timeoutMS
    );

    it(
      'should set observation reveal as oscar',
      async () => {
        const aggregator =
          await tezosToolkits.oscar.contract.at<AggregatorContractAbstraction>(
            aggregatorAddress
          );

        const beforeStorage: AggregatorStorage = await aggregator.storage();

        const round = beforeStorage.round;
        const price = new BigNumber(200);

        const op = aggregator.methods.setObservationReveal(price, salt, round);

        const tx = await op.send();
        await tx.confirmation();

        const storage: AggregatorStorage = await aggregator.storage();

        expect(
          storage.observationReveals?.has(accounts.oscar.pkh)
        ).toBeTruthy();

        expect(storage.observationReveals?.get(accounts.oscar.pkh)).toEqual(
          price
        );
      },
      timeoutMS
    );

    it(
      'should requestRateUpdate + give not back the tezos amount',
      async () => {
        const aggregator =
          await tezosToolkits.bob.contract.at<AggregatorContractAbstraction>(
            aggregatorAddress
          );
        const previousBalanceoscar = await tezosToolkits.bob.tz.getBalance(
          accounts.oscar.pkh
        );

        const previousStorage: AggregatorStorage = await aggregator.storage();
        const previousRound = previousStorage.round;

        const op = aggregator.methods.requestRateUpdate();
        const tx = await op.send();
        await tx.confirmation();

        const storage: AggregatorStorage = await aggregator.storage();
        const Balanceoscar = await tezosToolkits.oscar.tz.getBalance(
          accounts.oscar.pkh
        );
        expect(storage.round).toEqual(previousRound.plus(1));
        expect(Balanceoscar).toEqual(previousBalanceoscar);
      },
      timeoutMS
    );
  });

  describe('UpdateAggregatorConfig', () => {
    const decimals: BigNumber = new BigNumber(100);
    const percentOracleThreshold: BigNumber = new BigNumber(100);
    const rewardAmountXTZ: BigNumber = new BigNumber(100);
    const rewardAmountMVK: BigNumber = new BigNumber(100);
    const minimalTezosAmountDeviationTrigger: BigNumber = new BigNumber(100);
    const perthousandDeviationTrigger: BigNumber = new BigNumber(100);
    const numberBlocksDelay: BigNumber = new BigNumber(2);
    const maintainer: string = accountPerNetwork['development'].bob.pkh;
    it(
      'should fail if called by random address',
      async () => {
        const aggregator =
          await tezosToolkits.david.contract.at<AggregatorContractAbstraction>(
            aggregatorAddress
          );

        const op = aggregator.methods.updateAggregatorConfig(
          decimals,
          maintainer,
          minimalTezosAmountDeviationTrigger,
          numberBlocksDelay,
          perthousandDeviationTrigger,
          percentOracleThreshold,
          rewardAmountXTZ,
          rewardAmountMVK
        );

        await expect(op.send()).rejects.toThrow(
          'Only owner can do this action'
        );
      },
      timeoutMS
    );

    it(
      'should update oracle config',
      async () => {
        const aggregator =
          await tezosToolkits.alice.contract.at<AggregatorContractAbstraction>(
            aggregatorAddress
          );

        const op = aggregator.methods.updateAggregatorConfig(
          decimals,
          maintainer,
          minimalTezosAmountDeviationTrigger,
          numberBlocksDelay,
          perthousandDeviationTrigger,
          percentOracleThreshold,
          rewardAmountXTZ,
          rewardAmountMVK
        );

        const tx = await op.send();
        await tx.confirmation();

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

  describe('updateOwner', () => {
    it(
      'should fail if called by random address',
      async () => {
        const aggregator =
          await tezosToolkits.david.contract.at<AggregatorContractAbstraction>(
            aggregatorAddress
          );

        const op = aggregator.methods.updateOwner(
          accountPerNetwork['development'].bob.pkh
        );

        await expect(op.send()).rejects.toThrow(
          'Only owner can do this action'
        );
      },
      timeoutMS
    );

    it(
      'should update oracle owner',
      async () => {
        const aggregator =
          await tezosToolkits.alice.contract.at<AggregatorContractAbstraction>(
            aggregatorAddress
          );

        const op = aggregator.methods.updateOwner(
          accountPerNetwork['development'].bob.pkh
        );

        const tx = await op.send();
        await tx.confirmation();

        const storage: AggregatorStorage = await aggregator.storage();

          expect(storage.owner).toEqual(
            accountPerNetwork['development'].bob.pkh
          );
        },
        timeoutMS
      );
    });

});
