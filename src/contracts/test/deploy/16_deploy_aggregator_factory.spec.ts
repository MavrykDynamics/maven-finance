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

import { bob } from '../../scripts/sandbox/accounts'

// ------------------------------------------------------------------------------
// Contract Address
// ------------------------------------------------------------------------------

import mvkTokenAddress from '../../deployments/mvkTokenAddress.json';
import governanceAddress from '../../deployments/governanceAddress.json';

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import {
  AggregatorFactory,
  setAggregatorFactoryLambdas, setAggregatorFactoryProductLambdas
} from '../contractHelpers/aggregatorFactoryTestHelper'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { aggregatorFactoryStorage } from '../../storage/aggregatorFactoryStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Aggregator Factory', async () => {
  
  var utils: Utils
  var aggregatorFactory: AggregatorFactory
  var tezos
  

  const signerFactory = async (pk) => {
    await tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) })
    return tezos
  }

  before('setup', async () => {
    try{
      utils = new Utils()
      await utils.init(bob.sk)
  
      //----------------------------
      // Originate and deploy contracts
      //----------------------------
  
      aggregatorFactoryStorage.mvkTokenAddress   = mvkTokenAddress.address;
      aggregatorFactoryStorage.governanceAddress = governanceAddress.address;
      aggregatorFactory = await AggregatorFactory.originate(
        utils.tezos,
        aggregatorFactoryStorage
      )
  
      await saveContractAddress('aggregatorFactoryAddress', aggregatorFactory.contract.address)
      console.log('Aggregator Factory Contract deployed at:', aggregatorFactory.contract.address)
  
      /* ---- ---- ---- ---- ---- */
  
      tezos = aggregatorFactory.tezos
  
      // Set Lambdas
  
      await signerFactory(bob.sk);
  
      // Aggregator Factory Setup Lambdas
      await setAggregatorFactoryLambdas(tezos, aggregatorFactory.contract);
      console.log("AggregatorFactory Lambdas Setup")

      await setAggregatorFactoryProductLambdas(tezos, aggregatorFactory.contract);
      console.log("Aggregator Factory Product Lambdas Setup")

    } catch(e){
      console.dir(e, {depth: 5})
    }

  })

  it(`aggregator factory contract deployed`, async () => {
    try {
      console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
    } catch (e) {
      console.log(e)
    }
  })
  
})
