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

import { lendingControllerStorage } from '../../storage/lendingControllerStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Lending Controller', async () => {
  
    var tezos
    var utils: Utils
    var lendingController

    before('setup', async () => {
        try{
            utils = new Utils()
            await utils.init(bob.sk)
        
            //----------------------------
            // Originate and deploy contracts
            //----------------------------

            lendingControllerStorage.governanceAddress = contractDeployments.governance.address
            lendingControllerStorage.mvnTokenAddress   = contractDeployments.mvnToken.address
            lendingController = await GeneralContract.originate(utils.tezos, "lendingController", lendingControllerStorage);
            await saveContractAddress('lendingControllerAddress', lendingController.contract.address)

            //----------------------------
            // Set Lambdas
            //----------------------------

            tezos = lendingController.tezos
            await helperFunctions.signerFactory(tezos, bob.sk);
        
            // Set Lambdas
            await setGeneralContractLambdas(tezos, "lendingController", lendingController.contract);

        } catch(e){
            
            console.dir(e, {depth: 5})
            
        }

    })

    it(`lending controller contract deployed`, async () => {
        try {
        
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        
        } catch (e) {
            
            console.log(e)

        }
    })
  
})