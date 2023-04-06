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

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import {MvkFaucet} from '../contractHelpers/mvkFaucetTestHelper'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { mvkFaucetStorage } from '../../storage/mvkFaucetStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('MVK Faucet', async () => {
  
  var utils: Utils

  var mvkFaucet: MvkFaucet
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
  
      mvkFaucetStorage.mvkTokenAddress  = mvkTokenAddress.address
      mvkFaucet                         = await MvkFaucet.originate(
        utils.tezos,
        mvkFaucetStorage
      )
  
      await saveContractAddress('mvkFaucetAddress', mvkFaucet.contract.address)
      console.log('MVK Faucet Contract deployed at:', mvkFaucet.contract.address)

    } catch(e){
      console.dir(e, {depth: 5})
    }

  })

  it(`mvkFaucet contract deployed`, async () => {
    try {
      console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
    } catch (e) {
      console.log(e)
    }
  })
  
})