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

import { GovernanceFinancial, setGovernanceFinancialLambdas } from '../contractHelpers/governanceFinancialTestHelper'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { governanceFinancialStorage } from '../../storage/governanceFinancialStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Governance Financial', async () => {
  
  var utils: Utils
  var governanceFinancial: GovernanceFinancial
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
  
      governanceFinancialStorage.mvkTokenAddress     = mvkTokenAddress.address
      governanceFinancialStorage.governanceAddress   = governanceAddress.address
      governanceFinancial = await GovernanceFinancial.originate(utils.tezos,governanceFinancialStorage);
  
      await saveContractAddress('governanceFinancialAddress', governanceFinancial.contract.address)
      console.log('Governance Financial Contract deployed at:', governanceFinancial.contract.address)
    
      /* ---- ---- ---- ---- ---- */
  
      tezos = governanceFinancial.tezos
  
      // Set Lambdas
  
      await signerFactory(bob.sk);

      // Governance Financial Setup Lambdas
      await setGovernanceFinancialLambdas(tezos, governanceFinancial.contract)
      console.log("Governance Financial Lambdas Setup")

    } catch(e){
      console.dir(e, {depth: 5})
    }

  })

  it(`governance financial contract deployed`, async () => {
    try {
      console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
    } catch (e) {
      console.log(e)
    }
  })
  
})