const { InMemorySigner } = require("@taquito/signer");
import { Utils } from "../helpers/Utils";
const saveContractAddress = require("../../helpers/saveContractAddress")
import { MichelsonMap } from '@taquito/michelson-encoder'

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
import doormanAddress from '../../deployments/doormanAddress.json';

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { Delegation, setDelegationLambdas } from '../contractHelpers/delegationTestHelper'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { delegationStorage } from '../../storage/delegationStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Delegation', async () => {
  
  var utils: Utils
  var delegation: Delegation
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
  
      delegationStorage.governanceAddress = governanceAddress.address
      delegationStorage.mvkTokenAddress   = mvkTokenAddress.address
      delegationStorage.whitelistContracts = MichelsonMap.fromLiteral({
        doorman: doormanAddress.address,
      })
      delegation = await Delegation.originate(utils.tezos, delegationStorage)
  
      await saveContractAddress('delegationAddress', delegation.contract.address)
      console.log('Delegation Contract deployed at:', delegation.contract.address)
  
      /* ---- ---- ---- ---- ---- */
  
      tezos = delegation.tezos
  
      // Set Lambdas
  
      await signerFactory(bob.sk);
  
      // Delegation Setup Lambdas
      await setDelegationLambdas(tezos, delegation.contract)
      console.log("Delegation Lambdas Setup")

    } catch(e){
      console.dir(e, {depth: 5})
    }

  })

  it(`delegation contract deployment`, async () => {
    try {
      console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
    } catch (e) {
      console.log(e)
    }
  })
  
})