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

import { lendingControllerMockTimeStorage } from '../../storage/lendingControllerMockTimeStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Lending Controller Mock Time', async () => {
  
    var tezos
    var utils: Utils
    var lendingControllerMockTime

    before('setup', async () => {
        try{
            utils = new Utils()
            await utils.init(bob.sk)
        
            //----------------------------
            // Originate and deploy contracts
            //----------------------------

            lendingControllerMockTimeStorage.governanceAddress = contractDeployments.governance.address
            lendingControllerMockTimeStorage.mvkTokenAddress   = contractDeployments.mvkToken.address
            lendingControllerMockTime = await GeneralContract.originate(utils.tezos, "lendingControllerMockTime", lendingControllerMockTimeStorage);
            await saveContractAddress('lendingControllerMockTimeAddress', lendingControllerMockTime.contract.address)

            //----------------------------
            // Set Lambdas
            //----------------------------

            tezos = lendingControllerMockTime.tezos
            await helperFunctions.signerFactory(tezos, bob.sk);
        
            // Set Lambdas
            await setGeneralContractLambdas(tezos, "lendingControllerMockTime", lendingControllerMockTime.contract);

        } catch(e){
            
            console.dir(e, {depth: 5})
            
        }

    })

    it(`lending controller mock time contract deployed`, async () => {
        try {
        
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        
        } catch (e) {
            
            console.log(e)

        }
    })
  
})