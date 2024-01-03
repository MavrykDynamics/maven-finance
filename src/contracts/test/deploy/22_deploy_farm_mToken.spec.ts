import { Utils } from "../helpers/Utils";
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

import { GeneralContract, setGeneralContractLambdas }  from '../helpers/deploymentTestHelper'
import { bob } from '../../scripts/sandbox/accounts'
import * as helperFunctions from '../helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { farmMTokenStorage } from "../../storage/farmMTokenStorage";

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Farms mToken', async () => {
  
  var utils: Utils
  var farmMToken
  var tezos

  before('setup', async () => {
    try{
      utils = new Utils()
      await utils.init(bob.sk)
  
      //----------------------------
      // Originate and deploy contracts
      //----------------------------

      // Deploy Farm mToken

      farmMTokenStorage.governanceAddress           = contractDeployments.governance.address;
      farmMTokenStorage.mvnTokenAddress             = contractDeployments.mvnToken.address;
      farmMTokenStorage.config.loanToken            = "usdt";
      farmMTokenStorage.config.lpToken.tokenAddress = contractDeployments.mTokenUsdt.address;
  
      farmMToken = await GeneralContract.originate(utils.tezos, "farmMToken", farmMTokenStorage);
      await saveContractAddress("farmMTokenAddress", farmMToken.contract.address)
  
  
      tezos = farmMToken.tezos
      await helperFunctions.signerFactory(tezos, bob.sk);

      // Set Lambdas
      await setGeneralContractLambdas(tezos, "farmMToken", farmMToken.contract)

    } catch(e){
      console.dir(e, {depth: 5})
    }

  })

  it(`farm mToken contract deployed`, async () => {
    try {
      console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
    } catch (e) {
      console.log(e)
    }
  })
  
})