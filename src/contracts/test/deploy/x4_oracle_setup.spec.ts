import { MichelsonMap } from '@mavrykdynamics/taquito-michelson-encoder'
import { BigNumber } from "bignumber.js"

import { Utils } from "../helpers/Utils"

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

// ------------------------------------------------------------------------------
// Contract Address
// ------------------------------------------------------------------------------

import contractDeployments from '../contractDeployments.json'
import { getOracleAccounts } from "../helpers/oracleAccounts"

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { bob } from '../../scripts/sandbox/accounts'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Oracle Setup', async () => {
  
    var utils: Utils
    var tezos

    before('setup', async () => {
        try{
            
            utils = new Utils()
            await utils.init(bob.sk)
            
            //----------------------------
            // Retrieve all contracts
            //----------------------------

            // const aggregatorFactoryAddress = "KT1KML9NDARG2ri7XUV9iBMhpVa3V92ndktY";

            const aggregatorFactoryAddress = contractDeployments.aggregatorFactory.address;;

            const aggregatorFactoryInstance: any = await utils.tezos.contract.at(aggregatorFactoryAddress);
            const governanceSatelliteInstance: any = await utils.tezos.contract.at(contractDeployments.governanceSatellite.address);
            
            //----------------------------
            // For Oracle/Aggregator test net deployment if needed
            //----------------------------
        
            if(utils.network != "development"){
        
                console.log("Setup Oracles")

                const oracleAccounts = getOracleAccounts().slice(0, 5)
                const oracleMapLiteral = {}
                oracleAccounts.forEach((account) => {
                    oracleMapLiteral[account.pkh] = {
                        oraclePublicKey: account.pk,
                        oraclePeerId: account.peerId
                    }
                })

                const oracleMap = MichelsonMap.fromLiteral(oracleMapLiteral);

                const btcUsdMetadata = Buffer.from(
                    JSON.stringify({
                        name: 'BTC/USD Aggregator Contract',
                        icon: 'https://infura-ipfs.io/ipfs/QmNyMFPuh43K9wkYHV6shtLYMusqXf3YCkes9aWAgird6u',
                        version: 'v1.0.0',
                        authors: ['Maven Dev Team <info@mavryk.io>'],
                        category: 'cryptocurrency'
                    }),
                    'ascii',
                ).toString('hex')

                const mvrkUsdMetadata = Buffer.from(
                    JSON.stringify({
                        name: 'MVRK/USD Aggregator Contract',
                        icon: '',
                        version: 'v1.0.0',
                        authors: ['Maven Dev Team <info@mavryk.io>'],
                        category: 'cryptocurrency'
                    }),
                    'ascii',
                ).toString('hex')

                const usdtUsdMetadata = Buffer.from(
                    JSON.stringify({
                        name: 'USDT/USD Aggregator Contract',
                        icon: 'https://infura-ipfs.io/ipfs/QmVvUnYu7jfKFR6KDVhPbPXC89tYCCajDvDHuYgPdH6unK',
                        version: 'v1.0.0',
                        authors: ['Maven Dev Team <info@mavryk.io>'],
                        category: 'stablecoin'
                    }),
                    'ascii',
                ).toString('hex')

                const oceanUsdMetadata = Buffer.from(
                    JSON.stringify({
                        name: 'OCEAN/USD Aggregator Contract',
                        icon: 'https://infura-ipfs.io/ipfs/QmVvUnYu7jfKFR6KDVhPbPXC89tYCCajDvDHuYgPdH6unK',
                        version: 'v1.0.0',
                        authors: ['Equiteez <info@mavryk.io>'],
                        category: 'rwa'
                    }),
                    'ascii',
                ).toString('hex')

                const mars1UsdMetadata = Buffer.from(
                    JSON.stringify({
                        name: 'MARS1/USD Aggregator Contract',
                        icon: 'https://cloudflare-ipfs.com/ipfs/QmdkDb6KnboFNknuyK72eFdM1qKgetYZegBoQkcjDYhG5k',
                        version: 'v1.0.0',
                        authors: ['Equiteez <info@mavryk.io>'],
                        category: 'rwa'
                    }),
                    'ascii',
                ).toString('hex')

                const aggregatorDefinitions = [
                    {
                        name: 'BTC/USD',
                        decimals: new BigNumber(8),
                        metadata: btcUsdMetadata,
                    },
                    {
                        name: 'MVRK/USD',
                        decimals: new BigNumber(6),
                        metadata: mvrkUsdMetadata,
                    },
                    {
                        name: 'USDT/USD',
                        decimals: new BigNumber(6),
                        metadata: usdtUsdMetadata,
                    },
                    {
                        name: 'OCEAN/USD',
                        decimals: new BigNumber(3),
                        metadata: oceanUsdMetadata,
                    },
                    {
                        name: 'MARS1/USD',
                        decimals: new BigNumber(3),
                        metadata: mars1UsdMetadata,
                    },
                ]

                const governanceSatelliteStorage: any = await governanceSatelliteInstance.storage()

                for (const aggregatorDefinition of aggregatorDefinitions) {
                    const existingAggregatorAddress = await governanceSatelliteStorage.aggregatorLedger.get(aggregatorDefinition.name)

                    if (existingAggregatorAddress !== undefined) {
                        console.log(`${aggregatorDefinition.name} already exists at ${existingAggregatorAddress}; adding missing oracles`)

                        const aggregatorInstance: any = await utils.tezos.contract.at(existingAggregatorAddress)
                        const aggregatorStorage: any = await aggregatorInstance.storage()

                        for (const account of oracleAccounts) {
                            const oracleRecord = await aggregatorStorage.oracleLedger.get(account.pkh)
                            if (oracleRecord !== undefined) {
                                continue
                            }

                            console.log(`Adding oracle ${account.pkh} to ${aggregatorDefinition.name}`)
                            const addOracleOperation = await aggregatorInstance.methods.addOracle(account.pkh).send()
                            await addOracleOperation.confirmation()
                        }

                        continue
                    }

                    console.log(`Creating ${aggregatorDefinition.name} aggregator`)
                    const createAggregatorOperation = await aggregatorFactoryInstance.methods.createAggregator(
                        aggregatorDefinition.name,
                        true,
                        oracleMap,
                        aggregatorDefinition.decimals,
                        new BigNumber(2),             // alphaPercentPerThousand
                        new BigNumber(60),            // percentOracleThreshold
                        new BigNumber(300),           // heartbeatSeconds
                        new BigNumber(10000000),      // rewardAmountStakedMvn
                        new BigNumber(1300),          // rewardAmountMvrk
                        aggregatorDefinition.metadata
                    ).send()
                    await createAggregatorOperation.confirmation()
                }

                console.log("Aggregators setup")
            }

        } catch(e){
            console.dir(e, {depth: 5})
            throw e
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
