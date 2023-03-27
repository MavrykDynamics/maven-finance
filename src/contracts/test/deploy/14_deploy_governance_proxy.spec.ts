const { InMemorySigner } = require("@taquito/signer");
import { Utils } from "../helpers/Utils";
const saveContractAddress = require("../helpers/saveContractAddress")

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

import { bob } from '../../scripts/sandbox/accounts'

// ------------------------------------------------------------------------------
// Contract Address
// ------------------------------------------------------------------------------

import contractDeployments from '../contractDeployments.json'

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { GeneralContract, setGeneralContractLambdas }  from '../helpers/deploymentTestHelper'

// ------------------------------------------------------------------------------
// Contract Storage
// ------------------------------------------------------------------------------

import { governanceProxyStorage } from '../../storage/governanceProxyStorage'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Governance Proxy', async () => {
  
    var utils: Utils
    var governanceProxy
    var tezos
    
    const signerFactory = async (pk) => {
        await tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) })
        return tezos
    }

    before('setup', async () => {
        try{
            
            utils = new Utils()
            await utils.init(bob.sk)
        
            //----------------------------
            // Originate and deploy contracts
            //----------------------------
        
            governanceProxyStorage.governanceAddress  = contractDeployments.governance.address;
            governanceProxyStorage.mvkTokenAddress    = contractDeployments.mvkToken.address;
            governanceProxy = await GeneralContract.originate(utils.tezos, "governanceProxy", governanceProxyStorage);
            await saveContractAddress('governanceProxyAddress', governanceProxy.contract.address)
        
            /* ---- ---- ---- ---- ---- */
        
            tezos = governanceProxy.tezos
            await signerFactory(bob.sk);
        
            // Set Lambdas
            await setGeneralContractLambdas(tezos, "governanceProxy", governanceProxy.contract)

        } catch(e){
            console.dir(e, {depth: 5})
        }

    })

    it(`governance proxy contract deployed`, async () => {
        try {
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        } catch (e) {
            console.log(e)
        }
    })
  
})