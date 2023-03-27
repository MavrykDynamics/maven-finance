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

import { GeneralContract, setGeneralContractLambdas }  from '../helpers/deploymentTestHelper'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { breakGlassStorage } from '../../storage/breakGlassStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Break Glass', async () => {
  
    var utils: Utils
    var breakGlass
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
            
            breakGlass = await GeneralContract.originate(utils.tezos, "breakGlass", breakGlassStorage);
            await saveContractAddress('breakGlassAddress', breakGlass.contract.address)
        
            /* ---- ---- ---- ---- ---- */
        
            tezos = breakGlass.tezos
            await signerFactory(bob.sk);

            // Set Lambdas
            await setGeneralContractLambdas(tezos, "breakGlass", breakGlass.contract);
    
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