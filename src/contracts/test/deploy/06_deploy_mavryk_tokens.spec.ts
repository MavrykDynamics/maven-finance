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

import governanceAddress from '../../deployments/governanceAddress.json';

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { MavrykFa12Token } from '../helpers/mavrykFa12TokenHelper'
import { MavrykFa2Token } from '../helpers/mavrykFa2TokenHelper'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { mavrykFa12TokenStorage } from '../../storage/mavrykFa12TokenStorage'
import { mavrykFa2TokenStorage } from '../../storage/mavrykFa2TokenStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Mavryk Token', async () => {
  
  var utils: Utils
  var mavrykFa12Token : MavrykFa12Token
  var mavrykFa2Token : MavrykFa2Token

  before('setup', async () => {
    try{
      utils = new Utils()
      await utils.init(bob.sk)
  
      //----------------------------
      // Originate and deploy contracts
      //----------------------------
  
      mavrykFa12TokenStorage.governanceAddress  = governanceAddress.address;
      mavrykFa12Token = await MavrykFa12Token.originate(
        utils.tezos,
        mavrykFa12TokenStorage
      )
  
      await saveContractAddress('mavrykFa12TokenAddress', mavrykFa12Token.contract.address)
      console.log('Mavryk FA12 Token Contract deployed at:', mavrykFa12Token.contract.address)
  
      mavrykFa2TokenStorage.governanceAddress  = governanceAddress.address;
      mavrykFa2Token = await MavrykFa2Token.originate(
        utils.tezos,
        mavrykFa2TokenStorage
      )
  
      await saveContractAddress('mavrykFa2TokenAddress', mavrykFa2Token.contract.address)
      console.log('Mavryk Fa2 Token Contract deployed at:', mavrykFa2Token.contract.address)

    } catch(e){
      console.dir(e, {depth: 5})
    }

  })

  it(`mavryk token contracts deployed`, async () => {
    try {
      console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
    } catch (e) {
      console.log(e)
    }
  })
  
})