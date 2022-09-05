const { InMemorySigner } = require("@taquito/signer");
import { Utils } from "../helpers/Utils";
const saveContractAddress = require("../../helpers/saveContractAddress")

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

import {Aggregator, setAggregatorLambdas} from '../helpers/aggregatorHelper'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { aggregatorStorage } from '../../storage/aggregatorStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Aggregator', async () => {
  
  var utils: Utils

  var aggregator: Aggregator
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
  
      aggregatorStorage.mvkTokenAddress = mvkTokenAddress.address
      aggregatorStorage.governanceAddress = governanceAddress.address
      aggregator = await Aggregator.originate(
        utils.tezos,
        aggregatorStorage
      )
  
      await saveContractAddress('aggregatorAddress', aggregator.contract.address)
      console.log('Aggregator Contract deployed at:', aggregator.contract.address)
  
      /* ---- ---- ---- ---- ---- */
  
      tezos = aggregator.tezos
  
      // Set Lambdas
  
      await signerFactory(bob.sk);
  
      // Aggregator Setup Lambdas
      await setAggregatorLambdas(tezos, aggregator.contract);
      console.log("Aggregator Lambdas Setup")

    } catch(e){
      console.dir(e, {depth: 5})
    }

  })

  it(`aggregator contract deployed`, async () => {
    try {
      console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
    } catch (e) {
      console.log(e)
    }
  })
  
})