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

import { GovernanceSatellite, setGovernanceSatelliteLambdas } from '../contractHelpers/governanceSatelliteTestHelper'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { governanceSatelliteStorage } from '../../storage/governanceSatelliteStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Governance Satellite', async () => {
  
  var utils: Utils
  var governanceSatellite: GovernanceSatellite
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
      
      governanceSatelliteStorage.mvkTokenAddress     = mvkTokenAddress.address
      governanceSatelliteStorage.governanceAddress   = governanceAddress.address
      governanceSatellite = await GovernanceSatellite.originate(utils.tezos,governanceSatelliteStorage);
  
      await saveContractAddress('governanceSatelliteAddress', governanceSatellite.contract.address)
      console.log('Governance Satellite Contract deployed at:', governanceSatellite.contract.address)

      /* ---- ---- ---- ---- ---- */
  
      tezos = governanceSatellite.tezos
  
      // Set Lambdas
  
      await signerFactory(bob.sk);

      // Governance Satellite Setup Lambdas      
      await setGovernanceSatelliteLambdas(tezos, governanceSatellite.contract)
      console.log("Governance Satellite Lambdas Setup")

    } catch(e){
      console.dir(e, {depth: 5})
    }

  })

  it(`governance satellite contract deployed`, async () => {
    try {
      console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
    } catch (e) {
      console.log(e)
    }
  })
  
})