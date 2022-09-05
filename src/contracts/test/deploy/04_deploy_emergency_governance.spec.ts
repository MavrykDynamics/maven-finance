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

import { EmergencyGovernance, setEmergencyGovernanceLambdas } from '../helpers/emergencyGovernanceHelper'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { emergencyGovernanceStorage } from '../../storage/emergencyGovernanceStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Emergency Governance', async () => {
  
  var utils: Utils
  var emergencyGovernance: EmergencyGovernance
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
  
      emergencyGovernanceStorage.governanceAddress = governanceAddress.address
      emergencyGovernanceStorage.mvkTokenAddress  = mvkTokenAddress.address
      emergencyGovernance = await EmergencyGovernance.originate(utils.tezos, emergencyGovernanceStorage)
  
      await saveContractAddress('emergencyGovernanceAddress', emergencyGovernance.contract.address)
      console.log('Emergency Governance Contract deployed at:', emergencyGovernance.contract.address)
  
      /* ---- ---- ---- ---- ---- */
  
      tezos = emergencyGovernance.tezos
  
      // Set Lambdas
  
      await signerFactory(bob.sk);
  
      // Emergency Governance Setup Lambdas
      await setEmergencyGovernanceLambdas(tezos, emergencyGovernance.contract)
      console.log("Emergency Governance Lambdas Setup")

    } catch(e){
      console.dir(e, {depth: 5})
    }

  })

  it(`emergency governance contract deployed`, async () => {
    try {
      console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
    } catch (e) {
      console.log(e)
    }
  })
  
})