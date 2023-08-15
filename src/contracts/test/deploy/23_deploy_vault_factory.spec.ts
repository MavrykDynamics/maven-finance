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

import { vaultFactoryStorage } from '../../storage/vaultFactoryStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Vault Factory', async () => {
  
    var tezos
    var utils: Utils
    var vaultFactory

    before('setup', async () => {
        try{
            
            utils = new Utils()
            await utils.init(bob.sk)
        
            //----------------------------
            // Originate and deploy contracts
            //----------------------------

            vaultFactoryStorage.governanceAddress = contractDeployments.governance.address
            vaultFactoryStorage.mvkTokenAddress   = contractDeployments.mvkToken.address
            vaultFactory = await GeneralContract.originate(utils.tezos, "vaultFactory", vaultFactoryStorage);
            await saveContractAddress('vaultFactoryAddress', vaultFactory.contract.address)

            //----------------------------
            // Set Lambdas
            //----------------------------

            tezos = vaultFactory.tezos
            await helperFunctions.signerFactory(tezos, bob.sk);
        
            // Set Lambdas
            await setGeneralContractLambdas(tezos, "vaultFactory", vaultFactory.contract);
            await setGeneralContractProductLambdas(tezos, "vaultFactory", vaultFactory.contract)

        } catch(e){
            
            console.dir(e, {depth: 5})
            
        }

    })

    it(`vault factory contract deployed`, async () => {
        try {
        
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        
        } catch (e) {
            
            console.log(e)

        }
    })
  
})