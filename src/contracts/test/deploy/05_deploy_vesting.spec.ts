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

import { Vesting, setVestingLambdas } from '../helpers/vestingHelper'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { vestingStorage } from '../../storage/vestingStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Vesting', async () => {
  
  var utils: Utils
  var vesting: Vesting
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

      vestingStorage.governanceAddress  = governanceAddress.address
      vestingStorage.mvkTokenAddress    = mvkTokenAddress.address
      vesting = await Vesting.originate(utils.tezos,vestingStorage);
  
      await saveContractAddress('vestingAddress', vesting.contract.address)
      console.log('Vesting Contract deployed at:', vesting.contract.address)
  
      /* ---- ---- ---- ---- ---- */
  
      tezos = vesting.tezos
  
      // Set Lambdas
  
      await signerFactory(bob.sk);
  
      // Vesting Setup Lambdas      
      await setVestingLambdas(tezos, vesting.contract);
      console.log("Vesting Lambdas Setup")

    } catch(e){
      console.dir(e, {depth: 5})
    }

  })

  it(`vesting contract deployed`, async () => {
    try {
      console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
    } catch (e) {
      console.log(e)
    }
  })
  
})