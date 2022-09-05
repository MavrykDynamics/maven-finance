const { InMemorySigner, importKey } = require("@taquito/signer");
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

import { Doorman, setDoormanLambdas } from '../helpers/doormanHelper'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { doormanStorage } from '../../storage/doormanStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Doorman', async () => {
  
  var utils: Utils
  var doorman: Doorman
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
  
      doormanStorage.governanceAddress  = governanceAddress.address
      doormanStorage.mvkTokenAddress    = mvkTokenAddress.address
      doorman = await Doorman.originate(utils.tezos, doormanStorage)
  
      await saveContractAddress('doormanAddress', doorman.contract.address)
      console.log('Doorman Contract deployed at:', doorman.contract.address)
  
      /* ---- ---- ---- ---- ---- */
  
      tezos = doorman.tezos
  
      // Set Lambdas
  
      await signerFactory(bob.sk);

      // Doorman Setup Lambdas
      await setDoormanLambdas(tezos, doorman.contract)
      console.log("Doorman Lambdas Setup")

    } catch(e){
      console.dir(e, {depth: 5})
    }

  })

  it(`doorman contract deployment`, async () => {
    try {
      console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
    } catch (e) {
      console.log(e)
    }
  })
  
})