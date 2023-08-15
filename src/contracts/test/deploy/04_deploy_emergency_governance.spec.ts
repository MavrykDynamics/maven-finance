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

import { emergencyGovernanceStorage } from '../../storage/emergencyGovernanceStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Emergency Governance', async () => {
  
    var utils: Utils
    var emergencyGovernance
    var tezos    

    before('setup', async () => {
        try{

            utils = new Utils()
            await utils.init(bob.sk)
        
            //----------------------------
            // Originate and deploy contracts
            //----------------------------
        
            emergencyGovernanceStorage.governanceAddress = contractDeployments.governance.address
            emergencyGovernanceStorage.mvkTokenAddress   = contractDeployments.mvkToken.address
            emergencyGovernance = await GeneralContract.originate(utils.tezos, "emergencyGovernance", emergencyGovernanceStorage);
            await saveContractAddress('emergencyGovernanceAddress', emergencyGovernance.contract.address)
        
            /* ---- ---- ---- ---- ---- */
        
            tezos = emergencyGovernance.tezos
            await helperFunctions.signerFactory(tezos, bob.sk);
        
            // Set Lambdas
            await setGeneralContractLambdas(tezos, "emergencyGovernance", emergencyGovernance.contract)

        } catch(e){
            console.dir(e, {depth: 5})
        }

    })

    it(`emergency governance contract deployed`, async () => {
        try {
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        } catch (e) {
            console.log(e)
        }
    })
    
})