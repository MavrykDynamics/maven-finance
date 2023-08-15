import { Utils } from "../helpers/Utils"
const saveContractAddress = require("../helpers/saveContractAddress")
const saveMVKDecimals     = require('../../helpers/saveMVKDecimals')

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

import { mvkTokenStorage, mvkTokenDecimals } from '../../storage/mvkTokenStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('MVK Token', async () => {
  
    var utils: Utils
    var mvkToken

  before('setup', async () => {
        try{

            utils = new Utils()
            await utils.init(bob.sk)

            //----------------------------
            // Originate and deploy contracts
            //----------------------------
        
            mvkToken = await GeneralContract.originate(utils.tezos, "mvkToken", mvkTokenStorage);
            await saveContractAddress('mvkTokenAddress', mvkToken.contract.address)

            //----------------------------
            // Save MVK Decimals to JSON (for reuse in JS / PyTezos Tests)
            //----------------------------

            await saveMVKDecimals(mvkTokenDecimals)

        } catch(e){
            console.dir(e, {depth: 5})
        }

    })

    it(`mvk token contract deployment`, async () => {
        try {
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        } catch (e) {
            console.log(e)
        }
    })
    
})
