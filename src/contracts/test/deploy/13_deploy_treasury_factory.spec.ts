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

import { TreasuryFactory, 
  setTreasuryFactoryLambdas, setTreasuryFactoryProductLambdas 
} from '../helpers/treasuryFactoryHelper'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { treasuryFactoryStorage } from '../../storage/treasuryFactoryStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Treasury Factory', async () => {
  
  var utils: Utils
  var treasuryFactory: TreasuryFactory
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
  
      treasuryFactoryStorage.governanceAddress = governanceAddress.address
      treasuryFactoryStorage.mvkTokenAddress  = mvkTokenAddress.address
      treasuryFactory = await TreasuryFactory.originate(utils.tezos, treasuryFactoryStorage)
  
      await saveContractAddress('treasuryFactoryAddress', treasuryFactory.contract.address)
      console.log('Treasury Factory Contract deployed at:', treasuryFactory.contract.address)
  
      /* ---- ---- ---- ---- ---- */
  
      tezos = treasuryFactory.tezos
  
      // Set Lambdas
  
      await signerFactory(bob.sk);
  
      // Treasury Factory Setup Lambdas
      await setTreasuryFactoryLambdas(tezos, treasuryFactory.contract);
      console.log("Treasury Factory Lambdas Setup")

      // Treasury Factory Product Setup Lambdas
      await setTreasuryFactoryProductLambdas(tezos, treasuryFactory.contract);
      console.log("Treasury Factory Product Lambdas Setup")

    } catch(e){
      console.dir(e, {depth: 5})
    }

  })

  it(`treasury factory contract deployed`, async () => {
    try {
      console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
    } catch (e) {
      console.log(e)
    }
  })
  
})