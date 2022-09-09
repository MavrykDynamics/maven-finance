const { InMemorySigner } = require("@taquito/signer");
import { Utils } from "../helpers/Utils";
import { confirmOperation } from "../../scripts/confirmation";
const saveContractAddress = require("../../helpers/saveContractAddress")
import { MichelsonMap } from '@taquito/michelson-encoder'
import {BigNumber} from "bignumber.js";

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

import { bob, oracle0, oracle1, oracle2, oracleMaintainer } from '../../scripts/sandbox/accounts'

// ------------------------------------------------------------------------------
// Contract Address
// ------------------------------------------------------------------------------

import aggregatorFactoryAddress from '../../deployments/aggregatorFactoryAddress.json'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Aggregator Factory', async () => {
  
  var utils: Utils
  var tezos

  before('setup', async () => {
    try{
      utils = new Utils()
      await utils.init(bob.sk)
      
      //----------------------------
      // Retrieve all contracts
      //----------------------------

      const aggregatorFactoryInstance: any     = await utils.tezos.contract.at(aggregatorFactoryAddress.address);
      
      //----------------------------
      // For Oracle/Aggregator test net deployment if needed
      //----------------------------
  
      if(utils.network != "development"){
  
          console.log("Setup Oracles")
  
          const oracleMap = MichelsonMap.fromLiteral({
            [oracle0.pkh] : true,
            [oracle1.pkh] : true,
            [oracle2.pkh] : true,
            // [oracle3.pkh]: true,
            // [oracle4.pkh]: true,
          }) as MichelsonMap<
              string,
              boolean
              >

            const aggregatorMetadataBase = Buffer.from(
                JSON.stringify({
                    name: 'MAVRYK Aggregator Contract',
                    version: 'v1.0.0',
                    authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
                }),
                'ascii',
                ).toString('hex')
  
          const createAggregatorsBatch = await utils.tezos.wallet
              .batch()
              .withContractCall(aggregatorFactoryInstance.methods.createAggregator(
                  'USD',
                  'BTC',
  
                  'USDBTC',
                  true,
                  
                  oracleMap,
  
                  new BigNumber(16),            // decimals
                  new BigNumber(2),             // numberBlocksDelay
                  
                  new BigNumber(86400),         // deviationTriggerBanDuration
                  new BigNumber(5),             // perthousandDeviationTrigger
                  new BigNumber(60),            // percentOracleThreshold
                  
                  new BigNumber(0),             // requestRateDeviationDepositFee
  
                  new BigNumber(10000000),      // deviationRewardStakedMvk
                  new BigNumber(0),             // deviationRewardAmountXtz
                  new BigNumber(10000000),      // rewardAmountStakedMvk
                  new BigNumber(1300),          // rewardAmountXtz
                  
                  oracleMaintainer.pkh,         // maintainer
                  aggregatorMetadataBase       // metadata bytes

              ))
              .withContractCall(aggregatorFactoryInstance.methods.createAggregator(
                  'USD',
                  'XTZ',
  
                  'USDXTZ',
                  true,
  
                  oracleMap,
  
                  new BigNumber(16),            // decimals
                  new BigNumber(2),             // numberBlocksDelay
                  
                  new BigNumber(86400),         // deviationTriggerBanDuration
                  new BigNumber(5),             // perthousandDeviationTrigger
                  new BigNumber(60),            // percentOracleThreshold
                  
                  new BigNumber(0),             // requestRateDeviationDepositFee
                  
                  new BigNumber(10000000),      // deviationRewardStakedMvk
                  new BigNumber(0),             // deviationRewardAmountXtz
                  new BigNumber(10000000),      // rewardAmountStakedMvk
                  new BigNumber(1300),          // rewardAmountXtz
                  
                  oracleMaintainer.pkh,         // maintainer
                  aggregatorMetadataBase        // metadata bytes

              ))
              .withContractCall(aggregatorFactoryInstance.methods.createAggregator(
                  'USD',
                  'DOGE',
  
                  'USDDOGE',
                  true,
  
                  oracleMap,
  
                  new BigNumber(16),            // decimals
                  new BigNumber(2),             // numberBlocksDelay
                  
                  new BigNumber(86400),         // deviationTriggerBanDuration
                  new BigNumber(5),             // perthousandDeviationTrigger
                  new BigNumber(60),            // percentOracleThreshold
                  
                  new BigNumber(0),             // requestRateDeviationDepositFee
                  
                  new BigNumber(10000000),      // deviationRewardStakedMvk
                  new BigNumber(0),             // deviationRewardAmountXtz
                  new BigNumber(10000000),      // rewardAmountStakedMvk
                  new BigNumber(1300),          // rewardAmountXtz
                  
                  oracleMaintainer.pkh,         // maintainer
                  aggregatorMetadataBase        // metadata bytes
                  
              ))
  
          const createAggregatorsBatchOperation = await createAggregatorsBatch.send()
          await createAggregatorsBatchOperation.confirmation();
  
          console.log("Aggregators deployed")
      }

    } catch(e){
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