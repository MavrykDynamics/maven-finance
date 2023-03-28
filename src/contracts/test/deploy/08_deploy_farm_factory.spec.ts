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

import { GeneralContract, setGeneralContractLambdas, setGeneralContractProductLambdas }  from '../helpers/deploymentTestHelper'
import { bob } from '../../scripts/sandbox/accounts'
import * as helperFunctions from '../helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { farmFactoryStorage } from "../../storage/farmFactoryStorage";

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Farm Factory', async () => {
  
    var utils: Utils
    var farmFactory
    var tezos

    before('setup', async () => {
        try{

            utils = new Utils()
            await utils.init(bob.sk)
        
            //----------------------------
            // Originate and deploy contracts
            //----------------------------
        
            farmFactoryStorage.governanceAddress = contractDeployments.governance.address
            farmFactoryStorage.mvkTokenAddress   = contractDeployments.mvkToken.address
            farmFactory = await GeneralContract.originate(utils.tezos, "farmFactory", farmFactoryStorage);
            await saveContractAddress("farmFactoryAddress", farmFactory.contract.address)

            /* ---- ---- ---- ---- ---- */
        
            tezos = farmFactory.tezos
            await helperFunctions.signerFactory(tezos, bob.sk);

            // Set Lambdas
            await setGeneralContractLambdas(tezos, "farmFactory", farmFactory.contract)
            
            // Set Product Lambdas for Farm and Farm mToken
            await setGeneralContractProductLambdas(tezos, "farmFactory", farmFactory.contract)
            await setGeneralContractProductLambdas(tezos, "farmFactoryMToken", farmFactory.contract)

        } catch(e){
            console.dir(e, {depth: 5})
        }

    })

    it(`farm factory contract deployed`, async () => {
        try {
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        } catch (e) {
            console.log(e)
        }
    })
  
})