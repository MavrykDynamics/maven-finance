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

import { treasuryFactoryStorage } from '../../storage/treasuryFactoryStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Treasury Factory', async () => {
  
    var utils: Utils
    var treasuryFactory
    var tezos

    before('setup', async () => {
        try{
            utils = new Utils()
            await utils.init(bob.sk)
        
            //----------------------------
            // Originate and deploy contracts
            //----------------------------
        
            treasuryFactoryStorage.governanceAddress = contractDeployments.governance.address
            treasuryFactoryStorage.mvkTokenAddress   = contractDeployments.mvkToken.address
            treasuryFactory = await GeneralContract.originate(utils.tezos, "treasuryFactory", treasuryFactoryStorage);
            await saveContractAddress('treasuryFactoryAddress', treasuryFactory.contract.address)
        
            /* ---- ---- ---- ---- ---- */
        
            tezos = treasuryFactory.tezos
            await helperFunctions.signerFactory(tezos, bob.sk);

            // Set Lambdas
            await setGeneralContractLambdas(tezos, "treasuryFactory", treasuryFactory.contract);
            await setGeneralContractProductLambdas(tezos, "treasuryFactory", treasuryFactory.contract);

        } catch(e){
            console.dir(e, {depth: 5})
        }

    })

    it(`treasury factory contract deployed`, async () => {
        try {
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        } catch (e) {
            console.log(e)
        }
    })
    
})