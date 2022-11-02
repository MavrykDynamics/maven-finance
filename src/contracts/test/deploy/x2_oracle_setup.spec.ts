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

import {bob, eve, mallory, oracleMaintainer} from '../../scripts/sandbox/accounts'
import {oracles} from '../../scripts/sandbox/oracles'

// ------------------------------------------------------------------------------
// Contract Address
// ------------------------------------------------------------------------------

import aggregatorFactoryAddress from '../../deployments/aggregatorFactoryAddress.json'

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

      const aggregatorFactoryInstance: any     = await utils.tezos.contract.at(aggregatorFactoryAddress.address);
      
      //----------------------------
      // For Oracle/Aggregator test net deployment if needed
      //----------------------------
  
      if(utils.network != "development"){
  
          console.log("Setup Oracles")

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

          const aggregatorMetadataBase = Buffer.from(
              JSON.stringify({
                  name: 'MAVRYK Aggregator Contract',
                  icon: 'https://logo.chainbit.xyz/xtz',
                  version: 'v1.0.0',
                  authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
              }),
              'ascii',
              ).toString('hex')
  
          const createAggregatorsBatch = await utils.tezos.wallet
              .batch()
              .withContractCall(aggregatorFactoryInstance.methods.createAggregator(

                  'USDBTC',
                  true,
                  
                  oracleMap,
  
                  new BigNumber(16),            // decimals
                  new BigNumber(2),             // alphaPercentPerThousand
                  
                  new BigNumber(60),            // percentOracleThreshold
                  new BigNumber(30),            // heartBeatSeconds

                  new BigNumber(10000000),      // rewardAmountStakedMvk
                  new BigNumber(1300),          // rewardAmountXtz
                  
                  aggregatorMetadataBase       // metadata bytes

              ))
              .withContractCall(aggregatorFactoryInstance.methods.createAggregator(
  
                  'USDXTZ',
                  true,
  
                  oracleMap,
  
                  new BigNumber(16),            // decimals
                  new BigNumber(2),             // alphaPercentPerThousand
                  
                  new BigNumber(60),            // percentOracleThreshold
                  new BigNumber(30),            // heartBeatSeconds

                  new BigNumber(10000000),      // rewardAmountStakedMvk
                  new BigNumber(1300),          // rewardAmountXtz
                  
                  aggregatorMetadataBase        // metadata bytes

              ))
              .withContractCall(aggregatorFactoryInstance.methods.createAggregator(
  
                  'USDDOGE',
                  true,
  
                  oracleMap,
  
                  new BigNumber(16),            // decimals
                  new BigNumber(2),             // alphaPercentPerThousand
                  
                  new BigNumber(60),            // percentOracleThreshold
                  new BigNumber(30),            // heartBeatSeconds

                  new BigNumber(10000000),      // rewardAmountStakedMvk
                  new BigNumber(1300),          // rewardAmountXtz
                  
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
