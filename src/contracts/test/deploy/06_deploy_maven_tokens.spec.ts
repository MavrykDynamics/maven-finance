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

import { mavenFa12TokenStorage } from '../../storage/mavenFa12TokenStorage'
import { mavenFa2TokenStorage } from '../../storage/mavenFa2TokenStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Maven Token', async () => {
    
    var utils: Utils
    var mavenFa12Token 
    var mavenFa2Token 

    before('setup', async () => {
        try{

            utils = new Utils()
            await utils.init(bob.sk)
        
            //----------------------------
            // Originate and deploy contracts
            //----------------------------
        
            mavenFa12TokenStorage.governanceAddress  = contractDeployments.governance.address;
            mavenFa12Token = await GeneralContract.originate(utils.tezos, "mavenFa12Token", mavenFa12TokenStorage);
            await saveContractAddress('mavenFa12TokenAddress', mavenFa12Token.contract.address)
        
            mavenFa2TokenStorage.governanceAddress  = contractDeployments.governance.address;
            mavenFa2Token = await GeneralContract.originate(utils.tezos, "mavenFa2Token", mavenFa2TokenStorage);
            await saveContractAddress('mavenFa2TokenAddress', mavenFa2Token.contract.address)

        } catch(e){
            console.dir(e, {depth: 5})
        }

    })

    it(`maven token contracts deployed`, async () => {
        try {
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        } catch (e) {
            console.log(e)
        }
    })
  
})