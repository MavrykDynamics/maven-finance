import { Utils } from "../helpers/Utils";
const saveContractAddress = require("../../helpers/saveContractAddress")

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

import { bob } from '../../scripts/sandbox/accounts'


// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { MockFa12Token } from '../helpers/mockFa12TokenHelper'
import { MockFa2Token } from '../helpers/mockFa2TokenHelper'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { mockFa12TokenStorage } from '../../storage/mockFa12TokenStorage'
import { mockFa2TokenStorage } from '../../storage/mockFa2TokenStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Mock Token', async () => {
  
  var utils: Utils
  var mockFa12Token : MockFa12Token
  var mockFa2Token : MockFa2Token

  before('setup', async () => {
    try{
      utils = new Utils()
      await utils.init(bob.sk)
  
      //----------------------------
      // Originate and deploy contracts
      //----------------------------
  
      mockFa12Token = await MockFa12Token.originate(
        utils.tezos,
        mockFa12TokenStorage
      )
  
      await saveContractAddress('mockFa12TokenAddress', mockFa12Token.contract.address)
      console.log('Mock FA12 Token Contract deployed at:', mockFa12Token.contract.address)
  
      mockFa2Token = await MockFa2Token.originate(
        utils.tezos,
        mockFa2TokenStorage
      )
  
      await saveContractAddress('mockFa2TokenAddress', mockFa2Token.contract.address)
      console.log('Mock Fa2 Token Contract deployed at:', mockFa2Token.contract.address)

    } catch(e){
      console.dir(e, {depth: 5})
    }

  })

  it(`mock token contracts deployed`, async () => {
    try {
      console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
    } catch (e) {
      console.log(e)
    }
  })
  
})