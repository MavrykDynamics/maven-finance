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
import treasuryAddress from '../../deployments/treasuryAddress.json';

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { TokenSale } from '../helpers/tokenSaleHelper'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { tokenSaleStorage } from '../../storage/tokenSaleStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Token Sale', async () => {
  
  var utils: Utils
  var tokenSale: TokenSale

  before('setup', async () => {
    try{
      utils = new Utils()
      await utils.init(bob.sk)
  
      //----------------------------
      // Originate and deploy contracts
      //----------------------------

      tokenSaleStorage.governanceAddress = governanceAddress.address
      tokenSaleStorage.treasuryAddress   = treasuryAddress.address
      tokenSaleStorage.mvkTokenAddress   = mvkTokenAddress.address
      tokenSale = await TokenSale.originate(
        utils.tezos,
        tokenSaleStorage
      )

      await saveContractAddress('tokenSaleAddress', tokenSale.contract.address)
      console.log('Token Sale Contract deployed at:', tokenSale.contract.address)

    } catch(e){
      console.dir(e, {depth: 5})
    }

  })

  it(`token sale contract deployed`, async () => {
    try {
      console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
    } catch (e) {
      console.log(e)
    }
  })
  
})