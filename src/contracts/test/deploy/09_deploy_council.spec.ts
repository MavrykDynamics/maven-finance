import { Utils } from "../helpers/Utils"
const saveContractAddress = require("../helpers/saveContractAddress")
import { BigNumber } from "bignumber.js"

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

// ------------------------------------------------------------------------------
// Contract Address
// ------------------------------------------------------------------------------

import contractDeployments from '../contractDeployments.json'

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { GeneralContract, setGeneralContractLambdas } from '../helpers/deploymentTestHelper'
import { bob, alice, eve, trudy, susie } from '../../scripts/sandbox/accounts'
import * as helperFunctions from '../helpers/helperFunctions'

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

    before('setup', async () => {
        try{
            
            utils = new Utils()
            await utils.init(bob.sk)
        
            //----------------------------
            // Originate and deploy contracts
            //----------------------------
        
            councilStorage.governanceAddress = contractDeployments.governance.address
            councilStorage.mvkTokenAddress   = contractDeployments.mvkToken.address

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
            councilStorage.councilMembers.set(susie.pkh, {
                name: "Susie",
                image: "Susie image",
                website: "Susie website"
            })
            councilStorage.councilMembers.set(trudy.pkh, {
                name: "Trudy",
                image: "Trudy image",
                website: "Trudy website"
            })
            councilStorage.councilSize      = new BigNumber(4);
            
            council = await GeneralContract.originate(utils.tezos, "council", councilStorage);
            await saveContractAddress('councilAddress', council.contract.address)
        
            /* ---- ---- ---- ---- ---- */
        
            tezos = council.tezos
            await helperFunctions.signerFactory(tezos, bob.sk);
        
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