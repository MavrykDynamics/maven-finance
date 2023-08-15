import { Utils } from "../helpers/Utils"
const saveContractAddress = require("../helpers/saveContractAddress")

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

import { GeneralContract }  from '../helpers/deploymentTestHelper'
import { bob } from '../../scripts/sandbox/accounts'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { mavrykFa12TokenStorage } from '../../storage/mavrykFa12TokenStorage'
import { mavrykFa2TokenStorage } from '../../storage/mavrykFa2TokenStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Mavryk Token', async () => {
    
    var utils: Utils
    var mavrykFa12Token 
    var mavrykFa2Token 

    before('setup', async () => {
        try{

            utils = new Utils()
            await utils.init(bob.sk)
        
            //----------------------------
            // Originate and deploy contracts
            //----------------------------
        
            mavrykFa12TokenStorage.governanceAddress  = contractDeployments.governance.address;
            mavrykFa12Token = await GeneralContract.originate(utils.tezos, "mavrykFa12Token", mavrykFa12TokenStorage);
            await saveContractAddress('mavrykFa12TokenAddress', mavrykFa12Token.contract.address)
        
            mavrykFa2TokenStorage.governanceAddress  = contractDeployments.governance.address;
            mavrykFa2Token = await GeneralContract.originate(utils.tezos, "mavrykFa2Token", mavrykFa2TokenStorage);
            await saveContractAddress('mavrykFa2TokenAddress', mavrykFa2Token.contract.address)

        } catch(e){
            console.dir(e, {depth: 5})
        }

    })

    it(`mavryk token contracts deployed`, async () => {
        try {
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        } catch (e) {
            console.log(e)
        }
    })
  
})