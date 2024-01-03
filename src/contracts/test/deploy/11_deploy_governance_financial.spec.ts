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

import { governanceFinancialStorage } from '../../storage/governanceFinancialStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Governance Financial', async () => {
  
    var utils: Utils
    var governanceFinancial
    var tezos

    before('setup', async () => {
        try{

            utils = new Utils()
            await utils.init(bob.sk)
        
            //----------------------------
            // Originate and deploy contracts
            //----------------------------
        
            governanceFinancialStorage.mvnTokenAddress     = contractDeployments.mvnToken.address
            governanceFinancialStorage.governanceAddress   = contractDeployments.governance.address
            governanceFinancial = await GeneralContract.originate(utils.tezos, "governanceFinancial", governanceFinancialStorage);
            await saveContractAddress('governanceFinancialAddress', governanceFinancial.contract.address)
            
            /* ---- ---- ---- ---- ---- */
        
            tezos = governanceFinancial.tezos
            await helperFunctions.signerFactory(tezos, bob.sk);
        
            // Set Lambdas
            await setGeneralContractLambdas(tezos, "governanceFinancial", governanceFinancial.contract)

        } catch(e){
            console.dir(e, {depth: 5})
        }

    })

    it(`governance financial contract deployed`, async () => {
        try {
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        } catch (e) {
            console.log(e)
        }
    })
  
})