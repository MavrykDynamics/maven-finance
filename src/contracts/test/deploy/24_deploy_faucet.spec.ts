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

import { GeneralContract }  from '../helpers/deploymentTestHelper'
import { bob } from '../../scripts/sandbox/accounts'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { mvnFaucetStorage } from '../../storage/mvnFaucetStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('MVN Faucet', async () => {
  
  var tezos
  var utils: Utils
  var mvnFaucet

  before('setup', async () => {
    try{

      utils = new Utils()
      await utils.init(bob.sk)
  
      //----------------------------
      // Originate and deploy contracts
      //----------------------------
  
      mvnFaucetStorage.mvnTokenAddress  = contractDeployments.mvnToken.address
      mvnFaucetStorage.fakeUsdtTokenAddress = contractDeployments.fakeUSDtToken.address
      mvnFaucet = await GeneralContract.originate(utils.tezos, "mvnFaucet", mvnFaucetStorage);
  
      await saveContractAddress('mvnFaucetAddress', mvnFaucet.contract.address)

    } catch(e){

      console.dir(e, {depth: 5})

    }

  })

  it(`mvnFaucet contract deployed`, async () => {
    try {

      console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')

    } catch (e) {

      console.log(e)

    }
  })
  
})