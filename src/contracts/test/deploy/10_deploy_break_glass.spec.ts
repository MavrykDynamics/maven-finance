const { InMemorySigner, importKey } = require("@taquito/signer");
import { Utils } from "../helpers/Utils";
const saveContractAddress = require("../../helpers/saveContractAddress")

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

import { bob, alice, eve } from '../../scripts/sandbox/accounts'

// ------------------------------------------------------------------------------
// Contract Address
// ------------------------------------------------------------------------------

import mvkTokenAddress from '../../deployments/mvkTokenAddress.json';
import governanceAddress from '../../deployments/governanceAddress.json';

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { BreakGlass, setBreakGlassLambdas } from '../helpers/breakGlassHelper'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { breakGlassStorage } from '../../storage/breakGlassStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Break Glass', async () => {
  
  var utils: Utils
  var breakGlass: BreakGlass
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
  
      breakGlassStorage.governanceAddress = governanceAddress.address
      breakGlassStorage.mvkTokenAddress  = mvkTokenAddress.address
  
      breakGlassStorage.councilMembers.set(bob.pkh, {
        name: "Bob",
        image: "Bob image",
        website: "Bob website"
      })
      breakGlassStorage.councilMembers.set(alice.pkh, {
        name: "Alice",
        image: "Alice image",
        website: "Alice website"
      })
      breakGlassStorage.councilMembers.set(eve.pkh, {
        name: "Eve",
        image: "Eve image",
        website: "Eve website"
      })
      breakGlass = await BreakGlass.originate(utils.tezos, breakGlassStorage)
  
      await saveContractAddress('breakGlassAddress', breakGlass.contract.address)
      console.log('BreakGlass Contract deployed at:', breakGlass.contract.address)
  
      /* ---- ---- ---- ---- ---- */
  
      tezos = breakGlass.tezos
  
      // Set Lambdas
  
      await signerFactory(bob.sk);

      // Council Setup Lambdas
      await setBreakGlassLambdas(tezos, breakGlass.contract);
      console.log("Break Glass Lambdas Setup")
  
    } catch(e){
      console.dir(e, {depth: 5})
    }

  })

  it(`break glass contract deployed`, async () => {
    try {
      console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
    } catch (e) {
      console.log(e)
    }
  })
  
})