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

import { aggregatorStorage } from '../../storage/aggregatorStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Aggregator', async () => {
  
    var utils: Utils
    var aggregator
    var tezos

    before('setup', async () => {
        try{
            
            utils = new Utils()
            await utils.init(bob.sk)
        
            //----------------------------
            // Originate and deploy contracts
            //----------------------------
        
            aggregatorStorage.mvkTokenAddress   = contractDeployments.mvkToken.address
            aggregatorStorage.governanceAddress = contractDeployments.governance.address
            aggregator = await GeneralContract.originate(utils.tezos, "aggregator", aggregatorStorage);
            await saveContractAddress('aggregatorAddress', aggregator.contract.address)
        
            /* ---- ---- ---- ---- ---- */
        
            tezos = aggregator.tezos
            await helperFunctions.signerFactory(tezos, bob.sk);
        
            // Set Lambdas
            await setGeneralContractLambdas(tezos, "aggregator", aggregator.contract);

        } catch(e){
            console.dir(e, {depth: 5})
        }

    })

    it(`aggregator contract deployed`, async () => {
        try {
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        } catch (e) {
            console.log(e)
        }
    })
  
})