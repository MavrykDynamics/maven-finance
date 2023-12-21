import { Utils } from "../helpers/Utils"
const saveContractAddress = require("../helpers/saveContractAddress")
const saveMVNDecimals     = require('../../helpers/saveMVNDecimals')

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { GeneralContract }  from '../helpers/deploymentTestHelper'
import { bob } from '../../scripts/sandbox/accounts'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { mvnTokenStorage, mvnTokenDecimals } from '../../storage/mvnTokenStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('MVN Token', async () => {
  
    var utils: Utils
    var mvnToken

  before('setup', async () => {
        try{

            utils = new Utils()
            await utils.init(bob.sk)

            //----------------------------
            // Originate and deploy contracts
            //----------------------------
        
            mvnToken = await GeneralContract.originate(utils.tezos, "mvnToken", mvnTokenStorage);
            await saveContractAddress('mvnTokenAddress', mvnToken.contract.address)

            //----------------------------
            // Save MVN Decimals to JSON (for reuse in JS / PyTezos Tests)
            //----------------------------

            await saveMVNDecimals(mvnTokenDecimals)

        } catch(e){
            console.dir(e, {depth: 5})
        }

    })

    it(`mvn token contract deployment`, async () => {
        try {
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        } catch (e) {
            console.log(e)
        }
    })
    
})
