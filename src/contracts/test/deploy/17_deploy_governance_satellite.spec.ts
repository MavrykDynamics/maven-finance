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

import { governanceSatelliteStorage } from '../../storage/governanceSatelliteStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Governance Satellite', async () => {
  
    var utils: Utils
    var governanceSatellite
    var tezos

    before('setup', async () => {
        try{
            
            utils = new Utils()
            await utils.init(bob.sk)
        
            //----------------------------
            // Originate and deploy contracts
            //----------------------------
            
            governanceSatelliteStorage.mvkTokenAddress     = contractDeployments.mvkToken.address
            governanceSatelliteStorage.governanceAddress   = contractDeployments.governance.address
            governanceSatellite = await GeneralContract.originate(utils.tezos, "governanceSatellite", governanceSatelliteStorage);
            await saveContractAddress('governanceSatelliteAddress', governanceSatellite.contract.address)

            /* ---- ---- ---- ---- ---- */
        
            tezos = governanceSatellite.tezos
            await helperFunctions.signerFactory(tezos, bob.sk);
        
            // Set Lambdas
            await setGeneralContractLambdas(tezos, "governanceSatellite", governanceSatellite.contract)

        } catch(e){
            console.dir(e, {depth: 5})
        }

    })

    it(`governance satellite contract deployed`, async () => {
        try {
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        } catch (e) {
            console.log(e)
        }
    })
  
})