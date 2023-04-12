import { Utils } from "../helpers/Utils"
const saveContractAddress = require("../helpers/saveContractAddress")

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

// ------------------------------------------------------------------------------
// Contract Address
// ------------------------------------------------------------------------------

import contractDeployments from '../contractDeployments.json'

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { GeneralContract, setGeneralContractLambdas, setGeneralContractProductLambdas }  from '../helpers/deploymentTestHelper'
import { bob } from '../../scripts/sandbox/accounts'
import * as helperFunctions from '../helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { mvkFaucetStorage } from '../../storage/mvkFaucetStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('MVK Faucet', async () => {
  
  var tezos
  var utils: Utils
  var mvkFaucet

  before('setup', async () => {
    try{

      utils = new Utils()
      await utils.init(bob.sk)
  
      //----------------------------
      // Originate and deploy contracts
      //----------------------------
  
      mvkFaucetStorage.mvkTokenAddress  = contractDeployments.mvkToken.address
      mvkFaucet = await GeneralContract.originate(utils.tezos, "mvkFaucet", mvkFaucetStorage);
  
      await saveContractAddress('mvkFaucetAddress', mvkFaucet.contract.address)

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