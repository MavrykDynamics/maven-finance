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

import { aggregatorFactoryStorage } from '../../storage/aggregatorFactoryStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Aggregator Factory', async () => {
  
    var utils: Utils
    var aggregatorFactory
    var tezos

    before('setup', async () => {
        try{
            
            utils = new Utils()
            await utils.init(bob.sk)
        
            //----------------------------
            // Originate and deploy contracts
            //----------------------------
        
            aggregatorFactoryStorage.mvkTokenAddress   = contractDeployments.mvkToken.address;
            aggregatorFactoryStorage.governanceAddress = contractDeployments.governance.address;
            aggregatorFactory = await GeneralContract.originate(utils.tezos, "aggregatorFactory", aggregatorFactoryStorage);
            await saveContractAddress('aggregatorFactoryAddress', aggregatorFactory.contract.address)
        
            /* ---- ---- ---- ---- ---- */
        
            tezos = aggregatorFactory.tezos
            await helperFunctions.signerFactory(tezos, bob.sk);
        
            // Set Lambdas
            await setGeneralContractLambdas(tezos, "aggregatorFactory", aggregatorFactory.contract);
            await setGeneralContractProductLambdas(tezos, "aggregatorFactory", aggregatorFactory.contract);

        } catch(e){
            console.dir(e, {depth: 5})
        }

    })

    it(`aggregator factory contract deployed`, async () => {
        try {
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        } catch (e) {
            console.log(e)
        }
    })
  
})
