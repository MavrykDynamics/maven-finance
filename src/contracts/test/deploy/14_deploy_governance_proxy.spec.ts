const { InMemorySigner } = require("@taquito/signer");
import { Utils } from "../helpers/Utils";
const saveContractAddress = require("../../helpers/saveContractAddress")

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

import { bob } from '../../scripts/sandbox/accounts'

// ------------------------------------------------------------------------------
// Governance Proxy Node Lambdas
// ------------------------------------------------------------------------------

import governanceProxyNodeOneLambdas from "../../build/lambdas/governanceProxyNodeOneLambdas.json";
import governanceProxyNodeTwoLambdas from "../../build/lambdas/governanceProxyNodeTwoLambdas.json";

// ------------------------------------------------------------------------------
// Contract Address
// ------------------------------------------------------------------------------

import mvkTokenAddress from '../../deployments/mvkTokenAddress.json';
import governanceAddress from '../../deployments/governanceAddress.json';

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { GovernanceProxy, setGovernanceProxyContractLambdas, setGovernanceProxyContractProxyLambdas } from '../contractHelpers/governanceProxyTestHelper'
import { GovernanceProxyNode, setGovernanceProxyNodeContractLambdas, setGovernanceProxyNodeContractProxyLambdas } from '../contractHelpers/governanceProxyNodeTestHelper'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { governanceProxyStorage } from '../../storage/governanceProxyStorage'
import { governanceProxyNodeStorage } from '../../storage/governanceProxyNodeStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Governance Proxy', async () => {
  
  var utils: Utils
  var governanceProxy: GovernanceProxy
  var governanceProxyNodeOne: GovernanceProxyNode
  var governanceProxyNodeTwo: GovernanceProxyNode
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
  
      // Governance Proxy

      governanceProxyStorage.governanceAddress  = governanceAddress.address;
      governanceProxyStorage.mvkTokenAddress    = mvkTokenAddress.address;
      governanceProxy = await GovernanceProxy.originate(utils.tezos, governanceProxyStorage);
  
      await saveContractAddress('governanceProxyAddress', governanceProxy.contract.address)
      console.log('Governance Proxy Contract deployed at:', governanceProxy.contract.address)

      // Governance Proxy Node One

      governanceProxyNodeStorage.governanceAddress  = governanceAddress.address;
      governanceProxyNodeStorage.mvkTokenAddress    = mvkTokenAddress.address;
      governanceProxyNodeOne = await GovernanceProxyNode.originate(utils.tezos, governanceProxyNodeStorage);
  
      await saveContractAddress('governanceProxyNodeOneAddress', governanceProxyNodeOne.contract.address)
      console.log('Governance Proxy Node One Contract deployed at:', governanceProxyNodeOne.contract.address)

      // Governance Proxy Node Two

      governanceProxyNodeStorage.governanceAddress  = governanceAddress.address;
      governanceProxyNodeStorage.mvkTokenAddress    = mvkTokenAddress.address;
      governanceProxyNodeTwo = await GovernanceProxyNode.originate(utils.tezos, governanceProxyNodeStorage);
  
      await saveContractAddress('governanceProxyNodeTwoAddress', governanceProxyNodeTwo.contract.address)
      console.log('Governance Proxy Node Two Contract deployed at:', governanceProxyNodeTwo.contract.address)
  
      /* ---- ---- ---- ---- ---- */
  
      tezos = governanceProxy.tezos
  
      // Set Lambdas
  
      await signerFactory(bob.sk);
  
      // Governance Proxy Setup Lambdas - Contract Lambdas
      await setGovernanceProxyContractLambdas(tezos, governanceProxy.contract, 8) // 8 is the last index + 1 (exclusive)
      console.log("Governance Proxy Contract - Lambdas Setup")

      // Governance Proxy Setup Lambdas - Proxy Lambdas
      // await setGovernanceProxyContractProxyLambdas(tezos, governanceProxy.contract, 8) // 8 is the starting index (inclusive)
      // console.log("Governance Proxy Contract - Proxy Lambdas Setup")

      // Governance Proxy Node One Setup Lambdas - Contract Lambdas
      await setGovernanceProxyNodeContractLambdas(tezos, governanceProxyNodeOne.contract, "one", 8) // 8 is the last index + 1 (exclusive)
      console.log("Governance Proxy Node One Contract - Lambdas Setup")

      // Governance Proxy Node Two Setup Lambdas - Contract Lambdas
      await setGovernanceProxyNodeContractLambdas(tezos, governanceProxyNodeTwo.contract, "two", 8) // 8 is the last index + 1 (exclusive)
      console.log("Governance Proxy Node Two Contract - Lambdas Setup")

    } catch(e){
      console.dir(e, {depth: 5})
    }

  })

  it(`governance proxy and proxy node contracts deployed`, async () => {
    try {
      console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
    } catch (e) {
      console.log(e)
    }
  })
  
})