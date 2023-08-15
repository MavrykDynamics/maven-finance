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

import { GeneralContract, setGeneralContractLambdas } from '../helpers/deploymentTestHelper'
import { bob } from '../../scripts/sandbox/accounts'
import * as helperFunctions from '../helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { doormanStorage } from '../../storage/doormanStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Doorman', async () => {
  
    var utils: Utils
    var doorman
    var tezos

    before('setup', async () => {
        try{

            utils = new Utils()
            await utils.init(bob.sk)
        
            //----------------------------
            // Originate and deploy contracts
            //----------------------------
        
            doormanStorage.governanceAddress  = contractDeployments.governance.address
            doormanStorage.mvkTokenAddress    = contractDeployments.mvkToken.address
            doorman = await GeneralContract.originate(utils.tezos, "doorman", doormanStorage);
            await saveContractAddress('doormanAddress', doorman.contract.address)
        
            /* ---- ---- ---- ---- ---- */
        
            tezos = doorman.tezos
            await helperFunctions.signerFactory(tezos, bob.sk);

            // Set Lambdas
            await setGeneralContractLambdas(tezos, "doorman", doorman.contract)

        } catch(e){
            console.dir(e, {depth: 5})
        }

    })

    it(`doorman contract deployment`, async () => {
        try {
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        } catch (e) {
            console.log(e)
        }
    })
  
})