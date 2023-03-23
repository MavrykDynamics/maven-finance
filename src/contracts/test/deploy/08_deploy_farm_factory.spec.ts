const { InMemorySigner } = require("@taquito/signer");
import { Utils } from "../helpers/Utils";
const saveContractAddress = require("../../helpers/saveContractAddress")
const saveMVKDecimals = require('../../helpers/saveMVKDecimals')

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

import { FarmFactory, setFarmFactoryLambdas, setFarmFactoryProductLambdas, setFarmFactoryMFarmProductLambdas } from "../contractHelpers/farmFactoryTestHelper"

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { farmFactoryStorage } from "../../storage/farmFactoryStorage";

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Farm Factory', async () => {
  
  var utils: Utils
  var farmFactory: FarmFactory;
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
  
      farmFactoryStorage.governanceAddress = governanceAddress.address
      farmFactoryStorage.mvkTokenAddress  = mvkTokenAddress.address
      farmFactory = await FarmFactory.originate(
        utils.tezos,
        farmFactoryStorage
      );
  
      await saveContractAddress("farmFactoryAddress", farmFactory.contract.address)
      console.log("Farm Factory Contract deployed at:", farmFactory.contract.address);

      /* ---- ---- ---- ---- ---- */
  
      tezos = farmFactory.tezos
  
      // Set Lambdas
  
      await signerFactory(bob.sk);

      // Farm Factory Setup Lambdas
      await setFarmFactoryLambdas(tezos, farmFactory.contract)
      console.log("Farm Factory Lambdas Setup")

      // Farm Factory Setup Product Lambdas - Standard Farm Lambdas
      await setFarmFactoryProductLambdas(tezos, farmFactory.contract)
      console.log("Farm Factory Product (Farm) Lambdas Setup")

      // Farm Factory Setup Product Lambdas - mFarm Lambdas
      await setFarmFactoryMFarmProductLambdas(tezos, farmFactory.contract)
      console.log("Farm Factory Product (Farm mToken) Lambdas Setup")

    } catch(e){
      console.dir(e, {depth: 5})
    }

  })

  it(`farm factory contract deployed`, async () => {
    try {
      console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
    } catch (e) {
      console.log(e)
    }
  })
  
})