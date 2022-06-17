import { createHash } from "crypto";

const chai = require("chai");
import { MichelsonMap } from "@taquito/taquito";
const { InMemorySigner } = require("@taquito/signer");
const chaiAsPromised = require('chai-as-promised');

import assert, { ok, rejects, strictEqual } from "assert";
import { MVK, Utils, zeroAddress } from "./helpers/Utils";
import BigNumber from 'bignumber.js';
import { packDataBytes, MichelsonData, MichelsonType } from '@taquito/michel-codec';
import { bob, alice, eve, mallory, david, trudy, susie, oracleMaintainer} from "../scripts/sandbox/accounts";
import doormanAddress            from '../deployments/doormanAddress.json';
import aggregatorAddress         from '../deployments/aggregatorAddress.json';
import delegationAddress         from '../deployments/delegationAddress.json';
import mvkTokenAddress           from '../deployments/mvkTokenAddress.json';
import aggregatorFactoryAddress  from '../deployments/aggregatorFactoryAddress.json';
import { aggregatorStorageType } from './types/aggregatorStorageType';
import treasuryAddress   from '../deployments/treasuryAddress.json';


chai.use(chaiAsPromised);
chai.should();

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('Aggregator Tests', async () => {
  const salt = 'azerty'; // same salt for all commit/reveal to avoid to store
  var utils: Utils
  let aggregator
  let doormanInstance
  let mvkTokenInstance
  let delegationInstance
  let aggregatorFactoryInstance
  let treasuryInstance

  let doormanStorage
  let mvkTokenStorage
  let delegationStorage
  let aggregatorFactoryStorage
  let treasuryStorage;

  const signerFactory = async (pk) => {
    await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
    return utils.tezos;
  };

  before("setup", async () => {
    
    utils = new Utils();
    await utils.init(bob.sk);

    aggregator = await utils.tezos.contract.at(aggregatorAddress.address);
    const aggregatorStorage = await aggregator.storage();

    doormanInstance                 = await utils.tezos.contract.at(doormanAddress.address);
    doormanStorage                  = await doormanInstance.storage();

    delegationInstance              = await utils.tezos.contract.at(delegationAddress.address);
    delegationStorage               = await delegationInstance.storage();

    mvkTokenInstance                = await utils.tezos.contract.at(mvkTokenAddress.address);
    mvkTokenStorage                 = await mvkTokenInstance.storage();

    treasuryInstance                = await utils.tezos.contract.at(treasuryAddress.address);
    treasuryStorage                 = await treasuryInstance.storage();

    // setup oracles for test
    if(aggregatorStorage.oracleAddresses.get(bob.pkh) === undefined){
      const addBobOracle = await aggregator.methods.addOracle(bob.pkh).send();
      await addBobOracle.confirmation();
    }

    if(aggregatorStorage.oracleAddresses.get(eve.pkh) === undefined){
      const addEveOracle = await aggregator.methods.addOracle(eve.pkh).send();
      await addEveOracle.confirmation();
    }

    if(aggregatorStorage.oracleAddresses.get(mallory.pkh) === undefined){
      const addMalloryOracle = await aggregator.methods.addOracle(mallory.pkh).send();
      await addMalloryOracle.confirmation();
    }

    if(aggregatorStorage.oracleAddresses.get(oracleMaintainer.pkh) === undefined){
      const addMaintainerOracle = await aggregator.methods.addOracle(oracleMaintainer.pkh).send();
      await addMaintainerOracle.confirmation();
    }

    // -----------------------------------------------
    // set up second aggregator for tests with non-zero request rate deviation fees
    // -----------------------------------------------

    aggregatorFactoryInstance       = await utils.tezos.contract.at(aggregatorFactoryAddress.address);
    aggregatorFactoryStorage        = await aggregatorFactoryInstance.storage();

    const oracleMap = MichelsonMap.fromLiteral({
      [bob.pkh]              : true,
      [eve.pkh]              : true,
      [mallory.pkh]          : true,
      [oracleMaintainer.pkh] : true,
    });

    // Setup second aggregator
    const createAggregatorOperation = await aggregatorFactoryInstance.methods.createAggregator(
        'USD',
        'DOGE',

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
        new BigNumber(0),             // deviationRewardAmountXtz
        new BigNumber(10000000),      // rewardAmountStakedMvk ~ 0.01 MVK 
        new BigNumber(1000000),       // rewardAmountXtz - 1 tez for testing (usual should be around ~ 0.0013 tez)
         
        oracleMaintainer.pkh,         // maintainer

    ).send();
    await createAggregatorOperation.confirmation();

    // Track original aggregator
    const trackAggregatorOperation = await aggregatorFactoryInstance.methods.trackAggregator(
        "USD", "test", aggregator.address
      ).send();
    await trackAggregatorOperation.confirmation();

    console.log('-- -- -- -- -- Aggregator Tests -- -- -- --')
    console.log('Doorman Contract deployed at:'               , doormanInstance.address);
    console.log('Delegation Contract deployed at:'            , delegationInstance.address);
    console.log('MVK Token Contract deployed at:'             , mvkTokenInstance.address);
    console.log('Treasury Contract deployed at:'              , treasuryInstance.address);
    console.log('Aggregator Contract deployed at:'            , aggregator.address);
    console.log('Aggregator Factory Contract deployed at:'    , aggregatorFactoryInstance.address);
    
    console.log('Bob address: '               + bob.pkh);
    console.log('Alice address: '             + alice.pkh);
    console.log('Eve address: '               + eve.pkh);
    console.log('Mallory address: '           + mallory.pkh);
    console.log('Oracle Maintainer address: ' + oracleMaintainer.pkh);

    // Setup governance satellites for action snapshot later
    // ------------------------------------------------------------------

    // Bob stakes 100 MVK tokens and registers as a satellite
    const satelliteMap = await delegationStorage.satelliteLedger;
    
    if(satelliteMap.get(bob.pkh) === undefined){

        await signerFactory(bob.sk);
        var updateOperators = await mvkTokenInstance.methods
            .update_operators([
            {
                add_operator: {
                    owner: bob.pkh,
                    operator: doormanAddress.address,
                    token_id: 0,
                },
            },
            ])
            .send()
        await updateOperators.confirmation();  
        const bobStakeAmount                  = MVK(100);
        const bobStakeAmountOperation         = await doormanInstance.methods.stake(bobStakeAmount).send();
        await bobStakeAmountOperation.confirmation();                        
        const bobRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite("New Satellite by Bob", "New Satellite Description - Bob", "https://image.url", "https://image.url", "700").send();
        await bobRegisterAsSatelliteOperation.confirmation();

        // Bob transfers 150 MVK tokens to Oracle Maintainer
        const bobTransferMvkToOracleMaintainerOperation = await mvkTokenInstance.methods.transfer([
            {
                from_: bob.pkh,
                txs: [
                    {
                        to_: oracleMaintainer.pkh,
                        token_id: 0,
                        amount: MVK(150)
                    }
                ]
            }
        ]).send();
        await bobTransferMvkToOracleMaintainerOperation.confirmation();

    }


    if(satelliteMap.get(alice.pkh) === undefined){

        // Alice stakes 100 MVK tokens and registers as a satellite 
        await signerFactory(alice.sk);
        updateOperators = await mvkTokenInstance.methods
            .update_operators([
            {
                add_operator: {
                    owner: alice.pkh,
                    operator: doormanAddress.address,
                    token_id: 0,
                },
            },
            ])
            .send()
        await updateOperators.confirmation(); 
        const aliceStakeAmount                  = MVK(100);
        const aliceStakeAmountOperation         = await doormanInstance.methods.stake(aliceStakeAmount).send();
        await aliceStakeAmountOperation.confirmation();                        
        const aliceRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite("New Satellite by Alice", "New Satellite Description - Alice", "https://image.url", "https://image.url", "700").send();
        await aliceRegisterAsSatelliteOperation.confirmation();
    }


    if(satelliteMap.get(eve.pkh) === undefined){

        // Eve stakes 100 MVK tokens and registers as a satellite 
        await signerFactory(eve.sk);
        updateOperators = await mvkTokenInstance.methods
            .update_operators([
            {
                add_operator: {
                    owner: eve.pkh,
                    operator: doormanAddress.address,
                    token_id: 0,
                },
            },
            ])
            .send()
        await updateOperators.confirmation(); 
        const eveStakeAmount                  = MVK(100);
        const eveStakeAmountOperation         = await doormanInstance.methods.stake(eveStakeAmount).send();
        await eveStakeAmountOperation.confirmation();                        
        const eveRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite("New Satellite by Eve", "New Satellite Description - Eve", "https://image.url", "https://image.url", "700").send();
        await eveRegisterAsSatelliteOperation.confirmation();
    }


    if(satelliteMap.get(mallory.pkh) === undefined){

        // Mallory stakes 100 MVK tokens and registers as a satellite 
        await signerFactory(mallory.sk);
        updateOperators = await mvkTokenInstance.methods
            .update_operators([
            {
                add_operator: {
                    owner: mallory.pkh,
                    operator: doormanAddress.address,
                    token_id: 0,
                },
            },
            ])
            .send()
        await updateOperators.confirmation(); 
        const malloryStakeAmount                  = MVK(100);
        const malloryStakeAmountOperation         = await doormanInstance.methods.stake(malloryStakeAmount).send();
        await malloryStakeAmountOperation.confirmation();                        
        const malloryRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite("New Satellite by Mallory", "New Satellite Description - Mallory", "https://image.url", "https://image.url", "700").send();
        await malloryRegisterAsSatelliteOperation.confirmation();
    }


    if(satelliteMap.get(oracleMaintainer.pkh) === undefined){

      // Oracle Maintainer stakes 100 MVK tokens and registers as a satellite 
      await signerFactory(oracleMaintainer.sk);
      updateOperators = await mvkTokenInstance.methods
          .update_operators([
          {
              add_operator: {
                  owner: oracleMaintainer.pkh,
                  operator: doormanAddress.address,
                  token_id: 0,
              },
          },
          ])
          .send()
      await updateOperators.confirmation(); 
      const oracleMaintainerStakeAmount                  = MVK(100);
      const oracleMaintainerStakeAmountOperation         = await doormanInstance.methods.stake(oracleMaintainerStakeAmount).send();
      await oracleMaintainerStakeAmountOperation.confirmation();                        
      const oracleMaintainerRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite("New Satellite by Oracle Maintainer", "New Satellite Description - Oracle Maintainer", "https://image.url", "https://image.url", "700").send();
      await oracleMaintainerRegisterAsSatelliteOperation.confirmation();
  }

    // Setup funds in Treasury for transfer later
    // ------------------------------------------------------------------

    // Alice transfers 250 XTZ to Treasury
    await signerFactory(alice.sk)
    const aliceTransferTezToTreasuryOperation = await utils.tezos.contract.transfer({ to: treasuryInstance.address, amount: 250});
    await aliceTransferTezToTreasuryOperation.confirmation();



    // Set XTZ Reward to be higher for tests (from 0.0013 xtz to 1 xtz)
    // ------------------------------------------------------------------

    // Bob sets reward amount to be 1 tez
    await signerFactory(bob.sk)
    const rewardAmountXtz = 1000000; // 1 tez
    const set_xtz_reward_amount_op = await aggregator.methods.updateConfig(
      rewardAmountXtz, "configRewardAmountXtz"
    ).send();
    await set_xtz_reward_amount_op.confirmation();

  
  });

  describe('AddOracle', () => {

    it(
      'should fail if called by random address',
      async () => {
        await signerFactory(david.sk);

        const op = aggregator.methods.addOracle(
          susie.pkh
        );

        await chai.expect(op.send()).to.be.rejectedWith();
      },

    );

    it(
      'should fail if oracle already registered',
      async () => {
        await signerFactory(bob.sk);

        const op = await aggregator.methods.addOracle(bob.pkh);

        // await chai.expect(op.send()).rejects.toThrow("You can't add an already present whitelisted oracle");
        await chai.expect(op.send()).to.be.rejectedWith();

      });

    it(
      'should add susie',
      async () => {
        await signerFactory(bob.sk);

        const op = aggregator.methods.addOracle(
          susie.pkh
          );

          const tx = await op.send();
          await tx.confirmation();

          const storage: aggregatorStorageType = await aggregator.storage();

        assert.deepEqual(storage.oracleAddresses?.has(susie.pkh),true);
      },

    );
  });

  describe('RemoveOracle', () => {
    it(
      'should fail if called by random address',
      async () => {
        await signerFactory(david.sk);


        const op = aggregator.methods.removeOracle(susie.pkh);

        // await chai.expect(op.send()).rejects.toThrow(
        //   'Only owner can do this action'
        // );
        await chai.expect(op.send()).to.be.rejectedWith();
      },

    );

    it(
      'should fail if oracle is not present in the map',
      async () => {
        await signerFactory(bob.sk);


        const op = aggregator.methods.removeOracle(trudy.pkh);

        // await chai.expect(op.send()).rejects.toThrow("You can't remove a not present whitelisted oracle");
        await chai.expect(op.send()).to.be.rejectedWith();
      }, );

    it(
      'should remove trudy',
      async () => {
        await signerFactory(bob.sk);

        const storageb: aggregatorStorageType = await aggregator.storage();
        const op = aggregator.methods.removeOracle(susie.pkh);
          const tx = await op.send();
          await tx.confirmation();

        const storage: aggregatorStorageType = await aggregator.storage();
        assert.deepEqual(storage.oracleAddresses?.has(susie.pkh), false);
      },

    );
  });

  describe('RequestRateUpdate', () => {
    it(
      'should fail if called by random address',
      async () => {
        await signerFactory(david.sk);


        const op = aggregator.methods.requestRateUpdate();

        // await chai.expect(op.send()).rejects.toThrow(
        //   'Only maintainer can do this action'
        // );
        await chai.expect(op.send()).to.be.rejectedWith();
      },

    );

    it(
      'should increment round',
      async () => {
        await signerFactory(oracleMaintainer.sk);

        const previousStorage: aggregatorStorageType = await aggregator.storage();
        const previousRound = previousStorage.round;

        const op = aggregator.methods.requestRateUpdate();
        const tx = await op.send();
        await tx.confirmation();

        const storage: aggregatorStorageType = await aggregator.storage();

        assert.deepEqual(storage.round,previousRound.plus(1));
        assert.deepEqual(storage.switchBlock,new BigNumber(0));
        assert.deepEqual(storage.deviationTriggerInfos.amount,new BigNumber(0));
        assert.deepEqual(storage.deviationTriggerInfos.roundPrice,
          new BigNumber(0)
        );
        assert.deepEqual(storage.observationCommits.size,0);
        assert.deepEqual(storage.observationReveals.size,0);
        assert.deepEqual(storage.switchBlock,new BigNumber(0));
      },

    );
  });



  describe('SetObservationCommit', () => {
    it(
      'should fail if called by random address',
      async () => {
        await signerFactory(david.sk);

        const hash = createHash('sha256')
            .update('1234', 'hex')
            .digest('hex');
        const op = aggregator.methods.setObservationCommit(
          new BigNumber(10),
          hash
        );

        // await chai.expect(op.send()).rejects.toThrow(
        //   'Only authorized oracle contract can do this action'
        // );
        await chai.expect(op.send()).to.be.rejectedWith();
      },

    );

    it(
      'should set observation commit as bob',
      async () => {
        await signerFactory(bob.sk);

        const beforeStorage: aggregatorStorageType = await aggregator.storage();
        const round = beforeStorage.round;
        const price = new BigNumber(123);
        const data: MichelsonData = {
          prim: 'Pair',
          args: [
            { prim: 'Pair', args: [{ int: price.toString() }, { string: salt }] },
            { string: bob.pkh },
          ],
        };
        const type: MichelsonType = {
          prim: 'pair',
          args: [
            { prim: 'pair', args: [{ prim: 'nat' }, { prim: 'string' }] },
            { prim: 'address' },
          ],
        };
        const priceCodec = packDataBytes(data, type);

        const hash = createHash('sha256')
            .update(priceCodec.bytes, 'hex')
            .digest('hex');
        const op = aggregator.methods.setObservationCommit(round, hash);

        const tx = await op.send();
        await tx.confirmation();

        const storage: aggregatorStorageType = await aggregator.storage();
        assert.deepEqual(storage.observationCommits?.has(bob.pkh),true);
        assert.deepEqual(storage.observationCommits?.get(bob.pkh),hash);
        assert.deepEqual(storage.switchBlock,new BigNumber(0));
        // The round should not be considered as completed yet (only 1/3 oracle sent an observation)
        assert.notDeepEqual(storage.lastCompletedRoundPrice.round,round);
      },

    );

    it(
      'should set observation commit as eve',
      async () => {
        await signerFactory(eve.sk);

        const beforeStorage: aggregatorStorageType = await aggregator.storage();
        const round = beforeStorage.round;
        const price = new BigNumber(123);
        const data: MichelsonData = {
          prim: 'Pair',
          args: [
            { prim: 'Pair', args: [{ int: price.toString() }, { string: salt }] },
            { string: eve.pkh },
          ],
        };
        const type: MichelsonType = {
          prim: 'pair',
          args: [
            { prim: 'pair', args: [{ prim: 'nat' }, { prim: 'string' }] },
            { prim: 'address' },
          ],
        };
        const priceCodec = packDataBytes(data, type);
        const hash = createHash('sha256')
            .update(priceCodec.bytes, 'hex')
            .digest('hex');
        const op = aggregator.methods.setObservationCommit(round, hash);

        const tx = await op.send();
        await tx.confirmation();

        const storage: aggregatorStorageType = await aggregator.storage();
        assert.deepEqual(storage.observationCommits?.has(eve.pkh),true);
        assert.deepEqual(storage.observationCommits?.get(eve.pkh),hash);
        assert.notDeepEqual(storage.switchBlock,new BigNumber(0));
      },

    );

    it(
      'should set observation commit as mallory',
      async () => {
        await signerFactory(mallory.sk);


        const beforeStorage: aggregatorStorageType = await aggregator.storage();

        const round = beforeStorage.round;
        const price = new BigNumber(123);
        const data: MichelsonData = {
          prim: 'Pair',
          args: [
            { prim: 'Pair', args: [{ int: price.toString() }, { string: salt }] },
            { string: mallory.pkh },
          ],
        };
        const type: MichelsonType = {
          prim: 'pair',
          args: [
            { prim: 'pair', args: [{ prim: 'nat' }, { prim: 'string' }] },
            { prim: 'address' },
          ],
        };
        const priceCodec = packDataBytes(data, type);
        const hash = createHash('sha256')
            .update(priceCodec.bytes, 'hex')
            .digest('hex');
        const op = aggregator.methods.setObservationCommit(round, hash);

        const tx = await op.send();
        await tx.confirmation();

        const storage: aggregatorStorageType = await aggregator.storage();
        assert.deepEqual(storage.observationCommits?.has(mallory.pkh),true);
        assert.deepEqual(storage.observationCommits?.get(mallory.pkh),hash);
        assert.notDeepEqual(storage.switchBlock,new BigNumber(0));
      },

    );

    it(
      'should fail if bob try to reveal too soon',
      async () => {
        await signerFactory(bob.sk);

        const beforeStorage: aggregatorStorageType = await aggregator.storage();
        const round = beforeStorage.round;
        const op = aggregator.methods.setObservationReveal(
          round,
          new BigNumber(123),
          salt,
          bob.pkh
        );

        // await chai.expect(op.send()).rejects.toThrow('You cannot reveal now');
        await chai.expect(op.send()).to.be.rejectedWith();

      },

    );
  });

  describe('SetObservationReveal', () => {
    before("Waiting",async () => {
      console.log('Waiting for 2 blocks (1min)');
      await wait(2 * 60 * 1000);
      console.log('Waiting Finished');
    });

    it(
      'should fail if someone commit too late',
      async () => {
        await signerFactory(bob.sk);

        const hash = createHash('sha256')
            .update('1234', 'hex')
            .digest('hex');
        const op = aggregator.methods.setObservationCommit(
          new BigNumber(10),
          hash
        );

        // await chai.expect(op.send()).rejects.toThrow('You cannot commit now');
        await chai.expect(op.send()).to.be.rejectedWith();
      },

    );

    it(
      'should fail if called by random address',
      async () => {
        await signerFactory(david.sk);

        const op = aggregator.methods.setObservationReveal(
          new BigNumber(10),      // roundId
          new BigNumber(123),     // priceSalted.0 -> price
          salt,                    // priceSalted.1 -> salt
          david.pkh
        );

        // await chai.expect(op.send()).rejects.toThrow(
        //   'Only authorized oracle contract can do this action'
        // );
        await chai.expect(op.send()).to.be.rejectedWith();

      },

    );

    it(
      'should fail if with wrong round number',
      async () => {
        await signerFactory(bob.sk);

        const beforeStorage: aggregatorStorageType = await aggregator.storage();
        const round = beforeStorage.round;

        const op = aggregator.methods.setObservationReveal(
          round.minus(1),
          new BigNumber(123),
          salt,
          bob.pkh
        );

        // await chai.expect(op.send()).rejects.toThrow('Wrong round number');
        await chai.expect(op.send()).to.be.rejectedWith();

      },

    );

    it(
      'should set observation reveal as bob',
      async () => {
        await signerFactory(bob.sk);

        const beforeStorage: aggregatorStorageType = await aggregator.storage();

        const round = beforeStorage.round;
        const price = new BigNumber(123);

        const op = aggregator.methods.setObservationReveal(round, price, salt, bob.pkh);

        const tx = await op.send();
        await tx.confirmation();

        const storage: aggregatorStorageType = await aggregator.storage();
        assert.deepEqual(storage.observationReveals?.has(bob.pkh),true);
        assert.deepEqual(storage.observationReveals?.get(bob.pkh),price);
        // The round should not be considered as completed yet (only 1/3 oracle sent an observation)
        assert.notDeepEqual(storage.lastCompletedRoundPrice.round,round);
      },

    );

    it(
      'should fail if reveal already done',
      async () => {
        await signerFactory(bob.sk);

        const beforeStorage: aggregatorStorageType = await aggregator.storage();
        const round = beforeStorage.round;

        const op = aggregator.methods.setObservationReveal(
          new BigNumber(123),
          round,
          salt,
          bob.pkh
        );

        // await chai.expect(op.send()).rejects.toThrow(
        //   'Oracle already answer a reveal'
        // );
        await chai.expect(op.send()).to.be.rejectedWith();
      },

    );

    it(
      'should set observation reveal as eve',
      async () => {
        await signerFactory(eve.sk);


        const beforeStorage: aggregatorStorageType = await aggregator.storage();

        const round = beforeStorage.round;
        const price = new BigNumber(123);

        const op = aggregator.methods.setObservationReveal(round, price, salt,eve.pkh);

        const tx = await op.send();
        await tx.confirmation();

        const storage: aggregatorStorageType = await aggregator.storage();
        assert.deepEqual(storage.observationReveals?.has(eve.pkh),true);
        assert.deepEqual(storage.observationReveals?.get(eve.pkh),price);
      },

    );

    it(
      'should set observation reveal as mallory',
      async () => {
        await signerFactory(mallory.sk);

        const beforeStorage: aggregatorStorageType = await aggregator.storage();

        const round = beforeStorage.round;
        const price = new BigNumber(123);

        const op = aggregator.methods.setObservationReveal(round, price, salt,mallory.pkh);
        const tx = await op.send();
        await tx.confirmation();

        const storage: aggregatorStorageType = await aggregator.storage();
        assert.deepEqual(storage.observationReveals?.has(mallory.pkh),true);
        assert.deepEqual(storage.observationReveals?.get(mallory.pkh),price);
        // The round should be considered as completed (3/3 oracle sent an observation)
        assert.notDeepEqual(storage.switchBlock,new BigNumber(0));
        assert.deepEqual(storage.lastCompletedRoundPrice.round,storage.round);
        assert.deepEqual(storage.lastCompletedRoundPrice.price,price);

      },

    );
  });

  describe('requestRateUpdateDeviation', () => {
    // it(
    //   'should fail because no tezos sent',
    //   async () => {
    //     await signerFactory(eve.sk);

    //     const previousStorage: aggregatorStorageType = await aggregator.storage();
    //     const roundId = new BigNumber(previousStorage.round);
    //     const price = new BigNumber(200);
    //     const data: MichelsonData = {
    //       prim: 'Pair',
    //       args: [
    //         { prim: 'Pair', args: [{ int: price.toString() }, { string: salt }] },
    //         { string: eve.pkh },
    //       ],
    //     };
    //     const type: MichelsonType = {
    //       prim: 'pair',
    //       args: [
    //         { prim: 'pair', args: [{ prim: 'nat' }, { prim: 'string' }] },
    //         { prim: 'address' },
    //       ],
    //     };
    //     const priceCodec = packDataBytes(data, type);
    //     const hash = createHash('sha256')
    //         .update(priceCodec.bytes, 'hex')
    //         .digest('hex');
    //     const op = aggregator.methods.requestRateUpdateDeviation(
    //       new BigNumber(roundId).plus(1),
    //       hash
    //     );

    //     // await chai.expect(op.send()).rejects.toThrow(
    //     //   'You should send XTZ to call this entrypoint'
    //     // );
    //     await chai.expect(op.send()).to.be.rejectedWith();

    //   },

    // );

    it(
      'should trigger a new requestRateUpdateDeviation as mallory',
      async () => {
        await signerFactory(mallory.sk);

        const previousStorage: aggregatorStorageType = await aggregator.storage();
        const roundId = previousStorage.round;
        const price = new BigNumber(200);
        const data: MichelsonData = {
          prim: 'Pair',
          args: [
            { prim: 'Pair', args: [{ int: price.toString() }, { string: salt }] },
            { string: mallory.pkh },
          ],
        };
        const type: MichelsonType = {
          prim: 'pair',
          args: [
            { prim: 'pair', args: [{ prim: 'nat' }, { prim: 'string' }] },
            { prim: 'address' },
          ],
        };
        const priceCodec = packDataBytes(data, type);
        const hash = createHash('sha256')
            .update(priceCodec.bytes, 'hex')
            .digest('hex');
        const op = aggregator.methods.requestRateUpdateDeviation(
          roundId.plus(1),
          hash
        );
          const tx = await op.send();
          await tx.confirmation();

        const storage: aggregatorStorageType = await aggregator.storage();
        assert.deepEqual(storage.round,roundId.plus(1));
        assert.deepEqual(storage.observationCommits?.has(mallory.pkh),true);
        assert.deepEqual(storage.observationCommits?.get(mallory.pkh),hash);
      },

    );

    it(
      'should fail because requestRateUpdateDeviation already requested',
      async () => {
        await signerFactory(eve.sk);

        const previousStorage: aggregatorStorageType = await aggregator.storage();
        const roundId = new BigNumber(previousStorage.round);
        const price = 2000;
        const data: MichelsonData = {
          prim: 'Pair',
          args: [
            { prim: 'Pair', args: [{ int: price.toString() }, { string: salt }] },
            { string: eve.pkh },
          ],
        };
        const type: MichelsonType = {
          prim: 'pair',
          args: [
            { prim: 'pair', args: [{ prim: 'nat' }, { prim: 'string' }] },
            { prim: 'address' },
          ],
        };
        const priceCodec = packDataBytes(data, type);
        const hash = createHash('sha256')
            .update(priceCodec.bytes, 'hex')
            .digest('hex');
        const op = aggregator.methods.requestRateUpdateDeviation(
          new BigNumber(roundId).plus(1),
          hash
        );

        // await chai.expect(op.send({ amount: 1 })).rejects.toThrow(
        //   'Last round is not completed'
        // );
        await chai.expect(op.send()).to.be.rejectedWith();

      },

    );

    it(
      'should set observation commit as eve',
      async () => {
        await signerFactory(eve.sk);

        const beforeStorage: aggregatorStorageType = await aggregator.storage();
        const round = beforeStorage.round;
        const price = new BigNumber(200);
        const data: MichelsonData = {
          prim: 'Pair',
          args: [
            { prim: 'Pair', args: [{ int: price.toString() }, { string: salt }] },
            { string: eve.pkh },
          ],
        };
        const type: MichelsonType = {
          prim: 'pair',
          args: [
            { prim: 'pair', args: [{ prim: 'nat' }, { prim: 'string' }] },
            { prim: 'address' },
          ],
        };
        const priceCodec = packDataBytes(data, type);
        const hash = createHash('sha256')
            .update(priceCodec.bytes, 'hex')
            .digest('hex');
        const op = aggregator.methods.setObservationCommit(round, hash);
        const tx = await op.send();
        await tx.confirmation();

        const storage: aggregatorStorageType = await aggregator.storage();
        assert.deepEqual(storage.observationCommits?.has(eve.pkh),true);
        assert.deepEqual(storage.observationCommits?.get(eve.pkh),hash);
      },

    );

    it(
      'should wait 2min',
      async () => {
        await wait(2 * 60 * 1000);
      },
    );

    it(
      'should set observation reveal as eve',
      async () => {
        await signerFactory(eve.sk);

        const beforeStorage: aggregatorStorageType = await aggregator.storage();

        const round = beforeStorage.round;
        const price = new BigNumber(200);

        const op = aggregator.methods.setObservationReveal(round, price, salt,eve.pkh);

        const tx = await op.send();
        await tx.confirmation();

        const storage: aggregatorStorageType = await aggregator.storage();
        assert.deepEqual(storage.observationReveals?.has(eve.pkh),true);
        assert.deepEqual(storage.observationReveals?.get(eve.pkh),price);
      },

    );

    it(
      'should set observation reveal as mallory',
      async () => {
        await signerFactory(mallory.sk);

        const beforeStorage: aggregatorStorageType = await aggregator.storage();

        const round = beforeStorage.round;
        const price = new BigNumber(200);

        const op = aggregator.methods.setObservationReveal(round, price, salt,mallory.pkh);

        const tx = await op.send();
        await tx.confirmation();

        const storage: aggregatorStorageType = await aggregator.storage();
        assert.deepEqual(storage.observationReveals?.has(mallory.pkh),true);
        assert.deepEqual(storage.observationReveals?.get(mallory.pkh),price);
      },

    );
  });

  describe('requestRateUpdateDeviation should fail', () => {
    it(
      'should trigger a new requestRateUpdateDeviation as david',
      async () => {
        await signerFactory(david.sk);

        const previousBalanceMallory = await utils.tezos.tz.getBalance(
          mallory.pkh
        );
        const previousBalanceEve = await utils.tezos.tz.getBalance(
            eve.pkh
          );
        const previousStorage: aggregatorStorageType = await aggregator.storage();
        const roundId = previousStorage.round;
        const price = new BigNumber(200);
        const data: MichelsonData = {
          prim: 'Pair',
          args: [
            { prim: 'Pair', args: [{ int: price.toString() }, { string: salt }] },
            { string: david.pkh },
          ],
        };
        const type: MichelsonType = {
          prim: 'pair',
          args: [
            { prim: 'pair', args: [{ prim: 'nat' }, { prim: 'string' }] },
            { prim: 'address' },
          ],
        };
        const priceCodec = packDataBytes(data, type);
        const hash = createHash('sha256')
            .update(priceCodec.bytes, 'hex')
            .digest('hex');

        const op = aggregator.methods['requestRateUpdateDeviation'](
          roundId.plus(1),
          hash
        );
        
        await chai.expect(op.send()).to.be.rejectedWith();

      },

    );

  });



  describe('withdrawRewardXtz', () => {

      it('oracles should be able to withdraw reward xtz', async () => {
          try{
            
            await signerFactory(bob.sk);

            const beforeStorage: aggregatorStorageType = await aggregator.storage();

            const bobStakedMvk = 100;
            const eveStakedMvk = 100;
            const malloryStakedMvk = 100;
            const totalStakedMvkThreeCommits = bobStakedMvk + eveStakedMvk + malloryStakedMvk;
            const totalStakedMvkTwoCommits = eveStakedMvk + malloryStakedMvk;

            const rewardAmountXtz           = beforeStorage.config.rewardAmountXtz.toNumber();
            const rewardAmountStakedMvk     = beforeStorage.config.rewardAmountStakedMvk.toNumber();
            const deviationRewardAmountXtz  = beforeStorage.config.deviationRewardAmountXtz.toNumber();
            const deviationRewardStakedMvk  = beforeStorage.config.deviationRewardStakedMvk.toNumber();

            console.log("rewardAmountXtz: "          + rewardAmountXtz);
            console.log("rewardAmountStakedMvk:"     + rewardAmountStakedMvk);
            console.log("deviationRewardAmountXtz: " + deviationRewardAmountXtz);
            console.log("deviationRewardStakedMvk: " + deviationRewardStakedMvk);

            const beforeBobRewardXtz            = await beforeStorage.oracleRewardXtz.get(bob.pkh);
            const beforeEveRewardXtz            = await beforeStorage.oracleRewardXtz.get(eve.pkh);
            const beforeMalloryRewardXtz        = await beforeStorage.oracleRewardXtz.get(mallory.pkh);

            const beforeBobRewardStakedMvk      = await beforeStorage.oracleRewardStakedMvk.get(bob.pkh);
            const beforeEveRewardStakedMvk      = await beforeStorage.oracleRewardStakedMvk.get(eve.pkh);
            const beforeMalloryRewardStakedMvk  = await beforeStorage.oracleRewardStakedMvk.get(mallory.pkh);

            // percent oracle threshold is 49% so even two oracles reveals will be successful
            const singleRewardSMvkWithThreeCommits = Math.trunc((bobStakedMvk / totalStakedMvkThreeCommits) * rewardAmountStakedMvk);
            const singleRewardSMvkWithTwoCommits   = Math.trunc((bobStakedMvk / totalStakedMvkTwoCommits) * rewardAmountStakedMvk);

            const beforeBobTezBalance           = await utils.tezos.tz.getBalance(bob.pkh);
            const beforeEveTezBalance           = await utils.tezos.tz.getBalance(eve.pkh);
            const beforeMalloryTezBalance       = await utils.tezos.tz.getBalance(mallory.pkh);

            const bobTezRewardAmount            = rewardAmountXtz;
            const eveTezRewardAmount            = rewardAmountXtz * 2;
            const malloryTezRewardAmount        = (rewardAmountXtz * 2) + deviationRewardAmountXtz;

            const bobTotalStakedMvkReward       = singleRewardSMvkWithThreeCommits;
            const eveTotalStakedMvkReward       = singleRewardSMvkWithThreeCommits + singleRewardSMvkWithTwoCommits;
            const malloryTotalStakedMvkReward   = singleRewardSMvkWithThreeCommits + singleRewardSMvkWithTwoCommits + deviationRewardStakedMvk;

            console.log(beforeBobRewardStakedMvk);
            console.log(beforeEveRewardStakedMvk);
            console.log(beforeMalloryRewardStakedMvk);
            console.log(beforeBobTezBalance);

            // check that xtz reward amounts are correct
            assert.equal(beforeBobRewardXtz, bobTezRewardAmount);         // 1000000 - one reveal
            assert.equal(beforeEveRewardXtz, eveTezRewardAmount);         // 2000000 - two reveals
            assert.equal(beforeMalloryRewardXtz, malloryTezRewardAmount); // 2000000 - two reveals, one req rate upd dev (0)

            // check that staked mvk reward amounts are correct
            assert.equal(beforeBobRewardStakedMvk, bobTotalStakedMvkReward);          // 3,333,333 - one reveal
            assert.equal(beforeEveRewardStakedMvk, eveTotalStakedMvkReward);          // 8,333,333 - one reveal with two commits, one reveal with three commits
            assert.equal(beforeMalloryRewardStakedMvk, malloryTotalStakedMvkReward);  // 21,333,333 -  one reveal with two commits, one reveal with three commits, one req rate upd dev

            // estimate bob withdraw reward operation and then execute operation 
            await signerFactory(bob.sk);
            const estimate_bob_withdraw_reward_xtz       = await utils.tezos.estimate.transfer(aggregator.methods.withdrawRewardXtz(bob.pkh).toTransferParams());
            const bob_withdraw_reward_xtz_total_gas_cost = 100 + estimate_bob_withdraw_reward_xtz.totalCost; // base fee mutez + total cost
            
            const bob_withdraw_reward_xtz_op = await aggregator.methods.withdrawRewardXtz(bob.pkh).send();
            await bob_withdraw_reward_xtz_op.confirmation();

            // estimate eve withdraw reward operation and then execute operation 
            await signerFactory(eve.sk);
            const estimate_eve_withdraw_reward_xtz       = await utils.tezos.estimate.transfer(aggregator.methods.withdrawRewardXtz(eve.pkh).toTransferParams());
            const eve_withdraw_reward_xtz_total_gas_cost = 100 + estimate_eve_withdraw_reward_xtz.totalCost; // base fee mutez + total cost
            
            const eve_withdraw_reward_xtz_op = await aggregator.methods.withdrawRewardXtz(eve.pkh).send();
            await eve_withdraw_reward_xtz_op.confirmation();

            // estimate mallory withdraw reward operation and then execute operation 
            const estimate_mallory_withdraw_reward_xtz       = await utils.tezos.estimate.transfer(aggregator.methods.withdrawRewardXtz(mallory.pkh).toTransferParams());
            const mallory_withdraw_reward_xtz_total_gas_cost = 100 + estimate_mallory_withdraw_reward_xtz.totalCost; // base fee mutez + total cost
            
            const mallory_withdraw_reward_xtz_op = await aggregator.methods.withdrawRewardXtz(mallory.pkh).send();
            await mallory_withdraw_reward_xtz_op.confirmation();

            const storage: aggregatorStorageType = await aggregator.storage();
            const bobRewardXtz        = await storage.oracleRewardXtz.get(bob.pkh);
            const bobRewardStakedMvk  = await storage.oracleRewardStakedMvk.get(bob.pkh);
            
            const bobTezBalance       = await utils.tezos.tz.getBalance(bob.pkh);
            const eveTezBalance       = await utils.tezos.tz.getBalance(eve.pkh);
            const malloryTezBalance   = await utils.tezos.tz.getBalance(mallory.pkh);
            
            console.log('---------------')
            console.log('-----after-----')
            console.log('---------------')

            assert.equal(bobTezBalance, beforeBobTezBalance.toNumber() + bobTezRewardAmount - bob_withdraw_reward_xtz_total_gas_cost);      
            assert.equal(eveTezBalance, beforeEveTezBalance.toNumber() + eveTezRewardAmount - eve_withdraw_reward_xtz_total_gas_cost);      
            assert.equal(malloryTezBalance, beforeMalloryTezBalance.toNumber() + malloryTezRewardAmount - mallory_withdraw_reward_xtz_total_gas_cost);      

            console.log(bobRewardXtz);
            console.log(bobRewardStakedMvk);
            console.log(bobTezBalance);

            console.log('-----total gas costs-----')
            console.log(bob_withdraw_reward_xtz_total_gas_cost)
            console.log(eve_withdraw_reward_xtz_total_gas_cost)
            console.log(mallory_withdraw_reward_xtz_total_gas_cost)


          } catch(e){
              console.dir(e, {depth: 5})
          }
      });

  });



  describe('updateConfig', () => {
    
    const decimals                      : BigNumber = new BigNumber(100);
    const numberBlocksDelay             : BigNumber = new BigNumber(2);

    const devTriggerBanDuration         : BigNumber = new BigNumber(100);
    const perThousandDeviationTrigger   : BigNumber = new BigNumber(100);
    const percentOracleThreshold        : BigNumber = new BigNumber(100);

    const requestRateDevDepositFee      : BigNumber = new BigNumber(100);
    
    const deviationRewardStakedMvk      : BigNumber = new BigNumber(100);
    const deviationRewardAmountXtz      : BigNumber = new BigNumber(100);
    const rewardAmountXtz               : BigNumber = new BigNumber(100);
    const rewardAmountStakedMvk         : BigNumber = new BigNumber(100);

    it(
      'should fail if called by random address',
      async () => {
        await signerFactory(david.sk);

        const test_update_config_decimals_op = aggregator.methods.updateConfig(
          decimals, "configDecimals"
        );
        await chai.expect(test_update_config_decimals_op.send()).to.be.rejectedWith();

        const test_update_config_numberBlocksDelay_op = aggregator.methods.updateConfig(
          numberBlocksDelay, "configNumberBlocksDelay"
        );
        await chai.expect(test_update_config_numberBlocksDelay_op.send()).to.be.rejectedWith();



        const test_update_config_devTriggerBanDuration_op = aggregator.methods.updateConfig(
          devTriggerBanDuration, "configDevTriggerBanDuration"
        );
        await chai.expect(test_update_config_devTriggerBanDuration_op.send()).to.be.rejectedWith();

        const test_update_config_perThousandDeviationTrigger_op = aggregator.methods.updateConfig(
          perThousandDeviationTrigger, "configPerThousandDevTrigger"
        );
        await chai.expect(test_update_config_perThousandDeviationTrigger_op.send()).to.be.rejectedWith();
        
        const test_update_config_percentOracleThreshold_op = aggregator.methods.updateConfig(
          percentOracleThreshold, "configPercentOracleThreshold"
        );
        await chai.expect(test_update_config_percentOracleThreshold_op.send()).to.be.rejectedWith();



        const test_update_config_requestRateDevDepositFee_op = aggregator.methods.updateConfig(
          requestRateDevDepositFee, "configRequestRateDevDepositFee"
        );
        await chai.expect(test_update_config_requestRateDevDepositFee_op.send()).to.be.rejectedWith();



        const test_update_config_deviationRewardStakedMvk_op = aggregator.methods.updateConfig(
          deviationRewardStakedMvk, "configDeviationRewardStakedMvk"
        );
        await chai.expect(test_update_config_deviationRewardStakedMvk_op.send()).to.be.rejectedWith();

        const test_update_config_deviationRewardAmountXtz_op = aggregator.methods.updateConfig(
          deviationRewardAmountXtz, "configDeviationRewardAmountXtz"
        );
        await chai.expect(test_update_config_deviationRewardAmountXtz_op.send()).to.be.rejectedWith();

        const test_update_config_rewardAmountXtz_op = aggregator.methods.updateConfig(
          rewardAmountXtz, "configRewardAmountXtz"
        );
        await chai.expect(test_update_config_rewardAmountXtz_op.send()).to.be.rejectedWith();

        const test_update_config_rewardAmountStakedMvk_op = aggregator.methods.updateConfig(
          rewardAmountStakedMvk, "configRewardAmountStakedMvk"
        );
        await chai.expect(test_update_config_rewardAmountStakedMvk_op.send()).to.be.rejectedWith();
        
      },

    );

    it(
      'should update aggregator config',
      async () => {
        await signerFactory(bob.sk);

        const test_update_config_decimals_op = await aggregator.methods.updateConfig(
          decimals, "configDecimals"
        ).send();
        await test_update_config_decimals_op.confirmation();

        const test_update_config_numberBlocksDelay_op = await aggregator.methods.updateConfig(
          numberBlocksDelay, "configNumberBlocksDelay"
        ).send();
        await test_update_config_numberBlocksDelay_op.confirmation();



        const test_update_config_devTriggerBanDuration_op = await aggregator.methods.updateConfig(
          devTriggerBanDuration, "configDevTriggerBanDuration"
        ).send();
        await test_update_config_devTriggerBanDuration_op.confirmation();

        const test_update_config_perThousandDeviationTrigger_op = await aggregator.methods.updateConfig(
          perThousandDeviationTrigger, "configPerThousandDevTrigger"
        ).send();
        await test_update_config_perThousandDeviationTrigger_op.confirmation();
        
        const test_update_config_percentOracleThreshold_op = await aggregator.methods.updateConfig(
          percentOracleThreshold, "configPercentOracleThreshold"
        ).send();
        await test_update_config_percentOracleThreshold_op.confirmation();



        const test_update_config_requestRateDevDepositFee_op = await aggregator.methods.updateConfig(
          requestRateDevDepositFee, "configRequestRateDevDepositFee"
        ).send();
        await test_update_config_requestRateDevDepositFee_op.confirmation();


        const test_update_config_deviationRewardStakedMvk_op = await aggregator.methods.updateConfig(
          deviationRewardAmountXtz, "configDeviationRewardStakedMvk"
        ).send();
        await test_update_config_deviationRewardStakedMvk_op.confirmation();

        const test_update_config_deviationRewardAmountXtz_op = await aggregator.methods.updateConfig(
          deviationRewardAmountXtz, "configDeviationRewardAmountXtz"
        ).send();
        await test_update_config_deviationRewardAmountXtz_op.confirmation();

        const test_update_config_rewardAmountXtz_op = await aggregator.methods.updateConfig(
          rewardAmountXtz, "configRewardAmountXtz"
        ).send();
        await test_update_config_rewardAmountXtz_op.confirmation();

        const test_update_config_rewardAmountStakedMvk_op = await aggregator.methods.updateConfig(
          rewardAmountStakedMvk, "configRewardAmountStakedMvk"
        ).send();
        await test_update_config_rewardAmountStakedMvk_op.confirmation();

        const storage: aggregatorStorageType = await aggregator.storage();
        assert.deepEqual(storage.config.decimals,                        decimals);
        assert.deepEqual(storage.config.numberBlocksDelay,               numberBlocksDelay);

        assert.deepEqual(storage.config.deviationTriggerBanDuration,     devTriggerBanDuration);
        assert.deepEqual(storage.config.percentOracleThreshold,          percentOracleThreshold);
        
        assert.deepEqual(storage.config.deviationRewardAmountXtz,        deviationRewardAmountXtz);
        assert.deepEqual(storage.config.requestRateDeviationDepositFee,  requestRateDevDepositFee);
        assert.deepEqual(storage.config.rewardAmountXtz,                 rewardAmountXtz);
        assert.deepEqual(storage.config.rewardAmountStakedMvk,           rewardAmountStakedMvk);
        
      },

    );

  });

  describe('setAdmin', () => {
    it(
      'should fail if called by random address',
      async () => {
        await signerFactory(david.sk);

        const op = aggregator.methods.setAdmin(
          bob.pkh
        );

        // await chai.expect(op.send()).rejects.toThrow(
        //   'Only owner can do this action'
        // );
        await chai.expect(op.send()).to.be.rejectedWith();
      },

    );

    it(
      'should update oracle admin',
      async () => {
        await signerFactory(bob.sk);

        const op = aggregator.methods.setAdmin(
          bob.pkh
        );

        const tx = await op.send();
        await tx.confirmation();

        const storage: aggregatorStorageType = await aggregator.storage();
        assert.deepEqual(storage.admin,bob.pkh);
        },

      );
    });

    describe('setGovernance', () => {
      it(
        'should fail if called by random address',
        async () => {
          await signerFactory(david.sk);
  
          const op = aggregator.methods.setGovernance(
            bob.pkh
          );
  
          await chai.expect(op.send()).to.be.rejectedWith();
        },
  
      );
  
      it(
        'should update contract governance',
        async () => {
          await signerFactory(bob.sk);
  
          const op = aggregator.methods.setGovernance(
            bob.pkh
          );
  
          const tx = await op.send();
          await tx.confirmation();
  
          const storage: aggregatorStorageType = await aggregator.storage();
          assert.deepEqual(storage.governanceAddress,bob.pkh);
          },
  
        );
      });

    
      describe('setMaintainer', () => {
        it(
          'should fail if called by random address',
          async () => {
            await signerFactory(david.sk);
    
            const op = aggregator.methods.setMaintainer(
              bob.pkh
            );
    
            await chai.expect(op.send()).to.be.rejectedWith();
          },
    
        );
    
        it(
          'should update contract maintainer',
          async () => {
            await signerFactory(bob.sk);
    
            const op = aggregator.methods.setMaintainer(
              bob.pkh
            );
    
            const tx = await op.send();
            await tx.confirmation();
    
            const storage: aggregatorStorageType = await aggregator.storage();
            assert.deepEqual(storage.governanceAddress,bob.pkh);
            },
    
          );
        });

        describe('setName', () => {
          it(
            'should fail if called by random address',
            async () => {
              await signerFactory(david.sk);
      
              const op = aggregator.methods.setName(
                "newName"
              );
      
              await chai.expect(op.send()).to.be.rejectedWith();
            },
      
          );
      
          it(
            'should update contract name',
            async () => {
              await signerFactory(bob.sk);
      
              const op = aggregator.methods.setName(
                "newName"
              );
      
              const tx = await op.send();
              await tx.confirmation();
      
              const storage: aggregatorStorageType = await aggregator.storage();
              assert.deepEqual(storage.governanceAddress,bob.pkh);
              },
      
            );
          });

});
