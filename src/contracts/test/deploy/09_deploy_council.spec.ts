const { InMemorySigner } = require("@taquito/signer");
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

import { GeneralContract, setGeneralContractLambdas }  from '../contractHelpers/deploymentTestHelper'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { councilStorage } from '../../storage/councilStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Council', async () => {
    
    var utils: Utils
    var council
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
        
            councilStorage.governanceAddress = governanceAddress.address
            councilStorage.mvkTokenAddress  = mvkTokenAddress.address
            councilStorage.councilMembers.set(bob.pkh, {
                name: "Bob",
                image: "Bob image",
                website: "Bob website"
            })
            councilStorage.councilMembers.set(alice.pkh, {
                name: "Alice",
                image: "Alice image",
                website: "Alice website"
            })
            councilStorage.councilMembers.set(eve.pkh, {
                name: "Eve",
                image: "Eve image",
                website: "Eve website"
            })
            
            council = await GeneralContract.originate(utils.tezos, "council", councilStorage);
            await saveContractAddress('councilAddress', council.contract.address)
        
            /* ---- ---- ---- ---- ---- */
        
            tezos = council.tezos
            await signerFactory(bob.sk);
        
            // Set Lambdas
            await setGeneralContractLambdas(tezos, "council", council.contract);

        } catch(e){
            console.dir(e, {depth: 5})
        }

    })

    it(`council contract deployed`, async () => {
        try {
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        } catch (e) {
            console.log(e)
        }
    })
  
})