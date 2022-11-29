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

import { GovernanceProxy, setGovernanceProxyContractLambdas, setGovernanceProxyContractProxyLambdas } from '../contractHelpers/governanceProxyTestHelper'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { governanceProxyStorage } from '../../storage/governanceProxyStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Governance Proxy', async () => {
  
  var utils: Utils
  var governanceProxy: GovernanceProxy
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
  
      governanceProxyStorage.governanceAddress  = governanceAddress.address;
      governanceProxyStorage.mvkTokenAddress    = mvkTokenAddress.address;
      governanceProxy = await GovernanceProxy.originate(utils.tezos, governanceProxyStorage);
  
      await saveContractAddress('governanceProxyAddress', governanceProxy.contract.address)
      console.log('Governance Proxy Contract deployed at:', governanceProxy.contract.address)
  
      /* ---- ---- ---- ---- ---- */
  
      tezos = governanceProxy.tezos
  
      // Set Lambdas
  
      await signerFactory(bob.sk);
  
      // Governance Proxy Setup Lambdas - Contract Lambdas
      await setGovernanceProxyContractLambdas(tezos, governanceProxy.contract, 7) // 7 is the last index + 1 (exclusive)
      console.log("Governance Proxy Contract - Lambdas Setup")

      // Governance Proxy Setup Lambdas - Proxy Lambdas
      await setGovernanceProxyContractProxyLambdas(tezos, governanceProxy.contract, 7) // 7 is the starting index (inclusive)
      console.log("Governance Proxy Contract - Proxy Lambdas Setup")

    } catch(e){
      console.dir(e, {depth: 5})
    }

  })

  it(`governance proxy contract deployed`, async () => {
    try {
      console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
    } catch (e) {
      console.log(e)
    }
  })
  
})