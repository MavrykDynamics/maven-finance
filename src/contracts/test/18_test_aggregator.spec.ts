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
import doormanAddress               from '../deployments/doormanAddress.json';
import aggregatorAddress            from '../deployments/aggregatorAddress.json';
import delegationAddress            from '../deployments/delegationAddress.json';
import mvkTokenAddress              from '../deployments/mvkTokenAddress.json';
import governanceAddress            from '../deployments/governanceAddress.json';
import aggregatorFactoryAddress     from '../deployments/aggregatorFactoryAddress.json';
import governanceSatelliteAddress   from '../deployments/governanceSatelliteAddress.json';
import { aggregatorStorageType }    from './types/aggregatorStorageType';
import treasuryAddress   from '../deployments/treasuryAddress.json';

interface IOracleObservationType {
    data: BigNumber;
    epoch: number;
    round: number;
    aggregatorAddress: string;
}

chai.use(chaiAsPromised);
chai.should();

function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('Aggregator Tests', async () => {

    var utils: Utils
    let aggregatorInstance;
    let doormanInstance;
    let mvkTokenInstance;
    let delegationInstance;
    let aggregatorFactoryInstance;
    let treasuryInstance;
    let governanceSatelliteInstance;

    let aggregatorStorage;
    let doormanStorage;
    let mvkTokenStorage;
    let delegationStorage;
    let aggregatorFactoryStorage;
    let treasuryStorage;
    let governanceSatelliteStorage;

    let epoch: number = 1;
    let round: number = 1;

    const signerFactory = async (pk) => {
        await utils.tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
        return utils.tezos;
    };

    before("setup", async () => {
        
        utils = new Utils();
        await utils.init(bob.sk);

        aggregatorInstance              = await utils.tezos.contract.at(aggregatorAddress.address);
        aggregatorStorage               = await aggregatorInstance.storage();

        doormanInstance                 = await utils.tezos.contract.at(doormanAddress.address);
        doormanStorage                  = await doormanInstance.storage();

        delegationInstance              = await utils.tezos.contract.at(delegationAddress.address);
        delegationStorage               = await delegationInstance.storage();

        mvkTokenInstance                = await utils.tezos.contract.at(mvkTokenAddress.address);
        mvkTokenStorage                 = await mvkTokenInstance.storage();

        treasuryInstance                = await utils.tezos.contract.at(treasuryAddress.address);
        treasuryStorage                 = await treasuryInstance.storage();

        governanceSatelliteInstance     = await utils.tezos.contract.at(governanceSatelliteAddress.address);
        governanceSatelliteStorage      = await governanceSatelliteInstance.storage();

        aggregatorFactoryInstance       = await utils.tezos.contract.at(aggregatorFactoryAddress.address);
        aggregatorFactoryStorage        = await aggregatorFactoryInstance.storage();

        // Track original aggregator if it is not currently tracked
        const trackedAggregators = await aggregatorFactoryStorage.trackedAggregators;
        if(!trackedAggregators.includes(aggregatorInstance.address)){
            const trackAggregatorOperation = await aggregatorFactoryInstance.methods.trackAggregator(aggregatorInstance.address).send();
            await trackAggregatorOperation.confirmation();
        }

        console.log('-- -- -- -- -- Aggregator Tests -- -- -- --')
        console.log('Doorman Contract deployed at:'               , doormanInstance.address);
        console.log('Delegation Contract deployed at:'            , delegationInstance.address);
        console.log('MVK Token Contract deployed at:'             , mvkTokenInstance.address);
        console.log('Treasury Contract deployed at:'              , treasuryInstance.address);
        console.log('Aggregator Contract deployed at:'            , aggregatorInstance.address);
        console.log('Aggregator Factory Contract deployed at:'    , aggregatorFactoryInstance.address);
        
        console.log('Bob address: '               + bob.pkh);
        console.log('Alice address: '             + alice.pkh);
        console.log('Eve address: '               + eve.pkh);
        console.log('Mallory address: '           + mallory.pkh);
        console.log('Oracle Maintainer address: ' + oracleMaintainer.pkh);

        // Setup governance satellites for action snapshot later
        // ------------------------------------------------------------------

        // Bob stakes 100 MVK tokens and registers as a satellite
        const bobSatellite      = await delegationStorage.satelliteLedger.get(bob.pkh);
        const aliceSatellite    = await delegationStorage.satelliteLedger.get(alice.pkh);
        const mallorySatellite  = await delegationStorage.satelliteLedger.get(mallory.pkh);
        const eveSatellite      = await delegationStorage.satelliteLedger.get(eve.pkh);
        const susieSatellite    = await delegationStorage.satelliteLedger.get(susie.pkh);
        const oracleSatellite   = await delegationStorage.satelliteLedger.get(oracleMaintainer.pkh);

        if(bobSatellite === undefined){

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
            const bobRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite(
                "New Satellite by Bob", 
                "New Satellite Description - Bob", 
                "https://image.url", 
                "https://image.url", 
                "1000",
                bob.pk,
                bob.peerId
            ).send();
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

        if(aliceSatellite === undefined){

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
            const aliceRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite(
                "New Satellite by Alice", 
                "New Satellite Description - Alice",
                "https://image.url", 
                "https://image.url", 
                "1000",
                alice.pk,
                alice.peerId
            ).send();
            await aliceRegisterAsSatelliteOperation.confirmation();
        }

        if(eveSatellite === undefined){

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
            const eveRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite(
                "New Satellite by Eve", 
                "New Satellite Description - Eve", 
                "https://image.url", 
                "https://image.url", 
                "1000",
                eve.pk,
                eve.peerId
            ).send();
            await eveRegisterAsSatelliteOperation.confirmation();
        }

        if(mallorySatellite === undefined){

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
            const malloryRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite(
                "New Satellite by Mallory", 
                "New Satellite Description - Mallory", 
                "https://image.url", 
                "https://image.url", 
                "1000",
                mallory.pk,
                mallory.peerId
            ).send();
            await malloryRegisterAsSatelliteOperation.confirmation();
        }

        if(susieSatellite === undefined){

            // Susie stakes 100 MVK tokens and registers as a satellite 
            await signerFactory(susie.sk);
            updateOperators = await mvkTokenInstance.methods
                .update_operators([
                {
                    add_operator: {
                        owner: susie.pkh,
                        operator: doormanAddress.address,
                        token_id: 0,
                    },
                },
                ])
                .send()
            await updateOperators.confirmation(); 
            const susieStakeAmount                  = MVK(100);
            const susieStakeAmountOperation         = await doormanInstance.methods.stake(susieStakeAmount).send();
            await susieStakeAmountOperation.confirmation();                        
            const susieRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite(
                "New Satellite by Susie", 
                "New Satellite Description - Susie", 
                "https://image.url", 
                "https://image.url", 
                "1000",
                susie.pk,
                susie.peerId
            ).send();
            await susieRegisterAsSatelliteOperation.confirmation();
        }

        if(oracleSatellite === undefined){

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
            const oracleMaintainerRegisterAsSatelliteOperation = await delegationInstance.methods.registerAsSatellite(
                "New Satellite by Oracle Maintainer", 
                "New Satellite Description - Oracle Maintainer", 
                "https://image.url", 
                "https://image.url", 
                "1000",
                oracleMaintainer.pk,
                oracleMaintainer.peerId
            ).send();
            await oracleMaintainerRegisterAsSatelliteOperation.confirmation();
        }

        // ------------------------------------------------------------------
        // Setup oracles for test
        // ------------------------------------------------------------------
        
        // bob as admin
        await signerFactory(bob.sk);

        if(aggregatorStorage.oracleAddresses.get(bob.pkh) === undefined){
            const addBobOracle = await aggregatorInstance.methods.addOracle(
                bob.pkh
            ).send();
            await addBobOracle.confirmation();
        }

        if(aggregatorStorage.oracleAddresses.get(eve.pkh) === undefined){
            const addEveOracle = await aggregatorInstance.methods.addOracle(
                eve.pkh
            ).send();
            await addEveOracle.confirmation();
        }

        if(aggregatorStorage.oracleAddresses.get(mallory.pkh) === undefined){
            const addMalloryOracle = await aggregatorInstance.methods.addOracle(
                mallory.pkh
            ).send();
            await addMalloryOracle.confirmation();
        }

        if(aggregatorStorage.oracleAddresses.get(oracleMaintainer.pkh) === undefined){
            const addMaintainerOracle = await aggregatorInstance.methods.addOracle(
                oracleMaintainer.pkh
            ).send();
            await addMaintainerOracle.confirmation();
        }


        // ------------------------------------------------------------------
        // Setup rounds and epoch
        // ------------------------------------------------------------------

        const lastCompletedData = await aggregatorInstance.contractViews.getlastCompletedData().executeView({ viewCaller : bob.pkh});

        epoch = lastCompletedData.epoch.toNumber() == 1 ? 1 : lastCompletedData.epoch.toNumber() + 1;
        round = lastCompletedData.round.toNumber() == 1 ? 1 : lastCompletedData.round.toNumber() + 1;

        // ------------------------------------------------------------------
        // Setup funds in Treasury for transfer later
        // ------------------------------------------------------------------

        // Alice transfers 50 XTZ to Treasury
        await signerFactory(alice.sk)
        const aliceTransferTezToTreasuryOperation = await utils.tezos.contract.transfer({ to: treasuryInstance.address, amount: 50});
        await aliceTransferTezToTreasuryOperation.confirmation();
        const aggregatorMetadataBase = Buffer.from(
        JSON.stringify({
            name: 'MAVRYK Aggregator Contract',
            icon: 'https://logo.chainbit.xyz/xtz',
            version: 'v1.0.0',
            authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
        }),
        'ascii',
        ).toString('hex')

        // Alice transfers 100 MVK Tokens to Treasury
        const aliceTransferMvkTokensToTreasuryOperation = await mvkTokenInstance.methods.transfer([
            {
                from_: alice.pkh,
                txs: [
                    {
                        to_: treasuryInstance.address,
                        token_id: 0,
                        amount: MVK(100)
                    }
                ]
            }
        ]).send();
        await aliceTransferMvkTokensToTreasuryOperation.confirmation();


        // Set XTZ Reward to be higher for tests (from 0.0013 xtz to 1 xtz)
        // ------------------------------------------------------------------

        // Bob sets reward amount to be 1 tez
        await signerFactory(bob.sk)
        const rewardAmountXtz = 1000000; // 1 tez
        const set_xtzRewardAmountOp = await aggregatorInstance.methods.updateConfig(
        rewardAmountXtz, "configRewardAmountXtz"
        ).send();
        await set_xtzRewardAmountOp.confirmation();
    
    });

    describe('%addOracle', () => {
        beforeEach("Set signer to admin", async () => {
            await signerFactory(bob.sk)
        });

        it('Non-admin should not be able to call this entrypoint', async () => {
            try{
                // Initial values
                await signerFactory(david.sk);
                const oracleAddress     = susie.pkh;
    
                // Operation
                await chai.expect(aggregatorInstance.methods.addOracle(oracleAddress).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should not be able to add an already existing oracle', async () => {
            try {
                // Initial values
                const oracleAddress     = bob.pkh;
    
                // Operation
                await chai.expect(aggregatorInstance.methods.addOracle(oracleAddress).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should be able to add an oracle to the aggregator', async () => {
            try {
                // Initial values
                const oracleAddress     = susie.pkh;
    
                // Operation
                const operation         = await aggregatorInstance.methods.addOracle(oracleAddress).send();
                await operation.confirmation();
                
                // Final values
                aggregatorStorage       = await aggregatorInstance.storage();
                
                // Assertions
                assert.deepEqual(aggregatorStorage.oracleAddresses?.has(oracleAddress),true);
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    });


    describe('%addOracle', () => {
        beforeEach("Set signer to susie", async () => {
            await signerFactory(susie.sk)
        });

        it('satellite should be able to update their public key and peer id', async () => {
            try {
                
                // Initial values
                const oracleAddress     = susie.pkh;

                const newPublicKey      = mallory.pk;
                const newPeerId         = "newPeerId";
    
                // Operation
                const susieUpdateSatelliteOperation = await delegationInstance.methods.updateSatelliteRecord(
                    "Updated Satellite by Susie", 
                    "Updated Satellite Description - Susie", 
                    "https://image.url", 
                    "https://image.url", 
                    "1000",
                    newPublicKey,
                    newPeerId
                ).send();
                await susieUpdateSatelliteOperation.confirmation();

                // Operation
                const updateOracleOperation = await aggregatorInstance.methods.updateOracle().send();
                await updateOracleOperation.confirmation();
                
                // Final values
                aggregatorStorage       = await aggregatorInstance.storage();
                const susieOracleInfo   = aggregatorStorage.oracleAddresses.get(oracleAddress);
                
                const publicKey = susieOracleInfo.oraclePublicKey;
                const peerId = susieOracleInfo.oraclePeerId;
                
                // Assertions
                assert.equal(publicKey, newPublicKey);
                assert.equal(peerId, peerId);

            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

    });

    describe('%removeOracle', () => {
        beforeEach("Set signer to admin", async () => {
            await signerFactory(bob.sk)
        });
        
        it('Non-admin should not be able to call this entrypoint', async () => {
            try{
                // Initial values
                await signerFactory(david.sk);
                const oracleAddress = susie.pkh;

                // Operation    
                await chai.expect(aggregatorInstance.methods.removeOracle(oracleAddress).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should not be able to call this entrypoint if the oracle does not exists', async () => {
            try {
                // Initial values
                const oracleAddress = trudy.pkh;

                // Operation
                await chai.expect(aggregatorInstance.methods.removeOracle(oracleAddress).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should be able to remove an oracle from the aggregator', async () => {
            try {
                // Initial values
                aggregatorStorage   = await aggregatorInstance.storage();
                const oracleAddress = susie.pkh;

                // Operation
                const operation     = await aggregatorInstance.methods.removeOracle(oracleAddress).send();
                await operation.confirmation();
    
                // Final values
                aggregatorStorage   = await aggregatorInstance.storage();

                // Assertion
                assert.deepEqual(aggregatorStorage.oracleAddresses?.has(susie.pkh), false);
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });
    });

    describe('%updateData', () => {

        // Constant variables
        const observations = [
            {
                "oracle": bob.pkh,
                "data": new BigNumber(10142857143)
            },
            {
                "oracle": eve.pkh,
                "data": new BigNumber(10142853322)
            },
            {
                "oracle": mallory.pkh,
                "data": new BigNumber(10142857900)
            },
            {
                "oracle": oracleMaintainer.pkh,
                "data": new BigNumber(10144537815)
            },
        ];

        it('Non-oracle should not be able to call this entrypoint', async () => {
            try {
                // Initial values
                const oracleObservations = new MichelsonMap<string, IOracleObservationType>();
                for (const { oracle, data } of observations) {
                    oracleObservations.set(oracle, {
                        data,
                        epoch,
                        round,
                        aggregatorAddress: aggregatorAddress.address
                    });
                };
                const signatures = new MichelsonMap<string, string>();
        
                // Sign observations
                await signerFactory(bob.sk);
                signatures.set(bob.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(eve.sk);
                signatures.set(eve.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(mallory.sk);
                signatures.set(mallory.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(oracleMaintainer.sk);
                signatures.set(oracleMaintainer.pkh, await utils.signOracleDataResponses(oracleObservations));
        
                // Operation
                await signerFactory(trudy.sk);
                await chai.expect(aggregatorInstance.methods.updateData(oracleObservations, signatures).send()).to.be.rejected;
            } catch(e){
                console.dir(e, {depth: 5})
            }
        });

        it('Oracle should be able to add data to the aggregator', async () => {
            try {
                // Initial values
                aggregatorStorage                       = await aggregatorInstance.storage();
                delegationStorage                       = await delegationInstance.storage();
                const oracleObservations                = new MichelsonMap<string, IOracleObservationType>();
                const oracleVotingPowers                = new Map<string, number>();
                var totalVotingPower                    = 0;
                for (const { oracle, data } of observations) {
                    // Get oracle voting power
                    const satelliteRecord               = await delegationStorage.satelliteLedger.get(oracle);
                    const votingPower                   = satelliteRecord.totalDelegatedAmount.toNumber() + satelliteRecord.stakedMvkBalance.toNumber();
                    totalVotingPower                    += votingPower;
                    oracleVotingPowers.set(oracle, votingPower)

                    // Set observation
                    oracleObservations.set(oracle, {
                        data,
                        epoch,
                        round,
                        aggregatorAddress: aggregatorAddress.address
                    });

                };
                const signatures                        = new MichelsonMap<string, string>();
                const startOracleMaintainerSMvkRewards  = await aggregatorStorage.oracleRewardStakedMvk.get(oracleMaintainer.pkh);
                const startOracleMaintainerXtzRewards   = await aggregatorStorage.oracleRewardXtz.get(oracleMaintainer.pkh);
                const smvkReward                        = aggregatorStorage.config.rewardAmountStakedMvk.toNumber();
                const xtzReward                         = aggregatorStorage.config.rewardAmountXtz.toNumber();
                const rewardRatio                       = oracleVotingPowers.get(oracleMaintainer.pkh) / totalVotingPower;
    
                // Sign observations
                await signerFactory(bob.sk);
                signatures.set(bob.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(eve.sk);
                signatures.set(eve.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(mallory.sk);
                signatures.set(mallory.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(oracleMaintainer.sk);
                signatures.set(oracleMaintainer.pkh, await utils.signOracleDataResponses(oracleObservations));
    
                // Operation
                const operation                         = await aggregatorInstance.methods.updateData(oracleObservations, signatures).send();
                await operation.confirmation();

                // Final values
                aggregatorStorage                       = await aggregatorInstance.storage();
                const endOracleMaintainerSMvkRewards    = await aggregatorStorage.oracleRewardStakedMvk.get(oracleMaintainer.pkh);
                const endOracleMaintainerXtzRewards     = await aggregatorStorage.oracleRewardXtz.get(oracleMaintainer.pkh);
                const expectedMaintainerSMvkReward      = Math.trunc(rewardRatio * smvkReward);

                // Assertions
                assert.strictEqual(startOracleMaintainerSMvkRewards, undefined);
                assert.strictEqual(startOracleMaintainerXtzRewards, undefined);
                assert.equal(endOracleMaintainerSMvkRewards.toNumber(), expectedMaintainerSMvkReward);
                assert.equal(endOracleMaintainerXtzRewards.toNumber(), xtzReward);
                assert.deepEqual(aggregatorStorage.lastCompletedData.round,new BigNumber(round));
                assert.deepEqual(aggregatorStorage.lastCompletedData.epoch,new BigNumber(epoch));
                assert.deepEqual(aggregatorStorage.lastCompletedData.data,new BigNumber(10142857521));
                assert.deepEqual(aggregatorStorage.lastCompletedData.percentOracleResponse,new BigNumber(4));
                round++;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Oracle should be able to increase its rewards when adding data to the aggregator if it stakes more or have more delegated to it', async () => {
            try {
                // Pre-operations
                // Increase oracle maintainer stake
                await signerFactory(oracleMaintainer.sk);
                const additionalStakeAmount             = MVK(10);
                var stakeOperation                      = await doormanInstance.methods.stake(additionalStakeAmount).send();
                await stakeOperation.confirmation();

                // Add a delegate to another oracle
                await signerFactory(trudy.sk);
                var updateOperators = await mvkTokenInstance.methods
                    .update_operators([
                    {
                        add_operator: {
                            owner: trudy.pkh,
                            operator: doormanAddress.address,
                            token_id: 0,
                        },
                    },
                    ])
                    .send()
                await updateOperators.confirmation();  
                stakeOperation                          = await doormanInstance.methods.stake(additionalStakeAmount).send();
                await stakeOperation.confirmation();
                const delegateOperation                 = await delegationInstance.methods.delegateToSatellite(trudy.pkh, bob.pkh).send()
                await delegateOperation.confirmation();

                // Initial values
                aggregatorStorage                       = await aggregatorInstance.storage();
                delegationStorage                       = await delegationInstance.storage();
                const oracleObservations                = new MichelsonMap<string, IOracleObservationType>();
                const oracleVotingPowers                = new Map<string, number>();
                var totalVotingPower                    = 0;
                for (const { oracle, data } of observations) {
                    // Get oracle voting power
                    const satelliteRecord               = await delegationStorage.satelliteLedger.get(oracle);
                    const votingPower                   = satelliteRecord.totalDelegatedAmount.toNumber() + satelliteRecord.stakedMvkBalance.toNumber();
                    totalVotingPower                    += votingPower;
                    oracleVotingPowers.set(oracle, votingPower)

                    // Set observation
                    oracleObservations.set(oracle, {
                        data,
                        epoch,
                        round,
                        aggregatorAddress: aggregatorAddress.address
                    });

                };
                const signatures                        = new MichelsonMap<string, string>();
                const startOracleMaintainerSMvkRewards  = await aggregatorStorage.oracleRewardStakedMvk.get(oracleMaintainer.pkh);
                const startOracleMaintainerXtzRewards   = await aggregatorStorage.oracleRewardXtz.get(oracleMaintainer.pkh);
                const smvkReward                        = aggregatorStorage.config.rewardAmountStakedMvk.toNumber();
                const xtzReward                         = aggregatorStorage.config.rewardAmountXtz.toNumber();
                const rewardRatio                       = oracleVotingPowers.get(oracleMaintainer.pkh) / totalVotingPower;
    
                // Sign observations
                await signerFactory(bob.sk);
                signatures.set(bob.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(eve.sk);
                signatures.set(eve.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(mallory.sk);
                signatures.set(mallory.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(oracleMaintainer.sk);
                signatures.set(oracleMaintainer.pkh, await utils.signOracleDataResponses(oracleObservations));
    
                // Operation
                const operation                         = await aggregatorInstance.methods.updateData(oracleObservations, signatures).send();
                await operation.confirmation();

                // Final values
                aggregatorStorage                       = await aggregatorInstance.storage();
                const endOracleMaintainerSMvkRewards    = await aggregatorStorage.oracleRewardStakedMvk.get(oracleMaintainer.pkh);
                const endOracleMaintainerXtzRewards     = await aggregatorStorage.oracleRewardXtz.get(oracleMaintainer.pkh);
                const expectedMaintainerSMvkReward      = Math.trunc(startOracleMaintainerSMvkRewards.toNumber() + rewardRatio * smvkReward);
                const expectedMaintainerXtzReward       = startOracleMaintainerXtzRewards.toNumber() + xtzReward;

                // Assertions
                assert.notStrictEqual(startOracleMaintainerSMvkRewards, undefined);
                assert.notStrictEqual(startOracleMaintainerXtzRewards, undefined);
                assert.equal(endOracleMaintainerSMvkRewards.toNumber(), expectedMaintainerSMvkReward);
                assert.equal(endOracleMaintainerXtzRewards.toNumber(), expectedMaintainerXtzReward);
                assert.deepEqual(aggregatorStorage.lastCompletedData.round,new BigNumber(round));
                assert.deepEqual(aggregatorStorage.lastCompletedData.epoch,new BigNumber(epoch));
                assert.deepEqual(aggregatorStorage.lastCompletedData.data,new BigNumber(10142857521));
                assert.deepEqual(aggregatorStorage.lastCompletedData.percentOracleResponse,new BigNumber(4));
                round++;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Oracle should be able to decrease its rewards when adding data to the aggregator if it unstakes or lose delegates', async () => {
            try {
                // Pre-operations
                // Increase oracle maintainer stake
                await signerFactory(bob.sk);
                const unstakeAmount                     = MVK(10);
                const unstakeOperation                  = await doormanInstance.methods.unstake(unstakeAmount).send();
                await unstakeOperation.confirmation();

                // Add a delegate to another oracle
                await signerFactory(trudy.sk);
                const undelegateOperation               = await delegationInstance.methods.undelegateFromSatellite(trudy.pkh).send()
                await undelegateOperation.confirmation();

                // Initial values
                aggregatorStorage                       = await aggregatorInstance.storage();
                delegationStorage                       = await delegationInstance.storage();
                const oracleObservations                = new MichelsonMap<string, IOracleObservationType>();
                const oracleVotingPowers                = new Map<string, number>();
                var totalVotingPower                    = 0;
                for (const { oracle, data } of observations) {
                    // Get oracle voting power
                    const satelliteRecord               = await delegationStorage.satelliteLedger.get(oracle);
                    const votingPower                   = satelliteRecord.totalDelegatedAmount.toNumber() + satelliteRecord.stakedMvkBalance.toNumber();
                    totalVotingPower                    += votingPower;
                    oracleVotingPowers.set(oracle, votingPower)

                    // Set observation
                    oracleObservations.set(oracle, {
                        data,
                        epoch,
                        round,
                        aggregatorAddress: aggregatorAddress.address
                    });

                };
                const signatures                        = new MichelsonMap<string, string>();
                const startOracleMaintainerSMvkRewards  = await aggregatorStorage.oracleRewardStakedMvk.get(bob.pkh);
                const startOracleMaintainerXtzRewards   = await aggregatorStorage.oracleRewardXtz.get(bob.pkh);
                const smvkReward                        = aggregatorStorage.config.rewardAmountStakedMvk.toNumber();
                const xtzReward                         = aggregatorStorage.config.rewardAmountXtz.toNumber();
                const rewardRatio                       = oracleVotingPowers.get(bob.pkh) / totalVotingPower;
    
                // Sign observations
                await signerFactory(bob.sk);
                signatures.set(bob.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(eve.sk);
                signatures.set(eve.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(mallory.sk);
                signatures.set(mallory.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(oracleMaintainer.sk);
                signatures.set(oracleMaintainer.pkh, await utils.signOracleDataResponses(oracleObservations));
    
                // Operation
                await signerFactory(bob.sk);
                const operation                         = await aggregatorInstance.methods.updateData(oracleObservations, signatures).send();
                await operation.confirmation();

                // Final values
                aggregatorStorage                       = await aggregatorInstance.storage();
                const endOracleMaintainerSMvkRewards    = await aggregatorStorage.oracleRewardStakedMvk.get(bob.pkh);
                const endOracleMaintainerXtzRewards     = await aggregatorStorage.oracleRewardXtz.get(bob.pkh);
                const expectedMaintainerSMvkReward      = Math.trunc(startOracleMaintainerSMvkRewards.toNumber() + rewardRatio * smvkReward);
                const expectedMaintainerXtzReward       = xtzReward;

                // Assertions
                assert.notStrictEqual(startOracleMaintainerSMvkRewards, undefined);
                assert.strictEqual(startOracleMaintainerXtzRewards, undefined);
                assert.equal(endOracleMaintainerSMvkRewards.toNumber(), expectedMaintainerSMvkReward);
                assert.equal(endOracleMaintainerXtzRewards.toNumber(), expectedMaintainerXtzReward);
                assert.deepEqual(aggregatorStorage.lastCompletedData.round,new BigNumber(round));
                assert.deepEqual(aggregatorStorage.lastCompletedData.epoch,new BigNumber(epoch));
                assert.deepEqual(aggregatorStorage.lastCompletedData.data,new BigNumber(10142857521));
                assert.deepEqual(aggregatorStorage.lastCompletedData.percentOracleResponse,new BigNumber(4));
                round++;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Oracle should not be able to call this entrypoint if there too few observations in the map', async () => {
            try {
                // Initial values
                const oracleObservations = new MichelsonMap<string, IOracleObservationType>();
                oracleObservations.set(observations[0].oracle, {
                    data: observations[0].data,
                    epoch,
                    round,
                    aggregatorAddress: aggregatorAddress.address
                });
                const signatures = new MichelsonMap<string, string>();
    
                // Sign observations
                await signerFactory(bob.sk);
                signatures.set(bob.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(eve.sk);
                signatures.set(eve.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(mallory.sk);
                signatures.set(mallory.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(oracleMaintainer.sk);
                signatures.set(oracleMaintainer.pkh, await utils.signOracleDataResponses(oracleObservations));
    
                // Operation
                await chai.expect(aggregatorInstance.methods.updateData(oracleObservations, signatures).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }   
        });

        it('Oracle should not be able to call this entrypoint if there too few signatures in the map', async () => {
            try {
                // Initial values
                const oracleObservations = new MichelsonMap<string, IOracleObservationType>();
                for (const { oracle, data } of observations) {
                   oracleObservations.set(oracle, {
                       data,
                       epoch,
                       round,
                       aggregatorAddress: aggregatorAddress.address
                     });
                };
                const signatures = new MichelsonMap<string, string>();
                
                // Operation
                await chai.expect(aggregatorInstance.methods.updateData(oracleObservations, signatures).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
            
        });

        it('Oracle should not be able to call this entrypoint if the wrong aggregator is specified in the observations', async () => {
            try {
                // Initial values
                const oracleObservations = new MichelsonMap<string, IOracleObservationType>();
                for (const { oracle, data } of observations) {
                   oracleObservations.set(oracle, {
                       data,
                       epoch,
                       round,
                       aggregatorAddress: aggregatorFactoryAddress.address
                     });
                };
                const signatures = new MichelsonMap<string, string>();
                
                // Sign observations
                await signerFactory(bob.sk);
                signatures.set(bob.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(eve.sk);
                signatures.set(eve.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(mallory.sk);
                signatures.set(mallory.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(oracleMaintainer.sk);
                signatures.set(oracleMaintainer.pkh, await utils.signOracleDataResponses(oracleObservations));
    
                // Operation
                await chai.expect(aggregatorInstance.methods.updateData(oracleObservations, signatures).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Oracle should not be able to call this entrypoint if at least one the oracle specified in the observations is wrong', async () => {
            try {
                // Initial values
                const observations_bad = [
                    {
                       "oracle": bob.pkh,
                       "data": new BigNumber(10142857143)
                    },
                    {
                        "oracle": eve.pkh,
                        "data": new BigNumber(10142853322)
                    },
                    {
                        "oracle": mallory.pkh,
                        "data": new BigNumber(10142857900)
                    },
                    {
                        "oracle": trudy.pkh,
                        "data": new BigNumber(10144537815)
                    },
                ];
                const oracleObservations = new MichelsonMap<string, IOracleObservationType>();
                for (const { oracle, data } of observations_bad) {
                    oracleObservations.set(oracle, {
                        data,
                        epoch,
                        round,
                        aggregatorAddress: aggregatorAddress.address
                    });
                };
                const signatures = new MichelsonMap<string, string>();
    
                // Sign observations
                await signerFactory(bob.sk);
                signatures.set(bob.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(eve.sk);
                signatures.set(eve.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(mallory.sk);
                signatures.set(mallory.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(oracleMaintainer.sk);
                signatures.set(oracleMaintainer.pkh, await utils.signOracleDataResponses(oracleObservations));
    
                // Operation
                await chai.expect(aggregatorInstance.methods.updateData(oracleObservations, signatures).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Oracle should not be able to call this entrypoint if the all epochs does not match in the observations', async () => {
            try{
                // Initial values
                const observations_bad = [
                    {
                       "oracle": bob.pkh,
                       "data": new BigNumber(10142857143),
                       "epoch": 1
                    },
                    {
                        "oracle": eve.pkh,
                        "data": new BigNumber(10142853322),
                        "epoch": 1
                    },
                    {
                        "oracle": mallory.pkh,
                        "data": new BigNumber(10142857900),
                        "epoch": 1
                    },
                    {
                        "oracle": trudy.pkh,
                        "data": new BigNumber(10144537815),
                        "epoch": 2
                    },
                ];
                const oracleObservations = new MichelsonMap<string, IOracleObservationType>();
                for (const { oracle, data, epoch } of observations_bad) {
                    oracleObservations.set(oracle, {
                        data,
                        epoch,
                        round,
                        aggregatorAddress: aggregatorFactoryAddress.address
                    });
                };
                const signatures = new MichelsonMap<string, string>();
    
                // Sign observations
                await signerFactory(bob.sk);
                signatures.set(bob.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(eve.sk);
                signatures.set(eve.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(mallory.sk);
                signatures.set(mallory.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(oracleMaintainer.sk);
                signatures.set(oracleMaintainer.pkh, await utils.signOracleDataResponses(oracleObservations));
    
                // Operation
                await chai.expect(aggregatorInstance.methods.updateData(oracleObservations, signatures).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Oracle should not be able to call this entrypoint if the all rounds does not match in the observations', async () => {
            try {
                // Initial values
                const observations_bad = [
                    {
                       "oracle": bob.pkh,
                       "data": new BigNumber(10142857143),
                       "round": 2
                    },
                    {
                        "oracle": eve.pkh,
                        "data": new BigNumber(10142853322),
                        "round": 2
                    },
                    {
                        "oracle": mallory.pkh,
                        "data": new BigNumber(10142857900),
                        "round": 2
                    },
                    {
                        "oracle": trudy.pkh,
                        "data": new BigNumber(10144537815),
                        "round": 3
                    },
                ];
                const oracleObservations = new MichelsonMap<string, IOracleObservationType>();
                for (const { oracle, data, round } of observations_bad) {
                    oracleObservations.set(oracle, {
                        data,
                        epoch,
                        round,
                        aggregatorAddress: aggregatorFactoryAddress.address
                    });
                };
                const signatures = new MichelsonMap<string, string>();
      
                // Sign observations
                await signerFactory(bob.sk);
                signatures.set(bob.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(eve.sk);
                signatures.set(eve.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(mallory.sk);
                signatures.set(mallory.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(oracleMaintainer.sk);
                signatures.set(oracleMaintainer.pkh, await utils.signOracleDataResponses(oracleObservations));
      
                // Operation
                await chai.expect(aggregatorInstance.methods.updateData(oracleObservations, signatures).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }   
        });

        it('Oracle should not be able to call this entrypoint if the epoch mentionned in the observations is less or equal than the previous one', async () => {
            try {
                // Initial values
                const oracleObservations = new MichelsonMap<string, IOracleObservationType>();
                for (const { oracle, data } of observations) {
                   oracleObservations.set(oracle, {
                       data,
                       epoch: epoch - 1,
                       round,
                       aggregatorAddress: aggregatorAddress.address
                     });
                };
                const signatures = new MichelsonMap<string, string>();
   
                // Sign observations
                await signerFactory(bob.sk);
                signatures.set(bob.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(eve.sk);
                signatures.set(eve.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(mallory.sk);
                signatures.set(mallory.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(oracleMaintainer.sk);
                signatures.set(oracleMaintainer.pkh, await utils.signOracleDataResponses(oracleObservations));
    
                // Operation
                await chai.expect(aggregatorInstance.methods.updateData(oracleObservations, signatures).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Oracle should not be able to call this entrypoint if at least one of the signatures is wrong', async () => {
            try {
                // Initial values
                const oracleObservations = new MichelsonMap<string, IOracleObservationType>();
                for (const { oracle, data } of observations) {
                   oracleObservations.set(oracle, {
                       data,
                       epoch,
                       round,
                       aggregatorAddress: aggregatorAddress.address
                     });
                };
                const signatures = new MichelsonMap<string, string>();
    
                // Sign observations
                await signerFactory(bob.sk);
                signatures.set(bob.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(trudy.sk);
                signatures.set(eve.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(mallory.sk);
                signatures.set(mallory.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(oracleMaintainer.sk);
                signatures.set(oracleMaintainer.pkh, await utils.signOracleDataResponses(oracleObservations));
    
                // Operation
                await chai.expect(aggregatorInstance.methods.updateData(oracleObservations, signatures).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });
    });

    describe('%withdrawRewardStakedMvk', () => {

        beforeEach("Set signer to oracle", async () => {
            await signerFactory(bob.sk)
        });

        it('Oracle should be able to withdraw SMVK rewards', async () => {
            try {
                // Initial values
                aggregatorStorage                           = await aggregatorInstance.storage();
                delegationStorage                           = await delegationInstance.storage();
                const oracleVotingPowers                    = new Map<string, number>();
                const observations                          = [
                    {
                        "oracle": bob.pkh,
                        "data": new BigNumber(10142857143)
                    },
                    {
                        "oracle": eve.pkh,
                        "data": new BigNumber(10142853322)
                    },
                    {
                        "oracle": mallory.pkh,
                        "data": new BigNumber(10142857900)
                    },
                    {
                        "oracle": oracleMaintainer.pkh,
                        "data": new BigNumber(10144537815)
                    },
                ];
                var totalVotingPower                        = 0;
                for (const { oracle, data } of observations) {
                    // Get oracle voting power
                    const satelliteRecord               = await delegationStorage.satelliteLedger.get(oracle);
                    const votingPower                   = satelliteRecord.totalDelegatedAmount.toNumber() + satelliteRecord.stakedMvkBalance.toNumber();
                    totalVotingPower                    += votingPower;
                    oracleVotingPowers.set(oracle, votingPower)
                };
                const satelliteFee                          = 1000; // set when bob, eve, mallory registered as satellites in before setup
                const bobStakedMvk                          = oracleVotingPowers.get(bob.pkh);
                const eveStakedMvk                          = oracleVotingPowers.get(eve.pkh);
                const malloryStakedMvk                      = oracleVotingPowers.get(mallory.pkh);
                const rewardAmountStakedMvk                 = aggregatorStorage.config.rewardAmountStakedMvk.toNumber();
                const bobSMvkRewards                        = await aggregatorStorage.oracleRewardStakedMvk.get(bob.pkh);
                const eveSMvkRewards                        = await aggregatorStorage.oracleRewardStakedMvk.get(eve.pkh);
                const mallorySMvkRewards                    = await aggregatorStorage.oracleRewardStakedMvk.get(mallory.pkh);
                const beforeBobRewardsLedger                = await delegationStorage.satelliteRewardsLedger.get(bob.pkh);
                const beforeEveRewardsLedger                = await delegationStorage.satelliteRewardsLedger.get(eve.pkh);
                const beforeMalloryRewardsLedger            = await delegationStorage.satelliteRewardsLedger.get(mallory.pkh);
    
                // Operation
                const bobWithdrawRewardStakedMvkOp          = await aggregatorInstance.methods.withdrawRewardStakedMvk(bob.pkh).send();
                await bobWithdrawRewardStakedMvkOp.confirmation();
    
                const eveWithdrawRewardStakedMvkOp          = await aggregatorInstance.methods.withdrawRewardStakedMvk(eve.pkh).send();
                await eveWithdrawRewardStakedMvkOp.confirmation();
    
                const malloryWithdrawRewardStakedMvkOp      = await aggregatorInstance.methods.withdrawRewardStakedMvk(mallory.pkh).send();
                await malloryWithdrawRewardStakedMvkOp.confirmation();
    
                // Final values
                aggregatorStorage                           = await aggregatorInstance.storage();
                delegationStorage                           = await delegationInstance.storage();
                const bobRewardsLedger                      = await delegationStorage.satelliteRewardsLedger.get(bob.pkh);
                const eveRewardsLedger                      = await delegationStorage.satelliteRewardsLedger.get(eve.pkh);
                const malloryRewardsLedger                  = await delegationStorage.satelliteRewardsLedger.get(mallory.pkh);
                const resetBobRewardStakedMvk               = await aggregatorStorage.oracleRewardStakedMvk.get(bob.pkh);
                const resetEveRewardStakedMvk               = await aggregatorStorage.oracleRewardStakedMvk.get(eve.pkh);
                const resetMalloryRewardStakedMvk           = await aggregatorStorage.oracleRewardStakedMvk.get(mallory.pkh);
                const finalBobStakedMvkRewardsAfterFees     = satelliteFee * bobSMvkRewards / 10000;
                const finalEveStakedMvkRewardsAfterFees     = satelliteFee * eveSMvkRewards / 10000;
                const finalMalloryStakedMvkRewardsAfterFees = satelliteFee * mallorySMvkRewards / 10000;
    
                // Assertions
                assert.equal(resetBobRewardStakedMvk, 0);
                assert.equal(resetEveRewardStakedMvk, 0);
                assert.equal(resetMalloryRewardStakedMvk, 0);
                assert.equal(bobRewardsLedger.unpaid.toNumber(), beforeBobRewardsLedger.unpaid.toNumber() + Math.trunc(finalBobStakedMvkRewardsAfterFees));
                assert.equal(eveRewardsLedger.unpaid.toNumber(), beforeEveRewardsLedger.unpaid.toNumber() + Math.trunc(finalEveStakedMvkRewardsAfterFees));
                assert.equal(malloryRewardsLedger.unpaid.toNumber(), beforeMalloryRewardsLedger.unpaid.toNumber() + Math.trunc(finalMalloryStakedMvkRewardsAfterFees));
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });
    });

    describe('%withdrawRewardXtz', () => {

        beforeEach("Set signer to oracle", async () => {
            await signerFactory(bob.sk)
        });

        it('Oracle should be able to withdraw XTZ rewards', async () => {
            try {
                // Initial values
                aggregatorStorage                           = await aggregatorInstance.storage();
                const oraclePendingRewards                  = await aggregatorStorage.oracleRewardXtz.get(oracleMaintainer.pkh);
                const beforeOracleMaintainerTezBalance      = await utils.tezos.tz.getBalance(oracleMaintainer.pkh);
                const beforeEveTezBalance                   = await utils.tezos.tz.getBalance(eve.pkh);
    
                // Operation
                // use alice to withdraw reward to the oracles and pay the gas cost for easier testing
                await signerFactory(alice.sk);
                
                const oracleMaintainerWithdrawRewardXtzOp   = await aggregatorInstance.methods.withdrawRewardXtz(oracleMaintainer.pkh).send();
                await oracleMaintainerWithdrawRewardXtzOp.confirmation();
                
                const eveWithdrawRewardXtzOp                = await aggregatorInstance.methods.withdrawRewardXtz(eve.pkh).send();
                await eveWithdrawRewardXtzOp.confirmation();
    
                // Final values
                aggregatorStorage                           = await aggregatorInstance.storage();
                const resetOracleMaintainerRewardXtz        = await aggregatorStorage.oracleRewardXtz.get(oracleMaintainer.pkh);
                const resetEveRewardXtz                     = await aggregatorStorage.oracleRewardXtz.get(eve.pkh);
                const oracleMaintainerTezBalance            = await utils.tezos.tz.getBalance(oracleMaintainer.pkh);
                const eveTezBalance                         = await utils.tezos.tz.getBalance(eve.pkh);
    
                // Assertions
                assert.equal(resetOracleMaintainerRewardXtz, 0);
                assert.equal(resetEveRewardXtz, undefined);
                assert.equal(oracleMaintainerTezBalance.toNumber(), beforeOracleMaintainerTezBalance.plus(oraclePendingRewards).toNumber());
                assert.equal(eveTezBalance.toNumber(), beforeEveTezBalance.toNumber());  
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });
    });

    describe('%updateConfig', () => {
        
        // Constants
        const decimals                      : BigNumber = new BigNumber(100);
        const alphaPercentPerThousand       : BigNumber = new BigNumber(2);

        const devTriggerBanDuration         : BigNumber = new BigNumber(100);
        const perThousandDeviationTrigger   : BigNumber = new BigNumber(100);
        const percentOracleThreshold        : BigNumber = new BigNumber(100);
        const heartBeatSeconds              : BigNumber = new BigNumber(100);

        const requestRateDevDepositFee      : BigNumber = new BigNumber(100);
        
        const deviationRewardStakedMvk      : BigNumber = new BigNumber(100);
        const deviationRewardAmountXtz      : BigNumber = new BigNumber(100);
        const rewardAmountXtz               : BigNumber = new BigNumber(100);
        const rewardAmountStakedMvk         : BigNumber = new BigNumber(100);

        beforeEach("Set signer to oracle", async () => {
            await signerFactory(bob.sk)
        });

        it('Non-admin should not be able to call this entrypoint', async () => {
            try {
                // Initial values
                await signerFactory(david.sk);

                // Operation
                await chai.expect(aggregatorInstance.methods.updateConfig(decimals, "configDecimals").send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should be able to update the aggregator config', async () => {
            try {
                // Operation
                const testUpdateConfigDecimalsOp                = await aggregatorInstance.methods.updateConfig(
                decimals, "configDecimals"
                ).send();
                await testUpdateConfigDecimalsOp.confirmation();
    
                const testUpdateConfigAlphaPercentPerThousandOp = await aggregatorInstance.methods.updateConfig(
                alphaPercentPerThousand, "configAlphaPercentPerThousand"
                ).send();
                await testUpdateConfigAlphaPercentPerThousandOp.confirmation();
    
                
                const testUpdateConfigPercentOracleThresholdOp  = await aggregatorInstance.methods.updateConfig(
                percentOracleThreshold, "configPercentOracleThreshold"
                ).send();
                await testUpdateConfigPercentOracleThresholdOp.confirmation();
    
                const testUpdateConfigHeartBeatSecondsOp        = await aggregatorInstance.methods.updateConfig(
                heartBeatSeconds, "configHeartBeatSeconds"
                ).send();
                await testUpdateConfigHeartBeatSecondsOp.confirmation();
    
    
                const testUpdateConfigRewardAmountXtzOp         = await aggregatorInstance.methods.updateConfig(
                rewardAmountXtz, "configRewardAmountXtz"
                ).send();
                await testUpdateConfigRewardAmountXtzOp.confirmation();
    
                const testUpdateConfigRewardAmountStakedMvkOp   = await aggregatorInstance.methods.updateConfig(
                rewardAmountStakedMvk, "configRewardAmountStakedMvk"
                ).send();
                await testUpdateConfigRewardAmountStakedMvkOp.confirmation();

                // Final values
                aggregatorStorage                               = await aggregatorInstance.storage();
                assert.deepEqual(aggregatorStorage.config.decimals,                        decimals);
                assert.deepEqual(aggregatorStorage.config.alphaPercentPerThousand,         alphaPercentPerThousand);
    
                assert.deepEqual(aggregatorStorage.config.percentOracleThreshold,          percentOracleThreshold);
                assert.deepEqual(aggregatorStorage.config.heartBeatSeconds,                heartBeatSeconds);
    
                assert.deepEqual(aggregatorStorage.config.rewardAmountXtz,                 rewardAmountXtz);
                assert.deepEqual(aggregatorStorage.config.rewardAmountStakedMvk,           rewardAmountStakedMvk);
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });
    });

    describe('%setAdmin', () => {
        it('Non-admin should not be able to call this entrypoint', async () => {
            try {
                // Initial values
                await signerFactory(david.sk);

                // Operation
                await chai.expect(aggregatorInstance.methods.setAdmin(bob.pkh).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should be able to update the aggregator admin', async () => {
            try {
                // Initial values
                await signerFactory(bob.sk);

                // Operation
                const operation     = await aggregatorInstance.methods.setAdmin(bob.pkh).send();
                await operation.confirmation();
    
                // Final values
                aggregatorStorage   = await aggregatorInstance.storage();

                // Assertion
                assert.deepEqual(aggregatorStorage.admin,bob.pkh);
            } catch (e) {
                console.dir(e, {depth: 5})
            }
        });
    });

    describe('%setGovernance', () => {
        it('Non-admin should not be able to call this entrypoint', async () => {
            try {
                // Initial values
                await signerFactory(david.sk);

                // Operation
                await chai.expect(aggregatorInstance.methods.setGovernance(david.pkh).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should be able to update the governance address', async () => {
            try {
                // Initial values
                await signerFactory(bob.sk);

                // Operation
                const operation     = await aggregatorInstance.methods.setGovernance(governanceAddress.address).send();
                await operation.confirmation();
    
                // Final values
                aggregatorStorage   = await aggregatorInstance.storage();

                // Assertion
                assert.deepEqual(aggregatorStorage.governanceAddress,governanceAddress.address);
            } catch (e) {
                console.dir(e, {depth: 5})
            }
        });
    });

    describe('%setName', () => {
        it('Non-admin should not be able to call this entrypoint', async () => {
            try {
                // Initial values
                await signerFactory(david.sk);
                const newName   = "testName";

                // Operation
                await chai.expect(aggregatorInstance.methods.setName(newName).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should be able to update the aggregator contract name and update its reference on the governanceSatellite contract', async () => {
            try {
                // Initial values
                await signerFactory(bob.sk);
                const newName                   = "newName";
                governanceSatelliteStorage      = await governanceSatelliteInstance.storage();
                aggregatorStorage               = await aggregatorInstance.storage();

                const oldName                   = aggregatorStorage.name;
                const startOldReference         = await governanceSatelliteStorage.aggregatorLedger.get(oldName);
                const startNewReference         = await governanceSatelliteStorage.aggregatorLedger.get(newName);

                // Operation
                const operation     = await aggregatorInstance.methods.setName(newName).send();
                await operation.confirmation();
    
                // Final values
                governanceSatelliteStorage      = await governanceSatelliteInstance.storage();
                aggregatorStorage               = await aggregatorInstance.storage();
                const endOldReference           = await governanceSatelliteStorage.aggregatorLedger.get(oldName);
                const endNewReference           = await governanceSatelliteStorage.aggregatorLedger.get(newName);

                // Assertion
                assert.strictEqual(aggregatorStorage.name, newName);
                assert.strictEqual(startOldReference, aggregatorAddress.address);
                assert.strictEqual(startNewReference, undefined);
                assert.strictEqual(endOldReference, undefined);
                assert.strictEqual(endNewReference, aggregatorAddress.address);
            } catch (e) {
                console.dir(e, {depth: 5})
            }
        });
    });

    describe('%updateMetadata', () => {
        it('Non-admin should not be able to call this entrypoint', async () => {
            try {
                // Initial values
                await signerFactory(david.sk);
                const key   = ''
                const hash  = Buffer.from('tezos-storage:data', 'ascii').toString('hex')

                // Operation
                await chai.expect(aggregatorInstance.methods.updateMetadata(key, hash).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should be able to update the aggregator contract metadata', async () => {
            try {
                // Initial values
                await signerFactory(bob.sk);
                const key   = ''
                const hash  = Buffer.from('tezos-storage:data', 'ascii').toString('hex')

                // Operation
                const operation     = await aggregatorInstance.methods.updateMetadata(key, hash).send();
                await operation.confirmation();
    
                // Final values
                aggregatorStorage   = await aggregatorInstance.storage();
                const updatedData    = await aggregatorStorage.metadata.get(key);

                // Assertion
                assert.equal(updatedData, hash);
            } catch (e) {
                console.dir(e, {depth: 5})
            }
        });
    });

    describe('%updateWhitelistContracts', () => {
        it('Non-admin should not be able to call this entrypoint', async () => {
            try {
                // Initial values
                await signerFactory(david.sk);
                const contractName      = 'testContract';
                const contractAddress   = bob.pkh;

                // Operation
                await chai.expect(aggregatorInstance.methods.updateWhitelistContracts(contractName, contractAddress).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should be able to update the aggregator contract whitelist contracts', async () => {
            try {
                // Initial values
                await signerFactory(bob.sk);
                const contractName      = 'testContract';
                const contractAddress   = bob.pkh;

                // Operation
                const operation         = await aggregatorInstance.methods.updateWhitelistContracts(contractName, contractAddress).send();
                await operation.confirmation();
    
                // Final values
                aggregatorStorage       = await aggregatorInstance.storage();
                const contractsMapEntry = await aggregatorStorage.whitelistContracts.get(contractName);

                // Assertion
                assert.deepEqual(contractsMapEntry, contractAddress);
            } catch (e) {
                console.dir(e, {depth: 5})
            }
        });
    });

    describe('%updateGeneralContracts', () => {
        it('Non-admin should not be able to call this entrypoint', async () => {
            try {
                // Initial values
                await signerFactory(david.sk);
                const contractName      = 'testContract';
                const contractAddress   = bob.pkh;

                // Operation
                await chai.expect(aggregatorInstance.methods.updateGeneralContracts(contractName, contractAddress).send()).to.be.rejected;
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should be able to update the aggregator contract whitelist contracts', async () => {
            try {
                // Initial values
                await signerFactory(bob.sk);
                const contractName      = 'testContract';
                const contractAddress   = bob.pkh;

                // Operation
                const operation         = await aggregatorInstance.methods.updateGeneralContracts(contractName, contractAddress).send();
                await operation.confirmation();
    
                // Final values
                aggregatorStorage       = await aggregatorInstance.storage();
                const contractsMapEntry = await aggregatorStorage.generalContracts.get(contractName);

                // Assertion
                assert.deepEqual(contractsMapEntry, contractAddress);
            } catch (e) {
                console.dir(e, {depth: 5})
            }
        });
    });

    describe('%pauseAll', () => {
        it('Non-admin should not be able to call this entrypoint', async () => {
            try {
                // Initial values
                await signerFactory(david.sk);
    
                // Operation
                await chai.expect(aggregatorInstance.methods.pauseAll().send()).to.be.rejected;
            } catch (e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should be able to pause all entrypoints', async () => {
            try {
                // Initial values
                await signerFactory(bob.sk);
                aggregatorStorage           = await aggregatorInstance.storage();
                const initBreakGlassConfig  = await aggregatorStorage.breakGlassConfig;

                // Operation
                const operation             = await aggregatorInstance.methods.pauseAll().send();
                await operation.confirmation();

                // Final values
                aggregatorStorage           = await aggregatorInstance.storage();
                const finalBreakGlassConfig = await aggregatorStorage.breakGlassConfig;

                // Assertions
                assert.equal(finalBreakGlassConfig.updateDataIsPaused, true);
                assert.equal(finalBreakGlassConfig.withdrawRewardXtzIsPaused, true);
                assert.equal(finalBreakGlassConfig.withdrawRewardStakedMvkIsPaused, true);
                assert.notEqual(finalBreakGlassConfig.updateDataIsPaused, initBreakGlassConfig.updateDataIsPaused);
                assert.notEqual(finalBreakGlassConfig.withdrawRewardXtzIsPaused, initBreakGlassConfig.withdrawRewardXtzIsPaused);
                assert.notEqual(finalBreakGlassConfig.withdrawRewardStakedMvkIsPaused, initBreakGlassConfig.withdrawRewardStakedMvkIsPaused);
            } catch (e) {
                console.dir(e, {depth: 5})
            }
        });
    });

    describe('%togglePauseEntrypoint', () => {
        beforeEach("Set signer to admin", async () => {
            await signerFactory(bob.sk)
        });

        it('Non-admin should not be able to call this entrypoint', async () => {
            try {
                // Initial values
                await signerFactory(david.sk);
                const entrypoint    = "updateData";
                const pause         = true;
    
                // Operation
                await chai.expect(aggregatorInstance.methods.togglePauseEntrypoint(entrypoint, pause).send()).to.be.rejected;
            } catch (e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should be able to pause or unpause %updateData', async () => {
            try {
                // Initial values
                const entrypoint            = "updateData";
                const pause                 = true;
                const observations          = [
                    {
                        "oracle": bob.pkh,
                        "data": new BigNumber(10142857143)
                    },
                    {
                        "oracle": eve.pkh,
                        "data": new BigNumber(10142853322)
                    },
                    {
                        "oracle": mallory.pkh,
                        "data": new BigNumber(10142857900)
                    },
                    {
                        "oracle": oracleMaintainer.pkh,
                        "data": new BigNumber(10144537815)
                    },
                ];

                let epoch: number           = 2;
                let round: number           = 2;
                const oracleObservations    = new MichelsonMap<string, IOracleObservationType>();
                for (const { oracle, data } of observations) {
                    oracleObservations.set(oracle, {
                        data,
                        epoch,
                        round,
                        aggregatorAddress: aggregatorAddress.address
                    });
                };
                const signatures            = new MichelsonMap<string, string>();
    
                // Sign observations
                await signerFactory(bob.sk);
                signatures.set(bob.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(eve.sk);
                signatures.set(eve.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(mallory.sk);
                signatures.set(mallory.pkh, await utils.signOracleDataResponses(oracleObservations));
                await signerFactory(oracleMaintainer.sk);
                signatures.set(oracleMaintainer.pkh, await utils.signOracleDataResponses(oracleObservations));
    
                // Operation
                await signerFactory(bob.sk)
                const operation             = await aggregatorInstance.methods.togglePauseEntrypoint(entrypoint, pause).send();
                await operation.confirmation();

                // Test operation
                await chai.expect(aggregatorInstance.methods.updateData(oracleObservations, signatures).send()).to.be.rejected;

                // Final values
                aggregatorStorage           = await aggregatorInstance.storage();
                const entrypointPaused      = await aggregatorStorage.breakGlassConfig.updateDataIsPaused;

                // Assertions
                assert.equal(entrypointPaused, pause);
            } catch (e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should be able to pause or unpause %withdrawRewardXtz', async () => {
            try {
                // Initial values
                const entrypoint            = "withdrawRewardXtz";
                const pause                 = true;
                
                // Operation
                const operation             = await aggregatorInstance.methods.togglePauseEntrypoint(entrypoint, pause).send();
                await operation.confirmation();

                // Test operation
                await chai.expect(aggregatorInstance.methods.withdrawRewardXtz(bob.pkh).send()).to.be.rejected;

                // Final values
                aggregatorStorage           = await aggregatorInstance.storage();
                const entrypointPaused      = await aggregatorStorage.breakGlassConfig.withdrawRewardXtzIsPaused;

                // Assertions
                assert.equal(entrypointPaused, pause);
            } catch (e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should be able to pause or unpause %withdrawRewardStakedMvk', async () => {
            try {
                // Initial values
                const entrypoint            = "withdrawRewardStakedMvk";
                const pause                 = true;
                
                // Operation
                const operation             = await aggregatorInstance.methods.togglePauseEntrypoint(entrypoint, pause).send();
                await operation.confirmation();

                // Test operation
                await chai.expect(aggregatorInstance.methods.withdrawRewardStakedMvk(bob.pkh).send()).to.be.rejected;

                // Final values
                aggregatorStorage           = await aggregatorInstance.storage();
                const entrypointPaused      = await aggregatorStorage.breakGlassConfig.withdrawRewardXtzIsPaused;

                // Assertions
                assert.equal(entrypointPaused, pause);
            } catch (e) {
                console.dir(e, {depth: 5})
            }
        });
    });

    describe('%unpauseAll', () => {
        it('Non-admin should not be able to call this entrypoint', async () => {
            try {
                // Initial values
                await signerFactory(david.sk);
    
                // Operation
                await chai.expect(aggregatorInstance.methods.unpauseAll().send()).to.be.rejected;
            } catch (e) {
                console.dir(e, {depth: 5})
            }
        });

        it('Admin should be able to unpause all entrypoints', async () => {
            try {
                // Initial values
                await signerFactory(bob.sk);
                aggregatorStorage           = await aggregatorInstance.storage();
                const initBreakGlassConfig  = await aggregatorStorage.breakGlassConfig;

                // Operation
                const operation             = await aggregatorInstance.methods.unpauseAll().send();
                await operation.confirmation();

                // Final values
                aggregatorStorage           = await aggregatorInstance.storage();
                const finalBreakGlassConfig = await aggregatorStorage.breakGlassConfig;

                // Assertions
                assert.equal(finalBreakGlassConfig.updateDataIsPaused, false);
                assert.equal(finalBreakGlassConfig.withdrawRewardXtzIsPaused, false);
                assert.equal(finalBreakGlassConfig.withdrawRewardStakedMvkIsPaused, false);
                assert.notEqual(finalBreakGlassConfig.updateDataIsPaused, initBreakGlassConfig.updateDataIsPaused);
                assert.notEqual(finalBreakGlassConfig.withdrawRewardXtzIsPaused, initBreakGlassConfig.withdrawRewardXtzIsPaused);
                assert.notEqual(finalBreakGlassConfig.withdrawRewardStakedMvkIsPaused, initBreakGlassConfig.withdrawRewardStakedMvkIsPaused);
            } catch (e) {
                console.dir(e, {depth: 5})
            }
        });
    });

    describe('%setLambda', () => {
        it('Non-admin should not be able to call this entrypoint', async () => {
            try {
                // Initial values
                await signerFactory(david.sk);
                const bytes  = Buffer.from('tezos-storage:data', 'ascii').toString('hex')
    
                // Operation
                await chai.expect(aggregatorInstance.methods.setLambda("testSetLambda", bytes).send()).to.be.rejected;
            } catch (e){
                console.dir(e, {depth: 5})
            }
        });
    });
});