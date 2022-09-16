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

import { Treasury, setTreasuryLambdas } from '../helpers/treasuryHelper'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { treasuryStorage } from '../../storage/treasuryStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Treasury', async () => {
  
  var utils: Utils
  var treasury: Treasury
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
  
      treasuryStorage.governanceAddress = governanceAddress.address
      treasuryStorage.mvkTokenAddress  = mvkTokenAddress.address
      treasury = await Treasury.originate(utils.tezos, treasuryStorage)
  
      await saveContractAddress('treasuryAddress', treasury.contract.address)
      console.log('Treasury Contract deployed at:', treasury.contract.address)
  
      /* ---- ---- ---- ---- ---- */
  
      tezos = treasury.tezos
  
      // Set Lambdas
  
      await signerFactory(bob.sk);
  
      // Treasury Setup Lambdas
      await setTreasuryLambdas(tezos, treasury.contract);
      console.log("Treasury Lambdas Setup")

    } catch(e){
      console.dir(e, {depth: 5})
    }

  })

  it(`treasury contract deployed`, async () => {
    try {
      console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
    } catch (e) {
      console.log(e)
    }
  })
  
})