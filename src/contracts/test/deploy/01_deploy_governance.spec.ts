const { InMemorySigner } = require("@taquito/signer");
import { Utils } from "../helpers/Utils";
const saveContractAddress = require("../../helpers/saveContractAddress")

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

import { bob, alice } from '../../scripts/sandbox/accounts'

// ------------------------------------------------------------------------------
// Contract Address
// ------------------------------------------------------------------------------
import mvkTokenAddress from '../../deployments/mvkTokenAddress.json';

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { Governance, setGovernanceLambdas } from '../contractHelpers/governanceTestHelper'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { governanceStorage } from '../../storage/governanceStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Governance', async () => {
  
  var utils: Utils
  var governance: Governance
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
  
      governanceStorage.whitelistDevelopers = [alice.pkh, bob.pkh]
      governanceStorage.mvkTokenAddress     = mvkTokenAddress.address
      governance = await Governance.originate(utils.tezos,governanceStorage);
  
      await saveContractAddress('governanceAddress', governance.contract.address)
      console.log('Governance Contract deployed at:', governance.contract.address)
  
      /* ---- ---- ---- ---- ---- */
  
      tezos = governance.tezos
  
      // Set Lambdas
  
      await signerFactory(bob.sk);

      // Governance Setup Lambdas
      await setGovernanceLambdas(tezos, governance.contract)
      console.log("Governance Lambdas Setup")

    } catch(e){
      console.dir(e, {depth: 5})
    }

  })

  it(`governance contract deployment`, async () => {
    try {
      console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
    } catch (e) {
      console.log(e)
    }
  })
  
})