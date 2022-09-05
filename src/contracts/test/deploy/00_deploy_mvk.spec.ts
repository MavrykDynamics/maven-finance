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
// Contract Helpers
// ------------------------------------------------------------------------------

import { MvkToken } from '../helpers/mvkHelper'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { mvkStorage, mvkTokenDecimals } from '../../storage/mvkTokenStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('MVK Token', async () => {
  
  var utils: Utils
  var mvkToken: MvkToken

  before('setup', async () => {
    try{
      utils = new Utils()
      await utils.init(bob.sk)
  
      //----------------------------
      // Originate and deploy contracts
      //----------------------------
  
      mvkToken = await MvkToken.originate(utils.tezos, mvkStorage)
  
      await saveContractAddress('mvkTokenAddress', mvkToken.contract.address)
      console.log('MVK Token Contract deployed at:', mvkToken.contract.address)
  
      /* ---- ---- ---- ---- ---- */

      //----------------------------
      // Save MVK Decimals to JSON (for reuse in JS / PyTezos Tests)
      //----------------------------
      await saveMVKDecimals(mvkTokenDecimals)

    } catch(e){
      console.dir(e, {depth: 5})
    }

  })

  it(`mvk token contract deployment`, async () => {
    try {
      console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
    } catch (e) {
      console.log(e)
    }
  })
  
})
