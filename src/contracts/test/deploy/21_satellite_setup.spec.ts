import {AggregatorFactoryContractAbstraction} from "../helpers/aggregatorFactoryHelper.js";

import {MVK, Utils} from "../helpers/Utils";

import {DelegationContractAbstraction} from "../helpers/delegationHelper.js";
import {GovernanceSatelliteContractAbstraction} from "../helpers/governanceSatelliteHelper.js";
import {DoormanContractAbstraction} from "../helpers/doormanHelper.js";
import {BigNumber} from "bignumber.js";

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

import {bob} from '../../scripts/sandbox/accounts'
import {oracles} from '../../scripts/sandbox/oracles'

// ------------------------------------------------------------------------------
// Contract Address
// ------------------------------------------------------------------------------

import aggregatorFactoryAddress from '../../deployments/aggregatorFactoryAddress.json'
import delegationAddress from '../../deployments/delegationAddress.json'
import governanceSatelliteAddress from '../../deployments/governanceSatelliteAddress.json'
import doormanAddress from '../../deployments/doormanAddress.json'
import mvkTokenAddress from '../../deployments/mvkTokenAddress.json'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Satellite setup', async () => {

    var utils: Utils
    var tezos

    before('setup', async () => {
        try {
            utils = new Utils()
            await utils.init(bob.sk)

            //----------------------------
            // Retrieve all contracts
            //----------------------------

            const aggregatorFactoryInstance: AggregatorFactoryContractAbstraction = await utils.tezos.contract.at(aggregatorFactoryAddress.address);
            const aggregatorFactoryStorage = await aggregatorFactoryInstance.storage();

            const aggregatorsAddresses = [...aggregatorFactoryStorage.trackedAggregators.entries()].map(([_, aggregatorAddress]) => aggregatorAddress)
            const aggregatorInstances = await Promise.all(aggregatorsAddresses.map(async aggregatorAddress => {
                await utils.tezos.contract.at(aggregatorAddress)
            }))

            const delegationInstance: DelegationContractAbstraction = await utils.tezos.contract.at(delegationAddress.address);

            const governanceSatelliteInstance: GovernanceSatelliteContractAbstraction = await utils.tezos.contract.at(governanceSatelliteAddress.address);

            const doormanInstance: DoormanContractAbstraction = await utils.tezos.contract.at(doormanAddress.address);
            const doormanStorage = await doormanInstance.storage();

            // no abstraction type for mvk token :(
            const mvkTokenInstance: any = await utils.tezos.contract.at(mvkTokenAddress.address);

            //----------------------------
            // For Oracle/Aggregator test net deployment if needed
            //----------------------------

            if (utils.network != "development") {
                console.log("Setup Satellite")

                for (const oracle of oracles) {
                    console.log(`Transfer mvk to ${oracle.pkh}`)

                    const op = await mvkTokenInstance.methods
                        .transfer([
                                         {
                                           from_: bob.pkh,
                                           txs: [
                                             {
                                               to_: oracle.pkh,
                                               token_id: 0,
                                               amount: doormanStorage.config.minMvkAmount,
                                             },
                                           ],
                                         },
                                       ])
                        .send();
                    await op.confirmation();

                    console.log(`Transfer mvk to ${oracle.pkh} done`)
                }

                for (const oracle of oracles) {
                    console.log(`Set doorman as operator for ${oracle.pkh}`)

                    await utils.setProvider(oracle.sk)
                    const op = await mvkTokenInstance.methods.update_operators([
                     {
                       add_operator: {
                         owner: oracle.pkh,
                         operator: doormanAddress.address,
                         token_id: 0,
                       },
                     },
                    ]).send();
                    await op.confirmation();

                    console.log(`Set doorman as operator for ${oracle.pkh} done`)
                }

                for (const oracle of oracles) {
                    console.log(`Stake mvk for ${oracle.pkh}`)

                    await utils.setProvider(oracle.sk)
                    const op = await doormanInstance.methods.stake(new BigNumber(doormanStorage.config.minMvkAmount)).send();
                    await op.confirmation();

                    console.log(`Stake mvk for ${oracle.pkh} done`)
                }

                for (const oracle of oracles) {
                    console.log(`Register ${oracle.pkh} as satellite`)

                    await utils.setProvider(oracle.sk)
                    const op = await delegationInstance.methods.registerAsSatellite(
                        `New Satellite (${oracle.peerId})`,
                        `New Satellite Description (${oracle.peerId})`,
                        "https://placeholder.com/300",
                        "https://placeholder.com/300",
                        new BigNumber(700) // What should i put here?
                    ).send();
                    await op.confirmation();

                    console.log(`Register ${oracle.pkh} as satellite done`)
                }

                // TODO: could check if aggrgators are already registered

                for (const oracle of oracles) {


                    for (const aggregatorAddress of aggregatorsAddresses) {

                        // console.log(`Add ${oracle.pkh} as to aggregator ${aggregatorAddress} on gov satellite contract`)
                        //
                        // await utils.setProvider(oracle.sk)
                        // const op = await governanceSatelliteInstance.methods.addOracleToAggregator(
                        //     oracle.pkh,
                        //     aggregatorAddress,
                        //     'purpose' // What should I put here?
                        // ).send();
                        // await op.confirmation();
                        //
                        // console.log(`Add ${oracle.pkh} as to aggregator ${aggregatorAddress} on gov satellite contract done`)
                    }

                    // TODO: accept gov proposition

                }



                console.log("Setup Satellite done")
            }

        } catch (e) {
            console.dir(e, {depth: 5})
        }

    })

    it(`oracle setup`, async () => {
        try {
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        } catch (e) {
            console.log(e)
        }
    })

})
