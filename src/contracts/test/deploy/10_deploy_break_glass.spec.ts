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
import { bob, alice, eve, susie, trudy } from '../../scripts/sandbox/accounts'
import * as helperFunctions from '../helpers/helperFunctions'

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

    before('setup', async () => {
        try{
            
            utils = new Utils()
            await utils.init(bob.sk)
        
            //----------------------------
            // Originate and deploy contracts
            //----------------------------
        
            breakGlassStorage.governanceAddress = contractDeployments.governance.address
            breakGlassStorage.mvkTokenAddress   = contractDeployments.mvkToken.address
        
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
            breakGlassStorage.councilMembers.set(susie.pkh, {
                name: "Susie",
                image: "Susie image",
                website: "Susie website"
            })
            breakGlassStorage.councilMembers.set(trudy.pkh, {
                name: "Trudy",
                image: "Trudy image",
                website: "Trudy website"
            })
            breakGlassStorage.councilSize = new BigNumber(4)
            
            breakGlass = await GeneralContract.originate(utils.tezos, "breakGlass", breakGlassStorage);
            await saveContractAddress('breakGlassAddress', breakGlass.contract.address)
        
            /* ---- ---- ---- ---- ---- */
        
            tezos = breakGlass.tezos
            await helperFunctions.signerFactory(tezos, bob.sk);

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